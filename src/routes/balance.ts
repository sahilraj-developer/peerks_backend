import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as BalanceController from "../controllers/BalanceController";

const router = Router();

router.post("/stripe/checkout", authenticate, BalanceController.createCheckoutSession);
router.get("/history", authenticate, BalanceController.getHistory);

export const handleStripeWebhook = BalanceController.handleStripeWebhook;

export default router;
