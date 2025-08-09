// register gsap plugins
gsap.registerPlugin(ScrollTrigger, Flip, TextPlugin);

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let motionEnabled = !prefersReduced;

// progress bar
const progressEl = document.querySelector('.progress-bar');
if (progressEl) {
  gsap.set(progressEl, { scaleX: 0 });
  ScrollTrigger.create({
    start: 0,
    end: () => document.documentElement.scrollHeight - window.innerHeight,
    onUpdate: self => gsap.to(progressEl, { scaleX: self.progress, overwrite: true, duration: 0.08, ease: 'none' })
  });
}

// chapter chip (percent read)
const chip = document.querySelector('.chip');
if (chip) {
  ScrollTrigger.create({
    start: 0,
    end: () => document.documentElement.scrollHeight - window.innerHeight,
    onUpdate: self => chip.textContent = `${Math.round(self.progress * 100)} percent`
  });
}

// generic reveals
const reveal = (selector) => {
  if (!motionEnabled) return;
  gsap.utils.toArray(selector).forEach((el) => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
      opacity: 0,
      y: el.classList.contains('reveal-from-bottom') ? 30 : 0,
      x: el.classList.contains('reveal-from-left') ? -30 : el.classList.contains('reveal-from-right') ? 30 : 0,
      duration: 0.9, ease: 'power2.out'
    });
  });
};
reveal('.reveal-from-bottom'); reveal('.reveal-from-left'); reveal('.reveal-from-right');

// Chapter 1: compare boxes
if (motionEnabled) {
  gsap.from('#chapter1 .css-box', { x: -80, opacity: 0, duration: 0.8, ease: 'power2.out', scrollTrigger: '#chapter1' });
  gsap.from('#chapter1 .gsap-box', { x: 80, opacity: 0, duration: 0.8, ease: 'power2.out', scrollTrigger: '#chapter1', delay: 0.1 });
  gsap.to('#chapter1 .gsap-box', { scale: 1.06, repeat: 1, yoyo: true, duration: 0.4, ease: 'power1.inOut', scrollTrigger: { trigger: '#chapter1 .gsap-box', start: 'top 80%' }});
}

// Chapter 2: button drives a tiny timeline on dots
const btn = document.getElementById('btn-demo');
if (btn && motionEnabled) {
  const tl = gsap.timeline({ defaults: { duration: 0.5, ease: 'power2.out' }});
  btn.addEventListener('click', () => {
    tl.clear()
      .from('.demo-one', { y: 18, opacity: 0 })
      .from('.demo-two', { x: -18, opacity: 0 }, '<0.15')
      .from('.demo-three', { scale: 0.8, opacity: 0 }, '<0.15');
  });
}

// Chapter 3: pinned visual and step text
ScrollTrigger.matchMedia({
  '(min-width: 900px)': function() {
    ScrollTrigger.create({
      trigger: '#chapter3 .pin-wrap',
      start: 'top 15%',
      end: 'bottom 60%',
      pin: '#chapter3 .pin-target',
      pinSpacing: false,
      anticipatePin: 1,
      enabled: motionEnabled
    });
  }
});
if (motionEnabled) {
  gsap.utils.toArray('#chapter3 .step').forEach((s, i) => {
    gsap.from(s, {
      scrollTrigger: { trigger: s, start: 'top 85%' },
      opacity: 0, x: 24, duration: 0.7, ease: 'power2.out', delay: i * 0.05
    });
  });
}

// Chapter 4: stagger icons
if (motionEnabled) {
  gsap.from('#chapter4 .icon', {
    scrollTrigger: { trigger: '#chapter4 .icon-grid', start: 'top 80%' },
    opacity: 0, y: 24, stagger: { each: 0.06, from: 'edges' }, duration: 0.5, ease: 'power2.out'
  });
}

// Chapter 5: Flip shuffle/sort
const grid = document.getElementById('flip-grid');
const btnShuffle = document.getElementById('flip-shuffle');
const btnSort = document.getElementById('flip-sort');

const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);
const sortAZ = (arr) => arr.sort((a, b) => a.dataset.key.localeCompare(b.dataset.key));

function flipTo(orderFn) {
  const items = Array.from(grid.children);
  const state = Flip.getState(items);
  orderFn(items);
  items.forEach(el => grid.appendChild(el));
  Flip.from(state, { duration: motionEnabled ? 0.5 : 0, ease: 'power2.inOut', stagger: motionEnabled ? 0.03 : 0 });
}
btnShuffle?.addEventListener('click', () => flipTo(shuffle));
btnSort?.addEventListener('click', () => flipTo(sortAZ));

// Chapter 6: motion toggle demo (visual pulse)
const screens = document.querySelectorAll('.screen');
const pulseScreens = () => gsap.fromTo(screens, { scale: 0.98 }, { scale: 1, duration: 0.3, ease: 'power1.out' });
document.getElementById('motion-toggle')?.addEventListener('click', () => {
  motionEnabled = !motionEnabled;
  if (motionEnabled) {
    ScrollTrigger.getAll().forEach(st => st.enable());
    pulseScreens();
  } else {
    ScrollTrigger.getAll().forEach(st => st.disable());
  }
});

// Chapter 7: counters + badge + confetti
gsap.utils.toArray('#chapter7 .num').forEach(num => {
  const target = +num.dataset.target;
  ScrollTrigger.create({
    trigger: num, start: 'top 75%', once: true,
    onEnter: () => {
      if (motionEnabled) {
        gsap.fromTo(num, { innerText: 0 }, { innerText: target, duration: 1.1, ease: 'power1.out', snap: { innerText: 1 } });
      } else {
        num.textContent = target;
      }
    }
  });
});

const badge = document.getElementById('badge');
const claimBtn = document.getElementById('claim-badge');

function confetti() {
  if (!motionEnabled) return;
  const burst = document.createElement('div');
  burst.className = 'confetti-burst';
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
      duration: gsap.utils.random(0.8, 1.4),
      ease: 'power2.out',
      onComplete: () => dot.remove()
    });
  }
  gsap.to(burst, { opacity: 0, duration: 1.4, delay: 0.2, onComplete: () => burst.remove() });
}

claimBtn?.addEventListener('click', () => {
  gsap.to(badge, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.7)' });
  confetti();
});

// type-in effect for callout quotes
gsap.utils.toArray('.callout blockquote').forEach((q) => {
  ScrollTrigger.create({
    trigger: q, start: 'top 80%', once: true,
    onEnter: () => {
      const original = q.textContent;
      q.textContent = '';
      gsap.to(q, { text: original, duration: 1.2, ease: 'none' });
    }
  });
});

// smooth in-page links
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
