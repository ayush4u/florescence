# florescence

> An infinite, interactive 3D flower built with WebGL — every bloom is a different flower.

![florescence](https://img.shields.io/badge/three.js-r162-black?logo=three.js&logoColor=white)
![florescence](https://img.shields.io/badge/gsap-3.12-green?logo=greensock&logoColor=white)
![florescence](https://img.shields.io/badge/vite-5-646cff?logo=vite&logoColor=white)
![florescence](https://img.shields.io/badge/license-MIT-blue)

---

## What is this?

**florescence** is a real-time 3D flower rendered entirely with custom GLSL shaders. Hit **Bloom** and watch the petals close, shift to a completely different color palette, then re-open. Orbit it from any angle — look at it from the side, peer down from above, or just let it slowly spin.

No two blooms look quite the same. Twenty hand-picked palettes cycle through without repeating.

---

## Features

- **Custom petal shader** — per-petal bloom animation, vein patterns, subsurface scattering, fresnel sheen, and natural edge softening, all in GLSL
- **4-layer petal geometry** — inner bud through outermost petals, each with its own opening timing and curl
- **20 unique color palettes** — Rose Blush, Electric Orchid, Midnight Iris, Sunfire, and 16 more
- **Orbit camera** — drag or swipe to rotate 360° horizontally, tilt up to look at the flower from above
- **Natural organic lean** — the flower sways gently on the stem; inertia carries through drag gestures
- **Floating pollen particles** — 200 additive-blended sparkles drifting around the scene
- **Post-processing** — Unreal Bloom, film vignette, subtle grain
- **ACES filmic tone mapping** — cinematic color rendition
- **Mobile-first** — pointer capture for reliable touch drag, responsive camera FOV and position, no layout shifts
- **60fps** — pixel ratio capped at 2, no unnecessary draw calls

---

## Tech stack

| Layer | Library |
|---|---|
| 3D rendering | [Three.js](https://threejs.org/) r162 |
| Shaders | Custom GLSL (vertex + fragment per object) |
| Animation | [GSAP](https://gsap.com/) 3.12 |
| Post-processing | `three/examples/jsm/postprocessing` |
| Build | [Vite](https://vitejs.dev/) 5 |

---

## Getting started

```bash
# clone
git clone https://github.com/YOUR_USERNAME/florescence.git
cd florescence

# install
npm install

# develop (hot reload)
npm run dev

# production build
npm run build

# preview production build
npm run preview
```

Open `http://localhost:5173` in any modern browser.

---

## Controls

| Input | Action |
|---|---|
| **Click / tap** — Bloom button | Close bud → new palette → open |
| **Space** | Same as Bloom button |
| **Drag left / right** | Orbit around the flower |
| **Drag up** | Tilt camera upward (top-down view) |
| **Drag down** | Return to eye-level view |
| Release drag | Inertia carries the spin naturally |

---

## Project structure

```
florescence/
├── index.html
├── package.json
├── src/
│   ├── main.js              # scene, interaction, animation loop
│   └── shaders/
│       ├── petal.vert       # bloom animation, curl, twist, wind
│       ├── petal.frag       # color, veins, SSS, fresnel, edge alpha
│       ├── background.vert
│       └── background.frag  # animated radial gradient + vignette
└── public/
```

---

## Deployment

The project deploys automatically to **GitHub Pages** via the included Actions workflow whenever you push to `main`.

Live URL after setup: `https://YOUR_USERNAME.github.io/florescence/`

To set up:
1. Push this repo to GitHub as `florescence`
2. Go to **Settings → Pages → Source** and select **GitHub Actions**
3. Push to `main` — that's it

---

## License

MIT — do whatever you want with it.
