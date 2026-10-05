# TOY WORLD — Pan-India Toy E-Commerce Platform

A production-ready, mobile-first Pan-India toy e-commerce platform built for **TOY WORLD** (Hisar, Haryana | WhatsApp: `+91 9416217374`).

Designed like a high-performance native mobile shopping app with seamless WhatsApp-coordinated guest ordering, Cloudflare edge serverless infrastructure, atomic inventory management, and two-way Google Sheets operational sync.

---

## 🚀 Technology Stack

- **Frontend:** React 19 + TypeScript + Vite 8.3 + Tailwind CSS v4 + TanStack Query v5 + Zustand
- **Backend:** Cloudflare Workers + Hono framework + TypeScript
- **Database:** Cloudflare D1 (Serverless SQLite with relational schema, foreign keys & indexes)
- **Media & Storage:** Cloudflare R2 (`toy-world-media`) via authenticated Worker upload endpoint
- **Operations:** Two-way Google Sheets sync via Google Apps Script webhook
- **Ordering & Payments:** Guest checkout, atomic transactions, manual WhatsApp coordination (`https://wa.me/919416217374`)
- **Authentication:** Admin JWT with PBKDF2 Web Crypto password hashing (100,000 iterations)

---

## 📦 Project Structure

```text
toy-world/
├── dist/                     # Optimized production bundle (served via Cloudflare Assets)
├── public/                   # Static assets (logo.svg, logo.png, favicon, etc.)
├── src/
│   ├── components/           # UI, layout, cart, product, admin & filter components
│   ├── pages/                # Customer routes (Home, Category, Product, Cart, Checkout, etc.)
│   │   └── admin/            # Admin portal (Dashboard, Products, Orders, Shipping, etc.)
│   ├── stores/               # Zustand stores (cartStore, authStore)
│   ├── lib/                  # Unified API client
│   └── types/                # TypeScript interfaces and schemas
├── worker/
│   ├── migrations/           # 0001_initial.sql (20 relational tables + indexes)
│   ├── seed/                 # seed.sql (Categories, brands, products with variants, etc.)
│   └── src/                  # Hono backend with all public & admin endpoints
├── google-apps-script/
│   └── Code.gs               # Two-way Google Sheets sync script
└── wrangler.toml             # Cloudflare Workers, Assets, D1, and R2 configuration
```

---

## 🛠️ Quick Start (Local Development)

### 1. Install Dependencies
```bash
# In project root
npm install

# In worker directory
cd worker && npm install && cd ..
```

### 2. Set Up Local D1 Database
Apply the schema migration and insert initial seed products, categories, shipping rules, and admin user:
```bash
npm run db:migrate
npm run db:seed
```

Checkout quotes and order totals are calculated by the Worker from current D1 prices, stock, coupons, and shipping rules. Shipping resolution is deterministic: matching pincode prefix (longest prefix, then configured priority), matching state rule, qualifying free-shipping threshold, then flat/default rate. Order writes use a D1 batch; database triggers conditionally deduct stock, reserve coupon usage, log inventory changes, and restore stock once on cancellation. Apply all migrations before running local ordering flows.

### 3. Configure Admin Credentials Securely
The repo does not ship a production-ready admin password. The first admin login is intentionally blocked until a secure password is configured.

```bash
curl -X POST http://localhost:8787/api/admin/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"ChooseA_Strong_12Plus_Secret!","email":"admin@toyworld.in","name":"Store Admin"}'
```

Set production secrets with Cloudflare instead of committing them to source control:
```bash
npx wrangler secret put ADMIN_JWT_SECRET
npx wrangler secret put GOOGLE_SHEETS_WEBHOOK_SECRET
```

### 4. Start Local Development Servers
In Terminal 1 (Cloudflare Worker API on port 8787):
```bash
npm run worker:dev
```

In Terminal 2 (Vite Frontend on port 5173):
```bash
npm run dev
```

Open `http://localhost:5173` in your browser. The Vite proxy forwards `/api` requests to `http://localhost:8787`.

---

## 🔐 Admin Portal

- **URL:** `http://localhost:5173/admin/login` (or `/admin` in production)
- **Initial Username:** `admin`
- **Initial Password:** Must be configured on first run via the setup endpoint.

*Note: The default password is not treated as a valid production credential. Password setup is intentionally enforced before login.*

### Admin Features
- **Dashboard:** Real-time revenue, new order badges, low stock alerts, and quick actions.
- **Product Management:** Full CRUD with multiple variants (color, size, pack), stock levels, and R2 media upload.
- **Order Management:** Status transitions (order, payment, shipping), tracking numbers, internal notes, WhatsApp direct customer links, and printable invoices.
- **Pan-India Shipping Rules:** Flat rate, state-specific rates, and free delivery thresholds.
- **Coupons:** Flat and percentage discounts with minimum order thresholds and usage caps.
- **Reviews:** Moderation queue for approving/rejecting customer feedback.
- **Homepage & Settings:** Announcement bar, hero banners, and showroom contact info.

---

## ☁️ Cloudflare Production Deployment

### 1. Create Cloudflare D1 Database
```bash
npx wrangler d1 create toy-world-db
```
*Copy the returned `database_id` into `wrangler.toml` under `[[d1_databases]]`.*

### 2. Create Cloudflare R2 Bucket
```bash
npx wrangler r2 bucket create toy-world-media
```

### 3. Apply Remote Migrations & Seed Data
```bash
npm run db:migrate:prod
npm run db:seed:prod
```

### 4. Set Production Secrets
```bash
npx wrangler secret put ADMIN_JWT_SECRET
npx wrangler secret put GOOGLE_SHEETS_WEBHOOK_SECRET
```

### 5. Build and Deploy
```bash
npm run build
npm run worker:deploy
```

Your full-stack application will be live globally on Cloudflare Edge with static assets served from Cloudflare's CDN.

---

## 📊 Google Sheets Operational Integration

1. In Google Drive, create a new Google Sheet named **TOY WORLD Orders**.
2. Open **Extensions > Apps Script**.
3. Replace the contents of the script editor with the code in `google-apps-script/Code.gs`.
4. Run `initialSetup()` to automatically configure table headers, formatting, and status dropdown data validation.
5. Click **Deploy > New deployment**, select **Web app**, set:
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
6. Copy the Web App URL and paste it into **Admin Portal > Settings > Google Sheets URL**.

New orders placed on the website will instantly append to the Google Sheet. Status changes in the sheet will automatically sync back to Cloudflare D1!
