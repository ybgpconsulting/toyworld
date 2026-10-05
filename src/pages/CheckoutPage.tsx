import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { INDIAN_STATES } from '../lib/constants';
import { CheckoutQuote, createOrder, getCheckoutQuote } from '../lib/api';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import clsx from 'clsx';

const formatPrice = (amount: number) => `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const makeIdempotencyKey = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [quoteError, setQuoteError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const idempotencyKey = useRef<string | undefined>(undefined);
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    alternateMobile: '',
    email: '',
    flat: '',
    building: '',
    street: '',
    landmark: '',
    city: '',
    state: INDIAN_STATES[0],
    pincode: '',
  });

  const quoteItems = useMemo(
    () => items.map((item) => ({
      product_id: Number(item.productId),
      variant_id: item.variantId ? Number(item.variantId) : undefined,
      quantity: item.quantity,
    })),
    [items],
  );

  useEffect(() => {
    const pincode = formData.pincode.replace(/\D/g, '');
    if (!quoteItems.length || !/^[1-9]\d{5}$/.test(pincode) || !formData.state) return;

    let current = true;
    const timer = window.setTimeout(() => {
      getCheckoutQuote({
        items: quoteItems,
        address: { state: formData.state, pincode },
        coupon_code: couponCode.trim() || undefined,
      })
        .then((result) => {
          if (current) setQuote(result);
        })
        .catch((error: unknown) => {
          if (current) setQuoteError(error instanceof Error ? error.message : 'Could not calculate your checkout total.');
        })
        .finally(() => {
          if (current) setQuoteLoading(false);
        });
    }, 300);

    return () => {
      current = false;
      window.clearTimeout(timer);
    };
  }, [couponCode, formData.pincode, formData.state, quoteItems]);

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (name === 'pincode') {
      setQuote(null);
      setQuoteError('');
      setQuoteLoading(/^[1-9]\d{5}$/.test(value.replace(/\D/g, '')));
    }
  };

  const nextStep = () => {
    setSubmitError('');
    if (step === 1) {
      if (!formData.fullName.trim()) {
        setSubmitError('Please enter your full name.');
        return;
      }
      if (!/^[6-9]\d{9}$/.test(formData.mobile.replace(/\D/g, ''))) {
        setSubmitError('Please enter a valid 10-digit mobile number.');
        return;
      }
      if (formData.alternateMobile && !/^[6-9]\d{9}$/.test(formData.alternateMobile.replace(/\D/g, ''))) {
        setSubmitError('Please enter a valid 10-digit alternate mobile number.');
        return;
      }
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        setSubmitError('Please enter a valid email address.');
        return;
      }
    }
    if (step === 2) {
      if (!formData.flat.trim() || !formData.street.trim() || !formData.city.trim() ||
          !/^[1-9]\d{5}$/.test(formData.pincode.replace(/\D/g, ''))) {
        setSubmitError('Please complete your delivery address with a valid 6-digit pincode.');
        return;
      }
      if (quoteLoading || !quote || quote.shipping === null || quote.grand_total === null) {
        setSubmitError(quoteError || 'Shipping is not available for this address yet. Please try another location or contact TOY WORLD on WhatsApp.');
        return;
      }
    }
    setStep((current) => current + 1);
  };

  const prevStep = () => {
    setSubmitError('');
    setStep((current) => Math.max(1, current - 1));
  };

  const handlePlaceOrder = async () => {
    if (!quote || quote.shipping === null || quote.grand_total === null || loading) return;
    setSubmitError('');

    // Pre-open new tab/window directly on user gesture to prevent popup blocking
    let newTab: Window | null = null;
    try {
      newTab = window.open('about:blank', '_blank');
    } catch (_err) {
      newTab = null;
    }

    try {
      setLoading(true);
      idempotencyKey.current ||= makeIdempotencyKey();
      const response = await createOrder({
        idempotency_key: idempotencyKey.current,
        customer_name: formData.fullName.trim(),
        customer_phone: formData.mobile,
        customer_alternate_phone: formData.alternateMobile || undefined,
        customer_email: formData.email.trim() || undefined,
        coupon_code: couponCode.trim() || undefined,
        items: quoteItems,
        address: {
          flat_house: formData.flat.trim(),
          building_society: formData.building.trim() || undefined,
          street_locality: formData.street.trim(),
          landmark: formData.landmark.trim() || undefined,
          city: formData.city.trim(),
          state: formData.state,
          pincode: formData.pincode.replace(/\D/g, ''),
          country: 'India',
        },
      });

      if (!response.whatsapp_url) {
        if (newTab && !newTab.closed) newTab.close();
        throw new Error('Your order was placed, but the WhatsApp link was unavailable. Please contact TOY WORLD and mention your Order ID.');
      }

      // Point the new window/tab to WhatsApp
      let openedInNewWindow = false;
      if (newTab && !newTab.closed) {
        try {
          newTab.location.href = response.whatsapp_url;
          openedInNewWindow = true;
        } catch (_e) {
          try {
            window.open(response.whatsapp_url, '_blank', 'noopener,noreferrer');
            openedInNewWindow = true;
          } catch (_err) {}
        }
      } else {
        try {
          const w = window.open(response.whatsapp_url, '_blank', 'noopener,noreferrer');
          openedInNewWindow = Boolean(w);
        } catch (_err) {}
      }

      try {
        sessionStorage.setItem(`toy-world-order-whatsapp:${response.order_number}`, response.whatsapp_url);
        sessionStorage.setItem(`toy-world-order-total:${response.order_number}`, String(response.grand_total));
      } catch (storageError) {
        console.warn('Could not preserve the WhatsApp order link for this browser session:', storageError);
      }

      clearCart();

      // Show the Order Placed Successfully screen in the current window!
      navigate(`/order-success/${encodeURIComponent(response.order_number)}`, {
        replace: true,
        state: {
          whatsappUrl: response.whatsapp_url,
          grandTotal: response.grand_total,
          openedInNewWindow,
        },
      });
    } catch (error: unknown) {
      if (newTab && !newTab.closed) {
        try {
          newTab.close();
        } catch (_e) {}
      }
      setSubmitError(error instanceof Error ? error.message : 'Your order could not be completed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const shownSubtotal = quote?.subtotal ?? subtotal;

  return (
    <div className="min-h-screen bg-gray-50 py-6 pb-28 md:py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-8 flex items-center justify-between gap-2 px-1 sm:px-4">
          {['Customer Details', 'Delivery Address', 'Review Order'].map((label, index) => {
            const number = index + 1;
            return (
              <React.Fragment key={label}>
                {index > 0 && <div className={clsx('h-0.5 min-w-3 flex-1', step >= number ? 'bg-[var(--brand-orange)]' : 'bg-gray-200')} />}
                <div className="flex shrink-0 items-center gap-2">
                  <span className={clsx('flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold', step >= number ? 'bg-[var(--brand-orange)] text-white' : 'bg-gray-200 text-gray-600')}>
                    {number}
                  </span>
                  <span className="hidden text-xs font-medium sm:inline">{label}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        <div className="flex flex-col gap-6 md:flex-row">
          <main className="min-w-0 flex-1 rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
            {step > 1 && (
              <button onClick={prevStep} className="mb-5 flex min-h-11 items-center text-sm text-gray-600 hover:text-[var(--brand-orange)]">
                <ArrowLeft className="mr-1 h-4 w-4" /> Back
              </button>
            )}
            <h1 className="mb-6 text-xl font-bold text-[var(--deep-navy)]">
              {['', 'Customer Details', 'Delivery Address', 'Review Your Order'][step]}
            </h1>

            {submitError && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{submitError}</p>}

            {step === 1 && (
              <div className="space-y-4">
                <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Enter your name" required />
                <Input label="Mobile Number" name="mobile" type="tel" inputMode="numeric" maxLength={10} value={formData.mobile} onChange={handleInputChange} placeholder="10-digit mobile number" required />
                <Input label="Alternate Mobile (Optional)" name="alternateMobile" type="tel" inputMode="numeric" maxLength={10} value={formData.alternateMobile} onChange={handleInputChange} placeholder="10-digit mobile number" />
                <Input label="Email Address (Optional)" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="name@example.com" />
                <Button size="lg" fullWidth onClick={nextStep} className="mt-5">Continue to Delivery Address</Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label="Flat / House No" name="flat" value={formData.flat} onChange={handleInputChange} placeholder="House / Flat / Block" required />
                  <Input label="Building / Society (Optional)" name="building" value={formData.building} onChange={handleInputChange} placeholder="Building or society" />
                  <Input label="Street / Locality" name="street" value={formData.street} onChange={handleInputChange} placeholder="Road, colony, locality" required />
                  <Input label="Landmark (Optional)" name="landmark" value={formData.landmark} onChange={handleInputChange} placeholder="Nearby landmark" />
                  <Input label="City" name="city" value={formData.city} onChange={handleInputChange} placeholder="City / Town" required />
                  <Input label="Pincode" name="pincode" type="text" inputMode="numeric" maxLength={6} value={formData.pincode} onChange={handleInputChange} placeholder="6-digit PIN code" required />
                </div>
                <div>
                  <label htmlFor="checkout-state" className="mb-1 block text-sm font-medium text-gray-700">State / UT *</label>
                  <select id="checkout-state" name="state" value={formData.state} onChange={(event) => {
                    setFormData((current) => ({ ...current, state: event.target.value }));
                    setQuote(null);
                    setQuoteError('');
                    setQuoteLoading(/^[1-9]\d{5}$/.test(formData.pincode.replace(/\D/g, '')));
                  }} className="min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm focus:border-[var(--brand-orange)] focus:outline-none">
                    {INDIAN_STATES.map((state) => <option key={state} value={state}>{state}</option>)}
                  </select>
                  <p className="mt-2 text-xs text-gray-500">Country: India</p>
                </div>
                <Input label="Coupon Code (Optional)" name="coupon_code" value={couponCode} onChange={(event) => {
                  setCouponCode(event.target.value);
                  setQuote(null);
                  setQuoteError('');
                  setQuoteLoading(/^[1-9]\d{5}$/.test(formData.pincode.replace(/\D/g, '')));
                }} placeholder="Enter coupon code" />
                <div aria-live="polite" className="rounded-lg bg-gray-50 p-3 text-sm">
                  {quoteLoading ? <p className="text-gray-500">Checking current prices, stock and shipping…</p>
                    : quoteError ? <p className="text-red-700">{quoteError}</p>
                    : quote?.shipping === null ? <p className="text-amber-800">Shipping will be confirmed manually by TOY WORLD via WhatsApp. Online checkout is not available for this location yet.</p>
                    : quote ? <p className="text-green-700">Shipping calculated: {quote.shipping_rule?.name}</p>
                    : <p className="text-gray-500">Enter a valid pincode to calculate the current order total.</p>}
                </div>
                <Button size="lg" fullWidth onClick={nextStep} disabled={quoteLoading || !quote || quote.shipping === null || quote.grand_total === null}>
                  Continue to Order Review
                </Button>
              </div>
            )}

            {step === 3 && quote && (
              <div className="space-y-5">
                <div className="flex gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-950">
                  <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-orange)]" />
                  <p><strong>Manual payment:</strong> Payment will be coordinated via WhatsApp after placing your order. No online payment is collected on this website.</p>
                </div>
                <section className="rounded-xl border p-4">
                  <h2 className="mb-2 text-sm font-semibold uppercase text-gray-500">Delivery To</h2>
                  <p className="font-medium text-[var(--deep-navy)]">{formData.fullName}</p>
                  <p className="text-sm text-gray-600">
                    {[formData.flat, formData.building, formData.street, formData.landmark, formData.city, formData.state, formData.pincode, 'India'].filter(Boolean).join(', ')}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">{formData.mobile}{formData.alternateMobile ? ` · ${formData.alternateMobile}` : ''}</p>
                  {formData.email && <p className="text-sm text-gray-600">{formData.email}</p>}
                </section>
                <section className="divide-y rounded-xl border p-4">
                  <h2 className="pb-2 text-sm font-semibold uppercase text-gray-500">Order Items</h2>
                  {quote.items.map((item, index) => (
                    <div key={`${item.product_id}:${item.variant_id ?? 'base'}:${index}`} className="flex justify-between gap-3 py-3 text-sm">
                      <span className="min-w-0">{item.product_name}{item.variant_name ? ` · ${item.variant_name}` : ''} × {item.quantity}</span>
                      <span className="shrink-0 font-semibold">{formatPrice(item.total_price)}</span>
                    </div>
                  ))}
                </section>
                <Button size="lg" fullWidth loading={loading} onClick={handlePlaceOrder} className="bg-green-600 text-white hover:bg-green-700 shadow-md">
                  <MessageCircle className="mr-2 h-5 w-5" /> {loading ? 'Placing Order & Opening WhatsApp…' : 'Place Order via WhatsApp'}
                </Button>
              </div>
            )}
          </main>

          <aside className="w-full md:w-80">
            <div className="sticky top-24 space-y-3 rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-[var(--deep-navy)]">Order Summary</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between"><span>Subtotal</span><span>{quote ? formatPrice(quote.subtotal) : formatPrice(shownSubtotal)}</span></div>
                <div className="flex justify-between"><span>Discount</span><span>{quote ? `−${formatPrice(quote.discount)}` : '—'}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>{quote ? (quote.shipping === null ? 'To be confirmed' : quote.shipping === 0 ? 'FREE' : formatPrice(quote.shipping)) : 'Enter delivery pincode'}</span></div>
                <div className="flex justify-between border-t pt-3 text-base font-bold text-[var(--deep-navy)]">
                  <span>Grand Total</span>
                  <span className="text-[var(--brand-orange)]">{quote?.grand_total === null || !quote ? '—' : formatPrice(quote.grand_total)}</span>
                </div>
                {quote?.shipping_rule && <p className="text-xs text-gray-500">Shipping rule: {quote.shipping_rule.name}</p>}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
