import { Router } from "express";
import { getUsers, getUserById, createUser, updateProfile, updateEmail,updatePassword, deleteUser } from "./user.controller";
import { requireAuth } from "../../middleware/requireAuth";
import { requireSelf } from "../../middleware/requireSelf";
import { authLimiter } from "../../middleware/rateLimiter";
import { uploadImage } from "../../middleware/imageUpload";
import { validateUserIdParam } from "../../middleware/validateUserIdParam";

const router = Router();

router.param("id", validateUserIdParam);

router.post("/create-user", authLimiter, uploadImage.single("profileImage"), createUser);

router.get("/get-users", requireAuth, getUsers);
router.get("/get-user/:id", requireAuth, getUserById);
router.patch("/update-profile/:id", requireAuth, requireSelf, updateProfile);
router.patch("/update-email/:id", requireAuth, requireSelf, updateEmail);
router.patch("/update-password/:id", requireAuth, requireSelf, updatePassword);
router.delete("/delete-user/:id", requireAuth, requireSelf, deleteUser);

export default router;
