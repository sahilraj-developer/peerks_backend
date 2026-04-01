"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = __importDefault(require("./routes/auth"));
const activities_1 = __importDefault(require("./routes/activities"));
const redemptions_1 = __importDefault(require("./routes/redemptions"));
const admin_1 = __importDefault(require("./routes/admin"));
const seed_1 = __importDefault(require("./seed"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
const mongoUrl = process.env.MONGODB_URI || "mongodb://localhost:27017/peerks";
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/auth", auth_1.default);
app.use("/api/activities", activities_1.default);
app.use("/api/redemptions", redemptions_1.default);
app.use("/api/admin", admin_1.default);
app.get("/api/status", (req, res) => res.json({ status: "ok", time: new Date() }));
mongoose_1.default
    .connect(mongoUrl)
    .then(async () => {
    console.log("Connected to MongoDB", mongoUrl);
    await (0, seed_1.default)();
    app.listen(port, () => {
        console.log(`Perks backend running at http://localhost:${port}`);
    });
})
    .catch((err) => {
    console.error("MongoDB connection failed", err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map