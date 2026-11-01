import Image from "next/image";
import { Button } from "@/components/ui/button";
import { HelpCircle, X } from "lucide-react";

export function AssistantHeader() {
  return (
    <header className="border-b border-zinc-200/60 bg-white/70 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-950 shadow-xs ring-1 ring-white/10 overflow-hidden">
            <Image
              src="/logo.png"
              alt="Tensor-Bot AI Logo"
              width={18}
              height={18}
              className="object-contain filter drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]"
            />
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