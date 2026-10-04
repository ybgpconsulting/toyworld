-- ============================================================
-- TOY WORLD — Pan-India Toy Showroom & E-Commerce Seed Data
-- Database: Cloudflare D1 (SQLite compatible)
-- Store WhatsApp: 9416217374
-- ============================================================

-- Store Settings
INSERT OR REPLACE INTO store_settings (key, value) VALUES
('store_name', 'TOY WORLD'),
('store_tagline', 'Where Every Child Finds Joy'),
('store_phone', '9416217374'),
('store_whatsapp', '9416217374'),
('store_email', 'contact@toyworld.in'),
('store_address', '123 Market Road, Main Bazar'),
('store_city', 'Hisar'),
('store_state', 'Haryana'),
('store_pincode', '125001'),
('business_hours', 'Mon–Sat: 10am–8pm | Sun: 11am–6pm'),
('about_text', 'TOY WORLD is your trusted premier destination for quality toys across India. We bring joy to children of all ages with a carefully curated selection of educational, creative, and fun toys.'),
('announcement_bar_text', '🚚 Free Delivery on orders above ₹999 | Pan India Shipping Available!'),
('announcement_bar_active', '1'),
('whatsapp_cta_text', 'Chat with us on WhatsApp for instant assistance!'),
('instagram_url', 'https://instagram.com/toyworld'),
('facebook_url', 'https://facebook.com/toyworld'),
('youtube_url', 'https://youtube.com/@toyworld'),
('google_sheets_url', ''),
('min_order_value', '0'),
('currency_symbol', '₹'),
('default_meta_title', 'TOY WORLD - Buy Toys Online | Pan India Delivery'),
('default_meta_description', 'Shop the best toys for kids of all ages at TOY WORLD. Educational toys, RC cars, dolls, puzzles, building blocks & more. Fast Pan-India delivery.');

-- Shipping Rules
INSERT OR IGNORE INTO shipping_rules (rule_type, name, min_order_value, shipping_amount, is_free, is_active, priority)
VALUES ('free_threshold', 'Free Delivery on ₹999+', 999, 0, 1, 1, 100);

INSERT OR IGNORE INTO shipping_rules (rule_type, name, min_order_value, shipping_amount, is_free, is_active, priority)
VALUES ('flat_rate', 'Standard Pan-India Delivery', 0, 79, 0, 1, 1);

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

-- Homepage Sections
INSERT OR IGNORE INTO homepage_sections (section_key, title, display_order, is_active, config) VALUES
('hero_banners', 'Hero Banners', 1, 1, '{"auto_play": true}'),
('categories', 'Shop by Category', 2, 1, '{"limit": 8}'),
('featured_products', 'Featured Products', 3, 1, '{"limit": 10}'),
('bestsellers', 'Best Sellers', 4, 1, '{"limit": 10}'),
('new_arrivals', 'New Arrivals', 5, 1, '{"limit": 10}'),
('offers', 'Special Offers', 6, 1, '{"limit": 10}'),
('age_groups', 'Shop by Age', 7, 1, '{}'),
('why_us', 'Why Shop With Us', 8, 1, '{}'),
('whatsapp_cta', 'WhatsApp Support', 9, 1, '{}');

-- Homepage Banners
INSERT OR IGNORE INTO homepage_banners (title, subtitle, image_url, cta_text, cta_link, display_order, is_active) VALUES
('Explore a World of Toys!', 'Discover educational, fun, and creative toys for every age', 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=1200', 'Shop Now', '/shop', 1, 1),
('Back to School Specials', 'Educational toys and STEM kits starting at ₹299', 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=1200', 'View Offers', '/category/educational-toys', 2, 1),
('Free Delivery on ₹999+', 'Pan India fast shipping on all orders above ₹999', 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1200', 'Explore Catalog', '/shop', 3, 1);

-- Brands
INSERT OR IGNORE INTO brands (name, slug, description, display_order, is_active) VALUES
('LEGO', 'lego', 'The world famous building bricks and creative sets', 1, 1),
('Hot Wheels', 'hot-wheels', 'High speed die-cast cars and track systems', 2, 1),
('Barbie', 'barbie', 'Fashion dolls, dreamhouses, and accessories', 3, 1),
('Nerf', 'nerf', 'Foam blasters, sports toys, and active gear', 4, 1),
('Funskool', 'funskool', 'Leading Indian toy brand for board games and puzzles', 5, 1),
('Fisher-Price', 'fisher-price', 'Early childhood and infant development toys', 6, 1),
('Hasbro Gaming', 'hasbro-gaming', 'Monopoly, Jenga, Twister, and classic family games', 7, 1),
('Play-Doh', 'play-doh', 'Creative modeling compound and fun tools', 8, 1);

-- Categories
INSERT OR IGNORE INTO categories (name, slug, description, display_order, is_active) VALUES
('Educational Toys', 'educational-toys', 'Learn while playing with our range of educational and STEM toys', 1, 1),
('Remote Control', 'remote-control', 'High-speed RC cars, helicopters, stunts, and buggies', 2, 1),
('Dolls & Playsets', 'dolls-playsets', 'Fashion dolls, accessories, and imaginative dreamhouses', 3, 1),
('Action Figures', 'action-figures', 'Superheroes, anime, and character action figures', 4, 1),
('Board Games', 'board-games', 'Classic and modern family board games', 5, 1),
('Puzzles', 'puzzles', 'Jigsaw puzzles and brain teasers for all age groups', 6, 1),
('Outdoor & Sports', 'outdoor-sports', 'Active outdoor toys, sports gear, and play sets', 7, 1),
('Building Blocks', 'building-blocks', 'Interlocking construction bricks and architectural sets', 8, 1),
('Soft Toys', 'soft-toys', 'Ultra-soft plush teddies and huggable animal friends', 9, 1),
('Baby Toys', 'baby-toys', 'Safe, non-toxic, and stimulating sensory toys for 0-3 years', 10, 1);

-- Subcategories (referencing parent via subqueries)
INSERT OR IGNORE INTO categories (name, slug, description, parent_id, display_order, is_active) VALUES
('LEGO Sets', 'lego-sets', 'Genuine LEGO brick sets', (SELECT id FROM categories WHERE slug = 'building-blocks'), 1, 1),
('RC Cars', 'rc-cars', 'Rechargeable remote control racing cars', (SELECT id FROM categories WHERE slug = 'remote-control'), 1, 1),
('STEM Science Kits', 'stem-science', 'Hands-on physics and chemistry experiments', (SELECT id FROM categories WHERE slug = 'educational-toys'), 1, 1);

-- Coupons
INSERT OR IGNORE INTO coupons (code, type, value, min_order_value, max_discount, is_active) VALUES
('WELCOME10', 'percentage', 10, 499, 150, 1),
('TOYWORLD50', 'flat', 50, 699, 50, 1),
('FESTIVE15', 'percentage', 15, 999, 300, 1);

-- Products

-- Product 1: LEGO Starter Set
INSERT OR IGNORE INTO products (
  name, slug, sku, category_id, brand_id, short_description, description,
  age_group, mrp, selling_price, discount_percentage, is_active, is_featured,
  is_bestseller, is_new_arrival, stock_quantity, low_stock_threshold,
  seo_title, seo_description
) VALUES (
  'LEGO Classic Creative Starter Bricks',
  'lego-classic-creative-starter-bricks',
  'LGO-CLSC-001',
  (SELECT id FROM categories WHERE slug = 'building-blocks'),
  (SELECT id FROM brands WHERE slug = 'lego'),
  '480-piece classic construction set for unlimited building ideas',
  'Unleash your child’s creative genius with the genuine LEGO Classic Creative Starter Bricks set. Includes 480 brightly colored bricks in 33 different shades, with doors, windows, wheels, eyes, and propellers.',
  '4-8',
  1499, 1199, 20, 1, 1, 1, 0, 25, 5,
  'LEGO Classic Starter Bricks | Buy Online at TOY WORLD',
  'Buy genuine LEGO Classic 480 pieces online. Best price, pan India delivery from TOY WORLD.'
);

-- Product 2: High Speed 360 RC Stunt Car
INSERT OR IGNORE INTO products (
  name, slug, sku, category_id, brand_id, short_description, description,
  age_group, mrp, selling_price, discount_percentage, is_active, is_featured,
  is_bestseller, is_new_arrival, is_offer, stock_quantity, low_stock_threshold,
  seo_title, seo_description
) VALUES (
  '360° Stunt Tumbler Rechargeable RC Car',
  '360-stunt-tumbler-rechargeable-rc-car',
  'RC-STUNT-360',
  (SELECT id FROM categories WHERE slug = 'remote-control'),
  (SELECT id FROM brands WHERE slug = 'funskool'),
  'High-speed RC car with dual-sided driving and luminous LED wheels',
  'Experience adrenaline-pumping stunt action! Features double-sided 360 degree flips, 2.4GHz anti-interference controller with 50-meter range, high-grip rubber tires, and rechargeable USB battery pack.',
  '6-12',
  1299, 899, 31, 1, 1, 1, 1, 1, 18, 4,
  '360 Stunt RC Car | Remote Control Toys | TOY WORLD',
  'Order high speed double-sided 360 stunt car online. Quick dispatch & WhatsApp checkout.'
);

-- Product 3: Barbie Dream Princess Fashion Doll
INSERT OR IGNORE INTO products (
  name, slug, sku, category_id, brand_id, short_description, description,
  age_group, mrp, selling_price, discount_percentage, is_active, is_featured,
  is_bestseller, is_new_arrival, stock_quantity, low_stock_threshold,
  seo_title, seo_description
) VALUES (
  'Barbie Deluxe Fairy Tale Princess with Tiara',
  'barbie-deluxe-fairy-tale-princess-tiara',
  'BRB-PRNC-002',
  (SELECT id FROM categories WHERE slug = 'dolls-playsets'),
  (SELECT id FROM brands WHERE slug = 'barbie'),
  'Sparkling fairy princess doll with brushable hair and shimmer gown',
  'Inspire magical storytelling with this authentic Barbie Princess doll. Dressed in a sparkling ombre bodice and removable glitter skirt with royal tiara and matching shoes.',
  '3-5',
  999, 749, 25, 1, 1, 0, 1, 15, 3,
  'Barbie Deluxe Princess Doll | Official Toy World',
  'Shop original Barbie Princess Doll online. Ideal birthday gift for girls.'
);

-- Product 4: STEM Robotic DIY Solar Kit
INSERT OR IGNORE INTO products (
  name, slug, sku, category_id, brand_id, short_description, description,
  age_group, mrp, selling_price, discount_percentage, is_active, is_featured,
  is_bestseller, is_new_arrival, stock_quantity, low_stock_threshold,
  seo_title, seo_description
) VALUES (
  '12-in-1 Educational Solar Robot Creation Kit',
  '12-in-1-educational-solar-robot-creation-kit',
  'STEM-SLR-12',
  (SELECT id FROM categories WHERE slug = 'educational-toys'),
  (SELECT id FROM brands WHERE slug = 'funskool'),
  'Build 12 different working motorized robots powered by direct sunlight',
  'Teach green energy and hands-on robotics engineering! Children can construct an auto-bot, turtle bot, dog bot, boat, and more using gears, solar panels, and connectors without any batteries needed.',
  '8-12',
  1699, 1299, 24, 1, 1, 1, 0, 12, 3,
  '12 in 1 Solar Robot STEM Kit | TOY WORLD Hisar',
  'Educational solar powered robotics kit. Hands-on learning for young engineers.'
);

-- Product 5: Hot Wheels 5-Car Gift Pack
INSERT OR IGNORE INTO products (
  name, slug, sku, category_id, brand_id, short_description, description,
  age_group, mrp, selling_price, discount_percentage, is_active, is_featured,
  is_bestseller, is_new_arrival, is_offer, stock_quantity, low_stock_threshold,
  seo_title, seo_description
) VALUES (
  'Hot Wheels 5-Car Collector Multi-Pack',
  'hot-wheels-5-car-collector-multi-pack',
  'HW-PACK-5',
  (SELECT id FROM categories WHERE slug = 'remote-control'),
  (SELECT id FROM brands WHERE slug = 'hot-wheels'),
  'Five 1:64 scale die-cast speed machines with authentic graphics',
  'Jumpstart your speed collection with 5 classic Hot Wheels die-cast vehicles. Designed for track play, ramp jumps, and high-octane racing.',
  '3-8',
  849, 699, 18, 1, 1, 1, 0, 1, 30, 5,
  'Hot Wheels 5-Car Pack | TOY WORLD Online Store',
  'Original Hot Wheels 5 car gift pack for kids and collectors.'
);

-- Product 6: Family Monopoly Board Game
INSERT OR IGNORE INTO products (
  name, slug, sku, category_id, brand_id, short_description, description,
  age_group, mrp, selling_price, discount_percentage, is_active, is_featured,
  is_bestseller, is_new_arrival, stock_quantity, low_stock_threshold,
  seo_title, seo_description
) VALUES (
  'Hasbro Monopoly India Edition Board Game',
  'hasbro-monopoly-india-edition-board-game',
  'HBR-MNP-IND',
  (SELECT id FROM categories WHERE slug = 'board-games'),
  (SELECT id FROM brands WHERE slug = 'hasbro-gaming'),
  'Fast-dealing property trading board game featuring iconic Indian cities',
  'The classic game of buying, selling, and renting properties across India. Includes gameboard, 8 tokens, 28 Title Deed cards, 16 Chance cards, Community Chest cards, money pack, and dice.',
  '8-12',
  1199, 999, 17, 1, 0, 1, 0, 20, 4,
  'Monopoly India Edition | Family Board Games | TOY WORLD',
  'Buy official Monopoly India edition. Family game night favorite.'
);

-- Product Variants
INSERT OR IGNORE INTO product_variants (product_id, name, sku, mrp, selling_price, stock_quantity, variant_type, variant_value)
VALUES
((SELECT id FROM products WHERE slug = '360-stunt-tumbler-rechargeable-rc-car'), 'Neon Blue', 'RC-STUNT-BLUE', 1299, 899, 10, 'Color', 'Blue'),
((SELECT id FROM products WHERE slug = '360-stunt-tumbler-rechargeable-rc-car'), 'Fire Red', 'RC-STUNT-RED', 1299, 899, 8, 'Color', 'Red');

-- Product Images
INSERT OR IGNORE INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
VALUES
((SELECT id FROM products WHERE slug = 'lego-classic-creative-starter-bricks'), 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600', 'LEGO Classic Starter Set', 1, 1),
((SELECT id FROM products WHERE slug = '360-stunt-tumbler-rechargeable-rc-car'), 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=600', '360 Stunt RC Car', 1, 1),
((SELECT id FROM products WHERE slug = 'barbie-deluxe-fairy-tale-princess-tiara'), 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600', 'Barbie Princess Doll', 1, 1),
((SELECT id FROM products WHERE slug = '12-in-1-educational-solar-robot-creation-kit'), 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600', 'STEM Solar Robot Kit', 1, 1),
((SELECT id FROM products WHERE slug = 'hot-wheels-5-car-collector-multi-pack'), 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600', 'Hot Wheels 5 Pack', 1, 1),
((SELECT id FROM products WHERE slug = 'hasbro-monopoly-india-edition-board-game'), 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=600', 'Monopoly Board Game', 1, 1);

-- Reviews
INSERT OR IGNORE INTO reviews (product_id, customer_name, rating, title, body, is_approved)
VALUES
((SELECT id FROM products WHERE slug = 'lego-classic-creative-starter-bricks'), 'Anita Verma', 5, 'Exceptional quality LEGO set', 'My 6-year-old daughter spends hours building houses and castles. Delivered in pristine condition to Gurgaon.', 1),
((SELECT id FROM products WHERE slug = '360-stunt-tumbler-rechargeable-rc-car'), 'Vikram Singh', 5, 'Super fun and durable!', 'Fast delivery to Hisar. The 360 flips work on carpet and tiles seamlessly. WhatsApp ordering was effortless.', 1),
((SELECT id FROM products WHERE slug = 'barbie-deluxe-fairy-tale-princess-tiara'), 'Pooja Sharma', 5, 'Original genuine doll', '100% genuine product. Packaging was securely bubbled. Highly recommend Toy World!', 1);

-- Policy Pages Content
INSERT OR REPLACE INTO page_content (slug, title, content, is_active) VALUES
('about', 'About TOY WORLD', '<h3>Welcome to TOY WORLD</h3><p>TOY WORLD is your trusted premier destination for quality toys across India. We believe every child deserves wholesome entertainment and creative inspiration.</p><p>We stock 100% genuine toys with strict safety standards, delivering joy right to your doorstep across all states and union territories in India.</p><p><strong>Showroom Location:</strong> Hisar, Haryana - 125001<br><strong>WhatsApp Orders:</strong> +91 9416217374</p>', 1),
('shipping-policy', 'Shipping Policy', '<h3>Pan-India Fast Delivery</h3><p>We deliver to over 19,000 pincodes across India. Standard orders are dispatched within 24 to 48 hours.</p><ul><li><strong>Free Delivery:</strong> All orders above ₹999 qualify for Free Standard Delivery.</li><li><strong>Standard Shipping:</strong> Flat ₹79 for orders under ₹999.</li><li><strong>Regional Rates:</strong> Discounted delivery for Delhi, Haryana, Punjab, and Uttar Pradesh.</li></ul>', 1),
('payment-policy', 'Payment Policy', '<h3>WhatsApp Coordinated Payment</h3><p>To provide a personal, secure, and flexible shopping experience, payment is coordinated manually via WhatsApp once your order is confirmed in our system.</p><p>We accept <strong>UPI (Google Pay, PhonePe, Paytm), Bank Transfer (IMPS/NEFT)</strong>. No debit or credit card credentials are stored or requested on this website.</p>', 1),
('return-policy', 'Return & Refund Policy', '<h3>Easy 7-Day Replacement</h3><p>If your toy arrives damaged, defective, or incorrect, contact us on WhatsApp (+91 9416217374) within 7 days of delivery with an unboxing photo or video. We will promptly dispatch a replacement or issue a full refund via UPI.</p>', 1),
('terms', 'Terms & Conditions', '<h3>Terms of Service</h3><p>By placing an order on TOY WORLD, you agree to provide accurate delivery details and coordinate payment via our official WhatsApp number: +91 9416217374.</p>', 1);
