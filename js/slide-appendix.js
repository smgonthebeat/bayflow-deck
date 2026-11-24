// Appendix slides (15, 16), for questions. Quiet entrances only: the ladder builds from the bottom up, the eight steps arrive in order.
const q = new URLSearchParams(location.search);
const still = q.has('still');
function wire(slide, build) {
  const tl = gsap.timeline({ paused: true });
  build(tl, (sel) => [...slide.querySelectorAll(sel)]);
  tl.progress(0);
  slide.addEventListener('slide:enter', () => {
    if (q.has('t')) { tl.pause(); tl.time(Number(q.get('t')), false); return; }
    if (still) { tl.pause(); tl.time(tl.duration() - 0.001, false); return; }
    tl.restart();
  });
}
wire(document.querySelector('.a1'), (tl, $) => {
  const rows = $('.a1__row').reverse(), by = $('.a1__by').reverse();          // level 1 first
  tl.fromTo(rows, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.22 }, 0.15)
    .fromTo(by, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'none', stagger: 0.22 }, 0.5);
});
wire(document.querySelector('.a2'), (tl, $) => {
  tl.fromTo($('.a2__step'), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', stagger: 0.14 }, 0.15)
    .fromTo($('.a2__go'), { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'none', stagger: 0.14 }, 0.4)
    .fromTo($('.a2__note'), { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'none', stagger: 0.1 }, 1.4)
    .fromTo($('.a2__legend'), { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'none' }, 1.9);
});
