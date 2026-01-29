# PE Budget Dashboard - KPI Cards Change Specification

**Document Version:** 1.1 (Updated with Dynamic Years)  
**Date:** November 15, 2025  
**Last Updated:** November 15, 2025 (Dynamic Field Names)  
**Purpose:** รายละเอียดการเปลี่ยนแปลง KPI Cards จาก 7 KPIs เป็น 4 KPIs ใหม่ พร้อม Dynamic Year Calculation

---

## 📋 สรุปการเปลี่ยนแปลง (Executive Summary)

### เป้าหมาย
เปลี่ยน **Block A - KPI Cards** จาก **7 KPIs แบบเก่า** (ใช้ query manual) เป็น **4 KPIs แบบใหม่** (ใช้ Stored Procedure ที่มีอยู่แล้ว) พร้อม **Dynamic Year Calculation**

### เหตุผล
- ✅ ใช้ Stored Procedure ที่ถูกต้องและมีข้อมูลครบถ้วน (`SP_REP_HC_PE_BY_COSTCENTER` / `SP_REP_HC_PE_BY_COSTCENTER_BJC`)
- ✅ แสดงการเปรียบเทียบ Budget แบบ Dynamic (Year-1 vs Year) โดยอิงจาก `filters.budgetYear`
- ✅ แสดง % Growth (HC และ PE) โดยคำนวณแบบ Dynamic
- ✅ ลด API endpoints ที่ไม่จำเป็น
- ✅ **ไม่ Hardcode ปี** - รองรับการเปลี่ยนแปลงปีงบประมาณในอนาคต

### 🆕 Dynamic Year Approach
**ตัวอย่าง**: ถ้า `filters.budgetYear = 2026`
- **Previous Year** = 2025 (คำนวณจาก `budgetYear - 1`)
- **Current Year** = 2026 (จาก `budgetYear`)
- **PE Previous Year Field** = `CURRENT_PE_2025` (สร้างแบบ Dynamic: `CURRENT_PE_${budgetYear-1}`)
- **Labels** = แสดง "2025" และ "2026" แบบ Dynamic บน UI

---

## 🗑️ ส่วนที่ต้องลบ (To Be Removed)

### 1. Backend - Controller

**ไฟล์:** `Controllers/SummaryController.cs`

**ลบ API Endpoint:**
```csharp
[HttpGet("kpi-overview")]
public async Task<ActionResult<KpiOverviewDto>> GetKpiOverview(
    [FromQuery] int? companyId = null,
    [FromQuery] int? budgetYear = null,
    [FromQuery] string? cobu = null,
    [FromQuery] string? costCenter = null,
    [FromQuery] string? division = null,
    [FromQuery] string? department = null,
    [FromQuery] string? section = null,
    [FromQuery] string? companyStore = null,
    [FromQuery] string? empStatus = null,
    [FromQuery] string? position = null,
    [FromQuery] string? jobBand = null)
{
    // ... ลบทั้งหมด (บรรทัดประมาณ 45-143)
}
```

**บรรทัดที่ต้องลบ:** ประมาณ 45-143 (99 บรรทัด)

**เหตุผล:** ไม่ใช้ API นี้แล้ว จะใช้ `GetPEBonusByCostCenter` แทน

---

### 2. Backend - DTOs

**ไฟล์:** `DTOs/Summary/KpiOverviewDto.cs`

**ลบไฟล์ทั้งหมด:**
```csharp
namespace HCBPCoreUI_Backend.DTOs.Summary
{
    public class KpiOverviewDto
    {
        public int TotalHC { get; set; }
        public decimal TotalPE { get; set; }
        public decimal AvgPEPerHC { get; set; }
        public string? TotalHCTrend { get; set; }
        public string? TotalPETrend { get; set; }
        public string? AvgPETrend { get; set; }
        public int ActiveHC { get; set; }
        public int NewJoinHC { get; set; }
        public int OnProcessHC { get; set; }
        public int VacancyHC { get; set; }
    }
}
```

**เหตุผล:** ไม่ใช้ DTO นี้แล้ว จะใช้ `BudgetPEBonusDataDto` แทน

---

### 3. Frontend - JavaScript (API Layer)

**ไฟล์:** `wwwroot/lib/razor/js/budget-pe-dashboard/budget-pe-dashboard.api.js`

**ลบ Function:**
```javascript
/**
 * Fetch KPI overview data
 */
async function fetchDashboardKpiOverview(filters) {
    const params = new URLSearchParams();
    if (filters.companyId) params.append('companyId', filters.companyId);
    if (filters.budgetYear) params.append('budgetYear', filters.budgetYear);
    if (filters.cobu) params.append('cobu', filters.cobu);
    if (filters.costCenter) params.append('costCenter', filters.costCenter);
    if (filters.division) params.append('division', filters.division);
    if (filters.department) params.append('department', filters.department);
    if (filters.section) params.append('section', filters.section);
    if (filters.companyStore) params.append('companyStore', filters.companyStore);
    if (filters.empStatus) params.append('empStatus', filters.empStatus);
    if (filters.position) params.append('position', filters.position);
    if (filters.jobBand) params.append('jobBand', filters.jobBand);

    const response = await fetch(`/api/Summary/kpi-overview?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch KPI overview');
    return await response.json();
}
```

**บรรทัดที่ต้องลบ:** ประมาณ 10-28 (19 บรรทัด)

---

### 4. Frontend - JavaScript (Events Layer)

**ไฟล์:** `wwwroot/lib/razor/js/budget-pe-dashboard/budget-pe-dashboard.events.js`

**ลบ Function (เดิม):**
```javascript
/**
 * Load and update KPI cards (Block A)
 */
async function loadDashboardKpiCards() {
    try {
        const data = await fetchDashboardKpiOverview(window.dashboardFilters);
        
        // Row 1: Summary Metrics
        document.getElementById('totalHC').textContent = formatNumber(data.totalHC);
        document.getElementById('totalPE').textContent = formatCurrency(data.totalPE);
        document.getElementById('avgPEPerHC').textContent = formatCurrency(data.avgPEPerHC);
        
        // Trends
        document.getElementById('totalHCTrend').textContent = data.totalHCTrend || '';
        document.getElementById('totalPETrend').textContent = data.totalPETrend || '';
        document.getElementById('avgPETrend').textContent = data.avgPETrend || '';
        
        // Row 2: Status Breakdown
        document.getElementById('activeHC').textContent = formatNumber(data.activeHC);
        document.getElementById('newJoinHC').textContent = formatNumber(data.newJoinHC);
        document.getElementById('onProcessHC').textContent = formatNumber(data.onProcessHC);
        document.getElementById('vacancyHC').textContent = formatNumber(data.vacancyHC);
        
    } catch (error) {
        console.error('Error loading KPI cards:', error);
    }
}
```

**บรรทัดที่ต้องลบ:** ประมาณ 35-60 (26 บรรทัด)

---

### 5. Frontend - HTML (KPI Cards)

**ไฟล์:** `Views/Home/Index.cshtml`

**ลบ Block A - Row 1 (3 Cards):**
```html
<!-- Block A: KPI Cards Row 1 (Summary Metrics) -->
<div class="row mb-4">
    <div class="col-md-4">
        <div class="card kpi-card text-center">
            <div class="card-body d-flex flex-column justify-content-center">
                <div class="kpi-label mb-2">Total HC</div>
                <div class="kpi-value text-primary" id="totalHC">-</div>
                <div class="kpi-trend text-muted mt-1" id="totalHCTrend"></div>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card kpi-card text-center">
            <div class="card-body d-flex flex-column justify-content-center">
                <div class="kpi-label mb-2">Total PE</div>
                <div class="kpi-value text-success" id="totalPE">-</div>
                <div class="kpi-trend text-muted mt-1" id="totalPETrend"></div>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card kpi-card text-center">
            <div class="card-body d-flex flex-column justify-content-center">
                <div class="kpi-label mb-2">Avg PE/HC</div>
                <div class="kpi-value text-info" id="avgPEPerHC">-</div>
                <div class="kpi-trend text-muted mt-1" id="avgPETrend"></div>
            </div>
        </div>
    </div>
</div>
```

**ลบ Block A - Row 2 (4 Cards):**
```html
<!-- Block A: KPI Cards Row 2 (Status Breakdown) -->
<div class="row mb-4">
    <div class="col-md-3">
        <div class="card kpi-card text-center">
            <div class="card-body d-flex flex-column justify-content-center">
                <div class="kpi-label mb-2">Active HC</div>
                <div class="kpi-value text-success" id="activeHC">-</div>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card kpi-card text-center">
            <div class="card-body d-flex flex-column justify-content-center">
                <div class="kpi-label mb-2">New Join HC</div>
                <div class="kpi-value text-primary" id="newJoinHC">-</div>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card kpi-card text-center">
            <div class="card-body d-flex flex-column justify-content-center">
                <div class="kpi-label mb-2">On Process HC</div>
                <div class="kpi-value text-warning" id="onProcessHC">-</div>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card kpi-card text-center">
            <div class="card-body d-flex flex-column justify-content-center">
                <div class="kpi-label mb-2">Vacancy HC</div>
                <div class="kpi-value text-danger" id="vacancyHC">-</div>
            </div>
        </div>
    </div>
</div>
```

**บรรทัดที่ต้องลบ:** ประมาณ 145-210 (65 บรรทัด รวม 2 rows)

---

### 6. Documentation

**ไฟล์:** `PE_BUDGET_DASHBOARD_PHASE1_SPEC_CORRECTED.md`

**ลบ Section 3 - Block A (KPI Row) ทั้งหมด:**
- หัวข้อ: "## 3. Block A - KPI Cards (Phase 1: 7 Key Metrics)"
- SQL Queries ทั้งหมด (7 queries)
- Field definitions
- Calculation formulas (แบบเก่า)

**บรรทัดที่ต้องลบ:** ประมาณ 380-920 (540 บรรทัด)

**ลบ Section 9.8.1 - KPI Overview API:**
```markdown
#### 9.8.1 KPI Overview API

**Endpoint**: `GET /api/summary/kpi-overview`

**Test Case**: Verify API returns correct structure

**Expected Response**:
...json...

**Tests**:
1. ✅ Returns 200 OK status
2. ✅ All fields present
...
```

**บรรทัดที่ต้องลบ:** ประมาณ 3065-3090 (25 บรรทัด)

---

## ✅ ส่วนที่ต้องเพิ่ม (To Be Added)

### 1. Backend - ใช้ API ที่มีอยู่แล้ว

**ไฟล์:** `Controllers/SummaryController.cs`

**API ที่ใช้:** (มีอยู่แล้ว - ไม่ต้องเพิ่ม)
```csharp
[HttpPost("GetPEBonusByCostCenter")]
public async Task<IActionResult> GetPEBonusByCostCenter([FromBody] BudgetPEBonusFilterDto filters)
{
    // บรรทัด 458-540 ใน SummaryController.cs
    // เรียก SP_REP_HC_PE_BY_COSTCENTER (BIG C) หรือ SP_REP_HC_PE_BY_COSTCENTER_BJC (BJC)
}
```

**เหตุผล:** API นี้มีอยู่แล้วและใช้งานได้ ไม่ต้องสร้างใหม่

---

### 2. Backend - ใช้ DTO ที่มีอยู่แล้ว

**ไฟล์:** `DTOs/Summary/BudgetPEBonusDataDto.cs` และ `BudgetPEBonusFilterDto.cs`

**DTO ที่ใช้:** (มีอยู่แล้ว - ไม่ต้องเพิ่ม)
- `BudgetPEBonusDataDto` - 67 columns (รวม GROUP 8, 9, 10)
- `BudgetPEBonusFilterDto` - CompanyId, BudgetYear, CobuFormat, CostCenterCode

**Field ที่เกี่ยวข้อง:**
```csharp
// GROUP 8: Budget 2025 (4 columns)
public decimal? BUDGET_FT_2025 { get; set; }
public decimal? BUDGET_CT_2025 { get; set; }
public decimal? CURRENT_PE_2025 { get; set; }
public decimal? CURRENT_PE_BONUS_2025 { get; set; }

// GROUP 9: Legal Entity (LE) 2026 (17 columns)
public decimal? SUM_FT_LE { get; set; }
public decimal? SUM_CT_LE { get; set; }
public decimal? SUM_PE_LE { get; set; }
public decimal? SUM_PE_OTEB_LE { get; set; }
// ... (13 columns อื่นๆ)

// GROUP 10: Company (Non-LE) 2026 (17 columns)
public decimal? SUM_FT { get; set; }
public decimal? SUM_CT { get; set; }
public decimal? SUM_PE { get; set; }
public decimal? SUM_PE_OTEB { get; set; }
// ... (13 columns อื่นๆ)
```

---

### 3. Frontend - JavaScript (API Layer)

**ไฟล์:** `wwwroot/lib/razor/js/budget-pe-dashboard/budget-pe-dashboard.api.js`

**เพิ่ม Function ใหม่:**
```javascript
/**
 * Fetch PE Bonus data for KPI calculations
 * Uses existing API: POST /api/Summary/GetPEBonusByCostCenter
 */
async function fetchDashboardPEBonusData(filters) {
    const requestBody = {
        companyId: filters.companyId || 0,
        budgetYear: filters.budgetYear || new Date().getFullYear(),
        cobuFormat: filters.cobu || null,
        costCenterCode: filters.costCenter || null
    };

    const response = await fetch('/api/Summary/GetPEBonusByCostCenter', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) throw new Error('Failed to fetch PE Bonus data');
    
    const data = await response.json();
    
    // Aggregate data from all cost centers (pass budgetYear for dynamic fields)
    return aggregatePEBonusData(data, requestBody.budgetYear);
}

/**
 * Aggregate PE Bonus data for KPI calculation
 * Sums all cost center rows into totals
 */
function aggregatePEBonusData(dataArray) {
    if (!dataArray || dataArray.length === 0) {
        return {
            hc2025: 0,
            hc2026: 0,
            pe2025: 0,
            pe2026: 0
        };
    }

    const totals = dataArray.reduce((acc, row) => {
        // HC 2025 = SUM_FT_LE + SUM_CT_LE (GROUP 9 - LE 2026)
        acc.hc2025 += (row.SUM_FT_LE || 0) + (row.SUM_CT_LE || 0);
        
        // HC 2026 = SUM_FT + SUM_CT (GROUP 10 - Company 2026)
        acc.hc2026 += (row.SUM_FT || 0) + (row.SUM_CT || 0);
        
        // PE 2025 = CURRENT_PE_2025 (GROUP 8 - Budget 2025)
        acc.pe2025 += (row.CURRENT_PE_2025 || 0);
        
        // PE 2026 = SUM_PE_OTEB (GROUP 10 - Company 2026 with OT+EB)
        acc.pe2026 += (row.SUM_PE_OTEB || 0);
        
        return acc;
    }, { hc2025: 0, hc2026: 0, pe2025: 0, pe2026: 0 });

    return totals;
}
```

**ตำแหน่ง:** เพิ่มหลัง `fetchDashboardCostCenters()` function

---

### 4. Frontend - JavaScript (Events Layer)

**ไฟล์:** `wwwroot/lib/razor/js/budget-pe-dashboard/budget-pe-dashboard.events.js`

**เพิ่ม Function ใหม่:**
```javascript
/**
 * Load and update KPI cards (Block A) - New Version
 * 4 KPIs: HC 2025 vs 2026, PE 2025 vs 2026, % Growth HC, % Growth PE
 */
async function loadDashboardKpiCards() {
    try {
        const data = await fetchDashboardPEBonusData(window.dashboardFilters);
        
        // Extract year labels from returned data
        const prevYear = data.previousYear; // e.g., 2025
        const currYear = data.currentYear;   // e.g., 2026
        
        // Calculate growth percentages
        const growthHC = data.hcPrev > 0 
            ? ((data.hcCurr - data.hcPrev) / data.hcPrev) * 100 
            : 0;
        
        const growthPE = data.pePrev > 0 
            ? ((data.peCurr - data.pePrev) / data.pePrev) * 100 
            : 0;
        
        // Update year labels dynamically
        document.getElementById('hcPrevYearLabel').textContent = prevYear;
        document.getElementById('hcCurrYearLabel').textContent = currYear;
        document.getElementById('pePrevYearLabel').textContent = prevYear;
        document.getElementById('peCurrYearLabel').textContent = currYear;
        
        // KPI 1: Total Budget HC (Dynamic Years)
        document.getElementById('hcPrevYear').textContent = formatNumber(data.hcPrev);
        document.getElementById('hcCurrYear').textContent = formatNumber(data.hcCurr);
        
        // KPI 2: Total PE Budget (Dynamic Years)
        document.getElementById('pePrevYear').textContent = formatCurrency(data.pePrev);
        document.getElementById('peCurrYear').textContent = formatCurrency(data.peCurr);
        
        // KPI 3: % Growth HC
        document.getElementById('growthHC').textContent = formatPercentage(growthHC);
        updateGrowthIndicator('growthHCIndicator', growthHC);
        
        // KPI 4: % Growth PE Budget
        document.getElementById('growthPE').textContent = formatPercentage(growthPE);
        updateGrowthIndicator('growthPEIndicator', growthPE);
        
    } catch (error) {
        console.error('Error loading KPI cards:', error);
        showDashboardError('Failed to load KPI data');
    }
}

/**
 * Format percentage value
 */
function formatPercentage(value) {
    if (value === null || value === undefined || isNaN(value)) return '0.0%';
    const sign = value >= 0 ? '+' : '';
    return sign + value.toFixed(1) + '%';
}

/**
 * Update growth indicator icon and color
 */
function updateGrowthIndicator(elementId, value) {
    const indicator = document.getElementById(elementId);
    if (!indicator) return;
    
    if (value > 0) {
        indicator.innerHTML = '<i class="fas fa-arrow-up text-success"></i>';
        indicator.className = 'growth-indicator text-success';
    } else if (value < 0) {
        indicator.innerHTML = '<i class="fas fa-arrow-down text-danger"></i>';
        indicator.className = 'growth-indicator text-danger';
    } else {
        indicator.innerHTML = '<i class="fas fa-minus text-muted"></i>';
        indicator.className = 'growth-indicator text-muted';
    }
}
```

**ตำแหน่ง:** แทนที่ function `loadDashboardKpiCards()` เดิม (บรรทัด 35-60)

---

### 5. Frontend - HTML (KPI Cards ใหม่)

**ไฟล์:** `Views/Home/Index.cshtml`

**เพิ่ม Block A ใหม่ (4 Cards):**
```html
<!-- Block A: KPI Cards - Budget Comparison 2025 vs 2026 -->
<div class="row mb-4">
    <!-- KPI 1: Total Budget HC 2025 vs 2026 -->
    <div class="col-md-3">
        <div class="card kpi-card">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="kpi-label mb-0">Total Budget HC</h6>
                    <i class="fas fa-users text-primary"></i>
                </div>
                <div class="row">
                    <div class="col-6 text-center border-end">
                        <div class="text-muted small" id="hcPrevYearLabel">-</div>
                        <div class="kpi-value text-primary fs-5" id="hcPrevYear">-</div>
                    </div>
                    <div class="col-6 text-center">
                        <div class="text-muted small" id="hcCurrYearLabel">-</div>
                        <div class="kpi-value text-success fs-5" id="hcCurrYear">-</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- KPI 2: Total PE Budget 2025 vs 2026 -->
    <div class="col-md-3">
        <div class="card kpi-card">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="kpi-label mb-0">Total PE Budget</h6>
                    <i class="fas fa-dollar-sign text-success"></i>
                </div>
                <div class="row">
                    <div class="col-6 text-center border-end">
                        <div class="text-muted small" id="pePrevYearLabel">-</div>
                        <div class="kpi-value text-primary fs-6" id="pePrevYear">-</div>
                    </div>
                    <div class="col-6 text-center">
                        <div class="text-muted small" id="peCurrYearLabel">-</div>
                        <div class="kpi-value text-success fs-6" id="peCurrYear">-</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- KPI 3: % Growth HC (2025 vs 2026) -->
    <div class="col-md-3">
        <div class="card kpi-card">
            <div class="card-body text-center">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="kpi-label mb-0">% Growth HC</h6>
                    <i class="fas fa-chart-line text-info"></i>
                </div>
                <div class="kpi-value text-info fs-4" id="growthHC">-</div>
                <div class="mt-2" id="growthHCIndicator">
                    <i class="fas fa-minus text-muted"></i>
                </div>
            </div>
        </div>
    </div>

    <!-- KPI 4: % Growth PE Budget (2025 vs 2026) -->
    <div class="col-md-3">
        <div class="card kpi-card">
            <div class="card-body text-center">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="kpi-label mb-0">% Growth PE Budget</h6>
                    <i class="fas fa-percent text-warning"></i>
                </div>
                <div class="kpi-value text-warning fs-4" id="growthPE">-</div>
                <div class="mt-2" id="growthPEIndicator">
                    <i class="fas fa-minus text-muted"></i>
                </div>
            </div>
        </div>
    </div>
</div>
```

**ตำแหน่ง:** แทนที่ Block A เดิม (2 rows, 7 cards) ด้วย 1 row, 4 cards

---

### 6. Frontend - CSS (Additional Styles)

**ไฟล์:** `wwwroot/css/site.css`

**เพิ่ม CSS สำหรับ Growth Indicators:**
```css
/* Growth Indicator Styles */
.growth-indicator {
  font-size: 1.2rem;
  font-weight: bold;
}

.growth-indicator i {
  font-size: 1.5rem;
}

/* KPI Card Comparison Layout */
.kpi-card .border-end {
  border-right: 1px solid #dee2e6 !important;
}

.kpi-card .kpi-value.fs-6 {
  font-size: 0.9rem !important;
}

.kpi-card .kpi-value.fs-5 {
  font-size: 1.1rem !important;
}

.kpi-card .kpi-value.fs-4 {
  font-size: 1.4rem !important;
}
```

**ตำแหน่ง:** เพิ่มในส่วน `/* PE Budget Dashboard */`

---

### 7. Documentation - Section 3 ใหม่

**ไฟล์:** `PE_BUDGET_DASHBOARD_PHASE1_SPEC_CORRECTED.md`

**เพิ่ม Section 3 ใหม่ (แทนของเก่า):**

```markdown
## 3. Block A - KPI Cards (Phase 1: 4 Key Metrics - Budget Comparison)

### 3.1 Overview

**Purpose**: แสดงการเปรียบเทียบ Budget HC และ PE ระหว่างปี 2025 และ 2026 พร้อม % Growth

**Layout**: 
- 1 แถว (Row)
- 4 Cards (แต่ละ card = col-md-3)
- แสดงค่าเปรียบเทียบ 2 ปี side-by-side

**Data Source**:
- **API Endpoint**: `POST /api/Summary/GetPEBonusByCostCenter`
- **Stored Procedure**: 
  - BIG C (Company ID = 2): `SP_REP_HC_PE_BY_COSTCENTER`
  - BJC (Company ID = 1): `SP_REP_HC_PE_BY_COSTCENTER_BJC`
- **DTO**: `BudgetPEBonusDataDto` (67 columns)

---

### 3.2 KPI Definitions

#### 3.2.1 KPI #1: Total Budget HC (Year-1) vs Budget HC (Year)

**Description**: จำนวน Headcount ทั้งหมด (Full Time + Contract) เปรียบเทียบระหว่าง 2 ปี โดยคำนวณแบบ Dynamic จาก `filters.budgetYear`

**Calculation**:
```javascript
const currentYear = filters.budgetYear; // เช่น 2026
const previousYear = currentYear - 1;   // เช่น 2025

// HC Previous Year = SUM_FT_LE + SUM_CT_LE (Legal Entity)
HC_PrevYear = SUM(row[`SUM_FT_LE`] + row[`SUM_CT_LE`])

// HC Current Year = SUM_FT + SUM_CT (Company - Non-LE)
HC_CurrYear = SUM(row[`SUM_FT`] + row[`SUM_CT`])
```

**Field Mapping (Dynamic)**:
| Year | Field | Source | Description |
|------|-------|--------|-------------|
| Year-1 (e.g., 2025) | `SUM_FT_LE` | GROUP 9 (LE) | Summary Full Time LE |
| Year-1 (e.g., 2025) | `SUM_CT_LE` | GROUP 9 (LE) | Summary Contract LE |
| Year (e.g., 2026) | `SUM_FT` | GROUP 10 (Company) | Summary Full Time Company |
| Year (e.g., 2026) | `SUM_CT` | GROUP 10 (Company) | Summary Contract Company |

**Display Format**:
- Previous Year: `formatNumber(HC_PrevYear)` - สีน้ำเงิน (Primary)
- Current Year: `formatNumber(HC_CurrYear)` - สีเขียว (Success)
- Labels: `{previousYear}` และ `{currentYear}` (แสดงปีจริง)

**Business Rule**:
- Aggregate ข้อมูลจากทุก Cost Center ที่ผ่าน filter
- แสดง 0 ถ้าไม่มีข้อมูล

---

#### 3.2.2 KPI #2: Total PE Budget (Year-1) vs Total PE Budget (Year)

**Description**: งบประมาณ Personnel Expense ทั้งหมด เปรียบเทียบระหว่าง 2 ปี โดยใช้ Dynamic field names จาก `filters.budgetYear`

**Calculation**:
```javascript
const currentYear = filters.budgetYear; // เช่น 2026
const previousYear = currentYear - 1;   // เช่น 2025

// PE Previous Year = CURRENT_PE_{previousYear} (Budget fields)
const fieldPE_Prev = `CURRENT_PE_${previousYear}`; // "CURRENT_PE_2025"
PE_PrevYear = SUM(row[fieldPE_Prev] || 0)

// PE Current Year = SUM_PE_OTEB (Company - PE + OT + EB)
PE_CurrYear = SUM(row[`SUM_PE_OTEB`] || 0)
```

**Field Mapping (Dynamic)**:
| Year | Field | Source | Description |
|------|-------|--------|-------------|
| Year-1 (e.g., 2025) | `CURRENT_PE_${previousYear}` | GROUP 8 (Budget) | Current Personnel Expense (dynamic) |
| Year (e.g., 2026) | `SUM_PE_OTEB` | GROUP 10 (Company) | Sum PE + OT + EB |

**Display Format**:
- Previous Year: `formatCurrency(PE_PrevYear)` - สีน้ำเงิน (Primary)
- Current Year: `formatCurrency(PE_CurrYear)` - สีเขียว (Success)
- Format: `฿1,234,567.89`
- Labels: `{previousYear}` และ `{currentYear}` (แสดงปีจริง)

**Business Rule**:
- Aggregate ข้อมูลจากทุก Cost Center ที่ผ่าน filter
- รวม OT (Overtime) และ EB (Employee Benefits) ใน PE 2026
- แสดง ฿0 ถ้าไม่มีข้อมูล

---

#### 3.2.3 KPI #3: % Growth HC (Year-1 vs Year)

**Description**: อัตราการเติบโตของ Headcount ระหว่างปีก่อนหน้าและปีปัจจุบัน (คำนวณแบบ Dynamic)

**Calculation**:
```javascript
const currentYear = filters.budgetYear;
const previousYear = currentYear - 1;

Growth_HC = ((HC_CurrYear - HC_PrevYear) / HC_PrevYear) × 100

// Handle edge cases
if (HC_PrevYear === 0) {
  Growth_HC = 0
}
```

**Display Format**:
- Format: `+12.5%` หรือ `-3.2%` หรือ `0.0%`
- Color:
  - เขียว (Success) ถ้า > 0 → Growth
  - แดง (Danger) ถ้า < 0 → Decline
  - เทา (Muted) ถ้า = 0 → No change
- Icon:
  - ↑ (fa-arrow-up) ถ้า > 0
  - ↓ (fa-arrow-down) ถ้า < 0
  - − (fa-minus) ถ้า = 0

**Business Rule**:
- แสดง 1 ทศนิยม (toFixed(1))
- ใช้ HC 2025 เป็นฐาน (denominator)
- แสดง 0.0% ถ้า HC 2025 = 0 (ป้องกัน divide by zero)

---

#### 3.2.4 KPI #4: % Growth PE Budget (Year-1 vs Year)

**Description**: อัตราการเติบโตของงบประมาณ PE ระหว่างปีก่อนหน้าและปีปัจจุบัน (คำนวณแบบ Dynamic)

**Calculation**:
```javascript
const currentYear = filters.budgetYear;
const previousYear = currentYear - 1;

Growth_PE = ((PE_CurrYear - PE_PrevYear) / PE_PrevYear) × 100

// Handle edge cases
if (PE_PrevYear === 0) {
  Growth_PE = 0
}
```

**Display Format**:
- Format: `+8.7%` หรือ `-2.1%` หรือ `0.0%`
- Color:
  - เขียว (Success) ถ้า > 0 → Budget Increase
  - แดง (Danger) ถ้า < 0 → Budget Decrease
  - เทา (Muted) ถ้า = 0 → No change
- Icon:
  - ↑ (fa-arrow-up) ถ้า > 0
  - ↓ (fa-arrow-down) ถ้า < 0
  - − (fa-minus) ถ้า = 0

**Business Rule**:
- แสดง 1 ทศนิยม (toFixed(1))
- ใช้ PE 2025 เป็นฐาน (denominator)
- แสดง 0.0% ถ้า PE 2025 = 0 (ป้องกัน divide by zero)

---

### 3.3 Data Aggregation Logic

**Scenario**: Stored Procedure คืนข้อมูลแยกตาม Cost Center (หลายแถว)

**Solution**: JavaScript ต้อง aggregate (รวม) ข้อมูลทั้งหมด

**Implementation (Dynamic)**:
```javascript
function aggregatePEBonusData(dataArray, budgetYear) {
  const currentYear = budgetYear;      // เช่น 2026
  const previousYear = budgetYear - 1; // เช่น 2025
  
  // Dynamic field name for PE previous year
  const fieldPE_Prev = `CURRENT_PE_${previousYear}`; // "CURRENT_PE_2025"
  
  const totals = dataArray.reduce((acc, row) => {
    // HC Previous Year = SUM_FT_LE + SUM_CT_LE (LE fields)
    acc.hcPrev += (row.SUM_FT_LE || 0) + (row.SUM_CT_LE || 0);
    
    // HC Current Year = SUM_FT + SUM_CT (Company fields)
    acc.hcCurr += (row.SUM_FT || 0) + (row.SUM_CT || 0);
    
    // PE Previous Year = CURRENT_PE_{previousYear} (Dynamic field)
    acc.pePrev += (row[fieldPE_Prev] || 0);
    
    // PE Current Year = SUM_PE_OTEB (Company with OT+EB)
    acc.peCurr += (row.SUM_PE_OTEB || 0);
    
    return acc;
  }, { 
    hcPrev: 0, 
    hcCurr: 0, 
    pePrev: 0, 
    peCurr: 0,
    previousYear: previousYear,
    currentYear: currentYear
  });
  
  return totals;
}
```

---

### 3.4 Filter Impact

**Filters ที่มีผล**:
1. **Company** (Required) → เลือก BIG C หรือ BJC
2. **Budget Year** (Required) → เลือกปี (2025, 2026)
3. **COBU/Format** (Optional) → กรองตาม Business Unit
4. **Cost Center** (Optional) → กรองตาม Cost Center

**Filter Behavior**:
- ถ้าไม่เลือก filter → แสดงข้อมูลทั้งหมด
- ถ้าเลือก COBU → แสดงเฉพาะ COBU นั้น
- ถ้าเลือก Cost Center → แสดงเฉพาะ Cost Center นั้น

---

### 3.5 Error Handling

**Scenario 1**: API Error
```javascript
catch (error) {
  console.error('Error loading KPI cards:', error);
  showDashboardError('Failed to load KPI data');
  // แสดง "-" ใน KPI cards
}
```

**Scenario 2**: No Data
```javascript
if (!dataArray || dataArray.length === 0) {
  return { hc2025: 0, hc2026: 0, pe2025: 0, pe2026: 0 };
}
```

**Scenario 3**: Division by Zero
```javascript
const growthHC = data.hc2025 > 0 
  ? ((data.hc2026 - data.hc2025) / data.hc2025) * 100 
  : 0;
```

---

### 3.6 Stored Procedure Details

**SP_REP_HC_PE_BY_COSTCENTER** (BIG C - Company ID = 2)
- **Parameters**:
  - `@YearBudget` INT (ปีที่ต้องการดู - 2025 หรือ 2026)
  - `@YearFrom` INT (ค่าคงที่ = 2019 - ข้อมูลย้อนหลัง)
  - `@YearTo` INT (ค่าคงที่ = 2024 - ข้อมูลย้อนหลัง)
  - `@CompanyId` INT (ค่าคงที่ = 2 - BIG C)
  - `@CostCenterLike` NVARCHAR (NULL - ไม่ใช้ในการกรอง)

**SP_REP_HC_PE_BY_COSTCENTER_BJC** (BJC - Company ID = 1)
- **Parameters**: เหมือนกับ BIG C แต่ `@CompanyId` = 1

**Returns**: 67 columns แยกเป็น 10 groups:
1. Master Data (4 columns)
2. Historical 2019-2024 (6 years × 3 columns = 18 columns)
3. Budget 2025 (4 columns) ← **ใช้ใน KPI**
4. LE 2026 (17 columns) ← **ใช้ใน KPI**
5. Company 2026 (17 columns) ← **ใช้ใน KPI**

---

### 3.7 Testing Checklist

**Functional Tests**:
- [ ] KPI 1 แสดงค่า HC 2025 และ 2026 ถูกต้อง
- [ ] KPI 2 แสดงค่า PE 2025 และ 2026 ถูกต้อง (รวม OT+EB)
- [ ] KPI 3 คำนวณ % Growth HC ถูกต้อง
- [ ] KPI 4 คำนวณ % Growth PE ถูกต้อง
- [ ] Growth indicator แสดงสีและ icon ถูกต้อง (เขียว/แดง/เทา)
- [ ] Handle division by zero (PE 2025 = 0 → แสดง 0.0%)
- [ ] No data → แสดง 0 หรือ "-"

**Integration Tests**:
- [ ] API `/api/Summary/GetPEBonusByCostCenter` คืนข้อมูลถูกต้อง
- [ ] Stored Procedure ทำงานถูกต้อง (BIG C และ BJC)
- [ ] Aggregation logic รวมข้อมูลจากหลาย Cost Center ถูกต้อง
- [ ] Filter กรองข้อมูลถูกต้อง (Company, Year, COBU, Cost Center)

**UI Tests**:
- [ ] Card layout แสดงถูกต้อง (4 cards, responsive)
- [ ] Font size เหมาะสม (values อ่านง่าย)
- [ ] Color coding ชัดเจน (Primary/Success สำหรับ 2025/2026)
- [ ] Growth indicators มองเห็นชัด (icon + color)

---
```

**ตำแหน่ง:** แทนที่ Section 3 เดิมทั้งหมด (บรรทัด 380-920)

---

### 8. Documentation - Section 9.8.1 ใหม่

**ไฟล์:** `PE_BUDGET_DASHBOARD_PHASE1_SPEC_CORRECTED.md`

**เพิ่ม Section 9.8.1 ใหม่ (แทนของเก่า):**

```markdown
#### 9.8.1 PE Bonus By Cost Center API

**Endpoint**: `POST /api/Summary/GetPEBonusByCostCenter`

**Test Case**: Verify API returns correct structure and data for KPI calculations

**Request Body**:
```json
{
  "companyId": 2,
  "budgetYear": 2025,
  "cobuFormat": null,
  "costCenterCode": null
}
```

**Expected Response**:
```json
[
  {
    "COST_CENTER": "100001",
    "COST_CENTER_NAME": "Office of CEO",
    "COBU": "HQ",
    "DIVISION": "Executive",
    "BUDGET_FT_2025": 5000000.00,
    "BUDGET_CT_2025": 500000.00,
    "CURRENT_PE_2025": 6500000.00,
    "CURRENT_PE_BONUS_2025": 6800000.00,
    "SUM_FT_LE": 10.0,
    "SUM_CT_LE": 2.0,
    "SUM_PE_LE": 7200000.00,
    "SUM_PE_OTEB_LE": 7500000.00,
    "SUM_FT": 12.0,
    "SUM_CT": 3.0,
    "SUM_PE": 8000000.00,
    "SUM_PE_OTEB": 8400000.00,
    // ... (54 columns อื่นๆ)
  },
  // ... (แถวอื่นๆ สำหรับ Cost Center อื่น)
]
```

**Tests**:
1. ✅ Returns 200 OK status
2. ✅ Returns array of objects (multiple cost centers)
3. ✅ All 67 columns present in each row
4. ✅ Numeric types correct (decimal for all PE/HC fields)
5. ✅ GROUP 8 fields (Budget 2025) not NULL
6. ✅ GROUP 9 fields (LE 2026) not NULL
7. ✅ GROUP 10 fields (Company 2026) not NULL
8. ✅ Stored Procedure called correctly based on Company ID:
   - Company ID = 2 → `SP_REP_HC_PE_BY_COSTCENTER`
   - Company ID = 1 → `SP_REP_HC_PE_BY_COSTCENTER_BJC`

**Aggregation Test**:
```javascript
// Verify aggregation logic (with dynamic budgetYear)
const budgetYear = 2026; // Example
const totals = aggregatePEBonusData(responseData, budgetYear);

// Totals should equal SUM of all rows
assert(totals.hcPrev === SUM(SUM_FT_LE + SUM_CT_LE));
assert(totals.hcCurr === SUM(SUM_FT + SUM_CT));
assert(totals.pePrev === SUM(CURRENT_PE_2025)); // Dynamic: CURRENT_PE_{budgetYear-1}
assert(totals.peCurr === SUM(SUM_PE_OTEB));
assert(totals.previousYear === 2025);
assert(totals.currentYear === 2026);
```

**Pass Criteria**: API returns correct data structure with 67 columns, aggregation produces correct KPI values

---
```

**ตำแหน่ง:** แทนที่ Section 9.8.1 เดิม (บรรทัด 3065-3090)

---

## 📊 สรุปจำนวนบรรทัดที่เปลี่ยนแปลง

### ไฟล์ Backend

| ไฟล์ | ลบ (บรรทัด) | เพิ่ม (บรรทัด) | สุทธิ |
|------|------------|--------------|-------|
| `SummaryController.cs` | 99 | 0 | -99 |
| `KpiOverviewDto.cs` | ทั้งไฟล์ (~25) | 0 | -25 |
| **Total Backend** | **124** | **0** | **-124** |

### ไฟล์ Frontend

| ไฟล์ | ลบ (บรรทัด) | เพิ่ม (บรรทัด) | สุทธิ |
|------|------------|--------------|-------|
| `budget-pe-dashboard.api.js` | 19 | 45 | +26 |
| `budget-pe-dashboard.events.js` | 26 | 65 | +39 |
| `Index.cshtml` | 65 | 90 | +25 |
| `site.css` | 0 | 25 | +25 |
| **Total Frontend** | **110** | **225** | **+115** |

### เอกสาร

| ไฟล์ | ลบ (บรรทัด) | เพิ่ม (บรรทัด) | สุทธิ |
|------|------------|--------------|-------|
| `PE_BUDGET_DASHBOARD_PHASE1_SPEC_CORRECTED.md` (Section 3) | 540 | 450 | -90 |
| `PE_BUDGET_DASHBOARD_PHASE1_SPEC_CORRECTED.md` (Section 9.8.1) | 25 | 60 | +35 |
| **Total Documentation** | **565** | **510** | **-55** |

### สรุปรวม

| ประเภท | ลบ (บรรทัด) | เพิ่ม (บรรทัด) | สุทธิ |
|--------|------------|--------------|-------|
| Backend | 124 | 0 | -124 |
| Frontend | 110 | 225 | +115 |
| Documentation | 565 | 510 | -55 |
| **Grand Total** | **799** | **735** | **-64** |

**ผลลัพธ์:** ลดโค้ดและเอกสาร **64 บรรทัด** รวมทั้งหมด (ง่ายขึ้น, maintenance ดีขึ้น)

---

## 🎯 ลำดับการทำงาน (Implementation Order)

### Phase 1: Backend (ไม่ต้องทำ - ใช้ของเดิม)
1. ✅ API `GetPEBonusByCostCenter` มีอยู่แล้ว
2. ✅ DTO `BudgetPEBonusDataDto` มีอยู่แล้ว
3. ✅ Stored Procedure มีอยู่แล้ว

### Phase 2: Frontend Cleanup
1. ❌ **ลบ**: `SummaryController.cs` - API `GetKpiOverview()`
2. ❌ **ลบ**: `KpiOverviewDto.cs` - ทั้งไฟล์
3. ❌ **ลบ**: `budget-pe-dashboard.api.js` - function `fetchDashboardKpiOverview()`

### Phase 3: Frontend Implementation
1. ✅ **เพิ่ม**: `budget-pe-dashboard.api.js` - function `fetchDashboardPEBonusData()` และ `aggregatePEBonusData()`
2. ✅ **แก้**: `budget-pe-dashboard.events.js` - function `loadDashboardKpiCards()` (version ใหม่)
3. ✅ **เพิ่ม**: `budget-pe-dashboard.events.js` - functions `formatPercentage()` และ `updateGrowthIndicator()`

### Phase 4: Frontend UI
1. ✅ **แก้**: `Index.cshtml` - Block A (ลบ 7 cards, เพิ่ม 4 cards ใหม่)
2. ✅ **เพิ่ม**: `site.css` - Growth indicator styles

### Phase 5: Documentation
1. ✅ **แก้**: `PE_BUDGET_DASHBOARD_PHASE1_SPEC_CORRECTED.md` - Section 3 (KPI definitions ใหม่)
2. ✅ **แก้**: `PE_BUDGET_DASHBOARD_PHASE1_SPEC_CORRECTED.md` - Section 9.8.1 (API validation ใหม่)

### Phase 6: Testing
1. ✅ Unit test aggregation logic
2. ✅ Integration test API endpoint
3. ✅ UI test KPI cards display
4. ✅ Acceptance test with real data

---

## ⚠️ ข้อควรระวัง (Important Notes)

### 1. Stored Procedure Parameters
- **@YearBudget**: ต้องส่งปีที่ต้องการดู (2025 หรือ 2026)
- **@YearFrom** และ **@YearTo**: ค่าคงที่ (2019-2024) สำหรับข้อมูลย้อนหลัง
- **@CompanyId**: 1 (BJC) หรือ 2 (BIG C)
- **@CostCenterLike**: ต้องส่ง NULL (ไม่ใช้ในการกรอง)

### 2. Data Aggregation
- Stored Procedure คืนข้อมูล **แยกตาม Cost Center** (หลายแถว)
- JavaScript ต้อง **SUM** ค่าทั้งหมดเพื่อได้ Total
- ต้อง handle NULL values (`|| 0`)

### 3. Field Naming (Dynamic Approach)
- **HC Previous Year** ใช้ field จาก **GROUP 9 (LE)** → `SUM_FT_LE`, `SUM_CT_LE`
- **HC Current Year** ใช้ field จาก **GROUP 10 (Company)** → `SUM_FT`, `SUM_CT`
- **PE Previous Year** ใช้ field จาก **GROUP 8 (Budget)** → `CURRENT_PE_${budgetYear-1}` (Dynamic)
- **PE Current Year** ใช้ field จาก **GROUP 10 (Company)** → `SUM_PE_OTEB`
- **ตัวอย่าง**: ถ้า `budgetYear = 2026` → ใช้ `CURRENT_PE_2025` สำหรับปีก่อนหน้า

### 4. Growth Calculation Edge Cases
- Division by zero: ตรวจสอบ `data.hc2025 > 0` และ `data.pe2025 > 0`
- No data: ตรวจสอบ `dataArray.length === 0`
- Negative growth: แสดงสีแดงและลูกศรลง

### 5. Filter Dependencies
- **Company** และ **Budget Year** เป็น Required fields
- ต้องเลือกก่อนถึงจะ load KPI data ได้
- COBU และ Cost Center เป็น Optional filters

---

## ✅ Acceptance Criteria

### Backend
- [ ] API `GetKpiOverview` ถูกลบออกแล้ว
- [ ] DTO `KpiOverviewDto.cs` ถูกลบออกแล้ว
- [ ] API `GetPEBonusByCostCenter` ทำงานถูกต้อง (existing)
- [ ] Stored Procedure คืนข้อมูล 67 columns ครบถ้วน

### Frontend - JavaScript
- [ ] Function `fetchDashboardKpiOverview()` ถูกลบออกแล้ว
- [ ] Function `fetchDashboardPEBonusData()` ใหม่ทำงานถูกต้อง
- [ ] Function `aggregatePEBonusData()` รวมข้อมูลถูกต้อง
- [ ] Function `loadDashboardKpiCards()` ใหม่แสดงผลถูกต้อง
- [ ] Growth calculation ถูกต้อง (รวม edge cases)
- [ ] Growth indicator แสดงสีและ icon ถูกต้อง

### Frontend - UI
- [ ] Block A แสดง 4 cards แทน 7 cards
- [ ] Card layout responsive (col-md-3)
- [ ] KPI 1: HC 2025 vs 2026 แสดงถูกต้อง
- [ ] KPI 2: PE 2025 vs 2026 แสดงถูกต้อง
- [ ] KPI 3: % Growth HC แสดงถูกต้อง (รวม indicator)
- [ ] KPI 4: % Growth PE แสดงถูกต้อง (รวม indicator)
- [ ] CSS styles ใช้งานได้ดี (growth-indicator)

### Documentation
- [ ] Section 3 ถูกแก้ไขเป็น 4 KPIs ใหม่
- [ ] Field mapping ครบถ้วนถูกต้อง
- [ ] Calculation formulas ชัดเจน
- [ ] Section 9.8.1 อัพเดทเป็น PE Bonus API
- [ ] Test cases ครอบคลุม

### Testing
- [ ] Unit tests pass (aggregation logic)
- [ ] Integration tests pass (API endpoint)
- [ ] UI tests pass (KPI display)
- [ ] No console errors
- [ ] Performance acceptable (< 2 seconds)

---

**[END OF DOCUMENT]**

**Document Status**: ✅ Complete - Ready for Implementation

**Total Changes**: 
- ลบ: 799 บรรทัด
- เพิ่ม: 735 บรรทัด
- สุทธิ: -64 บรรทัด (ง่ายขึ้น 8%)
