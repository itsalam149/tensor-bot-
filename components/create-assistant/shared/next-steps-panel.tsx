import {
  Check,
  FileText,
  Globe,
  Layers3,
  Search,
} from "lucide-react";

const steps = [
  {
    icon: Globe,
    label: "We&apos;ll crawl your website",
  },
  {
    icon: FileText,
    label: "Extract content and structure",
  },
  {
    icon: Layers3,
    label: "Index into knowledge base",
  },
  {
    icon: Search,
    label: "Make it searchable for your assistant",
  },
];

export function NextStepsPanel() {
  return (
    <section className="rounded-[30px] border border-slate-900/5 bg-white/80 p-4 shadow-[0_12px_40px_rgba(15,23,42,0.04)] backdrop-blur-xl sm:p-6">
      <h3 className="text-lg font-medium text-slate-950">What happens next?</h3>

      <div className="mt-5 space-y-4 px-1">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.label}
              className="flex items-center gap-4 text-[13px] text-slate-600"
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center text-slate-400">
                <Icon className="h-4 w-4" />
              </div>
              <div dangerouslySetInnerHTML={{ __html: step.label }} />
            </div>
          );
        })}
      </div>

    </section>
  );
}