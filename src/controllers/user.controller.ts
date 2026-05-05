import { Request, Response } from "express";
import pool from "../config/db";

type UserParams = {
    id: string;
}

const isValidUUID = (value: string): boolean => {
    const uuidRegex = 
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
}

export const getUsers = async (_req: Request, res: Response) => {
    try {
        const query = `
            SELECT id, name, email, created_at, updated_at
            FROM users
            ORDER BY created_at DESC
        `;

        const result = await pool.query(query);

        return res.status(200).json({
            message: "Users fetched success",
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}

export const getUserById = async (req: Request <UserParams>, res: Response) => {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(400).json({
                message: "Invalid user id"
            });
        }

        const query = `
            SELECT id, name, email, created_at, updated_at
            FROM users
            WHERE id = $1
        `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found!"
            })
        };

        return res.status(200).json({
            message: "User fetched success",
            data: result.rows[0]
        })
    } catch (error) {
        console.error("getUserById() error: ",error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

export const createUser = async (req: Request, res: Response) => {
    try {
        const { name, email, hashed_password } = req.body;

        if (!name || !email || !hashed_password) {
            return res.status(400).json({
                message: "name, email, password is required!"
            });
        }

        const trimmedName = String(name).trim();
        const trimmedEmail = String(email).trim().toLowerCase();
        const trimmedHashedPassword = String(hashed_password).trim();

        if (!trimmedName || !trimmedEmail || !trimmedHashedPassword) {
            return res.status(400).json({
                message: "name, email, and password cannot be empty!"
            })
        }

        const VALUES = [trimmedName, trimmedEmail, trimmedHashedPassword];
        const query = `
            INSERT INTO users (name, email, hashed_password)
            VALUES ($1, $2, $3)
            RETURNING id, name, email, hashed_password, created_at, updated_at
        `;

        const result = await pool.query(query, VALUES);

        return res.status(200).json({
            message: "User created success!",
            count: result.rows.length,
            data: result.rows[0]
        });
    } catch (error: any) {
        if (error.code === "23505") {
            return res.status(409).json({
                message: "Email already exists!"
            });
        } else if (error.code === "42601") {
            return res.status(409).json({
                message: "SQL syntax error"
            })
        }

        return res.status(500).json({
            message: "Internal server error"
        })
    }
}

export const updateUser = async (req: Request<UserParams>, res: Response) => {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(400).json({
                message: "Invalid user id",
            });
        }

        const allowedFields = ["name", "email"];
        const updates: Record<string, any> = {};

        for (const field of allowedFields) {
            updates[field] = req.body[field]
        }

        const keys = Object.keys(updates);

        if (keys.length === 0) {
            return res.status(400).json({
                message: "No valid fields are provided for update"
            });
        }

        if (updates.name !== undefined) {
            updates.name = String(updates.name).trim();
            if (!updates.name) {
                return res.status(400).json({
                    message: "name cannot be empty",
                })
            }
        }

        if (updates.email !== undefined) {
            updates.email = String(updates.email).trim().toLocaleLowerCase();
            if (!updates.email) {
                return res.status(400).json({
                    message: "email cannot be empty.",
                })
            }
        }

        const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");

        const values = keys.map((key) => updates[key]);
        values.push(id);

        const query = `
            UPDATE users
            SELECT ${setClause}
            WHERE id = $${values.length}
            RETURNING id, name, email, created_at, updated_at
        `;

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found",
            })
        }

        return res.status(200).json({
            message: "user updated success!",
            data: result.rows[0]
        })
    } catch (error: any) {
        if (error.code === "23505") {
            return res.status(409).json({
                message: "email already exists."
            });
        }

        return res.status(500).json({
            message: "Internal server error!"
        })
    }
}

export const deleteUser = async (req: Request <UserParams>, res: Response) => {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(400).json({
                message: "Invalid user id"
            });
        }

        const query = `
            DELETE FROM users
            WHERE id = $1
        `;

        const result = await pool.query(query, [id]);

        return res.status(200).json({
            message: "user deleted successfully",
            data: result.rows[0]
        });
    } catch (error) {
        console.error("deleteUser() error: ", error);
        res.status(500).json({
            message: "Internal server error"
        })
    }
}