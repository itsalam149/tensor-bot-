import { Navbar } from "@/components/site/navbar";
import type { ReactNode } from "react";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <>      <main className="relative min-h-screen overflow-x-clip bg-[#f8faff] text-slate-900">   
        <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12%] top-[-18%] h-[640px] w-[640px] rounded-full bg-[radial-gradient(circle,rgba(129,151,255,0.26)_0%,rgba(129,151,255,0.12)_30%,rgba(255,255,255,0)_72%)] blur-3xl" />
        <div className="absolute right-[-10%] top-[8%] h-[700px] w-[700px] rounded-full bg-[radial-gradient(circle,rgba(156,172,255,0.18)_0%,rgba(156,172,255,0.08)_30%,rgba(255,255,255,0)_72%)] blur-3xl" />
        <div className="absolute bottom-[10%] left-[18%] h-[440px] w-[440px] rounded-full bg-[radial-gradient(circle,rgba(136,156,255,0.12)_0%,rgba(255,255,255,0)_72%)] blur-3xl" />
      </div>
   <Navbar />
  {children}
  </main></>;
}