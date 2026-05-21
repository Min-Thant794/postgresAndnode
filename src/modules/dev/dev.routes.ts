import { Router } from "express";
import pool from "../../db/pool";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.get("/text-connection", asyncHandler(async (_req, res) => {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "Postgres connection success!", time: result.rows[0] });
}));

export default router;