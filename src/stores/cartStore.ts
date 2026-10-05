import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const calculateTotals = (items: CartItem[]) => {
  const itemCount = items.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
  const subtotal = items.reduce((total, item) => total + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0);
  return { itemCount, subtotal };
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      itemCount: 0,
      subtotal: 0,

      addItem: (newItem) => {
        set((state) => {
          const cartItemId = `${newItem.productId}:${newItem.variantId ?? 'base'}`;
          const existingItemIndex = state.items.findIndex(
            (item) => String(item.productId) === String(newItem.productId) &&
              String(item.variantId ?? 'base') === String(newItem.variantId ?? 'base')
          );

          let updatedItems: CartItem[];
          if (existingItemIndex >= 0) {
            updatedItems = [...state.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + newItem.quantity,
              price: Number(newItem.price) || updatedItems[existingItemIndex].price,
            };
          } else {
            updatedItems = [...state.items, { ...newItem, id: cartItemId, price: Number(newItem.price) || 0 }];
          }

          const { itemCount, subtotal } = calculateTotals(updatedItems);
          return { items: updatedItems, isOpen: true, itemCount, subtotal };
        });
      },

      removeItem: (id) => {
        set((state) => {
          const updatedItems = state.items.filter((item) => item.id !== id);
          const { itemCount, subtotal } = calculateTotals(updatedItems);
          return { items: updatedItems, itemCount, subtotal };
        });
      },

      updateQuantity: (id, quantity) => {
        set((state) => {
          const updatedItems = state.items.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
          );
          const { itemCount, subtotal } = calculateTotals(updatedItems);
          return { items: updatedItems, itemCount, subtotal };
        });
      },

      clearCart: () => set({ items: [], itemCount: 0, subtotal: 0 }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: 'toy-world-cart',
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.items)) {
          const { itemCount, subtotal } = calculateTotals(state.items);
          state.itemCount = itemCount;
          state.subtotal = subtotal;
        }
      },
    }
  )
);
