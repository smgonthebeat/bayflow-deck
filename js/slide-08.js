// Slide 8. A real example, read left to right: two product photos plus one sentence go in, a finished video comes out,
// and the numbers say what it reached. The prompt is typed, the arrow fires, the phone lights up, the numbers count.
const s8 = document.querySelector('.s8');
const q = new URLSearchParams(location.search);
const still = q.has('still');
const $ = (sel) => [...s8.querySelectorAll(sel)];
const TEXT = s8.querySelector('.s8__rest').textContent;
const typed = s8.querySelector('.s8__typed'), rest = s8.querySelector('.s8__rest'), caret = s8.querySelector('.s8__prompt p i');
const frames = $('.s8__screen img'), nums = $('.s8__n');
const fmt = (el, v) => { el.textContent = v.toFixed(Number(el.dataset.dec)) + el.dataset.suf; };

const tl = gsap.timeline({ paused: true });
tl.fromTo($('.s8__photo'), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', stagger: 0.15 }, 0.15)
  .fromTo('.s8 .s8__prompt', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }, 0.45)
  .fromTo('.s8 .s8__plus', { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2.2)' }, 0.8);
const pen = { n: 0 };
tl.fromTo(pen, { n: 0 }, { n: TEXT.length, duration: 2.1, ease: 'none', onUpdate() {
  const n = Math.round(pen.n); typed.textContent = TEXT.slice(0, n); rest.textContent = TEXT.slice(n);
} }, 1.0)
  .fromTo(caret, { opacity: 1 }, { opacity: 0, duration: 0.2 }, 3.2)
  .fromTo('.s8 .s8__phone', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.6)
  .fromTo('.s8 .s8__go', { opacity: 0, x: -26 }, { opacity: 1, x: 0, duration: 0.45, ease: 'power3.out' }, 3.15)      // the inputs go into the phone
  .fromTo('.s8 .s8__screen', { opacity: 0.12 }, { opacity: 1, duration: 0.5, ease: 'power1.out' }, 3.5)           // and it lights up
  .fromTo(frames.slice(1), { opacity: 0 }, { opacity: 0, duration: 0.01 }, 0)
  .fromTo('.s8 .s8__madeh', { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'none' }, 3.8)
  .fromTo($('.s8__made li'), { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out', stagger: 0.12 }, 3.85)
  .fromTo('.s8 .s8__sum', { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'none' }, 4.4)
  .fromTo($('.s8__stat'), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.1 }, 4.5)
  .fromTo(['.s8 .s8__src', '.s8 .s8__note'], { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'none' }, 5.7);
nums.forEach((el, i) => {
  const o = { v: 0 }, to = Number(el.dataset.to);
  tl.fromTo(o, { v: 0 }, { v: to, duration: 1.3, ease: 'power2.out', onUpdate: () => fmt(el, o.v) }, 4.6 + i * 0.1);
});

// afterwards the video keeps playing: its three frames cross-fade in turn
let idle = [];
tl.eventCallback('onComplete', () => {
  if (still || q.has('t')) return;
  const loop = gsap.timeline({ repeat: -1 });
  loop.to(frames[1], { opacity: 1, duration: 0.6 }, 1.6).to(frames[2], { opacity: 1, duration: 0.6 }, 3.8)
      .to(frames.slice(1), { opacity: 0, duration: 0.6 }, 6.0).to({}, { duration: 0.01 }, 6.6);
  idle = [loop];
});

tl.progress(0);
s8.addEventListener('slide:enter', () => {
  idle.forEach((t) => t.kill()); idle = [];
  if (q.has('t')) { tl.pause(); tl.time(Number(q.get('t')), false); return; }      // test hook: freeze at one moment
  if (still) { tl.pause(); tl.time(tl.duration() - 0.001, false); return; }
  tl.restart();
});
