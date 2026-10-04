import { useCartStore } from '../stores/cartStore';

export const useCart = () => {
  const store = useCartStore();

  return {
    items: store.items,
    isOpen: store.isOpen,
    itemCount: store.itemCount,
    subtotal: store.subtotal,
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    toggleCart: store.toggleCart,
    openCart: store.openCart,
    closeCart: store.closeCart,
  };
};
