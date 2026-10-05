import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { Badge } from './Badge';
import { Button } from './Button';
import { useCartStore } from '../../stores/cartStore';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCartStore();
  const navigate = useNavigate();
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const stock = product.stock ?? product.stock_quantity ?? 10;
  const hasVariants = Number(product.variant_count || product.variants?.length || 0) > 0;
  const isOutOfStock = hasVariants
    ? Number(product.available_variant_count || 0) <= 0
    : stock <= 0;
  const price = product.price ?? product.selling_price ?? 0;
  const mrp = product.mrp ?? price;
  const discount = product.discountPercentage ?? product.discount_percentage ?? (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);
  const rating = product.rating ?? 4.8;
  const reviewCount = product.reviewCount ?? 15;
  const ageGroup = product.ageGroup || product.age_group;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    if (hasVariants) {
      navigate(`/product/${product.slug}`);
      return;
    }

    addItem({
      id: String(product.id),
      productId: String(product.id),
      name: product.name,
      price: price,
      quantity: 1,
      imageUrl: primaryImage?.url || primaryImage?.image_url || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400',
    });
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group flex flex-col bg-white border border-orange-100/80 rounded-2xl overflow-hidden hover:border-[var(--brand-orange)] hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative"
    >
      {/* Top Left Badges */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
        {product.is_featured ? <Badge variant="orange">Featured</Badge> : null}
        {product.is_bestseller ? <Badge variant="green">Best Seller</Badge> : null}
        {product.is_new_arrival ? <Badge variant="blue">New</Badge> : null}
        {ageGroup ? (
          <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs">
            {ageGroup} Yrs
          </span>
        ) : null}
      </div>

      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-2.5 right-2.5 z-10 bg-gradient-to-r from-red-500 to-[var(--brand-orange)] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
          {discount}% OFF
        </div>
      )}

      {/* Image container */}
      <div className="relative aspect-square bg-gradient-to-b from-orange-50/40 to-white overflow-hidden p-2">
        <img
          src={primaryImage?.url || primaryImage?.image_url || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400'}
          alt={primaryImage?.alt || product.name}
          loading="lazy"
          className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-1">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span className="font-semibold text-[var(--brand-orange)] uppercase tracking-wider text-[10px]">
            {product.brand_name || product.category_name || 'TOY WORLD'}
          </span>
          <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded text-[11px]">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="font-bold text-gray-800">{rating.toFixed(1)}</span>
            <span className="text-gray-400 text-[10px]">({reviewCount})</span>
          </div>
        </div>

        <h3 className="font-bold text-sm text-gray-900 line-clamp-2 mb-2 flex-1 group-hover:text-[var(--brand-orange)] transition-colors">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-black text-[var(--deep-navy)]">
            ₹{price.toLocaleString()}
          </span>
          {mrp > price && (
            <span className="text-xs text-gray-400 line-through">
              ₹{mrp.toLocaleString()}
            </span>
          )}
          {mrp > price && (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              Save ₹{(mrp - price).toLocaleString()}
            </span>
          )}
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          size="sm"
          fullWidth
          className="mt-auto z-10 flex items-center justify-center gap-1.5 bg-[var(--brand-orange)] hover:bg-orange-600 text-white font-bold rounded-xl shadow-sm group-hover:shadow-md transition-all"
        >
          {isOutOfStock ? (
            'Sold Out'
          ) : hasVariants ? (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Options</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </>
          )}
        </Button>
      </div>
    </Link>
  );
};

export { ProductCardSkeleton } from './SkeletonLoader';
export default ProductCard;
