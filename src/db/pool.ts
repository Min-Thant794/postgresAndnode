import { Pool } from "pg";
import { env } from "../config/env";

const pool = new Pool({
    user: env.pgUser,
    password: env.pgPassword,
    host: env.pgHost,
    database: env.pgDatabase,
    port: env.pgPort,
});

export default pool;
