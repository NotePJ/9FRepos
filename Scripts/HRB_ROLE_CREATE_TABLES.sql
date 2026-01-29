-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 📋 CREATE HRB_ROLE AND HRB_USER_ROLE TABLES
-- Purpose: สร้างตาราง Role และ User-Role mapping
--
-- 📅 Created: 2025-12-17
-- 👤 Author: GitHub Copilot
-- 📌 Status: WAITING FOR SA CONFIRMATION
-- ═══════════════════════════════════════════════════════════════════════════════════════

USE [HRBUDGET]; -- ปรับชื่อ database ตามจริง
GO

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 🏷️ TABLE 1: HRB_ROLE - Master table for roles
-- ═══════════════════════════════════════════════════════════════════════════════════════

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.HRB_ROLE') AND type = 'U')
BEGIN
    CREATE TABLE dbo.HRB_ROLE (
        -- Primary Key
        RoleId          INT IDENTITY(1,1) PRIMARY KEY,

        -- Role Information
        RoleCode        NVARCHAR(50) NOT NULL,          -- ADMIN, SUPER_USER, MANAGER, USER, VIEWER
        RoleName        NVARCHAR(100) NOT NULL,         -- Display name
        RoleNameTh      NVARCHAR(100) NULL,             -- Thai name
        Description     NVARCHAR(500) NULL,             -- Role description

        -- Hierarchy
        RoleLevel       INT NOT NULL DEFAULT 0,         -- 1=Highest (Admin), 5=Lowest (Viewer)

        -- Status
        IsActive        BIT NOT NULL DEFAULT 1,
        IsSystem        BIT NOT NULL DEFAULT 0,         -- System role cannot be deleted

        -- Audit
        CreatedBy       NVARCHAR(100) NULL,
        CreatedDate     DATETIME NOT NULL DEFAULT GETDATE(),
        UpdatedBy       NVARCHAR(100) NULL,
        UpdatedDate     DATETIME NULL,

        -- Constraints
        CONSTRAINT UQ_HRB_ROLE_RoleCode UNIQUE (RoleCode)
    );

    PRINT '✅ Created table: dbo.HRB_ROLE';
END
ELSE
    PRINT '⚠️ Table dbo.HRB_ROLE already exists';
GO

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 🔗 TABLE 2: HRB_USER_ROLE - Many-to-Many relationship between User and Role
-- ═══════════════════════════════════════════════════════════════════════════════════════

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.HRB_USER_ROLE') AND type = 'U')
BEGIN
    CREATE TABLE dbo.HRB_USER_ROLE (
        -- Primary Key
        Id              INT IDENTITY(1,1) PRIMARY KEY,

        -- Foreign Keys
        UserId          INT NOT NULL,                   -- FK to HRB_USER
        RoleId          INT NOT NULL,                   -- FK to HRB_ROLE

        -- Scope (optional - for company-specific roles)
        CompanyId       INT NULL,                       -- NULL = All companies

        -- Status
        IsActive        BIT NOT NULL DEFAULT 1,

        -- Audit
        AssignedBy      NVARCHAR(100) NULL,
        AssignedDate    DATETIME NOT NULL DEFAULT GETDATE(),
        RevokedBy       NVARCHAR(100) NULL,
        RevokedDate     DATETIME NULL,

        -- Constraints
        CONSTRAINT UQ_HRB_USER_ROLE UNIQUE (UserId, RoleId, CompanyId),
        CONSTRAINT FK_HRB_USER_ROLE_User FOREIGN KEY (UserId) REFERENCES dbo.HRB_USER(UserId),
        CONSTRAINT FK_HRB_USER_ROLE_Role FOREIGN KEY (RoleId) REFERENCES dbo.HRB_ROLE(RoleId)
    );

    -- Create indexes for performance
    CREATE INDEX IX_HRB_USER_ROLE_UserId ON dbo.HRB_USER_ROLE(UserId);
    CREATE INDEX IX_HRB_USER_ROLE_RoleId ON dbo.HRB_USER_ROLE(RoleId);

    PRINT '✅ Created table: dbo.HRB_USER_ROLE';
END
ELSE
    PRINT '⚠️ Table dbo.HRB_USER_ROLE already exists';
GO

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- ✅ VERIFY TABLE CREATION
-- ═══════════════════════════════════════════════════════════════════════════════════════

SELECT
    t.name AS TableName,
    COUNT(c.column_id) AS ColumnCount
FROM sys.tables t
LEFT JOIN sys.columns c ON t.object_id = c.object_id
WHERE t.name IN ('HRB_ROLE', 'HRB_USER_ROLE')
GROUP BY t.name
ORDER BY t.name;

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 📋 TABLE STRUCTURE SUMMARY
-- ═══════════════════════════════════════════════════════════════════════════════════════
/*
HRB_ROLE:
+-------------+---------------+----------+----------------------------------+
| Column      | Type          | Nullable | Description                      |
+-------------+---------------+----------+----------------------------------+
| RoleId      | INT IDENTITY  | NO       | Primary Key                      |
| RoleCode    | NVARCHAR(50)  | NO       | ADMIN, SUPER_USER, etc.         |
| RoleName    | NVARCHAR(100) | NO       | Display name                     |
| RoleNameTh  | NVARCHAR(100) | YES      | Thai name                        |
| Description | NVARCHAR(500) | YES      | Role description                 |
| RoleLevel   | INT           | NO       | 1=Highest, 5=Lowest             |
| IsActive    | BIT           | NO       | Active status                    |
| IsSystem    | BIT           | NO       | System role flag                 |
| CreatedBy   | NVARCHAR(100) | YES      | Created by                       |
| CreatedDate | DATETIME      | NO       | Created date                     |
| UpdatedBy   | NVARCHAR(100) | YES      | Updated by                       |
| UpdatedDate | DATETIME      | YES      | Updated date                     |
+-------------+---------------+----------+----------------------------------+

HRB_USER_ROLE:
+--------------+---------------+----------+----------------------------------+
| Column       | Type          | Nullable | Description                      |
+--------------+---------------+----------+----------------------------------+
| Id           | INT IDENTITY  | NO       | Primary Key                      |
| UserId       | INT           | NO       | FK to HRB_USER                   |
| RoleId       | INT           | NO       | FK to HRB_ROLE                   |
| CompanyId    | INT           | YES      | Company scope (NULL=All)         |
| IsActive     | BIT           | NO       | Active status                    |
| AssignedBy   | NVARCHAR(100) | YES      | Who assigned the role            |
| AssignedDate | DATETIME      | NO       | When role was assigned           |
| RevokedBy    | NVARCHAR(100) | YES      | Who revoked the role             |
| RevokedDate  | DATETIME      | YES      | When role was revoked            |
+--------------+---------------+----------+----------------------------------+

RELATIONSHIPS:
┌─────────────┐       ┌────────────────┐       ┌─────────────┐
│  HRB_USER   │ 1───N │ HRB_USER_ROLE  │ N───1 │  HRB_ROLE   │
│             │       │                │       │             │
│ UserId (PK) │◄──────│ UserId (FK)    │       │ RoleId (PK) │
│             │       │ RoleId (FK)    │──────►│             │
└─────────────┘       └────────────────┘       └─────────────┘
*/
