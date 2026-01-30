import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { getPaginatedWatchlist } from "@/lib/actions/watchlist.actions";
import WatchlistCard from "@/components/shared/WatchlistCard";
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
  const limit = 5; // Reduced to 5 per page

  const { symbols, total } = await getPaginatedWatchlist(
    session.user.email,
    currentPage,
    limit,
  );
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-[#0F1115] text-white p-6 pb-24">
      <header className="mb-8 max-w-5xl mx-auto flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Watchlist</h1>
          <p className="text-gray-400 text-sm mt-1">{total} Assets Tracked</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto space-y-6">
        {symbols.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-4">
              {symbols.map((symbol) => (
                <WatchlistCard
                  key={symbol}
                  symbol={symbol}
                  userEmail={session.user.email}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-6">
                <Link
                  href={`/watchlist?page=${currentPage - 1}`}
                  className={cn(
                    "px-6 py-2 rounded-xl bg-[#1A1D23] border border-gray-800 text-sm font-medium transition-all hover:bg-[#23272F]",
                    currentPage <= 1 && "pointer-events-none opacity-30",
                  )}
                >
                  Previous
                </Link>

                <div className="text-sm text-gray-500 font-mono">
                  <span className="text-white font-bold">{currentPage}</span> /{" "}
                  {totalPages}
                </div>

                <Link
                  href={`/watchlist?page=${currentPage + 1}`}
                  className={cn(
                    "px-6 py-2 rounded-xl bg-[#1A1D23] border border-gray-800 text-sm font-medium transition-all hover:bg-[#23272F]",
                    currentPage >= totalPages &&
                      "pointer-events-none opacity-30",
                  )}
                >
                  Next
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-[#1A1D23] rounded-3xl border border-dashed border-gray-800 text-center">
            <p className="text-gray-400">
              Your list is empty. Start starring stocks in search!
            </p>
            <Link
              href="/search"
              className="mt-4 text-blue-400 hover:underline text-sm"
            >
              Go to Search
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
