<template>
  <div class="vbwd-cart-dropdown" ref="dropdownRef" data-testid="cart-dropdown">
    <div class="vbwd-cart-dropdown-trigger" @click="toggle">
      <slot name="trigger">
        <CartIcon :count="itemCount" @click.stop="toggle" />
      </slot>
    </div>

    <Transition name="vbwd-cart-dropdown">
      <div
        v-if="isOpen"
        :class="['vbwd-cart-dropdown-menu', `vbwd-cart-dropdown-${placement}`]"
        data-testid="cart-dropdown-menu"
      >
        <div class="vbwd-cart-dropdown-header">
          <h3 class="vbwd-cart-dropdown-title">Shopping Cart</h3>
          <span class="vbwd-cart-dropdown-count" data-testid="cart-dropdown-count">
            {{ itemCount }} {{ itemCount === 1 ? 'item' : 'items' }}
          </span>
        </div>

        <div class="vbwd-cart-dropdown-content">
          <CartEmpty v-if="isEmpty">
            <template #action>
              <slot name="empty-action"></slot>
            </template>
          </CartEmpty>

          <div v-else class="vbwd-cart-dropdown-items" data-testid="cart-dropdown-items">
            <CartItem
              v-for="item in items"
              :key="`${item.type}-${item.id}`"
              :item="item"
              @increase="updateQuantity(item.id, item.quantity + 1)"
              @decrease="updateQuantity(item.id, item.quantity - 1)"
              @remove="removeItem(item.id)"
            />
          </div>
        </div>

        <div v-if="!isEmpty" class="vbwd-cart-dropdown-footer">
          <div class="vbwd-cart-dropdown-total">
            <span>Total:</span>
            <span class="vbwd-cart-dropdown-total-value" data-testid="cart-dropdown-total">
              {{ formatPrice(total) }}
            </span>
          </div>
          <div class="vbwd-cart-dropdown-actions">
            <button
              type="button"
              class="vbwd-cart-dropdown-btn vbwd-cart-dropdown-btn-secondary"
              data-testid="cart-clear"
              @click="handleClear"
            >
              Clear
            </button>
            <button
              type="button"
              class="vbwd-cart-dropdown-btn vbwd-cart-dropdown-btn-primary"
              data-testid="cart-checkout"
              @click="handleCheckout"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useCartStore } from '../../stores/cart';
import CartIcon from './CartIcon.vue';
import CartItem from './CartItem.vue';
import CartEmpty from './CartEmpty.vue';

type DropdownPlacement = 'bottom-start' | 'bottom-end';

withDefaults(defineProps<{
  placement?: DropdownPlacement;
}>(), {
  placement: 'bottom-end',
});

const emit = defineEmits<{
  checkout: [];
  clear: [];
}>();

const cartStore = useCartStore();
const { items, itemCount, total, isEmpty } = storeToRefs(cartStore);
const { removeItem, updateQuantity, clearCart } = cartStore;

const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const toggle = () => {
  isOpen.value = !isOpen.value;
};

const close = () => {
  isOpen.value = false;
};

const handleCheckout = () => {
  emit('checkout');
  close();
};

const handleClear = () => {
  clearCart();
  emit('clear');
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

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
.vbwd-cart-dropdown {
  position: relative;
  display: inline-block;
}

.vbwd-cart-dropdown-trigger {
  cursor: pointer;
}

.vbwd-cart-dropdown-menu {
  position: absolute;
  z-index: 50;
  width: 20rem;
  background: white;
  border: 1px solid var(--vbwd-color-border, #e5e7eb);
  border-radius: var(--vbwd-dropdown-radius, 0.5rem);
  box-shadow: var(--vbwd-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
  overflow: hidden;
}

.vbwd-cart-dropdown-bottom-start {
  top: 100%;
  left: 0;
  margin-top: 0.5rem;
}

.vbwd-cart-dropdown-bottom-end {
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
}

.vbwd-cart-dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--vbwd-color-border, #e5e7eb);
  background: var(--vbwd-color-surface, #f9fafb);
}

.vbwd-cart-dropdown-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--vbwd-color-text, #374151);
  margin: 0;
}

.vbwd-cart-dropdown-count {
  font-size: 0.75rem;
  color: var(--vbwd-color-text-muted, #6b7280);
}

.vbwd-cart-dropdown-content {
  max-height: 16rem;
  overflow-y: auto;
}

.vbwd-cart-dropdown-items {
  padding: 0.5rem 1rem;
}

.vbwd-cart-dropdown-footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--vbwd-color-border, #e5e7eb);
  background: var(--vbwd-color-surface, #f9fafb);
}

.vbwd-cart-dropdown-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: var(--vbwd-color-text, #374151);
}

.vbwd-cart-dropdown-total-value {
  font-weight: 700;
  font-size: 1rem;
}

.vbwd-cart-dropdown-actions {
  display: flex;
  gap: 0.5rem;
}

.vbwd-cart-dropdown-btn {
  flex: 1;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.vbwd-cart-dropdown-btn-secondary {
  border: 1px solid var(--vbwd-color-border, #e5e7eb);
  background: white;
  color: var(--vbwd-color-text, #374151);
}

.vbwd-cart-dropdown-btn-secondary:hover {
  border-color: var(--vbwd-color-text-muted, #6b7280);
}

.vbwd-cart-dropdown-btn-primary {
  border: none;
  background: var(--vbwd-color-primary, #3b82f6);
  color: white;
}

.vbwd-cart-dropdown-btn-primary:hover {
  background: var(--vbwd-color-primary-dark, #2563eb);
}

/* Transitions */
.vbwd-cart-dropdown-enter-active,
.vbwd-cart-dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.vbwd-cart-dropdown-enter-from,
.vbwd-cart-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-0.25rem);
}
</style>
