import type { NextFunction, Request, Response } from "express";
import { AppError } from "../types/errors";

const isPgError = (error: unknown): error is { code: string } => 
    typeof error === "object" && error !== null && "code" in error &&
    typeof (error as { code: unknown }).code === "string";

export const notFoundHandler = (_req: Request, res: Response) => {
    res.status(404).json({
        message: "Route not found"
    });
};

export const errorHandler = (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    if (res.headersSent) {
        return;
    }

    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            message: error.message
        });
    }

    if (isPgError(error) && error.code === "23505") {
        return res.status(409).json({
            message: "Resource already exists"
        });
    }

    console.error("Unhandled error: ", error);
    return res.status(500).json({
        message: "Internal server error"
    });
};