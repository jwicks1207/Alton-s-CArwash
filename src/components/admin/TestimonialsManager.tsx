"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

type Testimonial = {
  id: string;
  name: string;
  quote: string;
  rating: number;
  status: "PENDING" | "APPROVED";
  sortOrder: number;
  createdAt: string;
};

type Tab = "PENDING" | "APPROVED" | "ALL";

export function TestimonialsManager() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [tab, setTab] = useState<Tab>("PENDING");
  const [form, setForm] = useState({ name: "", quote: "", rating: 5 });

  async function load() {
    const res = await fetch("/api/admin/testimonials");
    if (res.ok) setItems(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  const filtered =
    tab === "ALL" ? items : items.filter((i) => i.status === tab);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        status: "APPROVED",
        sortOrder: items.length,
      }),
    });
    setForm({ name: "", quote: "", rating: 5 });
    load();
  }

  async function handleApprove(id: string) {
    await fetch(`/api/admin/testimonials/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "APPROVED" }),
    });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
    load();
  }

  const pendingCount = items.filter((i) => i.status === "PENDING").length;

  return (
    <div>
      <h1 style={{ marginBottom: "1.5rem" }}>Testimonials</h1>

      {pendingCount > 0 && (
        <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
          {pendingCount} review{pendingCount === 1 ? "" : "s"} waiting for approval
        </div>
      )}

      <div className="admin-tabs">
        {(
          [
            ["PENDING", `Pending (${pendingCount})`],
            ["APPROVED", "Approved"],
            ["ALL", "All"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`admin-tab ${tab === key ? "active" : ""}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="admin-panel">
        <h3>Add Testimonial (published immediately)</h3>
        <form onSubmit={handleAdd}>
          <div className="form-row">
            <div className="form-group">
              <label>Customer Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Rating (1-5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={form.rating}
                onChange={(e) =>
                  setForm({ ...form, rating: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <div className="form-group">
            <label>Quote</label>
            <textarea
              rows={3}
              value={form.quote}
              onChange={(e) => setForm({ ...form, quote: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">
            Add & Publish
          </button>
        </form>
      </div>

      <div className="admin-panel">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Quote</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Submitted</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ color: "var(--gray)" }}>
                  No testimonials in this section.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td style={{ maxWidth: 320 }}>{item.quote}</td>
                  <td>{"★".repeat(item.rating)}</td>
                  <td>
                    <span
                      style={{
                        color:
                          item.status === "APPROVED"
                            ? "var(--confirmed)"
                            : "var(--warning)",
                        fontWeight: 600,
                      }}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td>
                    {item.createdAt
                      ? formatDistanceToNow(new Date(item.createdAt), {
                          addSuffix: true,
                        })
                      : "—"}
                  </td>
                  <td>
                    <div className="appointment-actions">
                      {item.status === "PENDING" && (
                        <button
                          type="button"
                          className="btn btn-success btn-sm"
                          onClick={() => handleApprove(item.id)}
                        >
                          Approve
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
