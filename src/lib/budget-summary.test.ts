import { describe, expect, it } from "vitest";
import { summarizeBudget } from "./budget-summary";
import type { Budget } from "@/models/budget";

const budget: Budget = {
  id: "budget-1",
  periodName: "Novembre",
  initialBalance: 100,
  incomes: [
    { uuid: "income-1", source: "Salaire", plannedAmount: 500, reelAmount: 200 },
    { uuid: "income-2", source: "Autre", plannedAmount: 300, reelAmount: 400 },
  ],
  expenses: [
    { uuid: "expense-1", source: "Loyer", plannedAmount: 400, reelAmount: 450 },
    { uuid: "expense-2", source: "Épicerie", plannedAmount: 200, reelAmount: 50 },
  ],
};

describe("summarizeBudget", () => {
  it("somme prévu et réel, sans compenser le dépassement d'un poste", () => {
    const summary = summarizeBudget(budget);

    expect(summary).toMatchObject({
      plannedIncome: 800,
      receivedIncome: 600,
      remainingIncome: 300,
      plannedExpenses: 600,
      paidExpenses: 500,
      remainingToPay: 150,
    });
  });

  it("estime le solde courant des budgets historiques et calcule la fin sans doublon", () => {
    const summary = summarizeBudget(budget);

    expect(summary.currentAccountBalance).toBe(200);
    expect(summary.projectedEndingBalance).toBe(350);
  });

  it("préfère le solde de compte enregistré, même s'il est négatif", () => {
    const summary = summarizeBudget({ ...budget, accountBalance: -25 });

    expect(summary.currentAccountBalance).toBe(-25);
    expect(summary.projectedEndingBalance).toBe(125);
  });

  it("traite les montants absents et non finis comme zéro", () => {
    const summary = summarizeBudget({
      ...budget,
      initialBalance: Number.NaN,
      incomes: [
        { uuid: "income-1", source: "Salaire", plannedAmount: Number.POSITIVE_INFINITY },
      ],
      expenses: [{ uuid: "expense-1", source: "Loyer", reelAmount: Number.NaN }],
    });

    expect(summary).toMatchObject({
      plannedIncome: 0,
      receivedIncome: 0,
      remainingIncome: 0,
      plannedExpenses: 0,
      paidExpenses: 0,
      remainingToPay: 0,
      currentAccountBalance: 0,
      projectedEndingBalance: 0,
    });
  });
});
