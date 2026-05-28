"use client";

import { useEffect, useState } from "react";
import type { ServiceItem, HoursItem } from "@/lib/settings";

type Settings = {
  businessName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  aboutTitle: string;
  aboutBody: string;
  servicesTitle: string;
  servicesPricingPolicy: string;
  servicesJson: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  hoursJson: string;
};

export function ContentEditor() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [hours, setHours] = useState<HoursItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        try {
          setServices(JSON.parse(data.servicesJson || "[]"));
        } catch {
          setServices([]);
        }
        try {
          setHours(JSON.parse(data.hoursJson || "[]"));
        } catch {
          setHours([]);
        }
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setMessage("");

    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...settings,
        servicesJson: JSON.stringify(services),
        hoursJson: JSON.stringify(hours),
      }),
    });

    setSaving(false);
    setMessage(res.ok ? "Content saved successfully." : "Failed to save.");
  }

  if (!settings) return <p>Loading…</p>;

  function updateService(i: number, field: keyof ServiceItem, value: string) {
    const next = [...services];
    next[i] = { ...next[i], [field]: value };
    setServices(next);
  }

  function addService() {
    setServices([
      ...services,
      { title: "New Service", description: "", price: "" },
    ]);
  }

  function removeService(i: number) {
    setServices(services.filter((_, idx) => idx !== i));
  }

  function updateHours(i: number, field: keyof HoursItem, value: string) {
    const next = [...hours];
    next[i] = { ...next[i], [field]: value };
    setHours(next);
  }

  function addHours() {
    setHours([...hours, { days: "", hours: "" }]);
  }

  return (
    <form onSubmit={handleSave}>
      <h1 style={{ marginBottom: "1.5rem" }}>Site Content</h1>

      {message && (
        <div
          className={`alert ${message.includes("success") ? "alert-success" : "alert-error"}`}
        >
          {message}
        </div>
      )}

      <div className="admin-panel">
        <h3>Business Info</h3>
        <div className="form-group">
          <label>Business Name</label>
          <input
            value={settings.businessName}
            onChange={(e) =>
              setSettings({ ...settings, businessName: e.target.value })
            }
          />
        </div>
        <div className="form-group">
          <label>Tagline</label>
          <input
            value={settings.tagline}
            onChange={(e) =>
              setSettings({ ...settings, tagline: e.target.value })
            }
          />
        </div>
      </div>

      <div className="admin-panel">
        <h3>Home Page Hero</h3>
        <div className="form-group">
          <label>Hero Title</label>
          <input
            value={settings.heroTitle}
            onChange={(e) =>
              setSettings({ ...settings, heroTitle: e.target.value })
            }
          />
        </div>
        <div className="form-group">
          <label>Hero Subtitle</label>
          <input
            value={settings.heroSubtitle}
            onChange={(e) =>
              setSettings({ ...settings, heroSubtitle: e.target.value })
            }
          />
        </div>
      </div>

      <div className="admin-panel">
        <h3>About Section</h3>
        <div className="form-group">
          <label>About Title</label>
          <input
            value={settings.aboutTitle}
            onChange={(e) =>
              setSettings({ ...settings, aboutTitle: e.target.value })
            }
          />
        </div>
        <div className="form-group">
          <label>About Body</label>
          <textarea
            rows={5}
            value={settings.aboutBody}
            onChange={(e) =>
              setSettings({ ...settings, aboutBody: e.target.value })
            }
          />
        </div>
      </div>

      <div className="admin-panel">
        <h3>Services</h3>
        <div className="form-group">
          <label>Services Section Title</label>
          <input
            value={settings.servicesTitle}
            onChange={(e) =>
              setSettings({ ...settings, servicesTitle: e.target.value })
            }
          />
        </div>
        {services.map((s, i) => (
          <div
            key={i}
            style={{
              border: "1px solid #e2e8f0",
              padding: "1rem",
              borderRadius: 8,
              marginBottom: "1rem",
            }}
          >
            <div className="form-group">
              <label>Title</label>
              <input
                value={s.title}
                onChange={(e) => updateService(i, "title", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                rows={4}
                value={s.description}
                onChange={(e) =>
                  updateService(i, "description", e.target.value)
                }
                placeholder="Line breaks you enter here will appear on the home page."
              />
            </div>
            <div className="form-group">
              <label>Price</label>
              <input
                value={s.price}
                onChange={(e) => updateService(i, "price", e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => removeService(i)}
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" className="btn btn-secondary btn-sm" onClick={addService}>
          + Add Service
        </button>
        <div className="form-group" style={{ marginTop: "1.5rem" }}>
          <label>Pricing policy (below service cards)</label>
          <textarea
            rows={5}
            value={settings.servicesPricingPolicy}
            onChange={(e) =>
              setSettings({
                ...settings,
                servicesPricingPolicy: e.target.value,
              })
            }
            placeholder={"Prices may vary by vehicle size.\nAdd-ons quoted on site."}
          />
          <p style={{ fontSize: "0.85rem", color: "var(--gray)", marginTop: "0.35rem" }}>
            Shown centered under the pricing blocks. Line breaks are preserved.
          </p>
        </div>
      </div>

      <div className="admin-panel">
        <h3>Contact & Hours</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Phone</label>
            <input
              value={settings.contactPhone}
              onChange={(e) =>
                setSettings({ ...settings, contactPhone: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              value={settings.contactEmail}
              onChange={(e) =>
                setSettings({ ...settings, contactEmail: e.target.value })
              }
            />
          </div>
        </div>
        <div className="form-group">
          <label>Address</label>
          <input
            value={settings.contactAddress}
            onChange={(e) =>
              setSettings({ ...settings, contactAddress: e.target.value })
            }
          />
        </div>
        <h4 style={{ margin: "1rem 0 0.5rem" }}>Business Hours</h4>
        {hours.map((h, i) => (
          <div key={i} className="form-row">
            <div className="form-group">
              <label>Days</label>
              <input
                value={h.days}
                onChange={(e) => updateHours(i, "days", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Hours</label>
              <input
                value={h.hours}
                onChange={(e) => updateHours(i, "hours", e.target.value)}
              />
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-secondary btn-sm" onClick={addHours}>
          + Add Hours Row
        </button>
      </div>

      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? "Saving…" : "Save All Content"}
      </button>
    </form>
  );
}
