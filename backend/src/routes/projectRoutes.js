import express from "express";

import { createProject, addMember, getProjectMembers } from "../controllers/projectController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createProject);
router.get("/:id/members", authMiddleware, getProjectMembers);

router.post("/:id/members", authMiddleware, addMember);

export default router;