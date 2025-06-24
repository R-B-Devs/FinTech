-- ABSA Financial Assistant Database Setup
-- This script creates the main database and user

-- Create database
CREATE DATABASE fintech_db
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Create application user
CREATE USER fintech WITH 
    PASSWORD 'rnbdev15'
    CREATEDB
    NOCREATEROLE
    NOINHERIT
    LOGIN
    NOREPLICATION
    NOBYPASSRLS
    CONNECTION LIMIT -1;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE fintech_db TO fintech;
GRANT USAGE ON SCHEMA public TO fintech;
GRANT CREATE ON SCHEMA public TO fintech;

-- Add comments
COMMENT ON DATABASE absa_financial_db IS 'ABSA Financial Assistant Application Database';
COMMENT ON ROLE fintech IS 'Application user for ABSA Financial Assistant';