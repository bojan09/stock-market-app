"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { toggleSaveNews } from "@/lib/actions/savedNews.actions";
import { toast } from "sonner";

interface Props {
  userId: string;
  article: any;
  isInitialSaved: boolean;
  onUnbookmark?: () => void;
}

export default function BookmarkButton({
  userId,
  article,
  isInitialSaved,
  onUnbookmark,
}: Props) {
  const [isSaved, setIsSaved] = useState(isInitialSaved);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    try {
      const result = await toggleSaveNews(userId, article);

      if (result.error) {
        toast.error("Could not save article");
      } else {
        const currentlySaved = result.saved || false;
        setIsSaved(currentlySaved);

        toast.success(
          currentlySaved ? "Article Bookmarked" : "Bookmark Removed",
        );

        // If the bookmark was removed, trigger the local UI update
        if (!currentlySaved && onUnbookmark) {
          onUnbookmark();
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      aria-label={isSaved ? "Remove bookmark" : "Bookmark article"}
      aria-pressed={isSaved}
      className={`p-2 rounded-lg transition-all border ${
        isSaved
          ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
          : "bg-gray-900/80 border-white/10 text-gray-400 hover:text-white"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <Bookmark
        size={16}
        fill={isSaved ? "currentColor" : "none"}
        className={loading ? "animate-pulse" : ""}
      />
    </button>
  );
}
