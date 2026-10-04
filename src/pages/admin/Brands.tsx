import React, { useState, useEffect } from 'react';
import { adminGetBrands } from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { Brand } from '../../types';
import Button from '../../components/ui/Button';
import { Tags, ShieldCheck } from 'lucide-react';

const Brands: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadBrands = async () => {
    try {
      setLoading(true);
      const data = await adminGetBrands();
      setBrands(Array.isArray(data) ? data : []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load brands', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--deep-navy)] flex items-center gap-2">
            <Tags className="w-6 h-6 text-[var(--brand-orange)]" />
            Toy Brands & Partners
          </h1>
          <p className="text-sm text-gray-500">
            Manage genuine licensed toy manufacturers and brands
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading brands...</div>
        ) : brands.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No brands found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-semibold text-gray-700">Brand Name</th>
                  <th className="p-4 font-semibold text-gray-700">Slug</th>
                  <th className="p-4 font-semibold text-gray-700">Order</th>
                  <th className="p-4 font-semibold text-gray-700">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {brands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-bold text-[var(--deep-navy)]">
                      {brand.name}
                    </td>
                    <td className="p-4 text-gray-500 font-mono text-xs">{brand.slug}</td>
                    <td className="p-4 text-gray-600">{brand.display_order || 0}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" /> 100% Genuine
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Brands;
