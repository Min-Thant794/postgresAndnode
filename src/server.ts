import dotenv from "dotenv";
dotenv.config();

import pool from "../src/db/pool";
import app from "./app";

const apiPort = Number(process.env.PORT) || 5050;

const startServer = async () => {
    try {
        await pool.query("SELECT 1");
        console.log("Database connected successfully!");

        app.listen(apiPort, () => {
            console.log(`Server is listening at http://localhost:${apiPort}`);
            console.log(`http://localhost:${apiPort}/test-connection`);
        });
    } catch (error) {
        console.error("Database connection failed", error);
        process.exit(1);
    }
};

startServer();
