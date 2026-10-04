import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { INDIAN_STATES } from '../lib/constants';
import { createOrder } from '../lib/api';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import clsx from 'clsx';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    flat: '',
    street: '',
    city: '',
    state: INDIAN_STATES[0],
    pincode: '',
  });

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<any>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.fullName.trim() || formData.mobile.replace(/\D/g, '').length !== 10) {
        alert('Please fill required fields (Full Name, 10-digit Mobile Number)');
        return;
      }
    }
    if (step === 2) {
      if (!formData.flat.trim() || !formData.street.trim() || !formData.city.trim() || formData.pincode.replace(/\D/g, '').length !== 6) {
        alert('Please fill complete address details (6-digit Indian Pincode)');
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      const shippingAmount = subtotal >= 999 ? 0 : 79;
      const grandTotal = subtotal + shippingAmount;

      const orderPayload = {
        customer_name: formData.fullName,
        customer_phone: formData.mobile,
        customer_email: formData.email || undefined,
        items: items.map((i) => ({
          product_id: Number(i.productId || i.id),
          product_name: i.name,
          quantity: i.quantity,
          selling_price: i.price,
          mrp: i.price,
          total_price: i.price * i.quantity,
          image_url: i.imageUrl,
        })),
        address: {
          flat_house: formData.flat,
          street_locality: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: 'India',
        },
        subtotal,
        shipping_amount: shippingAmount,
        discount_amount: 0,
        grand_total: grandTotal,
      };

      const response = await createOrder(orderPayload);
      clearCart();
      navigate(`/order-success/${response.order_number}`);
    } catch {
      alert('Failed to place order. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  const shippingEstimate = subtotal >= 999 ? 0 : 79;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Progress */}
        <div className="flex items-center justify-between mb-8 px-4">
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                step >= 1 ? 'bg-[var(--brand-orange)] text-white' : 'bg-gray-200 text-gray-600'
              )}
            >
              1
            </span>
            <span className="text-sm font-medium hidden sm:inline">Details</span>
          </div>
          <div className="h-0.5 flex-1 mx-4 bg-gray-200" />
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                step >= 2 ? 'bg-[var(--brand-orange)] text-white' : 'bg-gray-200 text-gray-600'
              )}
            >
              2
            </span>
            <span className="text-sm font-medium hidden sm:inline">Delivery Address</span>
          </div>
          <div className="h-0.5 flex-1 mx-4 bg-gray-200" />
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                step >= 3 ? 'bg-[var(--brand-orange)] text-white' : 'bg-gray-200 text-gray-600'
              )}
            >
              3
            </span>
            <span className="text-sm font-medium hidden sm:inline">Confirm & WhatsApp</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Form */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm p-6">
            {step > 1 && (
              <button
                onClick={prevStep}
                className="flex items-center text-sm text-gray-500 hover:text-[var(--brand-orange)] mb-6"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </button>
            )}

            <h2 className="text-xl font-bold text-[var(--deep-navy)] mb-6">
              {step === 1 ? 'Customer Information' : step === 2 ? 'Delivery Address' : 'Review & Place Order'}
            </h2>

            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <Input
                  label="Full Name *"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  required
                />
                <Input
                  label="Mobile Number (for WhatsApp confirmation) *"
                  name="mobile"
                  type="tel"
                  maxLength={10}
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile number"
                  required
                />
                <Input
                  label="Email Address (Optional)"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@example.com"
                />
                <Button size="lg" fullWidth onClick={nextStep} className="mt-6">
                  Continue to Delivery Address
                </Button>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Flat / House No *"
                    name="flat"
                    value={formData.flat}
                    onChange={handleInputChange}
                    placeholder="House / Flat / Block"
                    required
                  />
                  <Input
                    label="Street / Locality *"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="Road, colony, landmark"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="City *"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City / Town"
                    required
                  />
                  <Input
                    label="Pincode *"
                    name="pincode"
                    type="text"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="6-digit PIN code"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">State / UT *</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[var(--brand-orange)] bg-white text-sm"
                  >
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
                <Button size="lg" fullWidth onClick={nextStep} className="mt-6">
                  Continue to Order Review
                </Button>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-3 text-sm text-orange-950">
                  <MessageCircle className="w-5 h-5 text-[var(--brand-orange)] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Manual Payment Coordination</h4>
                    <p className="text-xs text-orange-800 mt-1">
                      Payment will be coordinated manually via WhatsApp after placing your order. No online gateway or bank card is charged on this website.
                    </p>
                  </div>
                </div>

                <div className="border rounded-xl p-4 divide-y text-sm">
                  <div className="pb-3">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Delivery To</p>
                    <p className="font-medium text-[var(--deep-navy)]">{formData.fullName}</p>
                    <p className="text-gray-600">
                      {formData.flat}, {formData.street}, {formData.city}, {formData.state} - {formData.pincode}
                    </p>
                    <p className="text-gray-600 font-medium mt-1">📱 {formData.mobile}</p>
                  </div>

                  <div className="pt-3">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Order Items</p>
                    {items.map((i) => (
                      <div key={i.id} className="flex justify-between py-1 text-xs text-gray-700">
                        <span>
                          {i.name} × {i.quantity}
                        </span>
                        <span className="font-semibold">₹{(i.price * i.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  size="lg"
                  fullWidth
                  loading={loading}
                  onClick={handlePlaceOrder}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <MessageCircle className="w-5 h-5 mr-2" /> Place Order & Open WhatsApp
                </Button>
              </div>
            )}
          </div>

          {/* Right Summary Sidebar */}
          <div className="w-full md:w-80">
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4 sticky top-24 border">
              <h3 className="font-bold text-lg text-[var(--deep-navy)]">Order Summary</h3>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pan-India Shipping</span>
                  <span>{shippingEstimate === 0 ? 'FREE' : `₹${shippingEstimate}`}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-base text-[var(--deep-navy)]">
                  <span>Grand Total</span>
                  <span className="text-[var(--brand-orange)]">
                    ₹{(subtotal + shippingEstimate).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
