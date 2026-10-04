import React, { useState, useEffect } from 'react';
import { adminGetCategories, adminCreateCategory, adminDeleteCategory } from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { Category } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Plus, Trash2, ListTree, Layers } from 'lucide-react';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(0);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await adminGetCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      await adminCreateCategory({
        name,
        description,
        display_order: Number(displayOrder) || 0,
      });
      showToast('Category created successfully', 'success');
      setName('');
      setDescription('');
      setDisplayOrder(0);
      setModalOpen(false);
      loadCategories();
    } catch (err: any) {
      showToast(err.message || 'Failed to create category', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await adminDeleteCategory(id);
      showToast('Category deleted', 'success');
      loadCategories();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete category', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--deep-navy)] flex items-center gap-2">
            <ListTree className="w-6 h-6 text-[var(--brand-orange)]" />
            Categories Management
          </h1>
          <p className="text-sm text-gray-500">
            Create and organize toy departments and subcategories
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add Category
        </Button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No categories found. Click Add Category above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-semibold text-gray-700">Name</th>
                  <th className="p-4 font-semibold text-gray-700">Slug</th>
                  <th className="p-4 font-semibold text-gray-700">Display Order</th>
                  <th className="p-4 font-semibold text-gray-700">Status</th>
                  <th className="p-4 font-semibold text-gray-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-medium text-[var(--deep-navy)] flex items-center gap-2">
                      <Layers className="w-4 h-4 text-gray-400" />
                      {cat.name}
                    </td>
                    <td className="p-4 text-gray-500 font-mono text-xs">{cat.slug}</td>
                    <td className="p-4 text-gray-600">{cat.display_order || 0}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 font-medium">
                        Active
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Delete category"
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

      {/* Add Category Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Category">
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <Input
            label="Category Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Remote Control Toys"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Overview of toys included in this category"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--brand-orange)] outline-none text-sm"
            />
          </div>
          <Input
            label="Display Order (lowest comes first)"
            type="number"
            value={displayOrder.toString()}
            onChange={(e) => setDisplayOrder(Number(e.target.value))}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Save Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Categories;
