gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduceMotion) {
  // Intro hero stagger
  gsap.timeline({ defaults: { ease: 'power2.out', duration: 0.9 } })
    .from('.hero .reveal-from-bottom', { y: 40, opacity: 0, stagger: 0.12 });

  // Reveal helpers
  const makeReveal = (selector) => {
    gsap.utils.toArray(selector).forEach((el) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
        opacity: 0,
        y: el.classList.contains('reveal-from-bottom') ? 30 : 0,
        x: el.classList.contains('reveal-from-left') ? -30 : el.classList.contains('reveal-from-right') ? 30 : 0,
        duration: 0.9,
        ease: 'power2.out'
      });
    });
  };

  makeReveal('.reveal-from-bottom');
  makeReveal('.reveal-from-left');
  makeReveal('.reveal-from-right');
}

// Smooth anchor jumps
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
// Horizontal scroll section
const hSection = document.querySelector('#chapter-h .h-inner');
if (hSection) {
  const cards = gsap.utils.toArray('#chapter-h .h-card');
  const totalWidth = () => hSection.scrollWidth - window.innerWidth;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#chapter-h',
      start: 'top top',
      end: () => `+=${totalWidth()}`,
      scrub: 1,
      pin: true,
      anticipatePin: 1
    }
  });

  tl.to(hSection, { x: () => -totalWidth(), ease: 'none' });

  // Subtle per card scale in
  cards.forEach((card, i) => {
    gsap.from(card, {
      scale: 0.9, opacity: 0.6,
      scrollTrigger: {
        trigger: card,
        containerAnimation: tl,
        start: 'left center',
        end: 'right center',
        scrub: true
      }
    });
  });

  // Refresh on resize
  window.addEventListener('resize', () => ScrollTrigger.refresh());
}
// FLIP gallery
const cards = gsap.utils.toArray('#gallery .card');
const detail = document.querySelector('#gallery .detail');
const dImg = detail?.querySelector('img');
const dH3 = detail?.querySelector('h3');
const dP  = detail?.querySelector('p');
const dClose = detail?.querySelector('.close');

if (cards.length && detail && dImg && dH3 && dP) {
  const openCard = (card) => {
    const state = Flip.getState(card.querySelector('img'));
    detail.style.display = 'block';
    dImg.src = card.querySelector('img').src;
    dImg.alt = card.querySelector('img').alt;
    dH3.textContent = card.dataset.title || '';
    dP.textContent = card.dataset.text || '';
    Flip.from(state, {
      duration: 0.6,
      ease: 'power2.inOut',
      absolute: true,
      onComplete: () => {}
    });
    gsap.fromTo(detail, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power1.out' });
  };

  const closeDetail = () => {
    gsap.to(detail, { opacity: 0, duration: 0.25, onComplete: () => detail.style.display = 'none' });
  };

  cards.forEach(card => card.addEventListener('click', () => openCard(card)));
  dClose?.addEventListener('click', closeDetail);
  detail?.addEventListener('click', (e) => { if (e.target === detail) closeDetail(); });
}
