"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  createFeatherWedgesLineGeometry,
  createLacBirdFriezeEngravingGeometry,
  createLacBirdReliefGeometry,
  createLozengeMeanderGeometry,
  createSawtoothRingGeometry,
  createTangentChainLineGeometry,
} from "@/lib/dongSonGeometry";
import { introMotionState, useIntroStore } from "@/store/introStore";

const INNER_COMB_COUNT = 96;
const OUTER_COMB_COUNT = 136;
const INNER_BOSS_COUNT = 18;
const BIRD_COUNT = 16;
const COMPANION_BIRD_COUNT = BIRD_COUNT - 1;

/**
 * Sleek, Minimal-Border Ngọc Lũ Đông Sơn Halo Ring System (`r <= 1.475`):
 * - Trimmed of bulky outer 3D rims, handles (`quai đồng`), and heavy bosses so the 16-bird
 *   Chim Lạc frieze and crisp hairline geometry frame the portrait with airy modern elegance!
 * - Leaves Lead Bird Slot #0 open as a shimmering golden socket until the 3D Chim Lạc merges in.
 */
export function DrumRings() {
  const reducedMotion = useIntroStore((s) => s.reducedMotion);

  const innerRingGroupRef = useRef<THREE.Group>(null);
  const bezelAndCombGroupRef = useRef<THREE.Group>(null);
  const birdFlockGroupRef = useRef<THREE.Group>(null);

  const innerCombInstRef = useRef<THREE.InstancedMesh>(null);
  const innerBossInstRef = useRef<THREE.InstancedMesh>(null);
  const outerCombInstRef = useRef<THREE.InstancedMesh>(null);
  const birdInstRef = useRef<THREE.InstancedMesh>(null);
  const leadBirdMeshRef = useRef<THREE.Mesh>(null);
  const leadSocketRingRef = useRef<THREE.Mesh>(null);

  const resources = useMemo(() => {
    const innerFeathers = createFeatherWedgesLineGeometry(14, 0.172, 0.435, 6);
    const innerMeander = createLozengeMeanderGeometry(24, 0.505, 0.605);
    const innerChain = createTangentChainLineGeometry(INNER_BOSS_COUNT, 0.73, 0.058, 22);
    const innerSawtooth = createSawtoothRingGeometry(52, 0.86, 0.96);

    const birdReliefGeom = createLacBirdReliefGeometry(0.00385);
    const birdEngravingLines = createLacBirdFriezeEngravingGeometry(BIRD_COUNT, 1.31, 0.00385);
    const outerMeander = createLozengeMeanderGeometry(44, 1.055, 1.118);
    const outerHairlineSawtooth = createSawtoothRingGeometry(72, 1.438, 1.472);

    const innerCombGeom = new THREE.BoxGeometry(0.0055, 0.054, 0.008);
    const outerCombGeom = new THREE.BoxGeometry(0.005, 0.052, 0.009);
    const beadSphereGeom = new THREE.SphereGeometry(0.01, 10, 8);
    const socketRingGeom = new THREE.RingGeometry(0.055, 0.125, 32);

    const innerRingSpecs: Array<[number, number]> = [
      [0.464, 0.004],
      [0.622, 0.0035],
      [0.822, 0.0035],
      [0.978, 0.004],
    ];

    // Ultra-slim hairline bronze rings + one airy, minimalist outer ring (`r = 1.605`)
    const outerRingSpecs: Array<[number, number]> = [
      [1.014, 0.0045], // Clean inner portrait bezel hairline
      [1.148, 0.0032], // Inner border of Chim Lạc band
      [1.432, 0.0035], // Outer border of Chim Lạc band
      [1.476, 0.0038], // Crisp drum edge hairline
      [1.605, 0.0034], // Simple, airy outer halo ring requested by user
    ];

    const innerTorusGeoms = innerRingSpecs.map(([r, tube]) => new THREE.TorusGeometry(r, tube, 8, 112));
    const outerTorusGeoms = outerRingSpecs.map(([r, tube]) => new THREE.TorusGeometry(r, tube, 8, 128));

    const innerCastBronze = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#d8a162"),
      emissive: new THREE.Color("#7a4a16"),
      emissiveIntensity: 0.24,
      metalness: 0.86,
      roughness: 0.25,
      transparent: true,
      opacity: 0,
    });

    const outerCastBronze = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#d9a365"),
      emissive: new THREE.Color("#875319"),
      emissiveIntensity: 0.24,
      metalness: 0.88,
      roughness: 0.24,
      transparent: true,
      opacity: 0,
    });

    const birdReliefGold = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#efc68c"),
      emissive: new THREE.Color("#b87932"),
      emissiveIntensity: 0.36,
      metalness: 0.85,
      roughness: 0.19,
      clearcoat: 0.35,
      transparent: true,
      opacity: 0,
    });

    const leadBirdGoldMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#f7d69e"),
      emissive: new THREE.Color("#d68d38"),
      emissiveIntensity: 0.42,
      metalness: 0.86,
      roughness: 0.18,
      clearcoat: 0.45,
      transparent: true,
      opacity: 0,
    });

    const socketRingMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#f6d59b"),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const innerEngraveMat = new THREE.LineBasicMaterial({
      color: new THREE.Color("#e4b378"),
      transparent: true,
      opacity: 0,
    });

    const outerEngraveMat = new THREE.LineBasicMaterial({
      color: new THREE.Color("#e6b67c"),
      transparent: true,
      opacity: 0,
    });

    const birdFeatherLineMat = new THREE.LineBasicMaterial({
      color: new THREE.Color("#fff0d4"),
      transparent: true,
      opacity: 0,
    });

    const patinaRimLineMat = new THREE.LineBasicMaterial({
      color: new THREE.Color("#73c3a9"),
      transparent: true,
      opacity: 0,
    });

    return {
      innerFeathers,
      innerMeander,
      innerChain,
      innerSawtooth,
      birdReliefGeom,
      birdEngravingLines,
      outerMeander,
      outerHairlineSawtooth,
      innerCombGeom,
      outerCombGeom,
      beadSphereGeom,
      socketRingGeom,
      innerTorusGeoms,
      outerTorusGeoms,
      innerCastBronze,
      outerCastBronze,
      birdReliefGold,
      leadBirdGoldMat,
      socketRingMat,
      innerEngraveMat,
      outerEngraveMat,
      birdFeatherLineMat,
      patinaRimLineMat,
    };
  }, []);

  useEffect(() => {
    const dummy = new THREE.Object3D();

    if (innerCombInstRef.current) {
      for (let i = 0; i < INNER_COMB_COUNT; i++) {
        const a = (i / INNER_COMB_COUNT) * Math.PI * 2;
        dummy.position.set(Math.cos(a) * 0.91, Math.sin(a) * 0.91, 0.006);
        dummy.rotation.set(0, 0, a - Math.PI / 2);
        dummy.scale.set(1, i % 4 === 0 ? 1.15 : 0.85, 1);
        dummy.updateMatrix();
        innerCombInstRef.current.setMatrixAt(i, dummy.matrix);
      }
      innerCombInstRef.current.instanceMatrix.needsUpdate = true;
    }

    if (innerBossInstRef.current) {
      for (let i = 0; i < INNER_BOSS_COUNT; i++) {
        const a = (i / INNER_BOSS_COUNT) * Math.PI * 2;
        dummy.position.set(Math.cos(a) * 0.73, Math.sin(a) * 0.73, 0.008);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1.05, 1.05, 0.7);
        dummy.updateMatrix();
        innerBossInstRef.current.setMatrixAt(i, dummy.matrix);
      }
      innerBossInstRef.current.instanceMatrix.needsUpdate = true;
    }

    if (outerCombInstRef.current) {
      for (let i = 0; i < OUTER_COMB_COUNT; i++) {
        const a = (i / OUTER_COMB_COUNT) * Math.PI * 2;
        dummy.position.set(Math.cos(a) * 1.088, Math.sin(a) * 1.088, 0.006);
        dummy.rotation.set(0, 0, a - Math.PI / 2);
        dummy.scale.set(1, i % 5 === 0 ? 1.12 : 0.82, 1);
        dummy.updateMatrix();
        outerCombInstRef.current.setMatrixAt(i, dummy.matrix);
      }
      outerCombInstRef.current.instanceMatrix.needsUpdate = true;
    }

    if (birdInstRef.current) {
      const birdBandR = 1.31;
      for (let idx = 0; idx < COMPANION_BIRD_COUNT; idx++) {
        const slotIndex = idx + 1;
        const a = Math.PI * 0.5 + (slotIndex / BIRD_COUNT) * Math.PI * 2;
        dummy.position.set(Math.cos(a) * birdBandR, Math.sin(a) * birdBandR, 0.006);
        dummy.rotation.set(0, 0, a - Math.PI / 2);
        dummy.scale.set(1, 1, 0.75);
        dummy.updateMatrix();
        birdInstRef.current.setMatrixAt(idx, dummy.matrix);
      }
      birdInstRef.current.instanceMatrix.needsUpdate = true;
    }

    return () => {
      resources.innerFeathers.dispose();
      resources.innerMeander.dispose();
      resources.innerChain.dispose();
      resources.innerSawtooth.dispose();
      resources.birdReliefGeom.dispose();
      resources.birdEngravingLines.dispose();
      resources.outerMeander.dispose();
      resources.outerHairlineSawtooth.dispose();
      resources.innerCombGeom.dispose();
      resources.outerCombGeom.dispose();
      resources.beadSphereGeom.dispose();
      resources.socketRingGeom.dispose();
      resources.innerTorusGeoms.forEach((g) => g.dispose());
      resources.outerTorusGeoms.forEach((g) => g.dispose());
      resources.innerCastBronze.dispose();
      resources.outerCastBronze.dispose();
      resources.birdReliefGold.dispose();
      resources.leadBirdGoldMat.dispose();
      resources.socketRingMat.dispose();
      resources.innerEngraveMat.dispose();
      resources.outerEngraveMat.dispose();
      resources.birdFeatherLineMat.dispose();
      resources.patinaRimLineMat.dispose();
    };
  }, [resources]);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = clock.getElapsedTime();
    const reveal = introMotionState.drumRevealProgress;
    const merge = introMotionState.craneMergeProgress;
    const haloMorph = introMotionState.drumHaloMorph;
    const stampFlash = Math.sin(Math.min(1, introMotionState.craneStampShockwave * 1.2) * Math.PI);
    const pulse = Math.sin(introMotionState.drumPulse * Math.PI);
    const beatBoost =
      Math.sin(introMotionState.globalDrumBeatWave * Math.PI) *
      introMotionState.globalDrumBeatStrength;

    const innerReveal = THREE.MathUtils.smoothstep(reveal, 0.04, 0.52);
    const midReveal = THREE.MathUtils.smoothstep(reveal, 0.2, 0.76);
    const outerReveal = THREE.MathUtils.smoothstep(reveal, 0.38, 1.0);

    const innerPortraitYield = Math.max(0, 1 - haloMorph * 1.08);
    resources.innerEngraveMat.opacity = innerReveal * 0.85 * innerPortraitYield;
    resources.innerCastBronze.opacity = innerReveal * 0.94 * innerPortraitYield;
    resources.innerCastBronze.emissiveIntensity = 0.22 + pulse * 0.7 + beatBoost * 0.45;

    if (innerRingGroupRef.current) {
      innerRingGroupRef.current.visible = innerPortraitYield > 0.01;
    }

    const idleRefinement = 1 - introMotionState.domHandoffAlpha * 0.1;
    resources.outerCastBronze.opacity = midReveal * 0.82 * idleRefinement;
    resources.outerCastBronze.emissiveIntensity =
      0.22 + (1 - midReveal) * 0.45 + pulse * 0.65 + stampFlash * 0.4 + beatBoost * 0.42;

    resources.birdReliefGold.opacity = midReveal * 0.96;
    resources.birdReliefGold.emissiveIntensity =
      0.34 + pulse * 0.85 + stampFlash * 0.85 + beatBoost * 0.65;

    const leadCrystallize = THREE.MathUtils.smoothstep(merge, 0.26, 0.84);
    resources.leadBirdGoldMat.opacity = leadCrystallize * 0.98;
    resources.leadBirdGoldMat.emissiveIntensity =
      0.38 + (1 - leadCrystallize) * 1.65 + stampFlash * 0.95 + pulse * 0.65 + beatBoost * 0.55;

    if (leadBirdMeshRef.current) {
      const crownScale = THREE.MathUtils.lerp(1.22, 1.1, leadCrystallize);
      leadBirdMeshRef.current.scale.set(crownScale, crownScale, 0.85);
    }

    const socketFade = midReveal * (1 - THREE.MathUtils.smoothstep(merge, 0.48, 0.92));
    resources.socketRingMat.opacity = socketFade * (0.38 + 0.2 * Math.sin(t * 6.0));
    if (leadSocketRingRef.current) {
      leadSocketRingRef.current.visible = socketFade > 0.01;
      const pulseS = 1 + 0.12 * Math.sin(t * 5.2);
      leadSocketRingRef.current.scale.setScalar(pulseS);
    }

    resources.birdFeatherLineMat.opacity = midReveal * 0.72 * idleRefinement;
    resources.outerEngraveMat.opacity = outerReveal * 0.62 * idleRefinement;
    resources.patinaRimLineMat.opacity = (outerReveal * 0.48 + beatBoost * 0.24) * idleRefinement;

    if (!reducedMotion) {
      if (reveal < 0.005) {
        if (birdFlockGroupRef.current) birdFlockGroupRef.current.rotation.z = 0;
        introMotionState.birdBandRotationZ = 0;
      } else {
        const emergeGate = THREE.MathUtils.smoothstep(reveal, 0.02, 0.55);
        const speedScale = (1 - introMotionState.domHandoffAlpha * 0.58) * emergeGate;

        if (innerRingGroupRef.current) {
          innerRingGroupRef.current.rotation.z -= dt * 0.14 * speedScale;
        }
        if (bezelAndCombGroupRef.current) {
          bezelAndCombGroupRef.current.rotation.z -= dt * 0.072 * speedScale;
        }
        if (birdFlockGroupRef.current) {
          birdFlockGroupRef.current.rotation.z += dt * 0.165 * speedScale;
          introMotionState.birdBandRotationZ = birdFlockGroupRef.current.rotation.z;
        }
      }
    }
  });

  return (
    <group>
      {/* 1. Inner Medallion Engravings (Scene 03 Đông Sơn Drum Center) */}
      <group ref={innerRingGroupRef} position={[0, 0, 0.004]}>
        <lineSegments geometry={resources.innerFeathers} material={resources.innerEngraveMat} />
        <lineSegments geometry={resources.innerMeander} material={resources.innerEngraveMat} />
        <lineSegments geometry={resources.innerChain} material={resources.innerEngraveMat} />
        <lineSegments geometry={resources.innerSawtooth} material={resources.innerEngraveMat} />
        <instancedMesh
          ref={innerCombInstRef}
          args={[resources.innerCombGeom, resources.innerCastBronze, INNER_COMB_COUNT]}
        />
        <instancedMesh
          ref={innerBossInstRef}
          args={[resources.beadSphereGeom, resources.innerCastBronze, INNER_BOSS_COUNT]}
        />
        {resources.innerTorusGeoms.map((geom, idx) => (
          <mesh key={`in-torus-${idx}`} geometry={geom} material={resources.innerCastBronze} />
        ))}
      </group>

      {/* 2. Slim Hairline Bezel, Fine Comb & Patina Sawtooth Whisper */}
      <group ref={bezelAndCombGroupRef}>
        {resources.outerTorusGeoms.map((geom, idx) => (
          <mesh key={`out-torus-${idx}`} geometry={geom} material={resources.outerCastBronze} />
        ))}
        <instancedMesh
          ref={outerCombInstRef}
          args={[resources.outerCombGeom, resources.outerCastBronze, OUTER_COMB_COUNT]}
        />
        <lineSegments
          geometry={resources.outerMeander}
          material={resources.outerEngraveMat}
          position={[0, 0, 0.005]}
        />
        <lineSegments
          geometry={resources.outerHairlineSawtooth}
          material={resources.patinaRimLineMat}
          position={[0, 0, 0.006]}
        />
      </group>

      {/* 3. Sacred 16-Bird Ngọc Lũ Chim Lạc Frieze */}
      <group ref={birdFlockGroupRef}>
        <instancedMesh
          ref={birdInstRef}
          args={[resources.birdReliefGeom, resources.birdReliefGold, COMPANION_BIRD_COUNT]}
        />
        <mesh
          ref={leadSocketRingRef}
          geometry={resources.socketRingGeom}
          material={resources.socketRingMat}
          position={[0, 1.31, 0.009]}
        />
        <mesh
          ref={leadBirdMeshRef}
          geometry={resources.birdReliefGeom}
          material={resources.leadBirdGoldMat}
          position={[0, 1.31, 0.006]}
        />
        <lineSegments
          geometry={resources.birdEngravingLines}
          material={resources.birdFeatherLineMat}
        />
      </group>
    </group>
  );
}
