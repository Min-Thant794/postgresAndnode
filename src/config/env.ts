import dotenv from "dotenv";
dotenv.config();

const required = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
};

const requiredOneof = (...keys: string[]): string => {
    for (const key of keys) {
        const value = process.env[key];
        if (value) {
            return value;
        };
    };
    throw new Error(`Missing required environment variable. Expected one of: ${keys.join(", ")}`);
};

const optional = (key: string, fallback: string): string => {
    return process.env[key] ?? fallback;
}

const toNumber = (value: string, keyName: string): number => {
    const parsed = Number(value);

    if (Number.isNaN(parsed)) {
        throw new Error(`Environment variable ${keyName} must be a valid number`);
    };

    return parsed;
};

export const env = {
    nodeEnv: optional("NODE_ENV", "development"),
    port: toNumber(optional("PORT", "5050"), "PORT"),

    pgUser: required("PGUSER"),
    pgPassword: required("PGPASSWORD"),
    pgHost: required("PGHOST"),
    pgDatabase: required("PGDATABASE"),
    pgPort: toNumber(optional("PGPORT", "5432"), "PGPORT"),

    sessionSecret: requiredOneof("SESSION_SECRETS", "SESSION_SECRET"),

    pepperV1: required("PEPPER_V1"),
    // Optional — only present during a pepper rotation. password.ts enforces
    // the 32-byte minimum when v2 is actually requested.
    pepperV2: optional("PEPPER_V2", ""),
};
