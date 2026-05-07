import express from "express";
import { getUsers, getUserById, createUser, updateProfile, updateEmail, updatePassword, deleteUser } from "./user.controller";
import { requireAuth } from "../../middleware/requireAuth";

const router = express.Router();

router.post("/create-user", createUser);
router.get("/get-users", requireAuth, getUsers);
router.get("/get-user/:id", requireAuth, getUserById);
router.patch("/update-profile/:id", requireAuth, updateProfile);
router.patch("/update-email/:id", requireAuth, updateEmail);
router.patch("/update-password/:id", requireAuth, updatePassword);
router.delete("/delete-user/:id", requireAuth, deleteUser);

export default router;