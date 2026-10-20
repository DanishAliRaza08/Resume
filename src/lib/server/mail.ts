// Outbound email. Configure SMTP_URL (e.g. smtps://user:pass@smtp.example.com:465) and MAIL_FROM.
// Without SMTP_URL, messages are written to the server log (development only).
import nodemailer from "nodemailer";
import { logEvent } from "./audit";

export function mailConfigured(): boolean {
  return Boolean(process.env.SMTP_URL);
}

export async function sendMail(to: string, subject: string, text: string): Promise<boolean> {
  if (!process.env.SMTP_URL) {
    logEvent("warn", "SMTP_URL not set; email not sent", { subject });
    console.log(`[mail:dev] to=<redacted> subject=${subject}\n${text}`);
    return false;
  }
  try {
    const transport = nodemailer.createTransport(process.env.SMTP_URL);
    await transport.sendMail({ from: process.env.MAIL_FROM ?? "Benchsale Dan <no-reply@localhost>", to, subject, text });
    return true;
  } catch (err) {
    logEvent("error", "email send failed", { subject, error: String(err).slice(0, 200) });
    return false;
  }
}

export function appUrl(): string {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
