import pool from "../../db/pool";
import { CreateUserInput, PublicUser } from "../../types/user.types";
import { AppError } from "../../types/errors";
import { hashPassword, verifyPassword } from "../../utils/password";
import { normalizeName, normalizeEmail, normalizePassword, isValidUUID } from "../../utils/normalize";

export const PUBLIC_COLUMNS = `
    id, name, email, role, is_active, 
    profile_url, birthday, email_verified_at, 
    created_at, updated_at
`;

export const getUsersService = async (): Promise<PublicUser[]> => {
    const query = `
        SELECT ${PUBLIC_COLUMNS}
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
    if (!isValidUUID) {
        throw new AppError(400, "Invalid user id");
    }

    const query = `
        SELECT ${PUBLIC_COLUMNS}
        FROM users
        WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
        throw new AppError(404, "User not found");
    }

    return result.rows[0];
};

export const createUserService = async (input: CreateUserInput): Promise<PublicUser> => {
    const name = normalizeName(input.name);
    const email = normalizeEmail(input.email);
    const password = normalizePassword(input.password);
    
    if (!name || !email || !password) {
        throw new AppError(400, "name, email, and password are required");
    }

    if (password.length < 8) {
        throw new AppError(400, "password must be at least 8 characters");
    }

    const hashedPassword = await hashPassword(password);

    const query = `
        INSERT INTO users (name, email, hashed_password, profile_url, birthday)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING ${PUBLIC_COLUMNS}
    `;

    const values = [
        name, email, hashedPassword, input.profile_url ?? null, input.birthday ?? null,
    ];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error: any) {
        if (error.code === "23505") {
            throw new AppError(409, "email already exists");
        }
        throw error;
    }
};

export const updateProfileService = async (id: string, sanitizedUpdates: Record<string, string | null>): Promise<PublicUser> => {
    if (!isValidUUID(id)) {
        throw new AppError(400, "Invalid user id");
    }

    const keys = Object.keys(sanitizedUpdates);
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
    const values: (string | null)[] = [...keys.map((key) => sanitizedUpdates[key]), id];

    const query = `
        UPDATE users
        SET ${setClause}
        WHERE id = $${values.length}
        RETURNING ${PUBLIC_COLUMNS}
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
        throw new AppError(404, "User not found");
    }

    return result.rows[0];
};

export const updateEmailService = async (id: string, currentPassword: string, newEmail: string): Promise<PublicUser> => {
    if (!isValidUUID(id)) {
        throw new AppError(400, "Invalid user id");
    }
    
    const userResult = await pool.query(`
        SELECT id, email, hashed_password, is_active
        FROM users
        WHERE id = $1
    `, [id]);

    if (userResult.rows.length === 0) {
        throw new AppError(401, "User not found");
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
        throw new AppError(403, "Account is disabled");
    }

    const isValid = await verifyPassword(currentPassword, user.hashed_password);
    if (!isValid) {
        throw new AppError(401, "current password is incorrect");
    }

    if (user.email === newEmail) {
        throw new AppError(400, "new email must differ from current email");
    }

    const vaules: string[] = [newEmail, id];

    try {
        const result = await pool.query(`
            UPDATE users
            SET email = $1
            WHERE id = $2
            RETURNING ${PUBLIC_COLUMNS}
            `,
            vaules
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
    if (!isValidUUID(id)) {
        throw new AppError(400, "Invalid user id");
    }

    const VALUE: string[] = [id];
    
    const query = `
        SELECT id, hashed_password, is_active
        FROM users 
        WHERE id = $1
        `;

    const result = await pool.query(query, VALUE);

    if (result.rows.length === 0) {
        throw new AppError(404, "User not found");
    }

    const user = result.rows[0];

    if (!user.is_active) {
        throw new AppError(403, "Account is disabled");
    }

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
    `;

    await pool.query(
        updateQuery, VALUES
    )
};

export const deleteUserService = async (id: string): Promise<{ id: string; name: string; email: string }> => {
    if (!isValidUUID(id)) {
        throw new AppError(400, "Invalid user id");
    }

    const value: string[] = [id];
    
    const result = await pool.query(
        `DELETE FROM users WHERE id = $1 
        RETURNING id, name, email`,
        value
    );

    if (result.rows.length === 0) {
        throw new AppError(404, "User not found");
    }

    return result.rows[0];
};
