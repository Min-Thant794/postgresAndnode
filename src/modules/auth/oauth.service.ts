import pool from "../../db/pool";
import { PublicUser } from "../../types/user.types";
import { AppError } from "../../types/errors";
import { GoogleProfileInput } from "../../types/googleOAuth.types";

export const findOrCreateGoogleUserService = async (input: GoogleProfileInput): Promise<PublicUser> => {
    if (!input.emailVerified) {
        throw new AppError(403, "Google email is not verified");
    }

    const VALUES: string[] = ["google", input.providerUserId];
    const query = `
        SELECT u.id, u.name, u.profile_image_url, u.birthday, u.email_verified_at, u.created_at, u.updated_at
        FROM oauth_accounts oa
        JOIN users u ON u.id = oa.user_id
        WHERE oa.provider = $1
        AND oa.provider_user_id = $2
    `;

    const existingOAuthResult = await pool.query(query, VALUES);

    if (existingOAuthResult.rows.length > 0) {
        return existingOAuthResult.rows[0];
    }

    const existingUserResult = await pool.query(
        `
        SELECT id, name, email
        FROM users
        WHERE email = $1
        `,
        [input.email]
    );

    if (existingUserResult.rows.length > 0) {
        throw new AppError(409, "An account with this email already exists. Please login with password first, then connect Google.");
    };

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const createdUserResult = await client.query(
            `
            INSERT INTO users (
                name, email, hashed_password, profile_image_url, email_verified_at, is_active
            )
            VALUES ($1, $2, $3, NOW(), TRUE)
            RETURNING id, name, email, profile_image_url, birthday, email_verified_at, created_at, updated_at
            `,
            [input.name, input.email, input.profileImageUrl ?? null]
        );

        const createdUser = createdUserResult.rows[0];

        await client.query(
            `
            INSERT INTO oauth_accounts (
                user_id, provider, provider_user_id
            )
            VALUES ($1, $2, $3)
            `,
            [createdUser.id, "google", input.providerUserId]
        );

        await client.query("COMMIT");

        return createdUser;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};