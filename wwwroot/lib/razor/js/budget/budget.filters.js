/**
 * Budget Filter Functions
 * Handles filter cascade logic and dropdown updates
 */

// Create debounced versions of filter update functions
const debouncedFilterUpdateCoBU = debounce(updateFilterCoBU, DEBOUNCE_DELAYS.cobu);
const debouncedFilterUpdateEmpFormats = debounce(updateFilterEmpFormats, DEBOUNCE_DELAYS.empFormats); // Legacy
const debouncedFilterUpdateBudgetYears = debounce(updateFilterBudgetYears, DEBOUNCE_DELAYS.budgetYears);
const debouncedFilterUpdateCostCenters = debounce(updateFilterCostCenters, DEBOUNCE_DELAYS.costCenters);
const debouncedFilterUpdateDivisions = debounce(updateFilterDivisions, DEBOUNCE_DELAYS.divisions);
const debouncedFilterUpdateDepartments = debounce(updateFilterDepartments, DEBOUNCE_DELAYS.departments);
const debouncedFilterUpdateSections = debounce(updateFilterSections, DEBOUNCE_DELAYS.sections);
const debouncedFilterUpdateLocations = debounce(updateFilterLocations, DEBOUNCE_DELAYS.locations);
const debouncedFilterUpdatePositions = debounce(updateFilterPositions, DEBOUNCE_DELAYS.positions);
const debouncedFilterUpdateJobBands = debounce(updateFilterJobBands, DEBOUNCE_DELAYS.jobBands);
const debouncedFilterUpdateEmpStatuses = debounce(updateFilterEmpStatuses, DEBOUNCE_DELAYS.empStatuses);

// Update COBU filter
function updateFilterCoBU(companyID) {
  fetchCoBU(companyID);
}

// Update Employee Formats filter (Legacy compatibility)
function updateFilterEmpFormats(companyID) {
  fetchCoBU(companyID);
}

// Update Budget Years filter
function updateFilterBudgetYears(companyID) {
  fetchBudgetYears(companyID);
}

// Update Cost Centers filter
function updateFilterCostCenters() {
  try {
    // Use core functions for parameter building
    const params = buildStandardApiParams();
    const costcenterQuery = params.toString() ? `?${params.toString()}` : '';

    fetch(`${BUDGET_API.costCenters}${costcenterQuery}`)
      .then(response => response.json())
      .then(data => {
        const costcenterFilter = $('#costcenterFilter');
        costcenterFilter.find('option:not(:first)').remove();
        data.forEach(costCenter => {
          const option = new Option(`${costCenter.costCenterName} (${costCenter.costCenterCode})`, costCenter.costCenterCode);
          costcenterFilter.append(option);
        });
        costcenterFilter.select2({
          placeholder: 'All Cost Centers',
          allowClear: true,
          width: '100%'
        });
      })
      .catch(error => {
        console.error('Error fetching cost centers:', error);
        const company = detectCurrentCompany();
        if (company.isValid) {
          showWarningModal(getCompanyErrorMessage('API_ERROR', company.id));
        }
      });
  } catch (error) {
    console.error('Error in updateFilterCostCenters:', error);
  }
}

// Update Divisions filter
function updateFilterDivisions() {
  var companyID = $('#companyFilter').val();
  var cobu = $('#cobuFilter').val();
  var budgetYear = $('#yearsFilter').val();
  var costCenterCode = $('#costcenterFilter').val();
  var divisionParams = [];
  if (companyID) divisionParams.push(`companyID=${companyID}`);
  if (cobu) divisionParams.push(`COBU=${encodeURIComponent(cobu)}`);
  if (budgetYear) divisionParams.push(`budgetYear=${encodeURIComponent(budgetYear)}`);
  if (costCenterCode) divisionParams.push(`costCenterCode=${encodeURIComponent(costCenterCode)}`);
  var divisionQuery = divisionParams.length ? `?${divisionParams.join('&')}` : '';

  fetch(`${BUDGET_API.divisions}${divisionQuery}`)
    .then(response => response.json())
    .then(data => {
      const divisionFilter = $('#divisionFilter');
      divisionFilter.find('option:not(:first)').remove();
      data.forEach(division => {
        const option = new Option(division, division);
        divisionFilter.append(option);
      });
      divisionFilter.select2({
        placeholder: 'All Divisions',
        allowClear: true,
        width: '100%'
      });
    })
    .catch(error => {
      // console.error('Error fetching divisions:', error);
    });
}

// Update Departments filter
function updateFilterDepartments() {
  var companyID = $('#companyFilter').val();
  var empFormat = $('#cobuFilter').val();
  var budgetYear = $('#yearsFilter').val();
  var costCenterCode = $('#costcenterFilter').val();
  var divisionCode = $('#divisionFilter').val();
  var departmentParams = [];
  if (companyID) departmentParams.push(`companyID=${companyID}`);
  if (empFormat) departmentParams.push(`empFormat=${encodeURIComponent(empFormat)}`);
  if (budgetYear) departmentParams.push(`budgetYear=${encodeURIComponent(budgetYear)}`);
  if (costCenterCode) departmentParams.push(`costCenterCode=${encodeURIComponent(costCenterCode)}`);
  if (divisionCode) departmentParams.push(`divisionCode=${encodeURIComponent(divisionCode)}`);
  var departmentQuery = departmentParams.length ? `?${departmentParams.join('&')}` : '';

  fetch(`${BUDGET_API.departments}${departmentQuery}`)
    .then(response => response.json())
    .then(data => {
      const departmentFilter = $('#departmentFilter');
      departmentFilter.find('option:not(:first)').remove();
      data.forEach(department => {
        const option = new Option(department, department);
        departmentFilter.append(option);
      });
      departmentFilter.select2({
        placeholder: 'All Departments',
        allowClear: true,
        width: '100%'
      });
    })
    .catch(error => {
      // console.error('Error fetching departments:', error);
    });
}

// Update Sections filter
function updateFilterSections() {
  var companyID = $('#companyFilter').val();
  var empFormat = $('#cobuFilter').val();
  var budgetYear = $('#yearsFilter').val();
  var costCenterCode = $('#costcenterFilter').val();
  var divisionCode = $('#divisionFilter').val();
  var departmentCode = $('#departmentFilter').val();
  var sectionParams = [];
  if (companyID) sectionParams.push(`companyID=${companyID}`);
  if (empFormat) sectionParams.push(`empFormat=${encodeURIComponent(empFormat)}`);
  if (budgetYear) sectionParams.push(`budgetYear=${encodeURIComponent(budgetYear)}`);
  if (costCenterCode) sectionParams.push(`costCenterCode=${encodeURIComponent(costCenterCode)}`);
  if (divisionCode) sectionParams.push(`divisionCode=${encodeURIComponent(divisionCode)}`);
  if (departmentCode) sectionParams.push(`departmentCode=${encodeURIComponent(departmentCode)}`);
  var sectionQuery = sectionParams.length ? `?${sectionParams.join('&')}` : '';

  fetch(`${BUDGET_API.sections}${sectionQuery}`)
    .then(response => response.json())
    .then(data => {
      const sectionFilter = $('#sectionFilter');
      sectionFilter.find('option:not(:first)').remove();
      data.forEach(section => {
        const option = new Option(section, section);
        sectionFilter.append(option);
      });
      sectionFilter.select2({
        placeholder: 'All Sections',
        allowClear: true,
        width: '100%'
      });
    })
    .catch(error => {
      // console.error('Error fetching sections:', error);
    });
}

// Update Locations filter
function updateFilterLocations() {
  var companyID = $('#companyFilter').val();
  var empFormat = $('#cobuFilter').val();
  var budgetYear = $('#yearsFilter').val();
  var costCenterCode = $('#costcenterFilter').val();
  var divisionCode = $('#divisionFilter').val();
  var departmentCode = $('#departmentFilter').val();
  var sectionCode = $('#sectionFilter').val();
  var locationParams = [];
  if (companyID) locationParams.push(`companyID=${companyID}`);
  if (empFormat) locationParams.push(`empFormat=${encodeURIComponent(empFormat)}`);
  if (budgetYear) locationParams.push(`budgetYear=${encodeURIComponent(budgetYear)}`);
  if (costCenterCode) locationParams.push(`costCenterCode=${encodeURIComponent(costCenterCode)}`);
  if (divisionCode) locationParams.push(`divisionCode=${encodeURIComponent(divisionCode)}`);
  if (departmentCode) locationParams.push(`departmentCode=${encodeURIComponent(departmentCode)}`);
  if (sectionCode) locationParams.push(`sectionCode=${encodeURIComponent(sectionCode)}`);
  var locationQuery = locationParams.length ? `?${locationParams.join('&')}` : '';

  fetch(`${BUDGET_API.storeNames}${locationQuery}`)
    .then(response => response.json())
    .then(data => {
      const storeNameFilter = $('#locationsFilter');
      storeNameFilter.find('option:not(:first)').remove();
      data.forEach(storeName => {
        const option = new Option(storeName, storeName);
        storeNameFilter.append(option);
      });
      storeNameFilter.select2({
        placeholder: 'All Store Names',
        allowClear: true,
        width: '100%'
      });
    })
    .catch(error => {
      // console.error('Error fetching store names:', error);
    });
}

// Update Positions filter
function updateFilterPositions() {
  var companyID = $('#companyFilter').val();
  var empFormat = $('#cobuFilter').val();
  var budgetYear = $('#yearsFilter').val();
  var costCenterCode = $('#costcenterFilter').val();
  var divisionCode = $('#divisionFilter').val();
  var departmentCode = $('#departmentFilter').val();
  var sectionCode = $('#sectionFilter').val();
  var locationCode = $('#locationsFilter').val();
  var empStatus = $('#empstatusFilter').val();
  var positionParams = [];
  if (companyID) positionParams.push(`companyID=${companyID}`);
  if (empFormat) positionParams.push(`empFormat=${encodeURIComponent(empFormat)}`);
  if (budgetYear) positionParams.push(`budgetYear=${encodeURIComponent(budgetYear)}`);
  if (costCenterCode) positionParams.push(`costCenterCode=${encodeURIComponent(costCenterCode)}`);
  if (divisionCode) positionParams.push(`divisionCode=${encodeURIComponent(divisionCode)}`);
  if (departmentCode) positionParams.push(`departmentCode=${encodeURIComponent(departmentCode)}`);
  if (sectionCode) positionParams.push(`sectionCode=${encodeURIComponent(sectionCode)}`);
  if (locationCode) positionParams.push(`orgUnitName=${encodeURIComponent(locationCode)}`);
  if (empStatus) positionParams.push(`empStatus=${encodeURIComponent(empStatus)}`);
  var positionQuery = positionParams.length ? `?${positionParams.join('&')}` : '';

  fetch(`${BUDGET_API.positions}${positionQuery}`)
    .then(response => response.json())
    .then(data => {
      const positionFilter = $('#positionFilter');
      positionFilter.find('option:not(:first)').remove();
      data.forEach(position => {
        const option = new Option(`${position.positionName} (${position.positionCode})`, position.positionCode);
        positionFilter.append(option);
      });
      positionFilter.select2({
        placeholder: 'All Positions',
        allowClear: true,
        width: '100%'
      });
    })
    .catch(error => {
      // console.error('Error fetching positions:', error);
    });
}

// Update Job Bands filter
function updateFilterJobBands() {
  var companyID = $('#companyFilter').val();
  var empFormat = $('#cobuFilter').val();
  var budgetYear = $('#yearsFilter').val();
  var costCenterCode = $('#costcenterFilter').val();
  var divisionCode = $('#divisionFilter').val();
  var departmentCode = $('#departmentFilter').val();
  var sectionCode = $('#sectionFilter').val();
  var locationCode = $('#locationsFilter').val();
  var empStatus = $('#empstatusFilter').val();
  var positionCode = $('#positionFilter').val();
  var jobBandParams = [];
  if (companyID) jobBandParams.push(`companyID=${companyID}`);
  if (empFormat) jobBandParams.push(`empFormat=${encodeURIComponent(empFormat)}`);
  if (budgetYear) jobBandParams.push(`budgetYear=${encodeURIComponent(budgetYear)}`);
  if (costCenterCode) jobBandParams.push(`costCenterCode=${encodeURIComponent(costCenterCode)}`);
  if (divisionCode) jobBandParams.push(`divisionCode=${encodeURIComponent(divisionCode)}`);
  if (departmentCode) jobBandParams.push(`departmentCode=${encodeURIComponent(departmentCode)}`);
  if (sectionCode) jobBandParams.push(`sectionCode=${encodeURIComponent(sectionCode)}`);
  if (locationCode) jobBandParams.push(`orgUnitName=${encodeURIComponent(locationCode)}`);
  if (empStatus) jobBandParams.push(`empStatus=${encodeURIComponent(empStatus)}`);
  if (positionCode) jobBandParams.push(`positionCode=${encodeURIComponent(positionCode)}`);
  var jobBandQuery = jobBandParams.length ? `?${jobBandParams.join('&')}` : '';

  fetch(`${BUDGET_API.jobBands}${jobBandQuery}`)
    .then(response => response.json())
    .then(data => {
      const jobBandFilter = $('#jobbandFilter');
      jobBandFilter.find('option:not(:first)').remove();
      data.forEach(jobBand => {
        const option = new Option(jobBand, jobBand);
        jobBandFilter.append(option);
      });
      jobBandFilter.select2({
        placeholder: 'All Job Bands',
        allowClear: true,
        width: '100%'
      });
    })
    .catch(error => {
      // console.error('Error fetching job bands:', error);
    });
}

// Update Employee Statuses filter
function updateFilterEmpStatuses(companyID) {
  fetch(`${BUDGET_API.empStatuses}?companyID=${companyID}`)
    .then(response => response.json())
    .then(data => {
      const empstatusFilter = $('#empstatusFilter');
      empstatusFilter.find('option:not(:first)').remove();
      data.forEach(empStatus => {
        const option = new Option(empStatus, empStatus);
        empstatusFilter.append(option);
      });
      empstatusFilter.select2({
        placeholder: 'All Employee Statuses',
        allowClear: true,
        width: '100%'
      });
    })
    .catch(error => {
      // console.error('Error fetching employee statuses:', error);
    });
}

// Setup filter cascade relationships
function setupFilterCascadeRelationships() {
  // Remove existing event listeners to prevent duplicates
  const filterSelectors = [
    '#cobuFilter', '#yearsFilter', '#costcenterFilter', '#divisionFilter',
    '#departmentFilter', '#sectionFilter', '#locationsFilter', '#positionFilter',
    '#empstatusFilter', '#jobbandFilter'
  ];

  filterSelectors.forEach(selector => {
    $(selector).off('change.filterCascade');
  });

  // Setup cascading relationships with namespaced events
  $('#cobuFilter, #yearsFilter').on('change.filterCascade', function () {
    const companyID = $('#companyFilter').val();
    if (companyID) {
      debouncedFilterUpdateCostCenters();
      debouncedFilterUpdateDivisions();
      debouncedFilterUpdateDepartments();
      debouncedFilterUpdateSections();
      debouncedFilterUpdateLocations();
      debouncedFilterUpdatePositions();
      debouncedFilterUpdateJobBands();
    }
  });

  // Cost center changes affect divisions and below
  $('#costcenterFilter').on('change.filterCascade', function () {
    debouncedFilterUpdateDivisions();
    debouncedFilterUpdateDepartments();
    debouncedFilterUpdateSections();
    debouncedFilterUpdateLocations();
    debouncedFilterUpdatePositions();
    debouncedFilterUpdateJobBands();
  });

  // Division changes affect departments and below
  $('#divisionFilter').on('change.filterCascade', function () {
    debouncedFilterUpdateDepartments();
    debouncedFilterUpdateSections();
    debouncedFilterUpdateLocations();
    debouncedFilterUpdatePositions();
    debouncedFilterUpdateJobBands();
  });

  // Department changes affect sections and below
  $('#departmentFilter').on('change.filterCascade', function () {
    debouncedFilterUpdateSections();
    debouncedFilterUpdateLocations();
    debouncedFilterUpdatePositions();
    debouncedFilterUpdateJobBands();
  });

  // Section changes affect locations and below
  $('#sectionFilter').on('change.filterCascade', function () {
    debouncedFilterUpdateLocations();
    debouncedFilterUpdatePositions();
    debouncedFilterUpdateJobBands();
  });

  // Location changes affect positions and job bands
  $('#locationsFilter').on('change.filterCascade', function () {
    debouncedFilterUpdatePositions();
    debouncedFilterUpdateJobBands();
  });

  // Position changes affect job bands
  $('#positionFilter').on('change.filterCascade', function () {
    debouncedFilterUpdateJobBands();
  });

  // Employee status changes affect positions and job bands
  $('#empstatusFilter').on('change.filterCascade', function () {
    debouncedFilterUpdatePositions();
    debouncedFilterUpdateJobBands();
  });
}

// Initialize filters on page load
function initializeFilters() {
  // Disable all filters except companyFilter initially
  const filterIds = [
    '#cobuFilter',
    '#yearsFilter',
    '#costcenterFilter',
    '#divisionFilter',
    '#departmentFilter',
    '#sectionFilter',
    '#locationsFilter',
    '#positionFilter',
    '#empstatusFilter',
    '#jobbandFilter'
  ];

  filterIds.forEach(id => {
    $(id).prop('disabled', true);
  });
}

// Export functions to global scope for use by other modules
window.setupFilterCascadeRelationships = setupFilterCascadeRelationships;
window.initializeFilters = initializeFilters;
window.updateFilterEmpFormats = updateFilterEmpFormats;
window.updateFilterBudgetYears = updateFilterBudgetYears;
window.updateFilterCostCenters = updateFilterCostCenters;
window.updateFilterDivisions = updateFilterDivisions;
window.updateFilterDepartments = updateFilterDepartments;
window.updateFilterSections = updateFilterSections;
window.updateFilterLocations = updateFilterLocations;
window.updateFilterPositions = updateFilterPositions;
window.updateFilterJobBands = updateFilterJobBands;
window.updateFilterEmpStatuses = updateFilterEmpStatuses;
