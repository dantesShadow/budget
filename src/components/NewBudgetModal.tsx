"use client";

import { useState, type ChangeEventHandler, type SubmitEventHandler } from 'react';
import { Plus, X } from 'lucide-react';
import type { Budget } from '@/models/budget';

type NewBudgetModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (budget: Budget) => void;
};

function isBudget(value: unknown): value is Budget {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'periodName' in value &&
    typeof value.periodName === 'string' &&
    'initialBalance' in value &&
    typeof value.initialBalance === 'number'
  );
}

export default function NewBudgetModal({ isOpen, onClose, onCreate }: NewBudgetModalProps) {
  const [periodName, setPeriodName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const budget = {
      periodName: periodName.trim(),
      initialBalance: initialBalance === '' ? 0 : Number(initialBalance),
    };

    if (!budget.periodName || !Number.isFinite(budget.initialBalance)) {
      setError('Veuillez saisir un nom de période et un solde initial valide.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budget),
      });

      if (!response.ok) {
        throw new Error(`La création de la période a échoué (${response.status}).`);
      }

      const createdBudget: unknown = await response.json();
      if (!isBudget(createdBudget)) {
        throw new Error("La réponse de l’API des budgets est invalide.");
      }

      onCreate(createdBudget);
      setPeriodName('');
      setInitialBalance('');
      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Une erreur est survenue lors de la création de la période.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePeriodNameChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setPeriodName(e.target.value);
  };

  const handleInitialBalanceChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setInitialBalance(e.target.value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
          <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-400" /> Nouvelle Période Budgétaire
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Nom de la période (ex: 10 au 23 décembre)</label>
            <input
              type="text"
              required
              placeholder="ex: 10 au 23 décembre"
              value={periodName}
              onChange={handlePeriodNameChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Solde initial en compte ($)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={initialBalance}
              onChange={handleInitialBalanceChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white bg-slate-950 border border-slate-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/30"
            >
              {isSubmitting ? 'Création...' : 'Créer la période'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}