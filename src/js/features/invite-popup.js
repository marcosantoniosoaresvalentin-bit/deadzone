/* Deadzone · features/invite-popup.js
 * - dzToast(msg): aviso bonito do jogo (no lugar das caixas "A página em ... diz:" do navegador).
 * - dzInvPop(n): quando chega convite de equipe ou pedido de amizade, aparece um cartão na tela
 *   (estilo battle royale) com ACEITAR e RECUSAR. Continua também na cartinha de notificações.
 */
(function () {
  const st = document.createElement('style');
  st.textContent = `
#dzToast{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 18px);transform:translate(-50%,-140%);z-index:2147483600;max-width:86vw;padding:10px 18px;border-radius:6px;background:linear-gradient(180deg,rgba(22,30,38,.96),rgba(12,16,20,.96));border:1px solid rgba(243,195,90,.55);color:#fff;font:700 14px system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.5);transition:transform .25s;pointer-events:none;text-align:center}
#dzToast.on{transform:translate(-50%,0)}
#dzInvPop{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 70px);transform:translate(-50%,-30px);opacity:0;z-index:2147483500;width:min(420px,90vw);display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:8px;background:linear-gradient(135deg,rgba(18,26,34,.97),rgba(30,40,50,.97));border:1px solid rgba(243,195,90,.6);box-shadow:0 10px 30px rgba(0,0,0,.6);color:#fff;font-family:system-ui,sans-serif;transition:transform .25s,opacity .25s;pointer-events:none}
#dzInvPop.on{transform:translate(-50%,0);opacity:1;pointer-events:auto}
#dzInvPop .av{width:46px;height:46px;flex:none;border-radius:50%;background:radial-gradient(circle at 50% 35%,#5ac8ff,#1d4e7a);display:flex;align-items:center;justify-content:center;font:900 20px system-ui;color:#fff;border:2px solid rgba(255,255,255,.6)}
#dzInvPop .tx{flex:1;min-width:0}#dzInvPop .tx small{display:block;font:800 10px system-ui;letter-spacing:1.5px;color:#f3c35a;text-transform:uppercase}
#dzInvPop .tx b{display:block;font:800 16px system-ui;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#dzInvPop .tx span{display:block;font:600 12px system-ui;color:#b9c4cf}
#dzInvPop .ipb{display:flex;flex-direction:column;gap:6px}
#dzInvPop button{border:0;border-radius:4px;padding:8px 14px;font:800 12px system-ui;min-width:86px}
#dzInvPop button.ok{background:linear-gradient(180deg,#f6cf6a,#e0a52c);color:#1b1404}#dzInvPop button.no{background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.3)}
#dzInvPop i{position:absolute;left:0;bottom:0;height:3px;background:#f3c35a;border-radius:0 0 0 8px;transition:width linear}`;
  document.head.appendChild(st);
  let tEl = null, tT = 0;
  window.dzToast = function (msg) {
    if (!tEl) { tEl = document.createElement('div'); tEl.id = 'dzToast'; document.body.appendChild(tEl); }
    tEl.textContent = String(msg || ''); tEl.classList.add('on'); clearTimeout(tT); tT = setTimeout(() => tEl.classList.remove('on'), 2600);
  };
  // o jogo não usa mais a caixa do navegador
  window.alert = m => window.dzToast(m);

  let pop = null, pT = 0, curN = null;
  window.dzInvPop = function (n) {
    if (!n || n.state !== 'pending') return;
    if (!pop) {
      pop = document.createElement('div'); pop.id = 'dzInvPop'; document.body.appendChild(pop);
      pop.addEventListener('pointerdown', e => { const b = e.target.closest('button'); if (!b || !curN) return; e.preventDefault(); e.stopPropagation();
        try { if (b.classList.contains('ok')) window.dzInv.acceptN(curN.nid); else window.dzInv.rejectN(curN.nid); } catch (_) { } hide(); });
    }
    curN = n; const team = n.type === 'team', nm = String(n.name || 'Jogador').replace(/[<>&]/g, '');
    pop.innerHTML = '<div class="av">' + nm.charAt(0).toUpperCase() + '</div><div class="tx"><small>' + (team ? 'Convite de equipe' : 'Pedido de amizade') + '</small><b>' + nm + '</b><span>' + (team ? 'convidou você para jogar na equipe' : 'quer adicionar você como amigo') + '</span></div><div class="ipb"><button class="ok">Aceitar</button><button class="no">Recusar</button></div><i style="width:100%"></i>';
    pop.classList.add('on'); try { if (typeof sfx === 'function') sfx(1200, .25, .15, 0); } catch (_) { }
    const bar = pop.querySelector('i'); requestAnimationFrame(() => { bar.style.transitionDuration = '15s'; bar.style.width = '0%'; });
    clearTimeout(pT); pT = setTimeout(hide, 15000);
  };
  function hide() { if (pop) pop.classList.remove('on'); curN = null; }
})();
