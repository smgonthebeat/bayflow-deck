// Slide 9. TAM, SAM and the target segment are flat discs of frosted glass standing on one baseline,
// their areas in proportion to the number of companies; the SOM is a small gold point at the bottom.
const s9 = document.querySelector('.s9');
const still = new URLSearchParams(location.search).has('still');
const CX = 330, BASE = 666, R = 244;
const COUNTS = [585000, 170000, 12600, 120];
const SOM_MIN = 6;                                                   // true radius is 3.5 px: too small to see
const RADII = COUNTS.map((n, i) => Math.max(R * Math.sqrt(n / COUNTS[0]), i === 3 ? SOM_MIN : 0));   // area in proportion to companies

const discs = [...s9.querySelectorAll('.disc')];
discs.forEach((el, i) => {
  const r = RADII[i], lift = i === 3 ? 4 : 0;                       // the point sits just inside the bottom edge
  Object.assign(el.style, { left: CX - r + 'px', top: BASE - 2 * r - lift + 'px', width: 2 * r + 'px', height: 2 * r + 'px' });
});

// dashed leaders: from each row of the card to its disc. Rows are measured, so the lines follow the layout.
const panel = s9.querySelector('.panel'), rows = [...s9.querySelectorAll('.layers li')], lines = [...s9.querySelectorAll('.s9__lines path')];
function drawLines() {
  rows.forEach((li, i) => {
    const y = panel.offsetTop + li.offsetTop + 16, r = RADII[i], cy = BASE - r, x0 = panel.offsetLeft - 2;
    let tx, ty;
    if (i === 0) { ty = y; tx = CX + Math.sqrt(Math.max(r * r - (y - cy) * (y - cy), 0)) + 4; }       // straight across to the big disc
    else if (i === 3) { tx = CX + r + 4; ty = cy - 4; }
    else { const a = (i === 1 ? -40 : -30) * Math.PI / 180; tx = CX + (r + 4) * Math.cos(a); ty = cy + (r + 4) * Math.sin(a); }
    lines[i].setAttribute('d', `M${x0} ${y} L${tx.toFixed(1)} ${ty.toFixed(1)}`);
  });
}
s9.addEventListener('slide:enter', drawLines);

// entrance: the discs grow up from the baseline one inside the other, each with its figures; then the proof
const byLayer = (i) => [...s9.querySelectorAll(`[data-layer="${i}"]`)];
const fmt = (n) => Math.round(n).toLocaleString('en-US');
function countUp(el, delay) {
  const to = Number(el.dataset.count), o = { v: 0 };
  gsap.to(o, { v: to, duration: 1.1, delay, ease: 'power2.out', onUpdate: () => { el.textContent = fmt(o.v); } });
}
s9.addEventListener('slide:enter', () => {
  if (still) return;
  const proof = s9.querySelector('.proof');
  gsap.set(proof.children, { opacity: 0, y: 12 });
  gsap.fromTo(panel, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' });
  discs.forEach((el, i) => {
    const at = 0.2 + i * 0.7;
    gsap.fromTo(el, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.0, delay: at, ease: 'power3.out' });
    gsap.fromTo(byLayer(i), { opacity: 0, x: (j, t) => (t.closest('.layers') ? 16 : 0) }, { opacity: 1, x: 0, duration: 0.6, delay: at + 0.35, ease: 'power2.out' });
    byLayer(i).forEach((t) => t.querySelectorAll('[data-count]').forEach((c) => countUp(c, at + 0.35)));
  });
  gsap.to(proof.children, { opacity: 1, y: 0, duration: 0.6, delay: 3.2, stagger: 0.1, ease: 'power2.out' });
  countUp(proof.querySelector('[data-count]'), 3.2);
});
