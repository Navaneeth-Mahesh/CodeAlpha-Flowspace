import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  return transporter;
}

/**
 * Sends an email if SMTP is configured; otherwise logs it to the console.
 * This keeps password-reset flows fully functional in local development
 * without requiring real SMTP credentials.
 */
export async function sendEmail({ to, subject, html }) {
  const t = getTransporter();

  if (!t) {
    console.log("\n--- EMAIL (SMTP not configured, printing instead) ---");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(html.replace(/<[^>]+>/g, ""));
    console.log("--- END EMAIL ---\n");
    return { delivered: false, viaConsole: true };
  }

  await t.sendMail({
    from: process.env.EMAIL_FROM || "Flowspace <no-reply@flowspace.app>",
    to,
    subject,
    html,
  });
  return { delivered: true, viaConsole: false };
}
