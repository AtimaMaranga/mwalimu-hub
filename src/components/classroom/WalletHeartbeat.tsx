"use client";

import { useState, useEffect, useCallback } from "react";
import { Wallet, AlertTriangle, Gift } from "lucide-react";
import TopUpModal from "@/components/wallet/TopUpModal";

const FREE_TRIAL_SECONDS = 600; // 10 minutes

interface WalletHeartbeatProps {
  lessonId: string;
  initialBalance: number;
  ratePerMinute: number;
  isFirstSession: boolean;
  lessonStartedAt: string;
  onLessonEnded: () => void;
}

type WarningLevel = "none" | "yellow" | "orange" | "red";

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function WalletHeartbeat({
  lessonId,
  initialBalance,
  ratePerMinute,
  isFirstSession,
  lessonStartedAt,
  onLessonEnded,
}: WalletHeartbeatProps) {
  const [balance, setBalance] = useState(initialBalance);
  const [totalCharged, setTotalCharged] = useState(0);
  const [showTopUp, setShowTopUp] = useState(false);
  const [warning, setWarning] = useState<WarningLevel>("none");
  const [freeSecondsLeft, setFreeSecondsLeft] = useState(() => {
    if (!isFirstSession) return 0;
    const elapsed = Math.floor((Date.now() - new Date(lessonStartedAt).getTime()) / 1000);
    return Math.max(0, FREE_TRIAL_SECONDS - elapsed);
  });
  const [trialEnded, setTrialEnded] = useState(!isFirstSession);

  const getWarningLevel = useCallback((bal: number): WarningLevel => {
    if (bal <= 0.5) return "red";
    if (bal <= 1) return "orange";
    if (bal <= 2) return "yellow";
    return "none";
  }, []);

  // Client-side countdown timer for free trial (ticks every second)
  useEffect(() => {
    if (!isFirstSession || freeSecondsLeft <= 0) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - new Date(lessonStartedAt).getTime()) / 1000);
      const remaining = Math.max(0, FREE_TRIAL_SECONDS - elapsed);
      setFreeSecondsLeft(remaining);
      if (remaining === 0) {
        setTrialEnded(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isFirstSession, lessonStartedAt, freeSecondsLeft]);

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

        if (data.free_seconds_remaining !== undefined) {
          setFreeSecondsLeft(data.free_seconds_remaining);
          if (data.free_seconds_remaining === 0 && isFirstSession) {
            setTrialEnded(true);
          }
        }
      } catch {
        // Network error — will retry next interval
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, [lessonId, onLessonEnded, getWarningLevel, isFirstSession]);

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
      {/* Free trial badge */}
      {isFirstSession && !trialEnded && freeSecondsLeft > 0 && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
          <Gift className="h-3.5 w-3.5 shrink-0" />
          Free trial — {formatCountdown(freeSecondsLeft)}
        </div>
      )}

      {/* Trial ended notice (shown briefly) */}
      {isFirstSession && trialEnded && totalCharged === 0 && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-700 text-slate-300 text-xs font-medium">
          Trial ended — billing started
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Balance */}
        <div className="flex items-center gap-1.5 text-sm">
          <Wallet className="h-4 w-4 text-indigo-500" />
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
      {warning !== "none" && trialEnded && (
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
