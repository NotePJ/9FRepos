# 📋 PE B1 Implementation Preparation Guide

> **วันที่สร้าง**: 2 ธันวาคม 2025  
> **สถานะ**: เตรียม Implement

---

## 📊 1. ภาพรวมระบบ

### 1.1 วัตถุประสงค์
ระบบ **PE B1 Management** สำหรับจัดการงบประมาณ Headcount (HC) และ Base+Wage โดยใช้ AG Grid เป็น Data Grid หลัก

### 1.2 Flow การทำงาน
```
B0 (Budget ต้นปี) 
    ↓
    + Move In HC/Wage
    - Move Out HC/Wage
    + Additional HC/Wage (Approved by MGT)
    - Cut HC/Wage
    ↓
B1 (Budget After Adjustment)
    ↓
    Compare with Actual
    ↓
Diff B0 / Diff B1
```

---

## 🗄️ 2. Database Models (สร้างแล้ว)

### 2.1 HRB_PE_MANAGEMENT (ข้อมูลหลัก)
**ไฟล์**: `Models/PE/HRB_PE_MANAGEMENT.cs`  
**ตาราง**: `HRB_PE_MANAGEMENT`

| Column | Type | คำอธิบาย |
|--------|------|----------|
| **ID** | int (PK) | Primary Key |
| **PE_COM_ID** | string (PK) | PE Company ID |
| **COMPANY_ID** | int (PK) | Company ID |
| **COMPANY_NAME** | string | ชื่อบริษัท |
| **PE_MONTH** | int | เดือน PE |
| **PE_YEAR** | string | ปี PE |
| **COST_CENTER_CODE** | string | รหัส Cost Center |
| **COST_CENTER_NAME** | string | ชื่อ Cost Center |
| **DIVISION** | string | Division |
| **DEPARTMENT** | string | Department |
| **SECTION** | string | Section |
| **GROUP_DATA** | string | Grouping |
| **B0_HC** | int | Budget ต้นปี HC |
| **B0_BASE_WAGE** | string | Budget ต้นปี Base+Wage |
| **MOVE_IN_HC** | int | HC ย้ายเข้า (current month) |
| **MOVE_IN_BASE_WAGE** | string | Base+Wage ย้ายเข้า |
| **MOVE_OUT_HC** | int | HC ย้ายออก (current month) |
| **MOVE_OUT_BASE_WAGE** | string | Base+Wage ย้ายออก |
| **ADDITIONAL_HC** | int | HC เพิ่ม (current month) |
| **ADDITIONAL_BASE_WAGE** | string | Base+Wage เพิ่ม |
| **CUT_HC** | int | HC ลด (current month) |
| **CUT_BASE_WAGE** | string | Base+Wage ลด |
| **ACC_MOVE_IN_HC** | int | Accumulated Move In HC |
| **ACC_MOVE_IN_BASE_WAGE** | string | Accumulated Move In Base+Wage |
| **ACC_MOVE_OUT_HC** | int | Accumulated Move Out HC |
| **ACC_MOVE_OUT_BASE_WAGE** | string | Accumulated Move Out Base+Wage |
| **ACC_ADD_HC** | int | Accumulated Additional HC |
| **ACC_ADD_BASE_WAGE** | string | Accumulated Additional Base+Wage |
| **ACC_CUT_HC** | int | Accumulated Cut HC |
| **ACC_CUT_BASE_WAGE** | string | Accumulated Cut Base+Wage |
| **B1_HC** | int | Budget หลังปรับ HC |
| **B1_BASE_WAGE** | string | Budget หลังปรับ Base+Wage |
| **ACTUAL_HC** | int | Actual HC |
| **ACTUAL_BASE_WAGE_PREMIUM** | string | Actual Base+Wage+Premium |
| **DIFF_B0_HC** | int | Diff B0 vs Actual HC |
| **DIFF_B0_BASE_WAGE_PREMIUM** | string | Diff B0 vs Actual Base+Wage+Premium |
| **DIFF_B1_HC** | int | Diff B1 vs Actual HC |
| **DIFF_B1_BASE_WAGE_PREMIUM** | string | Diff B1 vs Actual Base+Wage+Premium |
| **IS_ACTIVE** | bool | สถานะ Active |
| **UPDATED_BY** | string | ผู้อัปเดต |
| **UPDATED_DATE** | DateTime | วันที่อัปเดต |

---

### 2.2 HRB_PE_MOVEMENT (ประวัติ Transaction)
**ไฟล์**: `Models/PE/HRB_PE_MOVEMENT.cs`  
**ตาราง**: `HRBUDGET.HRB_PE_MOVEMENT`

| Column | Type | คำอธิบาย |
|--------|------|----------|
| **ID** | int (PK) | Primary Key |
| **PE_MOV_ID** | string (PK) | Movement ID |
| **SEQ** | int | Sequence Number |
| **MOVE_IN_HC** | int | HC ย้ายเข้า |
| **MOVE_IN_BASE_WAGE** | string | Base+Wage ย้ายเข้า |
| **MOVE_OUT_HC** | int | HC ย้ายออก |
| **MOVE_OUT_BASE_WAGE** | string | Base+Wage ย้ายออก |
| **ADDITIONAL_HC** | int | HC เพิ่ม |
| **ADDITIONAL_BASE_WAGE** | string | Base+Wage เพิ่ม |
| **CUT_HC** | int | HC ลด |
| **CUT_BASE_WAGE** | string | Base+Wage ลด |
| **MOVE_IN_COMP** | string | Company ต้นทาง (Move In) |
| **MOVE_OUT_COMP** | string | Company ปลายทาง (Move Out) |
| **MOVE_IN_MONTH** | string | เดือน Move In |
| **MOVE_OUT_MONTH** | string | เดือน Move Out |
| **MOVE_IN_YEAR** | string | ปี Move In |
| **MOVE_OUT_YEAR** | string | ปี Move Out |
| **MOVE_IN_COST_CENTER_CODE** | string | Cost Center ต้นทาง |
| **MOVE_OUT_COST_CENTER_CODE** | string | Cost Center ปลายทาง |
| **MOVE_IN_DIV** | string | Division ต้นทาง |
| **MOVE_OUT_DIV** | string | Division ปลายทาง |
| **MOVE_IN_DEPT** | string | Department ต้นทาง |
| **MOVE_OUT_DEPT** | string | Department ปลายทาง |
| **MOVE_IN_SECT** | string | Section ต้นทาง |
| **MOVE_OUT_SECT** | string | Section ปลายทาง |
| **FLAG_MOVE** | string | Flag: 'I'=Move In Only, 'O'=Move Out Only |
| **REMARK_MOVE** | string | หมายเหตุ |
| **STATUS** | string | สถานะ (Pending/Approved/Rejected) |
| **UPDATED_BY** | string | ผู้อัปเดต |
| **UPDATED_DATE** | DateTime | วันที่อัปเดต |
| **APPROVED_BY** | string | ผู้อนุมัติ |
| **APPROVED_DATE** | DateTime | วันที่อนุมัติ |

---

### 2.3 HRB_UPLOAD_LOG (ไฟล์แนบ)
**ไฟล์**: `Models/Log/HRB_UPLOAD_LOG.cs`  
**ตาราง**: `HRBUDGET.HRB_UPLOAD_LOG`

| Column | Type | คำอธิบาย |
|--------|------|----------|
| **ID** | int (PK) | Primary Key (อ้างอิง Movement ID) |
| **SEQ** | int (PK) | Sequence Number |
| **FILE_NAME** | string | ชื่อไฟล์ |
| **FILE_SIZE** | string | ขนาดไฟล์ (bytes) |
| **FILE_DATA** | byte[] (BLOB) | ข้อมูลไฟล์ Binary |
| **UPLOADED_BY** | string | ผู้อัปโหลด |
| **UPLOADED_DATE** | DateTime | วันที่อัปโหลด |

---

## 📐 3. สูตรการคำนวณ

### 3.1 สูตร B1 (Budget After Adjustment)
```javascript
// B1 HC
B1_HC = B0_HC + ACC_MOVE_IN_HC + ACC_ADD_HC - ACC_MOVE_OUT_HC - ACC_CUT_HC

// B1 Base+Wage
B1_BASE_WAGE = B0_BASE_WAGE + ACC_MOVE_IN_BASE_WAGE + ACC_ADD_BASE_WAGE 
               - ACC_MOVE_OUT_BASE_WAGE - ACC_CUT_BASE_WAGE
```

### 3.2 สูตร Accumulated
```javascript
// Accumulated = ผลรวม Transaction ตั้งแต่เดือนที่ 1 ถึงเดือนปัจจุบัน
ACC_MOVE_IN_HC = SUM(MOVE_IN_HC) WHERE PE_MONTH <= currentMonth AND PE_YEAR = currentYear
```

### 3.3 สูตร Diff (Difference)
```javascript
// Diff B0
DIFF_B0_HC = B0_HC - ACTUAL_HC
DIFF_B0_BASE_WAGE_PREMIUM = B0_BASE_WAGE - ACTUAL_BASE_WAGE_PREMIUM

// Diff B1
DIFF_B1_HC = B1_HC - ACTUAL_HC
DIFF_B1_BASE_WAGE_PREMIUM = B1_BASE_WAGE - ACTUAL_BASE_WAGE_PREMIUM
```

---

## 🎯 4. Transaction Types (4 ประเภท)

### 4.1 Move In/Out (ย้าย HC ระหว่าง Cost Center)
```
Cost Center A  ──[Move Out]──>  Cost Center B
                                 <──[Move In]──
```
- **Move In**: HC เข้ามาที่ Cost Center นี้
- **Move Out**: HC ออกจาก Cost Center นี้
- **ต้องระบุ**: Cost Center ต้นทาง/ปลายทาง

### 4.2 Additional (เพิ่ม HC - ต้อง Approved by MGT)
- เพิ่ม HC ใหม่เข้าระบบ
- ต้องได้รับอนุมัติจาก Management
- สามารถแนบไฟล์เอกสารได้

### 4.3 Cut (ลด HC)
- ลด HC ออกจากระบบ
- ไม่ต้องระบุ Cost Center ปลายทาง

---

## 🖥️ 5. สิ่งที่ต้อง Implement

### 5.1 Backend API (Controller)

#### PEManagementController.cs
```csharp
// GET APIs
[GET] /api/PEManagement/GetAll?companyId={}&peMonth={}&peYear={}
[GET] /api/PEManagement/GetByCostCenter/{costCenterCode}
[GET] /api/PEManagement/GetAccumulatedData?peMonth={}&peYear={}
[GET] /api/PEManagement/GetTransactionHistory/{costCenterCode}

// POST APIs
[POST] /api/PEManagement/MoveIn
[POST] /api/PEManagement/MoveOut
[POST] /api/PEManagement/Additional
[POST] /api/PEManagement/Cut
[POST] /api/PEManagement/UploadFile

// PUT APIs
[PUT] /api/PEManagement/UpdateB0/{id}
[PUT] /api/PEManagement/ApproveTransaction/{movementId}

// Dropdown APIs
[GET] /api/PEManagement/GetCompanies
[GET] /api/PEManagement/GetCostCenters?companyId={}
[GET] /api/PEManagement/GetMonths
[GET] /api/PEManagement/GetYears
```

### 5.2 Frontend View

#### BudgetPEB1.cshtml (AG Grid Page)
```
┌──────────────────────────────────────────────────────────────────┐
│ Filter Bar                                                        │
│ [Company ▼] [Year ▼] [Month ▼] [Search] [Clear] [Export Excel]   │
├──────────────────────────────────────────────────────────────────┤
│ AG Grid                                                           │
│ ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────────┐│
│ │Cost │Group│ B0  │Move │Move │Add  │Cut  │ B1  │Actual│  Diff  ││
│ │Cntr │     │HC/BW│ In  │ Out │     │     │HC/BW│HC/BW │ B0/B1  ││
│ ├─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────────┤│
│ │Data rows...                                                    ││
│ └────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

### 5.3 Offcanvas Panels (แสดงจากด้านขวา)

**Reference:** `budget.plan.offcanvas.js` ของ BudgetPlanning

#### Add Movement Offcanvas (รวม 4 ประเภท Transaction)
```
┌────────────────────────────────────────────┐
│ Add Movement                          [X]  │
├────────────────────────────────────────────┤
│                                            │
│ Cost Center: 90001 - BCM Operation         │
│ (แสดงจากแถวที่เลือกใน Grid)                 │
│                                            │
├────────────────────────────────────────────┤
│                                            │
│ Movement Type:                             │
│ ┌────────────────────────────────────────┐ │
│ │ Select Movement Type              ▼   │ │
│ │  • Move In                            │ │
│ │  • Move Out                           │ │
│ │  • Additional (Approved by MGT)       │ │
│ │  • Cut                                │ │
│ └────────────────────────────────────────┘ │
│                                            │
├────────────────────────────────────────────┤
│ [Dynamic Form Area - ตาม Type ที่เลือก]    │
├────────────────────────────────────────────┤
│              [Cancel] [Submit]             │
└────────────────────────────────────────────┘
```

#### Dynamic Form ตาม Movement Type

**1. Move In Form:**
```
│ From Cost Center: [Dropdown ▼]              │
│ HC:               [Input    ]               │
│ Base+Wage:        [Input    ]               │
│ Remark:           [Textarea ]               │
```

**2. Move Out Form:**
```
│ To Cost Center:   [Dropdown ▼]              │
│ HC:               [Input    ]               │
│ Base+Wage:        [Input    ]               │
│ Remark:           [Textarea ]               │
```

**3. Additional Form (with File Upload):**
```
│ HC:               [Input    ]               │
│ Base+Wage:        [Input    ]               │
│ Remark:           [Textarea ]               │
│ Attach Files:     [Choose Files]            │
│ ┌─────────────────────────────────────────┐ │
│ │ 📄 file1.pdf (1.2 MB)            [X]   │ │
│ │ 📄 file2.xlsx (500 KB)           [X]   │ │
│ └─────────────────────────────────────────┘ │
```

**4. Cut Form:**
```
│ HC:               [Input    ]               │
│ Base+Wage:        [Input    ]               │
│ Remark:           [Textarea ]               │
```

#### Cost Center Detail Offcanvas (Transaction History)
```
┌─────────────────────────────────────────────────────────────────┐
│ Cost Center: 90001 - BCM Operation                        [X]   │
├─────────────────────────────────────────────────────────────────┤
│ Division: xxx    Department: xxx    Section: xxx                │
│                                                                 │
│ Transaction History:                                            │
│ ┌───────┬────────┬─────────┬───────────┬─────────┬───────────┐ │
│ │ Date  │ Type   │ HC      │ Base+Wage │ By      │ Status    │ │
│ ├───────┼────────┼─────────┼───────────┼─────────┼───────────┤ │
│ │ 01/12 │Move In │ +3      │ +104,378  │ Admin   │ Approved  │ │
│ │ 15/11 │Add     │ +1      │ +50,000   │ Admin   │ Pending   │ │
│ └───────┴────────┴─────────┴───────────┴─────────┴───────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                                                    [Close]      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 6. โครงสร้างไฟล์ที่ต้องสร้าง

```
HCBPCoreUI-Backend/
│
├── Controllers/
│   └── PEManagementController.cs          # ⭐ สร้างใหม่
│
├── DTOs/
│   └── PEManagement/
│       ├── PEManagementDto.cs             # ⭐ สร้างใหม่
│       ├── MoveInRequest.cs               # ⭐ สร้างใหม่
│       ├── MoveOutRequest.cs              # ⭐ สร้างใหม่
│       ├── AdditionalRequest.cs           # ⭐ สร้างใหม่
│       ├── CutRequest.cs                  # ⭐ สร้างใหม่
│       └── FileUploadRequest.cs           # ⭐ สร้างใหม่
│
├── Services/
│   ├── IPEManagementService.cs            # ⭐ สร้างใหม่
│   └── PEManagementService.cs             # ⭐ สร้างใหม่
│
├── Views/
│   └── Home/
│       └── BudgetPEManagement.cshtml       # ✅ มีแล้ว
│
├── wwwroot/
│   └── lib/razor/js/
│       └── budget-pe-management/ # ✅ มี Folder แล้ว
│           ├── budget-pe-management.config.js     # ⭐ สร้างใหม่ - ค่า const, configurations
│           ├── budget-pe-management.core.js       # ⭐ สร้างใหม่ - Utility functions
│           ├── budget-pe-management.api.js        # ⭐ สร้างใหม่ - API calls
│           ├── budget-pe-management.offcanvas.js  # ⭐ สร้างใหม่ - Offcanvas (Right Panel)
│           └── budget-pe-management.grid.js       # ⭐ สร้างใหม่ - AG Grid (Read-Only)
│
└── Models/
    └── PE/
        ├── HRB_PE_MANAGEMENT.cs           # ✅ มีแล้ว
        └── HRB_PE_MOVEMENT.cs             # ✅ มีแล้ว
    └── Log/
        └── HRB_UPLOAD_LOG.cs              # ✅ มีแล้ว
```

---

## ✅ 7. Checklist การ Implement

### Phase 1: Backend
- [x] สร้าง DTOs (PEManagementDto, Request classes) ✅ **เสร็จ 3 ธ.ค. 2025**
  - `PEManagementDto.cs` - DTO หลักสำหรับแสดงข้อมูลใน AG Grid
  - `MoveInRequest.cs` - Request สำหรับ Move In Transaction
  - `MoveOutRequest.cs` - Request สำหรับ Move Out Transaction
  - `AdditionalRequest.cs` - Request สำหรับ Additional Transaction
  - `CutRequest.cs` - Request สำหรับ Cut Transaction
  - `FileUploadRequest.cs` - Request สำหรับ Upload ไฟล์แนบ
  - `PEManagementResponse.cs` - Response DTOs และ Filter
- [x] สร้าง IPEManagementService interface ✅ **เสร็จ 3 ธ.ค. 2025**
  - GET APIs: GetAllAsync, GetByCostCenterAsync, GetAccumulatedDataAsync, GetTransactionHistoryAsync
  - Movement APIs: MoveInAsync, MoveOutAsync, AdditionalAsync, CutAsync
  - File APIs: UploadFilesAsync, DownloadFileAsync
  - Update APIs: UpdateB0Async, ApproveTransactionAsync
  - Dropdown APIs: GetCompaniesAsync, GetCostCentersAsync, GetMonthsAsync, GetYearsAsync
  - Calculation: CalculateB1Async, CalculateAccumulatedAsync, CalculateDiffAsync
- [x] สร้าง PEManagementService ✅ **เสร็จ 3 ธ.ค. 2025**
  - Implement ทุก method จาก Interface
  - GET APIs: GetAllAsync, GetByCostCenterAsync, GetAccumulatedDataAsync, GetTransactionHistoryAsync
  - Movement APIs: MoveInAsync, MoveOutAsync, AdditionalAsync, CutAsync (พร้อม Transaction)
  - File APIs: UploadFilesAsync, DownloadFileAsync (รองรับ 4MB, PDF/Excel/Word/Images)
  - Update APIs: UpdateB0Async, ApproveTransactionAsync
  - Dropdown APIs: GetCompaniesAsync, GetCostCentersAsync, GetMonthsAsync, GetYearsAsync
  - Calculation: CalculateB1Async, CalculateAccumulatedAsync, CalculateDiffAsync
  - Helper Methods: MapToDto, GenerateMovementId, ParseDecimal, FormatFileSize
- [x] สร้าง PEManagementController ✅ **เสร็จ 3 ธ.ค. 2025**
  - GET APIs: GetAll, GetByCostCenter, GetAccumulatedData, GetTransactionHistory
  - POST APIs: MoveIn, MoveOut, Additional, Cut
  - File APIs: UploadFile (RequestSizeLimit 20MB), DownloadFile
  - PUT APIs: UpdateB0, ApproveTransaction
  - Dropdown APIs: GetCompanies, GetCostCenters, GetMonths, GetYears
  - Request DTOs: UpdateB0Request, ApproveTransactionRequest
- [x] ลงทะเบียน Service ใน Program.cs ✅ **เสร็จ 3 ธ.ค. 2025**
  - เพิ่ม `builder.Services.AddScoped<IPEManagementService, PEManagementService>();`
- [x] ทดสอบ Build Project ✅ **เสร็จ 3 ธ.ค. 2025** - Build succeeded! 

### Phase 2: Frontend JavaScript Files
- [x] สร้าง `budget-pe-management.config.js` ✅ **เสร็จ 3 ธ.ค. 2025**
  - PE_API endpoints
  - PE_HEADER_COLORS for AG Grid styling
  - PE_MOVEMENT_TYPES (MoveIn, MoveOut, Additional, Cut)
  - PE_FILE_UPLOAD constraints (4MB, allowed types)
  - PE_STATUS (Pending, Approved, Rejected)
  - PE_MONTHS data
  - PE_GRID_OPTIONS
  - PE_NUMBER_FORMAT
  - PE_MESSAGES
  - PE_DEBOUNCE_DELAYS
- [x] สร้าง `budget-pe-management.core.js` ✅ **เสร็จ 3 ธ.ค. 2025**
  - Number formatting (formatNumber, formatCurrency, formatHC, parseDecimal, parseInt)
  - Calculations (calculateB1Hc, calculateB1BaseWage, calculateDiffB0Hc, calculateDiffB1Hc)
  - Validation (validateHC, validateBaseWage, validateFile, validateMoveInForm, etc.)
  - File helpers (formatFileSize, getFileIcon)
  - Date/Time helpers (getCurrentMonth, getCurrentYear, formatDate, formatDateTime)
  - Utilities (debounce, showLoading, hideLoading, showToast, showConfirm)
  - Status badges (getStatusBadge, getMovementTypeBadge)
- [x] สร้าง `budget-pe-management.api.js` ✅ **เสร็จ 3 ธ.ค. 2025**
  - Data retrieval (getAll, getByCostCenter, getTransactionHistory)
  - Movement transactions (moveIn, moveOut, additional, cut)
  - File operations (uploadFile, downloadFile)
  - Update operations (updateB0, approveTransaction)
  - Dropdown data (getCostCenters, getCompanies, getYears, getMonths)
  - Error handling with toast notifications
- [x] สร้าง `budget-pe-management.offcanvas.js` ✅ **เสร็จ 3 ธ.ค. 2025**
  - Offcanvas initialization and management
  - Movement type dropdown with dynamic form rendering
  - Move In/Out/Additional/Cut form sections
  - File upload handling (validation, preview, remove)
  - Form validation and error display
  - Transaction history offcanvas
  - Select2 integration for Cost Center dropdowns
- [x] สร้าง `budget-pe-management.grid.js` ✅ **เสร็จ 3 ธ.ค. 2025**
  - AG Grid column definitions with colored headers
  - Read-Only mode (no cell editing)
  - Action column with Add Movement and View History buttons
  - Value formatters (HC, Currency)
  - Diff cell styling (positive/negative/zero)
  - Data operations (loadData, refreshData, setFilter)
  - Export to Excel functionality
  - Custom event handlers for movement saved
- [x] สร้าง `budget-pe-management.css` ✅ **เสร็จ 3 ธ.ค. 2025**
  - AG Grid header styles (Actual, B0, B1, Move In/Out, Additional, Cut, Diff)
  - Cell styles with background colors
  - Diff value styling (red/green)
  - Offcanvas styles
  - File upload item styles
  - Responsive adjustments

### Phase 3: Frontend View & Integration
- [x] สร้าง/อัพเดท BudgetPEManagement.cshtml ✅ **เสร็จ 3 ธ.ค. 2025**
  - Loading Overlay
  - Filter Card (Company, Year, Month, Cost Center)
  - Info Callout แสดงสูตรคำนวณ B1
  - AG Grid Container พร้อมปุ่ม Export และ Fullscreen
  - Add Movement Offcanvas (Right Side) พร้อม Dynamic Form
  - Transaction History Offcanvas
  - ลงทะเบียน CSS และ JS modules ใน @section Styles/Scripts
  - Main Initialization Script (initFilters, bindFilterEvents)
- [x] เพิ่ม BudgetPEManagement Action ใน HomeController ✅ **เสร็จ 3 ธ.ค. 2025**
- [x] เพิ่มเมนู PE B1 Management ใน _Layout.cshtml ✅ **เสร็จ 3 ธ.ค. 2025**
- [x] ทดสอบ Build Project ✅ **เสร็จ 3 ธ.ค. 2025** - Build succeeded!

### Phase 4: Calculations & Polish
- [ ] คำนวณ Accumulated Data
- [ ] คำนวณ B1 (Budget After Adjustment)
- [ ] คำนวณ Diff B0/B1
- [ ] Export to Excel
- [ ] Error Handling & Validation
- [ ] UI Polish & Testing

---

## 📝 8. หมายเหตุเพิ่มเติม

### 8.1 AG Grid Header Styles (ตามรูปตัวอย่าง)

#### 8.1.1 Column Groups & Colors

| กลุ่ม Header | Background Color | Text Color | CSS Class |
|-------------|------------------|------------|-----------|
| **Cost center, Cost center detail** | ไม่มีสี (default) | Black | - |
| **Cost center name** | ไม่มีสี (default) | Black | - |
| **Div, Departm, Section** | 🟡 เหลืองอ่อน `#FFFF99` | Black | `header-org` |
| **Grouping** | ไม่มีสี (default) | Black | - |
| **B0 (HC, Base+Wage)** | 🟢 เขียวอ่อน `#C6EFCE` | Black | `header-b0` |
| **Move HC in (HC, Base+Wage)** | 🔴 แดงอ่อน/ชมพู `#FFC7CE` | Black | `header-move-in` |
| **Move HC Out (HC, Base+Wage)** | 🔴 แดงอ่อน/ชมพู `#FFC7CE` | Black | `header-move-out` |
| **Additional (Approved by MGT)** | 🟢 เขียว `#92D050` | Black | `header-additional` |
| **Cut (HC, Base+Wage)** | 🟢 เขียว `#92D050` | Black | `header-cut` |
| **Acc. Transfer in** | 🔴 แดงอ่อน/ชมพู `#FFC7CE` | Black | `header-acc-transfer-in` |
| **Acc. Transfer Out** | 🔴 แดงอ่อน/ชมพู `#FFC7CE` | Black | `header-acc-transfer-out` |
| **Acc. Additional (Approved by MGT)** | 🟢 เขียว `#92D050` | Black | `header-acc-additional` |
| **Acc. Cut** | 🟢 เขียว `#92D050` | Black | `header-acc-cut` |
| **B1 (After adjust)** | 🔵 ฟ้า `#00B0F0` | White | `header-b1` |
| **Actual (Grouping, HC, Base+Wage+Premium)** | ⚫ เทาเข้ม `#808080` | White | `header-actual` |
| **Diff from B0** | 🟠 ส้ม `#FFC000` | Black | `header-diff-b0` |
| **Diff from B1** | 🟠 ส้ม `#FFC000` | Black | `header-diff-b1` |

#### 8.1.2 CSS Styles

```css
/* AG Grid Header Styles for PE B1 */

/* Organization columns - Yellow */
.header-org {
    background-color: #FFFF99 !important;
    color: #000000 !important;
}

/* B0 columns - Light Green */
.header-b0 {
    background-color: #C6EFCE !important;
    color: #000000 !important;
}

/* Move In/Out columns - Light Red/Pink */
.header-move-in,
.header-move-out,
.header-acc-transfer-in,
.header-acc-transfer-out {
    background-color: #FFC7CE !important;
    color: #000000 !important;
}

/* Additional & Cut columns - Green */
.header-additional,
.header-cut,
.header-acc-additional,
.header-acc-cut {
    background-color: #92D050 !important;
    color: #000000 !important;
}

/* B1 columns - Blue */
.header-b1 {
    background-color: #00B0F0 !important;
    color: #FFFFFF !important;
    font-weight: bold;
}

/* Actual columns - Dark Gray */
.header-actual {
    background-color: #808080 !important;
    color: #FFFFFF !important;
}

/* Diff columns - Orange */
.header-diff-b0,
.header-diff-b1 {
    background-color: #FFC000 !important;
    color: #000000 !important;
}
```

#### 8.1.3 AG Grid Column Definition Example

**หมายเหตุ:** Grid เป็น **Read-Only** ไม่มี Cell Editing - ใช้ Button "Add Movement" แทน

```javascript
// Column Group: B0
{
    headerName: 'B0',
    headerClass: 'header-b0',
    children: [
        { headerName: 'HC', field: 'b0Hc', width: 80 },
        { headerName: 'Base+Wage', field: 'b0BaseWage', width: 120 }
    ]
},

// Column Group: Move HC in (Read-Only)
{
    headerName: 'Move HC in',
    headerClass: 'header-move-in',
    children: [
        { headerName: 'HC', field: 'moveInHc', width: 80 },
        { headerName: 'Base+Wage', field: 'moveInBaseWage', width: 120 }
    ]
},

// Column Group: B1 (After adjust)
{
    headerName: 'B1 (After adjust)',
    headerClass: 'header-b1',
    children: [
        { headerName: 'Grouping', field: 'b1Grouping', width: 120 },
        { headerName: 'HC', field: 'b1Hc', width: 80 },
        { headerName: 'Base+Wage', field: 'b1BaseWage', width: 120 }
    ]
},

// Column Group: Actual
{
    headerName: 'Actual',
    headerClass: 'header-actual',
    children: [
        { headerName: 'Grouping', field: 'actualGrouping', width: 120 },
        { headerName: 'HC', field: 'actualHc', width: 80 },
        { headerName: 'Base+Wage+Premium', field: 'actualBaseWagePremium', width: 150 }
    ]
},

// Column Group: Diff from B0
{
    headerName: 'Diff from B0',
    headerClass: 'header-diff-b0',
    children: [
        { headerName: 'HC', field: 'diffB0Hc', width: 80 },
        { headerName: 'Base+Wage+Premium', field: 'diffB0BaseWagePremium', width: 150 }
    ]
},

// Action Column - Add Movement Button
{
    headerName: 'Action',
    field: 'action',
    width: 120,
    pinned: 'right',
    cellRenderer: 'actionCellRenderer'  // ปุ่ม Add Movement
}
```

#### 8.1.4 Row Highlighting (Cell มีค่า)

```javascript
// Cell Style - Highlight cells with values
cellStyle: params => {
    if (params.value && params.value !== 0 && params.value !== '-') {
        // Pink background for Move In/Out cells with values
        if (params.colDef.field.includes('moveIn') || params.colDef.field.includes('moveOut')) {
            return { backgroundColor: '#FFC7CE' };
        }
        // Yellow background for rows with any transaction
        return { backgroundColor: '#FFFF00' };
    }
    return null;
}
```

---

### 8.2 สีที่ใช้ใน Grid (สรุป)
- **สีเหลือง**: แถวที่มี Transaction
- **สีชมพู/แดง**: Move In มีค่า
- **สีเขียว**: Acc. Additional, Acc. Cut headers
- **สีฟ้า**: B1 (After adjust) headers
- **สีเทา**: Actual, Diff headers

### 8.2 File Upload Constraints
- Max file size: 4 MB
- Allowed types: PDF, Excel, Word, Images
- Store as BLOB ใน Oracle

### 8.3 Approval Workflow (Optional)
- Additional Transaction ต้องได้รับอนุมัติ
- Status: Pending → Approved/Rejected
- Email notification (optional)

---

**🚀 พร้อม Implement เมื่อได้รับคำสั่งถัดไป!**
