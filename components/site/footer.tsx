import Link from "next/link";
import { Container } from "@/components/ui/container";

const socialLinks = [
  {
    label: "GitHub",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "X",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-slate-200/80 bg-white/40 pt-12 pb-8">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-slate-950 text-[13px] font-semibold text-white shadow-md">
                T
              </div>
              <span className="text-[16px] font-semibold tracking-[-0.02em] text-slate-950">
                Tensor-Bot
              </span>
            </Link>

            <p className="mt-4 max-w-[240px] text-[14px] leading-6 text-slate-500">
              AI chatbot infrastructure for business websites.
            </p>

            <div className="mt-5 flex gap-2">
              {socialLinks.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-950"
                >
                  {s.icon}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[13px] font-semibold text-slate-950">Product</div>
            <ul className="mt-4 space-y-2.5 text-[14px] text-slate-600">
              <li><Link href="/platform" className="transition hover:text-slate-950">Platform</Link></li>
              <li><Link href="/use-cases" className="transition hover:text-slate-950">Use cases</Link></li>
              <li><Link href="/pricing" className="transition hover:text-slate-950">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-[13px] font-semibold text-slate-950">Resources</div>
            <ul className="mt-4 space-y-2.5 text-[14px] text-slate-600">
              <li><Link href="/docs" className="transition hover:text-slate-950">Docs</Link></li>
              <li><Link href="/resources" className="transition hover:text-slate-950">Resources</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-[13px] font-semibold text-slate-950">Account</div>
            <ul className="mt-4 space-y-2.5 text-[14px] text-slate-600">
              <li><Link href="/sign-in" className="transition hover:text-slate-950">Sign in</Link></li>
              <li><Link href="/sign-up" className="transition hover:text-slate-950">Get started</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-[13px] font-semibold text-slate-950">Legal</div>
            <ul className="mt-4 space-y-2.5 text-[14px] text-slate-600">
              <li><span className="text-slate-500">Terms</span></li>
              <li><span className="text-slate-500">Privacy Policy</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200/60 pt-6 text-center text-[12px] text-slate-400">
          © 2025 Tensor-Bot. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}