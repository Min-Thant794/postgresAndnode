import type { Request, Response } from "express";
import { clearSessionCookieOptions, SESSION_COOKIE_NAME } from "../config/session";

export const setNoStoreHeaders = (res: Response) => {
    res.setHeader("Cache-Control", "no-store, private");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
};

export const clearAuthCookie = (res: Response) => {
    res.clearCookie(SESSION_COOKIE_NAME, clearSessionCookieOptions);
};

export const destroySession = (req: Request): Promise<void> => {
    return new Promise((resolve, reject) => {
        req.session.destroy((error) => {
            if (error) {
                reject(error)
            };
            resolve();
        });
    });
};

export const regenerateSession = (req: Request): Promise<void> => {
    return new Promise((resolve, reject) => {
        req.session.regenerate((error) => {
            if (error) {
                reject(error);
            };
            resolve();
        });
    });
};

export const saveSession = (req: Request): Promise<void> => {
    return new Promise((resolve, reject) => {
        req.session.save((error) => {
            if (error) {
                reject(error);
            };
            resolve();
        });
    });
};