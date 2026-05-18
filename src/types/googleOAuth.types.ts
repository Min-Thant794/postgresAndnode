export type GoogleProfileInput = {
    providerUserId: string;
    email: string;
    emailVerified: boolean;
    name: string;
    profileImageUrl?: string | null;
};