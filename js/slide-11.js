// Slide 11. Three plans rise one after another like steps; then the two things charged separately slide in.
const s11 = document.querySelector('.s11');
const q = new URLSearchParams(location.search);
const still = q.has('still');
const $ = (sel) => [...s11.querySelectorAll(sel)];
const plans = $('.s11__plan');

const tl = gsap.timeline({ paused: true });
tl.fromTo('.s11 .s11__base', { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'none' }, 0.1);
plans.forEach((el, i) => {
  const at = 0.25 + i * 0.28;
  tl.fromTo(el, { y: el.offsetHeight || 460 }, { y: 0, duration: 0.85, ease: 'power3.out' }, at)
    .fromTo(el.querySelectorAll('i.on'), { scale: 0 }, { scale: 1, duration: 0.3, ease: 'back.out(2.4)', stagger: 0.04 }, at + 0.5);
});
tl.fromTo('.s11 .s11__h', { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'none' }, 1.3)
  .fromTo($('.s11__extra'), { opacity: 0, x: 36 }, { opacity: 1, x: 0, duration: 0.55, ease: 'power2.out', stagger: 0.18 }, 1.4);
let idle = [];

tl.progress(0);
s11.addEventListener('slide:enter', () => {
  idle.forEach((t) => t.kill()); idle = [];
  if (q.has('t')) { tl.pause(); tl.time(Number(q.get('t')), false); return; }      // test hook: freeze at one moment
  if (still) { tl.pause(); tl.time(tl.duration() - 0.001, false); return; }
  tl.restart();
});
