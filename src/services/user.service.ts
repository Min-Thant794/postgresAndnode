import pool from "../config/db";
import { CreateUserInput, PublicUser, UpdateUserInput } from "../types/user.types";
import { hashPassword } from "../utils/password";

export class ServiceError extends Error {
    statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.name = "ServiceError";
    }
}

export const isValidUUID = (value: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
};

export const normalizeName = (name: unknown): string => {
    return String(name ?? "").trim();
};

export const normalizeEmail = (email: unknown): string => {
    return String(email ?? "").trim().toLowerCase();
};

export const normalizePassword = (password: unknown): string => {
    return String(password ?? "").trim();
}

export const getUsersService = async (): Promise<PublicUser[]> => {
    const query = `
        SELECT id, name, email, created_at, updated_at
        FROM users
        ORDER BY created_at DESC
    `;

    const result = await pool.query(query);

    if (result.rows.length === 0) {
        throw new ServiceError(404, "No user available");
    }

    return result.rows;
};

export const getUserByIdService = async (id: string): Promise<PublicUser> => {
    if (!isValidUUID(id)) {
        throw new ServiceError(400, "Invalid user id");
    }

    const query = `
        SELECT id, name, email, created_at, updated_at
        FROM users
        WHERE id = $1
    `;

    const VALUES: string[] = [id];

    const result = await pool.query(query, VALUES);

    if (result.rows.length === 0) {
        throw new ServiceError(404, "User not found");
    }

    return result.rows[0];
};

export const createUserService = async (input: CreateUserInput): Promise<PublicUser> => {
    const name = normalizeName(input.name);
    const email = normalizeEmail(input.email);
    const password = normalizePassword(input.password);

    if (!name || !email || !password) {
        throw new ServiceError(400, "name, email, and password are requried");
    }

    if (password.length < 8) {
        throw new ServiceError(400, "password must be at least 8 characters");
    }

    const hashedPassword = await hashPassword(password);

    const VALUES: string[] = [name, email, hashedPassword];

    const query = `
        INSERT INTO users (name, email, hashed_password)
        VALUES ($1, $2, $3)
        RETURNING id, name, email, created_at, updated_at
    `;

    try {
        const result = await pool.query(query, VALUES);
        return result.rows[0];
    } catch (error: any) {
        if (error.code === "23505") {
            throw new ServiceError(409, "email already exists");
        }
        throw error;
    }
};

export const updateUserService = async (id: string, updates: UpdateUserInput): Promise<PublicUser> => {
    if (!isValidUUID(id)) {
        throw new ServiceError(400, "Invalid user id");
    }

    const sanitizedUpdates: Record<string, string> = {};

    if (updates.name !== undefined) {
        const name = normalizeName(updates.name);

        if (!name) {
            throw new ServiceError(400, "name cannot be empty");
        }

        sanitizedUpdates.name = name;
    }

    if (updates.email !== undefined) {
        const email = normalizeEmail(updates.email);

        if (!email) {
            throw new ServiceError(400, "email cannot be empty");
        }

        sanitizedUpdates.email = email;
    }

    const keys = Object.keys(sanitizedUpdates);

    if (keys.length === 0) {
        throw new ServiceError(400, "No valid fields are provided for update");
    }

    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
    const values = keys.map((key) => sanitizedUpdates[key]);
    values.push(id);

    const query = `
        UPDATE users
        SET ${setClause}
        WHERE id = $${values.length}
        RETURNING id, name, email, created_at, updated_at
    `;

    try {
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            throw new ServiceError(404, "User not found");
        }

        return result.rows[0];
    } catch (error: any) {
        if (error.code === "23505") {
            throw new ServiceError(409, "email already exists");
        }

        throw error;
    }
};

export const deleteUserService = async (id: string): Promise<{id: string; name: string; email: string}> => {
    if (!isValidUUID(id)) {
        throw new ServiceError(400, "Invalid user id");
    }

    const query = `
        DELETE FROM users
        WHERE id = $1
        RETURNING id, name, email
    `;

    const VALUES: string[] = [id];

    const result = await pool.query(query, VALUES);

    if (result.rows.length === 0) {
        throw new ServiceError(404, "User not found");
    }

    return result.rows[0];
}