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
  for (const x of xs) for (let j = 0; j < zs.length - 1; j++) quads.r.push([x - hw, zs[j] + hw, x + hw, zs[j + 1] - hw, 1]);
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
    for (const [x0, z0, x1, z1] of quads.i) { const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, N_ = cz > zs[0] + 1, S_ = cz < zs[zs.length - 1] - 1, W_ = cx > xs[0] + 1, E_ = cx < xs[xs.length - 1] - 1;
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
  const rnd = C.rnd;
  for (const L of C.lots) {
    const m = .5, x0 = L.x0 + m, x1 = L.x1 - m, z0 = L.z0 + m, z1 = L.z1 - m, front = L.rot ? z0 : z1, back = L.rot ? z1 : z0, brick = rnd() < .5;
    const cx = (L.x0 + L.x1) / 2;
    if (L.kind === 'str' || L.kind === 'model') {
      wallGate(x0, front, x1, front, cx + (L.kind === 'str' ? 0 : 0), brick);
      lowWall(x0, back, x1, back, brick);
      wallGate(x0, z0, x0, z1, (z0 + z1) / 2 + (L.rot ? 3 : -3), brick); wallGate(x1, z0, x1, z1, (z0 + z1) / 2 + (L.rot ? -3 : 3), brick);
      // caminho de concreto do portão até a porta
      if (L.S) { const S = L.S, dz0 = L.rot ? L.z0 : S.z + S.d / 2 + 1.2, dz1 = L.rot ? S.z - S.d / 2 - 1.2 : L.z1; box(MC, cx - 1.1, H - .2, Math.min(dz0, dz1), cx + 1.1, H + .06, Math.max(dz0, dz1), 0xb5b1a8); floor(cx - 1.1, Math.min(dz0, dz1), cx + 1.1, Math.max(dz0, dz1), H + .06); RDS.push([cx - 1.1, Math.min(dz0, dz1), cx + 1.1, Math.max(dz0, dz1)]); }
    } else if (L.kind === 'plaza') {
      // praça de concreto com muretas e blocos para se proteger
      box(MS, L.x0 + .3, H - .2, L.z0 + .3, L.x1 - .3, H + .08, L.z1 - .3, 0xd9d5cc); floor(L.x0 + .3, L.z0 + .3, L.x1 - .3, L.z1 - .3, H + .08); RDS.push([L.x0 + .3, L.z0 + .3, L.x1 - .3, L.z1 - .3]);
      const mx = (L.x0 + L.x1) / 2, mz = (L.z0 + L.z1) / 2;
      lowWall(mx - 5, mz - 4, mx - 1, mz - 4, 0); lowWall(mx + 1, mz + 4, mx + 5, mz + 4, 0); lowWall(mx - 6, mz + 1, mx - 6, mz + 5, 1); lowWall(mx + 6, mz - 5, mx + 6, mz - 1, 1);
      for (const [bx, bz] of [[mx - 2.5, mz + 1], [mx + 2.5, mz - 1.5]]) { box(MC, bx - .6, H, bz - .6, bx + .6, H + 1.1, bz + .6, 0xc2bdb3); col(bx - .6, bz - .6, bx + .6, bz + .6, H - 1, H + 1.1); }
    }
  }
  flushBoxes();

  // ---------- modelos prontos: carro destruído e móveis ----------
  const MD = {
    bed: { url: 'assets/models/city/wooden-bed.glb', len: 2.1 },
    couch: { url: 'assets/models/city/modern-full-couch.glb', len: 2.4 },
    table: { url: 'assets/models/city/table.glb', len: 1.8 },
    desk: { url: 'assets/models/city/desk.glb', len: 1.4 },
    chair: { url: 'assets/models/city/chair.glb', len: .6 }
  };
  const SRC = {}, WAIT = [];
  // prepara o modelo: escala para o tamanho real, base no chão, centro em 0
  function prep(k, sc_) {
    const s = sc_.clone(true), g = new T.Group(); g.add(s); s.updateMatrixWorld(true);
    let bb = new T.Box3().setFromObject(s); const sz = bb.getSize(new T.Vector3()); s.scale.multiplyScalar(MD[k].len / Math.max(sz.x, sz.z));
    s.updateMatrixWorld(true); bb = new T.Box3().setFromObject(s); const c = bb.getCenter(new T.Vector3()); s.position.set(-c.x, -bb.min.y, -c.z);
    g.userData.size = bb.getSize(new T.Vector3()); return g;
  }
  function inst(k) { const g = SRC[k].clone(true); g.userData.size = SRC[k].userData.size; return g; }
  for (const k in MD) new T.GLTFLoader().load(MD[k].url, gl => {
    gl.scene.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    SRC[k] = prep(k, gl.scene); if (Object.keys(SRC).length === Object.keys(MD).length) placeAll();
  }, undefined, e => console.warn('cidade: modelo', k, e));

  function placeAll() {
    // móveis nos cômodos (somem de longe para não pesar)
    const furn = [];
    for (const S of (window.DZSTR || [])) {
      if (!S.rooms || !S.inner) continue; const grp = S.inner;
      const put = (k, lx, lz, ry) => { const g = inst(k); g.position.set(lx, 0, lz); g.rotation.y = ry; return g; };
      for (const R of S.rooms) {
        const y = R.y - S.g.position.y, a = R.a, b = R.b;
        // cômodo A (sala): sofá encostado na parede da frente, mesa no meio
        const add = (k, lx, lz, ry, cH) => { const g = put(k, lx, lz, ry); g.position.y = y; grp.add(g); if (cH) { const p = S.L2W(lx, lz), sz = g.userData.size, sw = Math.abs(Math.sin(ry)) > .7, hx = (sw ? sz.z : sz.x) / 2, hz = (sw ? sz.x : sz.z) / 2, rr = Math.abs(Math.sin(S.rot || 0)) > .7; const ex = rr ? hz : hx, ez = rr ? hx : hz; col(p[0] - ex, p[1] - ez, p[0] + ex, p[1] + ez, R.y, R.y + cH); } };
        if (a[2] - a[0] > 3.2 && a[3] - a[1] > 2.6) { add('couch', a[0] + 1.6, a[3] - .55, Math.PI, .8); add('table', a[0] + 1.6, (a[1] + a[3]) / 2 - .2, 0, 0); }
        if (b[2] - b[0] > 2.6 && b[3] - b[1] > 2.6) { if ((R.k + S.floors) % 2) add('bed', (b[0] + b[2]) / 2, b[3] - 1.1, Math.PI / 2, .6); else { add('desk', (b[0] + b[2]) / 2, b[3] - .45, Math.PI, .8); add('chair', (b[0] + b[2]) / 2, b[3] - 1.2, Math.PI, 0); } }
      }
      furn.push(S);
    }
    // de longe: some o interior (portas internas e móveis)
    const chk = () => { const px = cam.position.x, pz = cam.position.z; for (const S of furn) { const v = Math.abs(S.x - px) < 45 && Math.abs(S.z - pz) < 45; if (S.inner.visible !== v) S.inner.visible = v; } };
    chk(); setInterval(chk, 400);
  }
  // alguns buggies estacionados nas ruas da cidade
  try { if (typeof addCar === 'function') for (const [x, z, r] of [[C.XL[1] + 2, C.ZL[1] + 14, 0], [C.XL[3] - 2, C.ZL[1] - 18, Math.PI], [C.XL[2] + 20, C.ZL[2] + 2, Math.PI / 2]]) addCar(x, z, r); } catch (e) { }
})();
