"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export default function ShareButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`
        p-2 rounded-full border transition-all duration-300 backdrop-blur-md
        ${
          copied
            ? "bg-emerald-500/20 border-emerald-500 text-emerald-500"
            : "bg-black/40 border-white/10 text-white hover:bg-white hover:text-black hover:border-white"
        }
      `}
      title="Copy link"
    >
      {copied ? <Check size={16} /> : <Share2 size={16} />}
    </button>
  );
}
