"use client";

import { useId, useState, type FormEvent } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Pencil,
  X,
} from "lucide-react";
import type { Budget } from "@/models/budget";
import { summarizeBudget } from "@/lib/budget-summary";
import BudgetSummaryCard from "./BudgetSummaryCard";

type BudgetSummaryProps = {
  budget: Budget;
  onUpdateAccountBalance: (balance: number) => void;
};

function formatCurrency(value: number): string {
  return `${value.toFixed(2)} $`;
}

function AccountBalanceEditor({
  balance,
  isEstimated,
  onUpdate,
  compact = false,
}: {
  balance: number;
  isEstimated: boolean;
  onUpdate: (balance: number) => void;
  compact?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(String(balance));
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();

  function startEditing() {
    setValue(String(balance));
    setError(null);
    setIsEditing(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const balance = Number(value);
    if (value.trim() === "" || !Number.isFinite(balance)) {
      setError("Veuillez saisir un solde numérique valide.");
      return;
    }

    onUpdate(balance);
    setIsEditing(false);
    setError(null);
  }

  return isEditing ? (
    <div className={compact ? "w-full min-w-0" : "min-w-0"}>
      <form
        onSubmit={handleSubmit}
        className={`flex min-w-0 items-center gap-1${compact ? " w-full" : ""}`}
      >
        <label className="sr-only" htmlFor={inputId}>
          Nouveau solde du compte
        </label>
        <input
          id={inputId}
          type="number"
          step="any"
          autoFocus
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className={`${compact ? "w-16" : "w-28"} min-w-0 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-base font-semibold text-slate-100 focus:border-emerald-500 focus:outline-none`}
        />
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="submit"
            aria-label="Confirmer le solde"
            title="Confirmer"
            className="rounded-md p-1 text-emerald-400 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <Check aria-hidden="true" className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Annuler la modification du solde"
            title="Annuler"
            onClick={() => {
              setIsEditing(false);
              setValue(String(balance));
              setError(null);
            }}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </form>
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  ) : (
    <span
      className={`inline-flex min-w-0 items-center gap-1${compact ? " h-6 w-full" : ""}`}
    >
      <span
        className={
          compact
            ? "truncate text-base font-semibold leading-6 text-emerald-400"
            : "truncate text-2xl font-bold tracking-tight text-emerald-400"
        }
      >
        {formatCurrency(balance)}
      </span>
      <button
        type="button"
        aria-label={
          isEstimated ? "Confirmer ou corriger le solde" : "Modifier le solde actuel"
        }
        title={isEstimated ? "Confirmer ou corriger" : "Modifier le solde"}
        onClick={startEditing}
        className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <Pencil aria-hidden="true" className="h-4 w-4" />
      </button>
    </span>
  );
}

export default function BudgetSummary({
  budget,
  onUpdateAccountBalance,
}: BudgetSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const summary = summarizeBudget(budget);
  const initialBalance =
    typeof budget.initialBalance === "number" &&
    Number.isFinite(budget.initialBalance)
      ? budget.initialBalance
      : 0;
  const isEstimated =
    typeof budget.accountBalance !== "number" ||
    !Number.isFinite(budget.accountBalance);

  return (
    <section aria-label="Sommaire du budget" className="min-w-0">
      <div className="hidden gap-4 md:grid md:grid-cols-3">
        <BudgetSummaryCard
          title="Revenus (Reçu / Prévu)"
          icon={<ArrowUpRight aria-hidden="true" className="h-4 w-4 text-emerald-400" />}
          value={
            <>
              <span className="text-2xl font-bold tracking-tight text-emerald-400">
                {formatCurrency(summary.receivedIncome)}
              </span>
              <span className="text-sm text-slate-400">
                / {formatCurrency(summary.plannedIncome)}
              </span>
            </>
          }
          caption={`Solde initial en compte: ${formatCurrency(initialBalance)}`}
        />
        <BudgetSummaryCard
          title="Dépenses (Payé / Prévu)"
          icon={<ArrowDownRight aria-hidden="true" className="h-4 w-4 text-rose-400" />}
          value={
            <>
              <span className="text-2xl font-bold tracking-tight text-rose-400">
                {formatCurrency(summary.paidExpenses)}
              </span>
              <span className="text-sm text-slate-400">
                / {formatCurrency(summary.plannedExpenses)}
              </span>
            </>
          }
          caption={`Reste à payer: ${formatCurrency(summary.remainingToPay)}`}
        />
        <BudgetSummaryCard
          title="Solde Réel Actuel"
          value={
            <AccountBalanceEditor
              balance={summary.currentAccountBalance}
              isEstimated={isEstimated}
              onUpdate={onUpdateAccountBalance}
            />
          }
          caption={`Fin prévue: ${formatCurrency(summary.projectedEndingBalance)}${isEstimated ? " · Estimation à confirmer" : ""}`}
        />
      </div>

      <div className="md:hidden">
        <div className="grid min-w-0 grid-cols-2 gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="min-w-0">
            <p className="text-xs text-slate-400">Solde actuel</p>
            <div className="flex min-h-6 min-w-0 items-center">
              <AccountBalanceEditor
                balance={summary.currentAccountBalance}
                isEstimated={isEstimated}
                onUpdate={onUpdateAccountBalance}
                compact
              />
            </div>
            {isEstimated && (
              <p className="text-xs text-amber-300">Estimation à confirmer</p>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-400">Solde de fin prévue</p>
            <div className="flex min-h-6 min-w-0 items-center">
              <p className="truncate font-semibold leading-6 text-slate-100">
                {formatCurrency(summary.projectedEndingBalance)}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-expanded={isExpanded}
            aria-controls="budget-summary-details"
            onClick={() => setIsExpanded((expanded) => !expanded)}
            className="col-span-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            Détails du sommaire
          </button>
        </div>

        {isExpanded && (
          <div
            id="budget-summary-details"
            className="mt-3 space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-4"
          >
            <SummaryRow
              label="Revenus reçu / prévu"
              value={`${formatCurrency(summary.receivedIncome)} / ${formatCurrency(summary.plannedIncome)}`}
              detail={`Solde initial : ${formatCurrency(initialBalance)}`}
            />
            <SummaryRow
              label="Dépenses payé / prévu"
              value={`${formatCurrency(summary.paidExpenses)} / ${formatCurrency(summary.plannedExpenses)}`}
              detail={`Restant à payer : ${formatCurrency(summary.remainingToPay)}`}
            />
            <SummaryRow
              label="Solde actuel / fin prévue"
              value={`${formatCurrency(summary.currentAccountBalance)} / ${formatCurrency(summary.projectedEndingBalance)}`}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function SummaryRow({
  label,
  value,
  detail,
}: {
  label: string;
  value: React.ReactNode;
  detail?: string;
}) {
  return (
    <div className="min-w-0 border-b border-slate-800 pb-3 last:border-b-0">
      <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="text-sm text-slate-300">{label}</span>
        <span className="min-w-0 break-words text-right text-sm font-semibold text-slate-100">
          {value}
        </span>
      </div>
      {detail && <p className="mt-1 text-xs text-slate-400">{detail}</p>}
    </div>
  );
}
