import { CircleDashed, Database, Globe, MessageSquare } from "lucide-react";
import { FloatingIcon } from "@/components/ui/floating-icon";

export function HeroFloatingIcons() {
  return (
    <>
      <FloatingIcon className="animate-float-1 left-[-12px] top-[24%] h-12 w-12">
        <CircleDashed className="h-5 w-5 text-[#8a97ff]" />
      </FloatingIcon>

      <FloatingIcon className="animate-float-2 right-[-8px] top-[14%] h-13 w-13">
        <Database className="h-5.5 w-5.5 text-[#8a97ff]" />
      </FloatingIcon>

      <FloatingIcon className="animate-float-3 left-[6%] bottom-[20%] h-11 w-11">
        <MessageSquare className="h-5 w-5 text-[#8a97ff]" />
      </FloatingIcon>

      <FloatingIcon className="animate-float-4 right-[11%] bottom-[27%] h-11 w-11">
        <Globe className="h-5 w-5 text-[#8a97ff]" />
      </FloatingIcon>
    </>
  );
}