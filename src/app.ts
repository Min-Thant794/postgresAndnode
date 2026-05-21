import express from "express";
import { env } from "./config/env";
import { sessionMiddleware } from "./config/session";
import userRoutes from "./modules/users/user.routes";
import authRoutes from "./modules/auth/auth.routes";
import devRoutes from "./modules/dev/dev.routes";
import { apiLimiter } from "./middleware/rateLimiter";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

if (env.nodeEnv === "production") {
    app.set("trust proxy", 1);
}

app.use(express.json({ limit: "100kb" }));
app.use(apiLimiter);
app.use(sessionMiddleware);

app.use((req, _res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});

if (env.nodeEnv !== "production") {
    app.use(devRoutes);
}

app.use("/auth", authRoutes);
app.use("/users", userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
