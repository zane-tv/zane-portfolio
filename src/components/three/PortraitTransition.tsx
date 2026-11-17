"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { introMotionState } from "@/store/introStore";
import { HERO_CAMERA_FOV, HERO_CAMERA_Z } from "./CameraRig";
import { BronzeDrum } from "./BronzeDrum";
import { DrumParticles } from "./DrumParticles";
import { PortraitReveal } from "./PortraitReveal";

/**
 * Scene 05 — Portrait Flight & Hero Assembly:
 * Carries the completed 3D Đông Sơn Bronze Drum & revealed Portrait along a smooth
 * 3D curved Bezier trajectory from the viewport center (`startWorld`) to the exact
 * measured responsive Hero portrait anchor (`targetWorld`) with expressive 3D banking
 * that showcases the sculpted `tang trống` resonator body and zero jump on DOM handoff.
 */
export function PortraitTransition() {
  const groupRef = useRef<THREE.Group>(null);
  const livePositionRef = useRef(new THREE.Vector3(0, 0, 0));
  const liveScaleRef = useRef(1.0);

  useFrame(({ size }) => {
    const u = THREE.MathUtils.clamp(introMotionState.portraitFlightProgress, 0, 1);

    const sx = introMotionState.startWorldX;
    const sy = introMotionState.startWorldY;
    const sr = introMotionState.startWorldRadius;

    const tx = introMotionState.targetWorldX;
    const ty = introMotionState.targetWorldY;
    const tr = introMotionState.targetWorldRadius;

    const distance = Math.hypot(tx - sx, ty - sy);
    const arcLiftY = Math.min(0.44, 0.14 + distance * 0.14);
    const ctrlX = (sx + tx) * 0.5;
    const ctrlY = Math.max(sy, ty) + arcLiftY;

    const inv = 1 - u;
    const x = inv * inv * sx + 2 * inv * u * ctrlX + u * u * tx;
    const y = inv * inv * sy + 2 * inv * u * ctrlY + u * u * ty;
    const z = Math.sin(u * Math.PI) * 0.3;

    const scale = THREE.MathUtils.lerp(sr, tr, u);

    livePositionRef.current.set(x, y, z);
    liveScaleRef.current = scale;

    // Project live 3D drum center into normalized viewport coords (0..1) for the Full-Page Aura!
    const vHeight = 2 * HERO_CAMERA_Z * Math.tan((HERO_CAMERA_FOV * Math.PI) / 360);
    const aspect = Math.max(0.4, size.width / Math.max(1, size.height));
    const vWidth = vHeight * aspect;
    introMotionState.drumScreenNx = THREE.MathUtils.clamp(0.5 + x / vWidth, 0.1, 0.92);
    introMotionState.drumScreenNy = THREE.MathUtils.clamp(0.5 - y / vHeight, 0.12, 0.88);

    if (groupRef.current) {
      groupRef.current.position.set(x, y, z);
      groupRef.current.scale.setScalar(scale);

      // Expressive 3D banking during flight + tactile pointer tilt revealing the 3D `tang trống` body
      const flightPitchX = Math.sin(u * Math.PI) * 0.085;
      const flightYawY = -Math.sin(u * Math.PI) * THREE.MathUtils.clamp((tx - sx) * 0.095, -0.24, 0.24);
      const flightBankZ =
        -Math.sin(u * Math.PI) * THREE.MathUtils.clamp((tx - sx) * 0.05, -0.11, 0.11) +
        introMotionState.heroScrollProgress * 0.34 * u;

      const pointerGate = THREE.MathUtils.smoothstep(introMotionState.craneMergeProgress, 0.9, 1.0);
      const tiltY = introMotionState.pointerSmoothX * 0.11 * pointerGate + flightYawY;
      const tiltX = -introMotionState.pointerSmoothY * 0.095 * pointerGate + flightPitchX;

      groupRef.current.rotation.set(tiltX, tiltY, flightBankZ);
    }
  });

  return (
    <>
      <group ref={groupRef}>
        <BronzeDrum />
        <PortraitReveal />
      </group>
      <DrumParticles anchorPositionRef={livePositionRef} anchorScaleRef={liveScaleRef} />
    </>
  );
}
