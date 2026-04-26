import { Request, Response } from "express";
import Redemption from "../models/Redemption";
import BalanceTopup from "../models/BalanceTopup";

export const getRedemptions = async (req: Request, res: Response) => {
  const redemptions = await Redemption.find().populate("giftCardId").populate("userId").sort({ createdAt: -1 });
  res.json(redemptions);
};

export const getTopups = async (req: Request, res: Response) => {
  const items = await BalanceTopup.find().populate("userId").sort({ createdAt: -1 });
  res.json(items);
};
