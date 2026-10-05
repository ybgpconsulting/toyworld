import React from 'react';
import { X, Plus, Minus, ShoppingBag, Sparkles, Truck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore';

const FREE_SHIPPING_THRESHOLD = 999;

const CartDrawer = () => {
  const { isOpen, closeCart, items, removeItem, updateQuantity } = useCartStore();
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Always derive subtotal directly from items so it is 100% reliable and never ₹0
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  );
  const totalItemCount = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0
  );

  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300">

        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-orange-100 bg-orange-50/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--brand-orange)] text-white flex items-center justify-center text-sm font-bold shadow-xs">
              🧸
            </div>
            <div>
              <h2 className="text-base font-black text-[var(--deep-navy)] flex items-center gap-1.5">
                <span>Your Toy Cart</span>
                <span className="text-xs bg-orange-100 text-[var(--brand-orange)] font-bold px-2 py-0.5 rounded-full">
                  {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
                </span>
              </h2>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-white rounded-full transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        {items.length > 0 && (
          <div className="bg-amber-50/80 px-4 py-3 border-b border-amber-100 text-xs">
            <div className="flex items-center justify-between font-bold text-gray-800 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[var(--brand-orange)]" />
                {amountNeededForFreeShipping === 0 ? (
                  <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    You unlocked FREE Pan-India Delivery!
                  </span>
                ) : (
                  <span>
                    Add <span className="text-[var(--brand-orange)] font-black">₹{amountNeededForFreeShipping}</span> more for <span className="text-emerald-700 font-extrabold">FREE Delivery</span>
                  </span>
                )}
              </span>
              <span className="text-gray-500">{freeShippingProgress}%</span>
            </div>
            <div className="w-full bg-amber-200/60 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[var(--brand-orange)] to-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-4xl shadow-inner">
                🧸
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-gray-900">Your cart is feeling lonely</h3>
                <p className="text-xs text-gray-500 max-w-xs">
                  Explore our magical collection of RC cars, building blocks, and games!
                </p>
              </div>
              <button
                onClick={() => {
                  closeCart();
                  navigate('/shop');
                }}
                className="px-6 py-2.5 bg-[var(--brand-orange)] hover:bg-orange-600 text-white rounded-full font-bold text-sm shadow-md transition-all hover:scale-105"
              >
                Start Exploring Toys
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3.5 p-3 bg-white rounded-2xl border border-gray-100 shadow-2xs hover:border-orange-200 transition-colors"
              >
                {/* Product Thumbnail */}
                <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <h3 className="font-bold text-xs text-gray-900 line-clamp-2 leading-snug">
                      {item.name}
                    </h3>
                    {item.variantName && (
                      <span className="inline-block text-[10px] font-semibold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded mt-1">
                        {item.variantName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-50">
                    {/* Stepper */}
                    <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50/50">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-gray-200 text-gray-600 disabled:opacity-40 transition-colors"
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2.5 text-xs font-bold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-200 text-gray-600 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Price & Remove */}
                    <div className="text-right">
                      <p className="font-black text-sm text-[var(--deep-navy)]">
                        ₹{((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString()}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[11px] text-red-500 hover:text-red-700 font-semibold hover:underline"
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

        {/* Drawer Footer with Subtotal */}
        {items.length > 0 && (
          <div className="p-4 border-t border-orange-100 bg-white safe-pb space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-bold text-gray-600">Subtotal</span>
              <div className="text-right">
                <span className="text-2xl font-black text-[var(--deep-navy)]">
                  ₹{subtotal.toLocaleString()}
                </span>
                <p className="text-[10px] text-gray-400">Taxes included</p>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 text-center">
              🚚 Shipping & delivery charges calculated at checkout
            </p>

            <button
              onClick={handleCheckout}
              className="w-full flex items-center justify-center gap-2 bg-[var(--brand-orange)] hover:bg-orange-600 text-white py-3.5 rounded-2xl font-black text-base shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Checkout Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
