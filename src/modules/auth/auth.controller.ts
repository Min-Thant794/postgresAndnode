import { Request, Response } from "express";
import { ABSOLUTE_TIMEOUT_MS, clearSessionCookieOptions, IDLE_TIMEOUT_MS, SESSION_COOKIE_NAME } from "../../config/session";
import { AppError } from "../../types/errors";
import { getCurrentUserService, loginUserService } from "./auth.service";
import { validateLogin } from "./auth.validator";

const setNoStoreHeaders = (res: Response) => {
    res.setHeader("Cache-Control", "no-store, private");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
};

const clearAuthCookie = (res: Response) => {
    res.clearCookie(SESSION_COOKIE_NAME, clearSessionCookieOptions);
};

const regenerateSession = (req: Request): Promise<void> => {
    return new Promise((resolve, reject) => {
        req.session.regenerate((error) => {
            if (error) reject(error);
            else resolve();
        });
    });
};

const saveSession = (req: Request): Promise<void> => {
    return new Promise((resolve, reject) => {
        req.session.save((error) => {
            if (error) reject(error);
            else resolve();
        });
    });
};

const destroySession = (req: Request): Promise<void> => {
    return new Promise((resolve, reject) => {
        req.session.destroy((error) => {
            if (error) reject(error);
            else resolve();
        });
    });
};

const handleAuthError = (error: unknown, res: Response) => {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
    }

    if (typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "42601") {
        return res.status(500).json({ message: "sql syntax error" });
    }

    console.error("Auth controller error: ", error);
    return res.status(500).json({ message: "Internal server error" });
};

export const loginUser = async (req: Request, res: Response) => {
    try {
        setNoStoreHeaders(res);

        const input = validateLogin(req.body);
        const user = await loginUserService(input);

        await regenerateSession(req);

        const now = Date.now();
        req.session.userId = user.id;
        req.session.createdAt = now;
        req.session.absoluteExpiresAt = now + ABSOLUTE_TIMEOUT_MS;
        req.session.cookie.maxAge = IDLE_TIMEOUT_MS;

        await saveSession(req);

        return res.status(200).json({
            message: "login successful",
            data: user,
        });
    } catch (error) {
        return handleAuthError(error, res);
    }
};

export const logoutUser = async (req: Request, res: Response) => {
    try {
        setNoStoreHeaders(res);

        if (!req.session) {
            clearAuthCookie(res);
            return res.status(204).send();
        }

        await destroySession(req);
        clearAuthCookie(res);
        res.setHeader("Clear-Site-Data", '"cache", "cookies", "storage"');

        return res.status(204).send();
    } catch (error) {
        return handleAuthError(error, res);
    }
};

export const getMe = async (req: Request, res: Response) => {
    try {
        setNoStoreHeaders(res);
        const userId = req.session.userId;
        if (!userId) {
            throw new AppError(401, "Not authenticated");
        }
        const user = await getCurrentUserService(userId);
        return res.status(200).json({
            message: "current user fetched successfully",
            data: user,
        });
    } catch (error) {
        return handleAuthError(error, res);
    }
}