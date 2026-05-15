export type UserRole = "user" | "admin";

export type UserParams = {
    id: string;
};

export type PublicUser = {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    is_active: boolean;
    profile_url: string | null;
    birthday: string | null;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
};

export type UserWithPassword = PublicUser & {
    hashed_password: string;
};

export type CreateUserInput = {
    name: string;
    email: string;
    password: string;
    profile_url?: string;
    birthday?: string;
};

export type UpdateUserInput = {
    name?: string;
    profile_url?: string | null;
    birthday?: string | null;
};

export type LoginUserInput = {
    email: string;
    password: string;
}