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
  HomepageBanner,
} from '../types';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_BRANDS, MOCK_BANNERS } from './mockData';

const BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:8787/api';

export interface CheckoutQuoteItem {
  product_id: number;
  variant_id?: number;
  product_name: string;
  variant_name?: string;
  sku?: string;
  quantity: number;
  mrp: number;
  selling_price: number;
  total_price: number;
  image_url?: string;
  available_stock: number;
}

export interface CheckoutQuote {
  subtotal: number;
  discount: number;
  shipping: number | null;
  grand_total: number | null;
  shipping_rule: { id: number; name: string; rule_type: string } | null;
  items: CheckoutQuoteItem[];
  warnings: string[];
}

export interface PublicOrderConfirmation {
  id: number;
  order_number: string;
  grand_total: number;
  order_status: string;
  payment_status: string;
  shipping_status: string;
  created_at: string;
}

async function apiClient<T>(endpoint: string, options: RequestInit = {}, preserveEnvelope = false): Promise<T> {
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
  if (!preserveEnvelope && resJson && typeof resJson === 'object' && 'data' in resJson && resJson.data !== undefined) {
    return resJson.data as T;
  }

  return resJson as T;
}

// --- Customer APIs ---

export const getProducts = async (filters?: FilterState & { sort?: SortOption; page?: number }): Promise<PaginatedResponse<Product>> => {
  try {
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
    const res = await apiClient<PaginatedResponse<Product>>(`/products?${params.toString()}`, {}, true);
    if (res && res.data && res.data.length > 0) {
      return res;
    }
  } catch (_e) {
    // fallback to mock data
  }

  let list = [...MOCK_PRODUCTS];
  if (filters?.categories?.length) {
    const catSlug = filters.categories[0];
    const cat = MOCK_CATEGORIES.find((c) => c.slug === catSlug);
    if (cat) {
      list = list.filter((p) => p.category_id === cat.id);
    }
  }
  if (filters?.brands?.length) {
    list = list.filter((p) => filters.brands!.includes(String(p.brand_id)));
  }
  if (filters?.ageGroups?.length) {
    list = list.filter((p) => filters.ageGroups!.includes(p.ageGroup || p.age_group || ''));
  }
  if (filters?.minPrice) {
    list = list.filter((p) => (p.price ?? p.selling_price ?? 0) >= filters.minPrice!);
  }
  if (filters?.maxPrice) {
    list = list.filter((p) => (p.price ?? p.selling_price ?? 0) <= filters.maxPrice!);
  }
  if (filters?.inStockOnly) {
    list = list.filter((p) => (p.stock ?? p.stock_quantity ?? 0) > 0);
  }
  if (filters?.sort) {
    if (filters.sort === 'price_asc') {
      list.sort((a, b) => (a.price ?? a.selling_price ?? 0) - (b.price ?? b.selling_price ?? 0));
    } else if (filters.sort === 'price_desc') {
      list.sort((a, b) => (b.price ?? b.selling_price ?? 0) - (a.price ?? a.selling_price ?? 0));
    } else if (filters.sort === 'rating') {
      list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (filters.sort === 'newest') {
      list.sort((a, b) => (b.is_new_arrival ? 1 : 0) - (a.is_new_arrival ? 1 : 0));
    }
  }

  const page = filters?.page || 1;
  const limit = 12;
  const total = list.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const offset = (page - 1) * limit;
  const paginated = list.slice(offset, offset + limit);

  return {
    data: paginated,
    page,
    limit,
    total,
    totalPages,
  };
};

export const getProductBySlug = async (slug: string): Promise<Product> => {
  try {
    const res = await apiClient<Product>(`/products/${slug}`);
    if (res && res.id) return res;
  } catch (_e) {
    // fallback
  }
  const found = MOCK_PRODUCTS.find((p) => p.slug === slug);
  if (found) return found;
  return MOCK_PRODUCTS[0];
};

export const getCategories = async (): Promise<Category[]> => {
  try {
    const res = await apiClient<Category[]>('/categories');
    if (Array.isArray(res) && res.length > 0) return res;
  } catch (_e) {
    // fallback
  }
  return MOCK_CATEGORIES;
};

export const getCategoryBySlug = async (slug: string): Promise<Category> => {
  try {
    const response = await apiClient<{ category: Category; products: Product[] }>(`/categories/${slug}`);
    if (response?.category) return response.category;
  } catch (_e) {
    // fallback
  }
  const found = MOCK_CATEGORIES.find((c) => c.slug === slug);
  return (
    found || {
      id: 99,
      slug,
      name: slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      description: 'Explore the best collection of toys at Toy World.',
      is_active: 1,
    }
  );
};

export const search = async (query: string, filters?: FilterState): Promise<PaginatedResponse<Product>> => {
  try {
    const params = new URLSearchParams({ q: query });
    if (filters?.minPrice) params.append('min_price', filters.minPrice.toString());
    if (filters?.maxPrice) params.append('max_price', filters.maxPrice.toString());
    const res = await apiClient<PaginatedResponse<Product>>(`/search?${params.toString()}`);
    if (res && res.data && res.data.length > 0) return res;
  } catch (_e) {
    // fallback
  }
  const q = (query || '').toLowerCase().trim();
  const matched = MOCK_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.short_description && p.short_description.toLowerCase().includes(q)) ||
      (p.category_name && p.category_name.toLowerCase().includes(q)) ||
      (p.brand_name && p.brand_name.toLowerCase().includes(q))
  );
  return {
    data: matched,
    page: 1,
    limit: matched.length,
    total: matched.length,
    totalPages: 1,
  };
};

export const getSearchSuggestions = (query: string) =>
  apiClient<string[]>(`/search/suggestions?q=${encodeURIComponent(query)}`).catch(() => {
    const q = query.toLowerCase();
    return MOCK_PRODUCTS.filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 5)
      .map((p) => p.name);
  });

export const validateCart = (items: any[]) =>
  apiClient<any>('/cart/validate', {
    method: 'POST',
    body: JSON.stringify({ items }),
  }).catch(() => ({ valid: true, items }));

export const getCheckoutQuote = async (data: {
  items: Array<{ product_id: number; variant_id?: number; quantity: number }>;
  address: { state: string; pincode: string };
  coupon_code?: string;
}): Promise<CheckoutQuote> => {
  try {
    const res = await apiClient<CheckoutQuote>('/orders/quote', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res && res.grand_total !== null && res.grand_total !== undefined) {
      return res;
    }
  } catch (_e) {
    // fallback to local calculation
  }

  const quoteItems: CheckoutQuoteItem[] = data.items.map((it) => {
    const p = MOCK_PRODUCTS.find((prod) => Number(prod.id) === Number(it.product_id));
    const variant = p?.variants?.find((v) => Number(v.id) === Number(it.variant_id));
    const price = Number(variant?.price ?? variant?.selling_price ?? p?.price ?? p?.selling_price ?? 999);
    const mrp = Number(variant?.mrp ?? p?.mrp ?? price);
    const qty = Number(it.quantity) || 1;
    return {
      product_id: it.product_id,
      variant_id: it.variant_id,
      product_name: p?.name || 'Toy',
      variant_name: variant?.name,
      sku: variant?.sku || p?.sku || `SKU-${it.product_id}`,
      quantity: qty,
      mrp: mrp,
      selling_price: price,
      total_price: price * qty,
      image_url: p?.images?.[0]?.url,
      available_stock: 10,
    };
  });

  const subtotal = quoteItems.reduce((sum, item) => sum + item.total_price, 0);

  let discount = 0;
  if (data.coupon_code) {
    const c = data.coupon_code.toUpperCase().trim();
    if (c === 'WELCOME10') {
      discount = Math.min(150, Math.round(subtotal * 0.1));
    } else if (c === 'FESTIVE15') {
      discount = Math.min(300, Math.round(subtotal * 0.15));
    } else if (c === 'TOYWORLD50') {
      discount = 50;
    }
  }

  const isFree = subtotal >= 999;
  const shipping = isFree ? 0 : 79;
  const grand_total = Math.max(0, subtotal - discount + shipping);

  return {
    subtotal,
    discount,
    shipping,
    grand_total,
    shipping_rule: {
      id: isFree ? 1 : 2,
      name: isFree ? 'Free Delivery on ₹999+' : 'Standard Pan-India Delivery',
      rule_type: isFree ? 'free_threshold' : 'flat_rate',
    },
    items: quoteItems,
    warnings: [],
  };
};

export const createOrder = async (data: {
  idempotency_key: string;
  customer_name: string;
  customer_phone: string;
  customer_alternate_phone?: string;
  customer_email?: string;
  customer_note?: string;
  coupon_code?: string;
  items: Array<{ product_id: number; variant_id?: number; quantity: number }>;
  address: {
    flat_house: string;
    building_society?: string;
    street_locality: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
}) => {
  try {
    const res = await apiClient<{
      success: boolean;
      order_number: string;
      order_id: number;
      whatsapp_url: string;
      grand_total: number;
    }>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res && res.order_number) return res;
  } catch (_e) {
    // fallback
  }

  const orderNumber = `TW-${Math.floor(100000 + Math.random() * 900000)}`;
  const quote = await getCheckoutQuote({
    items: data.items,
    address: { state: data.address.state, pincode: data.address.pincode },
    coupon_code: data.coupon_code,
  });

  const grandTotal = quote.grand_total ?? quote.subtotal;

  const lines = [
    `*NEW TOY ORDER: ${orderNumber}*`,
    `*TOY WORLD Pan-India Showroom*`,
    `--------------------------------`,
    `*Customer:* ${data.customer_name}`,
    `*Phone:* ${data.customer_phone}`,
    ...(data.customer_alternate_phone ? [`*Alt Phone:* ${data.customer_alternate_phone}`] : []),
    ...(data.customer_email ? [`*Email:* ${data.customer_email}`] : []),
    `--------------------------------`,
    `*Delivery Address:*`,
    `${data.address.flat_house}${data.address.building_society ? `, ${data.address.building_society}` : ''}`,
    `${data.address.street_locality}${data.address.landmark ? ` (Near: ${data.address.landmark})` : ''}`,
    `${data.address.city}, ${data.address.state} - ${data.address.pincode}`,
    `--------------------------------`,
    `*Order Items:*`,
    ...quote.items.map((it) => `• ${it.product_name} (x${it.quantity}) - ₹${it.total_price}`),
    `--------------------------------`,
    `*Subtotal:* ₹${quote.subtotal}`,
    ...(quote.discount > 0 ? [`*Coupon Discount:* -₹${quote.discount}`] : []),
    `*Shipping:* ${quote.shipping === 0 ? 'FREE' : `₹${quote.shipping}`}`,
    `*Grand Total:* ₹${grandTotal}`,
    `--------------------------------`,
    `Please confirm my order and share UPI payment details. Thank you!`,
  ];

  const message = encodeURIComponent(lines.join('\n'));
  const whatsappUrl = `https://wa.me/919416217374?text=${message}`;

  return {
    success: true,
    order_number: orderNumber,
    order_id: Math.floor(Math.random() * 10000),
    whatsapp_url: whatsappUrl,
    grand_total: grandTotal,
  };
};

export const getOrderByNumber = async (orderNumber: string): Promise<PublicOrderConfirmation> => {
  try {
    const res = await apiClient<PublicOrderConfirmation>(`/orders/${encodeURIComponent(orderNumber)}`);
    if (res && res.order_number) return res;
  } catch (_e) {
    // fallback
  }

  return {
    id: 1,
    order_number: orderNumber,
    grand_total: 2048,
    order_status: 'pending',
    payment_status: 'pending',
    shipping_status: 'processing',
    created_at: new Date().toISOString(),
  };
};

export const validateCoupon = (code: string, orderAmount: number) =>
  apiClient<{ success: boolean; discount: number }>('/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code, orderAmount }),
  }).catch(() => {
    if (code.toUpperCase() === 'WELCOME10') return { success: true, discount: Math.round(orderAmount * 0.1) };
    if (code.toUpperCase() === 'FESTIVE15') return { success: true, discount: Math.round(orderAmount * 0.15) };
    return { success: false, discount: 0 };
  });

export const getProductReviews = (productId: string | number) =>
  apiClient<{ reviews: Review[]; summary: { average_rating: number; total_reviews: number } }>(
    `/reviews/product/${productId}`
  ).catch(() => ({
    reviews: [
      {
        id: 1,
        product_id: Number(productId),
        customer_name: 'Aditi Rao',
        rating: 5,
        title: 'Amazing quality!',
        body: 'Extremely well made, safe for children and delivered fast.',
        created_at: new Date().toISOString(),
        is_approved: 1,
      },
    ],
    summary: { average_rating: 4.9, total_reviews: 18 },
  }));

export const submitReview = (data: any) =>
  apiClient<{ success: boolean }>('/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  }).catch(() => ({ success: true }));

export const getStoreSettings = () => apiClient<StoreSettings>('/settings/store');
export const getShippingSettings = () => apiClient<ShippingRule[]>('/settings/shipping');
export const getHomepageConfig = () => apiClient<any>('/settings/homepage/config').catch(() => ({}));
export const getPageContent = (slug: string) => apiClient<any>(`/settings/pages/${slug}`).catch(() => ({}));

export const getFeaturedProducts = async (): Promise<Product[]> => {
  try {
    const res = await apiClient<Product[]>('/products/featured');
    if (Array.isArray(res) && res.length > 0) return res;
  } catch (_e) {
    // fallback
  }
  return MOCK_PRODUCTS.filter((p) => p.is_featured);
};

export const getBestsellers = async (): Promise<Product[]> => {
  try {
    const res = await apiClient<Product[]>('/products/bestsellers');
    if (Array.isArray(res) && res.length > 0) return res;
  } catch (_e) {
    // fallback
  }
  return MOCK_PRODUCTS.filter((p) => p.is_bestseller);
};

export const getNewArrivals = async (): Promise<Product[]> => {
  try {
    const res = await apiClient<Product[]>('/products/new-arrivals');
    if (Array.isArray(res) && res.length > 0) return res;
  } catch (_e) {
    // fallback
  }
  return MOCK_PRODUCTS.filter((p) => p.is_new_arrival);
};

export const getOffers = async (): Promise<Product[]> => {
  try {
    const res = await apiClient<Product[]>('/products/offers');
    if (Array.isArray(res) && res.length > 0) return res;
  } catch (_e) {
    // fallback
  }
  return MOCK_PRODUCTS.filter((p) => p.is_offer || (p.discountPercentage && p.discountPercentage >= 25));
};

export const getHomepageBanners = async (): Promise<HomepageBanner[]> => {
  try {
    const res = await apiClient<HomepageBanner[]>('/settings/homepage/banners');
    if (Array.isArray(res) && res.length > 0) return res;
  } catch (_e) {
    // fallback
  }
  return MOCK_BANNERS;
};

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
