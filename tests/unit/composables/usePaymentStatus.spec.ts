import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock vue's onUnmounted
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue');
  return {
    ...(actual as object),
    onUnmounted: vi.fn(),
  };
});

// Mock api client
const mockApi = {
  post: vi.fn(),
  get: vi.fn(),
};

import { usePaymentStatus } from '@/composables/usePaymentStatus';

describe('usePaymentStatus', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, search: '' },
      writable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  it('should read session ID from query', () => {
    window.location.search = '?session_id=cs_test_abc';
    const { readSessionFromQuery, sessionId } = usePaymentStatus('/api/v1/plugins/stripe', mockApi);

    readSessionFromQuery();

    expect(sessionId.value).toBe('cs_test_abc');
  });

  it('should poll status endpoint', async () => {
    window.location.search = '?session_id=cs_poll';
    mockApi.get.mockResolvedValue({ status: 'open' });

    const { readSessionFromQuery, startPolling } = usePaymentStatus('/api/v1/plugins/stripe', mockApi);
    readSessionFromQuery();
    await startPolling();

    expect(mockApi.get).toHaveBeenCalledWith(
      '/api/v1/plugins/stripe/session-status/cs_poll'
    );
  });

  it('should set confirmed when status is complete', async () => {
    window.location.search = '?session_id=cs_done';
    mockApi.get.mockResolvedValue({ status: 'complete' });

    const { readSessionFromQuery, startPolling, confirmed } = usePaymentStatus('/api/v1/plugins/stripe', mockApi);
    readSessionFromQuery();
    await startPolling();

    expect(confirmed.value).toBe(true);
  });

  it('should timeout after max attempts', async () => {
    window.location.search = '?session_id=cs_slow';
    mockApi.get.mockResolvedValue({ status: 'open' });

    const { readSessionFromQuery, startPolling, timedOut } = usePaymentStatus(
      '/api/v1/plugins/stripe',
      mockApi,
      { intervalMs: 100, maxAttempts: 2 }
    );
    readSessionFromQuery();
    await startPolling();

    // Advance through 2 intervals
    for (let i = 0; i < 2; i++) {
      await vi.advanceTimersByTimeAsync(100);
    }

    expect(timedOut.value).toBe(true);
  });
});
