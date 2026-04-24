import { Router } from "express";
import type { AnyBulkWriteOperation } from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User";
import Redemption from "../models/Redemption";
import UserActivity from "../models/UserActivity";
import Activity from "../models/Activity";
import GiftCard from "../models/GiftCard";
import BalanceTopup from "../models/BalanceTopup";
import Store from "../models/Store";
import Post from "../models/Post";
import { authenticate, ensureAdmin } from "../middleware/auth";

const router = Router();

router.get("/analytics", authenticate, ensureAdmin, async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalPointsAgg = await User.aggregate([{ $group: { _id: null, totalPoints: { $sum: "$pointBalance" } } }]);
  const totalPoints = totalPointsAgg.length ? totalPointsAgg[0].totalPoints : 0;

  const totalRedemptions = await Redemption.countDocuments();

  const topUsers = await User.find().sort({ pointBalance: -1 }).limit(5).select("name email pointBalance");

  const topActivitiesAgg = await UserActivity.aggregate([
    { $group: { _id: "$activityId", totalPoints: { $sum: "$points" }, count: { $sum: 1 } } },
    { $sort: { totalPoints: -1 } },
    { $limit: 5 },
  ]);

  const activityDetails = await Promise.all(
    topActivitiesAgg.map(async (item) => {
      const activity = await Activity.findById(item._id);
      return { activity, totalPoints: item.totalPoints, usageCount: item.count };
    })
  );

  res.json({ totalUsers, totalPoints, totalRedemptions, topUsers, activityDetails });
});

router.get("/analytics/timeseries", authenticate, ensureAdmin, async (req, res) => {
  const days = Math.max(7, Math.min(365, Number(req.query.days) || 30));
  const now = new Date();
  const start = new Date();
  start.setDate(now.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const dateFormat = "%Y-%m-%d";

  const [usersAgg, redemptionsAgg, pointsAgg] = await Promise.all([
    User.aggregate([
      { $match: { createdAt: { $gte: start, $lte: now } } },
      { $group: { _id: { $dateToString: { format: dateFormat, date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Redemption.aggregate([
      { $match: { createdAt: { $gte: start, $lte: now } } },
      { $group: { _id: { $dateToString: { format: dateFormat, date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    UserActivity.aggregate([
      { $match: { createdAt: { $gte: start, $lte: now } } },
      { $group: { _id: { $dateToString: { format: dateFormat, date: "$createdAt" } }, total: { $sum: "$points" } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const usersMap = new Map(usersAgg.map((i: any) => [i._id, i.count]));
  const redemptionsMap = new Map(redemptionsAgg.map((i: any) => [i._id, i.count]));
  const pointsMap = new Map(pointsAgg.map((i: any) => [i._id, i.total]));

  const series = [];
  for (let i = 0; i < days; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    series.push({
      date: key,
      newUsers: usersMap.get(key) || 0,
      redemptions: redemptionsMap.get(key) || 0,
      pointsEarned: pointsMap.get(key) || 0,
    });
  }

  res.json({ days, series });
});

router.get("/users", authenticate, ensureAdmin, async (req, res) => {
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
});

router.post("/users/bulk", authenticate, ensureAdmin, async (req, res) => {
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
});

router.get("/redemptions", authenticate, ensureAdmin, async (req, res) => {
  const redemptions = await Redemption.find().populate("giftCardId").populate("userId").sort({ createdAt: -1 });
  res.json(redemptions);
});

router.get("/topups", authenticate, ensureAdmin, async (req, res) => {
  const items = await BalanceTopup.find().populate("userId").sort({ createdAt: -1 });
  res.json(items);
});

router.get("/vendors", authenticate, ensureAdmin, async (req, res) => {
  const vendors = await User.find({ role: "vendor" }).select("name email college pointBalance createdAt");
  res.json(vendors);
});

router.post("/vendors", authenticate, ensureAdmin, async (req, res) => {
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
});

router.get("/activities", authenticate, ensureAdmin, async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
  const q = String(req.query.q || "").trim();
  const status = String(req.query.status || "all");
  const sort = String(req.query.sort || "createdAt");
  const dir = String(req.query.dir || "desc") === "asc" ? 1 : -1;

  const query: any = {};
  if (q) {
    query.$or = [
      { title: { $regex: q, $options: "i" } },
      { slug: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ];
  }
  if (status === "active") query.isActive = true;
  if (status === "inactive") query.isActive = false;

  const sortMap: any = { title: "title", slug: "slug", points: "points", isActive: "isActive", createdAt: "createdAt" };
  const sortField = sortMap[sort] || "createdAt";

  const total = await Activity.countDocuments(query);
  const items = await Activity.find(query)
    .sort({ [sortField]: dir })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({ items, total, page, limit });
});

router.post("/activities", authenticate, ensureAdmin, async (req, res) => {
  try {
    const activity = await Activity.create(req.body);
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: "Failed to create activity" });
  }
});

router.post("/activities/bulk", authenticate, ensureAdmin, async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : req.body;
    if (!Array.isArray(items)) return res.status(400).json({ message: "items array required" });

    const errors: any[] = [];
    const ops: AnyBulkWriteOperation<any>[] = [];
    items.forEach((item: any, idx: number) => {
      const row = item?._row ?? idx + 2;
      if (!item?.slug || !item?.title) {
        errors.push({ row, message: "Missing required fields: slug, title" });
        return;
      }
      ops.push({
        updateOne: {
          filter: { slug: item.slug },
          update: {
            $set: {
              title: item.title,
              slug: item.slug,
              description: item.description,
              points: Number(item.points) || 0,
              isActive: item.isActive !== false,
            },
          },
          upsert: true,
        },
      });
    });

    if (ops.length === 0) return res.json({ inserted: 0, updated: 0, errors });
    const result = await Activity.bulkWrite(ops);
    res.json({ inserted: result.upsertedCount || 0, updated: result.modifiedCount || 0, errors });
  } catch (error) {
    res.status(500).json({ message: "Bulk activity import failed", error });
  }
});

router.put("/activities/:id", authenticate, ensureAdmin, async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: "Failed to update activity" });
  }
});

router.delete("/activities/:id", authenticate, ensureAdmin, async (req, res) => {
  try {
    await Activity.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete activity" });
  }
});

router.get("/giftcards", authenticate, ensureAdmin, async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
  const q = String(req.query.q || "").trim();
  const status = String(req.query.status || "all");
  const vendorId = String(req.query.vendorId || "").trim();
  const sort = String(req.query.sort || "createdAt");
  const dir = String(req.query.dir || "desc") === "asc" ? 1 : -1;

  const query: any = {};
  if (q) {
    query.$or = [{ name: { $regex: q, $options: "i" } }, { provider: { $regex: q, $options: "i" } }];
  }
  if (status === "active") query.isActive = true;
  if (status === "inactive") query.isActive = false;
  if (vendorId) query.vendorId = vendorId;

  const sortMap: any = { name: "name", provider: "provider", amount: "amount", pointsCost: "pointsCost", isActive: "isActive", createdAt: "createdAt" };
  const sortField = sortMap[sort] || "createdAt";

  const total = await GiftCard.countDocuments(query);
  const items = await GiftCard.find(query)
    .populate("vendorId")
    .sort({ [sortField]: dir })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({ items, total, page, limit });
});

router.post("/giftcards", authenticate, ensureAdmin, async (req, res) => {
  try {
    const giftcard = await GiftCard.create(req.body);
    res.json(giftcard);
  } catch (error) {
    res.status(500).json({ error: "Failed to create gift card" });
  }
});

router.post("/giftcards/bulk", authenticate, ensureAdmin, async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : req.body;
    if (!Array.isArray(items)) return res.status(400).json({ message: "items array required" });

    const errors: any[] = [];
    const ops: AnyBulkWriteOperation<any>[] = [];
    items.forEach((item: any, idx: number) => {
      const row = item?._row ?? idx + 2;
      if (!item?.name || !item?.provider) {
        errors.push({ row, message: "Missing required fields: name, provider" });
        return;
      }
      ops.push({
        updateOne: {
          filter: { name: item.name, provider: item.provider },
          update: {
            $set: {
              name: item.name,
              provider: item.provider,
              pointsCost: Number(item.pointsCost) || 0,
              amount: Number(item.amount) || 0,
              isActive: item.isActive !== false,
            },
          },
          upsert: true,
        },
      });
    });

    if (ops.length === 0) return res.json({ inserted: 0, updated: 0, errors });
    const result = await GiftCard.bulkWrite(ops);
    res.json({ inserted: result.upsertedCount || 0, updated: result.modifiedCount || 0, errors });
  } catch (error) {
    res.status(500).json({ message: "Bulk gift card import failed", error });
  }
});

router.put("/giftcards/:id", authenticate, ensureAdmin, async (req, res) => {
  try {
    const giftcard = await GiftCard.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(giftcard);
  } catch (error) {
    res.status(500).json({ error: "Failed to update gift card" });
  }
});

router.delete("/giftcards/:id", authenticate, ensureAdmin, async (req, res) => {
  try {
    await GiftCard.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete gift card" });
  }
});

router.post("/stores", authenticate, ensureAdmin, async (req, res) => {
  try {
    const store = await Store.create(req.body);
    res.json(store);
  } catch (error) {
    res.status(500).json({ error: "Failed to create store" });
  }
});

router.put("/stores/:id", authenticate, ensureAdmin, async (req, res) => {
  try {
    const store = await Store.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(store);
  } catch (error) {
    res.status(500).json({ error: "Failed to update store" });
  }
});

router.delete("/stores/:id", authenticate, ensureAdmin, async (req, res) => {
  try {
    await Store.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete store" });
  }
});

router.get("/posts", authenticate, ensureAdmin, async (req, res) => {
  try {
    const posts = await Post.find().populate("authorId", "name email").sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to get posts" });
  }
});

router.put("/posts/:id/status", authenticate, ensureAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const post = await Post.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Failed to update post status" });
  }
});

export default router;
