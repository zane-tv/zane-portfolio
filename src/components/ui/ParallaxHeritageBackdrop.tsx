"use client";

import { useEffect, useRef, useState } from "react";
import {
  introMotionState,
  subscribeDrumStrikes,
  triggerDrumStrike,
  useIntroStore,
  type DrumStrikeKind,
} from "@/store/introStore";
import { getLocalizedPortfolio } from "@/config/i18n";
import { useLocaleStore } from "@/store/localeStore";
import { fairyDustPool, MAX_FAIRY_DUST } from "@/components/ui/DongSonCursor";
import {
  buildPeacockWedgesPath,
  buildSunPolygonPoints,
  LacBirdGlyph,
  SunFourteenIcon,
} from "@/components/ui/DongSonMotifs";

interface ActiveAuraWave {
  nx: number;
  ny: number;
  age: number;
  duration: number;
  strength: number;
  kind: DrumStrikeKind;
}

interface EmberParticle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  phase: number;
  swayAmp: number;
  isPatina: boolean;
  alpha: number;
}

const SECTION_ANCHORS = [
  { href: "#top", label: "01 · Hero" },
  { href: "#expertise", label: "02 · Disciplines" },
  { href: "#projects", label: "03 · Artifacts" },
  { href: "#telemetry", label: "04 · Telemetry" },
  { href: "#journey", label: "05 · Journey" },
  { href: "#contact", label: "06 · Horizon" },
] as const;

/** Pre-bakes a soft glowing orb sprite once at mount so particles use fast GPU texture blits */
function createOrbSprite(innerRgba: string, midRgba: string, outerRgba: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 32;
  c.height = 32;
  const gCtx = c.getContext("2d");
  if (gCtx) {
    const g = gCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, innerRgba);
    g.addColorStop(0.42, midRgba);
    g.addColorStop(1, outerRgba);
    gCtx.fillStyle = g;
    gCtx.fillRect(0, 0, 32, 32);
  }
  return c;
}

/** Pre-bakes a 4-point fairy-dust starlet sprite once at mount (zero per-frame path math!) */
function createFairyStarSprite(coreColor: string, glowColor: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 32;
  c.height = 32;
  const gCtx = c.getContext("2d");
  if (gCtx) {
    const g = gCtx.createRadialGradient(16, 16, 0, 16, 16, 15);
    g.addColorStop(0, coreColor);
    g.addColorStop(0.35, glowColor);
    g.addColorStop(1, "rgba(0,0,0,0)");
    gCtx.fillStyle = g;
    gCtx.fillRect(0, 0, 32, 32);

    // Crisp 4-point fairy star cross
    gCtx.fillStyle = coreColor;
    gCtx.beginPath();
    gCtx.moveTo(16, 1);
    gCtx.quadraticCurveTo(17.5, 14.5, 31, 16);
    gCtx.quadraticCurveTo(17.5, 17.5, 16, 31);
    gCtx.quadraticCurveTo(14.5, 17.5, 1, 16);
    gCtx.quadraticCurveTo(14.5, 14.5, 16, 1);
    gCtx.fill();
  }
  return c;
}

/**
 * GPU-Optimized Heritage × Future Background & Unified Full-Page Aura + Fairy-Dust Engine:
 * - Zero `filter: blur()` on animated fullscreen aurora layers (uses native smooth radial gradients).
 * - Single `dpr = 1` 2D `<canvas>` rendering Drum-Beat Shockwave Auras, Rising Embers, AND
 *   Chim Lạc Cursor Fairy Dust (`bụi tiên`) via pre-baked offscreen sprite stamps (`drawImage`)!
 * - Automatically pauses when browser tab is hidden to keep idle GPU load minimal.
 */
export function ParallaxHeritageBackdrop() {
  const [scrollDeg, setScrollDeg] = useState(0);
  const [beatActive, setBeatActive] = useState(false);
  const auraCanvasRef = useRef<HTMLCanvasElement>(null);
  const torchRef = useRef<HTMLDivElement>(null);
  const compassBtnRef = useRef<HTMLButtonElement>(null);

  const isIntroComplete = useIntroStore((s) => s.isIntroComplete);
  const reducedMotion = useIntroStore((s) => s.reducedMotion);
  const locale = useLocaleStore((s) => s.locale);
  const { ui } = getLocalizedPortfolio(locale);

  useEffect(() => {
    const onScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const deg = Math.round((window.scrollY / maxScroll) * 360);
      setScrollDeg((prev) => {
        const clamped = Math.min(360, Math.max(0, deg));
        return prev === clamped ? prev : clamped;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Pointer-reactive bronze & patina torchlight (updates DOM style directly without re-render)
  useEffect(() => {
    if (reducedMotion) return;
    let pending = false;
    let px = 0;
    let py = 0;
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (pending) return;
      pending = true;
      window.requestAnimationFrame(() => {
        pending = false;
        if (torchRef.current) {
          torchRef.current.style.background = `radial-gradient(640px circle at ${px}px ${py}px, rgba(210, 154, 92, 0.105), rgba(115, 195, 169, 0.04) 42%, transparent 72%)`;
        }
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reducedMotion]);

  // Unified GPU-Friendly `dpr = 1` Sprite Canvas (Aura Waves + Embers + Cursor Fairy Dust)
  useEffect(() => {
    const canvas = auraCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // dpr = 1 cuts Retina 2D canvas fill-rate by 75% while keeping soft glows & sparkles identical!
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // Pre-baked sprites (zero per-particle gradient creation!)
    const goldOrb = createOrbSprite(
      "rgba(255, 240, 206, 1)",
      "rgba(210, 154, 92, 0.58)",
      "rgba(210, 154, 92, 0)"
    );
    const patinaOrb = createOrbSprite(
      "rgba(185, 248, 228, 1)",
      "rgba(115, 195, 169, 0.55)",
      "rgba(115, 195, 169, 0)"
    );
    const goldStar = createFairyStarSprite("#fff8e7", "rgba(239, 198, 140, 0.65)");
    const patinaStar = createFairyStarSprite("#e8fff7", "rgba(115, 195, 169, 0.65)");

    const emberCount = width < 768 ? 22 : 42;
    const embers: EmberParticle[] = Array.from({ length: emberCount }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 6 + Math.random() * 10,
      speedY: 11 + Math.random() * 20,
      phase: Math.random() * Math.PI * 2,
      swayAmp: 12 + Math.random() * 24,
      isPatina: i % 4 === 0,
      alpha: 0.28 + Math.random() * 0.48,
    }));

    const waves: ActiveAuraWave[] = [];
    let pulseUiTimeout: number | undefined;

    const resolveDefaultEpicenter = (): { nx: number; ny: number } => {
      const scrollRatio = window.scrollY / Math.max(1, window.innerHeight);
      if (scrollRatio < 0.72) {
        return {
          nx: introMotionState.drumScreenNx,
          ny: introMotionState.drumScreenNy,
        };
      }
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if (window.scrollY / maxScroll > 0.88) {
        return { nx: 0.5, ny: 0.72 };
      }
      if (compassBtnRef.current) {
        const r = compassBtnRef.current.getBoundingClientRect();
        if (r.width > 0) {
          return {
            nx: (r.left + r.width * 0.5) / Math.max(1, width),
            ny: (r.top + r.height * 0.5) / Math.max(1, height),
          };
        }
      }
      return { nx: 0.5, ny: 0.5 };
    };

    const unsubscribe = subscribeDrumStrikes((ev) => {
      if (useIntroStore.getState().reducedMotion && ev.kind === "heartbeat") return;
      const fallback = resolveDefaultEpicenter();
      waves.push({
        nx: ev.nx ?? fallback.nx,
        ny: ev.ny ?? fallback.ny,
        age: 0,
        duration: ev.kind === "sun" ? 2.3 : 2.0,
        strength: ev.strength ?? 0.9,
        kind: ev.kind ?? "heartbeat",
      });
      if (waves.length > 4) waves.shift();

      setBeatActive(true);
      window.clearTimeout(pulseUiTimeout);
      pulseUiTimeout = window.setTimeout(() => setBeatActive(false), 620);
    });

    let heartbeatTimer = 0;
    let lastTime = performance.now();
    let rafId = 0;
    let lastCssPulse = -1;

    const render = (now: number) => {
      rafId = window.requestAnimationFrame(render);
      if (document.hidden) {
        lastTime = now;
        return;
      }

      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      const sec = now * 0.001;

      const storeState = useIntroStore.getState();
      if (storeState.isIntroComplete && !storeState.reducedMotion) {
        heartbeatTimer += dt;
        if (heartbeatTimer >= 5.4) {
          heartbeatTimer = 0;
          triggerDrumStrike({ strength: 0.86, kind: "heartbeat" });
        }
      }

      ctx.clearRect(0, 0, width, height);

      let maxBeatPulse = 0;
      let leadWaveProgress = 0;
      let leadWaveStrength = 0;
      const maxDiag = Math.hypot(width, height) * 1.1;

      // 1) Full-Page Expanding Đông Sơn Drum-Beat Shockwave Auras
      for (let i = waves.length - 1; i >= 0; i--) {
        const w = waves[i]!;
        w.age += dt;
        const p = w.age / w.duration;
        if (p >= 1) {
          waves.splice(i, 1);
          continue;
        }

        const eased = 1 - Math.pow(1 - p, 3.1);
        const fade = Math.sin(p * Math.PI) * Math.pow(1 - p, 0.55) * w.strength;

        if (fade > maxBeatPulse) {
          maxBeatPulse = fade;
          leadWaveProgress = p;
          leadWaveStrength = w.strength;
        }

        const cx = w.nx * width;
        const cy = w.ny * height;
        const radius = Math.max(20, eased * maxDiag);
        const bandWidth = Math.max(90, maxDiag * 0.15);
        const rInner = Math.max(0, radius - bandWidth);
        const rOuter = radius + bandWidth * 0.36;

        // Tightly bound fill box to the circle's AABB to save GPU overdraw when wave is small!
        const bx = Math.max(0, cx - rOuter);
        const by = Math.max(0, cy - rOuter);
        const bw = Math.min(width - bx, cx + rOuter - bx);
        const bh = Math.min(height - by, cy + rOuter - by);

        if (bw > 0 && bh > 0) {
          const gradGold = ctx.createRadialGradient(cx, cy, rInner, cx, cy, rOuter);
          const innerStop = rInner / Math.max(1, rOuter);
          const peakStop = Math.min(0.96, radius / Math.max(1, rOuter));
          gradGold.addColorStop(0, "rgba(210, 154, 92, 0)");
          gradGold.addColorStop(Math.max(0, innerStop), "rgba(210, 154, 92, 0)");
          gradGold.addColorStop(
            peakStop * 0.9 + innerStop * 0.1,
            `rgba(210, 154, 92, ${(0.15 * fade).toFixed(3)})`
          );
          gradGold.addColorStop(peakStop, `rgba(248, 216, 160, ${(0.32 * fade).toFixed(3)})`);
          gradGold.addColorStop(1, "rgba(210, 154, 92, 0)");

          ctx.fillStyle = gradGold;
          ctx.fillRect(bx, by, bw, bh);
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(246, 213, 155, ${(0.4 * fade).toFixed(3)})`;
        ctx.lineWidth = 1.6;
        ctx.stroke();

        const echoRadius = radius * 0.84;
        if (echoRadius > 18) {
          ctx.beginPath();
          ctx.arc(cx, cy, echoRadius, 0, Math.PI * 2);
          ctx.setLineDash([8, 12]);
          ctx.strokeStyle = `rgba(115, 195, 169, ${(0.32 * fade).toFixed(3)})`;
          ctx.lineWidth = 1.25;
          ctx.stroke();
        }

        if (p < 0.34) {
          const flash = Math.sin((p / 0.34) * Math.PI) * w.strength;
          const burstR = 72 + p * 220;
          ctx.globalAlpha = Math.min(1, 0.55 * flash);
          ctx.drawImage(goldOrb, cx - burstR, cy - burstR, burstR * 2, burstR * 2);
          ctx.globalAlpha = 1;
        }
        ctx.restore();
      }

      // Sync with 3D WebGL BronzeDrum & throttled CSS `--drum-aura-pulse`
      introMotionState.globalDrumBeatWave = leadWaveProgress;
      introMotionState.globalDrumBeatStrength = leadWaveStrength;
      const roundedPulse = Math.round(Math.min(1, maxBeatPulse) * 100) / 100;
      if (roundedPulse !== lastCssPulse) {
        lastCssPulse = roundedPulse;
        document.documentElement.style.setProperty("--drum-aura-pulse", roundedPulse.toFixed(2));
      }

      if (!storeState.reducedMotion) {
        // 2) Rising Background Embers via Fast Sprite Blits (`drawImage`)
        const speedBoost = 1 + maxBeatPulse * 2.5;
        for (const e of embers) {
          e.y -= e.speedY * speedBoost * dt;
          if (e.y < -16) {
            e.y = height + 16;
            e.x = Math.random() * width;
          }
          const drawX = e.x + Math.sin(sec * 0.9 + e.phase) * e.swayAmp;
          const twinkle = 0.55 + 0.45 * Math.sin(sec * 2.1 + e.phase * 2.0);
          ctx.globalAlpha = Math.min(0.92, e.alpha * twinkle * (1 + maxBeatPulse * 0.8));
          const sz = e.size * (1 + maxBeatPulse * 0.45);
          ctx.drawImage(e.isPatina ? patinaOrb : goldOrb, drawX - sz * 0.5, e.y - sz * 0.5, sz, sz);
        }

        // 3) Chim Lạc Cursor Fairy Dust (`bụi tiên`) via Fast 4-Point Star Sprite Blits!
        for (let i = 0; i < MAX_FAIRY_DUST; i++) {
          const fp = fairyDustPool[i]!;
          if (fp.age >= fp.life) continue;
          fp.age += dt;
          fp.x += fp.vx * dt;
          fp.y += fp.vy * dt;
          fp.vx *= 0.96;
          fp.rot += fp.vRot * dt;

          const u = fp.age / fp.life;
          const sparkle = (1 - u) * (0.65 + 0.35 * Math.sin(fp.age * 24));
          const sz = fp.size * (1 - u * 0.55);

          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, sparkle));
          ctx.translate(fp.x, fp.y);
          ctx.rotate(fp.rot);
          ctx.drawImage(
            fp.isPatina ? patinaStar : goldStar,
            -sz * 0.5,
            -sz * 0.5,
            sz,
            sz
          );
          ctx.restore();
        }
        ctx.globalAlpha = 1;
      }
    };

    rafId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(pulseUiTimeout);
      window.removeEventListener("resize", resize);
      unsubscribe();
    };
  }, []);

  const leftFeathers = buildPeacockWedgesPath(200, 200, 14, 42, 92, 3);
  const rightFeathers = buildPeacockWedgesPath(200, 200, 14, 48, 106, 3);

  const handleCompassStrike = () => {
    if (compassBtnRef.current) {
      const r = compassBtnRef.current.getBoundingClientRect();
      triggerDrumStrike({
        nx: (r.left + r.width * 0.5) / Math.max(1, window.innerWidth),
        ny: (r.top + r.height * 0.5) / Math.max(1, window.innerHeight),
        strength: 1.25,
        kind: "manual",
      });
    } else {
      triggerDrumStrike({ strength: 1.25, kind: "manual" });
    }
  };

  return (
    <>
      {/* LAYER 1: Zero-Blur Pre-Softened Aurora Gradients, Circuit Traces & Rotating Đông Sơn Drums */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      >
        {/* Smooth Radial Gradients WITHOUT expensive CSS `filter: blur(64px)`! */}
        <div className="animate-aurora-drift absolute -top-[22vh] -left-[16vw] h-[84vh] w-[72vw] bg-[radial-gradient(closest-side,rgba(210,154,92,0.145)_0%,rgba(153,96,31,0.055)_48%,transparent_100%)] will-change-transform" />
        <div className="animate-aurora-drift-reverse absolute top-[26vh] -right-[18vw] h-[86vh] w-[68vw] bg-[radial-gradient(closest-side,rgba(115,195,169,0.125)_0%,rgba(210,154,92,0.04)_52%,transparent_100%)] will-change-transform" />
        <div className="absolute -bottom-[24vh] left-[18vw] h-[64vh] w-[64vw] bg-[radial-gradient(closest-side,rgba(210,154,92,0.11)_0%,transparent_100%)]" />

        {/* Architectural Museum Meridian Grid Lines */}
        <div className="editorial-container relative h-full">
          <div className="absolute inset-y-0 left-[var(--space-container-x)] w-[1px] bg-gradient-to-b from-transparent via-[rgba(210,154,92,0.12)] to-transparent" />
          <div className="absolute inset-y-0 left-1/2 hidden w-[1px] bg-gradient-to-b from-transparent via-[rgba(236,230,219,0.05)] to-transparent lg:block" />
          <div className="absolute inset-y-0 right-[var(--space-container-x)] w-[1px] bg-gradient-to-b from-transparent via-[rgba(115,195,169,0.11)] to-transparent" />
        </div>

        {/* Avatar-Inspired 45° Golden Cyber-Heritage Circuit Constellations */}
        <svg
          viewBox="0 0 640 320"
          fill="none"
          className="absolute top-6 right-0 hidden h-[270px] w-[540px] opacity-45 md:block"
        >
          <path
            d="M 110 210 L 185 135 L 285 135 L 350 70 L 520 70 L 575 15"
            stroke="var(--color-bronze)"
            strokeOpacity="0.45"
            strokeWidth="1.4"
          />
          <path
            d="M 110 210 L 185 135 L 285 135 L 350 70 L 520 70 L 575 15"
            stroke="var(--color-bronze-bright)"
            strokeWidth="2"
            strokeDasharray="36 260"
            className="animate-circuit-flow"
          />
          <path
            d="M 180 235 L 245 170 L 375 170 L 435 110 L 620 110"
            stroke="var(--color-patina)"
            strokeOpacity="0.38"
            strokeWidth="1.2"
          />
          {[
            [110, 210],
            [285, 135],
            [435, 110],
            [520, 70],
          ].map(([cx, cy], idx) => (
            <g key={idx}>
              <circle cx={cx} cy={cy} r="6" fill="var(--color-bronze)" fillOpacity="0.25" />
              <circle cx={cx} cy={cy} r="2.6" fill="#fff3d6" />
            </g>
          ))}
        </svg>

        <svg
          viewBox="0 0 640 300"
          fill="none"
          className="absolute bottom-8 left-0 hidden h-[240px] w-[500px] opacity-40 md:block"
        >
          <path
            d="M 10 265 L 95 180 L 235 180 L 305 110 L 465 110"
            stroke="var(--color-patina)"
            strokeOpacity="0.42"
            strokeWidth="1.3"
          />
          <path
            d="M 10 265 L 95 180 L 235 180 L 305 110 L 465 110"
            stroke="#a8f0da"
            strokeWidth="1.9"
            strokeDasharray="32 240"
            className="animate-circuit-flow"
          />
          {[
            [95, 180],
            [305, 110],
            [465, 110],
          ].map(([cx, cy], idx) => (
            <g key={idx}>
              <circle cx={cx} cy={cy} r="5.5" fill="var(--color-patina)" fillOpacity="0.28" />
              <circle cx={cx} cy={cy} r="2.4" fill="#e6fff7" />
            </g>
          ))}
        </svg>

        {/* Left Rotating Ngọc Lũ Đông Sơn Drum Medallion */}
        <div
          data-scroll-rotate="1"
          className="absolute top-[22vh] -left-[220px] h-[600px] w-[600px] opacity-[0.16] will-change-transform"
        >
          <svg viewBox="0 0 400 400" fill="none" stroke="var(--color-bronze)" className="h-full w-full">
            <circle cx="200" cy="200" r="194" strokeWidth="1.2" />
            <circle cx="200" cy="200" r="182" strokeDasharray="3 6" strokeWidth="1" />
            <circle cx="200" cy="200" r="158" strokeWidth="1.1" />
            <circle cx="200" cy="200" r="126" strokeDasharray="8 5" strokeWidth="0.95" />
            <circle cx="200" cy="200" r="96" strokeWidth="1.1" />
            <path d={leftFeathers} strokeWidth="0.85" strokeOpacity="0.8" />
            <polygon
              points={buildSunPolygonPoints(200, 200, 14, 88, 34)}
              fill="var(--color-bronze)"
              fillOpacity="0.14"
              strokeWidth="1.2"
            />
          </svg>
        </div>

        {/* Right Counter-Rotating Emerald-Patina & Bronze Medallion */}
        <div
          data-scroll-rotate="-1"
          className="absolute bottom-[8vh] -right-[240px] h-[650px] w-[650px] opacity-[0.14] will-change-transform"
        >
          <svg viewBox="0 0 400 400" fill="none" stroke="var(--color-patina)" className="h-full w-full">
            <circle cx="200" cy="200" r="194" strokeDasharray="2 7" strokeWidth="1.2" />
            <circle cx="200" cy="200" r="172" strokeWidth="1" />
            <circle cx="200" cy="200" r="144" stroke="var(--color-bronze)" strokeOpacity="0.75" strokeWidth="1" />
            <circle cx="200" cy="200" r="110" strokeWidth="1.1" />
            <path d={rightFeathers} strokeWidth="0.8" strokeOpacity="0.75" />
            <polygon
              points={buildSunPolygonPoints(200, 200, 14, 102, 38)}
              fill="var(--color-patina)"
              fillOpacity="0.12"
              strokeWidth="1.15"
            />
          </svg>
        </div>

        {/* Live Pointer-Tracking Bronze Torchlight */}
        <div ref={torchRef} className="absolute inset-0" />
      </div>

      {/* LAYER 2: Unified `dpr = 1` Full-Viewport Aura + Embers + Fairy Dust Canvas */}
      <canvas
        ref={auraCanvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[35] h-full w-full mix-blend-screen"
      />

      {/* LAYER 3: Interactive Right-Margin Đông Sơn Meridian Compass & Drum Strike Trigger */}
      <aside
        aria-label="Meridian scroll compass and interactive drum strike"
        className={`fixed top-1/2 right-4 z-40 hidden -translate-y-1/2 flex-col items-center gap-2.5 transition-opacity duration-700 xl:flex ${
          isIntroComplete ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <span className="pointer-events-none font-mono text-[9px] tracking-[0.22em] text-[var(--color-ink-muted)] [writing-mode:vertical-rl]">
          {ui.compassUi.meridianLabel}
        </span>

        <div className="flex flex-col items-center gap-1.5 py-1">
          {SECTION_ANCHORS.map((sec) => (
            <a
              key={sec.href}
              href={sec.href}
              title={sec.label}
              aria-label={`Jump to ${sec.label}`}
              className="group flex h-3 w-3 items-center justify-center"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--border-hairline-strong)] transition-all group-hover:scale-150 group-hover:bg-[var(--color-bronze-bright)]" />
            </a>
          ))}
        </div>

        <button
          ref={compassBtnRef}
          type="button"
          data-dedicated-drum-trigger
          onClick={handleCompassStrike}
          title={ui.compassUi.strikeTooltip}
          aria-label={ui.compassUi.strikeTooltip}
          className={`group relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border bg-[#0b0e11]/92 transition-all duration-300 hover:scale-110 hover:border-[var(--color-bronze-bright)] ${
            beatActive
              ? "scale-110 border-[var(--color-bronze-bright)] shadow-[0_0_24px_rgba(246,213,155,0.6)]"
              : "border-[var(--border-bronze)]"
          }`}
        >
          <div data-scroll-rotate="2">
            <SunFourteenIcon className="h-5 w-5 text-[var(--color-bronze-bright)] transition-transform group-hover:rotate-45" />
          </div>
        </button>

        <span className="pointer-events-none font-mono text-[10px] tabular-nums tracking-[0.14em] text-[var(--color-bronze-bright)]">
          {String(scrollDeg).padStart(3, "0")}°
        </span>
      </aside>
    </>
  );
}

export function KineticHeritageFrieze() {
  const locale = useLocaleStore((s) => s.locale);
  const { ui } = getLocalizedPortfolio(locale);
  const rowOne = ui.frieze.rowOne;
  const rowTwo = ui.frieze.rowTwo;

  return (
    <div
      aria-hidden="true"
      className="drum-reactive-band relative overflow-hidden border-y border-[var(--border-bronze)] bg-[#0c1016]/92 py-4 select-none"
    >
      <div
        data-parallax-x="1.5"
        className="flex w-max items-center gap-10 px-6 font-display text-xl italic tracking-[0.06em] text-[var(--color-ink)] will-change-transform"
      >
        {[...rowOne, ...rowOne, ...rowOne].map((label, idx) => (
          <span key={idx} className="inline-flex items-center gap-10">
            <span className={idx % 2 === 0 ? "text-[var(--color-ink)]" : "text-[var(--color-bronze-bright)]"}>
              {label}
            </span>
            <SunFourteenIcon className="h-4 w-4 text-[var(--color-bronze)] opacity-85" />
          </span>
        ))}
      </div>

      <div
        data-parallax-x="-1.3"
        className="mt-2.5 flex w-max items-center gap-9 border-t border-[var(--border-hairline)] px-6 pt-2.5 font-mono text-[10px] tracking-[0.26em] text-[var(--color-ink-muted)] uppercase will-change-transform"
      >
        {[...rowTwo, ...rowTwo, ...rowTwo].map((label, idx) => (
          <span key={idx} className="inline-flex items-center gap-9">
            <span className={idx % 2 === 0 ? "text-[var(--color-patina)]" : "text-[var(--color-ink-soft)]"}>
              {label}
            </span>
            <LacBirdGlyph className="h-3.5 w-7 text-[var(--color-bronze)] opacity-80" />
          </span>
        ))}
      </div>
    </div>
  );
}
