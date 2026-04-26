import { Router } from "express";
import { authenticate, ensureAdmin } from "../middleware/auth";
import * as AdminAnalyticsController from "../controllers/AdminAnalyticsController";
import * as AdminUserController from "../controllers/AdminUserController";
import * as AdminFinanceController from "../controllers/AdminFinanceController";
import * as AdminVendorController from "../controllers/AdminVendorController";
import * as AdminActivityController from "../controllers/AdminActivityController";
import * as AdminGiftCardController from "../controllers/AdminGiftCardController";
import * as AdminStoreController from "../controllers/AdminStoreController";
import * as AdminPostController from "../controllers/AdminPostController";
import * as AdminTaskController from "../controllers/AdminTaskController";

const router = Router();

// Analytics
router.get("/analytics", authenticate, ensureAdmin, AdminAnalyticsController.getAnalytics);
router.get("/analytics/timeseries", authenticate, ensureAdmin, AdminAnalyticsController.getTimeseries);

// Users
router.get("/users", authenticate, ensureAdmin, AdminUserController.getUsers);
router.post("/users/bulk", authenticate, ensureAdmin, AdminUserController.bulkUsers);

// Finance (Redemptions & Topups)
router.get("/redemptions", authenticate, ensureAdmin, AdminFinanceController.getRedemptions);
router.get("/topups", authenticate, ensureAdmin, AdminFinanceController.getTopups);

// Vendors
router.get("/vendors", authenticate, ensureAdmin, AdminVendorController.getVendors);
router.post("/vendors", authenticate, ensureAdmin, AdminVendorController.createVendor);

// Activities
router.get("/activities", authenticate, ensureAdmin, AdminActivityController.getActivities);
router.post("/activities", authenticate, ensureAdmin, AdminActivityController.createActivity);
router.post("/activities/bulk", authenticate, ensureAdmin, AdminActivityController.bulkActivities);
router.put("/activities/:id", authenticate, ensureAdmin, AdminActivityController.updateActivity);
router.delete("/activities/:id", authenticate, ensureAdmin, AdminActivityController.deleteActivity);

// Gift Cards
router.get("/giftcards", authenticate, ensureAdmin, AdminGiftCardController.getGiftCards);
router.post("/giftcards", authenticate, ensureAdmin, AdminGiftCardController.createGiftCard);
router.post("/giftcards/bulk", authenticate, ensureAdmin, AdminGiftCardController.bulkGiftCards);
router.put("/giftcards/:id", authenticate, ensureAdmin, AdminGiftCardController.updateGiftCard);
router.delete("/giftcards/:id", authenticate, ensureAdmin, AdminGiftCardController.deleteGiftCard);

// Stores
router.post("/stores", authenticate, ensureAdmin, AdminStoreController.createStore);
router.put("/stores/:id", authenticate, ensureAdmin, AdminStoreController.updateStore);
router.delete("/stores/:id", authenticate, ensureAdmin, AdminStoreController.deleteStore);

// Posts
router.get("/posts", authenticate, ensureAdmin, AdminPostController.getPosts);
router.put("/posts/:id/status", authenticate, ensureAdmin, AdminPostController.updatePostStatus);
router.put("/posts/:id", authenticate, ensureAdmin, AdminPostController.updatePost);
router.delete("/posts/:id", authenticate, ensureAdmin, AdminPostController.deletePost);

// Tasks
router.get("/tasks", authenticate, ensureAdmin, AdminTaskController.getAllTasks);
router.post("/tasks", authenticate, ensureAdmin, AdminTaskController.createTask);
router.put("/tasks/:id", authenticate, ensureAdmin, AdminTaskController.updateTask);
router.delete("/tasks/:id", authenticate, ensureAdmin, AdminTaskController.deleteTask);

export default router;
