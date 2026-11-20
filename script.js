/* Portfolio — Esteban Laurent
   Tout le contenu reste lisible sans JS : ce script ne fait qu'ajouter de la vie. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';
  if (hasGsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Navigation : burger, masquage au scroll, progression ---------- */
  var nav = document.querySelector('.navbar');
  var wrap = document.querySelector('.site-nav');
  var toggle = document.querySelector('.nav-toggle');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  var bar = document.querySelector('.scroll-progress');
  var lastY = window.scrollY, ticking = false;
  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar && max > 0) bar.style.transform = 'scaleX(' + Math.min(1, y / max) + ')';
    if (wrap) {
      var menuOpen = nav && nav.classList.contains('open');
      if (y > lastY + 6 && y > 160 && !menuOpen) wrap.classList.add('is-hidden');
      else if (y < lastY - 6 || y < 160) wrap.classList.remove('is-hidden');
    }
    lastY = y; ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Halo qui suit la souris (cartes + lueur globale) ---------- */
  if (fine) {
    var glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    var gx = 0, gy = 0, tx = 0, ty = 0, started = false;
    window.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!started) { started = true; gx = tx; gy = ty; glow.classList.add('on'); loop(); }
    }, { passive: true });
    function loop() {
      gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
      glow.style.transform = 'translate3d(' + gx + 'px,' + gy + 'px,0)';
      requestAnimationFrame(loop);
    }
    document.addEventListener('mousemove', function (e) {
      var c = e.target.closest && e.target.closest('.card, .stage-card, .news-item, .bornage-card, .mise-en-oeuvre-card');
      if (!c) return;
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  /* ---------- Certifications : afficher / masquer les preuves ---------- */
  document.querySelectorAll('button[data-target]').forEach(function (btn) {
    var gal = document.querySelector('[data-gallery="' + btn.getAttribute('data-target') + '"]');
    if (!gal) return;
    var label = btn.innerHTML;
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function () {
      var hidden = gal.classList.toggle('hidden');
      btn.setAttribute('aria-expanded', hidden ? 'false' : 'true');
      btn.innerHTML = hidden ? label : '<i class="fas fa-eye-slash"></i> Masquer les preuves';
      btn.closest('.certif-card').classList.toggle('wide-open', !hidden);
    });
  });

  /* ---------- Veille : pagination des actualités ---------- */
  var news = document.getElementById('news-container');
  var pager = document.querySelector('.pagination-container');
  if (news && pager) {
    var items = Array.prototype.slice.call(news.querySelectorAll('.news-item'));
    var pages = items.reduce(function (m, el) { return Math.max(m, +el.dataset.page || 1); }, 1);
    var show = function (p) {
      items.forEach(function (el) { el.style.display = (+el.dataset.page === p) ? '' : 'none'; });
      pager.querySelectorAll('.page-btn').forEach(function (b) {
        var on = +b.dataset.p === p;
        b.classList.toggle('active', on);
        b.setAttribute('aria-current', on ? 'page' : 'false');
      });
      if (hasGsap && !reduce) {
        var vis = items.filter(function (el) { return +el.dataset.page === p; });
        gsap.fromTo(vis, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .6, stagger: .06, ease: 'power3.out', clearProps: 'transform,opacity' });
      }
    };
    if (pages > 1) {
      for (var i = 1; i <= pages; i++) {
        var b = document.createElement('button');
        b.className = 'page-btn'; b.type = 'button'; b.dataset.p = i; b.textContent = i;
        b.setAttribute('aria-label', 'Page ' + i);
        b.addEventListener('click', (function (n) { return function () {
          show(n);
          news.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        }; })(i));
        pager.appendChild(b);
      }
    }
    show(1);
  }

  /* ---------- Accueil : réseau de particules (canvas) ---------- */
  var cv = document.getElementById('net');
  if (cv && !reduce) {
    var ctx = cv.getContext('2d'), W, H, pts = [], mouse = { x: -999, y: -999 }, running = true;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    function size() {
      var r = cv.getBoundingClientRect(); W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(90, (W * H) / 15000));
      pts = [];
      for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25, r: Math.random() * 1.4 + .6 });
    }
    size();
    window.addEventListener('resize', size);
    cv.parentElement.addEventListener('mousemove', function (e) {
      var r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    cv.parentElement.addEventListener('mouseleave', function () { mouse.x = mouse.y = -999; });
    new IntersectionObserver(function (en) { running = en[0].isIntersecting; if (running) draw(); }).observe(cv);
    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        var dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 140) { p.x += dx / d * 0.9; p.y += dy / d * 0.9; }
        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j], ex = p.x - q.x, ey = p.y - q.y, ed = ex * ex + ey * ey;
          if (ed < 15000) {
            ctx.strokeStyle = 'rgba(212,245,92,' + (0.16 * (1 - ed / 15000)) + ')';
            ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        ctx.fillStyle = d < 140 ? 'rgba(212,245,92,.95)' : 'rgba(230,235,240,.45)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ---------- Carte « code » : inclinaison 3D ---------- */
  var card3d = document.querySelector('.code-card');
  if (card3d && fine && hasGsap && !reduce) {
    var host = card3d.parentElement;
    host.addEventListener('mousemove', function (e) {
      var r = host.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      gsap.to(card3d, { rotationY: x * 10, rotationX: -y * 10, transformPerspective: 900, duration: .6, ease: 'power3.out' });
    });
    host.addEventListener('mouseleave', function () { gsap.to(card3d, { rotationY: 0, rotationX: 0, duration: .8, ease: 'power3.out' }); });
  }

  /* ---------- Boutons magnétiques ---------- */
  if (fine && hasGsap && !reduce) {
    document.querySelectorAll('.hero-cta a, .nav-cta, .contact-cta a').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .35, duration: .4, ease: 'power3.out' });
      });
      el.addEventListener('mouseleave', function () { gsap.to(el, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1,.4)' }); });
    });
  }

  /* ---------- Animations GSAP (entrée + scroll) ---------- */
  if (!hasGsap || reduce) return;
  var mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', function () {

    // Hero
    if (document.querySelector('.hero')) {
      gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } })
        .from('.hero .status-chip', { y: 16, opacity: 0, duration: .7 })
        .from('.hero h1 .ligne', { yPercent: 115, stagger: .12 }, '-=.4')
        .from('.hero .lead', { y: 22, opacity: 0 }, '-=.6')
        .from('.hero-cta > *', { y: 22, opacity: 0, stagger: .08, clearProps: 'transform,opacity' }, '-=.7')
        .from('.code-card', { y: 40, opacity: 0, rotationX: 8, duration: 1.2 }, '-=1')
        .from('.code-card .ln', { opacity: 0, x: -10, stagger: .04, duration: .5 }, '-=.6')
        .from('.scroll-hint', { opacity: 0 }, '-=.4');
      gsap.to('.hero-inner', { yPercent: -8, opacity: .25, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    }

    // En-têtes des sous-pages
    gsap.from('.page-hero > *', { y: 30, opacity: 0, duration: .9, stagger: .1, ease: 'power3.out', clearProps: 'transform,opacity' });
    gsap.from('.detail-page .detail-hero', { y: 24, opacity: 0, duration: .8, ease: 'power3.out', clearProps: 'transform,opacity' });

    // Apparition au scroll, par lots (cascade)
    var sel = '.card, .stage-card, .news-item, .detail-section, .info-pill, .stat, .tl-item, .resume-bloc, .contact-cta, .competence-group > h3, section > h2, .btn-retour, .interets li';
    var els = gsap.utils.toArray(sel).filter(function (el) { return !el.closest('.hero') && !el.closest('.page-hero') && !el.closest('.tl-item .card'); });
    gsap.set(els, { willChange: 'transform, opacity' });
    ScrollTrigger.batch(els, {
      start: 'top 90%', once: true,
      onEnter: function (b) {
        gsap.fromTo(b, { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: .9, ease: 'power3.out', stagger: .08, overwrite: true, clearProps: 'transform,opacity,willChange' });
      }
    });
    // Évite le flash : on masque les éléments sous le pli avant l'apparition
    els.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top > window.innerHeight * .9 && getComputedStyle(el).display !== 'none') gsap.set(el, { opacity: 0, y: 36 });
    });

    // Compteurs
    gsap.utils.toArray('[data-count]').forEach(function (el) {
      var end = parseFloat(el.dataset.count), o = { v: 0 };
      el.textContent = '0';
      ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: function () {
        gsap.to(o, { v: end, duration: 1.8, ease: 'power2.out', onUpdate: function () { el.textContent = Math.round(o.v); } });
      } });
    });

    // Ligne de la timeline
    var line = document.querySelector('.tl-line');
    if (line) gsap.to(line, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 60%', scrub: .6 } });

    // Parallaxe douce sur les titres de section de l'accueil
    gsap.utils.toArray('.work-card .n').forEach(function (el) {
      gsap.to(el, { y: -14, ease: 'none', scrollTrigger: { trigger: el, scrub: true } });
    });
  });
})();
