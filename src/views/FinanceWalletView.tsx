import { CreditCard, MinusCircle, PiggyBank, Plus, PlusCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { usePersistedState } from "../hooks/usePersistedState";
import { newId } from "../lib/id";
import type { FinanceTransaction } from "../types/hubFinance";
import type { Wallet } from "../types/hubFinance";
import { storageKey } from "../utils/storage";

const WALLETS_KEY = storageKey("finance.wallets");
const TX_KEY = storageKey("finance.transactions");
const DEFAULT_SEED_ID = "default-wallet";

function balanceFor(walletId: string, tx: FinanceTransaction[]): number {
  return tx.reduce((acc, t) => {
    if (t.walletId !== walletId) return acc;
    return t.kind === "income" ? acc + t.amount : acc - t.amount;
  }, 0);
}

export function FinanceWalletView() {
  const fmt = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }),
    [],
  );

  const [wallets, setWallets] = usePersistedState<Wallet[]>(WALLETS_KEY, []);
  const [transactions, setTransactions] = usePersistedState<FinanceTransaction[]>(TX_KEY, []);

  useEffect(() => {
    setWallets((curr) =>
      curr.length === 0 ? [{ id: DEFAULT_SEED_ID, name: "Main wallet" }] : curr,
    );
  }, [setWallets]);

  const [walletIdPick, setWalletIdPick] = useState(DEFAULT_SEED_ID);
  useEffect(() => {
    if (wallets.length === 0) return;
    if (!wallets.some((w) => w.id === walletIdPick)) {
      setWalletIdPick(wallets[0].id);
    }
  }, [wallets, walletIdPick]);

  const [newWalletName, setNewWalletName] = useState("");
  const [amountRaw, setAmountRaw] = useState("");
  const [descriptionRaw, setDescriptionRaw] = useState("");
  const [kind, setKind] = useState<"income" | "expense">("expense");
  const [formError, setFormError] = useState<string | null>(null);

  const totalBalance = wallets.reduce((sum, w) => sum + balanceFor(w.id, transactions), 0);

  const totalIncome = transactions
    .filter((t) => t.kind === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalSpent = transactions
    .filter((t) => t.kind === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const txsForPick = [...transactions].filter((t) => t.walletId === walletIdPick).sort((a, b) => {
    return new Date(b.at).getTime() - new Date(a.at).getTime();
  });

  function addWallet() {
    const name = newWalletName.trim();
    if (!name) return;
    const w: Wallet = { id: newId(), name };
    setWallets((prev) => [...prev, w]);
    setWalletIdPick(w.id);
    setNewWalletName("");
  }

  function removeWallet(id: string) {
    setTransactions((prev) => prev.filter((t) => t.walletId !== id));
    setWallets((prev) => {
      const next = prev.filter((w) => w.id !== id);
      return next.length === 0 ? [{ id: DEFAULT_SEED_ID, name: "Main wallet" }] : next;
    });
  }

  function saveTransaction() {
    setFormError(null);
    const desc = descriptionRaw.trim();
    if (!desc) {
      setFormError("Enter a description for this movement.");
      return;
    }
    const amt = Number.parseFloat(amountRaw);
    if (!Number.isFinite(amt) || amt <= 0) {
      setFormError("Enter a positive amount with numbers only.");
      return;
    }
    const targetId = wallets.find((w) => w.id === walletIdPick)?.id ?? wallets[0]?.id;
    if (!targetId) {
      setFormError("Create a wallet below before logging money.");
      return;
    }

    const row: FinanceTransaction = {
      id: newId(),
      walletId: targetId,
      kind,
      amount: Math.round(amt * 100) / 100,
      description: desc,
      at: new Date().toISOString(),
    };
    setTransactions((prev) => [row, ...prev]);
    setAmountRaw("");
    setDescriptionRaw("");
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">Finance & wallet</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Every control below writes to local storage—the inputs, toggles, and Save button are wired for
          real use.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-zinc-50 p-4 ring-1 ring-emerald-200 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-800">Total balance</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900 sm:text-3xl">{fmt.format(totalBalance)}</p>
          <p className="mt-1 text-xs text-zinc-500">
            Across {wallets.length} wallet{walletPlural(wallets)}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200 shadow-sm">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
            <PiggyBank className="size-3.5 text-emerald-600" aria-hidden />
            Income logged
          </p>
          <p className="mt-2 text-2xl font-semibold text-emerald-700">{fmt.format(totalIncome)}</p>
          <p className="mt-1 text-xs text-zinc-500">{transactions.filter((t) => t.kind === "income").length}{" "}
            transactions</p>
        </div>
        <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200 shadow-sm">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
            <MinusCircle className="size-3.5 text-orange-600" aria-hidden />
            Spending (sum)
          </p>
          <p className="mt-2 text-2xl font-semibold text-orange-600">{fmt.format(totalSpent)}</p>
          <p className="mt-1 text-xs text-zinc-500">{transactions.filter((t) => t.kind === "expense").length}{" "}
            transactions</p>
        </div>
      </div>

      <section className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 pb-4">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900">Wallets</h3>
            <p className="mt-1 text-sm text-zinc-600">
              Flip between cards/wallets — balances update from your saved ledger.
            </p>
          </div>
          <div className="flex w-full max-w-md flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
            <label className="min-w-[12rem] flex-1 space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                Active wallet
              </span>
              <select
                value={
                  wallets.some((w) => w.id === walletIdPick) ? walletIdPick : wallets[0]?.id ?? ""
                }
                onChange={(e) => setWalletIdPick(e.target.value)}
                disabled={wallets.length === 0}
                className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none shadow-sm transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/35 disabled:opacity-75"
              >
                {wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-1 items-end gap-2 sm:flex-none">
              <div className="rounded-lg bg-emerald-50 px-3 py-2 ring-1 ring-emerald-200">
                <p className="text-[10px] uppercase tracking-wide text-emerald-700">Balance here</p>
                <p className="font-semibold text-zinc-900">
                  {fmt.format(balanceFor(walletIdPick, transactions))}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <label className="flex min-w-[10rem] flex-1 gap-3 space-y-0">
            <div className="flex-1 space-y-1">
              <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <CreditCard className="size-3 text-zinc-400" aria-hidden /> New wallet name
              </span>
              <input
                value={newWalletName}
                onChange={(e) => setNewWalletName(e.target.value)}
                placeholder="e.g. Debit card"
                className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none shadow-sm transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/35"
              />
            </div>
          </label>
          <button
            type="button"
            onClick={addWallet}
            className="inline-flex items-center gap-2 self-end rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            <PlusCircle className="size-4" aria-hidden />
            Add wallet
          </button>
          <button
            type="button"
            onClick={() => {
              const id =
                wallets.find((w) => w.id === walletIdPick)?.id ?? wallets[wallets.length - 1]?.id;
              if (id) removeWallet(id);
            }}
            disabled={wallets.length === 1}
            title={wallets.length === 1 ? "Keep at least one wallet slot" : "Remove wallet and its ledger"}
            className="inline-flex items-center gap-2 self-end rounded-lg border border-zinc-200 px-5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:pointer-events-none disabled:opacity-35"
          >
            Remove wallet
          </button>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200 shadow-sm sm:p-6">
        <h3 className="text-lg font-semibold text-zinc-900">Log movement</h3>
        <p className="text-sm text-zinc-600">
          Pick income or expense with the buttons below, enter real numbers for amount, describe it, hit
          Save.
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr,minmax(0,320px)]">
          <div className="space-y-4">
            <fieldset className="space-y-2">
              <legend className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Type</legend>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setKind("income")}
                  className={
                    kind === "income"
                      ? "flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white sm:flex-none"
                      : "flex-1 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-emerald-700 ring-1 ring-zinc-300 shadow-sm hover:bg-zinc-50 sm:flex-none"
                  }
                >
                  Income
                </button>
                <button
                  type="button"
                  onClick={() => setKind("expense")}
                  className={
                    kind === "expense"
                      ? "flex-1 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white sm:flex-none"
                      : "flex-1 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-orange-700 ring-1 ring-zinc-300 shadow-sm hover:bg-zinc-50 sm:flex-none"
                  }
                >
                  Expense
                </button>
              </div>
            </fieldset>

            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Amount</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={amountRaw}
                onChange={(e) => setAmountRaw(e.target.value)}
                placeholder="45.89"
                className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none shadow-sm transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/35"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Description
              </span>
              <textarea
                value={descriptionRaw}
                onChange={(e) => setDescriptionRaw(e.target.value)}
                rows={4}
                placeholder="Groceries, paycheck, brunch…"
                className="block w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none shadow-sm transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/35"
              />
            </label>

            {formError ? (
              <p className="text-sm font-medium text-red-600" role="status">
                {formError}
              </p>
            ) : null}

            <button
              type="button"
              onClick={saveTransaction}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 active:translate-y-px"
            >
              Save
              <Plus className="size-4" aria-hidden />
            </button>
          </div>

          <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 shadow-inner">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-zinc-900">Ledger</h4>
              <span className="text-xs uppercase tracking-wide text-zinc-500">Newest first</span>
            </div>
            <div className="max-h-[22rem] space-y-2 overflow-y-auto pr-1">
              {txsForPick.length === 0 ? (
                <p className="rounded-lg border border-dashed border-zinc-300 bg-white px-3 py-6 text-center text-sm text-zinc-500 shadow-sm">
                  No saves yet — the list fills when you tap Save with valid fields.
                </p>
              ) : (
                txsForPick.map((t) => (
                  <article
                    key={t.id}
                    className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-zinc-900">{t.description}</p>
                        <p className="text-xs text-zinc-500">{formatWhen(t.at)}</p>
                      </div>
                      <span
                        className={[
                          "text-sm font-semibold",
                          t.kind === "income" ? "text-emerald-700" : "text-orange-600",
                        ].join(" ")}
                      >
                        {t.kind === "income" ? "+" : "-"}
                        {fmt.format(t.amount)}
                      </span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function formatWhen(at: string) {
  try {
    const d = new Date(at);
    return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  } catch {
    return at;
  }
}

function walletPlural(list: Wallet[]) {
  return list.length === 1 ? "" : "s";
}
