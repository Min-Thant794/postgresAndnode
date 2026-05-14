import pool from "../../db/pool";
import { LoginUserInput, PublicUser, UserWithPassword } from "../../types/user.types";
import { AppError } from "../../types/errors";
import { isValidUUID } from "../../utils/normalize";
import { hashPassword, needsRehash, verifyPassword } from "../../utils/password";

export const loginUserService = async (input: LoginUserInput): Promise<PublicUser> => {
    const result = await pool.query(
        `SELECT id, name, email, hashed_password, created_at, updated_at FROM users WHERE email = $1`,
        [input.email]
    );

    if (result.rows.length === 0) {
        throw new AppError(401, "Invalid email or password");
    }

    const user = result.rows[0] as UserWithPassword;

    const isPasswordValid = await verifyPassword(input.password, user.hashed_password);

    if (!isPasswordValid) {
        throw new AppError(401, "Invalid email or password");
    }

    if (needsRehash(user.hashed_password)) {
        const newHash = await hashPassword(input.password);
        await pool.query(
            `UPDATE users SET hashed_password = $1 WHERE id = $2`,
            [newHash, user.id]
        );
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at,
    };
};

export const getCurrentUserService = async (userId: string): Promise<PublicUser> => {
    if (!isValidUUID(userId)) {
        throw new AppError(401, "Invalid session");
    }

    const result = await pool.query(
        `SELECT id, name, email, created_at, updated_at FROM users WHERE id = $1`,
        [userId]
    );

    if (result.rows.length === 0) {
        throw new AppError(401, "Session user not found");
    }

    return result.rows[0];
};
