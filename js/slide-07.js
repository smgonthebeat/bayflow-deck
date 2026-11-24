// Slide 7. The loop that makes the agent self-improving. One draft travels the ring twice;
// each lap ends in the playbook, which gets one more rule. Flat 2D; motion is transform and opacity only.
const s7 = document.querySelector('.s7');
const q = new URLSearchParams(location.search);
const still = q.has('still');
const CX = 350, CY = 428, R = 176;
const $ = (sel) => [...s7.querySelectorAll(sel)];
const nodes = $('.s7__node'), labels = $('.s7__label'), arcs = $('.s7__arc'), says = $('.s7__say'), rows = $('.s7__row');
const disc = s7.querySelector('.s7__disc'), book = s7.querySelector('.s7__book'), sheets = s7.querySelector('.s7__sheets');
const chip = s7.querySelector('.s7__chip'), track = s7.querySelector('.s7__track');

// the travelling draft: an angle on the ring (degrees clockwise from the top), a radius, a size and an opacity
const st = { a: 0, r: R, s: 0.4, o: 0 };
function render() {
  const t = st.a * Math.PI / 180;
  gsap.set(chip, { x: st.r * Math.sin(t), y: -st.r * Math.cos(t), scale: st.s, opacity: st.o });
}
const move = (tl, from, to, at, dur, ease) => tl.fromTo(st, from, { ...to, duration: dur, ease, immediateRender: false }, at);
const pop = (tl, i, at) => tl
  .fromTo(nodes[i].querySelector('span'), { scale: 1 }, { scale: 1.14, duration: 0.16, ease: 'power2.out', yoyo: true, repeat: 1, immediateRender: false }, at)
  .fromTo(nodes[i].querySelector('i'), { opacity: 0.9, scale: 1 }, { opacity: 0, scale: 1.75, duration: 0.7, ease: 'power2.out', immediateRender: false }, at);

const tl = gsap.timeline({ paused: true, onUpdate: render });
tl.fromTo(disc, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' }, 0.1);
nodes.forEach((n, i) => {
  const at = 0.3 + i * 0.24;
  tl.fromTo(n, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.6)' }, at)
    .fromTo(labels[i], { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'none' }, at + 0.1)
    .fromTo(arcs[i], { opacity: 0, rotation: -26, svgOrigin: `${CX} ${CY}` }, { opacity: 1, rotation: 0, duration: 0.6, ease: 'power3.out' }, at + 0.15);
});
tl.fromTo(book, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 1.0)
  .fromTo(says, { opacity: 0 }, { opacity: 0.4, duration: 0.5, ease: 'none' }, 1.1)
  .fromTo(track, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 1.3)
  .fromTo(rows, { opacity: 0, x: -8 }, { opacity: 0, x: -8, duration: 0.01 }, 0)
  .fromTo(sheets, { scale: 1 }, { scale: 1, duration: 0.01 }, 0);

// one lap: the draft comes out from under "Agent drafts", goes under each point in turn, then goes into the playbook as a new rule
function lap(t0, k) {
  move(tl, { a: 0, r: R, s: 0.4, o: 0 }, { a: 0, r: R, s: 1, o: 1 }, t0, 0.3, 'power2.out');
  pop(tl, 0, t0 + 0.1);
  [1, 2, 3].forEach((n) => {
    const at = t0 + 0.45 + (n - 1) * 1.05;
    move(tl, { a: (n - 1) * 90 }, { a: n * 90 }, at, 0.8, 'power2.inOut');
    pop(tl, n, at + 0.74);
    if (k === 1 && n !== 2) {                       // second lap: the two sentences light up where they happen
      const say = says[n === 1 ? 0 : 1];
      tl.to(say, { opacity: 1, duration: 0.45, ease: 'none' }, at + 0.8);
    }
  });
  const fly = t0 + 3.6;
  move(tl, { r: R, s: 1 }, { r: 20, s: 0.5 }, fly, 0.55, 'power2.in');
  move(tl, { o: 1 }, { o: 0 }, fly + 0.42, 0.14, 'none');
  tl.to(rows[k], { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }, fly + 0.5)
    .to(sheets, { scale: 1.09 + k * 0.09, duration: 0.7, ease: 'back.out(2.2)' }, fly + 0.5);
  return fly + 1.3;
}
const end1 = lap(1.8, 0);
lap(end1, 1);

// afterwards the draft keeps circling, slowly, without stopping
let idle = null;
tl.eventCallback('onComplete', () => {
  idle = gsap.timeline({ repeat: -1, onUpdate: render })
    .fromTo(st, { a: 0, r: R, s: 1, o: 0 }, { o: 1, duration: 0.5, ease: 'none' }, 0)
    .fromTo(st, { a: 0 }, { a: 360, duration: 10, ease: 'none', immediateRender: false }, 0)
    .to(st, { o: 0, duration: 0.5, ease: 'none' }, 9.5);
});
tl.progress(0); render();

s7.addEventListener('slide:enter', () => {
  if (idle) { idle.kill(); idle = null; }
  if (q.has('t')) { tl.pause(Number(q.get('t'))); render(); return; }   // test hook: freeze at one moment
  if (still) { tl.pause(tl.duration()); render(); return; }
  tl.restart();
});
