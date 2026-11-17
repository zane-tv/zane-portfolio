"use client";

import { useState } from "react";
import { getLocalizedPortfolio } from "@/config/i18n";
import { useLocaleStore } from "@/store/localeStore";
import type { ExpertiseCategory, ExpertiseMotionStyle } from "@/types/portfolio";
import { buildSunPolygonPoints } from "@/components/ui/DongSonMotifs";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { SplitHeading } from "@/components/ui/SplitHeading";

function DisciplineKineticDiagram({
  style,
  active,
  pointerOffset,
}: {
  style: ExpertiseMotionStyle;
  active: boolean;
  pointerOffset: { x: number; y: number };
}) {
  const px = pointerOffset.x;
  const py = pointerOffset.y;

  switch (style) {
    case "architectural-planes":
      return (
        <svg viewBox="0 0 128 92" fill="none" aria-hidden="true" className="h-22 w-32 shrink-0">
          {[0, 1, 2].map((layer) => {
            const lift = (2 - layer) * (active ? 14 : 9) + py * (layer - 1) * 4;
            const shiftX = px * (layer - 1) * 5;
            return (
              <g
                key={layer}
                style={{
                  transform: `translate(${shiftX.toFixed(1)}px, ${(-lift + 18).toFixed(1)}px)`,
                  transition: "transform 420ms cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <polygon
                  points="64,22 112,42 64,62 16,42"
                  fill="rgba(13,17,23,0.88)"
                  stroke={layer === 0 ? "var(--color-bronze-bright)" : layer === 1 ? "var(--color-patina)" : "var(--color-ink)"}
                  strokeOpacity={layer === 0 ? 0.92 : layer === 1 ? 0.55 : 0.25}
                  strokeWidth="1.25"
                />
              </g>
            );
          })}
          <circle cx="64" cy="24" r="3" fill="var(--color-patina)" />
        </svg>
      );

    case "neural-constellation":
      return (
        <svg viewBox="0 0 128 92" fill="none" aria-hidden="true" className="h-22 w-32 shrink-0">
          <circle
            cx="64"
            cy="46"
            r={active ? 35 : 30}
            stroke="var(--color-bronze)"
            strokeOpacity="0.4"
            strokeDasharray="3 5"
            className="transition-all duration-500"
          />
          <circle
            cx="64"
            cy="46"
            r="18"
            stroke="var(--color-patina)"
            strokeOpacity={active ? 0.85 : 0.42}
            className="transition-opacity duration-500"
          />
          {[0, 60, 120, 180, 240, 300].map((deg, idx) => {
            const rad = ((deg + (active ? 28 : 0)) * Math.PI) / 180;
            const nx = (64 + Math.cos(rad) * 31 + px * 3.5).toFixed(2);
            const ny = (46 + Math.sin(rad) * 31 + py * 3.5).toFixed(2);
            return (
              <g key={deg}>
                <line
                  x1="64"
                  y1="46"
                  x2={nx}
                  y2={ny}
                  stroke="var(--color-bronze-bright)"
                  strokeOpacity={active ? 0.65 : 0.28}
                  strokeWidth="1"
                />
                <circle
                  cx={nx}
                  cy={ny}
                  r={idx % 2 === 0 ? 3.2 : 2.4}
                  fill={idx % 2 === 0 ? "var(--color-bronze-bright)" : "var(--color-patina)"}
                />
              </g>
            );
          })}
          <polygon
            points={buildSunPolygonPoints(64, 46, 14, 11, 4.5)}
            fill="var(--color-bronze-bright)"
          />
        </svg>
      );

    case "laminar-strata":
      return (
        <svg viewBox="0 0 128 92" fill="none" aria-hidden="true" className="h-22 w-32 shrink-0">
          {[0, 1, 2, 3, 4].map((row) => {
            const y = 20 + row * 13;
            const amp = (active ? 10 : 4.5) * (row % 2 === 0 ? 1 : -1) + py * 4;
            return (
              <path
                key={row}
                d={`M 12 ${y} C 44 ${y - amp}, 84 ${y + amp}, 116 ${y}`}
                stroke={row === 2 ? "var(--color-patina)" : "var(--color-bronze)"}
                strokeOpacity={row === 2 ? 0.95 : 0.3 + row * 0.1}
                strokeWidth={row === 2 ? "1.8" : "1.15"}
                className="transition-all duration-500"
              />
            );
          })}
          <circle
            cx={(64 + px * 28).toFixed(2)}
            cy="46"
            r="3.5"
            fill="var(--color-patina)"
            className="transition-all duration-300"
          />
        </svg>
      );

    case "orbital-cluster":
      return (
        <svg viewBox="0 0 128 92" fill="none" aria-hidden="true" className="h-22 w-32 shrink-0">
          <g
            style={{
              transformOrigin: "64px 46px",
              transform: `rotate(${active ? 42 + px * 25 : 0}deg)`,
              transition: "transform 650ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <circle cx="64" cy="46" r="33" stroke="var(--color-bronze)" strokeOpacity="0.42" />
            <rect x="60" y="9" width="8" height="8" fill="#0b0e11" stroke="var(--color-bronze-bright)" />
            <rect x="60" y="75" width="8" height="8" fill="#0b0e11" stroke="var(--color-bronze-bright)" />
          </g>
          <g
            style={{
              transformOrigin: "64px 46px",
              transform: `rotate(${active ? -48 - py * 25 : 0}deg)`,
              transition: "transform 650ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <circle
              cx="64"
              cy="46"
              r="20"
              stroke="var(--color-patina)"
              strokeOpacity="0.7"
              strokeDasharray="6 4"
            />
            <circle cx="84" cy="46" r="3.2" fill="var(--color-patina)" />
            <circle cx="44" cy="46" r="3.2" fill="var(--color-patina)" />
          </g>
          <circle cx="64" cy="46" r="5.2" fill="var(--color-bronze-bright)" fillOpacity="0.9" />
        </svg>
      );

    case "vernier-caliper":
      return (
        <svg viewBox="0 0 128 92" fill="none" aria-hidden="true" className="h-22 w-32 shrink-0">
          <line x1="12" y1="38" x2="116" y2="38" stroke="var(--color-ink)" strokeOpacity="0.3" />
          <line x1="12" y1="56" x2="116" y2="56" stroke="var(--color-ink)" strokeOpacity="0.3" />
          {Array.from({ length: 17 }, (_, i) => {
            const x = 14 + i * 6.2;
            const tall = i % 4 === 0;
            return (
              <line
                key={i}
                x1={x}
                y1={38}
                x2={x}
                y2={tall ? 25 : 31}
                stroke="var(--color-bronze)"
                strokeOpacity={tall ? 0.85 : 0.38}
                strokeWidth="1"
              />
            );
          })}
          <g
            style={{
              transform: `translateX(${((active ? 16 : 0) + px * 18).toFixed(1)}px)`,
              transition: "transform 360ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <rect
              x="48"
              y="22"
              width="24"
              height="48"
              fill="rgba(210,154,92,0.12)"
              stroke="var(--color-patina)"
              strokeWidth="1.25"
            />
            <line x1="60" y1="18" x2="60" y2="74" stroke="var(--color-bronze-bright)" strokeWidth="1.4" />
          </g>
        </svg>
      );
  }
}

function DisciplineCard({ category }: { category: ExpertiseCategory }) {
  const [hovered, setHovered] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0, spotX: 50, spotY: 50 });

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
    const ny = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;
    setPointer({
      x: nx,
      y: ny,
      spotX: ((e.clientX - rect.left) / Math.max(1, rect.width)) * 100,
      spotY: ((e.clientY - rect.top) / Math.max(1, rect.height)) * 100,
    });
  };

  return (
    <article
      data-scroll-reveal
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
        setPointer({ x: 0, y: 0, spotX: 50, spotY: 50 });
      }}
      onPointerMove={onMove}
      style={{
        backgroundImage: hovered
          ? `radial-gradient(480px circle at ${pointer.spotX.toFixed(1)}% ${pointer.spotY.toFixed(
              1
            )}%, rgba(210, 154, 92, 0.12), rgba(115, 195, 169, 0.04) 45%, transparent 72%)`
          : undefined,
      }}
      className="group relative flex flex-col justify-between overflow-hidden border-t border-[var(--border-hairline)] py-8 transition-colors duration-300 md:grid md:grid-cols-12 md:items-center md:gap-6 md:px-5 hover:border-[var(--border-bronze)]"
    >
      {/* Left Molten Bronze Laser Blade on Hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-[2px] origin-top scale-y-0 bg-gradient-to-b from-[var(--color-bronze-bright)] via-[var(--color-bronze)] to-[var(--color-patina)] transition-transform duration-500 group-hover:scale-y-100"
      />

      {/* Roman Index & Ngũ Hành Element Badge */}
      <div className="mb-4 flex items-center gap-4 md:col-span-3 md:mb-0">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-[var(--border-bronze)] bg-[rgba(210,154,92,0.08)] font-display text-xl text-[var(--color-bronze-bright)] transition-all duration-300 group-hover:border-[var(--color-bronze-bright)] group-hover:shadow-[0_0_20px_rgba(210,154,92,0.3)]">
          {category.index}
        </span>
        <div>
          <span className="font-mono text-[9px] tracking-[0.22em] text-[var(--color-patina)] uppercase">
            <ScrambleText text={category.elementBadge} active={hovered} />
          </span>
          <h3 className="mt-0.5 font-display text-2xl font-medium tracking-[-0.01em] text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-bronze-bright)] sm:text-3xl">
            {category.title}
          </h3>
          <p className="font-mono text-[10px] tracking-[0.18em] text-[var(--color-ink-muted)] uppercase">
            {category.vietnameseLabel}
          </p>
        </div>
      </div>

      {/* Editorial Narrative & Capability Pills */}
      <div className="md:col-span-5">
        <p className="text-sm leading-relaxed text-[var(--color-ink-soft)] sm:text-[15px]">
          {category.description}
        </p>
        <div className="mt-3.5 flex flex-wrap gap-2">
          {category.capabilities.map((cap, idx) => (
            <span
              key={`cap-${idx}`}
              className="border border-[var(--border-hairline-strong)] bg-[rgba(13,17,23,0.72)] px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] text-[var(--color-ink-soft)] uppercase transition-colors group-hover:border-[rgba(210,154,92,0.35)]"
            >
              {cap}
            </span>
          ))}
        </div>
      </div>

      {/* Stack Lines + Bespoke Kinetic Visualization */}
      <div className="mt-6 flex items-center justify-between gap-4 md:col-span-4 md:mt-0 md:justify-end">
        <div className="space-y-1 text-left font-mono text-[11px] text-[var(--color-ink-muted)] md:text-right">
          <p className="text-[var(--color-ink-soft)]">{category.stackLines[0]}</p>
          <p>{category.stackLines[1]}</p>
        </div>
        <DisciplineKineticDiagram
          style={category.motionStyle}
          active={hovered}
          pointerOffset={{ x: pointer.x, y: pointer.y }}
        />
      </div>
    </article>
  );
}

export function ExpertiseSection() {
  const locale = useLocaleStore((s) => s.locale);
  const { config } = getLocalizedPortfolio(locale);
  const { expertise } = config;

  return (
    <section
      id="expertise"
      data-scroll-section
      aria-labelledby="expertise-heading"
      className="relative py-[var(--space-section-y)]"
    >
      <div className="editorial-container">
        {/* Section Header with Editorial Split-Line Mask & Velocity Skew */}
        <div className="mb-14 grid grid-cols-1 items-end gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p
              data-scroll-reveal
              className="mb-3 font-mono text-xs tracking-[0.24em] text-[var(--color-bronze)] uppercase"
            >
              {expertise.eyebrow}
            </p>
            <SplitHeading
              id="expertise-heading"
              text={expertise.heading}
              className="font-display text-[clamp(2.4rem,5vw,4.25rem)] leading-[1.06] font-medium tracking-[-0.02em] text-[var(--color-ink)]"
            />
          </div>
          <p
            data-scroll-reveal
            className="text-sm leading-relaxed text-[var(--color-ink-muted)] lg:col-span-4"
          >
            {expertise.subheading}
          </p>
        </div>

        {/* Five Interactive Ngũ Hành Discipline Rows */}
        <div className="border-b border-[var(--border-hairline)]">
          {expertise.categories.map((cat) => (
            <DisciplineCard key={cat.id} category={cat} />
          ))}
        </div>
      </div>
    </section>
  );
}
