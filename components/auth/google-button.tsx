"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface GoogleButtonProps {
  label?: string;
  nextUrl?: string;
}

export function GoogleButton({
  label = "Continue with Google",
  nextUrl = "/dashboard",
}: GoogleButtonProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    try {
      setLoading(true);
      setErrorMessage(null);

      const supabase = createClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full space-y-2">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="group relative flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200/90 bg-white px-5 text-[14px] font-medium text-slate-800 shadow-[0_4px_16px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50/80 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <div className="flex items-center gap-2 text-slate-500">
            <svg
              className="h-5 w-5 animate-spin text-slate-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Connecting to Google...</span>
          </div>
        ) : (
          <>
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
              />
            </svg>
            <span className="font-semibold text-slate-800 group-hover:text-slate-950">
              {label}
            </span>
          </>
        )}
      </button>

      {errorMessage ? (
        <p className="text-center text-xs text-red-500">{errorMessage}</p>
      ) : null}
    </div>
  );
}
