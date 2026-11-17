"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { introMotionState } from "@/store/introStore";
import { CraneModel, type CraneWingtipHandle } from "./CraneModel";

const TRAIL_COUNT = 260;
const RIBBON_NODES = 48;

const _splinePos = new THREE.Vector3();
const _prevPos = new THREE.Vector3();
const _pos = new THREE.Vector3();
const _velDir = new THREE.Vector3(1, 0, 0);
const _aheadDir = new THREE.Vector3(1, 0, 0);
const _up = new THREE.Vector3(0, 1, 0);
const _lookMatrix = new THREE.Matrix4();
const _stampMatrix = new THREE.Matrix4();
const _flightQuat = new THREE.Quaternion();
const _bankQuat = new THREE.Quaternion();
const _stampQuat = new THREE.Quaternion();
const _finalQuat = new THREE.Quaternion();
const _forwardAxis = new THREE.Vector3(0, 0, 1);
const _xAxis = new THREE.Vector3();
const _yAxis = new THREE.Vector3(0, 0, 1);
const _zAxis = new THREE.Vector3();
const _leftTip = new THREE.Vector3();
const _rightTip = new THREE.Vector3();

/** Quintic C2-continuous smoothstep (zero acceleration jerk at both endpoints) */
function smootherstep(x: number, edge0 = 0, edge1 = 1): number {
  const t = THREE.MathUtils.clamp((x - edge0) / Math.max(1e-5, edge1 - edge0), 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function createWingtipRibbonMeshResources() {
  const positions = new Float32Array(RIBBON_NODES * 2 * 3);
  const uvs = new Float32Array(RIBBON_NODES * 2 * 2);
  const indices: number[] = [];

  for (let i = 0; i < RIBBON_NODES; i++) {
    const u = i / (RIBBON_NODES - 1);
    uvs[i * 4] = u;
    uvs[i * 4 + 1] = 0;
    uvs[i * 4 + 2] = u;
    uvs[i * 4 + 3] = 1;

    if (i < RIBBON_NODES - 1) {
      const a = i * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      indices.push(a, b, c, b, d, c);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uOpacity: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      varying vec2 vUv;
      void main() {
        float headFade = smoothstep(0.0, 0.05, vUv.x);
        float tailFade = pow(1.0 - vUv.x, 1.65);
        float edgeFade = sin(vUv.y * 3.14159);
        vec3 gold = mix(vec3(1.0, 0.95, 0.84), vec3(0.824, 0.604, 0.361), vUv.x);
        gl_FragColor = vec4(gold, headFade * tailFade * edgeFade * uOpacity * 0.68);
      }
    `,
  });

  const history = Array.from({ length: RIBBON_NODES }, () => new THREE.Vector3());
  return { geometry, material, positions, history, initialized: false };
}

/**
 * Velocity-Matched C2-Continuous Chim Lạc Flight & Seamless Drum Assimilation Controller:
 * - Sweeps heroically across the foreground spotlight, then spirals tangentially into the
 *   counter-clockwise Chim Lạc band (`r = 1.31 * S`) matching the live orbital angular velocity
 *   of Bird Slot #0 (`birdBandRotationZ`) with ZERO dead-stop, ZERO chord yank, and a strictly
 *   proper right-handed rotation matrix (`det = +1`) so the bird banks flat like liquid gold!
 */
export function CraneFlightController() {
  const rigRef = useRef<THREE.Group>(null);
  const assimilationHaloRef = useRef<THREE.Mesh>(null);
  const craneHandleRef = useRef<CraneWingtipHandle>(null);
  const spawnCursorRef = useRef(0);
  const hasPrevPosRef = useRef(false);

  const approachSpline = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-3.55, -0.34, 1.08), // Enters promptly from left foreground
        new THREE.Vector3(-1.35, 0.08, 0.78),  // Sweeps across golden spotlight with full headroom
        new THREE.Vector3(0.14, 0.14, 0.56),   // Heroic center-stage pass
        new THREE.Vector3(1.18, -0.28, 0.38),  // Graceful dive into lower-right orbital entry
        new THREE.Vector3(1.16, -0.82, 0.26),  // Tangential entry into counter-clockwise circle
        new THREE.Vector3(1.32, 0.06, 0.16),   // 3-o'clock ascending arc
      ],
      false,
      "centripetal",
      0.5
    );
  }, []);

  const assimilationHalo = useMemo(() => {
    const geom = new THREE.PlaneGeometry(0.95, 0.95);
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uIntensity: { value: 0 },
        uTime: { value: 0 },
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
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          float r = length(vUv);
          if (r > 1.0) discard;
          float angle = atan(vUv.y, vUv.x);
          float swirl = 0.75 + 0.25 * sin(angle * 6.0 - uTime * 7.0 + r * 8.0);
          float core = exp(-r * 3.1) * swirl;
          float ring = exp(-pow((r - 0.52) / 0.14, 2.0)) * 0.55;
          vec3 molten = mix(vec3(0.86, 0.62, 0.34), vec3(1.0, 0.95, 0.82), clamp(core * 1.4, 0.0, 1.0));
          gl_FragColor = vec4(molten, (core + ring) * uIntensity);
        }
      `,
    });
    return { geom, mat };
  }, []);

  const leftRibbon = useMemo(() => createWingtipRibbonMeshResources(), []);
  const rightRibbon = useMemo(() => createWingtipRibbonMeshResources(), []);

  const trailSystem = useMemo(() => {
    const positions = new Float32Array(TRAIL_COUNT * 3);
    const velocities = new Float32Array(TRAIL_COUNT * 3);
    const ages = new Float32Array(TRAIL_COUNT);
    const sizes = new Float32Array(TRAIL_COUNT);

    for (let i = 0; i < TRAIL_COUNT; i++) {
      ages[i] = 999;
      sizes[i] = 0.65 + Math.random() * 1.2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aAge", new THREE.BufferAttribute(ages, 1));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uPixelRatio: { value: 1.5 },
        uGlobalFade: { value: 1 },
      },
      vertexShader: /* glsl */ `
        attribute float aAge;
        attribute float aSize;
        uniform float uPixelRatio;
        varying float vAlpha;

        void main() {
          float life = clamp(1.0 - aAge / 1.6, 0.0, 1.0);
          vAlpha = life * life;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * life * 25.0 * uPixelRatio * (1.0 / max(0.5, -mvPosition.z));
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uGlobalFade;
        varying float vAlpha;

        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float glow = smoothstep(0.5, 0.0, d);
          vec3 col = mix(vec3(0.824, 0.604, 0.361), vec3(1.0, 0.95, 0.84), glow);
          gl_FragColor = vec4(col, glow * vAlpha * uGlobalFade * 0.88);
        }
      `,
    });

    return { geometry, material, positions, velocities, ages };
  }, []);

  useEffect(() => {
    trailSystem.material.uniforms.uPixelRatio!.value = Math.min(window.devicePixelRatio || 1, 2);
    return () => {
      trailSystem.geometry.dispose();
      trailSystem.material.dispose();
      leftRibbon.geometry.dispose();
      leftRibbon.material.dispose();
      rightRibbon.geometry.dispose();
      rightRibbon.material.dispose();
      assimilationHalo.geom.dispose();
      assimilationHalo.mat.dispose();
    };
  }, [assimilationHalo, leftRibbon, rightRibbon, trailSystem]);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = clock.getElapsedTime();
    const u = THREE.MathUtils.clamp(introMotionState.craneFlightProgress, 0, 1);
    const enter = introMotionState.craneEnterAlpha;
    const merge = THREE.MathUtils.clamp(introMotionState.craneMergeProgress, 0, 1);

    if (enter < 0.01) {
      hasPrevPosRef.current = false;
    }

    const cx = introMotionState.startWorldX;
    const cy = introMotionState.startWorldY;
    const drumRadiusScale = introMotionState.startWorldRadius;

    // 1. Free-flight foreground approach spline (u = 0 -> 0.72)
    const splineU = THREE.MathUtils.clamp(u / 0.72, 0, 1);
    approachSpline.getPointAt(splineU, _splinePos);

    // 2. Continuous velocity-matched counter-clockwise spiral locking onto rotating Bird Slot #0!
    const liveSlotAngle = Math.PI * 0.5 + introMotionState.birdBandRotationZ;
    const spiralPhase = smootherstep(u, 0.34, 1.0);
    const mergeLock = smootherstep(merge, 0.0, 0.92);

    // Sweeps counter-clockwise through 1.92 radians right onto liveSlotAngle and keeps orbiting with it!
    const orbitalAngle = liveSlotAngle - (1 - spiralPhase) * 1.92;
    const radialTighten = smootherstep(Math.max(spiralPhase * 0.82, mergeLock), 0, 1);
    const orbitalRadius = THREE.MathUtils.lerp(1.56, 1.31, radialTighten) * drumRadiusScale;
    const orbitalZ = THREE.MathUtils.lerp(
      0.34,
      0.016 * drumRadiusScale,
      smootherstep(Math.max(spiralPhase * 0.68, mergeLock), 0, 1)
    );

    const spiralX = cx + Math.cos(orbitalAngle) * orbitalRadius;
    const spiralY = cy + Math.sin(orbitalAngle) * orbitalRadius;

    // C2 quintic blend from foreground pass into counter-clockwise spiral orbit
    const toOrbitBlend = smootherstep(u, 0.34, 0.76);
    const flapHeave =
      -Math.cos(t * 4.8 * (1 - mergeLock * 0.82)) * 0.048 * (1 - toOrbitBlend * 0.5) * (1 - mergeLock);

    _pos.set(
      THREE.MathUtils.lerp(cx + _splinePos.x, spiralX, toOrbitBlend),
      THREE.MathUtils.lerp(cy + _splinePos.y, spiralY, toOrbitBlend) + flapHeave,
      THREE.MathUtils.lerp(_splinePos.z, orbitalZ, toOrbitBlend)
    );

    // Compute instantaneous smooth flight tangent from actual trajectory (never stalls!)
    if (hasPrevPosRef.current && dt > 0.0005) {
      _velDir.subVectors(_pos, _prevPos);
      if (_velDir.lengthSq() > 1e-7) {
        _velDir.normalize();
      } else {
        _velDir.set(-Math.sin(orbitalAngle), Math.cos(orbitalAngle), 0);
      }
    } else {
      approachSpline.getTangentAt(splineU, _velDir).normalize();
    }
    _prevPos.copy(_pos);
    hasPrevPosRef.current = true;

    if (rigRef.current) {
      rigRef.current.position.copy(_pos);

      // Free-flight look quaternion
      _aheadDir.copy(_pos).add(_velDir);
      _lookMatrix.lookAt(_aheadDir, _pos, _up);
      _flightQuat.setFromRotationMatrix(_lookMatrix);

      // Gentle aerodynamic roll into the counter-clockwise turn, tapering smoothly into stamp pose
      const bankAngle = -0.44 * Math.sin(toOrbitBlend * Math.PI * 0.85) * (1 - mergeLock);
      _bankQuat.setFromAxisAngle(_forwardAxis, bankAngle);
      _flightQuat.multiply(_bankQuat);

      // Proper right-handed (`det = +1`) relief stamp basis aligned with `orbitalAngle`:
      // +Z (beak) -> counter-clockwise tangent `(-sin a, cos a, 0)`
      // +Y (dorsal back) -> camera `+Z (0, 0, 1)`
      // +X (wing) -> `yAxis x zAxis = (-cos a, -sin a, 0)` => det = +1.000 (zero quaternion flip!)
      const cosA = Math.cos(orbitalAngle);
      const sinA = Math.sin(orbitalAngle);
      _xAxis.set(-cosA, -sinA, 0);
      _yAxis.set(0, 0, 1);
      _zAxis.set(-sinA, cosA, 0);
      _stampMatrix.makeBasis(_xAxis, _yAxis, _zAxis);
      _stampQuat.setFromRotationMatrix(_stampMatrix);

      // Silky quintic slerp from soaring 3D pose into flat Đông Sơn bronze relief orientation
      const poseBlend = smootherstep(Math.max((u - 0.52) / 0.48 * 0.55, merge), 0, 0.88);
      _finalQuat.copy(_flightQuat).slerp(_stampQuat, poseBlend);
      rigRef.current.quaternion.slerp(_finalQuat, 0.28 + poseBlend * 0.55);

      // Continuous progressive scale & relief depth compression matching Lead Bird #0 (`0.118 * S`)
      const targetReliefScale = 0.118 * drumRadiusScale;
      const scaleEase = smootherstep(merge, 0.0, 0.86);
      const preOrbitTaper = THREE.MathUtils.lerp(
        0.86,
        Math.max(0.26, targetReliefScale * 2.1),
        smootherstep(u, 0.22, 0.96)
      );
      const xyScale = THREE.MathUtils.lerp(preOrbitTaper, targetReliefScale, scaleEase);
      const zScale = THREE.MathUtils.lerp(
        preOrbitTaper,
        targetReliefScale * 0.18,
        smootherstep(merge, 0.08, 0.88)
      );
      rigRef.current.scale.set(xyScale, xyScale, zScale);
      rigRef.current.updateMatrixWorld(true);
    }

    // Update Golden Molten Assimilation Halo bridging 3D crane -> Bird #0 relief
    if (assimilationHaloRef.current) {
      const haloBell = Math.sin(smootherstep(merge, 0.14, 0.96) * Math.PI);
      assimilationHaloRef.current.visible = haloBell > 0.01 && enter > 0.1;
      assimilationHaloRef.current.position.set(_pos.x, _pos.y, _pos.z + 0.02);
      const haloScale = (0.28 + (1 - merge) * 0.28) * drumRadiusScale;
      assimilationHaloRef.current.scale.setScalar(haloScale);
      assimilationHalo.mat.uniforms.uIntensity!.value = haloBell * 0.85;
      assimilationHalo.mat.uniforms.uTime!.value = t;
    }

    const hasTips =
      craneHandleRef.current?.getWingtipWorldPositions(_leftTip, _rightTip) ?? false;

    const updateRibbon = (
      ribbon: ReturnType<typeof createWingtipRibbonMeshResources>,
      tip: THREE.Vector3
    ) => {
      if (!hasTips || enter < 0.05 || u < 0.02) {
        ribbon.initialized = false;
        return;
      }
      if (!ribbon.initialized || tip.distanceTo(ribbon.history[0]!) > 0.65) {
        for (const h of ribbon.history) h.copy(tip);
        ribbon.initialized = true;
      } else {
        for (let i = RIBBON_NODES - 1; i > 0; i--) {
          ribbon.history[i]!.copy(ribbon.history[i - 1]!);
        }
        ribbon.history[0]!.copy(tip);
      }

      const posAttr = ribbon.geometry.attributes.position as THREE.BufferAttribute;
      let prevNx = 0;
      let prevNy = 1;
      for (let i = 0; i < RIBBON_NODES; i++) {
        const pt = ribbon.history[i]!;
        const adj = ribbon.history[Math.min(RIBBON_NODES - 1, i + 1)]!;
        const prev = ribbon.history[Math.max(0, i - 1)]!;
        const dx = prev.x - adj.x;
        const dy = prev.y - adj.y;
        const segLen = Math.hypot(dx, dy);
        if (segLen > 1e-4) {
          prevNx = -dy / segLen;
          prevNy = dx / segLen;
        }
        const width = 0.024 * (1 - i / RIBBON_NODES) * (1 - mergeLock * 0.78);
        ribbon.positions[i * 6] = pt.x + prevNx * width;
        ribbon.positions[i * 6 + 1] = pt.y + prevNy * width;
        ribbon.positions[i * 6 + 2] = pt.z;
        ribbon.positions[i * 6 + 3] = pt.x - prevNx * width;
        ribbon.positions[i * 6 + 4] = pt.y - prevNy * width;
        ribbon.positions[i * 6 + 5] = pt.z;
      }
      posAttr.needsUpdate = true;
    };

    updateRibbon(leftRibbon, _leftTip);
    updateRibbon(rightRibbon, _rightTip);

    const ribbonAlpha = enter * (1 - smootherstep(merge, 0.35, 0.92));
    leftRibbon.material.uniforms.uOpacity!.value = ribbonAlpha;
    rightRibbon.material.uniforms.uOpacity!.value = ribbonAlpha;

    const posAttr = trailSystem.geometry.attributes.position as THREE.BufferAttribute;
    const ageAttr = trailSystem.geometry.attributes.aAge as THREE.BufferAttribute;

    if (enter > 0.05 && merge < 0.92 && hasTips) {
      for (let s = 0; s < 2; s++) {
        const src = s === 0 ? _leftTip : _rightTip;
        const idx = spawnCursorRef.current % TRAIL_COUNT;
        spawnCursorRef.current += 1;

        const spread = 0.055 * (1 - merge * 0.6);
        trailSystem.positions[idx * 3] = src.x + (Math.random() - 0.5) * spread;
        trailSystem.positions[idx * 3 + 1] = src.y + (Math.random() - 0.5) * spread;
        trailSystem.positions[idx * 3 + 2] = src.z + (Math.random() - 0.5) * spread;

        trailSystem.velocities[idx * 3] = -_velDir.x * 0.22 + (Math.random() - 0.5) * 0.16;
        trailSystem.velocities[idx * 3 + 1] = -_velDir.y * 0.22 + 0.05 + (Math.random() - 0.5) * 0.16;
        trailSystem.velocities[idx * 3 + 2] = (Math.random() - 0.5) * 0.12;
        trailSystem.ages[idx] = 0;
      }
    }

    for (let i = 0; i < TRAIL_COUNT; i++) {
      const age = trailSystem.ages[i]!;
      if (age < 2.0) {
        trailSystem.ages[i] = age + dt;
        trailSystem.positions[i * 3] =
          (trailSystem.positions[i * 3] ?? 0) + (trailSystem.velocities[i * 3] ?? 0) * dt;
        trailSystem.positions[i * 3 + 1] =
          (trailSystem.positions[i * 3 + 1] ?? 0) + (trailSystem.velocities[i * 3 + 1] ?? 0) * dt;
        trailSystem.positions[i * 3 + 2] =
          (trailSystem.positions[i * 3 + 2] ?? 0) + (trailSystem.velocities[i * 3 + 2] ?? 0) * dt;
      }
    }

    posAttr.needsUpdate = true;
    ageAttr.needsUpdate = true;
    trailSystem.material.uniforms.uGlobalFade!.value = Math.max(
      0,
      1 - introMotionState.portraitFlightProgress * 1.2
    );
  });

  return (
    <>
      <group ref={rigRef}>
        <CraneModel ref={craneHandleRef} />
      </group>
      <mesh
        ref={assimilationHaloRef}
        geometry={assimilationHalo.geom}
        material={assimilationHalo.mat}
        renderOrder={24}
        frustumCulled={false}
      />
      <mesh
        geometry={leftRibbon.geometry}
        material={leftRibbon.material}
        frustumCulled={false}
      />
      <mesh
        geometry={rightRibbon.geometry}
        material={rightRibbon.material}
        frustumCulled={false}
      />
      <points
        geometry={trailSystem.geometry}
        material={trailSystem.material}
        frustumCulled={false}
      />
    </>
  );
}
