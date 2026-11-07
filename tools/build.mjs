#!/usr/bin/env node
/**
 * Deadzone · build
 *
 *   node tools/build.mjs            -> dist/web (site) + dist/Deadzone.html (arquivo único)
 *   node tools/build.mjs --android  -> também copia o site para android/app/src/main/assets/www
 *
 * Sem dependências: só Node.js 18+.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const WEB = path.join(DIST, 'web');
const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.glb': 'model/gltf-binary', '.webp': 'image/webp' };

const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const copyDir = (src, dst) => {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const a = path.join(src, e.name), b = path.join(dst, e.name);
    if (e.isDirectory()) copyDir(a, b); else fs.copyFileSync(a, b);
  }
};

function checkSyntax(files) {
  // cada arquivo é um <script> clássico: precisa ser válido sozinho
  for (const f of files) {
    try { new Function(read(f)); } catch (e) { console.error(`Erro de sintaxe em ${f}: ${e.message}`); process.exit(1); }
  }
}

const index = read('index.html');
const scripts = [...index.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
const styles = [...index.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map(m => m[1]);
checkSyntax(scripts.filter(s => s.startsWith('src/')));

// ---------- dist/web: site com arquivos separados ----------
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(WEB, { recursive: true });
for (const d of ['src', 'assets', 'vendor']) copyDir(path.join(ROOT, d), path.join(WEB, d));
for (const f of ['index.html', 'manifest.webmanifest']) fs.copyFileSync(path.join(ROOT, f), path.join(WEB, f));

// ---------- dist/Deadzone.html: tudo embutido em um arquivo ----------
const dataUri = rel => {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) { console.error('arquivo não encontrado: ' + rel); process.exit(1); }
  return `data:${MIME[path.extname(rel).toLowerCase()] || 'application/octet-stream'};base64,${fs.readFileSync(file).toString('base64')}`;
};
const inlineAssets = t => t.replace(/(["'(])(assets\/[A-Za-z0-9_./-]+\.(?:jpg|jpeg|png|glb|webp))(?=["')])/g, (_, q, rel) => q + dataUri(rel));
let single = index
  .replace(/<link rel="stylesheet" href="([^"]+)">/g, (_, href) => `<style>\n${read(href)}</style>`)
  .replace(/<script src="([^"]+)"><\/script>/g, (_, src) => `<script>\n${read(src).replace(/<\/script/gi, '<\\/script')}\n</script>`)
  .replace(/<link rel="manifest"[^>]*>\n?/, '')
  .replace(/<link rel="(?:icon|apple-touch-icon)"[^>]*>\n?/g, '');
single = inlineAssets(single);
fs.writeFileSync(path.join(DIST, 'Deadzone.html'), single);

// ---------- Android ----------
if (process.argv.includes('--android')) {
  const www = path.join(ROOT, 'android/app/src/main/assets/www');
  fs.rmSync(www, { recursive: true, force: true });
  copyDir(WEB, www);
  console.log('android: site copiado para', path.relative(ROOT, www));
}

const mb = f => (fs.statSync(f).size / 1e6).toFixed(1) + ' MB';
console.log(`ok · ${scripts.length} scripts, ${styles.length} folhas de estilo`);
console.log('dist/web/ ............', 'site (GitHub Pages / APK)');
console.log('dist/Deadzone.html ...', mb(path.join(DIST, 'Deadzone.html')), '(arquivo único)');
