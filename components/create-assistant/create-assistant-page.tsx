"use client";

import { AssistantSidebar } from "@/components/create-assistant/assistant-sidebar";
import { AssistantHeader } from "@/components/create-assistant/assistant-header";
import { AssistantStepper } from "@/components/create-assistant/assistant-stepper";
import { AssistantFooterBar } from "@/components/create-assistant/assistant-footer-bar";

import { WebsiteStepPanel } from "@/components/create-assistant/steps/website-step-panel";
import { SourcesStepPanel } from "@/components/create-assistant/steps/sources-step-panel";
import { LiveDataStepPanel } from "@/components/create-assistant/steps/live-data-step-panel";
import { BrandingStepPanel } from "@/components/create-assistant/steps/branding-step-panel";
import { ReviewStepPanel } from "@/components/create-assistant/steps/review-step-panel";

import { WebsiteIntelligencePanel } from "@/components/create-assistant/shared/website-intelligence-panel";
import { NextStepsPanel } from "@/components/create-assistant/shared/next-steps-panel";

import { WizardProvider, useWizard } from "@/lib/wizard/wizard-context";

function StepContent() {
  const { state } = useWizard();

  switch (state.step) {
    case "website":
      return <WebsiteStepPanel />;

    case "sources":
      return <SourcesStepPanel />;

    case "live-data":
      return <LiveDataStepPanel />;

    case "branding":
      return <BrandingStepPanel />;

    case "review":
      return <ReviewStepPanel />;

    default:
      return null;
  }
}

function SidePanel() {
  const { state } = useWizard();

  if (state.step === "branding" || state.step === "review") {
    return null;
  }

  return (
    <div className="space-y-4">
      <WebsiteIntelligencePanel />
      <NextStepsPanel />
    </div>
  );
}

function WizardBody() {
  const { state } = useWizard();

  const isFullWidth =
    state.step === "branding" || state.step === "review";

  return (
    <main className="flex-1 px-4 pb-6 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1160px]">
        <AssistantStepper />

        <div
          className={
            isFullWidth
              ? "mt-4"
              : "mt-4 grid gap-4 xl:grid-cols-[1.35fr_0.95fr]"
          }
        >
          <StepContent />
          <SidePanel />
        </div>
      </div>
    </main>
  );
}

export function CreateAssistantPage() {
  return (
    <WizardProvider>
      <div className="min-h-screen bg-zinc-50 text-zinc-950 selection:bg-zinc-200">
        <div className="mx-auto grid min-h-screen lg:grid-cols-[260px_1fr]">
          <AssistantSidebar />

          <div className="flex min-w-0 flex-col">
            <AssistantHeader />
            <WizardBody />
            <AssistantFooterBar />
          </div>
        </div>
      </div>
    </WizardProvider>
  );
}
