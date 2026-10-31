import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "ghost";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const styles: Record<Variant, string> = {
  default:
    "bg-slate-950 text-white hover:bg-slate-800 shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_12px_30px_rgba(15,23,42,0.08)]",
  secondary:
    "bg-white text-slate-950 border border-slate-200 hover:bg-slate-50 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_12px_30px_rgba(15,23,42,0.04)]",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100 border border-transparent",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400/40 disabled:pointer-events-none disabled:opacity-50",
          styles[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";