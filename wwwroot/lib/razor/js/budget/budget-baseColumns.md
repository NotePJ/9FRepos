# Budget Base Columns Documentation
**Generated from Model Files: HRB_BUDGET_BJC.cs & HRB_BUDGET_BIGC.cs**
*Last Updated: October 3, 2025*

---

## 📋 **Overview**
This document serves as the **standard reference** for all budget-related field configurations across BJC and BIGC companies. All frontend implementations must follow this structure.

## ⚠️ **CRITICAL RULE: NO FIELD MIXING**
**🚫 DO NOT MIX FIELDS BETWEEN COMPANIES**

- **BJC fields** ONLY belong to BJC company
- **BIGC fields** ONLY belong to BIGC company  
- **NEVER copy fields** from one company to another
- **NEVER assume** similar field names mean they're identical
- Each company has **different business logic** and **different field requirements**
- Treat BJC and BIGC as **completely separate systems**

## 📏 **DOCUMENTATION AUTHORITY RULE**
**📋 THIS DOCUMENT IS THE MASTER REFERENCE**

- **This Documentation = 100% CORRECT** (validated against Models)
- **This Documentation = Single Source of Truth** for all budget implementations
- **Any file that doesn't match this Documentation = WRONG**
- **Fix other files to match Documentation, NOT the other way around**

### 🎯 **Working Methodology:**
1. **Documentation is ALWAYS right** - it reflects actual database Models
2. **Other files must conform** to this Documentation
3. **NEVER change Documentation** to match template files
4. **Template files serve Documentation**, not vice versa
5. **When conflicts arise** → Fix the template file, keep Documentation unchanged

---

**DB Field name → parameter name → id name**

## 🏢 **BJC Company Fields** 
*Source: `HRB_BUDGET_BJC.cs`*
*🎯 **Customer Field Order Applied** - Fields ordered per BJC customer requirements*

## 📋 **BJC Customer Field Order Configuration**
```javascript
// BJC_CUSTOM_FIELD_ORDER - Based on customer requirements
const BJC_CUSTOMER_FIELD_ORDER_LE = [
  'editLePayroll',             // 1. Payroll LE
  'editLePremium',             // 2. Premium LE
  'editLeSalWithEn',           // 3. Basic Salary with en [GL: 70000100]
  'editLeSalNotEn',            // 4. Basic Salary not en [GL: 70000110]
  'editLeBonusType',           // 5. Bonus Type LE
  'editLeBonus',               // 6. Bonus [GL: 70000300]
  'editLeSalTemp',             // 7. Salary (Temp)
  'editLeSocialSecurityTmp',   // 8. Social Security Fund (Temp)
  'editLeSouthriskAllowanceTmp', // 9. South Risk Allowance Temp
  'editLeCarMaintenanceTmp',   // 10. Car Maintenance Temp
  'editLeSalesManagementPc',   // 11. Sales Management - PC
  'editLeShelfStackingPc',     // 12. Shelf Stacking - PC
  'editLeDiligenceAllowancePc', // 13. Diligence Allowance - PC
  'editLePostAllowancePc',     // 14. Post Allowance - PC
  'editLePhoneAllowancePc',    // 15. Phone Allowance - PC
  'editLeTransportationPc',    // 16. Transportation - PC
  'editLeSkillAllowancePc',    // 17. Skill Pay Allowance
  'editLeOtherAllowancePc',    // 18. Other Allowance - PC
  'editLeTemporaryStaffSal',   // 19. Temporary Staff Salary [GL: 70000400]
  'editLeSocialSecurity',      // 20. Social Security Fund [GL: 70000600]
  'editLeProvidentFund',       // 21. Provident Fund [GL: 70000700]
  'editLeWorkmenCompensation', // 22. Workmen Compensation [GL: 70000800]
  'editLeHousingAllowance',    // 23. Housing Allowance
  'editLeSalesCarAllowance',   // 24. Sales Car Allowance
  'editLeAccommodation',       // 25. Accommodation
  'editLeCarMaintenance',      // 26. Car Plan-Repair & maintenance [GL: 75300115]
  'editLeSouthriskAllowance',  // 27. South Risk Allowance
  'editLeMealAllowance',       // 28. Meal Allowance
  'editLeOther',               // 29. Other Benefits
  'editLeOthersSubjectTax',    // 30. Others subject to Tax [GL: 70001020]
  'editLeCarAllowance',        // 31. Car Allowance [GL: 70001070]
  'editLeLicenseAllowance',    // 32. License [GL: 70001080]
  'editLeOutsourceWages',      // 33. Outsource Wages [GL: 70002000]
  'editLeCompCarsGas',         // 34. Company Cars-gasoline [GL: 70200100]
  'editLeCompCarsOther',       // 35. Company Cars-other [GL: 75200190]
  'editLeCarRental',           // 36. Cars-Rental [GL: 75201000]
  'editLeCarGasoline',         // 37. Car Plan-Gasoline [GL: 75300100]
  'editLeCarRepair',           // 38. Car Repair
  'editLeMedicalOutside',      // 39. Medical-outside [GL: 71000100]
  'editLeMedicalInHouse',      // 40. Medical-in house [GL: 71000200]
  'editLeStaffActivities',     // 41. Staff Activities [GL: 71001000]
  'editLeUniform',             // 42. Uniform [GL: 71001200]
  'editLeLifeInsurance',       // 43. Life Insurance [GL: 71001400]
  'editLePeSbMth',             // 44. PE + SB (Mth)
  'editLePeSbYear'             // 45. PE + SB LE (Sep. - Dec)
];

// BJC Budget Year Fields in customer order
const BJC_CUSTOMER_FIELD_ORDER_BG = [
  'editBgPayroll',             // 1. Payroll
  'editBgPremium',             // 2. Premium
  'editBgSalWithEn',           // 3. Basic Salary with en [GL: 70000100]
  'editBgSalNotEn',            // 4. Basic Salary not en [GL: 70000110]
  'editBgBonusType',           // 5. Bonus Type
  'editBgBonus',               // 6. Bonus [GL: 70000300]
  'editBgSalTemp',             // 7. Salary (Temp)
  'editBgSocialSecurityTmp',   // 8. Social Security Fund (Temp)
  'editBgSouthriskAllowanceTmp', // 9. South Risk Allowance Temp
  'editBgCarMaintenanceTmp',   // 10. Car Maintenance Temp
  'editBgSalesManagementPc',   // 11. Sales Management - PC
  'editBgShelfStackingPc',     // 12. Shelf Stacking - PC
  'editBgDiligenceAllowancePc', // 13. Diligence Allowance - PC
  'editBgPostAllowancePc',     // 14. Post Allowance - PC
  'editBgPhoneAllowancePc',    // 15. Phone Allowance - PC
  'editBgTransportationPc',    // 16. Transportation - PC
  'editBgSkillAllowancePc',    // 17. Skill Pay Allowance
  'editBgOtherAllowancePc',    // 18. Other Allowance - PC
  'editBgTemporaryStaffSal',   // 19. Temporary Staff Salary [GL: 70000400]
  'editBgSocialSecurity',      // 20. Social Security Fund [GL: 70000600]
  'editBgProvidentFund',       // 21. Provident Fund [GL: 70000700]
  'editBgWorkmenCompensation', // 22. Workmen Compensation [GL: 70000800]
  'editBgHousingAllowance',    // 23. Housing Allowance
  'editBgSalesCarAllowance',   // 24. Sales Car Allowance
  'editBgAccommodation',       // 25. Accommodation
  'editBgCarMaintenance',      // 26. Car Plan-Repair & maintenance [GL: 75300115]
  'editBgSouthriskAllowance',  // 27. South Risk Allowance
  'editBgMealAllowance',       // 28. Meal Allowance
  'editBgOther',               // 29. Other Benefits
  'editBgOthersSubjectTax',    // 30. Others subject to Tax [GL: 70001020]
  'editBgCarAllowance',        // 31. Car Allowance [GL: 70001070]
  'editBgLicenseAllowance',    // 32. License [GL: 70001080]
  'editBgOutsourceWages',      // 33. Outsource Wages [GL: 70002000]
  'editBgCompCarsGas',         // 34. Company Cars-gasoline [GL: 70200100]
  'editBgCompCarsOther',       // 35. Company Cars-other [GL: 75200190]
  'editBgCarRental',           // 36. Cars-Rental [GL: 75201000]
  'editBgCarGasoline',         // 37. Car Plan-Gasoline [GL: 75300100]
  'editBgCarRepair',           // 38. Car Repair
  'editBgMedicalOutside',      // 39. Medical-outside [GL: 71000100]
  'editBgMedicalInHouse',      // 40. Medical-in house [GL: 71000200]
  'editBgStaffActivities',     // 41. Staff Activities [GL: 71001000]
  'editBgUniform',             // 42. Uniform [GL: 71001200]
  'editBgLifeInsurance',       // 43. Life Insurance [GL: 71001400]
  'editBgPeSbMth',             // 44. PE + SB (Mth)
  'editBgPeSbYear'             // 45. PE + SB Year
];

// BJC Summary Fields in customer order  
const BJC_CUSTOMER_FIELD_ORDER_SUMMARY = [
  'editLePeMth',               // 1. PE Monthly LE
  'editLePeYear',              // 2. PE Annual LE
  'editBgPeMth',               // 3. PE Monthly Budget
  'editBgPeYear'               // 4. PE Annual Budget
];

// BJC GL Number Mapping
const BJC_GL_MAPPING = {
  'editLeSalWithEn': '70000100',
  'editLeSalNotEn': '70000110',
  'editLeBonus': '70000300',
  'editLeTemporaryStaffSal': '70000400',
  'editLeSocialSecurity': '70000600',
  'editLeProvidentFund': '70000700',
  'editLeWorkmenCompensation': '70000800',
  'editLeOthersSubjectTax': '70001020',
  'editLeCarAllowance': '70001070',
  'editLeLicenseAllowance': '70001080',
  'editLeOutsourceWages': '70002000',
  'editLeCompCarsGas': '70200100',
  'editLeCompCarsOther': '75200190',
  'editLeCarRental': '75201000',
  'editLeCarGasoline': '75300100',
  'editLeCarMaintenance': '75300115',
  'editLeMedicalOutside': '71000100',
  'editLeMedicalInHouse': '71000200',
  'editLeStaffActivities': '71001000',
  'editLeUniform': '71001200',
  'editLeLifeInsurance': '71001400'
};
```

### **LE (Last Estimate) Fields - Customer Order**
*(Fields ordered exactly as specified by customer)*

1. `PAYROLL_LE` → PayrollLe → `editLePayroll` (Payroll LE)
2. `PREMIUM_LE` → PremiumLe → `editLePremium` (Premium LE)
3. `SAL_WITH_EN_LE` → SalWithEnLe → `editLeSalWithEn` (Salary With EN) [GL: 70000100]
4. `SAL_NOT_EN_LE` → SalNotEnLe → `editLeSalNotEn` (Salary Not EN) [GL: 70000110]
5. `BONUS_TYPE_LE` → BonusTypeLe → `editLeBonusType` (Bonus Type LE)
6. `BONUS_LE` → BonusLe → `editLeBonus` (Bonus) [GL: 70000300]
7. `SAL_TEMP_LE` → SalTempLe → `editLeSalTemp` (Salary Temporary)
8. `SOCIAL_SECURITY_TMP_LE` → SocialSecurityTmpLe → `editLeSocialSecurityTmp` (Social Security Temp)
9. `SOUTHRISK_ALLOWANCE_TMP_LE` → SouthriskAllowanceTmpLe → `editLeSouthriskAllowanceTmp` (South Risk Allowance Temp)
10. `CAR_MAINTENANCE_TMP_LE` → CarMaintenanceTmpLe → `editLeCarMaintenanceTmp` (Car Maintenance Temp)
11. `SALES_MANAGEMENT_PC_LE` → SalesManagementPcLe → `editLeSalesManagementPc` (Sales Management - PC)
12. `SHELF_STACKING_PC_LE` → ShelfStackingPcLe → `editLeShelfStackingPc` (Shelf Stacking - PC)
13. `DILIGENCE_ALLOWANCE_PC_LE` → DiligenceAllowancePcLe → `editLeDiligenceAllowancePc` (Diligence Allowance - PC)
14. `POST_ALLOWANCE_PC_LE` → PostAllowancePcLe → `editLePostAllowancePc` (Post Allowance - PC)
15. `PHONE_ALLOWANCE_PC_LE` → PhoneAllowancePcLe → `editLePhoneAllowancePc` (Phone Allowance - PC)
16. `TRANSPORTATION_PC_LE` → TransportationPcLe → `editLeTransportationPc` (Transportation - PC)
17. `SKILL_ALLOWANCE_PC_LE` → SkillAllowancePcLe → `editLeSkillAllowancePc` (Skill Pay Allowance)
18. `OTHER_ALLOWANCE_PC_LE` → OtherAllowancePcLe → `editLeOtherAllowancePc` (Other Allowance - PC)
19. `TEMPORARY_STAFF_SAL_LE` → TemporaryStaffSalLe → `editLeTemporaryStaffSal` (Temporary Staff Salary) [GL: 70000400]
20. `SOCIAL_SECURITY_LE` → SocialSecurityLe → `editLeSocialSecurity` (Social Security) [GL: 70000600]
21. `PROVIDENT_FUND_LE` → ProvidentFundLe → `editLeProvidentFund` (Provident Fund) [GL: 70000700]
22. `WORKMEN_COMPENSATION_LE` → WorkmenCompensationLe → `editLeWorkmenCompensation` (Workmen Compensation) [GL: 70000800]
23. `HOUSING_ALLOWANCE_LE` → HousingAllowanceLe → `editLeHousingAllowance` (Housing Allowance)
24. `SALES_CAR_ALLOWANCE_LE` → SalesCarAllowanceLe → `editLeSalesCarAllowance` (Sales Car Allowance)
25. `ACCOMMODATION_LE` → AccommodationLe → `editLeAccommodation` (Accommodation)
26. `CAR_MAINTENANCE_LE` → CarMaintenanceLe → `editLeCarMaintenance` (Car Maintenance) [GL: 75300115]
27. `SOUTHRISK_ALLOWANCE_LE` → SouthriskAllowanceLe → `editLeSouthriskAllowance` (South Risk Allowance)
28. `MEAL_ALLOWANCE_LE` → MealAllowanceLe → `editLeMealAllowance` (Meal Allowance)
29. `OTHER_LE` → OtherLe → `editLeOther` (Other Benefits)
30. `OTHERS_SUBJECT_TAX_LE` → OthersSubjectTaxLe → `editLeOthersSubjectTax` (Others Subject Tax) [GL: 70001020]
31. `CAR_ALLOWANCE_LE` → CarAllowanceLe → `editLeCarAllowance` (Car Allowance) [GL: 70001070]
32. `LICENSE_ALLOWANCE_LE` → LicenseAllowanceLe → `editLeLicenseAllowance` (License Allowance) [GL: 70001080]
33. `OUTSOURCE_WAGES_LE` → OutsourceWagesLe → `editLeOutsourceWages` (Outsource Wages) [GL: 70002000]
34. `COMP_CARS_GAS_LE` → CompCarsGasLe → `editLeCompCarsGas` (Company Cars Gas) [GL: 70200100]
35. `COMP_CARS_OTHER_LE` → CompCarsOtherLe → `editLeCompCarsOther` (Company Cars Other) [GL: 75200190]
36. `CAR_RENTAL_LE` → CarRentalLe → `editLeCarRental` (Car Rental) [GL: 75201000]
37. `CAR_GASOLINE_LE` → CarGasolineLe → `editLeCarGasoline` (Car Gasoline) [GL: 75300100]
38. `CAR_REPAIR_LE` → CarRepairLe → `editLeCarRepair` (Car Repair)
39. `MEDICAL_OUTSIDE_LE` → MedicalOutsideLe → `editLeMedicalOutside` (Medical - Outside) [GL: 71000100]
40. `MEDICAL_INHOUSE_LE` → MedicalInhouseLe → `editLeMedicalInHouse` (Medical - In House) [GL: 71000200]
41. `STAFF_ACTIVITIES_LE` → StaffActivitiesLe → `editLeStaffActivities` (Staff Activities) [GL: 71001000]
42. `UNIFORM_LE` → UniformLe → `editLeUniform` (Uniform) [GL: 71001200]
43. `LIFE_INSURANCE_LE` → LifeInsuranceLe → `editLeLifeInsurance` (Life Insurance) [GL: 71001400]
44. `PE_SB_MTH_LE` → PeSbMthLe → `editLePeSbMth` (PE + SB Monthly)
45. `PE_SB_YEAR_LE` → PeSbYearLe → `editLePeSbYear` (PE + SB Year)

### **Budget Year Fields - Customer Order**
*(Fields ordered according to BJC customer requirements)*

### **Budget Year Fields - Customer Order**
*(Fields ordered exactly as specified by customer)*

1. `PAYROLL` → Payroll → `editBgPayroll` (Payroll)
2. `PREMIUM` → Premium → `editBgPremium` (Premium)
3. `SAL_WITH_EN` → SalWithEn → `editBgSalWithEn` (Salary With EN) [GL: 70000100]
4. `SAL_NOT_EN` → SalNotEn → `editBgSalNotEn` (Salary Not EN) [GL: 70000110]
5. `BONUS_TYPE` → BonusType → `editBgBonusType` (Bonus Type)
6. `BONUS` → Bonus → `editBgBonus` (Bonus) [GL: 70000300]
7. `SAL_TEMP` → SalTemp → `editBgSalTemp` (Salary Temporary)
8. `SOCIAL_SECURITY_TMP` → SocialSecurityTmp → `editBgSocialSecurityTmp` (Social Security Temp)
9. `SOUTHRISK_ALLOWANCE_TMP` → SouthriskAllowanceTmp → `editBgSouthriskAllowanceTmp` (South Risk Allowance Temp)
10. `CAR_MAINTENANCE_TMP` → CarMaintenanceTmp → `editBgCarMaintenanceTmp` (Car Maintenance Temp)
11. `SALES_MANAGEMENT_PC` → SalesManagementPc → `editBgSalesManagementPc` (Sales Management - PC)
12. `SHELF_STACKING_PC` → ShelfStackingPc → `editBgShelfStackingPc` (Shelf Stacking - PC)
13. `DILIGENCE_ALLOWANCE_PC` → DiligenceAllowancePc → `editBgDiligenceAllowancePc` (Diligence Allowance - PC)
14. `POST_ALLOWANCE_PC` → PostAllowancePc → `editBgPostAllowancePc` (Post Allowance - PC)
15. `PHONE_ALLOWANCE_PC` → PhoneAllowancePc → `editBgPhoneAllowancePc` (Phone Allowance - PC)
16. `TRANSPORTATION_PC` → TransportationPc → `editBgTransportationPc` (Transportation - PC)
17. `SKILL_ALLOWANCE_PC` → SkillAllowancePc → `editBgSkillAllowancePc` (Skill Pay Allowance)
18. `OTHER_ALLOWANCE_PC` → OtherAllowancePc → `editBgOtherAllowancePc` (Other Allowance - PC)
19. `TEMPORARY_STAFF_SAL` → TemporaryStaffSal → `editBgTemporaryStaffSal` (Temporary Staff Salary) [GL: 70000400]
20. `SOCIAL_SECURITY` → SocialSecurity → `editBgSocialSecurity` (Social Security) [GL: 70000600]
21. `PROVIDENT_FUND` → ProvidentFund → `editBgProvidentFund` (Provident Fund) [GL: 70000700]
22. `WORKMEN_COMPENSATION` → WorkmenCompensation → `editBgWorkmenCompensation` (Workmen Compensation) [GL: 70000800]
23. `HOUSING_ALLOWANCE` → HousingAllowance → `editBgHousingAllowance` (Housing Allowance)
24. `SALES_CAR_ALLOWANCE` → SalesCarAllowance → `editBgSalesCarAllowance` (Sales Car Allowance)
25. `ACCOMMODATION` → Accommodation → `editBgAccommodation` (Accommodation)
26. `CAR_MAINTENANCE` → CarMaintenance → `editBgCarMaintenance` (Car Maintenance) [GL: 75300115]
27. `SOUTHRISK_ALLOWANCE` → SouthriskAllowance → `editBgSouthriskAllowance` (South Risk Allowance)
28. `MEAL_ALLOWANCE` → MealAllowance → `editBgMealAllowance` (Meal Allowance)
29. `OTHER` → Other → `editBgOther` (Other Benefits)
30. `OTHERS_SUBJECT_TAX` → OthersSubjectTax → `editBgOthersSubjectTax` (Others Subject Tax) [GL: 70001020]
31. `CAR_ALLOWANCE` → CarAllowance → `editBgCarAllowance` (Car Allowance) [GL: 70001070]
32. `LICENSE_ALLOWANCE` → LicenseAllowance → `editBgLicenseAllowance` (License Allowance) [GL: 70001080]
33. `OUTSOURCE_WAGES` → OutsourceWages → `editBgOutsourceWages` (Outsource Wages) [GL: 70002000]
34. `COMP_CARS_GAS` → CompCarsGas → `editBgCompCarsGas` (Company Cars Gas) [GL: 70200100]
35. `COMP_CARS_OTHER` → CompCarsOther → `editBgCompCarsOther` (Company Cars Other) [GL: 75200190]
36. `CAR_RENTAL` → CarRental → `editBgCarRental` (Car Rental) [GL: 75201000]
37. `CAR_GASOLINE` → CarGasoline → `editBgCarGasoline` (Car Gasoline) [GL: 75300100]
38. `CAR_REPAIR` → CarRepair → `editBgCarRepair` (Car Repair)
39. `MEDICAL_OUTSIDE` → MedicalOutside → `editBgMedicalOutside` (Medical - Outside) [GL: 71000100]
40. `MEDICAL_INHOUSE` → MedicalInhouse → `editBgMedicalInHouse` (Medical - In House) [GL: 71000200]
41. `STAFF_ACTIVITIES` → StaffActivities → `editBgStaffActivities` (Staff Activities) [GL: 71001000]
42. `UNIFORM` → Uniform → `editBgUniform` (Uniform) [GL: 71001200]
43. `LIFE_INSURANCE` → LifeInsurance → `editBgLifeInsurance` (Life Insurance) [GL: 71001400]
44. `PE_SB_MTH` → PeSbMth → `editBgPeSbMth` (PE + SB Monthly)
45. `PE_SB_YEAR` → PeSbYear → `editBgPeSbYear` (PE + SB Year)

### **Summary Fields - Customer Order**
*(PE Summary calculations in customer specified order)*

1. `PE_MTH_LE` → PeMthLe → `editLePeMth` (PE Monthly LE)
2. `PE_YEAR_LE` → PeYearLe → `editLePeYear` (PE Annual LE)
3. `PE_MTH` → PeMth → `editBgPeMth` (PE Monthly Budget)
4. `PE_YEAR` → PeYear → `editBgPeYear` (PE Annual Budget)
---

## 🏢 **BIGC Company Fields**
*Source: `HRB_BUDGET_BIGC.cs`*
*🎯 **Customer Field Order Applied** - Fields ordered per BIGC customer requirements*

## 📋 **BIGC Customer Field Order Configuration**
```javascript
// BIGC_CUSTOM_FIELD_ORDER - Based on customer requirements
const BIGC_CUSTOMER_FIELD_ORDER_LE = [
  'editLePayroll',             // 1. Base salary
  'editLePremium',             // 2. Premium
  'editLeTotalPayroll',        // 3. Total Payroll (Base+Premium) [GL: 60105000]
  'editLeBonus',               // 4. Bonus [GL: 60125000]
  'editLeFleetCardPe',         // 5. Fleet Card - PE [GL: 60126300]
  'editLeCarAllowance',        // 6. Car Allowance [GL: 60126500]
  'editLeLicenseAllowance',    // 7. License Allowance [GL: 60127000]
  'editLeHousingAllowance',    // 8. Housing Allowance [GL: 60126900]
  'editLeGasolineAllowance',   // 9. Gasoline Allowance [GL: 60126800]
  'editLeWageStudent',         // 10. Wage - Student [GL: 60127400]
  'editLeCarRentalPe',         // 11. Car Rental - PE [GL: 60127600]
  'editLeSkillPayAllowance',   // 12. Skill Pay Allowance [GL: 60127100]
  'editLeOtherAllowance',      // 13. Other Allowance [GL: 60127300]
  'editLeSocialSecurity',      // 14. Social security [GL: 60141050]
  'editLeLaborFundFee',        // 15. Labor fund fee [GL: 60141100]
  'editLeOtherStaffBenefit',   // 16. Other Staff benefit [GL: 60141560]
  'editLeProvidentFund',       // 17. Provident fund [GL: 60142000]
  'editLeEmployeeWelfare',     // 18. Employee Welfare
  'editLeProvision',           // 19. Provision [GL: 60143150]
  'editLeInterest',            // 20. Interest [GL: 63325150]
  'editLeStaffInsurance',      // 21. Staff insurance [GL: 60141150]
  'editLeMedicalExpense',      // 22. Medical expense [GL: 60141250]
  'editLeMedicalInHouse',      // 23. Medical - In House [GL: 60144200]
  'editLeTraining',            // 24. Training [GL: 60144172]
  'editLeLongService',         // 25. Long service [GL: 60144400]
  'editLePeSbMth',             // 26. PE + SB (Mth)
  'editLePeSbYear'             // 27. PE + SB LE (Sep. - Dec)
];

const BIGC_CUSTOMER_FIELD_ORDER_BG = [
  'editBgPayroll',             // 1. Base salary
  'editBgPremium',             // 2. Premium
  'editBgTotalPayroll',        // 3. Total Payroll (Base+Premium) [GL: 60105000]
  'editBgBonus',               // 4. Bonus [GL: 60125000]
  'editBgBonusTypes',          // 5. Bonus Type
  'editBgFleetCardPe',         // 6. Fleet Card - PE [GL: 60126300]
  'editBgCarAllowance',        // 7. Car Allowance [GL: 60126500]
  'editBgLicenseAllowance',    // 8. License Allowance [GL: 60127000]
  'editBgHousingAllowance',    // 9. Housing Allowance [GL: 60126900]
  'editBgGasolineAllowance',   // 10. Gasoline Allowance [GL: 60126800]
  'editBgWageStudent',         // 11. Wage - Student [GL: 60127400]
  'editBgCarRentalPe',         // 12. Car Rental - PE [GL: 60127600]
  'editBgSkillPayAllowance',   // 13. Skill Pay Allowance [GL: 60127100]
  'editBgOtherAllowance',      // 14. Other Allowance [GL: 60127300]
  'editBgSocialSecurity',      // 15. Social security [GL: 60141050]
  'editBgLaborFundFee',        // 16. Labor fund fee [GL: 60141100]
  'editBgOtherStaffBenefit',   // 17. Other Staff benefit [GL: 60141560]
  'editBgProvidentFund',       // 18. Provident fund [GL: 60142000]
  'editBgEmployeeWelfare',     // 19. Employee Welfare
  'editBgProvision',           // 20. Provision [GL: 60143150]
  'editBgInterest',            // 21. Interest [GL: 63325150]
  'editBgStaffInsurance',      // 22. Staff insurance [GL: 60141150]
  'editBgMedicalExpense',      // 23. Medical expense [GL: 60141250]
  'editBgMedicalInHouse',      // 24. Medical - In House [GL: 60144200]
  'editBgTraining',            // 25. Training [GL: 60144172]
  'editBgLongService',         // 26. Long service [GL: 60144400]
  'editBgPeSbMth',             // 27. PE + SB (Mth)
  'editBgPeSbYear'             // 28. PE + SB Year
];

const BIGC_CUSTOMER_FIELD_ORDER_SUMMARY = [
  'editLePeMth',               // 1. PE Monthly LE
  'editLePeYear',              // 2. PE Annual LE
  'editBgPeMth',               // 3. PE Monthly Budget
  'editBgPeYear'               // 4. PE Annual Budget
];

// BIGC GL Number Mapping
const BIGC_GL_MAPPING = {
  'editLeTotalPayroll': '60105000',
  'editLeBonus': '60125000',
  'editLeFleetCardPe': '60126300',
  'editLeCarAllowance': '60126500',
  'editLeLicenseAllowance': '60127000',
  'editLeHousingAllowance': '60126900',
  'editLeGasolineAllowance': '60126800',
  'editLeWageStudent': '60127400',
  'editLeCarRentalPe': '60127600',
  'editLeSkillPayAllowance': '60127100',
  'editLeOtherAllowance': '60127300',
  'editLeSocialSecurity': '60141050',
  'editLeLaborFundFee': '60141100',
  'editLeOtherStaffBenefit': '60141560',
  'editLeProvidentFund': '60142000',
  'editLeProvision': '60143150',
  'editLeInterest': '63325150',
  'editLeStaffInsurance': '60141150',
  'editLeMedicalExpense': '60141250',
  'editLeMedicalInHouse': '60144200',
  'editLeTraining': '60144172',
  'editLeLongService': '60144400'
};
```

### **LE (Last Estimate) Fields - Customer Order**
*(Fields ordered exactly as specified by BIGC customer)*

1. `PAYROLL_LE` → PayrollLe → `editLePayroll` (Base salary)
2. `PREMIUM_LE` → PremiumLe → `editLePremium` (Premium)
3. `TOTAL_PAYROLL_LE` → TotalPayrollLe → `editLeTotalPayroll` (Total Payroll - Base+Premium) [GL: 60105000]
4. `BONUS_LE` → BonusLe → `editLeBonus` (Bonus) [GL: 60125000]
5. `FLEET_CARD_PE_LE` → FleetCardPeLe → `editLeFleetCardPe` (Fleet Card - PE) [GL: 60126300]
6. `CAR_ALLOWANCE_LE` → CarAllowanceLe → `editLeCarAllowance` (Car Allowance) [GL: 60126500]
7. `LICENSE_ALLOWANCE_LE` → LicenseAllowanceLe → `editLeLicenseAllowance` (License Allowance) [GL: 60127000]
8. `HOUSING_ALLOWANCE_LE` → HousingAllowanceLe → `editLeHousingAllowance` (Housing Allowance) [GL: 60126900]
9. `GASOLINE_ALLOWANCE_LE` → GasolineAllowanceLe → `editLeGasolineAllowance` (Gasoline Allowance) [GL: 60126800]
10. `WAGE_STUDENT_LE` → WageStudentLe → `editLeWageStudent` (Wage - Student) [GL: 60127400]
11. `CAR_RENTAL_PE_LE` → CarRentalPeLe → `editLeCarRentalPe` (Car Rental - PE) [GL: 60127600]
12. `SKILL_PAY_ALLOWANCE_LE` → SkillPayAllowanceLe → `editLeSkillPayAllowance` (Skill Pay Allowance) [GL: 60127100]
13. `OTHER_ALLOWANCE_LE` → OtherAllowanceLe → `editLeOtherAllowance` (Other Allowance) [GL: 60127300]
14. `SOCIAL_SECURITY_LE` → SocialSecurityLe → `editLeSocialSecurity` (Social security) [GL: 60141050]
15. `LABOR_FUND_FEE_LE` → LaborFundFeeLe → `editLeLaborFundFee` (Labor fund fee) [GL: 60141100]
16. `OTHER_STAFF_BENEFIT_LE` → OtherStaffBenefitLe → `editLeOtherStaffBenefit` (Other Staff benefit) [GL: 60141560]
17. `PROVIDENT_FUND_LE` → ProvidentFundLe → `editLeProvidentFund` (Provident fund) [GL: 60142000]
18. `EMPLOYEE_WELFARE_LE` → EmployeeWelfareLe → `editLeEmployeeWelfare` (Employee Welfare)
19. `PROVISION_LE` → ProvisionLe → `editLeProvision` (Provision) [GL: 60143150]
20. `INTEREST_LE` → InterestLe → `editLeInterest` (Interest) [GL: 63325150]
21. `STAFF_INSURANCE_LE` → StaffInsuranceLe → `editLeStaffInsurance` (Staff insurance) [GL: 60141150]
22. `MEDICAL_EXPENSE_LE` → MedicalExpenseLe → `editLeMedicalExpense` (Medical expense) [GL: 60141250]
23. `MEDICAL_INHOUSE_LE` → MedicalInhouseLe → `editLeMedicalInHouse` (Medical - In House) [GL: 60144200]
24. `TRAINING_LE` → TrainingLe → `editLeTraining` (Training) [GL: 60144172]
25. `LONG_SERVICE_LE` → LongServiceLe → `editLeLongService` (Long service) [GL: 60144400]
26. `PE_SB_MTH_LE` → PeSbMthLe → `editLePeSbMth` (PE + SB Monthly)
27. `PE_SB_YEAR_LE` → PeSbYearLe → `editLePeSbYear` (PE + SB Year)

### **Budget Year Fields - Customer Order**
*(Fields ordered exactly as specified by BIGC customer)*

1. `PAYROLL` → Payroll → `editBgPayroll` (Base salary)
2. `PREMIUM` → Premium → `editBgPremium` (Premium)
3. `TOTAL_PAYROLL` → TotalPayroll → `editBgTotalPayroll` (Total Payroll - Base+Premium) [GL: 60105000]
4. `BONUS` → Bonus → `editBgBonus` (Bonus) [GL: 60125000]
5. `BONUS_TYPES` → BonusTypes → `editBgBonusTypes` (Bonus Type)
6. `FLEET_CARD_PE` → FleetCardPe → `editBgFleetCardPe` (Fleet Card - PE) [GL: 60126300]
7. `CAR_ALLOWANCE` → CarAllowance → `editBgCarAllowance` (Car Allowance) [GL: 60126500]
8. `LICENSE_ALLOWANCE` → LicenseAllowance → `editBgLicenseAllowance` (License Allowance) [GL: 60127000]
9. `HOUSING_ALLOWANCE` → HousingAllowance → `editBgHousingAllowance` (Housing Allowance) [GL: 60126900]
10. `GASOLINE_ALLOWANCE` → GasolineAllowance → `editBgGasolineAllowance` (Gasoline Allowance) [GL: 60126800]
11. `WAGE_STUDENT` → WageStudent → `editBgWageStudent` (Wage - Student) [GL: 60127400]
12. `CAR_RENTAL_PE` → CarRentalPe → `editBgCarRentalPe` (Car Rental - PE) [GL: 60127600]
13. `SKILL_PAY_ALLOWANCE` → SkillPayAllowance → `editBgSkillPayAllowance` (Skill Pay Allowance) [GL: 60127100]
14. `OTHER_ALLOWANCE` → OtherAllowance → `editBgOtherAllowance` (Other Allowance) [GL: 60127300]
15. `SOCIAL_SECURITY` → SocialSecurity → `editBgSocialSecurity` (Social security) [GL: 60141050]
16. `LABOR_FUND_FEE` → LaborFundFee → `editBgLaborFundFee` (Labor fund fee) [GL: 60141100]
17. `OTHER_STAFF_BENEFIT` → OtherStaffBenefit → `editBgOtherStaffBenefit` (Other Staff benefit) [GL: 60141560]
18. `PROVIDENT_FUND` → ProvidentFund → `editBgProvidentFund` (Provident fund) [GL: 60142000]
19. `EMPLOYEE_WELFARE` → EmployeeWelfare → `editBgEmployeeWelfare` (Employee Welfare)
20. `PROVISION` → Provision → `editBgProvision` (Provision) [GL: 60143150]
21. `INTEREST` → Interest → `editBgInterest` (Interest) [GL: 63325150]
22. `STAFF_INSURANCE` → StaffInsurance → `editBgStaffInsurance` (Staff insurance) [GL: 60141150]
23. `MEDICAL_EXPENSE` → MedicalExpense → `editBgMedicalExpense` (Medical expense) [GL: 60141250]
24. `MEDICAL_INHOUSE` → MedicalInhouse → `editBgMedicalInHouse` (Medical - In House) [GL: 60144200]
25. `TRAINING` → Training → `editBgTraining` (Training) [GL: 60144172]
26. `LONG_SERVICE` → LongService → `editBgLongService` (Long service) [GL: 60144400]
27. `PE_SB_MTH` → PeSbMth → `editBgPeSbMth` (PE + SB Monthly)
28. `PE_SB_YEAR` → PeSbYear → `editBgPeSbYear` (PE + SB Year)

### **Summary Fields - Customer Order**
*(PE Summary calculations in BIGC customer specified order)*

1. `PE_MTH_LE` → PeMthLe → `editLePeMth` (PE Monthly LE)
2. `PE_YEAR_LE` → PeYearLe → `editLePeYear` (PE Annual LE)
3. `PE_MTH` → PeMth → `editBgPeMth` (PE Monthly Budget)
4. `PE_YEAR` → PeYear → `editBgPeYear` (PE Annual Budget)
---

## 📝 **Implementation Guidelines**

### **🎯 Customer Field Order Implementation:**

#### **BJC Configuration:**
```javascript
const BJC_FIELD_CONFIG = {
  company: 'BJC',
  useCustomOrder: true,
  orderConfigLE: BJC_CUSTOMER_FIELD_ORDER_LE,
  orderConfigBG: BJC_CUSTOMER_FIELD_ORDER_BG,
  orderConfigSummary: BJC_CUSTOMER_FIELD_ORDER_SUMMARY,
  glMapping: BJC_GL_MAPPING,
  
  // Field display with GL numbers
  getFieldLabel: function(fieldId) {
    const baseLabel = this.getBaseLabel(fieldId);
    const glNumber = BJC_GL_MAPPING[fieldId];
    return glNumber ? `${baseLabel} [GL: ${glNumber}]` : baseLabel;
  },
  
  // Custom ordering function
  orderFields: function(fields, type = 'LE') {
    let orderConfig;
    switch(type.toUpperCase()) {
      case 'LE': 
        orderConfig = this.orderConfigLE;
        break;
      case 'BG':
      case 'BUDGET':
        orderConfig = this.orderConfigBG;
        break;
      case 'SUMMARY':
        orderConfig = this.orderConfigSummary;
        break;
      default:
        orderConfig = this.orderConfigLE;
    }
    
    return fields.sort((a, b) => {
      const indexA = orderConfig.indexOf(a.id);
      const indexB = orderConfig.indexOf(b.id);
      
      // Fields in custom order come first
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      // Remaining fields maintain original order
      return 0;
    });
  }
};
```

#### **BIGC Configuration:**
```javascript
const BIGC_FIELD_CONFIG = {
  company: 'BIGC',
  useCustomOrder: true,
  orderConfigLE: BIGC_CUSTOMER_FIELD_ORDER_LE,
  orderConfigBG: BIGC_CUSTOMER_FIELD_ORDER_BG,
  orderConfigSummary: BIGC_CUSTOMER_FIELD_ORDER_SUMMARY,
  glMapping: BIGC_GL_MAPPING,
  
  // Field display with GL numbers
  getFieldLabel: function(fieldId) {
    const baseLabel = this.getBaseLabel(fieldId);
    const glNumber = BIGC_GL_MAPPING[fieldId];
    return glNumber ? `${baseLabel} [GL: ${glNumber}]` : baseLabel;
  },
  
  // Custom ordering function  
  orderFields: function(fields, type = 'LE') {
    let orderConfig;
    switch(type.toUpperCase()) {
      case 'LE': 
        orderConfig = this.orderConfigLE;
        break;
      case 'BG':
      case 'BUDGET':
        orderConfig = this.orderConfigBG;
        break;
      case 'SUMMARY':
        orderConfig = this.orderConfigSummary;
        break;
      default:
        orderConfig = this.orderConfigLE;
    }
    
    return fields.sort((a, b) => {
      const indexA = orderConfig.indexOf(a.id);
      const indexB = orderConfig.indexOf(b.id);
      
      // Fields in custom order come first
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      // Remaining fields maintain original order
      return 0;
    });
  }
};
```

### **Standard Approach:**
1. **Always reference this document** before creating baseColumns
2. **Map Database Column → Frontend Field** exactly as specified
3. **🚫 NEVER mix company fields** - BJC fields stay with BJC, BIGC fields stay with BIGC
4. **Respect company-specific differences** - don't force uniformity between companies
5. **🎯 Company Custom Orders** - Use company-specific CUSTOMER_FIELD_ORDER arrays
6. **📋 Documentation Authority** - If template files don't match this doc, FIX THE FILES
7. **🔒 Documentation Stability** - NEVER change this doc to match wrong implementations
8. **Company Validation** - Always check which company you're working with before adding fields
9. **GL Number Integration** - Display GL numbers for fields that have them (both BJC & BIGC requirement)

### **Files That Must Match This Documentation:**
- `budget.benefits.templates.js` ← Must conform to this doc
- `budget.dynamic.forms.js` ← Must conform to this doc
- `budget.grid.js` ← Must conform to this doc  
- `Budget.cshtml` ← Must conform to this doc
- Any other budget-related files ← Must conform to this doc

### **Field Naming Convention:**
```javascript
// Template: DB_FIELD → ParameterName → edit[Le/Bg][FieldName]
// Example:
PAYROLL_LE → PayrollLe → editLePayroll       // LE field
PAYROLL → Payroll → editBgPayroll            // Budget field
BONUS_TYPE_LE → BonusTypeLe → editLeBonusType // LE field with type
```

### **Required Validation:**
- All Core fields marked as `required: true`
- Payroll fields have `hasCalc: true` 
- Select fields use `type: 'select'`
- Number fields use `type: 'number'`

---

## ⚠️ **Important Notes**

1. **📋 Documentation Authority**: This document is **MASTER REFERENCE** - all implementations must match this
2. **Model Authority**: This document reflects the **actual database structure** - don't deviate without model changes
3. **🚫 NO FIELD MIXING**: BJC and BIGC have genuinely different field sets - **NEVER mix or copy fields between companies**
4. **Company Isolation**: Each company's fields are **business-specific** and should remain **completely separate**
5. **🔧 Fix Files, Not Doc**: When discrepancies found, **fix template files** to match this documentation
6. **🔒 Documentation Stability**: **NEVER modify this documentation** to accommodate wrong implementations
7. **Update Frequency**: Update this document ONLY when Models change
8. **Validation**: Use `get_errors` tool to validate implementation matches this spec
9. **🔒 Field Ownership**: BJC fields = BJC Model ONLY, BIGC fields = BIGC Model ONLY

### **🎯 Decision Matrix: When Files Don't Match Documentation**
- **Template file has wrong field name** → Fix template file ✅
- **Template file missing fields from doc** → Add to template file ✅  
- **Template file has extra fields not in doc** → Remove from template file ✅
- **Documentation missing fields from Model** → Update documentation ✅
- **Documentation conflicts with template preference** → Keep documentation, fix template ✅

---

## 📅 **Change Log**
- **2025-10-03**: Initial creation from Model analysis
- **2025-10-03**: Updated to 3-column format (DB Field → Parameter → ID Name)
- **2025-10-03**: Added complete field mappings from BJC & BIGC models
- **2025-10-03**: 🚫 Added CRITICAL RULE: NO FIELD MIXING between companies
- **2025-10-03**: 📋 Added DOCUMENTATION AUTHORITY RULE: This doc is master reference
- **2025-10-03**: 🎯 Added Decision Matrix: How to handle file conflicts
- **2025-10-03**: 🎯 **MAJOR UPDATE**: Added BJC Customer Field Order Configuration
- **2025-10-03**: 🔢 Added GL Number Integration for BJC fields
- **2025-10-03**: 📋 Reorganized BJC fields according to customer requirements (38 priority fields)
- **2025-10-03**: 🛠️ Added implementation guidelines for custom field ordering
- **Next Update**: When Models are modified

---

## 🚫 **FINAL REMINDER: NO FIELD MIXING**

**Before making ANY changes:**
1. ✅ Check which company (BJC/BIGC) you're working with
2. ✅ Use ONLY fields from that company's Model
3. ✅ NEVER copy fields from the other company
4. ✅ Remember: Different companies = Different business logic

**"Ten will NOT take fields from both companies and mix them together"**

**"Documentation is MASTER - fix files to match documentation, NOT vice versa"**

---

*This document serves as the single source of truth for all budget field implementations. Always reference this before coding.*
