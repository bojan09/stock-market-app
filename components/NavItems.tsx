"use client";

import { NAV_ITEMS } from "@/lib/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchCommand from "@/components/SearchCommand";
import { cn } from "@/lib/utils";

const NavItems = ({ userEmail }: any) => {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col sm:flex-row p-2 gap-3 sm:gap-10 font-medium items-center">
      {NAV_ITEMS.map(({ href, label }) => {
        // Exact match check to prevent "/" from highlighting everything
        // Use startsWith only for nested routes if needed, otherwise exact is cleaner
        const isActive =
          pathname === href || (href !== "/" && pathname.startsWith(href));

        if (href === "/search")
          return (
            <li key="search-trigger">
              <SearchCommand
                renderAs="text"
                label={label}
                userEmail={userEmail}
                className={cn(
                  "transition-colors hover:text-white cursor-pointer",
                  isActive ? "text-white" : "text-gray-400",
                )}
              />
            </li>
          );

        return (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                "transition-colors hover:text-white cursor-pointer",
                isActive ? "text-white" : "text-gray-400",
              )}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default NavItems;
