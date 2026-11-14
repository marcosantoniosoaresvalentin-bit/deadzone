/* Deadzone · world/shield.js
 * ESCUDO DE CAMPO (vai na mochila, não se usa na mão):
 *  - Usar: o personagem se agacha e monta o escudo no chão, na frente dele, EM ETAPAS:
 *      1) sobe a placa do meio (com visor para enxergar);
 *      2) abrem as primeiras placas laterais (uma de cada lado);
 *      3) abrem as placas da ponta (mais uma de cada lado).
 *    Cada placa lateral é feita de "escamas" de aço sobrepostas. Aberto: ~5 m de largura, curvado para frente.
 *  - Segura tiro (os bots não conseguem atirar através) e ninguém passa por ele.
 *  - Perto dele aparece "Recolher": fecha em etapas e volta para a mochila (pode montar de novo depois).
 */
(function () {
  const PW = .9, PH = 1.55, TH = .05;                       // largura e altura de cada placa (alto o bastante para se agachar atrás)
  const WC = 1.04, WH = .34, WW = PW * .62, WB = WC - WH / 2, WT = WC + WH / 2; // janela de tiro na altura do olho agachado
  const Mt = (o) => new T.MeshStandardMaterial(o);
  // textura de aço gasto com rebites, emendas e faixa de aviso embaixo
  const cvT = (f) => { const c = document.createElement('canvas'); c.width = 256; c.height = 320; f(c.getContext('2d'), 256, 320); const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 4; return t; };
  const STEELT = cvT((g, w, h) => {
    g.fillStyle = '#5d6469'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) { const v = 70 + Math.random() * 60 | 0; g.fillStyle = 'rgba(' + v + ',' + (v + 6) + ',' + (v + 10) + ',.18)'; g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 1); }
    g.strokeStyle = 'rgba(200,205,210,.18)'; for (let i = 0; i < 40; i++) { g.beginPath(); const x = Math.random() * w, y = Math.random() * h; g.moveTo(x, y); g.lineTo(x + (Math.random() - .5) * 60, y + (Math.random() - .5) * 10); g.stroke(); }
    g.fillStyle = 'rgba(120,70,30,.25)'; for (let i = 0; i < 14; i++) { g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, 6 + Math.random() * 14, 3 + Math.random() * 8, 0, 0, 7); g.fill(); }
    g.strokeStyle = 'rgba(20,22,24,.55)'; g.lineWidth = 3; g.strokeRect(6, 6, w - 12, h - 12);
    g.fillStyle = '#2a2d30'; for (const y of [16, h - 44]) for (let x = 18; x < w; x += 44) { g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); g.fillStyle = '#9aa1a7'; g.beginPath(); g.arc(x - 1, y - 1, 1.5, 0, 7); g.fill(); g.fillStyle = '#2a2d30'; }
    for (let x = -20; x < w + 20; x += 26) { g.fillStyle = '#d6a619'; g.beginPath(); g.moveTo(x, h - 30); g.lineTo(x + 13, h - 30); g.lineTo(x + 25, h - 8); g.lineTo(x + 12, h - 8); g.closePath(); g.fill(); }
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, h - 32, w, 2);
  });
  const STEEL = Mt({ map: STEELT, metalness: .65, roughness: .5 }), DARK = Mt({ color: lin(0x2a2d30), metalness: .6, roughness: .45 }), GLASS = Mt({ color: lin(0x203040), metalness: .9, roughness: .1, transparent: true, opacity: .75 });
  const box = (w, h, d, m, x, y, z, p) => { const bg = new T.BoxGeometry(w, h, d); if (m === STEEL) { const uv = bg.attributes.uv; for (let i = 20; i < 24; i++) uv.setX(i, 1 - uv.getX(i)); } const me = new T.Mesh(bg, m); me.position.set(x, y, z); me.castShadow = true; me.receiveShadow = true; p.add(me); return me; };

  // placa do meio: chapa com visor, alças e pés de apoio atrás
  function center() {
    const g = new T.Group();
    box(PW, WB, TH, STEEL, 0, WB / 2, 0, g); box(PW, PH - WT, TH, STEEL, 0, (WT + PH) / 2, 0, g);
    const sw = (PW - WW) / 2; for (const s of [-1, 1]) box(sw, WH, TH, STEEL, s * (WW / 2 + sw / 2), WC, 0, g);
    // janela de tiro aberta (sem vidro) com moldura escura
    box(WW + .04, .025, .08, DARK, 0, WB - .005, .01, g); box(WW + .04, .025, .08, DARK, 0, WT + .005, .01, g);
    for (const s of [-1, 1]) box(.025, WH + .04, .08, DARK, s * (WW / 2 + .005), WC, .01, g);
    const gl = box(WW, WH, .012, GLASS, 0, WC, 0, g); gl.userData.glass = 1; gl.castShadow = false;                    // vidro: a bala atravessa (trinca)
    for (const s of [-1, 1]) { const leg = box(.05, PH * .8, .05, DARK, s * PW * .3, PH * .38, -.32, g); leg.rotation.x = -.45; box(.12, .03, .25, DARK, s * PW * .3, .015, -.5, g); }
    box(PW * .1, .1, .06, DARK, 0, PH - .04, -.03, g);                                            // alça
    return g;
  }
  // placa lateral feita de 3 escamas de aço sobrepostas
  function wing() {
    const g = new T.Group();
    for (let i = 0; i < 3; i++) { const s = box(PW, PH * .38, TH * .8, STEEL, PW / 2, PH * (.19 + i * .31), i * .012, g); s.rotation.x = -.08; }
    box(.04, PH, .06, DARK, .02, PH / 2, 0, g);                                                    // dobradiça
    return g;
  }
  // monta a árvore: centro + 2 asas de cada lado (cada asa presa na ponta da anterior)
  function build() {
    const root = new T.Group(), body = new T.Group(); root.add(body);
    const c = center(); body.add(c);
    const W = { L: [], R: [] };
    for (const side of ['L', 'R']) {
      let parent = body, x0 = side === 'R' ? PW / 2 : -PW / 2;
      for (let k = 0; k < 2; k++) {
        const hinge = new T.Group(); hinge.position.set(x0, 0, 0); parent.add(hinge);
        const w = wing(); if (side === 'L') w.scale.x = -1; hinge.add(w); W[side].push(hinge);
        parent = hinge; x0 = side === 'R' ? PW : -PW;
      }
    }
    return { root, body, W };
  }
  const ease = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
  // u: 0 = fechado deitado; 1 = aberto
  function pose(S, u) {
    const a = ease(u / .35), b = ease((u - .35) / .3), c = ease((u - .65) / .35), ANG = .32;
    S.body.rotation.x = -(1 - a) * Math.PI / 2;                                                    // levanta o meio
    S.body.position.y = (1 - a) * .02;
    // dobradas atrás (180°) -> abertas, levemente viradas para frente
    S.W.R[0].rotation.y = lerp_(-Math.PI * .98, -ANG, b); S.W.L[0].rotation.y = lerp_(Math.PI * .98, ANG, b);
    S.W.R[1].rotation.y = lerp_(-Math.PI * .98, -ANG * .9, c); S.W.L[1].rotation.y = lerp_(Math.PI * .98, ANG * .9, c);
  }
  const lerp_ = (a, b, k) => a + (b - a) * k;

  // ---------- item da mochila ----------
  try {
    W.shield = 5; BN.shield = 'Escudo de campo'; ICK.shield = 'shield'; bag.shield = bag.shield || 0; TK.shield = ['shield', 'Escudo de campo'];
    LN.shield = 'Escudo de campo'; IC.shield = '<svg viewBox="0 0 64 24"><rect x="20" y="3" width="24" height="18" rx="2"/><rect x="6" y="5" width="12" height="14" rx="1"/><rect x="46" y="5" width="12" height="14" rx="1"/></svg>'; LC.shield = '#9aa3aa';
    lt.push('shield', 'shield'); ltRich.push('shield');
  } catch (e) { console.warn('escudo', e); }
  // modelo do item (estojo fechado): o próprio escudo dobrado e deitado
  const _DZ = window.DZItem;
  window.DZItem = function (t) { if (t === 'shield') { const S = build(); pose(S, 0); S.root.scale.setScalar(.55); return S.root; } return _DZ(t); };
  Object.assign(window.DZItem, _DZ); DZItem.has = (h => t => t === 'shield' || (typeof h === 'function' && h(t)))(_DZ.has);
  // o loot do mapa foi gerado antes deste arquivo: espalha alguns escudos nos pontos de loot
  try { for (const sp of LS) if (Math.random() < (sp.rich ? .08 : .03)) { mkLoot.y = sp.y != null ? sp.y + .6 : undefined; mkLoot('shield', sp.x + (Math.random() - .5) * 1.4, sp.z + (Math.random() - .5) * 1.4, null, 0, 0); mkLoot.y = undefined; } } catch (e) { console.warn('escudo loot', e); }

  // ---------- montar / recolher ----------
  const LIVE = []; window.DZSHIELDS = LIVE;
  let busy = null;
  function colliders(S, on) {
    for (const b of S.boxes) { b.off = 1; try { const i = box.indexOf(b); if (i >= 0) box.splice(i, 1); for (const a of GRD.values()) { const j = a.indexOf(b); if (j >= 0) a.splice(j, 1); } } catch (e) { } } S.boxes.length = 0; if (!on) return;
    S.root.updateMatrixWorld(true); const v = new T.Vector3();
    // cada placa vira 3 caixinhas ao longo da largura (segue a curva)
    const add = (obj, x0, x1, yb0, yt0, pd) => { const PD = pd != null ? pd : .13; for (let i = 0; i < 3; i++) { const xa = x0 + (x1 - x0) * (i / 3), xb = x0 + (x1 - x0) * ((i + 1) / 3); const p1 = v.set(xa, 0, 0).applyMatrix4(obj.matrixWorld).clone(), p2 = v.set(xb, 0, 0).applyMatrix4(obj.matrixWorld).clone();
      S.boxes.push(addBox({ shd: 1, x0: Math.min(p1.x, p2.x) - PD, x1: Math.max(p1.x, p2.x) + PD, z0: Math.min(p1.z, p2.z) - .13, z1: Math.max(p1.z, p2.z) + .13, yb: S.y + (yb0 != null ? yb0 : -1), yt: S.y + (yt0 != null ? yt0 : PH), w: 1 })); } };
    // placa do meio: o vão da janela fica livre para atirar (só a parte de baixo e a de cima seguram bala)
    add(S.body, -PW / 2, PW / 2, -1, WB); add(S.body, -PW / 2, PW / 2, WT, PH);
    for (const sx of [-1, 1]) add(S.body, sx * WW / 2, sx * PW / 2, WB, WT, .02);
    for (const side of ['L', 'R']) for (const h of S.W[side]) add(h, 0, side === 'R' ? PW : -PW);
  }
  // ---------- BALAS NO ESCUDO: marcas, furos e sniper atravessando ----------
  // Cada tiro marca o ponto exato. Tiros perto do mesmo ponto (até 6 cm) somam força; ao chegar em 100 abre um furo
  // redondo ali (a bala passa e dá para ver através). Sniper fura com um tiro só (pesada até 150 m, comum até 40 m).
  const HEAVY = /material/;
  function power(w, v, d) {
    const f = d <= 25 ? 1 : Math.max(.5, 1 - (d - 25) / 250);
    if (w === 'sniper') { const hv = HEAVY.test(v || ''); if (d <= (hv ? 150 : 40)) return { pen: 1 }; return { p: (hv ? 40 : 20) * f }; }
    const base = w === 'pistol' ? 3 : w === 'shotgun' ? 1.4 : w === 'bow' ? 5 : /battle/.test(v || '') ? 7 : 4.5;
    return { p: base * f };
  }
  const RC = new T.Raycaster(), _o = new T.Vector3(), _d = new T.Vector3(), _l = new T.Vector3();
  function near_(S, o, d, len) { const vx = S.x - o.x, vz = S.z - o.z, t = Math.max(0, Math.min(len, vx * d.x + vz * d.z)); return Math.hypot(o.x + d.x * t - S.x, o.z + d.z * t - S.z) < 4; }
  function inHole(me, p) { const H = me.userData.holes; if (!H) return false; for (const h of H) if (Math.hypot(p.x - h.x, p.y - h.y) < h.r) return true; return false; }
  // percorre a linha: devolve o primeiro aço que segura a bala (ou null). apply = registra marcas/furos (tiro de verdade)
  function trace(o, d, len, w, v, apply) {
    for (const S of LIVE) {
      if (S.u < .99 || S.closing || !near_(S, o, d, len)) continue;
      S.root.updateMatrixWorld(true); RC.set(o, d); RC.far = len;
      const hits = RC.intersectObjects(S.steel.concat(S.glass), false);
      for (const h of hits) {
        const me = h.object; _l.copy(h.point); me.worldToLocal(_l);
        if (me.userData.glass) { if (apply) mark(S, me, _l, h.face && h.face.normal, 'g', 1); continue; }
        if (inHole(me, _l)) continue;
        const pw = power(w, v, h.distance);
        if (pw.pen) { if (apply) mark(S, me, _l, h.face && h.face.normal, 'h', 1); continue; }   // sniper atravessa
        if (apply) mark(S, me, _l, h.face && h.face.normal, 'd', 1, pw.p);
        if (apply && inHole(me, _l)) continue;                                                     // este tiro abriu o furo
        return { S, t: h.distance };
      }
    }
    return null;
  }
  // marca/furo no ponto local p da placa me
  const DECG = new T.CircleGeometry(.016, 12), DECM = new T.MeshBasicMaterial({ color: 0x15171a, side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 }),
    RIMG = new T.RingGeometry(.016, .024, 14), RIMM = new T.MeshStandardMaterial({ color: 0xb8bec4, metalness: .9, roughness: .3, side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 }),
    CRKM = new T.MeshBasicMaterial({ color: 0xdfe8ee, transparent: true, opacity: .75, side: T.DoubleSide, depthWrite: false });
  function crackGeo() { const P = []; for (let i = 0; i < 7; i++) { const a = i / 7 * 6.283 + Math.random() * .5, L = .03 + Math.random() * .05; P.push(0, 0, 0, Math.cos(a) * L, Math.sin(a) * L, 0); } const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(P, 3)); return g; }
  function decal(S, me, p, n, glass) {
    if (S.nd > 150) return; S.nd++;
    const z = (n && n.z < 0 ? -1 : 1) * (me.geometry.parameters.depth / 2 + .002);
    if (glass) { const c = new T.LineSegments(crackGeo(), CRKM); c.position.set(p.x, p.y, 0); me.add(c); return; }
    for (const zz of [z, -z]) { const d = new T.Mesh(DECG, DECM); d.position.set(p.x, p.y, zz); me.add(d); const r = new T.Mesh(RIMG, RIMM); r.position.set(p.x, p.y, zz); me.add(r); }
  }
  function hole(S, me, p, r) {
    const P = me.geometry.parameters; (me.userData.holes = me.userData.holes || []).push({ x: p.x, y: p.y, r });
    if (!me.userData.am) { const c = document.createElement('canvas'); c.width = 64; c.height = 80; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 64, 80); const t = new T.CanvasTexture(c);
      me.material = me.material.clone(); me.material.alphaMap = t; me.material.alphaTest = .5; me.material.needsUpdate = true; me.userData.am = { c, g, t }; }
    const A = me.userData.am, u = (p.x + P.width / 2) / P.width, v = (p.y + P.height / 2) / P.height;
    A.g.fillStyle = '#000'; A.g.beginPath(); A.g.ellipse(u * 64, (1 - v) * 80, r / P.width * 64, r / P.height * 80, 0, 0, 7); A.g.fill(); A.t.needsUpdate = true;
  }
  // k: 'd' marca (soma força), 'h' furo direto (sniper), 'g' vidro trincado
  function mark(S, me, p, n, k, net_, pts) {
    if (k === 'g') decal(S, me, p, n, 1);
    else if (k === 'h') { decal(S, me, p, n); hole(S, me, p, .03); }
    else { const L = me.userData.imp = me.userData.imp || []; let best = null, bd = .06; for (const q of L) { const dd = Math.hypot(q.x - p.x, q.y - p.y); if (dd < bd) { bd = dd; best = q; } }
      if (!best) { best = { x: p.x, y: p.y, s: 0, h: 0 }; L.push(best); } best.s += pts; decal(S, me, p, n);
      if (!best.h && best.s >= 100) { best.h = 1; hole(S, me, best, .04); } }
    if (net_) net({ t: 'shd', a: 'd', id: S.id, m: S.steel.indexOf(me), gi: me.userData.glass ? S.glass.indexOf(me) : -1, k, x: +p.x.toFixed(3), y: +p.y.toFixed(3), p: pts ? +pts.toFixed(2) : 0, nz: n && n.z < 0 ? -1 : 1 });
  }
  // linha de visão / bala: o escudo segura, a menos que tenha furo no caminho (ou a arma atravesse)
  const _blk = blocked;
  blocked = function (x0, y0, z0, x1, y1, z1) {
    if (_blk(x0, y0, z0, x1, y1, z1)) return true; if (!LIVE.length) return false;
    _o.set(x0, y0, z0); _d.set(x1 - x0, y1 - y0, z1 - z0); const len = _d.length(); if (len < .01) return false; _d.multiplyScalar(1 / len);
    const W_ = window.__shW; return !!trace(_o, _d, len, W_ ? W_[0] : null, W_ ? W_[1] : null, false);
  };
  // tiro do jogador: marca o escudo onde a bala parou (ou furou)
  window.addEventListener('load', () => {
    try { const _f = fire; fire = function (fx, fz) { const q = cur >= 0 ? slots[cur] : null; window.__shW = q ? [q.t, q.v] : null; try { return _f.apply(this, arguments); } finally { window.__shW = null; } }; } catch (e) { }
    try { const _s = DZW.shoot; DZW.shoot = function (o, dr, maxT) { const r = _s ? _s.apply(this, arguments) : undefined; try { if (LIVE.length && window.__shW) trace(o, dr, (maxT || 300) + .5, __shW[0], __shW[1], true); } catch (e) { } return r; }; } catch (e) { }
  });
  // tiro de bot: segura no escudo e deixa a marca
  window.dzShotBlk = function (b, x0, y0, z0, x1, y1, z1) {
    window.__shW = [b.w || 'rifle', b.v]; try { const r = blocked(x0, y0, z0, x1, y1, z1); if (LIVE.length) { _o.set(x0, y0, z0); _d.set(x1 - x0, y1 - y0, z1 - z0); const len = _d.length(); _d.multiplyScalar(1 / len); trace(_o, _d, len, b.w || 'rifle', b.v, true); } return r; } finally { window.__shW = null; }
  };
  // ---------- rede: todo mundo da partida vê o escudo ----------
  let seq = 0;
  function net(m) { try { if (typeof N !== 'undefined' && N) gp(m, 1); else if (typeof MP !== 'undefined' && MP && opId && opId !== 'BOT') snd(m, 1); } catch (e) { } }
  const ANIM = [];
  function spawnAt(x, y, z, r, id) {
    const S = build(); S.root.position.set(x, y, z); S.root.rotation.y = r; sc.add(S.root); pose(S, 0);
    Object.assign(S, { x, z, y, r, id, u: 0, boxes: [], steel: [], glass: [], nd: 0 }); S.root.traverse(o => { if (!o.isMesh) return; if (o.material === STEEL) S.steel.push(o); else if (o.userData.glass) S.glass.push(o); }); LIVE.push(S); return S;
  }
  function deploy() {
    if (busy || mode !== 'ground' || !(bag.shield > 0) || (window.dzKnocked && dzKnocked())) return;
    try { if (cast) return; } catch (e) { }
    const fx = Math.sin(yaw), fz = Math.cos(yaw), x = P.x + fx * 1.7, z = P.z + fz * 1.7, y = GY(x, z, P.y + 1);
    if (Math.abs(y - P.y) > .8) { say('Lugar ruim para montar o escudo', 1.5); return; }
    for (const s of LIVE) if (Math.hypot(s.x - x, s.z - z) < 2) { say('Já tem um escudo aqui', 1.5); return; }
    bag.shield--; try { drawBag(); } catch (e) { }
    let me = 'L'; try { me = mpId || 'L'; } catch (e) { }
    const S = spawnAt(x, y, z, yaw + Math.PI, me + '_' + (++seq) + '_' + (Date.now() % 1e5));
    busy = { S, t: 0, dir: 1, dur: 1.8, mine: 1 }; ANIM.push(busy); try { st = 1; ui(); cur = -1; ads = 0; firing = 0; drawSlots(); } catch (e) { }
    say('Montando o escudo...', 1.6); try { sfx(260, .25, .2, 0); } catch (e) { }
    net({ t: 'shd', a: 'o', id: S.id, x: +x.toFixed(2), y: +y.toFixed(2), z: +z.toFixed(2), r: +S.r.toFixed(3) });
  }
  function pack(S) {
    if (busy || mode !== 'ground' || S.closing) return; if (bagUsed() + W.shield > CAPS[bagLv]) { say('Mochila cheia', 1.5); return; }
    for (let i = ANIM.length - 1; i >= 0; i--) if (ANIM[i].S === S) ANIM.splice(i, 1);
    S.closing = 1; colliders(S, false); busy = { S, t: (1 - S.u) * 1.2, dir: -1, dur: 1.2, mine: 1 }; ANIM.push(busy); try { st = 1; ui(); } catch (e) { } say('Recolhendo o escudo...', 1.2);
    net({ t: 'shd', a: 'c', id: S.id });
  }
  // mensagem de outro jogador
  function rx(m) {
    if (!m || m.t !== 'shd' || mode === 'lobby') return;
    let S = LIVE.find(s => s.id === m.id);
    if (m.a === 'o') { if (S) return; S = spawnAt(m.x, m.y, m.z, m.r, m.id); ANIM.push({ S, t: 0, dir: 1, dur: 1.8 }); }
    else if (m.a === 'd' && S) { const me = m.k === 'g' ? S.glass[m.gi] : S.steel[m.m]; if (me) mark(S, me, new T.Vector3(m.x, m.y, 0), { z: m.nz }, m.k, 0, m.p); }
    else if (m.a === 'c' && S && !S.closing) {
      for (let i = ANIM.length - 1; i >= 0; i--) if (ANIM[i].S === S) { if (ANIM[i] === busy) busy = null; ANIM.splice(i, 1); }
      S.closing = 1; colliders(S, false); ANIM.push({ S, t: (1 - S.u) * 1.2, dir: -1, dur: 1.2 });
    }
  }
  window.addEventListener('load', () => {
    try { const _r = sqRx; sqRx = function (m) { if (m && m.t === 'shd') { rx(m); return; } return _r.apply(this, arguments); }; } catch (e) { }
    try { const _r = clRx; clRx = function (m) { if (m && m.t === 'shd') { rx(m); return; } return _r.apply(this, arguments); }; } catch (e) { }
    try { const _r = mpMsg; mpMsg = function (m) { if (m && m.t === 'shd') { if (m.from === opId) rx(m); return; } return _r.apply(this, arguments); }; } catch (e) { }
  });
  window.dzShield = { deploy, pack, rx };
  // animação por etapas (com som de metal a cada placa)
  let lastT = 0;
  const _lb = window.loopBody;
  window.loopBody = function (t) {
    const dt = Math.min(.05, (t - lastT) / 1000 || 0); lastT = t; _lb(t);
    if (busy) try { if (mode === 'ground') firing = 0; } catch (e) { }
    for (let i = ANIM.length - 1; i >= 0; i--) {
      const B = ANIM[i], S = B.S, u0 = S.u; B.t += dt; S.u = B.dir > 0 ? Math.min(1, B.t / B.dur) : Math.max(0, 1 - B.t / B.dur); pose(S, S.u);
      const vol = B.mine ? .3 : .3 * Math.max(0, 1 - Math.hypot(S.x - P.x, S.z - P.z) / 40);
      if (vol > .01) for (const k of [.35, .65, .95]) if ((u0 - k) * (S.u - k) < 0) try { sfx(180 + k * 200, vol, .15, 0); } catch (e) { }
      if (B.dir > 0 && S.u >= 1) { ANIM.splice(i, 1); colliders(S, true); S.root.updateMatrixWorld(true); if (B === busy) { busy = null; say('Escudo montado', 1.2); try { st = 0; ui(); } catch (e) { } } }
      else if (B.dir < 0 && S.u <= 0) { ANIM.splice(i, 1); sc.remove(S.root); const j = LIVE.indexOf(S); if (j >= 0) LIVE.splice(j, 1); if (B === busy) { busy = null; bag.shield = (bag.shield || 0) + 1; try { drawBag(); st = 0; ui(); } catch (e) { } say('Escudo guardado na mochila', 1.4); } }
    }
  };
  // botão "Recolher" perto do escudo
  const bR = document.createElement('div'); bR.id = 'dzShRec'; bR.style.cssText = 'position:fixed;right:200px;bottom:290px;z-index:6;display:none;width:70px;height:70px;border-radius:50%;border:2px solid rgba(255,255,255,.6);background:rgba(60,70,80,.8);color:#fff;font:800 11px system-ui;align-items:center;justify-content:center;flex-direction:column;user-select:none;-webkit-user-select:none;touch-action:none';
  bR.innerHTML = '<svg viewBox="0 0 32 24" width="28" height="20"><rect x="10" y="3" width="12" height="16" rx="1" fill="#fff"/><rect x="2" y="5" width="7" height="12" fill="#fff" opacity=".7"/><rect x="23" y="5" width="7" height="12" fill="#fff" opacity=".7"/></svg><span>Recolher</span>'; document.body.appendChild(bR);
  let nearS = null;
  bR.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if (nearS) pack(nearS); else deploy(); });
  setInterval(() => { nearS = null; if (!busy && mode === 'ground') { let bd = 3; for (const s of LIVE) { if (s.closing) continue; const d = Math.hypot(s.x - P.x, s.z - P.z); if (d < bd && Math.abs(s.y - P.y) < 2) { bd = d; nearS = s; } } } const can = nearS || (!busy && mode === 'ground' && bag.shield > 0); const lb = nearS ? 'Recolher' : 'Escudo'; if (bR.dataset.l !== lb) { bR.dataset.l = lb; bR.lastChild.textContent = lb; } bR.style.display = can ? 'flex' : 'none'; }, 200);
  // sai da partida: some tudo
  setInterval(() => { if ((mode === 'lobby') && LIVE.length) { for (const s of LIVE) { colliders(s, false); sc.remove(s.root); } LIVE.length = 0; ANIM.length = 0; busy = null; } }, 1000);
})();
