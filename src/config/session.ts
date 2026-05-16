import { env } from "./env";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import type { Response } from "express";
import pool from "../db/pool";

export const isProduction = env.nodeEnv === "production";

export const SESSION_COOKIE_NAME: string = "sid";
export const IDLE_TIMEOUT_MS: number = 15 * 60 * 1000;
export const ABSOLUTE_TIMEOUT_MS: number = 5 * 60 * 60 * 1000;

/**
 * Real-world secret rotation
 * SESSION_SECRETS=new-secret, old-secret-1, old-secret-2
 * 
 * Express can accept an array of secrets:
 * - the first secret is used to sign new cookies
 * - old secrets are still accepted for verifying existing cookies
 */

const sessionSecrets = env.sessionSecret.split(",").map((value) => value.trim()).filter(Boolean);

if (sessionSecrets.length === 0) {
    throw new Error("Missing SESSION_SECRET or SESSION_SECRETS in environment variables");
}

const pgStore = connectPgSimple(session);

export const sessionCookieOptions: session.CookieOptions = {
    path: "/",
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: IDLE_TIMEOUT_MS,
};

type ClearCookieOptions = NonNullable<Parameters<Response["clearCookie"]>[1]>;

export const clearSessionCookieOptions: ClearCookieOptions = {
    path: "/",
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
};

export const sessionMiddleware = session({
    name: SESSION_COOKIE_NAME,
    secret: sessionSecrets,
    store: new pgStore({
        pool,
        tableName: "user_sessions",
        createTableIfMissing: !isProduction,
        disableTouch: false,
        pruneSessionInterval: 60 * 15,
    }),
    resave: false,
    saveUninitialized: false,
    rolling: true,
    unset: "destroy",
    cookie: sessionCookieOptions,
});