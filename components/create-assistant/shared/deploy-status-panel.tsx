import { CheckCircle2, Circle } from "lucide-react";

export function DeployStatusPanel() {
  const steps = [
    { name: "Website Analyzed", description: "Crawled 24 pages from example.com", status: "complete" },
    { name: "Sources Added", description: "3 PDF documents indexed", status: "complete" },
    { name: "Live Data Connected", description: "Webhook listener active", status: "complete" },
    { name: "Branding Customized", description: "ACME Support Bot", status: "complete" },
    { name: "Deployment", description: "Ready to go live", status: "current" },
  ];

  return (
    <div className="flex flex-col rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.04)] sm:p-8">
      <div className="mb-6 border-b border-slate-100 pb-5">
        <h3 className="text-sm font-semibold text-slate-900">Pre-flight Checklist</h3>
        <p className="mt-1 text-xs text-slate-500">Ensure everything is ready before launch.</p>
      </div>

      <div className="relative">
        <div className="absolute left-3 top-2 bottom-6 w-px bg-slate-200" />
        <ul className="space-y-6">
          {steps.map((step, idx) => (
            <li key={idx} className="relative flex items-start gap-4">
              <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center bg-white">
                {step.status === "complete" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <Circle className="h-4 w-4 text-indigo-500 fill-indigo-50" />
                )}
              </div>
              <div className="pt-0.5">
                <p className={`text-sm font-medium ${step.status === "complete" ? "text-slate-900" : "text-indigo-600"}`}>
                  {step.name}
                </p>
                <p className="mt-0.5 text-[12px] text-slate-500">{step.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 rounded-2xl bg-emerald-50 p-4 border border-emerald-100">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-emerald-900">All systems go!</h4>
            <p className="mt-1 text-xs text-emerald-700 leading-relaxed">
              Your assistant has passed all internal checks. It is ready to be deployed and start talking to your users.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
