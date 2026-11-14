/* Deadzone · features/updater.js
 * ATUALIZAÇÃO DENTRO DO JOGO (só no app Android): no lobby o jogo confere se há versão nova.
 * Se houver, aparece a janela "Atualização disponível" -> Atualizar (baixa com barra de progresso)
 * -> Reiniciar (abre o jogo já atualizado). Não precisa instalar outro APK.
 */
(function () {
  if (!window.DZApp) return;
  const css = document.createElement('style'); css.textContent = `
#dzUp{position:fixed;inset:0;z-index:200;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.6);font-family:Bahnschrift,"Roboto Condensed",system-ui,sans-serif;color:#fff}
#dzUp .bx{width:min(420px,86vw);background:linear-gradient(180deg,#1d2329,#12161a);border:1px solid rgba(255,255,255,.14);border-radius:8px;padding:18px 20px;box-shadow:0 10px 40px rgba(0,0,0,.6)}
#dzUp h3{margin:0 0 6px;font:italic 900 22px/1.1 Impact,Haettenschweiler,"Arial Black",sans-serif;letter-spacing:.5px}#dzUp h3 span{color:#ffc933}
#dzUp p{margin:0 0 14px;color:#c9cfd6;font-size:14px;line-height:1.35}
#dzUp .ubr{height:10px;border-radius:5px;background:rgba(255,255,255,.12);overflow:hidden;margin:4px 0 6px;display:none}#dzUp .ubr u{display:block;height:100%;width:0;background:linear-gradient(90deg,#f0a830,#ffd65c);transition:width .2s}
#dzUp .upc{font:800 13px system-ui;color:#ffd65c;display:none}
#dzUp .ac{display:flex;gap:10px;justify-content:flex-end;margin-top:12px}
#dzUp button{border:0;border-radius:5px;padding:10px 18px;font:800 14px system-ui}
#dzUp .go{background:linear-gradient(180deg,#ffd65c,#f0a91c);color:#2a1a00}#dzUp .no{background:rgba(255,255,255,.1);color:#fff}`;
  document.head.appendChild(css);
  const W = document.createElement('div'); W.id = 'dzUp';
  W.innerHTML = '<div class="bx"><h3></h3><p></p><div class="ubr"><u></u></div><div class="upc"></div><div class="ac"></div></div>';
  document.body.appendChild(W);
  const q = s => W.querySelector(s);
  let info = {}; try { info = JSON.parse(DZApp.info()); } catch (e) { }
  let later = false, shown = false;
  function show(title, text, btns, prog) {
    q('h3').innerHTML = title; q('p').textContent = text;
    q('.ubr').style.display = q('.upc').style.display = prog ? 'block' : 'none';
    const B = q('.ac'); B.innerHTML = '';
    for (const [t, cls, fn] of btns) { const b = document.createElement('button'); b.className = cls; b.textContent = t; b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); fn(); }); B.appendChild(b); }
    W.style.display = 'flex'; shown = true;
  }
  const hide = () => { W.style.display = 'none'; shown = false; };
  const mb = n => n > 0 ? ' (' + (n / 1048576).toFixed(1).replace('.', ',') + ' MB)' : '';
  let av = null;
  window.dzUpd = function (m) {
    if (!m) return;
    if (m.st === 'avail') { av = m; if (later || shown) return; if (typeof mode !== 'undefined' && mode !== 'lobby') return;
      show('ATUALIZAÇÃO <span>DISPONÍVEL</span>', 'Versão ' + m.v + mb(m.size) + '. Baixe agora e reinicie para jogar a versão nova.', [['Depois', 'no', () => { later = true; hide(); }], ['Atualizar', 'go', start]]); }
    else if (m.st === 'prog') { q('.ubr u').style.width = m.p + '%'; q('.upc').textContent = 'Baixando... ' + m.p + '%'; }
    else if (m.st === 'unzip') { q('.ubr u').style.width = '100%'; q('.upc').textContent = 'Instalando...'; }
    else if (m.st === 'ready') show('ATUALIZAÇÃO <span>PRONTA</span>', 'A versão ' + (av ? av.v : 'nova') + ' foi instalada. Reinicie para abrir o jogo atualizado.', [['Reiniciar', 'go', () => { hide(); DZApp.restart(); }]]);
    else if (m.st === 'err') show('ERRO NA <span>ATUALIZAÇÃO</span>', 'Não foi possível atualizar (' + (m.m || 'sem conexão') + '). Verifique a internet e tente de novo.', [['Fechar', 'no', hide], ['Tentar de novo', 'go', start]]);
  };
  function start() { show('ATUALIZANDO', 'Não feche o jogo enquanto baixa.', [], true); q('.ubr u').style.width = '0%'; q('.upc').textContent = 'Baixando... 0%'; DZApp.download(); }
  // confere ao abrir e depois a cada 20 minutos (só no lobby)
  const check = () => { try { if (typeof mode === 'undefined' || mode === 'lobby') DZApp.check(); } catch (e) { } };
  setTimeout(check, 4000); setInterval(check, 20 * 60 * 1000);
  // versão atual no canto das configurações
  window.DZVER = info;
})();
