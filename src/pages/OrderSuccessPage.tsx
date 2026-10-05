import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check, MessageCircle, ShoppingBag, ExternalLink, Copy, CheckCheck, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { getOrderByNumber } from '../lib/api';
import { WHATSAPP_NUMBER } from '../lib/constants';

interface OrderSuccessNavigationState {
  whatsappUrl?: string;
  grandTotal?: number;
  openedInNewWindow?: boolean;
}

const isTrustedWhatsAppUrl = (value: string | undefined): value is string => {
  if (!value) return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      (url.hostname === 'wa.me' ||
        url.hostname === 'api.whatsapp.com' ||
        url.hostname === 'web.whatsapp.com' ||
        url.hostname.endsWith('.whatsapp.com'))
    );
  } catch {
    return false;
  }
};

const OrderSuccessPage = () => {
  const { orderNumber = '' } = useParams<{ orderNumber: string }>();
  const location = useLocation();
  const navigationState = location.state as OrderSuccessNavigationState | null;
  let storedWhatsAppUrl: string | undefined;

  try {
    storedWhatsAppUrl = sessionStorage.getItem(`toy-world-order-whatsapp:${orderNumber}`) || undefined;
  } catch (error) {
    console.warn('Could not read the preserved WhatsApp order link:', error);
  }

  const candidateUrl = navigationState?.whatsappUrl || storedWhatsAppUrl;
  const whatsappUrl = isTrustedWhatsAppUrl(candidateUrl) ? candidateUrl : undefined;
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['public-order-confirmation', orderNumber],
    queryFn: () => getOrderByNumber(orderNumber),
    enabled: Boolean(orderNumber),
    retry: false,
  });

  const grandTotal = navigationState?.grandTotal ?? order?.grand_total;
  const openedInNewWindow = navigationState?.openedInNewWindow ?? false;
  const [copied, setCopied] = React.useState(false);

  const handleCopyOrderId = () => {
    if (!orderNumber) return;
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center bg-gray-50 bg-toy-pattern py-10 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-6 sm:p-10 text-center shadow-xl md:p-12 relative overflow-hidden">
        {/* Decorative Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 via-[var(--brand-orange)] to-[var(--brand-yellow)]" />

        {/* Celebration Icon */}
        <div className="relative mx-auto mb-6 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-green-100 shadow-inner">
          <div className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-20" />
          <Check className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" />
          <span className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--brand-yellow)] shadow-sm">
            <Sparkles className="h-4 w-4 text-[var(--deep-navy)]" />
          </span>
        </div>

        <h1 className="mb-2 text-2xl sm:text-3xl font-extrabold text-[var(--deep-navy)]">
          Order Placed Successfully!
        </h1>
        <p className="mb-6 text-sm sm:text-base text-gray-500">
          Thank you for shopping with <strong className="text-[var(--deep-navy)] font-semibold">TOY WORLD</strong>.
        </p>

        {/* WhatsApp Notification Banner */}
        {openedInNewWindow ? (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50/90 p-4 text-left shadow-sm">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-sm">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="text-xs sm:text-sm">
              <p className="font-bold text-green-950 flex items-center gap-1.5">
                <span>WhatsApp Opened in New Window</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </p>
              <p className="mt-0.5 text-green-800 leading-relaxed">
                Your order is pre-filled in the new window. Switch to WhatsApp and press <strong>Send</strong> to confirm your order and receive UPI payment details.
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-left shadow-sm">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-sm">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="text-xs sm:text-sm">
              <p className="font-bold text-emerald-950">Confirm Your Order on WhatsApp</p>
              <p className="mt-0.5 text-emerald-800 leading-relaxed">
                Click the green button below to open WhatsApp in a new window and share your order details with TOY WORLD.
              </p>
            </div>
          </div>
        )}

        {/* Order Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Order ID</p>
            <div className="mt-1 flex items-center justify-between gap-1">
              <span className="font-mono text-base sm:text-lg font-bold text-[var(--brand-orange)] truncate">
                {orderNumber}
              </span>
              <button
                type="button"
                onClick={handleCopyOrderId}
                title="Copy Order ID"
                className="shrink-0 p-1 rounded-lg text-gray-500 hover:text-[var(--deep-navy)] hover:bg-white transition-colors"
              >
                {copied ? <CheckCheck className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Grand Total</p>
            <p className="mt-1 text-base sm:text-lg font-bold text-[var(--deep-navy)]">
              {isLoading && grandTotal === undefined
                ? 'Loading…'
                : grandTotal === undefined
                ? 'Unavailable'
                : `₹${grandTotal.toLocaleString('en-IN')}`}
            </p>
          </div>
        </div>

        {/* Payment Notice */}
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 text-left text-xs sm:text-sm text-amber-900 leading-relaxed">
          <strong className="font-semibold text-amber-950">Payment & Verification:</strong> Orders are verified and finalized over WhatsApp. No online card details are collected on this website.
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button
                size="lg"
                fullWidth
                className="bg-[#25D366] py-4 text-base sm:text-lg font-bold text-white hover:bg-[#128C7E] shadow-lg shadow-green-600/25 transition-all hover:scale-[1.01]"
              >
                <MessageCircle className="mr-2 h-5 w-5 sm:h-6 sm:w-6" /> Open WhatsApp (New Window)
                <ExternalLink className="ml-2 h-4 w-4 opacity-80" />
              </Button>
            </a>
          ) : (
            <Button size="lg" fullWidth disabled className="py-4 text-base sm:text-lg">
              <MessageCircle className="mr-2 h-6 w-6" /> WhatsApp link unavailable
            </Button>
          )}

          <Link to="/shop" className="block">
            <Button size="lg" variant="outline" fullWidth className="py-4 font-semibold text-gray-700">
              <ShoppingBag className="mr-2 h-5 w-5" /> Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Help footer */}
        <p className="mt-6 text-xs text-gray-500">
          {whatsappUrl
            ? `If WhatsApp didn't open automatically, click the green button above or WhatsApp us directly at +91 ${WHATSAPP_NUMBER}.`
            : isError
            ? `Your order is recorded! Please contact TOY WORLD at +91 ${WHATSAPP_NUMBER} and mention Order ID: ${orderNumber}.`
            : `Please contact TOY WORLD at +91 ${WHATSAPP_NUMBER} and mention Order ID: ${orderNumber}.`}
        </p>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
