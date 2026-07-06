import express from "express";
import {
  getMyTasks,
  getTask,
  updateTask,
  deleteTask,
  setTaskArchived,
  duplicateTask,
  addChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  searchTasks,
} from "../controllers/taskController.js";
import { getComments, createComment } from "../controllers/commentController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/mine", getMyTasks);
router.get("/search", searchTasks);
router.route("/:id").get(getTask).patch(updateTask).delete(deleteTask);
router.patch("/:id/archive", setTaskArchived);
router.post("/:id/duplicate", duplicateTask);
router.post("/:id/checklist", addChecklistItem);
router.patch("/:id/checklist/:itemId", updateChecklistItem);
router.delete("/:id/checklist/:itemId", deleteChecklistItem);

router.route("/:taskId/comments").get(getComments).post(createComment);

export default router;
