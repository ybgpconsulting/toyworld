import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProductBySlug, getFeaturedProducts } from '../lib/api';
import { ProductGallery } from '../components/product/ProductGallery';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProductCard } from '../components/ui/ProductCard';
import { ProductDetailSkeleton } from '../components/ui/SkeletonLoader';
import { useCartStore } from '../stores/cartStore';
import { Star, Truck, ShieldCheck, Share2, Plus, Minus, MessageCircle } from 'lucide-react';
import { WHATSAPP_URL } from '../lib/constants';

const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const { addItem } = useCartStore();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProductBySlug(slug!),
    enabled: !!slug,
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ['related-products', product?.category_id],
    queryFn: getFeaturedProducts,
  });

  if (isLoading) return <ProductDetailSkeleton />;
  if (error || !product) return <div className="text-center py-20 text-red-500">Product not found.</div>;

  const availableVariants = (product.variants || []).filter((variant) => Number(variant.is_available ?? 1) === 1);
  const hasVariants = (product.variants?.length ?? 0) > 0;
  const selectedVariant = availableVariants.find((variant) => String(variant.id) === selectedVariantId);
  const stock = hasVariants
    ? Number(selectedVariant?.stock_quantity ?? selectedVariant?.stock ?? 0)
    : Number(product.stock ?? product.stock_quantity ?? 0);
  const price = Number(selectedVariant?.selling_price ?? selectedVariant?.price ?? product.price ?? product.selling_price ?? 0);
  const mrp = Number(selectedVariant?.mrp ?? product.mrp ?? price);
  const isVariantSelectionRequired = hasVariants && !selectedVariant;
  const isOutOfStock = stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock || isVariantSelectionRequired) return;
    const imgUrl = selectedVariant?.image_url || product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url || (product.images?.[0] as any)?.image_url || '';
    addItem({
      id: `${product.id}:${selectedVariant?.id ?? 'base'}`,
      productId: String(product.id),
      variantId: selectedVariant?.id,
      name: product.name,
      price: price,
      quantity,
      imageUrl: imgUrl,
      variantName: selectedVariant
        ? [selectedVariant.variant_type, selectedVariant.variant_value || selectedVariant.name].filter(Boolean).join(': ')
        : undefined,
    });
  };

  const whatsappMessage = encodeURIComponent(`Hi, I'm interested in buying: ${product.name}${selectedVariant ? `\nOption: ${selectedVariant.variant_type || 'Variant'} - ${selectedVariant.variant_value || selectedVariant.name}` : ''} (SKU: ${selectedVariant?.sku || product.sku || product.id})\nLink: ${window.location.href}`);

  return (
    <div className="bg-toy-pattern min-h-screen py-6 md:py-10">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-orange-100 flex flex-col md:flex-row gap-8 lg:gap-16">

          {/* Left: Gallery */}
          <div className="w-full md:w-1/2">
            <ProductGallery images={product.images || []} />
          </div>

          {/* Right: Info */}
          <div className="w-full md:w-1/2 flex flex-col">

            <div className="mb-2">
              <span className="text-sm font-semibold text-[var(--brand-orange)] uppercase tracking-wider">
                {product.ageGroup || (product as any).age_group || 'All Ages'}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-[var(--deep-navy)] mb-2">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-4 pb-4 border-b">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-bold">{(product.rating ?? 4.8).toFixed(1)}</span>
                <span className="text-gray-500 underline text-sm cursor-pointer">({product.reviewCount ?? 15} Reviews)</span>
              </div>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-500">SKU: {product.sku || String(product.id).substring(0, 8)}</span>
            </div>


            {/* Price */}
            <div className="mb-6">
              <div className="flex items-end gap-3 mb-1">
                <span className="text-3xl font-bold text-[var(--deep-navy)]">
                  ₹{price.toLocaleString()}
                </span>
                {mrp > price && (
                  <>
                    <span className="text-lg text-gray-400 line-through mb-1">
                      ₹{mrp.toLocaleString()}
                    </span>
                    <Badge variant="orange" className="mb-1 text-sm py-1">
                      {Math.round(((mrp - price) / mrp) * 100)}% OFF
                    </Badge>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500">Inclusive of all taxes</p>
            </div>

            {hasVariants && (
              <div className="mb-6">
                <label htmlFor="product-variant" className="mb-2 block text-sm font-medium text-gray-700">
                  Choose {availableVariants[0]?.variant_type || 'Option'} *
                </label>
                <select
                  id="product-variant"
                  value={selectedVariantId}
                  onChange={(event) => {
                    setSelectedVariantId(event.target.value);
                    setQuantity(1);
                  }}
                  className="min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm focus:border-[var(--brand-orange)] focus:outline-none"
                >
                  <option value="">Select an option</option>
                  {availableVariants.map((variant) => {
                    const variantStock = Number(variant.stock_quantity ?? variant.stock ?? 0);
                    const variantLabel = [variant.variant_type, variant.variant_value || variant.name].filter(Boolean).join(': ');
                    return (
                      <option key={variant.id} value={String(variant.id)} disabled={variantStock <= 0}>
                        {variantLabel}{variantStock <= 0 ? ' — Out of stock' : ` — ${variantStock} available`}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Status */}
            <div className="mb-6">
              {isVariantSelectionRequired ? (
                <span className="text-amber-700 font-medium">Choose an option to check availability.</span>
              ) : isOutOfStock ? (
                <span className="text-red-600 font-bold flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-600"></div> Out of Stock
                </span>
              ) : (
                <span className="text-green-600 font-bold flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-600"></div> In Stock
                </span>
              )}
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <span className="block text-sm font-medium text-gray-700 mb-2">Quantity</span>
              <div className="flex items-center w-max border-2 border-gray-200 rounded-xl bg-white">
                <button
                  type="button"
                  className="p-3 hover:bg-gray-50 disabled:opacity-50 text-gray-600"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                <button
                  type="button"
                  className="p-3 hover:bg-gray-50 disabled:opacity-50 text-gray-600"
                  onClick={() => setQuantity(q => q + 1)}
                  disabled={isOutOfStock || quantity >= stock}
                >

                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions (Desktop) */}
            <div className="hidden md:flex gap-4 mb-8">
              <Button
                size="lg"
                fullWidth
                onClick={handleAddToCart}
                disabled={isOutOfStock || isVariantSelectionRequired}
                className="py-4 text-lg"
              >
                {isVariantSelectionRequired ? 'Choose an Option' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </div>

            {/* Info Badges */}
            <div className="grid grid-cols-2 gap-4 py-6 border-y mb-8">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Truck className="w-5 h-5 text-[var(--brand-orange)]" />
                <span>Pan India Delivery</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                <span>100% Genuine Toy</span>
              </div>
            </div>

            {/* Description */}
            <div className="prose prose-sm max-w-none text-gray-700">
              <h3 className="text-lg font-bold text-[var(--deep-navy)] mb-2">Description</h3>
              <p>{product.description}</p>
            </div>

            {/* WhatsApp Share */}
            <div className="mt-8">
              <a
                href={`https://wa.me/?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-[#25D366] hover:underline font-medium"
              >
                <Share2 className="w-4 h-4" /> Share on WhatsApp
              </a>
            </div>

          </div>
        </div>

        {/* Similar Toys You May Like */}
        <div className="mt-16 pt-12 border-t border-orange-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-xs font-bold text-[var(--brand-orange)] uppercase tracking-wider">More Fun</div>
              <h2 className="text-2xl font-black text-[var(--deep-navy)]">Similar Toys You Might Love</h2>
            </div>
            <a href="/shop" className="text-sm font-bold text-[var(--brand-orange)] hover:underline">
              View All Toys
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(relatedProducts || []).slice(0, 4).map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-40 safe-pb flex gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <Button
          variant="outline"
          className="flex-shrink-0 !p-3 border-gray-300"
          onClick={() => window.open(`${WHATSAPP_URL}?text=${whatsappMessage}`, '_blank')}
        >
          <MessageCircle className="w-6 h-6 text-[#25D366]" />
        </Button>
        <Button
          fullWidth
          size="lg"
          onClick={handleAddToCart}
          disabled={isOutOfStock || isVariantSelectionRequired}
        >
          {isVariantSelectionRequired ? 'Choose Option' : isOutOfStock ? 'Sold Out' : 'Add to Cart'}
        </Button>
      </div>
    </div>
  );
};

export default ProductDetailPage;
