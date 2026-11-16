import type { Budget } from "@/models/budget";

export interface BudgetSummary {
  plannedIncome: number;
  receivedIncome: number;
  remainingIncome: number;
  plannedExpenses: number;
  paidExpenses: number;
  remainingToPay: number;
  currentAccountBalance: number;
  projectedEndingBalance: number;
}

function amount(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function sumAmounts(values: Array<number | undefined>): number {
  return values.reduce<number>((total, value) => total + amount(value), 0);
}

export function summarizeBudget(budget: Budget): BudgetSummary {
  const plannedIncome = sumAmounts(
    budget.incomes.map((income) => income.plannedAmount),
  );
  const receivedIncome = sumAmounts(
    budget.incomes.map((income) => income.reelAmount),
  );
  const remainingIncome = budget.incomes.reduce(
    (total, income) =>
      total +
      Math.max(0, amount(income.plannedAmount) - amount(income.reelAmount)),
    0,
  );
  const plannedExpenses = sumAmounts(
    budget.expenses.map((expense) => expense.plannedAmount),
  );
  const paidExpenses = sumAmounts(
    budget.expenses.map((expense) => expense.reelAmount),
  );
  const remainingToPay = budget.expenses.reduce(
    (total, expense) =>
      total +
      Math.max(0, amount(expense.plannedAmount) - amount(expense.reelAmount)),
    0,
  );
  const currentAccountBalance =
    typeof budget.accountBalance === "number" &&
    Number.isFinite(budget.accountBalance)
      ? budget.accountBalance
      : amount(budget.initialBalance) + receivedIncome - paidExpenses;

  return {
    plannedIncome,
    receivedIncome,
    remainingIncome,
    plannedExpenses,
    paidExpenses,
    remainingToPay,
    currentAccountBalance,
    projectedEndingBalance:
      currentAccountBalance + remainingIncome - remainingToPay,
  };
}
