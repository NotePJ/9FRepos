-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 📋 CREATE PERMISSION AND DATA ACCESS TABLES
-- Purpose: สร้างตาราง Permission, Role-Permission mapping, และ User Data Access
--
-- 📅 Created: 2025-12-17
-- 👤 Author: GitHub Copilot
-- 📌 Status: WAITING FOR SA CONFIRMATION
-- ═══════════════════════════════════════════════════════════════════════════════════════

USE [HRBUDGET]; -- ปรับชื่อ database ตามจริง
GO

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 🔐 TABLE 1: HRB_PERMISSION - Master table for permissions
-- ═══════════════════════════════════════════════════════════════════════════════════════

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.HRB_PERMISSION') AND type = 'U')
BEGIN
    CREATE TABLE dbo.HRB_PERMISSION (
        -- Primary Key
        PermissionId    INT IDENTITY(1,1) PRIMARY KEY,

        -- Permission Information
        PermissionCode  NVARCHAR(100) NOT NULL,         -- PAGE_DASHBOARD, BTN_SAVE, etc.
        PermissionName  NVARCHAR(200) NOT NULL,         -- Display name
        PermissionNameTh NVARCHAR(200) NULL,            -- Thai name
        Description     NVARCHAR(500) NULL,             -- Permission description

        -- Category
        Category        NVARCHAR(50) NOT NULL,          -- PAGE, BUTTON, API, FEATURE
        Module          NVARCHAR(50) NULL,              -- BUDGET, PE, SETTINGS, etc.

        -- Status
        IsActive        BIT NOT NULL DEFAULT 1,

        -- Audit
        CreatedBy       NVARCHAR(100) NULL,
        CreatedDate     DATETIME NOT NULL DEFAULT GETDATE(),
        UpdatedBy       NVARCHAR(100) NULL,
        UpdatedDate     DATETIME NULL,

        -- Constraints
        CONSTRAINT UQ_HRB_PERMISSION_Code UNIQUE (PermissionCode)
    );

    PRINT '✅ Created table: dbo.HRB_PERMISSION';
END
ELSE
    PRINT '⚠️ Table dbo.HRB_PERMISSION already exists';
GO

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 🔗 TABLE 2: HRB_ROLE_PERMISSION - Many-to-Many: Role <-> Permission
-- ═══════════════════════════════════════════════════════════════════════════════════════

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.HRB_ROLE_PERMISSION') AND type = 'U')
BEGIN
    CREATE TABLE dbo.HRB_ROLE_PERMISSION (
        -- Primary Key
        Id              INT IDENTITY(1,1) PRIMARY KEY,

        -- Foreign Keys
        RoleId          INT NOT NULL,                   -- FK to HRB_ROLE
        PermissionId    INT NOT NULL,                   -- FK to HRB_PERMISSION

        -- Status
        IsActive        BIT NOT NULL DEFAULT 1,

        -- Audit
        CreatedBy       NVARCHAR(100) NULL,
        CreatedDate     DATETIME NOT NULL DEFAULT GETDATE(),

        -- Constraints
        CONSTRAINT UQ_HRB_ROLE_PERMISSION UNIQUE (RoleId, PermissionId),
        CONSTRAINT FK_HRB_ROLE_PERMISSION_Role FOREIGN KEY (RoleId) REFERENCES dbo.HRB_ROLE(RoleId),
        CONSTRAINT FK_HRB_ROLE_PERMISSION_Perm FOREIGN KEY (PermissionId) REFERENCES dbo.HRB_PERMISSION(PermissionId)
    );

    CREATE INDEX IX_HRB_ROLE_PERMISSION_RoleId ON dbo.HRB_ROLE_PERMISSION(RoleId);
    CREATE INDEX IX_HRB_ROLE_PERMISSION_PermId ON dbo.HRB_ROLE_PERMISSION(PermissionId);

    PRINT '✅ Created table: dbo.HRB_ROLE_PERMISSION';
END
ELSE
    PRINT '⚠️ Table dbo.HRB_ROLE_PERMISSION already exists';
GO

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 📊 TABLE 3: HRB_USER_DATA_ACCESS - User access to specific data (Cost Centers)
-- ═══════════════════════════════════════════════════════════════════════════════════════

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.HRB_USER_DATA_ACCESS') AND type = 'U')
BEGIN
    CREATE TABLE dbo.HRB_USER_DATA_ACCESS (
        -- Primary Key
        Id              INT IDENTITY(1,1) PRIMARY KEY,

        -- Foreign Key
        UserId          INT NOT NULL,                   -- FK to HRB_USER

        -- Access Scope
        CompanyId       INT NULL,                       -- Company access (NULL = All)
        CostCenterCode  NVARCHAR(50) NULL,              -- Cost Center access (NULL = All in company)

        -- Access Type
        AccessType      NVARCHAR(20) NOT NULL DEFAULT 'FULL', -- FULL, VIEW_ONLY, EDIT

        -- Status
        IsActive        BIT NOT NULL DEFAULT 1,

        -- Audit
        AssignedBy      NVARCHAR(100) NULL,
        AssignedDate    DATETIME NOT NULL DEFAULT GETDATE(),

        -- Constraints
        CONSTRAINT FK_HRB_USER_DATA_ACCESS_User FOREIGN KEY (UserId) REFERENCES dbo.HRB_USER(UserId)
    );

    CREATE INDEX IX_HRB_USER_DATA_ACCESS_UserId ON dbo.HRB_USER_DATA_ACCESS(UserId);
    CREATE INDEX IX_HRB_USER_DATA_ACCESS_Company ON dbo.HRB_USER_DATA_ACCESS(CompanyId);

    PRINT '✅ Created table: dbo.HRB_USER_DATA_ACCESS';
END
ELSE
    PRINT '⚠️ Table dbo.HRB_USER_DATA_ACCESS already exists';
GO

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- ✅ VERIFY TABLE CREATION
-- ═══════════════════════════════════════════════════════════════════════════════════════

SELECT
    t.name AS TableName,
    COUNT(c.column_id) AS ColumnCount
FROM sys.tables t
LEFT JOIN sys.columns c ON t.object_id = c.object_id
WHERE t.name IN ('HRB_PERMISSION', 'HRB_ROLE_PERMISSION', 'HRB_USER_DATA_ACCESS')
GROUP BY t.name
ORDER BY t.name;

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 📋 TABLE STRUCTURE SUMMARY
-- ═══════════════════════════════════════════════════════════════════════════════════════
/*
RELATIONSHIPS:
┌─────────────┐       ┌────────────────────┐       ┌────────────────┐
│  HRB_ROLE   │ 1───N │ HRB_ROLE_PERMISSION│ N───1 │ HRB_PERMISSION │
│             │       │                    │       │                │
│ RoleId (PK) │◄──────│ RoleId (FK)        │       │PermissionId(PK)│
│             │       │ PermissionId (FK)  │──────►│                │
└─────────────┘       └────────────────────┘       └────────────────┘

┌─────────────┐       ┌────────────────────────┐
│  HRB_USER   │ 1───N │ HRB_USER_DATA_ACCESS   │
│             │       │                        │
│ UserId (PK) │◄──────│ UserId (FK)            │
│             │       │ CompanyId              │
│             │       │ CostCenterCode         │
└─────────────┘       └────────────────────────┘
*/
