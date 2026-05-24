"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/appointments", label: "Appointments" },
  { href: "/admin/content", label: "Site Content" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/settings", label: "Settings & Email" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <div style={{ padding: "0 1.5rem 1.5rem", fontWeight: 700, fontSize: "1.1rem" }}>
        Admin Panel
      </div>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={
            pathname === link.href ||
            (link.href !== "/admin" && pathname.startsWith(link.href))
              ? "active"
              : ""
          }
        >
          {link.label}
        </Link>
      ))}
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/admin/login" })}
        style={{
          display: "block",
          width: "100%",
          textAlign: "left",
          padding: "0.75rem 1.5rem",
          background: "none",
          border: "none",
          color: "#94a3b8",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: "1rem",
          marginTop: "2rem",
        }}
      >
        Sign Out
      </button>
    </aside>
  );
}
