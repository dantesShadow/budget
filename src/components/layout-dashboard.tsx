"use client";

import { useCallback, useRef, useState } from "react";
import type { Budget } from "@/models/budget";
import BudgetSelecteur from "@/components/budget-selecteur";
import IncomesList from "./IncomesList";

export default function LayoutDashboard() {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const budgetRef = useRef<Budget | null>(null);
  const saveQueue = useRef(Promise.resolve());

  const handleBudgetChange = useCallback((nextBudget: Budget) => {
    budgetRef.current = nextBudget;
    setBudget(nextBudget);
  }, []);

  const persistIncomes = useCallback(
    (incomes: Budget["incomes"]) => {
      const currentBudget = budgetRef.current;
      if (!currentBudget) return;

      const updatedBudget = { ...currentBudget, incomes };
      budgetRef.current = updatedBudget;
      setBudget(updatedBudget);

      saveQueue.current = saveQueue.current
        .then(async () => {
          const response = await fetch(`/api/budgets/${currentBudget.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ incomes }),
          });

          if (!response.ok) {
            throw new Error(`La sauvegarde du budget a échoué (${response.status}).`);
          }

          setSaveError(null);
        })
        .catch((error: unknown) => {
          setSaveError(
            error instanceof Error
              ? error.message
              : "Une erreur est survenue lors de la sauvegarde du budget."
          );
        });
    },
    [],
  );

  const onAddIncome = useCallback((income: Budget["incomes"][number]) => {
    const currentBudget = budgetRef.current;
    if (!currentBudget) return;

    persistIncomes([...currentBudget.incomes, income]);
  }, [persistIncomes]);

  const onDeleteIncome = useCallback((incomeUuid: string) => {
    const currentBudget = budgetRef.current;
    if (!currentBudget) return;

    persistIncomes(
      currentBudget.incomes.filter(
        (currentIncome) => currentIncome.uuid !== incomeUuid,
      ),
    );
  }, [persistIncomes]);

  return (
    <div className="space-y-6">
      <BudgetSelecteur onBudgetChange={handleBudgetChange} />
      {budget && (
        <IncomesList
          incomes={budget.incomes}
          onAddIncome={onAddIncome}
          onDeleteIncome={onDeleteIncome}
        />
      )}
      {saveError && (
        <p role="alert" className="text-sm text-red-400">
          {saveError}
        </p>
      )}
    </div>
  );
}