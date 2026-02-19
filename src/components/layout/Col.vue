<template>
  <div :class="colClasses" :style="colStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type ColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'auto';

const props = withDefaults(defineProps<{
  span?: ColSpan;
  sm?: ColSpan;
  md?: ColSpan;
  lg?: ColSpan;
  xl?: ColSpan;
  offset?: number;
  order?: number;
}>(), {
  span: 'auto',
});

const colClasses = computed(() => {
  const classes = ['vbwd-col'];

  if (props.span !== 'auto') {
    classes.push(`vbwd-col-${props.span}`);
  } else {
    classes.push('vbwd-col-auto');
  }

  if (props.sm) classes.push(`vbwd-col-sm-${props.sm}`);
  if (props.md) classes.push(`vbwd-col-md-${props.md}`);
  if (props.lg) classes.push(`vbwd-col-lg-${props.lg}`);
  if (props.xl) classes.push(`vbwd-col-xl-${props.xl}`);

  return classes;
});

const colStyle = computed(() => {
  const style: Record<string, string> = {};

  if (props.offset) {
    style.marginLeft = `${(props.offset / 12) * 100}%`;
  }

  if (props.order !== undefined) {
    style.order = String(props.order);
  }

  return style;
});
</script>

<style scoped>
.vbwd-col {
  box-sizing: border-box;
}

.vbwd-col-auto {
  flex: 1 1 0%;
  min-width: 0;
}

.vbwd-col-1 { flex: 0 0 8.333333%; max-width: 8.333333%; }
.vbwd-col-2 { flex: 0 0 16.666667%; max-width: 16.666667%; }
.vbwd-col-3 { flex: 0 0 25%; max-width: 25%; }
.vbwd-col-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }
.vbwd-col-5 { flex: 0 0 41.666667%; max-width: 41.666667%; }
.vbwd-col-6 { flex: 0 0 50%; max-width: 50%; }
.vbwd-col-7 { flex: 0 0 58.333333%; max-width: 58.333333%; }
.vbwd-col-8 { flex: 0 0 66.666667%; max-width: 66.666667%; }
.vbwd-col-9 { flex: 0 0 75%; max-width: 75%; }
.vbwd-col-10 { flex: 0 0 83.333333%; max-width: 83.333333%; }
.vbwd-col-11 { flex: 0 0 91.666667%; max-width: 91.666667%; }
.vbwd-col-12 { flex: 0 0 100%; max-width: 100%; }

@media (min-width: 640px) {
  .vbwd-col-sm-1 { flex: 0 0 8.333333%; max-width: 8.333333%; }
  .vbwd-col-sm-2 { flex: 0 0 16.666667%; max-width: 16.666667%; }
  .vbwd-col-sm-3 { flex: 0 0 25%; max-width: 25%; }
  .vbwd-col-sm-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }
  .vbwd-col-sm-5 { flex: 0 0 41.666667%; max-width: 41.666667%; }
  .vbwd-col-sm-6 { flex: 0 0 50%; max-width: 50%; }
  .vbwd-col-sm-7 { flex: 0 0 58.333333%; max-width: 58.333333%; }
  .vbwd-col-sm-8 { flex: 0 0 66.666667%; max-width: 66.666667%; }
  .vbwd-col-sm-9 { flex: 0 0 75%; max-width: 75%; }
  .vbwd-col-sm-10 { flex: 0 0 83.333333%; max-width: 83.333333%; }
  .vbwd-col-sm-11 { flex: 0 0 91.666667%; max-width: 91.666667%; }
  .vbwd-col-sm-12 { flex: 0 0 100%; max-width: 100%; }
  .vbwd-col-sm-auto { flex: 1 1 0%; max-width: 100%; }
}

@media (min-width: 768px) {
  .vbwd-col-md-1 { flex: 0 0 8.333333%; max-width: 8.333333%; }
  .vbwd-col-md-2 { flex: 0 0 16.666667%; max-width: 16.666667%; }
  .vbwd-col-md-3 { flex: 0 0 25%; max-width: 25%; }
  .vbwd-col-md-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }
  .vbwd-col-md-5 { flex: 0 0 41.666667%; max-width: 41.666667%; }
  .vbwd-col-md-6 { flex: 0 0 50%; max-width: 50%; }
  .vbwd-col-md-7 { flex: 0 0 58.333333%; max-width: 58.333333%; }
  .vbwd-col-md-8 { flex: 0 0 66.666667%; max-width: 66.666667%; }
  .vbwd-col-md-9 { flex: 0 0 75%; max-width: 75%; }
  .vbwd-col-md-10 { flex: 0 0 83.333333%; max-width: 83.333333%; }
  .vbwd-col-md-11 { flex: 0 0 91.666667%; max-width: 91.666667%; }
  .vbwd-col-md-12 { flex: 0 0 100%; max-width: 100%; }
  .vbwd-col-md-auto { flex: 1 1 0%; max-width: 100%; }
}

@media (min-width: 1024px) {
  .vbwd-col-lg-1 { flex: 0 0 8.333333%; max-width: 8.333333%; }
  .vbwd-col-lg-2 { flex: 0 0 16.666667%; max-width: 16.666667%; }
  .vbwd-col-lg-3 { flex: 0 0 25%; max-width: 25%; }
  .vbwd-col-lg-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }
  .vbwd-col-lg-5 { flex: 0 0 41.666667%; max-width: 41.666667%; }
  .vbwd-col-lg-6 { flex: 0 0 50%; max-width: 50%; }
  .vbwd-col-lg-7 { flex: 0 0 58.333333%; max-width: 58.333333%; }
  .vbwd-col-lg-8 { flex: 0 0 66.666667%; max-width: 66.666667%; }
  .vbwd-col-lg-9 { flex: 0 0 75%; max-width: 75%; }
  .vbwd-col-lg-10 { flex: 0 0 83.333333%; max-width: 83.333333%; }
  .vbwd-col-lg-11 { flex: 0 0 91.666667%; max-width: 91.666667%; }
  .vbwd-col-lg-12 { flex: 0 0 100%; max-width: 100%; }
  .vbwd-col-lg-auto { flex: 1 1 0%; max-width: 100%; }
}

@media (min-width: 1280px) {
  .vbwd-col-xl-1 { flex: 0 0 8.333333%; max-width: 8.333333%; }
  .vbwd-col-xl-2 { flex: 0 0 16.666667%; max-width: 16.666667%; }
  .vbwd-col-xl-3 { flex: 0 0 25%; max-width: 25%; }
  .vbwd-col-xl-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }
  .vbwd-col-xl-5 { flex: 0 0 41.666667%; max-width: 41.666667%; }
  .vbwd-col-xl-6 { flex: 0 0 50%; max-width: 50%; }
  .vbwd-col-xl-7 { flex: 0 0 58.333333%; max-width: 58.333333%; }
  .vbwd-col-xl-8 { flex: 0 0 66.666667%; max-width: 66.666667%; }
  .vbwd-col-xl-9 { flex: 0 0 75%; max-width: 75%; }
  .vbwd-col-xl-10 { flex: 0 0 83.333333%; max-width: 83.333333%; }
  .vbwd-col-xl-11 { flex: 0 0 91.666667%; max-width: 91.666667%; }
  .vbwd-col-xl-12 { flex: 0 0 100%; max-width: 100%; }
  .vbwd-col-xl-auto { flex: 1 1 0%; max-width: 100%; }
}
</style>
