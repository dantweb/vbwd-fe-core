import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock api client
const mockApi = {
  post: vi.fn(),
  get: vi.fn(),
};

import { usePaymentRedirect } from '@/composables/usePaymentRedirect';

describe('usePaymentRedirect', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location.search
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, search: '', href: '' },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  it('should read invoice ID from query', () => {
    window.location.search = '?invoice=inv_123';
    const { readInvoiceFromQuery, invoiceId } = usePaymentRedirect('/api/v1/plugins/stripe', mockApi);

    readInvoiceFromQuery();

    expect(invoiceId.value).toBe('inv_123');
  });

  it('should set error when no invoice in query', async () => {
    window.location.search = '';
    const { createAndRedirect, error } = usePaymentRedirect('/api/v1/plugins/stripe', mockApi);

    await createAndRedirect();

    expect(error.value).toBe('No invoice specified');
  });

  it('should call API POST to create-session', async () => {
    window.location.search = '?invoice=inv_456';
    mockApi.post.mockResolvedValue({ session_url: 'https://stripe.com/checkout' });

    const { readInvoiceFromQuery, createAndRedirect } = usePaymentRedirect('/api/v1/plugins/stripe', mockApi);
    readInvoiceFromQuery();
    await createAndRedirect();

    expect(mockApi.post).toHaveBeenCalledWith(
      '/api/v1/plugins/stripe/create-session',
      { invoice_id: 'inv_456' }
    );
  });

  it('should set loading to true during request', async () => {
    window.location.search = '?invoice=inv_789';
    let resolvePromise: (value: unknown) => void;
    const promise = new Promise((resolve) => { resolvePromise = resolve; });
    mockApi.post.mockReturnValue(promise);

    const { readInvoiceFromQuery, createAndRedirect, loading } = usePaymentRedirect('/api/v1/plugins/stripe', mockApi);
    readInvoiceFromQuery();
    const redirectPromise = createAndRedirect();

    expect(loading.value).toBe(true);

    resolvePromise!({ session_url: 'https://stripe.com' });
    await redirectPromise;
  });
});
