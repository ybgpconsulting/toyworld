import React from 'react';
import { useCartStore } from '../stores/cartStore';
import { Button } from '../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

const CartPage = () => {
  const { items, removeItem, updateQuantity, subtotal: storeSubtotal } = useCartStore();
  const navigate = useNavigate();

  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  ) || storeSubtotal || 0;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--deep-navy)] mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          Looks like you haven't added any toys to your cart yet. Let's find something fun!
        </p>
        <Button size="lg" onClick={() => navigate('/shop')}>
          Start Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-2xl md:text-3xl font-bold text-[var(--deep-navy)] mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Cart Items List */}
        <div className="flex-1 space-y-4">
          <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
            {/* Header - Desktop only */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b bg-gray-50 text-sm font-semibold text-gray-600">
              <div className="col-span-6">Product</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-1 text-right"></div>
            </div>

            {/* Items */}
            <div className="divide-y">
              {items.map((item) => (
                <div key={item.id} className="p-4 md:p-6 flex flex-col md:grid md:grid-cols-12 gap-4 items-center">

                  <div className="col-span-6 w-full flex items-center gap-4">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg border"
                    />
                    <div>
                      <Link to={`/product/${item.productId}`} className="font-bold text-gray-900 hover:text-[var(--brand-orange)] line-clamp-2">
                        {item.name}
                      </Link>
                      {item.variantName && (
                        <p className="text-sm text-gray-500 mt-1">{item.variantName}</p>
                      )}
                      <p className="text-[var(--brand-orange)] font-semibold mt-1 md:hidden">
                        ₹{item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-3 w-full md:w-auto flex justify-between md:justify-center items-center mt-4 md:mt-0">
                    <span className="md:hidden text-sm text-gray-500">Quantity</span>
                    <div className="flex items-center border-2 border-gray-200 rounded-lg bg-white">
                      <button
                        className="p-2 hover:bg-gray-50 text-gray-600 disabled:opacity-50"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-medium">{item.quantity}</span>
                      <button
                        className="p-2 hover:bg-gray-50 text-gray-600"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="col-span-2 hidden md:block text-right font-bold text-lg text-[var(--deep-navy)]">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </div>

                  <div className="col-span-1 hidden md:flex justify-end">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Mobile Remove Button */}
                  <div className="w-full flex justify-end md:hidden pt-4 border-t border-gray-100">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 text-sm font-medium flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-80 xl:w-96">
          <div className="bg-white border rounded-2xl p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-[var(--deep-navy)] mb-6">Order Summary</h2>

            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({items.length} items)</span>
                <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping Estimate</span>
                <span className="font-semibold text-green-600">Calculated at checkout</span>
              </div>
              <div className="border-t pt-4 flex justify-between items-end">
                <span className="text-base font-bold text-[var(--deep-navy)]">Total</span>
                <span className="text-2xl font-bold text-[var(--brand-orange)]">₹{subtotal.toLocaleString()}</span>
              </div>
            </div>

            <Button size="lg" fullWidth onClick={() => navigate('/checkout')} className="mb-4 text-lg py-4">
              Proceed to Checkout
            </Button>

            <Link to="/shop" className="block text-center text-sm font-medium text-[var(--brand-orange)] hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CartPage;
