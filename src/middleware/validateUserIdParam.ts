import type { NextFunction, Request, Response } from "express";
import { AppError } from "../types/errors";
import { isValidUUID } from "../utils/normalize";

export const validateUserIdParam = (
    _req: Request, _res: Response, next: NextFunction, id: string
): void => {
    if (!isValidUUID(id)) {
        return next(new AppError(400, "Invalid user id"));
    }

    next();
};
