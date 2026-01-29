/**
 * PE Budget Dashboard Filter Functions
 * Handles filter cascade logic and dropdown updates
 * Adapted from budget.plan.filters.js for Dashboard use
 */

// ============================================================================
// Debounced Filter Update Functions
// ============================================================================

// Create debounced versions of filter update functions
const debouncedDashboardFilterUpdateCoBU = debounce(updateDashboardFilterCoBU, DASHBOARD_DEBOUNCE_DELAYS.cobu);
const debouncedDashboardFilterUpdateBudgetYears = debounce(updateDashboardFilterBudgetYears, DASHBOARD_DEBOUNCE_DELAYS.budgetYears);
const debouncedDashboardFilterUpdateCostCenters = debounce(updateDashboardFilterCostCenters, DASHBOARD_DEBOUNCE_DELAYS.costCenters);
const debouncedDashboardFilterUpdateDivisions = debounce(updateDashboardFilterDivisions, DASHBOARD_DEBOUNCE_DELAYS.divisions);
const debouncedDashboardFilterUpdateDepartments = debounce(updateDashboardFilterDepartments, DASHBOARD_DEBOUNCE_DELAYS.departments);
const debouncedDashboardFilterUpdateSections = debounce(updateDashboardFilterSections, DASHBOARD_DEBOUNCE_DELAYS.sections);
const debouncedDashboardFilterUpdateLocations = debounce(updateDashboardFilterLocations, DASHBOARD_DEBOUNCE_DELAYS.locations);
const debouncedDashboardFilterUpdatePositions = debounce(updateDashboardFilterPositions, DASHBOARD_DEBOUNCE_DELAYS.positions);
const debouncedDashboardFilterUpdateJobBands = debounce(updateDashboardFilterJobBands, DASHBOARD_DEBOUNCE_DELAYS.jobBands);
const debouncedDashboardFilterUpdateEmpStatuses = debounce(updateDashboardFilterEmpStatuses, DASHBOARD_DEBOUNCE_DELAYS.empStatuses);

// ============================================================================
// Filter Update Functions
// ============================================================================

/**
 * Update COBU filter
 */
function updateDashboardFilterCoBU(companyID) {
  if (typeof fetchCoBU === 'function') {
    fetchCoBU(companyID);
  }
}

/**
 * Update Budget Years filter
 */
function updateDashboardFilterBudgetYears(companyID) {
  if (typeof fetchBudgetYears === 'function') {
    fetchBudgetYears(companyID);
  }
}

/**
 * Update Cost Centers filter
 */
function updateDashboardFilterCostCenters() {
  try {
    const params = buildDashboardStandardApiParams();
    const query = params.toString() ? `?${params.toString()}` : '';

    fetch(`${BUDGET_API.costCenters}${query}`)
      .then(response => response.json())
      .then(data => {
        const filter = $('#costcenterFilter');
        filter.find('option:not(:first)').remove();
        data.forEach(costCenter => {
          const option = new Option(
            `${costCenter.costCenterName} (${costCenter.costCenterCode})`,
            costCenter.costCenterCode
          );
          filter.append(option);
        });
        filter.select2({
          placeholder: 'All Cost Centers',
          allowClear: true,
          width: '100%'
        });
      })
      .catch(error => {
        console.error('Error fetching cost centers:', error);
      });
  } catch (error) {
    console.error('Error in updateDashboardFilterCostCenters:', error);
  }
}

/**
 * Update Divisions filter
 */
function updateDashboardFilterDivisions() {
  const params = buildDashboardStandardApiParams();
  const query = params.toString() ? `?${params.toString()}` : '';

  fetch(`${BUDGET_API.divisions}${query}`)
    .then(response => response.json())
    .then(data => {
      const filter = $('#divisionFilter');
      filter.find('option:not(:first)').remove();
      data.forEach(division => {
        const option = new Option(division, division);
        filter.append(option);
      });
      filter.select2({
        placeholder: 'All Divisions',
        allowClear: true,
        width: '100%'
      });
    })
    .catch(error => {
      console.error('Error fetching divisions:', error);
    });
}

/**
 * Update Departments filter
 */
function updateDashboardFilterDepartments() {
  const params = buildDashboardStandardApiParams();
  const query = params.toString() ? `?${params.toString()}` : '';

  fetch(`${BUDGET_API.departments}${query}`)
    .then(response => response.json())
    .then(data => {
      const filter = $('#departmentFilter');
      filter.find('option:not(:first)').remove();
      data.forEach(department => {
        const option = new Option(department, department);
        filter.append(option);
      });
      filter.select2({
        placeholder: 'All Departments',
        allowClear: true,
        width: '100%'
      });
    })
    .catch(error => {
      console.error('Error fetching departments:', error);
    });
}

/**
 * Update Sections filter
 */
function updateDashboardFilterSections() {
  const params = buildDashboardStandardApiParams();
  const query = params.toString() ? `?${params.toString()}` : '';

  fetch(`${BUDGET_API.sections}${query}`)
    .then(response => response.json())
    .then(data => {
      const filter = $('#sectionFilter');
      filter.find('option:not(:first)').remove();
      data.forEach(section => {
        const option = new Option(section, section);
        filter.append(option);
      });
      filter.select2({
        placeholder: 'All Sections',
        allowClear: true,
        width: '100%'
      });
    })
    .catch(error => {
      console.error('Error fetching sections:', error);
    });
}

/**
 * Update Locations (Company/Store) filter
 */
function updateDashboardFilterLocations() {
  const params = buildDashboardStandardApiParams();
  const companyID = $('#companyFilter').val();
  const query = params.toString() ? `?${params.toString()}` : '';

  fetch(`${BUDGET_API.storeNames}${query}`)
    .then(response => response.json())
    .then(data => {
      const filter = $('#compstoreFilter');
      filter.find('option:not(:first)').remove();

      // Dynamic placeholder based on company
      const companyIdInt = parseInt(companyID);
      const isBJC = companyIdInt === 1;
      const placeholderText = isBJC ? 'All Company names' : 'All Store names';

      // Update the first option text
      const firstOption = filter.find('option:first');
      if (firstOption.length) {
        firstOption.text(placeholderText);
      }

      data.forEach(storeName => {
        const option = new Option(storeName, storeName);
        filter.append(option);
      });
      filter.select2({
        placeholder: placeholderText,
        allowClear: true,
        width: '100%'
      });
    })
    .catch(error => {
      console.error('Error fetching store names:', error);
    });
}

/**
 * Update Positions filter
 */
function updateDashboardFilterPositions() {
  const params = buildDashboardStandardApiParams();
  const query = params.toString() ? `?${params.toString()}` : '';

  fetch(`${BUDGET_API.positions}${query}`)
    .then(response => response.json())
    .then(data => {
      const filter = $('#positionFilter');
      filter.find('option:not(:first)').remove();
      data.forEach(position => {
        const option = new Option(
          `${position.positionName} (${position.positionCode})`,
          position.positionCode
        );
        filter.append(option);
      });
      filter.select2({
        placeholder: 'All Positions',
        allowClear: true,
        width: '100%'
      });
    })
    .catch(error => {
      console.error('Error fetching positions:', error);
    });
}

/**
 * Update Job Bands filter
 */
function updateDashboardFilterJobBands() {
  const params = buildDashboardStandardApiParams();
  const query = params.toString() ? `?${params.toString()}` : '';

  fetch(`${BUDGET_API.jobBands}${query}`)
    .then(response => response.json())
    .then(data => {
      const filter = $('#jobbandFilter');
      filter.find('option:not(:first)').remove();
      data.forEach(jobBand => {
        const option = new Option(jobBand, jobBand);
        filter.append(option);
      });
      filter.select2({
        placeholder: 'All Job Bands',
        allowClear: true,
        width: '100%'
      });
    })
    .catch(error => {
      console.error('Error fetching job bands:', error);
    });
}

/**
 * Update Employee Statuses filter
 */
function updateDashboardFilterEmpStatuses(companyID) {
  fetch(`${BUDGET_API.empStatuses}?companyID=${companyID}`)
    .then(response => response.json())
    .then(data => {
      const filter = $('#empstatusFilter');
      filter.find('option:not(:first)').remove();
      data.forEach(empStatus => {
        const option = new Option(empStatus, empStatus);
        filter.append(option);
      });
      filter.select2({
        placeholder: 'All Employee Statuses',
        allowClear: true,
        width: '100%'
      });
    })
    .catch(error => {
      console.error('Error fetching employee statuses:', error);
    });
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Build standard API parameters from current filter values
 */
function buildDashboardStandardApiParams() {
  const params = new URLSearchParams();

  const companyID = $('#companyFilter').val();
  const cobu = $('#cobuFilter').val();
  const budgetYear = $('#yearsFilter').val();
  const costCenterCode = $('#costcenterFilter').val();
  const divisionCode = $('#divisionFilter').val();
  const departmentCode = $('#departmentFilter').val();
  const sectionCode = $('#sectionFilter').val();
  const locationCode = $('#compstoreFilter').val();
  const empStatus = $('#empstatusFilter').val();
  const positionCode = $('#positionFilter').val();

  if (companyID) params.append('companyID', companyID);
  if (cobu) params.append('coBu', cobu);
  if (budgetYear) params.append('budgetYear', budgetYear);
  if (costCenterCode) params.append('costCenterCode', costCenterCode);
  if (divisionCode) params.append('divisionCode', divisionCode);
  if (departmentCode) params.append('departmentCode', departmentCode);
  if (sectionCode) params.append('sectionCode', sectionCode);
  if (locationCode) params.append('orgUnitName', locationCode);
  if (empStatus) params.append('empStatus', empStatus);
  if (positionCode) params.append('positionCode', positionCode);

  return params;
}

// ============================================================================
// Filter Initialization
// ============================================================================

/**
 * Initialize dashboard filters using BudgetPlanning system
 */
function initializeDashboardFilters() {
  console.log('Initializing PE Budget Dashboard Filters...');

  // Call initializeFilters from budget.plan.filters.js
  if (typeof initializeFilters === 'function') {
    initializeFilters();
  } else {
    console.error('initializeFilters function not found. Make sure budget.plan.filters.js is loaded.');
  }

  // 🔒 Use Dashboard-specific Companies API (with CompanyAccess filtering)
  fetchDashboardCompanies();

  // Setup filter change listeners for dashboard
  setupDashboardFilterListeners();

  // Setup filter cascade relationships
  setupDashboardFilterCascadeRelationships();
}

/**
 * 🔒 Fetch Companies filtered by user's CompanyAccess
 * Uses /api/Summary/DashCompanies instead of /api/Budget/B0Companies
 */
async function fetchDashboardCompanies() {
  try {
    console.log('Fetching Dashboard Companies (with CompanyAccess filter)...');
    const response = await fetch(DASHBOARD_API.dashCompanies);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Dashboard Companies API Response:', data);

    const companyFilter = $('#companyFilter');
    companyFilter.find('option:not(:first)').remove();

    if (Array.isArray(data) && data.length > 0) {
      data.forEach(company => {
        const companyText = company.companyCode || company.companyName || company;
        const companyValue = company.companyId || company;
        companyFilter.append(new Option(companyText, companyValue));
      });

      // Auto-select first company if only one is available
      if (data.length === 1) {
        companyFilter.val(data[0].companyId).trigger('change');
        console.log('Auto-selected single company:', data[0].companyCode);
      }
    } else {
      console.warn('No companies available for this user');
    }

    companyFilter.select2({
      placeholder: 'Select Company',
      allowClear: true,
      width: '100%'
    });

    console.log('Dashboard Companies loaded:', data.length);
  } catch (error) {
    console.error('Error fetching Dashboard Companies:', error);
  }
}

/**
 * Setup filter change listeners for dashboard-specific behavior
 */
function setupDashboardFilterListeners() {
  // Company filter change
  $('#companyFilter').on('change', function () {
    const companyID = $(this).val();
    window.dashboardFilters.companyId = companyID || null;

    // Reset COBU filter when changing company
    window.dashboardFilters.cobu = null;
    $('#cobuFilter').val(null).trigger('change');

    // Update dependent filters using debounced functions
    if (companyID) {
      debouncedDashboardFilterUpdateBudgetYears(companyID);
      debouncedDashboardFilterUpdateCoBU(companyID);
      debouncedDashboardFilterUpdateEmpStatuses(companyID);
    }
  });

  // Budget Year filter change
  $('#yearsFilter').on('change', function () {
    window.dashboardFilters.budgetYear = $(this).val() || new Date().getFullYear();
  });

  // COBU filter change
  $('#cobuFilter').on('change', function () {
    window.dashboardFilters.cobu = $(this).val() || null;
  });

  // Cost Center filter change
  $('#costcenterFilter').on('change', function () {
    window.dashboardFilters.costCenter = $(this).val() || null;
  });

  // Division filter change
  $('#divisionFilter').on('change', function () {
    window.dashboardFilters.division = $(this).val() || null;
  });

  // Department filter change
  $('#departmentFilter').on('change', function () {
    window.dashboardFilters.department = $(this).val() || null;
  });

  // Section filter change
  $('#sectionFilter').on('change', function () {
    window.dashboardFilters.section = $(this).val() || null;
  });

  // Company/Store filter change
  $('#compstoreFilter').on('change', function () {
    window.dashboardFilters.companyStore = $(this).val() || null;
  });

  // Emp Status filter change
  $('#empstatusFilter').on('change', function () {
    window.dashboardFilters.empStatus = $(this).val() || null;
  });

  // Position filter change
  $('#positionFilter').on('change', function () {
    window.dashboardFilters.position = $(this).val() || null;
  });

  // Job Band filter change
  $('#jobbandFilter').on('change', function () {
    window.dashboardFilters.jobBand = $(this).val() || null;
  });
}

// ============================================================================
// Filter Cascade Relationships
// ============================================================================

/**
 * Setup filter cascade relationships
 */
function setupDashboardFilterCascadeRelationships() {
  // Remove existing event listeners to prevent duplicates
  const filterSelectors = [
    '#cobuFilter', '#yearsFilter', '#costcenterFilter', '#divisionFilter',
    '#departmentFilter', '#sectionFilter', '#compstoreFilter', '#positionFilter',
    '#empstatusFilter', '#jobbandFilter'
  ];

  filterSelectors.forEach(selector => {
    $(selector).off('change.dashboardFilterCascade');
  });

  // Setup cascading relationships with namespaced events
  $('#cobuFilter, #yearsFilter').on('change.dashboardFilterCascade', function () {
    const companyID = $('#companyFilter').val();
    if (companyID) {
      debouncedDashboardFilterUpdateCostCenters();
      debouncedDashboardFilterUpdateDivisions();
      debouncedDashboardFilterUpdateDepartments();
      debouncedDashboardFilterUpdateSections();
      debouncedDashboardFilterUpdateLocations();
      debouncedDashboardFilterUpdatePositions();
      debouncedDashboardFilterUpdateJobBands();
    }
  });

  $('#costcenterFilter').on('change.dashboardFilterCascade', function () {
    debouncedDashboardFilterUpdateDivisions();
    debouncedDashboardFilterUpdateDepartments();
    debouncedDashboardFilterUpdateSections();
    debouncedDashboardFilterUpdateLocations();
    debouncedDashboardFilterUpdatePositions();
    debouncedDashboardFilterUpdateJobBands();
  });

  $('#divisionFilter').on('change.dashboardFilterCascade', function () {
    debouncedDashboardFilterUpdateDepartments();
    debouncedDashboardFilterUpdateSections();
    debouncedDashboardFilterUpdateLocations();
    debouncedDashboardFilterUpdatePositions();
    debouncedDashboardFilterUpdateJobBands();
  });

  $('#departmentFilter').on('change.dashboardFilterCascade', function () {
    debouncedDashboardFilterUpdateSections();
    debouncedDashboardFilterUpdateLocations();
    debouncedDashboardFilterUpdatePositions();
    debouncedDashboardFilterUpdateJobBands();
  });

  $('#sectionFilter').on('change.dashboardFilterCascade', function () {
    debouncedDashboardFilterUpdateLocations();
    debouncedDashboardFilterUpdatePositions();
    debouncedDashboardFilterUpdateJobBands();
  });

  $('#compstoreFilter').on('change.dashboardFilterCascade', function () {
    debouncedDashboardFilterUpdatePositions();
    debouncedDashboardFilterUpdateJobBands();
  });

  $('#positionFilter').on('change.dashboardFilterCascade', function () {
    debouncedDashboardFilterUpdateJobBands();
  });

  $('#empstatusFilter').on('change.dashboardFilterCascade', function () {
    debouncedDashboardFilterUpdatePositions();
    debouncedDashboardFilterUpdateJobBands();
  });
}

// ============================================================================
// Filter Actions
// ============================================================================

/**
 * Reset all filters to default
 */
function resetDashboardFilters() {
  window.dashboardFilters = {
    companyId: null,
    budgetYear: new Date().getFullYear(),
    cobu: null,
    costCenter: null,
    division: null,
    department: null,
    section: null,
    companyStore: null,
    empStatus: null,
    position: null,
    jobBand: null
  };

  // Reset filter UI
  $('#companyFilter').val('').trigger('change');
  $('#yearsFilter').val('').trigger('change');
  $('#cobuFilter').val('').trigger('change');
  $('#costcenterFilter').val('').trigger('change');
  $('#divisionFilter').val('').trigger('change');
  $('#departmentFilter').val('').trigger('change');
  $('#sectionFilter').val('').trigger('change');
  $('#compstoreFilter').val('').trigger('change');
  $('#empstatusFilter').val('').trigger('change');
  $('#positionFilter').val('').trigger('change');
  $('#jobbandFilter').val('').trigger('change');

  // Reload dashboard
  if (typeof loadDashboard === 'function') {
    loadDashboard();
  }
}

/**
 * Apply current filters and refresh dashboard
 */
function applyDashboardFilters() {
  if (typeof loadDashboard === 'function') {
    loadDashboard();
  }
}

// ============================================================================
// Export Functions
// ============================================================================

// Export filter update functions
window.debouncedDashboardFilterUpdateCoBU = debouncedDashboardFilterUpdateCoBU;
window.debouncedDashboardFilterUpdateBudgetYears = debouncedDashboardFilterUpdateBudgetYears;
window.debouncedDashboardFilterUpdateCostCenters = debouncedDashboardFilterUpdateCostCenters;
window.debouncedDashboardFilterUpdateDivisions = debouncedDashboardFilterUpdateDivisions;
window.debouncedDashboardFilterUpdateDepartments = debouncedDashboardFilterUpdateDepartments;
window.debouncedDashboardFilterUpdateSections = debouncedDashboardFilterUpdateSections;
window.debouncedDashboardFilterUpdateLocations = debouncedDashboardFilterUpdateLocations;
window.debouncedDashboardFilterUpdatePositions = debouncedDashboardFilterUpdatePositions;
window.debouncedDashboardFilterUpdateJobBands = debouncedDashboardFilterUpdateJobBands;
window.debouncedDashboardFilterUpdateEmpStatuses = debouncedDashboardFilterUpdateEmpStatuses;

// Export main functions
window.initializeDashboardFilters = initializeDashboardFilters;
window.fetchDashboardCompanies = fetchDashboardCompanies;  // 🔒 Company Access filtered
window.setupDashboardFilterListeners = setupDashboardFilterListeners;
window.setupDashboardFilterCascadeRelationships = setupDashboardFilterCascadeRelationships;
window.resetDashboardFilters = resetDashboardFilters;
window.applyDashboardFilters = applyDashboardFilters;
window.buildDashboardStandardApiParams = buildDashboardStandardApiParams;

console.log('PE Dashboard filters module loaded successfully');
