import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';
import Layout from './components/layout/Layout';
import { ToastProvider } from './components/ui/Toast';

const queryClient = new QueryClient();

// Customer Pages
const HomePage = lazy(() => import('./pages/HomePage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const PolicyPage = lazy(() => import('./pages/PolicyPage'));

// Admin Pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Products = lazy(() => import('./pages/admin/Products'));
const ProductForm = lazy(() => import('./pages/admin/ProductForm'));
const Orders = lazy(() => import('./pages/admin/Orders'));
const OrderDetail = lazy(() => import('./pages/admin/OrderDetail'));
const Categories = lazy(() => import('./pages/admin/Categories'));
const Brands = lazy(() => import('./pages/admin/Brands'));
const Reviews = lazy(() => import('./pages/admin/Reviews'));
const Coupons = lazy(() => import('./pages/admin/Coupons'));
const Shipping = lazy(() => import('./pages/admin/Shipping'));
const Homepage = lazy(() => import('./pages/admin/Homepage'));
const Settings = lazy(() => import('./pages/admin/Settings'));

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" replace />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider />
        <Suspense
          fallback={
            <div className="flex h-screen w-screen items-center justify-center bg-[var(--warm-white)] text-[var(--brand-orange)] font-bold text-xl">
              Loading TOY WORLD...
            </div>
          }
        >
          <Routes>
            {/* Customer Front-end Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="shop" element={<CategoryPage />} />
              <Route path="category/:slug" element={<CategoryPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="product/:slug" element={<ProductDetailPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="order-success/:orderNumber" element={<OrderSuccessPage />} />

              {/* Policy Pages */}
              <Route path="about" element={<PolicyPage />} />
              <Route path="contact" element={<PolicyPage />} />
              <Route path="shipping-policy" element={<PolicyPage />} />
              <Route path="payment-policy" element={<PolicyPage />} />
              <Route path="return-policy" element={<PolicyPage />} />
              <Route path="cancellation-policy" element={<PolicyPage />} />
              <Route path="privacy-policy" element={<PolicyPage />} />
              <Route path="terms" element={<PolicyPage />} />

              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Admin Back-office Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminLayout />
                </ProtectedAdminRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/:id/edit" element={<ProductForm />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="categories" element={<Categories />} />
              <Route path="brands" element={<Brands />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="coupons" element={<Coupons />} />
              <Route path="shipping" element={<Shipping />} />
              <Route path="homepage" element={<Homepage />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
