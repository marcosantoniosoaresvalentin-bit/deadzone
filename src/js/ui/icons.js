/* Deadzone · ui/icons.js
 * BOTÕES SÓ COM ÍCONE (sem texto): cada botão mostra um desenho em linha branca, sem cor.
 * O resto do jogo continua trocando o "texto" dos botões (Pular/Saltar/Abrir, Entrar/Sair...);
 * aqui esse texto é interceptado e vira o ícone certo. O nome fica só como descrição
 * acessível (aria-label), não aparece na tela.
 */
(function () {
  const S = (d, extra) => '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"' + (extra || '') + '>' + d + '</svg>';
  const I = window.DZICON = {
    // combate
    shoot: S('<circle cx="12" cy="12" r="7"/><path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/>'),
    punch: S('<path d="M7.5 11V7.8a1.6 1.6 0 0 1 3.2 0V10M10.7 9.6V6.9a1.6 1.6 0 0 1 3.2 0V10M13.9 9.8V7.6a1.6 1.6 0 0 1 3.2 0v4.6c0 4-2.4 6.8-6 6.8H10c-2.6 0-4.5-2-4.5-4.6v-1.9A1.9 1.9 0 0 1 7.5 11h2.2a1.8 1.8 0 0 1 0 3.6H8.3"/>'),
    throwIt: S('<circle cx="7" cy="16.5" r="3"/><path d="M9.5 14c2.8-5.2 7-7.4 11-7.4"/><path d="M17.5 4.6l3 2-2.2 2.9"/>'),
    aim: S('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.2"/><path d="M12 1.8v5M12 17.2v5M1.8 12h5M17.2 12h5"/>'),
    reload: S('<path d="M19.5 9.5A8 8 0 0 0 5 7.2"/><path d="M4.6 3.4v4h4"/><path d="M4.5 14.5A8 8 0 0 0 19 16.8"/><path d="M19.4 20.6v-4h-4"/><rect x="10.2" y="8.4" width="3.6" height="7.2" rx="1"/>'),
    grenade: S('<path d="M12 7.5a6 6 0 1 1-.01 0z"/><path d="M10 7.8V5.5h4v2.3M14 5.5l3.2-1.6M9.5 12.5h5M9.5 15.5h5"/>'),
    gel: S('<path d="M12 2.5v19M3.8 7.2l16.4 9.6M3.8 16.8l16.4-9.6"/><path d="M9.6 3.8 12 6.2l2.4-2.4M9.6 20.2 12 17.8l2.4 2.4"/>'),
    smoke: S('<path d="M6.5 17.5a3.5 3.5 0 0 1 .4-7 5 5 0 0 1 9.6-1.2 3.6 3.6 0 0 1 .6 7.1"/><path d="M8 20.5h8M10 14h5"/>'),
    // movimento
    jump: S('<path d="M6 12.5 12 6.5l6 6"/><path d="M6 18.5l6-6 6 6"/>'),
    crouch: S('<circle cx="12.5" cy="4.6" r="2"/><path d="M12 7.6 9.5 12.4l4.2 1.2 1.1 5.6M9.5 12.4l-1.2 6.2M12.2 8.8l3.4 2.6"/><path d="M5 21h14"/>'),
    prone: S('<circle cx="4.6" cy="12.2" r="1.9"/><path d="M7 13.6h7.2l3.4 2.2 3.4.2M10.5 13.6l1.6-2.6 3.2-.4"/><path d="M2.5 18h19"/>'),
    // avião / paraquedas
    leap: S('<path d="M3 6.5h12.5l3.8 3H3z"/><path d="M12 12.5v8M8.8 17.4 12 20.6l3.2-3.2"/>'),
    chute: S('<path d="M3 10.5C3 6 7 3 12 3s9 3 9 7.5c-1.5-1.2-3-1.2-4.5 0-1.5-1.2-3-1.2-4.5 0-1.5-1.2-3-1.2-4.5 0-1.5-1.2-3-1.2-4.5 0z"/><path d="M3.5 10.6 11 18.5M20.5 10.6 13 18.5M12 10.6v7.9"/><circle cx="12" cy="20" r="1.5"/>'),
    // veículos
    wheel: S('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.2"/><path d="M3.8 10.4c2.6-.9 5.4-1 8.2-1s5.6.1 8.2 1M10.3 13.8 6.6 19.4M13.7 13.8l3.7 5.6"/>'),
    exit: S('<path d="M13.5 3.5H6.2A1.7 1.7 0 0 0 4.5 5.2v13.6a1.7 1.7 0 0 0 1.7 1.7h7.3"/><path d="M10.5 12h10M17 8.5l3.5 3.5-3.5 3.5"/>'),
    fuel: S('<path d="M5 20.5V5a1.5 1.5 0 0 1 1.5-1.5h6A1.5 1.5 0 0 1 14 5v15.5M3.5 20.5h12M7 7.5h5"/><path d="M14 9.5h1.6a1.4 1.4 0 0 1 1.4 1.4v5.4a1.3 1.3 0 0 0 2.6 0V8.6L17 6"/>'),
    gas: S('<rect x="7" y="3" width="10" height="17" rx="3"/><path d="M10 7.5h4M10 10.5h4M10 13.5h4"/><path d="M12 22v-2"/>'),
    brake: S('<rect x="3.5" y="7" width="17" height="10" rx="3"/><path d="M7.5 10v4M10.5 10v4M13.5 10v4M16.5 10v4"/>'),
    reverse: S('<path d="M18.5 7.5H9a5 5 0 0 0 0 10h7.5"/><path d="M12 3.5 8 7.5l4 4" transform="translate(-1.5 0)"/>'),
    up: S('<path d="M5 15.5 12 8.5l7 7"/>'),
    down: S('<path d="M5 8.5l7 7 7-7"/>'),
    // portas, mochila, itens
    doorOpen: S('<path d="M4 21h16M6 21V3.5h9.5V21"/><path d="M6 3.5 13 6v15"/><circle cx="11" cy="13" r=".9" fill="currentColor"/>'),
    doorClose: S('<path d="M4 21h16M6 21V3.5h12V21"/><circle cx="15" cy="12.5" r=".9" fill="currentColor"/>'),
    bag: S('<path d="M7 7.5V6a5 5 0 0 1 10 0v1.5"/><rect x="4.5" y="7.5" width="15" height="13" rx="3"/><path d="M8.5 13h7v3.5h-7zM9.5 7.5v2M14.5 7.5v2"/>'),
    items: S('<rect x="4" y="4" width="6.5" height="6.5" rx="1.4"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.4"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.4"/><path d="M16.75 14v5.5M14 16.75h5.5"/>'),
    rifle: S('<path d="M2 11h12.5l1.5-1.5h4.5v2.5h1.5v1.5h-6l-2 1.2-.5 3.3h-2.6l.4-3.5H7.5l-2 2.5H3.5l1-2.5H2z"/>', ' stroke-width="1.5"'),
    pistol: S('<path d="M4 7.5h15v3.5H11l-1 1.2.4 4.8H6.8l.6-5.6L4 11z"/><path d="M11 11v1.8h2.4"/>', ' stroke-width="1.5"')
  };
  // texto que o jogo escreve -> ícone, por botão
  const MAP = {
    bj: { Pular: 'jump', Saltar: 'leap', Abrir: 'chute' },
    bv: { Entrar: 'wheel', Sair: 'exit' },
    bf: { Atirar: 'shoot', Atacar: 'punch', 'Lançar': 'throwIt' },
    bo: { Abrir: 'doorOpen', Fechar: 'doorClose' }
  };
  const FIX = { bf2: 'shoot', bm: 'aim', br: 'reload', bc: 'crouch', bp: 'prone', bi: 'bag', bu: 'fuel', bg: 'grenade', bgl: 'gel', bgs: 'smoke', bhu: 'up', bhd: 'down', bga: 'gas', bbk: 'brake', brv: 'reverse' };
  function iconFor(id, txt) {
    const t = String(txt || '').trim(), m = MAP[id];
    let k = m && m[t] || FIX[id] || 'shoot';
    const cnt = (t.match(/x\s*(\d+)/) || [])[1];
    return I[k] + (cnt ? '<b class="ico-n">' + cnt + '</b>' : '');
  }
  function hook(el) {
    if (!el || el._dzIcon) return; el._dzIcon = 1; el.classList.add('ibt');
    let cur = el.textContent;
    const paint = v => { el.innerHTML = iconFor(el.id, v); el.setAttribute('aria-label', String(v || '').replace(/[^\wÀ-ú ]/g, '').trim() || el.id); };
    Object.defineProperty(el, 'textContent', { configurable: true, get() { return cur; }, set(v) { v = String(v); if (v === cur && el.firstElementChild) return; cur = v; paint(v); } });
    paint(cur);
  }
  function all() { for (const id of Object.keys(MAP).concat(Object.keys(FIX))) hook(document.getElementById(id)); }
  // botões dos carros: acelerar, frear e ré (seguram enquanto o dedo está em cima)
  window.DZPED = { g: 0, b: 0, r: 0 };
  function carButtons() {
    if (document.getElementById('bga')) return;
    for (const [id, k] of [['bga', 'g'], ['bbk', 'b'], ['brv', 'r']]) {
      const d = document.createElement('div'); d.className = 'bt'; d.id = id; d.textContent = id; document.body.appendChild(d);
      const on = e => { e.preventDefault(); DZPED[k] = 1; d.classList.add('on'); }, off = e => { e && e.preventDefault(); DZPED[k] = 0; d.classList.remove('on'); };
      d.addEventListener('pointerdown', on); d.addEventListener('pointerup', off); d.addEventListener('pointercancel', off); d.addEventListener('pointerleave', off);
    }
    addEventListener('blur', () => { DZPED.g = DZPED.b = DZPED.r = 0; });
    // teclado no PC: W/S continuam no analógico; espaço = freio
    addEventListener('keydown', e => { if (e.code === 'Space' && typeof mode !== 'undefined' && mode === 'drive') DZPED.b = 1; });
    addEventListener('keyup', e => { if (e.code === 'Space') DZPED.b = 0; });
  }
  // armas vazias na barra: silhueta da arma em vez de "Arma 1 / Arma 2 / Pistola"
  function slotsIcons() {
    try {
      const _d = drawSlots;
      drawSlots = function () { _d(); try { const els = sl.querySelectorAll('div > small[style]'); els.forEach((s, i) => { const d = s.parentNode, idx = +d.dataset.i; s.outerHTML = '<span class="slot-empty">' + (idx < 2 ? I.rifle : I.pistol) + '</span>'; }); sltxt = sl.innerHTML; } catch (e) { } };
      sltxt = ''; drawSlots();
    } catch (e) { }
    // "Itens" (arremessáveis) sem texto
    try { const tw = document.getElementById('twi'); if (tw) new MutationObserver(() => { const sm = tw.querySelector('small'); if (sm && sm.textContent.trim() === 'Itens') sm.outerHTML = '<span class="slot-empty">' + I.items + '</span>'; }).observe(tw, { childList: true, subtree: true }); } catch (e) { }
  }
  function start() { carButtons(); all(); slotsIcons(); document.body.classList.add('dzicons'); }
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', start); else start();
  // a cada quadro: mostra os botões do carro só dirigindo carro (não helicóptero)
  (function tick() {
    requestAnimationFrame(tick);
    try {
      const car = typeof mode !== 'undefined' && mode === 'drive' && typeof drv !== 'undefined' && drv && !drv.heli;
      for (const id of ['bga', 'bbk', 'brv']) { const e = document.getElementById(id); if (e) e.style.display = car ? 'flex' : 'none'; }
      if (!car) DZPED.g = DZPED.b = DZPED.r = 0;
    } catch (e) { }
  })();
})();
