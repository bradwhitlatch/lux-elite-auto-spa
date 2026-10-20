/* ============================================================
   LUX ELITE AUTO SPA — script.js
   Scroll effects, nav behavior, mobile menu, form handling
   ============================================================ */

(function () {
  'use strict';

  /* ── NAV SCROLL BEHAVIOR ───────────────────────────────────── */
  const nav = document.getElementById('nav');
  let lastScrollY = 0;

  function handleNavScroll() {
    const scrollY = window.scrollY;

    if (scrollY > 80) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }

    lastScrollY = scrollY;
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // run on init

  /* ── MOBILE MENU ───────────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  const mobileCta = document.querySelector('.mobile-cta');

  function openMenu() {
    hamburger.classList.add('open');
    mobileMenu.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    if (mobileMenu.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  if (hamburger) {
    hamburger.addEventListener('click', toggleMenu);
  }

  // Close on link click
  mobileLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });
  if (mobileCta) {
    mobileCta.addEventListener('click', closeMenu);
  }

  // Close on escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeMenu();
    }
  });

  /* ── SCROLL REVEAL ─────────────────────────────────────────── */
  const revealItems = document.querySelectorAll('.scroll-reveal');
  const heroItems = document.querySelectorAll('.reveal-item');

  // Trigger hero items immediately (staggered via CSS delays)
  setTimeout(function () {
    heroItems.forEach(function (item) {
      item.classList.add('visible');
    });
  }, 100);

  // IntersectionObserver for all other scroll-reveal elements
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            // Stagger children within a visible parent
            const siblings = entry.target.parentElement
              ? Array.from(entry.target.parentElement.querySelectorAll('.scroll-reveal'))
              : [];
            const idx = siblings.indexOf(entry.target);
            const delay = Math.min(idx * 80, 400);

            setTimeout(function () {
              entry.target.classList.add('visible');
            }, delay);

            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -60px 0px',
      }
    );

    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  } else {
    // Fallback: show all immediately
    revealItems.forEach(function (item) {
      item.classList.add('visible');
    });
  }

  /* ── SMOOTH SCROLL FOR ANCHOR LINKS ───────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = nav ? nav.offsetHeight + 16 : 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* ── CONTACT FORM ──────────────────────────────────────────── */
  const form = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Basic validation
      const required = form.querySelectorAll('[required]');
      let valid = true;

      required.forEach(function (field) {
        if (!field.value.trim()) {
          valid = false;
          field.style.borderColor = 'rgba(224, 72, 72, 0.6)';
          field.addEventListener('input', function () {
            field.style.borderColor = '';
          }, { once: true });
        }
      });

      if (!valid) return;

      // Real form submission via Web3Forms
      const submitBtn = form.querySelector('[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending…';
      submitBtn.disabled = true;

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      // Add Web3Forms access key (free tier — luxeliteautospa@gmail.com)
      data.access_key = '87f21257-6502-478a-8eb7-ed67b5df4736';
      data.subject = 'New Booking Request – Lux Elite Auto Spa';
      data.from_name = data.name || 'Website Visitor';

      // Submit 1: email to bradwhitlatch@gmail.com
      var emailSubmit = fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (res) { return res.json(); });

      // Submit 2: SMS to 7023031925@vtext.com (Verizon)
      var smsData = Object.assign({}, data);
      smsData.email = '7023031925@vtext.com';
      smsData.subject = 'NEW BOOKING: ' + (data.name || 'Customer') + ' — ' + (data.service || '') + ' — ' + (data.phone || '');
      smsData.message = 'Name: ' + (data.name || '') + '\nPhone: ' + (data.phone || '') + '\nService: ' + (data.service || '') + '\nVehicle: ' + (data.vehicle || '') + '\nDate: ' + (data.date || '') + '\nLocation: ' + (data.location || '');
      var smsSubmit = fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(smsData)
      }).then(function (res) { return res.json(); });

      Promise.all([emailSubmit, smsSubmit])
      .then(function (results) {
        if (results[0].success) {
          submitBtn.style.display = 'none';
          if (formSuccess) {
            formSuccess.classList.add('visible');
            formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        } else {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          alert('There was a problem sending your request. Please call us at 702-303-1925.');
        }
      })
      .catch(function () {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        alert('There was a problem sending your request. Please call us at 702-303-1925.');
      });
    });
  }

  /* ── SERVICE CARD HOVER DEPTH ──────────────────────────────── */
  // Add subtle parallax-like tilt on desktop
  const serviceCards = document.querySelectorAll('.service-card');

  if (window.matchMedia('(hover: hover)').matches) {
    serviceCards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = 'translateY(-6px) rotateX(' + (-y * 4) + 'deg) rotateY(' + (x * 4) + 'deg)';
        card.style.transition = 'transform 0.1s ease';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        card.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
      });
    });
  }

  /* ── PHONE NUMBER CLICK TRACKING (analytics hook) ─────────── */
  document.querySelectorAll('a[href="tel:7023031925"]').forEach(function (link) {
    link.addEventListener('click', function () {
      // Analytics hook — replace with gtag/fbq/etc as needed
      // Example: gtag('event', 'phone_call', { event_category: 'contact' });
      console.info('[Lux Elite] Phone call initiated from:', link.closest('[class]') ? link.closest('[class]').className : 'unknown');
    });
  });

  /* ── ACTIVE NAV LINK HIGHLIGHT (scroll spy) ────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__links a[href^="#"]');

  function updateActiveNavLink() {
    const scrollMid = window.scrollY + window.innerHeight / 3;

    sections.forEach(function (section) {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollMid >= top && scrollMid < bottom) {
        navLinks.forEach(function (link) {
          link.style.color = '';
          if (link.getAttribute('href') === '#' + id) {
            link.style.color = 'var(--color-gold)';
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNavLink, { passive: true });

})();
