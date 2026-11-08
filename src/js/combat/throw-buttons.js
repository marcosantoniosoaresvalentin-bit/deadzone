/* Deadzone · combat/throw-buttons.js
 * Botões de GRANADA, FUMAÇA e GELO funcionando como nos battle royales:
 *  segure o botão -> aparece a linha curva da trajetória e o círculo onde vai cair;
 *  arraste o dedo para cima/baixo para jogar mais longe/perto e para os lados para girar;
 *  solte para arremessar. (Antes o botão de fumaça não fazia nada.)
 * Também deixa a fumaça bem maior e mais duradoura.
 */
(function () {
  function throwSmoke_(rng) {
    if (mode !== 'ground' || !(bag.smoke > 0)) return;
    const v = gVel(gRange(rng)); launchGren(v.x0, v.y0, v.z0, v.vx, v.vy, v.vz, 2.2, 0);
    const q = GRN[GRN.length - 1]; q.sm = 1; q.m.material = M(0xb8bcc0); bag.smoke--; drawBag(); say('Fumaça!', .8);
    if (bag.smoke <= 0 && TS === 'smoke') TS = 0;
  }
  function bind(id, k) {
    const el = $(id); if (!el) return; let pid = null, lx = 0;
    el.addEventListener('pointerdown', e => {
      if (mode !== 'ground' || !(bag[k] > 0) || cast || !mpOk()) return;
      e.preventDefault(); e.stopPropagation(); pid = e.pointerId; try { el.setPointerCapture(pid); } catch (_) { }
      lx = e.clientX; cur = -1; rlOn = 0; rl = 0; ads = 0; firing = 0; TS = k; GA = { k, t: 0, sy: e.clientY, rng: .55, pid, btn: 1 };
      try { drawSlots(); } catch (_) { }
    });
    el.addEventListener('pointermove', e => { if (e.pointerId !== pid || !GA || GA.k !== k) return; GA.rng = Math.max(0, Math.min(1, .55 + (GA.sy - e.clientY) / 150)); look(e.clientX - lx, 0); lx = e.clientX; });
    const up = e => {
      if (e.pointerId !== pid) return; pid = null; const g = GA; if (!g || g.k !== k) return;
      if (k === 'smoke') { GA = null; throwSmoke_(g.rng); } else releaseAim();
      if (!(bag[k] > 0)) TS = 0;
    };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  }
  bind('bg', 'gren'); bind('bgs', 'smoke'); bind('bgl', 'gel');

  // linha da trajetória mais visível (pontilhada grossa não existe em WebGL: usa a linha + bolinhas)
  try {
    AIML.material.color.set(0xffffff); AIML.material.transparent = true; AIML.material.opacity = .95; AIML.material.depthTest = false; AIML.renderOrder = 5;
    const DOT = new T.InstancedMesh(new T.SphereGeometry(.07, 6, 4), new T.MeshBasicMaterial({ color: 0xffe27a, depthTest: false, transparent: true, opacity: .95 }), 25);
    DOT.frustumCulled = false; DOT.renderOrder = 5; DOT.visible = false; sc.add(DOT);
    const _m = new T.Matrix4(), a = AIML.geometry.attributes.position;
    const _u = updAim; updAim = function (dt) { _u(dt); DOT.visible = AIML.visible; if (!DOT.visible) return; for (let i = 0; i < 25; i++) { _m.makeTranslation(a.getX(i), a.getY(i), a.getZ(i)); DOT.setMatrixAt(i, _m); } DOT.instanceMatrix.needsUpdate = true; try { AIMR.position.y = GY(AIMR.position.x, AIMR.position.z, P.y + 2) + .12; } catch (_) { } };
    // a linha nasce na altura do chão onde o jogador está (antes ficava presa em y=1,5 do mapa)
    const _gv = gVel; gVel = function (r) { const v = _gv(r); const g0 = (typeof P !== 'undefined' ? P.y : 0); v.y0 += g0; return v; };
  } catch (e) { console.warn('trajetória', e); }

  // fumaça maior: mais nuvens, mais larga e dura mais
  let _smt = null; const SMT = () => { if (_smt) return _smt; const cv = document.createElement('canvas'); cv.width = cv.height = 128; const x = cv.getContext('2d');
    for (let k = 0; k < 9; k++) { const cx = 64 + (Math.random() - .5) * 34, cy = 64 + (Math.random() - .5) * 34, r = 30 + Math.random() * 22, g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.45, 'rgba(255,255,255,.75)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); }
    _smt = new T.CanvasTexture(cv); return _smt; };
  try {
    const _sp = spawnSmoke;
    spawnSmoke = function (x, z) {
      _sp(x, z); const c = SMK[SMK.length - 1]; if (!c) return;
      const y0 = (typeof GY === 'function') ? GY(x, z, (typeof P !== 'undefined' ? P.y : 0) + 3) : 0; c.g.position.y = y0;
      // troca as bolas por nuvens macias (sprite com borda esfumaçada, sempre virado para a câmera)
      for (const m of c.ms) c.g.remove(m); const old = c.ms.splice(0);
      const mk = u => { const sp = new T.Sprite(new T.SpriteMaterial({ map: SMT(), color: 0xc8ccd0, transparent: true, opacity: .95, depthWrite: false, fog: true })); sp.material.rotation = Math.random() * 6.28; sp.userData = u; sp.scale.setScalar(.1); c.g.add(sp); c.ms.push(sp); };
      for (const m of old) mk(Object.assign({}, m.userData, { r: m.userData.r * 1.9 }));
      for (let i = 0; i < 12; i++) mk({ ox: (Math.random() - .5) * 11, oz: (Math.random() - .5) * 11, r: (3 + Math.random() * 2.2) * 1.9, y: .8 + Math.random() * 3.6 });
      for (const m of c.ms) { m.userData.ox *= 1.25; m.userData.oz *= 1.25; m.userData.r *= 1.2; m.userData.y = .4 + m.userData.y * .6; }
    };
    const _sb = smokeB; smokeB = function (x0, z0, x1, z1) { if (_sb(x0, z0, x1, z1)) return true; for (const c of SMK) { if (c.a < 1) continue; const dx = x1 - x0, dz = z1 - z0, l2 = dx * dx + dz * dz || 1; let t = ((c.x - x0) * dx + (c.z - z0) * dz) / l2; t = Math.max(0, Math.min(1, t)); if (Math.hypot(x0 + dx * t - c.x, z0 + dz * t - c.z) < 8) return true; } return false; };
  } catch (e) { console.warn('fumaça', e); }
})();
