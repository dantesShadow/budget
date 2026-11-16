"use client";

import BudgetSelecteur from "@/components/budget-selecteur";
import useBudgetEditor from "@/hooks/use-budget-editor";
import IncomesList from "./IncomesList";
import ExpensesList from "./ExpensesList";
import BudgetSummary from "./BudgetSummary";

export default function LayoutDashboard() {
  const {
    budget,
    saveError,
    handleBudgetChange,
    updateAccountBalance,
    incomes,
    expenses,
  } = useBudgetEditor();

  return (
    <div className="space-y-6">
      <BudgetSelecteur onBudgetChange={handleBudgetChange} />
      {budget && (
        <div className="space-y-6">
          <BudgetSummary
            key={budget.id}
            budget={budget}
            onUpdateAccountBalance={updateAccountBalance}
          />
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