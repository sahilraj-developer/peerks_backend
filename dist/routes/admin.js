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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const AdminAnalyticsController = __importStar(require("../controllers/AdminAnalyticsController"));
const AdminUserController = __importStar(require("../controllers/AdminUserController"));
const AdminFinanceController = __importStar(require("../controllers/AdminFinanceController"));
const AdminVendorController = __importStar(require("../controllers/AdminVendorController"));
const AdminActivityController = __importStar(require("../controllers/AdminActivityController"));
const AdminGiftCardController = __importStar(require("../controllers/AdminGiftCardController"));
const AdminStoreController = __importStar(require("../controllers/AdminStoreController"));
const AdminPostController = __importStar(require("../controllers/AdminPostController"));
const AdminTaskController = __importStar(require("../controllers/AdminTaskController"));
const router = (0, express_1.Router)();
// Analytics
router.get("/analytics", auth_1.authenticate, auth_1.ensureAdmin, AdminAnalyticsController.getAnalytics);
router.get("/analytics/timeseries", auth_1.authenticate, auth_1.ensureAdmin, AdminAnalyticsController.getTimeseries);
// Users
router.get("/users", auth_1.authenticate, auth_1.ensureAdmin, AdminUserController.getUsers);
router.post("/users/bulk", auth_1.authenticate, auth_1.ensureAdmin, AdminUserController.bulkUsers);
// Finance (Redemptions & Topups)
router.get("/redemptions", auth_1.authenticate, auth_1.ensureAdmin, AdminFinanceController.getRedemptions);
router.get("/topups", auth_1.authenticate, auth_1.ensureAdmin, AdminFinanceController.getTopups);
// Vendors
router.get("/vendors", auth_1.authenticate, auth_1.ensureAdmin, AdminVendorController.getVendors);
router.post("/vendors", auth_1.authenticate, auth_1.ensureAdmin, AdminVendorController.createVendor);
// Activities
router.get("/activities", auth_1.authenticate, auth_1.ensureAdmin, AdminActivityController.getActivities);
router.post("/activities", auth_1.authenticate, auth_1.ensureAdmin, AdminActivityController.createActivity);
router.post("/activities/bulk", auth_1.authenticate, auth_1.ensureAdmin, AdminActivityController.bulkActivities);
router.put("/activities/:id", auth_1.authenticate, auth_1.ensureAdmin, AdminActivityController.updateActivity);
router.delete("/activities/:id", auth_1.authenticate, auth_1.ensureAdmin, AdminActivityController.deleteActivity);
// Gift Cards
router.get("/giftcards", auth_1.authenticate, auth_1.ensureAdmin, AdminGiftCardController.getGiftCards);
router.post("/giftcards", auth_1.authenticate, auth_1.ensureAdmin, AdminGiftCardController.createGiftCard);
router.post("/giftcards/bulk", auth_1.authenticate, auth_1.ensureAdmin, AdminGiftCardController.bulkGiftCards);
router.put("/giftcards/:id", auth_1.authenticate, auth_1.ensureAdmin, AdminGiftCardController.updateGiftCard);
router.delete("/giftcards/:id", auth_1.authenticate, auth_1.ensureAdmin, AdminGiftCardController.deleteGiftCard);
// Stores
router.post("/stores", auth_1.authenticate, auth_1.ensureAdmin, AdminStoreController.createStore);
router.put("/stores/:id", auth_1.authenticate, auth_1.ensureAdmin, AdminStoreController.updateStore);
router.delete("/stores/:id", auth_1.authenticate, auth_1.ensureAdmin, AdminStoreController.deleteStore);
// Posts
router.get("/posts", auth_1.authenticate, auth_1.ensureAdmin, AdminPostController.getPosts);
router.put("/posts/:id/status", auth_1.authenticate, auth_1.ensureAdmin, AdminPostController.updatePostStatus);
// Tasks
router.get("/tasks", auth_1.authenticate, auth_1.ensureAdmin, AdminTaskController.getAllTasks);
router.post("/tasks", auth_1.authenticate, auth_1.ensureAdmin, AdminTaskController.createTask);
router.put("/tasks/:id", auth_1.authenticate, auth_1.ensureAdmin, AdminTaskController.updateTask);
router.delete("/tasks/:id", auth_1.authenticate, auth_1.ensureAdmin, AdminTaskController.deleteTask);
exports.default = router;
//# sourceMappingURL=admin.js.map