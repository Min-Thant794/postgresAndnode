import { z } from "zod";
import { LoginUserInput } from "../../types/user.types";
import { normalizeEmail, normalizePassword } from "../../utils/normalize";
import { parseOrThrow } from "../../utils/validation";

const loginSchema = z.object({
    email: z.string({ error: "email is required" }).min(1, "email is required").transform(normalizeEmail),
    password: z.string({ error: "password is required" }).min(1, "password is required").transform(normalizePassword),
});

export function validateLogin(body: unknown): LoginUserInput {
    return parseOrThrow(loginSchema, body);
}
