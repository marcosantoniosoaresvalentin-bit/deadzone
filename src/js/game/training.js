/* Deadzone · game/training.js
 * CAMPO DE TREINO — mapa separado (ilha própria), sem nenhum texto ensinando.
 *  - Botão "Treino" no menu do lobby.
 *  - Mesas com todas as armas, acessórios, munição de todos os calibres e itens (voltam para a mesa).
 *  - Estande: alvos-silhueta a 10, 25, 50, 100, 150 e 200 m (caem ao serem atingidos e levantam sozinhos),
 *    mais um alvo que anda de um lado para o outro a 40 m. Barulho de metal no acerto (mais agudo na cabeça).
 *  - Sem zona, sem bots, sem morrer. Botão Sair volta ao lobby.
 */
(function () {
  const A = ARENAS.train; if (!A) return;
  const H0 = A.h, Z0 = A.z - A.hd, FL = Z0 + 26; // linha de tiro
  const lin_ = c => new T.Color(c).convertSRGBToLinear();
  const Mt = (c, r, m) => new T.MeshStandardMaterial({ color: lin_(c), roughness: r == null ? .8 : r, metalness: m || 0 });
  const cvT = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 4; return t; };
  const G = new T.Group(); sc.add(G);
  const box = (m, x0, y0, z0, x1, y1, z1, col) => { const me = new T.Mesh(new T.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), m); me.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); me.castShadow = me.receiveShadow = true; G.add(me); if (col) addBox({ x0, x1, z0, z1, yb: y0 - 1, yt: y1, w: 1 }); return me; };

  // ---------- chão, muros, mesas ----------
  const TFL = cvT(256, 256, (g, w, h) => { g.fillStyle = '#9b9a93'; g.fillRect(0, 0, w, h); for (let i = 0; i < 3500; i++) { const v = 120 + Math.random() * 60 | 0; g.fillStyle = 'rgba(' + v + ',' + v + ',' + (v - 5) + ',.25)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } g.strokeStyle = 'rgba(40,40,40,.3)'; g.lineWidth = 2; for (let x = 0; x <= w; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); g.beginPath(); g.moveTo(0, x); g.lineTo(w, x); g.stroke(); } });
  TFL.wrapS = TFL.wrapT = T.RepeatWrapping; TFL.repeat.set(A.hw * 2 / 8, A.hd * 2 / 8);
  { const fl = new T.Mesh(new T.PlaneGeometry(A.hw * 2 + 4, A.hd * 2 + 4), new T.MeshStandardMaterial({ map: TFL, color: lin_(0x8e8b84), roughness: .95 })); fl.rotation.x = -Math.PI / 2; fl.position.set(A.x, H0 + .03, A.z); fl.receiveShadow = true; G.add(fl); }
  const MW = Mt(0xb9b4a8, .9), MS = Mt(0x4a4f55, .5, .6), MWD = Mt(0x7a5636, .85), MY = Mt(0xe0b020, .6), MR = Mt(0x9a3a2a, .8);
  const W_ = 3.2;
  box(MW, A.x - A.hw - .3, H0, A.z - A.hd, A.x - A.hw + .3, H0 + W_, A.z + A.hd, 1); box(MW, A.x + A.hw - .3, H0, A.z - A.hd, A.x + A.hw + .3, H0 + W_, A.z + A.hd, 1);
  box(MW, A.x - A.hw, H0, A.z - A.hd - .3, A.x + A.hw, H0 + W_, A.z - A.hd + .3, 1); box(MW, A.x - A.hw, H0, A.z + A.hd - .3, A.x + A.hw, H0 + 8, A.z + A.hd + .3, 1);
  // talude de terra no fundo (atrás dos alvos)
  box(Mt(0x7a6a4c, 1), A.x - A.hw, H0, A.z + A.hd - 6, A.x + A.hw, H0 + 6, A.z + A.hd - .3, 1);
  // bancada da linha de tiro (dá para apoiar) com faixa amarela
  box(MWD, A.x - 30, H0, FL - .5, A.x + 30, H0 + 1.0, FL + .3, 1); box(MY, A.x - 30, H0 + 1.0, FL - .5, A.x + 30, H0 + 1.04, FL + .3, 0);
  for (let x = -24; x <= 24; x += 8) box(MS, A.x + x - .05, H0 + 1.04, FL - .4, A.x + x + .05, H0 + 2.2, FL - .3, 0); // divisórias das baias
  // mesas das armas (atrás da linha)
  const TB = [[-14, FL - 9], [14, FL - 9], [-14, FL - 15], [14, FL - 15]], TW = 22, TH = .95;
  for (const [x, z] of TB) { box(MWD, A.x + x - TW / 2, H0 + TH - .06, z - .7, A.x + x + TW / 2, H0 + TH, z + .7, 1); for (const sx of [-1, 1]) for (const k of [-1, 0, 1]) box(MS, A.x + x + k * TW / 2.2 - .05, H0, z + sx * .6 - .05, A.x + x + k * TW / 2.2 + .05, H0 + TH - .06, z + sx * .6 + .05, 0); }
  // coberturas para treinar (muretas e containers no meio do campo)
  for (const [x, z, w] of [[-26, FL + 34, 6], [24, FL + 60, 6], [-10, FL + 80, 4], [28, FL + 110, 8], [-28, FL + 130, 6]]) box(MW, A.x + x - w / 2, H0, A.z * 0 + z - .4, A.x + x + w / 2, H0 + 1.15, z + .4, 1);
  for (const [x, z] of [[-34, FL + 70], [34, FL + 95]]) box(MR, A.x + x - 1.22, H0, z - 3, A.x + x + 1.22, H0 + 2.6, z + 3, 1);

  // placas de distância no chão
  const sign = (x, z, txt) => { const t = cvT(256, 96, (g, w, h) => { g.fillStyle = 'rgba(0,0,0,0)'; g.clearRect(0, 0, w, h); g.fillStyle = '#f2f2ec'; g.font = 'bold 72px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + 4); }); const m = new T.Mesh(new T.PlaneGeometry(3.2, 1.2), new T.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.rotation.z = Math.PI; m.position.set(x, H0 + .05, z); G.add(m); };

  // ---------- alvos ----------
  const TT = cvT(128, 256, (g, w, h) => { g.fillStyle = '#e8e4da'; g.fillRect(0, 0, w, h); g.fillStyle = '#c0392b'; for (const [r, c] of [[52, '#c0392b'], [38, '#e8e4da'], [24, '#c0392b'], [11, '#e8e4da']]) { g.fillStyle = c; g.beginPath(); g.arc(w / 2, h * .42, r, 0, 7); g.fill(); } g.strokeStyle = '#333'; g.lineWidth = 4; g.strokeRect(2, 2, w - 4, h - 4); });
  const MT = new T.MeshStandardMaterial({ map: TT, roughness: .5, metalness: .4 }), MH = new T.MeshStandardMaterial({ color: lin_(0xe8e4da), roughness: .5, metalness: .4 });
  const TG = []; window.DZTG = TG;
  function target(x, z, mov) {
    const g = new T.Group(); g.position.set(x, H0, z); G.add(g);
    const base = new T.Mesh(new T.BoxGeometry(.9, .25, .5), MS); base.position.y = .12; g.add(base);
    const piv = new T.Group(); piv.position.y = .5; g.add(piv);
    const post = new T.Mesh(new T.BoxGeometry(.08, .5, .08), MS); post.position.y = -.25; g.add(post);
    const body = new T.Mesh(new T.BoxGeometry(.52, 1.0, .04), [MS, MS, MS, MS, MT, MS]); body.position.y = .5; piv.add(body);
    const head = new T.Mesh(new T.CylinderGeometry(.15, .15, .04, 20), MH); head.rotation.x = Math.PI / 2; head.position.y = 1.18; piv.add(head);
    piv.rotation.y = Math.PI; // a frente (com o desenho) olha para a linha de tiro
    const t = { g, piv, x, z, st: 1, t: 0, mov, ph: 0, a: 0 }; TG.push(t); return t;
  }
  const DIST = [10, 25, 50, 100, 150, 200];
  DIST.forEach((d, i) => { const x = A.x - 20 + i * 8; target(x, FL + d); sign(x, FL + d - 2.2, d + ' m'); });
  const MOV = target(A.x, FL + 40, 1); sign(A.x - 30, FL + 38, '40 m');

  // acerto: raio contra corpo (caixa) e cabeça (disco)
  function hitT(o, d, maxT) {
    let best = null, bt = maxT + .2;
    for (const t of TG) {
      if (!t.st) continue; const cx = t.g.position.x, cz = t.z, py = H0 + .5;
      // corpo
      const bx0 = cx - .26, bx1 = cx + .26, by0 = py, by1 = py + 1.0, bz0 = cz - .05, bz1 = cz + .05;
      let t0 = -1e9, t1 = 1e9, ok = true;
      for (const [o_, d_, a, b] of [[o.x, d.x, bx0, bx1], [o.y, d.y, by0, by1], [o.z, d.z, bz0, bz1]]) { if (Math.abs(d_) < 1e-6) { if (o_ < a || o_ > b) ok = false; } else { let u = (a - o_) / d_, v = (b - o_) / d_; if (u > v) [u, v] = [v, u]; t0 = Math.max(t0, u); t1 = Math.min(t1, v); } }
      if (ok && t0 <= t1 && t0 > 0 && t0 < bt) { bt = t0; best = { t, head: false }; }
      // cabeça
      const hy = py + 1.18, tz = (cz - o.z) / (d.z || 1e-6);
      if (tz > 0 && tz < bt) { const hx = o.x + d.x * tz - cx, hh = o.y + d.y * tz - hy; if (hx * hx + hh * hh < .155 * .155) { bt = tz; best = { t, head: true }; } }
    }
    return best;
  }
  function knock(t, head) {
    t.st = 0; t.t = 0;
    try { const k = Math.max(.15, 1 - Math.hypot(t.g.position.x - P.x, t.z - P.z) / 260); sfx(head ? 2400 : 1500, .5 * k, .25, typeof panOf === 'function' ? panOf(t.g.position.x, t.z) : 0); sfx(head ? 3600 : 900, .3 * k, .4, 0); } catch (e) { }
  }

  // ---------- itens nas mesas (voltam depois de pegos) ----------
  const SPOTS = [];
  function stock() {
    const L = [];
    try { for (const v of Object.keys(WVAR)) L.push([WVAR[v].t, { v }]); } catch (e) { }
    for (const c of ['a556', 'a545', 'a762', 'a9', 'a45', 'a12', 'a50']) { L.push(['ammo', { cal: c }]); L.push(['ammo', { cal: c }]); }
    for (const t of ['scope1', 'scope2', 'scope8', 'sil', 'med', 'med', 'bandage', 'bandage', 'gren', 'gren', 'smoke', 'shield', 'bp3']) L.push([t, null]);
    L.push(['helm', { d: 100 }]); L.push(['vest', { d: 100 }]);
    const per = Math.ceil(L.length / TB.length);
    L.forEach((it, i) => { const tb = TB[Math.floor(i / per)], k = i % per, x = A.x + tb[0] - TW / 2 + 1 + k * (TW - 2) / Math.max(1, per - 1); SPOTS.push({ t: it[0], am: it[1], x, z: tb[1], o: null, gone: 0 }); });
  }
  function put(s) { try { mkLoot.y = H0 + TH + .05; mkLoot(s.t, s.x, s.z, s.am ? Object.assign({}, s.am) : null, 1, 0); mkLoot.y = undefined; s.o = loot[loot.length - 1]; s.gone = 0; } catch (e) { mkLoot.y = undefined; } }

  // ---------- começar / sair ----------
  const css = document.createElement('style'); css.textContent =
    'body.dztrain #dzAK,body.dztrain #dzZn,body.dztrain #dzzone,body.dztrain #dzTeam,body.dztrain #dzShopB{display:none!important}' +
    '#dzTrX{position:fixed;right:max(12px,env(safe-area-inset-right));top:max(52px,env(safe-area-inset-top));z-index:30;display:none;background:rgba(20,26,32,.75);color:#fff;border:1px solid rgba(255,255,255,.3);border-radius:8px;padding:8px 14px;font:800 13px system-ui}' +
    '#dz43 .menu button[data-m="train"] span{filter:none}';
  document.head.appendChild(css);
  const X = document.createElement('button'); X.id = 'dzTrX'; X.textContent = 'Sair'; document.body.appendChild(X);
  X.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); try { goLobby(); } catch (er) { location.reload(); } });
  function start() {
    if (window.DZTRAIN) return; window.DZTRAIN = 1;
    const fw = window.__dzForceW; window.__dzForceW = 'dia';
    try { startGame(); } catch (e) { console.warn('treino', e); }
    window.__dzForceW = fw;
    try { plane.visible = false; canopy.visible = false; } catch (e) { }
    sched.length = 0; for (const b of bots) { b.dead = 1; b.g.visible = false; }
    alive = 2; mode = 'ground'; pl.visible = true; P.x = A.x; P.z = FL - 5; P.y = GY(P.x, P.z, H0 + 3); P.vy = 0; yaw = 0; pit = .05;
    try { setLabel(); } catch (e) { } window.DZAR_ON = 1;
    document.body.classList.add('dztrain'); X.style.display = 'block';
    if (!SPOTS.length) stock(); for (const s of SPOTS) if (!s.o || !loot.includes(s.o)) put(s);
  }
  window.dzTraining = start;
  // botão no menu do lobby
  const addBtn = () => { const m = document.querySelector('#dz43 .menu'); if (!m || m.querySelector('[data-m="train"]')) return; const b = document.createElement('button'); b.dataset.m = 'train'; b.innerHTML = '<span>🎯</span>Treino'; m.appendChild(b); };
  setInterval(addBtn, 800); addBtn();
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('#dz43 .menu button[data-m="train"]'); if (b) { e.stopPropagation(); e.preventDefault(); start(); } }, true);

  // ---------- quadro a quadro ----------
  let lastT = 0, rT = 0;
  const _lb = window.loopBody;
  window.loopBody = function (t) {
    const dt = Math.min(.05, (t - lastT) / 1000 || 0); lastT = t; _lb(t);
    if (!window.DZTRAIN || mode === 'lobby') return;
    try {
      hp = 100; alive = 2; try { zw.visible = false; } catch (e) { } if (mode === 'dead') { mode = 'ground'; pl.visible = true; }
      sched.length = 0; for (const b of bots) if (!b.dead) { b.dead = 1; b.g.visible = false; }
      for (const T_ of TG) {
        if (T_.mov) { T_.ph += dt * .45; T_.g.position.x = A.x + Math.sin(T_.ph) * 22; }
        if (T_.st) T_.a = Math.max(0, T_.a - dt * 5); else { T_.t += dt; T_.a = Math.min(1, T_.a + dt * 7); if (T_.t > 2.5) T_.st = 1; }
        T_.piv.rotation.x = T_.a * 1.45;
      }
      rT += dt; if (rT > 1) { rT = 0; const now = performance.now(); for (const s of SPOTS) { if (s.o && !loot.includes(s.o)) { if (!s.gone) s.gone = now; else if (now - s.gone > 4000) put(s); } } }
    } catch (e) { }
  };
  window.addEventListener('load', () => {
    if (!window.DZW) return;
    const _s = DZW.shoot; DZW.shoot = function (o, d, maxT) { const r = _s ? _s.apply(this, arguments) : undefined; try { if (window.DZTRAIN) { const h = hitT(o, d, maxT || 400); if (h) { knock(h.t, h.head); try { hitFx(h.t.g.position.x, H0 + 1.2, h.t.z, 30, h.head, false); } catch (e) { } } } } catch (e) { } return r; };
    const _b = DZW.blast; DZW.blast = function (x, y, z, rr) { const r = _b ? _b.apply(this, arguments) : undefined; try { if (window.DZTRAIN) for (const t of TG) if (t.st && Math.hypot(t.g.position.x - x, t.z - z) < Math.max(4, rr)) knock(t, false); } catch (e) { } return r; };
  });
})();
