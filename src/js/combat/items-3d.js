/* Deadzone · combat/items-3d.js
 * ITENS mais realistas (no chão, na mochila e na loja):
 *  - Lunetas 2x / 8x e silenciador: os mesmos modelos baixados que encaixam na arma (Quaternius, CC0).
 *  - Mira holográfica: corpo com janela de vidro, ponto vermelho, regulagens e trava de trilho.
 *  - Munição: caixa aberta com os cartuchos em pé (Kenney, CC0), um tipo e tamanho por calibre:
 *    5.56 · 5.45 · 7.62 · 9 mm · .45 ACP · calibre 12 (cartuchos vermelhos de escopeta) · .50.
 *  - Granada de fragmentação e de fumaça (Kenney, CC0) com cores militares.
 *  - Kit médico (bolsa vermelha com cruz, zíper e alças) e bandagem (rolo de gaze com ponta solta).
 *  - O GEL saiu do jogo.
 */
(function () {
  const Mt = (c, me, ro) => new T.MeshStandardMaterial({ color: lin(c), metalness: me || 0, roughness: ro == null ? .7 : ro });
  const BR = Mt(0xc49a45, .85, .28), CU = Mt(0xb8653a, .8, .32), SHELL = Mt(0xb42820, .05, .55), STEEL = Mt(0x5a5f66, .7, .35), OLIVE = Mt(0x4d5a36, .15, .6), GREY = Mt(0x9aa0a6, .4, .45), BLK = Mt(0x1d1f22, .45, .45);
  const SRC = {};
  // ---------- modelos Kenney: recolore (as cores originais são pastel) ----------
  function recolor(scn, kind) {
    scn.traverse(o => {
      if (!o.isMesh || !o.material) return; const c = o.material.color || new T.Color(1, 1, 1), hsl = {}; c.getHSL(hsl);
      if (kind === 'bullet') o.material = (hsl.h > .08 && hsl.h < .2) ? BR : CU;                       // estojo amarelo -> latão; ponta rosa -> cobre
      else if (kind === 'shell') o.material = (hsl.h > .08 && hsl.h < .2) ? BR : SHELL;                // base de latão + tubo vermelho
      else if (kind === 'gren') o.material = hsl.s > .15 && hsl.h > .2 ? OLIVE : (hsl.l > .7 ? GREY : STEEL);
      else if (kind === 'smoke') o.material = hsl.s > .15 && hsl.h > .2 ? Mt(0x8f969c, .3, .5) : (hsl.l > .7 ? Mt(0xd8dcdf, .2, .5) : BLK);
      o.castShadow = true;
    });
    return scn;
  }
  const merge = scn => { scn.updateMatrixWorld(true); const g = new T.Group(); scn.traverse(o => { if (o.isMesh) { const m = new T.Mesh(o.geometry.clone().applyMatrix4(o.matrixWorld), o.material); m.castShadow = true; g.add(m); } }); return g; };

  // ---------- munição: caixa aberta com cartuchos ----------
  // [modelo Kenney, altura real do cartucho (m), cor da caixa, rótulo]
  const AM = { a556: ['machinegun', .057, 0x5a6b3a, '5.56'], a545: ['machinegun', .057, 0x6b5a3a, '5.45'], a762: ['sniper', .071, 0x3c4a2c, '7.62'], a9: ['uzi', .029, 0x2c4a6b, '9mm'], a45: ['uzi', .032, 0x4a2c5a, '.45'], a12: ['shotgun', .07, 0x7a2a20, '12'], a50: ['sniper', .138, 0x2a2d31, '.50'] };
  const LBL = {};
  function label(txt, col) { if (LBL[txt]) return LBL[txt]; const c = document.createElement('canvas'); c.width = 128; c.height = 64; const g = c.getContext('2d'); g.fillStyle = '#' + new T.Color(col).getHexString(); g.fillRect(0, 0, 128, 64); g.fillStyle = '#f2e6c8'; g.fillRect(6, 14, 116, 36); g.fillStyle = '#1b1b1b'; g.font = '900 26px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 64, 33); const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; return (LBL[txt] = t); }
  function ammoBox(cal) {
    const D = AM[cal] || AM.a556, src = SRC['ammo_' + D[0]], g = new T.Group();
    const h = D[1], gap = D[0] === 'shotgun' ? h * .32 : h * .24, nx = 4, nz = 3, W = nx * gap + .012, Dp = nz * gap + .012, Hb = h * .62;
    const box = Mt(D[2], .1, .75), lab = new T.MeshStandardMaterial({ map: label(D[3], D[2]), roughness: .8 });
    const add = (geo, m, x, y, z) => { const me = new T.Mesh(geo, m); me.position.set(x, y, z); me.castShadow = true; g.add(me); return me; };
    add(new T.BoxGeometry(W, .004, Dp), box, 0, .002, 0);
    add(new T.BoxGeometry(W, Hb, .004), lab, 0, Hb / 2, Dp / 2); add(new T.BoxGeometry(W, Hb, .004), box, 0, Hb / 2, -Dp / 2);
    add(new T.BoxGeometry(.004, Hb, Dp), box, W / 2, Hb / 2, 0); add(new T.BoxGeometry(.004, Hb, Dp), box, -W / 2, Hb / 2, 0);
    const lid = add(new T.BoxGeometry(W, .004, Dp), box, 0, Hb + Dp / 2 * .9, -Dp / 2 - .002); lid.rotation.x = -1.35; lid.position.set(0, Hb + Dp * .44, -Dp / 2 - .01);
    if (src) { const b0 = new T.Box3().setFromObject(src), k = h / Math.max(.001, b0.max.y - b0.min.y);
      for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) { const c = src.clone(); c.scale.setScalar(k); c.position.set(-W / 2 + .006 + gap * (i + .5), .004 - b0.min.y * k, -Dp / 2 + .006 + gap * (j + .5)); g.add(c); }
      // dois cartuchos soltos ao lado
      for (const [x, z, r] of [[W / 2 + gap, 0, 1.4], [W / 2 + gap * 1.8, gap, .3]]) { const c = src.clone(); c.scale.setScalar(k); c.rotation.set(0, r, Math.PI / 2); c.position.set(x, gap * .3, z); g.add(c); } }
    g.scale.setScalar(D[0] === 'sniper' && cal === 'a50' ? 1.3 : D[0] === 'uzi' ? 2.2 : 1.7); // um pouco maior para dar de ver no chão
    const o = new T.Group(); o.add(g); return o;
  }
  // ---------- mira holográfica ----------
  function holo() {
    const g = new T.Group(), add = (geo, m, x, y, z, rx) => { const me = new T.Mesh(geo, m); me.position.set(x, y, z); if (rx) me.rotation.x = rx; me.castShadow = true; g.add(me); return me; };
    add(new T.BoxGeometry(.046, .012, .075), BLK, 0, .006, 0);                                     // base com trava de trilho
    add(new T.BoxGeometry(.052, .008, .02), STEEL, 0, .004, -.022); add(new T.CylinderGeometry(.006, .006, .012, 10), STEEL, .03, .006, -.022, 0).rotation.z = Math.PI / 2;
    add(new T.BoxGeometry(.044, .016, .05), BLK, 0, .02, -.008);                                   // corpo da bateria
    for (const s of [-1, 1]) add(new T.BoxGeometry(.006, .052, .034), BLK, s * .023, .046, .014); // laterais do capuz
    add(new T.BoxGeometry(.052, .006, .034), BLK, 0, .074, .014);                                   // capuz
    add(new T.CylinderGeometry(.006, .006, .01, 10), STEEL, .026, .028, -.012).rotation.z = Math.PI / 2; // regulagem
    const gl = add(new T.PlaneGeometry(.04, .045), new T.MeshStandardMaterial({ color: lin(0x6fb7e0), metalness: .9, roughness: .05, transparent: true, opacity: .45 }), 0, .048, .02); gl.castShadow = false;
    const d = add(new T.CircleGeometry(.0035, 10), new T.MeshBasicMaterial({ color: 0xff2a2a }), 0, .048, .019); d.rotation.y = Math.PI; d.castShadow = false;
    return g;
  }
  // ---------- kit médico ----------
  function medkit() {
    const g = new T.Group(), RED = Mt(0xb3221c, .05, .7), WH = Mt(0xf2f2ee, 0, .6), DK = Mt(0x2a2d31, .2, .6);
    const sh = new T.Shape(), w = .17, h = .1, r = .035; sh.moveTo(-w + r, -h); sh.lineTo(w - r, -h); sh.quadraticCurveTo(w, -h, w, -h + r); sh.lineTo(w, h - r); sh.quadraticCurveTo(w, h, w - r, h); sh.lineTo(-w + r, h); sh.quadraticCurveTo(-w, h, -w, h - r); sh.lineTo(-w, -h + r); sh.quadraticCurveTo(-w, -h, -w + r, -h);
    const bg = new T.ExtrudeGeometry(sh, { depth: .12, bevelEnabled: true, bevelThickness: .02, bevelSize: .02, bevelSegments: 3, curveSegments: 6 }); bg.rotateX(-Math.PI / 2); bg.translate(0, .02, .06);
    const bag = new T.Mesh(bg, RED); bag.castShadow = true; g.add(bag);
    const top = .16; const crossA = new T.Mesh(new T.BoxGeometry(.11, .004, .035), WH), crossB = new T.Mesh(new T.BoxGeometry(.035, .004, .11), WH); crossA.position.set(0, top + .003, 0); crossB.position.copy(crossA.position); g.add(crossA, crossB);
    const zip = new T.Mesh(new T.BoxGeometry(.35, .008, .006), DK); zip.position.set(0, .1, .105); g.add(zip); const zip2 = zip.clone(); zip2.position.z = -.105; g.add(zip2);
    const pull = new T.Mesh(new T.BoxGeometry(.012, .028, .004), STEEL); pull.position.set(.12, .09, .11); g.add(pull);
    const hd = new T.Mesh(new T.TorusGeometry(.04, .009, 6, 14, Math.PI), DK); hd.position.set(0, top, 0); g.add(hd);
    for (const s of [-1, 1]) { const st = new T.Mesh(new T.BoxGeometry(.03, .14, .008), DK); st.position.set(s * .13, .09, .108); g.add(st); }
    return g;
  }
  // ---------- bandagem ----------
  function bandage() {
    const g = new T.Group(), c = document.createElement('canvas'); c.width = 64; c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#efe9da'; x.fillRect(0, 0, 64, 64); x.strokeStyle = 'rgba(160,150,130,.5)'; for (let i = 0; i < 64; i += 4) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 64); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(64, i); x.stroke(); }
    const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(3, 1); const GZ = new T.MeshStandardMaterial({ map: t, roughness: .95 });
    const roll = new T.Mesh(new T.CylinderGeometry(.045, .045, .08, 24), GZ); roll.rotation.z = Math.PI / 2; roll.position.y = .045; roll.castShadow = true; g.add(roll);
    const core = new T.Mesh(new T.CylinderGeometry(.016, .016, .082, 12), Mt(0xbfb7a2, 0, .9)); core.rotation.z = Math.PI / 2; core.position.y = .045; g.add(core);
    const tail = new T.Mesh(new T.PlaneGeometry(.078, .16), GZ); tail.rotation.x = -Math.PI / 2; tail.position.set(0, .002, .1); g.add(tail);
    const clip = new T.Mesh(new T.BoxGeometry(.02, .004, .02), STEEL); clip.position.set(0, .004, .17); g.add(clip);
    const roll2 = roll.clone(); roll2.position.set(.12, .045, -.05); roll2.rotation.y = .6; g.add(roll2);
    return g;
  }

  // ---------- DZItem: troca os modelos ----------
  const _DZ = window.DZItem, _has = _DZ && _DZ.has;
  const att = k => { const A = window.DZATT && DZATT[k]; if (!A) return null; const g = new T.Group(), m = new T.Mesh(A.geo, A.mat); m.castShadow = true; m.position.set(0, -A.bottom, -A.len / 2); g.add(m); g.scale.setScalar(1.25); return g; };
  const CA = {};
  const cached = (k, f) => { if (!CA[k]) { const m = f(); if (!m) return null; CA[k] = m; } return CA[k].clone(true); };
  window.DZItem = function (t) {
    try {
      if (t && t.startsWith('ammo:')) return SRC.ammo_uzi ? cached(t, () => ammoBox(t.slice(5))) : ammoBox(t.slice(5));
      if (t === 'ammo') return ammoBox('a556');
      if (t === 'scope1') { const g = holo(); g.scale.setScalar(1.5); return g; }
      if (t === 'scope2') return att('s2') || _DZ(t);
      if (t === 'scope8') return att('s8') || _DZ(t);
      if (t === 'sil') return att('sil') || _DZ(t);
      if (t === 'gren' && SRC.gren) { const g = SRC.gren.clone(); g.scale.setScalar(1.15); return g; }
      if (t === 'smoke' && SRC.smoke) { const g = SRC.smoke.clone(); g.scale.setScalar(1.15); return g; }
      if (t === 'med') return cached('med', medkit);
      if (t === 'bandage') return cached('band', bandage);
    } catch (e) { console.warn('item', t, e); }
    return _DZ(t);
  };
  DZItem.has = t => (t && t.startsWith('ammo:')) || (_has ? _has(t) : false);

  // ---------- carrega os modelos Kenney e atualiza o que já está no chão ----------
  const LIST = [['ammo_machinegun', 'item_ammo_machinegun', 'bullet'], ['ammo_sniper', 'item_ammo_sniper', 'bullet'], ['ammo_uzi', 'item_ammo_uzi', 'bullet'], ['ammo_shotgun', 'item_ammo_shotgun', 'shell'], ['gren', 'item_grenade', 'gren'], ['smoke', 'item_grenadesmoke', 'smoke']];
  let left = LIST.length;
  let tries = 0;
  const fin = () => {
    if (!(window.DZATT && DZATT.s2) && tries++ < 40) { setTimeout(fin, 400); return; } // espera as lunetas também
    try { if (window.DZPICCLR) DZPICCLR(); } catch (e) { }
    // itens já no chão: troca o modelo
    try { for (const o of loot) { if (WS[o.t]) continue; const key = o.t === 'ammo' ? 'ammo:' + (o.cal || 'a556') : ['scope1', 'scope2', 'scope8', 'sil', 'gren', 'smoke', 'med', 'bandage'].includes(o.t) ? o.t : null; if (!key) continue; const m = DZItem(key); if (!m) continue; const g = o.g; while (g.children.length) g.remove(g.children[0]); g.add(m); g.position.y = 0; o.top.updateMatrixWorld(true); const bb = new T.Box3(); g.traverse(q => { if (q.isMesh) bb.expandByObject(q); }); if (bb.min.y < 1e8) g.position.y -= bb.min.y - o.top.position.y - .01; o.top.updateMatrixWorld(true); o.top.traverse(q => { q.updateMatrix(); q.matrixAutoUpdate = false; }); } } catch (e) { console.warn(e); }
  };
  for (const [k, f, kind] of LIST) new T.GLTFLoader().load('assets/models/weapons/' + f + '.glb', g => { SRC[k] = merge(recolor(g.scene, kind)); if (--left === 0) fin(); }, undefined, () => { if (--left === 0) fin(); });
  // munição nova que nasce no chão já com o modelo do calibre
  const _mk = mkLoot;
  mkLoot = function (t, x, z, am, lv, sil) { _mk(t, x, z, am, lv, sil); const o = loot[loot.length - 1]; if (o && o.t === 'ammo' && o.cal && left === 0) { const m = DZItem('ammo:' + o.cal), g = o.g; while (g.children.length) g.remove(g.children[0]); g.add(m); o.top.updateMatrixWorld(true); const bb = new T.Box3(); g.traverse(q => { if (q.isMesh) bb.expandByObject(q); }); if (bb.min.y < 1e8) g.position.y -= bb.min.y - o.top.position.y - .01; o.top.updateMatrixWorld(true); o.top.traverse(q => { q.updateMatrix(); q.matrixAutoUpdate = false; }); } };

  // ---------- sem GEL no jogo ----------
  try { for (let i = SP.length - 1; i >= 0; i--) if (SP[i][0] === 'gel') SP.splice(i, 1); } catch (e) { }
  setInterval(() => { try { if (bag.gel) bag.gel = 0; if (TS === 'gel') TS = 0; if (typeof THR !== 'undefined' && THR === 'gel') THR = null; } catch (e) { } }, 300);
})();
