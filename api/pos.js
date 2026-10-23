/**
 * =========================================================================
 * SAVOR & CO. — VERCEL SERVERLESS SQL DATABASE API
 * =========================================================================
 * 
 * Works with any standard PostgreSQL database:
 * - Neon Serverless Postgres (Recommended & 100% Free at https://neon.tech)
 * - Vercel Postgres (1-click in Vercel Storage)
 * - Supabase (PostgreSQL connection string)
 * 
 * Auto-initializes tables and seed data on first request!
 */

const SEED_MENU = [
  { id:'app-spring-rolls',  name:'Spring Rolls',  category:'Appetizer', description:'Crisp vegetable spring rolls, six pieces with a sweet chili dip.', ingredients:'Cabbage, carrots, glass noodles, wrapper, sweet chili sauce', emoji:'🥟', available:true, price:180, image:'' },
  { id:'app-chicken-wings', name:'Chicken Wings', category:'Appetizer', description:'Sticky glazed wings, tossed in a savoury house sauce.', ingredients:'Chicken wings, soy sauce, garlic, honey, sesame seeds', emoji:'🍗', available:true, price:250, image:'' },
  { id:'main-chicken-rice', name:'Chicken Rice',  category:'Main Dish', description:'Tender grilled chicken over fragrant rice with house sauce.', ingredients:'Jasmine rice, chicken thigh, garlic, cucumber, soy sauce', emoji:'🍗', available:true, price:280, image:'' },
  { id:'main-beef-steak',   name:'Beef Steak',    category:'Main Dish', description:'Sliced beef with pepper glaze and seasonal vegetables.', ingredients:'Beef sirloin, black pepper, butter, seasonal vegetables', emoji:'🥩', available:true, price:420, image:'' },
  { id:'des-halo-halo',     name:'Halo-Halo',     category:'Dessert',   description:'Shaved ice with sweet fruits, beans and leche flan.', ingredients:'Shaved ice, evaporated milk, leche flan, ube, beans', emoji:'🍧', available:true, price:160, image:'' },
  { id:'des-leche-flan',    name:'Leche Flan',    category:'Dessert',   description:'Silky caramel custard, chilled and served in slices.', ingredients:'Egg yolks, condensed milk, evaporated milk, caramel, vanilla', emoji:'🍮', available:true, price:140, image:'' },
  { id:'drk-iced-tea',      name:'Iced Tea',      category:'Drinks',    description:'Fresh brewed tea, served chilled over ice.', ingredients:'Black tea, sugar, lemon, ice', emoji:'🧋', available:true, price:80, image:'' },
  { id:'drk-lemonade',      name:'Lemonade',      category:'Drinks',    description:'Bright house lemonade, freshly squeezed each morning.', ingredients:'Lemons, sugar, water, ice', emoji:'🍋', available:true, price:90, image:'' }
];

const SEED_ACCOUNTS = [
  { id:'acc-admin',      name:'Owner',         username:'admin',   password:'admin',   role:'Admin',      status:'Active' },
  { id:'acc-semi-admin', name:'Floor Manager', username:'manager', password:'manager', role:'Semi Admin', status:'Active' },
  { id:'acc-waiter',     name:'Waiter',        username:'waiter',  password:'waiter',  role:'Waiter',     status:'Active' },
  { id:'acc-kitchen',    name:'Kitchen',       username:'kitchen', password:'kitchen', role:'Kitchen',    status:'Active' },
  { id:'acc-cashier',    name:'Cashier',       username:'cashier', password:'cashier', role:'Cashier',    status:'Active' }
];

// In-memory fallback if DATABASE_URL is not yet configured in Vercel
let memoryStore = {
  orders: [],
  menu: [...SEED_MENU],
  accounts: [...SEED_ACCOUNTS]
};

let dbInitialized = false;

function getDatabaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
}

/**
 * Execute parameterized SQL query using Neon or standard Postgres
 */
async function querySQL(text, params = []) {
  const dbUrl = getDatabaseUrl();
  if (!dbUrl) {
    throw new Error('DATABASE_URL_MISSING');
  }

  // 1. Try Neon serverless driver (fastest over HTTP, zero connection exhaustion)
  try {
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(dbUrl);
    const res = await sql(text, params);
    return res;
  } catch (neonErr) {
    // If @neondatabase/serverless is not loaded or direct call differs, fall back to pg
  }

  // 2. Standard pg (node-postgres)
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: dbUrl.includes('localhost') ? false : { rejectUnauthorized: false }
  });

  try {
    const res = await pool.query(text, params);
    return res.rows;
  } finally {
    await pool.end().catch(() => {});
  }
}

/**
 * Ensure database tables exist and seed initial data
 */
async function ensureTables() {
  if (dbInitialized) return;
  const dbUrl = getDatabaseUrl();
  if (!dbUrl) return;

  await querySQL(`
    CREATE TABLE IF NOT EXISTS orders (
      "id" TEXT PRIMARY KEY,
      "code" TEXT,
      "status" TEXT DEFAULT 'PENDING',
      "items" JSONB DEFAULT '[]'::jsonb,
      "createdAt" BIGINT,
      "updatedAt" BIGINT,
      "staff" TEXT DEFAULT '',
      "total" NUMERIC DEFAULT 0,
      "payment" TEXT DEFAULT 'UNPAID',
      "paidAt" BIGINT,
      "table" TEXT DEFAULT '',
      "customer" TEXT DEFAULT ''
    );
  `);

  await querySQL(`
    CREATE TABLE IF NOT EXISTS menu (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "category" TEXT DEFAULT 'Main Dish',
      "description" TEXT DEFAULT '',
      "ingredients" TEXT DEFAULT '',
      "price" NUMERIC DEFAULT 0,
      "emoji" TEXT DEFAULT '',
      "image" TEXT DEFAULT '',
      "available" BOOLEAN DEFAULT TRUE
    );
  `);

  await querySQL(`
    CREATE TABLE IF NOT EXISTS accounts (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "username" TEXT UNIQUE NOT NULL,
      "password" TEXT NOT NULL,
      "role" TEXT DEFAULT 'Waiter',
      "status" TEXT DEFAULT 'Active'
    );
  `);

  // Seed Menu if empty
  const menuCountRes = await querySQL(`SELECT COUNT(*) as count FROM menu`);
  const menuCount = parseInt(menuCountRes[0]?.count || 0, 10);
  if (menuCount === 0) {
    for (const m of SEED_MENU) {
      await querySQL(
        `INSERT INTO menu ("id", "name", "category", "description", "ingredients", "price", "emoji", "image", "available")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT ("id") DO NOTHING`,
        [m.id, m.name, m.category, m.description, m.ingredients, m.price, m.emoji, m.image, m.available]
      );
    }
  }

  // Seed Accounts if empty
  const accCountRes = await querySQL(`SELECT COUNT(*) as count FROM accounts`);
  const accCount = parseInt(accCountRes[0]?.count || 0, 10);
  if (accCount === 0) {
    for (const a of SEED_ACCOUNTS) {
      await querySQL(
        `INSERT INTO accounts ("id", "name", "username", "password", "role", "status")
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT ("id") DO NOTHING`,
        [a.id, a.name, a.username, a.password, a.role, a.status]
      );
    }
  }

  dbInitialized = true;
}

// Memory fallback helpers
function memoryBootstrap() {
  return {
    orders: [...memoryStore.orders].sort((a, b) => Number(b.createdAt) - Number(a.createdAt)),
    menu: [...memoryStore.menu],
    accounts: [...memoryStore.accounts]
  };
}

function memoryCreateOrder(payload) {
  let maxCodeNum = 1000;
  for (const o of memoryStore.orders) {
    const num = parseInt(String(o.code || '').replace(/[^0-9]/g, ''), 10);
    if (!isNaN(num) && num > maxCodeNum) maxCodeNum = num;
  }
  const code = '#' + (maxCodeNum + 1);
  const now = Date.now();
  const id = 'ord_' + Math.random().toString(36).substring(2, 9) + now.toString(36);

  const normalizedItems = (payload.items || []).map(it => ({
    name: String(it.name || ''),
    qty: Number(it.qty) || 1,
    note: String(it.note || ''),
    price: Number(it.price) || 0,
    ready: false,
    readyAt: null,
    served: false,
    servedAt: null
  }));

  let total = Number(payload.total);
  if (isNaN(total) || total === 0) {
    total = normalizedItems.reduce((sum, it) => sum + (it.price * it.qty), 0);
  }

  const order = {
    id,
    code,
    status: 'PENDING',
    items: normalizedItems,
    createdAt: now,
    updatedAt: now,
    staff: String(payload.staff || 'Waiter'),
    total,
    payment: 'UNPAID',
    paidAt: null,
    table: String(payload.table || ''),
    customer: String(payload.customer || '')
  };

  memoryStore.orders.unshift(order);
  return order;
}

/**
 * Handle incoming POS Actions
 */
async function handleAction(action, payload) {
  const hasDb = !!getDatabaseUrl();

  // If no DB configured, run against high-performance memory store with warning
  if (!hasDb) {
    switch (action) {
      case 'bootstrap':
        return {
          ...memoryBootstrap(),
          storage: 'memory-demo',
          notice: 'DATABASE_URL not configured. Running in memory demo mode. Add your free Neon/PostgreSQL DATABASE_URL in Vercel to persist data permanently.'
        };
      case 'seedMenu':
        return memoryStore.menu;
      case 'createOrder':
        return memoryCreateOrder(payload);
      case 'updateOrderStatus': {
        const ord = memoryStore.orders.find(o => o.id === payload.id);
        if (!ord) throw new Error('Order not found');
        ord.status = payload.status;
        ord.updatedAt = Date.now();
        if (payload.staff) ord.staff = payload.staff;
        return { id: ord.id, status: ord.status, updatedAt: ord.updatedAt };
      }
      case 'markItemReady': {
        const ord = memoryStore.orders.find(o => o.id === payload.orderId);
        if (!ord) throw new Error('Order not found');
        const it = ord.items[payload.itemIndex];
        if (!it) throw new Error('Item index invalid');
        const now = Date.now();
        it.ready = true;
        it.readyAt = now;
        if (ord.status === 'PREPARING' || ord.status === 'PENDING') ord.status = 'READY';
        ord.updatedAt = now;
        ord.staff = payload.staff || 'Kitchen';
        return ord;
      }
      case 'serveItem': {
        const ord = memoryStore.orders.find(o => o.id === payload.orderId);
        if (!ord) throw new Error('Order not found');
        const it = ord.items[payload.itemIndex];
        if (!it) throw new Error('Item index invalid');
        const now = Date.now();
        it.served = true;
        it.servedAt = now;
        if (ord.items.every(i => !!i.served)) ord.status = 'COMPLETED';
        ord.updatedAt = now;
        ord.staff = payload.staff || 'Waiter';
        return ord;
      }
      case 'markOrderPaid': {
        const ord = memoryStore.orders.find(o => o.id === payload.id);
        if (!ord) throw new Error('Order not found');
        const now = Date.now();
        ord.payment = 'PAID';
        ord.paidAt = now;
        ord.updatedAt = now;
        return { id: ord.id, payment: 'PAID', paidAt: now };
      }
      case 'saveMenuItem': {
        const item = payload.item;
        const id = item.id || ('item_' + Math.random().toString(36).substring(2, 9));
        const idx = memoryStore.menu.findIndex(m => m.id === id);
        item.id = id;
        if (idx >= 0) memoryStore.menu[idx] = item;
        else memoryStore.menu.push(item);
        return item;
      }
      case 'deleteMenuItem': {
        memoryStore.menu = memoryStore.menu.filter(m => m.id !== payload.id);
        return { id: payload.id, deleted: true };
      }
      case 'saveAccount': {
        const acc = payload.account;
        const id = acc.id || ('acc_' + Math.random().toString(36).substring(2, 9));
        acc.id = id;
        const idx = memoryStore.accounts.findIndex(a => a.id === id);
        if (idx >= 0) memoryStore.accounts[idx] = acc;
        else memoryStore.accounts.push(acc);
        return acc;
      }
      case 'deleteAccount': {
        memoryStore.accounts = memoryStore.accounts.filter(a => a.id !== payload.id);
        return { id: payload.id, deleted: true };
      }
      case 'authenticate': {
        const u = String(payload.username || '').toLowerCase().trim();
        const p = String(payload.password || '').trim();
        const found = memoryStore.accounts.find(a => a.username.toLowerCase() === u && a.password === p);
        if (!found) throw new Error('Invalid username or password');
        if (String(found.status || 'Active').toLowerCase() === 'inactive') throw new Error('Account is inactive');
        return { id: found.id, name: found.name, username: found.username, role: found.role };
      }
      case 'reset': {
        memoryStore.orders = [];
        return { reset: true };
      }
      default:
        throw new Error('Unknown action: ' + action);
    }
  }

  // --- Real PostgreSQL Cloud Database Mode ---
  await ensureTables();

  switch (action) {
    case 'bootstrap': {
      const orders = await querySQL(`SELECT * FROM orders ORDER BY "createdAt" DESC`);
      const menu = await querySQL(`SELECT * FROM menu ORDER BY "id" ASC`);
      const accounts = await querySQL(`SELECT * FROM accounts ORDER BY "id" ASC`);

      // Normalize orders: ensure items is parsed
      const normalizedOrders = orders.map(o => {
        let items = o.items;
        if (typeof items === 'string') {
          try { items = JSON.parse(items); } catch(e) { items = []; }
        }
        return {
          ...o,
          items: items || [],
          total: Number(o.total) || 0,
          createdAt: Number(o.createdAt),
          updatedAt: Number(o.updatedAt),
          paidAt: o.paidAt ? Number(o.paidAt) : null
        };
      });

      const normalizedMenu = menu.map(m => ({
        ...m,
        price: Number(m.price) || 0,
        available: m.available !== false
      }));

      return {
        orders: normalizedOrders,
        menu: normalizedMenu,
        accounts: accounts,
        storage: 'postgresql-cloud'
      };
    }

    case 'seedMenu': {
      const items = payload.items || SEED_MENU;
      for (const m of items) {
        await querySQL(
          `INSERT INTO menu ("id", "name", "category", "description", "ingredients", "price", "emoji", "image", "available")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT ("id") DO NOTHING`,
          [m.id, m.name, m.category, m.description, m.ingredients, Number(m.price) || 0, m.emoji, m.image, m.available !== false]
        );
      }
      return items;
    }

    case 'createOrder': {
      // Find max code number
      const codeRows = await querySQL(`SELECT "code" FROM orders`);
      let maxCodeNum = 1000;
      for (const r of codeRows) {
        const num = parseInt(String(r.code || '').replace(/[^0-9]/g, ''), 10);
        if (!isNaN(num) && num > maxCodeNum) maxCodeNum = num;
      }
      const code = '#' + (maxCodeNum + 1);
      const now = Date.now();
      const id = 'ord_' + Math.random().toString(36).substring(2, 9) + now.toString(36);

      const normalizedItems = (payload.items || []).map(it => ({
        name: String(it.name || ''),
        qty: Number(it.qty) || 1,
        note: String(it.note || ''),
        price: Number(it.price) || 0,
        ready: false,
        readyAt: null,
        served: false,
        servedAt: null
      }));

      let total = Number(payload.total);
      if (isNaN(total) || total === 0) {
        total = normalizedItems.reduce((sum, it) => sum + (it.price * it.qty), 0);
      }

      const staff = String(payload.staff || 'Waiter');
      const table = String(payload.table || '');
      const customer = String(payload.customer || '');

      await querySQL(
        `INSERT INTO orders ("id", "code", "status", "items", "createdAt", "updatedAt", "staff", "total", "payment", "paidAt", "table", "customer")
         VALUES ($1, $2, 'PENDING', $3::jsonb, $4, $4, $5, $6, 'UNPAID', NULL, $7, $8)`,
        [id, code, JSON.stringify(normalizedItems), now, staff, total, table, customer]
      );

      return {
        id,
        code,
        status: 'PENDING',
        items: normalizedItems,
        createdAt: now,
        updatedAt: now,
        staff,
        total,
        payment: 'UNPAID',
        paidAt: null,
        table,
        customer
      };
    }

    case 'updateOrderStatus': {
      const now = Date.now();
      const rows = await querySQL(
        `UPDATE orders
         SET "status" = $1, "updatedAt" = $2, "staff" = COALESCE(NULLIF($3, ''), "staff")
         WHERE "id" = $4
         RETURNING "id", "status", "updatedAt"`,
        [payload.status, now, payload.staff || '', payload.id]
      );
      if (!rows.length) throw new Error('Order not found: ' + payload.id);
      return { id: payload.id, status: payload.status, updatedAt: now };
    }

    case 'markItemReady': {
      const rows = await querySQL(`SELECT * FROM orders WHERE "id" = $1`, [payload.orderId]);
      if (!rows.length) throw new Error('Order not found: ' + payload.orderId);
      const ord = rows[0];
      let items = typeof ord.items === 'string' ? JSON.parse(ord.items) : ord.items;
      const idx = Number(payload.itemIndex);
      if (!items || !items[idx]) throw new Error('Invalid item index: ' + idx);

      const now = Date.now();
      items[idx].ready = true;
      items[idx].readyAt = now;

      let newStatus = ord.status;
      if (newStatus === 'PENDING' || newStatus === 'PREPARING') {
        newStatus = 'READY';
      }
      const staff = payload.staff || 'Kitchen';

      await querySQL(
        `UPDATE orders
         SET "items" = $1::jsonb, "status" = $2, "updatedAt" = $3, "staff" = $4
         WHERE "id" = $5`,
        [JSON.stringify(items), newStatus, now, staff, payload.orderId]
      );

      return {
        id: payload.orderId,
        code: ord.code,
        status: newStatus,
        items,
        updatedAt: now,
        staff
      };
    }

    case 'serveItem': {
      const rows = await querySQL(`SELECT * FROM orders WHERE "id" = $1`, [payload.orderId]);
      if (!rows.length) throw new Error('Order not found: ' + payload.orderId);
      const ord = rows[0];
      let items = typeof ord.items === 'string' ? JSON.parse(ord.items) : ord.items;
      const idx = Number(payload.itemIndex);
      if (!items || !items[idx]) throw new Error('Invalid item index: ' + idx);

      const now = Date.now();
      items[idx].served = true;
      items[idx].servedAt = now;

      const allServed = items.length > 0 && items.every(it => !!it.served);
      const newStatus = allServed ? 'COMPLETED' : ord.status;
      const staff = payload.staff || 'Waiter';

      await querySQL(
        `UPDATE orders
         SET "items" = $1::jsonb, "status" = $2, "updatedAt" = $3, "staff" = $4
         WHERE "id" = $5`,
        [JSON.stringify(items), newStatus, now, staff, payload.orderId]
      );

      return {
        id: payload.orderId,
        code: ord.code,
        status: newStatus,
        items,
        updatedAt: now,
        staff
      };
    }

    case 'markOrderPaid': {
      const now = Date.now();
      const rows = await querySQL(
        `UPDATE orders
         SET "payment" = 'PAID', "paidAt" = $1, "updatedAt" = $1
         WHERE "id" = $2
         RETURNING "id", "payment", "paidAt"`,
        [now, payload.id]
      );
      if (!rows.length) throw new Error('Order not found: ' + payload.id);
      return { id: payload.id, payment: 'PAID', paidAt: now };
    }

    case 'saveMenuItem': {
      const item = payload.item;
      if (!item || !item.name) throw new Error('Item name required');
      const id = item.id || ('item_' + Math.random().toString(36).substring(2, 9));
      item.id = id;

      await querySQL(
        `INSERT INTO menu ("id", "name", "category", "description", "ingredients", "price", "emoji", "image", "available")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT ("id") DO UPDATE SET
           "name" = EXCLUDED."name",
           "category" = EXCLUDED."category",
           "description" = EXCLUDED."description",
           "ingredients" = EXCLUDED."ingredients",
           "price" = EXCLUDED."price",
           "emoji" = EXCLUDED."emoji",
           "image" = EXCLUDED."image",
           "available" = EXCLUDED."available"`,
        [id, item.name, item.category || 'Main Dish', item.description || '', item.ingredients || '', Number(item.price) || 0, item.emoji || '', item.image || '', item.available !== false]
      );
      return item;
    }

    case 'deleteMenuItem': {
      await querySQL(`DELETE FROM menu WHERE "id" = $1`, [payload.id]);
      return { id: payload.id, deleted: true };
    }

    case 'saveAccount': {
      const acc = payload.account;
      if (!acc || !acc.name) throw new Error('Account name required');
      const id = acc.id || ('acc_' + Math.random().toString(36).substring(2, 9));
      acc.id = id;

      await querySQL(
        `INSERT INTO accounts ("id", "name", "username", "password", "role", "status")
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT ("id") DO UPDATE SET
           "name" = EXCLUDED."name",
           "username" = EXCLUDED."username",
           "password" = EXCLUDED."password",
           "role" = EXCLUDED."role",
           "status" = EXCLUDED."status"`,
        [id, acc.name, acc.username || '', acc.password || '', acc.role || 'Waiter', acc.status || 'Active']
      );
      return acc;
    }

    case 'deleteAccount': {
      await querySQL(`DELETE FROM accounts WHERE "id" = $1`, [payload.id]);
      return { id: payload.id, deleted: true };
    }

    case 'authenticate': {
      const u = String(payload.username || '').toLowerCase().trim();
      const p = String(payload.password || '').trim();
      const rows = await querySQL(
        `SELECT "id", "name", "username", "role", "status"
         FROM accounts
         WHERE LOWER("username") = LOWER($1) AND "password" = $2`,
        [u, p]
      );
      if (!rows.length) throw new Error('Invalid username or password');
      const found = rows[0];
      if (String(found.status || 'Active').toLowerCase() === 'inactive') {
        throw new Error('Account is inactive');
      }
      return { id: found.id, name: found.name, username: found.username, role: found.role };
    }

    case 'reset': {
      await querySQL(`DELETE FROM orders`);
      return { reset: true };
    }

    default:
      throw new Error('Unknown action: ' + action);
  }
}

/**
 * Main Vercel Serverless Function handler
 */
module.exports = async function handler(req, res) {
  // Always set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Health check / Bootstrap check via GET
  if (req.method === 'GET') {
    const dbUrl = getDatabaseUrl();
    const hasDb = !!dbUrl;
    return res.status(200).json({
      ok: true,
      service: 'Savor & Co. Cloud SQL POS Database',
      engine: hasDb ? 'PostgreSQL (Neon / Cloud SQL)' : 'In-Memory (Demo Mode)',
      hasDatabaseUrl: hasDb,
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch(e) { body = {}; }
    }
    const { action, payload } = body || {};

    if (!action) {
      return res.status(400).json({ ok: false, error: 'Missing action parameter' });
    }

    const data = await handleAction(action, payload || {});
    return res.status(200).json({ ok: true, data });
  } catch (err) {
    console.error('[POS API Error]', err);
    return res.status(200).json({ ok: false, error: err.message || 'Server error' });
  }
};
