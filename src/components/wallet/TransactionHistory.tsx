"use client";

import { useState, useEffect } from "react";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  status: string;
  created_at: string;
}

const typeConfig: Record<string, { label: string; color: string; icon: typeof ArrowUpCircle }> = {
  top_up: { label: "Top Up", color: "text-emerald-600 bg-emerald-50", icon: ArrowUpCircle },
  lesson_charge: { label: "Lesson", color: "text-red-600 bg-red-50", icon: ArrowDownCircle },
  refund: { label: "Refund", color: "text-blue-600 bg-blue-50", icon: RefreshCw },
};

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const limit = 10;

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (filter) params.set("type", filter);
      const res = await fetch(`/api/wallet/transactions?${params}`);
      const data = await res.json();
      setTransactions(data.transactions ?? []);
      setTotal(data.total ?? 0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, filter]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50 dark:border-slate-700">
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">Transaction History</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{total} transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
            className="text-xs border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-300"
          >
            <option value="">All types</option>
            <option value="top_up">Top Ups</option>
            <option value="lesson_charge">Lessons</option>
            <option value="refund">Refunds</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-400 dark:text-slate-500">Loading...</div>
      ) : transactions.length === 0 ? (
        <div className="py-12 text-center">
          <Filter className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No transactions yet</p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-slate-50 dark:divide-slate-700">
            {transactions.map((tx) => {
              const config = typeConfig[tx.type] ?? typeConfig.lesson_charge;
              const Icon = config.icon;
              const isPositive = tx.amount > 0;
              return (
                <div key={tx.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                      {tx.description || config.label}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(tx.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <p className={`text-sm font-bold ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
                    {isPositive ? "+" : ""}${Math.abs(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-50 dark:border-slate-700">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </button>
              <span className="text-xs text-slate-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
