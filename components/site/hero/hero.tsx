import { Container } from "@/components/ui/container";
import { HeroContent } from "./hero-content";
import { HeroChatPreview } from "./hero-chat-preview";
import { HeroFloatingIcons } from "./hero-floating-icons";

export function Hero() {
  return (
    <section className="relative z-10 min-h-[100dvh] flex items-center">
      <Container className="pb-16 pt-8 lg:pb-20 lg:pt-14">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <HeroContent />

          <div className="relative">
            <HeroFloatingIcons />
            <HeroChatPreview />
          </div>
        </div>
      </Container>
    </section>
  );
}