-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 📋 INSERT DEFAULT ROLES AND MAP TO TEST USERS
-- Purpose: สร้าง default roles และ map กับ test users ที่มีอยู่
--
-- 📅 Created: 2025-12-17
-- 👤 Author: GitHub Copilot
-- ═══════════════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 🏷️ PART 1: INSERT DEFAULT ROLES
-- ═══════════════════════════════════════════════════════════════════════════════════════

-- Clear existing data (optional - uncomment if needed)
-- DELETE FROM dbo.HRB_USER_ROLE;
-- DELETE FROM dbo.HRB_ROLE;

INSERT INTO dbo.HRB_ROLE (RoleCode, RoleName, RoleNameTh, Description, RoleLevel, IsActive, IsSystem, CreatedBy)
VALUES
    ('ADMIN', 'Administrator', 'ผู้ดูแลระบบ',
     'Full system access - can manage users, roles, settings, and all data',
     1, 1, 1, 'SYSTEM'),

    ('SUPER_USER', 'Super User', 'ผู้ใช้ระดับสูง',
     'Multi-company access - can view/edit data across companies',
     2, 1, 1, 'SYSTEM'),

    ('MANAGER', 'Manager', 'ผู้จัดการ',
     'Department manager - can approve requests and manage team data',
     3, 1, 1, 'SYSTEM'),

    ('USER', 'User', 'ผู้ใช้งาน',
     'Standard user - can view and edit assigned data only',
     4, 1, 1, 'SYSTEM'),

    ('VIEWER', 'Viewer', 'ผู้ดูข้อมูล',
     'Read-only access - can only view data without editing',
     5, 1, 1, 'SYSTEM');

PRINT '✅ Inserted 5 default roles';
GO

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- ✅ VERIFY ROLES
-- ═══════════════════════════════════════════════════════════════════════════════════════

SELECT RoleId, RoleCode, RoleName, RoleNameTh, RoleLevel, IsSystem
FROM dbo.HRB_ROLE
ORDER BY RoleLevel;
GO

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 🔗 PART 2: MAP TEST USERS TO ROLES
-- ═══════════════════════════════════════════════════════════════════════════════════════

-- Get User IDs and Role IDs
DECLARE @AdminRoleId INT = (SELECT RoleId FROM dbo.HRB_ROLE WHERE RoleCode = 'ADMIN');
DECLARE @SuperUserRoleId INT = (SELECT RoleId FROM dbo.HRB_ROLE WHERE RoleCode = 'SUPER_USER');
DECLARE @ManagerRoleId INT = (SELECT RoleId FROM dbo.HRB_ROLE WHERE RoleCode = 'MANAGER');
DECLARE @UserRoleId INT = (SELECT RoleId FROM dbo.HRB_ROLE WHERE RoleCode = 'USER');
DECLARE @ViewerRoleId INT = (SELECT RoleId FROM dbo.HRB_ROLE WHERE RoleCode = 'VIEWER');

-- Map each test user to their corresponding role
INSERT INTO dbo.HRB_USER_ROLE (UserId, RoleId, CompanyId, IsActive, AssignedBy)
SELECT u.UserId, r.RoleId, NULL, 1, 'SYSTEM'
FROM dbo.HRB_USER u
CROSS JOIN dbo.HRB_ROLE r
WHERE
    (u.Username = 'test_admin' AND r.RoleCode = 'ADMIN')
    OR (u.Username = 'test_super' AND r.RoleCode = 'SUPER_USER')
    OR (u.Username = 'test_manager' AND r.RoleCode = 'MANAGER')
    OR (u.Username = 'test_user' AND r.RoleCode = 'USER')
    OR (u.Username = 'test_viewer' AND r.RoleCode = 'VIEWER')
    OR (u.Username = 'dev_user' AND r.RoleCode = 'ADMIN');

PRINT '✅ Mapped test users to roles';
GO

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- ✅ VERIFY USER-ROLE MAPPING
-- ═══════════════════════════════════════════════════════════════════════════════════════

SELECT
    u.Username,
    u.FullName,
    r.RoleCode,
    r.RoleName,
    r.RoleLevel,
    ur.IsActive,
    ur.AssignedDate
FROM dbo.HRB_USER_ROLE ur
INNER JOIN dbo.HRB_USER u ON ur.UserId = u.UserId
INNER JOIN dbo.HRB_ROLE r ON ur.RoleId = r.RoleId
ORDER BY r.RoleLevel, u.Username;

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 📋 EXPECTED RESULT
-- ═══════════════════════════════════════════════════════════════════════════════════════
/*
+-------------+------------------+------------+--------------+-----------+
| Username    | FullName         | RoleCode   | RoleName     | RoleLevel |
+-------------+------------------+------------+--------------+-----------+
| dev_user    | Developer        | ADMIN      | Administrator| 1         |
| test_admin  | Test Administrator| ADMIN     | Administrator| 1         |
| test_super  | Test Super User  | SUPER_USER | Super User   | 2         |
| test_manager| Test Manager     | MANAGER    | Manager      | 3         |
| test_user   | Test User        | USER       | User         | 4         |
| test_viewer | Test Viewer      | VIEWER     | Viewer       | 5         |
+-------------+------------------+------------+--------------+-----------+
*/
