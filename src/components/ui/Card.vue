<template>
  <div :class="['vbwd-card', { 'vbwd-card-hoverable': hoverable }]">
    <header v-if="title || $slots.header" class="vbwd-card-header">
      <slot name="header">
        <h3 class="vbwd-card-title">{{ title }}</h3>
        <p v-if="subtitle" class="vbwd-card-subtitle">{{ subtitle }}</p>
      </slot>
      <div v-if="$slots.actions" class="vbwd-card-actions">
        <slot name="actions" />
      </div>
    </header>
    <div class="vbwd-card-body">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="vbwd-card-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title?: string;
  subtitle?: string;
  hoverable?: boolean;
}>(), {
  hoverable: false,
});
</script>

<style scoped>
.vbwd-card {
  background: white;
  border: 1px solid var(--vbwd-color-border, #e5e7eb);
  border-radius: var(--vbwd-card-radius, 0.5rem);
  box-shadow: var(--vbwd-shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
  overflow: hidden;
}

.vbwd-card-hoverable {
  transition: box-shadow 0.15s ease, transform 0.15s ease;
}

.vbwd-card-hoverable:hover {
  box-shadow: var(--vbwd-shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
  transform: translateY(-2px);
}

.vbwd-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--vbwd-color-border, #e5e7eb);
}

.vbwd-card-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--vbwd-color-text, #374151);
}

.vbwd-card-subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: var(--vbwd-color-text-muted, #9ca3af);
}

.vbwd-card-actions {
  display: flex;
  gap: 0.5rem;
}

.vbwd-card-body {
  padding: 1.5rem;
}

.vbwd-card-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--vbwd-color-border, #e5e7eb);
  background: var(--vbwd-color-surface, #f9fafb);
}
</style>
