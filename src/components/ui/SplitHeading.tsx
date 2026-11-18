"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import clsx from "clsx";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIntroStore } from "@/store/introStore";

interface SplitHeadingProps {
  id?: string;
  text: string;
  className?: string;
}

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Genuine Editorial Split-Line Mask Heading (`Tiêu đề lớn mở mặt nạ từng dòng`):
 * - Measures real wrapped visual lines for the active viewport width & language (`EN` / `VI`).
 * - Wraps each visual line in its own diacritic-safe overflow mask (`pt/pb` compensated so
 *   Vietnamese stacked accents & descenders `g, p, y, ạ, ệ` never clip).
 * - Pairs seamlessly with `data-velocity-skew` on the outer `<h2>` for kinetic scroll skew.
 */
export function SplitHeading({ id, text, className }: SplitHeadingProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const linesWrapRef = useRef<HTMLSpanElement>(null);
  const hasRevealedRef = useRef(false);
  const lastAnimatedTextRef = useRef<string>(text);

  const [lines, setLines] = useState<string[] | null>(null);
  const reducedMotion = useIntroStore((s) => s.reducedMotion);

  const computeLines = useCallback(() => {
    const probe = measureRef.current;
    if (!probe) return;
    const wordSpans = Array.from(probe.querySelectorAll<HTMLSpanElement>("[data-word-probe]"));
    if (!wordSpans.length) {
      setLines([text]);
      return;
    }

    const grouped: string[][] = [];
    let currentTop: number | null = null;

    for (const span of wordSpans) {
      const top = span.offsetTop;
      const word = span.dataset.wordProbe ?? "";
      if (currentTop === null || Math.abs(top - currentTop) > 6) {
        grouped.push([word]);
        currentTop = top;
      } else {
        grouped[grouped.length - 1]!.push(word);
      }
    }

    const nextLines = grouped.map((words) => words.join(" ")).filter(Boolean);
    setLines((prev) => {
      if (
        prev &&
        prev.length === nextLines.length &&
        prev.every((line, idx) => line === nextLines[idx])
      ) {
        return prev;
      }
      return nextLines.length > 0 ? nextLines : [text];
    });
  }, [text]);

  useIsomorphicLayoutEffect(() => {
    computeLines();
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => computeLines()).catch(() => {});
    }
  }, [computeLines]);

  useEffect(() => {
    const el = headingRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    let lastWidth = el.clientWidth;
    let raf = 0;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? el.clientWidth;
      if (Math.abs(w - lastWidth) < 2) return;
      lastWidth = w;
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(() => computeLines());
    });
    ro.observe(el);
    return () => {
      window.cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [computeLines]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const headingEl = headingRef.current;
    const wrapEl = linesWrapRef.current;
    if (!headingEl || !wrapEl || !lines || lines.length === 0) return;

    const lineEls = wrapEl.querySelectorAll<HTMLElement>("[data-split-line]");
    if (!lineEls.length) return;

    if (reducedMotion) {
      hasRevealedRef.current = true;
      lastAnimatedTextRef.current = text;
      gsap.set(lineEls, { yPercent: 0, rotateZ: 0, autoAlpha: 1 });
      return;
    }

    // Case 1: Already revealed on screen and language toggled (`EN <-> VI`) -> crisp line shutter!
    if (hasRevealedRef.current) {
      if (lastAnimatedTextRef.current !== text) {
        lastAnimatedTextRef.current = text;
        const tween = gsap.fromTo(
          lineEls,
          { yPercent: 95, rotateZ: 0.9, autoAlpha: 0 },
          {
            yPercent: 0,
            rotateZ: 0,
            autoAlpha: 1,
            duration: 0.52,
            stagger: 0.065,
            ease: "power3.out",
          }
        );
        return () => {
          tween.kill();
        };
      }
      gsap.set(lineEls, { yPercent: 0, rotateZ: 0, autoAlpha: 1 });
      return;
    }

    // Case 2: Initial scroll-triggered Editorial Split-Line Mask reveal
    const ctx = gsap.context(() => {
      gsap.set(lineEls, { yPercent: 112, rotateZ: 1.25, autoAlpha: 0 });
      gsap.to(lineEls, {
        yPercent: 0,
        rotateZ: 0,
        autoAlpha: 1,
        duration: 0.88,
        stagger: 0.095,
        ease: "power4.out",
        scrollTrigger: {
          trigger: headingEl,
          start: "top 90%",
          once: true,
          onEnter: () => {
            hasRevealedRef.current = true;
            lastAnimatedTextRef.current = text;
          },
        },
      });
    }, headingEl);

    return () => {
      ctx.revert();
    };
  }, [lines, reducedMotion, text]);

  const words = text.trim().split(/\s+/);

  return (
    <h2
      id={id}
      ref={headingRef}
      data-split-heading
      data-velocity-skew
      className={clsx("relative will-change-transform", className)}
    >
      <span className="sr-only">{text}</span>

      {/* Hidden exact-width layout probe for responsive per-line word grouping */}
      <span
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute inset-x-0 top-0 block select-none"
      >
        {words.map((word, idx) => (
          <span key={`${word}-${idx}`}>
            <span data-word-probe={word} className="inline-block">
              {word}
            </span>
            {idx < words.length - 1 ? " " : ""}
          </span>
        ))}
      </span>

      {/* Visible per-line masked typography */}
      <span ref={linesWrapRef} aria-hidden="true" className="block">
        {(lines ?? [text]).map((line, idx) => (
          <span
            key={`${idx}-${line}`}
            className="block overflow-hidden pt-[0.08em] pb-[0.16em] -mt-[0.08em] -mb-[0.16em]"
          >
            <span data-split-line className="block origin-bottom-left">
              {line}
            </span>
          </span>
        ))}
      </span>
    </h2>
  );
}
