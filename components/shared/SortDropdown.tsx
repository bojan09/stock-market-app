"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, ChevronDown } from "lucide-react";

export default function SortDropdown({
  defaultValue,
}: {
  defaultValue: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    const value = e.target.value;

    if (value === "newest") {
      params.delete("sortBy");
    } else {
      params.set("sortBy", value);
    }

    // Using replace and scroll: false for a seamless update
    router.replace(`/news?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="relative flex items-center bg-[#16191F] border border-white/5 rounded-xl px-3 py-2 hover:border-white/10 transition-all group">
      <ArrowUpDown
        size={14}
        className="text-gray-500 mr-2 group-hover:text-blue-400 transition-colors"
      />

      <select
        value={defaultValue}
        onChange={handleSortChange}
        className="bg-transparent text-xs font-bold text-gray-300 focus:outline-none appearance-none cursor-pointer pr-6 z-10"
      >
        <option value="newest" className="bg-[#16191F] text-white">
          Newest First
        </option>
        <option value="oldest" className="bg-[#16191F] text-white">
          Oldest First
        </option>
      </select>

      <ChevronDown
        size={12}
        className="absolute right-3 text-gray-600 pointer-events-none group-hover:text-gray-400"
      />
    </div>
  );
}
