import dotenv from "dotenv";
dotenv.config();

import express from "express";
import pool from "./config/db";

const app = express();

app.use(express.json());

app.get("/test-connection", async(req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({
            message: "Postgres connection success!",
            time: result.rows[0]
        })
    } catch (error) {
        console.error("Failed to connect");
        res.status(500).json({ error: "DB error", message: "Failed to connect"})
    }
});

const apiPort = Number(process.env.PORT) || 5050;

app.listen(apiPort, () => {
    console.log("Server is running on http://localhost:", apiPort);
})