import express from "express";
import Store from "../models/Store";

const router = express.Router();

// Get all stores
router.get("/", async (req, res) => {
  try {
    const stores = await Store.find();
    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Get a specific store
router.get("/:id", async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ message: "Store not found" });
    res.json(store);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

export default router;
