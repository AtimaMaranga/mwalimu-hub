"use client";

import { useState } from "react";
import { X, CreditCard } from "lucide-react";

const PRESET_AMOUNTS = [5, 10, 25, 50];

interface TopUpModalProps {
  onClose: () => void;
  onSuccess: (newBalance: number) => void;
}

export default function TopUpModal({ onClose, onSuccess }: TopUpModalProps) {
  const [amount, setAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const effectiveAmount = isCustom ? Number(customAmount) || 0 : amount;

  const handleTopUp = async () => {
    if (effectiveAmount <= 0) {
      setError("Enter a valid amount");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/wallet/top-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: effectiveAmount }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Top-up failed");
        return;
      }

      onSuccess(data.balance);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Add Funds</h3>
            <p className="text-xs text-slate-400">Select or enter an amount</p>
          </div>
        </div>

        {/* Preset amounts */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {PRESET_AMOUNTS.map((preset) => (
            <button
              key={preset}
              onClick={() => { setAmount(preset); setIsCustom(false); }}
              className={`py-3 rounded-xl text-sm font-bold transition-all ${
                !isCustom && amount === preset
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              ${preset}
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <div className="mb-6">
          <button
            onClick={() => setIsCustom(true)}
            className={`text-sm font-medium mb-2 ${isCustom ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            Custom amount
          </button>
          {isCustom && (
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
              <input
                type="number"
                min="1"
                max="500"
                step="0.01"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                autoFocus
              />
            </div>
          )}
        </div>

        {error && (
          <p className="text-red-600 text-sm mb-4">{error}</p>
        )}

        <button
          onClick={handleTopUp}
          disabled={loading || effectiveAmount <= 0}
          className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Processing..." : `Add $${effectiveAmount.toFixed(2)}`}
        </button>

        <p className="text-xs text-slate-400 text-center mt-3">
          Mock payment — no real charge will be made.
        </p>
      </div>
    </div>
  );
}
