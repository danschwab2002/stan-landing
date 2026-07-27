import type { Metadata } from "next";
import { authConfigured } from "@/lib/auth";
import { signIn } from "./actions";

// Vive fuera del route group (panel) → NO hereda el layout con sidebar; usa el root.
export const metadata: Metadata = {
  title: "STAN — Ingreso al panel",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const configured = authConfigured();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eceae1] px-6 text-[#16170f]">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-2xl font-black tracking-[0.07em]">STAN</p>
          <p className="text-xs uppercase tracking-[0.2em] text-black/45">Panel de contenido</p>
        </div>

        {!configured && (
          <p className="mb-4 rounded-lg border border-amber-600/25 bg-amber-600/10 px-4 py-2.5 text-sm text-amber-800">
            Falta configurar <code>ADMIN_PASSWORD</code> y <code>SESSION_SECRET</code> en el
            servidor.
          </p>
        )}
        {error && (
          <p className="mb-4 rounded-lg border border-red-600/25 bg-red-600/10 px-4 py-2.5 text-sm text-red-800">
            Contraseña incorrecta.
          </p>
        )}

        <form action={signIn} className="grid gap-4">
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/55"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoFocus
              required
              className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#16170f]"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-[#16170f] px-5 py-2.5 text-sm font-semibold text-[#f5f3ec] transition-opacity hover:opacity-80"
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}
