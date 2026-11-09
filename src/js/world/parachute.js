/* Deadzone · world/parachute.js
 * PARAQUEDAS REALISTA: velame retangular (asa "ram-air") com linhas, no lugar da cúpula redonda.
 * Modelo: parapente "paraglider-red-ridge" da SwissAirfields (CC0), só o velame e as linhas.
 *
 * Movimento "flexível" feito no shader (barato no celular):
 *  - abertura: sai amassado e estreito, infla e dá um pequeno "tranco" até abrir de vez;
 *  - vento: o tecido ondula o tempo todo, mais no bordo de fuga;
 *  - curva: o velame inclina para o lado e o lado de dentro abaixa o bordo de fuga (freio);
 *  - balanço: inclinação e direção seguem o jogador com mola (atraso e leve vai-e-vem).
 * As cores vêm da skin de paraquedas escolhida (PAR em ui/skins.js).
 */
(function () {
  if (typeof canopy === 'undefined') return;
  const U = { uT: { value: 0 }, uOpen: { value: 1 }, uTurn: { value: 0 }, uDive: { value: 0 },
    uA: { value: new T.Color(0xe8742d).convertSRGBToLinear() }, uB: { value: new T.Color(0xf2f2f2).convertSRGBToLinear() }, uC: { value: 0 }, tTop: { value: null }, tBot: { value: null } };
  const ST = { ready: false, holder: null, open: 1, t: 0, was: false, roll: 0, rv: 0, pitch: 0, pv: 0, yaw: null, turn: 0, H: 6.6, SP: 4.6 };
  const DZChute = window.DZChute = { ready: false };

  // deformação do velame e das linhas (espaço do paraquedas: y sobe a partir do ponto das linhas, x = envergadura, +z = frente)
  const VERT = `
    float wy=clamp(transformed.y/${ST.H.toFixed(2)},0.,1.),w=wy*wy;
    float sx=clamp(transformed.x/${ST.SP.toFixed(2)},-1.,1.);
    float ch=clamp((1.3-transformed.z)/2.6,0.,1.);
    float o=uOpen;
    transformed.y+=(sin(uT*3.1+transformed.x*.9)*.05+sin(uT*7.7+transformed.x*2.3+transformed.z*3.)*.028*ch)*w;
    transformed.z+=sin(uT*5.3+transformed.x*1.7)*.045*ch*w;
    float br=max(0.,uTurn*sx);transformed.y-=br*ch*1.1*w;transformed.z+=br*ch*.35*w;
    transformed.y-=uDive*.12*(1.-ch)*w;
    transformed.x*=mix(.16,1.,clamp(o,0.,1.15));
    transformed.y=mix(transformed.y*.5+2.2*w,transformed.y,clamp(o,0.,1.));
    transformed+=vec3(sin(transformed.y*3.1+uT*21.),sin(transformed.x*2.3+uT*17.)*.6,cos(transformed.x*3.7+uT*23.))*.42*(1.-clamp(o,0.,1.))*w;`;
  function patch(m, isWing, key) {
    m.side = T.DoubleSide;
    m.onBeforeCompile = s => {
      Object.assign(s.uniforms, m.userData.U || U);
      s.vertexShader = 'uniform float uT,uOpen,uTurn,uDive;varying vec3 vDzP;varying float vDzN;varying vec2 vDzU;attribute vec2 dzUv;\n' + s.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvDzP=position;vDzN=objectNormal.y;vDzU=dzUv;' + VERT);
      if (isWing) s.fragmentShader = 'uniform vec3 uA,uB;uniform float uC;uniform sampler2D tTop,tBot;varying vec3 vDzP;varying float vDzN;varying vec2 vDzU;\n' + s.fragmentShader.replace('#include <map_fragment>', `
        if(uC>.5){vec2 q=vDzU;vec3 cc=(gl_FrontFacing==(vDzN>=0.))?texture2D(tTop,q).rgb:texture2D(tBot,vec2(q.x,1.-q.y)).rgb*1.35;diffuseColor.rgb*=pow(cc,vec3(2.2));}else{
        vec4 texelColor=mapTexelToLinear(texture2D(map,vUv));
        float mx_=max(max(texelColor.r,texelColor.g),texelColor.b),sat=mx_-min(min(texelColor.r,texelColor.g),texelColor.b);
        float orange=smoothstep(.25,.45,texelColor.g)*step(.3,sat);
        vec3 col=mix(uB,mix(uA,uA*.78+uB*.12,orange),smoothstep(.2,.45,sat));
        diffuseColor.rgb*=col;}`);
    };
    m.customProgramCacheKey = () => 'dzchute' + (isWing ? 'w' : 'l') + (key || '');
    m.needsUpdate = true;
  }

  new T.GLTFLoader().load('assets/models/parachute.glb', gl => {
    const s = gl.scene; s.updateMatrixWorld(true);
    // ponto onde as linhas se encontram (vira o "ombro" do jogador)
    const v = new T.Vector3(), pts = []; let minY = 1e9;
    s.traverse(o => { if (!o.isMesh) return; const p = o.geometry.attributes.position; for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld); pts.push(v.x, v.y, v.z); if (v.y < minY) minY = v.y; } });
    let ax = 0, az = 0, n = 0; for (let i = 0; i < pts.length; i += 3) if (pts[i + 1] < minY + .35) { ax += pts[i]; az += pts[i + 2]; n++; }
    ax /= Math.max(1, n); az /= Math.max(1, n);
    // junta tudo no espaço do paraquedas: origem nas linhas, envergadura no X, frente (bordo de ataque, -X no modelo) para +Z
    const holder = new T.Group(), mats = [];
    s.traverse(o => {
      if (!o.isMesh) return;
      const g = o.geometry.clone(); g.applyMatrix4(o.matrixWorld); g.translate(-ax, -minY, -az); g.rotateY(Math.PI / 2); g.computeBoundingSphere();
      try { const P_ = g.attributes.position, n_ = P_.count; let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9, ym = -1e9, yt = 1e9;
        for (let i = 0; i < n_; i++) { const x = P_.getX(i), y = P_.getY(i), z = P_.getZ(i); if (x < x0) x0 = x; if (x > x1) x1 = x; if (z < z0) z0 = z; if (z > z1) z1 = z; if (y > ym) ym = y; }
        const xm = (x1 - x0) / 2, xc = (x0 + x1) / 2; for (let i = 0; i < n_; i++) if (Math.abs(Math.abs(P_.getX(i) - xc) - xm) < .25) yt = Math.min(yt, P_.getY(i));
        const yc = Math.abs(yt - ym) > .05 ? (xm * xm + yt * yt - ym * ym) / (2 * (yt - ym)) : ym - 50, am = Math.atan2(xm, yt - yc), A_ = new Float32Array(n_ * 2);
        const ang = new Float32Array(n_); let a0 = 1e9, a1 = -1e9; for (let i = 0; i < n_; i++) { const a = Math.atan2(P_.getX(i) - xc, P_.getY(i) - yc); ang[i] = a; if (a < a0) a0 = a; if (a > a1) a1 = a; }
        for (let i = 0; i < n_; i++) { A_[i * 2] = 1 - (ang[i] - a0) / Math.max(1e-4, a1 - a0); A_[i * 2 + 1] = (P_.getZ(i) - z0) / Math.max(.01, z1 - z0); }
        g.setAttribute('dzUv', new T.BufferAttribute(A_, 2)); } catch (er) { }
      const m = o.material.clone(), wing = /wing/i.test(m.name); patch(m, wing); mats.push(m);
      if (wing) { m.roughness = .82; m.metalness = 0; m.emissive = new T.Color(0x000000); }
      const me = new T.Mesh(g, m); me.castShadow = wing; me.receiveShadow = false; me.frustumCulled = false; me.userData.wing = wing; holder.add(me);
    });
    for (const c of canopy.children) c.visible = false;
    canopy.add(holder); ST.holder = holder; ST.mats = mats; ST.ready = DZChute.ready = true;
    try { if (typeof PAR !== 'undefined' && typeof selP !== 'undefined') DZChute.skin(PAR[selP]); } catch (e) { }
  }, undefined, e => console.warn('paraquedas', e));

  DZChute.fallback = function () { if (ST.holder) ST.holder.visible = false; for (const c of canopy.children) if (c !== ST.holder) c.visible = true; ST.ready = DZChute.ready = false; console.warn('paraquedas: usando o modelo simples'); };
  DZChute.skin = function (pk) { if (!pk) return; U.uA.value.set(pk.c).convertSRGBToLinear(); U.uB.value.set(pk.c2 != null ? pk.c2 : 0xf2f2f2).convertSRGBToLinear();
    const C = pk.custom && CUSTOM[pk.custom]; U.uC.value = C ? 1 : 0; if (C) { U.tTop.value = C.top(); U.tBot.value = C.bot(); } };
  // ---------- SKIN PERSONALIZADA "DEADZONE RED" (topo com o nome do jogo; embaixo, emblema e faixas) ----------
  const mkTex = f => { const c = document.createElement('canvas'); c.width = 1024; c.height = 512; f(c.getContext('2d'), 1024, 512); const t = new T.CanvasTexture(c); t.anisotropy = 8; t.userData = { cv: c }; return t; };
  const RED = '#c62828', RED2 = '#8e1414', DK = '#17191c', DK2 = '#24272b', WH = '#f2f2ee';
  function hazard(g, x, y, w, h, s) { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.fillStyle = DK; g.fillRect(x, y, w, h); g.fillStyle = RED; for (let k = -h; k < w + h; k += s * 2) { g.beginPath(); g.moveTo(x + k, y + h); g.lineTo(x + k + s, y + h); g.lineTo(x + k + s + h, y); g.lineTo(x + k + h, y); g.fill(); } g.restore(); }
  function cells(g, w, h) { g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 3; for (let x = 0; x <= w; x += w / 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } }
  function crosshair(g, cx, cy, r, col) { g.strokeStyle = col; g.lineWidth = r * .14; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke(); g.lineWidth = r * .1; for (const [a, b] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) { g.beginPath(); g.moveTo(cx + a * r * .45, cy + b * r * .45); g.lineTo(cx + a * r * 1.3, cy + b * r * 1.3); g.stroke(); } g.fillStyle = col; g.beginPath(); g.arc(cx, cy, r * .14, 0, 7); g.fill(); }
  function title(g, x, y, size, a, b) { g.save(); g.font = 'italic 900 ' + size + 'px Impact, Haettenschweiler, "Arial Black", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    const w1 = g.measureText('DEAD').width, w2 = g.measureText('ZONE').width, x0 = x - (w1 + w2) / 2;
    g.lineWidth = size * .16; g.strokeStyle = '#000'; g.strokeText('DEAD', x0 + w1 / 2, y); g.strokeText('ZONE', x0 + w1 + w2 / 2, y);
    g.fillStyle = a; g.fillText('DEAD', x0 + w1 / 2, y); g.fillStyle = b; g.fillText('ZONE', x0 + w1 + w2 / 2, y); g.restore(); }
  const mkT2 = (W, H, f) => { const c = document.createElement('canvas'); c.width = W; c.height = H; f(c.getContext('2d'), W, H); const t = new T.CanvasTexture(c); t.anisotropy = 8; t.userData = { cv: c }; return t; };
  const GOLD = '#ffc94d';
  // espelha um desenho do lado esquerdo para o direito (fica perfeitamente centralizado)
  const mirror = (g, W, f) => { f(1); g.save(); g.translate(W, 0); g.scale(-1, 1); f(-1); g.restore(); };
  function base(g, W, H, c0, c1, c2) { const lg = g.createLinearGradient(0, 0, W, 0); lg.addColorStop(0, c0); lg.addColorStop(.5, c1); lg.addColorStop(1, c0); g.fillStyle = lg; g.fillRect(0, 0, W, H);
    const rg = g.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, W * .32); rg.addColorStop(0, c2); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(0, 0, W, H); }
  function carbon(g, W, H, a) { g.save(); g.globalAlpha = a; for (let y = 0; y < H; y += 8) for (let x = (y / 8) % 2 * 8; x < W; x += 16) { g.fillStyle = '#000'; g.fillRect(x, y, 8, 4); g.fillStyle = '#fff'; g.globalAlpha = a * .4; g.fillRect(x + 8, y + 4, 8, 4); g.globalAlpha = a; } g.restore(); }
  function hexes(g, W, H, col) { g.save(); g.strokeStyle = col; g.lineWidth = 2; const r = 26, dx = r * 1.732; for (let row = 0, y = 0; y < H + r; row++, y += r * 1.5) for (let x = (row % 2) * dx / 2; x < W + dx; x += dx) { g.beginPath(); for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; g[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r, y + Math.sin(a) * r); } g.closePath(); g.stroke(); } g.restore(); }
  function ribs(g, W, H) { g.save(); g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = 3; for (let i = 1; i < 24; i++) { const x = W * i / 24; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } g.restore(); }
  const CUSTOM = { dzred: {
    // ======================= EM CIMA: lendário vermelho com o nome =======================
    top: () => CUSTOM.dzred._t || (CUSTOM.dzred._t = mkT2(2048, 512, (g, W, H) => {
      base(g, W, H, '#2a0405', '#a3161a', 'rgba(255,70,50,.55)');
      carbon(g, W, H, .07); hexes(g, W, H, 'rgba(255,120,100,.07)');
      // lâminas varrendo do centro para as pontas (dos dois lados, iguais)
      mirror(g, W, () => {
        const L = [[.40, .2, .05, .62, '#140202'], [.36, .38, .03, .86, '#1d0303'], [.33, .56, .07, .99, '#140202']];
        for (const [x0, y0, x1, y1, c] of L) {
          g.fillStyle = c; g.beginPath(); g.moveTo(W * x0, H * y0); g.lineTo(W * (x0 - .02), H * (y0 + .1)); g.lineTo(W * x1, H * y1); g.lineTo(W * (x1 + .05), H * (y1 - .12)); g.closePath(); g.fill();
          g.strokeStyle = '#ff3b30'; g.lineWidth = 6; g.beginPath(); g.moveTo(W * x0, H * y0); g.lineTo(W * (x1 + .05), H * (y1 - .12)); g.stroke();
          g.strokeStyle = GOLD; g.lineWidth = 2; g.beginPath(); g.moveTo(W * (x0 - .004), H * (y0 + .03)); g.lineTo(W * (x1 + .045), H * (y1 - .09)); g.stroke();
        }
        // ponta: preta com divisas vermelhas apontando para fora
        g.fillStyle = '#0d0d0f'; g.fillRect(0, 0, W * .055, H);
        for (let k = 0; k < 4; k++) { const y = H * (.18 + k * .19); g.fillStyle = k % 2 ? '#c62828' : '#ff3b30'; g.beginPath(); g.moveTo(W * .045, y); g.lineTo(W * .012, y + H * .07); g.lineTo(W * .045, y + H * .14); g.lineTo(W * .03, y + H * .07); g.closePath(); g.fill(); }
        g.fillStyle = GOLD; g.fillRect(W * .055, 0, 4, H);
      });
      ribs(g, W, H);
      // bordo de ataque (frente): preto com friso vermelho e dourado
      g.fillStyle = '#0d0d0f'; g.fillRect(0, 0, W, H * .1); g.fillStyle = '#ff3b30'; g.fillRect(0, H * .1, W, 7); g.fillStyle = GOLD; g.fillRect(0, H * .1 + 9, W, 3);
      // bordo de fuga: preto com dentes vermelhos
      g.fillStyle = '#0d0d0f'; g.fillRect(0, H * .9, W, H * .1);
      g.fillStyle = '#c62828'; for (let x = 0; x < W; x += 48) { g.beginPath(); g.moveTo(x, H * .9 + 2); g.lineTo(x + 24, H * .84); g.lineTo(x + 48, H * .9 + 2); g.fill(); }
      g.fillStyle = GOLD; g.fillRect(0, H * .9, W, 3);
      // placa central angular (atrás do nome)
      const cx = W / 2, cy = H * .5, pw = 560, ph = 150;
      const plate = (e, fill) => { g.beginPath(); g.moveTo(cx - pw - e, cy); g.lineTo(cx - pw + 70 - e * .5, cy - ph - e); g.lineTo(cx + pw - 70 + e * .5, cy - ph - e); g.lineTo(cx + pw + e, cy); g.lineTo(cx + pw - 70 + e * .5, cy + ph + e); g.lineTo(cx - pw + 70 - e * .5, cy + ph + e); g.closePath(); g.fillStyle = fill; g.fill(); };
      g.save(); g.shadowColor = 'rgba(255,40,30,.9)'; g.shadowBlur = 60; plate(18, '#ff3b30'); g.restore();
      plate(18, '#ff3b30'); plate(12, GOLD); plate(6, '#7a0d0d'); plate(0, '#0b0b0d');
      carbon(g, W, H, 0); // (sem efeito; mantém a ordem)
      g.save(); g.beginPath(); g.rect(cx - pw, cy - ph, pw * 2, ph * 2); g.clip(); hexes(g, W, H, 'rgba(255,60,50,.12)'); g.restore();
      // ornamentos: losangos dourados nas pontas da placa
      for (const sx of [-1, 1]) { g.fillStyle = GOLD; g.beginPath(); const x = cx + sx * (pw + 40); g.moveTo(x, cy - 22); g.lineTo(x + sx * 22, cy); g.lineTo(x, cy + 22); g.lineTo(x - sx * 22, cy); g.fill(); g.fillStyle = '#ff3b30'; g.fillRect(cx + sx * (pw + 70) - (sx < 0 ? 160 : 0), cy - 3, 160, 6); }
      // NOME: cromado (DEAD) + vermelho incandescente (ZONE), com relevo e brilho
      g.save(); g.font = 'italic 900 200px Impact, Haettenschweiler, "Arial Black", sans-serif'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.lineJoin = 'round';
      const w1 = g.measureText('DEAD').width, w2 = g.measureText('ZONE').width, tx = cx - (w1 + w2) / 2, ty = cy + 6;
      for (let k = 10; k > 0; k -= 2) { g.fillStyle = '#3a0505'; g.fillText('DEADZONE', tx + k, ty + k); }           // relevo
      g.lineWidth = 16; g.strokeStyle = '#000'; g.strokeText('DEADZONE', tx, ty);
      g.shadowColor = 'rgba(255,50,40,.85)'; g.shadowBlur = 26;
      const chrome = g.createLinearGradient(0, ty - 95, 0, ty + 95); chrome.addColorStop(0, '#ffffff'); chrome.addColorStop(.45, '#e6e6e6'); chrome.addColorStop(.52, '#8d8d8d'); chrome.addColorStop(1, '#f2f2f2');
      g.fillStyle = chrome; g.fillText('DEAD', tx, ty);
      const fire = g.createLinearGradient(0, ty - 95, 0, ty + 95); fire.addColorStop(0, '#ffb199'); fire.addColorStop(.4, '#ff3b30'); fire.addColorStop(.55, '#b71c1c'); fire.addColorStop(1, '#ff5a3c');
      g.fillStyle = fire; g.fillText('ZONE', tx + w1, ty);
      g.shadowBlur = 0; g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.55)'; g.strokeText('DEADZONE', tx, ty - 2);
      g.restore();
    })),
    // ======================= EMBAIXO: só cores e formas (sem nome), tudo centralizado =======================
    bot: () => CUSTOM.dzred._b || (CUSTOM.dzred._b = mkT2(2048, 512, (g, W, H) => {
      base(g, W, H, '#5a0a0a', '#d32f2f', 'rgba(255,110,80,.45)');
      carbon(g, W, H, .06);
      // faixas diagonais espelhadas (preto e vermelho escuro, filete dourado)
      mirror(g, W, () => {
        for (let k = 0; k < 5; k++) { const x = W * (.06 + k * .075); g.fillStyle = k % 2 ? '#5e0b0b' : '#120203'; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + W * .035, 0); g.lineTo(x + W * .075, H); g.lineTo(x + W * .04, H); g.fill();
          if (!(k % 2)) { g.strokeStyle = GOLD; g.lineWidth = 2; g.beginPath(); g.moveTo(x + W * .035, 0); g.lineTo(x + W * .075, H); g.stroke(); } }
        g.fillStyle = '#0d0d0f'; g.fillRect(0, 0, W * .045, H); g.fillStyle = '#ff3b30'; g.fillRect(W * .045, 0, 6, H);
      });
      ribs(g, W, H);
      // divisas no centro, apontando para trás
      const cx = W / 2;
      for (let k = 4; k >= 0; k--) { const s_ = 120 + k * 70; g.fillStyle = k % 2 ? '#7a0d0d' : '#0e0e10'; g.beginPath(); g.moveTo(cx - s_ * 1.6, H * .12); g.lineTo(cx, H * .12 + s_ * .55); g.lineTo(cx + s_ * 1.6, H * .12); g.lineTo(cx + s_ * 1.6, H * .12 + 30); g.lineTo(cx, H * .12 + s_ * .55 + 30); g.lineTo(cx - s_ * 1.6, H * .12 + 30); g.fill(); }
      // losango central (geométrico, sem texto)
      const cy = H * .55, R = 120;
      const dia = (r, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(cx, cy - r); g.lineTo(cx + r * 1.6, cy); g.lineTo(cx, cy + r); g.lineTo(cx - r * 1.6, cy); g.closePath(); g.fill(); };
      g.save(); g.shadowColor = 'rgba(255,60,40,.8)'; g.shadowBlur = 40; dia(R + 14, GOLD); g.restore(); dia(R + 8, GOLD); dia(R, '#0d0d0f'); dia(R * .62, '#c62828'); dia(R * .3, '#ff6b5e');
      // bordas: frente e trás pretas com filete
      g.fillStyle = '#0d0d0f'; g.fillRect(0, 0, W, H * .08); g.fillRect(0, H * .93, W, H * .07); g.fillStyle = GOLD; g.fillRect(0, H * .08, W, 3); g.fillRect(0, H * .93 - 3, W, 3);
    }))
  } };
  DZChute.tex = id => { const C = CUSTOM[id]; return C ? [C.top().userData.cv, C.bot().userData.cv] : null; };
  DZChute.preview = id => { const C = CUSTOM[id]; if (!C) return ''; if (!C._p) { const t = C.top(), c = t.userData.cv, p = document.createElement('canvas'); p.width = 256; p.height = 128; p.getContext('2d').drawImage(c, 0, 0, 256, 128); C._p = p.toDataURL(); } return C._p; };

  // chamado pelo laço principal no lugar do posicionamento antigo
  DZChute.update = function (dt, fw, bk, sd) {
    U.uT.value += dt;
    const on = canopy.visible;
    if (on && !ST.was) { ST.t = 0; ST.roll = 0; ST.rv = 0; ST.pitch = .6; ST.pv = 0; ST.yaw = yaw; }
    ST.was = on; if (!on) return;
    ST.t += dt;
    // segurança: se o shader do paraquedas não compilar neste aparelho, volta para o paraquedas antigo
    if (!ST.chk && ST.t > .5) { ST.chk = 1; try { const bad = (ren.info.programs || []).some(p => /dzchute/.test(p.cacheKey || '') && p.diagnostics && p.diagnostics.runnable === false); if (bad) DZChute.fallback(); } catch (e) { } }
    // abertura com "tranco": 0 -> passa um pouco de 1 -> assenta
    const t = ST.t; ST.open = t < 1.6 ? 1 - Math.exp(-t * 3.2) * Math.cos(t * 7.5) : 1; U.uOpen.value = Math.max(0, ST.open);
    // molas: inclinação lateral (curva), arfagem (mergulho/planar) e direção com atraso
    const tr = sd * .5, tp = .14 * fw - .18 * bk;
    ST.rv += ((tr - ST.roll) * 22 - ST.rv * 5.5) * dt; ST.roll += ST.rv * dt;
    ST.pv += ((tp - ST.pitch) * 18 - ST.pv * 5) * dt; ST.pitch += ST.pv * dt;
    if (ST.yaw == null) ST.yaw = yaw; ST.yaw += (((yaw - ST.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI) * Math.min(1, dt * 3.5);
    ST.turn += (sd - ST.turn) * Math.min(1, dt * 4); U.uTurn.value = ST.turn; U.uDive.value += (fw - U.uDive.value) * Math.min(1, dt * 3);
    canopy.position.set(P.x, P.y + 1.55, P.z);
    canopy.rotation.set(ST.pitch, ST.yaw, ST.roll, 'YXZ');
  };

  // paraquedas dos bots: mesma malha, já aberto (uniforms próprios, só o vento anima)
  DZChute.botChute = function () {
    if (!ST.ready) return null;
    const BU = { uT: U.uT, uOpen: { value: 1 }, uTurn: { value: 0 }, uDive: { value: 0 }, uA: { value: new T.Color(0x2a6fd1).convertSRGBToLinear() }, uB: { value: U.uB.value }, uC: { value: 0 }, tTop: { value: null }, tBot: { value: null } };
    const g = new T.Group();
    for (const me of ST.holder.children) { const m = me.material.clone(); m.userData.U = BU; patch(m, me.userData.wing, 'bot'); const c = new T.Mesh(me.geometry, m); c.frustumCulled = false; g.add(c); }
    return g;
  };
})();
