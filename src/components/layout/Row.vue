<template>
  <div
    :class="[
      'vbwd-row',
      `vbwd-row-align-${align}`,
      `vbwd-row-justify-${justify}`,
      { 'vbwd-row-nowrap': noWrap }
    ]"
    :style="gapStyle"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type AlignItems = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type JustifyContent = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

const props = withDefaults(defineProps<{
  gap?: string | number;
  align?: AlignItems;
  justify?: JustifyContent;
  noWrap?: boolean;
}>(), {
  gap: '1rem',
  align: 'stretch',
  justify: 'start',
  noWrap: false,
});

const gapStyle = computed(() => {
  const gap = typeof props.gap === 'number' ? `${props.gap}px` : props.gap;
  return { gap };
});
</script>

<style scoped>
.vbwd-row {
  display: flex;
  flex-wrap: wrap;
}

.vbwd-row-nowrap {
  flex-wrap: nowrap;
}

.vbwd-row-align-start {
  align-items: flex-start;
}

.vbwd-row-align-center {
  align-items: center;
}

.vbwd-row-align-end {
  align-items: flex-end;
}

.vbwd-row-align-stretch {
  align-items: stretch;
}

.vbwd-row-align-baseline {
  align-items: baseline;
}

.vbwd-row-justify-start {
  justify-content: flex-start;
}

.vbwd-row-justify-center {
  justify-content: center;
}

.vbwd-row-justify-end {
  justify-content: flex-end;
}

.vbwd-row-justify-between {
  justify-content: space-between;
}

.vbwd-row-justify-around {
  justify-content: space-around;
}

.vbwd-row-justify-evenly {
  justify-content: space-evenly;
}
</style>
