import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminGetOrder, adminUpdateOrderStatus, adminGetOrders } from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { 
  ArrowLeft, MessageCircle, Printer, Save, Clock, Package, 
  MapPin, Phone, Mail, User, ShieldCheck, History 
} from 'lucide-react';

const ORDER_STATUSES = [
  'new',
  'whatsapp_contacted',
  'payment_pending',
  'payment_received',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

const PAYMENT_STATUSES = [
  'pending',
  'awaiting_confirmation',
  'received',
  'failed',
  'refunded',
];

const SHIPPING_STATUSES = [
  'not_shipped',
  'ready_to_ship',
  'shipped',
  'delivered',
  'returned',
];

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [customerHistory, setCustomerHistory] = useState<any[]>([]);

  // Operational states
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [shippingStatus, setShippingStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [internalNote, setInternalNote] = useState('');

  const loadOrder = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data: any = await adminGetOrder(id);
      setOrder(data);

      setOrderStatus(data.order_status || 'new');
      setPaymentStatus(data.payment_status || 'pending');
      setShippingStatus(data.shipping_status || 'not_shipped');
      setTrackingNumber(data.tracking_number || '');
      setInternalNote(data.internal_note || '');

      // Load previous customer orders by phone
      if (data.customer_phone) {
        adminGetOrders({ search: data.customer_phone })
          .then((res) => {
            const list = res.data ? res.data : (Array.isArray(res) ? res : []);
            setCustomerHistory(list.filter((o: any) => o.id !== data.id));
          })
          .catch(() => {});
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load order', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleUpdate = async () => {
    if (!id) return;
    try {
      setUpdating(true);
      await adminUpdateOrderStatus(id, {
        order_status: orderStatus,
        payment_status: paymentStatus,
        shipping_status: shippingStatus,
        tracking_number: trackingNumber,
        internal_note: internalNote,
      });
      showToast('Order statuses saved successfully', 'success');
      loadOrder();
    } catch (err: any) {
      showToast(err.message || 'Failed to update order', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const openWhatsAppChat = () => {
    if (!order) return;
    const cleanPhone = order.customer_phone.replace(/\D/g, '');
    const phone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const msg = `Hello ${order.customer_name}! This is TOY WORLD regarding your Order #${order.order_number}.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading order #{id}...</div>;
  }

  if (!order) {
    return <div className="p-8 text-center text-red-500">Order not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/orders')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Orders
          </Button>
          <div>
            <h1 className="text-xl font-bold text-[var(--deep-navy)]">
              Order #{order.order_number}
            </h1>
            <p className="text-xs text-gray-500">
              Placed on {new Date(order.created_at).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={openWhatsAppChat}>
            <MessageCircle className="w-4 h-4 mr-1 text-green-600" /> WhatsApp Customer
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1" /> Print Invoice
          </Button>
          <Button variant="primary" size="sm" loading={updating} onClick={handleUpdate}>
            <Save className="w-4 h-4 mr-1" /> Save Statuses
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Order Items & Financials */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-lg font-bold text-[var(--deep-navy)] mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-[var(--brand-orange)]" />
              Order Items ({order.items?.length || 0})
            </h2>

            <div className="divide-y">
              {order.items?.map((item: any) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="w-12 h-12 rounded object-cover border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                        Toy
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm text-[var(--deep-navy)]">
                        {item.product_name}
                      </p>
                      {item.variant_name && (
                        <p className="text-xs text-gray-500">Variant: {item.variant_name}</p>
                      )}
                      <p className="text-xs text-gray-400">SKU: {item.sku || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-sm text-[var(--deep-navy)]">
                      ₹{item.total_price}
                    </p>
                    <p className="text-xs text-gray-500">
                      ₹{item.selling_price} × {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bill Summary */}
            <div className="border-t mt-4 pt-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>₹{order.subtotal}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ''}:</span>
                  <span>-₹{order.discount_amount}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping:</span>
                <span>{order.shipping_amount === 0 ? 'FREE' : `₹${order.shipping_amount}`}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-[var(--deep-navy)] border-t pt-2 mt-2">
                <span>Grand Total:</span>
                <span className="text-[var(--brand-orange)]">₹{order.grand_total}</span>
              </div>
            </div>
          </div>

          {/* Customer History Section (Repeat customer identification) */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-lg font-bold text-[var(--deep-navy)] mb-2 flex items-center gap-2">
              <History className="w-5 h-5 text-[var(--brand-orange)]" />
              Customer Order History ({customerHistory.length} other orders)
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Historical orders associated with phone {order.customer_phone}
            </p>

            {customerHistory.length > 0 ? (
              <div className="space-y-2">
                {customerHistory.map((h: any) => (
                  <div
                    key={h.id}
                    onClick={() => navigate(`/admin/orders/${h.id}`)}
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors border"
                  >
                    <div>
                      <span className="font-semibold text-sm text-[var(--deep-navy)]">
                        #{h.order_number}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        {new Date(h.created_at).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-700">₹{h.grand_total}</span>
                      <Badge variant={h.order_status === 'delivered' ? 'success' : 'warning'}>
                        {h.order_status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">First-time shopper at TOY WORLD.</p>
            )}
          </div>

          {/* Status Timeline History */}
          {order.history && order.history.length > 0 && (
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <h2 className="text-lg font-bold text-[var(--deep-navy)] mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--brand-orange)]" />
                Audit Log & Status History
              </h2>
              <div className="space-y-3">
                {order.history.map((hist: any) => (
                  <div key={hist.id} className="text-xs border-l-2 border-[var(--brand-orange)] pl-3 py-1">
                    <p className="font-medium text-gray-800">
                      Changed <span className="font-bold">{hist.status_type}</span>: {hist.old_status} → {hist.new_status}
                    </p>
                    <p className="text-gray-500">{hist.note}</p>
                    <p className="text-gray-400 mt-0.5">{new Date(hist.created_at).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Status Controls & Delivery Address */}
        <div className="space-y-6">
          {/* Status Controls */}
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-[var(--deep-navy)] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[var(--brand-orange)]" />
              Operational Statuses
            </h2>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Order Status
              </label>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-gray-50 font-medium text-sm focus:ring-2 focus:ring-[var(--brand-orange)]"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-gray-50 font-medium text-sm focus:ring-2 focus:ring-[var(--brand-orange)]"
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Shipping Status
              </label>
              <select
                value={shippingStatus}
                onChange={(e) => setShippingStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-gray-50 font-medium text-sm focus:ring-2 focus:ring-[var(--brand-orange)]"
              >
                {SHIPPING_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Courier Tracking Number
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. DTDC-12345678"
                className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-[var(--brand-orange)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Staff Internal Note
              </label>
              <textarea
                rows={3}
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Payment received via GPay, dispatched through DTDC..."
                className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-[var(--brand-orange)]"
              />
            </div>

            <Button
              variant="primary"
              className="w-full"
              loading={updating}
              onClick={handleUpdate}
            >
              Update Order
            </Button>
          </div>

          {/* Delivery & Customer Info */}
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-[var(--deep-navy)] flex items-center gap-2">
              <User className="w-5 h-5 text-[var(--brand-orange)]" />
              Customer & Address
            </h2>

            <div className="space-y-2 text-sm">
              <p className="font-semibold text-base text-[var(--deep-navy)]">
                {order.customer_name}
              </p>
              <p className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                <a href={`tel:${order.customer_phone}`} className="hover:underline">
                  {order.customer_phone}
                </a>
              </p>
              {order.customer_email && (
                <p className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {order.customer_email}
                </p>
              )}
            </div>

            {order.address && (
              <div className="border-t pt-3 space-y-1 text-sm text-gray-700">
                <p className="font-semibold flex items-center gap-1.5 text-xs text-gray-500 uppercase">
                  <MapPin className="w-4 h-4 text-[var(--brand-orange)]" /> Delivery Destination
                </p>
                <p>{order.address.flat_house}</p>
                {order.address.building_society && <p>{order.address.building_society}</p>}
                <p>{order.address.street_locality}</p>
                {order.address.landmark && <p className="text-xs text-gray-500">Landmark: {order.address.landmark}</p>}
                <p className="font-medium text-[var(--deep-navy)]">
                  {order.address.city}, {order.address.state} - {order.address.pincode}
                </p>
                <p className="text-xs text-gray-500">{order.address.country || 'India'}</p>
              </div>
            )}

            {order.customer_note && (
              <div className="border-t pt-3">
                <p className="text-xs font-semibold text-gray-500 uppercase">Customer Note:</p>
                <p className="text-sm bg-yellow-50 p-2.5 rounded border border-yellow-200 text-yellow-900 mt-1">
                  "{order.customer_note}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
