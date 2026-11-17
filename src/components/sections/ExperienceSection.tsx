"use client";

import { getLocalizedPortfolio } from "@/config/i18n";
import { useLocaleStore } from "@/store/localeStore";
import type { JourneyMotif } from "@/types/portfolio";
import { buildSunPolygonPoints, LacBirdGlyph, SunFourteenIcon } from "@/components/ui/DongSonMotifs";
import { SplitHeading } from "@/components/ui/SplitHeading";

function MilestoneMotifSeal({ motif }: { motif: JourneyMotif }) {
  switch (motif) {
    case "sun":
      return (
        <svg viewBox="0 0 44 44" className="h-11 w-11 text-[var(--color-bronze-bright)]" aria-hidden="true">
          <circle cx="22" cy="22" r="20" fill="rgba(210,154,92,0.1)" stroke="currentColor" strokeOpacity="0.55" />
          <polygon points={buildSunPolygonPoints(22, 22, 14, 15, 6)} fill="currentColor" />
        </svg>
      );
    case "crane":
      return (
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-bronze)] bg-[rgba(210,154,92,0.1)]">
          <LacBirdGlyph className="h-6 w-9 text-[var(--color-bronze-bright)]" />
        </div>
      );
    case "chain":
      return (
        <svg
          viewBox="0 0 44 44"
          fill="none"
          stroke="currentColor"
          className="h-11 w-11 text-[var(--color-bronze-bright)]"
          aria-hidden="true"
        >
          <circle cx="22" cy="22" r="20" fill="rgba(210,154,92,0.08)" strokeOpacity="0.5" />
          <circle cx="15" cy="22" r="6" strokeWidth="1.2" />
          <circle cx="15" cy="22" r="2" fill="currentColor" />
          <circle cx="29" cy="22" r="6" strokeWidth="1.2" />
          <circle cx="29" cy="22" r="2" fill="currentColor" />
          <line x1="18" y1="17" x2="26" y2="27" strokeWidth="1.15" />
        </svg>
      );
    case "comb":
      return (
        <svg
          viewBox="0 0 44 44"
          fill="none"
          stroke="currentColor"
          className="h-11 w-11 text-[var(--color-bronze-bright)]"
          aria-hidden="true"
        >
          <circle cx="22" cy="22" r="20" fill="rgba(210,154,92,0.08)" strokeOpacity="0.5" />
          {Array.from({ length: 7 }, (_, i) => (
            <line key={i} x1={10 + i * 4} y1="14" x2={10 + i * 4} y2="30" strokeWidth="1.35" />
          ))}
        </svg>
      );
  }
}

/**
 * Open Architectural Meridian Timeline + Formal Education + Bronze Honors Stele:
 * - Features a blazing Molten Bronze Spark (`[data-molten-spark]`) leading down the vertical
 *   meridian spine, igniting and rotating each milestone's Đông Sơn seal (`[data-milestone-seal]`)!
 */
export function ExperienceSection() {
  const locale = useLocaleStore((s) => s.locale);
  const { config, ui } = getLocalizedPortfolio(locale);
  const { experience } = config;
  const jUi = ui.journeyUi;

  return (
    <section
      id="journey"
      data-scroll-section
      aria-labelledby="journey-heading"
      className="relative border-t border-[var(--border-hairline)] py-[var(--space-section-y)]"
    >
      <div className="editorial-container">
        <div className="mb-16 max-w-3xl">
          <p
            data-scroll-reveal
            className="mb-3 font-mono text-xs tracking-[0.24em] text-[var(--color-bronze)] uppercase"
          >
            {experience.eyebrow}
          </p>
          <SplitHeading
            id="journey-heading"
            text={experience.heading}
            className="font-display text-[clamp(2.5rem,5.2vw,4.5rem)] leading-[1.05] font-medium tracking-[-0.02em] text-[var(--color-ink)]"
          />
          <p
            data-scroll-reveal
            className="mt-4 text-sm leading-relaxed text-[var(--color-ink-muted)] sm:text-base"
          >
            {experience.subheading}
          </p>
        </div>

        {/* Open Vertical Meridian Spine with Exact-Tip Molten Bronze Spark */}
        <div className="relative pl-8 sm:pl-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-3 bottom-3 left-2.5 w-[2px] sm:left-4"
          >
            <div className="absolute inset-y-0 left-0 w-[1px] bg-[var(--border-hairline-strong)]" />
            <div
              data-timeline-progress
              className="absolute inset-0 bg-gradient-to-b from-[#fff3d6] via-[var(--color-bronze-bright)] to-[var(--color-patina)] shadow-[0_0_14px_rgba(246,213,155,0.6)]"
            />
            {/* Leading Molten Bronze Spark Orb (`Đầu lửa đồng nóng chảy dẫn đường` locked 1:1 to progress tip) */}
            <div
              data-molten-spark
              style={{ top: "0%", opacity: 0.35 }}
              className="absolute left-1/2 z-20 -ml-[9.5px] -mt-[9.5px] flex h-[19px] w-[19px] items-center justify-center rounded-full bg-[radial-gradient(circle,#ffffff_0%,#f6d59b_42%,rgba(210,154,92,0)_75%)] shadow-[0_0_24px_6px_rgba(246,213,155,0.85)]"
            />
          </div>

          <ol className="divide-y divide-[var(--border-hairline)]">
            {experience.milestones.map((milestone, idx) => (
              <li
                key={milestone.id}
                data-scroll-reveal
                data-journey-milestone
                className="group relative grid grid-cols-1 gap-6 py-12 first:pt-2 last:pb-4 lg:grid-cols-12 lg:gap-10"
              >
                {/* Oversized Parallax Year Watermark */}
                <span
                  aria-hidden="true"
                  data-parallax-y="0.16"
                  className="pointer-events-none absolute top-6 right-0 hidden font-display text-[6.5rem] leading-none font-semibold tracking-[-0.04em] text-[rgba(210,154,92,0.06)] select-none xl:block"
                >
                  {milestone.watermarkYear}
                </span>

                {/* Glowing Đông Sơn Meridian Node */}
                <span
                  data-milestone-node
                  aria-hidden="true"
                  className="absolute -left-[30px] flex h-4 w-4 items-center justify-center rounded-full border border-[var(--color-bronze-bright)] bg-[var(--color-bg-primary)] sm:-left-[48px]"
                  style={{ top: idx === 0 ? "0.65rem" : "3.4rem" }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#fff3d6]" />
                </span>

                {/* Parallax Era & Rotating Đông Sơn Seal Column */}
                <div className="relative flex flex-col justify-between lg:col-span-4">
                  <div data-parallax-y="0.06">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-xs tracking-[0.22em] text-[var(--color-bronze-bright)] uppercase">
                        {milestone.era}
                      </p>
                      <span className="border border-[rgba(115,195,169,0.35)] bg-[rgba(115,195,169,0.08)] px-2 py-0.5 font-mono text-[9px] tracking-[0.16em] text-[var(--color-patina)] uppercase">
                        {milestone.regionTag}
                      </span>
                    </div>
                    <p className="mt-1.5 font-mono text-[11px] text-[var(--color-ink-muted)]">
                      {milestone.organization} · {milestone.location}
                    </p>
                  </div>

                  {/* Đông Sơn Seal that Illuminates & Rotates Open as Molten Spark Reaches It */}
                  <div className="mt-4 flex items-center gap-3.5 lg:mt-6">
                    <div data-milestone-seal className="origin-center will-change-transform">
                      <MilestoneMotifSeal motif={milestone.motif} />
                    </div>
                    <span className="h-[1px] w-14 bg-gradient-to-r from-[var(--color-bronze)] to-transparent" />
                  </div>
                </div>

                {/* Open Editorial Narrative Column */}
                <div className="relative z-10 lg:col-span-8">
                  <h3 className="font-display text-3xl leading-tight font-medium text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-bronze-bright)] sm:text-4xl">
                    {milestone.role}
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-ink-soft)] sm:text-base">
                    {milestone.summary}
                  </p>

                  <ul className="mt-5 space-y-2.5">
                    {milestone.achievements.map((ach, aIdx) => (
                      <li
                        key={aIdx}
                        className="flex items-start gap-3 text-xs leading-relaxed text-[var(--color-ink-muted)] sm:text-[14px]"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2 h-[1px] w-3.5 shrink-0 bg-[var(--color-patina)]"
                        />
                        <span>{ach}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {milestone.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="border border-[var(--border-hairline-strong)] bg-[rgba(13,17,23,0.72)] px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-[var(--color-bronze-bright)] uppercase"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* ACADEMIC LINEAGE & ENGRAVED BRONZE HONORS STELE (`Bia Đồng Khoa Bảng` from TruongVanTien_Fullstack.tex) */}
        <div className="mt-24 grid grid-cols-1 gap-10 border-t border-[var(--border-hairline-strong)] pt-16 lg:grid-cols-12">
          {/* Formal Education Column */}
          <div className="lg:col-span-5">
            <p
              data-scroll-reveal
              className="font-mono text-[11px] tracking-[0.24em] text-[var(--color-bronze)] uppercase"
            >
              {jUi.educationEyebrow}
            </p>
            <h3
              data-scroll-reveal
              className="mt-2 font-display text-3xl font-medium text-[var(--color-ink)] sm:text-4xl"
            >
              {jUi.educationHeading}
            </h3>

            <div className="mt-8 space-y-6">
              {experience.education.map((edu, idx) => (
                <div
                  key={`edu-${idx}`}
                  data-scroll-reveal
                  className="drum-reactive-card relative border border-[var(--border-hairline-strong)] border-l-2 border-l-[var(--color-bronze)] bg-[rgba(13,17,23,0.88)] p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] tracking-[0.18em] uppercase">
                    <span className="text-[var(--color-bronze-bright)]">{edu.period}</span>
                    {edu.distinction && (
                      <span className="border border-[rgba(115,195,169,0.4)] bg-[rgba(115,195,169,0.1)] px-2 py-0.5 text-[var(--color-patina)]">
                        {edu.distinction}
                      </span>
                    )}
                  </div>
                  <h4 className="mt-2.5 font-display text-2xl font-medium text-[var(--color-ink)]">
                    {edu.institution}
                  </h4>
                  <p className="mt-1 font-mono text-xs text-[var(--color-bronze-bright)]">
                    {edu.degree}
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-[var(--color-ink-muted)]">
                    {edu.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* National & Municipal Honors Stele Column */}
          <div className="lg:col-span-7">
            <p
              data-scroll-reveal
              className="font-mono text-[11px] tracking-[0.24em] text-[var(--color-patina)] uppercase"
            >
              {jUi.honorsEyebrow}
            </p>
            <h3
              data-scroll-reveal
              className="mt-2 font-display text-3xl font-medium text-[var(--color-ink)] sm:text-4xl"
            >
              {jUi.honorsHeading}
            </h3>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {experience.honors.map((honor, idx) => {
                const badgeLabel =
                  honor.tier === "national"
                    ? jUi.tierNational
                    : honor.tier === "city"
                      ? jUi.tierCity
                      : jUi.tierAcademic;
                return (
                  <div
                    key={`honor-${idx}`}
                    data-scroll-reveal
                    className="drum-reactive-card group relative flex flex-col justify-between border border-[var(--border-hairline-strong)] bg-[rgba(13,17,23,0.88)] p-5 transition-colors hover:border-[var(--border-bronze)]"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 font-mono text-[10px] tracking-[0.18em] uppercase">
                        <span className="inline-flex items-center gap-1.5 text-[var(--color-bronze-bright)]">
                          <SunFourteenIcon className="h-3.5 w-3.5 text-[var(--color-bronze)]" />
                          {honor.year}
                        </span>
                        <span className="text-[9px] text-[var(--color-patina)]">{badgeLabel}</span>
                      </div>
                      <h4 className="mt-2.5 font-display text-xl leading-snug font-medium text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-bronze-bright)]">
                        {honor.title}
                      </h4>
                    </div>
                    <p className="mt-3 border-t border-[var(--border-hairline)] pt-2.5 font-mono text-[10px] leading-relaxed text-[var(--color-ink-muted)]">
                      {honor.issuer}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
