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
      s.vertexShader = 'uniform float uT,uOpen,uTurn,uDive;varying vec3 vDzP;varying float vDzN;\n' + s.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvDzP=position;vDzN=objectNormal.y;' + VERT);
      if (isWing) s.fragmentShader = 'uniform vec3 uA,uB;uniform float uC;uniform sampler2D tTop,tBot;varying vec3 vDzP;varying float vDzN;\n' + s.fragmentShader.replace('#include <map_fragment>', `
        if(uC>.5){vec2 q=vec2(.5-vDzP.x/${(2 * 4.6).toFixed(2)},clamp((vDzP.z+1.3)/2.6,0.,1.));vec3 cc=(gl_FrontFacing==(vDzN>=0.))?texture2D(tTop,q).rgb:texture2D(tBot,vec2(q.x,1.-q.y)).rgb;diffuseColor.rgb*=pow(cc,vec3(2.2));}else{
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
  const CUSTOM = { dzred: {
    top: () => CUSTOM.dzred._t || (CUSTOM.dzred._t = mkTex((g, w, h) => {
      g.fillStyle = DK; g.fillRect(0, 0, w, h);
      // bordo de ataque (frente) vermelho com friso branco; bordo de fuga com faixa de perigo
      g.fillStyle = RED; g.fillRect(0, 0, w, h * .2); g.fillStyle = WH; g.fillRect(0, h * .2, w, h * .025);
      hazard(g, 0, h * .86, w, h * .14, 34);
      // pontas vermelhas em V
      g.fillStyle = RED; for (const s_ of [0, 1]) { g.beginPath(); const x = s_ ? w : 0, d = s_ ? -1 : 1; g.moveTo(x, h * .225); g.lineTo(x + d * w * .17, h * .225); g.lineTo(x + d * w * .1, h * .86); g.lineTo(x, h * .86); g.fill(); g.fillStyle = RED2; g.beginPath(); g.moveTo(x + d * w * .17, h * .225); g.lineTo(x + d * w * .19, h * .225); g.lineTo(x + d * w * .12, h * .86); g.lineTo(x + d * w * .1, h * .86); g.fill(); g.fillStyle = RED; }
      cells(g, w, h);
      title(g, w / 2, h * .53, 150, WH, RED);
      g.fillStyle = RED; g.fillRect(w * .3, h * .7, w * .4, 6);
    })),
    bot: () => CUSTOM.dzred._b || (CUSTOM.dzred._b = mkTex((g, w, h) => {
      g.fillStyle = RED; g.fillRect(0, 0, w, h);
      g.fillStyle = DK; g.fillRect(0, 0, w, h * .14); g.fillRect(0, h * .9, w, h * .1);
      // faixas pretas diagonais nas pontas
      g.fillStyle = DK2; for (const s_ of [0, 1]) for (let k = 0; k < 2; k++) { const x = s_ ? w - 30 - k * 60 : 30 + k * 60, d = s_ ? -1 : 1; g.beginPath(); g.moveTo(x, h * .14); g.lineTo(x + d * 34, h * .14); g.lineTo(x + d * 74, h * .9); g.lineTo(x + d * 40, h * .9); g.fill(); }
      cells(g, w, h);
      // emblema central: mira
      g.fillStyle = DK; g.beginPath(); g.arc(w / 2, h * .52, h * .3, 0, 7); g.fill(); crosshair(g, w / 2, h * .52, h * .2, RED);
      // sem nome embaixo: só o emblema da mira e as faixas
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
