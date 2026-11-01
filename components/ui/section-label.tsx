import type { ReactNode } from "react";

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#95a5ff]">
      {children}
    </div>
  );
}