import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as AuthController from "../controllers/AuthController";

const router = Router();

router.post("/register", AuthController.register);
router.post("/guest", AuthController.guestLogin);
router.post("/google", AuthController.googleLogin);
router.post("/login", AuthController.login);
router.get("/me", authenticate, AuthController.getMe);

export default router;
