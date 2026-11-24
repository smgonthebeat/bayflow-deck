// Slide 2. The reel plays on a phone modelled in three.js: metal body, glass front, the video frame on the screen.
// Message icons rise beside it (the videos bring buyers); the three statements come in one after another.
import * as THREE from 'three';

const s2 = document.querySelector('.s2');
const still = new URLSearchParams(location.search).has('still');
const canvas = s2.querySelector('#phone-02');
const facts = [...s2.querySelectorAll('.fact')], pings = [...s2.querySelectorAll('.pings kubai-icon')];

// ---------- renderer, camera
const W = 540, H = 720;
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(3);
renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(22, W / H, 330, 580);
camera.position.set(0, 0, 452);

// ---------- environment: a soft studio (sky fill, a large key panel, a warm rim) baked into a reflection map
function studio() {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0xb9cdea);
  const panel = (w, h, color, k, pos) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(...pos); m.lookAt(0, 0, 0); env.add(m);
  };
  panel(70, 40, 0xffffff, 1.35, [-20, 34, 30]);     // key, upper left front
  panel(26, 60, 0xffffff, 1.2, [44, 6, 26]);       // tall strip on the right: the line of light along the metal edge
  panel(40, 20, 0xffe6bd, 1.05, [10, -30, 30]);     // warm bounce from the water below
  panel(50, 50, 0xdfeaff, 1.0, [0, 10, -46]);      // back fill
  const pm = new THREE.PMREMGenerator(renderer);
  const tex = pm.fromScene(env, 0.09).texture;
  pm.dispose();
  return tex;
}
scene.environment = studio();
scene.add(new THREE.HemisphereLight(0xffffff, 0x9db4d8, 0.5));

// ---------- the phone (units: millimetres)
const PW = 71.9, PH = 150, PT = 8.6, PR = 11.5;
function rounded(w, h, r) {
  const x = -w / 2, y = -h / 2, sh = new THREE.Shape();
  sh.moveTo(x + r, y); sh.lineTo(x + w - r, y); sh.absarc(x + w - r, y + r, r, -Math.PI / 2, 0);
  sh.lineTo(x + w, y + h - r); sh.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2);
  sh.lineTo(x + r, y + h); sh.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
  sh.lineTo(x, y + r); sh.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
  return sh;
}
function slab(w, h, r, t, bevel) {                   // a rounded slab with softened edges, centred on z
  const g = new THREE.ExtrudeGeometry(rounded(w - 2 * bevel, h - 2 * bevel, r - bevel), {
    depth: t - 2 * bevel, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 10, curveSegments: 40 });
  g.translate(0, 0, -(t - 2 * bevel) / 2);
  return g;
}
function face(w, h, r) {                              // a flat rounded face with 0..1 uvs
  const g = new THREE.ShapeGeometry(rounded(w, h, r), 40), pos = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5);
  return g;
}

const metal = new THREE.MeshPhysicalMaterial({ color: 0xa9c0e2, metalness: 1, roughness: 0.42, envMapIntensity: 1.0 });   // light blue, brushed
const glass = new THREE.MeshPhysicalMaterial({ color: 0x05070c, metalness: 0, roughness: 0.25, clearcoat: 0.3, clearcoatRoughness: 0.2, envMapIntensity: 0.12 });
const backGlass = new THREE.MeshPhysicalMaterial({ color: 0xb4c8e6, metalness: 0.2, roughness: 0.55, envMapIntensity: 0.8 });

const phone = new THREE.Group();
phone.add(new THREE.Mesh(slab(PW, PH, PR, PT, 1.5), metal));

const front = new THREE.Mesh(face(PW - 1.5, PH - 1.5, PR - 0.75), glass);            // black glass, a thin metal rim outside it
front.position.z = PT / 2 + 0.05; phone.add(front);

const SW = PW - 4.6, SH = PH - 4.6;                                                  // the lit screen inside an even bezel
const video = new THREE.TextureLoader().load('assets/shots/measy-reel-frame-12s-stage-two-units.png');
video.colorSpace = THREE.SRGBColorSpace; video.anisotropy = 8; video.center.set(0.5, 0.5);
const COVER = (SW / SH) / (540 / 960);                                               // crop the 9:16 frame to the taller screen
const screen = new THREE.Mesh(face(SW, SH, PR - 2.3), new THREE.MeshBasicMaterial({ map: video, toneMapped: false }));
screen.position.z = PT / 2 + 0.12; screen.material.polygonOffset = true; screen.material.polygonOffsetFactor = -1; screen.material.polygonOffsetUnits = -1; screen.renderOrder = 1; phone.add(screen);
const glare = new THREE.Mesh(face(SW, SH, PR - 2.3), new THREE.MeshStandardMaterial({                // reflections of the room on the glass
  color: 0x000000, metalness: 1, roughness: 0.04, envMapIntensity: still ? 0.16 : 0, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
glare.position.z = PT / 2 + 0.18; glare.material.polygonOffset = true; glare.material.polygonOffsetFactor = -2; glare.material.polygonOffsetUnits = -2; glare.renderOrder = 2; phone.add(glare);
const island = new THREE.Mesh(face(20, 5.9, 2.95), new THREE.MeshBasicMaterial({ color: 0x020203 }));
island.position.set(0, SH / 2 - 6.6, PT / 2 + 0.24); island.material.polygonOffset = true; island.material.polygonOffsetFactor = -3; island.material.polygonOffsetUnits = -3; island.renderOrder = 3; phone.add(island);

const back = new THREE.Mesh(face(PW - 3, PH - 3, PR - 1.5), backGlass);
back.rotation.y = Math.PI; back.position.z = -PT / 2 - 0.05; phone.add(back);
const plateau = new THREE.Mesh(slab(PW - 6, 36, 9, 2.6, 0.9), metal);                // camera plateau across the top of the back
plateau.position.set(0, PH / 2 - 21, -PT / 2 - 1.0); phone.add(plateau);
const lensGlass = new THREE.MeshPhysicalMaterial({ color: 0x06080d, roughness: 0.2, clearcoat: 0.4, envMapIntensity: 0.25 });
[[23, 8.5], [23, -8.5], [8, 0]].forEach(([x, y]) => {                                 // mirrored: the back is seen from behind
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(7.6, 7.6, 1.6, 48), metal);
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(6.3, 6.3, 1.7, 48), lensGlass);
  [ring, lens].forEach((m) => { m.rotation.x = Math.PI / 2; m.position.set(x, PH / 2 - 21 + y, -PT / 2 - 2.9); phone.add(m); });
});

function button(side, y, h) {                         // side buttons: thin rounded bars standing just proud of the frame
  const b = new THREE.Mesh(slab(1.5, h, 0.7, 3.1, 0.45), metal);
  b.rotation.y = Math.PI / 2; b.position.set(side * (PW / 2 + 0.12), y, 0); phone.add(b);
}
button(1, 22, 19);                                    // power
button(-1, 40, 7); button(-1, 24, 12.5); button(-1, 8, 12.5);   // action, volume up, volume down
button(1, -30, 13);                                   // camera control

scene.add(phone);

// ---------- motion
const REST = { ry: -0.44, rx: 0.045 };
const pose = { ry: REST.ry, rx: REST.rx, x: 0, lift: 0 };
const testRy = new URLSearchParams(location.search).get('ry');
if (testRy !== null) pose.ry = Number(testRy);
const look = { x: 0, y: 0 };
const t0 = performance.now();
function frame() {
  if (s2.classList.contains('is-active')) {
    const t = still ? 0 : (performance.now() - t0) / 1000;
    const z = 1.04 + 0.04 * Math.sin(t * 0.22);                                      // the frame drifts slowly, as if playing
    video.repeat.set(COVER / z, 1 / z);
    phone.rotation.set(pose.rx + look.y * 0.07 + Math.sin(t * 0.7) * 0.008, pose.ry + look.x * 0.16 + Math.sin(t * 0.5) * 0.02, -0.012);
    phone.position.set(pose.x - 4, pose.lift + Math.sin(t * 0.9) * 1.1, 0);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
}
frame();

// where each message icon starts (stage px) and how far it drifts
const PATH = [[800, 560, -34], [826, 470, 22], [790, 380, -18], [820, 300, 26], [796, 200, -24]];
pings.forEach((el, i) => gsap.set(el, { x: PATH[i][0], y: PATH[i][1], opacity: still ? [0.95, 0.8, 0.6, 0.4, 0.2][i] : 0 }));

let loops = [];
s2.addEventListener('slide:enter', () => {
  if (still) return;
  gsap.fromTo(pose, { ry: 2.5, rx: 0.2, x: 60, lift: -30 }, { ry: REST.ry, rx: REST.rx, x: 0, lift: 0, duration: 1.9, ease: 'power3.out' });   // turns round from its back
  gsap.fromTo(canvas, { opacity: 0 }, { opacity: 1, duration: 0.5 });
  gsap.fromTo(glare.material, { envMapIntensity: 0 }, { envMapIntensity: 0.16, duration: 1.2, delay: 1.9, ease: 'power1.inOut' });
  gsap.fromTo(facts, { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out', stagger: 0.5, delay: 0.9 });
  gsap.fromTo(s2.querySelector('.s2__note'), { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 2.5 });
  loops.forEach((t) => t.kill());
  loops = pings.map((el, i) => gsap.fromTo(el,
    { x: 850, y: 600, opacity: 0, scale: 0.5 },
    { keyframes: [
        { x: 830 + PATH[i][2] * 0.4, y: 520, opacity: 0.95, scale: 1, duration: 1.2, ease: 'power2.out' },
        { x: 808 + PATH[i][2], y: 170, opacity: 0, scale: 1.05, duration: 4.6, ease: 'none' },
      ], repeat: -1, delay: 2.0 + i * 1.15 }));
});

if (!still) window.addEventListener('pointermove', (e) => {
  if (!s2.classList.contains('is-active')) return;
  gsap.to(look, { x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5, duration: 0.9, ease: 'power2.out', overwrite: 'auto' });
});
