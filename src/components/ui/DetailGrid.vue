<template>
  <div
    class="vbwd-detail-grid"
    :style="gridStyle"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  columns?: number;
}>(), {
  columns: 2,
});

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
}));
</script>

<style scoped>
.vbwd-detail-grid {
  display: grid;
  gap: 15px;
  margin-bottom: 20px;
}

@media (max-width: 480px) {
  .vbwd-detail-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
