import "express-session";

declare module "express-session" {
    interface SessionData {
        userId?: string;
        createdAt?: number;
        absoluteExpiresAt?: number;
    }
};

export{};