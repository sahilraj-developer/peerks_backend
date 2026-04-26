import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";

export const getVendors = async (req: Request, res: Response) => {
  const vendors = await User.find({ role: "vendor" }).select("name email college pointBalance createdAt");
  res.json(vendors);
};

export const createVendor = async (req: Request, res: Response) => {
  try {
    const { name, email, password, college } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const vendor = await User.create({ name, email, password: hashed, college, role: "vendor" });
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: "Failed to create vendor", error });
  }
};
