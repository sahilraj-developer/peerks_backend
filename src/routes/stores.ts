import express from "express";
import * as StoreController from "../controllers/StoreController";

const router = express.Router();

router.get("/", StoreController.getStores);
router.get("/:id", StoreController.getStoreById);

export default router;
