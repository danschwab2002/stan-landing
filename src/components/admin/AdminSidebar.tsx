"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS = [
  { label: "Proyectos", href: "/admin/proyectos", enabled: true },
  { label: "Áreas", href: "/admin/disciplinas", enabled: true },
  { label: "Servicios", href: "#", enabled: false },
  { label: "Clientes", href: "#", enabled: false },
  { label: "Reel destacado", href: "#", enabled: false },
  { label: "Videos verticales", href: "#", enabled: false },
];

export function AdminSidebar() {
  const pathname = usePathname() ?? "";

  return (
    <aside className="w-56 shrink-0">
      <div className="mb-8">
        <p className="font-display text-xl font-black tracking-tight">STAN</p>
        <p className="text-xs uppercase tracking-[0.2em] text-black/45">
          Panel de contenido
        </p>
      </div>

      <nav className="space-y-1">
        {SECTIONS.map((s) => {
          const active = s.enabled && pathname.startsWith(s.href);
          return s.enabled ? (
            <Link
              key={s.label}
              href={s.href}
              className={
                active
                  ? "block rounded-lg bg-[#16170f] px-3 py-2 text-sm font-semibold text-[#f5f3ec]"
                  : "block rounded-lg px-3 py-2 text-sm font-medium text-black/60 transition-colors hover:bg-black/5 hover:text-[#16170f]"
              }
            >
              {s.label}
            </Link>
          ) : (
            <span
              key={s.label}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-black/35"
              title="Próximamente"
            >
              {s.label}
              <span className="text-[10px] uppercase tracking-wider">pronto</span>
            </span>
          );
        })}
      </nav>

      <div className="mt-8 border-t border-black/10 pt-4">
        <Link
          href="/"
          className="text-xs font-semibold uppercase tracking-wider text-black/50 transition-colors hover:text-[#16170f]"
        >
          ← Ver el sitio
        </Link>
      </div>
    </aside>
  );
}
