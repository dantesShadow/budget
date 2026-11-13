"use server";

import { signIn, signOut } from "@/app/api/auth/[...nextauth]/auth";

export async function authenticate(formData: FormData) {
  await signIn("credentials", {
    ...Object.fromEntries(formData),
    redirectTo: "/dashboard",
  });
}

export async function handleSignOut() {
  await signOut({ redirectTo: "/" });
}