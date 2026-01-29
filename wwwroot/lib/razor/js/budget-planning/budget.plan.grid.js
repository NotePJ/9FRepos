/**
 * Budget Grid Functions - Documentation Compliant Version
 * Handles AG Grid configurations, column definitions, and grid operations
 *
 * 🎯 IMPORTANT: This file implements baseColumns.documentation.md specifications
 * 📋 Documentation Authority Rule: ALL fields must match Documentation exactly
 * 🚫 NO FIELD MIXING: BJC fields ≠ BIGC fields (completely separate systems)
 * 🔍 Customer Field Order: Fields ordered per customer requirements (BJC=45, BIGC=27)
 * 🏷️ GL Numbers: Displayed in column headers as per Documentation requirements
 *
 * Last Updated: October 3, 2025
 * Source Documentation: baseColumns.documentation.md
 *
 * Implementation Features:
 * ✅ BJC: 45 fields in customer-specified order with GL numbers
 * ✅ BIGC: 27 fields in customer-specified order with GL numbers
 * ✅ Custom field ordering functions per Documentation
 * ✅ GL number integration in column headers
 * ✅ Documentation compliance validation
 * ✅ Separate field handling (no company mixing)
 */

// Data storage (Grid APIs are managed in budget.main.js)
var rawData = [];
var masterData = [];
var selectedCostCenter = null;

//const budgetYear = getCurrentYear();
//const leYear = LastYear();

// ===== Field Configurations (Reference from budget.config.js) =====
// Note: Constants are now defined in budget.config.js to avoid duplication

// Helper Functions for Field Management (from Documentation)
function getFieldHeaderWithGL(fieldId, baseHeader) {
  // Reference GL mappings from budget.config.js (via window object)
  const bjcMapping = window.BJC_GL_MAPPING || BJC_GL_MAPPING || {};
  const bigcMapping = window.BIGC_GL_MAPPING || BIGC_GL_MAPPING || {};
  const glNumber = bjcMapping[fieldId] || bigcMapping[fieldId];

  // Debug: Log field lookup
  //console.log(`🔍 GL Lookup: fieldId="${fieldId}", glNumber="${glNumber}", baseHeader="${baseHeader}"`);

  return glNumber ? `${baseHeader} [GL: ${glNumber}]` : baseHeader;
}

function applyCustomFieldOrder(columns, companyId, type = 'LE') {
  if (!columns || columns.length === 0) return columns;

  let orderConfig = null;

  // Reference field orders from budget.config.js (via window object)
  const bjcOrderLE = window.BJC_CUSTOMER_FIELD_ORDER_LE || BJC_CUSTOMER_FIELD_ORDER_LE || [];
  const bjcOrderBG = window.BJC_CUSTOMER_FIELD_ORDER_BG || BJC_CUSTOMER_FIELD_ORDER_BG || [];
  const bjcOrderSummary = window.BJC_CUSTOMER_FIELD_ORDER_SUMMARY || BJC_CUSTOMER_FIELD_ORDER_SUMMARY || [];
  const bigcOrderLE = window.BIGC_CUSTOMER_FIELD_ORDER_LE || BIGC_CUSTOMER_FIELD_ORDER_LE || [];
  const bigcOrderBG = window.BIGC_CUSTOMER_FIELD_ORDER_BG || BIGC_CUSTOMER_FIELD_ORDER_BG || [];
  const bigcOrderSummary = window.BIGC_CUSTOMER_FIELD_ORDER_SUMMARY || BIGC_CUSTOMER_FIELD_ORDER_SUMMARY || [];

  if (companyId === '1' || companyId === 1) {
    // BJC field ordering
    switch (type.toUpperCase()) {
      case 'LE':
        orderConfig = bjcOrderLE;
        break;
      case 'BG':
      case 'BUDGET':
        orderConfig = bjcOrderBG;
        break;
      case 'SUMMARY':
        orderConfig = bjcOrderSummary;
        break;
    }
  } else if (companyId === '2' || companyId === 2) {
    // BIGC field ordering
    switch (type.toUpperCase()) {
      case 'LE':
        orderConfig = bigcOrderLE;
        break;
      case 'BG':
      case 'BUDGET':
        orderConfig = bigcOrderBG;
        break;
      case 'SUMMARY':
        orderConfig = bigcOrderSummary;
        break;
    }
  }

  if (!orderConfig) return columns;

  // Sort columns based on custom order
  return columns.sort((a, b) => {
    const indexA = orderConfig.indexOf(a.field);
    const indexB = orderConfig.indexOf(b.field);

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

function createFieldDefinition(fieldId, headerName, fieldConfig = {}) {
  const defaultConfig = {
    sortable: true,
    filter: 'agNumberColumnFilter',
    cellEditor: 'agNumberCellEditor',
    cellEditorParams: { min: 0, precision: 2 },
    editable: true,
    width: 130,
    valueFormatter: params => formatCurrency(params.value)
  };

  // fieldId is now the database field name directly (no mapping needed)
  return {
    headerName: getFieldHeaderWithGL(fieldId, headerName),
    field: fieldId,  // Use database field name directly
    ...defaultConfig,
    ...fieldConfig
  };
}

function createGLFieldGroup(fieldId, groupName, fieldConfig = {}) {
  // Get GL number for the field
  const bjcMapping = window.BJC_GL_MAPPING || BJC_GL_MAPPING || {};
  const bigcMapping = window.BIGC_GL_MAPPING || BIGC_GL_MAPPING || {};
  const glNumber = bjcMapping[fieldId] || bigcMapping[fieldId];

  const headerName = glNumber ? `GL: ${glNumber} - ${groupName}` : `${groupName} (No GL)`;

  // Log only if GL not found for debugging
  if (!glNumber) {
    // console.warn(`⚠️ No GL found for field: ${fieldId}`);
  }

  return {
    headerName: headerName,
    children: [
      createFieldDefinition(fieldId, groupName, fieldConfig)
    ]
  };
}

// Function to create main budget grid column data with comprehensive company support
function createColumnData(companyId = null) {
  // Get companyId from companyFilter if not provided
  if (companyId === null || companyId === undefined) {
    const companyFilter = document.getElementById('companyFilter');
    companyId = companyFilter ? companyFilter.value : null;
    // If companyFilter value is empty or 'all', set to null
    if (companyId === '' || companyId === 'all' || companyId === '0') {
      companyId = null;
    }
  }

  // console.log("📋 Creating column data for company ID:", companyId);
  // console.log("🎯 Documentation Authority Rule: Following baseColumns.documentation.md");
  const currentYear = getCurrentYear();
  const lastYear = LastYear();

  // Base columns for all companies
  const baseColumns = [
    {
      headerName: "#",
      children: [
        {
          headerName: "Edit",
          field: "budgetId",
          sortable: false,
          width: 70,
          resizable: false,
          suppressSizeToFit: true,
          pinned: 'left',
          filter: false,
          cellRenderer: params => {
            return `<button class="btn btn-sm btn-ghost-core edit-btn" data-index="${params.rowIndex}"><i class="fa-solid fa-pencil"></i></button>`;
          }
        },
      ]
    },
    {
      headerName: `Cost Center`,
      children: [
        { headerName: `Code`, field: "costCenterCode", sortable: true, filter: 'agTextColumnFilter', resizable: false, width: 120, suppressSizeToFit: true, pinned: 'left' },
        { headerName: `Name`, field: "costCenterName", sortable: true, filter: 'agTextColumnFilter', resizable: false, width: 180, suppressSizeToFit: true, pinned: 'left' }
      ]
    },
    {
      headerName: `Employee`,
      children: [
        { headerName: "ID", field: "empCode", sortable: true, filter: 'agTextColumnFilter', resizable: false, width: 120, suppressSizeToFit: true, pinned: 'left' },
        {
          headerName: "Status",
          field: "empStatus",
          sortable: true,
          filter: 'agTextColumnFilter',
          resizable: false,
          width: 120,
          suppressSizeToFit: true,
          pinned: 'left',
          cellRenderer: params => {
            if (!params.value) return '';
            const status = params.value.toLowerCase();
            let badgeClass = '';
            if (status === 'active') badgeClass = 'text-bg-core';
            else if (status === 'on process') badgeClass = 'text-bg-warning';
            else if (status === 'vacancy') badgeClass = 'text-bg-secondary';
            else if (status === 'new join') badgeClass = 'text-bg-info';
            else badgeClass = 'badge text-muted';
            return `<span class="${badgeClass}">${params.value}</span>`;
          }
        }
      ]
    },
    {
      headerName: "Employee Details",
      children: [
        { headerName: "Title(TH)", field: "titleTh", sortable: true, filter: 'agTextColumnFilter', width: 100 },
        { headerName: "Name(TH)", field: "fnameTh", sortable: true, filter: 'agTextColumnFilter', width: 150 },
        { headerName: "Lastname(TH)", field: "lnameTh", sortable: true, filter: 'agTextColumnFilter', width: 150 },
        { headerName: "Title(EN)", field: "titleEn", sortable: true, filter: 'agTextColumnFilter', width: 100 },
        { headerName: "Name(EN)", field: "fnameEn", sortable: true, filter: 'agTextColumnFilter', width: 150 },
        { headerName: "Lastname(EN)", field: "lnameEn", sortable: true, filter: 'agTextColumnFilter', width: 150 }
      ]
    },
    {
      headerName: "Organization",
      children: [
        { headerName: "Company Group", field: "companyCode", sortable: true, filter: 'agTextColumnFilter', width: 100 },
        { headerName: "BU", field: "bu", sortable: true, filter: 'agTextColumnFilter', width: 100 },
        { headerName: (companyId === '1' || companyId === 1) ? "COBU" : "Format", field: "cobu", sortable: true, filter: 'agTextColumnFilter', width: 120 },
        { headerName: "Division", field: "division", sortable: true, filter: 'agTextColumnFilter', width: 150 },
        { headerName: "Department", field: "department", sortable: true, filter: 'agTextColumnFilter', width: 150 },
        { headerName: "Section", field: "section", sortable: true, filter: 'agTextColumnFilter', width: 150 },
        { headerName: (companyId === '1' || companyId === 1) ? "Company" : "Store Name", field: "storeName", sortable: true, filter: 'agTextColumnFilter', width: 150 },
      ]
    },
    {
      headerName: "Position & Employment",
      children: [
        { headerName: "Position Code", field: "positionCode", sortable: true, filter: 'agTextColumnFilter', width: 120 },
        { headerName: "Position Name", field: "positionName", sortable: true, filter: 'agTextColumnFilter', width: 180 },
        { headerName: "Job Band", field: "jobBand", sortable: true, filter: 'agTextColumnFilter', width: 100 },
        { headerName: "Join Date", field: "joinDate", sortable: true, filter: 'agDateColumnFilter', width: 120 },
        { headerName: `YOS ${lastYear}`, field: "yosCurrYear", sortable: true, filter: 'agNumberColumnFilter', width: 100 },
        { headerName: `YOS ${currentYear}`, field: "yosNextYear", sortable: true, filter: 'agNumberColumnFilter', width: 100 },
        { headerName: "Emp Type", field: "empTypeCode", sortable: true, filter: 'agTextColumnFilter', width: 100 },
        { headerName: "New HC", field: "newHcCode", sortable: true, filter: 'agTextColumnFilter', width: 100 },
        { headerName: "New Vac Period", field: "newVacPeriod", sortable: true, filter: 'agTextColumnFilter', width: 120 },
        { headerName: "New Vac LE", field: "newVacLe", sortable: true, filter: 'agTextColumnFilter', width: 100 }
      ]
    },
    {
      headerName: "Group Information",
      children: [
        // { headerName: "Group Name", field: "groupName", sortable: true, filter: 'agTextColumnFilter', width: 150 },
        // { headerName: "Group Level 1", field: "groupLevel1", sortable: true, filter: 'agTextColumnFilter', width: 120 },
        // { headerName: "Group Level 2", field: "groupLevel2", sortable: true, filter: 'agTextColumnFilter', width: 120 },
        // { headerName: "Group Level 3", field: "groupLevel3", sortable: true, filter: 'agTextColumnFilter', width: 120 },
        { headerName: "HRBP(EmpId)", field: "hrbpEmpCode", sortable: true, filter: 'agTextColumnFilter', width: 120 },
        { headerName: "Reason", field: "reason", sortable: true, filter: 'agTextColumnFilter', width: 150 },
        { headerName: "LE Of Month", field: "leOfMonth", sortable: true, filter: 'agNumberColumnFilter', width: 100 },
        { headerName: "No Of Month", field: "noOfMonth", sortable: true, filter: 'agNumberColumnFilter', width: 100 },
      ]
    }
  ];

  // BJC-specific columns - Ordered according to bjcOrderLE + bjcOrderBG from getBjcFieldConfig()
  const bjcColumns = [
    // ========== LE FIELDS (bjcOrderLE) ==========
    // 1. payrollLe
    createGLFieldGroup('payrollLe', `Payroll LE ${lastYear}`, { width: 120 }),
    // 2. premiumLe
    createGLFieldGroup('premiumLe', `Premium LE ${lastYear}`, { width: 120 }),
    // 3. salWithEnLe
    createGLFieldGroup('salWithEnLe', `Basic Salary with EN LE ${lastYear}`, { width: 150 }),
    // 4. salNotEnLe
    createGLFieldGroup('salNotEnLe', `Basic Salary not EN LE ${lastYear}`, { width: 150 }),
    // 5. bonusTypeLe
    { headerName: "Bonus Type LE", field: "bonusTypeLe", sortable: true, filter: 'agTextColumnFilter', width: 120, editable: true },
    // 6. bonusLe
    createGLFieldGroup('bonusLe', `Bonus LE ${lastYear}`, { width: 120 }),
    // 7. salTempLe
    createGLFieldGroup('salTempLe', `Salary (Temp) LE ${lastYear}`, { width: 130 }),
    // 8. socialSecurityTmpLe
    createGLFieldGroup('socialSecurityTmpLe', `Social Security Fund (Temp) LE ${lastYear}`, { width: 160 }),
    // 9. southriskAllowanceTmpLe
    createGLFieldGroup('southriskAllowanceTmpLe', `South Risk Allowance (Temp) LE ${lastYear}`, { width: 170 }),
    // 10. carMaintenanceTmpLe
    createGLFieldGroup('carMaintenanceTmpLe', `Car Maintenance (Temp) LE ${lastYear}`, { width: 150 }),
    // 11. salesManagementPcLe
    createGLFieldGroup('salesManagementPcLe', `Sales Management PC LE ${lastYear}`, { width: 150 }),
    // 12. shelfStackingPcLe
    createGLFieldGroup('shelfStackingPcLe', `Shelf Stacking PC LE ${lastYear}`, { width: 150 }),
    // 13. diligenceAllowancePcLe
    createGLFieldGroup('diligenceAllowancePcLe', `Diligence Allowance PC LE ${lastYear}`, { width: 160 }),
    // 14. postAllowancePcLe
    createGLFieldGroup('postAllowancePcLe', `Post Allowance PC LE ${lastYear}`, { width: 150 }),
    // 15. phoneAllowancePcLe
    createGLFieldGroup('phoneAllowancePcLe', `Phone Allowance PC LE ${lastYear}`, { width: 155 }),
    // 16. transportationPcLe
    createGLFieldGroup('transportationPcLe', `Transportation PC LE ${lastYear}`, { width: 150 }),
    // 17. skillAllowancePcLe
    createGLFieldGroup('skillAllowancePcLe', `Skill Allowance PC LE ${lastYear}`, { width: 150 }),
    // 18. otherAllowancePcLe
    createGLFieldGroup('otherAllowancePcLe', `Other Allowance PC LE ${lastYear}`, { width: 155 }),
    // 19. temporaryStaffSalLe
    createGLFieldGroup('temporaryStaffSalLe', `Temporary Staff Salary LE ${lastYear}`, { width: 160 }),
    // 20. socialSecurityLe
    createGLFieldGroup('socialSecurityLe', `Social Security Fund LE ${lastYear}`, { width: 150 }),
    // 21. providentFundLe
    createGLFieldGroup('providentFundLe', `Provident Fund LE ${lastYear}`, { width: 140 }),
    // 22. workmenCompensationLe
    createGLFieldGroup('workmenCompensationLe', `Workmen Compensation LE ${lastYear}`, { width: 160 }),
    // 23. housingAllowanceLe
    createGLFieldGroup('housingAllowanceLe', `Housing Allowance LE ${lastYear}`, { width: 140 }),
    // 24. salesCarAllowanceLe
    createGLFieldGroup('salesCarAllowanceLe', `Sales Car Allowance LE ${lastYear}`, { width: 150 }),
    // 25. accommodationLe
    createGLFieldGroup('accommodationLe', `Accommodation LE ${lastYear}`, { width: 130 }),
    // 26. carMaintenanceLe
    createGLFieldGroup('carMaintenanceLe', `Car Maintenance LE ${lastYear}`, { width: 180 }),
    // 27. southriskAllowanceLe
    createGLFieldGroup('southriskAllowanceLe', `South Risk Allowance LE ${lastYear}`, { width: 150 }),
    // 28. mealAllowanceLe
    createGLFieldGroup('mealAllowanceLe', `Meal Allowance LE ${lastYear}`, { width: 130 }),
    // 29. otherLe
    createGLFieldGroup('otherLe', `Other Benefits LE ${lastYear}`, { width: 130 }),
    // 30. othersSubjectTaxLe
    createGLFieldGroup('othersSubjectTaxLe', `Others Subject to Tax LE ${lastYear}`, { width: 160 }),
    // 31. carAllowanceLe
    createGLFieldGroup('carAllowanceLe', `Car Allowance LE ${lastYear}`, { width: 130 }),
    // 32. licenseAllowanceLe
    createGLFieldGroup('licenseAllowanceLe', `License Allowance LE ${lastYear}`, { width: 120 }),
    // 33. outsourceWagesLe
    createGLFieldGroup('outsourceWagesLe', `Outsource Wages LE ${lastYear}`, { width: 140 }),
    // 34. compCarsGasLe
    createGLFieldGroup('compCarsGasLe', `Company Cars Gasoline LE ${lastYear}`, { width: 160 }),
    // 35. compCarsOtherLe
    createGLFieldGroup('compCarsOtherLe', `Company Cars Other LE ${lastYear}`, { width: 150 }),
    // 36. carRentalLe
    createGLFieldGroup('carRentalLe', `Car Rental LE ${lastYear}`, { width: 130 }),
    // 37. carGasolineLe
    createGLFieldGroup('carGasolineLe', `Car Gasoline LE ${lastYear}`, { width: 150 }),
    // 38. carRepairLe
    createGLFieldGroup('carRepairLe', `Car Repair LE ${lastYear}`, { width: 120 }),
    // 39. medicalOutsideLe
    createGLFieldGroup('medicalOutsideLe', `Medical Outside LE ${lastYear}`, { width: 140 }),
    // 40. medicalInhouseLe
    createGLFieldGroup('medicalInhouseLe', `Medical Inhouse LE ${lastYear}`, { width: 140 }),
    // 41. staffActivitiesLe
    createGLFieldGroup('staffActivitiesLe', `Staff Activities LE ${lastYear}`, { width: 140 }),
    // 42. uniformLe
    createGLFieldGroup('uniformLe', `Uniform LE ${lastYear}`, { width: 120 }),
    // 43. lifeInsuranceLe
    createGLFieldGroup('lifeInsuranceLe', `Life Insurance LE ${lastYear}`, { width: 130 }),
    // 44. peMthLe
    createGLFieldGroup('peMthLe', `PE Monthly LE ${lastYear}`, { width: 130, editable: false }),
    // 45. peYearLe
    createGLFieldGroup('peYearLe', `PE Annual LE ${lastYear}`, { width: 130, editable: false }),
    // 46. peSbMthLe
    createGLFieldGroup('peSbMthLe', `PE SB Monthly LE ${lastYear}`, { width: 130, editable: false }),
    // 47. peSbYearLe
    createGLFieldGroup('peSbYearLe', `PE SB Year LE ${lastYear}`, { width: 160, editable: false }),

    // ========== BG FIELDS (bjcOrderBG) ==========
    // 1. payroll
    createGLFieldGroup('payroll', `Payroll ${currentYear}`, { width: 120 }),
    // 2. premium
    createGLFieldGroup('premium', `Premium ${currentYear}`, { width: 120 }),
    // 3. salWithEn
    createGLFieldGroup('salWithEn', `Basic Salary with EN ${currentYear}`, { width: 150 }),
    // 4. salNotEn
    createGLFieldGroup('salNotEn', `Basic Salary not EN ${currentYear}`, { width: 150 }),
    // 5. bonusType
    { headerName: "Bonus Type", field: "bonusType", sortable: true, filter: 'agTextColumnFilter', width: 120, editable: true },
    // 6. bonus
    createGLFieldGroup('bonus', `Bonus ${currentYear}`, { width: 120 }),
    // 7. salTemp
    createGLFieldGroup('salTemp', `Salary (Temp) ${currentYear}`, { width: 130 }),
    // 8. socialSecurityTmp
    createGLFieldGroup('socialSecurityTmp', `Social Security Fund (Temp) ${currentYear}`, { width: 160 }),
    // 9. southriskAllowanceTmp
    createGLFieldGroup('southriskAllowanceTmp', `South Risk Allowance (Temp) ${currentYear}`, { width: 170 }),
    // 10. carMaintenanceTmp
    createGLFieldGroup('carMaintenanceTmp', `Car Maintenance (Temp) ${currentYear}`, { width: 150 }),
    // 11. salesManagementPc
    createGLFieldGroup('salesManagementPc', `Sales Management PC ${currentYear}`, { width: 150 }),
    // 12. shelfStackingPc
    createGLFieldGroup('shelfStackingPc', `Shelf Stacking PC ${currentYear}`, { width: 150 }),
    // 13. diligenceAllowancePc
    createGLFieldGroup('diligenceAllowancePc', `Diligence Allowance PC ${currentYear}`, { width: 160 }),
    // 14. postAllowancePc
    createGLFieldGroup('postAllowancePc', `Post Allowance PC ${currentYear}`, { width: 150 }),
    // 15. phoneAllowancePc
    createGLFieldGroup('phoneAllowancePc', `Phone Allowance PC ${currentYear}`, { width: 155 }),
    // 16. transportationPc
    createGLFieldGroup('transportationPc', `Transportation PC ${currentYear}`, { width: 150 }),
    // 17. skillAllowancePc
    createGLFieldGroup('skillAllowancePc', `Skill Allowance PC ${currentYear}`, { width: 150 }),
    // 18. otherAllowancePc
    createGLFieldGroup('otherAllowancePc', `Other Allowance PC ${currentYear}`, { width: 155 }),
    // 19. temporaryStaffSal
    createGLFieldGroup('temporaryStaffSal', `Temporary Staff Salary ${currentYear}`, { width: 160 }),
    // 20. socialSecurity
    createGLFieldGroup('socialSecurity', `Social Security Fund ${currentYear}`, { width: 150 }),
    // 21. providentFund
    createGLFieldGroup('providentFund', `Provident Fund ${currentYear}`, { width: 140 }),
    // 22. workmenCompensation
    createGLFieldGroup('workmenCompensation', `Workmen Compensation ${currentYear}`, { width: 160 }),
    // 23. housingAllowance
    createGLFieldGroup('housingAllowance', `Housing Allowance ${currentYear}`, { width: 140 }),
    // 24. salesCarAllowance
    createGLFieldGroup('salesCarAllowance', `Sales Car Allowance ${currentYear}`, { width: 150 }),
    // 25. accommodation
    createGLFieldGroup('accommodation', `Accommodation ${currentYear}`, { width: 130 }),
    // 26. carMaintenance
    createGLFieldGroup('carMaintenance', `Car Maintenance ${currentYear}`, { width: 180 }),
    // 27. southriskAllowance
    createGLFieldGroup('southriskAllowance', `South Risk Allowance ${currentYear}`, { width: 150 }),
    // 28. mealAllowance
    createGLFieldGroup('mealAllowance', `Meal Allowance ${currentYear}`, { width: 130 }),
    // 29. other
    createGLFieldGroup('other', `Other Benefits ${currentYear}`, { width: 130 }),
    // 30. othersSubjectTax
    createGLFieldGroup('othersSubjectTax', `Others Subject to Tax ${currentYear}`, { width: 160 }),
    // 31. carAllowance
    createGLFieldGroup('carAllowance', `Car Allowance ${currentYear}`, { width: 130 }),
    // 32. licenseAllowance
    createGLFieldGroup('licenseAllowance', `License Allowance ${currentYear}`, { width: 120 }),
    // 33. outsourceWages
    createGLFieldGroup('outsourceWages', `Outsource Wages ${currentYear}`, { width: 140 }),
    // 34. compCarsGas
    createGLFieldGroup('compCarsGas', `Company Cars Gasoline ${currentYear}`, { width: 160 }),
    // 35. compCarsOther
    createGLFieldGroup('compCarsOther', `Company Cars Other ${currentYear}`, { width: 150 }),
    // 36. carRental
    createGLFieldGroup('carRental', `Car Rental ${currentYear}`, { width: 130 }),
    // 37. carGasoline
    createGLFieldGroup('carGasoline', `Car Gasoline ${currentYear}`, { width: 150 }),
    // 38. carRepair
    createGLFieldGroup('carRepair', `Car Repair ${currentYear}`, { width: 120 }),
    // 39. medicalOutside
    createGLFieldGroup('medicalOutside', `Medical Outside ${currentYear}`, { width: 140 }),
    // 40. medicalInhouse
    createGLFieldGroup('medicalInhouse', `Medical Inhouse ${currentYear}`, { width: 140 }),
    // 41. staffActivities
    createGLFieldGroup('staffActivities', `Staff Activities ${currentYear}`, { width: 140 }),
    // 42. uniform
    createGLFieldGroup('uniform', `Uniform ${currentYear}`, { width: 120 }),
    // 43. lifeInsurance
    createGLFieldGroup('lifeInsurance', `Life Insurance ${currentYear}`, { width: 130 }),
    // 44. peMth
    createGLFieldGroup('peMth', `PE Monthly ${currentYear}`, { width: 130, editable: false }),
    // 45. peYear
    createGLFieldGroup('peYear', `PE Annual ${currentYear}`, { width: 130, editable: false }),
    // 46. peSbMth
    createGLFieldGroup('peSbMth', `PE SB Monthly ${currentYear}`, { width: 130, editable: false }),
    // 47. peSbYear
    createGLFieldGroup('peSbYear', `PE SB Year ${currentYear}`, { width: 130, editable: false })
  ];

  // BIGC-specific columns - Ordered according to bigcOrderLE + bigcOrderBG from getBigcFieldConfig()
  const bigcColumns = [
    // ========== LE FIELDS (bigcOrderLE) ==========
    // 1. payrollLe
    createGLFieldGroup('payrollLe', `Payroll LE ${lastYear}`, { width: 130 }),
    // 2. premiumLe
    createGLFieldGroup('premiumLe', `Premium LE ${lastYear}`, { width: 120 }),
    // 3. totalPayrollLe
    createGLFieldGroup('totalPayrollLe', `Total Payroll LE ${lastYear}`, { width: 180 }),
    // 4. bonusLe
    createGLFieldGroup('bonusLe', `Bonus LE ${lastYear}`, { width: 120 }),
    // 5. fleetCardPeLe
    createGLFieldGroup('fleetCardPeLe', `Fleet Card PE LE ${lastYear}`, { width: 140 }),
    // 6. carAllowanceLe
    createGLFieldGroup('carAllowanceLe', `Car Allowance LE ${lastYear}`, { width: 130 }),
    // 7. licenseAllowanceLe
    createGLFieldGroup('licenseAllowanceLe', `License Allowance LE ${lastYear}`, { width: 140 }),
    // 8. housingAllowanceLe
    createGLFieldGroup('housingAllowanceLe', `Housing Allowance LE ${lastYear}`, { width: 140 }),
    // 9. gasolineAllowanceLe
    createGLFieldGroup('gasolineAllowanceLe', `Gasoline Allowance LE ${lastYear}`, { width: 140 }),
    // 10. wageStudentLe
    createGLFieldGroup('wageStudentLe', `Wage Student LE ${lastYear}`, { width: 140 }),
    // 11. carRentalPeLe
    createGLFieldGroup('carRentalPeLe', `Car Rental PE LE ${lastYear}`, { width: 140 }),
    // 12. skillPayAllowanceLe
    createGLFieldGroup('skillPayAllowanceLe', `Skill Pay Allowance LE ${lastYear}`, { width: 150 }),
    // 13. otherAllowanceLe
    createGLFieldGroup('otherAllowanceLe', `Other Allowance LE ${lastYear}`, { width: 140 }),
    // 14. socialSecurityLe
    createGLFieldGroup('socialSecurityLe', `Social Security LE ${lastYear}`, { width: 140 }),
    // 15. laborFundFeeLe
    createGLFieldGroup('laborFundFeeLe', `Labor Fund Fee LE ${lastYear}`, { width: 140 }),
    // 16. otherStaffBenefitLe
    createGLFieldGroup('otherStaffBenefitLe', `Other Staff Benefit LE ${lastYear}`, { width: 160 }),
    // 17. providentFundLe
    createGLFieldGroup('providentFundLe', `Provident Fund LE ${lastYear}`, { width: 140 }),
    // 18. employeeWelfareLe
    createGLFieldGroup('employeeWelfareLe', `Employee Welfare LE ${lastYear}`, { width: 150 }),
    // 19. provisionLe
    createGLFieldGroup('provisionLe', `Provision LE ${lastYear}`, { width: 130 }),
    // 20. interestLe
    createGLFieldGroup('interestLe', `Interest LE ${lastYear}`, { width: 120 }),
    // 21. staffInsuranceLe
    createGLFieldGroup('staffInsuranceLe', `Staff Insurance LE ${lastYear}`, { width: 140 }),
    // 22. medicalExpenseLe
    createGLFieldGroup('medicalExpenseLe', `Medical Expense LE ${lastYear}`, { width: 140 }),
    // 23. medicalInhouseLe
    createGLFieldGroup('medicalInhouseLe', `Medical Inhouse LE ${lastYear}`, { width: 150 }),
    // 24. trainingLe
    createGLFieldGroup('trainingLe', `Training LE ${lastYear}`, { width: 120 }),
    // 25. longServiceLe
    createGLFieldGroup('longServiceLe', `Long Service LE ${lastYear}`, { width: 130 }),
    // 26. peSbMthLe
    createGLFieldGroup('peSbMthLe', `PE SB Monthly LE ${lastYear}`, { width: 130, editable: false }),
    // 27. peSbYearLe
    createGLFieldGroup('peSbYearLe', `PE SB Year LE ${lastYear}`, { width: 160, editable: false }),

    // ========== BG FIELDS (bigcOrderBG) ==========
    // 1. payroll
    createGLFieldGroup('payroll', `Payroll ${currentYear}`, { width: 130 }),
    // 2. premium
    createGLFieldGroup('premium', `Premium ${currentYear}`, { width: 120 }),
    // 3. totalPayroll
    createGLFieldGroup('totalPayroll', `Total Payroll ${currentYear}`, { width: 180 }),
    // 4. bonus
    createGLFieldGroup('bonus', `Bonus ${currentYear}`, { width: 120 }),
    // 5. bonusTypes
    { headerName: "Bonus Type", field: "bonusTypes", sortable: true, filter: 'agTextColumnFilter', width: 120, editable: true },
    // 6. fleetCardPe
    createGLFieldGroup('fleetCardPe', `Fleet Card PE ${currentYear}`, { width: 140 }),
    // 7. carAllowance
    createGLFieldGroup('carAllowance', `Car Allowance ${currentYear}`, { width: 130 }),
    // 8. licenseAllowance
    createGLFieldGroup('licenseAllowance', `License Allowance ${currentYear}`, { width: 140 }),
    // 9. housingAllowance
    createGLFieldGroup('housingAllowance', `Housing Allowance ${currentYear}`, { width: 140 }),
    // 10. gasolineAllowance
    createGLFieldGroup('gasolineAllowance', `Gasoline Allowance ${currentYear}`, { width: 140 }),
    // 11. wageStudent
    createGLFieldGroup('wageStudent', `Wage Student ${currentYear}`, { width: 140 }),
    // 12. carRentalPe
    createGLFieldGroup('carRentalPe', `Car Rental PE ${currentYear}`, { width: 140 }),
    // 13. skillPayAllowance
    createGLFieldGroup('skillPayAllowance', `Skill Pay Allowance ${currentYear}`, { width: 150 }),
    // 14. otherAllowance
    createGLFieldGroup('otherAllowance', `Other Allowance ${currentYear}`, { width: 140 }),
    // 15. socialSecurity
    createGLFieldGroup('socialSecurity', `Social Security ${currentYear}`, { width: 140 }),
    // 16. laborFundFee
    createGLFieldGroup('laborFundFee', `Labor Fund Fee ${currentYear}`, { width: 140 }),
    // 17. otherStaffBenefit
    createGLFieldGroup('otherStaffBenefit', `Other Staff Benefit ${currentYear}`, { width: 160 }),
    // 18. providentFund
    createGLFieldGroup('providentFund', `Provident Fund ${currentYear}`, { width: 140 }),
    // 19. employeeWelfare
    createGLFieldGroup('employeeWelfare', `Employee Welfare ${currentYear}`, { width: 150 }),
    // 20. provision
    createGLFieldGroup('provision', `Provision ${currentYear}`, { width: 130 }),
    // 21. interest
    createGLFieldGroup('interest', `Interest ${currentYear}`, { width: 120 }),
    // 22. staffInsurance
    createGLFieldGroup('staffInsurance', `Staff Insurance ${currentYear}`, { width: 140 }),
    // 23. medicalExpense
    createGLFieldGroup('medicalExpense', `Medical Expense ${currentYear}`, { width: 140 }),
    // 24. medicalInhouse
    createGLFieldGroup('medicalInhouse', `Medical Inhouse ${currentYear}`, { width: 150 }),
    // 25. training
    createGLFieldGroup('training', `Training ${currentYear}`, { width: 120 }),
    // 26. longService
    createGLFieldGroup('longService', `Long Service ${currentYear}`, { width: 130 }),
    // 27. peSbMth
    createGLFieldGroup('peSbMth', `PE SB Monthly ${currentYear}`, { width: 130, editable: false }),
    // 28. peSbYear
    createGLFieldGroup('peSbYear', `PE SB Year ${currentYear}`, { width: 130, editable: false })
  ];

  const PeSummaryColumns = [
    {
      headerName: `Y ${lastYear} For Summary by cost center`,
      children: [
        createFieldDefinition('peMthLe', 'PE (Mth)', { width: 120, editable: false }),
        createFieldDefinition('peYearLe', 'PE (Year)', { width: 120, editable: false })
      ]
    },
    {
      headerName: `Y ${currentYear} For Summary by cost center`,
      children: [
        createFieldDefinition('peMth', 'PE (Mth)', { width: 120, editable: false }),
        createFieldDefinition('peYear', 'PE (Year)', { width: 120, editable: false })
      ]
    },
    { headerName: "Cost Center Plan", field: "costCenterPlan", sortable: true, filter: 'agTextColumnFilter', width: 130 },
    { headerName: "Salary Structure", field: "salaryStructure", sortable: true, filter: 'agTextColumnFilter', width: 130 },
    { headerName: "Runrate Code", field: "runrateCode", sortable: true, filter: 'agTextColumnFilter', width: 120 },
    { headerName: "Discount", field: "discount", sortable: true, filter: 'agTextColumnFilter', width: 100 },
    { headerName: "Executive", field: "executive", sortable: true, filter: 'agTextColumnFilter', width: 100 },
    { headerName: "Focus HC", field: "focusHc", sortable: true, filter: 'agTextColumnFilter', width: 100 },
    { headerName: "Focus PE", field: "focusPe", sortable: true, filter: 'agTextColumnFilter', width: 100 },
    { headerName: "Join PVF", field: "joinPvf", sortable: true, filter: 'agTextColumnFilter', width: 100 },
    { headerName: "PVF", field: "pvf", sortable: true, filter: 'agTextColumnFilter', width: 80 }
  ];

  // Determine which columns to return based on company ID with GL headers preserved
  // Note: bjcColumns and bigcColumns are already sorted according to their respective configs
  if (companyId === '1' || companyId === 1) {
    // console.log("Returning BJC columns (pre-sorted according to bjcOrderLE + bjcOrderBG)");
    // BJC columns already ordered - no runtime sorting needed
    return [...baseColumns, ...bjcColumns, ...PeSummaryColumns];

  } else if (companyId === '2' || companyId === 2) {
    // console.log("Returning BIGC columns (pre-sorted according to bigcOrderLE + bigcOrderBG)");
    // BIGC columns already ordered - no runtime sorting needed
    return [...baseColumns, ...bigcColumns, ...PeSummaryColumns];

  } else {
    // Return all columns for mixed company view or when no specific company is selected
    // console.log("Returning all columns (mixed view)");
    return [...baseColumns, ...bjcColumns, ...bigcColumns, ...PeSummaryColumns];
  }
}

// Function to create master grid columns
function createMasterGridColumns() {
  return [
    {
      headerName: `Cost Center (LE ${LastYear()})`,
      children: [
        { headerName: `Code`, field: "costCenterCode", sortable: true, filter: 'agTextColumnFilter', width: 120, pinned: 'left' },
        { headerName: `Name`, field: "costCenterName", sortable: true, filter: 'agTextColumnFilter', width: 180, pinned: 'left' }
      ]
    },
    { headerName: "Division", field: "division", sortable: true, filter: 'agTextColumnFilter', width: 180, pinned: 'left' },
    { headerName: "RunRateGroup", field: "runRateGroup", sortable: true, filter: 'agTextColumnFilter', width: 180 },
    { headerName: "Discount", field: "discount", sortable: true, filter: 'agTextColumnFilter', width: 120 },
    { headerName: "Total Emp", field: "totalEmployees", sortable: true, filter: 'agNumberColumnFilter', width: 120 },
    { headerName: "Active", field: "activeCount", sortable: true, filter: 'agNumberColumnFilter', width: 100 },
    { headerName: "Vacant", field: "vacantCount", sortable: true, filter: 'agNumberColumnFilter', width: 100 },
    { headerName: "New", field: "newCount", sortable: true, filter: 'agNumberColumnFilter', width: 100 },
    { headerName: "On Process", field: "onProcessCount", sortable: true, filter: 'agNumberColumnFilter', width: 120 }
  ];
}

// Function to create detail grid columns
function createDetailGridColumns() {
  return [
    {
      headerName: `Employee`,
      children: [
        { headerName: "ID", field: "empCode", sortable: true, filter: 'agTextColumnFilter', width: 120, suppressSizeToFit: true, pinned: 'left' },
        {
          headerName: "Status",
          field: "empStatus",
          sortable: true,
          filter: 'agTextColumnFilter',
          width: 120,
          suppressSizeToFit: true,
          pinned: 'left',
          cellRenderer: params => {
            if (!params.value) return '';
            const status = params.value.toLowerCase();
            let badgeClass = '';

            if (status === 'active') {
              badgeClass = 'text-bg-core';
            } else if (status === 'on process') {
              badgeClass = 'text-bg-warning';
            } else if (status === 'vacancy') {
              badgeClass = 'text-bg-secondary';
            } else if (status === 'new join') {
              badgeClass = 'text-bg-info';
            } else {
              badgeClass = 'badge text-muted';
            }

            return `<span class="${badgeClass}">${params.value}</span>`;
          }
        }
      ]
    },
    { headerName: "Title", field: "titleTh", sortable: true, filter: 'agTextColumnFilter', width: 100, pinned: 'left' },
    { headerName: "Name", field: "fnameTh", sortable: true, filter: 'agTextColumnFilter', width: 150, pinned: 'left' },
    { headerName: "Lastname", field: "lnameTh", sortable: true, filter: 'agTextColumnFilter', width: 150, pinned: 'left' },
    { headerName: "Position", field: "positionName", sortable: true, filter: 'agTextColumnFilter', width: 170 },
    { headerName: "Job Band", field: "jobBand", sortable: true, filter: 'agTextColumnFilter', width: 110 },
    { headerName: "Join Date", field: "joinDate", sortable: true, filter: 'agDateColumnFilter', width: 120 },
    { headerName: "Company", field: "companyCode", sortable: true, filter: 'agTextColumnFilter', width: 150 },
    { headerName: "COBU", field: "cobu", sortable: true, filter: 'agTextColumnFilter', width: 150 },
    { headerName: "Division", field: "division", sortable: true, filter: 'agTextColumnFilter', width: 150 },
    { headerName: "Department", field: "department", sortable: true, filter: 'agTextColumnFilter', width: 150 },
    { headerName: "Section", field: "section", sortable: true, filter: 'agTextColumnFilter', width: 150 },
    { headerName: "Store Name", field: "storeName", sortable: true, filter: 'agTextColumnFilter', width: 150 }
  ];
}

// Function to create benefist grid columns
function createBenefitsGridColumns() {
  return [
    { headerName: "Benefit Type", field: "benefitType", sortable: true, filter: 'agTextColumnFilter', width: 250 },
    {
      headerName: `LE ${LastYear()}`,
      children: [
        {
          headerName: "Amount",
          field: "leAmount",
          sortable: true,
          filter: 'agTextColumnFilter',
          width: 150,
          valueFormatter: params => {
            // Smart formatting: Check if this is a text field (Bonus Type) or numeric field
            const benefitType = params.data?.benefitType;
            if (benefitType && (benefitType.includes('Bonus Type') || benefitType.includes('Bonus Types'))) {
              // Display as text for Bonus Type fields
              return params.value || '-';
            }
            // Display as formatted number for other fields
            return formatNumber(params.value);
          }
        }
      ]
    },
    {
      headerName: `Budget ${getCurrentYear()}`,
      children: [
        {
          headerName: "Amount",
          field: "budgetAmount",
          sortable: true,
          filter: 'agTextColumnFilter',
          width: 150,
          valueFormatter: params => {
            // Smart formatting: Check if this is a text field (Bonus Type) or numeric field
            const benefitType = params.data?.benefitType;
            if (benefitType && (benefitType.includes('Bonus Type') || benefitType.includes('Bonus Types'))) {
              // Display as text for Bonus Type fields
              return params.value || '-';
            }
            // Display as formatted number for other fields
            return formatNumber(params.value);
          }
        }
      ]
    }
  ]
}

// Initialize main budget grid with company type detection
function initializeBudgetGrid(companyId = null) {
  const gridOptions = {
    columnDefs: createColumnData(companyId),
    defaultColDef: GRID_DEFAULT_OPTIONS,
    rowSelection: 'single',
    onSelectionChanged: onBudgetSelectionChanged,
    rowData: []
  };

  const api = agGrid.createGrid(document.getElementById('budgetAGGrid'), gridOptions);
  // Set global grid API
  if (window.setGridApi) {
    window.setGridApi(api);
  }
  return api;
}

// Initialize master grid
function initializeMasterGrid() {
  const masterGridOptions = {
    columnDefs: createMasterGridColumns(),
    defaultColDef: GRID_DEFAULT_OPTIONS,
    rowSelection: 'single',
    onSelectionChanged: onMasterSelectionChanged,
    rowData: []
  };

  const api = agGrid.createGrid(document.getElementById('masterGrid'), masterGridOptions);
  // Set global master grid API
  if (window.setMasterGridApi) {
    window.setMasterGridApi(api);
  }
  return api;
}

// Initialize detail grid
function initializeDetailGrid() {
  const detailGridOptions = {
    columnDefs: createDetailGridColumns(),
    defaultColDef: GRID_DEFAULT_OPTIONS,
    rowSelection: 'single',
    onSelectionChanged: onDetailSelectionChanged,
    rowData: []
  };

  const api = agGrid.createGrid(document.getElementById('detailGrid'), detailGridOptions);
  // Set global detail grid API
  if (window.setDetailGridApi) {
    window.setDetailGridApi(api);
  }
  return api;
}

// Function to update grid columns when year changes or company type changes
function updateGridColumns(companyId = null) {
  // Get grid APIs from global functions
  const gridApi = window.getGridApi ? window.getGridApi() : null;
  const masterGridApi = window.getMasterGridApi ? window.getMasterGridApi() : null;
  const detailGridApi = window.getDetailGridApi ? window.getDetailGridApi() : null;
  const benefitsGridApi = window.getBenefitsGridApi ? window.getBenefitsGridApi() : null;

  // Update budget grid columns with company type support
  if (window.budgetAGGrid && gridApi) {
    gridApi.setGridOption('columnDefs', createColumnData(companyId));
  }

  // Update master grid columns with new year
  if (window.masterGrid && masterGridApi) {
    masterGridApi.setGridOption('columnDefs', createMasterGridColumns());
  }

  // Update detail grid columns with new year
  if (window.detailGrid && detailGridApi) {
    detailGridApi.setGridOption('columnDefs', createDetailGridColumns());
  }

  // Update benefits grid columns with new year
  if (window.benefitsGrid && benefitsGridApi) {
    benefitsGridApi.setGridOption('columnDefs', createBenefitsGridColumns());
  }
}

// Function to detect company type from data or selection
function detectCompanyType(data) {
  if (!data || data.length === 0) return null;

  // Check the first row for company indicators
  const firstRow = data[0];

  // Check if BJC-specific fields exist
  if (firstRow.salWithEn !== undefined || firstRow.salNotEn !== undefined ||
    firstRow.salesManagementPc !== undefined || firstRow.shelfStackingPc !== undefined) {
    return 'BJC';
  }

  // Check if BIGC-specific fields exist
  if (firstRow.totalPayroll !== undefined || firstRow.fleetCardPe !== undefined ||
    firstRow.skillPayAllowance !== undefined || firstRow.employeeWelfare !== undefined) {
    return 'BIGC';
  }

  // Check company code
  if (firstRow.companyCode === '1' || firstRow.companyCode === 'BJC') {
    return 'BJC';
  } else if (firstRow.companyCode === '2' || firstRow.companyCode === 'BIGC') {
    return 'BIGC';
  }

  return null; // Mixed or unknown
}

// Function to update grid based on company type
function updateGridForCompany(companyId) {
  updateGridColumns(companyId);

  // Update any UI elements that might need to change based on company
  const companyIndicator = document.getElementById('currentCompanyType');
  if (companyIndicator) {
    let companyText = 'Mixed Companies';
    if (companyId === '1' || companyId === 1) {
      companyText = 'BJC Company';
    } else if (companyId === '2' || companyId === 2) {
      companyText = 'BIGC Company';
    }
    companyIndicator.textContent = companyText;
  }
}

// Function to refresh grid columns when company filter changes
function refreshGridForCompanyFilter() {
  const companyFilter = document.getElementById('companyFilter');
  const companyId = companyFilter ? companyFilter.value : null;

  // console.log("Company filter changed to:", companyId);

  // Update grid columns based on new company filter
  updateGridColumns(companyId);

  // Update UI indicators
  updateGridForCompany(companyId);
}

// Helper function for currency formatting
function formatCurrency(value) {
  if (value == null || value === '') return '';
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return value;
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numValue);
}

// Handle Budget grid selection change
function onBudgetSelectionChanged() {
  // console.log('Budget grid selection changed event triggered');

  // เช็คว่าเป็นการคลิกปุ่ม Edit หรือไม่
  if (window.isEditButtonClicked) {
    // console.log('Edit button clicked - skipping benefits offcanvas');
    window.isEditButtonClicked = false; // รีเซ็ต flag
    return;
  }

  // เช็คว่า offcanvasAddRow เปิดอยู่หรือไม่
  const offcanvasAddRow = document.getElementById('offcanvasAddRow');
  if (offcanvasAddRow && offcanvasAddRow.classList.contains('show')) {
    // console.log('offcanvasAddRow is open - skipping benefits offcanvas');
    return;
  }

  const budgetGridApi = window.getGridApi ? window.getGridApi() : null;
  if (!budgetGridApi) {
    // console.warn('Budget grid API not found');
    return;
  }

  const selectedRows = budgetGridApi.getSelectedRows();
  // console.log('Selected rows count:', selectedRows.length);

  if (selectedRows.length > 0) {
    const selectedBudgetRow = selectedRows[0];
    // console.log('Selected budget row:', selectedBudgetRow);
    // console.log('Employee Code:', selectedBudgetRow.empCode);
    // console.log('Employee Name:', selectedBudgetRow.fnameTh, selectedBudgetRow.lnameTh);

    // Show benefits offcanvas when a budget row is selected (not via edit button)
    showBenefitsOffcanvas(selectedBudgetRow);
  } else {
    // console.log('No rows selected in budget grid');
  }
}

// Handle master grid selection change
function onMasterSelectionChanged() {
  const masterGridApi = window.getMasterGridApi ? window.getMasterGridApi() : null;
  const detailGridApi = window.getDetailGridApi ? window.getDetailGridApi() : null;

  if (!masterGridApi) return;

  const selectedRows = masterGridApi.getSelectedRows();
  if (selectedRows.length > 0) {
    selectedCostCenter = selectedRows[0];
    // console.log('Selected cost center:', selectedCostCenter);

    // Filter detail data based on selected cost center
    const filteredData = rawData.filter(item =>
      item.costCenterCode === selectedCostCenter.costCenterCode
    );

    // Update detail grid
    if (detailGridApi) {
      detailGridApi.setGridOption('rowData', filteredData);
    }

    // Scroll to detail grid after data is loaded
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const detailGridSection = document.querySelector('#detailGrid');
        if (detailGridSection) {
          smoothScrollToElement(detailGridSection);
        }
      });
    });
  }
}

// Handle detail grid selection change
function onDetailSelectionChanged() {
  const detailGridApi = window.getDetailGridApi ? window.getDetailGridApi() : null;
  if (!detailGridApi) return;

  const selectedRows = detailGridApi.getSelectedRows();
  if (selectedRows.length > 0) {
    const selectedDetailRow = selectedRows[0];
    console.log('Selected detail row:', selectedDetailRow);

    // Show benefits offcanvas when a detail row is selected
    showBenefitsOffcanvas(selectedDetailRow);
  }
}

// Show benefits offcanvas
function showBenefitsOffcanvas(selectedEmployee) {
  if (!selectedEmployee) {
    console.warn('No employee selected for benefits display');
    return;
  }

  console.log('Showing benefits for employee:', selectedEmployee);

  // Show loading overlay in offcanvas

  //setTimeout(() => {
  showOffcanvasLoading('Preparing Benefits Form...', 'offcanvasBenefits');
  //}, 500);

  // Initialize benefits grid if not already done
  initializeBenefitsGrid();

  // Load benefits data for the selected employee
  loadBenefitsData(selectedEmployee);

  // Show the offcanvas
  const offcanvasElement = document.getElementById('offcanvasBenefits');
  if (offcanvasElement) {
    const offcanvasInstance = getOffcanvasInstance(offcanvasElement);
    offcanvasInstance.show();

    // Update offcanvas title with employee info
    const offcanvasTitle = document.getElementById('offcanvasBenefitsLabel');
    if (offcanvasTitle) {
      offcanvasTitle.textContent = `Employee Benefits - ${selectedEmployee.fnameTh || ''} ${selectedEmployee.lnameTh || ''} (${selectedEmployee.empCode || ''})`;
    }

    setTimeout(() => {
      hideOffcanvasLoading('offcanvasBenefits');
    }, 1000);
  } else {
    // console.error('Benefits offcanvas element not found');
  }
}
// Initialize benefits grid
function initializeBenefitsGrid() {
  // Check if benefits grid is already initialized
  const existingApi = window.getBenefitsGridApi ? window.getBenefitsGridApi() : null;
  if (existingApi) {
    return existingApi;
  }

  const benefitsGridElement = document.getElementById('benefitsGrid');
  if (!benefitsGridElement) {
    // console.error('Benefits grid element not found');
    return null;
  }

  const benefitsGridOptions = {
    columnDefs: createBenefitsGridColumns(),
    defaultColDef: GRID_DEFAULT_OPTIONS,
    rowData: []
  };

  const api = agGrid.createGrid(benefitsGridElement, benefitsGridOptions);

  // Store the benefits grid API globally using setter function
  if (window.setBenefitsGridApi) {
    window.setBenefitsGridApi(api);
  } else {
    window.benefitsGridApi = api;
  }

  // console.log('Benefits grid initialized successfully');
  return api;
}

// Load benefits data for selected employee
function loadBenefitsData(selectedEmployee) {
  if (!selectedEmployee || !selectedEmployee.empCode) {
    // console.warn('Invalid employee data for benefits loading');
    return;
  }

  // console.log('Loading benefits data for employee:', selectedEmployee.empCode);

  // Show loading indicator in benefits grid
  const benefitsGridApi = window.getBenefitsGridApi ? window.getBenefitsGridApi() : null;
  if (benefitsGridApi) {
    benefitsGridApi.setGridOption('rowData', []);
    // You can add a loading overlay here if needed
  }

  // Call API to get benefits data
  window.fetchEmployeeBenefits(selectedEmployee)
    .then(data => {
      // console.log('Raw benefits data received from API:', data);
      // console.log('Sample benefit item structure:', data && data.length > 0 ? data[0] : 'No data');

      const benefitsGridApi = window.getBenefitsGridApi ? window.getBenefitsGridApi() : null;
      if (benefitsGridApi) {
        benefitsGridApi.setGridOption('rowData', data);
        // console.log('Benefits data loaded successfully for employee:', selectedEmployee.empCode);
      }
    })
    .catch(error => {
      console.error('Error loading benefits data:', error);
      // Show error message or fallback data
      const benefitsGridApi = window.getBenefitsGridApi ? window.getBenefitsGridApi() : null;
      if (benefitsGridApi) {
        benefitsGridApi.setGridOption('rowData', []);
      }
      // Optionally show user-friendly error message
      showWarningModal('Error', 'Failed to load employee benefits data. Please try again.');
    });
}

// Create master data from raw data
function createMasterData(data) {
  const masterMap = new Map();

  data.forEach(item => {
    const key = `${item.costCenterCode}_${item.grouping || ''}_${item.division || ''}`;
    if (!masterMap.has(key)) {
      masterMap.set(key, {
        costCenterCode: item.costCenterCode,
        costCenterName: item.costCenterName,
        division: item.division || '',
        runRateGroup: item.runrateCode || '',
        discount: item.discount || '',
        totalEmployees: 0,
        activeCount: 0,
        vacantCount: 0,
        newCount: 0,
        onProcessCount: 0
      });
    }

    const master = masterMap.get(key);
    master.totalEmployees++;

    // Count by status (adjust based on your status values)
    if (item.empStatus === 'Active') {
      master.activeCount++;
    } else if (item.empStatus === 'Vacant') {
      master.vacantCount++;
    } else if (item.empStatus === 'New') {
      master.newCount++;
    } else if (item.empStatus === 'On Process') {
      master.onProcessCount++;
    }
  });

  // Convert to array and sort by Cost Center Code
  const masterArray = Array.from(masterMap.values());
  return masterArray.sort((a, b) => {
    // Sort by costCenterCode alphabetically
    return a.costCenterCode.localeCompare(b.costCenterCode);
  });
}

// Company Field Configuration Functions (from Documentation)
function getBjcFieldConfig() {
  // Database field names for BJC (no more frontend mapping needed)
  const bjcOrderLE = [
    'payrollLe', 'premiumLe', 'salWithEnLe', 'salNotEnLe', 'bonusTypeLe', 'bonusLe', 'salTempLe',
    'socialSecurityTmpLe', 'southriskAllowanceTmpLe', 'carMaintenanceTmpLe', 'salesManagementPcLe',
    'shelfStackingPcLe', 'diligenceAllowancePcLe', 'postAllowancePcLe', 'phoneAllowancePcLe',
    'transportationPcLe', 'skillAllowancePcLe', 'otherAllowancePcLe', 'temporaryStaffSalLe',
    'socialSecurityLe', 'providentFundLe', 'workmenCompensationLe', 'housingAllowanceLe',
    'salesCarAllowanceLe', 'accommodationLe', 'carMaintenanceLe', 'southriskAllowanceLe',
    'mealAllowanceLe', 'otherLe', 'othersSubjectTaxLe', 'carAllowanceLe', 'licenseAllowanceLe',
    'outsourceWagesLe', 'compCarsGasLe', 'compCarsOtherLe', 'carRentalLe', 'carGasolineLe',
    'carRepairLe', 'medicalOutsideLe', 'medicalInhouseLe', 'staffActivitiesLe', 'uniformLe',
    'lifeInsuranceLe', 'peMthLe', 'peYearLe', 'peSbMthLe', 'peSbYearLe'
  ];

  const bjcOrderBG = [
    'payroll', 'premium', 'salWithEn', 'salNotEn', 'bonusType', 'bonus', 'salTemp',
    'socialSecurityTmp', 'southriskAllowanceTmp', 'carMaintenanceTmp', 'salesManagementPc',
    'shelfStackingPc', 'diligenceAllowancePc', 'postAllowancePc', 'phoneAllowancePc',
    'transportationPc', 'skillAllowancePc', 'otherAllowancePc', 'temporaryStaffSal',
    'socialSecurity', 'providentFund', 'workmenCompensation', 'housingAllowance',
    'salesCarAllowance', 'accommodation', 'carMaintenance', 'southriskAllowance',
    'mealAllowance', 'other', 'othersSubjectTax', 'carAllowance', 'licenseAllowance',
    'outsourceWages', 'compCarsGas', 'compCarsOther', 'carRental', 'carGasoline',
    'carRepair', 'medicalOutside', 'medicalInhouse', 'staffActivities', 'uniform',
    'lifeInsurance', 'peMth', 'peYear', 'peSbMth', 'peSbYear'
  ];

  const bjcMapping = window.BJC_GL_MAPPING || {};

  return {
    company: 'BJC',
    useCustomOrder: true,
    orderConfigLE: bjcOrderLE,
    orderConfigBG: bjcOrderBG,
    orderConfigSummary: [...bjcOrderLE, ...bjcOrderBG],
    glMapping: bjcMapping,

    // Field display with GL numbers
    getFieldLabel: function (fieldId) {
      const baseLabel = this.getBaseLabel(fieldId);
      const glNumber = bjcMapping[fieldId];
      return glNumber ? `${baseLabel} [GL: ${glNumber}]` : baseLabel;
    },

    // Custom ordering function
    orderFields: function (fields, type = 'LE') {
      let orderConfig;
      switch (type.toUpperCase()) {
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
        const indexA = orderConfig.indexOf(a.field || a.id);
        const indexB = orderConfig.indexOf(b.field || b.id);

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
}

function getBigcFieldConfig() {
  // Database field names for BIGC (no more frontend mapping needed)
  const bigcOrderLE = [
    'payrollLe', 'premiumLe', 'totalPayrollLe', 'bonusLe', 'fleetCardPeLe', 'carAllowanceLe',
    'licenseAllowanceLe', 'housingAllowanceLe', 'gasolineAllowanceLe', 'wageStudentLe',
    'carRentalPeLe', 'skillPayAllowanceLe', 'otherAllowanceLe', 'socialSecurityLe',
    'laborFundFeeLe', 'otherStaffBenefitLe', 'providentFundLe', 'employeeWelfareLe',
    'provisionLe', 'interestLe', 'staffInsuranceLe', 'medicalExpenseLe', 'medicalInhouseLe',
    'trainingLe', 'longServiceLe', 'peSbMthLe', 'peSbYearLe'
  ];

  const bigcOrderBG = [
    'payroll', 'premium', 'totalPayroll', 'bonus', 'bonusTypes', 'fleetCardPe', 'carAllowance',
    'licenseAllowance', 'housingAllowance', 'gasolineAllowance', 'wageStudent',
    'carRentalPe', 'skillPayAllowance', 'otherAllowance', 'socialSecurity',
    'laborFundFee', 'otherStaffBenefit', 'providentFund', 'employeeWelfare',
    'provision', 'interest', 'staffInsurance', 'medicalExpense', 'medicalInhouse',
    'training', 'longService', 'peSbMth', 'peSbYear'
  ];

  const bigcMapping = window.BIGC_GL_MAPPING || {};

  return {
    company: 'BIGC',
    useCustomOrder: true,
    orderConfigLE: bigcOrderLE,
    orderConfigBG: bigcOrderBG,
    orderConfigSummary: [...bigcOrderLE, ...bigcOrderBG],
    glMapping: bigcMapping,

    // Field display with GL numbers
    getFieldLabel: function (fieldId) {
      const baseLabel = this.getBaseLabel(fieldId);
      const glNumber = bigcMapping[fieldId];
      return glNumber ? `${baseLabel} [GL: ${glNumber}]` : baseLabel;
    },

    // Custom ordering function
    orderFields: function (fields, type = 'LE') {
      let orderConfig;
      switch (type.toUpperCase()) {
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
        const indexA = orderConfig.indexOf(a.field || a.id);
        const indexB = orderConfig.indexOf(b.field || b.id);

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
}

// Validation function to ensure Documentation compliance
function validateFieldsAgainstDocumentation(companyId, fields) {
  // Define expected database field names directly (no more frontend field mapping needed)
  const expectedBjcFields = [
    // BJC LE Fields (47 fields) - includes both PE and PE_SB fields
    'payrollLe', 'premiumLe', 'salWithEnLe', 'salNotEnLe', 'bonusTypeLe', 'bonusLe', 'salTempLe',
    'socialSecurityTmpLe', 'southriskAllowanceTmpLe', 'carMaintenanceTmpLe', 'salesManagementPcLe',
    'shelfStackingPcLe', 'diligenceAllowancePcLe', 'postAllowancePcLe', 'phoneAllowancePcLe',
    'transportationPcLe', 'skillAllowancePcLe', 'otherAllowancePcLe', 'temporaryStaffSalLe',
    'socialSecurityLe', 'providentFundLe', 'workmenCompensationLe', 'housingAllowanceLe',
    'salesCarAllowanceLe', 'accommodationLe', 'carMaintenanceLe', 'southriskAllowanceLe',
    'mealAllowanceLe', 'otherLe', 'othersSubjectTaxLe', 'carAllowanceLe', 'licenseAllowanceLe',
    'outsourceWagesLe', 'compCarsGasLe', 'compCarsOtherLe', 'carRentalLe', 'carGasolineLe',
    'carRepairLe', 'medicalOutsideLe', 'medicalInhouseLe', 'staffActivitiesLe', 'uniformLe',
    'lifeInsuranceLe', 'peMthLe', 'peYearLe', 'peSbMthLe', 'peSbYearLe',

    // BJC Budget Fields (47 fields) - includes both PE and PE_SB fields
    'payroll', 'premium', 'salWithEn', 'salNotEn', 'bonusType', 'bonus', 'salTemp',
    'socialSecurityTmp', 'southriskAllowanceTmp', 'carMaintenanceTmp', 'salesManagementPc',
    'shelfStackingPc', 'diligenceAllowancePc', 'postAllowancePc', 'phoneAllowancePc',
    'transportationPc', 'skillAllowancePc', 'otherAllowancePc', 'temporaryStaffSal',
    'socialSecurity', 'providentFund', 'workmenCompensation', 'housingAllowance',
    'salesCarAllowance', 'accommodation', 'carMaintenance', 'southriskAllowance',
    'mealAllowance', 'other', 'othersSubjectTax', 'carAllowance', 'licenseAllowance',
    'outsourceWages', 'compCarsGas', 'compCarsOther', 'carRental', 'carGasoline',
    'carRepair', 'medicalOutside', 'medicalInhouse', 'staffActivities', 'uniform',
    'lifeInsurance', 'peMth', 'peYear', 'peSbMth', 'peSbYear'
  ];

  const expectedBigcFields = [
    // BIGC LE Fields (27 fields)
    'payrollLe', 'premiumLe', 'totalPayrollLe', 'bonusLe', 'fleetCardPeLe', 'carAllowanceLe',
    'licenseAllowanceLe', 'housingAllowanceLe', 'gasolineAllowanceLe', 'wageStudentLe',
    'carRentalPeLe', 'skillPayAllowanceLe', 'otherAllowanceLe', 'socialSecurityLe',
    'laborFundFeeLe', 'otherStaffBenefitLe', 'providentFundLe', 'employeeWelfareLe',
    'provisionLe', 'interestLe', 'staffInsuranceLe', 'medicalExpenseLe', 'medicalInhouseLe',
    'trainingLe', 'longServiceLe', 'peSbMthLe', 'peSbYearLe',

    // BIGC Budget Fields (27 fields)
    'payroll', 'premium', 'totalPayroll', 'bonus', 'bonusTypes', 'fleetCardPe', 'carAllowance',
    'licenseAllowance', 'housingAllowance', 'gasolineAllowance', 'wageStudent',
    'carRentalPe', 'skillPayAllowance', 'otherAllowance', 'socialSecurity',
    'laborFundFee', 'otherStaffBenefit', 'providentFund', 'employeeWelfare',
    'provision', 'interest', 'staffInsurance', 'medicalExpense', 'medicalInhouse',
    'training', 'longService', 'peSbMth', 'peSbYear'
  ];

  const expectedFields = companyId === '1' || companyId === 1 || companyId === 'BJC' ? expectedBjcFields : expectedBigcFields;
  const companyName = companyId === '1' || companyId === 1 || companyId === 'BJC' ? 'BJC' : 'BIGC';

  // console.log(`🔍 Validating ${companyName} fields against Database Entity Model:`);

  // Extract provided database field names directly
  const providedFieldIds = fields
    .map(field => field.field)
    .filter(fieldId => fieldId &&
      (fieldId.endsWith('Le') || (!fieldId.endsWith('Le') &&
        !['budgetId', 'costCenterCode', 'costCenterName', 'empCode', 'empStatus'].includes(fieldId)))
    );

  const missingFields = expectedFields.filter(expectedField => !providedFieldIds.includes(expectedField));
  const extraFields = providedFieldIds.filter(providedField => !expectedFields.includes(providedField));

  if (missingFields.length > 0) {
    // console.warn(`⚠️ Missing fields for ${companyName}:`, missingFields);
  }

  if (extraFields.length > 0) {
    // console.warn(`⚠️ Extra fields not in Database Entity for ${companyName}:`, extraFields);
  }

  const isCompliant = missingFields.length === 0 && extraFields.length === 0;
  // console.log(`${isCompliant ? '✅' : '❌'} Database Entity compliance: ${isCompliant ? 'PASSED' : 'FAILED'}`);
  // console.log(`📊 Expected: ${expectedFields.length}, Provided: ${providedFieldIds.length}`);

  return {
    isCompliant,
    missingFields,
    extraFields,
    totalExpected: expectedFields.length,
    totalProvided: providedFieldIds.length
  };
}

// Export functions to global scope for use by other modules
window.initializeBudgetGrid = initializeBudgetGrid;
window.initializeMasterGrid = initializeMasterGrid;
window.initializeDetailGrid = initializeDetailGrid;
window.updateGridColumns = updateGridColumns;
window.updateGridForCompany = updateGridForCompany;
window.refreshGridForCompanyFilter = refreshGridForCompanyFilter;
window.detectCompanyType = detectCompanyType;
window.onBudgetSelectionChanged = onBudgetSelectionChanged;
window.onMasterSelectionChanged = onMasterSelectionChanged;
window.onDetailSelectionChanged = onDetailSelectionChanged;
window.createMasterData = createMasterData;
window.createColumnData = createColumnData;
window.showBenefitsOffcanvas = showBenefitsOffcanvas;
window.initializeBenefitsGrid = initializeBenefitsGrid;
window.loadBenefitsData = loadBenefitsData;
window.formatCurrency = formatCurrency;

// New Documentation-compliant functions
window.getFieldHeaderWithGL = getFieldHeaderWithGL;
window.applyCustomFieldOrder = applyCustomFieldOrder;
window.createFieldDefinition = createFieldDefinition;
window.getBjcFieldConfig = getBjcFieldConfig;
window.getBigcFieldConfig = getBigcFieldConfig;
window.validateFieldsAgainstDocumentation = validateFieldsAgainstDocumentation;

// Benefits Grid API getter/setter functions
window.setBenefitsGridApi = function (api) {
  window.benefitsGridApi = api;
};

window.getBenefitsGridApi = function () {
  return window.benefitsGridApi;
};
