import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import useBudgetEditor from "./use-budget-editor";
import type { Budget } from "@/models/budget";

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
});
