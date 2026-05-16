import express, { NextFunction, Request, Response } from "express";
import { env } from "./config/env";
import pool from "./db/pool";
import { sessionMiddleware } from "./config/session";
import userRoutes from "./modules/users/user.routes";
import authRoutes from "./modules/auth/auth.routes";
import { apiLimiter } from "./middleware/rateLimiter";
import { AppError } from "./types/errors";

const app = express();

if (env.nodeEnv === "production") {
    app.set("trust proxy", 1);
}

app.use(express.json({ limit: "100kb" }));
app.use(apiLimiter);
app.use(sessionMiddleware);

if (env.nodeEnv !== "production") {
    app.get("/test-connection", async (_req, res) => {
        try {
            const result = await pool.query("SELECT NOW()");
            res.json({ message: "Postgres conneciton success!", time: result.rows[0] });
        } catch (error) {
            res.status(500).json({
                message: "Failed to connect",
                error: "DB error"
            });
        };
    });
}

app.use("/auth", authRoutes);
app.use("/users", userRoutes);

app.use((_req, res) => {
    res.status(404).json({
        message: "Not found"
    });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ 
            message: err.message 
        });
    }
    console.error("Unhandled error:", err);
    return res.status(500).json({ 
        message: "Internal server error" 
    });
});

export default app;
