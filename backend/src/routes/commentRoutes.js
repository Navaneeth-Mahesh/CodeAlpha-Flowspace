import express from "express";
import { updateComment, deleteComment, toggleReaction } from "../controllers/commentController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.route("/:id").patch(updateComment).delete(deleteComment);
router.post("/:id/reactions", toggleReaction);

export default router;
