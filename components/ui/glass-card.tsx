import type { ReactNode } from "react";

export function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`group rounded-[30px] border border-slate-200/80 bg-white/84 shadow-[0_18px_64px_rgba(15,23,42,0.055)] backdrop-blur-2xl ${className}`}
    >
      {children}
    </div>
  );
}