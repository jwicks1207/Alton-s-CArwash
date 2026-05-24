"use client";

import { useEffect, useState } from "react";

type GalleryImage = {
  id: string;
  url: string;
  caption: string;
  sortOrder: number;
};

export function GalleryManager() {
  const [items, setItems] = useState<GalleryImage[]>([]);
  const [form, setForm] = useState({ url: "", caption: "" });

  async function load() {
    const res = await fetch("/api/admin/gallery");
    if (res.ok) setItems(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, sortOrder: items.length }),
    });
    setForm({ url: "", caption: "" });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this image?")) return;
    await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 style={{ marginBottom: "1.5rem" }}>Gallery</h1>

      <div className="admin-panel">
        <h3>Add Image</h3>
        <p style={{ marginBottom: "1rem", color: "var(--gray)", fontSize: "0.9rem" }}>
          Paste an image URL (e.g. from Unsplash or your own hosting).
        </p>
        <form onSubmit={handleAdd}>
          <div className="form-group">
            <label>Image URL</label>
            <input
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              required
              placeholder="https://..."
            />
          </div>
          <div className="form-group">
            <label>Caption</label>
            <input
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">
            Add Image
          </button>
        </form>
      </div>

      <div className="admin-panel">
        <div className="gallery-grid">
          {items.map((item) => (
            <div key={item.id} className="gallery-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={item.caption} />
              <div className="gallery-caption">{item.caption}</div>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                style={{ position: "absolute", top: 8, right: 8 }}
                onClick={() => handleDelete(item.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
