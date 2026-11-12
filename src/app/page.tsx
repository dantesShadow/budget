import { authenticate } from "@/app/api/auth/[...nextauth]/actions";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 rounded-xl shadow-md p-8 border border-slate-800">
        <h1 className="text-2xl font-bold text-center text-slate-100 mb-2">
          Connexion
        </h1>
        <p className="text-sm text-center text-slate-400 mb-6">
          Entrez vos identifiants pour accéder à votre espace.
        </p>

        <form action={authenticate} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-300 mb-1"
            >
              Adresse Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="nom@exemple.com"
              className="w-full px-3 py-2 appearance-none bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 cursor-pointer pr-10 focus:outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-300 mb-1"
            >
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-3 py-2 appearance-none bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 cursor-pointer pr-10 focus:outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition shadow-lg shadow-emerald-900/30"
          >
            Se connecter
          </button>
        </form>
      </div>
    </main>
  );
}