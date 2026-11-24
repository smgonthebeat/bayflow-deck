// Slide 4: the signature flowing line. One full-stage WebGL quad; the fragment shader
// draws a ribbon along y = curve(x) in stage pixels (1280x720, origin top-left).
// Status is carried by the line itself: dashed = next, thick and bright = running today, thin = later.
import * as THREE from 'three';

const W = 1280, H = 720;

// Stations, in stage x. The ribbon swells between RUN_FROM and RUN_TO.
export const STATIONS = { content: 196, buyers: 500, orders: 812, payment: 1088 };

// Shape of a ribbon: base line y0, two wave amplitudes, x extent, thickness factor.
export const SHAPE = { y0: 318, a1: 54, a2: 9, x0: 20, x1: 1260, thick: 1, rise: 0 };   // rise: how many px the line climbs from x0 to x1

// Must match curve() in the shader.
export function curveY(x, shape = SHAPE) {
  const s = { ...SHAPE, ...shape };
  return s.y0 - s.a1 * Math.sin(x * 0.0058 - 1.2) + s.a2 * Math.sin(x * 0.0127 + 0.4) - s.rise * (x - s.x0) / (s.x1 - s.x0);
}

// The ribbon is painted like the flow in the key visual: a pale, brushed top face,
// a blue underside where it folds, a thin gold rim. Between "buyers" and "orders"
// (running today) it is fully saturated and the paint moves; elsewhere it is a pale ghost.
const fragment = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uProgress;
uniform float uRunFrom;
uniform float uRunTo;
uniform float uY0;
uniform float uA1;
uniform float uA2;
uniform float uX0;
uniform float uX1;
uniform float uThick;
uniform float uRise;

float curve(float x) { return uY0 - uA1 * sin(x * 0.0058 - 1.2) + uA2 * sin(x * 0.0127 + 0.4) - uRise * (x - uX0) / (uX1 - uX0); }
float slope(float x) { return -uA1 * 0.0058 * cos(x * 0.0058 - 1.2) + uA2 * 0.0127 * cos(x * 0.0127 + 0.4) - uRise / (uX1 - uX0); }

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) { return 0.5 * noise(p) + 0.3 * noise(p * 2.03 + 7.0) + 0.2 * noise(p * 4.1 + 19.0); }

// Thick paint: broad strokes a few per band width, pulled long along the flow, with soft clumps.
float paintH(float x, float v, float t) {
  float broad = noise(vec2(x * 0.0045 - t, v * 3.4 + 2.0));
  float hairs = noise(vec2(x * 0.009 - t * 1.3, v * 8.5 + 9.0));
  float clump = noise(vec2(x * 0.02 - t * 1.1, v * 1.6 + 40.0));
  return 0.55 * broad + 0.28 * hairs + 0.17 * clump;
}

void main() {
  float x = vUv.x * 1280.0;
  float y = (1.0 - vUv.y) * 720.0;
  float c = curve(x);
  float d = (y - c) / sqrt(1.0 + slope(x) * slope(x));

  float run = smoothstep(uRunFrom - 150.0, uRunFrom + 10.0, x) * (1.0 - smoothstep(uRunTo - 10.0, uRunTo + 150.0, x));

  // width: a long brush stroke, thin wisps at both ends, fullest where it runs today
  float u = clamp((x - uX0) / (uX1 - uX0), 0.0, 1.0);
  float env = pow(max(sin(3.14159 * u), 0.0), 0.5);
  float hw = uThick * env * (25.0 + 15.0 * run) * (1.0 + 0.04 * sin(uTime * 0.8 + x * 0.007));
  hw += (noise(vec2(x * 0.035, 3.0)) - 0.5) * 3.0 * env;                 // slightly uneven, like a brush
  float v = clamp(d / max(hw, 0.001), -1.0, 1.0);                        // -1 upper edge, +1 lower edge

  float edgeN = (noise(vec2(x * 0.09, d * 0.3 + 11.0)) - 0.5) * 2.2;     // dry-brush edge
  float body = 1.0 - smoothstep(hw - 1.6, hw + 0.9, abs(d) + edgeN);
  body *= smoothstep(0.4, 3.0, hw);

  float head = uX0 + uProgress * (uX1 - uX0 + 30.0);                                // draws in from the left
  body *= 1.0 - smoothstep(head - 60.0, head, x);

  // palette sampled from the key visual
  vec3 white = vec3(0.975, 0.985, 1.0);
  vec3 pale  = vec3(0.80, 0.885, 0.975);
  vec3 mid   = vec3(0.435, 0.66, 0.95);
  vec3 sat   = vec3(0.20, 0.50, 0.90);
  vec3 gold  = vec3(0.93, 0.80, 0.55);

  // One speed for the whole band. A speed that changes along x makes the pattern's phase drift apart between
  // neighbouring pixels as time goes on, until the texture breaks into blocks where the speed changes.
  float flowT = uTime * 0.24;
  // long strokes along the flow, finer ones across them
  float s1 = fbm(vec2(x * 0.0075 - flowT, v * 3.2 + 2.0));
  float s2 = fbm(vec2(x * 0.03 - flowT * 2.2, v * 9.0 + 5.0));
  float ridge = abs(fract(s1 * 5.0 + v * 1.4) - 0.5) * 2.0;             // thick-paint ridges

  // the fold: where the band turns, its blue underside shows along the lower edge
  float fb = 0.08 + 0.52 * sin(x * 0.0064 + 0.9);
  float under = smoothstep(fb - 0.07, fb + 0.07, v);

  vec3 top = mix(white, pale, smoothstep(0.35, 0.8, s1) * 0.85);
  top = mix(top, mid, smoothstep(0.62, 0.9, s2) * 0.25);
  vec3 bot = mix(mid, sat, smoothstep(0.3, 0.75, s1));
  bot = mix(bot, white, smoothstep(0.66, 0.9, s2) * 0.75);              // white drags through the blue
  vec3 col = mix(top, bot, under);

  // impasto: the strokes are a height field (paintH), lit from the upper left
  float e = 1.2;
  float h0 = paintH(x, v, flowT);
  float hx = paintH(x + e, v, flowT) - h0;
  float hv = paintH(x, v + e / max(hw, 1.0), flowT) - h0;
  vec3 nrm = normalize(vec3(-hx * 9.0, -hv * 9.0, 1.0));
  vec3 L = normalize(vec3(-0.5, -0.62, 0.6));
  float diff = dot(nrm, L) / 0.6;                                        // 1.0 on flat paint
  float spec = pow(max(dot(reflect(-L, nrm), vec3(0.0, 0.0, 1.0)), 0.0), 14.0);
  vec3 deep = vec3(0.07, 0.22, 0.56);
  float trough = 1.0 - smoothstep(0.25, 0.6, h0);
  col = mix(col, deep, under * trough * 0.5);                            // darker pigment where the paint is thin
  col = mix(col, white, smoothstep(0.62, 0.95, h0) * (0.25 + 0.3 * (1.0 - under)));  // loaded strokes catch the light
  col *= 0.62 + 0.38 * clamp(diff, 0.0, 1.6);
  col += vec3(1.0, 0.98, 0.94) * spec * (0.10 + 0.22 * under);
  col = mix(col, white, pow(0.5 + 0.5 * sin(x * 0.011 - uTime * 1.5), 8.0) * 0.35 * run * (1.0 - abs(v)));

  float rim = smoothstep(0.80, 0.97, abs(v));                           // gold on both edges
  float foldLine = (1.0 - smoothstep(0.0, 0.05, abs(v - fb))) * 0.55;   // and along the fold
  col = mix(col, gold, max(rim * 0.85, foldLine));

  // not running: a pale ghost of the same stroke
  vec3 ghost = mix(col, white, 0.62);
  col = mix(ghost, col, run);
  float a = body * mix(0.58, 1.0, run);
  gl_FragColor = vec4(col * a, a);
}`;

const vertex = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

export function mountFlow(canvas, slide, opts = {}) {
  const shape = { ...SHAPE, ...opts };
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, premultipliedAlpha: true });
  renderer.setClearColor(0x000000, 0);
  const uniforms = {
    uTime: { value: 0 },
    uProgress: { value: 1 },
    uRunFrom: { value: opts.runFrom ?? STATIONS.buyers },
    uRunTo: { value: opts.runTo ?? STATIONS.orders },
    uY0: { value: shape.y0 }, uA1: { value: shape.a1 }, uA2: { value: shape.a2 },
    uX0: { value: shape.x0 }, uX1: { value: shape.x1 }, uThick: { value: shape.thick }, uRise: { value: shape.rise },
  };
  const scene = new THREE.Scene();
  const camera = new THREE.Camera();
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms, vertexShader: vertex, fragmentShader: fragment, transparent: true,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
  })));

  function resize() {
    const scale = window.DECK_SCALE || 1;
    renderer.setPixelRatio(Math.min(3, (window.devicePixelRatio || 1) * scale));
    renderer.setSize(W, H, false);
  }
  resize();
  window.addEventListener('deck:scale', resize);

  const still = new URLSearchParams(location.search).has('still');   // ?still = frozen frame, for PDF export
  const t0 = performance.now();
  function frame() {
    if (slide.classList.contains('is-active')) {
      uniforms.uTime.value = still ? (Number(new URLSearchParams(location.search).get('time')) || 6.0) : (performance.now() - t0) / 1000;   // ?time=N: freeze at N seconds
      renderer.render(scene, camera);
    }
    requestAnimationFrame(frame);
  }
  frame();
  return uniforms;
}
