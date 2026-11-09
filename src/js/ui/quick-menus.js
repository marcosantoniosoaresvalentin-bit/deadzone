/* Deadzone · ui/quick-menus.js
 * Menus rápidos no estilo dos battle royales, ao lado das armas:
 *  - CURA (à esquerda das armas): quadradinho com o item escolhido e a quantidade; tocar = usar.
 *    A setinha ▲ abre a lista vertical (bandagem, kit médico) para escolher e usar.
 *  - ARREMESSÁVEIS (à direita): granada, fumaça, gelo, faca no mesmo formato.
 * Ícones desenhados (sem emoji). Substitui os botões antigos de cura (canto esquerdo) e o menu antigo.
 */
(function () {
  const S = (b) => '<svg viewBox="0 0 32 32" aria-hidden="true">' + b + '</svg>';
  const ICO = {
    band: S('<rect x="4" y="10" width="15" height="13" rx="2.5" fill="#efe9dc"/><path d="M6 13h11M6 16.5h11M6 20h11" stroke="#cfc7b6" stroke-width="1"/><ellipse cx="20" cy="16.5" rx="4.5" ry="7" fill="#dcd4c2"/><ellipse cx="20" cy="16.5" rx="1.8" ry="3" fill="#8f877a"/><path d="M4 22.5c-1 1.5-.5 4 2 4h9" stroke="#efe9dc" stroke-width="2.4" fill="none" stroke-linecap="round"/>'),
    med: S('<rect x="3.5" y="9" width="25" height="17" rx="3" fill="#eef1f3"/><rect x="11.5" y="5" width="9" height="5" rx="1.6" fill="none" stroke="#eef1f3" stroke-width="2"/><rect x="3.5" y="22" width="25" height="4" rx="1.5" fill="#c7cdd2"/><path d="M16 11.5v10M11 16.5h10" stroke="#d93a2f" stroke-width="3.6" stroke-linecap="round"/>'),
    gren: S('<ellipse cx="15" cy="19" rx="8" ry="9" fill="#55663f"/><path d="M8 16h14M8 21h14M12 11v16M18 11v16" stroke="#3c4a2b" stroke-width="1.2"/><rect x="12" y="7" width="7" height="4" rx="1" fill="#9aa0a6"/><path d="M19 8l6 6" stroke="#c8ccd0" stroke-width="2.4" stroke-linecap="round"/><circle cx="11" cy="6.5" r="2.4" fill="none" stroke="#c8ccd0" stroke-width="1.4"/>'),
    smoke: S('<rect x="10" y="9" width="12" height="19" rx="2.5" fill="#a9b0b6"/><rect x="10" y="14" width="12" height="4" fill="#4b545c"/><rect x="12.5" y="5.5" width="7" height="4" rx="1" fill="#6c757d"/><path d="M22 8c3-3 6-1 5 2M23 4c2-2 5 0 4 2" stroke="#dfe3e6" stroke-width="1.6" fill="none" stroke-linecap="round"/>'),
    gel: S('<path d="M16 3l11 6.5v13L16 29 5 22.5v-13z" fill="#bfe6ff"/><path d="M16 3v26M5 9.5l22 13M27 9.5l-22 13" stroke="#7cc2ee" stroke-width="1.2"/>'),
    knife: S('<path d="M4 20L22 6c2-1 4 0 3 2L12 22z" fill="#d4d9de"/><path d="M12 22l-3 4-4-1 1-4z" fill="#2a2d31"/><path d="M8 19l5 4" stroke="#2a2d31" stroke-width="2"/>')
  };
  const NM = { band: 'Bandagem', med: 'Kit médico', gren: 'Granada', smoke: 'Fumaça', gel: 'Gelo', knife: 'Faca' };
  const st = document.createElement('style');
  st.textContent = `
#bag,#tw{display:none!important}
.dzQ{position:fixed;z-index:5;display:none;flex-direction:column-reverse;align-items:stretch;gap:4px;font-family:system-ui,sans-serif;touch-action:none;user-select:none;-webkit-user-select:none}
.dzQ .main{display:flex;align-items:center;height:46px;background:rgba(14,18,22,.62);border:1px solid rgba(255,255,255,.28);border-radius:6px;overflow:hidden}
.dzQ .use{display:flex;align-items:center;gap:3px;padding:0 6px 0 5px;height:100%}
.dzQ .use svg{width:30px;height:30px}
.dzQ .use b{font:800 12px system-ui;color:#fff;min-width:16px}
.dzQ .arr{height:100%;width:24px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;border-left:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06)}
.dzQ .lst{display:none;flex-direction:column;gap:3px;background:rgba(10,14,18,.82);border:1px solid rgba(255,255,255,.18);border-radius:6px;padding:4px}
.dzQ.open .lst{display:flex}
.dzQ .it{display:flex;align-items:center;gap:6px;padding:4px 8px 4px 4px;border-radius:4px;color:#fff;font:700 12px system-ui;white-space:nowrap;border:1px solid transparent}
.dzQ .it svg{width:28px;height:28px;flex:none}
.dzQ .it small{margin-left:auto;padding-left:8px;font:800 12px system-ui;color:#f3c35a}
.dzQ .it.on{border-color:#f3c35a;background:rgba(243,195,90,.16)}
.dzQ.sel .main{border-color:#f3c35a;box-shadow:0 0 8px rgba(243,195,90,.4)}
.dzQ.empty .use{opacity:.35}`;
  document.head.appendChild(st);

  function mk(id) { const d = document.createElement('div'); d.className = 'dzQ'; d.id = id; d.innerHTML = '<div class="main"><div class="use"></div><div class="arr">▲</div></div><div class="lst"></div>'; document.body.appendChild(d); return d; }
  const H = mk('dzHeal'), G = mk('dzThrow');
  let hSel = 'band', tSel = 'gren';
  const tap = (el, fn) => el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); fn(e); });

  // ---------- cura ----------
  const HK = ['band', 'med'];
  function healUse(k) { if (!(bag[k] > 0)) { say('Sem ' + NM[k].toLowerCase(), 1.2); return; } try { useItem(k); } catch (e) { } }
  tap(H.querySelector('.use'), () => { const k = bag[hSel] > 0 ? hSel : HK.find(q => bag[q] > 0); if (k) { hSel = k; healUse(k); } });
  tap(H.querySelector('.arr'), () => { H.classList.toggle('open'); G.classList.remove('open'); });
  tap(H.querySelector('.lst'), e => { const d = e.target.closest('[data-k]'); if (!d) return; hSel = d.dataset.k; H.classList.remove('open'); healUse(hSel); });

  // ---------- arremessáveis ----------
  const TK = ['gren', 'smoke', 'gel', 'knife'];
  function tSelect(k) {
    if (mode !== 'ground' || !(bag[k] > 0)) return;
    try { if (THR === k) { THR = null; TS = 0; } else { THR = k; TS = k === 'knife' ? 0 : k; cur = -1; rlOn = 0; rl = 0; ads = 0; GA = null; } drawSlots(); } catch (e) { }
    if (THR) say(NM[k] + ' na mão · segure ATIRAR, arraste para ajustar a distância e solte para jogar', 2.5);
  }
  tap(G.querySelector('.use'), () => { const k = bag[tSel] > 0 ? tSel : TK.find(q => bag[q] > 0); if (k) { tSel = k; tSelect(k); } });
  tap(G.querySelector('.arr'), () => { G.classList.toggle('open'); H.classList.remove('open'); });
  tap(G.querySelector('.lst'), e => { const d = e.target.closest('[data-k]'); if (!d) return; tSel = d.dataset.k; G.classList.remove('open'); try { if (THR === tSel) { THR = null; TS = 0; } } catch (_) { } tSelect(tSel); });

  let key = '';
  setInterval(() => {
    const on = mode === 'ground' && !document.body.classList.contains('spec') && !document.body.classList.contains('dzinv');
    H.style.display = G.style.display = on ? 'flex' : 'none'; if (!on) { H.classList.remove('open'); G.classList.remove('open'); return; }
    const r = document.getElementById('sl').getBoundingClientRect();
    if (r.width) { H.style.right = (innerWidth - r.left + 8) + 'px'; H.style.left = 'auto'; G.style.left = (r.right + 8) + 'px'; H.style.bottom = G.style.bottom = (innerHeight - r.bottom) + 'px'; }
    if (!(bag[hSel] > 0)) hSel = HK.find(q => bag[q] > 0) || hSel;
    if (!(bag[tSel] > 0)) tSel = TK.find(q => bag[q] > 0) || tSel;
    let thr = null; try { thr = THR; } catch (e) { }
    const k = HK.map(q => bag[q] | 0).join() + '|' + TK.map(q => bag[q] | 0).join() + hSel + tSel + thr + (cast ? cast.k : '');
    if (k === key) return; key = k;
    const hn = bag[hSel] | 0; H.querySelector('.use').innerHTML = ICO[hSel] + '<b>' + hn + '</b>'; H.classList.toggle('empty', !HK.some(q => bag[q] > 0)); H.classList.toggle('sel', !!cast);
    H.querySelector('.lst').innerHTML = HK.filter(q => bag[q] > 0).map(q => '<div class="it' + (q === hSel ? ' on' : '') + '" data-k="' + q + '">' + ICO[q] + NM[q] + '<small>' + bag[q] + '</small></div>').join('') || '<div class="it">Nenhum item de cura</div>';
    const tn = bag[tSel] | 0; G.querySelector('.use').innerHTML = ICO[tSel] + '<b>' + tn + '</b>'; G.classList.toggle('empty', !TK.some(q => bag[q] > 0)); G.classList.toggle('sel', !!thr);
    G.querySelector('.lst').innerHTML = TK.filter(q => bag[q] > 0).map(q => '<div class="it' + (q === thr ? ' on' : '') + '" data-k="' + q + '">' + ICO[q] + NM[q] + '<small>' + bag[q] + '</small></div>').join('') || '<div class="it">Nenhum item</div>';
  }, 150);
  window.DZQICO = ICO;
})();
