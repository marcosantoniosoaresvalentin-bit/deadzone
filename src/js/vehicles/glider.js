/* Deadzone · vehicles/glider.js
 * PLANADOR (ultraleve de asa-delta, estilo battle royale): trike de 3 rodas com 2 bancos, motor e hélice atrás,
 * asa-delta de 10 m em cima. Modelos do projeto "Deltaplan" (Grigory Latyshev, MIT), recoloridos no nosso estilo.
 *  - 3 planadores parados em retas de estrada (servem de pista), espalhados pelo mapa.
 *  - Perto dele aparece o botão PILOTAR.
 *  - Botões ACELERAR e FREAR; analógico para CIMA sobe, para BAIXO desce, para os LADOS vira.
 *  - Sem velocidade ele perde sustentação (estol) e cai; precisa de ~50 km/h para decolar.
 *  - Motor gasta combustível; sem combustível ainda plana, descendo devagar.
 *  - SAIR no chão = desce do lado; no ar (acima de 12 m) = salta de paraquedas. Batida forte danifica/explode.
 * PC: W/S sobe/desce, A/D vira, E acelera, Q freia, F entra/sai.
 */
(function () {
  const GL = [];
  let SRC = null, cur_ = null, near_ = null, thrB = 0, brkB = 0, lastT = 0, camY = 0;
  window.GLIDERS = GL;

  // ---------- modelo: trike de asa-delta (ultraleve com motor atrás), estilo battle royale ----------
  // trike e asa: projeto "Deltaplan" (Grigory Latyshev, MIT) — gerados por script; cores trocadas para o nosso estilo
  function build() {
    const g = new T.Group();
    if (SRC) {
      const m = SRC.clone(true), inner = new T.Group(); inner.add(m);
      m.traverse(o => { if (o.isMesh) { o.castShadow = true; if (o.material) { o.material = o.material.clone(); o.material.envMapIntensity = .8; } } });
      inner.rotation.y = Math.PI; inner.position.y = -SRC.userData.minY; g.add(inner);
      let hub = null; m.traverse(o => { if (o.name === 'Propeller') hub = o; });
      if (hub) { const disc = new T.Mesh(new T.CircleGeometry(.85, 24), new T.MeshBasicMaterial({ color: 0x222222, transparent: true, opacity: 0, depthWrite: false, side: T.DoubleSide })); hub.add(disc); g.userData.hub = hub; g.userData.disc = disc; }
      // piloto sentado no banco da frente (só aparece com alguém pilotando)
      try { const pg = mkBot(); pg.cn && (pg.cn.visible = false); pg.scale.setScalar(.98); pg.position.set(0, SRC.userData.seatY - SRC.userData.minY, -SRC.userData.seatZ); g.add(pg); g.userData.pilot = pg; pg.visible = false; seat(pg); } catch (e) { }
    } else { // reserva (se o modelo não carregar)
      const M = new T.MeshStandardMaterial({ color: 0xd8d2c4, roughness: .5 });
      const w = new T.Mesh(new T.ConeGeometry(5, 2.6, 3), M); w.rotation.set(-Math.PI / 2, 0, 0); w.scale.set(1, 1, .08); w.position.set(0, 3, 0); g.add(w);
      const f = new T.Mesh(new T.BoxGeometry(.8, .7, 2.6), M); f.position.y = .7; g.add(f);
      const hub = new T.Group(); hub.position.set(0, .9, -1.4); g.add(hub);
      const disc = new T.Mesh(new T.CircleGeometry(.8, 24), new T.MeshBasicMaterial({ color: 0x222222, transparent: true, opacity: 0, depthWrite: false, side: T.DoubleSide })); hub.add(disc); g.userData.hub = hub; g.userData.disc = disc;
    }
    return g;
  }
  // pose sentada: pernas para a frente, mãos na barra
  function seat(pg) { const r = pg.rig; if (!r) return; r.loco = null; r.hips.position.y = .5; r.tor.rotation.x = -.08;
    for (const L of [r.lg1, r.lg2]) { L.th.rotation.x = -1.35; L.kn.rotation.x = .9; }
    r.aR.sh.rotation.set(-1.15, 0, .18); r.aL.sh.rotation.set(-1.15, 0, -.18); r.aR.el.rotation.x = r.aL.el.rotation.x = -.35; r.head.rotation.x = -.1; }
  // nossas cores: vela recolorida (areia, oliva e laranja) já vem no arquivo; carenagem cinza-chumbo
  function restyle(o) {
    const mt = o.material; if (!mt) return; const n = mt.name || '';
    if (/^Sail/.test(n)) { mt.side = T.DoubleSide; mt.roughness = .85; }
    else if (/Composite/.test(n)) { mt.color = new T.Color(0x3b4148).convertSRGBToLinear(); mt.roughness = .5; mt.metalness = .2; }
    else if (/Soft/.test(n)) { mt.color = new T.Color(0x2a2d30).convertSRGBToLinear(); }
    else if (/^Tube/.test(n)) { mt.color = new T.Color(0x9aa0a6).convertSRGBToLinear(); mt.metalness = .7; mt.roughness = .35; }
  }
  function load() {
    if (!T.GLTFLoader) { spawn(); return; }
    const L = new T.GLTFLoader(); let tri = null, wing = null;
    const done = () => {
      if (!tri || !wing) return;
      const root = new T.Group();
      // só o nível de detalhe mais alto do trike
      const kill = []; tri.traverse(o => { if (/_LOD[12]$/.test(o.name)) kill.push(o); }); for (const o of kill) o.parent.remove(o);
      root.add(tri); root.add(wing); root.traverse(o => { if (o.isMesh) restyle(o); }); root.updateMatrixWorld(true);
      const bb = new T.Box3().setFromObject(tri);
      root.userData = { minY: bb.min.y, seatY: -1.62, seatZ: -0.45 };
      SRC = root; spawn();
    };
    const fail = e => { console.warn('planador', e); if (!SRC) spawn(); };
    L.load('assets/models/vehicles/trike.glb', g => { tri = g.scene; done(); }, undefined, fail);
    L.load('assets/models/vehicles/trike_wing.glb', g => { wing = g.scene; done(); }, undefined, fail);
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
    let sd_ = 20251109; const rr = () => (sd_ = (sd_ * 1664525 + 1013904223) >>> 0) / 4294967296; // sorteio fixo: todos os jogadores têm os mesmos planadores
    const pick = []; for (let k = 0; k < 400 && pick.length < 3 && cand.length; k++) { const c = cand[Math.floor(rr() * cand.length)]; if (pick.every(q => Math.hypot(q.x - c.x, q.z - c.z) > 160)) pick.push(c); }
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
    { const pg = c.g.userData.pilot; if (pg) { const on = cur_ === c; if (pg.visible !== on) pg.visible = on; if (on) seat(pg); } }
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
      const d = 14 + c.spd * .08, h = 4.2; cam.position.set(c.x - Math.sin(camY) * d, Math.max(GY(c.x - Math.sin(camY) * d, c.z - Math.cos(camY) * d, c.y + 5) + 1.5, c.y + h + Math.sin(-c.pitch) * 2), c.z - Math.cos(camY) * d);
      cam.lookAt(c.x + Math.sin(c.yaw) * 6, c.y + 1.4, c.z + Math.cos(c.yaw) * 6);
      if (cam.far < 600) { cam.far = 800; cam.updateProjectionMatrix(); }
      // zona também machuca no planador
      try { if (Math.hypot(c.x - zX, c.z - zZ) > zR) hp -= dt * (1.5 + zI * 1.2); if (hp <= 0 && mode !== 'dead') { cur_ = null; pl.visible = true; mode = 'ground'; die(); } } catch (e) { }
    }
  };

  // ---------- botões / painel a cada instante ----------
  setInterval(() => {
    near_ = null;
    if (mode === 'ground') { let bd = 5.5; for (const c of GL) { if (c.dead || c.air) continue; const d = Math.hypot(c.x - P.x, c.z - P.z); if (d < bd && Math.abs(c.y - P.y) < 3 && !(c.rem && performance.now() - c.rem.t < 1500)) { bd = d; near_ = c; } } }
    bIn.style.display = near_ ? 'flex' : 'none';
    const on = mode === 'glide' && !!cur_;
    bAcc.style.display = bBrk.style.display = bOut.style.display = on ? 'flex' : 'none'; hud.style.display = on ? 'flex' : 'none';
    // pilotando: esconde os botões de a pé; ao sair, devolve tudo do jeito do modo atual (antes ficavam escondidos e sumiam as armas)
    let back = 0; for (const id of HIDE) { const e = document.getElementById(id); if (!e) continue; if (on) { e.dataset.glh = 1; e.style.display = 'none'; } else if (e.dataset.glh) { delete e.dataset.glh; e.style.display = ''; back = 1; } }
    if (back) { try { setLabel(); drawSlots(); } catch (e) { } }
    if (on) {
      const c = cur_, alt = Math.max(0, c.y - GY(c.x, c.z, c.y + 1)), kmh = Math.round(c.spd * 3.6), stall = c.air && c.spd < 10;
      hud.innerHTML = '<div class="v"><small>VELOCIDADE</small>' + kmh + ' km/h</div><div class="v"><small>ALTURA</small>' + Math.round(alt) + ' m</div><div class="v"><small>MOTOR</small><span class="bar"><u style="width:' + Math.round(c.thr * 100) + '%"></u></span></div><div class="v"><small>COMBUSTÍVEL</small>' + Math.round(c.fuel) + '%</div><div class="v"><small>ESTADO</small>' + Math.max(0, Math.round(c.hp)) + '%</div>' + (stall ? '<div class="v warn"><small>ATENÇÃO</small>ESTOL</div>' : (!c.air && kmh < 50 && c.thr > .3 ? '<div class="v"><small>DECOLAR</small>50 km/h</div>' : ''));
    }
  }, 120);
  // aparece no minimapa como um ponto branco
  // ---------- online: todos veem o planador voando (com piloto e hélice) ----------
  const netOn = () => { try { return typeof N !== 'undefined' && N && N.mode === 'classic'; } catch (e) { return false; } };
  const gsend = m => { try { if (netOn()) { m.t = 'gl'; gp(m, 0); } } catch (e) { } };
  let lastSend = 0, wasPil = null;
  setInterval(() => {
    const c = cur_; const now = performance.now();
    if (c && mode === 'glide') { wasPil = c; if (now - lastSend > 95) { lastSend = now; gsend({ i: GL.indexOf(c), x: +c.x.toFixed(2), y: +c.y.toFixed(2), z: +c.z.toFixed(2), a: +c.yaw.toFixed(3), p: +c.pitch.toFixed(3), r: +c.roll.toFixed(3), th: +c.thr.toFixed(2), d: c.dead ? 1 : 0 }); } }
    else if (wasPil) { const c2 = wasPil; wasPil = null; gsend({ i: GL.indexOf(c2), x: +c2.x.toFixed(2), y: +c2.y.toFixed(2), z: +c2.z.toFixed(2), a: +c2.yaw.toFixed(3), p: 0, r: 0, th: 0, e: 1, d: c2.dead ? 1 : 0 }); }
  }, 50);
  function grx(m) {
    const c = GL[m.i]; if (!c || c === cur_) return;
    if (m.d && !c.dead) { try { boom(c); } catch (e) { c.dead = 1; } }
    c.rem = m.e ? null : { t: performance.now(), x: m.x, y: m.y, z: m.z, a: m.a, p: m.p, r: m.r, th: m.th };
    if (m.e) { c.x = m.x; c.y = m.y; c.z = m.z; c.yaw = m.a; c.pitch = 0; c.roll = 0; c.thr = 0; c.spd = 0; c.ab = 0; c.g.position.set(c.x, c.y, c.z); c.g.rotation.set(0, c.yaw, 0); const pg = c.g.userData.pilot; if (pg) pg.visible = false; }
  }
  // move suave até a última posição recebida
  setInterval(() => {
    for (const c of GL) { const R = c.rem; if (!R || c === cur_) continue; if (performance.now() - R.t > 3000) { c.rem = null; continue; }
      const k = .35; c.x += (R.x - c.x) * k; c.y += (R.y - c.y) * k; c.z += (R.z - c.z) * k; c.yaw += ((((R.a - c.yaw) + Math.PI * 3) % (Math.PI * 2)) - Math.PI) * k; c.pitch += (R.p - c.pitch) * k; c.roll += (R.r - c.roll) * k; c.thr = R.th; c.ab = 0;
      c.g.position.set(c.x, c.y, c.z); c.g.rotation.set(0, 0, 0); c.g.rotateY(c.yaw); c.g.rotateX(-c.pitch); c.g.rotateZ(c.roll);
      const hub = c.g.userData.hub; if (hub) { hub.rotation.z += .033 * (6 + 60 * c.thr); c.g.userData.disc.material.opacity = .25 * c.thr; }
      const pg = c.g.userData.pilot; if (pg) { if (!pg.visible) pg.visible = true; seat(pg); } }
  }, 33);
  window.addEventListener('load', () => { try { const _r = clRx; clRx = function (m) { if (m && m.t === 'gl') { grx(m); return; } return _r.apply(this, arguments); }; } catch (e) { } });
  window.DZGL = { list: GL, enter, exit, boom, grx };

  const go = () => { if (window.__dzWorldDone && typeof ROADS !== 'undefined') load(); else setTimeout(go, 500); };
  go();
})();
