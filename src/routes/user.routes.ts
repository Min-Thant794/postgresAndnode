import express from "express";
import { getUsers, getUserById,createUser, updateUser, deleteUser } from "../controllers/user.controller";

const router = express.Router();

router.get("/get-users", getUsers);
router.get("get-users/:id", getUserById);
router.post("/create-user", createUser);
router.patch("/update-user/:id", updateUser);
router.delete("/delete-user/:id", deleteUser);

export default router;