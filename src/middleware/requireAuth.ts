import { NextFunction, Request, Response } from "express";
import pool from "../db/pool";
import { clearSessionCookieOptions, SESSION_COOKIE_NAME} from "../config/session";

const destroySession = (req: Request): Promise<void> => {
    return new Promise((resolve, reject) => {
        req.session.destroy((error) => {
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });
    });
};

const setNoStoreHeaders = (res: Response) => {
    res.setHeader("Cache-Control", "no-store, private");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
};

const invalidateSession = async (req: Request, res: Response, message: string) => {
    try {
        await destroySession(req);
    } catch (error) {
        //ignore destroy failure; still clear the cookie
    }
    res.clearCookie(SESSION_COOKIE_NAME, clearSessionCookieOptions);
    return res.status(401).json({ message });
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        setNoStoreHeaders(res);

        if (!req.session.userId || !req.session.createdAt) {
            return res.status(401).json({
                message: "Not authenticated",
            })
        }

        if (req.session.absoluteExpiresAt && Date.now() > req.session.absoluteExpiresAt) {
            return invalidateSession(req, res, "Session expired. Please log in again.");
        }

        const result = await pool.query(`
            SELECT password_changed_at
            FROM users
            WHERE id = $1
            `,
            [req.session.userId]
        )

        if (result.rows.length === 0) {
            return invalidateSession(req, res, "User no longer exists");
        }

        const passwordChangedAt = new Date(result.rows[0].password_changed_at).getTime();
        if (req.session.createdAt < passwordChangedAt) {
            return invalidateSession(req, res, "Session invalidated due to password change. Please log in again.");
        }

        next();
    } catch (error) {
        console.error("requireAuth error: ", error);

        return res.status(500).json({
            message: "Internal server error"
        })
    }
}