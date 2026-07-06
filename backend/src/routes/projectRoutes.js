import express from "express";
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  setArchived,
  toggleFavorite,
  duplicateProject,
  inviteMember,
  removeMember,
  cancelInvite,
  updateMemberRole,
} from "../controllers/projectController.js";
import { getTasks, createTask } from "../controllers/taskController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.route("/").get(getProjects).post(createProject);
router.route("/:id").get(getProject).patch(updateProject).delete(deleteProject);
router.patch("/:id/archive", setArchived);
router.patch("/:id/favorite", toggleFavorite);
router.post("/:id/duplicate", duplicateProject);
router.post("/:id/invite", inviteMember);
router.delete("/:id/members/:userId", removeMember);
router.patch("/:id/members/:userId", updateMemberRole);
router.delete("/:id/invites/:email", cancelInvite);

router.route("/:projectId/tasks").get(getTasks).post(createTask);

export default router;
