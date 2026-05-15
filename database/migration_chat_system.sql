-- Migration: add system-message flag to chat_message
-- Run once via phpMyAdmin or:  mysql -u root -p nextbid < database/migration_chat_system.sql

ALTER TABLE chat_message
    ADD COLUMN cht_is_system TINYINT(1) NOT NULL DEFAULT 0 AFTER cht_content;
