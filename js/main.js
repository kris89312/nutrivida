/* ==============================
   NUTRIVIDA — main.js
   ============================== */

document.addEventListener('DOMContentLoaded', () => {

  // ── Header scroll shadow ──────────────────────────
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  // ── Mobile menu ───────────────────────────────────
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
      const spans = hamburger.querySelectorAll('span');
      mobileNav.classList.contains('open')
        ? (spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)',
           spans[1].style.opacity = '0',
           spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)')
        : (spans[0].style.transform = '',
           spans[1].style.opacity = '',
           spans[2].style.transform = '');
    });
    // Close on link click
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      });
    });
  }

  // ── Scroll reveal ─────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), e.target.dataset.delay || 0);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach((el, i) => io.observe(el));
  }

  // ── Counter animation ─────────────────────────────
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCount(e.target);
          cio.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => cio.observe(c));
  }

  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const step = 16;
    const increment = target / (duration / step);
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = (Number.isInteger(target) ? Math.floor(current) : current.toFixed(1)) + suffix;
    }, step);
  }

  // ── FAQ accordion ─────────────────────────────────
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  // ── Active nav link (smooth highlight) ───────────
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav a');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 100) current = sec.id;
    });
    navLinks.forEach(a => {
      a.style.color = a.getAttribute('href') === `#${current}` ? 'var(--green-main)' : '';
    });
  });

  // ── Dato curiosos counter (triggered on scroll) ───
  const datos = document.querySelectorAll('.dato-num[data-count]');
  if (datos.length) {
    const dio = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { animateCount(e.target); dio.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    datos.forEach(d => dio.observe(d));
  }

});
