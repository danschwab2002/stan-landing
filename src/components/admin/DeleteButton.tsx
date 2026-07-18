"use client";

import { removeProject } from "@/app/admin/actions";

export function DeleteButton({ id }: { id: number }) {
  return (
    <form
      action={removeProject}
      onSubmit={(e) => {
        if (!confirm("¿Borrar este proyecto? No se puede deshacer.")) {
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
