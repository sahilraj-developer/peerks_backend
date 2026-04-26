import { Request, Response } from "express";
import User from "../models/User";
import Redemption from "../models/Redemption";
import UserActivity from "../models/UserActivity";
import Activity from "../models/Activity";

export const getAnalytics = async (req: Request, res: Response) => {
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
};

export const getTimeseries = async (req: Request, res: Response) => {
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
};
