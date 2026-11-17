import { getGitHubTelemetry } from "@/lib/github";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { HeroSection, IntroSkipControl } from "@/components/sections/HeroSection";
import { ExpertiseSection } from "@/components/sections/ExpertiseSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { GitHubTelemetrySection } from "@/components/sections/GitHubTelemetrySection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { ScrollMotionController } from "@/components/three/ScrollMotionController";
import { DongSonCursor } from "@/components/ui/DongSonCursor";
import {
  KineticHeritageFrieze,
  ParallaxHeritageBackdrop,
} from "@/components/ui/ParallaxHeritageBackdrop";
import { LocaleHydrator } from "@/store/localeStore";

export default async function HomePage() {
  const githubTelemetry = await getGitHubTelemetry();

  return (
    <>
      <LocaleHydrator />
      <DongSonCursor />
      <ParallaxHeritageBackdrop />
      <SiteHeader />
      <IntroSkipControl />
      <ScrollMotionController />
      <div className="drum-shake-stage relative z-10">
        <main id="main-content">
          <HeroSection />
          <KineticHeritageFrieze />
          <ExpertiseSection />
          <ProjectsSection />
          <GitHubTelemetrySection data={githubTelemetry} />
          <ExperienceSection />
        </main>
        <ContactSection />
      </div>
    </>
  );
}
