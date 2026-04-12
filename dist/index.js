"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = __importDefault(require("./routes/auth"));
const activities_1 = __importDefault(require("./routes/activities"));
const redemptions_1 = __importDefault(require("./routes/redemptions"));
const admin_1 = __importDefault(require("./routes/admin"));
const giftcards_1 = __importDefault(require("./routes/giftcards"));
const balance_1 = __importStar(require("./routes/balance"));
const vendor_1 = __importDefault(require("./routes/vendor"));
const colleges_1 = __importDefault(require("./routes/colleges"));
const seed_1 = __importDefault(require("./seed"));
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
const mongoUrl = process.env.MONGODB_URI || "mongodb://localhost:27017/peerks";
app.use((0, cors_1.default)());
app.post("/api/balance/stripe/webhook", express_1.default.raw({ type: "application/json" }), balance_1.handleStripeWebhook);
app.use(express_1.default.json());
app.use("/api/auth", auth_1.default);
app.use("/api/activities", activities_1.default);
app.use("/api/giftcards", giftcards_1.default);
app.use("/api/redemptions", redemptions_1.default);
app.use("/api/balance", balance_1.default);
app.use("/api/vendor", vendor_1.default);
app.use("/api/colleges", colleges_1.default);
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