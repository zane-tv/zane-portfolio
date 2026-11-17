"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import type { GitHubTelemetryData } from "@/lib/github";
import { getLocalizedPortfolio } from "@/config/i18n";
import { useIntroStore } from "@/store/introStore";
import { useLocaleStore } from "@/store/localeStore";
import {
  buildPeacockWedgesPath,
  buildSunPolygonPoints,
  buildTangentChainSvg,
  LacBirdGlyph,
} from "@/components/ui/DongSonMotifs";

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

export function GitHubTelemetrySection({ data }: { data: GitHubTelemetryData }) {
  const [activeWeekIdx, setActiveWeekIdx] = useState<number>(data.weeks.length - 1);
  const [radarProgress, setRadarProgress] = useState<number>(0);
  const dialWrapRef = useRef<HTMLDivElement>(null);

  const reducedMotion = useIntroStore((s) => s.reducedMotion);
  const locale = useLocaleStore((s) => s.locale);
  const { ui } = getLocalizedPortfolio(locale);
  const tUi = ui.telemetryUi;

  // Clockwise Radar Sweep Reveal when scrolled into view
  useEffect(() => {
    if (reducedMotion) {
      setRadarProgress(1);
      return;
    }
    const el = dialWrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setRadarProgress(1);
      return;
    }

    let triggered = false;
    const proxy = { p: 0 };
    let tween: gsap.core.Tween | null = null;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !triggered) {
          triggered = true;
          tween = gsap.to(proxy, {
            p: 1,
            duration: 1.75,
            ease: "power2.out",
            onUpdate: () => setRadarProgress(proxy.p),
          });
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      tween?.kill();
    };
  }, [reducedMotion]);

  const maxWeekCount = useMemo(
    () => Math.max(1, ...data.weeks.map((w) => w.count)),
    [data.weeks]
  );

  const activeWeek = data.weeks[activeWeekIdx] ?? data.weeks[0];

  const drumOrnament = useMemo(() => {
    let comb = "";
    for (let i = 0; i < 96; i++) {
      const deg = (i * 360) / 96;
      const [x0, y0] = polar(210, 210, 72, deg);
      const [x1, y1] = polar(210, 210, 81, deg);
      comb += `M${x0.toFixed(1)} ${y0.toFixed(1)}L${x1.toFixed(1)} ${y1.toFixed(1)}`;
    }
    const feathers = buildPeacockWedgesPath(210, 210, 14, 17, 39, 3);
    const chain = buildTangentChainSvg(210, 210, 18, 56, 4.8);
    return { comb, feathers, chain };
  }, []);

  // Active connector ray geometry from central 14-ray star sun (210, 210) to activeWeekIdx
  const activeRayCoords = useMemo(() => {
    const wk = data.weeks[activeWeekIdx];
    if (!wk) return null;
    const deg = ((activeWeekIdx + 0.5) * 360) / Math.max(1, data.weeks.length);
    const len = wk.count === 0 ? 4 : 7 + 56 * Math.sqrt(wk.count / maxWeekCount);
    const [tipX, tipY] = polar(210, 210, 128 + len, deg);
    const [rimX, rimY] = polar(210, 210, 125, deg);
    return {
      tipX: tipX.toFixed(2),
      tipY: tipY.toFixed(2),
      rimX: rimX.toFixed(2),
      rimY: rimY.toFixed(2),
      deg,
    };
  }, [activeWeekIdx, data.weeks, maxWeekCount]);

  const radarBeamCoords = useMemo(() => {
    const deg = radarProgress * 360;
    const [bx, by] = polar(210, 210, 192, deg);
    return { bx: bx.toFixed(2), by: by.toFixed(2), active: radarProgress > 0.01 && radarProgress < 0.99 };
  }, [radarProgress]);

  const localizedBanner = data.isFallback
    ? data.fallbackReason === "rate_limited"
      ? tUi.fallbackRateLimited
      : data.fallbackReason === "unconfigured"
        ? tUi.fallbackUnconfigured
        : tUi.fallbackUnavailable
    : `${tUi.liveBannerPrefix} · @${data.username}`;

  return (
    <section
      id="telemetry"
      data-scroll-section
      aria-labelledby="telemetry-heading"
      className="relative border-t border-[var(--border-hairline)] py-[var(--space-section-y)]"
    >
      <div className="editorial-container">
        {/* Section Header + Honest Data Source Banner */}
        <div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p
              data-scroll-reveal
              className="mb-3 font-mono text-xs tracking-[0.24em] text-[var(--color-bronze)] uppercase"
            >
              {tUi.eyebrow}
            </p>
            <h2
              id="telemetry-heading"
              data-split-heading
              data-velocity-skew
              className="overflow-hidden font-display text-[clamp(2.4rem,5vw,4.25rem)] leading-[1.05] font-medium tracking-[-0.02em] text-[var(--color-ink)] will-change-transform"
            >
              <span data-split-line className="block">
                {tUi.heading}
              </span>
            </h2>
          </div>

          <div
            data-scroll-reveal
            role="status"
            className="inline-flex max-w-md items-start gap-2.5 border border-[var(--border-hairline-strong)] bg-[rgba(13,17,23,0.88)] px-4 py-2.5 font-mono text-[11px] leading-relaxed text-[var(--color-ink-soft)]"
          >
            <span
              className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                data.isFallback
                  ? "bg-[var(--color-bronze)]"
                  : "animate-pulse bg-[var(--color-patina)]"
              }`}
            />
            <span>{localizedBanner}</span>
          </div>
        </div>

        {/* Key Numbers Strip */}
        <div className="drum-reactive-card mb-10 grid grid-cols-2 gap-px border border-[var(--border-hairline-strong)] bg-[var(--border-hairline)] lg:grid-cols-4">
          {[
            { label: tUi.stats.publicRepos, value: data.metrics.publicRepos, accent: "text-[var(--color-ink)]" },
            { label: tUi.stats.starsEarned, value: data.metrics.totalStars, accent: "text-[var(--color-bronze-bright)]" },
            { label: tUi.stats.repoForks, value: data.metrics.totalForks, accent: "text-[var(--color-ink)]" },
            { label: tUi.stats.weeklyActivity, value: data.metrics.totalContributions, accent: "text-[var(--color-patina)]" },
          ].map((stat) => (
            <div
              key={stat.label}
              data-scroll-reveal
              className="bg-[rgba(11,14,17,0.9)] p-6 sm:p-8"
            >
              <p className="font-mono text-[10px] tracking-[0.2em] text-[var(--color-ink-muted)] uppercase">
                {stat.label}
              </p>
              <p
                data-count-to={stat.value}
                className={`mt-2 font-display text-4xl font-semibold sm:text-5xl ${stat.accent}`}
              >
                {stat.value.toLocaleString("en-US")}
              </p>
            </div>
          ))}
        </div>

        {/* Interactive Radial Đông Sơn Contribution Visualization + Language & Activity */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* LEFT: Radial 52-Week Đông Sơn Patina Radar Dial */}
          <div
            ref={dialWrapRef}
            data-scroll-reveal
            className="drum-reactive-card flex flex-col items-center justify-between border border-[var(--border-hairline-strong)] bg-[rgba(13,17,23,0.88)] p-6 sm:p-8 lg:col-span-7"
          >
            <div className="flex w-full flex-wrap items-center justify-between gap-2 border-b border-[var(--border-hairline)] pb-4">
              <span className="font-mono text-[11px] tracking-[0.18em] text-[var(--color-ink-soft)] uppercase">
                {tUi.dialTitle}
              </span>
              <span className="font-mono text-[11px] text-[var(--color-patina)]">
                @{data.username} · 52W
              </span>
            </div>

            <div className="relative my-4 flex w-full max-w-[440px] items-center justify-center">
              <svg
                viewBox="0 0 420 420"
                className="h-auto w-full select-none"
                role="img"
                aria-label="52-week radial GitHub contribution visualization surrounding an authentic Ngọc Lũ Đông Sơn bronze drum motif"
              >
                <defs>
                  <linearGradient id="sunToWeekRay" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fff3d6" stopOpacity="0.95" />
                    <stop offset="52%" stopColor="#e7b980" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#73c3a9" stopOpacity="1" />
                  </linearGradient>

                  <g id="dial-lac-bird" color="var(--color-bronze)">
                    <path
                      fill="currentColor"
                      d="M-6.5 0 C-2 -1.8 3.5 -1.8 8 0 C3.5 1.6 -2 1.6 -6.5 0 Z"
                    />
                    <path
                      stroke="currentColor"
                      strokeWidth="0.75"
                      strokeLinecap="round"
                      d="M-6.5 0 L-15.5 1 M-5.2 -0.8 Q0 -5.2 5.5 -4.6"
                    />
                    <path
                      fill="currentColor"
                      fillOpacity="0.28"
                      stroke="currentColor"
                      strokeWidth="0.7"
                      d="M-1.5 -0.9 L9.5 -9.8 L6.8 -0.8 Z"
                    />
                    <path
                      stroke="currentColor"
                      strokeWidth="0.7"
                      d="M7 -0.4 L14.5 -3.4 M7 0.5 L15 2.8"
                    />
                  </g>
                </defs>

                {/* Intricate Multi-Band Ngọc Lũ Đông Sơn Bronze Drum Core */}
                <g stroke="var(--color-bronze)" fill="none">
                  <circle cx="210" cy="210" r="120" strokeOpacity="0.48" strokeWidth="1.2" />
                  <circle cx="210" cy="210" r="115" strokeOpacity="0.3" strokeWidth="0.8" />

                  <g className="animate-spin-ccw" style={{ transformOrigin: "210px 210px" }}>
                    {Array.from({ length: 10 }, (_, bIdx) => (
                      <use
                        key={bIdx}
                        href="#dial-lac-bird"
                        transform={`translate(210 210) rotate(${(bIdx * 36).toFixed(1)}) translate(0 -98)`}
                      />
                    ))}
                  </g>

                  <circle cx="210" cy="210" r="85" strokeOpacity="0.45" strokeWidth="1" />

                  <g className="animate-spin-cw" style={{ transformOrigin: "210px 210px" }}>
                    <path d={drumOrnament.comb} strokeOpacity="0.58" strokeWidth="0.9" />
                    <circle cx="210" cy="210" r="68" strokeOpacity="0.45" strokeWidth="0.9" />

                    <path d={drumOrnament.chain.tangentsPath} strokeOpacity="0.5" strokeWidth="0.75" />
                    {drumOrnament.chain.centers.map(([cx, cy], cIdx) => (
                      <g key={cIdx}>
                        <circle cx={cx} cy={cy} r="4.8" strokeOpacity="0.55" strokeWidth="0.75" />
                        <circle cx={cx} cy={cy} r="1.4" fill="var(--color-bronze)" stroke="none" />
                      </g>
                    ))}

                    <circle cx="210" cy="210" r="45" strokeOpacity="0.5" strokeWidth="0.95" />
                    <path d={drumOrnament.feathers} strokeOpacity="0.55" strokeWidth="0.75" />
                    <polygon
                      points={buildSunPolygonPoints(210, 210, 14, 41, 14.5)}
                      fill="var(--color-bronze)"
                      fillOpacity="0.38"
                      strokeWidth="1.05"
                    />
                  </g>
                </g>

                {/* Clockwise Radar Sweep Beam during initial scroll reveal */}
                {radarBeamCoords.active && (
                  <g pointerEvents="none">
                    <line
                      x1="210"
                      y1="210"
                      x2={radarBeamCoords.bx}
                      y2={radarBeamCoords.by}
                      stroke="#73c3a9"
                      strokeOpacity="0.85"
                      strokeWidth="2"
                    />
                    <circle cx={radarBeamCoords.bx} cy={radarBeamCoords.by} r="4" fill="#fff3d6" />
                  </g>
                )}

                {/* Glowing Connector Ray from Central 14-Ray Sun (210, 210) to Active Week! */}
                {activeRayCoords && radarProgress > 0.25 && (
                  <g pointerEvents="none">
                    <line
                      x1="210"
                      y1="210"
                      x2={activeRayCoords.tipX}
                      y2={activeRayCoords.tipY}
                      stroke="url(#sunToWeekRay)"
                      strokeWidth="1.65"
                      strokeDasharray="3 3"
                    />
                    <circle cx="210" cy="210" r="6.2" fill="#fff3d6" />
                    <circle
                      cx={activeRayCoords.rimX}
                      cy={activeRayCoords.rimY}
                      r="2.6"
                      fill="var(--color-bronze-bright)"
                    />
                    <circle
                      cx={activeRayCoords.tipX}
                      cy={activeRayCoords.tipY}
                      r="6.5"
                      fill="none"
                      stroke="var(--color-bronze-bright)"
                      strokeOpacity="0.75"
                      strokeWidth="1.2"
                    />
                  </g>
                )}

                {/* 52 Interactive Weekly Radial Segments with Clockwise Radar Unfurl */}
                <g>
                  {data.weeks.map((wk, idx) => {
                    const totalW = Math.max(1, data.weeks.length);
                    const deg = ((idx + 0.5) * 360) / totalW;
                    const innerR = 128;

                    // Clockwise radar unfurl factor (0 -> 1 as radar beam sweeps past `idx / totalW`)
                    const threshold = idx / totalW;
                    const localUnfurl = Math.max(
                      0,
                      Math.min(1, (radarProgress - threshold * 0.85) / 0.15)
                    );

                    const fullLen =
                      wk.count === 0
                        ? 3
                        : 7 + 56 * Math.sqrt(wk.count / maxWeekCount);
                    const len = fullLen * localUnfurl;

                    const [rawX0, rawY0] = polar(210, 210, innerR, deg);
                    const [rawX1, rawY1] = polar(210, 210, innerR + len, deg);
                    const [rawHx1, rawHy1] = polar(210, 210, 192, deg);
                    const x0 = rawX0.toFixed(2);
                    const y0 = rawY0.toFixed(2);
                    const x1 = rawX1.toFixed(2);
                    const y1 = rawY1.toFixed(2);
                    const hx1 = rawHx1.toFixed(2);
                    const hy1 = rawHy1.toFixed(2);
                    const isSelected = idx === activeWeekIdx;

                    return (
                      <g
                        key={wk.weekLabel}
                        tabIndex={0}
                        role="button"
                        aria-label={`${wk.weekLabel}, ${wk.dateRange}: ${wk.count} ${tUi.contributionPlural}`}
                        onPointerEnter={() => setActiveWeekIdx(idx)}
                        onFocus={() => setActiveWeekIdx(idx)}
                        style={{ opacity: localUnfurl > 0.02 ? 1 : 0 }}
                        className="cursor-pointer focus:outline-none"
                      >
                        <line
                          x1={x0}
                          y1={y0}
                          x2={hx1}
                          y2={hy1}
                          stroke="transparent"
                          strokeWidth="12"
                        />
                        {wk.count === 0 ? (
                          <circle
                            cx={x0}
                            cy={y0}
                            r={isSelected ? 3.5 : 2}
                            fill={isSelected ? "var(--color-bronze-bright)" : "var(--color-ink-muted)"}
                            fillOpacity={isSelected ? 1 : 0.45}
                          />
                        ) : (
                          <line
                            x1={x0}
                            y1={y0}
                            x2={x1}
                            y2={y1}
                            stroke={isSelected ? "var(--color-bronze-bright)" : "var(--color-patina)"}
                            strokeOpacity={isSelected ? 1 : 0.82}
                            strokeWidth={isSelected ? 5.8 : 4.2}
                            strokeLinecap="round"
                            className="transition-colors duration-200"
                          />
                        )}
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>

            {/* Live Hover / Keyboard Inspection Readout */}
            {activeWeek && (
              <div
                aria-live="polite"
                className="flex w-full flex-wrap items-center justify-between gap-3 border-t border-[var(--border-hairline)] pt-4 font-mono text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="border border-[var(--border-bronze)] bg-[rgba(210,154,92,0.12)] px-2 py-0.5 text-[var(--color-bronze-bright)]">
                    {activeWeek.weekLabel}
                  </span>
                  <span className="text-[var(--color-ink-soft)]">{activeWeek.dateRange}</span>
                </div>
                <span className="text-[var(--color-patina)]">
                  {activeWeek.count}{" "}
                  {activeWeek.count === 1 ? tUi.contributionSingular : tUi.contributionPlural} ·{" "}
                  {tUi.dialHint}
                </span>
              </div>
            )}
          </div>

          {/* RIGHT: Language Distribution & Recent Activity */}
          <div className="flex flex-col gap-8 lg:col-span-5">
            <div
              data-scroll-reveal
              className="drum-reactive-card border border-[var(--border-hairline-strong)] bg-[rgba(13,17,23,0.88)] p-6 sm:p-8"
            >
              <h3 className="font-mono text-xs tracking-[0.2em] text-[var(--color-ink-soft)] uppercase">
                {tUi.languageTitle}
              </h3>

              <div
                aria-hidden="true"
                className="mt-5 flex h-2.5 w-full overflow-hidden rounded-[2px] bg-[var(--color-bg-primary)]"
              >
                {data.languages.map((lang) => (
                  <div
                    key={lang.name}
                    style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
                    className="h-full border-r border-[var(--color-bg-elevated)] last:border-r-0"
                  />
                ))}
              </div>

              <ul className="mt-5 space-y-2.5">
                {data.languages.map((lang) => (
                  <li
                    key={lang.name}
                    className="flex items-center justify-between font-mono text-xs"
                  >
                    <span className="inline-flex items-center gap-2.5 text-[var(--color-ink)]">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: lang.color }}
                      />
                      {lang.name}
                    </span>
                    <span className="text-[var(--color-ink-muted)]">{lang.percentage}%</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              data-scroll-reveal
              className="drum-reactive-card flex-1 border border-[var(--border-hairline-strong)] bg-[rgba(13,17,23,0.88)] p-6 sm:p-8"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-xs tracking-[0.2em] text-[var(--color-ink-soft)] uppercase">
                  {tUi.recentActivityTitle}
                </h3>
                <LacBirdGlyph className="h-6 w-12 text-[var(--color-bronze)] opacity-85" />
              </div>

              <ul className="mt-5 divide-y divide-[var(--border-hairline)]">
                {data.recentActivity.map((item) => (
                  <li key={item.id} className="py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2 font-mono text-[11px]">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-[var(--color-bronze-bright)] hover:underline"
                      >
                        {item.repo}
                      </a>
                      <span className="shrink-0 text-[var(--color-ink-muted)]">{item.dateLabel}</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--color-ink-soft)]">
                      {item.summary}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
