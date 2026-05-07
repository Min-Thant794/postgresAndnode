import express from "express";
import pool from "../src/db/pool";
import { sessionMiddleware } from "./config/session";
import userRoutes from "../src/modules/users/user.routes";
import authRoutes from "../src/modules/auth/auth.routes";

const app = express();

if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}

app.use(express.json());
app.use(sessionMiddleware);

app.get("/test-connection", async (_req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({ message: "Postgres connection success!", time: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: "Failed to connect", error: "DB error" });
    }
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);

export default app;
