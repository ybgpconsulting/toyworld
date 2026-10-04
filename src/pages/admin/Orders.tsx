import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminGetOrders } from '../../lib/api';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { ShoppingCart, Eye, Download, Search } from 'lucide-react';
import Button from '../../components/ui/Button';

const Orders: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter, paymentFilter, search],
    queryFn: () =>
      adminGetOrders({
        status: statusFilter || undefined,
        payment_status: paymentFilter || undefined,
        search: search || undefined,
      }),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'paid':
        return 'green';
      case 'shipped':
        return 'blue';
      case 'cancelled':
      case 'failed':
        return 'red';
      default:
        return 'orange';
    }
  };

  const ordersList: any[] = data?.data || (Array.isArray(data) ? data : []);

  const exportCSV = () => {
    if (!ordersList.length) return;
    const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'Total', 'Payment Status', 'Order Status'];
    const rows = ordersList.map((o) => [
      o.order_number || o.orderNumber,
      new Date(o.created_at || o.createdAt || Date.now()).toLocaleDateString('en-IN'),
      o.customer_name || o.address?.fullName || '',
      o.customer_phone || o.address?.mobile || '',
      o.grand_total ?? o.total ?? 0,
      o.payment_status || o.paymentStatus || 'pending',
      o.order_status || o.status || 'new',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `orders_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--deep-navy)] flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-[var(--brand-orange)]" /> Orders Management
          </h1>
          <p className="text-sm text-gray-500">Track incoming customer orders, manage shipping, and sync with WhatsApp</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV} disabled={!ordersList.length}>
          <Download className="w-4 h-4 mr-1.5" /> Export Orders CSV
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <div className="relative">
          <Input
            placeholder="Search Order #, Customer, Phone..."
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-xl bg-white text-sm focus:ring-2 focus:ring-[var(--brand-orange)] outline-none"
        >
          <option value="">All Order Statuses</option>
          <option value="new">New</option>
          <option value="whatsapp_contacted">WhatsApp Contacted</option>
          <option value="payment_pending">Payment Pending</option>
          <option value="payment_received">Payment Received</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="px-3 py-2 border rounded-xl bg-white text-sm focus:ring-2 focus:ring-[var(--brand-orange)] outline-none"
        >
          <option value="">All Payment Statuses</option>
          <option value="pending">Pending</option>
          <option value="awaiting_confirmation">Awaiting Confirmation</option>
          <option value="received">Received / Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-700">Order ID</th>
                <th className="p-4 font-semibold text-gray-700">Date</th>
                <th className="p-4 font-semibold text-gray-700">Customer</th>
                <th className="p-4 font-semibold text-gray-700">Total</th>
                <th className="p-4 font-semibold text-gray-700">Payment</th>
                <th className="p-4 font-semibold text-gray-700">Order Status</th>
                <th className="p-4 font-semibold text-gray-700 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    Loading orders...
                  </td>
                </tr>
              ) : ordersList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                ordersList.map((order: any) => {
                  const orderNum = order.order_number || order.orderNumber;
                  const dateStr = order.created_at || order.createdAt;
                  const customerName = order.customer_name || order.address?.fullName || 'Customer';
                  const customerPhone = order.customer_phone || order.address?.mobile || '';
                  const total = order.grand_total ?? order.total ?? 0;
                  const pStatus = order.payment_status || order.paymentStatus || 'pending';
                  const oStatus = order.order_status || order.status || 'new';

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50">
                      <td className="p-4 font-mono font-bold text-[var(--brand-orange)]">{orderNum}</td>
                      <td className="p-4 text-gray-500">
                        {dateStr ? new Date(dateStr).toLocaleDateString('en-IN') : 'N/A'}
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-[var(--deep-navy)]">{customerName}</p>
                        <p className="text-xs text-gray-500">📱 {customerPhone}</p>
                      </td>
                      <td className="p-4 font-bold text-gray-900">₹{total.toLocaleString()}</td>
                      <td className="p-4">
                        <Badge variant={getStatusColor(pStatus)}>
                          {pStatus.replace(/_/g, ' ').toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={getStatusColor(oStatus)}>
                          {oStatus.replace(/_/g, ' ').toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="inline-flex p-2 text-[var(--brand-orange)] hover:bg-orange-50 rounded-lg transition-colors font-medium text-xs items-center gap-1"
                        >
                          <Eye className="w-4 h-4" /> Open
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
