/**
 * Budget PE Bonus Event Handlers
 * Simplified for Cost Center Summary (Read-Only)
 * Handles: Search, Reset, Export Excel, Fullscreen
 */

// Handle Search button click
function handleSearchClick() {
  // Validate required filters - inline validation like Budget Planning
  const companyId = $('#companyFilter').val();
  const yearBudget = $('#yearsFilter').val();

  if (!companyId || !yearBudget) {
    showWarningModal('Please select Company and Budget Year before searching');
    return;
  }

  // Build filters object
  const filters = {
    companyId: companyId,
    yearBudget: yearBudget,
    cobu: $('#cobuFilter').val() || '',
    costCenter: $('#costcenterFilter').val() || ''
  };

  // Show loading state
  showGridLoading();

  // ✅ Store current companyId for Grand Total calculations
  window.currentCompanyFilter = companyId;

  // Fetch data from API
  fetchBudgetPEBonusData(filters)
    .then(data => {
      // Load data using grid module's function (includes Grand Total calculation)
      // ✅ Pass companyId to apply dynamic column definitions
      if (window.loadBudgetPEBonusData) {
        window.loadBudgetPEBonusData(data, companyId);
      } else {
        console.error('loadBudgetPEBonusData function not available');
      }

      // Scroll to grid
      const gridContainer = document.querySelector('#budgetPEBonusGridContainer');
      if (gridContainer) {
        requestAnimationFrame(() => {
          smoothScrollToElement(gridContainer, { offset: -130 });
        });
      }

      hideGridLoading();
    })
    .catch(error => {
      console.error('Error fetching PE Bonus By Cost Center data:', error);
      showWarningModal('Failed to load data. Please try again.');
      hideGridLoading();
    });
}

// Handle Reset button click
function handleResetClick() {
  // Refresh page to reset all filters and grid
  location.reload();
}

// Handle Company filter change
function handleCompanyFilterChange() {
  const companyID = $(this).val();
  const filterIds = [
    '#cobuFilter', '#yearsFilter', '#costcenterFilter'
  ];

  if (!companyID) {
    // Disable and clear all dependent filters
    filterIds.forEach(id => {
      $(id).prop('disabled', true).val('').trigger('change');
    });
  } else {
    // Validate company selection using core functions
    try {
      const company = detectCurrentCompany();

      if (!company.isValid) {
        throw new Error(company.error);
      }

      //refreshGridForCompanyFilter();

      // console.log(`Company changed to: ${formatCompanyDisplayName(companyID)}`);

      // Add any additional company-specific logic here

      // Enable dependent filters and update them
      filterIds.forEach(id => $(id).prop('disabled', false));

      // Update main cascading filters first
      if (typeof debouncedUpdateCoBU !== 'undefined') {
        debouncedUpdateCoBU(companyID);
      }

      if (typeof debouncedUpdateBudgetYears !== 'undefined') {
        debouncedUpdateBudgetYears(companyID);
      }

      if(typeof debouncedUpdateCostCenters !== 'undefined') {
        debouncedUpdateCostCenters(companyID);
      }

      // Clear other filters that depend on COBU/Year selection
      ['#costcenterFilter'].forEach(id => {
        $(id).val('').trigger('change');
      });

      // Log company-specific features
      // console.log(`Company features - Fleet Card: ${supportsCompanyFeature('fleetCard')}, South Risk: ${supportsCompanyFeature('southRisk')}`);

    } catch (error) {
      console.error('Company selection error:', error);
      showWarningModal(`Invalid company selection: ${error.message}`);

      // Reset to no selection
      $(this).val('').trigger('change');
    }
  }
}

// Handle Export Excel button click
function handleExportExcelClick() {
  const gridApi = window.budgetPEBonusGridApi || (window.getGridApi ? window.getGridApi() : null);

  if (!gridApi) {
    showWarningModal('Grid not initialized');
    return;
  }

  // Get current filter values for filename
  const companyId = $('#companyFilter').val();
  const year = $('#yearsFilter').val();
  const cobu = $('#cobuFilter').val();
  const costCenter = $('#costcenterFilter').val();

  // Build filename
  let filename = window.EXPORT_FILENAME_PREFIX || 'Budget_PE_Bonus';
  if (year) filename += `_${year}`;
  if (companyId) filename += `_Co${companyId}`;
  if (cobu) filename += `_${cobu}`;
  if (costCenter) filename += `_${costCenter}`;
  filename += `_${new Date().toISOString().split('T')[0]}.xlsx`;

  // Export to Excel
  gridApi.exportDataAsExcel({
    sheetName: window.EXPORT_SHEET_NAME || 'PE Bonus Summary',
    fileName: filename,
    columnKeys: null, // Export all columns
    allColumns: true,
    skipColumnGroupHeaders: false,
    skipColumnHeaders: false
  });
}

// Handle Fullscreen toggle button click
function handleFullscreenClick() {
  if (window.toggleFullscreen) {
    const gridApi = window.budgetPEBonusGridApi || (window.getGridApi ? window.getGridApi() : null);
    window.toggleFullscreen(
      'budgetPEBonusGridContainer',
      'btnToggleBudgetPEBonusFullscreen',
      'budgetPEBonusGrid',
      gridApi,
      '500px'
    );
  }
}

// Helper function to show warning modal
function showWarningModal(message) {
  // Try to use existing modal if available
  if (window.showWarningModal && typeof window.showWarningModal === 'function') {
    window.showWarningModal(message);
    return;
  }

  // Fallback to alert
  alert(message);
}

// Helper function for smooth scrolling
function smoothScrollToElement(element, options = {}) {
  const offset = options.offset || 0;
  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition + offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
}

// Initialize event listeners
function bindEventListeners() {

  // Filter change listeners
  $('#companyFilter').off('change.filterCascade').on('change.filterCascade', handleCompanyFilterChange);

  // Search button
  const searchBtn = document.getElementById('searchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', handleSearchClick);
  }

  // Reset button
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', handleResetClick);
  }

  // Export Excel button
  const exportBtn = document.getElementById('exportExcelBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', handleExportExcelClick);
  }

  // Fullscreen button
  const fullscreenBtn = document.getElementById('btnToggleBudgetPEBonusFullscreen');
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', handleFullscreenClick);
  }

  console.log('✅ Budget PE Bonus event listeners initialized');
}

// Initialize UI state
function initializeUIState() {
  // No special UI state needed for read-only report
  console.log('✅ Budget PE Bonus UI state initialized');
}

// Export functions to global scope
window.bindEventListeners = bindEventListeners;
window.initializeUIState = initializeUIState;
window.handleSearchClick = handleSearchClick;
window.handleResetClick = handleResetClick;
window.handleExportExcelClick = handleExportExcelClick;
window.handleFullscreenClick = handleFullscreenClick;

console.log('✅ Budget PE Bonus Events module loaded (Read-Only)');
