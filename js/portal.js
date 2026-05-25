/* ============================================
   QUEPAR 2026 — Portal JS Logic
   ============================================ */

'use strict';

/* ── Fake data generators ── */
const MUNICIPIS = ['Sueca','Cullera','Alzira','Algemesí','Sollana','Almussafes','Benifaió','Polinyà de Xúquer','Riola','Fortaleny','Llaurí','Corbera'];
const PARCELES = () => `${Math.floor(Math.random()*500+1)}-${Math.floor(Math.random()*20+1)}`;

function fakeUsers(n = 40) {
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    dni: `${String(Math.floor(Math.random()*90000000+10000000))}${String.fromCharCode(65+Math.floor(Math.random()*26))}`,
    tel: `6${String(Math.floor(Math.random()*90000000+10000000))}`,
    municipi: MUNICIPIS[Math.floor(Math.random()*MUNICIPIS.length)],
    registrat: new Date(2026, 9, 1 + Math.floor(Math.random()*60)),
    quemes: Math.floor(Math.random()*5)
  }));
}

function fakeQuemes(n = 60) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(2026, 9, 1 + Math.floor(Math.random()*60));
    d.setHours(Math.floor(Math.random()*10+7), Math.floor(Math.random()*60));
    return {
      id: 1000 + i,
      usuari: `${String(Math.floor(Math.random()*90000000+10000000))}A`,
      municipi: MUNICIPIS[Math.floor(Math.random()*MUNICIPIS.length)],
      poligon: Math.floor(Math.random()*20+1),
      parcela: Math.floor(Math.random()*500+1),
      recinte: Math.floor(Math.random()*10+1),
      superficie: (Math.random()*5+0.2).toFixed(2),
      data: d,
      risc: Math.floor(Math.random()*5+1),
      lat: (39.3 + Math.random()*0.3).toFixed(5),
      lon: (-0.3 + Math.random()*0.2).toFixed(5)
    };
  });
}

const USERS = fakeUsers();
const QUEMES = fakeQuemes();

/* ── Navigation ── */
function switchPage(id) {
  document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const page = document.getElementById(`page-${id}`);
  if (page) {
    page.classList.add('active');
    // Re-trigger reveal animations
    page.querySelectorAll('.reveal').forEach(el => {
      el.classList.remove('revealed');
      setTimeout(() => el.classList.add('revealed'), 50);
    });
  }
  const navItem = document.querySelector(`.nav-item[data-page="${id}"]`);
  if (navItem) navItem.classList.add('active');
  const titles = { dashboard: 'Dashboard', quemes: 'Registre Quemes', usuaris: 'Usuaris', pronostic: 'Pronòstic Risc', exports: 'Exportar Dades' };
  document.getElementById('page-title').textContent = titles[id] || id;
  if (id === 'quemes') renderQuemesTable();
  if (id === 'usuaris') renderUsuarisTable();
  if (id === 'pronostic') renderForecastFull();
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => { e.preventDefault(); switchPage(item.dataset.page); });
});
document.getElementById('menu-toggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('collapsed');
});

/* ── Init dashboard ── */
function initDashboard() {
  // Last update
  document.getElementById('last-update').textContent = formatDate(new Date());
  document.getElementById('forecast-date').textContent = formatDate(new Date());

  // Stats with animated counters
  const stats = [
    { id: 'stat-users', val: USERS.length, delta: '+3 avui', cls: 'up' },
    { id: 'stat-quemes-avui', val: QUEMES.filter(q => {
        const d = q.data; const now = new Date();
        return d.getDate()===now.getDate() && d.getMonth()===now.getMonth();
      }).length, delta: 'des de les 00:00', cls: '' },
    { id: 'stat-quemes-total', val: QUEMES.length, delta: 'campanya 2026', cls: 'up' }
  ];
  stats.forEach(s => {
    const el = document.getElementById(s.id);
    if (el) animateCounter(el, s.val);
    const delta = document.getElementById(`${s.id}-delta`);
    if (delta) { delta.textContent = s.delta; delta.className = `stat-delta ${s.cls}`; }
  });

  // Current risk
  const forecast = generateForecast();
  const currentRisk = forecast[0].level;
  const riscEl = document.getElementById('stat-risc-actual');
  if (riscEl) {
    riscEl.innerHTML = `<span class="risk-badge r${currentRisk}" style="font-size:.85rem;padding:6px 14px;">${riskLabel(currentRisk)}</span>`;
  }

  // Forecast bars (8 slots)
  const fcastEl = document.getElementById('forecast-bars');
  if (fcastEl) {
    fcastEl.innerHTML = forecast.slice(0,8).map(f => `
      <div class="forecast-cell">
        <div class="forecast-cell-time">${f.hour}</div>
        <div class="forecast-cell-block r${f.level}" style="background:${riskColor(f.level)}" title="${riskLabel(f.level)}">${f.level}</div>
      </div>
    `).join('');
  }

  // Simple bar chart (canvas-less, CSS bars)
  renderSimpleChart();

  // Recent table
  renderRecentTable();

  // Trigger reveals
  setTimeout(() => {
    document.querySelectorAll('#page-dashboard .reveal').forEach(el => el.classList.add('revealed'));
  }, 100);
}

/* ── Simple CSS chart (no library dependency) ── */
function renderSimpleChart() {
  const canvas = document.getElementById('chart-quemes');
  if (!canvas) return;
  // Replace canvas with CSS bars
  const parent = canvas.parentElement;
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const count = QUEMES.filter(q => {
      return q.data.getDate() === d.getDate() && q.data.getMonth() === d.getMonth();
    }).length + Math.floor(Math.random()*4);
    days.push({ label: `${d.getDate()}/${d.getMonth()+1}`, count });
  }
  const max = Math.max(...days.map(d => d.count), 1);
  canvas.remove();
  const chartEl = document.createElement('div');
  chartEl.className = 'css-chart';
  chartEl.innerHTML = `
    <div class="css-chart-bars">
      ${days.map((d, i) => `
        <div class="css-bar-wrap" title="${d.label}: ${d.count} quemes">
          <div class="css-bar" style="height:${Math.max(4, (d.count/max)*100)}%;animation-delay:${i*20}ms"></div>
        </div>
      `).join('')}
    </div>
    <div class="css-chart-footer">
      <span>${days[0].label}</span>
      <span>Últims 30 dies</span>
      <span>${days[days.length-1].label}</span>
    </div>
  `;
  parent.appendChild(chartEl);

  // Inject chart CSS if not present
  if (!document.getElementById('chart-css')) {
    const style = document.createElement('style');
    style.id = 'chart-css';
    style.textContent = `
      .css-chart { height: 160px; display: flex; flex-direction: column; gap: 8px; }
      .css-chart-bars { display: flex; align-items: flex-end; gap: 2px; height: 130px; }
      .css-bar-wrap { flex: 1; height: 100%; display: flex; align-items: flex-end; }
      .css-bar { width: 100%; background: var(--c-accent); border-radius: 3px 3px 0 0; min-height: 4px;
        animation: growBar .5s ease both; transition: background .15s; }
      .css-bar:hover { background: var(--c-accent2); }
      @keyframes growBar { from { transform: scaleY(0); transform-origin: bottom; } to { transform: scaleY(1); } }
      .css-chart-footer { display: flex; justify-content: space-between; font-size: .7rem; color: var(--c-muted); font-family: var(--font-mono); }
    `;
    document.head.appendChild(style);
  }
}

/* ── Recent table ── */
function renderRecentTable() {
  const tbl = document.getElementById('table-recent');
  if (!tbl) return;
  const recent = [...QUEMES].sort((a,b) => b.data - a.data).slice(0,8);
  tbl.innerHTML = `
    <thead><tr>
      <th>#</th><th>Usuari (DNI)</th><th>Municipi</th><th>Polígon/Parcel·la</th><th>Data i hora</th><th>Risc</th>
    </tr></thead>
    <tbody>${recent.map(q => `
      <tr>
        <td class="text-mono" style="color:var(--c-muted)">${q.id}</td>
        <td class="text-mono">${q.usuari}</td>
        <td>${q.municipi}</td>
        <td class="text-mono">${q.poligon} / ${q.parcela}</td>
        <td class="text-mono" style="font-size:.8rem">${formatDate(q.data)}</td>
        <td><span class="risk-badge r${q.risc}">${riskLabel(q.risc)}</span></td>
      </tr>
    `).join('')}</tbody>
  `;
}

/* ── Full quemes table ── */
function renderQuemesTable() {
  const tbl = document.getElementById('table-quemes-full');
  if (!tbl) return;
  tbl.innerHTML = `
    <thead><tr>
      <th>#</th><th>DNI Usuari</th><th>Municipi</th><th>Polígon</th><th>Parcel·la</th><th>Recinte</th>
      <th>Sup. (ha)</th><th>Data</th><th>Risc</th><th>Coord.</th>
    </tr></thead>
    <tbody>${[...QUEMES].sort((a,b)=>b.data-a.data).map(q => `
      <tr>
        <td class="text-mono" style="color:var(--c-muted)">${q.id}</td>
        <td class="text-mono">${q.usuari}</td>
        <td>${q.municipi}</td>
        <td class="text-mono">${q.poligon}</td>
        <td class="text-mono">${q.parcela}</td>
        <td class="text-mono">${q.recinte}</td>
        <td class="text-mono">${q.superficie}</td>
        <td class="text-mono" style="font-size:.78rem;">${formatDate(q.data)}</td>
        <td><span class="risk-badge r${q.risc}">${riskLabel(q.risc)}</span></td>
        <td class="text-mono" style="font-size:.72rem;color:var(--c-muted)">${q.lat}, ${q.lon}</td>
      </tr>
    `).join('')}</tbody>
  `;
  setTimeout(() => {
    document.querySelectorAll('#page-quemes .reveal').forEach(el => el.classList.add('revealed'));
  }, 100);
}

/* ── Usuaris table ── */
function renderUsuarisTable() {
  const tbl = document.getElementById('table-usuaris');
  if (!tbl) return;
  tbl.innerHTML = `
    <thead><tr>
      <th>#</th><th>DNI/NIF</th><th>Telèfon</th><th>Municipi</th><th>Data Registre</th><th>Quemes</th>
    </tr></thead>
    <tbody>${USERS.map(u => `
      <tr>
        <td class="text-mono" style="color:var(--c-muted)">${u.id}</td>
        <td class="text-mono">${u.dni}</td>
        <td class="text-mono">${u.tel}</td>
        <td>${u.municipi}</td>
        <td class="text-mono" style="font-size:.8rem">${u.registrat.toLocaleDateString('ca-ES')}</td>
        <td><span style="font-weight:600;color:var(--c-accent)">${u.quemes}</span></td>
      </tr>
    `).join('')}</tbody>
  `;
  setTimeout(() => {
    document.querySelectorAll('#page-usuaris .reveal').forEach(el => el.classList.add('revealed'));
  }, 100);
}

/* ── Forecast full 36h ── */
function renderForecastFull() {
  const el = document.getElementById('forecast-full-grid');
  if (!el) return;
  const forecast = generateForecast();
  const f36 = [...forecast, ...generateForecast((17+24)%24).slice(0,12)];
  el.innerHTML = f36.slice(0,36).map(f => `
    <div class="forecast-cell">
      <div class="forecast-cell-time">${f.hour}</div>
      <div class="forecast-cell-block" style="background:${riskColor(f.level)};height:50px;" title="${riskLabel(f.level)}">${f.level}</div>
    </div>
  `).join('');
  setTimeout(() => {
    document.querySelectorAll('#page-pronostic .reveal').forEach(el => el.classList.add('revealed'));
  }, 100);
}

/* ── Export (fake) ── */
function exportExcel(type) {
  showToast(`Generant Excel de ${type === 'quemes' ? 'quemes' : 'usuaris'}…`, 'info');
  setTimeout(() => showToast('Fitxer descarregat correctament ✓', 'success'), 1400);
}

/* ── Boot ── */
document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
  // Start all reveals for initial page
  setTimeout(() => {
    document.querySelectorAll('#page-dashboard .reveal').forEach(el => el.classList.add('revealed'));
  }, 200);
});
