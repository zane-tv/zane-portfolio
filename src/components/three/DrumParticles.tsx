"use client";

import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { introMotionState, useIntroStore } from "@/store/introStore";

interface DrumParticlesProps {
  anchorPositionRef: React.RefObject<THREE.Vector3>;
  anchorScaleRef: React.RefObject<number>;
}

/**
 * Dual-layer GPU particle system:
 * 1) Ambient atmospheric bronze dust across the viewport (Scene 01 -> Idle).
 * 2) Orbital transformation shards born along the crane's wing arc that spiral into
 *    the concentric bands of the Đông Sơn drum and trail behind the portrait flight.
 */
export function DrumParticles({ anchorPositionRef, anchorScaleRef }: DrumParticlesProps) {
  const isMobile = useIntroStore((s) => s.isMobileViewport);
  const ambientCount = isMobile ? 80 : 200;
  const morphCount = isMobile ? 240 : 580;

  const ambientSystem = useMemo(() => {
    const pos = new Float32Array(ambientCount * 3);
    const seed = new Float32Array(ambientCount * 3);
    for (let i = 0; i < ambientCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 11;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4.2 - 0.6;
      seed[i * 3] = Math.random() * Math.PI * 2;
      seed[i * 3 + 1] = 0.4 + Math.random() * 1.3;
      seed[i * 3 + 2] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seed, 3));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uAlpha: { value: 0.2 },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uPixelRatio: { value: 1.5 },
      },
      vertexShader: /* glsl */ `
        attribute vec3 aSeed;
        uniform float uTime;
        uniform vec2 uPointer;
        uniform float uPixelRatio;
        varying float vTwinkle;
        varying float vTint;

        void main() {
          vec3 p = position;
          p.x += sin(uTime * 0.22 * aSeed.y + aSeed.x) * 0.28 + uPointer.x * (0.18 + aSeed.z * 0.22);
          p.y += cos(uTime * 0.18 * aSeed.y + aSeed.x * 1.3) * 0.24 + uPointer.y * (0.14 + aSeed.z * 0.18);
          vTwinkle = 0.45 + 0.55 * sin(uTime * 1.1 * aSeed.y + aSeed.x * 3.0);
          vTint = aSeed.z;

          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = (6.0 + aSeed.y * 10.0) * uPixelRatio * (1.0 / max(0.8, -mv.z));
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uAlpha;
        varying float vTwinkle;
        varying float vTint;

        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float soft = pow(smoothstep(0.5, 0.0, d), 1.8);
          vec3 bronze = vec3(0.824, 0.604, 0.361);
          vec3 patina = vec3(0.451, 0.765, 0.663);
          vec3 col = mix(bronze, patina, step(0.84, vTint) * 0.65);
          gl_FragColor = vec4(col, soft * vTwinkle * uAlpha * 0.48);
        }
      `,
    });

    return { geometry, material };
  }, [ambientCount]);

  const morphSystem = useMemo(() => {
    const dummyPos = new Float32Array(morphCount * 3);
    const birthPolar = new Float32Array(morphCount * 3); // (angle, radius, zOffset)
    const targetPolar = new Float32Array(morphCount * 3); // (angle, bandRadius, spinSpeed)

    const drumBands = [0.42, 0.68, 0.92, 1.14, 1.32, 1.52, 1.64];

    for (let i = 0; i < morphCount; i++) {
      // Birth along the crane's wide wing arc & spiral wake
      const wingSide = i % 2 === 0 ? 1 : -1;
      const bAngle = (wingSide > 0 ? 0.15 : Math.PI - 0.15) + (Math.random() - 0.5) * 1.25;
      const bRadius = 0.18 + Math.pow(Math.random(), 0.75) * 1.55;
      const bZ = (Math.random() - 0.5) * 0.55 + 0.18;

      birthPolar[i * 3] = bAngle;
      birthPolar[i * 3 + 1] = bRadius;
      birthPolar[i * 3 + 2] = bZ;

      const bandIdx = i % drumBands.length;
      const targetR = (drumBands[bandIdx] ?? 1.2) + (Math.random() - 0.5) * 0.04;
      const targetAngle = (i / morphCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.15;
      const spinDir = bandIdx % 2 === 0 ? 1 : -1;

      targetPolar[i * 3] = targetAngle;
      targetPolar[i * 3 + 1] = targetR;
      targetPolar[i * 3 + 2] = spinDir * (0.08 + Math.random() * 0.08);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(dummyPos, 3));
    geometry.setAttribute("aBirth", new THREE.BufferAttribute(birthPolar, 3));
    geometry.setAttribute("aTarget", new THREE.BufferAttribute(targetPolar, 3));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: 0 },
        uOpacity: { value: 0 },
        uHaloMorph: { value: 0 },
        uAnchor: { value: new THREE.Vector3(0, 0, 0) },
        uPrevAnchor: { value: new THREE.Vector3(0, 0, 0) },
        uScale: { value: 1 },
        uPulse: { value: 0 },
        uPixelRatio: { value: 1.5 },
      },
      vertexShader: /* glsl */ `
        attribute vec3 aBirth;
        attribute vec3 aTarget;
        uniform float uTime;
        uniform float uMorph;
        uniform float uHaloMorph;
        uniform vec3 uAnchor;
        uniform vec3 uPrevAnchor;
        uniform float uScale;
        uniform float uPulse;
        uniform float uPixelRatio;
        varying float vEnergy;

        void main() {
          // Orbital swirl interpolation from crane wing silhouette -> Đông Sơn concentric bands
          float m = smoothstep(0.0, 1.0, uMorph);
          float swirlTurns = (1.0 - m) * 2.6;
          float angle = mix(aBirth.x + swirlTurns, aTarget.x, m) + uTime * aTarget.z;

          // Push inner particles outward into outer halo when portrait reveals
          float targetR = aTarget.y;
          if (targetR < 1.04) {
            targetR = mix(targetR, 1.08 + targetR * 0.48, uHaloMorph);
          }

          float radius = mix(aBirth.y, targetR, m) * uScale;
          radius *= (1.0 + sin(uPulse * 3.14159) * 0.06);

          float zOff = mix(aBirth.z, (fract(aTarget.x * 7.13) - 0.5) * 0.08, m);
          vec3 localPos = vec3(cos(angle) * radius, sin(angle) * radius, zOff);

          // Subtle trailing wake behind portrait flight velocity
          vec3 flightDelta = uAnchor - uPrevAnchor;
          float lagFactor = fract(aBirth.x * 3.7 + aTarget.y * 2.3);
          vec3 worldPos = uAnchor + localPos - flightDelta * (lagFactor * 10.0);

          vEnergy = 0.65 + 0.35 * sin(uTime * 2.4 + aTarget.x * 5.0) + sin(uPulse * 3.14159) * 0.5;

          vec4 mv = modelViewMatrix * vec4(worldPos, 1.0);
          float sizeBoost = mix(22.0, 13.0, m);
          gl_PointSize = sizeBoost * uPixelRatio * (1.0 / max(0.8, -mv.z));
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uOpacity;
        varying float vEnergy;

        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float core = pow(smoothstep(0.5, 0.0, d), 1.6);
          vec3 warmBronze = vec3(0.88, 0.66, 0.40);
          vec3ivory = vec3(0.98, 0.94, 0.84);
          vec3 col = mix(warmBronze, vec3(0.98, 0.94, 0.84), core * 0.7);
          gl_FragColor = vec4(col * vEnergy, core * uOpacity);
        }
      `.replace("vec3ivory", "vec3 ivory"),
    });

    return { geometry, material, prevAnchor: new THREE.Vector3() };
  }, [morphCount]);

  useEffect(() => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ambientSystem.material.uniforms.uPixelRatio!.value = dpr;
    morphSystem.material.uniforms.uPixelRatio!.value = dpr;
    return () => {
      ambientSystem.geometry.dispose();
      ambientSystem.material.dispose();
      morphSystem.geometry.dispose();
      morphSystem.material.dispose();
    };
  }, [ambientSystem, morphSystem]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Update ambient dust
    ambientSystem.material.uniforms.uTime!.value = t;
    ambientSystem.material.uniforms.uAlpha!.value = introMotionState.ambientDustAlpha;
    (ambientSystem.material.uniforms.uPointer!.value as THREE.Vector2).set(
      introMotionState.pointerSmoothX,
      introMotionState.pointerSmoothY
    );

    // Update crane-to-drum orbital particles
    const anchor = anchorPositionRef.current;
    morphSystem.material.uniforms.uTime!.value = t;
    morphSystem.material.uniforms.uMorph!.value = introMotionState.morphParticlesProgress;
    morphSystem.material.uniforms.uOpacity!.value = introMotionState.morphParticlesOpacity;
    morphSystem.material.uniforms.uHaloMorph!.value = introMotionState.drumHaloMorph;
    morphSystem.material.uniforms.uScale!.value = anchorScaleRef.current;
    morphSystem.material.uniforms.uPulse!.value = introMotionState.drumPulse;

    const uPrev = morphSystem.material.uniforms.uPrevAnchor!.value as THREE.Vector3;
    const uCurr = morphSystem.material.uniforms.uAnchor!.value as THREE.Vector3;
    uPrev.lerp(uCurr, 0.22);
    uCurr.copy(anchor);
  });

  return (
    <>
      <points
        geometry={ambientSystem.geometry}
        material={ambientSystem.material}
        frustumCulled={false}
      />
      <points
        geometry={morphSystem.geometry}
        material={morphSystem.material}
        frustumCulled={false}
      />
    </>
  );
}
