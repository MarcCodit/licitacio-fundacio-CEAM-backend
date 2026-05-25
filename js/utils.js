/* ============================================
   QUEPAR 2026 — Shared JS Utilities
   ============================================ */

'use strict';

/* ── Risk helpers ── */
const RISK_LABELS = {
  0: 'Sense dada',
  1: 'Risc molt alt',
  2: 'Risc alt',
  3: 'Transitori',
  4: 'Risc baix',
  5: 'Risc molt baix'
};
const RISK_COLORS = {
  0: '#b0acaa',
  1: '#c0392b',
  2: '#e74c3c',
  3: '#e67e22',
  4: '#27ae60',
  5: '#2ecc71'
};

function riskClass(level) { return `r${level}`; }
function riskLabel(level) { return RISK_LABELS[level] ?? 'Desconegut'; }
function riskColor(level) { return RISK_COLORS[level] ?? '#999'; }

/* ── Generate fake 24h forecast ── */
function generateForecast(startHour = 17) {
  const forecast = [];
  for (let i = 0; i < 24; i++) {
    const hour = (startHour + i) % 24;
    // realistic-ish: higher risk at night/dawn
    let level;
    if (hour >= 22 || hour <= 5) {
      level = Math.random() < 0.5 ? 1 : 2;
    } else if (hour >= 6 && hour <= 10) {
      level = Math.random() < 0.5 ? 3 : 4;
    } else {
      level = Math.random() < 0.7 ? 4 : 5;
    }
    forecast.push({ hour: `${String(hour).padStart(2,'0')}:00`, level });
  }
  return forecast;
}

/* ── Toast notification ── */
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container') || (() => {
    const el = document.createElement('div');
    el.id = 'toast-container';
    Object.assign(el.style, {
      position: 'fixed', bottom: '24px', right: '24px',
      display: 'flex', flexDirection: 'column', gap: '10px',
      zIndex: 9999, pointerEvents: 'none'
    });
    document.body.appendChild(el);
    return el;
  })();

  const colors = { info: '#2a5f8f', success: '#27ae60', error: '#c0392b', warning: '#e67e22' };
  const toast = document.createElement('div');
  Object.assign(toast.style, {
    background: colors[type] || colors.info,
    color: '#fff',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    fontFamily: "'DM Sans', sans-serif",
    boxShadow: '0 4px 20px rgba(0,0,0,.15)',
    transform: 'translateX(120%)',
    transition: 'transform .3s cubic-bezier(.34,1.56,.64,1)',
    pointerEvents: 'auto',
    maxWidth: '320px'
  });
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => { toast.style.transform = 'translateX(0)'; });
  setTimeout(() => {
    toast.style.transform = 'translateX(120%)';
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, duration);
}

/* ── Format date ── */
function formatDate(d) {
  return new Intl.DateTimeFormat('ca-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);
}

/* ── Animate counter ── */
function animateCounter(el, end, duration = 1200) {
  const start = parseInt(el.textContent) || 0;
  const range = end - start;
  const step = 16;
  const steps = Math.ceil(duration / step);
  let current = 0;
  const timer = setInterval(() => {
    current++;
    el.textContent = Math.round(start + range * (current / steps));
    if (current >= steps) clearInterval(timer);
  }, step);
}

/* ── Intersection observer for reveal animations ── */
function initRevealAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', initRevealAnimations);
