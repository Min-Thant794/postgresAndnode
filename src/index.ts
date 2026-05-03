import dotenv from "dotenv";
dotenv.config();

import express from "express";
import pool from "./config/db";

const app = express();

app.use(express.json());

app.get("/test-connection", async(_req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        console.log("Postgres connection success!");
        res.json({
            message: "Postgres connection success!",
            time: result.rows[0]
        })
    } catch (error) {
        console.error("Failed to connect!", error);
        res.status(500).json({ message: "Failed to connect", error: "DB error"});
    }
});

const apiPort = Number(process.env.PORT) || 5050;

const startServer = async() => {
    try {
        await pool.query("SELECT 1");
        console.log("Database connected successfully!");

        app.listen(apiPort, () => {
            console.log(`Server is listening at http://localhost:${apiPort}/test-connection`);
        })
    } catch (error) {
        console.error("Database connection failed", error);
        process.exit(1);
    }
}

startServer();