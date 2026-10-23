/**
 * Savor & Co. — Local Development Server
 * Runs static frontend and /api/pos serverless backend locally.
 * Usage: node server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const posHandler = require('./api/pos');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Handle /api/pos endpoint
  if (pathname === '/api/pos' || pathname.startsWith('/api/pos/')) {
    // Read request body for POST
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      // Mock Express/Vercel request and response helpers
      req.query = parsedUrl.query;
      try {
        req.body = body ? JSON.parse(body) : {};
      } catch(e) {
        req.body = body;
      }

      res.status = function(code) {
        res.statusCode = code;
        return res;
      };
      res.json = function(data) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
        return res;
      };

      try {
        await posHandler(req, res);
      } catch (err) {
        console.error('Server error handling /api/pos:', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  // Serve static files
  let safePath = pathname === '/' ? '/index.html' : pathname;
  // Prevent directory traversal
  const filePath = path.normalize(path.join(__dirname, safePath));
  if (!filePath.startsWith(__dirname)) {
    res.statusCode = 403;
    res.end('Access denied');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end('<h1>404 Not Found</h1><p>The requested file does not exist.</p>');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`✦ Savor & Co. POS is running locally!`);
  console.log(`✦ URL: http://localhost:${PORT}`);
  console.log(`✦ POS API: http://localhost:${PORT}/api/pos`);
  console.log(`✦ Multi-User Staff Links:`);
  console.log(`  - Waiter:      http://localhost:${PORT}/waiter.html`);
  console.log(`  - Kitchen:     http://localhost:${PORT}/kitchen.html`);
  console.log(`  - Cashier:     http://localhost:${PORT}/cashier.html`);
  console.log(`  - Semi Admin:  http://localhost:${PORT}/semi-admin.html`);
  console.log(`  - Admin:       http://localhost:${PORT}/admin.html`);
  console.log(`=======================================================`);
  if (!process.env.DATABASE_URL) {
    console.log(`ℹ Notice: DATABASE_URL not set. Running in fast demo memory mode.`);
    console.log(`  To connect real Neon PostgreSQL, run:`);
    console.log(`  set DATABASE_URL=postgresql://... && node server.js`);
  } else {
    console.log(`✓ PostgreSQL Database connected via DATABASE_URL.`);
  }
});
