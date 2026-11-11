import { authenticate } from "@/app/auth/actions";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 border border-gray-100">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Connexion
        </h1>
        <p className="text-sm text-center text-gray-500 mb-6">
          Entrez vos identifiants pour accéder à votre espace.
        </p>

        <form action={authenticate} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Adresse Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="nom@exemple.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors duration-200 shadow-sm"
          >
            Se connecter
          </button>
        </form>
      </div>
    </main>
  );
}