import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import gsap from 'gsap';

import petalVert from './shaders/petal.vert?raw';
import petalFrag from './shaders/petal.frag?raw';
import bgVert from './shaders/background.vert?raw';
import bgFrag from './shaders/background.frag?raw';

// ============================================================
// UNIQUE COLOR PALETTES — beautiful flower colors
// ============================================================
const FLOWER_PALETTES = [
  { name: 'Rose Blush', inner: '#fce4ec', outer: '#e91e63', vein: '#c2185b', bg1: '#1a0a10', bg2: '#0a0a0a' },
  { name: 'Sunset Orchid', inner: '#fff3e0', outer: '#ff6d00', vein: '#e65100', bg1: '#1a0f05', bg2: '#0a0a0a' },
  { name: 'Lavender Dream', inner: '#f3e5f5', outer: '#9c27b0', vein: '#7b1fa2', bg1: '#0f0a15', bg2: '#0a0a0a' },
  { name: 'Ocean Dahlia', inner: '#e0f7fa', outer: '#00acc1', vein: '#00838f', bg1: '#051215', bg2: '#0a0a0a' },
  { name: 'Golden Lily', inner: '#fffde7', outer: '#fdd835', vein: '#f9a825', bg1: '#15130a', bg2: '#0a0a0a' },
  { name: 'Cherry Blossom', inner: '#fce4ec', outer: '#f48fb1', vein: '#f06292', bg1: '#150a0f', bg2: '#0a0a0a' },
  { name: 'Midnight Iris', inner: '#ede7f6', outer: '#5c6bc0', vein: '#3949ab', bg1: '#0a0a15', bg2: '#0a0a0a' },
  { name: 'Coral Peony', inner: '#fbe9e7', outer: '#ff7043', vein: '#f4511e', bg1: '#150d0a', bg2: '#0a0a0a' },
  { name: 'Arctic Frost', inner: '#e8eaf6', outer: '#b0bec5', vein: '#78909c', bg1: '#0d0f12', bg2: '#0a0a0a' },
  { name: 'Emerald Lotus', inner: '#e8f5e9', outer: '#43a047', vein: '#2e7d32', bg1: '#0a150b', bg2: '#0a0a0a' },
  { name: 'Ruby Tulip', inner: '#ffebee', outer: '#d32f2f', vein: '#b71c1c', bg1: '#150a0a', bg2: '#0a0a0a' },
  { name: 'Sapphire Bloom', inner: '#e3f2fd', outer: '#1e88e5', vein: '#1565c0', bg1: '#0a0e15', bg2: '#0a0a0a' },
  { name: 'Pink Magnolia', inner: '#fce4ec', outer: '#ec407a', vein: '#d81b60', bg1: '#150a10', bg2: '#0a0a0a' },
  { name: 'Amber Marigold', inner: '#fff8e1', outer: '#ffb300', vein: '#ff8f00', bg1: '#15120a', bg2: '#0a0a0a' },
  { name: 'Violet Cosmos', inner: '#f3e5f5', outer: '#ab47bc', vein: '#8e24aa', bg1: '#120a15', bg2: '#0a0a0a' },
  { name: 'Peach Ranunculus', inner: '#fff3e0', outer: '#ff8a65', vein: '#ff7043', bg1: '#150f0a', bg2: '#0a0a0a' },
  { name: 'Teal Lotus', inner: '#e0f2f1', outer: '#26a69a', vein: '#00897b', bg1: '#0a1512', bg2: '#0a0a0a' },
  { name: 'Crimson Dahlia', inner: '#fce4ec', outer: '#c62828', vein: '#b71c1c', bg1: '#150a0a', bg2: '#050505' },
  { name: 'Electric Orchid', inner: '#f3e5f5', outer: '#e040fb', vein: '#d500f9', bg1: '#120a15', bg2: '#050505' },
  { name: 'Sunfire', inner: '#fffde7', outer: '#ff6f00', vein: '#e65100', bg1: '#15100a', bg2: '#050505' },
];

// ============================================================
// SCENE SETUP
// ============================================================
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.5, 4.5);
camera.lookAt(0, 0.5, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);
renderer.domElement.style.touchAction = 'none';
renderer.domElement.style.cursor = 'grab';

const clock = new THREE.Clock();
const cameraTarget = new THREE.Vector3(0, 0.38, 0);

// ============================================================
// MOUSE TRACKING
// ============================================================
const interaction = {
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0,
  isDragging: false,
  lastX: 0,
  lastY: 0,
  pointerId: null,
  orbitAzimuth: 0,
  targetOrbitAzimuth: 0,
  orbitPolar: 1.1,
  targetOrbitPolar: 1.1,
  orbitRadius: 4.5,
  targetOrbitRadius: 4.5,
  azimuthVelocity: 0,
  polarVelocity: 0,
  autoRotateSpeed: 0.18,
  leanX: 0,
  leanZ: 0,
};

renderer.domElement.addEventListener('pointermove', (e) => {
  const nx = (e.clientX / window.innerWidth) * 2 - 1;
  const ny = -(e.clientY / window.innerHeight) * 2 + 1;

  interaction.targetX = nx;
  interaction.targetY = ny;

  if (!interaction.isDragging || e.pointerId !== interaction.pointerId) return;

  const dx = e.clientX - interaction.lastX;
  const dy = e.clientY - interaction.lastY;

  interaction.targetOrbitAzimuth -= dx * 0.0085;
  interaction.targetOrbitPolar = THREE.MathUtils.clamp(
    interaction.targetOrbitPolar + dy * 0.006,
    0.45,
    1.45
  );
  interaction.azimuthVelocity = -dx * 0.0009;
  interaction.polarVelocity = dy * 0.0005;
  interaction.lastX = e.clientX;
  interaction.lastY = e.clientY;
});

renderer.domElement.addEventListener('pointerdown', (e) => {
  interaction.isDragging = true;
  interaction.pointerId = e.pointerId;
  interaction.lastX = e.clientX;
  interaction.lastY = e.clientY;
  renderer.domElement.style.cursor = 'grabbing';
  renderer.domElement.setPointerCapture(e.pointerId);

  const hint = document.getElementById('gestureHint');
  if (hint) {
    hint.classList.add('is-hidden');
  }
});

window.addEventListener('pointerup', () => {
  if (interaction.pointerId !== null && renderer.domElement.hasPointerCapture(interaction.pointerId)) {
    renderer.domElement.releasePointerCapture(interaction.pointerId);
  }
  interaction.isDragging = false;
  interaction.pointerId = null;
  renderer.domElement.style.cursor = 'grab';
});

window.addEventListener('pointercancel', () => {
  if (interaction.pointerId !== null && renderer.domElement.hasPointerCapture(interaction.pointerId)) {
    renderer.domElement.releasePointerCapture(interaction.pointerId);
  }
  interaction.isDragging = false;
  interaction.pointerId = null;
  renderer.domElement.style.cursor = 'grab';
});

// ============================================================
// LIGHTING
// ============================================================
const ambientLight = new THREE.AmbientLight(0x404050, 0.6);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xfff5ee, 1.2);
mainLight.position.set(3, 5, 4);
scene.add(mainLight);

const fillLight = new THREE.DirectionalLight(0xaabbff, 0.4);
fillLight.position.set(-3, 2, -2);
scene.add(fillLight);

const rimLight = new THREE.PointLight(0xffffff, 0.5, 10);
rimLight.position.set(0, 3, -3);
scene.add(rimLight);

// ============================================================
// BACKGROUND
// ============================================================
const bgMaterial = new THREE.ShaderMaterial({
  vertexShader: bgVert,
  fragmentShader: bgFrag,
  uniforms: {
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color('#1a0a10') },
    uColor2: { value: new THREE.Color('#0a0a0a') },
  },
  depthWrite: false,
});
const bgMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMaterial);
bgMesh.frustumCulled = false;
const bgScene = new THREE.Scene();
const bgCamera = new THREE.Camera();
bgScene.add(bgMesh);

// ============================================================
// FLOWER CREATION
// ============================================================
const flowerGroup = new THREE.Group();
scene.add(flowerGroup);

// Stem
const stemCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, -1.5, 0),
  new THREE.Vector3(0.05, -0.8, 0.02),
  new THREE.Vector3(-0.02, -0.2, -0.01),
  new THREE.Vector3(0, 0, 0),
]);
const stemGeometry = new THREE.TubeGeometry(stemCurve, 20, 0.035, 8, false);
const stemMaterial = new THREE.MeshStandardMaterial({
  color: 0x2d5a27,
  roughness: 0.8,
  metalness: 0.0,
});
const stem = new THREE.Mesh(stemGeometry, stemMaterial);
flowerGroup.add(stem);

// Small leaves on stem
function createLeaf(position, rotation, scale) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.15, 0.1, 0.2, 0.4, 0, 0.6);
  shape.bezierCurveTo(-0.2, 0.4, -0.15, 0.1, 0, 0);

  const leafGeo = new THREE.ShapeGeometry(shape, 8);
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x3a7d32,
    roughness: 0.7,
    side: THREE.DoubleSide,
  });
  const leaf = new THREE.Mesh(leafGeo, leafMat);
  leaf.position.copy(position);
  leaf.rotation.set(rotation.x, rotation.y, rotation.z);
  leaf.scale.setScalar(scale);
  return leaf;
}

flowerGroup.add(createLeaf(
  new THREE.Vector3(0.05, -0.9, 0),
  { x: -0.3, y: 0, z: -0.8 },
  0.7
));
flowerGroup.add(createLeaf(
  new THREE.Vector3(-0.03, -0.5, 0.02),
  { x: -0.2, y: Math.PI, z: 0.6 },
  0.5
));

// ============================================================
// PETAL GEOMETRY
// ============================================================
function createPetalGeometry() {
  // Custom petal shape: wider at middle, tapered at base and tip
  const widthSegments = 12;
  const heightSegments = 20;
  const width = 0.5;
  const height = 1.2;

  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  const uvs = [];
  const normals = [];
  const indices = [];

  for (let iy = 0; iy <= heightSegments; iy++) {
    const v = iy / heightSegments;
    // Petal width profile: thin at base, wide in middle, thin at tip
    const widthProfile = Math.sin(v * Math.PI) * (1.0 - 0.3 * Math.pow(v, 3));
    const currentWidth = width * widthProfile;

    for (let ix = 0; ix <= widthSegments; ix++) {
      const u = ix / widthSegments;
      const x = (u - 0.5) * currentWidth;
      const y = v * height;
      // Slight natural curvature
      const z = Math.sin(u * Math.PI) * 0.05 * v;

      vertices.push(x, y, z);
      uvs.push(u, v);
      normals.push(0, 0, 1);
    }
  }

  for (let iy = 0; iy < heightSegments; iy++) {
    for (let ix = 0; ix < widthSegments; ix++) {
      const a = iy * (widthSegments + 1) + ix;
      const b = a + 1;
      const c = a + (widthSegments + 1);
      const d = c + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

const petalGeometry = createPetalGeometry();

// ============================================================
// CREATE PETALS IN LAYERS
// ============================================================

const petalMaterials = [];
const petalMeshes = [];
const petalLayers = [
  { count: 5, radius: 0.05, scale: 0.6, layerIndex: 0 },   // inner
  { count: 7, radius: 0.08, scale: 0.8, layerIndex: 0.3 },  // middle
  { count: 9, radius: 0.1, scale: 1.0, layerIndex: 0.6 },   // outer
  { count: 11, radius: 0.12, scale: 1.1, layerIndex: 1.0 },  // outermost
];

// Initial palette (first bloom will change it)
let currentPalette = FLOWER_PALETTES[0];

petalLayers.forEach((layer) => {
  for (let i = 0; i < layer.count; i++) {
    const angle = (i / layer.count) * Math.PI * 2 + layer.layerIndex * 0.3;

    const material = new THREE.ShaderMaterial({
      vertexShader: petalVert,
      fragmentShader: petalFrag,
      uniforms: {
        uBloom: { value: 0 },
        uTime: { value: 0 },
        uPetalIndex: { value: i + layer.layerIndex * 20 },
        uTotalPetals: { value: layer.count },
        uLayerIndex: { value: layer.layerIndex },
        uColorInner: { value: new THREE.Color(currentPalette.inner) },
        uColorOuter: { value: new THREE.Color(currentPalette.outer) },
        uColorVein: { value: new THREE.Color(currentPalette.vein) },
      },
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: true,
    });

    const mesh = new THREE.Mesh(petalGeometry, material);

    // Position at center, rotated around Y axis
    mesh.position.set(
      Math.cos(angle) * layer.radius,
      0,
      Math.sin(angle) * layer.radius
    );
    mesh.rotation.y = -angle + Math.PI / 2;
    mesh.scale.setScalar(layer.scale);

    flowerGroup.add(mesh);
    petalMaterials.push(material);
    petalMeshes.push(mesh);
  }
});

// ============================================================
// FLOWER CENTER (pistil/stamen)
// ============================================================
const centerGroup = new THREE.Group();
flowerGroup.add(centerGroup);

// Central dome
const centerGeo = new THREE.SphereGeometry(0.12, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
const centerMat = new THREE.MeshStandardMaterial({
  color: 0xfdd835,
  roughness: 0.6,
  metalness: 0.1,
  emissive: 0x443300,
  emissiveIntensity: 0.3,
});
const centerMesh = new THREE.Mesh(centerGeo, centerMat);
centerMesh.position.y = 0.05;
centerGroup.add(centerMesh);

// Tiny stamens
const stamenGeo = new THREE.CylinderGeometry(0.008, 0.004, 0.15, 4);
const stamenTipGeo = new THREE.SphereGeometry(0.015, 8, 8);

for (let i = 0; i < 12; i++) {
  const angle = (i / 12) * Math.PI * 2;
  const r = 0.06;
  const stamenMat = new THREE.MeshStandardMaterial({
    color: 0xffcc02,
    emissive: 0x664400,
    emissiveIntensity: 0.2,
  });

  const stamen = new THREE.Mesh(stamenGeo, stamenMat);
  stamen.position.set(Math.cos(angle) * r, 0.12, Math.sin(angle) * r);
  stamen.rotation.x = -Math.cos(angle) * 0.4;
  stamen.rotation.z = Math.sin(angle) * 0.4;
  centerGroup.add(stamen);

  const tip = new THREE.Mesh(stamenTipGeo, new THREE.MeshStandardMaterial({
    color: 0xff8800,
    roughness: 0.3,
  }));
  tip.position.set(
    Math.cos(angle) * (r + 0.03),
    0.19,
    Math.sin(angle) * (r + 0.03)
  );
  centerGroup.add(tip);
}

// ============================================================
// FLOATING PARTICLES (pollen / sparkles)
// ============================================================
const particleCount = 200;
const particlePositions = new Float32Array(particleCount * 3);
const particleSizes = new Float32Array(particleCount);
const particleAlphas = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const r = 0.5 + Math.random() * 2.0;
  particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
  particlePositions[i * 3 + 1] = Math.random() * 2.5 - 0.5;
  particlePositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  particleSizes[i] = Math.random() * 3.0 + 1.0;
  particleAlphas[i] = Math.random();
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
particleGeo.setAttribute('aSize', new THREE.BufferAttribute(particleSizes, 1));
particleGeo.setAttribute('aAlpha', new THREE.BufferAttribute(particleAlphas, 1));

const particleMat = new THREE.ShaderMaterial({
  vertexShader: /* glsl */`
    attribute float aSize;
    attribute float aAlpha;
    uniform float uTime;
    varying float vAlpha;
    
    void main() {
      vAlpha = aAlpha;
      vec3 pos = position;
      pos.y += sin(uTime * 0.5 + position.x * 2.0) * 0.1;
      pos.x += cos(uTime * 0.3 + position.z * 2.0) * 0.05;
      
      vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = aSize * (2.0 / -mvPos.z);
      gl_Position = projectionMatrix * mvPos;
    }
  `,
  fragmentShader: /* glsl */`
    uniform vec3 uParticleColor;
    varying float vAlpha;
    
    void main() {
      float d = length(gl_PointCoord - 0.5);
      float alpha = smoothstep(0.5, 0.1, d) * vAlpha * 0.4;
      gl_FragColor = vec4(uParticleColor, alpha);
    }
  `,
  uniforms: {
    uTime: { value: 0 },
    uParticleColor: { value: new THREE.Color(currentPalette.outer) },
  },
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});

const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// ============================================================
// POST-PROCESSING
// ============================================================
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.6,   // strength — subtle
  0.5,   // radius
  0.7    // threshold
);
composer.addPass(bloomPass);

// Vignette + grain
const vignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float uTime;
    varying vec2 vUv;
    
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      
      // Vignette
      float vignette = smoothstep(0.8, 0.35, length(vUv - 0.5));
      color.rgb *= vignette;
      
      // Subtle film grain
      float grain = fract(sin(dot(vUv * 200.0 + uTime * 10.0, vec2(12.9898, 78.233))) * 43758.5453);
      color.rgb += (grain - 0.5) * 0.025;
      
      gl_FragColor = color;
    }
  `,
};

const vignettePass = new ShaderPass(vignetteShader);
composer.addPass(vignettePass);

function applyResponsiveCamera() {
  const isMobile = window.innerWidth <= 768;
  camera.fov = isMobile ? 58 : 50;
  interaction.targetOrbitRadius = isMobile ? 5.35 : 4.6;
  interaction.orbitRadius = interaction.targetOrbitRadius;
  interaction.autoRotateSpeed = isMobile ? 0.12 : 0.18;
  interaction.orbitPolar = isMobile ? 1.02 : 1.08;
  interaction.targetOrbitPolar = interaction.orbitPolar;
  const sinPolarRadius = Math.sin(interaction.orbitPolar) * interaction.orbitRadius;
  camera.position.set(
    Math.sin(interaction.orbitAzimuth) * sinPolarRadius,
    cameraTarget.y + Math.cos(interaction.orbitPolar) * interaction.orbitRadius,
    Math.cos(interaction.orbitAzimuth) * sinPolarRadius
  );
  camera.lookAt(cameraTarget);
  camera.updateProjectionMatrix();
}

applyResponsiveCamera();

window.setTimeout(() => {
  const hint = document.getElementById('gestureHint');
  if (hint && !interaction.isDragging) {
    hint.classList.add('is-hidden');
  }
}, 4200);

// ============================================================
// BLOOM ACTION
// ============================================================
let bloomCount = 0;
let usedIndices = [];
let isAnimating = false;
let currentBloomValue = 0;

function getNextPalette() {
  if (usedIndices.length >= FLOWER_PALETTES.length) {
    usedIndices = [];
  }
  let idx;
  do {
    idx = Math.floor(Math.random() * FLOWER_PALETTES.length);
  } while (usedIndices.includes(idx));
  usedIndices.push(idx);
  return FLOWER_PALETTES[idx];
}

function triggerBloom() {
  if (isAnimating) return;
  isAnimating = true;
  bloomCount++;
  document.getElementById('bloomCount').textContent = bloomCount;

  const palette = getNextPalette();
  currentPalette = palette;

  const colorNameEl = document.getElementById('colorName');
  colorNameEl.textContent = palette.name;
  gsap.fromTo(colorNameEl, { opacity: 0 }, { opacity: 1, duration: 0.5 });

  // Step 1: Close flower (go back to bud)
  const tl = gsap.timeline({
    onComplete: () => { isAnimating = false; },
  });

  tl.to({ v: currentBloomValue }, {
    v: 0,
    duration: 0.8,
    ease: 'power2.inOut',
    onUpdate: function () {
      currentBloomValue = this.targets()[0].v;
      petalMaterials.forEach(m => { m.uniforms.uBloom.value = currentBloomValue; });
    },
  });

  // Step 2: Change colors while closed
  tl.call(() => {
    const innerCol = new THREE.Color(palette.inner);
    const outerCol = new THREE.Color(palette.outer);
    const veinCol = new THREE.Color(palette.vein);

    petalMaterials.forEach(m => {
      gsap.to(m.uniforms.uColorInner.value, { r: innerCol.r, g: innerCol.g, b: innerCol.b, duration: 0.3 });
      gsap.to(m.uniforms.uColorOuter.value, { r: outerCol.r, g: outerCol.g, b: outerCol.b, duration: 0.3 });
      gsap.to(m.uniforms.uColorVein.value, { r: veinCol.r, g: veinCol.g, b: veinCol.b, duration: 0.3 });
    });

    // Change center color
    gsap.to(centerMat.emissive, {
      r: outerCol.r * 0.3,
      g: outerCol.g * 0.3,
      b: outerCol.b * 0.3,
      duration: 0.3,
    });

    // Change particle color
    gsap.to(particleMat.uniforms.uParticleColor.value, {
      r: outerCol.r,
      g: outerCol.g,
      b: outerCol.b,
      duration: 0.5,
    });

    // Change background
    const bg1 = new THREE.Color(palette.bg1);
    const bg2 = new THREE.Color(palette.bg2);
    gsap.to(bgMaterial.uniforms.uColor1.value, { r: bg1.r, g: bg1.g, b: bg1.b, duration: 0.8 });
    gsap.to(bgMaterial.uniforms.uColor2.value, { r: bg2.r, g: bg2.g, b: bg2.b, duration: 0.8 });

    // Button glow with flower color
    const btn = document.getElementById('bloomBtn');
    btn.style.borderColor = palette.outer + '40';
  }, null, '+=0.1');

  // Step 3: Bloom open
  tl.to({ v: 0 }, {
    v: 1,
    duration: 2.0,
    ease: 'power2.out',
    onUpdate: function () {
      currentBloomValue = this.targets()[0].v;
      petalMaterials.forEach(m => { m.uniforms.uBloom.value = currentBloomValue; });
    },
  }, '+=0.3');

  // Step 4: Bloom flash on post-processing
  tl.to(bloomPass, {
    strength: 1.5,
    duration: 0.4,
    ease: 'power2.in',
  }, '-=1.5');
  tl.to(bloomPass, {
    strength: 0.6,
    duration: 1.0,
    ease: 'power2.out',
  }, '-=1.0');
}

// Button listener
document.getElementById('bloomBtn').addEventListener('click', triggerBloom);

// Keyboard shortcut
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    triggerBloom();
  }
});

// ============================================================
// RESIZE
// ============================================================
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  applyResponsiveCamera();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  composer.setSize(window.innerWidth, window.innerHeight);
});

// ============================================================
// ANIMATION LOOP
// ============================================================
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const elapsed = clock.elapsedTime;

  // Smooth mouse
  interaction.x += (interaction.targetX - interaction.x) * 0.06;
  interaction.y += (interaction.targetY - interaction.y) * 0.06;

  // Update all uniforms
  petalMaterials.forEach(m => {
    m.uniforms.uTime.value = elapsed;
  });

  bgMaterial.uniforms.uTime.value = elapsed;
  particleMat.uniforms.uTime.value = elapsed;
  vignetteShader.uniforms.uTime.value = elapsed;

  if (!interaction.isDragging) {
    interaction.targetOrbitAzimuth += interaction.autoRotateSpeed * delta;
    interaction.targetOrbitAzimuth += interaction.azimuthVelocity;
    interaction.targetOrbitPolar = THREE.MathUtils.clamp(
      interaction.targetOrbitPolar + interaction.polarVelocity,
      0.45,
      1.45
    );
    interaction.azimuthVelocity *= 0.94;
    interaction.polarVelocity *= 0.9;
  }

  interaction.orbitAzimuth = THREE.MathUtils.lerp(interaction.orbitAzimuth, interaction.targetOrbitAzimuth, 0.06);
  interaction.orbitPolar = THREE.MathUtils.lerp(interaction.orbitPolar, interaction.targetOrbitPolar, 0.08);
  interaction.orbitRadius = THREE.MathUtils.lerp(interaction.orbitRadius, interaction.targetOrbitRadius, 0.08);

  const sinPolarRadius = Math.sin(interaction.orbitPolar) * interaction.orbitRadius;
  camera.position.set(
    cameraTarget.x + Math.sin(interaction.orbitAzimuth) * sinPolarRadius,
    cameraTarget.y + Math.cos(interaction.orbitPolar) * interaction.orbitRadius,
    cameraTarget.z + Math.cos(interaction.orbitAzimuth) * sinPolarRadius
  );
  camera.lookAt(cameraTarget);

  const targetLeanX = -0.08 + interaction.y * 0.08 + Math.sin(elapsed * 0.9) * 0.025 + interaction.polarVelocity * 18.0;
  const targetLeanZ = interaction.x * 0.1 + Math.sin(interaction.orbitAzimuth + elapsed * 0.6) * 0.03 - interaction.azimuthVelocity * 24.0;
  interaction.leanX = THREE.MathUtils.lerp(interaction.leanX, targetLeanX, 0.06);
  interaction.leanZ = THREE.MathUtils.lerp(interaction.leanZ, targetLeanZ, 0.06);

  flowerGroup.rotation.x = interaction.leanX;
  flowerGroup.rotation.z = interaction.leanZ;
  centerGroup.rotation.y = elapsed * 0.2;

  // Particles float
  particles.rotation.y = elapsed * 0.05;
  particles.rotation.x = Math.sin(elapsed * 0.2) * 0.08;

  // Render
  renderer.autoClear = false;
  renderer.clear();

  // Background pass
  renderer.render(bgScene, bgCamera);

  // Main scene with post-processing
  composer.render();
}

// ============================================================
// INITIAL STATE — show bud, then do first bloom
// ============================================================
petalMaterials.forEach(m => { m.uniforms.uBloom.value = 0; });

// Entrance animation
gsap.from(camera.position, { z: 8, y: 3, duration: 2.5, ease: 'power3.out' });
gsap.from(flowerGroup.scale, { x: 0, y: 0, z: 0, duration: 1.5, ease: 'elastic.out(1, 0.5)', delay: 0.3 });

animate();
