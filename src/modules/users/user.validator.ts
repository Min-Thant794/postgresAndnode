import { CreateUserInput } from "../../types/user.types";
import { AppError } from "../../types/errors";
import { isValidUUID, normalizeName, normalizeEmail, normalizePassword } from "../../utils/normalize";

export function validateUserId(id: string): void {
    if (!isValidUUID(id)) {
        throw new AppError(400, "Invalid user id");
    }
}

export function validateCreateUser(body: unknown): CreateUserInput {
    const { name, email, hashed_password } = body as Record<string, unknown>;

    if (!name || typeof name !== "string") {
        throw new AppError(400, "name is required");
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
        throw new AppError(400, "valid email is required");
    }

    if (!hashed_password || typeof hashed_password !== "string" || hashed_password.length < 8) {
        throw new AppError(400, "password must be at least 8 characters");
    }

    return {
        name: normalizeName(name),
        email: normalizeEmail(email),
        hashed_password: normalizePassword(hashed_password),
    };
}

export function validateUpdateUser(body: unknown): Record<string, string> {
    const { name, email } = body as Record<string, unknown>;
    const updates: Record<string, string> = {};

    if (name !== undefined) {
        const normalized = normalizeName(name);
        if (!normalized) throw new AppError(400, "name cannot be empty");
        updates.name = normalized;
    }

    if (email !== undefined) {
        const normalized = normalizeEmail(email);
        if (!normalized) throw new AppError(400, "email cannot be empty");
        updates.email = normalized;
    }

    if (Object.keys(updates).length === 0) {
        throw new AppError(400, "No valid fields provided for update");
    }

    return updates;
}
