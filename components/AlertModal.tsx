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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALERT_TYPE_OPTIONS } from "@/lib/constants";
import { createAlert } from "@/lib/actions/alert.actions";
import { toast } from "sonner";

interface AlertModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  symbol: string;
  company: string;
  userId: string;
  currentPrice?: number;
}

export default function AlertModal({
  open,
  setOpen,
  symbol,
  company,
  userId,
  currentPrice,
}: AlertModalProps) {
  const [alertType, setAlertType] = useState<"upper" | "lower">("upper");
  const [threshold, setThreshold] = useState(
    currentPrice ? currentPrice.toFixed(2) : "",
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const thresholdValue = parseFloat(threshold);

    if (!thresholdValue || thresholdValue <= 0) {
      toast.error("Enter a valid target price");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createAlert(userId, {
        symbol,
        company,
        alertName: `${symbol} ${alertType === "upper" ? "above" : "below"} $${thresholdValue.toFixed(2)}`,
        alertType,
        threshold: thresholdValue,
      });

      if (result.success) {
        toast.success(`Alert set for ${symbol}`);
        setOpen(false);
      } else {
        toast.error(result.error || "Failed to create alert");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-gray-800 border-white/10 text-gray-200">
        <DialogHeader>
          <DialogTitle className="text-white">
            Set price alert for {symbol}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-gray-500">
              Condition
            </label>
            <Select
              value={alertType}
              onValueChange={(v) => setAlertType(v as "upper" | "lower")}
            >
              <SelectTrigger className="w-full bg-gray-800 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-white/10 text-gray-200">
                {ALERT_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    Price goes {opt.label.toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-gray-500">
              Target price ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-md bg-gray-800 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
              {submitting ? "Saving..." : "Create Alert"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
