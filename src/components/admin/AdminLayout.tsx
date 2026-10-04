import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { 
  LayoutDashboard, Package, ListTree, Tags, ShoppingCart, 
  MessageSquare, Ticket, Truck, Home, Settings, LogOut, Menu, X 
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/admin/dashboard' },
  { icon: Package, label: 'Products', to: '/admin/products' },
  { icon: ListTree, label: 'Categories', to: '/admin/categories' },
  { icon: Tags, label: 'Brands', to: '/admin/brands' },
  { icon: ShoppingCart, label: 'Orders', to: '/admin/orders' },
  { icon: MessageSquare, label: 'Reviews', to: '/admin/reviews' },
  { icon: Ticket, label: 'Coupons', to: '/admin/coupons' },
  { icon: Truck, label: 'Shipping', to: '/admin/shipping' },
  { icon: Home, label: 'Homepage', to: '/admin/homepage' },
  { icon: Settings, label: 'Settings', to: '/admin/settings' },
];

const AdminLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { logout, admin } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[var(--deep-navy)] text-white">
      <div className="p-6">
        <span className="text-2xl font-bold text-[var(--brand-orange)] tracking-tight">
          TOY<span className="text-white">WORLD</span>
        </span>
        <p className="text-xs text-gray-400 mt-1">Admin Portal</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) => clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive 
                    ? 'bg-[var(--brand-orange)] text-white' 
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-4 px-3">
          <div className="w-8 h-8 rounded-full bg-[var(--brand-orange)] flex items-center justify-center font-bold">
            {admin?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{admin?.name}</p>
            <p className="text-xs text-gray-400 truncate">{admin?.role}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-red-400 hover:bg-white/10 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileOpen(false)} />
          <aside className="relative w-64 max-w-sm flex-1 h-full shadow-xl">
            <button 
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white"
              onClick={() => setIsMobileOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <span className="text-xl font-bold text-[var(--brand-orange)] tracking-tight">
            TOY<span className="text-[var(--deep-navy)]">WORLD</span>
          </span>
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
