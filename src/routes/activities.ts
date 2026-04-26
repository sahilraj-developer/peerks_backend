import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as ActivityController from "../controllers/ActivityController";

const router = Router();

router.get("/", authenticate, ActivityController.getActivities);
router.post("/:activityId/complete", authenticate, ActivityController.completeActivity);
router.get("/history", authenticate, ActivityController.getActivityHistory);

export default router;
