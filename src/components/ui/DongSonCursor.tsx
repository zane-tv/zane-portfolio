"use client";

import { useEffect, useRef, useState } from "react";
import { buildSunPolygonPoints } from "@/components/ui/DongSonMotifs";
import { subscribeDrumStrikes, triggerDrumStrike, useIntroStore } from "@/store/introStore";

export interface FairyDustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  size: number;
  rot: number;
  vRot: number;
  isPatina: boolean;
}

/** Shared zero-allocation ring buffer of fairy-dust particles rendered in the unified 2D canvas */
export const MAX_FAIRY_DUST = 96;
export const fairyDustPool: FairyDustParticle[] = Array.from({ length: MAX_FAIRY_DUST }, () => ({
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  age: 999,
  life: 0.75,
  size: 10,
  rot: 0,
  vRot: 1,
  isPatina: false,
}));
let fairyCursor = 0;

export function spawnFairyDust(x: number, y: number, vx: number, vy: number, count = 2): void {
  for (let i = 0; i < count; i++) {
    const p = fairyDustPool[fairyCursor % MAX_FAIRY_DUST]!;
    fairyCursor += 1;
    p.x = x + (Math.random() - 0.5) * 10;
    p.y = y + (Math.random() - 0.5) * 10;
    p.vx = vx * -0.14 + (Math.random() - 0.5) * 24;
    p.vy = vy * -0.14 + 10 + Math.random() * 22;
    p.age = 0;
    p.life = 0.55 + Math.random() * 0.45;
    p.size = 7 + Math.random() * 11;
    p.rot = Math.random() * Math.PI * 2;
    p.vRot = (Math.random() - 0.5) * 3.0;
    p.isPatina = fairyCursor % 3 === 0;
  }
}

/**
 * Đông Sơn × Future Tech Cursor Companion Layer (Zero Bird Icon!):
 * - Activates the native zero-latency Retina Đông Sơn Cyber-Spearhead hardware cursor images
 *   (`/images/cursor-default-2x.png` & `/images/cursor-pointer-2x.png`).
 * - Trails a lightweight magnetic 14-ray Đông Sơn HUD reticle ring that blooms on interactive hover.
 * - Spawns sparkling golden & emerald-patina fairy dust (`bụi tiên`) + click shockwave ripples.
 */
export function DongSonCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hoveringInteractive, setHoveringInteractive] = useState(false);
  const [clicking, setClicking] = useState(false);
  const reducedMotion = useIntroStore((s) => s.reducedMotion);

  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion || typeof window === "undefined") {
      setEnabled(false);
      document.documentElement.classList.remove("custom-cursor-ready");
      return;
    }

    const mq = window.matchMedia("(pointer: fine) and (min-width: 1024px)");
    const syncMq = () => {
      setEnabled(mq.matches);
      if (mq.matches) {
        document.documentElement.classList.add("custom-cursor-ready");
      } else {
        document.documentElement.classList.remove("custom-cursor-ready");
      }
    };
    syncMq();
    mq.addEventListener("change", syncMq);

    return () => {
      mq.removeEventListener("change", syncMq);
      document.documentElement.classList.remove("custom-cursor-ready");
    };
  }, [reducedMotion]);

  // Subtle visual micro-shake on strong drum beats (purely visual, zero audio!)
  useEffect(() => {
    if (reducedMotion) return;
    let raf = 0;
    const unsub = subscribeDrumStrikes((ev) => {
      const strength = ev.strength ?? 0.85;
      if (strength < 0.82) return;
      const start = performance.now();
      const amp = Math.min(2.4, strength * 1.8);

      window.cancelAnimationFrame(raf);
      const tick = (now: number) => {
        const elapsed = (now - start) / 1000;
        if (elapsed >= 0.32) {
          document.documentElement.style.setProperty("--drum-shake-x", "0px");
          document.documentElement.style.setProperty("--drum-shake-y", "0px");
          return;
        }
        const decay = Math.exp(-elapsed * 14);
        const sx = Math.sin(elapsed * 78) * amp * decay;
        const sy = Math.cos(elapsed * 92) * amp * 0.8 * decay;
        document.documentElement.style.setProperty("--drum-shake-x", `${sx.toFixed(2)}px`);
        document.documentElement.style.setProperty("--drum-shake-y", `${sy.toFixed(2)}px`);
        raf = window.requestAnimationFrame(tick);
      };
      raf = window.requestAnimationFrame(tick);
    });

    return () => {
      window.cancelAnimationFrame(raf);
      document.documentElement.style.setProperty("--drum-shake-x", "0px");
      document.documentElement.style.setProperty("--drum-shake-y", "0px");
      unsub();
    };
  }, [reducedMotion]);

  // Global click shockwave + fairy-dust burst at click position
  useEffect(() => {
    if (reducedMotion) return;
    const onPointerDown = (e: PointerEvent) => {
      setClicking(true);
      spawnFairyDust(e.clientX, e.clientY, 0, -35, 10);

      const target = e.target as HTMLElement | null;
      if (target?.closest("[data-dedicated-drum-trigger]")) return;

      triggerDrumStrike({
        nx: e.clientX / Math.max(1, window.innerWidth),
        ny: e.clientY / Math.max(1, window.innerHeight),
        strength: 0.68,
        kind: "manual",
      });
    };
    const onPointerUp = () => setClicking(false);

    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [reducedMotion]);

  // Trailing Magnetic Đông Sơn Cyber Reticle + Fairy-Dust Emission
  useEffect(() => {
    if (!enabled) return;

    let targetX = window.innerWidth * 0.5;
    let targetY = window.innerHeight * 0.5;
    let ringX = targetX;
    let ringY = targetY;
    let lastX = targetX;
    let lastY = targetY;
    let distAccum = 0;
    let visible = false;
    let rafId = 0;

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      visible = true;

      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      distAccum += Math.hypot(dx, dy);
      if (distAccum >= 11) {
        distAccum = 0;
        spawnFairyDust(e.clientX + 12, e.clientY + 12, dx * 6, dy * 6, 2);
      }
      lastX = e.clientX;
      lastY = e.clientY;

      const el = e.target as HTMLElement | null;
      const isInteractive = Boolean(
        el?.closest("a, button, [role='button'], input, textarea, [data-cursor-magnetic]")
      );
      setHoveringInteractive((prev) => (prev === isInteractive ? prev : isInteractive));
    };

    const onLeave = () => {
      visible = false;
      if (ringRef.current) ringRef.current.style.opacity = "0";
    };

    const loop = () => {
      if (!document.hidden && ringRef.current) {
        ringX += (targetX - ringX) * 0.2;
        ringY += (targetY - ringY) * 0.2;
        ringRef.current.style.opacity = visible ? "1" : "0";
        ringRef.current.style.transform = `translate3d(${ringX.toFixed(1)}px, ${ringY.toFixed(
          1
        )}px, 0)`;
      }
      rafId = window.requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    rafId = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
      <div
        ref={ringRef}
        style={{ opacity: 0 }}
        className="fixed top-0 left-0 will-change-transform"
      >
        <div
          className={`-ml-5 -mt-5 flex h-10 w-10 items-center justify-center transition-transform duration-300 ease-out ${
            clicking
              ? "scale-75"
              : hoveringInteractive
                ? "scale-[1.45]"
                : "scale-90 opacity-55"
          }`}
        >
          <svg
            viewBox="0 0 64 64"
            fill="none"
            className="h-full w-full animate-[spin-slow-cw_28s_linear_infinite]"
          >
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke={hoveringInteractive ? "var(--color-patina)" : "var(--color-bronze)"}
              strokeOpacity={hoveringInteractive ? "0.85" : "0.42"}
              strokeWidth="1.1"
              strokeDasharray={hoveringInteractive ? "4 4" : "2 6"}
            />
            {hoveringInteractive && (
              <polygon
                points={buildSunPolygonPoints(32, 32, 14, 23, 16)}
                stroke="var(--color-bronze-bright)"
                strokeOpacity="0.8"
                strokeWidth="0.95"
              />
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
