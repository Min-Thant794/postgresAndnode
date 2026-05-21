import { env } from "./config/env";
import pool from "./db/pool";
import app from "./app";

const startServer = async () => {
    try {
        await pool.query("SELECT 1");
        console.log("Database connected successfully!");

        const server = app.listen(env.port, () => {
            console.log(`Server is listening at http://localhost:${env.port}`);
            console.log(`http://localhost:${env.port}/test-connection`);
        });

        const shutdown = (signal: string) => {
            console.log(`${signal} received, shutting down...`);
            server.close(async (error) => {
                if (error) {
                    console.error("Error closing HTTP server: ", error);
                    process.exit(1);
                }
                try {
                    await pool.end();
                    process.exit(0);
                } catch (poolError) {
                    console.error("Error closing DB pool: ", poolError);
                    process.exit(1);
                }
            });

            // Hard cap so we don't hang forever on a misbehaving connection.
            setTimeout(() => {
               console.error("Forced shutdown after 10s");
               process.exit(1); 
            }, 10_000).unref();
        };

        process.on("SIGINT", () => shutdown("SIGINT"));
        process.on("SIGTERM", () => shutdown("SIGTERM"));
    } catch (error) {
        console.log("Database connection failed", error);
        process.exit(1);
    };
};

startServer();
