"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendRedemptionEmail = sendRedemptionEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || "no-reply@peerks.local";
let transporter = null;
function getTransporter() {
    if (transporter)
        return transporter;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS)
        return null;
    transporter = nodemailer_1.default.createTransport({
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
async function sendRedemptionEmail(params) {
    const mailer = getTransporter();
    if (!mailer)
        return false;
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
//# sourceMappingURL=mailer.js.map