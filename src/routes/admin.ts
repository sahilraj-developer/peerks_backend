import { Router } from "express";
import User from "../models/User";
import Redemption from "../models/Redemption";
import UserActivity from "../models/UserActivity";
import Activity from "../models/Activity";
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

export default router;
