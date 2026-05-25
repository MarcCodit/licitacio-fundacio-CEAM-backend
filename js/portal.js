/* ============================================
   QUEPAR 2026 — Lógica Portal Web Administración
   ============================================ */

/* ── Generador de previsiones de riesgo ── */
function generateForecast(hours = 36) {
  const now = new Date();
  const data = [];
  // Patrón de riesgo: mañana bajo, mediodía alto, tarde bajo
  const pattern = [5,5,5,5,4,4,3,2,1,2,3,4,4,5,5,5,4,3,2,1,1,2,3,4,5,5,5,4,4,3,2,1,1,2,3,4];
  for (let i = 0; i < hours; i++) {
    const h = new Date(now.getTime() + i * 3600000);
    const hour = h.getHours();
    const risk = pattern[i % pattern.length];
    data.push({
      datetime: h,
      hour: hour,
      label: `${String(hour).padStart(2,'0')}:00`,
      risk: risk,
      rain: (Math.random() * 5).toFixed(2),
      conf: (0.7 + Math.random() * 0.3).toFixed(1)
    });
  }
  return data;
}

/* ── Generador de datos de quemas ── */
function generateQuemas(n = 120) {
  const municipios = ['Sueca','Cullera','Sollana','Almussafes','Benifaió','Albal','Picassent','Silla','Massanassa','Catarroja'];
  const poligons   = ['04','05','08','12','15','17','22'];
  const riesgos    = [1,2,3,4,5];
  const items = [];
  const now = new Date(2026, 9, 6, 9, 41);
  for (let i = 0; i < n; i++) {
    const dt = new Date(now.getTime() - Math.random() * 7 * 86400000);
    const mun = municipios[Math.floor(Math.random() * municipios.length)];
    const pol = poligons[Math.floor(Math.random() * poligons.length)];
    const parc = String(Math.floor(Math.random() * 200) + 1).padStart(4,'0');
    const rec  = String(Math.floor(Math.random() * 3) + 1);
    const risk = riesgos[Math.floor(Math.random() * riesgos.length)];
    const sup  = (0.2 + Math.random() * 3).toFixed(2);
    const lat  = (39.15 + Math.random() * 0.25).toFixed(4);
    const lng  = (-0.22 - Math.random() * 0.18).toFixed(4);
    const dni  = `${Math.floor(Math.random()*90000000)+10000000}${String.fromCharCode(65+Math.floor(Math.random()*23))}`;
    items.push({
      id:  `#QPAR-2026-${String(1700+i).padStart(4,'0')}`,
      dni, municipio: mun, poligono: pol, parcela: parc, recinto: rec,
      superficie: sup, risk,
      datetime: dt,
      hora: `${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`,
      fecha: `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`,
      lat, lng
    });
  }
  return items.sort((a,b) => b.datetime - a.datetime);
}

/* ── Generador de usuarios ── */
function generateUsuarios(n = 312) {
  const nombres = ['Juan García','María López','Pedro Martínez','Ana Fernández','Carlos Sánchez','Isabel Romero','Francisco Torres','Lucía Jiménez','Antonio Moreno','Carmen Díaz','Manuel Ruiz','Elena Navarro'];
  const municipios = ['Sueca','Cullera','Sollana','Almussafes','Benifaió','Albal','Picassent','Silla'];
  const items = [];
  const base = new Date(2024, 8, 1);
  for (let i = 0; i < n; i++) {
    const nombre = nombres[i % nombres.length] + (i > nombres.length ? ` ${i}` : '');
    const mun = municipios[Math.floor(Math.random() * municipios.length)];
    const tel = `6${String(Math.floor(Math.random()*99999999)).padStart(8,'0')}`;
    const dni = `${Math.floor(Math.random()*90000000)+10000000}${String.fromCharCode(65+Math.floor(Math.random()*23))}`;
    const alta = new Date(base.getTime() + Math.random() * 400 * 86400000);
    const quemas = Math.floor(Math.random() * 8);
    items.push({ id: i+1, nombre, dni, telefono: tel, municipio: mun, quemas,
      fecha_alta: `${String(alta.getDate()).padStart(2,'0')}/${String(alta.getMonth()+1).padStart(2,'0')}/${alta.getFullYear()}`,
      activo: Math.random() > 0.12
    });
  }
  return items;
}

/* ── Render helpers ── */
const riskLabel = { 0:'Sin datos', 1:'Muy alto', 2:'Alto', 3:'Transitorio', 4:'Bajo', 5:'Muy bajo' };
function riskPill(r) {
  return `<span class="risk-pill r${r}">${riskLabel[r]||'—'}</span>`;
}
function riskBarColor(r) {
  const colors = { 0:'#b0acaa', 1:'#c0392b', 2:'#e74c3c', 3:'#e67e22', 4:'#27ae60', 5:'#2ecc71' };
  return colors[r] || '#b0acaa';
}

/* ── Navegación entre secciones ── */
function showPage(id) {
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const sec = document.getElementById('section-' + id);
  if (sec) sec.classList.add('active');
  document.querySelectorAll(`.nav-item[data-page="${id}"]`).forEach(n => n.classList.add('active'));
  const titles = {
    dashboard: 'Panel de control',
    quemas: 'Registro de quemas',
    usuarios: 'Usuarios registrados',
    pronostico: 'Previsión de riesgo',
    exportar: 'Exportación de datos'
  };
  const tb = document.getElementById('topbar-title');
  if (tb) tb.textContent = titles[id] || id;
  window._currentPage = id;
}

/* ── Toast ── */
function showToast(msg, type = '') {
  const ct = document.getElementById('toast-container');
  if (!ct) return;
  const t = document.createElement('div');
  t.className = `toast${type ? ' ' + type : ''}`;
  t.textContent = msg;
  ct.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

/* ── Reloj en tiempo real ── */
function updateClock() {
  const el = document.getElementById('live-clock');
  if (!el) return;
  const now = new Date(2026, 9, 6, 9, 41, new Date().getSeconds());
  el.textContent = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')} — 06/10/2026`;
}

/* ── Dashboard ── */
function initDashboard() {
  // Stat counters
  animateCount('stat-usuarios', 312);
  animateCount('stat-quemas-hoy', 247);
  animateCount('stat-quemas-total', 1842);
  animateCount('stat-municipios', 10);

  // Gráfico de barras — últimos 30 días
  const chart = document.getElementById('quemas-chart');
  if (!chart) return;
  const days = [];
  const now = new Date(2026, 9, 6);
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const v = Math.floor(10 + Math.random() * 80);
    days.push({ label: String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0'), v });
  }
  const maxV = Math.max(...days.map(d => d.v));
  chart.innerHTML = days.map(d => `
    <div class="bar-col">
      <div class="bar-val">${d.v}</div>
      <div class="bar-fill" style="height:${Math.round((d.v/maxV)*160)}px" title="${d.label}: ${d.v} quemas"></div>
      <div class="bar-label">${d.label}</div>
    </div>`).join('');

  // Donut municipios
  const donutCanvas = document.getElementById('donut-canvas');
  if (donutCanvas) {
    const ctx = donutCanvas.getContext('2d');
    const data = [
      { label: 'Sueca', v: 487, color: '#2a5f8f' },
      { label: 'Cullera', v: 312, color: '#27ae60' },
      { label: 'Sollana', v: 248, color: '#e67e22' },
      { label: 'Almussafes', v: 195, color: '#c0392b' },
      { label: 'Otros', v: 600, color: '#b0acaa' }
    ];
    const total = data.reduce((s,d) => s+d.v, 0);
    let start = -Math.PI/2;
    const cx = 64, cy = 64, r = 52, rIn = 30;
    data.forEach(d => {
      const angle = (d.v / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(start) * r, cy + Math.sin(start) * r);
      ctx.arc(cx, cy, r, start, start + angle);
      ctx.arc(cx, cy, rIn, start + angle, start, true);
      ctx.fillStyle = d.color;
      ctx.fill();
      start += angle;
    });
    const legend = document.getElementById('donut-legend');
    if (legend) legend.innerHTML = data.map(d => `
      <div class="legend-item">
        <div class="legend-dot" style="background:${d.color}"></div>
        <span class="legend-label">${d.label}</span>
        <span class="legend-val">${d.v}</span>
      </div>`).join('');
  }

  // Últimas quemas
  renderQuemasTable('recent-quemas-table', window._quemas.slice(0,8), false);

  // Previsión mini
  renderForecastMini();
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let current = 0;
  const step = Math.ceil(target / 40);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current.toLocaleString('es-ES');
    if (current >= target) clearInterval(timer);
  }, 30);
}

/* ── Tabla de quemas ── */
let _quemasPage = 1;
const _quemasPerPage = 15;
let _quemasFilter = '';
let _quemasRisk = '';

function renderQuemasTable(tableId, data, showPagination = true) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  if (!tbody) return;
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="10"><div class="empty-state"><svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><p>No se encontraron registros</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = data.map(q => `
    <tr>
      <td><span style="font-family:var(--font-mono);font-size:0.78rem;color:var(--c-accent)">${q.id}</span></td>
      <td style="font-family:var(--font-mono);font-size:0.82rem">${q.dni}</td>
      <td>${q.municipio}</td>
      <td style="font-family:var(--font-mono)">${q.poligono}</td>
      <td style="font-family:var(--font-mono)">${q.parcela}</td>
      <td style="font-family:var(--font-mono)">${q.recinto}</td>
      <td style="font-family:var(--font-mono)">${q.superficie} ha</td>
      <td style="font-family:var(--font-mono);font-size:0.82rem">${q.fecha} ${q.hora}</td>
      <td>${riskPill(q.risk)}</td>
      <td style="font-family:var(--font-mono);font-size:0.75rem;color:var(--c-muted)">${q.lat}°N ${q.lng}°W</td>
    </tr>`).join('');
  if (showPagination) renderPagination();
}

function getFilteredQuemas() {
  let data = window._quemas;
  if (_quemasFilter) {
    const q = _quemasFilter.toLowerCase();
    data = data.filter(d => d.municipio.toLowerCase().includes(q) || d.dni.toLowerCase().includes(q) || d.id.toLowerCase().includes(q) || d.parcela.includes(q));
  }
  if (_quemasRisk) data = data.filter(d => d.risk == _quemasRisk);
  return data;
}

function renderPagination() {
  const data = getFilteredQuemas();
  const total = data.length;
  const pages = Math.ceil(total / _quemasPerPage);
  const start = (_quemasPage - 1) * _quemasPerPage;
  const slice = data.slice(start, start + _quemasPerPage);
  renderQuemasTable('quemas-main-table', slice, false);

  const info = document.getElementById('quemas-count');
  if (info) info.textContent = `${start+1}–${Math.min(start+_quemasPerPage,total)} de ${total.toLocaleString('es-ES')} registros`;

  const pag = document.getElementById('quemas-pagination');
  if (!pag) return;
  let html = `<button class="page-btn" onclick="qPage(${_quemasPage-1})" ${_quemasPage===1?'disabled':''}>‹</button>`;
  for (let p = Math.max(1,_quemasPage-2); p <= Math.min(pages,_quemasPage+2); p++) {
    html += `<button class="page-btn${p===_quemasPage?' active':''}" onclick="qPage(${p})">${p}</button>`;
  }
  html += `<button class="page-btn" onclick="qPage(${_quemasPage+1})" ${_quemasPage===pages?'disabled':''}>›</button>`;
  pag.innerHTML = html;
}

function qPage(p) {
  const max = Math.ceil(getFilteredQuemas().length / _quemasPerPage);
  _quemasPage = Math.max(1, Math.min(p, max));
  renderPagination();
}

/* ── Tabla de usuarios ── */
let _usuariosPage = 1;
const _usuariosPerPage = 15;
let _usuariosFilter = '';

function renderUsuariosTable() {
  let data = window._usuarios;
  if (_usuariosFilter) {
    const q = _usuariosFilter.toLowerCase();
    data = data.filter(d => d.nombre.toLowerCase().includes(q) || d.dni.toLowerCase().includes(q) || d.municipio.toLowerCase().includes(q) || d.telefono.includes(q));
  }
  const total = data.length;
  const pages = Math.ceil(total / _usuariosPerPage);
  const start = (_usuariosPage - 1) * _usuariosPerPage;
  const slice = data.slice(start, start + _usuariosPerPage);

  const tbody = document.querySelector('#usuarios-table tbody');
  if (!tbody) return;
  tbody.innerHTML = slice.map(u => `
    <tr>
      <td>${u.nombre}</td>
      <td style="font-family:var(--font-mono);font-size:0.82rem">${u.dni}</td>
      <td style="font-family:var(--font-mono)">${u.telefono}</td>
      <td>${u.municipio}</td>
      <td style="font-family:var(--font-mono);font-size:0.82rem">${u.fecha_alta}</td>
      <td style="text-align:center;font-family:var(--font-mono)">${u.quemas}</td>
      <td><span class="badge ${u.activo?'badge-green':'badge-gray'}">${u.activo?'Activo':'Inactivo'}</span></td>
    </tr>`).join('');

  const info = document.getElementById('usuarios-count');
  if (info) info.textContent = `${start+1}–${Math.min(start+_usuariosPerPage,total)} de ${total.toLocaleString('es-ES')} usuarios`;

  const pag = document.getElementById('usuarios-pagination');
  if (!pag) return;
  let html = `<button class="page-btn" onclick="uPage(${_usuariosPage-1})" ${_usuariosPage===1?'disabled':''}>‹</button>`;
  for (let p = Math.max(1,_usuariosPage-2); p <= Math.min(pages,_usuariosPage+2); p++) {
    html += `<button class="page-btn${p===_usuariosPage?' active':''}" onclick="uPage(${p})">${p}</button>`;
  }
  html += `<button class="page-btn" onclick="uPage(${_usuariosPage+1})" ${_usuariosPage===pages?'disabled':''}>›</button>`;
  pag.innerHTML = html;
}

function uPage(p) {
  const data = window._usuarios.filter(u => !_usuariosFilter || u.nombre.toLowerCase().includes(_usuariosFilter.toLowerCase()) || u.municipio.toLowerCase().includes(_usuariosFilter.toLowerCase()));
  const max = Math.ceil(data.length / _usuariosPerPage);
  _usuariosPage = Math.max(1, Math.min(p, max));
  renderUsuariosTable();
}

/* ── Previsión 36h ── */
function renderForecast36() {
  const container = document.getElementById('forecast-36h');
  if (!container) return;
  const forecast = window._forecast;
  container.innerHTML = forecast.map(f => `
    <div class="forecast-row">
      <span class="forecast-hour">${f.label}</span>
      <div class="forecast-bar" style="background:${riskBarColor(f.risk)};width:${Math.round((f.risk/5)*100)}%"></div>
      <span class="forecast-val">${riskLabel[f.risk]} (${f.risk}) · ${f.conf}</span>
    </div>`).join('');
}

function renderForecastMini() {
  const el = document.getElementById('forecast-mini');
  if (!el) return;
  const f = window._forecast.slice(0, 24);
  el.innerHTML = `<div class="risk-bar-h">${f.map(s => `<div class="seg r${s.risk}" title="${s.label}: ${riskLabel[s.risk]}">${s.label.split(':')[0]}</div>`).join('')}</div>`;
}

/* ── Simulación de descarga Excel ── */
function exportExcel(type) {
  showToast(`Generando Excel de ${type === 'quemas' ? 'quemas' : 'usuarios'}...`);
  setTimeout(() => {
    showToast(`✓ ${type === 'quemas' ? 'quepar_quemas_20261006.xlsx' : 'quepar_usuarios_20261006.xlsx'} descargado`, 'success');
  }, 1400);
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', function() {
  window._quemas   = generateQuemas(120);
  window._usuarios = generateUsuarios(312);
  window._forecast = generateForecast(36);

  updateClock();
  setInterval(updateClock, 1000);

  initDashboard();
  renderPagination();
  renderUsuariosTable();
  renderForecast36();

  // Nav listeners
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      showPage(item.dataset.page);
    });
  });

  // Search — quemas
  const sqm = document.getElementById('search-quemas');
  if (sqm) sqm.addEventListener('input', e => {
    _quemasFilter = e.target.value;
    _quemasPage = 1;
    renderPagination();
  });
  const sfilt = document.getElementById('filter-risk');
  if (sfilt) sfilt.addEventListener('change', e => {
    _quemasRisk = e.target.value;
    _quemasPage = 1;
    renderPagination();
  });

  // Search — usuarios
  const suu = document.getElementById('search-usuarios');
  if (suu) suu.addEventListener('input', e => {
    _usuariosFilter = e.target.value;
    _usuariosPage = 1;
    renderUsuariosTable();
  });

  showPage('dashboard');
});
