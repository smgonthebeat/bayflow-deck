// Slide 3. An exploded isometric stack: what the company already has at the bottom, the agent added on top,
// the result above. Everything is flat 2D (see the note in slides.css); motion is transform and opacity only.
const s3 = document.querySelector('.s3');
const q = new URLSearchParams(location.search);
const still = q.has('still');
const CX = 330, CY = 556, RISE = 140, HALF = 150 * Math.SQRT2, THICK = 15;
const yOf = (i) => CY - i * RISE;

const layers = [...s3.querySelectorAll('.layer')], casts = [...s3.querySelectorAll('.cast')];
const tiers = [0, 1, 2].map((i) => s3.querySelector(`.tier[data-level="${i}"]`));
layers.forEach((el, i) => { el.style.top = -i * RISE + 'px'; });
// The pins of a plate are drawn after the shadow that falls on that plate, so the shadow never greys them.
// Each group moves with its plate: `rig[i]` is what the animation moves for level i.
const rig = layers.map((el, i) => {
  const g = document.createElement('div'); g.className = 'layer layer--pins'; g.style.top = el.style.top;
  g.append(...el.querySelectorAll('.pin'));
  (casts[i] || el).after(g);
  return [el, g];
});
casts.forEach((el) => { el.style.top = -(Number(el.dataset.level) - 1) * RISE + 'px'; });      // a shadow lies on the plate below

// words level with each plate; leaders from the plate's right corner; dashed risers between the plates
[yOf(0) - 22, yOf(1) - 40, yOf(2) - 40].forEach((top, i) => { tiers[i].style.top = top + 'px'; });
let h = '';
[0, 1, 2].forEach((i) => { h += `<g data-level="${i}"><path d="M${CX + HALF + 10} ${yOf(i)} L632 ${yOf(i)}"/><circle cx="636" cy="${yOf(i)}" r="3.5"/></g>`; });
[1, 2].forEach((i) => [-1, 1].forEach((sd) => {
  const x = CX + sd * HALF, y0 = yOf(i - 1) - 6, y1 = yOf(i) + THICK + 8;
  h += `<g data-level="${i}"><path class="rise" d="M${x} ${y0} L${x} ${y1}"/><path class="tip" d="M${x - 5} ${y1 + 6} L${x} ${y1} L${x + 5} ${y1 + 6}"/></g>`;
}));
s3.querySelector('.s3__lines').innerHTML = h;
const marks = (i) => [...s3.querySelectorAll(`.s3__lines g[data-level="${i}"]`)];

// one timeline: the base is there first; the agent comes down onto it; the result above
const tl = gsap.timeline({ paused: true });
tl.fromTo(rig[0], { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.1)
  .fromTo([tiers[0], ...marks(0)], { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.5)
  .fromTo(tiers[0], { x: 16 }, { x: 0, duration: 0.6, ease: 'power2.out' }, 0.5);
[1, 2].forEach((i) => {
  const at = 0.2 + i * 0.9, cast = casts[i - 1];
  tl.fromTo(rig[i], { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'none' }, at)
    .fromTo(rig[i], { y: -90 }, { y: 0, duration: 0.9, ease: 'back.out(1.25)' }, at)
    .fromTo(cast, { opacity: 0, scale: 1.3 }, { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out' }, at)   // the shadow tightens as the plate comes down
    .fromTo([tiers[i], ...marks(i)], { opacity: 0 }, { opacity: 1, duration: 0.5 }, at + 0.55)
    .fromTo(tiers[i], { x: 16 }, { x: 0, duration: 0.6, ease: 'power2.out' }, at + 0.55);
});

// afterwards the two upper plates breathe, slowly and out of step
let idle = [];
function breathe() {
  idle = [1, 2].map((i) => gsap.to(rig[i], { y: -7, duration: 2.8 + i * 0.5, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
}
tl.eventCallback('onComplete', breathe);
tl.progress(0);
s3.classList.add('is-ready');

s3.addEventListener('slide:enter', () => {
  idle.forEach((t) => t.kill()); idle = [];
  if (q.has('t')) { tl.pause(Number(q.get('t'))); return; }      // test hook: freeze the entrance at one moment
  if (still) { tl.progress(1); idle.forEach((t) => t.kill()); idle = []; return; }
  tl.restart();
});
