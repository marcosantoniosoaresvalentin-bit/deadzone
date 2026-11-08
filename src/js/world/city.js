/* Deadzone · world/city.js
 * Monta a CIDADE descrita em world/map.js (CITY):
 *  - ruas de asfalto com faixa tracejada, cruzamentos, calçadas com meio-fio;
 *  - muretas em volta dos lotes (dá para pular por cima) e praças com muretas/blocos de concreto (cobertura);
 *  - postes de luz;
 *  - móveis dentro dos prédios com interior (cama, sofá, mesa, escrivaninha, cadeira) — aparecem só de perto.
 * Modelos prontos (CC0, Microsoft Remix 3D via Ethereal Engine Open Asset Kit): móveis.
 */
(function () {
  if (typeof TOWNS === 'undefined') return;
  const FLR = window.DZFLR; let H = 0; // H: altura do chão do lugar que está sendo montado (cada cidade/local tem a sua)
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

  // GAR: garagens (cada uma ganha um buggy no fim)
  const GAR = [];
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
  // ======================= CIDADE (Porto Velho, Vila Serena, Monte Verde...) =======================
  function buildTown(C) {
  H = C.h != null ? C.h : TERH(C.x, C.z);
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
  }
  // ======================= LOCAIS ESPECIAIS: base militar, escola, porto, galpões =======================
  // chapa ondulada (barracões, contêineres), alambrado (vazado), madeira (píer, caixotes)
  const TXCOR = canvasT(128, 128, (g, w, h) => { for (let x = 0; x < w; x += 8) { const gr = g.createLinearGradient(x, 0, x + 8, 0); gr.addColorStop(0, '#7d8186'); gr.addColorStop(.5, '#c4c7cb'); gr.addColorStop(1, '#6a6e73'); g.fillStyle = gr; g.fillRect(x, 0, 8, h); } noise(g, w, h, 1500, .1); for (let i = 0; i < 10; i++) { g.fillStyle = 'rgba(110,60,30,' + (.05 + Math.random() * .1) + ')'; g.fillRect(Math.random() * w, Math.random() * h, 4 + Math.random() * 10, 10 + Math.random() * 40); } });
  const TXFEN = canvasT(64, 64, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(170,175,180,1)'; g.lineWidth = 2; for (let i = -64; i < 128; i += 12) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 64, 64); g.stroke(); g.beginPath(); g.moveTo(i + 64, 0); g.lineTo(i, 64); g.stroke(); } });
  const TXWD = canvasT(128, 128, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = 'hsl(' + (26 + Math.random() * 8) + ',' + (25 + Math.random() * 15) + '%,' + (30 + Math.random() * 12) + '%)'; g.fillRect(0, i * 16, w, 15); g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(0, i * 16 + 15, w, 1); } noise(g, w, h, 3000, .1); });
  const MCOR = triMat(TXCOR, .5), MWD = triMat(TXWD, .6);
  const MFEN = triMat(TXFEN, .9); MCOR.side = T.DoubleSide; MFEN.alphaTest = .5; MFEN.side = T.DoubleSide; MFEN.metalness = .6;
  const MPLAIN = new T.MeshStandardMaterial({ vertexColors: true, roughness: .8 });
  // caixa em coordenadas locais (rot só em múltiplos de 90°) -> mundo
  const L2W = (cx, cz, r, lx, lz) => { const c = Math.round(Math.cos(r)), s = Math.round(Math.sin(r)); return [cx + lx * c + lz * s, cz - lx * s + lz * c]; };
  const lbox = (m, cx, cz, r, x0, y0, z0, x1, y1, z1, cl) => { const a = L2W(cx, cz, r, x0, z0), b = L2W(cx, cz, r, x1, z1); box(m, Math.min(a[0], b[0]), y0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y1, Math.max(a[1], b[1]), cl); };
  const lcol = (cx, cz, r, x0, z0, x1, z1, yb, yt) => { const a = L2W(cx, cz, r, x0, z0), b = L2W(cx, cz, r, x1, z1); return col(a[0], a[1], b[0], b[1], yb, yt); };
  const lfloor = (cx, cz, r, x0, z0, x1, z1, y) => { const a = L2W(cx, cz, r, x0, z0), b = L2W(cx, cz, r, x1, z1); floor(Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1]), y); };
  const pad = (x0, z0, x1, z1, cl, m) => { box(m || MC, x0, H - .25, z0, x1, H + .05, z1, cl == null ? 0xaaa59c : cl); floor(x0, z0, x1, z1, H + .05); RDS.push([x0, z0, x1, z1]); };
  // malha solta (telhado inclinado, triângulo da empena, arco do hangar): vai direto para a cena
  const loose = (geo, m, cl) => { const n = geo.attributes.position.count, cc = new Float32Array(n * 3), t = new T.Color(cl == null ? 0xffffff : cl).convertSRGBToLinear(); for (let i = 0; i < n; i++) { cc[i * 3] = t.r; cc[i * 3 + 1] = t.g; cc[i * 3 + 2] = t.b; } geo.setAttribute('color', new T.BufferAttribute(cc, 3)); const me = new T.Mesh(geo, m); me.castShadow = me.receiveShadow = true; sc.add(me); return me; };

  // ALAMBRADO (2,6 m) com postes e arame farpado; gates: [[centro, meia largura]]
  function fence(x0, z0, x1, z1, gates) {
    const ax = Math.abs(x1 - x0) > Math.abs(z1 - z0), a = ax ? Math.min(x0, x1) : Math.min(z0, z1), b = ax ? Math.max(x0, x1) : Math.max(z0, z1), f = ax ? z0 : x0, FH_ = 2.6;
    const segs = []; let u = a; for (const [c, hw] of (gates || []).slice().sort((p, q) => p[0] - q[0])) { if (c - hw > u) segs.push([u, c - hw]); u = c + hw; } if (b > u) segs.push([u, b]);
    for (const [s0, s1] of segs) {
      if (ax) { box(MFEN, s0, H, f - .01, s1, H + FH_, f + .01); col(s0, f - .06, s1, f + .06, H - 1, H + FH_); } else { box(MFEN, f - .01, H, s0, f + .01, H + FH_, s1); col(f - .06, s0, f + .06, s1, H - 1, H + FH_); }
      for (let t = s0; t <= s1 + .01; t += 3) ax ? box(MM, t - .04, H, f - .04, t + .04, H + FH_ + .35, f + .04, 0x6a6e72) : box(MM, f - .04, H, t - .04, f + .04, H + FH_ + .35, t + .04, 0x6a6e72);
      for (const yy of [FH_ + .15, FH_ + .32]) ax ? box(MM, s0, H + yy, f - .01, s1, H + yy + .02, f + .01, 0x55595d) : box(MM, f - .01, H + yy, s0, f + .01, H + yy + .02, s1, 0x55595d);
      ax ? box(MM, s0, H + FH_ - .04, f - .03, s1, H + FH_, f + .03, 0x6a6e72) : box(MM, f - .03, H + FH_ - .04, s0, f + .03, H + FH_, s1, 0x6a6e72);
    }
  }
  // BARRACÃO (galpão de chapa) com portão grande aberto na frente, porta nos fundos, telhado de 2 águas
  function shed(cx, cz, r, w, d, o) {
    o = o || {}; const hw = w / 2, hd = d / 2, WH_ = o.h || 6, t = .2, dw = Math.min(w - 3, o.door || 7), dh = 4.6, cl = o.color == null ? 0xd0d3d6 : o.color;
    pad(...(() => { const a = L2W(cx, cz, r, -hw, -hd), b = L2W(cx, cz, r, hw, hd); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; })(), 0x8f8a82);
    // paredes laterais e fundo (com porta pequena)
    for (const sx of [-1, 1]) { lbox(MCOR, cx, cz, r, sx * hw - t / 2, H, -hd, sx * hw + t / 2, H + WH_, hd, cl); lcol(cx, cz, r, sx * hw - t / 2, -hd, sx * hw + t / 2, hd, H - 1, H + WH_); }
    lbox(MCOR, cx, cz, r, -hw, H, -hd - t / 2, -.7, H + WH_, -hd + t / 2, cl); lbox(MCOR, cx, cz, r, .7, H, -hd - t / 2, hw, H + WH_, -hd + t / 2, cl); lbox(MCOR, cx, cz, r, -.7, H + 2.2, -hd - t / 2, .7, H + WH_, -hd + t / 2, cl);
    lcol(cx, cz, r, -hw, -hd - t / 2, -.7, -hd + t / 2, H - 1, H + WH_); lcol(cx, cz, r, .7, -hd - t / 2, hw, -hd + t / 2, H - 1, H + WH_);
    // frente: portão grande (porta de enrolar levantada)
    lbox(MCOR, cx, cz, r, -hw, H, hd - t / 2, -dw / 2, H + WH_, hd + t / 2, cl); lbox(MCOR, cx, cz, r, dw / 2, H, hd - t / 2, hw, H + WH_, hd + t / 2, cl); lbox(MCOR, cx, cz, r, -dw / 2, H + dh, hd - t / 2, dw / 2, H + WH_, hd + t / 2, cl);
    lcol(cx, cz, r, -hw, hd - t / 2, -dw / 2, hd + t / 2, H - 1, H + WH_); lcol(cx, cz, r, dw / 2, hd - t / 2, hw, hd + t / 2, H - 1, H + WH_);
    lbox(MM, cx, cz, r, -dw / 2, H + dh - .5, hd - .55, dw / 2, H + dh, hd - .15, 0x8a8e93); lbox(MCOR, cx, cz, r, -dw / 2 + .05, H + dh - .7, hd - .37, dw / 2 - .05, H + dh - .5, hd - .33);
    // telhado de 2 águas (cumeeira ao longo da profundidade) e empenas
    const rh = w * .18, a = Math.atan(rh / hw), Lr = (hw + .4) / Math.cos(a);
    for (const sg of [-1, 1]) { const ge = new T.BoxGeometry(Lr, .1, d + .6); ge.rotateZ(sg * -a); ge.translate(sg * (hw + .4) / 2, H + WH_ + rh / 2 - .05 + .02, 0); ge.rotateY(r); ge.translate(cx, 0, cz); loose(ge.toNonIndexed(), MCOR, o.roof == null ? 0x9aa0a6 : o.roof); }
    for (const sz of [-hd, hd]) { const sh = new T.Shape(); sh.moveTo(-hw, 0); sh.lineTo(hw, 0); sh.lineTo(0, rh); sh.lineTo(-hw, 0); const ge = new T.ShapeGeometry(sh); ge.translate(0, H + WH_, sz); ge.rotateY(r); ge.translate(cx, 0, cz); const me = loose(ge.toNonIndexed(), MCOR, cl); me.material = MCOR; }
    if (!MCOR.side || MCOR.side !== T.DoubleSide) MCOR.side = T.DoubleSide;
    // dentro: caixotes e paletes (cobertura; dá para pular os baixos)
    const cr = o.crates == null ? 4 : o.crates;
    for (let i = 0; i < cr; i++) { const lx = (i % 2 ? 1 : -1) * (hw - 1.6), lz = -hd + 2 + i * (d - 4) / Math.max(1, cr - 1) * .5, s_ = i % 3 === 0 ? 1.4 : 1.0; lbox(MWD, cx, cz, r, lx - s_ / 2, H, lz - s_ / 2, lx + s_ / 2, H + s_, lz + s_ / 2, 0xffffff); lcol(cx, cz, r, lx - s_ / 2, lz - s_ / 2, lx + s_ / 2, lz + s_ / 2, H - 1, H + s_); }
    const a_ = L2W(cx, cz, r, -hw, -hd), b_ = L2W(cx, cz, r, hw, hd), fp = { x0: Math.min(a_[0], b_[0]), x1: Math.max(a_[0], b_[0]), z0: Math.min(a_[1], b_[1]), z1: Math.max(a_[1], b_[1]) };
    FP.push(fp); (window.DZCEIL || []).push(Object.assign({ y: H + WH_ - .05 }, fp)); LAMPS.push({ x: cx, y: H + WH_ - .5, z: cz });
  }
  // HANGAR: teto em arco, frente aberta
  function hangar(cx, cz, r, w, d) {
    const hw = w / 2, hd = d / 2, R_ = hw, sp = 2.2;
    pad(...(() => { const a = L2W(cx, cz, r, -hw, -hd), b = L2W(cx, cz, r, hw, hd); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; })(), 0x8a867f);
    for (const sx of [-1, 1]) { lbox(MC, cx, cz, r, sx * hw - .25, H, -hd, sx * hw + .25, H + sp, hd, 0xb7b39f); lcol(cx, cz, r, sx * hw - .25, -hd, sx * hw + .25, hd, H - 1, H + sp + 3); lcol(cx, cz, r, sx * (hw - 1.1), -hd, sx * hw, hd, H + 1.8, H + sp + 6); }
    const ge = new T.CylinderGeometry(R_, R_, d, 20, 1, true, Math.PI / 2, Math.PI); ge.rotateX(Math.PI / 2); ge.translate(0, H + sp, 0); ge.rotateY(r); ge.translate(cx, 0, cz); const me = loose(ge.toNonIndexed(), MCOR, 0x7f8a6a); me.material = MCOR;
    // fundo fechado (meio círculo) e parede de trás
    const sh = new T.Shape(); sh.absarc(0, 0, R_, 0, Math.PI, false); sh.lineTo(-R_, 0); const g2 = new T.ShapeGeometry(sh, 16); g2.translate(0, H + sp, -hd); g2.rotateY(r); g2.translate(cx, 0, cz); loose(g2.toNonIndexed(), MCOR, 0x6f7a5c).material = MCOR;
    lbox(MC, cx, cz, r, -hw, H, -hd - .25, hw, H + sp, -hd + .05, 0xb7b39f); lcol(cx, cz, r, -hw, -hd - .25, hw, -hd + .05, H - 1, H + sp + R_);
    const a_ = L2W(cx, cz, r, -hw, -hd), b_ = L2W(cx, cz, r, hw, hd), fp = { x0: Math.min(a_[0], b_[0]), x1: Math.max(a_[0], b_[0]), z0: Math.min(a_[1], b_[1]), z1: Math.max(a_[1], b_[1]) };
    FP.push(fp); (window.DZCEIL || []).push(Object.assign({ y: H + sp + R_ * .8 }, fp)); LAMPS.push({ x: cx, y: H + sp + R_ - 1, z: cz });
  }
  // CONTÊINER (6,1 x 2,6 x 2,44) — cobertura; empilha com lv
  function container(x, z, alongX, cl, lv) {
    const L = 6.06, W = 2.44, Hc = 2.6, y0 = H + (lv || 0) * Hc, hx = alongX ? L / 2 : W / 2, hz = alongX ? W / 2 : L / 2;
    box(MCOR, x - hx, y0, z - hz, x + hx, y0 + Hc, z + hz, cl); box(MM, x - hx - .03, y0 + Hc - .08, z - hz - .03, x + hx + .03, y0 + Hc, z + hz + .03, 0x3c3f42);
    col(x - hx, z - hz, x + hx, z + hz, y0 - (lv ? 0 : 1), y0 + Hc); floor(x - hx, z - hz, x + hx, z + hz, y0 + Hc);
  }
  // TORRE DE VIGIA: plataforma a 5 m com guarda-corpo, telhado e escada (rampa)
  function tower(x, z, r) {
    const P_ = 5, s = 1.6;
    for (const [lx, lz] of [[-s, -s], [s, -s], [-s, s], [s, s]]) { lbox(MWD, x, z, r, lx - .12, H, lz - .12, lx + .12, H + P_ + 2.6, lz + .12, 0x9a7a55); lcol(x, z, r, lx - .14, lz - .14, lx + .14, lz + .14, H - 1, H + P_ + 2.6); }
    lbox(MWD, x, z, r, -s - .2, H + P_ - .15, -s - .2, s + .2, H + P_, s + .2, 0xb08a60); lfloor(x, z, r, -s - .2, -s - .2, s + .2, s + .2, H + P_);
    // guarda-corpo (com abertura onde a escada chega: lado +z local)
    for (const q of [[-s - .2, -s - .2, s + .2, -s - .1], [-s - .2, -s - .2, -s - .1, s + .2], [s + .1, -s - .2, s + .2, s + .2], [-s - .2, s + .1, -.1, s + .2]]) { lbox(MWD, x, z, r, q[0], H + P_, q[1], q[2], H + P_ + 1.05, q[3], 0x9a7a55); lcol(x, z, r, q[0], q[1], q[2], q[3], H + P_, H + P_ + 1.05); }
    lbox(MCOR, x, z, r, -s - .5, H + P_ + 2.6, -s - .5, s + .5, H + P_ + 2.75, s + .5, 0x6f7a5c);
    // escada: rampa de 8 m saindo do lado +z (degraus de madeira)
    const L = 8, n = 14, w = 1.0, x0_ = .5 - w, x1_ = .5;
    for (let i = 0; i < n; i++) { const z0_ = s + .2 + L - (i + 1) * L / n, y1 = H + (i + 1) * P_ / n; lbox(MWD, x, z, r, x0_, y1 - .08, z0_, x1_, y1, z0_ + L / n, 0xa98256); }
    for (const sx of [x0_, x1_]) lbox(MWD, x, z, r, sx - .05, H, s + .2, sx + .05, H + .1, s + .2 + L, 0x7d6040);
    { const a = L2W(x, z, r, x0_, s + .2), b = L2W(x, z, r, x1_, s + .2 + L), rr = { x0: Math.min(a[0], b[0]), x1: Math.max(a[0], b[0]), z0: Math.min(a[1], b[1]), z1: Math.max(a[1], b[1]), y0: H + P_, y1: H }; const e0 = L2W(x, z, r, 0, s + .2), e1 = L2W(x, z, r, 0, s + .2 + L);
      if (Math.abs(e1[0] - e0[0]) > Math.abs(e1[1] - e0[1])) { rr.ax = 'x'; rr.a0 = e0[0]; rr.a1 = e1[0]; } else { rr.ax = 'z'; rr.a0 = e0[1]; rr.a1 = e1[1]; } if (FLR && FLR.add) FLR.add(rr); }
    LAMPS.push({ x, y: H + P_ + 2.2, z });
  }
  // GUARITA: cabine 2,8 x 2,8 com porta, janelas e telhado
  function booth(x, z, r) {
    const s = 1.4, Hb = 2.7, t = .15, cl = 0xd9d4c4;
    lbox(MC, x, z, r, -s, H, -s, s, H + .05, s, 0x9b968c); lfloor(x, z, r, -s, -s, s, s, H + .05);
    // fundo e lados com janelas (vão de 1 a 2,1 m); frente com porta
    const wallP = (x0, z0, x1, z1) => { lbox(MC, x, z, r, x0, H, z0, x1, H + 1, z1, cl); lbox(MC, x, z, r, x0, H + 2.1, z0, x1, H + Hb, z1, cl); lcol(x, z, r, x0, z0, x1, z1, H - 1, H + 1); const lb = lcol(x, z, r, x0, z0, x1, z1, H + 2.1, H + Hb); if (lb) lb.lint = 1; };
    wallP(-s, -s, s, -s + t); wallP(-s, -s, -s + t, s); wallP(s - t, -s, s, s);
    for (const q of [[-s, s - t, -.5, s], [.5, s - t, s, s]]) { lbox(MC, x, z, r, q[0], H, q[1], q[2], H + Hb, q[3], cl); lcol(x, z, r, q[0], q[1], q[2], q[3], H - 1, H + Hb); }
    lbox(MC, x, z, r, -.5, H + 2.15, s - t, .5, H + Hb, s, cl);
    for (const q of [[-s, -s, -s + .04, s], [s - .04, -s, s, s], [-s, -s, s, -s + .04]]) lbox(MM, x, z, r, q[0], H + 1, q[1], q[2], H + 1.05, q[3], 0x2b2d30);
    lbox(MC, x, z, r, -s - .25, H + Hb, -s - .25, s + .25, H + Hb + .18, s + .25, 0xa8a398);
    LAMPS.push({ x, y: H + 2.4, z });
  }
  // CANCELA (listrada) na entrada
  function barrier(x0, z, x1) { box(MPLAIN, x0 - .15, H, z - .15, x0 + .15, H + 1.1, z + .15, 0xd8d2c0); for (let x = x0 + .15, i = 0; x < x1; x += .6, i++) box(MPLAIN, x, H + .95, z - .05, Math.min(x1, x + .6), H + 1.05, z + .05, i % 2 ? 0xffffff : 0xc0302a); }
  // SACOS DE AREIA (mureta 1,05 m: dá para pular)
  function sandbags(x0, z0, x1, z1) { const ax = Math.abs(x1 - x0) > Math.abs(z1 - z0), a = ax ? Math.min(x0, x1) : Math.min(z0, z1), b = ax ? Math.max(x0, x1) : Math.max(z0, z1);
    for (let k = 0; k < 3; k++) { const y0 = H + k * .35, o = (k % 2) * .25; for (let u = a + o; u < b - .2; u += .5) ax ? box(MC, u, y0, z0 - .32, Math.min(b, u + .48), y0 + .34, z0 + .32, 0x9c8e62) : box(MC, x0 - .32, y0, u, x0 + .32, y0 + .34, Math.min(b, u + .48), 0x9c8e62); }
    ax ? col(a, z0 - .32, b, z0 + .32, H - 1, H + 1.05) : col(x0 - .32, a, x0 + .32, b, H - 1, H + 1.05); }
  // TANQUE de combustível
  function tank(x, z, rr, hh, cl) { const ge = new T.CylinderGeometry(rr, rr, hh, 18); ge.translate(x, H + hh / 2, z); loose(ge.toNonIndexed(), MM, cl == null ? 0xc9ccd0 : cl).material = MM; col(x - rr * .9, z - rr * .9, x + rr * .9, z + rr * .9, H - 1, H + hh); }
  // GUINDASTE de pórtico (porto)
  function crane(x0, z0, x1, z1, hh) { for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) { box(MPLAIN, x - .45, H, z - .45, x + .45, H + hh, z + .45, 0xd8a21c); col(x - .5, z - .5, x + .5, z + .5, H - 1, H + hh); }
    for (const z of [z0, z1]) box(MPLAIN, x0 - .45, H + hh - 1, z - .5, x1 + .45, H + hh, z + .5, 0xd8a21c);
    box(MPLAIN, x0 - 2, H + hh, (z0 + z1) / 2 - .6, x1 + 2, H + hh + 1, (z0 + z1) / 2 + .6, 0xc79416); box(MPLAIN, (x0 + x1) / 2 - 1.3, H + hh - 2.6, z0 + .6, (x0 + x1) / 2 + 1.3, H + hh - 1, z0 + 3, 0x30353a);
    box(MM, (x0 + x1) / 2 - .03, H + 3.5, (z0 + z1) / 2 - .03, (x0 + x1) / 2 + .03, H + hh, (z0 + z1) / 2 + .03, 0x222222); }
  // PLACA com texto
  function sign(x, y, z, w, h, txt, alongX, bg) {
    const c = document.createElement('canvas'); c.width = 512; c.height = Math.round(512 * h / w); const g = c.getContext('2d'); g.fillStyle = bg || '#1d3f7a'; g.fillRect(0, 0, c.width, c.height); g.fillStyle = '#fff'; g.font = 'bold ' + Math.round(c.height * .55) + 'px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, c.width / 2, c.height / 2 + 2);
    const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; const me = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshStandardMaterial({ map: t, roughness: .6, side: T.DoubleSide })); me.position.set(x, y, z); if (!alongX) me.rotation.y = Math.PI / 2; sc.add(me);
  }
  const contCols = [0xb03a2e, 0x2f6aa8, 0x3f7f43, 0xc98a2b, 0x7b8188, 0x8a4f9e];

  function buildSites() {
    for (const S of (typeof SITES !== 'undefined' ? SITES : [])) { H = S.h != null ? S.h : TERH(S.x, S.z);
      if (S.t === 'military') {
        pad(S.x0 + 1, S.z0 + 1, S.x1 - 1, S.z1 - 1, 0x8e8a7c);
        // cerca com portão (lado norte, z0) e guarita + cancela
        const gx = -80; fence(S.x0 + 1, S.z0 + 1, S.x1 - 1, S.z0 + 1, [[gx, 4]]); fence(S.x0 + 1, S.z1 - 1, S.x1 - 1, S.z1 - 1); fence(S.x0 + 1, S.z0 + 1, S.x0 + 1, S.z1 - 1); fence(S.x1 - 1, S.z0 + 1, S.x1 - 1, S.z1 - 1);
        booth(gx - 6, S.z0 + 4, Math.PI / 2); booth(gx + 6, S.z0 + 4, -Math.PI / 2); barrier(gx - 4, S.z0 + 1.3, gx + 3.5);
        sign(gx, H + 4.2, S.z0 + .9, 7, 1, 'BASE SENTINELA', true, '#3b4a2c'); for (const sx of [-4.3, 4.3]) { box(MM, gx + sx - .12, H, S.z0 + .8, gx + sx + .12, H + 4.8, S.z0 + 1.0, 0x3b3f42); }
        // torres de vigia nos cantos
        tower(S.x0 + 5, S.z0 + 5, 0); tower(S.x1 - 5, S.z0 + 5, 0); tower(S.x0 + 5, S.z1 - 14, Math.PI); tower(S.x1 - 5, S.z1 - 14, Math.PI);
        hangar(-85, 72, 0, 18, 20); shed(-62, 50, -Math.PI / 2, 12, 16, { color: 0x8f9479, roof: 0x6f7a5c, crates: 5 });
        // contêineres e sacos de areia
        container(-98, 28, true, 0x4d5a3a); container(-98, 30.6, true, 0x5a5f48); container(-98, 28, true, 0x4d5a3a, 1); container(-90, 38, false, 0x6b6f52);
        sandbags(-75, 40, -68, 40); sandbags(-50, 62, -50, 68); sandbags(-104, 86, -96, 86); sandbags(-72, 24, -66, 24);
        for (const [x, z] of [[-88, 22], [-70, 88], [-40, 40]]) { box(MWD, x - .6, H, z - .6, x + .6, H + 1.2, z + .6); col(x - .6, z - .6, x + .6, z + .6, H - 1, H + 1.2); }
      } else if (S.t === 'school') {
        // muro com portão na frente (norte), pátio de concreto, quadra com alambrado, mastro e placa
        const gx = 15; wallGates(S.x0 + .5, S.z0 + .5, S.x1 - .5, [[gx, 2.5]], 0); lowWall(S.x0 + .5, S.z1 - .5, S.x1 - .5, S.z1 - .5, 0); lowWall(S.x0 + .5, S.z0 + .5, S.x0 + .5, S.z1 - .5, 0); lowWall(S.x1 - .5, S.z0 + .5, S.x1 - .5, S.z1 - .5, 0);
        pad(S.x0 + 1, S.z0 + 1, S.x1 - 1, S.z0 + 6, 0xb9b4aa); pad(gx - 2, S.z0 + 1, gx + 2, S.z0 + 6.5, 0xb9b4aa); pad(-12, 118, 44, 123, 0xb9b4aa);
        for (const sx of [-2.9, 2.9]) box(MC, gx + sx - .2, H, S.z0 + .3, gx + sx + .2, H + 3.6, S.z0 + .7, 0xd7d1c2);
        sign(gx, H + 3.2, S.z0 + .25, 5.4, .9, 'ESCOLA ESTADUAL', true, '#1d4f8a');
        box(MM, -14 - .06, H, 103 - .06, -14 + .06, H + 9, 103 + .06, 0xd0d0d0); box(MPLAIN, -14 + .06, H + 7.6, 103 - .02, -14 + 1.9, H + 8.8, 103 + .02, 0x2a6fd0);
        // quadra poliesportiva
        const qx0 = 16, qx1 = 44, qz0 = 126, qz1 = 144; pad(qx0, qz0, qx1, qz1, 0x5f7f9f, MPLAIN);
        const LY = H + .07, ln = (a, b, c, d) => box(MPLAIN, a, LY - .01, b, c, LY, d, 0xf2f2ee); ln(qx0 + 1, qz0 + 1, qx1 - 1, qz0 + 1.1); ln(qx0 + 1, qz1 - 1.1, qx1 - 1, qz1 - 1); ln(qx0 + 1, qz0 + 1, qx0 + 1.1, qz1 - 1); ln(qx1 - 1.1, qz0 + 1, qx1 - 1, qz1 - 1); ln((qx0 + qx1) / 2 - .05, qz0 + 1, (qx0 + qx1) / 2 + .05, qz1 - 1);
        for (const [gx2, s] of [[qx0 + 1, 1], [qx1 - 1, -1]]) { const cz = (qz0 + qz1) / 2; for (const z of [cz - 1.5, cz + 1.5]) { box(MPLAIN, gx2 - .05, H, z - .05, gx2 + .05, H + 2, z + .05, 0xffffff); col(gx2 - .06, z - .06, gx2 + .06, z + .06, H - 1, H + 2); } box(MPLAIN, gx2 - .05, H + 1.92, cz - 1.5, gx2 + .05, H + 2, cz + 1.5, 0xffffff); box(MFEN, Math.min(gx2, gx2 - s), H, cz - 1.5, Math.max(gx2, gx2 - s), H + .02, cz + 1.5); }
        fence(qx0, qz0, qx1, qz0, [[24, 1.5]]); fence(qx0, qz1, qx1, qz1); fence(qx0, qz0, qx0, qz1, [[135, 1.5]]); fence(qx1, qz0, qx1, qz1);
      } else if (S.t === 'port') {
        pad(S.x0, S.z0, S.x1, S.z1 + 1.5, 0xa29d94);
        // borda do cais e cabeços de amarração
        box(MC, S.x0, H - 3, S.z1 + 1.2, S.x1, H + .25, S.z1 + 1.8, 0xc9c4ba); for (let x = S.x0 + 4; x < S.x1; x += 8) { box(MM, x - .2, H + .05, S.z1 + .6, x + .2, H + .55, S.z1 + 1.0, 0x2c2f33); col(x - .2, S.z1 + .6, x + .2, S.z1 + 1.0, H - 1, H + .55); }
        // píeres de madeira sobre a praia/mar (com estacas)
        for (const [px, len] of [[52, 26], [82, 22]]) { const z0 = S.z1 + 1.5, z1 = z0 + len; box(MWD, px - 2, H - .3, z0, px + 2, H + .05, z1, 0xffffff); floor(px - 2, z0, px + 2, z1, H + .05); RDS.push([px - 2, z0, px + 2, z1]);
          for (let z = z0 + 2; z < z1; z += 3) for (const sx of [-1.8, 1.8]) box(MWD, px + sx - .15, -3, z - .15, px + sx + .15, H - .3, z + .15, 0x6b5238);
          for (const sx of [-2, 2]) { box(MWD, px + sx - .05, H + .05, z0, px + sx + .05, H + .95, z1, 0x7a5d3f); col(px + sx - .08, z0, px + sx + .08, z1, H - .5, H + .95); }
          box(MWD, px - 6, H - .3, z1 - 3, px + 6, H + .05, z1, 0xffffff); floor(px - 6, z1 - 3, px + 6, z1, H + .05); }
        crane(62, 196, 76, 214, 15); shed(48, 205, 0, 11, 16, { color: 0xb8c3c9, crates: 4, door: 6 });
        // pilhas de contêineres (cobertura)
        let ci = 0; for (const [x, z, n] of [[92, 197, 2], [92, 200, 1], [100, 197, 2], [92, 210, 1], [100, 210, 2], [100, 213, 1]]) for (let lv = 0; lv < n; lv++) container(x, z, true, contCols[(ci++) % contCols.length], lv);
        for (const [x, z] of [[40, 216], [70, 218], [86, 205]]) { box(MWD, x - .55, H, z - .55, x + .55, H + 1.1, z + .55); col(x - .55, z - .55, x + .55, z + .55, H - 1, H + 1.1); }
        sign(70, H + 16.5, 205, 6, 1, 'CAIS DO SUL', true, '#1d4f8a');
      } else if (S.t === 'depot') {
        pad(S.x0 + 1, S.z0 + 1, S.x1 - 1, S.z1 - 1, 0x958f84);
        fence(S.x0 + 1, S.z0 + 1, S.x1 - 1, S.z0 + 1, [[-182, 4]]); fence(S.x0 + 1, S.z1 - 1, S.x1 - 1, S.z1 - 1, [[-182, 4]]); fence(S.x0 + 1, S.z0 + 1, S.x0 + 1, S.z1 - 1); fence(S.x1 - 1, S.z0 + 1, S.x1 - 1, S.z1 - 1, [[7, 4]]);
        shed(-200, 8, Math.PI / 2, 22, 16, { color: 0xc9cdd1, crates: 6, door: 8 }); shed(-170, 21, Math.PI, 16, 11, { color: 0xb5755a, roof: 0x8d5b45, crates: 4 }); shed(-168, -4, 0, 14, 10, { color: 0xd3cfc3, crates: 3 });
        tank(-156, 4, 2.2, 5); tank(-156, 11, 2.2, 5, 0xd6c78a);
        let ci = 0; for (const [x, z, ax, lv] of [[-188, -9, false, 0], [-185, -9, false, 0], [-185, -9, false, 1], [-160, 26, true, 0]]) container(x, z, ax, contCols[(ci++) % contCols.length], lv);
        sign(-182, H + 3.6, S.z1 - .9, 6, .9, 'GALPÕES DO OESTE', true, '#5a3b22'); for (const sx of [-4.2, 4.2]) box(MM, -182 + sx - .1, H, S.z1 - 1, -182 + sx + .1, H + 4, S.z1 - .8, 0x3b3f42);
      }
    }
  }
  for (const C of TOWNS) buildTown(C);
  try { buildSites(); } catch (e) { console.warn('locais', e); }
  flushBoxes();

  // de longe some o interior dos prédios (portas internas)
  { const L_ = (window.DZSTR || []).filter(S => S.inner);
    const chk = () => { const px = cam.position.x, pz = cam.position.z; for (const S of L_) { const v = Math.abs(S.x - px) < 45 && Math.abs(S.z - pz) < 45; if (S.inner.visible !== v) S.inner.visible = v; } };
    chk(); setInterval(chk, 400); }
  // buggies: tira os que nasceram dentro da cidade (dentro de casa, na frente de porta) e deixa só 3 estacionados
  // na faixa da rua, longe das portas
  try {
    const C = CITY, AREAS = TOWNS.concat(typeof SITES !== 'undefined' ? SITES : []); for (let i = CARS.length - 1; i >= 0; i--) { const c = CARS[i]; if (c.heli) continue; if (AREAS.some(A => c.x > A.x0 - 6 && c.x < A.x1 + 6 && c.z > A.z0 - 6 && c.z < A.z1 + 6) || FP.some(b => c.x > b.x0 - 3 && c.x < b.x1 + 3 && c.z > b.z0 - 3 && c.z < b.z1 + 3)) { sc.remove(c.g); CARS.splice(i, 1); } }
    if (typeof addCar === 'function') for (const [x, z, r] of [[C.XL[1] + 2, (C.ZL[1] + C.ZL[2]) / 2 + 3, 0], [C.XL[3] - 2, (C.ZL[0] + C.ZL[1]) / 2 - 3, Math.PI], [(C.XL[1] + C.XL[2]) / 2 + 3, C.ZL[2] + 2, Math.PI / 2]]) addCar(x, z, r);
    // um buggy dentro de cada garagem, de frente para a rua (addCar recusa ponto dentro de construção: põe direto)
    for (const G of GAR) { const keep = FP.splice(0); try { addCar(G.x, G.z + (G.rot ? 1 : -1) * .4, G.rot ? Math.PI : 0); } finally { FP.push(...keep); } }
  } catch (e) { console.warn('cidade: buggies', e); }
})();
