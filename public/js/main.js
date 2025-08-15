// active JS
document.documentElement.classList.add('js');

// GSAP guard
try { gsap; } catch (e) {
  document.querySelectorAll('.reveal-from-bottom, .reveal-from-left, .reveal-from-right')
    .forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
  console.warn('GSAP not loaded. Showing content without animations.');
  throw e;
}

//GSAP plugins
gsap.registerPlugin(ScrollTrigger, Flip, TextPlugin);

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let motionEnabled = !prefersReduced;

/*just in case*/
function forceVisible(scope = document) {
  scope.querySelectorAll('.reveal-from-bottom, .reveal-from-left, .reveal-from-right')
    .forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
}
forceVisible();
addEventListener('DOMContentLoaded', () => forceVisible());
addEventListener('load', () => forceVisible());

/*Progress + Chip*/
function wireProgress() {
  const bar = document.querySelector('.progress-bar');
  const chip = document.querySelector('.chip');
  if (bar) {
    gsap.set(bar, { scaleX: 0, transformOrigin: 'left center' });
    ScrollTrigger.create({
      start: 0,
      end: () => document.documentElement.scrollHeight - innerHeight,
      onUpdate: self => gsap.to(bar, { scaleX: self.progress, overwrite: true, duration: 0.08, ease: 'none' })
    });
  }
  if (chip) {
    ScrollTrigger.create({
      start: 0,
      end: () => document.documentElement.scrollHeight - innerHeight,
      onUpdate: self => chip.textContent = `${Math.round(self.progress * 100)} %`
    });
  }
}

/*Hero Banner*/
function wireHeroBanner() {
  const headerEl = document.querySelector('.site-header');
  const bannerEl = document.querySelector('#chapter1 .gsap-banner');
  if (!bannerEl) return;

  function place() {
    const hHeader = headerEl?.offsetHeight || 0;
    const hBanner = bannerEl?.offsetHeight || 0;
    const compact = matchMedia('(max-width: 600px)').matches ? 0.55 : 1;
    document.documentElement.style.setProperty('--hero-banner-top', `${hHeader}px`);
    document.documentElement.style.setProperty('--banner-h', `${Math.round(hBanner * compact)}px`);
    ScrollTrigger.refresh();
  }
  place();
  addEventListener('resize', place);
  addEventListener('load', place);

  if (!motionEnabled) return;

  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    scrollTrigger: { trigger: '#chapter1', start: 'top 95%', once: true }
  });

  tl.set(bannerEl, { opacity: 1 })
    .from(bannerEl, {
      y: -80, scale: 0.85, rotationX: 35, skewY: -6,
      duration: 0.9, ease: 'back.out(1.8)'
    })
    .to(bannerEl, { backgroundPositionX: '100%', duration: 1.0, ease: 'power1.inOut' }, '<0.1')
    .add(() => bannerEl.classList.add('is-glow'))
    .to(bannerEl, { scale: 1.03, duration: 0.25, yoyo: true, repeat: 1, ease: 'sine.inOut' })
    .add(() => bannerEl.classList.remove('is-glow'));

  function runShine() {
    gsap.set(bannerEl, {'--shine-x': '-120%'});
    gsap.to(bannerEl, {'--shine-x': '120%', duration: 0.8, ease: 'power2.out'});
  }
  tl.add(runShine, '>-0.2');

  const pulse = gsap.to(bannerEl, {
    duration: 1.4, yoyo: true, repeat: -1, paused: true,
    boxShadow: '0 16px 36px rgba(0,0,0,.28)',
    onUpdate: () => bannerEl.classList.toggle('is-glow', (Math.sin(performance.now()/300) > 0))
  });
  const travel = gsap.to(bannerEl, { backgroundPositionX: '200%', duration: 5, ease: 'none', repeat: -1, paused: true });
  const flicker = gsap.timeline({ repeat: -1, paused: true })
    .to(bannerEl, { opacity: 0.9, duration: 0.04 }, '+=1.8')
    .to(bannerEl, { opacity: 1.0, duration: 0.05 })
    .to(bannerEl, { opacity: 0.94, duration: 0.03 }, '+=1.2')
    .to(bannerEl, { opacity: 1.0, duration: 0.04 });

  function shineLoop() {
    runShine();
    if (ScrollTrigger.isInViewport(document.querySelector('#chapter1'), 0.1)) {
      gsap.delayedCall(2.0, shineLoop);
    }
  }
  ScrollTrigger.create({
    trigger: '#chapter1',
    start: 'top 92%',
    end: 'bottom 10%',
    onEnter: () => { pulse.play(); travel.play(); flicker.play(); shineLoop(); },
    onEnterBack: () => { pulse.play(); travel.play(); flicker.play(); shineLoop(); },
    onLeave: () => { pulse.pause(); travel.pause(); flicker.pause(); },
    onLeaveBack: () => { pulse.pause(); travel.pause(); flicker.pause(); }
  });
}

/*Compare*/
function wireCompare() {
  if (!motionEnabled) return;

  gsap.from('#chapter1 .css-box', {
    x: -80, opacity: 0, duration: 0.6, ease: 'power2.out',
    scrollTrigger: { trigger: '#chapter1 .css-box', start: 'top 90%', once: true }
  });

  gsap.from('#chapter1 .gsap-box', {
    x: 80, opacity: 0, duration: 0.6, ease: 'power2.out',
    scrollTrigger: { trigger: '#chapter1 .gsap-box', start: 'top 90%', once: true }
  });

  gsap.to('#chapter1 .gsap-box', {
    scale: 1.06, repeat: 1, yoyo: true, duration: 0.35, ease: 'power1.inOut',
    scrollTrigger: { trigger: '#chapter1 .gsap-box', start: 'top 80%', once: true }
  });
}

/*Callouts*/
function wireCallouts() {
  if (!motionEnabled) return;

  gsap.utils.toArray('.callout blockquote').forEach((q) => {
    const original = q.textContent;
    q.textContent = '';

    ScrollTrigger.create({
      trigger: q,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.to(q, { text: original, duration: 0.9, ease: 'none' });
      }
    });
  });
}

/*Pin code cards*/
function wirePinning() {
  ScrollTrigger.matchMedia({
    '(min-width: 900px)': function () {
      ScrollTrigger.create({
        trigger: '#chapter2 .pin-wrap',
        start: 'top 15%',
        end: 'bottom 60%',
        pin: '#chapter2 .pin-target',
        pinSpacing: true,
        anticipatePin: 1,
        enabled: motionEnabled
      });
      ScrollTrigger.create({
        trigger: '#chapter3 .pin-wrap',
        start: 'top 15%',
        end: 'bottom 60%',
        pin: '#chapter3 .pin-target',
        pinSpacing: true,
        anticipatePin: 1,
        enabled: motionEnabled
      });
    }
  });
}

/*Demo dots */
function wireDemoDots() {
  const btn = document.getElementById('btn-demo');
  if (!btn || !motionEnabled) return;
  const tl = gsap.timeline({ defaults: { duration: 0.45, ease: 'power1.out' } });
  btn.addEventListener('click', () => {
    tl.clear()
      .from('.demo-one', { y: 14, opacity: 0 })
      .from('.demo-two', { x: -14, opacity: 0 }, '<0.12')
      .from('.demo-three', { scale: 0.88, opacity: 0 }, '<0.12');
  });
}

/*Icons*/
function wireChapter4Icons() {
  if (!motionEnabled) return;
  gsap.from('#chapter4 .icon', {
    scrollTrigger: { trigger: '#chapter4 .icon-grid', start: 'top 90%', once: true },
    opacity: 0, y: 16, stagger: { each: 0.05, from: 'edges' }, duration: 0.35, ease: 'power1.out'
  });
}

/*Flip Grid*/
function wireFlip() {
  const grid = document.getElementById('flip-grid');
  const btnShuffle = document.getElementById('flip-shuffle');
  const btnSort = document.getElementById('flip-sort');
  if (!grid) return;

  const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);
  const sortAZ = (a, b) => a.dataset.key.localeCompare(b.dataset.key);

  function flipTo(orderFn) {
    const items = Array.from(grid.children);
    const state = Flip.getState(items);
    orderFn(items);
    items.forEach(el => grid.appendChild(el));
    Flip.from(state, {
      duration: motionEnabled ? 0.45 : 0,
      ease: 'power1.inOut',
      stagger: motionEnabled ? 0.025 : 0
    });
  }

  btnShuffle?.addEventListener('click', () => flipTo(items => shuffle(items)));
  btnSort?.addEventListener('click', () => flipTo(items => items.sort(sortAZ)));
}

/*Counters*/
function wireCounters() {
  gsap.utils.toArray('#chapter7 .num').forEach(num => {
    const target = +num.dataset.target;
    ScrollTrigger.create({
      trigger: '#chapter7',
      start: 'top 90%',
      once: true,
      onEnter: () => {
        if (motionEnabled) {
          gsap.fromTo(num, { innerText: 0 }, {
            innerText: target, duration: 0.9, ease: 'power1.out', snap: { innerText: 1 }
          });
        } else {
          num.textContent = target;
        }
      }
    });
  });
}

/*Badge + Confetti*/
function wireConfetti() {
  const badge = document.getElementById('badge');
  const claimBtn = document.getElementById('claim-badge');
  if (!claimBtn || !badge) return;

  function confetti() {
    if (!motionEnabled) return;
    const burst = document.createElement('div');
    Object.assign(burst.style, { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 });
    document.body.appendChild(burst);
    const pieces = 48;
    for (let i = 0; i < pieces; i++) {
      const dot = document.createElement('span');
      Object.assign(dot.style, {
        position: 'absolute', left: '50%', top: '50%',
        width: `${gsap.utils.random(6, 10)}px`, height: `${gsap.utils.random(6, 10)}px`,
        background: `hsl(${gsap.utils.random(0,360)}, 80%, 60%)`,
        borderRadius: '2px', transform: 'translate(-50%, -50%)'
      });
      burst.appendChild(dot);
      gsap.to(dot, {
        x: gsap.utils.random(-220, 220),
        y: gsap.utils.random(-240, 80),
        rotation: gsap.utils.random(-180, 180),
        duration: gsap.utils.random(0.7, 1.2),
        ease: 'power2.out',
        onComplete: () => dot.remove()
      });
    }
    gsap.to(burst, { opacity: 0, duration: 1.2, delay: 0.15, onComplete: () => burst.remove() });
  }

  claimBtn.addEventListener('click', () => {
    gsap.to(badge, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.7)' });
    confetti();
  });
}

/*Smooth anchors*/
function wireAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: motionEnabled ? 'smooth' : 'auto', block: 'start' });
      }
    });
  });
}

/*Init*/
(function init() {
  wireProgress();
  wireHeroBanner();
  wireCompare();
  wirePinning();
  wireDemoDots();
  wireChapter4Icons();
  wireFlip();
  wireCounters();
  wireConfetti();
  wireCallouts();   
  wireAnchors();

  // just in case
  addEventListener('load', () => setTimeout(() => ScrollTrigger.refresh(), 80));
})();
