<template>
  <div class="vbwd-detail-field">
    <span class="vbwd-detail-field-label">{{ label }}</span>
    <Badge
      v-if="badge"
      :variant="badgeVariant"
      class="vbwd-detail-field-badge"
    >
      {{ displayValue }}
    </Badge>
    <span
      v-else
      class="vbwd-detail-field-value"
    >
      {{ displayValue }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Badge from './Badge.vue';

const props = withDefaults(defineProps<{
  label: string;
  value?: string | number | null;
  badge?: boolean;
  badgeVariant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
}>(), {
  value: null,
  badge: false,
  badgeVariant: 'info',
});

const displayValue = computed(() => {
  if (props.value === null || props.value === undefined || props.value === '') {
    return '-';
  }
  return String(props.value);
});
</script>

<style scoped>
.vbwd-detail-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.vbwd-detail-field-label {
  font-size: 0.85rem;
  color: var(--vbwd-color-text-secondary, #666);
}

.vbwd-detail-field-value {
  font-weight: 500;
  color: var(--vbwd-color-text-primary, #2c3e50);
}
</style>
