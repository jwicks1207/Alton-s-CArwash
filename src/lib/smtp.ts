import nodemailer from "nodemailer";

export type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
};

/** Gmail app passwords are 16 chars, often copied with spaces. */
export function normalizeSmtpPassword(pass: string): string {
  return pass.replace(/\s/g, "");
}

export function isGmailSmtp(host: string, user: string): boolean {
  const h = host.trim().toLowerCase();
  if (h === "smtp.gmail.com" || h === "gmail.com") return true;
  return /@gmail\.com$/i.test(user.trim());
}

export function createSmtpTransporter(config: SmtpConfig) {
  const user = config.user.trim();
  const pass = normalizeSmtpPassword(config.pass);

  if (isGmailSmtp(config.host, user)) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    requireTLS: config.port === 587,
    auth: { user, pass },
  });
}

export const GMAIL_SMTP_DEFAULTS = {
  smtpHost: "smtp.gmail.com",
  smtpPort: "587",
} as const;
