import React from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore';

const CartDrawer = () => {
  const { isOpen, closeCart, items, removeItem, updateQuantity, subtotal } = useCartStore();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={closeCart}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-xl z-50 flex flex-col transform transition-transform duration-300">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Your Cart ({items.length})
          </h2>
          <button onClick={closeCart} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
              <ShoppingBag className="w-16 h-16 text-gray-300" />
              <p>Your cart is empty</p>
              <button 
                onClick={() => {
                  closeCart();
                  navigate('/shop');
                }}
                className="px-6 py-2 bg-[var(--brand-orange)] text-white rounded-full font-medium"
              >
                Shop Now
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 p-2 bg-gray-50 rounded-lg">
                <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-medium text-sm line-clamp-2">{item.name}</h3>
                    {item.variantName && <p className="text-xs text-gray-500 mt-1">{item.variantName}</p>}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border rounded-md bg-white">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-gray-100 disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 text-sm font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[var(--deep-navy)]">₹{item.price * item.quantity}</p>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-red-500 mt-1 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t bg-gray-50 safe-pb">
            <div className="flex justify-between mb-4 font-bold text-lg">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <p className="text-xs text-gray-500 mb-4 text-center">Shipping & taxes calculated at checkout</p>
            <button 
              onClick={handleCheckout}
              className="w-full bg-[var(--brand-orange)] hover:bg-[#e65a20] text-white py-3 rounded-xl font-bold transition-colors"
            >
              Checkout Now
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
