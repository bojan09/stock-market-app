"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import { SearchTrigger, SearchCommandDialog } from "./SearchCommand";
import UserDropdown from "./UserDropdown";

interface HeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  unreadNewsCount?: number;
}

const Header = ({ user, unreadNewsCount = 0 }: HeaderProps) => {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

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
          {NAV_ITEMS.map((item) => {
            const isSearch = item.label.toLowerCase() === "search";

            if (isSearch) {
              return (
                <div
                  key={item.href}
                  className="text-[13px] uppercase tracking-widest font-semibold text-gray-500 transition-all hover:text-white"
                >
                  <SearchTrigger
                    renderAs="text"
                    label={item.label}
                    onOpen={() => setSearchOpen(true)}
                  />
                </div>
              );
            }

            const isNews = item.href === "/news";

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative text-[13px] uppercase tracking-widest font-semibold transition-all hover:text-white",
                  pathname === item.href ? "text-indigo-500" : "text-gray-500",
                )}
              >
                {item.label}
                {isNews && unreadNewsCount > 0 && (
                  <span className="absolute -top-2 -right-3 flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-indigo-600 text-white text-[9px] font-black">
                    {unreadNewsCount > 99 ? "99+" : unreadNewsCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* USER DROPDOWN */}
        <div className="flex items-center">
          <UserDropdown
            user={user}
            userId={user.id}
            onOpenSearch={() => setSearchOpen(true)}
          />
        </div>
      </div>

      <SearchCommandDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        userId={user.id}
      />
    </header>
  );
};

export default Header;
