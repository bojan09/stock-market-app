"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import AddPositionModal from "@/components/AddPositionModal";

export default function AddPositionButton({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all active:scale-95"
      >
        <Plus size={16} />
        Add Holding
      </button>

      <AddPositionModal open={open} setOpen={setOpen} userId={userId} />
    </>
  );
}
