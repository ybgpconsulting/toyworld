CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'admin',
  active BOOLEAN NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  parent_id INTEGER,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  seo_title TEXT,
  seo_description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS brands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sku TEXT UNIQUE,
  category_id INTEGER REFERENCES categories(id),
  brand_id INTEGER REFERENCES brands(id),
  short_description TEXT,
  description TEXT,
  specifications JSON,
  age_group TEXT,
  material TEXT,
  gender TEXT,
  mrp REAL NOT NULL,
  selling_price REAL NOT NULL,
  discount_percentage REAL DEFAULT 0,
  tax_percentage REAL DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  is_featured BOOLEAN DEFAULT 0,
  is_bestseller BOOLEAN DEFAULT 0,
  is_new_arrival BOOLEAN DEFAULT 0,
  is_offer BOOLEAN DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  tags JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id),
  name TEXT,
  sku TEXT,
  mrp REAL,
  selling_price REAL,
  stock_quantity INTEGER DEFAULT 0,
  image_url TEXT,
  is_available BOOLEAN DEFAULT 1,
  variant_type TEXT,
  variant_value TEXT,
  display_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id),
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id),
  order_id INTEGER,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT,
  is_approved BOOLEAN DEFAULT 0,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_alternate_phone TEXT,
  customer_email TEXT,
  subtotal REAL NOT NULL,
  discount_amount REAL DEFAULT 0,
  coupon_code TEXT,
  shipping_amount REAL DEFAULT 0,
  grand_total REAL NOT NULL,
  order_status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  shipping_status TEXT DEFAULT 'unshipped',
  tracking_number TEXT,
  customer_note TEXT,
  internal_note TEXT,
  whatsapp_link TEXT,
  sheets_synced BOOLEAN DEFAULT 0,
  sheets_row INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,
  variant_id INTEGER,
  variant_name TEXT,
  sku TEXT,
  quantity INTEGER NOT NULL,
  mrp REAL NOT NULL,
  selling_price REAL NOT NULL,
  total_price REAL NOT NULL,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS order_addresses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  flat_house TEXT NOT NULL,
  building_society TEXT,
  street_locality TEXT NOT NULL,
  landmark TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  country TEXT DEFAULT 'India'
);

CREATE TABLE IF NOT EXISTS order_status_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  status_type TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coupons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  value REAL NOT NULL,
  min_order_value REAL DEFAULT 0,
  max_discount REAL,
  start_date DATETIME,
  end_date DATETIME,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coupon_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coupon_id INTEGER NOT NULL REFERENCES coupons(id),
  order_id INTEGER NOT NULL REFERENCES orders(id),
  used_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shipping_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rule_type TEXT NOT NULL,
  name TEXT NOT NULL,
  state_name TEXT,
  pincode_prefix TEXT,
  min_order_value REAL DEFAULT 0,
  max_order_value REAL,
  shipping_amount REAL NOT NULL,
  is_free BOOLEAN DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  priority INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS homepage_banners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  subtitle TEXT,
  image_url TEXT,
  cta_text TEXT,
  cta_link TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS homepage_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_key TEXT NOT NULL UNIQUE,
  title TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  config TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS store_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL DEFAULT '',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS page_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id),
  variant_id INTEGER,
  change_amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  order_id INTEGER REFERENCES orders(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rate_limit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip_address TEXT NOT NULL,
  endpoint TEXT,
  request_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_bestseller ON products(is_bestseller);
CREATE INDEX IF NOT EXISTS idx_products_new ON products(is_new_arrival);
CREATE INDEX IF NOT EXISTS idx_products_offer ON products(is_offer);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_rate_limit_ip ON rate_limit_log(ip_address, request_time);

-- ============================================================
-- DEFAULT ADMIN USER
-- IMPORTANT: After running migrations, set admin password by running:
-- npx wrangler d1 execute toy-world-db --command "SELECT * FROM admin_users"
-- Then use the Admin Panel first-run setup or the worker setup script
-- Default password is: ToyWorld@2024 (must be hashed via PBKDF2 before storing)
-- The setup endpoint POST /api/admin/auth/setup will hash and store it on first run
-- ============================================================
INSERT OR IGNORE INTO admin_users (username, password_hash, email, name, role, active)
VALUES ('admin', 'SETUP_REQUIRED', 'admin@toyworld.in', 'Store Admin', 'superadmin', 1);

-- ============================================================
-- DEFAULT STORE SETTINGS
-- ============================================================
INSERT OR IGNORE INTO store_settings (key, value) VALUES
('store_name', 'TOY WORLD'),
('store_tagline', 'Where Every Child Finds Joy'),
('store_phone', '9416217374'),
('store_whatsapp', '9416217374'),
('store_email', 'contact@toyworld.in'),
('store_address', 'India'),
('store_city', 'Hisar'),
('store_state', 'Haryana'),
('store_pincode', '125001'),
('business_hours', 'Mon-Sat: 10am-8pm | Sun: 11am-6pm'),
('about_text', 'TOY WORLD is your trusted destination for quality toys across India.'),
('announcement_bar_text', 'Free Delivery on orders above Rs 999 | Pan India Shipping Available!'),
('announcement_bar_active', '1'),
('whatsapp_cta_text', 'Chat with us on WhatsApp for instant support!'),
('instagram_url', ''),
('facebook_url', ''),
('youtube_url', ''),
('google_sheets_url', ''),
('currency_symbol', 'Rs'),
('min_order_value', '0'),
('default_meta_title', 'TOY WORLD - Buy Toys Online | Pan India Delivery'),
('default_meta_description', 'Shop the best toys for kids of all ages at TOY WORLD. Educational toys, RC cars, dolls, puzzles and more. Fast Pan-India delivery.');

-- ============================================================
-- DEFAULT SHIPPING RULES
-- ============================================================
INSERT OR IGNORE INTO shipping_rules (rule_type, name, min_order_value, shipping_amount, is_free, is_active, priority)
VALUES ('free_threshold', 'Free Shipping on orders above Rs 999', 999, 0, 1, 1, 100);

INSERT OR IGNORE INTO shipping_rules (rule_type, name, min_order_value, shipping_amount, is_free, is_active, priority)
VALUES ('flat_rate', 'Standard Delivery', 0, 79, 0, 1, 1);

INSERT OR IGNORE INTO shipping_rules (rule_type, name, state_name, min_order_value, shipping_amount, is_free, is_active, priority)
VALUES
('state', 'Delhi Delivery', 'Delhi', 0, 49, 0, 1, 10),
('state', 'Haryana Delivery', 'Haryana', 0, 49, 0, 1, 10),
('state', 'Punjab Delivery', 'Punjab', 0, 49, 0, 1, 10),
('state', 'Uttar Pradesh Delivery', 'Uttar Pradesh', 0, 59, 0, 1, 10),
('state', 'Rajasthan Delivery', 'Rajasthan', 0, 59, 0, 1, 10),
('state', 'Maharashtra Delivery', 'Maharashtra', 0, 79, 0, 1, 10),
('state', 'Gujarat Delivery', 'Gujarat', 0, 79, 0, 1, 10),
('state', 'Karnataka Delivery', 'Karnataka', 0, 79, 0, 1, 10),
('state', 'Tamil Nadu Delivery', 'Tamil Nadu', 0, 99, 0, 1, 10),
('state', 'West Bengal Delivery', 'West Bengal', 0, 99, 0, 1, 10);

-- ============================================================
-- DEFAULT HOMEPAGE SECTIONS
-- ============================================================
INSERT OR IGNORE INTO homepage_sections (section_key, title, display_order, is_active) VALUES
('hero_banners', 'Hero Banners', 1, 1),
('categories', 'Shop by Category', 2, 1),
('featured_products', 'Featured Products', 3, 1),
('bestsellers', 'Best Sellers', 4, 1),
('new_arrivals', 'New Arrivals', 5, 1),
('offers', 'Special Offers', 6, 1),
('age_groups', 'Shop by Age', 7, 1),
('why_us', 'Why Shop With Us', 8, 1),
('whatsapp_cta', 'WhatsApp Support', 9, 1);

-- ============================================================
-- DEFAULT HOMEPAGE BANNERS
-- ============================================================
INSERT OR IGNORE INTO homepage_banners (title, subtitle, cta_text, cta_link, display_order, is_active)
VALUES
('Explore a World of Toys!', 'Discover educational, fun and creative toys for every age', 'Shop Now', '/shop', 1, 1),
('Free Delivery on Rs 999+', 'Pan India shipping on all orders above Rs 999', 'Shop Now', '/shop', 2, 1),
('Back to School Specials', 'Educational toys and STEM kits starting at Rs 299', 'View Offers', '/category/educational-toys', 3, 1);

