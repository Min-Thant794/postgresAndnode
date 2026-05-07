function required(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

function optional(key: string, fallback: string): string {
    return process.env[key] ?? fallback;
}

export const env = {
    nodeEnv: optional("NODE_ENV", "development"),
    port: Number(optional("PORT", "5050")),

    //db
    pgUser: required("PGUSER"),
    pgPassword: required("PGPASSWORD"),
    pgHost: required("PGHOST"),
    pgDatabase: required("PGDATABASE"),
    pgPort: Number(optional("PGPORT", "5432")),

    //session
    sessionSecret: required("SESSION_SECRETS"),

    //auth
    pepper: required("PEPPER")
}