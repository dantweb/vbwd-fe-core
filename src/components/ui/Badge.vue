<template>
  <span :class="['vbwd-badge', `vbwd-badge-${variant}`, `vbwd-badge-${size}`]">
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup lang="ts">
type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

withDefaults(defineProps<{
  label?: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
}>(), {
  variant: 'primary',
  size: 'md',
});
</script>

<style scoped>
.vbwd-badge {
  display: inline-flex;
  align-items: center;
  font-weight: 500;
  border-radius: 9999px;
}

.vbwd-badge-sm {
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
}

.vbwd-badge-md {
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
}

.vbwd-badge-lg {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.vbwd-badge-primary {
  background-color: var(--vbwd-color-primary-light, #dbeafe);
  color: var(--vbwd-color-primary-dark, #1e40af);
}

.vbwd-badge-secondary {
  background-color: var(--vbwd-color-secondary-light, #f3f4f6);
  color: var(--vbwd-color-secondary-dark, #374151);
}

.vbwd-badge-success {
  background-color: var(--vbwd-color-success-light, #d1fae5);
  color: var(--vbwd-color-success-dark, #065f46);
}

.vbwd-badge-danger {
  background-color: var(--vbwd-color-danger-light, #fee2e2);
  color: var(--vbwd-color-danger-dark, #991b1b);
}

.vbwd-badge-warning {
  background-color: var(--vbwd-color-warning-light, #fef3c7);
  color: var(--vbwd-color-warning-dark, #92400e);
}

.vbwd-badge-info {
  background-color: var(--vbwd-color-info-light, #dbeafe);
  color: var(--vbwd-color-info-dark, #1e40af);
}
</style>
