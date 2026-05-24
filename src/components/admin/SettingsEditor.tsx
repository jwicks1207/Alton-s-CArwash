"use client";

import { useEffect, useState } from "react";
import {
  parseAcceptedZipcodes,
  zipcodesFromText,
  zipcodesToText,
} from "@/lib/zipcodes";

type Settings = {
  notificationEmail: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  mobileCarwashEnabled: boolean;
  acceptedZipcodesJson: string;
};

export function SettingsEditor() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [zipText, setZipText] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data: Settings) => {
        setSettings(data);
        setZipText(
          zipcodesToText(parseAcceptedZipcodes(data.acceptedZipcodesJson || "[]"))
        );
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setMessage("");

    const acceptedZipcodesJson = JSON.stringify(zipcodesFromText(zipText));

    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...settings,
        acceptedZipcodesJson,
      }),
    });

    setSaving(false);
    setMessage(
      res.ok
        ? "Settings saved."
        : "Failed to save settings."
    );
  }

  if (!settings) return <p>Loading…</p>;

  const zipCount = zipcodesFromText(zipText).length;

  return (
    <form onSubmit={handleSave}>
      <h1 style={{ marginBottom: "1.5rem" }}>Settings & Email</h1>

      {message && (
        <div
          className={`alert ${message.includes("saved") ? "alert-success" : "alert-error"}`}
        >
          {message}
        </div>
      )}

      <div className="admin-panel">
        <h3>Mobile Car Wash</h3>
        <p style={{ marginBottom: "1rem", color: "var(--gray)", fontSize: "0.9rem" }}>
          Turn this on when mobile service is ready. Customers will see a checkbox on
          the booking form to request a mobile wash at their address.
        </p>

        <label className="checkbox-label admin-checkbox">
          <input
            type="checkbox"
            checked={settings.mobileCarwashEnabled}
            onChange={(e) =>
              setSettings({
                ...settings,
                mobileCarwashEnabled: e.target.checked,
              })
            }
          />
          <span>
            <strong>Enable mobile car wash</strong> on the public booking form
          </span>
        </label>

        <div className="form-group" style={{ marginTop: "1.25rem" }}>
          <label>Accepted zip codes (one per line)</label>
          <textarea
            rows={8}
            value={zipText}
            onChange={(e) => setZipText(e.target.value)}
            placeholder={"12345\n67890\n90210"}
            disabled={!settings.mobileCarwashEnabled}
          />
          <p style={{ fontSize: "0.85rem", color: "var(--gray)", marginTop: "0.35rem" }}>
            {zipCount} zip code{zipCount === 1 ? "" : "s"} configured.
            Customers outside these areas see: &ldquo;Zipcode not within service area.&rdquo;
          </p>
        </div>
      </div>

      <div className="admin-panel">
        <h3>Appointment Notifications</h3>
        <p style={{ marginBottom: "1rem", color: "var(--gray)" }}>
          When someone books online or you add a call-in, an email is sent to this
          address with all appointment details.
        </p>
        <div className="form-group">
          <label>Notification Email *</label>
          <input
            type="email"
            required
            value={settings.notificationEmail}
            onChange={(e) =>
              setSettings({ ...settings, notificationEmail: e.target.value })
            }
            placeholder="owner@example.com"
          />
        </div>
      </div>

      <div className="admin-panel">
        <h3>SMTP (Email Sending)</h3>
        <p style={{ marginBottom: "1rem", color: "var(--gray)", fontSize: "0.9rem" }}>
          Configure your email provider (Gmail, Outlook, SendGrid, etc.). You can also
          set SMTP_HOST, SMTP_USER, SMTP_PASS in .env as a fallback.
        </p>
        <div className="form-row">
          <div className="form-group">
            <label>SMTP Host</label>
            <input
              value={settings.smtpHost}
              onChange={(e) =>
                setSettings({ ...settings, smtpHost: e.target.value })
              }
              placeholder="smtp.gmail.com"
            />
          </div>
          <div className="form-group">
            <label>SMTP Port</label>
            <input
              value={settings.smtpPort}
              onChange={(e) =>
                setSettings({ ...settings, smtpPort: e.target.value })
              }
              placeholder="587"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>SMTP Username</label>
            <input
              value={settings.smtpUser}
              onChange={(e) =>
                setSettings({ ...settings, smtpUser: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>SMTP Password</label>
            <input
              type="password"
              value={settings.smtpPass}
              onChange={(e) =>
                setSettings({ ...settings, smtpPass: e.target.value })
              }
            />
          </div>
        </div>
        <div className="form-group">
          <label>From Address</label>
          <input
            value={settings.smtpFrom}
            onChange={(e) =>
              setSettings({ ...settings, smtpFrom: e.target.value })
            }
            placeholder="noreply@yourdomain.com"
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? "Saving…" : "Save Settings"}
      </button>
    </form>
  );
}
