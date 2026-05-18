import { env } from "./env";

export const googleOAuthConfig = {
    clientId: env.googleClientId,
    clientSecret: env.googleClientSecret,
    callbackUrl: env.googleCallbackUrl,
    scopes: ["openid", "profile", "email"],
};