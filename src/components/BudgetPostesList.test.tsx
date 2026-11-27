import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
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

function mockDialog(container: HTMLElement) {
  const dialog = container.querySelector("dialog");
  if (!dialog) throw new Error("La boîte de dialogue est introuvable.");

  const showModal = vi.fn(() => dialog.setAttribute("open", ""));
  const close = vi.fn(() => {
    dialog.removeAttribute("open");
    dialog.dispatchEvent(new Event("close"));
  });
  Object.defineProperty(dialog, "showModal", { configurable: true, value: showModal });
  Object.defineProperty(dialog, "close", { configurable: true, value: close });

  return { dialog, showModal, close };
}

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

describe("ajustement des montants", () => {
  it("ajoute le montant saisi au total reçu", () => {
    const onUpdateReelAmount = vi.fn();
    const { container } = render(
      <BudgetPostesList
        collection="incomes"
        postes={[
          {
            uuid: "income-1",
            source: "Salaire",
            plannedAmount: 100,
            reelAmount: 20,
          },
        ]}
        onAdd={vi.fn()}
        onUpdateReelAmount={onUpdateReelAmount}
        onDelete={vi.fn()}
      />,
    );
    const { dialog, showModal } = mockDialog(container);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ajuster le montant reçu pour Salaire",
      }),
    );
    expect(showModal).toHaveBeenCalledOnce();
    expect(dialog.open).toBe(true);

    fireEvent.change(screen.getByLabelText("Montant à ajouter"), {
      target: { value: "52" },
    });
    expect(screen.getByText("72.00 $")).toBeTruthy();

    const form = dialog.querySelector("form");
    if (!form) throw new Error("Le formulaire d’ajustement est introuvable.");
    fireEvent.submit(form);

    expect(onUpdateReelAmount).toHaveBeenCalledWith("income-1", 72);
    expect(dialog.open).toBe(false);
  });

  it("permet un total reçu supérieur au montant prévu", () => {
    const onUpdateReelAmount = vi.fn();
    const { container } = render(
      <BudgetPostesList
        collection="incomes"
        postes={[
          {
            uuid: "income-1",
            source: "Salaire",
            plannedAmount: 150,
            reelAmount: 70,
          },
        ]}
        onAdd={vi.fn()}
        onUpdateReelAmount={onUpdateReelAmount}
        onDelete={vi.fn()}
      />,
    );
    const { dialog } = mockDialog(container);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ajuster le montant reçu pour Salaire",
      }),
    );
    fireEvent.change(screen.getByLabelText("Montant à ajouter"), {
      target: { value: "100" },
    });

    expect(screen.getByText("170.00 $")).toBeTruthy();
    expect(within(dialog).getByText("Reçu en entier").className).toContain(
      "text-emerald-400",
    );

    const form = dialog.querySelector("form");
    if (!form) throw new Error("Le formulaire d’ajustement est introuvable.");
    fireEvent.submit(form);

    expect(onUpdateReelAmount).toHaveBeenCalledWith("income-1", 170);
  });

  it("ne retire pas plus que le montant déjà reçu", () => {
    const onUpdateReelAmount = vi.fn();
    const { container } = render(
      <BudgetPostesList
        collection="incomes"
        postes={[
          {
            uuid: "income-1",
            source: "Salaire",
            plannedAmount: 150,
            reelAmount: 5,
          },
        ]}
        onAdd={vi.fn()}
        onUpdateReelAmount={onUpdateReelAmount}
        onDelete={vi.fn()}
      />,
    );
    const { dialog } = mockDialog(container);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ajuster le montant reçu pour Salaire",
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "− Retirer" }));
    fireEvent.change(screen.getByLabelText("Montant à retirer"), {
      target: { value: "10" },
    });

    expect(within(dialog).getByText("0.00 $")).toBeTruthy();

    const form = dialog.querySelector("form");
    if (!form) throw new Error("Le formulaire d’ajustement est introuvable.");
    fireEvent.submit(form);

    expect(onUpdateReelAmount).toHaveBeenCalledWith("income-1", 0);
  });

  it("affiche une dépense dépassée après un ajout supérieur au montant prévu", () => {
    const onUpdateReelAmount = vi.fn();
    const { container } = render(
      <BudgetPostesList
        collection="expenses"
        postes={[
          {
            uuid: "expense-1",
            source: "Épicerie",
            plannedAmount: 150,
            reelAmount: 70,
          },
        ]}
        onAdd={vi.fn()}
        onUpdateReelAmount={onUpdateReelAmount}
        onDelete={vi.fn()}
      />,
    );
    const { dialog } = mockDialog(container);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ajuster le montant payé pour Épicerie",
      }),
    );
    fireEvent.change(screen.getByLabelText("Montant à ajouter"), {
      target: { value: "100" },
    });

    expect(screen.getByText("170.00 $")).toBeTruthy();
    expect(within(dialog).getByText("Dépassé")).toBeTruthy();

    const form = dialog.querySelector("form");
    if (!form) throw new Error("Le formulaire d’ajustement est introuvable.");
    fireEvent.submit(form);

    expect(onUpdateReelAmount).toHaveBeenCalledWith("expense-1", 170);
  });

  it("retire un montant sans passer sous zéro et affiche le reste", () => {
    const onUpdateReelAmount = vi.fn();
    const { container } = render(
      <BudgetPostesList
        collection="expenses"
        postes={[
          {
            uuid: "expense-1",
            source: "Épicerie",
            plannedAmount: 150,
            reelAmount: 170,
          },
        ]}
        onAdd={vi.fn()}
        onUpdateReelAmount={onUpdateReelAmount}
        onDelete={vi.fn()}
      />,
    );
    const { dialog } = mockDialog(container);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ajuster le montant payé pour Épicerie",
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "− Retirer" }));
    fireEvent.change(screen.getByLabelText("Montant à retirer"), {
      target: { value: "100" },
    });

    expect(screen.getByText("70.00 $")).toBeTruthy();
    expect(screen.getByText("Reste 80.00 $")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Montant à retirer"), {
      target: { value: "200" },
    });
    expect(screen.getByText("0.00 $")).toBeTruthy();
    expect(screen.getByText("Reste 150.00 $")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Montant à retirer"), {
      target: { value: "10" },
    });
    expect(within(dialog).getByText("Dépassé")).toBeTruthy();
    const form = dialog.querySelector("form");
    if (!form) throw new Error("Le formulaire d’ajustement est introuvable.");
    fireEvent.submit(form);

    expect(onUpdateReelAmount).toHaveBeenCalledWith("expense-1", 160);
  });

  it("ne met pas à jour le montant si la saisie est invalide", () => {
    const onUpdateReelAmount = vi.fn();
    const { container } = render(
      <BudgetPostesList
        collection="expenses"
        postes={[
          {
            uuid: "expense-1",
            source: "Épicerie",
            plannedAmount: 100,
            reelAmount: 20,
          },
        ]}
        onAdd={vi.fn()}
        onUpdateReelAmount={onUpdateReelAmount}
        onDelete={vi.fn()}
      />,
    );
    const { dialog } = mockDialog(container);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ajuster le montant payé pour Épicerie",
      }),
    );
    fireEvent.change(screen.getByLabelText("Montant à ajouter"), {
      target: { value: "-1" },
    });
    const form = dialog.querySelector("form");
    if (!form) throw new Error("Le formulaire d’ajustement est introuvable.");
    fireEvent.submit(form);

    expect(onUpdateReelAmount).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toContain(
      "montant valide",
    );
  });

  it("ferme la modale avec Annuler sans modifier le poste", () => {
    const onUpdateReelAmount = vi.fn();
    const { container } = render(
      <BudgetPostesList
        collection="incomes"
        postes={[
          {
            uuid: "income-1",
            source: "Salaire",
            plannedAmount: 100,
            reelAmount: 20,
          },
        ]}
        onAdd={vi.fn()}
        onUpdateReelAmount={onUpdateReelAmount}
        onDelete={vi.fn()}
      />,
    );
    const { dialog } = mockDialog(container);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ajuster le montant reçu pour Salaire",
      }),
    );
    fireEvent.change(screen.getByLabelText("Montant à ajouter"), {
      target: { value: "52" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));

    expect(dialog.open).toBe(false);
    expect(onUpdateReelAmount).not.toHaveBeenCalled();
  });
});
