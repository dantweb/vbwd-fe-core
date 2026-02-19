<template>
  <div class="vbwd-cart-item" data-testid="cart-item">
    <div class="vbwd-cart-item-info">
      <span class="vbwd-cart-item-name" data-testid="cart-item-name">{{ item.name }}</span>
      <span class="vbwd-cart-item-type" data-testid="cart-item-type">{{ formatType(item.type) }}</span>
    </div>
    <div class="vbwd-cart-item-details">
      <div class="vbwd-cart-item-quantity">
        <button
          type="button"
          class="vbwd-cart-item-qty-btn"
          data-testid="cart-item-decrease"
          :disabled="item.quantity <= 1"
          @click="emit('decrease')"
        >
          -
        </button>
        <span class="vbwd-cart-item-qty-value" data-testid="cart-item-quantity">{{ item.quantity }}</span>
        <button
          type="button"
          class="vbwd-cart-item-qty-btn"
          data-testid="cart-item-increase"
          @click="emit('increase')"
        >
          +
        </button>
      </div>
      <span class="vbwd-cart-item-price" data-testid="cart-item-price">
        {{ formatPrice(item.price * item.quantity) }}
      </span>
      <button
        type="button"
        class="vbwd-cart-item-remove"
        data-testid="cart-item-remove"
        @click="emit('remove')"
        aria-label="Remove item"
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ICartItem } from '../../stores/cart';

defineProps<{
  item: ICartItem;
}>();

const emit = defineEmits<{
  increase: [];
  decrease: [];
  remove: [];
}>();

function formatType(type: string): string {
  const labels: Record<string, string> = {
    plan: 'Plan',
    token_bundle: 'Tokens',
    addon: 'Add-on',
  };
  return labels[type] || type;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}
</script>

<style scoped>
.vbwd-cart-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--vbwd-color-border, #e5e7eb);
}

.vbwd-cart-item:last-child {
  border-bottom: none;
}

.vbwd-cart-item-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  flex: 1;
  min-width: 0;
}

.vbwd-cart-item-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vbwd-color-text, #374151);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vbwd-cart-item-type {
  font-size: 0.75rem;
  color: var(--vbwd-color-text-muted, #6b7280);
}

.vbwd-cart-item-details {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.vbwd-cart-item-quantity {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.vbwd-cart-item-qty-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border: 1px solid var(--vbwd-color-border, #e5e7eb);
  border-radius: 0.25rem;
  background: white;
  color: var(--vbwd-color-text, #374151);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.vbwd-cart-item-qty-btn:hover:not(:disabled) {
  border-color: var(--vbwd-color-primary, #3b82f6);
  color: var(--vbwd-color-primary, #3b82f6);
}

.vbwd-cart-item-qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.vbwd-cart-item-qty-value {
  min-width: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--vbwd-color-text, #374151);
}

.vbwd-cart-item-price {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--vbwd-color-text, #374151);
  min-width: 4rem;
  text-align: right;
}

.vbwd-cart-item-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border: none;
  background: transparent;
  color: var(--vbwd-color-text-muted, #6b7280);
  cursor: pointer;
  border-radius: 0.25rem;
  transition: all 0.15s ease;
}

.vbwd-cart-item-remove:hover {
  color: var(--vbwd-color-danger, #ef4444);
  background: var(--vbwd-color-danger-light, #fee2e2);
}
</style>
