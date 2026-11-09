/* Deadzone · ui/menu-art.js
 * Menu de mapa e modo com IMAGENS do próprio jogo (como nos battle royales): cada modo e cada mapa
 * mostra uma foto; o cartão do mapa no lobby também. Tira os emojis dos títulos.
 */
(function () {
  const st = document.createElement('style');
  st.textContent = `
html body #mpn #mpm button[data-m]{position:relative;overflow:hidden;background:#0d1620 center/cover no-repeat!important;min-height:64px;text-shadow:0 1px 4px #000;font-weight:900!important;letter-spacing:.5px}
html body #mpn #mpm button[data-m]:before{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.7));z-index:0}
html body #mpn #mpm button[data-m] span{position:relative;z-index:1}
html body #mpn #mpm button[data-m].sel,html body #mpn #mpc button[data-map].sel{outline:3px solid #f3c35a;outline-offset:-3px;box-shadow:0 0 14px rgba(243,195,90,.6)!important}
html body #mpn #mpm button[data-m="classic"]{background-image:url(assets/images/load2.jpg)!important}
html body #mpn #mpm button[data-m="pvp"]{background-image:url(assets/images/load1.jpg)!important}
html body #mpn #mpm button[data-m="squad"]{background-image:url(assets/images/load3.jpg)!important}
html body #mpn #mpc button[data-map]{background:#0d1620 center/cover no-repeat!important;text-shadow:0 2px 5px #000}
html body #mpn #mpc button[data-map="Zona Morta"]{background-image:linear-gradient(180deg,rgba(0,0,0,0) 40%,rgba(0,0,0,.65)),url(assets/images/load2.jpg)!important}
html body #mpn #mpc button[data-map="Aleatório"]{background-image:linear-gradient(180deg,rgba(0,0,0,0) 40%,rgba(0,0,0,.65)),url(assets/images/load3.jpg)!important}
#dz43 .mode .im{background:center/cover no-repeat url(assets/images/load2.jpg)!important}`;
  document.head.appendChild(st);
  const EMO = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu;
  function clean() {
    document.querySelectorAll('html body #mpn #mpm button[data-m], html body #mpn #mpc button[data-map], #dz31-team-row button, .dz31-roomtypes button').forEach(b => { if (b.dataset.cl) return; const t = b.textContent.replace(EMO, '').trim(); b.dataset.cl = 1; b.innerHTML = '<span>' + t + '</span>'; });
    const s = document.getElementById('d43ms'); if (s) { const t = s.textContent.replace(EMO, '').trim(); if (t !== s.textContent) s.textContent = t; }
  }
  clean(); setInterval(clean, 800);
})();
