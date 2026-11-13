import type { Budget, PosteBudgetaire } from "@/models/budget";
import { connectToDatabase } from "@/lib/db";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeIncomes(value: unknown): PosteBudgetaire[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seenUuids = new Set<string>();
  return value.map((entry) => {
    const income = isRecord(entry) ? entry : {};
    let uuid =
      typeof income.uuid === "string" && UUID_PATTERN.test(income.uuid)
        ? income.uuid
        : crypto.randomUUID();
    while (seenUuids.has(uuid)) {
      uuid = crypto.randomUUID();
    }
    seenUuids.add(uuid);

    return {
      uuid,
      source: typeof income.source === "string" ? income.source : "",
      plannedAmount:
        typeof income.plannedAmount === "number" && Number.isFinite(income.plannedAmount)
          ? income.plannedAmount
          : 0,
      reelAmount:
        typeof income.reelAmount === "number" && Number.isFinite(income.reelAmount)
          ? income.reelAmount
          : 0,
      note: typeof income.note === "string" ? income.note : "",
    };
  });
}

export async function GET() {
  const database = await connectToDatabase();
  const collection = database.connection.collection("budgets");
  const budgets = await collection.find({}).toArray();

  return Response.json(
    await Promise.all(
      budgets.map(async (budget) => {
        const storedIncomes = Array.isArray(budget.incomes)
          ? budget.incomes
          : [];
        const incomes = normalizeIncomes(storedIncomes);
        const needsUuidMigration = storedIncomes.some(
          (income, index) => !isRecord(income) || income.uuid !== incomes[index].uuid
        );

        if (needsUuidMigration) {
          await collection.updateOne(
            { _id: budget._id, incomes: storedIncomes },
            { $set: { incomes } }
          );
        }

        return {
          id: budget._id.toString(),
          periodName: budget.periodName,
          initialBalance:
            typeof budget.initialBalance === "number" ? budget.initialBalance : 0,
          incomes,
        } satisfies Budget;
      })
    )
  );
}

export async function POST(request: Request) {
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

  if (
    typeof body.periodName !== "string" ||
    body.periodName.trim().length === 0 ||
    ("initialBalance" in body &&
      (typeof body.initialBalance !== "number" ||
        !Number.isFinite(body.initialBalance)))
  ) {
    return Response.json(
      { error: "Le nom de période ou le solde initial est invalide." },
      { status: 400 }
    );
  }

  const periodName = body.periodName.trim();
  const initialBalance =
    typeof body.initialBalance === "number" ? body.initialBalance : 0;
  const database = await connectToDatabase();
  const result = await database.connection
    .collection("budgets")
    .insertOne({ periodName, initialBalance });
  const budget: Budget = {
    id: result.insertedId.toString(),
    periodName,
    initialBalance,
    incomes: [],
  };

  return Response.json(budget, { status: 201 });
}
