const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
};

function resolveRequestPath(urlPath) {
  const trimmed = urlPath.split('?')[0];
  const decoded = decodeURIComponent(trimmed || '/');
  const relativePath = decoded === '/' ? '/index.html' : decoded;
  const absolutePath = path.normalize(path.join(ROOT_DIR, relativePath));
  if (!absolutePath.startsWith(ROOT_DIR)) return null;
  return absolutePath;
}

function sendNotFound(response) {
  response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end('Not found');
}

function sendFile(filePath, response) {
  fs.readFile(filePath, (error, contents) => {
    if (error) {
      if (error.code === 'ENOENT') {
        sendNotFound(response);
        return;
      }
      response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Server error');
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[extension] || 'application/octet-stream';
    response.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Type': contentType,
    });
    response.end(contents);
  });
}

const server = http.createServer((request, response) => {
  const filePath = resolveRequestPath(request.url || '/');
  if (!filePath) {
    response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Forbidden');
    return;
  }
  sendFile(filePath, response);
});

server.listen(PORT, HOST, () => {
  console.log(`Block Blast Duel local server running at http://${HOST}:${PORT}`);
  console.log('Local mode: http://127.0.0.1:3000/');
  console.log('Host mode:  http://127.0.0.1:3000/?hub=1&mode=host&name=Yuki&room=ABCD12');
  console.log('Join mode:  http://127.0.0.1:3000/?hub=1&mode=join&name=Mika&room=ABCD12');
});
