"use client";

import { useEffect, useState } from "react";
import {
  getEconomicCalendar,
  getMockEconomicCalendar,
  EconomicEvent,
} from "@/lib/actions/market.actions";
import { CalendarDays, Filter, Info, FlaskConical } from "lucide-react";

export default function EconomicCalendar() {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [highImpactOnly, setHighImpactOnly] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const loadData = async (demo: boolean) => {
    setLoading(true);
    const data = demo
      ? await getMockEconomicCalendar()
      : await getEconomicCalendar();
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData(isDemoMode);
  }, [isDemoMode]);

  const isRateLimited = events.length === 1 && events[0].isRateLimited;
  const filteredEvents = highImpactOnly
    ? events.filter((e) => e.impact === "high")
    : events;

  if (loading)
    return (
      <div className="w-full h-64 bg-[#16191F] border border-white/5 rounded-2xl flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="bg-[#16191F] border border-white/5 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="text-blue-500" size={20} />
          <h2 className="font-bold text-lg tracking-tight text-white">
            Economic Calendar
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Demo Mode Toggle */}
          <button
            onClick={() => setIsDemoMode(!isDemoMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
              isDemoMode
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "bg-white/5 text-gray-500 border border-white/5"
            }`}
          >
            <FlaskConical size={12} />
            {isDemoMode ? "Demo ON" : "Demo OFF"}
          </button>

          {!isRateLimited && (
            <button
              onClick={() => setHighImpactOnly(!highImpactOnly)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                highImpactOnly
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : "bg-white/5 text-gray-400 border border-white/5"
              }`}
            >
              <Filter size={12} />
              {highImpactOnly ? "High Impact" : "All"}
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto custom-sidebar-scrollbar max-h-[400px]">
        {isRateLimited && !isDemoMode ? (
          <div className="px-6 py-20 text-center">
            <Info className="text-amber-500 mx-auto mb-4" size={24} />
            <h3 className="text-white font-bold text-sm">
              Provider Limit Reached
            </h3>
            <p className="text-gray-500 text-xs mt-2">
              Try turning on "Demo Mode" to see the UI.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] text-[10px] font-black text-gray-500 uppercase tracking-widest">
                <th className="px-6 py-4">Schedule</th>
                <th className="px-6 py-4">Region</th>
                <th className="px-6 py-4">Event</th>
                <th className="px-6 py-4 text-right">Actual</th>
                <th className="px-6 py-4 text-right">Forecast</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEvents.map((event, idx) => {
                const isBeat =
                  event.actual &&
                  event.forecast &&
                  event.actual > event.forecast;
                const isMiss =
                  event.actual &&
                  event.forecast &&
                  event.actual < event.forecast;
                return (
                  <tr
                    key={idx}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-white">
                        {new Date(event.time).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="w-5 h-5 rounded bg-white/5 flex items-center justify-center text-[10px] font-bold text-gray-400">
                        {event.country}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-gray-300 group-hover:text-blue-400">
                        {event.event}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 text-right text-xs font-black ${isBeat ? "text-emerald-500" : isMiss ? "text-rose-500" : "text-white"}`}
                    >
                      {event.actual ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-right text-xs font-bold text-gray-500">
                      {event.forecast ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
