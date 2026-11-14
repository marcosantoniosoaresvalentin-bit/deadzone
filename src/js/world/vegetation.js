/* Deadzone · world/vegetation.js
 * VEGETAÇÃO e detalhes dos campos (antes o mapa era só grama):
 *  - Bosques de árvores e pinheiros em manchas (como floresta de verdade), árvores soltas nos campos,
 *    arbustos e pedras. Desenhados por instância (poucos desenhos por quadro mesmo com centenas).
 *  - Nada em cima de estrada, cidade, local, construção, praia, mar ou pista do planador.
 *  - Troncos e pedras grandes têm colisão (seguram tiro, carro e jogador).
 */
(function () {
  if (!window.DZR || !DZR.tree) return;
  const rnd = (() => { let s = 90211; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; })();
  const M_ = DZR.mats();
  // mancha de floresta: "ruído" suave feito de senos (mais árvores onde é alto)
  const fn = (x, z) => .5 + .2 * Math.sin(x * .021 + Math.sin(z * .017) * 2.1) + .2 * Math.sin(z * .026 + Math.cos(x * .013) * 1.7) + .25 * Math.sin(x * .0023 + Math.cos(z * .0019) * 2.3) * Math.cos(z * .0027);
  // regiões: campo aberto (sem árvore), mata esparsa e floresta densa — em escala de quilômetros
  const biome = (x, z) => .5 + .5 * Math.sin(x * .00125 + Math.sin(z * .00095) * 2.4 + 1.3) * Math.cos(z * .00135 + Math.sin(x * .0008) * 2.1) * .9 + .12 * Math.sin((x + z) * .0031);
  const bmul = (x, z) => { const g = biome(x, z); return g < .42 ? .015 : g < .6 ? .3 : 1; };
  const FLs = (typeof FLATS !== 'undefined' ? FLATS : []);
  const RP = []; try { for (const R of ROADS) for (const q of R.pts) RP.push(q); } catch (e) { }
  const G = new Map(), gk = (x, z) => Math.floor(x / 20) + ',' + Math.floor(z / 20); for (const q of RP) { const k = gk(q[0], q[1]); if (!G.has(k)) G.set(k, []); G.get(k).push(q); }
  function nearRoad(x, z, d) { const i = Math.floor(x / 20), j = Math.floor(z / 20); for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const L = G.get((i + a) + ',' + (j + b)); if (L) for (const q of L) if (Math.hypot(q[0] - x, q[1] - z) < d) return true; } return false; }
  const FPG = new Map(); for (const b of FP) for (let i = Math.floor((b.x0 - 12) / 40); i <= Math.floor((b.x1 + 12) / 40); i++) for (let j = Math.floor((b.z0 - 12) / 40); j <= Math.floor((b.z1 + 12) / 40); j++) { const k = i * 100003 + j; let L = FPG.get(k); if (!L) FPG.set(k, L = []); L.push(b); }
  function free(x, z, m) {
    if (x < MAPB.x0 + 8 || x > MAPB.x1 - 8 || z < MAPB.z0 + 8 || z > MAPB.z1 - 8) return false;
    const h = TERH(x, z); if (h < 1.6) return false; // praia e mar
    for (const A of FLs) if (x > A.x0 - m && x < A.x1 + m && z > A.z0 - m && z < A.z1 + m) return false;
    { const L = FPG.get(Math.floor(x / 40) * 100003 + Math.floor(z / 40)); if (L) for (const b of L) if (x > b.x0 - m && x < b.x1 + m && z > b.z0 - m && z < b.z1 + m) return false; }
    if (nearRoad(x, z, 7 + m * .3)) return false;
    // terreno muito inclinado (encosta da pedreira/morro): só pedra
    return true;
  }
  const slope = (x, z) => Math.max(Math.abs(TERH(x + 2, z) - TERH(x - 2, z)), Math.abs(TERH(x, z + 2) - TERH(x, z - 2))) / 4;

  // ---------- pontos ----------
  const T_ = [], PN = [], BU = [], RK = [];
  const span = [MAPB.x0, MAPB.x1, MAPB.z0, MAPB.z1];
  const OG = new Map(), ok_ = (x, z) => { const i = Math.floor(x / 6), j = Math.floor(z / 6); for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const L = OG.get((i + a) * 100003 + j + b); if (L) for (const q of L) if (Math.abs(q[0] - x) < 5.5 && Math.abs(q[1] - z) < 5.5) return false; } return true; }, addO = q => { const k = Math.floor(q[0] / 6) * 100003 + Math.floor(q[1] / 6); let L = OG.get(k); if (!L) OG.set(k, L = []); L.push(q); };
  for (let i = 0; i < 900000 && (T_.length + PN.length) < 15000; i++) {
    const x = span[0] + rnd() * (span[1] - span[0]), z = span[2] + rnd() * (span[3] - span[2]), f = fn(x, z);
    const dense = f > .68, p = dense ? .95 : f > .52 ? .2 : .04; if (rnd() > p * bmul(x, z)) continue;
    if (!free(x, z, 6) || slope(x, z) > .55) continue;
    if (!ok_(x, z)) continue;
    const q = [x, z, .8 + rnd() * .45, rnd() * 6.283]; addO(q); (TERH(x, z) > 25 || f > .8 ? PN : T_).push(q);
  }
  for (let i = 0; i < 200000 && BU.length < 22000; i++) {
    const x = span[0] + rnd() * (span[1] - span[0]), z = span[2] + rnd() * (span[3] - span[2]);
    if (rnd() > (.25 + fn(x, z) * .6) * (biome(x, z) < .42 ? .2 : 1) || !free(x, z, 2)) continue; BU.push([x, z, .7 + rnd() * .8, rnd() * 6.283]);
  }
  for (let i = 0; i < 160000 && RK.length < 7000; i++) {
    const x = span[0] + rnd() * (span[1] - span[0]), z = span[2] + rnd() * (span[3] - span[2]), sl = slope(x, z);
    if (rnd() > .12 + sl * 1.2 || !free(x, z, 3)) continue; RK.push([x, z, .4 + rnd() * (sl > .4 ? 1.6 : .9), rnd() * 6.283]);
  }

  // ---------- desenho por instância ----------
  const _m = new T.Matrix4(), _q = new T.Quaternion(), _s = new T.Vector3(), _p = new T.Vector3(), UP = new T.Vector3(0, 1, 0);
  // divide em blocos de 120 m: cada bloco some quando fica longe (distância automática do jogo)
  // junta as peças de cada árvore por material (a árvore tinha 49 peças = 49 desenhos por bloco; agora 2 a 4)
  function mergeParts(parts) {
    try { const BU_ = T.BufferGeometryUtils; if (!BU_ || !BU_.mergeBufferGeometries) return parts;
      const by = new Map(); for (const [g, m, w] of parts) { const k = m.uuid + '|' + (w ? 1 : 0); if (!by.has(k)) by.set(k, { m, w, gs: [] }); by.get(k).gs.push(g); }
      const out = []; for (const e of by.values()) { const L = e.gs.map(g => { const q = g.index ? g.toNonIndexed() : g.clone(); return q; });
        const keep = ['position', 'normal', 'uv', 'color'].filter(a => L.every(g => g.attributes[a])); for (const g of L) for (const a of Object.keys(g.attributes)) if (!keep.includes(a)) g.deleteAttribute(a);
        const mg = L.length > 1 ? BU_.mergeBufferGeometries(L) : L[0]; if (!mg) return parts; out.push([mg, e.m, e.w]); }
      return out;
    } catch (e) { return parts; }
  }
  function inst(parts, pts0, sh, sy) {
    parts = mergeParts(parts);
    const B = new Map(); for (const q of pts0) { const k = Math.floor(q[0] / 240) + "," + Math.floor(q[1] / 240); if (!B.has(k)) B.set(k, []); B.get(k).push(q); }
    for (const pts of B.values()) inst1(parts, pts, sh, sy);
  }
  function inst1(parts, pts, sh, sy) {
    let cx = 0, cz = 0; for (const q of pts) { cx += q[0]; cz += q[1]; } cx /= pts.length; cz /= pts.length; let rr = 0; for (const q of pts) rr = Math.max(rr, Math.hypot(q[0] - cx, q[1] - cz)); rr += 8;
    sh = sh && (typeof CFG === 'undefined' || (CFG.q | 0) >= 2);
    for (const [geo, mat, wood] of parts) {
      const im = new T.InstancedMesh(geo, mat, pts.length); im.castShadow = sh; im.receiveShadow = !wood ? false : true;
      pts.forEach((q, i) => { const y = TERH(q[0], q[1]) - .15; _q.setFromAxisAngle(UP, q[3]); _s.set(q[2], q[2] * (sy || 1), q[2]); _p.set(q[0], y, q[1]); _m.compose(_p, _q, _s); im.setMatrixAt(i, _m); });
      im.instanceMatrix.needsUpdate = true; im.computeBoundingSphere && im.computeBoundingSphere(); im.matrixAutoUpdate = false; im.updateMatrix(); im.frustumCulled = false; sc.add(im); VEG.push(im);
      try { if (window.DZPERF && DZPERF.CULL) DZPERF.CULL.push({ o: im, x: cx, z: cz, r: rr }); else (window.__dzVegCull = window.__dzVegCull || []).push({ o: im, x: cx, z: cz, r: rr }); } catch (e) { }
    }
  }
  const VEG = []; window.DZVEG = VEG;
  try {
    // 3 variações de cada tipo para não ficar tudo igual
    const split = (L, n) => { const o = []; for (let k = 0; k < n; k++) o.push(L.filter((_, i) => i % n === k)); return o; };
    // um modelo de cada (tamanho e giro variam por instância): bem menos desenhos por quadro no celular
    if (T_.length) inst(DZR.tree(18), T_, true);
    if (PN.length) inst(DZR.pine(8, 4, 3.7), PN, true);
    if (BU.length) inst([[DZR.bushGeo(), M_.leaf, 0]], BU, false, .8);
    if (RK.length) inst([[DZR.rockGeo(), M_.rock, 1]], RK, true, .7);
  } catch (e) { console.warn('vegetação', e); }

  // ---------- colisão: troncos e pedras grandes ----------
  for (const q of [...T_, ...PN]) { const r = .32 * q[2], y = TERH(q[0], q[1]); addBox({ x0: q[0] - r, x1: q[0] + r, z0: q[1] - r, z1: q[1] + r, yb: y - 1, yt: y + 6, w: 1 }); }
  for (const q of RK) if (q[2] > .9) { const r = q[2] * .75, y = TERH(q[0], q[1]); addBox({ x0: q[0] - r, x1: q[0] + r, z0: q[1] - r, z1: q[1] + r, yb: y - 1, yt: y + q[2] * .7, w: 1 }); }
  window.DZVEGPTS = { trees: T_.length, pines: PN.length, bushes: BU.length, rocks: RK.length };
})();
