export const dynamic = "force-dynamic";

import { getAuth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getPortfolioPositions } from "@/lib/actions/portfolio.actions";
import AddPositionButton from "@/components/shared/AddPositionButton";
import DeletePositionButton from "@/components/shared/DeletePositionButton";
import Link from "next/link";
import { Briefcase, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function PortfolioPage() {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const positions = await getPortfolioPositions(session.user.id);

  const totalMarketValue = positions.reduce((sum, p) => sum + p.marketValue, 0);
  const totalCost = positions.reduce((sum, p) => sum + p.costTotal, 0);
  const totalGainLoss = totalMarketValue - totalCost;
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
  const isPositive = totalGainLoss >= 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 sm:px-6 pt-6 pb-32">
      <header className="mb-8 max-w-5xl mx-auto flex flex-col gap-6 sm:flex-row sm:items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Portfolio
          </h1>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
            {positions.length} Holding{positions.length === 1 ? "" : "s"}
          </p>
        </div>

        <AddPositionButton userId={session.user.id} />
      </header>

      <div className="max-w-5xl mx-auto">
        {positions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800 border border-gray-600/50 rounded-2xl p-5">
              <p className="text-[11px] uppercase tracking-widest text-gray-500 font-bold mb-2">
                Market Value
              </p>
              <p className="text-2xl font-black text-white">
                ${totalMarketValue.toFixed(2)}
              </p>
            </div>
            <div className="bg-gray-800 border border-gray-600/50 rounded-2xl p-5">
              <p className="text-[11px] uppercase tracking-widest text-gray-500 font-bold mb-2">
                Cost Basis
              </p>
              <p className="text-2xl font-black text-white">
                ${totalCost.toFixed(2)}
              </p>
            </div>
            <div className="bg-gray-800 border border-gray-600/50 rounded-2xl p-5">
              <p className="text-[11px] uppercase tracking-widest text-gray-500 font-bold mb-2">
                Total Gain/Loss
              </p>
              <div className="flex items-center gap-2">
                {isPositive ? (
                  <TrendingUp size={18} className="text-emerald-500" />
                ) : (
                  <TrendingDown size={18} className="text-rose-500" />
                )}
                <p
                  className={cn(
                    "text-2xl font-black",
                    isPositive ? "text-emerald-500" : "text-rose-500",
                  )}
                >
                  {isPositive ? "+" : ""}
                  ${totalGainLoss.toFixed(2)} ({totalGainLossPercent.toFixed(2)}%)
                </p>
              </div>
            </div>
          </div>
        )}

        {positions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-gray-800 rounded-[2rem] border border-gray-600/50 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <Briefcase className="text-gray-600" size={28} />
            </div>
            <p className="text-gray-400 font-medium">
              No holdings tracked yet
            </p>
            <p className="text-gray-500 text-sm mt-1 max-w-sm">
              Add shares you own to track cost basis and gain/loss against
              live prices.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {positions.map((position) => {
              const isPositionPositive = position.gainLoss >= 0;
              return (
                <div
                  key={position.id}
                  className="flex items-center gap-2 sm:gap-4 w-full"
                >
                  <Link
                    href={`/stocks/${position.symbol.toLowerCase()}`}
                    className="flex-1 min-w-0"
                  >
                    <div className="flex items-center justify-between p-4 sm:p-5 bg-gray-800 hover:bg-gray-700 rounded-2xl border border-gray-600/50 transition-all duration-200">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div
                          className={cn(
                            "p-2.5 sm:p-3 rounded-xl shrink-0",
                            isPositionPositive
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-rose-500/10 text-rose-500",
                          )}
                        >
                          {isPositionPositive ? (
                            <TrendingUp size={20} />
                          ) : (
                            <TrendingDown size={20} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-base sm:text-lg text-white uppercase truncate">
                            {position.symbol}
                          </h3>
                          <p className="text-[10px] text-gray-500 font-medium truncate">
                            {position.shares} shares @ ${position.costBasis.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:gap-6 ml-2 shrink-0 text-right">
                        <div>
                          <p className="font-bold text-base sm:text-xl text-white tracking-tight">
                            ${position.marketValue.toFixed(2)}
                          </p>
                          <p
                            className={cn(
                              "text-xs sm:text-sm font-bold mt-0.5",
                              isPositionPositive ? "text-emerald-500" : "text-rose-500",
                            )}
                          >
                            {isPositionPositive ? "+" : ""}
                            ${position.gainLoss.toFixed(2)} (
                            {position.gainLossPercent.toFixed(2)}%)
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center justify-center shrink-0">
                    <DeletePositionButton
                      userId={session.user.id}
                      positionId={position.id}
                      symbol={position.symbol}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
