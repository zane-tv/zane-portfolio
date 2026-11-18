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

export function hasActiveFairyDust(): boolean {
  for (let i = 0; i < MAX_FAIRY_DUST; i++) {
    const p = fairyDustPool[i]!;
    if (p.age < p.life) return true;
  }
  return false;
}

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
 * - Activates native zero-latency Retina Đông Sơn Cyber-Spearhead hardware cursor images.
 * - Sleeps at 0ms CPU/RAF when mouse is stationary; wakes instantly on `pointermove`.
 * - Strictly disabled on mobile/touch viewports so taps never trigger cursor handlers.
 */
export function DongSonCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hoveringInteractive, setHoveringInteractive] = useState(false);
  const reducedMotion = useIntroStore((s) => s.reducedMotion);

  const ringRef = useRef<HTMLDivElement>(null);
  const reticleInnerRef = useRef<HTMLDivElement>(null);

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

  // Subtle 320ms visual micro-shake ONLY on intentional/intro drum strikes (never on auto-heartbeats,
  // never mutating `:root` CSS variables, and scoped strictly to currently visible viewport sections!)
  useEffect(() => {
    if (reducedMotion) return;
    let raf = 0;
    let activeTargets: HTMLElement[] = [];

    const clearShake = () => {
      for (const el of activeTargets) {
        el.style.transform = "";
      }
      activeTargets = [];
    };

    const unsub = subscribeDrumStrikes((ev) => {
      if (ev.kind === "heartbeat") return;
      const strength = ev.strength ?? 0.85;
      if (strength < 0.82) return;

      window.cancelAnimationFrame(raf);
      clearShake();

      const candidates = document.querySelectorAll<HTMLElement>("main > section, footer#contact");
      const vh = window.innerHeight;
      candidates.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) {
          activeTargets.push(el);
        }
      });
      if (activeTargets.length === 0) return;

      const start = performance.now();
      const amp = Math.min(2.2, strength * 1.65);

      const tick = (now: number) => {
        const elapsed = (now - start) / 1000;
        if (elapsed >= 0.3) {
          clearShake();
          raf = 0;
          return;
        }
        const decay = Math.exp(-elapsed * 14);
        const sx = Math.sin(elapsed * 78) * amp * decay;
        const sy = Math.cos(elapsed * 92) * amp * 0.8 * decay;
        const tf = `translate3d(${sx.toFixed(2)}px, ${sy.toFixed(2)}px, 0)`;
        for (const el of activeTargets) {
          el.style.transform = tf;
        }
        raf = window.requestAnimationFrame(tick);
      };
      raf = window.requestAnimationFrame(tick);
    });

    return () => {
      window.cancelAnimationFrame(raf);
      clearShake();
      unsub();
    };
  }, [reducedMotion]);

  // Global click shockwave + fairy-dust burst (strictly active ONLY on desktop `enabled` fine pointer!)
  useEffect(() => {
    if (!enabled || reducedMotion) return;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      if (reticleInnerRef.current) {
        reticleInnerRef.current.dataset.clicking = "true";
      }
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

    const onPointerUp = () => {
      if (reticleInnerRef.current) {
        delete reticleInnerRef.current.dataset.clicking;
      }
    };

    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [enabled, reducedMotion]);

  // Trailing Magnetic Đông Sơn Cyber Reticle (auto-sleeps RAF when cursor stops!)
  useEffect(() => {
    if (!enabled) return;

    let targetX = window.innerWidth * 0.5;
    let targetY = window.innerHeight * 0.5;
    let ringX = targetX;
    let ringY = targetY;
    let lastX = targetX;
    let lastY = targetY;
    let lastTargetEl: EventTarget | null = null;
    let distAccum = 0;
    let visible = false;
    let rafId = 0;

    const loop = () => {
      if (document.hidden || !ringRef.current || !visible) {
        rafId = 0;
        return;
      }

      const dx = targetX - ringX;
      const dy = targetY - ringY;
      if (Math.abs(dx) < 0.12 && Math.abs(dy) < 0.12) {
        ringX = targetX;
        ringY = targetY;
        ringRef.current.style.transform = `translate3d(${ringX.toFixed(1)}px, ${ringY.toFixed(1)}px, 0)`;
        rafId = 0;
        return;
      }

      ringX += dx * 0.22;
      ringY += dy * 0.22;
      ringRef.current.style.transform = `translate3d(${ringX.toFixed(1)}px, ${ringY.toFixed(1)}px, 0)`;
      rafId = window.requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!visible) {
        visible = true;
        ringX = targetX;
        ringY = targetY;
        if (ringRef.current) {
          ringRef.current.style.opacity = "1";
          ringRef.current.removeAttribute("data-offscreen");
        }
      }

      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      distAccum += Math.hypot(dx, dy);
      if (distAccum >= 12) {
        distAccum = 0;
        spawnFairyDust(e.clientX + 12, e.clientY + 12, dx * 6, dy * 6, 2);
      }
      lastX = e.clientX;
      lastY = e.clientY;

      if (e.target !== lastTargetEl) {
        lastTargetEl = e.target;
        const el = e.target as HTMLElement | null;
        const isInteractive = Boolean(
          el?.closest("a, button, [role='button'], input, textarea, [data-cursor-magnetic]")
        );
        setHoveringInteractive((prev) => (prev === isInteractive ? prev : isInteractive));
      }

      if (rafId === 0) {
        rafId = window.requestAnimationFrame(loop);
      }
    };

    const onLeave = () => {
      visible = false;
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
      if (ringRef.current) {
        ringRef.current.style.opacity = "0";
        ringRef.current.setAttribute("data-offscreen", "true");
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    return () => {
      if (rafId !== 0) window.cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
      <div
        ref={ringRef}
        data-offscreen="true"
        style={{ opacity: 0 }}
        className="fixed top-0 left-0 will-change-transform"
      >
        <div
          ref={reticleInnerRef}
          className={`-ml-5 -mt-5 flex h-10 w-10 items-center justify-center transition-transform duration-300 ease-out data-[clicking=true]:scale-75 ${
            hoveringInteractive ? "scale-[1.45]" : "scale-90 opacity-55"
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
