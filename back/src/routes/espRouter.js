import express from "express";
import espController from "../controllers/espController.js";

const router = express.Router();

router.get("/status", espController.getStatus);
router.post("/command", espController.sendCommand);

export default router;
