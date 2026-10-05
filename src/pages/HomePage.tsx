import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getFeaturedProducts,
  getCategories,
  getBestsellers,
  getNewArrivals,
  getOffers
} from '../lib/api';
import { ProductCard, ProductCardSkeleton } from '../components/ui/ProductCard';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  RefreshCw,
  MessageCircle,
  Sparkles,
  ChevronRight,
  Flame,
  Clock,
  Award,
  Gift,
  Heart,
  Star,
  ChevronLeft,
  CheckCircle2
} from 'lucide-react';
import { WHATSAPP_URL, WHATSAPP_NUMBER, AGE_GROUPS } from '../lib/constants';
import { MOCK_CATEGORIES, MOCK_BANNERS, MOCK_REVIEWS, MOCK_PRODUCTS } from '../lib/mockData';

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<'featured' | 'bestsellers' | 'new' | 'deals' | 'rc' | 'lego'>('featured');

  // Flash deal countdown simulation
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 42, seconds: 19 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Slide autoplay
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % MOCK_BANNERS.length);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, []);

  const { data: featuredProducts, isLoading: featuredLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: getFeaturedProducts,
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: bestsellers, isLoading: bestsellersLoading } = useQuery({
    queryKey: ['bestsellers'],
    queryFn: getBestsellers,
  });

  const { data: newArrivals, isLoading: newLoading } = useQuery({
    queryKey: ['new-arrivals'],
    queryFn: getNewArrivals,
  });

  const { data: offerProducts, isLoading: offersLoading } = useQuery({
    queryKey: ['offers'],
    queryFn: getOffers,
  });

  const displayedCategories = (categories && categories.length > 0) ? categories : MOCK_CATEGORIES;

  // Products according to tab
  const getTabProducts = () => {
    switch (activeTab) {
      case 'bestsellers':
        return bestsellers || MOCK_PRODUCTS.filter(p => p.is_bestseller);
      case 'new':
        return newArrivals || MOCK_PRODUCTS.filter(p => p.is_new_arrival);
      case 'deals':
        return offerProducts || MOCK_PRODUCTS.filter(p => p.is_offer || (p.discountPercentage && p.discountPercentage >= 25));
      case 'rc':
        return MOCK_PRODUCTS.filter(p => p.category_id === 1);
      case 'lego':
        return MOCK_PRODUCTS.filter(p => p.category_id === 2);
      case 'featured':
      default:
        return featuredProducts || MOCK_PRODUCTS.filter(p => p.is_featured);
    }
  };

  const currentTabProducts = getTabProducts();
  const currentTabLoading = featuredLoading || bestsellersLoading || newLoading || offersLoading;

  return (
    <div className="min-h-screen bg-toy-pattern pb-16">

      {/* ============================================================ */}
      {/* 1. HERO SECTION WITH BACKGROUND TOYS IMAGERY & CAROUSEL */}
      {/* ============================================================ */}
      <section className="relative w-full overflow-hidden bg-[var(--deep-navy)]">
        <div className="relative h-[480px] sm:h-[540px] md:h-[620px] w-full">
          {MOCK_BANNERS.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* High-res Toy Lifestyle Background Image */}
              <img
                src={banner.imageUrl}
                alt={banner.title || 'Toy Showcase'}
                className="w-full h-full object-cover object-center filter brightness-60"
              />

              {/* Rich Vibrant Gradient Overlay with Toy Texture */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A2E]/95 via-[#1A1A2E]/75 to-transparent" />
              <div className="absolute inset-0 bg-toy-doodles-dark opacity-30" />

              {/* Content Box */}
              <div className="absolute inset-0 container mx-auto px-4 md:px-8 flex items-center">
                <div className="max-w-2xl text-white space-y-4 md:space-y-6 pt-6">

                  {/* Decorative Joy Pill */}
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--brand-orange)] to-amber-500 text-white text-xs md:text-sm font-black px-4 py-1.5 rounded-full shadow-lg animate-float">
                    <Sparkles className="w-4 h-4 text-yellow-200" />
                    <span>India’s Most Trusted Toy Showroom</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight leading-tight text-white drop-shadow-md">
                    {banner.title}
                  </h1>

                  <p className="text-sm sm:text-base md:text-lg text-gray-200 line-clamp-2 md:line-clamp-none max-w-xl">
                    {banner.subtitle}
                  </p>

                  {/* Actions & Floating Perks */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link to={banner.link || '/shop'}>
                      <Button size="lg" className="bg-[var(--brand-orange)] hover:bg-orange-600 text-white font-black px-6 md:px-8 py-3 rounded-full shadow-xl hover:scale-105 transition-all text-sm md:text-base flex items-center gap-2">
                        <span>{banner.cta_text || 'Explore Toys'}</span>
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </Link>

                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-3 rounded-full shadow-lg transition-all text-sm"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>WhatsApp Order</span>
                    </a>
                  </div>

                  {/* Badges Strip */}
                  <div className="hidden sm:flex items-center gap-4 pt-4 text-xs font-semibold text-gray-300">
                    <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>BIS Safety Certified</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full">
                      <Truck className="w-4 h-4 text-amber-400" />
                      <span>Free Delivery ₹999+</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span>4.9/5 Parent Rating</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ))}

          {/* Carousel Arrows */}
          <button
            onClick={() => setCurrentSlide(prev => (prev - 1 + MOCK_BANNERS.length) % MOCK_BANNERS.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center backdrop-blur-md transition-colors"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCurrentSlide(prev => (prev + 1) % MOCK_BANNERS.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center backdrop-blur-md transition-colors"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {MOCK_BANNERS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? 'w-8 bg-[var(--brand-orange)]' : 'w-2.5 bg-white/50 hover:bg-white'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. TRUST & ASSURANCE PILLARS STRIP */}
      {/* ============================================================ */}
      <div className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-orange-100 p-4 md:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-100">

          <div className="flex items-center gap-3 p-2">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[var(--brand-orange)] flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">Pan-India Delivery</h4>
              <p className="text-xs text-gray-500">Free shipping on orders above ₹999</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 pt-4 md:pt-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">100% Child Safe</h4>
              <p className="text-xs text-gray-500">Non-toxic, BIS certified genuine toys</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 pt-4 md:pt-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">7-Day Easy Returns</h4>
              <p className="text-xs text-gray-500">Hassle-free replacement guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 pt-4 md:pt-2">
            <div className="w-12 h-12 rounded-2xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">Video Shopping</h4>
              <p className="text-xs text-gray-500">Live toy demonstration on WhatsApp</p>
            </div>
          </div>

        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-16">

        {/* ============================================================ */}
        {/* 3. POPULAR CATEGORIES (WITH REAL TOYS BACKGROUND IMAGERY) */}
        {/* ============================================================ */}
        <section>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-orange)] uppercase tracking-widest mb-1">
                <span>🧸</span> Explore Wonderland
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-[var(--deep-navy)]">
                Shop By Category
              </h2>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1 text-[var(--brand-orange)] font-bold hover:gap-2 transition-all text-sm group"
            >
              <span>Explore All 10 Categories</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Categories Grid with Real Photos & Hover Scaling */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-5">
            {categoriesLoading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-white rounded-2xl animate-pulse shadow-sm" />
                ))
              : displayedCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.slug}`}
                    className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-orange-100 hover:border-[var(--brand-orange)] shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
                  >
                    {/* Background Toy Image Container */}
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <img
                        src={cat.imageUrl || cat.image_url || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=500&q=80'}
                        alt={cat.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Emoji Icon Pill */}
                      <div className="absolute top-2.5 left-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-base shadow-sm">
                        {(cat as any).icon || '🎁'}
                      </div>

                      {/* Item Count Tag */}
                      <span className="absolute top-2.5 right-2.5 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {(cat as any).itemCount || 30}+ Toys
                      </span>

                      {/* Category Label at bottom of image */}
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                        <h3 className="font-extrabold text-sm md:text-base leading-tight drop-shadow-sm group-hover:text-yellow-300 transition-colors line-clamp-1">
                          {cat.name}
                        </h3>
                        <p className="text-[11px] text-gray-200 line-clamp-1 mt-0.5">
                          {cat.description || 'Explore collection'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
            }
          </div>
        </section>

        {/* ============================================================ */}
        {/* 4. FLASH DEALS BANNER (URGENT DISCOUNT CARNIVAL) */}
        {/* ============================================================ */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#1A1A2E] via-[#2A1B4E] to-[#1A1A2E] text-white p-6 md:p-10 shadow-2xl border border-purple-500/20">
          <div className="absolute inset-0 bg-toy-doodles-dark opacity-20 pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-red-500/30 border border-red-500/50 text-red-300 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                <Flame className="w-4 h-4 text-red-400 fill-current animate-bounce" />
                <span>Lightning Flash Deals</span>
              </div>

              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
                Up to <span className="text-[var(--brand-gold)]">45% OFF</span> on Top Toys!
              </h2>

              <p className="text-gray-300 text-sm md:text-base max-w-lg">
                Grab best-selling RC cars, STEM sets, and giant cuddly teddy bears at jaw-dropping discounts before timer runs out!
              </p>

              {/* Countdown Timer Blocks */}
              <div className="flex items-center justify-center lg:justify-start gap-2 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-gray-300 mr-2">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span>Ends in:</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-center min-w-[50px]">
                  <span className="text-lg font-black text-yellow-300">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="text-[9px] block text-gray-400 uppercase">Hours</span>
                </div>
                <span className="text-xl font-bold text-yellow-400">:</span>
                <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-center min-w-[50px]">
                  <span className="text-lg font-black text-yellow-300">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="text-[9px] block text-gray-400 uppercase">Mins</span>
                </div>
                <span className="text-xl font-bold text-yellow-400">:</span>
                <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-center min-w-[50px]">
                  <span className="text-lg font-black text-yellow-300">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="text-[9px] block text-gray-400 uppercase">Secs</span>
                </div>
              </div>
            </div>

            {/* Quick Deal Preview Cards */}
            <div className="grid grid-cols-2 gap-4 w-full lg:w-auto flex-shrink-0">
              {MOCK_PRODUCTS.slice(0, 2).map((item) => (
                <Link
                  key={item.id}
                  to={`/product/${item.slug}`}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl p-3 border border-white/10 transition-all hover:scale-105 flex flex-col"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-2">
                    <img
                      src={item.images[0]?.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">
                      {item.discountPercentage}% OFF
                    </span>
                  </div>
                  <h4 className="text-xs font-bold line-clamp-1 text-white">{item.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-black text-yellow-300">₹{item.price}</span>
                    <span className="text-[10px] text-gray-400 line-through">₹{item.mrp}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 5. CURATED TOY LISTS & INTERACTIVE TABS */}
        {/* ============================================================ */}
        <section>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-orange)] uppercase tracking-widest mb-1">
                <span>🔥</span> Handpicked For Smiles
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-[var(--deep-navy)]">
                Explore Toy Collections
              </h2>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {[
                { key: 'featured', label: '⭐ Featured' },
                { key: 'bestsellers', label: '🏆 Best Sellers' },
                { key: 'new', label: '✨ New In' },
                { key: 'deals', label: '🏷️ Big Deals' },
                { key: 'rc', label: '🚗 RC Cars' },
                { key: 'lego', label: '🏰 Building Sets' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all ${
                    activeTab === tab.key
                      ? 'bg-[var(--brand-orange)] text-white shadow-md shadow-orange-500/30 scale-105'
                      : 'bg-white text-gray-700 hover:bg-orange-50 border border-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {currentTabLoading
              ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : currentTabProducts.slice(0, 8).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
            }
          </div>

          {/* View More Button */}
          <div className="text-center pt-8">
            <Link to="/shop">
              <Button size="lg" variant="outline" className="border-2 border-[var(--deep-navy)] text-[var(--deep-navy)] hover:bg-[var(--deep-navy)] hover:text-white font-black px-8 py-3 rounded-full transition-all">
                View Entire Catalog ({MOCK_PRODUCTS.length}+ Toys)
              </Button>
            </Link>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 6. SHOP BY AGE GROUP (INTERACTIVE THEMED CARDS) */}
        {/* ============================================================ */}
        <section>
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-orange)] uppercase tracking-widest">
              <span>🎯</span> Right Toy For Every Stage
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-[var(--deep-navy)]">
              Shop Toys by Age Group
            </h2>
            <p className="text-sm text-gray-500">
              Age-appropriate toys designed for cognitive growth, fine motor development, and pure joyful fun!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                age: '0-2 Years',
                title: 'Infants & Toddlers',
                desc: 'Teethers, musical playmats, rattles & soft sensory hugs.',
                icon: '👶',
                gradient: 'from-amber-400 to-orange-400',
                image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=500&q=80',
                group: '0-2'
              },
              {
                age: '3-5 Years',
                title: 'Curious Explorers',
                desc: 'Play-Doh clay, easy puzzles, Barbie dolls & wooden toys.',
                icon: '🎈',
                gradient: 'from-pink-500 to-rose-400',
                image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=500&q=80',
                group: '3-5'
              },
              {
                age: '6-8 Years',
                title: 'Little Builders',
                desc: '360° Stunt RC cars, LEGO classic bricks & action heroes.',
                icon: '🚀',
                gradient: 'from-blue-600 to-indigo-500',
                image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=500&q=80',
                group: '6-8'
              },
              {
                age: '9-12+ Years',
                title: 'Master Minds',
                desc: 'STEM solar robotics, Monopoly, 1000pc jigsaw & drones.',
                icon: '🧠',
                gradient: 'from-emerald-500 to-teal-600',
                image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=500&q=80',
                group: '8-12'
              },
            ].map((card, idx) => (
              <Link
                key={idx}
                to={`/shop`}
                className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col justify-end p-6 min-h-[260px] text-white"
              >
                {/* Background Toy Image */}
                <img
                  src={card.image}
                  alt={card.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${card.gradient} opacity-90 group-hover:opacity-85 transition-opacity`} />
                <div className="absolute inset-0 bg-toy-doodles-dark opacity-30" />

                <div className="relative z-10 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner">
                    {card.icon}
                  </div>
                  <div className="inline-block bg-white text-gray-900 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {card.age}
                  </div>
                  <h3 className="text-xl font-black text-white">{card.title}</h3>
                  <p className="text-xs text-white/90 leading-relaxed line-clamp-2">{card.desc}</p>

                  <div className="flex items-center gap-1 text-xs font-bold text-yellow-200 group-hover:translate-x-1 transition-transform pt-1">
                    <span>Explore age gifts</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* 7. BUDGET CORNER (CURATED PRICE LISTS) */}
        {/* ============================================================ */}
        <section className="bg-white rounded-3xl p-6 md:p-10 border border-orange-100 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-orange)] uppercase tracking-widest mb-1">
                <span>🏷️</span> Pocket-Friendly Delights
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-[var(--deep-navy)]">
                Toys For Every Budget
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Under ₹499', subtitle: 'Pocket-Money Fidgets & Quick Gifts', color: 'from-amber-500 to-orange-500' },
              { label: 'Under ₹999', subtitle: 'Top Birthday Surprises & Games', color: 'from-blue-500 to-cyan-500' },
              { label: 'Under ₹1,499', subtitle: 'Deluxe RC Racers & DIY Kits', color: 'from-purple-500 to-indigo-500' },
              { label: 'Special Combos', subtitle: 'Multipacks & Family Gift Bundles', color: 'from-emerald-500 to-teal-500' },
            ].map((budget, idx) => (
              <Link
                key={idx}
                to="/shop"
                className={`group p-6 rounded-2xl bg-gradient-to-br ${budget.color} text-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between min-h-[140px]`}
              >
                <div>
                  <h3 className="text-xl md:text-2xl font-black">{budget.label}</h3>
                  <p className="text-xs text-white/90 mt-1 line-clamp-2">{budget.subtitle}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-yellow-200 mt-4 group-hover:translate-x-1 transition-transform">
                  <span>Shop now</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* 8. TOP TOY BRANDS STRIP */}
        {/* ============================================================ */}
        <section className="text-center space-y-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
            Authorized Retailer For Genuine Global Brands
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            {['LEGO', 'Hot Wheels', 'Barbie', 'Nerf', 'Funskool', 'Hasbro', 'Fisher-Price', 'Play-Doh'].map((brand, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 hover:border-[var(--brand-orange)] px-6 py-3 rounded-2xl shadow-xs font-black text-sm md:text-base text-gray-700 hover:text-[var(--brand-orange)] transition-all hover:scale-105"
              >
                {brand}
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* 9. REAL PARENT TESTIMONIALS */}
        {/* ============================================================ */}
        <section className="bg-gradient-to-b from-orange-50/60 to-amber-50/40 rounded-3xl p-6 md:p-10 border border-orange-100">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-orange)] uppercase tracking-widest">
              <span>❤️</span> Real Parents, Real Smiles
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-[var(--deep-navy)]">
              Loved by 25,000+ Indian Families
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_REVIEWS.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 italic leading-relaxed">
                    "{review.comment}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-6 border-t border-gray-100 mt-4">
                  <img
                    src={review.avatar}
                    alt={review.customer_name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-orange-200"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{review.customer_name}</h4>
                    <p className="text-xs text-gray-400">{review.city} • Verified Buyer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* 10. WHATSAPP VIDEO CONSULTATION CTA */}
        {/* ============================================================ */}
        <section className="relative bg-gradient-to-r from-[#1A1A2E] to-[#25D366]/20 rounded-3xl overflow-hidden shadow-2xl p-8 md:p-12 border border-emerald-500/20">
          <div className="absolute inset-0 bg-toy-doodles-dark opacity-20 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left text-white max-w-xl">
              <div className="inline-flex items-center gap-2 bg-[#25D366]/20 text-[#25D366] px-3.5 py-1 rounded-full text-xs font-bold border border-[#25D366]/30">
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Instant WhatsApp Shopping</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight">
                Need Help Choosing The Perfect Toy?
              </h2>
              <p className="text-gray-300 text-sm md:text-base">
                Message us on WhatsApp! Our showroom toy consultants will share photos, demo videos, and guide you to the perfect birthday gift.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-4 rounded-full font-black text-base shadow-xl hover:scale-105 transition-all"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>Chat on WhatsApp (+91 {WHATSAPP_NUMBER})</span>
              </a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default HomePage;
