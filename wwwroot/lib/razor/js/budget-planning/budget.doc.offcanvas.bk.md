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
function setupDropdownRelationships() {
  // Remove existing event listeners to prevent duplicates
  $('#editCompany').off('change.offcanvas');
  $('#editCobu').off('change.offcanvas');
  $('#editYear').off('change.offcanvas');
  $('#editCostCenter').off('change.offcanvas');
  $('#editDivision').off('change.offcanvas');
  $('#editDepartment').off('change.offcanvas');
  $('#editSection').off('change.offcanvas');
  $('#editCompstore').off('change.offcanvas');
  $('#editPosition').off('change.offcanvas');

  // Company change - update all dependent dropdowns sequentially
  $('#editCompany').on('change.offcanvas', function () {
    const companyID = $(this).val();
    if (companyID) {
      // 🆕 Update COBU label
      updateCobuLabel(companyID);

      // Update Format and Year first (immediate)
      updateOffcanvasEmpFormats(companyID);
      updateOffcanvasYears(companyID);

      // Use debounced functions for other APIs to prevent rapid calls
      // console.log('🔄 Calling debouncedUpdateOffcanvasEmpStatus for companyID:', companyID);
      debouncedUpdateOffcanvasEmpStatus();
      debouncedUpdateOffcanvasCostCenters();

      // ✅ Static Head Count Fields (Edit Mode Only)
      debouncedUpdateOffcanvasEmployeeTypes();
      debouncedUpdateOffcanvasNewHC();
      debouncedUpdateOffcanvasNewPeriod();
      debouncedUpdateOffcanvasNOfMonth();
      debouncedUpdateOffcanvasNewLEPeriod();
      debouncedUpdateOffcanvasLEnOfMonth();

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
      clearOffcanvasDropdowns(['editCobu', 'editYear', 'editCostCenter', 'editDivision', 'editDepartment', 'editSection', 'editCompstore', 'editEmpStatus', 'editEmpType', 'editNewHC', 'editNewPeriod', 'editNOfMonth', 'editNewLEPeriod', 'editLEnOfMonth', 'editNewLEnOfMonth', 'editPosition', 'editJobBand', 'editPlanCostCenter', 'editSalaryStructure', 'editGroupRunrate', 'editFocusHC', 'editFocusPE', 'editExecutives', 'editBgBonusType']);
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
  $('#editCompstore').on('change.offcanvas', function () {
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
    // const editLePayrollField = document.getElementById('editLePayroll');

    // if (editLePayrollField && selectedValue) {
    //   // Set the selected salary structure value to editLePayroll field
    //   editLePayrollField.value = selectedValue;

    //   // Trigger change event if needed for any dependent functionality
    //   $(editLePayrollField).trigger('change');
    // } else if (editLePayrollField && !selectedValue) {
    //   // Clear the field if no salary structure is selected
    //   editLePayrollField.value = '';
    // }
  });
}

// Setup cascading relationships for Edit Row mode
function setupOffcanvasDropdownRelationshipsForEdit() {
  // Similar to Add mode but may have different behavior for edit
  setupDropdownRelationships();
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
    return setupDropdownRelationships();
  }
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

  const selectedCobu = document.getElementById('editCobu')?.value;
  const selectedYear = document.getElementById('editYear')?.value;
  const selectedCostCenter = document.getElementById('editCostCenter')?.value;
  const selectedDivision = document.getElementById('editDivision')?.value;
  const selectedDepartment = document.getElementById('editDepartment')?.value;
  const selectedSection = document.getElementById('editSection')?.value;
  const selectedPosition = document.getElementById('editPosition')?.value;

  let empStatusParams = [];
  if (companyID) empStatusParams.push(`companyID=${companyID}`);
  if (selectedCobu) empStatusParams.push(`Cobu=${encodeURIComponent(selectedCobu)}`);
  if (selectedYear) empStatusParams.push(`budgetYear=${encodeURIComponent(selectedYear)}`);
  if (selectedCostCenter) empStatusParams.push(`costCenterCode=${encodeURIComponent(selectedCostCenter)}`);
  if (selectedDivision) empStatusParams.push(`divisionCode=${encodeURIComponent(selectedDivision)}`);
  if (selectedDepartment) empStatusParams.push(`departmentCode=${encodeURIComponent(selectedDepartment)}`);
  if (selectedSection) empStatusParams.push(`sectionCode=${encodeURIComponent(selectedSection)}`);
  if (selectedPosition) empStatusParams.push(`positionCode=${encodeURIComponent(selectedPosition)}`);
  const empStatusQuery = empStatusParams.length ? `?${empStatusParams.join('&')}` : '';

  populateDropdown('editEmpStatus', `${BUDGET_API.empStatuses}${empStatusQuery}`, 'Select Employee Status', (option, item) => {
    option.value = item;
    option.textContent = item;
  }, true);
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

// Update New LE Period dropdown
function updateOffcanvasNewLEPeriod() {
  const companyID = document.getElementById('editCompany')?.value;

  if (companyID) {
    populateDropdown('editNewLEPeriod', `${SELECT_API.newLEPeriods}?companyId=${companyID}`, 'Select New LE Period', (option, item) => {
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
      option.value = item.itemValue;  // ✅ Use itemValue (the numeric value)
      option.textContent = item.itemValue;
    }, true);
  }
}

// Update LE No. of Month dropdown (uses same API as New LE Period)
function updateOffcanvasLEnOfMonth() {
  const companyID = document.getElementById('editCompany')?.value;

  if (companyID) {
    populateDropdown('editLEnOfMonth', `${SELECT_API.leNoOfMonths}?companyId=${companyID}`, 'Select LE No. of Month', (option, item) => {
      option.value = item.itemValue;  // ✅ Use itemValue (the numeric value)
      option.textContent = item.itemValue;
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
  let SelectDesc = 'Select Location';
  SelectDesc = (companyID === '1' || companyID === 1) ? "Select Company" : "Select Store Name";

  populateDropdown('editCompstore', `${BUDGET_API.storeNames}${locationQuery}`, SelectDesc, (option, item) => {
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
  const selectedLocation = document.getElementById('editCompstore')?.value;

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
  const selectedLocation = document.getElementById('editCompstore')?.value;
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

  // 🔧 FIX: Use consistent property name
  populateDropdown('editRunRateGroup', `${SELECT_API.groupRunRates}${groupRunrateQuery}`, 'Select Group Runrate', (option, item) => {
    option.value = item.runRateValue;
    option.textContent = `${item.runRateName}-[${item.grouping}] (${item.runRateValue}%)`;
  }, true);
}

// Update Salary Ranges dropdown
function updateOffcanvasSalaryRanges() {
  const companyID = document.getElementById('editCompany')?.value;
  const selectjobBand = document.getElementById('editJobBand')?.value;

  // 🛡️ Skip API call for Job Bands that don't have salary ranges
  const skipJobBands = ["C", "Advisor", "CEO", "Contract", "Perma-Temp", "UC"];
  if (selectjobBand && skipJobBands.includes(selectjobBand)) {
    console.log(`ℹ️ Job Band "${selectjobBand}" does not require Salary Range lookup - skipping API call`);
    // Clear dropdown or set to default
    const salaryStructureSelect = document.getElementById('editSalaryStructure');
    if (salaryStructureSelect) {
      salaryStructureSelect.innerHTML = '<option value="">Select Salary Structure</option>';
      $(salaryStructureSelect).trigger('change');
    }
    return;
  }

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
}

// Intercept offcanvas hide event for both CoreUI and Bootstrap
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
    const offcanvasEl = document.getElementById('offcanvasEditRow');
    const instance = getOffcanvasInstance(offcanvasEl);
    instance.hide();
    setTimeout(() => {
      allowOffcanvasClose = false;

      // Deselect any selected rows in budget grid to allow re-selection
      const budgetGridApi = window.getGridApi ? window.getGridApi() : null;
      if (budgetGridApi) {
        budgetGridApi.deselectAll();
        // console.log('Budget grid rows deselected after closing offcanvasEditRow');
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
  const offcanvasEl = document.getElementById('offcanvasEditRow');
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
  document.addEventListener('click', function (e) {
    if (e.target && e.target.classList.contains('modal-backdrop')) {
      const saveModalVisible = confirmSaveModal && confirmSaveModal.classList.contains('show');
      const updateModalVisible = confirmUpdateModal && confirmUpdateModal.classList.contains('show');

      if ((saveModalVisible && !allowSaveClose) || (updateModalVisible && !allowUpdateClose)) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  });

  // 🧮 CAL BUTTON EVENT: Handle Cal button click for BJC/BIGC Budget Estimation
  // Button is created by budget.plan.benefits.templates.js with ID pattern: calc${field.id.replace('edit', '')}Btn
  // For editLePayroll field → calcLePayrollBtn
  // Use event delegation like Batch Entry (budget.plan.events.js Line 1472)
  $(document).on('click', '#calcLePayrollBtn', function () {
    console.log('🧮 Cal button clicked (Offcanvas Edit Form - ID: calcLePayrollBtn)');
    calculateOffcanvasBudgetEstimate();
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

  // Update modal logic - SA APPROVED IMPLEMENTATION
  document.getElementById('confirmUpdateBtn').addEventListener('click', async function () {
    console.log('✅ User confirmed update - collecting data...');

    try {
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // STEP 1: Collect form data (includes 3-field validation)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const formData = collectUpdateFormData();
      if (!formData) {
        console.error('❌ Failed to collect form data');
        safeCloseUpdateModal();
        return;
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // STEP 2: Call API to update budget
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      console.log('🌐 Calling updateBudgetData API...');
      const result = await updateBudgetData(formData);

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // STEP 3: Handle response
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      if (result.success) {
        // ✅ Success: Show message, close modals, reload page
        console.log('✅ Update successful:', result.data);
        showSuccessModal('บันทึกข้อมูลสำเร็จ');

        // Close modals
        safeCloseUpdateModal();
        safeCloseOffcanvas();

        // SA Requirement #3: Reload page to show updated data
        console.log('🔄 Reloading page...');
        setTimeout(() => {
          location.reload();
        }, 500);

      } else {
        // ❌ Error: Show error message, keep form open
        console.error('❌ Update failed:', result.error);
        showErrorModal('บันทึกข้อมูลไม่สำเร็จ: ' + result.error);
        safeCloseUpdateModal();
      }

    } catch (error) {
      console.error('💥 Exception during update:', error);
      showErrorModal('เกิดข้อผิดพลาดในระบบ: ' + error.message);
      safeCloseUpdateModal();
    }
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
  if (offcanvasId === 'offcanvasEditRow') {
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
 * Helper: Auto-select dropdown value with retry mechanism (for value-based matching)
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
        console.log(`🔄 Retry ${attempts}/${maxRetries} for ${elementId} with value: ${value}`);
        setTimeout(trySelect, 200); // Wait 200ms and try again
      } else {
        console.warn(`⚠️ Failed to select ${elementId} with value "${value}" after ${maxRetries} attempts`);
        resolve(false);
      }
    };

    trySelect();
  });
}

/**
 * Helper: Auto-select dropdown by text matching with retry mechanism
 * For dropdowns that return text values (e.g., salaryStructure, runrateCode)
 * @param {string} elementId - ID of the dropdown element
 * @param {string} textToFind - Text to find in option.text or option.textContent
 * @param {boolean} partialMatch - If true, use partial matching (contains), if false, exact match
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise<boolean>} - Success status
 */
function autoSelectByTextWithRetry(elementId, textToFind, partialMatch = true, maxRetries = 5) {
  return new Promise((resolve) => {
    let attempts = 0;

    const trySelect = () => {
      const element = document.getElementById(elementId);

      // Check if element exists and has options
      if (element && element.options && element.options.length > 1) {
        // Find matching option by text content
        const option = Array.from(element.options).find(opt => {
          const optionText = opt.text || opt.textContent || '';
          const searchText = textToFind?.toString() || '';

          if (!searchText) return false;

          if (partialMatch) {
            // Partial match: check if option text contains search text (case-insensitive)
            return optionText.toLowerCase().includes(searchText.toLowerCase());
          } else {
            // Exact match (case-insensitive)
            return optionText.toLowerCase() === searchText.toLowerCase();
          }
        });

        if (option) {
          element.value = option.value;
          $(element).trigger('change');
          console.log(`✅ Successfully selected ${elementId} by text: "${textToFind}" → "${option.text}"`);
          resolve(true);
          return;
        }
      }

      attempts++;
      if (attempts < maxRetries) {
        console.log(`🔄 Retry ${attempts}/${maxRetries} for ${elementId} with text: "${textToFind}"`);
        setTimeout(trySelect, 200); // Wait 200ms and try again
      } else {
        console.warn(`⚠️ Failed to select ${elementId} with text "${textToFind}" after ${maxRetries} attempts`);
        resolve(false);
      }
    };

    trySelect();
  });
}

/**
 * Helper: Auto-select dropdown by EXACT text matching with retry mechanism
 * For dropdowns where exact match is required (e.g., Position names)
 * Matches by comparing option.text with exactText (case-insensitive)
 * @param {string} elementId - ID of the dropdown element
 * @param {string} exactText - Exact text to match (case-insensitive)
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise<boolean>} - Success status
 */
function autoSelectByExactTextWithRetry(elementId, exactText, maxRetries = 5) {
  return new Promise((resolve) => {
    let attempts = 0;

    const trySelect = () => {
      const element = document.getElementById(elementId);

      // Check if element exists and has options
      if (element && element.options && element.options.length > 1) {
        const searchText = (exactText?.toString() || '').trim();

        if (!searchText) {
          resolve(false);
          return;
        }

        // 🔍 DEBUG: Log all available options
        // console.log(`🔍 [${elementId}] Searching for EXACT text: "${exactText}"`);
        // console.log(`🔍 [${elementId}] Available options (${element.options.length}):`);
        // Array.from(element.options).forEach((opt, idx) => {
        //   const optText = (opt.text || opt.textContent || '').trim();
        //   console.log(`  ${idx}: "${optText}" → value: "${opt.value}"`);
        // });

        // Find option where option.text equals exactText (case-insensitive)
        const option = Array.from(element.options).find(opt => {
          const optionText = (opt.text || opt.textContent || '').trim();
          // Match: option.text === exactText (case-insensitive)
          return optionText.toLowerCase() === searchText.toLowerCase();
        });

        if (option) {
          // Get the index of the matched option
          const optionIndex = Array.from(element.options).indexOf(option);

          // Set selectedIndex to point to the matched option
          element.selectedIndex = optionIndex;

          // Now set the text of the selected option
          element.options[element.selectedIndex].text = option.text;

          console.log(`🔧 Set selectedIndex: ${element.selectedIndex}, text: "${element.options[element.selectedIndex].text}"`);
          $(element).trigger('change');
          console.log(`✅ Successfully selected ${elementId} by EXACT text: "${exactText}" → "${option.text}"`);
          resolve(true);
          return;
        } else {
          console.warn(`❌ No exact match found for "${exactText}" in ${elementId}`);
        }
      }

      attempts++;
      if (attempts < maxRetries) {
        console.log(`🔄 Retry ${attempts}/${maxRetries} for ${elementId} with EXACT text: "${exactText}"`);
        setTimeout(trySelect, 200); // Wait 200ms and try again
      } else {
        console.warn(`⚠️ Failed to select ${elementId} with EXACT text "${exactText}" after ${maxRetries} attempts`);
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
    // ⚠️ CRITICAL: Store budgetId in form for Update button
    const form = document.getElementById('editRowForm');
    if (form && rowData) {
      form.setAttribute('data-budget-id', rowData.budgetId || '');
      // console.log('✅ Stored budgetId in form:', rowData.budgetId);
    }

    // Use sequential approach instead of parallel timeouts
    processEditFormPopulation(rowData);

  } catch (error) {
    console.error('❌ Error in populateEditForm:', error);
    hideOffcanvasLoading('offcanvasEditRow');
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

    // Step 9: Populate non-dropdown fields (after UI is ready)
    await new Promise(resolve => setTimeout(resolve, 200));
    populateNonDropdownFields(rowData);

    // console.log('✅ Edit form populated successfully');
  } catch (error) {
    // console.error('❌ Error in processEditFormPopulation:', error);
    hideOffcanvasLoading('offcanvasEditRow');
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
        id: 'editCobu',
        value: rowData.cobu,
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
          return new Promise(resolve => setTimeout(resolve, 500));
        }
      },
      {
        id: 'editLEnOfMonth',
        value: rowData.leOfMonth,
        populateFirst: true,
        populateFunction: () => {
          updateOffcanvasLEnOfMonth();
          return new Promise(resolve => setTimeout(resolve, 500));
        }
      },
      {
        id: 'editNOfMonth',
        value: rowData.noOfMonth,
        populateFirst: true,
        populateFunction: () => {
          updateOffcanvasNOfMonth();
          return new Promise(resolve => setTimeout(resolve, 500));
        }
      },
      {
        id: 'editFocusHC',
        value: rowData.focusHc,
        populateFirst: true,
        populateFunction: () => {
          updateOffcanvasFocusHC();
          return new Promise(resolve => setTimeout(resolve, 500));
        }
      },
      {
        id: 'editFocusPE',
        value: rowData.focusPe,
        populateFirst: true,
        populateFunction: () => {
          updateOffcanvasFocusPE();
          return new Promise(resolve => setTimeout(resolve, 500));
        }
      },
      {
        id: 'editEmployeeLevel',
        value: rowData.executive,
        useTextMatching: true, // 🔍 Use text matching for this dropdown
        populateFirst: true,
        populateFunction: () => {
          updateOffcanvasExecutives();
          return new Promise(resolve => setTimeout(resolve, 500));
        }
      },
      {
        id: 'editJoinPvf',
        value: rowData.joinPvf,
        populateFirst: true,
        populateFunction: () => {
          updateOffcanvasJoinPvf();
          return new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    ];

    // Process each dropdown sequentially
    for (const dropdown of basicDropdowns) {
      if (dropdown.populateFirst && dropdown.populateFunction) {
        console.log(`🔄 Populating ${dropdown.id}...${dropdown.value}`);
        await dropdown.populateFunction();
      }

      if (dropdown.value || dropdown.value === 0) {
        console.log(`🎯 Auto-selecting ${dropdown.id}: ${dropdown.value}`);
        // Use text matching for dropdowns that return text values
        if (dropdown.useTextMatching) {
          await autoSelectByTextWithRetry(dropdown.id, dropdown.value, true);
        } else {
          await autoSelectWithRetry(dropdown.id, dropdown.value);
        }
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
    // New Headcount (depends on Company, Format, Year)
    // console.log('🔄 Populating New Headcount...');
    updateOffcanvasNewHC();
    await new Promise(resolve => setTimeout(resolve, 400));
    if (rowData.newHcCode) {
      await autoSelectByTextWithRetry('editNewHC', rowData.newHcCode);
    }
    // New Period (depends on Company, Format, Year)
    // console.log('🔄 Populating New Period...');
    updateOffcanvasNewPeriod();
    await new Promise(resolve => setTimeout(resolve, 400));
    if (rowData.newVacPeriod) {
      await autoSelectByTextWithRetry('editNewPeriod', rowData.newVacPeriod);
    }

    // LE Period (depends on Company, Format, Year)
    // console.log('🔄 Populating LE Period...');
    updateOffcanvasNewLEPeriod();
    await new Promise(resolve => setTimeout(resolve, 400));
    if (rowData.newVacLe) {
      await autoSelectByTextWithRetry('editNewLEPeriod', rowData.newVacLe);
    }

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
    if (rowData.division) {
      await autoSelectWithRetry('editDivision', rowData.division);
    }

    // Department (depends on Division)
    if (rowData.division) {
      // console.log('🔄 Populating Department...');
      updateOffcanvasDepartments();
      await new Promise(resolve => setTimeout(resolve, 300));
      if (rowData.department) {
        await autoSelectWithRetry('editDepartment', rowData.department);
      }
    }

    // Section (depends on Department)
    if (rowData.department) {
      // console.log('🔄 Populating Section...');
      updateOffcanvasSections();
      await new Promise(resolve => setTimeout(resolve, 300));
      if (rowData.section) {
        await autoSelectWithRetry('editSection', rowData.section);
      }
    }

    // Location (depends on Section)
    // console.log('🔄 Populating Location...');
    updateOffcanvasLocations();
    await new Promise(resolve => setTimeout(resolve, 300));
    if (rowData.storeName) {
      await autoSelectWithRetry('editCompstore', rowData.storeName);
    }

    // Position
    // console.log('🔄 Populating Position...');
    // 🔒 Temporarily disable Position cascade to prevent reset during population
    $('#editPosition').off('change.offcanvas');

    updateOffcanvasMstPositions();
    await new Promise(resolve => setTimeout(resolve, 300));

    // Store position value for later restoration
    let selectedPositionValue = null;
    let selectedPositionText = null;

    if (rowData.positionCode || rowData.positionName) {
      // Use positionName for BJC (companyId = 1), positionCode for others
      const companyId = document.getElementById('editCompany')?.value;
      if (companyId === '1' || companyId === 1) {
        // 🔍 BJC: Use EXACT text match to avoid selecting "Specialist, Technical Sales Representative" when we want "Sales Representative"
        await autoSelectByExactTextWithRetry('editPosition', `${rowData.positionName} (${rowData.positionCode})`);
      } else {
        // BIGC: Use value match with positionCode
        await autoSelectWithRetry('editPosition', rowData.positionCode);
      }

      // 💾 Save selected position for restoration after other cascades
      const positionElement = document.getElementById('editPosition');
      if (positionElement && positionElement.value) {
        selectedPositionValue = positionElement.value;
        selectedPositionText = positionElement.options[positionElement.selectedIndex]?.text;
        console.log(`💾 Saved Position: value="${selectedPositionValue}", text="${selectedPositionText}"`);
      }
    }

    // Job Band (depends on Position)
    if (rowData.positionCode || rowData.positionName) {
      // console.log('🔄 Populating Job Band...');
      updateOffcanvasMstJobBands();
      await new Promise(resolve => setTimeout(resolve, 300));
      if (rowData.jobBand) {
        // 🔍 Special handling for specific job bands - use text search instead of value
        const textBasedJobBands = ["C", "Advisor", "CEO", "Contract", "Perma-Temp", "UC"];

        if (textBasedJobBands.includes(rowData.jobBand)) {
          console.log(`🔍 Job Band "${rowData.jobBand}" detected - using text search`);
          await autoSelectByExactTextWithRetry('editJobBand', rowData.jobBand);
        } else {
          await autoSelectWithRetry('editJobBand', rowData.jobBand);
        }
      }
    }

    // 🔓 Re-enable Position cascade after Job Band is populated
    $('#editPosition').on('change.offcanvas', function () {
      debouncedUpdateOffcanvasMstJobBands();
    });

    // 🔄 Restore Position if it was reset by other cascades
    if (selectedPositionValue) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const positionElement = document.getElementById('editPosition');
      if (positionElement && positionElement.value !== selectedPositionValue) {
        console.log(`⚠️ Position was changed from "${selectedPositionValue}" to "${positionElement.value}", restoring...`);
        positionElement.value = selectedPositionValue;
        $(positionElement).trigger('change');
        console.log(`✅ Restored Position: "${selectedPositionText}"`);
      }
    }

    // Group Runrate (depends on Plan Cost Center)
    if (rowData.costCenterPlan) {
      // console.log('🔄 Populating Group Runrate...');
      updateOffcanvasGroupRunrate();
      await new Promise(resolve => setTimeout(resolve, 300));
      if (rowData.runrateCode) {
        // 🔍 Use text matching because runrateCode returns text like "Group HR and Admin"
        await autoSelectByTextWithRetry('editRunRateGroup', rowData.runrateCode, true);
      }
    }

    // Salary Structure (depends on Company)
    //console.log('🔄 Populating Salary Structure...');
    updateOffcanvasSalaryStructure();
    await new Promise(resolve => setTimeout(resolve, 300));
    if (rowData.salaryStructure) {
      // console.log('🔍 Use text matching because salaryStructure returns text like High Specialist');
      await autoSelectByTextWithRetry('editSalaryStructure', rowData.salaryStructure, true);
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
    hideOffcanvasLoading('offcanvasEditRow');

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
 * 9. Populate non-dropdown fields (text fields, date fields, etc.)
 * This runs AFTER finalizeEditFormUI() to ensure all DOM elements are ready
 * @param {Object} rowData - Employee data from AG Grid
 */
function populateNonDropdownFields(rowData) {
  console.log('📝 Populating non-dropdown fields (Step 9)');

  try {
    // ===== Join Date Field =====
    if (rowData.joinDate) {
      const joinDateField = document.getElementById('editJoinDate');
      if (joinDateField) {
        const dateValue = rowData.joinDate.split('T')[0];
        joinDateField.value = dateValue;
        console.log('✅ Set joinDate:', dateValue);
      } else {
        console.warn('⚠️ editJoinDate field not found');
      }
    }

    // ===== Reason/Remark Field =====
    if (rowData.reason) {
      console.log('🎯 Setting reason field:', rowData.reason);
      const reasonField = document.getElementById('editRemark');
      console.log('🎯 Found reason field:', reasonField);

      if (reasonField) {
        reasonField.value = rowData.reason;
        console.log('✅ Set reason:', rowData.reason);
      } else {
        console.warn('⚠️ editRemark field not found in DOM');
        console.log('🔍 Checking if element exists later...');

        // Retry after delay if element not found (in case of late DOM creation)
        setTimeout(() => {
          const retryReasonField = document.getElementById('editRemark');
          if (retryReasonField) {
            retryReasonField.value = rowData.reason;
            console.log('✅ Set reason (retry):', rowData.reason);
          } else {
            console.error('❌ editRemark field still not found after retry');
          }
        }, 500);
      }
    }

    console.log('✅ Non-dropdown fields populated');
  } catch (error) {
    console.error('❌ Error in populateNonDropdownFields:', error);
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
    const offcanvasTitle = document.getElementById('offcanvasEditRowLabel');
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
      'editCompany', 'editCobu', 'editYear', 'editEmpStatus', 'editCostCenter',
      'editDivision', 'editDepartment', 'editSection', 'editCompstore',
      'editPosition', 'editJobBand', 'editJoinDate', 'editRemark',
      'editEmpType', 'editNewHC', 'editNewPeriod', 'editNewLEPeriod',
      'editLEnOfMonth', 'editNOfMonth', 'editPlanCostCenter',
      'editSalaryStructure', 'editRunRateGroup', 'editEmployeeLevel',
      'editFocusHC', 'editFocusPE', 'editBgBonusType'
    ];

    editableFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.disabled = false; // ✅ Fixed: Enable fields for editing (was: true)
        field.classList.remove('is-invalid'); // ✅ Fixed: Clear any previous validation errors (was commented)
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
  console.log('💰 Populating LE Benefits data', rowData);

  try {
    // Get company ID to determine which fields to use
    const companyID = document.getElementById('editCompany')?.value;

    let leBenefitsMapping = {};

    if (companyID === '1') {
      // ===== BJC Company (CompanyId = 1) =====
      // BJC core fields + BJC-specific fields (from BENEFITS_BASE_COLUMNS.BJC.le_benefits)
      leBenefitsMapping = {
        // Core Fields (BJC template)
        'editLePayroll': rowData.payrollLe || 0,                  // ✅ BJC Core (calculated field)
        'editLePremium': rowData.premiumLe || 0,                  // ✅ BJC Core
        'editLeSalWithEn': rowData.salWithEnLe || 0,              // ✅ BJC Core: เงินเดือน + EN
        'editLeSalNotEn': rowData.salNotEnLe || 0,                // ✅ BJC Core: เงินเดือนไม่ + EN

        // Allowances
        'editLeBonus': rowData.bonusLe || 0,
        'editLeCarAllowance': rowData.carAllowanceLe || 0,
        'editLeLicenseAllowance': rowData.licenseAllowanceLe || 0,
        'editLeHousingAllowance': rowData.housingAllowanceLe || 0,
        'editLeCarGasoline': rowData.carGasolineLe || 0,
        'editLeOutsourceWages': rowData.outsourceWagesLe || 0,
        'editLeSkillAllowancePc': rowData.skillAllowancePcLe || 0,
        'editLeSalesManagementPc': rowData.salesManagementPcLe || 0,
        'editLeShelfStackingPc': rowData.shelfStackingPcLe || 0,
        'editLeDiligenceAllowancePc': rowData.diligenceAllowancePcLe || 0,
        'editLePostAllowancePc': rowData.postAllowancePcLe || 0,
        'editLePhoneAllowancePc': rowData.phoneAllowancePcLe || 0,
        'editLeTransportationPc': rowData.transportationPcLe || 0,
        'editLeOtherAllowancePc': rowData.otherAllowancePcLe || 0,

        // Car & Fleet
        'editLeCompCarsGas': rowData.compCarsGasLe || 0,
        'editLeCompCarsOther': rowData.compCarsOtherLe || 0,
        'editLeCarRental': rowData.carRentalLe || 0,
        'editLeCarRepair': rowData.carRepairLe || 0,
        'editLeCarMaintenance': rowData.carMaintenanceLe || 0,

        // BJC-Specific Fields
        'editLeTemporaryStaffSal': rowData.temporaryStaffSalLe || 0,
        'editLeSalTemp': rowData.salTempLe || 0,
        'editLeSocialSecurityTmp': rowData.socialSecurityTmpLe || 0,
        'editLeCarMaintenanceTmp': rowData.carMaintenanceTmpLe || 0,
        'editLeSouthriskAllowance': rowData.southriskAllowanceLe || 0,
        'editLeSouthriskAllowanceTmp': rowData.southriskAllowanceTmpLe || 0,
        'editLeSalesCarAllowance': rowData.salesCarAllowanceLe || 0,
        'editLeAccommodation': rowData.accommodationLe || 0,
        'editLeOthersSubjectTax': rowData.othersSubjectTaxLe || 0,

        // Benefits
        'editLeSocialSecurity': rowData.socialSecurityLe || 0,
        'editLeWorkmenCompensation': rowData.workmenCompensationLe || 0,
        'editLeProvidentFund': rowData.providentFundLe || 0,
        'editLeOther': rowData.otherLe || 0,
        'editLeLifeInsurance': rowData.lifeInsuranceLe || 0,
        'editLeMedicalOutside': rowData.medicalOutsideLe || 0,
        'editLeMedicalInHouse': rowData.medicalInhouse || 0,
        'editLeStaffActivities': rowData.staffActivitiesLe || 0,
        'editLeUniform': rowData.uniformLe || 0,
        'editLeMealAllowance': rowData.mealAllowanceLe || 0,

        // Calculations
        'editLePeMth': rowData.peMthLe || 0,
        'editLePeYear': rowData.peYearLe || 0,
        'editLePeSbMth': rowData.peSbMthLe || 0,
        'editLePeSbYear': rowData.peSbYearLe || 0
      };
    } else {
      // ===== BIGC Company (CompanyId = 2) =====
      // BIGC fields (from BENEFITS_BASE_COLUMNS.BIGC.le_benefits)
      leBenefitsMapping = {
        // Core Fields (BIGC template)
        'editLePayroll': rowData.payrollLe || 0,
        'editLeTotalPayroll': rowData.totalPayrollLe || 0,
        'editLePremium': rowData.premiumLe || 0,

        // Allowances
        'editLeBonus': rowData.bonusLe || 0,
        'editLeFleetCardPe': rowData.fleetCardPeLe || 0,
        'editLeCarRentalPe': rowData.carRentalPeLe || 0,
        'editLeCarAllowance': rowData.carAllowanceLe || 0,
        'editLeLicenseAllowance': rowData.licenseAllowanceLe || 0,
        'editLeHousingAllowance': rowData.housingAllowanceLe || 0,
        'editLeGasolineAllowance': rowData.gasolineAllowanceLe || 0,
        'editLeWageStudent': rowData.wageStudentLe || 0,
        'editLeOtherAllowance': rowData.otherAllowanceLe || 0,
        'editLeSkillPayAllowance': rowData.skillPayAllowanceLe || 0,

        // Benefits
        'editLeSocialSecurity': rowData.socialSecurityLe || 0,
        'editLeLaborFundFee': rowData.laborFundFeeLe || 0,
        'editLeOtherStaffBenefit': rowData.otherStaffBenefitLe || 0,
        'editLeProvidentFund': rowData.providentFundLe || 0,
        'editLeEmployeeWelfare': rowData.employeeWelfareLe || 0,
        'editLeProvision': rowData.provisionLe || 0,
        'editLeInterest': rowData.interestLe || 0,
        'editLeStaffInsurance': rowData.staffInsuranceLe || 0,
        'editLeMedicalExpense': rowData.medicalExpenseLe || 0,
        'editLeMedicalInHouse': rowData.medicalInhouse || 0,
        'editLeTraining': rowData.trainingLe || 0,
        'editLeLongService': rowData.longServiceLe || 0,

        // Calculations
        'editLePeSbMth': rowData.peSbMthLe || 0,
        'editLePeSbYear': rowData.peSbYearLe || 0,
        'editLePeMth': rowData.peMthLe || 0,
        'editLePeYear': rowData.peYearLe || 0
      };
    }

    // Populate form fields
    Object.entries(leBenefitsMapping).forEach(([fieldId, value]) => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.value = value || '';
      }
    });

    // console.log(`✅ LE Benefits data populated successfully for Company ${companyID}`);
  } catch (error) {
    console.error('❌ Error in populateLeBenefitsData:', error);
  }
}

/**
 * 5. Populate Budget Year Benefits data from rowData
 * @param {Object} rowData - Employee data containing Budget Year benefits
 */
function populateBgBenefitsData(rowData) {
  console.log('💰 Populating Budget Year Benefits data', rowData);

  try {
    // Get company ID to determine which fields to use
    const companyID = document.getElementById('editCompany')?.value;

    let bgBenefitsMapping = {};

    if (companyID === '1') {
      // ===== BJC Company (CompanyId = 1) =====
      // BJC core fields + BJC-specific fields (from BENEFITS_BASE_COLUMNS.BJC.bg_benefits)
      bgBenefitsMapping = {
        // Core Fields (BJC template)
        'editBgPayroll': rowData.payroll || 0,
        'editBgPremium': rowData.premium || 0,
        'editBgSalWithEn': rowData.salWithEn || 0,
        'editBgSalNotEn': rowData.salNotEn || 0,

        // Allowances
        'editBgBonus': rowData.bonus || 0,
        'editBgCarAllowance': rowData.carAllowance || 0,
        'editBgLicenseAllowance': rowData.licenseAllowance || 0,
        'editBgHousingAllowance': rowData.housingAllowance || 0,
        'editBgCarGasoline': rowData.carGasoline || 0,
        'editBgOutsourceWages': rowData.outsourceWages || 0,
        'editBgSkillAllowancePc': rowData.skillAllowancePc || 0,
        'editBgSalesManagementPc': rowData.salesManagementPc || 0,
        'editBgShelfStackingPc': rowData.shelfStackingPc || 0,
        'editBgDiligenceAllowancePc': rowData.diligenceAllowancePc || 0,
        'editBgPostAllowancePc': rowData.postAllowancePc || 0,
        'editBgPhoneAllowancePc': rowData.phoneAllowancePc || 0,
        'editBgTransportationPc': rowData.transportationPc || 0,
        'editBgOtherAllowancePc': rowData.otherAllowancePc || 0,

        // Car & Fleet
        'editBgCompCarsGas': rowData.compCarsGas || 0,
        'editBgCompCarsOther': rowData.compCarsOther || 0,
        'editBgCarRental': rowData.carRental || 0,
        'editBgCarRepair': rowData.carRepair || 0,
        'editBgCarMaintenance': rowData.carMaintenance || 0,

        // BJC-Specific Fields
        'editBgTemporaryStaffSal': rowData.temporaryStaffSal || 0,
        'editBgSalTemp': rowData.salTemp || 0,
        'editBgSocialSecurityTmp': rowData.socialSecurityTmp || 0,
        'editBgCarMaintenanceTmp': rowData.carMaintenanceTmp || 0,
        'editBgSouthriskAllowance': rowData.southriskAllowance || 0,
        'editBgSouthriskAllowanceTmp': rowData.southriskAllowanceTmp || 0,
        'editBgSalesCarAllowance': rowData.salesCarAllowance || 0,
        'editBgAccommodation': rowData.accommodation || 0,
        'editBgOthersSubjectTax': rowData.othersSubjectTax || 0,

        // Benefits
        'editBgSocialSecurity': rowData.socialSecurity || 0,
        'editBgWorkmenCompensation': rowData.workmenCompensation || 0,
        'editBgProvidentFund': rowData.providentFund || 0,
        'editBgOther': rowData.other || 0,
        'editBgLifeInsurance': rowData.lifeInsurance || 0,
        'editBgMedicalOutside': rowData.medicalOutside || 0,
        'editBgMedicalInHouse': rowData.medicalInhouse || 0,
        'editBgStaffActivities': rowData.staffActivities || 0,
        'editBgUniform': rowData.uniform || 0,
        'editBgMealAllowance': rowData.mealAllowance || 0,

        // Calculations
        'editBgPeMth': rowData.peMth || 0,
        'editBgPeYear': rowData.peYear || 0,
        'editBgPeSbMth': rowData.peSbMth || 0,
        'editBgPeSbYear': rowData.peSbYear || 0
      };
    } else {
      // ===== BIGC Company (CompanyId = 2) =====
      // BIGC fields (from BENEFITS_BASE_COLUMNS.BIGC.bg_benefits)
      bgBenefitsMapping = {
        // Core Fields (BIGC template)
        'editBgPayroll': rowData.payroll || 0,
        'editBgTotalPayroll': rowData.totalPayroll || 0,
        'editBgPremium': rowData.premium || 0,

        // Allowances
        'editBgBonus': rowData.bonus || 0,
        'editBgFleetCardPe': rowData.fleetCardPe || 0,
        'editBgCarRentalPe': rowData.carRentalPe || 0,
        'editBgCarAllowance': rowData.carAllowance || 0,
        'editBgLicenseAllowance': rowData.licenseAllowance || 0,
        'editBgHousingAllowance': rowData.housingAllowance || 0,
        'editBgGasolineAllowance': rowData.gasolineAllowance || 0,
        'editBgWageStudent': rowData.wageStudent || 0,
        'editBgOtherAllowance': rowData.otherAllowance || 0,
        'editBgSkillPayAllowance': rowData.skillPayAllowance || 0,

        // Benefits
        'editBgSocialSecurity': rowData.socialSecurity || 0,
        'editBgLaborFundFee': rowData.laborFundFee || 0,
        'editBgOtherStaffBenefit': rowData.otherStaffBenefit || 0,
        'editBgProvidentFund': rowData.providentFund || 0,
        'editBgEmployeeWelfare': rowData.employeeWelfare || 0,
        'editBgProvision': rowData.provision || 0,
        'editBgInterest': rowData.interest || 0,
        'editBgStaffInsurance': rowData.staffInsurance || 0,
        'editBgMedicalExpense': rowData.medicalExpense || 0,
        'editBgMedicalInHouse': rowData.medicalInhouse || 0,
        'editBgTraining': rowData.training || 0,
        'editBgLongService': rowData.longService || 0,

        // Calculations
        'editBgPeSbMth': rowData.peSbMth || 0,
        'editBgPeSbYear': rowData.peSbYear || 0,
        'editBgPeMth': rowData.peMth || 0,
        'editBgPeYear': rowData.peYear || 0
      };
    }

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
      { id: 'editCobu', name: 'Cobu' },
      { id: 'editYear', name: 'Budget Year' },
      { id: 'editEmpStatus', name: 'Employee Status' },
      { id: 'editCostCenter', name: 'Cost Center' },
      { id: 'editDivision', name: 'Division' },
      { id: 'editCompstore', name: 'Location (store name)' },
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

        // ✅ Special case: Allow "0" as valid value for numeric month fields
        const isZeroValid = (field.id === 'editLEnOfMonth' || field.id === 'editNOfMonth') && value === '0';

        if (!value && !isZeroValid) {
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
      const offcanvasBody = document.querySelector('#offcanvasEditRow .offcanvas-body');
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
        //{ id: 'editLePremium', value: rowData.payrollBg, name: 'Premium (LE)' },
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
    // Get Thai name components (✅ Fixed: Use PascalCase to match C# DTO)
    const titleTh = rowData.TitleTh || '';
    const fnameTh = rowData.FnameTh || '';
    const lnameTh = rowData.LnameTh || '';

    // Get English name components (✅ Fixed: Use PascalCase to match C# DTO)
    const titleEn = rowData.TitleEn || '';
    const fnameEn = rowData.FnameEn || '';
    const lnameEn = rowData.LnameEn || '';

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
 * 9. Setup cascading dropdown relationships for edit mode
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
    $('#editCompany').on('change.editMode', function () {
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
  const offcanvasBody = document.querySelector('#offcanvasEditRow .offcanvas-body');
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
  const alerts = document.querySelectorAll('#offcanvasEditRow .validation-alert');
  alerts.forEach(alert => alert.remove());

  // Remove invalid styling from all form fields
  const invalidFields = document.querySelectorAll('#offcanvasEditRow .is-invalid');
  invalidFields.forEach(field => field.classList.remove('is-invalid'));

  // Remove warning styling from benefits fields
  const warningFields = document.querySelectorAll('#offcanvasEditRow .border-warning, #offcanvasEditRow .missing-data-warning');
  warningFields.forEach(field => {
    field.classList.remove('border-warning', 'missing-data-warning');
  });

  // Remove warning icons
  const warningIcons = document.querySelectorAll('#offcanvasEditRow .warning-icon');
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

// Export new synchronization functions
window.syncOffcanvasPosition = syncOffcanvasPosition;
window.safeCloseOffcanvasWithSync = safeCloseOffcanvasWithSync;
// Export Modal Control Functions
window.preventSaveModalHide = preventSaveModalHide;
window.preventUpdateModalHide = preventUpdateModalHide;
window.safeCloseSaveModal = safeCloseSaveModal;
window.safeCloseUpdateModal = safeCloseUpdateModal;
// Export functions to global scope for use by other modules
// window.populateOffcanvasDropdowns = populateOffcanvasDropdowns; // REMOVED: Functionality consolidated into enhanced populateDropdown()
window.setupOffcanvasDropdownRelationships = setupOffcanvasDropdownRelationships;
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 UPDATE BUTTON - Data Collection Functions (SA APPROVED)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Based on Save All button pattern (budget.plan.events.js)
// SA Requirements:
// - Collect all form data including CompanyId (CRITICAL for routing)
// - Validate 3 fields: CompanyId, BudgetId, BudgetYear
// - Include LE and BG benefits data
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * ✅ Phase 1: Detect Changed Fields (Partial Update Pattern)
 * Compare original data with current form data and return only changed fields
 *
 * @param {Object} originalData - Original row data from grid (stored in data-original)
 * @param {Object} currentData - Current form data collected from form
 * @returns {Object} - Object containing only changed fields + critical fields
 */
function detectChangedFields(originalData, currentData) {
  try {
    console.log('🔍 Starting Change Detection...');
    console.log('   Original Data Fields:', Object.keys(originalData).length);
    console.log('   Current Data Fields:', Object.keys(currentData).length);

    const changedFields = {};
    const changes = []; // For logging

    // ===== Always Include Critical Fields (Required for Backend) =====
    const criticalFields = ['companyId', 'budgetId', 'budgetYear', 'empCode', 'costCenterCode', 'updatedBy', 'updatedDate'];
    criticalFields.forEach(field => {
      if (currentData[field] !== undefined) {
        changedFields[field] = currentData[field];
      }
    });

    // ===== Compare Each Field =====
    Object.keys(currentData).forEach(key => {
      // Skip critical fields (already added)
      if (criticalFields.includes(key)) {
        return;
      }

      const newValue = currentData[key];
      const oldValue = originalData[key];

      // Check if changed (handle null/undefined/empty string cases)
      const isChanged = !valuesAreEqual(oldValue, newValue);

      if (isChanged) {
        changedFields[key] = newValue;
        changes.push({
          field: key,
          old: oldValue,
          new: newValue
        });
      }
    });

    // ===== Log Results =====
    console.log('📊 Change Detection Results:');
    console.log(`   Total Fields in Form: ${Object.keys(currentData).length}`);
    console.log(`   Changed Fields: ${changes.length}`);
    console.log(`   Critical Fields: ${criticalFields.length}`);
    console.log(`   Total Payload: ${Object.keys(changedFields).length} fields`);

    if (changes.length > 0) {
      console.log('🔄 Changed Fields Detail:');
      changes.forEach(change => {
        console.log(`   • ${change.field}: ${formatValue(change.old)} → ${formatValue(change.new)}`);
      });
    } else {
      console.log('✅ No fields changed (only critical fields will be sent)');
    }

    // Calculate size reduction
    const originalSize = Object.keys(currentData).length;
    const reducedSize = Object.keys(changedFields).length;
    const reduction = ((1 - reducedSize / originalSize) * 100).toFixed(1);
    console.log(`💾 Payload Reduction: ${originalSize} → ${reducedSize} fields (${reduction}% smaller)`);

    return changedFields;

  } catch (error) {
    console.error('❌ Error in detectChangedFields:', error);
    console.warn('⚠️ Fallback: Returning full data (no change detection)');
    return currentData; // Fallback to full update
  }
}

/**
 * Helper: Compare two values considering null/undefined/empty string as equivalent
 * @param {*} oldValue - Original value
 * @param {*} newValue - New value
 * @returns {boolean} - true if values are equal, false if different
 */
function valuesAreEqual(oldValue, newValue) {
  // Handle null/undefined/empty string as equivalent
  const oldIsEmpty = oldValue === null || oldValue === undefined || oldValue === '';
  const newIsEmpty = newValue === null || newValue === undefined || newValue === '';

  if (oldIsEmpty && newIsEmpty) {
    return true; // Both empty = equal
  }

  // Handle numeric comparison (convert to number for comparison)
  if (typeof oldValue === 'number' || typeof newValue === 'number') {
    const oldNum = parseFloat(oldValue);
    const newNum = parseFloat(newValue);

    // Handle NaN cases
    if (isNaN(oldNum) && isNaN(newNum)) {
      return true;
    }

    // Compare numbers with small tolerance for floating point
    if (!isNaN(oldNum) && !isNaN(newNum)) {
      return Math.abs(oldNum - newNum) < 0.000001;
    }
  }

  // Handle date comparison
  if (oldValue instanceof Date || newValue instanceof Date) {
    const oldTime = oldValue instanceof Date ? oldValue.getTime() : new Date(oldValue).getTime();
    const newTime = newValue instanceof Date ? newValue.getTime() : new Date(newValue).getTime();
    return oldTime === newTime;
  }

  // Standard comparison
  return oldValue === newValue;
}

/**
 * Helper: Format value for console display
 * @param {*} value - Value to format
 * @returns {string} - Formatted string
 */
function formatValue(value) {
  if (value === null || value === undefined) return 'null';
  if (value === '') return '""';
  if (typeof value === 'number') return value.toFixed(2);
  if (typeof value === 'string' && value.length > 50) return value.substring(0, 47) + '...';
  return String(value);
}

/**
 * Collect all form data for update operation
 * ✅ FIXED: Match Save All button pattern (collectRowData)
 * - Use PascalCase field names (CompanyId, BudgetId, etc.)
 * - Flatten benefits structure (no nested leBenefits/bgBenefits)
 * - Use company-specific field mapping (BJC_FIELD_MAPPING / BIGC_FIELD_MAPPING)
 * @returns {Object|null} - Form data object or null if validation fails
 */
function collectUpdateFormData() {
  try {
    const form = document.getElementById('editRowForm');
    if (!form) {
      console.error('❌ Edit form not found');
      return null;
    }

    // ===== SA Requirement #2: Validate 3 Critical Fields =====

    // 1. CompanyId validation (CRITICAL for table routing)
    const companyId = parseInt(document.getElementById('editCompany')?.value);
    if (!companyId || (companyId !== 1 && companyId !== 2)) {
      showWarningModal('รหัสบริษัทไม่ถูกต้อง (ต้องเป็น 1=BJC หรือ 2=BIGC)');
      console.error('❌ Invalid CompanyId:', companyId);
      return null;
    }

    // 2. BudgetId validation (CRITICAL for finding record to update)
    let budgetId = parseInt(form.getAttribute('data-budget-id'));

    // Fallback: If budgetId not in form, try to get from grid's selected row
    if (!budgetId || isNaN(budgetId)) {
      console.warn('⚠️ BudgetId not found in form, trying to get from grid...');

      const rowIndex = form.getAttribute('data-edit-index');
      if (rowIndex !== null && window.gridApi) {
        const rowNode = window.gridApi.getDisplayedRowAtIndex(parseInt(rowIndex));
        if (rowNode && rowNode.data) {
          budgetId = parseInt(rowNode.data.budgetId);
          console.log('✅ Retrieved budgetId from grid:', budgetId);
        }
      }
    }

    if (!budgetId || budgetId <= 0 || isNaN(budgetId)) {
      showWarningModal('ไม่พบ BudgetId');
      console.error('❌ Invalid BudgetId:', budgetId);
      return null;
    }

    // 3. BudgetYear validation (Business rule)
    const budgetYear = parseInt(document.getElementById('editYear')?.value);
    if (!budgetYear || budgetYear <= 0) {
      showWarningModal('BudgetYear ไม่ถูกต้อง');
      console.error('❌ Invalid BudgetYear:', budgetYear);
      return null;
    }

    console.log('✅ 3-Field Validation Passed:', { companyId, budgetId, budgetYear });

    // ===== Get Original Data for Fallback =====
    let originalData = {};
    const originalDataStr = form.getAttribute('data-original');
    if (originalDataStr) {
      try {
        originalData = JSON.parse(originalDataStr);
        console.log('📋 Loaded Original Data for fallback (Read-only fields)');
      } catch (error) {
        console.warn('⚠️ Failed to parse original data:', error);
      }
    }

    // ===== Load Company-Specific Field Mapping =====
    let benefitsMapping = {};
    if (companyId === 1) {
      benefitsMapping = window.BJC_FIELD_MAPPING || {};
      console.log('📋 Loaded BJC_FIELD_MAPPING (147 fields)');
    } else if (companyId === 2) {
      benefitsMapping = window.BIGC_FIELD_MAPPING || {};
      console.log('📋 Loaded BIGC_FIELD_MAPPING (120 fields)');
    }

    // ===== Collect Form Data with camelCase =====
    // ✅ CRITICAL: Backend uses JsonNamingPolicy.CamelCase, so we MUST send camelCase
    const formData = {};

    // ✅ Critical fields (camelCase to match backend JsonNamingPolicy)
    formData.companyId = companyId;
    formData.budgetId = budgetId;
    formData.budgetYear = budgetYear;

    // ✅ Basic fields (camelCase)
    formData.cobu = document.getElementById('editCobu')?.value || null;
    formData.joinDate = document.getElementById('editJoinDate')?.value || null;
    formData.empStatus = document.getElementById('editEmpStatus')?.value || null;
    formData.empTypeCode = document.getElementById('editEmpType')?.value || null;

    // ⚠️ CRITICAL: empCode is Read-Only (no UI element) - Always use original value
    // empCode is displayed in offcanvas title only (e.g., "Edit Row - ID: 453208")
    // No editEmpCode input field exists, so always preserve from originalData
    formData.empCode = originalData.empCode || null;
    console.log('📋 empCode: Using original value (No UI element):', originalData.empCode);

    // ✅ Organization fields (camelCase)
    // ⚠️ CRITICAL: costCenterCode - Preserve original if dropdown is empty
    const costCenterElement = document.getElementById('editCostCenter');
    const costCenterValue = costCenterElement?.value?.trim();
    formData.costCenterCode = costCenterValue || originalData.costCenterCode || null;
    if (!costCenterValue && originalData.costCenterCode) {
      console.log('📋 costCenterCode: Using original value (dropdown empty):', originalData.costCenterCode);
    }

    // ✅ FIXED: costCenterName - Extract only name part before " ("
    // Example: "HRHO (61990)" → "HRHO"
    const costCenterNameFull = document.getElementById('editCostCenter')?.selectedOptions?.[0]?.text || '';
    const costCenterNameOnly = costCenterNameFull.split(' (')[0]?.trim() || costCenterNameFull || null;
    formData.costCenterName = costCenterNameOnly;
    if (costCenterNameFull && costCenterNameFull !== costCenterNameOnly) {
      console.log('📋 Cost Center Name (extracted):', costCenterNameOnly, '(from:', costCenterNameFull, ')');
    }
    formData.division = document.getElementById('editDivision')?.value || null;
    formData.department = document.getElementById('editDepartment')?.value || null;
    formData.section = document.getElementById('editSection')?.value || null;
    formData.storeName = document.getElementById('editCompstore')?.value || null;

    // ✅ Position fields (camelCase)
    formData.positionCode = document.getElementById('editPosition')?.value || null;

    // ✅ FIXED: positionName - Extract only name part before " ("
    // Example: "Senior Professional (5701)" → "Senior Professional"
    const positionNameFull = document.getElementById('editPosition')?.selectedOptions?.[0]?.text || '';
    const positionNameOnly = positionNameFull.split(' (')[0]?.trim() || positionNameFull || null;
    formData.positionName = positionNameOnly;
    if (positionNameFull && positionNameFull !== positionNameOnly) {
      console.log('📋 Position Name (extracted):', positionNameOnly, '(from:', positionNameFull, ')');
    }

    formData.jobBand = document.getElementById('editJobBand')?.value || null;

    // ✅ Planning fields (camelCase)
    formData.newHcCode = document.getElementById('editNewHC')?.value || null;
    formData.newVacPeriod = document.getElementById('editNewPeriod')?.value || null;
    formData.noOfMonth = parseInt(document.getElementById('editNOfMonth')?.value) || 0;
    formData.newVacLe = document.getElementById('editNewLEPeriod')?.value || null;
    formData.leOfMonth = parseInt(document.getElementById('editLEnOfMonth')?.value) || 0;

    // ✅ Other fields (camelCase)
    formData.joinPvf = document.getElementById('editJoinPVF')?.value || null;
    formData.costCenterPlan = document.getElementById('editPlanCostCenter')?.value || null;
    formData.executive = document.getElementById('editEmployeeLevel')?.value || null;
    formData.focusHc = document.getElementById('editFocusHC')?.value || null;
    formData.focusPe = document.getElementById('editFocusPE')?.value || null;

    // ✅ FIXED: editEmployeeLevel uses text-based dropdown, get selected text instead of value
    const salaryStructureElement = document.getElementById('editSalaryStructure');
    if (salaryStructureElement) {
      const fullText = salaryStructureElement?.selectedOptions?.[0]?.text || salaryStructureElement?.value || null;
      const salaryStructureOnly = fullText.split('-[')[0]?.trim() || fullText || null;
      formData.salaryStructure = salaryStructureOnly;
      console.log('📋 Salary Structure (extracted):', salaryStructureOnly, '(from:', fullText, ')');
    } else {
      formData.salaryStructure = null;
    }
    // ✅ FIXED: editRunRateGroup - Extract only the name part before "-["
    // Example: "Group HR and Admin-[HRD] (90.7%)" → "Group HR and Admin"
    const runrateCodeElement = document.getElementById('editRunRateGroup');
    if (runrateCodeElement) {
      const fullText = runrateCodeElement.selectedOptions?.[0]?.text || runrateCodeElement.value || '';
      // Split by "-[" and take the first part (the name)
      const runrateCodeOnly = fullText.split('-[')[0]?.trim() || fullText || null;
      formData.runrateCode = runrateCodeOnly;
      console.log('📋 RunRate Code (extracted):', runrateCodeOnly, '(from:', fullText, ')');
    } else {
      formData.runrateCode = null;
    }

    formData.discount = document.getElementById('editRunRateGroup')?.value || null;

    formData.reason = document.getElementById('editRemark')?.value || null; // ✅ FIXED: Match DTO property name


    // ===== Validation: Payroll LE (Required) =====
    const payrollLeElement = document.getElementById('editLePayroll');
    const payrollLeValue = payrollLeElement?.value?.trim();

    if (!payrollLeValue || parseFloat(payrollLeValue) <= 0) {
      showWarningModal('Payroll LE ต้องไม่ว่างและต้องมากกว่า 0');
      console.error('❌ Validation Failed: Payroll LE is required and must be > 0');

      // Highlight the field
      if (payrollLeElement) {
        payrollLeElement.classList.add('is-invalid');
        payrollLeElement.focus();
      }

      return null;
    }

    // ===== Handle BonusType Dropdown Fields (Company-Specific) =====
    // BonusType dropdowns use TEXT values (not numeric), so handle separately
    if (companyId === 1) {
      // BJC: Has 2 BonusType fields (LE + BG) - BOTH REQUIRED
      const leBonusTypeEl = document.getElementById('editLeBonusType');
      if (leBonusTypeEl) {
        const leBonusTypeValue = leBonusTypeEl.selectedOptions?.[0]?.text || leBonusTypeEl.value || '';

        // Validation: BJC LE BonusType is required
        if (!leBonusTypeValue || leBonusTypeValue.trim() === '' || leBonusTypeValue === 'เลือก Bonus Type LE') {
          showWarningModal('กรุณาเลือก Bonus Type LE (BJC)');
          console.error('❌ Validation Failed: BJC LE BonusType is required');
          leBonusTypeEl.classList.add('is-invalid');
          leBonusTypeEl.focus();
          return null;
        }

        formData.bonusTypeLe = leBonusTypeValue.trim();
        console.log('📋 BJC LE BonusType:', formData.bonusTypeLe);
      }

      const bgBonusTypeEl = document.getElementById('editBgBonusType');
      if (bgBonusTypeEl) {
        const bgBonusTypeValue = bgBonusTypeEl.selectedOptions?.[0]?.text || bgBonusTypeEl.value || '';

        // Validation: BJC BG BonusType is required
        if (!bgBonusTypeValue || bgBonusTypeValue.trim() === '' || bgBonusTypeValue === 'เลือก Bonus Type') {
          showWarningModal('กรุณาเลือก Bonus Type (BJC)');
          console.error('❌ Validation Failed: BJC BG BonusType is required');
          bgBonusTypeEl.classList.add('is-invalid');
          bgBonusTypeEl.focus();
          return null;
        }

        formData.bonusType = bgBonusTypeValue.trim();
        console.log('📋 BJC BG BonusType:', formData.bonusType);
      }

    } else if (companyId === 2) {
      // BIGC: Has only BG BonusTypes (plural) - LE has no BonusType - REQUIRED
      const bgBonusTypesEl = document.getElementById('editBgBonusTypes');
      if (bgBonusTypesEl) {
        const bgBonusTypesValue = bgBonusTypesEl.selectedOptions?.[0]?.text || bgBonusTypesEl.value || '';

        // Validation: BIGC BG BonusTypes is required
        if (!bgBonusTypesValue || bgBonusTypesValue.trim() === '' || bgBonusTypesValue === 'เลือก Bonus Types') {
          showWarningModal('กรุณาเลือก Bonus Types (BIGC)');
          console.error('❌ Validation Failed: BIGC BG BonusTypes is required');
          bgBonusTypesEl.classList.add('is-invalid');
          bgBonusTypesEl.focus();
          return null;
        }

        formData.bonusTypes = bgBonusTypesValue.trim();
        console.log('📋 BIGC BG BonusTypes:', formData.bonusTypes);
      }
    }

    // ✅ FIXED: Flatten benefits using company-specific mapping (camelCase)
    // Process each benefit field through mapping (mapping already produces camelCase like 'payrollLe')
    Object.keys(benefitsMapping).forEach(fieldId => {
      // ⚠️ Skip BonusType fields (already handled above)
      if (fieldId.includes('BonusType')) {
        return;
      }

      const element = document.getElementById(fieldId);
      if (element) {
        const backendField = benefitsMapping[fieldId]; // e.g., 'payrollLe' (already camelCase!)
        const value = element.value ? element.value.trim() : '';

        // ✅ Use mapping result directly (already camelCase: 'payrollLe', 'bonus', etc.)
        if (value) {
          formData[backendField] = parseFloat(value) || null;
        } else {
          formData[backendField] = null;
        }
      }
    });

    // ✅ Auto-populate UpdatedBy and UpdatedDate (camelCase)
    formData.updatedBy = 'DevUser'; // TODO: Replace with actual user from session
    formData.updatedDate = new Date().toISOString();

    console.log('📦 Collected Full Form Data (All Fields):', formData);

    // ===== Phase 1: Partial Update - Detect Changed Fields =====
    // Get original data from form attribute (set when Edit button clicked)
    // Note: originalData already loaded earlier for fallback

    if (originalDataStr) {
      try {
        // originalData already parsed earlier, just use it for change detection
        // Detect and return only changed fields + critical fields
        const changedData = detectChangedFields(originalData, formData);

        console.log('✅ Partial Update Mode: Sending only changed fields');
        return changedData;

      } catch (parseError) {
        console.warn('⚠️ Failed to parse original data:', parseError);
        console.warn('⚠️ Fallback: Sending full form data');
        return formData; // Fallback to full update
      }
    } else {
      console.warn('⚠️ No original data found (data-original attribute missing)');
      console.warn('⚠️ Fallback: Sending full form data');
      return formData; // Fallback to full update
    }


  } catch (error) {
    console.error('❌ Error collecting form data:', error);
    showErrorModal('เกิดข้อผิดพลาดในการรวบรวมข้อมูล: ' + error.message);
    return null;
  }
}


/**
 * DEPRECATED: collectLeBenefitsData() - No longer needed
 * Benefits are now flattened in collectUpdateFormData() using company-specific mapping
 * Kept for backwards compatibility only
 */
function collectLeBenefitsData() {
  console.warn('⚠️ collectLeBenefitsData() is deprecated. Benefits are now flattened in collectUpdateFormData().');
  return {}; // Return empty object
}

/**
 * DEPRECATED: collectBgBenefitsData() - No longer needed
 * Benefits are now flattened in collectUpdateFormData() using company-specific mapping
 * Kept for backwards compatibility only
 */
function collectBgBenefitsData() {
  console.warn('⚠️ collectBgBenefitsData() is deprecated. Benefits are now flattened in collectUpdateFormData().');
  return {}; // Return empty object
}


/**
 * Update budget data via API
 * Calls PUT /api/Budget/UpdateBudget with collected form data
 * ✅ FIXED: Send camelCase structure to match backend JsonNamingPolicy.CamelCase
 * @param {Object} formData - Collected form data from collectUpdateFormData()
 * @returns {Promise<Object>} - API response
 */
async function updateBudgetData(formData) {
  try {
    console.log('🌐 Calling UpdateBudget API...');
    console.log('   Request Data:', formData);

    const response = await fetch('/api/Budget/UpdateBudget', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        companyId: formData.companyId,  // ✅ camelCase to match backend
        budget: formData                 // ✅ camelCase to match backend
      })
    });

    console.log('   Response Status:', response.status);

    const data = await response.json();
    console.log('   Response Data:', data);

    if (response.ok && data.success) {
      console.log('✅ Update successful');
      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } else {
      console.error('❌ Update failed:', data.message || data.errorMessage);
      return {
        success: false,
        error: data.message || data.errorMessage || 'Update failed'
      };
    }

  } catch (error) {
    console.error('💥 Exception calling UpdateBudget API:', error);
    return {
      success: false,
      error: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้: ' + error.message
    };
  }
}

// ====================================================================================================
// 🧮 CAL BUTTON FUNCTION: Calculate Budget Estimate for Offcanvas Edit Form
// ====================================================================================================

/**
 * Calculate Budget Estimate for BJC (92 fields) or BIGC (57 fields) - Offcanvas Edit Form
 * - BJC: fn_BudgetEstimate_BJC with 19 parameters → 92 fields (44 LE + 44 BG + 4 summary)
 * - BIGC: fn_BudgetEstimate with 12 parameters → 57 fields (26 LE + 25 BG + 6 summary)
 * Smart Populate: Only fills empty/zero fields (won't overwrite user input)
 */
async function calculateOffcanvasBudgetEstimate() {
  console.log('🧮 [Cal Button] Starting calculation for Offcanvas Edit Form...');

  try {
    // ===== STEP 0: Detect Company (BJC or BIGC) =====
    const companyId = parseInt($('#editCompany').val());
    const isBJC = (companyId === 1);
    console.log(`🏢 Company Detected: ${isBJC ? 'BJC (CompanyId=1)' : 'BIGC (CompanyId=2)'}`);

    // ===== STEP 1: Get BASE parameters (12 - BIGC compatible) =====
    const year = parseInt(document.getElementById('editYear')?.value) || 0;
    const yearLe = parseInt(document.getElementById('editYearLE')?.value) || 0;
    const salary = parseFloat(document.getElementById('editLePayroll')?.value) || 0;
    const premiumAmt = parseFloat(document.getElementById('editLePremium')?.value) || 0;
    const jobBand = document.getElementById('editJobBand')?.value || '';
    const leOfMonth = parseInt(document.getElementById('editLEnOfMonth')?.value) || 0;
    const noOfMonth = parseInt(document.getElementById('editNOfMonth')?.value) || 0;
    const bonusType = document.getElementById('editBgBonusType')?.selectedOptions?.[0]?.text ||
                      document.getElementById('editBgBonusTypes')?.selectedOptions?.[0]?.text || '';
    const companyName = $('#editCompany option:selected').text() || '';
    const costCenter = document.getElementById('editCostCenter')?.value || '';
    const allocateJson = document.getElementById('editAllocate')?.value || null;

    // ===== STEP 1b: Get BJC-SPECIFIC parameters (8 additional) =====
    let empType = '';
    let bonusTypeLe = '';
    let positionName = '';
    let yosLe = null;
    let yos = null;
    let deptName = '';
    let cobu = '';

    if (isBJC) {
      // Get BJC-specific fields from UI
      const empTypeField = document.getElementById('editEmpType');
      const bonusTypeLeField = document.getElementById('editLeBonusType');
      const positionField = document.getElementById('editPosition');
      const departmentField = document.getElementById('editDepartment');
      const cobuField = document.getElementById('editCobu');

      empType = empTypeField?.value || '';
      bonusTypeLe = bonusTypeLeField?.selectedOptions?.[0]?.text || bonusTypeLeField?.value || '';
      positionName = positionField?.selectedOptions?.[0]?.text || positionField?.value || '';
      deptName = departmentField?.selectedOptions?.[0]?.text || departmentField?.value || '';
      cobu = cobuField?.value || '';

      // YOS (Years of Service) - Get from original grid data
      // originalData contains: yosCurrYear (LE year) and yosNextYear (Budget year)
      const form = document.getElementById('editRowForm');
      const originalDataStr = form?.getAttribute('data-original');
      let originalData = {};
      if (originalDataStr) {
        try {
          originalData = JSON.parse(originalDataStr);
        } catch (error) {
          console.warn('⚠️ Failed to parse original data for YOS:', error);
        }
      }

      // Map grid fields to Cal Button parameters
      yosLe = originalData.yosCurrYear || null;  // YOS LE year (from grid's yosCurrYear)
      yos = originalData.yosNextYear || null;    // YOS Budget year (from grid's yosNextYear)
      console.log(`📋 YOS LE: ${yosLe}, YOS Budget: ${yos}`);
      console.log(`📊 BJC-Specific Parameters:`);
      console.log(`   Emp Type: ${empType}`);
      console.log(`   Bonus Type LE: ${bonusTypeLe}`);
      console.log(`   Position Name: ${positionName}`);
      console.log(`   YOS LE (from grid): ${yosLe}`);
      console.log(`   YOS Budget (from grid): ${yos}`);
      console.log(`   Dept Name: ${deptName}`);
      console.log(`   BU: null (fixed)`);
      console.log(`   COBU: ${cobu}`);
    }

    // ===== STEP 2: Console log BASE parameters =====
    console.log(`📋 Base Parameters (All Companies):`);
    console.log(`Year: ${year}`);
    console.log(`Year LE: ${yearLe}`);
    console.log(`Salary: ${salary}`);
    console.log(`Premium Amount: ${premiumAmt}`);
    console.log(`Job Band: ${jobBand}`);
    console.log(`LE of Month: ${leOfMonth}`);
    console.log(`No of Month: ${noOfMonth}`);
    console.log(`Bonus Type: ${bonusType}`);
    console.log(`Company Name: ${companyName}`);
    console.log(`Cost Center: ${costCenter}`);

    console.log(`Cost Center: ${costCenter}`);

    // ===== STEP 3: Validation =====
    if (salary <= 0) {
      showWarningModal('⚠️ กรุณากรอก Payroll LE ก่อนคำนวณ');
      console.warn('⚠️ [Cal Button] Validation failed: Salary is 0 or empty');
      return;
    }

    if (bonusType === 'Select Bonus Types' || bonusType === 'Select Bonus Type') {
      showWarningModal('⚠️ กรุณาเลือก Bonus Type ก่อนคำนวณ');
      console.warn('⚠️ [Cal Button] Validation failed: Bonus Type not selected');
      return;
    }

    if (!jobBand) {
      showWarningModal('💡 แนะนำ: ควรกรอก Job Band เพื่อความแม่นยำในการคำนวณ');
    }

    // ===== STEP 4: Show loading state =====
    const calButton = document.getElementById('calcLePayrollBtn');
    const originalText = calButton?.innerHTML || 'Cal';
    if (calButton) {
      calButton.disabled = true;
      calButton.innerHTML = '<i class="fa fa-spinner fa-spin"></i> คำนวณ...';
    }

    // ===== STEP 5: Build request object (Conditional for BJC/BIGC) =====
    const requestData = {
      // Base 12 parameters (BIGC compatible)
      year: year,
      yearLe: yearLe,
      salary: salary,
      premiumAmt: premiumAmt,
      jobBand: jobBand,
      companyId: companyId, // Use detected companyId
      leOfMonth: leOfMonth,
      noOfMonth: noOfMonth,
      bonusType: bonusType,
      companyName: companyName,
      costCenter: costCenter,
      allocateJson: allocateJson,

      // ✅ Conditional: Add 8 BJC-specific parameters if BJC company
      ...(isBJC ? {
        empType: empType,
        bonusTypeLe: bonusTypeLe,
        positionName: positionName,
        yosLe: yosLe,
        yos: yos,
        deptName: deptName,
        bu: null, // Fixed to NULL (per backend requirement)
        cobu: cobu
      } : {})
    };

    console.log(`📤 Request Data (${isBJC ? 'BJC - 19 params' : 'BIGC - 12 params'}):`, requestData);

    // ===== STEP 6: Select API endpoint based on company =====
    const apiEndpoint = isBJC ? BUDGET_API.calBJCbenefits : BUDGET_API.calBIGCbenefits;
    const companyType = isBJC ? 'BJC' : 'BIGC';
    console.log(`� API Endpoint: ${apiEndpoint}`);

    // ===== STEP 7: Call API =====
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ [Cal Button] API Response:', result);

    if (!result.success || !result.data || result.data.length === 0) {
      showErrorModal(`การคำนวณล้มเหลว: ${result.message || 'No data returned'}`);
      console.error('❌ [Cal Button] Calculation failed:', result.message);
      return;
    }

    // ===== STEP 8: Smart Populate Fields
    // - BJC: 92 fields (44 LE + 44 BG + 4 summary)
    // - BIGC: 57 fields (26 LE + 25 BG + 6 summary)
    // =====
    const data = result.data[0]; // First row from function result

    console.log('📝 [Cal Button] Starting smart populate (only empty/zero fields)...');

    // Helper function: Smart populate (skip if field has value > 0)
    const smartPopulate = function (fieldId, newValue) {
      const field = document.getElementById(fieldId);
      if (!field) {
        console.warn(`⚠️ Field not found: ${fieldId}`);
        return;
      }

      const currentValue = parseFloat(field.value) || 0;
      if (currentValue > 0) {
        console.log(`⏭️ Skip ${fieldId}: keeping existing value ${currentValue}`);
        return;
      }

      if (newValue !== null && newValue !== undefined) {
        field.value = newValue;
        console.log(`✅ Populated ${fieldId}: ${newValue}`);
      }
    };

    if (companyId === 1) {
      // ═══════════════════════════════════════════════════════════════
      // 🏢 BJC COMPANY (CompanyId = 1) - 92 FIELDS
      // ═══════════════════════════════════════════════════════════════

      console.log('📝 Populating BJC LE Fields (44 fields)...');

      // Core Fields (4 fields)
      smartPopulate('editLePayroll', data.payrollLe);
      smartPopulate('editLePremium', data.premiumLe);
      smartPopulate('editLeSalWithEn', data.salWithEnLe);
      smartPopulate('editLeSalNotEn', data.salNotEnLe);

      // Allowances (14 fields)
      smartPopulate('editLeBonus', data.bonusLe);
      smartPopulate('editLeCarAllowance', data.carAllowanceLe);
      smartPopulate('editLeLicenseAllowance', data.licenseAllowanceLe);
      smartPopulate('editLeHousingAllowance', data.housingAllowanceLe);
      smartPopulate('editLeCarGasoline', data.carGasolineLe);
      smartPopulate('editLeOutsourceWages', data.outsourceWagesLe);
      smartPopulate('editLeSkillAllowancePc', data.skillAllowancePcLe);
      smartPopulate('editLeSalesManagementPc', data.salesManagementPcLe);
      smartPopulate('editLeShelfStackingPc', data.shelfStackingPcLe);
      smartPopulate('editLeDiligenceAllowancePc', data.diligenceAllowancePcLe);
      smartPopulate('editLePostAllowancePc', data.postAllowancePcLe);
      smartPopulate('editLePhoneAllowancePc', data.phoneAllowancePcLe);
      smartPopulate('editLeTransportationPc', data.transportationPcLe);
      smartPopulate('editLeOtherAllowancePc', data.otherAllowancePcLe);

      // Car & Fleet (5 fields)
      smartPopulate('editLeCompCarsGas', data.compCarsGasLe);
      smartPopulate('editLeCompCarsOther', data.compCarsOtherLe);
      smartPopulate('editLeCarRental', data.carRentalLe);
      smartPopulate('editLeCarRepair', data.carRepairLe);
      smartPopulate('editLeCarMaintenance', data.carMaintenanceLe);

      // BJC-Specific Fields (9 fields)
      smartPopulate('editLeTemporaryStaffSal', data.temporaryStaffSalLe);
      smartPopulate('editLeSalTemp', data.salTempLe);
      smartPopulate('editLeSocialSecurityTmp', data.socialSecurityTmpLe);
      smartPopulate('editLeCarMaintenanceTmp', data.carMaintenanceTmpLe);
      smartPopulate('editLeSouthriskAllowance', data.southriskAllowanceLe);
      smartPopulate('editLeSouthriskAllowanceTmp', data.southriskAllowanceTmpLe);
      smartPopulate('editLeSalesCarAllowance', data.salesCarAllowanceLe);
      smartPopulate('editLeAccommodation', data.accommodationLe);
      smartPopulate('editLeOthersSubjectTax', data.othersSubjectTaxLe);

      // Benefits (10 fields)
      smartPopulate('editLeSocialSecurity', data.socialSecurityLe);
      smartPopulate('editLeWorkmenCompensation', data.workmenCompensationLe);
      smartPopulate('editLeProvidentFund', data.providentFundLe);
      smartPopulate('editLeOther', data.otherLe);
      smartPopulate('editLeLifeInsurance', data.lifeInsuranceLe);
      smartPopulate('editLeMedicalOutside', data.medicalOutsideLe);
      smartPopulate('editLeMedicalInHouse', data.medicalInhouseLe);
      smartPopulate('editLeStaffActivities', data.staffActivitiesLe);
      smartPopulate('editLeUniform', data.uniformLe);
      smartPopulate('editLeMealAllowance', data.mealAllowanceLe);

      // PE Calculations (4 fields)
      smartPopulate('editLePeMth', data.peMthLe);
      smartPopulate('editLePeYear', data.peYearLe);
      smartPopulate('editLePeSbMth', data.peSbMthLe);
      smartPopulate('editLePeSbYear', data.peSbYearLe);

      console.log('📝 Populating BJC Budget Year Fields (44 fields)...');

      // Core Fields (4 fields)
      smartPopulate('editBgPayroll', data.payroll);
      smartPopulate('editBgPremium', data.premium);
      smartPopulate('editBgSalWithEn', data.salWithEn);
      smartPopulate('editBgSalNotEn', data.salNotEn);

      // Allowances (14 fields)
      smartPopulate('editBgBonus', data.bonus);
      smartPopulate('editBgCarAllowance', data.carAllowance);
      smartPopulate('editBgLicenseAllowance', data.licenseAllowance);
      smartPopulate('editBgHousingAllowance', data.housingAllowance);
      smartPopulate('editBgCarGasoline', data.carGasoline);
      smartPopulate('editBgOutsourceWages', data.outsourceWages);
      smartPopulate('editBgSkillAllowancePc', data.skillAllowancePc);
      smartPopulate('editBgSalesManagementPc', data.salesManagementPc);
      smartPopulate('editBgShelfStackingPc', data.shelfStackingPc);
      smartPopulate('editBgDiligenceAllowancePc', data.diligenceAllowancePc);
      smartPopulate('editBgPostAllowancePc', data.postAllowancePc);
      smartPopulate('editBgPhoneAllowancePc', data.phoneAllowancePc);
      smartPopulate('editBgTransportationPc', data.transportationPc);
      smartPopulate('editBgOtherAllowancePc', data.otherAllowancePc);

      // Car & Fleet (5 fields)
      smartPopulate('editBgCompCarsGas', data.compCarsGas);
      smartPopulate('editBgCompCarsOther', data.compCarsOther);
      smartPopulate('editBgCarRental', data.carRental);
      smartPopulate('editBgCarRepair', data.carRepair);
      smartPopulate('editBgCarMaintenance', data.carMaintenance);

      // BJC-Specific Fields (9 fields)
      smartPopulate('editBgTemporaryStaffSal', data.temporaryStaffSal);
      smartPopulate('editBgSalTemp', data.salTemp);
      smartPopulate('editBgSocialSecurityTmp', data.socialSecurityTmp);
      smartPopulate('editBgCarMaintenanceTmp', data.carMaintenanceTmp);
      smartPopulate('editBgSouthriskAllowance', data.southriskAllowance);
      smartPopulate('editBgSouthriskAllowanceTmp', data.southriskAllowanceTmp);
      smartPopulate('editBgSalesCarAllowance', data.salesCarAllowance);
      smartPopulate('editBgAccommodation', data.accommodation);
      smartPopulate('editBgOthersSubjectTax', data.othersSubjectTax);

      // Benefits (10 fields)
      smartPopulate('editBgSocialSecurity', data.socialSecurity);
      smartPopulate('editBgWorkmenCompensation', data.workmenCompensation);
      smartPopulate('editBgProvidentFund', data.providentFund);
      smartPopulate('editBgOther', data.other);
      smartPopulate('editBgLifeInsurance', data.lifeInsurance);
      smartPopulate('editBgMedicalOutside', data.medicalOutside);
      smartPopulate('editBgMedicalInHouse', data.medicalInhouse);
      smartPopulate('editBgStaffActivities', data.staffActivities);
      smartPopulate('editBgUniform', data.uniform);
      smartPopulate('editBgMealAllowance', data.mealAllowance);

      // PE Calculations (4 fields)
      smartPopulate('editBgPeMth', data.peMth);
      smartPopulate('editBgPeYear', data.peYear);
      smartPopulate('editBgPeSbMth', data.peSbMth);
      smartPopulate('editBgPeSbYear', data.peSbYear);

    } else if (companyId === 2) {
      // ═══════════════════════════════════════════════════════════════
      // 🏢 BIGC COMPANY (CompanyId = 2) - 57 FIELDS
      // ═══════════════════════════════════════════════════════════════

      console.log('📝 Populating BIGC LE Fields (28 fields)...');

      // Core Fields (3 fields)
      smartPopulate('editLePayroll', data.payrollLe);
      smartPopulate('editLePremium', data.premiumLe);
      smartPopulate('editLeTotalPayroll', data.totalPayrollLe);

      // Allowances & Benefits (21 fields)
      smartPopulate('editLeBonus', data.bonusLe);
      smartPopulate('editLeFleetCardPe', data.fleetCardPeLe);
      smartPopulate('editLeCarAllowance', data.carAllowanceLe);
      smartPopulate('editLeLicenseAllowance', data.licenseAllowanceLe);
      smartPopulate('editLeHousingAllowance', data.housingAllowanceLe);
      smartPopulate('editLeGasolineAllowance', data.gasolineAllowanceLe);
      smartPopulate('editLeWageStudent', data.wageStudentLe);
      smartPopulate('editLeCarRentalPe', data.carRentalPeLe);
      smartPopulate('editLeSkillPayAllowance', data.skillPayAllowanceLe);
      smartPopulate('editLeOtherAllowance', data.otherAllowanceLe);
      smartPopulate('editLeSocialSecurity', data.socialSecurityLe);
      smartPopulate('editLeLaborFundFee', data.laborFundFeeLe);
      smartPopulate('editLeOtherStaffBenefit', data.otherStaffBenefitLe);
      smartPopulate('editLeProvidentFund', data.providentFundLe);
      smartPopulate('editLeProvision', data.provisionLe);
      smartPopulate('editLeInterest', data.interestLe);
      smartPopulate('editLeStaffInsurance', data.staffInsuranceLe);
      smartPopulate('editLeMedicalExpense', data.medicalExpenseLe);
      smartPopulate('editLeMedicalInHouse', data.medicalInhouseLe);
      smartPopulate('editLeTraining', data.trainingLe);
      smartPopulate('editLeLongService', data.longServiceLe);

      // PE Calculations (4 fields)
      smartPopulate('editLePeSbMth', data.peSbMthLe);
      smartPopulate('editLePeSbYear', data.peSbYearLe);
      smartPopulate('editLePeMth', data.peMthLe);
      smartPopulate('editLePeYear', data.peYearLe);

      console.log('📝 Populating BIGC Budget Year Fields (27 fields)...');

      // Core Fields (3 fields)
      smartPopulate('editBgPayroll', data.payroll);
      smartPopulate('editBgPremium', data.premium);
      smartPopulate('editBgTotalPayroll', data.totalPayroll);

      // Allowances & Benefits (20 fields)
      smartPopulate('editBgBonus', data.bonus);
      smartPopulate('editBgFleetCardPe', data.fleetCardPe);
      smartPopulate('editBgCarAllowance', data.carAllowance);
      smartPopulate('editBgLicenseAllowance', data.licenseAllowance);
      smartPopulate('editBgHousingAllowance', data.housingAllowance);
      smartPopulate('editBgGasolineAllowance', data.gasolineAllowance);
      smartPopulate('editBgWageStudent', data.wageStudent);
      smartPopulate('editBgCarRentalPe', data.carRentalPe);
      smartPopulate('editBgSkillPayAllowance', data.skillPayAllowance);
      smartPopulate('editBgOtherAllowance', data.otherAllowance);
      smartPopulate('editBgSocialSecurity', data.socialSecurity);
      smartPopulate('editBgLaborFundFee', data.laborFundFee);
      smartPopulate('editBgOtherStaffBenefit', data.otherStaffBenefit);
      smartPopulate('editBgProvidentFund', data.providentFund);
      smartPopulate('editBgProvision', data.provision);
      smartPopulate('editBgInterest', data.interest);
      smartPopulate('editBgStaffInsurance', data.staffInsurance);
      smartPopulate('editBgMedicalExpense', data.medicalExpense);
      smartPopulate('editBgMedicalInHouse', data.medicalInhouse);
      smartPopulate('editBgTraining', data.training);
      smartPopulate('editBgLongService', data.longService);

      // PE Calculations (4 fields)
      smartPopulate('editBgPeSbMth', data.peSbMth);
      smartPopulate('editBgPeSbYear', data.peSbYear);
      smartPopulate('editBgPeMth', data.peMth);
      smartPopulate('editBgPeYear', data.peYear);
    }

    // ===== STEP 9: Trigger change events for dependent calculations =====
    console.log('🔄 Triggering dependent field recalculations...');
    const payrollLeField = document.getElementById('editLePayroll');
    if (payrollLeField) {
      $(payrollLeField).trigger('change');
    }

    // ===== STEP 10: Restore Button & Show Success =====
    if (calButton) {
      calButton.disabled = false;
      calButton.innerHTML = originalText;
    }

    showSuccessModal(`✅ คำนวณสำเร็จ! (${companyType}) - ข้อมูลถูกกรอกในช่องที่ว่างเท่านั้น`);
    console.log('✅ [Cal Button] Calculation completed successfully');

  } catch (error) {
    console.error('💥 [Cal Button] Error during calculation:', error);
    showErrorModal(`เกิดข้อผิดพลาด: ${error.message}`);

    // Restore button state
    const calButton = document.getElementById('calcLePayrollBtn');
    const originalText = calButton?.getAttribute('data-original-text') || 'Cal';
    if (calButton) {
      calButton.disabled = false;
      calButton.innerHTML = originalText;
    }
  }
}

// Export update functions
window.detectChangedFields = detectChangedFields;  // ✅ Phase 1: Change detection
window.valuesAreEqual = valuesAreEqual;            // ✅ Phase 1: Helper function
window.formatValue = formatValue;                  // ✅ Phase 1: Helper function
window.collectUpdateFormData = collectUpdateFormData;
window.collectLeBenefitsData = collectLeBenefitsData;
window.collectBgBenefitsData = collectBgBenefitsData;
window.updateBudgetData = updateBudgetData;
window.calculateOffcanvasBudgetEstimate = calculateOffcanvasBudgetEstimate;  // ✅ Cal Button Function

// Export Edit Form Functions
window.populateEditForm = populateEditForm;
window.processEditFormPopulation = processEditFormPopulation;
window.populateAndSelectBasicDropdowns = populateAndSelectBasicDropdowns;
window.populateAndSelectCascadingDropdowns = populateAndSelectCascadingDropdowns;
window.finalizeEditFormUI = finalizeEditFormUI;
window.populateNonDropdownFields = populateNonDropdownFields;
window.autoSelectWithRetry = autoSelectWithRetry;
window.isDropdownReady = isDropdownReady;
window.displayEmployeeInfo = displayEmployeeInfo;
window.setEditModeFieldStates = setEditModeFieldStates;
window.populateLeBenefitsData = populateLeBenefitsData;
window.populateBgBenefitsData = populateBgBenefitsData;
window.validateRequiredFields = validateRequiredFields;
window.highlightMissingBenefitsData = highlightMissingBenefitsData;
window.formatEmployeeName = formatEmployeeName;
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
