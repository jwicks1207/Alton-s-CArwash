"use client";

import { useState } from "react";
import { CAR_TYPES, TIME_SLOTS } from "@/lib/appointments";
import {
  isZipAccepted,
  normalizeZipCode,
  ZIP_NOT_IN_SERVICE,
} from "@/lib/zipcodes";

type BookingFormProps = {
  mobileCarwashEnabled: boolean;
  acceptedZipcodes: string[];
};

export function BookingForm({
  mobileCarwashEnabled,
  acceptedZipcodes,
}: BookingFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [zipError, setZipError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  function validateZip(zipInput: string): string | null {
    if (!isMobile) {
      setZipError("");
      return null;
    }
    const zip = normalizeZipCode(zipInput);
    if (zip.length !== 5) {
      const msg = "Please enter a valid 5-digit zip code.";
      setZipError(msg);
      return msg;
    }
    if (!isZipAccepted(zip, acceptedZipcodes)) {
      setZipError(ZIP_NOT_IN_SERVICE);
      return ZIP_NOT_IN_SERVICE;
    }
    setZipError("");
    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const mobileSelected = mobileCarwashEnabled && formData.get("isMobile") === "on";
    const address = (formData.get("address") as string) || "";
    const zipCode = (formData.get("zipCode") as string) || "";

    if (mobileSelected) {
      const zipErr = validateZip(zipCode);
      if (zipErr) {
        setStatus("error");
        setErrorMsg(zipErr);
        return;
      }
    }

    const payload = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      carType: formData.get("carType") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      comments: (formData.get("comments") as string) || "",
      isMobile: mobileSelected,
      address: mobileSelected ? address : "",
      zipCode: mobileSelected ? normalizeZipCode(zipCode) : "",
    };

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to book appointment");
      }

      setStatus("success");
      setIsMobile(false);
      setZipError("");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "success") {
    return (
      <div className="form-card">
        <div className="alert alert-success">
          <strong>Thank you!</strong> Your appointment request has been submitted.
          We&apos;ll confirm your booking shortly.
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setStatus("idle")}
        >
          Book Another Appointment
        </button>
      </div>
    );
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h2 style={{ marginBottom: "1.5rem" }}>Book Your Wash</h2>

      {status === "error" && (
        <div className="alert alert-error">{errorMsg}</div>
      )}

      <div className="form-group">
        <label htmlFor="name">Name *</label>
        <input id="name" name="name" type="text" required minLength={2} />
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone Number *</label>
        <input id="phone" name="phone" type="tel" required minLength={7} />
      </div>

      <div className="form-group">
        <label htmlFor="carType">Car Type *</label>
        <select id="carType" name="carType" required defaultValue="">
          <option value="" disabled>
            Select vehicle type
          </option>
          {CAR_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {mobileCarwashEnabled && (
        <div className="mobile-booking-block">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isMobile"
              checked={isMobile}
              onChange={(e) => {
                setIsMobile(e.target.checked);
                if (!e.target.checked) setZipError("");
              }}
            />
            <span>
              <strong>Mobile car wash</strong> — we come to your location
            </span>
          </label>

          {isMobile && (
            <div className="mobile-fields">
              <div className="form-group">
                <label htmlFor="address">Service Address *</label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  required={isMobile}
                  placeholder="Street address, city"
                  minLength={5}
                />
              </div>
              <div className="form-group">
                <label htmlFor="zipCode">Zip Code *</label>
                <input
                  id="zipCode"
                  name="zipCode"
                  type="text"
                  inputMode="numeric"
                  required={isMobile}
                  placeholder="12345"
                  maxLength={10}
                  onBlur={(e) => validateZip(e.target.value)}
                  aria-invalid={!!zipError}
                  aria-describedby={zipError ? "zip-error" : undefined}
                />
                {zipError && (
                  <p id="zip-error" className="field-error">
                    {zipError}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="date">Date *</label>
          <input id="date" name="date" type="date" required min={today} />
        </div>
        <div className="form-group">
          <label htmlFor="time">Time *</label>
          <select id="time" name="time" required defaultValue="">
            <option value="" disabled>
              Select time
            </option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="comments">Additional Comments</label>
        <textarea
          id="comments"
          name="comments"
          rows={4}
          placeholder="Special requests, stains, pet hair, etc."
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        style={{ width: "100%" }}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Submitting…" : "Request Appointment"}
      </button>
    </form>
  );
}
