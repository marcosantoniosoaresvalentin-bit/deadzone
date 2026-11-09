/* Deadzone · game/pings.js
 * MARCAÇÃO PARA O TIME + COMUNICAÇÃO RÁPIDA (sem texto no meio da tela).
 * - Botão "marcar": marca o ponto da mira. Se a mira estiver num inimigo, vira marcação vermelha de inimigo.
 * - Botão "rádio": menu com Inimigo / Ir para cá / Item aqui e as falas rápidas
 *   (Preciso de munição, Preciso de kit, Me ajuda, Vamos!, Cuidado!).
 * - Marcações: ícone no mundo com a distância, no minimapa e no mapa grande. Somem sozinhas.
 * - Falas: balãozinho ao lado do nome de quem falou, na lista da equipe (à esquerda).
 * - Bots companheiros vão até a marcação "Ir para cá".
 * - Online: os parceiros da equipe veem as marcações e as falas.
 */
(function () {
  const KIND = {
    e: { c: '#ff4a3d', life: 10, ic: '<path d="M12 2l3 7h7l-5.5 4.5 2 7.5L12 16.5 5.5 21l2-7.5L2 9h7z"/>' },               // inimigo
    g: { c: '#f3c35a', life: 25, ic: '<path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/>' }, // ir para cá
    i: { c: '#5fd37a', life: 25, ic: '<path d="M4 8l8-4 8 4v9l-8 4-8-4z M12 12v9 M4 8l8 4 8-4" fill="none" stroke="#000" stroke-width="1.6"/><path d="M4 8l8-4 8 4-8 4z"/>' } // item
  };
  const QC = [
    { k: 'e', t: 'Inimigo' }, { k: 'g', t: 'Ir para cá' }, { k: 'i', t: 'Item aqui' },
    { q: 1, t: 'Preciso de munição' }, { q: 2, t: 'Preciso de kit' }, { q: 3, t: 'Me ajuda!' }, { q: 4, t: 'Vamos!' }, { q: 5, t: 'Cuidado!' }
  ];
  const PINGS = []; window.DZPINGS = PINGS;
  let seq = 0;
  const myId = () => { try { return mpId || 'me'; } catch (e) { return 'me'; } };
  const myName = () => { try { return localStorage.getItem('deadzone_player_name') || 'Você'; } catch (e) { return 'Você'; } };
  const net = () => { try { return typeof N !== 'undefined' && N && (N.mode === 'classic' || N.mode === 'squad'); } catch (e) { return false; } };
  const send = m => { try { if (net()) gp(m, 1); } catch (e) { } };
  const allyOf = id => {
    try { if (typeof SQ !== 'undefined' && SQ && SQ.tm) return SQ.tm[id] === SQ.mt; } catch (e) { }
    try { return window.dzAllies && [...window.dzAllies].includes(id); } catch (e) { return false; }
  };
  const nameOf = id => { if (id === myId()) return myName(); try { return (window.dzAllyNames || {})[id] || nmId(id) || 'Parceiro'; } catch (e) { return 'Parceiro'; } };
  const inMatch = () => mode === 'ground' || mode === 'drive' || mode === 'chute' || mode === 'sky' || (window.dzKnocked && dzKnocked());

  // ---------- onde a mira aponta ----------
  const _v = new T.Vector3(), _o = new T.Vector3();
  function aim() {
    cam.getWorldDirection(_v); _o.copy(cam.position);
    // inimigo na mira?
    const foes = [];
    try { for (const b of bots) if (!b.dead && !b.air && b.team !== 1 && b.g.visible) foes.push([b.x, TERH(b.x, b.z) + 1.1, b.z]); } catch (e) { }
    try { if (typeof CL !== 'undefined') for (const id in CL) { const e = CL[id]; if (!e.dead && e.vis && !allyOf(id)) foes.push([e.x, (e.g.position.y || 0) + 1.1, e.z]); } } catch (e) { }
    try { if (typeof CB !== 'undefined') for (const k in CB) { const e = CB[k]; if (!e.dead && e.vis && !e.ally) foes.push([e.x, (e.g.position.y || 0) + 1.1, e.z]); } } catch (e) { }
    try { if (typeof SQ !== 'undefined' && SQ && SQ.B) for (const e of SQ.B) if (!e.dead && e.team !== SQ.mt && e.g) foes.push([e.x, (e.g.position.y || 0) + 1.1, e.z]); } catch (e) { }
    let best = null, bs = .045;
    for (const f of foes) for (const hy of [-.7, 0, .6]) { const dx = f[0] - _o.x, dy = f[1] + hy - _o.y, dz = f[2] - _o.z, d = Math.hypot(dx, dy, dz); if (d < 3 || d > 400) continue; const c = (dx * _v.x + dy * _v.y + dz * _v.z) / d, s = Math.sqrt(Math.max(0, 1 - c * c)); if (c > 0 && s < Math.max(bs, .9 / d) && s < .08 && !blocked(_o.x + _v.x * 1.5, _o.y + _v.y * 1.5, _o.z + _v.z * 1.5, f[0], f[1] + hy, f[2])) { bs = s; best = f; } }
    if (best) return { k: 'e', x: best[0], y: best[1] - 1.1, z: best[2] };
    // primeiro chão/telhado/parede no caminho do raio
    let px = _o.x, py = _o.y, pz = _o.z;
    for (let d = 1.5; d < 500; d += d < 60 ? .7 : 2.5) {
      const x = _o.x + _v.x * d, y = _o.y + _v.y * d, z = _o.z + _v.z * d;
      const g = GY(x, z, y + .05); if (y <= g + .05) return { k: 'g', x, y: g, z };
      try { for (const b of near(x, z)) if (!b.off && b.w !== 0 && x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1 && (b.yt !== undefined ? (y > b.yb && y < b.yt) : y < (b.h || 6))) return { k: 'g', x: px, y: GY(px, pz, py + .05), z: pz }; } catch (e) { }
      px = x; py = y; pz = z;
    }
    return null;
  }

  // ---------- marcações ----------
  const layer = document.createElement('div'); layer.id = 'dzPings'; document.body.appendChild(layer);
  function add(o, from) {
    const K = KIND[o.k]; if (!K) return;
    // uma marcação "ir para cá" por jogador; as outras se acumulam até 4
    for (let i = PINGS.length - 1; i >= 0; i--) { const q = PINGS[i]; if (q.from === from && (q.k === o.k && o.k === 'g' || PINGS.filter(z => z.from === from).length >= 4)) { q.el.remove(); PINGS.splice(i, 1); } }
    const el = document.createElement('div'); el.className = 'dzPg';
    el.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" style="fill:' + K.c + '">' + K.ic + '</svg><b></b><i>' + String(from === myId() ? '' : nameOf(from)).replace(/</g, '') + '</i>';
    el.style.setProperty('--c', K.c); layer.appendChild(el);
    PINGS.push({ id: o.id || (myId() + '_' + (++seq)), k: o.k, x: o.x, y: o.y, z: o.z, from, t: 0, life: K.life, el });
    try { sfx(o.k === 'e' ? 980 : 760, .25, .12, typeof panOf === 'function' ? panOf(o.x, o.z) : 0); } catch (e) { }
  }
  function ping(k) {
    if (!inMatch()) return;
    const a = aim(); if (!a) return; if (k && k !== 'e') a.k = k; if (k === 'e' && a.k !== 'e') a.k = 'e';
    const o = { k: a.k, x: +a.x.toFixed(1), y: +a.y.toFixed(1), z: +a.z.toFixed(1) };
    add(o, myId()); send(Object.assign({ t: 'pg' }, o));
  }
  // ---------- falas rápidas: balão ao lado do nome na lista da equipe ----------
  const bubbles = [];
  function bubble(from, i) {
    const it = QC.find(q => q.q === i); if (!it) return;
    const el = document.createElement('div'); el.className = 'dzQb'; el.textContent = it.t; document.body.appendChild(el);
    bubbles.push({ el, name: nameOf(from), t: 0 }); while (bubbles.length > 4) bubbles.shift().el.remove();
    try { sfx(660, .2, .08, 0); } catch (e) { }
  }
  function say2(i) { if (!inMatch()) return; bubble(myId(), i); send({ t: 'qc', i }); }

  // ---------- botões ----------
  const css = document.createElement('style'); css.textContent =
    '#dzPings{position:fixed;inset:0;pointer-events:none;z-index:4}' +
    '.dzPg{position:absolute;transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 1px 2px #000)}' +
    '.dzPg b{font:800 10px system-ui;color:#fff;text-shadow:0 1px 2px #000}.dzPg i{font:600 9px system-ui;font-style:normal;color:var(--c);text-shadow:0 1px 2px #000}' +
    '.dzPgB{position:fixed;z-index:6;width:46px;height:46px;border-radius:50%;border:2px solid rgba(255,255,255,.55);background:rgba(20,26,32,.62);display:none;align-items:center;justify-content:center;touch-action:none;user-select:none;-webkit-user-select:none}' +
    '#dzPgB{left:138px;top:76px}#dzQcB{left:192px;top:76px}' +
    '#dzQcM{position:fixed;left:138px;top:128px;z-index:7;display:none;flex-direction:column;gap:3px;background:rgba(14,18,24,.88);border:1px solid rgba(255,255,255,.18);border-radius:8px;padding:5px;min-width:150px}' +
    '#dzQcM div{font:700 12px system-ui;color:#fff;padding:6px 9px;border-radius:5px;background:rgba(255,255,255,.07);display:flex;align-items:center;gap:7px}#dzQcM div:active{background:rgba(243,195,90,.35)}' +
    '#dzQcM hr{border:0;border-top:1px solid rgba(255,255,255,.15);margin:2px 0}' +
    '.dzQb{position:fixed;z-index:6;pointer-events:none;background:rgba(243,195,90,.95);color:#1b1404;font:800 10px system-ui;padding:3px 7px;border-radius:9px;white-space:nowrap;display:none}' +
    '.dzQb:before{content:"";position:absolute;left:-5px;top:50%;margin-top:-4px;border:4px solid transparent;border-right-color:rgba(243,195,90,.95);border-left:0}';
  document.head.appendChild(css);
  const mk = (id, svg) => { const b = document.createElement('div'); b.id = id; b.className = 'dzPgB'; b.innerHTML = svg; document.body.appendChild(b); return b; };
  const bP = mk('dzPgB', '<svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>');
  const bQ = mk('dzQcB', '<svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>');
  const M = document.createElement('div'); M.id = 'dzQcM';
  M.innerHTML = QC.map((q, n) => (n === 3 ? '<hr>' : '') + '<div data-n="' + n + '">' + (q.k ? '<svg viewBox="0 0 24 24" width="14" height="14" style="fill:' + KIND[q.k].c + '">' + KIND[q.k].ic + '</svg>' : '<svg viewBox="0 0 24 24" width="14" height="14" fill="#f3c35a"><path d="M4 4h16v11H9l-5 4z"/></svg>') + q.t + '</div>').join('');
  document.body.appendChild(M);
  const tap = (el, f) => el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); f(e); });
  tap(bP, () => ping(null));
  tap(bQ, () => { M.style.display = M.style.display === 'flex' ? 'none' : 'flex'; });
  tap(M, e => { const d = e.target.closest('[data-n]'); if (!d) return; const q = QC[+d.dataset.n]; M.style.display = 'none'; if (q.k) ping(q.k); else say2(q.q); });
  setInterval(() => {
    const on = inMatch() && mode !== 'sky' && mode !== 'chute';
    bP.style.display = bQ.style.display = on ? 'flex' : 'none'; if (!on) M.style.display = 'none';
    if (mode === 'lobby' && PINGS.length) { for (const q of PINGS) q.el.remove(); PINGS.length = 0; }
  }, 250);

  // ---------- rede ----------
  function rx(m) {
    if (!m || !allyOf(m.f)) return;
    if (m.t === 'pg') add(m, m.f);
    else if (m.t === 'qc') bubble(m.f, m.i);
  }

  // ---------- quadro a quadro: posição das marcações e balões ----------
  const _p = new T.Vector3();
  let lastT = 0;
  const _lb = window.loopBody;
  window.loopBody = function (t) {
    const dt = Math.min(.1, (t - lastT) / 1000 || 0); lastT = t; _lb(t);
    const W = innerWidth, H = innerHeight;
    for (let i = PINGS.length - 1; i >= 0; i--) {
      const q = PINGS[i]; q.t += dt;
      const dist = Math.hypot(q.x - P.x, q.z - P.z);
      if (q.t > q.life || (q.k === 'g' && q.from === myId() && dist < 3 && q.t > 2)) { q.el.remove(); PINGS.splice(i, 1); continue; }
      _p.set(q.x, q.y + 1.2, q.z).project(cam);
      let x = (_p.x + 1) / 2 * W, y = (1 - _p.y) / 2 * H; const behind = _p.z > 1;
      if (behind) { x = W - x; y = H - 40; }
      x = Math.max(24, Math.min(W - 24, x)); y = Math.max(40, Math.min(H - 30, y));
      q.el.style.left = x + 'px'; q.el.style.top = y + 'px'; q.el.style.opacity = q.t > q.life - 2 ? Math.max(0, (q.life - q.t) / 2) : 1;
      const tx = Math.round(dist) + ' m'; const bb = q.el.children[1]; if (bb.textContent !== tx) bb.textContent = tx;
    }
    if (bubbles.length) {
      const rows = [...document.querySelectorAll('#dzTeam .m')];
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const B = bubbles[i]; B.t += dt; if (B.t > 4.5) { B.el.remove(); bubbles.splice(i, 1); continue; }
        const r = rows.find(z => { const b = z.querySelector('.t b'); return b && b.textContent === B.name; });
        if (!r) { B.el.style.display = 'none'; continue; }
        const rc = r.getBoundingClientRect(); B.el.style.display = 'block'; B.el.style.left = (rc.right + 8) + 'px'; B.el.style.top = (rc.top + rc.height / 2 - 9) + 'px';
      }
    }
  };

  // ---------- minimapa, mapa grande, companheiros ----------
  window.addEventListener('load', () => {
    try { const _r = clRx; clRx = function (m) { if (m && (m.t === 'pg' || m.t === 'qc')) { rx(m); return; } return _r.apply(this, arguments); }; } catch (e) { }
    try { const _r = sqRx; sqRx = function (m) { if (m && (m.t === 'pg' || m.t === 'qc')) { rx(m); return; } return _r.apply(this, arguments); }; } catch (e) { }
    const dot = (g2, x, y, s, c, k) => { g2.save(); g2.translate(x, y); g2.fillStyle = c; g2.strokeStyle = '#000'; g2.lineWidth = 1.2; g2.beginPath(); if (k === 'e') { g2.moveTo(0, -6 * s); g2.lineTo(6 * s, 0); g2.lineTo(0, 6 * s); g2.lineTo(-6 * s, 0); } else { g2.arc(0, -3 * s, 4.5 * s, Math.PI * .85, Math.PI * .15); g2.lineTo(0, 5 * s); } g2.closePath(); g2.fill(); g2.stroke(); g2.restore(); };
    const _mm = window.dzMMExtra; window.dzMMExtra = function (mx, X, Z, ra) { try { if (_mm) _mm.apply(this, arguments); } catch (e) { } for (const q of PINGS) { let px = X(q.x), pz = Z(q.z); const l = Math.hypot(px, pz); if (l > 52) { px *= 52 / l; pz *= 52 / l; } mx.save(); mx.translate(px, pz); mx.rotate(ra); dot(mx, 0, 0, 1, KIND[q.k].c, q.k); mx.restore(); } };
    const _wm = window.dzWMExtra; window.dzWMExtra = function (g2, X, Y, d) { try { if (_wm) _wm.apply(this, arguments); } catch (e) { } for (const q of PINGS) dot(g2, X(q.x), Y(q.z), d * 1.3, KIND[q.k].c, q.k); };
    // companheiros (bots) vão até a minha marcação "Ir para cá"
    const _rv = window.dzRvBot;
    window.dzRvBot = function (b, dt) {
      if (_rv && _rv(b, dt)) return true;
      const G = PINGS.find(q => q.k === 'g' && q.from === myId()); if (!G) return false;
      const ox = ((b.squadSlot || 2) - 3) * 2.2, d = Math.hypot(G.x + ox - b.x, G.z - b.z);
      if (d > 2.5) { botNavigate(b, G.x + ox, G.z, 2.8, dt); b.rvMv = 1; } else b.rvMv = 0;
      return true;
    };
  });
  window.dzPing = { ping, say: say2, aim };
})();
