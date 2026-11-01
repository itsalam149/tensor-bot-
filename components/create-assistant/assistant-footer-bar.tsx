"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useWizard } from "@/lib/wizard/wizard-context";

interface AssistantFooterBarProps {
  currentStep?: number;
  onNext?: () => void;
  onBack?: () => void;
  isDeploying?: boolean;
}

export function AssistantFooterBar(props: AssistantFooterBarProps) {
  const wizard = useWizard();

  const currentStep = props.currentStep ?? wizard.stepIndex + 1;
  const onBack = props.onBack ?? wizard.goBack;
  const isDeploying = props.isDeploying ?? wizard.state.isFinalizing;
  const canContinue = wizard.canContinue;

  const handleNextClick = async () => {
    if (props.onNext) {
      props.onNext();
      return;
    }

    if (currentStep === 5) {
      await wizard.finalizeBot();
    } else {
      wizard.goNext();
    }
  };

  return (
    <div className="sticky bottom-0 border-t border-slate-900/5 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1160px] items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          {currentStep > 1 && (
            <Button variant="ghost" className="h-11 px-5 text-slate-600 rounded-xl" onClick={onBack} disabled={isDeploying}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <Button variant="secondary" className="h-11 px-5 text-slate-700 rounded-xl" disabled={isDeploying}>
            Save draft
          </Button>
          <Button 
            className="h-11 bg-slate-950 px-6 text-white hover:bg-slate-800 disabled:opacity-50 rounded-xl font-medium shadow-sm transition" 
            onClick={handleNextClick}
            disabled={isDeploying || (currentStep === 1 && !canContinue)}
          >
            {isDeploying ? (
              <>
                Deploying Assistant...
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              <>
                {currentStep === 5 ? "Deploy Assistant" : "Continue"}
                {currentStep !== 5 && <ArrowRight className="ml-2 h-4 w-4" />}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}