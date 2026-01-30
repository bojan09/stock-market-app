"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import SearchCommand from "./SearchCommand";
import UserDropdown from "./UserDropdown";

interface HeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

const Header = ({ user }: HeaderProps) => {
  const pathname = usePathname();

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
                  <SearchCommand
                    renderAs="text"
                    label={item.label}
                    userEmail={user.email}
                  />
                </div>
              );
            }

            return (
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
            );
          })}
        </nav>

        {/* CLEAN USER DROPDOWN */}
        <div className="flex items-center">
          <UserDropdown
            user={user}
            userEmail={user.email}
            initialStocks={[]} // SearchCommand now handles live fetching internally
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
