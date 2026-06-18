/* S1F1RB1 CONSTRUCTION — script.js */
'use strict';

// ── Custom cursor ──────────────────────────────────────────
const cursor    = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
let mx = -100, my = -100, cx = -100, cy = -100;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursorDot.style.left = mx + 'px';
  cursorDot.style.top  = my + 'px';
});

(function animateCursor() {
  cx += (mx - cx) * 0.12;
  cy += (my - cy) * 0.12;
  cursor.style.left = cx + 'px';
  cursor.style.top  = cy + 'px';
  requestAnimationFrame(animateCursor);
})();

document.querySelectorAll('a, button, .svc-item, .work-item, .opt').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});
document.querySelectorAll('input, textarea').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-text'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-text'));
});

// ── Nav scroll ────────────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 80);
}, { passive: true });

// ── Mobile burger ─────────────────────────────────────────
const burger   = document.getElementById('burger');
const navLinks = document.querySelector('.nav-center');

burger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  burger.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    burger.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ── Reveal on scroll ──────────────────────────────────────
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    revealObs.unobserve(e.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ── Hero parallax ─────────────────────────────────────────
const heroImg = document.getElementById('heroImg');
if (heroImg) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight * 1.2) {
      heroImg.style.transform = `translateY(${y * 0.25}px)`;
    }
  }, { passive: true });
}

// ── Counter animation ─────────────────────────────────────
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = parseInt(el.dataset.n, 10);
    if (isNaN(target)) return;
    const dur = 2000;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.floor(ease * target);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }
    requestAnimationFrame(tick);
    counterObs.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.hstat-n[data-n]').forEach(el => counterObs.observe(el));

// ── Services hover list ───────────────────────────────────
const svcItems = document.querySelectorAll('.svc-item');
const svcImg   = document.getElementById('svcImg');

svcItems.forEach(item => {
  item.addEventListener('mouseenter', () => {
    svcItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    const src = item.dataset.img;
    if (src && svcImg) {
      svcImg.style.opacity = '0';
      svcImg.style.transform = 'scale(1.04)';
      setTimeout(() => {
        svcImg.src = src;
        svcImg.style.opacity = '1';
        svcImg.style.transform = 'scale(1)';
      }, 200);
    }
  });
});
// Set first item active
if (svcItems.length) svcItems[0].classList.add('active');

// ── Smooth scroll ─────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ══════════════════════════════════════════════════════════
// ESTIMATOR
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
const STEPS = ['s1','s2','s3','s4','sResult'];
let step = 0;
const sel = { type:null, size:null, time:null };

const epFill  = document.getElementById('epFill');
const epLabel = document.getElementById('epLabel');
const prevBtn = document.getElementById('estPrev');
const nextBtn = document.getElementById('estNext');
const estNav  = document.getElementById('estNav');

function goStep(i) {
  STEPS.forEach((id, idx) => {
    document.getElementById(id).classList.toggle('active', idx === i);
  });
  const pct = Math.min(((i + 1) / 4) * 100, 100);
  epFill.style.width = pct + '%';
  epLabel.textContent = i < 4 ? `Step ${i + 1} of 4` : 'Complete';
  prevBtn.style.visibility = (i > 0 && i < 4) ? 'visible' : 'hidden';
  nextBtn.disabled = !hasSel(i);
  estNav.style.display = i >= 4 ? 'none' : 'flex';
  step = i;
}

function hasSel(i) {
  if (i === 0) return !!sel.type;
  if (i === 1) return !!sel.size;
  if (i === 2) return !!sel.time;
  return true;
}

document.querySelectorAll('.opt').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.est-step').querySelectorAll('.opt').forEach(b => b.classList.remove('sel'));
    btn.classList.add('sel');
    const v = btn.dataset.v;
    if (step === 0) sel.type = v;
    if (step === 1) sel.size = v;
    if (step === 2) sel.time = v;
    nextBtn.disabled = false;
  });
});

nextBtn.addEventListener('click', () => { if (step < 3) goStep(step + 1); });
prevBtn.addEventListener('click', () => { if (step > 0) goStep(step - 1); });

document.getElementById('estForm').addEventListener('submit', e => {
  e.preventDefault();
  const base = RANGES[sel.type]?.[sel.size] ?? [10000, 25000];
  const mult = URGENCY[sel.time] ?? 1;
  const lo = Math.round(base[0] * mult / 1000) * 1000;
  const hi = Math.round(base[1] * mult / 1000) * 1000;
  document.getElementById('rbRange').textContent =
    `$${lo.toLocaleString()} – $${hi.toLocaleString()}`;
  goStep(4);
});

goStep(0);

// ── Contact form ──────────────────────────────────────────
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const orig = btn.textContent;
  btn.textContent = '✓ Message Received';
  btn.disabled = true;
  btn.style.background = '#2d6a4f';
  e.target.reset();
  setTimeout(() => {
    btn.textContent = orig;
    btn.disabled = false;
    btn.style.background = '';
  }, 5000);
});
