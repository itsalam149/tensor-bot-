"use client";

import { Check } from "lucide-react";
import { useWizard } from "@/lib/wizard/wizard-context";

export function AssistantStepper({ currentStep: propStep }: { currentStep?: number }) {
  const wizard = useWizard();
  const currentStep = propStep ?? wizard.stepIndex + 1;
  const steps = [
    { no: 1, label: "Website", active: currentStep === 1, completed: currentStep > 1 },
    { no: 2, label: "Sources", active: currentStep === 2, completed: currentStep > 2 },
    { no: 3, label: "Live Data", active: currentStep === 3, completed: currentStep > 3 },
    { no: 4, label: "Branding", active: currentStep === 4, completed: currentStep > 4 },
    { no: 5, label: "Deploy", active: currentStep === 5, completed: currentStep > 5 },
  ];

  return (
    <div className="py-2">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {steps.map((step, index) => (
          <div key={step.label} className="flex flex-1 items-center gap-2 sm:gap-3">
            <div
              className={[
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors duration-300",
                step.active
                  ? "bg-zinc-950 text-white ring-4 ring-zinc-100"
                  : step.completed
                  ? "bg-zinc-950 text-white"
                  : "bg-zinc-100 text-zinc-400 border border-zinc-200/60",
              ].join(" ")}
            >
              {step.completed ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                step.no
              )}
            </div>
            <div
              className={[
                "text-xs font-medium tracking-tight hidden sm:block",
                step.active ? "text-zinc-950" : step.completed ? "text-zinc-950" : "text-zinc-400",
              ].join(" ")}
            >
              {step.label}
            </div>
            {index < steps.length - 1 && (
              <div 
                className={[
                  "h-px flex-1 transition-colors duration-300",
                  step.completed ? "bg-zinc-950" : "bg-zinc-200"
                ].join(" ")} 
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}