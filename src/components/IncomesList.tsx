"use client";

import {
  useState,
  type ChangeEventHandler,
  type SubmitEventHandler,
} from 'react';
import { TrendingUp, Trash2, Plus } from 'lucide-react';
import type { PosteBudgetaire } from '@/models/budget';

type IncomesListProps = {
  incomes: PosteBudgetaire[];
  onAddIncome: (income: PosteBudgetaire) => void;
  onDeleteIncome: (id: string) => void;
};

export function IncomeItem({
  income,
  onDeleteIncome,
}: {
  income: PosteBudgetaire;
  onDeleteIncome: (uuid: string) => void;
}) {
  return (
    <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
      <div>
          <p className="text-sm font-medium text-slate-200">{income.source}</p>
          {income.note && <p className="text-xs text-amber-400/90 italic">{income.note}</p>}
      </div>
      <div className="flex items-center space-x-3">
        <span className="font-semibold text-emerald-400 text-sm">
          +{Number(income.amount ?? 0).toFixed(2)} $
        </span>
        <button
          type="button"
          onClick={() => onDeleteIncome(income.uuid)}
          aria-label={`Supprimer ${income.source}`}
          className="text-slate-500 hover:text-rose-400"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function IncomesList({
  incomes,
  onAddIncome,
  onDeleteIncome
}: IncomesListProps) {
  const [src, setSrc] = useState('');
  const [amt, setAmt] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!src || !amt) return;
    onAddIncome({
      uuid: crypto.randomUUID(),
      source: src,
      amount: parseFloat(amt) || 0,
      note: '',
    });
    setSrc('');
    setAmt('');
  };

  const handleSourceChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setSrc(e.target.value);
  };

  const handleAmountChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setAmt(e.target.value);
  };

  const handleNoteChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setNote(e.target.value);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col h-fit">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <h2 className="font-bold text-slate-200">Gains &amp; Entrées</h2>
        </div>
        <span className="text-sm font-semibold text-emerald-400">{incomes.reduce((sum, income) => sum + Number(income.amount), 0).toFixed(2)} $</span>
      </div>

      <div className="space-y-2 mb-4">
        {incomes.map((income) => (
          <IncomeItem
            key={income.uuid}
            income={income}
            onDeleteIncome={onDeleteIncome}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="pt-3 border-t border-slate-800 space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Source"
            value={src}
            onChange={handleSourceChange}
            className="w-90 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Montant"
            value={amt}
            onChange={handleAmountChange}
            className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
          />

          <input
            type="text"
            placeholder="Note"
            value={note}
            onChange={handleNoteChange}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
          />
        </div>
        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-xl text-sm flex items-center justify-center space-x-1">
          <Plus className="w-4 h-4" /> <span>Ajouter Gain</span>
        </button>
      </form>
    </div>
  );
}