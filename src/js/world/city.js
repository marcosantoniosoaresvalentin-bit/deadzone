/* Deadzone · world/city.js
 * Monta a CIDADE descrita em world/map.js (CITY):
 *  - ruas de asfalto com faixa tracejada, cruzamentos, calçadas com meio-fio;
 *  - muretas em volta dos lotes (dá para pular por cima) e praças com muretas/blocos de concreto (cobertura);
 *  - postes de luz;
 *  - móveis dentro dos prédios com interior (cama, sofá, mesa, escrivaninha, cadeira) — aparecem só de perto.
 * Modelos prontos móveis.
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
  // ======================= CIDADES (Zonária, Vila Rubra, Cerraluz, Altamorra, Zênite) =======================
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
    for (const [x0, z0, x1, z1] of quads.i) { const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, xi = xs.findIndex(v => Math.abs(v - cx) < 1), zi = zs.findIndex(v => Math.abs(v - cz) < 1), sk = (a, b) => !!(C.skipV && C.skipV[a + '_' + b]), N_0 = cz > zs[0] + 1 && !sk(xi, zi - 1), S_0 = cz < zs[zs.length - 1] - 1 && !sk(xi, zi), W_0 = cx > xs[0] + 1, E_0 = cx < xs[xs.length - 1] - 1;
      /* poucas faixas: só nos cruzamentos de dentro da cidade e só em 2 lados (alternando), como em cidade de verdade */
      const inner = xi > 0 && xi < xs.length - 1 && zi > 0 && zi < zs.length - 1, ns = (xi + zi) % 2 === 0;
      if (!inner) continue; const N_ = N_0 && ns, S_ = S_0 && ns, W_ = W_0 && !ns, E_ = E_0 && !ns;
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
  const NETS = [];
  const MNET = (() => { const t = canvasT(64, 64, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = '#f4f4f4'; g.lineWidth = 3; for (let i = 0; i <= 64; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 64); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(64, i); g.stroke(); } }); return triMat(t, 1.2); })();
  MNET.alphaTest = .5; MNET.transparent = false; MNET.side = T.DoubleSide;
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
      { // rede: malha branca vazada (fundo, teto e laterais) e travessões de apoio
        const x0n = Math.min(sx, bx0), x1n = Math.max(sx, bx0); NETS.push([x0n, H + gh - .02, cz - gw, x1n, H + gh, cz + gw], [bx0 - .01, H, cz - gw, bx0 + .01, H + gh, cz + gw], [x0n, H, cz - gw - .01, x1n, H + gh, cz - gw + .01], [x0n, H, cz + gw - .01, x1n, H + gh, cz + gw + .01]);
        for (const z of [cz - gw, cz + gw]) { box(MPLAIN, bx0 - .03, H, z - .03, bx0 + .03, H + gh, z + .03, 0xe8e8e8); box(MPLAIN, x0n, H + gh - .03, z - .03, x1n, H + gh + .03, z + .03, 0xe8e8e8); } col(x0n, cz - gw, x1n, cz + gw, H - 1, H + gh); } }
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
  for (const b of C.blocks) if (b.tower) skyscraper(b);
  for (const b of C.blocks) if (b.stadium) { stadium(b); for (const q of NETS) box(MNET, ...q, 0xffffff); NETS.length = 0; }
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
  const MPLAIN = new T.MeshStandardMaterial({ vertexColors: true, roughness: .8 }), MTOW = new T.MeshStandardMaterial({ vertexColors: true, roughness: .95, side: T.DoubleSide });
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
  // vigas inclinadas (contraventamento): juntas numa malha só no fim
  const BEAMS = [];
  function beam(ax, ay, az, bx, by, bz, th, cl) { const dx = bx - ax, dy = by - ay, dz = bz - az, L = Math.hypot(dx, dy, dz), ge = new T.BoxGeometry(th, th, L).toNonIndexed(), o = new T.Object3D();
    o.position.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2); o.lookAt(bx, by, bz); o.updateMatrix(); ge.applyMatrix4(o.matrix);
    const n = ge.attributes.position.count, cc = new Float32Array(n * 3), t = new T.Color(cl).convertSRGBToLinear(); for (let i = 0; i < n; i++) { cc[i * 3] = t.r; cc[i * 3 + 1] = t.g; cc[i * 3 + 2] = t.b; } ge.setAttribute('color', new T.BufferAttribute(cc, 3)); BEAMS.push(ge); }
  function flushBeams() { if (!BEAMS.length) return; let n = 0; for (const g of BEAMS) n += g.attributes.position.count; const P = new Float32Array(n * 3), N = new Float32Array(n * 3), Cc = new Float32Array(n * 3); let o = 0;
    for (const g of BEAMS) { P.set(g.attributes.position.array, o * 3); N.set(g.attributes.normal.array, o * 3); Cc.set(g.attributes.color.array, o * 3); o += g.attributes.position.count; }
    const ge = new T.BufferGeometry(); ge.setAttribute('position', new T.BufferAttribute(P, 3)); ge.setAttribute('normal', new T.BufferAttribute(N, 3)); ge.setAttribute('color', new T.BufferAttribute(Cc, 3)); ge.computeBoundingSphere();
    const me = new T.Mesh(ge, MM); me.castShadow = true; sc.add(me); BEAMS.length = 0; }
  // TORRE DE VIGIA (aço): 4 pilares com contraventamento em X, cabine fechada até a cintura com janelas,
  // telhado com beiral e holofote; ESCADA maciça de concreto com corrimão de metal dos dois lados
  function tower(x, z, r) {
    const P_ = 6, s = 1.8, OL = 0x4f5a3c, DK = 0x2e3329;
    for (const [lx, lz] of [[-s, -s], [s, -s], [-s, s], [s, s]]) { lbox(MM, x, z, r, lx - .14, H, lz - .14, lx + .14, H + P_, lz + .14, DK); lcol(x, z, r, lx - .16, lz - .16, lx + .16, lz + .16, H - 1, H + P_); lbox(MC, x, z, r, lx - .3, H, lz - .3, lx + .3, H + .3, lz + .3, 0xb0aa9e); }
    // X nos 4 lados (2 níveis)
    const W_ = (lx, lz) => L2W(x, z, r, lx, lz);
    for (const [a, b] of [[[-s, -s], [s, -s]], [[s, -s], [s, s]], [[s, s], [-s, s]], [[-s, s], [-s, -s]]]) for (const [y0, y1] of [[.3, P_ / 2], [P_ / 2, P_ - .2]]) {
      const A = W_(a[0], a[1]), B = W_(b[0], b[1]); beam(A[0], H + y0, A[1], B[0], H + y1, B[1], .08, DK); beam(B[0], H + y0, B[1], A[0], H + y1, A[1], .08, DK); const M = W_(0, 0); }
    // piso da cabine
    lbox(MC, x, z, r, -s - .3, H + P_ - .2, -s - .3, s + .3, H + P_, s + .3, 0x9a958a); lfloor(x, z, r, -s - .3, -s - .3, s + .3, s + .3, H + P_);
    // paredes da cabine até 1,1 m (chapa verde), com vão da escada no lado +x (lz de -1,5 a -0,3)
    const e = s + .3, t = .12, wy0 = H + P_, wy1 = H + P_ + 1.1;
    for (const q of [[-e, -e, e, -e + t], [-e, e - t, e, e], [-e, -e, -e + t, e], [e - t, -e, e, -1.5], [e - t, -.3, e, e]]) { lbox(MCOR, x, z, r, q[0], wy0, q[1], q[2], wy1, q[3], OL); lcol(x, z, r, q[0], q[1], q[2], q[3], wy0, wy1); }
    lbox(MM, x, z, r, -e - .02, wy1, -e - .02, e + .02, wy1 + .06, e + .02, DK);
    // pilares do telhado e telhado com beiral
    for (const [lx, lz] of [[-e + .06, -e + .06], [e - .06, -e + .06], [-e + .06, e - .06], [e - .06, e - .06]]) lbox(MM, x, z, r, lx - .06, wy0, lz - .06, lx + .06, H + P_ + 2.5, lz + .06, DK);
    lbox(MCOR, x, z, r, -e - .45, H + P_ + 2.5, -e - .45, e + .45, H + P_ + 2.68, e + .45, OL); lbox(MM, x, z, r, -e - .45, H + P_ + 2.42, -e - .45, e + .45, H + P_ + 2.5, e + .45, DK);
    // holofote
    lbox(MM, x, z, r, -.25, H + P_ + 2.68, -.25, .25, H + P_ + 2.9, .25, 0x222222); lbox(MPLAIN, x, z, r, -.18, H + P_ + 2.72, -.27, .18, H + P_ + 2.86, -.25, 0xfff2c0);
    // ESCADA RETA de aço (como torre de vigia de verdade): sai pela abertura da cabine no lado +x e desce para fora.
    // Degraus sólidos com borda amarela, 2 vigas laterais, corrimão dos dois lados e 2 pilares de apoio.
    const W2 = (lx, lz) => L2W(x, z, r, lx, lz), RL = 0x30353a, ZA = -1.45, ZB = -.35, L = 7.4, NS = 20, X0 = e, X1 = e + L, run = L / NS, rise = P_ / NS;
    for (let i = 0; i < NS; i++) { // i=0 no topo
      const xa = X0 + i * run, ya = H + P_ - (i + 1) * rise;
      lbox(MC, x, z, r, xa, ya - .06, ZA, xa + run + .02, ya + .06, ZB, 0x8f969c);
      lbox(MPLAIN, x, z, r, xa + run - .05, ya + .061, ZA, xa + run + .02, ya + .07, ZB, 0xe3b51c);
    }
    for (const zz of [ZA - .06, ZB + .06]) { const a = W2(X0, zz), b = W2(X1, zz); beam(a[0], H + P_ - .02, a[1], b[0], H + .05, b[1], .18, RL);
      // corrimão inclinado + postes
      beam(a[0], H + P_ + .95, a[1], b[0], H + .95, b[1], .06, RL);
      for (let k = 0; k <= 4; k++) { const xx = X0 + L * k / 4, yy = H + P_ * (1 - k / 4), c = W2(xx, zz); beam(c[0], yy, c[1], c[0], yy + .97, c[1], .05, RL); } }
    // pilares de apoio sob a escada
    for (const fx of [.35, .7]) for (const zz of [ZA, ZB]) { const xx = X0 + L * fx, top = H + P_ * (1 - fx) - .1, c = W2(xx, zz); beam(c[0], H, c[1], c[0], top, c[1], .12, RL); }
    { const a = W2(X0, ZA), b = W2(X1, ZB), rr = { x0: Math.min(a[0], b[0]), x1: Math.max(a[0], b[0]), z0: Math.min(a[1], b[1]), z1: Math.max(a[1], b[1]), y0: H + P_, y1: H + .05 }, e0 = W2(X0, 0), e1 = W2(X1, 0);
      if (Math.abs(e1[0] - e0[0]) > Math.abs(e1[1] - e0[1])) { rr.ax = 'x'; rr.a0 = e0[0]; rr.a1 = e1[0]; } else { rr.ax = 'z'; rr.a0 = e0[1]; rr.a1 = e1[1]; } if (FLR && FLR.add) FLR.add(rr); }
    // corrimão também bloqueia (não cai pelo lado)
    lcol(x, z, r, X0, ZA - .12, X1, ZA - .04, H - 1, H + P_ + 1); lcol(x, z, r, X0, ZB + .04, X1, ZB + .12, H - 1, H + P_ + 1);
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
    const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; const mt = new T.MeshStandardMaterial({ map: t, roughness: .6 });
    // duas faces (uma para cada lado): o texto nunca aparece espelhado
    for (const k of [0, 1]) { const me = new T.Mesh(new T.PlaneGeometry(w, h), mt), ry = (alongX ? 0 : Math.PI / 2) + k * Math.PI, o = k ? -.015 : .015; me.position.set(x + (alongX ? 0 : o), y, z + (alongX ? o : 0)); me.rotation.y = ry; sc.add(me); }
  }
  const contCols = [0xb03a2e, 0x2f6aa8, 0x3f7f43, 0xc98a2b, 0x7b8188, 0x8a4f9e];

  // ESTRADAS entre as cidades: faixa de asfalto seguindo o terreno, bordas brancas e tracejado amarelo
  function buildRoads() {
    const RS = window.ROADS || [], hw = 3.5;
    RS.forEach((R, ri) => {
      const p = R.pts, n = p.length, P = [], U = [], M = [], Cm = [], wht = lin(0xe6e6e0), yel = lin(0xe2b83c); let dist = 0;
      const side = (k, o) => { const a = p[Math.max(0, k - 1)], b = p[Math.min(n - 1, k + 1)], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1, nx = -dz / l, nz = dx / l, x = p[k][0] + nx * o, z = p[k][1] + nz * o; return [x, p[k][2], z]; }; // seção plana na altura da pista
      const strip = (o0, o1, dy, k0, k1, col_) => { for (let k = k0; k < k1; k++) { if (p[k][3] && p[k + 1][3]) continue; const a0 = side(k, o0), a1 = side(k, o1), b0 = side(k + 1, o0), b1 = side(k + 1, o1); for (const q of [a0, b1, b0, a0, a1, b1]) { M.push(q[0], q[1] + .045 + dy, q[2]); Cm.push(col_.r, col_.g, col_.b); } } };
      for (let k = 0; k < n - 1; k++) { const l = Math.hypot(p[k + 1][0] - p[k][0], p[k + 1][1] - p[k][1]);
        if (p[k][3] && p[k + 1][3]) { dist += l; continue; } // dentro de cidade/local: a pista não é desenhada (ficava enterrada no pátio)
        const a0 = side(k, -hw), a1 = side(k, hw), b0 = side(k + 1, -hw), b1 = side(k + 1, hw), v0 = dist / 7, v1 = (dist + l) / 7;
        for (const [q, u, v] of [[a0, 0, v0], [b1, 1, v1], [b0, 0, v1], [a0, 0, v0], [a1, 1, v0], [b1, 1, v1]]) { P.push(q[0], q[1] + .03, q[2]); U.push(u, v); }
        if (k % 3 === 0) RDS.push([p[k][0] - hw, p[k][1] - hw, p[k][0] + hw, p[k][1] + hw]);
        // tracejado: 3 m pintado a cada 6 m (amostras de 2 m)
        if (k > 1 && k < n - 3 && k % 3 === 0) strip(-.08, .08, 0, k, k + 1, yel);
        dist += l; }
      strip(-hw + .3, -hw + .45, 0, 1, n - 2, wht); strip(hw - .45, hw - .3, 0, 1, n - 2, wht);
      const g1 = new T.BufferGeometry(); g1.setAttribute('position', new T.Float32BufferAttribute(P, 3)); g1.setAttribute('uv', new T.Float32BufferAttribute(U, 2)); g1.computeVertexNormals(); g1.computeBoundingSphere();
      const mr = MR.clone(); mr.side = T.DoubleSide; mr.polygonOffset = true; mr.polygonOffsetFactor = -1; mr.polygonOffsetUnits = -2 - ri; const m1 = new T.Mesh(g1, mr); m1.receiveShadow = true; sc.add(m1);
      const g2 = new T.BufferGeometry(); g2.setAttribute('position', new T.Float32BufferAttribute(M, 3)); g2.setAttribute('color', new T.Float32BufferAttribute(Cm, 3)); g2.computeVertexNormals(); g2.computeBoundingSphere();
      const m2 = new T.Mesh(g2, new T.MeshStandardMaterial({ vertexColors: true, roughness: .8, side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -12 - ri })); m2.receiveShadow = true; sc.add(m2);
    });
  }
  function buildSites() {
    for (const S of (typeof SITES !== 'undefined' ? SITES : [])) { H = S.h != null ? S.h : TERH(S.x, S.z);
      if (S.t === 'military') {
        pad(S.x0 + 1, S.z0 + 1, S.x1 - 1, S.z1 - 1, 0x8e8a7c);
        // cerca com portão (lado norte, z0) e guaritas + cancela
        const gx = -80; fence(S.x0 + 1, S.z0 + 1, S.x1 - 1, S.z0 + 1, [[gx, 4]]); fence(S.x0 + 1, S.z1 - 1, S.x1 - 1, S.z1 - 1); fence(S.x0 + 1, S.z0 + 1, S.x0 + 1, S.z1 - 1); fence(S.x1 - 1, S.z0 + 1, S.x1 - 1, S.z1 - 1);
        booth(gx - 6, S.z0 + 4, Math.PI / 2); booth(gx + 6, S.z0 + 4, -Math.PI / 2); barrier(gx - 4, S.z0 + 1.3, gx + 3.5);
        // (sem placa com o nome: o nome do lugar aparece só no mapa)
        // torres de vigia nos 4 cantos
        tower(S.x0 + 6, S.z0 + 6, 0); tower(S.x1 - 6, S.z0 + 6, 0); tower(S.x0 + 6, S.z1 - 6, Math.PI); tower(S.x1 - 6, S.z1 - 6, Math.PI);
        // 2 hangares, 2 barracões (garagem de viaturas e depósito)
        hangar(-125, 45, 0, 18, 20); hangar(-125, 78, 0, 18, 20);
        shed(-62, 55, -Math.PI / 2, 12, 16, { color: 0x8f9479, roof: 0x6f7a5c, crates: 5 }); shed(-35, 62, -Math.PI / 2, 10, 14, { color: 0x7f8a6a, roof: 0x5f6a4c, crates: 3, door: 6 });
        // pátio de viaturas (faixas pintadas) e tanques de combustível
        pad(-92, 58, -74, 68, 0x6f6c66); for (let x = -92; x <= -74; x += 4.5) box(MPLAIN, x - .06, H + .06, 58.5, x + .06, H + .07, 67.5, 0xe8e2c8);
        tank(-44, 44, 2.2, 5.5, 0x6f7a5c); tank(-37, 44, 2.2, 5.5, 0x6f7a5c);
        // casamata de concreto (bunker) com seteira e entrada atrás
        const bunker = (bx, bz, br) => { const hw = 2.6, hd = 2, Hh = 2.3, t = .3, cl = 0xa9a596;
          lbox(MC, bx, bz, br, -hw, H, -hd, hw, H + .9, -hd + t, cl); lbox(MC, bx, bz, br, -hw, H + 1.35, -hd, hw, H + Hh, -hd + t, cl); lcol(bx, bz, br, -hw, -hd, hw, -hd + t, H - 1, H + .9); { const lb = lcol(bx, bz, br, -hw, -hd, hw, -hd + t, H + 1.35, H + Hh); if (lb) lb.lint = 1; }
          for (const sx of [-1, 1]) { lbox(MC, bx, bz, br, sx * hw - t / 2 - sx * t / 2, H, -hd, sx * hw + t / 2 - sx * t / 2, H + Hh, hd, cl); lcol(bx, bz, br, sx * hw - t, -hd, sx * hw, hd, H - 1, H + Hh); }
          lbox(MC, bx, bz, br, -hw, H, hd - t, -.6, H + Hh, hd, cl); lbox(MC, bx, bz, br, .6, H, hd - t, hw, H + Hh, hd, cl); lcol(bx, bz, br, -hw, hd - t, -.6, hd, H - 1, H + Hh); lcol(bx, bz, br, .6, hd - t, hw, hd, H - 1, H + Hh); lbox(MC, bx, bz, br, -.6, H + 2.05, hd - t, .6, H + Hh, hd, cl);
          lbox(MC, bx, bz, br, -hw - .2, H + Hh, -hd - .2, hw + .2, H + Hh + .3, hd + .2, 0x96927f); lfloor(bx, bz, br, -hw - .2, -hd - .2, hw + .2, hd + .2, H + Hh + .3);
          const a = L2W(bx, bz, br, -hw, -hd), b = L2W(bx, bz, br, hw, hd); (window.DZCEIL || []).push({ x0: Math.min(a[0], b[0]), x1: Math.max(a[0], b[0]), z0: Math.min(a[1], b[1]), z1: Math.max(a[1], b[1]), y: H + Hh - .02 }); };
        bunker(-100, 22, 0); bunker(-46, 24, 0); bunker(-140, 62, Math.PI / 2);
        // antena de rádio (treliça de 22 m) com prato
        { const ax = -118, az = 100, hh = 22, w = .9; for (const [dx, dz] of [[-w, -w], [w, -w], [-w, w], [w, w]]) beam(ax + dx, H, az + dz, ax + dx * .25, H + hh, az + dz * .25, .1, 0xb33a2e);
          for (let y = 0; y < hh - 2; y += 2.5) { const k = 1 - y / hh * .75, k2 = 1 - (y + 2.5) / hh * .75; beam(ax - w * k, H + y, az - w * k, ax + w * k2, H + y + 2.5, az - w * k2, .05, 0xdedede); beam(ax + w * k, H + y, az + w * k, ax - w * k2, H + y + 2.5, az + w * k2, .05, 0xdedede); }
          col(ax - w, az - w, ax + w, az + w, H - 1, H + hh); const dg = new T.CylinderGeometry(1.4, .4, .5, 16); dg.rotateX(Math.PI / 2); dg.translate(ax, H + 14, az - 1); loose(dg.toNonIndexed(), MM, 0xe8e8e8).material = MM; }
        // contêineres, sacos de areia e caixotes
        container(-112, 28, true, 0x4d5a3a); container(-112, 30.6, true, 0x5a5f48); container(-112, 28, true, 0x4d5a3a, 1); container(-98, 37, false, 0x6b6f52); container(-60, 100, true, 0x4d5a3a); container(-52, 100, true, 0x5a5f48);
        heliWreck(-48, 88, .7);
        sandbags(-75, 40, -68, 40); sandbags(-88, 72, -82, 72); sandbags(-60, 82, -54, 82); sandbags(-112, 92, -106, 92); sandbags(-72, 24, -66, 24); sandbags(-130, 30, -130, 36);
        for (const [x, z] of [[-88, 22], [-70, 88], [-108, 64], [-30, 80], [-50, 70]]) { box(MWD, x - .6, H, z - .6, x + .6, H + 1.2, z + .6); col(x - .6, z - .6, x + .6, z + .6, H - 1, H + 1.2); }
      } else if (S.t === 'school') {
        // muro com portão na frente (norte), pátio de concreto, quadra com alambrado, mastro e placa
        const gx = 15; wallGates(S.x0 + .5, S.z0 + .5, S.x1 - .5, [[gx, 2.5]], 0); lowWall(S.x0 + .5, S.z1 - .5, S.x1 - .5, S.z1 - .5, 0); lowWall(S.x0 + .5, S.z0 + .5, S.x0 + .5, S.z1 - .5, 0); lowWall(S.x1 - .5, S.z0 + .5, S.x1 - .5, S.z1 - .5, 0);
        pad(S.x0 + 1, S.z0 + 1, S.x1 - 1, S.z0 + 6, 0xb9b4aa); pad(gx - 2, S.z0 + 1, gx + 2, S.z0 + 6.5, 0xb9b4aa); pad(-12, 118, 44, 123, 0xb9b4aa);
        for (const sx of [-2.9, 2.9]) box(MC, gx + sx - .2, H, S.z0 + .3, gx + sx + .2, H + 3.6, S.z0 + .7, 0xd7d1c2);
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
      } else if (S.t === 'gas') {
        // pátio de concreto com faixa de entrada/saída ligada à estrada e meio-fio
        pad(S.x0 - 6, S.z0, S.x1, S.z1, 0xb3aea6);
        box(MC, S.x0 - 6, H, S.z0 - .2, S.x1, H + .15, S.z0, 0xd8d4cc); box(MC, S.x0 - 6, H, S.z1, S.x1, H + .15, S.z1 + .2, 0xd8d4cc);
        // cobertura das bombas: teto grosso branco com faixa vermelha em volta, luzes embaixo
        const c0 = 27.5, c1 = 37.5, d0 = 38, d1 = 50, TY = H + 4.8;
        box(MC, c0, TY, d0, c1, TY + .55, d1, 0xf4f2ec); box(MPLAIN, c0 - .06, TY + .1, d0 - .06, c1 + .06, TY + .5, d1 + .06, 0xc8241c); box(MPLAIN, c0 - .07, TY + .2, d0 - .07, c1 + .07, TY + .3, d1 + .07, 0xffffff);
        floor(c0, d0, c1, d1, TY + .55); for (const z of [d0 + 2.5, (d0 + d1) / 2, d1 - 2.5]) box(MPLAIN, c0 + 1, TY - .03, z - .25, c1 - 1, TY, z + .25, 0xfffbe6);
        LAMPS.push({ x: (c0 + c1) / 2, y: TY - .3, z: (d0 + d1) / 2 });
        // 2 ilhas (meio-fio) cada uma com pilar central e 2 bombas
        for (const x of [30.5, 34.5]) {
          box(MC, x - .65, H, d0 + 1.2, x + .65, H + .22, d1 - 1.2, 0xe4e0d8); box(MPLAIN, x - .7, H, d0 + 1.1, x + .7, H + .08, d0 + 1.2, 0xf0c419); box(MPLAIN, x - .7, H, d1 - 1.2, x + .7, H + .08, d1 - 1.1, 0xf0c419);
          box(MC, x - .18, H + .22, (d0 + d1) / 2 - .18, x + .18, TY, (d0 + d1) / 2 + .18, 0xe8e6e0); col(x - .2, (d0 + d1) / 2 - .2, x + .2, (d0 + d1) / 2 + .2, H - 1, TY);
          for (const z of [d0 + 3.2, d1 - 3.2]) { const zz = z;
            box(MPLAIN, x - .3, H + .22, zz - .5, x + .3, H + 1.75, zz + .5, 0xf2f0ea); box(MPLAIN, x - .32, H + 1.75, zz - .52, x + .32, H + 2.05, zz + .52, 0xc8241c);
            for (const sx of [-1, 1]) { box(MPLAIN, x + sx * .31 - .01, H + 1.05, zz - .32, x + sx * .31 + .01, H + 1.5, zz + .32, 0x1b1d20); box(MPLAIN, x + sx * .31 - .01, H + .55, zz - .2, x + sx * .31 + .01, H + .85, zz + .2, 0x2a2c2f); box(MM, x + sx * .33, H + .6, zz + .25, x + sx * .38, H + .95, zz + .32, 0x111111); }
            col(x - .32, zz - .52, x + .32, zz + .52, H - 1, H + 2.05); } }
        // calibrador e lixeiras
        box(MPLAIN, 38.6, H, 38.6, 39.0, H + 1.2, 39.0, 0x2a5fa8); box(MPLAIN, 26.2, H, 50.6, 26.8, H + .9, 51.2, 0x3f7f43);
        // (sem totem com nome/preço)
      } else if (S.t === 'farm') {
        // cerca de madeira baixa (1,1 m: dá para pular) com porteira a oeste
        const wf = (x0, z0, x1, z1, gates) => { const ax = Math.abs(x1 - x0) > Math.abs(z1 - z0), a = ax ? Math.min(x0, x1) : Math.min(z0, z1), b = ax ? Math.max(x0, x1) : Math.max(z0, z1), f = ax ? z0 : x0;
          const segs = []; let u = a; for (const [c, hw] of (gates || [])) { if (c - hw > u) segs.push([u, c - hw]); u = c + hw; } if (b > u) segs.push([u, b]);
          for (const [s0, s1] of segs) { for (let t = s0; t <= s1 + .01; t += 2.4) ax ? box(MWD, t - .08, H, f - .08, t + .08, H + 1.15, f + .08, 0x8a6a48) : box(MWD, f - .08, H, t - .08, f + .08, H + 1.15, t + .08, 0x8a6a48);
            for (const yy of [.45, .95]) ax ? box(MWD, s0, H + yy, f - .04, s1, H + yy + .12, f + .04, 0xa98256) : box(MWD, f - .04, H + yy, s0, f + .04, H + yy + .12, s1, 0xa98256);
            ax ? col(s0, f - .1, s1, f + .1, H - 1, H + 1.1) : col(f - .1, s0, f + .1, s1, H - 1, H + 1.1); } };
        wf(S.x0 + .5, S.z0 + .5, S.x1 - .5, S.z0 + .5); wf(S.x0 + .5, S.z1 - .5, S.x1 - .5, S.z1 - .5); wf(S.x0 + .5, S.z0 + .5, S.x0 + .5, S.z1 - .5, [[30, 2.5]]); wf(S.x1 - .5, S.z0 + .5, S.x1 - .5, S.z1 - .5);
        // celeiro vermelho, silos, terreiro de terra e fardos de feno
        shed(78, 38, Math.PI, 14, 18, { color: 0xa33a2a, roof: 0x5a5a58, crates: 4, h: 6.5, door: 6 });
        tank(99, 41, 2.8, 13, 0xd8d8d2); tank(104.2, 33, 2.4, 11, 0xcfcfc8); for (const [x, z, r_] of [[99, 41, 2.8], [104.2, 33, 2.4]]) { const cg = new T.ConeGeometry(r_ + .15, 1.8, 18); cg.translate(x, H + (r_ > 2.5 ? 13 : 11) + .9, z); loose(cg.toNonIndexed(), MM, 0xa9adb2).material = MM; }
        pad(57, 26, 72, 34, 0x8a7558); pad(72, 22, 90, 28, 0x8a7558);
        for (const [x, z, rr] of [[62, 15, 0], [65, 15.5, 0], [63.5, 17.6, 0], [66, 44, Math.PI / 2], [69, 44, Math.PI / 2]]) { const cg = new T.CylinderGeometry(.75, .75, 1.3, 14); cg.rotateZ(Math.PI / 2); cg.rotateY(rr); cg.translate(x, H + .75, z); loose(cg.toNonIndexed(), MPLAIN, 0xd9b45a); col(x - .75, z - .75, x + .75, z + .75, H - 1, H + 1.5); }
      } else if (S.t === 'quarry') {
        // PEDREIRA: chão de cascalho, montes de pedra (cobertura), britador com esteira, 2 barracões, escritório (com interior)
        pad(S.x0 + 1, S.z0 + 1, S.x1 - 1, S.z1 - 1, 0x9a8f80);
        fence(S.x0 + 1, S.z0 + 1, S.x1 - 1, S.z0 + 1); fence(S.x0 + 1, S.z1 - 1, S.x1 - 1, S.z1 - 1, [[-190, 4]]); fence(S.x0 + 1, S.z0 + 1, S.x0 + 1, S.z1 - 1); fence(S.x1 - 1, S.z0 + 1, S.x1 - 1, S.z1 - 1);
        for (const [x, z, r_, h_] of [[-202, -92, 5, 4.5], [-191, -94, 4, 3.5], [-178, -90, 4.5, 4], [-172, -76, 3.5, 3]]) { const cg = new T.ConeGeometry(r_, h_, 14); cg.translate(x, H + h_ / 2, z); loose(cg.toNonIndexed(), MC, 0xa59a88); col(x - r_ * .55, z - r_ * .55, x + r_ * .55, z + r_ * .55, H - 1, H + h_ * .7); }
        // britador: estrutura de aço sobre pilares, funil e esteira inclinada
        { const bx = -185, bz = -78; for (const [dx, dz] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) { box(MM, bx + dx - .15, H, bz + dz - .15, bx + dx + .15, H + 5, bz + dz + .15, 0xc9a227); col(bx + dx - .2, bz + dz - .2, bx + dx + .2, bz + dz + .2, H - 1, H + 5); }
          box(MCOR, bx - 2.4, H + 5, bz - 2.4, bx + 2.4, H + 7, bz + 2.4, 0xc9a227); box(MM, bx - 1.6, H + 7, bz - 1.6, bx + 1.6, H + 8.2, bz + 1.6, 0x5a5d61); floor(bx - 2.4, bz - 2.4, bx + 2.4, bz + 2.4, H + 7);
          beam(bx + 2.4, H + 6, bz, bx + 13, H + .8, bz, .9, 0x3a3d41); }
        shed(-201, -78, Math.PI / 2, 12, 14, { color: 0xb79a6b, roof: 0x7a6a50, crates: 3 }); shed(-172, -66, Math.PI, 10, 12, { color: 0xc4c7cb, crates: 2, door: 6 });
      } else if (S.t === 'beach') {
        // PRAIA: quiosques de palha abertos, guarda-sol, cadeiras de praia, posto de salva-vidas, calçadão
        box(MWD, S.x0, H - .1, S.z0, S.x1, H + .12, S.z0 + 3, 0xd2b48c); floor(S.x0, S.z0, S.x1, S.z0 + 3, H + .12);
        const kiosk = (kx, kz) => { for (const [dx, dz] of [[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]]) { box(MWD, kx + dx - .1, H, kz + dz - .1, kx + dx + .1, H + 2.6, kz + dz + .1, 0x8a6a48); col(kx + dx - .12, kz + dz - .12, kx + dx + .12, kz + dz + .12, H - 1, H + 2.6); }
          const cg = new T.ConeGeometry(3.4, 1.6, 8); cg.rotateY(Math.PI / 8); cg.translate(kx, H + 3.4, kz); loose(cg.toNonIndexed(), MPLAIN, 0xc9a65a);
          box(MWD, kx - 1.6, H, kz - 1.7, kx + 1.6, H + 1.1, kz - 1.3, 0xa98256); col(kx - 1.6, kz - 1.7, kx + 1.6, kz - 1.3, H - 1, H + 1.1); box(MWD, kx - 1.7, H + 1.1, kz - 1.8, kx + 1.7, H + 1.18, kz - 1.2, 0xc8a070); };
        for (const kx of [-82, -55, -28, -2]) kiosk(kx, 209);
        const cols2 = [0xd23b3b, 0x2f6aa8, 0xf0c419, 0x3f9f63];
        for (let i = 0; i < 9; i++) { const ux = -88 + i * 11 + (i % 2) * 3, uz = 216 + (i % 3); const cg = new T.ConeGeometry(1.4, .5, 10); cg.translate(ux, H + 2.25, uz); loose(cg.toNonIndexed(), MPLAIN, cols2[i % 4]); box(MM, ux - .03, H, uz - .03, ux + .03, H + 2.1, uz + .03, 0xdddddd);
          for (const sx of [-.7, .7]) box(MPLAIN, ux + sx - .3, H + .2, uz + .3, ux + sx + .3, H + .32, uz + 1.6, cols2[(i + 1) % 4]); }
        // posto de salva-vidas (plataforma alta com escada)
        { const lx = -42, lz = 214; for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(MWD, lx + dx - .08, H, lz + dz - .08, lx + dx + .08, H + 2.4, lz + dz + .08, 0xf2f0ea);
          box(MWD, lx - 1.2, H + 2.4, lz - 1.2, lx + 1.2, H + 2.55, lz + 1.2, 0xc8241c); floor(lx - 1.2, lz - 1.2, lx + 1.2, lz + 1.2, H + 2.55); box(MPLAIN, lx - 1.2, H + 2.55, lz - 1.2, lx + 1.2, H + 3.4, lz - 1.1, 0xc8241c);
          for (let i = 0; i < 8; i++) box(MWD, lx - .4, H + i * .32, lz + 1.2 + (7 - i) * .3, lx + .4, H + i * .32 + .06, lz + 1.5 + (7 - i) * .3, 0xf2f0ea);
          { const rr = { x0: lx - .4, x1: lx + .4, z0: lz + 1.2, z1: lz + 3.6, ax: 'z', a0: lz + 3.6, a1: lz + 1.2, y0: H, y1: H + 2.55 }; if (FLR && FLR.add) FLR.add(rr); } }
      } else if (S.t === 'power') {
        // USINA: pátio de transformadores cercado, 2 torres de resfriamento, chaminé, torres de linha e sala de controle (com interior)
        pad(S.x0 + 1, S.z0 + 1, S.x1 - 1, S.z1 - 1, 0x8f8b84);
        fence(S.x0 + 1, S.z0 + 1, S.x1 - 1, S.z0 + 1); fence(S.x0 + 1, S.z1 - 1, S.x1 - 1, S.z1 - 1); fence(S.x0 + 1, S.z0 + 1, S.x0 + 1, S.z1 - 1, [[-5, 4]]); fence(S.x1 - 1, S.z0 + 1, S.x1 - 1, S.z1 - 1);
        for (const [cx, cz] of [[192, 1], [208, 1]]) { const pts = []; for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push(new T.Vector2(5.2 - 2.6 * Math.sin(t * Math.PI * .85) + t * .8, t * 16)); } const lg = new T.LatheGeometry(pts, 24); lg.translate(cx, H, cz); loose(lg.toNonIndexed(), MPLAIN, 0xcfcac0).material = MTOW; col(cx - 4, cz - 4, cx + 4, cz + 4, H - 1, H + 16); }
        { const cg = new T.CylinderGeometry(.8, 1.2, 24, 12); cg.translate(214, H + 12, -12); loose(cg.toNonIndexed(), MC, 0xb8b2a6); for (let y = 18; y < 24; y += 2.5) box(MPLAIN, 213.1, H + y, -12.9, 214.9, H + y + .5, -11.1, y % 5 < 2.5 ? 0xc8241c : 0xffffff); col(213, -13, 215, -11, H - 1, H + 24); }
        // transformadores (cobertura) num cercadinho
        fence(186, -36, 204, -36); fence(186, -22, 204, -22, [[195, 1.5]]); fence(186, -36, 186, -22); fence(204, -36, 204, -22);
        for (const [x, z] of [[190, -32], [195, -32], [200, -32], [190, -26], [200, -26]]) { box(MM, x - 1.1, H, z - .8, x + 1.1, H + 2.2, z + .8, 0x6b7076); for (let i = 0; i < 3; i++) box(MPLAIN, x - .8 + i * .8 - .08, H + 2.2, z - .08, x - .8 + i * .8 + .08, H + 3, z + .08, 0xd9d4c7); col(x - 1.1, z - .8, x + 1.1, z + .8, H - 1, H + 2.2); }
        // torre de linha de transmissão (treliça)
        { const tx = 218, tz = 0, hh = 18, w = 1.6; for (const [dx, dz] of [[-w, -w], [w, -w], [-w, w], [w, w]]) beam(tx + dx, H, tz + dz, tx + dx * .3, H + hh, tz + dz * .3, .14, 0x8a8f95);
          for (let y = 0; y < hh - 3; y += 3) { const k = 1 - y / hh * .7, k2 = 1 - (y + 3) / hh * .7; beam(tx - w * k, H + y, tz - w * k, tx + w * k2, H + y + 3, tz - w * k2, .07, 0x8a8f95); beam(tx + w * k, H + y, tz + w * k, tx - w * k2, H + y + 3, tz + w * k2, .07, 0x8a8f95); }
          box(MM, tx - 4, H + hh - 2, tz - .15, tx + 4, H + hh - 1.7, tz + .15, 0x8a8f95); col(tx - w, tz - w, tx + w, tz + w, H - 1, H + hh); }
      } else if (S.t === 'depot') {
        pad(S.x0 + 1, S.z0 + 1, S.x1 - 1, S.z1 - 1, 0x958f84);
        fence(S.x0 + 1, S.z0 + 1, S.x1 - 1, S.z0 + 1, [[-182, 4]]); fence(S.x0 + 1, S.z1 - 1, S.x1 - 1, S.z1 - 1, [[-182, 4]]); fence(S.x0 + 1, S.z0 + 1, S.x0 + 1, S.z1 - 1); fence(S.x1 - 1, S.z0 + 1, S.x1 - 1, S.z1 - 1, [[7, 4]]);
        shed(-200, 8, Math.PI / 2, 22, 16, { color: 0xc9cdd1, crates: 6, door: 8 }); shed(-170, 21, Math.PI, 16, 11, { color: 0xb5755a, roof: 0x8d5b45, crates: 4 }); shed(-168, -4, 0, 14, 10, { color: 0xd3cfc3, crates: 3 });
        tank(-156, 4, 2.2, 5); tank(-156, 11, 2.2, 5, 0xd6c78a);
        let ci = 0; for (const [x, z, ax, lv] of [[-188, -9, false, 0], [-185, -9, false, 0], [-185, -9, false, 1], [-160, 26, true, 0]]) container(x, z, ax, contCols[(ci++) % contCols.length], lv);
      }
    }
  }
  // ======================= ARRANHA-CÉU (Torre Zênite) =======================
  // só o térreo é aberto (saguão). Dois poços de elevador sem elevador: em cada um uma CORDA leva até o topo
  // (e traz de volta). No topo: heliponto com o único helicóptero do mapa e 2 casinhas onde as cordas chegam.
  window.ROPES = window.ROPES || [];
  const TXGL = canvasT(128, 128, (g, w, h) => {
    g.fillStyle = '#26323d'; g.fillRect(0, 0, w, h);
    for (let c = 0; c < 2; c++) { const gr = g.createLinearGradient(c * 64, 0, c * 64 + 64, 128); gr.addColorStop(0, 'rgba(150,185,210,.55)'); gr.addColorStop(.45, 'rgba(60,85,105,.35)'); gr.addColorStop(1, 'rgba(120,160,190,.5)'); g.fillStyle = gr; g.fillRect(c * 64 + 3, 12, 58, 112); }
    g.fillStyle = '#c9ced3'; g.fillRect(0, 0, w, 12); g.fillStyle = '#8d949b'; g.fillRect(0, 0, 3, h); g.fillRect(64, 0, 3, h); g.fillRect(0, 124, w, 4);
    for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(255,240,200,' + (Math.random() * .25) + ')'; g.fillRect((Math.random() < .5 ? 3 : 67) + Math.random() * 30, 20 + Math.random() * 80, 20, 30); } });
  const MGL = triMat(TXGL, 1 / 3.6); MGL.metalness = .55; MGL.roughness = .25;
  function skyscraper(b) {
    const TW = typeof TOWER !== 'undefined' ? TOWER : { x: (b.x0 + b.x1) / 2, z: (b.z0 + b.z1) / 2, w: 26, h: 78 };
    const cx = TW.x, cz = TW.z, hw = TW.w / 2, LH = 5.6, TOP = H + TW.h, RY = TOP + .06, x0 = cx - hw, x1 = cx + hw, z0 = cz - hw, z1 = cz + hw;
    // praça em volta (piso de pedra) e saguão (piso claro)
    box(MS, b.x0, H - .2, b.z0, b.x1, H + .1, b.z1, 0xdedad2); floor(b.x0, b.z0, b.x1, b.z1, H + .1); RDS.push([b.x0, b.z0, b.x1, b.z1]);
    box(MPLAIN, x0 + .3, H + .1, z0 + .3, x1 - .3, H + .13, z1 - .3, 0xe9e6df); floor(x0, z0, x1, z1, H + .13);
    // fachada do saguão: montantes, vidros (quebram), entradas abertas no leste e no oeste
    const bay = 2.6, panes = [];
    const side = (alongX, f, out) => { const a0 = alongX ? x0 : z0, a1 = alongX ? x1 : z1, mid = (a0 + a1) / 2;
      for (let u = a0; u < a1 - .01; u += bay) { const c = u + bay / 2, ent = !alongX && Math.abs(c - mid) < bay * 1.01;
        // montante
        alongX ? (box(MM, u - .08, H, f - .15, u + .08, H + LH, f + .15, 0x2b2f33), col(u - .1, f - .2, u + .1, f + .2, H - 1, H + LH)) : (box(MM, f - .15, H, u - .08, f + .15, H + LH, u + .08, 0x2b2f33), col(f - .2, u - .1, f + .2, u + .1, H - 1, H + LH));
        if (ent) continue;
        alongX ? box(MC, u, H, f - .12, u + bay, H + .35, f + .12, 0x8d8b86) : box(MC, f - .12, H, u, f + .12, H + .35, u + bay, 0x8d8b86);
        panes.push(alongX ? [c, H + .35 + 2.1, f, 0] : [f, H + .35 + 2.1, c, Math.PI / 2]);
        alongX ? col(u, f - .12, u + bay, f + .12, H - 1, H + LH) : col(f - .12, u, f + .12, u + bay, H - 1, H + LH); }
      // faixa de concreto em cima do saguão
      alongX ? box(MC, a0 - .2, H + LH - .9, f - .25, a1 + .2, H + LH, f + .25, 0xbdb8ae) : box(MC, f - .25, H + LH - .9, a0 - .2, f + .25, H + LH, a1 + .2, 0xbdb8ae); };
    side(true, z0, -1); side(true, z1, 1); side(false, x0, -1); side(false, x1, 1);
    if (window.DZW) { const gq = new T.Group(); sc.add(gq); DZW.add(gq, panes, bay - .2, 4.2 - .2); }
    // marquises de vidro nas entradas
    for (const f of [x0 - 3, x1]) { box(MM, f, H + LH - .3, cz - 4, f + 3, H + LH - .15, cz + 4, 0x2b2f33); }
    // colunas, balcão e poços das cordas (abertos para o centro)
    for (const [dx, dz] of [[-6.5, -4], [6.5, -4], [-6.5, 4], [6.5, 4]]) { box(MC, cx + dx - .45, H, cz + dz - .45, cx + dx + .45, H + LH, cz + dz + .45, 0xd6d1c7); col(cx + dx - .45, cz + dz - .45, cx + dx + .45, cz + dz + .45, H - 1, H + LH); }
    box(MWD, cx - 2.2, H, cz - .6, cx + 2.2, H + 1.1, cz + .6, 0x6b4a33); box(MPLAIN, cx - 2.3, H + 1.1, cz - .7, cx + 2.3, H + 1.16, cz + .7, 0x22262a); col(cx - 2.2, cz - .6, cx + 2.2, cz + .6, H - 1, H + 1.1);
    for (const sg of [-1, 1]) { const rz = cz + sg * 10, zb = cz + sg * 12.2, zf = cz + sg * 8, t = .3;
      // paredes do poço: fundo + 2 lados (frente aberta, virada para o centro)
      box(MC, cx - 2, H, Math.min(zb, zb - sg * t), cx + 2, H + LH, Math.max(zb, zb - sg * t), 0x9aa0a6); col(cx - 2, Math.min(zb, zb - sg * t), cx + 2, Math.max(zb, zb - sg * t), H - 1, H + LH);
      for (const sx of [-2, 2 - t]) { box(MC, cx + sx, H, Math.min(zf, zb), cx + sx + t, H + LH, Math.max(zf, zb), 0x9aa0a6); col(cx + sx, Math.min(zf, zb), cx + sx + t, Math.max(zf, zb), H - 1, H + LH); }
      box(MM, cx - 2, H + LH - .5, Math.min(zf, zf + sg * .2), cx + 2, H + LH, Math.max(zf, zf + sg * .2), 0x2b2f33);
      // corda do saguão (some no teto) e corda dentro da casinha do topo
      for (const [ya, yb] of [[H + .13, RY + 2.5]]) { /* corda inteira, do saguão até a roldana da casinha */ const cg = new T.CylinderGeometry(.04, .04, yb - ya, 6); cg.translate(cx, (ya + yb) / 2, rz); loose(cg.toNonIndexed(), MPLAIN, 0x3a2a1a); }
      { const kg = new T.CylinderGeometry(.09, .09, .35, 8); kg.translate(cx, H + 1.05, rz); loose(kg.toNonIndexed(), MPLAIN, 0xc8241c); }
      ROPES.push({ x: cx, z: rz, y0: H + .13, y1: RY, ex: 0, ez: -sg }); // ex/ez: lado de sair (para o centro)
      // CASINHA no topo, em cima do poço: porta virada para o heliponto
      const hz0 = cz + sg * 8.3, hz1 = cz + sg * 11.9, HH = 2.8, cl = 0xc9c4b8, lo = Math.min(hz0, hz1), hi = Math.max(hz0, hz1);
      box(MC, cx - 2.1, RY, sg > 0 ? hi - t : lo, cx + 2.1, RY + HH, sg > 0 ? hi : lo + t, cl); col(cx - 2.1, sg > 0 ? hi - t : lo, cx + 2.1, sg > 0 ? hi : lo + t, RY, RY + HH);
      for (const sx of [-2.1, 2.1 - t]) { box(MC, cx + sx, RY, lo, cx + sx + t, RY + HH, hi, cl); col(cx + sx, lo, cx + sx + t, hi, RY, RY + HH); }
      const fz = sg > 0 ? lo : hi; for (const [a, c] of [[-2.1, -.8], [.8, 2.1]]) { box(MC, cx + a, RY, Math.min(fz, fz + sg * t), cx + c, RY + HH, Math.max(fz, fz + sg * t), cl); col(cx + a, Math.min(fz, fz + sg * t), cx + c, Math.max(fz, fz + sg * t), RY, RY + HH); }
      box(MC, cx - .8, RY + 2.25, Math.min(fz, fz + sg * t), cx + .8, RY + HH, Math.max(fz, fz + sg * t), cl);
      box(MC, cx - 2.4, RY + HH, lo - .3, cx + 2.4, RY + HH + .25, hi + .3, 0xa8a398); box(MM, cx - .3, RY + HH - .35, rz - .3, cx + .3, RY + HH, rz + .3, 0x55595d);
      (window.DZCEIL || []).push({ x0: cx - 2.1, x1: cx + 2.1, z0: lo, z1: hi, y: RY + HH - .02 }); LAMPS.push({ x: cx, y: RY + 2.3, z: rz });
    }
    // corpo da torre (vidro), faixas de laje e aletas verticais; colisão do corpo inteiro
    // POÇOS ABERTOS do saguão até o topo (a corda sobe por dentro; a câmera acompanha)
    const HOLES = [[cx - 2, cz + 8, cx + 2, cz + 12.2], [cx - 2, cz - 12.2, cx + 2, cz - 8]];
    const minus = (ax0, az0, ax1, az1) => { const zs = [az0, az1]; for (const h of HOLES) for (const v of [h[1], h[3]]) if (v > az0 && v < az1) zs.push(v); zs.sort((a, b) => a - b); const out = [];
      for (let i = 0; i < zs.length - 1; i++) { const za = zs[i], zb_ = zs[i + 1], zm = (za + zb_) / 2; let xs = [[ax0, ax1]];
        for (const h of HOLES) if (zm > h[1] && zm < h[3]) xs = xs.flatMap(([a, c]) => (h[2] <= a || h[0] >= c) ? [[a, c]] : [[a, h[0]], [h[2], c]].filter(q => q[1] - q[0] > .01));
        for (const [a, c] of xs) out.push([a, za, c, zb_]); } return out; };
    for (const q of minus(x0 + .2, z0 + .2, x1 - .2, z1 - .2)) box(MGL, q[0], H + LH, q[1], q[2], TOP - .3, q[3], 0xffffff);
    for (const q of minus(x0, z0, x1, z1)) col(q[0], q[1], q[2], q[3], H + LH - .02, TOP);
    for (let y = H + LH + 3.6 * 4; y < TOP - 2; y += 3.6 * 6) for (const q of minus(x0 - .1, z0 - .1, x1 + .1, z1 + .1)) box(MC, q[0], y, q[1], q[2], y + .5, q[3], 0xd9d5cc);
    // revestimento de concreto dentro dos poços, com luzes a cada andar (dá para ver que está subindo)
    for (const h of HOLES) { const [a, b_, c, d] = h, t = .12;
      box(MC, a, H + LH - .5, b_, a + t, TOP, d, 0x8e949a); box(MC, c - t, H + LH - .5, b_, c, TOP, d, 0x8e949a); box(MC, a, H + LH - .5, b_, c, TOP, b_ + t, 0x8e949a); box(MC, a, H + LH - .5, d - t, c, TOP, d, 0x8e949a);
      for (let y = H + LH + 1.8; y < TOP - 1; y += 3.6) { box(MPLAIN, a + t, y, b_ + 1.4, a + t + .04, y + .12, d - 1.4, 0xfff4cf); box(MPLAIN, c - t - .04, y, b_ + 1.4, c - t, y + .12, d - 1.4, 0xfff4cf); box(MM, a + t, y - 1.8, b_ + t, c - t, y - 1.74, b_ + t + .05, 0x5a6066); } }
    for (const k of [-1, 1]) for (const a of [-hw + .2, -hw / 2, 0, hw / 2, hw - .2]) { box(MC, cx + a - .18, H + LH, cz + k * hw - .35, cx + a + .18, TOP, cz + k * hw + .35, 0xe1ddd4); box(MC, cx + k * hw - .35, H + LH, cz + a - .18, cx + k * hw + .35, TOP, cz + a + .18, 0xe1ddd4); }
    for (const q of minus(x0 - .3, z0 - .3, x1 + .3, z1 + .3)) box(MC, q[0], H + LH - .1, q[1], q[2], H + LH + .4, q[3], 0xd9d5cc);
    // teto do saguão (câmera não sobe) e área (grama não nasce)
    (window.DZCEIL || []).push({ x0, x1, z0, z1, y: H + LH - .9 }); FP.push({ x0, x1, z0, z1 });
    LAMPS.push({ x: cx - 5, y: H + LH - 1, z: cz }); LAMPS.push({ x: cx + 5, y: H + LH - 1, z: cz });
    // topo: laje, mureta com faixa, mastro de antena num canto
    for (const q of minus(x0 - .3, z0 - .3, x1 + .3, z1 + .3)) box(MC, q[0], TOP - .3, q[1], q[2], RY, q[3], 0xb9b4aa); floor(x0, z0, x1, z1, RY);
    // grade de metal por cima de cada poço (dá para ver o buraco; dá para pisar)
    for (const h of HOLES) box(MFEN, h[0], RY - .03, h[1], h[2], RY, h[3], 0xd0d4d8);
    for (const q of [[x0 - .3, z0 - .3, x1 + .3, z0 + .2], [x0 - .3, z1 - .2, x1 + .3, z1 + .3], [x0 - .3, z0 - .3, x0 + .2, z1 + .3], [x1 - .2, z0 - .3, x1 + .3, z1 + .3]]) { box(MC, q[0], RY, q[1], q[2], RY + 1.2, q[3], 0xd9d5cc); box(MPLAIN, q[0], RY + 1.2, q[1], q[2], RY + 1.3, q[3], 0xc8241c); col(q[0], q[1], q[2], q[3], RY, RY + 1.3); }
    box(MM, x0 + 1, RY, z0 + 1, x0 + 1.4, RY + 14, z0 + 1.4, 0x9aa0a6); box(MPLAIN, x0 + .95, RY + 14, z0 + .95, x0 + 1.45, RY + 14.4, z0 + 1.45, 0xff2a2a);
  }
  // ======================= PONTE (pedreira -> Ilha Zênite) =======================
  function bridge() {
    if (typeof BRIDGE === 'undefined') return; const B = BRIDGE, a = Math.min(B.x0, B.x1) - 12, c = Math.max(B.x0, B.x1) + 12, zc = B.z, Y0 = B.y, hwz = 5;
    H = Y0;
    box(MC, a, Y0 - .9, zc - hwz, c, Y0, zc + hwz, 0xa9a59d);
    { const L = c - a, ge = new T.PlaneGeometry(L, 8); ge.rotateX(-Math.PI / 2); ge.translate((a + c) / 2, Y0 + .04, zc); const U = ge.attributes.uv; for (let i = 0; i < U.count; i++) U.setXY(i, U.getY(i), U.getX(i) * L / 7); const mr = MR.clone(); mr.polygonOffset = true; mr.polygonOffsetFactor = -1; mr.polygonOffsetUnits = -2; const me = new T.Mesh(ge, mr); me.receiveShadow = true; sc.add(me); }
    floor(a, zc - hwz, c, zc + hwz, Y0 + .04);
    box(MPLAIN, a, Y0 + .05, zc - 3.75, c, Y0 + .055, zc - 3.6, 0xe6e6e0); box(MPLAIN, a, Y0 + .05, zc + 3.6, c, Y0 + .055, zc + 3.75, 0xe6e6e0);
    for (let x = a + 2; x < c - 3; x += 6) box(MPLAIN, x, Y0 + .05, zc - .08, x + 3, Y0 + .055, zc + .08, 0xe2b83c);
    // muretas laterais (1 m: dá para pular... e cair no mar) e postes
    for (const s_ of [-1, 1]) { const z = zc + s_ * (hwz - .25); box(MC, a, Y0, z - .25, c, Y0 + 1, z + .25, 0xd2cdc3); col(a, z - .25, c, z + .25, Y0 - 1, Y0 + 1); }
    for (let x = a + 8, i = 0; x < c - 4; x += 22, i++) { const s_ = i % 2 ? 1 : -1, z = zc + s_ * (hwz - .25);
      box(MM, x - .08, Y0 + 1, z - .08, x + .08, Y0 + 7, z + .08, 0x3a3d42); box(MM, x - .08, Y0 + 6.9, Math.min(z, z - s_ * 1.4), x + .08, Y0 + 7, Math.max(z, z - s_ * 1.4), 0x3a3d42); box(MM, x - .25, Y0 + 6.75, z - s_ * 1.4 - .15, x + .25, Y0 + 6.9, z - s_ * 1.4 + .15, 0xe8e2c8); LAMPS.push({ x, y: Y0 + 6.6, z: z - s_ * 1.4 }); }
    // pilares (só sobre o mar)
    for (let x = a + 14; x < c - 10; x += 22) { if (TERH(x, zc) > 1) continue; box(MC, x - 1.1, -14, zc - 3.5, x + 1.1, Y0 - .9, zc + 3.5, 0x9c978e); box(MC, x - 1.4, Y0 - 1.6, zc - hwz, x + 1.4, Y0 - .9, zc + hwz, 0x9c978e); col(x - 1.1, zc - 3.5, x + 1.1, zc + 3.5, -20, Y0 - 1); }
    RDS.push([a, zc - hwz, c, zc + hwz]);
  }
  // HELICÓPTERO EXPLODIDO (só enfeite, não voa) na base militar
  function heliWreck(x, z, ry) {
    if (typeof mkHeli !== 'function') return; const h = mkHeli(typeof HPAL !== 'undefined' ? HPAL[0] : undefined), burnt = new T.MeshStandardMaterial({ color: lin(0x221e1b), roughness: 1, metalness: .2 }), rust = new T.MeshStandardMaterial({ color: lin(0x4a2c1d), roughness: 1 });
    let i = 0; h.traverse(o => { if (o.isMesh) { o.material = (i++ % 4) ? burnt : rust; o.castShadow = true; } });
    const gy = TERH(x, z); h.position.set(x, gy - .25, z); h.rotation.set(.12, ry, .32); h.updateMatrixWorld(true); sc.add(h);
    col(x - 3.5, z - 3.5, x + 3.5, z + 3.5, gy - 1, gy + 2.6);
    // marca de queimado no chão e destroços
    { const ge = new T.CircleGeometry(7, 20); ge.rotateX(-Math.PI / 2); ge.translate(x, gy + .07, z); const me = new T.Mesh(ge, new T.MeshStandardMaterial({ color: 0x1a1816, roughness: 1, transparent: true, opacity: .75, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 })); sc.add(me); }
    for (let k = 0; k < 7; k++) { const a = k * .9, r = 3 + (k % 3) * 1.7, px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r; box(MM, px - .4, gy, pz - .3, px + .4, gy + .25 + (k % 2) * .3, pz + .3, 0x2a2724); }
  }
  for (const C of TOWNS) buildTown(C);
  try { buildRoads(); } catch (e) { console.warn('estradas', e); }
  try { bridge(); } catch (e) { console.warn('ponte', e); }
  try { buildSites(); } catch (e) { console.warn('locais', e); }
  flushBeams();
  flushBoxes();

  // de longe some o interior dos prédios (portas internas)
  { const L_ = (window.DZSTR || []).filter(S => S.inner);
    const chk = () => { const px = cam.position.x, pz = cam.position.z; for (const S of L_) { const v = Math.abs(S.x - px) < 45 && Math.abs(S.z - pz) < 45; if (S.inner.visible !== v) S.inner.visible = v; } };
    chk(); setInterval(chk, 400); }
  // buggies: tira os que nasceram dentro da cidade (dentro de casa, na frente de porta) e deixa só 3 estacionados
  // na faixa da rua, longe das portas
  try {
    const C = CITY, AREAS = TOWNS.concat(typeof SITES !== 'undefined' ? SITES : []); for (let i = CARS.length - 1; i >= 0; i--) { const c = CARS[i]; if (c.heli) continue; if (AREAS.some(A => c.x > A.x0 - 6 && c.x < A.x1 + 6 && c.z > A.z0 - 6 && c.z < A.z1 + 6) || FP.some(b => c.x > b.x0 - 3 && c.x < b.x1 + 3 && c.z > b.z0 - 3 && c.z < b.z1 + 3)) { sc.remove(c.g); CARS.splice(i, 1); } }
    if (typeof addCar === 'function') for (const [x, z, r] of [[C.XL[1] + 2, (C.ZL[1] + C.ZL[2]) / 2 + 3, 0]]) addCar(x, z, r);
    { const keep = FP.splice(0); try { for (const [x, z, r] of [[-87.5, 63, 0], [66, 30, Math.PI / 2], [160, 80, Math.PI / 2]]) addCar(x, z, r); } finally { FP.push(...keep); } }
    // um buggy dentro de cada garagem, de frente para a rua (addCar recusa ponto dentro de construção: põe direto)
    for (const G of GAR) { const keep = FP.splice(0); try { addCar(G.x, G.z + (G.rot ? 1 : -1) * .4, G.rot ? Math.PI : 0); } finally { FP.push(...keep); } }
  } catch (e) { console.warn('cidade: buggies', e); }
  // ---------- PONTOS DE LOOT (combat/loot.js espalha os itens) ----------
  // um ponto por andar em cada prédio (às vezes dois), barracões/hangares e locais abertos; a Ilha Zênite tem loot melhor
  { let sd = 97531; const rr = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
    const inZ = (x, z) => x < -350;
    for (const S of (window.DZSTR || [])) { if (!S.spots) continue; const rich = inZ(S.x, S.z);
      S.spots.forEach((p, i) => { if (i % 2 === 1 && (rich ? rr() < .5 : rr() < .6)) return; LS.push({ x: p[0], z: p[1], y: p[2], rich }); }); }
    // arranha-céu: saguão e topo com loot forte
    if (typeof TOWER !== 'undefined') { const y0 = TOWER.y0, yt = TOWER.y0 + TOWER.h + .06;
      for (const [dx, dz] of [[-8, -3], [8, 3], [-4, 6], [5, -6]]) LS.push({ x: TOWER.x + dx, z: TOWER.z + dz, y: y0 + .2, rich: 1 });
      for (const [dx, dz] of [[-9, -4], [-9, 4], [10, 9], [10, -9]]) LS.push({ x: TOWER.x + dx, z: TOWER.z + dz, y: yt, rich: 1 }); }
    // locais especiais: dentro de barracões/hangares e no pátio
    const site = (x, z, n, r) => { for (let i = 0; i < n; i++) LS.push({ x: x + (rr() - .5) * r, z: z + (rr() - .5) * r, y: null, rich: inZ(x, z) }); };
    site(-125, 45, 2, 10); site(-125, 78, 2, 10); site(-62, 55, 2, 8); site(-35, 62, 1, 6); site(-80, 30, 2, 20);   // base militar
    site(-200, 8, 2, 12); site(-170, 21, 1, 8); site(-168, -4, 1, 8);                                       // galpões
    site(48, 205, 2, 8); site(95, 205, 2, 14);                                                           // cais
    site(-201, -78, 1, 8); site(-172, -66, 1, 6); site(78, 38, 2, 10);                                    // pedreira, fazenda
    site(30, 135, 1, 10); site(-50, 210, 2, 40); site(200, -15, 2, 16);                                  // quadra, praia, usina
    for (const G of GAR) LS.push({ x: G.x + 1.6, z: G.z, y: null, rich: 0 });                                // garagens
    window.DZLS = LS; }
  // fim da montagem do mapa: para de registrar o que entra na cena
  if (window.__dzScAdd) sc.add = window.__dzScAdd; window.__dzWorldDone = 1;
})();
