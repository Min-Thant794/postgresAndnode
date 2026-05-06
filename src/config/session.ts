import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pool from "./db";

export const isProduction = process.env.NODE_ENV === "production";

export const SESSION_COOKIE_NAME = "sid";
export const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
export const ABSOLUTE_TIMEOUT_MS = 8 * 60 * 60 * 1000;

/*
    Real-world secret rotation:
    SESSION_SECRETS=new-secret, old-secret-1, old-secret-2
    if SESSION_SECRETS is missing, fallback to SESSOIN_SECRET.
*/

const rawSecrets = process.env.SESSION_SECRETS ?? process.env.SESSION_SECRETS ?? "";

const sessionSecrets = rawSecrets.split(",").map((value) => value.trim()).filter(Boolean);

if (sessionSecrets.length === 0) {
    throw new Error (
        "Missing SESSION_SECRET or SESSION_SECRETS in environment variables"
    );
}

const PgStore = connectPgSimple(session);

export const sessionCookieOptions: session.CookieOptions = {
    path: "/",
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: IDLE_TIMEOUT_MS
};

export const clearSessionCookieOptions = {
    path: "/",
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const
};

export const sessionMiddleware = session({
    name: SESSION_COOKIE_NAME,
    secret: sessionSecrets,
    store: new PgStore({
        pool,
        tableName: "user_sessions",

        //Real-world preference;
        // -dev: okay to auto-create
        // -prod: use your own SQL migration instead
        createTableIfMissing: false || !isProduction,

        // Keep DB session TTL refreshed while the user is active
        disableTouch: false,

        // Prune expired sessions every 15 minutes
        pruneSessionInterval: 60 * 15
    }),
    resave: false,
    saveUninitialized: false,
    rolling: true,
    unset: "destroy",
    cookie: sessionCookieOptions
});