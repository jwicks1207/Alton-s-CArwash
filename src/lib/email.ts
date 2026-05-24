import nodemailer from "nodemailer";
import type { SiteSettings } from "@prisma/client";

type AppointmentEmailData = {
  name: string;
  phone: string;
  carType: string;
  date: string;
  time: string;
  comments: string;
  source: string;
  isMobile?: boolean;
  address?: string;
  zipCode?: string;
};

export async function sendAppointmentEmail(
  settings: SiteSettings,
  data: AppointmentEmailData
) {
  const to = settings.notificationEmail || settings.contactEmail;
  if (!to) {
    console.warn("No notification email configured; skipping email.");
    return { ok: false, error: "No notification email configured" };
  }

  const host = settings.smtpHost || process.env.SMTP_HOST;
  const port = Number(settings.smtpPort || process.env.SMTP_PORT || 587);
  const user = settings.smtpUser || process.env.SMTP_USER;
  const pass = settings.smtpPass || process.env.SMTP_PASS;
  const from =
    settings.smtpFrom ||
    process.env.SMTP_FROM ||
    user ||
    "noreply@altonscarwash.com";

  if (!host || !user || !pass) {
    console.warn("SMTP not configured; appointment saved but email not sent.");
    return { ok: false, error: "SMTP not configured" };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const mobileRows = data.isMobile
    ? `
Service Type: Mobile (we go to customer)
Address: ${data.address || "(none)"}
Zip Code: ${data.zipCode || "(none)"}`
    : `
Service Type: On-site (customer comes to wash)`;

  const subject = `New appointment — ${data.name} (${data.date} ${data.time})`;
  const text = `
New appointment at ${settings.businessName}

Name: ${data.name}
Phone: ${data.phone}
Car Type: ${data.carType}
Date: ${data.date}
Time: ${data.time}
${mobileRows}
Source: ${data.source}
Additional Comments: ${data.comments || "(none)"}
`.trim();

  const mobileHtml = data.isMobile
    ? `<tr><td style="padding:6px 12px;font-weight:bold;">Service</td><td style="padding:6px 12px;">Mobile car wash</td></tr>
      <tr><td style="padding:6px 12px;font-weight:bold;">Address</td><td style="padding:6px 12px;">${data.address || "(none)"}</td></tr>
      <tr><td style="padding:6px 12px;font-weight:bold;">Zip Code</td><td style="padding:6px 12px;">${data.zipCode || "(none)"}</td></tr>`
    : `<tr><td style="padding:6px 12px;font-weight:bold;">Service</td><td style="padding:6px 12px;">On-site</td></tr>`;

  const html = `
    <h2>New Appointment — ${settings.businessName}</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;">
      <tr><td style="padding:6px 12px;font-weight:bold;">Name</td><td style="padding:6px 12px;">${data.name}</td></tr>
      <tr><td style="padding:6px 12px;font-weight:bold;">Phone</td><td style="padding:6px 12px;">${data.phone}</td></tr>
      <tr><td style="padding:6px 12px;font-weight:bold;">Car Type</td><td style="padding:6px 12px;">${data.carType}</td></tr>
      <tr><td style="padding:6px 12px;font-weight:bold;">Date</td><td style="padding:6px 12px;">${data.date}</td></tr>
      <tr><td style="padding:6px 12px;font-weight:bold;">Time</td><td style="padding:6px 12px;">${data.time}</td></tr>
      ${mobileHtml}
      <tr><td style="padding:6px 12px;font-weight:bold;">Source</td><td style="padding:6px 12px;">${data.source}</td></tr>
      <tr><td style="padding:6px 12px;font-weight:bold;">Comments</td><td style="padding:6px 12px;">${data.comments || "(none)"}</td></tr>
    </table>
  `;

  await transporter.sendMail({ from, to, subject, text, html });
  return { ok: true };
}
