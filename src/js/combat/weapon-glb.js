/* Deadzone · combat/weapon-glb.js
 * ARMAS REAIS: 20 modelos 3D baixados (pacote "Flat Guns" West/East) no lugar das armas feitas no código.
 *  - Cada arma tem a empunhadura, a mão de apoio, a mira e o cano medidos no próprio modelo, então fica
 *    certa na mão (tamanho real), nas costas, na cintura e no chão.
 *  - Cada tipo (fuzil, escopeta, pistola, sniper) tem várias armas diferentes no mapa (nome e som próprios).
 *  - Sons de tiro gravados de armas de verdade (biblioteca CC0), com distância, silenciador e direção.
 * Se os modelos ainda não carregaram, usa a arma antiga e troca sozinho quando ficarem prontos.
 */
(function () {
  // [arquivo, tipo, nome, som, tom, empunhadura G(z,y), mão de apoio F(z,y), mira S(z,y), trilho R(z,y), cano M(z,y)] (cm, cano para +z)
  const RAW = [
    ['rifle_assault_west', 'rifle', 'M4A1', 'ar', 1, [-11, -8], [14, -1.5], [-10, 6.5], [-5, 4.5], [34, 1]],
    ['rifle_assault_east', 'rifle', 'AK-12', 'ak', 1, [-14.5, -7], [18, -3], [-12, 6], [-5, 5], [34, .5]],
    ['rifle_battle_west', 'rifle', 'SCAR-H', 'sks', 1, [-14, -9], [18, -2], [-11, 8.5], [-5, 5], [40, .5]],
    ['rifle_battle_east', 'rifle', 'Galil ACE', 'ak', .9, [-16, -9], [20, -2.5], [-15, 6], [-5, 4.5], [35, 0]],
    ['smg_full_west', 'rifle', 'MPX', 'smg9', 1, [-13, -8], [12, -3.5], [-13, 6.5], [-5, 5.5], [23, 1]],
    ['smg_full_east', 'rifle', 'PP-19', 'smg762', 1, [-12, -7], [14, -1.5], [-12, 5], [-5, 4.5], [22, .5]],
    ['smg_compact_east', 'rifle', 'Micro UZI', 'smg9', 1.12, [.5, -6], [10, -1.5], [-10, 5], [0, 4.5], [19, 1]],
    ['smg_compact_west', 'rifle', 'MP9', 'smg9', 1.06, [-1, -7], [8, -4], [-7, 4.8], [0, 5], [22, 2]],
    ['shotgun_pump_east', 'shotgun', 'M870', 'pump', 1, [-12, -1], [17, -1], [0, 5.5], [-3, 6], [45, 2]],
    ['shotgun_pump_west', 'shotgun', 'Serrada', 'nova', 1, [-18, -3], [20, -2], [0, 5], [-3, 5.5], [28, 2]],
    ['shotgun_auto_east', 'shotgun', 'Saiga-12', 'auto12', 1, [-14, -7], [22, -.5], [-14, 8], [-5, 8], [32, 3.5]],
    ['shotgun_auto_west', 'shotgun', 'AA-12', 'cd12', 1, [-17, -9], [18, -2.5], [-17, 10.5], [-5, 10], [37, 1.5]],
    ['pistol_compact_east', 'pistol', 'Makarov', 'ppq', 1.05, [-3, -4], null, [-4, 3.3], [0, 3], [10.5, 1.5]],
    ['pistol_compact_west', 'pistol', 'P320', 'bersa', 1, [-4, -4.5], null, [-5, 4.2], [0, 4], [11, 2]],
    ['pistol_full_east', 'pistol', 'CZ 75', 'm1911', 1.04, [-5, -5], null, [-6, 3.8], [0, 3.5], [12.5, 1.5]],
    ['pistol_full_west', 'pistol', 'M9', 'ppq', .94, [-5, -5], null, [-4, 3.8], [0, 3.5], [13, 1.5]],
    ['sniper_rifle_west', 'sniper', 'M110', 'tikka', .96, [-17, -8], [30, -1], [-20, 7.5], [-10, 4.5], [52, .5]],
    ['sniper_rifle_east', 'sniper', 'SVD', 'mosin', 1, [-16.5, -7], [25, -1], [-17, 6.5], [-10, 5], [40, .5]],
    ['sniper_material_west', 'sniper', 'M82', 'savage', 1, [-16, -7], [30, -2.5], [-20, 8.5], [-15, 5], [63, .5]],
    ['sniper_material_east', 'sniper', 'KSVK', 'tikka', 1, [-6, -6], [22, -2.5], [-10, 5.5], [-15, 5], [60, 1]]
  ];
  const WV = {}, BYT = { rifle: [], shotgun: [], pistol: [], sniper: [] };
  for (const r of RAW) { const c = v => v && [v[0] / 100, v[1] / 100]; const o = { id: r[0], t: r[1], n: r[2], snd: r[3], pr: r[4], G: c(r[5]), F: c(r[6]), S: c(r[7]), R: c(r[8]), M: c(r[9]) }; WV[o.id] = o; BYT[o.t].push(o.id); }
  window.WVAR = WV;
  const pickV = t => { const L = BYT[t]; return L && L.length ? L[Math.floor(Math.random() * L.length)] : null; };
  window.wPickV = pickV;
  window.wNm = q => (q && q.v && WV[q.v] ? WV[q.v].n : q && WS[q.t] ? WS[q.t]._n || WS[q.t].n : '');
  // nome da arma na mão (killfeed, HUD) = nome do modelo que o jogador está segurando
  for (const t in BYT) if (WS[t]) { const base = WS[t].n; WS[t]._n = base; Object.defineProperty(WS[t], 'n', { configurable: true, get() { try { const q = cur >= 0 ? slots[cur] : null; if (q && q.t === t && q.v && WV[q.v]) return WV[q.v].n; } catch (e) { } return base; } }); }

  // ---------- materiais (os do modelo vêm quase pretos e foscos: troca por metal / polímero / madeira) ----------
  const Mt = (c, me, ro) => new T.MeshStandardMaterial({ color: lin(c), metalness: me, roughness: ro });
  const MAT = {
    Black: Mt(0x1d1f22, .55, .42), Black_Lighter: Mt(0x2a2d31, .45, .5), Grey_Darker: Mt(0x35393e, .35, .55), Grey_Dark: Mt(0x464b51, .6, .36),
    Grey_Light: Mt(0x6c7177, .7, .32), Grey_Lighter: Mt(0x9da2a8, .85, .25), White: Mt(0xd6d6d2, .1, .6),
    'Red.Brick': Mt(0x7a3b22, .05, .55), 'Brown.Chestnut': Mt(0x5e3c24, .05, .58), 'Brown.Bole': Mt(0x4c2c1a, .05, .6), 'Red.Rosewood': Mt(0x5c2016, .05, .55),
    'Yellow.Brass': Mt(0xb08a3a, .85, .3)
  };
  const matOf = m => { const k = (m && m.name || '').replace(/^M_PCL_Flat_/, ''); return MAT[k] || MAT.Black; };

  // ---------- carregamento ----------
  const SRC = {}; let ready = 0;
  function load() {
    if (!T.GLTFLoader) return;
    let left = RAW.length;
    for (const r of RAW) {
      const url = 'assets/models/weapons/fg_' + r[0] + '.glb';
      new T.GLTFLoader().load(url, g => { prep(r[0], g.scene); if (--left === 0) done(); }, undefined, e => { console.warn('arma', r[0], e); if (--left === 0) done(); });
    }
  }
  // junta as peças por material (poucos desenhos por arma)
  function prep(id, scn) {
    scn.updateMatrixWorld(true); const by = new Map();
    scn.traverse(o => { if (!o.isMesh) return; const m = matOf(o.material), g = (o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone()); g.applyMatrix4(o.matrixWorld);
      for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k); if (!g.attributes.normal) g.computeVertexNormals(); if (!by.has(m)) by.set(m, []); by.get(m).push(g); });
    const out = [];
    for (const [m, L] of by) { let n = 0; for (const g of L) n += g.attributes.position.count; const P = new Float32Array(n * 3), N = new Float32Array(n * 3); let o = 0;
      for (const g of L) { P.set(g.attributes.position.array, o * 3); N.set(g.attributes.normal.array, o * 3); o += g.attributes.position.count; }
      const ge = new T.BufferGeometry(); ge.setAttribute('position', new T.BufferAttribute(P, 3)); ge.setAttribute('normal', new T.BufferAttribute(N, 3)); ge.computeBoundingSphere(); out.push([ge, m]); }
    SRC[id] = out;
  }
  function done() {
    ready = 1;
    // troca o que já foi montado com a arma antiga
    try { for (const k in WC) delete WC[k]; for (const k in LMC) delete LMC[k]; } catch (e) { }
    try { rfk = ''; slk = ''; vmk = ''; } catch (e) { }
    try { for (const o of loot) if (WS[o.t] && o.t !== 'bow') reLoot(o); } catch (e) { console.warn(e); }
    try { for (const b of bots) if (b.wg && b.w && b.w !== 'bow') { b.g.tr.remove(b.wg); b.wg = mkW(b.w, 0, b.sil, 0, b.v); b.g.tr.add(b.wg); } } catch (e) { }
  }

  // ---------- montagem ----------
  const S_ = 1.0, GT = [-.05, -.1];   // escala (tamanho real) e onde fica o centro da empunhadura (igual às armas antigas)
  const cyl = (r1, r2, l, n) => new T.CylinderGeometry(r1, r2, l, n || 14);
  const WMb = () => (window.WMODEL || {});
  const EYZ = { pistol: -.15, rifle: -.12, shotgun: -.13, sniper: -.12 };
  function build(t, lv, sil, vm, v) {
    if (!v || !WV[v] || WV[v].t !== t) v = BYT[t][0];
    const D = WV[v], src = SRC[v]; if (!src) return null;
    const g = new T.Group(), u = g.ud = { t, v };
    const mp = p => [S_ * p[0] + GT[0] - S_ * D.G[0], S_ * p[1] + GT[1] - S_ * D.G[1]]; // (z,y) do modelo -> (z,y) da arma no jogo
    const inner = new T.Group(); inner.rotation.y = Math.PI; inner.scale.setScalar(S_); inner.position.set(0, GT[1] - S_ * D.G[1], GT[0] - S_ * D.G[0]);
    for (const [ge, m] of src) { const me = new T.Mesh(ge, m); me.castShadow = !vm; me.receiveShadow = false; inner.add(me); }
    g.add(inner);
    const Gm = mp(D.G), Sm = mp(D.S), Rm = mp(D.R), Mm = mp(D.M);
    // mãos (IK): direita na empunhadura; esquerda no guarda-mão (pistola: apoia a direita)
    const rh = [0, Gm[1] + .01, Gm[0] + .03];
    u.hg = [rh, D.F ? (() => { const Fm = mp(D.F); return [0, Fm[1] - .045, Fm[0]]; })() : [-.03, rh[1] - .005, rh[2] + .03]];
    u.mz = Mm;
    // peças animadas (vazias: o modelo é inteiro) para recarregar/atirar continuarem funcionando
    const dmy = () => { const q = new T.Group(); g.add(q); return q; };
    u.bolt = dmy(); u.bz = 0; u.slide = dmy(); u.sz = 0; u.pump = dmy(); u.pz = 0; u.shell = dmy(); u.mag = null;
    // clarão do cano
    if (!vm) { const f = new T.Mesh(new T.ConeGeometry(t === 'pistol' ? .03 : .045, (t === 'pistol' ? .03 : .045) * 3.2, 7), FLM_); f.rotation.x = -Math.PI / 2; f.position.set(0, Mm[1], Mm[0] + .06); f.visible = false; g.add(f); u.fl = f; }
    const M = WMb(), blk = M.black || MAT.Black;
    const it = [], add = (geo, m, x, y, z, rx, ry, rz) => it.push([geo, m, x || 0, y || 0, z || 0, rx || 0, ry || 0, rz || 0]);
    const Z = (r1, r2, l, m, x, y, z, n) => add(cyl(r1, r2, l, n), m, x, y, z, Math.PI / 2);
    // silenciador na ponta do cano
    if (sil && t !== 'shotgun') { const L = t === 'pistol' ? .13 : .19; Z(.02, .02, L, blk, 0, Mm[1], Mm[0] + L / 2 - .005, 16); u.fl = null; }
    // miras (mesmas peças das armas antigas, apoiadas no trilho deste modelo)
    let ey = [0, Sm[1] - .006, Sm[0] - (t === 'pistol' ? .15 : .12)];
    if ((t === 'rifle' || t === 'sniper') && lv > 0) {
      const yb = Rm[1], ax = yb + .052, zc = Rm[0] + .02;
      if (lv === 1) {
        add(new T.BoxGeometry(.05, .012, .07), blk, 0, yb + .006, zc);
        add(new T.BoxGeometry(.05, .05, .012), blk, 0, ax - .005, zc + .025); add(new T.BoxGeometry(.008, .06, .05), blk, -.022, ax - .005, zc + .005); add(new T.BoxGeometry(.008, .06, .05), blk, .022, ax - .005, zc + .005); add(new T.BoxGeometry(.05, .008, .05), blk, 0, ax + .027, zc + .005);
        const gl = new T.Mesh(new T.BoxGeometry(.038, .045, .002), M.glass || MAT.Grey_Dark); gl.position.set(0, ax, zc + .018); g.add(gl);
        const d = new T.Mesh(new T.CircleGeometry(.0025, 10), M.dot || new T.MeshBasicMaterial({ color: 0xff2020 })); d.rotation.y = Math.PI; d.position.set(0, ax, zc + .016); g.add(d);
        ey = [0, ax, zc - .2];
      } else if (lv === 2) {
        add(new T.BoxGeometry(.03, ax - yb - .02, .1), blk, 0, (yb + ax - .02) / 2, zc);
        Z(.022, .022, .16, blk, 0, ax, zc, 16); Z(.03, .024, .04, blk, 0, ax, zc + .1, 16); Z(.028, .022, .035, blk, 0, ax, zc - .095, 16);
        const tb = new T.Mesh(cyl(.018, .018, .002, 18), vm ? new T.MeshBasicMaterial({ map: rt.texture, fog: false }) : (M.lens || blk)); tb.rotation.x = Math.PI / 2; tb.position.set(0, ax, zc - .114); g.add(tb);
        ey = [0, ax, zc - .23];
      } else if (lv === 3) {
        for (const dz of [-.08, .08]) add(new T.BoxGeometry(.03, ax - yb, .025), blk, 0, (yb + ax) / 2, zc + dz);
        Z(.02, .02, .36, blk, 0, ax, zc, 16); Z(.034, .022, .1, blk, 0, ax, zc + .22, 16); Z(.03, .02, .07, blk, 0, ax, zc - .2, 16);
        Z(.015, .015, .03, blk, 0, ax + .03, zc, 10); add(cyl(.013, .013, .03, 10), blk, .03, ax, zc, 0, 0, Math.PI / 2);
        ey = [0, ax, zc - .35];
      }
    }
    u.ey = ey;
    if (vm) { // luvas e mangas na tela de mira
      for (let k = 0; k < 2; k++) { const p = u.hg[k]; add(new T.BoxGeometry(.07, .08, .1), MAT.Black_Lighter, p[0], p[1], p[2]); add(new T.BoxGeometry(.075, .075, .5), Mt(0x55663f, 0, .9), p[0] + (k ? -.02 : .02), p[1] - .06, p[2] - .3, -.25); }
    }
    if (it.length) { const q = new T.Group(); bake(q, it); q.traverse(o => { if (o.isMesh) o.castShadow = !vm; }); g.add(q); }
    return g;
  }

  // mkW(t, mira, silenciador, telaDeMira, modelo)
  const _mkW = mkW;
  mkW = function (t, lv, sil, vm, v) {
    if (ready && BYT[t]) { try { const g = build(t, lv | 0, sil, vm, v); if (g) return g; } catch (e) { console.warn('arma real', t, e); } }
    return _mkW(t, lv, sil, vm);
  };
  window.wHG = (w, t) => (w && w.ud && w.ud.hg) || HG[t];

  // ---------- loot de arma: modelo certo, tamanho real, deitado no chão ----------
  function lootModel(t, lv, sil, v) {
    const ck = t + ':' + (lv || 0) + ':' + (sil || 0) + ':' + (v || '');
    if (!LMC[ck]) { const h = new T.Group(); h.add(mkW(t, lv, sil, 0, v)); LMC[ck] = mergeModel(h); }
    return LMC[ck].clone(true);
  }
  function reLoot(o) {
    if (!o.v) o.v = pickV(o.t);
    const g = o.g; while (g.children.length) g.remove(g.children[0]);
    const w = lootModel(o.t, o.sc, o.sil, o.v); w.scale.setScalar(1.15); g.add(w);
    g.position.y = 0; o.top.updateMatrixWorld(true);
    const bb = new T.Box3(); g.traverse(q => { if (q.isMesh) bb.expandByObject(q); }); if (bb.min.y < 1e8) g.position.y -= bb.min.y - o.top.position.y - .02;
    o.top.updateMatrixWorld(true); o.top.traverse(q => { q.updateMatrix(); q.matrixAutoUpdate = false; });
  }
  const _mkLoot = mkLoot;
  mkLoot = function (t, x, z, am, lv, sil) {
    _mkLoot(t, x, z, am, lv, sil);
    const o = loot[loot.length - 1];
    if (o && WS[o.t] && BYT[o.t]) { o.v = (am && am.v && WV[am.v] && WV[am.v].t === o.t) ? am.v : pickV(o.t); if (ready) try { reLoot(o); } catch (e) { } }
  };

  // ---------- bots também usam modelos variados ----------
  if (typeof armBot === 'function') {
    armBot = function (b, t, sl) { b.w = t; b.sil = sl || ((t !== 'shotgun' && Math.random() < .2) ? 1 : 0); b.v = pickV(t); const w = mkW(t, 0, b.sil, 0, b.v); b.g.tr.add(w); b.wg = w; b.dw = 0; };
  }

  /* ======================= SONS REAIS ======================= */
  const SB = {}; let sndAsked = 0;
  function loadSnd() {
    if (sndAsked || !AC) return; sndAsked = 1;
    const need = new Set(RAW.map(r => r[3]));
    for (const k of need) {
      const url = 'assets/sounds/guns/' + k + '.mp3';
      try {
        const ld = new T.FileLoader(); ld.setResponseType('arraybuffer');
        ld.load(url, ab => { try { AC.decodeAudioData(ab, b => { SB[k] = b; }, () => { }); } catch (e) { } });
      } catch (e) { }
    }
  }
  const DEF = { rifle: 'rifle_assault_west', shotgun: 'shotgun_pump_east', pistol: 'pistol_full_west', sniper: 'sniper_rifle_west' };
  // dist em metros; pan -1..1
  window.gunSnd = function (v, t, dist, pan, sil) {
    if (!AC) return false; loadSnd();
    const D = WV[v] || WV[DEF[t]]; if (!D) return false; const b = SB[D.snd]; if (!b) return false;
    const d = Math.max(0, dist || 0), far = sil ? 45 : (t === 'sniper' ? 320 : 220); if (d > far) return true;
    try {
      if (AC.state === 'suspended') AC.resume();
      const s = AC.createBufferSource(), fl = AC.createBiquadFilter(), g = AC.createGain(), now = AC.currentTime;
      s.buffer = b; s.playbackRate.value = D.pr * (sil ? 1.15 : 1) * (.97 + Math.random() * .06);
      const k = 1 - d / far, vol = (sil ? .28 : .8) * Math.pow(k, 1.4) * (d < 2 ? 1 : .85);
      fl.type = 'lowpass'; fl.frequency.value = sil ? 1100 : Math.max(900, 16000 * Math.pow(k, 2.2));
      g.gain.setValueAtTime(vol, now); g.gain.exponentialRampToValueAtTime(.0008, now + Math.min(b.duration, sil ? .35 : 1.6) / s.playbackRate.value);
      s.connect(fl); fl.connect(g);
      if (AC.createStereoPanner && pan) { const p = AC.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)) * .8; g.connect(p); p.connect(AC.destination); } else g.connect(AC.destination);
      s.start(); s.stop(now + b.duration + .05);
    } catch (e) { return false; }
    return true;
  };
  addEventListener('pointerdown', () => setTimeout(loadSnd, 0)); addEventListener('keydown', () => setTimeout(loadSnd, 0));

  load();
})();
