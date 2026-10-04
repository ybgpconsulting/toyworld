import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Product } from '../../types';
import { Badge } from './Badge';
import { Button } from './Button';
import { useCartStore } from '../../stores/cartStore';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCartStore();
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const stock = product.stock ?? product.stock_quantity ?? 10;
  const isOutOfStock = stock <= 0;
  const price = product.price ?? product.selling_price ?? 0;
  const mrp = product.mrp ?? price;
  const discount = product.discountPercentage ?? product.discount_percentage ?? (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);
  const rating = product.rating ?? 4.8;
  const reviewCount = product.reviewCount ?? 15;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;

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
      className="group flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow relative"
    >
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {product.is_featured ? <Badge variant="orange">Featured</Badge> : null}
        {product.is_bestseller ? <Badge variant="green">Best Seller</Badge> : null}
        {product.is_new_arrival ? <Badge variant="blue">New</Badge> : null}
      </div>

      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-2 right-2 z-10 bg-[var(--brand-orange)] text-white text-[10px] font-bold px-2 py-1 rounded-full">
          {discount}% OFF
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <img
          src={primaryImage?.url || primaryImage?.image_url || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400'}
          alt={primaryImage?.alt || product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <div className="text-xs text-gray-500 mb-1">
          {product.brand_name || 'TOY WORLD'}
        </div>

        <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-2 flex-1">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-medium">{rating.toFixed(1)}</span>
          <span className="text-xs text-gray-400">({reviewCount})</span>
        </div>

        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-lg font-bold text-[var(--deep-navy)]">
              ₹{price.toLocaleString()}
            </div>
            {mrp > price && (
              <div className="text-xs text-gray-400 line-through">
                ₹{mrp.toLocaleString()}
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          size="sm"
          fullWidth
          className="mt-auto z-10"
        >
          {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
        </Button>
      </div>
    </Link>
  );
};

export { ProductCardSkeleton } from './SkeletonLoader';
export default ProductCard;
