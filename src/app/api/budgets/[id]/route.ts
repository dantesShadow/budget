import { ObjectId } from "mongodb";
import type { Budget, PosteBudgetaire } from "@/models/budget";
import { connectToDatabase } from "@/lib/db";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseIncomes(value: unknown): PosteBudgetaire[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const incomes: PosteBudgetaire[] = [];
  const seenUuids = new Set<string>();

  for (const income of value) {
    if (
      !isRecord(income) ||
      typeof income.source !== "string" ||
      ("uuid" in income &&
        (typeof income.uuid !== "string" ||
          !UUID_PATTERN.test(income.uuid))) ||
      ("amount" in income &&
        (typeof income.amount !== "number" ||
          !Number.isFinite(income.amount))) ||
      ("note" in income && typeof income.note !== "string")
    ) {
      return null;
    }

    const uuid =
      typeof income.uuid === "string" ? income.uuid : crypto.randomUUID();
    if (seenUuids.has(uuid)) {
      return null;
    }
    seenUuids.add(uuid);

    incomes.push({
      uuid,
      source: income.source,
      ...(typeof income.amount === "number" ? { amount: income.amount } : { amount: 0 }),
      ...(typeof income.note === "string" ? { note: income.note } : { note: "" }),
    });
  }

  return incomes;
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
    const incomes = parseIncomes(body.incomes);
    if (!incomes) {
      return Response.json(
        { error: "La liste des revenus est invalide." },
        { status: 400 }
      );
    }
    updates.incomes = incomes;
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
          amount: typeof income.amount === "number" ? income.amount : 0,
          note: typeof income.note === "string" ? income.note : "",
        }))
      : [],
  };

  return Response.json(budget);
}