import { Request, Response } from "express";
import type { AnyBulkWriteOperation } from "mongoose";
import Activity from "../models/Activity";

export const getActivities = async (req: Request, res: Response) => {
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
};

export const createActivity = async (req: Request, res: Response) => {
  try {
    const activity = await Activity.create(req.body);
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: "Failed to create activity" });
  }
};

export const bulkActivities = async (req: Request, res: Response) => {
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
};

export const updateActivity = async (req: Request, res: Response) => {
  try {
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: "Failed to update activity" });
  }
};

export const deleteActivity = async (req: Request, res: Response) => {
  try {
    await Activity.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete activity" });
  }
};
