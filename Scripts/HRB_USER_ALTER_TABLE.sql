-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 📋 ALTER TABLE HRB_USER - Add Missing Columns
-- Purpose: เพิ่ม columns ที่ขาดใน HRB_USER table
--
-- 📅 Created: 2025-12-17
-- 👤 Author: GitHub Copilot
-- ═══════════════════════════════════════════════════════════════════════════════════════

USE [HRBUDGET]; -- ปรับชื่อ database ตามจริง
GO

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 🔄 ADD NEW COLUMNS
-- ═══════════════════════════════════════════════════════════════════════════════════════

-- 1️⃣ Role - User Role: Admin, SuperUser, Manager, User, Viewer
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.HRB_USER') AND name = 'Role')
BEGIN
    ALTER TABLE dbo.HRB_USER ADD [Role] NVARCHAR(50) NULL DEFAULT 'User';
    PRINT 'Added column: Role';
END
ELSE
    PRINT 'Column Role already exists';
GO

-- 2️⃣ CompanyAccess - Accessible companies: BJC, BIGC, or BJC,BIGC
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.HRB_USER') AND name = 'CompanyAccess')
BEGIN
    ALTER TABLE dbo.HRB_USER ADD [CompanyAccess] NVARCHAR(100) NULL;
    PRINT 'Added column: CompanyAccess';
END
ELSE
    PRINT 'Column CompanyAccess already exists';
GO

-- 3️⃣ IsLocked - Account locked status
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.HRB_USER') AND name = 'IsLocked')
BEGIN
    ALTER TABLE dbo.HRB_USER ADD [IsLocked] BIT NOT NULL DEFAULT 0;
    PRINT 'Added column: IsLocked';
END
ELSE
    PRINT 'Column IsLocked already exists';
GO

-- 4️⃣ LastLoginDate - Last successful login
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.HRB_USER') AND name = 'LastLoginDate')
BEGIN
    ALTER TABLE dbo.HRB_USER ADD [LastLoginDate] DATETIME NULL;
    PRINT 'Added column: LastLoginDate';
END
ELSE
    PRINT 'Column LastLoginDate already exists';
GO

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- ✅ VERIFY TABLE STRUCTURE
-- ═══════════════════════════════════════════════════════════════════════════════════════

SELECT
    c.name AS ColumnName,
    t.name AS DataType,
    c.max_length AS MaxLength,
    c.is_nullable AS IsNullable,
    dc.definition AS DefaultValue
FROM sys.columns c
INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
LEFT JOIN sys.default_constraints dc ON c.default_object_id = dc.object_id
WHERE c.object_id = OBJECT_ID('dbo.HRB_USER')
ORDER BY c.column_id;

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 📋 EXPECTED TABLE STRUCTURE AFTER ALTER
-- ═══════════════════════════════════════════════════════════════════════════════════════
/*
+----------------+---------------+------------+----------+------------+
| ColumnName     | DataType      | MaxLength  | Nullable | Default    |
+----------------+---------------+------------+----------+------------+
| UserId         | int           | 4          | NO       | IDENTITY   |
| EmpCode        | nvarchar      | 100        | NO       |            |
| Username       | nvarchar      | 200        | NO       |            |
| PasswordHash   | nvarchar      | 512        | YES      |            |
| AuthType       | nvarchar      | 40         | NO       | 'AD'       |
| FullName       | nvarchar      | 400        | YES      |            |
| Email          | nvarchar      | 400        | YES      |            |
| Role           | nvarchar      | 100        | YES      | 'User'     | ← NEW
| CompanyAccess  | nvarchar      | 200        | YES      |            | ← NEW
| IsActive       | bit           | 1          | NO       | 1          |
| IsLocked       | bit           | 1          | NO       | 0          | ← NEW
| LastLoginDate  | datetime      | 8          | YES      |            | ← NEW
| CreatedBy      | nvarchar      | 200        | YES      |            |
| CreatedDate    | datetime      | 8          | NO       | GETDATE()  |
| UpdatedBy      | nvarchar      | 200        | YES      |            |
| UpdatedDate    | datetime      | 8          | YES      |            |
+----------------+---------------+------------+----------+------------+
*/
