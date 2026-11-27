"use client";

import {
  useEffect,
  useId,
  useRef,
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
  Pencil,
  X,
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
  const sourceInputRef = useRef<HTMLInputElement>(null);
  const adjustmentDialogRef = useRef<HTMLDialogElement>(null);
  const adjustmentInputRef = useRef<HTMLInputElement>(null);
  const adjustmentTitleId = useId();
  const adjustmentDescriptionId = useId();
  const adjustmentInputId = useId();
  const [source, setSource] = useState("");
  const [plannedAmount, setPlannedAmount] = useState("");
  const [note, setNote] = useState("");
  const [adjustmentPoste, setAdjustmentPoste] =
    useState<PosteBudgetaire | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [adjustmentMode, setAdjustmentMode] = useState<"add" | "remove">("add");
  const [adjustmentError, setAdjustmentError] = useState("");
  const isIncome = collection === "incomes";
  const HeadingIcon = isIncome ? TrendingUp : TrendingDown;
  const accentText = isIncome ? "text-emerald-400" : "text-rose-400";
  const completedProgress = isIncome ? "bg-emerald-500" : "bg-rose-500";
  const title = isIncome ? "Gains & Entrées" : "Dépenses";

  useEffect(() => {
    if (adjustmentPoste) adjustmentInputRef.current?.focus();
  }, [adjustmentPoste]);

  const openAdjustment = (poste: PosteBudgetaire) => {
    setAdjustmentPoste(poste);
    setAdjustmentAmount("");
    setAdjustmentMode("add");
    setAdjustmentError("");
    adjustmentDialogRef.current?.showModal();
  };

  const handleAdjustmentSubmit: SubmitEventHandler<HTMLFormElement> = (
    event,
  ) => {
    event.preventDefault();
    if (!adjustmentPoste) return;

    const amount = Number(adjustmentAmount);
    if (
      adjustmentAmount.trim() === "" ||
      !Number.isFinite(amount) ||
      amount < 0
    ) {
      setAdjustmentError("Saisissez un montant valide supérieur ou égal à 0.");
      return;
    }

    const actualAmount = Number(adjustmentPoste.reelAmount ?? 0);
    const updatedAmount =
      adjustmentMode === "add"
        ? actualAmount + amount
        : Math.max(0, actualAmount - amount);

    onUpdateReelAmount(adjustmentPoste.uuid, updatedAmount);
    adjustmentDialogRef.current?.close();
  };

  const handleAdjustmentClose = () => {
    setAdjustmentPoste(null);
    setAdjustmentAmount("");
    setAdjustmentError("");
  };

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
    sourceInputRef.current?.focus();
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
  const adjustmentActualAmount = Number(adjustmentPoste?.reelAmount ?? 0);
  const adjustmentPlannedAmount = Number(
    adjustmentPoste?.plannedAmount ?? 0,
  );
  const parsedAdjustmentAmount = Number(adjustmentAmount);
  const hasValidAdjustment =
    adjustmentAmount.trim() !== "" &&
    Number.isFinite(parsedAdjustmentAmount) &&
    parsedAdjustmentAmount >= 0;
  const previewAmount =
    !hasValidAdjustment || !adjustmentPoste
      ? adjustmentActualAmount
      : adjustmentMode === "add"
        ? adjustmentActualAmount + parsedAdjustmentAmount
        : Math.max(0, adjustmentActualAmount - parsedAdjustmentAmount);
  const previewOverBudget =
    !isIncome && previewAmount > adjustmentPlannedAmount;
  const previewStatus = isIncome
    ? adjustmentPlannedAmount > 0 &&
      previewAmount >= adjustmentPlannedAmount
      ? "Reçu en entier"
      : previewAmount > 0
        ? "Partiel"
        : "Non reçu"
    : previewOverBudget
      ? "Dépassé"
      : previewAmount === adjustmentPlannedAmount
        ? "Payé"
        : `Reste ${Math.max(0, adjustmentPlannedAmount - previewAmount).toFixed(2)} $`;
  const previewStatusColor = previewOverBudget
    ? "text-rose-400"
    : isIncome
      ? previewStatus === "Reçu en entier"
        ? "text-emerald-400"
        : "text-amber-400"
      : previewStatus === "Payé"
        ? "text-emerald-400"
        : "text-amber-400";

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
          <span className="text-xs text-white block">
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
          const isOverBudget = actualAmount > expectedAmount;
          const progress =
            expectedAmount > 0
              ? Math.min((actualAmount / expectedAmount) * 100, 100)
              : 0;
          const paidStatusColor = isIncome
            ? isFull
              ? accentText
              : isPartial
                ? "text-amber-400"
                : "text-slate-600 hover:text-slate-400"
            : actualAmount === 0
              ? "text-slate-600 hover:text-slate-400"
              : isOverBudget
                ? "text-rose-400"
                : "text-emerald-400";
          const progressColor = isIncome
            ? isFull
              ? completedProgress
              : "bg-amber-400"
            : isOverBudget
              ? "bg-rose-500"
              : "bg-emerald-500";

          return (
            <div
              key={poste.uuid}
              className="bg-slate-950 p-3 rounded-xl border border-slate-800 grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2"
            >
              <div className="col-start-1 row-start-1 flex min-w-0 items-center space-x-2.5">
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
                    className={`transition ${paidStatusColor}`}
                  >
                    {isFull ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        title={poste.source}
                        className={`truncate text-sm font-medium ${isFull ? "line-through text-slate-500" : "text-slate-200"}`}
                      >
                        {poste.source}
                      </span>
                      {isIncome && isPartial && (
                        <span className="shrink-0 text-xs px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Partiel
                        </span>
                      )}
                      {!isIncome && expectedAmount > 0 && actualAmount > 0 && (
                        <span
                          className={`shrink-0 text-xs px-1.5 py-0.5 rounded border ${
                            isOverBudget
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : actualAmount === expectedAmount
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {isOverBudget
                            ? "Dépassé"
                            : actualAmount === expectedAmount
                              ? "Payé"
                              : `Reste ${(expectedAmount - actualAmount).toFixed(2)} $`}
                        </span>
                      )}
                    </div>
                    {poste.note && (
                      <span className="block truncate text-xs italic text-amber-400">
                        {poste.note}
                      </span>
                    )}
                  </div>
              </div>

              <button
                type="button"
                aria-haspopup="dialog"
                aria-label={`Ajuster le montant ${isIncome ? "reçu" : "payé"} pour ${poste.source}`}
                title={`Ajuster le montant ${isIncome ? "reçu" : "payé"} pour ${poste.source}`}
                onClick={() => openAdjustment(poste)}
                className={`col-span-3 row-start-3 flex h-8 w-full items-center justify-end whitespace-nowrap rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-xs font-semibold transition hover:border-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:w-auto ${
                  isIncome
                    ? accentText
                    : isOverBudget
                      ? "text-rose-400"
                      : "text-emerald-400"
                }`}
              >
                <span>{actualAmount === 0 ? "0.00" : actualAmount.toFixed(2)}</span>
                <span className="ml-1 whitespace-nowrap text-xs text-white">
                  / {expectedAmount.toFixed(2)}$
                </span>
                <Pencil aria-hidden="true" className="ml-1 h-3 w-3 shrink-0 text-slate-500" />
              </button>

              <button
                type="button"
                title={isIncome ? "Supprimer le revenu" : "Supprimer la dépense"}
                onClick={() => onDelete(poste.uuid)}
                className="col-start-3 row-start-1 text-slate-600 hover:text-rose-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {expectedAmount > 0 && (
                <div className="col-span-3 row-start-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-900">
                  <div
                    className={`h-full transition-all duration-300 ${progressColor}`}
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
            ref={sourceInputRef}
            type="text"
            placeholder={isIncome ? "Source" : "Description"}
            value={source}
            onChange={handleSourceChange}
            className="min-w-0 flex-[2] bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Montant"
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
          className={`w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-xl text-sm flex items-center justify-center space-x-1`}
        >
          <Plus className="w-4 h-4" />
          <span>{isIncome ? "Ajouter un revenu" : "Ajouter une dépense"}</span>
        </button>
      </form>

      <dialog
        ref={adjustmentDialogRef}
        aria-labelledby={adjustmentTitleId}
        aria-describedby={adjustmentDescriptionId}
        onClose={handleAdjustmentClose}
        style={{ width: "min(28rem, calc(100% - 2rem))" }}
        className="fixed inset-0 m-auto max-h-[86dvh] max-w-md overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-5 text-slate-100 shadow-2xl backdrop:bg-slate-950/80"
      >
        <form onSubmit={handleAdjustmentSubmit} className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2
                id={adjustmentTitleId}
                className="text-lg font-bold text-slate-100"
              >
                Ajuster le montant {isIncome ? "reçu" : "payé"}
              </h2>
              {adjustmentPoste && (
                <p
                  id={adjustmentDescriptionId}
                  className="mt-1 text-sm text-slate-400"
                >
                  {adjustmentPoste.source} · Actuel{" "}
                  {adjustmentActualAmount.toFixed(2)} $ / prévu{" "}
                  {adjustmentPlannedAmount.toFixed(2)} $
                </p>
              )}
            </div>
            <button
              type="button"
              aria-label="Fermer"
              onClick={() => adjustmentDialogRef.current?.close()}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-2">
            <label
              htmlFor={adjustmentInputId}
              className="block text-sm font-medium text-slate-300"
            >
              Montant à {adjustmentMode === "add" ? "ajouter" : "retirer"}
            </label>
            <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-[auto_minmax(0,1fr)]">
              <div
                className="flex rounded-lg border border-slate-700 bg-slate-950 p-1"
                role="group"
                aria-label="Type d’ajustement"
              >
                <button
                  type="button"
                  aria-pressed={adjustmentMode === "add"}
                  onClick={() => {
                    setAdjustmentMode("add");
                    setAdjustmentError("");
                  }}
                  className={`rounded-md px-3 py-2 text-sm font-medium ${
                    adjustmentMode === "add"
                      ? "bg-slate-800 text-emerald-400"
                      : "text-slate-300"
                  }`}
                >
                  + Ajouter
                </button>
                <button
                  type="button"
                  aria-pressed={adjustmentMode === "remove"}
                  onClick={() => {
                    setAdjustmentMode("remove");
                    setAdjustmentError("");
                  }}
                  className={`rounded-md px-3 py-2 text-sm font-medium ${
                    adjustmentMode === "remove"
                      ? "bg-slate-800 text-rose-400"
                      : "text-slate-300"
                  }`}
                >
                  − Retirer
                </button>
              </div>
              <div className="flex min-w-0 items-center rounded-lg border border-slate-700 bg-slate-950 px-3 focus-within:border-sky-500">
                <input
                  ref={adjustmentInputRef}
                  id={adjustmentInputId}
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  inputMode="decimal"
                  value={adjustmentAmount}
                  onChange={(event) => {
                    setAdjustmentAmount(event.target.value);
                    setAdjustmentError("");
                  }}
                  className="min-w-0 flex-1 bg-transparent py-2 text-right text-base text-slate-100 outline-none"
                />
                <span className="ml-2 text-sm text-slate-400">$</span>
              </div>
            </div>
          </div>

          <div
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm"
            aria-live="polite"
          >
            <span className="text-slate-400">
              Nouveau total {isIncome ? "reçu" : "payé"}
            </span>
            <strong
              className={
                isIncome
                  ? "text-emerald-400"
                  : previewOverBudget
                    ? "text-rose-400"
                    : "text-emerald-400"
              }
            >
              {previewAmount.toFixed(2)} $
            </strong>
            <span className={previewStatusColor}>
              {previewStatus}
            </span>
          </div>

          {adjustmentError && (
            <p role="alert" className="text-sm text-rose-400">
              {adjustmentError}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => adjustmentDialogRef.current?.close()}
              className="min-h-11 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 font-medium text-slate-300 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="min-h-11 flex-1 rounded-lg bg-emerald-600 px-4 font-semibold text-white hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
            >
              Confirmer
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
