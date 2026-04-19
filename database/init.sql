-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS pharmalink;

-- Create user if it doesn't exist
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'pharmalink_user') THEN

      CREATE ROLE pharmalink_user LOGIN PASSWORD 'pharmalink_password';
   END IF;
END
$do$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE pharmalink TO pharmalink_user;

-- Connect to the database
\c pharmalink;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';
