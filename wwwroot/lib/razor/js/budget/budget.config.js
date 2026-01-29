/**
 * Budget Configuration
 * Constants and configuration settings for the budget system
 * Updated: 14 Jan 2026 - Support IIS virtual directory
 */

// ===== API Base URL (IIS Virtual Directory Support) =====
const BUDGET_API_BASE = (window.AppConfig && window.AppConfig.apiBaseUrl) ? window.AppConfig.apiBaseUrl : './api/';

// API Endpoints
const BUDGET_API = {
  companies: BUDGET_API_BASE + 'Budget/B0Companies',
  cobu: BUDGET_API_BASE + 'Budget/B0CoBU',           // Updated: COBU instead of empFormats
  empFormats: BUDGET_API_BASE + 'Budget/B0CoBU',     // Legacy compatibility
  budgetYears: BUDGET_API_BASE + 'Budget/B0BudgetYears',
  costCenters: BUDGET_API_BASE + 'Budget/B0CostCenters',
  locations: BUDGET_API_BASE + 'Budget/B0Locations',
  divisions: BUDGET_API_BASE + 'Budget/B0Divisions',
  departments: BUDGET_API_BASE + 'Budget/B0Departments',
  sections: BUDGET_API_BASE + 'Budget/B0Sections',
  storeNames: BUDGET_API_BASE + 'Budget/B0StoreNames',
  positions: BUDGET_API_BASE + 'Budget/B0Positions',
  jobBands: BUDGET_API_BASE + 'Budget/B0JobBands',
  empStatuses: BUDGET_API_BASE + 'Budget/B0EmpStatuses',
  empTypes: BUDGET_API_BASE + 'Budget/B0EmpTypes',
  newHC: BUDGET_API_BASE + 'Budget/B0NewHC',
  newPeriod: BUDGET_API_BASE + 'Budget/B0NewPeriod',
  newLEPeriod: BUDGET_API_BASE + 'Budget/B0NewLEPeriod',
  budgets: BUDGET_API_BASE + 'Budget/B0Budgets'
};

// Select API Endpoints (different from Budget API)
const SELECT_API = {
  companies: BUDGET_API_BASE + 'Select/companies',
  statuses: BUDGET_API_BASE + 'Select/statuses',
  positions: BUDGET_API_BASE + 'Select/positions',
  jobBands: BUDGET_API_BASE + 'Select/jobbands',
  employeeTypes: BUDGET_API_BASE + 'Select/employeetypes',
  newHC: BUDGET_API_BASE + 'Select/newhc',
  newLEPeriods: BUDGET_API_BASE + 'Select/lenewperiods',
  noOfMonths: BUDGET_API_BASE + 'Select/nofmonths',
  leNoOfMonths: BUDGET_API_BASE + 'Select/lenofmonths',
  planCostCenters: BUDGET_API_BASE + 'Select/costcenters',
  salaryStructures: BUDGET_API_BASE + 'Select/salarystructures',
  groupRunrates: BUDGET_API_BASE + 'Select/grouprunrates',
  focusHC: BUDGET_API_BASE + 'Select/focushc',
  focusPE: BUDGET_API_BASE + 'Select/focuspe',
  executives: BUDGET_API_BASE + 'Select/executives',
  salaryranges: BUDGET_API_BASE + 'Select/salaryranges',
  bonusTypes: BUDGET_API_BASE + 'Select/bonustypes',
  joinPvf: BUDGET_API_BASE + 'Select/joinpvf'
};

// Debounce delays for different API calls
const DEBOUNCE_DELAYS = {
  cobu: 100,                // Updated: COBU instead of empFormats
  empFormats: 100,          // Legacy compatibility
  budgetYears: 150,
  costCenters: 300,
  divisions: 400,
  departments: 500,
  sections: 600,
  locations: 700,
  positions: 800,
  jobBands: 900,
  empStatuses: 200,
  empTypes: 200,
  newHC: 200,
  newPeriod: 200,
  newLEPeriod: 200,
  offcanvasCostCenters: 300,
  offcanvasDivisions: 400,
  offcanvasDepartments: 500,
  offcanvasSections: 600,
  offcanvasLocations: 700,
  offcanvasPositions: 800,
  offcanvasJobBands: 900,
  offcanvasEmpStatus: 250,
  offcanvasEmployeeTypes: 200,
  offcanvasNewHC: 200,
  offcanvasNewPeriod: 200,
  offcanvasNOfMonth: 200,
  offcanvasNewLEPeriod: 200,
  offcanvasLEnOfMonth: 200,
  offcanvasNewLEnOfMonth: 200,
  offcanvasBonusTypes: 200,
  offcanvasJoinPvf: 200
};

// Grid default options
const GRID_DEFAULT_OPTIONS = {
  sortable: true,
  filter: true,
  floatingFilter: true
};

// Grid themes and styling
const GRID_THEME = 'ag-theme-alpine';

// Filter element IDs for More Options
const FILTER_ELEMENT_IDS = [
  'cobuFilter',
  'yearsFilter',
  'costcenterFilter',
  'divisionFilter',
  'departmentFilter',
  'sectionFilter',
  'locationsFilter',
  'positionFilter',
  'empstatusFilter',
  'jobbandFilter'
];

// Spinner element IDs mapping
const SPINNER_MAP = {
  'companyFilter': 'companySpinner',
  'cobuFilter': 'formatSpinner',
  'yearsFilter': 'yearSpinner'
};

// Loading delays for different operations
const LOADING_DELAYS = {
  addRowForm: 2000,      // 2 seconds for add row form
  editRowForm: 2000,     // 2 seconds for edit row form
  initialization: 1000   // 1 second for system initialization
};

// Edit Form delays for different operations
const EDIT_FORM_DELAYS = {
  cascadeDelay: 300,     // Delay between dropdown cascade operations
  populateDelay: 200,    // Delay for field population
  benefitsDelay: 400,    // Delay for benefits data population
  validationDelay: 150,  // Delay for validation processing
  autoSelectDelay: 250   // Delay for auto-select operations
};

// Cost Center Code สำหรับ Multi-Allocation (90066)
const AllocationCostCenterCode = '90066';

// Dynamic Forms Configuration
const DYNAMIC_FORMS_CONFIG = {
  // Cost Center ที่ต้องแสดง Budget Allocation Card และ Dynamic Forms
  ALLOCATION_COST_CENTER: '90066',

  // ฟิลด์หลักที่แสดงใน Dynamic Forms (LE Benefits)
  LE_BENEFITS_FIELDS: [
    { name: 'Payroll', id: 'Payroll', required: true },
    { name: 'Bonus', id: 'Bonus', required: false },
    { name: 'Fleet Card - PE', id: 'FleetCardPE', required: false },
    { name: 'Social Security', id: 'SocialSecurity', required: false },
    { name: 'Provident Fund', id: 'ProvidentFund', required: false },
    { name: 'PE (Year)', id: 'PeYear', required: false }
  ],

  // ฟิลด์หลักที่แสดงใน Dynamic Forms (2026 Benefits)
  BG_BENEFITS_FIELDS: [
    { name: 'Payroll', id: 'Payroll', required: false },
    { name: 'Bonus', id: 'Bonus', required: false },
    { name: 'Fleet Card - PE', id: 'FleetCardPE', required: false },
    { name: 'Social Security', id: 'SocialSecurity', required: false },
    { name: 'Provident Fund', id: 'ProvidentFund', required: false },
    { name: 'PE (Year)', id: 'PeYear', required: false }
  ],

  // CSS Classes สำหรับ Dynamic Forms (Dark Theme Compatible)
  CLASSES: {
    dynamicCard: 'card mb-3 dynamic-allocation-form',
    dynamicHeader: 'card-header py-2',
    dynamicBody: 'card-body',
    dynamicInput: 'form-control form-control-sm',
    dynamicLabel: 'form-label small',
    dynamicIcon: 'fa-solid fa-building me-2 dynamic-header-icon'
  },

  // Container IDs
  CONTAINERS: {
    leBenefits: 'dynamicLeBenefitsContainer',
    leBenefitsForms: 'dynamicLeBenefitsForms',
    bgBenefits: 'dynamicBgBenefitsContainer',
    bgBenefitsForms: 'dynamicBgBenefitsForms'
  }
};

// Company Configuration
const COMPANY_CONFIG = {
  BJC: {
    id: '1',
    code: 'BJC',
    name: 'BJC',
    fieldCount: 44,
    hasFleetCard: true,
    hasSouthRisk: true
  },
  BIGC: {
    id: '2',
    code: 'BIGC',
    name: 'BIGC',
    fieldCount: 30,
    hasFleetCard: true,
    hasSouthRisk: false
  }
};

// Company Field Mapping Configuration
const COMPANY_FIELD_CONFIG = {
  // Default required parameters for all API calls
  DEFAULT_PARAMS: ['CompanyID', 'COBU', 'BudgetYear'],

  // Company-specific API parameter mappings
  COMPANY_PARAMS: {
    '1': { // BJC
      format: 'COBU',
      yearField: 'BudgetYear',
      requiresRunrate: false
    },
    '2': { // BIGC
      format: 'COBU',
      yearField: 'BudgetYear',
      requiresRunrate: false
    }
  }
};

// ===== Field Configurations (Single Source of Truth) =====

// BJC Customer Field Order Configuration (from Documentation)
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
  // LE Fields
  'payrollLe': '',
  'premiumLe': '',
  'salWithEnLe': '70000100',
  'salNotEnLe': '70000110',
  'bonusLe': '70000300',
  'salTempLe': '',
  'socialSecurityTmpLe': '',
  'southriskAllowanceTmpLe': '',
  'carMaintenanceTmpLe': '',
  'salesManagementPcLe': '',
  'shelfStackingPcLe': '',
  'diligenceAllowancePcLe': '',
  'postAllowancePcLe': '',
  'phoneAllowancePcLe': '',
  'transportationPcLe': '',
  'skillAllowancePcLe': '',
  'otherAllowancePcLe': '',
  'temporaryStaffSalLe': '70000400',
  'socialSecurityLe': '70000600',
  'providentFundLe': '70000700',
  'workmenCompensationLe': '70000800',
  'housingAllowanceLe': '',
  'salesCarAllowanceLe': '',
  'accommodationLe': '',
  'carMaintenanceLe': '75300115',
  'southriskAllowanceLe': '',
  'mealAllowanceLe': '',
  'otherLe': '',
  'othersSubjectTaxLe': '70001020',
  'carAllowanceLe': '70001070',
  'licenseAllowanceLe': '70001080',
  'outsourceWagesLe': '70002000',
  'compCarsGasLe': '70200100',
  'compCarsOtherLe': '75200190',
  'carRentalLe': '75201000',
  'carGasolineLe': '75300100',
  'carRepairLe': '',
  'medicalOutsideLe': '71000100',
  'medicalInhouseLe': '71000200',
  'staffActivitiesLe': '71001000',
  'uniformLe': '71001200',
  'lifeInsuranceLe': '71001400',

  // Budget Fields (same GL numbers)
  'payroll': '',
  'premium': '',
  'salWithEn': '70000100',
  'salNotEn': '70000110',
  'bonus': '70000300',
  'salTemp': '',
  'socialSecurityTmp': '',
  'southriskAllowanceTmp': '',
  'carMaintenanceTmp': '',
  'salesManagementPc': '',
  'diligenceAllowancePc': '',
  'postAllowancePc': '',
  'phoneAllowancePc': '',
  'transportationPc': '',
  'skillAllowancePc': '',
  'otherAllowancePc': '',
  'temporaryStaffSal': '70000400',
  'socialSecurity': '70000600',
  'providentFund': '70000700',
  'workmenCompensation': '70000800',
  'housingAllowance': '',
  'salesCarAllowance': '',
  'accommodation': '',
  'carMaintenance': '75300115',
  'southriskAllowance': '',
  'mealAllowance': '',
  'other': '',
  'othersSubjectTax': '70001020',
  'carAllowance': '70001070',
  'licenseAllowance': '70001080',
  'outsourceWages': '70002000',
  'compCarsGas': '70200100',
  'compCarsOther': '75200190',
  'carRental': '75201000',
  'carGasoline': '75300100',
  'carRepair': '',
  'medicalOutside': '71000100',
  'medicalInhouse': '71000200',
  'staffActivities': '71001000',
  'uniform': '71001200',
  'lifeInsurance': '71001400',
  // Performance Evaluation Fields
  'peSbMthLe': '',
  'peSbMth': '',
  'peSbYearLe': '',
  'peSbYear': '',
  'peMthLe': '',
  'peMth': '',
  'peYearLe': '',
  'peYear': ''
};

// BIGC Customer Field Order Configuration (from Documentation)
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
  // LE Fields
  'payrollLe': '',
  'premiumLe': '',
  'totalPayrollLe': '60105000',
  'bonusLe': '60125000',
  'fleetCardPeLe': '60126300',
  'carAllowanceLe': '60126500',
  'licenseAllowanceLe': '60127000',
  'housingAllowanceLe': '60126900',
  'gasolineAllowanceLe': '60126800',
  'wageStudentLe': '60127400',
  'carRentalPeLe': '60127600',
  'skillPayAllowanceLe': '60127100',
  'otherAllowanceLe': '60127300',
  'socialSecurityLe': '60141050',
  'laborFundFeeLe': '60141100',
  'otherStaffBenefitLe': '60141560',
  'providentFundLe': '60142000',
  'employeeWelfareLe': '',
  'provisionLe': '60143150',
  'interestLe': '63325150',
  'staffInsuranceLe': '60141150',
  'medicalExpenseLe': '60141250',
  'medicalInhouseLe': '60144200',
  'trainingLe': '60144172',
  'longServiceLe': '60144400',

  // Budget Fields (same GL numbers)
  'payroll': '',
  'premium': '',
  'totalPayroll': '60105000',
  'bonus': '60125000',
  'fleetCardPe': '60126300',
  'carAllowance': '60126500',
  'licenseAllowance': '60127000',
  'housingAllowance': '60126900',
  'gasolineAllowance': '60126800',
  'wageStudent': '60127400',
  'carRentalPe': '60127600',
  'skillPayAllowance': '60127100',
  'otherAllowance': '60127300',
  'socialSecurity': '60141050',
  'laborFundFee': '60141100',
  'otherStaffBenefit': '60141560',
  'providentFund': '60142000',
  'employeeWelfare': '',
  'provision': '60143150',
  'interest': '63325150',
  'staffInsurance': '60141150',
  'medicalExpense': '60141250',
  'medicalInhouse': '60144200',
  'training': '60144172',
  'longService': '60144400',
  // Performance Evaluation Fields
  'peSbMthLe': '',
  'peSbMth': '',
  'peSbYearLe': '',
  'peSbYear': '',
  'peMthLe': '',
  'peMth': '',
  'peYearLe': '',
  'peYear': ''
};

// ===== Frontend to Backend Field Mapping Tables =====
// Maps Frontend field names (edit*) to Backend field names (API response format)

// BJC Field Mapping (45 fields total)
const BJC_FIELD_MAPPING = {
  // LE Fields (editLe* → *Le format)
  'editLePayroll': 'payrollLe',
  'editLePremium': 'premiumLe',
  'editLeSalWithEn': 'salWithEnLe',
  'editLeSalNotEn': 'salNotEnLe',
  'editLeBonus': 'bonusLe',
  'editLeSalTemp': 'salTempLe',
  'editLeSocialSecurityTmp': 'socialSecurityTmpLe',
  'editLeSouthriskAllowanceTmp': 'southriskAllowanceTmpLe',
  'editLeCarMaintenanceTmp': 'carMaintenanceTmpLe',
  'editLeSalesManagementPc': 'salesManagementPcLe',
  'editLeShelfStackingPc': 'shelfStackingPcLe',
  'editLeDiligenceAllowancePc': 'diligenceAllowancePcLe',
  'editLePostAllowancePc': 'postAllowancePcLe',
  'editLePhoneAllowancePc': 'phoneAllowancePcLe',
  'editLeTransportationPc': 'transportationPcLe',
  'editLeSkillAllowancePc': 'skillAllowancePcLe',
  'editLeOtherAllowancePc': 'otherAllowancePcLe',
  'editLeTemporaryStaffSal': 'temporaryStaffSalLe',
  'editLeSocialSecurity': 'socialSecurityLe',
  'editLeProvidentFund': 'providentFundLe',
  'editLeWorkmenCompensation': 'workmenCompensationLe',
  'editLeHousingAllowance': 'housingAllowanceLe',
  'editLeSalesCarAllowance': 'salesCarAllowanceLe',
  'editLeAccommodation': 'accommodationLe',
  'editLeCarMaintenance': 'carMaintenanceLe',
  'editLeSouthriskAllowance': 'southriskAllowanceLe',
  'editLeMealAllowance': 'mealAllowanceLe',
  'editLeOther': 'otherLe',
  'editLeOthersSubjectTax': 'othersSubjectTaxLe',
  'editLeCarAllowance': 'carAllowanceLe',
  'editLeLicenseAllowance': 'licenseAllowanceLe',
  'editLeOutsourceWages': 'outsourceWagesLe',
  'editLeCompCarsGas': 'compCarsGasLe',
  'editLeCompCarsOther': 'compCarsOtherLe',
  'editLeCarRental': 'carRentalLe',
  'editLeCarGasoline': 'carGasolineLe',
  'editLeCarRepair': 'carRepairLe',
  'editLeMedicalOutside': 'medicalOutsideLe',
  'editLeMedicalInHouse': 'medicalInHouseLe',
  'editLeStaffActivities': 'staffActivitiesLe',
  'editLeUniform': 'uniformLe',
  'editLeLifeInsurance': 'lifeInsuranceLe',
  'editLePeSbMth': 'peSbMthLe',
  'editLePeSbYear': 'peSbYearLe',
  'editLePeMth': 'peMthLe',
  'editLePeYear': 'peYearLe',

  // Budget Fields (editBg* → * format without Le suffix)
  'editBgPayroll': 'payroll',
  'editBgPremium': 'premium',
  'editBgSalWithEn': 'salWithEn',
  'editBgSalNotEn': 'salNotEn',
  'editBgBonus': 'bonus',
  'editBgSalTemp': 'salTemp',
  'editBgSocialSecurityTmp': 'socialSecurityTmp',
  'editBgSouthriskAllowanceTmp': 'southriskAllowanceTmp',
  'editBgCarMaintenanceTmp': 'carMaintenanceTmp',
  'editBgSalesManagementPc': 'salesManagementPc',
  'editBgShelfStackingPc': 'shelfStackingPc',
  'editBgDiligenceAllowancePc': 'diligenceAllowancePc',
  'editBgPostAllowancePc': 'postAllowancePc',
  'editBgPhoneAllowancePc': 'phoneAllowancePc',
  'editBgTransportationPc': 'transportationPc',
  'editBgSkillAllowancePc': 'skillAllowancePc',
  'editBgOtherAllowancePc': 'otherAllowancePc',
  'editBgTemporaryStaffSal': 'temporaryStaffSal',
  'editBgSocialSecurity': 'socialSecurity',
  'editBgProvidentFund': 'providentFund',
  'editBgWorkmenCompensation': 'workmenCompensation',
  'editBgHousingAllowance': 'housingAllowance',
  'editBgSalesCarAllowance': 'salesCarAllowance',
  'editBgAccommodation': 'accommodation',
  'editBgCarMaintenance': 'carMaintenance',
  'editBgSouthriskAllowance': 'southriskAllowance',
  'editBgMealAllowance': 'mealAllowance',
  'editBgOther': 'other',
  'editBgOthersSubjectTax': 'othersSubjectTax',
  'editBgCarAllowance': 'carAllowance',
  'editBgLicenseAllowance': 'licenseAllowance',
  'editBgOutsourceWages': 'outsourceWages',
  'editBgCompCarsGas': 'compCarsGas',
  'editBgCompCarsOther': 'compCarsOther',
  'editBgCarRental': 'carRental',
  'editBgCarGasoline': 'carGasoline',
  'editBgCarRepair': 'carRepair',
  'editBgMedicalOutside': 'medicalOutside',
  'editBgMedicalInHouse': 'medicalInHouse',
  'editBgStaffActivities': 'staffActivities',
  'editBgUniform': 'uniform',
  'editBgLifeInsurance': 'lifeInsurance',
  'editBgPeSbMth': 'peSbMth',
  'editBgPeSbYear': 'peSbYear',
  'editBgPeMth': 'peMth',
  'editBgPeYear': 'peYear'
};

// BIGC Field Mapping (27 fields total)
const BIGC_FIELD_MAPPING = {
  // LE Fields (editLe* → *Le format)
  'editLePayroll': 'payrollLe',
  'editLePremium': 'premiumLe',
  'editLeTotalPayroll': 'totalPayrollLe',
  'editLeBonus': 'bonusLe',
  'editLeFleetCardPe': 'fleetCardPeLe',
  'editLeCarAllowance': 'carAllowanceLe',
  'editLeLicenseAllowance': 'licenseAllowanceLe',
  'editLeHousingAllowance': 'housingAllowanceLe',
  'editLeGasolineAllowance': 'gasolineAllowanceLe',
  'editLeWageStudent': 'wageStudentLe',
  'editLeCarRentalPe': 'carRentalPeLe',
  'editLeSkillPayAllowance': 'skillPayAllowanceLe',
  'editLeOtherAllowance': 'otherAllowanceLe',
  'editLeSocialSecurity': 'socialSecurityLe',
  'editLeLaborFundFee': 'laborFundFeeLe',
  'editLeOtherStaffBenefit': 'otherStaffBenefitLe',
  'editLeProvidentFund': 'providentFundLe',
  'editLeEmployeeWelfare': 'employeeWelfareLe',
  'editLeProvision': 'provisionLe',
  'editLeInterest': 'interestLe',
  'editLeStaffInsurance': 'staffInsuranceLe',
  'editLeMedicalExpense': 'medicalExpenseLe',
  'editLeMedicalInHouse': 'medicalInHouseLe',
  'editLeTraining': 'trainingLe',
  'editLeLongService': 'longServiceLe',
  'editLePeSbMth': 'peSbMthLe',
  'editLePeSbYear': 'peSbYearLe',
  'editLePeMth': 'peMthLe',
  'editLePeYear': 'peYearLe',

  // Budget Fields (editBg* → * format without Le suffix)
  'editBgPayroll': 'payroll',
  'editBgPremium': 'premium',
  'editBgTotalPayroll': 'totalPayroll',
  'editBgBonus': 'bonus',
  'editBgFleetCardPe': 'fleetCardPe',
  'editBgCarAllowance': 'carAllowance',
  'editBgLicenseAllowance': 'licenseAllowance',
  'editBgHousingAllowance': 'housingAllowance',
  'editBgGasolineAllowance': 'gasolineAllowance',
  'editBgWageStudent': 'wageStudent',
  'editBgCarRentalPe': 'carRentalPe',
  'editBgSkillPayAllowance': 'skillPayAllowance',
  'editBgOtherAllowance': 'otherAllowance',
  'editBgSocialSecurity': 'socialSecurity',
  'editBgLaborFundFee': 'laborFundFee',
  'editBgOtherStaffBenefit': 'otherStaffBenefit',
  'editBgProvidentFund': 'providentFund',
  'editBgEmployeeWelfare': 'employeeWelfare',
  'editBgProvision': 'provision',
  'editBgInterest': 'interest',
  'editBgStaffInsurance': 'staffInsurance',
  'editBgMedicalExpense': 'medicalExpense',
  'editBgMedicalInHouse': 'medicalInHouse',
  'editBgTraining': 'training',
  'editBgLongService': 'longService',
  'editBgPeSbMth': 'peSbMth',
  'editBgPeSbYear': 'peSbYear',
  'editBgPeMth': 'peMth',
  'editBgPeYear': 'peYear'
};

// Field Mapping Utility Functions
function mapFrontendFieldToBackend(frontendField, companyId = null) {
  let fieldMapping = {};

  if (companyId === '1' || companyId === 1) {
    fieldMapping = BJC_FIELD_MAPPING;
  } else if (companyId === '2' || companyId === 2) {
    fieldMapping = BIGC_FIELD_MAPPING;
  } else {
    // For mixed or unknown company, use combined mapping
    fieldMapping = { ...BJC_FIELD_MAPPING, ...BIGC_FIELD_MAPPING };
  }

  return fieldMapping[frontendField] || frontendField;
}

function mapBackendFieldToFrontend(backendField, companyId = null) {
  let fieldMapping = {};

  if (companyId === '1' || companyId === 1) {
    fieldMapping = Object.fromEntries(
      Object.entries(BJC_FIELD_MAPPING).map(([k, v]) => [v, k])
    );
  } else if (companyId === '2' || companyId === 2) {
    fieldMapping = Object.fromEntries(
      Object.entries(BIGC_FIELD_MAPPING).map(([k, v]) => [v, k])
    );
  } else {
    // For mixed or unknown company, use combined mapping
    const combinedMapping = { ...BJC_FIELD_MAPPING, ...BIGC_FIELD_MAPPING };
    fieldMapping = Object.fromEntries(
      Object.entries(combinedMapping).map(([k, v]) => [v, k])
    );
  }

  return fieldMapping[backendField] || backendField;
}

// Validation Messages
const VALIDATION_MESSAGES = {
  ALLOCATION_NOT_100: 'Total allocation must equal 100%',
  DUPLICATE_COST_CENTERS: 'Duplicate cost centers detected. Please select unique cost centers.',
  NO_ALLOCATIONS: 'At least one allocation with valid cost center and percentage is required.',
  ALLOCATION_EXCEEDS_100: 'Allocation exceeds 100%',
  ALLOCATION_INCOMPLETE: 'Total must equal 100%',
  INVALID_COMPANY: 'Invalid company selection. Please select a valid company.',
  MISSING_COBU: 'COBU selection is required for this company.'
};

// ===== Global Exports =====
// Export all constants and functions to window object for use in other modules

if (typeof window !== 'undefined') {
  // API Endpoints
  window.BUDGET_API = BUDGET_API;
  window.SELECT_API = SELECT_API;

  // Debounce and UI Settings
  window.DEBOUNCE_DELAYS = DEBOUNCE_DELAYS;
  window.GRID_DEFAULT_OPTIONS = GRID_DEFAULT_OPTIONS;
  window.SPINNER_MAP = SPINNER_MAP;

  // Field Ordering Arrays
  window.BJC_CUSTOMER_FIELD_ORDER_LE = BJC_CUSTOMER_FIELD_ORDER_LE;
  window.BJC_CUSTOMER_FIELD_ORDER_BG = BJC_CUSTOMER_FIELD_ORDER_BG;
  window.BJC_CUSTOMER_FIELD_ORDER_SUMMARY = BJC_CUSTOMER_FIELD_ORDER_SUMMARY;
  window.BIGC_CUSTOMER_FIELD_ORDER_LE = BIGC_CUSTOMER_FIELD_ORDER_LE;
  window.BIGC_CUSTOMER_FIELD_ORDER_BG = BIGC_CUSTOMER_FIELD_ORDER_BG;
  window.BIGC_CUSTOMER_FIELD_ORDER_SUMMARY = BIGC_CUSTOMER_FIELD_ORDER_SUMMARY;

  // GL Number Mappings
  window.BJC_GL_MAPPING = BJC_GL_MAPPING;
  window.BIGC_GL_MAPPING = BIGC_GL_MAPPING;

  // NEW: Field Mapping Tables (Frontend ↔ Backend)
  window.BJC_FIELD_MAPPING = BJC_FIELD_MAPPING;
  window.BIGC_FIELD_MAPPING = BIGC_FIELD_MAPPING;

  // NEW: Field Mapping Utility Functions
  window.mapFrontendFieldToBackend = mapFrontendFieldToBackend;
  window.mapBackendFieldToFrontend = mapBackendFieldToFrontend;

  // Validation Messages
  window.VALIDATION_MESSAGES = VALIDATION_MESSAGES;
}
