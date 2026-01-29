1. การออกแบบ Audit Log สำหรับทุกเมนู
คุณสามารถออกแบบให้ครอบคลุมทุกเมนูได้ โดยเปลี่ยนจากการเก็บแค่ "ประเภทไฟล์" หรือ "การเข้าสู่ระบบ" เป็นการเก็บ "Activity Logs" (บันทึกกิจกรรม) โดยมีหลักการออกแบบดังนี้ครับ:

Centralized Log Table: ใช้ตารางเดียวเก็บข้อมูลพื้นฐานของทุกเมนู แต่เพิ่มคอลัมน์ "Module/Menu" เพื่อระบุว่าเกิดเหตุการณ์ที่เมนูไหน (เช่น Head Count Planning, PE Bonus)

Action Types: ระบุประเภทการกระทำ เช่น Create (สร้าง), View (ดู), Update (แก้ไข), Delete (ลบ), Export (ดึงข้อมูลออก)

Deep Link: ในหน้า Audit Log ควรมีลิงก์ที่กดแล้วกระโดดไปยังหน้านั้นๆ หรือรายการนั้นๆ ได้ทันทีเพื่อความสะดวกในการตรวจสอบ

2. ข้อมูลที่ "ต้องมี" ใน Audit Log (5W1H)เพื่อให้ Audit Log ใช้งานได้จริงและมีน้ำหนักทางกฎหมายหรือการตรวจสอบภายใน ควรเก็บข้อมูลดังนี้ครับ:หัวข้อข้อมูลที่ควรเก็บคำอธิบายWho (ใคร)User ID / Username / Roleใครเป็นคนทำ (รวมถึง IP Address และ Device ที่ใช้)When (เมื่อไหร่)Timestampวันที่และเวลาที่เกิดเหตุการณ์ (ควรเก็บเป็นระดับวินาที)Where (ที่ไหน)Module / Menu / URLทำที่เมนูไหน หรือเรียกใช้ API เส้นไหนWhat (ทำอะไร)Action / Eventทำอะไร เช่น "แก้ไขงบประมาณโบนัส", "ลบรายชื่อพนักงาน"Result (ผลลัพธ์)Success / Failการกระทำนั้นสำเร็จหรือไม่ หากไม่สำเร็จติด Error อะไรDetails (รายละเอียด)Old Value vs New Value(สำคัญมาก) ถ้ามีการแก้ไข ต้องเก็บว่าค่าเดิมคืออะไร และค่าใหม่คืออะไร

3. สิ่งที่ควรระวังในการเก็บ Audit Log (Best Practices)
ห้ามเก็บข้อมูลส่วนตัวที่สำคัญ (Sensitive Data): เช่น รหัสผ่าน (Password), เลขบัตรประชาชน หรือข้อมูลส่วนบุคคลที่ไม่ได้เข้ารหัส ไว้ใน Log ตรงๆ

Data Retention: ต้องกำหนดว่าจะเก็บ Log ไว้นานเท่าไหร่ (เช่น 90 วัน, 1 ปี หรือ 5 ปีตามนโยบายบริษัท) เพราะถ้าเก็บทุกเมนู ข้อมูลจะโตเร็วมากครับ

Read-Only: Audit Log ต้องไม่สามารถแก้ไขหรือลบได้โดย User ทั่วไป (และแม้แต่ Admin ก็ไม่ควรลบได้ง่ายๆ)

Performance: การเขียน Log ไม่ควรทำให้ระบบหลักช้าลง ควรใช้ระบบ Background Task หรือ Asynchronous ในการบันทึก

เพื่อให้ครอบคลุมทุกเมนูในระบบ BJC Budget Planning และสามารถตรวจสอบย้อนกลับ (Traceability) ได้อย่างสมบูรณ์ ผมขอร่างโครงสร้างตาราง Database โดยเน้นความยืดหยุ่นและการเก็บข้อมูลแบบละเอียด ดังนี้ครับ

1. โครงสร้างตาราง audit_logs
ผมแนะนำให้ใช้ฟิลด์ JSON สำหรับเก็บค่าข้อมูลที่เปลี่ยนแปลง เพื่อรองรับโครงสร้างข้อมูลที่แตกต่างกันในแต่ละเมนู (เช่น เมนูพนักงาน กับ เมนูงบประมาณ มี Field ไม่เหมือนกัน)

Column Name	Data Type	Description
log_id	BigInt (PK)	ไอดีหลักของ Log (Auto Increment)
timestamp	DateTime	วันที่และเวลาที่เกิดเหตุการณ์ (ควรใช้ UTC หรือระบุ Timezone)
user_id	Varchar(50)	รหัสพนักงาน หรือ Username ของผู้ใช้งาน
user_role	Varchar(50)	บทบาทในขณะนั้น (เช่น Admin, Planner)
module_name	Varchar(100)	ชื่อเมนู (เช่น 'PE Bonus', 'Head Count Planning')
action	Varchar(20)	ประเภทการกระทำ: CREATE, UPDATE, DELETE, VIEW, EXPORT
target_id	Varchar(100)	PK ของข้อมูลที่ถูกกระทำ (เช่น เลขที่งบประมาณ หรือ ID พนักงาน)
old_value	JSON	ข้อมูลเดิมก่อนแก้ไข (เก็บเป็น JSON Object)
new_value	JSON	ข้อมูลใหม่หลังแก้ไข (เก็บเป็น JSON Object)
ip_address	Varchar(45)	IP ของผู้ใช้งาน (รองรับ IPv4/IPv6)
user_agent	Text	ข้อมูล Browser และ OS ของผู้ใช้งาน
status	Varchar(20)	สถานะความสำเร็จ: SUCCESS หรือ FAILED
remarks	Text	หมายเหตุเพิ่มเติม หรือ Error Message กรณีที่ล้มเหลว

2. ตัวอย่างการเก็บข้อมูล (Use Case)
หากมีการแก้ไข PE Bonus ของพนักงานคนหนึ่ง:

module_name: PE Bonus (By Cost Center)

action: UPDATE

target_id: EMP001

old_value: {"bonus_rate": 1.5, "total_amount": 15000}

new_value: {"bonus_rate": 2.0, "total_amount": 20000}

3. ข้อแนะนำทางเทคนิคเพื่อประสิทธิภาพ (Best Practices)
Indexing: เนื่องจากตาราง Log จะมีขนาดใหญ่มาก ควรทำ Index ใน Column ที่ถูกค้นหาบ่อยๆ เช่น:

timestamp (สำหรับการดึงข้อมูลตามช่วงเวลา)

user_id (สำหรับดูประวัติรายบุคคล)

module_name (สำหรับดูแยกตามเมนู)

Table Partitioning: หากระบบมีการใช้งานสูง แนะนำให้ทำ Partition ตารางตามรายเดือนหรือรายปี เพื่อไม่ให้การ Query ข้อมูลย้อนหลังไปกระทบกับ Performance ของ Database หลัก

JSON Search: หากใช้ฐานข้อมูลรุ่นใหม่ (เช่น PostgreSQL, MySQL 8.0+, SQL Server 2016+) คุณจะสามารถเขียน Query เพื่อหาข้อมูลภายในฟิลด์ JSON ได้โดยตรง ซึ่งมีประโยชน์มากในการตรวจสอบว่า "ใครเคยแก้ค่า Field นี้บ้าง"

Asynchronous Logging: เพื่อไม่ให้การเขียน Log ทำให้หน้าเว็บหมุนช้า (Latency) ควรส่งข้อมูล Log ไปบันทึกผ่าน Queue หรือ Background Process แยกต่างหากจากโปรเซสหลักที่ User ใช้งาน

4. ตัวอย่าง SQL Script (PostgreSQL/MySQL)

CREATE TABLE audit_logs (
    log_id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(50) NOT NULL,
    user_role VARCHAR(50),
    module_name VARCHAR(100) NOT NULL,
    action VARCHAR(20) NOT NULL,
    target_id VARCHAR(100),
    old_value JSONB, -- หรือ JSON
    new_value JSONB, -- หรือ JSON
    ip_address VARCHAR(45),
    user_agent TEXT,
    status VARCHAR(20) DEFAULT 'SUCCESS',
    remarks TEXT
);

-- สร้าง Index เพื่อความรวดเร็วในการค้นหา
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_module ON audit_logs(module_name);

---

# 📋 การวิเคราะห์ Audit Log สำหรับระบบ BJC Budget Planning

## 🔍 สถานะปัจจุบัน

### Log ที่มีอยู่แล้ว (3 ตาราง)

| ตาราง | ประเภท | สถานะ | รายละเอียด |
|-------|--------|-------|-----------|
| `HRB_USER_LOGIN_LOG` | Login/Logout | ✅ มีแล้ว | บันทึกการเข้า-ออกระบบ |
| `HRB_EMAIL_LOG` | Email Sending | ✅ มีแล้ว | บันทึกการส่งอีเมล |
| `HRB_UPLOAD_LOG` | File Upload | ✅ มีแล้ว | บันทึกการอัปโหลดไฟล์ |

### Log ที่ยังไม่มี (ต้องสร้างใหม่)

| ตาราง | ประเภท | หมายเหตุ |
|-------|--------|---------|
| `HRB_ACTIVITY_LOG` | Activity Logs ทุกเมนู | CREATE, UPDATE, DELETE, VIEW, EXPORT, APPROVE, REJECT |

---

## 📊 วิเคราะห์แต่ละเมนู

### 1. Dashboard (Index.cshtml)

**Permission Required:** `PAGE_DASHBOARD`

| Action | ควรเก็บ | รายละเอียด |
|--------|---------|-----------|
| VIEW | ❓ Optional | การเข้าดู Dashboard (Read-Only) |
| EXPORT | ✅ ควรเก็บ | ถ้ามีปุ่ม Export รายงาน KPI |

**APIs ที่เกี่ยวข้อง:**
- `GET /api/Summary/kpi-overview` - ดึงข้อมูล KPI

---

### 2. Head Count Planning (BudgetPlanning.cshtml + Budget.cshtml)

**Permission Required:** `PAGE_BUDGET`

| Action | API/Endpoint | ควรเก็บ | Old/New Value |
|--------|--------------|---------|---------------|
| VIEW | `GET /api/Budget/B0Budgets` | ❓ Optional | - |
| CREATE | `POST /api/Budget/...` | ✅ **ต้องเก็บ** | new_value: ข้อมูลที่สร้าง |
| UPDATE | `PUT /api/Budget/...` | ✅ **ต้องเก็บ** | old_value + new_value |
| DELETE | `DELETE /api/Budget/...` | ✅ **ต้องเก็บ** | old_value: ข้อมูลที่ลบ |
| EXPORT | Excel Export | ✅ ควรเก็บ | filter parameters |

**Target ID:** `BudgetId` หรือ `CostCenterCode + BudgetYear`

---

### 3. PE Bonus (BudgetPEBonus.cshtml) - By Cost Center

**Permission Required:** `PAGE_PE`

| Action | API/Endpoint | ควรเก็บ | รายละเอียด |
|--------|--------------|---------|-----------|
| VIEW | `GET /api/Summary/...` | ❓ Optional | หน้า Report |
| EXPORT | Excel Export | ✅ ควรเก็บ | filter + จำนวน rows |

**หมายเหตุ:** เป็นหน้า Report ส่วนใหญ่ Read-Only

---

### 4. PE Head Count (BudgetPEHeadCount.cshtml) - By Grouping

**Permission Required:** `PAGE_PE`

| Action | API/Endpoint | ควรเก็บ | รายละเอียด |
|--------|--------------|---------|-----------|
| VIEW | `GET /api/Summary/...` | ❓ Optional | หน้า Report |
| EXPORT | Excel Export | ✅ ควรเก็บ | filter + จำนวน rows |

**หมายเหตุ:** เป็นหน้า Report ส่วนใหญ่ Read-Only

---

### 5. PE Management (BudgetPEManagement.cshtml) ⭐ **สำคัญมาก**

**Permission Required:** `PAGE_PE`

| Action | API/Endpoint | ควรเก็บ | Old/New Value |
|--------|--------------|---------|---------------|
| VIEW | `GET /api/PEManagement/GetAll` | ❓ Optional | - |
| **MOVE_IN** | `POST /api/PEManagement/MoveIn` | ✅ **ต้องเก็บ** | old: {HC, BaseWage ก่อน}, new: {HC, BaseWage หลัง} |
| **MOVE_OUT** | `POST /api/PEManagement/MoveOut` | ✅ **ต้องเก็บ** | old: {HC, BaseWage ก่อน}, new: {HC, BaseWage หลัง} |
| **ADDITIONAL** | `POST /api/PEManagement/Additional` | ✅ **ต้องเก็บ** | new: {จำนวนที่เพิ่ม, เหตุผล} |
| **CUT** | `POST /api/PEManagement/Cut` | ✅ **ต้องเก็บ** | new: {จำนวนที่ตัด, เหตุผล} |
| **APPROVE** | `POST /api/PEManagement/Movement/Approve/{id}` | ✅ **ต้องเก็บ** | new: {approvedBy, remark} |
| **REJECT** | `POST /api/PEManagement/Movement/Reject/{id}` | ✅ **ต้องเก็บ** | new: {rejectedBy, reason} |
| **UPDATE_B0** | `PUT /api/PEManagement/UpdateB0/{peId}` | ✅ **ต้องเก็บ** | old: {B0_HC, B0_BaseWage}, new: {B0_HC, B0_BaseWage} |
| UPLOAD | `POST /api/PEManagement/UploadFile` | ✅ มีอยู่แล้ว | HRB_UPLOAD_LOG |

**Target ID:** `MovementId`, `PeId`, หรือ `CostCenterCode`

**ตัวอย่าง Log:**
```json
{
  "module_name": "PE Management",
  "action": "MOVE_IN",
  "target_id": "CC001-2026-01",
  "old_value": {"b1_hc": 10, "b1_base_wage": 500000},
  "new_value": {"b1_hc": 12, "b1_base_wage": 600000, "move_in_qty": 2, "move_in_amount": 100000}
}
```

---

### 6. Settings - User Management

**Permission Required:** `PAGE_USER_MANAGEMENT`

| Action | API/Endpoint | ควรเก็บ | Old/New Value |
|--------|--------------|---------|---------------|
| VIEW | `GET /api/User/GetAll` | ❓ Optional | - |
| **CREATE** | `POST /api/User/Create` | ✅ **ต้องเก็บ** | new: {EmpCode, Username, RoleIds, ...} |
| **UPDATE** | `PUT /api/User/Update/{id}` | ✅ **ต้องเก็บ** | old + new (ห้ามเก็บ Password) |
| **DELETE** | `DELETE /api/User/Delete/{id}` | ✅ **ต้องเก็บ** | old: {EmpCode, Username} |
| **ASSIGN_ROLES** | `POST /api/User/AssignRoles/{userId}` | ✅ **ต้องเก็บ** | old: [roleIds ก่อน], new: [roleIds หลัง] |

**Target ID:** `UserId`

**⚠️ ข้อควรระวัง:** ห้ามเก็บ Password ใน Log

---

### 7. Settings - Role Management

**Permission Required:** `PAGE_ROLE_MANAGEMENT`

| Action | API/Endpoint | ควรเก็บ | Old/New Value |
|--------|--------------|---------|---------------|
| VIEW | `GET /api/Role/GetAll` | ❓ Optional | - |
| **CREATE** | `POST /api/Role/Create` | ✅ **ต้องเก็บ** | new: {RoleCode, RoleName, Permissions} |
| **UPDATE** | `PUT /api/Role/Update/{id}` | ✅ **ต้องเก็บ** | old + new |
| **DELETE** | `DELETE /api/Role/Delete/{id}` | ✅ **ต้องเก็บ** | old: {RoleCode, RoleName} |
| **ASSIGN_PERMISSIONS** | `POST /api/Role/AssignPermissions/{roleId}` | ✅ **ต้องเก็บ** | old: [permIds ก่อน], new: [permIds หลัง] |

**Target ID:** `RoleId`

---

### 8. Settings - Master Data (Manage.cshtml)

**Permission Required:** `PAGE_SETTINGS`

| Action | API/Endpoint | ควรเก็บ | Old/New Value |
|--------|--------------|---------|---------------|
| VIEW | `GET /api/Settings/getdata/{modelName}` | ❓ Optional | - |
| **CREATE** | `POST /api/Settings/create/{modelName}` | ✅ **ต้องเก็บ** | new: {ข้อมูลที่สร้าง} |
| **UPDATE** | `PUT /api/Settings/update/{modelName}` | ✅ **ต้องเก็บ** | old + new |
| **DELETE** | `DELETE /api/Settings/delete/{modelName}` | ✅ **ต้องเก็บ** | old: {ข้อมูลที่ลบ} |

**Target ID:** Primary Key ของแต่ละ Model

**Models ที่รองรับ:**
- Company, CostCenter, Division, Department, Section
- Position, JobBand, EmployeeStatus, BenefitType
- และอื่นๆ ตาม SettingsService

---

## 🏗️ Implementation Plan

### Phase 1: สร้าง Database Table (SQL Server)

```sql
-- =============================================
-- Table: HRB_ACTIVITY_LOG
-- Purpose: Centralized Activity Log for All Modules
-- =============================================
CREATE TABLE [dbo].[HRB_ACTIVITY_LOG] (
    [LogId]         BIGINT IDENTITY(1,1) NOT NULL,
    [Timestamp]     DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
    [UserId]        NVARCHAR(50) NOT NULL,          -- EmpCode
    [Username]      NVARCHAR(100) NULL,             -- Display Name
    [UserRole]      NVARCHAR(50) NULL,              -- Role ขณะทำ
    [ModuleName]    NVARCHAR(100) NOT NULL,         -- 'PE Management', 'User Management'
    [Action]        NVARCHAR(30) NOT NULL,          -- CREATE, UPDATE, DELETE, APPROVE, REJECT, EXPORT
    [TargetId]      NVARCHAR(100) NULL,             -- PK ของข้อมูล
    [TargetType]    NVARCHAR(50) NULL,              -- Entity Type: 'Movement', 'User', 'Role'
    [OldValue]      NVARCHAR(MAX) NULL,             -- JSON
    [NewValue]      NVARCHAR(MAX) NULL,             -- JSON
    [IpAddress]     NVARCHAR(45) NULL,              -- IPv4/IPv6
    [UserAgent]     NVARCHAR(500) NULL,             -- Browser/OS
    [RequestUrl]    NVARCHAR(500) NULL,             -- API URL ที่เรียก
    [Status]        NVARCHAR(20) NOT NULL DEFAULT 'SUCCESS',  -- SUCCESS, FAILED
    [ErrorMessage]  NVARCHAR(MAX) NULL,             -- Error details if failed
    [DurationMs]    INT NULL,                       -- Execution time in milliseconds
    
    CONSTRAINT [PK_HRB_ACTIVITY_LOG] PRIMARY KEY CLUSTERED ([LogId] ASC)
);

-- =============================================
-- Indexes for Performance
-- =============================================
CREATE NONCLUSTERED INDEX [IX_ActivityLog_Timestamp] 
    ON [dbo].[HRB_ACTIVITY_LOG] ([Timestamp] DESC);

CREATE NONCLUSTERED INDEX [IX_ActivityLog_UserId] 
    ON [dbo].[HRB_ACTIVITY_LOG] ([UserId]);

CREATE NONCLUSTERED INDEX [IX_ActivityLog_ModuleName] 
    ON [dbo].[HRB_ACTIVITY_LOG] ([ModuleName]);

CREATE NONCLUSTERED INDEX [IX_ActivityLog_Action] 
    ON [dbo].[HRB_ACTIVITY_LOG] ([Action]);

CREATE NONCLUSTERED INDEX [IX_ActivityLog_TargetId] 
    ON [dbo].[HRB_ACTIVITY_LOG] ([TargetId]);

-- Composite Index for common queries
CREATE NONCLUSTERED INDEX [IX_ActivityLog_Module_Timestamp] 
    ON [dbo].[HRB_ACTIVITY_LOG] ([ModuleName], [Timestamp] DESC);

CREATE NONCLUSTERED INDEX [IX_ActivityLog_User_Timestamp] 
    ON [dbo].[HRB_ACTIVITY_LOG] ([UserId], [Timestamp] DESC);
```

### Phase 2: สร้าง Model & Service ✅ **เสร็จแล้ว (6 ม.ค. 2569)**

**Files ที่สร้างใหม่:**
1. ✅ `Models/Log/HRB_ACTIVITY_LOG.cs` - Entity Model
2. ✅ `DTOs/AuditLog/AuditLogDto.cs` - เพิ่ม ActivityLogDto, CreateActivityLogRequest, ActivityLogQueryRequest
3. ✅ `DTOs/AuditLog/AuditLogDto.cs` - เพิ่ม ActivityModules, ActivityActions constants

**Files ที่แก้ไข:**
1. ✅ `Models/HRBudgetDbContext.cs` - เพิ่ม DbSet<HRB_ACTIVITY_LOG>
2. ✅ `Services/IAuditLogService.cs` - เพิ่ม Interface methods
3. ✅ `Services/AuditLogService.cs` - Implement Activity Log methods

**Features ที่ Implement:**
- `GetActivityLogsAsync()` - ดึงข้อมูล Activity Logs พร้อม Filter
- `LogActivityAsync()` - บันทึก Activity Log
- `LogAsync()` - Helper method สำหรับเรียกใช้ง่ายๆ
- `GetDistinctModulesAsync()` - ดึงรายการ Module สำหรับ Dropdown
- `GetDistinctActionsAsync()` - ดึงรายการ Action สำหรับ Dropdown
- Sensitive Data Masking (Password, IDCard, etc.)
- Auto-capture: IP Address, User Agent, Request URL

### Phase 3: เพิ่ม Logging ใน Controllers

| Controller | Priority | Actions ที่ต้องเพิ่ม Log |
|------------|----------|-------------------------|
| `PEManagementController` | 🔴 HIGH | MoveIn, MoveOut, Additional, Cut, Approve, Reject, UpdateB0 |
| `UserController` | 🔴 HIGH | Create, Update, Delete, AssignRoles |
| `RoleController` | 🔴 HIGH | Create, Update, Delete, AssignPermissions |
| `SettingsController` | 🟡 MEDIUM | Create, Update, Delete (ทุก Master Data) |
| `BudgetController` | 🟡 MEDIUM | Create, Update, Delete |

### Phase 4: สร้าง UI สำหรับดู Activity Log

**Option A:** เพิ่ม Tab ใหม่ใน AuditLogs.cshtml
- Tab 1: Login Logs ✅ มีแล้ว
- Tab 2: Email Logs ✅ มีแล้ว  
- Tab 3: Upload Logs ✅ มีแล้ว
- Tab 4: **Activity Logs** 🆕 ใหม่

**Option B:** สร้างหน้าใหม่แยกต่างหาก
- `/Settings/ActivityLogs`

---

## ⚠️ ข้อควรระวัง (Best Practices)

### 1. ห้ามเก็บข้อมูลสำคัญ
```csharp
// ❌ ห้ามทำ
new_value: {"password": "12345", "idCard": "1234567890123"}

// ✅ ควรทำ
new_value: {"password": "***MASKED***", "idCard": "1-xxxx-xxxxx-xx-x"}
```

### 2. Async Logging (ไม่ให้ระบบช้า)
```csharp
// Fire and forget - ไม่รอผลลัพธ์
_ = _activityLogService.LogAsync(logRequest);

// หรือใช้ Background Service / Queue
```

### 3. Data Retention Policy
- กำหนดนโยบายเก็บ Log: 90 วัน / 1 ปี / 5 ปี
- สร้าง Job สำหรับ Archive หรือ Delete Log เก่า

### 4. Read-Only Protection
- ไม่มี API สำหรับ Update/Delete Log
- Database permission: SELECT only สำหรับ Application User

---

## 📌 ลำดับความสำคัญ (Priority)

| ลำดับ | เมนู | Priority | เหตุผล |
|-------|------|----------|--------|
| 1 | PE Management | 🔴 HIGH | มี Transaction สำคัญ (Move In/Out, Approve/Reject) |
| 2 | User Management | 🔴 HIGH | เรื่อง Security - ใครสร้าง/แก้ไข/ลบ User |
| 3 | Role Management | 🔴 HIGH | เรื่อง Security - Permission Changes |
| 4 | Master Data Settings | 🟡 MEDIUM | ข้อมูลพื้นฐานที่กระทบทั้งระบบ |
| 5 | Budget/Head Count | 🟡 MEDIUM | ข้อมูลงบประมาณ |
| 6 | Dashboard/Reports | 🟢 LOW | Optional (เป็น Read-Only) |

---

## 📝 Action Module Names (สำหรับ Logging)

```csharp
public static class ActivityModules
{
    // Main Modules
    public const string Dashboard = "Dashboard";
    public const string HeadCountPlanning = "Head Count Planning";
    public const string PEBonus = "PE Bonus";
    public const string PEHeadCount = "PE Head Count";
    public const string PEManagement = "PE Management";
    
    // Settings Modules
    public const string UserManagement = "User Management";
    public const string RoleManagement = "Role Management";
    public const string MasterData = "Master Data";
    public const string AuditLogs = "Audit Logs";
}

public static class ActivityActions
{
    public const string View = "VIEW";
    public const string Create = "CREATE";
    public const string Update = "UPDATE";
    public const string Delete = "DELETE";
    public const string Export = "EXPORT";
    public const string Import = "IMPORT";
    public const string Approve = "APPROVE";
    public const string Reject = "REJECT";
    public const string MoveIn = "MOVE_IN";
    public const string MoveOut = "MOVE_OUT";
    public const string Additional = "ADDITIONAL";
    public const string Cut = "CUT";
    public const string AssignRole = "ASSIGN_ROLE";
    public const string AssignPermission = "ASSIGN_PERMISSION";
}
```

---

## 🗓️ วันที่วิเคราะห์: 6 มกราคม 2569



