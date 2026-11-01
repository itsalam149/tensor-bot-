import {
  FileText,
  Database,
  Code,
  FileSpreadsheet,
  Globe,
  Layers,
  Lightbulb
} from "lucide-react";

function FormatItem({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-sm text-slate-700">{label}</div>
    </div>
  );
}

export function SourceInsightsPanel() {
  return (
    <section className="rounded-[30px] border border-slate-900/5 bg-white/80 p-4 shadow-[0_12px_40px_rgba(15,23,42,0.04)] backdrop-blur-xl sm:p-6">
      <div className="flex items-start gap-3">
        <Layers className="h-5 w-5 text-indigo-500" />
        <div>
          <h3 className="text-lg font-medium text-slate-950">Source insights</h3>
          <p className="mt-1 text-sm text-slate-500">Overview of your current knowledge base.</p>
        </div>
      </div>

      <div className="mt-5 divide-y divide-slate-100 rounded-[24px] border border-slate-200 bg-[#fbfbfd] px-5 py-2">
        <div className="flex items-center justify-between py-3">
          <div className="text-sm text-slate-600">Total sources</div>
          <div className="text-sm font-medium text-slate-950">5</div>
        </div>
        <div className="flex items-center justify-between py-3">
          <div className="text-sm text-slate-600">Total documents</div>
          <div className="text-sm font-medium text-slate-950">348</div>
        </div>
        <div className="flex items-center justify-between py-3">
          <div className="text-sm text-slate-600">Total chunks</div>
          <div className="text-sm font-medium text-slate-950">12,842</div>
        </div>
        <div className="flex items-center justify-between py-3">
          <div className="text-sm text-slate-600">Last updated</div>
          <div className="text-sm font-medium text-slate-950">2m ago</div>
        </div>
        <div className="flex items-center justify-between py-3">
          <div className="text-sm text-slate-600">Indexing status</div>
          <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Up to date
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-slate-950">Supported formats</h3>
        <p className="mt-1 text-xs text-slate-500">We support a wide range of formats.</p>

        <div className="mt-4 space-y-3">
          <FormatItem icon={FileText} label="PDF, DOCX, TXT, MD" />
          <FormatItem icon={FileSpreadsheet} label="CSV, XLSX" />
          <FormatItem icon={Globe} label="HTML, XML" />
          <FormatItem icon={Code} label="JSON" />
          <FormatItem icon={Database} label="And more..." />
        </div>
      </div>

      <div className="mt-6 rounded-[22px] border border-indigo-100 bg-indigo-50/50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <Lightbulb className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-indigo-900">Tip</div>
            <p className="mt-1 text-xs leading-5 text-indigo-700">
              Add high-quality, structured content for better and more accurate responses.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
