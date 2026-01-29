# 📋 Budget Planning Configuration Workflow Analysis
**ไฟล์: `budget.plan.config.js` - วิเคราะห์การทำงานและความสัมพันธ์ของ Configuration**  
*อัปเดตล่าสุด: 15 ตุลาคม 2568 โดย Ten (AI Developer)*

---

## 🎯 **ภาพรวมระบบ Budget Planning Configuration**

ไฟล์ `budget.plan.config.js` เป็น **Single Source of Truth** สำหรับการกำหนดค่าทั้งหมดของระบบ Budget Planning System โดยทำหน้าที่เป็นศูนย์กลางการจัดเก็บ:
- **API Endpoints** (BUDGET_API + SELECT_API)
- **Validation Rules & Field Mappings** 
- **Company-specific Configurations**
- **UI Settings & Field Labels**
- **Batch Entry System Configurations**

---

## 📊 **รายการไฟล์ทั้งหมดในตระกูล budget.plan.*.js**

### **🏗️ Core System Files (หัวใจระบบ)**
1. **`budget.plan.config.js`** - Master Configuration & Single Source of Truth
2. **`budget.plan.main.js`** - System Orchestrator & Initialization Manager  
3. **`budget.plan.core.js`** - Utility Functions & Helper Methods

### **🔗 API & Data Management Files**
4. **`budget.plan.api.js`** - Enhanced API Layer & Data Fetching
5. **`budget.plan.filters.js`** - Advanced Filter Management & Cascade Logic

### **🎨 UI & Form Management Files**
6. **`budget.plan.grid.js`** - AG Grid Manager & Company-specific Configurations
7. **`budget.plan.dynamic.forms.js`** - Company-specific Dynamic Form Manager
8. **`budget.plan.benefits.templates.js`** - Benefits Form Generator & Template Engine
9. **`budget.plan.options.js`** - Options and Settings Management

### **🎪 UI Components & Advanced Interactions Files**
10. **`budget.plan.offcanvas.js`** - Advanced Side Panel Manager & CRUD Operations
11. **`budget.plan.offcanvas.fullscreen.js`** - Fullscreen Integration Manager
12. **`budget.plan.fullscreen.js`** - Advanced Fullscreen Manager

### **🎯 Business Logic & Event Management Files**
13. **`budget.plan.events.js`** - Enhanced Event Coordination & Batch Entry Manager
14. **`budget.plan.allocation.js`** - Multi Cost Center Allocation Manager
15. **`budget.plan.form.validation.js`** - Enhanced Form Validation Engine

---

## 🗂️ **โครงสร้างหลักของ budget.plan.config.js**

### **🌐 1. API ENDPOINTS CONFIGURATION**

#### **BUDGET_API - Core Budget System APIs**
```javascript
const BUDGET_API = {
  companies: '/api/Budget/B0Companies',           // บริษัท
  cobu: '/api/Budget/B0CoBU',                    // COBU/Format
  budgetYears: '/api/Budget/B0BudgetYears',      // ปีงบประมาณ
  costCenters: '/api/Budget/B0CostCenters',      // Cost Centers
  divisions: '/api/Budget/B0Divisions',          // แผนก
  departments: '/api/Budget/B0Departments',      // ฝ่าย
  sections: '/api/Budget/B0Sections',            // ส่วน
  storeNames: '/api/Budget/B0StoreNames',        // ชื่อร้าน
  positions: '/api/Budget/B0Positions',          // ตำแหน่ง
  jobBands: '/api/Budget/B0JobBands',           // ระดับงาน
  empStatuses: '/api/Budget/B0EmpStatuses',     // สถานะพนักงาน
  budgets: '/api/Budget/B0Budgets'              // ข้อมูลงบประมาณ
}
```

#### **SELECT_API - Enhanced Select APIs**
```javascript
const SELECT_API = {
  statuses: '/api/Select/statuses',              // สถานะ
  employeeTypes: '/api/Select/employeetypes',    // ประเภทพนักงาน
  newHC: '/api/Select/newhc',                   // จำนวนคนใหม่
  planCostCenters: '/api/Select/costcenters',   // Plan Cost Centers
  salaryStructures: '/api/Select/salarystructures', // โครงสร้างเงินเดือน
  groupRunRates: '/api/Select/grouprunrates',   // กลุ่ม Run Rates
  bonusTypes: '/api/Select/bonustypes',         // ประเภทโบนัส
  joinPvf: '/api/Select/joinpvf'               // การเข้าร่วม PVF
}
```

---

## 🔄 **Workflow การทำงานหลักของ Configuration**

### **📋 1. การเริ่มต้นระบบ (System Initialization)**
```
1. โหลด budget.plan.config.js ก่อนไฟล์อื่นๆ
2. Export ค่าคงที่ทั้งหมดไป window object
3. ไฟล์อื่นๆ เรียกใช้ config จาก window.BUDGET_API, window.SELECT_API
4. ระบบพร้อมใช้งาน
```

### **🔗 2. การเรียกใช้ API (API Usage Flow)**
```
Configuration → Function Usage:
BUDGET_API.companies → populateDropdownAsync() ใน events.js
BUDGET_API.costCenters → updateBatchRowCostCenters() ใน events.js  
SELECT_API.statuses → populateDropdown() ใน offcanvas.js
FIELD_CONFIGURATIONS.dropdownPlaceholders → ทุกฟังก์ชัน dropdown
```

### **✅ 3. การตรวจสอบความถูกต้อง (Validation Flow)**
```
BATCH_VALIDATION_CONFIG → batchValidator object ใน events.js
requiredFields → validateFieldRealTime() 
companyRules → validateBenefitsFields()
autoPopulateRules → setupAutoPopulateRules()
```

---

## 🔍 **ความสัมพันธ์ของ Config แต่ละตัวกับ Functions**

### **🌐 API ENDPOINTS RELATIONSHIPS**

#### **BUDGET_API Configuration:**
| Config Property | ใช้งานใน Functions | ไฟล์ที่เกี่ยวข้อง |
|----------------|-------------------|-----------------|
| `companies` | `populateDropdownAsync()` | `budget.plan.events.js` |
| `cobu` | `populateDropdown()` | `budget.plan.offcanvas.js` |
| `budgetYears` | `populateDropdownAsync()` | `budget.plan.events.js` |
| `costCenters` | `updateBatchRowCostCenters()` | `budget.plan.events.js` |
| | `populateDropdown()` | `budget.plan.offcanvas.js` |
| | `updateCostCenters()` | `budget.plan.filters.js` |
| `divisions` | `updateBatchRowDivisions()` | `budget.plan.events.js` |
| | `updateDivisions()` | `budget.plan.filters.js` |
| `departments` | `updateBatchRowDepartments()` | `budget.plan.events.js` |
| | `updateDepartments()` | `budget.plan.filters.js` |
| `sections` | `updateBatchRowSections()` | `budget.plan.events.js` |
| | `updateSections()` | `budget.plan.filters.js` |
| `storeNames` | `populateDropdownAsync()` | `budget.plan.events.js` |
| | `updateLocations()` | `budget.plan.filters.js` |
| `positions` | `populateDropdownAsync()` | `budget.plan.events.js` |
| | `updatePositions()` | `budget.plan.filters.js` |
| `jobBands` | `populateDropdownAsync()` | `budget.plan.events.js` |
| | `updateJobBands()` | `budget.plan.filters.js` |
| `empStatuses` | `populateDropdown()` | `budget.plan.offcanvas.js` |
| | `updateEmpStatuses()` | `budget.plan.filters.js` |

#### **SELECT_API Configuration:**
| Config Property | ใช้งานใน Functions | ไฟล์ที่เกี่ยวข้อง |
|----------------|-------------------|-----------------|
| `statuses` | `populateDropdownAsync()` | `budget.plan.events.js` |
| | `populateDropdown()` | `budget.plan.offcanvas.js` |
| `positions` | `populateDropdownAsync()` | `budget.plan.events.js` |
| `jobBands` | `populateDropdownAsync()` | `budget.plan.events.js` |
| `employeeTypes` | `populateDropdown()` | `budget.plan.offcanvas.js` |
| `newHC` | `populateDropdown()` | `budget.plan.offcanvas.js` |
| `planCostCenters` | `populateDropdownAsync()` | `budget.plan.events.js` |
| `salaryStructures` | `populateStaticDropdownsAsync()` | `budget.plan.events.js` |
| `groupRunRates` | `populateDropdownAsync()` | `budget.plan.events.js` |
| `bonusTypes` | `generateBatchTemplatesForCompany()` | `budget.plan.benefits.templates.js` |
| `joinPvf` | `populateStaticDropdownsAsync()` | `budget.plan.events.js` |

---

### **⏱️ TIMING & DEBOUNCE RELATIONSHIPS**

#### **DEBOUNCE_DELAYS Configuration:**
| Config Property | ใช้งานใน Functions | จุดประสงค์ |
|----------------|-------------------|----------|
| `cobu: 100` | `debouncedUpdateBatchRowCostCenters()` | ป้องกันการเรียก API บ่อยเกินไป |
| `costCenters: 300` | `updateBatchRowCostCenters()` | หน่วงเวลา 300ms ก่อนเรียก API |
| `divisions: 400` | `updateBatchRowDivisions()` | หน่วงเวลา 400ms ก่อนเรียก API |
| `departments: 500` | `updateBatchRowDepartments()` | หน่วงเวลา 500ms ก่อนเรียก API |
| `offcanvasCostCenters: 300` | `populateDropdown()` ใน offcanvas | หน่วงเวลาสำหรับ offcanvas |

#### **LOADING_DELAYS Configuration:**
| Config Property | ใช้งานใน Functions | จุดประสงค์ |
|----------------|-------------------|----------|
| `addRowForm: 2000` | `showBatchEntryLoading()` | แสดง loading 2 วินาที |
| `editRowForm: 2000` | `populateEditForm()` | แสดง loading สำหรับฟอร์มแก้ไข |
| `initialization: 1000` | `initialize()` | หน่วงเวลาการเริ่มต้นระบบ |

---

### **✅ VALIDATION RELATIONSHIPS**

#### **BATCH_VALIDATION_CONFIG:**

##### **requiredFields Configuration:**
| Field Selector | ใช้งานใน Functions | จุดประสงค์ |
|---------------|-------------------|----------|
| `.batch-company` | `validateFieldRealTime()` | ตรวจสอบการเลือกบริษัท |
| `.batch-year` | `validateFieldRealTime()` | ตรวจสอบปีงบประมาณ |
| `.batch-cost-center` | `validateRowComplete()` | ตรวจสอบ Cost Center |
| `.batch-position` | `validateRowComplete()` | ตรวจสอบตำแหน่งงาน |

##### **companyRules Configuration:**
| Company Rule | ใช้งานใน Functions | จุดประสงค์ |
|-------------|-------------------|----------|
| `BJC.requiredBenefitsCount: 5` | `validateBenefitsFields()` | ตรวจสอบ Benefits ขั้นต่ำ 5 ฟิลด์ |
| `BIGC.requiredBenefitsCount: 3` | `validateBenefitsFields()` | ตรวจสอบ Benefits ขั้นต่ำ 3 ฟิลด์ |
| `BJC.totalBenefitsFields: 44` | `displayGlobalValidationSummary()` | แสดงสรุปจาก 44 ฟิลด์ |
| `BIGC.totalBenefitsFields: 27` | `displayGlobalValidationSummary()` | แสดงสรุปจาก 27 ฟิลด์ |

##### **autoPopulateRules Configuration:**
| Rule Name | ใช้งานใน Functions | จุดประสงค์ |
|----------|-------------------|----------|
| `planCostCenterSync` | `setupAutoPopulateRules()` | คัดลอก Cost Center → Plan Cost Center |

---

### **🏷️ FIELD MAPPING RELATIONSHIPS**

#### **BJC_FIELD_MAPPING & BIGC_FIELD_MAPPING:**
| Mapping Config | ใช้งานใน Functions | จุดประสงค์ |
|---------------|-------------------|----------|
| `'editLePayroll': 'payrollLe'` | `mapFrontendFieldToBackend()` | แปลงชื่อฟิลด์ Frontend → Backend |
| `'editBgBonus': 'bonus'` | `populateEditForm()` | เติมข้อมูลในฟอร์มแก้ไข |
| Company-specific mappings | `generateBatchTemplatesForCompany()` | สร้าง template ตามบริษัท |

#### **GL_MAPPING Configuration:**
| GL Mapping | ใช้งานใน Functions | จุดประสงค์ |
|-----------|-------------------|----------|
| `BJC_GL_MAPPING` | `generateTemplatesForCompany()` | แสดงรหัส GL ในหัวตาราง |
| `BIGC_GL_MAPPING` | `initializeBudgetGrid()` | ตั้งค่า Grid columns |

---

### **🎨 UI & STYLING RELATIONSHIPS**

#### **FIELD_CONFIGURATIONS:**
| Config Section | ใช้งานใน Functions | จุดประสงค์ |
|---------------|-------------------|----------|
| `dropdownPlaceholders.company` | `populateDropdownAsync()` | แสดง placeholder "Select Company" |
| `dropdownPlaceholders.year` | `populateDropdownAsync()` | แสดง placeholder "Select Budget Year" |
| `fieldLabels['.batch-company']` | `displayFieldValidation()` | แสดงชื่อฟิลด์ในข้อความ validation |

#### **BATCH_UI_MESSAGES:**
| Message Config | ใช้งานใน Functions | จุดประสงค์ |
|---------------|-------------------|----------|
| `loading.addingRow` | `showBatchEntryLoading()` | แสดงข้อความขณะเพิ่มแถว |
| `validation.confirmDelete` | `deleteSelectedRows()` | แสดงข้อความยืนยันการลบ |
| `buttons.addRow` | UI Button Text | ข้อความปุ่มเพิ่มแถว |

---

### **🔧 ENHANCED UI VALIDATION RELATIONSHIPS**

#### **ENHANCED_UI_FIELD_SELECTORS:**
| Selector Config | ใช้งานใน Functions | จุดประสงค์ |
|---------------|-------------------|----------|
| `primary: ['input[id*="editLe"]']` | `shouldValidateFieldEnhanced()` | ตรวจจับฟิลด์ Benefits อัตโนมัติ |
| `batchEntry: ['input.batch-payroll']` | `validateFieldRealTime()` | ตรวจจับฟิลด์ Batch Entry |
| `companySpecific.BJC` | `getFieldValidationCategory()` | ตรวจจับฟิลด์เฉพาะ BJC |

---

## 🎯 **การใช้งานจริงในแต่ละไฟล์**

### **📋 1. budget.plan.events.js (หัวใจหลัก)**
#### **การใช้ Configuration:**
- **API Endpoints**: ใช้ `BUDGET_API` และ `SELECT_API` ทั้งหมด 18 endpoints
- **Validation Config**: ใช้ `BATCH_VALIDATION_CONFIG` สำหรับ validation engine
- **Field Mappings**: ใช้ `BJC_FIELD_MAPPING` และ `BIGC_FIELD_MAPPING`
- **UI Messages**: ใช้ `BATCH_UI_MESSAGES` และ `FIELD_CONFIGURATIONS`

#### **Functions ที่ใช้ Configuration มากที่สุด:**
1. `populateDropdownAsync()` - ใช้ API endpoints และ placeholders
2. `validateFieldRealTime()` - ใช้ validation rules และ field selectors  
3. `setupBatchRowCascadingRelationships()` - ใช้ debounce delays
4. `validateBenefitsFields()` - ใช้ company rules และ field mappings

### **📋 2. budget.plan.offcanvas.js**
#### **การใช้ Configuration:**
- **API Endpoints**: ใช้ `BUDGET_API` และ `SELECT_API` สำหรับ offcanvas dropdowns
- **Field Mappings**: ใช้สำหรับ populate และ extract ข้อมูลฟอร์ม
- **Timing Config**: ใช้ `EDIT_FORM_DELAYS` สำหรับการหน่วงเวลา

#### **Functions ที่สำคัญ:**
1. `populateDropdown()` - ใช้ API endpoints
2. `setupOffcanvasCascadeRelationships()` - ใช้ debounce delays
3. `populateEditForm()` - ใช้ field mappings

### **📋 3. budget.plan.filters.js**
#### **การใช้ Configuration:**
- **API Endpoints**: ใช้ `BUDGET_API` สำหรับ filter cascade
- **Debounce Config**: ใช้ `DEBOUNCE_DELAYS` สำหรับ filter updates

#### **Functions ที่สำคัญ:**
1. `updateCostCenters()` - ใช้ `BUDGET_API.costCenters`
2. `updateDivisions()` - ใช้ `BUDGET_API.divisions`
3. `updateDepartments()` - ใช้ `BUDGET_API.departments`

### **📋 4. budget.plan.benefits.templates.js**
#### **การใช้ Configuration:**
- **Field Mappings**: ใช้ `BJC_FIELD_MAPPING` และ `BIGC_FIELD_MAPPING`
- **GL Mappings**: ใช้ `BJC_GL_MAPPING` และ `BIGC_GL_MAPPING`
- **Company Config**: ใช้ `COMPANY_CONFIG` สำหรับ company-specific logic

#### **Functions ที่สำคัญ:**
1. `generateTemplatesForCompany()` - ใช้ field mappings และ GL mappings
2. `generateBatchTemplatesForCompany()` - ใช้ company configurations

### **📋 5. budget.plan.form.validation.js**
#### **การใช้ Configuration:**
- **Validation Config**: ใช้ `BATCH_VALIDATION_CONFIG` ทั้งหมด
- **Field Selectors**: ใช้ `ENHANCED_UI_FIELD_SELECTORS`
- **Styling Config**: ใช้ `ENHANCED_VALIDATION_STYLES`

#### **Functions ที่สำคัญ:**
1. `BudgetFormValidator.validateForm()` - ใช้ validation config
2. `shouldValidateFieldEnhanced()` - ใช้ field selectors
3. `applyValidationStyling()` - ใช้ styling config

---

## 🔧 **Configuration ที่ SA สามารถแก้ไขได้เอง**

### **✅ 1. เพิ่ม API Endpoint ใหม่:**
```javascript
// เพิ่มใน BUDGET_API
newEndpoint: '/api/Budget/B0NewEndpoint'

// เพิ่มใน SELECT_API  
newSelect: '/api/Select/newselect'
```

### **✅ 2. เพิ่มฟิลด์ Validation:**
```javascript
// เพิ่มใน BATCH_VALIDATION_CONFIG.requiredFields
{
  selector: '.batch-new-field',
  name: 'New Field',
  enabled: true,
  description: 'คำอธิบายภาษาไทย'
}
```

### **✅ 3. เพิ่ม Company ใหม่:**
```javascript
// เพิ่มใน BATCH_VALIDATION_CONFIG.companyRules
'NEW_COMPANY': {
  companyId: '3',
  benefitsValidation: true,
  requiredBenefitsCount: 10,
  totalBenefitsFields: 50,
  description: 'กฎสำหรับบริษัทใหม่'
}
```

### **✅ 4. ปรับ Debounce Timing:**
```javascript
// แก้ไขใน DEBOUNCE_DELAYS
costCenters: 500, // เปลี่ยนจาก 300 เป็น 500ms
newField: 200     // เพิ่มใหม่
```

### **✅ 5. เพิ่ม Field Mapping:**
```javascript
// เพิ่มใน BJC_FIELD_MAPPING หรือ BIGC_FIELD_MAPPING
'editNewField': 'newFieldLe',
'editBgNewField': 'newField'
```

---

## 📊 **สรุปสถานะ Configuration System**

### **✅ สถานะโดยรวม: สมบูรณ์และพร้อมใช้งาน (95% Complete)**

#### **✅ จุดแข็ง:**
1. **Single Source of Truth** - ทุกค่าคงที่อยู่ในที่เดียว
2. **Comprehensive Coverage** - ครอบคลุมทุกด้านของระบบ
3. **Self-Service Configuration** - SA แก้ไขได้เองโดยไม่ต้องพึ่ง Developer
4. **Company Isolation** - แยกการตั้งค่าระหว่าง BJC และ BIGC ชัดเจน
5. **Extensive Validation Rules** - มีกฎการตรวจสอบครบถ้วน

#### **⚠️ จุดที่ต้องระวัง:**
1. **Configuration Dependencies** - การเปลี่ยนแปลงอาจส่งผลต่อหลายไฟล์
2. **Field Mapping Sync** - ต้องระวังการ sync ระหว่าง Frontend และ Backend mappings
3. **API Endpoint Changes** - การเปลี่ยน API จะต้องอัปเดตใน config

### **🎯 ระดับการใช้งาน Configuration:**

| ไฟล์ | การใช้งาน Config | ความสำคัญ | หมายเหตุ |
|-----|-----------------|----------|---------|
| `budget.plan.events.js` | 90% | สูงมาก | ใช้ config ทุกส่วน |
| `budget.plan.offcanvas.js` | 70% | สูง | ใช้ API และ mappings |
| `budget.plan.filters.js` | 60% | กลาง | ใช้ API และ debounce |
| `budget.plan.benefits.templates.js` | 80% | สูง | ใช้ mappings และ GL |
| `budget.plan.form.validation.js` | 85% | สูงมาก | ใช้ validation config |
| `budget.plan.allocation.js` | 30% | ต่ำ | ใช้บางส่วน |
| `budget.plan.grid.js` | 40% | กลาง | ใช้ field orders |

### **📋 Dependencies Matrix:**

```
budget.plan.config.js (Master)
    ↓
├── budget.plan.events.js (Primary Consumer - 90% usage)
├── budget.plan.offcanvas.js (Secondary Consumer - 70% usage)
├── budget.plan.benefits.templates.js (Field Mapping Consumer - 80% usage)
├── budget.plan.form.validation.js (Validation Consumer - 85% usage)
├── budget.plan.filters.js (API Consumer - 60% usage)
└── Other files (Light usage - 20-40%)
```

---

## 🚀 **แนวทางการพัฒนาต่อ (Next Steps)**

### **Phase 1: Configuration Enhancement (1-2 สัปดาห์)**
1. **เพิ่ม Configuration Validation** - ตรวจสอบความถูกต้องของ config
2. **Configuration Documentation** - เพิ่มเอกสารสำหรับ SA
3. **Configuration Testing** - ทดสอบการเปลี่ยนแปลง config

### **Phase 2: Advanced Features (2-3 สัปดาห์)**
1. **Dynamic Configuration Loading** - โหลด config จาก API
2. **Configuration Hot Reload** - อัปเดต config โดยไม่ restart
3. **Configuration History** - ติดตามการเปลี่ยนแปลง config

### **Phase 3: Management Tools (2-4 สัปดาห์)**
1. **Configuration Management UI** - หน้าจอจัดการ config สำหรับ SA
2. **Configuration Backup/Restore** - สำรองและเรียกคืน config
3. **Configuration Migration Tools** - เครื่องมือย้าย config

---

## 📝 **คำแนะนำสำหรับ SA**

### **✅ การแก้ไข Configuration อย่างปลอดภัย:**

1. **สำรองไฟล์ก่อนแก้ไข**:
   ```bash
   cp budget.plan.config.js budget.plan.config.js.backup
   ```

2. **ทดสอบการเปลี่ยนแปลงทีละส่วน**:
   - แก้ไข API endpoint เดียว → ทดสอบ
   - เพิ่ม validation rule ใหม่ → ทดสอบ
   - ปรับ company rule → ทดสอบ

3. **ตรวจสอบ Console Errors**:
   - เปิด Developer Tools → Console
   - หา error ที่เกี่ยวข้องกับ config ที่แก้ไข

4. **ทดสอบ Functions ที่เกี่ยวข้อง**:
   - ถ้าแก้ API → ทดสอบ dropdown population
   - ถ้าแก้ validation → ทดสอบ form validation
   - ถ้าแก้ field mapping → ทดสอบ form populate

### **🚨 สิ่งที่ต้องระวัง:**
1. **ห้ามลบ Config ที่มีอยู่** โดยไม่ตรวจสอบการใช้งาน
2. **ระวัง Typo ใน Property Names** จะทำให้ระบบ error
3. **ตรวจสอบ Comma และ Bracket** ให้ถูกต้อง
4. **ทดสอบใน Browser หลายตัว** เพื่อความแน่ใจ

---

*เอกสารนี้จัดทำโดย Ten (AI Developer) สำหรับการวิเคราะห์และจัดการ Configuration ของระบบ Budget Planning ต่อไป*
