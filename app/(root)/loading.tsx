import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050810]/80 backdrop-blur-sm">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-16 w-16 animate-ping rounded-full border-2 border-indigo-500/20" />
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
      </div>
      <p className="mt-4 text-sm font-medium tracking-widest text-gray-400 uppercase animate-pulse">
        Fetching latest data...
      </p>
    </div>
  );
}
