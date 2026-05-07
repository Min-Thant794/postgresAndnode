import fs from "fs";
import path from "path";
import pool from "../db/pool";

const initDb = async() => {
    try {
        const migrationDir = path.join(__dirname, "migrations");
        const files = fs.readdirSync(migrationDir).sort();

        for (const file of files) {
            const filePath = path.join(migrationDir, file);
            const sql = fs.readFileSync(filePath, "utf-8");

            await pool.query(sql);
            console.log(`Executed ${file}`);
        }

        console.log("Database initialization success!");
        process.exit(0);
    } catch (error) {
        console.error("Database initialization failed: ", error);
        process.exit(1);
    }
}

initDb();