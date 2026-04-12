import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth";
import activitiesRoutes from "./routes/activities";
import redemptionsRoutes from "./routes/redemptions";
import adminRoutes from "./routes/admin";
import giftCardsRoutes from "./routes/giftcards";
import balanceRoutes, { handleStripeWebhook } from "./routes/balance";
import vendorRoutes from "./routes/vendor";
import collegesRoutes from "./routes/colleges";
import seedDatabase from "./seed";

const app = express();
const port = process.env.PORT || 4000;
const mongoUrl = process.env.MONGODB_URI || "mongodb://localhost:27017/peerks";

app.use(cors());

app.post("/api/balance/stripe/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/activities", activitiesRoutes);
app.use("/api/giftcards", giftCardsRoutes);
app.use("/api/redemptions", redemptionsRoutes);
app.use("/api/balance", balanceRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/colleges", collegesRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/status", (req, res) => res.json({ status: "ok", time: new Date() }));

mongoose
  .connect(mongoUrl)
  .then(async () => {
    console.log("Connected to MongoDB", mongoUrl);
    await seedDatabase();
    app.listen(port, () => {
      console.log(`Perks backend running at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed", err);
    process.exit(1);
  });
