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
  const URL_ = { helicopter: 'assets/models/vehicles/helicopter.glb', buggy: 'assets/models/vehicles/buggy.glb' };
  // só o buggy no jogo (sedã, SUV e picape removidos)
  const CAR_MODELS = [['buggy', 1, 3.7]];
  const SRC = {}; let ready = false;
  // banco do motorista de cada modelo (coordenadas do veículo: +z = frente, +x = esquerda, y = altura do assento)
  // CABINE de cada modelo (medida no próprio modelo): banco do motorista (quadril), painel, largura interna,
  // assoalho e banco de trás. Coordenadas do veículo: +z = frente, +x = lado do motorista (esquerdo).
  const CAB = window.DZCAB = {
    buggy:  { seat: [.33, .5, -.32], dashZ: .22, dashY: .72, hw: .62, floor: .32, rear: null, roof: 2.2, open: 1 }
  };
  const SEAT = window.DZSEAT = { helicopter: new T.Vector3(0, 1.5, 1.25) };
  for (const k in CAB) SEAT[k] = new T.Vector3(...CAB[k].seat);
  // interior simples e leve: bancos com encosto e apoio de cabeça, painel, volante, console e assoalho
  const IM = {};
  const imat = (k, c, r) => IM[k] || (IM[k] = new T.MeshStandardMaterial({ color: lin(c), roughness: r, metalness: 0 }));
  function interior(kind) {
    const C = CAB[kind]; if (!C) return null;
    const g = new T.Group(), fab = imat('fab', 0x26282b, .95), pla = imat('pla', 0x15171a, .7), car = imat('car', 0x1b1c1e, 1);
    const box = (m, w, h, d, x, y, z, rx) => { const o = new T.Mesh(new T.BoxGeometry(w, h, d), m); o.position.set(x, y, z); if (rx) o.rotation.x = rx; o.castShadow = false; o.receiveShadow = true; g.add(o); return o; };
    const [sx, sy, sz] = C.seat;
    const seat = (x, z, w) => { box(fab, w, .12, .5, x, sy - .08, z + .05); box(fab, w, .62, .12, x, sy + .26, z - .24, -.22); box(fab, w * .55, .18, .1, x, sy + .66, z - .32, -.22); };
    seat(sx, sz, .5); seat(-sx, sz, .5);
    if (C.rear != null) { box(fab, C.hw * 2 - .2, .12, .5, 0, sy - .1, C.rear + .05); box(fab, C.hw * 2 - .2, .58, .12, 0, sy + .22, C.rear - .25, -.2); }
    if (!C.open) box(car, C.hw * 2, .04, Math.abs(C.dashZ - (C.rear != null ? C.rear : sz) + .7), 0, C.floor, (C.dashZ + (C.rear != null ? C.rear : sz) - .5) / 2);
    box(pla, C.hw * 2 - .04, .22, .34, 0, C.dashY, C.dashZ + .08, -.25);   // painel
    box(pla, .2, .3, .7, 0, sy - .02, sz + .18);                           // console
    // volante (anel + raios) em um pivô que gira com a direção
    const wp = new T.Group(); wp.position.set(sx, sy + .44, sz + .5); wp.rotation.x = -.42; g.add(wp);
    const ring = new T.Mesh(new T.TorusGeometry(.17, .022, 8, 24), pla); wp.add(ring);
    for (let k = 0; k < 3; k++) { const a = k * 2.094 + Math.PI / 2, sp = new T.Mesh(new T.BoxGeometry(.03, .16, .02), pla); sp.position.set(Math.cos(a) * .085, Math.sin(a) * .085, 0); sp.rotation.z = a - Math.PI / 2; wp.add(sp); }
    const col = new T.Mesh(new T.CylinderGeometry(.03, .04, .3, 8), pla); col.rotation.x = Math.PI / 2 - .42; col.position.set(sx, sy + .38, sz + .66); g.add(col);
    g.userData.wheel = wp; g.userData.wheelR = .17; return g;
  }
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
  // vidro da cabine do helicóptero: claro e transparente para ver o piloto
  let _hg = null; const HGLASS = () => _hg || (_hg = new T.MeshStandardMaterial({ color: lin(0xbfd8e6), transparent: true, opacity: .2, roughness: .05, metalness: .2, depthWrite: false, side: T.DoubleSide }));
  // hélice: pivô no CENTRO DO CUBO (média dos vértices, não a caixa) e eixo = direção perpendicular
  // ao disco da hélice (menor variação dos vértices). Assim ela gira reta, no lugar do motor.
  function propPivot(root, node) {
    root.updateMatrixWorld(true); node.updateMatrixWorld(true);
    const P = node.geometry.attributes.position, inv = new T.Matrix4().copy(root.matrixWorld).invert(), m = new T.Matrix4().multiplyMatrices(inv, node.matrixWorld), v = new T.Vector3(), c = new T.Vector3(), pts = [];
    // posições compactadas (KHR_mesh_quantization): converte o inteiro de volta para -1..1
    const A = P.array, dn = !P.normalized ? 1 : A instanceof Int16Array ? 32767 : A instanceof Uint16Array ? 65535 : A instanceof Int8Array ? 127 : A instanceof Uint8Array ? 255 : 1;
    for (let i = 0; i < P.count; i++) { v.set(Math.max(-1, P.getX(i) / dn), Math.max(-1, P.getY(i) / dn), Math.max(-1, P.getZ(i) / dn)).applyMatrix4(m); pts.push(v.clone()); c.add(v); }
    if (!pts.length) return null; c.divideScalar(pts.length);
    const C = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (const q of pts) { const d = [q.x - c.x, q.y - c.y, q.z - c.z]; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) C[i * 3 + j] += d[i] * d[j]; }
    const mul = (M, x) => new T.Vector3(M[0] * x.x + M[1] * x.y + M[2] * x.z, M[3] * x.x + M[4] * x.y + M[5] * x.z, M[6] * x.x + M[7] * x.y + M[8] * x.z);
    const big = (M, s0) => { let x = s0.clone().normalize(); for (let k = 0; k < 60; k++) { const y = mul(M, x); if (y.lengthSq() < 1e-12) break; x = y.normalize(); } return x; };
    const e1 = big(C, new T.Vector3(1, .3, .2)), l1 = mul(C, e1).dot(e1), C2 = C.slice();
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) C2[i * 3 + j] -= l1 * e1.getComponent(i) * e1.getComponent(j);
    const e2 = big(C2, new T.Vector3(.2, 1, .3)), ax = new T.Vector3().crossVectors(e1, e2).normalize();
    if (!isFinite(ax.x) || ax.lengthSq() < .5) ax.set(0, 0, 1); if (ax.z < 0) ax.negate();
    const piv = new T.Group(); piv.position.copy(c); piv.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), ax); root.add(piv); piv.updateMatrixWorld(true); piv.attach(node);
    return piv;
  }
  function clone(name) { return SRC[name] ? T.SkeletonUtils.clone(SRC[name]) : null; }

  function dress(v) {
    if (v.m || !ready) return;
    const g = v.g;
    if (v.heli) {
      const sc_ = clone('helicopter'); if (!sc_) return;
      const root = prep(sc_, 14.2); root.position.z = -.9; g.userData.seat = SEAT.helicopter.clone();
      let mr = null, hub = null, tf = null;
      sc_.traverse(o => { if (/main_rotor/.test(o.name)) mr = mr || o; if (/rotor_hub/.test(o.name)) hub = hub || o; if (/back_fan/.test(o.name)) tf = tf || o; if (/pilot|helmet_glass/i.test(o.name)) o.visible = false; if (/^glass/i.test(o.name) && o.isMesh) o.material = HGLASS(); });
      g.add(root);
      v.rot = pivotOut(root, mr); v.trot = pivotOut(root, tf);
      // esconde o modelo antigo, inclusive os discos escuros dos rotores (as pás de verdade já giram); mantém luzes e fogo
      const u = g.userData; v.old = [u.stat, u.gl, u.disc, u.tdisc, ...(u.rot ? u.rot.children : []), ...(u.trot ? u.trot.children : [])].filter(Boolean);
    } else {
      let r = Math.random() * CAR_MODELS.reduce((a, c) => a + c[1], 0), pick = CAR_MODELS[0];
      for (const c of CAR_MODELS) { r -= c[1]; if (r <= 0) { pick = c; break; } }
      if (v.kind0) pick = CAR_MODELS.find(c => c[0] === v.kind0) || pick;
      v.kind = pick[0]; g.userData.seat = (SEAT[pick[0]] || SEAT.buggy).clone();
      const sc_ = clone(pick[0]); if (!sc_) return;
      const root = prep(sc_, pick[2]); try { v.wheels = splitWheels(pick[0], root); } catch (e) { console.warn('rodas', e); } g.add(root);
      try { const it = interior(pick[0]); if (it) { root.add(it); g.userData.cab = it; g.userData.wheelObj = it.userData.wheel; } } catch (e) { console.warn('interior', e); }
      v.old = g.children.filter(c => c !== root);
    }
    v.root = g.children.find(c => c.userData && c.userData.dz) || null;
  }
  // marca a raiz do modelo novo para achar depois
  const _prep = prep;
  prep = function (s, l) { const r = _prep(s, l); r.userData.dz = 1; return r; };

  const _v = new T.Vector3(); let burnM = null;
  // ---------- RODAS QUE GIRAM ----------
  // O modelo do buggy vem com as rodas grudadas na carroceria. Aqui o pneu é achado pela geometria
  // (a malha escura com mais vértices), as 4 rodas são localizadas pelos quadrantes e todos os
  // triângulos dentro de cada roda (pneu, aro, cubo) saem da carroceria e vão para um eixo próprio.
  // Feito uma vez por modelo; os clones compartilham o resultado.
  const WSPLIT = {};
  const deq = a => { const A = a.array; return !a.normalized ? 1 : A instanceof Int16Array ? 32767 : A instanceof Uint16Array ? 65535 : A instanceof Int8Array ? 127 : A instanceof Uint8Array ? 255 : 1; };
  function splitWheels(kind, root) {
    let W = WSPLIT[kind];
    root.updateMatrixWorld(true); const inv = new T.Matrix4().copy(root.matrixWorld).invert(), v = new T.Vector3();
    const meshes = []; root.traverse(o => { if (o.isMesh && o.geometry && o.geometry.attributes.position) meshes.push(o); });
    if (!W) {
      // 1) cada malha é dividida em PEÇAS SOLTAS (componentes conectados); posições em metros no carro
      const comps = [];
      for (const m of meshes) {
        const g = m.geometry, P = g.attributes.position, dp = deq(P), M = new T.Matrix4().multiplyMatrices(inv, m.matrixWorld), n = P.count, pos = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) { v.set(P.getX(i) / dp, P.getY(i) / dp, P.getZ(i) / dp).applyMatrix4(M); pos[i * 3] = v.x; pos[i * 3 + 1] = v.y; pos[i * 3 + 2] = v.z; }
        const par = new Int32Array(n); for (let i = 0; i < n; i++) par[i] = i;
        const f = i => { while (par[i] !== i) { par[i] = par[par[i]]; i = par[i]; } return i; }, u = (a, b) => { a = f(a); b = f(b); if (a !== b) par[a] = b; };
        const key = new Map(); for (let i = 0; i < n; i++) { const k = Math.round(pos[i * 3] * 2000) + ',' + Math.round(pos[i * 3 + 1] * 2000) + ',' + Math.round(pos[i * 3 + 2] * 2000); const o = key.get(k); if (o != null) u(i, o); else key.set(k, i); }
        const idx = g.index ? g.index.array : null, nt = (idx ? idx.length : n) / 3, tri = [];
        for (let t = 0; t < nt; t++) { const a = idx ? idx[t * 3] : t * 3, b = idx ? idx[t * 3 + 1] : t * 3 + 1, c = idx ? idx[t * 3 + 2] : t * 3 + 2; u(a, b); u(b, c); tri.push(a, b, c); }
        const C = new Map();
        for (let t = 0; t < tri.length; t += 3) { const r = f(tri[t]); let c = C.get(r); if (!c) C.set(r, c = { m, pos, tri: [], mn: new T.Vector3(1e9, 1e9, 1e9), mx: new T.Vector3(-1e9, -1e9, -1e9) }); for (let q = 0; q < 3; q++) { const i = tri[t + q]; c.tri.push(i); v.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]); c.mn.min(v); c.mx.max(v); } }
        for (const c of C.values()) comps.push(c);
      }
      // 2) pneus = peças redondas de lado (altura ~ comprimento), grandes e encostando no chão
      let minY = 1e9; for (const c of comps) minY = Math.min(minY, c.mn.y);
      const tires = comps.filter(c => { const sy = c.mx.y - c.mn.y, sz = c.mx.z - c.mn.z; return sy > .45 && Math.abs(sy - sz) < .15 * sy && c.mn.y < minY + .12; })
        .sort((a, b) => (b.mx.y - b.mn.y) - (a.mx.y - a.mn.y));
      // um pneu por quadrante (o maior)
      const quad = {}; for (const c of tires) { const k = (c.mn.x + c.mx.x > 0 ? 1 : 0) + (c.mn.z + c.mx.z > 0 ? 2 : 0); if (!quad[k]) quad[k] = c; }
      if (Object.keys(quad).length !== 4) { console.warn('rodas: pneus não encontrados'); return null; }
      const wheels = Object.values(quad).map(c => ({ c: c.mn.clone().add(c.mx).multiplyScalar(.5), r: Math.max(c.mx.y - c.mn.y, c.mx.z - c.mn.z) / 2, hw: (c.mx.x - c.mn.x) / 2, front: c.mn.z + c.mx.z > 0, parts: [], comps: [] }));
      // 3) peça vai para a roda se estiver INTEIRA dentro do cilindro da roda (pneu, aro, cubo, parafusos)
      for (const c of comps) for (const w of wheels) {
        const ok = Math.max(Math.abs(c.mn.x - w.c.x), Math.abs(c.mx.x - w.c.x)) < w.hw + .1 && [[c.mn.y, c.mn.z], [c.mn.y, c.mx.z], [c.mx.y, c.mn.z], [c.mx.y, c.mx.z]].every(([y, z]) => (y - w.c.y) ** 2 + (z - w.c.z) ** 2 < (w.r * 1.06) ** 2 * 1.42);
        if (ok && (c.mx.y - c.mn.y) < w.r * 2.15) { w.comps.push(c); c.wheel = w; break; }
      }
      // 4) monta a geometria de cada roda (centrada no eixo) e tira essas peças da carroceria
      const byMesh = new Map(); for (const c of comps) { let e = byMesh.get(c.m); if (!e) byMesh.set(c.m, e = { keep: [], wh: new Map() }); if (c.wheel) { let a = e.wh.get(c.wheel); if (!a) e.wh.set(c.wheel, a = []); a.push(...c.tri); } else e.keep.push(...c.tri); }
      for (const [m, e] of byMesh) {
        if (!e.wh.size) continue;
        const g = m.geometry, N2 = g.attributes.normal, U2 = g.attributes.uv, dn = N2 ? deq(N2) : 1, du = U2 ? deq(U2) : 1, M2 = new T.Matrix4().multiplyMatrices(inv, m.matrixWorld), NM = new T.Matrix3().getNormalMatrix(M2), pos = comps.find(c => c.m === m).pos;
        for (const [w, tri] of e.wh) {
          const n = tri.length, pp = new Float32Array(n * 3), nn = new Float32Array(n * 3), uu = new Float32Array(n * 2);
          tri.forEach((i, j) => { pp[j * 3] = pos[i * 3] - w.c.x; pp[j * 3 + 1] = pos[i * 3 + 1] - w.c.y; pp[j * 3 + 2] = pos[i * 3 + 2] - w.c.z;
            if (N2) { v.set(N2.getX(i) / dn, N2.getY(i) / dn, N2.getZ(i) / dn).applyMatrix3(NM).normalize(); nn[j * 3] = v.x; nn[j * 3 + 1] = v.y; nn[j * 3 + 2] = v.z; }
            if (U2) { uu[j * 2] = U2.getX(i) / du; uu[j * 2 + 1] = U2.getY(i) / du; } });
          const ge = new T.BufferGeometry(); ge.setAttribute('position', new T.BufferAttribute(pp, 3)); ge.setAttribute('normal', new T.BufferAttribute(nn, 3)); if (U2) ge.setAttribute('uv', new T.BufferAttribute(uu, 2)); if (!N2) ge.computeVertexNormals(); ge.computeBoundingSphere();
          w.parts.push({ ge, mat: m.material });
        }
        g.setIndex(e.keep);   // carroceria sem as rodas (geometria compartilhada pelos clones)
      }
      for (const w of wheels) delete w.comps;
      W = WSPLIT[kind] = wheels;
      window.DZWHEELS = window.DZWHEELS || {}; DZWHEELS[kind] = wheels.map(w => [w.c.x, w.c.y - w.r, w.c.z, w.r]);
    }
    // rodas deste carro: pivô de direção (frente) > pivô de giro > peças
    return W.map(w => { const steer = new T.Group(); steer.position.copy(w.c); const spin = new T.Group(); steer.add(spin);
      for (const p of w.parts) { const me = new T.Mesh(p.ge, p.mat); me.castShadow = true; me.receiveShadow = true; spin.add(me); }
      root.add(steer); return { steer, spin, r: w.r, front: w.front }; });
  }
  let _wt = performance.now();
  function spinWheels(v, c) {
    const now = performance.now(), dt = Math.min(.05, (now - (v.wt || now)) / 1000); v.wt = now;
    // giro = distância andada / raio; no ar a roda continua girando e vai perdendo velocidade
    v.ws = c.wn > 0 || v.ws == null ? (c.spd || 0) : v.ws * Math.exp(-dt * .6);
    v.wa = ((v.wa || 0) + v.ws * dt / (v.wheels[0].r || .4)) % (Math.PI * 2);
    const st = (c.steer || 0); v.wst = (v.wst || 0) + (st - (v.wst || 0)) * Math.min(1, dt * 10);
    for (const w of v.wheels) { w.spin.rotation.x = v.wa; if (w.front) w.steer.rotation.y = -v.wst * .5; }
  }
  function tick() {
    requestAnimationFrame(tick);
    if (!ready || typeof cam === 'undefined') return;
    const q = (typeof CFG !== 'undefined' && CFG.q != null) ? CFG.q : 2, near = q === 0 ? 70 : q === 1 ? 110 : 160;
    for (const v of VEH) {
      if (!v.root) { dress(v); if (!v.root) continue; }
      v.g.getWorldPosition(_v); const n = v.heli ? _v.distanceTo(cam.position) < near : true;   // o buggy fica sempre com o modelo real
      if (n !== v.n) { v.n = n; v.root.visible = n; for (const o of v.old) o.visible = !n; }
      if (v.heli) {
        const u = v.g.userData;
        if (v.rot && u.rot) v.rot.rotation.y = u.rot.rotation.y;
        if (v.trot && u.trot) v.trot.rotation.x = u.trot.rotation.x;
      } else if (!v.burnt) {
        const c = v.car || (v.car = typeof CARS !== 'undefined' ? CARS.find(c => c.g === v.g) : null);
        if (c && v.wheels) spinWheels(v, c);
        if (c && c.dead) { v.burnt = 1; burnM = burnM || (typeof BURN !== 'undefined' ? BURN : new T.MeshStandardMaterial({ color: 0x151515 })); v.root.traverse(o => { if (o.isMesh) o.material = burnM; }); }
      }
    }
  }
  // VIDROS TRANSPARENTES em todos os carros (dá para ver quem está dentro).
  // Vidro em peça própria: troca por vidro claro. Vidro pintado na textura da lataria (picape):
  // a lataria recorta os pixels do vidro e uma cópia por cima desenha só o vidro, transparente.
  let _cg = null; const CGLASS = () => _cg || (_cg = new T.MeshStandardMaterial({ color: lin(0xc4d8e4), transparent: true, opacity: .16, roughness: .05, metalness: 0, depthWrite: false, side: T.DoubleSide, envMapIntensity: .5 }));
  const GL_TEST = 'vec3 c_=diffuseColor.rgb;float mx_=max(max(c_.r,c_.g),c_.b),mn_=min(min(c_.r,c_.g),c_.b);bool isG=c_.b>c_.r*1.25&&c_.g>c_.r*1.12&&mx_-mn_>.035&&mx_<.75;';
  function glassify(scene, painted) {
    const add = [];
    scene.traverse(o => {
      if (!o.isMesh || !o.material) return;
      const m = o.material;
      if (m.transparent || m.opacity < 1) { o.material = CGLASS(); o.renderOrder = 2; return; }
      m.side = T.DoubleSide;   // lado de dentro da lataria (portas, teto) visível pelo vidro
      if (!painted || m.userData.gl) return; m.userData.gl = 1;
      m.onBeforeCompile = s => { s.fragmentShader = s.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n{' + GL_TEST + 'if(isG)discard;}'); };
      m.customProgramCacheKey = () => 'cutglass'; m.needsUpdate = true;
      const gm = new T.MeshStandardMaterial({ map: m.map, color: 0xffffff, transparent: true, opacity: .32, roughness: .04, metalness: .25, depthWrite: false, side: T.DoubleSide });
      gm.onBeforeCompile = s => { s.fragmentShader = s.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n{' + GL_TEST + 'if(!isG)discard;diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.72,.83,.9),.55);}'); };
      gm.customProgramCacheKey = () => 'onlyglass';
      add.push([o, gm]);
    });
    for (const [o, gm] of add) { const c = new T.Mesh(o.geometry, gm); c.renderOrder = 2; c.name = 'glass_overlay'; o.add(c); }
  }
  function load() {
    const names = ['helicopter', ...CAR_MODELS.map(c => c[0])]; let left = names.length;
    for (const n of names) new T.GLTFLoader().load(URL_[n], g => { SRC[n] = g.scene; if (n !== 'helicopter') try { glassify(g.scene, n !== 'buggy'); } catch (e) { } if (--left === 0) { ready = true; } }, undefined, e => { console.warn('veículo', n, e); if (--left === 0) ready = true; });
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
      props.length = 0; for (const o of pr) { const p = propPivot(holder, o); if (p) props.push(p); }
    };
    go();
  }, undefined, e => console.warn('avião', e));
})();
