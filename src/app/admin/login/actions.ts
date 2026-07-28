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
  // Directo al destino final, NO a "/admin": esa página es a su vez un redirect a
  // /admin/proyectos, y encadenar dos redirects dentro de un Server Action le
  // devuelve HTML al cliente donde espera un payload RSC → el browser mostraba
  // "This page couldn't load" justo después de acertar la contraseña.
  redirect("/admin/proyectos");
}

/** Cierra la sesión y vuelve al login. */
export async function signOut() {
  await endSession();
  redirect("/admin/login");
}
