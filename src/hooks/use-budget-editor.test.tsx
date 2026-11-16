import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import useBudgetEditor from "./use-budget-editor";
import type { Budget } from "@/models/budget";
import { summarizeBudget } from "@/lib/budget-summary";

const budget: Budget = {
  id: "budget-1",
  periodName: "Novembre",
  initialBalance: 100,
  incomes: [],
  expenses: [],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useBudgetEditor", () => {
  it("sauvegarde seulement le solde de compte, y compris une valeur négative", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetch);
    const { result } = renderHook(() => useBudgetEditor());

    act(() => {
      result.current.handleBudgetChange(budget);
      result.current.updateAccountBalance(-35.5);
    });

    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    expect(fetch).toHaveBeenCalledWith("/api/budgets/budget-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountBalance: -35.5 }),
    });
    expect(result.current.budget?.accountBalance).toBe(-35.5);
  });

  it("ajuste le solde actuel des revenus reçus et des dépenses payées", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetch);
    const actualBudget: Budget = {
      ...budget,
      accountBalance: 100,
      incomes: [
        { uuid: "income-1", source: "Salaire", plannedAmount: 100, reelAmount: 30 },
      ],
      expenses: [
        { uuid: "expense-1", source: "Loyer", plannedAmount: 100, reelAmount: 10 },
      ],
    };
    const { result } = renderHook(() => useBudgetEditor());

    act(() => {
      result.current.handleBudgetChange(actualBudget);
      result.current.incomes.updateReelAmount("income-1", 45);
      result.current.expenses.updateReelAmount("expense-1", 25);
    });

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(result.current.budget?.accountBalance).toBe(100);
    expect(result.current.budget?.incomes[0].reelAmount).toBe(45);
    expect(result.current.budget?.expenses[0].reelAmount).toBe(25);
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toMatchObject({
      accountBalance: 115,
    });
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toMatchObject({
      accountBalance: 100,
    });
  });

  it("garde l'estimation des anciens budgets sans enregistrer un solde", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetch);
    const legacyBudget: Budget = {
      ...budget,
      incomes: [
        { uuid: "income-1", source: "Salaire", plannedAmount: 100, reelAmount: 30 },
      ],
    };
    const { result } = renderHook(() => useBudgetEditor());

    act(() => {
      result.current.handleBudgetChange(legacyBudget);
      result.current.incomes.updateReelAmount("income-1", 45);
    });

    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    const updatedBudget = result.current.budget;
    if (!updatedBudget) throw new Error("Le budget n'a pas été mis à jour.");
    expect(updatedBudget.accountBalance).toBeUndefined();
    expect(summarizeBudget(updatedBudget).currentAccountBalance).toBe(145);
    expect(JSON.parse(fetch.mock.calls[0][1].body)).not.toHaveProperty(
      "accountBalance",
    );
  });
});
