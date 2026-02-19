<template>
  <div :class="['vbwd-input-wrapper', { 'vbwd-input-has-error': error }]">
    <label v-if="label" :for="inputId" class="vbwd-input-label">
      {{ label }}
      <span v-if="required" class="vbwd-input-required">*</span>
    </label>
    <div class="vbwd-input-container">
      <span v-if="$slots.prefix" class="vbwd-input-prefix">
        <slot name="prefix" />
      </span>
      <input
        :id="inputId"
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :class="inputClasses"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />
      <span v-if="$slots.suffix" class="vbwd-input-suffix">
        <slot name="suffix" />
      </span>
    </div>
    <p v-if="error" class="vbwd-input-error-text">{{ error }}</p>
    <p v-else-if="hint" class="vbwd-input-hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type InputSize = 'sm' | 'md' | 'lg';

let idCounter = 0;

const props = withDefaults(defineProps<{
  modelValue?: string;
  type?: string;
  label?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  size?: InputSize;
}>(), {
  modelValue: '',
  type: 'text',
  size: 'md',
  disabled: false,
  readonly: false,
  required: false,
});

defineEmits<{
  'update:modelValue': [value: string];
  blur: [event: FocusEvent];
  focus: [event: FocusEvent];
}>();

const inputId = `vbwd-input-${++idCounter}`;

const inputClasses = computed(() => [
  'vbwd-input',
  `vbwd-input-${props.size}`,
  {
    'vbwd-input-invalid': props.error,
    'vbwd-input-disabled': props.disabled,
  }
]);
</script>

<style scoped>
.vbwd-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.vbwd-input-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vbwd-color-text, #374151);
}

.vbwd-input-required {
  color: var(--vbwd-color-danger, #ef4444);
}

.vbwd-input-container {
  display: flex;
  align-items: center;
  border: 1px solid var(--vbwd-color-border, #e5e7eb);
  border-radius: var(--vbwd-input-radius, 0.375rem);
  overflow: hidden;
  background: white;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.vbwd-input-container:focus-within {
  border-color: var(--vbwd-color-primary, #3b82f6);
  box-shadow: 0 0 0 3px var(--vbwd-color-primary-light, rgba(59, 130, 246, 0.2));
}

.vbwd-input {
  flex: 1;
  padding: var(--vbwd-input-padding-y, 0.5rem) var(--vbwd-input-padding-x, 0.75rem);
  border: none;
  outline: none;
  font-size: 1rem;
  font-family: inherit;
  background: transparent;
  color: var(--vbwd-color-text, #374151);
}

.vbwd-input::placeholder {
  color: var(--vbwd-color-text-muted, #9ca3af);
}

.vbwd-input-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.vbwd-input-lg {
  padding: 0.75rem 1rem;
  font-size: 1.125rem;
}

.vbwd-input-prefix,
.vbwd-input-suffix {
  display: flex;
  align-items: center;
  padding: 0 0.75rem;
  color: var(--vbwd-color-text-muted, #9ca3af);
  background: var(--vbwd-color-surface, #f9fafb);
}

.vbwd-input-has-error .vbwd-input-container {
  border-color: var(--vbwd-color-danger, #ef4444);
}

.vbwd-input-has-error .vbwd-input-container:focus-within {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

.vbwd-input-error-text {
  color: var(--vbwd-color-danger, #ef4444);
  font-size: 0.75rem;
  margin: 0;
}

.vbwd-input-hint {
  color: var(--vbwd-color-text-muted, #9ca3af);
  font-size: 0.75rem;
  margin: 0;
}

.vbwd-input:disabled {
  background: var(--vbwd-color-surface, #f9fafb);
  cursor: not-allowed;
}
</style>
