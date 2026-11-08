/* Deadzone · world/structures.js
 * PRÉDIOS COM INTERIOR feitos por código: dá para entrar e subir em TODOS os andares e no terraço.
 *  - paredes de alvenaria (reboco + barra de tijolo), lajes, escadas em "vai e volta", terraço com mureta;
 *  - porta de entrada com folha que abre (botão de porta), portas internas, janelas de vidro que quebram;
 *  - colisão por andar (paredes só bloqueiam no andar delas) e pisos reconhecidos pela física (GY).
 * Lista de onde ficam: STRS em world/map.js. Rotação só em múltiplos de 90°.
 */
(function () {
  if (typeof STRS === 'undefined') return;
  const FH = 3.2, T_ = .25, SLAB = .22, STEP_L = 5.2, LANE = 1.25, LAND = 1.3;
  const FLR = window.DZFLR = [], FG = new Map(), fk = (i, j) => i * 4096 + j;
  FLR.add = f => { FLR.push(f); for (let i = Math.floor(f.x0 / 16); i <= Math.floor(f.x1 / 16); i++) for (let j = Math.floor(f.z0 / 16); j <= Math.floor(f.z1 / 16); j++) { const k = fk(i, j); let a = FG.get(k); if (!a) FG.set(k, a = []); a.push(f); } };
  const CEIL = window.DZCEIL = [];  // fundo das lajes (a câmera não passa para o andar de cima)   // pisos: {x0,x1,z0,z1,y} ou rampa {.., ax:'x'|'z', a0,a1,y0,y1}

  // ---------- a física passa a reconhecer pisos, escadas e terraços ----------
  const _GY = GY;
  GY = function (x, z, y) {
    let h = TERH(x, z); const lim = (y == null ? 1e9 : y) + .55;
    if (window.ROADH) { const r = ROADH(x, z); if (r != null && r > h && r <= lim) h = r; } // pisa no asfalto da estrada
    const cell = FG.get(fk(Math.floor(x / 16), Math.floor(z / 16))); if (!cell) return h;
    for (const f of cell) {
      if (x < f.x0 || x > f.x1 || z < f.z0 || z > f.z1) continue;
      let fy = f.y;
      if (f.ax) { const a = f.ax === 'x' ? x : z, t = Math.max(0, Math.min(1, (a - f.a0) / (f.a1 - f.a0))); fy = f.y0 + (f.y1 - f.y0) * t; }
      if (fy <= lim && fy > h) h = fy;
    }
    return h;
  };

  // ---------- materiais (textura em coordenadas do mundo: tamanho igual em qualquer parede) ----------
  const lin = c => new T.Color(c).convertSRGBToLinear();
  const canvasT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 4; return t; };
  function triMat(map, k, o) {
    const m = new T.MeshStandardMaterial(Object.assign({ map, vertexColors: true, roughness: .9, metalness: 0 }, o || {}));
    m.onBeforeCompile = s => {
      s.uniforms.uK = { value: k };
      s.vertexShader = 'varying vec3 vWP;varying vec3 vWN;\n' + s.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWP=(modelMatrix*vec4(transformed,1.)).xyz;vWN=normalize(mat3(modelMatrix)*objectNormal);');
      s.fragmentShader = 'uniform float uK;varying vec3 vWP;varying vec3 vWN;\n' + s.fragmentShader.replace('#include <map_fragment>', 'vec3 an=abs(vWN);vec2 bu=an.x>an.z?vWP.zy:vWP.xy;if(an.y>.7)bu=vWP.xz;vec4 texelColor=mapTexelToLinear(texture2D(map,bu*uK));diffuseColor*=texelColor;');
    };
    m.customProgramCacheKey = () => 'tri' + k; return m;
  }
  const noise = (g, w, h, n, a) => { for (let i = 0; i < n; i++) { g.fillStyle = 'rgba(' + (Math.random() < .5 ? '0,0,0' : '255,255,255') + ',' + (Math.random() * a).toFixed(3) + ')'; g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2); } };
  const TX = {
    plaster: canvasT(256, 256, (g, w, h) => { g.fillStyle = '#d9d4cb'; g.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(' + (Math.random() < .5 ? '90,80,70' : '255,255,250') + ',' + (.03 + Math.random() * .05) + ')'; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 8 + Math.random() * 40, 0, 7); g.fill(); } noise(g, w, h, 9000, .09);
      for (let i = 0; i < 18; i++) { const x = Math.random() * w, l = 30 + Math.random() * 90, gr = g.createLinearGradient(0, 0, 0, l); gr.addColorStop(0, 'rgba(60,55,45,.12)'); gr.addColorStop(1, 'rgba(60,55,45,0)'); g.fillStyle = gr; g.save(); g.translate(x, Math.random() * h); g.fillRect(0, 0, 3 + Math.random() * 5, l); g.restore(); } }),
    brick: canvasT(256, 256, (g, w, h) => { g.fillStyle = '#6f6359'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) for (let x = -32; x < w; x += 32) { const o = (y / 16 % 2) * 16; g.fillStyle = 'hsl(' + (10 + Math.random() * 12) + ',' + (30 + Math.random() * 20) + '%,' + (30 + Math.random() * 14) + '%)'; g.fillRect(x + o + 1, y + 1, 30, 14); } noise(g, w, h, 6000, .12); }),
    concrete: canvasT(256, 256, (g, w, h) => { g.fillStyle = '#9a978f'; g.fillRect(0, 0, w, h); noise(g, w, h, 14000, .12); for (let i = 0; i < 30; i++) { g.fillStyle = 'rgba(40,40,40,' + (.03 + Math.random() * .05) + ')'; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 10 + Math.random() * 30, 0, 7); g.fill(); } }),
    tiles: canvasT(256, 256, (g, w, h) => { g.fillStyle = '#4a4744'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 64) for (let x = 0; x < w; x += 64) { g.fillStyle = 'hsl(30,' + (6 + Math.random() * 6) + '%,' + (58 + Math.random() * 10) + '%)'; g.fillRect(x + 2, y + 2, 60, 60); } noise(g, w, h, 8000, .08); }),
    roof: canvasT(256, 256, (g, w, h) => { g.fillStyle = '#5b2a1c'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) { const o = (y / 32 % 2) * 16; g.fillStyle = 'hsl(' + (12 + Math.random() * 8) + ',' + (45 + Math.random() * 15) + '%,' + (30 + Math.random() * 10) + '%)'; g.beginPath(); g.ellipse(x + o + 16, y + 20, 15, 16, 0, 0, Math.PI); g.fill(); g.fillRect(x + o + 1, y + 2, 30, 18); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x + o, y + 30, 32, 2); } noise(g, w, h, 6000, .1); }),
    wood: canvasT(256, 256, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = 'hsl(' + (24 + Math.random() * 8) + ',' + (35 + Math.random() * 10) + '%,' + (26 + Math.random() * 10) + '%)'; g.fillRect(0, i * 32, w, 31); g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, i * 32 + 31, w, 1); } noise(g, w, h, 5000, .1); })
  };
  const MAT = {
    ext: triMat(TX.plaster, .45), int: triMat(TX.plaster, .5), brick: triMat(TX.brick, .9), conc: triMat(TX.concrete, .35),
    tile: triMat(TX.tiles, .45), roof: triMat(TX.roof, .55, { side: T.DoubleSide }), wood: triMat(TX.wood, .5, { roughness: .8 }),
    frame: new T.MeshStandardMaterial({ color: lin(0x2b2d30), roughness: .6, metalness: .3, vertexColors: true }),
    rail: new T.MeshStandardMaterial({ color: lin(0x3a3c40), roughness: .5, metalness: .5, vertexColors: true }),
    door: new T.MeshStandardMaterial({ roughness: .6, map: canvasT(128, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#7a5232'); gr.addColorStop(.5, '#8a5f3a'); gr.addColorStop(1, '#74502f'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 70; i++) { g.strokeStyle = 'rgba(50,28,12,' + (.08 + Math.random() * .12) + ')'; g.beginPath(); const x = Math.random() * w; g.moveTo(x, 0); g.bezierCurveTo(x + 6, h * .3, x - 6, h * .7, x + 3, h); g.stroke(); }
      const pnl = (x, y, ww, hh) => { g.fillStyle = 'rgba(40,20,8,.35)'; g.fillRect(x, y, ww, hh); g.fillStyle = 'rgba(255,220,180,.12)'; g.fillRect(x + 3, y + 3, ww - 6, hh - 6); g.strokeStyle = 'rgba(30,15,5,.6)'; g.lineWidth = 2; g.strokeRect(x + 5, y + 5, ww - 10, hh - 10); };
      pnl(16, 18, 42, 96); pnl(70, 18, 42, 96); pnl(16, 136, 42, 100); pnl(70, 136, 42, 100); g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(0, 0, w, 3); g.fillRect(0, h - 3, w, 3); }) }),
    dark: new T.MeshStandardMaterial({ color: lin(0x111214), roughness: 1 }),
    awn: new T.MeshStandardMaterial({ vertexColors: true, roughness: .85 })
  };

  // ---------- junta geometria por quarteirão + material ----------
  const STORE = new Map(), MID = new Map();
  function push(key, m, ge) { if (!MID.has(m)) MID.set(m, MID.size); const k = key + '|' + MID.get(m); let e = STORE.get(k); if (!e) STORE.set(k, e = { m, geos: [] }); e.geos.push(ge); }
  function flush() {
    for (const [, e] of STORE) { let n = 0; for (const g of e.geos) n += g.attributes.position.count;
      const P = new Float32Array(n * 3), N = new Float32Array(n * 3), C = new Float32Array(n * 3), U = new Float32Array(n * 2); let o = 0;
      for (const g of e.geos) { const c = g.attributes.position.count; P.set(g.attributes.position.array, o * 3); N.set(g.attributes.normal.array, o * 3); C.set(g.attributes.color.array, o * 3); if (g.attributes.uv) U.set(g.attributes.uv.array, o * 2); o += c; }
      const ge = new T.BufferGeometry(); ge.setAttribute('position', new T.BufferAttribute(P, 3)); ge.setAttribute('normal', new T.BufferAttribute(N, 3)); ge.setAttribute('color', new T.BufferAttribute(C, 3)); ge.setAttribute('uv', new T.BufferAttribute(U, 2)); ge.computeBoundingSphere();
      const me = new T.Mesh(ge, e.m); me.castShadow = true; me.receiveShadow = true; sc.add(me); }
    STORE.clear();
  }
  window.DZSTRB = { build: S => build(S), flush };
  // ---------- construtor ----------
  function build(S) {
    const W = S.w, D = S.d, NF = S.floors, rot = S.rot || 0, gy = TERH(S.x, S.z) + .02;
    const cs = Math.cos(rot), sn = Math.sin(rot);
    const L2W = (x, z) => [S.x + x * cs + z * sn, S.z - x * sn + z * cs];
    const g = new T.Group(); g.position.set(S.x, gy, S.z); g.rotation.y = rot; sc.add(g); g.updateMatrixWorld(true);
    const BK = new Map(), O = new T.Object3D(), tint = new T.Color();
    // caixa visual (local) com cor de tingimento
    const box = (m, x0, y0, z0, x1, y1, z1, col) => { if (x1 - x0 < .001 || y1 - y0 < .001 || z1 - z0 < .001) return; if (!BK.has(m)) BK.set(m, []); BK.get(m).push([x0, y0, z0, x1, y1, z1, col == null ? 0xffffff : col]); };
    // colisão (local -> mundo, alturas relativas ao chão do prédio)
    const col = (x0, z0, x1, z1, yb, yt) => { const p = L2W(x0, z0), q = L2W(x1, z1); return addBox({ x0: Math.min(p[0], q[0]), x1: Math.max(p[0], q[0]), z0: Math.min(p[1], q[1]), z1: Math.max(p[1], q[1]), w: 1, yb: gy + yb, yt: gy + yt }); };
    const floor = (x0, z0, x1, z1, y) => { const p = L2W(x0, z0), q = L2W(x1, z1); FLR.add({ x0: Math.min(p[0], q[0]), x1: Math.max(p[0], q[0]), z0: Math.min(p[1], q[1]), z1: Math.max(p[1], q[1]), y: gy + y }); };
    const ramp = (x0, z0, x1, z1, y0, y1, alongX, rev) => {
      const p = L2W(x0, z0), q = L2W(x1, z1), r = { x0: Math.min(p[0], q[0]), x1: Math.max(p[0], q[0]), z0: Math.min(p[1], q[1]), z1: Math.max(p[1], q[1]), y0: gy + y0, y1: gy + y1 };
      // eixo da rampa no mundo (rotação em 90°): x local vira x ou z do mundo
      const lx = L2W(rev ? x1 : x0, z0), lx2 = L2W(rev ? x0 : x1, z0);
      if (alongX) { if (Math.abs(lx2[0] - lx[0]) > Math.abs(lx2[1] - lx[1])) { r.ax = 'x'; r.a0 = lx[0]; r.a1 = lx2[0]; } else { r.ax = 'z'; r.a0 = lx[1]; r.a1 = lx2[1]; } }
      FLR.add(r);
    };
    const glass = [];
    // parede ao longo de X (em z, espessura T_) ou de Z; aberturas: [u0,u1,v0,v1] (u ao longo, v altura relativa ao andar)
    function wall(alongX, a0, a1, f, y0, h, opens, mExt, mInt, colBase, out) {
      const th = T_ / 2, cuts = [a0];
      for (const o of opens) cuts.push(o[0], o[1]); cuts.push(a1); cuts.sort((a, b) => a - b);
      const tc = mExt === EXT ? EXC : mExt === MAT.ext ? exterior : 0xf2f0ea, sk = out ? [Math.min(f + out * th, f + out * (th + .03)), Math.max(f + out * th, f + out * (th + .03))] : null;
      const P = (u0, u1, v0, v1, m) => { if (sk) { alongX ? box(MAT.int, u0, y0 + v0, f - th, u1, y0 + v1, f + th, 0xf2f0ea) : box(MAT.int, f - th, y0 + v0, u0, f + th, y0 + v1, u1, 0xf2f0ea); alongX ? box(m, u0 - (u0 === a0 ? .03 : 0), y0 + v0, sk[0], u1 + (u1 === a1 ? .03 : 0), y0 + v1, sk[1], tc) : box(m, sk[0], y0 + v0, u0, sk[1], y0 + v1, u1, tc); }
        else alongX ? box(m, u0, y0 + v0, f - th, u1, y0 + v1, f + th, tc) : box(m, f - th, y0 + v0, u0, f + th, y0 + v1, u1, tc); };
      const C = (u0, u1, v0, v1) => alongX ? col(u0, f - th, u1, f + th, y0 + v0, y0 + v1) : col(f - th, u0, f + th, u1, y0 + v0, y0 + v1);
      // trechos cheios entre aberturas
      let u = a0;
      const sorted = opens.slice().sort((a, b) => a[0] - b[0]);
      for (const o of sorted) { if (o[0] > u) { P(u, o[0], 0, h, mExt); C(u, o[0], 0, h); } P(o[0], o[1], 0, o[2], mExt); if (o[2] > .05) C(o[0], o[1], 0, o[2]); P(o[0], o[1], o[3], h, mExt); if (o[3] < h) { const lb = C(o[0], o[1], o[3], h); if (lb) lb.lint = 1; } u = o[1]; }
      if (a1 > u) { P(u, a1, 0, h, mExt); C(u, a1, 0, h); }
      if (colBase && y0 < .1 && (ST === 'plaster' || ST === 'shop')) { // barra de tijolo na base (externa)
        const b0 = out ? (out > 0 ? f + th + .03 : f - th - .055) : f - th - .02, b1 = out ? (out > 0 ? f + th + .055 : f - th - .03) : f + th + .02;
        const BB = (u0, u1) => alongX ? box(MAT.brick, u0, 0, b0, u1, .9, b1) : box(MAT.brick, b0, 0, u0, b1, .9, u1);
        let uu = a0; for (const o of sorted) { if (o[2] < .05) { if (o[0] > uu) BB(uu, o[0]); uu = o[1]; } }
        if (a1 > uu) BB(uu, a1);
      }
      // batentes das portas (tapam a fresta em volta da folha)
      for (const o of sorted) if (o[2] < .05) { const d = th + .06, tw = .08, tp = y0 + o[3];
        if (alongX) { box(MAT.wood, o[0] - tw, y0, f - d, o[0], tp + tw, f + d, 0x8a6a4a); box(MAT.wood, o[1], y0, f - d, o[1] + tw, tp + tw, f + d, 0x8a6a4a); box(MAT.wood, o[0], tp, f - d, o[1], tp + tw, f + d, 0x8a6a4a); }
        else { box(MAT.wood, f - d, y0, o[0] - tw, f + d, tp + tw, o[0], 0x8a6a4a); box(MAT.wood, f - d, y0, o[1], f + d, tp + tw, o[1] + tw, 0x8a6a4a); box(MAT.wood, f - d, tp, o[0], f + d, tp + tw, o[1], 0x8a6a4a); } }
      // molduras e vidros das janelas
      for (const o of sorted) if (o[2] > .3) {
        const cu = (o[0] + o[1]) / 2, cv = y0 + (o[2] + o[3]) / 2, ww = o[1] - o[0], hh = o[3] - o[2], d = th + .065;
        if (alongX) { box(MAT.frame, o[0] - .06, y0 + o[2] - .08, f - d, o[1] + .06, y0 + o[2], f + d); box(MAT.frame, o[0] - .06, y0 + o[3], f - d, o[1] + .06, y0 + o[3] + .06, f + d); box(MAT.frame, o[0] - .06, y0 + o[2], f - .04, o[0], y0 + o[3], f + .04); box(MAT.frame, o[1], y0 + o[2], f - .04, o[1] + .06, y0 + o[3], f + .04); glass.push([cu, cv, f, 0, ww, hh]); }
        else { box(MAT.frame, f - d, y0 + o[2] - .08, o[0] - .06, f + d, y0 + o[2], o[1] + .06); box(MAT.frame, f - d, y0 + o[3], o[0] - .06, f + d, y0 + o[3] + .06, o[1] + .06); box(MAT.frame, f - .04, y0 + o[2], o[0] - .06, f + .04, y0 + o[3], o[0]); box(MAT.frame, f - .04, y0 + o[2], o[1], f + .04, y0 + o[3], o[1] + .06); glass.push([f, cv, cu, Math.PI / 2, ww, hh]); }
      }
    }
    // portas com folha que abre
    const inner = new T.Group(); g.add(inner); S.inner = inner;
    function door(alongX, u0, u1, f, y0, inn) {
      const piv = new T.Group(), w = u1 - u0; if (alongX) piv.position.set(u0, y0, f); else piv.position.set(f, y0, u0);
      const LH = 2.2, leaf = new T.Mesh(new T.BoxGeometry(alongX ? w : .05, LH, alongX ? .05 : w), MAT.door); leaf.position.set(alongX ? w / 2 : 0, LH / 2, alongX ? 0 : w / 2); leaf.castShadow = true; piv.add(leaf);
      { const kn = new T.Mesh(new T.BoxGeometry(alongX ? .12 : .14, .04, alongX ? .14 : .12), MAT.knob || (MAT.knob = new T.MeshStandardMaterial({ color: lin(0xc9b27a), metalness: .8, roughness: .3 }))); kn.position.set(alongX ? w - .1 : 0, 1.0, alongX ? 0 : w - .1); piv.add(kn); }
      (inn ? inner : g).add(piv);
      const bx = alongX ? col(u0 + .05, f - .1, u1 - .05, f + .1, y0, y0 + 2.2) : col(f - .1, u0 + .05, f + .1, u1 - .05, y0, y0 + 2.2);
      const c = alongX ? L2W((u0 + u1) / 2, f) : L2W(f, (u0 + u1) / 2);
      const Dd = { piv, x: c[0], z: c[1], open: 0, a: 0, bx, y: gy + y0 }; bx.door = Dd; doors.push(Dd); return Dd;
    }
    // janelas distribuídas numa parede (evita a porta)
    const winsOn = (a0, a1, skip, sill, wh, avoid) => { const out = [], n = Math.max(1, Math.floor((a1 - a0) / 2.6)), stp = (a1 - a0) / n; for (let i = 0; i < n; i++) { let c = a0 + stp * (i + .5); if (skip != null && Math.abs(c - skip) < 1.5) continue; if (avoid) { let bad = 0; for (const v of avoid) if (Math.abs(c - v) < .95) { const c2 = c + (c > v ? 1 : -1) * (.96 - Math.abs(c - v)); if (c2 - .6 < a0 - .3 || c2 + .6 > a1 + .3 || (skip != null && Math.abs(c2 - skip) < 1.5)) bad = 1; else c = c2; } if (bad) continue; } out.push([c - .6, c + .6, sill, sill + wh]); } return out; };

    const x0 = -W / 2, x1 = W / 2, z0 = -D / 2, z1 = D / 2, ix0 = x0 + T_ / 2, ix1 = x1 - T_ / 2, iz0 = z0 + T_ / 2, iz1 = z1 - T_ / 2;
    // poço da escada no fundo, à esquerda: patamar | rampa | patamar, duas faixas (vai e volta)
    const sx0 = ix0, sxa = sx0 + LAND, sxb = sxa + STEP_L, sx1 = sxb + LAND, lz0 = iz0, lz1 = lz0 + LANE, lz2 = lz1 + LANE;
    // divisória entre os 2 cômodos: logo depois da porta B do corredor (nunca em cima de porta/janela); prédio estreito = 1 cômodo só
    let XM = sx1 + .4; if (Math.abs(XM) < 1.1) XM = 1.2; // longe da porta da frente/varanda (x de -0,6 a 0,6)
    if (ix1 - XM < 2.9) XM = null;
    const exterior = S.color || 0xe6dccb, ST = S.style || 'plaster';
    // acabamento de fora conforme o estilo: reboco colorido, tijolo aparente ou concreto
    const EXT = ST === 'brick' ? MAT.brick : ST === 'panel' ? MAT.conc : MAT.ext, EXC = ST === 'brick' ? 0xffffff : exterior;
    const gable = S.roof === 'gable';
    for (let k = 0; k <= NF; k++) {
      const y = k * FH, top = k === NF;
      // laje/piso (o térreo é o chão); buraco sobre a faixa da escada que chega por baixo
      const holeLane = k > 0 && !(gable && top) ? ((k - 1) % 2) : -1, hz0 = holeLane === 0 ? lz0 : lz1, hz1 = holeLane === 0 ? lz1 : lz2;
      const slab = (a, b, c, d) => { if (b - a < .05 || d - c < .05) return; box(k === 0 ? MAT.tile : (top ? MAT.conc : MAT.tile), a, y - (k ? SLAB : .02), c, b, y + .02, d); if (k) { box(MAT.int, a, y - SLAB - .01, c, b, y - SLAB, d, 0xf2f0ea); const p = L2W(a, c), q = L2W(b, d); CEIL.push({ x0: Math.min(p[0], q[0]), x1: Math.max(p[0], q[0]), z0: Math.min(p[1], q[1]), z1: Math.max(p[1], q[1]), y: gy + y - SLAB - .01 }); } floor(a, c, b, d, y + .02); };
      if (holeLane < 0) slab(x0, x1, z0, z1);
      else { slab(x0, x1, hz1, z1); slab(x0, x1, z0, hz0); slab(x0, sxa, hz0, hz1); slab(sxb, x1, hz0, hz1);
        // guarda-corpo em volta do buraco
        // grade de verdade (barras e postes) dos dois lados abertos do buraco — nada de parede "invisível"
        const grade = zz => { box(MAT.rail, sxa, y + .95, zz - .03, sxb, y + 1.0, zz + .03); box(MAT.rail, sxa, y + .48, zz - .02, sxb, y + .52, zz + .02); for (let x = sxa; x <= sxb + .01; x += .55) box(MAT.rail, x - .02, y, zz - .02, x + .02, y + .97, zz + .02); };
        grade(hz1); col(sxa, hz1 - .05, sxb, hz1 + .05, y, y + 1); if (hz0 > lz0 + .01) grade(hz0); }
      if (top && gable) { roofGable(y); break; }
      if (top) { // terraço: mureta e laje exposta
        for (const [a, b] of [[z0, z0 + T_], [z1 - T_, z1]]) { box(EXT, x0, y, a, x1, y + 1.05, b, EXC); col(x0, a, x1, b, y, y + 1.05); }
        for (const [a, b] of [[x0, x0 + T_], [x1 - T_, x1]]) { box(EXT, a, y, z0, b, y + 1.05, z1, EXC); col(a, z0, b, z1, y, y + 1.05); }
        for (const q of [[x0 - .05, z0 - .05, x1 + .05, z0 + T_ + .03], [x0 - .05, z1 - T_ - .03, x1 + .05, z1 + .05], [x0 - .05, z0, x0 + T_ + .03, z1], [x1 - T_ - .03, z0, x1 + .05, z1]]) box(MAT.conc, q[0], y + 1.05, q[1], q[2], y + 1.12, q[3], 0xbdbab3);
        // casinha da escada no terraço (cobertura)
        box(MAT.ext, sx0 - .1, y + 2.4, lz0 - .1, sx1 + .1, y + 2.55, lz2 + .2, exterior);
        for (const [px, pz] of [[sx0, lz2], [sx1, lz2], [sx0, lz0], [sx1, lz0]]) { box(MAT.ext, px - .08, y, pz - .08, px + .08, y + 2.4, pz + .08, exterior); col(px - .1, pz - .1, px + .1, pz + .1, y, y + 2.4); }
        break;
      }
      // escada até o próximo andar (faixa k%2: ida +x / volta -x)
      const lane = k % 2, a = lane === 0 ? lz0 : lz1, b = lane === 0 ? lz1 : lz2, up = lane === 0;
      const ns = 16, sl = STEP_L / ns, sh = FH / ns, mkStair = !(gable && k === NF - 1);
      if (mkStair) {
      for (let i = 0; i < ns; i++) { const xs = up ? sxa + i * sl : sxb - (i + 1) * sl; box(MAT.conc, xs, y, a + .02, xs + sl, y + (i + 1) * sh, b - .02, 0xc9c5bd); }
      ramp(sxa, a, sxb, b, y + .02, y + FH + .02, true, !up);
      // grade de metal no lado aberto da escada (entre as duas faixas): balaústres + corrimão inclinado
      { const rz = lz1 + (lane === 0 ? -.06 : .06);
        const yAt = x => y + FH * Math.max(0, Math.min(1, up ? (x - sxa) / STEP_L : (sxb - x) / STEP_L));
        for (let i = 0; i < ns; i += 2) { const xs = up ? sxa + i * sl : sxb - (i + 1) * sl, xc = xs + sl / 2, ys = y + (i + 1) * sh; box(MAT.rail, xc - .015, ys, rz - .015, xc + .015, yAt(xc) + .95, rz + .015); }
        // corrimão inclinado contínuo
        { const len = Math.hypot(STEP_L, FH), o = new T.Object3D(); o.position.set((sxa + sxb) / 2, y + FH / 2 + .95, rz); o.rotation.z = (up ? 1 : -1) * Math.atan2(FH, STEP_L); o.updateMatrix();
          const ge = new T.BoxGeometry(len, .06, .06).toNonIndexed(), n = ge.attributes.position.count, cc = new Float32Array(n * 3).fill(1); ge.setAttribute('color', new T.BufferAttribute(cc, 3)); ge.applyMatrix4(o.matrix); ge.applyMatrix4(g.matrixWorld); push(S.mg || ('_' + S.id), MAT.rail, ge); }
        box(MAT.rail, (up ? sxa : sxb) - .03, y, rz - .03, (up ? sxa : sxb) + .03, y + sh + .95, rz + .03); box(MAT.rail, (up ? sxb : sxa) - .03, y + FH - sh, rz - .03, (up ? sxb : sxa) + .03, y + FH + .95, rz + .03);
        col(sxa + .3, rz - .05, sxb - .3, rz + .05, y, y + FH + 1); }
      }
      // ---------- paredes do andar ----------
      const cz_ = lz2 + .1, front = winsOn(x0 + .6, x1 - .6, k === 0 || S.balcony ? 0 : null, .9, 1.4, XM != null ? [XM] : null), back = winsOn(sx1 + .3, x1 - .6, null, .9, 1.3), side = winsOn(z0 + .6, z1 - .6, null, .9, 1.4, [cz_]);
      const balc = S.balcony && k > 0; let balDoor = 0;
      if (k === 0 && ST === 'shop') { front.length = 0; front.push([x0 + .7, -1.0, .45, 2.45], [1.0, x1 - .7, .45, 2.45]); }
      if (k === 0) front.push([-.6, .6, 0, 2.2]);
      else if (balc) { for (let i = front.length - 1; i >= 0; i--) if (Math.abs((front[i][0] + front[i][1]) / 2) < 1.4) front.splice(i, 1); front.push([-.6, .6, 0, 2.2]); balDoor = 1;
        // varanda: piso, mureta e corrimão
        const bw = 1.9, bd = 1.3; box(MAT.conc, -bw, y - .2, z1, bw, y + .02, z1 + bd, 0xb9b5ad); floor(-bw, z1, bw, z1 + bd, y + .02);
        for (const q of [[-bw, z1 + bd - .12, bw, z1 + bd], [-bw, z1, -bw + .12, z1 + bd], [bw - .12, z1, bw, z1 + bd]]) { box(MAT.ext, q[0], y, q[1], q[2], y + .95, q[3], exterior); col(q[0], q[1], q[2], q[3], y, y + 1.05); }
        box(MAT.rail, -bw - .02, y + .95, z1 + bd - .14, bw + .02, y + 1.02, z1 + bd + .02); }
      wall(true, x0, x1, z1, y, FH, front, EXT, MAT.int, true, 1);
      wall(true, x0, x1, z0, y, FH, back, EXT, MAT.int, true, -1);
      wall(false, z0 + T_ / 2, z1 - T_ / 2, x0, y, FH, side.filter(o => o[1] < lz2 - .3 || o[0] > lz2 + .3 ? true : false), EXT, MAT.int, true, -1);
      wall(false, z0 + T_ / 2, z1 - T_ / 2, x1, y, FH, side, EXT, MAT.int, true, 1);
      // faixa (cornija) na altura de cada laje: muda bastante a cara do prédio
      if (S.band && k > 0) { const e = .27, bc = ST === 'panel' ? 0x8f8c85 : 0xd9d5cc; box(MAT.conc, x0 - e, y - .3, z1 - .02, x1 + e, y - .06, z1 + e, bc); box(MAT.conc, x0 - e, y - .3, z0 - e, x1 + e, y - .06, z0 + .02, bc); box(MAT.conc, x0 - e, y - .3, z0 + .02, x0 + .02, y - .06, z1 - .02, bc); box(MAT.conc, x1 - .02, y - .3, z0 + .02, x1 + e, y - .06, z1 - .02, bc); }
      if (k === 0) door(true, -.6, .6, z1, 0);
      // parede interna: corredor da escada | cômodos (porta), e divisão dos cômodos (porta)
      const cz = lz2 + .1, xm = XM;
      // portas do corredor da escada: A (lado do patamar esquerdo), B (lado do patamar direito), C (2º cômodo, no meio dele)
      const dA = [[sx0 + .1, sx0 + 1.1, 0, 2.2], [sx1 - 1.15, sx1 - .15, 0, 2.2]]; if (xm != null) { const c = (xm + ix1) / 2; dA.push([c - .5, c + .5, 0, 2.2]); }
      const dB = [[(cz + iz1) / 2 - .5, (cz + iz1) / 2 + .5, 0, 2.2]];
      wall(true, ix0, ix1, cz, y, FH - SLAB, dA, MAT.int, MAT.int, false);
      const openShop = ST === 'shop' && k === 0;
      if (!openShop && xm != null) wall(false, cz + T_ / 2, iz1, xm, y, FH - SLAB, dB, MAT.int, MAT.int, false);
      for (const o of dA) door(true, o[0], o[1], cz, y, 1); if (!openShop && xm != null) for (const o of dB) door(false, o[0], o[1], xm, y, 1);
      if (balDoor) door(true, -.6, .6, z1, y);
      // cômodos (para os móveis): esquerda e direita da divisória
      (S.rooms || (S.rooms = [])).push({ k, y: gy + y, a: [ix0 + .2, cz + T_ / 2 + .2, (xm == null ? ix1 : xm) - .2, iz1 - .2], b: xm == null ? null : [xm + .2, cz + T_ / 2 + .2, ix1 - .2, iz1 - .2] });
      // detalhes de cada andar: rodapé escuro e lâmpada
      box(MAT.dark, ix0, y + .02, iz1 - .03, ix1, y + .12, iz1, 0x333333);
      LAMPS.push({ x: L2W(0, (cz + iz1) / 2)[0], y: gy + y + 2.6, z: L2W(0, (cz + iz1) / 2)[1] });
    }
    // telhado de duas águas (cumeeira ao longo de X)
    function roofGable(y) {
      const rh = D * .26, hz = D / 2 + .45, a = Math.atan(rh / (D / 2)), Lr = hz / Math.cos(a);
      const tint = (geo, c) => { const n = geo.attributes.position.count, cc = new Float32Array(n * 3), t = new T.Color(c).convertSRGBToLinear(); for (let i = 0; i < n; i++) { cc[i * 3] = t.r; cc[i * 3 + 1] = t.g; cc[i * 3 + 2] = t.b; } geo.setAttribute('color', new T.BufferAttribute(cc, 3)); return geo; };
      const put = (geo, m, o) => { o.updateMatrix(); const ge = tint(geo.toNonIndexed(), m === MAT.roof ? 0xffffff : EXC); ge.applyMatrix4(o.matrix); ge.applyMatrix4(g.matrixWorld); push(S.mg || ('_' + S.id), m, ge); };
      for (const sg of [1, -1]) { const o = new T.Object3D(); o.position.set(0, y + rh - (hz / 2) * Math.tan(a) + .08, sg * hz / 2); o.rotation.x = sg * a; put(new T.BoxGeometry(W + .7, .12, Lr), MAT.roof, o); }
      const sh = new T.Shape(); sh.moveTo(-D / 2, 0); sh.lineTo(D / 2, 0); sh.lineTo(0, rh); sh.lineTo(-D / 2, 0);
      for (const [sx, ry] of [[x0 + T_ / 2 - .02, -Math.PI / 2], [x1 - T_ / 2 + .02, Math.PI / 2]]) { const o = new T.Object3D(); o.position.set(sx, y, 0); o.rotation.y = ry; put(new T.ShapeGeometry(sh), EXT, o); }
      box(MAT.frame, x0 - .35, y + rh + .02, -.1, x1 + .35, y + rh + .2, .1, 0x5a2a1c);
    }
    S.L2W = L2W;
    // marquise sobre a entrada (loja: toldo largo e letreiro)
    if (ST === 'shop') { box(MAT.awn, x0 + .4, 2.62, z1, x1 - .4, 2.72, z1 + 1.5, S.awn || 0x2f5d3a); box(MAT.awn, x0 + .4, 2.35, z1 + 1.45, x1 - .4, 2.72, z1 + 1.52, S.awn || 0x2f5d3a); box(MAT.awn, -2.2, 2.78, z1, 2.2, 3.08, z1 + .1, 0x1d1f22); }
    else box(MAT.conc, -1.2, 2.45, z1, 1.2, 2.6, z1 + 1.1, 0xb8b4ac); box(MAT.brick, -1.3, 0, z1 - .05, -1.15, .12, z1 + 1.2); box(MAT.conc, -1.3, 0, z1, 1.3, .12, z1 + 1.2, 0xa9a59d); floor(-1.3, z1, 1.3, z1 + 1.2, .12);

    // ---------- junta tudo por material (poucos "desenhos" por prédio) ----------
    const v = new T.Vector3(), MK = S.mg || ('_' + S.id);
    for (const [m, list] of BK) {
      const P = new Float32Array(list.length * 108), N = new Float32Array(list.length * 108), C = new Float32Array(list.length * 108), U = new Float32Array(list.length * 72);
      const bg = new T.BoxGeometry(1, 1, 1).toNonIndexed(), bp = bg.attributes.position.array, bn = bg.attributes.normal.array, bu = bg.attributes.uv.array;
      list.forEach((q, i) => { tint.set(q[6]).convertSRGBToLinear(); const sx = q[3] - q[0], sy = q[4] - q[1], sz = q[5] - q[2], cx = (q[0] + q[3]) / 2, cy = (q[1] + q[4]) / 2, czz = (q[2] + q[5]) / 2;
        for (let j = 0; j < 36; j++) { const o = i * 108 + j * 3; P[o] = bp[j * 3] * sx + cx; P[o + 1] = bp[j * 3 + 1] * sy + cy; P[o + 2] = bp[j * 3 + 2] * sz + czz; N[o] = bn[j * 3]; N[o + 1] = bn[j * 3 + 1]; N[o + 2] = bn[j * 3 + 2]; C[o] = tint.r; C[o + 1] = tint.g; C[o + 2] = tint.b; U[i * 72 + j * 2] = bu[j * 2]; U[i * 72 + j * 2 + 1] = bu[j * 2 + 1]; } });
      const ge = new T.BufferGeometry(); ge.setAttribute('position', new T.BufferAttribute(P, 3)); ge.setAttribute('normal', new T.BufferAttribute(N, 3)); ge.setAttribute('color', new T.BufferAttribute(C, 3)); ge.setAttribute('uv', new T.BufferAttribute(U, 2)); ge.computeBoundingSphere();
      ge.applyMatrix4(g.matrixWorld); push(MK, m, ge);
    }
    // vidros (quebram com tiro, como no resto do jogo)
    if (window.DZW && glass.length) { const bySize = new Map(); for (const q of glass) { const k = q[4].toFixed(2) + 'x' + q[5].toFixed(2); if (!bySize.has(k)) bySize.set(k, []); bySize.get(k).push(q); }
      for (const [, l] of bySize) DZW.add(g, l.map(q => [q[0], q[1], q[2], q[3]]), l[0][4] - .04, l[0][5] - .04); }
    // área da construção: grama não nasce dentro e a câmera não atravessa as paredes
    const a = L2W(x0, z0), b = L2W(x1, z1), fp = { x0: Math.min(a[0], b[0]), x1: Math.max(a[0], b[0]), z0: Math.min(a[1], b[1]), z1: Math.max(a[1], b[1]) };
    fp.S = S; FP.push(fp); S.fp = fp; S.g = g; S.gy = gy; S.FH = FH; S.SLAB = SLAB;
    // pontos para loot (um por cômodo e andar)
    S.spots = []; for (let k = 0; k < NF; k++) S.spots.push([...L2W((sx1 + x1) / 2, (lz2 + z1) / 2), gy + k * FH], [...L2W(x1 - 1.2, z1 - 1.2), gy + k * FH]);
  }
  window.DZSTR = STRS;
  for (const S of STRS) try { build(S); } catch (e) { console.warn('prédio', S.id, e); }
  flush();
})();
