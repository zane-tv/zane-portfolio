"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { getLocalizedPortfolio } from "@/config/i18n";
import { triggerDrumStrike, useIntroStore } from "@/store/introStore";
import { useLocaleStore } from "@/store/localeStore";
import { IntroTimeline } from "@/components/three/IntroTimeline";
import { MagneticButton } from "@/components/ui/MagneticButton";
import {
  StaticDrumHaloFallback,
  SunFourteenIcon,
} from "@/components/ui/DongSonMotifs";

const ExperienceCanvas = dynamic(
  () => import("@/components/three/ExperienceCanvas").then((m) => m.ExperienceCanvas),
  { ssr: false }
);

/**
 * Viewport-level Skip Intro control rendered outside `.drum-shake-stage` so `position: fixed`
 * stays strictly anchored to the bottom-right of the browser viewport on both desktop & mobile.
 */
export function IntroSkipControl() {
  const isIntroComplete = useIntroStore((s) => s.isIntroComplete);
  const webglSupported = useIntroStore((s) => s.webglSupported);
  const webglContextLost = useIntroStore((s) => s.webglContextLost);
  const requestSkip = useIntroStore((s) => s.requestSkip);
  const locale = useLocaleStore((s) => s.locale);
  const { ui } = getLocalizedPortfolio(locale);

  if (!webglSupported || webglContextLost || isIntroComplete) {
    return null;
  }

  return (
    <div className="fixed right-5 bottom-6 z-50 sm:right-8 sm:bottom-8">
      <button
        type="button"
        onClick={requestSkip}
        className="pointer-events-auto inline-flex cursor-pointer items-center gap-2 border border-[rgba(210,154,92,0.48)] bg-[#080b0f]/82 px-3.5 py-2 font-mono text-[10px] tracking-[0.2em] text-[var(--color-ink-soft)] uppercase shadow-[0_8px_24px_rgba(0,0,0,0.55)] backdrop-blur-md transition-all hover:border-[var(--color-bronze-bright)] hover:text-[var(--color-ink)]"
      >
        <span>{ui.hero.skipIntro}</span>
        <span className="hidden text-[var(--color-bronze)] sm:inline">[ESC]</span>
      </button>
    </div>
  );
}

export function HeroSection() {
  const heroSectionRef = useRef<HTMLElement>(null);
  const portraitSlotRef = useRef<HTMLDivElement>(null);
  const portraitDomWrapRef = useRef<HTMLDivElement>(null);

  const [titleIndex, setTitleIndex] = useState(0);
  const isIntroComplete = useIntroStore((s) => s.isIntroComplete);
  const webglSupported = useIntroStore((s) => s.webglSupported);
  const webglContextLost = useIntroStore((s) => s.webglContextLost);
  const reducedMotion = useIntroStore((s) => s.reducedMotion);

  const locale = useLocaleStore((s) => s.locale);
  const { config, ui } = getLocalizedPortfolio(locale);
  const { identity, links } = config;

  useEffect(() => {
    if (!isIntroComplete || reducedMotion) return;
    const id = window.setInterval(() => {
      setTitleIndex((prev) => (prev + 1) % identity.titles.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [identity.titles.length, isIntroComplete, reducedMotion]);

  const showStaticHalo = !webglSupported || webglContextLost;

  const handleDrumMedallionStrike = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (rect.left + rect.width * 0.5) / Math.max(1, window.innerWidth);
    const ny = (rect.top + rect.height * 0.5) / Math.max(1, window.innerHeight);
    triggerDrumStrike({ nx, ny, strength: 1.22, kind: "manual" });
  };

  return (
    <section
      id="top"
      ref={heroSectionRef}
      aria-label="Introduction and identity"
      className="relative flex min-h-[100svh] w-full items-center overflow-hidden pt-20 pb-16 lg:pt-24 lg:pb-16"
    >
      {/* Pure Cinema Obsidian Stage Curtain preventing background flash while WebGL chunk loads */}
      {!showStaticHalo && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 z-[5] bg-[#07090c] transition-opacity duration-700 ${
            isIntroComplete ? "opacity-0" : "opacity-100"
          }`}
        />
      )}

      {/* Real-Time Three.js WebGL Stage */}
      <ExperienceCanvas />

      {/* Master GSAP Timeline Controller */}
      <IntroTimeline
        heroSectionRef={heroSectionRef}
        portraitSlotRef={portraitSlotRef}
        portraitDomWrapRef={portraitDomWrapRef}
      />

      {/* Asymmetric Editorial Hero Layout */}
      <div className="editorial-container relative z-20 grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-8">
        {/* LEFT COLUMN: Trương Văn Tiến (Zane) Identity, Seal, Roles, Credentials & Actions */}
        <div
          data-parallax-y="0.08"
          className="order-2 flex flex-col items-start lg:order-1 lg:col-span-7 lg:pr-6"
        >
          {/* Greeting + Real Full Name + Handle */}
          <div
            data-hero-reveal
            className="mb-3 flex flex-wrap items-center gap-3 font-mono text-[11px] tracking-[0.24em] text-[var(--color-ink-muted)] uppercase"
          >
            <span className="h-[1px] w-9 bg-[var(--color-bronze)]" aria-hidden="true" />
            <span className="text-[var(--color-bronze-bright)]">{identity.greeting}</span>
            <span className="text-[var(--border-hairline-strong)]">·</span>
            <span className="text-[var(--color-ink)]">{identity.fullName}</span>
            <span className="text-[var(--border-hairline-strong)]">·</span>
            <span className="text-[var(--color-patina)]">{identity.handle}</span>
          </div>

          {/* Monumental Editorial Name */}
          <div data-hero-reveal className="flex flex-wrap items-baseline gap-5">
            <h1 className="bronze-highlight-sweep font-display text-[clamp(4.6rem,11vw,9.6rem)] leading-[0.86] font-semibold tracking-[-0.04em] text-[var(--color-ink)] drop-shadow-[0_12px_40px_rgba(0,0,0,0.65)]">
              {identity.name}
            </h1>

            <div className="hidden flex-col border-l border-[var(--border-hairline-strong)] pl-4 font-mono text-[10px] tracking-[0.18em] text-[var(--color-ink-muted)] uppercase sm:flex">
              <span className="text-[var(--color-ink-soft)]">{identity.location}</span>
              <span className="mt-0.5 text-[var(--color-bronze)]">{identity.coordinates}</span>
            </div>
          </div>

          {/* Kinetic Split-Shutter Professional Title Switcher */}
          <div
            data-hero-reveal
            className="mt-5 flex min-h-[2.6rem] items-center gap-3.5 text-[var(--color-bronze)]"
          >
            <SunFourteenIcon className="animate-spin-cw h-5 w-5 text-[var(--color-bronze)] drop-shadow-[0_0_8px_rgba(210,154,92,0.5)]" />
            <span className="border border-[var(--border-bronze)] bg-[rgba(210,154,92,0.1)] px-2 py-0.5 font-mono text-[10px] tracking-[0.16em] text-[var(--color-bronze-bright)]">
              0{titleIndex + 1}/0{identity.titles.length}
            </span>
            <div className="relative overflow-hidden py-0.5">
              <p
                key={`${locale}-${titleIndex}`}
                aria-live="off"
                className="animate-role-shutter font-display text-2xl font-medium tracking-[-0.01em] text-[var(--color-bronze-bright)] italic sm:text-3xl"
              >
                {identity.titles[titleIndex]}
              </p>
            </div>
          </div>

          {/* Deliberate Two-Line Builder Philosophy */}
          <div
            data-hero-reveal
            className="mt-5 max-w-xl space-y-1 text-base leading-relaxed text-[var(--color-ink)] sm:text-xl"
          >
            {identity.introLines.map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>

          {/* Global Track Record & Laureate Telemetry Badges */}
          <div
            data-hero-reveal
            className="mt-5 flex flex-wrap items-center gap-2 font-mono text-[10px] tracking-[0.15em] uppercase"
          >
            <span className="border border-[var(--border-bronze)] bg-[rgba(210,154,92,0.12)] px-2.5 py-1 text-[var(--color-bronze-bright)]">
              {identity.yearsExperience}
            </span>
            <span className="border border-[var(--border-hairline-strong)] bg-[rgba(17,21,27,0.75)] px-2.5 py-1 text-[var(--color-ink-soft)]">
              {ui.hero.marketsPrefix}: {identity.globalMarkets.join(" · ")}
            </span>
            <span className="border border-[rgba(115,195,169,0.38)] bg-[rgba(115,195,169,0.1)] px-2.5 py-1 text-[var(--color-patina)]">
              {ui.hero.laureateBadge}
            </span>
          </div>

          {/* Chiseled "ACTIVE LAB" HUD Console */}
          <div
            data-hero-reveal
            className="drum-reactive-card relative mt-5 max-w-xl border border-[var(--border-hairline-strong)] border-l-2 border-l-[var(--color-bronze)] bg-[rgba(13,17,23,0.72)] py-3 pr-4 pl-4 text-xs leading-relaxed text-[var(--color-ink-soft)] backdrop-blur-sm sm:text-[13px]"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-0 right-0 h-2.5 w-2.5 border-t border-r border-[var(--color-bronze)]"
            />
            <span className="mr-2 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] text-[var(--color-patina)] uppercase">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-patina)]" />
              {ui.hero.activeLabPrefix}
            </span>
            {identity.latelyNote}
          </div>

          {/* Primary Stack Line */}
          <div
            data-hero-reveal
            className="mt-5 flex flex-wrap items-center gap-3 text-xs"
          >
            <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-[var(--border-bronze)] bg-[var(--color-bronze-subtle)] px-2.5 py-1 font-mono text-[11px] font-medium tracking-[0.12em] text-[var(--color-bronze-bright)] uppercase">
              <SunFourteenIcon rays={5} className="h-3.5 w-3.5 text-[var(--color-bronze)]" />
              {ui.hero.vietnamBadge}
            </span>
            <span className="font-mono text-[11px] tracking-[0.08em] text-[var(--color-ink-soft)]">
              {identity.primaryStack}
            </span>
          </div>

          {/* Magnetic CTAs */}
          <div
            data-hero-reveal
            className="mt-7 flex flex-wrap items-center gap-3.5"
          >
            <MagneticButton href="#projects" variant="primary">
              <span>{ui.hero.ctaExplore}</span>
              <span aria-hidden="true" className="text-[var(--color-bronze-bright)]">
                →
              </span>
            </MagneticButton>

            <MagneticButton href={links.resumeUrl} variant="secondary" download>
              <span>{ui.hero.ctaResume}</span>
              <span aria-hidden="true" className="text-[var(--color-patina)]">
                ↓
              </span>
            </MagneticButton>

            <MagneticButton href="#contact" variant="secondary">
              <span>{ui.hero.ctaContact}</span>
            </MagneticButton>
          </div>

          {/* Social & Engineering Channels */}
          <div
            data-hero-reveal
            className="mt-7 flex flex-wrap items-center gap-5 border-t border-[var(--border-hairline)] pt-4 font-mono text-[11px] tracking-[0.18em] text-[var(--color-ink-muted)] uppercase"
          >
            <a
              href={links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 transition-colors hover:text-[var(--color-ink)]"
            >
              <span>github.com/zane-tv</span>
              <span
                aria-hidden="true"
                className="text-[var(--color-bronze)] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              >
                ↗
              </span>
            </a>
            <span aria-hidden="true" className="text-[var(--border-hairline-strong)]">
              /
            </span>
            <a
              href={links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 transition-colors hover:text-[var(--color-ink)]"
            >
              <span>LinkedIn</span>
              <span
                aria-hidden="true"
                className="text-[var(--color-bronze)] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              >
                ↗
              </span>
            </a>
            <span aria-hidden="true" className="hidden text-[var(--border-hairline-strong)] sm:inline">
              /
            </span>
            <a
              href={`mailto:${links.email}`}
              className="hidden text-[var(--color-patina)] transition-colors hover:text-[var(--color-ink)] sm:inline"
            >
              {links.email}
            </a>
          </div>
        </div>

        {/* RIGHT COLUMN: Clean, Sleek Avatar Medallion Framed by Airy Đông Sơn Halo */}
        <div className="order-1 flex items-center justify-center lg:order-2 lg:col-span-5 lg:justify-end lg:pr-6 xl:pr-10">
          <div className="relative my-4 flex items-center justify-center p-14 sm:my-2 sm:p-16 lg:my-0 lg:p-12">
            {showStaticHalo && (
              <StaticDrumHaloFallback className="animate-spin-cw absolute inset-[-22%] h-[144%] w-[144%]" />
            )}

            <div
              ref={portraitSlotRef}
              className="relative aspect-square w-[178px] rounded-full sm:w-[236px] md:w-[264px] lg:w-[290px] xl:w-[318px]"
            >
              <div
                ref={portraitDomWrapRef}
                style={{ opacity: showStaticHalo ? 1 : 0 }}
                className="drum-reactive-medallion group relative h-full w-full overflow-hidden rounded-full border border-[rgba(210,154,92,0.45)] bg-[var(--color-bg-elevated)] will-change-[opacity,transform]"
              >
                <Image
                  src={identity.portrait.src}
                  alt={identity.portrait.alt}
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 768px) 236px, 318px"
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03] select-none"
                />
                {isIntroComplete && (
                  <button
                    type="button"
                    data-dedicated-drum-trigger
                    onClick={handleDrumMedallionStrike}
                    aria-label={ui.hero.strikeTitle}
                    title={ui.hero.strikeTitle}
                    className="absolute inset-0 cursor-pointer rounded-full bg-transparent focus-visible:outline-2 focus-visible:outline-[var(--color-bronze)]"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Invitation (Visible only after Intro completes) */}
      <a
        href="#expertise"
        aria-label={ui.hero.scrollLabel}
        className={`absolute bottom-4 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] tracking-[0.24em] text-[var(--color-ink-muted)] uppercase transition-all duration-700 hover:text-[var(--color-bronze)] sm:flex ${
          isIntroComplete ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <span>{ui.hero.scrollLabel}</span>
        <span className="relative h-7 w-[1px] overflow-hidden bg-[var(--border-hairline-strong)]">
          <span className="animate-scroll-line absolute inset-0 bg-[var(--color-bronze)]" />
        </span>
      </a>
    </section>
  );
}
