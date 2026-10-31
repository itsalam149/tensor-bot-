import { Button } from "@/components/ui/button";
import { HelpCircle, Sparkles, X } from "lucide-react";

export function AssistantHeader() {
  return (
    <header className="border-b border-zinc-200/60 bg-white/70 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600">
            <Sparkles className="h-4 w-4" />
          </div>
          <h1 className="text-sm font-semibold tracking-tight text-zinc-950">
            Create Assistant
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" className="hidden h-8 px-4 text-xs font-medium text-zinc-600 hover:text-zinc-950 sm:inline-flex">
            Save draft
          </Button>

          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200/80 bg-white text-zinc-500 shadow-sm transition hover:bg-zinc-50 hover:text-zinc-950">
            <HelpCircle className="h-4 w-4" />
          </button>

          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200/80 bg-white text-zinc-500 shadow-sm transition hover:bg-zinc-50 hover:text-zinc-950">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}