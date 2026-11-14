/* Deadzone · ui/hud-bs.js
 * TELA DO JOGO no estilo da foto de referência:
 *  - Canto de cima à ESQUERDA: moedas e abates (no avião também os jogadores vivos).
 *  - Canto de cima à DIREITA: minimapa quadrado; à esquerda dele, coluna com configurações,
 *    microfone, som e mensagens rápidas; embaixo, o botão de marcar local.
 *  - "Nos arredores": itens do chão com foto realista e o nome embaixo; mostra 2 por vez e rola
 *    para baixo. O botão de abrir/fechar fica no lugar do X. Item pego some na hora (lista e chão).
 *    Sem espaço na mochila para uma granada: aparece "Troca rápida" com os seus itens e o botão
 *    "Substituir" (escolha qual deixar no chão).
 *  - Embaixo: quadradinhos iguais (cura · armas · arremessáveis) só com ícones, sem nomes;
 *    barra do colete (em cima) e da vida (embaixo).
 */
(function () {
  const $$ = id => document.getElementById(id);
  const css = document.createElement('style');
  css.textContent = `
html body #dzAK,html body #lp,html body #lpd,html body #wpt,html body #hpb,html body #dzArm,html body #dzQcB{display:none!important}
/* ---- canto de cima à esquerda ---- */
#dzTL{position:fixed;left:calc(env(safe-area-inset-left,0px) + 10px);top:calc(env(safe-area-inset-top,0px) + 8px);z-index:5;display:none;align-items:stretch;height:24px;pointer-events:none;
 background:linear-gradient(180deg,rgba(40,44,48,.72),rgba(28,31,35,.62));border:1px solid rgba(255,255,255,.12);border-radius:2px;font:800 14px Bahnschrift,"Roboto Condensed",system-ui,sans-serif;color:#fff}
#dzTL span{display:flex;align-items:center;gap:5px;padding:0 9px;border-left:1px solid rgba(255,255,255,.14)}#dzTL span:first-child{border-left:0}
#dzTL svg{width:13px;height:13px}#dzTL .mo{color:#ffc933}
html body #dzTeam{top:calc(env(safe-area-inset-top,0px) + 40px)!important}
/* ---- minimapa à direita ---- */
html body #mm{left:auto!important;right:calc(env(safe-area-inset-right,0px) + 10px)!important;top:calc(env(safe-area-inset-top,0px) + 8px)!important;width:104px!important;height:104px!important;border-radius:3px!important;border:1px solid rgba(255,255,255,.55)!important}
#dzMC{position:fixed;right:calc(env(safe-area-inset-right,0px) + 120px);top:calc(env(safe-area-inset-top,0px) + 8px);z-index:6;display:none;flex-direction:column;gap:6px}
#dzMC div{width:28px;height:22px;display:flex;align-items:center;justify-content:center;touch-action:none;user-select:none;-webkit-user-select:none}
#dzMC svg{width:20px;height:20px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.8))}
html body #dzPgB{left:auto!important;right:calc(env(safe-area-inset-right,0px) + 118px)!important;top:calc(env(safe-area-inset-top,0px) + 120px)!important;width:34px!important;height:34px!important;border-width:1.5px!important}
html body #dzPgB svg{width:17px;height:17px}
html body #dzQcM{left:auto!important;right:calc(env(safe-area-inset-right,0px) + 154px)!important;top:calc(env(safe-area-inset-top,0px) + 8px)!important}
html body #mkd{left:auto!important;right:calc(env(safe-area-inset-right,0px) + 12px)!important;top:calc(env(safe-area-inset-top,0px) + 116px)!important}
html body #bi{left:calc(env(safe-area-inset-left,0px) + 10px);top:auto;bottom:calc(env(safe-area-inset-bottom,0px) + 10px);width:46px;height:46px}
/* ---- nos arredores ---- */
#dzNA{position:fixed;right:calc(env(safe-area-inset-right,0px) + 160px);top:calc(env(safe-area-inset-top,0px) + 38px);z-index:6;display:none;align-items:flex-start;gap:6px;font-family:Bahnschrift,"Roboto Condensed",system-ui,sans-serif;color:#fff;user-select:none;-webkit-user-select:none}
#dzNA .pn{width:150px}
#dzNA .hd{display:flex;align-items:center;justify-content:space-between;height:24px;margin-bottom:3px}
#dzNA .hd b{font:700 13px Bahnschrift,"Roboto Condensed",system-ui,sans-serif;text-shadow:0 1px 2px #000;letter-spacing:.3px}
#dzNA .tg{width:24px;height:24px;display:flex;align-items:center;justify-content:center;background:rgba(20,24,28,.6);border:1px solid rgba(255,255,255,.35);touch-action:none}
#dzNA .tg svg{width:13px;height:13px}
#dzNA .ls{display:flex;flex-direction:column;gap:3px;max-height:107px;overflow-y:auto;touch-action:pan-y;scrollbar-width:none;overscroll-behavior:contain}#dzNA .ls::-webkit-scrollbar{display:none}
#dzNA .it{position:relative;flex:none;height:52px;background:linear-gradient(180deg,rgba(70,74,78,.82),rgba(44,47,51,.86));border:1px solid rgba(255,255,255,.1);display:flex;flex-direction:column;overflow:hidden}
#dzNA .it .im{flex:1;display:flex;align-items:center;justify-content:center;min-height:0}
#dzNA .it .im img{max-width:92%;max-height:100%;object-fit:contain;transform:scale(1.55);filter:drop-shadow(0 2px 3px rgba(0,0,0,.6))}
#dzNA .it .nm{height:16px;line-height:16px;padding:0 6px;font:600 11px Bahnschrift,"Roboto Condensed",system-ui,sans-serif;background:rgba(0,0,0,.42);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#dzNA .it .q{position:absolute;left:5px;top:3px;font:800 11px system-ui;color:#fff;text-shadow:0 1px 2px #000}
#dzNA .it .st{position:absolute;left:4px;top:4px;display:flex;gap:2px}#dzNA .it .st i{width:5px;height:5px;background:#fff;transform:rotate(45deg)}
#dzNA .it.r1{border-left:3px solid #9aa0a6}#dzNA .it.r2{border-left:3px solid #4caf50}#dzNA .it.r3{border-left:3px solid #3d8bfd}#dzNA .it.r4{border-left:3px solid #a259ff}#dzNA .it.r5{border-left:3px solid #ffb300}
#dzNA .it .sw{position:absolute;inset:0;display:none;align-items:center;background:rgba(10,12,14,.55)}
#dzNA .it.swp{border-color:#ffc933}#dzNA .it.swp .sw{display:flex}
#dzNA .it .sw b{flex:1;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,rgba(120,98,20,.95),rgba(80,64,10,.95));border:2px solid #ffc933;color:#ffd84a;font:800 15px system-ui;letter-spacing:.5px}
#dzNA .it .sw u{width:26px;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(30,32,36,.95);text-decoration:none}#dzNA .it .sw u svg{width:12px;height:12px}
#dzNA .tr{display:none;flex-direction:column;align-items:center;width:58px}
#dzNA.swap .tr{display:flex}
#dzNA .tr .hd{width:100%;justify-content:center}#dzNA .tr .hd b{font-size:11px;white-space:nowrap}
#dzNA .tr .c{display:flex;flex-direction:column;gap:3px;max-height:115px;overflow-y:auto;scrollbar-width:none}#dzNA .tr .c::-webkit-scrollbar{display:none}
#dzNA .tr .o{position:relative;width:54px;height:54px;flex:none;background:linear-gradient(180deg,rgba(70,74,78,.82),rgba(44,47,51,.86));border:1px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center}
#dzNA .tr .o.on{border:2px solid #ffc933}
#dzNA .tr .o svg,#dzNA .tr .o img{width:36px;height:36px;object-fit:contain}
#dzNA .tr .o small{position:absolute;right:3px;bottom:1px;font:800 11px system-ui;color:#fff;text-shadow:0 1px 2px #000}
#dzNAt{position:fixed;right:calc(env(safe-area-inset-right,0px) + 160px);top:calc(env(safe-area-inset-top,0px) + 38px);z-index:6;display:none;align-items:center;gap:6px;padding:3px 4px 3px 8px;background:rgba(20,24,28,.6);border:1px solid rgba(255,255,255,.25);color:#fff;font:700 12px system-ui;touch-action:none}
#dzNAt svg{width:12px;height:12px}
/* ---- embaixo: quadradinhos iguais ---- */
html body #sl{gap:4px!important;bottom:calc(env(safe-area-inset-bottom,0px) + 16px)!important}
html body #sl div{position:relative;width:112px!important;min-width:112px!important;height:52px!important;padding:0!important;border:1px solid rgba(255,255,255,.22)!important;border-radius:2px!important;background:linear-gradient(180deg,rgba(60,64,68,.62),rgba(30,33,36,.62))!important;overflow:hidden;display:block!important}
html body #sl div.on{border:1.5px solid #c58cff!important;background:linear-gradient(180deg,rgba(120,80,170,.42),rgba(50,36,70,.5))!important}
html body #sl div .mg{position:absolute;left:5px;top:3px;font:800 17px/1.05 Bahnschrift,"Roboto Condensed",system-ui;color:#fff;text-shadow:0 1px 2px #000;z-index:1}
html body #sl div .rs{position:absolute;left:5px;top:24px;font:700 12px/1 Bahnschrift,"Roboto Condensed",system-ui;color:#c9ced4;text-shadow:0 1px 2px #000;z-index:1}
html body #sl div img{position:absolute;right:0;bottom:0;width:86px;height:50px;object-fit:contain;transform:scale(1.25);transform-origin:70% 60%;filter:drop-shadow(0 1px 2px rgba(0,0,0,.8))}
html body #sl div .em{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:.3}html body #sl div .em svg{width:56px;height:21px;fill:#fff}
html body #sl div[data-i="2"]{position:absolute!important;right:0;top:-31px;width:56px!important;min-width:56px!important;height:27px!important}
html body #sl div[data-i="2"] .mg{font-size:11px;left:3px;top:2px}html body #sl div[data-i="2"] .rs{display:none}
html body #sl div[data-i="2"] img{width:40px;height:25px;right:1px;bottom:1px}html body #sl div[data-i="2"] .em svg{width:26px;height:11px}
html body .dzQ .main{position:relative;flex-direction:column-reverse;width:46px;height:52px!important;border-radius:2px!important;border:1px solid rgba(255,255,255,.22)!important;background:linear-gradient(180deg,rgba(60,64,68,.62),rgba(30,33,36,.62))!important;overflow:visible!important}
html body .dzQ .use{width:100%;height:100%;padding:0!important;justify-content:center;position:relative}
html body .dzQ .use svg{width:32px!important;height:32px!important}
html body .dzQ .use b{position:absolute;right:3px;bottom:1px;min-width:0!important;font:800 11px system-ui!important;text-shadow:0 1px 2px #000}
html body .dzQ .arr{position:absolute;left:0;right:0;top:-17px;height:16px!important;width:auto!important;border:1px solid rgba(255,255,255,.22)!important;border-bottom:0!important;background:rgba(30,33,36,.7)!important;font-size:10px!important}
html body .dzQ.open .arr{background:rgba(255,201,51,.3)!important}
html body .dzQ{gap:20px!important}
html body .dzQ .lst{padding:0!important;gap:3px!important;background:transparent!important;border:0!important}
html body .dzQ .it{position:relative;width:46px;height:46px;padding:0!important;justify-content:center;font-size:0!important;background:linear-gradient(180deg,rgba(60,64,68,.75),rgba(30,33,36,.75));border:1px solid rgba(255,255,255,.2)!important;border-radius:2px!important}
html body .dzQ .it.on{border-color:#ffc933!important}
html body .dzQ .it svg{width:32px!important;height:32px!important}
html body .dzQ .it small{position:absolute;right:3px;bottom:1px;padding:0!important;margin:0!important;font:800 11px system-ui!important;color:#fff!important;text-shadow:0 1px 2px #000}
#dzHB{position:fixed;bottom:calc(env(safe-area-inset-bottom,0px) + 4px);z-index:4;display:none;flex-direction:column;gap:2px;pointer-events:none}
#dzHB .ar{display:flex;gap:2px;height:4px}#dzHB .ar i{flex:1;background:rgba(255,255,255,.14)}#dzHB .ar i u{display:block;height:100%;background:#3d8bfd}
#dzHB .hp{height:6px;background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.18)}#dzHB .hp u{display:block;height:100%;background:#f2f4f5;transition:width .15s}#dzHB .hp.lo u{background:#ff4a3a}`;
  document.head.appendChild(css);

  const div = (id, h) => { const d = document.createElement('div'); d.id = id; if (h) d.innerHTML = h; document.body.appendChild(d); return d; };
  const tap = (el, f) => el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); f(e); });
  const SV = b => '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + b + '</svg>';
  const X_ = SV('<path d="M5 5l14 14M19 5L5 19"/>'), DN = SV('<path d="M6 9l6 6 6-6"/>');

  // ---------- canto de cima à esquerda ----------
  const TL = div('dzTL');
  const ICP = '<svg viewBox="0 0 16 16" fill="#fff"><circle cx="8" cy="5" r="3"/><path d="M2 15c0-3.5 2.7-6 6-6s6 2.5 6 6z"/></svg>';
  const ICK_ = '<svg viewBox="0 0 16 16" fill="none" stroke="#fff" stroke-width="1.6"><circle cx="8" cy="8" r="5.5"/><path d="M8 1v4M8 11v4M1 8h4M11 8h4"/></svg>';
  const ICM = '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="#e0a52c"/><circle cx="8" cy="8" r="5" fill="none" stroke="#7a4f10" stroke-width="1.2"/><text x="8" y="11" text-anchor="middle" font-size="7.5" font-weight="900" fill="#6a4410" font-family="system-ui">$</text></svg>';

  // ---------- coluna do minimapa ----------
  const MC = div('dzMC');
  const GEAR = SV('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>');
  const MIC = on => SV('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>' + (on ? '' : '<path d="M4 4l16 16" stroke="#ff5a4a"/>'));
  const SND = on => SV('<path d="M4 9h4l5-4v14l-5-4H4z"/>' + (on ? '<path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/>' : '<path d="M16 9l5 6M21 9l-5 6" stroke="#ff5a4a"/>'));
  const CHAT = SV('<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>');
  let micOn = false, sndOn = true; try { sndOn = localStorage.getItem('dzMute') !== '1'; micOn = localStorage.getItem('dzMic') === '1'; } catch (e) { }
  MC.innerHTML = '<div id="dzMg">' + GEAR + '</div><div id="dzMm"></div><div id="dzMs"></div><div id="dzMq">' + CHAT + '</div>';
  const drawMC = () => { $$('dzMm').innerHTML = MIC(micOn); $$('dzMs').innerHTML = SND(sndOn); }; drawMC();
  // som: silencia tudo (o jogo usa um único AudioContext)
  function applySnd() {
    try { if (typeof AC === 'undefined' || !AC) return; if (!AC.__dzm) { AC.__dzm = 1; const r = AC.resume.bind(AC); AC.resume = function () { return sndOn ? r() : Promise.resolve(); }; } if (sndOn) AC.resume(); else AC.suspend(); } catch (e) { }
  }
  addEventListener('pointerdown', () => setTimeout(applySnd, 0), true);
  tap($$('dzMg'), () => { try { $$('cfgb').onclick(); $$('cfg').style.zIndex = 80; } catch (e) { } });
  tap($$('dzMm'), () => { micOn = !micOn; try { localStorage.setItem('dzMic', micOn ? '1' : '0'); } catch (e) { } drawMC(); });
  tap($$('dzMs'), () => { sndOn = !sndOn; try { localStorage.setItem('dzMute', sndOn ? '0' : '1'); } catch (e) { } drawMC(); applySnd(); });
  tap($$('dzMq'), () => { const q = $$('dzQcB'); if (q) q.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true })); });

  // ---------- nos arredores ----------
  const NA = div('dzNA', '<div class="tr"><div class="hd"><b>Troca rápida</b></div><div class="c"></div></div><div class="pn"><div class="hd"><b>Nos arredores</b><div class="tg">' + X_ + '</div></div><div class="ls"></div></div>');
  const NAt = div('dzNAt', 'Nos arredores' + DN);
  const LS = NA.querySelector('.ls'), TRc = NA.querySelector('.tr .c');
  let naHide = false, naKey = '', SW = null;
  tap(NA.querySelector('.pn .tg'), () => { naHide = true; SW = null; naKey = ''; });
  tap(NAt, () => { naHide = false; naKey = ''; });
  const TH = ['gren', 'smoke', 'gel', 'knife'];
  const nearL = () => (mode === 'ground' && !MP) ? loot.filter(o => Math.hypot(o.x - P.x, o.z - P.z) < 2.4 && Math.abs((o.y || 0) - P.y) < 3) : [];
  const nmOf = o => { try { if (WS[o.t] && window.wNm) return wNm(o); } catch (e) { } return (typeof LN !== 'undefined' && LN[o.t]) || o.t; };
  const picOf = o => { try { return window.DZPIC ? DZPIC(o.t, WS[o.t] ? o.v : (o.t === 'ammo' ? o.cal : undefined)) || '' : ''; } catch (e) { return ''; } };
  const rar = o => { const v = String(o.v || ''); if (o.t === 'bp3' || o.t === 'scope8' || /gold|leg/.test(v)) return 5; if (o.t === 'sniper' || o.t === 'bp2' || o.t === 'scope2') return 4; if (WS[o.t] || o.t === 'vest' || o.t === 'helm') return 3; if (o.t === 'med' || o.t === 'gren') return 2; return 1; };
  const bagKey = o => (typeof TK !== 'undefined' && TK[o.t]) ? TK[o.t] : null;
  const fits = o => { const k = bagKey(o); if (!k) return true; const w = (typeof W !== 'undefined' && W[k[0]]) || 0; if (!w) return true; try { if (ATT.includes(k[0])) return true; } catch (e) { } return bagUsed() + w * (k[2] || 1) <= CAPS[bagLv]; };
  const icoK = k => { try { if (window.DZQICO && DZQICO[k]) return DZQICO[k]; const s = DZPIC(ICK[k]); return s ? '<img src="' + s + '">' : ''; } catch (e) { return ''; } };
  function swapList() { // itens da mochila que podem ficar no chão: arremessáveis primeiro
    const ks = Object.keys(W).filter(k => (bag[k] | 0) > 0 && W[k] > 0);
    return ks.sort((a, b) => (TH.includes(a) ? 0 : 1) - (TH.includes(b) ? 0 : 1));
  }
  function render(force) {
    const near = naHide ? [] : nearL(); const any = nearL().length > 0;
    const on = any && mode === 'ground' && !document.body.classList.contains('dzinv') && !document.body.classList.contains('dzspec');
    if (SW && near.indexOf(SW.o) < 0) SW = null;
    const key = (on ? 1 : 0) + (naHide ? 'h' : '') + near.map(o => o.id).join(',') + '|' + (SW ? SW.o.id + ':' + SW.sel + ':' + swapList().map(k => k + bag[k]).join() : '');
    if (!force && key === naKey) return; naKey = key;
    NA.style.display = on && !naHide ? 'flex' : 'none'; NAt.style.display = on && naHide ? 'flex' : 'none';
    NA.classList.toggle('swap', !!SW); if (!on || naHide) return;
    const st = LS.scrollTop;
    LS.innerHTML = near.map(o => { const q = (o.am && o.am.n) || (o.t === 'ammo' ? '' : ''), r = rar(o), sw = SW && SW.o === o;
      return '<div class="it r' + r + (sw ? ' swp' : '') + '" data-id="' + o.id + '"><div class="im">' + (picOf(o) ? '<img src="' + picOf(o) + '">' : '') + '</div><div class="nm">' + nmOf(o) + '</div>' + (q ? '<span class="q">' + q + '</span>' : '')
        + '<div class="sw"><b data-s="1">Substituir</b><u data-c="1">' + X_ + '</u></div></div>'; }).join('');
    LS.scrollTop = st;
    if (SW) { const L = swapList(); if (!SW.sel || !L.includes(SW.sel)) SW.sel = L[0]; TRc.innerHTML = L.map(k => '<div class="o' + (k === SW.sel ? ' on' : '') + '" data-k="' + k + '">' + icoK(k) + '<small>' + bag[k] + '</small></div>').join(''); }
  }
  // tocar = pegar; arrastar = rolar a lista (não pega sem querer)
  let dn = null;
  LS.addEventListener('pointerdown', e => { dn = { y: e.clientY, t: performance.now() }; e.stopPropagation(); });
  LS.addEventListener('pointerup', e => {
    e.stopPropagation(); if (!dn || Math.abs(e.clientY - dn.y) > 8) { dn = null; return; } dn = null;
    const it = e.target.closest('.it'); if (!it) return; const o = loot.find(q => String(q.id) === it.dataset.id); if (!o) return;
    if (e.target.closest('[data-c]')) { SW = null; render(true); return; }
    if (e.target.closest('[data-s]') && SW && SW.o === o) { doSwap(); return; }
    if (!fits(o)) { const L = swapList(); if (L.length) { SW = { o, sel: L[0] }; render(true); } return; }
    SW = null; try { take(o); } catch (er) { } render(true);
  });
  TRc.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); const d = e.target.closest('[data-k]'); if (!d || !SW) return; SW.sel = d.dataset.k; render(true); });
  function doSwap() {
    const o = SW.o, k = SW.sel; let n = 0;
    try { while (!fits(o) && (bag[k] | 0) > 0 && n < 60) { dropItem(k); n++; } } catch (e) { }
    SW = null; if (fits(o)) { try { take(o); } catch (e) { } } try { drawBag(); } catch (e) { } render(true);
  }
  // substitui a lista antiga
  window.refreshLoot = function () { render(false); };
  try { refreshLoot = window.refreshLoot; } catch (e) { }

  // ---------- armas: quadradinhos só com ícone e munição ----------
  function slotsHTML() {
    let h = ''; for (let i = 0; i < 3; i++) { const s = slots[i];
      if (!s) { h += '<div data-i="' + i + '"><span class="em">' + (typeof IC !== 'undefined' ? IC[i === 2 ? 'pistol' : 'rifle'] : '') + '</span></div>'; continue; }
      let src = ''; try { src = window.DZPIC ? DZPIC(s.t, s.v) : ''; } catch (e) { }
      h += '<div data-i="' + i + '" class="' + (i === cur ? 'on' : '') + '"><span class="mg">' + s.mag + '</span><span class="rs">' + s.res + '</span>' + (src ? '<img src="' + src + '">' : (IC[s.t] || '')) + '</div>'; }
    return h;
  }
  function installSlots() { drawSlots = function () { const h = slotsHTML(); if (h !== sltxt) { sltxt = h; sl.innerHTML = h; } }; try { sltxt = ''; drawSlots(); } catch (e) { } }

  // ---------- barras de colete e vida ----------
  const HB = div('dzHB', '<div class="ar"><i><u></u></i><i><u></u></i><i><u></u></i></div><div class="hp"><u></u></div>');
  let hk = '';
  setInterval(() => {
    const inM = typeof mode !== 'undefined' && mode !== 'lobby' && mode !== 'dead';
    const tm_ = (typeof MP !== 'undefined' && MP) || (typeof SQ !== 'undefined' && SQ);
    // topo esquerdo
    TL.style.display = inM && !document.body.classList.contains('dzinv') ? 'flex' : 'none';
    if (inM) { let h = ''; if (mode === 'plane') h += '<span>' + ICP + (typeof alive !== 'undefined' ? alive : '') + '</span>';
      h += '<span>' + ICK_ + (typeof kills !== 'undefined' ? kills : 0) + '</span>'; if (!tm_ && window.DZCOINS) h += '<span class="mo">' + ICM + DZCOINS() + '</span>';
      if (h !== TL._h) { TL._h = h; TL.innerHTML = h; } }
    MC.style.display = inM && !document.body.classList.contains('dzinv') ? 'flex' : 'none';
    // barras
    const r = sl.getBoundingClientRect(), hon = inM && (mode === 'ground' || mode === 'drive') && r.width > 0 && getComputedStyle(sl).display !== 'none';
    HB.style.display = hon ? 'flex' : 'none';
    if (hon) { HB.style.left = r.left + 'px'; HB.style.width = r.width + 'px';
      const v = typeof ARM !== 'undefined' ? Math.max(0, Math.min(100, ARM.vest || 0)) : 0, H_ = typeof hp !== 'undefined' ? Math.max(0, Math.min(100, hp)) : 100, k = Math.round(v) + '|' + Math.round(H_);
      if (k !== hk) { hk = k; HB.querySelectorAll('.ar u').forEach((u, i) => { u.style.width = Math.max(0, Math.min(1, (v - i * 33.34) / 33.33)) * 100 + '%'; }); HB.querySelector('.hp u').style.width = H_ + '%'; HB.querySelector('.hp').classList.toggle('lo', H_ < 30); } }
  }, 100);
  window.addEventListener('load', () => setTimeout(installSlots, 50));
})();
