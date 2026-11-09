/* Deadzone · game/airdrop.js
 * CAIXA DE SUPRIMENTOS (airdrop) na partida clássica.
 * - Um avião de carga cruza o céu e solta uma caixa de paraquedas dentro da zona segura.
 * - A caixa desce devagar, solta fumaça vermelha ao tocar o chão e aparece no mapa.
 * - Conteúdo raro: uma arma forte + munição, luneta, capacete, colete, kits.
 * - Bots inimigos por perto vão atrás dela. Quem chega primeiro toca em "Abrir".
 * - Online: o anfitrião decide; todos veem o mesmo avião e a mesma caixa; só quem abre pega.
 */
(function () {
  const FIRST = 120, EVERY = 150, MAXN = 4, ALT = 290, FALL = 10, PSPD = 70, PDIST = 900;
  const DROPS = []; window.DZDROPS = DROPS;
  let T0 = null, nextAt = FIRST, count = 0, seq = 0;
  const online = () => { try { return typeof N !== 'undefined' && N && N.mode === 'classic'; } catch (e) { return false; } };
  const isHost = () => { try { return !online() || N.host; } catch (e) { return true; } };
  const teamMode = () => { try { return !!MP; } catch (e) { return false; } };
  const send = m => { try { if (online()) { m.t = 'ad'; gp(m, 1); } } catch (e) { } };

  // ---------- modelos ----------
  const cv = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.anisotropy = 4; return t; };
  const TX_SIDE = cv(256, 192, (g, w, h) => {
    g.fillStyle = '#23344f'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2d4266'; for (let i = 0; i < 6; i++) g.fillRect(8 + i * 41, 10, 34, h - 20);
    g.fillStyle = '#c8322b'; g.fillRect(0, h * .42, w, h * .17);
    g.fillStyle = '#fff'; g.font = 'bold 24px system-ui'; g.textAlign = 'center'; g.fillText('SUPRIMENTOS', w / 2, h * .555);
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 3; g.strokeRect(2, 2, w - 4, h - 4);
  });
  const TX_TOP = cv(128, 128, (g, w, h) => { g.fillStyle = '#c8322b'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.fillRect(w * .4, h * .12, w * .2, h * .76); g.fillRect(w * .12, h * .4, w * .76, h * .2); g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 4; g.strokeRect(2, 2, w - 4, h - 4); });
  const TX_CH = cv(256, 32, (g, w, h) => { for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? '#f2f2ee' : '#d23a2e'; g.fillRect(i * w / 12, 0, w / 12 + 1, h); } });
  const MS = new T.MeshLambertMaterial({ map: TX_SIDE }), MT = new T.MeshLambertMaterial({ map: TX_TOP }), MF = new T.MeshLambertMaterial({ color: 0xd9dcd6 }), MD = new T.MeshLambertMaterial({ color: 0x1a2232 });
  function crate() {
    const g = new T.Group();
    const body = new T.Mesh(new T.BoxGeometry(1.3, .95, 1.3), [MS, MS, MD, MD, MS, MS]); body.position.y = .5; g.add(body);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const p = new T.Mesh(new T.BoxGeometry(.1, 1.02, .1), MF); p.position.set(sx * .63, .51, sz * .63); g.add(p); }
    for (const y of [.04, .98]) for (const r of [0, 1]) { const b = new T.Mesh(new T.BoxGeometry(r ? .1 : 1.36, .08, r ? 1.36 : .1), MF); for (const s of [-1, 1]) { const q = b.clone(); q.position.set(r ? s * .63 : 0, y, r ? 0 : s * .63); g.add(q); } }
    const lid = new T.Group(); lid.position.set(0, 1.02, -.66); g.add(lid);
    const lt = new T.Mesh(new T.BoxGeometry(1.4, .09, 1.4), [MD, MD, MT, MD, MD, MD]); lt.position.set(0, 0, .66); lid.add(lt);
    g.userData.lid = lid;
    // paraquedas listrado + cordas
    const ch = new T.Group(); ch.position.y = 1.05;
    const dome = new T.Mesh(new T.SphereGeometry(3.4, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2.4), new T.MeshLambertMaterial({ map: TX_CH, side: T.DoubleSide })); dome.position.y = 5.2; dome.scale.y = .55; ch.add(dome);
    const lp = []; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; lp.push(new T.Vector3(0, 0, 0), new T.Vector3(Math.cos(a) * 3.1, 5.6, Math.sin(a) * 3.1)); }
    ch.add(new T.LineSegments(new T.BufferGeometry().setFromPoints(lp), new T.LineBasicMaterial({ color: 0x333333 })));
    g.add(ch); g.userData.ch = ch;
    return g;
  }
  // fumaça vermelha subindo em coluna
  const SMM = []; for (let i = 0; i < 3; i++) SMM.push(new T.MeshBasicMaterial({ color: [0xd8352a, 0xe2493b, 0xb82a22][i], transparent: true, opacity: .7, depthWrite: false }));
  function smoke(D) {
    const g = new T.Group(); g.position.set(D.x + .9, D.y, D.z + .4); const ps = [];
    for (let i = 0; i < 34; i++) { const m = new T.Mesh(SMG, SMM[i % 3].clone()); m.userData = { ph: i / 34, ox: (Math.random() - .5) * 1.2, oz: (Math.random() - .5) * 1.2 }; g.add(m); ps.push(m); }
    sc.add(g); D.smk = { g, ps, a: 0 };
  }
  function smokeTick(D, dt) {
    const S = D.smk; if (!S) return; S.a += dt; const fade = D.opened ? Math.max(0, 1 - (D.ot || 0) / 25) : 1;
    for (const m of S.ps) { const u = m.userData; const k = (u.ph + S.a / 9) % 1; m.position.set(u.ox + Math.sin(k * 9 + u.ph * 7) * .6 + k * 3, .4 + k * 26, u.oz + k * 1.5); m.scale.setScalar(.5 + k * 2.4 + Math.sin(u.ph * 40) * .2); m.material.opacity = .42 * Math.min(1, k * 6) * (1 - k) * fade; }
    if (fade <= 0) { sc.remove(S.g); D.smk = null; }
  }

  // ---------- conteúdo ----------
  const RARE = ['sniper_material_west', 'rifle_battle_west', 'shotgun_auto_west', 'sniper_rifle_west'];
  function roll() {
    const v = RARE[Math.floor(Math.random() * RARE.length)];
    const it = ['helm', 'vest', 'med', 'med', Math.random() < .5 ? 'scope8' : 'scope2', Math.random() < .5 ? 'sil' : 'gren', Math.random() < .4 ? 'shield' : 'bandage'];
    return { v, it };
  }
  function spill(D) {
    try {
      const pos = []; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; pos.push([D.x + Math.cos(a) * 1.35, D.z + Math.sin(a) * 1.35]); }
      let k = 0; const at = (t, am, lv) => { const p = pos[k++ % pos.length]; mkLoot.y = D.y + .6; mkLoot(t, p[0], p[1], am || null, lv || 0, 0); mkLoot.y = undefined; };
      const Wd = WVAR[D.c.v]; if (Wd) { at(Wd.t, { v: D.c.v }, 1); const cal = calOf({ t: Wd.t, v: D.c.v }); if (cal) { at('ammo', { cal }); at('ammo', { cal }); } }
      for (const t of D.c.it) at(t, t === 'helm' || t === 'vest' ? { d: 100 } : null, 0);
    } catch (e) { console.warn('airdrop', e); }
  }

  // ---------- ciclo ----------
  function pickSpot() {
    for (let i = 0; i < 60; i++) {
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * zR * .6, x = zX + Math.cos(a) * r, z = zZ + Math.sin(a) * r;
      const th = TERH(x, z); if (th < .6) continue;
      if (Math.abs(GY(x, z, 400) - th) > .4) continue;          // não cai em telhado
      try { if (typeof sqFree === 'function' && !sqFree(x, z, 2.2)) continue; } catch (e) { }
      return { x, z };
    }
    return null;
  }
  function start(o) {
    if (DROPS.some(d => d.id === o.id)) return;
    const pl_ = plane.clone(true); pl_.visible = true; pl_.rotation.y = o.h; sc.add(pl_);
    const dx = Math.sin(o.h), dz = Math.cos(o.h);
    const D = { id: o.id, x: o.x, z: o.z, y: GY(o.x, o.z, 400), h: o.h, dx, dz, c: o.c, pl: pl_, pt: 0, st: 'plane', cy: ALT, opened: false, box: null };
    D.g = crate(); D.g.visible = false; sc.add(D.g);
    DROPS.push(D);
    say('Caixa de suprimentos a caminho! Veja no mapa', 3); try { sfx(330, .35, .4, 0); setTimeout(() => sfx(440, .35, .4, 0), 250); } catch (e) { }
  }
  function land(D) {
    D.st = 'ground'; D.g.position.y = D.y; D.g.userData.ch.visible = false; smoke(D);
    try { sfx(120, .5 * Math.max(0, 1 - Math.hypot(D.x - P.x, D.z - P.z) / 200), .3, 0); } catch (e) { }
    try { D.box = addBox({ x0: D.x - .7, x1: D.x + .7, z0: D.z - .7, z1: D.z + .7, yb: D.y - 1, yt: D.y + 1.05, w: 1 }); } catch (e) { }
    // bots inimigos por perto correm para a caixa
    if (isHost()) try { for (const b of bots) { if (b.dead || b.air || b.team === 1 || b.kn) continue; if (Math.hypot(b.x - D.x, b.z - D.z) < 260 && Math.random() < .45) { b.tx = D.x + (Math.random() - .5) * 6; b.tz = D.z + (Math.random() - .5) * 6; b.wt = 40; } } } catch (e) { }
  }
  function open(D, mine) {
    if (D.opened) return; D.opened = true; D.ot = 0; D.lidT = 0;
    if (mine) { spill(D); say('Caixa aberta! Pegue os itens no chão', 2); send({ a: 'o', id: D.id }); }
    try { sfx(520, .3 * Math.max(.1, 1 - Math.hypot(D.x - P.x, D.z - P.z) / 60), .2, 0); } catch (e) { }
  }
  function removeAll() {
    for (const D of DROPS) { sc.remove(D.g); sc.remove(D.pl); if (D.smk) sc.remove(D.smk.g); if (D.box) { D.box.off = 1; try { const i = box.indexOf(D.box); if (i >= 0) box.splice(i, 1); for (const a of GRD.values()) { const j = a.indexOf(D.box); if (j >= 0) a.splice(j, 1); } } catch (e) { } } }
    DROPS.length = 0;
  }
  window.dzAirdrop = { force: () => { const s = pickSpot(); if (!s) return null; const o = { id: 'd' + (++seq) + '_' + (Date.now() % 1e5), x: +s.x.toFixed(1), z: +s.z.toFixed(1), h: +(Math.random() * 6.283).toFixed(3), c: roll() }; start(o); send(Object.assign({ a: 'd' }, o)); return o; }, open: D => open(D, true) };

  // anfitrião / offline: agenda as quedas
  setInterval(() => {
    if (mode === 'lobby' || teamMode()) { if (mode === 'lobby' && DROPS.length) removeAll(); if (mode === 'lobby') { T0 = null; count = 0; nextAt = FIRST; } return; }
    if (T0 == null) { if (mode === 'ground' || mode === 'chute' || mode === 'sky' || mode === 'drive' || mode === 'dead') T0 = performance.now() / 1000; return; }
    if (!isHost() || count >= MAXN) return;
    try { if (alive <= 3) return; } catch (e) { }
    if (performance.now() / 1000 - T0 >= nextAt) { count++; nextAt += EVERY; window.dzAirdrop.force(); }
  }, 1000);

  // rede
  function rx(m) {
    if (mode === 'lobby' || teamMode()) return;
    if (m.a === 'd') start(m);
    else if (m.a === 'o') { const D = DROPS.find(d => d.id === m.id); if (D) open(D, false); }
  }
  window.addEventListener('load', () => {
    try { const _r = clRx; clRx = function (m) { if (m && m.t === 'ad') { rx(m); return; } return _r.apply(this, arguments); }; } catch (e) { }
    // marcador no minimapa e no mapa grande (junto com os carrinhos da loja)
    const drawBox = (g2, x, y, s, fall) => { g2.save(); g2.translate(x, y); g2.fillStyle = '#d23a2e'; g2.strokeStyle = '#fff'; g2.lineWidth = 1.5; g2.beginPath(); g2.arc(0, 0, 8.5 * s, 0, 7); g2.fill(); g2.stroke(); g2.fillStyle = '#fff'; g2.fillRect(-4 * s, -2 * s, 8 * s, 6 * s); g2.fillStyle = '#d23a2e'; g2.fillRect(-4 * s, 0, 8 * s, 1.2 * s); if (fall) { g2.strokeStyle = '#fff'; g2.lineWidth = 1.2 * s; g2.beginPath(); g2.arc(0, -3 * s, 4 * s, Math.PI, 0); g2.stroke(); } g2.restore(); };
    const _mm = window.dzMMExtra; window.dzMMExtra = function (mx, X, Z, ra) { try { if (_mm) _mm.apply(this, arguments); } catch (e) { } for (const D of DROPS) { if (D.opened && D.ot > 60) continue; const px = X(D.x), pz = Z(D.z); if (Math.abs(px) > 140 || Math.abs(pz) > 140) continue; mx.save(); mx.translate(px, pz); mx.rotate(ra); drawBox(mx, 0, 0, 1, D.st !== 'ground'); mx.restore(); } };
    const _wm = window.dzWMExtra; window.dzWMExtra = function (g2, X, Y, d) { try { if (_wm) _wm.apply(this, arguments); } catch (e) { } for (const D of DROPS) { if (D.opened && D.ot > 60) continue; drawBox(g2, X(D.x), Y(D.z), d * 1.2, D.st !== 'ground'); } };
  });

  // botão "Abrir"
  const bO = document.createElement('div'); bO.id = 'dzAdB';
  bO.style.cssText = 'position:fixed;right:200px;bottom:110px;z-index:6;display:none;width:74px;height:74px;border-radius:50%;border:2px solid rgba(255,190,170,.9);background:rgba(170,40,30,.85);color:#fff;font:800 11px system-ui;align-items:center;justify-content:center;flex-direction:column;user-select:none;-webkit-user-select:none;touch-action:none';
  bO.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26"><rect x="3" y="9" width="18" height="12" rx="1" fill="#fff"/><path d="M2 6l10-3 10 3v3H2z" fill="#fff" opacity=".8"/><rect x="10" y="12" width="4" height="4" fill="#c8322b"/></svg>Abrir'; document.body.appendChild(bO);
  let nearD = null;
  bO.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if (nearD && !nearD.opened && !(window.dzKnocked && dzKnocked())) open(nearD, true); });
  setInterval(() => {
    nearD = null; if (mode === 'ground' && !(window.dzKnocked && dzKnocked())) for (const D of DROPS) if (D.st === 'ground' && !D.opened && Math.hypot(D.x - P.x, D.z - P.z) < 2.8 && Math.abs(D.y - P.y) < 2) nearD = D;
    bO.style.display = nearD ? 'flex' : 'none';
  }, 200);

  // ---------- quadro a quadro ----------
  let lastT = 0;
  const _lb = window.loopBody;
  window.loopBody = function (t) {
    const dt = Math.min(.05, (t - lastT) / 1000 || 0); lastT = t; _lb(t);
    for (let i = DROPS.length - 1; i >= 0; i--) {
      const D = DROPS[i];
      if (D.pl) {
        D.pt += dt; const s = D.pt * PSPD - PDIST; D.pl.position.set(D.x + D.dx * s, ALT + 10, D.z + D.dz * s);
        try { D.pl.traverse(o => { if (o.userData && o.userData.prop) o.rotation.z += dt * 45; }); } catch (e) { }
        if (D.st === 'plane' && s >= 0) { D.st = 'fall'; D.cy = ALT; D.g.visible = true; D.ft = 0; }
        if (s > PDIST) { sc.remove(D.pl); D.pl = null; }
      }
      if (D.st === 'fall') {
        D.ft += dt; const v = D.ft < 1.2 ? 30 : FALL; D.cy = Math.max(D.y, D.cy - v * dt);
        const ch = D.g.userData.ch; ch.scale.setScalar(Math.min(1, .15 + D.ft / 1.2));
        D.g.position.set(D.x, D.cy, D.z); D.g.rotation.z = Math.sin(D.ft * 1.3) * .06; D.g.rotation.x = Math.cos(D.ft * 1.1) * .05;
        if (D.cy <= D.y + .01) { D.g.rotation.set(0, D.g.rotation.y, 0); land(D); }
      }
      if (D.st === 'ground') {
        smokeTick(D, dt);
        if (D.opened) { D.ot += dt; D.lidT = Math.min(1, (D.lidT || 0) + dt * 2.5); const lid = D.g.userData.lid; lid.rotation.x = -1.9 * D.lidT * (2 - D.lidT); }
      }
    }
  };
  // marca as hélices do avião clonado (as do original giram pela lista "props")
  try { for (const p of props) p.userData.prop = 1; } catch (e) { }
})();
