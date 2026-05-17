import { Router} from "express";
import { getUsers, getUserById, createUser, updateProfile, updateEmail, updatePassword, deleteUser } from "./user.controller";
import { requireAuth } from "../../middleware/requireAuth";
import { authLimiter } from "../../middleware/rateLimiter";
import { uploadImage } from "../../middleware/imageUpload";

const router = Router();

router.post("/create-user", authLimiter, uploadImage.single("profileImage"), createUser);

router.get("/get-users", requireAuth, getUsers);
router.get("/get-user/:id", requireAuth, getUserById);
router.patch("/update-profile/:id", requireAuth, uploadImage.single("profileImage"), updateProfile);
router.patch("/update-email/:id", requireAuth, updateEmail);
router.patch("/update-password/:id", requireAuth, updatePassword);
router.delete("/delete-user/:id", requireAuth, deleteUser);

export default router;