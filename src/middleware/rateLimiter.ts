import rateLimit from "express-rate-limit";

// General API limiter - applied to all routes
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "Too many requests, please try again later."
    },
});

// Strict limiter for auth endpoints (login / logout)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "Too many authentication attempts, please try again later."
    },
})