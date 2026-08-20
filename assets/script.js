// ===== TableTrackr marketing site interactions =====

document.getElementById('year').textContent = new Date().getFullYear();

/* ---- nav scroll state + mobile menu ---- */
const nav = document.getElementById('nav');
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');

function onScroll(){
  nav.classList.toggle('scrolled', window.scrollY > 12);
}
window.addEventListener('scroll', onScroll, { passive:true });
onScroll();

menuToggle.addEventListener('click', () => {
  nav.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  mobileMenu.classList.remove('open');
}));

/* ---- scroll-spy active nav link ---- */
const navLinks = document.querySelectorAll('[data-nav]');
const spySections = [...navLinks]
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

const spyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      const id = '#' + entry.target.id;
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === id));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });

spySections.forEach(sec => spyObserver.observe(sec));

/* ---- reveal on scroll ---- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = (i % 6) * 0.06 + 's';
  revealObserver.observe(el);
});

/* ---- stepper progress line ---- */
const stepper = document.getElementById('stepper');
const stepperFill = document.getElementById('stepperFill');
if (stepper){
  const stepperObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        stepperFill.style.width = '100%';
        stepperObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });
  stepperObserver.observe(stepper);
}

/* ---- cursor glow (desktop only) ---- */
const cursorGlow = document.getElementById('cursorGlow');
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches){
  window.addEventListener('mousemove', (e) => {
    cursorGlow.style.opacity = '1';
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
  }, { passive:true });
  window.addEventListener('mouseleave', () => { cursorGlow.style.opacity = '0'; });
}

/* ---- count-up numbers (billing card) ---- */
const countEls = document.querySelectorAll('[data-count]');
function animateCount(el){
  const target = parseInt(el.getAttribute('data-count'), 10);
  const duration = 1200;
  const start = performance.now();
  function tick(now){
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(eased * target).toLocaleString('en-IN');
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      animateCount(entry.target);
      countObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.6 });
countEls.forEach(el => countObserver.observe(el));

/* ---- modular tabs ---- */
const modularTabs = document.getElementById('modularTabs');
const modularDesc = document.getElementById('modularDesc');
const moduleStack = document.getElementById('moduleStack');

const tierData = {
  1: { desc:'Live table status, sessions, timing and basic history.', mods:['tables'] },
  2: { desc:'Online bookings, live availability and time slots.', mods:['tables','booking'] },
  3: { desc:'Profiles, balances, history and memberships.', mods:['tables','customers'] },
  4: { desc:'Session billing, payments, discounts and balances.', mods:['tables','billing'] },
  5: { desc:'Multi-floor management, bookings, customers, billing and self-service.', mods:['tables','booking','customers','billing','floors','selfservice'] },
};

function setTier(tier){
  const data = tierData[tier];
  if (!data) return;
  modularTabs.querySelectorAll('.modular-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tier === String(tier));
  });
  modularDesc.textContent = data.desc;
  moduleStack.querySelectorAll('.module-chip').forEach(chip => {
    chip.classList.toggle('lit', data.mods.includes(chip.dataset.mod));
  });
}

if (modularTabs){
  modularTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.modular-tab');
    if (!tab) return;
    setTier(tab.dataset.tier);
  });
  setTier(1);
}

/* ---- live floor demo ---- */
const tableGrid = document.getElementById('tableGrid');
const demoClock = document.getElementById('demoClock');

const STATE_ORDER = ['available', 'active', 'paused', 'reserved'];
const STATE_LABEL = { available:'Available', active:'In service', paused:'Paused', reserved:'Reserved' };

const tables = [
  { name:'T1', state:'active', elapsed:1830 },
  { name:'T2', state:'available', elapsed:0 },
  { name:'T3', state:'paused', elapsed:645 },
  { name:'T4', state:'reserved', elapsed:0 },
  { name:'T5', state:'active', elapsed:210 },
  { name:'T6', state:'available', elapsed:0 },
];

function fmt(sec){
  const h = String(Math.floor(sec / 3600)).padStart(2,'0');
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2,'0');
  const s = String(Math.floor(sec % 60)).padStart(2,'0');
  return `${h}:${m}:${s}`;
}

function renderTables(){
  tableGrid.innerHTML = tables.map((t, i) => `
    <button class="table-btn" data-state="${t.state}" data-idx="${i}" aria-label="${t.name} — ${STATE_LABEL[t.state]}">
      <div class="t-name">${t.name}</div>
      <div class="t-status">${STATE_LABEL[t.state]}</div>
      <div class="t-timer">${t.state === 'available' || t.state === 'reserved' ? '' : fmt(t.elapsed)}</div>
    </button>
  `).join('');
}
renderTables();

tableGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('.table-btn');
  if (!btn) return;
  const idx = Number(btn.dataset.idx);
  const t = tables[idx];
  const next = STATE_ORDER[(STATE_ORDER.indexOf(t.state) + 1) % STATE_ORDER.length];
  t.state = next;
  if (next === 'active' && t.elapsed === 0){ /* keep any existing elapsed */ }
  if (next === 'available'){ t.elapsed = 0; }
  renderTables();
});

setInterval(() => {
  let changed = false;
  tables.forEach(t => {
    if (t.state === 'active'){ t.elapsed += 1; changed = true; }
  });
  if (changed){
    tableGrid.querySelectorAll('.table-btn').forEach(btn => {
      const idx = Number(btn.dataset.idx);
      const t = tables[idx];
      if (t.state === 'active'){
        btn.querySelector('.t-timer').textContent = fmt(t.elapsed);
      }
    });
  }
  if (demoClock){
    demoClock.textContent = new Date().toLocaleTimeString('en-IN', { hour12:false });
  }
}, 1000);

/* ---- contact modal + lead capture ---- */
// Set this to your Apps Script Web App URL once deployed (see setup notes in README).
const LEAD_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyhLwy2lDY89bNrJxepFebWEdiPAYohkVAFeoHiN13fIyuAD1mU035POFYpLrAoLBaCAw/exec';

const contactOverlay = document.getElementById('contactOverlay');
const contactForm = document.getElementById('contactForm');
const contactClose = document.getElementById('contactClose');
const cfSubmit = document.getElementById('cf-submit');
const cfStatus = document.getElementById('cf-status');
let lastFocused = null;

function openContact(){
  lastFocused = document.activeElement;
  contactOverlay.classList.add('open');
  contactOverlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('cf-name').focus(), 250);
}
function closeContact(){
  contactOverlay.classList.remove('open');
  contactOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lastFocused) lastFocused.focus();
}

document.querySelectorAll('[data-open-contact]').forEach(btn => {
  btn.addEventListener('click', () => {
    nav.classList.remove('open');
    mobileMenu.classList.remove('open');
    openContact();
  });
});
contactClose.addEventListener('click', closeContact);
contactOverlay.addEventListener('click', (e) => { if (e.target === contactOverlay) closeContact(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && contactOverlay.classList.contains('open')) closeContact(); });

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // honeypot: bots tend to fill every field, real users never see this one
  if (contactForm.company.value){ return; }

  contactForm.querySelectorAll('input[required]').forEach(i => i.classList.add('touched'));
  if (!contactForm.checkValidity()){
    cfStatus.textContent = 'Please fill in all fields with a valid email.';
    cfStatus.className = 'contact-status error';
    return;
  }

  if (LEAD_WEBHOOK_URL.includes('PASTE_')){
    cfStatus.textContent = 'Form isn’t connected yet — email hrishank21s@gmail.com directly for now.';
    cfStatus.className = 'contact-status error';
    return;
  }

  cfSubmit.disabled = true;
  cfStatus.textContent = 'Sending…';
  cfStatus.className = 'contact-status';

  const data = new FormData();
  data.append('name', contactForm.name.value.trim());
  data.append('phone', contactForm.phone.value.trim());
  data.append('email', contactForm.email.value.trim());
  data.append('source', window.location.href);

  try {
    await fetch(LEAD_WEBHOOK_URL, { method: 'POST', mode: 'no-cors', body: data });
    cfStatus.textContent = 'Thanks! I’ll be in touch shortly.';
    cfStatus.className = 'contact-status success';
    contactForm.reset();
    setTimeout(closeContact, 1800);
  } catch (err){
    cfStatus.textContent = 'Something went wrong — please email hrishank21s@gmail.com instead.';
    cfStatus.className = 'contact-status error';
  } finally {
    cfSubmit.disabled = false;
  }
});
