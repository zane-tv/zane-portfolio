"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIntroStore } from "@/store/introStore";

/**
 * Master Editorial Scroll, Desktop Inertial Smooth-Scroll & Kinetic Choreography Controller:
 * - Zero `getComputedStyle` wheel storms (fast geometry pre-check + `WeakMap` cache).
 * - Prioritized GSAP ticker (`gsap.ticker.add(tick, false, true)`) so `ScrollTrigger.update()`
 *   runs BEFORE scrub tweens in the exact same frame (zero 1-frame lag).
 * - Compositor-only `translate3d` / `scale` / `rotate` / `opacity` tweens (zero `top` reflow,
 *   zero `filter: drop-shadow` blur passes, zero `box-shadow` repaints).
 * - Automatic `[data-offscreen="true"]` IntersectionObserver pausing infinite CSS animations
 *   in offscreen sections.
 */
export function ScrollMotionController() {
  const reducedMotion = useIntroStore((s) => s.reducedMotion);

  // 0. Pause infinite CSS animations inside offscreen sections (`[data-offscreen="true"]`)
  useEffect(() => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") return;
    const sections = document.querySelectorAll<HTMLElement>("section#top, [data-scroll-section]");
    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.removeAttribute("data-offscreen");
          } else {
            entry.target.setAttribute("data-offscreen", "true");
          }
        }
      },
      { rootMargin: "160px 0px" }
    );

    sections.forEach((sec) => io.observe(sec));
    return () => io.disconnect();
  }, []);

  // 1. Desktop Light Inertial Smooth Scroll + Scroll-Velocity Kinetic Skew
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (reducedMotion || typeof window === "undefined") return;

    const desktopFinePointer = window.matchMedia("(pointer: fine) and (min-width: 1024px)").matches;
    const skewEntries = gsap.utils
      .toArray<HTMLElement>("[data-velocity-skew]")
      .map((el) => ({ el, section: el.closest("section, footer") }));

    const overflowScrollCache = new WeakMap<HTMLElement, boolean>();
    let maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    let targetY = window.scrollY;
    let currentY = targetY;
    let latestScrollY = targetY;
    let lastScrollY = targetY;
    let smoothSkew = 0;
    let isWheelSmoothing = false;

    const refreshMaxScroll = () => {
      maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    };

    const docRo =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(refreshMaxScroll) : null;
    docRo?.observe(document.documentElement);
    window.addEventListener("resize", refreshMaxScroll, { passive: true });

    const hasScrollableAncestor = (target: EventTarget | null, deltaY: number): boolean => {
      let node = target instanceof HTMLElement ? target : null;
      while (node && node !== document.body && node !== document.documentElement) {
        if (node.hasAttribute("data-lenis-prevent")) return true;
        // Fast layout-cached overflow check BEFORE ever calling getComputedStyle!
        const ch = node.clientHeight;
        if (ch > 0 && node.scrollHeight > ch + 1) {
          let canScrollY = overflowScrollCache.get(node);
          if (canScrollY === undefined) {
            const overflowY = window.getComputedStyle(node).overflowY;
            canScrollY =
              overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay";
            overflowScrollCache.set(node, canScrollY);
          }
          if (canScrollY) {
            if (deltaY > 0 && node.scrollTop + ch < node.scrollHeight - 1) return true;
            if (deltaY < 0 && node.scrollTop > 0) return true;
          }
        }
        node = node.parentElement;
      }
      return false;
    };

    const onWheel = (e: WheelEvent) => {
      if (!desktopFinePointer || e.ctrlKey || e.metaKey) return;
      if (hasScrollableAncestor(e.target, e.deltaY)) return;
      e.preventDefault();
      if (!isWheelSmoothing) {
        currentY = latestScrollY;
        targetY = latestScrollY;
        isWheelSmoothing = true;
      }
      const rawDelta =
        e.deltaMode === 1
          ? e.deltaY * 36
          : e.deltaMode === 2
            ? e.deltaY * window.innerHeight
            : e.deltaY;
      targetY = Math.max(0, Math.min(maxScroll, targetY + rawDelta * 0.92));
    };

    let prevReplayCount = useIntroStore.getState().replayCount;
    const unsubReplay = useIntroStore.subscribe((state) => {
      if (state.replayCount !== prevReplayCount) {
        prevReplayCount = state.replayCount;
        isWheelSmoothing = false;
        currentY = 0;
        targetY = 0;
        latestScrollY = 0;
        lastScrollY = 0;
        smoothSkew = 0;
        window.scrollTo({ top: 0, behavior: "instant" });
        ScrollTrigger.update();
      }
    });

    const onNativeScroll = () => {
      latestScrollY = window.scrollY;
      if (!isWheelSmoothing) {
        targetY = latestScrollY;
        currentY = latestScrollY;
      }
    };

    const onAnchorClick = (e: MouseEvent) => {
      if (!desktopFinePointer) return;
      const link = (e.target as HTMLElement | null)?.closest(
        "a[href^='#']"
      ) as HTMLAnchorElement | null;
      if (!link) return;
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;
      const destEl = hash === "#top" ? document.body : document.querySelector<HTMLElement>(hash);
      if (!destEl) return;

      e.preventDefault();
      refreshMaxScroll();
      const destTop =
        hash === "#top"
          ? 0
          : Math.max(0, destEl.getBoundingClientRect().top + latestScrollY - 72);
      currentY = latestScrollY;
      targetY = Math.min(maxScroll, destTop);
      isWheelSmoothing = true;
      window.history.pushState(null, "", hash);
    };

    const tick = () => {
      if (desktopFinePointer && isWheelSmoothing) {
        const diff = targetY - currentY;
        if (Math.abs(diff) > 0.35) {
          currentY += diff * 0.175;
          latestScrollY = currentY;
          window.scrollTo(0, currentY);
          ScrollTrigger.update();
        } else {
          currentY = targetY;
          latestScrollY = targetY;
          window.scrollTo(0, targetY);
          isWheelSmoothing = false;
          ScrollTrigger.update();
        }
      }

      const vel = latestScrollY - lastScrollY;
      lastScrollY = latestScrollY;

      if (Math.abs(vel) < 0.05 && smoothSkew === 0) {
        return;
      }

      const targetSkew = Math.max(-2.3, Math.min(2.3, vel * 0.048));
      smoothSkew += (targetSkew - smoothSkew) * 0.16;

      if (Math.abs(smoothSkew) > 0.02 || Math.abs(vel) > 0.1) {
        const skewStr = `skewY(${smoothSkew.toFixed(2)}deg)`;
        for (const entry of skewEntries) {
          if (entry.section?.hasAttribute("data-offscreen")) continue;
          entry.el.style.transform = skewStr;
        }
      } else if (smoothSkew !== 0) {
        smoothSkew = 0;
        for (const entry of skewEntries) {
          entry.el.style.transform = "skewY(0deg)";
        }
      }
    };

    if (desktopFinePointer) {
      window.addEventListener("wheel", onWheel, { passive: false });
      document.addEventListener("click", onAnchorClick);
    }
    window.addEventListener("scroll", onNativeScroll, { passive: true });
    // `prioritize = true` ensures `scrollTo` + `ScrollTrigger.update()` run BEFORE scrub tweens!
    gsap.ticker.add(tick, false, true);

    return () => {
      unsubReplay();
      docRo?.disconnect();
      window.removeEventListener("resize", refreshMaxScroll);
      if (desktopFinePointer) {
        window.removeEventListener("wheel", onWheel);
        document.removeEventListener("click", onAnchorClick);
      }
      window.removeEventListener("scroll", onNativeScroll);
      gsap.ticker.remove(tick);
      for (const entry of skewEntries) {
        entry.el.style.transform = "";
      }
    };
  }, [reducedMotion]);

  // 2. Per-Element Section Reveals, Optical Project Sheens, Parallax & Molten Journey Spark
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (reducedMotion) {
      gsap.set("[data-scroll-reveal]", { autoAlpha: 1, y: 0 });
      gsap.set("[data-bronze-sheen]", { autoAlpha: 0 });
      return;
    }

    const spineObservers: ResizeObserver[] = [];

    const ctx = gsap.context(() => {
      const revealItems = gsap.utils.toArray<HTMLElement>("[data-scroll-reveal]");
      revealItems.forEach((item) => {
        gsap.fromTo(
          item,
          { autoAlpha: 0, y: 22 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.62,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 92%",
              once: true,
            },
          }
        );
      });

      const viewports = gsap.utils.toArray<HTMLElement>("[data-project-viewport]");
      viewports.forEach((vp) => {
        const sheen = vp.querySelector<HTMLElement>("[data-bronze-sheen]");
        gsap.fromTo(
          vp,
          { clipPath: "inset(0% 100% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.95,
            ease: "expo.out",
            scrollTrigger: {
              trigger: vp,
              start: "top 94%",
              once: true,
            },
          }
        );

        if (sheen) {
          gsap.fromTo(
            sheen,
            { xPercent: -105, autoAlpha: 0.95 },
            {
              xPercent: 105,
              autoAlpha: 0,
              duration: 1.15,
              ease: "power2.out",
              scrollTrigger: {
                trigger: vp,
                start: "top 94%",
                once: true,
              },
            }
          );
        }
      });

      const parallaxYItems = gsap.utils.toArray<HTMLElement>("[data-parallax-y]");
      parallaxYItems.forEach((el) => {
        const speed = Number(el.dataset.parallaxY || "0.18");
        const range = speed * 180;
        gsap.fromTo(
          el,
          { y: -range },
          {
            y: range,
            ease: "none",
            scrollTrigger: {
              trigger: el.parentElement ?? el,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.65,
            },
          }
        );
      });

      const parallaxImages = gsap.utils.toArray<HTMLElement>("[data-parallax-img]");
      parallaxImages.forEach((imgWrap) => {
        gsap.fromTo(
          imgWrap,
          { yPercent: -8, scale: 1.12 },
          {
            yPercent: 8,
            scale: 1.12,
            ease: "none",
            scrollTrigger: {
              trigger: imgWrap.parentElement ?? imgWrap,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.7,
            },
          }
        );
      });

      const parallaxXItems = gsap.utils.toArray<HTMLElement>("[data-parallax-x]");
      parallaxXItems.forEach((el) => {
        const speed = Number(el.dataset.parallaxX || "1");
        gsap.fromTo(
          el,
          { xPercent: -6 * speed },
          {
            xPercent: 6 * speed,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.75,
            },
          }
        );
      });

      const ornaments = gsap.utils.toArray<HTMLElement>("[data-scroll-rotate]");
      ornaments.forEach((el) => {
        const dir = Number(el.dataset.scrollRotate || "1");
        gsap.to(el, {
          rotation: 180 * dir,
          ease: "none",
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.8,
          },
        });
      });

      // Compositor-only `translate3d` Molten Spark along Meridian Spine (zero `style.top` reflow!)
      const progressLines = gsap.utils.toArray<HTMLElement>("[data-timeline-progress]");
      progressLines.forEach((line) => {
        const parent = line.parentElement;
        if (!parent) return;
        const spark = parent.querySelector<HTMLElement>("[data-molten-spark]");
        let spineHeight = parent.clientHeight;
        let lastProgress = 0;

        const updateSparkTransform = (progress: number) => {
          lastProgress = progress;
          if (!spark) return;
          const yPx = progress * spineHeight;
          spark.style.transform = `translate3d(0, ${yPx.toFixed(1)}px, 0)`;
          spark.style.opacity = progress > 0.01 && progress < 0.995 ? "1" : "0.35";
        };

        if (typeof ResizeObserver !== "undefined") {
          const ro = new ResizeObserver(() => {
            spineHeight = parent.clientHeight;
            updateSparkTransform(lastProgress);
          });
          ro.observe(parent);
          spineObservers.push(ro);
        }

        gsap.fromTo(
          line,
          { scaleY: 0, transformOrigin: "top center" },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: parent,
              start: "top 72%",
              end: "bottom 62%",
              scrub: 0.3,
              onRefresh: () => {
                spineHeight = parent.clientHeight;
              },
              onUpdate: (self) => {
                updateSparkTransform(self.progress);
              },
            },
          }
        );
      });

      // Compositor-only Milestone Đông Sơn Seal & Node Ignition (zero `drop-shadow` / `box-shadow` repaints!)
      const milestones = gsap.utils.toArray<HTMLElement>("[data-journey-milestone]");
      milestones.forEach((ms) => {
        const seal = ms.querySelector<HTMLElement>("[data-milestone-seal]");
        const node = ms.querySelector<HTMLElement>("[data-milestone-node]");
        const nodeGlow = ms.querySelector<HTMLElement>("[data-milestone-node-glow]");

        if (seal) {
          gsap.fromTo(
            seal,
            { rotate: -95, scale: 0.72, opacity: 0.32 },
            {
              rotate: 0,
              scale: 1,
              opacity: 1,
              duration: 0.78,
              ease: "back.out(1.6)",
              scrollTrigger: {
                trigger: ms,
                start: "top 68%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }

        if (node) {
          gsap.fromTo(
            node,
            { scale: 0.85 },
            {
              scale: 1.18,
              duration: 0.5,
              ease: "power3.out",
              scrollTrigger: {
                trigger: ms,
                start: "top 68%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }

        if (nodeGlow) {
          gsap.fromTo(
            nodeGlow,
            { opacity: 0, scale: 0.7 },
            {
              opacity: 1,
              scale: 1,
              duration: 0.5,
              ease: "power3.out",
              scrollTrigger: {
                trigger: ms,
                start: "top 68%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }
      });

      const counters = gsap.utils.toArray<HTMLElement>("[data-count-to]");
      counters.forEach((el) => {
        const target = Number(el.dataset.countTo || "0");
        const proxy = { val: 0 };
        let lastText = "";
        gsap.to(proxy, {
          val: target,
          duration: 1.35,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 92%",
            once: true,
          },
          onUpdate: () => {
            const nextText = Math.round(proxy.val).toLocaleString("en-US");
            if (nextText !== lastText) {
              lastText = nextText;
              el.textContent = nextText;
            }
          },
        });
      });
    });

    return () => {
      spineObservers.forEach((ro) => ro.disconnect());
      ctx.revert();
    };
  }, [reducedMotion]);

  return null;
}
