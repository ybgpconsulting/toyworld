import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { search, getFeaturedProducts } from '../lib/api';
import { ProductCard, ProductCardSkeleton } from '../components/ui/ProductCard';
import { useDebounce } from '../hooks/useDebounce';
import { Search as SearchIcon, Sparkles } from 'lucide-react';
import { MOCK_PRODUCTS } from '../lib/mockData';

const POPULAR_SEARCHES = [
  'RC Cars',
  'LEGO Bricks',
  'Barbie Princess',
  'STEM Solar Robot',
  'Teddy Bear',
  'Hot Wheels',
  'Monopoly Board Game',
  'Nerf Blaster',
  'Magnetic Tiles',
  'Play-Doh Kitchen'
];

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery !== searchParams.get('q')) {
      setSearchParams(debouncedQuery ? { q: debouncedQuery } : {});
    }
  }, [debouncedQuery, setSearchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => search(debouncedQuery),
    enabled: debouncedQuery.length > 1,
  });

  const { data: featuredProducts } = useQuery({
    queryKey: ['featured-products'],
    queryFn: getFeaturedProducts,
  });

  return (
    <div className="bg-toy-pattern min-h-screen py-8 pb-20">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">

        {/* Search Header with Toy Doodles */}
        <div className="relative bg-gradient-to-r from-[var(--deep-navy)] via-[#271b4a] to-[var(--deep-navy)] rounded-3xl p-8 md:p-12 text-center text-white shadow-xl overflow-hidden border border-orange-500/20">
          <div className="absolute inset-0 bg-toy-doodles-dark opacity-20 pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full text-xs font-bold text-yellow-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Magical Toy Search</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white">
              Find Your Child’s Next Favorite Toy
            </h1>

            <div className="relative pt-2">
              <SearchIcon className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--brand-orange)]" />
              <input
                type="text"
                autoFocus
                placeholder="Search RC cars, LEGO blocks, Barbie dolls, STEM robots..."
                className="w-full pl-12 pr-6 py-4 rounded-full text-gray-900 text-base md:text-lg focus:outline-none focus:ring-4 focus:ring-orange-300 shadow-2xl bg-white border-2 border-orange-200"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* Popular Search Suggestions */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-gray-300 font-semibold">Popular:</span>
              {POPULAR_SEARCHES.slice(0, 6).map((term, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(term)}
                  className="bg-white/10 hover:bg-white/20 text-xs font-medium text-white px-3 py-1 rounded-full border border-white/15 transition-all hover:scale-105"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {debouncedQuery.length > 1 ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-gray-900">
                Search Results for "{debouncedQuery}"
              </h2>
              {data && (
                <span className="text-sm font-bold text-[var(--brand-orange)] bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                  {data.total} Toys Found
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : data?.data.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-orange-100 shadow-sm space-y-3">
                <span className="text-5xl">🔍</span>
                <h3 className="text-xl font-bold text-gray-900">No matching toys found</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  We couldn't find anything matching "{debouncedQuery}". Try checking the spelling or browse our popular categories.
                </p>
                <div className="pt-2">
                  <Link to="/shop" className="inline-block bg-[var(--brand-orange)] text-white font-bold px-6 py-2.5 rounded-full text-sm">
                    Browse All Toys
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {data?.data.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-900">
                ✨ Popular Toys You Might Love
              </h3>
              <Link to="/shop" className="text-xs font-bold text-[var(--brand-orange)] hover:underline">
                View All
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(featuredProducts || MOCK_PRODUCTS.slice(0, 4)).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SearchPage;
