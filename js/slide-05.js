// Slide 5. The real screenshot stands in depth (CSS 3D); the part being discussed is lifted out of it
// into an enlarged card; a small painted ribbon (the slide 4 shader) fills up to the current step.
// Screenshots are never redrawn: both the window and the card show crops of the same images.
// All regions are in screenshot pixels.
import { mountFlow, curveY } from './flow.js';

const s5 = document.querySelector('.s5');
const still = new URLSearchParams(location.search).has('still');
const WIN = { w: 568, h: 388 };
// view: left, top, width of the region shown in the window. region: the part lifted out.
// card: left, top, width of the lifted card on the stage.
const STEPS = [
  { shot: 'a', view: [0, 880, 1282],    region: [116, 897, 745, 232],  card: [598, 384, 540] },
  { shot: 'a', view: [0, 880, 1282],    region: [40, 1165, 1230, 320], card: [560, 378, 648] },
  { shot: 'b', view: [-10, 564, 1780],  region: [50, 1128, 1662, 380], card: [448, 378, 760] },
  { shot: 'c', view: [-10, 564, 1780],  region: [30, 1398, 1716, 366], card: [448, 384, 760] },
];
// the five cells of the quote table (screenshot B), lit one by one on step 3
const CELLS = [[78, 1374, 316, 118], [398, 1374, 318, 118], [719, 1374, 318, 118], [1040, 1374, 319, 118], [1362, 1374, 320, 118]];

const $ = (q) => s5.querySelector(q), $$ = (q) => [...s5.querySelectorAll(q)];
const shot = $('.shot'), pan = $('.shot__pan'), ring = $('.shot__ring');
const pop = $('.pop'), popPan = $('.pop__pan'), cells = $$('.pop__cell');
const says = $$('.say'), marks = $$('.rail b'), kbd = $('kbd'), count = $('.langs__n');

// ribbon along the bottom left: same painted flow as slide 4, small
const RAIL = { y0: 646, a1: 13, a2: 4, x0: 56, x1: 640, thick: 0.62 };
const RAIL_X = [150, 280, 410, 540];
const flow = mountFlow(document.getElementById('flow-05'), s5, { ...RAIL, runFrom: -200, runTo: RAIL_X[0] });
marks.forEach((m, i) => { m.style.left = RAIL_X[i] + 'px'; m.style.top = curveY(RAIL_X[i], RAIL) + 'px'; });
CELLS.forEach((c, i) => Object.assign(cells[i].style, { left: c[0] + 'px', top: c[1] + 'px', width: c[2] + 'px', height: c[3] + 'px' }));

gsap.set(shot, { rotationY: 15, rotationX: 2.5 });

let tabTl = null;
function go(n, instant) {
  // stepping quickly must not leave a delayed tween from the previous step running
  if (tabTl) { tabTl.kill(); tabTl = null; }
  gsap.killTweensOf([...says, ...$$('.pop__img'), kbd]);
  gsap.set(kbd, { y: 0, clearProps: 'boxShadow' });
  const st = STEPS[n - 1], t = (instant || still) ? 0 : 0.95;
  const to = (el, props, extra) => t ? gsap.to(el, { duration: t, ease: 'power3.inOut', overwrite: 'auto', ...props, ...extra }) : gsap.set(el, props);

  // window: pan to the region, mark it
  const k = WIN.w / st.view[2];
  to(pan, { x: -st.view[0] * k, y: -st.view[1] * k, scale: k });
  $$('.shot__img').forEach((im) => to(im, { opacity: im.dataset.shot === st.shot ? 1 : 0 }));
  const r = st.region;
  to(ring, { x: r[0] - 8, y: r[1] - 8, width: r[2] + 16, height: r[3] + 16 });

  // lifted card: same crop, larger
  const c = st.card, kc = c[2] / r[2];
  to(pop, { x: c[0], y: c[1], width: c[2], height: r[3] * kc });
  to(popPan, { x: -r[0] * kc, y: -r[1] * kc, scale: kc });
  const first = n === 4 && t ? 'c1' : st.shot;            // step 4 opens on the Chinese the salesperson typed
  $$('.pop__img').forEach((im) => to(im, { opacity: im.dataset.shot === first ? 1 : 0 }));
  if (t) gsap.fromTo(pop, { scale: 0.94 }, { scale: 1, duration: 0.9, ease: 'back.out(1.8)' });

  // step 3: the numbers light up one by one (they are filled in by code)
  gsap.killTweensOf(cells);
  if (n === 3) {
    if (t) gsap.fromTo(cells, { opacity: 0 }, { opacity: 1, duration: 0.35, stagger: 0.22, delay: 1.0, yoyo: true, repeat: 1, repeatDelay: 0.5 });
    else gsap.set(cells, { opacity: (i) => (i >= 2 && i <= 3 ? 1 : 0) });   // still frame: unit price and total
  } else gsap.set(cells, { opacity: 0 });

  // step 4: press Tab, the Chinese becomes English
  if (n === 4 && t) {
    tabTl = gsap.timeline({ delay: 1.5 });
    tabTl.to(kbd, { y: 4, boxShadow: '0 0px 0 rgba(15,29,61,.35), 0 2px 6px -2px rgba(15,29,61,.4)', duration: 0.12 })
      .to(kbd, { y: 0, boxShadow: '0 4px 0 rgba(15,29,61,.35), 0 10px 18px -8px rgba(15,29,61,.4)', duration: 0.2 })
      .to($('.pop__img[data-shot="c1"]'), { opacity: 0, duration: 0.5 }, '<')
      .to($('.pop__img[data-shot="c"]'), { opacity: 1, duration: 0.5 }, '<');
  }

  // words, progress
  says.forEach((el, i) => {
    if (i === n - 1) t ? gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.25, ease: 'power2.out' }) : gsap.set(el, { opacity: 1, y: 0 });
    else t ? gsap.to(el, { opacity: 0, duration: 0.2 }) : gsap.set(el, { opacity: 0 });
  });
  marks.forEach((m, i) => { m.classList.toggle('is-on', i === n - 1); m.classList.toggle('is-done', i < n - 1); });
  to(flow.uRunTo, { value: RAIL_X[n - 1] });
}
s5.addEventListener('slide:step', (e) => go(e.detail.step, e.detail.instant));

// entrance: the window swings in, the ribbon is painted, 36 counts up
s5.addEventListener('slide:enter', () => {
  if (still) { count.textContent = '36'; return; }
  gsap.fromTo(shot, { rotationY: 52, opacity: 0, x: -60 }, { rotationY: 15, opacity: 1, x: 0, duration: 1.3, ease: 'power3.out' });
  gsap.fromTo(pop, { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 0.7 });
  gsap.fromTo(flow.uProgress, { value: 0 }, { value: 1, duration: 1.6, ease: 'power2.inOut' });
  gsap.fromTo(marks, { opacity: 0 }, { opacity: 1, duration: 0.4, stagger: 0.15, delay: 0.5 });
  const o = { v: 0 };
  gsap.to(o, { v: 36, duration: 1.6, delay: 0.4, ease: 'power2.out', onUpdate: () => { count.textContent = Math.round(o.v); } });
});

// the window leans a little toward the pointer
if (!still) window.addEventListener('pointermove', (e) => {
  if (!s5.classList.contains('is-active')) return;
  const dx = e.clientX / window.innerWidth - 0.5, dy = e.clientY / window.innerHeight - 0.5;
  gsap.to(shot, { rotationY: 15 + dx * 7, rotationX: 2.5 - dy * 5, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
});

// languages: three real messages stacked like cards. The front card lifts away and fades out,
// the two behind step forward, and the old front card fades back in at the rear: nothing ever
// passes through anything else, because a card only changes layer while it is invisible.
const cards = $$('.langs__stack img');
const POSE = [{ x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 }, { x: 14, y: -9, rotation: 2.2, scale: 0.96, opacity: 0.75 }, { x: 28, y: -18, rotation: 4.4, scale: 0.92, opacity: 0.5 }];
let order = cards.slice();                                  // order[0] is the front card
const settle = () => order.forEach((c, i) => gsap.set(c, { ...POSE[i], zIndex: order.length - i }));
settle();
function nextCard() {
  const out = order[0], rest = order.slice(1), last = POSE[POSE.length - 1];
  gsap.timeline()
    .to(out, { y: 26, opacity: 0, scale: 1.02, duration: 0.45, ease: 'power2.in' })
    .add(() => { order = [...rest, out]; order.forEach((c, i) => gsap.set(c, { zIndex: order.length - i })); })
    .set(out, { x: last.x + 10, y: last.y - 8, rotation: last.rotation, scale: last.scale })
    .to(rest, { x: (i) => POSE[i].x, y: (i) => POSE[i].y, rotation: (i) => POSE[i].rotation, scale: (i) => POSE[i].scale, opacity: (i) => POSE[i].opacity, duration: 0.6, ease: 'power2.out' })
    .to(out, { x: last.x, y: last.y, opacity: last.opacity, duration: 0.5, ease: 'power2.out' }, '<0.15');
}
if (!still) setInterval(() => { if (s5.classList.contains('is-active')) nextCard(); }, 3000);
