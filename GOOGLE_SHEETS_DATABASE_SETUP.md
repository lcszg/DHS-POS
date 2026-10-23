# Savor & Co. — Multi-User Google Sheets Database Setup

This restaurant management POS system uses **Google Sheets** as a free, real-time cloud database. All devices (Waiters taking orders, Kitchen preparing dishes, Cashier accepting payments, and Admin oversight) share the same live data in real time.

---

## ⚡ 60-Second Setup Guide

### Step 1: Create a Google Sheet
1. Open your browser and visit: **[sheets.new](https://sheets.new)**
2. Give your spreadsheet a name (e.g., `Savor Restaurant POS`).

### Step 2: Open Google Apps Script
1. In the top menu of your Google Sheet, click:
   **Extensions** > **Apps Script**

### Step 3: Paste the Backend Code
1. Delete any sample code inside `Code.gs`.
2. Open the file **`google-apps-script.js`** (or **`Code.gs`**) in this project folder, copy all code, and paste it into the Apps Script editor.
3. Click the **Save** (💾 disk icon) button.

> **Note:** The script will automatically create the 3 database sheets (`Orders`, `Menu`, and `Accounts`) and load the starter menu items the first time it connects! You do not need to create columns manually.

### Step 4: Deploy as a Web App
1. In the top-right corner of the Apps Script editor, click **Deploy** > **New deployment**.
2. Click the gear icon (⚙️) next to *Select type* and choose **Web app**.
3. Fill in the deployment settings:
   - **Description**: `Savor POS Live API`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone` ⚠️ **(CRITICAL: Do NOT choose "Only myself" or "Anyone with a Google Account")**
4. Click **Deploy**.
5. If Google asks you to review permissions:
   - Click **Authorize access**
   - Choose your Google account
   - Click **Advanced** (small text at bottom)
   - Click **Go to Untitled project (unsafe)**
   - Click **Allow**
6. Copy the **Web app URL** (it ends in `/exec`).

---

### Step 5: Connect in the POS App
1. Open **`index.html`** in your browser.
2. Click the **Connect** button or the **Database** button in the top right.
3. Paste your `/exec` URL into the **Apps Script Web App URL** box.
4. Click **Connect & Test**.
5. Once tested, you'll see a green checkmark `✓ Connected!` and the status will change to **Live · Google Sheets**.

---

## 📱 How Multiple Users / Devices Work

Once the Google Sheet database is connected:
1. Click **Database** (or visit **Admin > Settings**).
2. Under **Share with staff devices**, copy the link for each role:
   - **Waiter Link**: `waiter.html?api=YOUR_APPS_SCRIPT_URL`
   - **Kitchen Link**: `kitchen.html?api=YOUR_APPS_SCRIPT_URL`
   - **Cashier Link**: `cashier.html?api=YOUR_APPS_SCRIPT_URL`
   - **Admin Link**: `admin.html?api=YOUR_APPS_SCRIPT_URL`
3. Send each link to the staff member's device (phone, tablet, POS monitor, or computer).
4. Staff can open their link in Safari, Chrome, Edge, or Firefox:
   - Waiter creates an order on their phone ➔ Kitchen tablet immediately chimes and shows the ticket!
   - Kitchen taps "Ready" on a dish ➔ Waiter gets an alert on their phone to serve it!
   - Waiter delivers the food and taps "Serve" ➔ Cashier counter receives the ticket ready for payment!
   - Cashier collects payment and taps "Paid" ➔ Admin dashboard logs the revenue in real time!

---

## 💻 Local Real-Time Sync (Same Computer / Multiple Windows)
Even if you run the app locally without Google Sheets configured, the app uses a **BroadcastChannel** bus so that multiple browser tabs or windows on the same computer sync instantly in real time without delays.

---

## 🛠️ Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| Red `OFFLINE` or "Permission error" | Apps Script deployed with restricted access | In Apps Script, click **Deploy > Manage deployments > Edit (pencil icon)**. Set **Who has access** to **Anyone**. Then save and redeploy. |
| "Google Sheet URL error" | Pasted spreadsheet URL instead of Web app URL | You need the URL from **Deploy > New deployment > Web app** ending in `/exec`, NOT the Google Sheet address. |
| Script error in Google Sheet | Missing authorizations | Run `doGet` once in the Apps Script editor and accept permissions. |
