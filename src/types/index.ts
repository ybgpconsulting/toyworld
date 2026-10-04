export interface ProductImage {
  id?: string | number;
  url: string;
  image_url?: string;
  alt?: string;
  isPrimary?: boolean;
}

export interface ProductVariant {
  id?: string | number;
  productId?: string | number;
  product_id?: number;
  name: string;
  sku?: string;
  price?: number;
  mrp?: number;
  selling_price?: number;
  stock?: number;
  stock_quantity?: number;
  attributes?: Record<string, string>;
}

export interface Product {
  id: string | number;
  slug: string;
  name: string;
  sku?: string;
  description?: string;
  short_description?: string;
  categoryId?: string | number;
  category_id?: number;
  category_name?: string;
  brandId?: string | number;
  brand_id?: number;
  brand_name?: string;
  price: number;
  selling_price?: number;
  mrp: number;
  discountPercentage?: number;
  discount_percentage?: number;
  stock?: number;
  stock_quantity?: number;
  low_stock_threshold?: number;
  images: ProductImage[];
  variants?: ProductVariant[];
  status?: string;
  is_active?: boolean | number;
  is_featured?: boolean | number;
  is_bestseller?: boolean | number;
  is_new_arrival?: boolean | number;
  is_offer?: boolean | number;
  rating?: number;
  reviewCount?: number;
  badges?: string[];
  ageGroup?: string;
  age_group?: string;
  material?: string;
  gender?: string;
  createdAt?: string;
  created_at?: string;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
  image_url?: string;
  parentId?: number | null;
  parent_id?: number | null;
  display_order?: number;
  is_active?: boolean | number;
}

export interface Brand {
  id: number;
  slug: string;
  name: string;
  description?: string;
  logoUrl?: string;
  logo_url?: string;
  display_order?: number;
  is_active?: boolean | number;
}

export interface CartItem {
  id: string; // unique cart item id
  productId: string | number;
  variantId?: string | number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  variantName?: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  total: number;
  discount: number;
}

export interface OrderAddress {
  fullName?: string;
  customer_name?: string;
  mobile?: string;
  customer_phone?: string;
  alternateMobile?: string;
  email?: string;
  flat?: string;
  flat_house?: string;
  street?: string;
  street_locality?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export interface OrderItem {
  id?: number;
  productId?: string | number;
  product_id?: number;
  variantId?: string | number;
  variant_id?: number;
  name?: string;
  product_name?: string;
  variant_name?: string;
  sku?: string;
  price?: number;
  selling_price?: number;
  mrp?: number;
  total_price?: number;
  quantity: number;
  image_url?: string;
}

export interface Order {
  id: number;
  orderNumber?: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  items?: OrderItem[];
  address?: OrderAddress;
  subtotal: number;
  shipping?: number;
  shipping_amount?: number;
  discount?: number;
  discount_amount?: number;
  coupon_code?: string;
  total?: number;
  grand_total: number;
  order_status: string;
  payment_status: string;
  shipping_status: string;
  tracking_number?: string;
  internal_note?: string;
  customer_note?: string;
  created_at: string;
  createdAt?: string;
}

export interface Review {
  id: number;
  productId?: string | number;
  product_id?: number;
  product_name?: string;
  customer_name: string;
  userName?: string;
  rating: number;
  title?: string;
  body?: string;
  comment?: string;
  is_approved?: boolean | number;
  created_at: string;
}

export interface ReviewSummary {
  average: number;
  count: number;
  distribution?: Record<number, number>;
}

export interface StoreSettings {
  storeName?: string;
  store_name?: string;
  whatsappNumber?: string;
  store_whatsapp?: string;
  store_phone?: string;
  currency?: string;
  socialLinks?: Record<string, string>;
  [key: string]: any;
}

export interface HomepageBanner {
  id: number;
  imageUrl?: string;
  image_url?: string;
  mobileImageUrl?: string;
  link?: string;
  cta_link?: string;
  title?: string;
  subtitle?: string;
  cta_text?: string;
  active?: boolean;
  is_active?: boolean;
}

export interface HomepageSection {
  id: number;
  section_key?: string;
  type?: string;
  title?: string;
  active?: boolean;
  is_active?: boolean;
  order?: number;
  display_order?: number;
  data?: any;
}

export interface ShippingRule {
  id: number;
  name: string;
  rule_type?: string;
  type?: string;
  state_name?: string;
  rate?: number;
  shipping_amount?: number;
  is_free?: boolean | number;
  min_order_value?: number;
  threshold?: number;
  states?: string[];
  priority?: number;
}

export interface Coupon {
  id: number;
  code: string;
  type: string;
  value: number;
  min_order_value?: number;
  minPurchase?: number;
  max_discount?: number | null;
  maxDiscount?: number;
  expiryDate?: string;
  used_count?: number;
  is_active?: boolean | number;
  active?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface FilterState {
  categories?: string[];
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  ageGroups?: string[];
  inStockOnly?: boolean;
}

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'rating';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface AdminUser {
  id: string | number;
  username: string;
  name: string;
  role: string;
  email?: string;
}
