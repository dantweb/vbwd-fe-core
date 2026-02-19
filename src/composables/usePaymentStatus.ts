import { ref, onUnmounted } from 'vue';

interface ApiLike {
  get(url: string): Promise<Record<string, unknown>>;
}

/**
 * Composable for polling payment status.
 *
 * Handles: read session_id from query -> poll status endpoint -> determine completion.
 * Reused by Stripe, PayPal, Amazon Pay, AliPay, etc.
 *
 * @param apiPrefix - Provider's API prefix (e.g. '/api/v1/plugins/stripe')
 * @param api - HTTP client instance with get() method
 * @param options - Polling options
 */
export function usePaymentStatus(
  apiPrefix: string,
  api: ApiLike,
  options: { intervalMs?: number; maxAttempts?: number } = {}
) {
  const { intervalMs = 2000, maxAttempts = 15 } = options;

  const polling = ref(false);
  const confirmed = ref(false);
  const timedOut = ref(false);
  const error = ref<string | null>(null);
  const statusData = ref<Record<string, unknown> | null>(null);
  const sessionId = ref<string | null>(null);

  let timer: ReturnType<typeof setInterval> | null = null;
  let attempts = 0;

  function readSessionFromQuery(): string | null {
    const id = new URLSearchParams(window.location.search).get('session_id') || null;
    sessionId.value = id;
    return sessionId.value;
  }

  function stopPolling() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    polling.value = false;
  }

  async function pollOnce(): Promise<boolean> {
    const id = sessionId.value;
    if (!id) return false;

    try {
      const data = await api.get(`${apiPrefix}/session-status/${id}`) as Record<string, unknown>;
      statusData.value = data;
      const status = data?.status;
      if (status === 'complete' || status === 'PAID') {
        confirmed.value = true;
        stopPolling();
        return true;
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } }; message?: string };
      error.value = err?.response?.data?.error || err?.message || 'Status check failed';
      stopPolling();
      return true;
    }
    return false;
  }

  async function startPolling(): Promise<void> {
    const id = sessionId.value || readSessionFromQuery();
    if (!id) {
      error.value = 'No session ID';
      return;
    }

    polling.value = true;
    attempts = 0;

    if (await pollOnce()) return;

    timer = setInterval(async () => {
      attempts++;
      if (attempts >= maxAttempts) {
        timedOut.value = true;
        stopPolling();
        return;
      }
      await pollOnce();
    }, intervalMs);
  }

  onUnmounted(stopPolling);

  return {
    polling,
    confirmed,
    timedOut,
    error,
    statusData,
    sessionId,
    readSessionFromQuery,
    startPolling,
    stopPolling,
  };
}
