# Zane (`@zane-tv`) — Cinematic 3D Personal Portfolio

**Vietnamese Heritage × Future Technology** — A bilingual (`EN` / `VI`) interactive 3D personal portfolio built with **Next.js (App Router), TypeScript, React Three Fiber, Three.js, GSAP, and Tailwind CSS**.

Reinterprets the sacred geometry of the **Đông Sơn bronze drum** (*Trống Đồng Ngọc Lũ*) and flying **Chim Lạc / Chim Hạc** into a real-time 3D WebGL & editorial showcase for **Trương Văn Tiến — Zane (`@zane-tv`)**.

---

## Signature Cinematic 3D Intro & Interactive Layer

Orchestrated by a single master GSAP timeline (`src/components/three/IntroTimeline.tsx`):

1. **Act I — Awakening**: Pure borderless cinema stage with drifting bronze dust motes and a volumetric 14-ray Đông Sơn solar corona.
2. **Act II — Sculpted 3D Chim Lạc Flight**: A 46-slice lofted 3D Vietnamese Chim Hạc/Lạc (68 cambered 3-tier feathers, crimson imperial crown, royal 5-plume crest, trailing crane legs, and dual molten-gold wingtip calligraphy ribbons) sweeps across the viewport along a `THREE.CatmullRomCurve3` spline.
3. **Act III — Velocity-Matched Merge into the Đông Sơn Bronze Drum**: Spiraling counter-clockwise along the drum's `r = 1.31` heritage band at matching angular velocity, the 3D Chim Lạc morphs smoothly into the swept-back Ngọc Lũ relief profile and **melts directly into Lead Bird Slot #0** — unleashing a full-page golden-patina shockwave aura.
4. **Act IV — Portrait Revelation**: Zane's portrait (`/public/images/portrait.webp`) emerges from the center of the drum with 1:1 sRGB color fidelity through a custom GLSL 14-harmonic radial iris shader.
5. **Act V — Portrait Flight & Hero Assembly**: Zane's portrait and sleek rotating Đông Sơn collar (`r = 1.01 .. 1.605`) glide along a 3D curved Bezier arc into the right-hand Hero medallion, synchronized sub-pixel 1:1 with the DOM portrait, transparent Hero navigation bar, and staggered editorial typography.

### Global Visual-Only Interactive Layer
- **Faceted Đông Sơn × Cyber-Spearhead Cursor & Fairy Dust**: Hardware Retina `1x`/`2x` custom cursor paired with a magnetic 14-ray HUD reticle, sparkling golden/patina fairy-dust (`bụi tiên`) trail, and click ripples.
- **Full-Page Drum-Beat Resonance Aura**: Interactive and periodic drum strikes radiate full-viewport golden-bronze & emerald-patina light waves with subtle visual micro-shake (purely visual, zero audio).
- **Bilingual (`EN` Default / `VI`)**: Instant client-side switching across all sections, telemetry, and accessibility labels.

---

## Commands

```bash
npm install
npm run dev             # Start local dev server
npm run typecheck       # Strict TypeScript check
npm run build           # Production Next.js build
npm run generate:assets # Regenerate WebP artworks, Retina cursors & binary glTF assets
```
