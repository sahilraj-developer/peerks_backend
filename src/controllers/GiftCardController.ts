import { Request, Response } from "express";
import GiftCard from "../models/GiftCard";

export const getGiftCards = async (_req: Request, res: Response) => {
  const giftCards = await GiftCard.find({ isActive: true }).sort({ pointsCost: 1 });
  res.json(giftCards);
};
