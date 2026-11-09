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
  const PW = 1.0, PH = 1.25, TH = .05;                      // largura e altura de cada placa
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
  const box = (w, h, d, m, x, y, z, p) => { const me = new T.Mesh(new T.BoxGeometry(w, h, d), m); me.position.set(x, y, z); me.castShadow = true; me.receiveShadow = true; p.add(me); return me; };

  // placa do meio: chapa com visor, alças e pés de apoio atrás
  function center() {
    const g = new T.Group();
    box(PW, PH * .42, TH, STEEL, 0, PH * .21, 0, g); box(PW, PH * .36, TH, STEEL, 0, PH * .82, 0, g);
    box(PW * .3, PH * .2, TH, STEEL, -PW * .35, PH * .52, 0, g); box(PW * .3, PH * .2, TH, STEEL, PW * .35, PH * .52, 0, g);
    box(PW * .4, PH * .2, .01, GLASS, 0, PH * .52, 0, g);                                          // visor
    box(PW * .44, .03, .07, DARK, 0, PH * .64, .03, g); box(PW * .44, .03, .07, DARK, 0, PH * .4, .03, g);
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
    const add = (obj, x0, x1) => { for (let i = 0; i < 3; i++) { const xa = x0 + (x1 - x0) * (i / 3), xb = x0 + (x1 - x0) * ((i + 1) / 3); const p1 = v.set(xa, 0, 0).applyMatrix4(obj.matrixWorld).clone(), p2 = v.set(xb, 0, 0).applyMatrix4(obj.matrixWorld).clone();
      S.boxes.push(addBox({ x0: Math.min(p1.x, p2.x) - .08, x1: Math.max(p1.x, p2.x) + .08, z0: Math.min(p1.z, p2.z) - .08, z1: Math.max(p1.z, p2.z) + .08, yb: S.y - 1, yt: S.y + PH, w: 1 })); } };
    add(S.body, -PW / 2, PW / 2);
    for (const side of ['L', 'R']) for (const h of S.W[side]) add(h, 0, side === 'R' ? PW : -PW);
  }
  function deploy() {
    if (busy || mode !== 'ground' || !(bag.shield > 0)) return;
    try { if (cast) return; } catch (e) { }
    const fx = Math.sin(yaw), fz = Math.cos(yaw), x = P.x + fx * 1.7, z = P.z + fz * 1.7, y = GY(x, z, P.y + 1);
    if (Math.abs(y - P.y) > .8) { say('Lugar ruim para montar o escudo', 1.5); return; }
    for (const s of LIVE) if (Math.hypot(s.x - x, s.z - z) < 2) { say('Já tem um escudo aqui', 1.5); return; }
    bag.shield--; try { drawBag(); } catch (e) { }
    const S = build(); S.root.position.set(x, y, z); S.root.rotation.y = yaw + Math.PI; sc.add(S.root); pose(S, 0);
    Object.assign(S, { x, z, y, u: 0, boxes: [], st: 'open' }); LIVE.push(S);
    busy = { S, t: 0, dir: 1, dur: 1.8 }; try { st = 1; ui(); cur = -1; ads = 0; firing = 0; drawSlots(); } catch (e) { }
    say('Montando o escudo...', 1.6); try { sfx(260, .25, .2, 0); } catch (e) { }
  }
  function pack(S) {
    if (busy || mode !== 'ground') return; if (bagUsed() + W.shield > CAPS[bagLv]) { say('Mochila cheia', 1.5); return; }
    colliders(S, false); busy = { S, t: 0, dir: -1, dur: 1.2 }; try { st = 1; ui(); } catch (e) { } say('Recolhendo o escudo...', 1.2);
  }
  window.dzShield = { deploy, pack };
  // animação por etapas (com som de metal a cada placa)
  let lastT = 0;
  const _lb = window.loopBody;
  window.loopBody = function (t) {
    const dt = Math.min(.05, (t - lastT) / 1000 || 0); lastT = t; _lb(t);
    if (!busy) return;
    const B = busy, S = B.S, u0 = S.u; B.t += dt; S.u = B.dir > 0 ? Math.min(1, B.t / B.dur) : Math.max(0, 1 - B.t / B.dur); pose(S, S.u);
    for (const k of [.35, .65, .95]) if ((u0 - k) * (S.u - k) < 0) try { sfx(180 + k * 200, .3, .15, 0); } catch (e) { }
    try { if (mode === 'ground') { firing = 0; } } catch (e) { }
    if (B.dir > 0 && S.u >= 1) { busy = null; colliders(S, true); S.root.updateMatrixWorld(true); say('Escudo montado', 1.2); try { st = 0; ui(); } catch (e) { } }
    if (B.dir < 0 && S.u <= 0) { busy = null; sc.remove(S.root); LIVE.splice(LIVE.indexOf(S), 1); bag.shield = (bag.shield || 0) + 1; try { drawBag(); st = 0; ui(); } catch (e) { } say('Escudo guardado na mochila', 1.4); }
  };
  // botão "Recolher" perto do escudo
  const bR = document.createElement('div'); bR.id = 'dzShRec'; bR.style.cssText = 'position:fixed;right:200px;bottom:290px;z-index:6;display:none;width:70px;height:70px;border-radius:50%;border:2px solid rgba(255,255,255,.6);background:rgba(60,70,80,.8);color:#fff;font:800 11px system-ui;align-items:center;justify-content:center;flex-direction:column;user-select:none;-webkit-user-select:none;touch-action:none';
  bR.innerHTML = '<svg viewBox="0 0 32 24" width="28" height="20"><rect x="10" y="3" width="12" height="16" rx="1" fill="#fff"/><rect x="2" y="5" width="7" height="12" fill="#fff" opacity=".7"/><rect x="23" y="5" width="7" height="12" fill="#fff" opacity=".7"/></svg><span>Recolher</span>'; document.body.appendChild(bR);
  let nearS = null;
  bR.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if (nearS) pack(nearS); else deploy(); });
  setInterval(() => { nearS = null; if (!busy && mode === 'ground') { let bd = 3; for (const s of LIVE) { const d = Math.hypot(s.x - P.x, s.z - P.z); if (d < bd && Math.abs(s.y - P.y) < 2) { bd = d; nearS = s; } } } const can = nearS || (!busy && mode === 'ground' && bag.shield > 0); const lb = nearS ? 'Recolher' : 'Escudo'; if (bR.dataset.l !== lb) { bR.dataset.l = lb; bR.lastChild.textContent = lb; } bR.style.display = can ? 'flex' : 'none'; }, 200);
  // sai da partida: some tudo
  setInterval(() => { if ((mode === 'lobby') && LIVE.length) { for (const s of LIVE) { colliders(s, false); sc.remove(s.root); } LIVE.length = 0; busy = null; } }, 1000);
})();
