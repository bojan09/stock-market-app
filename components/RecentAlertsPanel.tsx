import Link from "next/link";
import { Bell, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { getAlertsByUserId } from "@/lib/actions/alert.actions";

export default async function RecentAlertsPanel({ userId }: { userId: string }) {
  const alerts = await getAlertsByUserId(userId);
  const recent = alerts.slice(0, 5);

  if (recent.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Bell className="w-8 h-8 mb-3 text-gray-600" />
        <p className="text-sm text-gray-500 mb-4">
          No price alerts set yet.
        </p>
        <Link
          href="/watchlist"
          className="text-xs font-bold uppercase tracking-wide text-indigo-500 hover:text-indigo-400 transition-colors"
        >
          Set one from your watchlist
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {recent.map((alert) => (
        <Link
          key={alert.id}
          href={`/stocks/${alert.symbol.toLowerCase()}`}
          className="flex items-center gap-3 p-3 rounded-xl bg-gray-700/50 border border-gray-600/50 hover:border-indigo-500/30 transition-all"
        >
          {alert.alertType === "upper" ? (
            <ArrowUpCircle className="h-4 w-4 text-emerald-500 shrink-0" />
          ) : (
            <ArrowDownCircle className="h-4 w-4 text-rose-500 shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white truncate">
              {alert.symbol}
            </p>
            <p className="text-xs text-gray-500 truncate">
              Target ${alert.threshold.toFixed(2)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
