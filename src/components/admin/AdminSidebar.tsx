import Link from "next/link";

const SECTIONS = [
  { label: "Proyectos", href: "/admin/proyectos", active: true },
  { label: "Servicios", href: "#", active: false },
  { label: "Clientes", href: "#", active: false },
  { label: "Reel destacado", href: "#", active: false },
  { label: "Videos verticales", href: "#", active: false },
];

export function AdminSidebar() {
  return (
    <aside className="w-56 shrink-0">
      <div className="mb-8">
        <p className="font-display text-xl font-black tracking-tight">STAN</p>
        <p className="text-xs uppercase tracking-[0.2em] text-black/45">
          Panel de contenido
        </p>
      </div>

      <nav className="space-y-1">
        {SECTIONS.map((s) =>
          s.active ? (
            <Link
              key={s.label}
              href={s.href}
              className="block rounded-lg bg-[#16170f] px-3 py-2 text-sm font-semibold text-[#f5f3ec]"
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
          ),
        )}
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
