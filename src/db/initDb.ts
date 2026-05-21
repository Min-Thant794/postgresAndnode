import fs from "fs";
import path from "path";
import pool from "./pool";

const ensureMigrationsTable = async (client: import("pg").PoolClient): Promise<void> => {
    await client.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            filename TEXT PRIMARY KEY,
            applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
};

const getAppliedMigrations = async (client: import("pg").PoolClient): Promise<Set<string>> => {
    const result = await client.query<{ filename: string }>(
        `
        SELECT filename FROM schema_migrations
        `
    );
    return new Set(result.rows.map((row) => row.filename));
};

const initDb = async (): Promise<void> => {
    const client = await pool.connect();
    try {
        await ensureMigrationsTable(client);
        const applied = await getAppliedMigrations(client);

        const migrationDir = path.join(__dirname, "migrations");
        const files = fs.readdirSync(migrationDir).filter((file) => file.endsWith(".sql")).sort();

        for (const file of files) {
            if (applied.has(file)) {
                console.log(`Skipping ${file} (already applied)`);
                continue;
            }

            const sql = fs.readFileSync(path.join(migrationDir, file), "utf-8");

            await client.query("BEGIN");
            try {
                await client.query(sql);
                await client.query(
                    `
                    INSERT INTO schema_migrations (filename) VALUES ($1)
                    `,
                    [file]
                );
                await client.query("COMMIT");
                console.log(`Executed ${file}`);
            } catch (error) {
                await client.query("ROLLBACK");
                throw new Error(`Migration ${file} failed: ${(error as Error).message}`);
            }
        }

        console.log("Database initialization success!");
        process.exit(0);
    } catch (error) {
        console.error("Database initialization failed: ", error);
        process.exit(1);
    } finally {
        client.release();
    }
};

initDb();
