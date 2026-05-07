import { LoginUserInput } from "../../types/user.types";
import { AppError } from "../../types/errors";
import { normalizeEmail, normalizePassword } from "../../utils/normalize";

export function validateLogin(body: unknown): LoginUserInput {
    const { email, hashed_password } = body as Record<string, unknown>;

    if (!email || typeof email !== "string") {
        throw new AppError(400, "email is required");
    }

    if (!hashed_password || typeof hashed_password !== "string") {
        throw new AppError(400, "password is required");
    }

    return {
        email: normalizeEmail(email),
        hashed_password: normalizePassword(hashed_password),
    };
}
