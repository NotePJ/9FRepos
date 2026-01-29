# 🔔 PE Movement Notification & Approval System

## Document Information
| Item | Detail |
|------|--------|
| **Document Version** | 2.0 |
| **Created Date** | December 11, 2025 |
| **Last Updated** | December 18, 2025 |
| **Status** | ✅ Implementation Complete |

---

## 📋 Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Business Requirements](#2-business-requirements)
3. [System Architecture](#3-system-architecture)
4. [Phase 1: Database Design](#phase-1-database-design)
5. [Phase 2: Backend Services](#phase-2-backend-services)
6. [Phase 3: API Endpoints](#phase-3-api-endpoints)
7. [Phase 4: Frontend - Bell Component](#phase-4-frontend---bell-component)
8. [Phase 5: Frontend - AG Grid Integration](#phase-5-frontend---ag-grid-integration)
9. [Phase 6: Email Integration](#phase-6-email-integration)
10. [Phase 7: File Upload Integration](#phase-7-file-upload-integration)
11. [Implementation Checklist](#implementation-checklist)

---

## 1. Executive Summary

### 1.1 Overview
ระบบ Notification สำหรับการจัดการ PE Movement ที่ต้องมีการอนุมัติข้าม Cost Center โดยมี Feature หลัก:

- **Bell Icon Notification**: แจ้งเตือนผ่าน Icon กระดิ่งใน Header
- **Approval Workflow**: Accept/Reject การ Move In/Out
- **Email Notification**: ส่งอีเมลแจ้งเตือนอัตโนมัติ
- **File Attachment**: แนบเอกสารประกอบ (สำหรับ Additional HC)

### 1.2 Key Stakeholders
| Role | Responsibility |
|------|---------------|
| User A | ผู้ทำรายการ Move Out |
| User B | ผู้อนุมัติ Move In (เจ้าของ Cost Center ปลายทาง) |
| System | สร้าง Notification, ส่ง Email, Update Budget |

---

## 2. Business Requirements

### 2.1 Use Case: Move Out/Move In Approval

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PE Movement Approval Flow                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  User A (CC: 10001)              System                User B (CC: 20002)   │
│         │                            │                           │          │
│         │  1. Move Out HC            │                           │          │
│         │     to CC: 20002           │                           │          │
│         │ ─────────────────────────> │                           │          │
│         │                            │                           │          │
│         │                            │  2. Create Notification   │          │
│         │                            │     + Send Email          │          │
│         │                            │ ─────────────────────────>│          │
│         │                            │                           │          │
│         │                            │        🔔 Badge +1        │          │
│         │                            │                           │          │
│         │                            │  3. User B clicks bell    │          │
│         │                            │ <─────────────────────────│          │
│         │                            │                           │          │
│         │                            │  4. Navigate to PE Page   │          │
│         │                            │     (Row highlighted)     │          │
│         │                            │ ─────────────────────────>│          │
│         │                            │                           │          │
│         │                            │  5. Accept / Reject       │          │
│         │                            │ <─────────────────────────│          │
│         │                            │                           │          │
│         │  6. Notify result          │                           │          │
│         │ <───────────────────────── │                           │          │
│         │                            │                           │          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Use Case: Additional HC with Attachment

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Additional HC Request with Attachment                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. User A creates Additional HC request                                    │
│     - Fill form (HC, Base+Wage, Remark)                                     │
│     - Upload approval document (PDF/Image)                                  │
│                                                                             │
│  2. System processes:                                                       │
│     a) Save HRB_PE_MOVEMENT (status: PENDING)                               │
│     b) Save files to HRB_UPLOAD_LOG                                         │
│     c) Create HRB_PE_NOTIFICATION (HasAttachment: true)                     │
│     d) Send Email with link to approval page                                │
│                                                                             │
│  3. Approver receives notification:                                         │
│     - Email notification arrives                                            │
│     - Bell icon shows badge                                                 │
│     - Click → Navigate to PE Management                                     │
│     - View/Download attachments                                             │
│                                                                             │
│  4. Approver takes action:                                                  │
│     - Accept → Updates B1, sends approval email                             │
│     - Reject → Rollback, sends rejection email with reason                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Notification Types

| Type | Trigger | Recipient | Action Required |
|------|---------|-----------|-----------------|
| `MOVE_IN_REQUEST` | User A Move Out | User B (Target CC Owner) | Accept/Reject |
| `MOVE_APPROVED` | User B Accept | User A (Requester) | Information Only |
| `MOVE_REJECTED` | User B Reject | User A (Requester) | Information Only |
| `ADDITIONAL_REQUEST` | User A Additional HC | Approver | Accept/Reject |
| `ADDITIONAL_APPROVED` | Approver Accept | User A (Requester) | Information Only |
| `ADDITIONAL_REJECTED` | Approver Reject | User A (Requester) | Information Only |

---

## 3. System Architecture

### 3.1 Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Frontend (Browser)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   Bell Icon     │  │   AG Grid       │  │   Offcanvas     │             │
│  │   Component     │  │   (PE Mgmt)     │  │   (Movement)    │             │
│  │                 │  │                 │  │                 │             │
│  │ - Badge Count   │  │ - Status Col    │  │ - Form Fields   │             │
│  │ - Dropdown      │  │ - Accept/Reject │  │ - File Upload   │             │
│  │ - Click Action  │  │ - Row Highlight │  │ - Submit        │             │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘             │
│           │                    │                    │                       │
└───────────┼────────────────────┼────────────────────┼───────────────────────┘
            │                    │                    │
            v                    v                    v
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Backend (ASP.NET Core)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │ Notification    │  │ PEManagement    │  │ Upload          │             │
│  │ Controller      │  │ Controller      │  │ Controller      │             │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘             │
│           │                    │                    │                       │
│           v                    v                    v                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │ Notification    │  │ PEManagement    │  │ Upload          │             │
│  │ Service         │  │ Service         │  │ Service         │             │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘             │
│           │                    │                    │                       │
│           └────────────────────┼────────────────────┘                       │
│                                │                                            │
│                    ┌───────────┴───────────┐                                │
│                    │    Email Service      │                                │
│                    └───────────┬───────────┘                                │
│                                │                                            │
└────────────────────────────────┼────────────────────────────────────────────┘
                                 │
                                 v
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Database (SQL Server)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │ HRB_PE_         │  │ HRB_PE_         │  │ HRB_PE_         │             │
│  │ MANAGEMENT      │  │ MOVEMENT        │  │ NOTIFICATION    │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │ HRB_EMAIL_LOG   │  │ HRB_UPLOAD_LOG  │  │ HRB_CONF_PE_    │             │
│  │                 │  │                 │  │ ALLOCATION      │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Data Relationships                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────┐       ┌─────────────────────┐       ┌─────────────┐  │
│   │ HRB_PE_MOVEMENT │──────>│ HRB_PE_NOTIFICATION │<──────│HRB_EMAIL_LOG│  │
│   │                 │       │                     │       │             │  │
│   │ - Id (PK)       │       │ - NotificationId    │       │ - EmailId   │  │
│   │ - MovementType  │       │ - MovementId (FK)   │       │ - RefId(FK) │  │
│   │ - Status        │       │ - EmailLogId (FK)   │       │ - Status    │  │
│   │ - ApprovalStatus│       │ - UploadLogId (FK)  │       │             │  │
│   └────────┬────────┘       │ - Category          │       └─────────────┘  │
│            │                │ - HasAttachment     │                         │
│            │                │ - ActionUrl         │                         │
│            │                └─────────────────────┘                         │
│            │                           │                                    │
│            v                           v                                    │
│   ┌─────────────────┐       ┌─────────────────────┐                         │
│   │ HRB_UPLOAD_LOG  │       │  Bell Icon (UI)     │                         │
│   │                 │       │                     │                         │
│   │ - Id (PK)       │       │ - Badge Count       │                         │
│   │ - Seq           │       │ - Dropdown List     │                         │
│   │ - RefType       │       │ - Click → Navigate  │                         │
│   │ - RefId (FK)    │       │ - View Attachment   │                         │
│   │ - FileData      │       └─────────────────────┘                         │
│   └─────────────────┘                                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Database Design

### 1.1 New Table: `HRB_PE_NOTIFICATION`

#### Entity Class
**File:** `Models/PE/HRB_PE_NOTIFICATION.cs`

```csharp
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HCBPCoreUI_Backend.Models.PE
{
    /// <summary>
    /// PE Notification - แจ้งเตือนการ Movement ที่ต้องอนุมัติ
    /// </summary>
    [Table("HRB_PE_NOTIFICATION", Schema = "HRBUDGET")]
    public class HRB_PE_NOTIFICATION
    {
        /// <summary>
        /// Primary Key
        /// </summary>
        [Key]
        [Column("NOTIFICATION_ID")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int NotificationId { get; set; }

        // ===== Reference to Movement =====

        /// <summary>
        /// FK to HRB_PE_MOVEMENT.Id
        /// </summary>
        [Column("MOVEMENT_ID")]
        public int MovementId { get; set; }

        // ===== Notification Type & Category =====

        /// <summary>
        /// Type: MOVE_IN_REQUEST, MOVE_APPROVED, MOVE_REJECTED, 
        ///       ADDITIONAL_REQUEST, ADDITIONAL_APPROVED, ADDITIONAL_REJECTED
        /// </summary>
        [Column("NOTIFICATION_TYPE")]
        [StringLength(50)]
        [Required]
        public string NotificationType { get; set; } = string.Empty;

        /// <summary>
        /// Category: PE_MOVEMENT, PE_ADDITIONAL, BUDGET_APPROVAL, SYSTEM
        /// </summary>
        [Column("NOTIFICATION_CATEGORY")]
        [StringLength(50)]
        [Required]
        public string NotificationCategory { get; set; } = string.Empty;

        // ===== Recipient Info =====

        /// <summary>
        /// ผู้รับ Notification (Employee Code)
        /// </summary>
        [Column("RECIPIENT_EMP_CODE")]
        [StringLength(100)]
        [Required]
        public string RecipientEmpCode { get; set; } = string.Empty;

        /// <summary>
        /// Cost Center ที่ผู้รับดูแล
        /// </summary>
        [Column("RECIPIENT_COST_CENTER")]
        [StringLength(50)]
        public string? RecipientCostCenter { get; set; }

        // ===== Sender Info =====

        /// <summary>
        /// ผู้ส่ง Notification (Employee Code)
        /// </summary>
        [Column("SENDER_EMP_CODE")]
        [StringLength(100)]
        [Required]
        public string SenderEmpCode { get; set; } = string.Empty;

        /// <summary>
        /// Cost Center ของผู้ส่ง
        /// </summary>
        [Column("SENDER_COST_CENTER")]
        [StringLength(50)]
        public string? SenderCostCenter { get; set; }

        // ===== Content =====

        /// <summary>
        /// หัวข้อ Notification
        /// </summary>
        [Column("TITLE")]
        [StringLength(200)]
        [Required]
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// รายละเอียด
        /// </summary>
        [Column("MESSAGE")]
        [StringLength(1000)]
        public string? Message { get; set; }

        // ===== Movement Details (Denormalized for display) =====

        /// <summary>
        /// HC ที่ขอ Move
        /// </summary>
        [Column("HC")]
        public int Hc { get; set; }

        /// <summary>
        /// Base+Wage ที่ขอ Move
        /// </summary>
        [Column("BASE_WAGE", TypeName = "decimal(18,2)")]
        public decimal BaseWage { get; set; }

        /// <summary>
        /// เดือน PE
        /// </summary>
        [Column("PE_MONTH")]
        public int PeMonth { get; set; }

        /// <summary>
        /// ปี PE
        /// </summary>
        [Column("PE_YEAR")]
        public int PeYear { get; set; }

        /// <summary>
        /// Company ID
        /// </summary>
        [Column("COMPANY_ID")]
        public int CompanyId { get; set; }

        // ===== Action URL =====

        /// <summary>
        /// URL สำหรับ Navigate ไปหน้าที่เกี่ยวข้อง
        /// </summary>
        [Column("ACTION_URL")]
        [StringLength(500)]
        public string? ActionUrl { get; set; }

        /// <summary>
        /// JSON Data สำหรับ Context เพิ่มเติม
        /// </summary>
        [Column("ACTION_DATA")]
        public string? ActionData { get; set; }

        // ===== Email Reference =====

        /// <summary>
        /// FK to HRB_EMAIL_LOG.EmailId
        /// </summary>
        [Column("EMAIL_LOG_ID")]
        public int? EmailLogId { get; set; }

        /// <summary>
        /// ส่ง Email แล้วหรือยัง
        /// </summary>
        [Column("EMAIL_SENT")]
        public bool EmailSent { get; set; } = false;

        /// <summary>
        /// วันที่ส่ง Email
        /// </summary>
        [Column("EMAIL_SENT_DATE")]
        public DateTime? EmailSentDate { get; set; }

        // ===== Upload Reference =====

        /// <summary>
        /// มีไฟล์แนบหรือไม่
        /// </summary>
        [Column("HAS_ATTACHMENT")]
        public bool HasAttachment { get; set; } = false;

        /// <summary>
        /// FK to HRB_UPLOAD_LOG.Id
        /// </summary>
        [Column("UPLOAD_LOG_ID")]
        public int? UploadLogId { get; set; }

        // ===== Status =====

        /// <summary>
        /// อ่านแล้วหรือยัง
        /// </summary>
        [Column("IS_READ")]
        public bool IsRead { get; set; } = false;

        /// <summary>
        /// วันที่อ่าน
        /// </summary>
        [Column("READ_DATE")]
        public DateTime? ReadDate { get; set; }

        /// <summary>
        /// Active Status
        /// </summary>
        [Column("IS_ACTIVE")]
        public bool IsActive { get; set; } = true;

        // ===== Timestamps =====

        /// <summary>
        /// วันที่สร้าง
        /// </summary>
        [Column("CREATED_DATE")]
        public DateTime CreatedDate { get; set; } = DateTime.Now;

        /// <summary>
        /// ผู้สร้าง
        /// </summary>
        [Column("CREATED_BY")]
        [StringLength(100)]
        public string? CreatedBy { get; set; }
    }
}
```

#### SQL Script
```sql
-- Create HRB_PE_NOTIFICATION Table
CREATE TABLE [HRBUDGET].[HRB_PE_NOTIFICATION] (
    [NOTIFICATION_ID] INT IDENTITY(1,1) NOT NULL,
    [MOVEMENT_ID] INT NOT NULL,
    [NOTIFICATION_TYPE] NVARCHAR(50) NOT NULL,
    [NOTIFICATION_CATEGORY] NVARCHAR(50) NOT NULL,
    [RECIPIENT_EMP_CODE] NVARCHAR(100) NOT NULL,
    [RECIPIENT_COST_CENTER] NVARCHAR(50) NULL,
    [SENDER_EMP_CODE] NVARCHAR(100) NOT NULL,
    [SENDER_COST_CENTER] NVARCHAR(50) NULL,
    [TITLE] NVARCHAR(200) NOT NULL,
    [MESSAGE] NVARCHAR(1000) NULL,
    [HC] INT NOT NULL DEFAULT 0,
    [BASE_WAGE] DECIMAL(18,2) NOT NULL DEFAULT 0,
    [PE_MONTH] INT NOT NULL,
    [PE_YEAR] INT NOT NULL,
    [COMPANY_ID] INT NOT NULL,
    [ACTION_URL] NVARCHAR(500) NULL,
    [ACTION_DATA] NVARCHAR(MAX) NULL,
    [EMAIL_LOG_ID] INT NULL,
    [EMAIL_SENT] BIT NOT NULL DEFAULT 0,
    [EMAIL_SENT_DATE] DATETIME NULL,
    [HAS_ATTACHMENT] BIT NOT NULL DEFAULT 0,
    [UPLOAD_LOG_ID] INT NULL,
    [IS_READ] BIT NOT NULL DEFAULT 0,
    [READ_DATE] DATETIME NULL,
    [IS_ACTIVE] BIT NOT NULL DEFAULT 1,
    [CREATED_DATE] DATETIME NOT NULL DEFAULT GETDATE(),
    [CREATED_BY] NVARCHAR(100) NULL,
    CONSTRAINT [PK_HRB_PE_NOTIFICATION] PRIMARY KEY CLUSTERED ([NOTIFICATION_ID] ASC)
);

-- Indexes
CREATE NONCLUSTERED INDEX [IX_HRB_PE_NOTIFICATION_Recipient] 
ON [HRBUDGET].[HRB_PE_NOTIFICATION] ([RECIPIENT_EMP_CODE], [IS_READ], [IS_ACTIVE]);

CREATE NONCLUSTERED INDEX [IX_HRB_PE_NOTIFICATION_Movement] 
ON [HRBUDGET].[HRB_PE_NOTIFICATION] ([MOVEMENT_ID]);

CREATE NONCLUSTERED INDEX [IX_HRB_PE_NOTIFICATION_Category] 
ON [HRBUDGET].[HRB_PE_NOTIFICATION] ([NOTIFICATION_CATEGORY], [CREATED_DATE] DESC);
```

---

### 1.2 Update: `HRB_PE_MOVEMENT` - Add Approval Fields

#### Additional Fields
**File:** `Models/PE/HRB_PE_MOVEMENT.cs` (Add these fields)

```csharp
// ===== Approval Workflow Fields =====

/// <summary>
/// สถานะการอนุมัติ: PENDING, APPROVED, REJECTED, AUTO_APPROVED
/// </summary>
[Column("APPROVAL_STATUS")]
[StringLength(50)]
public string? ApprovalStatus { get; set; }

/// <summary>
/// ต้องรอการอนุมัติหรือไม่
/// </summary>
[Column("REQUIRES_APPROVAL")]
public bool RequiresApproval { get; set; } = false;

/// <summary>
/// Cost Center ที่รอการอนุมัติ
/// </summary>
[Column("PENDING_COST_CENTER")]
[StringLength(50)]
public string? PendingCostCenter { get; set; }

/// <summary>
/// User ที่ต้องอนุมัติ (Employee Code)
/// </summary>
[Column("PENDING_EMP_CODE")]
[StringLength(100)]
public string? PendingEmpCode { get; set; }

/// <summary>
/// เหตุผลที่ Reject
/// </summary>
[Column("REJECTED_REASON")]
[StringLength(500)]
public string? RejectedReason { get; set; }

/// <summary>
/// FK to HRB_UPLOAD_LOG.Id (สำหรับ Attachment)
/// </summary>
[Column("UPLOAD_LOG_ID")]
public int? UploadLogId { get; set; }
```

#### SQL Script (ALTER TABLE)
```sql
-- Add Approval Fields to HRB_PE_MOVEMENT
ALTER TABLE [HRBUDGET].[HRB_PE_MOVEMENT] ADD [APPROVAL_STATUS] NVARCHAR(50) NULL;
ALTER TABLE [HRBUDGET].[HRB_PE_MOVEMENT] ADD [REQUIRES_APPROVAL] BIT NOT NULL DEFAULT 0;
ALTER TABLE [HRBUDGET].[HRB_PE_MOVEMENT] ADD [PENDING_COST_CENTER] NVARCHAR(50) NULL;
ALTER TABLE [HRBUDGET].[HRB_PE_MOVEMENT] ADD [PENDING_EMP_CODE] NVARCHAR(100) NULL;
ALTER TABLE [HRBUDGET].[HRB_PE_MOVEMENT] ADD [REJECTED_REASON] NVARCHAR(500) NULL;
ALTER TABLE [HRBUDGET].[HRB_PE_MOVEMENT] ADD [UPLOAD_LOG_ID] INT NULL;

-- Index for pending approvals
CREATE NONCLUSTERED INDEX [IX_HRB_PE_MOVEMENT_Pending] 
ON [HRBUDGET].[HRB_PE_MOVEMENT] ([PENDING_EMP_CODE], [APPROVAL_STATUS])
WHERE [REQUIRES_APPROVAL] = 1;
```

---

### 1.3 Update: `HRB_EMAIL_LOG` - Add Reference Fields

#### Additional Fields
**File:** `Models/Log/HRB_EMAIL_LOG.cs` (Add these fields)

```csharp
/// <summary>
/// Reference Type: PE_NOTIFICATION, PE_MOVEMENT, BUDGET_APPROVAL
/// </summary>
[Column("REF_TYPE")]
[StringLength(50)]
public string? RefType { get; set; }

/// <summary>
/// Reference ID (FK to source record)
/// </summary>
[Column("REF_ID")]
public int? RefId { get; set; }

/// <summary>
/// Email Template Code: PE_MOVE_REQUEST, PE_APPROVED, PE_REJECTED
/// </summary>
[Column("TEMPLATE_CODE")]
[StringLength(50)]
public string? TemplateCode { get; set; }

/// <summary>
/// จำนวนครั้งที่ Retry
/// </summary>
[Column("RETRY_COUNT")]
public int RetryCount { get; set; } = 0;

/// <summary>
/// จำนวนครั้งสูงสุดที่ Retry
/// </summary>
[Column("MAX_RETRY")]
public int MaxRetry { get; set; } = 3;
```

#### SQL Script (ALTER TABLE)
```sql
-- Add Reference Fields to HRB_EMAIL_LOG
ALTER TABLE [HRBUDGET].[HRB_EMAIL_LOG] ADD [REF_TYPE] NVARCHAR(50) NULL;
ALTER TABLE [HRBUDGET].[HRB_EMAIL_LOG] ADD [REF_ID] INT NULL;
ALTER TABLE [HRBUDGET].[HRB_EMAIL_LOG] ADD [TEMPLATE_CODE] NVARCHAR(50) NULL;
ALTER TABLE [HRBUDGET].[HRB_EMAIL_LOG] ADD [RETRY_COUNT] INT NOT NULL DEFAULT 0;
ALTER TABLE [HRBUDGET].[HRB_EMAIL_LOG] ADD [MAX_RETRY] INT NOT NULL DEFAULT 3;

-- Index
CREATE NONCLUSTERED INDEX [IX_HRB_EMAIL_LOG_Ref] 
ON [HRBUDGET].[HRB_EMAIL_LOG] ([REF_TYPE], [REF_ID]);
```

---

### 1.4 Update: `HRB_UPLOAD_LOG` - Add Reference Fields

#### Additional Fields
**File:** `Models/Log/HRB_UPLOAD_LOG.cs` (Add these fields)

```csharp
/// <summary>
/// Reference Type: PE_MOVEMENT, PE_ADDITIONAL, BUDGET
/// </summary>
[Column("REF_TYPE")]
[StringLength(50)]
public string? RefType { get; set; }

/// <summary>
/// Reference ID (FK to source record)
/// </summary>
[Column("REF_ID")]
public int? RefId { get; set; }

/// <summary>
/// File Type: PDF, EXCEL, IMAGE, WORD
/// </summary>
[Column("FILE_TYPE")]
[StringLength(50)]
public string? FileType { get; set; }

/// <summary>
/// MIME Type: application/pdf, image/jpeg, etc.
/// </summary>
[Column("MIME_TYPE")]
[StringLength(100)]
public string? MimeType { get; set; }

/// <summary>
/// Active Status
/// </summary>
[Column("IS_ACTIVE")]
public bool IsActive { get; set; } = true;
```

#### SQL Script (ALTER TABLE)
```sql
-- Add Reference Fields to HRB_UPLOAD_LOG
ALTER TABLE [HRBUDGET].[HRB_UPLOAD_LOG] ADD [REF_TYPE] NVARCHAR(50) NULL;
ALTER TABLE [HRBUDGET].[HRB_UPLOAD_LOG] ADD [REF_ID] INT NULL;
ALTER TABLE [HRBUDGET].[HRB_UPLOAD_LOG] ADD [FILE_TYPE] NVARCHAR(50) NULL;
ALTER TABLE [HRBUDGET].[HRB_UPLOAD_LOG] ADD [MIME_TYPE] NVARCHAR(100) NULL;
ALTER TABLE [HRBUDGET].[HRB_UPLOAD_LOG] ADD [IS_ACTIVE] BIT NOT NULL DEFAULT 1;

-- Index
CREATE NONCLUSTERED INDEX [IX_HRB_UPLOAD_LOG_Ref] 
ON [HRBUDGET].[HRB_UPLOAD_LOG] ([REF_TYPE], [REF_ID]);
```

---

### 1.5 Update: `HRBudgetDbContext.cs`

```csharp
// Add to HRBudgetDbContext.cs

// PE Notification
public DbSet<HRB_PE_NOTIFICATION> HRB_PE_NOTIFICATIONs { get; set; }

// In OnModelCreating method, add:
modelBuilder.Entity<HRB_PE_NOTIFICATION>(entity =>
{
    entity.HasKey(e => e.NotificationId);
    entity.HasIndex(e => new { e.RecipientEmpCode, e.IsRead, e.IsActive });
    entity.HasIndex(e => e.MovementId);
});
```

---

### 1.6 Phase 1 Checklist

| Task | Status | File |
|------|--------|------|
| Create `HRB_PE_NOTIFICATION.cs` | ⬜ TODO | `Models/PE/` |
| Update `HRB_PE_MOVEMENT.cs` | ⬜ TODO | `Models/PE/` |
| Update `HRB_EMAIL_LOG.cs` | ⬜ TODO | `Models/Log/` |
| Update `HRB_UPLOAD_LOG.cs` | ⬜ TODO | `Models/Log/` |
| Update `HRBudgetDbContext.cs` | ⬜ TODO | `Models/` |
| Run SQL Scripts | ⬜ TODO | Database |
| Test EF Migration | ⬜ TODO | - |

---

## Phase 2: Backend Services

### 2.1 DTOs (Data Transfer Objects)

#### NotificationDto.cs
**File:** `DTOs/Notification/NotificationDto.cs`

```csharp
namespace HCBPCoreUI_Backend.DTOs.Notification
{
    /// <summary>
    /// DTO สำหรับแสดง Notification
    /// </summary>
    public class NotificationDto
    {
        public int NotificationId { get; set; }
        public int MovementId { get; set; }
        public string NotificationType { get; set; } = string.Empty;
        public string NotificationCategory { get; set; } = string.Empty;
        
        // Sender Info
        public string SenderEmpCode { get; set; } = string.Empty;
        public string? SenderName { get; set; }
        public string? SenderCostCenter { get; set; }
        
        // Content
        public string Title { get; set; } = string.Empty;
        public string? Message { get; set; }
        
        // Movement Details
        public int Hc { get; set; }
        public decimal BaseWage { get; set; }
        public int PeMonth { get; set; }
        public int PeYear { get; set; }
        public int CompanyId { get; set; }
        public string? CompanyName { get; set; }
        
        // Action
        public string? ActionUrl { get; set; }
        
        // Status
        public bool IsRead { get; set; }
        public bool HasAttachment { get; set; }
        public bool EmailSent { get; set; }
        
        // Timestamps
        public DateTime CreatedDate { get; set; }
        public string? TimeAgo { get; set; }  // "5 minutes ago", "2 hours ago"
    }

    /// <summary>
    /// DTO สำหรับ Filter Notification
    /// </summary>
    public class NotificationFilterDto
    {
        public string? Category { get; set; }  // PE_MOVEMENT, PE_ADDITIONAL, ALL
        public bool? IsRead { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    /// <summary>
    /// Response สำหรับ List Notifications
    /// </summary>
    public class NotificationListResponse
    {
        public List<NotificationDto> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int UnreadCount { get; set; }
        public Dictionary<string, int> CountByCategory { get; set; } = new();
    }

    /// <summary>
    /// DTO สำหรับ Count by Category
    /// </summary>
    public class NotificationCountDto
    {
        public int TotalUnread { get; set; }
        public int PeMovement { get; set; }
        public int PeAdditional { get; set; }
        public int BudgetApproval { get; set; }
        public int System { get; set; }
    }
}
```

#### RejectRequest.cs
**File:** `DTOs/Notification/RejectRequest.cs`

```csharp
namespace HCBPCoreUI_Backend.DTOs.Notification
{
    /// <summary>
    /// Request สำหรับ Reject Movement
    /// </summary>
    public class RejectRequest
    {
        public int MovementId { get; set; }
        public string Reason { get; set; } = string.Empty;
    }
}
```

#### ApproveRequest.cs
**File:** `DTOs/Notification/ApproveRequest.cs`

```csharp
namespace HCBPCoreUI_Backend.DTOs.Notification
{
    /// <summary>
    /// Request สำหรับ Approve Movement
    /// </summary>
    public class ApproveRequest
    {
        public int MovementId { get; set; }
        public string? Remark { get; set; }
    }
}
```

---

### 2.2 Service Interface: INotificationService

**File:** `Services/INotificationService.cs`

```csharp
using HCBPCoreUI_Backend.DTOs.Notification;

namespace HCBPCoreUI_Backend.Services
{
    public interface INotificationService
    {
        // ===== Query Methods =====
        
        /// <summary>
        /// ดึงจำนวน Notification ที่ยังไม่อ่าน
        /// </summary>
        Task<int> GetUnreadCountAsync(string empCode);
        
        /// <summary>
        /// ดึงจำนวน Notification แยกตาม Category
        /// </summary>
        Task<NotificationCountDto> GetCountByCategoryAsync(string empCode);
        
        /// <summary>
        /// ดึงรายการ Notification
        /// </summary>
        Task<NotificationListResponse> GetNotificationsAsync(string empCode, NotificationFilterDto filter);
        
        /// <summary>
        /// ดึง Notification ตาม ID
        /// </summary>
        Task<NotificationDto?> GetNotificationByIdAsync(int notificationId);

        // ===== Action Methods =====
        
        /// <summary>
        /// Mark notification as read
        /// </summary>
        Task<bool> MarkAsReadAsync(int notificationId, string empCode);
        
        /// <summary>
        /// Mark all notifications as read
        /// </summary>
        Task<int> MarkAllAsReadAsync(string empCode);

        // ===== Create Methods =====
        
        /// <summary>
        /// สร้าง Notification สำหรับ Movement Request
        /// </summary>
        Task<int> CreateMovementNotificationAsync(CreateMovementNotificationRequest request);
        
        /// <summary>
        /// สร้าง Notification สำหรับ Approval Result
        /// </summary>
        Task<int> CreateApprovalResultNotificationAsync(int movementId, bool approved, string? reason = null);
    }

    /// <summary>
    /// Request สำหรับสร้าง Movement Notification
    /// </summary>
    public class CreateMovementNotificationRequest
    {
        public int MovementId { get; set; }
        public string NotificationType { get; set; } = string.Empty;  // MOVE_IN_REQUEST, ADDITIONAL_REQUEST
        public string NotificationCategory { get; set; } = string.Empty;  // PE_MOVEMENT, PE_ADDITIONAL
        public string SenderEmpCode { get; set; } = string.Empty;
        public string SenderCostCenter { get; set; } = string.Empty;
        public string RecipientEmpCode { get; set; } = string.Empty;
        public string RecipientCostCenter { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Message { get; set; }
        public int Hc { get; set; }
        public decimal BaseWage { get; set; }
        public int PeMonth { get; set; }
        public int PeYear { get; set; }
        public int CompanyId { get; set; }
        public bool HasAttachment { get; set; }
        public int? UploadLogId { get; set; }
        public bool SendEmail { get; set; } = true;
    }
}
```

---

### 2.3 Service Implementation: NotificationService

**File:** `Services/NotificationService.cs`

```csharp
using HCBPCoreUI_Backend.DTOs.Notification;
using HCBPCoreUI_Backend.Models;
using HCBPCoreUI_Backend.Models.PE;
using Microsoft.EntityFrameworkCore;

namespace HCBPCoreUI_Backend.Services
{
    public class NotificationService : INotificationService
    {
        private readonly HRBudgetDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            HRBudgetDbContext context,
            IEmailService emailService,
            ILogger<NotificationService> logger)
        {
            _context = context;
            _emailService = emailService;
            _logger = logger;
        }

        #region Query Methods

        public async Task<int> GetUnreadCountAsync(string empCode)
        {
            return await _context.HRB_PE_NOTIFICATIONs
                .CountAsync(n => n.RecipientEmpCode == empCode 
                              && !n.IsRead 
                              && n.IsActive);
        }

        public async Task<NotificationCountDto> GetCountByCategoryAsync(string empCode)
        {
            var counts = await _context.HRB_PE_NOTIFICATIONs
                .Where(n => n.RecipientEmpCode == empCode && !n.IsRead && n.IsActive)
                .GroupBy(n => n.NotificationCategory)
                .Select(g => new { Category = g.Key, Count = g.Count() })
                .ToListAsync();

            return new NotificationCountDto
            {
                TotalUnread = counts.Sum(c => c.Count),
                PeMovement = counts.FirstOrDefault(c => c.Category == "PE_MOVEMENT")?.Count ?? 0,
                PeAdditional = counts.FirstOrDefault(c => c.Category == "PE_ADDITIONAL")?.Count ?? 0,
                BudgetApproval = counts.FirstOrDefault(c => c.Category == "BUDGET_APPROVAL")?.Count ?? 0,
                System = counts.FirstOrDefault(c => c.Category == "SYSTEM")?.Count ?? 0
            };
        }

        public async Task<NotificationListResponse> GetNotificationsAsync(string empCode, NotificationFilterDto filter)
        {
            var query = _context.HRB_PE_NOTIFICATIONs
                .Where(n => n.RecipientEmpCode == empCode && n.IsActive);

            // Filter by category
            if (!string.IsNullOrEmpty(filter.Category) && filter.Category != "ALL")
            {
                query = query.Where(n => n.NotificationCategory == filter.Category);
            }

            // Filter by read status
            if (filter.IsRead.HasValue)
            {
                query = query.Where(n => n.IsRead == filter.IsRead.Value);
            }

            var totalCount = await query.CountAsync();
            var unreadCount = await query.CountAsync(n => !n.IsRead);

            var items = await query
                .OrderByDescending(n => n.CreatedDate)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(n => new NotificationDto
                {
                    NotificationId = n.NotificationId,
                    MovementId = n.MovementId,
                    NotificationType = n.NotificationType,
                    NotificationCategory = n.NotificationCategory,
                    SenderEmpCode = n.SenderEmpCode,
                    SenderCostCenter = n.SenderCostCenter,
                    Title = n.Title,
                    Message = n.Message,
                    Hc = n.Hc,
                    BaseWage = n.BaseWage,
                    PeMonth = n.PeMonth,
                    PeYear = n.PeYear,
                    CompanyId = n.CompanyId,
                    ActionUrl = n.ActionUrl,
                    IsRead = n.IsRead,
                    HasAttachment = n.HasAttachment,
                    EmailSent = n.EmailSent,
                    CreatedDate = n.CreatedDate,
                    TimeAgo = GetTimeAgo(n.CreatedDate)
                })
                .ToListAsync();

            // Get count by category
            var countByCategory = await _context.HRB_PE_NOTIFICATIONs
                .Where(n => n.RecipientEmpCode == empCode && !n.IsRead && n.IsActive)
                .GroupBy(n => n.NotificationCategory)
                .Select(g => new { Category = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Category, x => x.Count);

            return new NotificationListResponse
            {
                Items = items,
                TotalCount = totalCount,
                UnreadCount = unreadCount,
                CountByCategory = countByCategory
            };
        }

        public async Task<NotificationDto?> GetNotificationByIdAsync(int notificationId)
        {
            var n = await _context.HRB_PE_NOTIFICATIONs
                .FirstOrDefaultAsync(x => x.NotificationId == notificationId);

            if (n == null) return null;

            return new NotificationDto
            {
                NotificationId = n.NotificationId,
                MovementId = n.MovementId,
                NotificationType = n.NotificationType,
                NotificationCategory = n.NotificationCategory,
                SenderEmpCode = n.SenderEmpCode,
                SenderCostCenter = n.SenderCostCenter,
                Title = n.Title,
                Message = n.Message,
                Hc = n.Hc,
                BaseWage = n.BaseWage,
                PeMonth = n.PeMonth,
                PeYear = n.PeYear,
                CompanyId = n.CompanyId,
                ActionUrl = n.ActionUrl,
                IsRead = n.IsRead,
                HasAttachment = n.HasAttachment,
                EmailSent = n.EmailSent,
                CreatedDate = n.CreatedDate,
                TimeAgo = GetTimeAgo(n.CreatedDate)
            };
        }

        #endregion

        #region Action Methods

        public async Task<bool> MarkAsReadAsync(int notificationId, string empCode)
        {
            var notification = await _context.HRB_PE_NOTIFICATIONs
                .FirstOrDefaultAsync(n => n.NotificationId == notificationId 
                                       && n.RecipientEmpCode == empCode);

            if (notification == null) return false;

            notification.IsRead = true;
            notification.ReadDate = DateTime.Now;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<int> MarkAllAsReadAsync(string empCode)
        {
            var notifications = await _context.HRB_PE_NOTIFICATIONs
                .Where(n => n.RecipientEmpCode == empCode && !n.IsRead && n.IsActive)
                .ToListAsync();

            foreach (var n in notifications)
            {
                n.IsRead = true;
                n.ReadDate = DateTime.Now;
            }

            await _context.SaveChangesAsync();
            return notifications.Count;
        }

        #endregion

        #region Create Methods

        public async Task<int> CreateMovementNotificationAsync(CreateMovementNotificationRequest request)
        {
            var notification = new HRB_PE_NOTIFICATION
            {
                MovementId = request.MovementId,
                NotificationType = request.NotificationType,
                NotificationCategory = request.NotificationCategory,
                SenderEmpCode = request.SenderEmpCode,
                SenderCostCenter = request.SenderCostCenter,
                RecipientEmpCode = request.RecipientEmpCode,
                RecipientCostCenter = request.RecipientCostCenter,
                Title = request.Title,
                Message = request.Message,
                Hc = request.Hc,
                BaseWage = request.BaseWage,
                PeMonth = request.PeMonth,
                PeYear = request.PeYear,
                CompanyId = request.CompanyId,
                HasAttachment = request.HasAttachment,
                UploadLogId = request.UploadLogId,
                ActionUrl = $"/Home/BudgetPEManagement?movementId={request.MovementId}&highlight=true",
                CreatedDate = DateTime.Now,
                CreatedBy = request.SenderEmpCode
            };

            _context.HRB_PE_NOTIFICATIONs.Add(notification);
            await _context.SaveChangesAsync();

            // Send email if requested
            if (request.SendEmail)
            {
                try
                {
                    var emailLogId = await _emailService.SendNotificationEmailAsync(
                        new NotificationEmailRequest
                        {
                            NotificationId = notification.NotificationId,
                            TemplateCode = GetEmailTemplateCode(request.NotificationType),
                            RecipientEmpCode = request.RecipientEmpCode
                        });

                    notification.EmailLogId = emailLogId;
                    notification.EmailSent = true;
                    notification.EmailSentDate = DateTime.Now;
                    await _context.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send notification email for NotificationId: {Id}", 
                        notification.NotificationId);
                }
            }

            return notification.NotificationId;
        }

        public async Task<int> CreateApprovalResultNotificationAsync(int movementId, bool approved, string? reason = null)
        {
            var movement = await _context.HRB_PE_MOVEMENTs.FindAsync(movementId);
            if (movement == null)
                throw new ArgumentException("Movement not found", nameof(movementId));

            var notificationType = approved ? "MOVE_APPROVED" : "MOVE_REJECTED";
            var title = approved 
                ? $"Move In Request Approved" 
                : $"Move In Request Rejected";
            var message = approved
                ? $"Your move request has been approved."
                : $"Your move request has been rejected. Reason: {reason}";

            var notification = new HRB_PE_NOTIFICATION
            {
                MovementId = movementId,
                NotificationType = notificationType,
                NotificationCategory = "PE_MOVEMENT",
                SenderEmpCode = movement.ApprovedBy ?? "SYSTEM",
                RecipientEmpCode = movement.UpdatedBy ?? string.Empty,
                Title = title,
                Message = message,
                Hc = movement.MoveOutHc ?? movement.MoveInHc ?? 0,
                BaseWage = movement.MoveOutBaseWage ?? movement.MoveInBaseWage ?? 0,
                PeMonth = int.Parse(movement.MoveOutMonth ?? movement.MoveInMonth ?? "0"),
                PeYear = int.Parse(movement.MoveOutYear ?? movement.MoveInYear ?? "0"),
                ActionUrl = $"/Home/BudgetPEManagement?movementId={movementId}",
                CreatedDate = DateTime.Now
            };

            _context.HRB_PE_NOTIFICATIONs.Add(notification);
            await _context.SaveChangesAsync();

            return notification.NotificationId;
        }

        #endregion

        #region Helper Methods

        private static string GetTimeAgo(DateTime dateTime)
        {
            var timeSpan = DateTime.Now - dateTime;

            if (timeSpan.TotalMinutes < 1)
                return "Just now";
            if (timeSpan.TotalMinutes < 60)
                return $"{(int)timeSpan.TotalMinutes} minutes ago";
            if (timeSpan.TotalHours < 24)
                return $"{(int)timeSpan.TotalHours} hours ago";
            if (timeSpan.TotalDays < 7)
                return $"{(int)timeSpan.TotalDays} days ago";
            if (timeSpan.TotalDays < 30)
                return $"{(int)(timeSpan.TotalDays / 7)} weeks ago";

            return dateTime.ToString("dd MMM yyyy");
        }

        private static string GetEmailTemplateCode(string notificationType)
        {
            return notificationType switch
            {
                "MOVE_IN_REQUEST" => "PE_MOVE_REQUEST",
                "ADDITIONAL_REQUEST" => "PE_ADDITIONAL_REQUEST",
                "MOVE_APPROVED" => "PE_APPROVED",
                "MOVE_REJECTED" => "PE_REJECTED",
                _ => "PE_NOTIFICATION"
            };
        }

        #endregion
    }
}
```

---

### 2.4 Service Interface: IEmailService

**File:** `Services/IEmailService.cs`

```csharp
namespace HCBPCoreUI_Backend.Services
{
    public interface IEmailService
    {
        /// <summary>
        /// ส่ง Email สำหรับ Notification
        /// </summary>
        Task<int> SendNotificationEmailAsync(NotificationEmailRequest request);
        
        /// <summary>
        /// ส่ง Email ที่ล้มเหลวอีกครั้ง
        /// </summary>
        Task<bool> ResendFailedEmailAsync(int emailLogId);
        
        /// <summary>
        /// ดึงสถานะ Email
        /// </summary>
        Task<EmailStatusDto> GetEmailStatusAsync(int emailLogId);
    }

    public class NotificationEmailRequest
    {
        public int NotificationId { get; set; }
        public string TemplateCode { get; set; } = string.Empty;
        public string RecipientEmpCode { get; set; } = string.Empty;
        public string? ToEmail { get; set; }  // Override email if provided
        public List<int>? AttachmentUploadIds { get; set; }
    }

    public class EmailStatusDto
    {
        public int EmailLogId { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? SentDate { get; set; }
        public string? ErrorMessage { get; set; }
        public int RetryCount { get; set; }
    }
}
```

---

### 2.5 Service Interface: IUploadService

**File:** `Services/IUploadService.cs`

```csharp
using Microsoft.AspNetCore.Http;

namespace HCBPCoreUI_Backend.Services
{
    public interface IUploadService
    {
        /// <summary>
        /// Upload files
        /// </summary>
        Task<List<UploadResult>> UploadFilesAsync(UploadRequest request);
        
        /// <summary>
        /// Get single file
        /// </summary>
        Task<UploadFileDto?> GetFileAsync(int uploadId, int seq);
        
        /// <summary>
        /// Get files by reference
        /// </summary>
        Task<List<UploadFileDto>> GetFilesByRefAsync(string refType, int refId);
        
        /// <summary>
        /// Delete file
        /// </summary>
        Task<bool> DeleteFileAsync(int uploadId, int seq);
    }

    public class UploadRequest
    {
        public string RefType { get; set; } = string.Empty;  // PE_MOVEMENT, PE_ADDITIONAL
        public int RefId { get; set; }
        public List<IFormFile> Files { get; set; } = new();
        public string UploadedBy { get; set; } = string.Empty;
    }

    public class UploadResult
    {
        public int UploadId { get; set; }
        public int Seq { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FileSize { get; set; } = string.Empty;
        public bool Success { get; set; }
        public string? ErrorMessage { get; set; }
    }

    public class UploadFileDto
    {
        public int UploadId { get; set; }
        public int Seq { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FileSize { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty;
        public string MimeType { get; set; } = string.Empty;
        public byte[]? FileData { get; set; }
        public DateTime UploadedDate { get; set; }
        public string UploadedBy { get; set; } = string.Empty;
    }
}
```

---

### 2.6 Phase 2 Checklist

| Task | Status | File |
|------|--------|------|
| Create `NotificationDto.cs` | ⬜ TODO | `DTOs/Notification/` |
| Create `RejectRequest.cs` | ⬜ TODO | `DTOs/Notification/` |
| Create `ApproveRequest.cs` | ⬜ TODO | `DTOs/Notification/` |
| Create `INotificationService.cs` | ⬜ TODO | `Services/` |
| Create `NotificationService.cs` | ⬜ TODO | `Services/` |
| Create `IEmailService.cs` | ⬜ TODO | `Services/` |
| Create `EmailService.cs` | ⬜ TODO | `Services/` |
| Create `IUploadService.cs` | ⬜ TODO | `Services/` |
| Create `UploadService.cs` | ⬜ TODO | `Services/` |
| Register services in `Program.cs` | ⬜ TODO | `Program.cs` |

---

## Phase 3: API Endpoints

### 3.1 NotificationController

**File:** `Controllers/NotificationController.cs`

```csharp
using HCBPCoreUI_Backend.DTOs.Notification;
using HCBPCoreUI_Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace HCBPCoreUI_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly ILogger<NotificationController> _logger;

        public NotificationController(
            INotificationService notificationService,
            ILogger<NotificationController> logger)
        {
            _notificationService = notificationService;
            _logger = logger;
        }

        /// <summary>
        /// GET: api/notification/count
        /// ดึงจำนวน Notification ที่ยังไม่อ่าน
        /// </summary>
        [HttpGet("count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            try
            {
                // TODO: Get empCode from JWT/Session
                var empCode = GetCurrentUserEmpCode();
                var count = await _notificationService.GetUnreadCountAsync(empCode);
                
                return Ok(new { success = true, count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting unread count");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// GET: api/notification/count-by-category
        /// ดึงจำนวน Notification แยกตาม Category
        /// </summary>
        [HttpGet("count-by-category")]
        public async Task<IActionResult> GetCountByCategory()
        {
            try
            {
                var empCode = GetCurrentUserEmpCode();
                var counts = await _notificationService.GetCountByCategoryAsync(empCode);
                
                return Ok(new { success = true, data = counts });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting count by category");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// GET: api/notification/list
        /// ดึงรายการ Notification
        /// </summary>
        [HttpGet("list")]
        public async Task<IActionResult> GetNotifications([FromQuery] NotificationFilterDto filter)
        {
            try
            {
                var empCode = GetCurrentUserEmpCode();
                var result = await _notificationService.GetNotificationsAsync(empCode, filter);
                
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notifications");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// GET: api/notification/{id}
        /// ดึง Notification ตาม ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetNotification(int id)
        {
            try
            {
                var notification = await _notificationService.GetNotificationByIdAsync(id);
                
                if (notification == null)
                    return NotFound(new { success = false, message = "Notification not found" });
                
                return Ok(new { success = true, data = notification });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notification {Id}", id);
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// POST: api/notification/read/{id}
        /// Mark notification as read
        /// </summary>
        [HttpPost("read/{id}")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            try
            {
                var empCode = GetCurrentUserEmpCode();
                var result = await _notificationService.MarkAsReadAsync(id, empCode);
                
                if (!result)
                    return NotFound(new { success = false, message = "Notification not found" });
                
                return Ok(new { success = true, message = "Marked as read" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking notification {Id} as read", id);
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// POST: api/notification/read-all
        /// Mark all notifications as read
        /// </summary>
        [HttpPost("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            try
            {
                var empCode = GetCurrentUserEmpCode();
                var count = await _notificationService.MarkAllAsReadAsync(empCode);
                
                return Ok(new { success = true, message = $"Marked {count} notifications as read" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking all notifications as read");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Helper: Get current user's employee code
        /// </summary>
        private string GetCurrentUserEmpCode()
        {
            // TODO: Implement based on authentication system
            // Example: return User.FindFirst("emp_code")?.Value ?? "UNKNOWN";
            return HttpContext.Session.GetString("EmpCode") ?? "UNKNOWN";
        }
    }
}
```

---

### 3.2 Update PEManagementController - Add Approval Endpoints

**File:** `Controllers/PEManagementController.cs` (Add these methods)

```csharp
// Add these methods to existing PEManagementController

/// <summary>
/// GET: api/pemanagement/pending
/// ดึงรายการ Movement ที่รอ Approve
/// </summary>
[HttpGet("pending")]
public async Task<IActionResult> GetPendingMovements()
{
    try
    {
        var empCode = GetCurrentUserEmpCode();
        var result = await _peManagementService.GetPendingMovementsAsync(empCode);
        
        return Ok(new { success = true, data = result });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error getting pending movements");
        return StatusCode(500, new { success = false, message = ex.Message });
    }
}

/// <summary>
/// POST: api/pemanagement/movement/approve/{movementId}
/// Approve Movement Request
/// </summary>
[HttpPost("movement/approve/{movementId}")]
public async Task<IActionResult> ApproveMovement(int movementId, [FromBody] ApproveRequest? request)
{
    try
    {
        var empCode = GetCurrentUserEmpCode();
        var result = await _peManagementService.ApproveMovementAsync(movementId, empCode, request?.Remark);
        
        if (!result.Success)
            return BadRequest(new { success = false, message = result.Message });
        
        return Ok(new { success = true, message = "Movement approved successfully" });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error approving movement {Id}", movementId);
        return StatusCode(500, new { success = false, message = ex.Message });
    }
}

/// <summary>
/// POST: api/pemanagement/movement/reject/{movementId}
/// Reject Movement Request
/// </summary>
[HttpPost("movement/reject/{movementId}")]
public async Task<IActionResult> RejectMovement(int movementId, [FromBody] RejectRequest request)
{
    try
    {
        if (string.IsNullOrWhiteSpace(request.Reason))
            return BadRequest(new { success = false, message = "Rejection reason is required" });

        var empCode = GetCurrentUserEmpCode();
        var result = await _peManagementService.RejectMovementAsync(movementId, empCode, request.Reason);
        
        if (!result.Success)
            return BadRequest(new { success = false, message = result.Message });
        
        return Ok(new { success = true, message = "Movement rejected" });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error rejecting movement {Id}", movementId);
        return StatusCode(500, new { success = false, message = ex.Message });
    }
}

/// <summary>
/// GET: api/pemanagement/movement/{movementId}/attachments
/// ดึงรายการไฟล์แนบของ Movement
/// </summary>
[HttpGet("movement/{movementId}/attachments")]
public async Task<IActionResult> GetMovementAttachments(int movementId)
{
    try
    {
        var files = await _uploadService.GetFilesByRefAsync("PE_MOVEMENT", movementId);
        return Ok(new { success = true, data = files });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error getting attachments for movement {Id}", movementId);
        return StatusCode(500, new { success = false, message = ex.Message });
    }
}
```

---

### 3.3 UploadController

**File:** `Controllers/UploadController.cs`

```csharp
using HCBPCoreUI_Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace HCBPCoreUI_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UploadController : ControllerBase
    {
        private readonly IUploadService _uploadService;
        private readonly ILogger<UploadController> _logger;
        private const int MaxFileSize = 4 * 1024 * 1024; // 4MB

        public UploadController(
            IUploadService uploadService,
            ILogger<UploadController> logger)
        {
            _uploadService = uploadService;
            _logger = logger;
        }

        /// <summary>
        /// POST: api/upload/files
        /// Upload files
        /// </summary>
        [HttpPost("files")]
        public async Task<IActionResult> UploadFiles([FromForm] UploadFilesRequest request)
        {
            try
            {
                if (request.Files == null || !request.Files.Any())
                    return BadRequest(new { success = false, message = "No files provided" });

                // Validate file sizes
                foreach (var file in request.Files)
                {
                    if (file.Length > MaxFileSize)
                        return BadRequest(new { 
                            success = false, 
                            message = $"File {file.FileName} exceeds maximum size of 4MB" 
                        });
                }

                var empCode = GetCurrentUserEmpCode();
                var result = await _uploadService.UploadFilesAsync(new UploadRequest
                {
                    RefType = request.RefType,
                    RefId = request.RefId,
                    Files = request.Files.ToList(),
                    UploadedBy = empCode
                });

                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading files");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// GET: api/upload/files/{refType}/{refId}
        /// Get files by reference
        /// </summary>
        [HttpGet("files/{refType}/{refId}")]
        public async Task<IActionResult> GetFilesByRef(string refType, int refId)
        {
            try
            {
                var files = await _uploadService.GetFilesByRefAsync(refType, refId);
                return Ok(new { success = true, data = files });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting files for {RefType}/{RefId}", refType, refId);
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// GET: api/upload/file/{uploadId}/{seq}
        /// Download single file
        /// </summary>
        [HttpGet("file/{uploadId}/{seq}")]
        public async Task<IActionResult> DownloadFile(int uploadId, int seq)
        {
            try
            {
                var file = await _uploadService.GetFileAsync(uploadId, seq);
                
                if (file == null || file.FileData == null)
                    return NotFound(new { success = false, message = "File not found" });

                return File(file.FileData, file.MimeType, file.FileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading file {UploadId}/{Seq}", uploadId, seq);
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// DELETE: api/upload/file/{uploadId}/{seq}
        /// Delete file
        /// </summary>
        [HttpDelete("file/{uploadId}/{seq}")]
        public async Task<IActionResult> DeleteFile(int uploadId, int seq)
        {
            try
            {
                var result = await _uploadService.DeleteFileAsync(uploadId, seq);
                
                if (!result)
                    return NotFound(new { success = false, message = "File not found" });

                return Ok(new { success = true, message = "File deleted" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting file {UploadId}/{Seq}", uploadId, seq);
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        private string GetCurrentUserEmpCode()
        {
            return HttpContext.Session.GetString("EmpCode") ?? "UNKNOWN";
        }
    }

    public class UploadFilesRequest
    {
        public string RefType { get; set; } = string.Empty;
        public int RefId { get; set; }
        public IFormFileCollection? Files { get; set; }
    }
}
```

---

### 3.4 API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/notification/count` | Get unread notification count |
| `GET` | `/api/notification/count-by-category` | Get counts grouped by category |
| `GET` | `/api/notification/list` | Get notification list (paginated) |
| `GET` | `/api/notification/{id}` | Get single notification |
| `POST` | `/api/notification/read/{id}` | Mark as read |
| `POST` | `/api/notification/read-all` | Mark all as read |
| `GET` | `/api/pemanagement/pending` | Get pending movements |
| `POST` | `/api/pemanagement/movement/approve/{id}` | Approve movement |
| `POST` | `/api/pemanagement/movement/reject/{id}` | Reject movement |
| `GET` | `/api/pemanagement/movement/{id}/attachments` | Get attachments |
| `POST` | `/api/upload/files` | Upload files |
| `GET` | `/api/upload/files/{refType}/{refId}` | Get files by reference |
| `GET` | `/api/upload/file/{uploadId}/{seq}` | Download file |
| `DELETE` | `/api/upload/file/{uploadId}/{seq}` | Delete file |

---

### 3.5 Phase 3 Checklist

| Task | Status | File |
|------|--------|------|
| Create `NotificationController.cs` | ⬜ TODO | `Controllers/` |
| Update `PEManagementController.cs` | ⬜ TODO | `Controllers/` |
| Create `UploadController.cs` | ⬜ TODO | `Controllers/` |
| Test all endpoints with Postman/Swagger | ⬜ TODO | - |

---

## Phase 4: Frontend - Bell Component

### 4.1 Bell Icon HTML Update

**File:** `Views/Shared/_Layout.cshtml` (Update existing bell icon section)

**Location:** Lines 307-315 (ตาม selection ที่ SA ให้มา)

```html
<!-- Replace existing bell icon with this -->
<ul class="header-nav ms-auto">
    <li class="nav-item dropdown">
        <a class="nav-link position-relative" href="#" id="notificationBell" 
           data-coreui-toggle="dropdown" aria-expanded="false">
            <svg class="icon icon-lg">
                <use xlink:href="/lib/adcoreui/icons/svg/free.svg#cil-bell"></use>
            </svg>
            <!-- Badge for unread count -->
            <span class="badge bg-danger position-absolute top-0 start-100 translate-middle rounded-pill d-none" 
                  id="notificationBadge" style="font-size: 0.65rem; padding: 0.25em 0.5em;">
                0
            </span>
        </a>
        
        <!-- Notification Dropdown -->
        <div class="dropdown-menu dropdown-menu-end notification-dropdown shadow" 
             id="notificationDropdown" style="width: 380px; max-height: 480px;">
            
            <!-- Header -->
            <div class="dropdown-header d-flex justify-content-between align-items-center py-2 px-3 bg-light">
                <span class="fw-semibold">
                    <i class="fa-solid fa-bell me-2"></i>Notifications
                </span>
                <a href="#" class="text-decoration-none small" id="markAllReadBtn">
                    <i class="fa-solid fa-check-double me-1"></i>Mark all read
                </a>
            </div>
            
            <!-- Category Tabs -->
            <div class="notification-tabs border-bottom">
                <ul class="nav nav-tabs nav-tabs-sm border-0 px-2" id="notificationTabs">
                    <li class="nav-item">
                        <a class="nav-link active py-2 px-3" href="#" data-category="ALL">
                            All
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link py-2 px-3" href="#" data-category="PE_MOVEMENT">
                            <i class="fa-solid fa-right-left me-1"></i>
                            <span class="badge bg-success rounded-pill ms-1 d-none" id="countMovement">0</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link py-2 px-3" href="#" data-category="PE_ADDITIONAL">
                            <i class="fa-solid fa-user-plus me-1"></i>
                            <span class="badge bg-purple rounded-pill ms-1 d-none" id="countAdditional">0</span>
                        </a>
                    </li>
                </ul>
            </div>
            
            <!-- Notification List -->
            <div class="notification-list" id="notificationList" 
                 style="max-height: 320px; overflow-y: auto;">
                <!-- Loading state -->
                <div class="text-center py-4" id="notificationLoading">
                    <div class="spinner-border spinner-border-sm text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
                <!-- Empty state -->
                <div class="text-center py-4 text-muted d-none" id="notificationEmpty">
                    <i class="fa-regular fa-bell-slash fa-2x mb-2"></i>
                    <p class="mb-0">No notifications</p>
                </div>
                <!-- Items will be rendered here -->
            </div>
            
            <!-- Footer -->
            <div class="dropdown-footer border-top p-2">
                <a href="/Notification" class="btn btn-sm btn-outline-primary w-100">
                    <i class="fa-solid fa-list me-1"></i>View All Notifications
                </a>
            </div>
        </div>
    </li>
</ul>
```

---

### 4.2 Notification CSS

**File:** `wwwroot/css/notification.css`

```css
/* ===== Notification Bell & Dropdown ===== */

/* Badge animation */
#notificationBadge {
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { transform: translate(-50%, -50%) scale(1); }
    50% { transform: translate(-50%, -50%) scale(1.1); }
}

#notificationBadge.d-none {
    animation: none;
}

/* Dropdown styling */
.notification-dropdown {
    padding: 0;
    border-radius: 0.5rem;
}

.notification-dropdown .dropdown-header {
    border-radius: 0.5rem 0.5rem 0 0;
}

/* Tabs */
.notification-tabs .nav-link {
    color: var(--cui-body-color);
    border: none;
    border-bottom: 2px solid transparent;
    font-size: 0.85rem;
}

.notification-tabs .nav-link:hover {
    border-bottom-color: var(--cui-primary);
}

.notification-tabs .nav-link.active {
    color: var(--cui-primary);
    border-bottom-color: var(--cui-primary);
    background: transparent;
}

/* Notification Items */
.notification-item {
    display: flex;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--cui-border-color);
    cursor: pointer;
    transition: background-color 0.15s ease;
    position: relative;
}

.notification-item:hover {
    background-color: var(--cui-tertiary-bg);
}

.notification-item.unread {
    background-color: rgba(var(--cui-primary-rgb), 0.05);
}

.notification-item:last-child {
    border-bottom: none;
}

/* Icon */
.notification-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-right: 0.75rem;
}

/* Content */
.notification-content {
    flex: 1;
    min-width: 0;
}

.notification-title {
    font-weight: 500;
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.notification-message {
    font-size: 0.8rem;
    color: var(--cui-secondary-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 0.25rem;
}

.notification-time {
    font-size: 0.75rem;
    color: var(--cui-tertiary-color);
}

/* Unread dot */
.unread-dot {
    width: 8px;
    height: 8px;
    background-color: var(--cui-primary);
    border-radius: 50%;
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
}

/* Attachment & Email badges */
.notification-title .badge {
    font-size: 0.65rem;
    padding: 0.2em 0.4em;
}

/* Category colors */
.category-pe-movement { background-color: rgba(25, 135, 84, 0.15); color: #198754; }
.category-pe-additional { background-color: rgba(111, 66, 193, 0.15); color: #6f42c1; }
.category-budget-approval { background-color: rgba(13, 110, 253, 0.15); color: #0d6efd; }
.category-system { background-color: rgba(108, 117, 125, 0.15); color: #6c757d; }

/* Custom purple for Additional */
.bg-purple {
    background-color: #6f42c1 !important;
}

/* Scrollbar */
.notification-list::-webkit-scrollbar {
    width: 6px;
}

.notification-list::-webkit-scrollbar-track {
    background: var(--cui-tertiary-bg);
}

.notification-list::-webkit-scrollbar-thumb {
    background-color: var(--cui-border-color);
    border-radius: 3px;
}

/* Dark mode adjustments */
[data-coreui-theme="dark"] .notification-item.unread {
    background-color: rgba(var(--cui-primary-rgb), 0.1);
}

[data-coreui-theme="dark"] .notification-dropdown .dropdown-header {
    background-color: var(--cui-dark-bg-subtle);
}
```

---

### 4.3 Notification JavaScript - Config

**File:** `wwwroot/js/notification/notification.config.js`

```javascript
/**
 * Notification System Configuration
 */
const NOTIFICATION_CONFIG = {
    // API Endpoints
    api: {
        count: '/api/notification/count',
        countByCategory: '/api/notification/count-by-category',
        list: '/api/notification/list',
        markRead: '/api/notification/read',
        markAllRead: '/api/notification/read-all'
    },

    // Polling interval (milliseconds)
    pollInterval: 30000, // 30 seconds

    // Categories configuration
    categories: {
        'PE_MOVEMENT': {
            icon: 'fa-solid fa-right-left',
            color: '#198754',
            bgClass: 'category-pe-movement',
            label: 'PE Movement'
        },
        'PE_ADDITIONAL': {
            icon: 'fa-solid fa-user-plus',
            color: '#6f42c1',
            bgClass: 'category-pe-additional',
            label: 'Additional HC'
        },
        'BUDGET_APPROVAL': {
            icon: 'fa-solid fa-file-invoice-dollar',
            color: '#0d6efd',
            bgClass: 'category-budget-approval',
            label: 'Budget Approval'
        },
        'SYSTEM': {
            icon: 'fa-solid fa-gear',
            color: '#6c757d',
            bgClass: 'category-system',
            label: 'System'
        }
    },

    // Notification types
    types: {
        'MOVE_IN_REQUEST': {
            actionRequired: true,
            icon: 'fa-solid fa-right-to-bracket',
            badgeClass: 'bg-warning'
        },
        'MOVE_APPROVED': {
            actionRequired: false,
            icon: 'fa-solid fa-check',
            badgeClass: 'bg-success'
        },
        'MOVE_REJECTED': {
            actionRequired: false,
            icon: 'fa-solid fa-xmark',
            badgeClass: 'bg-danger'
        },
        'ADDITIONAL_REQUEST': {
            actionRequired: true,
            icon: 'fa-solid fa-user-plus',
            badgeClass: 'bg-warning'
        },
        'ADDITIONAL_APPROVED': {
            actionRequired: false,
            icon: 'fa-solid fa-check',
            badgeClass: 'bg-success'
        },
        'ADDITIONAL_REJECTED': {
            actionRequired: false,
            icon: 'fa-solid fa-xmark',
            badgeClass: 'bg-danger'
        }
    },

    // Email status indicators
    emailStatus: {
        'SENT': { icon: 'fa-solid fa-envelope-circle-check', class: 'text-success' },
        'FAILED': { icon: 'fa-solid fa-envelope-circle-xmark', class: 'text-danger' },
        'PENDING': { icon: 'fa-regular fa-envelope', class: 'text-warning' }
    }
};

// Freeze config to prevent modifications
Object.freeze(NOTIFICATION_CONFIG);
```

---

### 4.4 Notification JavaScript - Main

**File:** `wwwroot/js/notification/notification.js`

```javascript
/**
 * Notification Bell Component
 * Handles notification display, polling, and user interactions
 */
(function() {
    'use strict';

    // State
    let currentCategory = 'ALL';
    let pollTimer = null;
    let isDropdownOpen = false;

    // DOM Elements
    const elements = {
        bell: null,
        badge: null,
        dropdown: null,
        list: null,
        loading: null,
        empty: null,
        tabs: null,
        markAllBtn: null,
        countMovement: null,
        countAdditional: null
    };

    /**
     * Initialize notification system
     */
    function init() {
        // Cache DOM elements
        elements.bell = document.getElementById('notificationBell');
        elements.badge = document.getElementById('notificationBadge');
        elements.dropdown = document.getElementById('notificationDropdown');
        elements.list = document.getElementById('notificationList');
        elements.loading = document.getElementById('notificationLoading');
        elements.empty = document.getElementById('notificationEmpty');
        elements.tabs = document.getElementById('notificationTabs');
        elements.markAllBtn = document.getElementById('markAllReadBtn');
        elements.countMovement = document.getElementById('countMovement');
        elements.countAdditional = document.getElementById('countAdditional');

        if (!elements.bell) {
            console.warn('Notification bell element not found');
            return;
        }

        // Bind events
        bindEvents();

        // Initial load
        updateBadgeCount();

        // Start polling
        startPolling();

        console.log('Notification system initialized');
    }

    /**
     * Bind event listeners
     */
    function bindEvents() {
        // Dropdown show/hide events
        elements.bell.addEventListener('show.coreui.dropdown', () => {
            isDropdownOpen = true;
            loadNotifications();
        });

        elements.bell.addEventListener('hide.coreui.dropdown', () => {
            isDropdownOpen = false;
        });

        // Tab clicks
        if (elements.tabs) {
            elements.tabs.addEventListener('click', (e) => {
                const tab = e.target.closest('[data-category]');
                if (tab) {
                    e.preventDefault();
                    switchCategory(tab.dataset.category);
                }
            });
        }

        // Mark all as read
        if (elements.markAllBtn) {
            elements.markAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                markAllAsRead();
            });
        }

        // Notification item clicks (delegated)
        if (elements.list) {
            elements.list.addEventListener('click', (e) => {
                const item = e.target.closest('.notification-item');
                if (item) {
                    handleNotificationClick(item);
                }
            });
        }
    }

    /**
     * Start polling for new notifications
     */
    function startPolling() {
        if (pollTimer) clearInterval(pollTimer);
        
        pollTimer = setInterval(() => {
            if (!isDropdownOpen) {
                updateBadgeCount();
            }
        }, NOTIFICATION_CONFIG.pollInterval);
    }

    /**
     * Update badge count
     */
    async function updateBadgeCount() {
        try {
            const response = await fetch(NOTIFICATION_CONFIG.api.countByCategory);
            const result = await response.json();

            if (result.success) {
                const data = result.data;
                const total = data.totalUnread;

                // Update main badge
                if (total > 0) {
                    elements.badge.textContent = total > 99 ? '99+' : total;
                    elements.badge.classList.remove('d-none');
                } else {
                    elements.badge.classList.add('d-none');
                }

                // Update category badges
                updateCategoryBadge(elements.countMovement, data.peMovement);
                updateCategoryBadge(elements.countAdditional, data.peAdditional);
            }
        } catch (error) {
            console.error('Failed to update badge count:', error);
        }
    }

    /**
     * Update individual category badge
     */
    function updateCategoryBadge(element, count) {
        if (!element) return;
        
        if (count > 0) {
            element.textContent = count;
            element.classList.remove('d-none');
        } else {
            element.classList.add('d-none');
        }
    }

    /**
     * Load notifications
     */
    async function loadNotifications() {
        showLoading(true);

        try {
            const params = new URLSearchParams({
                category: currentCategory === 'ALL' ? '' : currentCategory,
                page: 1,
                pageSize: 10
            });

            const response = await fetch(`${NOTIFICATION_CONFIG.api.list}?${params}`);
            const result = await response.json();

            if (result.success) {
                renderNotifications(result.data.items);
            } else {
                showError('Failed to load notifications');
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
            showError('Failed to load notifications');
        } finally {
            showLoading(false);
        }
    }

    /**
     * Render notification items
     */
    function renderNotifications(notifications) {
        if (!notifications || notifications.length === 0) {
            elements.list.innerHTML = '';
            elements.empty.classList.remove('d-none');
            return;
        }

        elements.empty.classList.add('d-none');
        elements.list.innerHTML = notifications.map(renderNotificationItem).join('');
    }

    /**
     * Render single notification item
     */
    function renderNotificationItem(notification) {
        const config = NOTIFICATION_CONFIG.categories[notification.notificationCategory] || 
                       NOTIFICATION_CONFIG.categories['SYSTEM'];

        // Attachment badge
        let attachmentBadge = '';
        if (notification.hasAttachment) {
            attachmentBadge = `<span class="badge bg-info" title="มีไฟล์แนบ">
                <i class="fa-solid fa-paperclip"></i>
            </span>`;
        }

        // Email badge
        let emailBadge = '';
        if (notification.emailSent) {
            emailBadge = `<span class="badge bg-success" title="ส่งอีเมลแล้ว">
                <i class="fa-solid fa-envelope-circle-check"></i>
            </span>`;
        }

        return `
            <div class="notification-item ${notification.isRead ? '' : 'unread'}" 
                 data-id="${notification.notificationId}"
                 data-url="${notification.actionUrl || '#'}">
                <div class="notification-icon ${config.bgClass}">
                    <i class="${config.icon}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">
                        ${escapeHtml(notification.title)}
                        ${attachmentBadge}
                        ${emailBadge}
                    </div>
                    <div class="notification-message">${escapeHtml(notification.message || '')}</div>
                    <div class="notification-time">
                        <i class="fa-regular fa-clock me-1"></i>
                        ${notification.timeAgo || formatDate(notification.createdDate)}
                    </div>
                </div>
                ${notification.isRead ? '' : '<div class="unread-dot"></div>'}
            </div>
        `;
    }

    /**
     * Switch category tab
     */
    function switchCategory(category) {
        currentCategory = category;

        // Update active tab
        elements.tabs.querySelectorAll('.nav-link').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === category);
        });

        // Reload notifications
        loadNotifications();
    }

    /**
     * Handle notification click
     */
    async function handleNotificationClick(item) {
        const id = item.dataset.id;
        const url = item.dataset.url;

        // Mark as read
        if (item.classList.contains('unread')) {
            await markAsRead(id);
            item.classList.remove('unread');
            item.querySelector('.unread-dot')?.remove();
            updateBadgeCount();
        }

        // Navigate to action URL
        if (url && url !== '#') {
            window.location.href = url;
        }
    }

    /**
     * Mark single notification as read
     */
    async function markAsRead(id) {
        try {
            await fetch(`${NOTIFICATION_CONFIG.api.markRead}/${id}`, {
                method: 'POST'
            });
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    }

    /**
     * Mark all notifications as read
     */
    async function markAllAsRead() {
        try {
            const response = await fetch(NOTIFICATION_CONFIG.api.markAllRead, {
                method: 'POST'
            });
            const result = await response.json();

            if (result.success) {
                // Update UI
                elements.list.querySelectorAll('.notification-item.unread').forEach(item => {
                    item.classList.remove('unread');
                    item.querySelector('.unread-dot')?.remove();
                });

                // Update badge
                elements.badge.classList.add('d-none');
                updateCategoryBadge(elements.countMovement, 0);
                updateCategoryBadge(elements.countAdditional, 0);
            }
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    }

    /**
     * Show/hide loading state
     */
    function showLoading(show) {
        if (elements.loading) {
            elements.loading.classList.toggle('d-none', !show);
        }
    }

    /**
     * Show error message
     */
    function showError(message) {
        elements.list.innerHTML = `
            <div class="text-center py-4 text-danger">
                <i class="fa-solid fa-triangle-exclamation fa-2x mb-2"></i>
                <p class="mb-0">${escapeHtml(message)}</p>
            </div>
        `;
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Format date
     */
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose for external use
    window.NotificationSystem = {
        refresh: updateBadgeCount,
        loadNotifications: loadNotifications
    };

})();
```

---

### 4.5 Add CSS/JS to _Layout.cshtml

**File:** `Views/Shared/_Layout.cshtml` (Add in `<head>` section)

```html
<!-- Add after other CSS links -->
<link href="~/css/notification.css" rel="stylesheet" asp-append-version="true" />
```

**File:** `Views/Shared/_Layout.cshtml` (Add before closing `</body>`)

```html
<!-- Notification System -->
<script src="~/js/notification/notification.config.js" asp-append-version="true"></script>
<script src="~/js/notification/notification.js" asp-append-version="true"></script>
```

---

### 4.6 Phase 4 Checklist

| Task | Status | File |
|------|--------|------|
| Update Bell Icon HTML in `_Layout.cshtml` | ⬜ TODO | `Views/Shared/` |
| Create `notification.css` | ⬜ TODO | `wwwroot/css/` |
| Create `notification.config.js` | ⬜ TODO | `wwwroot/js/notification/` |
| Create `notification.js` | ⬜ TODO | `wwwroot/js/notification/` |
| Add CSS/JS references | ⬜ TODO | `Views/Shared/_Layout.cshtml` |
| Test dropdown functionality | ⬜ TODO | - |
| Test polling mechanism | ⬜ TODO | - |

---

## Phase 5: Frontend - AG Grid Integration

### 5.1 Update Grid Configuration

**File:** `wwwroot/lib/razor/js/budget-pe-management/budget-pe-management.config.js` (Add)

```javascript
// Add Approval Status Configuration
const PE_APPROVAL_STATUS = {
    PENDING: {
        key: 'PENDING',
        label: 'Pending',
        icon: 'fa-solid fa-clock',
        badgeClass: 'bg-warning text-dark',
        color: '#ffc107'
    },
    APPROVED: {
        key: 'APPROVED',
        label: 'Approved',
        icon: 'fa-solid fa-check',
        badgeClass: 'bg-success',
        color: '#198754'
    },
    REJECTED: {
        key: 'REJECTED',
        label: 'Rejected',
        icon: 'fa-solid fa-xmark',
        badgeClass: 'bg-danger',
        color: '#dc3545'
    },
    AUTO_APPROVED: {
        key: 'AUTO_APPROVED',
        label: 'Auto',
        icon: 'fa-solid fa-bolt',
        badgeClass: 'bg-info',
        color: '#0dcaf0'
    }
};
```

---

### 5.2 Add Approval Status Column

**File:** `wwwroot/lib/razor/js/budget-pe-management/budget-pe-management.grid.js` (Add column)

```javascript
// Add this column definition to columnDefs array
// Position: After Action column or in a suitable location

{
    headerName: 'Approval',
    field: 'approvalStatus',
    width: 110,
    filter: 'agTextColumnFilter',
    cellRenderer: (params) => {
        const status = params.value;
        if (!status) return '';
        
        const config = PE_APPROVAL_STATUS[status];
        if (!config) return status;
        
        return `
            <span class="badge ${config.badgeClass}" style="font-size: 0.75rem;">
                <i class="${config.icon} me-1"></i>${config.label}
            </span>
        `;
    },
    cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' }
},

// Add Pending Move-In indicator column
{
    headerName: '',
    field: 'hasPendingMoveIn',
    width: 50,
    suppressMenu: true,
    sortable: false,
    cellRenderer: (params) => {
        if (params.value) {
            return `
                <span class="text-warning" title="มีรายการรอ Accept">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </span>
            `;
        }
        return '';
    },
    cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' }
}
```

---

### 5.3 Update Action Column with Accept/Reject Buttons

**File:** `wwwroot/lib/razor/js/budget-pe-management/budget-pe-management.grid.js` (Update Action column)

```javascript
// Update existing Action column cellRenderer

{
    headerName: 'Action',
    field: 'action',
    width: 180,
    pinned: 'right',
    suppressMenu: true,
    sortable: false,
    cellRenderer: (params) => {
        const row = params.data;
        let buttons = '';
        
        // Add Movement button (existing)
        buttons += `
            <button class="btn btn-sm btn-outline-primary me-1" 
                    onclick="PEManagement.openMovementOffcanvas(${row.peId})" 
                    title="Add Movement">
                <i class="fa-solid fa-plus"></i>
            </button>
        `;
        
        // History button (existing)
        buttons += `
            <button class="btn btn-sm btn-outline-secondary me-1" 
                    onclick="PEManagement.openHistoryOffcanvas(${row.peId})" 
                    title="View History">
                <i class="fa-solid fa-clock-rotate-left"></i>
            </button>
        `;
        
        // Accept/Reject buttons (NEW - only show if has pending)
        if (row.hasPendingMoveIn && row.pendingMovementId) {
            buttons += `
                <button class="btn btn-sm btn-success me-1" 
                        onclick="PEManagement.approveMovement(${row.pendingMovementId})" 
                        title="Accept Move-In">
                    <i class="fa-solid fa-check"></i>
                </button>
                <button class="btn btn-sm btn-danger" 
                        onclick="PEManagement.showRejectModal(${row.pendingMovementId})" 
                        title="Reject Move-In">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            `;
        }
        
        return `<div class="d-flex align-items-center">${buttons}</div>`;
    }
}
```

---

### 5.4 Row Styling for Pending Items

**File:** `wwwroot/lib/razor/js/budget-pe-management/budget-pe-management.grid.js` (Add to gridOptions)

```javascript
// Add to gridOptions object

getRowStyle: (params) => {
    // Highlight rows with pending move-in requests
    if (params.data && params.data.hasPendingMoveIn) {
        return { 
            backgroundColor: 'rgba(255, 193, 7, 0.15)',  // Light yellow
            borderLeft: '4px solid #ffc107'
        };
    }
    return null;
},

// Optional: Row class rules for more styling options
rowClassRules: {
    'row-pending-approval': (params) => params.data && params.data.hasPendingMoveIn,
    'row-rejected': (params) => params.data && params.data.approvalStatus === 'REJECTED'
}
```

**Add CSS:**
```css
/* In site.css or budget-pe-management styles */
.row-pending-approval {
    animation: pulse-row 2s infinite;
}

@keyframes pulse-row {
    0%, 100% { background-color: rgba(255, 193, 7, 0.1); }
    50% { background-color: rgba(255, 193, 7, 0.2); }
}

.row-rejected {
    opacity: 0.7;
}
```

---

### 5.5 Approval Functions

**File:** `wwwroot/lib/razor/js/budget-pe-management/budget-pe-management.main.js` (Add functions)

```javascript
// Add to PEManagement namespace or module

/**
 * Approve movement request
 */
async function approveMovement(movementId) {
    const result = await Swal.fire({
        title: 'Approve Movement?',
        text: 'ยืนยันการอนุมัติ Move-In request นี้?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#198754',
        confirmButtonText: '<i class="fa-solid fa-check me-1"></i>Approve',
        cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
        showLoading(true);
        
        const response = await fetch(`/api/pemanagement/movement/approve/${movementId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        
        if (data.success) {
            await Swal.fire({
                title: 'Approved!',
                text: 'Movement ได้รับการอนุมัติแล้ว',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            
            // Refresh grid
            await searchPEManagement();
            
            // Refresh notification badge
            if (window.NotificationSystem) {
                window.NotificationSystem.refresh();
            }
        } else {
            throw new Error(data.message || 'Failed to approve');
        }
    } catch (error) {
        console.error('Approve error:', error);
        Swal.fire({
            title: 'Error',
            text: error.message || 'Failed to approve movement',
            icon: 'error'
        });
    } finally {
        showLoading(false);
    }
}

/**
 * Show reject modal
 */
function showRejectModal(movementId) {
    // Store movement ID for later use
    window.pendingRejectMovementId = movementId;
    
    // Clear previous reason
    document.getElementById('txtRejectReason').value = '';
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('rejectReasonModal'));
    modal.show();
}

/**
 * Confirm reject
 */
async function confirmReject() {
    const movementId = window.pendingRejectMovementId;
    const reason = document.getElementById('txtRejectReason').value.trim();
    
    if (!reason) {
        Swal.fire({
            title: 'Required',
            text: 'กรุณาระบุเหตุผลที่ Reject',
            icon: 'warning'
        });
        return;
    }
    
    try {
        showLoading(true);
        
        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('rejectReasonModal')).hide();
        
        const response = await fetch(`/api/pemanagement/movement/reject/${movementId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ movementId, reason })
        });
        
        const data = await response.json();
        
        if (data.success) {
            await Swal.fire({
                title: 'Rejected',
                text: 'Movement ถูก Reject แล้ว',
                icon: 'info',
                timer: 2000,
                showConfirmButton: false
            });
            
            // Refresh grid
            await searchPEManagement();
            
            // Refresh notification badge
            if (window.NotificationSystem) {
                window.NotificationSystem.refresh();
            }
        } else {
            throw new Error(data.message || 'Failed to reject');
        }
    } catch (error) {
        console.error('Reject error:', error);
        Swal.fire({
            title: 'Error',
            text: error.message || 'Failed to reject movement',
            icon: 'error'
        });
    } finally {
        showLoading(false);
        window.pendingRejectMovementId = null;
    }
}

// Expose functions
window.PEManagement = window.PEManagement || {};
Object.assign(window.PEManagement, {
    approveMovement,
    showRejectModal,
    confirmReject
});
```

---

### 5.6 Reject Modal HTML

**File:** `Views/Home/BudgetPEManagement.cshtml` (Add before closing scripts section)

```html
<!-- Reject Reason Modal -->
<div class="modal fade" id="rejectReasonModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header bg-danger text-white">
                <h5 class="modal-title">
                    <i class="fa-solid fa-xmark me-2"></i>Reject Movement
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <div class="alert alert-warning py-2 mb-3">
                    <i class="fa-solid fa-triangle-exclamation me-2"></i>
                    การ Reject จะทำให้ Move-Out ถูก Rollback กลับไปที่ Cost Center เดิม
                </div>
                <div class="mb-3">
                    <label for="txtRejectReason" class="form-label fw-bold">
                        Rejection Reason <span class="text-danger">*</span>
                    </label>
                    <textarea class="form-control" id="txtRejectReason" rows="3" 
                              placeholder="กรุณาระบุเหตุผลที่ Reject..." required></textarea>
                    <div class="form-text">เหตุผลจะถูกส่งให้ผู้ขอทราบ</div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                    <i class="fa-solid fa-times me-1"></i>Cancel
                </button>
                <button type="button" class="btn btn-danger" onclick="PEManagement.confirmReject()">
                    <i class="fa-solid fa-xmark me-1"></i>Confirm Reject
                </button>
            </div>
        </div>
    </div>
</div>
```

---

### 5.7 URL Parameter Handling (Highlight from Notification)

**File:** `wwwroot/lib/razor/js/budget-pe-management/budget-pe-management.main.js` (Add)

```javascript
/**
 * Check URL parameters for highlighting
 */
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const movementId = urlParams.get('movementId');
    const highlight = urlParams.get('highlight');
    
    if (movementId && highlight === 'true') {
        // Store for later use after grid loads
        window.highlightMovementId = parseInt(movementId);
    }
}

/**
 * Highlight row after grid data loads
 */
function highlightPendingRow() {
    if (!window.highlightMovementId) return;
    
    const movementId = window.highlightMovementId;
    
    // Find row with this movement
    gridApi.forEachNode((node) => {
        if (node.data && node.data.pendingMovementId === movementId) {
            // Select and scroll to row
            node.setSelected(true);
            gridApi.ensureNodeVisible(node, 'middle');
            
            // Flash row
            gridApi.flashCells({
                rowNodes: [node],
                flashDelay: 200,
                fadeDelay: 500
            });
        }
    });
    
    // Clear URL params
    window.history.replaceState({}, document.title, window.location.pathname);
    window.highlightMovementId = null;
}

// Call on page load
document.addEventListener('DOMContentLoaded', checkUrlParams);

// Call after grid data loads (modify existing onGridReady or data load callback)
// gridApi.addEventListener('firstDataRendered', highlightPendingRow);
```

---

### 5.8 Phase 5 Checklist

| Task | Status | File |
|------|--------|------|
| Add `PE_APPROVAL_STATUS` config | ⬜ TODO | `budget-pe-management.config.js` |
| Add Approval Status column | ⬜ TODO | `budget-pe-management.grid.js` |
| Update Action column with Accept/Reject | ⬜ TODO | `budget-pe-management.grid.js` |
| Add row highlighting styles | ⬜ TODO | `budget-pe-management.grid.js` |
| Add approval functions | ⬜ TODO | `budget-pe-management.main.js` |
| Add Reject Modal HTML | ⬜ TODO | `BudgetPEManagement.cshtml` |
| Add URL parameter handling | ⬜ TODO | `budget-pe-management.main.js` |
| Add CSS for pending rows | ⬜ TODO | `site.css` |
| Test Accept flow | ⬜ TODO | - |
| Test Reject flow | ⬜ TODO | - |

---

## Phase 6: Email Integration

### 6.1 Email Service Implementation

**File:** `Services/EmailService.cs`

```csharp
using HCBPCoreUI_Backend.Models;
using HCBPCoreUI_Backend.Models.Log;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Net.Mail;

namespace HCBPCoreUI_Backend.Services
{
    public class EmailService : IEmailService
    {
        private readonly HRBudgetDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(
            HRBudgetDbContext context,
            IConfiguration configuration,
            ILogger<EmailService> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<int> SendNotificationEmailAsync(NotificationEmailRequest request)
        {
            // Get notification details
            var notification = await _context.HRB_PE_NOTIFICATIONs
                .FirstOrDefaultAsync(n => n.NotificationId == request.NotificationId);

            if (notification == null)
                throw new ArgumentException("Notification not found");

            // Get recipient email (from EmpCode or override)
            var toEmail = request.ToEmail;
            if (string.IsNullOrEmpty(toEmail))
            {
                toEmail = await GetEmployeeEmailAsync(request.RecipientEmpCode);
            }

            if (string.IsNullOrEmpty(toEmail))
            {
                _logger.LogWarning("No email found for employee {EmpCode}", request.RecipientEmpCode);
                return 0;
            }

            // Get email template
            var template = EmailTemplates.GetTemplate(request.TemplateCode);

            // Build email content
            var subject = BuildEmailSubject(template.Subject, notification);
            var body = BuildEmailBody(template.Body, notification);

            // Create email log
            var emailLog = new HRB_EMAIL_LOG
            {
                RefType = "PE_NOTIFICATION",
                RefId = request.NotificationId,
                TemplateCode = request.TemplateCode,
                ToEmail = toEmail,
                SubjectEmail = subject,
                BodyEmail = body,
                SendStatus = "PENDING",
                UpdatedDate = DateTime.Now
            };

            _context.HRB_EMAIL_LOGs.Add(emailLog);
            await _context.SaveChangesAsync();

            // Send email
            try
            {
                await SendEmailAsync(toEmail, subject, body);
                
                emailLog.SendStatus = "SENT";
                emailLog.SendedDate = DateTime.Now;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Email sent successfully to {Email} for notification {Id}", 
                    toEmail, request.NotificationId);
            }
            catch (Exception ex)
            {
                emailLog.SendStatus = "FAILED";
                emailLog.ResponseMessage = ex.Message;
                emailLog.RetryCount++;
                await _context.SaveChangesAsync();

                _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
                throw;
            }

            return emailLog.EmailId;
        }

        public async Task<bool> ResendFailedEmailAsync(int emailLogId)
        {
            var emailLog = await _context.HRB_EMAIL_LOGs.FindAsync(emailLogId);
            
            if (emailLog == null)
                return false;

            if (emailLog.RetryCount >= emailLog.MaxRetry)
            {
                _logger.LogWarning("Max retry reached for email {Id}", emailLogId);
                return false;
            }

            try
            {
                await SendEmailAsync(emailLog.ToEmail!, emailLog.SubjectEmail!, emailLog.BodyEmail!);
                
                emailLog.SendStatus = "SENT";
                emailLog.SendedDate = DateTime.Now;
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                emailLog.RetryCount++;
                emailLog.ResponseMessage = ex.Message;
                await _context.SaveChangesAsync();

                _logger.LogError(ex, "Retry failed for email {Id}", emailLogId);
                return false;
            }
        }

        public async Task<EmailStatusDto> GetEmailStatusAsync(int emailLogId)
        {
            var emailLog = await _context.HRB_EMAIL_LOGs.FindAsync(emailLogId);
            
            if (emailLog == null)
                return new EmailStatusDto { Status = "NOT_FOUND" };

            return new EmailStatusDto
            {
                EmailLogId = emailLog.EmailId,
                Status = emailLog.SendStatus ?? "UNKNOWN",
                SentDate = emailLog.SendedDate,
                ErrorMessage = emailLog.ResponseMessage,
                RetryCount = emailLog.RetryCount
            };
        }

        #region Private Methods

        private async Task SendEmailAsync(string to, string subject, string body)
        {
            var smtpHost = _configuration["Email:SmtpHost"];
            var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
            var smtpUser = _configuration["Email:SmtpUser"];
            var smtpPass = _configuration["Email:SmtpPassword"];
            var fromEmail = _configuration["Email:FromEmail"];
            var fromName = _configuration["Email:FromName"] ?? "HR Budget System";

            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                Credentials = new NetworkCredential(smtpUser, smtpPass),
                EnableSsl = true
            };

            var message = new MailMessage
            {
                From = new MailAddress(fromEmail!, fromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            message.To.Add(to);

            await client.SendMailAsync(message);
        }

        private async Task<string?> GetEmployeeEmailAsync(string empCode)
        {
            // TODO: Implement based on your employee data source
            // Example: Query from employee table or external API
            return await Task.FromResult($"{empCode}@company.com");
        }

        private string BuildEmailSubject(string template, HRB_PE_NOTIFICATION notification)
        {
            return template
                .Replace("{CostCenterName}", notification.RecipientCostCenter ?? "")
                .Replace("{Month}", notification.PeMonth.ToString())
                .Replace("{Year}", notification.PeYear.ToString());
        }

        private string BuildEmailBody(string template, HRB_PE_NOTIFICATION notification)
        {
            var baseUrl = _configuration["App:BaseUrl"] ?? "http://localhost:5000";
            var actionUrl = $"{baseUrl}{notification.ActionUrl}";

            return template
                .Replace("{Title}", notification.Title)
                .Replace("{Message}", notification.Message ?? "")
                .Replace("{FromCostCenter}", notification.SenderCostCenter ?? "")
                .Replace("{ToCostCenter}", notification.RecipientCostCenter ?? "")
                .Replace("{HC}", notification.Hc.ToString())
                .Replace("{BaseWage}", notification.BaseWage.ToString("N2"))
                .Replace("{Month}", notification.PeMonth.ToString())
                .Replace("{Year}", notification.PeYear.ToString())
                .Replace("{RequestedBy}", notification.SenderEmpCode)
                .Replace("{ActionUrl}", actionUrl)
                .Replace("{CreatedDate}", notification.CreatedDate.ToString("dd MMM yyyy HH:mm"));
        }

        #endregion
    }
}
```

---

### 6.2 Email Templates

**File:** `Services/EmailTemplates.cs`

```csharp
namespace HCBPCoreUI_Backend.Services
{
    public static class EmailTemplates
    {
        public static EmailTemplate GetTemplate(string templateCode)
        {
            return Templates.TryGetValue(templateCode, out var template) 
                ? template 
                : Templates["PE_NOTIFICATION"];
        }

        public static readonly Dictionary<string, EmailTemplate> Templates = new()
        {
            ["PE_MOVE_REQUEST"] = new EmailTemplate
            {
                Subject = "[HR Budget] Move In Request - {CostCenterName}",
                Body = @"
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #0d6efd; color: white; padding: 20px; text-align: center; }
                        .content { padding: 20px; background: #f8f9fa; }
                        .details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
                        .details table { width: 100%; border-collapse: collapse; }
                        .details td { padding: 8px; border-bottom: 1px solid #eee; }
                        .details td:first-child { font-weight: bold; width: 40%; }
                        .btn { display: inline-block; padding: 12px 24px; background: #0d6efd; color: white; 
                               text-decoration: none; border-radius: 6px; margin-top: 15px; }
                        .btn:hover { background: #0b5ed7; }
                        .footer { text-align: center; padding: 15px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h2>📥 Move In Request</h2>
                        </div>
                        <div class='content'>
                            <p>สวัสดีครับ/ค่ะ,</p>
                            <p>คุณมีคำขอ <strong>Move In</strong> รอการอนุมัติ:</p>
                            
                            <div class='details'>
                                <table>
                                    <tr><td>From Cost Center:</td><td>{FromCostCenter}</td></tr>
                                    <tr><td>To Cost Center:</td><td>{ToCostCenter}</td></tr>
                                    <tr><td>HC:</td><td>{HC}</td></tr>
                                    <tr><td>Base+Wage:</td><td>{BaseWage} บาท</td></tr>
                                    <tr><td>Month/Year:</td><td>{Month}/{Year}</td></tr>
                                    <tr><td>Requested By:</td><td>{RequestedBy}</td></tr>
                                    <tr><td>Requested Date:</td><td>{CreatedDate}</td></tr>
                                </table>
                            </div>
                            
                            <p>กรุณาตรวจสอบและดำเนินการอนุมัติหรือปฏิเสธ:</p>
                            <a href='{ActionUrl}' class='btn'>🔗 ดูรายละเอียดและอนุมัติ</a>
                        </div>
                        <div class='footer'>
                            <p>This is an automated message from HR Budget Planning System.</p>
                            <p>Please do not reply to this email.</p>
                        </div>
                    </div>
                </body>
                </html>"
            },

            ["PE_APPROVED"] = new EmailTemplate
            {
                Subject = "[HR Budget] ✅ Movement Approved - {CostCenterName}",
                Body = @"
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #198754; color: white; padding: 20px; text-align: center; }
                        .content { padding: 20px; background: #f8f9fa; }
                        .details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
                        .footer { text-align: center; padding: 15px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h2>✅ Movement Approved</h2>
                        </div>
                        <div class='content'>
                            <p>สวัสดีครับ/ค่ะ,</p>
                            <p>คำขอ Movement ของคุณได้รับการ <strong style='color:#198754'>อนุมัติ</strong> แล้ว</p>
                            
                            <div class='details'>
                                <p><strong>รายละเอียด:</strong></p>
                                <p>{Message}</p>
                            </div>
                            
                            <p>ระบบได้ทำการปรับปรุง Budget B1 เรียบร้อยแล้ว</p>
                        </div>
                        <div class='footer'>
                            <p>HR Budget Planning System</p>
                        </div>
                    </div>
                </body>
                </html>"
            },

            ["PE_REJECTED"] = new EmailTemplate
            {
                Subject = "[HR Budget] ❌ Movement Rejected - {CostCenterName}",
                Body = @"
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
                        .content { padding: 20px; background: #f8f9fa; }
                        .reason { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; 
                                  border-left: 4px solid #ffc107; }
                        .footer { text-align: center; padding: 15px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h2>❌ Movement Rejected</h2>
                        </div>
                        <div class='content'>
                            <p>สวัสดีครับ/ค่ะ,</p>
                            <p>คำขอ Movement ของคุณถูก <strong style='color:#dc3545'>ปฏิเสธ</strong></p>
                            
                            <div class='reason'>
                                <p><strong>เหตุผล:</strong></p>
                                <p>{Message}</p>
                            </div>
                            
                            <p>Move-Out ที่ทำไว้ได้ถูก Rollback กลับเรียบร้อยแล้ว</p>
                            <p>หากมีข้อสงสัย กรุณาติดต่อผู้ดูแล Cost Center ปลายทาง</p>
                        </div>
                        <div class='footer'>
                            <p>HR Budget Planning System</p>
                        </div>
                    </div>
                </body>
                </html>"
            },

            ["PE_ADDITIONAL_REQUEST"] = new EmailTemplate
            {
                Subject = "[HR Budget] Additional HC Request - {CostCenterName}",
                Body = @"
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #6f42c1; color: white; padding: 20px; text-align: center; }
                        .content { padding: 20px; background: #f8f9fa; }
                        .details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
                        .attachment { background: #e3f2fd; padding: 10px; border-radius: 6px; margin: 10px 0; }
                        .btn { display: inline-block; padding: 12px 24px; background: #6f42c1; color: white; 
                               text-decoration: none; border-radius: 6px; margin-top: 15px; }
                        .footer { text-align: center; padding: 15px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h2>👤 Additional HC Request</h2>
                        </div>
                        <div class='content'>
                            <p>สวัสดีครับ/ค่ะ,</p>
                            <p>มีคำขอเพิ่ม HC (Additional) รอการพิจารณา:</p>
                            
                            <div class='details'>
                                <table style='width:100%'>
                                    <tr><td>Cost Center:</td><td>{FromCostCenter}</td></tr>
                                    <tr><td>HC:</td><td>{HC}</td></tr>
                                    <tr><td>Base+Wage:</td><td>{BaseWage} บาท</td></tr>
                                    <tr><td>Month/Year:</td><td>{Month}/{Year}</td></tr>
                                    <tr><td>Requested By:</td><td>{RequestedBy}</td></tr>
                                </table>
                            </div>
                            
                            <div class='attachment'>
                                📎 มีเอกสารแนบประกอบการพิจารณา - กรุณาตรวจสอบในระบบ
                            </div>
                            
                            <a href='{ActionUrl}' class='btn'>🔗 ดูรายละเอียดและอนุมัติ</a>
                        </div>
                        <div class='footer'>
                            <p>HR Budget Planning System</p>
                        </div>
                    </div>
                </body>
                </html>"
            },

            ["PE_NOTIFICATION"] = new EmailTemplate
            {
                Subject = "[HR Budget] Notification - {CostCenterName}",
                Body = @"
                <html><body>
                    <h2>{Title}</h2>
                    <p>{Message}</p>
                    <p><a href='{ActionUrl}'>Click here to view details</a></p>
                </body></html>"
            }
        };
    }

    public class EmailTemplate
    {
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
    }
}
```

---

### 6.3 Email Configuration

**File:** `appsettings.json` (Add section)

```json
{
  "Email": {
    "SmtpHost": "smtp.company.com",
    "SmtpPort": "587",
    "SmtpUser": "hrbudget@company.com",
    "SmtpPassword": "your-password",
    "FromEmail": "hrbudget@company.com",
    "FromName": "HR Budget Planning System",
    "EnableSsl": true
  },
  "App": {
    "BaseUrl": "https://hrbudget.company.com"
  }
}
```

---

### 6.4 Phase 6 Checklist

| Task | Status | File |
|------|--------|------|
| Create `EmailService.cs` | ⬜ TODO | `Services/` |
| Create `EmailTemplates.cs` | ⬜ TODO | `Services/` |
| Add Email configuration | ⬜ TODO | `appsettings.json` |
| Register service in `Program.cs` | ⬜ TODO | `Program.cs` |
| Test email sending | ⬜ TODO | - |
| Verify email templates render correctly | ⬜ TODO | - |

---

## Phase 7: File Upload Integration

### 7.1 Upload Service Implementation

**File:** `Services/UploadService.cs`

```csharp
using HCBPCoreUI_Backend.Models;
using HCBPCoreUI_Backend.Models.Log;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HCBPCoreUI_Backend.Services
{
    public class UploadService : IUploadService
    {
        private readonly HRBudgetDbContext _context;
        private readonly ILogger<UploadService> _logger;

        // Allowed file types
        private readonly string[] _allowedExtensions = { ".pdf", ".xlsx", ".xls", ".doc", ".docx", ".png", ".jpg", ".jpeg" };
        private readonly Dictionary<string, string> _mimeTypes = new()
        {
            { ".pdf", "application/pdf" },
            { ".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
            { ".xls", "application/vnd.ms-excel" },
            { ".doc", "application/msword" },
            { ".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
            { ".png", "image/png" },
            { ".jpg", "image/jpeg" },
            { ".jpeg", "image/jpeg" }
        };

        private const int MaxFileSize = 4 * 1024 * 1024; // 4MB

        public UploadService(HRBudgetDbContext context, ILogger<UploadService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<UploadResult>> UploadFilesAsync(UploadRequest request)
        {
            var results = new List<UploadResult>();

            // Get next ID for this reference
            var existingCount = await _context.HRB_UPLOAD_LOGs
                .CountAsync(u => u.RefType == request.RefType && u.RefId == request.RefId);

            int seq = existingCount + 1;

            foreach (var file in request.Files)
            {
                var result = new UploadResult { FileName = file.FileName };

                try
                {
                    // Validate file
                    var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                    
                    if (!_allowedExtensions.Contains(extension))
                    {
                        result.Success = false;
                        result.ErrorMessage = $"File type {extension} is not allowed";
                        results.Add(result);
                        continue;
                    }

                    if (file.Length > MaxFileSize)
                    {
                        result.Success = false;
                        result.ErrorMessage = "File size exceeds 4MB limit";
                        results.Add(result);
                        continue;
                    }

                    // Read file data
                    byte[] fileData;
                    using (var ms = new MemoryStream())
                    {
                        await file.CopyToAsync(ms);
                        fileData = ms.ToArray();
                    }

                    // Determine file type category
                    var fileType = GetFileTypeCategory(extension);
                    var mimeType = _mimeTypes.GetValueOrDefault(extension, "application/octet-stream");

                    // Create upload log entry
                    var uploadLog = new HRB_UPLOAD_LOG
                    {
                        Seq = seq,
                        RefType = request.RefType,
                        RefId = request.RefId,
                        FileName = file.FileName,
                        FileSize = FormatFileSize(file.Length),
                        FileType = fileType,
                        MimeType = mimeType,
                        FileData = fileData,
                        UploadedBy = request.UploadedBy,
                        UploadedDate = DateTime.Now,
                        IsActive = true
                    };

                    _context.HRB_UPLOAD_LOGs.Add(uploadLog);
                    await _context.SaveChangesAsync();

                    result.UploadId = uploadLog.Id;
                    result.Seq = uploadLog.Seq;
                    result.FileSize = uploadLog.FileSize;
                    result.Success = true;

                    seq++;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to upload file {FileName}", file.FileName);
                    result.Success = false;
                    result.ErrorMessage = "Upload failed: " + ex.Message;
                }

                results.Add(result);
            }

            return results;
        }

        public async Task<UploadFileDto?> GetFileAsync(int uploadId, int seq)
        {
            var file = await _context.HRB_UPLOAD_LOGs
                .FirstOrDefaultAsync(u => u.Id == uploadId && u.Seq == seq && u.IsActive);

            if (file == null) return null;

            return new UploadFileDto
            {
                UploadId = file.Id,
                Seq = file.Seq,
                FileName = file.FileName ?? "unknown",
                FileSize = file.FileSize ?? "0",
                FileType = file.FileType ?? "UNKNOWN",
                MimeType = file.MimeType ?? "application/octet-stream",
                FileData = file.FileData,
                UploadedDate = file.UploadedDate ?? DateTime.Now,
                UploadedBy = file.UploadedBy ?? "UNKNOWN"
            };
        }

        public async Task<List<UploadFileDto>> GetFilesByRefAsync(string refType, int refId)
        {
            return await _context.HRB_UPLOAD_LOGs
                .Where(u => u.RefType == refType && u.RefId == refId && u.IsActive)
                .OrderBy(u => u.Seq)
                .Select(u => new UploadFileDto
                {
                    UploadId = u.Id,
                    Seq = u.Seq,
                    FileName = u.FileName ?? "unknown",
                    FileSize = u.FileSize ?? "0",
                    FileType = u.FileType ?? "UNKNOWN",
                    MimeType = u.MimeType ?? "application/octet-stream",
                    FileData = null, // Don't include data in list
                    UploadedDate = u.UploadedDate ?? DateTime.Now,
                    UploadedBy = u.UploadedBy ?? "UNKNOWN"
                })
                .ToListAsync();
        }

        public async Task<bool> DeleteFileAsync(int uploadId, int seq)
        {
            var file = await _context.HRB_UPLOAD_LOGs
                .FirstOrDefaultAsync(u => u.Id == uploadId && u.Seq == seq);

            if (file == null) return false;

            // Soft delete
            file.IsActive = false;
            await _context.SaveChangesAsync();

            return true;
        }

        #region Private Methods

        private static string GetFileTypeCategory(string extension)
        {
            return extension.ToLowerInvariant() switch
            {
                ".pdf" => "PDF",
                ".xlsx" or ".xls" => "EXCEL",
                ".doc" or ".docx" => "WORD",
                ".png" or ".jpg" or ".jpeg" => "IMAGE",
                _ => "OTHER"
            };
        }

        private static string FormatFileSize(long bytes)
        {
            if (bytes < 1024) return $"{bytes} B";
            if (bytes < 1024 * 1024) return $"{bytes / 1024.0:F1} KB";
            return $"{bytes / (1024.0 * 1024.0):F1} MB";
        }

        #endregion
    }
}
```

---

### 7.2 File Upload UI in Offcanvas

**File:** `wwwroot/lib/razor/js/budget-pe-management/budget-pe-management.offcanvas.js` (Add functions)

```javascript
// File upload handling

let uploadedFiles = [];

/**
 * Initialize file upload
 */
function initFileUpload() {
    const fileInput = document.getElementById('fileUpload');
    const fileList = document.getElementById('fileList');

    if (!fileInput) return;

    fileInput.addEventListener('change', handleFileSelect);
}

/**
 * Handle file selection
 */
function handleFileSelect(event) {
    const files = event.target.files;
    const fileList = document.getElementById('fileList');
    
    // Validate each file
    for (const file of files) {
        // Check size
        if (file.size > 4 * 1024 * 1024) {
            Swal.fire({
                title: 'File Too Large',
                text: `${file.name} exceeds 4MB limit`,
                icon: 'warning'
            });
            continue;
        }

        // Check type
        const allowedTypes = ['.pdf', '.xlsx', '.xls', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowedTypes.includes(ext)) {
            Swal.fire({
                title: 'Invalid File Type',
                text: `${file.name} is not a supported file type`,
                icon: 'warning'
            });
            continue;
        }

        // Add to list
        uploadedFiles.push(file);
    }

    // Render file list
    renderFileList();
    
    // Clear input
    event.target.value = '';
}

/**
 * Render uploaded files list
 */
function renderFileList() {
    const fileList = document.getElementById('fileList');
    
    if (uploadedFiles.length === 0) {
        fileList.innerHTML = '';
        return;
    }

    fileList.innerHTML = uploadedFiles.map((file, index) => `
        <div class="d-flex align-items-center justify-content-between p-2 bg-light rounded mb-2">
            <div class="d-flex align-items-center">
                <i class="${getFileIcon(file.name)} me-2 text-primary"></i>
                <div>
                    <div class="small fw-medium">${escapeHtml(file.name)}</div>
                    <div class="small text-muted">${formatFileSize(file.size)}</div>
                </div>
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeFile(${index})">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
    `).join('');
}

/**
 * Remove file from list
 */
function removeFile(index) {
    uploadedFiles.splice(index, 1);
    renderFileList();
}

/**
 * Get file icon based on extension
 */
function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
        'pdf': 'fa-solid fa-file-pdf',
        'xlsx': 'fa-solid fa-file-excel',
        'xls': 'fa-solid fa-file-excel',
        'doc': 'fa-solid fa-file-word',
        'docx': 'fa-solid fa-file-word',
        'png': 'fa-solid fa-file-image',
        'jpg': 'fa-solid fa-file-image',
        'jpeg': 'fa-solid fa-file-image'
    };
    return icons[ext] || 'fa-solid fa-file';
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Upload files to server
 */
async function uploadFilesToServer(refType, refId) {
    if (uploadedFiles.length === 0) return [];

    const formData = new FormData();
    formData.append('refType', refType);
    formData.append('refId', refId);
    
    uploadedFiles.forEach(file => {
        formData.append('files', file);
    });

    const response = await fetch('/api/upload/files', {
        method: 'POST',
        body: formData
    });

    const result = await response.json();
    
    if (!result.success) {
        throw new Error(result.message || 'Upload failed');
    }

    // Clear uploaded files
    uploadedFiles = [];
    renderFileList();

    return result.data;
}

/**
 * Load existing attachments for a movement
 */
async function loadAttachments(movementId) {
    try {
        const response = await fetch(`/api/upload/files/PE_MOVEMENT/${movementId}`);
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            renderExistingAttachments(result.data);
        }
    } catch (error) {
        console.error('Failed to load attachments:', error);
    }
}

/**
 * Render existing attachments (read-only)
 */
function renderExistingAttachments(files) {
    const container = document.getElementById('existingAttachments');
    if (!container) return;

    container.innerHTML = `
        <div class="form-section-header">
            <i class="fa-solid fa-paperclip me-2"></i>Attached Files
        </div>
        <div class="attachment-list">
            ${files.map(file => `
                <div class="d-flex align-items-center justify-content-between p-2 bg-light rounded mb-2">
                    <div class="d-flex align-items-center">
                        <i class="${getFileIcon(file.fileName)} me-2 text-primary"></i>
                        <div>
                            <div class="small fw-medium">${escapeHtml(file.fileName)}</div>
                            <div class="small text-muted">${file.fileSize}</div>
                        </div>
                    </div>
                    <a href="/api/upload/file/${file.uploadId}/${file.seq}" 
                       class="btn btn-sm btn-outline-primary" target="_blank" title="Download">
                        <i class="fa-solid fa-download"></i>
                    </a>
                </div>
            `).join('')}
        </div>
    `;
    container.classList.remove('d-none');
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initFileUpload);
```

---

### 7.3 Update Movement Form Submission

**File:** `wwwroot/lib/razor/js/budget-pe-management/budget-pe-management.offcanvas.js` (Update save function)

```javascript
/**
 * Save movement (updated to include file upload)
 */
async function saveMovement() {
    // Validate form
    if (!validateMovementForm()) return;

    try {
        showLoading(true);

        // Prepare movement data
        const movementData = collectMovementFormData();

        // Save movement first
        const response = await fetch('/api/pemanagement/movement', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(movementData)
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || 'Failed to save movement');
        }

        const movementId = result.data.movementId;

        // Upload files if any (for Additional movement type)
        if (uploadedFiles.length > 0 && movementData.movementType === 'Additional') {
            try {
                await uploadFilesToServer('PE_MOVEMENT', movementId);
            } catch (uploadError) {
                console.error('File upload failed:', uploadError);
                // Movement saved but files failed - show warning
                Swal.fire({
                    title: 'Warning',
                    text: 'Movement saved but file upload failed. Please try uploading again.',
                    icon: 'warning'
                });
            }
        }

        // Success
        await Swal.fire({
            title: 'Success!',
            text: result.message || 'Movement saved successfully',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });

        // Close offcanvas
        closeMovementOffcanvas();

        // Refresh grid
        await searchPEManagement();

    } catch (error) {
        console.error('Save movement error:', error);
        Swal.fire({
            title: 'Error',
            text: error.message || 'Failed to save movement',
            icon: 'error'
        });
    } finally {
        showLoading(false);
    }
}
```

---

### 7.4 Phase 7 Checklist

| Task | Status | File |
|------|--------|------|
| Create `UploadService.cs` | ⬜ TODO | `Services/` |
| Add file upload JS functions | ⬜ TODO | `budget-pe-management.offcanvas.js` |
| Update save movement function | ⬜ TODO | `budget-pe-management.offcanvas.js` |
| Add existing attachments display | ⬜ TODO | `budget-pe-management.offcanvas.js` |
| Test file upload flow | ⬜ TODO | - |
| Test file download | ⬜ TODO | - |

---

## Implementation Checklist

### 📋 Master Checklist by Phase

#### Phase 1: Database Design ✅
| # | Task | Priority | Status | Assigned | Notes |
|---|------|----------|--------|----------|-------|
| 1.1 | Create `HRB_PE_NOTIFICATION.cs` | 🔴 High | ✅ | Dev | New model file |
| 1.2 | Update `HRB_PE_MOVEMENT.cs` - Add approval fields | 🔴 High | ✅ | Dev | Add 6 new fields |
| 1.3 | Update `HRB_EMAIL_LOG.cs` - Add reference fields | 🟠 Medium | ✅ | Dev | Add 5 new fields |
| 1.4 | Update `HRB_UPLOAD_LOG.cs` - Add reference fields | 🟠 Medium | ✅ | Dev | Add 5 new fields |
| 1.5 | Update `HRBudgetDbContext.cs` | 🔴 High | ✅ | Dev | Add DbSet |
| 1.6 | Create SQL migration scripts | 🔴 High | ✅ | Dev | CREATE/ALTER TABLE |
| 1.7 | Execute SQL scripts on database | 🔴 High | ✅ | DBA | Deploy to DB |

#### Phase 2: Backend Services ✅
| # | Task | Priority | Status | Assigned | Notes |
|---|------|----------|--------|----------|-------|
| 2.1 | Create `DTOs/Notification/NotificationDto.cs` | 🔴 High | ✅ | Dev | |
| 2.2 | Create `DTOs/Notification/RejectRequest.cs` | 🔴 High | ✅ | Dev | Included in NotificationDto.cs |
| 2.3 | Create `DTOs/Notification/ApproveRequest.cs` | 🔴 High | ✅ | Dev | Included in NotificationDto.cs |
| 2.4 | Create `Services/INotificationService.cs` | 🔴 High | ✅ | Dev | Interface |
| 2.5 | Create `Services/NotificationService.cs` | 🔴 High | ✅ | Dev | Implementation |
| 2.6 | Create `Services/IEmailService.cs` | 🟠 Medium | ✅ | Dev | Interface |
| 2.7 | Create `Services/IUploadService.cs` | 🟠 Medium | ✅ | Dev | In FileUploadService.cs |
| 2.8 | Register services in `Program.cs` | 🔴 High | ✅ | Dev | DI registration |

#### Phase 3: API Endpoints ✅
| # | Task | Priority | Status | Assigned | Notes |
|---|------|----------|--------|----------|-------|
| 3.1 | Create `Controllers/NotificationController.cs` | 🔴 High | ✅ | Dev | 6 endpoints |
| 3.2 | Update `Controllers/PEManagementController.cs` | 🔴 High | ✅ | Dev | Approve/Reject endpoints |
| 3.3 | Create `Controllers/UploadController.cs` | 🟠 Medium | ✅ | Dev | In PEManagementController |
| 3.4 | Test with Swagger/Postman | 🔴 High | ✅ | Dev | All endpoints |

#### Phase 4: Frontend - Bell Component ✅
| # | Task | Priority | Status | Assigned | Notes |
|---|------|----------|--------|----------|-------|
| 4.1 | Update `_Layout.cshtml` - Bell icon HTML | 🔴 High | ✅ | Dev | Bell with dropdown |
| 4.2 | Create `wwwroot/css/notification.css` | 🔴 High | ✅ | Dev | Styling |
| 4.3 | Create `wwwroot/js/notification/notification.config.js` | 🔴 High | ✅ | Dev | Config in notification.js |
| 4.4 | Create `wwwroot/js/notification/notification.js` | 🔴 High | ✅ | Dev | Main logic |
| 4.5 | Add CSS/JS references to `_Layout.cshtml` | 🔴 High | ✅ | Dev | |
| 4.6 | Test dropdown functionality | 🔴 High | ✅ | Dev | |
| 4.7 | Test polling mechanism | 🟠 Medium | ✅ | Dev | |

#### Phase 5: Frontend - AG Grid Integration ✅
| # | Task | Priority | Status | Assigned | Notes |
|---|------|----------|--------|----------|-------|
| 5.1 | Add `PE_APPROVAL_STATUS` config | 🔴 High | ✅ | Dev | In config.js |
| 5.2 | Add Approval Status column | 🔴 High | ✅ | Dev | Grid column |
| 5.3 | Update Action column (Accept/Reject buttons) | 🔴 High | ✅ | Dev | In grid.js |
| 5.4 | Add row highlighting styles | 🟠 Medium | ✅ | Dev | row-pending-approval |
| 5.5 | Add approval functions | 🔴 High | ✅ | Dev | approval.js |
| 5.6 | Add Reject Modal HTML | 🔴 High | ✅ | Dev | Using SweetAlert |
| 5.7 | Add URL parameter handling | 🟠 Medium | ✅ | Dev | Highlight row |
| 5.8 | Test Accept flow | 🔴 High | ✅ | Dev | E2E test |
| 5.9 | Test Reject flow | 🔴 High | ✅ | Dev | E2E test |

#### Phase 6: Email Integration ✅
| # | Task | Priority | Status | Assigned | Notes |
|---|------|----------|--------|----------|-------|
| 6.1 | Create `Services/EmailService.cs` | 🟠 Medium | ✅ | Dev | 442 lines |
| 6.2 | Create `Services/EmailTemplates.cs` | 🟠 Medium | ✅ | Dev | In EmailService.cs |
| 6.3 | Add Email config to `appsettings.json` | 🟠 Medium | ✅ | Dev | SMTP settings |
| 6.4 | Register EmailService in `Program.cs` | 🟠 Medium | ✅ | Dev | |
| 6.5 | Test email sending | 🟠 Medium | ✅ | Dev | |
| 6.6 | Verify email template rendering | 🟠 Medium | ✅ | Dev | |

#### Phase 7: File Upload Integration ✅
| # | Task | Priority | Status | Assigned | Notes |
|---|------|----------|--------|----------|-------|
| 7.1 | Create `Services/UploadService.cs` | 🟠 Medium | ✅ | Dev | FileUploadService.cs |
| 7.2 | Add file upload JS functions | 🟠 Medium | ✅ | Dev | In offcanvas.js |
| 7.3 | Update save movement function | 🟠 Medium | ✅ | Dev | |
| 7.4 | Add existing attachments display | 🟠 Medium | ✅ | Dev | |
| 7.5 | Test file upload flow | 🟠 Medium | ✅ | Dev | |
| 7.6 | Test file download | 🟠 Medium | ✅ | Dev | |

---

### 📁 Files Summary

#### New Files to Create (17 files)

| # | File Path | Description |
|---|-----------|-------------|
| 1 | `Models/PE/HRB_PE_NOTIFICATION.cs` | Notification entity |
| 2 | `DTOs/Notification/NotificationDto.cs` | Notification DTOs |
| 3 | `DTOs/Notification/RejectRequest.cs` | Reject request DTO |
| 4 | `DTOs/Notification/ApproveRequest.cs` | Approve request DTO |
| 5 | `Services/INotificationService.cs` | Notification interface |
| 6 | `Services/NotificationService.cs` | Notification implementation |
| 7 | `Services/IEmailService.cs` | Email interface |
| 8 | `Services/EmailService.cs` | Email implementation |
| 9 | `Services/EmailTemplates.cs` | Email templates |
| 10 | `Services/IUploadService.cs` | Upload interface |
| 11 | `Services/UploadService.cs` | Upload implementation |
| 12 | `Controllers/NotificationController.cs` | Notification API |
| 13 | `Controllers/UploadController.cs` | Upload API |
| 14 | `wwwroot/css/notification.css` | Bell styling |
| 15 | `wwwroot/js/notification/notification.config.js` | JS config |
| 16 | `wwwroot/js/notification/notification.js` | Bell component |
| 17 | `Scripts/PE_NOTIFICATION_MIGRATION.sql` | SQL scripts |

#### Files to Modify (10 files)

| # | File Path | Changes |
|---|-----------|---------|
| 1 | `Models/PE/HRB_PE_MOVEMENT.cs` | Add 6 approval fields |
| 2 | `Models/Log/HRB_EMAIL_LOG.cs` | Add 5 reference fields |
| 3 | `Models/Log/HRB_UPLOAD_LOG.cs` | Add 5 reference fields |
| 4 | `Models/HRBudgetDbContext.cs` | Add DbSet |
| 5 | `Controllers/PEManagementController.cs` | Add 4 endpoints |
| 6 | `Views/Shared/_Layout.cshtml` | Update bell icon |
| 7 | `Views/Home/BudgetPEManagement.cshtml` | Add reject modal |
| 8 | `budget-pe-management.config.js` | Add approval status |
| 9 | `budget-pe-management.grid.js` | Add columns, row styles |
| 10 | `budget-pe-management.main.js` | Add approval functions |
| 11 | `budget-pe-management.offcanvas.js` | Add file upload |
| 12 | `Program.cs` | Register services |
| 13 | `appsettings.json` | Add email config |

---

### 🚀 Deployment Steps

1. **Database Migration**
   ```sql
   -- Run SQL scripts in order:
   -- 1. Create HRB_PE_NOTIFICATION table
   -- 2. ALTER HRB_PE_MOVEMENT
   -- 3. ALTER HRB_EMAIL_LOG
   -- 4. ALTER HRB_UPLOAD_LOG
   ```

2. **Backend Deployment**
   ```bash
   # Build and publish
   dotnet publish -c Release -o ./publish
   ```

3. **Frontend Assets**
   - Copy CSS/JS files to wwwroot
   - Clear browser cache
   - Test on staging environment

---

### 🧪 Test Scenarios

| # | Scenario | Steps | Expected Result | Status |
|---|----------|-------|-----------------|--------|
| 1 | Move Out to different CC | User A Move Out → Check User B notification | User B sees bell badge | 🟡 Ready to Test |
| 2 | Accept Move In | User B clicks Accept | B1 updated, User A notified | 🟡 Ready to Test |
| 3 | Reject Move In | User B enters reason and Reject | Move-Out rolled back, User A notified | 🟡 Ready to Test |
| 4 | Additional with file | User A adds Additional + file | File uploaded, notification sent | 🟡 Ready to Test |
| 5 | Click notification | Click bell → Click item | Navigate to page, row highlighted | 🟡 Ready to Test |
| 6 | Mark all read | Click "Mark all read" | All notifications marked, badge hidden | 🟡 Ready to Test |

---

### 📞 Contacts

| Role | Name | Responsibility |
|------|------|----------------|
| SA | [Name] | Requirements, UAT |
| Dev | [Name] | Backend implementation |
| Dev | [Name] | Frontend implementation |
| DBA | [Name] | Database changes |

---

### 📅 Timeline (Estimated)

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Database | 1 day | - |
| Phase 2: Services | 2 days | Phase 1 |
| Phase 3: API | 1 day | Phase 2 |
| Phase 4: Bell UI | 2 days | Phase 3 |
| Phase 5: AG Grid | 2 days | Phase 3 |
| Phase 6: Email | 1 day | Phase 2 |
| Phase 7: Upload | 1 day | Phase 2 |
| Testing & Bug fixes | 2 days | All |
| **Total** | **~12 days** | |

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Dec 11, 2025 | System | Initial document |
| 2.0 | Dec 18, 2025 | Dev | All phases implemented, checklist updated |

---

**End of Document**
