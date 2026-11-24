// Slide 10. Left: what a salesperson works with today, two separate tools and two things that are in no tool.
// Right: one window. The four pieces fly across and land row by row.
const s10 = document.querySelector('.s10');
const q = new URLSearchParams(location.search);
const still = q.has('still');
const $ = (sel) => [...s10.querySelectorAll(sel)];
const tools = $('.s10__tool'), rows = $('.s10__win li'), flies = $('.s10__fly'), lines = $('.s10__lines path:not(.go)');
const FROM = [300, 376, 498, 584].map((y) => [295, y]);                  // the icon of each piece on the left (stage px)
const TO = (i) => [786, 314 + i * 90];                                    // the icon slot of row i

const tl = gsap.timeline({ paused: true });
tl.fromTo('.s10 .s10__sales', { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.6)' }, 0.1)
  .fromTo($('.s10__cap'), { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'none' }, 0.25)
  .fromTo(tools, { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out', stagger: 0.08 }, 0.25)
  .fromTo(lines, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'none', stagger: 0.08 }, 0.3)
  .fromTo('.s10 .s10__win', { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.55, ease: 'power2.out' }, 0.3)
  .fromTo(rows, { opacity: 0.22 }, { opacity: 0.22, duration: 0.01 }, 0)
  .fromTo('.s10 .s10__lines .go', { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'none' }, 0.8);
flies.forEach((f, i) => {
  const at = 1.0 + i * 0.16, [x0, y0] = FROM[i], [x1, y1] = TO(i);
  tl.fromTo(f, { x: x0, opacity: 0, scale: 0.5 }, { x: x1, opacity: 1, scale: 1, duration: 0.7, ease: 'power2.inOut' }, at)
    .fromTo(f, { y: y0 }, { y: y1, duration: 0.7, ease: 'power3.inOut' }, at)                    // a different ease on y bends the path
    .to(f, { opacity: 0, scale: 0.6, duration: 0.18, ease: 'none' }, at + 0.66)
    .to(rows[i], { opacity: 1, duration: 0.3, ease: 'none' }, at + 0.62)
    .fromTo(rows[i], { scale: 1 }, { scale: 1.035, duration: 0.14, ease: 'power2.out', yoyo: true, repeat: 1 }, at + 0.62);
});
let idle = [];

tl.progress(0);
s10.addEventListener('slide:enter', () => {
  idle.forEach((t) => t.kill()); idle = [];
  if (q.has('t')) { tl.pause(); tl.time(Number(q.get('t')), false); return; }      // test hook: freeze at one moment
  if (still) { tl.pause(); tl.time(tl.duration() - 0.001, false); return; }
  tl.restart();
});
