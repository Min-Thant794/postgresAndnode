import { z, ZodType } from "zod";
import { CreateUserInput } from "../../types/user.types";
import { AppError } from "../../types/errors";
import { isValidUUID, normalizeName, normalizeEmail, normalizePassword } from "../../utils/normalize";

const parseOrThrow = <T>(schema: ZodType<T>, body: unknown): T => {
    const result = schema.safeParse(body);
    if (!result.success) {
        throw new AppError(400, result.error.issues[0].message);
    }
    return result.data;
};

const createUserSchema = z.strictObject({
    name: z.string({ error: "name is required" }).min(1, "name is required").transform(normalizeName),
    email: z.email("valid email is required").transform(normalizeEmail),
    password: z.string({ error: "password must be at least 8 characters" }).min(8, "password must be at least 8 characters").transform(normalizePassword),
    profile_url: z.url({ error: "profile_url must be a valid URL" }).optional(),
    birthday: z.iso.date({ error: "birthday must use YYYY-MM-DD format" }).optional(),
});

const updateProfileSchema = z.strictObject({
    email: z.undefined({ error: "email cannot be updated through this endpoint" }),
    hashed_password: z.undefined({ error: "password cannot be updated through this endpoint" }),
    password: z.undefined({ error: "password cannot be updated through this endpoint" }),
    currentPassword: z.undefined({ error: "password cannot be updated through this endpoint" }),
    name: z.string().min(1, "name cannot be empty").transform(normalizeName).optional(),
    profile_url: z.url({ error: "profile_url must be a valid URL" }).nullable().optional(),
    birthday: z.iso.date({error: "birthday must use YYYY-MM-DD format"}).nullable().optional(),
}).strip();

const updateEmailSchema = z.strictObject({
    email: z.email("valid email is required").transform(normalizeEmail),
    currentPassword: z.string({ error: "current password is required" }).min(1, "current password is required").transform(normalizePassword),
});

const updatePasswordSchema = z.strictObject({
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
    return parseOrThrow(createUserSchema, body);
}

export function validateUpdateProfile(body: unknown): Record<string, string | null> {
    const data = parseOrThrow(updateProfileSchema, body);

    const updates: Record<string, string | null> = {};

    if (data.name !== undefined) {
        updates.name = data.name;
    }

    if (data.profile_url !== undefined) {
        updates.profile_url = data.profile_url;
    }

    if (data.birthday !== undefined) {
        updates.birthday = data.birthday;
    }

    if (Object.keys(updates).length === 0) {
        throw new AppError(400, "No valid fields provided for update");
    }

    return updates;
}

export function validateUpdateEmail(body: unknown): { email: string; currentPassword: string } {
    return parseOrThrow(updateEmailSchema, body);
}

export function validateUpdatePassword(body: unknown): { currentPassword: string; newPassword: string } {
    return parseOrThrow(updatePasswordSchema, body);
}
