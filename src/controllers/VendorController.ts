import { Request, Response } from "express";
import GiftCard from "../models/GiftCard";
import Redemption from "../models/Redemption";

export const getAnalytics = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const giftCards = await GiftCard.find({ vendorId: userId });
  const giftCardIds = giftCards.map((g) => g._id);

  const totalGiftCards = giftCards.length;
  const activeGiftCards = giftCards.filter((g) => g.isActive).length;

  const redemptionsAgg = await Redemption.aggregate([
    { $match: { giftCardId: { $in: giftCardIds }, status: "completed" } },
    { $group: { _id: null, total: { $sum: 1 }, coins: { $sum: "$points" } } },
  ]);

  const totals = redemptionsAgg[0] || { total: 0, coins: 0 };

  res.json({
    totalGiftCards,
    activeGiftCards,
    totalRedemptions: totals.total,
    totalCoinsRedeemed: totals.coins,
  });
};

export const getGiftCards = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const query = req.user?.role === "admin" ? {} : { vendorId: userId };
  const items = await GiftCard.find(query).sort({ createdAt: -1 });
  res.json(items);
};

export const createGiftCard = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const payload = {
      ...req.body,
      vendorId: req.user?.role === "admin" ? req.body?.vendorId || userId : userId,
    };

    const giftcard = await GiftCard.create(payload);
    res.json(giftcard);
  } catch (error) {
    res.status(500).json({ error: "Failed to create gift card" });
  }
};

export const updateGiftCard = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const filter =
      req.user?.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, vendorId: userId };

    const giftcard = await GiftCard.findOneAndUpdate(filter, req.body, { new: true });
    if (!giftcard) return res.status(404).json({ message: "Gift card not found" });
    res.json(giftcard);
  } catch (error) {
    res.status(500).json({ error: "Failed to update gift card" });
  }
};
