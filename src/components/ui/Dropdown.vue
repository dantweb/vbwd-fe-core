<template>
  <div class="vbwd-dropdown" ref="dropdownRef">
    <div class="vbwd-dropdown-trigger" @click="toggle">
      <slot name="trigger">
        <button type="button" class="vbwd-dropdown-btn">
          {{ label }}
          <svg class="vbwd-dropdown-arrow" :class="{ 'vbwd-dropdown-arrow-open': isOpen }" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </slot>
    </div>

    <Transition name="vbwd-dropdown">
      <div
        v-if="isOpen"
        :class="['vbwd-dropdown-menu', `vbwd-dropdown-${placement}`]"
      >
        <slot>
          <div
            v-for="(item, index) in items"
            :key="index"
            :class="[
              'vbwd-dropdown-item',
              { 'vbwd-dropdown-item-disabled': item.disabled }
            ]"
            @click="!item.disabled && selectItem(item)"
          >
            {{ item.label }}
          </div>
        </slot>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { DropdownItem } from './types';

type DropdownPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

const props = withDefaults(defineProps<{
  label?: string;
  items?: DropdownItem[];
  placement?: DropdownPlacement;
}>(), {
  label: 'Select',
  items: () => [],
  placement: 'bottom-start',
});

const emit = defineEmits<{
  select: [item: DropdownItem];
}>();

const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const toggle = () => {
  isOpen.value = !isOpen.value;
};

const close = () => {
  isOpen.value = false;
};

const selectItem = (item: DropdownItem) => {
  emit('select', item);
  close();
};

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    close();
  }
};

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    close();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleEscape);
});
</script>

<style scoped>
.vbwd-dropdown {
  position: relative;
  display: inline-block;
}

.vbwd-dropdown-trigger {
  cursor: pointer;
}

.vbwd-dropdown-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--vbwd-color-border, #e5e7eb);
  border-radius: var(--vbwd-dropdown-radius, 0.375rem);
  background: white;
  color: var(--vbwd-color-text, #374151);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.vbwd-dropdown-btn:hover {
  border-color: var(--vbwd-color-primary, #3b82f6);
}

.vbwd-dropdown-arrow {
  transition: transform 0.15s ease;
}

.vbwd-dropdown-arrow-open {
  transform: rotate(180deg);
}

.vbwd-dropdown-menu {
  position: absolute;
  z-index: 50;
  min-width: 10rem;
  padding: 0.25rem 0;
  background: white;
  border: 1px solid var(--vbwd-color-border, #e5e7eb);
  border-radius: var(--vbwd-dropdown-radius, 0.375rem);
  box-shadow: var(--vbwd-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
}

.vbwd-dropdown-bottom-start {
  top: 100%;
  left: 0;
  margin-top: 0.25rem;
}

.vbwd-dropdown-bottom-end {
  top: 100%;
  right: 0;
  margin-top: 0.25rem;
}

.vbwd-dropdown-top-start {
  bottom: 100%;
  left: 0;
  margin-bottom: 0.25rem;
}

.vbwd-dropdown-top-end {
  bottom: 100%;
  right: 0;
  margin-bottom: 0.25rem;
}

.vbwd-dropdown-item {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: var(--vbwd-color-text, #374151);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.vbwd-dropdown-item:hover {
  background: var(--vbwd-color-surface, #f9fafb);
}

.vbwd-dropdown-item-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.vbwd-dropdown-item-disabled:hover {
  background: transparent;
}

/* Transitions */
.vbwd-dropdown-enter-active,
.vbwd-dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.vbwd-dropdown-enter-from,
.vbwd-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-0.25rem);
}
</style>
