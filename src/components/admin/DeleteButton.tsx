"use client";

import { removeProject } from "@/app/admin/actions";

/**
 * Botón de borrado con confirmación. Genérico: recibe la server action a
 * ejecutar (por defecto `removeProject`, para no romper los usos existentes).
 */
export function DeleteButton({
  id,
  action = removeProject,
  confirmMessage = "¿Borrar este elemento? No se puede deshacer.",
}: {
  id: number;
  action?: (formData: FormData) => void | Promise<void>;
  confirmMessage?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-xs font-semibold text-red-700 transition-opacity hover:opacity-70"
      >
        Borrar
      </button>
    </form>
  );
}
