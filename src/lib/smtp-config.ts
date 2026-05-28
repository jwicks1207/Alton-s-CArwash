export type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
};

export const GMAIL_SMTP_DEFAULTS = {
  smtpHost: "smtp.gmail.com",
  smtpPort: "587",
} as const;

/** Gmail app passwords are 16 chars, often copied with spaces. */
export function normalizeSmtpPassword(pass: string): string {
  return pass.replace(/\s/g, "");
}

export function isGmailSmtp(host: string, user: string): boolean {
  const h = host.trim().toLowerCase();
  if (h === "smtp.gmail.com" || h === "gmail.com") return true;
  return /@gmail\.com$/i.test(user.trim());
}
