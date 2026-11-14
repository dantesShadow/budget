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

      saveQueue.current = saveQueue.current
        .then(async () => {
          const response = await fetch(`/api/budgets/${currentBudget.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [collection]: postes }),
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
    incomes: createPosteActions("incomes"),
    expenses: createPosteActions("expenses"),
  };
}
