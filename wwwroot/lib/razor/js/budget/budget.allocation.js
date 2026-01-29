/**
 * Budget Allocation Management
 * Handles dynamic cost center allocation functionality
 */

// Global variables for allocation management
let allocationCounter = 0;
let allocationRowsData = [];
let isAllocationInitialized = false;

/**
 * Initialize allocation functionality
 */
function initializeAllocationManagement() {
    // console.log('🚀 Initializing allocation management...');

    // Check if container exists first
    const container = document.getElementById('allocationContainer');
    if (!container) {
        console.warn('⚠️ Allocation container not found, will retry...');
        return false;
    }

    // Skip if already initialized AND container has content
    if (isAllocationInitialized && container.children.length > 0) {
        // console.log('✅ Allocation Management already initialized with content');
        return true;
    }

    // console.log('🔧 Setting up allocation management...');

    // Clear any existing content and reset counter
    container.innerHTML = '';
    allocationCounter = 0;

    // Listen for custom allocation card events from offcanvas
    window.removeEventListener('allocationCardVisible', handleAllocationCardVisible);
    window.removeEventListener('allocationCardHidden', handleAllocationCardHidden);
    window.addEventListener('allocationCardVisible', handleAllocationCardVisible);
    window.addEventListener('allocationCardHidden', handleAllocationCardHidden);

    // Add event listener for add allocation button
    const addBtn = document.getElementById('addAllocationBtn');
    if (addBtn) {
        // Remove existing listener to prevent duplicates
        addBtn.removeEventListener('click', handleAddAllocationClick);
        addBtn.addEventListener('click', handleAddAllocationClick);
        // console.log('Add allocation button listener attached');
    } else {
        // console.warn('Add allocation button not found');
    }

    // Add event listener for refresh cost centers button
    const refreshBtn = document.getElementById('refreshCostCentersBtn');
    if (refreshBtn) {
        refreshBtn.removeEventListener('click', refreshAllCostCenters);
        refreshBtn.addEventListener('click', refreshAllCostCenters);
        // console.log('Refresh cost centers button listener attached');
    }

    // Add initial allocation row only if card should be visible
    const allocationCard = document.getElementById('budgetAllocationCard');
    if (allocationCard && !allocationCard.classList.contains('d-none')) {
        addAllocationRow();
    }

    isAllocationInitialized = true;
    // console.log('✅ Allocation management initialized successfully');
    return true;
}

/**
 * Setup cost center change listener to show/hide allocation card
 */
function setupCostCenterListener() {
    // Deprecated: cost center listener now handled in budget.offcanvas.js
}

/**
 * Handle cost center change to show/hide allocation card
 */
function handleCostCenterChange() {
    // Deprecated: allocation card show/hide now handled in budget.offcanvas.js
    // Use custom event listeners instead
}

// Custom event handlers for allocation card visibility
function handleAllocationCardVisible(e) {
    // console.log('🔔 handleAllocationCardVisible triggered');

    // Force initialize if not initialized
    if (!isAllocationInitialized) {
        // console.log('🔄 Force initializing allocation management...');
        initializeAllocationManagement();
    }

    // Add allocation row if needed
    const container = document.getElementById('allocationContainer');
    if (container && container.children.length === 0) {
        // console.log('🆕 Adding initial allocation row...');
        addAllocationRow();
    } else {
        // console.log('✅ Allocation rows already exist:', container.children.length);
    }
}function handleAllocationCardHidden(e) {
    // Reset allocation data
    const container = document.getElementById('allocationContainer');
    if (container) {
        container.innerHTML = '';
        allocationCounter = 0;
    }
}

/**
 * Handle add allocation button click with validation
 */
function handleAddAllocationClick() {
    // Check if current rows have any duplicate cost centers first
    if (!validateCostCenterDuplication()) {
        alert('Please fix duplicate cost centers before adding a new allocation row.');
        return;
    }

    // Check if there are any empty cost center selections
    const emptyRows = checkForEmptyCostCenters();
    if (emptyRows.length > 0) {
        const proceed = confirm(`You have ${emptyRows.length} allocation row(s) without cost centers selected. Do you want to add a new row anyway?`);
        if (!proceed) {
            return;
        }
    }

    // All validations passed, add new row
    addAllocationRow();
}

/**
 * Check for empty cost center selections
 */
function checkForEmptyCostCenters() {
    const emptyRows = [];
    const costCenterSelects = document.querySelectorAll('.allocation-costcenter');

    costCenterSelects.forEach((select, index) => {
        if (!select.value || select.value === '') {
            emptyRows.push(index + 1);
        }
    });

    return emptyRows;
}

/**
 * Add new allocation row
 */
function addAllocationRow() {
    allocationCounter++;
    const container = document.getElementById('allocationContainer');

    if (!container) {
        // console.error('Allocation container not found');
        return;
    }

    const allocationRow = document.createElement('div');
    allocationRow.className = 'allocation-row';
    allocationRow.setAttribute('data-allocation-id', allocationCounter);

    allocationRow.innerHTML = `
    <div class="row g-2 align-items-center">
        <div class="col-md-6">
            <select class="form-select allocation-costcenter" name="allocationCostCenter_${allocationCounter}" id="allocationCostCenter_${allocationCounter}">
                <option value="">Select Cost Center</option>
            </select>
        </div>
        <div class="col-md-4">
            <div class="input-group">
                <input type="number" class="form-control allocation-percentage"
                       name="allocationPercentage_${allocationCounter}"
                       id="allocationPercentage_${allocationCounter}"
                       min="0" max="100" step="0.01" placeholder="0.00">
                <span class="input-group-text">%</span>
            </div>
        </div>
        <div class="col-md-2">
            <button type="button" class="btn btn-sm btn-inverse-danger remove-allocation-btn"
                    onclick="removeAllocationRow(${allocationCounter})" title="Remove">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    </div>
    `;

    container.appendChild(allocationRow);

    // Populate cost center dropdown for this row first
    populateAllocationCostCenter(allocationCounter);

    // Add event listeners after a short delay to ensure DOM is ready
    setTimeout(() => {
        addAllocationEventListeners(allocationCounter);
    }, 200);

    // Update totals
    calculateAllocationTotals();

    // console.log('Added allocation row:', allocationCounter);
}

/**
 * Remove allocation row
 */
function removeAllocationRow(rowId) {
    const row = document.querySelector(`[data-allocation-id="${rowId}"]`);
    if (row) {
        // Only allow removal if there's more than one row
        const allRows = document.querySelectorAll('.allocation-row');
        if (allRows.length <= 1) {
            alert('At least one allocation row is required');
            return;
        }

        row.remove();
        calculateAllocationTotals();
        // console.log('Removed allocation row:', rowId);
    }
}

/**
 * Populate cost center dropdown for allocation
 */
function populateAllocationCostCenter(rowId) {
    const selectId = `allocationCostCenter_${rowId}`;
    const selectElement = document.getElementById(selectId);

    if (!selectElement) {
        // console.error('Cost center select element not found:', selectId);
        return;
    }

    // Clear current options and show loading state
    selectElement.innerHTML = '<option value="">Loading...</option>';
    selectElement.disabled = true;

    // Try to get company from the form
    const companyID = document.getElementById('editCompany')?.value ||
                     document.getElementById('companyFilter')?.value;

    // console.log('Populating cost center for row:', rowId, 'Company:', companyID);

    // Use the existing populateDropdown function if available
    if (typeof populateDropdown === 'function' && typeof BUDGET_API !== 'undefined' && companyID) {
        // console.log('Using API to populate cost centers for company:', companyID);
        populateDropdown(selectId,
            `${BUDGET_API.costCenters}?companyID=${companyID}`,
            'Select Cost Center',
            (option, item) => {
                option.value = item.costCenterCode;
                option.textContent = `${item.costCenterName} (${item.costCenterCode})`;
            }
        );

        // Re-enable after API call
        setTimeout(() => {
            selectElement.disabled = false;
        }, 500);
    } else {
        // console.log('Using fallback cost center data for row:', rowId);
        // Simulate loading delay for user feedback
        setTimeout(() => {
            selectElement.innerHTML = `
                <option value="">Select Cost Center</option>
                <option value="02990">Hyper Operation BKK (02990)</option>
                <option value="90015">Pure (90015)</option>
                <option value="90001">BCM (90001)</option>
                <option value="90074">Donjai (90074)</option>
                <option value="90039">B2B + Depot (90039)</option>
                <option value="90065">Food Service (90065)</option>
                <option value="07001">Transformation Office (07001)</option>
            `;
            selectElement.disabled = false;
            // console.log('Fallback data populated for row:', rowId);
        }, 300);
    }

    // Also listen for company changes to update cost centers (set only once)
    const companySelect = document.getElementById('editCompany');
    if (companySelect && !companySelect.hasAttribute('data-allocation-listener')) {
        companySelect.setAttribute('data-allocation-listener', 'true');
        // console.log('Adding company change listener for allocation cost centers');
        companySelect.addEventListener('change', function() {
            // console.log('Company changed, updating all allocation cost centers...');
            // Update all allocation cost center dropdowns when company changes
            document.querySelectorAll('.allocation-costcenter').forEach((select, index) => {
                const rowId = select.id.split('_')[1];
                if (rowId) {
                    setTimeout(() => populateAllocationCostCenter(rowId), 100);
                }
            });
        });
    }
}

/**
 * Refresh all cost center dropdowns
 */
function refreshAllCostCenters() {
    // console.log('Refreshing all cost center dropdowns...');

    // Get company ID first
    const companyID = document.getElementById('editCompany')?.value ||
                     document.getElementById('companyFilter')?.value;

    // console.log('Company ID for refresh:', companyID);

    const costCenterSelects = document.querySelectorAll('.allocation-costcenter');
    // console.log('Found cost center selects:', costCenterSelects.length);

    if (costCenterSelects.length === 0) {
        // console.warn('No cost center dropdowns found to refresh');
        return;
    }

    // Show user feedback
    const refreshBtn = document.getElementById('refreshCostCentersBtn');
    if (refreshBtn) {
        const originalText = refreshBtn.innerHTML;
        refreshBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Refreshing...';
        refreshBtn.disabled = true;

        // Refresh all dropdowns
        costCenterSelects.forEach((select, index) => {
            // console.log(`Refreshing dropdown ${index + 1}:`, select.id);

            const rowId = select.id.split('_')[1];
            if (rowId) {
                populateAllocationCostCenter(rowId);
            } else {
                // console.error('Could not extract row ID from select:', select.id);
            }
        });

        // Reset button after delay
        setTimeout(() => {
            refreshBtn.innerHTML = originalText;
            refreshBtn.disabled = false;
            // console.log('Refresh completed');
        }, 1000);
    } else {
        // If no button found, still refresh the dropdowns
        costCenterSelects.forEach((select) => {
            const rowId = select.id.split('_')[1];
            if (rowId) {
                populateAllocationCostCenter(rowId);
            }
        });
    }

    // console.log('All cost center dropdowns refresh initiated');
}

/**
 * Add event listeners to allocation row
 */
function addAllocationEventListeners(rowId) {
    const row = document.querySelector(`[data-allocation-id="${rowId}"]`);
    if (!row) {
        // console.warn('Row not found for ID:', rowId);
        return;
    }

    const percentageInput = row.querySelector('.allocation-percentage');
    const costCenterSelect = row.querySelector('.allocation-costcenter');

    // console.log('Adding event listeners to row:', rowId, 'costCenterSelect found:', !!costCenterSelect);

    if (percentageInput) {
        // Calculate totals when percentage changes
        percentageInput.addEventListener('input', function() {
            calculateAllocationTotals();
        });

        // Validate percentage on blur
        percentageInput.addEventListener('blur', function() {
            const value = parseFloat(this.value) || 0;
            if (value > 100) {
                this.value = 100;
                calculateAllocationTotals();
            }
            if (value < 0) {
                this.value = 0;
                calculateAllocationTotals();
            }
        });
    }

    if (costCenterSelect) {
        // Validate duplication when cost center changes
        costCenterSelect.addEventListener('change', function() {
            // console.log('Cost center changed:', this.value, 'for row:', rowId);
            setTimeout(() => {
                // console.log('Running validation after delay...');
                validateCostCenterDuplication();
            }, 100);
        });
        // console.log('Event listener added to cost center select for row:', rowId);
    } else {
        // console.warn('Cost center select not found for row:', rowId);
    }
}

/**
 * Calculate amount for specific row
 */
function calculateRowAmount(rowId) {
    const row = document.querySelector(`[data-allocation-id="${rowId}"]`);
    if (!row) return;

    const percentageInput = row.querySelector('.allocation-percentage');
    const amountInput = row.querySelector('.allocation-amount');

    if (!percentageInput || !amountInput) return;

    const percentage = parseFloat(percentageInput.value) || 0;

    // Get base amount from payroll field (try both LE and BG payroll)
    let baseAmount = parseFloat(document.getElementById('editLePayroll')?.value) ||
                     parseFloat(document.getElementById('editBgPayroll')?.value) ||
                     0;

    const amount = (baseAmount * percentage / 100).toFixed(2);
    amountInput.value = amount;
}

/**
 * Calculate and update allocation totals
 */
function calculateAllocationTotals() {
    const percentageInputs = document.querySelectorAll('.allocation-percentage');
    let totalPercentage = 0;

    percentageInputs.forEach(input => {
        totalPercentage += parseFloat(input.value) || 0;
    });

    // Update total allocation field
    const totalField = document.getElementById('totalAllocation');
    if (totalField) {
        totalField.value = totalPercentage.toFixed(2);
    }

    // Update status indicator
    updateAllocationStatus(totalPercentage);

    // ตรวจสอบว่า allocation = 100% แล้วสร้าง dynamic forms
    if (totalPercentage === 100) {
        createDynamicAllocationForms();
    } else {
        removeDynamicForms();
    }
}

/**
 * Update allocation status indicator
 */
function updateAllocationStatus(totalPercentage) {
    const statusElement = document.getElementById('allocationStatus');
    if (!statusElement) return;

    // Remove existing alert classes
    statusElement.className = statusElement.className.replace(/alert-\w+/g, '');

    if (totalPercentage === 100) {
        statusElement.className += ' alert-success';
        statusElement.innerHTML = '<small><i class="fa-solid fa-check"></i> Allocation is complete (100%)</small>';
    } else if (totalPercentage > 100) {
        statusElement.className += ' alert-danger';
        statusElement.innerHTML = `<small><i class="fa-solid fa-exclamation-triangle"></i> Allocation exceeds 100% by ${(totalPercentage - 100).toFixed(2)}%</small>`;
    } else {
        statusElement.className += ' alert-warning';
        statusElement.innerHTML = `<small><i class="fa-solid fa-info-circle"></i> Remaining: ${(100 - totalPercentage).toFixed(2)}%</small>`;
    }
}

/**
 * Validate cost center duplication
 */
function validateCostCenterDuplication() {
    const costCenterSelects = document.querySelectorAll('.allocation-costcenter');
    const selectedValues = [];
    let hasDuplicates = false;

    // console.log('Validating cost center duplication. Found selects:', costCenterSelects.length);

    // Reset all borders first
    costCenterSelects.forEach(select => {
        select.style.borderColor = '';
        select.style.boxShadow = '';
    });

    // Check for duplicates
    costCenterSelects.forEach((select, index) => {
        const value = select.value;
        // console.log(`Checking select ${index}: value="${value}"`);

        if (value && value !== '') {
            const existingIndex = selectedValues.findIndex(item => item.value === value);

            if (existingIndex !== -1) {
                // Found duplicate - highlight both
                // console.log(`DUPLICATE FOUND: ${value} at positions ${existingIndex} and ${index}`);
                select.style.borderColor = '#dc3545';
                select.style.boxShadow = '0 0 0 0.2rem rgba(220, 53, 69, 0.25)';

                // Also highlight the first occurrence
                const firstSelect = costCenterSelects[selectedValues[existingIndex].index];
                firstSelect.style.borderColor = '#dc3545';
                firstSelect.style.boxShadow = '0 0 0 0.2rem rgba(220, 53, 69, 0.25)';

                hasDuplicates = true;
                // console.warn(`Duplicate cost center found: ${value} at rows ${selectedValues[existingIndex].index + 1} and ${index + 1}`);
            } else {
                selectedValues.push({ value: value, index: index });
            }
        }
    });

    // Show warning message if duplicates found
    if (hasDuplicates) {
        showDuplicationWarning();
    } else {
        hideDuplicationWarning();
    }

    return !hasDuplicates;
}

/**
 * Show duplication warning message
 */
function showDuplicationWarning() {
    let warningDiv = document.getElementById('duplicationWarning');

    if (!warningDiv) {
        // Create warning element if it doesn't exist
        warningDiv = document.createElement('div');
        warningDiv.id = 'duplicationWarning';
        warningDiv.className = 'alert alert-danger mt-2';
        warningDiv.innerHTML = '<small><i class="fa-solid fa-exclamation-triangle"></i> Duplicate cost centers detected. Please select unique cost centers.</small>';

        // Insert after the allocation container
        const container = document.getElementById('allocationContainer');
        if (container && container.parentNode) {
            container.parentNode.insertBefore(warningDiv, container.nextSibling);
        }
    }

    warningDiv.style.display = 'block';
}

/**
 * Hide duplication warning message
 */
function hideDuplicationWarning() {
    const warningDiv = document.getElementById('duplicationWarning');
    if (warningDiv) {
        warningDiv.style.display = 'none';
    }
}

/**
 * Get allocation data for saving
 */
function getAllocationData() {
    const allocations = [];
    const rows = document.querySelectorAll('.allocation-row');

    rows.forEach(row => {
        const costCenterSelect = row.querySelector('.allocation-costcenter');
        const percentageInput = row.querySelector('.allocation-percentage');

        const costCenter = costCenterSelect?.value || '';
        const costCenterText = costCenterSelect?.options[costCenterSelect.selectedIndex]?.text || '';
        const percentage = parseFloat(percentageInput?.value) || 0;

        if (costCenter && percentage > 0) {
            allocations.push({
                costCenter: costCenter,
                costCenterName: costCenterText,
                percentage: percentage
            });
        }
    });

    return allocations;
}

/**
 * Load allocation data for editing
 */
function loadAllocationData(allocationData) {
    // Clear existing rows
    const container = document.getElementById('allocationContainer');
    if (container) {
        container.innerHTML = '';
    }
    allocationCounter = 0;

    if (allocationData && allocationData.length > 0) {
        allocationData.forEach(allocation => {
            addAllocationRow();
            const currentRow = document.querySelector(`[data-allocation-id="${allocationCounter}"]`);

            if (currentRow) {
                // Set values
                const costCenterSelect = currentRow.querySelector('.allocation-costcenter');
                const percentageInput = currentRow.querySelector('.allocation-percentage');

                if (costCenterSelect) costCenterSelect.value = allocation.costCenter;
                if (percentageInput) percentageInput.value = allocation.percentage;
            }
        });
    } else {
        // Add one empty row if no data
        addAllocationRow();
    }

    calculateAllocationTotals();
}

/**
 * Validate allocation before saving
 */
function validateAllocation() {
    const totalPercentage = parseFloat(document.getElementById('totalAllocation')?.value) || 0;

    // Check total percentage
    if (totalPercentage !== 100) {
        alert(`Total allocation must equal 100%. Current total: ${totalPercentage.toFixed(2)}%`);
        return false;
    }

    // Check if we have valid allocations
    const allocations = getAllocationData();
    if (allocations.length === 0) {
        alert('At least one allocation with valid cost center and percentage is required.');
        return false;
    }

    // Final duplicate check as additional safety (should already be validated)
    if (!validateCostCenterDuplication()) {
        alert('Duplicate cost centers detected. Please fix before saving.');
        return false;
    }

    return true;
}

/**
 * สร้าง Dynamic Forms สำหรับ Cost Center Allocation เมื่อ total = 100%
 */
function createDynamicAllocationForms() {
    // console.log('Creating dynamic allocation forms...');

    // ตรวจสอบว่าต้องแสดง dynamic forms หรือไม่ (เฉพาะ Cost Center = ALLOCATION_COST_CENTER)
    const selectedCostCenter = document.getElementById('editCostCenter')?.value;
    const requiredCostCenter = DYNAMIC_FORMS_CONFIG?.ALLOCATION_COST_CENTER || '90066';

    if (selectedCostCenter !== requiredCostCenter) {
        // console.log(`Cost Center is not ${requiredCostCenter}, skipping dynamic forms creation`);
        return;
    }

    // ดึงข้อมูล cost centers ที่เลือกใน allocation
    const allocations = getAllocationData();
    if (allocations.length === 0) {
        // console.log('No allocations found, skipping dynamic forms');
        return;
    }

    // สร้าง dynamic forms สำหรับ LE Benefits
    createDynamicLeBenefitsForms(allocations);

    // สร้าง dynamic forms สำหรับ 2026 Benefits
    createDynamicBgBenefitsForms(allocations);
}

/**
 * สร้าง Dynamic LE Benefits Forms
 */
function createDynamicLeBenefitsForms(allocations) {
    const containerIds = DYNAMIC_FORMS_CONFIG?.CONTAINERS;
    const container = document.getElementById(containerIds?.leBenefits || 'dynamicLeBenefitsContainer');
    const formsContainer = document.getElementById(containerIds?.leBenefitsForms || 'dynamicLeBenefitsForms');

    if (!container || !formsContainer) {
        // console.error('Dynamic LE Benefits containers not found');
        return;
    }

    // เคลียร์ form เดิม
    formsContainer.innerHTML = '';

    // แสดง container
    container.classList.remove('d-none');

    // สร้าง form สำหรับแต่ละ cost center
    allocations.forEach((allocation, index) => {
        const formDiv = document.createElement('div');
        const cssClasses = DYNAMIC_FORMS_CONFIG?.CLASSES;

        formDiv.className = cssClasses?.dynamicCard || 'card mb-3 border-secondary';
        formDiv.setAttribute('data-allocation-cc', allocation.costCenter);

        formDiv.innerHTML = `
            <div class="${cssClasses?.dynamicHeader || 'card-header py-2'}">
                <h6 class="mb-0">
                    <i class="${cssClasses?.dynamicIcon || 'fa-solid fa-building me-2 dynamic-header-icon'}"></i>
                    Cost Center: ${allocation.costCenterName} (${allocation.percentage}%)
                </h6>
            </div>
            <div class="${cssClasses?.dynamicBody || 'card-body'}">
                <div class="row">
                    <div class="col-md-4 mb-2">
                        <label class="${cssClasses?.dynamicLabel || 'form-label small'}"><b>Payroll</b></label>
                        <input type="text" class="${cssClasses?.dynamicInput || 'form-control form-control-sm'}"
                               name="dynamicLePayroll_${allocation.costCenter}"
                               id="dynamicLePayroll_${allocation.costCenter}"
                               placeholder="0.00">
                    </div>
                    <div class="col-md-4 mb-2">
                        <label class="${cssClasses?.dynamicLabel || 'form-label small'}"><b>Bonus</b></label>
                        <input type="text" class="${cssClasses?.dynamicInput || 'form-control form-control-sm'}"
                               name="dynamicLeBonus_${allocation.costCenter}"
                               id="dynamicLeBonus_${allocation.costCenter}"
                               placeholder="0.00">
                    </div>
                    <div class="col-md-4 mb-2">
                        <label class="${cssClasses?.dynamicLabel || 'form-label small'}"><b>Fleet Card - PE</b></label>
                        <input type="text" class="${cssClasses?.dynamicInput || 'form-control form-control-sm'}"
                               name="dynamicLeFleetCardPE_${allocation.costCenter}"
                               id="dynamicLeFleetCardPE_${allocation.costCenter}"
                               placeholder="0.00">
                    </div>
                    <div class="col-md-4 mb-2">
                        <label class="${cssClasses?.dynamicLabel || 'form-label small'}"><b>Social Security</b></label>
                        <input type="text" class="${cssClasses?.dynamicInput || 'form-control form-control-sm'}"
                               name="dynamicLeSocialSecurity_${allocation.costCenter}"
                               id="dynamicLeSocialSecurity_${allocation.costCenter}"
                               placeholder="0.00">
                    </div>
                    <div class="col-md-4 mb-2">
                        <label class="${cssClasses?.dynamicLabel || 'form-label small'}"><b>Provident Fund</b></label>
                        <input type="text" class="${cssClasses?.dynamicInput || 'form-control form-control-sm'}"
                               name="dynamicLeProvidentFund_${allocation.costCenter}"
                               id="dynamicLeProvidentFund_${allocation.costCenter}"
                               placeholder="0.00">
                    </div>
                    <div class="col-md-4 mb-2">
                        <label class="${cssClasses?.dynamicLabel || 'form-label small'}"><b>PE (Year)</b></label>
                        <input type="text" class="${cssClasses?.dynamicInput || 'form-control form-control-sm'}"
                               name="dynamicLePeYear_${allocation.costCenter}"
                               id="dynamicLePeYear_${allocation.costCenter}"
                               placeholder="0.00">
                    </div>
                </div>
            </div>
        `;

        formsContainer.appendChild(formDiv);
    });

    // console.log('Dynamic LE Benefits forms created for', allocations.length, 'cost centers');
}

/**
 * สร้าง Dynamic 2026 Benefits Forms
 */
function createDynamicBgBenefitsForms(allocations) {
    const containerIds = DYNAMIC_FORMS_CONFIG?.CONTAINERS;
    const container = document.getElementById(containerIds?.bgBenefits || 'dynamicBgBenefitsContainer');
    const formsContainer = document.getElementById(containerIds?.bgBenefitsForms || 'dynamicBgBenefitsForms');

    if (!container || !formsContainer) {
        // console.error('Dynamic 2026 Benefits containers not found');
        return;
    }

    // เคลียร์ form เดิม
    formsContainer.innerHTML = '';

    // แสดง container
    container.classList.remove('d-none');

    // สร้าง form สำหรับแต่ละ cost center
    allocations.forEach((allocation, index) => {
        const formDiv = document.createElement('div');
        const cssClasses = DYNAMIC_FORMS_CONFIG?.CLASSES;

        formDiv.className = cssClasses?.dynamicCard || 'card mb-3 border-secondary';
        formDiv.setAttribute('data-allocation-cc', allocation.costCenter);

        formDiv.innerHTML = `
            <div class="${cssClasses?.dynamicHeader || 'card-header py-2'}">
                <h6 class="mb-0">
                    <i class="${cssClasses?.dynamicIcon || 'fa-solid fa-building me-2 dynamic-header-icon'}"></i>
                    Cost Center: ${allocation.costCenterName} (${allocation.percentage}%)
                </h6>
            </div>
            <div class="${cssClasses?.dynamicBody || 'card-body'}">
                <div class="row">
                    <div class="col-md-4 mb-2">
                        <label class="${cssClasses?.dynamicLabel || 'form-label small'}"><b>Payroll</b></label>
                        <input type="text" class="${cssClasses?.dynamicInput || 'form-control form-control-sm'}"
                               name="dynamicBgPayroll_${allocation.costCenter}"
                               id="dynamicBgPayroll_${allocation.costCenter}"
                               placeholder="0.00">
                    </div>
                    <div class="col-md-4 mb-2">
                        <label class="${cssClasses?.dynamicLabel || 'form-label small'}"><b>Bonus</b></label>
                        <input type="text" class="${cssClasses?.dynamicInput || 'form-control form-control-sm'}"
                               name="dynamicBgBonus_${allocation.costCenter}"
                               id="dynamicBgBonus_${allocation.costCenter}"
                               placeholder="0.00">
                    </div>
                    <div class="col-md-4 mb-2">
                        <label class="${cssClasses?.dynamicLabel || 'form-label small'}"><b>Fleet Card - PE</b></label>
                        <input type="text" class="${cssClasses?.dynamicInput || 'form-control form-control-sm'}"
                               name="dynamicBgFleetCardPE_${allocation.costCenter}"
                               id="dynamicBgFleetCardPE_${allocation.costCenter}"
                               placeholder="0.00">
                    </div>
                    <div class="col-md-4 mb-2">
                        <label class="${cssClasses?.dynamicLabel || 'form-label small'}"><b>Social Security</b></label>
                        <input type="text" class="${cssClasses?.dynamicInput || 'form-control form-control-sm'}"
                               name="dynamicBgSocialSecurity_${allocation.costCenter}"
                               id="dynamicBgSocialSecurity_${allocation.costCenter}"
                               placeholder="0.00">
                    </div>
                    <div class="col-md-4 mb-2">
                        <label class="${cssClasses?.dynamicLabel || 'form-label small'}"><b>Provident Fund</b></label>
                        <input type="text" class="${cssClasses?.dynamicInput || 'form-control form-control-sm'}"
                               name="dynamicBgProvidentFund_${allocation.costCenter}"
                               id="dynamicBgProvidentFund_${allocation.costCenter}"
                               placeholder="0.00">
                    </div>
                    <div class="col-md-4 mb-2">
                        <label class="${cssClasses?.dynamicLabel || 'form-label small'}"><b>PE (Year)</b></label>
                        <input type="text" class="${cssClasses?.dynamicInput || 'form-control form-control-sm'}"
                               name="dynamicBgPeYear_${allocation.costCenter}"
                               id="dynamicBgPeYear_${allocation.costCenter}"
                               placeholder="0.00">
                    </div>
                </div>
            </div>
        `;

        formsContainer.appendChild(formDiv);
    });

    // console.log('Dynamic 2026 Benefits forms created for', allocations.length, 'cost centers');
}

/**
 * อัพเดท Dynamic Forms เมื่อ allocation เปลี่ยน
 */
function updateDynamicForms() {
    // console.log('Updating dynamic forms...');

    // ตรวจสอบ total allocation
    const totalPercentage = parseFloat(document.getElementById('totalAllocation')?.value) || 0;

    if (totalPercentage === 100) {
        createDynamicAllocationForms();
    } else {
        removeDynamicForms();
    }
}

/**
 * ลบ Dynamic Forms เมื่อ allocation ไม่เท่ากับ 100%
 */
function removeDynamicForms() {
    const containerIds = DYNAMIC_FORMS_CONFIG?.CONTAINERS;

    // ซ่อน LE Benefits dynamic container
    const leBenefitsContainer = document.getElementById(containerIds?.leBenefits || 'dynamicLeBenefitsContainer');
    if (leBenefitsContainer) {
        leBenefitsContainer.classList.add('d-none');
        const formsContainer = document.getElementById(containerIds?.leBenefitsForms || 'dynamicLeBenefitsForms');
        if (formsContainer) {
            formsContainer.innerHTML = '';
        }
    }

    // ซ่อน 2026 Benefits dynamic container
    const bgBenefitsContainer = document.getElementById(containerIds?.bgBenefits || 'dynamicBgBenefitsContainer');
    if (bgBenefitsContainer) {
        bgBenefitsContainer.classList.add('d-none');
        const formsContainer = document.getElementById(containerIds?.bgBenefitsForms || 'dynamicBgBenefitsForms');
        if (formsContainer) {
            formsContainer.innerHTML = '';
        }
    }

    // console.log('Dynamic forms removed');
}

/**
 * ดึงข้อมูล Dynamic Forms สำหรับการบันทึก
 */
function getDynamicFormsData() {
    const containerIds = DYNAMIC_FORMS_CONFIG?.CONTAINERS;
    const data = {
        leBenefits: {},
        bgBenefits: {}
    };

    // ดึงข้อมูล LE Benefits
    const leDynamicInputs = document.querySelectorAll(`#${containerIds?.leBenefitsForms || 'dynamicLeBenefitsForms'} input`);
    leDynamicInputs.forEach(input => {
        const name = input.name;
        if (name && input.value) {
            data.leBenefits[name] = input.value;
        }
    });

    // ดึงข้อมูล 2026 Benefits
    const bgDynamicInputs = document.querySelectorAll(`#${containerIds?.bgBenefitsForms || 'dynamicBgBenefitsForms'} input`);
    bgDynamicInputs.forEach(input => {
        const name = input.name;
        if (name && input.value) {
            data.bgBenefits[name] = input.value;
        }
    });

    return data;
}

/**
 * โหลดข้อมูลลง Dynamic Forms
 */
function loadDynamicFormsData(data) {
    if (!data) return;

    // โหลดข้อมูล LE Benefits
    if (data.leBenefits) {
        Object.keys(data.leBenefits).forEach(fieldName => {
            const input = document.querySelector(`input[name="${fieldName}"]`);
            if (input) {
                input.value = data.leBenefits[fieldName];
            }
        });
    }

    // โหลดข้อมูล 2026 Benefits
    if (data.bgBenefits) {
        Object.keys(data.bgBenefits).forEach(fieldName => {
            const input = document.querySelector(`input[name="${fieldName}"]`);
            if (input) {
                input.value = data.bgBenefits[fieldName];
            }
        });
    }

    // console.log('Dynamic forms data loaded');
}

/**
 * Integration function to be called from budget.offcanvas.js
 */
function setupAllocationIntegration() {
    // Initialize allocation when offcanvas is shown
    const offcanvas = document.getElementById('offcanvasAddRow');
    if (offcanvas) {
        offcanvas.addEventListener('shown.coreui.offcanvas', function() {
            // console.log('Offcanvas shown, initializing allocation...');
            setTimeout(initializeAllocationManagement, 100);
        });
    }

    // Also initialize if offcanvas is already visible
    if (offcanvas && offcanvas.classList.contains('show')) {
        setTimeout(initializeAllocationManagement, 100);
    }
}

// Export functions for global access
window.initializeAllocationManagement = initializeAllocationManagement;
window.setupCostCenterListener = setupCostCenterListener;
window.handleCostCenterChange = handleCostCenterChange;
window.handleAddAllocationClick = handleAddAllocationClick;
window.addAllocationRow = addAllocationRow;
window.removeAllocationRow = removeAllocationRow;
window.getAllocationData = getAllocationData;
window.loadAllocationData = loadAllocationData;
window.validateAllocation = validateAllocation;
window.validateCostCenterDuplication = validateCostCenterDuplication;
window.refreshAllCostCenters = refreshAllCostCenters;
window.setupAllocationIntegration = setupAllocationIntegration;

// Export Dynamic Forms functions
window.createDynamicAllocationForms = createDynamicAllocationForms;
window.createDynamicLeBenefitsForms = createDynamicLeBenefitsForms;
window.createDynamicBgBenefitsForms = createDynamicBgBenefitsForms;
window.updateDynamicForms = updateDynamicForms;
window.removeDynamicForms = removeDynamicForms;
window.getDynamicFormsData = getDynamicFormsData;
window.loadDynamicFormsData = loadDynamicFormsData;

// Export initialization status
window.isAllocationInitialized = () => isAllocationInitialized;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // console.log('Budget allocation module loaded');
    setupAllocationIntegration();
});
