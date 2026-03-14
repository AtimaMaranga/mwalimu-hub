"use client";

import { useState, useEffect } from "react";
import { Wallet, Plus } from "lucide-react";
import TopUpModal from "./TopUpModal";

export default function WalletCard() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTopUp, setShowTopUp] = useState(false);

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
  }, []);

  return (
    <>
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-5 text-white shadow-lg shadow-teal-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Wallet className="h-4 w-4" />
            </div>
            <p className="text-sm font-semibold text-teal-100">My Wallet</p>
          </div>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">USD</span>
        </div>

        <p className="text-3xl font-bold mb-1">
          {loading ? "—" : `$${(balance ?? 0).toFixed(2)}`}
        </p>
        <p className="text-teal-200 text-xs mb-4">Available balance</p>

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
