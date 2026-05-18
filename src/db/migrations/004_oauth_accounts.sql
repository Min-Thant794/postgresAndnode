ALTER TABLE users
ALTER COLUMN hashed_password DROP NOT NULL;

ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_password_min_length;

ALTER TABLE users
ADD CONSTRAINT users_password_min_length
CHECK (hashed_password IS NULL OR char_length(hashed_password) >= 60);

CREATE TABLE IF NOT EXISTS oauth_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT oauth_accounts_provider_user_id_not_empty
    CHECK (provider, provider_user_id)
);

CREATE INDEX IF NOT EXISTS idx_oauth_accounts_user_id
ON oauth_accounts (user_id);

CREATE INDEX IF NOT EXISTS idx_oauth_accounts_provider_user_id
ON oauth_accounts (provider, provider_user_id);