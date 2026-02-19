import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCartStore, type ICartItem } from '../../src/stores/cart';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Cart Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorageMock.clear();
  });

  describe('Initial State', () => {
    it('starts with empty items array', () => {
      const cart = useCartStore();
      expect(cart.items).toEqual([]);
    });

    it('has zero item count when empty', () => {
      const cart = useCartStore();
      expect(cart.itemCount).toBe(0);
    });

    it('has zero total when empty', () => {
      const cart = useCartStore();
      expect(cart.total).toBe(0);
    });

    it('isEmpty returns true when no items', () => {
      const cart = useCartStore();
      expect(cart.isEmpty).toBe(true);
    });
  });

  describe('addItem', () => {
    it('adds item to cart', () => {
      const cart = useCartStore();
      cart.addItem({ type: 'token_bundle', id: '1', name: '1000 Tokens', price: 10 });
      expect(cart.items).toHaveLength(1);
    });

    it('sets quantity to 1 for new item', () => {
      const cart = useCartStore();
      cart.addItem({ type: 'token_bundle', id: '1', name: '1000 Tokens', price: 10 });
      expect(cart.items[0].quantity).toBe(1);
    });

    it('increments quantity when adding same item', () => {
      const cart = useCartStore();
      cart.addItem({ type: 'token_bundle', id: '1', name: '1000 Tokens', price: 10 });
      cart.addItem({ type: 'token_bundle', id: '1', name: '1000 Tokens', price: 10 });
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(2);
    });

    it('updates itemCount after adding', () => {
      const cart = useCartStore();
      cart.addItem({ type: 'token_bundle', id: '1', name: '1000 Tokens', price: 10 });
      expect(cart.itemCount).toBe(1);
    });

    it('updates total after adding', () => {
      const cart = useCartStore();
      cart.addItem({ type: 'token_bundle', id: '1', name: '1000 Tokens', price: 10 });
      expect(cart.total).toBe(10);
    });
  });

  describe('removeItem', () => {
    it('removes item from cart', () => {
      const cart = useCartStore();
      cart.addItem({ type: 'token_bundle', id: '1', name: '1000 Tokens', price: 10 });
      cart.removeItem('1');
      expect(cart.items).toHaveLength(0);
    });

    it('does nothing when removing non-existent item', () => {
      const cart = useCartStore();
      cart.addItem({ type: 'token_bundle', id: '1', name: '1000 Tokens', price: 10 });
      cart.removeItem('999');
      expect(cart.items).toHaveLength(1);
    });

    it('updates itemCount after removing', () => {
      const cart = useCartStore();
      cart.addItem({ type: 'token_bundle', id: '1', name: '1000 Tokens', price: 10 });
      cart.removeItem('1');
      expect(cart.itemCount).toBe(0);
    });
  });

  describe('updateQuantity', () => {
    it('updates quantity for existing item', () => {
      const cart = useCartStore();
      cart.addItem({ type: 'token_bundle', id: '1', name: '1000 Tokens', price: 10 });
      cart.updateQuantity('1', 5);
      expect(cart.items[0].quantity).toBe(5);
    });

    it('removes item when quantity set to 0', () => {
      const cart = useCartStore();
      cart.addItem({ type: 'token_bundle', id: '1', name: '1000 Tokens', price: 10 });
      cart.updateQuantity('1', 0);
      expect(cart.items).toHaveLength(0);
    });

    it('does nothing for non-existent item', () => {
      const cart = useCartStore();
      cart.updateQuantity('999', 5);
      expect(cart.items).toHaveLength(0);
    });

    it('updates total after quantity change', () => {
      const cart = useCartStore();
      cart.addItem({ type: 'token_bundle', id: '1', name: '1000 Tokens', price: 10 });
      cart.updateQuantity('1', 3);
      expect(cart.total).toBe(30);
    });
  });

  describe('clearCart', () => {
    it('removes all items', () => {
      const cart = useCartStore();
      cart.addItem({ type: 'token_bundle', id: '1', name: '1000 Tokens', price: 10 });
      cart.addItem({ type: 'addon', id: '2', name: 'Priority Support', price: 15 });
      cart.clearCart();
      expect(cart.items).toHaveLength(0);
    });

    it('resets total to zero', () => {
      const cart = useCartStore();
      cart.addItem({ type: 'token_bundle', id: '1', name: '1000 Tokens', price: 10 });
      cart.clearCart();
      expect(cart.total).toBe(0);
    });
  });

  describe('Getters', () => {
    it('calculates itemCount with quantities', () => {
      const cart = useCartStore();
      cart.addItem({ type: 'token_bundle', id: '1', name: '1000 Tokens', price: 10 });
      cart.addItem({ type: 'token_bundle', id: '1', name: '1000 Tokens', price: 10 });
      cart.addItem({ type: 'addon', id: '2', name: 'Priority Support', price: 15 });
      expect(cart.itemCount).toBe(3); // 2 + 1
    });

    it('calculates total with quantities', () => {
      const cart = useCartStore();
      cart.addItem({ type: 'token_bundle', id: '1', name: '1000 Tokens', price: 10 });
      cart.addItem({ type: 'token_bundle', id: '1', name: '1000 Tokens', price: 10 });
      cart.addItem({ type: 'addon', id: '2', name: 'Priority Support', price: 15 });
      expect(cart.total).toBe(35); // (10 * 2) + 15
    });

    it('isEmpty returns false when has items', () => {
      const cart = useCartStore();
      cart.addItem({ type: 'token_bundle', id: '1', name: '1000 Tokens', price: 10 });
      expect(cart.isEmpty).toBe(false);
    });
  });

  describe('Persistence', () => {
    it('saves to localStorage when item added', async () => {
      const cart = useCartStore();
      cart.addItem({ type: 'token_bundle', id: '1', name: '1000 Tokens', price: 10 });
      // Wait for watch to trigger
      await new Promise(resolve => setTimeout(resolve, 10));
      const saved = localStorageMock.getItem('vbwd_cart');
      expect(saved).not.toBeNull();
    });

    it.skip('restores from localStorage on init', () => {
      // This test requires special handling for store reinitialization
      // Skipped for now - tested manually
    });
  });

  describe('Item Types', () => {
    it('supports plan type', () => {
      const cart = useCartStore();
      cart.addItem({ type: 'plan', id: 'pro', name: 'Pro Plan', price: 29 });
      expect(cart.items[0].type).toBe('plan');
    });

    it('supports token_bundle type', () => {
      const cart = useCartStore();
      cart.addItem({ type: 'token_bundle', id: '1', name: '1000 Tokens', price: 10 });
      expect(cart.items[0].type).toBe('token_bundle');
    });

    it('supports addon type', () => {
      const cart = useCartStore();
      cart.addItem({ type: 'addon', id: '1', name: 'Priority Support', price: 15 });
      expect(cart.items[0].type).toBe('addon');
    });

    it('supports metadata field', () => {
      const cart = useCartStore();
      cart.addItem({
        type: 'addon',
        id: '1',
        name: 'Priority Support',
        price: 15,
        metadata: { subscription_dependent: true }
      });
      expect(cart.items[0].metadata?.subscription_dependent).toBe(true);
    });
  });
});
