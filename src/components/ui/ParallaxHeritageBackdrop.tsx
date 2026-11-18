"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  hasActiveFairyDust,
  fairyDustPool,
  MAX_FAIRY_DUST,
} from "@/components/ui/DongSonCursor";
import {
  buildPeacockWedgesPath,
  buildSunPolygonPoints,
  LacBirdGlyph,
  SunFourteenIcon,
} from "@/components/ui/DongSonMotifs";
import { getLocalizedPortfolio } from "@/config/i18n";
import {
  introMotionState,
  subscribeDrumStrikes,
  triggerDrumStrike,
  useIntroStore,
  type DrumStrikeKind,
} from "@/store/introStore";
import { useLocaleStore } from "@/store/localeStore";

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

const SECTION_ANCHOR_KEYS = [
  { href: "#top", key: "hero" },
  { href: "#expertise", key: "disciplines" },
  { href: "#projects", key: "artifacts" },
  { href: "#telemetry", key: "telemetry" },
  { href: "#journey", key: "journey" },
  { href: "#contact", key: "horizon" },
] as const;

const TOP_CIRCUIT_MASK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 320' fill='none'%3E%3Cpath d='M 110 210 L 185 135 L 285 135 L 350 70 L 520 70 L 575 15' stroke='white' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`;

const BOTTOM_CIRCUIT_MASK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 300' fill='none'%3E%3Cpath d='M 10 265 L 95 180 L 235 180 L 305 110 L 465 110' stroke='white' stroke-width='2.1' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`;

/**
 * High-luminance (Y > 0.92) orb sprite so standard premultiplied `source-over` compositing
 * brightens `#ece6db` white text without requiring `mix-blend-screen` backdrop readbacks.
 */
function createOrbSprite(innerRgba: string, midRgba: string, outerRgba: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 32;
  c.height = 32;
  const gCtx = c.getContext("2d");
  if (gCtx) {
    const g = gCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, innerRgba);
    g.addColorStop(0.45, midRgba);
    g.addColorStop(1, outerRgba);
    gCtx.fillStyle = g;
    gCtx.fillRect(0, 0, 32, 32);
  }
  return c;
}

function createFairyStarSprite(coreColor: string, glowColor: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 32;
  c.height = 32;
  const gCtx = c.getContext("2d");
  if (gCtx) {
    const g = gCtx.createRadialGradient(16, 16, 0, 16, 16, 15);
    g.addColorStop(0, coreColor);
    g.addColorStop(0.38, glowColor);
    g.addColorStop(1, "rgba(255,255,255,0)");
    gCtx.fillStyle = g;
    gCtx.fillRect(0, 0, 32, 32);

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
 * Pre-bakes the expanding Đông Sơn shockwave aura band + champagne-gold wavefront +
 * dashed emerald-patina echo ring ONCE at mount (zero per-frame `createRadialGradient`
 * and zero per-frame `setLineDash` arc tessellation!).
 * Uses high-luminance incandescent gold (`#fff0ce`) & luminous patina (`#d4fff1`) so
 * white text (`#ece6db`) stays bright and crisp without `mix-blend-screen`.
 */
function createShockwaveRingSprite(): HTMLCanvasElement {
  const size = 512;
  const half = size * 0.5;
  const rMain = half * 0.89;
  const rInner = half * 0.64;
  const rOuter = half * 0.98;

  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const gCtx = c.getContext("2d");
  if (!gCtx) return c;

  const grad = gCtx.createRadialGradient(half, half, rInner, half, half, rOuter);
  const peakStop = (rMain - rInner) / (rOuter - rInner);
  grad.addColorStop(0, "rgba(255, 236, 198, 0)");
  grad.addColorStop(Math.max(0, peakStop * 0.55), "rgba(255, 234, 192, 0.14)");
  grad.addColorStop(peakStop, "rgba(255, 242, 212, 0.34)");
  grad.addColorStop(1, "rgba(255, 236, 198, 0)");

  gCtx.fillStyle = grad;
  gCtx.fillRect(0, 0, size, size);

  gCtx.beginPath();
  gCtx.arc(half, half, rMain, 0, Math.PI * 2);
  gCtx.strokeStyle = "rgba(255, 244, 218, 0.46)";
  gCtx.lineWidth = 1.6;
  gCtx.stroke();

  gCtx.save();
  gCtx.beginPath();
  gCtx.arc(half, half, rMain * 0.84, 0, Math.PI * 2);
  gCtx.setLineDash([7, 10]);
  gCtx.strokeStyle = "rgba(208, 255, 240, 0.36)";
  gCtx.lineWidth = 1.3;
  gCtx.stroke();
  gCtx.restore();

  return c;
}

export function ParallaxHeritageBackdrop() {
  const scrollDegRef = useRef<HTMLSpanElement>(null);
  const auraCanvasRef = useRef<HTMLCanvasElement>(null);
  const torchRef = useRef<HTMLDivElement>(null);
  const compassBtnRef = useRef<HTMLButtonElement>(null);

  const isIntroComplete = useIntroStore((s) => s.isIntroComplete);
  const reducedMotion = useIntroStore((s) => s.reducedMotion);
  const locale = useLocaleStore((s) => s.locale);
  const { ui } = getLocalizedPortfolio(locale);

  // Zero-re-render Meridian scroll readout (`000° .. 360°`)
  useEffect(() => {
    let maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    let lastDeg = -1;
    let rafId = 0;

    const updateMaxScroll = () => {
      maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };

    const flushDeg = () => {
      rafId = 0;
      const deg = Math.min(360, Math.max(0, Math.round((window.scrollY / maxScroll) * 360)));
      if (deg !== lastDeg) {
        lastDeg = deg;
        if (scrollDegRef.current) {
          scrollDegRef.current.textContent = `${String(deg).padStart(3, "0")}°`;
        }
      }
    };

    const onScroll = () => {
      if (rafId === 0) {
        rafId = window.requestAnimationFrame(flushDeg);
      }
    };

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            updateMaxScroll();
            onScroll();
          })
        : null;
    ro?.observe(document.documentElement);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateMaxScroll, { passive: true });
    flushDeg();

    return () => {
      if (rafId !== 0) window.cancelAnimationFrame(rafId);
      ro?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateMaxScroll);
    };
  }, []);

  // Compositor-only `translate3d` pointer torchlight (zero `background` radial-gradient repaints!)
  useEffect(() => {
    if (reducedMotion || typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let pending = false;
    let px = window.innerWidth * 0.5;
    let py = window.innerHeight * 0.4;

    if (torchRef.current) {
      torchRef.current.style.transform = `translate3d(${px.toFixed(0)}px, ${py.toFixed(0)}px, 0)`;
    }

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (pending) return;
      pending = true;
      window.requestAnimationFrame(() => {
        pending = false;
        if (torchRef.current) {
          torchRef.current.style.transform = `translate3d(${px.toFixed(0)}px, ${py.toFixed(0)}px, 0)`;
        }
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reducedMotion]);

  // Unified `dpr = 1` Sprite Canvas (Zero `mix-blend-screen` readback, zero `:root` style recalc!)
  useEffect(() => {
    const canvas = auraCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const goldOrb = createOrbSprite(
      "rgba(255, 248, 232, 1)",
      "rgba(255, 232, 188, 0.55)",
      "rgba(255, 232, 188, 0)"
    );
    const patinaOrb = createOrbSprite(
      "rgba(232, 255, 247, 1)",
      "rgba(196, 252, 234, 0.52)",
      "rgba(196, 252, 234, 0)"
    );
    const goldStar = createFairyStarSprite("#fffaf0", "rgba(255, 234, 192, 0.62)");
    const patinaStar = createFairyStarSprite("#effff9", "rgba(202, 255, 238, 0.62)");
    const shockwaveSprite = createShockwaveRingSprite();

    const emberCount = width < 768 ? 18 : 34;
    const embers: EmberParticle[] = Array.from({ length: emberCount }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 6 + Math.random() * 10,
      speedY: 11 + Math.random() * 18,
      phase: Math.random() * Math.PI * 2,
      swayAmp: 12 + Math.random() * 22,
      isPatina: i % 4 === 0,
      alpha: 0.24 + Math.random() * 0.42,
    }));

    const waves: ActiveAuraWave[] = [];
    let pulseUiTimeout: number | undefined;
    let rafId = 0;
    let lastTime = performance.now();
    let lastAmbientDraw = 0;

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
      if (compassBtnRef.current && compassBtnRef.current.offsetParent !== null) {
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

    const ensureLoopRunning = () => {
      if (rafId === 0) {
        lastTime = performance.now();
        rafId = window.requestAnimationFrame(render);
      }
    };

    const unsubscribe = subscribeDrumStrikes((ev) => {
      if (useIntroStore.getState().reducedMotion && ev.kind === "heartbeat") return;
      const fallback = resolveDefaultEpicenter();
      waves.push({
        nx: ev.nx ?? fallback.nx,
        ny: ev.ny ?? fallback.ny,
        age: 0,
        duration: ev.kind === "sun" ? 2.2 : 1.9,
        strength: ev.strength ?? 0.9,
        kind: ev.kind ?? "heartbeat",
      });
      if (waves.length > 4) waves.shift();

      if (ev.kind !== "heartbeat" && compassBtnRef.current) {
        compassBtnRef.current.dataset.beatActive = "true";
        window.clearTimeout(pulseUiTimeout);
        pulseUiTimeout = window.setTimeout(() => {
          if (compassBtnRef.current) {
            delete compassBtnRef.current.dataset.beatActive;
          }
        }, 620);
      }

      ensureLoopRunning();
    });

    let heartbeatTimer = 0;

    function render(now: number) {
      if (document.hidden) {
        lastTime = now;
        rafId = window.requestAnimationFrame(render);
        return;
      }

      const storeState = useIntroStore.getState();
      const hasWaves = waves.length > 0;
      const hasFairy = !storeState.reducedMotion && hasActiveFairyDust();

      if (storeState.reducedMotion && !hasWaves) {
        ctx!.clearRect(0, 0, width, height);
        introMotionState.globalDrumBeatWave = 0;
        introMotionState.globalDrumBeatStrength = 0;
        rafId = 0;
        return;
      }

      // Run at full 60–120Hz during active shockwaves or cursor fairy dust;
      // pace slow ambient embers (`~0.45px/step`) to ~30fps at idle to halve compositor bandwidth!
      if (!hasWaves && !hasFairy && now - lastAmbientDraw < 31) {
        rafId = window.requestAnimationFrame(render);
        return;
      }
      lastAmbientDraw = now;

      const dt = Math.min(0.06, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      const sec = now * 0.001;

      if (storeState.isIntroComplete && !storeState.reducedMotion) {
        heartbeatTimer += dt;
        if (heartbeatTimer >= 5.6) {
          heartbeatTimer = 0;
          triggerDrumStrike({ strength: 0.78, kind: "heartbeat" });
        }
      }

      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.clearRect(0, 0, width, height);

      let maxBeatPulse = 0;
      let leadWaveProgress = 0;
      let leadWaveStrength = 0;
      const maxDiag = Math.hypot(width, height) * 1.1;

      // 1) Pre-Baked Đông Sơn Drum-Beat Shockwave Sprite Blits (Zero gradient/dash CPU overhead!)
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
        const radius = Math.max(24, eased * maxDiag);
        const drawR = radius / 0.89;

        ctx!.globalAlpha = Math.min(0.95, fade * 0.88);
        ctx!.drawImage(shockwaveSprite, cx - drawR, cy - drawR, drawR * 2, drawR * 2);

        if (p < 0.34) {
          const flash = Math.sin((p / 0.34) * Math.PI) * w.strength;
          const burstR = 68 + p * 210;
          ctx!.globalAlpha = Math.min(0.85, 0.45 * flash);
          ctx!.drawImage(goldOrb, cx - burstR, cy - burstR, burstR * 2, burstR * 2);
        }
      }

      // Sync plain JS channels with 3D WebGL BronzeDrum (zero DOM `:root` style recalc!)
      introMotionState.globalDrumBeatWave = leadWaveProgress;
      introMotionState.globalDrumBeatStrength = leadWaveStrength;

      if (!storeState.reducedMotion) {
        // 2) Rising Background Embers via Fast Sprite Blits
        const speedBoost = 1 + maxBeatPulse * 2.4;
        for (const e of embers) {
          e.y -= e.speedY * speedBoost * dt;
          if (e.y < -16) {
            e.y = height + 16;
            e.x = Math.random() * width;
          }
          const drawX = e.x + Math.sin(sec * 0.9 + e.phase) * e.swayAmp;
          const twinkle = 0.55 + 0.45 * Math.sin(sec * 2.1 + e.phase * 2.0);
          ctx!.globalAlpha = Math.min(0.88, e.alpha * twinkle * (1 + maxBeatPulse * 0.75));
          const sz = e.size * (1 + maxBeatPulse * 0.42);
          ctx!.drawImage(
            e.isPatina ? patinaOrb : goldOrb,
            drawX - sz * 0.5,
            e.y - sz * 0.5,
            sz,
            sz
          );
        }

        // 3) Cursor Fairy Dust (`bụi tiên`) via Direct `setTransform` Sprite Blits
        if (hasFairy) {
          for (let i = 0; i < MAX_FAIRY_DUST; i++) {
            const fp = fairyDustPool[i]!;
            if (fp.age >= fp.life) continue;
            fp.age += dt;
            fp.x += fp.vx * dt;
            fp.y += fp.vy * dt;
            fp.vx *= Math.pow(0.96, dt * 60);
            fp.rot += fp.vRot * dt;

            const u = fp.age / fp.life;
            if (u >= 1) continue;
            const sparkle = (1 - u) * (0.65 + 0.35 * Math.sin(fp.age * 24));
            const sz = fp.size * (1 - u * 0.55);
            const cos = Math.cos(fp.rot);
            const sin = Math.sin(fp.rot);

            ctx!.globalAlpha = Math.max(0, Math.min(1, sparkle));
            ctx!.setTransform(cos, sin, -sin, cos, fp.x, fp.y);
            ctx!.drawImage(
              fp.isPatina ? patinaStar : goldStar,
              -sz * 0.5,
              -sz * 0.5,
              sz,
              sz
            );
          }
          ctx!.setTransform(1, 0, 0, 1, 0, 0);
        }
      }

      ctx!.globalAlpha = 1;
      rafId = window.requestAnimationFrame(render);
    }

    rafId = window.requestAnimationFrame(render);

    // Wake canvas immediately if fairy dust spawns while throttled
    const onPointerWake = () => {
      if (!useIntroStore.getState().reducedMotion) {
        ensureLoopRunning();
      }
    };
    window.addEventListener("pointermove", onPointerWake, { passive: true });

    return () => {
      if (rafId !== 0) window.cancelAnimationFrame(rafId);
      window.clearTimeout(pulseUiTimeout);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerWake);
      unsubscribe();
    };
  }, []);

  const leftFeathers = useMemo(() => buildPeacockWedgesPath(200, 200, 14, 42, 92, 3), []);
  const rightFeathers = useMemo(() => buildPeacockWedgesPath(200, 200, 14, 48, 106, 3), []);

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
      {/* LAYER 1 (`-z-10`): Zero-Blur Aurora Gradients, Compositor-Only Circuit Pulses & Rotating Đông Sơn Drums */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none"
      >
        {/* Smooth Radial Gradients WITHOUT CSS `filter: blur()` */}
        <div className="animate-aurora-drift absolute -top-[20vh] -left-[14vw] h-[86vh] w-[74vw] bg-[radial-gradient(50%_50%_at_50%_50%,rgba(210,154,92,0.175)_0%,rgba(153,96,31,0.065)_45%,rgba(153,96,31,0.015)_74%,transparent_98%)] will-change-transform" />
        <div className="animate-aurora-drift-reverse absolute top-[24vh] -right-[16vw] h-[88vh] w-[70vw] bg-[radial-gradient(50%_50%_at_50%_50%,rgba(115,195,169,0.15)_0%,rgba(210,154,92,0.048)_48%,rgba(115,195,169,0.012)_75%,transparent_98%)] will-change-transform" />
        <div className="absolute -bottom-[22vh] left-[16vw] h-[66vh] w-[66vw] bg-[radial-gradient(50%_50%_at_50%_50%,rgba(210,154,92,0.13)_0%,rgba(210,154,92,0.025)_65%,transparent_98%)]" />

        {/* Architectural Museum Meridian Grid Lines */}
        <div className="editorial-container relative h-full">
          <div className="absolute inset-y-0 left-[var(--space-container-x)] w-[1px] bg-gradient-to-b from-transparent via-[rgba(210,154,92,0.15)] to-transparent" />
          <div className="absolute inset-y-0 left-1/2 hidden w-[1px] bg-gradient-to-b from-transparent via-[rgba(236,230,219,0.055)] to-transparent lg:block" />
          <div className="absolute inset-y-0 right-[var(--space-container-x)] w-[1px] bg-gradient-to-b from-transparent via-[rgba(115,195,169,0.135)] to-transparent" />
        </div>

        {/* Top-Right 45° Golden Cyber-Heritage Circuit Constellation (Zero `stroke-dashoffset` Paint!) */}
        <div className="absolute top-6 right-0 hidden h-[270px] w-[540px] opacity-55 md:block">
          <svg viewBox="0 0 640 320" fill="none" className="h-full w-full">
            <path
              d="M 110 210 L 185 135 L 285 135 L 350 70 L 520 70 L 575 15"
              stroke="var(--color-bronze)"
              strokeOpacity="0.45"
              strokeWidth="1.4"
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
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              WebkitMaskImage: TOP_CIRCUIT_MASK,
              maskImage: TOP_CIRCUIT_MASK,
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
            }}
          >
            <div className="animate-circuit-beam h-full w-full bg-[linear-gradient(110deg,transparent_41%,#fff3d6_49%,#e7b980_52%,transparent_59%)] will-change-transform" />
          </div>
        </div>

        {/* Bottom-Left 45° Patina Cyber-Heritage Circuit Constellation (Zero `stroke-dashoffset` Paint!) */}
        <div className="absolute bottom-8 left-0 hidden h-[240px] w-[500px] opacity-50 md:block">
          <svg viewBox="0 0 640 300" fill="none" className="h-full w-full">
            <path
              d="M 10 265 L 95 180 L 235 180 L 305 110 L 465 110"
              stroke="var(--color-patina)"
              strokeOpacity="0.42"
              strokeWidth="1.3"
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
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              WebkitMaskImage: BOTTOM_CIRCUIT_MASK,
              maskImage: BOTTOM_CIRCUIT_MASK,
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
            }}
          >
            <div className="animate-circuit-beam h-full w-full bg-[linear-gradient(110deg,transparent_41%,#e6fff7_49%,#a8f0da_52%,transparent_59%)] will-change-transform" />
          </div>
        </div>

        {/* Left Rotating Ngọc Lũ Đông Sơn Drum Medallion */}
        <div
          data-scroll-rotate="1"
          className="absolute top-[22vh] -left-[220px] h-[600px] w-[600px] opacity-[0.2] will-change-transform"
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

        {/* Right Counter-Rotating Emerald-Patina & Bronze Medallion (Hidden on mobile per user request) */}
        <div
          data-scroll-rotate="-1"
          className="absolute bottom-[8vh] -right-[240px] hidden h-[650px] w-[650px] opacity-[0.17] will-change-transform md:block"
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

        {/* Compositor-Translated Pointer-Tracking Bronze Torchlight (Static Gradient, Zero Repaints!) */}
        <div
          ref={torchRef}
          className="absolute -top-[640px] -left-[640px] hidden h-[1280px] w-[1280px] bg-[radial-gradient(640px_circle_at_50%_50%,rgba(210,154,92,0.105),rgba(115,195,169,0.04)_42%,transparent_72%)] will-change-transform lg:block"
        />
      </div>

      {/* LAYER 2 (`z-[35]`): Unified `dpr = 1` Full-Viewport Aura + Embers + Fairy Dust Canvas (Zero `mix-blend-screen` readback!) */}
      <canvas
        ref={auraCanvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[35] h-full w-full"
      />

      {/* LAYER 3 (`z-40`): Interactive Right-Margin Đông Sơn Meridian Compass & Drum Strike Trigger */}
      <aside
        aria-label={ui.compassUi.asideAria}
        className={`fixed top-1/2 right-4 z-40 hidden -translate-y-1/2 flex-col items-center gap-2.5 transition-opacity duration-700 xl:flex ${
          isIntroComplete ? "opacity-100" : "invisible pointer-events-none opacity-0"
        }`}
      >
        <span className="pointer-events-none font-mono text-[9px] tracking-[0.22em] text-[var(--color-ink-muted)] [writing-mode:vertical-rl]">
          {ui.compassUi.meridianLabel}
        </span>

        <div className="flex flex-col items-center gap-1.5 py-1">
          {SECTION_ANCHOR_KEYS.map((sec) => {
            const label = ui.compassUi.anchors[sec.key];
            return (
              <a
                key={sec.href}
                href={sec.href}
                title={label}
                aria-label={`${ui.compassUi.jumpPrefix} ${label}`}
                className="group flex h-3 w-3 items-center justify-center"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--border-hairline-strong)] transition-all group-hover:scale-150 group-hover:bg-[var(--color-bronze-bright)]" />
              </a>
            );
          })}
        </div>

        <button
          ref={compassBtnRef}
          type="button"
          data-dedicated-drum-trigger
          onClick={handleCompassStrike}
          title={ui.compassUi.strikeTooltip}
          aria-label={ui.compassUi.strikeTooltip}
          className="group relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[var(--border-bronze)] bg-[#0b0e11]/92 transition-all duration-300 hover:scale-110 hover:border-[var(--color-bronze-bright)] data-[beat-active=true]:scale-110 data-[beat-active=true]:border-[var(--color-bronze-bright)] data-[beat-active=true]:shadow-[0_0_24px_rgba(246,213,155,0.6)]"
        >
          <div data-scroll-rotate="2">
            <SunFourteenIcon className="h-5 w-5 text-[var(--color-bronze-bright)] transition-transform group-hover:rotate-45" />
          </div>
        </button>

        <span
          ref={scrollDegRef}
          className="pointer-events-none font-mono text-[10px] tabular-nums tracking-[0.14em] text-[var(--color-bronze-bright)]"
        >
          000°
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
      className="relative overflow-hidden border-y border-[var(--border-bronze)] bg-[#0c1016]/92 py-4 select-none"
    >
      <div
        data-parallax-x="1.5"
        className="flex w-max items-center gap-10 px-6 font-display text-xl italic tracking-[0.06em] text-[var(--color-ink)]"
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
        className="mt-2.5 flex w-max items-center gap-9 border-t border-[var(--border-hairline)] px-6 pt-2.5 font-mono text-[10px] tracking-[0.26em] text-[var(--color-ink-muted)] uppercase"
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
