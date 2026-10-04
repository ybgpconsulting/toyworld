import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, MessageCircle, ShoppingBag } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { WHATSAPP_NUMBER } from '../lib/constants';

const OrderSuccessPage = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();

  const whatsappMessage = encodeURIComponent(`Hi, I just placed an order. Order ID: ${orderNumber}`);
  const whatsappUrl = `https://wa.me/91${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

  useEffect(() => {
    // Auto-redirect to WhatsApp after 3 seconds
    const timer = setTimeout(() => {
      window.location.href = whatsappUrl;
    }, 3000);

    return () => clearTimeout(timer);
  }, [whatsappUrl]);

  return (
    <div className="min-h-[80vh] bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 md:p-12 max-w-lg w-full text-center shadow-lg border border-gray-100">
        
        {/* Animated Checkmark */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
          <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
          <Check className="w-12 h-12 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-[var(--deep-navy)] mb-2">Order Placed! 🎉</h1>
        <p className="text-gray-500 mb-6">Thank you for shopping with Toy World.</p>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Order ID</p>
          <p className="text-xl font-mono font-bold text-[var(--brand-orange)]">{orderNumber}</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4 text-sm text-left mb-8">
          <strong>Next Step:</strong> Your payment will be coordinated manually via WhatsApp. We will redirect you to chat with us in 3 seconds.
        </div>

        <div className="space-y-3">
          <a href={whatsappUrl} className="block">
            <Button size="lg" fullWidth className="bg-[#25D366] hover:bg-[#128C7E] text-white py-4 text-lg">
              <MessageCircle className="w-6 h-6 mr-2" />
              Chat on WhatsApp Now
            </Button>
          </a>
          
          <Link to="/shop" className="block">
            <Button size="lg" variant="outline" fullWidth className="py-4">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          If WhatsApp doesn't open automatically, please contact us at +91 {WHATSAPP_NUMBER} with your Order ID.
        </p>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
