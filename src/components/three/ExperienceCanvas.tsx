"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import clsx from "clsx";
import * as THREE from "three";
import { snapIntroMotionChannelsToIdle, useIntroStore } from "@/store/introStore";
import { HERO_CAMERA_FOV, HERO_CAMERA_Z } from "./CameraRig";
import { HeroScene } from "./HeroScene";

function checkWebGLAvailable(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    return Boolean(gl);
  } catch {
    return false;
  }
}

export function ExperienceCanvas() {
  const [mounted, setMounted] = useState(false);
  const isMobile = useIntroStore((s) => s.isMobileViewport);
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
    setMounted(true);
    return () => {
      setWebglReady(false);
    };
  }, [setPhase, setWebglReady, setWebglSupported]);

  if (!mounted || !webglSupported) {
    return null;
  }

  return (
    <div
      className={clsx(
        "pointer-events-none absolute inset-0 z-10 overflow-hidden transition-opacity duration-300",
        webglContextLost ? "opacity-0" : "opacity-100"
      )}
      aria-hidden="true"
    >
      <Canvas
        dpr={isMobile ? [1, 1.25] : [1, 1.5]}
        frameloop={heroInView && !webglContextLost ? "always" : "never"}
        camera={{
          fov: HERO_CAMERA_FOV,
          near: 0.1,
          far: 40,
          position: [0, 0, HERO_CAMERA_Z],
        }}
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.08,
        }}
        onCreated={({ gl }) => {
          setWebglReady(true);
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
        }}
      >
        <HeroScene />
      </Canvas>
    </div>
  );
}
