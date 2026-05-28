import nodemailer from "nodemailer";
import {
  isGmailSmtp,
  normalizeSmtpPassword,
  type SmtpConfig,
} from "@/lib/smtp-config";

export type { SmtpConfig } from "@/lib/smtp-config";

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
