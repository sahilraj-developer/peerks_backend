import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth";
import activitiesRoutes from "./routes/activities";
import redemptionsRoutes from "./routes/redemptions";
import adminRoutes from "./routes/admin";
import giftCardsRoutes from "./routes/giftcards";
import seedDatabase from "./seed";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const mongoUrl = process.env.MONGODB_URI || "mongodb://localhost:27017/peerks";

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/activities", activitiesRoutes);
app.use("/api/giftcards", giftCardsRoutes);
app.use("/api/redemptions", redemptionsRoutes);
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
