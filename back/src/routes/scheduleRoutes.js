import express from "express";
import scheduleController from "../controllers/scheduleController.js";

const router = express.Router();

router.get("/schedules", scheduleController.getAll);
router.post("/schedules", scheduleController.createSchedule);
router.delete("/schedules/:id", scheduleController.deleteSchedule);

export default router;
