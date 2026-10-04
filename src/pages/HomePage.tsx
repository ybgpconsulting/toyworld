import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFeaturedProducts, getCategories } from '../lib/api';
import { ProductCard, ProductCardSkeleton } from '../components/ui/ProductCard';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RefreshCw, MessageCircle } from 'lucide-react';
import { WHATSAPP_URL } from '../lib/constants';

const HomePage = () => {
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: getFeaturedProducts,
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Banner Placeholder */}
      <div className="w-full h-[40vh] md:h-[60vh] bg-gradient-to-r from-[var(--brand-orange)] to-orange-400 flex items-center justify-center text-white p-4">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to Toy World</h1>
          <p className="text-lg md:text-xl mb-8">Discover the magic of play with our amazing collection.</p>
          <Link to="/shop">
            <Button size="lg" variant="secondary" className="bg-[var(--deep-navy)] text-white hover:bg-gray-800">
              Shop Now
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-12">
        
        {/* Categories Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[var(--deep-navy)]">Shop by Category</h2>
            <Link to="/shop" className="text-[var(--brand-orange)] text-sm font-semibold hover:underline">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categoriesLoading 
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-white rounded-xl animate-pulse" />
                ))
              : categories?.slice(0, 6).map((cat) => (
                  <Link 
                    key={cat.id} 
                    to={`/category/${cat.slug}`}
                    className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-full mb-3 flex items-center justify-center overflow-hidden">
                      {cat.imageUrl ? (
                        <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-400">Img</span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-center line-clamp-2">{cat.name}</span>
                  </Link>
                ))
            }
          </div>
        </section>

        {/* Featured Products */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[var(--deep-navy)]">Featured Products</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {productsLoading
              ? Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : products?.slice(0, 5).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
            }
          </div>
        </section>

        {/* Features / Why shop with us */}
        <section className="bg-white rounded-2xl p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-sm">Pan India Delivery</h3>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-sm">100% Genuine</h3>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 bg-orange-50 text-[var(--brand-orange)] rounded-full flex items-center justify-center">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-sm">Easy Returns</h3>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 bg-[#25D366]/10 text-[#25D366] rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-sm">WhatsApp Support</h3>
          </div>
        </section>
        
        {/* CTA */}
        <section className="bg-[#1A1A2E] rounded-2xl overflow-hidden flex flex-col md:flex-row items-center">
          <div className="p-8 md:p-12 md:w-2/3 text-white">
            <h2 className="text-3xl font-bold text-[var(--brand-gold)] mb-4">Need help finding the right toy?</h2>
            <p className="mb-6 text-gray-300">Message us on WhatsApp and our experts will help you pick the perfect gift!</p>
            <a 
              href={WHATSAPP_URL} 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-3 rounded-full font-bold transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Chat with us
            </a>
          </div>
        </section>

      </div>
    </div>
  );
};

export default HomePage;
