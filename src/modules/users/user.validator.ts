import { z } from "zod";
import { CreateUserInput } from "../../types/user.types";
import { AppError } from "../../types/errors";
import { isValidUUID, normalizeName, normalizeEmail, normalizePassword } from "../../utils/normalize";

const createUserSchema = z.object({
    name: z.string({ error: "name is required" }).min(1, "name is required").transform(normalizeName),
    email: z.email("valid email is required").transform(normalizeEmail),
    password: z.string({ error: "password must be at least 8 characters" }).min(8, "password must be at least 8 characters").transform(normalizePassword),
    profile_url: z.url({ error: "profile_url must be a valid URL" }).optional(),
    birthday: z.iso.date({ error: "birthday must use YYYY-MM-DD format" }).optional(),
});

const updateProfileSchema = z.object({
    email: z.undefined({ error: "email cannot be updated through this endpoint" }),
    hashed_password: z.undefined({ error: "password cannot be updated through this endpoint" }),
    password: z.undefined({ error: "password cannot be updated through this endpoint" }),
    currentPassword: z.undefined({ error: "password cannot be updated through this endpoint" }),
    name: z.string().min(1, "name cannot be empty").transform(normalizeName).optional(),
    profile_url: z.url({ error: "profile_url must be a valid URL" }).nullable().optional(),
    birthday: z.iso.date({error: "birthday must use YYYY-MM-DD format"}).nullable().optional(),
}).strip();

const updateEmailSchema = z.object({
    email: z.email("valid email is required").transform(normalizeEmail),
    currentPassword: z.string({ error: "current password is required" }).min(1, "current password is required").transform(normalizePassword),
});

const updatePasswordSchema = z.object({
    currentPassword: z.string({ error: "current password is required" }).min(1, "current password is required"),
    newPassword: z.string({ error: "new password must be at least 8 characters" }).min(8, "new password must be at least 8 characters"),
}).refine((data) => data.currentPassword !== data.newPassword, {
    message: "new password must differ from current password",
    path: ["newPassword"],
}).transform((data) => ({
    currentPassword: normalizePassword(data.currentPassword),
    newPassword: normalizePassword(data.newPassword),
}));

export function validateUserId(id: string): void {
    if (!isValidUUID(id)) {
        throw new AppError(400, "Invalid user id");
    }
}

export function validateCreateUser(body: unknown): CreateUserInput {
    const result = createUserSchema.safeParse(body);
    if (!result.success) {
        const message = result.error.issues[0].message;
        throw new AppError(400, message);
    }
    return result.data;
}

export function validateUpdateProfile(body: unknown): Record<string, string | null> {
    const result = updateProfileSchema.safeParse(body);
    
    if (!result.success) {
        const message = result.error.issues[0].message;
        throw new AppError(400, message);
    }

    const updates: Record<string, string | null> = {};

    if (result.data.name !== undefined) {
        updates.name = result.data.name;
    }

    if (result.data.profile_url !== undefined) {
        updates.profile_url = result.data.profile_url;
    }

    if (result.data.birthday !== undefined) {
        updates.birthday = result.data.birthday;
    }

    if (Object.keys(updates).length === 0) {
        throw new AppError(400, "No valid fields provided for update");
    }

    return updates;
}

export function validateUpdateEmail(body: unknown): { email: string; currentPassword: string } {
    const result = updateEmailSchema.safeParse(body);
    if (!result.success) {
        const message = result.error.issues[0].message;
        throw new AppError(400, message);
    }
    return result.data;
}

export function validateUpdatePassword(body: unknown): { currentPassword: string; newPassword: string } {
    const result = updatePasswordSchema.safeParse(body);
    if (!result.success) {
        const message = result.error.issues[0].message;
        throw new AppError(400, message);
    }
    return result.data;
}
