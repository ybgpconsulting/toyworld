import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { search } from '../lib/api';
import { ProductCard, ProductCardSkeleton } from '../components/ui/ProductCard';
import { useDebounce } from '../hooks/useDebounce';
import { Search as SearchIcon } from 'lucide-react';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery !== searchParams.get('q')) {
      setSearchParams({ q: debouncedQuery });
    }
  }, [debouncedQuery, setSearchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => search(debouncedQuery),
    enabled: debouncedQuery.length > 1,
  });

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">
        
        {/* Search Header */}
        <div className="bg-[var(--deep-navy)] rounded-3xl p-8 md:p-12 text-center text-white">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 text-[var(--brand-gold)]">Find Your Perfect Toy</h1>
          <div className="max-w-2xl mx-auto relative">
            <SearchIcon className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              autoFocus
              placeholder="Search by name, brand, or category..."
              className="w-full pl-12 pr-6 py-4 rounded-full text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-[var(--brand-orange)] shadow-lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Results */}
        {debouncedQuery.length > 1 ? (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Search Results for "{debouncedQuery}"
              {data && <span className="text-gray-500 text-sm ml-2 font-normal">({data.total} items)</span>}
            </h2>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : data?.data.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border shadow-sm">
                <SearchIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No toys found</h3>
                <p className="text-gray-500">We couldn't find anything matching your search. Try different keywords!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {data?.data.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            Start typing to explore our magical collection of toys!
          </div>
        )}

      </div>
    </div>
  );
};

export default SearchPage;
