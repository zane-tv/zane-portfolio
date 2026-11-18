"use client";

import { useMemo, useState } from "react";
import { getLocalizedPortfolio } from "@/config/i18n";
import { triggerDrumStrike } from "@/store/introStore";
import { useLocaleStore } from "@/store/localeStore";
import { MagneticButton } from "@/components/ui/MagneticButton";
import {
  buildPeacockWedgesPath,
  buildSunPolygonPoints,
} from "@/components/ui/DongSonMotifs";
import { SplitHeading } from "@/components/ui/SplitHeading";

const HORIZON_ARC_MASK_OUTER = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 560 180' fill='none'%3E%3Cpath d='M 74 132 Q 272 14 486 92' stroke='white' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`;
const HORIZON_ARC_MASK_INNER = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 560 180' fill='none'%3E%3Cpath d='M 112 148 Q 282 46 446 112' stroke='white' stroke-width='1.7' stroke-linecap='round'/%3E%3C/svg%3E")`;

/**
 * Animated Soaring Chim Lạc SVG with active upper/lower wingbeat & organic horizon glide!
 */
function AnimatedHorizonLacBird({
  className,
  delayMs = 0,
}: {
  className?: string;
  delayMs?: number;
}) {
  return (
    <svg
      viewBox="-46 -30 92 56"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.15"
      aria-hidden="true"
      style={{ animationDelay: `${delayMs}ms` }}
      className={className}
    >
      {/* Sleek arched S-neck, torso & breast */}
      <path
        fill="currentColor"
        stroke="none"
        d="M-18 2 C-13 -1 -6 -3.8 5 -2.6 C13 -1.6 20 -0.4 16 1.8 C7 3.8 -5 4.2 -13 1.4 Z"
      />
      <circle cx="-17.5" cy="1.2" r="3.2" fill="currentColor" stroke="none" />
      <circle cx="-17.8" cy="1.0" r="1.1" fill="#0b0e11" stroke="none" />
      {/* Long needle Lạc crane beak */}
      <path strokeLinecap="round" strokeWidth="1.35" d="M-20.2 1.2 Q-31 0.4 -43 2.4" />
      {/* Sweeping double royal crest plumes */}
      <path strokeLinecap="round" strokeWidth="1.1" d="M-15.5 -1.4 C-9 -9.5 1 -13.5 11 -12.2" />
      <path strokeLinecap="round" strokeWidth="0.9" d="M-14.2 -0.2 C-8 -6.5 0 -9.6 8.5 -8.8" />

      {/* Animated Flapping Upper Primary Wing */}
      <g className="animate-wing-upper" style={{ animationDelay: `${delayMs}ms` }}>
        <path
          fill="currentColor"
          fillOpacity="0.28"
          strokeLinejoin="round"
          d="M-3 -2.2 C2 -13 11 -22.5 24 -26 C19 -16.5 15.5 -8.5 11.5 -1.8 Z"
        />
        <path
          strokeWidth="0.85"
          strokeLinecap="round"
          d="M0 -4 L9 -13.5 M2.8 -3.8 L13 -16.8 M5.6 -3.5 L16.8 -19.8 M8.2 -3.1 L20.2 -22.5"
        />
      </g>

      {/* Animated Flapping Lower Secondary Wing */}
      <g className="animate-wing-lower" style={{ animationDelay: `${delayMs}ms` }}>
        <path
          fill="currentColor"
          fillOpacity="0.2"
          strokeLinejoin="round"
          d="M-1 2.4 C4 10.5 11 17.5 19.5 21.5 C15 13.5 11.5 7 8 2.2 Z"
        />
        <path
          strokeWidth="0.8"
          strokeLinecap="round"
          d="M2 4.2 L9.5 12.2 M4.8 4 L13.2 15.4 M7.2 3.8 L16.2 18"
        />
      </g>

      {/* Ceremonial tail streamers & trailing crane legs */}
      <path
        strokeLinecap="round"
        strokeWidth="1.05"
        d="M14.5 -0.8 L34 -8.2 M15.5 0.2 L38 -1.2 M14.8 1.2 L33 5.2"
      />
      <path strokeLinecap="round" strokeWidth="0.95" d="M11 2.4 L40 10.2 M10 3.2 L38.5 11.8" />
    </svg>
  );
}

export function ContactSection() {
  const [copied, setCopied] = useState(false);
  const locale = useLocaleStore((s) => s.locale);
  const { config, ui } = getLocalizedPortfolio(locale);
  const { contact, links, identity } = config;
  const cUi = ui.contactUi;

  const horizonCombFullRing = useMemo(() => {
    let d = "";
    for (let i = 0; i < 120; i++) {
      const deg = (i * 360) / 120;
      const rad = ((deg - 90) * Math.PI) / 180;
      const x0 = (280 + Math.cos(rad) * 116).toFixed(1);
      const y0 = (164 + Math.sin(rad) * 116).toFixed(1);
      const x1 = (280 + Math.cos(rad) * 128).toFixed(1);
      const y1 = (164 + Math.sin(rad) * 128).toFixed(1);
      d += `M${x0} ${y0}L${x1} ${y1}`;
    }
    return d;
  }, []);

  const horizonFeathers = useMemo(
    () => buildPeacockWedgesPath(280, 164, 14, 24, 62, 3),
    []
  );

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(links.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      window.location.href = `mailto:${links.email}`;
    }
  };

  const handleHorizonDrumStrike = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    triggerDrumStrike({
      nx: (r.left + r.width * 0.5) / Math.max(1, window.innerWidth),
      ny: (r.top + r.height * 0.85) / Math.max(1, window.innerHeight),
      strength: 1.25,
      kind: "manual",
    });
  };

  return (
    <footer
      id="contact"
      data-scroll-section
      aria-labelledby="contact-heading"
      className="relative overflow-hidden border-t border-[var(--border-hairline)] pt-[var(--space-section-y)] pb-14"
    >
      {/* Ambient Bronze Horizon Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[460px] bg-[radial-gradient(ellipse_at_50%_100%,rgba(210,154,92,0.18)_0%,rgba(115,195,169,0.06)_45%,transparent_74%)]"
      />

      <div className="editorial-container relative z-10">
        {/* Animated Returning Chim Lạc Flock & Counter-Rotating Ngọc Lũ Đông Sơn Half-Drum Horizon */}
        <div
          data-scroll-reveal
          className="mb-12 flex items-center justify-center"
        >
          <button
            type="button"
            data-dedicated-drum-trigger
            onClick={handleHorizonDrumStrike}
            title={cUi.strikeHorizonTitle}
            aria-label={cUi.strikeHorizonTitle}
            className="group relative flex h-48 w-full max-w-2xl cursor-pointer items-center justify-center bg-transparent focus:outline-none"
          >
            <svg viewBox="0 0 560 180" fill="none" className="h-full w-full overflow-visible">
              <defs>
                <clipPath id="horizon-clip">
                  <rect x="0" y="-20" width="560" height="184" />
                </clipPath>
                <radialGradient id="horizonSunAura" cx="50%" cy="100%" r="60%">
                  <stop offset="0%" stopColor="#f6d59b" stopOpacity="0.38" />
                  <stop offset="55%" stopColor="#d29a5c" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </radialGradient>
                <g id="horizon-mini-bird" color="var(--color-bronze-bright)">
                  <path fill="currentColor" d="M-5.5 0 C-1.5 -1.5 3 -1.5 7 0 C3 1.4 -1.5 1.4 -5.5 0 Z" />
                  <path stroke="currentColor" strokeWidth="0.7" d="M-5.5 0 L-13 0.9 M-1 -0.8 L8 -8.2 L5.5 -0.7 Z" />
                </g>
              </defs>

              <g clipPath="url(#horizon-clip)">
                {/* Glowing Rising Solar Corona */}
                <circle cx="280" cy="164" r="168" fill="url(#horizonSunAura)" />

                {/* Expanding Acoustic Drum Horizon Ripples */}
                <circle
                  cx="280"
                  cy="164"
                  r="148"
                  stroke="var(--color-bronze-bright)"
                  strokeOpacity="0.45"
                  strokeWidth="1.2"
                  className="animate-horizon-ripple"
                />
                <circle
                  cx="280"
                  cy="164"
                  r="148"
                  stroke="var(--color-patina)"
                  strokeOpacity="0.4"
                  strokeWidth="1.1"
                  className="animate-horizon-ripple-delayed"
                />

                {/* Band 1: Clockwise Rotating Outer Dashed Rim */}
                <g
                  className="animate-[spin-slow-cw_58s_linear_infinite]"
                  style={{ transformOrigin: "280px 164px" }}
                  stroke="var(--color-bronze)"
                >
                  <circle cx="280" cy="164" r="154" strokeOpacity="0.34" strokeWidth="1.1" />
                  <circle
                    cx="280"
                    cy="164"
                    r="142"
                    strokeOpacity="0.55"
                    strokeDasharray="5 6"
                    strokeWidth="1.15"
                  />
                </g>

                {/* Band 2: Counter-Clockwise Rotating Radial Comb & Orbiting Miniature Chim Lạc Band */}
                <g
                  className="animate-[spin-slow-ccw_44s_linear_infinite]"
                  style={{ transformOrigin: "280px 164px" }}
                  stroke="var(--color-bronze)"
                >
                  <circle cx="280" cy="164" r="132" strokeOpacity="0.58" strokeWidth="1.15" />
                  <path d={horizonCombFullRing} strokeOpacity="0.68" strokeWidth="1" />
                  <circle cx="280" cy="164" r="112" strokeOpacity="0.5" strokeWidth="1" />
                  {Array.from({ length: 14 }, (_, idx) => (
                    <use
                      key={idx}
                      href="#horizon-mini-bird"
                      transform={`translate(280 164) rotate(${((idx * 360) / 14).toFixed(1)}) translate(0 -92)`}
                    />
                  ))}
                  <circle cx="280" cy="164" r="74" strokeOpacity="0.45" strokeDasharray="3 5" strokeWidth="0.95" />
                </g>

                {/* Band 3: Clockwise Rotating Central 14-Ray Đông Sơn Star Sun */}
                <g
                  className="animate-[spin-slow-cw_36s_linear_infinite]"
                  style={{ transformOrigin: "280px 164px" }}
                  stroke="var(--color-bronze-bright)"
                >
                  <circle cx="280" cy="164" r="68" strokeOpacity="0.6" strokeWidth="1.1" />
                  <path d={horizonFeathers} strokeOpacity="0.62" strokeWidth="0.85" />
                  <polygon
                    points={buildSunPolygonPoints(280, 164, 14, 64, 22)}
                    fill="var(--color-bronze)"
                    fillOpacity="0.34"
                    strokeOpacity="0.92"
                    strokeWidth="1.2"
                  />
                </g>
              </g>

              {/* Glowing Horizon Hairline */}
              <line
                x1="16"
                y1="164"
                x2="544"
                y2="164"
                stroke="var(--color-bronze-bright)"
                strokeOpacity="0.55"
                strokeWidth="1.25"
              />

              {/* Static Flight Trajectory Guide Arc */}
              <path
                d="M 74 132 Q 272 14 486 92"
                stroke="var(--color-patina)"
                strokeOpacity="0.28"
                strokeDasharray="3 7"
                strokeWidth="1.1"
              />
            </svg>

            {/* Compositor-Only Streaming Emerald-Patina & Golden Flight Trajectory Pulses (Zero `stroke-dashoffset` Paint!) */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden"
              style={{
                WebkitMaskImage: HORIZON_ARC_MASK_OUTER,
                maskImage: HORIZON_ARC_MASK_OUTER,
                WebkitMaskSize: "100% 100%",
                maskSize: "100% 100%",
              }}
            >
              <span className="animate-circuit-beam block h-full w-full bg-[linear-gradient(90deg,transparent_42%,#a8f0da_50%,transparent_58%)] will-change-transform" />
            </span>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden"
              style={{
                WebkitMaskImage: HORIZON_ARC_MASK_INNER,
                maskImage: HORIZON_ARC_MASK_INNER,
                WebkitMaskSize: "100% 100%",
                maskSize: "100% 100%",
              }}
            >
              <span className="animate-circuit-beam block h-full w-full bg-[linear-gradient(90deg,transparent_42%,#f6d59b_50%,transparent_58%)] will-change-transform" />
            </span>

            {/* Three Wing-Flapping & Soaring Chim Lạc with Zero-Filter Radial Halo Backings */}
            <div data-parallax-y="-0.14" className="pointer-events-none absolute top-11 left-[18%] sm:left-[24%]">
              <div
                style={{ animationDelay: "450ms" }}
                className="animate-lac-soar relative"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-3 -z-10 rounded-full bg-[radial-gradient(circle,rgba(210,154,92,0.34)_0%,transparent_72%)]"
                />
                <AnimatedHorizonLacBird
                  delayMs={450}
                  className="h-8 w-16 text-[var(--color-bronze)] opacity-80"
                />
              </div>
            </div>
            <div data-parallax-y="-0.26" className="pointer-events-none absolute top-1">
              <div className="animate-lac-soar relative transition-transform duration-500 group-hover:scale-110">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-5 -z-10 rounded-full bg-[radial-gradient(circle,rgba(246,213,155,0.45)_0%,transparent_70%)]"
                />
                <AnimatedHorizonLacBird
                  delayMs={0}
                  className="h-13 w-26 text-[var(--color-bronze-bright)]"
                />
              </div>
            </div>
            <div data-parallax-y="-0.1" className="pointer-events-none absolute top-13 right-[18%] sm:right-[24%]">
              <div
                style={{ animationDelay: "900ms" }}
                className="animate-lac-soar relative"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-3 -z-10 rounded-full bg-[radial-gradient(circle,rgba(115,195,169,0.34)_0%,transparent_72%)]"
                />
                <AnimatedHorizonLacBird
                  delayMs={900}
                  className="h-7 w-14 text-[var(--color-patina)] opacity-75"
                />
              </div>
            </div>
          </button>
        </div>

        {/* Closing Editorial Statement */}
        <div className="mx-auto max-w-3xl text-center">
          <p
            data-scroll-reveal
            className="font-mono text-xs tracking-[0.26em] text-[var(--color-bronze)] uppercase"
          >
            {contact.eyebrow}
          </p>

          <SplitHeading
            id="contact-heading"
            text={contact.headline}
            className="mt-4 font-display text-[clamp(2.8rem,6.5vw,5.4rem)] leading-[1.02] font-medium tracking-[-0.025em] text-[var(--color-ink)]"
          />

          <p
            data-scroll-reveal
            className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-[var(--color-ink-soft)] sm:text-base"
          >
            {contact.subheadline}
          </p>

          <p
            data-scroll-reveal
            className="mt-5 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-[var(--color-patina)]"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-patina)]" />
            <span>{identity.availability}</span>
          </p>

          {/* Direct Contact & Resume Actions */}
          <div
            data-scroll-reveal
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <MagneticButton href={`mailto:${links.email}`} variant="primary">
              <span>{links.email}</span>
              <span aria-hidden="true" className="text-[var(--color-bronze-bright)]">
                ↗
              </span>
            </MagneticButton>

            <button
              type="button"
              onClick={handleCopyEmail}
              className="cursor-pointer border border-[var(--border-hairline-strong)] bg-[rgba(13,17,23,0.88)] px-5 py-3.5 font-mono text-xs tracking-[0.18em] text-[var(--color-ink-soft)] uppercase transition-colors hover:border-[var(--border-bronze)] hover:text-[var(--color-ink)]"
            >
              {copied ? cUi.copiedEmail : cUi.copyEmail}
            </button>

            <MagneticButton href={links.resumeUrl} variant="secondary" download>
              <span>{cUi.downloadResume}</span>
            </MagneticButton>
          </div>

          {/* External Channels */}
          <div
            data-scroll-reveal
            className="mt-10 flex flex-wrap items-center justify-center gap-8 font-mono text-xs tracking-[0.2em] text-[var(--color-ink-muted)] uppercase"
          >
            <a
              href={links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[var(--color-bronze-bright)]"
            >
              GitHub ↗
            </a>
            <a
              href={links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[var(--color-bronze-bright)]"
            >
              LinkedIn ↗
            </a>
            <a
              href="#top"
              className="transition-colors hover:text-[var(--color-patina)]"
            >
              {cUi.backToTop}
            </a>
          </div>
        </div>

        {/* Colophon */}
        <div className="mt-20 flex flex-col items-center justify-between gap-4 border-t border-[var(--border-hairline)] pt-8 font-mono text-[10px] tracking-[0.2em] text-[var(--color-ink-muted)] uppercase sm:flex-row">
          <span>
            © {new Date().getFullYear()} {identity.fullName} ({identity.name}) · {cUi.rightsReserved}
          </span>
          <span className="text-center text-[var(--color-bronze)]">{contact.closingMotto}</span>
        </div>
      </div>
    </footer>
  );
}
