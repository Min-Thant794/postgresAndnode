export const isValidUUID = (value: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
};

export const normalizeName = (name: unknown): string =>
    String(name ?? "").trim();

export const normalizeEmail = (email: unknown): string =>
    String(email ?? "").trim().toLowerCase();

export const normalizePassword = (password: unknown): string =>
    typeof password === "string" ? password: "";