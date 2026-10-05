import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, Sparkles, MessageCircle, ChevronRight } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { WHATSAPP_URL, WHATSAPP_NUMBER } from '../../lib/constants';
import { MOCK_CATEGORIES } from '../../lib/mockData';

const Header = () => {
  const { itemCount, openCart } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-orange-100">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-[var(--brand-orange)] via-orange-500 to-amber-500 text-white text-xs py-1.5 px-4 font-medium">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-yellow-200 animate-spin" /> Special Offer
            </span>
            <span className="hidden sm:inline">Pan-India Fast Dispatch | </span>
            <span>Free Delivery on orders ₹999+ | Use Code: <span className="font-bold text-yellow-200">FESTIVE15</span></span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-xs font-semibold">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-yellow-100 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>WhatsApp: +91 {WHATSAPP_NUMBER}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="container mx-auto px-4 py-2.5 md:py-3.5 flex items-center justify-between gap-3 md:gap-8">

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 -ml-2 text-[var(--deep-navy)] hover:text-[var(--brand-orange)] rounded-lg"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-gradient-to-br from-[var(--brand-orange)] to-amber-400 p-0.5 shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
            <span className="text-2xl">🧸</span>
          </div>
          <div className="flex flex-col">
            <div className="text-xl md:text-2xl font-black tracking-tight leading-none">
              <span className="text-[var(--brand-orange)]">TOY</span>
              <span className="text-[var(--deep-navy)]">WORLD</span>
            </div>
            <span className="text-[9px] md:text-[10px] font-bold text-gray-500 tracking-widest uppercase">
              Pan-India Toy Store
            </span>
          </div>
        </Link>

        {/* Desktop Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xl relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search RC cars, LEGO blocks, Barbie dolls, STEM robots..."
            className="w-full pl-11 pr-24 py-2.5 rounded-full border-2 border-orange-100 bg-orange-50/30 text-sm focus:outline-none focus:border-[var(--brand-orange)] focus:bg-white focus:ring-4 focus:ring-orange-100 transition-all placeholder:text-gray-400"
          />
          <Search className="w-5 h-5 absolute left-3.5 top-3 text-[var(--brand-orange)]" />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[var(--brand-orange)] hover:bg-orange-600 text-white text-xs font-bold rounded-full transition-colors shadow-sm"
          >
            Search
          </button>
        </form>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Mobile search icon */}
          <Link
            to="/search"
            className="md:hidden p-2 text-gray-700 hover:text-[var(--brand-orange)] rounded-full hover:bg-orange-50"
            aria-label="Search toys"
          >
            <Search className="w-5 h-5" />
          </Link>

          {/* WhatsApp Direct Help */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <MessageCircle className="w-3.5 h-3.5 fill-emerald-600" />
            <span>Chat Help</span>
          </a>

          {/* Cart Button */}
          <button
            onClick={openCart}
            className="flex items-center gap-2 px-3 py-2 bg-orange-50 hover:bg-orange-100 text-[var(--brand-orange)] border border-orange-200 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95"
            aria-label="Shopping Cart"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[var(--brand-orange)] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="hidden md:inline font-bold text-xs text-[var(--deep-navy)]">
              {itemCount > 0 ? `${itemCount} Toys` : 'Cart'}
            </span>
          </button>
        </div>
      </div>

      {/* Desktop Category Navigation Strip */}
      <nav className="hidden md:block bg-gradient-to-r from-orange-50/60 via-amber-50/40 to-orange-50/60 border-t border-orange-100/80 px-4 py-2">
        <div className="container mx-auto flex items-center justify-between text-xs font-semibold text-gray-700">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            <Link
              to="/shop"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--deep-navy)] text-white hover:bg-gray-800 transition-colors flex-shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>All 500+ Toys</span>
            </Link>

            {MOCK_CATEGORIES.slice(0, 7).map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full hover:bg-white hover:text-[var(--brand-orange)] hover:shadow-xs transition-all flex-shrink-0"
              >
                <span>{cat.icon || '🎁'}</span>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>

          <Link
            to="/shop"
            className="flex items-center gap-1 text-[var(--brand-orange)] font-bold hover:underline flex-shrink-0 pl-2"
          >
            <span>Hot Deals %</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4 space-y-4 shadow-xl max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all toys..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:border-[var(--brand-orange)]"
            />
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          </form>

          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Categories</div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 bg-orange-50 rounded-xl text-xs font-bold text-[var(--brand-orange)]"
              >
                <span>✨</span>
                <span>All Toys</span>
              </Link>
              {MOCK_CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-orange-50 rounded-xl text-xs font-semibold text-gray-800 transition-colors"
                >
                  <span className="text-base">{cat.icon}</span>
                  <span className="line-clamp-1">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] text-white py-2.5 rounded-xl font-bold text-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Order via WhatsApp (+91 {WHATSAPP_NUMBER})</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
