import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  adminCreateProduct, 
  adminUpdateProduct, 
  adminGetProduct, 
  adminGetCategories, 
  adminGetBrands, 
  adminUpload 
} from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import type { Category, Brand } from '../../types';
import Button from '../../components/ui/Button';

import Input from '../../components/ui/Input';
import { ArrowLeft, Plus, Trash2, Upload, Star } from 'lucide-react';

interface VariantRow {
  name: string;
  sku: string;
  mrp: number;
  selling_price: number;
  stock_quantity: number;
}

const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [brandId, setBrandId] = useState<number | ''>('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [ageGroup, setAgeGroup] = useState('3-8');
  const [material, setMaterial] = useState('');
  const [mrp, setMrp] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);

  // Flags
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isOffer, setIsOffer] = useState(false);

  // Variants & Images
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    adminGetCategories().then((cats) => setCategories(cats || [])).catch(() => {});
    adminGetBrands().then((brs) => setBrands(brs || [])).catch(() => {});

    if (id) {
      adminGetProduct(id)
        .then((prod: any) => {
          setName(prod.name || '');

          setSku(prod.sku || '');
          setCategoryId(prod.category_id || '');
          setBrandId(prod.brand_id || '');
          setShortDescription(prod.short_description || '');
          setDescription(prod.description || '');
          setAgeGroup(prod.age_group || '3-8');
          setMaterial(prod.material || '');
          setMrp(prod.mrp || 0);
          setSellingPrice(prod.selling_price || 0);
          setStockQuantity(prod.stock_quantity || 0);
          setLowStockThreshold(prod.low_stock_threshold || 5);
          setIsActive(Boolean(prod.is_active));
          setIsFeatured(Boolean(prod.is_featured));
          setIsBestseller(Boolean(prod.is_bestseller));
          setIsNewArrival(Boolean(prod.is_new_arrival));
          setIsOffer(Boolean(prod.is_offer));
          if (prod.variants && prod.variants.length > 0) {
            setVariants(prod.variants);
          }
          if (prod.images && prod.images.length > 0) {
            setImageUrl(prod.images[0].image_url || '');
          }
        })
        .catch((err) => {
          showToast('Failed to load product details', 'error');
        })
        .finally(() => setFetching(false));
    }
  }, [id, showToast]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const res = await adminUpload(file);
      setImageUrl(res.url);
      showToast('Image uploaded successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Image upload failed', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        name: 'Variant ' + (variants.length + 1),
        sku: `${sku || 'SKU'}-V${variants.length + 1}`,
        mrp: mrp || 0,
        selling_price: sellingPrice || 0,
        stock_quantity: 5,
      },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof VariantRow, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Product name is required', 'error');
      return;
    }

    try {
      setLoading(true);
      const discount = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

      const payload = {
        name,
        sku: sku || undefined,
        category_id: categoryId ? Number(categoryId) : null,
        brand_id: brandId ? Number(brandId) : null,
        short_description: shortDescription,
        description,
        age_group: ageGroup,
        material,
        mrp: Number(mrp) || 0,
        selling_price: Number(sellingPrice) || 0,
        discount_percentage: discount,
        stock_quantity: Number(stockQuantity) || 0,
        low_stock_threshold: Number(lowStockThreshold) || 5,
        is_active: isActive,
        is_featured: isFeatured,
        is_bestseller: isBestseller,
        is_new_arrival: isNewArrival,
        is_offer: isOffer,
        variants,
      };

      if (isEdit && id) {
        await adminUpdateProduct(id, payload);
        showToast('Product updated successfully', 'success');
      } else {
        await adminCreateProduct(payload);
        showToast('Product created successfully', 'success');
      }

      navigate('/admin/products');
    } catch (err: any) {
      showToast(err.message || 'Failed to save product', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-8 text-center text-gray-500">Loading product...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/products')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <h1 className="text-2xl font-bold text-[var(--deep-navy)]">
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border shadow-sm">
        {/* Basic Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Product Title *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Remote Control 360 Stunt Car"
              required
            />
          </div>

          <Input
            label="SKU / Barcode"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="e.g. TW-RC-001"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--brand-orange)] outline-none"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--brand-orange)] outline-none"
            >
              <option value="">Select Brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--brand-orange)] outline-none"
            >
              <option value="0-2">0 - 2 Years</option>
              <option value="3-5">3 - 5 Years</option>
              <option value="6-8">6 - 8 Years</option>
              <option value="8-12">8 - 12 Years</option>
              <option value="12+">12+ Years</option>
              <option value="All Ages">All Ages</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <Input
              label="Short Description"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Brief overview highlighted on product card"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed specifications, safety guidance, pack contents..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--brand-orange)] outline-none"
            />
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="border-t pt-4">
          <h2 className="text-lg font-semibold text-[var(--deep-navy)] mb-4">Pricing & Inventory</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input
              label="MRP (₹) *"
              type="number"
              value={mrp.toString()}
              onChange={(e) => setMrp(Number(e.target.value))}
              required
            />
            <Input
              label="Selling Price (₹) *"
              type="number"
              value={sellingPrice.toString()}
              onChange={(e) => setSellingPrice(Number(e.target.value))}
              required
            />
            <Input
              label="Stock Quantity *"
              type="number"
              value={stockQuantity.toString()}
              onChange={(e) => setStockQuantity(Number(e.target.value))}
              required
            />
            <Input
              label="Low Stock Alert"
              type="number"
              value={lowStockThreshold.toString()}
              onChange={(e) => setLowStockThreshold(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Media / Image Upload */}
        <div className="border-t pt-4">
          <h2 className="text-lg font-semibold text-[var(--deep-navy)] mb-4">Product Image</h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Product preview"
                className="w-32 h-32 object-cover rounded-lg border shadow-sm"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-100 rounded-lg border flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
            <div className="space-y-2">
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer text-sm font-medium transition-colors">
                <Upload className="w-4 h-4" />
                {uploadingImage ? 'Uploading...' : 'Upload Image to R2'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500">Supports JPG, PNG, WEBP up to 10MB.</p>
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--deep-navy)]">Product Variants</h2>
              <p className="text-xs text-gray-500">Colours, pack sizes, models with individual pricing & stock</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addVariant}>
              <Plus className="w-4 h-4 mr-1" /> Add Variant
            </Button>
          </div>

          {variants.length > 0 ? (
            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div key={idx} className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                  <div className="flex-1 min-w-[140px]">
                    <input
                      type="text"
                      placeholder="Variant (e.g. Red, 500g)"
                      value={v.name}
                      onChange={(e) => updateVariant(idx, 'name', e.target.value)}
                      className="w-full text-sm px-2 py-1.5 border rounded bg-white"
                    />
                  </div>
                  <div className="w-28">
                    <input
                      type="text"
                      placeholder="SKU"
                      value={v.sku}
                      onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                      className="w-full text-sm px-2 py-1.5 border rounded bg-white"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      placeholder="Price"
                      value={v.selling_price}
                      onChange={(e) => updateVariant(idx, 'selling_price', Number(e.target.value))}
                      className="w-full text-sm px-2 py-1.5 border rounded bg-white"
                    />
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      placeholder="Stock"
                      value={v.stock_quantity}
                      onChange={(e) => updateVariant(idx, 'stock_quantity', Number(e.target.value))}
                      className="w-full text-sm px-2 py-1.5 border rounded bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No variants added. Using standard single product pricing.</p>
          )}
        </div>

        {/* Visibility Flags */}
        <div className="border-t pt-4">
          <h2 className="text-lg font-semibold text-[var(--deep-navy)] mb-4">Badges & Visibility</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-[var(--brand-orange)] rounded focus:ring-0"
              />
              <span className="text-sm text-gray-700 font-medium">Published / Active</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-[var(--brand-orange)] rounded focus:ring-0"
              />
              <span className="text-sm text-gray-700 font-medium">Featured Item</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isBestseller}
                onChange={(e) => setIsBestseller(e.target.checked)}
                className="w-4 h-4 text-[var(--brand-orange)] rounded focus:ring-0"
              />
              <span className="text-sm text-gray-700 font-medium">Best Seller</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="w-4 h-4 text-[var(--brand-orange)] rounded focus:ring-0"
              />
              <span className="text-sm text-gray-700 font-medium">New Arrival</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isOffer}
                onChange={(e) => setIsOffer(e.target.checked)}
                className="w-4 h-4 text-[var(--brand-orange)] rounded focus:ring-0"
              />
              <span className="text-sm text-gray-700 font-medium">Special Offer</span>
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="border-t pt-6 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {isEdit ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
