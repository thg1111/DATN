const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(process.argv[2] || process.cwd());
const port = Number(process.argv[3] || process.env.PORT || 5500);
const host = process.argv[4] || '127.0.0.1';

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.jfif': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function send(response, status, body, headers = {}) {
  response.writeHead(status, headers);
  response.end(body);
}

function safeFilePath(requestUrl) {
  const parsed = new URL(requestUrl, `http://${host}:${port}`);
  const decodedPath = decodeURIComponent(parsed.pathname);
  const relativePath = decodedPath === '/' ? 'index.html' : decodedPath.replace(/^\/+/, '');
  const filePath = path.resolve(root, relativePath);

  if (!filePath.startsWith(root)) {
    return null;
  }

  return filePath;
}

const server = http.createServer((request, response) => {
  const filePath = safeFilePath(request.url);
  if (!filePath) {
    send(response, 403, 'Forbidden', { 'Content-Type': 'text/plain; charset=utf-8' });
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      send(response, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
      return;
    }

    const contentType = contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    response.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store'
    });
    fs.createReadStream(filePath).pipe(response);
  });
});

server.listen(port, host, () => {
  console.log(`Static server listening at http://${host}:${port}/`);
  console.log(`Serving ${root}`);
});
