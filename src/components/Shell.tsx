"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { label: "Setup", icon: "⚑", path: "" },
  { label: "Roll Call", icon: "☰", path: "/rollcall" },
  { label: "GSL", icon: "🎙", path: "/gsl" },
  { label: "GSL Lists", icon: "☑", path: "/gsl/list" },
  { label: "Moderated Caucus", icon: "💬", path: "/mods" },
  { label: "Chits", icon: "✉", path: "/chits" },
  { label: "Documentation", icon: "📄", path: "/documentation" },
  { label: "Points of Order", icon: "⚖", path: "/poo" },
  { label: "Motions", icon: "🗳", path: "/motions" },
  { label: "Master Sheet", icon: "▦", path: "/master" },
  { label: "Awards", icon: "🏆", path: "/awards" },
];

export function Shell({
  conferenceName,
  committeeName,
  conferenceId,
  committeeId,
  children,
}: {
  conferenceName: string;
  committeeName: string;
  conferenceId: string;
  committeeId: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const base = `/dashboard/${conferenceId}/${committeeId}`;

  return (
    <div className="min-h-screen bg-paper">
      {/* Rostrum header */}
      <header className="sticky top-0 z-40 flex items-center gap-4 px-6 py-3 bg-panel/90 backdrop-blur border-b border-line">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl grid place-items-center font-serif font-bold text-white bg-gradient-to-br from-primary to-primary-deep shadow-md">
            {committeeName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-accent">
              {conferenceName}
            </div>
            <div className="text-lg font-semibold text-ink leading-tight">
              {committeeName}
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-65px)]">
        {/* Sidenav */}
        <nav className="w-56 shrink-0 border-r border-line bg-white/50 p-3 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const href = `${base}${item.path}`;
            const active = pathname === href;
            return (
              <Link
                key={item.path}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary-soft text-primary-deep font-semibold"
                    : "text-muted hover:bg-wash hover:text-ink"
                }`}
              >
                <span className="w-5 text-center text-sm opacity-80">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Content */}
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex-1 min-w-0 px-8 py-8 max-w-6xl"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}