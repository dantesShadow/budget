import { ObjectId } from "mongodb";
import type { Budget, PosteBudgetaire } from "@/models/budget";
import { connectToDatabase } from "@/lib/db";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parsePostes(value: unknown): PosteBudgetaire[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const postes: PosteBudgetaire[] = [];
  const seenUuids = new Set<string>();

  for (const poste of value) {
    if (
      !isRecord(poste) ||
      typeof poste.source !== "string" ||
      ("uuid" in poste &&
        (typeof poste.uuid !== "string" ||
          !UUID_PATTERN.test(poste.uuid))) ||
      ("plannedAmount" in poste &&
        (typeof poste.plannedAmount !== "number" ||
          !Number.isFinite(poste.plannedAmount))) ||
      ("reelAmount" in poste &&
        (typeof poste.reelAmount !== "number" ||
          !Number.isFinite(poste.reelAmount))) ||
      ("note" in poste && typeof poste.note !== "string")
    ) {
      return null;
    }

    const uuid =
      typeof poste.uuid === "string" ? poste.uuid : crypto.randomUUID();
    if (seenUuids.has(uuid)) {
      return null;
    }
    seenUuids.add(uuid);

    postes.push({
      uuid,
      source: poste.source,
      ...(typeof poste.plannedAmount === "number" ? { plannedAmount: poste.plannedAmount } : { plannedAmount: 0 }),
      ...(typeof poste.reelAmount === "number" ? { reelAmount: poste.reelAmount } : { reelAmount: 0 }),
      ...(typeof poste.note === "string" ? { note: poste.note } : { note: "" }),
    });
  }

  return postes;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!/^[a-f\d]{24}$/i.test(id)) {
    return Response.json(
      { error: "L'identifiant du budget est invalide." },
      { status: 400 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Le corps de la requête doit être un JSON valide." },
      { status: 400 }
    );
  }

  if (!isRecord(body)) {
    return Response.json(
      { error: "Le corps de la requête doit être un objet JSON." },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = {};

  if ("periodName" in body) {
    if (
      typeof body.periodName !== "string" ||
      body.periodName.trim().length === 0
    ) {
      return Response.json(
        { error: "Le nom de période est invalide." },
        { status: 400 }
      );
    }
    updates.periodName = body.periodName.trim();
  }

  if ("initialBalance" in body) {
    if (
      typeof body.initialBalance !== "number" ||
      !Number.isFinite(body.initialBalance)
    ) {
      return Response.json(
        { error: "Le solde initial est invalide." },
        { status: 400 }
      );
    }
    updates.initialBalance = body.initialBalance;
  }

  if ("incomes" in body) {
    const incomes = parsePostes(body.incomes);
    if (!incomes) {
      return Response.json(
        { error: "La liste des revenus est invalide." },
        { status: 400 }
      );
    }
    updates.incomes = incomes;
  }

  if ("expenses" in body) {
    const expenses = parsePostes(body.expenses);
    if (!expenses) {
      return Response.json(
        { error: "La liste des dépenses est invalide." },
        { status: 400 }
      );
    }
    updates.expenses = expenses;
  }

  if (Object.keys(updates).length === 0) {
    return Response.json(
      { error: "Aucune donnée valide à modifier." },
      { status: 400 }
    );
  }

  const database = await connectToDatabase();
  const collection = database.connection.collection("budgets");
  const objectId = new ObjectId(id);
  const result = await collection.updateOne(
    { _id: objectId },
    { $set: updates }
  );

  if (result.matchedCount === 0) {
    return Response.json(
      { error: "Le budget est introuvable." },
      { status: 404 }
    );
  }

  const updatedBudget = await collection.findOne({ _id: objectId });
  if (!updatedBudget) {
    throw new Error("Le budget modifié est introuvable.");
  }

  const budget: Budget = {
    id: updatedBudget._id.toString(),
    periodName: updatedBudget.periodName,
    initialBalance:
      typeof updatedBudget.initialBalance === "number"
        ? updatedBudget.initialBalance
        : 0,
    incomes: Array.isArray(updatedBudget.incomes)
      ? updatedBudget.incomes.map((income) => ({
          uuid:
            typeof income.uuid === "string" &&
            UUID_PATTERN.test(income.uuid)
              ? income.uuid
              : crypto.randomUUID(),
          source: income.source,
          plannedAmount: typeof income.plannedAmount === "number" ? income.plannedAmount : 0,
          reelAmount: typeof income.reelAmount === "number" ? income.reelAmount : 0,
          note: typeof income.note === "string" ? income.note : "",
        }))
      : [],
    expenses: Array.isArray(updatedBudget.expenses)
      ? updatedBudget.expenses.map((expense) => ({
          uuid:
            typeof expense.uuid === "string" &&
            UUID_PATTERN.test(expense.uuid)
              ? expense.uuid
              : crypto.randomUUID(),
          source: expense.source,
          plannedAmount: typeof expense.plannedAmount === "number" ? expense.plannedAmount : 0,
          reelAmount: typeof expense.reelAmount === "number" ? expense.reelAmount : 0,
          note: typeof expense.note === "string" ? expense.note : "",
        }))
      : [],
  };

  return Response.json(budget);
}