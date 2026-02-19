<template>
  <slot v-if="hasAccess" />
  <slot v-else name="fallback">
    <div class="vbwd-feature-locked">
      <div class="vbwd-feature-locked-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <p class="vbwd-feature-locked-text">
        This feature requires {{ requiredPlan || 'an upgraded' }} plan
      </p>
      <button
        v-if="showUpgradeButton"
        class="vbwd-btn vbwd-btn-primary"
        @click="$emit('upgrade')"
      >
        Upgrade Now
      </button>
    </div>
  </slot>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useFeatureAccess } from '../../composables/useFeatureAccess';

const props = withDefaults(defineProps<{
  feature: string;
  requiredPlan?: string;
  showUpgradeButton?: boolean;
}>(), {
  showUpgradeButton: true,
});

defineEmits<{
  upgrade: [];
}>();

const { canAccess } = useFeatureAccess();
const hasAccess = computed(() => canAccess(props.feature));
</script>

<style scoped>
.vbwd-feature-locked {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  text-align: center;
  background: var(--vbwd-color-surface, #f9fafb);
  border: 1px dashed var(--vbwd-color-border, #e5e7eb);
  border-radius: var(--vbwd-radius-lg, 0.5rem);
}

.vbwd-feature-locked-icon {
  color: var(--vbwd-color-text-muted, #9ca3af);
  margin-bottom: 1rem;
}

.vbwd-feature-locked-text {
  margin: 0 0 1rem;
  color: var(--vbwd-color-text-muted, #6b7280);
  font-size: 0.875rem;
}
</style>
