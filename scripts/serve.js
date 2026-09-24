#!/usr/bin/env node
/*
 * Tiny static file server for trying tools locally (npm start) and for the
 * Playwright tests. No dependencies.
 *
 *   node scripts/serve.js                 serve the repo on port 8080
 *   node scripts/serve.js --port 4173     pick a port
 *   node scripts/serve.js --root _site    serve the built site instead
 *
 * It listens on every network interface and prints the Wi-Fi address, so a
 * tablet or phone on the same network can open the tools too.
 */
'use strict';

const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8'
};

function option(name, fallback) {
  const i = process.argv.indexOf(name);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const root = path.resolve(__dirname, '..', option('--root', '.'));
const port = Number(option('--port', process.env.PORT || 8080));

function send(res, status, body, type) {
  res.writeHead(status, {
    'Content-Type': type || 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch (e) {
    return send(res, 400, 'Bad request');
  }

  let file = path.join(root, pathname);
  // Never serve anything outside the root folder.
  if (file !== root && !file.startsWith(root + path.sep)) {
    return send(res, 403, 'Forbidden');
  }

  fs.stat(file, (err, stat) => {
    if (!err && stat.isDirectory()) {
      if (!pathname.endsWith('/')) {
        res.writeHead(301, { Location: pathname + '/' });
        return res.end();
      }
      file = path.join(file, 'index.html');
    }
    fs.readFile(file, (readErr, data) => {
      if (readErr) return send(res, 404, 'Not found: ' + pathname);
      send(res, 200, data, TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream');
    });
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log('Serving ' + (path.relative(process.cwd(), root) || '.') + '/ at:');
  console.log('  http://localhost:' + port + '/');
  Object.values(os.networkInterfaces()).flat().forEach((net) => {
    if (net && net.family === 'IPv4' && !net.internal) {
      console.log('  http://' + net.address + ':' + port + '/   (other devices on your Wi-Fi)');
    }
  });
});
