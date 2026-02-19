<template>
  <div :class="['vbwd-form-field', { 'vbwd-form-field-error': error, 'vbwd-form-field-required': required }]">
    <label v-if="label" :for="fieldId" class="vbwd-form-field-label">
      {{ label }}
      <span v-if="required" class="vbwd-form-field-asterisk">*</span>
    </label>
    <div class="vbwd-form-field-control">
      <slot :id="fieldId" :error="error" />
    </div>
    <p v-if="error" class="vbwd-form-field-error-text">{{ error }}</p>
    <p v-else-if="hint" class="vbwd-form-field-hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
let idCounter = 0;

withDefaults(defineProps<{
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
}>(), {
  required: false,
});

const fieldId = `vbwd-field-${++idCounter}`;
</script>

<style scoped>
.vbwd-form-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.vbwd-form-field-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vbwd-color-text, #374151);
}

.vbwd-form-field-asterisk {
  color: var(--vbwd-color-danger, #ef4444);
  margin-left: 0.125rem;
}

.vbwd-form-field-control {
  width: 100%;
}

.vbwd-form-field-error-text {
  margin: 0;
  font-size: 0.75rem;
  color: var(--vbwd-color-danger, #ef4444);
}

.vbwd-form-field-hint {
  margin: 0;
  font-size: 0.75rem;
  color: var(--vbwd-color-text-muted, #9ca3af);
}
</style>
