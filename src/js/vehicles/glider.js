/* Deadzone · vehicles/glider.js
 * PLANADOR (motoplanador): modelo baixado "UNDERPOLY: Free Sailplane Glider" (CC-BY 4.0) + motor com hélice
 * que sai das costas da cabine (como os motoplanadores de verdade).
 *  - 3 planadores parados em retas de estrada (servem de pista), espalhados pelo mapa.
 *  - Perto dele aparece o botão PILOTAR.
 *  - Botões ACELERAR e FREAR; analógico para CIMA sobe, para BAIXO desce, para os LADOS vira.
 *  - Sem velocidade ele perde sustentação (estol) e cai; precisa de ~50 km/h para decolar.
 *  - Motor gasta combustível; sem combustível ainda plana, descendo devagar.
 *  - SAIR no chão = desce do lado; no ar (acima de 12 m) = salta de paraquedas. Batida forte danifica/explode.
 * PC: W/S sobe/desce, A/D vira, E acelera, Q freia, F entra/sai.
 */
(function () {
  const GL = [], S_ = .7;
  let SRC = null, cur_ = null, near_ = null, thrB = 0, brkB = 0, lastT = 0, camY = 0;
  window.GLIDERS = GL;

  // ---------- modelo ----------
  function build() {
    const g = new T.Group();
    if (SRC) {
      const m = SRC.clone(true), inner = new T.Group(); inner.add(m); inner.scale.setScalar(S_);
      m.traverse(o => { if (o.isMesh) { o.castShadow = true; if (o.material) { o.material = o.material.clone(); o.material.envMapIntensity = .8; } } });
      inner.rotation.y = SRC.userData.ry || 0; inner.position.y = -(SRC.userData.minY || 0) * S_; g.add(inner);
    } else { // reserva (se o modelo não carregar): fuselagem e asas simples
      const M = new T.MeshStandardMaterial({ color: 0xf2f2f2, roughness: .4 });
      const f = new T.Mesh(new T.CylinderGeometry(.35, .12, 6, 10), M); f.rotation.x = Math.PI / 2; f.position.y = .7; g.add(f);
      const w = new T.Mesh(new T.BoxGeometry(10.5, .08, .9), M); w.position.set(0, .95, .4); g.add(w);
      const t = new T.Mesh(new T.BoxGeometry(.08, 1.2, .8), M); t.position.set(0, 1.3, -2.8); g.add(t);
    }
    // motor retrátil com hélice, nas costas da cabine
    const pyl = new T.Group(); pyl.position.set(0, (SRC ? SRC.userData.topY : 1.1) * S_ - .05, (SRC ? SRC.userData.mastZ : .3) * S_); g.add(pyl);
    const MM = new T.MeshStandardMaterial({ color: 0x2b2f34, metalness: .6, roughness: .4 });
    const mast = new T.Mesh(new T.BoxGeometry(.07, .55, .16), MM); mast.position.y = .27; pyl.add(mast);
    const pod = new T.Mesh(new T.CylinderGeometry(.11, .08, .5, 10), MM); pod.rotation.x = Math.PI / 2; pod.position.set(0, .58, 0); pyl.add(pod);
    const hub = new T.Group(); hub.position.set(0, .58, .28); pyl.add(hub);
    const BM = new T.MeshStandardMaterial({ color: 0x1a1c1f, roughness: .5 });
    for (const s of [-1, 1]) { const b = new T.Mesh(new T.BoxGeometry(.06, .55, .015), BM); b.position.y = s * .28; b.rotation.y = s * .25; hub.add(b); }
    const disc = new T.Mesh(new T.CircleGeometry(.58, 24), new T.MeshBasicMaterial({ color: 0x222222, transparent: true, opacity: 0, depthWrite: false, side: T.DoubleSide })); disc.position.z = .01; hub.add(disc);
    g.userData.hub = hub; g.userData.disc = disc;
    return g;
  }
  function load() {
    if (!T.GLTFLoader) { spawn(); return; }
    new T.GLTFLoader().load('assets/models/vehicles/glider.glb', gl => {
      const s = gl.scene; s.updateMatrixWorld(true);
      const bb = new T.Box3().setFromObject(s), pts = []; let topZ = 0, n = 0;
      // cauda = parte mais alta (leme): o nariz fica do outro lado e vira para +z
      s.traverse(o => { if (!o.isMesh) return; const p = o.geometry.attributes.position, v = new T.Vector3(); for (let i = 0; i < p.count; i += 3) { v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld); if (v.y > bb.max.y - .35) { topZ += v.z; n++; } } });
      const tailZ = n ? topZ / n : bb.min.z; const ry = tailZ > (bb.min.z + bb.max.z) / 2 ? Math.PI : 0;
      // altura do dorso da fuselagem perto do centro (onde fica o motor)
      let topY = 0; const v = new T.Vector3(), c = (bb.min.z + bb.max.z) / 2, len = bb.max.z - bb.min.z;
      s.traverse(o => { if (!o.isMesh) return; const p = o.geometry.attributes.position; for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld); if (Math.abs(v.x) < .3 && Math.abs(v.z - (c - (ry ? -1 : 1) * len * .05)) < .25) topY = Math.max(topY, v.y); } });
      s.userData = { ry, minY: bb.min.y, topY: (topY || bb.max.y * .5) - bb.min.y, mastZ: -len * .08 };
      SRC = s; spawn();
    }, undefined, e => { console.warn('planador', e); spawn(); });
  }

  // ---------- onde ficam: retas de estrada longe de construções ----------
  function spawn() {
    if (GL.length) return;
    const cand = [];
    try {
      for (const R of ROADS) { const p = R.pts; for (let i = 2; i < p.length - 2; i += 3) {
        const a = p[i - 2], b = p[i + 2], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz); if (L < 6) continue;
        const x = p[i][0], z = p[i][1]; if (FP.some(f => x > f.x0 - 14 && x < f.x1 + 14 && z > f.z0 - 14 && z < f.z1 + 14)) continue;
        const ux = dx / L, uz = dz / L; let ok = 1; for (const d of [-24, -12, 12, 24]) { const h = GY(x + ux * d, z + uz * d, 50); if (Math.abs(h - GY(x, z, 50)) > 1.6 || TERH(x + ux * d, z + uz * d) < .5) ok = 0; }
        // pista livre: 85 m para a frente sem muro, poste ou prédio na altura da fuselagem (e terreno sem subida)
        if (ok) { const y0 = GY(x, z, 50); for (let d = 0; d <= 85 && ok; d += 1.5) { const px = x + ux * d, pz = z + uz * d; if (GY(px, pz, y0 + 3) > y0 + 1.5 + d * .04 || TERH(px, pz) < .3) { ok = 0; break; } for (const o of [-1.2, 0, 1.2]) { const qx = px + uz * o, qz = pz - ux * o; for (const b of near(qx, qz)) { if (b.off || b.yt === undefined) continue; if (b.yt > y0 + .25 && b.yb < y0 + 2.5 && qx > b.x0 - .3 && qx < b.x1 + .3 && qz > b.z0 - .3 && qz < b.z1 + .3) { ok = 0; break; } } if (!ok) break; } } }
        if (ok) cand.push({ x, z, yaw: Math.atan2(ux, uz) });
      } }
    } catch (e) { }
    const pick = []; for (let k = 0; k < 400 && pick.length < 3 && cand.length; k++) { const c = cand[Math.floor(Math.random() * cand.length)]; if (pick.every(q => Math.hypot(q.x - c.x, q.z - c.z) > 160)) pick.push(c); }
    for (const c of pick) add(c.x, c.z, c.yaw);
  }
  function add(x, z, yaw) { const g = build(), y = GY(x, z, 60); g.position.set(x, y, z); g.rotation.y = yaw; sc.add(g); GL.push({ g, x, y, z, yaw, pitch: 0, roll: 0, spd: 0, vy: 0, thr: 0, fuel: 100, hp: 100, dead: 0, air: 0 }); }
  window.addGlider = add;

  // ---------- botões e painel ----------
  const st = document.createElement('style');
  st.textContent = `
.dzGB{position:fixed;z-index:6;display:none;align-items:center;justify-content:center;border-radius:50%;border:2px solid rgba(255,255,255,.55);background:rgba(20,26,32,.55);color:#fff;font:800 12px system-ui;text-align:center;user-select:none;-webkit-user-select:none;touch-action:none}
#dzGlIn{right:200px;bottom:200px;width:74px;height:74px;background:rgba(30,110,60,.75)}
#dzGlAcc{right:26px;bottom:130px;width:86px;height:86px}#dzGlBrk{right:130px;bottom:40px;width:72px;height:72px}#dzGlOut{right:26px;top:110px;width:62px;height:62px}
.dzGB.on{background:rgba(243,195,90,.85);color:#1b1404;border-color:#f6cf6a}
#dzGlHud{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 22px);transform:translateX(-50%);z-index:6;display:none;gap:14px;align-items:center;padding:6px 14px;background:linear-gradient(180deg,rgba(0,0,0,.55),rgba(0,0,0,.3));border-radius:8px;color:#fff;font:800 13px system-ui;white-space:nowrap}
#dzGlHud .v{display:flex;flex-direction:column;align-items:center;min-width:56px}#dzGlHud .v small{font:700 9px system-ui;color:#9aa6b2;letter-spacing:1px}
#dzGlHud .bar{width:70px;height:6px;background:rgba(255,255,255,.15);border-radius:3px;overflow:hidden}#dzGlHud .bar u{display:block;height:100%;background:#f3c35a}
#dzGlHud .warn{color:#ff6a5a}`;
  document.head.appendChild(st);
  const B = (id, html) => { const d = document.createElement('div'); d.id = id; d.className = 'dzGB'; d.innerHTML = html; document.body.appendChild(d); return d; };
  const bIn = B('dzGlIn', 'Pilotar<br>planador'), bAcc = B('dzGlAcc', '▲<br>Acelerar'), bBrk = B('dzGlBrk', '▼<br>Frear'), bOut = B('dzGlOut', 'Sair');
  const hud = document.createElement('div'); hud.id = 'dzGlHud'; document.body.appendChild(hud);
  const hold = (el, set) => { el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); set(1); el.classList.add('on'); try { el.setPointerCapture(e.pointerId); } catch (_) { } }); const up = () => { set(0); el.classList.remove('on'); }; el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); };
  hold(bAcc, v => thrB = v); hold(bBrk, v => brkB = v);
  bIn.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if (near_) enter(near_); });
  bOut.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); exit(); });
  addEventListener('keydown', e => { const k = e.key.toLowerCase(); if (k === 'e') thrB = 1; if (k === 'q') brkB = 1; if (k === 'f') { if (mode === 'glide') exit(); else if (near_ && mode === 'ground') enter(near_); } });
  addEventListener('keyup', e => { const k = e.key.toLowerCase(); if (k === 'e') thrB = 0; if (k === 'q') brkB = 0; });

  // ---------- entrar / sair ----------
  const HIDE = ['bf', 'bf2', 'bc', 'bp', 'bm', 'br', 'bi', 'bj', 'sl', 'dzHeal', 'dzThrow', 'bv', 'bo'];
  function enter(c) {
    if (c.dead) { say('Planador destruído', 1.5); return; }
    cur_ = c; mode = 'glide'; pl.visible = false; cur = -1; ads = 0; firing = 0; c.thr = 0; camY = c.yaw;
    try { setLabel(); } catch (e) { } say('Planador: ACELERAR para ganhar velocidade · analógico para cima sobe, para baixo desce, para os lados vira', 5);
  }
  function exit() {
    const c = cur_; if (!c) return; const gy = GY(c.x, c.z, c.y + 2), h = c.y - gy;
    if (h > 12) { P.x = c.x; P.z = c.z; P.y = c.y - 1; P.vy = -4; cur_ = null; pl.visible = true; c.thr = 0; c.ab = 1; try { openChute(); } catch (e) { mode = 'chute'; } say('🪂 Você saltou do planador!', 3); return; }
    if (c.spd > 6) { say('Diminua a velocidade para sair (Frear)', 1.6); return; }
    P.x = c.x + Math.cos(c.yaw) * 1.6; P.z = c.z - Math.sin(c.yaw) * 1.6; P.y = GY(P.x, P.z, c.y + 2); P.vy = 0; cur_ = null; mode = 'ground'; pl.visible = true; yaw = c.yaw; c.spd = 0; c.thr = 0;
    try { setLabel(); } catch (e) { }
  }
  function boom(c) {
    c.dead = 1; c.thr = 0; try { expl(c.x, c.y + .5, c.z, 6, 0, 0); } catch (e) { }
    c.g.traverse(o => { if (o.isMesh && o.material && o.material.color) { o.material = o.material.clone(); o.material.color.multiplyScalar(.25); } });
    if (cur_ === c) { cur_ = null; P.x = c.x; P.z = c.z; P.y = GY(c.x, c.z, c.y + 2); mode = 'ground'; pl.visible = true; hp -= 45; try { setLabel(); } catch (e) { } say('O planador bateu!', 2.5); }
  }

  // ---------- voo ----------
  const MAXS = 42, TAKE = 14;
  function tick(c, dt, pil) {
    const iy = pil ? (jy || ((keys.s ? 1 : 0) - (keys.w ? 1 : 0))) : 0, ix = pil ? (jx || ((keys.d ? 1 : 0) - (keys.a ? 1 : 0))) : 0;
    const gy = GY(c.x, c.z, c.y + 1), onG = c.y <= gy + .05;
    // motor
    const want = pil && thrB && c.fuel > 0 ? 1 : 0; c.thr += (want - c.thr) * Math.min(1, dt * 2.5); if (c.thr > .05) c.fuel = Math.max(0, c.fuel - dt * .45 * c.thr);
    let a = c.thr * 9 - (pil && brkB ? (onG ? 12 : 5) : 0) - c.spd * c.spd * .0028 - (onG ? .8 : 0);
    // planeio: descendo ganha velocidade, subindo perde
    if (!onG) a -= Math.sin(c.pitch) * 9.8;
    c.spd = Math.max(0, Math.min(MAXS, c.spd + a * dt));
    const lift = Math.min(1, Math.max(0, (c.spd - 8) / (TAKE - 8)));
    // arfagem: analógico para cima = nariz para cima (sobe)
    let tp = (iy < 0 ? -iy * .42 : -iy * .26) * lift; if (onG) tp = Math.max(0, tp);
    // perto do chão ele nivela sozinho (pouso fácil no celular)
    { const al = c.y - gy; if (!onG && al < 9 && tp < 0) tp = Math.max(tp, -.05 - .02 * al); } if (c.spd < 10 && !onG) tp = Math.min(tp, -.25); // estol: o nariz cai
    c.pitch += (tp - c.pitch) * Math.min(1, dt * 2.2);
    // curva com inclinação das asas
    const tr = onG ? ix * .6 * Math.min(1, c.spd / 6) : ix * .75 * (.4 + .6 * lift); c.yaw -= tr * dt; c.roll += ((onG ? 0 : -ix * .55) - c.roll) * Math.min(1, dt * 3);
    // movimento
    const fx = Math.sin(c.yaw), fz = Math.cos(c.yaw), hs = c.spd * Math.cos(c.pitch);
    let vy = onG && c.pitch <= .01 ? 0 : c.spd * Math.sin(c.pitch) - (1 - lift) * 7 - (onG ? 0 : 1.2);
    const nx = c.x + fx * hs * dt, nz = c.z + fz * hs * dt, ny = c.y + vy * dt;
    // batida em prédio/muro: frente da asa
    if (c.spd > 3) { const h0 = c.y + .9; for (const b of near(nx, nz)) { if (b.off || b.yt === undefined) continue; if (h0 > b.yb && h0 < b.yt && nx > b.x0 - .6 && nx < b.x1 + .6 && nz > b.z0 - .6 && nz < b.z1 + .6) { const imp = c.spd; c.spd = 0; c.hp -= imp * 4; c.why = 'bateu em ' + [b.x0, b.z0, b.yb, b.yt].map(v => (+v).toFixed(1)).join(','); if (pil) hp -= Math.max(0, imp - 8) * 1.5; try { sfx(150, Math.min(.6, imp / 30), .2, 0); } catch (e) { } if (c.hp <= 0) boom(c); return; } } }
    c.x = MCLX(nx, 5); c.z = MCLZ(nz, 5); c.y = ny;
    const g2 = GY(c.x, c.z, c.y + 1);
    // rodando no chão: acompanha descidas da pista em vez de "cair" alguns centímetros
    if (onG && c.y > g2 && c.y - g2 < 1.5 && lift < .99) c.y = g2;
    if (c.y <= g2) { // tocou o chão
      const desc = -vy; c.y = g2;
      if (!onG && c.air && (desc > 7 || (c.pitch < -.3 && c.spd > 20))) { c.hp -= desc * 6 + c.spd; c.why = 'pouso ' + desc.toFixed(1); if (pil) hp -= desc * 2; try { sfx(120, .6, .3, 0); } catch (e) { } if (c.hp <= 0) { boom(c); return; } say('Pouso forte!', 1.2); }
      if (TERH(c.x, c.z) < -.6) { c.spd *= .9; if (c.spd < 2) { if (pil) { say('O planador afundou no mar', 2); } c.hp = 0; c.why = 'mar'; boom(c); return; } }
      c.pitch = Math.max(0, c.pitch);
    }
    c.air = c.y > g2 + .5 ? 1 : 0;
    c.g.position.set(c.x, c.y, c.z); c.g.rotation.set(0, 0, 0); c.g.rotateY(c.yaw); c.g.rotateX(-c.pitch); c.g.rotateZ(c.roll);
    const hub = c.g.userData.hub; if (hub) { hub.rotation.z += dt * (6 + 60 * c.thr); c.g.userData.disc.material.opacity = .25 * c.thr; }
    // som do motor
    if (pil && c.thr > .1) { c.sn = (c.sn || 0) - dt; if (c.sn <= 0) { c.sn = .09; try { sfx(220 + 160 * c.thr, .09 * c.thr, .08, 0); } catch (e) { } } }
  }
  // planador sem piloto que foi abandonado no ar: plana e cai sozinho
  function idle(c, dt) { if (c.dead) return; if (c.ab && c.y > GY(c.x, c.z, c.y + 1) + .2) { tick(c, dt, 0); if (c.y <= GY(c.x, c.z, c.y + 1) + .05 && c.spd < 1) c.ab = 0; } }

  // ---------- liga no laço principal ----------
  const _lb = window.loopBody;
  window.loopBody = function (t) {
    const dt = Math.min(.05, (t - lastT) / 1000 || 0); lastT = t;
    if (mode === 'glide' && cur_) { try { tick(cur_, dt, 1); } catch (e) { dzErr(e); } if (cur_) { P.x = cur_.x; P.z = cur_.z; P.y = cur_.y + .5; } }
    for (const c of GL) if (c !== cur_) try { idle(c, dt); } catch (e) { }
    _lb(t);
    if (mode === 'glide' && cur_) { // câmera atrás do planador
      const c = cur_; camY += (((c.yaw - camY + Math.PI * 3) % (Math.PI * 2)) - Math.PI) * Math.min(1, dt * 3);
      const d = 11 + c.spd * .08, h = 3.2; cam.position.set(c.x - Math.sin(camY) * d, Math.max(GY(c.x - Math.sin(camY) * d, c.z - Math.cos(camY) * d, c.y + 5) + 1.5, c.y + h + Math.sin(-c.pitch) * 2), c.z - Math.cos(camY) * d);
      cam.lookAt(c.x + Math.sin(c.yaw) * 6, c.y + 1.4, c.z + Math.cos(c.yaw) * 6);
      if (cam.far < 600) { cam.far = 800; cam.updateProjectionMatrix(); }
      // zona também machuca no planador
      try { if (Math.hypot(c.x - zX, c.z - zZ) > zR) hp -= dt * (1.5 + zI * 1.2); if (hp <= 0 && mode !== 'dead') { cur_ = null; pl.visible = true; mode = 'ground'; die(); } } catch (e) { }
    }
  };

  // ---------- botões / painel a cada instante ----------
  setInterval(() => {
    near_ = null;
    if (mode === 'ground') { let bd = 5.5; for (const c of GL) { if (c.dead || c.air) continue; const d = Math.hypot(c.x - P.x, c.z - P.z); if (d < bd && Math.abs(c.y - P.y) < 3) { bd = d; near_ = c; } } }
    bIn.style.display = near_ ? 'flex' : 'none';
    const on = mode === 'glide' && !!cur_;
    bAcc.style.display = bBrk.style.display = bOut.style.display = on ? 'flex' : 'none'; hud.style.display = on ? 'flex' : 'none';
    for (const id of HIDE) { const e = document.getElementById(id); if (e) { if (on) { if (e.dataset.glh == null) { e.dataset.glh = e.style.display || ''; } e.style.display = 'none'; } else if (e.dataset.glh != null) { e.style.display = e.dataset.glh; delete e.dataset.glh; } } }
    if (on) {
      const c = cur_, alt = Math.max(0, c.y - GY(c.x, c.z, c.y + 1)), kmh = Math.round(c.spd * 3.6), stall = c.air && c.spd < 10;
      hud.innerHTML = '<div class="v"><small>VELOCIDADE</small>' + kmh + ' km/h</div><div class="v"><small>ALTURA</small>' + Math.round(alt) + ' m</div><div class="v"><small>MOTOR</small><span class="bar"><u style="width:' + Math.round(c.thr * 100) + '%"></u></span></div><div class="v"><small>COMBUSTÍVEL</small>' + Math.round(c.fuel) + '%</div><div class="v"><small>ESTADO</small>' + Math.max(0, Math.round(c.hp)) + '%</div>' + (stall ? '<div class="v warn"><small>ATENÇÃO</small>ESTOL</div>' : (!c.air && kmh < 50 && c.thr > .3 ? '<div class="v"><small>DECOLAR</small>50 km/h</div>' : ''));
    }
  }, 120);
  // aparece no minimapa como um ponto branco
  window.DZGL = { list: GL, enter, exit };

  const go = () => { if (window.__dzWorldDone && typeof ROADS !== 'undefined') load(); else setTimeout(go, 500); };
  go();
})();
