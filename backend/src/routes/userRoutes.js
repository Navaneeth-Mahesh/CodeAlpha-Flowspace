import express from "express";
import { lookupByEmail, searchCollaborators } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/lookup", lookupByEmail);
router.get("/collaborators", searchCollaborators);

export default router;
