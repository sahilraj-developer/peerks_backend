import { Router } from "express";
import { Types } from "mongoose";
import Activity from "../models/Activity";
import User from "../models/User";
import UserActivity from "../models/UserActivity";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, async (req, res) => {
  const activities = await Activity.find().sort({ createdAt: -1 });
  res.json(activities);
});

router.post("/:activityId/complete", authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { activityId } = req.params;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (typeof activityId !== "string") return res.status(400).json({ message: "Invalid activity ID" });

    if (!Types.ObjectId.isValid(activityId)) return res.status(400).json({ message: "Invalid activity ID" });

    const activity = await Activity.findById(activityId);
    if (!activity) return res.status(404).json({ message: "Activity not found" });

    const log = await UserActivity.create({ userId, activityId, points: activity.points });

    const user = await User.findByIdAndUpdate(userId, { $inc: { pointBalance: activity.points } }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Activity completed", activity, user, log });
  } catch (error) {
    res.status(500).json({ message: "Unable to complete activity", error });
  }
});

router.get("/history", authenticate, async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const history = await UserActivity.find({ userId }).populate("activityId").sort({ createdAt: -1 });
  res.json(history);
});

export default router;
