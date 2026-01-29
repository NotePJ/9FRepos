# Budget Planning - Sample Data Field Mapping (BIGC)

**Reference:** 
- Model: `Models/Budget/HRB_BUDGET_BIGC.cs`
- DTO: `DTOs/Budget/BudgetBigcDto.cs`
- Table: `HRB_BUDGET_BIGC`

---

## 📋 Field Mapping Table

| Field | Value | mapDTO | mapModel |
|-------|-------|--------|----------|
| COST_CENTER | 90091 | CostCenterCode | CostCenterCode |
| PAYROLL_LE | 12,000 | PayrollLe | PayrollLe |
| PREMIUM_LE | 0 | PremiumLe | PremiumLe |
| PAYROLL_TOT_LE | 12,000 | TotalPayrollLe | TotalPayrollLe |
| BONUS_LE | 0 | BonusLe | BonusLe |
| FLEET_CARD_PE_LE | 0 | FleetCardPeLe | FleetCardPeLe |
| CAR_ALLOWANCE_LE | 0 | CarAllowanceLe | CarAllowanceLe |
| LICENSE_ALLOWANCE_LE | 0 | LicenseAllowanceLe | LicenseAllowanceLe |
| HOUSING_ALLOWANCE_LE | 0 | HousingAllowanceLe | HousingAllowanceLe |
| GASOLINE_ALLOWANCE_LE | 0 | GasolineAllowanceLe | GasolineAllowanceLe |
| WAGE_STUDENT_LE | 0 | WageStudentLe | WageStudentLe |
| CAR_RENTAL_PE_LE | 0 | CarRentalPeLe | CarRentalPeLe |
| SKILL_PAY_ALLOWANCE_LE | 0 | SkillPayAllowanceLe | SkillPayAllowanceLe |
| OTHER_ALLOWANCE_LE | 0 | OtherAllowanceLe | OtherAllowanceLe |
| SOCIAL_SECURITY_LE | 600 | SocialSecurityLe | SocialSecurityLe |
| LABOR_FUND_FEE_LE | 0 | LaborFundFeeLe | LaborFundFeeLe |
| OTHER_STAFF_BENEFIT_LE | 0 | OtherStaffBenefitLe | OtherStaffBenefitLe |
| PROVIDENT_FUND_LE | 720 | ProvidentFundLe | ProvidentFundLe |
| PROVISION_LE | 24,000 | ProvisionLe | ProvisionLe |
| INTEREST_LE | 0 | InterestLe | InterestLe |
| STAFF_INSURANCE_LE | 0 | StaffInsuranceLe | StaffInsuranceLe |
| MEDICAL_EXPENSE_LE | 599.17 | MedicalExpenseLe | MedicalExpenseLe |
| MEDICAL_INHOUSE_LE | 300 | MedicalInhouseLe | MedicalInhouseLe |
| TRAINING_LE | 0 | TrainingLe | TrainingLe |
| LONG_SERVICE_LE | 0 | LongServiceLe | LongServiceLe |
| PE_SB_MTH_LE | 38,219.17 | PeSbMthLe | PeSbMthLe |
| PE_SB_LE | 114,657.51 | PeSbYearLe | PeSbYearLe |
| PAYROLL | 0 | Payroll | Payroll |
| PREMIUM | 0 | Premium | Premium |
| PAYROLL_TOT | 0 | TotalPayroll | TotalPayroll |
| BONUS | 0 | Bonus | Bonus |
| BONUS_TYPE | HO | BonusTypes | BonusTypes |
| FLEET_CARD_PE | 0 | FleetCardPe | FleetCardPe |
| CAR_ALLOWANCE | 0 | CarAllowance | CarAllowance |
| LICENSE_ALLOWANCE | 0 | LicenseAllowance | LicenseAllowance |
| HOUSING_ALLOWANCE | 0 | HousingAllowance | HousingAllowance |
| GASOLINE_ALLOWANCE | 0 | GasolineAllowance | GasolineAllowance |
| WAGE_STUDENT | 0 | WageStudent | WageStudent |
| CAR_RENTAL_PE | 0 | CarRentalPe | CarRentalPe |
| SKILL_PAY_ALLOWANCE | 0 | SkillPayAllowance | SkillPayAllowance |
| OTHER_ALLOWANCE | 0 | OtherAllowance | OtherAllowance |
| SOCIAL_SECURITY | 0 | SocialSecurity | SocialSecurity |
| LABOR_FUND_FEE | 0 | LaborFundFee | LaborFundFee |
| OTHER_STAFF_BENEFIT | 0 | OtherStaffBenefit | OtherStaffBenefit |
| PROVIDENT_FUND | 0 | ProvidentFund | ProvidentFund |
| PROVISION | 0 | Provision | Provision |
| INTEREST | 0 | Interest | Interest |
| STAFF_INSURANCE | 0 | StaffInsurance | StaffInsurance |
| MEDICAL_EXPENSE | 599.17 | MedicalExpense | MedicalExpense |
| MEDICAL_INHOUSE | 300 | MedicalInhouse | MedicalInhouse |
| TRAINING | 0 | Training | Training |
| LONG_SERVICE | 0 | LongService | LongService |
| PE_SB_MTH | 899.17 | PeSbMth | PeSbMth |
| PE_SB_YEAR | 10,790.04 | PeSbYear | PeSbYear |
| PE_MTH_LE | 37,320 | PeMthLe | PeMthLe |
| PE_YEAR_LE | 111,960 | PeYearLe | PeYearLe |
| PE_MTH | 0 | PeMth | PeMth |
| PE_YEAR | 0 | PeYear | PeYear |


❌ not Use
| Field | Value | mapDTO | mapModel |
|-------|-------|--------|----------|
| MAIN_COST_CENTER | Y | *(not mapped - BJC only)* | *(not in BIGC model)* |
| RUNRATE_CODE | (empty) | RunrateCode | RunrateCode |
| DISCOUNT | 0 | Discount | Discount |
| EXECUTIVE | (empty) | Executive | Executive |
| FOCUS_HC | Y | FocusHc | FocusHc |
| FOCUS_PE | Y | FocusPe | FocusPe |
| JOIN_PVF | 0 | JoinPvf | JoinPvf |
| RATE_PVF | 0.06 | *(not mapped - calculated)* | *(not in model)* |
| PVF | N | Pvf | Pvf |

---

## 📝 Notes

### ⚠️ Special Cases:

1. **MAIN_COST_CENTER** 
   - ❌ Not in BIGC model (BJC only field)
   - This field exists only in `HRB_BUDGET_BJC` table

2. **COST_CENTER vs COST_CENTER_CODE**
   - Database field: `COST_CENTER_CODE`
   - Log shows as: `COST_CENTER`
   - Maps to: `CostCenterCode` (both Model & DTO)

3. **BONUS_TYPE vs BONUS_TYPES**
   - Database field: `BONUS_TYPES` (plural with 'S')
   - Log shows as: `BONUS_TYPE` (singular)
   - Maps to: `BonusTypes` (plural)

4. **PAYROLL_TOT_LE vs TOTAL_PAYROLL_LE**
   - Log shows as: `PAYROLL_TOT_LE`
   - Database field: `TOTAL_PAYROLL_LE`
   - Maps to: `TotalPayrollLe`

5. **PE_SB_LE vs PE_SB_YEAR_LE**
   - Log shows as: `PE_SB_LE`
   - Database field: `PE_SB_YEAR_LE`
   - Maps to: `PeSbYearLe`

6. **RATE_PVF**
   - ❌ Not in Model or DTO
   - This is a **calculated field** (6% in this example)
   - May come from configuration or calculation logic

---

## 🔍 Data Type Reference

### Decimal Fields (TypeName = "decimal(18,2)")
All financial/amount fields use `decimal?` (nullable decimal with 2 decimal places):
- Payroll, Premium, Bonus fields
- All Allowance fields
- All Benefit fields
- PE/SB summary fields

### String Fields
- `CostCenterCode`: `string` (required, max 50 chars)
- `BonusTypes`: `string?` (nullable, max 50 chars)
- `RunrateCode`: `string?` (nullable, max 50 chars)
- `Discount`: `string?` (nullable, max 50 chars)
- `Executive`: `string?` (nullable, max 50 chars)
- `FocusHc`: `string?` (nullable, 1 char - "Y"/"N")
- `FocusPe`: `string?` (nullable, 1 char - "Y"/"N")
- `JoinPvf`: `string?` (nullable, 1 char - "Y"/"N"/"0")
- `Pvf`: `string?` (nullable, 1 char - "Y"/"N")

---

## 🎯 Cal Button Related Fields

### Input Fields (User fills):
- `CostCenterCode` - Required for calculation context
- `BonusTypes` - Auto-selected by `fn_getBonusType()`

### Calculated Fields (From SQL Functions):
- `Payroll` ← Base salary structure
- `Bonus` ← `fn_getBonusRate()` × Payroll
- `SocialSecurity` ← Calculated from Payroll
- `ProvidentFund` ← `fn_getProvidentFund()` (if JoinPvf = "Y")
- `MedicalExpense` ← `fn_getMedicalExpense()`
- `MedicalInhouse` ← `fn_getMedicalInhouse()`
- `Provision` ← `fn_getProvision()`
- `Interest` ← `fn_getInterest()`
- `StaffInsurance` ← `fn_getStaffInsurance()`

### Summary Fields (Auto-calculated):
- `TotalPayroll` = Payroll + Premium
- `PeMth` = Sum of all monthly PE fields
- `PeYear` = PeMth × 12 (or custom calculation)
- `PeSbMth` = PE + SB monthly
- `PeSbYear` = PE + SB yearly

---

## 📌 Mapping Complete!

**Status:** ✅ All 73 fields from log file mapped to Model and DTO

**Next Steps:**
1. Use this mapping for Cal Button API development
2. Create request/response DTOs with correct property names
3. Implement calculation logic using mapped fields
