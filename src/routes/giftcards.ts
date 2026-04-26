import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as GiftCardController from "../controllers/GiftCardController";

const router = Router();

router.get("/", authenticate, GiftCardController.getGiftCards);

export default router;
