<template>
  <fieldset :class="['vbwd-form-group', { 'vbwd-form-group-bordered': bordered }]">
    <legend v-if="title" class="vbwd-form-group-title">{{ title }}</legend>
    <p v-if="description" class="vbwd-form-group-description">{{ description }}</p>
    <div :class="['vbwd-form-group-fields', `vbwd-form-group-${layout}`]">
      <slot />
    </div>
  </fieldset>
</template>

<script setup lang="ts">
type FormGroupLayout = 'vertical' | 'horizontal' | 'inline';

withDefaults(defineProps<{
  title?: string;
  description?: string;
  layout?: FormGroupLayout;
  bordered?: boolean;
}>(), {
  layout: 'vertical',
  bordered: false,
});
</script>

<style scoped>
.vbwd-form-group {
  margin: 0;
  padding: 0;
  border: none;
}

.vbwd-form-group-bordered {
  padding: 1.5rem;
  border: 1px solid var(--vbwd-color-border, #e5e7eb);
  border-radius: var(--vbwd-form-group-radius, 0.5rem);
}

.vbwd-form-group-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--vbwd-color-text, #374151);
  margin-bottom: 0.25rem;
  padding: 0;
}

.vbwd-form-group-description {
  margin: 0 0 1rem;
  font-size: 0.875rem;
  color: var(--vbwd-color-text-muted, #9ca3af);
}

.vbwd-form-group-fields {
  display: flex;
  gap: 1rem;
}

.vbwd-form-group-vertical {
  flex-direction: column;
}

.vbwd-form-group-horizontal {
  flex-direction: row;
  flex-wrap: wrap;
}

.vbwd-form-group-horizontal > :deep(*) {
  flex: 1;
  min-width: 200px;
}

.vbwd-form-group-inline {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-end;
}

.vbwd-form-group-inline > :deep(*) {
  flex: 0 0 auto;
}
</style>
