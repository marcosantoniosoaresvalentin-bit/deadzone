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
  const FLR = window.DZFLR = [];   // pisos: {x0,x1,z0,z1,y} ou rampa {.., ax:'x'|'z', a0,a1,y0,y1}

  // ---------- a física passa a reconhecer pisos, escadas e terraços ----------
  const _GY = GY;
  GY = function (x, z, y) {
    let h = TERH(x, z); const lim = (y == null ? 1e9 : y) + .55;
    for (const f of FLR) {
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
    wood: canvasT(256, 256, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = 'hsl(' + (24 + Math.random() * 8) + ',' + (35 + Math.random() * 10) + '%,' + (26 + Math.random() * 10) + '%)'; g.fillRect(0, i * 32, w, 31); g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, i * 32 + 31, w, 1); } noise(g, w, h, 5000, .1); })
  };
  const MAT = {
    ext: triMat(TX.plaster, .45), int: triMat(TX.plaster, .5), brick: triMat(TX.brick, .9), conc: triMat(TX.concrete, .35),
    tile: triMat(TX.tiles, .45), wood: triMat(TX.wood, .5, { roughness: .8 }),
    frame: new T.MeshStandardMaterial({ color: lin(0x2b2d30), roughness: .6, metalness: .3, vertexColors: true }),
    rail: new T.MeshStandardMaterial({ color: lin(0x3a3c40), roughness: .5, metalness: .5, vertexColors: true }),
    door: new T.MeshStandardMaterial({ color: lin(0x5a3a22), roughness: .7 }),
    dark: new T.MeshStandardMaterial({ color: lin(0x111214), roughness: 1 })
  };

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
    const floor = (x0, z0, x1, z1, y) => { const p = L2W(x0, z0), q = L2W(x1, z1); FLR.push({ x0: Math.min(p[0], q[0]), x1: Math.max(p[0], q[0]), z0: Math.min(p[1], q[1]), z1: Math.max(p[1], q[1]), y: gy + y }); };
    const ramp = (x0, z0, x1, z1, y0, y1, alongX, rev) => {
      const p = L2W(x0, z0), q = L2W(x1, z1), r = { x0: Math.min(p[0], q[0]), x1: Math.max(p[0], q[0]), z0: Math.min(p[1], q[1]), z1: Math.max(p[1], q[1]), y0: gy + y0, y1: gy + y1 };
      // eixo da rampa no mundo (rotação em 90°): x local vira x ou z do mundo
      const lx = L2W(rev ? x1 : x0, z0), lx2 = L2W(rev ? x0 : x1, z0);
      if (alongX) { if (Math.abs(lx2[0] - lx[0]) > Math.abs(lx2[1] - lx[1])) { r.ax = 'x'; r.a0 = lx[0]; r.a1 = lx2[0]; } else { r.ax = 'z'; r.a0 = lx[1]; r.a1 = lx2[1]; } }
      FLR.push(r);
    };
    const glass = [];
    // parede ao longo de X (em z, espessura T_) ou de Z; aberturas: [u0,u1,v0,v1] (u ao longo, v altura relativa ao andar)
    function wall(alongX, a0, a1, f, y0, h, opens, mExt, mInt, colBase) {
      const th = T_ / 2, cuts = [a0];
      for (const o of opens) cuts.push(o[0], o[1]); cuts.push(a1); cuts.sort((a, b) => a - b);
      const tc = mExt === MAT.ext ? exterior : 0xf2f0ea, P = (u0, u1, v0, v1, m) => alongX ? box(m, u0, y0 + v0, f - th, u1, y0 + v1, f + th, tc) : box(m, f - th, y0 + v0, u0, f + th, y0 + v1, u1, tc);
      const C = (u0, u1, v0, v1) => alongX ? col(u0, f - th, u1, f + th, y0 + v0, y0 + v1) : col(f - th, u0, f + th, u1, y0 + v0, y0 + v1);
      // trechos cheios entre aberturas
      let u = a0;
      const sorted = opens.slice().sort((a, b) => a[0] - b[0]);
      for (const o of sorted) { if (o[0] > u) { P(u, o[0], 0, h, mExt); C(u, o[0], 0, h); } P(o[0], o[1], 0, o[2], mExt); if (o[2] > .05) C(o[0], o[1], 0, o[2]); P(o[0], o[1], o[3], h, mExt); if (o[3] < h) C(o[0], o[1], o[3], h); u = o[1]; }
      if (a1 > u) { P(u, a1, 0, h, mExt); C(u, a1, 0, h); }
      if (colBase && y0 < .1) { // barra de tijolo na base (externa)
        const bt = th + .02; let uu = a0; for (const o of sorted) { if (o[2] < .05) { if (o[0] > uu) (alongX ? box(MAT.brick, uu, 0, f - bt, o[0], .9, f + bt) : box(MAT.brick, f - bt, 0, uu, f + bt, .9, o[0])); uu = o[1]; } }
        if (a1 > uu) (alongX ? box(MAT.brick, uu, 0, f - bt, a1, .9, f + bt) : box(MAT.brick, f - bt, 0, uu, f + bt, .9, a1));
      }
      // molduras e vidros das janelas
      for (const o of sorted) if (o[2] > .3) {
        const cu = (o[0] + o[1]) / 2, cv = y0 + (o[2] + o[3]) / 2, ww = o[1] - o[0], hh = o[3] - o[2], d = th + .03;
        if (alongX) { box(MAT.frame, o[0] - .06, y0 + o[2] - .08, f - d, o[1] + .06, y0 + o[2], f + d); box(MAT.frame, o[0] - .06, y0 + o[3], f - d, o[1] + .06, y0 + o[3] + .06, f + d); box(MAT.frame, o[0] - .06, y0 + o[2], f - .04, o[0], y0 + o[3], f + .04); box(MAT.frame, o[1], y0 + o[2], f - .04, o[1] + .06, y0 + o[3], f + .04); box(MAT.frame, cu - .025, y0 + o[2], f - .03, cu + .025, y0 + o[3], f + .03); glass.push([cu, cv, f, 0, ww, hh]); }
        else { box(MAT.frame, f - d, y0 + o[2] - .08, o[0] - .06, f + d, y0 + o[2], o[1] + .06); box(MAT.frame, f - d, y0 + o[3], o[0] - .06, f + d, y0 + o[3] + .06, o[1] + .06); box(MAT.frame, f - .04, y0 + o[2], o[0] - .06, f + .04, y0 + o[3], o[0]); box(MAT.frame, f - .04, y0 + o[2], o[1], f + .04, y0 + o[3], o[1] + .06); box(MAT.frame, f - .03, y0 + o[2], cu - .025, f + .03, y0 + o[3], cu + .025); glass.push([f, cv, cu, Math.PI / 2, ww, hh]); }
      }
    }
    // portas com folha que abre
    function door(alongX, u0, u1, f, y0) {
      const piv = new T.Group(), w = u1 - u0; if (alongX) piv.position.set(u0, y0, f); else piv.position.set(f, y0, u0);
      const leaf = new T.Mesh(new T.BoxGeometry(alongX ? w - .04 : .05, 2.12, alongX ? .05 : w - .04), MAT.door); leaf.position.set(alongX ? w / 2 : 0, 1.06, alongX ? 0 : w / 2); leaf.castShadow = true; piv.add(leaf);
      const kn = new T.Mesh(new T.BoxGeometry(.05, .05, .05), MAT.frame); kn.position.set(alongX ? w - .12 : .06, 1.0, alongX ? .06 : w - .12); piv.add(kn);
      g.add(piv);
      const bx = alongX ? col(u0 + .05, f - .1, u1 - .05, f + .1, y0, y0 + 2.2) : col(f - .1, u0 + .05, f + .1, u1 - .05, y0, y0 + 2.2);
      const c = alongX ? L2W((u0 + u1) / 2, f) : L2W(f, (u0 + u1) / 2);
      const Dd = { piv, x: c[0], z: c[1], open: 0, a: 0, bx, y: gy + y0 }; bx.door = Dd; doors.push(Dd); return Dd;
    }
    // janelas distribuídas numa parede (evita a porta)
    const winsOn = (a0, a1, skip, sill, wh) => { const out = [], n = Math.max(1, Math.floor((a1 - a0) / 2.6)), stp = (a1 - a0) / n; for (let i = 0; i < n; i++) { const c = a0 + stp * (i + .5); if (skip && Math.abs(c - skip) < 1.4) continue; out.push([c - .6, c + .6, sill, sill + wh]); } return out; };

    const x0 = -W / 2, x1 = W / 2, z0 = -D / 2, z1 = D / 2, ix0 = x0 + T_ / 2, ix1 = x1 - T_ / 2, iz0 = z0 + T_ / 2, iz1 = z1 - T_ / 2;
    // poço da escada no fundo, à esquerda: patamar | rampa | patamar, duas faixas (vai e volta)
    const sx0 = ix0, sxa = sx0 + LAND, sxb = sxa + STEP_L, sx1 = sxb + LAND, lz0 = iz0, lz1 = lz0 + LANE, lz2 = lz1 + LANE;
    const exterior = S.color || 0xe6dccb;
    for (let k = 0; k <= NF; k++) {
      const y = k * FH, top = k === NF;
      // laje/piso (o térreo é o chão); buraco sobre a faixa da escada que chega por baixo
      const holeLane = k > 0 ? ((k - 1) % 2) : -1, hz0 = holeLane === 0 ? lz0 : lz1, hz1 = holeLane === 0 ? lz1 : lz2;
      const slab = (a, b, c, d) => { if (b - a < .05 || d - c < .05) return; box(k === 0 ? MAT.tile : (top ? MAT.conc : MAT.tile), a, y - (k ? SLAB : .02), c, b, y + .02, d); if (k) box(MAT.int, a, y - SLAB - .01, c, b, y - SLAB, d, 0xf2f0ea); floor(a, c, b, d, y + .02); };
      if (holeLane < 0) slab(x0, x1, z0, z1);
      else { slab(x0, x1, hz1, z1); slab(x0, x1, z0, hz0); slab(x0, sxa, hz0, hz1); slab(sxb, x1, hz0, hz1);
        // guarda-corpo em volta do buraco
        box(MAT.rail, sxa, y, hz1 - .03, sxb, y + 1, hz1 + .03); col(sxa, hz1 - .05, sxb, hz1 + .05, y, y + 1); }
      if (top) { // terraço: mureta e laje exposta
        for (const [a, b] of [[z0, z0 + T_], [z1 - T_, z1]]) { box(MAT.ext, x0, y, a, x1, y + 1.05, b, exterior); col(x0, a, x1, b, y, y + 1.05); }
        for (const [a, b] of [[x0, x0 + T_], [x1 - T_, x1]]) { box(MAT.ext, a, y, z0, b, y + 1.05, z1, exterior); col(a, z0, b, z1, y, y + 1.05); }
        box(MAT.conc, x0 - .05, y + 1.05, z0 - .05, x1 + .05, y + 1.12, z1 + .05, 0xbdbab3);
        // casinha da escada no terraço (cobertura)
        box(MAT.ext, sx0 - .1, y + 2.4, lz0 - .1, sx1 + .1, y + 2.55, lz2 + .2, exterior);
        for (const [px, pz] of [[sx0, lz2], [sx1, lz2], [sx0, lz0], [sx1, lz0]]) { box(MAT.ext, px - .08, y, pz - .08, px + .08, y + 2.4, pz + .08, exterior); col(px - .1, pz - .1, px + .1, pz + .1, y, y + 2.4); }
        break;
      }
      // escada até o próximo andar (faixa k%2: ida +x / volta -x)
      const lane = k % 2, a = lane === 0 ? lz0 : lz1, b = lane === 0 ? lz1 : lz2, up = lane === 0;
      const ns = 16, sl = STEP_L / ns, sh = FH / ns;
      for (let i = 0; i < ns; i++) { const xs = up ? sxa + i * sl : sxb - (i + 1) * sl; box(MAT.conc, xs, y, a + .02, xs + sl, y + (i + 1) * sh, b - .02, 0xc9c5bd); }
      ramp(sxa, a, sxb, b, y + .02, y + FH + .02, true, !up);
      // corrimão do lado de dentro
      box(MAT.rail, sxa, y + 1, (lane === 0 ? b : a) - .03, sxb, y + 1.05, (lane === 0 ? b : a) + .03);
      // parede entre as faixas (meia altura) para não cair de uma faixa na outra
      if (lane === 0) { box(MAT.int, sxa + .8, y, lz1 - .06, sxb - .8, y + 1, lz1 + .06, 0xf2f0ea); col(sxa + .8, lz1 - .08, sxb - .8, lz1 + .08, y, y + 1); }
      // ---------- paredes do andar ----------
      const front = winsOn(x0 + .6, x1 - .6, k === 0 ? 0 : null, 1.0, 1.3), back = winsOn(sx1 + .3, x1 - .6, null, 1.1, 1.2), side = winsOn(z0 + .6, z1 - .6, null, 1.0, 1.3);
      if (k === 0) front.push([-.6, .6, 0, 2.25]);
      wall(true, x0, x1, z1, y, FH, front, MAT.ext, MAT.int, true);
      wall(true, x0, x1, z0, y, FH, back, MAT.ext, MAT.int, true);
      wall(false, z0 + T_ / 2, z1 - T_ / 2, x0, y, FH, side.filter(o => o[1] < lz2 - .3 || o[0] > lz2 + .3 ? true : false), MAT.ext, MAT.int, true);
      wall(false, z0 + T_ / 2, z1 - T_ / 2, x1, y, FH, side, MAT.ext, MAT.int, true);
      if (k === 0) door(true, -.6, .6, z1, 0);
      // parede interna: corredor da escada | cômodos (porta), e divisão dos cômodos (porta)
      const cz = lz2 + .1, xm = (sx1 + x1) / 2 + .6;
      wall(true, ix0, ix1, cz, y, FH - SLAB, [[sx0 + .1, sx0 + 1.15, 0, 2.15], [sx1 - 1.2, sx1 - .1, 0, 2.15], [x1 - 2.4, x1 - 1.4, 0, 2.15]], MAT.int, MAT.int, false);
      wall(false, cz + T_ / 2, iz1, xm, y, FH - SLAB, [[(cz + iz1) / 2 - .5, (cz + iz1) / 2 + .5, 0, 2.15]], MAT.int, MAT.int, false);
      // detalhes de cada andar: rodapé escuro e lâmpada
      box(MAT.dark, ix0, y + .02, iz1 - .03, ix1, y + .12, iz1, 0x333333);
      LAMPS.push({ x: L2W(0, (cz + iz1) / 2)[0], y: gy + y + 2.6, z: L2W(0, (cz + iz1) / 2)[1] });
    }
    // marquise sobre a entrada
    box(MAT.conc, -1.2, 2.45, z1, 1.2, 2.6, z1 + 1.1, 0xb8b4ac); box(MAT.brick, -1.3, 0, z1 - .05, -1.15, .12, z1 + 1.2); box(MAT.conc, -1.3, 0, z1, 1.3, .12, z1 + 1.2, 0xa9a59d); floor(-1.3, z1, 1.3, z1 + 1.2, .12);

    // ---------- junta tudo por material (poucos "desenhos" por prédio) ----------
    const v = new T.Vector3();
    for (const [m, list] of BK) {
      const P = new Float32Array(list.length * 108), N = new Float32Array(list.length * 108), C = new Float32Array(list.length * 108), U = new Float32Array(list.length * 72);
      const bg = new T.BoxGeometry(1, 1, 1).toNonIndexed(), bp = bg.attributes.position.array, bn = bg.attributes.normal.array, bu = bg.attributes.uv.array;
      list.forEach((q, i) => { tint.set(q[6]).convertSRGBToLinear(); const sx = q[3] - q[0], sy = q[4] - q[1], sz = q[5] - q[2], cx = (q[0] + q[3]) / 2, cy = (q[1] + q[4]) / 2, czz = (q[2] + q[5]) / 2;
        for (let j = 0; j < 36; j++) { const o = i * 108 + j * 3; P[o] = bp[j * 3] * sx + cx; P[o + 1] = bp[j * 3 + 1] * sy + cy; P[o + 2] = bp[j * 3 + 2] * sz + czz; N[o] = bn[j * 3]; N[o + 1] = bn[j * 3 + 1]; N[o + 2] = bn[j * 3 + 2]; C[o] = tint.r; C[o + 1] = tint.g; C[o + 2] = tint.b; U[i * 72 + j * 2] = bu[j * 2]; U[i * 72 + j * 2 + 1] = bu[j * 2 + 1]; } });
      const ge = new T.BufferGeometry(); ge.setAttribute('position', new T.BufferAttribute(P, 3)); ge.setAttribute('normal', new T.BufferAttribute(N, 3)); ge.setAttribute('color', new T.BufferAttribute(C, 3)); ge.setAttribute('uv', new T.BufferAttribute(U, 2)); ge.computeBoundingSphere();
      const me = new T.Mesh(ge, m); me.castShadow = true; me.receiveShadow = true; g.add(me);
    }
    // vidros (quebram com tiro, como no resto do jogo)
    if (window.DZW && glass.length) { const bySize = new Map(); for (const q of glass) { const k = q[4].toFixed(2) + 'x' + q[5].toFixed(2); if (!bySize.has(k)) bySize.set(k, []); bySize.get(k).push(q); }
      for (const [, l] of bySize) DZW.add(g, l.map(q => [q[0], q[1], q[2], q[3]]), l[0][4] - .04, l[0][5] - .04); }
    // área da construção: grama não nasce dentro e a câmera não atravessa as paredes
    const a = L2W(x0, z0), b = L2W(x1, z1), fp = { x0: Math.min(a[0], b[0]), x1: Math.max(a[0], b[0]), z0: Math.min(a[1], b[1]), z1: Math.max(a[1], b[1]) };
    FP.push(fp); S.fp = fp; S.g = g;
    // pontos para loot (um por cômodo e andar)
    S.spots = []; for (let k = 0; k < NF; k++) S.spots.push([...L2W((sx1 + x1) / 2, (lz2 + z1) / 2), gy + k * FH], [...L2W(x1 - 1.2, z1 - 1.2), gy + k * FH]);
  }
  window.DZSTR = STRS;
  for (const S of STRS) try { build(S); } catch (e) { console.warn('prédio', S.id, e); }
})();
