import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, Search, ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import clsx from 'clsx';

const BottomNav = () => {
  const { itemCount, openCart } = useCartStore();

  const navItems = [
    { icon: Home, label: 'Home', to: '/' },
    { icon: Grid, label: 'Categories', to: '/shop' },
    { icon: Search, label: 'Search', to: '/search' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-pb">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center justify-center w-full h-full space-y-1',
                isActive ? 'text-[var(--brand-orange)]' : 'text-gray-500 hover:text-gray-900'
              )
            }
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
        
        {/* Cart Button (Action, not a link) */}
        <button
          onClick={openCart}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-500 hover:text-gray-900 relative"
        >
          <div className="relative">
            <ShoppingCart className="w-6 h-6" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[var(--brand-orange)] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Cart</span>
        </button>

        <NavLink
          to="/about"
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center justify-center w-full h-full space-y-1',
              isActive ? 'text-[var(--brand-orange)]' : 'text-gray-500 hover:text-gray-900'
            )
          }
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-medium">More</span>
        </NavLink>
      </div>
    </div>
  );
};

export default BottomNav;
