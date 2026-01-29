
-- ═══════════════════════════════════════════════════════════════════════════════
-- 📋 PE Notification System - Test Users Setup Script
-- ═══════════════════════════════════════════════════════════════════════════════
-- Version: 1.0
-- Created: December 18, 2025
-- Purpose: สร้าง Test Users สำหรับทดสอบ PE Notification System
-- Company: BIGC (CompanyId = 2)
-- ═══════════════════════════════════════════════════════════════════════════════

USE [HRBUDGET]  -- ปรับชื่อ Database ตามจริง
GO

-- ═══════════════════════════════════════════════════════════════════════════════
-- 🔧 CONFIGURATION - ปรับค่าตามต้องการ
-- ═══════════════════════════════════════════════════════════════════════════════

DECLARE @CompanyId INT = 2;  -- BIGC
DECLARE @PasswordHash NVARCHAR(256) = '$2a$12$LO29NAv8mlT.MN6yZtC7JeS.uImYqgfRP46HBhLfoUMN8Ohe2nR/2';
DECLARE @CreatedBy NVARCHAR(100) = 'SYSTEM_TEST';
DECLARE @CreatedDate DATETIME = GETDATE();

-- Cost Centers สำหรับทดสอบ (ปรับตาม Cost Center ที่มีอยู่จริง)
DECLARE @SourceCostCenter NVARCHAR(50) = '1000201';  -- User A's Cost Center (Move Out)
DECLARE @TargetCostCenter NVARCHAR(50) = '1000202';  -- User B's Cost Center (Move In/Approve)

-- ═══════════════════════════════════════════════════════════════════════════════
-- 📌 STEP 0: Check Existing Data (Information Only)
-- ═══════════════════════════════════════════════════════════════════════════════

PRINT '═══════════════════════════════════════════════════════════════';
PRINT '📌 STEP 0: Checking Existing Data...';
PRINT '═══════════════════════════════════════════════════════════════';

-- Check existing roles
SELECT 'Existing Roles:' AS Info;
SELECT RoleId, RoleCode, RoleName, RoleLevel, IsActive
FROM dbo.HRB_ROLE
WHERE IsActive = 1;

-- Check if USER role exists
DECLARE @UserRoleId INT;
SELECT @UserRoleId = RoleId FROM dbo.HRB_ROLE WHERE RoleCode = 'USER' AND IsActive = 1;

IF @UserRoleId IS NULL
BEGIN
    PRINT '⚠️ WARNING: USER role not found! Creating...';
    INSERT INTO dbo.HRB_ROLE (RoleCode, RoleName, RoleNameTh, Description, RoleLevel, IsActive, IsSystem, CreatedBy, CreatedDate)
    VALUES ('USER', 'User', 'ผู้ใช้งาน', 'Standard user with basic access', 4, 1, 1, @CreatedBy, @CreatedDate);

    SET @UserRoleId = SCOPE_IDENTITY();
    PRINT '✅ USER role created with RoleId: ' + CAST(@UserRoleId AS VARCHAR);
END
ELSE
BEGIN
    PRINT '✅ USER role exists with RoleId: ' + CAST(@UserRoleId AS VARCHAR);
END

-- Check existing Cost Centers
SELECT 'Available Cost Centers (BIGC):' AS Info;
SELECT TOP 20 COST_CENTER_CODE, COST_CENTER_NAME
FROM dbo.HRB_MST_COST_CENTER
WHERE COMPANY_ID = @CompanyId AND IS_ACTIVE = 1
ORDER BY COST_CENTER_CODE;

-- Check existing PE Data
SELECT 'Existing PE Data for selected Cost Centers:' AS Info;
SELECT COST_CENTER_CODE, PE_MONTH, B0_HC, B1_HC, B0_BASE_WAGE, B1_BASE_WAGE
FROM dbo.HRB_PE_MANAGEMENT
WHERE COMPANY_ID = @CompanyId
  AND COST_CENTER_CODE IN (@SourceCostCenter, @TargetCostCenter)
  AND PE_MONTH = 1
ORDER BY COST_CENTER_CODE;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 📌 STEP 1: Create Test User A (Move Out User)
-- ═══════════════════════════════════════════════════════════════════════════════

PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '📌 STEP 1: Creating Test User A (Source Cost Center Owner)...';
PRINT '═══════════════════════════════════════════════════════════════';

-- Check if User A exists
IF NOT EXISTS (SELECT 1 FROM dbo.HRB_USER WHERE Username = 'TEST_USER_A')
BEGIN
    INSERT INTO dbo.HRB_USER (
        EmpCode,
        Username,
        PasswordHash,
        AuthType,
        FullName,
        Email,
        Role,
        CompanyAccess,
        IsActive,
        IsLocked,
        FailedLoginAttempts,
        CreatedBy,
        CreatedDate
    )
    VALUES (
        'TEST_A001',           -- EmpCode
        'TEST_USER_A',         -- Username
        @PasswordHash,         -- PasswordHash (BCrypt)
        'DB',                  -- AuthType
        'Test User A (Source)', -- FullName
        'test.user.a@bigc.co.th', -- Email
        'USER',                -- Role
        'BIGC',                -- CompanyAccess
        1,                     -- IsActive
        0,                     -- IsLocked
        0,                     -- FailedLoginAttempts
        @CreatedBy,
        @CreatedDate
    );

    PRINT '✅ User A created: TEST_USER_A (EmpCode: TEST_A001)';
END
ELSE
BEGIN
    PRINT '⚠️ User A already exists: TEST_USER_A';
END

-- Get User A's ID
DECLARE @UserAId INT;
SELECT @UserAId = UserId FROM dbo.HRB_USER WHERE Username = 'TEST_USER_A';
PRINT '   User A ID: ' + CAST(@UserAId AS VARCHAR);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 📌 STEP 2: Create Test User B (Move In / Approve User)
-- ═══════════════════════════════════════════════════════════════════════════════

PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '📌 STEP 2: Creating Test User B (Target Cost Center Owner)...';
PRINT '═══════════════════════════════════════════════════════════════';

-- Check if User B exists
IF NOT EXISTS (SELECT 1 FROM dbo.HRB_USER WHERE Username = 'TEST_USER_B')
BEGIN
    INSERT INTO dbo.HRB_USER (
        EmpCode,
        Username,
        PasswordHash,
        AuthType,
        FullName,
        Email,
        Role,
        CompanyAccess,
        IsActive,
        IsLocked,
        FailedLoginAttempts,
        CreatedBy,
        CreatedDate
    )
    VALUES (
        'TEST_B002',           -- EmpCode
        'TEST_USER_B',         -- Username
        @PasswordHash,         -- PasswordHash (BCrypt)
        'DB',                  -- AuthType
        'Test User B (Target)', -- FullName
        'test.user.b@bigc.co.th', -- Email
        'USER',                -- Role
        'BIGC',                -- CompanyAccess
        1,                     -- IsActive
        0,                     -- IsLocked
        0,                     -- FailedLoginAttempts
        @CreatedBy,
        @CreatedDate
    );

    PRINT '✅ User B created: TEST_USER_B (EmpCode: TEST_B002)';
END
ELSE
BEGIN
    PRINT '⚠️ User B already exists: TEST_USER_B';
END

-- Get User B's ID
DECLARE @UserBId INT;
SELECT @UserBId = UserId FROM dbo.HRB_USER WHERE Username = 'TEST_USER_B';
PRINT '   User B ID: ' + CAST(@UserBId AS VARCHAR);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 📌 STEP 3: Assign USER Role to Both Users
-- ═══════════════════════════════════════════════════════════════════════════════

PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '📌 STEP 3: Assigning USER Role to Test Users...';
PRINT '═══════════════════════════════════════════════════════════════';

-- Assign role to User A
IF NOT EXISTS (SELECT 1 FROM dbo.HRB_USER_ROLE WHERE UserId = @UserAId AND RoleId = @UserRoleId)
BEGIN
    INSERT INTO dbo.HRB_USER_ROLE (UserId, RoleId, CompanyId, IsActive, AssignedBy, AssignedDate)
    VALUES (@UserAId, @UserRoleId, @CompanyId, 1, @CreatedBy, @CreatedDate);

    PRINT '✅ USER role assigned to User A';
END
ELSE
BEGIN
    PRINT '⚠️ User A already has USER role';
END

-- Assign role to User B
IF NOT EXISTS (SELECT 1 FROM dbo.HRB_USER_ROLE WHERE UserId = @UserBId AND RoleId = @UserRoleId)
BEGIN
    INSERT INTO dbo.HRB_USER_ROLE (UserId, RoleId, CompanyId, IsActive, AssignedBy, AssignedDate)
    VALUES (@UserBId, @UserRoleId, @CompanyId, 1, @CreatedBy, @CreatedDate);

    PRINT '✅ USER role assigned to User B';
END
ELSE
BEGIN
    PRINT '⚠️ User B already has USER role';
END

-- ═══════════════════════════════════════════════════════════════════════════════
-- 📌 STEP 4: Set Cost Center Data Access
-- ═══════════════════════════════════════════════════════════════════════════════

PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '📌 STEP 4: Setting Cost Center Data Access...';
PRINT '═══════════════════════════════════════════════════════════════';

-- User A access to Source Cost Center
IF NOT EXISTS (SELECT 1 FROM dbo.HRB_USER_DATA_ACCESS
               WHERE UserId = @UserAId AND CompanyId = @CompanyId AND CostCenterCode = @SourceCostCenter)
BEGIN
    INSERT INTO dbo.HRB_USER_DATA_ACCESS (UserId, CompanyId, CostCenterCode, AccessType, IsActive, AssignedBy, AssignedDate)
    VALUES (@UserAId, @CompanyId, @SourceCostCenter, 'FULL', 1, @CreatedBy, @CreatedDate);

    PRINT '✅ User A granted FULL access to Cost Center: ' + @SourceCostCenter;
END
ELSE
BEGIN
    PRINT '⚠️ User A already has access to Cost Center: ' + @SourceCostCenter;
END

-- User B access to Target Cost Center
IF NOT EXISTS (SELECT 1 FROM dbo.HRB_USER_DATA_ACCESS
               WHERE UserId = @UserBId AND CompanyId = @CompanyId AND CostCenterCode = @TargetCostCenter)
BEGIN
    INSERT INTO dbo.HRB_USER_DATA_ACCESS (UserId, CompanyId, CostCenterCode, AccessType, IsActive, AssignedBy, AssignedDate)
    VALUES (@UserBId, @CompanyId, @TargetCostCenter, 'FULL', 1, @CreatedBy, @CreatedDate);

    PRINT '✅ User B granted FULL access to Cost Center: ' + @TargetCostCenter;
END
ELSE
BEGIN
    PRINT '⚠️ User B already has access to Cost Center: ' + @TargetCostCenter;
END

-- ═══════════════════════════════════════════════════════════════════════════════
-- 📌 STEP 5: Set PE Cost Center Allocation (Ownership)
-- ═══════════════════════════════════════════════════════════════════════════════

PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '📌 STEP 5: Setting PE Cost Center Allocation (Ownership)...';
PRINT '═══════════════════════════════════════════════════════════════';

-- Get next AllocateId
DECLARE @NextAllocateIdA INT, @NextAllocateIdB INT;
SELECT @NextAllocateIdA = ISNULL(MAX(ALLOCATE_ID), 0) + 1 FROM dbo.HRB_CONF_PE_ALLOCATION;

-- User A owns Source Cost Center
IF NOT EXISTS (SELECT 1 FROM dbo.HRB_CONF_PE_ALLOCATION
               WHERE COMPANY_ID = @CompanyId AND COST_CENTER_CODE = @SourceCostCenter AND EMP_CODE = 'TEST_A001')
BEGIN
    INSERT INTO dbo.HRB_CONF_PE_ALLOCATION (ALLOCATE_ID, COMPANY_ID, COST_CENTER_CODE, EMP_CODE, ALLOCATE_VALUE, IS_ACTIVE, UPDATED_BY, UPDATED_DATE)
    VALUES (@NextAllocateIdA, @CompanyId, @SourceCostCenter, 'TEST_A001', 100.00, 1, @CreatedBy, @CreatedDate);

    PRINT '✅ User A (TEST_A001) set as owner of Cost Center: ' + @SourceCostCenter;
END
ELSE
BEGIN
    PRINT '⚠️ User A already owns Cost Center: ' + @SourceCostCenter;
END

-- Get next AllocateId for B
SELECT @NextAllocateIdB = ISNULL(MAX(ALLOCATE_ID), 0) + 1 FROM dbo.HRB_CONF_PE_ALLOCATION;

-- User B owns Target Cost Center
IF NOT EXISTS (SELECT 1 FROM dbo.HRB_CONF_PE_ALLOCATION
               WHERE COMPANY_ID = @CompanyId AND COST_CENTER_CODE = @TargetCostCenter AND EMP_CODE = 'TEST_B002')
BEGIN
    INSERT INTO dbo.HRB_CONF_PE_ALLOCATION (ALLOCATE_ID, COMPANY_ID, COST_CENTER_CODE, EMP_CODE, ALLOCATE_VALUE, IS_ACTIVE, UPDATED_BY, UPDATED_DATE)
    VALUES (@NextAllocateIdB, @CompanyId, @TargetCostCenter, 'TEST_B002', 100.00, 1, @CreatedBy, @CreatedDate);

    PRINT '✅ User B (TEST_B002) set as owner of Cost Center: ' + @TargetCostCenter;
END
ELSE
BEGIN
    PRINT '⚠️ User B already owns Cost Center: ' + @TargetCostCenter;
END

-- ═══════════════════════════════════════════════════════════════════════════════
-- 📌 STEP 6: Verify PE Role Permissions (Check Only)
-- ═══════════════════════════════════════════════════════════════════════════════

PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '📌 STEP 6: Verifying PE Role Permissions...';
PRINT '═══════════════════════════════════════════════════════════════';

SELECT 'Permissions for USER role:' AS Info;
SELECT p.PermissionCode, p.PermissionName, p.Category, p.Module
FROM dbo.HRB_ROLE_PERMISSION rp
INNER JOIN dbo.HRB_PERMISSION p ON rp.PermissionId = p.PermissionId
WHERE rp.RoleId = @UserRoleId AND rp.IsActive = 1 AND p.IsActive = 1
ORDER BY p.Module, p.SortOrder;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 📌 STEP 7: Summary - Verification Query
-- ═══════════════════════════════════════════════════════════════════════════════

PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '📌 STEP 7: Setup Summary';
PRINT '═══════════════════════════════════════════════════════════════';

SELECT '=== Test Users Created ===' AS Section;
SELECT
    u.UserId,
    u.EmpCode,
    u.Username,
    u.FullName,
    u.AuthType,
    u.CompanyAccess,
    u.IsActive,
    CASE WHEN u.PasswordHash IS NOT NULL THEN 'Yes' ELSE 'No' END AS HasPassword
FROM dbo.HRB_USER u
WHERE u.Username IN ('TEST_USER_A', 'TEST_USER_B');

SELECT '=== User Role Assignments ===' AS Section;
SELECT
    u.Username,
    r.RoleCode,
    r.RoleName,
    ur.CompanyId,
    ur.IsActive
FROM dbo.HRB_USER_ROLE ur
INNER JOIN dbo.HRB_USER u ON ur.UserId = u.UserId
INNER JOIN dbo.HRB_ROLE r ON ur.RoleId = r.RoleId
WHERE u.Username IN ('TEST_USER_A', 'TEST_USER_B');

SELECT '=== Cost Center Access ===' AS Section;
SELECT
    u.Username,
    da.CompanyId,
    da.CostCenterCode,
    da.AccessType,
    da.IsActive
FROM dbo.HRB_USER_DATA_ACCESS da
INNER JOIN dbo.HRB_USER u ON da.UserId = u.UserId
WHERE u.Username IN ('TEST_USER_A', 'TEST_USER_B');

SELECT '=== PE Allocation Ownership ===' AS Section;
SELECT
    pa.COMPANY_ID,
    pa.COST_CENTER_CODE,
    pa.EMP_CODE,
    pa.ALLOCATE_VALUE,
    pa.IS_ACTIVE
FROM dbo.HRB_CONF_PE_ALLOCATION pa
WHERE pa.EMP_CODE IN ('TEST_A001', 'TEST_B002');

PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '✅ TEST USERS SETUP COMPLETED!';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '';
PRINT '📋 Test Login Credentials:';
PRINT '   User A: TEST_USER_A / [password from hash]';
PRINT '   User B: TEST_USER_B / [password from hash]';
PRINT '';
PRINT '📋 Test Scenario:';
PRINT '   1. Login as TEST_USER_A (Company: BIG C)';
PRINT '   2. Go to PE Management → Select Cost Center: ' + @SourceCostCenter;
PRINT '   3. Perform Move Out to Cost Center: ' + @TargetCostCenter;
PRINT '   4. Open Incognito → Login as TEST_USER_B (Company: BIG C)';
PRINT '   5. Check Bell Icon → Should show notification badge';
PRINT '   6. Click notification → Navigate to PE Management';
PRINT '   7. Accept or Reject the Move In request';
PRINT '';

GO

-- ═══════════════════════════════════════════════════════════════════════════════
-- 🗑️ CLEANUP SCRIPT (Run separately if needed)
-- ═══════════════════════════════════════════════════════════════════════════════

/*
-- WARNING: This will DELETE all test data!

DECLARE @UserAId INT, @UserBId INT;
SELECT @UserAId = UserId FROM HRBUDGET.HRB_USER WHERE Username = 'TEST_USER_A';
SELECT @UserBId = UserId FROM HRBUDGET.HRB_USER WHERE Username = 'TEST_USER_B';

-- Delete PE Allocations
DELETE FROM HRBUDGET.HRB_CONF_PE_ALLOCATION WHERE EMP_CODE IN ('TEST_A001', 'TEST_B002');

-- Delete Data Access
DELETE FROM HRBUDGET.HRB_USER_DATA_ACCESS WHERE UserId IN (@UserAId, @UserBId);

-- Delete User Roles
DELETE FROM HRBUDGET.HRB_USER_ROLE WHERE UserId IN (@UserAId, @UserBId);

-- Delete Notifications for test users
DELETE FROM HRBUDGET.HRB_PE_NOTIFICATION
WHERE RECIPIENT_EMP_CODE IN ('TEST_A001', 'TEST_B002')
   OR SENDER_EMP_CODE IN ('TEST_A001', 'TEST_B002');

-- Delete Users
DELETE FROM HRBUDGET.HRB_USER WHERE Username IN ('TEST_USER_A', 'TEST_USER_B');

PRINT '✅ Test data cleaned up!';
*/
