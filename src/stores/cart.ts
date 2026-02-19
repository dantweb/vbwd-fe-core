import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';

/**
 * Cart item types following Liskov Substitution Principle
 * Any item type can be substituted without breaking cart behavior
 */
export type CartItemType = 'PLAN' | 'TOKEN_BUNDLE' | 'ADD_ON';

/**
 * Interface for cart items - extensible via metadata
 */
export interface ICartItem {
  type: CartItemType;
  id: string;
  name: string;
  price: number;
  quantity: number;
  metadata?: Record<string, unknown>;
}

/**
 * Input type for adding items (quantity is set automatically)
 */
export type CartItemInput = Omit<ICartItem, 'quantity'>;

/**
 * Storage key constant
 */
const STORAGE_KEY = 'vbwd_cart';

/**
 * Load cart from localStorage
 */
function loadFromStorage(): ICartItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Invalid JSON, ignore
  }
  return [];
}

/**
 * Save cart to localStorage
 */
function saveToStorage(items: ICartItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or unavailable, ignore
  }
}

/**
 * Shopping Cart Store
 *
 * Features:
 * - Add/remove/update items
 * - Automatic quantity handling
 * - localStorage persistence
 * - Computed totals
 *
 * Usage:
 * ```typescript
 * import { useCartStore } from '@vbwd/view-component';
 *
 * const cart = useCartStore();
 * cart.addItem({ type: 'TOKEN_BUNDLE', id: '1', name: '1000 Tokens', price: 10 });
 * console.log(cart.total); // 10
 * ```
 */
export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref<ICartItem[]>(loadFromStorage());

  // Getters (computed)
  const itemCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  );

  const total = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  const isEmpty = computed(() => items.value.length === 0);

  // Actions
  function addItem(input: CartItemInput): void {
    const existingIndex = items.value.findIndex(
      (item) => item.id === input.id && item.type === input.type
    );

    if (existingIndex >= 0) {
      // Increment quantity for existing item
      items.value[existingIndex].quantity += 1;
    } else {
      // Add new item with quantity 1
      items.value.push({
        ...input,
        quantity: 1,
      });
    }
  }

  function removeItem(id: string): void {
    const index = items.value.findIndex((item) => item.id === id);
    if (index >= 0) {
      items.value.splice(index, 1);
    }
  }

  function updateQuantity(id: string, quantity: number): void {
    const index = items.value.findIndex((item) => item.id === id);
    if (index >= 0) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        items.value.splice(index, 1);
      } else {
        items.value[index].quantity = quantity;
      }
    }
  }

  function clearCart(): void {
    items.value = [];
  }

  function getItemById(id: string): ICartItem | undefined {
    return items.value.find((item) => item.id === id);
  }

  function getItemsByType(type: CartItemType): ICartItem[] {
    return items.value.filter((item) => item.type === type);
  }

  // Persist to localStorage on changes
  watch(
    items,
    (newItems) => {
      saveToStorage(newItems);
    },
    { deep: true }
  );

  return {
    // State
    items,
    // Getters
    itemCount,
    total,
    isEmpty,
    // Actions
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemById,
    getItemsByType,
  };
});

/**
 * Factory function for creating custom cart stores
 * Useful for DI and testing
 */
export function createCartStore(storageKey: string = STORAGE_KEY) {
  return defineStore(`cart-${storageKey}`, () => {
    const items = ref<ICartItem[]>([]);

    const itemCount = computed(() =>
      items.value.reduce((sum, item) => sum + item.quantity, 0)
    );

    const total = computed(() =>
      items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
    );

    const isEmpty = computed(() => items.value.length === 0);

    function addItem(input: CartItemInput): void {
      const existingIndex = items.value.findIndex(
        (item) => item.id === input.id && item.type === input.type
      );

      if (existingIndex >= 0) {
        items.value[existingIndex].quantity += 1;
      } else {
        items.value.push({ ...input, quantity: 1 });
      }
    }

    function removeItem(id: string): void {
      const index = items.value.findIndex((item) => item.id === id);
      if (index >= 0) {
        items.value.splice(index, 1);
      }
    }

    function updateQuantity(id: string, quantity: number): void {
      const index = items.value.findIndex((item) => item.id === id);
      if (index >= 0) {
        if (quantity <= 0) {
          items.value.splice(index, 1);
        } else {
          items.value[index].quantity = quantity;
        }
      }
    }

    function clearCart(): void {
      items.value = [];
    }

    // Custom storage key persistence
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        items.value = JSON.parse(saved);
      }
    } catch {
      // Ignore
    }

    watch(
      items,
      (newItems) => {
        try {
          localStorage.setItem(storageKey, JSON.stringify(newItems));
        } catch {
          // Ignore
        }
      },
      { deep: true }
    );

    return {
      items,
      itemCount,
      total,
      isEmpty,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    };
  });
}
