import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProductBySlug } from '../lib/api';
import { ProductGallery } from '../components/product/ProductGallery';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProductDetailSkeleton } from '../components/ui/SkeletonLoader';
import { useCartStore } from '../stores/cartStore';
import { Star, Truck, ShieldCheck, Share2, Plus, Minus, MessageCircle } from 'lucide-react';
import { WHATSAPP_URL } from '../lib/constants';

const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProductBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) return <ProductDetailSkeleton />;
  if (error || !product) return <div className="text-center py-20 text-red-500">Product not found.</div>;

  const stock = (product as any).stock ?? (product as any).stock_quantity ?? 10;
  const price = (product as any).price ?? (product as any).selling_price ?? 0;
  const isOutOfStock = stock <= 0;
  
  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const imgUrl = product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url || (product.images?.[0] as any)?.image_url || '';
    addItem({
      id: String(product.id),
      productId: String(product.id),
      name: product.name,
      price: price,
      quantity,
      imageUrl: imgUrl,
    });
  };

  const whatsappMessage = encodeURIComponent(`Hi, I'm interested in buying: ${product.name} (SKU: ${product.sku || product.id})\nLink: ${window.location.href}`);

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
          
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
                  ₹{product.price.toLocaleString()}
                </span>
                {product.mrp > product.price && (
                  <>
                    <span className="text-lg text-gray-400 line-through mb-1">
                      ₹{product.mrp.toLocaleString()}
                    </span>
                    <Badge variant="orange" className="mb-1 text-sm py-1">
                      {product.discountPercentage}% OFF
                    </Badge>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500">Inclusive of all taxes</p>
            </div>

            {/* Status */}
            <div className="mb-6">
              {isOutOfStock ? (
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
                disabled={isOutOfStock}
                className="py-4 text-lg"
              >
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
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
          disabled={isOutOfStock}
        >
          {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
        </Button>
      </div>
    </div>
  );
};

export default ProductDetailPage;
