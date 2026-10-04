import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, Menu } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';

const Header = () => {
  const { itemCount, openCart } = useCartStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[var(--warm-white)] shadow-sm h-[56px] md:h-[72px]">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        
        {/* Mobile menu button */}
        <button className="md:hidden p-2 -ml-2 text-[var(--deep-navy)]">
          <Menu className="w-6 h-6" />
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl md:text-2xl font-bold text-[var(--brand-orange)] tracking-tight">
            TOY<span className="text-[var(--deep-navy)]">WORLD</span>
          </span>
        </Link>

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
          <input 
            type="text" 
            placeholder="Search for toys, brands, categories..."
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-[var(--brand-orange)] focus:ring-1 focus:ring-[var(--brand-orange)]"
          />
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
        </div>

        {/* Desktop Nav & Actions */}
        <nav className="flex items-center gap-4">
          <Link to="/search" className="md:hidden p-2 text-[var(--deep-navy)]">
            <Search className="w-6 h-6" />
          </Link>
          
          <button 
            onClick={openCart}
            className="p-2 relative text-[var(--deep-navy)] hover:text-[var(--brand-orange)] transition-colors"
          >
            <ShoppingCart className="w-6 h-6" />
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 bg-[var(--brand-orange)] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
