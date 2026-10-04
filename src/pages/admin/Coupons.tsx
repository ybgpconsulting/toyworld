import React, { useState, useEffect } from 'react';
import { adminGetCoupons, adminCreateCoupon, adminDeleteCoupon } from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { Coupon } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Ticket, Plus, Trash2 } from 'lucide-react';

const Coupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  // Form State
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'flat'>('percentage');
  const [value, setValue] = useState<number>(10);
  const [minOrderValue, setMinOrderValue] = useState<number>(499);
  const [maxDiscount, setMaxDiscount] = useState<number>(150);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await adminGetCoupons();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    try {
      setSaving(true);
      await adminCreateCoupon({
        code: code.trim().toUpperCase(),
        type,
        value: Number(value),
        min_order_value: Number(minOrderValue),
        max_discount: type === 'percentage' ? Number(maxDiscount) : null,
        is_active: true,
      });
      showToast('Coupon created successfully', 'success');
      setCode('');
      setModalOpen(false);
      loadCoupons();
    } catch (err: any) {
      showToast(err.message || 'Failed to create coupon', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this coupon code?')) return;
    try {
      await adminDeleteCoupon(id);
      showToast('Coupon deleted', 'success');
      loadCoupons();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete coupon', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--deep-navy)] flex items-center gap-2">
            <Ticket className="w-6 h-6 text-[var(--brand-orange)]" />
            Coupons & Discounts
          </h1>
          <p className="text-sm text-gray-500">
            Create promotional coupon codes with percentage or flat discounts
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> Create Coupon
        </Button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No active coupons found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-semibold text-gray-700">Code</th>
                  <th className="p-4 font-semibold text-gray-700">Discount</th>
                  <th className="p-4 font-semibold text-gray-700">Min Order</th>
                  <th className="p-4 font-semibold text-gray-700">Max Cap</th>
                  <th className="p-4 font-semibold text-gray-700">Usage</th>
                  <th className="p-4 font-semibold text-gray-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-mono font-bold text-[var(--brand-orange)]">
                      {c.code}
                    </td>
                    <td className="p-4 font-medium text-gray-700">
                      {c.type === 'percentage' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                    </td>
                    <td className="p-4 text-gray-600">₹{c.min_order_value || 0}</td>
                    <td className="p-4 text-gray-600">
                      {c.max_discount ? `₹${c.max_discount}` : 'No limit'}
                    </td>
                    <td className="p-4 text-gray-500">{c.used_count || 0} used</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                        title="Delete coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Coupon">
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <Input
            label="Coupon Code *"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. TOYFEST20"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="type"
                  checked={type === 'percentage'}
                  onChange={() => setType('percentage')}
                />
                Percentage (%)
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="type"
                  checked={type === 'flat'}
                  onChange={() => setType('flat')}
                />
                Flat Rupee Amount (₹)
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={`Value (${type === 'percentage' ? '%' : '₹'}) *`}
              type="number"
              value={value.toString()}
              onChange={(e) => setValue(Number(e.target.value))}
              required
            />
            <Input
              label="Min Order Amount (₹)"
              type="number"
              value={minOrderValue.toString()}
              onChange={(e) => setMinOrderValue(Number(e.target.value))}
            />
          </div>

          {type === 'percentage' && (
            <Input
              label="Maximum Discount Cap (₹)"
              type="number"
              value={maxDiscount.toString()}
              onChange={(e) => setMaxDiscount(Number(e.target.value))}
              placeholder="e.g. 200"
            />
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Save Coupon
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Coupons;
