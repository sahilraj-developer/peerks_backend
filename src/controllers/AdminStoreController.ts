import { Request, Response } from "express";
import Store from "../models/Store";

export const createStore = async (req: Request, res: Response) => {
  try {
    const store = await Store.create(req.body);
    res.json(store);
  } catch (error) {
    res.status(500).json({ error: "Failed to create store" });
  }
};

export const updateStore = async (req: Request, res: Response) => {
  try {
    const store = await Store.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(store);
  } catch (error) {
    res.status(500).json({ error: "Failed to update store" });
  }
};

export const deleteStore = async (req: Request, res: Response) => {
  try {
    await Store.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete store" });
  }
};
