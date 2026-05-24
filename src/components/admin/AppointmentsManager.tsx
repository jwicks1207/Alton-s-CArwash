"use client";

import { useCallback, useEffect, useState } from "react";
import { AppointmentCalendar, type CalendarAppointment } from "./AppointmentCalendar";
import { CAR_TYPES, TIME_SLOTS } from "@/lib/appointments";

type Appointment = CalendarAppointment;

type Tab = "BOOKED" | "CONFIRMED" | "CANCELED";

export function AppointmentsManager() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("BOOKED");
  const [month, setMonth] = useState(new Date());
  const [showCallIn, setShowCallIn] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [mobileCarwashEnabled, setMobileCarwashEnabled] = useState(false);
  const [callInMobile, setCallInMobile] = useState(false);

  const fetchAppointments = useCallback(async () => {
    const res = await fetch("/api/admin/appointments");
    if (res.ok) {
      const data = await res.json();
      setAppointments(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAppointments();
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((s) => setMobileCarwashEnabled(!!s.mobileCarwashEnabled));
  }, [fetchAppointments]);

  const filtered = appointments.filter((a) => a.status === tab);

  async function updateStatus(id: string, status: Tab) {
    setActionLoading(id);
    await fetch(`/api/admin/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await fetchAppointments();
    setActionLoading(null);
  }

  async function handleCallIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const isMobile = mobileCarwashEnabled && fd.get("isMobile") === "on";

    const res = await fetch("/api/admin/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        phone: fd.get("phone"),
        carType: fd.get("carType"),
        date: fd.get("date"),
        time: fd.get("time"),
        comments: fd.get("comments") || "",
        status: fd.get("status") || "BOOKED",
        isMobile,
        address: isMobile ? fd.get("address") : "",
        zipCode: isMobile ? fd.get("zipCode") : "",
      }),
    });

    if (res.ok) {
      form.reset();
      setCallInMobile(false);
      setShowCallIn(false);
      await fetchAppointments();
    } else {
      const err = await res.json();
      alert(err.error || "Could not save appointment");
    }
  }

  if (loading) return <p>Loading appointments…</p>;

  return (
    <div>
      <div className="admin-header">
        <h1>Appointments</h1>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowCallIn(!showCallIn)}
        >
          {showCallIn ? "Cancel" : "+ Call-in Appointment"}
        </button>
      </div>

      {showCallIn && (
        <div className="admin-panel" style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>New Call-in Appointment</h3>
          <form onSubmit={handleCallIn}>
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input name="name" required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input name="phone" required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Car Type</label>
                <select name="carType" required defaultValue="Sedan">
                  {CAR_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" defaultValue="BOOKED">
                  <option value="BOOKED">Booked</option>
                  <option value="CONFIRMED">Confirmed</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input name="date" type="date" required />
              </div>
              <div className="form-group">
                <label>Time</label>
                <select name="time" required>
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {mobileCarwashEnabled && (
              <div className="mobile-booking-block">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isMobile"
                    checked={callInMobile}
                    onChange={(e) => setCallInMobile(e.target.checked)}
                  />
                  <span>Mobile car wash (customer location)</span>
                </label>
                {callInMobile && (
                  <div className="mobile-fields">
                    <div className="form-group">
                      <label>Service Address</label>
                      <input name="address" required={callInMobile} />
                    </div>
                    <div className="form-group">
                      <label>Zip Code</label>
                      <input name="zipCode" required={callInMobile} maxLength={10} />
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="form-group">
              <label>Comments</label>
              <textarea name="comments" rows={2} />
            </div>
            <button type="submit" className="btn btn-primary">
              Save Call-in
            </button>
          </form>
        </div>
      )}

      <div className="admin-panel">
        <AppointmentCalendar
          appointments={appointments}
          month={month}
          onMonthChange={setMonth}
        />
      </div>

      <div className="admin-tabs">
        {(["BOOKED", "CONFIRMED", "CANCELED"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`admin-tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0) + t.slice(1).toLowerCase()} (
            {appointments.filter((a) => a.status === t).length})
          </button>
        ))}
      </div>

      <div className="admin-panel">
        <h3 style={{ marginBottom: "1rem" }}>
          {tab.charAt(0) + tab.slice(1).toLowerCase()} Appointments
        </h3>

        {filtered.length === 0 ? (
          <p style={{ color: "var(--gray)" }}>No appointments in this section.</p>
        ) : (
          <div className="appointment-list">
            {filtered.map((apt) => (
              <div
                key={apt.id}
                className={`appointment-row ${apt.status.toLowerCase()}`}
              >
                <div>
                  <strong>{apt.name}</strong> — {apt.carType}
                  {apt.isMobile && (
                    <span className="mobile-badge"> Mobile</span>
                  )}
                  <br />
                  <small>
                    {apt.date} at {apt.time} · {apt.phone}
                    {apt.source === "CALL_IN" && " · Call-in"}
                  </small>
                  {apt.isMobile && (
                    <p style={{ marginTop: "0.25rem", fontSize: "0.9rem" }}>
                      {apt.address} · Zip {apt.zipCode}
                    </p>
                  )}
                  {apt.comments && (
                    <p style={{ marginTop: "0.25rem", fontSize: "0.9rem" }}>
                      {apt.comments}
                    </p>
                  )}
                </div>
                <div className="appointment-actions">
                  {apt.status === "BOOKED" && (
                    <button
                      type="button"
                      className="btn btn-success btn-sm"
                      disabled={actionLoading === apt.id}
                      onClick={() => updateStatus(apt.id, "CONFIRMED")}
                    >
                      Confirm
                    </button>
                  )}
                  {apt.status !== "CANCELED" && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      disabled={actionLoading === apt.id}
                      onClick={() => updateStatus(apt.id, "CANCELED")}
                    >
                      Cancel
                    </button>
                  )}
                  {apt.status === "CANCELED" && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      disabled={actionLoading === apt.id}
                      onClick={() => updateStatus(apt.id, "BOOKED")}
                    >
                      Rebook
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
