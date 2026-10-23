# Savor & Co. — Multi-User Cloud SQL Database & Vercel Setup

Upgrade from Google Sheets to a **100% Free, High-Speed Serverless PostgreSQL Database**. This setup runs directly inside the code as a Vercel Serverless Function (`/api/pos`), handles multiple concurrent users seamlessly, and requires **zero URL pasting on staff devices**.

---

## 🔐 Role Access & Authentication Model

### 1. Admin Role (`admin.html`)
- **Access Prompt**: Clicking **Admin / Owner** on `index.html` prompts for **Password ONLY** (no username field).
- **Master Admin Password**: **`ADMIN`**
- **Capabilities**: Full access to restaurant revenue analytics, live orders, menu editing, staff accounts management, database sync, and workspace reset.
- **Staff Accounts Creation**: Admin can create new staff accounts in **Admin > Staff** (`+ Add staff`) with **Full Name**, **Username**, **Password**, and assigned **Role**.

### 2. Staff Roles (`waiter.html`, `kitchen.html`, `cashier.html`, `semi-admin.html`)
- **Access Prompt**: Clicking any staff role prompts for **Username & Password**.
- **Credentials**: Created by the Admin in Staff Management. Starter demo accounts are pre-seeded:
  - **Waiter**: Username: `waiter` / Password: `waiter`
  - **Kitchen Pass**: Username: `kitchen` / Password: `kitchen`
  - **Cashier**: Username: `cashier` / Password: `cashier`
  - **Semi Admin**: Username: `manager` / Password: `manager`
- **Role Enforcement**: If a user logs in with a `Waiter` account under the `Kitchen` portal, the system validates the role mismatch and instructs them to sign in under their assigned role.

---

## 🚀 Why Cloud SQL (PostgreSQL) is Better Than Google Sheets

| Feature | Google Sheets + Apps Script | Serverless PostgreSQL (Neon / Vercel) |
|---|---|---|
| **Query Latency** | 2,000ms – 5,000ms (Slow) | **15ms – 50ms (Instant!)** |
| **Multiple Concurrent Users** | Locking errors & quota limits when 2+ waiters submit at once | **ACID compliant & row-level locks (50+ staff simultaneously)** |
| **Google Auth & Redirects** | Frequent 403 / "Sign in with Google" errors | **Zero authentication issues (Native HTTPS API)** |
| **Staff Device Setup** | Must copy & paste `/exec` URL onto every phone/tablet | **Zero setup! All devices open `your-pos.vercel.app` and sync automatically** |
| **Hosting on Vercel** | External Google dependency | **Runs natively on Vercel Serverless Functions (`/api/pos`)** |
| **Cost** | Free | **100% Free forever (Neon / Vercel free tier)** |

---

## ⚡ 2-Minute Setup Guide (Free Cloud SQL Database)

### Step 1: Get a Free PostgreSQL Database
You can use **Neon** (the most popular serverless Postgres for Vercel, free forever, no credit card required):
1. Go to **[neon.tech](https://neon.tech)** and click **Sign Up** (with GitHub or Google).
2. Click **Create Project** (Name it e.g. `savor-pos`).
3. Under **Connection Details**, copy your connection string (`DATABASE_URL`).
   It will look like:
   ```env
   postgresql://neondb_owner:npg_xxxxxx@ep-cool-fog-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

*(Alternative: You can also use 1-click **Vercel Postgres** or **Supabase**).*

---

### Step 2: Deploy to Vercel

#### Method A: Via GitHub (Recommended)
1. Push this project folder to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "feat: multi-user SQL POS system with staff auth and semi-admin"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/savor-pos.git
   git push -u origin main
   ```
2. Go to **[vercel.com](https://vercel.com)** and log in.
3. Click **Add New** > **Project** and select your `savor-pos` repository.
4. Expand **Environment Variables** and add:
   - **Key**: `DATABASE_URL`
   - **Value**: *(Paste your Neon connection string from Step 1)*
5. Click **Deploy**!

#### Method B: Via Vercel CLI
1. In your terminal inside this project folder, run:
   ```bash
   npx vercel
   ```
2. When prompted, add the environment variable:
   ```bash
   npx vercel env add DATABASE_URL
   ```
3. Deploy to production:
   ```bash
   npx vercel --prod
   ```

---

## 📱 How Staff Use the POS (Zero Configuration!)

Once published to Vercel (e.g. `https://savor-pos.vercel.app`), the frontend automatically detects and connects to the built-in `/api/pos` serverless backend!

Staff simply open the main site or their role link on any device:

- **Landing Portal**: `https://savor-pos.vercel.app/index.html`
- **Waiter Phone / Tablet**: `https://savor-pos.vercel.app/waiter.html`
- **Kitchen Tablet / Monitor**: `https://savor-pos.vercel.app/kitchen.html`
- **Cashier Counter PC**: `https://savor-pos.vercel.app/cashier.html`
- **Semi Admin (Menu & Orders)**: `https://savor-pos.vercel.app/semi-admin.html`
- **Admin Dashboard**: `https://savor-pos.vercel.app/admin.html`

### Real-Time Staff Workflow:
1. **Waiter** signs in with username & password, takes orders on floor & taps **Send to Kitchen** (takes ~30ms).
2. **Kitchen** tablet instantly chimes, displays the ticket, and the chef taps **Ready** for each dish as it finishes.
3. **Waiter** gets an instant notification on their phone to pick up and serve the dish.
4. **Cashier** sees the updated status in real time and taps **Paid** once payment is collected.
5. **Semi Admin** edits dishes, adjusts prices/descriptions, and monitors live orders without accessing financial settings.
6. **Admin** monitors real-time sales, creates staff accounts, and controls master settings.

---

## 🛠️ Automatic Database Table Initialization

You do **not** have to create any SQL tables or columns manually. The first time the app receives a request, `/api/pos` automatically creates and indexes:

- `orders` (`id`, `code`, `status`, `items` JSONB, `total`, `payment`, `table`, `customer`, `createdAt`, `updatedAt`)
- `menu` (`id`, `name`, `category`, `description`, `ingredients`, `price`, `emoji`, `image`, `available`)
- `accounts` (`id`, `name`, `username`, `password`, `role`, `status`)
- Auto-seeds starter menu items and starter accounts (`admin`, `manager`, `waiter`, `kitchen`, `cashier`).
