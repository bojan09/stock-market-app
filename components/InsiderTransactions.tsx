import React from "react";
import { User, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function InsiderTransactions({
  transactions,
}: {
  transactions: any[];
}) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-[#1A1D23] rounded-2xl border border-white/5 p-6 text-center">
        <p className="text-xs text-gray-500 italic">
          No recent insider activity reported.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1D23] rounded-2xl border border-white/5 overflow-hidden">
      <div className="p-4 border-b border-white/5 flex justify-between items-center">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <User className="w-4 h-4 text-blue-500" />
          Insider Activity
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-gray-500 uppercase font-black bg-white/5">
            <tr>
              <th className="p-4">Insider</th>
              <th className="p-4 text-right">Type</th>
              <th className="p-4 text-right">Shares</th>
              <th className="p-4 text-right">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {transactions.map((tx, i) => (
              <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4">
                  <div className="font-bold text-gray-200 uppercase truncate max-w-[120px]">
                    {tx.name.split(" ").slice(0, 2).join(" ")}
                  </div>
                  <div className="text-[10px] text-gray-500">{tx.date}</div>
                </td>
                <td className="p-4 text-right">
                  <span
                    className={`inline-flex items-center font-bold px-2 py-0.5 rounded ${
                      tx.isBuy
                        ? "text-green-400 bg-green-400/10"
                        : "text-red-400 bg-red-500/10"
                    }`}
                  >
                    {tx.isBuy ? (
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 mr-1" />
                    )}
                    {tx.isBuy ? "BUY" : "SELL"}
                  </span>
                </td>
                <td className="p-4 text-right font-medium text-gray-300">
                  {tx.change.toLocaleString()}
                </td>
                <td className="p-4 text-right font-bold text-gray-100">
                  ${tx.price > 0 ? tx.price.toFixed(2) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
