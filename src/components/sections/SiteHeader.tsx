"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { getLocalizedPortfolio } from "@/config/i18n";
import { useIntroStore } from "@/store/introStore";
import { useLocaleStore } from "@/store/localeStore";
import { SunFourteenIcon } from "@/components/ui/DongSonMotifs";

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isIntroComplete = useIntroStore((s) => s.isIntroComplete);
  const webglSupported = useIntroStore((s) => s.webglSupported);
  const requestReplay = useIntroStore((s) => s.requestReplay);

  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const { config, ui } = getLocalizedPortfolio(locale);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 36);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "#expertise", label: ui.nav.disciplines },
    { href: "#projects", label: ui.nav.artifacts },
    { href: "#telemetry", label: ui.nav.telemetry },
    { href: "#journey", label: ui.nav.trajectory },
    { href: "#contact", label: ui.nav.dialogue },
  ] as const;

  const handleReplay = () => {
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    requestReplay();
  };

  const showSolidBg = isScrolled || mobileMenuOpen;

  return (
    <header
      aria-hidden={!isIntroComplete}
      style={{
        backgroundColor: showSolidBg ? "rgba(11, 14, 17, 0.9)" : "transparent",
        backdropFilter: showSolidBg ? "blur(16px)" : "none",
      }}
      className={clsx(
        "fixed inset-x-0 top-0 z-50 transition-[transform,opacity,background-color,border-color,backdrop-filter,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isIntroComplete
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none invisible -translate-y-[150%] opacity-0",
        showSolidBg
          ? "border-b border-[var(--border-bronze)] shadow-[0_10px_36px_rgba(0,0,0,0.55)]"
          : "border-b border-transparent shadow-none"
      )}
    >
      <div className="editorial-container flex h-16 items-center justify-between gap-4 sm:h-[4.25rem]">
        {/* Brand Identity + 14-Ray Đông Sơn Sun */}
        <a
          href="#top"
          tabIndex={isIntroComplete ? 0 : -1}
          className="group inline-flex items-center gap-3 text-[var(--color-ink)] transition-colors hover:text-[var(--color-bronze-bright)] [text-shadow:0_2px_14px_rgba(5,7,10,0.92)]"
        >
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-bronze)] bg-[rgba(11,14,17,0.58)] backdrop-blur-sm">
            <SunFourteenIcon className="h-4 w-4 text-[var(--color-bronze)] transition-transform duration-700 group-hover:rotate-45" />
          </span>
          <span className="flex flex-col">
            <span className="font-mono text-xs font-medium tracking-[0.24em] whitespace-nowrap uppercase">
              {config.identity.name}{" "}
              <span className="hidden text-[var(--color-bronze-bright)] sm:inline">
                {config.identity.handle}
              </span>
            </span>
            <span className="hidden font-mono text-[10px] tracking-[0.14em] text-[var(--color-ink-soft)] opacity-85 sm:block">
              {ui.nav.editionLabel}
            </span>
          </span>
        </a>

        {/* Primary Section Navigation (Crisp legibility over transparent Hero & solid scroll state) */}
        <nav aria-label="Primary navigation" className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              tabIndex={isIntroComplete ? 0 : -1}
              className="group relative py-1 font-mono text-[11px] font-medium tracking-[0.18em] text-[var(--color-ink)] uppercase transition-colors hover:text-[var(--color-bronze-bright)] [text-shadow:0_2px_14px_rgba(5,7,10,0.95)]"
            >
              {link.label}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-[1px] origin-left scale-x-0 bg-[var(--color-bronze)] transition-transform duration-300 group-hover:scale-x-100"
              />
            </a>
          ))}
        </nav>

        {/* Language Switcher (`VI | EN`), Replay Intro & Mobile Menu Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div
            role="group"
            aria-label={ui.nav.langSwitchAria}
            className="inline-flex items-center border border-[var(--border-bronze)] bg-[rgba(11,14,17,0.65)] p-0.5 font-mono text-[10px] tracking-[0.16em] uppercase backdrop-blur-md"
          >
            <button
              type="button"
              tabIndex={isIntroComplete ? 0 : -1}
              onClick={() => setLocale("en")}
              aria-pressed={locale === "en"}
              className={clsx(
                "cursor-pointer px-2 py-1 transition-colors",
                locale === "en"
                  ? "bg-[var(--color-bronze)] font-semibold text-[#080b0f]"
                  : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
              )}
            >
              EN
            </button>
            <button
              type="button"
              tabIndex={isIntroComplete ? 0 : -1}
              onClick={() => setLocale("vi")}
              aria-pressed={locale === "vi"}
              className={clsx(
                "cursor-pointer px-2 py-1 transition-colors",
                locale === "vi"
                  ? "bg-[var(--color-bronze)] font-semibold text-[#080b0f]"
                  : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
              )}
            >
              VI
            </button>
          </div>

          {webglSupported && (
            <button
              type="button"
              tabIndex={isIntroComplete ? 0 : -1}
              onClick={handleReplay}
              aria-label={ui.nav.replayIntro}
              className="hidden cursor-pointer items-center gap-2 border border-[var(--border-hairline-strong)] bg-[rgba(11,14,17,0.65)] px-3 py-1.5 font-mono text-[11px] tracking-[0.15em] whitespace-nowrap text-[var(--color-ink)] uppercase backdrop-blur-md transition-colors hover:border-[var(--border-bronze)] hover:text-[var(--color-bronze-bright)] sm:inline-flex"
            >
              <span aria-hidden="true" className="text-[var(--color-bronze)]">
                ↻
              </span>
              <span>{ui.nav.replayIntro}</span>
            </button>
          )}

          <button
            type="button"
            tabIndex={isIntroComplete ? 0 : -1}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center border border-[var(--border-hairline-strong)] bg-[rgba(11,14,17,0.65)] text-[var(--color-ink)] backdrop-blur-md lg:hidden"
          >
            <span className="font-mono text-xs">{mobileMenuOpen ? "✕" : "≡"}</span>
          </button>
        </div>
      </div>

      {mobileMenuOpen && isIntroComplete && (
        <nav
          id="mobile-nav-drawer"
          aria-label="Mobile navigation"
          className="border-t border-[var(--border-hairline)] bg-[rgba(13,17,23,0.96)] px-6 py-5 backdrop-blur-xl lg:hidden"
        >
          <ul className="flex flex-col gap-3.5">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 font-mono text-xs tracking-[0.2em] text-[var(--color-ink)] uppercase hover:text-[var(--color-bronze)]"
                >
                  {link.label}
                </a>
              </li>
            ))}
            {webglSupported && (
              <li className="border-t border-[var(--border-hairline)] pt-2">
                <button
                  type="button"
                  onClick={handleReplay}
                  className="inline-flex cursor-pointer items-center gap-2 font-mono text-xs tracking-[0.18em] text-[var(--color-bronze-bright)] uppercase"
                >
                  <span>↻</span>
                  <span>{ui.nav.replayIntro}</span>
                </button>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
