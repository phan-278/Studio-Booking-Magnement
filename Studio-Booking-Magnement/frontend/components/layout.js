// layout.js - Slideshow, Reveal, Nav, Marquee, Sidebar

/* ==========
   1. SIDEBAR — smooth expand/collapse, logo resize
================================================================ */
(function initSidebar() {
  // Wait for sidebar to be injected by main.js
  function setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    // Prevent flash of un-transitioned state on first load
    requestAnimationFrame(() => {
      sidebar.style.transition = 'none';
      // Force collapsed state paint, then re-enable transitions
      requestAnimationFrame(() => {
        sidebar.style.transition = '';
      });
    });

    // Optional: click-to-pin on mobile or touch devices
    let pinned = false;
    const toggleBtn = document.getElementById('sidebarToggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        pinned = !pinned;
        sidebar.classList.toggle('open', pinned);
        toggleBtn.setAttribute('aria-expanded', pinned);
      });
    }

    // Close pinned sidebar when clicking outside (mobile)
    document.addEventListener('click', (e) => {
      if (pinned && !sidebar.contains(e.target) && e.target !== toggleBtn) {
        pinned = false;
        sidebar.classList.remove('open');
      }
    });
  }

  // If sidebar already in DOM, set it up immediately
  if (document.getElementById('sidebar')) {
    setupSidebar();
  } else {
    // Sidebar is loaded async by main.js — observe for it
    const mo = new MutationObserver(() => {
      if (document.getElementById('sidebar')) {
        mo.disconnect();
        setupSidebar();
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }
})();



/* ==========
   2. HERO SLIDESHOW
================================================================ */
(function initSlideshow() {
  function setup() {
    const slides   = document.querySelectorAll('.slide');
    const dotsWrap = document.getElementById('slideDots');
    if (!slides.length || !dotsWrap) return;

    let current = 0;
    let timer;

    slides.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'slide-dot' + (i === 0 ? ' active' : '');
      d.onclick = () => { goSlide(i); resetTimer(); };
      dotsWrap.appendChild(d);
    });

    function goSlide(n) {
      slides[current].classList.remove('active');
      dotsWrap.children[current].classList.remove('active');
      current = (n + slides.length) % slides.length;
      slides[current].classList.add('active');
      dotsWrap.children[current].classList.add('active');
    }

    function resetTimer() {
      clearInterval(timer);
      timer = setInterval(() => goSlide(current + 1), 5000);
    }

    resetTimer();
    window.nextSlide = () => { goSlide(current + 1); resetTimer(); };
    window.prevSlide = () => { goSlide(current - 1); resetTimer(); };

    const hero = document.querySelector('.hero');
    if (hero) {
      hero.addEventListener('mouseenter', () => clearInterval(timer));
      hero.addEventListener('mouseleave', resetTimer);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();



/* ==========
   3. SCROLL REVEAL + 3D TILT
================================================================ */
(function initReveal() {
  const els = document.querySelectorAll('.reveal-up');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const siblings = entry.target.parentElement.querySelectorAll('.reveal-up');
      siblings.forEach((sib, i) => {
        if (!sib.classList.contains('visible')) {
          setTimeout(() => sib.classList.add('visible'), i * 90);
        }
      });
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  els.forEach(el => obs.observe(el));

  setTimeout(() => {
    document.querySelectorAll('.hero .reveal-up').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), 300 + i * 150);
    });
  }, 100);
})();

(function init3DTilt() {
  document.querySelectorAll('.studio-card, .zone-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const rx = -((e.clientY - r.top)  / r.height - 0.5) * 7;
      const ry =  ((e.clientX - r.left) / r.width  - 0.5) * 7;
      card.style.transform  = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.01)`;
      card.style.transition = 'transform 0.1s';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform  = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
      card.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
    });
  });
})();



/* ==========
   4. NAVIGATION
================================================================ */
(function initNav() {
  const links = document.querySelectorAll('.nav-link');
  const secs  = document.querySelectorAll('section[id]');

  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  window.addEventListener('scroll', () => {
    let active = '';
    secs.forEach(s => {
      if (window.scrollY >= s.offsetTop - 220) active = s.id;
    });
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + active));
  });
})();



/* ==========
   5. MARQUEE
================================================================ */
(function initMarquee() {
  const mq = document.querySelector('.marquee-track');
  if (!mq) return;
  mq.addEventListener('mouseenter', () => mq.style.animationPlayState = 'paused');
  mq.addEventListener('mouseleave', () => mq.style.animationPlayState = 'running');
})();