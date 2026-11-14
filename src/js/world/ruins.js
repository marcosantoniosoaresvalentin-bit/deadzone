/* Deadzone · world/ruins.js
 * LOCAIS EM RUÍNAS e construções diferentes, espalhados longe das cidades:
 *  - Vila Abandonada: ruas de casas desabadas (paredes quebradas, entulho, vigas caídas, poço)
 *  - Igreja Velha: nave sem teto, fachada com porta em arco e torre do sino partida
 *  - Forte Antigo: muralha de pedra com torres quebradas e uma fortaleza no meio
 *  - Fábrica Velha: galpão de tijolos sem teto, chaminé alta e tanques enferrujados
 *  - Faróis na costa
 * Paredes têm colisão (seguram tiro e jogador); cada local tem loot. Tudo é uma malha por local e some de longe.
 */
(function () {
  if (typeof MAPB === 'undefined' || typeof coastMain === 'undefined') return;
  let sd = 8123; const r = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; }, R = (a, b) => a + r() * (b - a);
  const LK = window.DZLAKES || [], PLC = FLATS.map(A => [(A.x0 + A.x1) / 2, (A.z0 + A.z1) / 2, Math.max(A.x1 - A.x0, A.z1 - A.z0) / 2 + 150]);
  const RP = []; try { for (const Rd of ROADS) for (let i = 0; i < Rd.pts.length; i += 4) RP.push(Rd.pts[i]); } catch (e) { }
  const nearRoad = (x, z, d) => RP.some(q => Math.hypot(q[0] - x, q[1] - z) < d);
  const slope = (x, z) => Math.max(Math.abs(TERH(x + 6, z) - TERH(x - 6, z)), Math.abs(TERH(x, z + 6) - TERH(x, z - 6))) / 12;
  const free = (x, z, rad) => { if (coastMain(x, z) < 380 + rad || TERH(x, z) < 2.2 || slope(x, z) > .13) return false;
    for (const q of PLC) if (Math.hypot(q[0] - x, q[1] - z) < q[2] + rad) return false;
    for (const K of LK) if (Math.hypot(x - K.x, z - K.z) < K.r * 2.5 + rad) return false;
    if (nearRoad(x, z, rad * .5 + 30)) return false; return true; };
  const MAT = new T.MeshStandardMaterial({ vertexColors: true, roughness: .96, metalness: 0 });
  const CUL = [];
  // ---------- construtor de malha (caixas coloridas, juntas por local) ----------
  function Mesh() {
    const P = [], N = [], C = [], tc = new T.Color();
    const FACES = [[1, 0, 0, [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]]], [-1, 0, 0, [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]]], [0, 1, 0, [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]]], [0, -1, 0, [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]]], [0, 0, 1, [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]]], [0, 0, -1, [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]]]];
    const o = new T.Object3D(), v = new T.Vector3();
    // caixa girada: centro (x,y,z), tamanho (sx,sy,sz), giro ry/rz
    function box(x, y, z, sx, sy, sz, ry, col, rz) {
      o.position.set(x, y, z); o.rotation.set(0, ry || 0, rz || 0); o.scale.set(sx, sy, sz); o.updateMatrix(); tc.set(col).convertSRGBToLinear();
      const sh = .86 + r() * .22; const m3 = new T.Matrix3().getNormalMatrix(o.matrix);
      for (const [nx, ny, nz, vs] of FACES) { const nn = new T.Vector3(nx, ny, nz).applyMatrix3(m3).normalize();
        for (const k of [0, 1, 2, 0, 2, 3]) { const q = vs[k]; v.set(q[0] - .5, q[1] - .5, q[2] - .5).applyMatrix4(o.matrix); P.push(v.x, v.y, v.z); N.push(nn.x, nn.y, nn.z); C.push(tc.r * sh, tc.g * sh, tc.b * sh); } } }
    // caixa alinhada pelos cantos (com colisão opcional)
    function bx(x0, y0, z0, x1, y1, z1, col, solid) { box((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, x1 - x0, y1 - y0, z1 - z0, 0, col); if (solid) addBox({ x0: Math.min(x0, x1), x1: Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1), yb: y0 - .5, yt: y1, w: 1 }); }
    function cyl(x, y, z, rt, rb, h, col, seg) { const g = new T.CylinderGeometry(rt, rb, h, seg || 12).toNonIndexed(), pa = g.attributes.position, na = g.attributes.normal; tc.set(col).convertSRGBToLinear();
      for (let i = 0; i < pa.count; i++) { P.push(pa.getX(i) + x, pa.getY(i) + y, pa.getZ(i) + z); N.push(na.getX(i), na.getY(i), na.getZ(i)); C.push(tc.r, tc.g, tc.b); } }
    function done(cx, cz, rad) { if (!P.length) return null; const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new T.Float32BufferAttribute(N, 3)); g.setAttribute('color', new T.Float32BufferAttribute(C, 3)); g.computeBoundingSphere();
      const m = new T.Mesh(g, MAT); m.castShadow = true; m.receiveShadow = true; m.matrixAutoUpdate = false; m.frustumCulled = true; sc.add(m);
      try { const e = { o: m, x: cx, z: cz, r: rad }; if (window.DZPERF && DZPERF.CULL) DZPERF.CULL.push(e); else (window.__dzVegCull = window.__dzVegCull || []).push(e); } catch (e) { } return m; }
    return { box, bx, cyl, done };
  }
  const STONE = [0x8c877b, 0x9a9488, 0x7d786d, 0xa39c8d], BRICK = [0x8a4a38, 0x9a5540, 0x7a4032, 0xa05d46], PLAS = [0xc9bca3, 0xd3c8b2, 0xb9ac95, 0xcfc0a5], WOOD = 0x3d2f24, CHAR = 0x2a2623, MOSS = 0x5d6b45;
  const pick = a => a[Math.floor(r() * a.length)];
  // parede quebrada: de a até b (eixo X se horizontal), altura variando em degraus, com vãos de porta/janela
  function wall(M, ax, az, bx, bz, hMax, th, pal, o) {
    o = o || {}; const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(L / 1.7)), ux = (bx - ax) / L, uz = (bz - az) / L, hor = Math.abs(ux) > Math.abs(uz);
    let gapAt = o.gaps || [], lastH = hMax * R(.5, 1);
    for (let i = 0; i < n; i++) {
      const t0 = i / n, t1 = (i + 1) / n, x0 = ax + (bx - ax) * t0, z0 = az + (bz - az) * t0, x1 = ax + (bx - ax) * t1, z1 = az + (bz - az) * t1, mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
      const y = TERH(mx, mz) - .4, inGap = gapAt.some(g => t0 >= g[0] - .001 && t1 <= g[1] + .001);
      let h = Math.max(.35, Math.min(hMax, lastH + R(-1.6, 1.6))); if (o.tall && (i === 0 || i === n - 1)) h = hMax; if (o.low) h *= .55; lastH = h;
      const pe = Math.min(x0, x1) - (hor ? 0 : th / 2), pe2 = Math.max(x0, x1) + (hor ? 0 : th / 2), pz = Math.min(z0, z1) - (hor ? th / 2 : 0), pz2 = Math.max(z0, z1) + (hor ? th / 2 : 0);
      if (inGap) { // vão: só o peitoril baixo (janela) ou nada (porta); verga solta por cima
        if (o.window) M.bx(pe, y, pz, pe2, y + 1.0, pz2, pick(pal), 1); continue; }
      M.bx(pe, y, pz, pe2, y + h + .4, pz2, pick(pal), 1);
      if (r() < .25) M.box(mx + R(-.3, .3), y + h + .5, mz + R(-.3, .3), R(.3, .9), R(.2, .5), R(.3, .9), r() * 3, pick(pal));        // pedras soltas no topo
      if (o.moss && r() < .3) M.bx(pe - .02, y, pz - .02, pe2 + .02, y + .5, pz2 + .02, MOSS, 0);
    }
  }
  const rubble = (M, cx, cz, rad, n, pal) => { for (let i = 0; i < n; i++) { const a = r() * 6.283, d = Math.sqrt(r()) * rad, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d, s = R(.25, 1.1); M.box(x, TERH(x, z) + s * .25, z, s * R(.8, 1.6), s * R(.4, 1), s * R(.8, 1.6), r() * 3, r() < .15 ? CHAR : pick(pal || STONE), r() * .5); } };
  const beams = (M, cx, cz, n) => { for (let i = 0; i < n; i++) { const x = cx + R(-4, 4), z = cz + R(-3, 3), len = R(2.5, 5); M.box(x, TERH(x, z) + R(.3, 1.6), z, len, .18, .22, r() * 3.14, WOOD, R(-.5, .5)); } };
  const loot = (x, z, n, rich) => { for (let i = 0; i < n; i++) LS.push({ x: x + R(-3, 3), z: z + R(-3, 3), y: null, rich: !!rich }); };
  const label = (n, x, z) => { try { if (typeof MAPNAMES !== 'undefined') MAPNAMES.push({ n, x, z }); } catch (e) { } };
  const placed = [];
  function site(rad, tries) { for (let k = 0; k < (tries || 400); k++) { const x = R(-MAPH * .92, MAPH * .92), z = R(-MAPH * .92, MAPH * .92); if (!free(x, z, rad)) continue; if (placed.some(q => Math.hypot(q[0] - x, q[1] - z) < 700)) continue; placed.push([x, z]); return [x, z]; } return null; }

  // ---------- casa em ruínas ----------
  function ruinHouse(M, cx, cz, w, d, ry) {
    const y = TERH(cx, cz), hh = R(2.6, 5.2), c = r() < .5 ? BRICK : PLAS, x0 = cx - w / 2, x1 = cx + w / 2, z0 = cz - d / 2, z1 = cz + d / 2;
    // chão: pedaços de laje
    for (let i = 0; i < 4; i++) if (r() < .75) M.bx(x0 + (i % 2) * w / 2 + .3, y + .02, z0 + (i >> 1) * d / 2 + .3, x0 + (i % 2) * w / 2 + w / 2 - .4, y + .16, z0 + (i >> 1) * d / 2 + d / 2 - .4, 0x6f6a60, 0);
    const gp = () => { const a = R(.15, .7); return [[a, a + R(.14, .22)]]; };
    wall(M, x0, z0, x1, z0, hh, .35, c, { gaps: gp(), window: r() < .6, tall: r() < .6, moss: 1 });
    wall(M, x0, z1, x1, z1, hh * R(.5, 1), .35, c, { gaps: gp(), window: 1, moss: 1 });
    wall(M, x0, z0, x0, z1, hh * R(.4, 1), .35, c, { gaps: r() < .5 ? gp() : [], window: 1, low: r() < .3 });
    wall(M, x1, z0, x1, z1, hh * R(.3, 1), .35, c, { low: r() < .5 });
    // pedaço de telhado caído e vigas
    if (r() < .7) { const rx = cx + R(-w * .25, w * .25), rz = cz + R(-d * .25, d * .25); M.box(rx, y + R(.7, 1.6), rz, R(3, 5), .14, R(2, 3.5), r() * 3.14, 0x6b3f2e, R(-.35, .35)); }
    beams(M, cx, cz, 2 + Math.floor(r() * 3)); rubble(M, cx, cz, Math.max(w, d) * .75, 10 + Math.floor(r() * 10), c === BRICK ? BRICK : STONE);
    if (r() < .4) { const bx = cx + R(-1, 1), bz = cz + R(-1, 1); M.cyl(bx, y + .9, bz, .5, .5, 1.8, 0x4a4540, 8); }     // restos de fogão/cisterna
  }
  // ---------- 1) vilas abandonadas ----------
  const VIL = ['Vila Abandonada', 'Povoado Esquecido', 'Aldeia Velha'];
  for (let v = 0; v < 3; v++) { const s = site(260); if (!s) continue; const M = Mesh(), [sx, sz] = s, ang = Math.floor(r() * 2) * Math.PI / 2;
    const ux = Math.cos(ang), uz = Math.sin(ang);
    for (let k = -3; k <= 3; k++) for (const side of [-1, 1]) { if (r() < .22) continue; const along = k * 27 + R(-3, 3), off = side * R(16, 20), x = sx + ux * along - uz * off, z = sz + uz * along + ux * off;
      if (!free(x, z, 14)) continue; ruinHouse(M, x, z, R(8, 12), R(7, 10)); if (r() < .3) loot(x, z, 1, 0); }
    // poço no meio, carroça e árvore queimada
    M.cyl(sx, TERH(sx, sz) + .5, sz, 1.1, 1.3, 1, 0x7d786d, 10); M.cyl(sx, TERH(sx, sz) + .12, sz, .8, .8, .2, 0x1a2a3a, 10);
    for (let i = 0; i < 3; i++) { const x = sx + R(-22, 22), z = sz + R(-6, 6); M.box(x, TERH(x, z) + .6, z, 2.4, .12, 1.3, r() * 3, WOOD); for (const sw of [-1, 1]) M.cyl(x + sw * .9, TERH(x, z) + .5, z + .7, .5, .5, .14, 0x2a2623, 8); }
    M.done(sx, sz, 230); loot(sx, sz, 5, 0); label(VIL[v], sx, sz); }
  // ---------- 2) igrejas velhas ----------
  for (let v = 0; v < 3; v++) { const s = site(90); if (!s) continue; const M = Mesh(), [cx, cz] = s, rot = Math.floor(r() * 2);
    const W = 9, Lg = 22, x0 = cx - W / 2, x1 = cx + W / 2, z0 = cz - Lg / 2, z1 = cz + Lg / 2, st = STONE;
    M.bx(x0 - 1, TERH(cx, cz), z0 - 1, x1 + 1, TERH(cx, cz) + .25, z1 + 1, 0x716d63, 0);                           // adro
    // nave: paredes laterais com janelas altas, fachada com porta em arco, abside caída
    wall(M, x0, z0, x0, z1, 7, .6, st, { gaps: [[.14, .22], [.34, .42], [.54, .62], [.74, .82]], window: 0, tall: 1, moss: 1 });
    wall(M, x1, z0, x1, z1, 6, .6, st, { gaps: [[.14, .22], [.34, .42], [.54, .62], [.74, .82]], window: 0, tall: 1, moss: 1 });
    wall(M, x0, z1, x1, z1, 9.5, .7, st, { gaps: [[.38, .62]], tall: 1 });                                          // fachada (porta larga)
    wall(M, x0, z0, x1, z0, 4, .6, st, { low: 1, moss: 1 });
    { const y = TERH(cx, z1) - .4; M.bx(x0 + 2.8, y + 3.4, z1 - .4, x1 - 2.8, y + 4.2, z1 + .4, 0x8c877b, 1); M.bx(cx - 2, y + 9.5, z1 - .4, cx + 2, y + 11.2, z1 + .4, 0x8c877b, 1); M.bx(cx - .9, y + 11.2, z1 - .35, cx + .9, y + 12.2, z1 + .35, 0x8c877b, 0); } // verga e empena
    // torre do sino partida (canto)
    { const tx = x1 + 2.2, tz = z1 - 2.5; wall(M, tx - 2.5, tz - 2.5, tx + 2.5, tz - 2.5, 13, .7, st, { tall: 1 }); wall(M, tx - 2.5, tz + 2.5, tx + 2.5, tz + 2.5, 11, .7, st, { tall: 1 }); wall(M, tx - 2.5, tz - 2.5, tx - 2.5, tz + 2.5, 14.5, .7, st, { tall: 1 }); wall(M, tx + 2.5, tz - 2.5, tx + 2.5, tz + 2.5, 9, .7, st, { tall: 1 });
      M.cyl(tx, TERH(tx, tz) + .6, tz, .8, 1.1, 1.2, 0x6b5a2c, 10); }
    // bancos tombados, colunas caídas
    for (let i = 0; i < 6; i++) { const z = z0 + 4 + i * 2.6; for (const sx of [-1, 1]) if (r() < .7) M.box(cx + sx * 2, TERH(cx, z) + .35, z, 2.2, .7, .5, R(-.3, .3), WOOD); }
    for (let i = 0; i < 2; i++) M.box(cx + R(-2, 2), TERH(cx, cz) + .5, cz + R(-4, 4), 5, .8, .8, R(0, 3), 0x9a9488, R(-.2, .2));
    rubble(M, cx, cz, 9, 22, st); beams(M, cx, cz, 4);
    M.done(cx, cz, 60); loot(cx, cz, 5, 1); label('Igreja Velha', cx, cz); }
  // ---------- 3) fortes antigos ----------
  for (let v = 0; v < 2; v++) { const s = site(130); if (!s) continue; const M = Mesh(), [cx, cz] = s, H = 20, x0 = cx - H * 1.1, x1 = cx + H * 1.1, z0 = cz - H * 1.1, z1 = cz + H * 1.1, st = STONE;
    wall(M, x0, z0, x1, z0, 5, 1, st, { gaps: [[.4, .6]], tall: 1, moss: 1 }); wall(M, x0, z1, x1, z1, 5, 1, st, { tall: 1, moss: 1 }); wall(M, x0, z0, x0, z1, 4.6, 1, st, { gaps: [[.7, .78]], tall: 1, moss: 1 }); wall(M, x1, z0, x1, z1, 5, 1, st, { low: r() < .4, tall: 1, moss: 1 });
    for (const [tx, tz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) { const th = R(7, 10); wall(M, tx - 3, tz - 3, tx + 3, tz - 3, th, 1, st, { tall: 1 }); wall(M, tx - 3, tz + 3, tx + 3, tz + 3, th * R(.6, 1), 1, st, { tall: 1 }); wall(M, tx - 3, tz - 3, tx - 3, tz + 3, th * R(.5, 1), 1, st, { tall: 1 }); wall(M, tx + 3, tz - 3, tx + 3, tz + 3, th, 1, st, { tall: 1 }); }
    // fortaleza central
    { const k = 7; wall(M, cx - k, cz - k, cx + k, cz - k, 7, 1.1, st, { gaps: [[.42, .58]], tall: 1 }); wall(M, cx - k, cz + k, cx + k, cz + k, 6, 1.1, st, { tall: 1 }); wall(M, cx - k, cz - k, cx - k, cz + k, 7.5, 1.1, st, { tall: 1 }); wall(M, cx + k, cz - k, cx + k, cz + k, 5.5, 1.1, st, { tall: 1 }); }
    for (let i = 0; i < 6; i++) { const x = cx + R(-15, 15), z = cz + R(-15, 15); M.box(x, TERH(x, z) + .5, z, 1.6, 1, 1.6, 0, 0x6b5238); }   // barris
    rubble(M, cx, cz, 26, 40, st); beams(M, cx, cz, 5);
    M.done(cx, cz, 110); loot(cx, cz, 9, 1); label('Forte Antigo', cx, cz); }
  // ---------- 4) fábricas velhas ----------
  for (let v = 0; v < 2; v++) { const s = site(110); if (!s) continue; const M = Mesh(), [cx, cz] = s, W = 30, D = 16, x0 = cx - W / 2, x1 = cx + W / 2, z0 = cz - D / 2, z1 = cz + D / 2;
    wall(M, x0, z0, x1, z0, 8, .5, BRICK, { gaps: [[.1, .2], [.3, .4], [.55, .65], [.78, .9]], window: 1, tall: 1 }); wall(M, x0, z1, x1, z1, 8, .5, BRICK, { gaps: [[.08, .18], [.34, .44], [.6, .7]], window: 1, tall: 1 });
    wall(M, x0, z0, x0, z1, 8, .5, BRICK, { gaps: [[.3, .7]], tall: 1 }); wall(M, x1, z0, x1, z1, 6, .5, BRICK, { low: r() < .5, tall: 1 });
    // estrutura de aço do teto (vigas expostas) e telhado parcial
    for (let i = 0; i <= 6; i++) { const x = x0 + i * W / 6; if (r() < .8) { const y = TERH(x, cz) + 7.6; M.bx(x - .15, y, z0, x + .15, y + .3, z1, 0x5a463a, 0); } }
    M.box(cx - 6, TERH(cx, cz) + 7.9, cz, 10, .12, D, 0, 0x5c5249, 0); M.box(cx + 8, TERH(cx, cz) + 3.2, cz - 2, 6, .12, 5, .3, 0x5c5249, .5);
    // chaminé
    { const hx = x1 + 6, hz = cz - 4, y = TERH(hx, hz); M.cyl(hx, y + 13, hz, 1.2, 1.9, 26, 0x8a4a38, 14); M.cyl(hx, y + 26, hz, 1.45, 1.3, .6, 0x2a2623, 14); addBox({ x0: hx - 1.9, x1: hx + 1.9, z0: hz - 1.9, z1: hz + 1.9, yb: y - 1, yt: y + 26, w: 1 }); }
    // tanques enferrujados e tubulações
    for (const [tx, tz, tr] of [[x0 - 7, cz - 4, 3], [x0 - 7, cz + 5, 2.4]]) { const y = TERH(tx, tz); M.cyl(tx, y + 3.2, tz, tr, tr, 6.4, 0x7a4a2a, 16); addBox({ x0: tx - tr, x1: tx + tr, z0: tz - tr, z1: tz + tr, yb: y - 1, yt: y + 6.4, w: 1 }); }
    for (let i = 0; i < 5; i++) { const x = cx + R(-12, 12), z = cz + R(-5, 5), y = TERH(x, z); M.bx(x - .9, y, z - .9, x + .9, y + 1.8, z + .9, pick([0x4d5a3a, 0x6b3f2e, 0x37506b]), 1); }
    rubble(M, cx, cz, 16, 26, BRICK);
    M.done(cx, cz, 95); loot(cx, cz, 7, 1); label('Fábrica Velha', cx, cz); }
  // ---------- 5) faróis na costa ----------
  for (const a of [.6, 2.4, 4.1, 5.4]) { const c = coastAt(Math.cos(a), Math.sin(a), 0, 0), x = c[0] - Math.cos(a) * 40, z = c[1] - Math.sin(a) * 40; if (TERH(x, z) < 1.2 || TERH(x, z) > 18 || placed.some(q => Math.hypot(q[0] - x, q[1] - z) < 300)) continue;
    placed.push([x, z]); const M = Mesh(), y = TERH(x, z); for (let i = 0; i < 6; i++) M.cyl(x, y + 2.2 + i * 4.4, z, 2.4 - i * .18, 2.6 - i * .18, 4.4, i % 2 ? 0xc0302a : 0xe8e4d8, 14);
    M.cyl(x, y + 28.4, z, 2.7, 2.7, .4, 0x2a2623, 14); M.cyl(x, y + 30.2, z, 1.6, 1.6, 3.2, 0xd8e8f0, 12); M.cyl(x, y + 32.4, z, 2.2, .3, 1.4, 0x2a2623, 12);
    addBox({ x0: x - 2.6, x1: x + 2.6, z0: z - 2.6, z1: z + 2.6, yb: y - 1, yt: y + 28, w: 1 }); M.done(x, z, 40); label('Farol', x, z); }
})();
