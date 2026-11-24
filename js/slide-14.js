// Slide 14. The same painted flow as slide 4, now rising from lower left to upper right: it is the timeline.
// It draws from TODAY; each station lights up as the line reaches it; past month 12 it thins into what comes after the grant.
import { mountFlow, curveY } from './flow.js';
const s14 = document.querySelector('.s14');
const q = new URLSearchParams(location.search);
const still = q.has('still');
const $ = (sel) => [...s14.querySelectorAll(sel)];
const SHAPE = { y0: 545, a1: 18, a2: 4, x0: 20, x1: 1300, thick: 0.8, rise: 346 };
const stations = $('.s14__st');
stations.forEach((el) => { const x = Number(el.dataset.x); el.style.left = x + 'px'; el.style.top = curveY(x, { ...SHAPE }) + 'px'; });
const flow = mountFlow(document.getElementById('flow-14'), s14, { ...SHAPE, runFrom: -400, runTo: 1130 });

const DRAW = 2.6, T0 = 0.2;
const reach = (x) => T0 + DRAW * (x - SHAPE.x0 + 30) / (SHAPE.x1 - SHAPE.x0 + 30);     // when the head of the line passes x
const tl = gsap.timeline({ paused: true });
tl.fromTo(flow.uProgress, { value: 0 }, { value: 1, duration: DRAW, ease: 'none' }, T0);
stations.forEach((el) => {
  const at = reach(Number(el.dataset.x));
  tl.fromTo(el.querySelector('span'), { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2)' }, at)
    .fromTo(el.querySelector('.s14__txt'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, at + 0.15);
});
tl.fromTo('.s14 .s14__y3', { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, T0 + DRAW - 0.1)
  .fromTo('.s14 .s14__hk', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, T0 + DRAW + 0.2);
let idle = [];

tl.progress(0);
s14.addEventListener('slide:enter', () => {
  idle.forEach((t) => t.kill()); idle = [];
  if (q.has('t')) { tl.pause(); tl.time(Number(q.get('t')), false); return; }      // test hook: freeze at one moment
  if (still) { tl.pause(); tl.time(tl.duration() - 0.001, false); return; }
  tl.restart();
});
