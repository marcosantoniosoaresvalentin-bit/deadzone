/* Deadzone · world/buildings.js
 * CONSTRUÇÕES com modelos 3D prontos. A lista de onde ficam está em world/map.js (BLDS);
 * o terreno fica plano embaixo de cada uma (world/terrain.js).
 *
 * Modelos (licença CC-BY 4.0, texturas reduzidas para WebP):
 *  - brick: "Countryside brick house" por dannzjs (Sketchfab)
 *  - ruin:  "Old Building | Lowpoly" por Fridqeir (Sketchfab)
 */
(function () {
  // caminhos escritos por extenso: o build de arquivo único embute cada um
  // len: maior medida da construção em metros (o modelo é escalado para isso)
  // glass: materiais que não bloqueiam a passagem; wall: material das paredes principais (para achar a porta)
  const MODELS = {
    brick: { url: 'assets/models/buildings/brick-house.glb', len: 14 },
    ruin: { url: 'assets/models/buildings/ruin.glb', len: 11, glass: /Windows/i }
  };
  const SRC = {};
  const DZB = window.DZB = { list: [] };

  // ESCANEIA a construção na altura das pernas e devolve a planta (grade de 25 cm, coordenadas da construção)
  // Peças de material "Input"/vidro (portas e janelas) não bloqueiam a passagem.
  const CELL = .25;
  function scan(root, yb, yt, skip) {
    root.updateMatrixWorld(true); const inv = new T.Matrix4().copy(root.matrixWorld).invert(), occ = new Map(), A = new T.Vector3(), B = new T.Vector3(), C = new T.Vector3(), q = new T.Vector3();
    let floorBox = null;
    root.traverse(o => {
      if (!o.isMesh || !o.geometry) return; if (skip && skip(o)) return;
      const g = o.geometry, P = g.attributes.position, d = (() => { const a = P.array; return !P.normalized ? 1 : a instanceof Int16Array ? 32767 : a instanceof Uint16Array ? 65535 : a instanceof Int8Array ? 127 : a instanceof Uint8Array ? 255 : 1; })();
      const M = new T.Matrix4().multiplyMatrices(inv, o.matrixWorld), idx = g.index ? g.index.array : null, nt = (idx ? idx.length : P.count) / 3;
      const get = (i, v) => v.set(P.getX(i) / d, P.getY(i) / d, P.getZ(i) / d).applyMatrix4(M);
      for (let t = 0; t < nt; t++) {
        get(idx ? idx[t * 3] : t * 3, A); get(idx ? idx[t * 3 + 1] : t * 3 + 1, B); get(idx ? idx[t * 3 + 2] : t * 3 + 2, C);
        if (Math.max(A.y, B.y, C.y) < yb || Math.min(A.y, B.y, C.y) > yt) continue;
        const L = Math.max(A.distanceTo(B), B.distanceTo(C), C.distanceTo(A)), n = Math.min(60, Math.ceil(L / (CELL * .5)) + 1);
        for (let i = 0; i <= n; i++) for (let j = 0; j <= n - i; j++) {
          const u = i / n, w = j / n; q.copy(A).multiplyScalar(1 - u - w).addScaledVector(B, u).addScaledVector(C, w);
          if (q.y < yb || q.y > yt) continue; occ.set(Math.floor(q.x / CELL) + ',' + Math.floor(q.z / CELL), 1);
        }
      }
    });
    return occ;
  }
  // junta células vizinhas em retângulos (menos caixas de colisão)
  function rects(occ) {
    const cells = [...occ.keys()].map(k => k.split(',').map(Number)), set = new Set(occ.keys()), used = new Set(), out = [];
    cells.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
    for (const [x, z] of cells) { const k = x + ',' + z; if (used.has(k)) continue;
      let w = 1; while (set.has((x + w) + ',' + z) && !used.has((x + w) + ',' + z)) w++;
      let h = 1; for (;;) { let ok = true; for (let i = 0; i < w; i++) { const kk = (x + i) + ',' + (z + h); if (!set.has(kk) || used.has(kk)) { ok = false; break; } } if (!ok) break; h++; }
      for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) used.add((x + i) + ',' + (z + j));
      out.push([x * CELL, z * CELL, (x + w) * CELL, (z + h) * CELL]); }
    return out;
  }
  DZB.scan = scan; DZB.rects = rects;
  // posição local da construção -> mundo (rotação em múltiplos de 90°)
  const L2W = (b, x, z) => { const c = Math.cos(b.g.rotation.y), sn = Math.sin(b.g.rotation.y); return [b.g.position.x + x * c + z * sn, b.g.position.z - x * sn + z * c]; };
  function boxW(b, x0, z0, x1, z1, yb, yt) { const p = L2W(b, x0, z0), q = L2W(b, x1, z1); return addBox({ x0: Math.min(p[0], q[0]), x1: Math.max(p[0], q[0]), z0: Math.min(p[1], q[1]), z1: Math.max(p[1], q[1]), w: 1, yb: b.g.position.y + yb, yt: b.g.position.y + yt }); }
  const deqA = P => { const a = P.array; return !P.normalized ? 1 : a instanceof Int16Array ? 32767 : a instanceof Uint16Array ? 65535 : a instanceof Int8Array ? 127 : a instanceof Uint8Array ? 255 : 1; };
  // PORTA: acha o vão nas paredes principais (material "Corpus"), recorta a folha da porta do modelo
  // e monta uma porta que gira na dobradiça. Paredes viram caixas de colisão; o vão fica livre.
  function furnish(b, s) {
    const g = b.g, cfg = MODELS[b.model] || {}, isGlass = o => !!(cfg.glass && cfg.glass.test(o.material && o.material.name)), isWall = o => cfg.wall ? cfg.wall.test(o.material && o.material.name) : !isGlass(o);
    const logs = scan(g, .15, .7, o => !isWall(o));
    let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (const k of logs.keys()) { const [x, z] = k.split(',').map(Number); x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); }
    // procura o maior vão em cada uma das 4 paredes (2 células de espessura)
    let door = null; const findDoor = !!cfg.wall;
    const tryLine = (along, fixedA, fixedB, a0, a1, vert) => { let run = 0, start = 0;
      for (let a = a0 + 2; a <= a1 - 1; a++) { const has = [fixedA, fixedB].some(f => logs.has(vert ? f + ',' + a : a + ',' + f));
        if (!has) { if (!run) start = a; run++; } else { if (run >= 2 && (!door || run > door.n)) door = { n: run, a0: start, a1: start + run, f: fixedA, vert }; run = 0; } } };
    if (findDoor) { tryLine(0, x0, x0 + 1, z0, z1, true); tryLine(0, x1, x1 - 1, z0, z1, true); tryLine(0, z0, z0 + 1, x0, x1, false); tryLine(0, z1, z1 - 1, x0, x1, false); }
    const C = CELL, wallT = 2 * C;
    let D = null;
    if (door) {
      // vão em metros (um pouco mais largo: a folha costuma encostar nas toras)
      const w0 = door.a0 * C - .15, w1 = door.a1 * C + .15, f0 = Math.min(door.f, door.f + (door.f === x0 || door.f === z0 ? 1 : -1)) * C - .25, f1 = f0 + wallT + .5;
      const inGap = (x, z) => door.vert ? (x > f0 && x < f1 && z > w0 && z < w1) : (z > f0 && z < f1 && x > w0 && x < w1);
      // recorta os triângulos da folha (fora as toras) que estão no vão, abaixo de 2,3 m
      const inv = new T.Matrix4().copy(g.matrixWorld).invert(), v = new T.Vector3(), parts = [];
      g.traverse(o => {
        if (!o.isMesh || isWall(o) || !o.geometry) return; const ge = o.geometry, P = ge.attributes.position, d = deqA(P), N = ge.attributes.normal, dn = N ? deqA(N) : 1, U = ge.attributes.uv, du = U ? deqA(U) : 1;
        const M = new T.Matrix4().multiplyMatrices(inv, o.matrixWorld), NM = new T.Matrix3().getNormalMatrix(M), idx = ge.index ? ge.index.array : null, nt = (idx ? idx.length : P.count) / 3, keep = [], take = [];
        for (let t = 0; t < nt; t++) { const tri = [0, 1, 2].map(k => idx ? idx[t * 3 + k] : t * 3 + k); let ok = true;
          for (const i of tri) { v.set(P.getX(i) / d, P.getY(i) / d, P.getZ(i) / d).applyMatrix4(M); if (!inGap(v.x, v.z) || v.y > 2.3) { ok = false; break; } }
          (ok ? take : keep).push(...tri); }
        if (!take.length) return;
        const pp = new Float32Array(take.length * 3), nn = new Float32Array(take.length * 3), uu = new Float32Array(take.length * 2);
        take.forEach((i, j) => { v.set(P.getX(i) / d, P.getY(i) / d, P.getZ(i) / d).applyMatrix4(M); pp[j * 3] = v.x; pp[j * 3 + 1] = v.y; pp[j * 3 + 2] = v.z;
          if (N) { v.set(N.getX(i) / dn, N.getY(i) / dn, N.getZ(i) / dn).applyMatrix3(NM).normalize(); nn[j * 3] = v.x; nn[j * 3 + 1] = v.y; nn[j * 3 + 2] = v.z; }
          if (U) { uu[j * 2] = U.getX(i) / du; uu[j * 2 + 1] = U.getY(i) / du; } });
        const ng = new T.BufferGeometry(); ng.setAttribute('position', new T.BufferAttribute(pp, 3)); ng.setAttribute('normal', new T.BufferAttribute(nn, 3)); if (U) ng.setAttribute('uv', new T.BufferAttribute(uu, 2)); if (!N) ng.computeVertexNormals();
        parts.push([ng, o.material]); ge.setIndex(keep);
      });
      // porta: pivô na dobradiça (ponta do vão), folha gira para dentro
      const hingeA = w0 + .15, piv = new T.Group(), fc = (f0 + f1) / 2;
      if (door.vert) piv.position.set(fc, 0, hingeA); else piv.position.set(hingeA, 0, fc);
      for (const [ng, m] of parts) { ng.translate(-piv.position.x, 0, -piv.position.z); ng.computeBoundingSphere(); const me = new T.Mesh(ng, m); me.castShadow = true; me.receiveShadow = true; piv.add(me); }
      g.add(piv);
      const gc = L2W(b, door.vert ? fc : (w0 + w1) / 2, door.vert ? (w0 + w1) / 2 : fc);
      const bx = door.vert ? boxW(b, f0 + .2, w0 + .1, f1 - .2, w1 - .1, 0, 2.3) : boxW(b, w0 + .1, f0 + .2, w1 - .1, f1 - .2, 0, 2.3);
      D = { piv, x: gc[0], z: gc[1], open: 0, a: 0, bx, sign: 1 }; bx.door = D; doors.push(D);
      b.door = { vert: door.vert, w0, w1, f0, f1 };
    }
    // PAREDES (colisão): tudo que bloqueia na altura das pernas, menos vidros/portas e o vão da porta
    const walls = scan(g, .2, 1.4, o => isGlass(o) || o.parent === (D && D.piv));
    // vão de passagem com pelo menos 1,1 m (o corpo do personagem tem 0,45 m de raio)
    if (b.door) { const q = b.door, m = (q.w0 + q.w1) / 2, hw = Math.max(.55, (q.w1 - q.w0) / 2) + C / 2;
      for (const k of [...walls.keys()]) { const [x, z] = k.split(',').map(Number), cx = (x + .5) * C, cz = (z + .5) * C; if (q.vert ? (cx > q.f0 && cx < q.f1 && Math.abs(cz - m) < hw) : (cz > q.f0 && cz < q.f1 && Math.abs(cx - m) < hw)) walls.delete(k); } }
    // paredes na altura toda da construção (bloqueiam tiros e visão)
    for (const r of rects(walls)) boxW(b, r[0], r[1], r[2], r[3], 0, Math.max(3.2, b.size.y * .9));
    // PISO de madeira por dentro + área da construção (grama não nasce dentro, câmera não atravessa paredes, bots sabem entrar)
    const ix0 = (x0 + 2) * C, ix1 = (x1 - 1) * C, iz0 = (z0 + 2) * C, iz1 = (z1 - 1) * C;
    if (D) { const fl = new T.Mesh(new T.BoxGeometry(ix1 - ix0, .06, iz1 - iz0), floorMat()); fl.position.set((ix0 + ix1) / 2, .03, (iz0 + iz1) / 2); fl.receiveShadow = true; g.add(fl); }
    const a = L2W(b, x0 * C, z0 * C), c2 = L2W(b, (x1 + 1) * C, (z1 + 1) * C);
    const fp = { x0: Math.min(a[0], c2[0]), x1: Math.max(a[0], c2[0]), z0: Math.min(a[1], c2[1]), z1: Math.max(a[1], c2[1]), door: D };
    if (D && b.door) { const q = b.door, out = q.vert ? (q.f0 < (x0 + x1) / 2 * C ? -1.6 : 1.6) : (q.f0 < (z0 + z1) / 2 * C ? -1.6 : 1.6), m = (q.w0 + q.w1) / 2, f = (q.f0 + q.f1) / 2;
      const o_ = q.vert ? L2W(b, f + out, m) : L2W(b, m, f + out), i_ = q.vert ? L2W(b, f - out, m) : L2W(b, m, f - out); fp.ox = o_[0]; fp.oz = o_[1]; fp.ix = i_[0]; fp.iz = i_[1]; }
    FP.push(fp); b.fp = fp;
    // lugares para o loot no futuro: cantos internos
    b.spots = [[ix0 + .8, iz0 + .8], [ix1 - .8, iz1 - .8], [ix0 + .8, iz1 - .8]].map(p => L2W(b, p[0], p[1]));
  }
  let _fm = null;
  function floorMat() {
    if (_fm) return _fm; const c = document.createElement('canvas'); c.width = 256; c.height = 256; const x = c.getContext('2d');
    for (let i = 0; i < 8; i++) { x.fillStyle = 'hsl(' + (26 + Math.random() * 6) + ',' + (32 + Math.random() * 10) + '%,' + (26 + Math.random() * 8) + '%)'; x.fillRect(0, i * 32, 256, 31); x.fillStyle = 'rgba(0,0,0,.45)'; x.fillRect(0, i * 32 + 31, 256, 1); x.fillRect(((i * 97) % 200) + 20, i * 32, 2, 32); }
    for (let i = 0; i < 2500; i++) { x.fillStyle = 'rgba(0,0,0,' + Math.random() * .12 + ')'; x.fillRect(Math.random() * 256, Math.random() * 256, 12 + Math.random() * 30, 1); }
    const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(3, 3);
    return _fm = new T.MeshStandardMaterial({ map: t, roughness: .85 });
  }
  function place(b) {
    const src = SRC[b.model]; if (!src) return;
    const s = src.clone(true), g = new T.Group(), al = new T.Group(); al.add(s); g.add(al);
    // 1) alinha as paredes com os eixos: testa ângulos e fica com o que dá a menor "caixa" em volta das paredes
    const cfg = MODELS[b.model] || {};
    // escala para o tamanho real
    if (cfg.len) { s.updateMatrixWorld(true); const b0 = new T.Box3().setFromObject(s), sz = b0.getSize(new T.Vector3()); s.scale.multiplyScalar(cfg.len / Math.max(sz.x, sz.z)); }
    if (b.align == null) {
      const occ = scan(al, .3, 1.2, o => !!(cfg.glass && cfg.glass.test(o.material && o.material.name))), pts = [...occ.keys()].map(k => k.split(',').map(Number));
      let best = 0, bestA = 1e18; for (let a = 0; a < 90; a += .5) { const r = a * Math.PI / 180, c = Math.cos(r), sn = Math.sin(r); let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
        for (const [x, z] of pts) { const X = x * c - z * sn, Z = x * sn + z * c; if (X < x0) x0 = X; if (X > x1) x1 = X; if (Z < z0) z0 = Z; if (Z > z1) z1 = Z; }
        const A_ = (x1 - x0) * (z1 - z0); if (A_ < bestA) { bestA = A_; best = r; } }
      b.align = best;
    }
    al.rotation.y = -b.align;
    // 2) centraliza no chão: base do modelo em y=0, centro em x/z
    al.updateMatrixWorld(true); const bb = new T.Box3().setFromObject(al), c = bb.getCenter(new T.Vector3());
    al.position.set(-c.x, -bb.min.y, -c.z);
    s.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; if (o.material) o.material.side = T.DoubleSide; } });
    g.position.set(b.x, TERH(b.x, b.z), b.z); g.rotation.y = b.rot || 0; sc.add(g);
    b.g = g; b.size = bb.getSize(new T.Vector3()); DZB.list.push(b);
    try { furnish(b, s); } catch (e) { console.warn('construção: interior/colisão', e); }
    if (typeof b.onPlace === 'function') b.onPlace(b);
  }
  for (const k in MODELS) if ((typeof BLDS !== 'undefined' ? BLDS : []).some(b => b.model === k)) new T.GLTFLoader().load(MODELS[k].url, gl => {
    SRC[k] = gl.scene; for (const b of (typeof BLDS !== 'undefined' ? BLDS : [])) if (b.model === k) place(b);
  }, undefined, e => console.warn('construção', k, e));
})();
