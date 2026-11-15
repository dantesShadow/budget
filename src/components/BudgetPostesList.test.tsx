import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import BudgetPostesList from "./BudgetPostesList";

const collections = [
  {
    name: "revenus",
    collection: "incomes",
    sourcePlaceholder: "Source",
  },
  {
    name: "dépenses",
    collection: "expenses",
    sourcePlaceholder: "Description",
  },
] as const;

beforeEach(() => {
  vi.stubGlobal("crypto", { randomUUID: () => "test-uuid" });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe.each(collections)(
  "$name",
  ({ collection, sourcePlaceholder }) => {
    it("vide les champs et redonne le focus à la source après un ajout valide", () => {
      const onAdd = vi.fn();

      render(
        <BudgetPostesList
          collection={collection}
          postes={[]}
          onAdd={onAdd}
          onUpdateReelAmount={vi.fn()}
          onDelete={vi.fn()}
        />,
      );

      const sourceInput =
        screen.getByPlaceholderText<HTMLInputElement>(sourcePlaceholder);
      const amountInput =
        screen.getByPlaceholderText<HTMLInputElement>("Montant");
      const noteInput = screen.getByPlaceholderText<HTMLInputElement>("Note");

      fireEvent.change(sourceInput, { target: { value: "Salaire" } });
      fireEvent.change(amountInput, { target: { value: "1250" } });
      fireEvent.change(noteInput, { target: { value: "Versement mensuel" } });
      noteInput.focus();

      const form = sourceInput.closest("form");
      if (!form) throw new Error("Le formulaire de saisie est introuvable.");
      fireEvent.submit(form);

      expect(onAdd).toHaveBeenCalledWith({
        uuid: "test-uuid",
        source: "Salaire",
        plannedAmount: 1250,
        reelAmount: 0,
        note: "Versement mensuel",
      });
      expect(sourceInput.value).toBe("");
      expect(amountInput.value).toBe("");
      expect(noteInput.value).toBe("");
      expect(document.activeElement).toBe(sourceInput);
    });

    it("conserve la saisie et le focus si le montant est manquant", () => {
      const onAdd = vi.fn();

      render(
        <BudgetPostesList
          collection={collection}
          postes={[]}
          onAdd={onAdd}
          onUpdateReelAmount={vi.fn()}
          onDelete={vi.fn()}
        />,
      );

      const sourceInput =
        screen.getByPlaceholderText<HTMLInputElement>(sourcePlaceholder);
      const amountInput =
        screen.getByPlaceholderText<HTMLInputElement>("Montant");
      const noteInput = screen.getByPlaceholderText<HTMLInputElement>("Note");

      fireEvent.change(sourceInput, { target: { value: "Salaire" } });
      fireEvent.change(noteInput, { target: { value: "Versement mensuel" } });
      noteInput.focus();

      const form = sourceInput.closest("form");
      if (!form) throw new Error("Le formulaire de saisie est introuvable.");
      fireEvent.submit(form);

      expect(onAdd).not.toHaveBeenCalled();
      expect(sourceInput.value).toBe("Salaire");
      expect(amountInput.value).toBe("");
      expect(noteInput.value).toBe("Versement mensuel");
      expect(document.activeElement).toBe(noteInput);
    });
  },
);
