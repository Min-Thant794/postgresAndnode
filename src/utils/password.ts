import * as argon2 from "argon2";
import { env } from "../config/env";

const PEPPER = env.pepper || "";

const HASH_OPTIONS: argon2.Options & { raw?: false } = {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
    hashLength: 32
}

const REHASH_OPTIONS = {
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1
}

function withPepper(password: string): string {
    return password + PEPPER;
}

export async function hashPassword(password: string): Promise<string> {
    return argon2.hash(withPepper(password), HASH_OPTIONS);
}

export async function verifyPassword(
    plainPassword: string,
    hashedPassword: string
): Promise<boolean> {
    return argon2.verify(hashedPassword, withPepper(plainPassword));
}

export function needsRehash(hashedPassword: string): boolean {
  return argon2.needsRehash(hashedPassword, REHASH_OPTIONS);
}