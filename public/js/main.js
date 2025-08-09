// register plugins
gsap.registerPlugin(ScrollTrigger, Flip, TextPlugin);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

// chapter chip
const chip = document.querySelector('.chip');
if (chip) {
  const panels = gsap.utils.toArray('.panel');
  panels.forEach((p, i) => {
    ScrollTrigger.create({
      trigger: p,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => chip.textContent = `Chapter ${i + 1} of ${panels.length}`,
      onEnterBack: () => chip.textContent = `Chapter ${i + 1} of ${panels.length}`
    });
  });
}

// intro typing and hero
if (!reduceMotion) {
  gsap.to('#type-line', {
    text: 'I started with zero animation knowledge. By day 12 I could build scroll based stories with GSAP.',
    duration: 3.2, ease: 'none', delay: 0.3
  });

  gsap.timeline({ defaults: { ease: 'power2.out', duration: 0.9 } })
    .from('.hero .reveal-from-bottom', { y: 40, opacity: 0, stagger: 0.12 });
}

// generic reveals
const makeReveal = (selector) => {
  if (reduceMotion) return;
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
makeReveal('.reveal-from-bottom');
makeReveal('.reveal-from-left');
makeReveal('.reveal-from-right');

// pinned code block in Discover
ScrollTrigger.matchMedia({
  '(min-width: 900px)': function() {
    ScrollTrigger.create({
      trigger: '#discover .pin-wrap',
      start: 'top 15%',
      end: 'bottom 60%',
      pin: '#discover .pin-target',
      pinSpacing: false,
      anticipatePin: 1
    });
  }
});

// horizontal scroll section
const hSection = document.querySelector('#chapter-h .h-inner');
if (hSection && !reduceMotion) {
  const cards = gsap.utils.toArray('#chapter-h .h-card');
  const totalWidth = () => hSection.scrollWidth - window.innerWidth;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#chapter-h', start: 'top top', end: () => `+=${totalWidth()}`,
      scrub: 1, pin: true, anticipatePin: 1
    }
  });

  tl.to(hSection, { x: () => -totalWidth(), ease: 'none' });

  cards.forEach((card) => {
    gsap.from(card, {
      scale: 0.9, opacity: 0.6,
      scrollTrigger: { trigger: card, containerAnimation: tl, start: 'left center', end: 'right center', scrub: true }
    });
  });

  window.addEventListener('resize', () => ScrollTrigger.refresh());
}

// counters
gsap.utils.toArray('#results .num').forEach(num => {
  const target = +num.dataset.target;
  ScrollTrigger.create({
    trigger: num,
    start: 'top 75%', once: true,
    onEnter: () => {
      gsap.fromTo(num, { innerText: 0 }, { innerText: target, duration: 1.2, ease: 'power1.out', snap: { innerText: 1 } });
    }
  });
});

// FLIP gallery
const cards = gsap.utils.toArray('#gallery .card');
const detail = document.querySelector('#gallery .detail');
const dImg = detail?.querySelector('img');
const dH3 = detail?.querySelector('h3');
const dP  = detail?.querySelector('p');
const dClose = detail?.querySelector('.close');

if (cards.length && detail && dImg && dH3 && dP) {
  const openCard = (card) => {
    const img = card.querySelector('img');
    const state = Flip.getState(img);
    detail.style.display = 'block';
    dImg.src = img.src; dImg.alt = img.alt;
    dH3.textContent = card.dataset.title || '';
    dP.textContent = card.dataset.text || '';
    Flip.from(state, { duration: 0.55, ease: 'power2.inOut', absolute: true });
    gsap.fromTo(detail, { opacity: 0 }, { opacity: 1, duration: 0.25 });
  };

  const closeDetail = () => gsap.to(detail, { opacity: 0, duration: 0.2, onComplete: () => detail.style.display = 'none' });

  cards.forEach(card => card.addEventListener('click', () => openCard(card)));
  dClose?.addEventListener('click', closeDetail);
  detail?.addEventListener('click', (e) => { if (e.target === detail) closeDetail(); });
}

// badge + confetti
const badge = document.getElementById('badge');
const claimBtn = document.getElementById('claim-badge');

const fireConfetti = () => {
  if (reduceMotion) return;
  const burst = document.createElement('div');
  burst.className = 'confetti-burst';
  document.body.appendChild(burst);

  const pieces = 40;
  for (let i = 0; i < pieces; i++) {
    const dot = document.createElement('span');
    dot.className = 'confetti';
    burst.appendChild(dot);
    gsap.set(dot, {
      position: 'absolute', left: '50%', top: '50%',
      width: gsap.utils.random(6, 10), height: gsap.utils.random(6, 10),
      background: `hsl(${gsap.utils.random(0,360)}, 80%, 60%)`,
      borderRadius: 2, xPercent: -50, yPercent: -50
    });
    gsap.to(dot, {
      x: gsap.utils.random(-200, 200),
      y: gsap.utils.random(-220, 60),
      rotation: gsap.utils.random(-180, 180),
      duration: gsap.utils.random(0.8, 1.4),
      ease: 'power2.out',
      onComplete: () => dot.remove()
    });
  }
  gsap.to(burst, { opacity: 0, duration: 1.6, delay: 0.2, onComplete: () => burst.remove() });
};

if (claimBtn && badge) {
  claimBtn.addEventListener('click', () => {
    gsap.to(badge, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.7)' });
    fireConfetti();
  });
}

// smooth anchor jumps
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
  });
});

// keyboard navigation
const chapters = gsap.utils.toArray('main .panel').map(s => s.id);
window.addEventListener('keydown', (e) => {
  if (!['ArrowDown','ArrowUp','PageDown','PageUp',' '].includes(e.key)) return;
  e.preventDefault();
  const y = window.scrollY + 1;
  let idx = chapters.findIndex(id => {
    const el = document.getElementById(id);
    return el.offsetTop <= y && el.offsetTop + el.offsetHeight > y;
    });
  if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') idx = Math.min(idx + 1, chapters.length - 1);
  if (e.key === 'ArrowUp'   || e.key === 'PageUp') idx = Math.max(idx - 1, 0);
  document.getElementById(chapters[idx]).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
});
