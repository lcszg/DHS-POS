/**
 * =============================================================================
 * SAVOR & CO. — SHARED CORE & SUPABASE REALTIME CLIENT
 * =============================================================================
 */

(function () {
  'use strict';
  const Savor = (window.Savor = window.Savor || {});

  // ---------- Utilities & Safe Storage ----------
  const safeGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const safeSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { } };
  const safeRemove = (k) => { try { localStorage.removeItem(k); } catch (e) { } };
  const cleanUrl = (u) => (u ? String(u).trim().replace(/\/+$/, '') : '');
  const cleanSupabaseUrl = (u) => {
    if (!u) return '';
    let s = String(u).trim().replace(/\/+$/, '');
    s = s.replace(/\/rest\/v1\/?$/i, '');
    return s.replace(/\/+$/, '');
  };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = (prefix = 'id') => {
    try {
      if (window.crypto && typeof window.crypto.randomUUID === 'function') {
        return prefix + '_' + window.crypto.randomUUID().slice(0, 8);
      }
    } catch (e) { }
    return prefix + '_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
  };

  // ---------- Config & Environment ----------
  const DEFAULT_SUPABASE_URL = safeGet('savor.supabase_url') || 'https://hwvzlgtaxufmoewzbrmx.supabase.co';
  const DEFAULT_SUPABASE_KEY = safeGet('savor.supabase_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3dnpsZ3RheHVmbW9ld3picm14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5MjM3NzIsImV4cCI6MjEwODQ5OTc3Mn0._lk6SSvkxWv5rF_j2CjZX2KiPEIRXkiFFMXxSiCcyCY';

  const CONFIG = {
    SUPABASE_URL: DEFAULT_SUPABASE_URL,
    SUPABASE_KEY: DEFAULT_SUPABASE_KEY,
    API_URL: cleanUrl(safeGet('savor.api') || (typeof window !== 'undefined' && /^https?:/.test(window.location.protocol) ? window.location.origin + '/api/pos' : '')),
    POLL_MS: 4000,
    CURRENCY: '₱'
  };

  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('supabase_url')) {
      CONFIG.SUPABASE_URL = cleanUrl(params.get('supabase_url'));
      safeSet('savor.supabase_url', CONFIG.SUPABASE_URL);
    }
    if (params.get('supabase_key')) {
      CONFIG.SUPABASE_KEY = params.get('supabase_key').trim();
      safeSet('savor.supabase_key', CONFIG.SUPABASE_KEY);
    }
  } catch (e) { }

  // ---------- Core Reactive State ----------
  const state = {
    dark: safeGet('savor.dark') !== '0',
    sound: safeGet('savor.sound') !== '0',
    net: 'connecting',
    menu: [],
    categories: [
      { id: 'cat-app', name: 'Appetizer', icon: 'soup' },
      { id: 'cat-main', name: 'Main Dish', icon: 'utensils' },
      { id: 'cat-des', name: 'Dessert', icon: 'cake' },
      { id: 'cat-drk', name: 'Drinks', icon: 'glass-water' }
    ],
    tables: [],
    orders: [],
    accounts: [],
    lastSync: null,
    syncing: false,
    supabaseClient: null,
    realtimeChannel: null
  };

  const SEED_TABLES = [
    { id: 'tbl-1', number: 'Table 1', capacity: 2, section: 'Main Dining', status: 'AVAILABLE' },
    { id: 'tbl-2', number: 'Table 2', capacity: 4, section: 'Main Dining', status: 'AVAILABLE' },
    { id: 'tbl-3', number: 'Table 3', capacity: 4, section: 'Main Dining', status: 'AVAILABLE' },
    { id: 'tbl-4', number: 'Table 4', capacity: 6, section: 'Main Dining', status: 'AVAILABLE' },
    { id: 'tbl-5', number: 'Table 5', capacity: 2, section: 'Patio', status: 'AVAILABLE' },
    { id: 'tbl-6', number: 'Table 6', capacity: 4, section: 'Patio', status: 'AVAILABLE' },
    { id: 'tbl-7', number: 'Table 7', capacity: 8, section: 'VIP Room', status: 'AVAILABLE' },
    { id: 'tbl-8', number: 'Bar 1', capacity: 1, section: 'Bar Counter', status: 'AVAILABLE' }
  ];

  const SEED_MENU = [
    { id: 'app-spring-rolls', name: 'Spring Rolls', category: 'Appetizer', description: 'Crisp vegetable spring rolls, six pieces with sweet chili dip.', ingredients: 'Cabbage, carrots, glass noodles, wrapper, sweet chili sauce', price: 180, cost_price: 65, emoji: '🥟', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80', available: true },
    { id: 'app-chicken-wings', name: 'Chicken Wings', category: 'Appetizer', description: 'Sticky glazed wings, tossed in savoury garlic honey glaze.', ingredients: 'Chicken wings, soy sauce, garlic, honey, sesame seeds', price: 250, cost_price: 95, emoji: '🍗', image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80', available: true },
    { id: 'main-chicken-rice', name: 'Chicken Rice', category: 'Main Dish', description: 'Tender grilled chicken over fragrant garlic rice with house sauce.', ingredients: 'Jasmine rice, chicken thigh, garlic, cucumber, soy sauce', price: 280, cost_price: 105, emoji: '🍗', image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop&q=80', available: true },
    { id: 'main-beef-steak', name: 'Beef Steak', category: 'Main Dish', description: 'Sliced beef sirloin with black pepper glaze and seasonal vegetables.', ingredients: 'Beef sirloin, black pepper, butter, seasonal vegetables', price: 420, cost_price: 180, emoji: '🥩', image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&auto=format&fit=crop&q=80', available: true },
    { id: 'des-halo-halo', name: 'Halo-Halo', category: 'Dessert', description: 'Shaved ice with sweet fruits, beans, leche flan, and ube.', ingredients: 'Shaved ice, evaporated milk, leche flan, ube, beans', price: 160, cost_price: 55, emoji: '🍧', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&auto=format&fit=crop&q=80', available: true },
    { id: 'des-leche-flan', name: 'Leche Flan', category: 'Dessert', description: 'Silky caramel custard, chilled and served in slices.', ingredients: 'Egg yolks, condensed milk, evaporated milk, caramel, vanilla', price: 140, cost_price: 45, emoji: '🍮', image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop&q=80', available: true },
    { id: 'drk-iced-tea', name: 'Iced Tea', category: 'Drinks', description: 'Fresh brewed house black tea, served chilled over ice.', ingredients: 'Black tea, calamansi, raw sugar, ice', price: 80, cost_price: 18, emoji: '🧋', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80', available: true },
    { id: 'drk-lemonade', name: 'Lemonade', category: 'Drinks', description: 'Bright house lemonade, freshly squeezed each morning.', ingredients: 'Fresh lemons, sugar, water, mint, ice', price: 90, cost_price: 22, emoji: '🍋', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80', available: true }
  ];

  const SEED_ACCOUNTS = [
    { id: 'acc-admin', name: 'Restaurant Owner', username: 'admin', pin: '1212', role: 'Admin', status: 'Active' },
    { id: 'acc-semi-admin', name: 'Floor Manager', username: 'manager', pin: '2222', role: 'Semi-Admin', status: 'Active' },
    { id: 'acc-waiter', name: 'Floor Waiter', username: 'waiter', pin: '3333', role: 'Waiter', status: 'Active' },
    { id: 'acc-kitchen', name: 'Kitchen Chef', username: 'kitchen', pin: '4444', role: 'Kitchen', status: 'Active' },
    { id: 'acc-cashier', name: 'Counter Cashier', username: 'cashier', pin: '5555', role: 'Cashier', status: 'Active' }
  ];

  const STORAGE_KEYS = {
    ORDERS: 'savor.orders',
    MENU: 'savor.menu',
    ACCOUNTS: 'savor.accounts',
    TABLES: 'savor.tables'
  };

  function saveLocalState() {
    try { localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(state.orders)); } catch (e) { }
    try { localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(state.menu)); } catch (e) {
      try {
        const compactMenu = state.menu.map(m => ({
          ...m,
          image: (m.image && m.image.length > 50000) ? '' : m.image
        }));
        localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(compactMenu));
      } catch (e2) { }
    }
    try { localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(state.accounts)); } catch (e) { }
    try { localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(state.tables)); } catch (e) { }
  }

  function loadLocalState() {
    try {
      const rawOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (rawOrders) {
        const parsed = JSON.parse(rawOrders);
        if (Array.isArray(parsed)) state.orders = parsed.map(normalizeOrderRecord);
      }
      const rawMenu = localStorage.getItem(STORAGE_KEYS.MENU);
      if (rawMenu) {
        const parsed = JSON.parse(rawMenu);
        if (Array.isArray(parsed) && parsed.length > 0) state.menu = parsed.map(normalizeMenuItem);
        else state.menu = [...SEED_MENU];
      } else { state.menu = [...SEED_MENU]; }
      const rawAccounts = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (rawAccounts) {
        let parsed = JSON.parse(rawAccounts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mergedAccounts = [...parsed];
          SEED_ACCOUNTS.forEach(seedAcc => {
            const exists = mergedAccounts.find(a => a.id === seedAcc.id || (a.role && a.role.toLowerCase() === seedAcc.role.toLowerCase()));
            if (!exists) mergedAccounts.push(seedAcc);
          });
          const adminIdx = mergedAccounts.findIndex(a => a.id === 'acc-admin' || a.role === 'Admin');
          if (adminIdx >= 0) {
            mergedAccounts[adminIdx].pin = mergedAccounts[adminIdx].pin || '1212';
            mergedAccounts[adminIdx].role = 'Admin';
          }
          state.accounts = mergedAccounts;
        } else { state.accounts = [...SEED_ACCOUNTS]; }
      } else { state.accounts = [...SEED_ACCOUNTS]; }
      const rawTables = localStorage.getItem(STORAGE_KEYS.TABLES);
      if (rawTables) {
        const parsed = JSON.parse(rawTables);
        if (Array.isArray(parsed) && parsed.length > 0) state.tables = parsed;
        else state.tables = [...SEED_TABLES];
      } else { state.tables = [...SEED_TABLES]; }
      saveLocalState();
    } catch (e) {
      state.menu = [...SEED_MENU];
      state.accounts = [...SEED_ACCOUNTS];
      state.tables = [...SEED_TABLES];
    }
  }

  loadLocalState();

  // ---------- Formatters & Helpers ----------
  function isToday(ts) {
    if (!ts) return false;
    const d = new Date(Number(ts));
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  }

  function fmtDateKey(ts) {
    if (!ts) return '';
    const d = new Date(Number(ts));
    if (isNaN(d)) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function fmtDate(ts) {
    const d = new Date(Number(ts));
    return isNaN(d) ? '—' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function fmtTime(ts) {
    const d = new Date(Number(ts));
    return isNaN(d) ? '—' : d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  function fmtDateTime(ts) {
    const d = new Date(Number(ts));
    return isNaN(d) ? '—' : d.toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }

  function peso(n) {
    const num = Number(n) || 0;
    return CONFIG.CURRENCY + num.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  function pretty(s) {
    return { PENDING: 'Pending', PREPARING: 'Cooking', READY: 'Ready to serve', COMPLETED: 'Served', CANCELLED: 'Cancelled' }[s] || s;
  }

  function statusPill(s) {
    const key = String(s).toLowerCase();
    const cls = key === 'cancelled' ? 'cancelled' : key;
    return `<span class="pill pill-${cls}">${pretty(s)}</span>`;
  }

  function paymentPill(o) {
    if (o.status === 'CANCELLED') return '<span class="pill pill-cancelled">Cancelled</span>';
    if (o.payment === 'PAID') return '<span class="pill pill-paid">Paid</span>';
    if (o.status === 'COMPLETED') return '<span class="pill pill-unpaid">Awaiting Pay</span>';
    return '';
  }

  function orderTotal(o) {
    if (typeof o.total === 'number' && !isNaN(o.total) && o.total > 0) return o.total;
    return (o.items || []).reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.qty) || 1)), 0);
  }

  function hasMeta(o) {
    return !!(String(o.table || '').trim() || String(o.customer || '').trim());
  }

  function orderMetaText(o) {
    const parts = [];
    if (String(o.table || '').trim()) parts.push(String(o.table).trim().startsWith('Table') || String(o.table).trim().startsWith('Bar') ? String(o.table).trim() : 'Table ' + String(o.table).trim());
    if (String(o.customer || '').trim()) parts.push(String(o.customer).trim());
    return parts.join(' · ');
  }

  function tableTag(o) {
    return hasMeta(o) ? `<span class="table-tag">${icon('map-pin', 'w-3 h-3')} ${esc(orderMetaText(o))}</span>` : '';
  }

  function itemCount(o) { return (o.items || []).length; }
  function servedCount(o) { return (o.items || []).filter(i => i && i.served).length; }
  function readyCount(o) { return (o.items || []).filter(i => i && i.ready).length; }
  function unreadyCount(o) { return itemCount(o) - readyCount(o); }
  function readyUnservedCount(o) { return (o.items || []).filter(i => i && i.ready && !i.served).length; }
  function allServed(o) { const items = o.items || []; return items.length > 0 && items.every(i => i && i.served); }
  function itemSummary(o) { return (o.items || []).map(i => `${i.qty}× ${i.name}`).join(' · '); }
  function allNotes(o) { return (o.items || []).filter(i => i.note).map(i => i.note); }

  function normalizeMenuItem(m) {
    return {
      id: m.id || uid('item'),
      name: String(m.name || ''),
      category: String(m.category || 'Main Dish'),
      description: String(m.description || ''),
      ingredients: String(m.ingredients || ''),
      price: Number(m.price) || 0,
      cost_price: Number(m.cost_price) || 0,
      emoji: String(m.emoji || ''),
      image: String(m.image || ''),
      available: m.available !== false && String(m.available) !== 'false'
    };
  }

  function sanitizeUsername(input) {
    return String(input || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  }

  function processImageFile(file, maxDimension = 540, quality = 0.78) {
    return new Promise((resolve, reject) => {
      if (!file || !(file instanceof Blob) || (file.type && !file.type.startsWith('image/'))) {
        return reject(new Error('Please select an image file (JPEG, PNG, WebP).'));
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Failed to load image.'));
        img.onload = () => {
          try {
            let w = img.width, h = img.height;
            if (w > h) {
              if (w > maxDimension) { h = Math.round((h * maxDimension) / w); w = maxDimension; }
            } else {
              if (h > maxDimension) { w = Math.round((w * maxDimension) / h); h = maxDimension; }
            }
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, w);
            canvas.height = Math.max(1, h);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          } catch (err) { reject(err); }
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function menuHero(item, heightClass = 'h-36') {
    if (item.image) {
      return `<div class="${heightClass} w-full relative overflow-hidden rounded-xl bg-surface-2 mb-3">
        <img src="${esc(item.image)}" alt="${esc(item.name)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.parentNode.innerHTML='<div class=\\'${heightClass} w-full rounded-xl bg-surface-2 flex flex-col items-center justify-center gap-1.5 text-muted/60\\'><i data-lucide=\\'utensils\\' class=\\'w-10 h-10\\'></i><span class=\\'text-[11px] font-bold uppercase tracking-wider text-muted/70\\'>${esc(item.category || 'Dish')}</span></div>'">
      </div>`;
    }
    return `<div class="${heightClass} w-full rounded-xl bg-surface-2 border border-border flex flex-col items-center justify-center gap-1.5 mb-3 text-muted/60">
      <i data-lucide="utensils" class="w-10 h-10"></i>
      <span class="text-[11px] font-bold uppercase tracking-wider text-muted/70">${esc(item.category || 'Dish')}</span>
    </div>`;
  }

  function icon(name, cls = 'w-5 h-5') { return `<i data-lucide="${name}" class="${cls}"></i>`; }

  function setHtml(el, html) {
    if (!el) return;
    el.innerHTML = html;
    if (window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
  }

  // ---------- Web Audio Synthesizer ----------
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx && typeof window !== 'undefined') {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === 'suspended') { audioCtx.resume().catch(() => { }); }
    return audioCtx;
  }

  function playChime(type = 'new_order') {
    if (!state.sound) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (type === 'new_order') {
        const osc1 = ctx.createOscillator(), osc2 = ctx.createOscillator(), gain = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(783.99, now);
        osc1.frequency.setValueAtTime(1046.50, now + 0.12);
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(392.00, now);
        osc2.frequency.setValueAtTime(523.25, now + 0.12);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.35, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
        osc1.connect(gain); osc2.connect(gain); gain.connect(ctx.destination);
        osc1.start(now); osc2.start(now); osc1.stop(now + 0.8); osc2.stop(now + 0.8);
      } else if (type === 'dish_ready') {
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1318.51, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.95);
      }
    } catch (e) { }
  }

  // ---------- Session ----------
  function getSession() {
    try {
      const raw = sessionStorage.getItem('savor.session') || localStorage.getItem('savor.session');
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function setSession(session) {
    try {
      const str = JSON.stringify(session);
      sessionStorage.setItem('savor.session', str);
      localStorage.setItem('savor.session', str);
    } catch (e) { }
  }

  function clearSession() {
    try { sessionStorage.removeItem('savor.session'); } catch (e) { }
    try { localStorage.removeItem('savor.session'); } catch (e) { }
  }

  function requireRole(roleKey) {
    const s = getSession();
    if (!s) {
      window.location.href = 'index.html?need_login=' + encodeURIComponent(roleKey);
      return null;
    }
    const role = String(s.role || '').toLowerCase().replace(/[\s_-]+/g, '');
    const req = String(roleKey).toLowerCase().replace(/[\s_-]+/g, '');
    if (role !== req && role !== 'admin') {
      window.location.href = 'index.html?unauthorized=' + encodeURIComponent(roleKey);
      return null;
    }
    return s;
  }

  // ---------- Supabase ----------
  let supabaseScriptLoading = false;

  function loadSupabaseScript() {
    return new Promise((resolve) => {
      if (window.supabase) return resolve(window.supabase);
      if (supabaseScriptLoading) {
        const interval = setInterval(() => {
          if (window.supabase) { clearInterval(interval); resolve(window.supabase); }
        }, 100);
        return;
      }
      supabaseScriptLoading = true;
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.48.1/dist/umd/supabase.min.js';
      script.onload = () => { supabaseScriptLoading = false; resolve(window.supabase); };
      script.onerror = () => { supabaseScriptLoading = false; resolve(null); };
      document.head.appendChild(script);
    });
  }

  async function initSupabase() {
    if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_KEY) {
      Savor.setNet(CONFIG.API_URL ? 'cloud' : 'local');
      return null;
    }
    try {
      await loadSupabaseScript();
      if (!window.supabase || !window.supabase.createClient) throw new Error('Supabase library not loaded');
      state.supabaseClient = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY, {
        auth: { persistSession: false },
        realtime: { params: { eventsPerSecond: 10 } }
      });
      setupRealtimeSubscriptions();
      await fetchAllFromSupabase();
      Savor.setNet('realtime');
      state.lastSync = Date.now();
      return state.supabaseClient;
    } catch (err) {
      Savor.setNet('cloud');
      return null;
    }
  }

  function setupRealtimeSubscriptions() {
    if (!state.supabaseClient) return;
    if (state.realtimeChannel) state.realtimeChannel.unsubscribe();

    const channel = state.supabaseClient.channel('savor-live-channel');

    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => handleRealtimeOrder(payload));
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'menu' }, (payload) => handleRealtimeMenu(payload));
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'accounts' }, (payload) => handleRealtimeAccount(payload));
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, (payload) => handleRealtimeTable(payload));

    channel.subscribe((status) => { if (status === 'SUBSCRIBED') Savor.setNet('realtime'); });
    state.realtimeChannel = channel;
  }

  function handleRealtimeOrder(payload) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    const beforeStatuses = new Map(state.orders.map(o => [o.id, o.status]));
    const beforeReadyUnserved = new Map(state.orders.map(o => [o.id, readyUnservedCount(o)]));

    if (eventType === 'INSERT') {
      const normalized = normalizeOrderRecord(newRecord);
      const existingIdx = state.orders.findIndex(o => o.id === normalized.id);
      if (existingIdx >= 0) state.orders[existingIdx] = normalized;
      else state.orders.unshift(normalized);

      if (Savor.role === 'kitchen' || Savor.role === 'admin' || Savor.role === 'cashier') {
        playChime('new_order');
        Savor.toast(`🔔 New Order ${normalized.code}${hasMeta(normalized) ? ' — ' + orderMetaText(normalized) : ''}`, 5000, 'info');
      }
    } else if (eventType === 'UPDATE') {
      const normalized = normalizeOrderRecord(newRecord);
      const idx = state.orders.findIndex(o => o.id === normalized.id);
      if (idx >= 0) state.orders[idx] = normalized;
      else state.orders.unshift(normalized);

      const beforeStatus = beforeStatuses.get(normalized.id);
      if (beforeStatus !== 'CANCELLED' && normalized.status === 'CANCELLED') {
        if (Savor.role === 'kitchen' || Savor.role === 'admin') {
          playChime('new_order');
          Savor.toast(`⚠️ ${normalized.code} cancelled by ${normalized.staff || 'Staff'} — remove from kitchen`, 4500, 'alert');
        }
        if (Savor.role === 'cashier') {
          Savor.toast(`⚠️ ${normalized.code} cancelled — removed from bill list`, 4500, 'alert');
        }
        if (Savor.role === 'semi_admin') {
          Savor.toast(`⚠️ ${normalized.code} cancelled by ${normalized.staff || 'Staff'}`, 4000, 'alert');
        }
      }

      const beforeReady = beforeReadyUnserved.get(normalized.id) || 0;
      const nowReady = readyUnservedCount(normalized);
      if (nowReady > beforeReady && (Savor.role === 'waiter' || Savor.role === 'admin')) {
        playChime('dish_ready');
        Savor.toast(`🔔 ${normalized.code} has ready dish at the pass! ${orderMetaText(normalized)}`, 6000, 'alert');
      }
    } else if (eventType === 'DELETE') {
      state.orders = state.orders.filter(o => o.id !== oldRecord.id);
    }

    state.lastSync = Date.now();
    saveLocalState();
    if (Savor.onDataChanged) Savor.onDataChanged({ beforeStatuses, beforeReadyUnserved });
    if (Savor.onRender) Savor.onRender();
    if (Savor._renderNav) Savor._renderNav();
  }

  function handleRealtimeMenu(payload) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      const item = normalizeMenuItem(newRecord);
      const idx = state.menu.findIndex(m => m.id === item.id);
      if (idx >= 0) state.menu[idx] = item;
      else state.menu.push(item);
    } else if (eventType === 'DELETE') {
      state.menu = state.menu.filter(m => m.id !== oldRecord.id);
    }
    saveLocalState();
    if (Savor.onRender) Savor.onRender();
  }

  function handleRealtimeAccount(payload) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      const idx = state.accounts.findIndex(a => a.id === newRecord.id);
      if (idx >= 0) state.accounts[idx] = newRecord;
      else state.accounts.push(newRecord);
    } else if (eventType === 'DELETE') {
      state.accounts = state.accounts.filter(a => a.id !== oldRecord.id);
    }
    saveLocalState();
    if (Savor.onRender) Savor.onRender();
  }

  function handleRealtimeTable(payload) {
    const { eventType, new: newRecord } = payload;
    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      const idx = state.tables.findIndex(t => t.id === newRecord.id);
      if (idx >= 0) state.tables[idx] = newRecord;
      else state.tables.push(newRecord);
    }
    saveLocalState();
    if (Savor.onRender) Savor.onRender();
  }

  function normalizeOrderRecord(o) {
    let items = o.items;
    if (typeof items === 'string') {
      try { items = JSON.parse(items); } catch (e) { items = []; }
    }
    if (!Array.isArray(items)) items = [];

    const status = String(o.status || 'PENDING');
    const normalizedItems = items.map(it => ({
      name: String(it.name || ''),
      qty: Number(it.qty) || 1,
      note: String(it.note || ''),
      price: Number(it.price) || 0,
      ready: !!it.ready || status === 'COMPLETED',
      readyAt: it.readyAt || null,
      served: !!it.served || status === 'COMPLETED',
      servedAt: it.servedAt || null
    }));

    return {
      id: String(o.id || ''),
      code: String(o.code || ''),
      status,
      items: normalizedItems,
      total: Number(o.total) || 0,
      subtotal: Number(o.subtotal) || 0,
      discount: Number(o.discount) || 0,
      payment: String(o.payment || 'UNPAID'),
      paymentMethod: o.payment_method || o.paymentMethod || '',
      staff: String(o.staff || 'Staff'),
      table: String(o.table || ''),
      customer: String(o.customer || ''),
      notes: String(o.notes || ''),
      createdAt: Number(o.created_at || o.createdAt || Date.now()),
      updatedAt: Number(o.updated_at || o.updatedAt || Date.now()),
      paidAt: (o.paid_at || o.paidAt) ? Number(o.paid_at || o.paidAt) : null
    };
  }

  async function fetchAllFromSupabase() {
    if (!state.supabaseClient) return;

    const { data: ordersData, error: ordersErr } = await state.supabaseClient
      .from('orders').select('*').order('created_at', { ascending: false });
    if (!ordersErr && ordersData) state.orders = ordersData.map(normalizeOrderRecord);

    const { data: menuData, error: menuErr } = await state.supabaseClient
      .from('menu').select('*').order('name', { ascending: true });
    if (!menuErr && menuData && menuData.length > 0) state.menu = menuData.map(normalizeMenuItem);

    const { data: accData, error: accErr } = await state.supabaseClient
      .from('accounts').select('*').order('name', { ascending: true });
    if (!accErr && accData && accData.length > 0) {
      const mergedMap = new Map();
      state.accounts.forEach(a => { if (a && a.id) mergedMap.set(a.id, a); });
      accData.forEach(rem => {
        if (rem && rem.id) {
          const loc = mergedMap.get(rem.id) || {};
          mergedMap.set(rem.id, { ...loc, ...rem });
        }
      });
      state.accounts = Array.from(mergedMap.values());
    }

    const { data: tblData, error: tblErr } = await state.supabaseClient
      .from('tables').select('*').order('number', { ascending: true });
    if (!tblErr && tblData && tblData.length > 0) state.tables = tblData;

    saveLocalState();
  }

  // ---------- Serverless API fallback ----------
  const API = {
    get enabled() { return !!(CONFIG.API_URL && CONFIG.API_URL.trim()); },
    async call(action, payload) {
      if (!this.enabled) throw new Error('No API URL configured');
      const url = cleanUrl(CONFIG.API_URL);
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 15000);
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, payload: payload || {} }),
          signal: ctrl.signal
        });
        clearTimeout(tid);
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || 'Server error');
        return json.data;
      } catch (err) {
        clearTimeout(tid);
        throw err;
      }
    }
  };

  // ---------- Unified Data Ops ----------
  const Data = {
    async createOrder(payload) {
      const now = Date.now();
      const id = uid('ord');
      let maxNum = 1000;
      state.orders.forEach(o => {
        const num = parseInt(String(o.code || '').replace(/[^0-9]/g, ''), 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      });
      const code = '#' + (maxNum + 1);

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
        total = normalizedItems.reduce((s, it) => s + (it.price * it.qty), 0);
      }

      const order = {
        id, code, status: 'PENDING', items: normalizedItems, total,
        subtotal: total, discount: 0, payment: 'UNPAID',
        staff: String(payload.staff || (Savor.session && Savor.session.name) || 'Waiter'),
        table: String(payload.table || ''),
        customer: String(payload.customer || ''),
        notes: String(payload.notes || ''),
        createdAt: now, updatedAt: now, paidAt: null
      };

      if (state.supabaseClient) {
        try {
          const dbPayload = {
            id: order.id, code: order.code, status: order.status,
            items: order.items, total: order.total, subtotal: order.subtotal,
            discount: order.discount, payment: order.payment, staff: order.staff,
            table: order.table, customer: order.customer, notes: order.notes,
            created_at: order.createdAt, updated_at: order.updatedAt
          };
          const { error } = await state.supabaseClient.from('orders').insert(dbPayload);
          if (error) console.warn('Supabase insert order error:', error.message);
        } catch (e) { }
      }

      if (!state.supabaseClient && API.enabled) {
        try { await API.call('createOrder', order); } catch (e) { }
      }

      if (!state.orders.find(o => o.id === order.id)) state.orders.unshift(order);
      broadcast({ type: 'DATA_CHANGED' });
      return order;
    },

    async updateOrderStatus(id, status, staff) {
      const order = state.orders.find(o => o.id === id);
      if (!order) return;
      const now = Date.now();
      order.status = status;
      order.updatedAt = now;
      if (staff) order.staff = staff;

      if (state.supabaseClient) {
        try {
          await state.supabaseClient.from('orders').update({
            status, staff: order.staff, updated_at: now
          }).eq('id', id);
        } catch (e) { }
      } else if (API.enabled) {
        try { await API.call('updateOrderStatus', { id, status, staff }); } catch (e) { }
      }

      broadcast({ type: 'DATA_CHANGED' });
      return order;
    },

    async markItemReady(orderId, itemIndex, staff = 'Kitchen') {
      const order = state.orders.find(o => o.id === orderId);
      if (!order) return;
      const item = order.items[itemIndex];
      if (!item) return;
      const now = Date.now();
      item.ready = true;
      item.readyAt = now;
      const allDone = (order.items || []).every(i => !!i.ready);
      order.status = allDone ? 'READY' : 'PREPARING';
      order.updatedAt = now;
      order.staff = staff;

      if (state.supabaseClient) {
        try {
          await state.supabaseClient.from('orders').update({
            status: order.status, items: order.items, staff: order.staff, updated_at: now
          }).eq('id', orderId);
        } catch (e) { }
      } else if (API.enabled) {
        try { await API.call('markItemReady', { orderId, itemIndex, staff, ready: true }); } catch (e) { }
      }

      broadcast({ type: 'DATA_CHANGED' });
      return order;
    },

    async toggleItemReady(orderId, itemIndex, staff = 'Kitchen') {
      const order = state.orders.find(o => o.id === orderId);
      if (!order) return;
      const item = order.items[itemIndex];
      if (!item) return;
      const now = Date.now();
      item.ready = !item.ready;
      item.readyAt = item.ready ? now : null;
      if (!item.ready) item.served = false;
      const allDone = (order.items || []).every(i => !!i.ready);
      order.status = allDone ? 'READY' : 'PREPARING';
      order.updatedAt = now;
      order.staff = staff;

      if (state.supabaseClient) {
        try {
          await state.supabaseClient.from('orders').update({
            status: order.status, items: order.items, staff: order.staff, updated_at: now
          }).eq('id', orderId);
        } catch (e) { }
      } else if (API.enabled) {
        try { await API.call('markItemReady', { orderId, itemIndex, staff, ready: item.ready }); } catch (e) { }
      }

      broadcast({ type: 'DATA_CHANGED' });
      return order;
    },

    async serveItem(orderId, itemIndex, staff = 'Waiter') {
      const order = state.orders.find(o => o.id === orderId);
      if (!order) return;
      const item = order.items[itemIndex];
      if (!item || item.served) return;
      const now = Date.now();
      item.served = true;
      item.servedAt = now;
      if (allServed(order)) order.status = 'COMPLETED';
      order.updatedAt = now;
      order.staff = staff;

      if (state.supabaseClient) {
        try {
          await state.supabaseClient.from('orders').update({
            status: order.status, items: order.items, staff: order.staff, updated_at: now
          }).eq('id', orderId);
        } catch (e) { }
      } else if (API.enabled) {
        try { await API.call('serveItem', { orderId, itemIndex, staff }); } catch (e) { }
      }

      broadcast({ type: 'DATA_CHANGED' });
      return order;
    },

    async markPaid(id, paymentMethod = 'CASH', discountAmount = 0, discountType = 'NONE') {
      const order = state.orders.find(o => o.id === id);
      if (!order) return;
      const now = Date.now();
      order.payment = 'PAID';
      order.paymentMethod = paymentMethod;
      order.paidAt = now;
      order.updatedAt = now;
      if (discountAmount > 0) {
        order.discount = discountAmount;
        order.total = Math.max(0, order.total - discountAmount);
      }

      if (state.supabaseClient) {
        try {
          await state.supabaseClient.from('orders').update({
            payment: 'PAID', payment_method: paymentMethod, discount: order.discount,
            discount_type: discountType, total: order.total, paid_at: now, updated_at: now
          }).eq('id', id);
        } catch (e) { }
      } else if (API.enabled) {
        try { await API.call('markOrderPaid', { id, paymentMethod, discount: order.discount }); } catch (e) { }
      }

      broadcast({ type: 'DATA_CHANGED' });
      return order;
    },

    async saveMenuItem(item) {
      const normalized = normalizeMenuItem(item);
      const idx = state.menu.findIndex(m => m.id === normalized.id);
      if (idx >= 0) state.menu[idx] = normalized;
      else state.menu.unshift(normalized);
      saveLocalState();

      if (state.supabaseClient) {
        try {
          await state.supabaseClient.from('menu').upsert({
            id: normalized.id, name: normalized.name, category: normalized.category,
            description: normalized.description, ingredients: normalized.ingredients,
            price: normalized.price, cost_price: normalized.cost_price,
            emoji: normalized.emoji, image: normalized.image, available: normalized.available
          });
        } catch (e) { }
      } else if (API.enabled) {
        try { await API.call('saveMenuItem', { item: normalized }); } catch (e) { }
      }

      broadcast({ type: 'DATA_CHANGED' });
      return normalized;
    },

    async deleteMenuItem(id) {
      state.menu = state.menu.filter(m => m.id !== id);
      if (state.supabaseClient) {
        try { await state.supabaseClient.from('menu').delete().eq('id', id); } catch (e) { }
      } else if (API.enabled) {
        try { await API.call('deleteMenuItem', { id }); } catch (e) { }
      }
      broadcast({ type: 'DATA_CHANGED' });
    },

    async saveAccount(account) {
      const id = account.id || uid('acc');
      account.id = id;
      account.password = account.password || '';
      account.status = account.status || 'Active';
      const idx = state.accounts.findIndex(a => a.id === id);
      if (idx >= 0) state.accounts[idx] = { ...state.accounts[idx], ...account };
      else state.accounts.push({ ...account });
      saveLocalState();

      if (state.supabaseClient) {
        try {
          await state.supabaseClient.from('accounts').upsert({
            id: account.id, name: account.name || 'Staff',
            username: account.username || null, password: account.password || '',
            pin: String(account.pin || '1212'), role: account.role || 'Waiter',
            status: account.status || 'Active'
          });
        } catch (e) { }
      } else if (API.enabled) {
        try { await API.call('saveAccount', { account }); } catch (e) { }
      }

      broadcast({ type: 'DATA_CHANGED' });
      return account;
    },

    async deleteAccount(id) {
      state.accounts = state.accounts.filter(a => a.id !== id);
      saveLocalState();
      if (state.supabaseClient) {
        try { await state.supabaseClient.from('accounts').delete().eq('id', id); } catch (e) { }
      } else if (API.enabled) {
        try { await API.call('deleteAccount', { id }); } catch (e) { }
      }
      broadcast({ type: 'DATA_CHANGED' });
    },

    async saveTable(table) {
      const id = table.id || uid('tbl');
      table.id = id;
      const idx = state.tables.findIndex(t => t.id === id);
      if (idx >= 0) state.tables[idx] = { ...state.tables[idx], ...table };
      else state.tables.push({ ...table });
      if (state.supabaseClient) {
        try { await state.supabaseClient.from('tables').upsert(table); } catch (e) { }
      }
      broadcast({ type: 'DATA_CHANGED' });
      return table;
    },

    async deleteOrdersByDay(targetDateKey) {
      if (!targetDateKey) return { count: 0 };
      const removedOrders = state.orders.filter(o => fmtDateKey(o.createdAt || o.created_at || Date.now()) === targetDateKey);
      const removedIds = removedOrders.map(o => o.id);

      state.orders = state.orders.filter(o => fmtDateKey(o.createdAt || o.created_at || Date.now()) !== targetDateKey);
      const removedSet = new Set(removedIds);
      state.tables.forEach(tbl => {
        if (tbl.current_order_id && removedSet.has(tbl.current_order_id)) {
          tbl.status = 'AVAILABLE';
          tbl.current_order_id = null;
        }
      });
      saveLocalState();

      if (state.supabaseClient && removedIds.length > 0) {
        try {
          await state.supabaseClient.from('orders').delete().in('id', removedIds);
          await state.supabaseClient.from('tables').upsert(state.tables);
        } catch (e) { }
      } else if (API.enabled && removedIds.length > 0) {
        try { await API.call('deleteOrdersByIds', { ids: removedIds }); } catch (e) { }
      }

      broadcast({ type: 'DATA_CHANGED' });
      return { count: removedOrders.length, date: targetDateKey };
    }
  };

  // ---------- Broadcast ----------
  let localBus = null;
  try {
    localBus = new BroadcastChannel('savor_tab_bus');
    localBus.onmessage = (e) => {
      if (e.data && e.data.type === 'DATA_CHANGED') {
        loadLocalState();
        if (Savor.onRender) Savor.onRender();
        if (Savor._renderNav) Savor._renderNav();
      }
    };
  } catch (e) { }

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.startsWith('savor.')) {
        loadLocalState();
        if (Savor.onRender) Savor.onRender();
        if (Savor._renderNav) Savor._renderNav();
      }
    });
  }

  function broadcast(msg) {
    saveLocalState();
    try { if (localBus) localBus.postMessage(msg); } catch (e) { }
  }

  // ---------- Toast (XSS-safe) ----------
  function toast(message, duration = 4000, tone = 'default') {
    let container = document.getElementById('toast');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast';
      container.className = 'toast';
      container.setAttribute('role', 'status');
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }
    const cls = tone === 'success' || tone === 'alert' ? 'show alert'
      : tone === 'info' ? 'show info' : 'show';
    container.className = 'toast ' + cls;
    container.innerHTML = '<div class="flex items-center gap-2.5"><span></span></div>';
    const span = container.querySelector('span');
    if (span) span.textContent = message;
    clearTimeout(container._timer);
    container._timer = setTimeout(() => { container.className = 'toast'; }, duration);
  }

  // ---------- Modal ----------
  const Modal = {
    open(htmlContent) {
      let backdrop = document.getElementById('modal-backdrop');
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'modal-backdrop';
        backdrop.className = 'backdrop';
        backdrop.innerHTML = '<div id="modal-content" class="modal"></div>';
        document.body.appendChild(backdrop);
        backdrop.addEventListener('click', (e) => { if (e.target === backdrop) Modal.close(); });
      }
      const content = document.getElementById('modal-content');
      setHtml(content, htmlContent);
      backdrop.classList.add('show');
      document.body.style.overflow = 'hidden';
    },
    close() {
      const backdrop = document.getElementById('modal-backdrop');
      if (backdrop) backdrop.classList.remove('show');
      document.body.style.overflow = '';
    }
  };

  // ---------- Connect Supabase Modal ----------
  function openConnectModal() {
    Modal.open(`
      <div class="p-5 sm:p-6 max-w-lg mx-auto">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-xl font-bold font-serif flex items-center gap-2">
              ${icon('database', 'w-5 h-5 text-primary')} Connect Supabase Cloud
            </h3>
            <p class="text-sm text-muted mt-1">Multi-user real-time database hosted 100% online.</p>
          </div>
          <button class="btn btn-ghost p-1.5" onclick="Savor.Modal.close()">${icon('x', 'w-4 h-4')}</button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-muted mb-1">Supabase Project URL</label>
            <input type="text" id="cfg-supabase-url" class="input" placeholder="https://xyzcompany.supabase.co" value="${esc(CONFIG.SUPABASE_URL)}">
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-muted mb-1">Supabase Anon Key (Public)</label>
            <textarea id="cfg-supabase-key" class="input font-mono text-xs" rows="3" placeholder="eyJ...">${esc(CONFIG.SUPABASE_KEY)}</textarea>
          </div>
          <div class="flex gap-2 pt-2">
            <button class="btn btn-primary flex-1 justify-center" onclick="Savor.saveSupabaseConfig()">
              ${icon('check', 'w-4 h-4')} Save &amp; Connect Live
            </button>
            <button class="btn btn-ghost" onclick="Savor.Modal.close()">Cancel</button>
          </div>
        </div>
      </div>
    `);
  }

  function saveSupabaseConfig() {
    const url = document.getElementById('cfg-supabase-url')?.value.trim() || '';
    const key = document.getElementById('cfg-supabase-key')?.value.trim() || '';
    CONFIG.SUPABASE_URL = cleanSupabaseUrl(url);
    CONFIG.SUPABASE_KEY = key;
    safeSet('savor.supabase_url', CONFIG.SUPABASE_URL);
    safeSet('savor.supabase_key', CONFIG.SUPABASE_KEY);
    Modal.close();
    toast('⚡ Connecting to Supabase Cloud...', 3000, 'info');
    initSupabase().then(() => {
      toast('🟢 Connected to Supabase Realtime!', 4000, 'success');
      if (Savor.onRender) Savor.onRender();
      if (Savor._renderNav) Savor._renderNav();
    });
  }

  function copySqlSchema() {
    fetch('supabase-schema.sql').then(r => r.text()).then(text => {
      navigator.clipboard.writeText(text);
      toast('📋 Supabase SQL Schema copied!', 4000, 'success');
    }).catch(() => toast('Open supabase-schema.sql in your project to copy.', 4000, 'info'));
  }

  // ---------- Theme / Sound ----------
  function toggleDark() {
    state.dark = !state.dark;
    safeSet('savor.dark', state.dark ? '1' : '0');
    document.documentElement.classList.toggle('dark', state.dark);
    if (Savor._renderNav) Savor._renderNav();
    if (Savor.onRender) Savor.onRender();
  }

  function toggleSound() {
    state.sound = !state.sound;
    safeSet('savor.sound', state.sound ? '1' : '0');
    toast(state.sound ? '🔔 Sound on' : '🔕 Sound muted', 2000);
    if (Savor._renderNav) Savor._renderNav();
    if (Savor.onRender) Savor.onRender();
  }

  function setNet(net) {
    state.net = net;
    if (Savor._renderNav) Savor._renderNav();
  }

  // ---------- Nav ----------
  function renderNav(roleTitle, currentScreen, navItems = []) {
    const session = getSession();
    const isAdmin = session && (String(session.role || '').toLowerCase() === 'admin');

    const netBadges = {
      realtime: isAdmin
        ? `<button type="button" class="pill pill-live cursor-pointer hover:opacity-90" onclick="Savor.navigate ? Savor.navigate('settings') : (window.location.href='admin.html')" title="Manage Cloud Database in Admin Settings"><span class="hidden sm:inline">Live</span></button>`
        : `<span class="pill pill-live select-none" title="Supabase WebSockets Active"><span class="hidden sm:inline">Live</span></span>`,
      cloud: `<span class="pill pill-pending select-none"><span class="w-1.5 h-1.5 rounded-full bg-current"></span><span class="hidden sm:inline">Cloud</span></span>`,
      local: `<span class="pill pill-unpaid select-none"><span class="w-1.5 h-1.5 rounded-full bg-current"></span><span class="hidden sm:inline">Local</span></span>`,
      connecting: `<span class="pill pill-pending select-none"><span class="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span><span class="hidden sm:inline">Syncing</span></span>`
    };

    return `
      <header class="navbar" role="banner">
        <div class="navbar-inner">
          <a href="index.html" class="brand" aria-label="Home">
            <span class="brand-mark">✦</span>
            <span class="brand-text">
              <span class="brand-title">Savor &amp; Co.</span>
              <span class="brand-sub">${esc(roleTitle)}</span>
            </span>
          </a>

          ${navItems.length > 0 ? `
            <nav class="nav-tabs-desktop" role="tablist" aria-label="Sections">
              ${navItems.map(item => `
                <button type="button" class="nav-tab ${currentScreen === item.key ? 'active' : ''}"
                        role="tab" aria-selected="${currentScreen === item.key}"
                        onclick="Savor.navigate('${item.key}')">
                  ${icon(item.icon, 'w-4 h-4')}
                  <span>${esc(item.label)}</span>
                  ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
                </button>
              `).join('')}
            </nav>
          ` : ''}

          <div class="nav-actions">
            ${netBadges[state.net] || netBadges.local}
            <button class="icon-btn" onclick="Savor.toggleSound()" title="${state.sound ? 'Mute' : 'Enable'} sound" aria-label="Toggle sound">
              ${icon(state.sound ? 'volume-2' : 'volume-x', 'w-4 h-4')}
            </button>
            <button class="icon-btn" onclick="Savor.toggleDark()" title="Toggle theme" aria-label="Toggle theme">
              ${icon(state.dark ? 'sun' : 'moon', 'w-4 h-4')}
            </button>
            ${session ? `
              <button type="button" class="logout-btn" onclick="Savor.logout()" title="Sign out" aria-label="Sign out">
                ${icon('log-out', 'w-4 h-4')}
                <span class="logout-text">Sign Out</span>
              </button>
            ` : `
              <a href="index.html" class="btn btn-ghost py-1.5 px-3 text-xs">Switch</a>
            `}
          </div>
        </div>

        ${(navItems.length > 0 || session) ? `
          <nav class="nav-tabs-mobile" role="tablist" aria-label="Sections">
            ${navItems.map(item => `
              <button type="button" class="nav-mobile-tab ${currentScreen === item.key ? 'active' : ''}"
                      role="tab" aria-selected="${currentScreen === item.key}"
                      onclick="Savor.navigate('${item.key}')">
                <span class="nav-mobile-icon">
                  ${icon(item.icon, 'w-5 h-5')}
                  ${item.badge ? `<span class="nav-mobile-badge">${item.badge}</span>` : ''}
                </span>
                <span class="nav-mobile-label">${esc(item.label)}</span>
              </button>
            `).join('')}
            ${session ? `
              <button type="button" class="nav-mobile-tab nav-mobile-logout"
                      onclick="Savor.logout()" aria-label="Sign out">
                <span class="nav-mobile-icon">${icon('log-out', 'w-5 h-5')}</span>
                <span class="nav-mobile-label">Sign Out</span>
              </button>
            ` : ''}
          </nav>
        ` : ''}
      </header>
    `;
  }

  function logout() {
    clearSession();
    window.location.href = 'index.html';
  }

  function boot(options = {}) {
    Savor.role = options.role || 'guest';
    Savor.currentScreen = options.defaultScreen || 'dashboard';
    Savor.onRender = options.render || function () { };
    document.documentElement.classList.toggle('dark', state.dark);
    initSupabase().then(() => {
      if (Savor.onRender) Savor.onRender();
      if (Savor._renderNav) Savor._renderNav();
    });
    if (Savor.onRender) Savor.onRender();
  }

  function navigate(screenKey) {
    Savor.currentScreen = screenKey;
    if (Savor.onRender) Savor.onRender();
    if (Savor._renderNav) Savor._renderNav();
  }

  // ---------- Design System ----------
  const STYLE_CSS = `
    :root {
      --bg: #FAF8F5; --surface: #FFFFFF; --surface-2: #F3EFE9; --surface-3: #EAE4DC;
      --border: #E7E1D8; --border-strong: #D6CFC3;
      --ink: #1B1A18; --ink-soft: #3A3530; --text-muted: #6C665E; --text-subtle: #9A938A;
      --primary: #B44A26; --primary-hover: #9B3E1F; --primary-text: #FFFFFF;
      --primary-soft: #FBE9E1; --primary-ring: rgba(180, 74, 38, 0.25);
      --success: #25704F; --success-soft: #E3F1EA;
      --warn: #8A6412; --warn-soft: #FAF0D8;
      --info: #2A5AA0; --info-soft: #E6EEFA;
      --alert: #B3261E; --alert-soft: #FBE8E6;
      --shadow-sm: 0 1px 2px rgba(28, 25, 20, 0.05);
      --shadow-md: 0 1px 2px rgba(28, 25, 20, 0.05), 0 10px 30px rgba(28, 25, 20, 0.06);
      --shadow-lg: 0 30px 70px rgba(20, 17, 12, 0.22);
    }
    html.dark {
      --bg: #141311; --surface: #1C1A17; --surface-2: #262320; --surface-3: #302C27;
      --border: #37332C; --border-strong: #4A4540;
      --ink: #F5F2EC; --ink-soft: #D5CFC3; --text-muted: #A69F95; --text-subtle: #7B756C;
      --primary: #E8845C; --primary-hover: #F09A78; --primary-text: #2A120A;
      --primary-soft: #3A211A; --primary-ring: rgba(232, 132, 92, 0.3);
      --success: #5FC194; --success-soft: #173025;
      --warn: #E2B75C; --warn-soft: #33280F;
      --info: #82AEEA; --info-soft: #1A2436;
      --alert: #F0736A; --alert-soft: #3A1F1D;
      --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.35);
      --shadow-md: 0 1px 2px rgba(0, 0, 0, 0.35), 0 10px 30px rgba(0, 0, 0, 0.35);
      --shadow-lg: 0 30px 70px rgba(0, 0, 0, 0.6);
    }
    *, *::before, *::after { box-sizing: border-box; }
    html { -webkit-text-size-adjust: 100%; }
    body {
      margin: 0; padding: 0;
      font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
      background: var(--bg); color: var(--ink);
      -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
      min-height: 100vh; min-height: 100dvh;
      overscroll-behavior-y: none; line-height: 1.5;
      transition: background-color 0.25s, color 0.25s;
    }
    body:has(.nav-tabs-mobile) { padding-bottom: calc(4.5rem + env(safe-area-inset-bottom, 0px)); }
    @media (min-width: 768px) { body:has(.nav-tabs-mobile) { padding-bottom: 0; } }
    .font-serif { font-family: 'Fraunces', Georgia, serif; font-optical-sizing: auto; letter-spacing: -0.01em; }
    button { font: inherit; cursor: pointer; border: 0; background: none; color: inherit; }
    input, select, textarea { font: inherit; color: inherit; }
    :focus-visible { outline: 3px solid var(--primary); outline-offset: 2px; border-radius: 8px; }
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--surface-3); border-radius: 9999px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }

    .navbar {
      position: sticky; top: 0; z-index: 40;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding-top: env(safe-area-inset-top, 0px);
    }
    .navbar-inner {
      max-width: 80rem; margin: 0 auto;
      padding: 0.5rem 0.75rem;
      display: flex; align-items: center; justify-content: space-between;
      gap: 0.5rem; min-height: 3.5rem;
    }
    @media (min-width: 640px) { .navbar-inner { padding: 0.75rem 1.5rem; gap: 1rem; } }

    .brand { display: flex; align-items: center; gap: 0.65rem; text-decoration: none; flex: 1 1 auto; min-width: 0; overflow: hidden; }
    .brand-mark {
      width: 2.5rem; height: 2.5rem; border-radius: 12px;
      background: var(--primary); color: var(--primary-text);
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 1.1rem; flex-shrink: 0;
    }
    .brand-text { display: flex; flex-direction: column; line-height: 1.15; min-width: 0; overflow: hidden; }
    .brand-title {
      font-family: 'Fraunces', Georgia, serif; font-weight: 700; font-size: 1rem;
      color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      letter-spacing: -0.01em;
    }
    .brand-sub {
      font-size: 0.7rem; font-weight: 500; color: var(--text-muted);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px;
    }
    @media (max-width: 359px) { .brand-text { display: none; } }

    .nav-tabs-desktop {
      display: none; align-items: center; gap: 0.25rem;
      background: var(--surface-2); padding: 0.3rem;
      border-radius: 14px; border: 1px solid var(--border); flex-shrink: 0;
    }
    @media (min-width: 768px) { .nav-tabs-desktop { display: flex; } }

    .nav-tab {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.5rem 0.85rem; border-radius: 10px;
      font-size: 0.82rem; font-weight: 600; color: var(--text-muted);
      background: transparent; border: 0; cursor: pointer;
      transition: all 0.15s; white-space: nowrap; touch-action: manipulation;
    }
    .nav-tab:hover { color: var(--ink); background: color-mix(in srgb, var(--surface) 70%, transparent); }
    .nav-tab.active { background: var(--primary); color: var(--primary-text); box-shadow: var(--shadow-sm); font-weight: 700; }

    .nav-badge {
      background: var(--primary); color: var(--primary-text);
      font-size: 0.65rem; font-weight: 700; padding: 0.05rem 0.4rem;
      border-radius: 999px; line-height: 1.2; min-width: 1.1rem; text-align: center;
    }
    .nav-tab.active .nav-badge { background: rgba(255, 255, 255, 0.25); color: #fff; }

    .nav-actions { display: flex; align-items: center; gap: 0.35rem; flex-shrink: 0; }

    .logout-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;
      padding: 0.5rem 0.75rem; min-height: 2.4rem; border-radius: 12px;
      background: var(--alert-soft); color: var(--alert);
      border: 1px solid color-mix(in srgb, var(--alert) 30%, var(--border));
      font-weight: 700; font-size: 0.8rem; cursor: pointer;
      transition: all 0.15s; flex-shrink: 0;
      -webkit-tap-highlight-color: transparent; white-space: nowrap; line-height: 1;
      touch-action: manipulation;
    }
    .logout-btn:hover, .logout-btn:focus-visible {
      background: var(--alert); color: #fff; border-color: var(--alert);
      box-shadow: 0 4px 12px color-mix(in srgb, var(--alert) 30%, transparent);
    }
    .logout-btn:active { transform: translateY(1px); }
    @media (max-width: 767px) {
      .logout-btn { padding: 0; width: 2.4rem; min-width: 2.4rem; min-height: 2.4rem; }
      .logout-btn .logout-text { display: none; }
    }

    .nav-tabs-mobile {
      display: flex; align-items: stretch; justify-content: space-around;
      background: var(--surface); border-top: 1px solid var(--border);
      padding: 0.35rem 0.25rem calc(0.35rem + env(safe-area-inset-bottom, 0px));
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 40;
    }
    @media (min-width: 768px) { .nav-tabs-mobile { display: none; } }

    .nav-mobile-tab {
      flex: 1 1 0; min-width: 0; display: flex; flex-direction: column;
      align-items: center; gap: 0.15rem; padding: 0.4rem 0.15rem;
      background: transparent; border: 0; color: var(--text-muted);
      cursor: pointer; border-radius: 12px; transition: all 0.15s;
      min-height: 2.75rem; -webkit-tap-highlight-color: transparent;
      overflow: hidden; touch-action: manipulation;
    }
    .nav-mobile-tab.active { color: var(--primary); background: var(--primary-soft); font-weight: 600; }
    .nav-mobile-icon { position: relative; display: inline-flex; }
    .nav-mobile-badge {
      position: absolute; top: -0.3rem; right: -0.5rem;
      background: var(--primary); color: var(--primary-text);
      font-size: 0.6rem; font-weight: 700; padding: 0.05rem 0.35rem;
      border-radius: 999px; min-width: 1rem; text-align: center;
      line-height: 1.2; border: 2px solid var(--surface);
    }
    .nav-mobile-label {
      font-size: 0.62rem; font-weight: 600;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%;
    }
    .nav-mobile-logout { color: var(--alert) !important; }
    .nav-mobile-logout:hover, .nav-mobile-logout:active { background: var(--alert-soft) !important; }
    .nav-mobile-logout .nav-mobile-label { color: var(--alert); }

    .card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 18px; box-shadow: var(--shadow-sm); transition: all 0.2s ease;
    }
    .card.interactive:hover { border-color: var(--border-strong); box-shadow: var(--shadow-md); transform: translateY(-2px); }
    .card.interactive:active { transform: translateY(0); }

    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
      padding: 0.65rem 1rem; min-height: 2.4rem; border-radius: 12px;
      font-weight: 600; font-size: 0.875rem;
      border: 1px solid transparent;
      transition: transform 0.12s, background-color 0.15s, border-color 0.15s;
      white-space: nowrap; line-height: 1.2;
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }
    @media (max-width: 639px) { .btn { min-height: 2.75rem; } }
    .btn:disabled { opacity: 0.5; pointer-events: none; }
    .btn:active { transform: translateY(1px); }
    .btn-primary { background: var(--primary); color: var(--primary-text); }
    .btn-primary:hover { background: var(--primary-hover); }
    .btn-ghost { background: var(--surface); border-color: var(--border); color: var(--ink); }
    .btn-ghost:hover { background: var(--surface-2); }

    .icon-btn {
      width: 2.4rem; height: 2.4rem; border-radius: 12px;
      display: inline-flex; align-items: center; justify-content: center;
      background: var(--surface); color: var(--ink); border: 1px solid var(--border);
      cursor: pointer; transition: all 0.15s; flex-shrink: 0;
      -webkit-tap-highlight-color: transparent; touch-action: manipulation;
    }
    .icon-btn:hover { background: var(--surface-2); color: var(--primary); }
    .icon-btn:active { transform: translateY(1px); }

    .input {
      width: 100%; padding: 0.7rem 0.85rem; min-height: 2.4rem;
      border-radius: 12px; border: 1px solid var(--border);
      background: var(--surface-2); color: var(--ink);
      font-size: 0.875rem; outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
      -webkit-appearance: none; appearance: none;
    }
    @media (max-width: 639px) { .input { font-size: 16px; min-height: 2.75rem; } }
    .input:hover { border-color: var(--border-strong); }
    .input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-ring); background: var(--surface); }
    .input::placeholder { color: var(--text-muted); }
    input[type="number"] { -webkit-appearance: none; -moz-appearance: textfield; }
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }

    .pill {
      display: inline-flex; align-items: center; gap: 0.35rem;
      border-radius: 999px; padding: 0.3rem 0.7rem;
      font-size: 0.72rem; font-weight: 700; letter-spacing: 0.02em;
      white-space: nowrap; line-height: 1.3;
    }
    .pill-pending { background: var(--info-soft); color: var(--info); }
    .pill-preparing { background: var(--primary-soft); color: var(--primary); }
    .pill-ready, .pill-paid { background: var(--success-soft); color: var(--success); }
    .pill-completed { background: var(--surface-2); color: var(--text-muted); }
    .pill-unpaid { background: var(--warn-soft); color: var(--warn); }
    .pill-alert { background: var(--alert-soft); color: var(--alert); }
    .pill-info { background: var(--info-soft); color: var(--info); }
    .pill-cancelled { background: var(--alert-soft); color: var(--alert); text-decoration: line-through; }
    .pill-live { background: var(--success-soft); color: var(--success); }
    .pill-live::before {
      content: ""; width: 6px; height: 6px; border-radius: 50%;
      background: currentColor; animation: pillPulse 1.6s ease-in-out infinite;
    }
    @keyframes pillPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }

    .table-tag {
      display: inline-flex; align-items: center; gap: 0.35rem;
      border-radius: 8px; padding: 0.25rem 0.55rem;
      font-size: 0.72rem; font-weight: 700;
      background: var(--warn-soft); color: var(--warn); white-space: nowrap;
    }

    .backdrop {
      position: fixed; inset: 0;
      background: rgba(20, 17, 12, 0.5);
      backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px);
      z-index: 50; display: none;
      align-items: flex-end; justify-content: center; padding: 0;
    }
    .backdrop.show { display: flex; }
    @media (min-width: 640px) { .backdrop { align-items: center; padding: 1rem; } }

    .modal {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 24px 24px 0 0; width: 100%; max-width: 100%;
      max-height: 92vh; max-height: 92dvh; overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      box-shadow: var(--shadow-lg);
      animation: modalSlideUp 0.28s cubic-bezier(0.4, 0, 0.2, 1);
      padding-bottom: env(safe-area-inset-bottom, 0px);
    }
    @media (min-width: 640px) {
      .modal {
        border-radius: 24px; max-width: 42rem; max-height: 90vh;
        padding-bottom: 0; animation: modalPop 0.22s cubic-bezier(0.4, 0, 0.2, 1);
      }
    }
    @keyframes modalSlideUp { from { transform: translateY(100%); opacity: 0.6; } to { transform: translateY(0); opacity: 1; } }
    @keyframes modalPop { from { opacity: 0; transform: translateY(14px) scale(0.98); } to { opacity: 1; transform: none; } }

    .toast {
      position: fixed;
      top: calc(3.75rem + env(safe-area-inset-top, 0px));
      left: 1rem; right: 1rem; z-index: 60; max-width: 28rem; margin: 0 auto;
      padding: 0.9rem 1.05rem; border-radius: 14px;
      font-size: 0.875rem; font-weight: 600;
      background: var(--ink); color: var(--bg);
      box-shadow: var(--shadow-lg);
      transform: translateY(-160%); opacity: 0; pointer-events: none;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s;
      line-height: 1.4;
    }
    .toast.show { transform: translateY(0); opacity: 1; pointer-events: auto; }
    .toast.alert { background: var(--success); color: #fff; font-weight: 700; }
    .toast.info { background: var(--info); color: #fff; font-weight: 700; }
    @media (min-width: 768px) {
      .toast { top: auto; left: auto; right: 1rem; bottom: 1rem; margin: 0; min-width: 20rem; transform: translateY(160%); }
      .toast.show { transform: translateY(0); }
    }

    .pin-dot {
      width: 1rem; height: 1rem; border-radius: 999px;
      border: 2px solid var(--border-strong); background: transparent;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .pin-dot.filled {
      background: var(--primary); border-color: var(--primary);
      transform: scale(1.2); box-shadow: 0 0 12px var(--primary-ring);
    }

    @keyframes pinShake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-8px); }
      40%, 80% { transform: translateX(8px); }
    }
    .animate-shake { animation: pinShake 0.4s ease-in-out; }

    @keyframes pulseGlow {
      0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--alert) 40%, transparent); }
      50% { box-shadow: 0 0 0 8px color-mix(in srgb, var(--alert) 0%, transparent); }
    }
    .ticket-urgent { animation: pulseGlow 1.8s infinite; border-color: var(--alert) !important; }

    @media (max-width: 767px) {
      table[data-mobile-cards] thead { display: none; }
      table[data-mobile-cards] tbody tr {
        display: block; background: var(--surface);
        border: 1px solid var(--border); border-radius: 14px;
        margin-bottom: 0.6rem; padding: 0.85rem;
      }
      table[data-mobile-cards] tbody td {
        display: flex; justify-content: space-between; align-items: center;
        padding: 0.35rem 0 !important; border: none !important; font-size: 0.82rem;
      }
      table[data-mobile-cards] tbody td::before {
        content: attr(data-label); font-weight: 700; font-size: 0.7rem;
        text-transform: uppercase; letter-spacing: 0.05em;
        color: var(--text-muted); margin-right: 0.75rem;
      }
      table[data-mobile-cards] tbody td[data-label=""]::before { content: ''; margin: 0; }
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = STYLE_CSS;
  document.head.appendChild(styleEl);

  Object.assign(Savor, {
    CONFIG, state, SEED_MENU, SEED_ACCOUNTS, SEED_TABLES,
    saveLocalState, loadLocalState, broadcast, Data, API, Modal,
    safeGet, safeSet, cleanUrl, cleanSupabaseUrl, esc, uid,
    isToday, fmtDateKey, fmtDate, fmtTime, fmtDateTime, peso, pretty,
    statusPill, paymentPill, orderTotal, hasMeta, orderMetaText, tableTag,
    itemCount, servedCount, readyCount, unreadyCount, readyUnservedCount,
    allServed, itemSummary, allNotes, normalizeMenuItem, sanitizeUsername,
    processImageFile, menuHero, icon, setHtml, playChime, toast,
    getSession, setSession, clearSession, requireRole, logout,
    toggleDark, toggleSound, setNet, renderNav, boot, navigate,
    openConnectModal, saveSupabaseConfig, copySqlSchema, initSupabase
  });
})();