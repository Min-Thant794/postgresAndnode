import { z } from "zod";
import { LoginUserInput } from "../../types/user.types";
import { AppError } from "../../types/errors";
import { normalizeEmail, normalizePassword } from "../../utils/normalize";

const loginSchema = z.object({
    email: z.string({ error: "email is required" }).min(1, "email is required").transform(normalizeEmail),
    password: z.string({ error: "password is required" }).min(1, "password is required").transform(normalizePassword),
});

export function validateLogin(body: unknown): LoginUserInput {
    const result = loginSchema.safeParse(body);
    if (!result.success) {
        const message = result.error.issues[0].message;
        throw new AppError(400, message);
    }
    return result.data;
}
