"use client";

import {
  useState,
  type ChangeEventHandler,
  type SubmitEventHandler,
} from "react";
import {
  TrendingDown,
  TrendingUp,
  Trash2,
  Plus,
  CheckCircle2,
  Circle,
} from "lucide-react";
import type { PosteBudgetaire } from "@/models/budget";
import type { BudgetCollection } from "@/hooks/use-budget-editor";

type BudgetPostesListProps = {
  collection: BudgetCollection;
  postes: PosteBudgetaire[];
  onAdd: (poste: PosteBudgetaire) => void;
  onUpdateReelAmount: (uuid: string, amount: number) => void;
  onDelete: (uuid: string) => void;
};

export default function BudgetPostesList({
  collection,
  postes,
  onAdd,
  onUpdateReelAmount,
  onDelete,
}: BudgetPostesListProps) {
  const [source, setSource] = useState("");
  const [plannedAmount, setPlannedAmount] = useState("");
  const [note, setNote] = useState("");
  const isIncome = collection === "incomes";
  const HeadingIcon = isIncome ? TrendingUp : TrendingDown;
  const accentText = isIncome ? "text-emerald-400" : "text-rose-400";
  const accentButton = isIncome
    ? "bg-emerald-600 hover:bg-emerald-500"
    : "bg-rose-600 hover:bg-rose-500";
  const completedProgress = isIncome ? "bg-emerald-500" : "bg-rose-500";
  const title = isIncome ? "Gains & Entrées" : "Dépenses";

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    if (!source || !plannedAmount) return;

    onAdd({
      uuid: crypto.randomUUID(),
      source,
      plannedAmount: parseFloat(plannedAmount) || 0,
      reelAmount: 0,
      note: note || "",
    });
    setSource("");
    setPlannedAmount("");
    setNote("");
  };

  const handleSourceChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setSource(event.target.value);
  };

  const handlePlannedAmountChange: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    setPlannedAmount(event.target.value);
  };

  const handleNoteChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setNote(event.target.value);
  };

  const totalActual = postes.reduce(
    (sum, poste) => sum + Number(poste.reelAmount),
    0,
  );
  const totalPlanned = postes.reduce(
    (sum, poste) => sum + Number(poste.plannedAmount),
    0,
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col h-fit">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <HeadingIcon className={`w-5 h-5 ${accentText}`} />
          <h2 className="font-bold text-slate-200">{title}</h2>
        </div>
        <div className="text-right">
          <span className={`text-sm font-semibold ${accentText}`}>
            {totalActual.toFixed(2)} $
          </span>
          <span className="text-xs text-slate-500 block">
            sur {totalPlanned.toFixed(2)} $
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {postes.map((poste) => {
          const expectedAmount = Number(poste.plannedAmount ?? 0);
          const actualAmount = Number(poste.reelAmount ?? 0);
          const isFull = expectedAmount > 0 && actualAmount >= expectedAmount;
          const isPartial = actualAmount > 0 && actualAmount < expectedAmount;
          const progress =
            expectedAmount > 0
              ? Math.min((actualAmount / expectedAmount) * 100, 100)
              : 0;

          return (
            <div
              key={poste.uuid}
              className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center space-x-2.5">
                  <button
                    type="button"
                    title={
                      isIncome
                        ? isFull
                          ? "Marquer comme non reçu"
                          : "Marquer comme reçu en entier"
                        : isFull
                          ? "Marquer comme non payé"
                          : "Marquer comme payé en entier"
                    }
                    onClick={() =>
                      onUpdateReelAmount(
                        poste.uuid,
                        isFull ? 0 : expectedAmount,
                      )
                    }
                    className={`transition ${isFull ? accentText : isPartial ? "text-amber-400" : "text-slate-600 hover:text-slate-400"}`}
                  >
                    {isFull ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <span
                      title={poste.source}
                      className={`line-clamp-2 text-sm font-medium ${isFull ? "line-through text-slate-500" : "text-slate-200"}`}
                    >
                      {poste.source}
                    </span>
                    {isPartial && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Partiel
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center space-x-2">
                  <div className="flex h-8 shrink-0 items-center whitespace-nowrap bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={poste.reelAmount === 0 ? "" : poste.reelAmount}
                      placeholder="0.00"
                      onChange={(event) =>
                        onUpdateReelAmount(
                          poste.uuid,
                          parseFloat(event.target.value) || 0,
                        )
                      }
                      className={`w-12 shrink-0 bg-transparent text-right text-xs font-semibold ${accentText} focus:outline-none`}
                    />
                    <span className="ml-1 whitespace-nowrap text-xs text-slate-500">
                      / {expectedAmount.toFixed(2)}$
                    </span>
                  </div>
                  <button
                    type="button"
                    title={isIncome ? "Supprimer le revenu" : "Supprimer la dépense"}
                    onClick={() => onDelete(poste.uuid)}
                    className="text-slate-600 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {expectedAmount > 0 && (
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${isFull ? completedProgress : "bg-amber-400"}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="pt-3 border-t border-slate-800 space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={isIncome ? "Source" : "Description"}
            value={source}
            onChange={handleSourceChange}
            className="min-w-0 flex-[2] bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Montant planifié"
            value={plannedAmount}
            onChange={handlePlannedAmountChange}
            className="min-w-0 flex-[1] bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
          />

          <input
            type="text"
            placeholder="Note"
            value={note}
            onChange={handleNoteChange}
            className="min-w-0 flex-[3] bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
          />
        </div>
        <button
          type="submit"
          className={`w-full ${accentButton} text-white font-medium py-2 rounded-xl text-sm flex items-center justify-center space-x-1`}
        >
          <Plus className="w-4 h-4" />
          <span>{isIncome ? "Ajouter un revenu" : "Ajouter une dépense"}</span>
        </button>
      </form>
    </div>
  );
}
