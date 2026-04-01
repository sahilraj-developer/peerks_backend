"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = seedDatabase;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("./models/User"));
const Activity_1 = __importDefault(require("./models/Activity"));
const GiftCard_1 = __importDefault(require("./models/GiftCard"));
async function seedDatabase() {
    const activitiesCount = await Activity_1.default.countDocuments();
    if (activitiesCount === 0) {
        await Activity_1.default.create([
            { slug: "signup", title: "Signup Bonus", description: "Points for registering.", points: 100 },
            { slug: "daily_visit", title: "Daily Visit", description: "Points for daily app open.", points: 10 },
            { slug: "share_app", title: "Share App", description: "Points for sharing app link.", points: 50 },
        ]);
        console.log("Seeded activities");
    }
    const giftCardCount = await GiftCard_1.default.countDocuments();
    if (giftCardCount === 0) {
        await GiftCard_1.default.create([
            { name: "Amazon ₹100", provider: "Amazon", pointsCost: 1000, amount: 100 },
            { name: "Flipkart ₹200", provider: "Flipkart", pointsCost: 1800, amount: 200 },
            { name: "Paytm Wallet ₹50", provider: "Paytm", pointsCost: 500, amount: 50 },
        ]);
        console.log("Seeded gift cards");
    }
    const adminEmail = process.env.ADMIN_EMAIL || "admin@peerks.in";
    let admin = await User_1.default.findOne({ email: adminEmail });
    if (!admin) {
        const hashed = await bcryptjs_1.default.hash(process.env.ADMIN_PASSWORD || "admin123", 10);
        admin = await User_1.default.create({ name: "Admin", email: adminEmail, password: hashed, role: "admin", pointBalance: 0 });
        console.log("Seeded admin user", adminEmail);
    }
    return true;
}
//# sourceMappingURL=seed.js.map