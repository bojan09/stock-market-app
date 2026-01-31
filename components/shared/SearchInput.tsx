"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useDebounce } from "use-debounce";

export default function SearchInput({
  defaultValue = "",
}: {
  defaultValue?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [text, setText] = useState(defaultValue);
  const [query] = useDebounce(text, 500);

  // Use a ref to track if this is the first time the component loaded
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Avoid running the logic on the very first mount
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const currentQ = searchParams.get("q") || "";

    // ONLY update the router if the query has actually changed
    // This prevents the infinite update loop
    if (query !== currentQ) {
      const params = new URLSearchParams(searchParams.toString());

      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }

      // replace doesn't add to history; scroll: false prevents jumping
      router.replace(`/news?${params.toString()}`, { scroll: false });
    }
  }, [query, router, searchParams]);

  // Synchronize internal text state if the URL is cleared externally
  useEffect(() => {
    const currentParam = searchParams.get("q") || "";
    if (currentParam !== text && text === "") {
      setText(currentParam);
    }
  }, [searchParams]);

  return (
    <div className="relative group min-w-70">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Search
          size={14}
          className="text-gray-500 group-focus-within:text-blue-500 transition-colors"
        />
      </div>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Search headlines or keywords..."
        className="w-full bg-[#16191F] border border-white/5 rounded-xl py-2 pl-9 pr-9 text-xs font-medium focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-600 text-white"
      />
      {text && (
        <button
          onClick={() => setText("")}
          className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-white"
          type="button"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
