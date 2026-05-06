import pool from "../config/db";
import { LoginUserInput, PublicUser, UserWithPassword } from "../types/user.types";
import { hashPassword, needsRehash, verifyPassword } from "../utils/password";
import { isValidUUID, normalizeEmail, normalizePassword } from "./user.service";

export class AuthServiceError extends Error {
    statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.name = "AuthServiceError"
    }
}

export const loginUserService = async (input: LoginUserInput): Promise<PublicUser> => {
    const email = normalizeEmail(input.email);
    const password = normalizePassword(input.password);

    if (!email || !password) {
        throw new AuthServiceError(400, "email and password are required");
    }

    const VALUES: string[] = [email];

    const query = `
        SELECT id, name, email, hashed_password, created_at, updated_at
        FROM users
        WHERE email = $1
    `;

    const result = await pool.query(query, VALUES);

    if (result.rows.length === 0) {
        throw new AuthServiceError(401, "Invalid email or password");
    }

    const user = result.rows[0] as UserWithPassword;

    const isPasswordValid = await verifyPassword(password, user.hashed_password);

    if (!isPasswordValid) {
        throw new AuthServiceError(401, "Invalid email or password");
    }

    if (needsRehash(user.hashed_password)) {
        const newHash = await hashPassword(password);

        await pool.query (
            `
                UPDATE users
                SET hashed_password = $1
                WHERE id = $2
            `,
            [newHash, user.id]
        );
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at
    }
};

export const getCurrentUserService = async (userId: string): Promise<PublicUser> => {
    if (!isValidUUID(userId)) {
        throw new AuthServiceError(401, "Invalid session");
    }

    const VALUES: string[] = [userId];

    const query = `
        SELECT id, name, email, created_at, updated_at
        FROM users
        WHERE id = $1
    `;

    const result = await pool.query(query, VALUES);

    if (result.rows.length === 0) {
        throw new AuthServiceError(401, "Session user not found");
    }

    return result.rows[0];
}