import { ref } from 'vue';

interface ApiLike {
  post(url: string, data?: unknown): Promise<Record<string, unknown>>;
}

/**
 * Composable for payment redirect flow.
 *
 * Handles: read invoice from query -> POST create-session -> redirect to provider.
 * Reused by Stripe, PayPal, Amazon Pay, AliPay, etc.
 *
 * @param apiPrefix - Provider's API prefix (e.g. '/api/v1/plugins/stripe')
 * @param api - HTTP client instance with post() method
 */
export function usePaymentRedirect(apiPrefix: string, api: ApiLike) {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const invoiceId = ref<string | null>(null);

  function readInvoiceFromQuery(): string | null {
    const id = new URLSearchParams(window.location.search).get('invoice') || null;
    invoiceId.value = id;
    return invoiceId.value;
  }

  async function createAndRedirect(): Promise<void> {
    const id = invoiceId.value || readInvoiceFromQuery();
    if (!id) {
      error.value = 'No invoice specified';
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const data = await api.post(`${apiPrefix}/create-session`, {
        invoice_id: id
      });
      const session_url = (data as Record<string, unknown>).session_url as string | undefined;
      if (session_url) {
        window.location.href = session_url;
      } else {
        error.value = 'No redirect URL received';
        loading.value = false;
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } }; message?: string };
      error.value = err?.response?.data?.error || err?.message || 'Payment session failed';
      loading.value = false;
    }
  }

  return {
    loading,
    error,
    invoiceId,
    readInvoiceFromQuery,
    createAndRedirect,
  };
}
