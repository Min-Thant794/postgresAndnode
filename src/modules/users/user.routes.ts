import express from "express";
import { getUsers, getUserById, createUser, updateUser, deleteUser } from "./user.controller";

const router = express.Router();

router.get("/get-users", getUsers);
router.post("/create-user", createUser);
router.get("/get-user/:id", getUserById);
router.patch("/update-user/:id", updateUser);
router.delete("/delete-user/:id", deleteUser);

export default router;