import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import BudgetSummary from "./BudgetSummary";
import type { Budget } from "@/models/budget";

const budget: Budget = {
  id: "budget-1",
  periodName: "Novembre",
  initialBalance: 100,
  accountBalance: 100,
  incomes: [{ uuid: "income-1", source: "Salaire", plannedAmount: 500, reelAmount: 200 }],
  expenses: [{ uuid: "expense-1", source: "Loyer", plannedAmount: 300, reelAmount: 100 }],
};

afterEach(cleanup);

describe("BudgetSummary", () => {
  it("affiche les soldes dans le bandeau mobile et replie ses détails par défaut", () => {
    const { container } = render(
      <BudgetSummary budget={budget} onUpdateAccountBalance={vi.fn()} />,
    );
    const mobileSummary = container.querySelector<HTMLElement>(".md\\:hidden");
    if (!mobileSummary) throw new Error("Le sommaire mobile est introuvable.");

    expect(within(mobileSummary).getByText("Solde actuel")).toBeTruthy();
    expect(within(mobileSummary).getByText("Solde de fin prévue")).toBeTruthy();
    expect(mobileSummary.textContent).toMatch(/100\.00\s*\$/);
    expect(mobileSummary.textContent).toMatch(/200\.00\s*\$/);
    expect(mobileSummary.querySelectorAll(".grid > div > .min-h-6")).toHaveLength(2);
    expect(within(mobileSummary).queryByText("Revenus reçu / prévu")).toBeNull();
    expect(
      within(mobileSummary)
        .getByRole("button", { name: "Détails du sommaire" })
        .getAttribute("aria-expanded"),
    ).toBe("false");
    expect(
      within(mobileSummary).getByRole("button", {
        name: "Modifier le solde actuel",
      }),
    ).toBeTruthy();
  });

  it("signale le solde estimé d'un ancien budget et invite à le confirmer", () => {
    const { container } = render(
      <BudgetSummary
        budget={{ ...budget, accountBalance: undefined }}
        onUpdateAccountBalance={vi.fn()}
      />,
    );
    const mobileSummary = container.querySelector<HTMLElement>(".md\\:hidden");
    if (!mobileSummary) throw new Error("Le sommaire mobile est introuvable.");
    const mobile = within(mobileSummary);

    expect(mobile.getByText("Estimation à confirmer")).toBeTruthy();
    expect(
      mobile.getByRole("button", { name: "Confirmer ou corriger le solde" }),
    ).toBeTruthy();
    fireEvent.click(mobile.getByRole("button", { name: "Détails du sommaire" }));
    expect(
      mobileSummary.querySelector("#budget-summary-details input"),
    ).toBeNull();
  });

  it("ouvre et referme les détails avec un état accessible", () => {
    const { container } = render(
      <BudgetSummary budget={budget} onUpdateAccountBalance={vi.fn()} />,
    );
    const mobileSummary = container.querySelector<HTMLElement>(".md\\:hidden");
    if (!mobileSummary) throw new Error("Le sommaire mobile est introuvable.");
    const mobile = within(mobileSummary);

    const button = mobile.getByRole("button", { name: "Détails du sommaire" });
    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(mobile.getByText("Revenus reçu / prévu")).toBeTruthy();
    expect(mobile.getByText("Dépenses payé / prévu")).toBeTruthy();
    expect(
      mobileSummary.querySelector(
        "#budget-summary-details [aria-label='Modifier le solde actuel']",
      ),
    ).toBeNull();

    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("false");
  });

  it("présente aussi les trois cartes grand écran sans remplacer les postes", () => {
    const { container } = render(
      <BudgetSummary budget={budget} onUpdateAccountBalance={vi.fn()} />,
    );

    expect(screen.getByText("Revenus (Reçu / Prévu)")).toBeTruthy();
    expect(screen.getByText("Dépenses (Payé / Prévu)")).toBeTruthy();
    expect(screen.getByText("Solde Réel Actuel")).toBeTruthy();
    expect(container.querySelector(".md\\:grid-cols-3")).toBeTruthy();
  });

  it("valide et confirme une correction de solde négative", () => {
    const onUpdateAccountBalance = vi.fn();
    const { container } = render(
      <BudgetSummary budget={budget} onUpdateAccountBalance={onUpdateAccountBalance} />,
    );
    const mobileSummary = container.querySelector<HTMLElement>(".md\\:hidden");
    if (!mobileSummary) throw new Error("Le sommaire mobile est introuvable.");
    const mobile = within(mobileSummary);
    fireEvent.click(
      mobile.getByRole("button", { name: "Modifier le solde actuel" }),
    );

    const input = mobile.getByLabelText("Nouveau solde du compte");
    fireEvent.change(input, { target: { value: "-35.50" } });
    fireEvent.click(mobile.getByRole("button", { name: "Confirmer le solde" }));

    expect(onUpdateAccountBalance).toHaveBeenCalledWith(-35.5);
  });

  it("annule une saisie sans enregistrer et restaure le montant", () => {
    const onUpdateAccountBalance = vi.fn();
    const { container } = render(
      <BudgetSummary budget={budget} onUpdateAccountBalance={onUpdateAccountBalance} />,
    );
    const mobileSummary = container.querySelector<HTMLElement>(".md\\:hidden");
    if (!mobileSummary) throw new Error("Le sommaire mobile est introuvable.");
    const mobile = within(mobileSummary);
    fireEvent.click(
      mobile.getByRole("button", { name: "Modifier le solde actuel" }),
    );
    fireEvent.change(mobile.getByLabelText("Nouveau solde du compte"), {
      target: { value: "999" },
    });
    fireEvent.click(
      mobile.getByRole("button", { name: "Annuler la modification du solde" }),
    );

    expect(onUpdateAccountBalance).not.toHaveBeenCalled();
    const editButton = mobile.getByRole("button", {
      name: "Modifier le solde actuel",
    });
    expect(editButton.parentElement?.textContent).toContain("100.00 $");
  });

  it("garde le crayon, la coche et le X à côté du montant et du champ", () => {
    const { container } = render(
      <BudgetSummary budget={budget} onUpdateAccountBalance={vi.fn()} />,
    );
    const mobileSummary = container.querySelector<HTMLElement>(".md\\:hidden");
    if (!mobileSummary) throw new Error("Le sommaire mobile est introuvable.");
    const mobile = within(mobileSummary);
    const pencil = mobile.getByRole("button", {
      name: "Modifier le solde actuel",
    });
    expect(pencil.parentElement?.className).not.toContain("justify-between");
    fireEvent.click(pencil);

    const confirmButton = mobile.getByRole("button", {
      name: "Confirmer le solde",
    });
    const cancelButton = mobile.getByRole("button", {
      name: "Annuler la modification du solde",
    });
    expect(confirmButton.parentElement?.className).not.toContain("ml-auto");
    expect(cancelButton.parentElement).toBe(confirmButton.parentElement);
  });

  it("refuse un solde vide sans lancer la sauvegarde", () => {
    const onUpdateAccountBalance = vi.fn();
    const { container } = render(
      <BudgetSummary budget={budget} onUpdateAccountBalance={onUpdateAccountBalance} />,
    );
    const mobileSummary = container.querySelector<HTMLElement>(".md\\:hidden");
    if (!mobileSummary) throw new Error("Le sommaire mobile est introuvable.");
    const mobile = within(mobileSummary);
    fireEvent.click(
      mobile.getByRole("button", { name: "Modifier le solde actuel" }),
    );
    fireEvent.change(mobile.getByLabelText("Nouveau solde du compte"), {
      target: { value: "" },
    });
    fireEvent.click(mobile.getByRole("button", { name: "Confirmer le solde" }));

    expect(mobile.getByRole("alert").textContent).toBe(
      "Veuillez saisir un solde numérique valide.",
    );
    expect(onUpdateAccountBalance).not.toHaveBeenCalled();
  });
});
