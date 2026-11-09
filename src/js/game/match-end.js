/* Deadzone · game/match-end.js
 * TELA DE FIM DE PARTIDA (estilo battle royale), feita em HTML — sem imagem pronta.
 *  - Colocação grande (#17/100), título (ELIMINADO / VITÓRIA!) e quem eliminou (com a arma).
 *  - 6 cartões: abates, dano causado, tempo vivo, distância percorrida, reanimações, precisão.
 *  - Equipe: situação de cada um (vivo / derrubado / eliminado).
 *  - Barra de nível animada com o XP ganho e as moedas.
 *  - Botões: Assistir (segue quem ainda está vivo) e Voltar ao lobby.
 * As estatísticas são contadas durante a partida (DZSTAT).
 */
(function () {
  const S = window.DZSTAT = { dist: 0, shots: 0, hits: 0, hs: 0, rev: 0, heal: 0, tot: 100, lx: null, lz: null };
  function reset() { Object.assign(S, { shown: 0, dist: 0, shots: 0, hits: 0, hs: 0, rev: 0, heal: 0, lx: null, lz: null }); }

  // ---------- contagem durante a partida ----------
  let lastT = 0;
  const _lb = window.loopBody;
  window.loopBody = function (t) {
    _lb(t);
    try {
      if (mode === 'ground' || mode === 'drive' || mode === 'glide') {
        if (S.lx != null) { const d = Math.hypot(P.x - S.lx, P.z - S.lz); if (d < 40) S.dist += d; }
        S.lx = P.x; S.lz = P.z;
      } else if (mode !== 'dead') { S.lx = null; }
    } catch (e) { }
  };

  // ---------- tela ----------
  const css = document.createElement('style'); css.textContent = `
#eg.eg2{z-index:60!important;background:radial-gradient(ellipse at 30% 40%,rgba(30,36,28,.78),rgba(6,8,6,.94) 70%)!important;padding:0!important;display:none;align-items:stretch!important;justify-content:stretch!important}
#eg.eg2::before{display:none!important}
#eg .e2{position:absolute;inset:0;display:flex;gap:2.2vw;padding:max(14px,env(safe-area-inset-top)) max(22px,env(safe-area-inset-right)) 14px max(22px,env(safe-area-inset-left));font-family:Bahnschrift,Oswald,"Roboto Condensed",system-ui,sans-serif;color:#fff;text-align:left;animation:e2in .45s ease-out both}
@keyframes e2in{from{transform:translateY(10px)}to{transform:none}}
#eg .e2 .L{flex:0 0 38%;display:flex;flex-direction:column;justify-content:center;min-width:0}
#eg .e2 .R{flex:1;display:flex;flex-direction:column;justify-content:center;gap:1.6vh;min-width:0}
#eg .e2 .rk{font:italic 900 clamp(64px,19vh,150px)/.9 Impact,Haettenschweiler,"Arial Black",sans-serif;color:#fff;letter-spacing:-2px;text-shadow:0 4px 0 rgba(0,0,0,.45)}
#eg .e2 .rk small{font-size:.32em;color:#aab0a6;letter-spacing:0;margin-left:6px}
#eg .e2.win .rk{color:#ffc933;text-shadow:0 4px 0 #6b3d00,0 0 28px rgba(255,190,40,.45)}
#eg .e2 .tt{font:italic 900 clamp(22px,6.4vh,44px)/1 Impact,Haettenschweiler,"Arial Black",sans-serif;letter-spacing:2px;margin-top:4px;color:#e9ecef}
#eg .e2.win .tt{color:#ffd65c}
#eg .e2 .by{margin-top:8px;font-size:clamp(12px,3.2vh,16px);color:#c9cec4;display:flex;align-items:center;gap:7px;flex-wrap:wrap}
#eg .e2 .by b{color:#ff6a5a}#eg .e2 .by i{font-style:normal;background:rgba(255,255,255,.1);padding:2px 7px;border-radius:4px;color:#e8e8e8}
#eg .e2 .tm{margin-top:2.2vh;display:flex;flex-direction:column;gap:5px;max-width:300px}
#eg .e2 .tm div{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.06);border-left:3px solid var(--c);padding:4px 9px;border-radius:3px;font-size:clamp(11px,3vh,14px)}
#eg .e2 .tm div span{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#eg .e2 .tm div em{font-style:normal;font-size:.85em;color:#9fa69a}#eg .e2 .tm div.dead em{color:#ff6a5a}#eg .e2 .tm div.ok em{color:#7be07b}#eg .e2 .tm div.kn em{color:#ffb14a}
#eg .e2 .gr{display:grid;grid-template-columns:repeat(3,1fr);gap:1.2vh 1vw}
#eg .e2 .cd{background:linear-gradient(180deg,rgba(255,255,255,.09),rgba(255,255,255,.03));border:1px solid rgba(255,255,255,.1);border-radius:6px;padding:1.4vh 12px;animation:e2in .4s ease-out both}
#eg .e2 .cd b{display:block;font:italic 900 clamp(20px,7vh,38px)/1 Impact,Haettenschweiler,"Arial Black",sans-serif;color:#ffc933}
#eg .e2 .cd span{display:block;margin-top:3px;font-size:clamp(10px,2.7vh,13px);color:#b8beb3;text-transform:uppercase;letter-spacing:.6px}
#eg .e2 .xp{background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.08);border-radius:6px;padding:1.3vh 12px}
#eg .e2 .xp .h{display:flex;align-items:baseline;gap:10px;font-size:clamp(11px,3vh,14px);color:#cfd4ca}
#eg .e2 .xp .h b{color:#fff;font-size:1.15em}#eg .e2 .xp .h .g{margin-left:auto;color:#7be07b;font-weight:800}#eg .e2 .xp .h .c{color:#ffc933;font-weight:800}
#eg .e2 .xp .bar{margin-top:7px;height:9px;border-radius:5px;background:rgba(255,255,255,.12);overflow:hidden;position:relative}
#eg .e2 .xp .bar u{position:absolute;left:0;top:0;bottom:0;background:#6d7a5c}#eg .e2 .xp .bar i{position:absolute;top:0;bottom:0;background:linear-gradient(90deg,#f3c35a,#ffdf85);transition:width 1.4s ease-out}
#eg .e2 .xp .up{display:none;margin-left:8px;color:#ffc933;font-weight:900;letter-spacing:1px}
#eg .e2 .e2bt{display:flex;gap:12px;justify-content:flex-end;margin-top:.4vh}
#eg .e2 .e2bt button{font:italic 900 clamp(14px,4vh,20px)/1 Impact,Haettenschweiler,"Arial Black",sans-serif;letter-spacing:1px;padding:1.6vh 26px;border-radius:5px;border:0;cursor:pointer}
#eg .e2 .e2bt button{position:static!important;opacity:1!important;width:auto!important;height:auto!important;inset:auto!important;transform:none!important;display:inline-block!important}
#eg .e2 #egr{font:italic 900 clamp(14px,4vh,20px)/1 Impact,Haettenschweiler,"Arial Black",sans-serif!important;letter-spacing:1px;padding:1.6vh 26px!important;border-radius:5px;background:linear-gradient(180deg,#ffd65c,#f0a91c);color:#2a1a00!important;box-shadow:0 3px 0 #8a5a00}
#eg .e2 #egs{font:italic 900 clamp(14px,4vh,20px)/1 Impact,Haettenschweiler,"Arial Black",sans-serif!important;letter-spacing:1px;padding:1.6vh 26px!important;border-radius:5px;background:rgba(255,255,255,.12);color:#fff!important;border:1px solid rgba(255,255,255,.25)}
body.dzEnd #dzTeam,body.dzEnd .dzPgB,body.dzEnd #dzShRec,body.dzEnd #dzRvB,body.dzEnd #dzAdB,body.dzEnd #dzKO{display:none!important}
@media (max-aspect-ratio:1/1){#eg .e2{flex-direction:column;overflow:auto}#eg .e2 .L{flex:none}#eg .e2 .gr{grid-template-columns:repeat(2,1fr)}}`;
  document.head.appendChild(css);

  const esc = s => String(s == null ? '' : s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  const myName = () => { try { return localStorage.getItem('deadzone_player_name') || 'Você'; } catch (e) { return 'Você'; } };
  function killer(win) {
    if (win) return '<span>Último de pé</span>';
    try { if (Math.hypot(P.x - zX, P.z - zZ) > zR) return '<span>Morreu na zona</span>'; } catch (e) { }
    try { if (lastHitBy && lastHitBy.g) { const w = lastHitBy.w && WS[lastHitBy.w] ? WS[lastHitBy.w].n : ''; return 'Eliminado por <b>' + esc(bnm(lastHitBy)) + '</b>' + (w ? '<i>' + esc(w) + '</i>' : ''); } } catch (e) { }
    try { if (typeof lastHit !== 'undefined' && lastHit) return 'Eliminado por <b>' + esc(nmId(lastHit)) + '</b>'; } catch (e) { }
    return '<span>Eliminado</span>';
  }
  function team(win) {
    const L = [], COL = ['#f3c35a', '#5ac8ff', '#7be07b', '#ff8ad0'];
    L.push({ n: myName(), st: win ? 'ok' : 'dead' });
    try { for (const id of [...(window.dzAllies || [])]) { const e = CL[id]; if (e) L.push({ n: (window.dzAllyNames || {})[id] || nmId(id), st: e.dead ? 'dead' : e.kn ? 'kn' : 'ok' }); } } catch (e) { }
    try { for (const b of bots) if (b.team === 1 && b.isCompanion) L.push({ n: b.nm || 'Aliado', st: b.dead ? 'dead' : b.kn ? 'kn' : 'ok' }); } catch (e) { }
    try { if (typeof CB !== 'undefined') for (const k in CB) { const e = CB[k]; if (e.ally) L.push({ n: e.nm || nmOf(e), st: e.dead ? 'dead' : e.kn ? 'kn' : 'ok' }); } } catch (e) { }
    if (L.length < 2) return '';
    const T = { dead: 'Eliminado', kn: 'Derrubado', ok: 'Vivo' };
    return '<div class="tm">' + L.slice(0, 4).map((m, i) => '<div class="' + m.st + '" style="--c:' + COL[i] + '"><span>' + esc(m.n) + '</span><em>' + T[m.st] + '</em></div>').join('') + '</div>';
  }
  function render(win) {
    const place = win ? 1 : Math.max(1, alive), tot = Math.max(S.tot || 100, place);
    const xp = kills * 40 + Math.round(dmgDone / 10) + Math.max(0, 100 - place) * 2 + (win ? 300 : 0), coins = kills * 10 + Math.round(Math.max(0, 100 - place) / 5) + (win ? 150 : 0);
    const x1 = PR.xp, x0 = Math.max(0, x1 - xp), l0 = lvOf(x0), l1 = lvOf(x1);
    const pc = (x, l) => Math.max(0, Math.min(100, (x - lvStart(l)) / Math.max(1, lvStart(l + 1) - lvStart(l)) * 100));
    const tm = Math.max(0, Math.round(gt)), tStr = Math.floor(tm / 60) + ':' + ('0' + tm % 60).slice(-2);
    const dist = S.dist >= 1000 ? (S.dist / 1000).toFixed(1) + ' km' : Math.round(S.dist) + ' m';
    const acc = S.shots ? Math.round(Math.min(1, S.hits / S.shots) * 100) + '%' : '—';
    let canSpec = false; try { canSpec = !win && bots.some(b => !b.dead && !b.air); } catch (e) { }
    const cards = [[kills, 'Abates'], [Math.round(dmgDone), 'Dano causado'], [tStr, 'Tempo vivo'], [dist, 'Distância'], [S.rev, 'Reanimações'], [acc, 'Precisão']];
    document.body.classList.add('dzEnd');
    const eg = $('eg'); eg.className = 'eg2' + (win ? ' win' : ''); eg.removeAttribute('style'); eg.style.display = 'flex';
    eg.innerHTML = '<div class="e2' + (win ? ' win' : '') + '"><div class="L"><div class="rk">#' + place + '<small>/' + tot + '</small></div><div class="tt">' + (win ? 'VITÓRIA!' : 'ELIMINADO') + '</div><div class="by">' + killer(win) + '</div>' + team(win) + '</div>'
      + '<div class="R"><div class="gr">' + cards.map((c, i) => '<div class="cd" style="animation-delay:' + (.08 * i + .15) + 's"><b>' + esc(c[0]) + '</b><span>' + c[1] + '</span></div>').join('') + '</div>'
      + '<div class="xp"><div class="h">Nível <b id="e2lv">' + l0 + '</b><span class="up" id="e2up">SUBIU DE NÍVEL!</span><span class="g">+' + xp + ' XP</span><span class="c">+' + coins + ' moedas</span></div><div class="bar"><u style="width:' + pc(x0, l0) + '%"></u><i id="e2bar" style="left:' + pc(x0, l0) + '%;width:0"></i></div></div>'
      + '<div class="e2bt">' + (canSpec ? '<button id="egs" type="button">ASSISTIR</button>' : '') + '<button id="egr" type="button">VOLTAR AO LOBBY</button></div></div></div>';
    // barra de XP: enche até o novo valor (se subiu de nível, completa e recomeça)
    setTimeout(() => {
      const bar = $('e2bar'); if (!bar) return;
      if (l1 > l0) { bar.style.width = (100 - pc(x0, l0)) + '%'; setTimeout(() => { $('e2lv').textContent = l1; $('e2up').style.display = 'inline'; const u = bar.previousElementSibling; u.style.width = '0'; bar.style.transition = 'none'; bar.style.left = '0'; bar.style.width = '0'; requestAnimationFrame(() => { bar.style.transition = ''; bar.style.width = pc(x1, l1) + '%'; }); }, 1500); }
      else bar.style.width = (pc(x1, l1) - pc(x0, l0)) + '%';
    }, 500);
    const sb = $('egs'); if (sb) sb.onclick = () => { eg.style.display = 'none'; $('spc').style.display = 'flex'; specNext(1, 1); };
  }

  window.addEventListener('load', () => {
    const _g = gEnd;
    gEnd = function (w) { const r = _g.apply(this, arguments); if (!S.shown) { S.shown = 1; try { render(!!w); } catch (e) { console.warn('fim', e); } } return r; };
    const _sg = startGame; startGame = function () { reset(); const r = _sg.apply(this, arguments); try { S.tot = Math.max(2, alive); setTimeout(() => { S.tot = Math.max(S.tot, alive); }, 400); } catch (e) { } return r; };
    try { const _f = fire; fire = function () { try { if (wp) S.shots++; } catch (e) { } return _f.apply(this, arguments); }; } catch (e) { }
    try { const _h = hitFx; hitFx = function (x, y, z, dm, head) { S.hits++; if (head) S.hs++; return _h.apply(this, arguments); }; } catch (e) { }
    // "Resumo" no modo espectador volta para esta tela
    try { $('spo').onclick = () => { spec = null; $('spc').style.display = 'none'; $('eg').style.display = 'flex'; }; } catch (e) { }
  });
})();
