-- CAML LMS Database Reset Script
-- This script clears all data from tables while preserving the schema
-- Run this before doing a fresh demo

-- WARNING: This will DELETE ALL DATA!
-- Make sure you have backups if needed

-- Disable foreign key checks temporarily (PostgreSQL)
SET session_replication_role = 'replica';

-- Clear all tables in reverse dependency order
TRUNCATE TABLE quiz_attempts CASCADE;
TRUNCATE TABLE quiz_questions CASCADE;
TRUNCATE TABLE quizzes CASCADE;
TRUNCATE TABLE calendar_events CASCADE;
TRUNCATE TABLE attendance CASCADE;
TRUNCATE TABLE sessions CASCADE;
TRUNCATE TABLE private_messages CASCADE;
TRUNCATE TABLE bookmarks CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE discussion_replies CASCADE;
TRUNCATE TABLE discussion_posts CASCADE;
TRUNCATE TABLE announcements CASCADE;
TRUNCATE TABLE submissions CASCADE;
TRUNCATE TABLE assignments CASCADE;
TRUNCATE TABLE enrollments CASCADE;
TRUNCATE TABLE materials CASCADE;
TRUNCATE TABLE course_weeks CASCADE;
TRUNCATE TABLE courses CASCADE;
TRUNCATE TABLE users CASCADE;

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

-- Reset sequences (for auto-increment IDs if any)
-- Note: UUID doesn't need sequence reset

-- Verify all tables are empty
SELECT 'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'courses', COUNT(*) FROM courses
UNION ALL
SELECT 'enrollments', COUNT(*) FROM enrollments
UNION ALL
SELECT 'materials', COUNT(*) FROM materials
UNION ALL
SELECT 'assignments', COUNT(*) FROM assignments
UNION ALL
SELECT 'submissions', COUNT(*) FROM submissions
UNION ALL
SELECT 'discussion_posts', COUNT(*) FROM discussion_posts
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications;

-- Success message
SELECT 'Database reset complete! All tables are now empty.' as status;
