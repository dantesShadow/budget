"use client";

import {
  useState,
  type ChangeEventHandler,
  type SubmitEventHandler,
} from 'react';
import { TrendingUp, Trash2, Plus, CheckCircle2, Circle } from 'lucide-react';
import type { PosteBudgetaire } from '@/models/budget';

type IncomesListProps = {
  incomes: PosteBudgetaire[];
  onAddIncome: (income: PosteBudgetaire) => void;
  onUpdateReelAmount: (uuid: string, amount: number) => void;
  onDeleteIncome: (uuid: string) => void;
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
          +{Number(income.plannedAmount ?? 0).toFixed(2)} $
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

export function IncomesItem2({
  income,
  onDeleteIncome,
  onUpdateReelAmount,
}: {
  income: PosteBudgetaire;
  onUpdateReelAmount: (uuid: string, amount: number) => void;
  onDeleteIncome: (uuid: string) => void;
}) {
  const expectedAmount = Number(income.plannedAmount ?? 0);
  const actualAmount = Number(income.reelAmount ?? 0);
  const isFull = expectedAmount > 0 && actualAmount >= expectedAmount;
  const isPartial = actualAmount > 0 && actualAmount < expectedAmount;
  const progress = expectedAmount > 0 ? Math.min((actualAmount / expectedAmount) * 100, 100) : 0;

  return (
    <div key={income.uuid} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            title={isFull ? 'Marquer comme non reçu' : 'Marquer comme reçu en entier'}
            onClick={() => onUpdateReelAmount(income.uuid, isFull ? 0 : expectedAmount)}
            className={`transition ${isFull ? 'text-emerald-400' : isPartial ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'}`}
          >
            {isFull ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
          </button>
          <div>
            <span className={`text-sm font-medium ${isFull ? 'line-through text-slate-500' : 'text-slate-200'}`}>
              {income.source}
            </span>
            {isPartial && (
              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Partiel
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
            <input
              type="number"
              step="0.01"
              min="0"
              value={income.reelAmount === 0 ? '' : income.reelAmount}
              placeholder="0.00"
              onChange={(e) => onUpdateReelAmount(income.uuid, parseFloat(e.target.value) || 0)}
              className="w-16 bg-transparent text-right text-xs font-semibold text-emerald-400 focus:outline-none"
            />
            <span className="text-xs text-slate-500 ml-1">/ {expectedAmount.toFixed(2)}$</span>
          </div>
          <button type="button" onClick={() => onDeleteIncome(income.uuid)} className="text-slate-600 hover:text-rose-400">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expectedAmount > 0 && (
        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${isFull ? 'bg-emerald-500' : 'bg-amber-400'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function IncomesList({
  incomes,
  onAddIncome,
  onUpdateReelAmount,
  onDeleteIncome
}: IncomesListProps) {
  const [src, setSrc] = useState('');
  const [plannedAmount, setPlannedAmount] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!src || !plannedAmount) return;
    onAddIncome({
      uuid: crypto.randomUUID(),
      source: src,
      plannedAmount: parseFloat(plannedAmount) || 0,
      reelAmount: 0,
      note: note || '',
    });
    setSrc('');
    setPlannedAmount('');
    setNote('');
  };

  const handleSourceChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setSrc(e.target.value);
  };

  const handlePlannedAmountChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setPlannedAmount(e.target.value);
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
        <div className="text-right">
          <span className="text-sm font-semibold text-emerald-400">{incomes.reduce((sum, income) => sum + Number(income.reelAmount), 0).toFixed(2)} $</span>
          <span className="text-xs text-slate-500 block">sur {incomes.reduce((sum, income) => sum + Number(income.plannedAmount), 0).toFixed(2)} $</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {incomes.map((income) => (
          <IncomesItem2
            key={income.uuid}
            income={income}
            onUpdateReelAmount={onUpdateReelAmount}
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
            placeholder="Montant Planifié"
            value={plannedAmount}
            onChange={handlePlannedAmountChange}
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