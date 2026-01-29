import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import WatchlistCard from "@/components/shared/WatchlistCard";
import { redirect } from "next/navigation";

export default async function WatchlistPage() {
  // BetterAuth session retrieval
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/sign-in");

  const userEmail = session.user.email;
  const symbols = await getWatchlistSymbolsByEmail(userEmail);

  return (
    <div className="min-h-screen bg-[#0F1115] text-white p-6 pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Watchlist</h1>
        <p className="text-gray-400 text-sm mt-1">
          {symbols.length} Assets Tracked
        </p>
      </header>

      {symbols.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {symbols.map((symbol: string) => (
            <WatchlistCard key={symbol} symbol={symbol} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-[#1A1D23] rounded-3xl border border-dashed border-gray-800">
          <p className="text-gray-400">
            Your list is empty. Start starring stocks in search!
          </p>
        </div>
      )}
    </div>
  );
}
