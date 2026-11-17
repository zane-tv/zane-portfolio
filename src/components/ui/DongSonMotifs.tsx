import clsx from "clsx";

function polarPoint(cx: number, cy: number, r: number, deg: number): [number, number] {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

export function buildSunPolygonPoints(
  cx: number,
  cy: number,
  rays = 14,
  outerR = 24,
  innerR = 9
): string {
  const pts: string[] = [];
  for (let i = 0; i < rays * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const [x, y] = polarPoint(cx, cy, r, (i * 180) / rays);
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return pts.join(" ");
}

export function buildPeacockWedgesPath(
  cx: number,
  cy: number,
  rays = 14,
  innerR = 11,
  outerR = 23,
  hatches = 3
): string {
  const half = (180 / rays) * 0.62;
  let d = "";
  for (let i = 0; i < rays; i++) {
    const mid = ((i + 0.5) * 360) / rays;
    const [ax, ay] = polarPoint(cx, cy, innerR, mid);
    const [lx, ly] = polarPoint(cx, cy, outerR, mid - half);
    const [rx, ry] = polarPoint(cx, cy, outerR, mid + half);
    d += `M${lx.toFixed(2)} ${ly.toFixed(2)}L${ax.toFixed(2)} ${ay.toFixed(2)}L${rx.toFixed(2)} ${ry.toFixed(2)}`;
    for (let h = 1; h <= hatches; h++) {
      const f = h / (hatches + 1);
      const hx0 = ax + (lx - ax) * f;
      const hy0 = ay + (ly - ay) * f;
      const hx1 = ax + (rx - ax) * f;
      const hy1 = ay + (ry - ay) * f;
      d += `M${hx0.toFixed(2)} ${hy0.toFixed(2)}L${hx1.toFixed(2)} ${hy1.toFixed(2)}`;
    }
  }
  return d;
}

export function buildTangentChainSvg(
  cx: number,
  cy: number,
  count: number,
  bandR: number,
  circleR: number
): { centers: Array<[string, string]>; tangentsPath: string } {
  const rawCenters: Array<[number, number]> = [];
  const centers: Array<[string, string]> = [];
  for (let i = 0; i < count; i++) {
    const [x, y] = polarPoint(cx, cy, bandR, (i * 360) / count);
    rawCenters.push([x, y]);
    centers.push([x.toFixed(2), y.toFixed(2)]);
  }

  let tangentsPath = "";
  for (let i = 0; i < count; i++) {
    const a = rawCenters[i]!;
    const b = rawCenters[(i + 1) % count]!;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const dist = Math.hypot(dx, dy);
    if (dist <= 2.02 * circleR) continue;
    const ux = dx / dist;
    const uy = dy / dist;
    const vx = -uy;
    const vy = ux;
    const cos = (2 * circleR) / dist;
    const sin = Math.sqrt(Math.max(0, 1 - cos * cos));
    const ox = circleR * (cos * ux + sin * vx);
    const oy = circleR * (cos * uy + sin * vy);
    tangentsPath += `M${(a[0] + ox).toFixed(2)} ${(a[1] + oy).toFixed(2)}L${(b[0] - ox).toFixed(
      2
    )} ${(b[1] - oy).toFixed(2)}`;
  }

  return { centers, tangentsPath };
}

export function SunFourteenIcon({
  className,
  rays = 14,
}: {
  className?: string;
  rays?: number;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="currentColor"
      aria-hidden="true"
      className={clsx("inline-block shrink-0", className)}
    >
      <polygon points={buildSunPolygonPoints(24, 24, rays, 22, 8.2)} />
      <circle cx="24" cy="24" r="3.4" fill="#0b0e11" fillOpacity="0.35" />
    </svg>
  );
}

/**
 * Authentic, finely engraved Ngọc Lũ Chim Hạc / Chim Lạc glyph:
 * Elongated needle beak, rounded head + eye ring, sweeping double royal crest,
 * upswept 9-feather combed primary wing, forward secondary wing, 3-streamer tail & trailing legs.
 */
export function LacBirdGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="-46 -30 92 56"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.15"
      aria-hidden="true"
      className={clsx("inline-block shrink-0", className)}
    >
      {/* Sleek arched S-neck, torso & breast */}
      <path
        fill="currentColor"
        stroke="none"
        d="M-18 2 C-13 -1 -6 -3.8 5 -2.6 C13 -1.6 20 -0.4 16 1.8 C7 3.8 -5 4.2 -13 1.4 Z"
      />
      {/* Sculpted head & eye */}
      <circle cx="-17.5" cy="1.2" r="3.2" fill="currentColor" stroke="none" />
      <circle cx="-17.8" cy="1.0" r="1.1" fill="#0b0e11" stroke="none" />
      {/* Long needle Lạc crane beak */}
      <path strokeLinecap="round" strokeWidth="1.35" d="M-20.2 1.2 Q-31 0.4 -43 2.4" />
      {/* Sweeping double royal crest plumes (`mào chim Lạc`) */}
      <path strokeLinecap="round" strokeWidth="1.1" d="M-15.5 -1.4 C-9 -9.5 1 -13.5 11 -12.2" />
      <path strokeLinecap="round" strokeWidth="0.9" d="M-14.2 -0.2 C-8 -6.5 0 -9.6 8.5 -8.8" />
      {/* Grand upswept primary wing with parallel Đông Sơn feather comb lines */}
      <path
        fill="currentColor"
        fillOpacity="0.22"
        strokeLinejoin="round"
        d="M-3 -2.2 C2 -13 11 -22.5 24 -26 C19 -16.5 15.5 -8.5 11.5 -1.8 Z"
      />
      <path
        strokeWidth="0.85"
        strokeLinecap="round"
        d="M0 -4 L9 -13.5 M2.8 -3.8 L13 -16.8 M5.6 -3.5 L16.8 -19.8 M8.2 -3.1 L20.2 -22.5 M10.2 -4.8 L18.2 -14.2"
      />
      {/* Lower forward secondary wing */}
      <path
        fill="currentColor"
        fillOpacity="0.16"
        strokeLinejoin="round"
        d="M-1 2.4 C4 10.5 11 17.5 19.5 21.5 C15 13.5 11.5 7 8 2.2 Z"
      />
      <path
        strokeWidth="0.8"
        strokeLinecap="round"
        d="M2 4.2 L9.5 12.2 M4.8 4 L13.2 15.4 M7.2 3.8 L16.2 18"
      />
      {/* Three-plume ceremonial tail streamers */}
      <path
        strokeLinecap="round"
        strokeWidth="1.05"
        d="M14.5 -0.8 L34 -8.2 M15.5 0.2 L38 -1.2 M14.8 1.2 L33 5.2"
      />
      {/* Long trailing crane legs */}
      <path strokeLinecap="round" strokeWidth="0.95" d="M11 2.4 L40 10.2 M10 3.2 L38.5 11.8" />
    </svg>
  );
}

/**
 * Multi-band Ngọc Lũ Đông Sơn Bronze Drum Halo rendered seamlessly when WebGL is disabled.
 */
export function StaticDrumHaloFallback({ className }: { className?: string }) {
  const combTicks = Array.from({ length: 120 }, (_, i) => {
    const deg = (i * 360) / 120;
    const [x0, y0] = polarPoint(200, 200, 130, deg);
    const [x1, y1] = polarPoint(200, 200, 140, deg);
    return `M${x0.toFixed(1)} ${y0.toFixed(1)}L${x1.toFixed(1)} ${y1.toFixed(1)}`;
  }).join("");

  const outerChain = buildTangentChainSvg(200, 200, 28, 176, 5.2);

  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      aria-hidden="true"
      className={clsx("pointer-events-none select-none", className)}
    >
      <defs>
        <g id="fallback-lac-bird" color="var(--color-bronze)">
          <path
            fill="currentColor"
            d="M-9 0 C-3 -2.2 4 -2.2 10 0 C4 2 -3 2 -9 0 Z"
          />
          <path stroke="currentColor" strokeWidth="0.9" d="M-9 0 L-21 1.2 M-7 -1 Q0 -7 7 -6.2" />
          <path
            fill="currentColor"
            fillOpacity="0.28"
            stroke="currentColor"
            strokeWidth="0.8"
            d="M-2 -1.2 L12 -13.5 L8.5 -1 Z"
          />
          <path stroke="currentColor" strokeWidth="0.8" d="M9 -0.5 L19 -4.5 M9 0.5 L20 3.5" />
        </g>
      </defs>

      <g stroke="var(--color-bronze)" strokeOpacity="0.58">
        <circle cx="200" cy="200" r="194" strokeWidth="1.2" />
        <circle cx="200" cy="200" r="186" strokeWidth="0.8" strokeOpacity="0.4" />

        {/* Outer tangent-linked concentric circles */}
        <path d={outerChain.tangentsPath} strokeWidth="0.8" strokeOpacity="0.55" />
        {outerChain.centers.map(([cx, cy], idx) => (
          <g key={idx}>
            <circle cx={cx} cy={cy} r="5.2" strokeWidth="0.8" />
            <circle cx={cx} cy={cy} r="1.6" fill="var(--color-bronze)" stroke="none" />
          </g>
        ))}

        <circle cx="200" cy="200" r="166" strokeWidth="1" />
        {/* 14 Flying Lạc Birds around primary heritage band */}
        {Array.from({ length: 14 }, (_, i) => (
          <use
            key={i}
            href="#fallback-lac-bird"
            transform={`translate(200 200) rotate(${((i * 360) / 14).toFixed(1)}) translate(0 -153)`}
          />
        ))}

        <circle cx="200" cy="200" r="143" strokeWidth="1" />
        <path d={combTicks} strokeWidth="0.9" strokeOpacity="0.62" />
        <circle cx="200" cy="200" r="127" strokeWidth="1.3" />
        <polygon
          points={buildSunPolygonPoints(200, 200, 14, 139, 114)}
          fill="var(--color-bronze)"
          fillOpacity="0.14"
          strokeWidth="0.9"
        />
      </g>
    </svg>
  );
}
