
import { Suspense } from "react";
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import LayoutDashboard from "@/components/layout-dashboard";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <Suspense fallback={<p role="status">Chargement du tableau de bord...</p>}>
          <AuthenticatedDashboard />
        </Suspense>
      </main>
    </div>
  );
}

async function AuthenticatedDashboard() {
  await connection();
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return <LayoutDashboard />;
}