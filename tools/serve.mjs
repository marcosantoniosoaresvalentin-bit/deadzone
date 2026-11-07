#!/usr/bin/env node
/**
 * Deadzone · servidor de desenvolvimento
 *   node tools/serve.mjs [porta]   (padrão 8080)
 * Abre o jogo direto dos arquivos-fonte, sem precisar de build.
 * Também aparece na rede local: abra o endereço no celular (mesmo Wi-Fi).
 */
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = +(process.argv[2] || process.env.PORT || 8080);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.jpg': 'image/jpeg', '.png': 'image/png', '.glb': 'model/gltf-binary', '.svg': 'image/svg+xml' };

http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(ROOT, path.normalize(p));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('não encontrado'); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => {
  console.log(`Deadzone rodando em http://localhost:${PORT}`);
  for (const n of Object.values(os.networkInterfaces()).flat()) if (n && n.family === 'IPv4' && !n.internal) console.log(`  no celular (mesmo Wi-Fi): http://${n.address}:${PORT}`);
});
