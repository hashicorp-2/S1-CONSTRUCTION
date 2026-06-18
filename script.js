/* S1F1RB1 CONSTRUCTION — Main JS */

// ── Navbar scroll effect ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ── Hamburger mobile menu ──
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ── Active nav link on scroll ──
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-link');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navItems.forEach(n => n.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => observer.observe(s));

// ── Scroll-triggered reveal animations ──
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.transitionDelay = `${(i % 4) * 0.08}s`;
      entry.target.classList.add('visible');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ── Counter animation ──
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.count, 10);
    const duration = 1800;
    const step = target / (duration / 16);
    let current = 0;
    const tick = () => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current);
      if (current < target) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    counterObs.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.trust-number').forEach(el => counterObs.observe(el));

// ── Project Estimator ──
const ESTIMATE_BASES = {
  bathroom:   { small: [8000, 18000],   medium: [18000, 38000],  large: [38000, 70000],  xlarge: [70000, 120000] },
  renovation: { small: [15000, 35000],  medium: [35000, 80000],  large: [80000, 160000], xlarge: [160000, 350000] },
  framing:    { small: [6000, 14000],   medium: [14000, 32000],  large: [32000, 70000],  xlarge: [70000, 140000] },
  drywall:    { small: [2500, 6000],    medium: [6000, 14000],   large: [14000, 30000],  xlarge: [30000, 65000] },
  tile:       { small: [3500, 9000],    medium: [9000, 22000],   large: [22000, 48000],  xlarge: [48000, 90000] },
  concrete:   { small: [5000, 12000],   medium: [12000, 28000],  large: [28000, 60000],  xlarge: [60000, 130000] },
  cabinetry:  { small: [8000, 20000],   medium: [20000, 45000],  large: [45000, 90000],  xlarge: [90000, 180000] },
  management: { small: [5000, 12000],   medium: [12000, 30000],  large: [30000, 70000],  xlarge: [70000, 150000] },
};
const URGENCY_MULTIPLIER = { asap: 1.18, soon: 1.05, planning: 1.0, flexible: 0.95 };

const steps = ['step1', 'step2', 'step3', 'step4', 'stepResult'];
let currentStep = 0;
let selections = { type: null, size: null, timeline: null };

const progressFill = document.getElementById('progressFill');
const progressLabel = document.getElementById('progressLabel');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const estimatorNav = document.getElementById('estimatorNav');

function showStep(index) {
  steps.forEach((id, i) => {
    const el = document.getElementById(id);
    el.classList.toggle('active', i === index);
  });
  const pct = Math.min(((index + 1) / 4) * 100, 100);
  progressFill.style.width = pct + '%';
  progressLabel.textContent = index < 4 ? `Step ${index + 1} of 4` : 'Complete';
  prevBtn.style.visibility = index > 0 && index < 4 ? 'visible' : 'hidden';
  nextBtn.disabled = !getSelectionForStep(index);
  estimatorNav.style.display = index === 4 ? 'none' : 'flex';
}

function getSelectionForStep(step) {
  if (step === 0) return selections.type;
  if (step === 1) return selections.size;
  if (step === 2) return selections.timeline;
  if (step === 3) return true;
  return true;
}

function handleOptionClick(btn) {
  const group = btn.closest('.estimator-step');
  group.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  if (currentStep === 0) selections.type = btn.dataset.value;
  if (currentStep === 1) selections.size = btn.dataset.value;
  if (currentStep === 2) selections.timeline = btn.dataset.value;
  nextBtn.disabled = false;
}

document.querySelectorAll('.option-btn').forEach(btn => {
  btn.addEventListener('click', () => handleOptionClick(btn));
});

nextBtn.addEventListener('click', () => {
  if (currentStep < 3) {
    currentStep++;
    showStep(currentStep);
  }
});

prevBtn.addEventListener('click', () => {
  if (currentStep > 0) {
    currentStep--;
    showStep(currentStep);
  }
});

document.getElementById('estimatorForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const base = ESTIMATE_BASES[selections.type]?.[selections.size] ?? [10000, 25000];
  const mult = URGENCY_MULTIPLIER[selections.timeline] ?? 1;
  const low = Math.round((base[0] * mult) / 1000) * 1000;
  const high = Math.round((base[1] * mult) / 1000) * 1000;
  document.getElementById('resultRange').textContent =
    `$${low.toLocaleString()} – $${high.toLocaleString()}`;
  currentStep = 4;
  showStep(4);
});

// ── Contact form ──
document.getElementById('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = '✓ Message Sent!';
  btn.disabled = true;
  btn.style.background = '#059669';
  e.target.reset();
  setTimeout(() => {
    btn.textContent = 'Send Message →';
    btn.disabled = false;
    btn.style.background = '';
  }, 4000);
});

// Initialize estimator
showStep(0);
