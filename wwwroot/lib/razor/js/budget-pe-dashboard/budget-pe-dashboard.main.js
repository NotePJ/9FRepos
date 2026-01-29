/**
 * PE Budget Dashboard - Main Initialization
 * Main orchestration file that initializes PE Budget Dashboard and coordinates all modules
 */

// Initialize all PE Dashboard functionality
function initializePEDashboard() {
  console.log('Initializing PE Budget Dashboard...');

  try {
    // Initialize core loading states
    showDashboardLoading(true, 'Initializing Dashboard...');

    // Initialize filters (calls fetchCompanies from BudgetPlanning)
    if (typeof initializeDashboardFilters === 'function') {
      initializeDashboardFilters();
    } else {
      console.error('initializeDashboardFilters function not available');
    }

    // Setup all event handlers
    bindDashboardEventListeners();

    // Don't auto-load dashboard - wait for user to select company
    // User must select Company + Year and click Search to load data
    showDashboardLoading(false);
    console.log('PE Budget Dashboard initialized successfully - Ready for filter selection');

  } catch (error) {
    console.error('Error initializing PE Budget Dashboard:', error);
    showDashboardError('Failed to initialize dashboard. Please refresh the page and try again.');
    showDashboardLoading(false);
  }
}

// Bind all dashboard event listeners
function bindDashboardEventListeners() {
  console.log('Setting up dashboard event listeners...');

  // More Options Toggle
  const moreOptionsToggle = document.getElementById('moreOptionsToggle');
  if (moreOptionsToggle) {
    moreOptionsToggle.addEventListener('click', function (e) {
      e.preventDefault();
      if (typeof toggleDashboardMoreFilters === 'function') {
        toggleDashboardMoreFilters();
      }
    });
  }

  // Reset Button
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (typeof resetDashboardFilters === 'function') {
        resetDashboardFilters();
      }
    });
  }

  // Search Button
  const searchBtn = document.getElementById('searchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', function () {
      if (typeof applyDashboardFilters === 'function') {
        applyDashboardFilters();
      }
    });
  }

  // HC Proportion View Type Dropdown
  const hcProportionViewType = document.getElementById('hcProportionViewType');
  if (hcProportionViewType) {
    hcProportionViewType.addEventListener('change', function () {
      if (typeof handleHCProportionViewTypeChange === 'function') {
        handleHCProportionViewTypeChange(this.value);
      }
    });
  }

  // Block B View Type Dropdown (Top 10 PE Growth / Top 5 BU / Top 5 BP)
  const blockBViewType = document.getElementById('blockBViewType');
  if (blockBViewType) {
    blockBViewType.addEventListener('change', function () {
      const viewType = this.value;
      console.log('Block B View Type changed to:', viewType);

      // Reload both Chart (Block B) and Grid (Block E) with new view type
      if (typeof loadDashboardPEGrowthChart === 'function') {
        loadDashboardPEGrowthChart(viewType);
      }
      // Grid will be updated by loadDashboardPEGrowthChart automatically
    });
  }

  $('#companyFilter').off('change.filterCascade').on('change.filterCascade', handleCompanyFilterChange);

  console.log('Dashboard event listeners setup complete');
}

// Handle Company filter change
function handleCompanyFilterChange() {
  const companyID = $(this).val();
  const filterIds = [
    '#cobuFilter', '#yearsFilter', '#costcenterFilter', '#divisionFilter', '#departmentFilter',
    '#sectionFilter', '#compstoreFilter', '#positionFilter', '#jobbandFilter', '#empstatusFilter'
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

      filterIds.forEach(id => $(id).prop('disabled', false));

      // 🆕 Update COBU/Format label based on company
      updateCobuLabel(companyID);

      // 🆕 Update Company/Store name label based on company
      updateCompstoreLabel(companyID);

      // Update main cascading filters first
      debouncedFilterUpdateCoBU(companyID);
      debouncedFilterUpdateBudgetYears(companyID);
      debouncedFilterUpdateEmpStatuses(companyID);

      // Clear other filters that depend on COBU/Year selection
      ['#costcenterFilter', '#divisionFilter', '#departmentFilter', '#sectionFilter',
        '#compstoreFilter', '#positionFilter', '#jobbandFilter'].forEach(id => {
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

/**
 * Update COBU/Format label based on selected company
 * Company 1 (BJC) → "COBU"
 * Other companies → "Format"
 * @param {string} companyID - Selected company ID
 */
function updateCobuLabel(companyID) {
  try {
    const companyIdInt = parseInt(companyID);
    const isBJC = companyIdInt === 1;

    // Determine label text
    const labelText = isBJC ? 'COBU' : 'Format';
    const optionText = isBJC ? 'All COBU' : 'All Format';
    const selectText = isBJC ? 'Select COBU' : 'Select Format';

    // 1. Update Main Filter Label
    const mainLabelText = document.getElementById('cobuFilterLabelText');
    if (mainLabelText) {
      mainLabelText.textContent = labelText;
    }

    const mainAllOption = document.getElementById('cobuFilterAllOption');
    if (mainAllOption) {
      mainAllOption.textContent = optionText;
    }

    // 2. Update Offcanvas (Edit Form) Label
    const editLabelText = document.getElementById('editCobuLabelText');
    if (editLabelText) {
      editLabelText.textContent = labelText;
    }

    const editAllOption = document.getElementById('editCobuAllOption');
    if (editAllOption) {
      editAllOption.textContent = selectText;
    }

    // 3. Update All Batch Entry Rows (if any exist)
    const batchRows = document.querySelectorAll('[data-batch-row-id]');
    batchRows.forEach(row => {
      const batchLabelText = row.querySelector('.batch-cobu-label-text');
      if (batchLabelText) {
        batchLabelText.textContent = labelText;
      }

      const batchAllOption = row.querySelector('.batch-cobu-all-option');
      if (batchAllOption) {
        batchAllOption.textContent = selectText;
      }
    });

    console.log(`✅ COBU label updated to: "${labelText}" for Company ${companyID}`);

  } catch (error) {
    console.error('❌ Error updating COBU label:', error);
  }
}

/**
 * Update Company/Store name label based on selected company
 * Company 1 (BJC) → "Company name"
 * Other companies → "Store name"
 * @param {string} companyID - Selected company ID
 */
function updateCompstoreLabel(companyID) {
  try {
    const companyIdInt = parseInt(companyID);
    const isBJC = companyIdInt === 1;

    // Determine label text
    const labelText = isBJC ? 'Company name' : 'Store name';
    const optionText = isBJC ? 'All Company names' : 'All Store names';

    // Update Main Filter Label
    const mainLabelText = document.getElementById('compstoreFilterLabelText');
    if (mainLabelText) {
      mainLabelText.textContent = labelText;
    }

    const mainAllOption = document.getElementById('compstoreFilterAllOption');
    if (mainAllOption) {
      mainAllOption.textContent = optionText;
    }

    console.log(`✅ Compstore label updated to: "${labelText}" for Company ${companyID}`);

  } catch (error) {
    console.error('❌ Error updating Compstore label:', error);
  }
}

// Initialize PE Dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM loaded, starting PE Dashboard initialization...');

  // Small delay to ensure all scripts are loaded
  setTimeout(() => {
    initializePEDashboard();
  }, 100);

  // Setup theme change observer
  setupThemeChangeObserver();

  // Setup trend chart toggles (Block D)
  setupTrendChartToggles();
});

// Setup MutationObserver to detect theme changes
function setupThemeChangeObserver() {
  console.log('Setting up theme change observer...');

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-coreui-theme') {
        const theme = document.documentElement.getAttribute('data-coreui-theme');
        console.log('Theme changed to:', theme);

        // Determine which chart to reload based on company
        const companyId = parseInt(window.dashboardFilters?.companyId);

        // Reload PE Growth chart for all companies
        if (typeof loadDashboardPEGrowthChart === 'function') {
          loadDashboardPEGrowthChart();
        }

        // Always reload HC Composition chart
        if (typeof loadDashboardHCCompositionChart === 'function') {
          // Need to refetch KPI data for HC composition
          fetchDashboardPEBonusData(window.dashboardFilters)
            .then(data => loadDashboardHCCompositionChart(data))
            .catch(err => console.error('Error reloading HC Composition chart:', err));
        }

        // Reload Trend Chart if BIG C
        if (companyId === 2 && typeof renderTrendChart === 'function' && window.trendChartData) {
          renderTrendChart(window.trendChartData);
          console.log('Trend chart reloaded for theme change');
        }
      }
    });
  });

  // Start observing theme attribute changes on document.documentElement
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-coreui-theme']
  });

  console.log('Theme change observer setup complete');
}// Export global functions for access from other modules
window.initializePEDashboard = initializePEDashboard;
window.bindDashboardEventListeners = bindDashboardEventListeners;
window.setupThemeChangeObserver = setupThemeChangeObserver;

// Export dashboard component getter/setter functions
window.getDepartmentChart = () => window.departmentChart;
window.getCobuChart = () => window.cobuChart;
window.getCostCenterGrid = () => window.costCenterGrid;
window.setDepartmentChart = (chart) => { window.departmentChart = chart; };
window.setCobuChart = (chart) => { window.cobuChart = chart; };
window.setCostCenterGrid = (grid) => { window.costCenterGrid = grid; };

// Export utility functions from events.js for global access
window.formatNumber = formatNumber;
window.formatCurrency = formatCurrency;
window.showDashboardLoading = showDashboardLoading;
window.showDashboardError = showDashboardError;

console.log('PE Dashboard main module loaded successfully');
