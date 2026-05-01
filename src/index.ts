import express from "express";
import pool from "./config/db";
import dotenv from 'dotenv';

dotenv.config();

const port = Number(process.env.PORT);

const app = express();
app.use(express.json());

app.get("/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({
            message: "Database connect",
            time: result.rows[0],
        })
    } catch (error) {
        res.status(500).json({ error: "DB error"});
    }
});

app.listen(port, () => {
    console.log("Server is running on", port);
})