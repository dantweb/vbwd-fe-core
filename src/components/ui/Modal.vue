<template>
  <Teleport to="body">
    <Transition name="vbwd-modal">
      <div
        v-if="modelValue"
        class="vbwd-modal-overlay"
        @click.self="closeOnOverlay && close()"
      >
        <div
          :class="['vbwd-modal', `vbwd-modal-${size}`]"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? modalTitleId : undefined"
        >
          <header v-if="title || $slots.header" class="vbwd-modal-header">
            <slot name="header">
              <h3 :id="modalTitleId" class="vbwd-modal-title">{{ title }}</h3>
            </slot>
            <button
              v-if="closable"
              class="vbwd-modal-close"
              @click="close"
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </header>

          <div class="vbwd-modal-body">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="vbwd-modal-footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

let idCounter = 0;

const props = withDefaults(defineProps<{
  modelValue: boolean;
  title?: string;
  size?: ModalSize;
  closable?: boolean;
  closeOnOverlay?: boolean;
  closeOnEsc?: boolean;
}>(), {
  size: 'md',
  closable: true,
  closeOnOverlay: true,
  closeOnEsc: true,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  close: [];
}>();

const modalTitleId = `vbwd-modal-title-${++idCounter}`;

const close = () => {
  emit('update:modelValue', false);
  emit('close');
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.closeOnEsc && props.modelValue) {
    close();
  }
};

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});
</script>

<style scoped>
.vbwd-modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.vbwd-modal {
  background: white;
  border-radius: var(--vbwd-modal-radius, 0.5rem);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-height: calc(100vh - 2rem);
  display: flex;
  flex-direction: column;
  width: 100%;
}

.vbwd-modal-sm { max-width: 300px; }
.vbwd-modal-md { max-width: 500px; }
.vbwd-modal-lg { max-width: 800px; }
.vbwd-modal-xl { max-width: 1140px; }
.vbwd-modal-full { max-width: calc(100vw - 2rem); max-height: calc(100vh - 2rem); }

.vbwd-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--vbwd-color-border, #e5e7eb);
}

.vbwd-modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--vbwd-color-text, #374151);
}

.vbwd-modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: var(--vbwd-color-text-muted, #9ca3af);
  border-radius: 0.25rem;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.vbwd-modal-close:hover {
  color: var(--vbwd-color-text, #374151);
  background-color: var(--vbwd-color-surface, #f9fafb);
}

.vbwd-modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.vbwd-modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--vbwd-color-border, #e5e7eb);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* Transitions */
.vbwd-modal-enter-active,
.vbwd-modal-leave-active {
  transition: opacity 0.2s ease;
}

.vbwd-modal-enter-from,
.vbwd-modal-leave-to {
  opacity: 0;
}

.vbwd-modal-enter-active .vbwd-modal,
.vbwd-modal-leave-active .vbwd-modal {
  transition: transform 0.2s ease;
}

.vbwd-modal-enter-from .vbwd-modal,
.vbwd-modal-leave-to .vbwd-modal {
  transform: scale(0.95) translateY(-10px);
}
</style>
