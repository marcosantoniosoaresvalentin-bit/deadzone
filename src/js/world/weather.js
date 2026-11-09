/* Deadzone · world/weather.js
 * CLIMA E HORÁRIO sorteados a cada partida clássica: Dia, Entardecer, Noite, Chuva e Neblina.
 *  - Muda sol (cor, força e posição), luz ambiente, céu (tom, nuvens fechadas, estrelas), neblina e cor da neblina.
 *  - Chuva: gotas caindo em volta da câmera + som de chuva. Noite: lanterna fraca em volta do jogador.
 *  - Online: o sorteio usa o mesmo gerador da partida (semente), então todos têm o mesmo clima.
 */
(function () {
  const W = {
    dia: { n: 'Dia' },
    tarde: { n: 'Entardecer', ex: .95, sc: 0xffa05a, si: .8, hk: .72, fog: 0xe0a27a, sky: [1.22, .8, .58], mix: [.98, .6, .38, .14], dir: [140, 26, 50] },
    noite: { n: 'Noite', ex: .55, sc: 0x9fb4ff, si: .2, hk: .42, fog: 0x0a111e, far: 210, sky: [.06, .08, .17], stars: 1, dir: [-60, 80, -40], lamp: 1 },
    chuva: { n: 'Chuva', ex: .85, sc: 0xcfd6dc, si: .36, hk: .85, fog: 0x87909a, far: 200, near: 15, mix: [.5, .54, .58, .82], rain: 1 },
    neblina: { n: 'Neblina', sc: 0xf2f2ec, si: .6, hk: .95, fog: 0xc3cacf, far: 115, near: 6, mix: [.76, .79, .81, .93] }
  };
  let cur = 'dia'; window.DZWEATHER = { get: () => cur, set: k => { if (W[k]) cur = k; }, list: W };
  const lc = h => new T.Color(h).convertSRGBToLinear();

  // céu: tom, mistura com cor (nublado/neblina) e estrelas
  try {
    const m = sky.material; m.uniforms.wT = { value: new T.Vector3(1, 1, 1) }; m.uniforms.wM = { value: new T.Vector4(0, 0, 0, 0) }; m.uniforms.wS = { value: 0 };
    m.fragmentShader = m.fragmentShader.replace('uniform sampler2D tN;', 'uniform sampler2D tN;uniform vec3 wT;uniform vec4 wM;uniform float wS;')
      .replace('gl_FragColor=vec4(c,1.);}', 'c*=wT;c=mix(c,wM.rgb,wM.a);if(wS>0.&&d.y>0.){vec3 sp=floor(d*190.);float h=fract(sin(dot(sp,vec3(12.9898,78.233,45.164)))*43758.5453);c+=vec3(.9,.92,1.)*step(.9965,h)*wS*smoothstep(.02,.25,d.y);}gl_FragColor=vec4(c,1.);}');
    m.needsUpdate = true;
  } catch (e) { console.warn('clima céu', e); }

  // chuva: segmentos em volta da câmera
  const NR = 900, RA = 26, RH = 22, rp = new Float32Array(NR * 6);
  for (let i = 0; i < NR; i++) { const x = (Math.random() - .5) * 2 * RA, y = Math.random() * RH, z = (Math.random() - .5) * 2 * RA; rp.set([x, y, z, x + .08, y - .9, z + .05], i * 6); }
  const rg = new T.BufferGeometry(); rg.setAttribute('position', new T.BufferAttribute(rp, 3));
  const rain = new T.LineSegments(rg, new T.LineBasicMaterial({ color: 0xb8c6d4, transparent: true, opacity: .45, depthWrite: false, fog: false }));
  rain.frustumCulled = false; rain.visible = false; sc.add(rain);
  let rs = null;
  function rainSnd(on) {
    try {
      if (on && !rs && typeof AC !== 'undefined' && AC && NB) { const s = AC.createBufferSource(); s.buffer = NB; s.loop = true; const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = .4; const g = AC.createGain(); g.gain.value = .07; s.connect(f); f.connect(g); g.connect(AC.destination); s.start(); rs = { s, g }; }
      if (!on && rs) { rs.s.stop(); rs = null; }
    } catch (e) { }
  }
  // lanterna fraca em volta do jogador à noite
  const lamp = new T.PointLight(0xffe8c0, 0, 20, 1.6); sc.add(lamp);

  let exBase = null, hemi = null, hemiBase = null, sunBase = null, fogBase = null, fogC0 = null, applied = 'dia';
  function restore() {
    if (applied === 'dia') return; applied = 'dia';
    try { if (sunBase) { sun.color.copy(sunBase.c); sun.intensity = sunBase.i; } if (hemi && hemiBase != null) hemi.intensity = hemiBase; if (fogC0) { sc.fog.color.copy(fogC0); } if (fogBase) { sc.fog.near = fogBase[0]; sc.fog.far = fogBase[1]; }
      const u = sky.material.uniforms; u.wT.value.set(1, 1, 1); u.wM.value.set(0, 0, 0, 0); u.wS.value = 0; u.sd.value.set(55, 90, 30).normalize(); } catch (e) { }
    rain.visible = false; lamp.intensity = 0; rainSnd(false); if (exBase != null) ren.toneMappingExposure = exBase;
  }
  const _sd = new T.Vector3();
  let lastT = 0;
  const _lb = window.loopBody;
  window.loopBody = function (t) {
    const dt = Math.min(.05, (t - lastT) / 1000 || 0); lastT = t; _lb(t);
    try {
      if (mode === 'lobby' || cur === 'dia') { restore(); return; }
      const w = W[cur];
      if (!hemi) sc.traverse(o => { if (o.isHemisphereLight && !o.userData.dzLobby && !hemi) hemi = o; });
      if (applied !== cur) { // entra no clima: guarda os valores normais
        if (applied !== 'dia') restore();
        sunBase = { c: sun.color.clone(), i: sun.intensity }; hemiBase = hemi ? hemi.intensity : null; fogC0 = sc.fog.color.clone(); fogBase = [sc.fog.near, sc.fog.far]; applied = cur; exBase = ren.toneMappingExposure; ren.toneMappingExposure = exBase * (w.ex || 1);
        sun.color.copy(lc(w.sc)); const u = sky.material.uniforms;
        u.wT.value.set(...(w.sky || [1, 1, 1])); u.wM.value.set(...(w.mix ? [lc(0).r, 0, 0, 0] : [0, 0, 0, 0])); if (w.mix) { const c = new T.Color(w.mix[0], w.mix[1], w.mix[2]); u.wM.value.set(c.r, c.g, c.b, w.mix[3]); }
        u.wS.value = w.stars ? 1 : 0; sc.fog.color.copy(lc(w.fog));
        rain.visible = !!w.rain; rainSnd(!!w.rain);
      }
      sun.intensity = sunBase.i * w.si; if (hemi && hemiBase != null) hemi.intensity = hemiBase * w.hk;
      if (w.dir) { const ty = sun.target.position.y; sun.position.set(P.x + w.dir[0], ty + w.dir[1], P.z + w.dir[2]); sky.material.uniforms.sd.value.copy(_sd.set(w.dir[0], w.dir[1], w.dir[2]).normalize()); }
      const air = mode === 'plane' || mode === 'sky' || mode === 'chute';
      if (w.far && !air) { if (sc.fog.far > w.far) sc.fog.far = w.far; sc.fog.near = Math.min(sc.fog.near, w.near != null ? w.near : w.far * .25); }
      if (!sc.fog.color.equals(lc(w.fog))) sc.fog.color.copy(lc(w.fog));
      lamp.intensity = w.lamp && (mode === 'ground' || mode === 'drive') ? .9 : 0; if (lamp.intensity) lamp.position.set(P.x, P.y + 2.6, P.z);
      if (w.rain) {
        rain.position.copy(cam.position); rain.position.y -= RH * .5;
        const a = rg.attributes.position.array, v = 30 * dt;
        for (let i = 0; i < NR; i++) { const o = i * 6; a[o + 1] -= v; a[o + 4] -= v; if (a[o + 4] < 0) { const x = (Math.random() - .5) * 2 * RA, z = (Math.random() - .5) * 2 * RA, y = RH; a[o] = x; a[o + 1] = y; a[o + 2] = z; a[o + 3] = x + .08; a[o + 4] = y - .9; a[o + 5] = z + .05; } }
        rg.attributes.position.needsUpdate = true;
      }
    } catch (e) { }
  };

  // sorteio a cada partida clássica (usa o Math.random da partida: no online é o mesmo nos dois aparelhos)
  window.addEventListener('load', () => {
    const _sg = startGame;
    startGame = function () { const r = Math.random(); cur = r < .4 ? 'dia' : r < .6 ? 'tarde' : r < .75 ? 'noite' : r < .9 ? 'chuva' : 'neblina'; try { if (window.__dzForceW) cur = window.__dzForceW; } catch (e) { } return _sg.apply(this, arguments); };
    for (const f of ['startMatch', 'sqStart']) if (typeof window[f] === 'function') { const o = window[f]; window[f] = function () { cur = 'dia'; return o.apply(this, arguments); }; }
  });
})();
