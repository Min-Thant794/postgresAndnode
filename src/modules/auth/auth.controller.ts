import { NextFunction, Request, Response } from "express";
import { ABSOLUTE_TIMEOUT_MS, IDLE_TIMEOUT_MS } from "../../config/session";
import { AppError } from "../../types/errors";
import { getCurrentUserService, loginUserService } from "./auth.service";
import { validateLogin } from "./auth.validator";
import { clearAuthCookie, destroySession, regenerateSession, saveSession, setNoStoreHeaders } from "../../utils/sessionHelpers";

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
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
        return next(error);
    };
};

export const logoutUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        setNoStoreHeaders(res);

        if (!req.session) {
            clearAuthCookie(res);
            return res.status(204).end;
        }

        await destroySession(req);
        clearAuthCookie(res);
        res.setHeader("Clear-Site-Data", '"cache", "cookies", "storage"');

        return res.status(204).end();
    } catch (error) {
        return next(error);
    }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
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
        return next(error);
    }
};
