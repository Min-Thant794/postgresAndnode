export type UserParams = {
    id: string;
};

export type PublicUser = {
    id: string;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
};

export type UserWithPassword = PublicUser & {
    hashed_password: string;
}

export type CreateUserInput = {
    name: string;
    email: string;
    hashed_password: string;
};

export type UpdateUserInput = {
    name?: string;
    email?: string;
}

export type LoginUserInput = {
    email: string;
    hashed_password: string;
};