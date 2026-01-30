"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";

interface HeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

const Header = ({ user }: HeaderProps) => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-xl">
      <div className="w-full flex h-16 items-center justify-between px-4 md:px-10">
        {/* LOGO AREA */}
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
          <span className="text-lg font-bold tracking-tighter hidden sm:block text-white uppercase">
            SIGNALIST
          </span>
        </Link>

        {/* NAVIGATION */}
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

        {/* USER PROFILE & DROPDOWN */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-9 h-9 rounded-full bg-gradient-to-b from-indigo-500 to-indigo-700 flex items-center justify-center border border-white/10 shadow-lg hover:ring-2 hover:ring-indigo-500/50 transition-all"
          >
            <span className="text-sm font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </button>

          {/* DROPDOWN MENU */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-white/10 bg-[#0f0f0f] p-2 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="px-3 py-2 border-b border-white/5 mb-1">
                <p className="text-xs font-bold text-white truncate">
                  {user.name}
                </p>
                <p className="text-[10px] text-gray-500 truncate">
                  {user.email}
                </p>
              </div>

              <Link
                href="/profile"
                className="block px-3 py-2 text-[13px] text-gray-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors"
              >
                View Profile
              </Link>
              <Link
                href="/profile/edit"
                className="block px-3 py-2 text-[13px] text-gray-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors"
              >
                Edit Profile
              </Link>
              <button
                onClick={() => {
                  /* Add your logout logic here */
                }}
                className="w-full text-left px-3 py-2 text-[13px] text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
