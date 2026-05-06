-- Auth.js required tables for NeonAdapter

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS auth_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text,
  email text UNIQUE,
  "emailVerified" timestamp,
  image text
);

CREATE TABLE IF NOT EXISTS auth_accounts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" uuid REFERENCES auth_users(id) ON DELETE CASCADE,
  provider text,
  type text,
  "providerAccountId" text,
  access_token text,
  expires_at integer,
  refresh_token text,
  id_token text,
  scope text,
  session_state text,
  token_type text,
  password text
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" uuid REFERENCES auth_users(id) ON DELETE CASCADE,
  "sessionToken" text UNIQUE,
  expires timestamp
);

CREATE TABLE IF NOT EXISTS auth_verification_token (
  identifier text,
  token text,
  expires timestamp,
  PRIMARY KEY (identifier, token)
);
