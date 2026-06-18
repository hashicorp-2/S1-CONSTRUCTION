/* S1F1RB1 Construction — script.js */

/* ── CUSTOM CURSOR ── */
(function () {
  const ring = document.getElementById('cursor');
  const dot  = document.getElementById('cursorDot');
  if (!ring || !dot) return;
  let mx = -100, my = -100, rx = -100, ry = -100;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  (function loop() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
    requestAnimationFrame(loop);
  })();
  document.addEventListener('mousedown', () => ring.style.transform = 'translate(-50%,-50%) scale(0.75)');
  document.addEventListener('mouseup',   () => ring.style.transform = 'translate(-50%,-50%) scale(1)');
})();

/* ── NAV SCROLL ── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ── HAMBURGER ── */
const burger   = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    burger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

/* ── HERO IMAGE LOAD ── */
const heroSection = document.getElementById('hero');
const heroImg = document.getElementById('heroImg');
if (heroImg) {
  const trigger = () => heroSection.classList.add('loaded');
  heroImg.complete ? trigger() : heroImg.addEventListener('load', trigger);
}

/* ── SCROLL REVEAL ── */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ── ANIMATED COUNTERS ── */
function animateCounter(el, target, duration) {
  let start = null;
  const step = ts => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(ease * target);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
}
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.hs-n[data-n]').forEach(counter => {
        animateCounter(counter, parseInt(counter.dataset.n, 10), 1800);
      });
      counterObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
const heroStats = document.querySelector('.hero-stats');
if (heroStats) counterObs.observe(heroStats);

/* ── ESTIMATOR ── */
const RANGES = {
  concrete:   { small: '$4k–$9k',    medium: '$9k–$25k',   large: '$25k–$70k',   xlarge: '$70k–$200k+' },
  framing:    { small: '$6k–$12k',   medium: '$12k–$35k',  large: '$35k–$90k',   xlarge: '$90k–$250k+' },
  excavation: { small: '$3k–$8k',    medium: '$8k–$22k',   large: '$22k–$60k',   xlarge: '$60k–$150k+' },
  demolition: { small: '$2k–$6k',    medium: '$6k–$15k',   large: '$15k–$40k',   xlarge: '$40k–$100k+' },
  drywall:    { small: '$2k–$5k',    medium: '$5k–$14k',   large: '$14k–$35k',   xlarge: '$35k–$80k+'  },
  renovation: { small: '$8k–$20k',   medium: '$20k–$60k',  large: '$60k–$150k',  xlarge: '$150k–$400k+' },
  bathroom:   { small: '$10k–$22k',  medium: '$22k–$45k',  large: '$45k–$90k',   xlarge: '$90k–$180k+' },
  management: { small: '$5k–$15k',   medium: '$15k–$40k',  large: '$40k–$100k',  xlarge: '$100k–$300k+' },
};

const STEP_IDS = ['s1', 's2', 's3', 's4', 'sResult'];
let estData = { type: null, size: null, timeline: null };
let currentStepIdx = 0;

const epFill  = document.getElementById('epFill');
const epLabel = document.getElementById('epLabel');
const estPrev = document.getElementById('estPrev');
const estNext = document.getElementById('estNext');

function updateProgress() {
  const visibleStep = Math.min(currentStepIdx, 3); // 4 numbered steps
  const pct = ((visibleStep + 1) / 4) * 100;
  if (epFill)  epFill.style.width = pct + '%';
  if (epLabel) epLabel.textContent = 'Step ' + (visibleStep + 1) + ' of 4';
}

function syncNav() {
  if (!estPrev || !estNext) return;
  estPrev.style.visibility = currentStepIdx > 0 ? 'visible' : 'hidden';
  // Next enabled on s4 by default; on s1–s3 controlled by option selection
  if (currentStepIdx === 3) {
    estNext.disabled = false;
    estNext.textContent = 'Get My Estimate →';
  } else {
    estNext.disabled = true;
    estNext.textContent = 'Continue →';
  }
  if (currentStepIdx === 4) {
    document.getElementById('estNav').style.display = 'none';
  } else {
    document.getElementById('estNav').style.display = '';
  }
}

function goToStep(idx) {
  STEP_IDS.forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('active', i === idx);
  });
  currentStepIdx = idx;
  updateProgress();
  syncNav();
  if (idx === 4) showResult();
}

function showResult() {
  const range = (RANGES[estData.type] || {})[estData.size] || 'Contact us for a custom quote';
  const el = document.getElementById('rbRange');
  if (el) el.textContent = range;
}

/* Option buttons auto-advance on s1/s2/s3 */
document.querySelectorAll('#s1 .opt, #s2 .opt, #s3 .opt').forEach(btn => {
  btn.addEventListener('click', () => {
    const step = btn.closest('.est-step');
    step.querySelectorAll('.opt').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    const val = btn.dataset.v;
    if (step.id === 's1') estData.type     = val;
    if (step.id === 's2') estData.size     = val;
    if (step.id === 's3') estData.timeline = val;

    if (currentStepIdx < 3) {
      setTimeout(() => goToStep(currentStepIdx + 1), 280);
    } else {
      if (estNext) estNext.disabled = false;
    }
  });
});

if (estPrev) estPrev.addEventListener('click', () => { if (currentStepIdx > 0) goToStep(currentStepIdx - 1); });
if (estNext) estNext.addEventListener('click', () => { if (currentStepIdx < 4) goToStep(currentStepIdx + 1); });

/* Estimator form submit → show result */
const estForm = document.getElementById('estForm');
if (estForm) {
  estForm.addEventListener('submit', e => {
    e.preventDefault();
    goToStep(4);
  });
}

/* ── CONTACT FORM ── */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = '✓ Message Sent — We\'ll be in touch within 24 hours';
      btn.style.background = '#2a5c3a';
      btn.style.color = '#fff';
      contactForm.reset();
    }, 1200);
  });
}

/* ── SMOOTH SCROLL ── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const offset = target.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  });
});
