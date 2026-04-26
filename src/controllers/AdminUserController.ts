import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";

export const getUsers = async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
  const q = String(req.query.q || "").trim();
  const role = String(req.query.role || "all");
  const sort = String(req.query.sort || "createdAt");
  const dir = String(req.query.dir || "desc") === "asc" ? 1 : -1;

  const query: any = {};
  if (q) {
    query.$or = [{ name: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }];
  }
  if (role !== "all") query.role = role;

  const sortMap: any = {
    name: "name",
    email: "email",
    role: "role",
    college: "college",
    pointBalance: "pointBalance",
    createdAt: "createdAt",
  };
  const sortField = sortMap[sort] || "createdAt";

  const total = await User.countDocuments(query);
  const items = await User.find(query)
    .sort({ [sortField]: dir })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({ items, total, page, limit });
};

export const bulkUsers = async (req: Request, res: Response) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : req.body;
    if (!Array.isArray(items)) return res.status(400).json({ message: "items array required" });

    const defaultPassword = process.env.ADMIN_BULK_DEFAULT_PASSWORD || "peerks123";
    const ops = [];
    const errors: any[] = [];

    for (let i = 0; i < items.length; i += 1) {
      const raw = items[i];
      const row = raw?._row ?? i + 2;
      if (!raw?.email) {
        errors.push({ row, message: "Missing required field: email" });
        continue;
      }
      const email = String(raw.email).trim().toLowerCase();
      const name = raw.name ? String(raw.name).trim() : undefined;
      const role = raw.role === "admin" ? "admin" : raw.role === "vendor" ? "vendor" : "user";
      const college = raw.college ? String(raw.college).trim() : undefined;
      const pointBalance = raw.pointBalance != null ? Number(raw.pointBalance) : undefined;

      const passwordPlain = raw.password ? String(raw.password) : defaultPassword;
      const passwordHash = await bcrypt.hash(passwordPlain, 10);

      const setFields: any = { role };
      if (name != null) setFields.name = name;
      if (college != null) setFields.college = college;
      if (pointBalance != null && !Number.isNaN(pointBalance)) setFields.pointBalance = pointBalance;

      const update: any = { $set: setFields };
      update.$setOnInsert = { password: passwordHash, email };
      if (raw.password) {
        update.$set.password = passwordHash;
      }

      ops.push({
        updateOne: {
          filter: { email },
          update,
          upsert: true,
        },
      });
    }

    if (ops.length === 0) return res.json({ inserted: 0, updated: 0, errors });
    const result = await User.bulkWrite(ops);
    res.json({
      inserted: result.upsertedCount || 0,
      updated: result.modifiedCount || 0,
      errors,
    });
  } catch (error) {
    res.status(500).json({ message: "Bulk user import failed", error });
  }
};
