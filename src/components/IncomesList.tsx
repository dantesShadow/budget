import BudgetPostesList from "./BudgetPostesList";
import type { PosteBudgetaire } from '@/models/budget';

type IncomesListProps = {
  incomes: PosteBudgetaire[];
  onAddIncome: (income: PosteBudgetaire) => void;
  onUpdateReelAmount: (uuid: string, amount: number) => void;
  onDeleteIncome: (uuid: string) => void;
};

export default function IncomesList({
  incomes,
  onAddIncome,
  onUpdateReelAmount,
  onDeleteIncome,
}: IncomesListProps) {
  return (
    <BudgetPostesList
      collection="incomes"
      postes={incomes}
      onAdd={onAddIncome}
      onUpdateReelAmount={onUpdateReelAmount}
      onDelete={onDeleteIncome}
    />
  );
}