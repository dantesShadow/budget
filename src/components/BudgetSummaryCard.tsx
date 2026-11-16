import type { ReactNode } from "react";

type BudgetSummaryCardProps = {
  title: string;
  icon?: ReactNode;
  value: ReactNode;
  caption: string;
};

export default function BudgetSummaryCard({
  title,
  icon,
  value,
  caption,
}: BudgetSummaryCardProps) {
  return (
    <article className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="truncate text-sm font-medium text-slate-400">{title}</h2>
        {icon}
      </div>
      <div className="mt-1 flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1 tabular-nums">
        {value}
      </div>
      <p className="mt-1 truncate text-xs text-slate-500">{caption}</p>
    </article>
  );
}
