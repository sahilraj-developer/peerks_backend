import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || "no-reply@peerks.local";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return transporter;
}

export async function sendRedemptionEmail(params: {
  to: string;
  name?: string;
  giftCardName: string;
  provider: string;
  amount: number;
  pointsCost: number;
}) {
  const mailer = getTransporter();
  if (!mailer) return false;

  const { to, name, giftCardName, provider, amount, pointsCost } = params;
  const subject = `Your Peerks gift card for ${provider}`;
  const lines = [
    `Hi${name ? ` ${name}` : ""},`,
    "",
    "Thanks for redeeming your Peerks reward!",
    "",
    `Gift card: ${giftCardName}`,
    `Brand: ${provider}`,
    `Amount: Rs ${amount}`,
    `Coins used: ${pointsCost}`,
    "",
    "We will share the gift card details shortly if not included already.",
    "",
    "Team Peerks",
  ];

  await mailer.sendMail({
    from: SMTP_FROM,
    to,
    subject,
    text: lines.join("\n"),
  });

  return true;
}
