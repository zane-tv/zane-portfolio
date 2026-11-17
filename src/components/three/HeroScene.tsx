"use client";

import { CameraRig } from "./CameraRig";
import { CraneFlightController } from "./CraneFlightController";
import { PortraitTransition } from "./PortraitTransition";
import { SceneEnvironment } from "./SceneEnvironment";

export function HeroScene() {
  return (
    <>
      <SceneEnvironment />
      <CameraRig />
      <CraneFlightController />
      <PortraitTransition />
    </>
  );
}
