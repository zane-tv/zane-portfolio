import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();

function polar(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function sunPoints(cx, cy, rays, outerR, innerR) {
  const pts = [];
  for (let i = 0; i < rays * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const [x, y] = polar(cx, cy, r, (i * 180) / rays);
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return pts.join(" ");
}

function combPath(cx, cy, count, r0, r1) {
  let d = "";
  for (let i = 0; i < count; i++) {
    const deg = (i * 360) / count;
    const [x0, y0] = polar(cx, cy, r0, deg);
    const [x1, y1] = polar(cx, cy, r1, deg);
    d += `M${x0.toFixed(2)} ${y0.toFixed(2)}L${x1.toFixed(2)} ${y1.toFixed(2)}`;
  }
  return d;
}

function lacBirdMiniSvg(cx, cy, scale = 1, rotateDeg = 0, color = "#d29a5c", opacity = 0.85) {
  return `
    <g transform="translate(${cx.toFixed(1)}, ${cy.toFixed(1)}) rotate(${rotateDeg.toFixed(1)}) scale(${scale})" opacity="${opacity}">
      <path d="M-18 2 C-13 -1 -6 -3.8 5 -2.6 C13 -1.6 20 -0.4 16 1.8 C7 3.8 -5 4.2 -13 1.4 Z" fill="${color}"/>
      <circle cx="-17.5" cy="1.2" r="3.2" fill="${color}"/>
      <path d="M-20.2 1.2 Q-31 0.4 -43 2.4" stroke="${color}" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      <path d="M-15.5 -1.4 C-9 -9.5 1 -13.5 11 -12.2" stroke="${color}" stroke-width="1.2" stroke-linecap="round" fill="none"/>
      <path d="M-3 -2.2 C2 -13 11 -22.5 24 -26 C19 -16.5 15.5 -8.5 11.5 -1.8 Z" fill="${color}" fill-opacity="0.32" stroke="${color}" stroke-width="1.1"/>
      <path d="M-1 2.4 C4 10.5 11 17.5 19.5 21.5 C15 13.5 11.5 7 8 2.2 Z" fill="${color}" fill-opacity="0.22" stroke="${color}" stroke-width="1"/>
      <path d="M14.5 -0.8 L34 -8.2 M15.5 0.2 L38 -1.2 M14.8 1.2 L33 5.2 M11 2.4 L40 10.2" stroke="${color}" stroke-width="1.1" stroke-linecap="round" fill="none"/>
    </g>
  `;
}

function buildCraneGlbBuffer() {
  const meshesData = [];

  function makeTriMesh(triangles) {
    const positions = [];
    const normals = [];
    const indices = [];
    let min = [Infinity, Infinity, Infinity];
    let max = [-Infinity, -Infinity, -Infinity];

    triangles.forEach((tri, tIdx) => {
      const [a, b, c] = tri;
      const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
      const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      let nx = uy * vz - uz * vy;
      let ny = uz * vx - ux * vz;
      let nz = ux * vy - uy * vx;
      const len = Math.hypot(nx, ny, nz) || 1;
      nx /= len; ny /= len; nz /= len;

      for (const v of [a, b, c]) {
        positions.push(v[0], v[1], v[2]);
        normals.push(nx, ny, nz);
        for (let k = 0; k < 3; k++) {
          if (v[k] < min[k]) min[k] = v[k];
          if (v[k] > max[k]) max[k] = v[k];
        }
      }
      const base = tIdx * 3;
      indices.push(base, base + 1, base + 2);
    });

    return {
      positions: new Float32Array(positions),
      normals: new Float32Array(normals),
      indices: new Uint16Array(indices),
      min,
      max,
    };
  }

  function addQuad(tris, p0, p1, p2, p3, doubleSided = true) {
    tris.push([p0, p1, p2]);
    tris.push([p0, p2, p3]);
    if (doubleSided) {
      tris.push([p0, p2, p1]);
      tris.push([p0, p3, p2]);
    }
  }

  const bodyTris = [];
  const spine = [
    { z: -0.95, y: 0.06, r: 0.02 },
    { z: -0.45, y: 0.01, r: 0.11 },
    { z: 0.0, y: 0.0, r: 0.16 },
    { z: 0.36, y: 0.08, r: 0.09 },
    { z: 0.68, y: 0.30, r: 0.05 },
    { z: 0.88, y: 0.42, r: 0.055 },
    { z: 1.44, y: 0.37, r: 0.006 },
  ];
  const segs = 10;
  for (let i = 0; i < spine.length - 1; i++) {
    const s0 = spine[i];
    const s1 = spine[i + 1];
    for (let j = 0; j < segs; j++) {
      const a0 = (j / segs) * Math.PI * 2;
      const a1 = ((j + 1) / segs) * Math.PI * 2;
      const p00 = [Math.cos(a0) * s0.r * 0.78, s0.y + Math.sin(a0) * s0.r, s0.z];
      const p01 = [Math.cos(a1) * s0.r * 0.78, s0.y + Math.sin(a1) * s0.r, s0.z];
      const p11 = [Math.cos(a1) * s1.r * 0.78, s1.y + Math.sin(a1) * s1.r, s1.z];
      const p10 = [Math.cos(a0) * s1.r * 0.78, s1.y + Math.sin(a0) * s1.r, s1.z];
      addQuad(bodyTris, p00, p01, p11, p10, false);
    }
  }

  function buildInnerWing(side) {
    const tris = [];
    const x0 = side * 0.08;
    const x1 = side * 0.82;
    addQuad(tris, [x0, 0.05, 0.24], [x1, 0.14, 0.12], [x1, 0.11, -0.32], [x0, 0.02, -0.38], true);
    for (let f = 0; f < 9; f++) {
      const u = f / 8;
      const fx = x0 + (x1 - x0) * (0.12 + u * 0.88);
      const fz = -0.24 - u * 0.06;
      addQuad(
        tris,
        [fx - side * 0.04, 0.09, fz + 0.18],
        [fx + side * 0.05, 0.09, fz + 0.15],
        [fx + side * 0.08, 0.05, fz - 0.36],
        [fx - side * 0.02, 0.06, fz - 0.32],
        true
      );
    }
    return makeTriMesh(tris);
  }

  function buildOuterWing(side) {
    const tris = [];
    const span = side * 0.96;
    addQuad(tris, [0, 0, 0.18], [span * 0.72, 0.04, -0.05], [span * 0.65, 0.02, -0.32], [0, -0.01, -0.26], true);
    for (let p = 0; p < 11; p++) {
      const u = p / 10;
      const bx = span * (0.1 + u * 0.76);
      const bz = 0.08 - u * 0.24;
      const tipX = span * (0.45 + u * 0.84);
      const tipZ = -0.36 - (1 - u * 0.45) * 0.38;
      const tipY = 0.03 + u * 0.07;
      addQuad(
        tris,
        [bx, 0.01, bz],
        [bx + side * 0.055, 0.015, bz - 0.05],
        [tipX + side * 0.03, tipY, tipZ],
        [tipX - side * 0.02, tipY - 0.01, tipZ + 0.04],
        true
      );
    }
    return makeTriMesh(tris);
  }

  meshesData.push({ name: "CraneBodyMesh", data: makeTriMesh(bodyTris), material: 0 });
  meshesData.push({ name: "LeftInnerWingMesh", data: buildInnerWing(1), material: 0 });
  meshesData.push({ name: "LeftOuterWingMesh", data: buildOuterWing(1), material: 1 });
  meshesData.push({ name: "RightInnerWingMesh", data: buildInnerWing(-1), material: 0 });
  meshesData.push({ name: "RightOuterWingMesh", data: buildOuterWing(-1), material: 1 });

  const bufferViews = [];
  const accessors = [];
  const meshes = [];
  const chunks = [];
  let byteOffset = 0;

  function pushBytes(typedArray, target) {
    const u8 = new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
    const pad = (4 - (u8.byteLength % 4)) % 4;
    const viewIndex = bufferViews.length;
    bufferViews.push({ buffer: 0, byteOffset, byteLength: u8.byteLength, target });
    chunks.push(u8);
    if (pad > 0) chunks.push(new Uint8Array(pad));
    byteOffset += u8.byteLength + pad;
    return viewIndex;
  }

  for (const m of meshesData) {
    const posView = pushBytes(m.data.positions, 34962);
    const normView = pushBytes(m.data.normals, 34962);
    const idxView = pushBytes(m.data.indices, 34963);

    const posAcc = accessors.length;
    accessors.push({
      bufferView: posView,
      componentType: 5126,
      count: m.data.positions.length / 3,
      type: "VEC3",
      min: m.data.min,
      max: m.data.max,
    });
    const normAcc = accessors.length;
    accessors.push({
      bufferView: normView,
      componentType: 5126,
      count: m.data.normals.length / 3,
      type: "VEC3",
    });
    const idxAcc = accessors.length;
    accessors.push({
      bufferView: idxView,
      componentType: 5123,
      count: m.data.indices.length,
      type: "SCALAR",
    });
    meshes.push({
      name: m.name,
      primitives: [{ attributes: { POSITION: posAcc, NORMAL: normAcc }, indices: idxAcc, material: m.material }],
    });
  }

  const gltf = {
    asset: { version: "2.0", generator: "Zane DongSon Portfolio Crane Exporter" },
    scene: 0,
    scenes: [{ name: "LacCraneScene", nodes: [0] }],
    nodes: [
      { name: "CraneRoot", mesh: 0, children: [1, 3] },
      { name: "LeftInnerWing", mesh: 1, children: [2] },
      { name: "LeftOuterWing", mesh: 2, translation: [0.82, 0.13, -0.06] },
      { name: "RightInnerWing", mesh: 3, children: [4] },
      { name: "RightOuterWing", mesh: 4, translation: [-0.82, 0.13, -0.06] },
    ],
    materials: [
      {
        name: "PearlIvoryBronze",
        doubleSided: true,
        pbrMetallicRoughness: { baseColorFactor: [0.94, 0.90, 0.84, 1.0], metallicFactor: 0.35, roughnessFactor: 0.28 },
      },
      {
        name: "BurnishedDongSonBronze",
        doubleSided: true,
        pbrMetallicRoughness: { baseColorFactor: [0.85, 0.63, 0.38, 1.0], metallicFactor: 0.85, roughnessFactor: 0.24 },
      },
    ],
    meshes,
    accessors,
    bufferViews,
    buffers: [{ byteLength: byteOffset }],
  };

  const jsonBytesRaw = Buffer.from(JSON.stringify(gltf), "utf8");
  const jsonPad = (4 - (jsonBytesRaw.length % 4)) % 4;
  const jsonChunkData = Buffer.concat([jsonBytesRaw, Buffer.alloc(jsonPad, 0x20)]);
  const binChunkData = Buffer.concat(chunks.map((c) => Buffer.from(c)));
  const totalLength = 12 + 8 + jsonChunkData.length + 8 + binChunkData.length;

  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(totalLength, 8);

  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(jsonChunkData.length, 0);
  jsonHeader.writeUInt32LE(0x4e4f534a, 4);

  const binHeader = Buffer.alloc(8);
  binHeader.writeUInt32LE(binChunkData.length, 0);
  binHeader.writeUInt32LE(0x004e4942, 4);

  return Buffer.concat([header, jsonHeader, jsonChunkData, binHeader, binChunkData]);
}

async function generateZanePortrait() {
  const srcPath = path.join(ROOT, "public/images/portrait-source.jpg");
  let hasRealSource = false;
  try {
    await fs.access(srcPath);
    hasRealSource = true;
  } catch {
    hasRealSource = false;
  }

  if (hasRealSource) {
    const meta = await sharp(srcPath).metadata();
    const w = meta.width ?? 1024;
    const h = meta.height ?? 1024;

    // Frame Zane's face & shoulders harmoniously while showcasing both the Đông Sơn drum
    // on the left and the emerald-patina & gold skyline on the right — with 100% pure original colors!
    const cropSize = Math.round(Math.min(w, h) * 0.91);
    const left = 0;
    const top = Math.max(0, Math.min(h - cropSize, Math.round((h - cropSize) * 0.48)));

    await sharp(srcPath)
      .extract({ left, top, width: cropSize, height: cropSize })
      .resize(1024, 1024, { kernel: sharp.kernel.lanczos3 })
      .webp({ quality: 96 })
      .toFile(path.join(ROOT, "public/images/portrait.webp"));
    return;
  }
}

async function generateZaneProjectArtworks() {
  const projects = [
    {
      file: "chua-linh-ung.webp",
      code: "01 // TIKTOK LIVE · BUN · JSON-RPC · ZEROTTS · 235 ★ · 355 FORKS",
      badge: "INTERACTIVE 9:16 CULTURAL STAGE",
      art: `
        <!-- Volumetric Golden Temple Halo & Acoustic Đông Sơn Bell Ripples -->
        <g transform="translate(800, 492)">
          <circle r="430" fill="url(#goldAura)"/>
          <circle r="418" fill="none" stroke="#d29a5c" stroke-opacity="0.16" stroke-width="1"/>
          <circle r="372" fill="none" stroke="#73c3a9" stroke-opacity="0.22" stroke-dasharray="3 9" stroke-width="1.4"/>
          <circle r="336" fill="none" stroke="#d29a5c" stroke-opacity="0.34" stroke-width="1.2"/>
          <path d="${combPath(0, 0, 144, 302, 326)}" stroke="#d29a5c" stroke-opacity="0.48" stroke-width="1.15" fill="none"/>
          <circle r="292" fill="none" stroke="#e7b980" stroke-opacity="0.32" stroke-width="1.5"/>

          <!-- Orbiting Chim Lạc Spirits around the 9:16 Stage -->
          ${lacBirdMiniSvg(-348, -118, 1.35, -24, "#e7b980", 0.78)}
          ${lacBirdMiniSvg(352, -92, 1.25, 198, "#d29a5c", 0.72)}
          ${lacBirdMiniSvg(-330, 168, 1.05, -42, "#73c3a9", 0.55)}
          ${lacBirdMiniSvg(338, 162, 1.1, 162, "#e7b980", 0.6)}

          <!-- Left Telemetry Readout Card (RPC Event Stream) -->
          <g transform="translate(-595, -210)">
            <rect width="330" height="176" rx="6" fill="#0b1017" fill-opacity="0.92" stroke="#d29a5c" stroke-opacity="0.45" stroke-width="1.3"/>
            <line x1="0" y1="36" x2="330" y2="36" stroke="#ece6db" stroke-opacity="0.1"/>
            <circle cx="20" cy="18" r="4" fill="#73c3a9"/>
            <text x="34" y="22" fill="#e7b980" font-family="ui-monospace, monospace" font-size="11" letter-spacing="2">BUN JSON-RPC STREAM</text>
            <text x="20" y="64" fill="#73c3a9" font-family="ui-monospace, monospace" font-size="12">→ gift.incense_bundle  +1</text>
            <text x="20" y="92" fill="#ece6db" fill-opacity="0.85" font-family="ui-monospace, monospace" font-size="12">→ bell.strike(freq=432Hz)</text>
            <text x="20" y="120" fill="#d29a5c" font-family="ui-monospace, monospace" font-size="12">→ fortune.draw(#14_THUONG)</text>
            <text x="20" y="152" fill="#958c7e" font-family="ui-monospace, monospace" font-size="11">LATENCY: 4.2ms · 60 FPS</text>
          </g>

          <!-- Right Telemetry Card (ZeroTTS Synthesis + Crowd Metrics) -->
          <g transform="translate(265, 52)">
            <rect width="335" height="178" rx="6" fill="#0b1017" fill-opacity="0.92" stroke="#73c3a9" stroke-opacity="0.48" stroke-width="1.3"/>
            <line x1="0" y1="36" x2="335" y2="36" stroke="#ece6db" stroke-opacity="0.1"/>
            <circle cx="20" cy="18" r="4" fill="#d29a5c"/>
            <text x="34" y="22" fill="#73c3a9" font-family="ui-monospace, monospace" font-size="11" letter-spacing="2">ZEROTTS VOICE ENGINE</text>
            <g stroke="#73c3a9" stroke-width="3" stroke-linecap="round">
              ${Array.from({ length: 24 }, (_, i) => {
                const h = 8 + Math.abs(Math.sin(i * 0.65)) * 28 + (i % 3) * 5;
                const x = 26 + i * 12;
                return `<line x1="${x}" y1="${84 - h / 2}" x2="${x}" y2="${84 + h / 2}" stroke="${i % 4 === 0 ? "#e7b980" : "#73c3a9"}" stroke-opacity="0.85"/>`;
              }).join("")}
            </g>
            <text x="20" y="134" fill="#ece6db" fill-opacity="0.88" font-family="ui-monospace, monospace" font-size="12">"Cầu bình an — Quẻ Thượng Cát"</text>
            <text x="20" y="158" fill="#d29a5c" font-family="ui-monospace, monospace" font-size="11">★ 235 STARS · 355 FORKS</text>
          </g>

          <!-- 9:16 Interactive Temple Smartphone Stage Monolith -->
          <rect x="-196" y="-366" width="392" height="732" rx="28" fill="#090d12" stroke="url(#bronzeStroke)" stroke-width="2.6" filter="url(#softGlow)"/>
          <rect x="-182" y="-352" width="364" height="704" rx="20" fill="url(#stageInnerBg)" stroke="#ece6db" stroke-opacity="0.12" stroke-width="1"/>

          <!-- Live TikTok Header Pill inside 9:16 Stage -->
          <rect x="-156" y="-330" width="118" height="26" rx="13" fill="#141b24" stroke="#d29a5c" stroke-opacity="0.55"/>
          <circle cx="-138" cy="-317" r="4.5" fill="#e05246"/>
          <text x="-124" y="-313" fill="#ece6db" font-family="ui-monospace, monospace" font-size="11" font-weight="600" letter-spacing="1.5">LIVE · 1.8K</text>
          <text x="152" y="-313" text-anchor="end" fill="#958c7e" font-family="ui-monospace, monospace" font-size="11">9:16 STAGE</text>

          <!-- Sacred 14-Ray Đông Sơn Sun Halo Behind Pagoda -->
          <circle cx="0" cy="-168" r="78" fill="url(#sunCoreGlow)"/>
          <polygon points="${sunPoints(0, -168, 14, 52, 20)}" fill="#e7b980" fill-opacity="0.28" stroke="#f4cfa0" stroke-width="1.4"/>
          <circle cx="0" cy="-168" r="8" fill="#f7dcb4"/>

          <!-- Multi-Tier Curved Vietnamese Pagoda Roof (Mái Chùa Đao Cong) -->
          <path d="M-118 -148 Q-58 -140 0 -196 Q58 -140 118 -148 Q88 -124 98 -114 L-98 -114 Q-88 -124 -118 -148 Z"
                fill="#221911" stroke="#e7b980" stroke-width="2"/>
          <path d="M-154 -84 Q-78 -76 0 -138 Q78 -76 154 -84 Q116 -56 128 -44 L-128 -44 Q-116 -56 -154 -84 Z"
                fill="#2a1e13" stroke="#f0c78e" stroke-width="2.2"/>
          <!-- Hanging Bronze Temple Bell (Đại Hồng Chung) -->
          <path d="M-16 -36 L16 -36 L22 2 L-22 2 Z" fill="#d29a5c" fill-opacity="0.45" stroke="#f4cfa0" stroke-width="1.6"/>
          <circle cx="0" cy="-28" r="38" fill="none" stroke="#73c3a9" stroke-opacity="0.45" stroke-dasharray="3 5"/>

          <!-- Golden Pillars & Glowing Bronze Incense Urn (Lư Hương Đồng) -->
          <line x1="-96" y1="-44" x2="-96" y2="108" stroke="#d29a5c" stroke-opacity="0.72" stroke-width="3"/>
          <line x1="96" y1="-44" x2="96" y2="108" stroke="#d29a5c" stroke-opacity="0.72" stroke-width="3"/>
          <line x1="-142" y1="108" x2="142" y2="108" stroke="#d29a5c" stroke-opacity="0.55" stroke-width="2"/>
          <rect x="-34" y="76" width="68" height="32" rx="6" fill="#2c1f12" stroke="#e7b980" stroke-width="1.8"/>

          <!-- Glowing Incense Sticks & Volumetric Smoke Plumes -->
          <line x1="-8" y1="52" x2="-8" y2="76" stroke="#e05246" stroke-width="2"/>
          <line x1="0" y1="46" x2="0" y2="76" stroke="#f4cfa0" stroke-width="2"/>
          <line x1="8" y1="52" x2="8" y2="76" stroke="#e05246" stroke-width="2"/>
          <path d="M0 44 C-32 4, 30 -32, -4 -78" stroke="#73c3a9" stroke-opacity="0.92" stroke-width="2.4" fill="none" stroke-linecap="round"/>
          <path d="M-14 50 C-44 12, 12 -24, -18 -64" stroke="#f0c78e" stroke-opacity="0.75" stroke-width="1.8" fill="none" stroke-linecap="round"/>
          <path d="M14 50 C44 12, -12 -24, 18 -64" stroke="#f0c78e" stroke-opacity="0.75" stroke-width="1.8" fill="none" stroke-linecap="round"/>

          <!-- Interactive Viewer Action Cards Inside Stage -->
          <g transform="translate(-152, 134)">
            <rect width="304" height="44" rx="8" fill="#111822" stroke="#73c3a9" stroke-opacity="0.55" stroke-width="1.3"/>
            <circle cx="22" cy="22" r="6" fill="#73c3a9"/>
            <text x="40" y="26" fill="#ece6db" font-family="ui-monospace, monospace" font-size="12">@minh_vn thắp hương cầu an 🙏</text>
          </g>
          <g transform="translate(-152, 190)">
            <rect width="304" height="44" rx="8" fill="#111822" stroke="#d29a5c" stroke-opacity="0.55" stroke-width="1.3"/>
            <circle cx="22" cy="22" r="6" fill="#e7b980"/>
            <text x="40" y="26" fill="#f0c78e" font-family="ui-monospace, monospace" font-size="12">@linh_dev thỉnh chuông đồng 🔔</text>
          </g>
          <g transform="translate(-152, 246)">
            <rect width="304" height="44" rx="8" fill="#111822" stroke="#ece6db" stroke-opacity="0.22" stroke-width="1.2"/>
            <circle cx="22" cy="22" r="6" fill="#d29a5c"/>
            <text x="40" y="26" fill="#c8c1b5" font-family="ui-monospace, monospace" font-size="12">Quẻ #08 · Thượng Thượng Cát ✨</text>
          </g>
        </g>
      `,
    },
    {
      file: "soft-db.webp",
      code: "02 // SOFTDB · GO + WAILS NATIVE · 5 ENGINES · SCHEMA AI · HOMEBREW",
      badge: "POLYGLOT DATABASE WORKBENCH",
      art: `
        <g transform="translate(136, 132)">
          <!-- Ambient Glow Behind Desktop Window -->
          <ellipse cx="664" cy="368" rx="640" ry="340" fill="url(#goldAura)"/>

          <!-- Native macOS Workbench Window -->
          <rect x="0" y="0" width="1328" height="724" rx="14" fill="#0a0e14" stroke="url(#bronzeStroke)" stroke-width="2.2" filter="url(#softGlow)"/>
          <rect x="0" y="0" width="1328" height="58" rx="14" fill="#10161f"/>
          <line x1="0" y1="58" x2="1328" y2="58" stroke="#d29a5c" stroke-opacity="0.28" stroke-width="1.2"/>

          <!-- macOS Traffic Lights + Native Binary Badge -->
          <circle cx="28" cy="29" r="6.5" fill="#d29a5c"/>
          <circle cx="50" cy="29" r="6.5" fill="#73c3a9"/>
          <circle cx="72" cy="29" r="6.5" fill="#5c564e"/>
          <text x="102" y="34" fill="#ece6db" font-family="ui-monospace, monospace" font-size="13" font-weight="600" letter-spacing="2">SoftDB.app</text>

          <!-- 5 Database Engine Selector Pills -->
          ${[
            { name: "POSTGRESQL", active: true, accent: "#d29a5c" },
            { name: "MYSQL 8", active: false, accent: "#ece6db" },
            { name: "SQLITE", active: false, accent: "#ece6db" },
            { name: "MONGODB", active: false, accent: "#73c3a9" },
            { name: "REDIS", active: false, accent: "#ece6db" },
          ].map((db, i) => `
            <g transform="translate(${274 + i * 154}, 13)">
              <rect width="140" height="32" rx="5" fill="${db.active ? "rgba(210,154,92,0.2)" : "#0c1118"}" stroke="${db.active ? "#e7b980" : "#ece6db"}" stroke-opacity="${db.active ? "0.85" : "0.16"}" stroke-width="1.3"/>
              <text x="70" y="21" text-anchor="middle" fill="${db.active ? "#f4cfa0" : "#958c7e"}" font-family="ui-monospace, monospace" font-size="12" font-weight="${db.active ? "600" : "400"}" letter-spacing="1.8">${db.name}</text>
            </g>
          `).join("")}

          <rect x="1084" y="13" width="218" height="32" rx="5" fill="rgba(115,195,169,0.14)" stroke="#73c3a9" stroke-opacity="0.65"/>
          <text x="1193" y="33" text-anchor="middle" fill="#73c3a9" font-family="ui-monospace, monospace" font-size="11" letter-spacing="1.5">brew install --cask softdb</text>

          <!-- Left Explorer Sidebar -->
          <line x1="278" y1="58" x2="278" y2="724" stroke="#ece6db" stroke-opacity="0.1"/>
          <text x="24" y="92" fill="#d29a5c" font-family="ui-monospace, monospace" font-size="11" letter-spacing="2.2">SCHEMA EXPLORER</text>
          ${[
            { name: "▾ public.users", tag: "142K", active: true },
            { name: "  ├─ id (uuid PK)", tag: "idx", active: false },
            { name: "  ├─ handle (text)", tag: "uniq", active: false },
            { name: "▾ public.artifacts", tag: "18.4K", active: true },
            { name: "  ├─ owner_id (FK)", tag: "ref", active: false },
            { name: "  ├─ embedding", tag: "vec", active: false },
            { name: "▾ analytics.events", tag: "4.8M", active: true },
            { name: "▾ redis.session_pool", tag: "TTL", active: false },
            { name: "▾ mongo.agent_logs", tag: "doc", active: false },
          ].map((row, idx) => `
            <g transform="translate(16, ${110 + idx * 44})">
              <rect width="246" height="34" rx="4" fill="${row.active ? "rgba(210,154,92,0.09)" : "transparent"}" stroke="${row.active ? "#d29a5c" : "transparent"}" stroke-opacity="0.3"/>
              <text x="12" y="22" fill="${row.active ? "#ece6db" : "#958c7e"}" font-family="ui-monospace, monospace" font-size="12">${row.name}</text>
              <text x="234" y="22" text-anchor="end" fill="${row.active ? "#73c3a9" : "#6e675d"}" font-family="ui-monospace, monospace" font-size="10">${row.tag}</text>
            </g>
          `).join("")}

          <!-- Upper Right: Interactive ER Graph & Schema-Aware AI SQL Copilot -->
          <line x1="278" y1="432" x2="1328" y2="432" stroke="#ece6db" stroke-opacity="0.1"/>
          <!-- Ghosted Đông Sơn Compass inside Canvas -->
          <circle cx="804" cy="246" r="150" fill="none" stroke="#d29a5c" stroke-opacity="0.08" stroke-dasharray="4 6"/>
          <polygon points="${sunPoints(804, 246, 14, 72, 28)}" fill="none" stroke="#d29a5c" stroke-opacity="0.08"/>

          <!-- Foreign Key Bezier Connectors -->
          <path d="M 576 184 C 668 184, 676 144, 764 144" fill="none" stroke="#e7b980" stroke-width="2.2"/>
          <path d="M 576 218 C 668 218, 676 312, 764 312" fill="none" stroke="#73c3a9" stroke-width="2.2" stroke-dasharray="6 4"/>
          <circle cx="576" cy="184" r="4.5" fill="#e7b980"/>
          <circle cx="764" cy="144" r="4.5" fill="#e7b980"/>
          <circle cx="764" cy="312" r="4.5" fill="#73c3a9"/>

          <!-- ER Table Node 1: users -->
          <g transform="translate(326, 112)">
            <rect width="250" height="156" rx="8" fill="#101620" stroke="#e7b980" stroke-width="1.8"/>
            <rect width="250" height="34" rx="8" fill="rgba(210,154,92,0.18)"/>
            <text x="16" y="22" fill="#f4cfa0" font-family="ui-monospace, monospace" font-size="12" font-weight="600">public.users</text>
            <text x="234" y="22" text-anchor="end" fill="#73c3a9" font-family="ui-monospace, monospace" font-size="10">PK</text>
            <text x="16" y="60" fill="#ece6db" font-family="ui-monospace, monospace" font-size="12">id          uuid</text>
            <text x="16" y="88" fill="#c8c1b5" font-family="ui-monospace, monospace" font-size="12">handle      varchar(64)</text>
            <text x="16" y="116" fill="#c8c1b5" font-family="ui-monospace, monospace" font-size="12">tier        enum</text>
            <text x="16" y="142" fill="#958c7e" font-family="ui-monospace, monospace" font-size="11">created_at  timestamptz</text>
          </g>

          <!-- ER Table Node 2: artifacts -->
          <g transform="translate(764, 88)">
            <rect width="268" height="134" rx="8" fill="#101620" stroke="#d29a5c" stroke-opacity="0.75" stroke-width="1.6"/>
            <rect width="268" height="32" rx="8" fill="rgba(210,154,92,0.12)"/>
            <text x="16" y="21" fill="#e7b980" font-family="ui-monospace, monospace" font-size="12" font-weight="600">public.artifacts</text>
            <text x="16" y="58" fill="#ece6db" font-family="ui-monospace, monospace" font-size="12">owner_id    uuid → users.id</text>
            <text x="16" y="86" fill="#73c3a9" font-family="ui-monospace, monospace" font-size="12">embedding   vector(1536)</text>
            <text x="16" y="114" fill="#958c7e" font-family="ui-monospace, monospace" font-size="11">stars_count int4</text>
          </g>

          <!-- ER Table Node 3: Schema-Aware AI SQL Assistant -->
          <g transform="translate(764, 248)">
            <rect width="524" height="154" rx="8" fill="#0d141d" stroke="#73c3a9" stroke-width="1.8"/>
            <text x="18" y="28" fill="#73c3a9" font-family="ui-monospace, monospace" font-size="11" font-weight="600" letter-spacing="2">✦ SCHEMA-GROUNDED AI COPILOT</text>
            <text x="18" y="58" fill="#e7b980" font-family="ui-monospace, monospace" font-size="12">SELECT u.handle, COUNT(a.id) AS shipped, SUM(a.stars_count)</text>
            <text x="18" y="82" fill="#ece6db" font-family="ui-monospace, monospace" font-size="12">FROM public.users u JOIN public.artifacts a ON a.owner_id = u.id</text>
            <text x="18" y="106" fill="#ece6db" font-family="ui-monospace, monospace" font-size="12">WHERE a.embedding &lt;-&gt; $1 &lt; 0.18 GROUP BY 1 ORDER BY 3 DESC;</text>
            <text x="18" y="136" fill="#73c3a9" font-family="ui-monospace, monospace" font-size="11">✓ Verified against live PostgreSQL 17 catalog · Execution: 1.84 ms</text>
          </g>

          <!-- Lower Right: High-Density Result Grid -->
          <g transform="translate(308, 456)">
            <text x="0" y="16" fill="#958c7e" font-family="ui-monospace, monospace" font-size="11" letter-spacing="2">RESULT SET · 4 ROWS · ZERO-COPY GO DRIVER POOL</text>
            ${[
              ["01", "@zane-tv", " tiktok-live-temple-rpc", "235 ★", "1.8 ms"],
              ["02", "@zane-tv", " soft-db (wails-arm64)", "14 ★", "0.9 ms"],
              ["03", "@zane-tv", " opencode-multi-ai", "ACTIVE", "1.2 ms"],
              ["04", "@zane-tv", " agent-skills / holdframe", "VERIFIED", "1.4 ms"],
            ].map((r, idx) => `
              <g transform="translate(0, ${34 + idx * 52})">
                <rect width="984" height="42" rx="5" fill="${idx === 0 ? "rgba(115,195,169,0.09)" : "#0e141c"}" stroke="${idx === 0 ? "#73c3a9" : "#ece6db"}" stroke-opacity="${idx === 0 ? "0.45" : "0.08"}"/>
                <text x="18" y="26" fill="#958c7e" font-family="ui-monospace, monospace" font-size="12">${r[0]}</text>
                <text x="72" y="26" fill="#e7b980" font-family="ui-monospace, monospace" font-size="12">${r[1]}</text>
                <text x="230" y="26" fill="#ece6db" font-family="ui-monospace, monospace" font-size="12">${r[2]}</text>
                <text x="690" y="26" fill="#73c3a9" font-family="ui-monospace, monospace" font-size="12">${r[3]}</text>
                <text x="960" y="26" text-anchor="end" fill="#958c7e" font-family="ui-monospace, monospace" font-size="12">${r[4]}</text>
              </g>
            `).join("")}
          </g>
        </g>
      `,
    },
    {
      file: "opencode-multi-ai.webp",
      code: "03 // OPENCODE-MULTI-AI · ZERO-DOWNTIME OAUTH ROTATION · LIVE TUI",
      badge: "MULTI-PROVIDER QUOTA ROUTER",
      art: `
        <g transform="translate(800, 495)">
          <circle r="440" fill="url(#goldAura)"/>

          <!-- Outer Đông Sơn Concentric Router Dial -->
          <circle r="356" fill="none" stroke="#d29a5c" stroke-opacity="0.22" stroke-width="1.2"/>
          <path d="${combPath(0, 0, 140, 326, 346)}" stroke="#d29a5c" stroke-opacity="0.38" stroke-width="1.1" fill="none"/>
          <circle r="286" fill="none" stroke="#1b2430" stroke-width="18"/>
          <circle r="286" fill="none" stroke="#73c3a9" stroke-opacity="0.88" stroke-width="12" stroke-dasharray="520 130 410 160" stroke-linecap="round" filter="url(#softGlow)"/>
          <circle r="244" fill="none" stroke="#1b2430" stroke-width="14"/>
          <circle r="244" fill="none" stroke="#e7b980" stroke-opacity="0.85" stroke-width="9" stroke-dasharray="360 95 290 120" stroke-linecap="round"/>
          <circle r="204" fill="none" stroke="#d29a5c" stroke-opacity="0.4" stroke-dasharray="4 8" stroke-width="1.4"/>

          <!-- Central 14-Ray Đông Sơn Failover Core -->
          <circle r="118" fill="#090d13" stroke="#e7b980" stroke-width="2.2"/>
          <polygon points="${sunPoints(0, 0, 14, 96, 38)}" fill="#d29a5c" fill-opacity="0.24" stroke="#f4cfa0" stroke-width="1.6"/>
          <circle r="44" fill="#0b0e11" stroke="#73c3a9" stroke-width="1.6"/>
          <text x="0" y="-4" text-anchor="middle" fill="#73c3a9" font-family="ui-monospace, monospace" font-size="16" font-weight="700">0ms</text>
          <text x="0" y="15" text-anchor="middle" fill="#ece6db" font-family="ui-monospace, monospace" font-size="9" letter-spacing="2">FAILOVER</text>

          <!-- Three Rich TUI Provider Pool Panels -->
          <g transform="translate(-185, -396)">
            <rect width="370" height="98" rx="8" fill="#0b1017" stroke="#e7b980" stroke-width="2" filter="url(#softGlow)"/>
            <circle cx="24" cy="26" r="5" fill="#73c3a9"/>
            <text x="38" y="30" fill="#f4cfa0" font-family="ui-monospace, monospace" font-size="13" font-weight="600" letter-spacing="2">SUPERGROK POOL · [ACTIVE]</text>
            <rect x="20" y="48" width="330" height="10" rx="3" fill="#17202b"/>
            <rect x="20" y="48" width="292" height="10" rx="3" fill="#73c3a9"/>
            <text x="20" y="80" fill="#958c7e" font-family="ui-monospace, monospace" font-size="11">4 ACCOUNTS LINKED · QUOTA: 88.4% · 142 tok/s</text>
          </g>

          <g transform="translate(268, 128)">
            <rect width="376" height="108" rx="8" fill="#0b1017" stroke="#73c3a9" stroke-width="1.8"/>
            <circle cx="24" cy="26" r="5" fill="#e7b980"/>
            <text x="38" y="30" fill="#73c3a9" font-family="ui-monospace, monospace" font-size="13" font-weight="600" letter-spacing="2">CHATGPT / CODEX OAUTH</text>
            <rect x="20" y="48" width="336" height="10" rx="3" fill="#17202b"/>
            <rect x="20" y="48" width="244" height="10" rx="3" fill="#e7b980"/>
            <text x="20" y="80" fill="#ece6db" fill-opacity="0.85" font-family="ui-monospace, monospace" font-size="11">AUTO-ROTATE READY · 3 TOKENS WARM</text>
            <text x="20" y="96" fill="#958c7e" font-family="ui-monospace, monospace" font-size="10">NEXT REFRESH IN 00:14:22</text>
          </g>

          <g transform="translate(-644, 128)">
            <rect width="376" height="108" rx="8" fill="#0b1017" stroke="#d29a5c" stroke-width="1.8"/>
            <circle cx="24" cy="26" r="5" fill="#d29a5c"/>
            <text x="38" y="30" fill="#e7b980" font-family="ui-monospace, monospace" font-size="13" font-weight="600" letter-spacing="2">KIRO ACCOUNT CLUSTER</text>
            <rect x="20" y="48" width="336" height="10" rx="3" fill="#17202b"/>
            <rect x="20" y="48" width="312" height="10" rx="3" fill="#d29a5c"/>
            <text x="20" y="80" fill="#ece6db" fill-opacity="0.85" font-family="ui-monospace, monospace" font-size="11">STANDBY SHIELD · 93.0% AVAILABLE</text>
            <text x="20" y="96" fill="#73c3a9" font-family="ui-monospace, monospace" font-size="10">TUI TAB [3] · ZERO STREAM DROP</text>
          </g>
        </g>
      `,
    },
    {
      file: "agent-skills.webp",
      code: "04 // AGENT-SKILLS &amp; HOLDFRAME · PLAYWRIGHT PIXEL-DIFF · MOTION DSL",
      badge: "AUTONOMOUS VERIFICATION &amp; MOTION ENGINE",
      art: `
        <g transform="translate(136, 126)">
          <ellipse cx="664" cy="360" rx="620" ry="330" fill="url(#goldAura)"/>

          <!-- Left Panel: Figma Reference Spec -->
          <rect x="0" y="0" width="560" height="530" rx="10" fill="#0b1017" stroke="#d29a5c" stroke-opacity="0.72" stroke-width="1.8"/>
          <line x1="0" y1="44" x2="560" y2="44" stroke="#ece6db" stroke-opacity="0.1"/>
          <text x="22" y="28" fill="#e7b980" font-family="ui-monospace, monospace" font-size="12" font-weight="600" letter-spacing="2">FIGMA SOURCE ARTBOARD</text>
          <text x="538" y="28" text-anchor="end" fill="#958c7e" font-family="ui-monospace, monospace" font-size="11">1440 × 900</text>
          <!-- Wireframe + Golden Ratio Guides -->
          <g stroke="#d29a5c" stroke-opacity="0.22" stroke-dasharray="4 4">
            <line x1="44" y1="44" x2="44" y2="530"/>
            <line x1="516" y1="44" x2="516" y2="530"/>
            <line x1="0" y1="110" x2="560" y2="110"/>
          </g>
          <rect x="44" y="82" width="240" height="22" rx="3" fill="#d29a5c" fill-opacity="0.25"/>
          <rect x="44" y="126" width="310" height="58" rx="4" fill="#ece6db" fill-opacity="0.12" stroke="#d29a5c" stroke-opacity="0.45"/>
          <circle cx="432" cy="226" r="78" fill="none" stroke="#e7b980" stroke-opacity="0.75" stroke-width="1.6"/>
          <polygon points="${sunPoints(432, 226, 14, 62, 24)}" fill="#d29a5c" fill-opacity="0.24" stroke="#e7b980" stroke-width="1.3"/>
          <rect x="44" y="212" width="260" height="92" rx="6" fill="#111923" stroke="#ece6db" stroke-opacity="0.16"/>
          <rect x="44" y="336" width="472" height="148" rx="8" fill="#101720" stroke="#d29a5c" stroke-opacity="0.35"/>
          ${lacBirdMiniSvg(280, 412, 1.35, -8, "#e7b980", 0.72)}

          <!-- Right Panel: Rendered Chromium DOM + Pixel Verification -->
          <rect x="768" y="0" width="560" height="530" rx="10" fill="#0b1017" stroke="#73c3a9" stroke-opacity="0.82" stroke-width="1.8"/>
          <line x1="768" y1="44" x2="1328" y2="44" stroke="#ece6db" stroke-opacity="0.1"/>
          <text x="790" y="28" fill="#73c3a9" font-family="ui-monospace, monospace" font-size="12" font-weight="600" letter-spacing="2">PLAYWRIGHT RENDERED DOM</text>
          <text x="1306" y="28" text-anchor="end" fill="#73c3a9" font-family="ui-monospace, monospace" font-size="11">✓ QA PASSED</text>
          <rect x="812" y="82" width="240" height="22" rx="3" fill="#73c3a9" fill-opacity="0.25"/>
          <rect x="812" y="126" width="310" height="58" rx="4" fill="#ece6db" fill-opacity="0.14" stroke="#73c3a9" stroke-opacity="0.55"/>
          <circle cx="1200" cy="226" r="78" fill="none" stroke="#73c3a9" stroke-opacity="0.85" stroke-width="1.6"/>
          <polygon points="${sunPoints(1200, 226, 14, 62, 24)}" fill="#73c3a9" fill-opacity="0.22" stroke="#73c3a9" stroke-width="1.3"/>
          <rect x="812" y="212" width="260" height="92" rx="6" fill="#111923" stroke="#73c3a9" stroke-opacity="0.28"/>
          <rect x="812" y="336" width="472" height="148" rx="8" fill="#101720" stroke="#73c3a9" stroke-opacity="0.45"/>
          ${lacBirdMiniSvg(1048, 412, 1.35, -8, "#73c3a9", 0.8)}
          <!-- Laser Scanline Across Right Panel -->
          <line x1="768" y1="265" x2="1328" y2="265" stroke="#73c3a9" stroke-width="2.2" filter="url(#softGlow)"/>

          <!-- Center Optical Đông Sơn Pixel-Diff Verification Loupe -->
          <g transform="translate(664, 265)">
            <circle r="138" fill="#070a0e" stroke="url(#bronzeStroke)" stroke-width="3" filter="url(#softGlow)"/>
            <path d="${combPath(0, 0, 72, 114, 128)}" stroke="#d29a5c" stroke-opacity="0.72" stroke-width="1.2"/>
            <circle r="104" fill="none" stroke="#73c3a9" stroke-opacity="0.55" stroke-dasharray="5 5" stroke-width="1.4"/>
            <text x="0" y="-12" text-anchor="middle" fill="#73c3a9" font-family="ui-monospace, monospace" font-size="34" font-weight="700">0.00%</text>
            <text x="0" y="18" text-anchor="middle" fill="#ece6db" font-family="ui-monospace, monospace" font-size="12" letter-spacing="3">PIXEL DELTA</text>
            <text x="0" y="44" text-anchor="middle" fill="#e7b980" font-family="ui-monospace, monospace" font-size="10" letter-spacing="2">SECURITY AUDIT: CLEAN</text>
          </g>

          <!-- Bottom Bar: Holdframe Programmatic Motion-Graphics Keyframe Timeline -->
          <g transform="translate(0, 566)">
            <rect width="1328" height="164" rx="10" fill="#0a0e14" stroke="#d29a5c" stroke-opacity="0.48" stroke-width="1.6"/>
            <text x="24" y="30" fill="#f4cfa0" font-family="ui-monospace, monospace" font-size="11" font-weight="600" letter-spacing="2.4">HOLDFRAME // MOTION-GRAPHICS TIMELINE DSL · 60 FPS RENDER</text>
            ${[
              { label: "camera.dolly", x0: 240, w: 460, col: "#e7b980" },
              { label: "shader.bloom", x0: 420, w: 580, col: "#73c3a9" },
              { label: "typography.reveal", x0: 640, w: 620, col: "#d29a5c" },
            ].map((trk, i) => `
              <g transform="translate(24, ${50 + i * 34})">
                <text x="0" y="16" fill="#958c7e" font-family="ui-monospace, monospace" font-size="11">${trk.label}</text>
                <line x1="180" y1="12" x2="1280" y2="12" stroke="#ece6db" stroke-opacity="0.08"/>
                <rect x="${trk.x0}" y="4" width="${trk.w}" height="16" rx="4" fill="${trk.col}" fill-opacity="0.26" stroke="${trk.col}" stroke-width="1.3"/>
              </g>
            `).join("")}
            <line x1="720" y1="40" x2="720" y2="154" stroke="#f4cfa0" stroke-width="1.8"/>
          </g>
        </g>
      `,
    },
  ];

  for (const p of projects) {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
      <defs>
        <radialGradient id="bg" cx="50%" cy="46%" r="72%">
          <stop offset="0%" stop-color="#17202b"/>
          <stop offset="58%" stop-color="#0b0f15"/>
          <stop offset="100%" stop-color="#05070a"/>
        </radialGradient>
        <radialGradient id="goldAura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#d29a5c" stop-opacity="0.22"/>
          <stop offset="52%" stop-color="#73c3a9" stop-opacity="0.06"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="sunCoreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#f6d59b" stop-opacity="0.42"/>
          <stop offset="65%" stop-color="#d29a5c" stop-opacity="0.12"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="bronzeStroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f6d59b"/>
          <stop offset="50%" stop-color="#d29a5c"/>
          <stop offset="100%" stop-color="#73c3a9"/>
        </linearGradient>
        <linearGradient id="stageInnerBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#131a24"/>
          <stop offset="55%" stop-color="#0c1017"/>
          <stop offset="100%" stop-color="#080b10"/>
        </linearGradient>
        <filter id="softGlow" x="-15%" y="-15%" width="130%" height="130%">
          <feGaussianBlur stdDeviation="8" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <rect width="1600" height="1000" fill="url(#bg)"/>

      <!-- Precision Architectural Grid & Corner Reticles -->
      <g stroke="#ece6db" stroke-opacity="0.05" stroke-width="1">
        <line x1="84" y1="0" x2="84" y2="1000"/>
        <line x1="1516" y1="0" x2="1516" y2="1000"/>
        <line x1="0" y1="76" x2="1600" y2="76"/>
        <line x1="0" y1="924" x2="1600" y2="924"/>
      </g>
      <g stroke="#d29a5c" stroke-opacity="0.55" stroke-width="2" fill="none">
        <path d="M 64 96 L 64 64 L 96 64"/>
        <path d="M 1536 96 L 1536 64 L 1504 64"/>
        <path d="M 64 904 L 64 936 L 96 936"/>
        <path d="M 1536 904 L 1536 936 L 1504 936"/>
      </g>

      ${p.art}

      <!-- Bottom Cinema Frame Metadata -->
      <text x="108" y="958" fill="#d29a5c" fill-opacity="0.82" font-family="ui-monospace, monospace" font-size="12" letter-spacing="2.4">
        @ZANE-TV // ${p.badge}
      </text>
      <text x="1492" y="958" text-anchor="end" fill="#958c7e" fill-opacity="0.82" font-family="ui-monospace, monospace" font-size="12" letter-spacing="2.4">
        ${p.code}
      </text>
    </svg>`;

    await sharp(Buffer.from(svg))
      .webp({ quality: 92 })
      .toFile(path.join(ROOT, "public/images/projects", p.file));
  }
}

async function generateTexturesAndMeta() {
  const glowSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <defs>
      <radialGradient id="rg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
        <stop offset="35%" stop-color="#f3d2a2" stop-opacity="0.65"/>
        <stop offset="70%" stop-color="#d29a5c" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="256" height="256" fill="url(#rg)"/>
  </svg>`;
  await sharp(Buffer.from(glowSvg)).webp({ quality: 92 }).toFile(path.join(ROOT, "public/textures/radial-glow.webp"));

  const grainSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <rect width="512" height="512" fill="#808080"/>
    <g fill="none" stroke="#a6a6a6" stroke-opacity="0.22">
      ${Array.from({ length: 85 }, (_, i) => `<circle cx="256" cy="256" r="${12 + i * 4.2}" stroke-width="${0.6 + (i % 3) * 0.4}"/>`).join("")}
    </g>
  </svg>`;
  await sharp(Buffer.from(grainSvg)).webp({ quality: 88 }).toFile(path.join(ROOT, "public/textures/bronze-grain.webp"));

  const ogSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <radialGradient id="ogBg" cx="72%" cy="50%" r="65%">
        <stop offset="0%" stop-color="#19212c"/>
        <stop offset="60%" stop-color="#0b0e11"/>
        <stop offset="100%" stop-color="#06080b"/>
      </radialGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#ogBg)"/>
    <g transform="translate(910, 315)" fill="none" stroke="#d29a5c">
      <circle r="244" stroke-opacity="0.38" stroke-width="1.4"/>
      <path d="${combPath(0, 0, 120, 190, 218)}" stroke-opacity="0.58" stroke-width="1.2"/>
      <circle r="174" stroke-opacity="0.5" stroke-width="1.2"/>
      <polygon points="${sunPoints(0, 0, 14, 118, 44)}" fill="#d29a5c" fill-opacity="0.28" stroke="#f4cfa0" stroke-width="1.6"/>
      <circle r="270" stroke="#73c3a9" stroke-opacity="0.55" stroke-dasharray="5 9" stroke-width="2.2"/>
    </g>
    ${lacBirdMiniSvg(790, 138, 1.5, -18, "#f4cfa0", 0.85)}
    <text x="88" y="156" fill="#e7b980" font-family="ui-monospace, monospace" font-size="16" letter-spacing="5">
      TRỐNG ĐỒNG ĐÔNG SƠN × FUTURE SYSTEMS · VIỆT NAM
    </text>
    <text x="84" y="314" fill="#ece6db" font-family="Georgia, serif" font-size="144" font-weight="600">
      Zane
    </text>
    <text x="88" y="386" fill="#c8c1b5" font-family="system-ui, sans-serif" font-size="27">
      Full-Stack · AI · Data · DevOps · Creative Tool Builder
    </text>
    <text x="88" y="486" fill="#73c3a9" font-family="ui-monospace, monospace" font-size="18" letter-spacing="2.2">
      github.com/zane-tv · TypeScript · Go · Python · WebGPU · Three.js
    </text>
  </svg>`;
  await sharp(Buffer.from(ogSvg)).png().toFile(path.join(ROOT, "public/og-image.png"));

  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="14" fill="#0b0e11"/>
    <circle cx="32" cy="32" r="25" fill="none" stroke="#d29a5c" stroke-opacity="0.55" stroke-width="1.6"/>
    <polygon points="${sunPoints(32, 32, 14, 20, 8.2)}" fill="#e7b980"/>
  </svg>`;
  await fs.writeFile(path.join(ROOT, "src/app/icon.svg"), iconSvg, "utf8");

  // Sleek Đông Sơn × Future Tech Faceted Cyber-Spearhead Hardware Cursors (1x 32px & 2x 64px Retina)
  const buildCursorSvg = (isHover) => `
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <defs>
      <linearGradient id="litFacet" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${isHover ? "#e8fff7" : "#fff6e0"}"/>
        <stop offset="50%" stop-color="${isHover ? "#73c3a9" : "#e7b980"}"/>
        <stop offset="100%" stop-color="${isHover ? "#3b8f77" : "#b87b38"}"/>
      </linearGradient>
      <linearGradient id="darkFacet" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${isHover ? "#162928" : "#1c222c"}"/>
        <stop offset="100%" stop-color="#090c10"/>
      </linearGradient>
      <filter id="cursorShadow" x="-20%" y="-20%" width="150%" height="150%">
        <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.72"/>
      </filter>
    </defs>

    <g filter="url(#cursorShadow)">
      <!-- Left Sunlit Metallic Gold / Patina Facet (Tip at exact 6, 6 -> 3, 3 in 1x!) -->
      <polygon
        points="6,6 22,50 28,33"
        fill="url(#litFacet)"
        stroke="#070a0e"
        stroke-width="1.6"
        stroke-linejoin="round"
      />
      <!-- Right Obsidian-Bronze Cyber Facet -->
      <polygon
        points="6,6 28,33 50,22"
        fill="url(#darkFacet)"
        stroke="${isHover ? "#73c3a9" : "#e7b980"}"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
      <!-- Central Spine Ridge -->
      <line x1="7" y1="7" x2="28" y2="33" stroke="#fff8e8" stroke-width="1.4" stroke-linecap="round"/>
      <!-- Engraved Đông Sơn Lozenge Energy Core -->
      <polygon
        points="16,18 22,21 25,27 19,24"
        fill="${isHover ? "#fff6e0" : "#73c3a9"}"
      />
      <!-- Trailing Cyber Tail Notch -->
      <polygon
        points="28,33 33,39 39,33 34,28"
        fill="${isHover ? "#e7b980" : "#73c3a9"}"
        fill-opacity="0.9"
      />
    </g>
  </svg>`;

  const defaultCursorSvg = Buffer.from(buildCursorSvg(false));
  const pointerCursorSvg = Buffer.from(buildCursorSvg(true));

  await sharp(defaultCursorSvg).resize(64, 64).png().toFile(path.join(ROOT, "public/images/cursor-default-2x.png"));
  await sharp(defaultCursorSvg).resize(32, 32).png().toFile(path.join(ROOT, "public/images/cursor-default.png"));
  await sharp(pointerCursorSvg).resize(64, 64).png().toFile(path.join(ROOT, "public/images/cursor-pointer-2x.png"));
  await sharp(pointerCursorSvg).resize(32, 32).png().toFile(path.join(ROOT, "public/images/cursor-pointer.png"));

  const resumeTxt = [
    "TRUONG VAN TIEN (ZANE / @zane-tv) — FULL-STACK, AI & DATA SOFTWARE ENGINEER",
    "Location: Thu Duc City, Ho Chi Minh City, Viet Nam | Email: tientv.63.work@gmail.com",
    "GitHub: https://github.com/zane-tv | LinkedIn: https://www.linkedin.com/in/zane-tv",
    "========================================================================",
    "SUMMARY: Full-stack software engineer with ~4 years of experience delivering",
    "production web, AI, and data platforms across Japan, Germany, and Sweden,",
    "plus open-source developer tools, WebGPU extensions, and interactive live stages.",
    "",
    "CORE STACK: TypeScript, Go, Python, PHP/Laravel, React, Next.js, Vue.js, NestJS,",
    "PySpark, Microsoft Fabric, Delta Lake, PostgreSQL, MySQL, MongoDB, Docker, AWS.",
    "",
    "EDUCATION:",
    "- University of Information Technology (VNU-HCM) — B.S. in Artificial Intelligence (2026–Present)",
    "- Thu Duc College of Technology — Information Technology (2020–2023)",
  ].join("\n");
  await fs.writeFile(path.join(ROOT, "public/resume.txt"), resumeTxt, "utf8");
}

async function main() {
  await fs.mkdir(path.join(ROOT, "public/models"), { recursive: true });
  await fs.mkdir(path.join(ROOT, "public/images/projects"), { recursive: true });
  await fs.mkdir(path.join(ROOT, "public/textures"), { recursive: true });
  await fs.mkdir(path.join(ROOT, "src/app"), { recursive: true });

  const glb = buildCraneGlbBuffer();
  await fs.writeFile(path.join(ROOT, "public/models/crane.glb"), glb);
  await generateZanePortrait();
  await generateZaneProjectArtworks();
  await generateTexturesAndMeta();

  console.log("Generated Zane's real portrait, rich project artworks, 3D GLB, and OG assets.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
