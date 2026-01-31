"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { toggleSaveNews } from "@/lib/actions/savedNews.actions";
import { toast } from "sonner";

interface Props {
  userId: string;
  article: any;
  isInitialSaved: boolean;
}

export default function BookmarkButton({
  userId,
  article,
  isInitialSaved,
}: Props) {
  const [isSaved, setIsSaved] = useState(isInitialSaved);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent clicking the link underneath
    e.stopPropagation();

    setLoading(true);
    const result = await toggleSaveNews(userId, article);

    if (result.error) {
      toast.error("Could not save article");
    } else {
      setIsSaved(result.saved || false);
      toast.success(result.saved ? "Article Bookmarked" : "Bookmark Removed");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`p-2 rounded-lg transition-all border ${
        isSaved
          ? "bg-blue-600 border-blue-500 text-white"
          : "bg-[#0F1115]/80 border-white/10 text-gray-400 hover:text-white"
      }`}
    >
      <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
    </button>
  );
}
