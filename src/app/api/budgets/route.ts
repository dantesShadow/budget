import type { Budget } from "@/models/budget";
import { connectToDatabase } from "@/lib/db";

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
        }) satisfies Budget
    )
  );
}

export async function POST(request: Request) {
  let body: Omit<Budget, "id">;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Le corps de la requête doit être un JSON valide." },
      { status: 400 }
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("periodName" in body) ||
    typeof body.periodName !== "string" ||
    body.periodName.trim().length === 0
  ) {
    return Response.json(
      { error: "Le champ periodName est obligatoire." },
      { status: 400 }
    );
  }

  const periodName = body.periodName.trim();
  const database = await connectToDatabase();
  const result = await database.connection
    .collection("budgets")
    .insertOne({ periodName });
  const budget: Budget = {
    id: result.insertedId.toString(),
    periodName,
  };

  return Response.json(budget, { status: 201 });
}
