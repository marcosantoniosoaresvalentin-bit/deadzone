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

  // ---------- atributos próprios de cada arma (dano, cadência, alcance, tempo de recarga) ----------
  // vale para a arma que o jogador está segurando; o carregador continua o mesmo do tipo da arma
  const ST = {
    rifle_assault_west: { d: 22, r: .11 }, rifle_assault_east: { d: 26, r: .125 }, rifle_battle_west: { d: 30, r: .15, rg: 170, rt: 2.5 }, rifle_battle_east: { d: 24, r: .115 },
    smg_full_west: { d: 18, r: .085, rg: 100, rt: 1.9 }, smg_full_east: { d: 17, r: .08, rg: 90, rt: 1.9 }, smg_compact_east: { d: 14, r: .06, rg: 70, rt: 1.7 }, smg_compact_west: { d: 15, r: .07, rg: 80, rt: 1.8 },
    shotgun_pump_east: { d: 75, r: .95 }, shotgun_pump_west: { d: 85, r: 1.1, rg: 14 }, shotgun_auto_east: { d: 55, r: .45, rt: 2.8 }, shotgun_auto_west: { d: 45, r: .3, rg: 16, rt: 3 },
    pistol_compact_east: { d: 16, r: .28 }, pistol_compact_west: { d: 19, r: .3 }, pistol_full_east: { d: 20, r: .28 }, pistol_full_west: { d: 18, r: .27 },
    sniper_rifle_west: { d: 70, r: .45, rg: 350 }, sniper_rifle_east: { d: 75, r: .5, rg: 360 }, sniper_material_west: { d: 120, r: 1.25, rg: 450, rt: 3.6 }, sniper_material_east: { d: 110, r: 1.3, rg: 430, rt: 3.5 }
  };
  window.WSTAT = ST;
  for (const t in BYT) if (WS[t]) for (const k of ['d', 'r', 'rg', 'rt']) { const base = WS[t][k]; WS[t]['_' + k] = base; Object.defineProperty(WS[t], k, { configurable: true, get() { try { const q = cur >= 0 ? slots[cur] : null; if (q && q.t === t && q.v && ST[q.v] && ST[q.v][k] != null) return ST[q.v][k]; } catch (e) { } return base; } }); }

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
  // retícula da luneta 2x desenhada DENTRO da lente (não passa da borda)
  let _ret = null; function RETX() { if (_ret) return _ret; const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
    x.strokeStyle = '#000'; x.lineWidth = 3; x.beginPath(); x.moveTo(128, 6); x.lineTo(128, 112); x.moveTo(128, 144); x.lineTo(128, 250); x.moveTo(6, 128); x.lineTo(112, 128); x.moveTo(144, 128); x.lineTo(250, 128); x.stroke();
    x.lineWidth = 1.5; x.beginPath(); x.moveTo(128, 112); x.lineTo(128, 144); x.moveTo(112, 128); x.lineTo(144, 128); x.stroke();
    x.fillStyle = '#e22'; x.beginPath(); x.arc(128, 128, 3.5, 0, 7); x.fill();
    const gr = x.createRadialGradient(128, 128, 104, 128, 128, 128); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.85)'); x.fillStyle = gr; x.fillRect(0, 0, 256, 256);
    _ret = new T.CanvasTexture(c); return _ret; }
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
    // onde a mão esquerda vai na recarga (boca do carregador de cada modelo)
    u.mg = t === 'pistol' ? [0, Gm[1] - .07, Gm[0] - .01] : t === 'shotgun' ? [0, Gm[1] + .02, Gm[0] + .12] : [0, Gm[1] + .01, Gm[0] + .13];
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
    let ey = [0, Sm[1] - .006, Sm[0] - (t === 'pistol' ? .3 : .16)];
    if ((t === 'rifle' || t === 'sniper') && lv > 0) {
      const yb = Math.max(Rm[1], Sm[1] - .012), ax = yb + .052, zc = Rm[0] + .02;
      if (lv === 1) {
        // mira holográfica: base no trilho, duas colunas finas e uma barra em cima; vidro limpo (dá para ver através) e ponto vermelho
        add(new T.BoxGeometry(.044, .01, .06), blk, 0, yb + .005, zc);
        for (const sx of [-1, 1]) add(new T.BoxGeometry(.005, .05, .03), blk, sx * .024, yb + .035, zc + .012);
        add(new T.BoxGeometry(.053, .005, .03), blk, 0, yb + .061, zc + .012);
        const gl = new T.Mesh(new T.PlaneGeometry(.043, .05), new T.MeshBasicMaterial({ color: 0x9fdcff, transparent: true, opacity: .08, depthWrite: false, side: T.DoubleSide })); gl.position.set(0, yb + .035, zc + .012); g.add(gl);
        const dm = new T.MeshBasicMaterial({ color: 0xff2a2a, depthTest: false, transparent: true }), d = new T.Mesh(new T.CircleGeometry(.0014, 12), dm); d.rotation.y = Math.PI; d.position.set(0, yb + .035, zc + .011); d.renderOrder = 9; g.add(d);
        const rg = new T.Mesh(new T.RingGeometry(.0065, .0075, 24), dm); rg.rotation.y = Math.PI; rg.position.copy(d.position); rg.renderOrder = 9; g.add(rg);
        ey = [0, yb + .035, zc - .3];
      } else if (lv === 2) {
        add(new T.BoxGeometry(.03, ax - yb - .02, .1), blk, 0, (yb + ax - .02) / 2, zc);
        Z(.022, .022, .16, blk, 0, ax, zc, 16); Z(.03, .024, .04, blk, 0, ax, zc + .1, 16); Z(.028, .022, .035, blk, 0, ax, zc - .095, 16);
        const tb = new T.Mesh(new T.CircleGeometry(.019, 24), vm ? new T.MeshBasicMaterial({ map: rt.texture, fog: false }) : (M.lens || blk)); tb.rotation.y = Math.PI; tb.position.set(0, ax, zc - .116); g.add(tb); if (vm) { const rt_ = new T.Mesh(new T.CircleGeometry(.019, 24), new T.MeshBasicMaterial({ map: RETX(), transparent: true, depthWrite: false, fog: false })); rt_.rotation.y = Math.PI; rt_.position.set(0, ax, zc - .1165); rt_.renderOrder = 10; g.add(rt_); } /* lente plana virada para o olho: a imagem ampliada fica na posição certa */
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

  // carregador novo na mão esquerda enquanto recarrega (o modelo da arma é uma peça só)
  try {
    const MM = new T.MeshStandardMaterial({ color: lin(0x1d1f22), metalness: .5, roughness: .45 }), MB = new T.MeshStandardMaterial({ color: lin(0xb08a3a), metalness: .8, roughness: .3 });
    const HM = new T.Group(); HM.position.set(0, -.36, .06); aL.el.add(HM);
    const box_ = new T.Mesh(new T.BoxGeometry(.03, .16, .05), MM); box_.rotation.x = .25; HM.add(box_);
    const tip = new T.Mesh(new T.BoxGeometry(.02, .015, .035), MB); tip.position.set(0, .085, .02); HM.add(tip);
    const shell = new T.Mesh(new T.CylinderGeometry(.011, .011, .07, 8), new T.MeshStandardMaterial({ color: lin(0xa32020), roughness: .5 })); shell.rotation.x = Math.PI / 2; HM.add(shell);
    HM.visible = false;
    setInterval(() => { let on = false, sg = false; try { on = !!rlOn && mode === 'ground' && cur >= 0 && slots[cur] && slots[cur].t !== 'bow' && rl > .06 && rl < .5; sg = on && slots[cur].t === 'shotgun'; const sz = slots[cur] && slots[cur].t === 'pistol' ? .65 : 1; HM.scale.setScalar(sz); } catch (e) { } HM.visible = on; box_.visible = tip.visible = on && !sg; shell.visible = sg; }, 40);
  } catch (e) { console.warn('carregador', e); }
  load();
})();
