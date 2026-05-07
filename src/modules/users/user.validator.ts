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

export function validateUpdateProfile(body: unknown): Record<string, string> {
    const { name, email, hashed_password, password, currentPassword } = body as Record<string, unknown>;
    const updates: Record<string, string> = {};

    if (email !== undefined) {
        throw new AppError(400, "email cannot be updated through this endpoint");
    }

    if (hashed_password !== undefined || password !== undefined || currentPassword !== undefined) {
        throw new AppError(400, "password cannot be updated through this endpoint");
    }

    if (name !== undefined) {
        const normalized = normalizeName(name);
        if (!normalized) {
            throw new AppError(400, "name cannot be empty");
        }
        updates.name = normalized;
    }

    //future profile fields
    //if(address !== undefined) {...}

    if (Object.keys(updates).length === 0) {
        throw new AppError(400, "No valid fields provided for update");
    }

    return updates;
}

export function validateUpdateEmail(body: unknown): { email: string, currentPassword: string } {
    const { email, currentPassword } = body as Record<string, unknown>;

    if (!email || typeof email !== "string" || !email.includes("@")) {
        throw new AppError(400, "valid email is required");
    }

    if (!currentPassword || typeof currentPassword !== "string") {
        throw new AppError(400, "current password is required");
    }

    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
        throw new AppError(400, "email cannot be empty");
    }

    return {
        email: normalizedEmail,
        currentPassword: normalizePassword(currentPassword)
    }
}

export function validateUpdatePassword(body: unknown): { currentPassword: string, newPassword: string} {
    const { currentPassword, newPassword } = body as Record<string, unknown>;

    if (!currentPassword || typeof currentPassword !== "string") {
        throw new AppError(400, "current password is required");
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
        throw new AppError(400, "new password must be at least 8 characters");
    }

    if (currentPassword === newPassword) {
        throw new AppError(400, "new password must differ from current password");
    }

    return {
        currentPassword: normalizePassword(currentPassword),
        newPassword: normalizePassword(newPassword)
    };
}