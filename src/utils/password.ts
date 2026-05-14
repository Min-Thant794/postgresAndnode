import * as argon2 from "argon2";
import { createHmac } from "node:crypto";
import { env } from "../config/env";

type PepperVersion = "v1" | "v2";

const CURRENT_PEPPER_VERSION: PepperVersion = "v1";

const PEPPERS: Record<PepperVersion, string | undefined> = {
    v1: env.pepperV1,
    v2: env.pepperV2,
};

function getPepper(version: PepperVersion): string {
    const pepper = PEPPERS[version];

    if (!pepper || Buffer.byteLength(pepper, "utf8") < 32) {
        throw new Error(`Pepper ${version} missing or too short (need >= 32 bytes)`);
    }

    return pepper;
}

getPepper(CURRENT_PEPPER_VERSION);

const PASSWORD_HASH_OPTIONS = {
    type: argon2.argon2id,
    memoryCost: 46080,
    timeCost: 2,
    parallelism: 1,
    hashLength: 32,
} satisfies argon2.Options & { raw?: false };

function prehash(password: string, version: PepperVersion): Buffer {
    return createHmac("sha256", getPepper(version))
        .update(password, "utf8")
        .digest();
}

function encode(version: PepperVersion, argonHash: string): string {
    return `${version}:${argonHash}`;
}

function decode(stored: string): { version: PepperVersion; argonHash: string } {
    const index = stored.indexOf(":");

    if (index === -1) {
        throw new Error("Malformed password hash");
    }

    const version = stored.slice(0, index) as PepperVersion;

    if (!(version in PEPPERS)) {
        throw new Error(`Unknown pepper version: ${version}`);
    }

    return {
        version,
        argonHash: stored.slice(index + 1),
    };
}

function isPasswordLengthValid(password: string): boolean {
    return password.length >= 8 && password.length <= 1024;
}

export async function hashPassword(password: string): Promise<string> {
    if (!isPasswordLengthValid(password)) {
        throw new Error("Password length out of allowed range");
    }

    const digest = prehash(password, CURRENT_PEPPER_VERSION);
    const argonHash = await argon2.hash(digest, PASSWORD_HASH_OPTIONS);

    return encode(CURRENT_PEPPER_VERSION, argonHash);
}

export async function verifyPassword(plainPassword: string, storedHash: string): Promise<boolean> {
    try {
        if (!isPasswordLengthValid(plainPassword)) {
            return false;
        }

        const { version, argonHash } = decode(storedHash);
        const digest = prehash(plainPassword, version);

        return await argon2.verify(argonHash, digest);
    } catch {
        return false;
    }
}

export function needsRehash(storedHash: string): boolean {
    try {
        const { version, argonHash } = decode(storedHash);

        if (version !== CURRENT_PEPPER_VERSION) {
            return true;
        }

        return argon2.needsRehash(argonHash, PASSWORD_HASH_OPTIONS);
    } catch {
        return true;
    }
}