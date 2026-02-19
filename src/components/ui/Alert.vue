<template>
  <div
    v-if="visible"
    :class="['vbwd-alert', `vbwd-alert-${variant}`]"
    role="alert"
  >
    <div class="vbwd-alert-icon">
      <slot name="icon">
        <component :is="iconComponent" />
      </slot>
    </div>
    <div class="vbwd-alert-content">
      <h4 v-if="title" class="vbwd-alert-title">{{ title }}</h4>
      <p class="vbwd-alert-message">
        <slot>{{ message }}</slot>
      </p>
    </div>
    <button
      v-if="dismissible"
      class="vbwd-alert-close"
      @click="dismiss"
      aria-label="Dismiss"
    >
      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue';

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

const props = withDefaults(defineProps<{
  variant?: AlertVariant;
  title?: string;
  message?: string;
  dismissible?: boolean;
}>(), {
  variant: 'info',
  dismissible: false,
});

const emit = defineEmits<{
  dismiss: [];
}>();

const visible = ref(true);

const dismiss = () => {
  visible.value = false;
  emit('dismiss');
};

// Simple SVG icons as render functions
const icons = {
  success: () => h('svg', { width: 20, height: 20, viewBox: '0 0 20 20', fill: 'currentColor' }, [
    h('path', { 'fill-rule': 'evenodd', d: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z', 'clip-rule': 'evenodd' })
  ]),
  error: () => h('svg', { width: 20, height: 20, viewBox: '0 0 20 20', fill: 'currentColor' }, [
    h('path', { 'fill-rule': 'evenodd', d: 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z', 'clip-rule': 'evenodd' })
  ]),
  warning: () => h('svg', { width: 20, height: 20, viewBox: '0 0 20 20', fill: 'currentColor' }, [
    h('path', { 'fill-rule': 'evenodd', d: 'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z', 'clip-rule': 'evenodd' })
  ]),
  info: () => h('svg', { width: 20, height: 20, viewBox: '0 0 20 20', fill: 'currentColor' }, [
    h('path', { 'fill-rule': 'evenodd', d: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z', 'clip-rule': 'evenodd' })
  ]),
};

const iconComponent = computed(() => icons[props.variant]);
</script>

<style scoped>
.vbwd-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: var(--vbwd-alert-radius, 0.5rem);
  border: 1px solid;
}

.vbwd-alert-success {
  background-color: var(--vbwd-color-success-light, #ecfdf5);
  border-color: var(--vbwd-color-success, #10b981);
  color: var(--vbwd-color-success-dark, #065f46);
}

.vbwd-alert-error {
  background-color: var(--vbwd-color-danger-light, #fef2f2);
  border-color: var(--vbwd-color-danger, #ef4444);
  color: var(--vbwd-color-danger-dark, #991b1b);
}

.vbwd-alert-warning {
  background-color: var(--vbwd-color-warning-light, #fffbeb);
  border-color: var(--vbwd-color-warning, #f59e0b);
  color: var(--vbwd-color-warning-dark, #92400e);
}

.vbwd-alert-info {
  background-color: var(--vbwd-color-info-light, #eff6ff);
  border-color: var(--vbwd-color-info, #3b82f6);
  color: var(--vbwd-color-info-dark, #1e40af);
}

.vbwd-alert-icon {
  flex-shrink: 0;
}

.vbwd-alert-content {
  flex: 1;
  min-width: 0;
}

.vbwd-alert-title {
  margin: 0 0 0.25rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.vbwd-alert-message {
  margin: 0;
  font-size: 0.875rem;
}

.vbwd-alert-close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  opacity: 0.7;
  border-radius: 0.25rem;
  transition: opacity 0.15s ease;
}

.vbwd-alert-close:hover {
  opacity: 1;
}
</style>
