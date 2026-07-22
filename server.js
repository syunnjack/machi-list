const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const host = "127.0.0.1";

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8"
};

function resolveFile(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split("?")[0]);
  const requested = path.normalize(path.join(root, cleanPath));
  if (!requested.startsWith(root)) return null;
  if (fs.existsSync(requested) && fs.statSync(requested).isFile()) return requested;
  const indexFile = path.join(requested, "index.html");
  if (fs.existsSync(indexFile)) return indexFile;
  return null;
}

const server = http.createServer((request, response) => {
  const file = resolveFile(request.url || "/");
  if (!file) {
    response.writeHead(404, {"content-type": "text/plain; charset=utf-8"});
    response.end("Not found");
    return;
  }
  const ext = path.extname(file);
  response.writeHead(200, {
    "content-type": types[ext] || "application/octet-stream",
    "cache-control": "no-store"
  });
  fs.createReadStream(file).pipe(response);
});

server.listen(port, host, () => {
  console.log(`machi-list running at http://${host}:${port}/`);
});
