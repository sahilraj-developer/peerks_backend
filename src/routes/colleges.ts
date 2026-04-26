import { Router } from "express";
import * as CollegeController from "../controllers/CollegeController";

const router = Router();

router.get("/", CollegeController.getColleges);

export default router;
