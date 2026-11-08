/* Deadzone · world/city.js
 * Monta a CIDADE descrita em world/map.js (CITY):
 *  - ruas de asfalto com faixa tracejada, cruzamentos, calçadas com meio-fio;
 *  - muretas em volta dos lotes (dá para pular por cima) e praças com muretas/blocos de concreto (cobertura);
 *  - postes de luz;
 *  - móveis dentro dos prédios com interior (cama, sofá, mesa, escrivaninha, cadeira) — aparecem só de perto.
 * Modelos prontos (CC0, Microsoft Remix 3D via Ethereal Engine Open Asset Kit): móveis.
 */
(function () {
  if (typeof CITY === 'undefined') return;
  const C = CITY, H = C.h != null ? C.h : TERH(C.x, C.z), FLR = window.DZFLR;
  const lin = c => new T.Color(c).convertSRGBToLinear();
  const canvasT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 4; return t; };
  const noise = (g, w, h, n, a) => { for (let i = 0; i < n; i++) { g.fillStyle = 'rgba(' + (Math.random() < .5 ? '0,0,0' : '255,255,255') + ',' + (Math.random() * a).toFixed(3) + ')'; g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2); } };
  // asfalto (u = largura da rua, v = comprimento): faixa amarela tracejada no meio
  const asph = (line) => canvasT(256, 512, (g, w, h) => {
    g.fillStyle = '#3d4044'; g.fillRect(0, 0, w, h); noise(g, w, h, 16000, .12);
    for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(20,20,20,' + (.05 + Math.random() * .1) + ')'; g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, 8 + Math.random() * 30, 6 + Math.random() * 20, Math.random() * 3, 0, 7); g.fill(); }

  });
  const TXR = asph(1), TXI = asph(0);
  const TXS = canvasT(256, 256, (g, w, h) => { g.fillStyle = '#a7a39b'; g.fillRect(0, 0, w, h); noise(g, w, h, 9000, .1); g.fillStyle = 'rgba(60,60,60,.35)'; for (let i = 0; i <= 256; i += 64) { g.fillRect(i, 0, 2, h); g.fillRect(0, i, w, 2); } });
  const TXC = canvasT(256, 256, (g, w, h) => { g.fillStyle = '#9b988f'; g.fillRect(0, 0, w, h); noise(g, w, h, 14000, .13); for (let i = 0; i < 25; i++) { g.fillStyle = 'rgba(40,40,40,' + (.03 + Math.random() * .06) + ')'; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 10 + Math.random() * 30, 0, 7); g.fill(); } });
  const TXB = canvasT(256, 256, (g, w, h) => { g.fillStyle = '#6f6359'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) for (let x = -32; x < w; x += 32) { const o = (y / 16 % 2) * 16; g.fillStyle = 'hsl(' + (10 + Math.random() * 12) + ',' + (30 + Math.random() * 20) + '%,' + (30 + Math.random() * 14) + '%)'; g.fillRect(x + o + 1, y + 1, 30, 14); } noise(g, w, h, 6000, .12); });
  const MR = new T.MeshStandardMaterial({ map: TXR, roughness: .95 }), MI = new T.MeshStandardMaterial({ map: TXI, roughness: .95 });
  // materiais com textura em coordenadas do mundo (mesmo tamanho em qualquer peça)
  function triMat(map, k) {
    const m = new T.MeshStandardMaterial({ map, vertexColors: true, roughness: .9 });
    m.onBeforeCompile = s => { s.uniforms.uK = { value: k };
      s.vertexShader = 'varying vec3 vWP;varying vec3 vWN;\n' + s.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWP=(modelMatrix*vec4(transformed,1.)).xyz;vWN=normalize(mat3(modelMatrix)*objectNormal);');
      s.fragmentShader = 'uniform float uK;varying vec3 vWP;varying vec3 vWN;\n' + s.fragmentShader.replace('#include <map_fragment>', 'vec3 an=abs(vWN);vec2 bu=an.x>an.z?vWP.zy:vWP.xy;if(an.y>.7)bu=vWP.xz;vec4 texelColor=mapTexelToLinear(texture2D(map,bu*uK));diffuseColor*=texelColor;'); };
    m.customProgramCacheKey = () => 'ctri' + k; return m;
  }
  const MS = triMat(TXS, .5), MC = triMat(TXC, .4), MB = triMat(TXB, .9), MM = new T.MeshStandardMaterial({ color: lin(0x34373b), roughness: .5, metalness: .6, vertexColors: true });

  // ---------- caixas juntas por material (poucos desenhos) ----------
  const BK = new Map(), tint = new T.Color();
  const box = (m, x0, y0, z0, x1, y1, z1, col) => { if (x1 - x0 < .001 || y1 - y0 < .001 || z1 - z0 < .001) return; if (!BK.has(m)) BK.set(m, []); BK.get(m).push([x0, y0, z0, x1, y1, z1, col == null ? 0xffffff : col]); };
  const col = (x0, z0, x1, z1, yb, yt) => addBox({ x0: Math.min(x0, x1), x1: Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1), w: 1, yb, yt });
  const floor = (x0, z0, x1, z1, y) => { if (FLR && FLR.add) FLR.add({ x0, x1, z0, z1, y }); };
  function flushBoxes() {
    const bg = new T.BoxGeometry(1, 1, 1).toNonIndexed(), bp = bg.attributes.position.array, bn = bg.attributes.normal.array, bu = bg.attributes.uv.array;
    for (const [m, list] of BK) {
      const P = new Float32Array(list.length * 108), N = new Float32Array(list.length * 108), Cc = new Float32Array(list.length * 108), U = new Float32Array(list.length * 72);
      list.forEach((q, i) => { tint.set(q[6]).convertSRGBToLinear(); const sx = q[3] - q[0], sy = q[4] - q[1], sz = q[5] - q[2], cx = (q[0] + q[3]) / 2, cy = (q[1] + q[4]) / 2, cz = (q[2] + q[5]) / 2;
        for (let j = 0; j < 36; j++) { const o = i * 108 + j * 3; P[o] = bp[j * 3] * sx + cx; P[o + 1] = bp[j * 3 + 1] * sy + cy; P[o + 2] = bp[j * 3 + 2] * sz + cz; N[o] = bn[j * 3]; N[o + 1] = bn[j * 3 + 1]; N[o + 2] = bn[j * 3 + 2]; Cc[o] = tint.r; Cc[o + 1] = tint.g; Cc[o + 2] = tint.b; U[i * 72 + j * 2] = bu[j * 2]; U[i * 72 + j * 2 + 1] = bu[j * 2 + 1]; } });
      const ge = new T.BufferGeometry(); ge.setAttribute('position', new T.BufferAttribute(P, 3)); ge.setAttribute('normal', new T.BufferAttribute(N, 3)); ge.setAttribute('color', new T.BufferAttribute(Cc, 3)); ge.setAttribute('uv', new T.BufferAttribute(U, 2)); ge.computeBoundingSphere();
      const me = new T.Mesh(ge, m); me.castShadow = true; me.receiveShadow = true; sc.add(me);
    }
    BK.clear();
  }

  // ---------- ruas ----------
  const RW = C.RW, SW = C.SW, hw = RW / 2, Y = H + .05;
  const quads = { r: [], i: [] };
  // q: [x0,z0,x1,z1, alongZ]
  const xs = C.XL, zs = C.ZL;
  for (let xi = 0; xi < xs.length; xi++) for (let j = 0; j < zs.length - 1; j++) if (!(C.skipV && C.skipV[xi + '_' + j])) { const x = xs[xi]; quads.r.push([x - hw, zs[j] + hw, x + hw, zs[j + 1] - hw, 1]); }
  for (const z of zs) for (let i = 0; i < xs.length - 1; i++) quads.r.push([xs[i] + hw, z - hw, xs[i + 1] - hw, z + hw, 0]);
  for (const x of xs) for (const z of zs) quads.i.push([x - hw, z - hw, x + hw, z + hw, 0]);
  function roadMesh(list, mat) {
    const P = [], U = [], N = [];
    for (const [x0, z0, x1, z1, az] of list) {
      const len = az ? z1 - z0 : x1 - x0, v = len / RW;  // textura: 1 repetição = 8 m de rua
      const c = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
      const uv = az ? [[0, 0], [1, 0], [1, v], [0, v]] : [[0, 0], [0, v], [1, v], [1, 0]];
      for (const k of [0, 2, 1, 0, 3, 2]) { P.push(c[k][0], Y, c[k][1]); U.push(uv[k][0], uv[k][1]); N.push(0, 1, 0); }
      RDS.push([x0, z0, x1, z1]); floor(x0, z0, x1, z1, Y);
    }
    const ge = new T.BufferGeometry(); ge.setAttribute('position', new T.Float32BufferAttribute(P, 3)); ge.setAttribute('normal', new T.Float32BufferAttribute(N, 3)); ge.setAttribute('uv', new T.Float32BufferAttribute(U, 2)); ge.computeBoundingSphere();
    const me = new T.Mesh(ge, mat); me.receiveShadow = true; sc.add(me);
  }
  roadMesh(quads.r, MR); roadMesh(quads.i, MI);
  // faixas pintadas: borda branca contínua e faixa amarela tracejada no meio; terminam antes do cruzamento
  { const P = [], Cc = [], wht = lin(0xe6e6e0), yel = lin(0xe2b83c), YL = Y + .012;
    const strip = (x0, z0, x1, z1, c) => { const q = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]; for (const k of [0, 2, 1, 0, 3, 2]) { P.push(q[k][0], YL, q[k][1]); Cc.push(c.r, c.g, c.b); } };
    for (const [x0, z0, x1, z1, az] of quads.r) {
      const e = .35, lw = .14, gap = .6; // borda: 35 cm da beira; para 60 cm antes da esquina
      if (az) { strip(x0 + e, z0 + gap, x0 + e + lw, z1 - gap, wht); strip(x1 - e - lw, z0 + gap, x1 - e, z1 - gap, wht); const cx = (x0 + x1) / 2; for (let z = z0 + 2; z + 3 < z1 - 1; z += 6) strip(cx - .08, z, cx + .08, z + 3, yel); }
      else { strip(x0 + gap, z0 + e, x1 - gap, z0 + e + lw, wht); strip(x0 + gap, z1 - e - lw, x1 - gap, z1 - e, wht); const cz = (z0 + z1) / 2; for (let x = x0 + 2; x + 3 < x1 - 1; x += 6) strip(x, cz - .08, x + 3, cz + .08, yel); }
    }
    // faixa de pedestre na entrada de cada cruzamento
    for (const [x0, z0, x1, z1] of quads.i) { const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, xi = xs.findIndex(v => Math.abs(v - cx) < 1), zi = zs.findIndex(v => Math.abs(v - cz) < 1), sk = (a, b) => !!(C.skipV && C.skipV[a + '_' + b]), N_ = cz > zs[0] + 1 && !sk(xi, zi - 1), S_ = cz < zs[zs.length - 1] - 1 && !sk(xi, zi), W_ = cx > xs[0] + 1, E_ = cx < xs[xs.length - 1] - 1;
      for (let t = x0 + .5; t < x1 - .5; t += 1) { if (N_) strip(t, z0 - 2.2, t + .5, z0 - .4, wht); if (S_) strip(t, z1 + .4, t + .5, z1 + 2.2, wht); }
      for (let t = z0 + .5; t < z1 - .5; t += 1) { if (W_) strip(x0 - 2.2, t, x0 - .4, t + .5, wht); if (E_) strip(x1 + .4, t, x1 + 2.2, t + .5, wht); } }
    const ge = new T.BufferGeometry(); ge.setAttribute('position', new T.Float32BufferAttribute(P, 3)); ge.setAttribute('color', new T.Float32BufferAttribute(Cc, 3)); ge.computeVertexNormals(); ge.computeBoundingSphere();
    const me = new T.Mesh(ge, new T.MeshStandardMaterial({ vertexColors: true, roughness: .8, polygonOffset: true, polygonOffsetFactor: -2 })); me.receiveShadow = true; sc.add(me); }

  // ---------- calçadas (com meio-fio) em volta de cada quarteirão ----------
  const CH = .15, SY = H + CH;
  for (const b of C.blocks) {
    const x0 = b.x0 - SW, x1 = b.x1 + SW, z0 = b.z0 - SW, z1 = b.z1 + SW;
    for (const q of [[x0, z0, x1, b.z0], [x0, b.z1, x1, z1], [x0, b.z0, b.x0, b.z1], [b.x1, b.z0, x1, b.z1]]) { box(MS, q[0], H - .3, q[1], q[2], SY, q[3], 0xffffff); floor(q[0], q[1], q[2], q[3], SY); RDS.push(q); }
    // meio-fio (borda mais clara)
    box(MC, x0 - .02, SY - .02, z0 - .02, x1 + .02, SY + .01, z0 + .14, 0xd8d4cc); box(MC, x0 - .02, SY - .02, z1 - .14, x1 + .02, SY + .01, z1 + .02, 0xd8d4cc);
    box(MC, x0 - .02, SY - .02, z0, x0 + .14, SY + .01, z1, 0xd8d4cc); box(MC, x1 - .14, SY - .02, z0, x1 + .02, SY + .01, z1, 0xd8d4cc);
    if (b.heli) { box(MC, b.x0, H - .3, b.z0, b.x1, H + .1, b.z1, 0xb0aca4); floor(b.x0, b.z0, b.x1, b.z1, H + .1); RDS.push([b.x0, b.z0, b.x1, b.z1]); }
  }
  // postes de luz nas calçadas
  const lampAt = (x, z, ry) => { box(MM, x - .07, SY, z - .07, x + .07, SY + 6, z + .07, 0x3a3d42); const dx = Math.sin(ry) * 1.2, dz = Math.cos(ry) * 1.2; box(MM, Math.min(x, x + dx) - .05, SY + 5.9, Math.min(z, z + dz) - .05, Math.max(x, x + dx) + .05, SY + 6, Math.max(z, z + dz) + .05, 0x3a3d42); box(MM, x + dx - .25, SY + 5.75, z + dz - .15, x + dx + .25, SY + 5.9, z + dz + .15, 0xe8e2c8); col(x - .12, z - .12, x + .12, z + .12, SY - 1, SY + 6); LAMPS.push({ x: x + dx, y: SY + 5.7, z: z + dz }); };
  for (const b of C.blocks) {
    for (let x = b.x0 + 6; x < b.x1 - 3; x += 18) { lampAt(x, b.z0 - SW + .5, Math.PI); lampAt(x + 9, b.z1 + SW - .5, 0); }
    for (let z = b.z0 + 10; z < b.z1 - 3; z += 22) { lampAt(b.x0 - SW + .5, z, -Math.PI / 2); lampAt(b.x1 + SW - .5, z + 11, Math.PI / 2); }
  }

  // ---------- muretas (0,9 m: dá para pular por cima) ----------
  const WH = 1.1, WT = .24;
  function lowWall(x0, z0, x1, z1, brick) { // ao longo de x (z0==z1) ou de z (x0==x1)
    const ax = Math.abs(x1 - x0) > Math.abs(z1 - z0), a = ax ? Math.min(x0, x1) : Math.min(z0, z1), b = ax ? Math.max(x0, x1) : Math.max(z0, z1);
    if (b - a < .3) return;
    const X0 = ax ? a : x0 - WT / 2, X1 = ax ? b : x0 + WT / 2, Z0 = ax ? z0 - WT / 2 : a, Z1 = ax ? z0 + WT / 2 : b;
    box(brick ? MB : MC, X0, H, Z0, X1, H + WH, Z1, brick ? 0xffffff : 0xcfcac0); box(MC, X0 - .04, H + WH, Z0 - .04, X1 + .04, H + WH + .07, Z1 + .04, 0xbdb8ae);
    col(X0, Z0, X1, Z1, H - 1, H + WH + .07);
  }
  // parede com portão (abertura de ~3 m em "gx")
  function wallGate(x0, z0, x1, z1, gx, brick) {
    const ax = Math.abs(x1 - x0) > Math.abs(z1 - z0), g0 = gx - 1.6, g1 = gx + 1.6;
    if (ax) { lowWall(Math.min(x0, x1), z0, g0, z0, brick); lowWall(g1, z0, Math.max(x0, x1), z0, brick); }
    else { lowWall(x0, Math.min(z0, z1), x0, g0, brick); lowWall(x0, g1, x0, Math.max(z0, z1), brick); }
  }
  // parede com vários portões: gates = [[centro, meia largura], ...]
  function wallGates(x0, z, x1, gates, brick) { const gs = gates.slice().sort((a, b) => a[0] - b[0]); let u = x0; for (const [c, h] of gs) { lowWall(u, z, c - h, z, brick); u = c + h; } lowWall(u, z, x1, z, brick); }
  const rnd = C.rnd;
  // ---------- ESTÁDIO DE FUTEBOL (helicóptero no meio do campo) ----------
  const TXG = canvasT(256, 256, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#3f8a3a' : '#4a9a42'; g.fillRect(0, i * 32, w, 32); } noise(g, w, h, 9000, .08); });
  const MG = new T.MeshStandardMaterial({ map: TXG, roughness: .95 }), MSEAT = new T.MeshStandardMaterial({ vertexColors: true, roughness: .7 }), MW = new T.MeshStandardMaterial({ vertexColors: true, roughness: .6 });
  function stadium(b) {
    const SD = 7.2, NT = 9, TD = SD / NT, TH = .46, WT2 = .5, ENT = 5; // arquibancada: 9 degraus de 80 cm x 46 cm
    const ix0 = b.x0 + SD + WT2, ix1 = b.x1 - SD - WT2, iz0 = b.z0 + SD + WT2, iz1 = b.z1 - SD - WT2, cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2;
    // chão do estádio (pista de concreto) e gramado com listras
    box(MC, b.x0, H - .3, b.z0, b.x1, H + .06, b.z1, 0x9c958b); floor(b.x0, b.z0, b.x1, b.z1, H + .06); RDS.push([b.x0, b.z0, b.x1, b.z1]);
    { const pg = new T.Mesh(new T.PlaneGeometry(ix1 - ix0 - 2, iz1 - iz0 - 2), MG); pg.rotation.x = -Math.PI / 2; pg.position.set(cx, H + .075, cz); pg.receiveShadow = true; TXG.repeat.set((ix1 - ix0) / 16, 1); sc.add(pg); }
    // linhas do campo
    const PX0 = ix0 + 2.5, PX1 = ix1 - 2.5, PZ0 = iz0 + 2.5, PZ1 = iz1 - 2.5, LY = H + .085, lw = .12, ln = (x0, z0, x1, z1) => box(MW, x0, LY - .005, z0, x1, LY, z1, 0xf2f2ee);
    ln(PX0, PZ0, PX1, PZ0 + lw); ln(PX0, PZ1 - lw, PX1, PZ1); ln(PX0, PZ0, PX0 + lw, PZ1); ln(PX1 - lw, PZ0, PX1, PZ1); ln(cx - lw / 2, PZ0, cx + lw / 2, PZ1);
    for (let a = 0; a < 40; a++) { const t0 = a / 40 * Math.PI * 2, r = 5.5; ln(cx + Math.cos(t0) * r - .1, cz + Math.sin(t0) * r - .1, cx + Math.cos(t0) * r + .1, cz + Math.sin(t0) * r + .1); }
    const pa = (PZ1 - PZ0) * .55, pd = 9;
    for (const [sx, gx] of [[PX0, 1], [PX1, -1]]) { const a = Math.min(sx, sx + gx * pd), c = Math.max(sx, sx + gx * pd); ln(a, cz - pa / 2, c, cz - pa / 2 + lw); ln(a, cz + pa / 2 - lw, c, cz + pa / 2); ln(sx + gx * pd - lw / 2, cz - pa / 2, sx + gx * pd + lw / 2, cz + pa / 2);
      // gol: traves brancas e rede (grade fina)
      const gw = 3.66, gh = 2.44, gb = 1.6, bx0 = sx - gx * gb;
      for (const z of [cz - gw, cz + gw]) { box(MW, sx - .06, H, z - .06, sx + .06, H + gh, z + .06, 0xffffff); col(sx - .08, z - .08, sx + .08, z + .08, H - 1, H + gh); }
      box(MW, sx - .06, H + gh - .12, cz - gw, sx + .06, H + gh, cz + gw, 0xffffff);
      box(MM, Math.min(sx, bx0), H + gh - .04, cz - gw, Math.max(sx, bx0), H + gh, cz + gw, 0xdcdcdc); box(MM, bx0 - .02, H, cz - gw, bx0 + .02, H + gh, cz + gw, 0xdcdcdc); }
    // arquibancadas nos 4 lados (com entradas no meio de cada lado); degraus = pisos (dá para subir)
    const cols = [0x1f4fa0, 0xe8e8e8, 0xc23a2e];
    const side = (A0, A1, alongX, inner, dir) => { // dir: +1 a arquibancada cresce para +z/+x
      const mid = (A0 + A1) / 2, segs = [[A0, mid - ENT / 2], [mid + ENT / 2, A1]];
      for (const [a0, a1] of segs) for (let k = 0; k < NT; k++) {
        const f0 = inner + dir * k * TD, f1 = inner + dir * (k + 1) * TD, y1 = H + (k + 1) * TH, lo = Math.min(f0, f1), hi = Math.max(f0, f1);
        if (alongX) { box(MC, a0, H, lo, a1, y1 - .08, hi, 0xb8b2a7); box(MSEAT, a0, y1 - .08, lo, a1, y1, hi, cols[k % 3]); floor(a0, lo, a1, hi, y1); }
        else { box(MC, lo, H, a0, hi, y1 - .08, a1, 0xb8b2a7); box(MSEAT, lo, y1 - .08, a0, hi, y1, a1, cols[k % 3]); floor(lo, a0, hi, a1, y1); }
      }
      // paredes das entradas (túnel) e muro de trás
      for (const w of [mid - ENT / 2, mid + ENT / 2]) { const lo = Math.min(inner, inner + dir * SD), hi = Math.max(inner, inner + dir * SD);
        if (alongX) { box(MC, w - .2, H, lo, w + .2, H + NT * TH + 1, hi, 0xcfc9be); col(w - .2, lo, w + .2, hi, H - 1, H + NT * TH + 1); } else { box(MC, lo, H, w - .2, hi, H + NT * TH + 1, w + .2, 0xcfc9be); col(lo, w - .2, hi, w + .2, H - 1, H + NT * TH + 1); } }
      const ob = inner + dir * SD, o0 = Math.min(ob, ob + dir * WT2), o1 = Math.max(ob, ob + dir * WT2), HH = NT * TH + 3.2;
      for (const [a0, a1] of segs) { if (alongX) { box(MC, a0, H, o0, a1, H + HH, o1, 0xd6d0c4); col(a0, o0, a1, o1, H - 1, H + HH); } else { box(MC, o0, H, a0, o1, H + HH, a1, 0xd6d0c4); col(o0, a0, o1, a1, H - 1, H + HH); } }
      // portão da entrada: verga em cima
      if (alongX) box(MC, mid - ENT / 2, H + 3.2, o0, mid + ENT / 2, H + HH, o1, 0xd6d0c4); else box(MC, o0, H + 3.2, mid - ENT / 2, o1, H + HH, mid + ENT / 2, 0xd6d0c4);
      // proteção na frente da arquibancada (mureta de 1,1 m: dá para pular com a animação)
      const fl = inner - dir * .15; if (alongX) for (const [a0, a1] of segs) { box(MC, a0, H, Math.min(fl, inner), a1, H + 1.1, Math.max(fl, inner), 0xe0dbd0); col(a0, Math.min(fl, inner), a1, Math.max(fl, inner), H - 1, H + 1.1); }
      else for (const [a0, a1] of segs) { box(MC, Math.min(fl, inner), H, a0, Math.max(fl, inner), H + 1.1, a1, 0xe0dbd0); col(Math.min(fl, inner), a0, Math.max(fl, inner), a1, H - 1, H + 1.1); }
    };
    side(b.x0 + SD + WT2, b.x1 - SD - WT2, true, iz0, -1); side(b.x0 + SD + WT2, b.x1 - SD - WT2, true, iz1, 1);
    side(iz0, iz1, false, ix0, -1); side(iz0, iz1, false, ix1, 1);
    // cantos: blocos cheios até o muro de fora
    for (const [x0, x1] of [[b.x0, ix0], [ix1, b.x1]]) for (const [z0, z1] of [[b.z0, iz0], [iz1, b.z1]]) { box(MC, x0, H, z0, x1, H + NT * TH + 3.2, z1, 0xd6d0c4); col(x0, z0, x1, z1, H - 1, H + NT * TH + 3.2); floor(x0, z0, x1, z1, H + NT * TH + 3.2); }
    // torres de iluminação nos cantos
    for (const [x, z] of [[b.x0 + 2, b.z0 + 2], [b.x1 - 2, b.z0 + 2], [b.x0 + 2, b.z1 - 2], [b.x1 - 2, b.z1 - 2]]) { const y0 = H + NT * TH + 3.2; box(MM, x - .3, y0, z - .3, x + .3, y0 + 18, z + .3, 0x7d8186); box(MM, x - 2, y0 + 18, z - .4, x + 2, y0 + 20.4, z + .4, 0x55595e); box(MW, x - 1.8, y0 + 18.2, z - .45, x + 1.8, y0 + 20.2, z - .4, 0xfff6d8); LAMPS.push({ x, y: y0 + 19, z }); }
    // letreiro
    box(MW, cx - 8, H + NT * TH + 3.4, b.z1 - .1, cx + 8, H + NT * TH + 5.2, b.z1 + .05, 0x1d3f7a);
  }
  // GARAGEM aberta (estilo battle royale): 3 paredes, laje, porta de enrolar levantada, piso de concreto
  const GAR = [];
  // chapa ondulada da porta de enrolar (listras horizontais)
  const GDM = new T.MeshStandardMaterial({ vertexColors: true, metalness: .5, roughness: .45, map: canvasT(64, 64, (g, w, h) => { for (let y = 0; y < h; y += 8) { const gr = g.createLinearGradient(0, y, 0, y + 8); gr.addColorStop(0, '#8d9196'); gr.addColorStop(.5, '#c3c6ca'); gr.addColorStop(1, '#6d7175'); g.fillStyle = gr; g.fillRect(0, y, w, 8); } }) });
  function garage(G, brick) {
    const hw = G.w / 2, hd = G.d / 2, x0 = G.x - hw, x1 = G.x + hw, z0 = G.z - hd, z1 = G.z + hd, t = .2, Hh = 2.9, op = G.rot ? -1 : 1; // op: lado aberto (+z ou -z)
    const zb = op > 0 ? z0 : z1, zf = op > 0 ? z1 : z0, WM = brick ? MB : MC, wc = brick ? 0xffffff : 0xbdb7ab;
    box(MC, x0, H - .2, z0, x1, H + .06, z1, 0x9e9a92); floor(x0, z0, x1, z1, H + .06);
    for (const [a, b] of [[x0, x0 + t], [x1 - t, x1]]) { box(WM, a, H, z0, b, H + Hh, z1, wc); col(a, z0, b, z1, H - 1, H + Hh); }
    box(WM, x0, H, Math.min(zb, zb + op * t), x1, H + Hh, Math.max(zb, zb + op * t), wc); col(x0, Math.min(zb, zb + op * t), x1, Math.max(zb, zb + op * t), H - 1, H + Hh);
    // laje (dá para ficar em cima) e verga sobre a abertura
    box(MC, x0 - .15, H + Hh, z0 - .15, x1 + .15, H + Hh + .2, z1 + .15, 0xc9c5bd); floor(x0 - .15, z0 - .15, x1 + .15, z1 + .15, H + Hh + .2);
    box(WM, x0, H + 2.45, Math.min(zf, zf - op * t), x1, H + Hh, Math.max(zf, zf - op * t), wc);
    // porta de enrolar levantada: rolo de chapa, guias laterais e a chapa ondulada aparecendo embaixo do rolo
    const zr = zf - op * .3; box(MM, x0 + t, H + 2.12, zr - .2, x1 - t, H + 2.45, zr + .2, 0x9a9da1); box(GDM, x0 + t + .02, H + 1.95, zr - .015, x1 - t - .02, H + 2.12, zr + .015, 0xffffff);
    for (const gx of [x0 + t, x1 - t - .06]) box(MM, gx, H, zf - op * .3 - .03, gx + .06, H + 2.45, zf - op * .3 + .03, 0x55585c);
    // lâmpada e área (câmera não atravessa as paredes; grama não nasce dentro)
    LAMPS.push({ x: G.x, y: H + 2.6, z: G.z }); FP.push({ x0, x1, z0, z1 }); (window.DZCEIL || []).push({ x0, x1, z0, z1, y: H + Hh - .01 });
    GAR.push(G);
  }
  for (const b of C.blocks) if (b.stadium) stadium(b);
  for (const L of C.lots) {
    const m = .5, x0 = L.x0 + (L.eL ? m : 0), x1 = L.x1 - (L.eR ? m : 0), z0 = L.z0 + m, z1 = L.z1 - m, front = L.rot ? z0 : z1, back = L.rot ? z1 : z0, brick = rnd() < .5;
    const sides = () => { if (L.eL) wallGate(x0, z0, x0, z1, (z0 + z1) / 2 + (L.rot ? 3 : -3), brick); if (L.eR) wallGate(x1, z0, x1, z1, (z0 + z1) / 2 + (L.rot ? -3 : 3), brick); };
    const cx = (L.x0 + L.x1) / 2;
    if (L.kind === 'str') {
      wallGate(x0, front, x1, front, cx, brick);
      lowWall(x0, back, x1, back, brick);
      sides();
      // caminho de concreto do portão até a porta
      if (L.S) { const S = L.S, dz0 = L.rot ? L.z0 : S.z + S.d / 2 + 1.2, dz1 = L.rot ? S.z - S.d / 2 - 1.2 : L.z1; box(MC, cx - 1.1, H - .2, Math.min(dz0, dz1), cx + 1.1, H + .06, Math.max(dz0, dz1), 0xb5b1a8); floor(cx - 1.1, Math.min(dz0, dz1), cx + 1.1, Math.max(dz0, dz1), H + .06); RDS.push([cx - 1.1, Math.min(dz0, dz1), cx + 1.1, Math.max(dz0, dz1)]); }
    } else if (L.kind === 'home') {
      const S = L.S, G = L.G, gwH = G.w / 2;
      wallGates(x0, front, x1, [[S.x, 1.6], [G.x, gwH + .3]], brick); lowWall(x0, back, x1, back, brick); sides();
      // caminho até a porta da casa e entrada de carro até a garagem
      const fz = L.rot ? G.z - G.d / 2 : G.z + G.d / 2, dz0 = L.rot ? L.z0 : S.z + S.d / 2 + 1.2, dz1 = L.rot ? S.z - S.d / 2 - 1.2 : L.z1;
      box(MC, S.x - 1.1, H - .2, Math.min(dz0, dz1), S.x + 1.1, H + .06, Math.max(dz0, dz1), 0xb5b1a8); floor(S.x - 1.1, Math.min(dz0, dz1), S.x + 1.1, Math.max(dz0, dz1), H + .06); RDS.push([S.x - 1.1, Math.min(dz0, dz1), S.x + 1.1, Math.max(dz0, dz1)]);
      const ez0 = L.rot ? L.z0 : fz, ez1 = L.rot ? fz : L.z1; box(MC, G.x - gwH, H - .2, Math.min(ez0, ez1), G.x + gwH, H + .06, Math.max(ez0, ez1), 0xaaa69d); floor(G.x - gwH, Math.min(ez0, ez1), G.x + gwH, Math.max(ez0, ez1), H + .06); RDS.push([G.x - gwH, Math.min(ez0, ez1), G.x + gwH, Math.max(ez0, ez1)]);
      garage(G, brick);
    } else if (L.kind === 'plaza') {
      // praça de concreto com muretas e blocos para se proteger
      box(MS, L.x0 + .3, H - .2, L.z0 + .3, L.x1 - .3, H + .08, L.z1 - .3, 0xd9d5cc); floor(L.x0 + .3, L.z0 + .3, L.x1 - .3, L.z1 - .3, H + .08); RDS.push([L.x0 + .3, L.z0 + .3, L.x1 - .3, L.z1 - .3]);
      const mx = (L.x0 + L.x1) / 2, mz = (L.z0 + L.z1) / 2;
      lowWall(mx - 5, mz - 4, mx - 1, mz - 4, 0); lowWall(mx + 1, mz + 4, mx + 5, mz + 4, 0); lowWall(mx - 6, mz + 1, mx - 6, mz + 5, 1); lowWall(mx + 6, mz - 5, mx + 6, mz - 1, 1);
      for (const [bx, bz] of [[mx - 2.5, mz + 1], [mx + 2.5, mz - 1.5]]) { box(MC, bx - .6, H, bz - .6, bx + .6, H + 1.1, bz + .6, 0xc2bdb3); col(bx - .6, bz - .6, bx + .6, bz + .6, H - 1, H + 1.1); }
    }
  }
  flushBoxes();

  // de longe some o interior dos prédios (portas internas)
  { const L_ = (window.DZSTR || []).filter(S => S.inner);
    const chk = () => { const px = cam.position.x, pz = cam.position.z; for (const S of L_) { const v = Math.abs(S.x - px) < 45 && Math.abs(S.z - pz) < 45; if (S.inner.visible !== v) S.inner.visible = v; } };
    chk(); setInterval(chk, 400); }
  // buggies: tira os que nasceram dentro da cidade (dentro de casa, na frente de porta) e deixa só 3 estacionados
  // na faixa da rua, longe das portas
  try {
    for (let i = CARS.length - 1; i >= 0; i--) { const c = CARS[i]; if (c.heli) continue; if (c.x > C.x0 - 4 && c.x < C.x1 + 4 && c.z > C.z0 - 4 && c.z < C.z1 + 4) { sc.remove(c.g); CARS.splice(i, 1); } }
    if (typeof addCar === 'function') for (const [x, z, r] of [[C.XL[1] + 2, (C.ZL[1] + C.ZL[2]) / 2 + 3, 0], [C.XL[3] - 2, (C.ZL[0] + C.ZL[1]) / 2 - 3, Math.PI], [(C.XL[1] + C.XL[2]) / 2 + 3, C.ZL[2] + 2, Math.PI / 2]]) addCar(x, z, r);
    // um buggy dentro de cada garagem, de frente para a rua (addCar recusa ponto dentro de construção: põe direto)
    for (const G of GAR) { const keep = FP.splice(0); try { addCar(G.x, G.z + (G.rot ? 1 : -1) * .4, G.rot ? Math.PI : 0); } finally { FP.push(...keep); } }
  } catch (e) { console.warn('cidade: buggies', e); }
})();
