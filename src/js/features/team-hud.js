/* Deadzone · features/team-hud.js
 * EQUIPE durante a partida (como nos battle royales):
 *  - Lista da equipe no lado esquerdo, embaixo do minimapa: número, nome e barra de vida de cada um
 *    (você, parceiros reais e companheiros bots). Caído/morto fica cinza.
 *  - No avião: botão "Seguir <nome>" / "Não seguir". Seguindo, você pula junto quando o parceiro pular,
 *    cai do lado dele e abre o paraquedas junto.
 */
(function () {
  const st = document.createElement('style');
  st.textContent = `
#dzTeam{position:fixed;left:calc(env(safe-area-inset-left,0px) + 10px);top:calc(env(safe-area-inset-top,0px) + 128px);z-index:6;display:none;flex-direction:column;gap:3px;pointer-events:none;font-family:system-ui,sans-serif}
#dzTeam .m{display:flex;align-items:center;gap:6px;width:150px;padding:2px 8px 3px 3px;background:linear-gradient(90deg,rgba(0,0,0,.55),rgba(0,0,0,.15));border-radius:4px}
#dzTeam .n{width:18px;height:18px;flex:none;border-radius:3px;display:flex;align-items:center;justify-content:center;font:900 11px system-ui;color:#10161c}
#dzTeam .t{flex:1;min-width:0}
#dzTeam .t b{display:block;font:700 12px system-ui;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 2px #000}
#dzTeam .t i{display:block;height:4px;margin-top:2px;background:rgba(255,255,255,.18);border-radius:2px;overflow:hidden}
#dzTeam .t i u{display:block;height:100%;background:#f2f4f6;transition:width .25s}
#dzTeam .m.low .t i u{background:#ff5a4a}
#dzTeam .m.dead{opacity:.45}#dzTeam .m.dead .t b{text-decoration:line-through}
#dzFollow{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 18px);transform:translateX(-50%);z-index:8;display:none;gap:8px}
#dzFollow button{border:0;border-radius:6px;padding:10px 18px;font:800 14px system-ui;color:#10161c;background:linear-gradient(180deg,#f6cf6a,#e0a52c);box-shadow:0 2px 10px rgba(0,0,0,.4)}
#dzFollow button.off{background:rgba(20,26,32,.85);color:#fff;border:1px solid rgba(255,255,255,.3)}
body.dzTeamOn #bf2{top:calc(env(safe-area-inset-top,0px) + 236px)}`;
  document.head.appendChild(st);
  const box = document.createElement('div'); box.id = 'dzTeam'; document.body.appendChild(box);
  const fb = document.createElement('div'); fb.id = 'dzFollow'; fb.innerHTML = '<button id="dzFolB"></button>'; document.body.appendChild(fb);
  const COL = ['#f3c35a', '#5ac8ff', '#7be07b', '#ff8ad0'];

  let FOL = null, folOn = true, folKey = '';
  const allies = () => { const L = []; try { for (const id of (window.dzAllies || [])) { const e = CL[id]; if (e) L.push({ id, e, n: (window.dzAllyNames || {})[id] || nmId(id) || 'Parceiro' }); } } catch (e) { } return L; };
  const myName = () => { try { return localStorage.getItem('deadzone_player_name') || 'Você'; } catch (e) { return 'Você'; } };

  function list() {
    const L = [{ n: myName(), hp: Math.max(0, hp), dead: mode === 'dead' }];
    for (const a of allies()) L.push({ n: a.n, hp: a.e.hp == null ? 100 : Math.max(0, a.e.hp), dead: !!a.e.dead });
    try { for (const b of bots) if (b.team === 1 && b.isCompanion) L.push({ n: b.nm || 'Aliado', hp: Math.max(0, b.hp == null ? 100 : b.hp), dead: !!b.dead }); } catch (e) { }
    try { if (typeof CB !== 'undefined') for (const k in CB) { const e = CB[k]; if (e.ally) L.push({ n: e.nm || (typeof nmOf === 'function' ? nmOf(e) : 'Aliado'), hp: Math.max(0, e.hp == null ? 100 : e.hp), dead: !!e.dead }); } } catch (e) { }
    return L.slice(0, 4);
  }
  setInterval(() => {
    const inMatch = mode !== 'lobby' && typeof N !== 'undefined' && (N || bots.some(b => b.team === 1));
    const L = inMatch ? list() : [];
    box.style.display = L.length > 1 ? 'flex' : 'none'; document.body.classList.toggle('dzTeamOn', L.length > 1);
    if (L.length > 1) {
      const k = L.map(m => m.n + m.hp.toFixed(0) + m.dead).join('|');
      if (k !== box.dataset.k) { box.dataset.k = k; box.innerHTML = L.map((m, i) => '<div class="m' + (m.dead ? ' dead' : m.hp < 30 ? ' low' : '') + '"><span class="n" style="background:' + COL[i] + '">' + (i + 1) + '</span><span class="t"><b>' + String(m.n).replace(/</g, '') + '</b><i><u style="width:' + m.hp + '%"></u></i></span></div>').join(''); }
    }
    // botão seguir no avião
    const A = allies(), showF = mode === 'plane' && A.length > 0;
    fb.style.display = showF ? 'flex' : 'none';
    if (showF) { const key = folOn + A[0].n; if (key !== folKey) { folKey = key; const b = document.getElementById('dzFolB'); b.textContent = folOn ? '✔ Seguindo ' + A[0].n : 'Seguir ' + A[0].n; b.className = folOn ? '' : 'off'; } }
  }, 200);
  document.getElementById('dzFolB').addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); folOn = !folOn; folKey = ''; say(folOn ? 'Você vai pular junto com o parceiro' : 'Você vai pular sozinho', 2); });

  // seguir: no avião pula junto; no céu acompanha o parceiro (do lado dele) e abre o paraquedas junto
  let side = 0;
  setInterval(() => {
    if (!folOn) { FOL = null; return; }
    const A = allies().filter(a => !a.e.dead); if (!A.length) { FOL = null; return; }
    const a = A[0].e;
    if (mode === 'plane' && a.md && a.md !== 'p' && a.md !== 'g') { try { jumpOut(); FOL = a; side = (Math.random() < .5 ? -1 : 1) * 4; say('Pulando junto com ' + A[0].n, 2); } catch (e) { } }
    if ((mode === 'sky' || mode === 'chute') && FOL === a && a.md === 'c' && mode === 'sky') { try { openChute(); } catch (e) { } }
    if (FOL && (a.md === 'g' || mode === 'ground' || mode === 'dead')) FOL = null;
  }, 100);
  // nome do parceiro em cima da cabeça (etiqueta na tela que acompanha o personagem)
  const TG = {}, _v = new T.Vector3();
  function tags() {
    const A = mode !== 'lobby' ? allies() : [], seen = {};
    A.forEach((a, i) => {
      const e = a.e; seen[a.id] = 1; let d = TG[a.id];
      if (!d) { d = TG[a.id] = document.createElement('div'); d.style.cssText = 'position:fixed;left:0;top:0;z-index:5;pointer-events:none;transform:translate(-50%,-100%);font:800 12px system-ui;color:#fff;background:rgba(20,60,120,.7);border-bottom:2px solid #5ac8ff;padding:1px 7px;border-radius:3px;white-space:nowrap;text-shadow:0 1px 2px #000'; document.body.appendChild(d); }
      if (d.textContent !== a.n) d.textContent = a.n;
      let ok = e.g.visible && !e.dead; if (ok) { e.g.getWorldPosition(_v); _v.y += 2.3; const dist = _v.distanceTo(cam.position); _v.project(cam); ok = _v.z < 1 && Math.abs(_v.x) < 1.1 && Math.abs(_v.y) < 1.1; if (ok) { d.style.left = ((_v.x + 1) / 2 * innerWidth) + 'px'; d.style.top = ((1 - _v.y) / 2 * innerHeight) + 'px'; d.style.opacity = dist > 400 ? .6 : 1; } }
      d.style.display = ok ? 'block' : 'none';
    });
    for (const k in TG) if (!seen[k]) TG[k].style.display = 'none';
  }
  // ajuste suave da posição a cada quadro enquanto segue (o jogador ainda pode mexer, mas fica perto)
  const _lb = window.loopBody;
  if (typeof _lb === 'function') window.loopBody = function (t) {
    _lb(t);
    try { tags(); } catch (e) { }
    try {
      if (FOL && (mode === 'sky' || mode === 'chute') && FOL.py > 1) {
        const k = .06, tx = FOL.x + Math.cos(FOL.y || 0) * side, tz = FOL.z - Math.sin(FOL.y || 0) * side;
        P.x += (tx - P.x) * k; P.z += (tz - P.z) * k; P.y += (FOL.py + 1 - P.y) * .08;
      }
    } catch (e) { }
  };
})();
