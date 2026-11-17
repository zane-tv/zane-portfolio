"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { introMotionState } from "@/store/introStore";
import { HERO_CAMERA_Z } from "./CameraRig";

const BACKDROP_Z = -4.2;
const BACKDROP_PROJ_SCALE = (HERO_CAMERA_Z - BACKDROP_Z) / HERO_CAMERA_Z;

/**
 * Director's Cut Cinema Environment:
 * 1) Translucent Volumetric GLSL Solar Corona & 14-Ray Đông Sơn God-Rays (`z = -4.2`)
 *    perspective-locked concentrically behind the 3D drum/portrait on both desktop & mobile,
 *    letting `ParallaxHeritageBackdrop` shine through clearly once the Intro curtain lifts!
 * 2) Panavision 2.39:1 Anamorphic Horizontal Lens Streak (`anamorphicFlareMat`) that ignites
 *    across the frame when the Chim Lạc stamps into Bird Slot #0 and when the 14-ray Sun strikes!
 * 3) Museum-grade warm bronze key, burnished rim, and oxidized patina under-fill lighting.
 */
export function SceneEnvironment() {
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const rimLightRef = useRef<THREE.DirectionalLight>(null);
  const beamLightRef = useRef<THREE.SpotLight>(null);
  const pointerLightRef = useRef<THREE.PointLight>(null);
  const ghostRingRef = useRef<THREE.Mesh>(null);
  const flareMeshRef = useRef<THREE.Mesh>(null);

  const stageShaders = useMemo(() => {
    const backdropGeom = new THREE.PlaneGeometry(24, 16);
    const backdropMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uAwake: { value: 0 },
        uDrumReveal: { value: 0 },
        uStampWave: { value: 0 },
        uPulse: { value: 0 },
        uFlight: { value: 0 },
        uHandoff: { value: 0 },
        uFocus: { value: new THREE.Vector2(0, 0) },
        uPointer: { value: new THREE.Vector2(0, 0) },
      },
      vertexShader: /* glsl */ `
        varying vec2 vWorldXY;
        varying vec2 vUv;
        void main() {
          vWorldXY = position.xy;
          vUv = uv * 2.0 - 1.0;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform float uAwake;
        uniform float uDrumReveal;
        uniform float uStampWave;
        uniform float uPulse;
        uniform float uFlight;
        uniform float uHandoff;
        uniform vec2 uFocus;
        uniform vec2 uPointer;
        varying vec2 vWorldXY;
        varying vec2 vUv;

        void main() {
          vec2 center = uFocus + uPointer * 0.25;
          vec2 delta = (vWorldXY - center) * 0.26;
          float dist = length(delta);
          float angle = atan(delta.y, delta.x);

          vec3 bronzeGlow = vec3(0.84, 0.58, 0.30);
          vec3 patinaMist = vec3(0.28, 0.62, 0.54);

          // 14-harmonic Đông Sơn volumetric god-rays radiating concentrically from drum focus
          float rays14 = 0.5 + 0.5 * cos(angle * 14.0 - uTime * 0.18);
          float rays7 = 0.5 + 0.5 * sin(angle * 7.0 + uTime * 0.11);
          float godRays = pow(rays14, 3.2) * 0.65 + pow(rays7, 2.0) * 0.35;
          float rayFalloff = exp(-dist * 1.45) * (0.28 + uDrumReveal * 0.55) * (1.0 - uFlight * 0.35);

          // Atmospheric caustic bronze corona + patina under-horizon mist
          float corona = exp(-dist * 1.25) * uAwake;
          float shockBoost = sin(uStampWave * 3.14159) * 0.45 + sin(uPulse * 3.14159) * 0.38;
          float lowerMist = smoothstep(0.35, -1.05, vUv.y) * exp(-abs(delta.x) * 0.95);

          float idleSoften = 1.0 - uHandoff * 0.5;
          float glowEnergy = (corona * 0.12 + godRays * rayFalloff * 0.11 + shockBoost * exp(-dist * 1.3) * 0.22) * idleSoften;
          float mistEnergy = lowerMist * 0.055 * uAwake * idleSoften;
          vec3 col = bronzeGlow * glowEnergy + patinaMist * mistEnergy;

          float edgeMask = smoothstep(1.0, 0.72, max(abs(vUv.x), abs(vUv.y)));
          float outAlpha = clamp((glowEnergy * 1.6 + mistEnergy * 1.4) * edgeMask, 0.0, 0.82);
          gl_FragColor = vec4(col * edgeMask, outAlpha);
        }
      `,
    });

    const flareGeom = new THREE.PlaneGeometry(11.5, 2.2);
    const flareMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uIntensity: { value: 0 },
        uTintMix: { value: 0 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv * 2.0 - 1.0;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uIntensity;
        uniform float uTintMix;
        varying vec2 vUv;

        void main() {
          // Razor-sharp horizontal 2.39:1 Panavision anamorphic optical streak + hot core
          float streakY = exp(-abs(vUv.y) * 26.0);
          float streakX = pow(max(0.0, 1.0 - abs(vUv.x)), 2.2);
          float secondaryStreak = exp(-abs(vUv.y - 0.03) * 52.0) * pow(max(0.0, 1.0 - abs(vUv.x * 1.2)), 3.0);
          float core = exp(-length(vUv * vec2(3.6, 8.5)) * 3.4);

          vec3 gold = vec3(1.0, 0.86, 0.58);
          vec3 patinaCyan = vec3(0.52, 0.92, 0.82);
          vec3 col = mix(gold, patinaCyan, clamp(abs(vUv.x) * 0.72 + uTintMix * 0.25, 0.0, 1.0));

          float alpha = (streakY * streakX * 0.72 + secondaryStreak * 0.38 + core * 0.85) * uIntensity;
          if (alpha < 0.002) discard;
          gl_FragColor = vec4(col, alpha);
        }
      `,
    });

    return { backdropGeom, backdropMat, flareGeom, flareMat };
  }, []);

  useEffect(() => {
    return () => {
      stageShaders.backdropGeom.dispose();
      stageShaders.backdropMat.dispose();
      stageShaders.flareGeom.dispose();
      stageShaders.flareMat.dispose();
    };
  }, [stageShaders]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const awake = introMotionState.awakeningLight;
    const stampWave = introMotionState.craneStampShockwave;
    const pulse = introMotionState.drumPulse;
    const flightU = introMotionState.portraitFlightProgress;

    // Smooth pointer damping shared across the 3D scene
    introMotionState.pointerSmoothX +=
      (introMotionState.pointerTargetX - introMotionState.pointerSmoothX) * 0.065;
    introMotionState.pointerSmoothY +=
      (introMotionState.pointerTargetY - introMotionState.pointerSmoothY) * 0.065;

    if (keyLightRef.current) {
      keyLightRef.current.intensity = 0.45 + awake * 2.55;
      keyLightRef.current.position.x = -2.6 + awake * 5.0;
    }

    if (rimLightRef.current) {
      rimLightRef.current.intensity = 0.35 + awake * 2.05;
    }

    if (beamLightRef.current) {
      const sweep = -3.8 + awake * 5.4 + Math.sin(t * 0.38) * 0.4;
      beamLightRef.current.position.set(sweep, 3.8, 4.4);
      beamLightRef.current.intensity =
        (0.5 + awake * 3.2) * (1 - introMotionState.domHandoffAlpha * 0.2);
    }

    if (pointerLightRef.current) {
      pointerLightRef.current.position.set(
        introMotionState.pointerSmoothX * 3.6,
        introMotionState.pointerSmoothY * 2.4,
        2.8
      );
      pointerLightRef.current.intensity = 0.55 + awake * 1.35;
    }

    if (ghostRingRef.current) {
      const fadeOut = 1 - Math.min(1, introMotionState.drumRevealProgress * 1.4);
      const mat = ghostRingRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = awake * 0.095 * fadeOut;
      ghostRingRef.current.rotation.z = t * 0.05;
    }

    // Update volumetric solar corona backdrop uniforms (perspective-projected concentrically onto z = -4.2)
    const drumX = THREE.MathUtils.lerp(
      introMotionState.startWorldX,
      introMotionState.targetWorldX,
      flightU
    );
    const drumY = THREE.MathUtils.lerp(
      introMotionState.startWorldY,
      introMotionState.targetWorldY,
      flightU
    );
    const focusX = drumX * BACKDROP_PROJ_SCALE;
    const focusY = drumY * BACKDROP_PROJ_SCALE;
    stageShaders.backdropMat.uniforms.uTime!.value = t;
    stageShaders.backdropMat.uniforms.uAwake!.value = awake;
    stageShaders.backdropMat.uniforms.uDrumReveal!.value = introMotionState.drumRevealProgress;
    stageShaders.backdropMat.uniforms.uStampWave!.value = stampWave;
    stageShaders.backdropMat.uniforms.uPulse!.value = pulse;
    stageShaders.backdropMat.uniforms.uFlight!.value = flightU;
    stageShaders.backdropMat.uniforms.uHandoff!.value = introMotionState.domHandoffAlpha;
    (stageShaders.backdropMat.uniforms.uFocus!.value as THREE.Vector2).set(focusX, focusY);
    (stageShaders.backdropMat.uniforms.uPointer!.value as THREE.Vector2).set(
      introMotionState.pointerSmoothX,
      introMotionState.pointerSmoothY
    );

    // Update Panavision anamorphic horizontal lens flare
    const stampBurst = Math.sin(Math.min(1, stampWave * 1.35) * Math.PI) * (stampWave < 0.99 ? 1 : 0);
    const sunBurst = Math.sin(pulse * Math.PI) * (pulse < 0.99 ? 1 : 0);
    const entryGlint =
      Math.sin(introMotionState.craneFlightProgress * Math.PI) *
      introMotionState.craneEnterAlpha *
      0.26;
    const idleBreath =
      introMotionState.domHandoffAlpha * (0.045 + 0.025 * Math.sin(t * 0.9));

    const flareIntensity = THREE.MathUtils.clamp(
      stampBurst * 0.92 + sunBurst * 0.68 + entryGlint + idleBreath,
      0,
      1.15
    );
    stageShaders.flareMat.uniforms.uIntensity!.value = flareIntensity;
    stageShaders.flareMat.uniforms.uTintMix!.value = sunBurst * 0.6;

    if (flareMeshRef.current) {
      flareMeshRef.current.visible = flareIntensity > 0.004;
      const stampY =
        introMotionState.startWorldY + 1.31 * introMotionState.startWorldRadius;
      const activeX = THREE.MathUtils.lerp(
        introMotionState.startWorldX,
        introMotionState.targetWorldX,
        flightU
      );
      const activeY =
        stampBurst > 0.08
          ? THREE.MathUtils.lerp(introMotionState.startWorldY, stampY, 0.85)
          : THREE.MathUtils.lerp(
              introMotionState.startWorldY,
              introMotionState.targetWorldY + introMotionState.targetWorldRadius * 0.85,
              flightU
            );
      flareMeshRef.current.position.set(activeX, activeY, 0.35);
    }
  });

  return (
    <>
      {/* Translucent Volumetric Solar Corona & 14-Ray Đông Sơn God-Rays (`alpha: true` Canvas reveals ParallaxHeritageBackdrop!) */}
      <mesh
        geometry={stageShaders.backdropGeom}
        material={stageShaders.backdropMat}
        position={[0, 0, BACKDROP_Z]}
        renderOrder={-10}
      />

      <ambientLight intensity={0.46} color="#ece6db" />

      <directionalLight
        ref={keyLightRef}
        position={[2.4, 3.4, 4.6]}
        intensity={2.5}
        color="#f6d59b"
      />

      <directionalLight
        ref={rimLightRef}
        position={[-3.8, -1.9, 2.6]}
        intensity={1.95}
        color="#d29a5c"
      />

      <directionalLight position={[0.4, -3.6, 1.8]} intensity={0.68} color="#73c3a9" />

      <spotLight
        ref={beamLightRef}
        position={[-3.2, 3.8, 4.4]}
        angle={0.62}
        penumbra={0.9}
        intensity={2.8}
        distance={18}
        color="#e7b980"
      />

      <pointLight
        ref={pointerLightRef}
        position={[0, 0, 2.8]}
        intensity={1.4}
        distance={9.5}
        color="#f3cb8f"
      />

      {/* Scene 01 Awakening — faint ancient ring barely visible in darkness */}
      <mesh ref={ghostRingRef} position={[0, 0, -1.35]}>
        <ringGeometry args={[1.62, 1.65, 96]} />
        <meshBasicMaterial
          color="#d29a5c"
          transparent
          opacity={0.06}
          depthWrite={false}
        />
      </mesh>

      {/* Panavision 2.39:1 Anamorphic Horizontal Lens Streak */}
      <mesh
        ref={flareMeshRef}
        geometry={stageShaders.flareGeom}
        material={stageShaders.flareMat}
        renderOrder={30}
        frustumCulled={false}
      />
    </>
  );
}
