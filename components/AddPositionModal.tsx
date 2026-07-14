"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { addPosition } from "@/lib/actions/portfolio.actions";
import { toast } from "sonner";

interface AddPositionModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  userId: string;
}

export default function AddPositionModal({
  open,
  setOpen,
  userId,
}: AddPositionModalProps) {
  const [symbol, setSymbol] = useState("");
  const [company, setCompany] = useState("");
  const [shares, setShares] = useState("");
  const [costBasis, setCostBasis] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setSymbol("");
    setCompany("");
    setShares("");
    setCostBasis("");
    setPurchaseDate("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sharesValue = parseFloat(shares);
    const costValue = parseFloat(costBasis);

    if (!symbol.trim()) {
      toast.error("Enter a ticker symbol");
      return;
    }
    if (!sharesValue || sharesValue <= 0) {
      toast.error("Enter a valid number of shares");
      return;
    }
    if (costValue == null || costValue < 0 || Number.isNaN(costValue)) {
      toast.error("Enter a valid cost basis per share");
      return;
    }

    setSubmitting(true);
    try {
      const result = await addPosition(userId, {
        symbol: symbol.trim(),
        company: company.trim() || symbol.trim().toUpperCase(),
        shares: sharesValue,
        costBasis: costValue,
        purchaseDate: purchaseDate || undefined,
      });

      if (result.success) {
        toast.success(`Added ${sharesValue} shares of ${symbol.toUpperCase()}`);
        resetForm();
        setOpen(false);
      } else {
        toast.error(result.error || "Failed to add position");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-gray-800 border-white/10 text-gray-200">
        <DialogHeader>
          <DialogTitle className="text-white">Add a holding</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-gray-500">
                Symbol
              </label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="AAPL"
                className="w-full rounded-md bg-gray-700 border border-white/10 px-3 py-2 text-sm text-white uppercase focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-gray-500">
                Company (optional)
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Apple Inc"
                className="w-full rounded-md bg-gray-700 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-gray-500">
                Shares
              </label>
              <input
                type="number"
                step="0.0001"
                min="0"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                placeholder="10"
                className="w-full rounded-md bg-gray-700 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-gray-500">
                Cost per share ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={costBasis}
                onChange={(e) => setCostBasis(e.target.value)}
                placeholder="150.00"
                className="w-full rounded-md bg-gray-700 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-gray-500">
              Purchase date (optional)
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full rounded-md bg-gray-700 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-gray-400"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              {submitting ? "Adding..." : "Add Holding"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
