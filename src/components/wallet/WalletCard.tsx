"use client";

import { useState, useEffect } from "react";
import { Wallet, Plus, CheckCircle } from "lucide-react";
import TopUpModal from "./TopUpModal";

export default function WalletCard() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchBalance = async () => {
    try {
      const res = await fetch("/api/wallet/balance");
      const data = await res.json();
      if (data.wallet) {
        setBalance(Number(data.wallet.balance));
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();

    // Check if returning from successful payment
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      setShowSuccess(true);
      // Remove the query param without reload
      const url = new URL(window.location.href);
      url.searchParams.delete("payment");
      window.history.replaceState({}, "", url.pathname);
      // Re-fetch balance after a short delay (webhook may still be processing)
      setTimeout(fetchBalance, 2000);
      setTimeout(fetchBalance, 5000);
      // Hide success message after 5s
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, []);

  return (
    <>
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Wallet className="h-4 w-4" />
            </div>
            <p className="text-sm font-semibold text-indigo-100">My Wallet</p>
          </div>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">KES</span>
        </div>

        {showSuccess && (
          <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-100 text-xs font-medium px-3 py-2 rounded-lg mb-3">
            <CheckCircle className="h-3.5 w-3.5" />
            Payment received! Balance updating...
          </div>
        )}

        <p className="text-3xl font-bold mb-1">
          {loading ? "—" : `KES ${(balance ?? 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`}
        </p>
        <p className="text-indigo-200 text-xs mb-4">Available balance</p>

        <button
          onClick={() => setShowTopUp(true)}
          className="w-full flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Funds
        </button>
      </div>

      {showTopUp && (
        <TopUpModal
          onClose={() => setShowTopUp(false)}
          onSuccess={(newBalance) => {
            setBalance(newBalance);
            setShowTopUp(false);
          }}
        />
      )}
    </>
  );
}
