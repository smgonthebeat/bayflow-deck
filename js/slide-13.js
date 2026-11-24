// Slide 13. The photo is there from the start, with no animation (founder, 2026-11-24); three lines run out of it; the three cards arrive one by one.
const s13 = document.querySelector('.s13');
const q = new URLSearchParams(location.search);
const still = q.has('still');
const $ = (sel) => [...s13.querySelectorAll(sel)];
const wipe = s13.querySelector('.s13__wipe'), svg = wipe.querySelector('svg');

const tl = gsap.timeline({ paused: true });
tl.fromTo('.s13 .s13__h', { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'none' }, 0.2)
  .fromTo(wipe, { x: -152 }, { x: 0, duration: 0.7, ease: 'power2.inOut' }, 0.3)
  .fromTo(svg, { x: 152 }, { x: 0, duration: 0.7, ease: 'power2.inOut' }, 0.3)
  .fromTo($('.s13__card'), { opacity: 0, x: 34 }, { opacity: 1, x: 0, duration: 0.55, ease: 'power2.out', stagger: 0.22 }, 0.7)
  .fromTo('.s13 .s13__foot', { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'none' }, 1.6);
let idle = [];

tl.progress(0);
s13.addEventListener('slide:enter', () => {
  idle.forEach((t) => t.kill()); idle = [];
  if (q.has('t')) { tl.pause(); tl.time(Number(q.get('t')), false); return; }      // test hook: freeze at one moment
  if (still) { tl.pause(); tl.time(tl.duration() - 0.001, false); return; }
  tl.restart();
});
