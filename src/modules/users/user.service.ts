import pool from "../../db/pool";
import { CreateUserInput, PublicUser } from "../../types/user.types";
import { AppError } from "../../types/errors";
import { hashPassword, verifyPassword } from "../../utils/password";

export const getUsersService = async (): Promise<PublicUser[]> => {
    const query = `
        SELECT id, name, email, created_at, updated_at
        FROM users
        ORDER BY created_at DESC
    `;

    const result = await pool.query(query);

    if (result.rows.length === 0) {
        throw new AppError(404, "No user available");
    }

    return result.rows;
};

export const getUserByIdService = async (id: string): Promise<PublicUser> => {
    const result = await pool.query(
        `SELECT id, name, email, created_at, updated_at FROM users WHERE id = $1`,
        [id]
    );

    if (result.rows.length === 0) {
        throw new AppError(404, "User not found");
    }

    return result.rows[0];
};

export const createUserService = async (input: CreateUserInput): Promise<PublicUser> => {
    const hashedPassword = await hashPassword(input.hashed_password);

    const query = `
        INSERT INTO users (name, email, hashed_password)
        VALUES ($1, $2, $3)
        RETURNING id, name, email, created_at, updated_at
    `;

    try {
        const result = await pool.query(query, [input.name, input.email, hashedPassword]);
        return result.rows[0];
    } catch (error: any) {
        if (error.code === "23505") {
            throw new AppError(409, "email already exists");
        }
        throw error;
    }
};

export const updateProfileService = async (id: string, sanitizedUpdates: Record<string, string>): Promise<PublicUser> => {
    const keys = Object.keys(sanitizedUpdates);
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
    const values = [...keys.map((key) => sanitizedUpdates[key]), id];

    const query = `
        UPDATE users
        SET ${setClause}
        WHERE id = $${values.length}
        RETURNING id, name, email, created_at, updated_at
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
        throw new AppError(404, "User not found");
    }

    return result.rows[0];
};

export const updateEmailService = async (id: string, currentPassword: string, newEmail: string): Promise<PublicUser> => {
    const userResult = await pool.query(`
            SELECT id, email, hashed_password
            FROM users
            WHERE id = $1
        `, [id]);

        if (userResult.rows.length === 0) {
            throw new AppError(401, "User not found");
        }

        const user = userResult.rows[0];

        const isValid = await verifyPassword(currentPassword, user.hashed_password);
        if (!isValid) {
            throw new AppError(401, "current password is incorrect");
        }

        if (user.email === newEmail) {
            throw new AppError(400, "new email must differ from current email");
        }

        try {
            const result = await pool.query(`
                UPDATE users
                SET email = $1
                WHERE id = $2
                RETURNING id, name, email, created_at, updated_at
                `,
                [newEmail, id]
            );

            return result.rows[0];
        } catch (error: any) {
            if (error.code === "23505") {
                throw new AppError(409, "email already exists");
            }
            throw error;
        }
};

export const updatePasswordService = async (id: string, currentPassword: string, newPassword: string): Promise<void> => {
    const query = `
        SELECT id, hashed_password 
        FROM users 
        WHERE id = $1
        `

    const VALUE: string[] = [id];
    const result = await pool.query(query, VALUE);

    if (result.rows.length === 0) {
        throw new AppError(404, "User not found");
    }

    const user = result.rows[0];

    const isValid = await verifyPassword(currentPassword, user.hashed_password);
    if (!isValid) {
        throw new AppError(400, "current password is incorrect");
    }

    const sameAsOld = await verifyPassword(newPassword, user.hashed_password);
    if (sameAsOld) {
        throw new AppError(400, "New password must differ from current password");
    }

    const newHash = await hashPassword(newPassword);

    const VALUES: string[] = [newHash, id];
    const updateQuery = `
        UPDATE users
        SET hashed_password = $1, updated_at = NOW(), password_changed_at = NOW()
        WHERE id = $2
    `
    await pool.query(
        updateQuery, VALUES
    )
};

export const deleteUserService = async (id: string): Promise<{ id: string; name: string; email: string }> => {
    const result = await pool.query(
        `DELETE FROM users WHERE id = $1 RETURNING id, name, email`,
        [id]
    );

    if (result.rows.length === 0) {
        throw new AppError(404, "User not found");
    }

    return result.rows[0];
};
