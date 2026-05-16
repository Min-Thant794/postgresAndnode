import express, { NextFunction, Request, Response } from "express";
import { env } from "./config/env";
import pool from "./db/pool";
import { sessionMiddleware } from "./config/session";
import userRoutes from "./modules/users/user.routes";
import authRoutes from "./modules/auth/auth.routes";
import { apiLimiter } from "./middleware/rateLimiter";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

if (env.nodeEnv === "production") {
    app.set("trust proxy", 1);
}

app.use(express.json({ limit: "100kb" }));
app.use(apiLimiter);
app.use(sessionMiddleware);

if (env.nodeEnv !== "production") {
    app.get("/test-connection", async (_req, res, next) => {
        try {
            const result = await pool.query("SELECT NOW()");
            res.json({ message: "Postgres conneciton success!", time: result.rows[0] });
        } catch (error) {
            next(error);
        };
    });
}

app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
})
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
