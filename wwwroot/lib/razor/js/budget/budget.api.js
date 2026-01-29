/**
 * Budget API Functions
 * Handles all API calls and data fetching operations
 */

function populateDropdown(elementId, apiUrl, defaultText, optionCallback, showSpinner = false, initOptions = null) {
  if (showSpinner && SPINNER_MAP[elementId]) {
    showDropdownSpinner(SPINNER_MAP[elementId]);
  }

  const prevSelectEl = document.getElementById(elementId);
  const prevValue = prevSelectEl ? prevSelectEl.value : '';
  // console.log(`Populating dropdown '${elementId}' from '${apiUrl}' with previous value: '${prevValue}'`);
  fetch(apiUrl)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(response => {
      // console.log(`Data received for ${elementId}:`, response);
      const select = document.getElementById(elementId);
      if (!select) {
        console.error(`Element with id '${elementId}' not found.`);
        return;
      }

      // Handle both array and { success, data } wrapper format
      const data = Array.isArray(response) ? response : (response.data || []);

      // ----- สร้าง options -----
      select.innerHTML = `<option value="">${defaultText}</option>`;
      data.forEach(item => {
        const option = document.createElement('option');
        if (optionCallback) {
          optionCallback(option, item);
        } else {
          option.value = item;
          option.textContent = item;
        }
        select.appendChild(option);
      });

      const $select = $(select);

      // ถ้าไม่มี select2 ก็แค่ trigger change
      if (typeof $select.select2 !== 'function') {
        $select.trigger('change');
        return;
      }

      // คอนเทนเนอร์ใน offcanvas (เพื่อแก้ z-index/clipping)
      //const $parent = $select.closest('.offcanvas-body');
      const $parent = $select.closest('.card-body');
      const dropdownParent = $parent.length ? $parent : null;

      // ---------- แก้ WARNING แบบเข้มข้น ----------
      // 1) ย้ายโฟกัสออกจาก select / select2 เดิม ไปยัง .offcanvas-body (focusable)
      //    เพื่อให้แน่ใจว่า element ที่จะถูกทำ aria-hidden ไม่มี descendant โฟกัสค้าง
      const focusSafe = dropdownParent ? dropdownParent[0] : document.body;
      const prevTabIndex = focusSafe.getAttribute('tabindex');
      if (!focusSafe.hasAttribute('tabindex')) focusSafe.setAttribute('tabindex', '-1');
      focusSafe.focus({ preventScroll: true });

      // 2) ปิด dropdown เดิม + destroy ถ้ามี
      if ($select.data('select2')) {
        try { $select.select2('close'); } catch (_) { }
        $select.select2('destroy');
      }

      // 3) init ใหม่ (หลังย้ายโฟกัสแล้ว)
      $select.select2({
        placeholder: defaultText,
        allowClear: true,
        width: '100%',
        dropdownParent: dropdownParent
      });

      // 4) กันไม่ให้ <select> เดิมโดนโฟกัส (แม้ select2 จะทำให้แล้ว เราบังคับซ้ำ)
      select.tabIndex = -1;
      select.setAttribute('aria-hidden', 'true'); // select2 ใส่ให้อยู่แล้ว แต่กรณี destroy/สร้างเร็ว เราย้ำ

      // 5) คืนค่าที่เลือก ถ้ามีในลิสต์ใหม่
      if (prevValue && $select.find(`option[value="${prevValue}"]`).length) {
        $select.val(prevValue).trigger('change.select2');
      } else {
        $select.trigger('change.select2');
      }

      // 6) โฟกัสไปยังกล่อง Select2 ใหม่ (ไม่ใช่ <select> เดิม) เพื่อ UX + กัน WARN ซ้ำ
      const s2Selection = $select.next('.select2').find('.select2-selection');
      if (s2Selection.length) {
        // ใช้ rAF เพื่อให้ DOM เสร็จจริง ๆ ก่อนโฟกัส
        requestAnimationFrame(() => s2Selection.trigger('focus'));
      }

      // คืนค่า tabindex ของ .offcanvas-body ถ้ามี
      if (prevTabIndex === null) {
        focusSafe.removeAttribute('tabindex');
      } else {
        focusSafe.setAttribute('tabindex', prevTabIndex);
      }
      // ---------- จบส่วนแก้ WARNING ----------

      // ⭐ NEW: Handle initialization options after dropdown population
      if (initOptions && typeof initOptions === 'object') {
        handleDropdownInitialization(elementId, initOptions, data);
      }
    })
    .catch(err => {
      console.error(`Error fetching data for ${elementId}:`, err);
    })
    .finally(() => {
      if (showSpinner && SPINNER_MAP[elementId]) {
        hideDropdownSpinner(SPINNER_MAP[elementId]);
      }
    });
}

/**
 * Handle initialization options after dropdown population
 * @param {string} elementId - The dropdown element ID
 * @param {Object} initOptions - Initialization options
 * @param {Array} data - The populated data
 */
function handleDropdownInitialization(elementId, initOptions, data) {
  console.log(`🔧 Handling initialization for ${elementId}:`, initOptions);

  // 🚀 PHASE 1: Quick Fix - Skip initialization for dynamic fields
  if (isDynamicField(elementId)) {
    console.log(`⚡ Dynamic field detected: ${elementId}, skipping subsystem initialization`);
    return;
  }

  // Extract options with defaults
  const {
    initializeSubsystems = false,
    setupRelationships = false,
    companyId = null,
    populateRelatedDropdowns = [],
    delay = 300
  } = initOptions;

  // Setup cascading dropdown relationships
  if (setupRelationships) {
    setTimeout(() => {
      if (typeof setupOffcanvasDropdownRelationships === 'function') {
        console.log('🔗 Setting up offcanvas dropdown relationships...');
        setupOffcanvasDropdownRelationships();
      }
    }, 100);
  }

  // Populate related dropdowns based on company selection
  if (companyId && populateRelatedDropdowns.length > 0) {
    setTimeout(() => {
      populateRelatedDropdowns.forEach(dropdownConfig => {
        const { elementId: targetId, updateFunction } = dropdownConfig;
        if (typeof updateFunction === 'function') {
          console.log(`🔄 Updating related dropdown: ${targetId}`);
          updateFunction(companyId);
        }
      });
    }, 200);
  }

  // Initialize subsystems (allocation, head count management, etc.)
  if (initializeSubsystems) {
    setTimeout(() => {
      console.log('🚀 Initializing subsystems...');

      // Initialize allocation management
      if (typeof initializeAllocationManagement === 'function') {
        console.log('📋 Initializing allocation management...');
        initializeAllocationManagement();
      }

      // Initialize offcanvas head count management
      if (typeof initializeOffcanvasHeadCountManagement === 'function') {
        console.log('👥 Initializing offcanvas head count management...');
        initializeOffcanvasHeadCountManagement();
      }

      // Initialize dynamic forms manager
      if (companyId && window.budgetDynamicFormsManager && window.budgetDynamicFormsManager.showCompanyFields) {
        console.log('📝 Initializing dynamic forms...');
        window.budgetDynamicFormsManager.showCompanyFields(companyId);
      }

      // Generate benefits templates
      if (companyId && window.benefitsTemplatesManager && window.benefitsTemplatesManager.generateTemplatesForCompany) {
        setTimeout(() => {
          console.log('💰 Generating benefits templates...');
          window.benefitsTemplatesManager.generateTemplatesForCompany(companyId);
        }, 500);
      }
    }, delay);
  }
}

/**
 * 🚀 PHASE 1: Quick Fix - Check if element ID is a dynamic field
 * @param {string} elementId - The element ID to check
 * @returns {boolean} - True if it's a dynamic field
 */
function isDynamicField(elementId) {
  // Dynamic Head Count Fields Pattern: offcanvas_headcount_1_empType, offcanvas_headcount_2_newPeriod, etc.
  if (elementId.includes('offcanvas_headcount_')) {
    return true;
  }

  // Future Dynamic Fields Patterns (ready for Phase 2+)
  if (elementId.includes('allocation_row_') ||
    elementId.includes('benefits_row_') ||
    elementId.includes('dynamic_')) {
    return true;
  }

  // Generic Pattern: anything with _number_ in the middle (e.g., prefix_1_fieldname)
  const dynamicPattern = /.*_\d+_\w+/;
  if (dynamicPattern.test(elementId)) {
    return true;
  }

  return false;
}



// Fetch companies data
async function fetchCompanies() {
  try {
    showDropdownSpinner('companySpinner');
    const response = await fetch(BUDGET_API.companies);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // console.log('Companies API Response:', data); // Debug log

    const companyFilter = $('#companyFilter');
    companyFilter.find('option:not(:first)').remove();

    // Handle different response structures
    if (Array.isArray(data) && data.length > 0) {
      data.forEach(company => {
        let companyText, companyValue;

        // Try different property names that might exist
        if (typeof company === 'string') {
          // If it's just a string array
          companyText = company;
          companyValue = company;
        } else if (company.companyCode && company.companyId) {
          // Original structure
          companyText = company.companyCode;
          companyValue = company.companyId;
        } else if (company.CompanyCode && company.CompanyId) {
          // Pascal case
          companyText = company.CompanyCode;
          companyValue = company.CompanyId;
        } else if (company.code && company.id) {
          // Generic structure
          companyText = company.code;
          companyValue = company.id;
        } else if (company.name && company.value) {
          // Name/value structure
          companyText = company.name;
          companyValue = company.value;
        } else {
          // Fallback - use first available property as both text and value
          const keys = Object.keys(company);
          companyText = company[keys[0]] || company;
          companyValue = company[keys[1]] || company[keys[0]] || company;
        }

        const option = new Option(companyText, companyValue);
        companyFilter.append(option);
      });
    } else {
      // console.warn('No companies data received or invalid format:', data);
    }

    companyFilter.select2({
      placeholder: 'All Companies',
      allowClear: true,
      width: '100%'
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
  } finally {
    hideDropdownSpinner('companySpinner');
  }
}

// Fetch budget data with parameters
async function fetchBudgetData(params) {
  try {
    showGridLoading();
    showPageLoading('Data...');

    const response = await fetch(`${BUDGET_API.budgets}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    // console.error('Error fetching budget data:', error);
    throw error;
  } finally {
    hideGridLoading();
    hidePageLoading();
  }
}

// Fetch COBU data for a company
async function fetchCoBU(companyID) {
  try {
    // Validate company ID
    if (!validateCompanySelection(companyID)) {
      throw new Error(getCompanyErrorMessage('INVALID_COMPANY', companyID));
    }

    showDropdownSpinner('formatSpinner');
    const response = await fetch(`${BUDGET_API.cobu}?companyID=${companyID}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    const cobuFilter = $('#cobuFilter');
    cobuFilter.find('option:not(:first)').remove();

    if (Array.isArray(data) && data.length > 0) {
      data.forEach(cobu => {
        const option = new Option(cobu, cobu);
        cobuFilter.append(option);
      });
    } else {
      // console.warn(`No COBU data available for company ${formatCompanyDisplayName(companyID)}`);
    }

    cobuFilter.select2({
      placeholder: 'All COBU',
      allowClear: true,
      width: '100%'
    });
  } catch (error) {
    console.error('Error fetching COBU:', error);
    showWarningModal(getCompanyErrorMessage('API_ERROR', companyID));
  } finally {
    hideDropdownSpinner('formatSpinner');
  }
}

// Legacy function name for backward compatibility
async function fetchEmpFormats(companyID) {
  return await fetchCoBU(companyID);
}

// Fetch budget years for a company
async function fetchBudgetYears(companyID) {
  try {
    // Validate company ID
    if (!validateCompanySelection(companyID)) {
      throw new Error(getCompanyErrorMessage('INVALID_COMPANY', companyID));
    }

    showDropdownSpinner('yearSpinner');
    const response = await fetch(`${BUDGET_API.budgetYears}?companyID=${companyID}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    const budgetYearsFilter = $('#yearsFilter');
    budgetYearsFilter.find('option:not(:first)').remove();

    if (Array.isArray(data) && data.length > 0) {
      data.forEach(year => {
        const option = new Option(year, year);
        budgetYearsFilter.append(option);
      });
    } else {
      // console.warn(`No budget years available for company ${formatCompanyDisplayName(companyID)}`);
    }

    budgetYearsFilter.select2({
      placeholder: 'All Budget Years',
      allowClear: true,
      width: '100%'
    });
  } catch (error) {
    console.error('Error fetching budget years:', error);
    showWarningModal(getCompanyErrorMessage('API_ERROR', companyID));
  } finally {
    hideDropdownSpinner('yearSpinner');
  }
}

// Generic fetch function for dropdown data
async function fetchDropdownData(apiEndpoint, params = {}) {
  try {
    const urlParams = new URLSearchParams(params);
    const url = urlParams.toString() ? `${apiEndpoint}?${urlParams.toString()}` : apiEndpoint;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // console.error(`Error fetching data from ${apiEndpoint}:`, error);
    throw error;
  }
}

// Fetch employee benefits from API
async function fetchEmployeeBenefits(selectedEmployee, options = {}) {
  try {
    // Extract empCode from selectedEmployee object or use as string (backward compatibility)
    const empCode = typeof selectedEmployee === 'object'
      ? (selectedEmployee?.empCode || selectedEmployee?.EmpCode)
      : selectedEmployee;

    //console.log('🔍 fetchEmployeeBenefits called with:', { selectedEmployee, empCode, options });

    // Detect current company and validate
    const company = detectCurrentCompany();
    if (!company.isValid) {
      throw new Error(company.error);
    }

    // Build query parameters using selectedEmployee data if available
    const companyID = selectedEmployee?.companyId || company.id;
    const cobu = getCurrentCoBU() || selectedEmployee?.cobu || null;
    const budgetYear = getCurrentBudgetYear() || selectedEmployee?.budgetYear || null;
    //console.log({ companyID, cobu, budgetYear });

    // Build parameters using standard function (avoid duplicate BudgetYear)
    const params = buildStandardApiParams({
      COBU: cobu
      // Don't pass BudgetYear here as buildStandardApiParams adds it automatically
    });

    // Add optional employee code filter
    if (empCode) {
      params.append('EmpCode', empCode);
    }

    //console.log(`🚀 API Call - Company: ${formatCompanyDisplayName(companyID)}, Employee: ${empCode}, Params:`, params.toString());

    const response = await fetch(`${BUDGET_API.budgets}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Since we now filter at the backend, we don't need to filter again at frontend
    // But we keep this for backward compatibility or fallback scenarios
    let filteredData = data;
    if (empCode && Array.isArray(data)) {
      filteredData = data.filter(item =>
        item.empCode === empCode ||
        item.EmpCode === empCode ||
        item.EmployeeCode === empCode
      );
    }
    //console.log(`Benefits data fetched for ${formatCompanyDisplayName(companyID)}:`, filteredData.length, 'items');
    // Transform API data to match benefits grid format based on company
    // BJC (Company ID = 1) vs BIGC (Company ID = 2) have different field structures
    let transformedData = [];

    if (filteredData.length > 0) {
      const data = filteredData[0];

      if (companyID === 1) {
        // BJC specific transformation - Complete field mapping
        transformedData = [
          // Core Salary Components
          { benefitType: 'Payroll LE', leAmount: data.payrollLe || 0, budgetAmount: data.payroll || 0 },
          { benefitType: 'Premium LE', leAmount: data.premiumLe || 0, budgetAmount: data.premium || 0 },
          { benefitType: 'Salary with EN LE', leAmount: data.salWithEnLe || 0, budgetAmount: data.salWithEn || 0 },
          { benefitType: 'Salary without EN LE', leAmount: data.salNotEnLe || 0, budgetAmount: data.salNotEn || 0 },
          { benefitType: 'Bonus Type LE', leAmount: data.bonusTypeLe || '', budgetAmount: data.bonusType || '' },
          { benefitType: 'Bonus LE', leAmount: data.bonusLe || 0, budgetAmount: data.bonus || 0 },
          { benefitType: 'Salary Temp LE', leAmount: data.salTempLe || 0, budgetAmount: data.salTemp || 0 },

          // Temporary Benefits
          { benefitType: 'Social Security Tmp LE', leAmount: data.socialSecurityTmpLe || 0, budgetAmount: data.socialSecurityTmp || 0 },
          { benefitType: 'Southrisk Allowance Tmp LE', leAmount: data.southriskAllowanceTmpLe || 0, budgetAmount: data.southriskAllowanceTmp || 0 },
          { benefitType: 'Car Maintenance Tmp LE', leAmount: data.carMaintenanceTmpLe || 0, budgetAmount: data.carMaintenanceTmp || 0 },

          // Performance Components (PC)
          { benefitType: 'Sales Management PC LE', leAmount: data.salesManagementPcLe || 0, budgetAmount: data.salesManagementPc || 0 },
          { benefitType: 'Shelf Stacking PC LE', leAmount: data.shelfStackingPcLe || 0, budgetAmount: data.shelfStackingPc || 0 },
          { benefitType: 'Diligence Allowance PC LE', leAmount: data.diligenceAllowancePcLe || 0, budgetAmount: data.diligenceAllowancePc || 0 },
          { benefitType: 'Post Allowance PC LE', leAmount: data.postAllowancePcLe || 0, budgetAmount: data.postAllowancePc || 0 },
          { benefitType: 'Phone Allowance PC LE', leAmount: data.phoneAllowancePcLe || 0, budgetAmount: data.phoneAllowancePc || 0 },
          { benefitType: 'Transportation PC LE', leAmount: data.transportationPcLe || 0, budgetAmount: data.transportationPc || 0 },
          { benefitType: 'Skill Allowance PC LE', leAmount: data.skillAllowancePcLe || 0, budgetAmount: data.skillAllowancePc || 0 },
          { benefitType: 'Other Allowance PC LE', leAmount: data.otherAllowancePcLe || 0, budgetAmount: data.otherAllowancePc || 0 },

          // Staff Benefits
          { benefitType: 'Temporary Staff Sal LE', leAmount: data.temporaryStaffSalLe || 0, budgetAmount: data.temporaryStaffSal || 0 },
          { benefitType: 'Social Security LE', leAmount: data.socialSecurityLe || 0, budgetAmount: data.socialSecurity || 0 },
          { benefitType: 'Provident Fund LE', leAmount: data.providentFundLe || 0, budgetAmount: data.providentFund || 0 },
          { benefitType: 'Workmen Compensation LE', leAmount: data.workmenCompensationLe || 0, budgetAmount: data.workmenCompensation || 0 },

          // Allowances
          { benefitType: 'Housing Allowance LE', leAmount: data.housingAllowanceLe || 0, budgetAmount: data.housingAllowance || 0 },
          { benefitType: 'Sales Car Allowance LE', leAmount: data.salesCarAllowanceLe || 0, budgetAmount: data.salesCarAllowance || 0 },
          { benefitType: 'Accommodation LE', leAmount: data.accommodationLe || 0, budgetAmount: data.accommodation || 0 },
          { benefitType: 'Car Maintenance LE', leAmount: data.carMaintenanceLe || 0, budgetAmount: data.carMaintenance || 0 },
          { benefitType: 'Southrisk Allowance LE', leAmount: data.southriskAllowanceLe || 0, budgetAmount: data.southriskAllowance || 0 },
          { benefitType: 'Meal Allowance LE', leAmount: data.mealAllowanceLe || 0, budgetAmount: data.mealAllowance || 0 },
          { benefitType: 'Other LE', leAmount: data.otherLe || 0, budgetAmount: data.other || 0 },
          { benefitType: 'Others Subject Tax LE', leAmount: data.othersSubjectTaxLe || 0, budgetAmount: data.othersSubjectTax || 0 },
          { benefitType: 'Car Allowance LE', leAmount: data.carAllowanceLe || 0, budgetAmount: data.carAllowance || 0 },
          { benefitType: 'License Allowance LE', leAmount: data.licenseAllowanceLe || 0, budgetAmount: data.licenseAllowance || 0 },

          // Outsource & Company Assets
          { benefitType: 'Outsource Wages LE', leAmount: data.outsourceWagesLe || 0, budgetAmount: data.outsourceWages || 0 },
          { benefitType: 'Comp Cars Gas LE', leAmount: data.compCarsGasLe || 0, budgetAmount: data.compCarsGas || 0 },
          { benefitType: 'Comp Cars Other LE', leAmount: data.compCarsOtherLe || 0, budgetAmount: data.compCarsOther || 0 },
          { benefitType: 'Car Rental LE', leAmount: data.carRentalLe || 0, budgetAmount: data.carRental || 0 },
          { benefitType: 'Car Gasoline LE', leAmount: data.carGasolineLe || 0, budgetAmount: data.carGasoline || 0 },
          { benefitType: 'Car Repair LE', leAmount: data.carRepairLe || 0, budgetAmount: data.carRepair || 0 },

          // Medical & Welfare
          { benefitType: 'Medical Outside LE', leAmount: data.medicalOutsideLe || 0, budgetAmount: data.medicalOutside || 0 },
          { benefitType: 'Medical Inhouse LE', leAmount: data.medicalInhouseLe || 0, budgetAmount: data.medicalInhouse || 0 },
          { benefitType: 'Staff Activities LE', leAmount: data.staffActivitiesLe || 0, budgetAmount: data.staffActivities || 0 },
          { benefitType: 'Uniform LE', leAmount: data.uniformLe || 0, budgetAmount: data.uniform || 0 },
          { benefitType: 'Life Insurance LE', leAmount: data.lifeInsuranceLe || 0, budgetAmount: data.lifeInsurance || 0 },

          // PE & Summary Fields
          { benefitType: 'PE SB Month LE', leAmount: data.peSbMthLe || 0, budgetAmount: data.peSbMth || 0 },
          { benefitType: 'PE SB Year LE', leAmount: data.peSbYearLe || 0, budgetAmount: data.peSbYear || 0 },
          { benefitType: 'PE Month LE', leAmount: data.peMthLe || 0, budgetAmount: data.peMth || 0 },
          { benefitType: 'PE Year LE', leAmount: data.peYearLe || 0, budgetAmount: data.peYear || 0 }
        ];
      } else if (companyID === 2) {
        // BIGC specific transformation - Complete field mapping
        transformedData = [
          // Core Salary Components
          { benefitType: 'Payroll LE', leAmount: data.payrollLe || 0, budgetAmount: data.payroll || 0 },
          { benefitType: 'Premium LE', leAmount: data.premiumLe || 0, budgetAmount: data.premium || 0 },
          { benefitType: 'Total Payroll LE', leAmount: data.totalPayrollLe || 0, budgetAmount: data.totalPayroll || 0 },
          { benefitType: 'Bonus LE', leAmount: data.bonusLe || 0, budgetAmount: data.bonus || 0 },
          { benefitType: 'Bonus Types', leAmount: '', budgetAmount: data.bonusTypes || '' },

          // BIGC Specific Allowances
          { benefitType: 'Fleet Card PE LE', leAmount: data.fleetCardPeLe || 0, budgetAmount: data.fleetCardPe || 0 },
          { benefitType: 'Car Allowance LE', leAmount: data.carAllowanceLe || 0, budgetAmount: data.carAllowance || 0 },
          { benefitType: 'License Allowance LE', leAmount: data.licenseAllowanceLe || 0, budgetAmount: data.licenseAllowance || 0 },
          { benefitType: 'Housing Allowance LE', leAmount: data.housingAllowanceLe || 0, budgetAmount: data.housingAllowance || 0 },
          { benefitType: 'Gasoline Allowance LE', leAmount: data.gasolineAllowanceLe || 0, budgetAmount: data.gasolineAllowance || 0 },
          { benefitType: 'Wage Student LE', leAmount: data.wageStudentLe || 0, budgetAmount: data.wageStudent || 0 },
          { benefitType: 'Car Rental PE LE', leAmount: data.carRentalPeLe || 0, budgetAmount: data.carRentalPe || 0 },
          { benefitType: 'Skill Pay Allowance LE', leAmount: data.skillPayAllowanceLe || 0, budgetAmount: data.skillPayAllowance || 0 },
          { benefitType: 'Other Allowance LE', leAmount: data.otherAllowanceLe || 0, budgetAmount: data.otherAllowance || 0 },

          // Benefits & Insurance
          { benefitType: 'Social Security LE', leAmount: data.socialSecurityLe || 0, budgetAmount: data.socialSecurity || 0 },
          { benefitType: 'Labor Fund Fee LE', leAmount: data.laborFundFeeLe || 0, budgetAmount: data.laborFundFee || 0 },
          { benefitType: 'Other Staff Benefit LE', leAmount: data.otherStaffBenefitLe || 0, budgetAmount: data.otherStaffBenefit || 0 },
          { benefitType: 'Provident Fund LE', leAmount: data.providentFundLe || 0, budgetAmount: data.providentFund || 0 },
          { benefitType: 'Employee Welfare LE', leAmount: data.employeeWelfareLe || 0, budgetAmount: data.employeeWelfare || 0 },
          { benefitType: 'Provision LE', leAmount: data.provisionLe || 0, budgetAmount: data.provision || 0 },
          { benefitType: 'Interest LE', leAmount: data.interestLe || 0, budgetAmount: data.interest || 0 },
          { benefitType: 'Staff Insurance LE', leAmount: data.staffInsuranceLe || 0, budgetAmount: data.staffInsurance || 0 },

          // Medical & Training
          { benefitType: 'Medical Expense LE', leAmount: data.medicalExpenseLe || 0, budgetAmount: data.medicalExpense || 0 },
          { benefitType: 'Medical Inhouse LE', leAmount: data.medicalInhouseLe || 0, budgetAmount: data.medicalInhouse || 0 },
          { benefitType: 'Training LE', leAmount: data.trainingLe || 0, budgetAmount: data.training || 0 },
          { benefitType: 'Long Service LE', leAmount: data.longServiceLe || 0, budgetAmount: data.longService || 0 },

          // PE & Summary Fields
          { benefitType: 'PE SB Month LE', leAmount: data.peSbMthLe || 0, budgetAmount: data.peSbMth || 0 },
          { benefitType: 'PE SB Year LE', leAmount: data.peSbYearLe || 0, budgetAmount: data.peSbYear || 0 },
          { benefitType: 'PE Month LE', leAmount: data.peMthLe || 0, budgetAmount: data.peMth || 0 },
          { benefitType: 'PE Year LE', leAmount: data.peYearLe || 0, budgetAmount: data.peYear || 0 }
        ];
      } else {
        // Fallback for unknown company or combined data
        transformedData = [
          {
            benefitType: 'Payroll',
            leAmount: data.payroll || 0,
            budgetAmount: data.payroll || 0
          },
          {
            benefitType: 'Bonus',
            leAmount: data.bonus || 0,
            budgetAmount: data.bonus || 0
          }
        ];
      }
    }

    // console.log(`Benefits data transformed for ${formatCompanyDisplayName(companyID)}:`, transformedData.length, 'items');
    return transformedData;
  } catch (error) {
    console.error('❌ Employee benefits API call failed:', error);
    const companyName = options.companyID ? formatCompanyDisplayName(options.companyID) : 'selected company';
    showWarningModal(`Failed to fetch employee benefits for ${companyName}: ${error.message}`);
    throw error;
  }
}

// Helper function to get selected company ID
function getSelectedCompanyID() {
  const companyFilter = document.getElementById('companyFilter');
  return companyFilter && companyFilter.value ? companyFilter.value : null;
}

// Helper function to get selected COBU
function getSelectedCoBU() {
  const cobuFilter = document.getElementById('cobuFilter');
  return cobuFilter && cobuFilter.value ? cobuFilter.value : null;
}

// Legacy function name for backward compatibility
function getSelectedEmpFormat() {
  return getSelectedCoBU();
}

// Helper function to validate company selection (Enhanced with core functions)
function validateCompanySelection(companyID) {
  const config = getCompanyConfig(companyID);
  if (!config) {
    return false;
  }
  return true;
}

// Helper function to build API parameters with company validation (Enhanced)
function buildApiParameters(baseParams = {}, companyID = null) {
  try {
    // Use current company if not specified
    const targetCompanyID = companyID || getSelectedCompanyID();

    if (!validateCompanySelection(targetCompanyID)) {
      throw new Error(getCompanyErrorMessage('INVALID_COMPANY', targetCompanyID));
    }

    // Use core function for standard parameter building
    return buildStandardApiParams(baseParams);
  } catch (error) {
    console.error('Error building API parameters:', error);
    throw error;
  }
}

// Export functions to global scope for use by other modules
window.populateDropdown = populateDropdown;
window.fetchCompanies = fetchCompanies;
window.fetchBudgetData = fetchBudgetData;
window.fetchCoBU = fetchCoBU;
window.fetchEmpFormats = fetchEmpFormats; // Legacy compatibility
window.fetchBudgetYears = fetchBudgetYears;
window.fetchDropdownData = fetchDropdownData;
window.fetchEmployeeBenefits = fetchEmployeeBenefits;
window.getSelectedCompanyID = getSelectedCompanyID;
window.getSelectedCoBU = getSelectedCoBU;
window.getSelectedEmpFormat = getSelectedEmpFormat; // Legacy compatibility
window.getCurrentYear = getCurrentYear;
window.validateCompanySelection = validateCompanySelection;
window.buildApiParameters = buildApiParameters;
