"use client";

import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import type { IntroPhase } from "@/types/portfolio";
import {
  introMotionState,
  resetIntroMotionChannels,
  snapIntroMotionChannelsToIdle,
  triggerDrumStrike,
  useIntroStore,
} from "@/store/introStore";
import { HERO_CAMERA_FOV, HERO_CAMERA_Z } from "./CameraRig";

interface IntroTimelineProps {
  heroSectionRef: React.RefObject<HTMLElement | null>;
  portraitSlotRef: React.RefObject<HTMLDivElement | null>;
  portraitDomWrapRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Single master GSAP timeline orchestrating all 7 cinematic phases:
 * `awakening → craneFlight → transformation → drumReveal → portraitReveal → heroAssembly → idle`
 *
 * Signature Storytelling:
 * The 3D Chim Lạc glides tangentially into the counter-clockwise Chim Lạc band of the
 * Đông Sơn bronze drum at matching angular velocity, melting seamlessly into Slot #0
 * and triggering full-page golden-patina drum-beat shockwave auras!
 */
export function IntroTimeline({
  heroSectionRef,
  portraitSlotRef,
  portraitDomWrapRef,
}: IntroTimelineProps) {
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const lastPhaseRef = useRef<IntroPhase>("awakening");

  const setPhase = useIntroStore((s) => s.setPhase);
  const setReducedMotion = useIntroStore((s) => s.setReducedMotion);
  const setIsMobileViewport = useIntroStore((s) => s.setIsMobileViewport);
  const setHeroInView = useIntroStore((s) => s.setHeroInView);
  const skipSignal = useIntroStore((s) => s.skipSignal);
  const replayCount = useIntroStore((s) => s.replayCount);
  const webglSupported = useIntroStore((s) => s.webglSupported);

  const emitPhase = useCallback(
    (next: IntroPhase) => {
      if (lastPhaseRef.current !== next) {
        lastPhaseRef.current = next;
        setPhase(next);
      }
    },
    [setPhase]
  );

  const measureTargets = useCallback(() => {
    const heroEl = heroSectionRef.current;
    const slotEl = portraitSlotRef.current;
    if (!heroEl || !slotEl) return;

    const canvasRect = heroEl.getBoundingClientRect();
    const slotRect = slotEl.getBoundingClientRect();
    if (canvasRect.width < 10 || canvasRect.height < 10) return;

    const vHeight = 2 * HERO_CAMERA_Z * Math.tan((HERO_CAMERA_FOV * Math.PI) / 360);
    const aspect = canvasRect.width / canvasRect.height;
    const vWidth = vHeight * aspect;

    const vpCenterX = window.innerWidth * 0.5;
    const vpCenterY = Math.min(window.innerHeight * 0.5, canvasRect.top + canvasRect.height * 0.48);
    const startNx = (vpCenterX - canvasRect.left) / canvasRect.width;
    const startNy = (vpCenterY - canvasRect.top) / canvasRect.height;

    const isMobile = window.innerWidth < 768;
    setIsMobileViewport(isMobile);

    introMotionState.startWorldX = (startNx - 0.5) * vWidth;
    introMotionState.startWorldY = clampNum((0.5 - startNy) * vHeight, -0.8, 0.8);
    introMotionState.startWorldRadius = isMobile
      ? Math.min(vWidth * 0.24, vHeight * 0.175)
      : Math.min(vWidth * 0.17, vHeight * 0.23);

    const slotCenterX = slotRect.left + slotRect.width * 0.5;
    const slotCenterY = slotRect.top + slotRect.height * 0.5;
    const targetNx = (slotCenterX - canvasRect.left) / canvasRect.width;
    const targetNy = (slotCenterY - canvasRect.top) / canvasRect.height;

    introMotionState.targetWorldX = (targetNx - 0.5) * vWidth;
    introMotionState.targetWorldY = (0.5 - targetNy) * vHeight;
    introMotionState.targetWorldRadius = ((slotRect.width * 0.5) / canvasRect.height) * vHeight;
    introMotionState.hasMeasuredTarget = true;
  }, [heroSectionRef, portraitSlotRef, setIsMobileViewport]);

  // Synchronize DOM portrait handoff & 3D pointer tilt at 60–120Hz
  useEffect(() => {
    const syncDomLayers = () => {
      const wrap = portraitDomWrapRef.current;
      if (wrap) {
        const alpha = webglSupported ? introMotionState.domHandoffAlpha : 1;
        wrap.style.opacity = alpha.toFixed(3);
        wrap.style.transform = `perspective(900px) rotateY(${(
          introMotionState.pointerSmoothX * 3.4
        ).toFixed(2)}deg) rotateX(${(-introMotionState.pointerSmoothY * 2.8).toFixed(2)}deg)`;
      }
    };
    gsap.ticker.add(syncDomLayers);
    return () => {
      gsap.ticker.remove(syncDomLayers);
    };
  }, [portraitDomWrapRef, webglSupported]);

  useEffect(() => {
    const heroEl = heroSectionRef.current;
    if (!heroEl || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setHeroInView(entry.isIntersecting);
      },
      { threshold: 0.02 }
    );
    io.observe(heroEl);
    return () => io.disconnect();
  }, [heroSectionRef, setHeroInView]);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      introMotionState.pointerTargetX = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      introMotionState.pointerTargetY = -((e.clientY / Math.max(1, window.innerHeight)) * 2 - 1);
    };
    const onScroll = () => {
      introMotionState.heroScrollProgress = clampNum(
        window.scrollY / Math.max(1, window.innerHeight),
        0,
        1.5
      );
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measureTargets, { passive: true });

    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => measureTargets()) : null;
    if (ro && heroSectionRef.current) ro.observe(heroSectionRef.current);
    if (ro && portraitSlotRef.current) ro.observe(portraitSlotRef.current);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measureTargets);
      ro?.disconnect();
    };
  }, [heroSectionRef, measureTargets, portraitSlotRef]);

  useEffect(() => {
    const heroEl = heroSectionRef.current;
    if (!heroEl) return;

    measureTargets();

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(prefersReduced);

    const revealItems = heroEl.querySelectorAll<HTMLElement>("[data-hero-reveal]");
    tlRef.current?.kill();

    if ((prefersReduced && replayCount === 0) || !webglSupported) {
      snapIntroMotionChannelsToIdle();
      gsap.set(revealItems, { autoAlpha: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" });
      emitPhase("idle");
      return;
    }

    resetIntroMotionChannels();
    emitPhase("awakening");

    gsap.set(revealItems, {
      autoAlpha: 0,
      y: 28,
      clipPath: "inset(0% 0% 100% 0%)",
    });

    const isMobile = window.innerWidth < 768;

    const tl = gsap.timeline({
      defaults: { overwrite: "auto" },
      onUpdate: () => {
        const t = tl.time();
        introMotionState.totalProgress = tl.progress();
        if (t < 0.72) emitPhase("awakening");
        else if (t < 2.75) emitPhase("craneFlight");
        else if (t < 4.15) emitPhase("transformation");
        else if (t < 5.15) emitPhase("drumReveal");
        else if (t < 6.45) emitPhase("portraitReveal");
        else if (tl.progress() < 0.995) emitPhase("heroAssembly");
      },
      onComplete: () => {
        snapIntroMotionChannelsToIdle();
        emitPhase("idle");
      },
    });

    if (isMobile) {
      tl.timeScale(1.28);
    }

    // ACT I — AWAKENING (0.0s -> 1.1s)
    tl.to(
      introMotionState,
      {
        awakeningLight: 1,
        ambientDustAlpha: 0.94,
        duration: 1.1,
        ease: "power2.out",
      },
      0
    );

    // ACT II — SOARING CHIM LẠC INTO VELOCITY-MATCHED DRUM SPIRAL (0.55s -> 3.65s)
    tl.to(
      introMotionState,
      {
        craneEnterAlpha: 1,
        duration: 0.55,
        ease: "sine.out",
      },
      0.55
    );

    tl.to(
      introMotionState,
      {
        craneFlightProgress: 1,
        duration: 3.1,
        ease: "sine.inOut",
      },
      0.55
    );

    // Drum engravings awaken gracefully around the orbiting Chim Lạc
    tl.to(
      introMotionState,
      {
        morphParticlesOpacity: 0.9,
        morphParticlesProgress: 1,
        duration: 1.65,
        ease: "sine.inOut",
      },
      2.25
    );

    tl.to(
      introMotionState,
      {
        drumRevealProgress: 1,
        duration: 1.6,
        ease: "sine.inOut",
      },
      2.35
    );

    // ACT III — SEAMLESS ORBITAL MELT INTO BIRD SLOT #0! (2.65s -> 4.15s)
    tl.to(
      introMotionState,
      {
        craneMergeProgress: 1,
        duration: 1.5,
        ease: "sine.inOut",
      },
      2.65
    );

    // DRUM BEAT #1: Chim Lạc Assimilation Shockwave + Full-Page Aura!
    tl.call(
      () => {
        triggerDrumStrike({ nx: 0.5, ny: 0.36, strength: 1.05, kind: "stamp" });
      },
      [],
      3.78
    );

    tl.to(
      introMotionState,
      {
        craneStampShockwave: 1,
        duration: 1.1,
        ease: "power2.out",
      },
      3.78
    );

    // DRUM BEAT #2: Central 14-Ray Đông Sơn Sun Resonance Strike + Full-Page Aura!
    tl.call(
      () => {
        triggerDrumStrike({ nx: 0.5, ny: 0.48, strength: 1.22, kind: "sun" });
      },
      [],
      4.42
    );

    tl.to(
      introMotionState,
      {
        drumPulse: 1,
        duration: 0.98,
        ease: "power2.out",
      },
      4.42
    );

    // ACT IV — ZANE'S PORTRAIT REVELATION INSIDE THE DRUM (5.00s -> 6.40s)
    tl.to(
      introMotionState,
      {
        drumHaloMorph: 1,
        portraitRevealProgress: 1,
        morphParticlesOpacity: 0.48,
        duration: 1.4,
        ease: "power2.inOut",
      },
      5.0
    );

    // ACT V — PORTRAIT FLIGHT TO RIGHT & HERO ASSEMBLY (6.38s -> 8.35s)
    tl.call(() => measureTargets(), [], 6.35);

    tl.to(
      introMotionState,
      {
        letterboxRetract: 1,
        portraitFlightProgress: 1,
        morphParticlesOpacity: 0.25,
        duration: 1.78,
        ease: "power3.inOut",
      },
      6.38
    );

    tl.to(
      revealItems,
      {
        autoAlpha: 1,
        y: 0,
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.92,
        stagger: 0.08,
        ease: "power3.out",
      },
      6.58
    );

    tl.to(
      introMotionState,
      {
        domHandoffAlpha: 1,
        heroUiProgress: 1,
        duration: 0.58,
        ease: "power2.inOut",
      },
      7.72
    );

    tlRef.current = tl;

    const safetyTimer = window.setTimeout(() => {
      if (tlRef.current && tlRef.current.progress() < 1) {
        tlRef.current.progress(1);
        snapIntroMotionChannelsToIdle();
        emitPhase("idle");
      }
    }, 12500);

    return () => {
      window.clearTimeout(safetyTimer);
      tl.kill();
    };
  }, [emitPhase, heroSectionRef, measureTargets, replayCount, setReducedMotion, webglSupported]);

  useEffect(() => {
    if (skipSignal === 0) return;
    measureTargets();
    if (tlRef.current) {
      tlRef.current.progress(1).pause();
    }
    const heroEl = heroSectionRef.current;
    if (heroEl) {
      const revealItems = heroEl.querySelectorAll<HTMLElement>("[data-hero-reveal]");
      gsap.set(revealItems, { autoAlpha: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" });
    }
    snapIntroMotionChannelsToIdle();
    emitPhase("idle");
  }, [emitPhase, heroSectionRef, measureTargets, skipSignal]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && lastPhaseRef.current !== "idle") {
        useIntroStore.getState().requestSkip();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}

function clampNum(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}
