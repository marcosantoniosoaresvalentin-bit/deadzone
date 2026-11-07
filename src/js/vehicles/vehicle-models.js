/* Deadzone · vehicles/vehicle-models.js
 * Modelos novos dos veículos:
 * - Carro: carroceria com silhueta de verdade (capô, para-brisa, teto, porta-malas,
 *   caixas de roda), vidros, faróis, lanternas, para-choques, grade, retrovisores e
 *   rodas com pneu e roda de liga.
 * - Helicóptero: fuselagem arredondada, cauda cônica, cabine de vidro, esquis e rotores.
 * - Avião: materiais metálicos, janelas e faixa de pintura.
 * Mantém a mesma interface (g.body, g.cab, g.userData) usada pela física e pelo dano.
 */
(function () {
  const S = (c, r, m) => new T.MeshStandardMaterial({ color: lin(c), roughness: r, metalness: m });
  const VM_ = {
    dark: S(0x16181b, .65, .3), trim: S(0x2a2c30, .5, .5), chrome: S(0xc8ccd2, .18, .95), tire: S(0x111112, .95, 0), rim: S(0xa9afb6, .3, .9),
    glass: new T.MeshStandardMaterial({ color: lin(0x1a2a36), roughness: .05, metalness: .9, transparent: true, opacity: .78 }),
    head: new T.MeshBasicMaterial({ color: 0xfff6d8 }), tail: new T.MeshBasicMaterial({ color: 0xc81818 }), amber: new T.MeshBasicMaterial({ color: 0xffa020 }), plate: S(0xeeeeee, .6, 0)
  };
  // perfil lateral (z, y) extrudado na largura w, centrado em x
  function side(pts, w, bev) {
    const s = new T.Shape(); s.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]); s.closePath();
    const g = new T.ExtrudeGeometry(s, { depth: w - bev * 2, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 3, curveSegments: 8 });
    g.rotateY(-Math.PI / 2); g.translate((w - bev * 2) / 2, 0, 0); return g;
  }
  const arch = (out, zc, r, y0, from, to) => { for (let i = 0; i <= 10; i++) { const a = from + (to - from) * i / 10; out.push([zc + Math.cos(a) * r, y0 + Math.sin(a) * r]); } };

  let CARG = null;
  function carGeos() {
    if (CARG) return CARG;
    const wz = 1.4, wr = .47, y0 = .38;
    const body = [[2.2, .38], [2.25, .62], [2.17, .82], [1.95, .9], [1.0, .98], [-1.45, .98], [-2.05, .98], [-2.2, .82], [-2.24, .45], [-2.2, .38]];
    // borda inferior com as caixas de roda (de trás para a frente)
    const bot = [];
    bot.push([-2.2, .38]); arch(bot, -wz, wr, y0, Math.PI, 0); arch(bot, wz, wr, y0, Math.PI, 0); bot.push([2.2, .38]);
    const pts = body.slice(0, -1).concat(bot.slice(0, -1));
    const green = [[.98, .98], [.28, 1.43], [-.9, 1.47], [-1.5, 1.0]];
    CARG = {
      body: side(pts, 1.96, .07), roof: side([[.3, 1.42], [-.88, 1.46], [-.9, 1.5], [.28, 1.47]], 1.62, .03),
      glass: side(green, 1.7, .02),
      tire: new T.CylinderGeometry(.38, .38, .27, 22), tireIn: new T.TorusGeometry(.3, .07, 8, 22), rim: new T.CylinderGeometry(.25, .25, .285, 18),
      hub: new T.CylinderGeometry(.06, .06, .3, 10), spoke: new T.BoxGeometry(.05, .2, .05)
    };
    return CARG;
  }
  window.DZCar = function (bodyMat, o) {
    o = o || {}; const G = carGeos(), g = new T.Group(), P = [], D = [];
    const pa = (geo, x, y, z, rx, ry, rz) => P.push([geo, bodyMat, x, y, z, rx || 0, ry || 0, rz || 0]);
    const da = (geo, m, x, y, z, rx, ry, rz) => D.push([geo, m, x, y, z, rx || 0, ry || 0, rz || 0]);
    const bx = (a, b, c) => new T.BoxGeometry(a, b, c);
    pa(G.body, 0, 0, 0); pa(G.roof, 0, 0, 0);
    for (const s of [-1, 1]) {
      pa(bx(.06, .5, .07), s * .8, 1.2, .64, -.6); pa(bx(.06, .46, .07), s * .82, 1.2, -1.2, .7); pa(bx(.06, .46, .06), s * .84, 1.2, -.3);
      da(bx(.12, .09, .2), VM_.dark, s * 1.05, 1.05, .78); da(bx(.03, .08, .16), VM_.chrome, s * 1.11, 1.05, .78);           // retrovisores
      da(bx(.02, .04, .16), VM_.chrome, s * 1.0, .82, .25); da(bx(.02, .04, .16), VM_.chrome, s * 1.0, .82, -.65);           // maçanetas
      da(bx(.02, .05, 3.0), VM_.trim, s * 1.0, .5, -.1);                                                                      // soleira
      da(bx(.42, .14, .06), VM_.head, s * .68, .74, 2.21, .1); da(bx(.46, .17, .04), VM_.chrome, s * .68, .74, 2.2, .1);      // faróis
      da(bx(.12, .06, .05), VM_.amber, s * .95, .58, 2.2); da(bx(.42, .16, .06), VM_.tail, s * .66, .8, -2.2);                // pisca / lanternas
    }
    da(bx(1.0, .2, .05), VM_.dark, 0, .66, 2.24); for (let i = 0; i < 4; i++) da(bx(.96, .02, .055), VM_.chrome, 0, .58 + i * .05, 2.245); // grade
    da(bx(2.0, .2, .2), VM_.trim, 0, .45, 2.26); da(bx(2.0, .2, .2), VM_.trim, 0, .45, -2.27);                                        // para-choques
    da(bx(.52, .14, .02), VM_.plate, 0, .48, 2.37); da(bx(.52, .14, .02), VM_.plate, 0, .62, -2.24);
    da(bx(1.6, .03, 3.6), VM_.dark, 0, .33, 0);
    if (o.sport) { pa(bx(1.7, .05, .36), 0, 1.08, -2.0); for (const s of [-1, 1]) da(bx(.05, .12, .05), VM_.dark, s * .65, 1.02, -2.0); }
    // rodas
    for (const a of [-1, 1]) for (const b of [-1, 1]) {
      const x = a * .99, z = b * 1.4;
      da(G.tire, VM_.tire, x, .38, z, 0, 0, Math.PI / 2); da(G.rim, VM_.rim, a * 1.0, .38, z, 0, 0, Math.PI / 2); da(G.hub, VM_.chrome, a * 1.01, .38, z, 0, 0, Math.PI / 2);
      for (let k = 0; k < 5; k++) { const an = k / 5 * Math.PI * 2; da(G.spoke, VM_.trim, a * 1.14, .38 + Math.cos(an) * .1, z + Math.sin(an) * .1, an, 0, 0); }
    }
    const pt = new T.Group(); bake(pt, P, true); const body = pt.children[0]; g.add(body); for (const c of pt.children.slice(1)) g.add(c);
    const sg = new T.Group(); bake(sg, D, true); const ex = sg.children.slice(); g.add(sg);
    const cab = new T.Mesh(G.glass, VM_.glass); g.add(cab);
    g.body = body; g.cab = cab; g.userData.ex = ex; return g;
  };

  /* ---------- helicóptero ---------- */
  let HG_ = null;
  window.DZHeli = function (o) {
    o = o || {};
    const bc = o.body != null ? o.body : 0x4a5a3a, ac = o.accent != null ? o.accent : 0xe0b020, dk = o.dark != null ? o.dark : 0x1d2229, mil = o.mil == null ? 1 : o.mil;
    const BODY = S(bc, .5, .3), DARK = S(dk, .6, .4), ACC = S(ac, .45, .25), MET = S(0x8c939a, .35, .75), SEAT = S(0x30353c, .9, .1);
    const GLS = new T.MeshStandardMaterial({ color: lin(0x14354d), roughness: .05, metalness: .85, transparent: true, opacity: .6 });
    if (!HG_) {
      const prof_ = [[0, -2.4], [.55, -2.35], [.9, -2.0], [1.08, -1.2], [1.12, 0], [1.08, 1.0], [.95, 1.8], [.72, 2.5], [.4, 2.95], [0, 3.1]].map(p => new T.Vector2(p[0], p[1]));
      const fus = new T.LatheGeometry(prof_, 26); fus.rotateX(Math.PI / 2); fus.scale(1, .95, 1);
      const boom = new T.CylinderGeometry(.2, .46, 5.2, 16); boom.rotateX(Math.PI / 2);
      const can = new T.SphereGeometry(1.0, 24, 14, 0, Math.PI * 2, 0, Math.PI * .5); can.scale(.98, .95, 1.5); can.rotateX(Math.PI * .5);
      HG_ = { fus, boom, can };
    }
    const g = new T.Group(); g.rotation.order = 'YXZ';
    const it = [], A = (geo, m, x, y, z, rx, ry, rz) => it.push([geo, m, x, y, z, rx || 0, ry || 0, rz || 0]), B = (a, b, c) => new T.BoxGeometry(a, b, c);
    A(HG_.fus, BODY, 0, 1.85, 0);
    A(HG_.boom, BODY, 0, 2.55, -4.6, -.05);
    A(B(.12, 1.7, 1.1), BODY, 0, 3.4, -7.05, -.42); A(B(.1, .8, .6), DARK, 0, 2.35, -7.15, .3);
    A(B(2.2, .08, .55), BODY, 0, 2.75, -6.3); for (const sx of [-1, 1]) A(B(.08, .45, .5), ACC, sx * 1.1, 2.8, -6.3);
    A(B(1.4, .7, 2.0), DARK, 0, 2.95, -.8); A(B(.9, .26, .1), MET, 0, 3.1, .25); for (const sx of [-1, 1]) A(new T.CylinderGeometry(.16, .14, .5, 12), MET, sx * .45, 3.0, -2.0, Math.PI / 2);
    A(B(.22, .8, .22), DARK, 0, 3.75, -.95); A(new T.CylinderGeometry(.32, .32, .22, 14), DARK, 0, 4.2, -.95);
    A(B(2.26, .16, 2.4), ACC, 0, 1.5, -.6);
    for (const sx of [-1, 1]) {
      A(new T.CylinderGeometry(.07, .07, 5.2, 8), DARK, sx * 1.2, .12, .3, Math.PI / 2); A(new T.CylinderGeometry(.07, .07, .7, 8), DARK, sx * 1.2, .3, 3.0, Math.PI / 2 + .55);
      A(new T.CylinderGeometry(.05, .05, 1.0, 8), DARK, sx * 1.05, .62, 1.3, 0, 0, sx * .2); A(new T.CylinderGeometry(.05, .05, 1.0, 8), DARK, sx * 1.05, .62, -.9, 0, 0, sx * .2);
      A(B(.6, .28, .6), SEAT, sx * .48, 1.5, 1.0); A(B(.6, .8, .14), SEAT, sx * .48, 1.95, .62);
    }
    if (mil) { for (const sx of [-1, 1]) { A(B(1.3, .08, .6), DARK, sx * 1.7, 1.65, -.35); A(new T.CylinderGeometry(.24, .24, 1.7, 12), DARK, sx * 2.3, 1.5, -.15, Math.PI / 2); A(new T.CylinderGeometry(.2, .2, .1, 12), MET, sx * 2.3, 1.5, .72, Math.PI / 2); }
      A(B(.5, .4, .6), DARK, 0, .85, 2.3); A(new T.CylinderGeometry(.045, .045, 1.0, 8), MET, 0, .8, 2.95, Math.PI / 2); }
    else { for (const sx of [-1, 1]) A(B(.2, .5, 1.6), S(0xc7ccd1, .5, .3), sx * 1.2, .78, -.1); A(B(1.5, .12, .12), ACC, 0, 3.45, 1.2); }
    A(B(.3, .2, .12), S(0xfff6d6, .3, 0), 0, .9, 2.9);
    const stat = new T.Group(); bake(stat, it, true); g.add(stat);
    const gl = new T.Group(); const cm = new T.Mesh(HG_.can, GLS); cm.position.set(0, 1.95, 1.35); gl.add(cm); g.add(gl);
    // rotor principal (4 pás)
    const rot = new T.Group(); rot.position.set(0, 4.38, -.95);
    for (let k = 0; k < 4; k++) { const b = new T.Mesh(B(4.7, .04, .32), DARK); b.position.x = 2.35; const p = new T.Group(); p.rotation.y = k * Math.PI / 2; p.add(b); const tp = new T.Mesh(B(.5, .045, .33), S(ac, .5, .1)); tp.position.x = 4.5; p.add(tp); rot.add(p); }
    g.add(rot);
    const disc = new T.Mesh(new T.CircleGeometry(4.75, 36), new T.MeshBasicMaterial({ color: 0x0c1014, transparent: true, opacity: 0, side: T.DoubleSide, depthWrite: false }));
    disc.rotation.x = -Math.PI / 2; disc.position.set(0, 4.4, -.95); disc.userData.disc = 1; g.add(disc);
    const trot = new T.Group(); trot.position.set(.25, 3.55, -7.35);
    trot.add(new T.Mesh(B(.05, 1.5, .16), DARK), new T.Mesh(B(.05, .16, 1.5), DARK), new T.Mesh(B(.14, .2, .2), MET)); g.add(trot);
    const tdisc = new T.Mesh(new T.CircleGeometry(.78, 18), new T.MeshBasicMaterial({ color: 0x0c1014, transparent: true, opacity: 0, side: T.DoubleSide, depthWrite: false }));
    tdisc.rotation.y = Math.PI / 2; tdisc.position.set(.25, 3.55, -7.35); tdisc.userData.disc = 1; g.add(tdisc);
    const LB = (c, x, y, z) => { const m = new T.Mesh(B(.18, .18, .18), new T.MeshBasicMaterial({ color: c })); m.position.set(x, y, z); m.userData.light = 1; g.add(m); return m; };
    const red = LB(0xff2a2a, 1.15, 1.75, -.1), green = LB(0x2aff5a, -1.15, 1.75, -.1), strobe = LB(0xffffff, 0, 4.4, -7.6), beacon = LB(0xff3030, 0, .78, -.7);
    const fl = new T.Group(); fl.position.set(0, 3.4, -1.0); fl.visible = false;
    for (let i = 0; i < 3; i++) { const f = new T.Mesh(new T.ConeGeometry(.55 - i * .12, 1.7, 6), new T.MeshBasicMaterial({ color: i ? 0xffd040 : 0xff5a10, transparent: true, opacity: .85 })); f.position.set((i - 1) * .55, .8, 0); f.userData.light = 1; fl.add(f); }
    g.add(fl);
    if (o.lobby) { const cn = new T.Mesh(new T.CylinderGeometry(.12, 2.4, 7, 20, 1, true), new T.MeshBasicMaterial({ color: 0xcfeaff, transparent: true, opacity: .075, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, fog: false })); cn.rotation.x = -.2; cn.position.set(0, .8 - 3.4, 3.6); cn.userData.light = 1; g.add(cn); }
    g.userData = { rot, trot, disc, tdisc, red, green, strobe, beacon, fl, stat, gl };
    g.traverse(m => { if (m.isMesh && !m.userData.disc && !m.userData.light) m.castShadow = true; });
    return g;
  };

  /* ---------- avião: materiais metálicos, janelas e faixa ---------- */
  window.DZPlaneUp = function (plane) {
    plane.traverse(m => {
      if (!m.isMesh || !m.material || !m.material.isMeshPhongMaterial) return;
      const c = m.material.color.clone(), dark = c.getHSL({}).l < .08;
      m.material = new T.MeshStandardMaterial({ color: c, metalness: dark ? .2 : .55, roughness: dark ? .25 : .45, side: T.DoubleSide, envMapIntensity: 1.2 });
      m.castShadow = false;
    });
    const stripe = new T.Mesh(new T.CylinderGeometry(2.12, 2.12, 1.2, 28, 1, true), new T.MeshStandardMaterial({ color: lin(0xe8742d), roughness: .5, metalness: .3, side: T.DoubleSide }));
    stripe.rotation.x = Math.PI / 2; stripe.position.z = 3; plane.add(stripe);
    const wm = new T.MeshStandardMaterial({ color: lin(0x0c1822), roughness: .1, metalness: .9 });
    for (const s of [-1, 1]) for (let i = 0; i < 9; i++) { const w = new T.Mesh(new T.BoxGeometry(.06, .32, .38), wm); w.position.set(s * 2.06, .9, -7 + i * 1.5); plane.add(w); }
  };
})();

/* =====================================================================
   MODELOS 3D REALISTAS (Microsoft Remix 3D, CC0)
   Carregados depois que o mapa existe; cada veículo troca o visual quando
   está perto da câmera (longe, fica o modelo leve para não pesar no celular).
   ===================================================================== */
(function () {
  // caminhos escritos por extenso: o build de arquivo único embute cada um
  const URL_ = { helicopter: 'assets/models/vehicles/helicopter.glb', sedan: 'assets/models/vehicles/sedan.glb', suv: 'assets/models/vehicles/suv.glb', pickup: 'assets/models/vehicles/pickup.glb', taxi: 'assets/models/vehicles/taxi.glb', police: 'assets/models/vehicles/police.glb', buggy: 'assets/models/vehicles/buggy.glb' };
  const CAR_MODELS = [['sedan', 3, 4.5], ['suv', 3, 4.6], ['pickup', 2, 5.0], ['taxi', 1, 4.4], ['police', 1, 4.8], ['buggy', 1, 3.7]];
  const SRC = {}; let ready = false;
  // banco do motorista de cada modelo (coordenadas do veículo: +z = frente, +x = esquerda, y = altura do assento)
  const SEAT = window.DZSEAT = { sedan: new T.Vector3(.38, .62, -.2), suv: new T.Vector3(.4, .82, -.05), pickup: new T.Vector3(.4, .86, .3), taxi: new T.Vector3(.38, .62, -.15),
    police: new T.Vector3(.38, .62, -.2), buggy: new T.Vector3(.33, .52, -.25), helicopter: new T.Vector3(0, 1.35, 2.2) };
  const VEH = window.DZVEH = [];
  // registra cada carro/heli criado (inclusive os do lobby)
  const _car = window.DZCar, _heli = window.DZHeli;
  window.DZCar = function (m, o) { const g = _car(m, o); VEH.push({ g, heli: 0 }); return g; };
  window.DZHeli = function (o) { const g = _heli(o); VEH.push({ g, heli: 1 }); return g; };

  let prep = function (scene, len) {
    // centraliza, apoia no chão e ajusta o comprimento (eixo Z = frente)
    const root = new T.Group(), holder = new T.Group(); holder.add(scene); root.add(holder);
    scene.updateMatrixWorld(true);
    const b = new T.Box3().setFromObject(scene), s = b.getSize(new T.Vector3()), k = len / Math.max(.001, s.z);
    holder.scale.setScalar(k); holder.position.set(-(b.min.x + b.max.x) / 2 * k, -b.min.y * k, -(b.min.z + b.max.z) / 2 * k);
    scene.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; if (o.material) { o.material.envMapIntensity = 1.1; } } });
    return root;
  };
  function pivotOut(root, node) {
    // coloca uma peça (rotor) num grupo com pivô no centro dela, para poder girar
    if (!node) return null; root.updateMatrixWorld(true);
    const b = new T.Box3().setFromObject(node), c = b.getCenter(new T.Vector3()), piv = new T.Group();
    piv.position.copy(root.worldToLocal(c.clone())); root.add(piv);
    piv.updateMatrixWorld(true); piv.attach(node); return piv;
  }
  function clone(name) { return SRC[name] ? T.SkeletonUtils.clone(SRC[name]) : null; }

  function dress(v) {
    if (v.m || !ready) return;
    const g = v.g;
    if (v.heli) {
      const sc_ = clone('helicopter'); if (!sc_) return;
      const root = prep(sc_, 14.2); root.position.z = -.9; g.userData.seat = SEAT.helicopter.clone();
      let mr = null, hub = null, tf = null;
      sc_.traverse(o => { if (/main_rotor/.test(o.name)) mr = mr || o; if (/rotor_hub/.test(o.name)) hub = hub || o; if (/back_fan/.test(o.name)) tf = tf || o; if (/pilot|helmet_glass/i.test(o.name)) o.visible = false; });
      g.add(root);
      v.rot = pivotOut(root, mr); v.trot = pivotOut(root, tf);
      // esconde o modelo antigo, inclusive os discos escuros dos rotores (as pás de verdade já giram); mantém luzes e fogo
      const u = g.userData; v.old = [u.stat, u.gl, u.disc, u.tdisc, ...(u.rot ? u.rot.children : []), ...(u.trot ? u.trot.children : [])].filter(Boolean);
    } else {
      let r = Math.random() * CAR_MODELS.reduce((a, c) => a + c[1], 0), pick = CAR_MODELS[0];
      for (const c of CAR_MODELS) { r -= c[1]; if (r <= 0) { pick = c; break; } }
      if (v.kind0) pick = CAR_MODELS.find(c => c[0] === v.kind0) || pick;
      v.kind = pick[0]; g.userData.seat = (SEAT[pick[0]] || SEAT.sedan).clone();
      const sc_ = clone(pick[0]); if (!sc_) return;
      const root = prep(sc_, pick[2]); g.add(root);
      v.old = g.children.filter(c => c !== root);
    }
    v.root = g.children.find(c => c.userData && c.userData.dz) || null;
  }
  // marca a raiz do modelo novo para achar depois
  const _prep = prep;
  prep = function (s, l) { const r = _prep(s, l); r.userData.dz = 1; return r; };

  const _v = new T.Vector3(); let burnM = null;
  function tick() {
    requestAnimationFrame(tick);
    if (!ready || typeof cam === 'undefined') return;
    const q = (typeof CFG !== 'undefined' && CFG.q != null) ? CFG.q : 2, near = q === 0 ? 70 : q === 1 ? 110 : 160;
    for (const v of VEH) {
      if (!v.root) { dress(v); if (!v.root) continue; }
      v.g.getWorldPosition(_v); const n = _v.distanceTo(cam.position) < near;
      if (n !== v.n) { v.n = n; v.root.visible = n; for (const o of v.old) o.visible = !n; }
      if (v.heli) {
        const u = v.g.userData;
        if (v.rot && u.rot) v.rot.rotation.y = u.rot.rotation.y;
        if (v.trot && u.trot) v.trot.rotation.x = u.trot.rotation.x;
      } else if (!v.burnt) {
        const c = typeof CARS !== 'undefined' ? CARS.find(c => c.g === v.g) : null;
        if (c && c.dead) { v.burnt = 1; burnM = burnM || (typeof BURN !== 'undefined' ? BURN : new T.MeshStandardMaterial({ color: 0x151515 })); v.root.traverse(o => { if (o.isMesh) o.material = burnM; }); }
      }
    }
  }
  // carros SEM VIDRO (para ver quem está dentro): esconde as peças de vidro e, quando o vidro
  // está pintado na mesma textura da lataria (picape), recorta os pixels azulados das janelas
  function noGlass(scene) {
    scene.traverse(o => {
      if (!o.isMesh || !o.material) return;
      const m = o.material;
      if (m.transparent || m.opacity < 1) { o.visible = false; return; }
      if (m.userData.noGlass) return; m.userData.noGlass = 1;
      m.onBeforeCompile = s => { s.fragmentShader = s.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
        { vec3 c_=diffuseColor.rgb; float mx_=max(max(c_.r,c_.g),c_.b),mn_=min(min(c_.r,c_.g),c_.b);
          if(c_.b>c_.r*1.25&&c_.g>c_.r*1.12&&mx_-mn_>.035&&mx_<.75)discard; }`); };
      m.customProgramCacheKey = () => 'noglass'; m.side = T.DoubleSide; m.needsUpdate = true;
    });
  }
  function load() {
    const names = ['helicopter', ...CAR_MODELS.map(c => c[0])]; let left = names.length;
    for (const n of names) new T.GLTFLoader().load(URL_[n], g => { SRC[n] = g.scene; if (n !== 'helicopter') try { noGlass(g.scene); } catch (e) { } if (--left === 0) { ready = true; } }, undefined, e => { console.warn('veículo', n, e); if (--left === 0) ready = true; });
  }
  load(); requestAnimationFrame(tick);

  /* ---------- avião de lançamento: C-130 (YC-130 por KOG_THORNS, CC-BY 4.0) ---------- */
  new T.GLTFLoader().load('assets/models/vehicles/plane.glb', gl => {
    const go = () => {
      if (typeof plane === 'undefined' || typeof props === 'undefined') { setTimeout(go, 200); return; }
      const s = gl.scene; s.updateMatrixWorld(true);
      const b = new T.Box3().setFromObject(s), holder = new T.Group();
      // fuselagem no centro do grupo; o modelo vem com o nariz para -Z, então gira 180°
      s.position.set(-(b.min.x + b.max.x) / 2, -2.8, -3.3); holder.add(s); holder.rotation.y = Math.PI;
      s.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; if (o.material) o.material.envMapIntensity = 1.2; } });
      for (const c of plane.children) c.visible = false;
      plane.add(holder); holder.updateMatrixWorld(true);
      // as 4 hélices viram grupos com pivô no centro para girar
      const pr = []; s.traverse(o => { if (o.isMesh && /^Wings00[1-4]$/.test(o.parent && o.parent.name)) pr.push(o); });
      props.length = 0; for (const o of pr) { const p = pivotOut(holder, o); if (p) props.push(p); }
    };
    go();
  }, undefined, e => console.warn('avião', e));
})();
