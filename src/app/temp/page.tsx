import { auth } from "@/app/auth/auth";
import { redirect } from "next/navigation";
import { handleSignOut } from "@/app/auth/actions";

export default async function DashboardPage() {
  const session = await auth();

  // Redirection côté serveur si non connecté
  if (!session?.user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Espace Protégé
            </h1>
            <p className="text-sm text-gray-500">
              Bienvenue, {session.user.name || session.user.email} !
            </p>
          </div>

          <form action={handleSignOut}>
            <button
              type="submit"
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors"
            >
              Déconnexion
            </button>
          </form>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-blue-800 text-sm">
          <p className="font-semibold mb-1">Information de Session :</p>
          <pre className="bg-white p-3 rounded border border-blue-100 text-xs text-gray-700 overflow-x-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      </div>
    </main>
  );
}