import { create } from "zustand";
import type { IntroPhase } from "@/types/portfolio";

export type DrumStrikeKind = "stamp" | "sun" | "heartbeat" | "manual";

export interface DrumStrikeEvent {
  /** Normalized viewport X (0..1); if omitted, auto-anchored to the active Đông Sơn drum focal point */
  nx?: number;
  /** Normalized viewport Y (0..1) */
  ny?: number;
  /** 0.2 .. 1.35 */
  strength?: number;
  kind?: DrumStrikeKind;
}

type DrumStrikeListener = (event: DrumStrikeEvent) => void;
const drumStrikeListeners = new Set<DrumStrikeListener>();

export function subscribeDrumStrikes(listener: DrumStrikeListener): () => void {
  drumStrikeListeners.add(listener);
  return () => {
    drumStrikeListeners.delete(listener);
  };
}

export function triggerDrumStrike(event: DrumStrikeEvent = {}): void {
  drumStrikeListeners.forEach((fn) => fn(event));
}

/**
 * High-frequency mutable animation channels driven by the single master GSAP timeline
 * and read at 60–120Hz inside R3F `useFrame` with zero React re-renders.
 */
export interface IntroMotionChannels {
  totalProgress: number;
  awakeningLight: number;
  ambientDustAlpha: number;
  craneEnterAlpha: number;
  craneFlightProgress: number;
  /** 0 -> 1 as the 3D Chim Lạc flattens into molten bronze and stamps into Bird Slot #0 at 12-o'clock */
  craneMergeProgress: number;
  /** 0 -> 1 shockwave originating from `(0, +1.31)` where the Chim Lạc merges into the drum */
  craneStampShockwave: number;
  morphParticlesProgress: number;
  morphParticlesOpacity: number;
  drumRevealProgress: number;
  drumPulse: number;
  drumHaloMorph: number;
  portraitRevealProgress: number;
  portraitFlightProgress: number;
  domHandoffAlpha: number;
  heroUiProgress: number;
  letterboxRetract: number;
  heroScrollProgress: number;

  // Synchronized global drum-beat resonance channels (0..1) shared between Full-Page Aura & 3D Drum
  globalDrumBeatWave: number;
  globalDrumBeatStrength: number;
  drumScreenNx: number;
  drumScreenNy: number;
  /** Live counter-clockwise rotation angle (radians) of the 16-bird Chim Lạc frieze on the drum */
  birdBandRotationZ: number;

  // Live pointer (-1..1) and smoothed pointer
  pointerTargetX: number;
  pointerTargetY: number;
  pointerSmoothX: number;
  pointerSmoothY: number;

  // Measured responsive coordinates in R3F z=0 world units
  startWorldX: number;
  startWorldY: number;
  startWorldRadius: number;
  targetWorldX: number;
  targetWorldY: number;
  targetWorldRadius: number;
  hasMeasuredTarget: boolean;
}

export const introMotionState: IntroMotionChannels = {
  totalProgress: 0,
  awakeningLight: 0,
  ambientDustAlpha: 0,
  craneEnterAlpha: 0,
  craneFlightProgress: 0,
  craneMergeProgress: 0,
  craneStampShockwave: 0,
  morphParticlesProgress: 0,
  morphParticlesOpacity: 0,
  drumRevealProgress: 0,
  drumPulse: 0,
  drumHaloMorph: 0,
  portraitRevealProgress: 0,
  portraitFlightProgress: 0,
  domHandoffAlpha: 0,
  heroUiProgress: 0,
  letterboxRetract: 0,
  heroScrollProgress: 0,

  globalDrumBeatWave: 0,
  globalDrumBeatStrength: 0,
  drumScreenNx: 0.5,
  drumScreenNy: 0.5,
  birdBandRotationZ: 0,

  pointerTargetX: 0,
  pointerTargetY: 0,
  pointerSmoothX: 0,
  pointerSmoothY: 0,

  startWorldX: 0,
  startWorldY: 0,
  startWorldRadius: 1.05,
  targetWorldX: 1.85,
  targetWorldY: 0,
  targetWorldRadius: 0.95,
  hasMeasuredTarget: false,
};

export function resetIntroMotionChannels(): void {
  introMotionState.totalProgress = 0;
  introMotionState.awakeningLight = 0;
  introMotionState.ambientDustAlpha = 0.18;
  introMotionState.craneEnterAlpha = 0;
  introMotionState.craneFlightProgress = 0;
  introMotionState.craneMergeProgress = 0;
  introMotionState.craneStampShockwave = 0;
  introMotionState.morphParticlesProgress = 0;
  introMotionState.morphParticlesOpacity = 0;
  introMotionState.drumRevealProgress = 0;
  introMotionState.drumPulse = 0;
  introMotionState.drumHaloMorph = 0;
  introMotionState.portraitRevealProgress = 0;
  introMotionState.portraitFlightProgress = 0;
  introMotionState.domHandoffAlpha = 0;
  introMotionState.heroUiProgress = 0;
  introMotionState.letterboxRetract = 0;
  introMotionState.globalDrumBeatWave = 0;
  introMotionState.globalDrumBeatStrength = 0;
  introMotionState.birdBandRotationZ = 0;
}

export function snapIntroMotionChannelsToIdle(): void {
  introMotionState.totalProgress = 1;
  introMotionState.awakeningLight = 1;
  introMotionState.ambientDustAlpha = 1;
  introMotionState.craneEnterAlpha = 0;
  introMotionState.craneFlightProgress = 1;
  introMotionState.craneMergeProgress = 1;
  introMotionState.craneStampShockwave = 1;
  introMotionState.morphParticlesProgress = 1;
  introMotionState.morphParticlesOpacity = 0.26;
  introMotionState.drumRevealProgress = 1;
  introMotionState.drumPulse = 1;
  introMotionState.drumHaloMorph = 1;
  introMotionState.portraitRevealProgress = 1;
  introMotionState.portraitFlightProgress = 1;
  introMotionState.domHandoffAlpha = 1;
  introMotionState.heroUiProgress = 1;
  introMotionState.letterboxRetract = 1;
}

interface IntroStoreState {
  phase: IntroPhase;
  isIntroComplete: boolean;
  reducedMotion: boolean;
  isMobileViewport: boolean;
  webglSupported: boolean;
  webglReady: boolean;
  webglContextLost: boolean;
  heroInView: boolean;
  replayCount: number;
  skipSignal: number;
  skippedAtReplayCount: number;

  setPhase: (phase: IntroPhase) => void;
  setReducedMotion: (reduced: boolean) => void;
  setIsMobileViewport: (isMobile: boolean) => void;
  setWebglSupported: (supported: boolean) => void;
  setWebglReady: (ready: boolean) => void;
  setWebglContextLost: (lost: boolean) => void;
  setHeroInView: (inView: boolean) => void;
  requestSkip: () => void;
  requestReplay: () => void;
}

export const useIntroStore = create<IntroStoreState>((set) => ({
  phase: "awakening",
  isIntroComplete: false,
  reducedMotion: false,
  isMobileViewport: false,
  webglSupported: true,
  webglReady: false,
  webglContextLost: false,
  heroInView: true,
  replayCount: 0,
  skipSignal: 0,
  skippedAtReplayCount: -1,

  setPhase: (phase) =>
    set({
      phase,
      isIntroComplete: phase === "idle",
    }),

  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setIsMobileViewport: (isMobileViewport) => set({ isMobileViewport }),
  setWebglSupported: (supported) => set({ webglSupported: supported }),
  setWebglReady: (ready) => set({ webglReady: ready }),
  setWebglContextLost: (lost) => set({ webglContextLost: lost }),
  setHeroInView: (inView) => set({ heroInView: inView }),

  requestSkip: () =>
    set((s) => ({
      skipSignal: s.skipSignal + 1,
      skippedAtReplayCount: s.replayCount,
      phase: "idle",
      isIntroComplete: true,
    })),

  requestReplay: () =>
    set((s) => ({
      replayCount: s.replayCount + 1,
      phase: "awakening",
      isIntroComplete: false,
    })),
}));
