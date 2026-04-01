import { Router } from "express";
import { Types } from "mongoose";
import GiftCard from "../models/GiftCard";
import Redemption from "../models/Redemption";
import User from "../models/User";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, async (req, res) => {
  const userId = req.user?.id;
  const filter = req.query.all === "true" ? {} : { userId };

  const redemptions = await Redemption.find(filter)
    .populate("giftCardId")
    .populate("userId")
    .sort({ createdAt: -1 });

  res.json(redemptions);
});

router.post("/", authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { giftCardId } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!Types.ObjectId.isValid(giftCardId)) return res.status(400).json({ message: "Invalid gift card ID" });

    const giftCard = await GiftCard.findById(giftCardId);
    if (!giftCard || !giftCard.isActive) return res.status(404).json({ message: "Gift card unavailable" });

    const user = await User.findById(userId);
    if (!user || user.pointBalance < giftCard.pointsCost) {
      return res.status(400).json({ message: "Insufficient points" });
    }

    const redemption = await Redemption.create({
      userId,
      giftCardId,
      points: giftCard.pointsCost,
      status: "completed",
    });

    user.pointBalance -= giftCard.pointsCost;
    await user.save();

    res.json({ message: "Redeemed", redemption });
  } catch (error) {
    res.status(500).json({ message: "Redemption failed", error });
  }
});

export default router;
