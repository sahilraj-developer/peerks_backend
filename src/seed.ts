import bcrypt from "bcryptjs";
import User from "./models/User";
import Activity from "./models/Activity";
import GiftCard from "./models/GiftCard";

export default async function seedDatabase() {
  const activitiesCount = await Activity.countDocuments();
  if (activitiesCount === 0) {
    await Activity.create([
      { slug: "signup", title: "Signup Bonus", description: "Points for registering.", points: 100 },
      { slug: "daily_visit", title: "Daily Visit", description: "Points for daily app open.", points: 10 },
      { slug: "share_app", title: "Share App", description: "Points for sharing app link.", points: 50 },
    ]);
    console.log("Seeded activities");
  }

  const giftCardCount = await GiftCard.countDocuments();
  if (giftCardCount === 0) {
    await GiftCard.create([
      { name: "Amazon ₹100", provider: "Amazon", pointsCost: 1000, amount: 100 },
      { name: "Flipkart ₹200", provider: "Flipkart", pointsCost: 1800, amount: 200 },
      { name: "Paytm Wallet ₹50", provider: "Paytm", pointsCost: 500, amount: 50 },
    ]);
    console.log("Seeded gift cards");
  }

  const adminEmail = process.env.ADMIN_EMAIL || "admin@peerks.in";
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", 10);
    admin = await User.create({ name: "Admin", email: adminEmail, password: hashed, role: "admin", pointBalance: 0 });
    console.log("Seeded admin user", adminEmail);
  }

  return true;
}
