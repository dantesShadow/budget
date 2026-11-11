import type { Budget } from "@/models/budget";
import { connectToDatabase } from "@/lib/db";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function GET() {
  const database = await connectToDatabase();
  const budgets = await database.connection
    .collection("budgets")
    .find({})
    .toArray();

  return Response.json(
    budgets.map(
      (budget) =>
        ({
          id: budget._id.toString(),
          periodName: budget.periodName,
          initialBalance:
            typeof budget.initialBalance === "number" ? budget.initialBalance : 0,
        }) satisfies Budget
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
  };

  return Response.json(budget, { status: 201 });
}
