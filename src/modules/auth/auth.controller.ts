import { Request, Response } from "express";
import { ABSOLUTE_TIMEOUT_MS, IDLE_TIMEOUT_MS } from "../../config/session";
import { AppError } from "../../types/errors";
import { getCurrentUserService, loginUserService } from "./auth.service";
import { validateLogin } from "./auth.validator";
import { clearAuthCookie, destroySession, regenerateSession, saveSession, setNoStoreHeaders } from "../../utils/sessionHelpers";
import { asyncHandler } from "../../utils/asyncHandler";

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
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
        message: "Login success",
        data: user,
    });
});

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
    setNoStoreHeaders(res);

    if (!req.session) {
        clearAuthCookie(res);
        return res.status(204).end();
    }

    await destroySession(req);
    clearAuthCookie(res);
    res.setHeader("Clear-Site-Data", '"cache", "cookies", "storage"');

    return res.status(204).end();
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
    setNoStoreHeaders(res);
    const userId = req.session.userId;
    if (!userId) {
        throw new AppError(401, "Not authenticated");
    }

    const user = await getCurrentUserService(userId);
    return res.status(200).json({
        message: "current user fetched success",
        data: user,
    });
});
