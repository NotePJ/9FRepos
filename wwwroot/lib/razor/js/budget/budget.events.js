/**
 * Budget Event Handlers
 * Handles all event listeners and user interactions
 */

// Global data variables
var rawData = [];
var masterData = [];

// Flag to prevent onBudgetSelectionChanged when edit button is clicked
window.isEditButtonClicked = false;

// Update card years (from budget.js reference)
function updateCardYears() {
  const selectedYear = document.getElementById('editYear')?.value;
  if (selectedYear) {
    const currentYear = parseInt(selectedYear);
    const previousYear = currentYear - 1;

    // Update LE Benefits Card header (previous year)
    const leBenefitsYearSpan = document.getElementById('leBenefitsYear');
    if (leBenefitsYearSpan) {
      leBenefitsYearSpan.textContent = previousYear;
    }

    // Update Benefits Card header (current year)
    const benefitsYearSpan = document.getElementById('benefitsYear');
    if (benefitsYearSpan) {
      benefitsYearSpan.textContent = currentYear;
    }
  }
}

// Export updateCardYears to global scope for compatibility with other files
window.updateCardYears = updateCardYears;

// Clear and enable all edit fields in Offcanvas (from budget.js reference + improvements)
function clearAndEnableEditFields() {
  ['editCompany', 'editCobu', 'editDivision', 'editDepartment', 'editSection', 'editEmpStatus'].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      // console.log('Clearing and enabling:', id);
      // console.log('Before - value:', element.value, 'readOnly:', element.readOnly, 'disabled:', element.disabled);
      element.value = '';
      element.readOnly = false;
      element.removeAttribute('disabled');
      // console.log('After - value:', element.value, 'readOnly:', element.readOnly, 'disabled:', element.disabled);
    }
  });
}

/**
 * Check if all required modules are initialized and ready
 * @returns {boolean} true if all dependencies are ready
 */
function checkModuleDependencies() {
  const dependencies = [
    {
      name: 'budgetDynamicFormsManager',
      check: () => window.budgetDynamicFormsManager && window.budgetDynamicFormsManager.isInitialized
    },
    {
      name: 'budgetFormValidator',
      check: () => window.budgetFormValidator && window.budgetFormValidator.isInitialized
    },
    {
      name: 'benefitsTemplatesManager',
      check: () => window.benefitsTemplatesManager && window.benefitsTemplatesManager.isInitialized
    }
  ];

  const notReady = dependencies.filter(dep => !dep.check());

  if (notReady.length > 0) {
    console.log('⏳ Waiting for modules:', notReady.map(dep => dep.name));

    // 🔧 FIX: Add performance monitoring
    const startTime = performance.now();
    console.log(`📊 Module check started at: ${startTime.toFixed(2)}ms`);

    // Debug individual module status
    dependencies.forEach(dep => {
      if (!dep.check()) {
        if (dep.name === 'budgetDynamicFormsManager') {
          console.log('🔍 budgetDynamicFormsManager:', {
            exists: !!window.budgetDynamicFormsManager,
            isInitialized: window.budgetDynamicFormsManager?.isInitialized
          });
        } else if (dep.name === 'budgetFormValidator') {
          console.log('🔍 budgetFormValidator:', {
            exists: !!window.budgetFormValidator,
            isInitialized: window.budgetFormValidator?.isInitialized
          });
        } else if (dep.name === 'benefitsTemplatesManager') {
          console.log('🔍 benefitsTemplatesManager:', {
            exists: !!window.benefitsTemplatesManager,
            isInitialized: window.benefitsTemplatesManager?.isInitialized
          });
        }
      }
    });

    return false;
  }

  return true;
}

// Handle Add Row Click (Enhanced with Dynamic Forms)
function handleAddRowClick(retryCount = 0) {
  const maxRetries = 10; // 🔧 FIX: Reduced from 25 to 10 (Max 5 seconds)
  const retryDelay = 500; // 🔧 FIX: Increased from 200ms to 500ms

  // Check dependencies first
  if (!checkModuleDependencies()) {
    if (retryCount >= maxRetries) {
      console.warn('🔧 FIX: Modules failed to initialize, force initializing...');

      // 🔧 FIX: Force initialize modules if not ready
      if (window.budgetFormValidator && !window.budgetFormValidator.isInitialized) {
        console.log('🔧 Force initializing budgetFormValidator...');
        window.budgetFormValidator.initialize();
      }

      console.log('✅ Proceeding with Add Row after force initialization...');
      // Continue with normal flow
    } else {
      console.log(`⏳ Modules not ready, retrying ${retryCount + 1}/${maxRetries} in ${retryDelay}ms...`);
      setTimeout(() => handleAddRowClick(retryCount + 1), retryDelay);
      return;
    }
  }

  console.log('✅ All modules ready, proceeding with Add Row...');
  // Set Add mode
  $('#formMode').val('add');

  // Update UI labels for Add mode
  $('#offcanvasAddRowLabel').text('Add Row');
  $('#editRowForm').removeAttr('data-edit-index');
  $('#editRowGroupForm').removeAttr('data-edit-index');

  // Show the offcanvas first
  getOffcanvasInstance(document.getElementById('offcanvasAddRow')).show();

  // Show loading overlay in offcanvas
  showOffcanvasLoading('Preparing Add Row Form...', 'offcanvasAddRow');

  // Get selected values from main filters
  var selectedCompany = $('#companyFilter').val();
  var selectedFormat = $('#empformatsFilter').val();
  var selectedYear = $('#yearsFilter').val();

  // Simulate loading delay
  setTimeout(() => {
    // Populate dropdowns using Add mode setup with full initialization
    populateDropdown('editCompany', BUDGET_API.companies, 'Select Company', (option, item) => {
      option.value = item.companyId;
      option.textContent = item.companyCode;
    }, true, {
      setupRelationships: 'add', // Use Add mode relationships
      initializeSubsystems: true, // Initialize head count management, allocation system, etc.
      populateRelatedDropdowns: true // Populate dependent dropdowns
    });

    // Wait for dropdowns to be populated, then set values
    setTimeout(() => {
      // console.log(selectedCompany, selectedFormat, selectedYear);
      // Set company first and trigger cascade
      if (selectedCompany) {
        // Check if option exists before setting
        if ($('#editCompany option[value="' + selectedCompany + '"]').length > 0) {
          $('#editCompany').val(selectedCompany).prop('disabled', true);
          $('#editCompany').next('.select2-container').find('.select2-search__field').prop('disabled', true);

          // ⭐ TRIGGER FULL CHANGE EVENT to activate dynamic forms and benefits templates
          $('#editCompany').trigger('change.offcanvas');

          // Update select2 display
          $('#editCompany').trigger('change.select2');

          // ⭐ All other updates will be handled by change.offcanvas event automatically

          setTimeout(() => {
            if (selectedFormat && $('#editFormat option[value="' + selectedFormat + '"]').length > 0) {
              $('#editFormat').val(selectedFormat).prop('disabled', true);
              $('#editFormat').next('.select2-container').find('.select2-search__field').prop('disabled', true);
              $('#editFormat').trigger('change.select2');
            }

            // Wait for year dropdown to be populated (separate timeout like budget.js)
            setTimeout(() => {
              if (selectedYear && $('#editYear option[value="' + selectedYear + '"]').length > 0) {
                $('#editYear').val(selectedYear).prop('disabled', true);
                $('#editYear').next('.select2-container').find('.select2-search__field').prop('disabled', true);
                $('#editYear').trigger('change.select2');

                // Update card years after setting the year value (from budget.js reference)
                updateCardYears();
              }

              // Hide loading overlay after everything is ready (moved from outer scope)
              hideOffcanvasLoading('offcanvasAddRow');
            }, 500);
          }, 800);
        } else {
          // console.log('Company option not found for value:', selectedCompany);
          hideOffcanvasLoading('offcanvasAddRow');
        }
      } else {
        hideOffcanvasLoading('offcanvasAddRow');
      }
    }, 500);
  }, window.LOADING_DELAYS?.addRowForm || 2000);

  clearAndEnableEditFields();

  // Show Save button and hide Update button for Add mode
  document.getElementById('saveEditBtn').style.display = 'inline-block';
  document.getElementById('updateRowBtn').style.display = 'none';
}

// Handle Edit button click for AG Grid
function handleEditButtonClick(e) {
  if (e.target.closest('.edit-btn')) {
    // console.log('Edit button clicked');
    // Show loading state
    showOffcanvasLoading('Loading employee information...', 'offcanvasAddRow');
    // ตั้ง flag เพื่อป้องกัน onBudgetSelectionChanged ทำงาน
    window.isEditButtonClicked = true;

    const btn = e.target.closest('.edit-btn');
    const rowIndex = btn.getAttribute('data-index');
    const rowData = gridApi.getDisplayedRowAtIndex(Number(rowIndex)).data;

    // Set form mode and update UI
    document.getElementById('formMode').value = 'edit';

    // Show the offcanvas first
    getOffcanvasInstance(document.getElementById('offcanvasAddRow')).show();
    // Store edit index for later use
    document.getElementById('editRowForm').setAttribute('data-edit-index', rowIndex);

    // Simulate loading delay for edit form
    setTimeout(() => {
      // Populate dropdowns using Edit mode setup with full initialization
      populateDropdown('editCompany', BUDGET_API.companies, 'Select Company', (option, item) => {
        option.value = item.companyId;
        option.textContent = item.companyCode;
      }, true, {
        setupRelationships: 'edit', // Use Edit mode relationships
        initializeSubsystems: true, // Initialize head count management, allocation system, etc.
        populateRelatedDropdowns: true // Populate dependent dropdowns
      });
      // Use the new comprehensive populateEditForm function
      // It handles loading states, field population, validation, and UI updates
      populateEditForm(rowData);
    }, window.LOADING_DELAYS?.editRowForm || 2000);

  }
}

// Handle Toggle Master Grid click
function handleToggleMasterGridClick(e) {
  // Prevent default anchor behavior since we're handling the collapse manually
  e.preventDefault();
  // console.log('Toggle hyperlink clicked');

  const collapseElement = document.getElementById('collapseExample');

  if (collapseElement) {
    // console.log('Collapse element found');

    // Listen for the collapse show event to scroll after expansion
    const handleCollapseShown = () => {
      // console.log('Collapse shown event fired');

      // Refresh master and detail grids when collapsed area is shown
      const masterGridApi = window.getMasterGridApi ? window.getMasterGridApi() : null;
      const detailGridApi = window.getDetailGridApi ? window.getDetailGridApi() : null;

      if (masterGridApi) {
        // console.log('Refreshing master grid...');
        // Reload master data if available
        if (window.masterData && Array.isArray(window.masterData) && window.masterData.length > 0) {
          masterGridApi.setGridOption('rowData', window.masterData);
          // console.log('Master grid data reloaded');
        }
        // Size columns to fit after data reload
        setTimeout(() => {
          masterGridApi.sizeColumnsToFit();
        }, 100);
      }

      if (detailGridApi) {
        // console.log('Refreshing detail grid...');
        // Clear detail grid initially (will be populated when master row is selected)
        detailGridApi.setGridOption('rowData', []);
        // Size columns to fit
        setTimeout(() => {
          detailGridApi.sizeColumnsToFit();
        }, 100);
      }

      const masterGridSection = document.querySelector('#masterGridContainer');

      if (masterGridSection) {
        // console.log('Master grid section found, scrolling...');
        // Use requestAnimationFrame for better timing
        requestAnimationFrame(() => {
          smoothScrollToElement(masterGridSection, { offset: -135 });
        });
      } else {
        // console.error('Master grid section not found');
      }

      // Remove the event listener after use
      collapseElement.removeEventListener('shown.bs.collapse', handleCollapseShown);
      collapseElement.removeEventListener('shown.coreui.collapse', handleCollapseShown);
    };

    // Handle collapse hidden event to refresh grids when collapsed
    const handleCollapseHidden = () => {
      // console.log('Collapse hidden event fired');

      // Refresh grids when collapsed area is hidden
      const masterGridApi = window.getMasterGridApi ? window.getMasterGridApi() : null;
      const detailGridApi = window.getDetailGridApi ? window.getDetailGridApi() : null;

      if (masterGridApi) {
        setTimeout(() => {
          masterGridApi.sizeColumnsToFit();
        }, 100);
      }

      if (detailGridApi) {
        setTimeout(() => {
          detailGridApi.sizeColumnsToFit();
        }, 100);
      }

      // Remove the event listener after use
      collapseElement.removeEventListener('hidden.bs.collapse', handleCollapseHidden);
      collapseElement.removeEventListener('hidden.coreui.collapse', handleCollapseHidden);
    };

    // Add event listeners for both Bootstrap and CoreUI
    collapseElement.addEventListener('shown.bs.collapse', handleCollapseShown);
    collapseElement.addEventListener('shown.coreui.collapse', handleCollapseShown);
    collapseElement.addEventListener('hidden.bs.collapse', handleCollapseHidden);
    collapseElement.addEventListener('hidden.coreui.collapse', handleCollapseHidden);

    // Manually trigger the collapse since we prevented default behavior
    if (window.coreui && window.coreui.Collapse) {
      // CoreUI collapse
      const collapse = new window.coreui.Collapse(collapseElement);
      collapse.toggle();
    } else if (window.bootstrap && window.bootstrap.Collapse) {
      // Bootstrap collapse
      const collapse = new window.bootstrap.Collapse(collapseElement);
      collapse.toggle();
    } else {
      // Fallback - just toggle the class manually
      collapseElement.classList.toggle('show');
    }
  } else {
    // console.error('Collapse element not found');
  }
}

// Handle Search button click
function handleSearchClick() {
  var companyID = $('#companyFilter').val();
  if (!companyID) {
    showWarningModal('Please select a company before searching');
    return;
  }
  var budgetYear = $('#yearsFilter').val();
  if (!budgetYear) {
    showWarningModal('Please select a budget year before searching');
    return;
  }
  var cobu = $('#cobuFilter').val();
  // if (!cobu) {
  //   showWarningModal('Please select a COBU before searching');
  //   return;
  // }

  // Collect filter values
  var orgLevel1 = $('#divisionFilter').val();
  var orgLevel2 = $('#departmentFilter').val();
  var orgLevel3 = $('#sectionFilter').val();
  var orgUnitName = $('#locationsFilter').val();
  var empStatus = $('#empstatusFilter').val();
  var costCenterCode = $('#costcenterFilter').val();
  var positionCode = $('#positionFilter').val();
  var jobBand = $('#jobbandFilter').val();

  // Build query parameters
  var params = new URLSearchParams();
  params.append('companyID', companyID);
  if (budgetYear) params.append('budgetYear', budgetYear);
  if (cobu) params.append('COBU', cobu);
  if (orgLevel1) params.append('orgLevel1', orgLevel1);
  if (orgLevel2) params.append('orgLevel2', orgLevel2);
  if (orgLevel3) params.append('orgLevel3', orgLevel3);
  if (orgUnitName) params.append('orgUnitName', orgUnitName);
  if (empStatus) params.append('empStatus', empStatus);
  if (costCenterCode) params.append('costCenterCode', costCenterCode);
  if (positionCode) params.append('positionCode', positionCode);
  if (jobBand) params.append('jobBand', jobBand);

  // Fetch and update grids
  fetchBudgetData(params)
    .then(data => {
      // Update grid column headers first
      updateGridColumns();

      // Get grid APIs from global functions
      const gridApi = window.getGridApi ? window.getGridApi() : null;
      const masterGridApi = window.getMasterGridApi ? window.getMasterGridApi() : null;

      // Update AG Grid row data
      if (gridApi) {
        gridApi.setGridOption('rowData', data);
      }

      // Store raw data
      rawData = data;

      // Create and set master data
      masterData = createMasterData(data);
      window.masterData = masterData; // Make it globally accessible
      if (masterGridApi) {
        masterGridApi.setGridOption('rowData', masterData);
      }

      // Enable add row button only if data is not empty
      const addRowBtn = document.getElementById('addRowBtn');
      if (addRowBtn) {
        addRowBtn.disabled = !(Array.isArray(data) && data.length > 0);
      }

      // Enable toggle master grid button only if data is not empty
      const toggleMasterGridBtn = document.getElementById('toggleMasterGridBtn');
      if (toggleMasterGridBtn) {
        toggleMasterGridBtn.disabled = !(Array.isArray(data) && data.length > 0);
      }

      // Scroll to budget grid container after search results are loaded
      const budgetGridSection = document.querySelector('#budgetGridContainer');
      if (budgetGridSection) {
        // console.log('Budget grid section found, scrolling...');
        // Use requestAnimationFrame for better timing
        requestAnimationFrame(() => {
          smoothScrollToElement(budgetGridSection, { offset: -130 });
        });
      } else {
        // console.error('Budget grid section not found');
      }
    })
    .catch(error => {
      // console.error('Error fetching budget data:', error);
      // Disable buttons on error
      const addRowBtn = document.getElementById('addRowBtn');
      if (addRowBtn) {
        addRowBtn.disabled = true;
      }

      const toggleMasterGridBtn = document.getElementById('toggleMasterGridBtn');
      if (toggleMasterGridBtn) {
        toggleMasterGridBtn.disabled = true;
      }
    });
}

// Handle Reset button click
function handleResetClick() {
  // Refresh page immediately
  location.reload();
}

// Handle Company filter change
function handleCompanyFilterChange() {
  const companyID = $(this).val();
  const filterIds = [
    '#cobuFilter', '#yearsFilter', '#costcenterFilter', '#divisionFilter', '#departmentFilter',
    '#sectionFilter', '#locationsFilter', '#positionFilter', '#jobbandFilter', '#empstatusFilter'
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

            updateGridForCompany(companyID);
      refreshGridForCompanyFilter();

      // console.log(`Company changed to: ${formatCompanyDisplayName(companyID)}`);

      // Add any additional company-specific logic here

      // Enable dependent filters and update them
      filterIds.forEach(id => $(id).prop('disabled', false));

      // Update main cascading filters first
      debouncedFilterUpdateCoBU(companyID);
      debouncedFilterUpdateBudgetYears(companyID);
      debouncedFilterUpdateEmpStatuses(companyID);

      // Clear other filters that depend on COBU/Year selection
      ['#costcenterFilter', '#divisionFilter', '#departmentFilter', '#sectionFilter',
       '#locationsFilter', '#positionFilter', '#jobbandFilter'].forEach(id => {
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

// Initialize UI state - disable buttons initially
function initializeUIState() {
  // Disable add row button initially
  const addRowBtn = document.getElementById('addRowBtn');
  if (addRowBtn) {
    addRowBtn.disabled = true;
  }

  // Disable toggleMasterGrid button initially
  const toggleMasterGridBtn = document.getElementById('toggleMasterGridBtn');
  if (toggleMasterGridBtn) {
    toggleMasterGridBtn.disabled = true;
  }

  // console.log('UI state initialized - buttons disabled initially');
}

// Bind all event listeners
function bindEventListeners() {
  // Button event listeners
  document.getElementById('addRowBtn').addEventListener('click', handleAddRowClick);
  document.getElementById('toggleMasterGridBtn').addEventListener('click', handleToggleMasterGridClick);
  document.addEventListener('click', handleEditButtonClick);

  // jQuery event listeners for buttons
  $("#searchBtn").on("click", handleSearchClick);
  $("#resetBtn").on("click", handleResetClick);
  $("#toggleMasterGridBtn").on("click", handleToggleMasterGridClick);

  // Filter change listeners
  $('#companyFilter').off('change.filterCascade').on('change.filterCascade', handleCompanyFilterChange);

  // Setup filter cascade relationships
  setupFilterCascadeRelationships();

  // console.log('All event listeners bound successfully');
}

// Helper function to populate edit form (implementation now in budget.offcanvas.js)
function populateEditForm(rowData) {
  // Call the actual implementation from budget.offcanvas.js
  if (typeof window.populateEditForm === 'function') {
    window.populateEditForm(rowData);
  } else {
    console.error('❌ populateEditForm function not found in budget.offcanvas.js');
  }
}

// Export functions to global scope for use by other modules
window.bindEventListeners = bindEventListeners;
window.initializeUIState = initializeUIState;
window.handleAddRowClick = handleAddRowClick;
window.handleSearchClick = handleSearchClick;
window.handleResetClick = handleResetClick;
window.handleToggleMasterGridClick = handleToggleMasterGridClick;
window.populateEditForm = populateEditForm;
window.clearAndEnableEditFields = clearAndEnableEditFields;
window.checkModuleDependencies = checkModuleDependencies;

// Export data variables for access by other modules
window.rawData = rawData;
window.masterData = masterData;

// 🔧 FIX: Add global error handler to prevent PointerEvent crashes
window.addEventListener('error', (event) => {
  // Suppress PointerEvent errors that cause infinite loops
  if (event.error && event.error.message &&
      (event.error.message.includes('PointerEvent') ||
       event.error.message.includes('111111111'))) {
    console.warn('🔧 Suppressed PointerEvent error to prevent infinite loop');
    event.preventDefault();
    return false;
  }
});

// 🔧 FIX: Add unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('🔧 Unhandled Promise Rejection:', event.reason);
  // Log but don't crash the application
  event.preventDefault();
});

console.log('🔧 Budget Events module loaded with enhanced error handling');
