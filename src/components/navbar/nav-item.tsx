"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  name: string;
  href: string;
  icon: LucideIcon;
  isActive: boolean;
}

export function NavItem({ name, href, icon: Icon, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-1 transition-all duration-500 ease-out rounded-2xl mx-1 my-2 relative group",
        isActive
          ? "text-white"
          : "text-[#5D4037] hover:text-[#4E342E] hover:bg-[#FFF3E0]/50"
      )}
    >
      {/* Active indicator background */}
      <div
        className={cn(
          "absolute inset-0 bg-[#FF7043] rounded-2xl shadow-lg -z-10 transition-all duration-500 ease-out",
          isActive ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
        style={{
          boxShadow:
            "0 8px 32px rgba(255, 112, 67, 0.3), 0 0 0 1px rgba(255, 112, 67, 0.1)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl transition-all duration-500"></div>
      </div>

      {/* Icon */}
      <div className="relative">
        <Icon
          className={cn(
            "w-6 h-6 transition-all duration-500 ease-out",
            isActive
              ? "scale-110 drop-shadow-lg text-white"
              : "group-hover:scale-105 group-hover:rotate-3 text-[#5D4037]"
          )}
        />
      </div>

      {/* Label */}
      <span
        className={cn(
          "text-xs font-medium transition-all duration-500 ease-out",
          isActive
            ? "text-white drop-shadow-sm scale-105"
            : "text-[#5D4037] group-hover:text-[#4E342E] group-hover:translate-y-[-1px] group-hover:scale-105"
        )}
      >
        {name}
      </span>

      {/* Hover effect */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl bg-[#FFF3E0]/30 transition-all duration-300 ease-out -z-10",
          isActive
            ? "opacity-0 scale-95"
            : "opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100"
        )}
      ></div>
    </Link>
  );
}
