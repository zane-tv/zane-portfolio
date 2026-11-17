"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { getLocalizedPortfolio, type UiDictionary } from "@/config/i18n";
import type { EnterpriseProjectItem, ProjectItem } from "@/types/portfolio";
import { useIntroStore } from "@/store/introStore";
import { useLocaleStore } from "@/store/localeStore";
import { LacBirdGlyph, SunFourteenIcon } from "@/components/ui/DongSonMotifs";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { SplitHeading } from "@/components/ui/SplitHeading";

/**
 * Flagship Open-Source Monograph Spread featuring:
 * 1) Sleek Optical Clip-Reveal & Translucent Bronze Glass Sheen on Scroll (`[data-bronze-sheen]`)
 * 2) Đông Sơn Corner-Bracket Light Scan (`animate-corner-scan` + glowing corner blades) on Hover
 * 3) Telemetry Text Scramble (`<ScrambleText />`) decoding repo slug, metrics & architecture specs
 */
function ProjectEditorialSpread({
  project,
  index,
  ui,
}: {
  project: ProjectItem;
  index: number;
  ui: UiDictionary["projectsUi"];
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const reducedMotion = useIntroStore((s) => s.reducedMotion);
  const isReversed = index % 2 === 1;

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || !frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
    const ny = (e.clientY - rect.top) / Math.max(1, rect.height) - 0.5;
    frameRef.current.style.transform = `perspective(1200px) rotateY(${(nx * 4.5).toFixed(
      2
    )}deg) rotateX(${(-ny * 3.8).toFixed(2)}deg)`;
  };

  const onPointerLeave = () => {
    setHovered(false);
    if (!frameRef.current) return;
    frameRef.current.style.transform = "perspective(1200px) rotateY(0deg) rotateX(0deg)";
  };

  return (
    <article
      data-scroll-reveal
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={onPointerLeave}
      className="group relative grid grid-cols-1 items-center gap-8 border-t border-[var(--border-hairline)] py-14 lg:grid-cols-12 lg:gap-12 lg:py-20"
    >
      {/* Floating Oversized Parallax Index Numeral */}
      <span
        aria-hidden="true"
        data-parallax-y={isReversed ? "-0.22" : "0.22"}
        className={clsx(
          "pointer-events-none absolute -top-4 z-0 hidden font-display text-[9rem] leading-none font-semibold tracking-[-0.05em] text-[rgba(210,154,92,0.11)] select-none lg:block",
          isReversed ? "right-4" : "left-4"
        )}
      >
        {project.index}
      </span>

      {/* ARTWORK WINDOW WITH BRONZE CURTAIN REVEAL & ĐÔNG SƠN CORNER-BRACKET LIGHT SCAN */}
      <div
        className={clsx(
          "relative z-10 lg:col-span-7",
          isReversed && "lg:order-2"
        )}
      >
        <div
          ref={frameRef}
          onPointerMove={onPointerMove}
          className="relative p-3 transition-transform duration-500 ease-out"
        >
          {/* Four Chiseled Đông Sơn Corner Brackets with Hover Glow Ignition */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-0 h-5 w-5 border-t-2 border-l-2 border-[var(--color-bronze)] transition-all duration-500 group-hover:h-9 group-hover:w-9 group-hover:border-[var(--color-bronze-bright)] group-hover:shadow-[-4px_-4px_16px_rgba(246,213,155,0.45)]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0 right-0 h-5 w-5 border-t-2 border-r-2 border-[var(--color-bronze)] transition-all duration-500 group-hover:h-9 group-hover:w-9 group-hover:border-[var(--color-bronze-bright)] group-hover:shadow-[4px_-4px_16px_rgba(246,213,155,0.45)]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-[var(--color-bronze)] transition-all duration-500 group-hover:h-9 group-hover:w-9 group-hover:border-[var(--color-patina)] group-hover:shadow-[-4px_4px_16px_rgba(115,195,169,0.45)]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-0 bottom-0 h-5 w-5 border-r-2 border-b-2 border-[var(--color-bronze)] transition-all duration-500 group-hover:h-9 group-hover:w-9 group-hover:border-[var(--color-patina)] group-hover:shadow-[4px_4px_16px_rgba(115,195,169,0.45)]"
          />

          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-project-viewport
            aria-label={`${ui.inspectAriaPrefix} ${project.title} on GitHub`}
            className="drum-reactive-card relative block aspect-[16/10] w-full overflow-hidden border border-[var(--border-hairline-strong)] bg-[#080b0f] transition-colors group-hover:border-[var(--border-bronze)]"
          >
            {/* Inner Parallax Image Stage */}
            <div data-parallax-img className="relative h-full w-full will-change-transform">
              <Image
                src={project.thumbnail}
                alt={project.thumbnailAlt}
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
              />
            </div>

            {/* Subtle Đông Sơn Laser Filament Scan on Hover */}
            {hovered && !reducedMotion && (
              <div
                aria-hidden="true"
                className="animate-corner-scan pointer-events-none absolute inset-x-0 top-0 z-20 h-16 bg-gradient-to-b from-transparent via-[rgba(246,213,155,0.12)] to-transparent"
              >
                <div className="mt-8 h-[1px] w-full bg-gradient-to-r from-transparent via-[rgba(246,213,155,0.75)] to-transparent" />
              </div>
            )}

            {/* Delicate Translucent Glass Light Sheen on Scroll Reveal (Never opaque, never blocks image!) */}
            <div
              data-bronze-sheen
              aria-hidden="true"
              style={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(108deg,transparent_28%,rgba(246,213,155,0.18)_48%,rgba(115,195,169,0.12)_54%,transparent_72%)] will-change-transform"
            />

            {/* Top Telemetry Overlay with Scramble Decode */}
            <div className="pointer-events-none absolute inset-x-4 top-3.5 z-20 flex items-center justify-between font-mono text-[10px] tracking-[0.18em] uppercase">
              <span className="border border-[var(--border-hairline-strong)] bg-[#080b0f]/92 px-2.5 py-1 text-[var(--color-ink)]">
                <ScrambleText text={`zane-tv/${project.repo}`} active={hovered} />
              </span>
              <span className="inline-flex items-center gap-1.5 border border-[var(--border-bronze)] bg-[#080b0f]/92 px-2.5 py-1 text-[var(--color-patina)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-patina)]" />
                <ScrambleText text={project.accentMetric} active={hovered} />
              </span>
            </div>
          </a>
        </div>
      </div>

      {/* EDITORIAL MONOGRAPH COLUMN */}
      <div
        data-parallax-y={isReversed ? "0.09" : "-0.09"}
        className={clsx(
          "relative z-10 flex flex-col justify-between lg:col-span-5",
          isReversed && "lg:order-1"
        )}
      >
        <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.22em] text-[var(--color-bronze)] uppercase">
          <span>
            <ScrambleText text={`${ui.artifactPrefix} ${project.index}`} active={hovered} />
          </span>
          <span className="h-[1px] w-8 bg-[var(--border-bronze)]" aria-hidden="true" />
          <span className="text-[var(--color-ink-muted)]">{project.year}</span>
        </div>

        <h3 className="mt-3 font-display text-4xl leading-[1.02] font-medium tracking-[-0.02em] text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-bronze-bright)] sm:text-5xl">
          {project.title}
        </h3>

        <p className="mt-2 font-mono text-xs tracking-[0.08em] text-[var(--color-patina)]">
          {project.subtitle}
        </p>

        <p className="mt-5 text-sm leading-relaxed text-[var(--color-ink-soft)] sm:text-base">
          {project.description}
        </p>

        {/* Technical Architecture Specification Ledger */}
        <div className="mt-6 border-y border-[var(--border-hairline)] py-3.5 font-mono text-[11px] leading-relaxed text-[var(--color-ink-muted)]">
          <span className="mr-2 text-[var(--color-bronze)]">{ui.archPrefix}</span>
          <ScrambleText text={project.architectureNote} active={hovered} />
        </div>

        {/* Stack Line */}
        <p className="mt-4 font-mono text-xs tracking-[0.14em] text-[var(--color-ink-soft)] uppercase">
          {project.stack.join(" · ")}
        </p>

        {/* Tactile Editorial Links */}
        <div className="mt-7 flex flex-wrap items-center gap-7 font-mono text-xs tracking-[0.2em] uppercase">
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group/link relative inline-flex items-center gap-2 pb-1 text-[var(--color-ink)] transition-colors hover:text-[var(--color-bronze-bright)]"
          >
            <span>{ui.exploreSource}</span>
            <span
              aria-hidden="true"
              className="text-[var(--color-bronze)] transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
            >
              ↗
            </span>
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-[1px] bg-[var(--color-bronze)]"
            />
          </a>

          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target={project.liveUrl.startsWith("http") ? "_blank" : undefined}
              rel={project.liveUrl.startsWith("http") ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-2 pb-1 text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-patina)]"
            >
              <span>{ui.companionLink}</span>
              <span aria-hidden="true">→</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function EnterpriseDossierCard({
  item,
  liveLabel,
}: {
  item: EnterpriseProjectItem;
  liveLabel: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      data-scroll-reveal
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className="drum-reactive-card group relative flex flex-col justify-between border border-[var(--border-hairline-strong)] bg-[rgba(13,17,23,0.88)] p-6 transition-colors duration-300 hover:border-[var(--border-bronze)] sm:p-8"
    >
      {/* Chiseled Corner Ticks */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 h-3 w-3 border-t border-l border-[var(--color-bronze)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-0 bottom-0 h-3 w-3 border-r border-b border-[var(--color-patina)]"
      />

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] tracking-[0.2em] uppercase">
          <span className="inline-flex items-center gap-2 text-[var(--color-bronze-bright)]">
            <ScrambleText text={item.code} active={hovered} />
            <span className="border border-[var(--border-bronze)] bg-[rgba(210,154,92,0.12)] px-2 py-0.5 text-[9px] text-[var(--color-patina)]">
              {item.region}
            </span>
          </span>
          <span className="text-[var(--color-ink-muted)]">{item.period}</span>
        </div>

        <h4 className="mt-3.5 font-display text-2xl font-medium text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-bronze-bright)] sm:text-3xl">
          {item.title}
        </h4>
        <p className="mt-1 font-mono text-[11px] text-[var(--color-ink-muted)]">
          {item.organization}
        </p>

        <p className="mt-3.5 text-xs leading-relaxed text-[var(--color-ink-soft)] sm:text-sm">
          {item.summary}
        </p>

        <ul className="mt-4 space-y-2">
          {item.highlights.map((hl, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 text-xs leading-relaxed text-[var(--color-ink-muted)]"
            >
              <span
                aria-hidden="true"
                className="mt-1.5 h-[1px] w-3 shrink-0 bg-[var(--color-bronze)]"
              />
              <span>{hl}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-hairline)] pt-4">
        <p className="font-mono text-[10px] tracking-[0.14em] text-[var(--color-ink-soft)] uppercase">
          {item.stack.join(" · ")}
        </p>
        {item.liveUrl && (
          <a
            href={item.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] text-[var(--color-patina)] uppercase hover:text-[var(--color-bronze-bright)]"
          >
            <span>{liveLabel}</span>
            <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </article>
  );
}

export function ProjectsSection() {
  const locale = useLocaleStore((s) => s.locale);
  const { config, ui } = getLocalizedPortfolio(locale);
  const { projects } = config;

  return (
    <section
      id="projects"
      data-scroll-section
      aria-labelledby="projects-heading"
      className="relative border-t border-[var(--border-hairline)] py-[var(--space-section-y)]"
    >
      <div className="editorial-container">
        {/* Asymmetric Header + Scroll-Rotating Đông Sơn Seal */}
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p
              data-scroll-reveal
              className="mb-3 inline-flex items-center gap-3 font-mono text-xs tracking-[0.24em] text-[var(--color-bronze)] uppercase"
            >
              <LacBirdGlyph className="h-4 w-8 text-[var(--color-bronze)]" />
              <span>{projects.eyebrow}</span>
            </p>
            <SplitHeading
              id="projects-heading"
              text={projects.heading}
              className="font-display text-[clamp(2.5rem,5.4vw,4.6rem)] leading-[1.05] font-medium tracking-[-0.025em] text-[var(--color-ink)]"
            />
            <p
              data-scroll-reveal
              className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--color-ink-muted)] sm:text-base"
            >
              {projects.subheading}
            </p>
          </div>

          <div
            data-scroll-rotate="1"
            aria-hidden="true"
            className="hidden h-24 w-24 items-center justify-center rounded-full border border-[var(--border-bronze)] bg-[rgba(13,17,23,0.65)] text-[var(--color-bronze)] lg:flex"
          >
            <SunFourteenIcon className="h-11 w-11 opacity-85" />
          </div>
        </div>

        {/* 4 Flagship Open-Source Monograph Spreads */}
        <div className="border-b border-[var(--border-hairline)]">
          {projects.items.map((project, idx) => (
            <ProjectEditorialSpread
              key={project.slug}
              project={project}
              index={idx}
              ui={ui.projectsUi}
            />
          ))}
        </div>

        {/* International Production Systems Dossier (from TruongVanTien_Fullstack.tex) */}
        <div className="mt-20">
          <div className="mb-8 max-w-3xl">
            <p
              data-scroll-reveal
              className="font-mono text-[11px] tracking-[0.24em] text-[var(--color-patina)] uppercase"
            >
              {projects.enterpriseEyebrow}
            </p>
            <h3
              data-scroll-reveal
              className="mt-2 font-display text-3xl font-medium text-[var(--color-ink)] sm:text-4xl"
            >
              {projects.enterpriseHeading}
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {projects.enterpriseDossier.map((item) => (
              <EnterpriseDossierCard
                key={item.code}
                item={item}
                liveLabel={ui.projectsUi.livePlatform}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
