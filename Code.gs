// This file is identical to google-apps-script.js for direct copy/paste into Google Apps Script Code.gs
// See google-apps-script.js or the in-app setup guide for deployment instructions.
var SPREADSHEET_ID = '';

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
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
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
    try {
      items = typeof row[3] === 'string' ? JSON.parse(row[3]) : (row[3] || []);
    } catch (e) { items = []; }
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
  orders.sort(function(a, b) {
    return (new Date(b.createdAt)) - (new Date(a.createdAt));
  });

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
