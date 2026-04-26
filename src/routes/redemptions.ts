import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as RedemptionController from "../controllers/RedemptionController";

const router = Router();

router.get("/", authenticate, RedemptionController.getRedemptions);
router.get("/active", authenticate, RedemptionController.getActiveRedemptions);
router.post("/", authenticate, RedemptionController.createRedemption);

export default router;
