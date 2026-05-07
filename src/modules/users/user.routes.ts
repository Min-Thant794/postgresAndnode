import express from "express";
import { getUsers, getUserById, createUser, updateUser, updatePassword, deleteUser } from "./user.controller";
import { requireAuth } from "../../middleware/requireAuth";

const router = express.Router();

router.post("/create-user", createUser);
router.get("/get-users", requireAuth, getUsers);
router.get("/get-user/:id", requireAuth, getUserById);
router.patch("/update-user/:id", requireAuth, updateUser);
router.patch("/update-password/:id", requireAuth, updatePassword);
router.delete("/delete-user/:id", requireAuth, deleteUser);

export default router;