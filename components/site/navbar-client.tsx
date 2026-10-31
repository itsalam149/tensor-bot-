"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { signOutAction } from "@/actions/auth";

const navItems = [
  { label: "Product", href: "/" },
  { label: "Platform", href: "/platform" },
  { label: "Use cases", href: "/use-cases" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
  { label: "Resources", href: "/resources" },
];

function getInitials(user: User) {
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email ??
    "U";

  return fullName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function NavbarClient({ user }: { user: User | null }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const activeHref = useMemo(() => pathname, [pathname]);

  return (
    <header className="sticky top-0 z-50">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-10">
        <div className="mt-4 rounded-full border border-white/60 bg-white/55 px-4 py-3 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-slate-950 text-[13px] font-semibold text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]">
                T
              </div>
              <span className="text-[15px] font-semibold tracking-[-0.02em] text-slate-950">
                Tensor-Bot
              </span>
            </Link>

            <nav className="hidden items-center gap-1 rounded-full border border-slate-200/70 bg-white/50 px-2 py-1 lg:flex">
              {navItems.map((item) => {
                const active = activeHref === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={[
                      "rounded-full px-4 py-2 text-[13px] font-medium transition",
                      active
                        ? "bg-slate-950 text-white shadow-[0_8px_18px_rgba(15,23,42,0.18)]"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-950",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              {!user ? (
                <>
                  <Link
                    href="/sign-in"
                    className="hidden h-10 items-center rounded-full px-4 text-[13px] font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 sm:inline-flex"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/sign-up"
                    className="inline-flex h-10 items-center rounded-full bg-slate-950 px-5 text-[13px] font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.22)] transition hover:-translate-y-0.5 hover:bg-slate-800"
                  >
                    Get started
                  </Link>
                </>
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex h-10 items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-2 pr-3 text-left shadow-[0_8px_22px_rgba(15,23,42,0.05)] transition hover:bg-white"
                  >
                    <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-slate-950 text-[11px] font-semibold text-white">
                      {user.user_metadata?.avatar_url ? (
                        <Image
                          src={user.user_metadata.avatar_url}
                          alt={user.email ?? "User avatar"}
                          width={28}
                          height={28}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        getInitials(user)
                      )}
                    </div>

                    <div className="hidden max-w-[140px] sm:block">
                      <div className="truncate text-[13px] font-semibold text-slate-900">
                        {user.user_metadata?.full_name ??
                          user.email ??
                          "Account"}
                      </div>
                      <div className="truncate text-[11px] text-slate-500">
                        {user.email}
                      </div>
                    </div>

                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  </button>

                  {userMenuOpen ? (
                    <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/95 p-2 shadow-[0_20px_60px_rgba(15,23,42,0.14)] backdrop-blur-2xl">
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 rounded-2xl px-3 py-3 text-[13px] font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>

                      <Link
                        href="/create"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 rounded-2xl px-3 py-3 text-[13px] font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                      >
                        <div className="h-4 w-4 rounded-full border border-slate-400" />
                        Create assistant
                      </Link>

                      <form action={signOutAction}>
                        <button
                          type="submit"
                          className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-[13px] font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </form>
                    </div>
                  ) : null}
                </div>
              )}

              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {mobileOpen ? (
            <div className="mt-3 rounded-[22px] border border-slate-200/80 bg-white/85 p-3 shadow-[0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur-2xl lg:hidden">
              <div className="grid gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-2xl px-4 py-3 text-[14px] font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                  >
                    {item.label}
                  </Link>
                ))}

                {!user ? (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Link
                      href="/sign-in"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-[14px] font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/sign-up"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-2xl bg-slate-950 px-4 py-3 text-center text-[14px] font-semibold text-white transition hover:bg-slate-800"
                    >
                      Get started
                    </Link>
                  </div>
                ) : (
                  <div className="mt-2 grid gap-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-2xl px-4 py-3 text-[14px] font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                    >
                      Dashboard
                    </Link>
                    <form action={signOutAction}>
                      <button
                        type="submit"
                        className="w-full rounded-2xl px-4 py-3 text-left text-[14px] font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                      >
                        Logout
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}