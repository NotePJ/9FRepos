// Budget PE Bonus Filter Functions
// Simplified version for 4 filters only

// Create debounced versions of filter update functions
const debouncedUpdateCoBU = debounce(updateFilterCoBU, DEBOUNCE_DELAYS.cobu);
const debouncedUpdateBudgetYears = debounce(updateFilterBudgetYears, DEBOUNCE_DELAYS.budgetYears);
const debouncedUpdateCostCenters = debounce(updateFilterCostCenters, DEBOUNCE_DELAYS.costCenters);

// Update COBU filter
function updateFilterCoBU(companyId) {
  fetchCoBU(companyId);
}

// Update Budget Years filter
function updateFilterBudgetYears(companyId) {
  fetchBudgetYears(companyId);
}

function updateFilterCostCenters(companyId) {
  fetchCostCenters(companyId);
}

// Initialize filters on page load
function initializeFilters() {
  // Disable all filters except companyFilter initially
  const filterIds = [
    '#cobuFilter',
    '#yearsFilter',
    '#costcenterFilter'
  ];

  filterIds.forEach(id => {
    $(id).prop('disabled', true);
  });
}

function initFilterHandlers() {
  $('#companyFilter').on('change', function() {
    const companyId = $(this).val();
    if (!companyId) {
      debouncedUpdateCoBU(null);
      debouncedUpdateBudgetYears(null);
      debouncedUpdateCostCenters(null);
      return;
    }
    debouncedUpdateCoBU(companyId);
    debouncedUpdateBudgetYears(companyId);
    setTimeout(() => {
      const cobuValue = $('#cobuFilter').val() || '';
      debouncedUpdateCostCenters(companyId, cobuValue);
    }, DEBOUNCE_DELAYS.cobu + 50);
  });

  $('#cobuFilter').on('change', function() {
    const companyId = $('#companyFilter').val();
    const cobuValue = $(this).val() || '';
    if (companyId) {
      debouncedUpdateCostCenters(companyId, cobuValue);
    }
  });

  $('#yearsFilter').on('change', function() {
    console.log('Year changed:', $(this).val());
  });

  $('#costcenterFilter').on('change', function() {
    console.log('Cost Center changed:', $(this).val());
  });
}

function validateFilters() {
  const companyId = $('#companyFilter').val();
  const yearBudget = $('#yearsFilter').val();

  if (!companyId) {
    return { success: false, message: 'Please select a Company', field: 'companyFilter' };
  }
  if (!yearBudget) {
    return { success: false, message: 'Please select a Budget Year', field: 'yearsFilter' };
  }
  return { success: true, message: 'Valid' };
}

/**
 * Get filter values with dynamic year calculation
 * ✅ DYNAMIC: Uses calculateDynamicYearParams() for year ranges
 */
function getFilterValues() {
  const yearBudget = parseInt($('#yearsFilter').val()) || 2026;
  const yearParams = calculateDynamicYearParams(yearBudget);

  return {
    companyId: $('#companyFilter').val(),
    cobu: $('#cobuFilter').val() || '',
    yearBudget: yearParams.yearBudget,
    yearFrom: yearParams.yearFrom,  // ✅ Dynamic!
    yearTo: yearParams.yearTo,      // ✅ Dynamic!
    costCenter: $('#costcenterFilter').val() || ''
  };
}

function resetAllFilters() {
  $('#companyFilter').val('').trigger('change.select2');
  $('#cobuFilter').html('<option value="">All COBU/Format</option>');
  $('#yearsFilter').html('<option value="">All Years</option>');
  $('#costcenterFilter').html('<option value="">All Cost Centers</option>');
}

// Export functions to global scope for use by other modules
window.initializeFilters = initializeFilters;
window.initFilterHandlers = initFilterHandlers;
window.updateFilterCoBU = updateFilterCoBU;
window.updateFilterBudgetYears = updateFilterBudgetYears;
window.updateFilterCostCenters = updateFilterCostCenters;
window.validateFilters = validateFilters;
window.getFilterValues = getFilterValues;
window.resetAllFilters = resetAllFilters;

// Export debounced versions for use by events.js
window.debouncedUpdateCoBU = debouncedUpdateCoBU;
window.debouncedUpdateBudgetYears = debouncedUpdateBudgetYears;
window.debouncedUpdateCostCenters = debouncedUpdateCostCenters;

console.log('Budget PE Bonus Filters loaded');
