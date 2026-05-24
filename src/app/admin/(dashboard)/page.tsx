import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [booked, confirmed, canceled, total] = await Promise.all([
    prisma.appointment.count({ where: { status: "BOOKED" } }),
    prisma.appointment.count({ where: { status: "CONFIRMED" } }),
    prisma.appointment.count({ where: { status: "CANCELED" } }),
    prisma.appointment.count(),
  ]);

  return (
    <div>
      <h1 style={{ marginBottom: "1.5rem" }}>Dashboard</h1>

      <div className="card-grid" style={{ marginBottom: "2rem" }}>
        <div className="card" style={{ borderLeft: "4px solid var(--booked)" }}>
          <h3>Booked</h3>
          <p style={{ fontSize: "2rem", fontWeight: 700 }}>{booked}</p>
          <p style={{ color: "var(--gray)", fontSize: "0.9rem" }}>
            Awaiting confirmation
          </p>
        </div>
        <div className="card" style={{ borderLeft: "4px solid var(--confirmed)" }}>
          <h3>Confirmed</h3>
          <p style={{ fontSize: "2rem", fontWeight: 700 }}>{confirmed}</p>
        </div>
        <div className="card" style={{ borderLeft: "4px solid var(--canceled)" }}>
          <h3>Canceled</h3>
          <p style={{ fontSize: "2rem", fontWeight: 700 }}>{canceled}</p>
        </div>
        <div className="card">
          <h3>Total</h3>
          <p style={{ fontSize: "2rem", fontWeight: 700 }}>{total}</p>
        </div>
      </div>

      <div className="admin-panel">
        <h3>Quick Links</h3>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1rem" }}>
          <Link href="/admin/appointments" className="btn btn-primary">
            Manage Appointments
          </Link>
          <Link href="/admin/content" className="btn btn-secondary">
            Edit Site Content
          </Link>
          <Link href="/admin/settings" className="btn btn-secondary">
            Email Settings
          </Link>
          <Link href="/" className="btn btn-secondary" target="_blank">
            View Website
          </Link>
        </div>
      </div>
    </div>
  );
}
