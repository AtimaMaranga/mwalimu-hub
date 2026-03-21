"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Banknote,
  ArrowDownCircle,
} from "lucide-react";

interface EarningSummary {
  total_earned: number;
  unpaid_balance: number;
  paid_amount: number;
  total_lessons: number;
}

interface Earning {
  id: string;
  amount: number;
  status: string;
  created_at: string;
}

interface Payout {
  id: string;
  amount: number;
  status: string;
  payout_period_start: string;
  payout_period_end: string;
  processed_at: string | null;
  created_at: string;
}

export default function TeacherEarnings() {
  const [summary, setSummary] = useState<EarningSummary | null>(null);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"earnings" | "payouts">("earnings");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/teacher/earnings");
        const data = await res.json();
        setSummary(data.summary);
        setEarnings(data.earnings ?? []);
        setPayouts(data.payouts ?? []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-8 text-center text-sm text-slate-400 dark:text-slate-500">
        Loading earnings...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          label="Total Earned"
          value={`$${(summary?.total_earned ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          icon={TrendingUp}
          iconBg="bg-emerald-50 dark:bg-emerald-950"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <SummaryCard
          label="Pending Payout"
          value={`$${(summary?.unpaid_balance ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          icon={Clock}
          iconBg="bg-amber-50 dark:bg-amber-950"
          iconColor="text-amber-600 dark:text-amber-400"
        />
        <SummaryCard
          label="Already Paid"
          value={`$${(summary?.paid_amount ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          icon={CheckCircle}
          iconBg="bg-blue-50 dark:bg-blue-950"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <SummaryCard
          label="Lessons Taught"
          value={summary?.total_lessons ?? 0}
          icon={DollarSign}
          iconBg="bg-violet-50 dark:bg-violet-950"
          iconColor="text-violet-600 dark:text-violet-400"
        />
      </div>

      {/* Payout schedule notice */}
      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-800 rounded-xl px-4 py-3 flex items-start gap-3">
        <Banknote className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Payout Schedule</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
            Payouts are processed automatically on the 2nd and 4th Friday of each month via M-Pesa or bank transfer.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 dark:border-slate-700">
          <button
            onClick={() => setTab("earnings")}
            className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${
              tab === "earnings"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            Earnings
          </button>
          <button
            onClick={() => setTab("payouts")}
            className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${
              tab === "payouts"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            Payouts
          </button>
        </div>

        {tab === "earnings" ? (
          earnings.length === 0 ? (
            <div className="py-12 text-center">
              <DollarSign className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No earnings yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Earnings appear after completed lessons</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-700">
              {earnings.map((e) => (
                <div key={e.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                    e.status === "paid" ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400" : "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400"
                  }`}>
                    {e.status === "paid" ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      Lesson earning
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(e.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      +${Number(e.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <p className={`text-xs font-medium ${
                      e.status === "paid" ? "text-emerald-500" : "text-amber-500"
                    }`}>
                      {e.status === "paid" ? "Paid" : "Pending"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : payouts.length === 0 ? (
          <div className="py-12 text-center">
            <ArrowDownCircle className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">No payouts yet</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Payouts are processed biweekly</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-700">
            {payouts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                  p.status === "completed"
                    ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                    : p.status === "failed"
                    ? "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400"
                    : "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400"
                }`}>
                  {p.status === "completed" ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Payout
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {p.payout_period_start} to {p.payout_period_end}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    ${Number(p.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <p className={`text-xs font-medium ${
                    p.status === "completed" ? "text-emerald-500" : p.status === "failed" ? "text-red-500" : "text-amber-500"
                  }`}>
                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label, value, icon: Icon, iconBg, iconColor,
}: {
  label: string; value: string | number; icon: any; iconBg: string; iconColor: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-4">
      <div className={`h-8 w-8 rounded-lg ${iconBg} flex items-center justify-center mb-3`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <p className="text-lg font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}
