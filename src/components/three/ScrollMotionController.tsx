"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIntroStore } from "@/store/introStore";

/**
 * Master Editorial Scroll, Desktop Inertial Smooth-Scroll & Kinetic Choreography Controller:
 * 1) Desktop Light Inertial Smooth Scroll synchronized with `ScrollTrigger.update()`
 *    (automatically disabled on mobile/touch & reduced-motion for natural touch scrolling).
 * 2) Editorial Split-Line Mask Reveals (`[data-split-heading]` / `[data-split-line]`) +
 *    Scroll-Velocity Kinetic Skew (`[data-velocity-skew]`).
 * 3) Bronze Curtain Shutter Reveal (`[data-bronze-curtain]`) on project showcase frames.
 * 4) Molten Bronze Spark Leading Tip (`[data-molten-spark]`) & Milestone Đông Sơn Seal
 *    Ignition/Rotation (`[data-journey-milestone]`) along the Journey meridian rail.
 * 5) Multi-layer depth parallax (`[data-parallax-y]`, `[data-parallax-x]`, `[data-parallax-img]`).
 */
export function ScrollMotionController() {
  const reducedMotion = useIntroStore((s) => s.reducedMotion);

  // 1. Desktop Light Inertial Smooth Scroll + Scroll-Velocity Kinetic Skew
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (reducedMotion || typeof window === "undefined") return;

    const desktopFinePointer = window.matchMedia("(pointer: fine) and (min-width: 1024px)").matches;
    const skewTargets = gsap.utils.toArray<HTMLElement>("[data-velocity-skew]");

    let targetY = window.scrollY;
    let currentY = window.scrollY;
    let lastScrollY = window.scrollY;
    let smoothSkew = 0;
    let isWheelSmoothing = false;

    const getMaxScroll = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const hasScrollableAncestor = (target: EventTarget | null, deltaY: number): boolean => {
      let node = target instanceof HTMLElement ? target : null;
      while (node && node !== document.body && node !== document.documentElement) {
        if (node.hasAttribute("data-lenis-prevent")) return true;
        const style = window.getComputedStyle(node);
        const overflowY = style.overflowY;
        if (
          (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") &&
          node.scrollHeight > node.clientHeight + 1
        ) {
          if (deltaY > 0 && node.scrollTop + node.clientHeight < node.scrollHeight - 1) return true;
          if (deltaY < 0 && node.scrollTop > 0) return true;
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
        currentY = window.scrollY;
        targetY = window.scrollY;
        isWheelSmoothing = true;
      }
      const rawDelta =
        e.deltaMode === 1 ? e.deltaY * 36 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
      targetY = Math.max(0, Math.min(getMaxScroll(), targetY + rawDelta * 0.92));
    };

    // Immediately cancel wheel inertia & snap scroll state to 0 whenever Replay Intro is triggered!
    let prevReplayCount = useIntroStore.getState().replayCount;
    const unsubReplay = useIntroStore.subscribe((state) => {
      if (state.replayCount !== prevReplayCount) {
        prevReplayCount = state.replayCount;
        isWheelSmoothing = false;
        currentY = 0;
        targetY = 0;
        lastScrollY = 0;
        smoothSkew = 0;
        window.scrollTo({ top: 0, behavior: "instant" });
        ScrollTrigger.update();
      }
    });

    const onNativeScroll = () => {
      // Sync target if user dragged scrollbar or used keyboard while wheel smoothing is idle
      if (!isWheelSmoothing) {
        targetY = window.scrollY;
        currentY = window.scrollY;
      }
    };

    const onAnchorClick = (e: MouseEvent) => {
      if (!desktopFinePointer) return;
      const link = (e.target as HTMLElement | null)?.closest("a[href^='#']") as HTMLAnchorElement | null;
      if (!link) return;
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;
      const destEl = hash === "#top" ? document.body : document.querySelector<HTMLElement>(hash);
      if (!destEl) return;

      e.preventDefault();
      const destTop =
        hash === "#top" ? 0 : Math.max(0, destEl.getBoundingClientRect().top + window.scrollY - 72);
      currentY = window.scrollY;
      targetY = Math.min(getMaxScroll(), destTop);
      isWheelSmoothing = true;
      window.history.pushState(null, "", hash);
    };

    const tick = () => {
      if (desktopFinePointer && isWheelSmoothing) {
        const diff = targetY - currentY;
        if (Math.abs(diff) > 0.35) {
          currentY += diff * 0.175; // Light, responsive inertia ("độ đầm nhẹ")
          window.scrollTo(0, currentY);
          ScrollTrigger.update();
        } else {
          currentY = targetY;
          window.scrollTo(0, targetY);
          isWheelSmoothing = false;
          ScrollTrigger.update();
        }
      }

      // Compute live scroll velocity for subtle Editorial Heading Kinetic Skew
      const liveY = window.scrollY;
      const vel = liveY - lastScrollY;
      lastScrollY = liveY;
      const targetSkew = Math.max(-2.3, Math.min(2.3, vel * 0.048));
      smoothSkew += (targetSkew - smoothSkew) * 0.16;

      if (Math.abs(smoothSkew) > 0.02 || Math.abs(vel) > 0.1) {
        const skewStr = `skewY(${smoothSkew.toFixed(2)}deg)`;
        for (const el of skewTargets) {
          el.style.transform = skewStr;
        }
      } else if (Math.abs(smoothSkew) <= 0.02 && smoothSkew !== 0) {
        smoothSkew = 0;
        for (const el of skewTargets) {
          el.style.transform = "skewY(0deg)";
        }
      }
    };

    if (desktopFinePointer) {
      window.addEventListener("wheel", onWheel, { passive: false });
      document.addEventListener("click", onAnchorClick);
    }
    window.addEventListener("scroll", onNativeScroll, { passive: true });
    gsap.ticker.add(tick);

    return () => {
      unsubReplay();
      if (desktopFinePointer) {
        window.removeEventListener("wheel", onWheel);
        document.removeEventListener("click", onAnchorClick);
      }
      window.removeEventListener("scroll", onNativeScroll);
      gsap.ticker.remove(tick);
      for (const el of skewTargets) {
        el.style.transform = "";
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

    const ctx = gsap.context(() => {
      // A. Individual Viewport-Triggered Editorial Element Entrances
      //    (Each element triggers right as IT enters the viewport — never hidden behind a tall section stagger!)
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

      // C. Sleek Optical Clip-Reveal & Translucent Champagne-Bronze Glass Sheen on Project Frames
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

      // D. Multi-Layer Vertical Depth Parallax (`[data-parallax-y]`)
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

      // E. Windowed Inner-Media Camera Parallax (`[data-parallax-img]`)
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

      // F. Horizontal Kinetic Heritage Ribbon Parallax (`[data-parallax-x]`)
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

      // G. Scroll-linked Đông Sơn ornament rotation
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

      // H. Progressive Molten-Bronze Meridian Spine + Leading Molten Spark (`[data-molten-spark]`)
      const progressLines = gsap.utils.toArray<HTMLElement>("[data-timeline-progress]");
      progressLines.forEach((line) => {
        const parent = line.parentElement;
        if (!parent) return;
        const spark = parent.querySelector<HTMLElement>("[data-molten-spark]");

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
              onUpdate: (self) => {
                if (spark) {
                  spark.style.top = `${(self.progress * 100).toFixed(2)}%`;
                  spark.style.opacity = self.progress > 0.01 && self.progress < 0.995 ? "1" : "0.35";
                }
              },
            },
          }
        );
      });

      // I. Milestone Đông Sơn Seal Ignition & Rotation Unlock when Molten Spark reaches each node!
      const milestones = gsap.utils.toArray<HTMLElement>("[data-journey-milestone]");
      milestones.forEach((ms) => {
        const seal = ms.querySelector<HTMLElement>("[data-milestone-seal]");
        const node = ms.querySelector<HTMLElement>("[data-milestone-node]");

        if (seal) {
          gsap.fromTo(
            seal,
            { rotate: -95, scale: 0.72, opacity: 0.32, filter: "brightness(0.7)" },
            {
              rotate: 0,
              scale: 1,
              opacity: 1,
              filter: "brightness(1.25) drop-shadow(0 0 14px rgba(231,185,128,0.65))",
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
            { scale: 0.85, boxShadow: "0 0 0px rgba(210,154,92,0)" },
            {
              scale: 1.18,
              boxShadow: "0 0 22px rgba(246,213,155,0.85)",
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

      // J. Animated Telemetry Numbers
      const counters = gsap.utils.toArray<HTMLElement>("[data-count-to]");
      counters.forEach((el) => {
        const target = Number(el.dataset.countTo || "0");
        const proxy = { val: 0 };
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
            el.textContent = Math.round(proxy.val).toLocaleString("en-US");
          },
        });
      });
    });

    return () => {
      ctx.revert();
    };
  }, [reducedMotion]);

  return null;
}
