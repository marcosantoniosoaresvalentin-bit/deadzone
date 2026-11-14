/* Deadzone · features/ranked.js
 * PATENTE (pontos de ranking) + MISSÕES DIÁRIAS que ficam mais difíceis conforme a patente.
 *  - Patentes: Bronze, Prata, Ouro, Platina, Diamante, Mestre (a cada 1200 pontos).
 *    Cada partida clássica: pontos pela colocação + abates − "custo" da patente (quanto mais alto, mais cobra).
 *  - Missões: 3 por dia (trocam à meia-noite), metas multiplicadas pela patente; recompensa também cresce.
 *    Só contam partidas clássicas (inclusive online). Resgate no botão Missões do lobby.
 */
(function () {
  const TIERS = [
    { n: 'Bronze', c: '#b0713a', c2: '#6b3f1a', k: 1, cost: 0 },
    { n: 'Prata', c: '#c9d1d8', c2: '#6f7a85', k: 1.3, cost: 15 },
    { n: 'Ouro', c: '#f2c230', c2: '#8a6408', k: 1.6, cost: 30 },
    { n: 'Platina', c: '#4fd1c5', c2: '#1f6e68', k: 2, cost: 45 },
    { n: 'Diamante', c: '#7aa8ff', c2: '#2f4fa8', k: 2.5, cost: 60 },
    { n: 'Mestre', c: '#d06bff', c2: '#5a1f8a', k: 3, cost: 75 }
  ], STEP = 1200;
  const rp = () => Math.max(0, PR.rp || 0);
  const tierOf = p => Math.min(TIERS.length - 1, Math.floor(p / STEP));
  window.DZRANK = { TIERS, tier: () => TIERS[tierOf(rp())], rp };
  const emblem = (t, s) => '<i class="dzEm" style="--a:' + t.c + ';--b:' + t.c2 + ';width:' + s + 'px;height:' + s + 'px"><b style="font-size:' + Math.round(s * .42) + 'px">' + t.n[0] + '</b></i>';

  // ---------- missões ----------
  // s: 1 = numa única partida (vale o melhor) · senão soma no dia. b: meta base (Bronze). min: patente mínima
  const POOL = [
    { id: 'kills', t: 'Elimine {n} inimigos', b: 10 },
    { id: 'dmg', t: 'Cause {n} de dano', b: 2000 },
    { id: 'top10', t: 'Fique entre os 10 últimos {n} vezes', b: 3 },
    { id: 'top5', t: 'Fique entre os 5 últimos {n} vezes', b: 2 },
    { id: 'rev', t: 'Reanime aliados {n} vezes', b: 3 },
    { id: 'ad', t: 'Abra {n} caixas de suprimentos', b: 2 },
    { id: 'hs', t: 'Acerte {n} tiros na cabeça', b: 8 },
    { id: 'dist', t: 'Percorra {n} km', b: 6, km: 1 },
    { id: 'surv', t: 'Sobreviva mais de 12 minutos em {n} partidas', b: 3 },
    { id: 'k1', t: 'Faça {n} abates numa única partida', b: 5, s: 1 },
    { id: 'd1', t: 'Cause {n} de dano numa única partida', b: 800, s: 1 },
    { id: 'win', t: 'Vença {n} partida', b: 1, min: 2, fix: 1 }
  ];
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
  function rnd(seed) { let s = 0; for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function daily() {
    const d = today(); if (PR.dm && PR.dm.d === d) return PR.dm;
    const ti = tierOf(rp()), T = TIERS[ti], r = rnd(d + ':' + ((typeof mpId !== 'undefined' && mpId) || 'x'));
    const pool = POOL.filter(m => !m.min || ti >= m.min), L = [];
    while (L.length < 3 && pool.length) { const m = pool.splice(Math.floor(r() * pool.length), 1)[0]; L.push(m); }
    PR.dm = { d, ti, L: L.map(m => { const mul = m.fix ? 1 : m.s ? 1 + (T.k - 1) * .5 : T.k; let n = m.b * mul; n = m.km ? Math.round(n * 10) / 10 : n >= 100 ? Math.round(n / 50) * 50 : Math.round(n);
      return { id: m.id, n, p: 0, ok: 0, xp: Math.round(350 * T.k / 10) * 10, co: Math.round(70 * T.k / 5) * 5 }; }) };
    try { savePR(); } catch (e) { } return PR.dm;
  }
  const txt = q => { const m = POOL.find(x => x.id === q.id); return m ? m.t.replace('{n}', m.km ? String(q.n).replace('.', ',') : q.n.toLocaleString('pt-BR')) : q.id; };
  const done = q => q.p >= q.n;
  const pendingM = () => daily().L.filter(q => done(q) && !q.ok).length;
  function claimM(i) {
    const q = daily().L[i]; if (!q || !done(q) || q.ok) return; q.ok = 1; PR.xp = (PR.xp || 0) + q.xp; PR.coins = (PR.coins || 0) + q.co;
    try { savePR(); updPn(); sfx(780, .3, .15, 0); setTimeout(() => sfx(1040, .3, .15, 0), 110); } catch (e) { }
  }

  // progresso AO VIVO (mapa grande): o salvo + o que já foi feito nesta partida (só no modo clássico)
  window.dzMisLive = function () {
    const D = daily(), S = window.DZSTAT || {}; let live = false;
    try { live = mode !== 'lobby' && !MP && !(typeof SQ !== 'undefined' && SQ) && !window.DZTRAIN && !(window.DZAR_ON); } catch (e) { }
    let K = 0, DM = 0, tm = 0; try { K = kills || 0; DM = Math.round(dmgDone || 0); tm = typeof gt !== 'undefined' ? gt : 0; } catch (e) { }
    const inc = { kills: K, dmg: DM, rev: S.rev || 0, ad: S.ad || 0, hs: S.hs || 0, dist: Math.round((S.dist || 0) / 100) / 10, surv: tm >= 720 ? 1 : 0 };
    return D.L.map(q => {
      let p = q.p;
      if (live && !q.ok) { if (q.id === 'k1') p = Math.max(p, K); else if (q.id === 'd1') p = Math.max(p, DM); else p = Math.round((p + (inc[q.id] || 0)) * 10) / 10; }
      p = Math.min(p, q.n); return { t: txt(q), p, n: q.n, done: q.ok || p >= q.n };
    });
  };

  // ---------- fim de partida: pontos de patente e progresso das missões ----------
  function onEnd(win) {
    let classic = true; try { classic = !MP && !(typeof SQ !== 'undefined' && SQ); } catch (e) { }
    if (!classic) return null;
    const place = win ? 1 : Math.max(1, alive), S = window.DZSTAT || {};
    // patente
    const ti = tierOf(rp()), T = TIERS[ti];
    const pp = place === 1 ? 100 : place <= 5 ? 65 : place <= 10 ? 45 : place <= 25 ? 22 : place <= 50 ? 6 : 0;
    const d = Math.round(pp + Math.min(10, kills) * 12 - T.cost);
    const p0 = rp(); PR.rp = Math.max(0, p0 + d);
    // missões
    const D = daily(), tm = (typeof gt !== 'undefined' ? gt : 0);
    const inc = { kills, dmg: Math.round(dmgDone), top10: place <= 10 ? 1 : 0, top5: place <= 5 ? 1 : 0, rev: S.rev || 0, ad: S.ad || 0, hs: S.hs || 0, dist: Math.round((S.dist || 0) / 100) / 10, surv: tm >= 720 ? 1 : 0, win: win ? 1 : 0 };
    for (const q of D.L) { if (q.ok) continue; if (q.id === 'k1') q.p = Math.max(q.p, kills); else if (q.id === 'd1') q.p = Math.max(q.p, Math.round(dmgDone)); else q.p = Math.round((q.p + (inc[q.id] || 0)) * 10) / 10; q.p = Math.min(q.p, q.n); }
    try { savePR(); } catch (e) { }
    return { d, p0, p1: PR.rp, t0: ti, t1: tierOf(PR.rp) };
  }

  // ---------- telas ----------
  const css = document.createElement('style'); css.textContent = `
.dzEm{display:inline-flex;align-items:center;justify-content:center;flex:none;background:linear-gradient(160deg,var(--a),var(--b));clip-path:polygon(25% 3%,75% 3%,100% 50%,75% 97%,25% 97%,0 50%);font-style:normal;box-shadow:inset 0 0 0 2px rgba(255,255,255,.3)}
.dzEm b{color:#fff;font-weight:900;text-shadow:0 1px 2px rgba(0,0,0,.6);font-family:Impact,Haettenschweiler,"Arial Black",sans-serif}
#dz43 .prof .av.dzR{background:none!important;display:flex;align-items:center;justify-content:center}
#dzRk{position:fixed;inset:0;z-index:70;display:none;flex-direction:column;background:linear-gradient(160deg,#121813,#0a0d0a 60%,#14110a);color:#fff;font-family:Bahnschrift,Oswald,"Roboto Condensed",system-ui,sans-serif;padding:max(10px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) 12px max(16px,env(safe-area-inset-left));overflow:auto}
#dzRk .hd{display:flex;align-items:center;gap:12px}#dzRk .hd h2{margin:0;font:italic 900 clamp(18px,5.5vh,28px)/1 Impact,Haettenschweiler,"Arial Black",sans-serif;letter-spacing:1px}#dzRk .hd h2 span{color:#ffc933}
#dzRk .hd .tabs{display:flex;gap:6px;margin-left:10px}#dzRk .hd .tabs button{background:rgba(255,255,255,.08);color:#cfd4ca;border:1px solid rgba(255,255,255,.15);border-radius:5px;padding:6px 12px;font:700 12px system-ui;position:relative}
#dzRk .hd .tabs button.on{background:#ffc933;color:#231700;border-color:#ffc933}#dzRk .hd .tabs button i{position:absolute;right:-4px;top:-4px;width:9px;height:9px;border-radius:50%;background:#ff3b30}
#dzRk .hd .x{margin-left:auto;background:rgba(255,255,255,.1);color:#fff;border:0;border-radius:6px;width:38px;height:34px;font:800 16px system-ui}
#dzRk .me{display:flex;align-items:center;gap:16px;margin:2vh 0 1.5vh}#dzRk .me .nm{font:italic 900 clamp(20px,6vh,34px)/1 Impact,Haettenschweiler,"Arial Black",sans-serif}
#dzRk .me .pt{color:#c9cec4;font-size:13px;margin-top:4px}#dzRk .me .br{width:min(360px,50vw);height:8px;border-radius:4px;background:rgba(255,255,255,.12);margin-top:6px;overflow:hidden}#dzRk .me .br u{display:block;height:100%;background:linear-gradient(90deg,#f3c35a,#ffdf85)}
#dzRk .me .lt{margin-left:auto;font-size:13px;color:#b8beb3;text-align:right}#dzRk .me .lt b{display:block;font-size:20px}#dzRk .me .lt b.up{color:#7be07b}#dzRk .me .lt b.dn{color:#ff6a5a}
#dzRk .ld{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}#dzRk .ld div{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:7px;padding:10px 6px;display:flex;flex-direction:column;align-items:center;gap:5px;font-size:12px;color:#c9cec4}
#dzRk .ld div.on{border-color:#ffc933;background:rgba(255,201,51,.1);color:#fff}#dzRk .ld div small{color:#8f968a;font-size:10px}
#dzRk .ms{display:flex;flex-direction:column;gap:9px;margin-top:1.5vh}
#dzRk .mq{display:flex;align-items:center;gap:12px;background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.03));border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:10px 12px}
#dzRk .mq .tx{flex:1;min-width:0}#dzRk .mq .tx b{display:block;font-size:clamp(13px,3.6vh,16px)}#dzRk .mq .tx i{display:block;height:7px;border-radius:4px;background:rgba(255,255,255,.12);margin-top:6px;overflow:hidden}#dzRk .mq .tx i u{display:block;height:100%;background:#5fd37a}
#dzRk .mq .tx small{color:#aab0a6;font-size:12px}#dzRk .mq .rw{text-align:right;font-size:12px;color:#c9cec4;white-space:nowrap}#dzRk .mq .rw b{color:#7be07b}#dzRk .mq .rw em{font-style:normal;color:#ffc933;font-weight:800}
#dzRk .mq button{border:0;border-radius:6px;padding:9px 14px;font:800 12px system-ui;min-width:96px}#dzRk .mq button.go{background:linear-gradient(180deg,#ffd65c,#f0a91c);color:#2a1a00}#dzRk .mq button.ok{background:rgba(123,224,123,.15);color:#7be07b}#dzRk .mq button.no{background:rgba(255,255,255,.07);color:#8a9086}
#dzRk .rs{margin-left:auto;color:#aab0a6;font-size:12px}
#dz43 .menu button{position:relative}#dz43 .menu button .dzpd2{position:absolute;right:6px;top:6px;width:9px;height:9px;border-radius:50%;background:#ff3b30;display:none}
#eg .e2 .rkx{display:flex;align-items:center;gap:10px;background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.08);border-radius:6px;padding:.9vh 12px;font-size:clamp(11px,3vh,14px);color:#cfd4ca}
#eg .e2 .rkx b{color:#fff}#eg .e2 .rkx .d{margin-left:auto;font-weight:900}#eg .e2 .rkx .d.up{color:#7be07b}#eg .e2 .rkx .d.dn{color:#ff6a5a}#eg .e2 .rkx .pr{color:#ffc933;font-weight:900;letter-spacing:.5px}`;
  document.head.appendChild(css);
  const W = document.createElement('div'); W.id = 'dzRk'; document.body.appendChild(W);
  let tab = 'mis';
  function render() {
    const p = rp(), ti = tierOf(p), T = TIERS[ti], a = ti * STEP, top = ti === TIERS.length - 1, D = daily(), pm = pendingM();
    let h = '<div class="hd"><h2>' + (tab === 'mis' ? 'MISSÕES <span>DIÁRIAS</span>' : 'PATENTE <span>' + T.n.toUpperCase() + '</span>') + '</h2><div class="tabs"><button data-tab="mis" class="' + (tab === 'mis' ? 'on' : '') + '">Missões' + (pm ? '<i></i>' : '') + '</button><button data-tab="rank" class="' + (tab === 'rank' ? 'on' : '') + '">Patente</button></div><button class="x" data-x="1">✕</button></div>';
    const last = PR.rl;
    h += '<div class="me">' + emblem(T, 64) + '<div><div class="nm">' + T.n + '</div><div class="pt">' + p.toLocaleString('pt-BR') + ' pontos' + (top ? '' : ' · ' + (a + STEP - p).toLocaleString('pt-BR') + ' para ' + TIERS[ti + 1].n) + '</div><div class="br"><u style="width:' + (top ? 100 : (p - a) / STEP * 100) + '%"></u></div></div>'
      + (last != null ? '<div class="lt">Última partida<b class="' + (last >= 0 ? 'up' : 'dn') + '">' + (last >= 0 ? '+' : '') + last + '</b></div>' : '') + '</div>';
    if (tab === 'mis') {
      const now = new Date(), mid = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1), ms = mid - now, hh = Math.floor(ms / 3600000), mm = Math.floor(ms % 3600000 / 60000);
      h += '<div style="display:flex;align-items:center"><small style="color:#c9cec4">Dificuldade ' + T.n + ' (×' + String(T.k).replace('.', ',') + ')</small><span class="rs">Novas missões em ' + hh + 'h ' + mm + 'min</span></div><div class="ms">'
        + D.L.map((q, i) => '<div class="mq"><div class="tx"><b>' + txt(q) + '</b><i><u style="width:' + Math.min(100, q.p / q.n * 100) + '%"></u></i><small>' + String(q.p).replace('.', ',') + ' / ' + String(q.n).replace('.', ',') + '</small></div><div class="rw"><b>+' + q.xp + ' XP</b><br><em>+' + q.co + ' moedas</em></div>'
          + (q.ok ? '<button class="ok">✓ Resgatada</button>' : done(q) ? '<button class="go" data-m="' + i + '">Resgatar</button>' : '<button class="no">Em andamento</button>') + '</div>').join('') + '</div>';
    } else {
      h += '<div class="ld">' + TIERS.map((t, i) => '<div class="' + (i === ti ? 'on' : '') + '">' + emblem(t, 40) + t.n + '<small>' + (i * STEP).toLocaleString('pt-BR') + '+ pts</small></div>').join('') + '</div>';
    }
    W.innerHTML = h;
  }
  W.addEventListener('pointerdown', e => {
    const b = e.target.closest('button'); if (!b) return; e.preventDefault(); e.stopPropagation();
    if (b.dataset.x) { W.style.display = 'none'; return; }
    if (b.dataset.tab) { tab = b.dataset.tab; render(); return; }
    if (b.dataset.m) { claimM(+b.dataset.m); render(); }
  });
  const open = t => { tab = t; daily(); W.style.display = 'flex'; render(); };
  window.dzOpenMissions = () => open('mis'); window.dzOpenRank = () => open('rank');
  // botões Missões e Ranking do lobby abrem esta tela (antes eram listas de enfeite)
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('#dz43 .menu button'); if (!b) return; const m = b.dataset.m; if (m === 'mis' || m === 'rank') { e.stopPropagation(); e.preventDefault(); open(m === 'mis' ? 'mis' : 'rank'); } }, true);
  // emblema da patente no perfil do lobby + pontinho vermelho em Missões
  setInterval(() => {
    try {
      const av = document.querySelector('#dz43 .prof .av'), T = TIERS[tierOf(rp())];
      if (av && av.dataset.t !== T.n) { av.dataset.t = T.n; av.classList.add('dzR'); av.innerHTML = emblem(T, 34); av.title = T.n; }
      const mb = document.querySelector('#dz43 .menu button[data-m="mis"]'); if (mb) { let d = mb.querySelector('.dzpd2'); if (!d) { d = document.createElement('i'); d.className = 'dzpd2'; mb.appendChild(d); } d.style.display = pendingM() ? 'block' : 'none'; }
    } catch (e) { }
  }, 600);

  window.addEventListener('load', () => {
    const _g = gEnd; let done_ = 0;
    gEnd = function (w) {
      const first = !ended; const r = _g.apply(this, arguments);
      if (first && !done_) { done_ = 1; let R_ = null; try { R_ = onEnd(!!w); } catch (e) { console.warn('patente', e); }
        if (R_) { PR.rl = R_.d; try { savePR(); } catch (e) { }
          const T1 = TIERS[R_.t1], box = document.querySelector('#eg .e2 .R .e2bt');
          if (box) box.insertAdjacentHTML('beforebegin', '<div class="rkx">' + emblem(T1, 26) + '<span>Patente <b>' + T1.n + '</b> · ' + R_.p1.toLocaleString('pt-BR') + ' pts</span>' + (R_.t1 > R_.t0 ? '<span class="pr">SUBIU DE PATENTE!</span>' : R_.t1 < R_.t0 ? '<span class="d dn">CAIU DE PATENTE</span>' : '') + '<span class="d ' + (R_.d >= 0 ? 'up' : 'dn') + '">' + (R_.d >= 0 ? '+' : '') + R_.d + '</span></div>');
        } }
      return r;
    };
    const _sg = startGame; startGame = function () { done_ = 0; const r = _sg.apply(this, arguments); try { DZSTAT.ad = 0; } catch (e) { } return r; };
  });
})();
