import { NextFunction, Request, Response } from "express";
import pool from "../db/pool";
import { clearAuthCookie, destroySession, setNoStoreHeaders } from "../utils/sessionHelpers";

const invalidateSession = async (req: Request, res: Response, message: string) => {
    try {
        await destroySession(req);
    } catch (error) {
        // Ignore destroy failure; still clear cookie.
    }

    clearAuthCookie(res);
    return res.status(401).json({ message });
};

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        setNoStoreHeaders(res);

        if (!req.session.userId || !req.session.createdAt) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        };

        if (req.session.absoluteExpiresAt && Date.now() > req.session.absoluteExpiresAt) {
            return invalidateSession(req, res, "Session expired. Please log in again.");
        }

        const result = await pool.query(
            `
            SELECT password_changed_at 
            FROM users 
            WHERE id = $1,
            `,
            [req.session.userId]
        );

        if (result.rows.length === 0) {
            return invalidateSession(req, res, "User no longer exists");
        };

        const passwordChangedAtValue = result.rows[0].password_changed_at;

        if (passwordChangedAtValue) {
            const passwordChangedAt = new Date(passwordChangedAtValue).getTime();

            if (req.session.createdAt < passwordChangedAt) {
                return invalidateSession(req, res, "Session invalidated due to password change. Please log in again");
            };
        };

        next();
    } catch (error) {
        console.error("requireAuth error: ", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    };
};