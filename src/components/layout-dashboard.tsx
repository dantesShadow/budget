"use client";

import BudgetSelecteur from "@/components/budget-selecteur";
import useBudgetEditor from "@/hooks/use-budget-editor";
import IncomesList from "./IncomesList";
import ExpensesList from "./ExpensesList";

export default function LayoutDashboard() {
  const { budget, saveError, handleBudgetChange, incomes, expenses } =
    useBudgetEditor();

  return (
    <div className="space-y-6">
      <BudgetSelecteur onBudgetChange={handleBudgetChange} />
      {budget && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <IncomesList
            incomes={budget.incomes}
            onAddIncome={incomes.add}
            onUpdateReelAmount={incomes.updateReelAmount}
            onDeleteIncome={incomes.delete}
          />
          <ExpensesList
            expenses={budget.expenses}
            onAddExpense={expenses.add}
            onUpdateReelAmount={expenses.updateReelAmount}
            onDeleteExpense={expenses.delete}
          />
        </div>
      )}
      {saveError && (
        <p role="alert" className="text-sm text-red-400">
          {saveError}
        </p>
      )}
    </div>
  );
}