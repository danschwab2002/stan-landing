"use server";

import { redirect } from "next/navigation";
import { checkPassword } from "@/lib/auth";
import { endSession, startSession } from "@/lib/auth-server";

/** Valida la contraseña y, si es correcta, abre la sesión. */
export async function signIn(formData: FormData) {
  const password = (formData.get("password") ?? "").toString();
  if (!(await checkPassword(password))) {
    redirect("/admin/login?error=1");
  }
  await startSession();
  redirect("/admin");
}

/** Cierra la sesión y vuelve al login. */
export async function signOut() {
  await endSession();
  redirect("/admin/login");
}
