-- Webinar Bridge Database Schema (PostgreSQL)
-- To create the database (run as postgres):
--   CREATE DATABASE webinar_bridge;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create forms table
CREATE TABLE IF NOT EXISTS forms (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    infusionsoft_app VARCHAR(255) NOT NULL,
    infusionsoft_form_id VARCHAR(255) NOT NULL,
    webinarfuel_webinar_id VARCHAR(255) NOT NULL,
    webinarfuel_api_key VARCHAR(255) NOT NULL,
    custom_fields JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Default admin user will be created by the create-admin.js script
-- Email: ryan@thecashflowacademy.com
-- Password: CiR43Tx2-

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_forms_user_id ON forms(user_id);
CREATE INDEX IF NOT EXISTS idx_forms_created_at ON forms(created_at);
-- No default data inserted here to keep environments clean.