import fs from "fs";
import path from "path";
import pool from "../db/pool";

const initDb = async() => {
    const client = await pool.connect();
    try {
        const migrationDir = path.join(__dirname, "migrations");
        const files = fs.readdirSync(migrationDir).filter((file) => file.endsWith(".sql")).sort();

        for (const file of files) {
            const filePath = path.join(migrationDir, file);
            const sql = fs.readFileSync(filePath, "utf-8");

            await client.query(sql);
            console.log(`Executed ${file}`);
        }

        await client.query("COMMIT");
        console.log("Database initialization success!");
        process.exit(0);
    } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        console.error("Database initialization failed: ", error);
        process.exit(1);
    } finally {
        client.release();
    }
};

initDb();