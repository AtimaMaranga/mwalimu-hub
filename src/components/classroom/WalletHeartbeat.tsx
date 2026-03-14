"use client";

import { useState, useEffect, useCallback } from "react";
import { Wallet, AlertTriangle } from "lucide-react";
import TopUpModal from "@/components/wallet/TopUpModal";

interface WalletHeartbeatProps {
  lessonId: string;
  initialBalance: number;
  ratePerMinute: number;
  onLessonEnded: () => void;
}

type WarningLevel = "none" | "yellow" | "orange" | "red";

export default function WalletHeartbeat({
  lessonId,
  initialBalance,
  ratePerMinute,
  onLessonEnded,
}: WalletHeartbeatProps) {
  const [balance, setBalance] = useState(initialBalance);
  const [totalCharged, setTotalCharged] = useState(0);
  const [showTopUp, setShowTopUp] = useState(false);
  const [warning, setWarning] = useState<WarningLevel>("none");

  const getWarningLevel = useCallback((bal: number): WarningLevel => {
    if (bal <= 0.5) return "red";
    if (bal <= 1) return "orange";
    if (bal <= 2) return "yellow";
    return "none";
  }, []);

  // Heartbeat every 60 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/lessons/${lessonId}/heartbeat`, {
          method: "PATCH",
        });
        const data = await res.json();

        if (data.ended) {
          onLessonEnded();
          return;
        }

        setBalance(data.balance);
        setTotalCharged(data.total_charged);
        setWarning(getWarningLevel(data.balance));
      } catch {
        // Network error — will retry next interval
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, [lessonId, onLessonEnded, getWarningLevel]);

  // Update warning on balance changes
  useEffect(() => {
    setWarning(getWarningLevel(balance));
  }, [balance, getWarningLevel]);

  const warningStyles = {
    none: "",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
    orange: "bg-orange-50 border-orange-200 text-orange-800",
    red: "bg-red-50 border-red-200 text-red-800",
  };

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Balance */}
        <div className="flex items-center gap-1.5 text-sm">
          <Wallet className="h-4 w-4 text-teal-500" />
          <span className={`font-bold ${balance <= 1 ? "text-red-600" : "text-slate-700"}`}>
            ${balance.toFixed(2)}
          </span>
        </div>

        {/* Rate */}
        <span className="text-xs text-slate-400">
          ${ratePerMinute.toFixed(2)}/min
        </span>

        {/* Total charged */}
        {totalCharged > 0 && (
          <span className="text-xs text-slate-400">
            Charged: ${totalCharged.toFixed(2)}
          </span>
        )}
      </div>

      {/* Warning banners */}
      {warning !== "none" && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium ${warningStyles[warning]}`}>
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {warning === "yellow" && "Balance is running low ($2.00 or less)"}
          {warning === "orange" && (
            <span className="flex items-center gap-2">
              Balance critically low ($1.00 or less)
              <button
                onClick={() => setShowTopUp(true)}
                className="underline font-bold hover:no-underline"
              >
                Top Up Now
              </button>
            </span>
          )}
          {warning === "red" && (
            <span className="flex items-center gap-2">
              Balance almost empty — lesson will end at $0.00
              <button
                onClick={() => setShowTopUp(true)}
                className="underline font-bold hover:no-underline"
              >
                Top Up Now
              </button>
            </span>
          )}
        </div>
      )}

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
