import express from "express";
import { createProject, getProjects, addMember } from "../controllers/projectController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createProject);
router.get("/", authMiddleware, getProjects);
router.post("/:projectId/members", authMiddleware, addMember);

export default router;