-- Webinar Bridge Database Schema
-- SQLite initialization script

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- PostgreSQL schema for WebinarFuel Bridge
-- Create database if it doesn't exist
-- CREATE DATABASE webinar_bridge;

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_forms_user_id ON forms(user_id);
CREATE INDEX IF NOT EXISTS idx_forms_status ON forms(status);
CREATE INDEX IF NOT EXISTS idx_forms_created_at ON forms(created_at);

-- Insert default admin user (password: admin123)
-- Note: This should be changed immediately after deployment
INSERT OR IGNORE INTO users (id, email, password, name) 
VALUES (
    1, 
    'admin@thecashflowacademy.com', 
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LrTdURdNeypCKXFF.', -- admin123
    'Admin User'
);

-- Sample form for testing (optional)
INSERT OR IGNORE INTO forms (
    id,
    user_id,
    name,
    infusionsoft_html,
    webinar_fuel_url,
    session_id,
    widget_id,
    widget_version,
    status
) VALUES (
    'sample-form-001',
    1,
    'Sample Webinar Registration',
    '<form action="https://example.infusionsoft.com/app/form/process/sample" method="POST"><input name="inf_field_Email" type="email" required /><input name="inf_field_FirstName" type="text" /><input name="inf_field_LastName" type="text" /><input name="inf_field_Phone1" type="tel" /><input type="checkbox" name="inf_option_consent" /><button type="submit">Register</button></form>',
    'https://app.webinarfuel.com/webinars/12345/widgets/67890/10001/elements',
    '12345',
    '67890',
    '10001',
    'draft'
);