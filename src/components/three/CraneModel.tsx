"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { introMotionState } from "@/store/introStore";

const _ivoryBaseColor = new THREE.Color("#f3ede2");
const _moltenGoldColor = new THREE.Color("#efc68c");

export interface CraneWingtipHandle {
  getWingtipWorldPositions: (leftOut: THREE.Vector3, rightOut: THREE.Vector3) => boolean;
}

/**
 * 3D cambered airfoil feather blade extending along +X (root = 0, tip = 1),
 * with leading edge toward +Z and broader trailing vane toward -Z, plus a raised
 * central golden quill ridge (`sống lông vũ nổi`).
 */
function createCamberedFeatherGeometry(): THREE.BufferGeometry {
  const segsU = 10;
  const segsV = 4;
  const positions: number[] = [];
  const indices: number[] = [];

  for (let iu = 0; iu <= segsU; iu++) {
    const u = iu / segsU;
    const spanX = u;
    const camberY = Math.sin(u * Math.PI * 0.85) * 0.022 - u * u * 0.008;
    const chord = Math.sin(Math.pow(u, 0.62) * Math.PI) * 0.155 + (1 - u) * 0.045;

    for (let iv = 0; iv <= segsV; iv++) {
      const v = iv / segsV;
      // v=0 -> leading edge (+Z), v=1 -> trailing edge (-Z)
      const localZ = (0.28 - v) * chord;
      const shaftRidge = Math.exp(-Math.pow((v - 0.28) / 0.16, 2)) * 0.008 * (1 - u * 0.6);
      const chordArch = Math.sin(v * Math.PI) * 0.01;
      positions.push(spanX, camberY + shaftRidge + chordArch, localZ);
    }
  }

  const stride = segsV + 1;
  for (let iu = 0; iu < segsU; iu++) {
    for (let iv = 0; iv < segsV; iv++) {
      const a = iu * stride + iv;
      const b = (iu + 1) * stride + iv;
      const c = (iu + 1) * stride + (iv + 1);
      const d = iu * stride + (iv + 1);
      indices.push(a, b, c, a, c, d);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

/**
 * Continuous sculpted 3D wing airfoil mantle (`mảng cánh liền khối tạo dáng cánh hạc mượt mà`)
 * so there are zero sawtooth gaps between shoulder, elbow, and wrist.
 */
function createWingAirfoilSurface(
  span: number,
  rootLeadZ: number,
  rootTrailZ: number,
  tipLeadZ: number,
  tipTrailZ: number
): THREE.BufferGeometry {
  const segsU = 14;
  const segsV = 6;
  const positions: number[] = [];
  const indices: number[] = [];

  for (let iu = 0; iu <= segsU; iu++) {
    const u = iu / segsU;
    const x = u * span;
    const archFactor = Math.sin(u * Math.PI);
    const leadZ = THREE.MathUtils.lerp(rootLeadZ, tipLeadZ, u) + archFactor * 0.06;
    const trailZ = THREE.MathUtils.lerp(rootTrailZ, tipTrailZ, u) - archFactor * 0.04;

    for (let iv = 0; iv <= segsV; iv++) {
      const v = iv / segsV;
      const z = THREE.MathUtils.lerp(leadZ, trailZ, v);
      // Aerodynamic airfoil thickness & dorsal camber
      const camber = Math.sin(Math.pow(v, 0.7) * Math.PI) * 0.036 * (1 - u * 0.45);
      positions.push(x, camber, z);
    }
  }

  const stride = segsV + 1;
  for (let iu = 0; iu < segsU; iu++) {
    for (let iv = 0; iv < segsV; iv++) {
      const a = iu * stride + iv;
      const b = (iu + 1) * stride + iv;
      const c = (iu + 1) * stride + (iv + 1);
      const d = iu * stride + (iv + 1);
      indices.push(a, b, c, a, c, d);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

/**
 * Continuous 46-slice anatomical lofted Chim Hạc torso, keeled breast,
 * arched S-neck, cranial dome, and razor-slender elongated Lạc beak.
 */
function createLoftedCraneTorsoAndNeck(): {
  bodyGeom: THREE.BufferGeometry;
  beakGeom: THREE.BufferGeometry;
} {
  const stations: Array<[number, number, number, number, number]> = [
    [0.04, -0.82, 0.018, 0.016, 0.0],
    [0.03, -0.62, 0.068, 0.056, 0.01],
    [0.01, -0.34, 0.132, 0.118, 0.024],
    [0.0, -0.04, 0.158, 0.144, 0.042],
    [0.03, 0.20, 0.118, 0.112, 0.018],
    [0.10, 0.38, 0.066, 0.066, 0.0],
    [0.24, 0.53, 0.045, 0.047, 0.0],
    [0.39, 0.64, 0.040, 0.042, 0.0],
    [0.49, 0.76, 0.051, 0.055, 0.0],
    [0.51, 0.86, 0.053, 0.054, 0.0],
    [0.47, 0.96, 0.033, 0.031, 0.0],
  ];

  const beakStations: Array<[number, number, number, number, number]> = [
    [0.47, 0.95, 0.032, 0.030, 0.0],
    [0.45, 1.12, 0.021, 0.018, 0.0],
    [0.425, 1.32, 0.012, 0.010, 0.0],
    [0.395, 1.56, 0.003, 0.003, 0.0],
  ];

  function buildCleanLoft(pts: Array<[number, number, number, number, number]>, radialSegs = 22) {
    const curvePos = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(0, p[0], p[1])));
    const steps = pts.length * 5;
    const positions: number[] = [];
    const indices: number[] = [];

    const p = new THREE.Vector3();
    const tan = new THREE.Vector3();
    const normal = new THREE.Vector3();
    const right = new THREE.Vector3(1, 0, 0);

    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const scaled = t * (pts.length - 1);
      const i0 = Math.min(pts.length - 2, Math.floor(scaled));
      const f = scaled - i0;
      const stA = pts[i0]!;
      const stB = pts[i0 + 1]!;
      const rx = THREE.MathUtils.lerp(stA[2], stB[2], f);
      const ry = THREE.MathUtils.lerp(stA[3], stB[3], f);
      const keel = THREE.MathUtils.lerp(stA[4], stB[4], f);

      curvePos.getPointAt(t, p);
      curvePos.getTangentAt(t, tan).normalize();
      normal.crossVectors(tan, right).normalize();

      for (let r = 0; r <= radialSegs; r++) {
        const theta = (r / radialSegs) * Math.PI * 2;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);
        const keelPinch = sinT < 0 ? Math.pow(-sinT, 2.2) * keel : 0;
        const x = cosT * rx * (1 - (sinT < 0 ? Math.pow(-sinT, 3) * 0.2 : 0));
        const localUp = sinT * ry - keelPinch;

        positions.push(p.x + x, p.y + normal.y * localUp, p.z + normal.z * localUp);
      }
    }

    const stride = radialSegs + 1;
    for (let s = 0; s < steps; s++) {
      for (let r = 0; r < radialSegs; r++) {
        const a = s * stride + r;
        const b = (s + 1) * stride + r;
        const c = (s + 1) * stride + (r + 1);
        const d = s * stride + (r + 1);
        indices.push(a, c, b, a, d, c);
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }

  return {
    bodyGeom: buildCleanLoft(stations, 22),
    beakGeom: buildCleanLoft(beakStations, 14),
  };
}

interface WingFeatherItem {
  id: number;
  tier: "covert" | "secondary" | "primary";
  u: number;
  posX: number;
  posY: number;
  posZ: number;
  /** Positive rotation around +Y sweeps (+X) backward toward -Z (tail)! */
  sweepBackY: number;
  dihedralZ: number;
  length: number;
  chordScale: number;
  dissolveOrder: number;
}

export const CraneModel = forwardRef<CraneWingtipHandle>(function CraneModel(_, ref) {
  const rootRef = useRef<THREE.Group>(null);
  const leftShoulderRef = useRef<THREE.Group>(null);
  const leftWristRef = useRef<THREE.Group>(null);
  const leftTipMarkerRef = useRef<THREE.Object3D>(null);

  const rightShoulderRef = useRef<THREE.Group>(null);
  const rightWristRef = useRef<THREE.Group>(null);
  const rightTipMarkerRef = useRef<THREE.Object3D>(null);

  const crestGroupRef = useRef<THREE.Group>(null);
  const tailStreamerLeftRef = useRef<THREE.Mesh>(null);
  const tailStreamerRightRef = useRef<THREE.Mesh>(null);

  const leftFeatherRefs = useRef<Array<THREE.Mesh | null>>([]);
  const rightFeatherRefs = useRef<Array<THREE.Mesh | null>>([]);

  useImperativeHandle(ref, () => ({
    getWingtipWorldPositions: (leftOut: THREE.Vector3, rightOut: THREE.Vector3) => {
      if (
        !rootRef.current ||
        !rootRef.current.visible ||
        !leftTipMarkerRef.current ||
        !rightTipMarkerRef.current
      ) {
        return false;
      }
      leftTipMarkerRef.current.getWorldPosition(leftOut);
      rightTipMarkerRef.current.getWorldPosition(rightOut);
      return true;
    },
  }));

  const geometries = useMemo(() => {
    const { bodyGeom, beakGeom } = createLoftedCraneTorsoAndNeck();
    const featherGeom = createCamberedFeatherGeometry();

    // Continuous sculpted inner & outer wing airfoil mantles (gap-free sleek silhouette!)
    const innerAirfoilGeom = createWingAirfoilSurface(0.86, 0.20, -0.34, 0.14, -0.28);
    const outerAirfoilGeom = createWingAirfoilSurface(0.82, 0.12, -0.26, -0.06, -0.32);

    const innerSparCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, 0.02, 0.16),
      new THREE.Vector3(0.44, 0.05, 0.21),
      new THREE.Vector3(0.86, 0.03, 0.13),
    ]);
    const innerSparGeom = new THREE.TubeGeometry(innerSparCurve, 16, 0.022, 10, false);

    const outerSparCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, 0.01, 0.12),
      new THREE.Vector3(0.42, 0.02, 0.04),
      new THREE.Vector3(0.84, 0.03, -0.10),
    ]);
    const outerSparGeom = new THREE.TubeGeometry(outerSparCurve, 16, 0.015, 8, false);

    const crestCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0.10, -0.18),
      new THREE.Vector3(0, 0.15, -0.40),
      new THREE.Vector3(0, 0.11, -0.60),
    ]);
    const crestPlumeGeom = new THREE.TubeGeometry(crestCurve, 18, 0.006, 6, false);

    const streamerCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.04, 0.02, -0.42),
      new THREE.Vector3(-0.03, -0.02, -0.88),
      new THREE.Vector3(0.02, 0.03, -1.32),
    ]);
    const streamerGeom = new THREE.TubeGeometry(streamerCurve, 24, 0.007, 6, false);

    const legCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.05, -0.28),
      new THREE.Vector3(0, -0.11, -0.62),
      new THREE.Vector3(0, -0.15, -1.24),
      new THREE.Vector3(0, -0.18, -1.42),
    ]);
    const legGeom = new THREE.TubeGeometry(legCurve, 18, 0.0085, 7, false);

    const eyeGeom = new THREE.SphereGeometry(0.014, 10, 10);
    const crownCapGeom = new THREE.SphereGeometry(0.042, 14, 10);
    crownCapGeom.scale(0.82, 0.4, 1.16);

    return {
      bodyGeom,
      beakGeom,
      featherGeom,
      innerAirfoilGeom,
      outerAirfoilGeom,
      innerSparGeom,
      outerSparGeom,
      crestPlumeGeom,
      streamerGeom,
      legGeom,
      eyeGeom,
      crownCapGeom,
    };
  }, []);

  // 34 overlapping backward-swept sculpted feathers per wing (68 total!)
  const wingFeathers = useMemo<WingFeatherItem[]>(() => {
    const items: WingFeatherItem[] = [];
    let id = 0;

    // Tier 1: 11 Golden-Bronze Upper Wing Coverts (overlapping backward toward -Z)
    for (let i = 0; i < 11; i++) {
      const u = i / 10;
      items.push({
        id: id++,
        tier: "covert",
        u,
        posX: 0.04 + u * 0.76,
        posY: 0.032 + Math.sin(u * Math.PI) * 0.015,
        posZ: 0.14 - u * 0.02,
        sweepBackY: 1.18 - u * 0.24, // POSITIVE -> sweeps smoothly backward toward tail (-Z)!
        dihedralZ: -0.02,
        length: 0.36 + Math.sin(u * Math.PI) * 0.07,
        chordScale: 1.35,
        dissolveOrder: 0.52 + (1 - u) * 0.3,
      });
    }

    // Tier 2: 12 Lush Pearl-Ivory Secondary Flight Feathers
    for (let i = 0; i < 12; i++) {
      const u = i / 11;
      items.push({
        id: id++,
        tier: "secondary",
        u,
        posX: 0.03 + u * 0.8,
        posY: 0.016 + Math.sin(u * Math.PI) * 0.012,
        posZ: 0.06 - u * 0.02,
        sweepBackY: 1.24 - u * 0.28, // Sweeps cleanly backward!
        dihedralZ: -0.01,
        length: 0.58 + u * 0.12,
        chordScale: 1.5,
        dissolveOrder: 0.3 + (1 - u) * 0.34,
      });
    }

    // Tier 3: 11 Long Slotted Bronze-Gold Primary Flight Remiges at Wingtips
    for (let i = 0; i < 11; i++) {
      const u = i / 10;
      items.push({
        id: id++,
        tier: "primary",
        u,
        posX: u * 0.78,
        posY: 0.012 + u * 0.02,
        posZ: 0.04 - u * 0.12,
        // Fan gracefully from backward inner primary (+0.96 rad) out to slotted wingtip (+0.18 rad)
        sweepBackY: 0.96 - u * 0.78,
        dihedralZ: 0.015 + u * 0.085,
        length: 0.72 + Math.sin(u * Math.PI * 0.78) * 0.38,
        chordScale: 1.32 - u * 0.34,
        dissolveOrder: (1 - u) * 0.32,
      });
    }

    return items;
  }, []);

  const materials = useMemo(() => {
    const pearlIvoryBody = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#f3ede2"),
      emissive: new THREE.Color("#d29a5c"),
      emissiveIntensity: 0.14,
      metalness: 0.32,
      roughness: 0.26,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
    });

    const burnishedBronze = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#e0a969"),
      emissive: new THREE.Color("#8f561b"),
      emissiveIntensity: 0.28,
      metalness: 0.84,
      roughness: 0.23,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
    });

    const imperialCrown = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#b84a32"),
      emissive: new THREE.Color("#7a2818"),
      emissiveIntensity: 0.28,
      metalness: 0.48,
      roughness: 0.28,
      transparent: true,
      opacity: 1,
    });

    const obsidianEye = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#141210"),
      emissive: new THREE.Color("#d29a5c"),
      emissiveIntensity: 0.22,
      metalness: 0.88,
      roughness: 0.1,
      transparent: true,
      opacity: 1,
    });

    // Shared 3-material GPU pool instead of 34 separate MeshPhysicalMaterial clearcoat shaders!
    const covertMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#d9a05e"),
      emissive: new THREE.Color("#c28542"),
      emissiveIntensity: 0.24,
      metalness: 0.78,
      roughness: 0.24,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
    });

    const secondaryMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#f0e9dd"),
      emissive: new THREE.Color("#c28542"),
      emissiveIntensity: 0.13,
      metalness: 0.36,
      roughness: 0.25,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
    });

    const primaryGoldMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#e8bd86"),
      emissive: new THREE.Color("#c28542"),
      emissiveIntensity: 0.24,
      metalness: 0.78,
      roughness: 0.24,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
    });

    const sharedPool = [covertMat, secondaryMat, primaryGoldMat];
    const featherMaterials = wingFeathers.map((f) => {
      if (f.tier === "covert") return covertMat;
      if (f.tier === "primary" && f.u > 0.45) return primaryGoldMat;
      return secondaryMat;
    });

    return {
      pearlIvoryBody,
      burnishedBronze,
      imperialCrown,
      obsidianEye,
      sharedPool,
      featherMaterials,
    };
  }, [wingFeathers]);

  useEffect(() => {
    return () => {
      Object.values(geometries).forEach((g) => g.dispose());
      materials.pearlIvoryBody.dispose();
      materials.burnishedBronze.dispose();
      materials.imperialCrown.dispose();
      materials.obsidianEye.dispose();
      materials.sharedPool.forEach((m) => m.dispose());
    };
  }, [geometries, materials]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const enter = introMotionState.craneEnterAlpha;
    const merge = introMotionState.craneMergeProgress;

    if (!rootRef.current) return;
    const visible = enter > 0.005 && merge < 0.995;
    rootRef.current.visible = visible;
    if (!visible) return;

    const flapFreq = 4.8 * (1 - merge * 0.78);
    const phase = t * flapFreq;
    const downstroke = Math.sin(phase);
    const wristWave = Math.sin(phase - 0.78);

    // As merge -> 1, morph smoothly from symmetric 3D flight into the swept-back Ngọc Lũ relief profile!
    const profileMorph = THREE.MathUtils.smoothstep(merge, 0.05, 0.85);
    const shoulderAngle = (downstroke * 0.52 + 0.06) * (1 - merge) + merge * 0.1;
    const wristAngle = wristWave * 0.44 * (1 - merge) + merge * 0.04;

    if (leftShoulderRef.current) {
      // Radially inward wing tucks gracefully into the lower relief silhouette
      leftShoulderRef.current.rotation.z = shoulderAngle * (1 - profileMorph * 0.5);
      leftShoulderRef.current.rotation.y = -profileMorph * 0.72;
      const inScale = 1 - profileMorph * 0.58;
      leftShoulderRef.current.scale.set(inScale, 1, 1 - profileMorph * 0.25);
    }
    if (leftWristRef.current) {
      leftWristRef.current.rotation.z = wristAngle;
    }
    if (rightShoulderRef.current) {
      // Radially outward wing sweeps back into the grand upswept Đông Sơn primary wing
      rightShoulderRef.current.rotation.z = shoulderAngle;
      rightShoulderRef.current.rotation.y = -profileMorph * 0.36;
      const outScale = 1 - profileMorph * 0.22;
      rightShoulderRef.current.scale.set(outScale, 1, 1);
    }
    if (rightWristRef.current) {
      rightWristRef.current.rotation.z = wristAngle;
    }

    if (crestGroupRef.current) {
      crestGroupRef.current.rotation.x = Math.sin(phase - 0.5) * 0.055 * (1 - merge);
    }
    if (tailStreamerLeftRef.current && tailStreamerRightRef.current) {
      tailStreamerLeftRef.current.rotation.y = Math.sin(t * 6.0) * 0.075 * (1 - merge);
      tailStreamerRightRef.current.rotation.y = -Math.sin(t * 6.0 + 0.8) * 0.075 * (1 - merge);
    }

    // Transmute pearl-ivory into incandescent molten cast-gold & cross-fade seamlessly (`0.36 -> 0.88`)
    // right as Lead Bird #0 crystallizes underneath on the rotating Đông Sơn drum!
    const meltT = THREE.MathUtils.clamp((merge - 0.36) / 0.52, 0, 1);
    const quinticMelt = meltT * meltT * meltT * (meltT * (meltT * 6 - 15) + 10);
    const stampHandoffFade = 1 - quinticMelt;
    const coreAlpha = enter * stampHandoffFade;
    const moltenGlow = Math.pow(merge, 1.2) * 2.8;

    materials.pearlIvoryBody.opacity = coreAlpha;
    materials.pearlIvoryBody.color.lerpColors(
      _ivoryBaseColor,
      _moltenGoldColor,
      THREE.MathUtils.smoothstep(merge, 0.05, 0.72)
    );
    materials.pearlIvoryBody.metalness = 0.3 + merge * 0.58;
    materials.pearlIvoryBody.emissiveIntensity = 0.13 + moltenGlow;

    materials.burnishedBronze.opacity = coreAlpha;
    materials.burnishedBronze.emissiveIntensity = 0.26 + moltenGlow * 1.15;
    materials.imperialCrown.opacity = coreAlpha;
    materials.obsidianEye.opacity = coreAlpha;

    const [covertMat, secondaryMat, primaryGoldMat] = materials.sharedPool;
    if (covertMat && secondaryMat && primaryGoldMat) {
      covertMat.opacity = coreAlpha;
      covertMat.metalness = Math.min(1, 0.78 + merge * 0.2);
      covertMat.emissiveIntensity = 0.24 + moltenGlow;

      secondaryMat.opacity = coreAlpha;
      secondaryMat.metalness = 0.36 + merge * 0.52;
      secondaryMat.emissiveIntensity = 0.13 + moltenGlow;

      primaryGoldMat.opacity = coreAlpha;
      primaryGoldMat.metalness = Math.min(1, 0.78 + merge * 0.2);
      primaryGoldMat.emissiveIntensity = 0.24 + moltenGlow;
    }

    wingFeathers.forEach((f, idx) => {
      const flexLoad =
        f.tier === "primary"
          ? -downstroke * 0.13 * f.u * (1 - merge)
          : -downstroke * 0.04 * f.u * (1 - merge);

      for (const mesh of [leftFeatherRefs.current[idx], rightFeatherRefs.current[idx]]) {
        if (!mesh) continue;
        mesh.rotation.z = f.dihedralZ + flexLoad;
        mesh.position.x = f.posX;
        mesh.position.y = f.posY;
      }
    });
  });

  const renderWingContents = (
    shoulderRef: React.RefObject<THREE.Group | null>,
    wristRef: React.RefObject<THREE.Group | null>,
    tipRef: React.RefObject<THREE.Object3D | null>,
    featherSlotRefs: React.MutableRefObject<Array<THREE.Mesh | null>>,
    keyPrefix: string
  ) => (
    <group ref={shoulderRef} position={[0.09, 0.055, 0.06]}>
      <mesh geometry={geometries.innerAirfoilGeom} material={materials.pearlIvoryBody} />
      <mesh geometry={geometries.innerSparGeom} material={materials.burnishedBronze} />

      {wingFeathers
        .filter((f) => f.tier !== "primary")
        .map((f) => (
          <mesh
            key={`${keyPrefix}-in-${f.id}`}
            ref={(el) => {
              featherSlotRefs.current[f.id] = el;
            }}
            geometry={geometries.featherGeom}
            material={materials.featherMaterials[f.id]}
            position={[f.posX, f.posY, f.posZ]}
            rotation={[0.02, f.sweepBackY, f.dihedralZ]}
            scale={[f.length, 1, f.chordScale]}
          />
        ))}

      <group ref={wristRef} position={[0.84, 0.025, 0.11]}>
        <mesh geometry={geometries.outerAirfoilGeom} material={materials.pearlIvoryBody} />
        <mesh geometry={geometries.outerSparGeom} material={materials.burnishedBronze} />
        {wingFeathers
          .filter((f) => f.tier === "primary")
          .map((f) => (
            <mesh
              key={`${keyPrefix}-pri-${f.id}`}
              ref={(el) => {
                featherSlotRefs.current[f.id] = el;
              }}
              geometry={geometries.featherGeom}
              material={materials.featherMaterials[f.id]}
              position={[f.posX, f.posY, f.posZ]}
              rotation={[0.03, f.sweepBackY, f.dihedralZ]}
              scale={[f.length, 1, f.chordScale]}
            />
          ))}
        <object3D ref={tipRef} position={[1.48, 0.06, -0.26]} />
      </group>
    </group>
  );

  return (
    <group ref={rootRef} scale={0.86}>
      {/* 1. Sculpted Lofted Pearl-Ivory Torso, Keeled Breast & Graceful S-Neck */}
      <mesh geometry={geometries.bodyGeom} material={materials.pearlIvoryBody} />

      {/* 2. Elongated Burnished-Bronze Lạc Beak, Imperial Crown Cap & Gleaming Eyes */}
      <mesh geometry={geometries.beakGeom} material={materials.burnishedBronze} />
      <mesh
        geometry={geometries.crownCapGeom}
        material={materials.imperialCrown}
        position={[0, 0.546, 0.855]}
        rotation={[-0.14, 0, 0]}
      />
      <mesh
        geometry={geometries.eyeGeom}
        material={materials.obsidianEye}
        position={[0.044, 0.502, 0.865]}
      />
      <mesh
        geometry={geometries.eyeGeom}
        material={materials.obsidianEye}
        position={[-0.044, 0.502, 0.865]}
      />

      {/* 3. Five-Plume Flowing Đông Sơn Royal Crest */}
      <group ref={crestGroupRef} position={[0, 0.525, 0.79]}>
        {[-2, -1, 0, 1, 2].map((cIdx) => (
          <mesh
            key={`crest-${cIdx}`}
            geometry={geometries.crestPlumeGeom}
            material={materials.burnishedBronze}
            position={[cIdx * 0.011, 0, 0]}
            rotation={[Math.abs(cIdx) * -0.06, cIdx * 0.075, 0]}
            scale={[1, 1, 1 - Math.abs(cIdx) * 0.13]}
          />
        ))}
      </group>

      {/* 4. Seven-Plume Ceremonial Tail Fan + Dual Flowing Đông Sơn Tail Streamers */}
      <group position={[0, 0.042, -0.6]}>
        {[-3, -2, -1, 0, 1, 2, 3].map((tIdx) => (
          <mesh
            key={`tail-fan-${tIdx}`}
            geometry={geometries.featherGeom}
            material={Math.abs(tIdx) % 2 === 1 ? materials.burnishedBronze : materials.pearlIvoryBody}
            position={[tIdx * 0.018, 0, 0]}
            rotation={[0.05, Math.PI / 2 + tIdx * 0.11, 0.03]}
            scale={[0.66 - Math.abs(tIdx) * 0.045, 1, 1.3]}
          />
        ))}
        <mesh
          ref={tailStreamerLeftRef}
          geometry={geometries.streamerGeom}
          material={materials.burnishedBronze}
          position={[0.045, 0.01, -0.08]}
        />
        <mesh
          ref={tailStreamerRightRef}
          geometry={geometries.streamerGeom}
          material={materials.burnishedBronze}
          position={[-0.045, 0.01, -0.08]}
          scale={[-1, 1, 1]}
        />
      </group>

      {/* 5. Sculpted Trailing Crane Legs */}
      <mesh
        geometry={geometries.legGeom}
        material={materials.burnishedBronze}
        position={[0.052, 0, 0]}
      />
      <mesh
        geometry={geometries.legGeom}
        material={materials.burnishedBronze}
        position={[-0.052, 0, 0]}
      />

      {/* 6. Left (+X) and Perfectly Mirrored Right (-X) 3-Layer Sculpted Wings */}
      {renderWingContents(leftShoulderRef, leftWristRef, leftTipMarkerRef, leftFeatherRefs, "l")}
      <group scale={[-1, 1, 1]}>
        {renderWingContents(rightShoulderRef, rightWristRef, rightTipMarkerRef, rightFeatherRefs, "r")}
      </group>
    </group>
  );
});
