# Zane (`@zane-tv`) — Cinematic 3D Personal Portfolio

**Vietnamese Heritage × Future Technology** — An interactive 3D personal portfolio built with **Next.js (App Router), TypeScript, React Three Fiber, Three.js, GSAP, and Tailwind CSS**.

Reinterprets the sacred geometry of the **Đông Sơn bronze drum** (*Trống Đồng Ngọc Lũ*) and flying **Chim Lạc / Chim Hạc** into a real-time 3D WebGL & editorial showcase for **Zane (`@zane-tv`)**.

---

## Signature Cinematic 3D Intro (`awakening → craneFlight → transformation → drumReveal → portraitReveal → heroAssembly → idle`)

Orchestrated by a single master GSAP timeline (`src/components/three/IntroTimeline.tsx`):

1. **Act I — Awakening**: Anamorphic 2.39:1 cinema bars frame drifting bronze dust motes and a sweeping golden spotlight awakening an ancient ring imprint.
2. **Act II — Sculpted 3D Chim Lạc Flight**: A 46-slice lofted 3D Vietnamese Chim Hạc/Lạc (68 cambered 3-tier feathers, crimson imperial crown, royal 5-plume crest, trailing crane legs, and dual molten-gold wingtip calligraphy ribbons) sweeps across the viewport along a `THREE.CatmullRomCurve3` spline.
3. **Act III — Merging into the Đông Sơn Bronze Drum**: Circling counter-clockwise along the drum's `r = 1.31` heritage band, the 3D Chim Lạc banks flat into the drum plane, transmutes into incandescent cast gold, and **stamps directly into Lead Bird Slot #0 at 12-o'clock** — unleashing a golden shockwave across all 8 Ngọc Lũ concentric bands (faceted 14-ray sun, 14 peacock-feather diamond eyes, interlocking lozenge meanders, 18+32 tangent-linked circles with 3D bronze bosses, 160 radial comb teeth, 16 sculpted Chim Lạc reliefs with feather-comb engravings, and 4 cardinal bosses).
4. **Act IV — Portrait Revelation**: Zane's portrait (`/public/images/portrait.webp`) emerges from the center of the drum through a custom GLSL 14-harmonic radial iris shader.
5. **Act V — Portrait Flight & Hero Assembly**: The cinema bars retract while Zane's portrait and rotating cast-bronze Đông Sơn collar glide along a 3D curved Bezier arc into the right-hand Hero medallion, synchronized sub-pixel 1:1 with the DOM portrait and staggered editorial typography on the left.

Includes **Skip Intro** (`Esc`), **Replay Intro**, `prefers-reduced-motion` instant completion, offscreen WebGL pause, and a multi-band SVG Đông Sơn halo fallback when WebGL is unavailable.

---

## Customization & Asset Replacement

- **Single Typed Configuration**: `src/config/portfolio.ts`
- **Portrait Asset**: Replace `public/images/portrait.webp` (`1024×1024` WebP) or replace `public/images/portrait-source.jpg` and run `npm run generate:assets`.
- **3D Crane GLB**: `public/models/crane.glb` + procedural 68-feather rig in `src/components/three/CraneModel.tsx`.
- **Project Artworks**: `public/images/projects/*.webp`.
- **Live Server-Side GitHub Telemetry**: `src/lib/github.ts` fetches live `@zane-tv` repositories, stars, forks, byte-accurate language distribution, and 52-week contribution cadence with 1-hour server-side caching (`Optional: set GITHUB_TOKEN in .env.local for 5,000 req/hr`).

---

## Commands

```bash
npm install
npm run dev            # Start local dev server
npm run typecheck      # Strict TypeScript check
npm run build          # Production Next.js build
npm run generate:assets # Regenerate WebP artworks & binary glTF crane
```
