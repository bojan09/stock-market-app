export const dynamic = "force-dynamic";

import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { getPaginatedWatchlist } from "@/lib/actions/watchlist.actions";
import WatchlistCard from "@/components/shared/WatchlistCard";
import RefreshWatchlistButton from "@/components/shared/RefreshWatchlistButton";
import { redirect } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function WatchlistPage({ searchParams }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const limit = 5;

  // Updated to use session.user.id to match our new database logic
  const { symbols, total } = await getPaginatedWatchlist(
    session.user.id,
    currentPage,
    limit,
  );
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-[#0F1115] text-white px-4 sm:px-6 pt-6 pb-32">
      {/* Header with improved mobile stacking */}
      <header className="mb-10 max-w-5xl mx-auto flex flex-col gap-6 sm:flex-row sm:items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Watchlist
          </h1>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
            {total} Assets Tracked
          </p>
        </div>

        <div className="flex items-center gap-3">
          <RefreshWatchlistButton />
        </div>
      </header>

      <div className="max-w-5xl mx-auto">
        {symbols.length > 0 ? (
          <div className="flex flex-col gap-4">
            {/* The grid-cols-1 ensures cards take full width without squeezing */}
            <div className="grid grid-cols-1 gap-4 w-full">
              {symbols.map((symbol) => (
                <WatchlistCard
                  key={symbol}
                  symbol={symbol}
                  userId={session.user.id}
                />
              ))}
            </div>

            {/* Pagination Controls with better spacing */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-6 pt-10">
                <Link
                  href={`/watchlist?page=${currentPage - 1}`}
                  className={cn(
                    "px-5 py-2.5 rounded-xl bg-[#1A1D23] border border-white/5 text-sm font-semibold transition-all hover:bg-[#23272F] active:scale-95",
                    currentPage <= 1 && "pointer-events-none opacity-20",
                  )}
                >
                  Previous
                </Link>

                <div className="text-sm font-mono text-gray-500">
                  <span className="text-white">{currentPage}</span>
                  <span className="mx-1">/</span>
                  <span>{totalPages}</span>
                </div>

                <Link
                  href={`/watchlist?page=${currentPage + 1}`}
                  className={cn(
                    "px-5 py-2.5 rounded-xl bg-[#1A1D23] border border-white/5 text-sm font-semibold transition-all hover:bg-[#23272F] active:scale-95",
                    currentPage >= totalPages &&
                      "pointer-events-none opacity-20",
                  )}
                >
                  Next
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-[#14161B] rounded-[2rem] border border-white/5 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl text-gray-600">★</span>
            </div>
            <p className="text-gray-400 font-medium">
              Your watchlist is currently empty
            </p>
            <Link
              href="/"
              className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-sm font-bold transition-colors"
            >
              Discover Assets
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
