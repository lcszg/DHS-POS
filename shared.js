/* =========================================================================
   SAVOR & CO. — SHARED LIBRARY
   ========================================================================= */
(function(){
  'use strict';

  const CSS = `
    :root{
      --bg:#FAF8F5; --surface:#FFFFFF; --surface-2:#F3EFE9; --border:#E7E1D8;
      --text:#1B1A18; --text-muted:#6C665E;
      --primary:#B44A26; --primary-hover:#9B3E1F; --primary-soft:#FBE9E1; --on-primary:#FFFFFF;
      --success:#25704F; --success-soft:#E3F1EA;
      --warn:#8A6412;    --warn-soft:#FAF0D8;
      --info:#2A5AA0;    --info-soft:#E6EEFA;
      --danger:#B3261E;  --danger-soft:#FBE8E6;
      --sidebar-bg:#211F1C; --sidebar-text:#F1ECE4; --sidebar-muted:#A9A199;
      --shadow:0 1px 2px rgba(28,25,20,.05), 0 10px 30px rgba(28,25,20,.06);
      --shadow-lg:0 30px 70px rgba(20,17,12,.22);
    }
    .dark{
      --bg:#141311; --surface:#1C1A17; --surface-2:#262320; --border:#37332C;
      --text:#F5F2EC; --text-muted:#A69F95;
      --primary:#E8845C; --primary-hover:#F09A78; --primary-soft:#3A211A; --on-primary:#2A120A;
      --success:#5FC194; --success-soft:#173025;
      --warn:#E2B75C;    --warn-soft:#33280F;
      --info:#82AEEA;    --info-soft:#1A2436;
      --danger:#F0736A;  --danger-soft:#3A1F1D;
      --sidebar-bg:#191816; --sidebar-text:#F1ECE4; --sidebar-muted:#8F887F;
      --shadow:0 1px 2px rgba(0,0,0,.35), 0 10px 30px rgba(0,0,0,.35);
      --shadow-lg:0 30px 70px rgba(0,0,0,.6);
    }
    *{box-sizing:border-box}
    body{margin:0;font-family:'DM Sans',system-ui,sans-serif;background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased;transition:background-color .25s,color .25s}
    button{font:inherit;cursor:pointer;border:0;background:none;color:inherit}
    input,select,textarea{font:inherit;color:inherit}
    :focus-visible{outline:3px solid var(--primary);outline-offset:2px;border-radius:8px}
    .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0}
    .card{background:var(--surface);border:1px solid var(--border);border-radius:18px}
    .soft{box-shadow:var(--shadow)}
    .field{width:100%;padding:.7rem .85rem;border-radius:12px;border:1px solid var(--border);background:var(--surface-2);color:var(--text)}
    .field::placeholder{color:var(--text-muted)}
    .btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;padding:.65rem 1rem;border-radius:12px;font-weight:600;font-size:.875rem;border:1px solid transparent;transition:transform .12s,background-color .15s,border-color .15s}
    .btn:active{transform:translateY(1px)}
    .btn-primary{background:var(--primary);color:var(--on-primary)}
    .btn-primary:hover{background:var(--primary-hover)}
    .btn-ghost{background:var(--surface);border-color:var(--border);color:var(--text)}
    .btn-ghost:hover{background:var(--surface-2)}
    .btn-dark{background:var(--text);color:var(--bg)}
    .btn-danger{background:var(--danger);color:#fff}
    .btn-success{background:var(--success);color:#fff}
    .dark .btn-danger{color:#2A0F0D}
    .pill{display:inline-flex;align-items:center;gap:.35rem;border-radius:999px;padding:.3rem .7rem;font-size:.72rem;font-weight:700;letter-spacing:.02em;white-space:nowrap}
    .pill-pending{background:var(--info-soft);color:var(--info)}
    .pill-preparing{background:var(--primary-soft);color:var(--primary)}
    .pill-ready{background:var(--success-soft);color:var(--success)}
    .pill-completed{background:var(--surface-2);color:var(--text-muted)}
    .pill-paid{background:var(--success-soft);color:var(--success)}
    .pill-unpaid{background:var(--warn-soft);color:var(--warn)}
    .pill-live{background:var(--success-soft);color:var(--success)}
    .pill-live::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor;animation:pulse 1.6s ease-in-out infinite}
    .pill-new{background:var(--warn-soft);color:var(--warn)}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
    .table-tag{display:inline-flex;align-items:center;gap:.35rem;border-radius:8px;padding:.25rem .55rem;font-size:.72rem;font-weight:700;background:var(--warn-soft);color:var(--warn);white-space:nowrap}
    .sidebar{background:var(--sidebar-bg);color:var(--sidebar-text)}
    .nav-btn{display:flex;align-items:center;gap:.75rem;width:100%;padding:.62rem .8rem;border-radius:12px;font-size:.9rem;font-weight:500;color:var(--sidebar-muted);text-align:left;transition:.15s}
    .nav-btn:hover{background:rgba(255,255,255,.08);color:var(--sidebar-text)}
    .nav-btn.active{background:var(--primary);color:var(--on-primary);font-weight:600}
    .nav-badge{margin-left:auto;padding:.1rem .45rem;border-radius:999px;font-size:.65rem;font-weight:700;background:var(--primary);color:var(--on-primary)}
    .nav-btn.active .nav-badge{background:rgba(255,255,255,.25);color:#fff}
    .lock-badge{display:inline-flex;align-items:center;gap:.3rem;padding:.15rem .45rem;border-radius:6px;font-size:.65rem;font-weight:700;background:rgba(232,132,92,.2);color:#E8845C;margin-left:auto}
    .mob-btn{display:flex;flex-direction:column;align-items:center;gap:.15rem;padding:.4rem .6rem;border-radius:12px;font-size:.65rem;font-weight:600;color:var(--text-muted);transition:.15s}
    .mob-btn.active{color:var(--primary);background:var(--primary-soft)}
    .art{position:relative;overflow:hidden}
    .art::after{content:"";position:absolute;inset:0;background:radial-gradient(120% 90% at 20% 10%,rgba(255,255,255,.35),transparent 55%);pointer-events:none}
    .art-main{background:linear-gradient(140deg,#F7D9B6 0%,#E08A4E 55%,#A9502A 100%)}
    .art-appetizer{background:linear-gradient(140deg,#DBE9C5 0%,#7FA65C 55%,#3F6B4A 100%)}
    .art-dessert{background:linear-gradient(140deg,#F8DCE8 0%,#D67BA8 55%,#8C3A6B 100%)}
    .art-drink{background:linear-gradient(140deg,#F4E3B2 0%,#D6A94A 55%,#8C6A22 100%)}
    .toggle{width:46px;height:26px;border-radius:999px;background:var(--border);position:relative;transition:.2s;flex:none}
    .toggle span{position:absolute;top:4px;left:4px;width:18px;height:18px;border-radius:50%;background:#fff;transition:.2s;box-shadow:0 1px 3px rgba(0,0,0,.25)}
    .toggle.on{background:var(--success)}
    .toggle.on span{left:24px}
    .step{position:relative;padding-left:2rem;padding-bottom:1.15rem}
    .step::before{content:"";position:absolute;left:.42rem;top:1.15rem;bottom:0;border-left:2px solid var(--border)}
    .step:last-child::before{display:none}
    .dot{position:absolute;left:0;top:.15rem;width:16px;height:16px;border-radius:50%;background:var(--border);border:3px solid var(--surface)}
    .step.done .dot,.step.current .dot{background:var(--primary)}
    .step.current{color:var(--primary);font-weight:700}
    .drawer{position:fixed;z-index:60;top:0;right:0;height:100%;width:min(440px,100%);background:var(--surface);box-shadow:var(--shadow-lg);transform:translateX(105%);transition:transform .28s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column}
    .drawer.show{transform:translateX(0)}
    .backdrop{position:fixed;inset:0;z-index:55;background:rgba(20,17,12,.5);display:none;align-items:center;justify-content:center;padding:1rem;backdrop-filter:blur(2px)}
    .backdrop.show{display:flex}
    .modal{width:min(680px,100%);max-height:90vh;overflow:auto;background:var(--surface);border:1px solid var(--border);border-radius:24px;box-shadow:var(--shadow-lg);animation:pop .22s cubic-bezier(.4,0,.2,1) both}
    @keyframes pop{from{opacity:0;transform:translateY(14px) scale(.98)}to{opacity:1;transform:none}}
    .photo-dropzone{border:2px dashed var(--border);border-radius:18px;transition:all .18s;cursor:pointer}
    .photo-dropzone:hover,.photo-dropzone.dragover{border-color:var(--primary);background:var(--surface-2)}
    .toast{position:fixed;right:1rem;bottom:1rem;z-index:90;max-width:360px;padding:.9rem 1.05rem;border-radius:14px;font-size:.875rem;font-weight:600;background:var(--text);color:var(--bg);box-shadow:var(--shadow-lg);transform:translateY(160%);transition:transform .3s cubic-bezier(.4,0,.2,1);line-height:1.4}
    .toast.show{transform:translateY(0)}
    .toast.alert{background:var(--success);color:#fff;font-weight:700}
    .toast.info{background:var(--info);color:#fff;font-weight:700}
    .screen-enter{animation:enter .28s ease both}
    @keyframes enter{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
    .fab{position:fixed;right:1rem;bottom:5.5rem;z-index:40;display:flex;align-items:center;gap:.5rem;padding:.85rem 1.1rem;border-radius:999px;font-weight:700;background:var(--primary);color:var(--on-primary);box-shadow:var(--shadow-lg);transition:transform .15s}
    .fab:hover{transform:translateY(-2px)}
    @media (min-width:768px){ .fab{bottom:1.5rem;right:1.5rem} }
    pre.code{background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:1rem;font-size:.72rem;line-height:1.55;overflow:auto;max-height:280px;font-family:ui-monospace,Menlo,monospace;color:var(--text-muted);white-space:pre}
    details>summary{cursor:pointer;list-style:none}
    details>summary::-webkit-details-marker{display:none}
    .ready-banner{display:flex;align-items:center;gap:.75rem;padding:.8rem 1rem;border-radius:14px;background:linear-gradient(95deg,var(--success),#2f8a63);color:#fff;font-weight:700;font-size:.9rem;margin-bottom:1rem;box-shadow:0 8px 20px rgba(37,112,79,.25);animation:slideDown .35s ease both}
    .ready-banner .pulse-dot{width:10px;height:10px;border-radius:50%;background:#fff;animation:pulse 1.3s ease-in-out infinite}
    @keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:none}}
    .progress-bar{height:6px;border-radius:999px;background:var(--surface-2);overflow:hidden}
    .progress-bar > div{height:100%;background:var(--success);transition:width .3s ease}
    .item-row{display:flex;align-items:center;gap:.6rem;padding:.55rem .7rem;border-radius:10px;background:var(--surface-2);border:1px solid transparent;transition:background-color .15s,border-color .15s}
    .item-row.is-ready{background:var(--success-soft);border-color:var(--success);opacity:.92}
    .item-row.is-ready .item-name{color:var(--success);font-weight:700}
    .item-row.is-ready .item-check{background:var(--success);border-color:var(--success);color:#fff}
    .item-row.is-served{background:var(--success-soft);border-color:var(--success);opacity:.85}
    .item-row.is-served .item-name{text-decoration:line-through;color:var(--success);font-weight:700}
    .item-row.is-served .item-check{background:var(--success);border-color:var(--success);color:#fff}
    .item-check{width:1.2rem;height:1.2rem;border-radius:50%;border:2px solid var(--border);display:flex;align-items:center;justify-content:center;flex:none;background:var(--surface)}
    .item-row.is-cooking .item-check{border-color:var(--primary)}
    @keyframes spin{to{transform:rotate(360deg)}}
    .spinning{animation:spin 1s linear infinite}
    .live-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--success);margin-right:.35rem;animation:pulse 1.3s ease-in-out infinite}
    .live-dot.offline{background:var(--danger);animation:none}
    .live-dot.local{background:var(--warn);animation:none}
    @media (prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}
    @media (max-width:767px){
      .drawer{top:auto;bottom:0;height:min(85vh,720px);width:100%;border-radius:24px 24px 0 0;transform:translateY(105%)}
      .drawer.show{transform:translateY(0)}
    }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  const ADMIN_PASSWORD = 'ADMIN';
  const POLL_VISIBLE_MS = 4000;
  const POLL_HIDDEN_MS  = 15000;

  const FLOW = ['PENDING', 'PREPARING', 'READY', 'COMPLETED'];
  const KITCHEN_ACTION = { PENDING: ['Accept order', 'PREPARING'] };
  const CATEGORIES = ['All', 'Appetizer', 'Main Dish', 'Dessert', 'Drinks'];

  const SEED_ACCOUNTS = [
    { id: 'acc-admin',      name: 'Owner',         username: 'admin',      password: 'admin',      role: 'Admin',      status: 'Active' },
    { id: 'acc-semi-admin', name: 'Floor Manager', username: 'manager',    password: 'manager',    role: 'Semi Admin', status: 'Active' },
    { id: 'acc-waiter',     name: 'Waiter',        username: 'waiter',     password: 'waiter',     role: 'Waiter',     status: 'Active' },
    { id: 'acc-kitchen',    name: 'Kitchen',       username: 'kitchen',    password: 'kitchen',    role: 'Kitchen',    status: 'Active' },
    { id: 'acc-cashier',    name: 'Cashier',       username: 'cashier',    password: 'cashier',    role: 'Cashier',    status: 'Active' }
  ];

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

  const ROLE_META = {
    waiter:     { icon:'concierge-bell',     label:'Waiter',     color:'#E2B75C', bg:'rgba(226,183,92,.16)' },
    kitchen:    { icon:'chef-hat',           label:'Kitchen',    color:'#5FC194', bg:'rgba(95,193,148,.16)' },
    cashier:    { icon:'receipt',            label:'Cashier',    color:'#82AEEA', bg:'rgba(130,174,234,.16)' },
    semi_admin: { icon:'sliders-horizontal', label:'Semi Admin', color:'#A78BFA', bg:'rgba(167,139,250,.16)' },
    admin:      { icon:'shield-check',       label:'Admin',      color:'#E8845C', bg:'rgba(232,132,92,.16)' }
  };

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

  function setHtml(el, html){ if(!el) return; el.innerHTML = html; if(window.lucide) lucide.createIcons(); }
  function icon(name, cls = 'w-5 h-5'){ return `<i data-lucide="${name}" class="${cls}"></i>`; }
  function fmtTime(ts){ const d = new Date(ts); return isNaN(d) ? '—' : d.toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' }); }
  function fmtDateTime(ts){ const d = new Date(ts); return isNaN(d) ? '—' : d.toLocaleString('en-PH', { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' }); }
  function peso(n){ const num = Number(n) || 0; return '₱' + num.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 }); }
  function pretty(s){ return ({ PENDING:'Pending', PREPARING:'Cooking', READY:'Ready to serve', COMPLETED:'Served' })[s] || s; }
  function statusPill(s){ return `<span class="pill pill-${String(s).toLowerCase()}">${pretty(s)}</span>`; }
  function paymentPill(o){
    if(o.payment === 'PAID') return '<span class="pill pill-paid">Paid</span>';
    if(o.status === 'COMPLETED') return '<span class="pill pill-unpaid">Unpaid</span>';
    return '';
  }
  function orderTotal(o){
    if(typeof o.total === 'number' && !isNaN(o.total)) return o.total;
    return (o.items || []).reduce((s, i) => s + ((Number(i.price) || 0) * (Number(i.qty) || 0)), 0);
  }
  function hasMeta(o){ return !!(String(o.table || '').trim() || String(o.customer || '').trim()); }
  function orderMetaText(o){
    const bits = [];
    const t = String(o.table || '').trim(); const c = String(o.customer || '').trim();
    if(t) bits.push('Table ' + t);
    if(c) bits.push(c);
    return bits.join(' · ');
  }
  function tableTag(o){ if(!hasMeta(o)) return ''; return `<span class="table-tag">${icon('map-pin','w-3 h-3')} ${esc(orderMetaText(o))}</span>`; }
  function tableLine(o){ if(!hasMeta(o)) return ''; return `<p class="text-xs mt-1 font-semibold" style="color:var(--warn)">${icon('map-pin','w-3 h-3 inline -mt-0.5 mr-1')}${esc(orderMetaText(o))}</p>`; }
  function itemCount(o){ return (o.items || []).length; }
  function servedCount(o){ return (o.items || []).filter(i => i && i.served).length; }
  function readyCount(o){ return (o.items || []).filter(i => i && i.ready).length; }
  function unreadyCount(o){ return itemCount(o) - readyCount(o); }
  function readyUnservedCount(o){ return (o.items || []).filter(i => i && i.ready && !i.served).length; }
  function allServed(o){ const its = o.items || []; return its.length > 0 && its.every(i => i && i.served); }
  function itemSummary(o){ return (o.items || []).map(i => `${i.qty} × ${i.name}`).join(' · '); }
  function allNotes(o){ const out = []; (o.items || []).forEach(i => { if(i.note) out.push(i.note); }); return out; }

  function progressBar(o, label, count, total, color){
    const pct = total === 0 ? 0 : Math.round((count / total) * 100);
    return `<div class="mt-3"><div class="flex justify-between text-xs mb-1"><span class="text-muted">${label}</span><strong style="color:${color}">${pct}%</strong></div><div class="progress-bar"><div style="width:${pct}%;background:${color}"></div></div></div>`;
  }
  function kitchenProgress(o){ const t = itemCount(o); const r = readyCount(o); return progressBar(o, `${r} of ${t} item${t===1?'':'s'} ready`, r, t, r === t ? 'var(--success)' : 'var(--primary)'); }
  function servedProgress(o){ const t = itemCount(o); const s = servedCount(o); return progressBar(o, `${s} of ${t} item${t===1?'':'s'} served`, s, t, 'var(--success)'); }

  function emptyState(iconName, title, copy){
    return `<div class="card soft p-12 text-center"><div class="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center" style="background:var(--surface-2);color:var(--text-muted)">${icon(iconName,'w-6 h-6')}</div><h3 class="font-bold mt-4">${title}</h3><p class="text-sm text-muted mt-1">${copy}</p></div>`;
  }
  function artClass(cat){
    if(cat === 'Drinks') return 'art-drink';
    if(cat === 'Appetizer') return 'art-appetizer';
    if(cat === 'Dessert') return 'art-dessert';
    return 'art-main';
  }
  function menuHero(item, heightClass, emojiSize = 'text-6xl'){
    if(item.image) return `<div class="${heightClass} relative overflow-hidden"><img src="${esc(item.image)}" alt="${esc(item.name)}" class="absolute inset-0 w-full h-full object-cover"></div>`;
    return `<div class="art ${artClass(item.category)} ${heightClass} flex items-center justify-center ${emojiSize}">${item.emoji || '🍽️'}</div>`;
  }
  function normalizeMenuItem(m){
    return {
      id: m.id || uid(), name: String(m.name || ''), category: String(m.category || 'Main Dish'),
      description: String(m.description || ''), ingredients: String(m.ingredients || ''),
      price: Number(m.price) || 0, emoji: String(m.emoji || ''), image: String(m.image || ''),
      available: (m.available === true || String(m.available).toLowerCase() === 'true' || m.available === 1 || String(m.available) === '1')
    };
  }
  function cloneSeedMenu(){ return SEED_MENU.map(m => ({ ...m })); }

  function processImageFile(file, maxDimension = 520, maxChars = 42000){
    return new Promise((resolve, reject) => {
      if(!file || !(file instanceof Blob) || (file.type && !file.type.startsWith('image/'))){
        return reject(new Error('Please select an image file (JPG, PNG, WebP).'));
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Failed to load image.'));
        img.onload = () => {
          try {
            let w = img.width;
            let h = img.height;
            if(w > h){
              if(w > maxDimension){
                h = Math.round((h * maxDimension) / w);
                w = maxDimension;
              }
            } else {
              if(h > maxDimension){
                w = Math.round((w * maxDimension) / h);
                h = maxDimension;
              }
            }
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, w);
            canvas.height = Math.max(1, h);
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            let dataUrl = canvas.toDataURL('image/jpeg', 0.78);
            if(dataUrl.length > maxChars){
              dataUrl = canvas.toDataURL('image/jpeg', 0.62);
            }
            if(dataUrl.length > maxChars){
              const sCanvas = document.createElement('canvas');
              const scale = 360 / Math.max(w, h);
              sCanvas.width = Math.max(1, Math.round(w * scale));
              sCanvas.height = Math.max(1, Math.round(h * scale));
              const sCtx = sCanvas.getContext('2d');
              sCtx.fillStyle = '#FFFFFF';
              sCtx.fillRect(0, 0, sCanvas.width, sCanvas.height);
              sCtx.drawImage(canvas, 0, 0, sCanvas.width, sCanvas.height);
              dataUrl = sCanvas.toDataURL('image/jpeg', 0.58);
            }
            resolve(dataUrl);
          } catch(err){
            reject(err);
          }
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function safeGet(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }
  function safeSet(k,v){ try { localStorage.setItem(k,v); } catch(e){} }
  function cleanUrl(u){
    if(!u) return '';
    return String(u).trim().replace(/\/+$/, '');
  }

  function resolveApiUrl(){
    try {
      const url = new URL(window.location.href);
      const fromUrl = url.searchParams.get('api');
      if(fromUrl){
        const cleaned = cleanUrl(fromUrl);
        safeSet('savor.api', cleaned);
        return cleaned;
      }
    } catch(e){}
    const saved = cleanUrl(safeGet('savor.api') || '');
    if(saved) return saved;
    // Auto-detect /api/pos when running on Vercel or any web server
    if(typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http')){
      return window.location.origin + '/api/pos';
    }
    return '';
  }
  const CONFIG = { API_URL: resolveApiUrl(), POLL_MS: POLL_VISIBLE_MS };

  /* ===== Cross-tab & Multi-window Real-time Broadcast ===== */
  let liveBus = null;
  try {
    liveBus = new BroadcastChannel('savor_live_bus');
    liveBus.onmessage = function(e){
      const msg = e.data;
      if(!msg) return;
      if(msg.type === 'API_URL_CHANGED'){
        CONFIG.API_URL = cleanUrl(msg.url || '');
        safeSet('savor.api', CONFIG.API_URL);
        setNet(CONFIG.API_URL ? 'sheets' : 'local');
        refreshNow(true);
      } else if(msg.type === 'DATA_CHANGED'){
        if(API.enabled){
          refreshNow(true);
        } else {
          const local = Local.read();
          if(local){
            const beforeStatuses = new Map(state.orders.map(o => [o.id, o.status]));
            const beforeReadyUnserved = new Map(state.orders.map(o => [o.id, readyUnservedCount(o)]));
            Data.apply(local);
            if(window.Savor.onDataChanged) window.Savor.onDataChanged({ beforeStatuses, beforeReadyUnserved });
            if(window.Savor.onRender) window.Savor.onRender();
            if(window.Savor._renderNav) window.Savor._renderNav();
          }
        }
      }
    };
  } catch(e){}

  function broadcast(msg){
    try { if(liveBus) liveBus.postMessage(msg); } catch(e){}
    try { window.dispatchEvent(new CustomEvent('savor:bus', { detail: msg })); } catch(e){}
  }

  window.addEventListener('storage', e => {
    if(e.key === 'savor.api'){
      CONFIG.API_URL = cleanUrl(e.newValue || '');
      setNet(CONFIG.API_URL ? 'sheets' : 'local');
      refreshNow(true);
    } else if(e.key === Local.key && !API.enabled){
      const local = Local.read();
      if(local){
        const beforeStatuses = new Map(state.orders.map(o => [o.id, o.status]));
        const beforeReadyUnserved = new Map(state.orders.map(o => [o.id, readyUnservedCount(o)]));
        Data.apply(local);
        if(window.Savor.onDataChanged) window.Savor.onDataChanged({ beforeStatuses, beforeReadyUnserved });
        if(window.Savor.onRender) window.Savor.onRender();
        if(window.Savor._renderNav) window.Savor._renderNav();
      }
    }
  });

  function isAdminUnlocked(){
    try {
      return sessionStorage.getItem('savor.admin.unlocked') === '1' || localStorage.getItem('savor.admin.unlocked') === '1';
    } catch(e){ return false; }
  }
  function setAdminUnlocked(v){
    try {
      if(v){
        sessionStorage.setItem('savor.admin.unlocked','1');
        localStorage.setItem('savor.admin.unlocked','1');
      } else {
        sessionStorage.removeItem('savor.admin.unlocked');
        localStorage.removeItem('savor.admin.unlocked');
      }
    } catch(e){}
  }

  function getSession(){
    try {
      const raw = sessionStorage.getItem('savor.session') || localStorage.getItem('savor.session');
      return raw ? JSON.parse(raw) : null;
    } catch(e){ return null; }
  }
  function setSession(session){
    try {
      const str = JSON.stringify(session);
      sessionStorage.setItem('savor.session', str);
      localStorage.setItem('savor.session', str);
    } catch(e){}
  }
  function clearSession(){
    try {
      sessionStorage.removeItem('savor.session');
      localStorage.removeItem('savor.session');
    } catch(e){}
  }

  function requireRole(role){
    const s = getSession();
    const norm = str => String(str || '').toLowerCase().replace(/[\s_-]+/g, '');
    const targetNorm = norm(role);
    const apiParam = CONFIG.API_URL ? ('?api=' + encodeURIComponent(CONFIG.API_URL)) : '';

    if(targetNorm === 'admin'){
      if(isAdminUnlocked() || (s && norm(s.role) === 'admin')){
        return s || { id: 'admin', name: 'Owner', username: 'admin', role: 'Admin' };
      }
      window.location.href = 'index.html' + apiParam;
      return null;
    }

    if(!s){
      window.location.href = 'index.html' + apiParam;
      return null;
    }

    const userRole = norm(s.role);
    // Admin has access to all roles
    if(userRole === 'admin'){
      return s;
    }

    // Semi Admin matching
    if((targetNorm === 'semiadmin' || targetNorm === 'manager') && (userRole === 'semiadmin' || userRole === 'manager')){
      return s;
    }

    // Exact role matching
    if(userRole === targetNorm){
      return s;
    }

    // Role mismatch
    window.location.href = 'index.html' + apiParam;
    return null;
  }

  function logout(){
    clearSession();
    setAdminUnlocked(false);
    const apiParam = CONFIG.API_URL ? '?api=' + encodeURIComponent(CONFIG.API_URL) : '';
    window.location.href = 'index.html' + apiParam;
  }
  function currentUser(){ return window.Savor.session || getSession(); }

  const Local = {
    key: 'savor.db.v20',
    read(){ try { const raw = localStorage.getItem(this.key); return raw ? JSON.parse(raw) : null; } catch(e){ return null; } },
    write(db){ try { localStorage.setItem(this.key, JSON.stringify(db)); } catch(e){} },
    blank(){ const db = { orders: [], accounts: SEED_ACCOUNTS.map(a => ({ ...a })), menu: cloneSeedMenu() }; this.write(db); return db; }
  };

  const state = {
    dark: safeGet('savor.dark') === '1',
    sound: safeGet('savor.sound') !== '0',
    net: 'local',
    menu: cloneSeedMenu(), orders: [], accounts: [],
    lastSync: null, syncing: false
  };

  const API = {
    get enabled(){ return !!(CONFIG.API_URL && CONFIG.API_URL.trim()); },
    async call(action, payload){
      if(!this.enabled) throw new Error('No API URL configured');
      const url = cleanUrl(CONFIG.API_URL);
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 20000); // 20s timeout
      try {
        const isAppsScript = url.includes('script.google.com');
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': isAppsScript ? 'text/plain;charset=utf-8' : 'application/json' },
          body: JSON.stringify({ action: action, payload: payload || {} }),
          redirect: 'follow',
          signal: ctrl.signal
        });
        clearTimeout(tid);
        const text = await res.text();
        let json;
        try {
          json = JSON.parse(text);
        } catch(e) {
          if (text.includes('accounts.google.com') || text.includes('ServiceLogin')) {
            throw new Error('Google Sheet permission error: Web App must be deployed with "Who has access: Anyone" (currently requires Google account sign-in)');
          }
          if (text.includes('script.google.com/macros/error')) {
            throw new Error('Google Apps Script error: Check script authorization in Google Sheets');
          }
          throw new Error('Invalid response from API endpoint (' + url + ')');
        }
        if(!json.ok) throw new Error(json.error || 'Database API error');
        return json.data;
      } catch(err) {
        clearTimeout(tid);
        if(err.name === 'AbortError') {
          throw new Error('Connection timed out (20s) connecting to database. Check your network.');
        }
        throw err;
      }
    }
  };

  const Data = {
    apply(db){
      let menuSource = null;
      if(API.enabled && Array.isArray(db.menu) && db.menu.length > 0) menuSource = db.menu;
      else if(!API.enabled){ const local = Local.read(); if(local && Array.isArray(local.menu) && local.menu.length > 0) menuSource = local.menu; }
      state.menu = (menuSource || cloneSeedMenu()).map(normalizeMenuItem);

      state.orders = (db.orders || []).map(o => {
        let items = o.items;
        if(typeof items === 'string'){ try { items = JSON.parse(items); } catch(e){ items = []; } }
        if(!Array.isArray(items)) items = [];
        const orderStatus = String(o.status || 'PENDING');
        items = items.map(it => {
          const wasReady = !!it.ready || orderStatus === 'READY' || orderStatus === 'COMPLETED';
          const wasServed = !!it.served || orderStatus === 'COMPLETED';
          return {
            name: it.name || '', qty: Number(it.qty) || 1, note: it.note || '',
            price: Number(it.price) || 0,
            ready: wasReady, readyAt: it.readyAt || null,
            served: wasServed, servedAt: it.servedAt || null
          };
        });
        return {
          ...o, items,
          payment: o.payment || 'UNPAID',
          total: (o.total === '' || o.total == null) ? null : Number(o.total),
          paidAt: o.paidAt || '',
          table: String(o.table || ''), customer: String(o.customer || '')
        };
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const accountsSource = (Array.isArray(db.accounts) && db.accounts.length > 0) ? db.accounts : SEED_ACCOUNTS;
      state.accounts = accountsSource.map(a => ({
        id: a.id || uid(),
        name: String(a.name || ''),
        username: String(a.username || ''),
        password: String(a.password || ''),
        role: String(a.role || 'Waiter'),
        status: String(a.status || 'Active')
      }));

      this.persist();
    },
    persist(){ Local.write({ orders: state.orders, accounts: state.accounts, menu: state.menu }); },

    async fetchBootstrap(){
      const db = await API.call('bootstrap');
      if((!db.menu || db.menu.length === 0) && SEED_MENU.length > 0){
        try { await API.call('seedMenu', { items: SEED_MENU }); db.menu = SEED_MENU.map(m => ({ ...m })); }
        catch(e){ console.warn('[Savor] seedMenu failed:', e.message); }
      }
      return db;
    },

    async bootstrap(){
      if(API.enabled){
        try {
          const db = await this.fetchBootstrap();
          this.apply(db); setNet('sheets'); state.lastSync = Date.now(); return;
        } catch(err){ console.warn('[Savor] Cloud database unavailable:', err.message); setNet('offline'); }
      } else setNet('local');
      this.apply(Local.read() || Local.blank());
    },

    async authenticate(username, password){
      const u = String(username || '').trim();
      const p = String(password || '').trim();
      if(!u || !p) throw new Error('Username and password are required');

      if(API.enabled && state.net !== 'offline'){
        try {
          return await API.call('authenticate', { username: u, password: p });
        } catch(apiErr){
          const msg = apiErr.message || '';
          if(msg.includes('Invalid username or password') || msg.includes('Account is inactive')){
            throw apiErr;
          }
          console.warn('[Savor] Remote auth failed, falling back to local credentials:', msg);
          setNet('offline');
        }
      }
      const accounts = (state.accounts && state.accounts.length > 0) ? state.accounts : SEED_ACCOUNTS;
      const found = accounts.find(a =>
        String(a.username || '').toLowerCase() === u.toLowerCase() &&
        String(a.password) === p
      );
      if(!found) throw new Error('Invalid username or password');
      if(String(found.status || 'Active').toLowerCase() === 'inactive') throw new Error('Account is inactive');
      return { id: found.id, name: found.name, username: found.username, role: found.role };
    },

    async createOrder({ items, staff, total, table, customer }){
      if(API.enabled){
        try {
          const order = await API.call('createOrder', { items, staff, total, table, customer });
          if(typeof order.items === 'string'){ try { order.items = JSON.parse(order.items); } catch(e){ order.items = []; } }
          order.payment = order.payment || 'UNPAID';
          order.total = Number(order.total) || 0;
          order.table = String(order.table || ''); order.customer = String(order.customer || '');
          const existingIdx = state.orders.findIndex(o => o.id === order.id);
          if(existingIdx >= 0) state.orders[existingIdx] = order;
          else state.orders.unshift(order);
          this.persist(); setNet('sheets'); state.lastSync = Date.now();
          broadcast({ type: 'DATA_CHANGED' });
          return order;
        } catch(err){
          console.warn('[Savor] createOrder API failed, saving locally:', err.message);
          setNet('offline');
        }
      }
      const max = state.orders.reduce((m,o) => {
        const n = parseInt(String(o.code).replace(/[^0-9]/g,''), 10);
        return isNaN(n) ? m : Math.max(m, n);
      }, 1000);
      const normalizedItems = (items || []).map(it => ({
        name: it.name, qty: Number(it.qty) || 1, note: it.note || '', price: Number(it.price) || 0,
        ready: false, readyAt: null, served: false, servedAt: null
      }));
      const order = {
        id: uid(), code: '#' + (max + 1), status: 'PENDING', items: normalizedItems,
        createdAt: Date.now(), updatedAt: Date.now(),
        staff: staff || '', total: Number(total) || 0, payment: 'UNPAID', paidAt: '',
        table: String(table || ''), customer: String(customer || '')
      };
      state.orders.unshift(order); this.persist();
      broadcast({ type: 'DATA_CHANGED' });
      return order;
    },

    async setStatus(id, status, staff){
      const order = state.orders.find(o => o.id === id); if(!order) return;
      order.status = status; order.updatedAt = Date.now();
      if(staff) order.staff = staff;
      this.persist();
      broadcast({ type: 'DATA_CHANGED' });
      if(API.enabled){
        try { await API.call('updateOrderStatus', { id, status, staff }); setNet('sheets'); state.lastSync = Date.now(); }
        catch(err){ console.warn('[Savor] updateOrderStatus failed:', err.message); setNet('offline'); }
      }
    },

    async markItemReady(orderId, itemIndex){
      const order = state.orders.find(o => o.id === orderId); if(!order) return;
      const item = order.items[itemIndex]; if(!item || item.ready) return;
      item.ready = true; item.readyAt = Date.now();
      order.updatedAt = Date.now(); order.staff = 'Kitchen';
      if((order.status === 'PREPARING' || order.status === 'PENDING') && (order.items || []).some(it => it.ready)) order.status = 'READY';
      this.persist();
      broadcast({ type: 'DATA_CHANGED' });
      if(API.enabled){
        try { const u = await API.call('markItemReady', { orderId, itemIndex, staff: 'Kitchen' }); setNet('sheets'); state.lastSync = Date.now(); return u; }
        catch(err){ console.warn('[Savor] markItemReady failed:', err.message); setNet('offline'); }
      }
      return order;
    },

    async serveItem(orderId, itemIndex){
      const order = state.orders.find(o => o.id === orderId); if(!order) return;
      const item = order.items[itemIndex]; if(!item || item.served) return;
      if(!item.ready){ toast('Item is still cooking'); return; }
      item.served = true; item.servedAt = Date.now();
      order.updatedAt = Date.now(); order.staff = 'Waiter';
      if(allServed(order)) order.status = 'COMPLETED';
      this.persist();
      broadcast({ type: 'DATA_CHANGED' });
      if(API.enabled){
        try { const u = await API.call('serveItem', { orderId, itemIndex, staff: 'Waiter' }); setNet('sheets'); state.lastSync = Date.now(); return u; }
        catch(err){ console.warn('[Savor] serveItem failed:', err.message); setNet('offline'); }
      }
      return order;
    },

    async markPaid(id){
      const order = state.orders.find(o => o.id === id); if(!order) return;
      order.payment = 'PAID'; order.paidAt = Date.now(); order.updatedAt = Date.now();
      this.persist();
      broadcast({ type: 'DATA_CHANGED' });
      if(API.enabled){
        try { await API.call('markOrderPaid', { id }); setNet('sheets'); state.lastSync = Date.now(); }
        catch(err){ console.warn('[Savor] markOrderPaid failed:', err.message); setNet('offline'); }
      }
    },

    async saveAccount(account){
      const idx = state.accounts.findIndex(a => a.id === account.id);
      if(idx >= 0) state.accounts[idx] = account; else state.accounts.push(account);
      this.persist();
      broadcast({ type: 'DATA_CHANGED' });
      if(API.enabled){
        try { await API.call('saveAccount', { account }); setNet('sheets'); } catch(e){ setNet('offline'); throw e; }
      }
    },
    async deleteAccount(id){
      state.accounts = state.accounts.filter(a => a.id !== id);
      this.persist();
      broadcast({ type: 'DATA_CHANGED' });
      if(API.enabled){
        try { await API.call('deleteAccount', { id }); setNet('sheets'); } catch(e){ setNet('offline'); }
      }
    },
    async saveMenuItem(item){
      const idx = state.menu.findIndex(m => m.id === item.id);
      const normalized = normalizeMenuItem(item);
      if(idx >= 0) state.menu[idx] = normalized; else state.menu.push(normalized);
      this.persist();
      broadcast({ type: 'DATA_CHANGED' });
      if(API.enabled){
        try { await API.call('saveMenuItem', { item: normalized }); setNet('sheets'); } catch(e){ setNet('offline'); }
      }
      return normalized;
    },
    async deleteMenuItem(id){
      state.menu = state.menu.filter(m => m.id !== id);
      this.persist();
      broadcast({ type: 'DATA_CHANGED' });
      if(API.enabled){
        try { await API.call('deleteMenuItem', { id }); setNet('sheets'); } catch(e){ setNet('offline'); }
      }
    },

    async refresh(){
      if(!API.enabled) return;
      try {
        const db = await this.fetchBootstrap();
        this.apply(db);
        state.lastSync = Date.now();
        setNet('sheets');
      } catch(err){
        setNet('offline');
      }
    }
  };

  let toastTimer;
  function toast(msg, duration = 3200, extraClass = ''){
    const el = $('#toast'); if(!el) return;
    el.textContent = msg;
    el.className = 'toast show' + (extraClass ? ' ' + extraClass : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), duration);
  }
  function openModal(html){ setHtml($('#modal-content'), html); $('#modal-backdrop').classList.add('show'); }
  function closeModal(){ $('#modal-backdrop').classList.remove('show'); }
  function closeDrawer(){ $('#drawer').classList.remove('show'); }
  function chime(){
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      if(ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } catch(e){}
  }
  function applyTheme(){ document.documentElement.classList.toggle('dark', state.dark); }
  function toggleTheme(){ state.dark = !state.dark; safeSet('savor.dark', state.dark ? '1' : '0'); applyTheme(); toast(state.dark ? 'Dark mode enabled.' : 'Light mode enabled.'); if(window.Savor.onRender) window.Savor.onRender(); }
  function toggleSound(){ state.sound = !state.sound; safeSet('savor.sound', state.sound ? '1' : '0'); toast(state.sound ? 'Order sound enabled.' : 'Order sound muted.'); if(window.Savor.onRender) window.Savor.onRender(); }

  function setNet(mode){
    state.net = mode;
    const pill = $('#sync-pill'); const text = $('#sync-text');
    const banner = $('#offline-banner'); const lastSync = $('#last-sync-label');
    if(!pill) return;
    const isCloudSql = CONFIG.API_URL && (CONFIG.API_URL.includes('/api/pos') || !CONFIG.API_URL.includes('script.google.com'));
    const liveLabel = isCloudSql ? 'Live · Cloud SQL' : 'Live · Cloud Database';
    const map = {
      sheets:  { cls:'pill-live',      label: liveLabel },
      sql:     { cls:'pill-live',      label:'Live · Cloud SQL' },
      local:   { cls:'pill-new',       label:'Local demo mode' },
      offline: { cls:'pill-preparing', label:'Offline — retrying' }
    };
    const cfg = map[mode] || map.local;
    pill.className = 'hidden sm:inline-flex pill cursor-pointer ' + cfg.cls;
    text.textContent = cfg.label;
    if(banner) banner.classList.toggle('hidden', mode !== 'offline');
    if(lastSync){
      if(state.lastSync){ lastSync.textContent = 'Synced ' + fmtTime(state.lastSync); lastSync.classList.remove('hidden'); }
      else lastSync.classList.add('hidden');
    }
  }

  async function refreshNow(silent){
    if(state.syncing) return;
    state.syncing = true;
    const spinner = $('#refresh-icon'); if(spinner) spinner.classList.add('spinning');
    try {
      await Data.refresh();
      if(window.Savor.onRender) window.Savor.onRender();
      if(window.Savor._renderNav) window.Savor._renderNav();
      if(!silent) toast(state.net === 'sheets' || state.net === 'sql' ? 'Synced with database ✓' : state.net === 'offline' ? 'Still offline — retrying' : 'Refreshed');
    } finally {
      state.syncing = false;
      if(spinner) spinner.classList.remove('spinning');
    }
  }

  let pollTimer = null;
  function computeFingerprint(){
    return state.orders.map(o => o.id + ':' + o.status + ':' + o.payment + ':' + readyCount(o) + ':' + servedCount(o)).join('|');
  }
  async function pollTick(){
    if(!API.enabled || !window.Savor.role){ schedulePoll(); return; }
    const beforeStatuses = new Map(state.orders.map(o => [o.id, o.status]));
    const beforeReadyUnserved = new Map(state.orders.map(o => [o.id, readyUnservedCount(o)]));
    const beforeFp = computeFingerprint();
    await Data.refresh();
    const afterFp = computeFingerprint();
    if(beforeFp !== afterFp){
      if(window.Savor.onDataChanged) window.Savor.onDataChanged({ beforeStatuses, beforeReadyUnserved });
      if(window.Savor.onRender) window.Savor.onRender();
      if(window.Savor._renderNav) window.Savor._renderNav();
    }
    schedulePoll();
  }
  function schedulePoll(){
    clearTimeout(pollTimer);
    const interval = document.hidden ? POLL_HIDDEN_MS : POLL_VISIBLE_MS;
    pollTimer = setTimeout(pollTick, interval);
  }
  function startPolling(){ schedulePoll(); }

  document.addEventListener('visibilitychange', () => {
    if(!document.hidden && API.enabled && window.Savor.role) refreshNow(true);
    schedulePoll();
  });
  document.addEventListener('click', e => { if(e.target.id === 'modal-backdrop') closeModal(); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape'){ closeModal(); closeDrawer(); } });

  const ROLE_NAV = {
    waiter:     [['menu','utensils-crossed','Take order'], ['ready','bell','Ready to serve'], ['orders','clipboard-list','My orders'], ['help','circle-help','Help']],
    kitchen:    [['incoming','inbox','New orders'], ['active','chef-hat','At the pass'], ['history','history','History'], ['settings','settings','Settings']],
    cashier:    [['counter','receipt','Counter'], ['paid','receipt-text','Paid orders'], ['settings','settings','Settings']],
    semi_admin: [['menu','book-open','Menu Editor'], ['orders','clipboard-list','Live Orders']],
    admin:      [['dashboard','layout-dashboard','Dashboard'], ['menu','book-open','Menu'], ['orders','clipboard-list','Orders'], ['accounts','users','Staff'], ['settings','settings','Settings']]
  };

  const APPS_SCRIPT_CODE = '';
  /* Obsolete Google Apps Script backend code removed

var HEADERS = {
  Orders:   ['id', 'code', 'status', 'items', 'createdAt', 'updatedAt', 'staff', 'total', 'payment', 'paidAt', 'table', 'customer'],
  Menu:     ['id', 'name', 'category', 'description', 'ingredients', 'price', 'emoji', 'image', 'available'],
  Accounts: ['id', 'name', 'username', 'password', 'role', 'status']
};

var SEED_MENU = [
  { id:'app-spring-rolls',  name:'Spring Rolls',  category:'Appetizer', description:'Crisp vegetable spring rolls, six pieces with a sweet chili dip.', ingredients:'Cabbage, carrots, glass noodles, wrapper, sweet chili sauce', emoji:'🥟', available:true, price:180, image:'' },
  { id:'app-chicken-wings', name:'Chicken Wings', category:'Appetizer', description:'Sticky glazed wings, tossed in a savoury house sauce.', ingredients:'Chicken wings, soy sauce, garlic, honey, sesame seeds', emoji:'🍗', available:true, price:250, image:'' },
  { id:'main-chicken-rice', name:'Chicken Rice',  category:'Main Dish', description:'Tender grilled chicken over fragrant rice with house sauce.', ingredients:'Jasmine rice, chicken thigh, garlic, cucumber, soy sauce', emoji:'🍗', available:true, price:280, image:'' },
  { id:'main-beef-steak',   name:'Beef Steak',    category:'Main Dish', description:'Sliced beef with pepper glaze and seasonal vegetables.', ingredients:'Beef sirloin, black pepper, butter, seasonal vegetables', emoji:'🥩', available:true, price:420, image:'' },
  { id:'des-halo-halo',     name:'Halo-Halo',     category:'Dessert',   description:'Shaved ice with sweet fruits, beans and leche flan.', ingredients:'Shaved ice, evaporated milk, leche flan, ube, beans', emoji:'🍧', available:true, price:160, image:'' },
  { id:'des-leche-flan',    name:'Leche Flan',    category:'Dessert',   description:'Silky caramel custard, chilled and served in slices.', ingredients:'Egg yolks, condensed milk, evaporated milk, caramel, vanilla', emoji:'🍮', available:true, price:140, image:'' },
  { id:'drk-iced-tea',      name:'Iced Tea',      category:'Drinks',    description:'Fresh brewed tea, served chilled over ice.', ingredients:'Black tea, sugar, lemon, ice', emoji:'🧋', available:true, price:80, image:'' },
  { id:'drk-lemonade',      name:'Lemonade',      category:'Drinks',    description:'Bright house lemonade, freshly squeezed each morning.', ingredients:'Lemons, sugar, water, ice', emoji:'🍋', available:true, price:90, image:'' }
];

var SEED_ACCOUNTS = [
  { id:'acc-admin',   name:'Owner',   username:'admin',   password:'admin',   role:'Admin',   status:'Active' },
  { id:'acc-waiter',  name:'Waiter',  username:'waiter',  password:'waiter',  role:'Waiter',  status:'Active' },
  { id:'acc-kitchen', name:'Kitchen', username:'kitchen', password:'kitchen', role:'Kitchen', status:'Active' },
  { id:'acc-cashier', name:'Cashier', username:'cashier', password:'cashier', role:'Cashier', status:'Active' }
];

function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim().length > 0) {
    return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
  }
  return sheet;
}

function ensureDatabaseInitialized(ss) {
  var ordersSheet = getOrCreateSheet(ss, 'Orders', HEADERS.Orders);
  var menuSheet = getOrCreateSheet(ss, 'Menu', HEADERS.Menu);
  var accountsSheet = getOrCreateSheet(ss, 'Accounts', HEADERS.Accounts);

  if (menuSheet.getLastRow() <= 1) {
    for (var i = 0; i < SEED_MENU.length; i++) {
      var m = SEED_MENU[i];
      menuSheet.appendRow([m.id, m.name, m.category, m.description, m.ingredients, m.price, m.emoji, m.image, m.available]);
    }
  }

  if (accountsSheet.getLastRow() <= 1) {
    for (var j = 0; j < SEED_ACCOUNTS.length; j++) {
      var a = SEED_ACCOUNTS[j];
      accountsSheet.appendRow([a.id, a.name, a.username, a.password, a.role, a.status]);
    }
  }
}

function doGet(e) {
  try {
    var ss = getSpreadsheet();
    ensureDatabaseInitialized(ss);
    var action = (e && e.parameter && e.parameter.action) || 'ping';

    if (action === 'bootstrap') {
      var data = handleAction('bootstrap', {});
      return jsonResponse({ ok: true, data: data });
    }

    return jsonResponse({
      ok: true,
      service: 'Savor & Co. Google Sheets Database',
      status: 'ONLINE',
      sheetTitle: ss.getName(),
      ordersCount: Math.max(0, ss.getSheetByName('Orders').getLastRow() - 1),
      menuCount: Math.max(0, ss.getSheetByName('Menu').getLastRow() - 1),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.toString() });
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  var hasLock = lock.tryLock(30000);
  if (!hasLock) {
    return jsonResponse({ ok: false, error: 'Database busy, please retry in a second.' });
  }

  try {
    var ss = getSpreadsheet();
    ensureDatabaseInitialized(ss);

    var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    var request = JSON.parse(raw);
    var action = request.action;
    var payload = request.payload || {};

    var result = handleAction(action, payload, ss);
    return jsonResponse({ ok: true, data: result });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function handleAction(action, payload, ss) {
  if (!ss) ss = getSpreadsheet();

  switch (action) {
    case 'bootstrap':
      return actionBootstrap(ss);
    case 'seedMenu':
      return actionSeedMenu(ss, payload);
    case 'createOrder':
      return actionCreateOrder(ss, payload);
    case 'updateOrderStatus':
      return actionUpdateOrderStatus(ss, payload);
    case 'markItemReady':
      return actionMarkItemReady(ss, payload);
    case 'serveItem':
      return actionServeItem(ss, payload);
    case 'markOrderPaid':
      return actionMarkOrderPaid(ss, payload);
    case 'saveMenuItem':
      return actionSaveMenuItem(ss, payload);
    case 'deleteMenuItem':
      return actionDeleteMenuItem(ss, payload);
    case 'saveAccount':
      return actionSaveAccount(ss, payload);
    case 'deleteAccount':
      return actionDeleteAccount(ss, payload);
    case 'authenticate':
      return actionAuthenticate(ss, payload);
    case 'reset':
      return actionReset(ss);
    default:
      throw new Error('Unknown action: ' + action);
  }
}

function actionBootstrap(ss) {
  ensureDatabaseInitialized(ss);
  var oSheet = ss.getSheetByName('Orders');
  var oData = oSheet.getDataRange().getValues();
  var orders = [];
  for (var i = 1; i < oData.length; i++) {
    var row = oData[i];
    if (!row[0]) continue;
    var items = [];
    try { items = typeof row[3] === 'string' ? JSON.parse(row[3]) : (row[3] || []); } catch (e) { items = []; }
    orders.push({
      id: String(row[0]),
      code: String(row[1]),
      status: String(row[2] || 'PENDING'),
      items: items,
      createdAt: Number(row[4]) || row[4],
      updatedAt: Number(row[5]) || row[5],
      staff: String(row[6] || ''),
      total: Number(row[7]) || 0,
      payment: String(row[8] || 'UNPAID'),
      paidAt: row[9] ? (Number(row[9]) || row[9]) : '',
      table: String(row[10] || ''),
      customer: String(row[11] || '')
    });
  }
  orders.sort(function(a, b) { return (new Date(b.createdAt)) - (new Date(a.createdAt)); });

  var mSheet = ss.getSheetByName('Menu');
  var mData = mSheet.getDataRange().getValues();
  var menu = [];
  for (var j = 1; j < mData.length; j++) {
    var mRow = mData[j];
    if (!mRow[0] || !mRow[1]) continue;
    menu.push({
      id: String(mRow[0]),
      name: String(mRow[1]),
      category: String(mRow[2] || 'Main Dish'),
      description: String(mRow[3] || ''),
      ingredients: String(mRow[4] || ''),
      price: Number(mRow[5]) || 0,
      emoji: String(mRow[6] || ''),
      image: String(mRow[7] || ''),
      available: (mRow[8] === true || String(mRow[8]).toLowerCase() === 'true' || mRow[8] === 1)
    });
  }

  var aSheet = ss.getSheetByName('Accounts');
  var aData = aSheet.getDataRange().getValues();
  var accounts = [];
  for (var k = 1; k < aData.length; k++) {
    var aRow = aData[k];
    if (!aRow[0] || !aRow[1]) continue;
    accounts.push({
      id: String(aRow[0]),
      name: String(aRow[1]),
      username: String(aRow[2] || ''),
      password: String(aRow[3] || ''),
      role: String(aRow[4] || 'Waiter'),
      status: String(aRow[5] || 'Active')
    });
  }

  return { orders: orders, menu: menu, accounts: accounts };
}

function actionSeedMenu(ss, payload) {
  var sheet = getOrCreateSheet(ss, 'Menu', HEADERS.Menu);
  var items = payload.items || SEED_MENU;
  if (sheet.getLastRow() <= 1) {
    for (var i = 0; i < items.length; i++) {
      var m = items[i];
      sheet.appendRow([m.id, m.name, m.category, m.description, m.ingredients, m.price, m.emoji, m.image, m.available]);
    }
  }
  return items;
}

function actionCreateOrder(ss, payload) {
  var sheet = getOrCreateSheet(ss, 'Orders', HEADERS.Orders);
  var data = sheet.getDataRange().getValues();

  var maxCodeNum = 1000;
  for (var i = 1; i < data.length; i++) {
    var rawCode = String(data[i][1] || '');
    var num = parseInt(rawCode.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(num) && num > maxCodeNum) maxCodeNum = num;
  }
  var newCode = '#' + (maxCodeNum + 1);
  var id = 'ord_' + Utilities.getUuid().slice(0, 8) + Date.now().toString(36);
  var now = Date.now();

  var normalizedItems = (payload.items || []).map(function(it) {
    return {
      name: String(it.name || ''),
      qty: Number(it.qty) || 1,
      note: String(it.note || ''),
      price: Number(it.price) || 0,
      ready: false,
      readyAt: null,
      served: false,
      servedAt: null
    };
  });

  var total = Number(payload.total);
  if (isNaN(total) || total === 0) {
    total = normalizedItems.reduce(function(sum, it) { return sum + (it.price * it.qty); }, 0);
  }

  var staff = String(payload.staff || 'Waiter');
  var table = String(payload.table || '');
  var customer = String(payload.customer || '');
  var status = 'PENDING';
  var payment = 'UNPAID';
  var paidAt = '';
  var itemsJson = JSON.stringify(normalizedItems);

  sheet.appendRow([id, newCode, status, itemsJson, now, now, staff, total, payment, paidAt, table, customer]);

  return {
    id: id,
    code: newCode,
    status: status,
    items: normalizedItems,
    createdAt: now,
    updatedAt: now,
    staff: staff,
    total: total,
    payment: payment,
    paidAt: paidAt,
    table: table,
    customer: customer
  };
}

function actionUpdateOrderStatus(ss, payload) {
  var sheet = getOrCreateSheet(ss, 'Orders', HEADERS.Orders);
  var data = sheet.getDataRange().getValues();
  var id = payload.id;
  var status = payload.status;
  var staff = payload.staff;
  var now = Date.now();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      var rowIdx = i + 1;
      sheet.getRange(rowIdx, 3).setValue(status);
      sheet.getRange(rowIdx, 6).setValue(now);
      if (staff) sheet.getRange(rowIdx, 7).setValue(staff);
      return { id: id, status: status, updatedAt: now };
    }
  }
  throw new Error('Order not found: ' + id);
}

function actionMarkItemReady(ss, payload) {
  var sheet = getOrCreateSheet(ss, 'Orders', HEADERS.Orders);
  var data = sheet.getDataRange().getValues();
  var orderId = payload.orderId;
  var itemIndex = Number(payload.itemIndex);
  var staff = payload.staff || 'Kitchen';
  var now = Date.now();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(orderId)) {
      var rowIdx = i + 1;
      var items = [];
      try { items = JSON.parse(data[i][3]); } catch (e) { items = []; }
      if (!items[itemIndex]) throw new Error('Item index invalid: ' + itemIndex);

      items[itemIndex].ready = true;
      items[itemIndex].readyAt = now;

      var currentStatus = String(data[i][2]);
      var newStatus = currentStatus;
      if (currentStatus === 'PREPARING' || currentStatus === 'PENDING') {
        newStatus = 'READY';
      }

      sheet.getRange(rowIdx, 3).setValue(newStatus);
      sheet.getRange(rowIdx, 4).setValue(JSON.stringify(items));
      sheet.getRange(rowIdx, 6).setValue(now);
      sheet.getRange(rowIdx, 7).setValue(staff);

      return {
        id: orderId,
        code: String(data[i][1]),
        status: newStatus,
        items: items,
        updatedAt: now,
        staff: staff
      };
    }
  }
  throw new Error('Order not found: ' + orderId);
}

function actionServeItem(ss, payload) {
  var sheet = getOrCreateSheet(ss, 'Orders', HEADERS.Orders);
  var data = sheet.getDataRange().getValues();
  var orderId = payload.orderId;
  var itemIndex = Number(payload.itemIndex);
  var staff = payload.staff || 'Waiter';
  var now = Date.now();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(orderId)) {
      var rowIdx = i + 1;
      var items = [];
      try { items = JSON.parse(data[i][3]); } catch (e) { items = []; }
      if (!items[itemIndex]) throw new Error('Item index invalid: ' + itemIndex);

      items[itemIndex].served = true;
      items[itemIndex].servedAt = now;

      var allServed = items.length > 0 && items.every(function(it) { return !!it.served; });
      var newStatus = allServed ? 'COMPLETED' : String(data[i][2]);

      sheet.getRange(rowIdx, 3).setValue(newStatus);
      sheet.getRange(rowIdx, 4).setValue(JSON.stringify(items));
      sheet.getRange(rowIdx, 6).setValue(now);
      sheet.getRange(rowIdx, 7).setValue(staff);

      return {
        id: orderId,
        code: String(data[i][1]),
        status: newStatus,
        items: items,
        updatedAt: now,
        staff: staff
      };
    }
  }
  throw new Error('Order not found: ' + orderId);
}

function actionMarkOrderPaid(ss, payload) {
  var sheet = getOrCreateSheet(ss, 'Orders', HEADERS.Orders);
  var data = sheet.getDataRange().getValues();
  var id = payload.id;
  var now = Date.now();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      var rowIdx = i + 1;
      sheet.getRange(rowIdx, 6).setValue(now);
      sheet.getRange(rowIdx, 9).setValue('PAID');
      sheet.getRange(rowIdx, 10).setValue(now);
      return { id: id, payment: 'PAID', paidAt: now };
    }
  }
  throw new Error('Order not found: ' + id);
}

function actionSaveMenuItem(ss, payload) {
  var sheet = getOrCreateSheet(ss, 'Menu', HEADERS.Menu);
  var data = sheet.getDataRange().getValues();
  var item = payload.item;
  if (!item || !item.name) throw new Error('Item name required');

  var id = item.id || ('item_' + Utilities.getUuid().slice(0, 8));
  var rowValues = [
    id,
    String(item.name || ''),
    String(item.category || 'Main Dish'),
    String(item.description || ''),
    String(item.ingredients || ''),
    Number(item.price) || 0,
    String(item.emoji || ''),
    String(item.image || ''),
    item.available !== false
  ];

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      var rowIdx = i + 1;
      sheet.getRange(rowIdx, 1, 1, rowValues.length).setValues([rowValues]);
      item.id = id;
      return item;
    }
  }

  sheet.appendRow(rowValues);
  item.id = id;
  return item;
}

function actionDeleteMenuItem(ss, payload) {
  var sheet = getOrCreateSheet(ss, 'Menu', HEADERS.Menu);
  var data = sheet.getDataRange().getValues();
  var id = payload.id;

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { id: id, deleted: true };
    }
  }
  return { id: id, deleted: false };
}

function actionSaveAccount(ss, payload) {
  var sheet = getOrCreateSheet(ss, 'Accounts', HEADERS.Accounts);
  var data = sheet.getDataRange().getValues();
  var acc = payload.account;
  if (!acc || !acc.name) throw new Error('Account name required');

  var id = acc.id || ('acc_' + Utilities.getUuid().slice(0, 8));
  var rowValues = [
    id,
    String(acc.name || ''),
    String(acc.username || ''),
    String(acc.password || ''),
    String(acc.role || 'Waiter'),
    String(acc.status || 'Active')
  ];

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      var rowIdx = i + 1;
      sheet.getRange(rowIdx, 1, 1, rowValues.length).setValues([rowValues]);
      acc.id = id;
      return acc;
    }
  }

  sheet.appendRow(rowValues);
  acc.id = id;
  return acc;
}

function actionDeleteAccount(ss, payload) {
  var sheet = getOrCreateSheet(ss, 'Accounts', HEADERS.Accounts);
  var data = sheet.getDataRange().getValues();
  var id = payload.id;

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { id: id, deleted: true };
    }
  }
  return { id: id, deleted: false };
}

function actionAuthenticate(ss, payload) {
  var sheet = getOrCreateSheet(ss, 'Accounts', HEADERS.Accounts);
  var data = sheet.getDataRange().getValues();
  var u = String(payload.username || '').toLowerCase().trim();
  var p = String(payload.password || '').trim();

  for (var i = 1; i < data.length; i++) {
    var username = String(data[i][2] || '').toLowerCase().trim();
    var password = String(data[i][3] || '').trim();
    if (username === u && password === p) {
      if (String(data[i][5] || 'Active').toLowerCase() === 'inactive') {
        throw new Error('Account is inactive');
      }
      return {
        id: String(data[i][0]),
        name: String(data[i][1]),
        username: String(data[i][2]),
        role: String(data[i][4])
      };
    }
  }
  throw new Error('Invalid username or password');
}

function actionReset(ss) {
  var ordersSheet = ss.getSheetByName('Orders');
  if (ordersSheet && ordersSheet.getLastRow() > 1) {
    ordersSheet.deleteRows(2, ordersSheet.getLastRow() - 1);
  }
  return { reset: true };
}
*/

  /* ===== Database Connection Modal ===== */
  function openConnectModal(){
    const currentUrl = CONFIG.API_URL || '';
    const isLive = state.net === 'sheets' || state.net === 'sql';
    const isOffline = state.net === 'offline';
    const isCloudSql = currentUrl.includes('/api/pos') || (!currentUrl.includes('script.google.com') && isLive);
    
    const statusPill = isLive
      ? `<span class="pill pill-live">LIVE — ${isCloudSql ? 'Cloud SQL Database' : 'Database'} Connected</span>`
      : (isOffline ? '<span class="pill pill-preparing">OFFLINE — Unreachable</span>' : '<span class="pill pill-completed">LOCAL DEMO MODE</span>');

    const origin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : '';
    const defaultApiUrl = origin ? origin + '/api/pos' : '/api/pos';

    const html = `
      <div class="p-6 md:p-7 max-w-xl">
        <div class="flex justify-between items-start gap-4">
          <div>
            <p class="text-xs font-bold uppercase tracking-[.14em]" style="color:var(--primary)">Database Configuration</p>
            <h2 class="font-serif text-2xl font-bold mt-1">Cloud SQL Database (PostgreSQL)</h2>
          </div>
          <button class="btn btn-ghost !p-2" onclick="Savor.closeModal()">${icon('x','w-4 h-4')}</button>
        </div>

        <div class="mt-4 p-4 rounded-xl flex items-center justify-between gap-3 border" style="background:var(--surface-2);border-color:var(--border)">
          <div>
            <span class="text-xs text-muted block mb-1">Current Status</span>
            ${statusPill}
          </div>
          ${state.lastSync ? `<span class="text-xs text-muted">Last sync: ${fmtTime(state.lastSync)}</span>` : ''}
        </div>

        <div class="mt-5">
          <label class="block text-sm font-semibold">
            Database API Endpoint URL
            <span class="text-xs text-muted font-normal block mt-0.5">Use the built-in Vercel serverless SQL API (<code>/api/pos</code>) or custom cloud endpoint</span>
            <input id="modal-api-url" class="field mt-2" placeholder="${defaultApiUrl}" value="${esc(currentUrl)}">
          </label>
          <div id="modal-connect-status" class="mt-2 text-xs font-semibold hidden"></div>
        </div>

        <div class="flex flex-wrap gap-2 mt-4">
          <button class="btn btn-primary flex-1" id="modal-save-btn" onclick="Savor.saveAndTestUrl()">${icon('plug-zap','w-4 h-4')} Connect &amp; Test</button>
          <button class="btn btn-ghost text-xs" onclick="document.getElementById('modal-api-url').value = '${defaultApiUrl}'; Savor.saveAndTestUrl('${defaultApiUrl}')">${icon('refresh-cw','w-3.5 h-3.5')} Use Default (${defaultApiUrl})</button>
          ${currentUrl ? `<button class="btn btn-ghost text-xs" style="color:var(--danger)" onclick="Savor.disconnectApi()">Disconnect</button>` : ''}
        </div>

        <div class="mt-6 border-t pt-5" style="border-color:var(--border)">
          <div class="flex items-center justify-between cursor-pointer" onclick="document.getElementById('setup-guide-steps').classList.toggle('hidden')">
            <span class="font-bold text-sm flex items-center gap-2">${icon('book-open','w-4 h-4')} How to Deploy to Vercel with Free SQL</span>
            <span class="text-xs text-muted">Tap to view</span>
          </div>
          <div id="setup-guide-steps" class="mt-4 space-y-3 text-xs leading-relaxed">
            <div class="flex gap-2.5 items-start">
              <span class="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] flex-none" style="background:var(--primary-soft);color:var(--primary)">1</span>
              <div>Create a free serverless PostgreSQL database at <a href="https://neon.tech" target="_blank" class="underline font-bold" style="color:var(--primary)">neon.tech</a> (or use Vercel Postgres Storage in 1 click).</div>
            </div>
            <div class="flex gap-2.5 items-start">
              <span class="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] flex-none" style="background:var(--primary-soft);color:var(--primary)">2</span>
              <div>Deploy this project to <a href="https://vercel.com" target="_blank" class="underline font-bold" style="color:var(--primary)">vercel.com</a>. In project <strong>Settings &gt; Environment Variables</strong>, add <code>DATABASE_URL</code> with your connection string.</div>
            </div>
            <div class="flex gap-2.5 items-start">
              <span class="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] flex-none" style="background:var(--success-soft);color:var(--success)">3</span>
              <div><strong>Zero device setup:</strong> When published to Vercel, all staff phones &amp; tablets automatically connect to <code>/api/pos</code> without copying any links!</div>
            </div>
          </div>
        </div>

        <div class="mt-6 border-t pt-5" style="border-color:var(--border)">
          <span class="font-bold text-sm block mb-2">🔗 Multi-Device Role Links (Share with Staff)</span>
          <p class="text-xs text-muted mb-3">Staff open these links on phones or tablets to land directly into their role with sync enabled:</p>
          <div class="grid grid-cols-2 gap-2 text-xs">
            ${['waiter','kitchen','cashier','semi-admin','admin'].map(r => `
              <button class="btn btn-ghost !py-2 !px-2.5 justify-between text-left" onclick="Savor.copyRoleLink('${r}')">
                <span class="truncate capitalize font-semibold">${r.replace('-',' ')} link</span>
                ${icon('copy','w-3 h-3 text-muted flex-none')}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    openModal(html);
  }

  async function saveAndTestUrl(overrideVal){
    const input = document.getElementById('modal-api-url');
    const statusEl = document.getElementById('modal-connect-status');
    const saveBtn = document.getElementById('modal-save-btn');
    const rawVal = cleanUrl(overrideVal !== undefined ? overrideVal : (input ? input.value : ''));

    if(!rawVal){
      disconnectApi();
      return;
    }

    if(rawVal.includes('docs.google.com/spreadsheets/d/')){
      if(statusEl){
        statusEl.className = 'mt-2 text-xs font-semibold block';
        statusEl.style.color = 'var(--danger)';
        statusEl.textContent = 'This is a Google Sheet document URL, not an API endpoint.';
      }
      return;
    }

    if(statusEl){
      statusEl.className = 'mt-2 text-xs font-semibold block';
      statusEl.style.color = 'var(--info)';
      statusEl.textContent = 'Testing connection to database...';
    }
    if(saveBtn) saveBtn.disabled = true;

    CONFIG.API_URL = rawVal;
    safeSet('savor.api', rawVal);

    try {
      const db = await Data.fetchBootstrap();
      Data.apply(db);
      state.lastSync = Date.now();
      setNet('sheets');
      broadcast({ type: 'API_URL_CHANGED', url: rawVal });
      if(statusEl){
        statusEl.style.color = 'var(--success)';
        const isPg = db.storage === 'postgresql-cloud';
        statusEl.textContent = `✓ Connected! Found ${db.orders?.length || 0} orders, ${db.menu?.length || 0} menu items in ${isPg ? 'Cloud PostgreSQL' : 'Database'}.`;
      }
      toast('Connected to Database ✓', 4000, 'alert');
      setTimeout(() => {
        closeModal();
        if(window.Savor.onRender) window.Savor.onRender();
      }, 1000);
    } catch(err){
      setNet('offline');
      if(statusEl){
        statusEl.style.color = 'var(--danger)';
        statusEl.textContent = 'Connection failed: ' + (err.message || 'Unknown error');
      }
      toast('Connection failed — see error details.', 5000);
    } finally {
      if(saveBtn) saveBtn.disabled = false;
    }
  }

  function disconnectApi(){
    CONFIG.API_URL = '';
    safeSet('savor.api', '');
    setNet('local');
    broadcast({ type: 'API_URL_CHANGED', url: '' });
    toast('Switched to local demo mode.');
    closeModal();
    if(window.Savor.onRender) window.Savor.onRender();
  }

  function copyAppsScriptCode(){
    toast('Cloud SQL (PostgreSQL) is active. Google Apps Script is no longer needed.');
  }

  function copyRoleLink(role){
    const base = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/');
    const apiParam = CONFIG.API_URL ? ('?api=' + encodeURIComponent(CONFIG.API_URL)) : '';
    const link = base + role + '.html' + apiParam;
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(link).then(() => {
        toast(`✓ ${role.toUpperCase()} link copied to clipboard!`);
      }).catch(() => {
        prompt('Copy link:', link);
      });
    } else {
      prompt('Copy link:', link);
    }
  }

  function renderShell(role){
    const items = ROLE_NAV[role] || [];
    const session = window.Savor.session || getSession();
    const displayName = (session && session.name) || (ROLE_META[role]?.label || role);
    $('#app').innerHTML = `
      <section id="shell" class="min-h-screen">
        <aside class="sidebar hidden md:flex fixed inset-y-0 left-0 w-64 flex-col p-4 z-30">
          <a href="index.html" class="flex items-center gap-3 w-full text-left px-2 py-2 mb-6">
            <span class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background:var(--primary);color:var(--on-primary)">✦</span>
            <span class="min-w-0">
              <strong class="block text-sm leading-tight truncate">Savor &amp; Co.</strong>
              <small class="truncate block" style="color:var(--sidebar-muted)">${esc(displayName)}</small>
            </span>
          </a>
          <nav id="sidebar-nav" class="space-y-1 flex-1 overflow-auto"></nav>
          <div class="space-y-1 mt-2">
            <button onclick="Savor.openConnectModal()" class="nav-btn" style="background:rgba(255,255,255,.06)">
              ${icon('database','w-[18px] h-[18px]')}<span>Database Sync</span>
            </button>
            <button onclick="Savor.logout()" class="nav-btn" style="background:rgba(255,255,255,.06);color:#F0736A">
              ${icon('log-out','w-[18px] h-[18px]')}<span>Sign Out</span>
            </button>
            <a href="index.html" class="nav-btn" style="background:rgba(255,255,255,.06)">
              ${icon('arrow-left','w-[18px] h-[18px]')}<span>Back to roles</span>
            </a>
          </div>
        </aside>

        <div class="md:ml-64 flex flex-col min-h-screen">
          <header class="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 md:px-7 py-3 border-b" style="background:var(--surface);border-color:var(--border)">
            <div class="flex items-center gap-3 min-w-0">
              <a href="index.html" class="md:hidden w-10 h-10 rounded-xl card soft flex items-center justify-center">${icon('arrow-left','w-5 h-5')}</a>
              <div class="min-w-0">
                <p id="screen-eyebrow" class="text-[11px] font-bold uppercase tracking-[.14em]" style="color:var(--primary)">SAVOR &amp; CO.</p>
                <h1 id="screen-title" class="font-serif font-bold text-lg md:text-xl truncate">${esc(ROLE_META[role]?.label || role)}</h1>
                <p id="last-sync-label" class="text-[10px] text-muted hidden sm:block"></p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button id="sync-pill" class="hidden sm:inline-flex pill pill-completed cursor-pointer" onclick="Savor.openConnectModal()" title="Click to configure Database"><span class="w-2 h-2 rounded-full bg-current"></span><span id="sync-text">Local demo mode</span></button>
              <button id="refresh-btn" class="w-10 h-10 rounded-xl card soft flex items-center justify-center" onclick="Savor.refreshNow()" aria-label="Refresh" title="Refresh data"><i id="refresh-icon" data-lucide="refresh-cw" class="w-5 h-5"></i></button>
              <button class="w-10 h-10 rounded-xl card soft flex items-center justify-center" onclick="Savor.openConnectModal()" aria-label="Database Settings" title="Database Settings"><i data-lucide="database" class="w-5 h-5"></i></button>
              <button class="w-10 h-10 rounded-xl card soft flex items-center justify-center" onclick="Savor.toggleTheme()" aria-label="Toggle dark mode" title="Toggle theme"><i data-lucide="sun-moon" class="w-5 h-5"></i></button>
              <button class="w-10 h-10 rounded-xl card soft flex items-center justify-center text-rose-500 hover:bg-rose-500/10" onclick="Savor.logout()" aria-label="Sign Out" title="Sign Out"><i data-lucide="log-out" class="w-5 h-5"></i></button>
            </div>
          </header>
          <div id="offline-banner" class="hidden px-5 py-2.5 text-sm font-semibold text-center cursor-pointer" onclick="Savor.openConnectModal()" style="background:var(--danger-soft);color:var(--danger)">
            ${icon('wifi-off','inline w-4 h-4 mr-1.5 -mt-0.5')}<span>Database unreachable — using local data. Tap here to test or fix connection.</span>
          </div>
          <main id="main" class="flex-1 p-4 md:p-7 pb-28 md:pb-7"></main>
        </div>

        <nav id="mobile-nav" class="md:hidden fixed bottom-0 inset-x-0 z-30 flex justify-around p-2 border-t" style="background:var(--surface);border-color:var(--border)"></nav>
      </section>

      <div id="drawer" class="drawer" role="dialog"></div>
      <div id="modal-backdrop" class="backdrop" role="dialog"><div id="modal-content" class="modal"></div></div>
      <div id="toast" class="toast" role="status" aria-live="polite"></div>
    `;
    window.Savor._renderNav = function(){
      const active = window.Savor.screen || items[0][0];
      setHtml($('#sidebar-nav'), items.map(([key, ic, label]) =>
        `<button class="nav-btn ${active === key ? 'active' : ''}" onclick="Savor.navigate('${key}')">
           ${icon(ic,'w-[18px] h-[18px]')}<span>${esc(label)}</span>${window.Savor.navBadge ? window.Savor.navBadge(key) : ''}
         </button>`).join(''));
      setHtml($('#mobile-nav'), items.slice(0, 4).map(([key, ic, label]) => {
        const b = (window.Savor.navBadge ? window.Savor.navBadge(key) : '').replace(/class="nav-badge"/, 'style="background:var(--primary);color:#fff;border-radius:6px;padding:0 4px;font-size:.55rem"');
        return `<button class="mob-btn ${active === key ? 'active' : ''}" onclick="Savor.navigate('${key}')">
           ${icon(ic,'w-5 h-5')}<span>${esc(label.split(' ')[0])}${b}</span>
         </button>`;
      }).join(''));
    };
  }

  async function boot(options){
    const role = options.role;
    const session = requireRole(role);
    if(!session) return;
    window.Savor.role = role;
    window.Savor.screen = options.defaultScreen || (ROLE_NAV[role] || [['','','']])[0][0];
    window.Savor.session = session;
    applyTheme();
    renderShell(role);

    await Data.bootstrap();
    setNet(state.net);
    if(window.lucide) lucide.createIcons();

    window.Savor._renderNav();
    if(options.render) options.render();
    startPolling();
  }

  window.Savor = {
    CONFIG, state, Local, API, Data, ADMIN_PASSWORD,
    FLOW, KITCHEN_ACTION, CATEGORIES, ROLE_META, SEED_MENU, SEED_ACCOUNTS,
    $, $$, esc, uid, setHtml, icon, cleanUrl,
    fmtTime, fmtDateTime, peso, pretty,
    statusPill, paymentPill, orderTotal, hasMeta, orderMetaText,
    tableTag, tableLine,
    itemCount, servedCount, readyCount, unreadyCount, readyUnservedCount, allServed,
    itemSummary, allNotes,
    progressBar, kitchenProgress, servedProgress,
    emptyState, artClass, menuHero, normalizeMenuItem, cloneSeedMenu, processImageFile,
    toast, openModal, closeModal, closeDrawer, chime,
    setNet, refreshNow, toggleTheme, toggleSound,
    openConnectModal, saveAndTestUrl, disconnectApi, copyAppsScriptCode, copyRoleLink, broadcast,
    isAdminUnlocked, setAdminUnlocked,
    getSession, setSession, clearSession, requireRole, logout, currentUser,
    boot,
    onRender: null,
    onDataChanged: null,
    navBadge: null,
    role: '',
    screen: '',
    session: null,
    navigate: function(screen){ this.screen = screen; if(this.onRender) this.onRender(); this._renderNav && this._renderNav(); }
  };
})();