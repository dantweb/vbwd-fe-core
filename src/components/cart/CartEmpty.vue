<template>
  <div class="vbwd-cart-empty" data-testid="cart-empty">
    <slot name="icon">
      <svg class="vbwd-cart-empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    </slot>
    <p class="vbwd-cart-empty-text" data-testid="cart-empty-message">
      <slot>{{ message }}</slot>
    </p>
    <slot name="action"></slot>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  message?: string;
}>(), {
  message: 'Your cart is empty',
});
</script>

<style scoped>
.vbwd-cart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  text-align: center;
}

.vbwd-cart-empty-icon {
  color: var(--vbwd-color-text-muted, #9ca3af);
  margin-bottom: 0.75rem;
}

.vbwd-cart-empty-text {
  font-size: 0.875rem;
  color: var(--vbwd-color-text-muted, #6b7280);
  margin: 0;
}
</style>
