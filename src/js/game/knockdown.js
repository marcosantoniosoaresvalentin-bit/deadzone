/* Deadzone · game/knockdown.js
 * DERRUBADO E REANIMAÇÃO (partida clássica com equipe).
 * - Quem "morre" com um aliado de pé fica derrubado: de joelhos/rastejando, sem arma,
 *   sangrando (~45 s). Inimigos podem finalizar. Sem aliado de pé = eliminado de vez.
 * - Reanimar leva 6 s parado perto do aliado (botão "Reanimar"). Volta com 25 de vida.
 * - Bots companheiros vão até o aliado derrubado (inclusive você) e reanimam.
 * - Online: todos veem quem está derrubado; o parceiro reanima pela rede.
 */
(function () {
  const BLEED_ME = 45, BLEED_BOT = 60, RV_TIME = 6, RV_HP = 25, RV_DIST = 2.4;
  let KN = null;      // eu derrubado: {hp, sc}
  let RV = null;      // eu reanimando alguém: {T, t}
  let RVBY = null;    // alguém (online) me reanimando: {nm, t0}
  let NOK = 0;
  const now = () => performance.now() / 1000;
  const online = () => { try { return typeof N !== 'undefined' && N && N.mode === 'classic'; } catch (e) { return false; } };
  const host = () => { try { return !online() || N.host; } catch (e) { return true; } };
  const send = m => { try { if (online()) { m.t = 'kn'; gp(m, 1); } } catch (e) { } };
  const solo = () => { try { return !!MP; } catch (e) { return false; } }; // duelo / mata-mata: sem derrubado
  const myName = () => { try { return localStorage.getItem('deadzone_player_name') || 'Aliado'; } catch (e) { return 'Aliado'; } };
  const allyIds = () => { try { return [...(window.dzAllies || [])].filter(id => CL[id]); } catch (e) { return []; } };
  const allyName = id => { try { return (window.dzAllyNames || {})[id] || nmId(id) || 'Parceiro'; } catch (e) { return 'Parceiro'; } };
  const cbAllies = () => { try { return typeof CB !== 'undefined' ? Object.values(CB).filter(e => e.ally) : []; } catch (e) { return []; } };
  const comps = () => { try { return bots.filter(b => b.team === 1 && b.isCompanion); } catch (e) { return []; } };
  const meUp = () => mode !== 'dead' && mode !== 'lobby' && !KN;

  // há alguém da equipe de pé (fora "ex")?
  function teamUp(ex) {
    if (ex !== 'P' && meUp()) return true;
    for (const b of comps()) if (b !== ex && !b.dead && !b.kn) return true;
    for (const id of allyIds()) { const e = CL[id]; if (e !== ex && !e.dead && !e.kn && e.vis) return true; }
    for (const e of cbAllies()) if (e !== ex && !e.dead && !e.kn) return true;
    return false;
  }

  // ---------- pose de derrubado (de joelhos, mão no chão, arma guardada) ----------
  function knPose(o, dt) {
    const r = o.g && o.g.rig; if (!r) return; r.loco = null; o.kp = (o.kp || 0) + dt; const s = Math.sin(o.kp * 2.4) * .5 + .5;
    o.g.rotation.x = 0; o.g.rotation.z = 0;
    r.hips.position.y = .5 + .02 * s; r.tor.rotation.x = .62 + .06 * s; r.tor.rotation.z = .08;
    r.lg1.th.rotation.x = -.35; r.lg1.kn.rotation.x = 1.75; r.lg2.th.rotation.x = -.15; r.lg2.kn.rotation.x = 1.6;
    r.aR.sh.rotation.set(-.95 - .1 * s, 0, -.05); r.aR.el.rotation.x = -.15;
    r.aL.sh.rotation.set(-.75, 0, .25); r.aL.el.rotation.x = -1.5;
    r.head.rotation.x = -.45;
    if (o.wg) o.wg.visible = false;
  }

  // ---------- bots companheiros ----------
  function knockBot(b) {
    b.kn = { hp: 100 }; b.hp = 100; b.rvT = null; b.rvp = 0; b.tg = null; b.kp = 0;
    try { if (b.wg) b.wg.visible = false; } catch (e) { }
    if (meUp() || KN) say((b.nm || 'Aliado') + ' foi derrubado!', 1.8);
    if (online() && N.host) send({ a: 'kb', i: bots.indexOf(b), k: 1 });
  }
  function reviveBot(b) {
    if (!b.kn) return; b.kn = null; b.hp = RV_HP; b.dw = 0; try { if (b.wg) b.wg.visible = true; } catch (e) { }
    say((b.nm || 'Aliado') + ' foi reanimado', 1.4);
    if (online() && N.host) send({ a: 'kb', i: bots.indexOf(b), k: 0 });
  }
  let _kb = null;
  function finishBot(b) { b.kn = null; b.hp = 0; if (_kb) _kb(b, 0); }
  window.dzKnBot = function (b, dt) {
    const K = b.kn; K.hp -= dt * 100 / BLEED_BOT;
    try { if (Math.hypot(b.x - zX, b.z - zZ) > zR) K.hp -= dt * (1.5 + zI * 1.2); } catch (e) { }
    b.hp = Math.max(.1, K.hp);
    if (K.hp <= 0 || !teamUp(b)) { finishBot(b); return; }
    b.g.position.set(b.x, TERH(b.x, b.z), b.z); b.g.visible = Math.hypot(P.x - b.x, P.z - b.z) < 150;
    if (b.g.visible) knPose(b, dt);
  };

  // alvos que precisam de reanimação
  function targets() {
    const L = [];
    if (KN) L.push({ k: 'P', o: P });
    for (const b of comps()) if (b.kn && !b.dead) L.push({ k: 'b', o: b });
    for (const id of allyIds()) { const e = CL[id]; if (e.kn && !e.dead && e.vis) L.push({ k: 'c', o: e, id }); }
    for (const e of cbAllies()) if (e.kn && !e.dead) L.push({ k: 'cb', o: e });
    return L;
  }
  const alive_ = T => T.k === 'P' ? !!KN : (T.o.kn && !T.o.dead);
  function reviveT(T, byName) {
    if (T.k === 'P') reviveMe(byName);
    else if (T.k === 'b') reviveBot(T.o);
    else if (T.k === 'c') { send({ a: 'rv', to: T.id }); T.o.kn = 0; say(allyName(T.id) + ' foi reanimado', 1.4); }
    else if (T.k === 'cb') { send({ a: 'rvb', i: T.o.bi }); T.o.kn = 0; }
  }

  // companheiro indo reanimar
  window.dzRvBot = function (b, dt) {
    const T = b.rvT; if (!T || !alive_(T) || b.kn) { b.rvT = null; b.rvp = 0; return false; }
    const o = T.o, d = Math.hypot(o.x - b.x, o.z - b.z);
    if (d > 2.2) { botNavigate(b, o.x, o.z, 3, dt); b.rvMv = 1; if (b.rvp > 0 && T.k === 'c') send({ a: 'rc', to: T.id }); b.rvp = 0; return true; }
    b.rvMv = 0; b.g.rotation.y = Math.atan2(o.x - b.x, o.z - b.z);
    if (!b.rvp && T.k === 'c') send({ a: 'rs', to: T.id, nm: b.nm || 'Aliado' });
    b.rvp = (b.rvp || 0) + dt;
    if (b.rvp >= RV_TIME) { b.rvp = 0; b.rvT = null; reviveT(T, b.nm || 'Aliado'); }
    return true;
  };
  // distribui: o companheiro livre mais perto vai até cada derrubado
  setInterval(() => {
    if (mode === 'lobby' || !host()) return;
    const T = targets(), C = comps().filter(b => !b.dead && !b.kn && !b.air);
    const used = new Set();
    for (const t of T) {
      const cur = C.find(b => b.rvT && b.rvT.o === t.o && !used.has(b));
      if (cur) { used.add(cur); continue; }
      let best = null, bd = 160; for (const b of C) { if (used.has(b) || (b.rvT && alive_(b.rvT))) continue; const d = Math.hypot(b.x - t.o.x, b.z - t.o.z); if (d < bd) { bd = d; best = b; } }
      if (best) { used.add(best); best.rvT = t; best.rvp = 0; }
    }
    for (const b of C) if (!used.has(b)) { b.rvT = null; b.rvp = 0; }
  }, 500);

  // ---------- eu derrubado ----------
  function enterKnock() {
    try { if (mode === 'drive') ejectDriver(); } catch (e) { }
    KN = { hp: 100, sc: cur }; hp = 100; RVBY = null; RV = null;
    try { cur = -1; firing = 0; ads = 0; st = 2; drawSlots(); setLabel(); } catch (e) { }
    say('Você foi derrubado! Espere um aliado te reanimar.', 2.5); try { sfx(140, .5, .5, 0); } catch (e) { }
    send({ a: 'st', k: 1, h: 100 });
  }
  function reviveMe(byName) {
    if (!KN) return; const sc = KN.sc; KN = null; RVBY = null; hp = RV_HP;
    try { st = 0; cur = (sc != null && slots[sc]) ? sc : -1; drawSlots(); setLabel(); } catch (e) { }
    say((byName ? byName + ' te reanimou!' : 'Você foi reanimado!'), 2); try { sfx(620, .35, .25, 0); } catch (e) { }
    send({ a: 'st', k: 0 });
  }
  window.dzKnocked = () => !!KN;
  window.dzTeamUp = ex => teamUp(ex);

  // ---------- rede (partida clássica) ----------
  function rx(m) {
    if (m.a === 'st') { const e = CL[m.f]; if (e) { e.kn = m.k ? 1 : 0; e.knh = m.h; } return; }
    if (m.a === 'kb') { const e = typeof CB !== 'undefined' && CB[m.i]; if (e) e.kn = m.k ? 1 : 0; return; }
    if (m.a === 'rvb') { if (online() && N.host) { const b = bots[m.i]; if (b && b.kn) reviveBot(b); } return; }
    if (m.to !== mpId) return;
    if (m.a === 'rs' && KN) RVBY = { nm: m.nm || allyName(m.f), t0: now() };
    else if (m.a === 'rc') RVBY = null;
    else if (m.a === 'rv' && KN) reviveMe(m.nm || allyName(m.f));
  }

  // ---------- HUD ----------
  const css = document.createElement('style'); css.textContent =
    '#dzKO{position:fixed;inset:0;z-index:5;pointer-events:none;display:none;box-shadow:inset 0 0 140px 40px rgba(150,0,0,.55);background:rgba(60,0,0,.12)}' +
    '#dzKO .bx{position:absolute;left:50%;top:31%;transform:translateX(-50%);text-align:center;color:#fff;font:800 13px system-ui;text-shadow:0 1px 3px #000;min-width:230px}' +
    '#dzKO .bx b{display:block;font-size:22px;letter-spacing:3px;color:#ff5a4a}' +
    '#dzKO .bar,#dzRvP .bar{height:7px;border-radius:4px;background:rgba(0,0,0,.5);margin:6px auto 3px;overflow:hidden;width:220px}' +
    '#dzKO .bar u{display:block;height:100%;background:#e0352b}#dzKO .rv u,#dzRvP .bar u{display:block;height:100%;background:#4fd36b}' +
    '#dzRvP{position:fixed;left:50%;top:30%;transform:translateX(-50%);z-index:6;display:none;color:#fff;font:800 13px system-ui;text-align:center;text-shadow:0 1px 3px #000;pointer-events:none}' +
    '#dzRvB{position:fixed;right:200px;bottom:200px;z-index:6;display:none;width:74px;height:74px;border-radius:50%;border:2px solid rgba(120,255,150,.8);background:rgba(30,110,55,.85);color:#fff;font:800 11px system-ui;align-items:center;justify-content:center;flex-direction:column;user-select:none;-webkit-user-select:none;touch-action:none}' +
    '#dzTeam .m.kn .t i u{background:#e0352b}#dzTeam .m.kn .t b:after{content:" · derrubado";color:#ff6a5a;font-weight:700}';
  document.head.appendChild(css);
  const KO = document.createElement('div'); KO.id = 'dzKO'; KO.innerHTML = '<div class="bx"><b>DERRUBADO</b><div class="bar"><u></u></div><span class="tx"></span><div class="bar rv" style="display:none"><u></u></div></div>'; document.body.appendChild(KO);
  const RP = document.createElement('div'); RP.id = 'dzRvP'; RP.innerHTML = '<span></span><div class="bar"><u></u></div>'; document.body.appendChild(RP);
  const RB_ = document.createElement('div'); RB_.id = 'dzRvB';
  RB_.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" fill="#fff"/></svg>Reanimar'; document.body.appendChild(RB_);
  let nearT = null;
  RB_.addEventListener('pointerdown', e => {
    e.preventDefault(); e.stopPropagation(); if (!nearT || KN || RV) return;
    RV = { T: nearT, t: 0 }; if (nearT.k === 'c') send({ a: 'rs', to: nearT.id, nm: myName() });
  });
  const nmT = T => T.k === 'b' ? (T.o.nm || 'Aliado') : T.k === 'c' ? allyName(T.id) : (T.o.nm || 'Aliado');
  function cancelRV() { if (RV && RV.T.k === 'c') send({ a: 'rc', to: RV.T.id }); RV = null; }

  // ---------- quadro a quadro ----------
  let lastT = 0, lastSt = 0;
  const _lb = window.loopBody;
  window.loopBody = function (t) {
    const dt = Math.min(.05, (t - lastT) / 1000 || 0); lastT = t;
    if (KN) try { st = 2; cur = -1; firing = 0; ads = 0; } catch (e) { }
    if (RV) try { st = 1; firing = 0; ads = 0; } catch (e) { }
    _lb(t);
    if (mode === 'lobby') { KN = null; RV = null; RVBY = null; KO.style.display = RP.style.display = RB_.style.display = 'none'; return; }
    const hpi = document.getElementById('hpi');
    if (KN) {
      const d = 100 - hp; if (d > 0) KN.hp -= d; hp = 100;
      KN.hp -= dt * 100 / BLEED_ME;
      try { st = 2; cur = -1; firing = 0; ads = 0; if (mode === 'drive') ejectDriver(); } catch (e) { }
      if (KN.hp <= 0 || !teamUp('P')) { KN = null; RVBY = null; hp = 0; NOK = 1; send({ a: 'st', k: 0 }); try { die(); } catch (e) { } NOK = 0; }
      else if (t / 1000 - lastSt > 1) { lastSt = t / 1000; send({ a: 'st', k: 1, h: Math.round(KN.hp) }); }
    }
    // HUD de derrubado
    if (KN) {
      KO.style.display = 'block'; KO.querySelector('.bar u').style.width = Math.max(0, KN.hp) + '%';
      let by = null, pr = 0;
      for (const b of comps()) if (b.rvT && b.rvT.k === 'P' && b.rvp > 0) { by = b.nm || 'Aliado'; pr = b.rvp / RV_TIME; }
      if (!by && RVBY) { by = RVBY.nm; pr = Math.min(1, (now() - RVBY.t0) / RV_TIME); }
      KO.querySelector('.tx').textContent = by || '';
      const rv = KO.querySelector('.rv'); rv.style.display = by ? 'block' : 'none'; if (by) rv.firstChild.style.width = (pr * 100) + '%';
      if (hpi) { hpi.style.width = Math.max(0, KN.hp) + '%'; hpi.style.background = '#e0352b'; }
    } else { if (KO.style.display !== 'none') KO.style.display = 'none'; if (hpi && hpi.style.background) hpi.style.background = ''; }
    // eu reanimando alguém
    if (RV) {
      const o = RV.T.o, dd = Math.hypot(o.x - P.x, o.z - P.z);
      if (KN || mode !== 'ground' || !alive_(RV.T) || dd > RV_DIST + .4) cancelRV();
      else {
        RV.t += dt; try { st = 1; firing = 0; } catch (e) { }
        RP.style.display = 'block'; RP.firstChild.textContent = nmT(RV.T); RP.querySelector('u').style.width = Math.min(100, RV.t / RV_TIME * 100) + '%';
        if (RV.t >= RV_TIME) { const T = RV.T; RV = null; reviveT(T, myName()); try { st = 0; } catch (e) { } }
      }
    }
    if (!RV && RP.style.display !== 'none') RP.style.display = 'none';
  };
  // botão "Reanimar" aparece perto de um aliado derrubado
  setInterval(() => {
    nearT = null;
    if (mode === 'ground' && !KN && !RV) { let bd = RV_DIST; for (const T of targets()) { if (T.k === 'P') continue; const d = Math.hypot(T.o.x - P.x, T.o.z - P.z); if (d < bd) { bd = d; nearT = T; } } }
    RB_.style.display = nearT ? 'flex' : 'none';
    // lista da equipe: marca quem está derrubado
    try {
      const box = document.getElementById('dzTeam'); if (box && box.style.display !== 'none') {
        const names = new Set(); if (KN) names.add(localStorage.getItem('deadzone_player_name') || 'Você');
        for (const T of targets()) if (T.k !== 'P') names.add(nmT(T));
        for (const m of box.querySelectorAll('.m')) { const b = m.querySelector('.t b'); m.classList.toggle('kn', !!(b && names.has(b.textContent))); }
      }
    } catch (e) { }
  }, 200);

  // ---------- ganchos (depois de todos os scripts) ----------
  window.addEventListener('load', () => {
    const _die = die;
    die = function () {
      if (!NOK && !solo() && mode !== 'dead' && mode !== 'lobby') {
        if (KN) { const d = 100 - hp; KN.hp -= Math.max(0, d); hp = 100; if (KN.hp > 0) return; KN = null; RVBY = null; hp = 0; send({ a: 'st', k: 0 }); }
        else if ((mode === 'ground' || mode === 'drive') && teamUp('P')) { enterKnock(); return; }
      }
      return _die.apply(this, arguments);
    };
    _kb = killBot;
    killBot = function (b, me) {
      if (b && b.team === 1 && b.isCompanion && !b.dead && !solo()) {
        if (!b.kn) { if (teamUp(b)) { knockBot(b); return; } }
        else if (b.kn.hp > 0) return;
        b.kn = null;
      }
      return _kb.apply(this, arguments);
    };
    const _hb = hurtBot;
    hurtBot = function (t, d, by) {
      if (t && t.kn && !t.dead) { t.kn.hp -= d; t.hp = Math.max(.1, t.kn.hp); t.by = by || null; if (t.kn.hp <= 0) finishBot(t); return; }
      return _hb.apply(this, arguments);
    };
    try { const _ed = entDraw; entDraw = function (e, dt, pd) { const r = _ed.apply(this, arguments); if (e && e.kn && !e.dead) knPose(e, dt); return r; }; } catch (e) { }
    try { const _r = clRx; clRx = function (m) { if (m && m.t === 'kn') { rx(m); return; } return _r.apply(this, arguments); }; } catch (e) { }
    try { const _u = useItem; useItem = function (k) { if (KN && (k === 'med' || k === 'band')) { say('Derrubado: só um aliado pode te levantar', 1.5); return; } return _u.apply(this, arguments); }; } catch (e) { }
  });
})();
