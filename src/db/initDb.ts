import fs from "fs";
import path from "path";
import pool from "../config/db";

const initDb = async () => {
    try {
        const schemaDir = path.join(__dirname, "schema");
        const files = fs.readdirSync(schemaDir).sort();

        for (const file of files) {
            const filePath = path.join(schemaDir, file);
            const sql = fs.readFileSync(filePath, "utf-8");

            await pool.query(sql);
            console.log(`Executed: ${file}`);
        }

        console.log("Database initialized successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Database initialization failed: ", error);
        process.exit(1);
    }
};

initDb();