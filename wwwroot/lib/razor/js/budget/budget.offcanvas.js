/**
 * Budget Offcanvas Functions
 * Handles offcanvas operations, form management, and dropdown cascading
 */
// Prevent closing side panel except by btn-close or cancelEditBtn
let allowOffcanvasClose = false;
let allowSaveClose = false;
let allowUpdateClose = false;

// Modal Control System Functions
function preventSaveModalHide(e) {
  // Check if close button was clicked
  if (e.target && (e.target.classList.contains('btn-close') || e.target.closest('.btn-close'))) {
    return true; // Allow close button to work
  }

  if (!allowSaveClose) {
    e.preventDefault();
    return false;
  }
}

function preventUpdateModalHide(e) {
  // Check if close button was clicked
  if (e.target && (e.target.classList.contains('btn-close') || e.target.closest('.btn-close'))) {
    return true; // Allow close button to work
  }

  if (!allowUpdateClose) {
    e.preventDefault();
    return false;
  }
}

function safeCloseSaveModal() {
  allowSaveClose = true;
  const modal = bootstrap.Modal.getInstance(document.getElementById('confirmSaveModal'));
  if (modal) {
    modal.hide();
  }
  setTimeout(() => { allowSaveClose = false; }, 500);
}

function safeCloseUpdateModal() {
  allowUpdateClose = true;
  const modal = bootstrap.Modal.getInstance(document.getElementById('confirmUpdateModal'));
  if (modal) {
    modal.hide();
  }
  setTimeout(() => { allowUpdateClose = false; }, 500);
}

// Populate all Offcanvas dropdowns from API
// populateOffcanvasDropdowns function removed - functionality consolidated into enhanced populateDropdown() in budget.api.js

// Setup cascading relationships for Add Row mode
function setupOffcanvasDropdownRelationshipsForAdd() {
  // Remove existing event listeners to prevent duplicates
  $('#editCompany').off('change.offcanvas');
  $('#editCobu').off('change.offcanvas');
  $('#editYear').off('change.offcanvas');
  $('#editCostCenter').off('change.offcanvas');
  $('#editDivision').off('change.offcanvas');
  $('#editDepartment').off('change.offcanvas');
  $('#editSection').off('change.offcanvas');
  $('#editLocation').off('change.offcanvas');
  $('#editPosition').off('change.offcanvas');

  // Company change - update all dependent dropdowns sequentially
  $('#editCompany').on('change.offcanvas', function () {
    const companyID = $(this).val();
    if (companyID) {
      // Update Format and Year first (immediate)
      updateOffcanvasEmpFormats(companyID);
      updateOffcanvasYears(companyID);

      // Use debounced functions for other APIs to prevent rapid calls
      // console.log('🔄 Calling debouncedUpdateOffcanvasEmpStatus for companyID:', companyID);
      debouncedUpdateOffcanvasEmpStatus();
      debouncedUpdateOffcanvasCostCenters();
      // ⭐ OPTION 1: Remove static field updates that cause "Element not found" errors
      // debouncedUpdateOffcanvasEmployeeTypes(); // Causes editEmpType not found
      // debouncedUpdateOffcanvasNewHC(); // Causes editNewHC not found
      // debouncedUpdateOffcanvasNewPeriod(); // Causes editNewPeriod not found
      // debouncedUpdateOffcanvasNOfMonth(); // Causes editNOfMonth not found
      // debouncedUpdateOffcanvasNewLEPeriod(); // Causes editNewLEPeriod not found
      // debouncedUpdateOffcanvasLEnOfMonth(); // Causes editLEnOfMonth not found

      debouncedUpdateOffcanvasDivisions();
      debouncedUpdateOffcanvasDepartments();
      debouncedUpdateOffcanvasSections();
      debouncedUpdateOffcanvasLocations();
      //debouncedUpdateOffcanvasPositions();
      //debouncedUpdateOffcanvasJobBands();
      debouncedUpdateOffcanvasMstPositions();
      debouncedUpdateOffcanvasMstJobBands();
      debouncedUpdateOffcanvasPlanCostCenters();
      debouncedUpdateOffcanvasSalaryStructure();
      debouncedUpdateOffcanvasGroupRunrate();
      debouncedUpdateOffcanvasFocusHC();
      debouncedUpdateOffcanvasFocusPE();
      debouncedUpdateOffcanvasExecutives();
      debouncedUpdateOffcanvasBonusTypes();

      // ⭐ OPTION 1: Update dynamic head count dropdowns directly
      console.log('🔄 [Company Change] Triggering dynamic head count update...');
      setTimeout(() => {
        updateAllDynamicHeadCountDropdowns();
      }, 100); // Small delay to ensure other dropdowns load first

      // ⭐ Update dynamic forms based on company selection
      if (window.budgetDynamicFormsManager && window.budgetDynamicFormsManager.showCompanyFields) {
        window.budgetDynamicFormsManager.showCompanyFields(companyID);
      }

      // ⭐ Generate benefits templates for the selected company
      if (window.benefitsTemplatesManager && window.benefitsTemplatesManager.generateTemplatesForCompany) {
        setTimeout(() => {
          window.benefitsTemplatesManager.generateTemplatesForCompany(companyID);
        }, 500); // Wait for dropdowns to load first
      }
    } else {
      clearOffcanvasDropdowns(['editFormat', 'editYear', 'editCostCenter', 'editDivision', 'editDepartment', 'editSection', 'editLocation', 'editEmpStatus', 'editEmpType', 'editNewHC', 'editNewPeriod', 'editNOfMonth', 'editNewLEPeriod', 'editLEnOfMonth', 'editNewLEnOfMonth', 'editPosition', 'editJobBand', 'editPlanCostCenter', 'editSalaryStructure', 'editGroupRunrate', 'editFocusHC', 'editFocusPE', 'editExecutives', 'editBgBonusType']);
    }
  });

  // COBU/Year change - update dependent dropdowns
  $('#editCobu, #editYear').on('change.offcanvas', function () {
    const companyID = $('#editCompany').val();
    if (companyID) {
      debouncedUpdateOffcanvasCostCenters();
      debouncedUpdateOffcanvasDivisions();
      debouncedUpdateOffcanvasDepartments();
      debouncedUpdateOffcanvasSections();
      debouncedUpdateOffcanvasLocations();
      //debouncedUpdateOffcanvasPositions();
      //debouncedUpdateOffcanvasJobBands();
      debouncedUpdateOffcanvasMstPositions();
      debouncedUpdateOffcanvasMstJobBands();
      debouncedUpdateOffcanvasBonusTypes(); // Update bonus types when year changes
    }
  });

  // Cost Center change
  $('#editCostCenter').on('change.offcanvas', function () {
    // 1. Update dropdowns first
    debouncedUpdateOffcanvasDivisions();
    debouncedUpdateOffcanvasDepartments();
    debouncedUpdateOffcanvasSections();
    debouncedUpdateOffcanvasLocations();

    // 2. Allocation card show/hide logic (custom event)
    const selectedValue = this.value;
    const allocationCard = document.getElementById('budgetAllocationCard');
    const allocationContainer = document.getElementById('allocationContainer');

    if (allocationCard) {
      if (selectedValue === AllocationCostCenterCode) {
        // แสดง Budget Allocation Card เมื่อเลือก Cost Center = '90066'
        // console.log('🎯 Cost Center matches allocation code:', selectedValue);
        allocationCard.classList.remove('d-none');
        // console.log('📋 Allocation card shown');

        // หาก allocationContainer ว่าง ให้เรียก allocation module เพื่อเพิ่ม row
        // console.log('🔍 Checking container:', {
        //   container: !!allocationContainer,
        //   childrenLength: allocationContainer?.children?.length || 'no container'
        // });

        if (allocationContainer && allocationContainer.children.length === 0) {
          // console.log('🚀 Dispatching allocationCardVisible event...');
          const event = new CustomEvent('allocationCardVisible', { detail: { costCenter: selectedValue } });
          window.dispatchEvent(event);
          // console.log('✅ Event dispatched');          // Fallback: Direct call if event system fails
          setTimeout(() => {
            if (allocationContainer.children.length === 0) {
              // console.log('🔄 Event fallback: calling allocation directly...');
              if (typeof window.handleAllocationCardVisible === 'function') {
                window.handleAllocationCardVisible({ detail: { costCenter: selectedValue } });
              } else if (typeof window.initializeAllocationManagement === 'function') {
                // console.log('🔧 Direct initialization...');
                window.initializeAllocationManagement();
                if (typeof window.addAllocationRow === 'function') {
                  window.addAllocationRow();
                }
              }
            }
          }, 100);
        } else {
          // console.log('⚠️ Container already has content or not found');
        }
      } else {
        // ซ่อน Budget Allocation Card และ dynamic forms เมื่อเลือก Cost Center อื่น
        allocationCard.classList.add('d-none');

        // เคลียร์ allocation data และ dynamic forms
        if (allocationContainer) {
          allocationContainer.innerHTML = '';
        }

        // ลบ dynamic forms (backward compatibility - CC ≠ '90066' ต้องทำงานแบบเดิม)
        if (typeof removeDynamicForms === 'function') {
          removeDynamicForms();
          // console.log('Dynamic forms removed due to cost center change to:', selectedValue);
        }

        // แจ้ง allocation module ให้รีเซ็ต
        const event = new CustomEvent('allocationCardHidden', { detail: { costCenter: selectedValue } });
        window.dispatchEvent(event);
      }
    }

    // 3. Auto-select Plan Cost Center based on selected Cost Center
    if (selectedValue) {
      // Set editPlanCostCenter to match editCostCenter value
      const planCostCenterDropdown = document.getElementById('editPlanCostCenter');
      if (planCostCenterDropdown) {
        // Find option with matching value
        const matchingOption = planCostCenterDropdown.querySelector(`option[value="${selectedValue}"]`);
        if (matchingOption) {
          planCostCenterDropdown.value = selectedValue;
          // Trigger change event to update dependent dropdowns
          $(planCostCenterDropdown).trigger('change');
        }
      }
    }
  });

  // Division change
  $('#editDivision').on('change.offcanvas', function () {
    debouncedUpdateOffcanvasDepartments();
    debouncedUpdateOffcanvasSections();
    debouncedUpdateOffcanvasLocations();
  });

  // Department change
  $('#editDepartment').on('change.offcanvas', function () {
    debouncedUpdateOffcanvasSections();
    debouncedUpdateOffcanvasLocations();
  });

  // Section change
  $('#editSection').on('change.offcanvas', function () {
    debouncedUpdateOffcanvasLocations();
  });

  // Location change
  $('#editLocation').on('change.offcanvas', function () {
    //debouncedUpdateOffcanvasPositions();
  });

  // Position change
  $('#editPosition').on('change.offcanvas', function () {
    //debouncedUpdateOffcanvasJobBands();
    debouncedUpdateOffcanvasMstJobBands();
  });

  // Job Band change
  $('#editJobBand').on('change.offcanvas', function () {
    debouncedUpdateOffcanvasSalaryRanges();
  });

  // Plan Cost Center change
  $('#editPlanCostCenter').on('change.offcanvas', function () {
    debouncedUpdateOffcanvasGroupRunrate();
  });

  // Salary Structure change
  $('#editSalaryStructure').on('change.offcanvas', function () {
    const selectedValue = $(this).val();
    const editLePayrollField = document.getElementById('editLePayroll');

    if (editLePayrollField && selectedValue) {
      // Set the selected salary structure value to editLePayroll field
      editLePayrollField.value = selectedValue;

      // Trigger change event if needed for any dependent functionality
      $(editLePayrollField).trigger('change');
    } else if (editLePayrollField && !selectedValue) {
      // Clear the field if no salary structure is selected
      editLePayrollField.value = '';
    }
  });
}

// Setup cascading relationships for Edit Row mode
function setupOffcanvasDropdownRelationshipsForEdit() {
  // Similar to Add mode but may have different behavior for edit
  setupOffcanvasDropdownRelationshipsForAdd();
  // console.log('Offcanvas dropdown relationships for Edit mode set up successfully');
}
/**
 * Setup cascading relationships between offcanvas dropdowns (Legacy - maintained for compatibility)
 */
function setupOffcanvasDropdownRelationships() {
  const formMode = document.getElementById('formMode')?.value;

  if (formMode === 'edit') {
    setupOffcanvasDropdownRelationshipsForEdit();
  } else {
    setupOffcanvasDropdownRelationshipsForAdd();
  }

  // ⭐ OPTION A: Setup dedicated dynamic head count listener
  setupDynamicHeadCountCompanyListener();
}

// Clear specified offcanvas dropdowns
function clearOffcanvasDropdowns(dropdownIds) {
  dropdownIds.forEach(id => {
    const dropdown = document.getElementById(id);
    if (dropdown) {
      dropdown.innerHTML = '<option value="">Select...</option>';
      // Update select2 if initialized
      if ($(dropdown).hasClass('select2-hidden-accessible')) {
        $(dropdown).trigger('change');
      }
    }
  });
}

// Update COBU dropdown
function updateOffcanvasCoBU(companyID) {
  if (!companyID) return;

  try {
    // Validate company using core functions
    if (!validateCompanySelection(companyID)) {
      throw new Error(getCompanyErrorMessage('INVALID_COMPANY', companyID));
    }

    // console.log(`Updating offcanvas COBU for: ${formatCompanyDisplayName(companyID)}`);

    populateDropdown('editCobu', `${BUDGET_API.cobu}?companyID=${companyID}`, 'Select COBU', (option, item) => {
      option.value = item;
      option.textContent = item;
    });
  } catch (error) {
    console.error('Error updating offcanvas COBU:', error);
    showWarningModal(error.message);
  }
}

// Update Employee Formats dropdown (Legacy compatibility)
function updateOffcanvasEmpFormats(companyID) {
  return updateOffcanvasCoBU(companyID);
}

// Update Years dropdown
function updateOffcanvasYears(companyID) {
  let yearParams = [];
  if (companyID) yearParams.push(`companyID=${companyID}`);
  const selectedCobu = document.getElementById('editCobu')?.value;
  if (selectedCobu) yearParams.push(`COBU=${encodeURIComponent(selectedCobu)}`);
  const yearQuery = yearParams.length ? `?${yearParams.join('&')}` : '';

  populateDropdown('editYear', `${BUDGET_API.budgetYears}${yearQuery}`, 'Select Year', (option, item) => {
    option.value = item;
    option.textContent = item;
  }, true);
}

// Update Cost Centers dropdown
function updateOffcanvasCostCenters() {
  const companyID = document.getElementById('editCompany')?.value;
  const selectedCobu = document.getElementById('editCobu')?.value;
  const selectedYear = document.getElementById('editYear')?.value;

  let costCenterParams = [];
  if (companyID) costCenterParams.push(`companyID=${companyID}`);
  if (selectedCobu) costCenterParams.push(`Cobu=${encodeURIComponent(selectedCobu)}`);
  if (selectedYear) costCenterParams.push(`budgetYear=${encodeURIComponent(selectedYear)}`);
  const costCenterQuery = costCenterParams.length ? `?${costCenterParams.join('&')}` : '';

  populateDropdown('editCostCenter', `${BUDGET_API.costCenters}${costCenterQuery}`, 'Select Cost Center', (option, item) => {
    option.value = item.costCenterCode;
    option.textContent = `${item.costCenterName} (${item.costCenterCode})`;
  });
}

// Update Employee Status dropdown
function updateOffcanvasEmpStatus() {

  const companyID = document.getElementById('editCompany')?.value;
  const formMode = document.getElementById('formMode')?.value;
// console.log('🔄 updateOffcanvasEmpStatus called in mode:', formMode);
  if (formMode === 'edit') {
    const selectedCobu = document.getElementById('editCobu')?.value;
    const selectedYear = document.getElementById('editYear')?.value;
    const selectedCostCenter = document.getElementById('editCostCenter')?.value;
    const selectedDivision = document.getElementById('editDivision')?.value;
    const selectedDepartment = document.getElementById('editDepartment')?.value;
    const selectedSection = document.getElementById('editSection')?.value;
    const selectedLocation = document.getElementById('editLocation')?.value;
    const selectedPosition = document.getElementById('editPosition')?.value;

    let empStatusParams = [];
    if (companyID) empStatusParams.push(`companyID=${companyID}`);
    if (selectedCobu) empStatusParams.push(`Cobu=${encodeURIComponent(selectedCobu)}`);
    if (selectedYear) empStatusParams.push(`budgetYear=${encodeURIComponent(selectedYear)}`);
    if (selectedCostCenter) empStatusParams.push(`costCenterCode=${encodeURIComponent(selectedCostCenter)}`);
    if (selectedDivision) empStatusParams.push(`divisionCode=${encodeURIComponent(selectedDivision)}`);
    if (selectedDepartment) empStatusParams.push(`departmentCode=${encodeURIComponent(selectedDepartment)}`);
    if (selectedSection) empStatusParams.push(`sectionCode=${encodeURIComponent(selectedSection)}`);
    if (selectedLocation) empStatusParams.push(`locationCode=${encodeURIComponent(selectedLocation)}`);
    if (selectedPosition) empStatusParams.push(`positionCode=${encodeURIComponent(selectedPosition)}`);
    const empStatusQuery = empStatusParams.length ? `?${empStatusParams.join('&')}` : '';

    populateDropdown('editEmpStatus', `${BUDGET_API.empStatuses}${empStatusQuery}`, 'Select Employee Status', (option, item) => {
      option.value = item;
      option.textContent = item;
    }, true);
  } else {
    const statusParams = [`statusType=Budget`];
    if (companyID) statusParams.push(`companyId=${companyID}`);
    const statusQuery = statusParams.length ? `?${statusParams.join('&')}` : '';

    populateDropdown('editEmpStatus', `${SELECT_API.statuses}${statusQuery}`, 'Select Employee Status', (option, item) => {
      option.value = item.statusCode;
      option.textContent = item.statusName;
    }, true);

    //$('#editEmpStatus').removeAttr('disabled');
  }

}

// Update Employee Types dropdown (static field only)
function updateOffcanvasEmployeeTypes() {
  const companyID = document.getElementById('editCompany')?.value;

  if (companyID) {
    // Update static edit form field only
    populateDropdown('editEmpType', `${SELECT_API.employeeTypes}?companyId=${companyID}`, 'Select Employee Type', (option, item) => {
      option.value = item.itemCode;
      option.textContent = item.itemName;
    }, true);
  }
}

// Update New HC dropdown (static field only)
function updateOffcanvasNewHC() {
  const companyID = document.getElementById('editCompany')?.value;

  if (companyID) {
    // Update static edit form field only
    populateDropdown('editNewHC', `${SELECT_API.newHC}?companyId=${companyID}`, 'Select New HC', (option, item) => {
      option.value = item.itemCode;
      option.textContent = item.itemName;
    }, true);
  }
}

// Update New Period dropdown (static field only)
function updateOffcanvasNewPeriod() {
  const companyID = document.getElementById('editCompany')?.value;

  if (companyID) {
    // Update static edit form field only
    populateDropdown('editNewPeriod', `${SELECT_API.noOfMonths}?companyId=${companyID}`, 'Select New Period', (option, item) => {
      option.value = item.itemCode;
      option.textContent = item.itemName;
    }, true);
  }
}

// Update No. of Month dropdown (uses same API as New Period)
function updateOffcanvasNOfMonth() {
  const companyID = document.getElementById('editCompany')?.value;

  if (companyID) {
    populateDropdown('editNOfMonth', `${SELECT_API.noOfMonths}?companyId=${companyID}`, 'Select No. of Month', (option, item) => {
      option.value = item.itemCode;
      option.textContent = item.itemName;
    }, true);
  }
}

// Update New LE Period dropdown
function updateOffcanvasNewLEPeriod() {
  const companyID = document.getElementById('editCompany')?.value;

  if (companyID) {
    populateDropdown('editNewLEPeriod', `${SELECT_API.leNoOfMonths}?companyId=${companyID}`, 'Select New LE Period', (option, item) => {
      option.value = item.itemCode;
      option.textContent = item.itemName;
    }, true);
  }
}

// Update LE No. of Month dropdown (uses same API as New LE Period)
function updateOffcanvasLEnOfMonth() {
  const companyID = document.getElementById('editCompany')?.value;

  if (companyID) {
    populateDropdown('editLEnOfMonth', `${SELECT_API.leNoOfMonths}?companyId=${companyID}`, 'Select LE No. of Month', (option, item) => {
      option.value = item.itemCode;
      option.textContent = item.itemName;
    }, true);
  }
}

// Update Join PVF dropdown (NEW - ref from No. of Month dropdown)
function updateOffcanvasJoinPVF() {
  const companyID = document.getElementById('editCompany')?.value;

  if (companyID) {
    populateDropdown('editJoinPvf', `${SELECT_API.joinPvf}?companyId=${companyID}`, 'Select Join PVF', (option, item) => {
      option.value = item.itemCode;
      option.textContent = item.itemName;
    }, true);
  }
}

// Update Focus HC dropdown
function updateOffcanvasFocusHC() {
  const companyID = document.getElementById('editCompany')?.value;

  if (companyID) {
    populateDropdown('editFocusHC', `${SELECT_API.focusHC}?companyId=${companyID}`, 'Select Focus HC', (option, item) => {
      option.value = item.itemCode;
      option.textContent = item.itemName;
    }, true);
  }
}

//update Focus PE dropdown
function updateOffcanvasFocusPE() {
  const companyID = document.getElementById('editCompany')?.value;

  if (companyID) {
    populateDropdown('editFocusPE', `${SELECT_API.focusPE}?companyId=${companyID}`, 'Select Focus PE', (option, item) => {
      option.value = item.itemCode;
      option.textContent = item.itemName;
    }, true);
  }
}

//update Executives dropdown
function updateOffcanvasExecutives() {
  const companyID = document.getElementById('editCompany')?.value;

  if (companyID) {
    populateDropdown('editEmployeeLevel', `${SELECT_API.executives}?companyId=${companyID}`, 'Select Executives', (option, item) => {
      option.value = item.itemCode;
      option.textContent = item.itemName;
    }, true);
  }
}

// Update Divisions dropdown
function updateOffcanvasDivisions() {
  const companyID = document.getElementById('editCompany')?.value;
  const selectedCobu = document.getElementById('editCobu')?.value;
  const selectedYear = document.getElementById('editYear')?.value;
  const selectedCostCenter = document.getElementById('editCostCenter')?.value;

  let divisionParams = [];
  if (companyID) divisionParams.push(`companyID=${companyID}`);
  if (selectedCobu) divisionParams.push(`Cobu=${encodeURIComponent(selectedCobu)}`);
  if (selectedYear) divisionParams.push(`budgetYear=${encodeURIComponent(selectedYear)}`);
  if (selectedCostCenter) divisionParams.push(`costCenterCode=${encodeURIComponent(selectedCostCenter)}`);
  const divisionQuery = divisionParams.length ? `?${divisionParams.join('&')}` : '';

  populateDropdown('editDivision', `${BUDGET_API.divisions}${divisionQuery}`, 'Select Division', (option, item) => {
    option.value = item;
    option.textContent = item;
  });
}

// Update Departments dropdown
function updateOffcanvasDepartments() {
  const companyID = document.getElementById('editCompany')?.value;
  const selectedCobu = document.getElementById('editCobu')?.value;
  const selectedYear = document.getElementById('editYear')?.value;
  const selectedCostCenter = document.getElementById('editCostCenter')?.value;
  const selectedDivision = document.getElementById('editDivision')?.value;

  let departmentParams = [];
  if (companyID) departmentParams.push(`companyID=${companyID}`);
  if (selectedCobu) departmentParams.push(`Cobu=${encodeURIComponent(selectedCobu)}`);
  if (selectedYear) departmentParams.push(`budgetYear=${encodeURIComponent(selectedYear)}`);
  if (selectedCostCenter) departmentParams.push(`costCenterCode=${encodeURIComponent(selectedCostCenter)}`);
  if (selectedDivision) departmentParams.push(`divisionCode=${encodeURIComponent(selectedDivision)}`);
  const departmentQuery = departmentParams.length ? `?${departmentParams.join('&')}` : '';

  populateDropdown('editDepartment', `${BUDGET_API.departments}${departmentQuery}`, 'Select Department', (option, item) => {
    option.value = item;
    option.textContent = item;
  });
}

// Update Sections dropdown
function updateOffcanvasSections() {
  const companyID = document.getElementById('editCompany')?.value;
  const selectedCobu = document.getElementById('editCobu')?.value;
  const selectedYear = document.getElementById('editYear')?.value;
  const selectedCostCenter = document.getElementById('editCostCenter')?.value;
  const selectedDivision = document.getElementById('editDivision')?.value;
  const selectedDepartment = document.getElementById('editDepartment')?.value;

  let sectionParams = [];
  if (companyID) sectionParams.push(`companyID=${companyID}`);
  if (selectedCobu) sectionParams.push(`Cobu=${encodeURIComponent(selectedCobu)}`);
  if (selectedYear) sectionParams.push(`budgetYear=${encodeURIComponent(selectedYear)}`);
  if (selectedCostCenter) sectionParams.push(`costCenterCode=${encodeURIComponent(selectedCostCenter)}`);
  if (selectedDivision) sectionParams.push(`divisionCode=${encodeURIComponent(selectedDivision)}`);
  if (selectedDepartment) sectionParams.push(`departmentCode=${encodeURIComponent(selectedDepartment)}`);
  const sectionQuery = sectionParams.length ? `?${sectionParams.join('&')}` : '';

  populateDropdown('editSection', `${BUDGET_API.sections}${sectionQuery}`, 'Select Section', (option, item) => {
    option.value = item;
    option.textContent = item;
  });
}

// Update Locations dropdown
function updateOffcanvasLocations() {
  const companyID = document.getElementById('editCompany')?.value;
  const selectedCobu = document.getElementById('editCobu')?.value;
  const selectedYear = document.getElementById('editYear')?.value;
  const selectedCostCenter = document.getElementById('editCostCenter')?.value;
  const selectedDivision = document.getElementById('editDivision')?.value;
  const selectedDepartment = document.getElementById('editDepartment')?.value;
  const selectedSection = document.getElementById('editSection')?.value;

  let locationParams = [];
  if (companyID) locationParams.push(`companyID=${companyID}`);
  if (selectedCobu) locationParams.push(`Cobu=${encodeURIComponent(selectedCobu)}`);
  if (selectedYear) locationParams.push(`budgetYear=${encodeURIComponent(selectedYear)}`);
  if (selectedCostCenter) locationParams.push(`costCenterCode=${encodeURIComponent(selectedCostCenter)}`);
  if (selectedDivision) locationParams.push(`divisionCode=${encodeURIComponent(selectedDivision)}`);
  if (selectedDepartment) locationParams.push(`departmentCode=${encodeURIComponent(selectedDepartment)}`);
  if (selectedSection) locationParams.push(`sectionCode=${encodeURIComponent(selectedSection)}`);
  const locationQuery = locationParams.length ? `?${locationParams.join('&')}` : '';

  populateDropdown('editLocation', `${BUDGET_API.storeNames}${locationQuery}`, 'Select Location', (option, item) => {
    option.value = item;
    option.textContent = item;
  });
}

// Update Positions dropdown
function updateOffcanvasPositions() {
  const companyID = document.getElementById('editCompany')?.value;
  const selectedCobu = document.getElementById('editCobu')?.value;
  const selectedYear = document.getElementById('editYear')?.value;
  const selectedCostCenter = document.getElementById('editCostCenter')?.value;
  const selectedDivision = document.getElementById('editDivision')?.value;
  const selectedDepartment = document.getElementById('editDepartment')?.value;
  const selectedSection = document.getElementById('editSection')?.value;
  const selectedLocation = document.getElementById('editLocation')?.value;

  let positionParams = [];
  if (companyID) positionParams.push(`companyID=${companyID}`);
  if (selectedCobu) positionParams.push(`Cobu=${encodeURIComponent(selectedCobu)}`);
  if (selectedYear) positionParams.push(`budgetYear=${encodeURIComponent(selectedYear)}`);
  if (selectedCostCenter) positionParams.push(`costCenterCode=${encodeURIComponent(selectedCostCenter)}`);
  if (selectedDivision) positionParams.push(`divisionCode=${encodeURIComponent(selectedDivision)}`);
  if (selectedDepartment) positionParams.push(`departmentCode=${encodeURIComponent(selectedDepartment)}`);
  if (selectedSection) positionParams.push(`sectionCode=${encodeURIComponent(selectedSection)}`);
  if (selectedLocation) positionParams.push(`locationCode=${encodeURIComponent(selectedLocation)}`);
  const positionQuery = positionParams.length ? `?${positionParams.join('&')}` : '';

  populateDropdown('editPosition', `${BUDGET_API.positions}${positionQuery}`, 'Select Position', (option, item) => {
    option.value = item.positionCode;
    option.textContent = `${item.positionName} (${item.positionCode})`;
  }, true);
}

// Update Mst Positions dropdown
function updateOffcanvasMstPositions() {
  const companyID = document.getElementById('editCompany')?.value;

  if (companyID) {
    populateDropdown('editPosition', `${SELECT_API.positions}?companyId=${companyID}`, 'Select Position', (option, item) => {
      option.value = item.positionCode;
      option.textContent = `${item.positionName} (${item.positionCode})`;
    }, true);
  }
}

// Update Job Bands dropdown
function updateOffcanvasJobBands() {
  const companyID = document.getElementById('editCompany')?.value;
  const selectedCobu = document.getElementById('editCobu')?.value;
  const selectedYear = document.getElementById('editYear')?.value;
  const selectedCostCenter = document.getElementById('editCostCenter')?.value;
  const selectedDivision = document.getElementById('editDivision')?.value;
  const selectedDepartment = document.getElementById('editDepartment')?.value;
  const selectedSection = document.getElementById('editSection')?.value;
  const selectedLocation = document.getElementById('editLocation')?.value;
  const selectedPosition = document.getElementById('editPosition')?.value;
  const selectedEmpStatus = document.getElementById('editEmpStatus')?.value;

  let jobBandParams = [];
  if (companyID) jobBandParams.push(`companyID=${companyID}`);
  if (selectedCobu) jobBandParams.push(`Cobu=${encodeURIComponent(selectedCobu)}`);
  if (selectedYear) jobBandParams.push(`budgetYear=${encodeURIComponent(selectedYear)}`);
  if (selectedCostCenter) jobBandParams.push(`costCenterCode=${encodeURIComponent(selectedCostCenter)}`);
  if (selectedDivision) jobBandParams.push(`divisionCode=${encodeURIComponent(selectedDivision)}`);
  if (selectedDepartment) jobBandParams.push(`departmentCode=${encodeURIComponent(selectedDepartment)}`);
  if (selectedSection) jobBandParams.push(`sectionCode=${encodeURIComponent(selectedSection)}`);
  if (selectedLocation) jobBandParams.push(`locationCode=${encodeURIComponent(selectedLocation)}`);
  if (selectedPosition) jobBandParams.push(`positionCode=${encodeURIComponent(selectedPosition)}`);
  if (selectedEmpStatus) jobBandParams.push(`empStatus=${encodeURIComponent(selectedEmpStatus)}`);
  const jobBandQuery = jobBandParams.length ? `?${jobBandQuery.join('&')}` : '';

  populateDropdown('editJobBand', `${BUDGET_API.jobBands}${jobBandQuery}`, 'Select Job Band', (option, item) => {
    option.value = item;
    option.textContent = item;
  }, true);
}

// Update Mst Job Bands dropdown
function updateOffcanvasMstJobBands() {
  const companyID = document.getElementById('editCompany')?.value;
  const selectedPosition = document.getElementById('editPosition')?.value;

  let jobBandParams = [];
  if (companyID) jobBandParams.push(`companyId=${companyID}`);
  if (selectedPosition) jobBandParams.push(`positionCode=${encodeURIComponent(selectedPosition)}`);
  const jobBandQuery = jobBandParams.length ? `?${jobBandParams.join('&')}` : '';

  populateDropdown('editJobBand', `${SELECT_API.jobBands}${jobBandQuery}`, 'Select Job Band', (option, item) => {
    option.value = item.jbCode;
    option.textContent = item.jbName;
  }, true);
}

// Update Plan Cost Centers dropdown
function updateOffcanvasPlanCostCenters() {
  const companyID = document.getElementById('editCompany')?.value;

  if (companyID) {
    populateDropdown('editPlanCostCenter', `${SELECT_API.planCostCenters}?companyId=${companyID}`, 'Select Plan Cost Center', (option, item) => {
      option.value = item.costCenterCode;
      option.textContent = `${item.costCenterName} (${item.costCenterCode})`;
    }, true);
  }
}

//Update Salary Structure
function updateOffcanvasSalaryStructure() {
  const companyID = document.getElementById('editCompany')?.value;

  if (companyID) {
    populateDropdown('editSalaryStructure', `${SELECT_API.salaryStructures}?companyId=${companyID}`, 'Select Salary Structure', (option, item) => {
      option.value = item.itemCode;
      option.textContent = item.itemName;
    }, true);
  }
}

// Update Group Runrate  dropdown
function updateOffcanvasGroupRunrate() {
  const companyID = document.getElementById('editCompany')?.value;
  const selectedPlanCostCenter = document.getElementById('editPlanCostCenter')?.value;

  let groupRunrateParams = [];
  if (companyID) groupRunrateParams.push(`companyId=${companyID}`);
  if (selectedPlanCostCenter) groupRunrateParams.push(`costCenterCode=${encodeURIComponent(selectedPlanCostCenter)}`);
  const groupRunrateQuery = groupRunrateParams.length ? `?${groupRunrateParams.join('&')}` : '';

  populateDropdown('editRunRateGroup', `${SELECT_API.groupRunrates}${groupRunrateQuery}`, 'Select Group Runrate', (option, item) => {
    option.value = item.runRateValue;
    option.textContent = `${item.runRateName}-[${item.grouping}] (${item.runRateValue}%)`;
  }, true);
}

// Update Salary Ranges dropdown
function updateOffcanvasSalaryRanges() {
  const companyID = document.getElementById('editCompany')?.value;
  const selectjobBand = document.getElementById('editJobBand')?.value;

  let salaryRangeParams = [];
  if (companyID) salaryRangeParams.push(`companyId=${companyID}`);
  if (selectjobBand) salaryRangeParams.push(`jobBand=${encodeURIComponent(selectjobBand)}`);
  const salaryRangeQuery = salaryRangeParams.length ? `?${salaryRangeParams.join('&')}` : '';

  populateDropdown('editSalaryStructure', `${SELECT_API.salaryranges}${salaryRangeQuery}`, 'Select Salary Structure', (option, item) => {
    option.value = item.midSalary;
    option.textContent = item.functionName;
  }, true);
}

// Update Bonus Types dropdown
function updateOffcanvasBonusTypes() {
  const companyID = getSelectedCompanyID() || document.getElementById('editCompany')?.value;
  const budgetYear = document.getElementById('editYear')?.value || getCurrentYear();

  if (!companyID || !budgetYear) return;

  // ⭐ Wait for Dynamic Forms to create DOM elements first
  const checkAndPopulateBonusTypes = () => {
    const apiUrl = `${SELECT_API.bonusTypes}?companyId=${companyID}&budgetYear=${budgetYear}`;

    if (companyID === '1') {
      // BJC: Check if both LE and BG bonus type fields exist
      const leBonusField = document.getElementById('editLeBonusType');
      const bgBonusField = document.getElementById('editBgBonusType');

      if (leBonusField && bgBonusField) {
        populateDropdown('editLeBonusType', apiUrl, 'Select LE Bonus Type', (option, item) => {
          option.value = item.budgetCategory;
          option.textContent = `${item.budgetCategory} (${item.rate}%)`;
        }, true);

        populateDropdown('editBgBonusType', apiUrl, 'Select BG Bonus Type', (option, item) => {
          option.value = item.budgetCategory;
          option.textContent = `${item.budgetCategory} (${item.rate}%)`;
        }, true);
      } else {
        // Fields not ready yet, retry after delay
        setTimeout(checkAndPopulateBonusTypes, 100);
      }
    } else {
      // BIGC: Check if BG bonus type field exists
      const bonusField = document.getElementById('editBgBonusTypes');

      if (bonusField) {
        populateDropdown('editBgBonusTypes', apiUrl, 'Select Bonus Type', (option, item) => {
          option.value = item.budgetCategory;
          option.textContent = `${item.budgetCategory} (${item.rate}%)`;
        }, true);
      } else {
        // Field not ready yet, retry after delay
        setTimeout(checkAndPopulateBonusTypes, 100);
      }
    }
  };

  // Start checking with initial delay to allow Dynamic Forms to initialize
  setTimeout(checkAndPopulateBonusTypes, 200);
}// Intercept offcanvas hide event for both CoreUI and Bootstrap
function preventOffcanvasHide(e) {
  // console.log('preventOffcanvasHide called, allowOffcanvasClose:', allowOffcanvasClose);
  if (!allowOffcanvasClose) {
    // console.log('Blocking offcanvas hide');
    e.preventDefault();
    return false;
  }
  // console.log('Allowing offcanvas hide');
}

// Only allow close by btn-close or cancelEditBtn
function safeCloseOffcanvas() {
  document.activeElement.blur(); // Prevent ARIA focus error
  allowOffcanvasClose = true;
  setTimeout(() => {
    const offcanvasEl = document.getElementById('offcanvasAddRow');
    const instance = getOffcanvasInstance(offcanvasEl);
    instance.hide();
    setTimeout(() => {
      allowOffcanvasClose = false;

      // Deselect any selected rows in budget grid to allow re-selection
      const budgetGridApi = window.getGridApi ? window.getGridApi() : null;
      if (budgetGridApi) {
        budgetGridApi.deselectAll();
        // console.log('Budget grid rows deselected after closing offcanvasAddRow');
      }

      // Sync position after close if fullscreen manager is available
      if (typeof window.forceUpdateOffcanvasPositions === 'function') {
        window.forceUpdateOffcanvasPositions();
      }
    }, 500);
  }, 10);
}

//Only allow close by btn-close [Side Panel Benefits (Offcanvas)]
function safeCloseBenefitsOffcanvas() {
  document.activeElement.blur(); // Prevent ARIA focus error
  allowOffcanvasClose = true;
  setTimeout(() => {
    const offcanvasEl = document.getElementById('offcanvasBenefits');
    const instance = getOffcanvasInstance(offcanvasEl);
    instance.hide();
    setTimeout(() => {
      allowOffcanvasClose = false;
      // Sync position after close if fullscreen manager is available
      if (typeof window.forceUpdateOffcanvasPositions === 'function') {
        window.forceUpdateOffcanvasPositions();
      }
    }, 500);
  }, 10);
}

// Initialize offcanvas event handlers
function initializeOffcanvasHandlers() {
  const offcanvasEl = document.getElementById('offcanvasAddRow');
  const benefitsOffcanvasEl = document.getElementById('offcanvasBenefits');

  // Prevent closing except by specific buttons
  if (window.bootstrap && window.bootstrap.Offcanvas) {
    offcanvasEl.addEventListener('hide.bs.offcanvas', preventOffcanvasHide);
    benefitsOffcanvasEl.addEventListener('hide.bs.offcanvas', preventOffcanvasHide);
  }
  if (window.coreui && window.coreui.Offcanvas) {
    offcanvasEl.addEventListener('hide.coreui.offcanvas', preventOffcanvasHide);
    benefitsOffcanvasEl.addEventListener('hide.coreui.offcanvas', preventOffcanvasHide);
  }

  // Initialize Modal Control System
  const confirmSaveModal = document.getElementById('confirmSaveModal');
  const confirmUpdateModal = document.getElementById('confirmUpdateModal');

  if (confirmSaveModal) {
    confirmSaveModal.addEventListener('hide.bs.modal', preventSaveModalHide);
  }
  if (confirmUpdateModal) {
    confirmUpdateModal.addEventListener('hide.bs.modal', preventUpdateModalHide);
  }

  // Prevent backdrop click from closing (for Bootstrap)
  document.addEventListener('mousedown', function (e) {
    const backdrop = document.querySelector('.offcanvas-backdrop');
    if (backdrop && e.target === backdrop && !allowOffcanvasClose) {
      e.stopPropagation();
      e.preventDefault();
    }
  });

  // Prevent modal backdrop clicks
  document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('modal-backdrop')) {
      const saveModalVisible = confirmSaveModal && confirmSaveModal.classList.contains('show');
      const updateModalVisible = confirmUpdateModal && confirmUpdateModal.classList.contains('show');

      if ((saveModalVisible && !allowSaveClose) || (updateModalVisible && !allowUpdateClose)) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  });

  // Close button handlers
  document.getElementById('cancelEditBtn').addEventListener('click', function () {
    safeCloseOffcanvas();
  });

  document.getElementById('closeOffcanvasBtn').addEventListener('click', function () {
    safeCloseOffcanvas();
  });

  document.getElementById('closeOffcanvasBenefitsBtn').addEventListener('click', function () {
    safeCloseBenefitsOffcanvas();
  });

  // Save button handler: validate then show confirm modal
  const saveEditBtn = document.getElementById('saveEditBtn');
  if (saveEditBtn) {
    saveEditBtn.addEventListener('click', function (e) {
      e.preventDefault();

      // 🔍 DIAGNOSIS: Enable detailed logging for testing
      window.DEBUG_VALIDATION = true;

      // 🔍 DIAGNOSIS: Check budgetFormValidator status
      // console.log('🔍 DIAGNOSIS - budgetFormValidator status:');
      // console.log('- window.budgetFormValidator exists:', !!window.budgetFormValidator);
      // console.log('- isInitialized:', window.budgetFormValidator?.isInitialized);

      // ⚠️ SAFETY: Check if validator is ready (Backwards Compatibility)
      if (!window.budgetFormValidator || !window.budgetFormValidator.isInitialized) {
        console.warn('⚠️ DIAGNOSIS - Form validator not ready, proceeding without validation for backwards compatibility');
        console.warn('⚠️ THIS IS WHY MODAL IS SHOWING WITHOUT VALIDATION!');
        const confirmModal = new bootstrap.Modal(document.getElementById('confirmSaveModal'));
        confirmModal.show();
        return;
      }

      // console.log('✅ DIAGNOSIS - budgetFormValidator is ready, proceeding with validation...');

      // 🔍 VALIDATION: Run form validation (Performance: <100ms)
      // console.log('🔍 Running form validation...');
      const validationStartTime = performance.now();

      try {
        const validationResult = window.budgetFormValidator.validateForm();
        const validationTime = performance.now() - validationStartTime;
        // console.log(`✅ Validation completed in ${validationTime.toFixed(2)}ms`);

        // console.log('🔍 DIAGNOSIS - Validation result:', validationResult);

        if (!validationResult.isValid) {
          // ❌ VALIDATION FAILED: Show clear user feedback
          // console.log('❌ DIAGNOSIS - Validation FAILED, should NOT show modal');
          // console.log('❌ DIAGNOSIS - Errors:', validationResult.errors);
          // console.log('❌ DIAGNOSIS - User should see field errors and stay on form');
          // budgetFormValidator automatically shows error messages
          // User stays on form to fix errors
          return;
        }

        // ✅ VALIDATION PASSED: Proceed to confirmation modal
        // console.log('✅ DIAGNOSIS - Validation PASSED, showing confirmation modal');
        const confirmModal = new bootstrap.Modal(document.getElementById('confirmSaveModal'));
        confirmModal.show();

      } catch (error) {
        // 🚨 SAFETY: Handle validation errors gracefully
        console.error('❌ Validation error occurred:', error);
        console.warn('⚠️ Proceeding without validation due to error (Safety Fallback)');
        const confirmModal = new bootstrap.Modal(document.getElementById('confirmSaveModal'));
        confirmModal.show();
      }
    });
  }

  // Confirm Save modal logic
  let pendingFormSubmit = null;
  document.getElementById('confirmSaveBtn').addEventListener('click', function () {
    // Actually submit the form
    pendingFormSubmit = true;
    document.getElementById('editRowForm').requestSubmit();
    safeCloseSaveModal();
  });

  document.getElementById('cancelSaveBtn').addEventListener('click', function () {
    pendingFormSubmit = false;
    safeCloseSaveModal();
  });

  // Update modal logic
  document.getElementById('confirmUpdateBtn').addEventListener('click', function () {
    // Handle update logic here
    const rowIndex = document.getElementById('editRowForm').getAttribute('data-edit-index');
    if (rowIndex !== null) {
      // Update existing row logic
      document.getElementById('editRowForm').requestSubmit();
    }
    safeCloseUpdateModal();
  });

  document.getElementById('cancelUpdateBtn').addEventListener('click', function () {
    safeCloseUpdateModal();
  });

  // Intercept form submit to only allow after confirm
  const editRowForm = document.getElementById('editRowForm');
  editRowForm.addEventListener('submit', function (e) {
    if (!pendingFormSubmit) {
      e.preventDefault();
      return;
    }

    // รวมข้อมูล Dynamic Forms ก่อนส่ง (เฉพาะเมื่อ Cost Center = '90066')
    const selectedCostCenter = document.getElementById('editCostCenter')?.value;
    if (selectedCostCenter === AllocationCostCenterCode) {
      // ตรวจสอบ allocation ก่อน
      if (typeof validateAllocation === 'function') {
        if (!validateAllocation()) {
          e.preventDefault();
          pendingFormSubmit = false;
          return;
        }
      }

      // ดึงข้อมูล dynamic forms
      if (typeof getDynamicFormsData === 'function') {
        const dynamicData = getDynamicFormsData();
        // console.log('Dynamic forms data collected:', dynamicData);

        // เก็บ dynamic data ไว้ในฟอร์มเพื่อส่งไปยัง server
        // สามารถใช้ hidden input หรือวิธีอื่นตามความเหมาะสม
        let dynamicDataInput = document.getElementById('dynamicFormsData');
        if (!dynamicDataInput) {
          dynamicDataInput = document.createElement('input');
          dynamicDataInput.type = 'hidden';
          dynamicDataInput.name = 'dynamicFormsData';
          dynamicDataInput.id = 'dynamicFormsData';
          editRowForm.appendChild(dynamicDataInput);
        }
        dynamicDataInput.value = JSON.stringify(dynamicData);
      }
    }

    // After confirmed, allow closing side panel
    safeCloseOffcanvas();
    pendingFormSubmit = false;
    const mode = document.getElementById('formMode').value;
    if (mode === 'edit') {
      const rowIndex = this.getAttribute('data-edit-index');
      if (rowIndex !== null) {
        // console.log('Updating row at index:', rowIndex);
        // Handle edit logic here
      }
    } else if (mode === 'add') {
      // console.log('Adding new row');
      // Handle add logic here
    }
  });

  // Initialize fullscreen offcanvas management if available
  if (typeof window.initializeOffcanvasFullscreenManager === 'function') {
    // console.log('🔗 Integrating with Offcanvas Fullscreen Manager');
    // The fullscreen manager will auto-initialize via DOMContentLoaded
  } else {
    // console.log('⚠️ Offcanvas Fullscreen Manager not available - make sure budget.offcanvas.fullscreen.js is loaded');
  }

  // update button handler: validate then show confirm modal
  const updateBtn = document.getElementById('updateRowBtn');
  if (updateBtn) {
    updateBtn.addEventListener('click', function (e) {
      e.preventDefault();

      // Run validation before showing confirm modal
      // console.log('🔍 Running validation before update...');

      const isValid = validateRequiredFields('edit');
      if (!isValid) {
        // console.log('❌ Validation failed, update cancelled');
        return; // Stop here if validation fails
      }

      // console.log('✅ Validation passed, showing update confirmation');
      const confirmUpdateModal = new bootstrap.Modal(document.getElementById('confirmUpdateModal'));
      confirmUpdateModal.show();
    });
  }
}

/**
 * Synchronize offcanvas positions when showing/hiding offcanvas
 * This ensures proper positioning regardless of fullscreen state
 */
function syncOffcanvasPosition(offcanvasElement) {
  if (!offcanvasElement) return;

  // Check if fullscreen manager is available and force position update
  if (typeof window.forceUpdateOffcanvasPositions === 'function') {
    // console.log('🔄 Syncing offcanvas position with fullscreen state');
    window.forceUpdateOffcanvasPositions();
  }
}

/**
 * Enhanced safe close function with fullscreen position sync
 */
function safeCloseOffcanvasWithSync(offcanvasId) {
  const offcanvasElement = document.getElementById(offcanvasId);

  // Sync position before closing
  syncOffcanvasPosition(offcanvasElement);

  // Use appropriate close function
  if (offcanvasId === 'offcanvasAddRow') {
    safeCloseOffcanvas();
  } else if (offcanvasId === 'offcanvasBenefits') {
    safeCloseBenefitsOffcanvas();
  }
}

// Create debounced versions of offcanvas update functions
const debouncedUpdateOffcanvasCostCenters = debounce(updateOffcanvasCostCenters, DEBOUNCE_DELAYS.offcanvasCostCenters);
const debouncedUpdateOffcanvasDivisions = debounce(updateOffcanvasDivisions, DEBOUNCE_DELAYS.offcanvasDivisions);
const debouncedUpdateOffcanvasDepartments = debounce(updateOffcanvasDepartments, DEBOUNCE_DELAYS.offcanvasDepartments);
const debouncedUpdateOffcanvasSections = debounce(updateOffcanvasSections, DEBOUNCE_DELAYS.offcanvasSections);
const debouncedUpdateOffcanvasLocations = debounce(updateOffcanvasLocations, DEBOUNCE_DELAYS.offcanvasLocations);
const debouncedUpdateOffcanvasPositions = debounce(updateOffcanvasPositions, DEBOUNCE_DELAYS.offcanvasPositions);
const debouncedUpdateOffcanvasJobBands = debounce(updateOffcanvasJobBands, DEBOUNCE_DELAYS.offcanvasJobBands);
const debouncedUpdateOffcanvasEmpStatus = debounce(updateOffcanvasEmpStatus, DEBOUNCE_DELAYS.offcanvasEmpStatus);
const debouncedUpdateOffcanvasEmployeeTypes = debounce(updateOffcanvasEmployeeTypes, DEBOUNCE_DELAYS.offcanvasEmployeeTypes);
const debouncedUpdateOffcanvasNewHC = debounce(updateOffcanvasNewHC, DEBOUNCE_DELAYS.offcanvasNewHC);
const debouncedUpdateOffcanvasNewPeriod = debounce(updateOffcanvasNewPeriod, DEBOUNCE_DELAYS.offcanvasNewPeriod);
const debouncedUpdateOffcanvasNOfMonth = debounce(updateOffcanvasNOfMonth, DEBOUNCE_DELAYS.offcanvasNOfMonth);
const debouncedUpdateOffcanvasNewLEPeriod = debounce(updateOffcanvasNewLEPeriod, DEBOUNCE_DELAYS.offcanvasNewLEPeriod);
const debouncedUpdateOffcanvasLEnOfMonth = debounce(updateOffcanvasLEnOfMonth, DEBOUNCE_DELAYS.offcanvasLEnOfMonth);
const debouncedUpdateOffcanvasJoinPvf = debounce(updateOffcanvasJoinPVF, DEBOUNCE_DELAYS.offcanvasJoinPvf);
const debouncedUpdateOffcanvasPlanCostCenters = debounce(updateOffcanvasPlanCostCenters, DEBOUNCE_DELAYS.offcanvasPlanCostCenters);
const debouncedUpdateOffcanvasSalaryStructure = debounce(updateOffcanvasSalaryStructure, DEBOUNCE_DELAYS.offcanvasSalaryStructure);
const debouncedUpdateOffcanvasGroupRunrate = debounce(updateOffcanvasGroupRunrate, DEBOUNCE_DELAYS.offcanvasGroupRunrate);
const debouncedUpdateOffcanvasFocusHC = debounce(updateOffcanvasFocusHC, DEBOUNCE_DELAYS.offcanvasFocusHC);
const debouncedUpdateOffcanvasFocusPE = debounce(updateOffcanvasFocusPE, DEBOUNCE_DELAYS.offcanvasFocusPE);
const debouncedUpdateOffcanvasExecutives = debounce(updateOffcanvasExecutives, DEBOUNCE_DELAYS.offcanvasExecutives);
const debouncedUpdateOffcanvasSalaryRanges = debounce(updateOffcanvasSalaryRanges, DEBOUNCE_DELAYS.offcanvasSalaryRanges);
const debouncedUpdateOffcanvasMstPositions = debounce(updateOffcanvasMstPositions, DEBOUNCE_DELAYS.offcanvasMstPositions);
const debouncedUpdateOffcanvasMstJobBands = debounce(updateOffcanvasMstJobBands, DEBOUNCE_DELAYS.offcanvasMstJobBands);
const debouncedUpdateOffcanvasBonusTypes = debounce(updateOffcanvasBonusTypes, DEBOUNCE_DELAYS.offcanvasBonusTypes || 300);

// =============================================================================
// EDIT FORM POPULATION FUNCTIONS
// =============================================================================

/**
 * Helper: Auto-select dropdown value with retry mechanism
 * @param {string} elementId - ID of the dropdown element
 * @param {string|number} value - Value to select
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise<boolean>} - Success status
 */
function autoSelectWithRetry(elementId, value, maxRetries = 5) {
  return new Promise((resolve) => {
    let attempts = 0;

    const trySelect = () => {
      const element = document.getElementById(elementId);

      // Check if element exists and has options
      if (element && element.options && element.options.length > 1) {
        // Find matching option by value or text content
        const option = Array.from(element.options).find(opt =>
          opt.value === value?.toString() ||
          opt.textContent.includes(value?.toString()) ||
          opt.value === value ||
          (value && opt.textContent.toLowerCase().includes(value.toString().toLowerCase()))
        );

        if (option) {
          element.value = option.value;
          $(element).trigger('change');
          // console.log(`✅ Successfully selected ${elementId}: ${option.value} (${option.textContent})`);
          resolve(true);
          return;
        }
      }

      attempts++;
      if (attempts < maxRetries) {
        // console.log(`🔄 Retry ${attempts}/${maxRetries} for ${elementId} with value: ${value}`);
        setTimeout(trySelect, 200); // Wait 200ms and try again
      } else {
        // console.warn(`⚠️ Failed to select ${elementId} with value "${value}" after ${maxRetries} attempts`);
        resolve(false);
      }
    };

    trySelect();
  });
}

/**
 * Helper: Check if dropdown is ready (has options loaded)
 * @param {string} elementId - ID of the dropdown element
 * @returns {boolean} - Ready status
 */
function isDropdownReady(elementId) {
  const element = document.getElementById(elementId);
  return element && element.options && element.options.length > 1;
}

/**
 * 1. Main function to populate edit form with row data from AG Grid
 * @param {Object} rowData - Data from selected AG Grid row
 */
function populateEditForm(rowData) {
  // console.log('🔄 Starting populateEditForm with data:', rowData);

  try {
    // Use sequential approach instead of parallel timeouts
    processEditFormPopulation(rowData);

  } catch (error) {
    console.error('❌ Error in populateEditForm:', error);
    hideOffcanvasLoading('offcanvasAddRow');
    showValidationError('Failed to load employee data. Please try again.');
  }
}

/**
 * Sequential processing of edit form population
 * @param {Object} rowData - Employee data from AG Grid
 */
async function processEditFormPopulation(rowData) {
  try {
    // console.log('🔄 Starting sequential edit form population');

    // Step 1: Display employee information in header
    displayEmployeeInfo(rowData);

    // Step 2: Set field states for edit mode
    await new Promise(resolve => setTimeout(resolve, EDIT_FORM_DELAYS.populateDelay));
    setEditModeFieldStates();

    // Step 3: Populate and select basic dropdowns (no cascading dependencies)
    await new Promise(resolve => setTimeout(resolve, EDIT_FORM_DELAYS.populateDelay));
    await populateAndSelectBasicDropdowns(rowData);

    // Step 4: Setup cascading for edit mode
    await new Promise(resolve => setTimeout(resolve, EDIT_FORM_DELAYS.cascadeDelay));
    setupEditModeCascading(rowData);

    // Step 5: Populate and select cascading dropdowns
    await new Promise(resolve => setTimeout(resolve, EDIT_FORM_DELAYS.autoSelectDelay));
    await populateAndSelectCascadingDropdowns(rowData);

    // Step 6: Populate benefits data
    await new Promise(resolve => setTimeout(resolve, EDIT_FORM_DELAYS.benefitsDelay));
    populateLeBenefitsData(rowData);
    populateBgBenefitsData(rowData);

    // Step 7: Highlight missing critical benefits data
    await new Promise(resolve => setTimeout(resolve, 100));
    highlightMissingBenefitsData(rowData);

    // Step 8: Finalize UI state
    await new Promise(resolve => setTimeout(resolve, 100));
    finalizeEditFormUI();

    // console.log('✅ Edit form populated successfully');
  } catch (error) {
    // console.error('❌ Error in processEditFormPopulation:', error);
    hideOffcanvasLoading('offcanvasAddRow');
    showValidationError('Failed to load employee data. Please try again.');
  }
}

/**
 * Populate and select basic dropdowns (no cascading dependencies)
 * @param {Object} rowData - Employee data from AG Grid
 */
async function populateAndSelectBasicDropdowns(rowData) {
  // console.log('🎯 Populating and selecting basic dropdowns');

  try {
    const basicDropdowns = [
      {
        id: 'editCompany',
        value: rowData.companyCode || rowData.companyId,
        populateFirst: true,
        populateFunction: () => {
          // Company dropdown should already be populated from populateOffcanvasDropdowns
          return Promise.resolve();
        }
      },
      {
        id: 'editFormat',
        value: rowData.empFormat,
        populateFirst: true,
        populateFunction: () => {
          const companyID = document.getElementById('editCompany')?.value;
          if (companyID) {
            updateOffcanvasEmpFormats(companyID);
            return new Promise(resolve => setTimeout(resolve, 300));
          }
          return Promise.resolve();
        }
      },
      {
        id: 'editYear',
        value: rowData.budgetYear,
        populateFirst: true,
        populateFunction: () => {
          const companyID = document.getElementById('editCompany')?.value;
          if (companyID) {
            updateOffcanvasYears(companyID);
            return new Promise(resolve => setTimeout(resolve, 300));
          }
          return Promise.resolve();
        }
      },
      {
        id: 'editEmpType',
        value: rowData.empTypeCode,
        populateFirst: true,
        populateFunction: () => {
          updateOffcanvasEmployeeTypes();
          return new Promise(resolve => setTimeout(resolve, 200));
        }
      },
      {
        id: 'editNewHC',
        value: rowData.newHC,
        populateFirst: true,
        populateFunction: () => {
          updateOffcanvasNewHC();
          return new Promise(resolve => setTimeout(resolve, 200));
        }
      },
      {
        id: 'editNewPeriod',
        value: rowData.newPeriod,
        populateFirst: true,
        populateFunction: () => {
          updateOffcanvasNewPeriod();
          return new Promise(resolve => setTimeout(resolve, 200));
        }
      },
      {
        id: 'editNewLEPeriod',
        value: rowData.newLEPeriod,
        populateFirst: true,
        populateFunction: () => {
          updateOffcanvasNewLEPeriod();
          return new Promise(resolve => setTimeout(resolve, 200));
        }
      },
      {
        id: 'editLEnOfMonth',
        value: rowData.leNoOfMonth,
        populateFirst: true,
        populateFunction: () => {
          updateOffcanvasLEnOfMonth();
          return new Promise(resolve => setTimeout(resolve, 200));
        }
      },
      {
        id: 'editNOfMonth',
        value: rowData.noOfMonth,
        populateFirst: true,
        populateFunction: () => {
          updateOffcanvasNOfMonth();
          return new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    ];

    // Process each dropdown sequentially
    for (const dropdown of basicDropdowns) {
      if (dropdown.populateFirst && dropdown.populateFunction) {
        // console.log(`🔄 Populating ${dropdown.id}...`);
        await dropdown.populateFunction();
      }

      if (dropdown.value) {
        // console.log(`🎯 Auto-selecting ${dropdown.id}: ${dropdown.value}`);
        await autoSelectWithRetry(dropdown.id, dropdown.value);
      }
    }

    // Handle non-dropdown fields
    if (rowData.joinDate) {
      const joinDateField = document.getElementById('editJoinDate');
      if (joinDateField) {
        const dateValue = rowData.joinDate.split('T')[0];
        joinDateField.value = dateValue;
      }
    }

    if (rowData.remark) {
      const remarkField = document.getElementById('editRemark');
      if (remarkField) {
        remarkField.value = rowData.remark;
      }
    }

    // console.log('✅ Basic dropdowns populated and selected');
  } catch (error) {
    // console.error('❌ Error in populateAndSelectBasicDropdowns:', error);
  }
}

/**
 * Populate and select cascading dropdowns (with dependencies)
 * @param {Object} rowData - Employee data from AG Grid
 */
async function populateAndSelectCascadingDropdowns(rowData) {
  // console.log('🔗 Populating and selecting cascading dropdowns');

  try {
    // Cost Center (depends on Company, Format, Year)
    // console.log('🔄 Populating Cost Center...');
    updateOffcanvasCostCenters();
    await new Promise(resolve => setTimeout(resolve, 400));
    if (rowData.costCenterCode) {
      await autoSelectWithRetry('editCostCenter', rowData.costCenterCode);
    }

    // Employee Status (depends on Company, Format, Year, Cost Center, etc.)
    // console.log('🔄 Populating Employee Status...');
    updateOffcanvasEmpStatus();
    await new Promise(resolve => setTimeout(resolve, 400));
    if (rowData.empStatus) {
      await autoSelectWithRetry('editEmpStatus', rowData.empStatus);
    }

    // Plan Cost Centers
    // console.log('🔄 Populating Plan Cost Centers...');
    updateOffcanvasPlanCostCenters();
    await new Promise(resolve => setTimeout(resolve, 300));
    if (rowData.planCostCenter) {
      await autoSelectWithRetry('editPlanCostCenter', rowData.planCostCenter);
    }

    // Division (depends on Cost Center)
    // console.log('🔄 Populating Division...');
    updateOffcanvasDivisions();
    await new Promise(resolve => setTimeout(resolve, 300));
    if (rowData.orgLevel1) {
      await autoSelectWithRetry('editDivision', rowData.orgLevel1);
    }

    // Department (depends on Division)
    if (rowData.orgLevel1) {
      // console.log('🔄 Populating Department...');
      updateOffcanvasDepartments();
      await new Promise(resolve => setTimeout(resolve, 300));
      if (rowData.orgLevel2) {
        await autoSelectWithRetry('editDepartment', rowData.orgLevel2);
      }
    }

    // Section (depends on Department)
    if (rowData.orgLevel2) {
      // console.log('🔄 Populating Section...');
      updateOffcanvasSections();
      await new Promise(resolve => setTimeout(resolve, 300));
      if (rowData.orgLevel3) {
        await autoSelectWithRetry('editSection', rowData.orgLevel3);
      }
    }

    // Location (depends on Section)
    // console.log('🔄 Populating Location...');
    updateOffcanvasLocations();
    await new Promise(resolve => setTimeout(resolve, 300));
    if (rowData.orgUnitName) {
      await autoSelectWithRetry('editLocation', rowData.orgUnitName);
    }

    // Position
    // console.log('🔄 Populating Position...');
    updateOffcanvasMstPositions();
    await new Promise(resolve => setTimeout(resolve, 300));
    if (rowData.positionCode || rowData.positionName) {
      await autoSelectWithRetry('editPosition', rowData.positionCode || rowData.positionName);
    }

    // Job Band (depends on Position)
    if (rowData.positionCode || rowData.positionName) {
      // console.log('🔄 Populating Job Band...');
      updateOffcanvasMstJobBands();
      await new Promise(resolve => setTimeout(resolve, 300));
      if (rowData.jobBand) {
        await autoSelectWithRetry('editJobBand', rowData.jobBand);
      }
    }

    // Group Runrate (depends on Plan Cost Center)
    if (rowData.planCostCenter) {
      // console.log('🔄 Populating Group Runrate...');
      updateOffcanvasGroupRunrate();
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // console.log('✅ Cascading dropdowns populated and selected');
  } catch (error) {
    console.error('❌ Error in populateAndSelectCascadingDropdowns:', error);
  }
}

/**
 * Finalize edit form UI state
 */
function finalizeEditFormUI() {
  // console.log('🎨 Finalizing edit form UI');

  try {
    // Hide loading
    hideOffcanvasLoading('offcanvasAddRow');

    // Show Update button and hide Save button for Edit mode
    const updateBtn = document.getElementById('updateRowBtn');
    const saveBtn = document.getElementById('saveEditBtn');

    if (updateBtn) updateBtn.style.display = 'inline-block';
    if (saveBtn) saveBtn.style.display = 'none';

    // console.log('✅ Edit form UI finalized');
  } catch (error) {
    console.error('❌ Error in finalizeEditFormUI:', error);
  }
}

/**
 * 2. Display employee information in offcanvas title
 * @param {Object} rowData - Employee data from AG Grid
 */
function displayEmployeeInfo(rowData) {
  try {
    // Format employee name
    const formattedName = formatEmployeeName(rowData);

    // Update offcanvas title only
    const offcanvasTitle = document.getElementById('offcanvasAddRowLabel');
    if (offcanvasTitle) {
      offcanvasTitle.textContent = `Edit Row - ID: ${rowData.empCode || 'N/A'} - ${formattedName}`;
    } else {
      // console.warn('⚠️ Offcanvas title element not found');
    }
  } catch (error) {
    console.error('❌ Error in displayEmployeeInfo:', error);
  }
}

/**
 * 3. Set field states appropriate for edit mode
 */
function setEditModeFieldStates() {
  // console.log('🔧 Setting edit mode field states');

  try {
    // Enable all form fields that might have been disabled
    const editableFields = [
      'editCompany', 'editFormat', 'editYear', 'editEmpStatus', 'editCostCenter',
      'editDivision', 'editDepartment', 'editSection', 'editLocation',
      'editPosition', 'editJobBand', 'editJoinDate', 'editRemark',
      'editEmpType', 'editNewHC', 'editNewPeriod', 'editNewLEPeriod',
      'editLEnOfMonth', 'editNOfMonth', 'editPlanCostCenter',
      'editSalaryStructure', 'editRunRateGroup', 'editEmployeeLevel',
      'editFocusHC', 'editFocusPE', 'editBgBonusType'
    ];

    editableFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.disabled = true;
        //field.classList.remove('is-invalid'); // Clear any previous validation errors
      }
    });

    // Clear any existing validation errors
    clearValidationErrors();

    // console.log('✅ Edit mode field states set successfully');
  } catch (error) {
    console.error('❌ Error in setEditModeFieldStates:', error);
  }
}

/**
 * 4. Populate LE Benefits data from rowData
 * @param {Object} rowData - Employee data containing LE benefits
 */
function populateLeBenefitsData(rowData) {
  // console.log('💰 Populating LE Benefits data');

  try {
    // Map LE benefits fields from rowData to form inputs
    const leBenefitsMapping = {
      'editLePayroll': rowData.payroll || 0,
      'editLeBonus': rowData.bonus || 0,
      'editLeFleetCardPE': rowData.fleetCardPe || 0,
      'editLeCarAllowance': rowData.carAllowance || 0,
      'editLeLicenseAllowance': rowData.licenseAllowance || 0,
      'editLeHousingAllowance': rowData.housingAllowance || 0,
      'editLeGasolineAllowance': rowData.gasolineAllowance || 0,
      'editLeWageStudent': rowData.wageStudent || 0,
      'editLeSkillPayAllowance': rowData.skillPayAllowance || 0,
      'editLeSocialSecurity': rowData.socialSecurity || 0,
      'editLeLaborFundFee': rowData.laborFundFee || 0,
      'editLeOtherBenefits': rowData.otherStaffBenefit || 0,
      'editLeProvidentFund': rowData.providentFund || 0,
      'editLeInterest': rowData.interest || 0,
      'editLeStaffInsurance': rowData.staffInsurance || 0,
      'editLeMedicalExpense': rowData.medicalExpense || 0,
      'editLeMedicalInHouse': rowData.medicalInhouse || 0,
      'editLeTraining': rowData.training || 0,
      'editLeLongService': rowData.longService || 0,
      'editLePeMth': rowData.peMthSumLe || 0,
      'editLePeYear': rowData.peYearSumLe || 0,
      'editLePeSbMth': rowData.peSbMth || 0,
      'editLePeSbLE': rowData.peSbLe || 0
    };

    // Populate form fields
    Object.entries(leBenefitsMapping).forEach(([fieldId, value]) => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.value = value || '';
      }
    });

    // console.log('✅ LE Benefits data populated successfully');
  } catch (error) {
    console.error('❌ Error in populateLeBenefitsData:', error);
  }
}

/**
 * 5. Populate Budget Year Benefits data from rowData
 * @param {Object} rowData - Employee data containing Budget Year benefits
 */
function populateBgBenefitsData(rowData) {
  // console.log('💰 Populating Budget Year Benefits data');

  try {
    // Map Budget Year benefits fields (Nx fields) from rowData to form inputs
    const bgBenefitsMapping = {
      'editBgPayroll': rowData.payrollNx || 0,
      'editBgBonus': rowData.bonusNx || 0,
      'editBgFleetCardPE': rowData.fleetCardPeNx || 0,
      'editBgCarAllowance': rowData.carAllowanceNx || 0,
      'editBgLicenseAllowance': rowData.licenseAllowanceNx || 0,
      'editBgHousingAllowance': rowData.housingAllowanceNx || 0,
      'editBgGasolineAllowance': rowData.gasolineAllowanceNx || 0,
      'editBgWageStudent': rowData.wageStudentNx || 0,
      'editBgSkillPayAllowance': rowData.skillPayAllowanceNx || 0,
      'editBgSocialSecurity': rowData.socialSecurityNx || 0,
      'editBgLaborFundFee': rowData.laborFundFeeNx || 0,
      'editBgOtherBenefits': rowData.otherStaffBenefitNx || 0,
      'editBgProvidentFund': rowData.providentFundNx || 0,
      'editBgInterest': rowData.interestNx || 0,
      'editBgStaffInsurance': rowData.staffInsuranceNx || 0,
      'editBgMedicalExpense': rowData.medicalExpenseNx || 0,
      'editBgMedicalInHouse': rowData.medicalInhouseNx || 0,
      'editBgTraining': rowData.trainingNx || 0,
      'editBgLongService': rowData.longServiceNx || 0,
      'editBgPeMth': rowData.peMthSumNx || 0,
      'editBgPeYear': rowData.peYearSumNx || 0,
      'editBgPeSbMth': rowData.peSbMthNx || 0,
      'editBgPeSbLE': rowData.peSbYearNx || 0
    };

    // Populate form fields
    Object.entries(bgBenefitsMapping).forEach(([fieldId, value]) => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.value = value || '';
      }
    });

    // Auto-select Bonus Type if available
    if (rowData.bonusTypes) {
      const autoSelectBonusTypes = () => {
        const companyID = $('#editCompany').val();

        if (companyID === '1') {
          // BJC: Check if both LE and BG bonus type fields exist and have options
          const leBonusTypeSelect = document.getElementById('editLeBonusType');
          const bgBonusTypeSelect = document.getElementById('editBgBonusType');

          if (leBonusTypeSelect && bgBonusTypeSelect &&
              leBonusTypeSelect.options.length > 1 && bgBonusTypeSelect.options.length > 1) {
            [leBonusTypeSelect, bgBonusTypeSelect].forEach(bonusTypeSelect => {
              const options = Array.from(bonusTypeSelect.options);
              const matchingOption = options.find(opt =>
                opt.textContent.includes(rowData.bonusTypes) || opt.value === rowData.bonusTypes
              );
              if (matchingOption) {
                bonusTypeSelect.value = matchingOption.value;
                $(bonusTypeSelect).trigger('change'); // Trigger select2 change
              }
            });
          } else {
            // Fields or options not ready yet, retry
            setTimeout(autoSelectBonusTypes, 200);
          }
        } else {
          // BIGC: Check if BG bonus type field exists and has options
          const bonusTypeSelect = document.getElementById('editBgBonusTypes');

          if (bonusTypeSelect && bonusTypeSelect.options.length > 1) {
            const options = Array.from(bonusTypeSelect.options);
            const matchingOption = options.find(opt =>
              opt.textContent.includes(rowData.bonusTypes) || opt.value === rowData.bonusTypes
            );
            if (matchingOption) {
              bonusTypeSelect.value = matchingOption.value;
              $(bonusTypeSelect).trigger('change'); // Trigger select2 change
            }
          } else {
            // Field or options not ready yet, retry
            setTimeout(autoSelectBonusTypes, 200);
          }
        }
      };

      // Start auto-select with delay to allow both DOM creation and dropdown population
      setTimeout(autoSelectBonusTypes, EDIT_FORM_DELAYS.autoSelectDelay + 300);
    }

    // console.log('✅ Budget Year Benefits data populated successfully');
  } catch (error) {
    console.error('❌ Error in populateBgBenefitsData:', error);
  }
}

/**
 * 6. Validate required fields for the specified form mode
 * @param {string} formMode - 'add' or 'edit'
 * @returns {boolean} - true if validation passes, false otherwise
 */
function validateRequiredFields(formMode = 'edit') {
  // console.log(`🔍 Validating required fields for ${formMode} mode`);

  try {
    const errors = [];

    // Define required fields based on Budget.cshtml analysis
    const requiredFields = [
      { id: 'editCompany', name: 'Company' },
      { id: 'editFormat', name: 'Format' },
      { id: 'editYear', name: 'Budget Year' },
      { id: 'editEmpStatus', name: 'Employee Status' },
      { id: 'editCostCenter', name: 'Cost Center' },
      { id: 'editDivision', name: 'Division' },
      { id: 'editLocation', name: 'Location (store name)' },
      { id: 'editPosition', name: 'Position' },
      { id: 'editJobBand', name: 'Job Band' },
      { id: 'editEmpType', name: 'Employee Type' },
      { id: 'editNewHC', name: 'New HC' },
      { id: 'editNewPeriod', name: 'New Period' },
      { id: 'editNewLEPeriod', name: 'New LE Period' },
      { id: 'editLEnOfMonth', name: 'LE No. of Month' },
      { id: 'editNOfMonth', name: 'No. of Month' },
      { id: 'editPlanCostCenter', name: 'CostCenter 2026' },
      { id: 'editLePayroll', name: 'Payroll (LE)' }
    ];

    // Check each required field
    requiredFields.forEach(field => {
      const element = document.getElementById(field.id);
      if (element) {
        const value = element.value ? element.value.toString().trim() : '';
        if (!value) {
          errors.push(field.name);
          element.classList.add('is-invalid');
        } else {
          element.classList.remove('is-invalid');
        }
      }
    });

    // Display validation results
    if (errors.length > 0) {
      const errorMessage = `Please fill in the following required fields:\n• ${errors.join('\n• ')}`;
      showValidationError(errorMessage);

      // Scroll to top of offcanvas
      const offcanvasBody = document.querySelector('#offcanvasAddRow .offcanvas-body');
      if (offcanvasBody) {
        offcanvasBody.scrollTop = 0;
      }

      // console.log(`❌ Validation failed. Missing fields: ${errors.join(', ')}`);
      return false;
    }

    // console.log('✅ All required fields validation passed');
    clearValidationErrors();
    return true;

  } catch (error) {
    console.error('❌ Error in validateRequiredFields:', error);
    showValidationError('Validation error occurred. Please try again.');
    return false;
  }
}

/**
 * 7. Highlight missing critical benefits data
 * @param {Object} rowData - Employee data to check for missing benefits
 */
function highlightMissingBenefitsData(rowData) {
  // console.log('🔍 Checking for missing critical benefits data');

  const performHighlightCheck = () => {
    try {
      const companyID = $('#editCompany').val();

      let criticalFields = [
        { id: 'editLePayroll', value: rowData.payroll, name: 'Payroll (LE)' },
        { id: 'editLeBonus', value: rowData.bonus, name: 'Bonus (LE)' }
      ];

      // Add company-specific bonus type fields - check if they exist first
      if (companyID === '1') {
        // BJC: Check both LE and BG bonus type fields
        const leBonusField = document.getElementById('editLeBonusType');
        const bgBonusField = document.getElementById('editBgBonusType');

        if (leBonusField && bgBonusField) {
          criticalFields.push(
            { id: 'editLeBonusType', value: rowData.bonusTypes, name: 'LE Bonus Type' },
            { id: 'editBgBonusType', value: rowData.bonusTypes, name: 'BG Bonus Type' }
          );
        } else {
          // Fields not ready yet, retry after delay
          setTimeout(performHighlightCheck, 200);
          return;
        }
      } else {
        // BIGC: Check single BG bonus type field
        const bonusField = document.getElementById('editBgBonusTypes');

        if (bonusField) {
          criticalFields.push(
            { id: 'editBgBonusTypes', value: rowData.bonusTypes, name: 'Bonus Type' }
          );
        } else {
          // Field not ready yet, retry after delay
          setTimeout(performHighlightCheck, 200);
          return;
        }
      }

      const missingFields = [];

      criticalFields.forEach(field => {
      const element = document.getElementById(field.id);
      if (element) {
        const hasValue = field.value && field.value.toString().trim() !== '' && field.value !== 0;

        if (!hasValue) {
          // Handle Select2 dropdown specifically
          if (element.classList.contains('select2-hidden-accessible')) {
            const select2Container = element.nextElementSibling;
            if (select2Container && select2Container.classList.contains('select2-container')) {
              // Find selection element directly and add warning class
              const selectionElement = select2Container.querySelector('.select2-selection.select2-selection--single');
              if (selectionElement) {
                selectionElement.classList.add('missing-data-warning');
                // console.log('✅ Added missing-data-warning to selection element:', selectionElement);
              }
              // Also add to container for backward compatibility
              //select2Container.classList.add('missing-data-warning');
              // Also add to original element for consistency
              element.classList.add('border-warning');
            }
          } else {
            // Regular form elements
            element.classList.add('border-warning', 'missing-data-warning');
          }

          missingFields.push(field.name);

          // Add warning icon to label if not exists
          const label = document.querySelector(`label[for="${field.id}"]`);
          if (label && !label.querySelector('.warning-icon')) {
            const warningIcon = document.createElement('i');
            warningIcon.className = 'fa-solid fa-exclamation-triangle text-warning ms-1 warning-icon';
            warningIcon.title = 'Missing critical data';
            warningIcon.setAttribute('data-coreui-toggle', 'tooltip');
            warningIcon.setAttribute('data-coreui-placement', 'top');
            warningIcon.setAttribute('data-coreui-title', `กรุณากรอกข้อมูล ${field.name} ที่สำคัญ`);
            label.appendChild(warningIcon);

            // Initialize tooltip for the warning icon
            if (window.coreui && window.coreui.Tooltip) {
              new coreui.Tooltip(warningIcon, {
                customClass: 'warning-tooltip'
              });
            } else if (window.bootstrap && window.bootstrap.Tooltip) {
              new bootstrap.Tooltip(warningIcon, {
                title: `กรุณากรอกข้อมูล ${field.name} ที่สำคัญ`,
                placement: 'top',
                customClass: 'warning-tooltip',
                template: '<div class="tooltip warning-tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
              });
            }
          }
        } else {
          // Remove warning styling
          if (element.classList.contains('select2-hidden-accessible')) {
            const select2Container = element.nextElementSibling;
            if (select2Container) {
              // Remove warning from selection element directly
              const selectionElement = select2Container.querySelector('.select2-selection.select2-selection--single');
              if (selectionElement) {
                selectionElement.classList.remove('missing-data-warning');
                // console.log('✅ Removed missing-data-warning from selection element:', selectionElement);
              }
              // Also remove from container
              select2Container.classList.remove('missing-data-warning');
            }
          }
          element.classList.remove('border-warning', 'missing-data-warning');

          const label = document.querySelector(`label[for="${field.id}"]`);
          if (label) {
            const warningIcon = label.querySelector('.warning-icon');
            if (warningIcon) {
              // Dispose tooltip before removing the element
              if (warningIcon._tooltip) {
                warningIcon._tooltip.dispose();
              }
              // Also check for Bootstrap tooltip instance
              const bootstrapTooltip = bootstrap?.Tooltip?.getInstance?.(warningIcon);
              if (bootstrapTooltip) {
                bootstrapTooltip.dispose();
              }
              warningIcon.remove();
            }
          }
        }
      }
    });

      if (missingFields.length > 0) {
        // console.log(`⚠️ Missing critical benefits data: ${missingFields.join(', ')}`);
      } else {
        // console.log('✅ All critical benefits data is present');
      }

    } catch (error) {
      console.error('❌ Error in highlightMissingBenefitsData:', error);
    }
  };

  // Start highlight check with delay to allow Dynamic Forms to create elements
  setTimeout(performHighlightCheck, 300);
}

/**
 * 8. Format employee name according to specified format
 * @param {Object} rowData - Employee data containing name fields
 * @returns {string} - Formatted name string
 */
function formatEmployeeName(rowData) {
  try {
    // Get Thai name components
    const titleTh = rowData.titleTh || '';
    const fnameTh = rowData.fnameTh || '';
    const lnameTh = rowData.lnameTh || '';

    // Get English name components
    const titleEn = rowData.titleEn || '';
    const fnameEn = rowData.fnameEn || '';
    const lnameEn = rowData.lnameEn || '';

    // Format: "นาย สมชาย ใจดี (Mr. Somchai Jaidee)"
    const thaiName = [titleTh, fnameTh, lnameTh].filter(part => part.trim()).join(' ');
    const englishName = [titleEn, fnameEn, lnameEn].filter(part => part.trim()).join(' ');

    const formattedName = thaiName && englishName ? `${thaiName} (${englishName})` : thaiName || englishName || 'N/A';
    // console.log('✅ Formatted employee name:', formattedName);
    return formattedName;


  } catch (error) {
    console.error('❌ Error in formatEmployeeName:', error);
    return 'N/A';
  }
}

/**
 * 9. Auto-select dropdown values based on rowData (LEGACY VERSION - kept for compatibility)
 * @param {Object} rowData - Employee data from AG Grid
 * @deprecated Use populateAndSelectBasicDropdowns and populateAndSelectCascadingDropdowns instead
 */
function autoSelectDropdownValues(rowData) {
  // console.log('🎯 Auto-selecting dropdown values');

  try {
    // Define dropdown mappings
    const dropdownMappings = [
      { id: 'editCompany', value: rowData.companyCode || rowData.companyId },
      { id: 'editFormat', value: rowData.empFormat },
      { id: 'editYear', value: rowData.budgetYear },
      { id: 'editEmpStatus', value: rowData.empStatus },
      { id: 'editCostCenter', value: rowData.costCenterCode },
      { id: 'editDivision', value: rowData.orgLevel1 },
      { id: 'editDepartment', value: rowData.orgLevel2 },
      { id: 'editSection', value: rowData.orgLevel3 },
      { id: 'editLocation', value: rowData.orgUnitName },
      { id: 'editPosition', value: rowData.positionCode || rowData.positionName },
      { id: 'editJobBand', value: rowData.jobBand },
      { id: 'editEmpType', value: rowData.empTypeCode },
      { id: 'editNewHC', value: rowData.newHC },
      { id: 'editNewPeriod', value: rowData.newPeriod },
      { id: 'editNewLEPeriod', value: rowData.newLEPeriod },
      { id: 'editLEnOfMonth', value: rowData.leNoOfMonth },
      { id: 'editNOfMonth', value: rowData.noOfMonth },
      { id: 'editPlanCostCenter', value: rowData.planCostCenter }
    ];

    // Auto-select values with delays to ensure dropdowns are populated
    dropdownMappings.forEach((mapping, index) => {
      setTimeout(() => {
        const element = document.getElementById(mapping.id);
        if (element && mapping.value) {
          // For regular select elements
          if (element.tagName === 'SELECT') {
            const option = Array.from(element.options).find(opt =>
              opt.value === mapping.value.toString() ||
              opt.textContent.includes(mapping.value.toString())
            );
            if (option) {
              element.value = option.value;
            }
          }
          // For input elements
          else if (element.tagName === 'INPUT') {
            element.value = mapping.value;
          }

          // Trigger change event for cascading and select2 updates
          $(element).trigger('change');
        }
      }, EDIT_FORM_DELAYS.autoSelectDelay + (index * 50));
    });

    // Handle Join Date separately
    if (rowData.joinDate) {
      setTimeout(() => {
        const joinDateField = document.getElementById('editJoinDate');
        if (joinDateField) {
          // Convert date format if needed
          const dateValue = rowData.joinDate.split('T')[0]; // Remove time part if present
          joinDateField.value = dateValue;
        }
      }, EDIT_FORM_DELAYS.autoSelectDelay);
    }

    // Handle Remark field
    if (rowData.remark) {
      const remarkField = document.getElementById('editRemark');
      if (remarkField) {
        remarkField.value = rowData.remark;
      }
    }

    // console.log('✅ Dropdown auto-selection completed');
  } catch (error) {
    console.error('❌ Error in autoSelectDropdownValues:', error);
  }
}

/**
 * 10. Setup cascading dropdown relationships for edit mode
 * @param {Object} rowData - Employee data for context
 */
function setupEditModeCascading(rowData) {
  // console.log('🔗 Setting up edit mode cascading relationships');

  try {
    // Use the existing setupOffcanvasDropdownRelationshipsForEdit function
    // but ensure it's called with proper context for edit mode
    setupOffcanvasDropdownRelationshipsForEdit();

    // Additional edit-mode specific cascading logic can be added here
    // For example, ensure bonus types are populated when company changes
    $('#editCompany').on('change.editMode', function() {
      const companyID = $(this).val();
      if (companyID) {
        // Trigger bonus types update specifically for edit mode
        setTimeout(() => {
          debouncedUpdateOffcanvasBonusTypes();
        }, EDIT_FORM_DELAYS.cascadeDelay);
      }
    });

    // console.log('✅ Edit mode cascading relationships setup completed');
  } catch (error) {
    console.error('❌ Error in setupEditModeCascading:', error);
  }
}

// =============================================================================
// VALIDATION AND UI HELPER FUNCTIONS
// =============================================================================

/**
 * Show validation error message using CoreUI alert styling
 * @param {string} message - Error message to display
 */
function showValidationError(message) {
  // Remove existing validation alerts
  clearValidationErrors();

  // Create CoreUI alert
  const alertHtml = `
    <div class="alert alert-danger alert-dismissible fade show validation-alert" role="alert">
      <i class="fa-solid fa-exclamation-circle me-2"></i>
      <strong>Validation Error:</strong><br>
      ${message.replace(/\n/g, '<br>')}
      <button type="button" class="btn-close" data-coreui-dismiss="alert" aria-label="Close"></button>
    </div>
  `;

  // Insert at the top of offcanvas body
  const offcanvasBody = document.querySelector('#offcanvasAddRow .offcanvas-body');
  if (offcanvasBody) {
    offcanvasBody.insertAdjacentHTML('afterbegin', alertHtml);

    // Auto scroll to top to show the alert
    offcanvasBody.scrollTop = 0;
  }
}

/**
 * Clear all validation error messages and styling
 */
function clearValidationErrors() {
  // Remove validation alert messages
  const alerts = document.querySelectorAll('#offcanvasAddRow .validation-alert');
  alerts.forEach(alert => alert.remove());

  // Remove invalid styling from all form fields
  const invalidFields = document.querySelectorAll('#offcanvasAddRow .is-invalid');
  invalidFields.forEach(field => field.classList.remove('is-invalid'));

  // Remove warning styling from benefits fields
  const warningFields = document.querySelectorAll('#offcanvasAddRow .border-warning, #offcanvasAddRow .missing-data-warning');
  warningFields.forEach(field => {
    field.classList.remove('border-warning', 'missing-data-warning');
  });

  // Remove warning icons
  const warningIcons = document.querySelectorAll('#offcanvasAddRow .warning-icon');
  warningIcons.forEach(icon => {
    // Dispose tooltip before removing the element
    if (icon._tooltip) {
      icon._tooltip.dispose();
    }
    // Also check for Bootstrap tooltip instance
    const bootstrapTooltip = window.bootstrap?.Tooltip?.getInstance?.(icon);
    if (bootstrapTooltip) {
      bootstrapTooltip.dispose();
    }
    icon.remove();
  });
}

// Export new synchronization functions
window.syncOffcanvasPosition = syncOffcanvasPosition;
window.safeCloseOffcanvasWithSync = safeCloseOffcanvasWithSync;

// Export Modal Control Functions
window.preventSaveModalHide = preventSaveModalHide;
window.preventUpdateModalHide = preventUpdateModalHide;
window.safeCloseSaveModal = safeCloseSaveModal;
window.safeCloseUpdateModal = safeCloseUpdateModal;

// Validate offcanvas form data using core functions
function validateOffcanvasFormData() {
  try {
    const companyID = document.getElementById('editCompany')?.value;
    const cobu = document.getElementById('editCobu')?.value;
    const budgetYear = document.getElementById('editYear')?.value;

    // Use core validation function
    const validation = validateCompanyFields(companyID, {
      CompanyID: companyID,
      COBU: cobu,
      BudgetYear: budgetYear
    });

    if (!validation.isValid) {
      showWarningModal(`Form validation failed: ${validation.error}`);
      return false;
    }

    // Check company-specific requirements
    const company = detectCurrentCompany();
    if (company.isValid && company.config) {
      // console.log(`Validating form for ${formatCompanyDisplayName(companyID)} - Field count: ${company.config.fieldCount}`);

      // Additional company-specific validations can be added here
      if (supportsCompanyFeature('runrate')) {
        // Add runrate validation if needed for this company
        // console.log('Company requires runrate validation');
      }
    }

    return true;
  } catch (error) {
    console.error('Form validation error:', error);
    showWarningModal(`Validation error: ${error.message}`);
    return false;
  }
}

// Export functions to global scope for use by other modules
// window.populateOffcanvasDropdowns = populateOffcanvasDropdowns; // REMOVED: Functionality consolidated into enhanced populateDropdown()
window.setupOffcanvasDropdownRelationships = setupOffcanvasDropdownRelationships;
window.setupOffcanvasDropdownRelationshipsForAdd = setupOffcanvasDropdownRelationshipsForAdd;
window.setupOffcanvasDropdownRelationshipsForEdit = setupOffcanvasDropdownRelationshipsForEdit;
window.initializeOffcanvasHandlers = initializeOffcanvasHandlers;
window.safeCloseOffcanvas = safeCloseOffcanvas;
window.safeCloseBenefitsOffcanvas = safeCloseBenefitsOffcanvas;

// Export all offcanvas update functions
window.updateOffcanvasCoBU = updateOffcanvasCoBU; // Primary COBU function
window.updateOffcanvasEmpFormats = updateOffcanvasEmpFormats; // Legacy compatibility
window.updateOffcanvasYears = updateOffcanvasYears;
window.validateOffcanvasFormData = validateOffcanvasFormData;
window.updateOffcanvasCostCenters = updateOffcanvasCostCenters;
window.updateOffcanvasEmpStatus = updateOffcanvasEmpStatus;
window.updateOffcanvasEmployeeTypes = updateOffcanvasEmployeeTypes;
window.updateOffcanvasNewHC = updateOffcanvasNewHC;
window.updateOffcanvasNewPeriod = updateOffcanvasNewPeriod;
window.updateOffcanvasNOfMonth = updateOffcanvasNOfMonth;
window.updateOffcanvasNewLEPeriod = updateOffcanvasNewLEPeriod;
window.updateOffcanvasLEnOfMonth = updateOffcanvasLEnOfMonth;
window.updateOffcanvasJoinPVF = updateOffcanvasJoinPVF;
window.updateOffcanvasDivisions = updateOffcanvasDivisions;
window.updateOffcanvasDepartments = updateOffcanvasDepartments;
window.updateOffcanvasSections = updateOffcanvasSections;
window.updateOffcanvasLocations = updateOffcanvasLocations;
window.updateOffcanvasPositions = updateOffcanvasPositions;
window.updateOffcanvasJobBands = updateOffcanvasJobBands;
window.updateOffcanvasPlanCostCenters = updateOffcanvasPlanCostCenters;
window.updateOffcanvasSalaryStructure = updateOffcanvasSalaryStructure;
window.updateOffcanvasGroupRunrate = updateOffcanvasGroupRunrate;
window.updateOffcanvasFocusHC = updateOffcanvasFocusHC;
window.updateOffcanvasFocusPE = updateOffcanvasFocusPE;
window.updateOffcanvasExecutives = updateOffcanvasExecutives;
window.updateOffcanvasSalaryRanges = updateOffcanvasSalaryRanges;
window.updateOffcanvasMstPositions = updateOffcanvasMstPositions;
window.updateOffcanvasMstJobBands = updateOffcanvasMstJobBands;
window.updateOffcanvasBonusTypes = updateOffcanvasBonusTypes;

// Export Edit Form Functions
window.populateEditForm = populateEditForm;
window.processEditFormPopulation = processEditFormPopulation;
window.populateAndSelectBasicDropdowns = populateAndSelectBasicDropdowns;
window.populateAndSelectCascadingDropdowns = populateAndSelectCascadingDropdowns;
window.finalizeEditFormUI = finalizeEditFormUI;
window.autoSelectWithRetry = autoSelectWithRetry;
window.isDropdownReady = isDropdownReady;
window.displayEmployeeInfo = displayEmployeeInfo;
window.setEditModeFieldStates = setEditModeFieldStates;
window.populateLeBenefitsData = populateLeBenefitsData;
window.populateBgBenefitsData = populateBgBenefitsData;
window.validateRequiredFields = validateRequiredFields;
window.highlightMissingBenefitsData = highlightMissingBenefitsData;
window.formatEmployeeName = formatEmployeeName;
window.autoSelectDropdownValues = autoSelectDropdownValues;
window.setupEditModeCascading = setupEditModeCascading;
window.showValidationError = showValidationError;
window.clearValidationErrors = clearValidationErrors;

// Export debounced functions for use by other modules
window.debouncedUpdateOffcanvasCostCenters = debouncedUpdateOffcanvasCostCenters;
window.debouncedUpdateOffcanvasDivisions = debouncedUpdateOffcanvasDivisions;
window.debouncedUpdateOffcanvasDepartments = debouncedUpdateOffcanvasDepartments;
window.debouncedUpdateOffcanvasSections = debouncedUpdateOffcanvasSections;
window.debouncedUpdateOffcanvasLocations = debouncedUpdateOffcanvasLocations;
window.debouncedUpdateOffcanvasPositions = debouncedUpdateOffcanvasPositions;
window.debouncedUpdateOffcanvasJobBands = debouncedUpdateOffcanvasJobBands;
window.debouncedUpdateOffcanvasEmpStatus = debouncedUpdateOffcanvasEmpStatus;
window.debouncedUpdateOffcanvasEmployeeTypes = debouncedUpdateOffcanvasEmployeeTypes;
window.debouncedUpdateOffcanvasNewHC = debouncedUpdateOffcanvasNewHC;
window.debouncedUpdateOffcanvasNewPeriod = debouncedUpdateOffcanvasNewPeriod;
window.debouncedUpdateOffcanvasNOfMonth = debouncedUpdateOffcanvasNOfMonth;
window.debouncedUpdateOffcanvasNewLEPeriod = debouncedUpdateOffcanvasNewLEPeriod;
window.debouncedUpdateOffcanvasLEnOfMonth = debouncedUpdateOffcanvasLEnOfMonth;
window.debouncedUpdateOffcanvasJoinPvf = debouncedUpdateOffcanvasJoinPvf;
window.debouncedUpdateOffcanvasPlanCostCenters = debouncedUpdateOffcanvasPlanCostCenters;
window.debouncedUpdateOffcanvasSalaryStructure = debouncedUpdateOffcanvasSalaryStructure;
window.debouncedUpdateOffcanvasGroupRunrate = debouncedUpdateOffcanvasGroupRunrate;
window.debouncedUpdateOffcanvasFocusHC = debouncedUpdateOffcanvasFocusHC;
window.debouncedUpdateOffcanvasFocusPE = debouncedUpdateOffcanvasFocusPE;
window.debouncedUpdateOffcanvasExecutives = debouncedUpdateOffcanvasExecutives;
window.debouncedUpdateOffcanvasSalaryRanges = debouncedUpdateOffcanvasSalaryRanges;
window.debouncedUpdateOffcanvasMstPositions = debouncedUpdateOffcanvasMstPositions;
window.debouncedUpdateOffcanvasMstJobBands = debouncedUpdateOffcanvasMstJobBands;
window.debouncedUpdateOffcanvasBonusTypes = debouncedUpdateOffcanvasBonusTypes;

// =============================================================================
// OFFCANVAS HEAD COUNT MANAGEMENT SYSTEM
// =============================================================================

// Global Variables for Head Count Management
let offcanvasHeadCountCounter = 0;
let offcanvasHeadCountRowsData = [];
let isOffcanvasHeadCountInitialized = false;

// Configuration for Offcanvas Head Count
const OFFCANVAS_HEAD_COUNT_CONFIG = {
    CONTAINER_ID: 'offcanvasHeadCountContainer',
    CARD_ID: 'offcanvasBudgetHeadCountCard',
    ADD_BUTTON_ID: 'addOffcanvasHeadCountBtn',
    REFRESH_BUTTON_ID: 'refreshOffcanvasHeadCountBtn',
    TOTAL_FIELD_ID: 'offcanvasTotalHeadCount',
    STATUS_FIELD_ID: 'offcanvasHeadCountStatus'
};

/**
 * Initialize Offcanvas Head Count Management System
 */
function initializeOffcanvasHeadCountManagement() {
    console.log('🚀 Initializing Offcanvas Head Count Management...');

    if (isOffcanvasHeadCountInitialized) {
        console.log('⚠️ Offcanvas Head Count Management already initialized');
        return;
    }

    // Check if container exists
    const container = document.getElementById(OFFCANVAS_HEAD_COUNT_CONFIG.CONTAINER_ID);
    if (!container) {
        console.warn('⚠️ Offcanvas Head Count container not found, skipping initialization');
        return;
    }

    // Reset state
    container.innerHTML = '';
    offcanvasHeadCountCounter = 0;
    offcanvasHeadCountRowsData = [];

    // Setup event listeners
    setupOffcanvasHeadCountEventListeners();

    // Add initial row if card is visible
    const card = document.getElementById(OFFCANVAS_HEAD_COUNT_CONFIG.CARD_ID);
    if (card && !card.classList.contains('d-none')) {
        addOffcanvasHeadCountRow();
    }

    isOffcanvasHeadCountInitialized = true;
    console.log('✅ Offcanvas Head Count Management initialized successfully');
}

/**
 * Setup event listeners for offcanvas head count management
 */
function setupOffcanvasHeadCountEventListeners() {
    // Remove existing listeners to prevent duplicates
    const addBtn = document.getElementById(OFFCANVAS_HEAD_COUNT_CONFIG.ADD_BUTTON_ID);
    const refreshBtn = document.getElementById(OFFCANVAS_HEAD_COUNT_CONFIG.REFRESH_BUTTON_ID);

    if (addBtn) {
        addBtn.removeEventListener('click', handleAddOffcanvasHeadCountClick);
        addBtn.addEventListener('click', handleAddOffcanvasHeadCountClick);
    }

    if (refreshBtn) {
        refreshBtn.removeEventListener('click', handleRefreshOffcanvasHeadCountClick);
        refreshBtn.addEventListener('click', handleRefreshOffcanvasHeadCountClick);
    }

    // Listen for card visibility events
    document.addEventListener('offcanvasHeadCountCardVisible', handleOffcanvasHeadCountCardVisible);
    document.addEventListener('offcanvasHeadCountCardHidden', handleOffcanvasHeadCountCardHidden);
}

/**
 * Handle Add Head Count button click
 */
function handleAddOffcanvasHeadCountClick() {
    console.log('➕ Add Offcanvas Head Count button clicked');

    // Validate existing rows before adding new one
    if (!validateOffcanvasHeadCountDuplication()) {
        alert('Please fix duplicate entries before adding a new head count row.');
        return;
    }

    addOffcanvasHeadCountRow();
}

/**
 * Handle Refresh button click
 */
function handleRefreshOffcanvasHeadCountClick() {
    console.log('🔄 Refreshing offcanvas head count dropdowns...');

    const companyId = document.getElementById('editCompany')?.value;
    if (!companyId) {
        console.warn('⚠️ No company selected for refresh');
        return;
    }

    // Refresh all existing rows using existing offcanvas functions
    const rows = document.querySelectorAll('[data-offcanvas-headcount-id]');
    rows.forEach(row => {
        const rowId = row.getAttribute('data-offcanvas-headcount-id');
        populateOffcanvasHeadCountRowDropdowns(rowId, companyId);
    });
}

/**
 * Add new offcanvas head count row
 */
function addOffcanvasHeadCountRow() {
    offcanvasHeadCountCounter++;
    const rowId = `offcanvas_headcount_${offcanvasHeadCountCounter}`;

    console.log(`➕ Adding offcanvas head count row: ${rowId}`);

    const container = document.getElementById(OFFCANVAS_HEAD_COUNT_CONFIG.CONTAINER_ID);
    if (!container) {
        console.error('❌ Offcanvas head count container not found');
        return;
    }

    // Generate row HTML
    const rowHTML = generateOffcanvasHeadCountRowHTML(rowId);

    // Insert row
    container.insertAdjacentHTML('beforeend', rowHTML);

    // Populate dropdowns using existing offcanvas functions
    const companyId = document.getElementById('editCompany')?.value;
    if (companyId) {
        // Delay to ensure DOM is ready
        setTimeout(() => {
            populateOffcanvasHeadCountRowDropdowns(rowId, companyId);
            addOffcanvasHeadCountRowEventListeners(rowId);
        }, 200);
    }

    // Update totals
    setTimeout(() => {
        calculateOffcanvasHeadCountTotals();
    }, 500);

    console.log(`✅ Offcanvas head count row ${rowId} added successfully`);
}

/**
 * Generate HTML for offcanvas head count row
 */
function generateOffcanvasHeadCountRowHTML(rowId) {
    return `
    <div class="headcount-row mb-3 p-3 border rounded" data-offcanvas-headcount-id="${rowId}">
        <!-- Row 1: First 4 fields -->
        <div class="row align-items-end mb-2">
            <!-- Employee Type -->
            <div class="col-md-3 mb-2">
                <label class="form-label small"><b>Employee Type</b> <span style="color:red">*</span></label>
                <select class="form-select form-select-sm" id="${rowId}_empType" name="empType" data-field="employeeType">
                    <option value="">Select Employee Type</option>
                </select>
            </div>

            <!-- New HC -->
            <div class="col-md-3 mb-2">
                <label class="form-label small"><b>New HC</b> <span style="color:red">*</span></label>
                <select class="form-select form-select-sm" id="${rowId}_newHC" name="newHC" data-field="newHC">
                    <option value="">Select New HC</option>
                </select>
            </div>

            <!-- New Period -->
            <div class="col-md-3 mb-2">
                <label class="form-label small"><b>New Period</b> <span style="color:red">*</span></label>
                <select class="form-select form-select-sm" id="${rowId}_newPeriod" name="newPeriod" data-field="newPeriod">
                    <option value="">Select Period</option>
                </select>
            </div>

            <!-- New LE Period -->
            <div class="col-md-3 mb-2">
                <label class="form-label small"><b>New LE Period</b> <span style="color:red">*</span></label>
                <select class="form-select form-select-sm" id="${rowId}_newLEPeriod" name="newLEPeriod" data-field="newLEPeriod">
                    <option value="">Select LE Period</option>
                </select>
            </div>
        </div>

        <!-- Row 2: Last 3 fields + Remove button -->
        <div class="row align-items-end">
            <!-- LE No. of Month -->
            <div class="col-md-3 mb-2">
                <label class="form-label small"><b>LE No. of Month</b> <span style="color:red">*</span></label>
                <select class="form-select form-select-sm" id="${rowId}_leNoMonth" name="leNoMonth" data-field="leNoMonth">
                    <option value="">Select LE Months</option>
                </select>
            </div>

            <!-- No. of Month -->
            <div class="col-md-3 mb-2">
                <label class="form-label small"><b>No. of Month</b> <span style="color:red">*</span></label>
                <select class="form-select form-select-sm" id="${rowId}_noMonth" name="noMonth" data-field="noMonth">
                    <option value="">Select Months</option>
                </select>
            </div>

            <!-- Join PVF -->
            <div class="col-md-3 mb-2">
                <label class="form-label small"><b>Join PVF</b> <span style="color:red">*</span></label>
                <select class="form-select form-select-sm" id="${rowId}_joinPvf" name="joinPvf" data-field="joinPvf">
                    <option value="">Select Join PVF</option>
                </select>
            </div>

            <!-- Remove Button -->
            <div class="col-md-3 mb-2 d-flex align-items-end">
                <button type="button" class="btn btn-sm btn-outline-danger remove-offcanvas-headcount-btn w-100"
                        data-offcanvas-headcount-id="${rowId}" title="Remove Head Count Row">
                    <i class="fa-solid fa-times me-1"></i> Remove
                </button>
            </div>
        </div>
    </div>
    `;
}

/**
 * ⭐ OPTION 1: Pure Dynamic - Update all dynamic head count dropdowns when company changes
 */
function updateAllDynamicHeadCountDropdowns() {
  const companyID = document.getElementById('editCompany')?.value;

  if (!companyID) {
    console.log('⚠️ [Dynamic Head Count] No company selected');
    return;
  }

  console.log('🔄 [OPTION 1] Updating all dynamic head count dropdowns for company:', companyID);

  // Find all dynamic head count rows
  const headCountRows = document.querySelectorAll('[data-offcanvas-headcount-id]');
  console.log(`🔍 [OPTION 1] Found ${headCountRows.length} dynamic head count rows`);

  if (headCountRows.length === 0) {
    console.log('⚠️ [OPTION 1] No dynamic head count rows found - they may not be created yet');
    return;
  }

  headCountRows.forEach((row, index) => {
    const rowId = row.getAttribute('data-offcanvas-headcount-id');
    console.log(`🔍 [OPTION 1] Row ${index + 1}: ID = ${rowId}`);

    if (rowId && rowId.includes('offcanvas_headcount_')) {
      console.log(`🎯 [OPTION 1] Updating dropdowns for row: ${rowId}`);
      populateOffcanvasHeadCountRowDropdowns(rowId, companyID);
    }
  });

  console.log('✅ [OPTION 1] All dynamic head count dropdowns update process completed');
}

/**
 * ⭐ OPTION 1: Setup dedicated event listener for dynamic head count dropdowns - IMMEDIATE UPDATE
 */
function setupDynamicHeadCountCompanyListener() {
  // Remove existing listener to prevent duplicates
  $('#editCompany').off('change.dynamicHeadCount');

  // Add dedicated listener for dynamic head count updates only - NO DEBOUNCING
  $('#editCompany').on('change.dynamicHeadCount', function () {
    const companyID = $(this).val();
    console.log('🔄 [Dynamic Head Count] Company changed to:', companyID);

    if (companyID) {
      // Immediate update without debouncing for better responsiveness
      updateAllDynamicHeadCountDropdowns();
    } else {
      console.log('⚠️ [Dynamic Head Count] No company selected, clearing dropdowns');
      // Could add clear dropdowns logic here if needed
    }
  });

  console.log('✅ [Dynamic Head Count] Company change listener initialized (immediate mode)');
}/**
 * Populate all dropdowns for an offcanvas head count row using existing offcanvas functions
 */
async function populateOffcanvasHeadCountRowDropdowns(rowId, companyId) {
    console.log(`🔄 [OPTION 1] Populating offcanvas dropdowns for row: ${rowId} with company: ${companyId}`);

    try {
        // Use existing offcanvas dropdown functions
        // Employee Type
        const empTypeElement = document.getElementById(`${rowId}_empType`);
        console.log(`🔍 [${rowId}] Employee Type element:`, empTypeElement ? 'FOUND' : 'NOT FOUND');

        if (empTypeElement) {
            console.log(`📡 [${rowId}] Populating Employee Type dropdown...`);
            populateDropdown(`${rowId}_empType`, `${SELECT_API.employeeTypes}?companyId=${companyId}`, 'Select Employee Type', (option, item) => {
                option.value = item.itemCode;
                option.textContent = item.itemName;
            }, true);
        }        // New HC
        const newHCElement = document.getElementById(`${rowId}_newHC`);
        console.log(`🔍 [${rowId}] New HC element:`, newHCElement ? 'FOUND' : 'NOT FOUND');

        if (newHCElement) {
            console.log(`📡 [${rowId}] Populating New HC dropdown...`);
            populateDropdown(`${rowId}_newHC`, `${SELECT_API.newHC}?companyId=${companyId}`, 'Select New HC', (option, item) => {
                option.value = item.itemCode;
                option.textContent = item.itemName;
            }, true);
        }

        // New Period
        const newPeriodElement = document.getElementById(`${rowId}_newPeriod`);
        console.log(`🔍 [${rowId}] New Period element:`, newPeriodElement ? 'FOUND' : 'NOT FOUND');

        if (newPeriodElement) {
            console.log(`📡 [${rowId}] Populating New Period dropdown...`);
            populateDropdown(`${rowId}_newPeriod`, `${SELECT_API.noOfMonths}?companyId=${companyId}`, 'Select New Period', (option, item) => {
                option.value = item.itemCode;
                option.textContent = item.itemName;
            }, true);
        }

        // New LE Period
        if (document.getElementById(`${rowId}_newLEPeriod`)) {
            populateDropdown(`${rowId}_newLEPeriod`, `${SELECT_API.leNoOfMonths}?companyId=${companyId}`, 'Select New LE Period', (option, item) => {
                option.value = item.itemCode;
                option.textContent = item.itemName;
            }, true);
        }

        // LE No. of Month
        if (document.getElementById(`${rowId}_leNoMonth`)) {
            populateDropdown(`${rowId}_leNoMonth`, `${SELECT_API.leNoOfMonths}?companyId=${companyId}`, 'Select LE No. of Month', (option, item) => {
                option.value = item.itemCode;
                option.textContent = item.itemName;
            }, true);
        }

        // No. of Month
        if (document.getElementById(`${rowId}_noMonth`)) {
            populateDropdown(`${rowId}_noMonth`, `${SELECT_API.noOfMonths}?companyId=${companyId}`, 'Select No. of Month', (option, item) => {
                option.value = item.itemCode;
                option.textContent = item.itemName;
            }, true);
        }

        // Join PVF (NEW)
        if (document.getElementById(`${rowId}_joinPvf`)) {
            populateDropdown(`${rowId}_joinPvf`, `${SELECT_API.joinPvf}?companyId=${companyId}`, 'Select Join PVF', (option, item) => {
                option.value = item.itemCode;
                option.textContent = item.itemName;
            }, true);
        }

        console.log(`✅ All offcanvas dropdowns populated for row: ${rowId}`);

    } catch (error) {
        console.error(`❌ Error populating offcanvas dropdowns for row ${rowId}:`, error);
    }
}

/**
 * Add event listeners to offcanvas head count row elements
 */
function addOffcanvasHeadCountRowEventListeners(rowId) {
    // Remove button event listener
    const removeBtn = document.querySelector(`[data-offcanvas-headcount-id="${rowId}"] .remove-offcanvas-headcount-btn`);
    if (removeBtn) {
        removeBtn.addEventListener('click', () => removeOffcanvasHeadCountRow(rowId));
    }

    // Validation event listeners for all dropdowns
    const dropdowns = document.querySelectorAll(`[data-offcanvas-headcount-id="${rowId}"] select`);
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('change', () => {
            setTimeout(() => {
                validateOffcanvasHeadCountDuplication();
                calculateOffcanvasHeadCountTotals();
            }, 100);
        });
    });
}

/**
 * Remove offcanvas head count row
 */
function removeOffcanvasHeadCountRow(rowId) {
    console.log(`🗑️ Removing offcanvas head count row: ${rowId}`);

    const row = document.querySelector(`[data-offcanvas-headcount-id="${rowId}"]`);
    if (row) {
        row.remove();

        // Remove from data array
        offcanvasHeadCountRowsData = offcanvasHeadCountRowsData.filter(item => item.rowId !== rowId);

        // Recalculate totals
        calculateOffcanvasHeadCountTotals();

        // Revalidate remaining rows
        setTimeout(() => {
            validateOffcanvasHeadCountDuplication();
        }, 100);

        console.log(`✅ Offcanvas head count row ${rowId} removed successfully`);
    }
}

/**
 * Validate offcanvas head count row duplication
 */
function validateOffcanvasHeadCountDuplication() {
    const rows = document.querySelectorAll('[data-offcanvas-headcount-id]');
    const combinations = new Map();
    let hasDuplicates = false;

    // Reset all validation states
    rows.forEach(row => {
        const selects = row.querySelectorAll('select');
        selects.forEach(select => {
            select.classList.remove('is-invalid');
        });
    });

    // Check for duplicate combinations
    rows.forEach(row => {
        const empType = row.querySelector('[data-field="employeeType"]')?.value;
        const newPeriod = row.querySelector('[data-field="newPeriod"]')?.value;
        const newLEPeriod = row.querySelector('[data-field="newLEPeriod"]')?.value;

        if (empType && newPeriod && newLEPeriod) {
            const combination = `${empType}-${newPeriod}-${newLEPeriod}`;

            if (combinations.has(combination)) {
                // Mark as duplicate
                const selects = row.querySelectorAll('select');
                selects.forEach(select => {
                    select.classList.add('is-invalid');
                });

                // Also mark the original row
                const originalRowId = combinations.get(combination);
                const originalRow = document.querySelector(`[data-offcanvas-headcount-id="${originalRowId}"]`);
                if (originalRow) {
                    const originalSelects = originalRow.querySelectorAll('select');
                    originalSelects.forEach(select => {
                        select.classList.add('is-invalid');
                    });
                }

                hasDuplicates = true;
            } else {
                combinations.set(combination, row.getAttribute('data-offcanvas-headcount-id'));
            }
        }
    });

    // Update status message
    const statusElement = document.getElementById(OFFCANVAS_HEAD_COUNT_CONFIG.STATUS_FIELD_ID);
    if (statusElement) {
        if (hasDuplicates) {
            statusElement.className = 'alert alert-danger py-1';
            statusElement.innerHTML = '<small><i class="fa-solid fa-exclamation-triangle me-1"></i>Duplicate head count combinations detected</small>';
        } else {
            statusElement.className = 'alert alert-success py-1';
            statusElement.innerHTML = '<small><i class="fa-solid fa-check-circle me-1"></i>All head count entries are valid</small>';
        }
    }

    return !hasDuplicates;
}

/**
 * Calculate total head count
 */
function calculateOffcanvasHeadCountTotals() {
    let total = 0;

    const rows = document.querySelectorAll('[data-offcanvas-headcount-id]');
    rows.forEach(row => {
        const newHCSelect = row.querySelector('[data-field="newHC"]');
        if (newHCSelect && newHCSelect.value) {
            const hcValue = parseInt(newHCSelect.selectedOptions[0]?.textContent?.match(/\d+/)?.[0] || '0');
            total += hcValue;
        }
    });

    // Update total field
    const totalField = document.getElementById(OFFCANVAS_HEAD_COUNT_CONFIG.TOTAL_FIELD_ID);
    if (totalField) {
        totalField.value = total.toString();
    }

    console.log(`📊 Total Offcanvas Head Count: ${total}`);
    return total;
}

/**
 * Get all offcanvas head count data for form submission
 */
function getOffcanvasHeadCountData() {
    const data = [];
    const rows = document.querySelectorAll('[data-offcanvas-headcount-id]');

    rows.forEach(row => {
        const rowId = row.getAttribute('data-offcanvas-headcount-id');
        const rowData = {
            rowId: rowId,
            employeeType: row.querySelector('[data-field="employeeType"]')?.value || '',
            newHC: row.querySelector('[data-field="newHC"]')?.value || '',
            newPeriod: row.querySelector('[data-field="newPeriod"]')?.value || '',
            newLEPeriod: row.querySelector('[data-field="newLEPeriod"]')?.value || '',
            leNoMonth: row.querySelector('[data-field="leNoMonth"]')?.value || '',
            noMonth: row.querySelector('[data-field="noMonth"]')?.value || '',
            joinPvf: row.querySelector('[data-field="joinPvf"]')?.value || ''
        };

        // Only include rows with at least some data
        if (rowData.employeeType || rowData.newHC) {
            data.push(rowData);
        }
    });

    console.log('📋 Offcanvas Head Count Data:', data);
    return data;
}

/**
 * Load offcanvas head count data (for edit mode)
 */
function loadOffcanvasHeadCountData(data) {
    console.log('📥 Loading offcanvas head count data:', data);

    if (!Array.isArray(data) || data.length === 0) {
        console.log('📝 No offcanvas head count data to load, adding default row');
        addOffcanvasHeadCountRow();
        return;
    }

    // Clear existing rows
    const container = document.getElementById(OFFCANVAS_HEAD_COUNT_CONFIG.CONTAINER_ID);
    if (container) {
        container.innerHTML = '';
        offcanvasHeadCountCounter = 0;
    }

    // Add rows for each data item
    data.forEach((item, index) => {
        addOffcanvasHeadCountRow();

        // Populate the row with data
        setTimeout(() => {
            const rowId = `offcanvas_headcount_${offcanvasHeadCountCounter}`;
            const row = document.querySelector(`[data-offcanvas-headcount-id="${rowId}"]`);

            if (row) {
                const fields = {
                    employeeType: item.employeeType,
                    newHC: item.newHC,
                    newPeriod: item.newPeriod,
                    newLEPeriod: item.newLEPeriod,
                    leNoMonth: item.leNoMonth,
                    noMonth: item.noMonth,
                    joinPvf: item.joinPvf
                };

                Object.entries(fields).forEach(([field, value]) => {
                    const element = row.querySelector(`[data-field="${field}"]`);
                    if (element && value) {
                        element.value = value;
                    }
                });
            }
        }, 500 * (index + 1)); // Stagger the population
    });

    // Calculate totals after all data is loaded
    setTimeout(() => {
        calculateOffcanvasHeadCountTotals();
        validateOffcanvasHeadCountDuplication();
    }, 1000);
}

/**
 * Validate offcanvas head count data before form submission
 */
function validateOffcanvasHeadCount() {
    console.log('🔍 Validating offcanvas head count data...');

    const data = getOffcanvasHeadCountData();

    if (data.length === 0) {
        console.warn('⚠️ No offcanvas head count data found');
        return {
            isValid: false,
            message: 'At least one head count entry is required.'
        };
    }

    // Check for required fields
    for (const row of data) {
        if (!row.employeeType || !row.newHC || !row.newPeriod ||
            !row.newLEPeriod || !row.leNoMonth || !row.noMonth || !row.joinPvf) {
            return {
                isValid: false,
                message: 'All fields are required for each head count row.'
            };
        }
    }

    // Check for duplicates
    if (!validateOffcanvasHeadCountDuplication()) {
        return {
            isValid: false,
            message: 'Duplicate head count combinations are not allowed.'
        };
    }

    console.log('✅ Offcanvas head count validation passed');
    return {
        isValid: true,
        data: data,
        totalHeadCount: calculateOffcanvasHeadCountTotals()
    };
}

/**
 * Handle offcanvas head count card visibility events
 */
function handleOffcanvasHeadCountCardVisible(event) {
    console.log('👁️ Offcanvas head count card became visible');

    const container = document.getElementById(OFFCANVAS_HEAD_COUNT_CONFIG.CONTAINER_ID);
    if (container && container.children.length === 0) {
        addOffcanvasHeadCountRow();
    }
}

function handleOffcanvasHeadCountCardHidden(event) {
    console.log('🙈 Offcanvas head count card hidden');

    const container = document.getElementById(OFFCANVAS_HEAD_COUNT_CONFIG.CONTAINER_ID);
    if (container) {
        container.innerHTML = '';
        offcanvasHeadCountCounter = 0;
        offcanvasHeadCountRowsData = [];
    }
}

// Export Offcanvas Head Count Functions
window.initializeOffcanvasHeadCountManagement = initializeOffcanvasHeadCountManagement;
window.addOffcanvasHeadCountRow = addOffcanvasHeadCountRow;
window.removeOffcanvasHeadCountRow = removeOffcanvasHeadCountRow;
window.getOffcanvasHeadCountData = getOffcanvasHeadCountData;
window.loadOffcanvasHeadCountData = loadOffcanvasHeadCountData;
window.validateOffcanvasHeadCount = validateOffcanvasHeadCount;
window.calculateOffcanvasHeadCountTotals = calculateOffcanvasHeadCountTotals;
window.populateOffcanvasHeadCountRowDropdowns = populateOffcanvasHeadCountRowDropdowns;
window.updateAllDynamicHeadCountDropdowns = updateAllDynamicHeadCountDropdowns;
window.setupDynamicHeadCountCompanyListener = setupDynamicHeadCountCompanyListener;


