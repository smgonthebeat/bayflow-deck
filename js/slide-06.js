// Slide 6. Two real screens side by side. A step at a time: the buyer bargains; the agent holds the buyer and
// an approval card travels to the owner; one word comes back and the approved draft appears; last, the overview.
// Everything is flat 2D; motion is transform and opacity only.
const s6 = document.querySelector('.s6');
const SHOTS = {
  d1: ['assets/shots/p6-D1-holding-reply-draft_chat.png', 1759],
  d6: ['assets/shots/p6-D6-approved-price-draft_chat.png', 1759],
  d4: ['assets/shots/p6-D4b-owner-phone-panel-pending-daniel.png', 740],
  d5: ['assets/shots/p6-D5b-owner-phone-panel-daniel.png', 740],
  e1: ['assets/shots/p6-E1-dashboard_full.png', 2880],
};
// each crop shows box = x,y,w,h (screenshot px) at the full width of its container
s6.querySelectorAll('.crop').forEach((el) => {
  const [src, natW] = SHOTS[el.dataset.img], [x, y, w, h] = el.dataset.box.split(',').map(Number);
  const box = el.parentElement.closest('.win, .dash');
  const W = el.dataset.w ? Number(el.dataset.w) : box.classList.contains('dash') ? 900 : box.classList.contains('win--wa') ? 640 : 328, k = W / w;   // the widths set in slides.css
  el.style.width = W + 'px'; el.style.height = Math.round(h * k) + 'px';
  const img = new Image(); img.src = src; img.alt = '';
  img.style.width = natW * k + 'px'; img.style.transform = `translate(${-x * k}px, ${-y * k}px)`;
  el.append(img);
});

const $ = (q) => s6.querySelector(q);
const ring = $('.s6__ring'), hold = $('.s6__hold'), done = $('.s6__done'), card = $('.s6__card'), reply = $('.s6__reply');
const goArc = $('.s6__go'), backArc = $('.s6__back'), chipCard = $('.chip--card'), chipOne = $('.chip--one');
const veil = $('.s6__veil'), dash = $('.dash'), lines = [...s6.querySelectorAll('.s6__steps li')];
const all = [ring, hold, done, card, reply, goArc, backArc, chipCard, chipOne, veil, dash];

// what is on screen at each step
const ON = {
  1: [ring],
  2: [hold, card, goArc],
  3: [done, reply, goArc, backArc],
  4: [done, reply, goArc, backArc, veil, dash],
};
const arc = (p0, c, p1) => (t) => ({ x: (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p1[0], y: (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p1[1] });
const GO = arc([718, 268], [796, 208], [872, 268]), BACK = arc([872, 404], [796, 464], [718, 404]);
function fly(chip, path, then) {                      // a chip travels along an arc, then hands over
  const o = { t: 0 };
  return gsap.timeline({ onComplete: then })
    .set(chip, { opacity: 0, scale: 0.7, ...path(0) })
    .to(chip, { opacity: 1, scale: 1, duration: 0.25 })
    .to(o, { t: 1, duration: 0.85, ease: 'power2.inOut', onUpdate: () => gsap.set(chip, path(o.t)) }, '<')
    .to(chip, { opacity: 0, scale: 0.8, duration: 0.25 });
}

let cur = 0, flight = null;
function go(n, instant) {
  gsap.killTweensOf(all); if (flight) { flight.kill(); flight = null; }
  gsap.set([chipCard, chipOne], { opacity: 0 });
  const on = new Set(ON[n]), forward = !instant && n === cur + 1, d = instant ? 0 : 0.5;
  lines.forEach((li, i) => li.classList.toggle('is-on', n <= 3 && i === n - 1));
  // things that arrive with a chip wait for it to land
  const late = forward && n === 2 ? [card] : forward && n === 3 ? [done] : [];
  all.forEach((el) => {
    if (el === chipCard || el === chipOne || late.includes(el)) return;
    const y = el === dash ? 34 : el === hold || el === done || el === card || el === reply ? 10 : 0;
    gsap.to(el, { opacity: on.has(el) ? 1 : 0, y: on.has(el) ? 0 : y, duration: d, ease: 'power2.out' });
  });
  const land = (el) => () => gsap.fromTo(el, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' });
  if (late.includes(card)) { gsap.set(card, { opacity: 0 }); flight = gsap.delayedCall(0.45, () => { flight = fly(chipCard, GO, land(card)); }); }
  if (late.includes(done)) { gsap.set(done, { opacity: 0 }); flight = gsap.delayedCall(0.55, () => { flight = fly(chipOne, BACK, land(done)); }); }
  cur = n;
}
gsap.set(all, { opacity: 0 });
if (!new URLSearchParams(location.search).has('still')) gsap.to(ring, { boxShadow: '0 0 0 2.5px #5393FF, 0 0 6px rgba(83,147,255,.3)', duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: -1 });
s6.addEventListener('slide:step', (e) => go(e.detail.step, e.detail.instant));
s6.addEventListener('slide:enter', () => { cur = 0; });
