-- =============================================================================
-- SAVOR & CO. — COMPLETE SUPABASE RESTAURANT CMS & POS DATABASE SCHEMA
-- =============================================================================
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- It creates all required tables, indexes, starter seed data, and enables Realtime!
-- =============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Menu Items Table
CREATE TABLE IF NOT EXISTS public.menu (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Main Dish',
    description TEXT DEFAULT '',
    ingredients TEXT DEFAULT '',
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    cost_price NUMERIC(10, 2) DEFAULT 0.00,
    emoji TEXT DEFAULT '🍽️',
    image TEXT DEFAULT '',
    available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    sort_order INT DEFAULT 0,
    icon TEXT DEFAULT 'utensils'
);

-- 4. Restaurant Tables Table
CREATE TABLE IF NOT EXISTS public.tables (
    id TEXT PRIMARY KEY,
    number TEXT NOT NULL UNIQUE,
    capacity INT DEFAULT 4,
    section TEXT DEFAULT 'Main Dining',
    status TEXT DEFAULT 'AVAILABLE', -- AVAILABLE, OCCUPIED, BILL_REQUESTED, CLEANING
    current_order_id TEXT DEFAULT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Staff Accounts Table
CREATE TABLE IF NOT EXISTS public.accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT UNIQUE, -- Nullable for Admin (PIN-only authentication)
    password TEXT DEFAULT '',
    pin TEXT DEFAULT '1212',
    role TEXT NOT NULL DEFAULT 'Waiter', -- Admin, Semi Admin, Waiter, Kitchen, Cashier
    status TEXT NOT NULL DEFAULT 'Active', -- Active, Inactive
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, PREPARING, READY, COMPLETED, CANCELLED
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    subtotal NUMERIC(10, 2) DEFAULT 0.00,
    tax NUMERIC(10, 2) DEFAULT 0.00,
    discount NUMERIC(10, 2) DEFAULT 0.00,
    discount_type TEXT DEFAULT 'NONE',
    payment TEXT NOT NULL DEFAULT 'UNPAID', -- UNPAID, PAID, VOIDED
    payment_method TEXT DEFAULT '', -- CASH, CARD, GCASH, MAYA
    staff TEXT DEFAULT 'Waiter',
    "table" TEXT DEFAULT '',
    customer TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
    paid_at BIGINT DEFAULT NULL
);

-- 7. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment ON public.orders(payment);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_menu_category ON public.menu(category);
CREATE INDEX IF NOT EXISTS idx_menu_available ON public.menu(available);

-- 8. Enable Supabase Realtime Replication for instant multi-user sync
-- This enables WebSockets broadcasting when dishes, orders, or staff change
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.menu;
ALTER PUBLICATION supabase_realtime ADD TABLE public.accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;

-- 9. Row Level Security (RLS) - Permissive public access for POS Terminals
ALTER TABLE public.menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-write for menu" ON public.menu FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for tables" ON public.tables FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for accounts" ON public.accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- 10. Starter Seed Data

-- Categories
INSERT INTO public.categories (id, name, sort_order, icon) VALUES
('cat-app', 'Appetizer', 1, 'soup'),
('cat-main', 'Main Dish', 2, 'utensils'),
('cat-des', 'Dessert', 3, 'cake'),
('cat-drk', 'Drinks', 4, 'glass-water')
ON CONFLICT (id) DO NOTHING;

-- Menu Items
INSERT INTO public.menu (id, name, category, description, ingredients, price, cost_price, emoji, image, available) VALUES
('app-spring-rolls',  'Spring Rolls',  'Appetizer', 'Crisp vegetable spring rolls, six pieces with a sweet chili dip.', 'Cabbage, carrots, glass noodles, wrapper, sweet chili sauce', 180.00, 65.00, '🥟', '', true),
('app-chicken-wings', 'Chicken Wings', 'Appetizer', 'Sticky glazed wings, tossed in a savoury house sauce.', 'Chicken wings, soy sauce, garlic, honey, sesame seeds', 250.00, 95.00, '🍗', '', true),
('main-chicken-rice', 'Chicken Rice',  'Main Dish',  'Tender grilled chicken over fragrant rice with house sauce.', 'Jasmine rice, chicken thigh, garlic, cucumber, soy sauce', 280.00, 105.00, '🍗', '', true),
('main-beef-steak',   'Beef Steak',    'Main Dish',  'Sliced beef sirloin with black pepper glaze and seasonal vegetables.', 'Beef sirloin, black pepper, butter, seasonal vegetables', 420.00, 180.00, '🥩', '', true),
('des-halo-halo',     'Halo-Halo',     'Dessert',    'Shaved ice layered with sweet fruits, beans, and leche flan.', 'Shaved ice, evaporated milk, leche flan, ube, sweetened beans', 160.00, 55.00, '🍧', '', true),
('des-leche-flan',    'Leche Flan',    'Dessert',    'Silky caramel custard, chilled and served in slices.', 'Egg yolks, condensed milk, evaporated milk, caramel, vanilla', 140.00, 45.00, '🍮', '', true),
('drk-iced-tea',      'Iced Tea',      'Drinks',     'Fresh brewed house black tea, served chilled over ice.', 'Black tea, calamansi, raw sugar, ice', 80.00, 18.00, '🧋', '', true),
('drk-lemonade',      'Lemonade',      'Drinks',     'Bright house lemonade, freshly squeezed each morning.', 'Fresh lemons, pure cane sugar, filtered water, mint', 90.00, 22.00, '🍋', '', true)
ON CONFLICT (id) DO NOTHING;

-- Staff Accounts (Admin is Master Owner with 4-Digit PIN only, no username)
INSERT INTO public.accounts (id, name, username, password, pin, role, status) VALUES
('acc-admin', 'Restaurant Owner', NULL, '', '1212', 'Admin', 'Active')
ON CONFLICT (id) DO UPDATE SET pin = '1212', username = NULL;

-- Tables
INSERT INTO public.tables (id, number, capacity, section, status) VALUES
('tbl-1', 'Table 1', 2, 'Main Dining', 'AVAILABLE'),
('tbl-2', 'Table 2', 4, 'Main Dining', 'AVAILABLE'),
('tbl-3', 'Table 3', 4, 'Main Dining', 'AVAILABLE'),
('tbl-4', 'Table 4', 6, 'Main Dining', 'AVAILABLE'),
('tbl-5', 'Table 5', 2, 'Patio',       'AVAILABLE'),
('tbl-6', 'Table 6', 4, 'Patio',       'AVAILABLE'),
('tbl-7', 'Table 7', 8, 'VIP Room',    'AVAILABLE'),
('tbl-8', 'Bar 1',   1, 'Bar Counter', 'AVAILABLE')
ON CONFLICT (id) DO NOTHING;
