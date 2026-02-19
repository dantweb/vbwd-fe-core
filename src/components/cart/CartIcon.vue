<template>
  <button
    type="button"
    class="vbwd-cart-icon"
    data-testid="cart-icon"
    @click="emit('click')"
    :aria-label="`Shopping cart with ${count} items`"
  >
    <slot name="icon">
      <svg class="vbwd-cart-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    </slot>
    <span
      v-if="count > 0"
      class="vbwd-cart-icon-badge"
      data-testid="cart-icon-badge"
    >
      {{ count > 99 ? '99+' : count }}
    </span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  count: number;
}>();

const emit = defineEmits<{
  click: [];
}>();
</script>

<style scoped>
.vbwd-cart-icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border: none;
  background: transparent;
  color: var(--vbwd-color-text, #374151);
  cursor: pointer;
  border-radius: 0.375rem;
  transition: all 0.15s ease;
}

.vbwd-cart-icon:hover {
  background: var(--vbwd-color-surface, #f3f4f6);
  color: var(--vbwd-color-primary, #3b82f6);
}

.vbwd-cart-icon-svg {
  width: 1.5rem;
  height: 1.5rem;
}

.vbwd-cart-icon-badge {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.25rem;
  font-size: 0.625rem;
  font-weight: 600;
  color: white;
  background: var(--vbwd-color-primary, #3b82f6);
  border-radius: 9999px;
  transform: translate(25%, -25%);
}
</style>
