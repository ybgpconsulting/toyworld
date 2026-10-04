import React from 'react';
import { ProductVariant } from '../../types';
import clsx from 'clsx';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariantId?: string | number;
  onSelect: (variant: ProductVariant) => void;
}

export const VariantSelector = ({ variants, selectedVariantId, onSelect }: VariantSelectorProps) => {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Available Options / Variants</h3>
      <div className="flex flex-wrap gap-3">
        {variants.map((variant) => {
          const isSelected = variant.id === selectedVariantId;
          const stock = variant.stock ?? variant.stock_quantity ?? 10;
          const isOutOfStock = stock <= 0;

          return (
            <button
              key={variant.id || variant.name}
              type="button"
              onClick={() => !isOutOfStock && onSelect(variant)}
              disabled={isOutOfStock}
              className={clsx(
                'px-4 py-2 border rounded-xl text-sm font-medium transition-colors',
                isSelected
                  ? 'border-[var(--brand-orange)] text-[var(--brand-orange)] bg-orange-50 ring-1 ring-[var(--brand-orange)]'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white',
                isOutOfStock && 'opacity-50 cursor-not-allowed bg-gray-50 line-through text-gray-400'
              )}
            >
              {variant.name}
              {variant.selling_price && ` (₹${variant.selling_price})`}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default VariantSelector;
