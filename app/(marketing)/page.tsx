import { Hero } from "@/components/site/hero/hero";
import { LogoCloud } from "@/components/site/logo-cloud";
import { HowItWorks } from "@/components/site/how-it-works";
import { UseCases } from "@/components/site/use-cases";
import { Integrations } from "@/components/site/integrations";
import { CTASection } from "@/components/site/cta-section";
import { Footer } from "@/components/site/footer";

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8faff] text-slate-900">
      <Hero />
      <LogoCloud />
      <HowItWorks />
      <UseCases />
      <Integrations />
      <CTASection />
      <Footer />
    </main>
  );
}