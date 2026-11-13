import BudgetPostesList from "./BudgetPostesList";
import type { PosteBudgetaire } from "@/models/budget";

type ExpensesListProps = {
  expenses: PosteBudgetaire[];
  onAddExpense: (expense: PosteBudgetaire) => void;
  onUpdateReelAmount: (uuid: string, amount: number) => void;
  onDeleteExpense: (uuid: string) => void;
};

export default function ExpensesList({
  expenses,
  onAddExpense,
  onUpdateReelAmount,
  onDeleteExpense,
}: ExpensesListProps) {
  return (
    <BudgetPostesList
      collection="expenses"
      postes={expenses}
      onAdd={onAddExpense}
      onUpdateReelAmount={onUpdateReelAmount}
      onDelete={onDeleteExpense}
    />
  );
}