import type { ZodType } from "zod";
import { AppError } from "../types/errors";

export const parseOrThrow = <T>(schema: ZodType<T>, body: unknown): T => {
    const result = schema.safeParse(body);
    if (!result.success) {
        throw new AppError(400, result.error.issues[0].message);
    }
    return result.data;
};
