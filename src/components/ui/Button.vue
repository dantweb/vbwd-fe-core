<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <Spinner v-if="loading" size="sm" class="vbwd-btn-spinner" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Spinner from './Spinner.vue';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg';

const props = withDefaults(defineProps<{
  type?: 'button' | 'submit' | 'reset';
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  block?: boolean;
}>(), {
  type: 'button',
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  block: false,
});

defineEmits<{
  click: [event: MouseEvent];
}>();

const buttonClasses = computed(() => [
  'vbwd-btn',
  `vbwd-btn-${props.variant}`,
  `vbwd-btn-${props.size}`,
  {
    'vbwd-btn-block': props.block,
    'vbwd-btn-loading': props.loading,
  }
]);
</script>

<style scoped>
.vbwd-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: var(--vbwd-btn-padding-y, 0.5rem) var(--vbwd-btn-padding-x, 1rem);
  font-size: var(--vbwd-btn-font-size, 1rem);
  font-weight: 500;
  font-family: inherit;
  line-height: 1.5;
  border-radius: var(--vbwd-btn-radius, 0.375rem);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.vbwd-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px var(--vbwd-color-primary-light, rgba(59, 130, 246, 0.3));
}

.vbwd-btn-primary {
  background-color: var(--vbwd-color-primary, #3b82f6);
  color: white;
}

.vbwd-btn-primary:hover:not(:disabled) {
  background-color: var(--vbwd-color-primary-dark, #2563eb);
}

.vbwd-btn-secondary {
  background-color: var(--vbwd-color-secondary, #6b7280);
  color: white;
}

.vbwd-btn-secondary:hover:not(:disabled) {
  background-color: var(--vbwd-color-secondary-dark, #4b5563);
}

.vbwd-btn-danger {
  background-color: var(--vbwd-color-danger, #ef4444);
  color: white;
}

.vbwd-btn-danger:hover:not(:disabled) {
  background-color: var(--vbwd-color-danger-dark, #dc2626);
}

.vbwd-btn-ghost {
  background-color: transparent;
  border-color: var(--vbwd-color-border, #e5e7eb);
  color: var(--vbwd-color-text, #374151);
}

.vbwd-btn-ghost:hover:not(:disabled) {
  background-color: var(--vbwd-color-surface, #f9fafb);
}

.vbwd-btn-link {
  background-color: transparent;
  color: var(--vbwd-color-primary, #3b82f6);
  text-decoration: underline;
  padding: 0;
}

.vbwd-btn-link:hover:not(:disabled) {
  color: var(--vbwd-color-primary-dark, #2563eb);
}

.vbwd-btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.vbwd-btn-lg {
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
}

.vbwd-btn-block {
  width: 100%;
}

.vbwd-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.vbwd-btn-spinner {
  width: 1em;
  height: 1em;
}
</style>
