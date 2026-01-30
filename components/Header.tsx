"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";

const Header = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-xl">
      <div className="max-w-[1600px] mx-auto flex h-16 items-center justify-between px-4 md:px-10">
        {/* LOGO AREA - Minimalist Design */}
        <Link
          href="/"
          className="flex items-center gap-3 transition-transform active:scale-95"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-indigo-500"
          >
            <path d="M3 3v18h18" />
            <path d="m19 9-5 5-4-4-3 3" />
          </svg>
          <span className="text-lg font-bold tracking-tighter hidden sm:block text-white">
            SIGNALIST
          </span>
        </Link>

        {/* NAVIGATION - Professional Spacing */}
        <nav className="hidden md:flex items-center gap-10">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-[13px] uppercase tracking-widest font-semibold transition-all hover:text-white",
                pathname === item.href ? "text-indigo-500" : "text-gray-500",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* RIGHT SIDE ACTIONS */}
        <div className="flex items-center gap-6">
          {/* Minimalist Search Icon */}
          <button className="text-gray-400 hover:text-white transition-colors">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>

          {/* User Profile - Clean Circle */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-b from-gray-700 to-gray-900 border border-white/10 shadow-inner cursor-pointer hover:border-indigo-500/50 transition-all" />
        </div>
      </div>
    </header>
  );
};

export default Header;
