import { Router } from "express";
import { authenticate, ensureVendorOrAdmin } from "../middleware/auth";
import * as VendorController from "../controllers/VendorController";

const router = Router();

router.get("/analytics", authenticate, ensureVendorOrAdmin, VendorController.getAnalytics);
router.get("/giftcards", authenticate, ensureVendorOrAdmin, VendorController.getGiftCards);
router.post("/giftcards", authenticate, ensureVendorOrAdmin, VendorController.createGiftCard);
router.put("/giftcards/:id", authenticate, ensureVendorOrAdmin, VendorController.updateGiftCard);

export default router;
