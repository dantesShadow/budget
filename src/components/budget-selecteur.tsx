"use client";

import { useEffect, useState } from "react";
import { Calendar, ChevronDown, Plus } from "lucide-react";
import type { Budget } from "@/models/budget";
import NewBudgetModal from "@/components/NewBudgetModal";

interface BudgetSelecteurProps {
  onBudgetChange?: (budget: Budget) => void;
}

function isBudgetList(value: unknown): value is Budget[] {
  return (
    Array.isArray(value) &&
    value.every(
      (budget) =>
        typeof budget === "object" &&
        budget !== null &&
        "id" in budget &&
        typeof budget.id === "string" &&
        "periodName" in budget &&
        typeof budget.periodName === "string"
    )
  );
}

export default function BudgetSelecteur({
  onBudgetChange,
}: BudgetSelecteurProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedBudgetId, setSelectedBudgetId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function loadBudgets() {
      try {
        const response = await fetch("/api/budgets");
        if (!response.ok) {
          throw new Error(`Le chargement des budgets a échoué (${response.status}).`);
        }

        const data: unknown = await response.json();
        if (!isBudgetList(data)) {
          throw new Error("La réponse de l’API des budgets est invalide.");
        }

        if (isCurrent) {
          setBudgets(data);
          setSelectedBudgetId(data[0]?.id ?? "");
          onBudgetChange?.(data[0]);
        }
      } catch (error) {
        if (isCurrent) {
          setError(
            error instanceof Error
              ? error.message
              : "Une erreur est survenue lors du chargement des budgets."
          );
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    void loadBudgets();

    return () => {
      isCurrent = false;
    };
  }, [onBudgetChange]);

  function handleBudgetChange(budgetId: string) {
    setSelectedBudgetId(budgetId);
    onBudgetChange?.(
      budgets.find((budget) => budget.id === budgetId) ?? budgets[0]
    );
  }

  function handleBudgetCreated(budget: Budget) {
    setBudgets((currentBudgets) => [...currentBudgets, budget]);
    setSelectedBudgetId(budget.id);
    onBudgetChange?.(budget);
    setIsModalOpen(false);
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="relative flex-1 sm:flex-none">
            <select
              value={selectedBudgetId}
              onChange={(event) => handleBudgetChange(event.target.value)}
              disabled={isLoading || budgets.length === 0}
              className="w-full sm:w-64 appearance-none bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 cursor-pointer pr-10 focus:outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {budgets.length === 0 && (
                <option value="">
                  {isLoading ? "Chargement des budgets..." : "Aucun budget disponible"}
                </option>
              )}
              {budgets.map((budget) => (
                <option key={budget.id} value={budget.id}>
                  {budget.periodName}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition shadow-lg shadow-emerald-900/30"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Période</span>
          </button>
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}
      </div>
      <NewBudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleBudgetCreated}
      />
    </>
  );
}