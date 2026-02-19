<template>
  <svg
    :class="['vbwd-spinner', `vbwd-spinner-${size}`]"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      class="vbwd-spinner-track"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      stroke-width="4"
    />
    <path
      class="vbwd-spinner-head"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
</template>

<script setup lang="ts">
type SpinnerSize = 'sm' | 'md' | 'lg';

withDefaults(defineProps<{
  size?: SpinnerSize;
}>(), {
  size: 'md',
});
</script>

<style scoped>
.vbwd-spinner {
  animation: vbwd-spin 1s linear infinite;
}

.vbwd-spinner-sm {
  width: 1rem;
  height: 1rem;
}

.vbwd-spinner-md {
  width: 1.5rem;
  height: 1.5rem;
}

.vbwd-spinner-lg {
  width: 2rem;
  height: 2rem;
}

.vbwd-spinner-track {
  opacity: 0.25;
}

.vbwd-spinner-head {
  opacity: 0.75;
}

@keyframes vbwd-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
