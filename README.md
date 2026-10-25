# ✦ Savor & Co. — Cloud Restaurant POS & CMS

> Modern, real-time, multi-user restaurant Content Management System (CMS) and Point-of-Sale (POS) powered by **Supabase PostgreSQL & Realtime WebSockets**, deployable 100% online on Vercel.

---

## 🚀 Key Modules & Capabilities

- 👑 **Restaurant CMS & Admin Hub** (`/admin.html`):
  - **Menu & Dish CMS**: Visual catalog, category filters, allergen tags, and instant **86 / Out of Stock** toggles.
  - **Floor & Tables CMS**: Visual dining room floor plans, sections (Main Dining, Patio, VIP Room, Bar Counter), and capacities.
  - **Staff & Access Control**: Role management (Owner, Manager, Cashier, Chef, Waiter) with 4-digit PINs for quick tablet switching.
  - **Live Orders & Audit Log**: Full transaction history, itemized breakdowns, void/mark-paid controls.
  - **Executive Analytics**: Live collected revenue, awaiting payment tally, average check size, and top-selling dishes.
- 🛎️ **Floor Waiter Portal** (`/waiter.html`):
  - Mobile phone optimized for waitstaff on the dining floor.
  - Visual category tabs, table selector, and item notes (*"extra ice"*, *"less salt"*).
  - **Live Ready Alert**: When the kitchen plates a dish, the waiter's phone vibrates/chimes with an instant "Ready to Serve" prompt.
- 👨‍🍳 **Kitchen Display Pass (KDS)** (`/kitchen.html`):
  - High-contrast station display for line chefs.
  - **Real-Time Audio Order Chimes**: Synthesized Web Audio alert sounds immediately when a waiter sends an order.
  - Dish-by-dish checkoffs with urgency timers (<8 min green, 8–15 min amber, 15+ min pulsating red).
- 💳 **Cashier & Billing Counter** (`/cashier.html`):
  - Live billing counter showing all dining tables awaiting payment.
  - Split bills, Senior Citizen / PWD 20% statutory discount calculator, and cash change calculator.
  - Itemized printable receipts formatted for thermal POS printers or PDF.
- 📋 **Floor Manager Portal** (`/semi-admin.html`):
  - Instant mobile 86/sold-out toggle and on-the-fly dish price updates.

---

## ⚡ Connecting Supabase Cloud (3 Steps)

### Step 1: Create a Free Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free project.

### Step 2: Run the 1-Click Database Schema
1. In your Supabase Dashboard, open **SQL Editor**.
2. Open [`supabase-schema.sql`](file:///c:/Users/USER/Desktop/claude%20-%20Copy%20%282%29/supabase-schema.sql) in this repository and paste the entire script into the SQL Editor.
3. Click **Run**.
*(This creates `menu`, `categories`, `tables`, `orders`, and `accounts` tables, sets up Row Level Security, inserts starter seed data, and enables Supabase Realtime WebSockets replication!)*

### Step 3: Connect in the App or on Vercel
- **Direct in Browser**: Click **Connect Supabase** on the top navigation bar of any page and paste your **Project URL** and **Anon Key** (found under *Supabase Dashboard > Project Settings > API*).
- **On Vercel (Production)**: In your Vercel Project Settings > **Environment Variables**, add:
  - `SUPABASE_URL`: `https://your-project.supabase.co`
  - `SUPABASE_ANON_KEY`: `your-anon-public-key`
  - `DATABASE_URL`: `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`

---

## 🔐 Default Starter Accounts & Quick PINs

| Station / Role | Page | Quick PIN | Username | Password |
|---|---|---|---|---|
| **Admin & Owner CMS** | `/admin.html` | `1212` | `admin` | `ADMIN` |
| **Floor Manager** | `/semi-admin.html` | `2222` | `manager` | `manager` |
| **Floor Waiter** | `/waiter.html` | `3333` | `waiter` | `waiter` |
| **Kitchen Display (KDS)** | `/kitchen.html` | `4444` | `kitchen` | `kitchen` |
| **Cashier & Billing** | `/cashier.html` | `5555` | `cashier` | `cashier` |

---

## 🌐 Deploying to Vercel (Publish Online)

```bash
git add .
git commit -m "feat: complete restaurant CMS & multi-user POS with Supabase Realtime"
git push origin main
```

Import the repository in [vercel.com](https://vercel.com) and deploy! Your restaurant system is instantly live with zero server machines required in the restaurant.
