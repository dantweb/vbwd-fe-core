<template>
  <div :class="['vbwd-container', { 'vbwd-container-fluid': fluid }]">
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  fluid?: boolean;
}>(), {
  fluid: false,
});
</script>

<style scoped>
.vbwd-container {
  width: 100%;
  max-width: var(--vbwd-container-max-width, 1280px);
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--vbwd-container-padding, 1rem);
  padding-right: var(--vbwd-container-padding, 1rem);
}

.vbwd-container-fluid {
  max-width: none;
}

@media (min-width: 640px) {
  .vbwd-container {
    padding-left: var(--vbwd-container-padding-sm, 1.5rem);
    padding-right: var(--vbwd-container-padding-sm, 1.5rem);
  }
}

@media (min-width: 1024px) {
  .vbwd-container {
    padding-left: var(--vbwd-container-padding-lg, 2rem);
    padding-right: var(--vbwd-container-padding-lg, 2rem);
  }
}
</style>
