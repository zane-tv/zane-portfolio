"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createDongSonSunGeometry } from "@/lib/dongSonGeometry";
import { introMotionState, useIntroStore } from "@/store/introStore";
import { DrumRings } from "./DrumRings";

/**
 * Sleek, Refined Đông Sơn Bronze Drum (Ngọc Lũ Lineage):
 * - Clean, slim Halo Collar (`r = 1.01 .. 1.48`) without bulky outer 3D rims or handles,
 *   letting the 16-bird Chim Lạc frieze and central portrait shine with museum-grade elegance.
 * - Faceted 3D 14-ray star sun + central boss (`núm trống`) during Intro.
 * - Synchronized with the Full-Page Drum-Beat Resonance Aura (`globalDrumBeatWave`).
 */
export function BronzeDrum() {
  const reducedMotion = useIntroStore((s) => s.reducedMotion);
  const rootRef = useRef<THREE.Group>(null);
  const sunMeshRef = useRef<THREE.Mesh>(null);
  const pulseMeshRef = useRef<THREE.Mesh>(null);

  const resources = useMemo(() => {
    const sunGeom = createDongSonSunGeometry(14, 0.445, 0.155, 0.044);
    const tympanumGeom = new THREE.CircleGeometry(1.485, 128);
    const pulsePlaneGeom = new THREE.PlaneGeometry(3.8, 3.8);

    const sunMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#f0be7a"),
      emissive: new THREE.Color("#8f5518"),
      emissiveIntensity: 0.36,
      metalness: 0.9,
      roughness: 0.2,
      clearcoat: 0.42,
      transparent: true,
      depthWrite: false,
      opacity: 0,
    });

    const tympanumShaderMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uReveal: { value: 0 },
        uHaloMorph: { value: 0 },
        uBeatEnergy: { value: 0 },
        uTime: { value: 0 },
        uPointer: { value: new THREE.Vector2(0, 0) },
      },
      vertexShader: /* glsl */ `
        varying vec2 vPos;
        void main() {
          vPos = position.xy;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uReveal;
        uniform float uHaloMorph;
        uniform float uBeatEnergy;
        uniform float uTime;
        uniform vec2 uPointer;
        varying vec2 vPos;

        void main() {
          float r = length(vPos);
          if (r > 1.48) discard;

          // Hollow inner r < 1.005 cleanly as portrait emerges
          float innerCut = mix(0.0, smoothstep(0.985, 1.012, r), uHaloMorph);
          float alphaMask = mix(1.0, innerCut, uHaloMorph);
          if (alphaMask < 0.005) discard;

          float angle = atan(vPos.y, vPos.x);

          // Subtle anisotropic brushed obsidian-bronze sheen
          float lightDir = atan(uPointer.y + 0.65, uPointer.x + 0.45);
          float aniso = pow(0.5 + 0.5 * cos((angle - lightDir) * 2.0), 4.0);
          float microGrooves = 0.5 + 0.5 * sin(r * 320.0);
          float bandRelief = 0.5 + 0.5 * cos(r * 26.0);

          vec3 darkBronze = vec3(0.052, 0.056, 0.062);
          vec3 antiqueBronze = vec3(0.18, 0.132, 0.082);
          vec3 burnishedGold = vec3(0.66, 0.46, 0.25);
          vec3 patinaCrevice = vec3(0.10, 0.24, 0.20);

          vec3 baseCol = mix(darkBronze, antiqueBronze, bandRelief * 0.52 + microGrooves * 0.16);
          float patinaZone = exp(-pow((r - 1.31) / 0.15, 2.0)) * 0.28;
          baseCol = mix(baseCol, patinaCrevice, patinaZone * (1.0 - bandRelief * 0.45));
          baseCol += burnishedGold * (aniso * 0.15 + uBeatEnergy * 0.16);

          // Static golden portrait bezel aura baked directly into tympanum so pulsePlaneGeom can sleep between beats
          float staticRimGlow = exp(-pow((r - 1.02) / 0.05, 2.0)) * (0.1 / 0.86);
          baseCol += vec3(0.84, 0.61, 0.35) * staticRimGlow;

          float edgeSoft = smoothstep(1.48, 1.445, r);
          float finalAlpha = uReveal * 0.86 * alphaMask * edgeSoft;
          gl_FragColor = vec4(baseCol, finalAlpha);
        }
      `,
    });

    const pulseShaderMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uPulse: { value: 0 },
        uStampWave: { value: 0 },
        uStampOrigin: { value: new THREE.Vector2(0, 1.31) },
        uGlobalBeatWave: { value: 0 },
        uGlobalBeatStrength: { value: 0 },
        uHaloMorph: { value: 0 },
        uReveal: { value: 0 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv * 2.0 - 1.0;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uPulse;
        uniform float uStampWave;
        uniform vec2 uStampOrigin;
        uniform float uGlobalBeatWave;
        uniform float uGlobalBeatStrength;
        uniform float uHaloMorph;
        uniform float uReveal;
        varying vec2 vUv;

        void main() {
          vec2 p = vUv * 1.9;
          float r = length(p);

          // Keep central portrait disc 100% free of additive bronze wash once portrait reveals!
          float portraitClear = mix(1.0, smoothstep(0.975, 1.015, r), uHaloMorph);

          // 1) Golden impact shockwave erupting from live Bird Slot #0 coordinates
          float distFromMergedBird = length(p - uStampOrigin);
          float stampRadius = uStampWave * 2.65;
          float stampRing = exp(-pow((distFromMergedBird - stampRadius) / 0.12, 2.0)) * sin(uStampWave * 3.14159);
          float stampFlash = exp(-pow(distFromMergedBird / 0.24, 2.0)) * sin(clamp(uStampWave * 2.2, 0.0, 1.0) * 3.14159);
          float drumMask = smoothstep(1.56, 1.44, r);

          // 2) Primary resonant drum-strike wave from central 14-ray sun
          float waveCenter = uPulse * 1.62;
          float band = exp(-pow((r - waveCenter) / 0.08, 2.0)) * sin(uPulse * 3.14159);

          // 3) Synchronized Ceremonial Drum-Beat Ripple (balanced so Chim Lạc gold stays rich, never blown-out white)
          float beatR = 1.01 + uGlobalBeatWave * 0.72;
          float beatBand = exp(-pow((r - beatR) / 0.065, 2.0)) * sin(uGlobalBeatWave * 3.14159) * uGlobalBeatStrength * 0.42;
          float patinaEchoR = 1.01 + max(0.0, uGlobalBeatWave - 0.12) * 0.65;
          float patinaEcho = exp(-pow((r - patinaEchoR) / 0.05, 2.0)) * sin(uGlobalBeatWave * 3.14159) * uGlobalBeatStrength * 0.28;

          // 4) Dynamic beat-only golden bezel boost (static 0.1 aura lives in tympanumShaderMat)
          float rimGlow = exp(-pow((r - 1.02) / 0.05, 2.0)) * (uGlobalBeatStrength * sin(uGlobalBeatWave * 3.14159) * 0.16) * uReveal;

          float goldTotal = ((stampRing * 0.85 + stampFlash * 0.8) * drumMask + band * 0.65 + beatBand + rimGlow) * portraitClear;
          float alpha = clamp(goldTotal + patinaEcho * portraitClear, 0.0, 0.85);
          vec3 goldCol = mix(vec3(0.84, 0.61, 0.35), vec3(0.98, 0.90, 0.74), clamp(stampRing + stampFlash + band + beatBand, 0.0, 1.0));
          vec3 patinaCol = vec3(0.45, 0.78, 0.68);
          vec3 col = mix(goldCol, patinaCol, clamp((patinaEcho * portraitClear) / max(0.001, alpha), 0.0, 0.65));
          gl_FragColor = vec4(col, alpha);
        }
      `,
    });

    return {
      sunGeom,
      tympanumGeom,
      pulsePlaneGeom,
      sunMaterial,
      tympanumShaderMat,
      pulseShaderMat,
    };
  }, []);

  useEffect(() => {
    return () => {
      resources.sunGeom.dispose();
      resources.tympanumGeom.dispose();
      resources.pulsePlaneGeom.dispose();
      resources.sunMaterial.dispose();
      resources.tympanumShaderMat.dispose();
      resources.pulseShaderMat.dispose();
    };
  }, [resources]);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = clock.getElapsedTime();
    const reveal = introMotionState.drumRevealProgress;
    if (rootRef.current) {
      rootRef.current.visible = reveal > 0.005;
    }
    if (reveal <= 0.005) {
      if (pulseMeshRef.current) pulseMeshRef.current.visible = false;
      return;
    }

    const haloMorph = introMotionState.drumHaloMorph;
    const pulse = introMotionState.drumPulse;
    const stampWave = introMotionState.craneStampShockwave;
    const beatWave = introMotionState.globalDrumBeatWave;
    const beatStrength = introMotionState.globalDrumBeatStrength;
    const beatEnergy = Math.sin(beatWave * Math.PI) * beatStrength;

    if (rootRef.current) {
      const thumpScale = 1 + beatEnergy * 0.016;
      rootRef.current.scale.setScalar(thumpScale);
    }

    if (sunMeshRef.current) {
      const sunVisible = haloMorph < 0.88;
      sunMeshRef.current.visible = sunVisible;
      if (sunVisible) {
        const baseRevealScale = 0.38 + 0.62 * THREE.MathUtils.smoothstep(reveal, 0.0, 0.42);
        const crownExpand = 1 + haloMorph * 0.85;
        sunMeshRef.current.scale.set(baseRevealScale * crownExpand, baseRevealScale * crownExpand, 1);
        sunMeshRef.current.position.z = 0.012 - haloMorph * 0.06;
        if (!reducedMotion) {
          sunMeshRef.current.rotation.z -= dt * (0.14 - haloMorph * 0.095);
        }
        resources.sunMaterial.opacity =
          THREE.MathUtils.smoothstep(reveal, 0.0, 0.32) * Math.max(0, 1 - haloMorph * 1.25);
        resources.sunMaterial.emissiveIntensity =
          0.3 + Math.sin(pulse * Math.PI) * 1.05 + beatEnergy * 0.6;
      }
    }

    resources.tympanumShaderMat.uniforms.uReveal!.value = THREE.MathUtils.smoothstep(reveal, 0.05, 0.68);
    resources.tympanumShaderMat.uniforms.uHaloMorph!.value = haloMorph;
    resources.tympanumShaderMat.uniforms.uBeatEnergy!.value = beatEnergy;
    resources.tympanumShaderMat.uniforms.uTime!.value = t;
    (resources.tympanumShaderMat.uniforms.uPointer!.value as THREE.Vector2).set(
      introMotionState.pointerSmoothX,
      introMotionState.pointerSmoothY
    );

    const hasActivePulseWave =
      (pulse > 0.001 && pulse < 0.999) ||
      (stampWave > 0.001 && stampWave < 0.999) ||
      beatEnergy > 0.002;

    if (pulseMeshRef.current) {
      pulseMeshRef.current.visible = hasActivePulseWave;
    }

    if (hasActivePulseWave) {
      const liveSlotAngle = Math.PI * 0.5 + introMotionState.birdBandRotationZ;
      (resources.pulseShaderMat.uniforms.uStampOrigin!.value as THREE.Vector2).set(
        Math.cos(liveSlotAngle) * 1.31,
        Math.sin(liveSlotAngle) * 1.31
      );
      resources.pulseShaderMat.uniforms.uPulse!.value = pulse;
      resources.pulseShaderMat.uniforms.uStampWave!.value = stampWave;
      resources.pulseShaderMat.uniforms.uGlobalBeatWave!.value = beatWave;
      resources.pulseShaderMat.uniforms.uGlobalBeatStrength!.value = beatStrength;
      resources.pulseShaderMat.uniforms.uHaloMorph!.value = haloMorph;
      resources.pulseShaderMat.uniforms.uReveal!.value = reveal;
    }
  });

  return (
    <group ref={rootRef}>
      {/* Sleek Brushed Bronze & Patina Halo Collar Disc (`r <= 1.48`) */}
      <mesh
        geometry={resources.tympanumGeom}
        material={resources.tympanumShaderMat}
        position={[0, 0, -0.02]}
      />

      {/* Faceted 3D 14-Ray Đông Sơn Sun & Central Boss */}
      <mesh
        ref={sunMeshRef}
        geometry={resources.sunGeom}
        material={resources.sunMaterial}
        position={[0, 0, 0.014]}
      />

      {/* Refined Ngọc Lũ Ornamental Bands (Zero heavy outer rims or handles!) */}
      <DrumRings />

      {/* Resonant Strike Shockwave Layer (Hidden at rest between beats; static bezel glow lives in tympanum!) */}
      <mesh
        ref={pulseMeshRef}
        geometry={resources.pulsePlaneGeom}
        material={resources.pulseShaderMat}
        position={[0, 0, 0.018]}
      />
    </group>
  );
}
