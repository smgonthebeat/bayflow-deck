// Slide 12. Two products I built on the left; their methods flow along two streams into Bayflow Lab's agent on the right.
const s12 = document.querySelector('.s12');
const q = new URLSearchParams(location.search);
const still = q.has('still');
const $ = (sel) => [...s12.querySelectorAll(sel)];
const paths = [s12.querySelector('#s12a'), s12.querySelector('#s12b')], dots = $('.s12__dot');
const wipe = s12.querySelector('.s12__wipe'), svg = wipe.querySelector('svg');
const nums = $('.s12__n span');
const place = (dot, path, p) => {                     // p: 0..1 along the path, in stage pixels
  const pt = path.getPointAtLength(path.getTotalLength() * p);
  gsap.set(dot, { x: pt.x, y: pt.y, opacity: p <= 0 || p >= 1 ? 0 : Math.min(1, p * 8, (1 - p) * 8) });
};
const run = (tl, dot, path, at, dur) => { const o = { p: 0 }; tl.fromTo(o, { p: 0 }, { p: 1, duration: dur, ease: 'power1.inOut', onUpdate: () => place(dot, path, o.p) }, at); };

const tl = gsap.timeline({ paused: true });
tl.fromTo($('.s12__shot'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', stagger: 0.25 }, 0.15)
  .fromTo($('.s12__made'), { opacity: 0, x: 16 }, { opacity: 1, x: 0, duration: 0.55, ease: 'power2.out', stagger: 0.25 }, 0.3);
nums.forEach((el, i) => {
  const o = { v: 0 }, to = Number(el.dataset.to);
  tl.fromTo(o, { v: 0 }, { v: to, duration: 1.3, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString('en-US'); } }, 0.4 + i * 0.25);
});
// the two streams are uncovered from left to right: the window slides in while the drawing inside it stays put
tl.fromTo(wipe, { x: -250 }, { x: 0, duration: 0.9, ease: 'power2.inOut' }, 1.8)
  .fromTo(svg, { x: 250 }, { x: 0, duration: 0.9, ease: 'power2.inOut' }, 1.8)
  .fromTo('.s12 .s12__same', { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.8)' }, 2.5);
run(tl, dots[0], paths[0], 2.3, 0.8); run(tl, dots[1], paths[1], 2.4, 0.8);
tl.fromTo('.s12 .s12__icon', { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.5)' }, 2.9)
  .fromTo('.s12 .s12__halo', { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out' }, 2.9)
  .fromTo('.s12 .s12__now', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 3.3);

// afterwards drops keep running down both streams, and the halo breathes
let idle = [];
tl.eventCallback('onComplete', () => {
  if (still || q.has('t')) return;
  dots.forEach((d, i) => {
    const o = { p: 0 }, path = paths[i % 2];
    idle.push(gsap.fromTo(o, { p: 0 }, { p: 1, duration: 1.8, ease: 'none', repeat: -1, delay: Math.floor(i / 2) * 0.6 + (i % 2) * 0.3, onUpdate: () => place(d, path, o.p) }));
  });
  idle.push(gsap.to('.s12 .s12__halo', { scale: 1.12, opacity: 0.7, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
});

tl.progress(0);
s12.addEventListener('slide:enter', () => {
  idle.forEach((t) => t.kill()); idle = []; gsap.set(dots, { opacity: 0 });
  if (q.has('t')) { tl.pause(); tl.time(Number(q.get('t')), false); return; }      // test hook: freeze at one moment
  if (still) { tl.pause(); tl.time(tl.duration() - 0.001, false); return; }
  tl.restart();
});
