/* Deadzone · world/arenas.js
 * MAPAS PEQUENOS dos modos de equipe (cada um numa ilhazinha própria, ao sul da Zênite):
 *  - DUELO → "Pátio de Containers": pátio comprido de concreto com pilhas de containers de proteção.
 *  - MATA-MATA EM EQUIPE → "Armazéns do Porto": praça de ~120×120 m com 2 armazéns, containers,
 *    muretas e caixotes, cercada por muro (ninguém cai no mar).
 * Os modos continuam com a mesma lógica online; só passam a acontecer sempre nesses mapas
 * (os dois aparelhos rodam o mesmo código, então ficam iguais).
 */
(function () {
  if (typeof ARENAS === 'undefined') return;
  const Mt = (c, r, m) => new T.MeshStandardMaterial({ color: lin(c), roughness: r == null ? .8 : r, metalness: m || 0 });
  // textura de container (chapa ondulada) e de concreto
  const cv = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 4; t.encoding = T.sRGBEncoding; return t; };
  const TCON = cv(128, 128, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 8) { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x, 0, 3, h); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x + 4, 0, 1, h); } for (let i = 0; i < 300; i++) { g.fillStyle = 'rgba(80,40,10,' + Math.random() * .12 + ')'; g.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 5, 1 + Math.random() * 3); } });
  const TCONC = cv(256, 256, (g, w, h) => { g.fillStyle = '#9a9890'; g.fillRect(0, 0, w, h); for (let i = 0; i < 4000; i++) { const v = 120 + Math.random() * 60 | 0; g.fillStyle = 'rgba(' + v + ',' + v + ',' + (v - 6) + ',.25)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } g.strokeStyle = 'rgba(40,40,40,.35)'; g.lineWidth = 2; for (let x = 0; x <= w; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); g.beginPath(); g.moveTo(0, x); g.lineTo(w, x); g.stroke(); } });
  const conM = c => { const m = new T.MeshStandardMaterial({ map: TCON, color: lin(c), roughness: .7, metalness: .35 }); return m; };
  const MCON = [conM(0xb5402c), conM(0x2f6aa3), conM(0x3f7d45), conM(0xd08a2a), conM(0x8a8f96), conM(0x6b3a7a)];
  const MCONC = new T.MeshStandardMaterial({ map: TCONC, color: lin(0xd8d6ce), roughness: .95 });
  const MWALL = Mt(0xb9b4a8, .9), MWALL2 = Mt(0x8e8a80, .9), MWOOD = Mt(0x8a6239, .85), MSTEEL = Mt(0x4a4f55, .5, .6), MROOF = Mt(0x5d6a72, .6, .5), MYEL = Mt(0xe0b020, .6), MBARREL = Mt(0x2f5a8a, .5, .3);
  const ADD = [];
  function bx(m, x0, y0, z0, x1, y1, z1, rep) {
    const g = new T.BoxGeometry(x1 - x0, y1 - y0, z1 - z0);
    if (rep) { const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * Math.max(x1 - x0, z1 - z0) / rep, uv.getY(i) * (y1 - y0) / rep); }
    const me = new T.Mesh(g, m); me.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); me.castShadow = true; me.receiveShadow = true; me.matrixAutoUpdate = false; me.updateMatrix(); sc.add(me); ADD.push(me); return me;
  }
  const col = (x0, z0, x1, z1, yb, yt) => addBox({ x0: Math.min(x0, x1), x1: Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1), yb, yt, w: 1 });
  // container 2,44 × 2,6 × 6,06 m (ao longo de x ou z); empilha com "lv"
  function cont(x, z, alongX, H0, lv, ci) {
    const L = 6.06, W = 2.44, Hc = 2.6, y0 = H0 + lv * Hc, hx = alongX ? L / 2 : W / 2, hz = alongX ? W / 2 : L / 2;
    bx(MCON[ci % MCON.length], x - hx, y0, z - hz, x + hx, y0 + Hc, z + hz, 2.6);
    bx(MSTEEL, x - hx - .02, y0 + Hc - .08, z - hz - .02, x + hx + .02, y0 + Hc, z + hz + .02);
    col(x - hx, z - hz, x + hx, z + hz, y0 - 1, y0 + Hc);
  }
  function crate(x, z, H0, s) { bx(MWOOD, x - s / 2, H0, z - s / 2, x + s / 2, H0 + s, z + s / 2, 1.2); col(x - s / 2, z - s / 2, x + s / 2, z + s / 2, H0 - 1, H0 + s); }
  function barrel(x, z, H0) { const g = new T.CylinderGeometry(.33, .33, .9, 12), me = new T.Mesh(g, MBARREL); me.position.set(x, H0 + .45, z); me.castShadow = true; me.matrixAutoUpdate = false; me.updateMatrix(); sc.add(me); col(x - .33, z - .33, x + .33, z + .33, H0 - 1, H0 + .9); }
  function wall(x0, z0, x1, z1, H0, h, m) { const t = .3, ax = Math.abs(x1 - x0) > Math.abs(z1 - z0); if (ax) { bx(m || MWALL, Math.min(x0, x1), H0, z0 - t, Math.max(x0, x1), H0 + h, z0 + t, 3); col(x0, z0 - t, x1, z0 + t, H0 - 1, H0 + h); } else { bx(m || MWALL, x0 - t, H0, Math.min(z0, z1), x0 + t, H0 + h, Math.max(z0, z1), 3); col(x0 - t, z0, x0 + t, z1, H0 - 1, H0 + h); } }
  function pad(A, H0) { // piso de concreto do mapa (rente ao chão)
    const g = new T.PlaneGeometry(A.hw * 2 + 6, A.hd * 2 + 6); g.rotateX(-Math.PI / 2); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (A.hw * 2 + 6) / 8, uv.getY(i) * (A.hd * 2 + 6) / 8);
    try { RDS.push([A.x - A.hw - 3, A.z - A.hd - 3, A.x + A.hw + 3, A.z + A.hd + 3]); } catch (e) { } // sem tufos de grama no concreto
    const me = new T.Mesh(g, MCONC); me.position.set(A.x, H0 + .03, A.z); me.receiveShadow = true; me.matrixAutoUpdate = false; me.updateMatrix(); sc.add(me);
  }
  // galpão / armazém: casca com portões abertos nas pontas (dá para entrar e atravessar)
  function warehouse(x, z, w, d, H0, h, alongX) {
    const hw = w / 2, hd = d / 2, gate = alongX ? hd * .55 : hw * .55;
    if (alongX) { // portões nas paredes de x0 e x1
      wall(x - hw, z - hd, x + hw, z - hd, H0, h, MWALL2); wall(x - hw, z + hd, x + hw, z + hd, H0, h, MWALL2);
      for (const sx of [-1, 1]) { wall(x + sx * hw, z - hd, x + sx * hw, z - gate, H0, h, MWALL2); wall(x + sx * hw, z + gate, x + sx * hw, z + hd, H0, h, MWALL2); bx(MWALL2, x + sx * hw - .3, H0 + 3.6, z - gate, x + sx * hw + .3, H0 + h, z + gate); }
    } else {
      wall(x - hw, z - hd, x - hw, z + hd, H0, h, MWALL2); wall(x + hw, z - hd, x + hw, z + hd, H0, h, MWALL2);
      for (const sz of [-1, 1]) { wall(x - hw, z + sz * hd, x - gate, z + sz * hd, H0, h, MWALL2); wall(x + gate, z + sz * hd, x + hw, z + sz * hd, H0, h, MWALL2); bx(MWALL2, x - gate, H0 + 3.6, z + sz * hd - .3, x + gate, H0 + h, z + sz * hd + .3); }
    }
    bx(MROOF, x - hw - .3, H0 + h, z - hd - .3, x + hw + .3, H0 + h + .25, z + hd + .3);
    try { (window.DZCEIL || []).push({ x0: x - hw, x1: x + hw, z0: z - hd, z1: z + hd, y: H0 + h }); } catch (e) { }
    // caixotes e prateleiras dentro (proteção)
    crate(x - hw * .4, z - hd * .3, H0, 1.4); crate(x + hw * .35, z + hd * .3, H0, 1.4); crate(x + hw * .35 + 1.4, z + hd * .3, H0, 1.4);
    if (alongX) { cont(x, z - hd * .45, true, H0, 0, 4); } else { cont(x - hw * .45, z, false, H0, 0, 4); }
  }

  // ======================= DUELO: PÁTIO DE CONTAINERS =======================
  { const A = ARENAS.duel, H0 = TERH(A.x, A.z); pad(A, H0);
    // cerca alta em volta
    for (const sx of [-1, 1]) wall(A.x + sx * A.hw, A.z - A.hd, A.x + sx * A.hw, A.z + A.hd, H0, 3.2, MSTEEL);
    for (const sz of [-1, 1]) wall(A.x - A.hw, A.z + sz * A.hd, A.x + A.hw, A.z + sz * A.hd, H0, 3.2, MSTEEL);
    // proteções simétricas (cada lado igual)
    for (const s of [-1, 1]) {
      cont(A.x - 4.2, A.z + s * 15, false, H0, 0, 0); cont(A.x + 4.4, A.z + s * 8.5, false, H0, 0, 1);
      crate(A.x + 1.2, A.z + s * 17.5, H0, 1.2); crate(A.x - 1, A.z + s * 11, H0, 1.2); barrel(A.x + 4.5, A.z + s * 15.5, H0);
    }
    cont(A.x - 3.5, A.z, true, H0, 0, 2); cont(A.x + 3.8, A.z + .2, true, H0, 0, 3); cont(A.x + 3.8, A.z + .2, true, H0, 1, 5);
    // guindaste de pórtico (visual)
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) bx(MYEL, A.x + sx * 12.5 - .3, H0, A.z + sz * 3 - .3, A.x + sx * 12.5 + .3, H0 + 12, A.z + sz * 3 + .3);
    bx(MYEL, A.x - 13, H0 + 11.5, A.z - 3.4, A.x + 13, H0 + 12.5, A.z + 3.4);
  }
  // ======================= MATA-MATA: ARMAZÉNS DO PORTO =======================
  { const A = ARENAS.tdm, H0 = TERH(A.x, A.z); pad(A, H0);
    // muro em volta (com guaritas visuais nos cantos)
    for (const sx of [-1, 1]) wall(A.x + sx * A.hw, A.z - A.hd, A.x + sx * A.hw, A.z + A.hd, H0, 3.4);
    for (const sz of [-1, 1]) wall(A.x - A.hw, A.z + sz * A.hd, A.x + A.hw, A.z + sz * A.hd, H0, 3.4);
    // dois armazéns no meio (lados opostos), containers e muretas espalhados de forma espelhada
    warehouse(A.x - 18, A.z, 16, 24, H0, 6.5, false); warehouse(A.x + 18, A.z, 16, 24, H0, 6.5, false);
    const L = [[-40, 30, 1, 0, 0], [-40, 30, 1, 1, 1], [-24, 34, 0, 0, 2], [-5, 26, 1, 0, 3], [10, 38, 0, 0, 0], [30, 30, 1, 0, 5], [44, 22, 0, 0, 1], [44, 22, 0, 1, 3], [0, 12, 1, 0, 4], [-48, 6, 0, 0, 2], [52, -4, 0, 0, 0], [26, 14, 1, 0, 1]];
    for (const s of [-1, 1]) for (const [x, z, ax, lv, c] of L) cont(A.x + x * s, A.z + z * s, !!ax, H0, lv, c + (s > 0 ? 0 : 1));
    for (const s of [-1, 1]) { for (const [x, z] of [[-30, 14], [16, 22], [-12, 40], [36, 44], [0, -2]]) crate(A.x + x * s, A.z + z * s, H0, 1.3);
      wall(A.x - 8 * s, A.z + 48 * s, A.x + 8 * s, A.z + 48 * s, H0, 1.1); wall(A.x + 28 * s, A.z + 5 * s, A.x + 28 * s, A.z + 15 * s, H0, 1.1);
      for (const [x, z] of [[-20, 47], [22, 47], [-52, 30]]) barrel(A.x + x * s, A.z + z * s, H0); }
  }
  // essas peças são paradas: não recalculam posição a cada quadro
  for (const m of ADD) m.matrixAutoUpdate = false;

  // ======================= os modos vão sempre para o seu mapa =======================
  const CDUEL = { n: ARENAS.duel.n, x: ARENAS.duel.x - BP, z: ARENAS.duel.z, t: 'arena', blank: 1 }, CTDM = { n: ARENAS.tdm.n, x: ARENAS.tdm.x, z: ARENAS.tdm.z, t: 'arena', blank: 1 };
  const withC = (c, f) => { CITIES.unshift(c); try { return f(); } finally { const i = CITIES.indexOf(c); if (i >= 0) CITIES.splice(i, 1); } };
  if (typeof window.startMatch === 'function') { const o = window.startMatch; window.startMatch = function () { const a = arguments, th = this; try { mpCity = CDUEL.n; } catch (e) { } return withC(CDUEL, () => o.apply(th, a)); }; }
  if (typeof window.sqStart === 'function') { const o = window.sqStart; window.sqStart = function (ids, mid, seed, city) { const th = this; return withC(CTDM, () => o.call(th, ids, mid, seed, CTDM.n)); }; }
  // pontos de nascimento das equipes: dentro do mapa, um de cada lado (sempre iguais nos dois aparelhos)
  if (typeof window.sqPads === 'function') { const o = window.sqPads; window.sqPads = function (cx, cz, rnd) { if (Math.abs(cx - ARENAS.tdm.x) < 1 && Math.abs(cz - ARENAS.tdm.z) < 1) { rnd(); return [[cx, cz - 52], [cx, cz + 52]]; } return o.apply(this, arguments); }; }
  window.DZARENAS = { duel: CDUEL, tdm: CTDM };
})();
