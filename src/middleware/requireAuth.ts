import { NextFunction, Request, Response } from "express";
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

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        setNoStoreHeaders(res);

        if (!req.session.userId) {
            return res.status(401).json({
                message: "Not authenticated",
            })
        }

        if (req.session.absoluteExpiresAt && Date.now() > req.session.absoluteExpiresAt) {
            try {
                await destroySession(req);
            } catch {
                // ignore destroy failure
            }

            res.clearCookie(SESSION_COOKIE_NAME, clearSessionCookieOptions);

            return res.status(401).json({
                message: "Session expired. Please log in again."
            });
        }

        next();
    } catch (error) {
        console.error("requireAuth error: ", error);

        return res.status(500).json({
            message: "Internal server error"
        })
    }
}