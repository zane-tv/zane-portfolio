"use client";

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { introMotionState } from "@/store/introStore";

export const HERO_CAMERA_Z = 6.2;
export const HERO_CAMERA_FOV = 38;

const _lookTarget = new THREE.Vector3();

/**
 * Director's Cut Cinema CameraRig:
 * - Act I–II: Sweeping oblique tracking dolly (`z: 4.55 -> 5.6`) banking dynamically alongside
 *   the soaring 3D Chim Lạc so the 3D Đông Sơn bronze drum body (`tang trống`) & reliefs show
 *   authentic sculptural parallax.
 * - Act III (The Merge): Heroic push-in toward the 12-o'clock Chim Lạc band + damped physical
 *   impact micro-shake at the exact instant the Chim Lạc stamps into Bird Slot #0!
 * - Act IV–V: Settles strictly to `(0, 0, HERO_CAMERA_Z)` looking at `(0, 0, 0)` BEFORE
 *   portrait flight completes so the Hero DOM handoff is 100% sub-pixel locked.
 */
export function CameraRig() {
  const { camera } = useThree();

  useFrame(() => {
    const flight = introMotionState.craneFlightProgress;
    const enter = introMotionState.craneEnterAlpha;
    const merge = introMotionState.craneMergeProgress;
    const stampWave = introMotionState.craneStampShockwave;
    const portraitLock = THREE.MathUtils.smoothstep(
      introMotionState.portraitRevealProgress,
      0.0,
      0.58
    );

    // Sweeping oblique tracking envelope during Chim Lạc flight
    const trackEnvelope = Math.sin(Math.min(1, flight) * Math.PI) * enter * (1 - portraitLock);
    const lateralSweep = Math.cos(Math.min(1, flight) * Math.PI * 1.15) * trackEnvelope;

    // Heroic push-in toward 12-o'clock Bird Slot #0 as Chim Lạc stamps into the drum!
    const mergeFocus = Math.sin(merge * Math.PI) * (1 - portraitLock);
    const mergeSpotY =
      (introMotionState.startWorldY + 0.42 * introMotionState.startWorldRadius) * mergeFocus;

    // Tight, damped cinema camera impulse shake when Chim Lạc slams into Bird Slot #0
    const impactActive = stampWave > 0.002 && stampWave < 0.55 ? 1 : 0;
    const impactDecay = Math.exp(-stampWave * 9.5) * impactActive * (1 - portraitLock);
    const shakeX = Math.sin(stampWave * 68.0) * 0.042 * impactDecay;
    const shakeY = Math.cos(stampWave * 82.0) * 0.036 * impactDecay;

    const camX = (-0.92 * lateralSweep + 0.24 * mergeFocus) * (1 - portraitLock) + shakeX;
    const camY = (-0.18 * lateralSweep + mergeSpotY * 0.44) * (1 - portraitLock) + shakeY;
    const camZ =
      HERO_CAMERA_Z -
      0.66 * trackEnvelope * (1 - merge * 0.45) -
      0.48 * mergeFocus +
      0.28 * (1 - introMotionState.awakeningLight) * (1 - portraitLock);

    camera.position.set(camX, camY, camZ);
    _lookTarget.set(camX * 0.32, camY * 0.68, 0);
    camera.lookAt(_lookTarget);

    // Expressive cinema Dutch roll banking during flight, strictly zeroed before portrait lock
    camera.rotation.z =
      (-0.072 * lateralSweep * (1 - merge * 0.85) + shakeX * 0.25) * (1 - portraitLock);
  });

  return null;
}
