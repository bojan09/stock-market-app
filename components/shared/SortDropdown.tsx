"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, ChevronDown } from "lucide-react";

export default function SortDropdown({
  defaultValue,
  basePath = "/news",
  options,
}: {
  defaultValue: string;
  basePath?: string;
  options?: { value: string; label: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sortOptions = options ?? [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
  ];

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    const value = e.target.value;

    if (value === sortOptions[0].value) {
      params.delete("sortBy");
    } else {
      params.set("sortBy", value);
    }

    // Using replace and scroll: false for a seamless update
    router.replace(`${basePath}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="relative flex items-center bg-[#0F1420] border border-white/5 rounded-xl px-3 py-2 hover:border-white/10 transition-all group">
      <ArrowUpDown
        size={14}
        className="text-gray-500 mr-2 group-hover:text-indigo-400 transition-colors"
      />

      <select
        value={defaultValue}
        onChange={handleSortChange}
        className="bg-transparent text-xs font-bold text-gray-300 focus:outline-none appearance-none cursor-pointer pr-6 z-10"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#0F1420] text-white">
            {opt.label}
          </option>
        ))}
      </select>

      <ChevronDown
        size={12}
        className="absolute right-3 text-gray-600 pointer-events-none group-hover:text-gray-400"
      />
    </div>
  );
}
