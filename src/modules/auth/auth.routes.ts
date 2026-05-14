import { Router } from "express";
import { getMe, loginUser, logoutUser} from "./auth.controller";
import { requireAuth } from "../../middleware/requireAuth";
import { authLimiter } from "../../middleware/rateLimiter";

const router = Router();

router.post("/login", authLimiter, loginUser);
router.post("/logout", authLimiter, logoutUser);
router.get("/me", requireAuth, getMe);

export default router;