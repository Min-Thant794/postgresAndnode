CREATE TYPE user_role AS ENUM ('user', 'admin');

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,

    role user_role NOT NULL DEFAULT 'user',

    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,

    profile_url TEXT,
    birthday DATE,

    password_changed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT users_name_not_empty CHECK (char_length(TRIM(name)) > 0),
    CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT users_email_lowercase CHECK(email = LOWER(email)),
    CONSTRAINT users_password_min_length CHECK (char_length(hashed_password) >= 60),
    CONSTRAINT users_failed_attempts_range CHECK (failed_login_attempts >= 0),
    CONSTRAINT users_profile_url_format CHECK (profile_url IS NULL OR profile_url ~* '^https?://'),
    CONSTRAINT users_birthday_not_future CHECK (birthday IS NULL OR birthday <= CURRENT_DATE),
    CONSTRAINT users_birthday_min_age CHECK (birthday IS NULL OR birthday <= CURRENT_DATE - INTERVAL '13 years')
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users (is_active) WHERE is_active = FALSE;
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at);

DROP TRIGGER IF EXISTS set_updated_at ON users;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
WHEN (OLD.* IS DISTINCT FROM NEW.*)
EXECUTE FUNCTION update_updated_at_column();