import { LoginUserInput } from "../../types/user.types";
import { AppError } from "../../types/errors";
import { normalizeEmail, normalizePassword } from "../../utils/normalize";

export function validateLogin(body: unknown): LoginUserInput {
    const { email, password } = body as Record<string, unknown>;

    if (!email || typeof email !== "string") {
        throw new AppError(400, "email is required");
    }

    if (!password || typeof password !== "string") {
        throw new AppError(400, "password is required");
    }

    return {
        email: normalizeEmail(email),
        password: normalizePassword(password),
    };
}
