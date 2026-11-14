/* Deadzone · ui/world-map.js
 * MAPA GRANDE (no chão, no avião e no paraquedas):
 *  - Esquerda: painel com as MISSÕES DIÁRIAS (atualizam durante a partida; concluídas ficam destacadas).
 *    A aba no topo do painel recolhe/mostra as missões, deixando só o mapa.
 *  - Centro: o mapa. Um dedo arrasta; dois dedos aproximam/afastam. Tocar marca UM local
 *    (tocar de novo em cima da marcação apaga). Botão "Excluir" embaixo apaga a marcação.
 *  - Direita: X (fecha mapa e missões), + / − e a barra entre eles (arrastar = zoom rápido).
 */
const MK = [], bmap = $('bmap'), bmc = $('bmc'), bmg = bmc.getContext('2d'); let bmS = null, bmT = 0, BG = null;
// ---------- montagem da tela ----------
(function () {
  const css = document.createElement('style'); css.textContent = `
#bmap{position:fixed;inset:0;z-index:60;display:none;align-items:stretch;background:rgba(9,13,17,.93);font-family:Bahnschrift,Oswald,"Roboto Condensed",system-ui,sans-serif;color:#fff;
 padding:max(8px,env(safe-area-inset-top)) max(8px,env(safe-area-inset-right)) max(8px,env(safe-area-inset-bottom)) max(8px,env(safe-area-inset-left));gap:8px;box-sizing:border-box}
#bmMis{width:min(29vw,300px);flex:none;display:flex;flex-direction:column;background:linear-gradient(180deg,rgba(40,46,52,.96),rgba(26,30,35,.96));border:1px solid rgba(255,255,255,.08);border-radius:6px;overflow:hidden;position:relative}
#bmMis .hd{display:flex;align-items:center;gap:8px;padding:9px 10px;background:rgba(0,0,0,.25);border-bottom:1px solid rgba(255,255,255,.07)}
#bmMis .hd b{flex:1;text-align:center;font:italic 900 clamp(15px,4.6vh,21px)/1 Impact,Haettenschweiler,"Arial Black",sans-serif;letter-spacing:.5px}
#bmMis .ls{flex:1;overflow:auto;padding:8px;display:flex;flex-direction:column;gap:7px}
#bmMis .q{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-left:3px solid #5f6670;border-radius:4px;padding:8px 9px}
#bmMis .q p{margin:0;font-size:clamp(11px,3.3vh,14px);line-height:1.25;color:#e4e7e0}
#bmMis .q .br{height:5px;border-radius:3px;background:rgba(255,255,255,.12);margin-top:6px;overflow:hidden}#bmMis .q .br u{display:block;height:100%;background:#f0a830}
#bmMis .q small{display:block;margin-top:4px;font-size:11px;color:#aab0a6}#bmMis .q small em{font-style:normal;color:#f0a830;font-weight:800}
#bmMis .q.ok{border-color:rgba(255,201,51,.75);border-left-color:#ffc933;background:linear-gradient(90deg,rgba(255,201,51,.24),rgba(255,201,51,.06));box-shadow:0 0 12px rgba(255,201,51,.25)}
#bmMis .q.ok p{color:#fff;font-weight:700}#bmMis .q.ok .br u{background:#ffc933}#bmMis .q.ok small{color:#ffd65c;font-weight:800}
#bmMis .em{color:#9aa096;font-size:13px;text-align:center;margin-top:20px}
.bmTab{flex:none;width:34px;height:34px;border:0;border-radius:5px;background:rgba(255,255,255,.1);color:#fff;font:900 20px/1 system-ui;display:flex;align-items:center;justify-content:center;padding:0}
#bmOpenM{position:absolute;left:0;top:0;z-index:3;display:none;border-radius:0 6px 6px 0;width:auto;padding:0 10px;height:38px;gap:6px;font:800 13px system-ui;background:rgba(40,46,52,.95);border:1px solid rgba(255,255,255,.12)}
#bmap.noM #bmMis{display:none}#bmap.noM #bmOpenM{display:flex}
#bmMain{flex:1;min-width:0;position:relative;border-radius:6px;overflow:hidden;background:#1e4e82}
#bmc{position:absolute;left:0;top:0;width:100%;height:100%;touch-action:none}
#bmBot{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:center;gap:10px;padding:8px;pointer-events:none}
#bmDel{pointer-events:auto;display:flex;align-items:center;gap:8px;background:rgba(18,22,26,.88);border:1px solid rgba(255,255,255,.18);color:#fff;border-radius:4px;padding:9px 26px;font:800 15px system-ui}
#bmDel:disabled{opacity:.45}
#bmSide{width:58px;flex:none;display:flex;flex-direction:column;align-items:center;gap:10px}
#bmx{position:static;width:50px;height:50px;border:0;border-radius:6px;background:rgba(255,255,255,.1);color:#fff;font:900 26px/1 system-ui;padding:0}
.bmZ{width:46px;height:46px;border:2px solid rgba(255,255,255,.75);border-radius:4px;background:rgba(18,22,26,.85);color:#fff;font:900 28px/1 system-ui;padding:0}
#bmTrk{flex:1;width:46px;position:relative;touch-action:none;max-height:260px}
#bmTrk:before{content:"";position:absolute;left:50%;top:4px;bottom:4px;width:4px;margin-left:-2px;border-radius:2px;background:rgba(255,255,255,.25)}
#bmTrk i{position:absolute;left:50%;width:34px;height:14px;margin:-7px 0 0 -17px;border-radius:3px;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.6)}`;
  document.head.appendChild(css);
  const x = $('bmx'); bmap.innerHTML = '';
  bmap.insertAdjacentHTML('beforeend', '<div id="bmMis"><div class="hd"><button class="bmTab" id="bmHideM" title="Recolher missões">‹</button><b>Missões</b><span style="width:34px"></span></div><div class="ls"></div></div>'
    + '<div id="bmMain"><button class="bmTab" id="bmOpenM">Missões ›</button></div><div id="bmSide"></div>');
  $('bmMain').appendChild(bmc); $('bmMain').insertAdjacentHTML('beforeend', '<div id="bmBot"><button id="bmDel">✖ Excluir</button></div>');
  x.textContent = '✕'; $('bmSide').appendChild(x);
  $('bmSide').insertAdjacentHTML('beforeend', '<button class="bmZ" id="bmZin">+</button><div id="bmTrk"><i></i></div><button class="bmZ" id="bmZout">−</button>');
})();

// ---------- vista (zoom e posição) ----------
const BMV = { z: 1.3, cx: null, cz: null }, BMZ0 = 1, BMZ1 = 6;
function bmE() { return Math.max(MAPB.x1 - MAPB.x0, MAPB.z1 - MAPB.z0) / 2 + 25; }
const bmCX = () => (MAPB.x0 + MAPB.x1) / 2, bmCZ = () => (MAPB.z0 + MAPB.z1) / 2;
function bmGeo() {
  const W = bmc.width, H = bmc.height, E = bmE(), d = bmc.width / Math.max(1, bmc.clientWidth), k = Math.min(W, H) / (2 * E) * BMV.z;
  const MCX = bmCX(), MCZ = bmCZ(); if (BMV.cx == null) { BMV.cx = MCX; BMV.cz = MCZ; }
  // não deixa o mapa sair da tela
  const lx = Math.max(0, E - W / 2 / k), lz = Math.max(0, E - H / 2 / k);
  BMV.cx = Math.max(MCX - lx, Math.min(MCX + lx, BMV.cx)); BMV.cz = Math.max(MCZ - lz, Math.min(MCZ + lz, BMV.cz));
  const cx = BMV.cx, cz = BMV.cz;
  return { W, H, k, d, E, X: x => W / 2 + (x - cx) * k, Y: z => H / 2 + (z - cz) * k, wx: px => (px - W / 2) / k + cx, wz: py => (py - H / 2) / k + cz };
}
// camada fixa (terreno e lagos) em alta resolução, recortada conforme o zoom
function buildBig() {
  const MCX = bmCX(), MCZ = bmCZ(), E = bmE(), SZ = 2048, ks = SZ / (2 * E), X = x => (x - (MCX - E)) * ks, Y = z => (z - (MCZ - E)) * ks;
  bmS = document.createElement('canvas'); bmS.width = bmS.height = SZ; const g = bmS.getContext('2d');
  g.fillStyle = '#1e4e82'; g.fillRect(0, 0, SZ, SZ); g.imageSmoothingEnabled = true;
  g.drawImage(TERMAP, X(TERMAP.x0), Y(TERMAP.z0), 2 * TERMAP.E * ks, 2 * TERMAP.E * ks);
  g.fillStyle = '#3a6ea5'; for (const l of LK) { g.beginPath(); g.arc(X(l.x), Y(l.z), l.r * ks, 0, 7); g.fill(); }
  bmS.ks = ks; bmS.E = E;
}
function bmLabel(g, t, x, y, d, sz) { g.font = 'bold ' + Math.round(sz * d) + 'px sans-serif'; g.textAlign = 'center'; g.lineWidth = 3 * d; g.strokeStyle = 'rgba(0,0,0,.85)'; g.fillStyle = '#fff'; g.strokeText(t, x, y); g.fillText(t, x, y); }
function drawBig() {
  if (bmap.style.display !== 'flex') return; if (window.dzArenaMap && dzArenaMap()) return; if (!bmS) buildBig();
  const G = bmGeo(), { W, H, k, d, X, Y } = G; BG = G; const g = bmg;
  g.fillStyle = '#1e4e82'; g.fillRect(0, 0, W, H);
  // recorte da camada fixa
  { const MCX = bmCX(), MCZ = bmCZ(), ks = bmS.ks, E = bmS.E, x0 = G.wx(0), z0 = G.wz(0), sx = (x0 - (MCX - E)) * ks, sy = (z0 - (MCZ - E)) * ks, sw = W / k * ks, sh = H / k * ks;
    g.imageSmoothingEnabled = true; g.drawImage(bmS, sx, sy, sw, sh, 0, 0, W, H); }
  // ruas e prédios (desenhados na hora: ficam nítidos com zoom)
  const vx0 = G.wx(0) - 5, vx1 = G.wx(W) + 5, vz0 = G.wz(0) - 5, vz1 = G.wz(H) + 5;
  g.fillStyle = '#8a8d92'; for (const r of RDS) if (r[2] > vx0 && r[0] < vx1 && r[3] > vz0 && r[1] < vz1) g.fillRect(X(r[0]), Y(r[1]), Math.max(1.5, (r[2] - r[0]) * k), Math.max(1.5, (r[3] - r[1]) * k));
  g.fillStyle = '#e6d9b4'; for (const b of FP) if (b.x1 > vx0 && b.x0 < vx1 && b.z1 > vz0 && b.z0 < vz1) g.fillRect(X(b.x0), Y(b.z0), Math.max(1.5, (b.x1 - b.x0) * k), Math.max(1.5, (b.z1 - b.z0) * k));
  // grade (100 m) quando aproximado
  if (BMV.z >= 2) { g.strokeStyle = 'rgba(255,255,255,.10)'; g.lineWidth = d; g.beginPath(); for (let v = Math.ceil(vx0 / 100) * 100; v <= vx1; v += 100) { g.moveTo(X(v), 0); g.lineTo(X(v), H); } for (let v = Math.ceil(vz0 / 100) * 100; v <= vz1; v += 100) { g.moveTo(0, Y(v)); g.lineTo(W, Y(v)); } g.stroke(); }
  // nomes dos locais (tamanho fixo na tela)
  for (const c of CITIES) if (!c.blank) bmLabel(g, c.n, X(c.x), Y(c.z) - 12 * d, d, 13);
  for (const c of (typeof MAPNAMES !== 'undefined' ? MAPNAMES : [])) bmLabel(g, c.n, X(c.x), Y(c.z), d, 12);
  try { window.dzWMExtra && dzWMExtra(g, X, Y, d); } catch (e) { }
  g.textBaseline = 'alphabetic';
  // zona segura
  g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 2.5 * d; g.beginPath(); g.arc(X(zX), Y(zZ), zR * k, 0, 7); g.stroke();
  // rota do avião (linha tracejada amarela)
  const pl_ = mode === 'plane';
  if (pl_) { try { const L = 3000; g.save(); g.setLineDash([10 * d, 7 * d]); g.lineWidth = 3 * d; g.strokeStyle = '#ffe14a'; g.beginPath(); g.moveTo(X(plane.position.x - pD.x * L), Y(plane.position.z - pD.z * L)); g.lineTo(X(plane.position.x + pD.x * L), Y(plane.position.z + pD.z * L)); g.stroke(); g.restore(); } catch (e) { } }
  // marcação (uma só)
  for (const m of MK) { const x = X(m.x), y = Y(m.z), s = d * 1.4; g.fillStyle = '#ffd400'; g.strokeStyle = '#000'; g.lineWidth = 2 * d; g.beginPath(); g.arc(x, y - 10 * s, 8 * s, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.moveTo(x - 5 * s, y - 5 * s); g.lineTo(x, y + 2 * s); g.lineTo(x + 5 * s, y - 5 * s); g.fill(); g.fillStyle = '#000'; g.beginPath(); g.arc(x, y - 10 * s, 3 * s, 0, 7); g.fill(); }
  // jogador / avião
  const c = pl_ ? plane.position : P, hx = pl_ ? pD.x : Math.sin(yaw), hz = pl_ ? pD.z : Math.cos(yaw), s = d * 1.4; g.save(); g.translate(X(c.x), Y(c.z)); g.rotate(Math.atan2(hz, hx) + Math.PI / 2); g.fillStyle = pl_ ? '#ffe14a' : '#fff'; g.strokeStyle = '#000'; g.lineWidth = 2 * d; g.beginPath(); g.moveTo(0, -11 * s); g.lineTo(8 * s, 9 * s); g.lineTo(0, 4 * s); g.lineTo(-8 * s, 9 * s); g.closePath(); g.stroke(); g.fill(); g.restore();
  bmUI();
}
let bmRaf = 0; const bmNow = () => { if (bmRaf) return; bmRaf = requestAnimationFrame(() => { bmRaf = 0; drawBig(); }); };
function bmFit() { const m = $('bmMain'), dpr = Math.min(2, devicePixelRatio || 1), W = Math.max(50, m.clientWidth), H = Math.max(50, m.clientHeight); bmc.width = Math.round(W * dpr); bmc.height = Math.round(H * dpr); return { W, H, dpr }; }
function openMap() { if (mode === 'lobby' || mode === 'dead') return; bmap.style.display = 'flex'; bmFit(); if (!bmS) buildBig(); bmMis(true); drawBig(); }
function closeMap() { bmap.style.display = 'none'; }
addEventListener('resize', () => { if (bmap.style.display === 'flex') { bmFit(); drawBig(); } });
$('mm').addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); openMap(); });
$('bmx').onclick = () => closeMap();
// ---------- zoom ----------
function bmZoom(z, px, py) { // mantém o ponto (px,py) parado na tela
  z = Math.max(BMZ0, Math.min(BMZ1, z)); if (!BG) { BMV.z = z; return; }
  if (px == null) { px = BG.W / 2; py = BG.H / 2; }
  const wx = BG.wx(px), wz = BG.wz(py); BMV.z = z; const G = bmGeo(); BMV.cx += wx - G.wx(px); BMV.cz += wz - G.wz(py); BG = bmGeo(); bmNow();
}
const tapB = (el, f) => el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); f(e); });
tapB($('bmZin'), () => bmZoom(BMV.z * 1.5)); tapB($('bmZout'), () => bmZoom(BMV.z / 1.5));
tapB($('bmDel'), () => { MK.length = 0; bmNow(); });
tapB($('bmHideM'), () => { bmap.classList.add('noM'); bmFit(); drawBig(); });
tapB($('bmOpenM'), () => { bmap.classList.remove('noM'); bmFit(); bmMis(true); drawBig(); });
// barra entre + e −: arrastar o dedo muda o zoom (em cima = perto)
(function () {
  const T_ = $('bmTrk'); let on = false;
  const set = e => { const r = T_.getBoundingClientRect(), u = 1 - Math.max(0, Math.min(1, (e.clientY - r.top - 4) / Math.max(1, r.height - 8))); bmZoom(BMZ0 * Math.pow(BMZ1 / BMZ0, u)); };
  T_.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); on = true; try { T_.setPointerCapture(e.pointerId); } catch (er) { } set(e); });
  T_.addEventListener('pointermove', e => { if (on) set(e); });
  const up = () => { on = false; }; T_.addEventListener('pointerup', up); T_.addEventListener('pointercancel', up);
})();
// ---------- toque no mapa: arrastar, pinça e marcar ----------
(function () {
  const PT = new Map(); let pan = null, pin = null, moved = false;
  const pos = e => { const r = bmc.getBoundingClientRect(), d = BG ? BG.d : 1; return [(e.clientX - r.left) * d, (e.clientY - r.top) * d]; };
  bmc.addEventListener('pointerdown', e => {
    e.preventDefault(); try { bmc.setPointerCapture(e.pointerId); } catch (er) { } PT.set(e.pointerId, pos(e));
    if (PT.size === 1) { pan = pos(e); moved = false; pin = null; }
    else if (PT.size === 2) { const [a, b] = [...PT.values()]; pin = { d0: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, z0: BMV.z }; moved = true; }
  });
  bmc.addEventListener('pointermove', e => {
    if (!PT.has(e.pointerId) || !BG) return; const p = pos(e); PT.set(e.pointerId, p);
    if (PT.size >= 2 && pin) { const [a, b] = [...PT.values()]; const dd = Math.hypot(a[0] - b[0], a[1] - b[1]); bmZoom(pin.z0 * dd / pin.d0, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); return; }
    if (PT.size === 1 && pan) { const dx = p[0] - pan[0], dy = p[1] - pan[1]; if (!moved && Math.hypot(dx, dy) < 8 * BG.d) return; moved = true; BMV.cx -= dx / BG.k; BMV.cz -= dy / BG.k; pan = p; BG = bmGeo(); bmNow(); }
  });
  const end = e => {
    if (!PT.has(e.pointerId)) return; const p = PT.get(e.pointerId); PT.delete(e.pointerId);
    if (PT.size === 0) { if (!moved && pan && e.type === 'pointerup') mark(p); pan = null; pin = null; }
    else if (PT.size === 1) { pan = [...PT.values()][0]; pin = null; }
  };
  bmc.addEventListener('pointerup', end); bmc.addEventListener('pointercancel', end);
  function mark(p) {
    if (!BG || (window.dzArenaMap && dzArenaMap())) return; const x = BG.wx(p[0]), z = BG.wz(p[1]);
    if (x < MAPB.x0 - 14 || x > MAPB.x1 + 14 || z < MAPB.z0 - 14 || z > MAPB.z1 + 14) return;
    // tocar em cima da marcação apaga; senão a marcação muda para o novo local (só uma)
    const hit = MK.find(m => Math.hypot(BG.X(m.x) - p[0], BG.Y(m.z) - 1.4 * 8 * BG.d - p[1]) < 24 * BG.d || Math.hypot(BG.X(m.x) - p[0], BG.Y(m.z) - p[1]) < 18 * BG.d);
    MK.length = 0; if (!hit) MK.push({ x, z }); try { sfx(hit ? 420 : 640, .12, .06, 0); } catch (er) { } bmNow();
  }
})();
// ---------- missões no painel ----------
let bmMisH = '';
function bmMis(force) {
  if (bmap.classList.contains('noM')) return; const L = $('bmMis').querySelector('.ls');
  let list = []; try { list = window.dzMisLive ? dzMisLive() : []; } catch (e) { }
  const h = list.length ? list.map(q => '<div class="q' + (q.done ? ' ok' : '') + '"><p>' + (q.done ? '✓ ' : '') + q.t + '</p><div class="br"><u style="width:' + Math.min(100, q.p / q.n * 100) + '%"></u></div><small>' + (q.done ? 'Concluída' : '<em>' + String(q.p).replace('.', ',') + '</em> / ' + String(q.n).replace('.', ',')) + '</small></div>').join('') : '<div class="em">Nenhuma missão disponível</div>';
  if (force || h !== bmMisH) { bmMisH = h; L.innerHTML = h; }
}
function bmUI() {
  const u = Math.log(BMV.z / BMZ0) / Math.log(BMZ1 / BMZ0), T_ = $('bmTrk'), i = T_.firstChild; i.style.top = (4 + (1 - u) * Math.max(0, T_.clientHeight - 8)) + 'px';
  $('bmDel').disabled = !MK.length; bmMis(false);
}
