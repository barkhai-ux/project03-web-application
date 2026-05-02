"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { LogoMark } from "./logo-mark";

const TABS = [
  { href: "/dashboard", label: "Today" },
  { href: "/habits", label: "Habits" },
  { href: "/settings", label: "Settings" },
];

export function TopNav() {
  const pathname = usePathname();
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-7 pt-[18px] pb-2.5">
      <Link href="/dashboard" className="flex items-center gap-2.5 ink no-underline w-fit">
        <LogoMark size={28} />
        <span className="text-[18px] font-semibold tracking-[-0.01em]">Final</span>
      </Link>

      <nav className="pill-group">
        {TABS.map((t) => {
          const active =
            t.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={
                "px-4 py-2 rounded-full text-[13px] font-medium transition-all " +
                (active
                  ? "bg-[var(--ink-900)] text-[#fbf3e6] shadow-[0_4px_10px_-4px_rgba(0,0,0,0.3)]"
                  : "text-[var(--ink-700)] hover:text-[var(--ink-900)]")
              }
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2.5 justify-end">
        <form action="/auth/sign-out" method="POST">
          <button
            type="submit"
            className="text-[12px] small-caps text-[var(--ink-500)] hover:text-[var(--ink-900)] transition-colors"
          >
            Sign out
          </button>
        </form>
        <button type="button" className="icon-btn" aria-label="Notifications">
          <Bell size={16} />
          <span className="dot" />
        </button>
      </div>
    </div>
  );
}
