/* S1F1RB1 CONSTRUCTION — script.js */

// ── Navbar scroll ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ── Mobile hamburger ──
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// ── Active nav link on scroll ──
const scrollSections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-link');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navItems.forEach(n => n.classList.remove('active'));
      const match = document.querySelector(`.nav-link[href="#${e.target.id}"]`);
      if (match) match.classList.add('active');
    }
  });
}, { threshold: 0.35 });
scrollSections.forEach(s => sectionObserver.observe(s));

// ── Reveal on scroll ──
const revealObs = new IntersectionObserver(entries => {
  entries.forEach((entry, idx) => {
    if (!entry.isIntersecting) return;
    const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal'));
    const i = siblings.indexOf(entry.target);
    entry.target.style.transitionDelay = `${Math.min(i * 0.07, 0.35)}s`;
    entry.target.classList.add('in');
    revealObs.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ── Parallax hero image on scroll ──
const heroImg = document.querySelector('.hero-img');
if (heroImg) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      heroImg.style.transform = `scale(1) translateY(${y * 0.3}px)`;
    }
  }, { passive: true });
}

// ══════════════════════════════════════════════════════════
// PROJECT ESTIMATOR
// ══════════════════════════════════════════════════════════
const RANGES = {
  bathroom:   { small:[8000,18000],   medium:[18000,38000],  large:[38000,70000],  xlarge:[70000,120000] },
  renovation: { small:[15000,35000],  medium:[35000,80000],  large:[80000,160000], xlarge:[160000,350000] },
  framing:    { small:[6000,14000],   medium:[14000,32000],  large:[32000,70000],  xlarge:[70000,140000] },
  drywall:    { small:[2500,6000],    medium:[6000,14000],   large:[14000,30000],  xlarge:[30000,65000] },
  tile:       { small:[3500,9000],    medium:[9000,22000],   large:[22000,48000],  xlarge:[48000,90000] },
  concrete:   { small:[5000,12000],   medium:[12000,28000],  large:[28000,60000],  xlarge:[60000,130000] },
  cabinetry:  { small:[8000,20000],   medium:[20000,45000],  large:[45000,90000],  xlarge:[90000,180000] },
  management: { small:[5000,12000],   medium:[12000,30000],  large:[30000,70000],  xlarge:[70000,150000] },
};
const URGENCY = { asap:1.18, soon:1.05, planning:1.0, flexible:0.95 };
const STEP_IDS = ['step1','step2','step3','step4','stepResult'];
let currentStep = 0;
const sel = { type: null, size: null, timeline: null };

const progFill  = document.getElementById('progressFill');
const progLabel = document.getElementById('progressLabel');
const prevBtn   = document.getElementById('prevBtn');
const nextBtn   = document.getElementById('nextBtn');
const estNav    = document.getElementById('estimatorNav');

function goToStep(i) {
  STEP_IDS.forEach((id, idx) => {
    document.getElementById(id).classList.toggle('active', idx === i);
  });
  const pct = Math.min(((i + 1) / 4) * 100, 100);
  progFill.style.width = pct + '%';
  progLabel.textContent = i < 4 ? `Step ${i + 1} of 4` : 'Complete';
  prevBtn.style.visibility = (i > 0 && i < 4) ? 'visible' : 'hidden';
  nextBtn.disabled = !hasSelection(i);
  estNav.style.display = i === 4 ? 'none' : 'flex';
  currentStep = i;
}

function hasSelection(step) {
  if (step === 0) return !!sel.type;
  if (step === 1) return !!sel.size;
  if (step === 2) return !!sel.timeline;
  return true;
}

document.querySelectorAll('.opt').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.est-step').querySelectorAll('.opt').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    const v = btn.dataset.value;
    if (currentStep === 0) sel.type = v;
    if (currentStep === 1) sel.size = v;
    if (currentStep === 2) sel.timeline = v;
    nextBtn.disabled = false;
  });
});

nextBtn.addEventListener('click', () => { if (currentStep < 3) goToStep(currentStep + 1); });
prevBtn.addEventListener('click', () => { if (currentStep > 0) goToStep(currentStep - 1); });

document.getElementById('estimatorForm').addEventListener('submit', e => {
  e.preventDefault();
  const base = RANGES[sel.type]?.[sel.size] ?? [10000, 25000];
  const mult = URGENCY[sel.timeline] ?? 1;
  const lo = Math.round(base[0] * mult / 1000) * 1000;
  const hi = Math.round(base[1] * mult / 1000) * 1000;
  document.getElementById('resultRange').textContent =
    `$${lo.toLocaleString()} – $${hi.toLocaleString()}`;
  goToStep(4);
});

goToStep(0);

// ── Contact form feedback ──
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const orig = btn.textContent;
  btn.textContent = '✓ Message Received!';
  btn.disabled = true;
  btn.style.background = '#059669';
  btn.style.boxShadow = '0 4px 20px rgba(5,150,105,0.35)';
  e.target.reset();
  setTimeout(() => {
    btn.textContent = orig;
    btn.disabled = false;
    btn.style.background = '';
    btn.style.boxShadow = '';
  }, 5000);
});

// ── Smooth scroll for all anchors ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
