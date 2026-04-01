import { Router } from "express";
import GiftCard from "../models/GiftCard";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, async (_req, res) => {
  const giftCards = await GiftCard.find({ isActive: true }).sort({ pointsCost: 1 });
  res.json(giftCards);
});

export default router;
