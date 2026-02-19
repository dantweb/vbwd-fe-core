<template>
  <div v-if="errors.length" class="vbwd-form-error">
    <div class="vbwd-form-error-icon">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
      </svg>
    </div>
    <div class="vbwd-form-error-content">
      <h4 v-if="title" class="vbwd-form-error-title">{{ title }}</h4>
      <ul class="vbwd-form-error-list">
        <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  errors: string[];
  title?: string;
}>(), {
  errors: () => [],
  title: 'Please fix the following errors:',
});
</script>

<style scoped>
.vbwd-form-error {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--vbwd-color-danger-light, #fef2f2);
  border: 1px solid var(--vbwd-color-danger, #ef4444);
  border-radius: var(--vbwd-form-error-radius, 0.5rem);
  color: var(--vbwd-color-danger-dark, #991b1b);
}

.vbwd-form-error-icon {
  flex-shrink: 0;
}

.vbwd-form-error-content {
  flex: 1;
}

.vbwd-form-error-title {
  margin: 0 0 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.vbwd-form-error-list {
  margin: 0;
  padding-left: 1.25rem;
  font-size: 0.875rem;
}

.vbwd-form-error-list li {
  margin-bottom: 0.25rem;
}

.vbwd-form-error-list li:last-child {
  margin-bottom: 0;
}
</style>
