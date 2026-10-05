import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProducts, getCategoryBySlug } from '../lib/api';
import type { FilterState, SortOption } from '../types';
import { ProductCard, ProductCardSkeleton } from '../components/ui/ProductCard';
import { Button } from '../components/ui/Button';
import { FilterPanel } from '../components/filters/FilterPanel';
import { BottomSheet } from '../components/ui/BottomSheet';
import { Pagination } from '../components/ui/Pagination';
import { SlidersHorizontal, ArrowUpDown, Sparkles, ChevronRight, Home } from 'lucide-react';
import { SORT_OPTIONS } from '../lib/constants';
import { MOCK_CATEGORIES } from '../lib/mockData';

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

  const currentCategory = category || MOCK_CATEGORIES.find(c => c.slug === slug);

  return (
    <div className="bg-toy-pattern min-h-screen pb-16">

      {/* Category Hero Header with Toys Doodles */}
      <div className="relative bg-gradient-to-r from-[var(--deep-navy)] via-[#281b4d] to-[var(--deep-navy)] text-white py-12 md:py-16 px-4 overflow-hidden border-b border-orange-500/20">
        <div className="absolute inset-0 bg-toy-doodles-dark opacity-20 pointer-events-none" />

        <div className="relative z-10 container mx-auto max-w-6xl text-center space-y-4">

          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-400">
            <Link to="/" className="hover:text-white flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <Link to="/shop" className="hover:text-white">Shop</Link>
            {currentCategory && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                <span className="text-yellow-300 font-bold">{currentCategory.name}</span>
              </>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white flex items-center justify-center gap-3">
            <span>{currentCategory?.name || 'All Toys & Play Sets'}</span>
          </h1>

          <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            {currentCategory?.description || 'Browse our handpicked collection of 100% genuine toys certified safe for children across India.'}
          </p>

          {/* Quick Category Jump Bar */}
          <div className="pt-4 flex items-center justify-center gap-2 overflow-x-auto no-scrollbar max-w-4xl mx-auto px-2">
            <Link
              to="/shop"
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                !slug
                  ? 'bg-[var(--brand-orange)] text-white shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-gray-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>All Toys</span>
            </Link>
            {MOCK_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                  slug === cat.slug
                    ? 'bg-[var(--brand-orange)] text-white shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-gray-200'
                }`}
              >
                <span>{cat.icon || '🎁'}</span>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>

        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl py-8">

        {/* Controls Bar */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-orange-100 mb-6">
          <span className="text-sm text-gray-600 font-bold">
            Showing <span className="text-[var(--brand-orange)]">{productsData?.total || 0}</span> Toys
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-orange-50 md:hidden"
            >
              <SlidersHorizontal className="w-4 h-4 text-[var(--brand-orange)]" /> Filter
            </button>

            <div className="relative hidden md:flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2 bg-white">
              <ArrowUpDown className="w-4 h-4 text-gray-400" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="bg-transparent text-sm font-bold text-gray-700 focus:outline-none appearance-none pr-4 cursor-pointer"
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
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 sticky top-24">
              <FilterPanel filters={filters} setFilters={setFilters} />
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {prodLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : productsData?.data.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-orange-100 space-y-3">
                <span className="text-4xl">🧸</span>
                <h3 className="text-xl font-bold text-gray-900">No toys found in this category</h3>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                  Try clearing your filters or check out our full collection of toys.
                </p>
                <Link to="/shop">
                  <Button className="mt-2 bg-[var(--brand-orange)] text-white font-bold rounded-xl">
                    View All Toys
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                  {productsData?.data.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {Boolean(productsData?.totalPages && productsData.totalPages > 1) && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      currentPage={page}
                      totalPages={productsData?.totalPages ?? 1}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters BottomSheet */}
      <BottomSheet isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filter Toys">
        <div className="p-4">
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            onClose={() => setIsFilterOpen(false)}
          />
        </div>
      </BottomSheet>
    </div>
  );
};

export default CategoryPage;
