/* Deadzone · core/errors.js
 * Mostra erros na tela (discretamente) em vez de travar em silêncio.
 * Carregado antes de todos os outros arquivos do jogo.
 */
(function () {
  let box = null, last = '', n = 0;
  function show(msg) {
    try {
      if (msg === last && n > 3) return; if (msg === last) n++; else { last = msg; n = 0; }
      if (!box) {
        box = document.createElement('div');
        box.style.cssText = 'position:fixed;left:50%;bottom:6px;transform:translateX(-50%);max-width:92vw;z-index:9999;background:rgba(120,10,10,.85);color:#fff;font:600 11px system-ui,sans-serif;padding:5px 10px;border-radius:8px;pointer-events:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:none';
        (document.body || document.documentElement).appendChild(box);
      }
      box.textContent = '⚠ ' + msg; box.style.display = 'block';
      clearTimeout(show.t); show.t = setTimeout(() => { box.style.display = 'none'; }, 5000);
      try { localStorage.setItem('dzLastError', new Date().toISOString() + ' ' + msg); } catch (e) { }
    } catch (e) { }
  }
  window.dzErr = function (e) {
    const s = (e && (e.stack || e.message)) || String(e), line = (s.split('\n').find(l => /\.js/.test(l)) || '').trim().replace(/^at\s+/, '');
    console.error(e); show(((e && e.message) || String(e)) + (line ? ' · ' + line.split('/').slice(-2).join('/') : ''));
  };
  addEventListener('error', ev => { if (ev && ev.error) window.dzErr(ev.error); });
  addEventListener('unhandledrejection', ev => { const r = ev && ev.reason; if (r && !/fetch|network/i.test(String(r))) window.dzErr(r); });
})();
