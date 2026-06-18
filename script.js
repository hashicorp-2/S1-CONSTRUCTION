document.addEventListener('DOMContentLoaded', function () {

  /* ============================================================
     INTERSECTION OBSERVER — SCROLL ANIMATIONS
     ============================================================ */
  const animatedElements = document.querySelectorAll('.animate-on-scroll');

  const scrollObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          scrollObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    }
  );

  animatedElements.forEach(function (el) {
    scrollObserver.observe(el);
  });

  /* ============================================================
     NAVBAR SCROLL BEHAVIOR
     ============================================================ */
  var navbar = document.getElementById('navbar');

  window.addEventListener('scroll', function () {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateActiveNavLink();
  }, { passive: true });

  /* ============================================================
     MOBILE HAMBURGER MENU
     ============================================================ */
  var hamburger = document.getElementById('hamburger');
  var navMenu = document.getElementById('nav-menu');

  hamburger.addEventListener('click', function () {
    var isOpen = navMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen.toString());
  });

  // Close menu when a nav link is clicked
  navMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ============================================================
     SMOOTH SCROLL FOR ANCHOR LINKS
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      var navHeight = navbar.offsetHeight;
      var targetTop = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 8;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });

  /* ============================================================
     ACTIVE NAV LINK ON SCROLL
     ============================================================ */
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-link');

  function updateActiveNavLink() {
    var scrollY = window.pageYOffset;
    var navHeight = navbar.offsetHeight;
    var activeId = '';

    sections.forEach(function (section) {
      var sectionTop = section.offsetTop - navHeight - 80;
      var sectionBottom = sectionTop + section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionBottom) {
        activeId = section.getAttribute('id');
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + activeId) {
        link.classList.add('active');
      }
    });
  }

  /* ============================================================
     COUNTER ANIMATION — TRUST BAR
     ============================================================ */
  var statElements = document.querySelectorAll('.trust-stat[data-target]');
  var countersStarted = false;

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateCounter(el, target, suffix, duration) {
    var startTime = null;
    var start = 0;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var easedProgress = easeOutQuart(progress);
      var current = Math.round(start + (target - start) * easedProgress);
      el.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  var trustBar = document.querySelector('.trust-bar');

  var trustObserver = new IntersectionObserver(
    function (entries) {
      if (entries[0].isIntersecting && !countersStarted) {
        countersStarted = true;
        statElements.forEach(function (el) {
          var target = parseInt(el.getAttribute('data-target'), 10);
          var suffix = el.getAttribute('data-suffix') || '';
          animateCounter(el, target, suffix, 2000);
        });
        trustObserver.disconnect();
      }
    },
    { threshold: 0.3 }
  );

  if (trustBar) {
    trustObserver.observe(trustBar);
  }

  /* ============================================================
     SQFT SLIDER — LIVE UPDATE
     ============================================================ */
  var sqftSlider = document.getElementById('sqftSlider');
  var sqftDisplay = document.getElementById('sqftDisplay');

  if (sqftSlider) {
    sqftSlider.addEventListener('input', function () {
      var val = parseInt(this.value, 10);
      sqftDisplay.textContent = val.toLocaleString() + ' sqft';
      // Update slider fill
      var min = parseInt(this.min, 10);
      var max = parseInt(this.max, 10);
      var pct = ((val - min) / (max - min)) * 100;
      this.style.background = 'linear-gradient(to right, var(--amber) 0%, var(--amber) ' + pct + '%, rgba(255,255,255,0.15) ' + pct + '%)';
      this.setAttribute('aria-valuenow', val);
    });
  }

  /* ============================================================
     PROJECT ESTIMATOR WIZARD
     ============================================================ */
  var currentStep = 1;
  var totalSteps = 4;

  var estimatorForm = document.getElementById('estimatorForm');
  var nextBtn = document.getElementById('nextBtn');
  var prevBtn = document.getElementById('prevBtn');
  var submitBtn = document.getElementById('submitBtn');
  var thankYouMessage = document.getElementById('thankYouMessage');
  var progressFill = document.getElementById('progressFill');

  var BASE_RATES = {
    renovation:  150,
    concrete:    80,
    framing:     60,
    drywall:     45,
    bathroom:    200,
    tile:        65,
    contracting: 100,
    cabinetry:   250
  };

  var TIMELINE_MULTIPLIERS = {
    urgent:   1.3,
    standard: 1.0,
    flexible: 0.95
  };

  function goToStep(step) {
    // Hide current step
    document.getElementById('step' + currentStep).classList.remove('active');
    // Update progress dots
    var stepDots = document.querySelectorAll('.progress-step');
    stepDots.forEach(function (dot, idx) {
      dot.classList.remove('active', 'completed');
      if (idx + 1 < step) dot.classList.add('completed');
      if (idx + 1 === step) dot.classList.add('active');
    });

    currentStep = step;

    // Show new step
    document.getElementById('step' + currentStep).classList.add('active');

    // Update progress fill
    var pct = (currentStep / totalSteps) * 100;
    progressFill.style.width = pct + '%';

    // Show/hide buttons
    prevBtn.style.display = currentStep > 1 ? 'inline-flex' : 'none';

    if (currentStep === totalSteps) {
      nextBtn.classList.add('hidden');
      submitBtn.classList.remove('hidden');
      calculateEstimate();
    } else {
      nextBtn.classList.remove('hidden');
      submitBtn.classList.add('hidden');
    }
  }

  function validateStep(step) {
    if (step === 1) {
      var selected = document.querySelector('input[name="projectType"]:checked');
      var errorEl = document.getElementById('step1-error');
      if (!selected) {
        errorEl.classList.remove('hidden');
        return false;
      }
      errorEl.classList.add('hidden');
      return true;
    }

    if (step === 2) {
      // Step 2 has no required fields (slider always has value, checkboxes optional)
      return true;
    }

    if (step === 3) {
      var selected = document.querySelector('input[name="timeline"]:checked');
      var errorEl = document.getElementById('step3-error');
      if (!selected) {
        errorEl.classList.remove('hidden');
        return false;
      }
      errorEl.classList.add('hidden');
      return true;
    }

    if (step === 4) {
      var name = document.getElementById('estimateName');
      var phone = document.getElementById('estimatePhone');
      var email = document.getElementById('estimateEmail');
      var valid = true;

      [name, email].forEach(function (field) {
        if (!field.value.trim()) {
          field.classList.add('invalid');
          valid = false;
        } else {
          field.classList.remove('invalid');
        }
      });

      if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        email.classList.add('invalid');
        valid = false;
      }

      var errorEl = document.getElementById('step4-error');
      if (!valid) {
        errorEl.classList.remove('hidden');
      } else {
        errorEl.classList.add('hidden');
      }

      return valid;
    }

    return true;
  }

  function calculateEstimate() {
    var projectType = document.querySelector('input[name="projectType"]:checked');
    var timeline = document.querySelector('input[name="timeline"]:checked');
    var sqft = sqftSlider ? parseInt(sqftSlider.value, 10) : 1000;

    if (!projectType || !timeline) return;

    var rate = BASE_RATES[projectType.value] || 100;
    var multiplier = TIMELINE_MULTIPLIERS[timeline.value] || 1.0;

    var baseEstimate = sqft * rate * multiplier;
    var lowEstimate = Math.round(baseEstimate * 0.8);
    var highEstimate = Math.round(baseEstimate * 1.2);

    function formatDollars(n) {
      return '$' + n.toLocaleString('en-CA', { maximumFractionDigits: 0 });
    }

    var rangeEl = document.getElementById('estimateRange');
    if (rangeEl) {
      rangeEl.textContent = formatDollars(lowEstimate) + ' – ' + formatDollars(highEstimate);
    }
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (validateStep(currentStep)) {
        if (currentStep < totalSteps) {
          goToStep(currentStep + 1);
        }
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      if (currentStep > 1) {
        goToStep(currentStep - 1);
      }
    });
  }

  if (estimatorForm) {
    estimatorForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (validateStep(4)) {
        // Hide form, show thank you
        estimatorForm.classList.add('hidden');
        if (thankYouMessage) {
          thankYouMessage.classList.remove('hidden');
        }
      }
    });
  }

  // Remove invalid class on input
  document.querySelectorAll('.field-input').forEach(function (input) {
    input.addEventListener('input', function () {
      this.classList.remove('invalid');
    });
  });

  /* ============================================================
     CONTACT FORM
     ============================================================ */
  var contactForm = document.getElementById('contactForm');
  var contactSuccess = document.getElementById('contactSuccess');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('contactName');
      var email = document.getElementById('contactEmail');
      var message = document.getElementById('contactMessage');
      var valid = true;

      [name, email, message].forEach(function (field) {
        if (!field.value.trim()) {
          field.classList.add('invalid');
          valid = false;
        } else {
          field.classList.remove('invalid');
        }
      });

      if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        email.classList.add('invalid');
        valid = false;
      }

      if (valid) {
        var submitButton = contactForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        // Simulate async send
        setTimeout(function () {
          if (contactSuccess) {
            contactSuccess.classList.remove('hidden');
          }
          contactForm.reset();
          submitButton.disabled = false;
          submitButton.innerHTML = 'Send Message <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
        }, 800);
      }
    });
  }

});
