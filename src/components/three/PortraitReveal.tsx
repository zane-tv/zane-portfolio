"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { portfolioConfig } from "@/config/portfolio";
import { introMotionState } from "@/store/introStore";

/**
 * Scene 04 — The Portrait Revelation:
 * Renders `/images/portrait.webp` inside the central `r = 1.0` circular medallion of the
 * Đông Sơn bronze drum using a custom GLSL 14-harmonic radial iris shader.
 *
 * Color Accuracy Guarantee:
 * - `toneMapped: false` prevents ACES Filmic tone-mapping from over-saturating or darkening skin tones.
 * - `#include <colorspace_fragment>` properly encodes Linear-sRGB samples from `SRGBColorSpace`
 *   back into output sRGB so colors during the WebGL intro match the original uploaded avatar
 *   and the final DOM `<Image>` 1:1 with zero shift!
 */
export function PortraitReveal() {
  const meshRef = useRef<THREE.Mesh>(null);

  const resources = useMemo(() => {
    const geometry = new THREE.CircleGeometry(1.0, 112);

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      toneMapped: false,
      uniforms: {
        uTexture: { value: null as THREE.Texture | null },
        uHasTexture: { value: 0 },
        uReveal: { value: 0 },
        uHandoff: { value: 0 },
        uTime: { value: 0 },
        uPointer: { value: new THREE.Vector2(0, 0) },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uTexture;
        uniform float uHasTexture;
        uniform float uReveal;
        uniform float uHandoff;
        uniform float uTime;
        uniform vec2 uPointer;
        varying vec2 vUv;

        void main() {
          vec2 centered = vUv * 2.0 - 1.0;
          float dist = length(centered);
          if (dist > 1.0) discard;

          // Crisp 14-harmonic Đông Sơn sun iris edge during reveal (no wide translucent muddy band!)
          float angle = atan(centered.y, centered.x);
          float harmonic = sin(angle * 14.0 - uTime * 1.8) * 0.024 * sin(uReveal * 3.14159);
          float maxR = uReveal * 1.12;
          float irisMask = smoothstep(maxR + 0.014, maxR - 0.020, dist + harmonic);

          // Razor-clean luminous golden frontier filament strictly along the expanding iris edge
          float frontier = exp(-pow((dist + harmonic - maxR + 0.004) / 0.022, 2.0)) * sin(uReveal * 3.14159);

          // Restrained 2.5D pointer parallax that settles cleanly as DOM handoff approaches
          float parallaxAmt = (1.0 - smoothstep(0.0, 0.85, uHandoff)) * 0.008;
          vec2 sampleUv = clamp(vUv - uPointer * parallaxAmt * (1.0 - dist * 0.5), 0.001, 0.999);
          vec4 texColor = uHasTexture > 0.5
            ? texture2D(uTexture, sampleUv)
            : vec4(0.04, 0.05, 0.07, 1.0);

          // Delicate linear-space golden iris edge & hairline outer rim kiss — 100% pure portrait colors inside!
          vec3 linearGold = vec3(0.72, 0.44, 0.16);
          float rimKiss = smoothstep(0.984, 1.0, dist) * 0.14 * (1.0 - uHandoff);
          vec3 color = texColor.rgb + linearGold * (frontier * 0.42 + rimKiss);

          // Smoothly yield inner disc to high-DPI DOM <img> at exact pixel & sRGB lock
          float domYield = 1.0 - smoothstep(0.35, 1.0, uHandoff);
          float finalAlpha = irisMask * domYield * smoothstep(1.0, 0.988, dist);

          gl_FragColor = vec4(color, finalAlpha);
          #include <colorspace_fragment>
        }
      `,
    });

    return { geometry, material };
  }, []);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    let activeTexture: THREE.Texture | null = null;
    let disposed = false;

    loader.load(
      portfolioConfig.identity.portrait.src,
      (tex) => {
        if (disposed) {
          tex.dispose();
          return;
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = true;
        activeTexture = tex;
        resources.material.uniforms.uTexture!.value = tex;
        resources.material.uniforms.uHasTexture!.value = 1;
      },
      undefined,
      () => {
        // Fallback dark studio circle if asset takes time or fails
      }
    );

    return () => {
      disposed = true;
      activeTexture?.dispose();
      resources.geometry.dispose();
      resources.material.dispose();
    };
  }, [resources]);

  useFrame(({ clock }) => {
    const reveal = introMotionState.portraitRevealProgress;
    const handoff = introMotionState.domHandoffAlpha;
    const visible = reveal > 0.002 && handoff < 0.998;

    if (meshRef.current) {
      meshRef.current.visible = visible;
    }
    if (!visible) return;

    resources.material.uniforms.uReveal!.value = reveal;
    resources.material.uniforms.uHandoff!.value = handoff;
    resources.material.uniforms.uTime!.value = clock.getElapsedTime();
    (resources.material.uniforms.uPointer!.value as THREE.Vector2).set(
      introMotionState.pointerSmoothX,
      introMotionState.pointerSmoothY
    );
  });

  return (
    <mesh
      ref={meshRef}
      renderOrder={15}
      geometry={resources.geometry}
      material={resources.material}
      position={[0, 0, 0.022]}
    />
  );
}
