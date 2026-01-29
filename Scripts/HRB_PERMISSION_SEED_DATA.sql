-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 📋 INSERT DEFAULT PERMISSIONS AND MAP TO ROLES
-- Purpose: สร้าง default permissions และ map กับ roles
--
-- 📅 Created: 2025-12-17
-- 👤 Author: GitHub Copilot
-- ═══════════════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 🔐 PART 1: INSERT DEFAULT PERMISSIONS
-- ═══════════════════════════════════════════════════════════════════════════════════════

-- Clear existing (optional)
-- DELETE FROM dbo.HRB_ROLE_PERMISSION;
-- DELETE FROM dbo.HRB_PERMISSION;

-- PAGE PERMISSIONS
INSERT INTO dbo.HRB_PERMISSION (PermissionCode, PermissionName, PermissionNameTh, Category, Module, CreatedBy)
VALUES
    -- Dashboard
    ('PAGE_DASHBOARD', 'View Dashboard', 'เข้าถึงหน้า Dashboard', 'PAGE', 'DASHBOARD', 'SYSTEM'),

    -- Budget Module
    ('PAGE_BUDGET', 'View Budget', 'เข้าถึงหน้า Budget', 'PAGE', 'BUDGET', 'SYSTEM'),
    ('PAGE_BUDGET_EDIT', 'Edit Budget', 'แก้ไข Budget', 'PAGE', 'BUDGET', 'SYSTEM'),

    -- PE Module
    ('PAGE_PE', 'View PE Management', 'เข้าถึงหน้า PE Management', 'PAGE', 'PE', 'SYSTEM'),
    ('PAGE_PE_EDIT', 'Edit PE', 'แก้ไข PE', 'PAGE', 'PE', 'SYSTEM'),

    -- Settings Module
    ('PAGE_SETTINGS', 'View Settings', 'เข้าถึงหน้า Settings', 'PAGE', 'SETTINGS', 'SYSTEM'),
    ('PAGE_USER_MANAGEMENT', 'View User Management', 'จัดการผู้ใช้งาน', 'PAGE', 'SETTINGS', 'SYSTEM'),
    ('PAGE_ROLE_MANAGEMENT', 'View Role Management', 'จัดการ Role', 'PAGE', 'SETTINGS', 'SYSTEM'),

    -- Summary/Report
    ('PAGE_SUMMARY', 'View Summary', 'เข้าถึงหน้า Summary', 'PAGE', 'SUMMARY', 'SYSTEM');

-- BUTTON PERMISSIONS
INSERT INTO dbo.HRB_PERMISSION (PermissionCode, PermissionName, PermissionNameTh, Category, Module, CreatedBy)
VALUES
    ('BTN_SAVE', 'Save Button', 'ปุ่มบันทึก', 'BUTTON', 'GENERAL', 'SYSTEM'),
    ('BTN_DELETE', 'Delete Button', 'ปุ่มลบ', 'BUTTON', 'GENERAL', 'SYSTEM'),
    ('BTN_EXPORT', 'Export Button', 'ปุ่ม Export', 'BUTTON', 'GENERAL', 'SYSTEM'),
    ('BTN_IMPORT', 'Import Button', 'ปุ่ม Import', 'BUTTON', 'GENERAL', 'SYSTEM'),
    ('BTN_APPROVE', 'Approve Button', 'ปุ่มอนุมัติ', 'BUTTON', 'GENERAL', 'SYSTEM'),
    ('BTN_REJECT', 'Reject Button', 'ปุ่มปฏิเสธ', 'BUTTON', 'GENERAL', 'SYSTEM');

-- FEATURE PERMISSIONS
INSERT INTO dbo.HRB_PERMISSION (PermissionCode, PermissionName, PermissionNameTh, Category, Module, CreatedBy)
VALUES
    ('FEATURE_MULTI_COMPANY', 'Multi-Company Access', 'เข้าถึงหลายบริษัท', 'FEATURE', 'GENERAL', 'SYSTEM'),
    ('FEATURE_ADMIN_TOOLS', 'Admin Tools', 'เครื่องมือ Admin', 'FEATURE', 'SETTINGS', 'SYSTEM');

PRINT '✅ Inserted default permissions';
GO

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- ✅ VERIFY PERMISSIONS
-- ═══════════════════════════════════════════════════════════════════════════════════════

SELECT PermissionId, PermissionCode, PermissionName, Category, Module
FROM dbo.HRB_PERMISSION
ORDER BY Category, Module, PermissionCode;
GO

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 🔗 PART 2: MAP ROLES TO PERMISSIONS
-- ═══════════════════════════════════════════════════════════════════════════════════════

-- ADMIN: All permissions
INSERT INTO dbo.HRB_ROLE_PERMISSION (RoleId, PermissionId, IsActive, CreatedBy)
SELECT r.RoleId, p.PermissionId, 1, 'SYSTEM'
FROM dbo.HRB_ROLE r
CROSS JOIN dbo.HRB_PERMISSION p
WHERE r.RoleCode = 'ADMIN';

-- SUPER_USER: All except Admin Tools
INSERT INTO dbo.HRB_ROLE_PERMISSION (RoleId, PermissionId, IsActive, CreatedBy)
SELECT r.RoleId, p.PermissionId, 1, 'SYSTEM'
FROM dbo.HRB_ROLE r
CROSS JOIN dbo.HRB_PERMISSION p
WHERE r.RoleCode = 'SUPER_USER'
  AND p.PermissionCode NOT IN ('PAGE_USER_MANAGEMENT', 'PAGE_ROLE_MANAGEMENT', 'FEATURE_ADMIN_TOOLS');

-- MANAGER: Dashboard, Budget, PE, Summary, Approve buttons
INSERT INTO dbo.HRB_ROLE_PERMISSION (RoleId, PermissionId, IsActive, CreatedBy)
SELECT r.RoleId, p.PermissionId, 1, 'SYSTEM'
FROM dbo.HRB_ROLE r
CROSS JOIN dbo.HRB_PERMISSION p
WHERE r.RoleCode = 'MANAGER'
  AND p.PermissionCode IN (
      'PAGE_DASHBOARD', 'PAGE_BUDGET', 'PAGE_BUDGET_EDIT',
      'PAGE_PE', 'PAGE_PE_EDIT', 'PAGE_SUMMARY',
      'BTN_SAVE', 'BTN_EXPORT', 'BTN_APPROVE', 'BTN_REJECT'
  );

-- USER: Dashboard, Budget view, PE view, Save, Export
INSERT INTO dbo.HRB_ROLE_PERMISSION (RoleId, PermissionId, IsActive, CreatedBy)
SELECT r.RoleId, p.PermissionId, 1, 'SYSTEM'
FROM dbo.HRB_ROLE r
CROSS JOIN dbo.HRB_PERMISSION p
WHERE r.RoleCode = 'USER'
  AND p.PermissionCode IN (
      'PAGE_DASHBOARD', 'PAGE_BUDGET', 'PAGE_PE', 'PAGE_SUMMARY',
      'BTN_SAVE', 'BTN_EXPORT'
  );

-- VIEWER: Dashboard, View pages only (no edit buttons)
INSERT INTO dbo.HRB_ROLE_PERMISSION (RoleId, PermissionId, IsActive, CreatedBy)
SELECT r.RoleId, p.PermissionId, 1, 'SYSTEM'
FROM dbo.HRB_ROLE r
CROSS JOIN dbo.HRB_PERMISSION p
WHERE r.RoleCode = 'VIEWER'
  AND p.PermissionCode IN (
      'PAGE_DASHBOARD', 'PAGE_BUDGET', 'PAGE_PE', 'PAGE_SUMMARY',
      'BTN_EXPORT'
  );

PRINT '✅ Mapped roles to permissions';
GO

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- ✅ VERIFY ROLE-PERMISSION MAPPING
-- ═══════════════════════════════════════════════════════════════════════════════════════

SELECT
    r.RoleCode,
    r.RoleName,
    COUNT(rp.PermissionId) AS PermissionCount
FROM dbo.HRB_ROLE r
LEFT JOIN dbo.HRB_ROLE_PERMISSION rp ON r.RoleId = rp.RoleId AND rp.IsActive = 1
GROUP BY r.RoleCode, r.RoleName, r.RoleLevel
ORDER BY r.RoleLevel;

-- Detail view
SELECT
    r.RoleCode,
    p.Category,
    p.PermissionCode,
    p.PermissionName
FROM dbo.HRB_ROLE_PERMISSION rp
INNER JOIN dbo.HRB_ROLE r ON rp.RoleId = r.RoleId
INNER JOIN dbo.HRB_PERMISSION p ON rp.PermissionId = p.PermissionId
WHERE rp.IsActive = 1
ORDER BY r.RoleLevel, p.Category, p.PermissionCode;

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 📋 EXPECTED PERMISSION COUNTS PER ROLE
-- ═══════════════════════════════════════════════════════════════════════════════════════
/*
+------------+------------------+
| RoleCode   | PermissionCount  |
+------------+------------------+
| ADMIN      | 17 (all)         |
| SUPER_USER | 14               |
| MANAGER    | 10               |
| USER       | 6                |
| VIEWER     | 5                |
+------------+------------------+
*/
