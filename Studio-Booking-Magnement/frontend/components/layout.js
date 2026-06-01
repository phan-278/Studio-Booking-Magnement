
// layout.js - Slideshow, Reveal, Nav, Marquee
/* ==========
   2. HERO SLIDESHOW
================================================================ */
(function initSlideshow() {
  const slides   = document.querySelectorAll('.slide');
  const dotsWrap = document.getElementById('slideDots');
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
  hero.addEventListener('mouseenter', () => clearInterval(timer));
  hero.addEventListener('mouseleave', resetTimer);
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



