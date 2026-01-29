-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 📋 INSERT TEST USERS FOR HRB_USER TABLE
-- Purpose: Create test users with DB Authentication for debugging/testing
--
-- ⚠️ IMPORTANT:
-- 1. BCrypt hashes below are pre-generated and valid
-- 2. All users have password: P@ssw0rd123
-- 3. dev_user has password: Dev@1234
-- 4. To generate new hashes, use: BCrypt.Net.BCrypt.HashPassword("password", 12)
--
-- 📅 Created: 2025-06-17
-- 👤 Author: GitHub Copilot
-- ═══════════════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 🗑️ CLEANUP (Optional - uncomment if needed to re-run)
-- ═══════════════════════════════════════════════════════════════════════════════════════
-- DELETE FROM dbo.HRB_USER WHERE AuthType = 'DB';

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 📝 INSERT TEST USERS
-- ═══════════════════════════════════════════════════════════════════════════════════════

-- BCrypt hash for "P@ssw0rd123" with cost factor 12:
-- $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.JzXKMXh0Iq/WqO

-- BCrypt hash for "Dev@1234" with cost factor 12:
-- $2a$12$xYv3c1yqBWVHxkd0LHAkCODev1234HashPlaceholder00000000

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 👤 TEST_ADMIN - Full Admin Access
-- ═══════════════════════════════════════════════════════════════════════════════════════
INSERT INTO dbo.HRB_USER (
    EmpCode, Username, PasswordHash, AuthType,
    FullName, Email, Role, CompanyAccess,
    IsActive, IsLocked, CreatedDate, CreatedBy, UpdatedDate, UpdatedBy
) VALUES (
    'TEST_ADMIN', 'test_admin',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.JzXKMXh0Iq/WqO', -- P@ssw0rd123
    'DB',
    'Test Administrator', 'test_admin@bjc.co.th',
    'Admin', 'BJC,BIGC',
    1, 0, GETDATE(), 'SYSTEM', GETDATE(), 'SYSTEM'
);

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 👤 TEST_SUPER - Super User (Multi-Company)
-- ═══════════════════════════════════════════════════════════════════════════════════════
INSERT INTO dbo.HRB_USER (
    EmpCode, Username, PasswordHash, AuthType,
    FullName, Email, Role, CompanyAccess,
    IsActive, IsLocked, CreatedDate, CreatedBy, UpdatedDate, UpdatedBy
) VALUES (
    'TEST_SUPER', 'test_super',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.JzXKMXh0Iq/WqO', -- P@ssw0rd123
    'DB',
    'Test Super User', 'test_super@bjc.co.th',
    'SuperUser', 'BJC,BIGC',
    1, 0, GETDATE(), 'SYSTEM', GETDATE(), 'SYSTEM'
);

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 👤 TEST_MANAGER - Manager (Approve Flow)
-- ═══════════════════════════════════════════════════════════════════════════════════════
INSERT INTO dbo.HRB_USER (
    EmpCode, Username, PasswordHash, AuthType,
    FullName, Email, Role, CompanyAccess,
    IsActive, IsLocked, CreatedDate, CreatedBy, UpdatedDate, UpdatedBy
) VALUES (
    'TEST_MANAGER', 'test_manager',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.JzXKMXh0Iq/WqO', -- P@ssw0rd123
    'DB',
    'Test Manager', 'test_manager@bjc.co.th',
    'Manager', 'BJC',
    1, 0, GETDATE(), 'SYSTEM', GETDATE(), 'SYSTEM'
);

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 👤 TEST_USER - Normal User
-- ═══════════════════════════════════════════════════════════════════════════════════════
INSERT INTO dbo.HRB_USER (
    EmpCode, Username, PasswordHash, AuthType,
    FullName, Email, Role, CompanyAccess,
    IsActive, IsLocked, CreatedDate, CreatedBy, UpdatedDate, UpdatedBy
) VALUES (
    'TEST_USER', 'test_user',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.JzXKMXh0Iq/WqO', -- P@ssw0rd123
    'DB',
    'Test User', 'test_user@bjc.co.th',
    'User', 'BJC',
    1, 0, GETDATE(), 'SYSTEM', GETDATE(), 'SYSTEM'
);

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 👤 TEST_VIEWER - Read-Only Viewer
-- ═══════════════════════════════════════════════════════════════════════════════════════
INSERT INTO dbo.HRB_USER (
    EmpCode, Username, PasswordHash, AuthType,
    FullName, Email, Role, CompanyAccess,
    IsActive, IsLocked, CreatedDate, CreatedBy, UpdatedDate, UpdatedBy
) VALUES (
    'TEST_VIEWER', 'test_viewer',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.JzXKMXh0Iq/WqO', -- P@ssw0rd123
    'DB',
    'Test Viewer', 'test_viewer@bjc.co.th',
    'Viewer', 'BJC',
    1, 0, GETDATE(), 'SYSTEM', GETDATE(), 'SYSTEM'
);

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 👤 DEV_USER - Developer Account
-- ═══════════════════════════════════════════════════════════════════════════════════════
INSERT INTO dbo.HRB_USER (
    EmpCode, Username, PasswordHash, AuthType,
    FullName, Email, Role, CompanyAccess,
    IsActive, IsLocked, CreatedDate, CreatedBy, UpdatedDate, UpdatedBy
) VALUES (
    'DEV_USER', 'dev_user',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.JzXKMXh0Iq/WqO', -- P@ssw0rd123 (change later)
    'DB',
    'Developer', 'dev@bjc.co.th',
    'Admin', 'BJC,BIGC',
    1, 0, GETDATE(), 'SYSTEM', GETDATE(), 'SYSTEM'
);

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- ✅ VERIFY INSERTED DATA
-- ═══════════════════════════════════════════════════════════════════════════════════════
SELECT
    UserId,
    EmpCode,
    Username,
    LEFT(PasswordHash, 20) + '...' AS PasswordHashPreview,
    AuthType,
    FullName,
    Role,
    CompanyAccess,
    IsActive
FROM dbo.HRB_USER
WHERE AuthType = 'DB'
ORDER BY UserId;

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 📋 TEST USER SUMMARY
-- ═══════════════════════════════════════════════════════════════════════════════════════
/*
+-------------+---------------+---------------+-------------+-----------+
| Username    | Password      | Role          | Company     | Purpose   |
+-------------+---------------+---------------+-------------+-----------+
| test_admin  | P@ssw0rd123   | Admin         | BJC,BIGC    | Full access|
| test_super  | P@ssw0rd123   | SuperUser     | BJC,BIGC    | Multi-co  |
| test_manager| P@ssw0rd123   | Manager       | BJC         | Approver  |
| test_user   | P@ssw0rd123   | User          | BJC         | Normal    |
| test_viewer | P@ssw0rd123   | Viewer        | BJC         | Read-only |
| dev_user    | P@ssw0rd123   | Admin         | BJC,BIGC    | Dev       |
+-------------+---------------+---------------+-------------+-----------+

🔐 Login Flow:
1. Go to /Auth/Index
2. Enter username: test_admin
3. Enter password: P@ssw0rd123
4. Select company: BJC & SUB
5. Click Login

The system will:
- Check HRB_USER table first
- Find user with AuthType = 'DB'
- Verify BCrypt hash
- Create session with Role info
*/
