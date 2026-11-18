"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import clsx from "clsx";
import * as THREE from "three";
import { snapIntroMotionChannelsToIdle, useIntroStore } from "@/store/introStore";
import { HERO_CAMERA_FOV, HERO_CAMERA_Z } from "./cameraConstants";
import { HeroScene } from "./HeroScene";

let cachedWebGLSupported: boolean | null = null;

function checkWebGLAvailable(): boolean {
  if (typeof window === "undefined") return true;
  if (cachedWebGLSupported !== null) return cachedWebGLSupported;
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")) as
      | WebGL2RenderingContext
      | WebGLRenderingContext
      | null;
    cachedWebGLSupported = Boolean(gl);
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    canvas.width = 0;
    canvas.height = 0;
    return cachedWebGLSupported;
  } catch {
    cachedWebGLSupported = false;
    return false;
  }
}

function computeOptimalDpr(isMobile: boolean): number {
  if (typeof window === "undefined") return 1;
  const w = Math.max(1, window.innerWidth);
  const h = Math.max(1, window.innerHeight);
  const nativeDpr = window.devicePixelRatio || 1;
  const maxDprCap = isMobile ? 1.25 : 1.5;
  const widthBudgetDpr = 2560 / w;
  const pixelBudgetDpr = Math.sqrt(3_686_400 / (w * h));
  const capped = Math.min(nativeDpr, maxDprCap, widthBudgetDpr, pixelBudgetDpr);
  return Math.max(0.7, Math.round(capped * 100) / 100);
}

function DemandFrameSync({ active, dpr }: { active: boolean; dpr: number }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (active) {
      invalidate();
    }
  }, [active, dpr, invalidate]);
  return null;
}

export function ExperienceCanvas() {
  const [mounted, setMounted] = useState(false);
  const [canvasDpr, setCanvasDpr] = useState(1);
  const [useMsaa] = useState(() => {
    if (typeof window === "undefined") return true;
    const isNarrow = window.innerWidth < 768;
    const estPhysicalWidth = window.innerWidth * Math.min(window.devicePixelRatio || 1, 1.5);
    return !isNarrow && estPhysicalWidth <= 2560;
  });
  const cleanupContextListenersRef = useRef<(() => void) | null>(null);

  const isMobile = useIntroStore((s) => s.isMobileViewport);
  const reducedMotion = useIntroStore((s) => s.reducedMotion);
  const isIntroComplete = useIntroStore((s) => s.isIntroComplete);
  const webglSupported = useIntroStore((s) => s.webglSupported);
  const webglContextLost = useIntroStore((s) => s.webglContextLost);
  const heroInView = useIntroStore((s) => s.heroInView);
  const setWebglSupported = useIntroStore((s) => s.setWebglSupported);
  const setWebglReady = useIntroStore((s) => s.setWebglReady);
  const setWebglContextLost = useIntroStore((s) => s.setWebglContextLost);
  const setPhase = useIntroStore((s) => s.setPhase);

  useEffect(() => {
    const ok = checkWebGLAvailable();
    setWebglSupported(ok);
    if (!ok) {
      snapIntroMotionChannelsToIdle();
      setPhase("idle");
    }
    setCanvasDpr(computeOptimalDpr(window.innerWidth < 768));
    setMounted(true);
    return () => {
      cleanupContextListenersRef.current?.();
      cleanupContextListenersRef.current = null;
      setWebglReady(false);
    };
  }, [setPhase, setWebglReady, setWebglSupported]);

  useEffect(() => {
    if (!mounted) return;
    let raf = 0;
    const syncDpr = () => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(() => {
        const next = computeOptimalDpr(isMobile);
        setCanvasDpr((prev) => (Math.abs(prev - next) < 0.02 ? prev : next));
      });
    };
    syncDpr();
    window.addEventListener("resize", syncDpr, { passive: true });
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", syncDpr);
    };
  }, [isMobile, mounted]);

  if (!mounted || !webglSupported) {
    return null;
  }

  const isDemandIdle = reducedMotion && isIntroComplete;
  const frameloop =
    !heroInView || webglContextLost ? "never" : isDemandIdle ? "demand" : "always";

  return (
    <div
      className={clsx(
        "pointer-events-none absolute inset-0 z-10 overflow-hidden transition-opacity duration-300",
        webglContextLost ? "opacity-0" : "opacity-100"
      )}
      aria-hidden="true"
    >
      <Canvas
        dpr={canvasDpr}
        frameloop={frameloop}
        camera={{
          fov: HERO_CAMERA_FOV,
          near: 0.1,
          far: 40,
          position: [0, 0, HERO_CAMERA_Z],
        }}
        gl={{
          antialias: useMsaa && !isMobile,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.08,
        }}
        onCreated={({ gl }) => {
          setWebglReady(true);
          cleanupContextListenersRef.current?.();
          const dom = gl.domElement;
          const handleLost = (e: Event) => {
            e.preventDefault();
            setWebglContextLost(true);
            snapIntroMotionChannelsToIdle();
            setPhase("idle");
          };
          const handleRestored = () => {
            setWebglContextLost(false);
          };
          dom.addEventListener("webglcontextlost", handleLost, false);
          dom.addEventListener("webglcontextrestored", handleRestored, false);
          cleanupContextListenersRef.current = () => {
            dom.removeEventListener("webglcontextlost", handleLost, false);
            dom.removeEventListener("webglcontextrestored", handleRestored, false);
          };
        }}
      >
        <DemandFrameSync active={isDemandIdle && heroInView && !webglContextLost} dpr={canvasDpr} />
        <HeroScene />
      </Canvas>
    </div>
  );
}
