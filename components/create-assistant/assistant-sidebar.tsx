"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { signOutAction } from "@/actions/auth";
import type { User } from "@supabase/supabase-js";
import {
  BarChart3,
  Database,
  Bot,
  Crown,
  LogOut,
  Plug,
  Settings2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const getNavItems = (assistantId?: string) => [
  {
    label: "Create Assistant",
    description: "Build your AI assistant",
    icon: Bot,
    href: "/create",
  },
  {
    label: "My Assistants",
    description: "Manage your bots",
    icon: Database,
    href: "/dashboard",
  },
  {
    label: "Analytics",
    description: "Track usage and queries",
    icon: BarChart3,
    href: assistantId ? `/assistant/${assistantId}/analytics` : "/analytics",
  },
  {
    label: "Integrations",
    description: "Connect business data",
    icon: Plug,
    href: assistantId ? `/assistant/${assistantId}/integrations` : "/integrations",
  },
  {
    label: "Settings",
    description: "Workspace preferences",
    icon: Settings2,
    href: assistantId ? `/assistant/${assistantId}/settings` : "/settings",
  },
];

export function AssistantSidebar({ assistantId }: { assistantId?: string }) {
  const pathname = usePathname();
  const navItems = getNavItems(assistantId);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
      }
    });
  }, []);

  const displayName = user?.user_metadata?.full_name ?? user?.email ?? "User Account";
  const initials = displayName
    .split(" ")
    .map((p: string) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="hidden w-[260px] flex-col border-r border-zinc-200/60 bg-zinc-50/50 lg:flex">
      <div className="sticky top-0 flex h-screen flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 text-white shadow-sm ring-1 ring-zinc-950/10">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight text-zinc-950">Tensor-Bot</div>
            <div className="text-[11px] font-medium text-zinc-500">AI Infrastructure</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={[
                    "group flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                    active
                      ? "bg-white shadow-sm ring-1 ring-zinc-200 text-zinc-950"
                      : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-950",
                  ].join(" ")}
                >
                  <Icon className={["h-4 w-4 shrink-0 transition-colors", active ? "text-zinc-950" : "text-zinc-400 group-hover:text-zinc-600"].join(" ")} />
                  <span className="text-sm font-medium tracking-tight">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer Area */}
        <div className="mt-auto px-3 pb-4 space-y-2">
          {/* Pro Plan Card */}
          <div className="rounded-xl border border-zinc-200/60 bg-white p-3 shadow-sm transition hover:border-zinc-300/80">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                <Crown className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium tracking-tight text-zinc-950">Pro Plan</div>
                <p className="mt-0.5 text-[11px] leading-tight text-zinc-500">
                  Higher limits & advanced features.
                </p>
                <button onClick={() => toast.info('Redirecting to upgrade checkout...')} className="mt-2 text-xs font-medium text-zinc-900 hover:text-zinc-600 transition-colors flex items-center gap-1">
                  Upgrade <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          {/* User Profile */}
          <div className="rounded-xl border border-zinc-200/60 bg-white p-2.5 shadow-sm transition hover:border-zinc-300/80">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white font-semibold text-xs">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium tracking-tight text-zinc-950 truncate">
                  {displayName}
                </div>
                <div className="text-[11px] text-zinc-500 truncate">
                  {user?.email ?? "Signed in"}
                </div>
              </div>
              <form action={signOutAction}>
                <button type="submit" title="Sign out" className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-rose-50 hover:text-rose-600">
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}