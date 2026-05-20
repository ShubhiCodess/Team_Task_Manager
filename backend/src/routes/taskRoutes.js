import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import { createTask, getMyTasks, updateTaskStatus, addComment,
  getDashboardStats,
} from "../controllers/taskController.js";

const router = express.Router();

router.post("/", authMiddleware, createTask);
router.get("/my", authMiddleware, getMyTasks);
router.patch("/:id/status", authMiddleware, updateTaskStatus);
router.post("/:id/comment", authMiddleware, addComment);
router.get("/dashboard/stats", authMiddleware, getDashboardStats);

export default router;