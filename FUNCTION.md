# 📊 EXPORT EXCEL FUNCTION SPECIFICATION

## 🎯 Overview
Export Allocation Batch Entry data to Excel (.xlsx) with advanced styling capabilities for BJC and BIG C budget planning templates.

---

## 📋 COLUMN STRUCTURE ANALYSIS

### 🏢 **BJC (CompanyId = '1') - Column Structure**

#### **A. Header Row 1: Red Header (Row 1)**
```
Columns: A-B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | ...
Content: Fill | Fill | Fill | Fill | Fill | Fill | Fill | Fill | Fill | Fill | Fill | Fill | Fill | Fill | Fill | Fill | ...

Styling:
- Background Color: #FF0000 (Red)
- Font Color: #FFFFFF (White)
- Font Weight: Bold
- Font Size: 11pt
- Alignment: Center
```

#### **B. Section Headers (Row 2)**
```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ Columns                    │ Content        │ Background Color │ Merge Info              │
├────────────────────────────┼────────────────┼──────────────────┼─────────────────────────┤
│ A-E                        │ (empty)        │ White            │ Basic info section      │
│ F-T                        │ "LE 2025"      │ #FFFF00 (Yellow) │ Merged across columns   │
│ U-AD                       │ (empty)        │ White            │ Transition section      │
│ AE-AN                      │ "Y2025"        │ #4472C4 (Blue)   │ Budget year section     │
│ AO-BF                      │ "Y2025"        │ #4472C4 (Blue)   │ Continued blue section  │
│ BG-BY                      │ "Y2025"        │ #ED7D31 (Orange) │ Orange highlight section│
│ BZ-CN                      │ "Y2026"        │ White            │ Next year section       │
│ CO-CQ                      │ "Fill"         │ #FF0000 (Red)    │ Red accent section      │
│ CR-onwards                 │ "Y2026"        │ #4472C4 (Blue)   │ Continued next year     │
└────────────────────────────┴────────────────┴──────────────────┴─────────────────────────┘

Special Notes:
- "LE 2025³" (with superscript 3) in Yellow section
- Multiple color zones for different data categories
```

#### **C. Column Headers (Row 3)**

**Basic Information Columns (A-M):**
```
A: COBU               (Dropdown)
B: DIVISION           (Dropdown)
C: DEPARTMENT         (Dropdown)
D: SC                 (Text)
E: ID                 (Text - Employee ID)
F: FULL NAME TH       (Text - Thai name)
G: (empty)
H: (empty)
I: FULL NAME EN       (Text - English name)
J: (empty)
K: (empty)
M: COST CENTER        (Dropdown/Text)
N: POSITION           (Dropdown)
O: JB                 (Dropdown - Job Band)
P: JOIN DATE          (Date)
Q: YOS                (Number - Years of Service)
R: YOS                (Number)
```

**LE 2025 Section (Yellow - Columns S-T):**
```
S: Emp Type           (Dropdown)
T: New HC 2026        (Dropdown)
```

**New/Vacant Period Section (Yellow - Columns U-V):**
```
U: New / Vacant Period in 2026     (Dropdown)
V: New / Vacant Period in 2025     (Dropdown)
```

**Details Section (White - Columns W-AD):**
```
W: Reason             (Text - Long description)
X: Remark             (Text)
Y: Group              (Dropdown)
Z: Division           (Dropdown)
AA: Department        (Dropdown)
AB: HRBP              (Text - Thai text)
AC: LE No. of Month   (Number)
AD: 2026 No. of Month (Number)
```

**Y2025 Budget Year Section (Blue - Columns AE-AN):**
```
AE: Bonus Type                                (Dropdown - Yellow highlight)
AF: Salary                                    (Number)
AG: Premium                                   (Number)
AH: Basic Salary with en                      (Number)
AI: Salary not en                             (Number)
AJ: Bonus                                     (Number)
AK: Salary (Temp)                             (Number - Empty)
AL: Social Security fund (Temp)               (Number - Empty)
AM: ค่านัยด์เบี้ยเลี้ยง/ค่า(3ร่วงจากงานยกงสารธารณะ)  (Text - Empty)
AN: ค่านาระวิกฤต(งบบันเทิง)                    (Text - Empty)
```

**Y2025 Continued (Blue - Columns AO-AW):**
```
AO: ค่านจิกรยอดสวย (PC)                       (Number - Empty)
AP: ค่าจัดเรียนลิเต่า (PC)                   (Number - Empty)
AQ: เนื้อผสม (PC)                            (Number - Empty)
AR: โปรเลยก์ (PC)                            (Number - Empty)
AS: โครจึพท์ (PC)                            (Number - Empty)
AT: ค่าจิ (PC)                               (Number - Empty)
AU: ค่าภาระ (PC)                             (Number - Empty)
AV: ฝึกๆ (PC)                                (Number - Empty)
```

**Y2025 Continued (Blue - Columns AW-BA):**
```
AW: Temporary Staff (Salary)                  (Number)
AX: Y2025 70000600 Social Security Fund       (Number - e.g., 875)
AY: Y2025 70000700 Workmen Compensation Fund  (Number - e.g., 32)
AZ: Y2025 70000800 Sales Car Allowance        (Number)
BA: Y2025 ค่าพักก็น                          (Number - Empty)
```

**Y2025 Benefits (Orange highlight - Columns BB-BL):**
```
BB: Y2025 ค่านกรรจวยคง (3วิงงจะงานยกงสารธารณะ)  (Number - Empty)
BC: Y2025 ค่านจิกรยอดสวย (PC)                  (Number - Empty)
BD: Y2025 ค่าจัดเรียนลิเต่า (PC)              (Number - Empty)
BE: Y2025 เนื้อผสม (PC)                       (Number - Empty)
BF: Y2025 โปรเลยก์ (PC)                       (Number - Empty)
BG: Y2025 โครจึพท์ (PC)                       (Number - Empty)
BH: Y2025 ค่าจิ (PC)                          (Number - Empty)
BI: Y2025 ค่าภาระ (PC)                        (Number - Empty)
BJ: Y2025 ฝึกๆ (PC)                           (Number - Empty)
```

**Y2025 Other Benefits (Orange - Columns BK-BY):**
```
BK: Y2025 71001020 Others subject to Tax      (Number)
BL: Y2025 71001070 Car Allowance              (Number)
BM: Y2025 71001080 License                    (Number)
BN: Y2025 73200100 Outsource Wages            (Number)
BO: Y2025 73200190 Company Cars-Gasoline      (Number - Yellow highlight)
BP: Y2025 73201000 Company Cars-other         (Number)
BQ: Y2025 73500100 Cars-Rental                (Number)
BR: Y2025 73500115 Car Plan-Gasoline          (Number)
BS: Y2025 71000100 Medical-outsid            (Number)
BT: Y2025 71000200 Medical-in house           (Number)
BU: Y2025 71001000 Staff Activities           (Number)
BV: Y2025 71001200 Uniform                    (Number)
BW: Y2025 71001400 Life Insurance             (Number)
BX: Y2025 PE + SB (Mth)                       (Number)
BY: Y2025 PE + SB LF (Sep. - Dec)             (Number)
```

**Y2026 Next Year Section (White - Columns BZ-CN):**
```
BZ: Y2026 Bonus Type                          (Dropdown - Yellow highlight)
CA: Y2026 Salary                              (Number)
CB: Y2026 Premium                             (Number)
CC: Y2026                                     (Empty)
CD: Y2026                                     (Empty)
CE: Y2026 70000400 Social Security fund       (Number - 875)
CF: Y2026 70000600 Provident Fund             (Number)
CG: Y2026 Compensatio Housing fixed           (Number)
CH: Y2026 Sales Car Allowance                 (Number)
CI: Y2026 ค่าพักก็น                          (Number - Empty)

... (continues with similar Y2026 columns matching Y2025 structure)
```

**Summary Section (Red/Blue - Columns CO-CQ):**
```
CO: Fill - Y 2025 For Summary by cost center  (Text - Red header)
CP: Fill - Y 2025 For Summary by cost center  (Text - Red header)
CQ: Y 2026 For Summary by cost center         (Text - Blue header)
```

**Y2026 Continued (Columns CR-onwards):**
```
CR: PE (Mth)          (Number)
CS: PE (Year)         (Number)
CT: PE (Mth)          (Number - Red border)
CU: PE (Year)         (Number - Red border)
CV: Run Rate Group    (Dropdown)
CW: Discount          (Percentage - e.g., 99%)
CX: Executive         (Dropdown - Y/N)
CY: Non - Exc.        (Dropdown)
CZ: Focus HC          (Dropdown - Y/N)
```

**Final Columns:**
```
DA onwards: Focus PE, Join PVF, Join PVF (Yellow highlight)
```

---

### 🏬 **BIG C (CompanyId = '2') - Column Structure**

#### **A. Header Row 1: Red Header (Row 1)**
```
Columns: A-B | C | D-E | F | G-I | J-N | O-S | T | ...
Content: Fill | Fill | Fill | Fill | Fill | Fill | Fill | Fill | ...

Styling: (Same as BJC)
- Background Color: #FF0000 (Red)
- Font Color: #FFFFFF (White)
- Font Weight: Bold
```

#### **B. Section Headers (Row 2)**
```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ Columns                    │ Content        │ Background Color │ Merge Info              │
├────────────────────────────┼────────────────┼──────────────────┼─────────────────────────┤
│ A-M                        │ (empty)        │ White            │ Basic info section      │
│ N-T                        │ "LE 2025³"     │ #FFFF00 (Yellow) │ LE section with note    │
│ U-W                        │ "LE 2025"      │ #FFFF00 (Yellow) │ Continued yellow        │
│ X-AD                       │ (empty)        │ White            │ Details section         │
│ AE-AF                      │ "Y2025"        │ White            │ Section divider         │
│ AG onwards                 │ "Y2025"        │ #4472C4 (Blue)   │ Budget year (Blue)      │
└────────────────────────────┴────────────────┴──────────────────┴─────────────────────────┘

Dates Row (Row 3):
- Column P: "12/31/2025"
- Column Q: "12/31/2026"
```

#### **C. Column Headers (Row 4)**

**Basic Information Columns (A-M):**
```
A: FORMAT             (Dropdown - "HO")
B: DIVISION           (Dropdown - e.g., "BCHOBC:Finance and Accounting")
C: DEPARTMENT         (Dropdown - Full department name)
D: SECTION            (Dropdown - Store/location codes)
E: STORE_MA_ME        (Dropdown - Store identifier)
F: ID                 (Text - Employee ID, e.g., "1012197")
G: TITLE              (Text - Thai title "นาง", "น.ส.", "นาย")
H: NAME               (Text - Thai first name)
I: LASTNAME           (Text - Thai last name)
J: TITLE              (Text - English "Mrs.", "Miss", "Mr.")
K: NAME               (Text - English first name)
L: LASTNAME           (Text - English last name)
M: COST CENTER        (Text/Number - e.g., "49990", "02990")
```

**Position & Job Info (N-R):**
```
N: POSITION           (Dropdown - Position title)
O: JB                 (Dropdown - Job Band "6A", "3A", "5A", "5B")
P: JOIN DATE          (Date - e.g., "16/03/2015")
Q: YOS                (Number - Years of Service)
R: YOS                (Number - Duplicate?)
```

**LE 2025 Section (Yellow - Columns S-V):**
```
S: Emp Type           (Dropdown - Yellow highlight)
T: New HC 2026        (Dropdown - Yellow highlight)
U: New / Vacant Period in 2026  (Dropdown - Yellow highlight)
V: New / Vacant Period in 2025  (Dropdown - Yellow highlight)
```

**Details Section (White - Columns W-AD):**
```
W: Reason             (Text - Transfer notes, e.g., "Transfer to BJC 1 Aug 2025")
X: Remark             (Text - "FAD" or other notes)
Y: Group              (Dropdown - "Hyper", "Advisor", "Inter", "CSS")
Z: Division           (Dropdown)
AA: Department        (Dropdown)
AB: HRBP              (Text - Thai text "ทำไอรม", "Beau", "Chita")
AC: 2025 LE No. of Month  (Number - "4")
AD: 2026 No. of Month     (Number - "12")
```

**Y2025 Budget Section (Blue header, column AG onwards):**
```
AE: (empty transition column)
AF: (Red "Fill" header)
AG: (Red "Fill" header)
AH: Base salary       (Number - e.g., "35,000")
AI: Premium           (Number - e.g., "1,000")
AJ: Total Payroll (Base+Premium)  (Formula/Number)
```

**Y2025 Benefits (Red "Fill" header - Columns AH-AY):**
```
AH: Y2025 60105000 Bonus                      (Number - e.g., "5,884")
AI: Y2025 60126010 Fleet Card - PE            (Number)
AJ: Y2025 60126500 Car Allowance              (Number - e.g., "33,000")
AK: Y2025 60127000 License Allowance          (Number)
AL: Y2025 60126900 Housing Allowan            (Number)
AM: Y2025 60126800 Gasoline Allowan           (Number)
AN: Y2025 60127400 Wage - Student             (Number)
AO: Y2025 60127600 Car Rental - PE            (Number - Orange highlight)
AP: Y2025 60127100 Skill Pay Allowan          (Number)
AQ: Y2025 60127300 Other Allowan              (Number)
AR: Y2025 60141050 Social security            (Number - "875")
AS: Y2025 60141100 Labor fund fee             (Number - "32")
AT: Y2025 60141560 Other Staff benefit        (Number)
AU: Y2025 60142000 Provident fund             (Number - e.g., "1,925")
AV: Y2025 60143150 Provision                  (Number - "560")
AW: Y2025 63325150 Interest                   (Number - "105")
AX: Y2025 60141150 Staff Insurance            (Number - e.g., "345")
AY: Y2025 60141250 Medical expense            (Number - e.g., "3,209")
```

**Y2026 Next Year Section (Blue header - Columns AZ onwards):**
```
AZ: Y2025 (transition)
BA: Y2025 60144172 Medical - In House         (Number - "21")
BB: Y2025 60144400 Training service           (Number)
BC: Y2025 PE + SB (Mth)                       (Number - calculated)
BD: Y2025 PE + SB LF (Sep. - Dec)             (Number - calculated)

BE: (Red "Fill" header)
BF: (Red "Fill" header)
BG: Y2026 60105000 Base salary                (Number - "36,750")
BH: Y2026 Premium                             (Number)
BI: Y2026 Total Payroll (Base+Pre)            (Formula)
BJ: (empty)
BK: Y2026 Bonus Type                          (Dropdown - Yellow highlight)
```

**Y2026 Benefits (continues similar pattern):**
```
BL: Y2026 Bonus       (Number - e.g., "8,146")
BM: Y2026 Fleet Card - PE      (Number)
BN: Y2026 Car Allowance        (Number - e.g., "33,000")
BO: Y2026 License Allowance    (Number)
BP: Y2026 Housing Allowan ce   (Number)
BQ: Y2026 Gasoline Allowan ce  (Number)

... (continues with similar Y2026 columns matching Y2025 structure)
```

**Employee Welfare Section (Red header - Column BX):**
```
BX: (Red "Fill" header between Y2026 columns)
BY: Y2026 Employee Welfare     (Number)
```

**Final Y2026 Columns (Blue - Columns BZ-CE):**
```
BZ: Y2026 Wage - Student PE    (Number)
CA: Y2026 Car Rental - PE      (Number)
CB: Y2026 Skill Pay Allowan ce (Number)
CC: Y2026 Other Allowan ce     (Number)
CD: Y2026 Social security      (Number - "875")
CE: Y2026 Labor fund fee       (Number - "32")
CF: Y2026 Other Staff benefit  (Number)
CG: Y2026 Provident fund       (Number - "2,021")
CH: Y2026 XXXXXXXX Employee Welfare  (Masked/Hidden)
CI: Y2026 Provision n          (Number - "588")
CJ: Y2026 Interest insuranc e  (Number - "110")
CK: Y2026 Staff Medical expense (Number)
CL: Y2026 Medical - In House   (Number - "21")
CM: Y2026 Training             (Number)
CN: Y2026 Long service         (Number)
CO: Y2026 PE + SB (Mth)        (Formula)
```

**Y2026 Summary Section (Yellow highlight - Columns CP-CQ):**
```
CP: (Red/Blue mixed headers)
CQ: Y2026 COST CENTER          (Text/Number - Yellow highlight)
```

**Final Summary Columns (Columns CR onwards):**
```
CR: Salary Structure           (Dropdown)
CS: (Blue "Y 2025" header)
CT: (Blue "Y 2025" header)
CU: PE (Mth)                   (Number)
CV: PE (Year)                  (Number)
CW: (Red "Y 2026" header)
CX: (Red "Y 2026" header)
CY: PE (Mth)                   (Number - Red border)
CZ: PE (Year)                  (Number - Red border)
```

**Run Rate & Config (White section):**
```
DA: Run Rate Group             (Dropdown - e.g., "Exclude", "Finance and Accounting")
DB: LEVEL_GROUP                (Text - "5B up", "1B - 2A", "3B - 4A")
DC: Discount                   (Percentage - "100.00%", "92.86%")
DD: Executive                  (Dropdown - "Y" or empty)
DE: Non - Exc.                 (Dropdown - "Y" or empty)
DF: Focus HC                   (Dropdown - "Y")
```

**Final Columns:**
```
DG: Focus PE                   (Dropdown - "Y")
DH: Join PVF                   (Dropdown - Number "1", "2", "0")
DI: Join PVF                   (Dropdown - Yellow highlight "Y"/"N")
```

---

## 🎨 STYLING RULES

### **Color Palette**

**Header Colors:**
```css
Red Header:     #FF0000 (Text: #FFFFFF White)
Yellow Section: #FFFF00 (Text: #000000 Black)
Blue Section:   #4472C4 (Text: #FFFFFF White)
Orange Section: #ED7D31 (Text: #000000 Black)
White/Default:  #FFFFFF (Text: #000000 Black)
Light Gray:     #F2F2F2 (Column headers)
Light Green:    #C6E0B4 (Data highlights - rare)
Light Orange:   #FCE4D6 (Data highlights)
```

**Border Style:**
```css
All Cells: Thin borders #000000
Header Rows: Medium borders (thicker)
Section Dividers: Thick borders for visual separation
```

**Font Configuration:**
```css
Header Row 1 (Red):
  - Font: Calibri/Arial Bold
  - Size: 11pt
  - Color: White
  - Alignment: Center

Section Headers (Row 2):
  - Font: Calibri/Arial Bold
  - Size: 11pt
  - Color: Black (or White for dark backgrounds)
  - Alignment: Center
  - Vertical Align: Middle

Column Headers (Row 3-4):
  - Font: Calibri/Arial Bold
  - Size: 10pt
  - Color: Black
  - Alignment: Center
  - Wrap Text: TRUE (for multi-line headers)
  - Vertical Align: Top

Data Rows:
  - Font: Calibri/Arial Regular
  - Size: 10pt
  - Color: Black
  - Number Format: #,##0 (with comma separator)
  - Date Format: dd/mm/yyyy
  - Percentage Format: 0.00%
```

**Column Width Rules:**
```javascript
Auto-fit columns: ID, JB, YOS (narrow)
Fixed width columns:
  - COBU/FORMAT: 8 chars
  - DIVISION: 30 chars
  - DEPARTMENT: 35 chars
  - FULL NAME: 20 chars
  - POSITION: 25 chars
  - Reason: 50 chars (wide for text)
  - Benefits columns: 12 chars (numbers)
```

**Row Height:**
```
Header Row 1: 25 pixels
Section Headers Row 2: 30 pixels
Column Headers Row 3-4: 35 pixels (wrap text)
Data Rows: 18 pixels (auto-fit)
```

---

## 📊 DATA TYPE MAPPING

### **Field Type → Excel Format**

```javascript
const EXCEL_DATA_TYPES = {
  // Text fields
  'text': {
    format: '@',           // Text format
    alignment: 'left'
  },
  
  // Number fields
  'number': {
    format: '#,##0',       // Number with comma separator
    alignment: 'right'
  },
  
  // Decimal fields
  'decimal': {
    format: '#,##0.00',    // 2 decimal places
    alignment: 'right'
  },
  
  // Currency fields
  'currency': {
    format: '#,##0',       // No decimal for Thai Baht
    alignment: 'right'
  },
  
  // Date fields
  'date': {
    format: 'dd/mm/yyyy',  // Thai date format
    alignment: 'center'
  },
  
  // Percentage fields
  'percentage': {
    format: '0.00%',       // 2 decimal percentage
    alignment: 'center'
  },
  
  // Dropdown fields (stored as text)
  'dropdown': {
    format: '@',
    alignment: 'left'
  }
};
```

---

## 🔧 SPECIAL FEATURES

### **1. Cell Highlighting Rules**

**Yellow Highlights:**
```javascript
// BJC
- Columns F-T (LE 2025 section)
- Column AE (Bonus Type Y2025)
- Column BO (Company Cars-Gasoline Y2025)
- Column BZ (Bonus Type Y2026)
- Column CQ (COST CENTER summary)
- Columns DA onwards (Join PVF)

// BIG C
- Columns N-W (LE 2025 section)
- Column BK (Bonus Type Y2026)
- Column CQ (COST CENTER)
- Column DI (Join PVF final)
```

**Orange Highlights:**
```javascript
// BJC
- Columns BB-BL (Y2025 PC benefits)
- Specific data rows with highlighting
```

**Blue Highlights:**
```javascript
// Both BJC & BIG C
- Y2025 section headers
- Y2026 column groups
```

**Red Headers:**
```javascript
// Both BJC & BIG C
- Row 1 (Fill headers)
- Section divider columns
- Summary section headers
```

### **2. Merged Cells**

```javascript
const MERGED_CELLS_BJC = [
  { range: 'F2:T2', value: 'LE 2025³' },      // Yellow section
  { range: 'AE2:AN2', value: 'Y2025' },       // Blue section
  { range: 'AO2:BF2', value: 'Y2025' },       // Blue continued
  { range: 'BG2:BY2', value: 'Y2025' },       // Orange section
  { range: 'BZ2:CN2', value: 'Y2026' },       // White section
  { range: 'CO2:CQ2', value: 'Fill' },        // Red section
  { range: 'CR2:DA2', value: 'Y2026' }        // Blue continued
];

const MERGED_CELLS_BIGC = [
  { range: 'N2:T2', value: 'LE 2025³' },      // Yellow section
  { range: 'U2:W2', value: 'LE 2025' },       // Yellow continued
  { range: 'AG2:AY2', value: 'Y2025' },       // Blue section (starts later)
  { range: 'BG2:BX2', value: 'Y2026' },       // Y2026 section
  // ... (continue pattern)
];
```

### **3. Freeze Panes**

```javascript
// Freeze first 3 rows (headers) and first 3 columns (COBU/FORMAT, DIVISION, DEPARTMENT)
worksheet.views = [
  {
    state: 'frozen',
    xSplit: 3,    // Freeze columns A-C
    ySplit: 4,    // Freeze rows 1-4
    topLeftCell: 'D5',
    activeCell: 'D5'
  }
];
```

### **4. Column Grouping**

```javascript
// BJC Column Groups
worksheet.getColumn('F').outlineLevel = 1;  // LE 2025 start
worksheet.getColumn('T').outlineLevel = 1;  // LE 2025 end

worksheet.getColumn('AE').outlineLevel = 1; // Y2025 start
worksheet.getColumn('BF').outlineLevel = 1; // Y2025 end

worksheet.getColumn('BZ').outlineLevel = 1; // Y2026 start
worksheet.getColumn('CN').outlineLevel = 1; // Y2026 end
```

### **5. Data Validation (Dropdowns)**

```javascript
// Example: Bonus Type dropdown
worksheet.getCell('AE5').dataValidation = {
  type: 'list',
  allowBlank: true,
  formulae: ['"Commission,CPB,EVP,Head Office (2A and below),Head Office (3B up)"'],
  showErrorMessage: true,
  errorStyle: 'error',
  errorTitle: 'Invalid Bonus Type',
  error: 'Please select from the list'
};

// Example: Y/N dropdown
worksheet.getCell('CZ5').dataValidation = {
  type: 'list',
  allowBlank: false,
  formulae: ['"Y,N"']
};
```

---

## 📝 DATA MAPPING (From Allocation Batch to Excel)

### **BJC Field Mapping**

```javascript
const BJC_COLUMN_MAPPING = {
  // Basic Info
  'A': { field: 'cobu', source: 'dropdown.text' },
  'B': { field: 'division', source: 'dropdown.text' },
  'C': { field: 'department', source: 'dropdown.text' },
  'D': { field: 'section', source: 'input.value' },
  'E': { field: 'empCode', source: 'input.value' },
  'F': { field: 'fullNameTh', source: 'input.value' },
  'I': { field: 'fullNameEn', source: 'input.value' },
  'M': { field: 'costCenterCode', source: 'dropdown.value' },
  'N': { field: 'positionName', source: 'dropdown.text' },
  'O': { field: 'jobBand', source: 'dropdown.value' },
  'P': { field: 'joinDate', source: 'input.value', format: 'date' },
  'Q': { field: 'yosCurrYear', source: 'calculated' },
  'R': { field: 'yosNextYear', source: 'calculated' },
  
  // LE 2025 Section
  'S': { field: 'empTypeCode', source: 'dropdown.value' },
  'T': { field: 'newHcCode', source: 'dropdown.value' },
  'U': { field: 'newVacPeriod', source: 'dropdown.value' },
  'V': { field: 'newVacLe', source: 'dropdown.value' },
  'W': { field: 'reason', source: 'input.value' },
  'X': { field: 'remark', source: 'input.value' },
  
  // Y2025 Benefits (map from benefitsMapping)
  'AE': { field: 'bonusTypesLe', source: 'dropdown.text' },
  'AF': { field: 'salaryLe', source: 'calculated' },
  'AG': { field: 'premiumLe', source: 'calculated' },
  'AH': { field: 'payrollLe', source: 'calculated' },
  'AI': { field: 'payrollNotEn', source: 'calculated' },
  'AJ': { field: 'bonusLe', source: 'calculated' },
  
  // Y2026 Benefits
  'BZ': { field: 'bonusTypes', source: 'dropdown.text' },
  'CA': { field: 'salary', source: 'calculated' },
  'CB': { field: 'premium', source: 'calculated' },
  
  // Config fields
  'CQ': { field: 'costCenterCode', source: 'dropdown.value' },
  'CV': { field: 'runrateCode', source: 'dropdown.text' },
  'CW': { field: 'discount', source: 'calculated', format: 'percentage' },
  'CX': { field: 'executive', source: 'dropdown.value' },
  'CZ': { field: 'focusHc', source: 'dropdown.value' },
  'DA': { field: 'focusPe', source: 'dropdown.value' },
  'DB': { field: 'joinPvf', source: 'dropdown.value' },
  'DC': { field: 'pvf', source: 'calculated' }
};
```

### **BIG C Field Mapping**

```javascript
const BIGC_COLUMN_MAPPING = {
  // Basic Info
  'A': { field: 'format', source: 'fixed', value: 'HO' },
  'B': { field: 'division', source: 'dropdown.text' },
  'C': { field: 'department', source: 'dropdown.text' },
  'D': { field: 'section', source: 'dropdown.text' },
  'E': { field: 'storeCode', source: 'dropdown.value' },
  'F': { field: 'empCode', source: 'input.value' },
  'G': { field: 'titleTh', source: 'input.value' },
  'H': { field: 'firstNameTh', source: 'input.value' },
  'I': { field: 'lastNameTh', source: 'input.value' },
  'J': { field: 'titleEn', source: 'input.value' },
  'K': { field: 'firstNameEn', source: 'input.value' },
  'L': { field: 'lastNameEn', source: 'input.value' },
  'M': { field: 'costCenterCode', source: 'dropdown.value' },
  'N': { field: 'positionName', source: 'dropdown.text' },
  'O': { field: 'jobBand', source: 'dropdown.value' },
  'P': { field: 'joinDate', source: 'input.value', format: 'date' },
  
  // LE 2025 Section (Yellow)
  'S': { field: 'empTypeCode', source: 'dropdown.value' },
  'T': { field: 'newHcCode', source: 'dropdown.value' },
  'U': { field: 'newVacPeriod', source: 'dropdown.value' },
  'V': { field: 'newVacLe', source: 'dropdown.value' },
  
  // Y2025 Benefits (Blue)
  'AH': { field: 'payroll', source: 'calculated' },
  'AI': { field: 'premium', source: 'calculated' },
  'AJ': { field: 'totalPayroll', source: 'formula', formula: '=AH{row}+AI{row}' },
  'AK': { field: 'bonus', source: 'calculated' },
  'AL': { field: 'fleetCard', source: 'calculated' },
  'AM': { field: 'carAllowance', source: 'calculated' },
  
  // Y2026 Benefits
  'BK': { field: 'bonusTypes', source: 'dropdown.text' },
  'BL': { field: 'bonus', source: 'calculated' },
  
  // Config
  'CQ': { field: 'costCenterCode', source: 'dropdown.value' },
  'DA': { field: 'runrateCode', source: 'dropdown.text' },
  'DB': { field: 'levelGroup', source: 'calculated' },
  'DC': { field: 'discount', source: 'calculated', format: 'percentage' },
  'DF': { field: 'focusHc', source: 'dropdown.value' },
  'DG': { field: 'focusPe', source: 'dropdown.value' },
  'DH': { field: 'joinPvf', source: 'dropdown.value' },
  'DI': { field: 'pvf', source: 'calculated' }
};
```

---

## 🚀 IMPLEMENTATION NOTES

### **Recommended Library: ExcelJS**

```bash
# Installation
npm install exceljs
```

**Key Features Used:**
- ✅ Cell styling (background, font, borders)
- ✅ Merged cells
- ✅ Formulas
- ✅ Data validation (dropdowns)
- ✅ Freeze panes
- ✅ Column grouping/outlining
- ✅ Number formats
- ✅ Auto-fit columns
- ✅ Thai Unicode support

### **Export Function Signature**

```javascript
/**
 * Export Allocation Batch data to Excel
 * @param {Object} options - Export configuration
 * @param {string} options.companyId - '1' (BJC) or '2' (BIG C)
 * @param {Array} options.rows - Array of row data objects
 * @param {string} options.filename - Output filename
 * @param {Object} options.styling - Custom styling config (optional)
 * @returns {Promise<Blob>} Excel file blob
 */
async function exportAllocationToExcel(options) {
  // Implementation here
}
```

### **Usage Example**

```javascript
// Export button click handler
$('#exportAllocationExcelBtn').on('click', async function() {
  const companyId = $('#companyFilter').val();
  const allRows = getAllocationRowsData(); // Collect all row data
  
  await exportAllocationToExcel({
    companyId: companyId,
    rows: allRows,
    filename: `Budget_Allocation_${companyId === '1' ? 'BJC' : 'BIGC'}_${getCurrentDate()}.xlsx`,
    styling: EXCEL_STYLE_CONFIG
  });
});
```

---

## 📌 หมายเหตุและข้อสังเกต

### **ความแตกต่างหลัก: BJC กับ BIG C**

| คุณสมบัติ | BJC | BIG C |
|---------|-----|-------|
| **จำนวนคอลัมน์ทั้งหมด** | ~150+ คอลัมน์ | ~140+ คอลัมน์ |
| **รูปแบบชื่อ** | ฟิลด์ "FULL NAME" เดียว | แยกคำนำหน้า/ชื่อ/นามสกุล (ไทย & อังกฤษ) |
| **LE Section เริ่มต้น** | คอลัมน์ F | คอลัมน์ N |
| **Y2025 เริ่มต้น** | คอลัมน์ AE | คอลัมน์ AG |
| **คอลัมน์สวัสดิการ** | PC benefits ละเอียดมากกว่า | โครงสร้างสวัสดิการแบบง่าย |
| **ส่วนสีส้ม** | มี (คอลัมน์ BB-BL) | มีน้อยกว่า |
| **ฟิลด์ COBU** | มี (คอลัมน์ A) | ไม่มี (ใช้ FORMAT แทน) |
| **ฟิลด์ Store** | ไม่มี | มี (STORE_MA_ME) |

### **การจัดการข้อความภาษาไทย**

```javascript
// ตัวอักษรภาษาไทยต้องใช้ UTF-8 encoding
// ExcelJS จัดการให้อัตโนมัติ แต่ควรตรวจสอบ:
worksheet.properties.defaultColWidth = 15; // กว้างขึ้นสำหรับข้อความภาษาไทย
worksheet.getColumn('H').width = 20;       // คอลัมน์ชื่อภาษาไทย
```

### **ข้อควรพิจารณาด้านประสิทธิภาพ**

```javascript
// สำหรับการ export ข้อมูลจำนวนมาก (100+ แถว):
// 1. ใช้ streaming write
const workbook = new ExcelJS.stream.xlsx.WorkbookWriter(options);

// 2. ประมวลผลเป็นกลุ่ม
const BATCH_SIZE = 50;
for (let i = 0; i < rows.length; i += BATCH_SIZE) {
  const batch = rows.slice(i, i + BATCH_SIZE);
  await processBatch(batch);
}

// 3. ลดจำนวน style objects (ใช้ซ้ำ)
const headerStyle = { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } } };
```

---

## ✅ รายการตรวจสอบ TODO (ก่อนเริ่ม Implementation)

- [ ] ยืนยัน Library: ExcelJS หรือ xlsx-style
- [ ] ยืนยันรูปแบบชื่อไฟล์: `Budget_{Company}_{Date}.xlsx`
- [ ] ยืนยันขอบเขตการ export: ทุกแถว หรือ เฉพาะแถวที่มองเห็น
- [ ] ยืนยันคอลัมน์ที่ต้อง highlight สีเหลืองสำหรับแต่ละบริษัท
- [ ] ยืนยันสูตรที่ต้องการ (Total Payroll, PE calculations)
- [ ] ทดสอบการแสดงผล Thai Unicode
- [ ] ทดสอบกับชุดข้อมูลขนาดใหญ่ (100+ แถว)
- [ ] เพิ่ม progress indicator สำหรับการ export
- [ ] เพิ่มการจัดการ error สำหรับข้อมูลที่ขาดหาย
- [ ] เพิ่มการตรวจสอบฟิลด์ที่จำเป็นก่อน export

---

**เวอร์ชันเอกสาร:** 1.0  
**ปรับปรุงล่าสุด:** 3 พฤศจิกายน 2025  
**สถานะ:** พร้อมสำหรับการ Implementation ✅
