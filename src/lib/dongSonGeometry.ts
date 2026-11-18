import * as THREE from "three";

/**
 * High-precision procedural Đông Sơn Bronze Drum (Ngọc Lũ lineage) 3D geometry builders.
 * Engineered for museum-grade detail both at full-screen Scene 03 scale and as the
 * rotating cast-bronze halo collar framing the Hero portrait (`r = 1.00 .. 1.68`).
 */

export function polarXY(radius: number, angleRad: number): [number, number] {
  return [Math.cos(angleRad) * radius, Math.sin(angleRad) * radius];
}

/**
 * True 3D pyramidal-faceted 14-ray Đông Sơn Star Sun with a raised hemispherical
 * central bronze boss (`núm trống`) and sharp central ridge bevels along each ray
 * so directional light catches gleaming golden facets on one side and deep bronze on the other.
 */
export function createDongSonSunGeometry(
  rays = 14,
  outerRadius = 0.45,
  innerRadius = 0.155,
  ridgeHeight = 0.044
): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];

  function pushTri(a: [number, number, number], b: [number, number, number], c: [number, number, number]) {
    const ux = b[0] - a[0];
    const uy = b[1] - a[1];
    const uz = b[2] - a[2];
    const vx = c[0] - a[0];
    const vy = c[1] - a[1];
    const vz = c[2] - a[2];
    let nx = uy * vz - uz * vy;
    let ny = uz * vx - ux * vz;
    let nz = ux * vy - uy * vx;
    const len = Math.hypot(nx, ny, nz) || 1;
    nx /= len;
    ny /= len;
    nz /= len;

    positions.push(...a, ...b, ...c);
    normals.push(nx, ny, nz, nx, ny, nz, nx, ny, nz);
  }

  const apex: [number, number, number] = [0, 0, ridgeHeight * 1.25];
  const step = (Math.PI * 2) / rays;

  for (let i = 0; i < rays; i++) {
    const rayAngle = i * step + Math.PI / 2;
    const leftValleyAngle = rayAngle + step * 0.5;
    const rightValleyAngle = rayAngle - step * 0.5;

    const tip: [number, number, number] = [
      Math.cos(rayAngle) * outerRadius,
      Math.sin(rayAngle) * outerRadius,
      0.004,
    ];
    const midSpine: [number, number, number] = [
      Math.cos(rayAngle) * (outerRadius * 0.48),
      Math.sin(rayAngle) * (outerRadius * 0.48),
      ridgeHeight * 0.88,
    ];
    const leftValley: [number, number, number] = [
      Math.cos(leftValleyAngle) * innerRadius,
      Math.sin(leftValleyAngle) * innerRadius,
      0.008,
    ];
    const rightValley: [number, number, number] = [
      Math.cos(rightValleyAngle) * innerRadius,
      Math.sin(rightValleyAngle) * innerRadius,
      0.008,
    ];

    // Inner boss-to-valley facets
    pushTri(apex, rightValley, midSpine);
    pushTri(apex, midSpine, leftValley);
    // Outer sharp ray bevel facets
    pushTri(midSpine, rightValley, tip);
    pushTri(midSpine, tip, leftValley);
  }

  // Central raised circular bronze boss (`núm gõ tâm trống`)
  const bossSegs = 28;
  const bossR = innerRadius * 0.72;
  const bossRings = 4;
  for (let rIdx = 0; rIdx < bossRings; rIdx++) {
    const u0 = rIdx / bossRings;
    const u1 = (rIdx + 1) / bossRings;
    const rad0 = u0 * bossR;
    const rad1 = u1 * bossR;
    const z0 = ridgeHeight * 1.38 * Math.cos(u0 * Math.PI * 0.46);
    const z1 = ridgeHeight * 1.38 * Math.cos(u1 * Math.PI * 0.46);

    for (let s = 0; s < bossSegs; s++) {
      const a0 = (s / bossSegs) * Math.PI * 2;
      const a1 = ((s + 1) / bossSegs) * Math.PI * 2;
      const p00: [number, number, number] = [Math.cos(a0) * rad0, Math.sin(a0) * rad0, z0];
      const p10: [number, number, number] = [Math.cos(a1) * rad0, Math.sin(a1) * rad0, z0];
      const p11: [number, number, number] = [Math.cos(a1) * rad1, Math.sin(a1) * rad1, z1];
      const p01: [number, number, number] = [Math.cos(a0) * rad1, Math.sin(a0) * rad1, z1];
      if (rIdx > 0) pushTri(p00, p10, p11);
      pushTri(p00, p11, p01);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  return geom;
}

/**
 * Authentic Ngọc Lũ Peacock-Feather Eye Motifs (`họa tiết lông công giữa các tia mặt trời`):
 * Nested triple chevrons + central diamond ocellus + dense barbule cross-hatching
 * filling each of the 14 valleys between the sun rays.
 */
export function createFeatherWedgesLineGeometry(
  rays = 14,
  innerR = 0.175,
  outerR = 0.435,
  hatches = 6
): THREE.BufferGeometry {
  const pts: number[] = [];
  const halfSpread = (Math.PI / rays) * 0.68;

  for (let i = 0; i < rays; i++) {
    const mid = ((i + 0.5) * Math.PI * 2) / rays + Math.PI / 2;

    // 3 nested V-chevrons per valley
    for (let layer = 0; layer < 3; layer++) {
      const rIn = innerR + layer * 0.036;
      const rOut = outerR - layer * 0.016;
      const spread = halfSpread * (1 - layer * 0.19);

      const [ax, ay] = polarXY(rIn, mid);
      const [lx, ly] = polarXY(rOut, mid - spread);
      const [rx, ry] = polarXY(rOut, mid + spread);

      pts.push(lx, ly, 0, ax, ay, 0);
      pts.push(ax, ay, 0, rx, ry, 0);

      if (layer === 0) {
        // Closing arc across open mouth of outer feather wedge
        pts.push(lx, ly, 0, rx, ry, 0);
      }
    }

    // Central peacock-eye diamond (`mắt lông công`) + axial quill
    const eyeMidR = (innerR + outerR) * 0.58;
    const [qx0, qy0] = polarXY(innerR + 0.02, mid);
    const [qx1, qy1] = polarXY(outerR - 0.015, mid);
    pts.push(qx0, qy0, 0, qx1, qy1, 0);

    const [etx, ety] = polarXY(eyeMidR + 0.045, mid);
    const [ebx, eby] = polarXY(eyeMidR - 0.045, mid);
    const [elx, ely] = polarXY(eyeMidR, mid - halfSpread * 0.28);
    const [erx, ery] = polarXY(eyeMidR, mid + halfSpread * 0.28);
    pts.push(etx, ety, 0, elx, ely, 0, elx, ely, 0, ebx, eby, 0);
    pts.push(ebx, eby, 0, erx, ery, 0, erx, ery, 0, etx, ety, 0);

    // Fine feather barbules radiating from central quill
    const [baseApexX, baseApexY] = polarXY(innerR, mid);
    const [outerLx, outerLy] = polarXY(outerR, mid - halfSpread);
    const [outerRx, outerRy] = polarXY(outerR, mid + halfSpread);

    for (let h = 1; h <= hatches; h++) {
      const f = h / (hatches + 1);
      const qx = baseApexX + (qx1 - baseApexX) * f * 0.92;
      const qy = baseApexY + (qy1 - baseApexY) * f * 0.92;
      const lx = baseApexX + (outerLx - baseApexX) * f;
      const ly = baseApexY + (outerLy - baseApexY) * f;
      const rx = baseApexX + (outerRx - baseApexX) * f;
      const ry = baseApexY + (outerRy - baseApexY) * f;
      pts.push(qx, qy, 0, lx, ly, 0);
      pts.push(qx, qy, 0, rx, ry, 0);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return geom;
}

/**
 * Interlocking Đông Sơn Diamond-Lozenge & Stepped Meander Band (`hồi văn trám lồng`).
 */
export function createLozengeMeanderGeometry(
  count: number,
  innerR: number,
  outerR: number
): THREE.BufferGeometry {
  const pts: number[] = [];
  const midR = (innerR + outerR) * 0.5;
  const step = (Math.PI * 2) / count;

  for (let i = 0; i < count; i++) {
    const a0 = i * step;
    const aMid = (i + 0.5) * step;
    const a1 = (i + 1) * step;

    // Outer lozenge
    const [pLeftX, pLeftY] = polarXY(midR, a0);
    const [pTopX, pTopY] = polarXY(outerR, aMid);
    const [pRightX, pRightY] = polarXY(midR, a1);
    const [pBotX, pBotY] = polarXY(innerR, aMid);

    pts.push(pLeftX, pLeftY, 0, pTopX, pTopY, 0);
    pts.push(pTopX, pTopY, 0, pRightX, pRightY, 0);
    pts.push(pRightX, pRightY, 0, pBotX, pBotY, 0);
    pts.push(pBotX, pBotY, 0, pLeftX, pLeftY, 0);

    // Nested inner lozenge
    const rTop2 = midR + (outerR - midR) * 0.52;
    const rBot2 = midR - (midR - innerR) * 0.52;
    const [iLeftX, iLeftY] = polarXY(midR, a0 + step * 0.24);
    const [iTopX, iTopY] = polarXY(rTop2, aMid);
    const [iRightX, iRightY] = polarXY(midR, a1 - step * 0.24);
    const [iBotX, iBotY] = polarXY(rBot2, aMid);

    pts.push(iLeftX, iLeftY, 0, iTopX, iTopY, 0);
    pts.push(iTopX, iTopY, 0, iRightX, iRightY, 0);
    pts.push(iRightX, iRightY, 0, iBotX, iBotY, 0);
    pts.push(iBotX, iBotY, 0, iLeftX, iLeftY, 0);
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return geom;
}

/**
 * Tangent-linked triple-concentric dotted circle chain (`vòng tròn đồng tâm tiếp tuyến`).
 */
export function createTangentChainLineGeometry(
  count: number,
  bandRadius: number,
  circleRadius: number,
  circleSegments = 24
): THREE.BufferGeometry {
  const pts: number[] = [];
  const centers: Array<[number, number]> = [];

  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const [cx, cy] = polarXY(bandRadius, a);
    centers.push([cx, cy]);

    // Triple concentric rings per medallion link
    for (const rScale of [1, 0.64, 0.3]) {
      const cr = circleRadius * rScale;
      for (let s = 0; s < circleSegments; s++) {
        const a0 = (s / circleSegments) * Math.PI * 2;
        const a1 = ((s + 1) / circleSegments) * Math.PI * 2;
        pts.push(
          cx + Math.cos(a0) * cr,
          cy + Math.sin(a0) * cr,
          0,
          cx + Math.cos(a1) * cr,
          cy + Math.sin(a1) * cr,
          0
        );
      }
    }
  }

  // Parallel double internal tangents linking adjacent circles
  for (let i = 0; i < count; i++) {
    const a = centers[i]!;
    const b = centers[(i + 1) % count]!;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const dist = Math.hypot(dx, dy);
    if (dist <= 2.02 * circleRadius) continue;

    const ux = dx / dist;
    const uy = dy / dist;
    const vx = -uy;
    const vy = ux;

    for (const rLink of [circleRadius, circleRadius * 0.78]) {
      const cos = (2 * rLink) / dist;
      if (cos >= 1) continue;
      const sin = Math.sqrt(Math.max(0, 1 - cos * cos));
      const ox = rLink * (cos * ux + sin * vx);
      const oy = rLink * (cos * uy + sin * vy);
      pts.push(a[0] + ox, a[1] + oy, 0, b[0] - ox, b[1] - oy, 0);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return geom;
}

/**
 * Opposing double sawtooth band (`văn răng cưa đối xứng tạo dải trám âm bản`) —
 * one of the signature geometric borders of Trống Đồng Ngọc Lũ.
 */
export function createSawtoothRingGeometry(
  teethCount: number,
  innerR: number,
  outerR: number
): THREE.BufferGeometry {
  const pts: number[] = [];
  const midInner = innerR + (outerR - innerR) * 0.44;
  const midOuter = outerR - (outerR - innerR) * 0.44;
  const total = teethCount * 2;

  for (let i = 0; i < total; i++) {
    const a0 = (i / total) * Math.PI * 2;
    const a1 = ((i + 1) / total) * Math.PI * 2;

    // Outer-anchored teeth pointing inward
    const rA0 = i % 2 === 0 ? outerR : midOuter;
    const rA1 = (i + 1) % 2 === 0 ? outerR : midOuter;
    pts.push(
      Math.cos(a0) * rA0,
      Math.sin(a0) * rA0,
      0,
      Math.cos(a1) * rA1,
      Math.sin(a1) * rA1,
      0
    );

    // Inner-anchored teeth pointing outward (phase-shifted to interlock)
    const rB0 = i % 2 === 0 ? midInner : innerR;
    const rB1 = (i + 1) % 2 === 0 ? midInner : innerR;
    pts.push(
      Math.cos(a0) * rB0,
      Math.sin(a0) * rB0,
      0,
      Math.cos(a1) * rB1,
      Math.sin(a1) * rB1,
      0
    );
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return geom;
}

/**
 * Authentic Ngọc Lũ Chim Lạc / Chim Hạc 3D cast-bronze relief silhouette!
 * Oriented flying towards -X (counter-clockwise at the top of the drum):
 * - Extra-long, needle-slender Lạc crane beak
 * - Rounded head + long sweeping royal crest curving gracefully backward
 * - Arched slender neck & streamlined breast
 * - Sweeping upswept primary wing + forward lower secondary wing
 * - Long trailing crane legs + 3-streamer ceremonial tail
 */
export function createLacBirdReliefGeometry(scale = 0.0038): THREE.ExtrudeGeometry {
  const s = scale;
  const shape = new THREE.Shape();

  // Start at tip of elongated needle beak (-X)
  shape.moveTo(-42 * s, -1.6 * s);
  // Upper beak ridge to forehead
  shape.quadraticCurveTo(-27 * s, 0.2 * s, -17.5 * s, 3.2 * s);
  // Crown of head
  shape.quadraticCurveTo(-14.5 * s, 6.2 * s, -11.5 * s, 5.4 * s);
  // Sweeping royal crest plume (`mào chim Lạc uốn cong ra sau`)
  shape.bezierCurveTo(-6 * s, 11.5 * s, 3 * s, 15.2 * s, 11.5 * s, 13.8 * s);
  shape.quadraticCurveTo(4 * s, 11.2 * s, -8.5 * s, 4.0 * s);
  // Graceful neck arch to shoulder
  shape.quadraticCurveTo(-6.2 * s, 1.4 * s, -2.5 * s, 2.2 * s);
  // Grand upswept primary wing leading curve (`cánh trên vươn cao`)
  shape.bezierCurveTo(2 * s, 12 * s, 11 * s, 23 * s, 23.5 * s, 26.5 * s);
  // Scalloped feathered trailing edge of upper wing
  shape.quadraticCurveTo(18.5 * s, 17.5 * s, 16.5 * s, 11.5 * s);
  shape.quadraticCurveTo(13.5 * s, 7.2 * s, 11.2 * s, 2.6 * s);
  // Upper ceremonial tail plume (`dải đuôi xòe 3 tầng`)
  shape.lineTo(34 * s, 9.2 * s);
  shape.lineTo(25.5 * s, 2.2 * s);
  // Middle tail streamer
  shape.lineTo(37.5 * s, 1.4 * s);
  shape.lineTo(25 * s, -0.8 * s);
  // Lower tail plume
  shape.lineTo(33 * s, -4.8 * s);
  shape.lineTo(15.5 * s, -2.2 * s);
  // Long trailing crane legs extending far aft (`chân hạc duỗi thẳng`)
  shape.lineTo(40 * s, -10.5 * s);
  shape.lineTo(39 * s, -12.0 * s);
  shape.lineTo(11 * s, -3.4 * s);
  // Lower forward-swept wing (`cánh dưới xòe rộng`)
  shape.bezierCurveTo(9 * s, -10 * s, 14 * s, -17.5 * s, 20.5 * s, -21.5 * s);
  shape.quadraticCurveTo(8.5 * s, -16.5 * s, 0.5 * s, -4.8 * s);
  // Keel / breast & throat back to lower mandible of needle beak
  shape.quadraticCurveTo(-7 * s, -5.2 * s, -13 * s, -1.2 * s);
  shape.quadraticCurveTo(-16.5 * s, 0.8 * s, -24 * s, -0.4 * s);
  shape.lineTo(-42 * s, -1.6 * s);
  shape.closePath();

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: 0.015,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.0022,
    bevelThickness: 0.003,
  });
  return geom;
}

/**
 * Fine golden chiseled engraving linework overlaid directly across the 16-bird
 * Chim Lạc frieze (`vạch lông cánh, mắt chim, mào kép, và hoa văn hoa thị ngăn cách`)!
 */
export function createLacBirdFriezeEngravingGeometry(
  birdCount: number,
  bandRadius: number,
  scale = 0.0038
): THREE.BufferGeometry {
  const pts: number[] = [];
  const s = scale;

  // Local engraved strokes on one Chim Lạc (matching `createLacBirdReliefGeometry` coordinates)
  const localBirdSegments: Array<[number, number, number, number]> = [
    // Eye ring cross & inner crest filament
    [-14.8, 3.2, -13.2, 3.2],
    [-14.0, 2.4, -14.0, 4.0],
    [-9.5, 6.2, 8.5, 12.6],
    // 8 parallel primary feather comb lines along upper wing!
    [1.5, 4.2, 10.5, 14.5],
    [3.5, 4.0, 13.5, 17.2],
    [5.5, 3.8, 16.5, 19.8],
    [7.5, 3.5, 19.2, 22.0],
    [9.2, 3.2, 21.0, 23.6],
    [10.8, 4.8, 18.0, 15.0],
    [12.2, 6.2, 17.2, 12.6],
    // 5 secondary feather comb lines along lower wing!
    [2.2, -4.5, 9.5, -12.8],
    [4.4, -4.4, 12.5, -15.4],
    [6.6, -4.2, 15.4, -17.8],
    [8.8, -4.0, 17.8, -19.5],
    // Tail quill lines & second parallel leg line
    [14.0, 0.8, 31.5, 6.8],
    [14.5, 0.2, 34.0, 1.0],
    [14.0, -0.6, 30.0, -3.8],
    [12.5, -2.6, 38.0, -9.2],
  ];

  for (let i = 0; i < birdCount; i++) {
    const a = Math.PI * 0.5 + (i / birdCount) * Math.PI * 2;
    const rot = a - Math.PI / 2;
    const cosR = Math.cos(rot);
    const sinR = Math.sin(rot);
    const cx = Math.cos(a) * bandRadius;
    const cy = Math.sin(a) * bandRadius;

    for (const [x0, y0, x1, y1] of localBirdSegments) {
      const lx0 = x0 * s;
      const ly0 = y0 * s;
      const lx1 = x1 * s;
      const ly1 = y1 * s;
      pts.push(
        cx + lx0 * cosR - ly0 * sinR,
        cy + lx0 * sinR + ly0 * cosR,
        0.02,
        cx + lx1 * cosR - ly1 * sinR,
        cy + lx1 * sinR + ly1 * cosR,
        0.02
      );
    }

    // Alternating Đông Sơn 8-petal diamond rosette (`hoa thị đồng`) midway between birds
    const midA = Math.PI * 0.5 + ((i + 0.5) / birdCount) * Math.PI * 2;
    const rCx = Math.cos(midA) * bandRadius;
    const rCy = Math.sin(midA) * bandRadius;
    const rOuter = 0.032;
    const rInner = 0.012;
    for (let p = 0; p < 16; p++) {
      const pa0 = (p / 16) * Math.PI * 2;
      const pa1 = ((p + 1) / 16) * Math.PI * 2;
      const pr0 = p % 2 === 0 ? rOuter : rInner;
      const pr1 = (p + 1) % 2 === 0 ? rOuter : rInner;
      pts.push(
        rCx + Math.cos(pa0) * pr0,
        rCy + Math.sin(pa0) * pr0,
        0.014,
        rCx + Math.cos(pa1) * pr1,
        rCy + Math.sin(pa1) * pr1,
        0.014
      );
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return geom;
}

/**
 * Ceremonial stepped cast-bronze rim boss (`tượng đồng / đinh đồng bốn góc mặt trống`).
 */
export function createCardinalDrumBossGeometry(): THREE.BufferGeometry {
  const pts = [
    new THREE.Vector2(0.042, 0.0),
    new THREE.Vector2(0.038, 0.012),
    new THREE.Vector2(0.026, 0.014),
    new THREE.Vector2(0.024, 0.026),
    new THREE.Vector2(0.012, 0.032),
    new THREE.Vector2(0.001, 0.036),
  ];
  const lathe = new THREE.LatheGeometry(pts, 16);
  lathe.rotateX(Math.PI / 2);
  return lathe;
}

/**
 * True 3D Ngọc Lũ Bronze Drum Resonator Body (`Tang Trống Phình · Lưng Trống · Chân Trống Loe`):
 * Recedes in `-Z` (`z = -0.024 .. -0.58`) with stepped horizontal decorative ridges while staying
 * completely hollow inside (`r >= 1.46`) so it never occludes the central `r = 1.0` portrait!
 */
export function createDongSonDrumMantelGeometry(): THREE.BufferGeometry {
  // LatheGeometry revolves around +Y; after rotateX(-PI/2), +Y maps to -Z (receding behind tympanum)!
  const profile: THREE.Vector2[] = [
    new THREE.Vector2(1.685, 0.022), // Underside of overhanging tympanum lip
    new THREE.Vector2(1.698, 0.045),
    new THREE.Vector2(1.738, 0.115), // Bulging upper resonator (`tang trống phình`)
    new THREE.Vector2(1.752, 0.165), // Raised ornamental ridge #1
    new THREE.Vector2(1.736, 0.182),
    new THREE.Vector2(1.705, 0.245), // Lower curve of `tang trống`
    new THREE.Vector2(1.615, 0.305), // Waist transition ridge
    new THREE.Vector2(1.632, 0.322), // Raised ornamental ridge #2
    new THREE.Vector2(1.545, 0.355), // Cylindrical waist (`lưng trống`)
    new THREE.Vector2(1.528, 0.455),
    new THREE.Vector2(1.552, 0.472), // Raised waist-to-foot moulding
    new THREE.Vector2(1.618, 0.565), // Flared ceremonial foot (`chân trống loe`)
    new THREE.Vector2(1.585, 0.580), // Inner lip of foot (stays well outside r=1.0!)
  ];

  const lathe = new THREE.LatheGeometry(profile, 96);
  lathe.rotateX(-Math.PI / 2);
  lathe.computeVertexNormals();
  return lathe;
}

/**
 * Four Paired Arching Cast-Bronze Carrying Handles (`Quai Trống Đồng Đôi`) mounted between
 * `tang trống` and `lưng trống` at 0°, 90°, 180°, 270° so 3D camera tilts reveal authentic
 * museum-grade Ngọc Lũ bronze silhouette details.
 */
export function createDongSonDrumHandlesGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  let vertexOffset = 0;

  const baseCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(1.71, 0, -0.15),
    new THREE.Vector3(1.83, 0, -0.22),
    new THREE.Vector3(1.81, 0, -0.33),
    new THREE.Vector3(1.56, 0, -0.39),
  ]);
  const baseTube = new THREE.TubeGeometry(baseCurve, 18, 0.016, 8, false);

  const m = new THREE.Matrix4();
  const nMat = new THREE.Matrix3();
  const v = new THREE.Vector3();

  // 4 cardinal pairs (8 handles total, just like Trống Đồng Ngọc Lũ!)
  for (let q = 0; q < 4; q++) {
    for (const pairOffset of [-0.048, 0.048]) {
      const angle = (q * Math.PI) / 2 + pairOffset;
      m.makeRotationZ(angle);
      nMat.getNormalMatrix(m);

      const posAttr = baseTube.attributes.position as THREE.BufferAttribute;
      const normAttr = baseTube.attributes.normal as THREE.BufferAttribute;
      const idxAttr = baseTube.index;

      for (let i = 0; i < posAttr.count; i++) {
        v.fromBufferAttribute(posAttr, i).applyMatrix4(m);
        positions.push(v.x, v.y, v.z);
        v.fromBufferAttribute(normAttr, i).applyMatrix3(nMat).normalize();
        normals.push(v.x, v.y, v.z);
      }

      if (idxAttr) {
        for (let i = 0; i < idxAttr.count; i++) {
          indices.push(idxAttr.getX(i) + vertexOffset);
        }
      }
      vertexOffset += posAttr.count;
    }
  }

  baseTube.dispose();

  const merged = new THREE.BufferGeometry();
  merged.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  merged.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  merged.setIndex(indices);
  return merged;
}

/**
 * Merges multiple indexed/non-indexed triangle geometries (with optional per-item Matrix4 transform)
 * into a single BufferGeometry to collapse draw calls & scene-graph traversals.
 */
export function mergeStaticMeshGeometries(
  parts: Array<{ geometry: THREE.BufferGeometry; matrix?: THREE.Matrix4 }>
): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  let vertexOffset = 0;

  const v = new THREE.Vector3();
  const n = new THREE.Vector3();
  const nMat = new THREE.Matrix3();

  for (const { geometry, matrix } of parts) {
    const posAttr = geometry.attributes.position as THREE.BufferAttribute;
    const normAttr = geometry.attributes.normal as THREE.BufferAttribute | undefined;
    const idxAttr = geometry.index;
    const flipWinding = matrix ? matrix.determinant() < 0 : false;
    if (matrix) {
      nMat.getNormalMatrix(matrix);
    }

    for (let i = 0; i < posAttr.count; i++) {
      v.fromBufferAttribute(posAttr, i);
      if (matrix) v.applyMatrix4(matrix);
      positions.push(v.x, v.y, v.z);

      if (normAttr) {
        n.fromBufferAttribute(normAttr, i);
        if (matrix) n.applyMatrix3(nMat).normalize();
        normals.push(n.x, n.y, n.z);
      } else {
        normals.push(0, 0, 1);
      }
    }

    if (idxAttr) {
      for (let i = 0; i < idxAttr.count; i += 3) {
        const a = idxAttr.getX(i) + vertexOffset;
        const b = idxAttr.getX(i + 1) + vertexOffset;
        const c = idxAttr.getX(i + 2) + vertexOffset;
        if (flipWinding) {
          indices.push(a, c, b);
        } else {
          indices.push(a, b, c);
        }
      }
    } else {
      for (let i = 0; i < posAttr.count; i += 3) {
        const a = i + vertexOffset;
        const b = i + 1 + vertexOffset;
        const c = i + 2 + vertexOffset;
        if (flipWinding) {
          indices.push(a, c, b);
        } else {
          indices.push(a, b, c);
        }
      }
    }

    vertexOffset += posAttr.count;
  }

  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  out.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  out.setIndex(indices);
  return out;
}

/**
 * Merges multiple `THREE.LineSegments` BufferGeometries sharing the same material into 1 draw call.
 */
export function mergeLineSegmentGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  let totalFloats = 0;
  for (const g of geometries) {
    const pos = g.attributes.position as THREE.BufferAttribute;
    totalFloats += pos.count * 3;
  }
  const mergedPos = new Float32Array(totalFloats);
  let offset = 0;
  for (const g of geometries) {
    const pos = g.attributes.position as THREE.BufferAttribute;
    mergedPos.set(pos.array as Float32Array, offset);
    offset += pos.count * 3;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.BufferAttribute(mergedPos, 3));
  return out;
}
