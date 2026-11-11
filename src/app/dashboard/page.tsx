
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import { redirect } from "next/navigation";
import LayoutDashboard from "@/components/layout-dashboard";

export default async function DashboardPage() {
  const session = await auth();


  // Redirection côté serveur si non connecté
  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <LayoutDashboard />
      </main>
    </div>
  );
}