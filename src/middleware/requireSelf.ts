import type { NextFunction, Request, Response } from "express";
import { AppError } from "../types/errors";

/**
 * Authorization gate for /users/:id mutations.
 * Requires the session user to match the :id route param.
 * Pair with requireAuth so req.session.userId is guaranteed.
 */

export const requireSelf = (req: Request<{ id: string}>, _res: Response, next: NextFunction): void => {
    const sessionUserId = req.session.userId;
    if (!sessionUserId || sessionUserId !== req.params.id) {
        return next(new AppError(403, "Forbidden"));
    }
    next();
};
