import type { ReactNode } from "react";

export function FloatingIcon({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`absolute flex items-center justify-center rounded-[18px] border border-white/80 bg-white/88 shadow-[0_10px_32px_rgba(125,145,255,0.18)] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}