"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStripeWebhook = handleStripeWebhook;
const express_1 = require("express");
const stripe_1 = __importDefault(require("stripe"));
const BalanceTopup_1 = __importDefault(require("../models/BalanceTopup"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const STRIPE_SUCCESS_URL = process.env.STRIPE_SUCCESS_URL || "https://example.com/success";
const STRIPE_CANCEL_URL = process.env.STRIPE_CANCEL_URL || "https://example.com/cancel";
const stripe = STRIPE_SECRET_KEY ? new stripe_1.default(STRIPE_SECRET_KEY) : null;
router.post("/stripe/checkout", auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        if (!stripe)
            return res.status(500).json({ message: "Stripe not configured" });
        const amount = Number(req.body?.amount);
        const method = String(req.body?.method || "").toLowerCase();
        const allowed = ["upi", "debit", "credit"];
        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({ message: "Amount must be greater than 0" });
        }
        if (!allowed.includes(method)) {
            return res.status(400).json({ message: "Invalid payment method" });
        }
        const user = await User_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const topup = await BalanceTopup_1.default.create({
            userId,
            amount,
            method,
            status: "pending",
            provider: "stripe",
            currency: "inr",
        });
        const paymentMethodTypes = method === "upi" ? ["card", "upi"] : ["card"];
        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            success_url: STRIPE_SUCCESS_URL,
            cancel_url: STRIPE_CANCEL_URL,
            payment_method_types: paymentMethodTypes,
            line_items: [
                {
                    quantity: 1,
                    price_data: {
                        currency: "inr",
                        unit_amount: Math.round(amount * 100),
                        product_data: {
                            name: "Peerks balance top-up",
                            description: `${amount} Peerks coins`,
                        },
                    },
                },
            ],
            metadata: {
                userId: userId.toString(),
                topupId: topup._id.toString(),
                amount: String(amount),
                method,
            },
            customer_email: user.email,
        });
        topup.stripeSessionId = session.id;
        topup.stripePaymentIntentId = String(session.payment_intent || "");
        await topup.save();
        res.json({ checkoutUrl: session.url, topupId: topup._id });
    }
    catch (error) {
        res.status(500).json({ message: "Stripe checkout failed", error });
    }
});
router.get("/history", auth_1.authenticate, async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ message: "Unauthorized" });
    const items = await BalanceTopup_1.default.find({ userId }).sort({ createdAt: -1 });
    res.json(items);
});
async function handleStripeWebhook(req, res) {
    if (!stripe || !STRIPE_WEBHOOK_SECRET) {
        return res.status(500).send("Stripe not configured");
    }
    const sig = req.headers["stripe-signature"];
    if (!sig || Array.isArray(sig))
        return res.status(400).send("Missing signature");
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    }
    catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const topupId = session.metadata?.topupId;
        const amount = Number(session.metadata?.amount || 0);
        if (topupId) {
            const topup = await BalanceTopup_1.default.findById(topupId);
            if (topup && topup.status !== "completed") {
                topup.status = "completed";
                topup.stripeSessionId = session.id;
                topup.stripePaymentIntentId = String(session.payment_intent || "");
                await topup.save();
                const user = await User_1.default.findById(topup.userId);
                if (user) {
                    user.pointBalance += amount;
                    await user.save();
                }
            }
        }
    }
    if (event.type === "checkout.session.expired" || event.type === "payment_intent.payment_failed") {
        const obj = event.data.object;
        const topupId = obj?.metadata?.topupId;
        if (topupId) {
            await BalanceTopup_1.default.findByIdAndUpdate(topupId, { status: "failed" });
        }
    }
    res.json({ received: true });
}
exports.default = router;
//# sourceMappingURL=balance.js.map