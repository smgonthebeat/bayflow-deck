// Deck shell: fits the 1280x720 stage to the window, shows one slide at a time,
// and tells each slide when it is entered (event "slide:enter" on the <section>).
// A slide with data-steps="N" is walked step by step first (event "slide:step", detail.step = 1..N);
// ?step=N opens it at that step, for stills.
// data-auto="a,b,...": after step k, wait that many seconds and go on to step k+1 without a click (0 = wait for the click).
(function () {
  const W = 1280, H = 720;
  const deck = document.getElementById('deck');
  const slides = Array.from(deck.querySelectorAll('.deck-stage'));
  let index = 0, step = 1;
  const params = new URLSearchParams(location.search);
  const startStep = Number(params.get('step')) || 1;
  const noAuto = params.has('still') || params.has('step');
  let timer = 0;

  if (new URLSearchParams(location.search).has('still')) document.documentElement.classList.add('is-still');

  function fit() {
    const scale = Math.min(window.innerWidth / W, window.innerHeight / H);
    deck.style.transform = 'translate(-50%, -50%) scale(' + scale + ')';
    window.DECK_SCALE = scale;
    window.dispatchEvent(new CustomEvent('deck:scale', { detail: { scale } }));
  }

  function numberOf(el) { return Number(el.dataset.slide); }

  function show(i, silent) {
    index = Math.max(0, Math.min(slides.length - 1, i));
    slides.forEach((s, k) => s.classList.toggle('is-active', k === index));
    const el = slides[index];
    if (!silent) history.replaceState(null, '', '#' + numberOf(el));
    step = Math.min(stepsOf(el), silent ? startStep : 1);
    el.dispatchEvent(new CustomEvent('slide:enter'));
    if (stepsOf(el) > 1) el.dispatchEvent(new CustomEvent('slide:step', { detail: { step, instant: true } }));
    chain();
  }

  function autoOf(el, k) { return Number((el.dataset.auto || '').split(',')[k - 1]) || 0; }      // seconds after step k
  function chain() {
    clearTimeout(timer);
    const el = slides[index], wait = autoOf(el, step);
    if (noAuto || !wait || step >= stepsOf(el)) return;
    timer = setTimeout(() => { step += 1; el.dispatchEvent(new CustomEvent('slide:step', { detail: { step } })); chain(); }, wait * 1000);
  }

  function stepsOf(el) { return Number(el.dataset.steps) || 1; }
  function move(d) {
    const el = slides[index];
    let next = step + d;
    while (d < 0 && next > 1 && autoOf(el, next - 1)) next -= 1;      // going back skips the steps that play on their own
    clearTimeout(timer);
    if (next >= 1 && next <= stepsOf(el)) { step = next; el.dispatchEvent(new CustomEvent('slide:step', { detail: { step } })); if (d > 0) chain(); }
    else show(index + d);
  }

  function fromHash() {
    const n = Number(location.hash.slice(1));
    const i = slides.findIndex((s) => numberOf(s) === n);
    return i >= 0 ? i : 0;
  }

  window.addEventListener('keydown', (e) => {
    if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); move(1); }
    if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); move(-1); }
    if (e.key === 'Home') show(0);
    if (e.key === 'End') show(slides.length - 1);
    if (e.key === 'f') document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
  });
  window.addEventListener('resize', fit);
  window.addEventListener('hashchange', () => show(fromHash(), true));

  fit();
  // Wait for the font so text is measured and drawn once, in the right face.
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => show(fromHash(), true));
})();
