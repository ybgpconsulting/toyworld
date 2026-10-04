import {
  Product,
  Category,
  Brand,
  Order,
  Review,
  StoreSettings,
  ShippingRule,
  Coupon,
  PaginatedResponse,
  FilterState,
  SortOption,
  AdminUser,
} from '../types';

const BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:8787/api';

async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('admin_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const resJson = await response.json();

  if (!response.ok) {
    throw new Error(resJson.error || resJson.message || 'API request failed');
  }

  // Handle both { data: [...] } format and direct object/array payloads
  if (resJson && typeof resJson === 'object' && 'data' in resJson && resJson.data !== undefined) {
    return resJson.data as T;
  }

  return resJson as T;
}

// --- Customer APIs ---

export const getProducts = (filters?: FilterState & { sort?: SortOption; page?: number }) => {
  const params = new URLSearchParams();
  if (filters) {
    if (filters.categories?.length) params.append('category_slug', filters.categories[0]);
    if (filters.brands?.length) params.append('brand_id', filters.brands[0]);
    if (filters.minPrice) params.append('min_price', filters.minPrice.toString());
    if (filters.maxPrice) params.append('max_price', filters.maxPrice.toString());
    if (filters.inStockOnly) params.append('in_stock', 'true');
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.page) params.append('page', filters.page.toString());
  }
  return apiClient<PaginatedResponse<Product>>(`/products?${params.toString()}`);
};


export const getProductBySlug = (slug: string) => apiClient<Product>(`/products/${slug}`);
export const getCategories = () => apiClient<Category[]>('/categories');
export const getCategoryBySlug = (slug: string) => apiClient<Category>(`/categories/${slug}`);
export const search = (query: string, filters?: FilterState) => {
  const params = new URLSearchParams({ q: query });
  if (filters?.minPrice) params.append('min_price', filters.minPrice.toString());
  if (filters?.maxPrice) params.append('max_price', filters.maxPrice.toString());
  return apiClient<PaginatedResponse<Product>>(`/search?${params.toString()}`);
};
export const getSearchSuggestions = (query: string) =>
  apiClient<string[]>(`/search/suggestions?q=${encodeURIComponent(query)}`);

export const validateCart = (items: any[]) =>
  apiClient<any>('/cart/validate', {
    method: 'POST',
    body: JSON.stringify({ items }),
  });

export const createOrder = (data: any) =>
  apiClient<{ success: boolean; order_number: string; order_id: number; whatsapp_url: string; grand_total: number }>(
    '/orders',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );

export const getOrderByNumber = (orderNumber: string) =>
  apiClient<Order>(`/orders/${orderNumber}`);

export const validateCoupon = (code: string, orderAmount: number) =>
  apiClient<{ success: boolean; discount: number }>('/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code, orderAmount }),
  });

export const getProductReviews = (productId: string | number) =>
  apiClient<{ reviews: Review[]; summary: { average_rating: number; total_reviews: number } }>(
    `/reviews/product/${productId}`
  );

export const submitReview = (data: any) =>
  apiClient<{ success: boolean }>('/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getStoreSettings = () => apiClient<StoreSettings>('/settings/store');
export const getShippingSettings = () => apiClient<ShippingRule[]>('/settings/shipping');
export const getHomepageConfig = () => apiClient<any>('/settings/homepage/config');
export const getPageContent = (slug: string) => apiClient<any>(`/settings/pages/${slug}`);

export const getFeaturedProducts = () => apiClient<Product[]>('/products/featured');
export const getBestsellers = () => apiClient<Product[]>('/products/bestsellers');
export const getNewArrivals = () => apiClient<Product[]>('/products/new-arrivals');
export const getOffers = () => apiClient<Product[]>('/products/offers');

// --- Admin APIs ---

export const adminLogin = (username: string, password: string) =>
  apiClient<{ token: string; user: AdminUser }>('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

export const getDashboardStats = () =>
  apiClient<any>('/admin/dashboard/stats', {
    method: 'GET',
  });

export const adminGetProducts = (filters?: { search?: string; category_id?: number; page?: number }) => {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.category_id) params.append('category_id', filters.category_id.toString());
  if (filters?.page) params.append('page', filters.page.toString());
  return apiClient<PaginatedResponse<Product>>(`/admin/products?${params.toString()}`);
};

export const adminGetProduct = (id: string | number) =>
  apiClient<Product & { variants: any[]; images: any[] }>(`/admin/products/${id}`);

export const adminCreateProduct = (data: any) =>
  apiClient<{ success: boolean; id: number }>('/admin/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const adminUpdateProduct = (id: string | number, data: any) =>
  apiClient<{ success: boolean }>(`/admin/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const adminDeleteProduct = (id: string | number) =>
  apiClient<{ success: boolean }>(`/admin/products/${id}`, {
    method: 'DELETE',
  });

export const adminGetOrders = (filters?: { status?: string; payment_status?: string; search?: string; page?: number }) => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.payment_status) params.append('payment_status', filters.payment_status);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.page) params.append('page', filters.page.toString());
  return apiClient<PaginatedResponse<Order>>(`/admin/orders?${params.toString()}`);
};

export const adminGetOrder = (id: string | number) =>
  apiClient<Order & { items: any[]; address: any; history: any[] }>(`/admin/orders/${id}`);

export const adminUpdateOrderStatus = (id: string | number, data: any) =>
  apiClient<{ success: boolean }>(`/admin/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const adminGetReviews = (status?: string) => {
  const params = status ? `?status=${status}` : '';
  return apiClient<Review[]>(`/admin/reviews${params}`);
};

export const adminApproveReview = (id: string | number) =>
  apiClient<{ success: boolean }>(`/admin/reviews/${id}/approve`, { method: 'POST' });

export const adminRejectReview = (id: string | number) =>
  apiClient<{ success: boolean }>(`/admin/reviews/${id}/reject`, { method: 'POST' });

export const adminDeleteReview = (id: string | number) =>
  apiClient<{ success: boolean }>(`/admin/reviews/${id}`, { method: 'DELETE' });

export const adminGetCoupons = () => apiClient<Coupon[]>('/admin/coupons');

export const adminCreateCoupon = (data: any) =>
  apiClient<{ success: boolean; id: number }>('/admin/coupons', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const adminDeleteCoupon = (id: string | number) =>
  apiClient<{ success: boolean }>(`/admin/coupons/${id}`, { method: 'DELETE' });

export const adminGetShippingRules = () => apiClient<ShippingRule[]>('/admin/shipping');

export const adminCreateShippingRule = (data: any) =>
  apiClient<{ success: boolean; id: number }>('/admin/shipping', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const adminDeleteShippingRule = (id: string | number) =>
  apiClient<{ success: boolean }>(`/admin/shipping/${id}`, { method: 'DELETE' });

export const adminGetCategories = () => apiClient<Category[]>('/admin/categories');

export const adminCreateCategory = (data: any) =>
  apiClient<{ success: boolean; id: number }>('/admin/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const adminUpdateCategory = (id: string | number, data: any) =>
  apiClient<{ success: boolean }>(`/admin/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const adminDeleteCategory = (id: string | number) =>
  apiClient<{ success: boolean }>(`/admin/categories/${id}`, { method: 'DELETE' });

export const adminGetHomepageBanners = () => apiClient<any[]>('/admin/homepage/banners');

export const adminCreateHomepageBanner = (data: any) =>
  apiClient<{ success: boolean; id: number }>('/admin/homepage/banners', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const adminDeleteHomepageBanner = (id: string | number) =>
  apiClient<{ success: boolean }>(`/admin/homepage/banners/${id}`, { method: 'DELETE' });

export const adminGetHomepageSections = () => apiClient<any[]>('/admin/homepage/sections');

export const adminUpdateHomepageSection = (key: string, data: any) =>
  apiClient<{ success: boolean }>(`/admin/homepage/sections/${key}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const adminGetSettings = () => apiClient<Record<string, string>>('/admin/settings');

export const adminUpdateSettings = (data: Record<string, string>) =>
  apiClient<{ success: boolean }>('/admin/settings', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const adminUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${BASE_URL}/admin/upload`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to upload image');
  }
  return data as { url: string; filename: string };
};

export const adminGetBrands = () => apiClient<Brand[]>('/admin/brands');
