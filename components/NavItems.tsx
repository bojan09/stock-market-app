"use client";

import { NAV_ITEMS } from "@/lib/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchCommand from "@/components/SearchCommand";

const NavItems = ({ initialStocks, userEmail }: any) => {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col sm:flex-row p-2 gap-3 sm:gap-10 font-medium">
      {NAV_ITEMS.map(({ href, label }) => {
        if (href === "/search")
          return (
            <li key="search-trigger">
              <SearchCommand
                renderAs="text"
                label={label} // Passes "Search" from your constants
                initialStocks={initialStocks}
                userEmail={userEmail}
              />
            </li>
          );

        return (
          <li key={href}>
            <Link
              href={href}
              className={
                pathname.startsWith(href) ? "text-white" : "text-gray-400"
              }
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
