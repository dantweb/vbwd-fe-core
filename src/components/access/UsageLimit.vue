<template>
  <div :class="['vbwd-usage-limit', { 'vbwd-usage-warning': isNearLimit, 'vbwd-usage-exceeded': isExceeded }]">
    <div class="vbwd-usage-header">
      <span class="vbwd-usage-label">{{ label || feature }}</span>
      <span class="vbwd-usage-count">
        {{ used }} / {{ limit === 0 ? '∞' : limit }}
      </span>
    </div>
    <div v-if="limit > 0" class="vbwd-usage-bar">
      <div
        class="vbwd-usage-progress"
        :style="{ width: percentage + '%' }"
      />
    </div>
    <p v-if="isExceeded" class="vbwd-usage-exceeded-text">
      {{ exceededMessage || 'Limit exceeded' }}
    </p>
    <p v-else-if="isNearLimit" class="vbwd-usage-warning-text">
      {{ warningMessage || 'Approaching limit' }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useFeatureAccess } from '../../composables/useFeatureAccess';

const props = withDefaults(defineProps<{
  feature: string;
  label?: string;
  warningThreshold?: number;
  warningMessage?: string;
  exceededMessage?: string;
}>(), {
  warningThreshold: 0.8,
});

const { getUsage } = useFeatureAccess();

const usage = computed(() => getUsage(props.feature));
const used = computed(() => usage.value.used);
const limit = computed(() => usage.value.limit);
const remaining = computed(() => usage.value.remaining);

const percentage = computed(() => {
  if (limit.value === 0) return 0;
  return Math.min(100, (used.value / limit.value) * 100);
});

const isNearLimit = computed(() => {
  if (limit.value === 0) return false;
  return percentage.value >= props.warningThreshold * 100 && percentage.value < 100;
});

const isExceeded = computed(() => {
  if (limit.value === 0) return false;
  return percentage.value >= 100;
});
</script>

<style scoped>
.vbwd-usage-limit {
  padding: 0.75rem;
  background: var(--vbwd-color-surface, #f9fafb);
  border-radius: var(--vbwd-radius-md, 0.375rem);
}

.vbwd-usage-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.vbwd-usage-label {
  font-weight: 500;
  color: var(--vbwd-color-text, #374151);
}

.vbwd-usage-count {
  color: var(--vbwd-color-text-muted, #6b7280);
}

.vbwd-usage-bar {
  height: 0.5rem;
  background: var(--vbwd-color-border, #e5e7eb);
  border-radius: 9999px;
  overflow: hidden;
}

.vbwd-usage-progress {
  height: 100%;
  background: var(--vbwd-color-primary, #3b82f6);
  transition: width 0.3s ease;
  border-radius: 9999px;
}

.vbwd-usage-warning .vbwd-usage-progress {
  background: var(--vbwd-color-warning, #f59e0b);
}

.vbwd-usage-exceeded .vbwd-usage-progress {
  background: var(--vbwd-color-danger, #ef4444);
}

.vbwd-usage-warning-text {
  margin: 0.5rem 0 0;
  font-size: 0.75rem;
  color: var(--vbwd-color-warning, #f59e0b);
}

.vbwd-usage-exceeded-text {
  margin: 0.5rem 0 0;
  font-size: 0.75rem;
  color: var(--vbwd-color-danger, #ef4444);
}
</style>
