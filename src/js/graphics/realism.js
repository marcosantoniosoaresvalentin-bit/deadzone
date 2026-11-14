/* =====================================================================
   DEADZONE · Módulo de realismo
   - Personagens: soldado 3D com esqueleto (skinned mesh) que copia, a cada
     quadro, a pose do esqueleto procedural do jogo (correr, agachar, deitar,
     mirar, paraquedas, morrer...). Assim todas as animações existentes
     continuam funcionando, mas com um corpo humano realista.
   - Vegetação: árvores, pinheiros, arbustos e grama com folhas em alpha.
   - Ambiente: reflexos do céu (PBR), sombras suaves, chão sem repetição,
     água com ondas, reboco das casas.
   ===================================================================== */
(function () {
  'use strict';
  const T = THREE;
  const ASSET = {
    human: 'assets/models/human.glb',
    bag1: 'assets/models/gear/backpack1.glb',
    anim: 'assets/models/animations.glb',
    grass: 'assets/textures/grass.jpg',
    brick: 'assets/textures/brick.jpg',
    water: 'assets/textures/water-normals.jpg'
  };
  const DZR = window.DZR = { rigs: [], ready: false, water: [], lod: 70 };

  /* ---------- utilidades ---------- */
  const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const lin = c => new T.Color(c).convertSRGBToLinear();
  function b64ab(u) { const s = atob(u.slice(u.indexOf(',') + 1)), a = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a.buffer; }
  function canvasTex(w, h, fn, srgb) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h);
    const t = new T.CanvasTexture(c); if (srgb !== false) t.encoding = T.sRGBEncoding; t.anisotropy = 4; return t;
  }
  function imgTex(k, rx, ry) {
    const t = new T.TextureLoader().load(ASSET[k]); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx, ry);
    t.encoding = T.sRGBEncoding; t.anisotropy = 8; return t;
  }
  // geometria "livre" (não indexada) com position/normal/uv/color
  function GB() { return { p: [], n: [], u: [], c: [] }; }
  function gbGeo(b) {
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(b.p, 3));
    g.setAttribute('normal', new T.Float32BufferAttribute(b.n, 3));
    g.setAttribute('uv', new T.Float32BufferAttribute(b.u, 2));
    g.setAttribute('color', new T.Float32BufferAttribute(b.c, 3));
    g.computeBoundingSphere(); return g;
  }
  function gbAddGeo(b, geo, m, col) {
    const g = geo.index ? geo.toNonIndexed() : geo; g.applyMatrix4(m);
    const P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv;
    for (let i = 0; i < P.count; i++) {
      b.p.push(P.getX(i), P.getY(i), P.getZ(i)); b.n.push(N.getX(i), N.getY(i), N.getZ(i));
      b.u.push(U ? U.getX(i) : 0, U ? U.getY(i) : 0);
      const k = typeof col === 'function' ? col(P.getY(i)) : col; b.c.push(k, k, k);
    }
  }
  // quad (2 triângulos) centrado em c, eixos a (largura) e v (altura), normal personalizada
  function gbQuad(b, c, a, v, n, col, u0, u1, v0, v1, colTop) {
    const P = [[-1, -1], [1, -1], [1, 1], [-1, -1], [1, 1], [-1, 1]];
    for (const [x, y] of P) {
      b.p.push(c.x + a.x * x + v.x * y, c.y + a.y * x + v.y * y, c.z + a.z * x + v.z * y);
      b.n.push(n.x, n.y, n.z);
      b.u.push(x < 0 ? u0 : u1, y < 0 ? v0 : v1);
      const k = (y > 0 && colTop != null) ? colTop : col; b.c.push(k, k, k);
    }
  }
  const V = (x, y, z) => new T.Vector3(x, y, z);

  /* ---------- texturas procedurais ---------- */
  function leafTex() {
    return canvasTex(256, 256, (g, w, h) => {
      const r = rng(7);
      g.clearRect(0, 0, w, h);
      g.strokeStyle = 'rgba(70,50,30,.9)'; g.lineWidth = 2;
      for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(w / 2, h / 2); g.lineTo(r() * w, r() * h); g.stroke(); }
      for (let i = 0; i < 230; i++) {
        const a = r() * Math.PI * 2, d = Math.sqrt(r()) * w * .44, x = w / 2 + Math.cos(a) * d, y = h / 2 + Math.sin(a) * d;
        g.save(); g.translate(x, y); g.rotate(r() * 6.3);
        const L = 9 + r() * 9, Wd = 4 + r() * 4, hue = 78 + r() * 34, lt = 20 + r() * 22;
        g.fillStyle = 'hsl(' + hue + ',' + (38 + r() * 25) + '%,' + lt + '%)';
        g.beginPath(); g.ellipse(0, 0, L, Wd, 0, 0, 7); g.fill();
        g.strokeStyle = 'hsla(' + hue + ',40%,' + (lt + 12) + '%,.6)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-L, 0); g.lineTo(L, 0); g.stroke();
        g.restore();
      }
    });
  }
  function needleTex() {
    return canvasTex(128, 256, (g, w, h) => {
      const r = rng(11); g.clearRect(0, 0, w, h);
      g.strokeStyle = '#4a3420'; g.lineWidth = 4; g.beginPath(); g.moveTo(w / 2, h); g.lineTo(w / 2, 6); g.stroke();
      for (let y = h - 6; y > 8; y -= 2.2) {
        const f = y / h, L = (8 + 50 * f) * (.75 + r() * .35);
        for (const s of [-1, 1]) {
          const lt = 14 + r() * 16;
          g.strokeStyle = 'hsl(' + (95 + r() * 30) + ',' + (35 + r() * 20) + '%,' + lt + '%)'; g.lineWidth = 1.6;
          g.beginPath(); g.moveTo(w / 2, y); g.lineTo(w / 2 + s * L, y - L * (.45 + r() * .3)); g.stroke();
        }
      }
    });
  }
  function grassTex() {
    return canvasTex(256, 128, (g, w, h) => {
      const r = rng(5); g.clearRect(0, 0, w, h);
      for (let i = 0; i < 70; i++) {
        const x = 8 + r() * (w - 16), H = h * (.45 + r() * .55), bend = (r() - .5) * 40, wd = 2 + r() * 3.5;
        const lt = 22 + r() * 24; g.fillStyle = 'hsl(' + (70 + r() * 40) + ',' + (40 + r() * 25) + '%,' + lt + '%)';
        g.beginPath(); g.moveTo(x - wd, h); g.quadraticCurveTo(x + bend * .3, h - H * .6, x + bend, h - H); g.quadraticCurveTo(x + bend * .3 + wd * .3, h - H * .6, x + wd, h); g.fill();
      }
    });
  }
  function barkTex() {
    return canvasTex(128, 256, (g, w, h) => {
      const r = rng(3); g.fillStyle = '#5a4a3c'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 260; i++) { const x = r() * w, l = 20 + r() * 90; g.fillStyle = 'rgba(' + (r() < .5 ? '20,14,10' : '140,125,110') + ',' + (.15 + r() * .3) + ')'; g.fillRect(x, r() * h, 1 + r() * 3, l); }
      for (let i = 0; i < 1500; i++) { g.fillStyle = 'rgba(0,0,0,' + r() * .15 + ')'; g.fillRect(r() * w, r() * h, 2, 2); }
    });
  }
  function rockTex() {
    return canvasTex(256, 256, (g, w, h) => {
      const r = rng(9); g.fillStyle = '#8a8680'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 70; i++) { g.fillStyle = 'rgba(' + (r() < .5 ? '40,38,35' : '200,195,185') + ',' + (.05 + r() * .12) + ')'; g.beginPath(); g.arc(r() * w, r() * h, 6 + r() * 40, 0, 7); g.fill(); }
      for (let i = 0; i < 5000; i++) { g.fillStyle = 'rgba(' + (r() < .5 ? '0,0,0' : '255,255,255') + ',' + r() * .12 + ')'; g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2); }
      g.strokeStyle = 'rgba(30,28,25,.35)'; for (let i = 0; i < 12; i++) { g.lineWidth = 1 + r() * 2; g.beginPath(); let x = r() * w, y = r() * h; g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (r() - .5) * 50; y += (r() - .5) * 50; g.lineTo(x, y); } g.stroke(); }
    });
  }
  DZR.plasterTex = function (rx, ry) {
    const t = canvasTex(512, 512, (g, w, h) => {
      const r = rng(21); g.fillStyle = '#efebe3'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 260; i++) { g.fillStyle = 'rgba(' + (r() < .6 ? '120,110,95' : '255,255,250') + ',' + (.02 + r() * .05) + ')'; g.beginPath(); g.arc(r() * w, r() * h, 10 + r() * 60, 0, 7); g.fill(); }
      for (let i = 0; i < 14000; i++) { g.fillStyle = 'rgba(' + (r() < .5 ? '0,0,0' : '255,255,255') + ',' + (.02 + r() * .07) + ')'; g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2); }
      // escorridos de sujeira
      for (let i = 0; i < 40; i++) { const x = r() * w, l = 30 + r() * 140, gr = g.createLinearGradient(0, 0, 0, l); gr.addColorStop(0, 'rgba(70,62,50,.10)'); gr.addColorStop(1, 'rgba(70,62,50,0)'); g.fillStyle = gr; g.save(); g.translate(x, r() * h); g.fillRect(0, 0, 2 + r() * 6, l); g.restore(); }
    });
    t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx || 2, ry || 1); return t;
  };

  /* ---------- construções: telhas e tijolos ---------- */
  DZR.roofMat = function () {
    const t = canvasTex(256, 256, (g, w, h) => {
      const r = rng(13); g.fillStyle = '#2a2624'; g.fillRect(0, 0, w, h);
      const rows = 6, cols = 8, th = h / rows, tw = w / cols;
      for (let j = 0; j < rows; j++) for (let i = -1; i <= cols; i++) {
        const x = i * tw + (j % 2) * tw / 2, y = j * th, l = 62 + r() * 22;
        const gr = g.createLinearGradient(0, y, 0, y + th); gr.addColorStop(0, 'hsl(20,8%,' + (l + 10) + '%)'); gr.addColorStop(.85, 'hsl(20,8%,' + l + '%)'); gr.addColorStop(1, 'hsl(20,8%,' + (l - 25) + '%)');
        g.fillStyle = gr; g.beginPath(); g.moveTo(x + 2, y); g.lineTo(x + tw - 2, y); g.quadraticCurveTo(x + tw - 1, y + th * .9, x + tw / 2, y + th - 1); g.quadraticCurveTo(x + 1, y + th * .9, x + 2, y); g.fill();
      }
      for (let i = 0; i < 3000; i++) { g.fillStyle = 'rgba(0,0,0,' + r() * .12 + ')'; g.fillRect(r() * w, r() * h, 2, 2); }
    });
    t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(16, 5);
    return new T.MeshStandardMaterial({ vertexColors: true, map: t, bumpMap: t, bumpScale: .03, roughness: .85, metalness: 0 });
  };
  DZR.brickMat = function () {
    const t = imgTex('brick', 1, 1);
    const m = new T.MeshStandardMaterial({ vertexColors: true, map: t, roughness: .92, metalness: 0 });
    // UV pelo espaço do mundo: tijolos sempre do mesmo tamanho em qualquer parede
    m.onBeforeCompile = s => {
      s.vertexShader = 'varying vec3 vWPos;varying vec3 vWNrm;\n' + s.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWPos=(modelMatrix*vec4(transformed,1.)).xyz;vWNrm=normalize(mat3(modelMatrix)*objectNormal);');
      s.fragmentShader = 'varying vec3 vWPos;varying vec3 vWNrm;\n' + s.fragmentShader.replace('#include <map_fragment>', 'vec3 an=abs(vWNrm);vec2 bu=an.x>an.z?vWPos.zy:vWPos.xy;if(an.y>.7)bu=vWPos.xz;vec4 texelColor=texture2D(map,bu*vec2(.42,.84));texelColor=mapTexelToLinear(texelColor);diffuseColor*=texelColor;');
    };
    return m;
  };

  /* ---------- materiais de vegetação ---------- */
  let MAT = null; const WT = { value: 0 };
  function mats() {
    if (MAT) return MAT;
    const bark = barkTex(); bark.wrapS = bark.wrapT = T.RepeatWrapping; bark.repeat.set(2, 3);
    const rock = rockTex(); rock.wrapS = rock.wrapT = T.RepeatWrapping;
    const leaf = leafTex(), needle = needleTex(), grass = grassTex();
    // folhas: os dois lados usam a mesma normal (sem isso o verso fica preto)
    const noFlip = m => { m.onBeforeCompile = s => { s.fragmentShader = s.fragmentShader.replace('#include <normal_fragment_begin>', T.ShaderChunk.normal_fragment_begin.replace('normal = normal * faceDirection;', '')); }; return m; };
    // vento: balança mais a parte de cima (altura no espaço do objeto)
    const wind = (m, k, amp) => { const prev = m.onBeforeCompile; m.onBeforeCompile = s => { prev && prev(s); s.uniforms.uWT = WT;
      s.vertexShader = 'uniform float uWT;\n' + s.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      #ifdef USE_INSTANCING
        vec3 wpI = (instanceMatrix * vec4(transformed, 1.0)).xyz;
      #else
        vec3 wpI = transformed;
      #endif
      float wk = clamp(transformed.y * ${k.toFixed(4)}, 0.0, 1.0); wk *= wk;
      transformed.x += sin(uWT * 1.7 + wpI.x * 0.35 + wpI.z * 0.21) * ${amp.toFixed(4)} * wk;
      transformed.z += cos(uWT * 1.33 + wpI.z * 0.29 + wpI.x * 0.17) * ${(amp * .7).toFixed(4)} * wk;`); }; return m; };
    const foliage = (map) => noFlip(new T.MeshStandardMaterial({ map, alphaTest: .42, side: T.DoubleSide, vertexColors: true, roughness: .85, metalness: 0 }));
    MAT = {
      bark: new T.MeshStandardMaterial({ map: bark, vertexColors: true, roughness: .95, metalness: 0 }),
      leaf: wind(foliage(leaf), 1 / 9, .22), needle: wind(foliage(needle), 1 / 18, .3),
      grass: wind(noFlip(new T.MeshStandardMaterial({ map: grass, alphaTest: .4, side: T.DoubleSide, vertexColors: true, roughness: 1, metalness: 0 })), 1.9, .09),
      rock: new T.MeshStandardMaterial({ map: rock, bumpMap: rock, bumpScale: .04, roughness: .95, metalness: 0 })
    };
    return MAT;
  }
  DZR.mats = mats;

  /* ---------- árvore de folhas largas ---------- */
  function trunkAndBranches(b, r, H, r0, r1, nBr, brY0, brY1, brL) {
    const m = new T.Matrix4(), q = new T.Quaternion();
    const tg = new T.CylinderGeometry(r1, r0, H, 9, 5, false);
    { const P = tg.attributes.position; for (let i = 0; i < P.count; i++) { const y = P.getY(i), k = 1 + (r() - .5) * .12 + (y < -H / 2 + .3 ? .35 : 0); P.setX(i, P.getX(i) * k); P.setZ(i, P.getZ(i) * k); } tg.computeVertexNormals(); }
    m.makeTranslation(0, H / 2, 0); gbAddGeo(b, tg, m, y => .55 + .45 * Math.min(1, (y + .2) / 3));
    for (let i = 0; i < nBr; i++) {
      const a = i / nBr * 6.283 + r() * .8, el = .55 + r() * .45, L = brL * (.8 + r() * .4), y0 = brY0 + r() * (brY1 - brY0);
      const dir = V(Math.cos(a) * Math.cos(el), Math.sin(el), Math.sin(a) * Math.cos(el));
      const g = new T.CylinderGeometry(.035, r1 * .7, L, 6, 1, false); g.translate(0, L / 2, 0);
      q.setFromUnitVectors(V(0, 1, 0), dir); m.compose(V(0, y0, 0), q, V(1, 1, 1)); gbAddGeo(b, g, m, .8);
    }
  }
  DZR.tree = function (seed) {
    const r = rng(seed * 31 + 7), M_ = mats(), wood = GB(), lf = GB();
    const H = 4.4 + r() * .8;
    trunkAndBranches(wood, r, H, .34, .2, 5, 2.6, 3.8, 2.4);
    const CY = 5.8, lobes = [[0, 0, 0, 3.2, 2.3, 3.2]];
    for (let i = 0; i < 6; i++) { const a = r() * 6.283, d = 1.6 + r() * 1.4; lobes.push([Math.cos(a) * d, (r() - .4) * 1.5, Math.sin(a) * d, 1.7 + r() * .8, 1.3 + r() * .7, 1.7 + r() * .8]); }
    const N = 95;
    for (let i = 0; i < N; i++) {
      const L = lobes[i < 30 ? 0 : 1 + Math.floor(r() * (lobes.length - 1))];
      const th = r() * 6.283, ph = Math.acos(2 * r() - 1), rr = .55 + .45 * Math.cbrt(r());
      const lp = V(Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th));
      const c = V(L[0] + lp.x * L[3] * rr, CY + L[1] + lp.y * L[4] * rr, L[2] + lp.z * L[5] * rr);
      const s = 1.05 + r() * .7, nrm = V(r() - .5, r() - .5, r() - .5).normalize();
      const a = new T.Vector3().crossVectors(nrm, Math.abs(nrm.y) > .9 ? V(1, 0, 0) : V(0, 1, 0)).normalize().multiplyScalar(s), v = new T.Vector3().crossVectors(nrm, a).normalize().multiplyScalar(s);
      const out = c.clone().sub(V(0, CY - .6, 0)).normalize(); out.lerp(nrm, .15).normalize();
      const shade = .45 + .55 * Math.min(1, Math.max(0, (c.y - (CY - 2.6)) / 5)) * (.6 + .4 * rr);
      gbQuad(lf, c, a, v, out, shade, 0, 1, 0, 1);
    }
    return [[gbGeo(wood), M_.bark, 1], [gbGeo(lf), M_.leaf, 0]];
  };

  /* ---------- pinheiro ---------- */
  DZR.pine = function (seed, nT, rB) {
    const r = rng(seed * 17 + 3), M_ = mats(), wood = GB(), nd = GB(), m = new T.Matrix4();
    const H = (3 + nT * 3 + 3) * .62, R0 = .22 + nT * .025;
    const tg = new T.CylinderGeometry(.04, R0, H, 8, 6, false);
    { const P = tg.attributes.position; for (let i = 0; i < P.count; i++) { const y = P.getY(i), k = 1 + (y < -H / 2 + .25 ? .4 : 0) + (r() - .5) * .08; P.setX(i, P.getX(i) * k); P.setZ(i, P.getZ(i) * k); } tg.computeVertexNormals(); }
    m.makeTranslation(0, H / 2, 0); gbAddGeo(wood, tg, m, y => .55 + .45 * Math.min(1, (y + .2) / 3));
    const y0 = Math.max(1.6, H * .22), nW = 4 + nT * 2;
    for (let w = 0; w < nW; w++) {
      const f = w / (nW - 1), y = y0 + (H - .6 - y0) * f + (r() - .5) * .25;
      const rad = (rB * .62 * (1 - f * .92) + .35) * (.9 + r() * .2), k = 7 + Math.floor(r() * 3), a0 = r() * 6.283;
      const shade = .45 + .55 * f;
      for (let i = 0; i < k; i++) {
        const a = a0 + i / k * 6.283 + (r() - .5) * .4, dr = V(Math.cos(a), 0, Math.sin(a)), droop = -.25 - r() * .3;
        const along = V(dr.x * Math.cos(droop), Math.sin(droop), dr.z * Math.cos(droop)).normalize();
        const side = new T.Vector3().crossVectors(along, V(0, 1, 0)).normalize();
        const up = new T.Vector3().crossVectors(side, along).normalize();
        const L = rad, Wd = rad * .42 + .25;
        const c = V(along.x * L / 2, y + along.y * L / 2, along.z * L / 2);
        const nrm = dr.clone().multiplyScalar(.6).add(V(0, .8, 0)).normalize();
        // a textura tem o "galho" na vertical: u = largura, v = comprimento
        gbQuad(nd, c, side.clone().multiplyScalar(Wd), along.clone().multiplyScalar(L / 2), nrm, shade * .85, 0, 1, 0, 1, shade);
        gbQuad(nd, c, up.clone().multiplyScalar(Wd * .7), along.clone().multiplyScalar(L / 2), nrm, shade * .75, 0, 1, 0, 1, shade);
      }
    }
    for (let i = 0; i < 3; i++) { const a = i * 1.047, s = V(Math.cos(a) * .55, 0, Math.sin(a) * .55); gbQuad(nd, V(0, H + .25, 0), s, V(0, .9, 0), V(0, 1, 0), 1, 0, 1, 0, 1); }
    return [[gbGeo(wood), M_.bark, 1], [gbGeo(nd), M_.needle, 0]];
  };

  /* ---------- arbusto, grama, pedra ---------- */
  DZR.bushGeo = function () {
    const r = rng(77), b = GB();
    for (let i = 0; i < 22; i++) {
      const th = r() * 6.283, ph = Math.acos(2 * r() - 1), rr = .35 + .5 * r();
      const c = V(Math.sin(ph) * Math.cos(th) * rr, Math.cos(ph) * rr * .7, Math.sin(ph) * Math.sin(th) * rr);
      const nrm = V(r() - .5, r() - .5, r() - .5).normalize(), s = .45 + r() * .3;
      const a = new T.Vector3().crossVectors(nrm, V(0, 1, 0)).normalize().multiplyScalar(s), v = new T.Vector3().crossVectors(nrm, a).normalize().multiplyScalar(s);
      gbQuad(b, c, a, v, c.clone().normalize(), .55 + .45 * (c.y + .5), 0, 1, 0, 1);
    }
    return gbGeo(b);
  };
  DZR.grassGeo = function () {
    const b = GB();
    for (let i = 0; i < 3; i++) { const a = i * 1.047; gbQuad(b, V(0, .26, 0), V(Math.cos(a) * .42, 0, Math.sin(a) * .42), V(0, .27, 0), V(0, 1, 0), .65, 0, 1, 0, 1, 1); }
    return gbGeo(b);
  };
  DZR.rockGeo = function () {
    const g = new T.IcosahedronGeometry(1, 2), P = g.attributes.position, r = rng(5), seen = new Map();
    for (let i = 0; i < P.count; i++) {
      const k = P.getX(i).toFixed(3) + P.getY(i).toFixed(3) + P.getZ(i).toFixed(3); let s = seen.get(k); if (s == null) { s = .8 + r() * .35; seen.set(k, s); }
      let y = P.getY(i) * s; if (y < -.2) y = -.2 - (y + .2) * .2; P.setXYZ(i, P.getX(i) * s, y, P.getZ(i) * s);
    }
    g.computeVertexNormals(); return g;
  };

  /* ---------- chão com variação (sem padrão repetido) ---------- */
  DZR.groundMat = function () {
    const map = imgTex('grass', 240, 240);
    const m = new T.MeshStandardMaterial({ map, roughness: 1, metalness: 0, color: lin(0xd6dcc8) });
    m.onBeforeCompile = s => {
      s.fragmentShader = s.fragmentShader.replace('#include <map_fragment>', `
        vec2 gu=vUv; vec4 tA=texture2D(map,gu); vec4 tB=texture2D(map,gu*.31+vec2(.37,.11));
        vec2 q=gu*.045; float n=sin(q.x*1.7+sin(q.y*1.3))*.5+sin(q.y*2.3+sin(q.x*.9)*1.7)*.5;
        float n2=sin(gu.x*.23+cos(gu.y*.19)*2.)*.5+.5;
        vec4 texelColor=mix(tA,tB,.5+.25*n);
        texelColor.rgb*=mix(vec3(1.08,1.02,.82),vec3(.82,.92,.78),n2);
        texelColor=mapTexelToLinear(texelColor); diffuseColor*=texelColor;`);
    };
    return m;
  };

  /* ---------- ambiente: reflexos do céu, sombras, água ---------- */
  DZR.post = function () {
    try {
      // reflexos do céu para todos os materiais PBR
      // céu em gradiente feito com cores por vértice (MeshBasic é codificado corretamente pelo PMREM)
      const es = new T.Scene(), sg = new T.SphereGeometry(10, 48, 24), P = sg.attributes.position, cols = [], sd = V(55, 90, 30).normalize(), d = new T.Vector3();
      const top = lin(0x3c6fae), hor = lin(0xb8c8d2), gnd = lin(0x4a4c3c);
      for (let i = 0; i < P.count; i++) {
        d.set(P.getX(i), P.getY(i), P.getZ(i)).normalize(); const c = new T.Color();
        if (d.y >= 0) c.copy(hor).lerp(top, Math.pow(d.y, .6)); else c.copy(hor).lerp(gnd, Math.min(1, -d.y * 3));
        const g = Math.pow(Math.max(d.dot(sd), 0), 24) * 3.5; c.r += g; c.g += g * .9; c.b += g * .7;
        cols.push(c.r, c.g, c.b);
      }
      sg.setAttribute('color', new T.Float32BufferAttribute(cols, 3));
      es.add(new T.Mesh(sg, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide })));
      const pm = new T.PMREMGenerator(ren); const rtE = pm.fromScene(es, .02); DZR.envTex = rtE.texture; pm.dispose();
      FLASH = new T.PointLight(0xffc27a, 0, 11, 2); sc.add(FLASH);
      DZR.applyQ((typeof CFG !== 'undefined' && CFG.q != null) ? CFG.q : (window.DZ_DEFQ != null ? DZ_DEFQ : 2));
    } catch (e) { console.warn('DZR.post', e); }
  };
  // qualidade gráfica: Alta = reflexos do céu + sombras suaves; Média/Baixa = mais leve
  DZR.applyQ = function (q) {
    const hi = q >= 2, env = hi ? DZR.envTex || null : null;
    if (sc.environment !== env) { sc.environment = env; sc.traverse(o => { if (o.material) [].concat(o.material).forEach(m => { m.needsUpdate = true; }); }); }
    sc.traverse(o => { if (o.isHemisphereLight && !o.userData.dzLobby) o.intensity = hi ? .45 : .75; });
    ren.shadowMap.type = hi ? T.PCFSoftShadowMap : T.PCFShadowMap;
    const ms = hi ? 2048 : 1024; sun.shadow.mapSize.set(ms, ms); sun.shadow.radius = hi ? 2.5 : 1;
    { const c = sun.shadow.camera, e = hi ? 60 : 42; c.left = c.bottom = -e; c.right = c.top = e; c.updateProjectionMatrix(); }
    if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; }
  };
  DZR.waterMat = function (base) {
    const nm = new T.TextureLoader().load(ASSET.water); nm.wrapS = nm.wrapT = T.RepeatWrapping; nm.repeat.set(6, 6);
    base.normalMap = nm; base.normalScale = new T.Vector2(.35, .35); base.roughness = .06; base.metalness = .1; base.color = lin(0x24607f); base.opacity = .9;
    DZR.water.push(nm); return base;
  };

  /* =====================================================================
     RELEVO: morros e montanhas fora das cidades, estradas e construções
     ===================================================================== */
  window.TERH = window.TERH || function () { return 0; };
  DZR.terrain = function (spots) {
    const S = 12, N = 201, O = -1200, D = new Float32Array(N * N).fill(1e6);
    const idx = (i, j) => j * N + i, cl = v => Math.max(0, Math.min(N - 1, v));
    const mark = (x0, z0, x1, z1) => { for (let j = cl(Math.floor((z0 - O) / S)); j <= cl(Math.ceil((z1 - O) / S)); j++) for (let i = cl(Math.floor((x0 - O) / S)); i <= cl(Math.ceil((x1 - O) / S)); i++) D[idx(i, j)] = 0; };
    const circ = (x, z, r) => mark(x - r, z - r, x + r, z + r);
    try { for (const r of RDS) mark(r[0] - 4, r[1] - 4, r[2] + 4, r[3] + 4); } catch (e) { }
    try { for (const b of FP) mark(b.x0 - 6, b.z0 - 6, b.x1 + 6, b.z1 + 6); } catch (e) { }
    try { for (const c of CITIES) mark(c.x - 110, c.z - 110, c.x + 110, c.z + 110); } catch (e) { }
    try { for (const l of LK) circ(l.x, l.z, l.r + 14); } catch (e) { }
    for (const s of spots || []) circ(s[0], s[1], 85);
    // transformada de distância (chanfro, 2 passadas)
    const d1 = S, d2 = S * 1.4142;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { let v = D[idx(i, j)]; if (i > 0) v = Math.min(v, D[idx(i - 1, j)] + d1); if (j > 0) { v = Math.min(v, D[idx(i, j - 1)] + d1); if (i > 0) v = Math.min(v, D[idx(i - 1, j - 1)] + d2); if (i < N - 1) v = Math.min(v, D[idx(i + 1, j - 1)] + d2); } D[idx(i, j)] = v; }
    for (let j = N - 1; j >= 0; j--) for (let i = N - 1; i >= 0; i--) { let v = D[idx(i, j)]; if (i < N - 1) v = Math.min(v, D[idx(i + 1, j)] + d1); if (j < N - 1) { v = Math.min(v, D[idx(i, j + 1)] + d1); if (i < N - 1) v = Math.min(v, D[idx(i + 1, j + 1)] + d2); if (i > 0) v = Math.min(v, D[idx(i - 1, j + 1)] + d2); } D[idx(i, j)] = v; }
    // ruído suave (value noise) em várias escalas
    const hh = (x, z) => { const v = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return v - Math.floor(v); };
    const vn = (x, z) => { const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi, u = xf * xf * (3 - 2 * xf), w = zf * zf * (3 - 2 * zf); return (hh(xi, zi) * (1 - u) + hh(xi + 1, zi) * u) * (1 - w) + (hh(xi, zi + 1) * (1 - u) + hh(xi + 1, zi + 1) * u) * w; };
    const fbm = (x, z) => vn(x, z) * .55 + vn(x * 2.1 + 5.2, z * 2.1 + 1.3) * .28 + vn(x * 4.3 + 9.1, z * 4.3 + 3.7) * .17;
    const ss = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
    const H = new Float32Array(N * N);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const x = O + i * S, z = O + j * S;
      let h = Math.pow(fbm(x / 380 + 3.1, z / 380 + 7.7), 1.6) * 46 + (fbm(x / 110, z / 110) - .35) * 7;
      const e = Math.max(Math.abs(x), Math.abs(z)), edge = ss(820, 1180, e);
      const ridge = 1 - Math.abs(fbm(x / 160 + 11, z / 160 + 4) * 2 - 1);
      h += edge * (35 + ridge * 45);
      H[idx(i, j)] = Math.max(0, h) * ss(10, 70, D[idx(i, j)]);
    }
    DZR.H = H;
    // mesma triangulação do PlaneGeometry: altura idêntica à malha
    const TERH = function (x, z) {
      let fx = (x - O) / S, fz = (z - O) / S; if (fx < 0 || fz < 0 || fx >= N - 1 || fz >= N - 1) return 0;
      const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j;
      const a = H[idx(i, j)], b = H[idx(i, j + 1)], c = H[idx(i + 1, j + 1)], d = H[idx(i + 1, j)];
      return u + v <= 1 ? a + (d - a) * u + (b - a) * v : c + (b - c) * (1 - u) + (d - c) * (1 - v);
    };
    window.TERH = TERH;
    // malha do chão com relevo
    try {
      const g = new T.PlaneGeometry(2400, 2400, N - 1, N - 1), P = g.attributes.position;
      for (let k = 0; k < P.count; k++) { const x = P.getX(k), z = -P.getY(k); P.setZ(k, TERH(x, z)); }
      g.computeVertexNormals(); g.computeBoundingSphere();
      gr.geometry.dispose(); gr.geometry = g;
    } catch (e) { console.warn('terreno', e); }
    return TERH;
  };

  /* =====================================================================
     JANELAS DE VIDRO QUEBRÁVEIS
     ===================================================================== */
  const DZW = window.DZW = { cells: new Map(), panes: [], broken: 0 };
  const wkey = (x, z) => Math.floor(x / 32) * 4096 + Math.floor(z / 32);
  let GLM = null;
  DZW.mat = () => GLM || (GLM = new T.MeshStandardMaterial({ color: lin(0x8fb4c8), metalness: .2, roughness: .05, transparent: true, opacity: .42, depthWrite: false, side: T.DoubleSide, envMapIntensity: 1.6 }));
  // g: grupo do prédio (já posicionado); list: [px,py,pz,ry] locais; tamanho da vidraça 1.2 x 1.1
  DZW.add = function (g, list, W_, H_) {
    if (!list.length) return;
    const hw = (W_ || 1.2) / 2, hh_ = (H_ || 1.1) / 2;
    g.updateMatrix(); g.updateMatrixWorld(true);
    const pos = new Float32Array(list.length * 18), nrm = new Float32Array(list.length * 18), m = g.matrixWorld;
    const v = new T.Vector3(), ax = new T.Vector3(), nn = new T.Vector3(), c = new T.Vector3();
    list.forEach((w, k) => {
      const [px, py, pz, ry] = w, cs = Math.cos(ry), sn = Math.sin(ry);
      const lu = [cs, 0, -sn], ln = [sn, 0, cs];
      const Q = [[-1, -1], [1, -1], [1, 1], [-1, -1], [1, 1], [-1, 1]];
      Q.forEach((q, i) => { const o = k * 18 + i * 3; pos[o] = px + lu[0] * hw * q[0]; pos[o + 1] = py + hh_ * q[1]; pos[o + 2] = pz + lu[2] * hw * q[0]; nrm[o] = ln[0]; nrm[o + 1] = 0; nrm[o + 2] = ln[2]; });
      c.set(px, py, pz).applyMatrix4(m); ax.set(lu[0], 0, lu[2]).transformDirection(m); nn.set(ln[0], 0, ln[2]).transformDirection(m);
      const P_ = { c: c.clone(), u: ax.clone(), n: nn.clone(), hw, hh: hh_, k, br: 0 };
      DZW.panes.push(P_); const key = wkey(c.x, c.z); let a = DZW.cells.get(key); if (!a) DZW.cells.set(key, a = []); a.push(P_); list[k] = P_;
    });
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setAttribute('normal', new T.BufferAttribute(nrm, 3)); geo.computeBoundingSphere();
    const me = new T.Mesh(geo, DZW.mat()); me.renderOrder = 2; g.add(me);
    for (const p of list) p.mesh = me;
  };
  function near3(x, z, f) { const i0 = Math.floor(x / 32), j0 = Math.floor(z / 32); for (let i = i0 - 1; i <= i0 + 1; i++) for (let j = j0 - 1; j <= j0 + 1; j++) { const a = DZW.cells.get(i * 4096 + j); if (a) for (const p of a) if (f(p)) return true; } return false; }
  // ponto dentro do vão de uma janela quebrada (tiro e visão passam)
  DZW.hole = function (x, y, z) {
    if (!DZW.broken) return false;
    const a = DZW.cells.get(wkey(x, z)); if (!a) return false;
    for (const p of a) { if (!p.br) continue; const dx = x - p.c.x, dy = y - p.c.y, dz = z - p.c.z; if (Math.abs(dy) < p.hh + .05 && Math.abs(dx * p.u.x + dz * p.u.z) < p.hw + .05 && Math.abs(dx * p.n.x + dz * p.n.z) < .5) return true; }
    return false;
  };
  function rayPane(p, o, d) {
    const dn = d.x * p.n.x + d.y * p.n.y + d.z * p.n.z; if (Math.abs(dn) < 1e-4) return 1e9;
    const t = ((p.c.x - o.x) * p.n.x + (p.c.y - o.y) * p.n.y + (p.c.z - o.z) * p.n.z) / dn; if (t <= 0) return 1e9;
    const hx = o.x + d.x * t - p.c.x, hy = o.y + d.y * t - p.c.y, hz = o.z + d.z * t - p.c.z;
    return (Math.abs(hy) < p.hh && Math.abs(hx * p.u.x + hz * p.u.z) < p.hw) ? t : 1e9;
  }
  // tiro: quebra a primeira vidraça intacta no caminho (até "maxT")
  DZW.shoot = function (o, d, maxT) {
    const seen = new Set(); let best = null, bt = Math.min(maxT, 400);
    for (let s = 0; s <= bt + 32; s += 16) {
      const x = o.x + d.x * s, z = o.z + d.z * s;
      near3(x, z, p => { if (p.br || seen.has(p)) return false; seen.add(p); const t = rayPane(p, o, d); if (t < bt) { bt = t; best = p; } return false; });
      if (best && s > bt + 16) break;
    }
    if (!best) return 0;
    const q = Math.max(0, bt - .45);
    try { if (typeof blocked === 'function' && blocked(o.x, o.y, o.z, o.x + d.x * q, o.y + d.y * q, o.z + d.z * q)) return 0; } catch (e) { }
    DZW.breakPane(best, d); return 1;
  };
  // corpo do jogador passando pela janela (pulando por ela): quebra o vidro
  DZW.touch = function (x, y, z, vx, vz) {
    const a = DZW.cells.get(wkey(x, z)); if (!a) return;
    for (const p of a) { if (p.br) continue; const dx = x - p.c.x, dz = z - p.c.z, dn = dx * p.n.x + dz * p.n.z, du = dx * p.u.x + dz * p.u.z;
      if (Math.abs(dn) < .5 && Math.abs(du) < p.hw + .15 && y + 1.75 > p.c.y - p.hh && y + .3 < p.c.y + p.hh) DZW.breakPane(p, new T.Vector3(vx || p.n.x, 0, vz || p.n.z).normalize()); }
  };
  DZW.blast = function (x, y, z, r) {
    near3(x, z, p => { if (!p.br && Math.hypot(p.c.x - x, p.c.y - y, p.c.z - z) < r) DZW.breakPane(p, new T.Vector3(p.c.x - x, p.c.y - y, p.c.z - z).normalize()); return false; });
  };
  DZW.breakPane = function (p, dir) {
    if (p.br) return; p.br = 1; DZW.broken++;
    const a = p.mesh.geometry.attributes.position; for (let i = 0; i < 6; i++) a.setXYZ(p.k * 6 + i, 0, -50, 0); a.needsUpdate = true;
    spawnShards(p, dir);
    try { const dd = (typeof P !== 'undefined') ? Math.hypot(p.c.x - P.x, p.c.z - P.z) : 0, k = Math.max(0, 1 - dd / 60); if (k > 0) { sfx(5200, .4 * k, .25, 0); sfx(2600, .3 * k, .55, 0); } } catch (e) { }
  };
  // estilhaços de vidro
  let SHM = null; const SH = [];
  function spawnShards(p, dir) {
    if (!SHM) {
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute([-.06, -.05, 0, .07, -.04, 0, 0, .08, 0], 3)); g.computeVertexNormals();
      SHM = new T.InstancedMesh(g, new T.MeshStandardMaterial({ color: lin(0xcfe6f2), metalness: .3, roughness: .05, transparent: true, opacity: .8, side: T.DoubleSide }), 400);
      SHM.count = 0; SHM.frustumCulled = false; SHM.instanceMatrix.setUsage(T.DynamicDrawUsage); sc.add(SHM);
    }
    const side = (dir && (dir.x * p.n.x + dir.z * p.n.z) < 0) ? -1 : 1;
    for (let i = 0; i < 18; i++) {
      if (SH.length >= 400) SH.shift();
      const u = (Math.random() * 2 - 1) * p.hw, v = (Math.random() * 2 - 1) * p.hh, sp = 1 + Math.random() * 3;
      SH.push({ x: p.c.x + p.u.x * u, y: p.c.y + v, z: p.c.z + p.u.z * u, vx: p.n.x * side * sp + (Math.random() - .5), vy: Math.random() * 1.5, vz: p.n.z * side * sp + (Math.random() - .5), rx: Math.random() * 6, ry: Math.random() * 6, s: .6 + Math.random() * 1.4, t: 0, gy: null });
    }
  }
  const _o3 = new T.Object3D();
  DZR.shardTick = function (dt) {
    if (!SHM) return; let n = 0;
    for (let i = SH.length - 1; i >= 0; i--) {
      const s = SH[i]; s.t += dt; if (s.t > 6) { SH.splice(i, 1); continue; }
      if (s.gy == null) { let g = 0; try { g = GY(s.x, s.z, s.y); } catch (e) { } s.gy = g; }
      if (s.y > s.gy + .02) { s.vy -= 9.8 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.z += s.vz * dt; s.rx += dt * 9; s.ry += dt * 7; if (s.y <= s.gy + .02) { s.y = s.gy + .02; s.vx *= .2; s.vz *= .2; s.rx = Math.PI / 2; } }
    }
    for (const s of SH) { _o3.position.set(s.x, s.y, s.z); _o3.rotation.set(s.rx, s.ry, 0); _o3.scale.setScalar(s.s * (s.t > 5 ? 6 - s.t : 1)); _o3.updateMatrix(); SHM.setMatrixAt(n++, _o3.matrix); }
    SHM.count = n; SHM.instanceMatrix.needsUpdate = true;
  };

  /* =====================================================================
     EFEITOS DE TIRO: clarão da arma e impacto das balas
     ===================================================================== */
  const DZFX = window.DZFX = {}; let FLASH = null, flT = 0;
  DZFX.flash = function (x, y, z, k) {
    if (!FLASH || (typeof CFG !== 'undefined' && CFG.q === 0)) return;
    FLASH.position.set(x, y, z); FLASH.intensity = 3.5 * (k || 1); flT = .055;
  };
  // onde a bala realmente bate: chão/relevo ou parede (janela quebrada deixa passar)
  DZFX.rayHit = function (o, d, maxT) {
    const lim = Math.min(maxT, 160);
    for (let t = .6; t < lim; t += .3) {
      const x = o.x + d.x * t, y = o.y + d.y * t, z = o.z + d.z * t;
      if (y < TERH(x, z)) return t;
      for (const b of near(x, z)) if (b.w && !b.off && (b.yt !== undefined ? (y > b.yb && y < b.yt) : y < (b.h || 6)) && x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1 && !(DZW.broken && DZW.hole(x, y, z))) return t;
    }
    return 1e9;
  };
  DZFX.impact = function (o, d, end, bot, rg) {
    if (typeof fxP !== 'function') return;
    const rand = (a, b) => a + Math.random() * (b - a);
    if (bot) {
      const x = o.x + d.x * end, y = o.y + d.y * end, z = o.z + d.z * end;
      for (let i = 0; i < 14; i++) fxP(x, y, z, d.x * rand(.5, 2.5) + rand(-.8, .8), rand(-.3, 1.4), d.z * rand(.5, 2.5) + rand(-.8, .8), rand(.08, .17), rand(.3, .6), 0x6a0808, 7, 1.5);
      return;
    }
    const t = Math.min(end, DZFX.rayHit(o, d, end)); if (t > 159) return;
    const x = o.x + d.x * (t - .05), y = o.y + d.y * (t - .05), z = o.z + d.z * (t - .05);
    if (typeof P !== 'undefined' && Math.hypot(x - P.x, z - P.z) > 130) return;
    const ground = y < TERH(x, z) + .3, col = ground ? 0x6e5c45 : 0xa29d94;
    for (let i = 0; i < 12; i++) fxP(x, y + .03, z, -d.x * rand(.4, 2.4) + rand(-1, 1), rand(.6, 2.6), -d.z * rand(.4, 2.4) + rand(-1, 1), rand(.08, .2), rand(.4, .9), col, 9, 1.2);
    if (!ground) for (let i = 0; i < 4; i++) fxP(x, y, z, -d.x * rand(2, 5) + rand(-2, 2), rand(1, 3.5), -d.z * rand(2, 5) + rand(-2, 2), rand(.02, .04), rand(.08, .18), 0xffd27a, 12, .3);
  };

  /* =====================================================================
     ILHA FLUTUANTE: rocha orgânica, grama, árvore gigante, pedra e água
     ===================================================================== */
  DZR.islandRock = function (cx, cz, half, topY, depth, seed, holeR) {
    const r = rng(seed), seg = 28, rings = 9, P = [], idxs = [], uv = [];
    // anel do topo (quadrado arredondado) + anéis que afunilam para baixo com ruído
    for (let k = 0; k <= rings; k++) {
      const f = k / rings, y = topY - .2 - Math.pow(f, 1.25) * depth, sc_ = Math.pow(1 - f, .85) * (1 + (k ? (r() - .5) * .08 : 0));
      for (let i = 0; i < seg; i++) {
        const a = i / seg * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a), m = Math.max(Math.abs(ca), Math.abs(sa)), sq = .55 + .45 / m;
        const ns = k === 0 ? 1.02 : 1 + (r() - .5) * .22, R_ = half * Math.min(sq, 1.38) * sc_ * ns * (k === 0 ? 1 : .98);
        P.push(cx + ca * R_, k === rings ? topY - depth - 6 : y + (k ? (r() - .5) * 1.5 : 0), cz + sa * R_); uv.push(i / seg * 6, f * 4);
      }
    }
    for (let k = 0; k < rings; k++) for (let i = 0; i < seg; i++) { const a = k * seg + i, b = k * seg + (i + 1) % seg, c = (k + 1) * seg + i, d = (k + 1) * seg + (i + 1) % seg; idxs.push(a, c, b, b, c, d); }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setIndex(idxs); g.computeVertexNormals();
    const tex = mats().rock.map.clone(); tex.needsUpdate = true; tex.repeat.set(1, 1);
    const m = new T.Mesh(g, new T.MeshStandardMaterial({ map: tex, bumpMap: tex, bumpScale: .08, color: lin(0x9c9284), roughness: .95, side: T.DoubleSide }));
    m.castShadow = false; m.receiveShadow = true;
    // tampa de grama
    let tg;
    if (holeR) { const sh = new T.Shape(); const H2 = half * 1.01; sh.moveTo(-H2, -H2); sh.lineTo(H2, -H2); sh.lineTo(H2, H2); sh.lineTo(-H2, H2); sh.lineTo(-H2, -H2); const ho = new T.Path(); ho.absarc(0, 0, holeR, 0, Math.PI * 2, true); sh.holes.push(ho); tg = new T.ShapeGeometry(sh, 32); const U = tg.attributes.uv; for (let i = 0; i < U.count; i++) U.setXY(i, (U.getX(i) + H2) / (2 * H2), (U.getY(i) + H2) / (2 * H2)); }
    else tg = new T.PlaneGeometry(half * 2.02, half * 2.02, 1, 1);
    const top = new T.Mesh(tg, DZR._islandGrass || (DZR._islandGrass = (() => { const t = imgTex('grass', 6, 6); return new T.MeshStandardMaterial({ map: t, roughness: 1, color: lin(0xd6e0c4) }); })()));
    top.material.map.repeat.set(half / 6, half / 6); top.rotation.x = -Math.PI / 2; top.position.set(cx, topY - .02, cz); top.receiveShadow = true;
    const grp = new T.Group(); grp.add(m, top); return grp;
  };
  // material de pedra/madeira por coordenada do mundo, para as construções de blocos da ilha
  DZR.stoneMat = function () {
    const t = mats().rock.map;
    const m = new T.MeshStandardMaterial({ vertexColors: true, map: t, roughness: .9, metalness: 0 });
    m.onBeforeCompile = s => {
      s.vertexShader = 'varying vec3 vWPos;varying vec3 vWNrm;\n' + s.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWPos=(modelMatrix*vec4(transformed,1.)).xyz;vWNrm=normalize(mat3(modelMatrix)*objectNormal);');
      s.fragmentShader = 'varying vec3 vWPos;varying vec3 vWNrm;\n' + s.fragmentShader.replace('#include <map_fragment>', 'vec3 an=abs(vWNrm);vec2 bu=an.x>an.z?vWPos.zy:vWPos.xy;if(an.y>.7)bu=vWPos.xz;vec4 texelColor=texture2D(map,bu*.35);texelColor=mapTexelToLinear(texelColor);diffuseColor.rgb*=mix(vec3(1.),texelColor.rgb*1.9,.75);');
    };
    return m;
  };
  // cachoeira: faixas que descem
  DZR.fallMat = function () {
    const m = new T.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: .75, depthWrite: false });
    const U = { value: 0 }; DZR._fallT = U;
    m.onBeforeCompile = s => {
      s.uniforms.uT = U;
      s.vertexShader = 'varying vec3 vWPos;\n' + s.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWPos=(modelMatrix*vec4(transformed,1.)).xyz;');
      s.fragmentShader = 'uniform float uT;varying vec3 vWPos;\n' + s.fragmentShader.replace('#include <map_fragment>', 'float st=fract((vWPos.y+uT*9.)*.18+sin((vWPos.x+vWPos.z)*3.1)*.3);float fo=smoothstep(.0,.25,st)*smoothstep(1.,.6,st);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(1.),fo*.55);diffuseColor.a*=.55+.45*fo;');
    };
    return m;
  };

  /* =====================================================================
     PERSONAGEM REALISTA
     ===================================================================== */
  let TPL = null;           // pessoa realista (modelo que aparece na tela), já calibrada
  let ANI = null;           // animações de captura de movimento "traduzidas" para qualquer esqueleto
  const _m = new T.Matrix4(), _m2 = new T.Matrix4(), _q = new T.Quaternion(), _q2 = new T.Quaternion(), _p = new T.Vector3(), _s = new T.Vector3();
  const _a = new T.Vector3(), _b = new T.Vector3(), _c = new T.Vector3(), _d = new T.Vector3(), _e = new T.Vector3();

  function bname(o) { return o.name.replace(/^mixamorig[:_]?/, ''); }
  function boneMap(root) { const B = {}; root.traverse(o => { if (!(o.isBone || /^mixamorig/.test(o.name))) return; const n = bname(o); if (!B[n]) B[n] = o; }); return B; }
  function wq(o) { o.matrixWorld.decompose(_p, _q, _s); return _q.clone(); }
  function wp(o) { return new T.Vector3().setFromMatrixPosition(o.matrixWorld); }

  /* Calibra um esqueleto (pessoa ou fonte de animação) para a pose de referência do jogo:
     frente em +Z, quadril a 0,97 m, braços e pernas retos para baixo, dedos fechados. */
  function calibrate(scene, withMesh) {
    const wrap = new T.Group(); wrap.add(scene); wrap.updateMatrixWorld(true);
    const B = boneMap(scene);
    if (B.LeftFoot && B.LeftToeBase && wp(B.LeftToeBase).sub(wp(B.LeftFoot)).z < 0) { wrap.rotation.y = Math.PI; wrap.updateMatrixWorld(true); }
    let minY;
    if (withMesh) minY = new T.Box3().setFromObject(scene).min.y;
    else { minY = 1e9; for (const k in B) minY = Math.min(minY, wp(B[k]).y); }
    const s = .97 / Math.max(.01, wp(B.Hips).y - minY);
    wrap.scale.setScalar(s); wrap.position.y = -minY * s; wrap.updateMatrixWorld(true);
    const rot = (bn, r) => { const b = B[bn]; if (!b) return; const pa = wq(b.parent), na = r.clone().multiply(wq(b)); b.quaternion.copy(pa.invert().multiply(na)); wrap.updateMatrixWorld(true); };
    const aim = (bn, cn, dir) => { const b = B[bn], c = B[cn]; if (!b || !c) return; const v = wp(c).sub(wp(b)).normalize(); rot(bn, new T.Quaternion().setFromUnitVectors(v, dir)); };
    const DN = V(0, -1, 0);
    for (const s_ of ['Left', 'Right']) {
      const out = V((s_ === 'Right' ? -1 : 1) * .14, -1, 0).normalize(); // braço levemente afastado do corpo
      aim(s_ + 'Arm', s_ + 'ForeArm', out); aim(s_ + 'ForeArm', s_ + 'Hand', DN);
      if (B[s_ + 'HandMiddle1']) aim(s_ + 'Hand', s_ + 'HandMiddle1', DN);
      aim(s_ + 'UpLeg', s_ + 'Leg', DN); aim(s_ + 'Leg', s_ + 'Foot', DN);
    }
    if (withMesh) for (const s_ of ['Left', 'Right']) { // dedos levemente fechados (segurando a arma)
      const sg = s_ === 'Right' ? 1 : -1;
      for (const f of ['Index', 'Middle', 'Ring', 'Pinky']) for (let k = 1; k <= 3; k++) rot(s_ + 'Hand' + f + k, new T.Quaternion().setFromAxisAngle(V(0, 0, 1), sg * (k === 1 ? .7 : .8)));
      for (let k = 1; k <= 3; k++) rot(s_ + 'HandThumb' + k, new T.Quaternion().setFromAxisAngle(V(0, 0, 1), sg * .25));
    }
    wrap.updateMatrixWorld(true);
    const D = { s, ry: wrap.rotation.y, oy: wrap.position.y, Q0: {}, L0: {}, hips0: wp(B.Hips), hipsParentInv: new T.Matrix4().copy(B.Hips.parent.matrixWorld).invert(), hipsParentQ: wq(B.Hips.parent), B, wrap };
    for (const k in B) { D.Q0[k] = wq(B[k]); D.L0[k] = B[k].quaternion.clone(); }
    // eixos locais para os ossos secundários (dedos, punho, ombro, pé) — "mundo" = pose de referência
    D.AX = {}; const ax = (k, w) => { if (B[k]) D.AX[k] = w.clone().applyQuaternion(D.Q0[k].clone().invert()).normalize(); };
    for (const s_ of ['Left', 'Right']) {
      for (const f of ['Index', 'Middle', 'Ring', 'Pinky', 'Thumb']) for (let k = 1; k <= 3; k++) ax(s_ + 'Hand' + f + k, V(0, 0, 1));
      ax(s_ + 'Hand', V(0, 0, 1)); ax(s_ + 'Shoulder', V(0, 0, 1)); ax(s_ + 'Foot', V(1, 0, 0)); ax(s_ + 'ToeBase', V(1, 0, 0));
    }
    D.armLen = {};
    for (const s_ of ['Left', 'Right']) if (B[s_ + 'Arm']) D.armLen[s_] = [wp(B[s_ + 'ForeArm']).distanceTo(wp(B[s_ + 'Arm'])), wp(B[s_ + 'Hand']).distanceTo(wp(B[s_ + 'ForeArm']))];
    return D;
  }

  /* Traduz as animações (parado/andar/correr) para "rotações relativas à pose de referência".
     Assim servem para qualquer pessoa calibrada, mesmo com esqueleto diferente. */
  const BAKE = ['Hips', 'Spine', 'Spine1', 'Spine2', 'LeftShoulder', 'LeftArm', 'LeftForeArm', 'LeftHand', 'RightShoulder', 'RightArm', 'RightForeArm', 'RightHand', 'LeftUpLeg', 'LeftLeg', 'LeftFoot', 'LeftToeBase', 'RightUpLeg', 'RightLeg', 'RightFoot', 'RightToeBase'];
  function bakeClips(scene, clips) {
    const D = calibrate(scene, false), B = D.B, mx = new T.AnimationMixer(scene), out = { clips: {} };
    for (const nm of ['Idle', 'Walk', 'Run']) {
      const c = clips[nm]; if (!c) continue;
      const a = mx.clipAction(c); a.reset().play();
      const n = 36, F = [], H = []; let mn = 1e9, mxz = -1e9;
      for (let i = 0; i < n; i++) {
        mx.setTime(c.duration * i / n); D.wrap.updateMatrixWorld(true);
        const f = {}; for (const k of BAKE) if (B[k]) f[k] = wq(B[k]).multiply(D.Q0[k].clone().invert());
        F.push(f); H.push(wp(B.Hips).sub(D.hips0));
        if (B.LeftFoot) { const z = wp(B.LeftFoot).z - wp(B.Hips).z; mn = Math.min(mn, z); mxz = Math.max(mxz, z); }
      }
      a.stop();
      out.clips[nm] = { n, dur: c.duration, F, H, v: Math.max(.6, 2 * (mxz - mn) / c.duration) };
    }
    mx.stopAllAction(); D.wrap.remove(scene);
    out.vWalk = out.clips.Walk ? out.clips.Walk.v : 1.4; out.vRun = out.clips.Run ? out.clips.Run.v : 4;
    return out;
  }

  /* ---------- equipamentos visíveis no corpo (capacete, colete, mochila) ---------- */
  function gearDefs(D) {
    const B = D.B, G = {};
    const put = (bone, pos) => { const m = new T.Matrix4().compose(pos, new T.Quaternion(), V(1, 1, 1)); return new T.Matrix4().copy(B[bone].matrixWorld).invert().multiply(m); };
    if (B.Head) {
      const h = wp(B.Head), top = B.HeadTop_End ? wp(B.HeadTop_End) : h.clone().add(V(0, .22, 0)), L = h.distanceTo(top);
      G.helm = { bone: 'Head', m: put('Head', h.clone().lerp(top, .52).add(V(0, 0, -.01))), r: L * .62 };
    }
    if (B.Spine2) {
      const c = wp(B.Spine2), w = B.LeftShoulder && B.RightShoulder ? wp(B.LeftShoulder).distanceTo(wp(B.RightShoulder)) : .3;
      G.vest = { bone: 'Spine2', m: put('Spine2', c.clone().add(V(0, -.07, .015))), w: Math.max(.3, w * 1.25) };
      G.bag = { bone: 'Spine2', m: put('Spine2', c.clone().add(V(0, -.12, -.2))), w: Math.max(.28, w * .95) };
    }
    return G;
  }
  let GEAR = null, BAGM = null, BAGDET = null;
  /* ALÇAS DA MOCHILA medidas no corpo do personagem (pose de referência): saem do topo da mochila, passam por cima
     do ombro, descem pela frente do peito e voltam por baixo do braço até a mochila. Presas ao Spine2. */
  function strapDefs(scene, D) {
    const B = D.B; let sk = null; scene.traverse(o => { if (o.isSkinnedMesh && !sk && o.geometry.attributes.position.count > 3000) sk = o; }); if (!sk || !B.Spine2) return null;
    const TOR = new Set(['Spine', 'Spine1', 'Spine2', 'Neck', 'LeftShoulder', 'RightShoulder'].map(n => sk.skeleton.bones.indexOf(B[n])).filter(i => i >= 0));
    const G = sk.geometry, P = G.attributes.position, SI = G.attributes.skinIndex, SW = G.attributes.skinWeight, V_ = [], v = new T.Vector3();
    sk.updateMatrixWorld(true); sk.skeleton.update();
    for (let i = 0; i < P.count; i++) { let w = 0; for (const k of ['getX', 'getY', 'getZ', 'getW']) if (TOR.has(SI[k](i))) w += SW[k](i); if (w < .55) continue; v.fromBufferAttribute(P, i); sk.boneTransform(i, v); v.applyMatrix4(sk.matrixWorld); V_.push(v.clone()); }
    if (V_.length < 200) return null;
    const near = (x, y, r) => V_.filter(q => Math.abs(q.x - x) < r && Math.abs(q.y - y) < r);
    const zF = (x, y) => { const L = near(x, y, .022); return L.length ? Math.max(...L.map(q => q.z)) : null; }, zB = (x, y) => { const L = near(x, y, .022); return L.length ? Math.min(...L.map(q => q.z)) : null; };
    const yTop = x => { const L = V_.filter(q => Math.abs(q.x - x) < .015); return L.length ? Math.max(...L.map(q => q.y)) : null; };
    const xSide = (y, s) => { const L = V_.filter(q => Math.abs(q.y - y) < .02 && q.x * s > 0); return L.length ? s * Math.max(...L.map(q => q.x * s)) : null; };
    const geos = [], sp = wp(B.Spine2), O = .012;
    for (const s of [-1, 1]) {
      const x0 = s * .085, ySh = yTop(x0); if (ySh == null) continue;
      const pts = [];
      const add = (x, y, z) => { if (z != null) pts.push(new T.Vector3(x, y, z)); };
      add(s * .08, ySh - .07, (zB(s * .08, ySh - .07) || sp.z - .1) - O - .01);   // costas, perto do topo da mochila
      add(s * .088, ySh + O, ((zB(s * .088, ySh - .02) || 0) + (zF(s * .088, ySh - .02) || 0)) / 2); // por cima do ombro
      add(s * .098, ySh - .06, (zF(s * .098, ySh - .06) || sp.z + .1) + O);       // frente, alto
      add(s * .108, ySh - .17, (zF(s * .108, ySh - .17) || sp.z + .1) + O);       // peito
      add(s * .125, ySh - .27, (zF(s * .125, ySh - .27) || sp.z + .1) + O * .8);  // embaixo do peito
      { const y = ySh - .31, xs = xSide(y, s); if (xs != null) add(xs + s * O, y, ((zB(xs - s * .03, y) || 0) + (zF(xs - s * .03, y) || 0)) / 2); } // lateral, embaixo do braço
      add(s * .12, ySh - .33, (zB(s * .12, ySh - .33) || sp.z - .1) - O - .02);   // volta para a mochila
      if (pts.length < 5) continue;
      const cv = new T.CatmullRomCurve3(pts, false, 'centripetal'), N = 48, W = .044, TH = .009, pos = [], idx = [];
      const ax = new T.Vector3(); let lastN = null;
      for (let i = 0; i <= N; i++) {
        const u = i / N, p = cv.getPoint(u), t = cv.getTangent(u);
        ax.set(0, p.y, sp.z); const n = p.clone().sub(ax); n.addScaledVector(t, -n.dot(t)); if (n.lengthSq() < 1e-6) n.copy(lastN || new T.Vector3(0, 1, 0)); n.normalize(); if (lastN) { if (n.dot(lastN) < 0) n.negate(); n.lerp(lastN, .5).normalize(); } lastN = n.clone();
        const b = new T.Vector3().crossVectors(t, n).normalize();
        for (const [bb, nn] of [[-1, 1], [1, 1], [1, -1], [-1, -1]]) pos.push(p.x + b.x * bb * W / 2 + n.x * nn * TH / 2, p.y + b.y * bb * W / 2 + n.y * nn * TH / 2, p.z + b.z * bb * W / 2 + n.z * nn * TH / 2);
        if (i) { const a = (i - 1) * 4, c = i * 4; for (let k = 0; k < 4; k++) { const k2 = (k + 1) % 4; idx.push(a + k, c + k, c + k2, a + k, c + k2, a + k2); } }
      }
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); geos.push(g);
      // regulador (fivela) no peito
      const q = cv.getPoint(.52), bk = new T.BoxGeometry(.05, .03, .014); bk.translate(q.x, q.y, q.z + .006); geos.push(bk.toNonIndexed());
    }
    if (!geos.length) return null;
    const merged = geos.map(g => { const n = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(n.attributes)) if (k !== 'position' && k !== 'normal') n.deleteAttribute(k); if (!n.attributes.normal) n.computeVertexNormals(); return n; });
    let out = merged[0]; try { if (T.BufferGeometryUtils) out = T.BufferGeometryUtils.mergeBufferGeometries(merged); else { const pp = [], nn = []; for (const m of merged) { pp.push(...m.attributes.position.array); nn.push(...m.attributes.normal.array); } out = new T.BufferGeometry(); out.setAttribute('position', new T.Float32BufferAttribute(pp, 3)); out.setAttribute('normal', new T.Float32BufferAttribute(nn, 3)); } } catch (e) { }
    return { geo: out, m: new T.Matrix4().copy(B.Spine2.matrixWorld).invert() };
  }
  // tira as alças originais do modelo (lado das costas, z > .14): elas ficavam dentro do corpo
  function noStraps(g) {
    const P = g.attributes.position, ix = g.index ? g.index.array : null, n = ix ? ix.length : P.count, keep = [];
    for (let t = 0; t < n; t += 3) { const a = ix ? ix[t] : t, b = ix ? ix[t + 1] : t + 1, c = ix ? ix[t + 2] : t + 2; if (P.getZ(a) > .14 && P.getZ(b) > .14 && P.getZ(c) > .14) continue; keep.push(a, b, c); }
    g.setIndex(keep); return g; }
  function setBag(scene) {
    const g = new T.Group(); BAGDET = new T.MeshStandardMaterial({ vertexColors: true, roughness: .72, metalness: .05 });
    scene.updateMatrixWorld(true);
    scene.traverse(o => { if (!o.isMesh) return; let gg = o.geometry.clone().applyMatrix4(o.matrixWorld); if (/detail/.test(o.name)) gg = noStraps(gg); const m = new T.Mesh(gg, null); m.name = /detail/.test(o.name) ? 'detail' : 'fabric'; m.geometry.computeBoundingSphere(); g.add(m); });
    BAGM = g;
    // item no chão / foto da mochila
    window.DZBAGMESH = () => { const c = BAGM.clone(true); c.traverse(o => { if (o.isMesh) { o.material = o.name === 'detail' ? BAGDET : (window.__dzBagFab || (window.__dzBagFab = new T.MeshStandardMaterial({ color: lin(0x4d5a3a), vertexColors: true, roughness: .9 }))); o.castShadow = true; } }); return c; };
    try { if (window.DZItem) { const _d = DZItem, _h = DZItem.has; window.DZItem = function (t) { if (/^bp[123]$/.test(t)) { const c = DZBAGMESH(); c.scale.setScalar(.55); return c; } return _d.apply(this, arguments); }; DZItem.has = t => /^bp[123]$/.test(t) || (_h ? _h(t) : false); } } catch (e) { }
    try { if (window.DZPICCLR) DZPICCLR(); } catch (e) { }
    // mochilas que já estavam no chão trocam o modelo
    try { for (const o of loot) { if (!/^bp[123]$/.test(o.t)) continue; const gg = o.g; while (gg.children.length) gg.remove(gg.children[0]); const m = DZItem(o.t); gg.add(m); gg.rotation.x = 0; gg.position.y = 0; o.top.updateMatrixWorld(true); const bb = new T.Box3().setFromObject(gg); if (bb.min.y < 1e8) gg.position.y -= bb.min.y - o.top.position.y - .01; o.top.updateMatrixWorld(true); o.top.traverse(q => { q.updateMatrix(); }); } } catch (e) { }
  }
  function gearMeshes(G) {
    if (!GEAR) {
      const helm = new T.Group();
      { const s = new T.Mesh(new T.SphereGeometry(1, 22, 12, 0, Math.PI * 2, 0, Math.PI * .56), null); s.scale.set(1.08, 1, 1.18); helm.add(s);
        const rim = new T.Mesh(new T.TorusGeometry(1.06, .06, 6, 28), null); rim.rotation.x = Math.PI / 2; rim.position.y = .16; rim.scale.set(1.04, 1.16, 1); helm.add(rim);
        const st = new T.Mesh(new T.BoxGeometry(.5, .12, .08), null); st.position.set(0, .55, 1.13); helm.add(st); }
      const vest = new T.Group();
      { const b = new T.Mesh(new T.CylinderGeometry(.5, .5, 1, 18, 1, true), null); b.scale.set(1, .38, .62); vest.add(b);
        const fp = new T.Mesh(new T.BoxGeometry(.62, .3, .05), null); fp.position.set(0, .01, .31); vest.add(fp);
        const bp = new T.Mesh(new T.BoxGeometry(.6, .3, .05), null); bp.position.set(0, .02, -.31); vest.add(bp);
        for (let i = -1; i <= 1; i++) { const p = new T.Mesh(new T.BoxGeometry(.13, .1, .06), null); p.position.set(i * .16, -.06, .355); vest.add(p); }
        for (const s of [-1, 1]) { const sh = new T.Mesh(new T.BoxGeometry(.08, .04, .5), null); sh.position.set(s * .17, .2, 0); vest.add(sh); } }
      let bag = new T.Group();
      if (BAGM) { bag = BAGM.clone(true); bag.userData.real = 1; }
      else { const b = new T.Mesh(new T.BoxGeometry(1, 1.35, .55), null); bag.add(b);
        const t = new T.Mesh(new T.CylinderGeometry(.28, .28, 1, 12), null); t.rotation.z = Math.PI / 2; t.position.set(0, .72, 0); bag.add(t);
        const p = new T.Mesh(new T.BoxGeometry(.7, .5, .2), null); p.position.set(0, -.25, .34); bag.add(p);
        for (const s of [-1, 1]) { const sd = new T.Mesh(new T.BoxGeometry(.22, .6, .4), null); sd.position.set(s * .58, -.1, 0); bag.add(sd); } }
      const hair = new T.Group();
      { const h = new T.Mesh(new T.SphereGeometry(1, 24, 14, 0, Math.PI * 2, 0, Math.PI * .6), null); h.scale.set(.9, .84, 1.0); h.position.set(0, -.1, -.1); h.rotation.x = -.55; hair.add(h); }
      GEAR = { helm, vest, bag, hair };
    }
    return GEAR;
  }
  let STRAPM = null;
  const FAB = (c, r) => new T.MeshStandardMaterial({ color: lin(c), roughness: r || .85, metalness: 0 });
  function addGear(av) {
    const G = TPL.gear, M = gearMeshes(G), B = av.B;
    const mk = (key, scale, mat, mesh) => {
      const def = G[key]; if (!def || !B[def.bone]) return null;
      const g = M[mesh || key].clone(true); g.traverse(o => { if (o.isMesh) { o.material = (o.name === 'detail' && BAGDET) ? BAGDET : mat; o.castShadow = true; } });
      if (key === 'bag' && M.bag.userData.real) { const BF = window.DZBAGFIT || [.47, -.1, .105]; g.position.set(0, BF[1], BF[2]); scale = BF[0]; }
      const holder = new T.Group(); holder.matrixAutoUpdate = false; holder.matrix.copy(def.m); holder.add(g); g.scale.setScalar(scale);
      B[def.bone].add(holder); holder.visible = false; return holder;
    };
    av.gearMat = { helm: FAB(0x3b4430, .55), vest: FAB(0x2f3828), bag: (() => { const m = FAB(0x4d5a3a, .9); m.vertexColors = true; return m; })(), hair: FAB(0x2a1d14, .95) };
    av.gear = { straps: (() => { const S = TPL.straps; if (!S || !B.Spine2) return null; const h = new T.Group(); h.matrixAutoUpdate = false; h.matrix.copy(S.m); const me = new T.Mesh(S.geo, STRAPM || (STRAPM = new T.MeshStandardMaterial({ color: lin(0x1b1d1a), roughness: .8, metalness: .05 }))); me.castShadow = true; h.add(me); B.Spine2.add(h); h.visible = false; return h; })(), hair: mk('helm', G.helm ? G.helm.r * .8 : .1, av.gearMat.hair, 'hair'), helm: mk('helm', G.helm ? G.helm.r : .13, av.gearMat.helm), vest: mk('vest', G.vest ? G.vest.w : .36, av.gearMat.vest), bag: mk('bag', G.bag ? G.bag.w * .9 : .3, av.gearMat.bag) };
  }

  /* ---------- skins: estampas de tecido geradas por código ---------- */
  const PAT = {};
  function fabricTex(kind, cols) {
    const key = kind + cols.join(',');
    if (PAT[key]) return PAT[key];
    const t = canvasTex(512, 512, (g, w, h) => {
      const r = rng(key.length * 97 + cols[0]), hx = c => '#' + c.toString(16).padStart(6, '0');
      g.fillStyle = hx(cols[0]); g.fillRect(0, 0, w, h);
      const blob = (c, n, s0, s1) => { g.fillStyle = hx(c); for (let i = 0; i < n; i++) { const x = r() * w, y = r() * h, s = s0 + r() * (s1 - s0); g.beginPath(); for (let k = 0; k < 9; k++) { const a = k / 9 * 6.283, rr = s * (.6 + r() * .6); g.lineTo(x + Math.cos(a) * rr * 1.4, y + Math.sin(a) * rr); } g.fill(); } };
      if (kind === 'woodland') { blob(cols[1], 26, 30, 60); blob(cols[2], 22, 20, 45); blob(cols[3], 18, 8, 20); }
      else if (kind === 'desert') { blob(cols[1], 30, 25, 55); blob(cols[2], 40, 4, 10); }
      else if (kind === 'urban') { blob(cols[1], 24, 20, 50); blob(cols[2], 20, 15, 35); blob(cols[3], 30, 6, 14); }
      else if (kind === 'digital') { for (const [ci, n] of [[1, 900], [2, 600], [3, 300]]) { g.fillStyle = hx(cols[ci]); for (let i = 0; i < n; i++) { const x = Math.floor(r() * 64) * 8, y = Math.floor(r() * 64) * 8, cw = 8 * (1 + Math.floor(r() * 3)), ch = 8 * (1 + Math.floor(r() * 2)); g.fillRect(x, y, cw, ch); } } }
      else if (kind === 'tiger') { g.fillStyle = hx(cols[1]); for (let i = 0; i < 40; i++) { const y = r() * h, x = r() * w; g.beginPath(); g.ellipse(x, y, 40 + r() * 70, 5 + r() * 7, (r() - .5) * .4, 0, 7); g.fill(); } g.fillStyle = hx(cols[2]); for (let i = 0; i < 30; i++) { g.beginPath(); g.ellipse(r() * w, r() * h, 20 + r() * 40, 3 + r() * 4, (r() - .5) * .4, 0, 7); g.fill(); } }
      else if (kind === 'fleck') { for (const [ci, n] of [[1, 500], [2, 400], [3, 300]]) { g.fillStyle = hx(cols[ci]); for (let i = 0; i < n; i++) { g.beginPath(); g.arc(r() * w, r() * h, 3 + r() * 6, 0, 7); g.fill(); } } }
      else if (kind === 'jeans') { for (let y = 0; y < h; y += 2) { g.fillStyle = 'rgba(255,255,255,' + (r() * .06) + ')'; g.fillRect(0, y, w, 1); } for (let i = 0; i < 3000; i++) { g.fillStyle = 'rgba(' + (r() < .5 ? '0,0,30' : '200,210,255') + ',' + r() * .12 + ')'; g.fillRect(r() * w, r() * h, 1, 3); } }
      // trama do tecido e sujeira leve
      for (let i = 0; i < 9000; i++) { g.fillStyle = 'rgba(' + (r() < .5 ? '0,0,0' : '255,255,255') + ',' + (r() * .06) + ')'; g.fillRect(r() * w, r() * h, 1 + r() * 2, 1); }
      for (let i = 0; i < 18; i++) { g.fillStyle = 'rgba(60,50,35,' + (r() * .06) + ')'; g.beginPath(); g.arc(r() * w, r() * h, 20 + r() * 60, 0, 7); g.fill(); }
    });
    t.wrapS = t.wrapT = T.RepeatWrapping; return PAT[key] = t;
  }
  // 15 roupas (mesma ordem da lista do inventário)
  const SKINS = {
    soldado: { top: ['woodland', 0x55663f, 0x3b4a2c, 0x7a7350, 0x23281c], bot: ['woodland', 0x4f5640, 0x3a4030, 0x6d6748, 0x23281c], shoe: 0x2a2620 },
    urbano: { top: ['urban', 0x6a6f76, 0x45494f, 0x8d9299, 0x2b2d31], bot: ['solid', 0x3a3d42], shoe: 0x1c1c1c },
    deserto: { top: ['desert', 0xc2a878, 0x9a8458, 0x6d5a3a], bot: ['desert', 0xb59a6a, 0x8f7a50, 0x6d5a3a], shoe: 0x7a5f3a },
    artico: { top: ['urban', 0xe6ebef, 0xb9c3cc, 0x8f9aa4, 0x5a636b], bot: ['solid', 0xc9d1d8], shoe: 0x3a3f44 },
    selva: { top: ['tiger', 0x3a6a3c, 0x1f3a22, 0x6a7a3a], bot: ['tiger', 0x355f37, 0x1c331e, 0x5f6f35], shoe: 0x231f18 },
    ouro: { top: ['solid', 0xc9a227], bot: ['solid', 0x2a2416], shoe: 0x8a6d1a },
    sangue: { top: ['urban', 0x8a1f1f, 0x4a1212, 0xb53a3a, 0x1a0808], bot: ['solid', 0x221111], shoe: 0x111111 },
    noturno: { top: ['digital', 0x2a3550, 0x1c2336, 0x3a4a6a, 0x0c101a], bot: ['digital', 0x1c2336, 0x141a28, 0x2a3550, 0x0c101a], shoe: 0x0c0c0c },
    dz_elite: { top: ['solid', 0x24262a], bot: ['solid', 0x15171a], shoe: 0xe8742d },
    digital: { top: ['digital', 0x6f7a5a, 0x4a5440, 0x9a9a78, 0x2c3226], bot: ['digital', 0x5f6a4c, 0x404a36, 0x8a8a6a, 0x2c3226], shoe: 0x2a2620 },
    tigre: { top: ['tiger', 0x8a7a50, 0x2a2a1c, 0x4a5a30], bot: ['tiger', 0x7a6a44, 0x2a2a1c, 0x4a5a30], shoe: 0x231f18 },
    flecktarn: { top: ['fleck', 0x6f7a55, 0x3e4a30, 0x2a2a20, 0x8a7a50], bot: ['fleck', 0x66704e, 0x3e4a30, 0x2a2a20, 0x8a7a50], shoe: 0x231f18 },
    neve: { top: ['digital', 0xe8ecef, 0xc4ccd3, 0x9aa4ad, 0x6a737b], bot: ['digital', 0xdfe4e8, 0xbac3ca, 0x8f99a2, 0x6a737b], shoe: 0x50565c },
    civil: { top: ['solid', 0xd8d4cc], bot: ['jeans', 0x3a5a86], shoe: 0xf2f2f2 },
    agente: { top: ['solid', 0x15171a], bot: ['solid', 0x1c1e22], shoe: 0x0c0c0c }
  };
  const SKIN_IDS = Object.keys(SKINS);
  const TONES = [0xffffff, 0xf0d8c4, 0xd9ad8c, 0xb07d5b, 0x8a5a3c, 0x5e3b26];
  const outfitOf = rig => {
    const own = rig.pl === (typeof pl !== 'undefined' ? pl : null) || rig.CM;
    const ally = !own && rig.team === 1;
    let id = null;
    if (own || ally) { try { id = OUT[selO] && OUT[selO].id; } catch (e) { } }
    if (!id || !SKINS[id]) id = SKIN_IDS[rig.seed % SKIN_IDS.length];
    return { id, own: own || ally };
  };
  function applySkin(rig) {
    const av = rig.av, o = outfitOf(rig), S = SKINS[o.id];
    let pc = null; try { if (o.own && typeof PM !== 'undefined') pc = PM; } catch (e) { }
    const hx = c => c.getHex ? c.clone().convertLinearToSRGB().getHex() : c;
    const key = o.id + (pc ? [pc.ol, pc.pt, pc.bt, pc.hl, pc.vs, pc.bg].map(m => m && m.color ? m.color.getHex() : 0).join(',') : '');
    if (key === av.skinKey) return; av.skinKey = key;
    const set = (mesh, spec, tint) => {
      if (!mesh) return; const m = mesh.material;
      if (spec[0] === 'solid') { m.map = fabricTex('solid', [tint != null ? tint : spec[1]]); }
      else m.map = fabricTex(spec[0], spec.slice(1));
      m.color.set(0xffffff); m.roughness = .92; m.metalness = 0; m.needsUpdate = true;
    };
    // roupa lisa segue a cor escolhida no inventário (camisa/calça)
    set(av.parts.top, S.top, pc && S.top[0] === 'solid' ? hx(pc.ol.color) : null);
    set(av.parts.bottom, S.bot, pc && S.bot[0] === 'solid' ? hx(pc.pt.color) : null);
    if (av.parts.shoes) { const m = av.parts.shoes.material; m.color.copy(lin(S.shoe)); m.needsUpdate = true; }
    const tone = o.own && rig.pl === (typeof pl !== 'undefined' ? pl : null) ? TONES[0] : TONES[rig.seed % TONES.length];
    if (av.parts.head) av.parts.head.material.color.copy(lin(tone));
    if (av.parts.body) { const m = av.parts.body.material; m.map = null; m.color.copy(lin(0xc89a7c)).multiply(lin(tone)); m.roughness = .7; m.needsUpdate = true; }
    if (av.gearMat) { const hc = [0x2a1d14, 0x14100c, 0x4a3420, 0x6a4a2a, 0x1c1c1c][rig.seed % 5]; av.gearMat.hair.color.copy(lin(o.own ? 0x2a1d14 : hc)); }
    if (av.parts.beard) av.parts.beard.visible = o.own ? true : rig.seed % 3 !== 0;
    if (pc && av.gearMat) { av.gearMat.helm.color.copy(pc.hl.color); av.gearMat.vest.color.copy((pc.vs || pc.dk).color); av.gearMat.bag.color.copy(pc.bg.color); }
  }
  function gearState(rig) {
    const av = rig.av; if (!av.gear) return;
    let h, v, b;
    if (typeof pl !== 'undefined' && rig.pl === pl) { try { h = ARM.helm > 0; v = ARM.vest > 0; b = bagLv > 0; } catch (e) { h = v = b = false; } }
    else { h = rig.seed % 2 === 0; v = rig.seed % 3 !== 1; b = rig.seed % 4 !== 0; }
    if (av.gear.helm) av.gear.helm.visible = !!h; if (av.gear.hair) av.gear.hair.visible = false; /* o personagem novo já tem cabelo próprio */ if (av.gear.vest) av.gear.vest.visible = !!v; if (av.gear.bag) av.gear.bag.visible = !!b; if (av.gear.straps) av.gear.straps.visible = !!b && !!av.gear.bag;
  }

  function load() {
    if (!window.THREE || !T.GLTFLoader) return;
    const get = (url, cb) => {
      if (url.startsWith('data:')) new T.GLTFLoader().parse(b64ab(url), '', cb, e => console.warn(e));
      else new T.GLTFLoader().load(url, cb, undefined, e => console.warn(url, e));
    };
    let human = null, anim = null, bagOk = false;
    const done = () => {
      if (!human || !anim || !bagOk) return;
      try { ANI = bakeClips(anim.scene, Object.fromEntries((anim.animations || []).map(c => [c.name, c]))); } catch (e) { console.warn('animações', e); }
      const scene = human.scene;
      scene.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false; if (o.material) o.material.envMapIntensity = .7; } });
      const D = calibrate(scene, true);
      TPL = { scene, D, gear: gearDefs(D) }; try { TPL.straps = strapDefs(scene, D); } catch (e) { } D.wrap.remove(scene); DZR.ready = true;
      for (const r of DZR.rigs) attach(r);
    };
    try {
      get(ASSET.human, g => { human = g; done(); }); get(ASSET.anim, g => { anim = g; done(); });
      // mochila (nível 1; os níveis 2 e 3 usam o mesmo visual por enquanto)
      new T.GLTFLoader().load(ASSET.bag1.startsWith('data:') ? ASSET.bag1 : ASSET.bag1, g => { try { setBag(g.scene); } catch (e) { } bagOk = true; done(); }, undefined, () => { bagOk = true; done(); });
    } catch (e) { bagOk = true; }
  }

  function attach(rig) {
    if (rig.av || !TPL) return;
    const scn = T.SkeletonUtils.clone(TPL.scene), B = boneMap(scn), D = TPL.D;
    for (const k in B) B[k].quaternion.copy(D.L0[k]);
    const inner = new T.Group(); inner.rotation.y = D.ry; inner.scale.setScalar(D.s); inner.position.y = D.oy; inner.add(scn);
    const root = new T.Group(); root.scale.set(-1, 1, 1); root.add(inner); // espelho: arma na mão direita
    const parts = {};
    scn.traverse(o => {
      if (!o.isMesh) return;
      const n = o.name;
      const k = /Outfit_Top/.test(n) ? 'top' : /Outfit_Bottom/.test(n) ? 'bottom' : /Footwear/.test(n) ? 'shoes' : /Wolf3D_Body/.test(n) ? 'body' : /Wolf3D_Head/.test(n) ? 'head' : /Beard/.test(n) ? 'beard' : null;
      if (k) { o.material = o.material.clone(); parts[k] = o; }
    });
    rig.pl.add(root);
    rig.av = { root, inner, B, parts, near: false, lw: 0, ph: Math.random(), pi: Math.random() };
    try { addGear(rig.av); } catch (e) { console.warn('gear', e); }
    root.visible = false;
  }

  DZR.reg = function (rig, lo, CM) {
    rig.CM = CM; rig.lo = lo; rig.pm = [];
    rig.pl.traverse(o => { if (o.isMesh) rig.pm.push(o); });
    rig.seed = Math.floor(Math.random() * 1e6);
    DZR.rigs.push(rig); hook();
    if (TPL) attach(rig);
  };

  // pose do segmento procedural no espaço do avatar (espelhado em X)
  function jq(rig, j, out) { _m.multiplyMatrices(rig.inv, j.matrixWorld); _m.decompose(_p, out, _s); out.set(out.x, -out.y, -out.z, out.w); return out; }
  function jp(rig, j, lx, ly, lz, out) { out.set(lx, ly, lz).applyMatrix4(j.matrixWorld).applyMatrix4(rig.inv); out.x = -out.x; return out; }

  const QH = new T.Quaternion(), QT = new T.Quaternion(), QHd = new T.Quaternion(), QA = {}, QW = {};
  function ikArm(rig, side, j) {
    const B = rig.av.B, D = TPL.D, arm = B[side + 'Arm'], fa = B[side + 'ForeArm'], hd = B[side + 'Hand'];
    if (!arm || !fa || !hd || !D.armLen[side]) return;
    // peso do IK: mão à frente do tronco = segurando algo
    const gl = _e.set(0, -.31, 0).applyMatrix4(j.el.matrixWorld); rig.tor.worldToLocal(gl);
    const w = Math.max(0, Math.min(1, (gl.z - .06) / .14)); rig.ikw = rig.ikw || {}; rig.ikw[side] = w; if (w <= .01) return;
    const grip = jp(rig, j.el, 0, -.31, 0, _a), elb = jp(rig, j.el, 0, 0, 0, _b);
    const dir = _c.copy(grip).sub(elb); const dl = dir.length(); if (dl > 1e-4) dir.multiplyScalar(1 / dl);
    const T_ = grip.addScaledVector(dir, -.07);
    const toA = v => { v.applyMatrix4(rig.ainv); return v; };
    const S = toA(_d.setFromMatrixPosition(arm.matrixWorld)), E = toA(new T.Vector3().setFromMatrixPosition(fa.matrixWorld)), H = toA(new T.Vector3().setFromMatrixPosition(hd.matrixWorld));
    const L1 = D.armLen[side][0], L2 = D.armLen[side][1];
    const st = new T.Vector3().subVectors(T_, S); let d = st.length(); if (d < 1e-4) return; st.multiplyScalar(1 / d);
    d = Math.min(d, (L1 + L2) * .999); d = Math.max(d, Math.abs(L1 - L2) + .01);
    const pole = new T.Vector3().subVectors(E, S); pole.addScaledVector(st, -pole.dot(st)); if (pole.lengthSq() < 1e-6) pole.set(0, 0, -1); pole.normalize();
    const ca = Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))), sa = Math.sqrt(1 - ca * ca);
    const E2 = new T.Vector3().copy(S).addScaledVector(st, ca * L1).addScaledVector(pole, sa * L1);
    const q1 = new T.Quaternion().setFromUnitVectors(_e.subVectors(E, S).normalize(), new T.Vector3().subVectors(E2, S).normalize());
    const H1 = new T.Vector3().subVectors(H, E).applyQuaternion(q1).add(E2);
    const Tc = new T.Vector3().copy(S).addScaledVector(st, d);
    const q2 = new T.Quaternion().setFromUnitVectors(H1.sub(E2).normalize(), Tc.sub(E2).normalize());
    const I = new T.Quaternion(); if (w < 1) { q1.slerp(I, 1 - w); q2.slerp(I, 1 - w); }
    const armA = q1.clone().multiply(QA[side + 'Arm']), faA = q2.clone().multiply(q1).multiply(QA[side + 'ForeArm']);
    arm.quaternion.copy(QW[side + 'ArmP'].clone().invert().multiply(armA));
    fa.quaternion.copy(armA.clone().invert().multiply(faA));
  }

  const LOWER = new Set(['Hips', 'LeftUpLeg', 'LeftLeg', 'LeftFoot', 'LeftToeBase', 'RightUpLeg', 'RightLeg', 'RightFoot', 'RightToeBase']);
  const ALLB = new Set(BAKE);
  const _qa = new T.Quaternion(), _qb = new T.Quaternion();
  function sampleQ(c, ph, k, out) {
    const f = ph * c.n, i0 = Math.floor(f) % c.n, i1 = (i0 + 1) % c.n, t = f - Math.floor(f);
    const a = c.F[i0][k], b = c.F[i1][k]; if (!a) return null; return out.copy(a).slerp(b, t);
  }
  function sampleH(c, ph, out) { const f = ph * c.n, i0 = Math.floor(f) % c.n, i1 = (i0 + 1) % c.n, t = f - Math.floor(f); return out.copy(c.H[i0]).lerp(c.H[i1], t); }
  // animações de captura de movimento (parado/andar/correr) misturadas à pose do jogo
  function loco(rig, dt) {
    const av = rig.av, L = rig.loco; if (!ANI || !ANI.clips.Idle || !ANI.clips.Walk || !ANI.clips.Run) return null;
    av.lw += (((L && L.w) || 0) - av.lw) * Math.min(1, dt * 8); if (av.lw < .01) return null;
    const sp = Math.max(0, L.sp || 0), cI = ANI.clips.Idle, cW = ANI.clips.Walk, cR = ANI.clips.Run;
    const wi = Math.max(0, 1 - sp / .7), wr = Math.max(0, Math.min(1, (sp - 2.3) / 1.6)), ww = Math.max(0, 1 - wi - wr);
    const rate = (ww * sp / ANI.vWalk / cW.dur + wr * sp / ANI.vRun / cR.dur) / Math.max(.001, ww + wr);
    av.ph = (av.ph + dt * rate * ((L.fw != null && L.fw < -.3) ? -1 : 1) + 1) % 1;
    av.pi = (av.pi + dt / cI.dur) % 1;
    const set = L.arm ? LOWER : ALLB, sv = { D: {}, w: av.lw };
    const mv = ww + wr > 0 ? wr / (ww + wr) : 0;
    for (const k of set) {
      const qw = sampleQ(cW, av.ph, k, new T.Quaternion()); if (!qw) continue;
      if (mv > 0) qw.slerp(sampleQ(cR, av.ph, k, _qa), mv);
      if (wi > 0) qw.slerp(sampleQ(cI, av.pi, k, _qb), wi);
      sv.D[k] = qw;
    }
    const h = sampleH(cW, av.ph, new T.Vector3()); if (mv > 0) h.lerp(sampleH(cR, av.ph, _c), mv); if (wi > 0) h.lerp(sampleH(cI, av.pi, _d), wi);
    sv.hp = h; return sv;
  }

  /* ---------- OSSOS SECUNDÁRIOS: dedos, punhos, clavículas, pés e piscar ----------
     Cada mão tem 15 ossos de dedo. A mão fecha na arma, abre e espalma ao apoiar no obstáculo,
     relaxa parada e abre no ar; o punho dobra para trás ao apoiar; os ombros sobem ao alcançar;
     os pés apontam no salto e no ar; os olhos piscam. */
  const _qx = new T.Quaternion(), XA = new T.Vector3(1, 0, 0);
  const FING = ['Index', 'Middle', 'Ring', 'Pinky'], BLK = window.DZBLK || 1;
  function qrot(b, D, k, ang) { const a = D.AX[k]; if (!b || !a) return; b.quaternion.copy(D.L0[k]).multiply(_qx.setFromAxisAngle(a, ang)); }
  function secState(rig, dt, sv) {
    const av = rig.av, F = av.fs || (av.fs = { g: [.5, .5], wr: [0, 0], sh: [0, 0], ft: 0, bl: 0, bt: 1 + Math.random() * 3, t: Math.random() * 9 });
    F.t += dt;
    const isP = typeof pl !== 'undefined' && rig.pl === pl, md = typeof mode !== 'undefined' ? mode : '';
    const vlt = isP && typeof VLT !== 'undefined' && VLT, rope = isP && typeof RIDE !== 'undefined' && RIDE;
    let air = false; try { air = isP ? (md === 'sky' || md === 'chute' || (md === 'ground' && !vlt && !rope && P.y > GY(P.x, P.z, P.y) + .35)) : !!rig.air; } catch (e) { }
    const L = rig.loco, armed = !!(L && L.arm), ik = rig.ikw || {};
    let gR, gL, wR = 0, wL = 0, sh = 0, ft = 0;
    if (vlt) { const u = vlt.t, hold = u < .55 ? 1 : 0; gR = gL = hold ? .08 : .45; wR = wL = hold ? -1 * Math.min(1, u / .12) : 0; sh = hold ? .28 : .05; ft = .55 * vltTuck(u); }
    else if (rope) { gR = gL = 1.05; sh = .35; ft = .25; }
    else if (md === 'chute' && isP) { gR = gL = .95; sh = .2; ft = .3; }
    else if (air) { gR = gL = .22 + .06 * Math.sin(F.t * 7); wR = wL = .12 * Math.sin(F.t * 5.3); ft = .5; }
    else if (armed) { gR = (ik.Right || 0) > .3 ? 1 : .7; gL = (ik.Left || 0) > .3 ? .95 : .6; }
    else { const br = .04 * Math.sin(F.t * 1.6); gR = .5 + br; gL = .48 + br; wR = wL = .1; }
    const lw = sv ? sv.w : 0; ft *= 1 - lw;
    const k = Math.min(1, dt * 12), kk = Math.min(1, dt * 8);
    F.g[0] += (gR - F.g[0]) * k; F.g[1] += (gL - F.g[1]) * k; F.wr[0] += (wR - F.wr[0]) * k; F.wr[1] += (wL - F.wr[1]) * k;
    F.sh[0] += (sh - F.sh[0]) * kk; F.ft += (ft - F.ft) * kk;
    // piscar: a cada 2–5 s, ~0,14 s
    F.bt -= dt; if (F.bt <= 0) { F.bl = .14; F.bt = 2 + Math.random() * 3.2; } F.blo = F.bl > 0; F.bl = Math.max(0, F.bl - dt);
    return F;
  }
  function shoulders(rig, F) {
    const B = rig.av.B, D = TPL.D;
    for (const s_ of ['Left', 'Right']) {
      const k = s_ + 'Shoulder', b = B[k], a = D.AX[k]; if (!b || !a || F.sh[0] < .005) continue;
      const E = _qx.setFromAxisAngle(a, (s_ === 'Left' ? 1 : -1) * F.sh[0]); b.quaternion.multiply(E);
      if (QW[s_ + 'ArmP']) { QW[s_ + 'ArmP'].multiply(E); const arm = B[s_ + 'Arm'], fa = B[s_ + 'ForeArm']; if (arm) QA[s_ + 'Arm'] = QW[s_ + 'ArmP'].clone().multiply(arm.quaternion); if (fa && QA[s_ + 'Arm']) QA[s_ + 'ForeArm'] = QA[s_ + 'Arm'].clone().multiply(fa.quaternion); }
    }
  }
  function secondary(rig, F) {
    const B = rig.av.B, D = TPL.D;
    for (const [i, s_] of [[0, 'Right'], [1, 'Left']]) {
      const sg = s_ === 'Right' ? 1 : -1, g = F.g[i];
      for (const f of FING) for (let k = 1; k <= 3; k++) {
        const n = s_ + 'Hand' + f + k; // L0 = mão fechada (curva .7/.8 por falange); abre proporcionalmente
        let a = sg * (k === 1 ? .7 : .8) * (g - 1);
        if (g < .3 && k === 1) a += 0; qrot(B[n], D, n, a);
      }
      for (let k = 1; k <= 3; k++) { const n = s_ + 'HandThumb' + k; qrot(B[n], D, n, sg * .25 * (g - 1) * (k === 1 ? .6 : 1) + (g > .9 ? sg * .25 * (k - 1) * .5 : 0)); }
      const hn = s_ + 'Hand'; if (Math.abs(F.wr[i]) > .003 && B[hn] && D.AX[hn]) B[hn].quaternion.multiply(_qx.setFromAxisAngle(D.AX[hn], sg * F.wr[i]));
      for (const fn of [s_ + 'Foot']) if (F.ft > .005 && B[fn] && D.AX[fn]) B[fn].quaternion.multiply(_qx.setFromAxisAngle(D.AX[fn], F.ft));
      // pálpebras
      const e1 = 'Bip01_' + s_[0] + 'EyeBlinkTop', e2 = 'Bip01_' + s_[0] + 'EyeBlinkBottom', bl = F.bl > 0 ? Math.sin((1 - F.bl / .14) * Math.PI) : 0;
      if (bl > 0 || F.blo) for (const [e, a] of [[e1, -1.05], [e2, .22]]) if (B[e] && D.L0[e]) B[e].quaternion.setFromAxisAngle(XA, a * bl * BLK).multiply(D.L0[e]); // eixo X do pai (como no Max)
    }
  }

  function pose(rig, dt) {
    const av = rig.av, B = av.B, D = TPL.D;
    const sv = loco(rig, dt || .016);
    rig.pl.updateMatrixWorld(true);
    rig.inv = (rig.inv || new T.Matrix4()).copy(rig.pl.matrixWorld).invert();
    jq(rig, rig.hips, QH); jq(rig, rig.tor, QT); jq(rig, rig.head, QHd);
    const tgt = {
      Hips: QH, Spine: QH.clone().slerp(QT, .34), Spine1: QH.clone().slerp(QT, .67), Spine2: QT,
      Neck: QT.clone().slerp(QHd, .5), Head: QHd,
      RightArm: jq(rig, rig.aR.sh, new T.Quaternion()), RightForeArm: jq(rig, rig.aR.el, new T.Quaternion()),
      LeftArm: jq(rig, rig.aL.sh, new T.Quaternion()), LeftForeArm: jq(rig, rig.aL.el, new T.Quaternion()),
      RightUpLeg: jq(rig, rig.lg2.th, new T.Quaternion()), RightLeg: jq(rig, rig.lg2.kn, new T.Quaternion()),
      LeftUpLeg: jq(rig, rig.lg1.th, new T.Quaternion()), LeftLeg: jq(rig, rig.lg1.kn, new T.Quaternion())
    };
    const walk = (b, parentA) => {
      const k = bname(b); let A;
      if (tgt[k]) A = tgt[k].clone().multiply(D.Q0[k]); else A = parentA.clone().multiply(D.L0[k] || b.quaternion);
      if (sv && sv.D[k]) A.slerp(sv.D[k].clone().multiply(D.Q0[k]), sv.w);
      b.quaternion.copy(parentA.clone().invert().multiply(A));
      if (k === 'RightArm' || k === 'LeftArm') QW[k + 'P'] = parentA.clone();
      if (k === 'RightArm' || k === 'LeftArm' || k === 'RightForeArm' || k === 'LeftForeArm') QA[k] = A;
      for (const c of b.children) if (c.isBone) walk(c, A);
    };
    // quadril: posição (segue o esqueleto do jogo; nas animações reais, o balanço do mocap)
    const hp = jp(rig, rig.hips, 0, 0, 0, new T.Vector3()), off = D.hips0.clone().sub(V(0, .95, 0));
    const pos = hp.add(off.applyQuaternion(QH));
    if (sv) pos.lerp(D.hips0.clone().add(sv.hp), sv.w);
    B.Hips.position.copy(pos.applyMatrix4(D.hipsParentInv));
    walk(B.Hips, D.hipsParentQ);
    const near_ = rig._dist < 22, F = near_ ? secState(rig, dt || .016, sv) : null;
    if (F) shoulders(rig, F);
    rig.ainv = (rig.ainv || new T.Matrix4()).copy(av.root.matrixWorld).invert();
    if (rig.ikw) rig.ikw.Right = rig.ikw.Left = 0;
    if (rig._dist < 30 && !(sv && !rig.loco.arm && sv.w > .5)) { av.inner.updateMatrixWorld(true); ikArm(rig, 'Right', rig.aR); ikArm(rig, 'Left', rig.aL); }
    if (F) secondary(rig, F);
  }

  function effVisible(o) { while (o) { if (!o.visible) return false; if (o.isScene) return true; o = o.parent; } return false; }

  let hooked = false;
  function hook() {
    if (hooked || typeof ren === 'undefined') return; hooked = true;
    const _r = ren.render.bind(ren);
    ren.render = function (s_, c_) {
      try { if (c_ === cam) update(); } catch (e) { if (!DZR._err) { DZR._err = 1; console.warn('DZR', e); } }
      return _r(s_, c_);
    };
  }
  /* ---------- grama densa ao redor do jogador ---------- */
  let GF = null;
  const hsh = (a, b, k) => { const v = Math.sin(a * 127.1 + b * 311.7 + k * 74.7) * 43758.5453; return v - Math.floor(v); };
  function grassField() {
    if (typeof P === 'undefined' || typeof mode === 'undefined' || typeof FP === 'undefined') return;
    const q = (typeof CFG !== 'undefined' && CFG.q != null) ? CFG.q : (window.DZ_DEFQ != null ? DZ_DEFQ : 2);
    if (!GF) { const m = new T.InstancedMesh(DZR.grassGeo(), mats().grass, 3200); m.instanceColor = new T.InstancedBufferAttribute(new Float32Array(3200 * 3).fill(1), 3); m.count = 0; m.frustumCulled = false; m.receiveShadow = true; m.castShadow = false; m.instanceMatrix.setUsage(T.DynamicDrawUsage); sc.add(m); GF = { m, cx: 1e9, cz: 1e9, q: -1 }; }
    const on = (mode === 'ground' || mode === 'chute' || mode === 'drive') && q > 0 && Math.abs(P.x) < 1200 && Math.abs(P.z) < 1200 && P.y < 30;
    GF.m.visible = on; if (!on) return;
    const cx = Math.round(P.x / 10) * 10, cz = Math.round(P.z / 10) * 10; if (cx === GF.cx && cz === GF.cz && q === GF.q) return; GF.cx = cx; GF.cz = cz; GF.q = q;
    const Rr = q >= 2 ? 30 : 18, M = GF.m, o = new T.Object3D(), col = new T.Color();
    const fp = FP.filter(b => b.x1 > cx - Rr - 2 && b.x0 < cx + Rr + 2 && b.z1 > cz - Rr - 2 && b.z0 < cz + Rr + 2);
    const rd = RDS.filter(r => r[2] > cx - Rr - 8 && r[0] < cx + Rr + 8 && r[3] > cz - Rr - 8 && r[1] < cz + Rr + 8);
    const hp = (typeof HPADS !== 'undefined' ? HPADS : []).filter(h => Math.hypot(h.x - cx, h.z - cz) < Rr + 12);
    const lk = LK.filter(l => Math.hypot(l.x - cx, l.z - cz) < l.r + Rr + 9), ct = CITIES.filter(c => !c.blank && Math.abs(c.x - cx) < 95 + Rr && Math.abs(c.z - cz) < 95 + Rr);
    const cs = 1.45; let n = 0;
    for (let gx = Math.floor((cx - Rr) / cs); gx <= Math.ceil((cx + Rr) / cs) && n < 3200; gx++) for (let gz = Math.floor((cz - Rr) / cs); gz <= Math.ceil((cz + Rr) / cs) && n < 3200; gz++) {
      const h1 = hsh(gx, gz, 1), h2 = hsh(gx, gz, 2), h3 = hsh(gx, gz, 3);
      if (h3 < .2) continue;
      if (window.TERG && TERG((gx + h1) * cs, (gz + h2) * cs) < .5) continue;
      const x = (gx + h1) * cs, z = (gz + h2) * cs, d = Math.hypot(x - P.x, z - P.z); if (d > Rr) continue;
      if (ct.some(c => Math.abs(x - c.x) < 95 && Math.abs(z - c.z) < 95)) continue;
      if (rd.some(r => x > r[0] - .6 && x < r[2] + .6 && z > r[1] - .6 && z < r[3] + .6)) continue;
      if (fp.some(b => x > b.x0 - .8 && x < b.x1 + .8 && z > b.z0 - .8 && z < b.z1 + .8)) continue;
      if (lk.some(l => Math.hypot(x - l.x, z - l.z) < l.r + 7.5)) continue;
      if (hp.some(h => Math.hypot(x - h.x, z - h.z) < 9.5)) continue;
      let gy = 0; const th = TERH(x, z); try { gy = GY(x, z, th + .5); } catch (e) { } if (gy > th + .05) continue;
      const fade = Math.min(1, (Rr - d) / 6), sc_ = (.75 + h3 * .7) * fade;
      o.position.set(x, TERH(x, z), z); o.rotation.set(0, h1 * 6.283, 0); o.scale.set(sc_ * (1 + h2 * .4), sc_ * (.8 + h1 * .6), sc_); o.updateMatrix();
      M.setMatrixAt(n, o.matrix); const k = .8 + h2 * .3; col.setRGB(k, k * (.95 + h1 * .1), k * (.75 + h3 * .2)); M.setColorAt(n, col); n++;
    }
    M.count = n; M.instanceMatrix.needsUpdate = true; if (M.instanceColor) M.instanceColor.needsUpdate = true;
  }

  let lastT = 0;
  function update() {
    const now = performance.now(), dt = Math.min(.1, (now - lastT) / 1000); lastT = now;
    for (const nm of DZR.water) { nm.offset.x += dt * .012; nm.offset.y += dt * .007; }
    WT.value += dt; if (flT > 0) { flT -= dt; if (flT <= 0 && FLASH) FLASH.intensity = 0; }
    try { DZR.shardTick(dt); if (DZR._fallT) DZR._fallT.value += dt; if (typeof mode !== 'undefined' && mode !== 'plane' && mode !== 'lobby' && cam.position.y < TERH(cam.position.x, cam.position.z) + .45) cam.position.y = TERH(cam.position.x, cam.position.z) + .45; } catch (e) { }
    try { grassField(); } catch (e) { if (!DZR._gerr) { DZR._gerr = 1; console.warn('grass', e); } }
    if (!TPL) return;
    const q = (typeof CFG !== 'undefined' && CFG.q != null) ? CFG.q : (window.DZ_DEFQ != null ? DZ_DEFQ : 2), lod = q === 0 ? 30 : q === 1 ? 50 : DZR.lod;
    const cp = cam.position;
    for (let i = DZR.rigs.length - 1; i >= 0; i--) {
      const rig = DZR.rigs[i]; if (!rig.av) attach(rig); const av = rig.av; if (!av) continue;
      const vis = effVisible(rig.pl);
      if (!vis) { if (!rig.pl.parent && rig.dead_) { DZR.rigs.splice(i, 1); } continue; }
      rig.pl.getWorldPosition(_a); const dist = rig._dist = _a.distanceTo(cp);
      const near = dist < lod;
      if (near !== av.near) { av.near = near; av.root.visible = near; for (const m of rig.pm) m.visible = !near; }
      if (!near) continue;
      // roupa (skin) e equipamentos visíveis
      applySkin(rig); gearState(rig);
      pose(rig, dt);
    }
  }
  DZR.update = update;

  // inicia o carregamento assim que o THREE estiver pronto
  load();
})();
