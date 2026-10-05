import React, { useState, useEffect } from 'react';
import { adminGetShippingRules, adminCreateShippingRule, adminDeleteShippingRule } from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import type { ShippingRule } from '../../types';
import { INDIAN_STATES } from '../../lib/constants';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Truck, Plus, Trash2, ShieldCheck } from 'lucide-react';

const Shipping: React.FC = () => {
  const [rules, setRules] = useState<ShippingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  // Form State
  const [ruleType, setRuleType] = useState<'flat_rate' | 'free_threshold' | 'state' | 'pincode'>('state');
  const [name, setName] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincodePrefix, setPincodePrefix] = useState('');
  const [shippingAmount, setShippingAmount] = useState<number>(79);
  const [minOrderValue, setMinOrderValue] = useState<number>(0);

  const loadRules = async () => {
    try {
      setLoading(true);
      const data = await adminGetShippingRules();
      setRules(Array.isArray(data) ? data : []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load shipping rules', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await adminCreateShippingRule({
        rule_type: ruleType,
        name: name || (ruleType === 'state'
          ? `${stateName} Delivery`
          : ruleType === 'pincode'
            ? `${pincodePrefix} Pincode Delivery`
            : 'Shipping Rule'),
        state_name: ruleType === 'state' ? stateName : null,
        pincode_prefix: ruleType === 'pincode' ? pincodePrefix : null,
        shipping_amount: ruleType === 'free_threshold' ? 0 : Number(shippingAmount),
        min_order_value: Number(minOrderValue),
        is_free: ruleType === 'free_threshold',
        is_active: true,
        priority: ruleType === 'pincode' ? 20 : ruleType === 'free_threshold' ? 100 : ruleType === 'state' ? 10 : 1,
      });

      showToast('Shipping rule created successfully', 'success');
      setName('');
      setModalOpen(false);
      loadRules();
    } catch (err: any) {
      showToast(err.message || 'Failed to create rule', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!window.confirm('Delete this shipping rule?')) return;

    try {
      await adminDeleteShippingRule(id);
      showToast('Shipping rule deleted', 'success');
      loadRules();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete rule', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--deep-navy)] flex items-center gap-2">
            <Truck className="w-6 h-6 text-[var(--brand-orange)]" />
            Pan-India Shipping Configuration
          </h1>
          <p className="text-sm text-gray-500">
            Configure state delivery rates, flat shipping, and free delivery thresholds
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add Shipping Rule
        </Button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading shipping rules...</div>
        ) : rules.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No custom shipping rules configured.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-semibold text-gray-700">Rule Name</th>
                  <th className="p-4 font-semibold text-gray-700">Type</th>
                  <th className="p-4 font-semibold text-gray-700">State / Region</th>
                  <th className="p-4 font-semibold text-gray-700">Charge</th>
                  <th className="p-4 font-semibold text-gray-700">Min Order for Free</th>
                  <th className="p-4 font-semibold text-gray-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rules.map((rule: any) => (
                  <tr key={rule.id} className="hover:bg-gray-50/50">

                    <td className="p-4 font-medium text-[var(--deep-navy)]">
                      {rule.name}
                    </td>
                    <td className="p-4 text-xs font-semibold uppercase text-gray-500">
                      {rule.rule_type?.replace(/_/g, ' ')}
                    </td>
                    <td className="p-4 text-gray-700">
                      {rule.state_name || (rule.pincode_prefix ? `PIN ${rule.pincode_prefix}*` : 'All India')}
                    </td>
                    <td className="p-4 font-bold text-[var(--deep-navy)]">
                      {rule.is_free || rule.shipping_amount === 0 ? (
                        <span className="text-green-600 font-semibold">FREE</span>
                      ) : (
                        `₹${rule.shipping_amount}`
                      )}
                    </td>
                    <td className="p-4 text-gray-600">
                      {rule.min_order_value ? `₹${rule.min_order_value}` : 'Any'}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                        title="Delete rule"
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

      {/* Add Shipping Rule Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Shipping Rule">
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rule Type</label>
            <select
              value={ruleType}
              onChange={(e) => setRuleType(e.target.value as 'state' | 'pincode' | 'free_threshold' | 'flat_rate')}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--brand-orange)] outline-none text-sm"
            >
              <option value="state">State-wise Shipping</option>
              <option value="pincode">Pincode-prefix Shipping</option>
              <option value="free_threshold">Free Delivery Threshold</option>
              <option value="flat_rate">All-India Flat Rate</option>
            </select>
          </div>

          <Input
            label="Rule Label *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Free Delivery on ₹999+ / Delhi Express"
            required
          />

          {ruleType === 'state' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select State *</label>
              <select
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--brand-orange)] outline-none text-sm"
              >
                <option value="">Select Indian State / UT</option>
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          )}

          {ruleType === 'pincode' && (
            <Input
              label="Pincode Prefix *"
              value={pincodePrefix}
              onChange={(event) => setPincodePrefix(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="e.g. 125 or 125001"
              maxLength={6}
              inputMode="numeric"
              required
            />
          )}

          {ruleType !== 'free_threshold' && (
            <Input
              label="Shipping Amount (₹) *"
              type="number"
              value={shippingAmount.toString()}
              onChange={(e) => setShippingAmount(Number(e.target.value))}
              required
            />
          )}

          <Input
            label="Minimum Order Amount (₹)"
            type="number"
            value={minOrderValue.toString()}
            onChange={(e) => setMinOrderValue(Number(e.target.value))}
            placeholder={ruleType === 'free_threshold' ? '999' : '0'}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Save Shipping Rule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Shipping;
