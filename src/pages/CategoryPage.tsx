import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProducts, getCategoryBySlug } from '../lib/api';
import type { FilterState, SortOption } from '../types';
import { ProductCard, ProductCardSkeleton } from '../components/ui/ProductCard';

import { FilterPanel } from '../components/filters/FilterPanel';
import { BottomSheet } from '../components/ui/BottomSheet';
import { Pagination } from '../components/ui/Pagination';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { SORT_OPTIONS } from '../lib/constants';

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortOption>('newest');
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    brands: [],
    ageGroups: [],
    inStockOnly: false
  });

  const { data: category, isLoading: catLoading } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => getCategoryBySlug(slug!),
    enabled: !!slug
  });

  const { data: productsData, isLoading: prodLoading } = useQuery({
    queryKey: ['products', slug, filters, sort, page],
    queryFn: () => getProducts({ ...filters, categories: slug ? [slug] : [], sort, page }),
  });

  if (catLoading) return <div className="animate-pulse h-40 bg-gray-200"></div>;
  if (!category && slug) return <div className="text-center py-20">Category not found.</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Category Header */}
      <div className="bg-gradient-to-r from-[var(--deep-navy)] to-gray-800 text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{category?.name || 'All Toys'}</h1>
          {category?.description && <p className="text-gray-300 max-w-2xl mx-auto">{category.description}</p>}
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl py-8">
        
        {/* Controls Bar */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm mb-6">
          <span className="text-sm text-gray-500 font-medium">
            {productsData?.total || 0} Products Found
          </span>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 md:hidden"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filter
            </button>
            
            <div className="relative hidden md:flex items-center gap-2 border rounded-lg px-4 py-2">
              <ArrowUpDown className="w-4 h-4 text-gray-500" />
              <select 
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="bg-transparent text-sm font-medium focus:outline-none appearance-none pr-4"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Desktop Sidebar */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white p-6 rounded-xl shadow-sm sticky top-24">
              <FilterPanel filters={filters} setFilters={setFilters} />
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {prodLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : productsData?.data.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your filters or search criteria.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {productsData?.data.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {productsData && (productsData.totalPages ?? 1) > 1 && (
                  <Pagination 
                    currentPage={productsData.page ?? 1} 
                    totalPages={productsData.totalPages ?? 1}
                    onPageChange={setPage} 
                  />
                )}

              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter BottomSheet */}
      <BottomSheet isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filters">
        <FilterPanel filters={filters} setFilters={setFilters} onClose={() => setIsFilterOpen(false)} />
      </BottomSheet>
    </div>
  );
};

export default CategoryPage;
