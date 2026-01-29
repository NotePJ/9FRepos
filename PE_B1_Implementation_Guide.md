# เอกสารสรุปการสร้างหน้า AgGrid.cshtml สำหรับระบบ HR Budget Planning

## สารบัญ
1. [ภาพรวมของระบบ](#1-ภาพรวมของระบบ)
2. [โครงสร้างโปรเจค](#2-โครงสร้างโปรเจค)
3. [Database Schema และ Models](#3-database-schema-และ-models)
4. [Backend API Controllers](#4-backend-api-controllers)
5. [Frontend Implementation](#5-frontend-implementation)
6. [ฟีเจอร์หลักของระบบ](#6-ฟีเจอร์หลักของระบบ)
7. [File Upload System](#7-file-upload-system)
8. [การติดตั้งและ Configuration](#8-การติดตั้งและ-configuration)
9. [สรุปขั้นตอนการนำไปใช้](#9-สรุปขั้นตอนการนำไปใช้)

---

## 1. ภาพรวมของระบบ

### วัตถุประสงค์
ระบบ HR Budget Planning เป็นเว็บแอปพลิเคชันสำหรับจัดการงบประมาณ Headcount (HC) และ Base+Wage โดยใช้ AG Grid เป็น Data Grid หลัก

### เทคโนโลยีที่ใช้
- **Backend**: ASP.NET Core 8.0/9.0 (C#)
- **Database**: Oracle Database
- **ORM**: Entity Framework Core (Oracle Provider)
- **Frontend Framework**: Razor Pages (MVC)
- **Data Grid**: AG Grid Community Edition
- **UI Library**: Bootstrap 5
- **Additional Libraries**:
  - jQuery
  - Select2 (Dropdown enhancement)
  - SheetJS (XLSX) สำหรับ Excel Export
  
### คุณสมบัติหลัก
1. แสดงข้อมูลงบประมาณด้วย AG Grid พร้อม Filtering, Sorting
2. ระบบ Transaction 4 ประเภท:
   - **Move In/Out**: ย้าย HC และ Budget ระหว่าง Cost Center
   - **Additional**: เพิ่ม HC และ Budget (ต้องอัปโหลดเอกสารประกอบ)
   - **Cut**: ลด HC และ Budget
3. คำนวณค่า Accumulated และ B1 (Budget After Adjustment) อัตโนมัติ
4. Export ข้อมูลเป็น Excel
5. แสดงประวัติการทำ Transaction ของแต่ละ Cost Center

---

## 2. โครงสร้างโปรเจค

```
HRBudgetApp/
│
├── Controllers/
│   ├── BudgetApiController.cs          # REST API สำหรับ CRUD operations
│   └── HomeController.cs               # Controller สำหรับ View
│
├── Models/
│   ├── Budget.cs                       # Model หลัก + Transaction & Upload models
│   ├── BudgetDbContext.cs              # Database Context
│   └── ErrorViewModel.cs               # Error handling model
│
├── Views/
│   ├── Home/
│   │   ├── Index.cshtml               # Home page
│   │   ├── AgGrid.cshtml              # หน้าหลักของระบบ (AG Grid)
│   │   └── Privacy.cshtml
│   └── Shared/
│       ├── _Layout.cshtml              # Layout template
│       └── Error.cshtml
│
├── wwwroot/
│   ├── css/
│   │   └── site.css                    # Custom styles
│   ├── js/
│   │   └── site.js                     # Custom JavaScript (ถ้ามี)
│   ├── lib/                            # Client-side libraries
│   │   ├── ag-grid-community/
│   │   ├── bootstrap/
│   │   ├── jquery/
│   │   ├── select2/
│   │   └── xlsx/
│   └── fonts/
│       └── SanFrancisco/               # Custom fonts
│
├── appsettings.json                    # Configuration file
├── Program.cs                          # Application entry point
└── HRBudgetApp.csproj                 # Project file

```

---

## 3. Database Schema และ Models

### 3.1 ตาราง HRIS_HR_BUDGET_DATA (Main Budget Table)

**Composite Key**: `COST_CENTER_CODE`, `PE_MONTH`, `PE_YEAR`

#### คอลัมน์หลัก:
| Column | Type | Description |
|--------|------|-------------|
| CODCOMP | VARCHAR2 | Company Code |
| REF_ID | VARCHAR2 | Reference ID (YearMonthCostCenterCode) |
| COMPANY | VARCHAR2 | ชื่อบริษัท |
| DIVISION | VARCHAR2 | Division |
| DEPARTMENT | VARCHAR2 | Department |
| SECTION | VARCHAR2 | Section |
| COST_CENTER_CODE | VARCHAR2 | รหัส Cost Center (PK) |
| COST_CENTER_NAME | VARCHAR2 | ชื่อ Cost Center |
| GROUP_DATA | VARCHAR2 | Grouping |
| B0_HC | NUMBER | Budget ต้นปี HC |
| B0_BASE_WAGE | VARCHAR2 | Budget ต้นปี Base+Wage |
| MOVE_IN_HC | NUMBER | HC ที่ย้ายเข้า |
| MOVE_IN_BASE_WAGE | VARCHAR2 | Base+Wage ที่ย้ายเข้า |
| MOVE_OUT_HC | NUMBER | HC ที่ย้ายออก |
| MOVE_OUT_BASE_WAGE | VARCHAR2 | Base+Wage ที่ย้ายออก |
| ADDITIONAL_HC | NUMBER | HC ที่เพิ่ม |
| ADDITIONAL_BASE_WAGE | VARCHAR2 | Base+Wage ที่เพิ่ม |
| CUT_HC | NUMBER | HC ที่ลด |
| CUT_BASE_WAGE | VARCHAR2 | Base+Wage ที่ลด |
| ACC_MOVE_IN_HC | NUMBER | Accumulated Move In HC |
| ACC_MOVE_IN_BASE_WAGE | VARCHAR2 | Accumulated Move In Base+Wage |
| ACC_MOVE_OUT_HC | NUMBER | Accumulated Move Out HC |
| ACC_MOVE_OUT_BASE_WAGE | VARCHAR2 | Accumulated Move Out Base+Wage |
| ACC_ADD_HC | NUMBER | Accumulated Additional HC |
| ACC_ADD_BASE_WAGE | VARCHAR2 | Accumulated Additional Base+Wage |
| ACC_CUT_HC | NUMBER | Accumulated Cut HC |
| ACC_CUT_BASE_WAGE | VARCHAR2 | Accumulated Cut Base+Wage |
| B1_HC | NUMBER | Budget หลังปรับ HC |
| B1_BASE_WAGE | VARCHAR2 | Budget หลังปรับ Base+Wage |
| ACTUAL_HC | NUMBER | Actual HC |
| ACTUAL_BASE_WAGE_PREMIUM | VARCHAR2 | Actual Base+Wage+Premium |
| DIFF_B0_HC | NUMBER | Difference B0 vs Actual HC |
| DIFF_B0_BASE_WAGE_PREMIUM | VARCHAR2 | Difference B0 vs Actual Base+Wage+Premium |
| DIFF_B1_HC | NUMBER | Difference B1 vs Actual HC |
| DIFF_B1_BASE_WAGE_PREMIUM | VARCHAR2 | Difference B1 vs Actual Base+Wage+Premium |
| PE_MONTH | NUMBER | เดือนที่มีผล (PK) |
| PE_YEAR | VARCHAR2 | ปีที่มีผล (PK) |
| IS_CANCEL | VARCHAR2 | สถานะยกเลิก |
| UPDATE_BY | VARCHAR2 | ผู้อัปเดตล่าสุด |
| UPDATE_DATE | DATE | วันที่อัปเดตล่าสุด |

### 3.2 ตาราง HRIS_HR_BUDGET_DATA_HIST (Transaction History)

**Composite Key**: `REF_ID`, `SEQ`

| Column | Type | Description |
|--------|------|-------------|
| REF_ID | VARCHAR2 | Reference ID (PK) |
| SEQ | NUMBER | Sequence Number (PK) |
| MOVE_IN_HC | NUMBER | HC ที่ย้ายเข้า |
| MOVE_IN_BASE_WAGE | VARCHAR2 | Base+Wage ที่ย้ายเข้า |
| MOVE_OUT_HC | NUMBER | HC ที่ย้ายออก |
| MOVE_OUT_BASE_WAGE | VARCHAR2 | Base+Wage ที่ย้ายออก |
| ADDITIONAL_HC | NUMBER | HC ที่เพิ่ม |
| ADDITIONAL_BASE_WAGE | VARCHAR2 | Base+Wage ที่เพิ่ม |
| CUT_HC | NUMBER | HC ที่ลด |
| CUT_BASE_WAGE | VARCHAR2 | Base+Wage ที่ลด |
| MOVE_IN_COST_CENTER_CODE | VARCHAR2 | Cost Center ต้นทาง/ปลายทาง (Move In) |
| MOVE_OUT_COST_CENTER_CODE | VARCHAR2 | Cost Center ต้นทาง/ปลายทาง (Move Out) |
| FLAG_MOVE | VARCHAR2 | Flag สำหรับ Move Only ('I'=Move In Only, 'O'=Move Out Only) |
| REMARK_MOVE | VARCHAR2(255) | หมายเหตุสำหรับ Move Only |
| UPDATE_BY | VARCHAR2 | ผู้ทำ Transaction |
| UPDATE_DATE | DATE | วันที่ทำ Transaction |

### 3.3 ตาราง HRIS_HR_BUDGET_FILES (File Upload)

**Composite Key**: `REF_ID`, `SEQ`

| Column | Type | Description |
|--------|------|-------------|
| REF_ID | VARCHAR2 | Reference ID (PK) |
| SEQ | NUMBER | Sequence Number (PK) |
| FILE_NAME | VARCHAR2 | ชื่อไฟล์ |
| FILE_SIZE | VARCHAR2 | ขนาดไฟล์ (bytes) |
| FILE_DATA | BLOB | ข้อมูลไฟล์ (Binary) |
| UPLOADED_BY | VARCHAR2 | ผู้อัปโหลด |
| UPLOADED_DATE | DATE | วันที่อัปโหลด |

### 3.4 C# Models (Budget.cs)

```csharp
[Table("HRIS_HR_BUDGET_DATA", Schema = "HRMS")]
[Index(nameof(CostCenterCode), Name = "IX_Budget_CostCenterCode")]
[Index(nameof(PEYear), nameof(PEMonth), Name = "IX_Budget_PEYear_PEMonth")]
[Index(nameof(CostCenterCode), nameof(PEYear), nameof(PEMonth), Name = "IX_Budget_CostCenter_Period")]
public class Budget
{
    [Key]
    [Column("COST_CENTER_CODE")]
    public string CostCenterCode { get; set; } = string.Empty;
    
    [Key]
    [Column("PE_MONTH")]
    public int PEMonth { get; set; }
    
    [Key]
    [Column("PE_YEAR")]
    public string PEYear { get; set; } = string.Empty;
    
    // ... properties อื่นๆ ตามตารางด้านบน
}

[Table("HRIS_HR_BUDGET_DATA_HIST", Schema = "HRMS")]
public class BudgetTransaction
{
    [Key]
    [Column("REF_ID")]
    public string REFId { get; set; } = string.Empty;
    
    [Key]
    [Column("SEQ")]
    public int SEQ { get; set; }
    
    // ... properties อื่นๆ
}

[Table("HRIS_HR_BUDGET_FILES", Schema = "HRMS")]
public class BudgetUploads
{
    [Key]
    [Column("REF_ID")]
    public string REFId { get; set; } = string.Empty;
    
    [Key]
    [Column("SEQ")]
    public int SEQ { get; set; }
    
    [Column("FILE_DATA", TypeName = "BLOB")]
    [MaxLength]
    public byte[]? FileData { get; set; }
    
    // ... properties อื่นๆ
}
```

### 3.5 BudgetDbContext.cs

```csharp
public class BudgetDbContext : DbContext
{
    public BudgetDbContext(DbContextOptions<BudgetDbContext> options) : base(options) { }

    public DbSet<Budget> Budgets { get; set; }
    public DbSet<BudgetTransaction> BudgetTransactions { get; set; }
    public DbSet<BudgetUploads> BudgetUploads { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // กำหนด Composite Key
        modelBuilder.Entity<Budget>()
            .HasKey(b => new { b.CostCenterCode, b.PEMonth, b.PEYear });
        
        modelBuilder.Entity<BudgetTransaction>()
            .HasKey(bt => new { bt.REFId, bt.SEQ });
        
        modelBuilder.Entity<BudgetUploads>()
            .HasKey(bu => new { bu.REFId, bu.SEQ });
        
        // กำหนด BLOB property สำหรับ Oracle
        modelBuilder.Entity<BudgetUploads>()
            .Property(bu => bu.FileData)
            .HasColumnType("BLOB");
    }
}
```

---
## 6. ฟีเจอร์หลักของระบบ

### 6.1 AG Grid Configuration

#### 6.1.1 Column Definitions

```javascript
var columnData = [
    {
        headerName: "Cost center",
        field: "costCenterCode",
        sortable: true,
        filter: 'agTextColumnFilter',
        width: 130,
        pinned: 'left',  // ติดซ้ายเสมอ
        cellRenderer: function (params) {
            // แสดงเป็น Link เพื่อเปิด Detail Modal
            return `<a href="#" onclick="openCostCenterModal('${params.value}'); return false;" 
                       style="color: #007bff; text-decoration: underline;">
                       ${params.value}
                    </a>`;
        }
    },
    { 
        headerName: "Cost center name", 
        field: "costCenterName", 
        width: 160, 
        pinned: 'left' 
    },
    { 
        headerName: "Grouping", 
        field: "groupData", 
        width: 160, 
        pinned: 'left' 
    },
    { headerName: "Division", field: "division", width: 150 },
    { headerName: "Department", field: "department", width: 150 },
    { headerName: "Section", field: "section", width: 150 },
    
    // Column Group: B0
    {
        headerName: "B0",
        children: [
            { 
                headerName: "HC", 
                field: "b0HC", 
                editable: true,  // สามารถแก้ไขได้
                cellEditor: 'agNumberCellEditor', 
                cellEditorParams: { min: 0, precision: 0 },
                width: 100 
            },
            { 
                headerName: "Base+Wage", 
                field: "b0BaseWage", 
                editable: true,
                cellEditor: 'agTextCellEditor', 
                width: 150 
            }
        ]
    },
    
    // Column Group: Transaction (Move In)
    {
        headerName: "Transection (Move In)",
        children: [
            { 
                headerName: "HC", 
                field: "moveInHC", 
                editable: true,  // แก้ไขเพื่อเปิด Modal
                width: 100 
            },
            { 
                headerName: "Base+Wage", 
                field: "moveInBaseWage", 
                editable: true,
                width: 150 
            }
        ]
    },
    
    // Column Groups อื่นๆ: Move Out, Additional, Cut
    // Accumulated (Move In, Move Out, Additional, Cut) - Read Only
    // B1, Actual, Diff B0, Diff B1
    // Effective (Month, Year)
];
```

#### 6.1.2 Grid Options

```javascript
var gridOptions = {
    columnDefs: columnData,
    defaultColDef: {
        filter: true,
        sortable: true,
        floatingFilter: true  // แสดง filter bar ใต้ header
    },
    getRowId: function (params) {
        // สร้าง unique row ID
        return params.data.costCenterCode + '_' + 
               params.data.peMonth + '_' + 
               params.data.peYear;
    },
    onCellValueChanged: function (event) {
        // จัดการเมื่อ cell มีการเปลี่ยนแปลง
        handleCellValueChanged(event);
    }
};
```

### 6.2 การโหลดข้อมูลและ Filter

#### 6.2.1 โหลด Filter Options

```javascript
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    gridApi = agGrid.createGrid(gridDiv, gridOptions);

    // แสดง loader
    document.getElementById('loader').style.display = 'flex';
    document.getElementById('myGrid').style.display = 'none';

    // โหลด filter options (companies, months, years)
    Promise.all([
        fetch('/api/BudgetApi/companies').then(r => r.json()),
        fetch('/api/BudgetApi/months').then(r => r.json()),
        fetch('/api/BudgetApi/years').then(r => r.json())
    ]).then(([companies, months, years]) => {
        // เติม company dropdown
        const companyFilter = document.getElementById('companyFilter');
        companies.forEach(company => {
            const option = document.createElement('option');
            option.value = company;
            option.text = company;
            companyFilter.appendChild(option);
        });
        $('#companyFilter').select2();  // ใช้ Select2

        // เติม month dropdown (แปลงเลขเป็นชื่อเดือน)
        const MONTH_NAMES = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                             "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthFilter = document.getElementById('monthFilter');
        months.forEach(month => {
            const option = document.createElement('option');
            const m = parseInt(month, 10);
            option.value = month;
            option.text = MONTH_NAMES[m];
            monthFilter.appendChild(option);
        });
        $('#monthFilter').select2();

        // เติม year dropdown
        const yearFilter = document.getElementById('yearFilter');
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.text = year;
            yearFilter.appendChild(option);
        });
        $('#yearFilter').select2();

        // ซ่อน loader หลังโหลดเสร็จ
        setTimeout(function () {
            document.getElementById('loader').style.display = 'none';
            document.getElementById('myGrid').style.display = 'block';
        }, 1000);
    });
});
```

#### 6.2.2 Search Button Handler

```javascript
document.getElementById('searchBtn').onclick = function () {
    const selectedCompany = $('#companyFilter').val();
    const selectedYear = $('#yearFilter').val();
    const selectedMonth = $('#monthFilter').val();

    // Validation
    if (!selectedYear || !selectedMonth) {
        alert('กรุณาเลือก Year และ Month ก่อนค้นหา');
        return;
    }

    // สร้าง URL สำหรับ Main API
    let url = '/api/BudgetApi?';
    if (selectedCompany) url += `company=${encodeURIComponent(selectedCompany)}&`;
    if (selectedYear) url += `year=${encodeURIComponent(selectedYear)}&`;
    if (selectedMonth) url += `month=${encodeURIComponent(selectedMonth)}&`;

    // สร้าง URL สำหรับ Unified Accumulated Data API
    let accumulatedUrl = '/api/BudgetApi/AccumulatedData?types=All&';
    if (selectedCompany) accumulatedUrl += `company=${encodeURIComponent(selectedCompany)}&`;
    accumulatedUrl += `year=${encodeURIComponent(selectedYear)}&`;
    accumulatedUrl += `month=${encodeURIComponent(selectedMonth)}`;

    // เรียก API ทั้งสองพร้อมกัน
    Promise.all([
        fetch(url).then(response => response.json()),
        fetch(accumulatedUrl).then(response => response.json())
    ]).then(([budgetData, accumulatedData]) => {
        
        // สร้าง lookup map สำหรับ accumulated data
        const accumulatedMap = {};
        if (accumulatedData && accumulatedData.data) {
            accumulatedData.data.forEach(item => {
                const key = `${item.costCenterCode}_${item.peMonth}_${item.peYear}`;
                const acc = item.accumulatedData;
                
                accumulatedMap[key] = {
                    accMoveInHC: acc.moveIn ? acc.moveIn.hc : 0,
                    accMoveInBaseWage: acc.moveIn ? acc.moveIn.baseWage.toFixed(2) : '0.00',
                    accMoveOutHC: acc.moveOut ? acc.moveOut.hc : 0,
                    accMoveOutBaseWage: acc.moveOut ? acc.moveOut.baseWage.toFixed(2) : '0.00',
                    accAddHC: acc.additional ? acc.additional.hc : 0,
                    accAddBaseWage: acc.additional ? acc.additional.baseWage.toFixed(2) : '0.00',
                    accCutHC: acc.cut ? acc.cut.hc : 0,
                    accCutBaseWage: acc.cut ? acc.cut.baseWage.toFixed(2) : '0.00'
                };
            });
        }

        // ผสานข้อมูลและคำนวณ b1HC, b1BaseWage, Diff
        const mergedData = budgetData.map(row => {
            const key = `${row.costCenterCode}_${row.peMonth}_${row.peYear}`;
            const accumulatedInfo = accumulatedMap[key];
            
            // คำนวณ accumulated values
            const accMoveInHC = accumulatedInfo ? accumulatedInfo.accMoveInHC : 0;
            const accMoveOutHC = accumulatedInfo ? accumulatedInfo.accMoveOutHC : 0;
            const accAddHC = accumulatedInfo ? accumulatedInfo.accAddHC : 0;
            const accCutHC = accumulatedInfo ? accumulatedInfo.accCutHC : 0;
            const b0HC = row.b0HC || 0;
            
            const accMoveInBaseWage = parseFloat(accumulatedInfo ? 
                accumulatedInfo.accMoveInBaseWage : '0.00');
            const accMoveOutBaseWage = parseFloat(accumulatedInfo ? 
                accumulatedInfo.accMoveOutBaseWage : '0.00');
            const accAddBaseWage = parseFloat(accumulatedInfo ? 
                accumulatedInfo.accAddBaseWage : '0.00');
            const accCutBaseWage = parseFloat(accumulatedInfo ? 
                accumulatedInfo.accCutBaseWage : '0.00');
            const b0BaseWage = parseFloat(row.b0BaseWage || '0.00');
            
            // สูตรคำนวณ B1
            // b1HC = (b0HC + accMoveInHC + accAddHC) - (accMoveOutHC + accCutHC)
            const calculatedB1HC = (b0HC + accMoveInHC + accAddHC) - 
                                   (accMoveOutHC + accCutHC);
            
            // b1BaseWage = (b0BaseWage + accMoveInBaseWage + accAddBaseWage) - 
            //              (accMoveOutBaseWage + accCutBaseWage)
            const calculatedB1BaseWage = (b0BaseWage + accMoveInBaseWage + accAddBaseWage) - 
                                         (accMoveOutBaseWage + accCutBaseWage);
            
            // สูตรคำนวณ Diff
            const actualHC = row.actualHC || 0;
            const diffB0HC = b0HC - actualHC;
            const diffB1HC = calculatedB1HC - actualHC;
            
            const actualBaseWagePremium = parseFloat(row.actualBaseWagePremium) || 0;
            const diffB0BaseWagePremium = b0BaseWage - actualBaseWagePremium;
            const diffB1BaseWagePremium = calculatedB1BaseWage - actualBaseWagePremium;
            
            return {
                ...row,
                // Accumulated values
                accMoveInHC, accMoveInBaseWage: accMoveInBaseWage.toFixed(2),
                accMoveOutHC, accMoveOutBaseWage: accMoveOutBaseWage.toFixed(2),
                accAddHC, accAddBaseWage: accAddBaseWage.toFixed(2),
                accCutHC, accCutBaseWage: accCutBaseWage.toFixed(2),
                // Calculated B1 values
                b1HC: calculatedB1HC,
                b1BaseWage: calculatedB1BaseWage.toFixed(2),
                // Calculated Diff values
                diffB0HC, diffB1HC,
                diffB0BaseWagePremium: diffB0BaseWagePremium.toFixed(2),
                diffB1BaseWagePremium: diffB1BaseWagePremium.toFixed(2)
            };
        });

        // อัปเดต Grid
        gridApi.setGridOption('rowData', mergedData);
    }).catch(error => {
        console.error('Error loading data:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + error.message);
    });
};
```

### 6.3 การจัดการ Cell Value Changed

```javascript
onCellValueChanged: function (event) {
    // 1. B0 Update - แสดง Confirmation Modal
    if (event.colDef.field === "b0HC" || event.colDef.field === "b0BaseWage") {
        pendingEvent = event;
        document.getElementById('editFieldName').textContent = event.colDef.headerName;
        document.getElementById('editFieldValue').textContent = event.newValue;
        if (!confirmModal) {
            confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
        }
        confirmModal.show();
    }

    // 2. Move In Transaction - เปิด Modal Move In
    if (["moveInHC", "moveInBaseWage"].includes(event.colDef.field)) {
        MoveIntransectionEvent = event;
        
        // เติมข้อมูลต้นทาง (readonly)
        document.getElementById('MICompanyModal').value = event.data.company || '';
        document.getElementById('MIfromCostCenterDisplay').value = 
            event.data.costCenterCode + ' : ' + event.data.costCenterName;
        document.getElementById('MIfromCostCenter').value = event.data.costCenterCode;
        document.getElementById('MIpeMonthModal').value = event.data.peMonth;
        document.getElementById('MIpeYearModal').value = event.data.peYear;
        
        // แปลงเลขเดือนเป็นชื่อ
        const MONTH_NAMES = ["", "Jan", "Feb", ...];
        const monthIndex = parseInt(event.data.peMonth, 10);
        document.getElementById('MIpeMonthModalDisplay').value = MONTH_NAMES[monthIndex];
        
        // โหลด Company dropdown
        fetch('/api/BudgetApi/companies')
            .then(r => r.json())
            .then(companies => {
                const companySelect = document.getElementById('MItoCompany');
                companySelect.innerHTML = '';
                companies.forEach(company => {
                    const option = document.createElement('option');
                    option.value = company;
                    option.text = company;
                    companySelect.appendChild(option);
                });
                $('#MItoCompany').select2({
                    dropdownParent: $('#MoveIntransectionModal')
                });

                // Set default company
                const defaultCompany = document.getElementById('MICompanyModal').value;
                if (defaultCompany) {
                    companySelect.value = defaultCompany;
                    $(companySelect).trigger('change.select2');
                }

                // โหลด Cost Center ตามบริษัทที่เลือก
                loadCostCenters(companySelect.value, 
                                event.data.peMonth, 
                                event.data.peYear);
            });
        
        // เติมค่า HC และ Base+Wage เดิม
        document.getElementById('MImoveInHC').value = event.data.moveInHC || '';
        document.getElementById('MImoveInBaseWage').value = event.data.moveInBaseWage || '';
        document.getElementById('MImoveOutHC').value = event.data.moveOutHC || '';
        document.getElementById('MImoveOutBaseWage').value = event.data.moveOutBaseWage || '';
        
        // แสดง Modal
        if (!MoveIntransectionModal) {
            MoveIntransectionModal = new bootstrap.Modal(
                document.getElementById('MoveIntransectionModal'));
        }
        MoveIntransectionModal.show();
    }

    // 3. Move Out Transaction - เปิด Modal Move Out
    // 4. Additional Transaction - เปิด Modal Additional
    // 5. Cut Transaction - เปิด Modal Cut
    // (โครงสร้างคล้ายกับ Move In)
}
```

### 6.4 Modal Event Handlers

#### 6.4.1 Confirm B0 Update

```javascript
document.getElementById('confirmUpdate').onclick = function () {
    if (pendingEvent) {
        fetch('/api/BudgetApi', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pendingEvent.data)
        })
        .then(async response => {
            if (!response.ok) {
                const errorText = await response.text();
                alert("Update failed: " + errorText);
                return { success: false };
            }
            return response.json();
        })
        .then(result => {
            if (result.success) {
                // อัปเดตสำเร็จ
            }
        });
        pendingEvent = null;
    }
    if (confirmModal) confirmModal.hide();
};

document.getElementById('cancelUpdate').onclick = function () {
    if (pendingEvent) {
        // คืนค่าเดิม
        pendingEvent.node.setDataValue(pendingEvent.colDef.field, 
                                       pendingEvent.oldValue);
        pendingEvent = null;
    }
    if (confirmModal) confirmModal.hide();
};
```

#### 6.4.2 Save Move In Transaction

```javascript
document.getElementById('confirmMoveInTransection').onclick = function () {
    const moveInHC = document.getElementById('MImoveInHC').value;
    const moveInBaseWage = document.getElementById('MImoveInBaseWage').value;
    const moveOutHC = document.getElementById('MImoveOutHC').value;
    const moveOutBaseWage = document.getElementById('MImoveOutBaseWage').value;
    const toCostCenter = document.getElementById('MItoCostCenter').value;
    const peMonth = document.getElementById('MIpeMonthModal').value;
    const peYear = document.getElementById('MIpeYearModal').value;
    const flagMove = document.getElementById('MIIsMoveInOnly').checked;
    const remarkMove = document.getElementById('MIRemark').value;

    // Validation
    let errorMsg = '';
    if (!moveInHC || !moveInBaseWage) 
        errorMsg += 'กรุณากรอก Move In HC และ Base+Wage<br>';
    
    if (flagMove) {
        // Move In Only ต้องกรอก Remark
        if (!remarkMove || remarkMove.trim() === '') 
            errorMsg += 'กรุณากรอก Remark เมื่อเลือก Move in Only<br>';
    } else {
        // ปกติต้องกรอก Move Out ด้วย
        if (!moveOutHC || !moveOutBaseWage) 
            errorMsg += 'กรุณากรอก Move Out HC และ Base+Wage<br>';
        if (!toCostCenter) 
            errorMsg += 'กรุณาเลือก Cost Center ปลายทาง<br>';
    }
    
    if (errorMsg) {
        document.getElementById('MItransectionError').innerHTML = errorMsg;
        document.getElementById('MItransectionError').style.display = 'block';
        return;
    }

    // สร้าง DTO
    const updateData = {
        costCenterCode: MoveIntransectionEvent.data.costCenterCode,
        peMonth: parseInt(peMonth),
        peYear: peYear,
        moveInHC: parseInt(moveInHC),
        moveInBaseWage: parseFloat(moveInBaseWage),
        toCostCenter: flagMove ? null : toCostCenter,
        moveOutHC: flagMove ? null : parseInt(moveOutHC),
        moveOutBaseWage: flagMove ? null : parseFloat(moveOutBaseWage),
        flagMove: flagMove,
        remarkMove: remarkMove
    };

    // เรียก API
    fetch('/api/BudgetApi/MoveInTransection', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
    })
    .then(async response => {
        if (!response.ok) {
            const errorText = await response.text();
            alert("Update failed: " + errorText);
            return;
        }
        MoveIntransectionModal.hide();
        
        // อัปเดต Grid ด้วยข้อมูลใหม่
        const updatedRows = await response.json();
        gridApi.applyTransaction({ update: updatedRows });
    });
};
```

#### 6.4.3 Cost Center Detail Modal

```javascript
function openCostCenterModal(costCenterCode) {
    // หาข้อมูล cost center จาก grid
    const rowData = [];
    gridApi.forEachNode(node => {
        if (node.data.costCenterCode === costCenterCode) {
            rowData.push(node.data);
        }
    });

    if (rowData.length > 0) {
        const firstRow = rowData[0];

        // เติมข้อมูลพื้นฐาน
        document.getElementById('detailCostCenterCode').value = 
            firstRow.costCenterCode || '';
        document.getElementById('detailCostCenterName').value = 
            firstRow.costCenterName || '';
        document.getElementById('detailCompany').value = 
            firstRow.company || '';
        // ... เติมฟิลด์อื่นๆ

        // เติมตาราง Budget Summary (แสดงทุกเดือน)
        const tableBody = document.getElementById('budgetSummaryTable');
        tableBody.innerHTML = '';

        rowData.sort((a, b) => {
            if (a.peYear !== b.peYear) return a.peYear - b.peYear;
            return a.peMonth - b.peMonth;
        });

        rowData.forEach(row => {
            const monthName = MONTH_NAMES[row.peMonth] || row.peMonth;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.b0HC || 0}</td>
                <td>${row.b0BaseWage ? Number(row.b0BaseWage).toLocaleString() : 0}</td>
                <td>${row.moveInHC || 0}</td>
                <td>${row.moveInBaseWage ? Number(row.moveInBaseWage).toLocaleString() : 0}</td>
                <!-- ... columns อื่นๆ -->
            `;
            tableBody.appendChild(tr);
        });

        // ดึงประวัติ Transaction จาก API
        const refId = firstRow.refId || 
            (firstRow.peYear + String(firstRow.peMonth).padStart(2, '0') + 
             firstRow.costCenterCode + (firstRow.codComp || ''));
        
        fetch(`/api/BudgetApi/transactions/${encodeURIComponent(refId)}`)
        .then(response => response.json())
        .then(transactions => {
            const transactionTableBody = document.getElementById('transactionTable');
            transactionTableBody.innerHTML = '';
            
            if (transactions && transactions.length > 0) {
                transactions.sort((a, b) => a.seq - b.seq);
                
                transactions.forEach(transaction => {
                    const effectiveDate = transaction.updateDate ? 
                        new Date(transaction.updateDate).toLocaleString('th-TH') : '-';

                    // แสดง Move In
                    if (transaction.moveInHC > 0 || transaction.moveInBaseWage > 0) {
                        const typeText = transaction.flagMove === 'I' ? 
                            'Move In Only' : 'Move In';
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${effectiveDate}</td>
                            <td><span class="badge bg-success">${typeText}</span></td>
                            <td>${transaction.moveInCostCenterCode || '-'}</td>
                            <td>${transaction.moveInHC || 0}</td>
                            <td>${transaction.moveInBaseWage ? 
                                Number(transaction.moveInBaseWage).toLocaleString() : 0}</td>
                            <td>${transaction.remarkMove || '-'}</td>
                            <td>${transaction.updateBy || 'System'}</td>
                        `;
                        transactionTableBody.appendChild(tr);
                    }

                    // แสดง Move Out, Additional, Cut ในลักษณะเดียวกัน
                    // ...
                });
            }
        });

        // แสดง modal
        if (!costCenterDetailModal) {
            costCenterDetailModal = new bootstrap.Modal(
                document.getElementById('costCenterDetailModal'));
        }
        costCenterDetailModal.show();
    }
}
```

### 6.5 Dropdown Cascading Logic

```javascript
// เมื่อเลือก Company ให้โหลด Cost Center
document.getElementById('MItoCompany').onchange = function () {
    const selectedCompany = this.value;
    const peMonth = document.getElementById('MIpeMonthModal').value;
    const peYear = document.getElementById('MIpeYearModal').value;
    
    fetch(`/api/BudgetApi/availableCostCenters?company=${encodeURIComponent(selectedCompany)}&peMonth=${peMonth}&peYear=${peYear}`)
        .then(r => r.json())
        .then(costCenters => {
            const toCostCenter = document.getElementById('MItoCostCenter');
            toCostCenter.innerHTML = '';
            costCenters.forEach(item => {
                const option = document.createElement('option');
                option.value = item.costCenterCode;
                option.text = item.costCenterCode + ' : ' + item.costCenterName;
                toCostCenter.appendChild(option);
            });
            $('#MItoCostCenter').select2({
                dropdownParent: $('#MoveIntransectionModal')
            });

            // Disable division/department/section
            document.getElementById('MItoDivision').disabled = true;
            document.getElementById('MItoDepartment').disabled = true;
            document.getElementById('MItoSection').disabled = true;
        });
};

// เมื่อเลือก Cost Center ให้โหลด Division/Department/Section
document.getElementById('MItoCostCenter').onchange = function () {
    const selectedCode = this.value;
    if (!selectedCode) return;

    document.getElementById('MItoDivision').disabled = false;
    document.getElementById('MItoDepartment').disabled = false;
    document.getElementById('MItoSection').disabled = false;

    fetch(`/api/BudgetApi/costCenterDetail?costCenterCode=${selectedCode}`)
        .then(r => r.json())
        .then(detail => {
            // เติม Division
            const divisionSelect = document.getElementById('MItoDivision');
            divisionSelect.innerHTML = '';
            detail.divisionList.forEach(item => {
                const option = document.createElement('option');
                option.value = item;
                option.text = item;
                divisionSelect.appendChild(option);
            });
            $('#MItoDivision').select2({
                dropdownParent: $('#MoveIntransectionModal')
            });

            // เติม Department และ Section ในลักษณะเดียวกัน
            // ...
        });
};
```

### 6.6 Export to Excel

```javascript
document.getElementById('exportExcelBtn').onclick = function () {
    const rowData = [];
    gridApi.forEachNodeAfterFilterAndSort(node => rowData.push(node.data));

    if (!rowData.length) {
        alert('ยังไม่มีข้อมูลในตาราง กรุณา Search ก่อน Export');
        return;
    }

    // สร้าง flatColumns เฉพาะ field ที่มีจริง
    const flatColumns = [];
    function extractFields(cols) {
        cols.forEach(col => {
            if (col.children) extractFields(col.children);
            else if (col.field) flatColumns.push(col);
        });
    }
    extractFields(gridOptions.columnDefs);

    const headers = flatColumns.map(col => col.headerName || col.field);
    const fields = flatColumns.map(col => col.field);

    // เตรียมข้อมูลสำหรับ SheetJS
    const exportData = rowData.map(row =>
        fields.reduce((obj, field) => {
            obj[field] = row[field] !== undefined ? row[field] : '';
            return obj;
        }, {})
    );

    // สร้าง worksheet
    const ws = XLSX.utils.json_to_sheet(exportData, { header: fields });

    // เปลี่ยนชื่อ header
    headers.forEach((h, idx) => {
        const cell = ws[XLSX.utils.encode_cell({ r: 0, c: idx })];
        if (cell) cell.v = h;
    });

    // เพิ่ม AutoFilter
    if (ws['!ref']) {
        ws['!autofilter'] = { ref: ws['!ref'] };
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "HRBudget");

    XLSX.writeFile(wb, "HRBudget.xlsx");
};
```

### 6.7 Clear Filter

```javascript
document.getElementById('clearFilterBtn').onclick = function () {
    gridApi.setFilterModel(null);
};
```

---
## 7. File Upload System (สำหรับ Additional Transaction)

### 7.1 File Upload UI (HTML)

```html
<!-- ใน Additional Modal -->
<div class="modal-body">
    <!-- ... ฟิลด์อื่นๆ ... -->
    
    <hr class="my-3" />
    <div class="mb-3">
        <label for="ADfileUpload" class="form-label">Supporting Documents</label>
        <div class="mb-2">
            <small class="text-muted">
                Allowed formats: PNG, JPG, PDF, Word, Excel | 
                Max size: 4MB per file | Multiple files allowed
            </small>
        </div>
        <input type="file" id="ADfileUpload" class="form-control" 
               accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,.xls,.xlsx" 
               multiple>
        <div id="ADfileValidationError" class="text-danger mt-1" 
             style="display:none;"></div>
        
        <!-- File Preview List -->
        <div id="ADfileList" class="mt-3" style="display:none;">
            <h6>Selected Files:</h6>
            <ul id="ADfileListItems" class="list-group list-group-flush">
            </ul>
        </div>
        
        <!-- Upload Progress -->
        <div id="ADuploadProgress" class="mt-3" style="display:none;">
            <div class="progress">
                <div id="ADprogressBar" class="progress-bar" role="progressbar" 
                     style="width: 0%"></div>
            </div>
            <small id="ADprogressText" class="text-muted">Uploading...</small>
        </div>
        
        <!-- Uploaded Files List -->
        <div id="ADuploadedFiles" class="mt-3" style="display:none;">
            <h6>Uploaded Files:</h6>
            <ul id="ADuploadedFilesList" class="list-group list-group-flush">
            </ul>
        </div>
    </div>
</div>
```

### 7.2 File Upload JavaScript

#### 7.2.1 Global Variables

```javascript
let selectedFiles = [];
let uploadedFiles = [];
```

#### 7.2.2 File Validation

```javascript
function validateFile(file) {
    const allowedTypes = [
        'image/png', 'image/jpg', 'image/jpeg',
        'application/pdf',
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    const maxSize = 4 * 1024 * 1024; // 4MB

    if (!allowedTypes.includes(file.type)) {
        return `File "${file.name}" has invalid format. Only PNG, JPG, PDF, Word, Excel files are allowed.`;
    }

    if (file.size > maxSize) {
        return `File "${file.name}" is too large. Maximum size is 4MB.`;
    }

    return null;
}
```

#### 7.2.3 Format File Size

```javascript
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
```

#### 7.2.4 Display Selected Files

```javascript
function displaySelectedFiles() {
    const fileList = document.getElementById('ADfileList');
    const fileListItems = document.getElementById('ADfileListItems');
    
    if (selectedFiles.length === 0) {
        fileList.style.display = 'none';
        return;
    }

    fileListItems.innerHTML = '';
    selectedFiles.forEach((file, index) => {
        const li = document.createElement('li');
        li.className = 'list-group-item file-item';
        li.innerHTML = `
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
            </div>
            <div class="file-actions">
                <button type="button" class="btn-remove" data-index="${index}">
                    Remove
                </button>
            </div>
        `;
        fileListItems.appendChild(li);
        
        // Add event listener to the remove button
        const removeBtn = li.querySelector('.btn-remove');
        removeBtn.addEventListener('click', function() {
            const fileIndex = parseInt(this.getAttribute('data-index'));
            selectedFiles.splice(fileIndex, 1);
            displaySelectedFiles();
        });
    });

    fileList.style.display = 'block';
}
```

#### 7.2.5 Display Uploaded Files

```javascript
function displayUploadedFiles(files) {
    const uploadedFilesDiv = document.getElementById('ADuploadedFiles');
    const uploadedFilesList = document.getElementById('ADuploadedFilesList');
    
    if (files.length === 0) {
        uploadedFilesDiv.style.display = 'none';
        return;
    }

    uploadedFilesList.innerHTML = '';
    files.forEach(file => {
        const li = document.createElement('li');
        li.className = 'list-group-item file-item';
        li.innerHTML = `
            <div class="file-info">
                <div class="file-name">${file.originalName}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
            </div>
            <div class="file-actions">
                <a href="${file.downloadUrl}" target="_blank" class="file-link">
                    Download
                </a>
            </div>
        `;
        uploadedFilesList.appendChild(li);
    });

    uploadedFilesDiv.style.display = 'block';
}
```

#### 7.2.6 File Input Change Handler

```javascript
document.getElementById('ADfileUpload').onchange = function (event) {
    const files = Array.from(event.target.files);
    const errorDiv = document.getElementById('ADfileValidationError');
    let hasError = false;
    let errorMessages = [];

    // Validate each file
    files.forEach(file => {
        const error = validateFile(file);
        if (error) {
            errorMessages.push(error);
            hasError = true;
        }
    });

    if (hasError) {
        errorDiv.innerHTML = errorMessages.join('<br>');
        errorDiv.style.display = 'block';
        event.target.value = ''; // Clear invalid files
        return;
    }

    errorDiv.style.display = 'none';
    selectedFiles = files;
    displaySelectedFiles();
};
```

#### 7.2.7 Convert File to Base64

```javascript
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Remove data:mime-type;base64, prefix
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
}
```

#### 7.2.8 Upload Files Function

```javascript
async function uploadFiles(costCenterCode, peMonth, peYear) {
    if (selectedFiles.length === 0) {
        return [];
    }

    const progressDiv = document.getElementById('ADuploadProgress');
    const progressBar = document.getElementById('ADprogressBar');
    const progressText = document.getElementById('ADprogressText');

    progressDiv.style.display = 'block';
    progressBar.style.width = '0%';
    progressText.textContent = 'Converting files to Base64...';

    try {
        // Convert all files to Base64
        const fileDataArray = [];
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            progressText.textContent = `Converting file ${i + 1} of ${selectedFiles.length}...`;
            progressBar.style.width = `${(i / selectedFiles.length) * 50}%`;
            
            const base64Data = await fileToBase64(file);
            fileDataArray.push({
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                fileData: base64Data
            });
        }

        progressText.textContent = 'Uploading files...';
        progressBar.style.width = '50%';

        // Prepare data for API
        const uploadData = {
            costCenterCode: costCenterCode,
            peMonth: peMonth.toString(),
            peYear: peYear.toString(),
            transactionType: 'ADDITIONAL',
            files: fileDataArray
        };

        console.log('Upload data:', {
            ...uploadData,
            files: uploadData.files.map(f => ({
                fileName: f.fileName,
                fileSize: f.fileSize,
                fileType: f.fileType,
                fileDataLength: f.fileData.length
            }))
        });

        const response = await fetch('/api/BudgetApi/UploadFiles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(uploadData)
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Upload error response:', errorText);
            throw new Error(`Upload failed: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('Upload success:', result);
        
        progressBar.style.width = '100%';
        progressText.textContent = 'Upload completed!';
        
        setTimeout(() => {
            progressDiv.style.display = 'none';
        }, 2000);

        return result.uploadedFiles;
    } catch (error) {
        console.error('Upload error:', error);
        progressDiv.style.display = 'none';
        alert('อัปโหลดไฟล์ไม่สำเร็จ: ' + error.message);
        throw error;
    }
}
```

#### 7.2.9 Modified Additional Confirm Handler

```javascript
document.getElementById('confirmAdditional').onclick = async function () {
    const additionalHC = document.getElementById('ADadditionalHC').value;
    const additionalBaseWage = document.getElementById('ADadditionalBaseWage').value;
    const peMonth = document.getElementById('ADpeMonthModal').value;
    const peYear = document.getElementById('ADpeYearModal').value;
    const costCenterCode = AdditionalEvent.data.costCenterCode;

    // Validation
    let errorMsg = '';
    if (!additionalHC || !additionalBaseWage) 
        errorMsg += 'กรุณากรอก Additional HC และ Base+Wage<br>';
    if (additionalHC < 0 || additionalBaseWage < 0) {
        errorMsg += 'ห้ามกรอกตัวเลขติดลบ<br>';
    }

    if (errorMsg) {
        document.getElementById('ADtransectionError').innerHTML = errorMsg;
        document.getElementById('ADtransectionError').style.display = 'block';
        return;
    }

    // ตรวจสอบว่ามีการเลือกไฟล์หรือไม่
    if (selectedFiles.length === 0) {
        const confirmSave = confirm(
            'ยังไม่ได้อัปโหลดเอกสารประกอบ\nต้องการบันทึกข้อมูลโดยไม่มีเอกสารใช่หรือไม่?'
        );
        if (!confirmSave) {
            return; // ยกเลิกการบันทึก
        }
    }

    try {
        // อัปโหลดไฟล์ก่อน (ถ้ามี)
        let uploadedFilesResult = [];
        if (selectedFiles.length > 0) {
            uploadedFilesResult = await uploadFiles(costCenterCode, peMonth, peYear);
        }
        console.log('Uploaded files:', uploadedFilesResult);
        
        // จากนั้นบันทึกข้อมูล Additional
        const updateData = {
            costCenterCode: costCenterCode,
            peMonth: parseInt(peMonth),
            peYear: peYear,
            additionalHC: parseInt(additionalHC),
            additionalBaseWage: parseFloat(additionalBaseWage),
            uploadedFiles: uploadedFilesResult
        };

        const response = await fetch('/api/BudgetApi/Additional', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            alert("Update failed: " + errorText);
            return;
        }

        // แสดงไฟล์ที่อัปโหลดสำเร็จ
        if (uploadedFilesResult.length > 0) {
            displayUploadedFiles(uploadedFilesResult);
        }

        AdditionalModal.hide();
        
        // รับข้อมูล row ที่อัปเดตกลับมาจาก API
        const updatedRows = await response.json();
        console.log(updatedRows);
        
        // อัปเดตเฉพาะ row ใน grid
        gridApi.applyTransaction({ update: updatedRows });

        // ล้างข้อมูลไฟล์
        selectedFiles = [];
        uploadedFiles = [];
        document.getElementById('ADfileUpload').value = '';
        document.getElementById('ADfileList').style.display = 'none';
        
        // แสดงข้อความสำเร็จ
        if (uploadedFilesResult.length > 0) {
            alert(`บันทึกข้อมูลสำเร็จ พร้อมอัปโหลดเอกสาร ${uploadedFilesResult.length} ไฟล์`);
        } else {
            alert('บันทึกข้อมูลสำเร็จ (ไม่มีเอกสารประกอบ)');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาด: ' + error.message);
    }
};
```

#### 7.2.10 Cancel Additional Handler (ล้างไฟล์)

```javascript
document.getElementById('cancelAdditional').onclick = function () {
    // ล้างข้อมูลไฟล์เมื่อยกเลิก
    selectedFiles = [];
    uploadedFiles = [];
    document.getElementById('ADfileUpload').value = '';
    document.getElementById('ADfileList').style.display = 'none';
    document.getElementById('ADuploadedFiles').style.display = 'none';
    document.getElementById('ADfileValidationError').style.display = 'none';
    
    AdditionalEvent = null;
    AdditionalModal.hide();
};
```

---

## 8. การติดตั้งและ Configuration

### 8.1 NuGet Packages

ติดตั้ง packages ต่อไปนี้:

```xml
<PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.0" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.0.0" />
<PackageReference Include="Oracle.EntityFrameworkCore" Version="8.23.50" />
```

### 8.2 appsettings.json

```json
{
  "ConnectionStrings": {
    "OracleConnection": "User Id=HRMS;Password=YourPassword;Data Source=YourOracleServer:1521/ORCLPDB"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

### 8.3 Program.cs Configuration

```csharp
using HRBudgetApp.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Register DbContext สำหรับ Oracle
builder.Services.AddDbContext<BudgetDbContext>(options =>
    options.UseOracle(builder.Configuration.GetConnectionString("OracleConnection")));

// Add services to the container
builder.Services.AddControllersWithViews();
builder.Services.AddControllers().AddJsonOptions(opts => {
    opts.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});

var app = builder.Build();

// สร้าง database และ table หากไม่มี (ใช้แทน Migration)
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<BudgetDbContext>();
    context.Database.EnsureCreated();
}

// Configure the HTTP request pipeline
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
```

### 8.4 _Layout.cshtml References

```html
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>@ViewData["Title"] - HRBudgetApp</title>
    
    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="~/lib/bootstrap/dist/css/bootstrap.min.css" />
    
    <!-- AG Grid CSS -->
    <link rel="stylesheet" href="~/lib/ag-grid-community/styles/ag-grid/ag-grid.css" />
    <link rel="stylesheet" href="~/lib/ag-grid-community/styles/ag-theme-alpine/ag-theme-alpine.css" />
    
    <!-- Select2 CSS -->
    <link rel="stylesheet" href="~/lib/select2/dist/css/select2.min.css" />
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="~/css/site.css" asp-append-version="true" />
</head>

<body>
    <!-- Content -->
    
    <!-- Scripts at bottom -->
    <script src="~/lib/jquery/dist/jquery.min.js"></script>
    <script src="~/lib/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
    <script src="~/lib/select2/dist/js/select2.min.js"></script>
    <script src="~/lib/ag-grid-community/dist/ag-grid-community.min.js"></script>
    <script src="~/lib/xlsx/dist/xlsx.full.min.js"></script>
    <script src="~/js/site.js" asp-append-version="true"></script>
    @await RenderSectionAsync("Scripts", required: false)
</body>
```

### 8.5 Client Libraries (wwwroot/lib/)

ดาวน์โหลด libraries ต่อไปนี้ไปยัง `wwwroot/lib/`:

1. **AG Grid Community** (v31.x หรือใหม่กว่า)
   - https://www.ag-grid.com/javascript-data-grid/download/

2. **Bootstrap 5** (v5.3.x)
   - https://getbootstrap.com/docs/5.3/getting-started/download/

3. **jQuery** (v3.7.x)
   - https://jquery.com/download/

4. **Select2** (v4.1.x)
   - https://select2.org/getting-started/installation

5. **SheetJS (xlsx)** (v0.18.x หรือใหม่กว่า)
   - https://sheetjs.com/

### 8.6 Custom Fonts

วาง font files ใน `wwwroot/fonts/SanFrancisco/`:
- SF-Pro-Display-Regular.otf
- SF-Pro-Display-Light.otf
- SF-Pro-Display-Bold.otf
- SFProTH_regular.woff.ttf

### 8.7 CSS Customization (site.css)

ส่วนสำคัญของ CSS:

```css
@font-face {
    font-family: SF-Pro-Display-Light;
    src: url('../fonts/SanFrancisco/SF-Pro-Display-Light.otf');
}

body {
    font-family: SF-Pro-Display-Light, SFProTH_regular !important;
}

.filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    margin-bottom: 18px;
    background: #f8fafc;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(100,146,172,0.08);
}

.ag-theme-alpine {
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(100,146,172,0.12);
    font-family: SF-Pro-Display-Light, SFProTH_regular !important;
}

/* เส้นแบ่งแนวตั้งใน Modal */
.vertical-line {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 100%;
    border-left: 1px solid #ccc;
    transform: translateX(-50%);
    z-index: 1;
}

/* Select2 height adjustment */
.select2-container .select2-selection--single {
    height: 37.5px;
    padding: 4px;
}

/* File item styles */
.file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    margin-bottom: 8px;
    background-color: #f8f9fa;
}
```

---

## 9. สรุปขั้นตอนการนำไปใช้

### 9.1 เตรียม Database

1. สร้างตารางในฐานข้อมูล Oracle:
   - `HRIS_HR_BUDGET_DATA` (ตาราง Budget หลัก)
   - `HRIS_HR_BUDGET_DATA_HIST` (ตาราง Transaction History)
   - `HRIS_HR_BUDGET_FILES` (ตาราง File Upload)

2. สร้าง Index ตามที่ระบุใน Model

3. นำเข้าข้อมูล Budget ตั้งต้น (ถ้ามี)

### 9.2 สร้างโปรเจค ASP.NET Core

```bash
dotnet new mvc -n HRBudgetApp
cd HRBudgetApp
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Oracle.EntityFrameworkCore
```

### 9.3 สร้างโครงสร้างโปรเจค

1. สร้าง Models:
   - `Budget.cs` (พร้อม BudgetTransaction, BudgetUploads, DTOs)
   - `BudgetDbContext.cs`

2. สร้าง Controllers:
   - `BudgetApiController.cs` (REST API)
   - `HomeController.cs` (เพิ่ม Action AgGrid)

3. สร้าง Views:
   - `Views/Home/AgGrid.cshtml`
   - อัปเดต `Views/Shared/_Layout.cshtml`

4. เพิ่ม Client Libraries ใน `wwwroot/lib/`

5. เพิ่ม Custom CSS ใน `wwwroot/css/site.css`

6. เพิ่ม Fonts ใน `wwwroot/fonts/`

### 9.4 Configure Application

1. อัปเดต `appsettings.json` (Connection String)
2. อัปเดต `Program.cs` (DbContext, Services)

### 9.5 ทดสอบระบบ

1. รัน Application:
```bash
dotnet run
```

2. เปิด Browser ไปที่ `https://localhost:5001` (หรือ port ที่กำหนด)

3. ไปที่เมนู "Cost Center Grid"

4. ทดสอบ Features:
   - Search ข้อมูล (เลือก Year และ Month)
   - แก้ไข B0
   - ทำ Transaction Move In/Out
   - ทำ Transaction Additional (พร้อมอัปโหลดไฟล์)
   - ทำ Transaction Cut
   - ดูรายละเอียด Cost Center
   - Export Excel

### 9.6 ปัญหาที่อาจพบและวิธีแก้

#### ปัญหา 1: AG Grid ไม่แสดง
**วิธีแก้**: ตรวจสอบว่า:
- มี AG Grid CSS และ JS files ใน wwwroot/lib/
- Reference AG Grid ใน _Layout.cshtml ถูกต้อง
- ตรวจสอบ Console ใน Browser หา Error

#### ปัญหา 2: Select2 ไม่ทำงาน
**วิธีแก้**: ตรวจสอบว่า:
- มี jQuery โหลดก่อน Select2
- มี Select2 CSS และ JS files
- เรียก `.select2()` หลังจากเติมข้อมูล dropdown

#### ปัญหา 3: File Upload ไม่สำเร็จ
**วิธีแก้**: ตรวจสอบว่า:
- ไฟล์ไม่เกิน 4MB
- ไฟล์เป็น format ที่อนุญาต
- Convert Base64 ถูกต้อง
- Oracle BLOB column ถูกกำหนดถูกต้อง

#### ปัญหา 4: Accumulated Data ไม่แสดง
**วิธีแก้**: ตรวจสอบว่า:
- เรียก API `/api/BudgetApi/AccumulatedData` สำเร็จ
- Merge ข้อมูล Accumulated เข้ากับ Main data ถูกต้อง
- คำนวณ b1HC และ b1BaseWage ถูกต้อง

#### ปัญหา 5: Modal ไม่ปิด
**วิธีแก้**: ตรวจสอบว่า:
- ใช้ Bootstrap Modal API ถูกต้อง
- จัดการ `aria-hidden` attribute
- เรียก `.hide()` method ของ Modal instance

---

## 10. สูตรการคำนวณที่สำคัญ

### 10.1 สูตร B1 (Budget After Adjustment)

```javascript
// B1 HC
b1HC = (b0HC + accMoveInHC + accAddHC) - (accMoveOutHC + accCutHC)

// B1 Base+Wage
b1BaseWage = (b0BaseWage + accMoveInBaseWage + accAddBaseWage) - 
             (accMoveOutBaseWage + accCutBaseWage)
```

### 10.2 สูตร Accumulated

Accumulated คือผลรวมของ Transaction แต่ละประเภทตั้งแต่เดือนที่ 1 ถึงเดือนปัจจุบัน

```javascript
// ตัวอย่าง Accumulated Move In HC
accMoveInHC = SUM(moveInHC) WHERE peMonth >= 1 AND peMonth <= currentMonth 
              AND peYear = currentYear
```

### 10.3 สูตร Diff (Difference)

```javascript
// Diff B0
diffB0HC = b0HC - actualHC
diffB0BaseWagePremium = b0BaseWage - actualBaseWagePremium

// Diff B1
diffB1HC = b1HC - actualHC
diffB1BaseWagePremium = b1BaseWage - actualBaseWagePremium
```

---

## 11. Best Practices และ Tips

### 11.1 Performance

1. **ใช้ AsNoTracking()** สำหรับ Read-Only queries
2. **Index ที่สำคัญ**: CostCenterCode, PEYear, PEMonth
3. **Pagination**: ถ้าข้อมูลเยอะมาก ควรใช้ Server-Side Pagination
4. **Caching**: Cache ข้อมูล Company, Month, Year ที่ไม่เปลี่ยนบ่อย

### 11.2 Security

1. **Input Validation**: Validate ทุก input จาก Client
2. **SQL Injection**: ใช้ Entity Framework ช่วยป้องกัน
3. **File Upload**: Validate file type และ size
4. **Authentication**: เพิ่ม Authentication/Authorization ในระบบจริง

### 11.3 Error Handling

1. **Try-Catch**: ครอบทุก API call ด้วย try-catch
2. **Logging**: Log errors ใน Console และ Server
3. **User Feedback**: แสดง error message ที่เข้าใจง่าย

### 11.4 UX/UI

1. **Loading State**: แสดง Loader เมื่อโหลดข้อมูล
2. **Validation Feedback**: แสดง error message ชัดเจน
3. **Confirmation**: ขอยืนยันก่อนทำ action สำคัญ
4. **Responsive**: ออกแบบให้ทำงานบนหน้าจอขนาดต่างๆ

### 11.5 Maintenance

1. **Code Organization**: แยก code เป็น functions ย่อยๆ
2. **Comments**: เขียน comment อธิบาย logic ที่ซับซ้อน
3. **Naming Convention**: ใช้ชื่อตัวแปร/function ที่สื่อความหมาย
4. **Version Control**: ใช้ Git สำหรับจัดการ source code

---

## 12. Extension Ideas

### 12.1 ฟีเจอร์เพิ่มเติมที่น่าสนใจ

1. **Approval Workflow**
   - เพิ่มระบบ Approval สำหรับ Transaction
   - Multiple approval levels
   - Email notification

2. **Reporting**
   - Dashboard แสดงสรุปงบประมาณ
   - Charts/Graphs
   - Custom Reports

3. **Budget Planning**
   - Copy Budget from previous year
   - Budget Template
   - Forecast vs Actual comparison

4. **User Management**
   - Role-based access control
   - Cost Center assignment
   - Activity Log

5. **Mobile Support**
   - Responsive design สำหรับ Mobile
   - Mobile App (PWA)

6. **Integration**
   - Import จาก Excel
   - Export รูปแบบอื่นๆ (PDF, CSV)
   - API Integration กับระบบอื่น

---

## 13. สรุป

ระบบ HR Budget Planning นี้เป็นตัวอย่างที่ดีของการใช้:

- **ASP.NET Core MVC** สำหรับ Backend
- **Entity Framework Core** สำหรับ Database Access
- **AG Grid** สำหรับ Data Grid ที่มี features ครบ
- **Bootstrap** สำหรับ UI
- **Select2** สำหรับ Dropdown ที่สวยงาม
- **SheetJS** สำหรับ Excel Export

คุณสมบัติหลัก:
✅ CRUD Operations สำหรับ Budget Data
✅ Transaction Management (Move In/Out, Additional, Cut)
✅ Accumulated Data Calculation
✅ File Upload System
✅ Transaction History
✅ Excel Export
✅ Responsive Filter Bar
✅ Detail Modal

โค้ดมีโครงสร้างดี แยกส่วนชัดเจน และมี patterns ที่ reuse ได้ เหมาะสำหรับนำไปพัฒนาต่อยอดในโปรเจคจริง

---

## 14. เอกสารอ้างอิง

- **AG Grid Documentation**: https://www.ag-grid.com/documentation/
- **ASP.NET Core Documentation**: https://docs.microsoft.com/en-us/aspnet/core/
- **Entity Framework Core**: https://docs.microsoft.com/en-us/ef/core/
- **Bootstrap 5**: https://getbootstrap.com/docs/5.3/
- **Select2**: https://select2.org/
- **SheetJS**: https://docs.sheetjs.com/

---

**จัดทำโดย**: GitHub Copilot  
**วันที่**: 14 พฤศจิกายน 2568  
**เวอร์ชัน**: 1.0

---
