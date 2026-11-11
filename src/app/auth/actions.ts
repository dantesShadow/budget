"use server";

import { signIn, signOut } from "@/app/auth/auth";

export async function authenticate(formData: FormData) {
  await signIn("credentials", {
    ...Object.fromEntries(formData),
    redirectTo: "/temp",
  });
}

export async function handleSignOut() {
  await signOut({ redirectTo: "/" });
}