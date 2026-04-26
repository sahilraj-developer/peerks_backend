import { Request, Response } from "express";
import Store from "../models/Store";

export const getStores = async (req: Request, res: Response) => {
  try {
    const stores = await Store.find();
    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getStoreById = async (req: Request, res: Response) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ message: "Store not found" });
    res.json(store);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
