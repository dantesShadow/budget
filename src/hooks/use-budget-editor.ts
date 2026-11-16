"use client";

import { useCallback, useRef, useState } from "react";
import type { Budget, PosteBudgetaire } from "@/models/budget";

export type BudgetCollection = "incomes" | "expenses";

type PosteActions = {
  add: (poste: PosteBudgetaire) => void;
  delete: (uuid: string) => void;
  updateReelAmount: (uuid: string, amount: number) => void;
};

export default function useBudgetEditor() {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const budgetRef = useRef<Budget | null>(null);
  const saveQueue = useRef(Promise.resolve());

  const handleBudgetChange = useCallback((nextBudget: Budget) => {
    budgetRef.current = nextBudget;
    setBudget(nextBudget);
  }, []);

  const queueSave = useCallback(
    (budgetId: string, updates: Record<string, unknown>) => {
      saveQueue.current = saveQueue.current
        .then(async () => {
          const response = await fetch(`/api/budgets/${budgetId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          });

          if (!response.ok) {
            throw new Error(
              `La sauvegarde du budget a échoué (${response.status}).`,
            );
          }

          setSaveError(null);
        })
        .catch((error: unknown) => {
          setSaveError(
            error instanceof Error
              ? error.message
              : "Une erreur est survenue lors de la sauvegarde du budget.",
          );
        });
    },
    [],
  );

  const updatePostes = useCallback(
    (
      collection: BudgetCollection,
      update: (postes: PosteBudgetaire[]) => PosteBudgetaire[],
    ) => {
      const currentBudget = budgetRef.current;
      if (!currentBudget) return;

      const postes = update(currentBudget[collection]);
      const updatedBudget: Budget = { ...currentBudget, [collection]: postes };
      budgetRef.current = updatedBudget;
      setBudget(updatedBudget);
      queueSave(currentBudget.id, { [collection]: postes });
    },
    [queueSave],
  );

  const updateAccountBalance = useCallback(
    (accountBalance: number) => {
      const currentBudget = budgetRef.current;
      if (!currentBudget) return;

      const updatedBudget: Budget = { ...currentBudget, accountBalance };
      budgetRef.current = updatedBudget;
      setBudget(updatedBudget);
      queueSave(currentBudget.id, { accountBalance });
    },
    [queueSave],
  );

  const createPosteActions = (collection: BudgetCollection): PosteActions => ({
    add: (poste) =>
      updatePostes(collection, (postes) => [...postes, poste]),
    delete: (uuid) =>
      updatePostes(collection, (postes) =>
        postes.filter((poste) => poste.uuid !== uuid),
      ),
    updateReelAmount: (uuid, amount) =>
      updatePostes(collection, (postes) =>
        postes.map((poste) =>
          poste.uuid === uuid ? { ...poste, reelAmount: amount } : poste,
        ),
      ),
  });

  return {
    budget,
    saveError,
    handleBudgetChange,
    updateAccountBalance,
    incomes: createPosteActions("incomes"),
    expenses: createPosteActions("expenses"),
  };
}
