/* Deadzone · fx/footsteps.js
 * SONS DE PASSOS POR TIPO DE CHÃO + PORTAS ARROMBADAS.
 *  - Passos (seus e dos inimigos): grama/terra, asfalto, concreto, madeira (dentro das casas), metal
 *    (containers, torres, escadas) e água rasa. Os dos inimigos têm direção (esquerda/direita) e ficam
 *    mais altos quanto mais perto (até ~35 m). Agachado pisa mais baixo; deitado quase não faz barulho.
 *  - Portas: tiro ou explosão arromba a porta fechada (abre na hora, com estrondo).
 */
(function () {
  // ---------- tipo de chão ----------
  function surf(x, y, z, inside) {
    try {
      if (x > 3500) return y > (TERH(x, z) + .4) ? 'metal' : 'conc';
      const th = TERH(x, z);
      if (y < .15 && th < .25) return 'water';
      if (inside) return 'wood';
      if (y - th > .3) return 'metal';
      if (window.ROADH && ROADH(x, z) != null) return 'asph';
      if (th < 1.2) return 'sand';
      return 'grass';
    } catch (e) { return 'grass'; }
  }
  // ---------- síntese do passo ----------
  function step(kind, vol, pan) {
    if (typeof AC === 'undefined' || !AC || !NB || vol < .01) return;
    try {
      if (AC.state === 'suspended') return;
      const t = AC.currentTime, out = AC.createGain(); let node = out;
      if (AC.createStereoPanner) { const p = AC.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan || 0)); out.connect(p); p.connect(AC.destination); } else out.connect(AC.destination);
      const noise = (type, f, q, g, dur) => { const s = AC.createBufferSource(); s.buffer = NB; s.playbackRate.value = .8 + Math.random() * .4; const fl = AC.createBiquadFilter(); fl.type = type; fl.frequency.value = f * (.9 + Math.random() * .2); fl.Q.value = q; const ga = AC.createGain(); ga.gain.setValueAtTime(g * vol, t); ga.gain.exponentialRampToValueAtTime(.0005, t + dur); s.connect(fl); fl.connect(ga); ga.connect(node); s.start(t, Math.random() * .1); s.stop(t + dur + .02); };
      const tone = (f, g, dur, type) => { const o = AC.createOscillator(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * .7, t + dur); const ga = AC.createGain(); ga.gain.setValueAtTime(g * vol, t); ga.gain.exponentialRampToValueAtTime(.0005, t + dur); o.connect(ga); ga.connect(node); o.start(t); o.stop(t + dur + .02); };
      if (kind === 'grass') { noise('lowpass', 1100, .7, .5, .11); noise('bandpass', 3200, .8, .12, .06); }
      else if (kind === 'sand') { noise('lowpass', 1600, .5, .45, .13); }
      else if (kind === 'asph') { noise('bandpass', 2300, 1.1, .55, .06); tone(110, .35, .05, 'triangle'); }
      else if (kind === 'conc') { noise('bandpass', 1900, 1, .5, .07); tone(95, .4, .06, 'triangle'); }
      else if (kind === 'wood') { tone(170, .55, .09, 'triangle'); noise('bandpass', 850, 1.2, .35, .08); }
      else if (kind === 'metal') { noise('bandpass', 3400, 2, .35, .07); tone(820, .16, .22); tone(1290, .1, .18); tone(140, .3, .06, 'triangle'); }
      else if (kind === 'water') { noise('bandpass', 1300, .7, .55, .18); noise('highpass', 4000, .5, .15, .1); }
    } catch (e) { }
  }
  window.DZSTEP = step;

  // ---------- quadro a quadro ----------
  let lx = null, lz = null, acc = 0, lastT = 0, eT = 0;
  const E = new Map();
  const _lb = window.loopBody;
  window.loopBody = function (t) {
    const dt = Math.min(.05, (t - lastT) / 1000 || 0); lastT = t; _lb(t);
    try {
      // seus passos
      if (mode === 'ground' && !(typeof RIDE !== 'undefined' && RIDE)) {
        const air_ = P.y > GY(P.x, P.z, P.y) + .05;
        if (lx != null && !air_) { const d = Math.hypot(P.x - lx, P.z - lz); if (d < 3) acc += d; }
        lx = P.x; lz = P.z;
        const stride = st === 1 ? 1.15 : st === 2 ? 1.6 : 1.55;
        if (acc >= stride) { acc = 0; if (st !== 2) window.DZSTEP(surf(P.x, P.y, P.z, typeof insB !== 'undefined' && !!insB), st === 1 ? .16 : .3, 0); }
      } else { lx = null; acc = 0; }
      // passos dos inimigos por perto (os mais próximos, com direção)
      eT += dt; if (eT < .05 || mode === 'lobby') return; eT = 0;
      const L = [];
      try { for (const b of bots) if (!b.dead && !b.air && !b.kn && b.team !== 1) { const d = Math.hypot(b.x - P.x, b.z - P.z); if (d < 35) L.push([b, d, b.x, TERH(b.x, b.z), b.z, false]); } } catch (e) { }
      try { if (typeof CL !== 'undefined') for (const id in CL) { const e = CL[id]; if (e.dead || !e.vis || e.md && e.md !== 'g') continue; const d = Math.hypot(e.x - P.x, e.z - P.z); if (d < 35) L.push([e, d, e.x, e.g.position.y, e.z, false]); } } catch (e) { }
      try { if (typeof CB !== 'undefined') for (const k in CB) { const e = CB[k]; if (e.dead || !e.vis || e.ally) continue; const d = Math.hypot(e.x - P.x, e.z - P.z); if (d < 35) L.push([e, d, e.x, e.g.position.y, e.z, false]); } } catch (e) { }
      L.sort((a, b) => a[1] - b[1]);
      for (const [e, d, x, y, z] of L.slice(0, 4)) {
        let s = E.get(e); if (!s) { s = { x, z, a: 0 }; E.set(e, s); continue; }
        const m = Math.hypot(x - s.x, z - s.z); s.x = x; s.z = z; if (m > 4) continue; s.a += m;
        if (s.a >= 1.6) { s.a = 0; const v = .62 * Math.pow(Math.max(0, 1 - d / 35), 1.3) * (typeof vSnd === 'function' ? (vSnd(0) || .5) : 1); window.DZSTEP(surf(x, y, z, false), v, typeof panOf === 'function' ? panOf(x, z) : 0); }
      }
      if (E.size > 200) E.clear();
    } catch (e) { }
  };

  // ---------- portas arrombadas por tiro ou explosão ----------
  function burst(d) {
    if (!d || d.open) return; d.open = 1; d.mc = performance.now(); d.a = Math.max(d.a, 1.2);
    try { const k = Math.max(0, 1 - Math.hypot(d.x - P.x, d.z - P.z) / 60); sfx(160, .7 * k, .25, typeof panOf === 'function' ? panOf(d.x, d.z) : 0); sfx(90, .5 * k, .35, 0); } catch (e) { }
  }
  const doorY = d => d.y != null ? d.y : TERH(d.x, d.z);
  window.addEventListener('load', () => {
    if (!window.DZW) return;
    const _s = DZW.shoot; DZW.shoot = function (o, dir, maxT) {
      const r = _s ? _s.apply(this, arguments) : undefined;
      try {
        const T_ = Math.min(maxT || 80, 80), C = doors.filter(d => !d.open && Math.hypot(d.x - o.x, d.z - o.z) < T_ + 3);
        if (C.length) for (let s = .5; s < T_; s += .25) { const x = o.x + dir.x * s, y = o.y + dir.y * s, z = o.z + dir.z * s;
          for (const d of C) { const b = d.bx; if (x > b.x0 - .15 && x < b.x1 + .15 && z > b.z0 - .15 && z < b.z1 + .15) { const y0 = doorY(d); if (y > y0 && y < y0 + 2.3) { burst(d); return r; } } } }
      } catch (e) { }
      return r;
    };
    const _b = DZW.blast; DZW.blast = function (x, y, z, rr) {
      const r = _b ? _b.apply(this, arguments) : undefined;
      try { for (const d of doors) if (!d.open && Math.hypot(d.x - x, d.z - z) < Math.max(4, rr * 1.2) && Math.abs(doorY(d) + 1 - y) < 4) burst(d); } catch (e) { }
      return r;
    };
  });
})();
