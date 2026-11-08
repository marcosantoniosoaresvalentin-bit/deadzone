/* Deadzone · ui/settings-style.js
 * Tela de CONFIGURAÇÕES no estilo dos battle royales: abas do lado (Básico · Gráficos · Controles)
 * e opções em botões lado a lado (a escolhida fica acesa). Os botões antigos continuam existindo
 * escondidos: cada escolha só "aperta" o botão antigo até chegar no valor, então nada muda na lógica.
 */
(function () {
  const C = document.getElementById('cfg'); if (!C || C.dataset.dz2) return; C.dataset.dz2 = 1;
  const st = document.createElement('style');
  st.textContent = `
#cfg.dz2{padding:0;gap:0;background:linear-gradient(135deg,#0b0f14,#141b22);flex-direction:column}
#cfg.dz2 .dzTop{display:flex;align-items:center;justify-content:space-between;padding:10px 18px;border-bottom:1px solid rgba(255,255,255,.08);background:rgba(0,0,0,.25)}
#cfg.dz2 .dzTop b{font:900 18px system-ui;letter-spacing:2px;text-transform:uppercase;color:#f3c35a}
#cfg.dz2 .dzTop button{background:transparent;border:1px solid rgba(255,255,255,.35);color:#fff;border-radius:6px;padding:6px 16px;font-weight:700}
#cfg.dz2 .dzBody{flex:1;display:flex;min-height:0}
#cfg.dz2 .dzTabs{width:150px;flex:none;display:flex;flex-direction:column;gap:4px;padding:12px 0;background:rgba(0,0,0,.28);border-right:1px solid rgba(255,255,255,.06)}
#cfg.dz2 .dzTabs button{background:transparent;color:#b9c2cc;border:0;border-left:3px solid transparent;border-radius:0;text-align:left;padding:12px 16px;font:800 14px system-ui;letter-spacing:.5px}
#cfg.dz2 .dzTabs button.on{color:#fff;border-left-color:#f3c35a;background:linear-gradient(90deg,rgba(243,195,90,.18),transparent)}
#cfg.dz2 .dzPane{flex:1;overflow:auto;padding:14px 18px;display:none;flex-direction:column;gap:8px}
#cfg.dz2 .dzPane.on{display:flex}
#cfg.dz2 .dzPane h4{margin:6px 0 2px;font:800 12px system-ui;color:#f3c35a;letter-spacing:1.5px;text-transform:uppercase}
#cfg.dz2 .row{background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:10px 14px;min-height:44px}
#cfg.dz2 .row>span{font:600 14px system-ui;color:#e8edf2}
#cfg.dz2 .row>button.dzHid{display:none}
#cfg.dz2 .seg{display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end}
#cfg.dz2 .seg button{background:rgba(255,255,255,.07);color:#cfd6dd;border:1px solid rgba(255,255,255,.12);border-radius:5px;padding:7px 12px;font:700 13px system-ui;min-width:64px}
#cfg.dz2 .seg button.on{background:linear-gradient(180deg,#f6cf6a,#e0a52c);color:#1b1404;border-color:#f6cf6a;box-shadow:0 0 10px rgba(243,195,90,.35)}
#cfg.dz2 .row>button:not(.dzHid){background:linear-gradient(180deg,#f6cf6a,#e0a52c);color:#1b1404;border:0;border-radius:5px;padding:8px 18px;font-weight:800}
#cfg.dz2 input[type=range]{accent-color:#f3c35a;width:44%}
#cfg.dz2 p.sm{color:#8f9aa5;font-size:12px;margin:4px 2px}
#cfg.dz2 #cGfxH{display:none}
@media (max-width:640px){#cfg.dz2 .dzTabs{width:96px}#cfg.dz2 .dzTabs button{padding:10px 10px;font-size:12px}}
`;
  document.head.appendChild(st);

  // opções de cada botão antigo (texto que ele mostra)
  const OPT = {
    cQ: ['Baixa', 'Média', 'Alta', 'Ultra'], cSh: ['Desligadas', 'Ligadas'], cFps: ['30 FPS', '60 FPS'], cFpsS: ['Desligado', 'Ligado'],
    cAuto: ['Desligado', 'Ligado'], cDoor: ['Desligado', 'Ligado']
  };
  const LBL = { 'Ligadas': 'Ligadas', 'Desligadas': 'Desligadas', 'Ligado': 'Ligado', 'Desligado': 'Desligado' };
  const TABS = [['Básico', ['cAuto', 'cDoor']], ['Gráficos', ['cQ', 'cSh', 'cFps', 'cFpsS']], ['Controles', ['cSens', 'cEdit']]];

  const x = C.querySelector('#cfgx'), tips = [...C.querySelectorAll('p.sm')];
  const rows = {}; C.querySelectorAll('.row').forEach(r => { const e = r.querySelector('button,input'); if (e) rows[e.id] = r; });
  C.innerHTML = ''; C.classList.add('dz2');
  const top = document.createElement('div'); top.className = 'dzTop'; top.innerHTML = '<b>Configurações</b>'; if (x) { x.textContent = 'Voltar'; top.appendChild(x); }
  const body = document.createElement('div'); body.className = 'dzBody';
  const tabs = document.createElement('div'); tabs.className = 'dzTabs'; body.appendChild(tabs);
  C.appendChild(top); C.appendChild(body);
  const panes = [];
  TABS.forEach(([nm, ids], i) => {
    const b = document.createElement('button'); b.textContent = nm; tabs.appendChild(b);
    const p = document.createElement('div'); p.className = 'dzPane'; body.appendChild(p); panes.push([b, p]);
    for (const id of ids) if (rows[id]) p.appendChild(rows[id]);
    b.onclick = () => { panes.forEach(([bb, pp]) => { bb.classList.toggle('on', bb === b); pp.classList.toggle('on', pp === p); }); try { localStorage.setItem('dzCfgTab', i); } catch (e) { } };
  });
  // dicas: a de mira no Básico, a de desempenho nos Gráficos
  for (const t of tips) { (/trav|FPS|qualidade/i.test(t.textContent) ? panes[1][1] : /botão|mira/i.test(t.textContent) ? panes[0][1] : panes[2][1]).appendChild(t); }
  // sobra (linhas novas que outros scripts criarem) vai para Básico
  for (const id in rows) if (!rows[id].parentNode || rows[id].parentNode === null) panes[0][1].appendChild(rows[id]);
  let t0 = 0; try { t0 = +localStorage.getItem('dzCfgTab') || 0; } catch (e) { }
  (panes[t0] || panes[0])[0].click();

  // botões lado a lado
  const segs = [];
  for (const id in OPT) {
    const old = document.getElementById(id); if (!old) continue; const r = old.closest('.row'); if (!r) continue;
    old.classList.add('dzHid');
    const sg = document.createElement('div'); sg.className = 'seg'; r.appendChild(sg);
    for (const o of OPT[id]) {
      const b = document.createElement('button'); b.textContent = LBL[o] || o.replace(' FPS', ''); if (/FPS/.test(o)) b.textContent = o;
      b.onclick = () => { for (let k = 0; k < 6 && old.textContent.trim() !== o; k++) old.click(); setTimeout(paintAll, 0); };
      sg.appendChild(b);
    }
    segs.push([old, sg]);
  }
  function paintAll() { for (const [old, sg] of segs) { const v = old.textContent.trim(); for (const b of sg.children) b.classList.toggle('on', OPT[old.id][[...sg.children].indexOf(b)] === v); } }
  const cb = document.getElementById('cfgb'); if (cb) cb.addEventListener('click', () => setTimeout(paintAll, 30));
  setTimeout(paintAll, 50);
})();
