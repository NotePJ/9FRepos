/**
 * 📋 Budget Plan Events - Enhanced Batch Entry System
 * ════════════════════════════════════════════════════════════
 *
 * 📖 TABLE OF CONTENTS:
 * ═════════════════════
 *
*📊 FINAL FILE STRUCTURE - 8 ORGANIZED SECTIONS:
*📚 CORE CONFIGURATION & CONSTANTS (Lines 27-199)
*
*Global variables, constants, and configuration objects
*BATCH_UI_MESSAGES, validation constants, data structures
*⚡ INITIALIZATION & EVENT BINDING (Lines 199-576)
*
*Main initialization functions, event listeners setup
*initialize(), attachEventListeners(), debouncing utilities
*📋 BATCH ENTRY OPERATIONS (Lines 3980-4291)
*
*Row creation, deletion, copying, and management
*addBatchRow(), deleteBatchRow(), copyBatchRow() functions
*💾 DATA PERSISTENCE & SAVE OPERATIONS (Lines 4291-4409)
*
*Batch data saving, validation, reset operations
*saveBatchEntry(), resetBatchEntryData() functions
*🛠️ UTILITY FUNCTIONS & HELPERS (Lines 4409-4664)
*
*Date utilities, formatting functions, helper methods
*updateCardYears() and other utility functions
*🔍 SEARCH & BUSINESS LOGIC (Lines 4664-4913)
*
*Search handlers, business logic operations
*handleSearchClick() and related functions
*🚀 GLOBAL INITIALIZATION & EVENTS (Lines 4913-5630)
*
*Global exports, window object assignments, event bootstrapping
*window.batchEntryManager exports, DOM ready handlers
*🏁 MODULE COMPLETION & LOGGING (Lines 5630+)
*
 *
 * 🔧 MAINTENANCE NOTES:
 * - All functions preserved for backward compatibility
 * - Conservative approach - no breaking changes
 * - Enhanced documentation for better navigation
 * - See Maintenance Guide at line 1680 for validation functions
 *
 * @version 2.0 - Reorganized for better maintainability
 * @since 2024-10-15 - Enhanced with unified validation system
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// 📚 1. CORE CONFIGURATION & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════

// Global data variables for budget operations
var rawData = [];
var masterData = [];

// Flag to prevent onBudgetSelectionChanged when edit button is clicked
window.isEditButtonClicked = false;

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🚀 2. INITIALIZATION & SETUP
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * 🎯 Main Batch Entry Manager Object
 * @description Central hub for all batch entry operations and validation
 */
var batchEntryManager = {
  nextRowId: 1,
  activeRows: new Map(),
  // 🧹 Simple WeakMaps for memory cleanup
  rowEventListeners: new WeakMap(),
  rowValidationState: new WeakMap(),
  rowDOMReferences: new WeakMap(),
  isInitialized: false,

  // 🔄 Copy operation flags
  isCopyingRow: false,
  copySourceRowId: null,

  // ───────────────────────────────────────────────────────────────────
  // 🔧 CORE INITIALIZATION METHODS
  // ───────────────────────────────────────────────────────────────────

  // Initialize batch entry system
  initialize: function () {
    // 🔧 FIX: Prevent double initialization
    if (this.isInitialized) {
      // console.warn('⚠️ Batch Entry Manager already initialized, skipping...');
      return;
    }

    // console.log('🚀 Initializing Batch Entry Manager...');
    this.initializeDebounced();
    this.attachEventListeners();
    this.setupGlobalBenefitsValidation();
    this.initializeModalHandlers(); // ⭐ NEW: Phase 4 - Re-Calculate Modal
    this.isInitialized = true;
    // console.log('✅ Batch Entry Manager initialized successfully');
  },

  // Initialize debounced functions (Offcanvas pattern)
  initializeDebounced: function () {
    // Create debounced versions of cascade update functions
    const DEBOUNCE_DELAY = BATCH_SYSTEM_CONFIG.timing.debounceDelay;

    this.debouncedUpdateBatchRowCostCenters = this.debounce(this.updateBatchRowCostCenters.bind(this), DEBOUNCE_DELAY);
    this.debouncedUpdateBatchRowDivisions = this.debounce(this.updateBatchRowDivisions.bind(this), DEBOUNCE_DELAY);
    this.debouncedUpdateBatchRowDepartments = this.debounce(this.updateBatchRowDepartments.bind(this), DEBOUNCE_DELAY);
    this.debouncedUpdateBatchRowSections = this.debounce(this.updateBatchRowSections.bind(this), DEBOUNCE_DELAY);
    this.debouncedUpdateBatchRowCompStore = this.debounce(this.updateBatchRowCompStore.bind(this), DEBOUNCE_DELAY);
    this.debouncedUpdateBatchRowPositions = this.debounce(this.updateBatchRowPositions.bind(this), DEBOUNCE_DELAY);
    this.debouncedUpdateBatchRowJobBands = this.debounce(this.updateBatchRowJobBands.bind(this), DEBOUNCE_DELAY);
    this.debouncedUpdateBatchRowEmployeeStatus = this.debounce(this.updateBatchRowEmployeeStatus.bind(this), DEBOUNCE_DELAY);
    this.debouncedUpdateBatchRowGroupRunRates = this.debounce(this.updateBatchRowGroupRunRates.bind(this), DEBOUNCE_DELAY);
    this.debouncedupdateBatchRowPlanCostCenters = this.debounce(this.updateBatchRowPlanCostCenters.bind(this), DEBOUNCE_DELAY);
    this.debouncedupdateBatchRowSalaryStructures = this.debounce(this.updateBatchRowSalaryStructures.bind(this), DEBOUNCE_DELAY);
    this.debouncedUpdateBatchRowEmployeeLevel = this.debounce(this.updateBatchRowEmployeeLevel.bind(this), DEBOUNCE_DELAY);

    // console.log('✅ Debounced functions initialized for Batch Entry');
  },

  // ⭐ Initialize modal event handlers (Phase 4 - Re-Calculate Modal)
  initializeModalHandlers: function () {
    const self = this;

    // Bind Re-Calculate confirmation button
    $('#confirmReCalculateBtn').off('click').on('click', function () {
      self.handleReCalculateConfirmation();
    });

    // Bind cancel button (optional - modal already handles data-bs-dismiss)
    $('#cancelReCalculateBtn').off('click').on('click', function () {
      console.log('❌ [Re-Calculate] User cancelled');
      $('#confirmReCalculateModal').modal('hide');
    });

    console.log('✅ Modal handlers initialized (Re-Calculate)');
  },

  // Debounce function implementation (from offcanvas pattern)
  debounce: function (func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Attach all event listeners for batch entry
  attachEventListeners: function () {
    const self = this;

    // 🔧 FIX: Remove existing event listeners to prevent duplicates
    this.removeExistingEventListeners();

    // Main Add Row Button (opens collapse and adds first row automatically)
    const mainAddRowBtn = document.getElementById('addRowBtn');
    if (mainAddRowBtn) {
      mainAddRowBtn.addEventListener('click', function () {
        console.log('🔀 [Batch Entry] Main button clicked');

        // ✅ Disable button during loading
        const btn = this;
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Loading...';

        // 🎯 Update year display when opening Batch Entry
        if (window.updateBudgetYearDisplay) {
          const selectedYear = document.getElementById('yearsFilter')?.value;
          if (selectedYear) {
            console.log(`🗓️ [Batch Entry] Updating year display to ${selectedYear}`);
            window.updateBudgetYearDisplay(selectedYear);
          }
        }

        // Wait for collapse to open, then add first row if no rows exist
        setTimeout(() => {
          if (self.activeRows.size === 0) {
            console.log('🎯 Auto-adding first row after opening Batch Entry...');
            self.addBatchRow()
              .then(() => {
                console.log('✅ [Batch Entry] First row created successfully');
              })
              .catch(error => {
                console.error('❌ [Batch Entry] Failed to create first row:', error);
                alert('❌ Failed to create batch entry row. Please try again.');
              })
              .finally(() => {
                // ✅ Re-enable button after row creation
                setTimeout(() => {
                  btn.disabled = false;
                  btn.innerHTML = originalText;
                  console.log('🔓 [Batch Entry Main] Button re-enabled after row creation');
                }, 500); // Small delay for better UX
              });
          } else {
            console.log(`ℹ️ [Batch Entry] ${self.activeRows.size} row(s) already exist - skipping auto-creation`);
            // ✅ Re-enable button if rows already exist (no creation needed)
            btn.disabled = false;
            btn.innerHTML = originalText;
          }
        }, 300); // Wait for collapse animation
      });
    }

    // Add Row Button (inside batch entry section)
    document.getElementById('addBatchRowBtn').addEventListener('click', function () {
      // Disable button during loading
      const btn = this;
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Adding...';

      // Add row with loading
      self.addBatchRow().finally(() => {
        // Re-enable button
        setTimeout(() => {
          btn.disabled = false;
          btn.innerHTML = originalText;
        }, 500); // Small delay for better UX
      });
    });

    // Delete Selected Rows Button
    document.getElementById('deleteBatchRowsBtn').addEventListener('click', function () {
      self.deleteSelectedRows();
    });

    // Select All Button
    document.getElementById('selectAllBatchRowsBtn').addEventListener('click', function () {
      self.selectAllRows();
    });

    // Expand/Collapse All Buttons
    document.getElementById('expandAllBatchRowsBtn').addEventListener('click', function () {
      self.expandAllRows();
    });

    document.getElementById('collapseAllBatchRowsBtn').addEventListener('click', function () {
      self.collapseAllRows();
    });

    // Cancel and Save Buttons
    document.getElementById('cancelBatchEntryBtn').addEventListener('click', function () {
      self.cancelBatchEntry();
    });

    document.getElementById('saveBatchEntryBtn').addEventListener('click', function () {
      self.saveBatchEntry();
    });

    // Validate All Button with debouncing to prevent duplicate messages
    let validateAllTimeout = null;
    document.getElementById('validateAllBtn').addEventListener('click', function () {
      console.log('🔍 Manual validation requested by user');

      // Clear any pending validation to prevent duplicate runs
      if (validateAllTimeout) {
        clearTimeout(validateAllTimeout);
        console.log('⏭️ Cancelled previous validation request (debouncing)');
      }

      // Debounce validation calls with 100ms delay
      validateAllTimeout = setTimeout(() => {
        console.log('✅ Executing validation after debounce delay');
        self.validateAllRows();
        validateAllTimeout = null;
      }, 100);
    });

    // ═══════════════════════════════════════════════════════════════════
    // ⭐ ALLOCATION BATCH ENTRY EVENT LISTENERS (NEW)
    // ═══════════════════════════════════════════════════════════════════

    console.log('🎯 Setting up Allocation Batch Entry event listeners...');

    // ⭐ NEW: Main Allocation Batch Button (Toggle Collapse + Auto-create Row 1)
    const addAllocationBatchBtn = document.getElementById('addAllocationBatchBtn');
    if (addAllocationBatchBtn) {
      addAllocationBatchBtn.addEventListener('click', function () {
        console.log('🔀 [Allocation] Main button clicked');

        // ✅ Disable button during loading
        const btn = this;
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Loading...';

        // 🎯 Update year display when opening Allocation Batch Entry
        if (window.updateBudgetYearDisplay) {
          const selectedYear = document.getElementById('yearsFilter')?.value;
          if (selectedYear) {
            console.log(`🗓️ [Allocation] Updating year display to ${selectedYear}`);
            window.updateBudgetYearDisplay(selectedYear);
          }
        }

        // Wait for collapse to open, then add Row 1 if no rows exist
        setTimeout(() => {
          // Check if any allocation rows already exist
          const existingRows = document.querySelectorAll('[data-allocation-mode="true"]');

          if (existingRows.length === 0) {
            console.log('🆕 [Allocation] No rows found - Auto-creating Row 1 (Master)...');

            // Auto-create Row 1 (Master Row)
            if (typeof AllocationBatchManager !== 'undefined') {
              AllocationBatchManager.addAllocationBatchRow()
                .then(() => {
                  console.log('✅ [Allocation] Row 1 (Master) created successfully');
                })
                .catch(error => {
                  console.error('❌ [Allocation] Failed to create Row 1:', error);
                  alert('❌ Failed to create allocation row. Please try again.');
                })
                .finally(() => {
                  // ✅ Re-enable button after row creation
                  setTimeout(() => {
                    btn.disabled = false;
                    btn.innerHTML = originalText;
                    console.log('🔓 [Allocation Main] Button re-enabled after row creation');
                  }, 500); // Small delay for better UX
                });
            } else {
              console.error('❌ AllocationBatchManager not found!');
              alert('❌ Allocation module not loaded. Please refresh the page.');
              // Re-enable button on error
              btn.disabled = false;
              btn.innerHTML = originalText;
            }
          } else {
            console.log(`ℹ️ [Allocation] ${existingRows.length} row(s) already exist - skipping auto-creation`);
            // ✅ Re-enable button if rows already exist (no creation needed)
            btn.disabled = false;
            btn.innerHTML = originalText;
          }
        }, 300); // Wait for collapse animation (same as normal batch entry)
      });

      console.log('✅ Main Allocation Batch button event listener registered');
    } else {
      console.warn('⚠️ #addAllocationBatchBtn not found in DOM');
    }

    // Add Allocation Row Button (Inside Collapse)
    document.getElementById('addAllocationRowBtn').addEventListener('click', function () {
      // Disable button during loading
      const btn = this;
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Adding...';

      // Check if AllocationBatchManager exists
      if (typeof AllocationBatchManager !== 'undefined') {
        // Call AllocationBatchManager.addAllocationBatchRow() - it returns Promise
        AllocationBatchManager.addAllocationBatchRow()
          .then((rowId) => {
            console.log(`✅ [Allocation Button] Row ${rowId} added successfully`);
          })
          .catch((error) => {
            console.error('❌ [Allocation Button] Error adding row:', error);
            alert('❌ Failed to add allocation row. Please try again.');
          })
          .finally(() => {
            // Re-enable button
            setTimeout(() => {
              btn.disabled = false;
              btn.innerHTML = originalText;
              console.log('🔓 [Allocation Button] Button re-enabled');
            }, 500); // Small delay for better UX
          });
      } else {
        console.error('❌ AllocationBatchManager not found!');
        alert('❌ Allocation module not loaded. Please refresh the page.');
        // Re-enable button on error
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    });

    // Delete Selected Allocation Rows Button
    document.getElementById('deleteAllocationRowsBtn').addEventListener('click', function () {
      const selectedRows = document.querySelectorAll('[data-allocation-mode="true"] .allocation-row-selector:checked');

      if (selectedRows.length === 0) {
        alert('⚠️ กรุณาเลือกแถวที่ต้องการลบ');
        return;
      }

      if (confirm(`คุณต้องการลบ ${selectedRows.length} แถวใช่หรือไม่?`)) {
        if (typeof AllocationBatchManager !== 'undefined') {
          selectedRows.forEach(checkbox => {
            const rowElement = checkbox.closest('[data-batch-row-id]');
            if (rowElement) {
              const rowId = rowElement.getAttribute('data-batch-row-id').replace('batch-row-', '');
              AllocationBatchManager.deleteAllocationRow(parseInt(rowId));
            }
          });
        } else {
          console.error('❌ AllocationBatchManager not found!');
          alert('❌ Allocation module not loaded. Please refresh the page.');
        }
      }
    });

    // Select All Allocation Rows Button
    document.getElementById('selectAllAllocationRowsBtn').addEventListener('click', function () {
      const checkboxes = document.querySelectorAll('[data-allocation-mode="true"] .allocation-row-selector');
      const allChecked = Array.from(checkboxes).every(cb => cb.checked);

      checkboxes.forEach(checkbox => {
        checkbox.checked = !allChecked;
      });

      // Update delete button state
      if (deleteAllocationRowsBtn) {
        deleteAllocationRowsBtn.disabled = !document.querySelector('[data-allocation-mode="true"] .allocation-row-selector:checked');
      }
    });

    // Expand All Allocation Rows Button
    document.getElementById('expandAllAllocationRowsBtn').addEventListener('click', function () {
      const allocationRows = document.querySelectorAll('[data-allocation-mode="true"] .accordion-collapse');
      allocationRows.forEach(collapse => {
        const bsCollapse = coreui.Collapse.getInstance(collapse) || new coreui.Collapse(collapse, { toggle: false });
        bsCollapse.show();
      });
    });

    // Collapse All Allocation Rows Button
    document.getElementById('collapseAllAllocationRowsBtn').addEventListener('click', function () {
      const allocationRows = document.querySelectorAll('[data-allocation-mode="true"] .accordion-collapse');
      allocationRows.forEach(collapse => {
        const bsCollapse = coreui.Collapse.getInstance(collapse) || new coreui.Collapse(collapse, { toggle: false });
        bsCollapse.hide();
      });
    });

    // CAL ทั้งหมด Button (Calculate All Allocation Rows)
    document.getElementById('calAllAllocationBtn').addEventListener('click', function () {
      if (typeof AllocationBatchManager !== 'undefined') {
        // Call async function
        Promise.resolve(AllocationBatchManager.calculateAllAllocationRows()).catch(error => {
          console.error('❌ Error calculating allocation rows:', error);
          alert('❌ เกิดข้อผิดพลาดในการคำนวณ');
        });
      } else {
        console.error('❌ AllocationBatchManager not found!');
        alert('❌ Allocation module not loaded. Please refresh the page.');
      }
    });

    // Cancel Allocation Batch Button
    document.getElementById('cancelAllocationBatchBtn').addEventListener('click', function () {
      if (confirm('คุณต้องการยกเลิกและลบข้อมูลทั้งหมดใช่หรือไม่?')) {
        if (typeof AllocationBatchManager !== 'undefined') {
          AllocationBatchManager.clearAllAllocationRows();

          // Close collapse
          const collapseElement = document.getElementById('allocationBatchCollapse');
          if (collapseElement && coreui.Collapse) {
            const collapse = coreui.Collapse.getInstance(collapseElement);
            if (collapse) {
              collapse.hide();
            }
          }
        } else {
          console.error('❌ AllocationBatchManager not found!');
          alert('❌ Allocation module not loaded. Please refresh the page.');
        }
      }
    });

    // Validate Allocation Button
    document.getElementById('validateAllocationBtn').addEventListener('click', function () {
      if (typeof AllocationBatchManager !== 'undefined') {
        AllocationBatchManager.validateAllocationRealtime();
      } else {
        console.error('❌ AllocationBatchManager not found!');
        alert('❌ Allocation module not loaded. Please refresh the page.');
      }
    });

    // Save Allocation Batch Button
    document.getElementById('saveAllocationBatchBtn').addEventListener('click', function () {
      // Disable button during save
      const btn = this;
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';

      if (typeof AllocationBatchManager !== 'undefined') {
        // Call async save function
        Promise.resolve(AllocationBatchManager.saveAllocationBatch()).finally(() => {
          // Re-enable button
          setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = originalText;
          }, 1000); // Longer delay for save operation
        });
      } else {
        console.error('❌ AllocationBatchManager not found!');
        alert('❌ Allocation module not loaded. Please refresh the page.');
        // Re-enable button on error
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    });

    // Listen to allocation row selector changes to update delete button
    $(document).on('change', '[data-allocation-mode="true"] .allocation-row-selector', function () {
      const deleteBtn = document.getElementById('deleteAllocationRowsBtn');
      if (deleteBtn) {
        const hasChecked = document.querySelector('[data-allocation-mode="true"] .allocation-row-selector:checked');
        deleteBtn.disabled = !hasChecked;
      }
    });

    console.log('✅ Allocation Batch Entry event listeners setup complete');

  },

  // ═══════════════════════════════════════════════════════════════════════════════════════
  // 📋 3. BATCH ENTRY OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════════════════

  // ───────────────────────────────────────────────────────────────────
  // ➕ ROW CREATION & MANAGEMENT
  // ───────────────────────────────────────────────────────────────────

  // Add new batch row
  addBatchRow: function () {
    return new Promise((resolve, reject) => {
      console.log('➕ Adding new batch row...');

      // 🔄 Show loading for batch entry
      this.showBatchEntryLoading(BATCH_UI_MESSAGES.loading.addingRow);

      const template = document.getElementById('batchEntryRowTemplate');
      const accordion = document.getElementById('batchEntryAccordion');
      const noRowsMessage = document.getElementById('noBatchRowsMessage');

      if (!template || !accordion) {
        console.error('❌ Template or accordion container not found');
        this.hideBatchEntryLoading();
        reject(new Error('Template or accordion container not found'));
        return;
      }

      // Clone template
      const rowClone = template.content.cloneNode(true);
      const rowElement = rowClone.querySelector('.accordion-item');

      if (!rowElement) {
        console.error('❌ Failed to find .accordion-item in template');
        this.hideBatchEntryLoading();
        reject(new Error('Failed to find .accordion-item in template'));
        return;
      }

      // Set unique IDs
      const rowId = `batch-row-${this.nextRowId}`;
      const collapseId = `collapse-${rowId}`;

      rowElement.setAttribute('data-batch-row-id', rowId);

      // Update accordion button and collapse targets
      const accordionButton = rowElement.querySelector('.accordion-button');
      const accordionCollapse = rowElement.querySelector('.accordion-collapse');

      if (accordionButton) {
        accordionButton.setAttribute('data-coreui-target', `#${collapseId}`);
        accordionButton.setAttribute('aria-controls', collapseId);
      }

      if (accordionCollapse) {
        accordionCollapse.setAttribute('id', collapseId);
      }

      // Update row number
      const rowNumber = rowElement.querySelector('.batch-row-number');
      if (rowNumber) {
        rowNumber.textContent = this.nextRowId;
      }

      // Update form element names to be unique
      this.updateFormElementNames(rowElement, rowId);

      // Attach row-specific event listeners
      this.attachRowEventListeners(rowElement, rowId);

      // Hide no rows message
      if (noRowsMessage) {
        noRowsMessage.style.display = 'none';
      }

      // Add to accordion
      accordion.appendChild(rowElement);

      // Store row data
      this.activeRows.set(rowId, {
        element: rowElement,
        data: {},
        isValid: false
      });

      // Update counter
      this.updateRowCounter();

      // 🔄 Update loading message
      this.updateBatchEntryLoadingMessage(BATCH_UI_MESSAGES.loading.loadingDropdowns);

      // Populate dropdowns for this row and wait for completion
      this.populateRowDropdownsAsync(rowId).then(() => {
        // 🔄 Update loading message
        this.updateBatchEntryLoadingMessage('Finalizing row setup...');

        // Expand the new row
        setTimeout(() => {
          const collapseElement = document.getElementById(collapseId);
          if (collapseElement) {
            new coreui.Collapse(collapseElement).show();
          }

          // 🆕 Initialize Benefits Templates for new row (if company pre-selected)
          setTimeout(() => {
            // ✅ Skip auto-init if copy operation is in progress
            if (this.isCopyingRow) {
              console.log(`⏸️ [Copy Mode] Skipping auto-init benefits template - will be handled by copy operation`);
              return;
            }

            const rowElement = document.querySelector(`[data-batch-row-id="${rowId}"]`);
            const companySelect = rowElement?.querySelector('.batch-company');
            const companyID = companySelect?.value;

            if (companyID && window.generateBatchTemplatesForCompany) {
              // ⚡ CRITICAL: Extract numeric index from rowId (batch-row-1 → 1)
              const rowIndex = parseInt(rowId.replace('batch-row-', ''));
              console.log(`🏗️ [Batch Benefits] Auto-initializing for company ${companyID}, row ${rowId} (index: ${rowIndex})`);
              window.generateBatchTemplatesForCompany(companyID, rowIndex);
            }
          }, 1000); // Wait for dropdowns to settle

          // 🎯 Update year display labels in new row
          if (window.updateBudgetYearDisplay) {
            const selectedYear = document.getElementById('yearsFilter')?.value;
            if (selectedYear) {
              console.log(`🗓️ [Batch Row ${rowId}] Updating year display to ${selectedYear}`);
              window.updateBudgetYearDisplay(selectedYear);
            }
          }

          // 🔧 Initialize validation system for new row
          setTimeout(() => {
            const newRowElement = document.querySelector(`[data-batch-row-id="${rowId}"]`);
            if (newRowElement && this.batchValidator) {
              console.log(`⚡ Initializing validation for row ${rowId}`);
              this.batchValidator.initializeRowValidation(newRowElement, rowId);
            }
          }, 100);

          // ✅ Hide loading when everything is ready
          setTimeout(() => {
            this.hideBatchEntryLoading();
            console.log(`✅ Batch row ${rowId} ready for use`);
            resolve(rowId);
          }, 300); // Small delay for smooth UX

        }, 100);
      }).catch(error => {
        console.error('❌ Error populating row dropdowns:', error);
        this.hideBatchEntryLoading();
        reject(error);
      });

      this.nextRowId++;
      console.log(`✅ Batch row ${rowId} created, waiting for dropdowns...`);
    });
  },

  // Update form element names to be unique
  updateFormElementNames: function (rowElement, rowId) {
    const formElements = rowElement.querySelectorAll('input, select, textarea');
    formElements.forEach(element => {
      if (element.name) {
        element.name = `${rowId}_${element.name}`;
      }
      if (element.id && element.id.startsWith('batch-')) {
        element.id = `${rowId}_${element.id}`;
      }
    });
  },

  // Attach event listeners for individual row
  attachRowEventListeners: function (rowElement, rowId) {
    const self = this;

    // Row selector checkbox
    const checkbox = rowElement.querySelector('.batch-row-selector');
    if (checkbox) {
      checkbox.addEventListener('change', function () {
        self.updateDeleteButtonState();

        // 🎯 Trigger unified validation immediately when checkbox is clicked (SA Request)
        console.log(`🔄 Checkbox clicked for ${rowId}, triggering immediate unified validation`);
        self.validateRow(rowId);
      });
    }

    // 🆕 Company dropdown change - Update COBU label
    const companySelect = rowElement.querySelector('.batch-company');
    if (companySelect) {
      companySelect.addEventListener('change', function () {
        const companyID = this.value;
        if (companyID) {
          console.log(`🏢 Company changed to ${companyID} for ${rowId}`);

          // Update COBU label for this specific row
          const companyIdInt = parseInt(companyID);
          const isBJC = companyIdInt === 1;
          const labelText = isBJC ? 'COBU' : 'Format';
          const selectText = isBJC ? 'Select COBU' : 'Select Format';

          const batchLabelText = rowElement.querySelector('.batch-cobu-label-text');
          if (batchLabelText) {
            batchLabelText.textContent = labelText;
          }

          const batchAllOption = rowElement.querySelector('.batch-cobu-all-option');
          if (batchAllOption) {
            batchAllOption.textContent = selectText;
          }

          console.log(`✅ COBU label updated to "${labelText}" for ${rowId}`);
        }
      });
    }

    // Delete row button
    const deleteBtn = rowElement.querySelector('.delete-batch-row-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', function () {
        self.deleteBatchRow(rowId);
      });
    }

    // Row action buttons
    const copyBtn = rowElement.querySelector('.batch-copy-row-btn');
    const headerCopyBtn = rowElement.querySelector('.batch-copy-row-btn-header');

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        console.log(`🖱️ Copy button clicked for row ${rowId}`);
        self.copyBatchRow(rowId);
      });
    } else {
      console.warn(`⚠️ Copy button not found for row ${rowId}`);
    }

    if (headerCopyBtn) {
      headerCopyBtn.addEventListener('click', function () {
        console.log(`🖱️ Header Copy button clicked for row ${rowId}`);
        self.copyBatchRow(rowId);
      });
    } else {
      console.warn(`⚠️ Header Copy button not found for row ${rowId}`);
    }

    // Form field change events for validation with Enhanced UI
    const formFields = rowElement.querySelectorAll('input, select, textarea');
    formFields.forEach(field => {
      // Real-time validation on blur and change
      const triggerValidation = function () {
        console.log('🔄 Field validation triggered:', field.className, field.value);

        // Enhanced real-time validation (field-level only)
        if (self.batchValidator && typeof self.batchValidator.validateFieldRealTime === 'function') {
          self.batchValidator.validateFieldRealTime(field, rowId);
        }

        // ✅ Row validation removed - Use "Validate All" button or Checkbox click instead
      };

      field.addEventListener('change', triggerValidation);
      field.addEventListener('blur', triggerValidation);

      // Special handling for Benefits fields (dynamic forms)
      if (field.id && (field.id.startsWith('editLe') || field.id.startsWith('editBg'))) {
        console.log('🏗️ Adding enhanced validation for benefits field:', field.id);
        field.addEventListener('input', function () {
          // Debounce input validation for performance
          clearTimeout(field.validationTimer);
          field.validationTimer = setTimeout(triggerValidation, 300);
        });
      }
    });
  },

  // 🔧 NEW: Async version of populateRowDropdowns that returns Promise
  populateRowDropdownsAsync: function (rowId) {
    return new Promise((resolve, reject) => {
      console.log(`📋 Populating dropdowns async for ${rowId}...`);

      const rowElement = document.querySelector(`[data-batch-row-id="${rowId}"]`);
      if (!rowElement) {
        reject(new Error('Row element not found'));
        return;
      }

      // Get main filter values
      const selectedCompany = document.getElementById('companyFilter')?.value;
      const selectedYear = document.getElementById('yearsFilter')?.value;
      const selectedCobu = document.getElementById('cobuFilter')?.value;
      const selectedCostCenter = document.getElementById('costcenterFilter')?.value;
      const selectedDivision = document.getElementById('divisionFilter')?.value;
      const selectedDepartment = document.getElementById('departmentFilter')?.value;
      const selectedSection = document.getElementById('sectionFilter')?.value;
      const selectedCompStore = document.getElementById('compstoreFilter')?.value;
      const selectedPosition = document.getElementById('positionFilter')?.value;
      const selectedJobBand = document.getElementById('jobbandFilter')?.value;

      // 🎯 Step 1: Populate PRIMARY dropdowns with Promise chain
      this.populatePrimaryDropdownsAsync(rowElement, rowId, selectedCompany, selectedYear, selectedCobu, selectedCostCenter, selectedDivision, selectedDepartment, selectedSection, selectedCompStore, selectedPosition, selectedJobBand)
        .then(() => {
          console.log(`✅ Primary dropdowns completed for ${rowId}`);

          // 🎯 Step 2: Setup cascading relationships
          this.setupBatchRowCascadingRelationships(rowElement, rowId);

          // 🎯 Step 3: Populate static dropdowns
          return this.populateStaticDropdownsAsync(rowElement);
        })
        .then(() => {
          console.log(`✅ All dropdowns completed for ${rowId}`);

          // 🎯 NEW: Set default values for Focus HC, Focus PE, Join PVF
          this.setDefaultBatchRowValues(rowElement, rowId);

          // 🎯 Initial unified validation after row setup
          // setTimeout(() => {
          //   console.log(`🔄 Performing initial unified validation for ${rowId}`);
          //   this.validateRow(rowId);
          // }, 200);

          resolve();
        })
        .catch(error => {
          console.error(`❌ Error populating dropdowns for ${rowId}:`, error);
          reject(error);
        });
    });
  },

  // 🎯 NEW: Set default values for new batch row (Focus HC, Focus PE, Join PVF)
  setDefaultBatchRowValues: function (rowElement, rowId) {
    console.log(`🎯 Setting default values for ${rowId}...`);

    try {
      // 1. Focus Headcount = "Y" (Yes)
      const focusHcSelect = rowElement.querySelector('.batch-focus-hc');
      if (focusHcSelect) {
        focusHcSelect.value = 'Y';
        $(focusHcSelect).trigger('change');
        console.log(`  ✅ Focus HC set to "Y" (Yes)`);
      } else {
        console.warn(`  ⚠️ Focus HC dropdown not found for ${rowId}`);
      }

      // 2. Focus Personnel Expense = "Y" (Yes)
      const focusPeSelect = rowElement.querySelector('.batch-focus-pe');
      if (focusPeSelect) {
        focusPeSelect.value = 'Y';
        $(focusPeSelect).trigger('change');
        console.log(`  ✅ Focus PE set to "Y" (Yes)`);
      } else {
        console.warn(`  ⚠️ Focus PE dropdown not found for ${rowId}`);
      }

      // 3. Join PVF = "0" (Never Joined)
      const joinPvfSelect = rowElement.querySelector('.batch-join-pvf');
      if (joinPvfSelect) {
        joinPvfSelect.value = '0';
        $(joinPvfSelect).trigger('change');
        console.log(`  ✅ Join PVF set to "0" (Never Joined)`);
      } else {
        console.warn(`  ⚠️ Join PVF dropdown not found for ${rowId}`);
      }

      console.log(`✅ Default values set successfully for ${rowId}`);
    } catch (error) {
      console.error(`❌ Error setting default values for ${rowId}:`, error);
    }
  },

  // 🔧 FIX: Remove existing event listeners to prevent duplicates
  removeExistingEventListeners: function () {
    // console.log('🧹 Removing existing event listeners...');

    // Remove main batch entry button listeners
    const mainAddRowBtn = document.getElementById('addRowBtn');
    if (mainAddRowBtn) {
      // Clone node to remove all event listeners
      const newMainAddRowBtn = mainAddRowBtn.cloneNode(true);
      mainAddRowBtn.parentNode.replaceChild(newMainAddRowBtn, mainAddRowBtn);
    }

    const addBatchRowBtn = document.getElementById('addBatchRowBtn');
    if (addBatchRowBtn) {
      const newAddBatchRowBtn = addBatchRowBtn.cloneNode(true);
      addBatchRowBtn.parentNode.replaceChild(newAddBatchRowBtn, addBatchRowBtn);
    }

    // Remove other button listeners
    const buttonIds = [
      'deleteBatchRowsBtn', 'selectAllBatchRowsBtn', 'expandAllBatchRowsBtn',
      'collapseAllBatchRowsBtn', 'cancelBatchEntryBtn', 'saveBatchEntryBtn'
    ];

    buttonIds.forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
      }
    });

    // console.log('✅ Existing event listeners removed');
  },

  // Setup global validation for benefits fields that are added dynamically
  setupGlobalBenefitsValidation: function () {
    const self = this;
    // console.log('🌐 Setting up global benefits validation...');

    // Use event delegation to handle dynamically added benefits fields
    document.addEventListener('blur', function (event) {
      const field = event.target;

      // Check if it's a benefits field
      if (field.id && (field.id.startsWith('editLe') || field.id.startsWith('editBg'))) {
        // console.log('🔄 Global blur validation for benefits field:', field.id, field.value);

        // Find the row ID
        const rowElement = field.closest('[data-batch-row-id]');
        const rowId = rowElement ? rowElement.getAttribute('data-batch-row-id') : null;

        // Apply validation
        if (self.batchValidator && typeof self.batchValidator.validateFieldRealTime === 'function') {
          self.batchValidator.validateFieldRealTime(field, rowId);
        }
      }
    }, true); // Use capture to ensure we get the events

    document.addEventListener('change', function (event) {
      const field = event.target;

      // Check if it's a benefits field
      if (field.id && (field.id.startsWith('editLe') || field.id.startsWith('editBg'))) {
        // console.log('🔄 Global change validation for benefits field:', field.id, field.value);

        // Find the row ID
        const rowElement = field.closest('[data-batch-row-id]');
        const rowId = rowElement ? rowElement.getAttribute('data-batch-row-id') : null;

        // Apply validation
        if (self.batchValidator && typeof self.batchValidator.validateFieldRealTime === 'function') {
          self.batchValidator.validateFieldRealTime(field, rowId);
        }
      }
    }, true); // Use capture to ensure we get the events

    // console.log('✅ Global benefits validation setup completed');
  },

  // ═══════════════════════════════════════════════════════════════════════════════════════
  // 🎨 3. UI MANAGEMENT & FEEDBACK
  // ═══════════════════════════════════════════════════════════════════════════════════════

  // ───────────────────────────────────────────────────────────────────
  // 🔧 LOADING & FEEDBACK METHODS
  // ───────────────────────────────────────────────────────────────────

  // 🔧 NEW: Show batch entry loading overlay
  showBatchEntryLoading: function (message = BATCH_UI_MESSAGES.loading.addingRow) {
    const batchSection = document.getElementById('batchEntryCollapse');
    if (!batchSection) return;

    // Create loading overlay if it doesn't exist
    let loadingOverlay = batchSection.querySelector('.batch-entry-loading-overlay');
    if (!loadingOverlay) {
      loadingOverlay = document.createElement('div');
      loadingOverlay.className = 'batch-entry-loading-overlay position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center';
      loadingOverlay.style.cssText = `
        background-color: rgba(255, 255, 255, 0.9);
        z-index: 1050;
        backdrop-filter: blur(2px);
      `;

      loadingOverlay.innerHTML = `
        <div class="text-center">
          <div class="spinner-border text-primary mb-3" role="status" style="width: 3rem; height: 3rem;">
            <span class="visually-hidden">Loading...</span>
          </div>
          <div class="fw-medium text-primary batch-loading-text">${message}</div>
          <div class="small text-muted mt-1">Please wait...</div>
        </div>
      `;

      // Make batch section relative for absolute positioning
      if (batchSection.style.position !== 'relative') {
        batchSection.style.position = 'relative';
      }

      batchSection.appendChild(loadingOverlay);
    } else {
      // Update message
      const textElement = loadingOverlay.querySelector('.batch-loading-text');
      if (textElement) {
        textElement.textContent = message;
      }
      loadingOverlay.classList.remove('d-none');
    }

    // console.log(`🔄 Batch Entry Loading: ${message}`);
  },

  // 🔧 NEW: Hide batch entry loading overlay
  hideBatchEntryLoading: function () {
    const loadingOverlay = document.querySelector('.batch-entry-loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.classList.add('d-none');
      // console.log('✅ Batch Entry Loading hidden');
    }
  },

  // 🔧 NEW: Update batch entry loading message
  updateBatchEntryLoadingMessage: function (message) {
    const loadingOverlay = document.querySelector('.batch-entry-loading-overlay');
    if (loadingOverlay) {
      const textElement = loadingOverlay.querySelector('.batch-loading-text');
      if (textElement) {
        textElement.textContent = message;
        // console.log(`📝 Loading message updated: ${message}`);
      }
    }
  },

  // ⭐ NEW: Show allocation loading overlay (Allocation-specific)
  showAllocationLoading: function (message = 'Adding allocation row...') {
    const allocationSection = document.getElementById('allocationBatchCollapse');
    if (!allocationSection) return;

    // Create loading overlay if it doesn't exist
    let loadingOverlay = allocationSection.querySelector('.allocation-loading-overlay');
    if (!loadingOverlay) {
      loadingOverlay = document.createElement('div');
      loadingOverlay.className = 'allocation-loading-overlay position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center';
      loadingOverlay.style.cssText = `
        background-color: rgba(255, 255, 255, 0.9);
        z-index: 1050;
        backdrop-filter: blur(2px);
      `;

      loadingOverlay.innerHTML = `
        <div class="text-center">
          <div class="spinner-border text-warning mb-3" role="status" style="width: 3rem; height: 3rem;">
            <span class="visually-hidden">Loading...</span>
          </div>
          <div class="fw-medium text-warning allocation-loading-text">${message}</div>
          <div class="small text-muted mt-1">Please wait...</div>
        </div>
      `;

      // Make allocation section relative for absolute positioning
      if (allocationSection.style.position !== 'relative') {
        allocationSection.style.position = 'relative';
      }

      allocationSection.appendChild(loadingOverlay);
    } else {
      // Update message
      const textElement = loadingOverlay.querySelector('.allocation-loading-text');
      if (textElement) {
        textElement.textContent = message;
      }
      loadingOverlay.classList.remove('d-none');
    }

    console.log(`🔄 [Allocation] Loading: ${message}`);
  },

  // ⭐ NEW: Hide allocation loading overlay
  hideAllocationLoading: function () {
    const loadingOverlay = document.querySelector('.allocation-loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.classList.add('d-none');
      console.log('✅ [Allocation] Loading hidden');
    }
  },

  // ⭐ NEW: Update allocation loading message
  updateAllocationLoadingMessage: function (message) {
    const loadingOverlay = document.querySelector('.allocation-loading-overlay');
    if (loadingOverlay) {
      const textElement = loadingOverlay.querySelector('.allocation-loading-text');
      if (textElement) {
        textElement.textContent = message;
        console.log(`📝 [Allocation] Loading message updated: ${message}`);
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════════════════
  // 🔄 4. DROPDOWN & CASCADE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════════════════

  // ───────────────────────────────────────────────────────────────────
  // 🔧 ASYNC DROPDOWN POPULATION METHODS
  // ───────────────────────────────────────────────────────────────────

  // 🔧 NEW: Async version of populateDropdown that returns Promise
  populateDropdownAsync: function (selectElement, apiUrl, defaultText, optionCallback) {
    return new Promise((resolve, reject) => {
      if (!selectElement) {
        //console.log(`❌ [DROPDOWN DEBUG] Select element not found for dropdown: ${defaultText}`);
        reject(new Error('Select element not found'));
        return;
      }

      //console.log(`🌐 [API DEBUG] Calling URL: ${apiUrl}`);
      //console.log(`🔄 Populating dropdown async: ${selectElement.className}`);

      fetch(apiUrl)
        .then(res => {
          if (!res.ok) {
            //console.log(`❌ [API ERROR] HTTP ${res.status} for URL: ${apiUrl}`);
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          //console.log(`✅ [API SUCCESS] Response OK for URL: ${apiUrl}`);
          return res.json();
        })
        .then(response => {
          // Handle both array and { success, data } wrapper format
          const data = Array.isArray(response) ? response : (response.data || []);

          // Clear and populate options
          selectElement.innerHTML = `<option value="">${defaultText}</option>`;
          data.forEach(item => {
            const option = document.createElement('option');
            if (optionCallback) {
              optionCallback(option, item);
            } else {
              option.value = item;
              option.textContent = item;
            }
            selectElement.appendChild(option);
          });

          const $select = $(selectElement);

          // Handle Select2 initialization if available
          if (typeof $select.select2 === 'function') {
            // Find parent container for dropdownParent
            const $parent = $select.closest('.card-body');
            const dropdownParent = $parent.length ? $parent : null;

            // Destroy existing Select2 if any
            if ($select.data('select2')) {
              try { $select.select2('destroy'); } catch (_) { }
            }

            // Initialize Select2
            $select.select2({
              placeholder: defaultText,
              allowClear: true,
              width: '100%',
              dropdownParent: dropdownParent
            });

            // Wait for Select2 to be fully initialized
            setTimeout(() => {
              resolve(data);
            }, 100);
          } else {
            // Regular select - resolve immediately
            $select.trigger('change');
            resolve(data);
          }
        })
        .catch(error => {
          //console.log(`❌ [API ERROR] Failed to fetch from URL: ${apiUrl}`);
          //console.log(`❌ [DROPDOWN DEBUG] Element: ${selectElement?.name || selectElement?.className || 'unknown'}, Error: ${error.message}`);
          console.error(`❌ Error fetching data for dropdown:`, error);
          reject(error);
        });
    });
  },

  // 🔧 NEW: Async version of populatePrimaryDropdowns
  populatePrimaryDropdownsAsync: function (rowElement, rowId, _companyID, _budgetYear, _coBu, _costCenter, _division, _department, _section, _compStore, _position, _jobBand) {
    const self = this;

    return new Promise((resolve, reject) => {
      const promises = [];

      // Company dropdown - async
      const companySelect = rowElement.querySelector('.batch-company');
      console.log(`batch-company companySelect:`, companySelect?.name, 'preselect:', _companyID);
      if (companySelect) {
        const companyPromise = this.populateDropdownAsync(companySelect, BUDGET_API.companies, FIELD_CONFIGURATIONS.dropdownPlaceholders.company, (option, item) => {
          option.value = item.companyId;
          option.textContent = item.companyCode;
        }).then(() => {
          // Pre-select AFTER dropdown is fully populated
          if (_companyID) {
            console.log(`🔧 Setting company value: ${_companyID}`);

            const $companySelect = $(companySelect);
            if ($companySelect.find(`option[value="${_companyID}"]`).length > 0) {
              if ($companySelect.data('select2')) {
                $companySelect.val(_companyID).trigger('change.select2');
                // ⚡ CRITICAL: Don't trigger change.batch if copy is in progress
                if (!this.isCopyingRow) {
                  $companySelect.trigger('change.batch');
                } else {
                  console.log(`⏸️ [Copy Mode] Skipping auto-init for company ${_companyID}`);
                }
              } else {
                companySelect.value = _companyID;
                if (!this.isCopyingRow) {
                  $companySelect.trigger('change.batch');
                } else {
                  console.log(`⏸️ [Copy Mode] Skipping auto-init for company ${_companyID}`);
                }
              }
              $('.batch-company').prop('disabled', true);
              console.log(`✅ Company set successfully: ${_companyID}`);
            } else {
              console.warn(`❌ Company option not found: ${_companyID}`);
            }
          }
        });
        promises.push(companyPromise);
      }

      // Year dropdown - async
      const yearSelect = rowElement.querySelector('.batch-year');
      if (yearSelect) {
        let yearParams = [];
        if (_companyID) yearParams.push(`companyID=${_companyID}`);
        const yearQuery = yearParams.length ? `?${yearParams.join('&')}` : '';

        const yearPromise = this.populateDropdownAsync(yearSelect, `${BUDGET_API.budgetYears}${yearQuery}`, FIELD_CONFIGURATIONS.dropdownPlaceholders.year, (option, item) => {
          option.value = item;
          option.textContent = item;
        }).then(() => {
          if (_budgetYear) {
            console.log(`🔧 Setting year value: ${_budgetYear}`);

            const $yearSelect = $(yearSelect);
            if ($yearSelect.find(`option[value="${_budgetYear}"]`).length > 0) {
              if ($yearSelect.data('select2')) {
                $yearSelect.val(_budgetYear).trigger('change.select2').trigger('change.batch');
              } else {
                yearSelect.value = _budgetYear;
                $yearSelect.trigger('change.batch');
              }
              $('.batch-year').prop('disabled', true);
              console.log(`✅ Year set successfully: ${_budgetYear}`);
            } else {
              console.warn(`❌ Year option not found: ${_budgetYear}`);
            }
          }
        });
        promises.push(yearPromise);
      }

      // COBU dropdown - async
      const cobuSelect = rowElement.querySelector('.batch-cobu');
      if (cobuSelect) {
        let cobuParams = [];
        if (_companyID) cobuParams.push(`companyID=${_companyID}`);
        if (_budgetYear) cobuParams.push(`budgetYear=${encodeURIComponent(_budgetYear)}`);
        const cobuQuery = cobuParams.length ? `?${cobuParams.join('&')}` : '';

        const cobuPromise = this.populateDropdownAsync(cobuSelect, `${BUDGET_API.cobu}${cobuQuery}`, 'Select COBU/Format', (option, item) => {
          option.value = item;
          option.textContent = item;
        }).then(() => {
          if (_coBu) {
            console.log(`🔧 Setting COBU value: ${_coBu}`);

            const $cobuSelect = $(cobuSelect);
            if ($cobuSelect.find(`option[value="${_coBu}"]`).length > 0) {
              if ($cobuSelect.data('select2')) {
                $cobuSelect.val(_coBu).trigger('change.select2').trigger('change.batch');
              } else {
                cobuSelect.value = _coBu;
                $cobuSelect.trigger('change.batch');
              }
              console.log(`✅ COBU set successfully: ${_coBu}`);
            } else {
              console.warn(`❌ COBU option not found: ${_coBu}`);
            }
          }
        });
        promises.push(cobuPromise);
      }

      // 🚀 NEW: Add cascade dropdowns as Primary dropdowns (SA Request)
      if (_companyID) {
        // Cost Centers - Primary
        const costCenterSelect = rowElement.querySelector('.batch-cost-center');
        if (costCenterSelect) {
          let costCenterParams = [];
          if (_companyID) costCenterParams.push(`companyID=${_companyID}`);
          if (_coBu) costCenterParams.push(`Cobu=${encodeURIComponent(_coBu)}`);
          if (_budgetYear) costCenterParams.push(`budgetYear=${encodeURIComponent(_budgetYear)}`);
          const costCenterQuery = costCenterParams.length ? `?${costCenterParams.join('&')}` : '';

          const costCenterPromise = this.populateDropdownAsync(costCenterSelect, `${BUDGET_API.costCenters}${costCenterQuery}`, FIELD_CONFIGURATIONS.dropdownPlaceholders.costCenter, (option, item) => {
            option.value = item.costCenterCode;
            option.textContent = `${item.costCenterName} (${item.costCenterCode})`;
          }).then(() => {
            if (_costCenter) {
              console.log(`🔧 Setting cost center value: ${_costCenter}`);

              const $costCenterSelect = $(costCenterSelect);
              if ($costCenterSelect.find(`option[value="${_costCenter}"]`).length > 0) {
                if ($costCenterSelect.data('select2')) {
                  $costCenterSelect.val(_costCenter).trigger('change.select2').trigger('change.batch');
                } else {
                  costCenterSelect.value = _costCenter;
                  $costCenterSelect.trigger('change.batch');
                }
                console.log(`✅ Cost center set successfully: ${_costCenter}`);
              } else {
                console.warn(`❌ Cost center option not found: ${_costCenter}`);
              }
            }
          });
          promises.push(costCenterPromise);
        }

        // Divisions - Primary
        const divisionSelect = rowElement.querySelector('.batch-division');
        if (divisionSelect) {
          let divisionParams = [];
          if (_companyID) divisionParams.push(`companyID=${_companyID}`);
          if (_coBu) divisionParams.push(`Cobu=${encodeURIComponent(_coBu)}`);
          if (_budgetYear) divisionParams.push(`budgetYear=${encodeURIComponent(_budgetYear)}`);
          if (_costCenter) divisionParams.push(`costCenterCode=${encodeURIComponent(_costCenter)}`);
          const divisionQuery = divisionParams.length ? `?${divisionParams.join('&')}` : '';

          const divisionPromise = this.populateDropdownAsync(divisionSelect, `${BUDGET_API.divisions}${divisionQuery}`, FIELD_CONFIGURATIONS.dropdownPlaceholders.division, (option, item) => {
            option.value = item;
            option.textContent = item;
          }).then(() => {
            if (_division) {
              console.log(`🔧 Setting division value: ${_division}`);

              const $divisionSelect = $(divisionSelect);
              if ($divisionSelect.find(`option[value="${_division}"]`).length > 0) {
                if ($divisionSelect.data('select2')) {
                  $divisionSelect.val(_division).trigger('change.select2').trigger('change.batch');
                } else {
                  divisionSelect.value = _division;
                  $divisionSelect.trigger('change.batch');
                }
                console.log(`✅ Division set successfully: ${_division}`);
              } else {
                console.warn(`❌ Division option not found: ${_division}`);
              }
            }
          });
          promises.push(divisionPromise);
        }

        // Departments - Primary
        const departmentSelect = rowElement.querySelector('.batch-department');
        if (departmentSelect) {
          let departmentParams = [];
          if (_companyID) departmentParams.push(`companyID=${_companyID}`);
          if (_coBu) departmentParams.push(`Cobu=${encodeURIComponent(_coBu)}`);
          if (_budgetYear) departmentParams.push(`budgetYear=${encodeURIComponent(_budgetYear)}`);
          if (_costCenter) departmentParams.push(`costCenterCode=${encodeURIComponent(_costCenter)}`);
          if (_division) departmentParams.push(`divisionCode=${encodeURIComponent(_division)}`);
          const departmentQuery = departmentParams.length ? `?${departmentParams.join('&')}` : '';

          const departmentPromise = this.populateDropdownAsync(departmentSelect, `${BUDGET_API.departments}${departmentQuery}`, FIELD_CONFIGURATIONS.dropdownPlaceholders.department, (option, item) => {
            option.value = item;
            option.textContent = item;
          }).then(() => {
            if (_department) {
              console.log(`🔧 Setting department value: ${_department}`);

              const $departmentSelect = $(departmentSelect);
              if ($departmentSelect.find(`option[value="${_department}"]`).length > 0) {
                if ($departmentSelect.data('select2')) {
                  $departmentSelect.val(_department).trigger('change.select2').trigger('change.batch');
                } else {
                  departmentSelect.value = _department;
                  $departmentSelect.trigger('change.batch');
                }
                console.log(`✅ Department set successfully: ${_department}`);
              } else {
                console.warn(`❌ Department option not found: ${_department}`);
              }
            }
          });
          promises.push(departmentPromise);
        }

        // Sections - Primary
        const sectionSelect = rowElement.querySelector('.batch-section');
        if (sectionSelect) {
          let sectionParams = [];
          if (_companyID) sectionParams.push(`companyID=${_companyID}`);
          if (_coBu) sectionParams.push(`Cobu=${encodeURIComponent(_coBu)}`);
          if (_budgetYear) sectionParams.push(`budgetYear=${encodeURIComponent(_budgetYear)}`);
          if (_costCenter) sectionParams.push(`costCenterCode=${encodeURIComponent(_costCenter)}`);
          if (_division) sectionParams.push(`divisionCode=${encodeURIComponent(_division)}`);
          if (_department) sectionParams.push(`departmentCode=${encodeURIComponent(_department)}`);
          const sectionQuery = sectionParams.length ? `?${sectionParams.join('&')}` : '';

          const sectionPromise = this.populateDropdownAsync(sectionSelect, `${BUDGET_API.sections}${sectionQuery}`, FIELD_CONFIGURATIONS.dropdownPlaceholders.section, (option, item) => {
            option.value = item;
            option.textContent = item;
          }).then(() => {
            if (_section) {
              console.log(`🔧 Setting section value: ${_section}`);

              const $sectionSelect = $(sectionSelect);
              if ($sectionSelect.find(`option[value="${_section}"]`).length > 0) {
                if ($sectionSelect.data('select2')) {
                  $sectionSelect.val(_section).trigger('change.select2').trigger('change.batch');
                } else {
                  sectionSelect.value = _section;
                  $sectionSelect.trigger('change.batch');
                }
                console.log(`✅ Section set successfully: ${_section}`);
              } else {
                console.warn(`❌ Section option not found: ${_section}`);
              }
            }
          });
          promises.push(sectionPromise);
        }

        // CompStore/StoreNames - Primary
        const compstoreSelect = rowElement.querySelector('.batch-compstore');
        if (compstoreSelect) {
          let compstoreParams = [];
          if (_companyID) compstoreParams.push(`companyID=${_companyID}`);
          if (_coBu) compstoreParams.push(`Cobu=${encodeURIComponent(_coBu)}`);
          if (_budgetYear) compstoreParams.push(`budgetYear=${encodeURIComponent(_budgetYear)}`);
          if (_costCenter) compstoreParams.push(`costCenterCode=${encodeURIComponent(_costCenter)}`);
          if (_division) compstoreParams.push(`divisionCode=${encodeURIComponent(_division)}`);
          if (_department) compstoreParams.push(`departmentCode=${encodeURIComponent(_department)}`);
          if (_section) compstoreParams.push(`sectionCode=${encodeURIComponent(_section)}`);
          const compstoreQuery = compstoreParams.length ? `?${compstoreParams.join('&')}` : '';

          const compstorePromise = this.populateDropdownAsync(compstoreSelect, `${BUDGET_API.storeNames}${compstoreQuery}`, 'Select CompStore', (option, item) => {
            option.value = item;
            option.textContent = item;
          }).then(() => {
            if (_compStore) {
              console.log(`🔧 Setting compstore value: ${_compStore}`);

              const $compstoreSelect = $(compstoreSelect);
              if ($compstoreSelect.find(`option[value="${_compStore}"]`).length > 0) {
                if ($compstoreSelect.data('select2')) {
                  $compstoreSelect.val(_compStore).trigger('change.select2').trigger('change.batch');
                } else {
                  compstoreSelect.value = _compStore;
                  $compstoreSelect.trigger('change.batch');
                }
                console.log(`✅ CompStore set successfully: ${_compStore}`);
              } else {
                console.warn(`❌ CompStore option not found: ${_compStore}`);
              }
            }
          });
          promises.push(compstorePromise);
        }

        // Positions - Primary
        const positionSelect = rowElement.querySelector('.batch-position');
        if (positionSelect) {
          const positionPromise = this.populateDropdownAsync(positionSelect, `${SELECT_API.positions}?companyId=${_companyID}`, 'Select Position', (option, item) => {
            option.value = item.positionCode;
            option.textContent = `${item.positionName} (${item.positionCode})`;
          }).then(() => {
            if (_position) {
              console.log(`🔧 Setting position value: ${_position}`);

              const $positionSelect = $(positionSelect);
              if ($positionSelect.find(`option[value="${_position}"]`).length > 0) {
                if ($positionSelect.data('select2')) {
                  $positionSelect.val(_position).trigger('change.select2').trigger('change.batch');
                } else {
                  positionSelect.value = _position;
                  $positionSelect.trigger('change.batch');
                }
                console.log(`✅ Position set successfully: ${_position}`);
              } else {
                console.warn(`❌ Position option not found: ${_position}`);
              }
            }
          });
          promises.push(positionPromise);
        }

        // Job Bands - Primary
        const jobBandSelect = rowElement.querySelector('.batch-job-band');
        if (jobBandSelect) {
          let jobBandParams = [];
          if (_companyID) jobBandParams.push(`companyId=${_companyID}`);
          if (_position) jobBandParams.push(`positionCode=${encodeURIComponent(_position)}`);
          const jobBandQuery = jobBandParams.length ? `?${jobBandParams.join('&')}` : '';

          const jobBandPromise = this.populateDropdownAsync(jobBandSelect, `${SELECT_API.jobBands}${jobBandQuery}`, 'Select Job Band', (option, item) => {
            option.value = item.jbCode;
            option.textContent = item.jbName;
          }).then(() => {
            if (_jobBand) {
              console.log(`🔧 Setting job band value: ${_jobBand}`);

              const $jobBandSelect = $(jobBandSelect);
              if ($jobBandSelect.find(`option[value="${_jobBand}"]`).length > 0) {
                if ($jobBandSelect.data('select2')) {
                  $jobBandSelect.val(_jobBand).trigger('change.select2').trigger('change.batch');
                } else {
                  jobBandSelect.value = _jobBand;
                  $jobBandSelect.trigger('change.batch');
                }
                console.log(`✅ Job band set successfully: ${_jobBand}`);
              } else {
                console.warn(`❌ Job band option not found: ${_jobBand}`);
              }
            }
          });
          promises.push(jobBandPromise);
        }

        // Employee Status - Primary
        const empStatusSelect = rowElement.querySelector('.batch-emp-status');
        if (empStatusSelect) {
          let empStatusParams = [`statusType=Budget`];
          if (_companyID) empStatusParams.push(`companyID=${_companyID}`);
          const empStatusQuery = empStatusParams.length ? `?${empStatusParams.join('&')}` : '';

          const empStatusPromise = this.populateDropdownAsync(empStatusSelect, `${SELECT_API.statuses}${empStatusQuery}`, 'Select Employee Status', (option, item) => {
            option.value = item.statusCode;
            option.textContent = item.statusName;
          });
          promises.push(empStatusPromise);
        }

        // Plan Cost Center - Primary
        const planCostCenterSelect = rowElement.querySelector('.batch-plan-cost-center');
        if (planCostCenterSelect) {
          let planCostCenterParams = [];
          if (_companyID) planCostCenterParams.push(`companyID=${_companyID}`);
          const planCostCenterQuery = planCostCenterParams.length ? `?${planCostCenterParams.join('&')}` : '';

          const planCostCenterPromise = this.populateDropdownAsync(planCostCenterSelect, `${SELECT_API.planCostCenters}${planCostCenterQuery}`, 'Select Plan Cost Center', (option, item) => {
            option.value = item.costCenterCode;
            option.textContent = `${item.costCenterName} (${item.costCenterCode})`;
          });
          promises.push(planCostCenterPromise);
        }
        // Salary Structure - Primary
        const salaryStructureSelect = rowElement.querySelector('.batch-salary-structure');
        console.log(`batch-salary-structure salaryStructureSelect:`, salaryStructureSelect?.name, 'preselect:', _costCenter);
        if (salaryStructureSelect) {
          let salaryStructureParams = [];
          if (_companyID) salaryStructureParams.push(`companyID=${_companyID}`);
          if (_jobBand) salaryStructureParams.push(`jobBand=${_jobBand}`);
          const salaryStructureQuery = salaryStructureParams.length ? `?${salaryStructureParams.join('&')}` : '';

          const salaryStructurePromise = this.populateDropdownAsync(salaryStructureSelect, `${SELECT_API.salaryranges}${salaryStructureQuery}`, 'Select Salary Structure', (option, item) => {
            // 🔧 FIX: Use correct property names matching Offcanvas pattern
            option.value = item.midSalary;
            option.textContent = item.functionName;
          });
          promises.push(salaryStructurePromise);
        }

        // Group Run Rate - Primary
        const groupRunRateSelect = rowElement.querySelector('.batch-run-rate-group');
        console.log(`batch-run-rate-group groupRunRateSelect:`, groupRunRateSelect?.name, 'preselect:', _costCenter);
        if (groupRunRateSelect) {
          let groupRunRateParams = [];
          if (_companyID) groupRunRateParams.push(`companyID=${_companyID}`);
          const groupRunRateQuery = groupRunRateParams.length ? `?${groupRunRateParams.join('&')}` : '';

          const groupRunRatePromise = this.populateDropdownAsync(groupRunRateSelect, `${SELECT_API.groupRunRates}${groupRunRateQuery}`, 'Select Group Run Rate', (option, item) => {
            // 🔧 FIX: Use correct property names matching Offcanvas pattern
            option.value = item.runRateCode;
            option.textContent = `${item.runRateName}-[${item.grouping}] (${item.runRateValue}%)`;
          });
          promises.push(groupRunRatePromise);
        }
      }

      // Wait for all primary dropdowns to complete
      Promise.all(promises)
        .then(() => {
          console.log(`✅ All primary dropdowns completed for ${rowId} (including cascade APIs)`);
          resolve();
        })
        .catch(error => {
          console.error(`❌ Error in primary dropdowns for ${rowId}:`, error);
          reject(error);
        });
    });
  },

  // 🔧 NEW: Async version of populateStaticDropdowns
  populateStaticDropdownsAsync: function (rowElement) {
    return new Promise((resolve, reject) => {
      const companyID = rowElement.querySelector('.batch-company')?.value;
      const promises = [];

      console.log(`📋 Populating static dropdowns async for companyID: ${companyID}`);

      // Static dropdown mappings
      const dropdownMappings = [
        //{ selector: '.batch-salary-structure', api: SELECT_API.salaryStructures, valueKey: 'itemCode', textKey: 'itemName', needsCompanyId: true },
        { selector: '.batch-employee-level', api: SELECT_API.executives, valueKey: 'itemCode', textKey: 'itemName', needsCompanyId: true },
        { selector: '.batch-focus-hc', api: SELECT_API.focusHC, valueKey: 'itemCode', textKey: 'itemName', needsCompanyId: true },
        { selector: '.batch-focus-pe', api: SELECT_API.focusPE, valueKey: 'itemCode', textKey: 'itemName', needsCompanyId: true },
        { selector: '.batch-emp-type', api: SELECT_API.employeeTypes, valueKey: 'itemCode', textKey: 'itemName', needsCompanyId: true },
        { selector: '.batch-new-hc', api: SELECT_API.newHC, valueKey: 'itemCode', textKey: 'itemName', needsCompanyId: true },
        { selector: '.batch-new-period', api: SELECT_API.noOfMonths, valueKey: 'itemCode', textKey: 'itemName', needsCompanyId: true },
        { selector: '.batch-new-le-period', api: SELECT_API.newLEPeriods, valueKey: 'itemCode', textKey: 'itemName', needsCompanyId: true },
        { selector: '.batch-le-no-month', api: SELECT_API.leNoOfMonths, valueKey: 'itemValue', textKey: 'itemName', needsCompanyId: true },
        { selector: '.batch-no-month', api: SELECT_API.noOfMonths, valueKey: 'itemValue', textKey: 'itemName', needsCompanyId: true },
        { selector: '.batch-join-pvf', api: SELECT_API.joinPvf, valueKey: 'itemValue', textKey: 'itemName', needsCompanyId: true }
      ];

      dropdownMappings.forEach(mapping => {
        const select = rowElement.querySelector(mapping.selector);
        if (select) {
          let apiUrl = mapping.api;
          if (mapping.needsCompanyId && companyID) {
            apiUrl = `${mapping.api}?companyId=${companyID}`;
          }

          const promise = this.populateDropdownAsync(select, apiUrl, `Select ${mapping.selector.replace('.batch-', '').replace('-', ' ')}`, (option, item) => {
            option.value = item[mapping.valueKey];
            option.textContent = item[mapping.textKey];
          });
          promises.push(promise);
        }
      });


      // Wait for all static dropdowns to complete
      Promise.all(promises)
        .then(() => {
          console.log(`✅ All static dropdowns completed`);
          resolve();
        })
        .catch(error => {
          console.error(`❌ Error in static dropdowns:`, error);
          reject(error);
        });
    });
  },

  // ───────────────────────────────────────────────────────────────────
  // 🔗 CASCADE RELATIONSHIP SETUP METHODS
  // ───────────────────────────────────────────────────────────────────

  // Setup cascading relationships with event namespacing (Offcanvas-style)
  setupBatchRowCascadingRelationships: function (rowElement, rowId) {
    const self = this;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔧 COMPANY CHANGE EVENT - REMOVED (SA Decision - 2025-10-18)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // REASON: Company dropdown is permanently disabled (lines 799, 843)
    //         All cascade dropdowns are loaded during initial row creation
    //         via populatePrimaryDropdownsAsync() with pre-selected Company
    // NOTE:   Copy Row functionality will be rewritten separately
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // Remove existing event listeners to prevent duplicates
    $(rowElement).find('.batch-year').off('change.batch');
    $(rowElement).find('.batch-cobu').off('change.batch');
    $(rowElement).find('.batch-cost-center').off('change.batch');
    $(rowElement).find('.batch-division').off('change.batch');
    $(rowElement).find('.batch-department').off('change.batch');
    $(rowElement).find('.batch-section').off('change.batch');
    $(rowElement).find('.batch-compstore').off('change.batch');

    // COBU/Year change - update dependent dropdowns
    $(rowElement).find('.batch-cobu, .batch-year').on('change.batch', function () {
      const companyID = $(rowElement).find('.batch-company').val();
      if (companyID) {
        console.log(`🔄 COBU/Year changed for ${rowId}`);

        // ✅ NEW: Check if this is Row 1 Master in Allocation Mode
        const isAllocationMaster = rowElement.getAttribute('data-allocation-mode') === 'true' &&
          rowElement.querySelector('.allocation-row-number')?.textContent === '1';

        if (isAllocationMaster) {
          //self.debouncedUpdateBatchRowDivisions(rowElement, rowId);
          self.debouncedUpdateBatchRowDepartments(rowElement, rowId);
          self.debouncedUpdateBatchRowSections(rowElement, rowId);
          self.debouncedUpdateBatchRowCompStore(rowElement, rowId);
          self.debouncedUpdateBatchRowPositions(rowElement, rowId);
          self.debouncedUpdateBatchRowJobBands(rowElement, rowId);
          console.log(`  🔒 Skipping cascade for Row 1 Master (Cost Center locked to 90066)`);
          return; // Skip cascade updates for Row 1 Master
        } else {
          // Clear dependent dropdowns first
          self.clearBatchRowDependentDropdowns(rowElement, 'cobu');

          self.debouncedUpdateBatchRowCostCenters(rowElement, rowId);
          self.debouncedUpdateBatchRowDivisions(rowElement, rowId);
          self.debouncedUpdateBatchRowDepartments(rowElement, rowId);
          self.debouncedUpdateBatchRowSections(rowElement, rowId);
          self.debouncedUpdateBatchRowCompStore(rowElement, rowId);
          self.debouncedUpdateBatchRowPositions(rowElement, rowId);
          self.debouncedUpdateBatchRowJobBands(rowElement, rowId);
          //self.debouncedUpdateBatchRowEmployeeStatus(rowElement, rowId);

          // ✅ Validation removed - Use "Validate All" button or Checkbox click instead
          console.log(`✅ COBU/Year changed - dropdowns updated (validation via button only)`);
        }
      }
    });

    // Cost Center change - update dependent dropdowns
    $(rowElement).find('.batch-cost-center').on('change.batch', function () {
      console.log(`🔄 Cost Center changed for ${rowId}`);

      // Clear dependent dropdowns first
      self.clearBatchRowDependentDropdowns(rowElement, 'costCenter');

      self.debouncedUpdateBatchRowDivisions(rowElement, rowId);
      self.debouncedUpdateBatchRowDepartments(rowElement, rowId);
      self.debouncedUpdateBatchRowSections(rowElement, rowId);
      self.debouncedUpdateBatchRowCompStore(rowElement, rowId);
      self.debouncedUpdateBatchRowPositions(rowElement, rowId);
      self.debouncedUpdateBatchRowJobBands(rowElement, rowId);
      //self.debouncedUpdateBatchRowEmployeeStatus(rowElement, rowId);
    });

    // Division change
    $(rowElement).find('.batch-division').on('change.batch', function () {
      console.log(`🔄 Division changed for ${rowId}`);

      // Clear dependent dropdowns first
      self.clearBatchRowDependentDropdowns(rowElement, 'division');

      self.debouncedUpdateBatchRowDepartments(rowElement, rowId);
      self.debouncedUpdateBatchRowSections(rowElement, rowId);
      self.debouncedUpdateBatchRowCompStore(rowElement, rowId);
      self.debouncedUpdateBatchRowPositions(rowElement, rowId);
      self.debouncedUpdateBatchRowJobBands(rowElement, rowId);
      //self.debouncedUpdateBatchRowEmployeeStatus(rowElement, rowId);
    });

    // Department change
    $(rowElement).find('.batch-department').on('change.batch', function () {
      console.log(`🔄 Department changed for ${rowId}`);

      // Clear dependent dropdowns first
      self.clearBatchRowDependentDropdowns(rowElement, 'department');

      self.debouncedUpdateBatchRowSections(rowElement, rowId);
      self.debouncedUpdateBatchRowCompStore(rowElement, rowId);
      self.debouncedUpdateBatchRowPositions(rowElement, rowId);
      self.debouncedUpdateBatchRowJobBands(rowElement, rowId);
      //self.debouncedUpdateBatchRowEmployeeStatus(rowElement, rowId);
    });

    // Section change
    $(rowElement).find('.batch-section').on('change.batch', function () {
      console.log(`🔄 Section changed for ${rowId}`);

      // Clear dependent dropdowns first
      self.clearBatchRowDependentDropdowns(rowElement, 'section');

      self.debouncedUpdateBatchRowCompStore(rowElement, rowId);
      self.debouncedUpdateBatchRowPositions(rowElement, rowId);
      self.debouncedUpdateBatchRowJobBands(rowElement, rowId);
      //self.debouncedUpdateBatchRowEmployeeStatus(rowElement, rowId);
    });

    // Location change
    $(rowElement).find('.batch-compstore').on('change.batch', function () {
      console.log(`🔄 compstore changed for ${rowId}`);

      // Clear dependent dropdowns first
      self.clearBatchRowDependentDropdowns(rowElement, 'compstore');

      self.debouncedUpdateBatchRowPositions(rowElement, rowId);
      self.debouncedUpdateBatchRowJobBands(rowElement, rowId);
      //self.debouncedUpdateBatchRowEmployeeStatus(rowElement, rowId);
    });

    // Position change
    $(rowElement).find('.batch-position').on('change.batch', function () {
      console.log(`🔄 Position changed for ${rowId}`);

      // Clear dependent dropdowns first
      self.clearBatchRowDependentDropdowns(rowElement, 'position');

      self.debouncedUpdateBatchRowJobBands(rowElement, rowId);
      //self.debouncedUpdateBatchRowEmployeeStatus(rowElement, rowId);
    });

    // Job Band change
    $(rowElement).find('.batch-job-band').on('change.batch', function () {
      console.log(`🔄 Job Band changed for ${rowId}`);
      self.debouncedupdateBatchRowSalaryStructures(rowElement, rowId);
      const selectedJobBand = $(this).val();

      // 🔄 Auto-populate Employee Level based on IsExc API call
      if (selectedJobBand) {
        self.debouncedUpdateBatchRowEmployeeLevel(rowElement, rowId);
      }

    });

    //Plan Cost Center change
    $(rowElement).find('.batch-plan-cost-center').on('change.batch', function () {
      console.log(`🔄 Plan Cost Center changed for ${rowId}`);
      self.debouncedUpdateBatchRowGroupRunRates(rowElement, rowId);
    });

    //Salary Structure change
    $(rowElement).find('.batch-salary-structure').on('change.batch', function () {
      console.log(`🔄 Salary Structure changed for ${rowId}`);
      const selectedValue = $(this).val();

      // ✅ FIX: Detect if this is Allocation Batch or Normal Batch
      const isAllocationMode = rowElement.getAttribute('data-allocation-mode') === 'true';
      const rowNumber = rowId.replace('batch-row-', '');

      // 🔑 Build correct field ID based on mode:
      // - Normal Batch:     batchLe1_LePayroll
      // - Allocation Batch: batch-row-1_LePayroll
      const fieldId = isAllocationMode
        ? `${rowId}_editLePayroll`    // Allocation pattern
        : `batchLe${rowNumber}_LePayroll`;       // Normal Batch pattern

      const editLePayrollField = document.getElementById(fieldId);

      if (editLePayrollField && selectedValue) {
        // Set the selected salary structure value to editLePayroll field
        editLePayrollField.value = selectedValue;

        // Trigger change event if needed for any dependent functionality
        $(editLePayrollField).trigger('change');

        console.log(`✅ Updated ${fieldId} = ${selectedValue} (${isAllocationMode ? 'Allocation' : 'Batch'} mode)`);
      } else if (editLePayrollField && !selectedValue) {
        // Clear the field if no salary structure is selected
        editLePayrollField.value = '';
        console.log(`✅ Cleared ${fieldId}`);
      } else if (!editLePayrollField) {
        console.warn(`⚠️ Field ${fieldId} not found in DOM (${isAllocationMode ? 'Allocation' : 'Batch'} mode)`);
      }
    });

    // ───────────────────────────────────────────────────────────────────
    // 🧮 CAL BUTTON EVENT HANDLER - Payroll LE Calculation
    // ───────────────────────────────────────────────────────────────────

    // Cal button click event (for BIGC Budget Estimation - 57 fields)
    // Button ID pattern: calcbatchLe{rowNumber}_LePayrollBtn
    $(rowElement).on('click', '[id^="calcbatchLe"][id$="_LePayrollBtn"]', function () {
      console.log(`🧮 Cal button clicked for ${rowId}`);

      // Extract row number from button ID: calcbatchLe1_LePayrollBtn → 1
      const buttonId = $(this).attr('id');
      const rowNumber = buttonId.match(/calcbatchLe(\d+)_/)?.[1];

      if (!rowNumber) {
        console.warn(`⚠️ Could not extract row number from button ID: ${buttonId}`);
        return;
      }

      // ⚠️ Phase 4: Check if this is a RE-CALCULATE (2nd, 3rd, ... nth time)
      if (self.isRowCalculated(rowNumber)) {
        console.warn(`⚠️ Row ${rowNumber} was already calculated - showing confirmation modal`);

        // Show Re-Calculate confirmation modal
        self.showReCalculateConfirmation(rowElement, rowId, rowNumber);
      } else {
        // First time calculation - proceed directly
        console.log(`✅ First time calculation for Row ${rowNumber} - proceeding...`);
        self.calculateBudgetBigcEstimate(rowElement, rowId, rowNumber);
      }
    });

  },

  // ───────────────────────────────────────────────────────────────────
  // 🧮 CALCULATION FUNCTIONS
  // ───────────────────────────────────────────────────────────────────

  /**
   * Calculate Budget Estimate for BJC (92 fields) or BIGC (57 fields)
   * - BJC: fn_BudgetEstimate_BJC with 19 parameters → 92 fields (44 LE + 44 BG + 4 summary)
   * - BIGC: fn_BudgetEstimate with 12 parameters → 57 fields (26 LE + 25 BG + 6 summary)
   * Smart Populate: Only fills empty/zero fields (won't overwrite user input)
   *
   * @param {HTMLElement} rowElement - The batch row element
   * @param {string} rowId - The batch row ID (e.g., 'batch-row-1')
   * @param {string} rowNumber - The row number (e.g., '1')
   */
  calculateBudgetBigcEstimate: async function (rowElement, rowId, rowNumber) {
    console.log(`🧮 [Cal Button] Starting calculation for Row ${rowNumber}...`);

    // ============================================
    // STEP 0: Detect Company (BJC or BIGC)
    // ============================================
    // ✅ FIX: Read companyId from batch row field, NOT from filter dropdown
    const companyField = rowElement.querySelector(`[name="${rowId}_company"]`);
    const companyId = parseInt(companyField?.value);
    const isBJC = (companyId === 1);
    console.log(`🏢 Company Detected: ${isBJC ? 'BJC (CompanyId=1)' : 'BIGC (CompanyId=2)'} (from row field, not filter)`);

    // Validation: companyId must be valid
    if (!companyId || isNaN(companyId)) {
      showWarningModal('⚠️ กรุณาเลือก Company ก่อนคำนวณ');
      console.error('❌ Invalid companyId:', companyId);
      return;
    }

    // ============================================
    // STEP 1: Get BASE parameters (12 - BIGC compatible)
    // ============================================
    // ✅ FIX: Extract row number from rowId (batch-row-1 → 1) to build correct field ID
    const rowNum = rowId.replace('batch-row-', '');
    // ============================================
    // Get BJC-SPECIFIC parameters (8 additional)
    // ============================================
    let empType = '';
    let bonusTypeLe = '';
    let bonusType = '';
    let positionName = '';
    let yosLe = 0;
    let yos = 1;
    let deptName = '';
    let cobu = '';
    // Base fields (all companies)
    const yearField = rowElement.querySelector(`[name="${rowId}_year"]`);
    const yearLeField = yearField ? parseInt(yearField.value) - 1 : null;

    // ✅ FIX: Read salary from LePayroll INPUT field (not Dropdown)
    // Priority: Input field → Dropdown (fallback)
    const lePayrollField = document.getElementById(`batchLe${rowNum}_LePayroll`);
    const salaryField = rowElement.querySelector(`[name="${rowId}_SalaryStructure"]`);

    const premiumField = document.getElementById(`batchLe${rowNum}_LePremium`);
    const jobBandField = rowElement.querySelector(`[name="${rowId}_jobBand"]`);
    const leOfMonthField = rowElement.querySelector(`[name="${rowId}_LeOfMonth"]`);
    const noOfMonthField = rowElement.querySelector(`[name="${rowId}_NoOfMonth"]`);
    const companyNameField = rowElement.querySelector(`[name="${rowId}_compstore"]`);
    const costCenterField = rowElement.querySelector(`[name="${rowId}_costCenterCode"]`);

    const year = parseInt(yearField?.value) || 0;
    const yearLe = yearLeField || 0;

    // ✅ FIX: Read from Input field first, fallback to Dropdown
    let salary = parseFloat(lePayrollField?.value) || 0;
    if (!salary || salary <= 0) {
      // Fallback to Dropdown if Input field is empty
      salary = parseFloat(salaryField?.value) || 0;
      console.log(`💰 Salary: ${salary} (from Dropdown - fallback)`);
    } else {
      console.log(`💰 Salary: ${salary} (from LePayroll Input field)`);
    }

    const premiumAmt = parseFloat(premiumField?.value) || 0;
    const jobBand = jobBandField?.value || '';
    const leOfMonth = parseInt(leOfMonthField?.value) || 0;
    const noOfMonth = parseInt(noOfMonthField?.value) || 0;
    const companyName = companyNameField?.value || '';
    const costCenter = costCenterField?.value || '';

    // ============================================
    // Console log BASE parameters
    // ============================================
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

    if (isBJC) {
      // Get BJC-specific fields from UI
      const empTypeField = rowElement.querySelector(`[name="${rowId}_EmpType"]`);//batch-row-1_EmpType
      const bonusTypeLeField = document.getElementById(`batchLe${rowNum}_LeBonusType`); //ex: batchLe1_LeBonusType
      const bonusTypeField = document.getElementById(`batchBg${rowNum}_BgBonusType`); //ex: batchBg1_BgBonusType
      const positionField = rowElement.querySelector(`[name="${rowId}_position"]`);
      const departmentField = rowElement.querySelector(`[name="${rowId}_department"]`);
      const cobuField = rowElement.querySelector(`[name="${rowId}_cobu"]`);

      empType = empTypeField?.value || '';
      bonusTypeLe = bonusTypeLeField?.selectedOptions?.[0]?.text || bonusTypeLeField?.value || '';
      bonusType = bonusTypeField?.selectedOptions?.[0]?.text || bonusTypeField?.value || '';
      positionName = positionField?.selectedOptions?.[0]?.text || positionField?.value || '';
      deptName = departmentField?.selectedOptions?.[0]?.text || departmentField?.value || '';
      cobu = cobuField?.value || '';

      // YOS (Years of Service) - TODO: Add UI fields if needed
      // For now, use null (will be calculated by backend if needed)
      // yosLe = null;
      // yos = null;

      console.log(`📋 BJC-Specific Parameters:`);
      console.log(`   Emp Type: ${empType}`);
      console.log(`   Bonus Type LE: ${bonusTypeLe}`);
      console.log(`   Position Name: ${positionName}`);
      console.log(`   YOS LE: ${yosLe}`);
      console.log(`   YOS: ${yos}`);
      console.log(`   Dept Name: ${deptName}`);
      console.log(`   BU: null (fixed)`);
      console.log(`   COBU: ${cobu}`);
    }
    else {
      const bonusTypeField = document.getElementById(`batchBg${rowNum}_BgBonusTypes`);
      bonusType = bonusTypeField?.selectedOptions?.[0]?.text || bonusTypeField?.value || '';
    }


    // ============================================
    // STEP 3: Enhanced Validation (Phase 3 Task 3.2)
    // ============================================

    // 3.1 Base Required Fields (All Companies)
    if (!year || year === 0) {
      showWarningModal('⚠️ กรุณาเลือก Year ก่อนคำนวณ');
      console.warn('⚠️ [Validation] Year is required');
      return;
    }

    if (!yearLe || yearLe === 0) {
      showWarningModal('⚠️ กรุณาเลือก Year LE ก่อนคำนวณ');
      console.warn('⚠️ [Validation] Year LE is required');
      return;
    }

    if (!companyId || isNaN(companyId)) {
      showWarningModal('⚠️ กรุณาเลือก Company ก่อนคำนวณ');
      console.warn('⚠️ [Validation] Company is required');
      return;
    }

    if (salary <= 0) {
      showWarningModal('⚠️ กรุณากรอก Salary Structure ก่อนคำนวณ');
      console.warn('⚠️ [Validation] Salary must be greater than 0');
      return;
    }

    if (leOfMonth === '') {
      showWarningModal('⚠️ กรุณากรอก LE Of Month ก่อนคำนวณ');
      console.warn('⚠️ [Validation] LE Of Month is required');
      return;
    }

    if (noOfMonth === '') {
      showWarningModal('⚠️ กรุณากรอก No Of Month ก่อนคำนวณ');
      console.warn('⚠️ [Validation] No Of Month is required');
      return;
    }

    if (!costCenter || costCenter === '') {
      showWarningModal('⚠️ กรุณาเลือก Cost Center ก่อนคำนวณ');
      console.warn('⚠️ [Validation] Cost Center is required');
      return;
    }

    if (bonusType === 'Select Bonus Types' || bonusType === 'Select Bonus Type' || !bonusType) {
      showWarningModal('⚠️ กรุณาเลือก Bonus Type ก่อนคำนวณ');
      console.warn('⚠️ [Validation] Bonus Type is required');
      return;
    }

    if (!jobBand || jobBand === '') {
      showWarningModal('⚠️ กรุณาเลือก Job Band ก่อนคำนวณ');
      console.warn('⚠️ [Validation] Job Band is required');
      return;
    }

    // 3.2 BJC-Specific Required Fields
    if (isBJC) {
      if (!empType || empType === '') {
        showWarningModal('⚠️ กรุณาเลือก Emp Type ก่อนคำนวณ');
        console.warn('⚠️ [Validation] Emp Type is required for BJC');
        return;
      }

      if (bonusTypeLe === 'Select Bonus Types' || bonusTypeLe === 'Select Bonus Type' || !bonusTypeLe) {
        showWarningModal('⚠️ กรุณาเลือก Bonus Type LE ก่อนคำนวณ');
        console.warn('⚠️ [Validation] Bonus Type LE is required for BJC');
        return;
      }
    }

    console.log('✅ [Validation] All required parameters validated successfully');


    // ============================================
    // STEP 4: Show loading state
    // ============================================
    const calButton = rowElement.querySelector(`#calcbatchLe${rowNumber}_LePayrollBtn`);
    const originalText = calButton?.innerHTML || 'Cal';
    if (calButton) {
      calButton.disabled = true;
      calButton.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Calculating...';
    }

    // ============================================
    // STEP 5: Build request object (Conditional for BJC/BIGC)
    // ============================================
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
      allocateJson: null, // NULL for Batch Entry

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

    // ============================================
    // STEP 6: Select API endpoint based on company
    // ============================================
    const apiEndpoint = isBJC ? BUDGET_API.calBJCbenefits : BUDGET_API.calBIGCbenefits;
    const companyType = isBJC ? 'BJC' : 'BIGC';
    console.log(`� API Endpoint: ${apiEndpoint}`);

    // ============================================
    // STEP 7: Call API
    // ============================================
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('📥 API Response:', result);

      if (!result.success || !result.data || result.data.length === 0) {
        throw new Error('No data returned from calculation');
      }

      // ============================================
      // STEP 8: Smart Populate Fields
      // - BJC: 92 fields (44 LE + 44 BG + 4 summary)
      // - BIGC: 57 fields (26 LE + 25 BG + 6 summary)
      // ============================================
      const mainRow = result.data[0]; // First row from function result

      // ✅ FIX: Extract row number from rowId (batch-row-1 → 1) to build correct field ID
      const rowNum = rowId.replace('batch-row-', '');

      /**
       * 🧠 Smart Populate Helper (DEPRECATED - Use global function instead)
       *
       * @deprecated Use batchEntryManager.smartPopulateBatchField() instead
       * @see smartPopulateBatchField() for enhanced version with data tracking
       *
       * This nested function is kept for backward compatibility but redirects to global function
       *
       * @param {string} fieldSuffix - Field suffix (e.g., 'LePayroll', 'Payroll')
       * @param {string} fieldPrefix - Field prefix ('batchLe' for LE fields, 'batchBg' for Budget Year fields)
       * @param {*} newValue - New value to populate
       */
      const self = this; // ✅ Phase 2 Fix: Store reference to batchEntryManager
      const smartPopulate = function (fieldSuffix, fieldPrefix, newValue) {
        // ✅ Redirect to global function with enhanced data tracking
        self.smartPopulateBatchField(rowNum, fieldSuffix, fieldPrefix, newValue);
      };

      if (companyId === 1) {
        // ═══════════════════════════════════════════════════════════════
        // 🏢 BJC COMPANY (CompanyId = 1) - 51 FIELDS
        // ═══════════════════════════════════════════════════════════════

        console.log('📝 Populating BJC LE Fields (26 fields)...');

        // Core Fields (4 fields)
        smartPopulate('LePayroll', 'batchLe', mainRow.payrollLe);
        smartPopulate('LePremium', 'batchLe', mainRow.premiumLe);
        smartPopulate('LeSalWithEn', 'batchLe', mainRow.salWithEnLe);
        smartPopulate('LeSalNotEn', 'batchLe', mainRow.salNotEnLe);

        // Allowances (14 fields)
        smartPopulate('LeBonus', 'batchLe', mainRow.bonusLe);
        smartPopulate('LeCarAllowance', 'batchLe', mainRow.carAllowanceLe);
        smartPopulate('LeLicenseAllowance', 'batchLe', mainRow.licenseAllowanceLe);
        smartPopulate('LeHousingAllowance', 'batchLe', mainRow.housingAllowanceLe);
        smartPopulate('LeCarGasoline', 'batchLe', mainRow.carGasolineLe);
        smartPopulate('LeOutsourceWages', 'batchLe', mainRow.outsourceWagesLe);
        smartPopulate('LeSkillAllowancePc', 'batchLe', mainRow.skillAllowancePcLe);
        smartPopulate('LeSalesManagementPc', 'batchLe', mainRow.salesManagementPcLe);
        smartPopulate('LeShelfStackingPc', 'batchLe', mainRow.shelfStackingPcLe);
        smartPopulate('LeDiligenceAllowancePc', 'batchLe', mainRow.diligenceAllowancePcLe);
        smartPopulate('LePostAllowancePc', 'batchLe', mainRow.postAllowancePcLe);
        smartPopulate('LePhoneAllowancePc', 'batchLe', mainRow.phoneAllowancePcLe);
        smartPopulate('LeTransportationPc', 'batchLe', mainRow.transportationPcLe);
        smartPopulate('LeOtherAllowancePc', 'batchLe', mainRow.otherAllowancePcLe);

        // Car & Fleet (5 fields)
        smartPopulate('LeCompCarsGas', 'batchLe', mainRow.compCarsGasLe);
        smartPopulate('LeCompCarsOther', 'batchLe', mainRow.compCarsOtherLe);
        smartPopulate('LeCarRental', 'batchLe', mainRow.carRentalLe);
        smartPopulate('LeCarRepair', 'batchLe', mainRow.carRepairLe);
        smartPopulate('LeCarMaintenance', 'batchLe', mainRow.carMaintenanceLe);

        // BJC-Specific Fields (9 fields)
        smartPopulate('LeTemporaryStaffSal', 'batchLe', mainRow.temporaryStaffSalLe);
        smartPopulate('LeSalTemp', 'batchLe', mainRow.salTempLe);
        smartPopulate('LeSocialSecurityTmp', 'batchLe', mainRow.socialSecurityTmpLe);
        smartPopulate('LeCarMaintenanceTmp', 'batchLe', mainRow.carMaintenanceTmpLe);
        smartPopulate('LeSouthriskAllowance', 'batchLe', mainRow.southriskAllowanceLe);
        smartPopulate('LeSouthriskAllowanceTmp', 'batchLe', mainRow.southriskAllowanceTmpLe);
        smartPopulate('LeSalesCarAllowance', 'batchLe', mainRow.salesCarAllowanceLe);
        smartPopulate('LeAccommodation', 'batchLe', mainRow.accommodationLe);
        smartPopulate('LeOthersSubjectTax', 'batchLe', mainRow.othersSubjectTaxLe);

        // Benefits (10 fields)
        smartPopulate('LeSocialSecurity', 'batchLe', mainRow.socialSecurityLe);
        smartPopulate('LeWorkmenCompensation', 'batchLe', mainRow.workmenCompensationLe);
        smartPopulate('LeProvidentFund', 'batchLe', mainRow.providentFundLe);
        smartPopulate('LeOther', 'batchLe', mainRow.otherLe);
        smartPopulate('LeLifeInsurance', 'batchLe', mainRow.lifeInsuranceLe);
        smartPopulate('LeMedicalOutside', 'batchLe', mainRow.medicalOutsideLe);
        smartPopulate('LeMedicalInHouse', 'batchLe', mainRow.medicalInhouseLe);
        smartPopulate('LeStaffActivities', 'batchLe', mainRow.staffActivitiesLe);
        smartPopulate('LeUniform', 'batchLe', mainRow.uniformLe);
        smartPopulate('LeMealAllowance', 'batchLe', mainRow.mealAllowanceLe);

        // PE Calculations (4 fields)
        smartPopulate('LePeMth', 'batchLe', mainRow.peMthLe);
        smartPopulate('LePeYear', 'batchLe', mainRow.peYearLe);
        smartPopulate('LePeSbMth', 'batchLe', mainRow.peSbMthLe);
        smartPopulate('LePeSbYear', 'batchLe', mainRow.peSbYearLe);

        console.log('📝 Populating BJC Budget Year Fields (25 fields)...');

        // Core Fields (4 fields)
        smartPopulate('BgPayroll', 'batchBg', mainRow.payroll);
        smartPopulate('BgPremium', 'batchBg', mainRow.premium);
        smartPopulate('BgSalWithEn', 'batchBg', mainRow.salWithEn);
        smartPopulate('BgSalNotEn', 'batchBg', mainRow.salNotEn);

        // Allowances (14 fields)
        smartPopulate('BgBonus', 'batchBg', mainRow.bonus);
        smartPopulate('BgCarAllowance', 'batchBg', mainRow.carAllowance);
        smartPopulate('BgLicenseAllowance', 'batchBg', mainRow.licenseAllowance);
        smartPopulate('BgHousingAllowance', 'batchBg', mainRow.housingAllowance);
        smartPopulate('BgCarGasoline', 'batchBg', mainRow.carGasoline);
        smartPopulate('BgOutsourceWages', 'batchBg', mainRow.outsourceWages);
        smartPopulate('BgSkillAllowancePc', 'batchBg', mainRow.skillAllowancePc);
        smartPopulate('BgSalesManagementPc', 'batchBg', mainRow.salesManagementPc);
        smartPopulate('BgShelfStackingPc', 'batchBg', mainRow.shelfStackingPc);
        smartPopulate('BgDiligenceAllowancePc', 'batchBg', mainRow.diligenceAllowancePc);
        smartPopulate('BgPostAllowancePc', 'batchBg', mainRow.postAllowancePc);
        smartPopulate('BgPhoneAllowancePc', 'batchBg', mainRow.phoneAllowancePc);
        smartPopulate('BgTransportationPc', 'batchBg', mainRow.transportationPc);
        smartPopulate('BgOtherAllowancePc', 'batchBg', mainRow.otherAllowancePc);

        // Car & Fleet (5 fields)
        smartPopulate('BgCompCarsGas', 'batchBg', mainRow.compCarsGas);
        smartPopulate('BgCompCarsOther', 'batchBg', mainRow.compCarsOther);
        smartPopulate('BgCarRental', 'batchBg', mainRow.carRental);
        smartPopulate('BgCarRepair', 'batchBg', mainRow.carRepair);
        smartPopulate('BgCarMaintenance', 'batchBg', mainRow.carMaintenance);

        // BJC-Specific Fields (9 fields)
        smartPopulate('BgTemporaryStaffSal', 'batchBg', mainRow.temporaryStaffSal);
        smartPopulate('BgSalTemp', 'batchBg', mainRow.salTemp);
        smartPopulate('BgSocialSecurityTmp', 'batchBg', mainRow.socialSecurityTmp);
        smartPopulate('BgCarMaintenanceTmp', 'batchBg', mainRow.carMaintenanceTmp);
        smartPopulate('BgSouthriskAllowance', 'batchBg', mainRow.southriskAllowance);
        smartPopulate('BgSouthriskAllowanceTmp', 'batchBg', mainRow.southriskAllowanceTmp);
        smartPopulate('BgSalesCarAllowance', 'batchBg', mainRow.salesCarAllowance);
        smartPopulate('BgAccommodation', 'batchBg', mainRow.accommodation);
        smartPopulate('BgOthersSubjectTax', 'batchBg', mainRow.othersSubjectTax);

        // Benefits (10 fields)
        smartPopulate('BgSocialSecurity', 'batchBg', mainRow.socialSecurity);
        smartPopulate('BgWorkmenCompensation', 'batchBg', mainRow.workmenCompensation);
        smartPopulate('BgProvidentFund', 'batchBg', mainRow.providentFund);
        smartPopulate('BgOther', 'batchBg', mainRow.other);
        smartPopulate('BgLifeInsurance', 'batchBg', mainRow.lifeInsurance);
        smartPopulate('BgMedicalOutside', 'batchBg', mainRow.medicalOutside);
        smartPopulate('BgMedicalInHouse', 'batchBg', mainRow.medicalInhouse);
        smartPopulate('BgStaffActivities', 'batchBg', mainRow.staffActivities);
        smartPopulate('BgUniform', 'batchBg', mainRow.uniform);
        smartPopulate('BgMealAllowance', 'batchBg', mainRow.mealAllowance);

        // PE Calculations (4 fields)
        smartPopulate('BgPeMth', 'batchBg', mainRow.peMth);
        smartPopulate('BgPeYear', 'batchBg', mainRow.peYear);
        smartPopulate('BgPeSbMth', 'batchBg', mainRow.peSbMth);
        smartPopulate('BgPeSbYear', 'batchBg', mainRow.peSbYear);

        // Special handling for BJC Bonus Type fields (string values)
        const leBonusTypeFieldId = `batchLe${rowNum}_LeBonusType`;
        const leBonusTypeField = document.getElementById(leBonusTypeFieldId);
        if (leBonusTypeField && mainRow.bonusTypeLe) {
          const currentLeBonusType = leBonusTypeField.value;
          if (!currentLeBonusType || currentLeBonusType === '') {
            leBonusTypeField.value = mainRow.bonusTypeLe;
            console.log(`✅ Populated ${leBonusTypeFieldId}: ${mainRow.bonusTypeLe}`);
          } else {
            console.log(`⏭️ Skip ${leBonusTypeFieldId}: Current value = ${currentLeBonusType}`);
          }
        }

        const bgBonusTypeFieldId = `batchBg${rowNum}_BgBonusType`;
        const bgBonusTypeField = document.getElementById(bgBonusTypeFieldId);
        if (bgBonusTypeField && mainRow.bonusType) {
          const currentBgBonusType = bgBonusTypeField.value;
          if (!currentBgBonusType || currentBgBonusType === '') {
            bgBonusTypeField.value = mainRow.bonusType;
            console.log(`✅ Populated ${bgBonusTypeFieldId}: ${mainRow.bonusType}`);
          } else {
            console.log(`⏭️ Skip ${bgBonusTypeFieldId}: Current value = ${currentBgBonusType}`);
          }
        }
      }
      else if (companyId === 2) {
        // ═══════════════════════════════════════════════════════════════
        // 🏢 BIGC COMPANY (CompanyId = 2) - 51 FIELDS
        // ═══════════════════════════════════════════════════════════════

        console.log('📝 Populating BIGC LE Fields (26 fields)...');
        smartPopulate('LePayroll', 'batchLe', mainRow.payrollLe);
        smartPopulate('LePremium', 'batchLe', mainRow.premiumLe);
        smartPopulate('LeTotalPayroll', 'batchLe', mainRow.totalPayrollLe);
        smartPopulate('LeBonus', 'batchLe', mainRow.bonusLe);
        smartPopulate('LeFleetCardPe', 'batchLe', mainRow.fleetCardPeLe);
        smartPopulate('LeCarAllowance', 'batchLe', mainRow.carAllowanceLe);
        smartPopulate('LeLicenseAllowance', 'batchLe', mainRow.licenseAllowanceLe);
        smartPopulate('LeHousingAllowance', 'batchLe', mainRow.housingAllowanceLe);
        smartPopulate('LeGasolineAllowance', 'batchLe', mainRow.gasolineAllowanceLe);
        smartPopulate('LeWageStudent', 'batchLe', mainRow.wageStudentLe);
        smartPopulate('LeCarRentalPe', 'batchLe', mainRow.carRentalPeLe);
        smartPopulate('LeSkillPayAllowance', 'batchLe', mainRow.skillPayAllowanceLe);
        smartPopulate('LeOtherAllowance', 'batchLe', mainRow.otherAllowanceLe);
        smartPopulate('LeSocialSecurity', 'batchLe', mainRow.socialSecurityLe);
        smartPopulate('LeLaborFundFee', 'batchLe', mainRow.laborFundFeeLe);
        smartPopulate('LeOtherStaffBenefit', 'batchLe', mainRow.otherStaffBenefitLe);
        smartPopulate('LeProvidentFund', 'batchLe', mainRow.providentFundLe);
        smartPopulate('LeProvision', 'batchLe', mainRow.provisionLe);
        smartPopulate('LeInterest', 'batchLe', mainRow.interestLe);
        smartPopulate('LeStaffInsurance', 'batchLe', mainRow.staffInsuranceLe);
        smartPopulate('LeMedicalExpense', 'batchLe', mainRow.medicalExpenseLe);
        smartPopulate('LeMedicalInHouse', 'batchLe', mainRow.medicalInhouseLe);
        smartPopulate('LeTraining', 'batchLe', mainRow.trainingLe);
        smartPopulate('LeLongService', 'batchLe', mainRow.longServiceLe);
        smartPopulate('LePeSbMth', 'batchLe', mainRow.peSbMthLe);
        smartPopulate('LePeSbYear', 'batchLe', mainRow.peSbYearLe);

        smartPopulate('LePeMth', 'batchLe', mainRow.peMthLe);
        smartPopulate('LePeYear', 'batchLe', mainRow.peYearLe);

        console.log('📝 Populating Budget Year Fields (25 fields)...');
        smartPopulate('BgPayroll', 'batchBg', mainRow.payroll);
        smartPopulate('BgPremium', 'batchBg', mainRow.premium);
        smartPopulate('BgTotalPayroll', 'batchBg', mainRow.totalPayroll);
        smartPopulate('BgBonus', 'batchBg', mainRow.bonus);

        // Special handling for string field (BONUS_TYPE)
        const bonusTypeFieldId = `batchBg${rowNum}_BonusType`;
        const bonusTypeField = document.getElementById(bonusTypeFieldId);
        if (bonusTypeField && mainRow.bonusTypes) {
          const currentBonusType = bonusTypeField.value;
          if (!currentBonusType || currentBonusType === '') {
            bonusTypeField.value = mainRow.bonusTypes;
            console.log(`✅ Populated ${bonusTypeFieldId}: ${mainRow.bonusTypes}`);
          } else {
            console.log(`⏭️ Skip ${bonusTypeFieldId}: Current value = ${currentBonusType}`);
          }
        }

        smartPopulate('BgFleetCardPe', 'batchBg', mainRow.fleetCardPe);
        smartPopulate('BgCarAllowance', 'batchBg', mainRow.carAllowance);
        smartPopulate('BgLicenseAllowance', 'batchBg', mainRow.licenseAllowance);
        smartPopulate('BgHousingAllowance', 'batchBg', mainRow.housingAllowance);
        smartPopulate('BgGasolineAllowance', 'batchBg', mainRow.gasolineAllowance);
        smartPopulate('BgWageStudent', 'batchBg', mainRow.wageStudent);
        smartPopulate('BgCarRentalPe', 'batchBg', mainRow.carRentalPe);
        smartPopulate('BgSkillPayAllowance', 'batchBg', mainRow.skillPayAllowance);
        smartPopulate('BgOtherAllowance', 'batchBg', mainRow.otherAllowance);
        smartPopulate('BgSocialSecurity', 'batchBg', mainRow.socialSecurity);
        smartPopulate('BgLaborFundFee', 'batchBg', mainRow.laborFundFee);
        smartPopulate('BgOtherStaffBenefit', 'batchBg', mainRow.otherStaffBenefit);
        smartPopulate('BgProvidentFund', 'batchBg', mainRow.providentFund);
        smartPopulate('BgProvision', 'batchBg', mainRow.provision);
        smartPopulate('BgInterest', 'batchBg', mainRow.interest);
        smartPopulate('BgStaffInsurance', 'batchBg', mainRow.staffInsurance);
        smartPopulate('BgMedicalExpense', 'batchBg', mainRow.medicalExpense);
        smartPopulate('BgMedicalInHouse', 'batchBg', mainRow.medicalInhouse);
        smartPopulate('BgTraining', 'batchBg', mainRow.training);
        smartPopulate('BgLongService', 'batchBg', mainRow.longService);
        smartPopulate('BgPeSbMth', 'batchBg', mainRow.peSbMth);
        smartPopulate('BgPeSbYear', 'batchBg', mainRow.peSbYear);

        smartPopulate('BgPeMth', 'batchBg', mainRow.peMth);
        smartPopulate('BgPeYear', 'batchBg', mainRow.peYear);
      }
      // Trigger change events for dependent calculations
      console.log('🔄 Triggering dependent field recalculations...');
      const payrollLeField = document.getElementById(`batchLe${rowNum}_LePayroll`);
      if (payrollLeField) {
        $(payrollLeField).trigger('change');
      }

      // ═══════════════════════════════════════════════════════════════
      // ⭐ PHASE 4: CALCULATE & UPDATE SUMMARY FIELDS (budget.plan.calculation.js)
      // ═══════════════════════════════════════════════════════════════
      if (typeof BudgetCalculation !== 'undefined') {
        console.log('🧮 [Phase 4] Calculating and updating summary fields...');

        // ────────────────────────────────────────────────────────────
        // STEP 1: Build complete rowData with ALL benefit fields from DOM
        // ⚠️ CRITICAL: Read from DOM elements (user input), NOT from API response
        // ────────────────────────────────────────────────────────────

        /**
         * Helper function to safely get value from DOM element
         * @param {string} elementId - Element ID to read from
         * @returns {number} Parsed float value or 0
         */
        const getFieldValue = (elementId) => {
          const element = document.getElementById(elementId);
          return element ? (parseFloat(element.value) || 0) : 0;
        };

        const rowData = {
          le_of_month: leOfMonth || 0
        };

        if (isBJC) {
          // ═══════════════════════════════════════════════════════════
          // 🏢 BJC COMPANY (CompanyId = 1) - READ ALL BENEFIT FIELDS FROM DOM
          // ═══════════════════════════════════════════════════════════

          // LE benefit fields (24 fields)
          rowData.salWithEnLe = getFieldValue(`batchLe${rowNum}_LeSalWithEn`);
          rowData.salNotEnLe = getFieldValue(`batchLe${rowNum}_LeSalNotEn`);
          rowData.temporaryStaffSalLe = getFieldValue(`batchLe${rowNum}_LeTemporaryStaffSal`);
          rowData.salTempLe = getFieldValue(`batchLe${rowNum}_LeSalTemp`);
          rowData.overtimeLe = getFieldValue(`batchLe${rowNum}_LeOvertime`);
          rowData.premiumLe = getFieldValue(`batchLe${rowNum}_LePremium`);
          rowData.bonusLe = getFieldValue(`batchLe${rowNum}_LeBonus`);
          rowData.gasolineAllowanceLe = getFieldValue(`batchLe${rowNum}_LeGasolineAllowance`);
          rowData.healthCareLe = getFieldValue(`batchLe${rowNum}_LeHealthCare`);
          rowData.vehicleAllowanceLe = getFieldValue(`batchLe${rowNum}_LeVehicleAllowance`);
          rowData.diligenceAllowanceLe = getFieldValue(`batchLe${rowNum}_LeDiligenceAllowance`);
          rowData.postAllowanceLe = getFieldValue(`batchLe${rowNum}_LePostAllowance`);
          rowData.phoneAllowanceLe = getFieldValue(`batchLe${rowNum}_LePhoneAllowance`);
          rowData.transportationLe = getFieldValue(`batchLe${rowNum}_LeTransportation`);
          rowData.otherAllowanceLe = getFieldValue(`batchLe${rowNum}_LeOtherAllowance`);
          rowData.diligenceAllowancePcLe = getFieldValue(`batchLe${rowNum}_LeDiligenceAllowancePc`);
          rowData.postAllowancePcLe = getFieldValue(`batchLe${rowNum}_LePostAllowancePc`);
          rowData.phoneAllowancePcLe = getFieldValue(`batchLe${rowNum}_LePhoneAllowancePc`);
          rowData.transportationPcLe = getFieldValue(`batchLe${rowNum}_LeTransportationPc`);
          rowData.otherAllowancePcLe = getFieldValue(`batchLe${rowNum}_LeOtherAllowancePc`);
          rowData.compCarsGasLe = getFieldValue(`batchLe${rowNum}_LeCompCarsGas`);
          rowData.compCarsOtherLe = getFieldValue(`batchLe${rowNum}_LeCompCarsOther`);
          rowData.carRentalLe = getFieldValue(`batchLe${rowNum}_LeCarRental`);
          rowData.carRepairLe = getFieldValue(`batchLe${rowNum}_LeCarRepair`);

          // Budget benefit fields (24 fields)
          rowData.salWithEn = getFieldValue(`batchBg${rowNum}_BgSalWithEn`);
          rowData.salNotEn = getFieldValue(`batchBg${rowNum}_BgSalNotEn`);
          rowData.temporaryStaffSal = getFieldValue(`batchBg${rowNum}_BgTemporaryStaffSal`);
          rowData.salTemp = getFieldValue(`batchBg${rowNum}_BgSalTemp`);
          rowData.overtime = getFieldValue(`batchBg${rowNum}_BgOvertime`);
          rowData.premium = getFieldValue(`batchBg${rowNum}_BgPremium`);
          rowData.bonus = getFieldValue(`batchBg${rowNum}_BgBonus`);
          rowData.gasolineAllowance = getFieldValue(`batchBg${rowNum}_BgGasolineAllowance`);
          rowData.healthCare = getFieldValue(`batchBg${rowNum}_BgHealthCare`);
          rowData.vehicleAllowance = getFieldValue(`batchBg${rowNum}_BgVehicleAllowance`);
          rowData.diligenceAllowance = getFieldValue(`batchBg${rowNum}_BgDiligenceAllowance`);
          rowData.postAllowance = getFieldValue(`batchBg${rowNum}_BgPostAllowance`);
          rowData.phoneAllowance = getFieldValue(`batchBg${rowNum}_BgPhoneAllowance`);
          rowData.transportation = getFieldValue(`batchBg${rowNum}_BgTransportation`);
          rowData.otherAllowance = getFieldValue(`batchBg${rowNum}_BgOtherAllowance`);
          rowData.diligenceAllowancePc = getFieldValue(`batchBg${rowNum}_BgDiligenceAllowancePc`);
          rowData.postAllowancePc = getFieldValue(`batchBg${rowNum}_BgPostAllowancePc`);
          rowData.phoneAllowancePc = getFieldValue(`batchBg${rowNum}_BgPhoneAllowancePc`);
          rowData.transportationPc = getFieldValue(`batchBg${rowNum}_BgTransportationPc`);
          rowData.otherAllowancePc = getFieldValue(`batchBg${rowNum}_BgOtherAllowancePc`);
          rowData.compCarsGas = getFieldValue(`batchBg${rowNum}_BgCompCarsGas`);
          rowData.compCarsOther = getFieldValue(`batchBg${rowNum}_BgCompCarsOther`);
          rowData.carRental = getFieldValue(`batchBg${rowNum}_BgCarRental`);
          rowData.carRepair = getFieldValue(`batchBg${rowNum}_BgCarRepair`);

        } else {
          // ═══════════════════════════════════════════════════════════
          // 🏢 BIGC COMPANY (CompanyId = 2) - READ ALL BENEFIT FIELDS FROM DOM
          // ═══════════════════════════════════════════════════════════

          // LE benefit fields (23 fields)
          rowData.payroll = getFieldValue(`batchLe${rowNum}_LePayroll`);
          rowData.premiumLe = getFieldValue(`batchLe${rowNum}_LePremium`);
          rowData.bonusLe = getFieldValue(`batchLe${rowNum}_LeBonus`);
          rowData.fleetCardPeLe = getFieldValue(`batchLe${rowNum}_LeFleetCardPe`);
          rowData.carAllowanceLe = getFieldValue(`batchLe${rowNum}_LeCarAllowance`);
          rowData.licenseAllowanceLe = getFieldValue(`batchLe${rowNum}_LeLicenseAllowance`);
          rowData.housingAllowanceLe = getFieldValue(`batchLe${rowNum}_LeHousingAllowance`);
          rowData.gasolineAllowanceLe = getFieldValue(`batchLe${rowNum}_LeGasolineAllowance`);
          rowData.wageStudentLe = getFieldValue(`batchLe${rowNum}_LeWageStudent`);
          rowData.carRentalPeLe = getFieldValue(`batchLe${rowNum}_LeCarRentalPe`);
          rowData.skillPayAllowanceLe = getFieldValue(`batchLe${rowNum}_LeSkillPayAllowance`);
          rowData.otherAllowanceLe = getFieldValue(`batchLe${rowNum}_LeOtherAllowance`);
          rowData.socialSecurityLe = getFieldValue(`batchLe${rowNum}_LeSocialSecurity`);
          rowData.laborFundFeeLe = getFieldValue(`batchLe${rowNum}_LeLaborFundFee`);
          rowData.otherStaffBenefitLe = getFieldValue(`batchLe${rowNum}_LeOtherStaffBenefit`);
          rowData.providentFundLe = getFieldValue(`batchLe${rowNum}_LeProvidentFund`);
          rowData.provisionLe = getFieldValue(`batchLe${rowNum}_LeProvision`);
          rowData.interestLe = getFieldValue(`batchLe${rowNum}_LeInterest`);
          rowData.staffInsuranceLe = getFieldValue(`batchLe${rowNum}_LeStaffInsurance`);
          rowData.medicalExpenseLe = getFieldValue(`batchLe${rowNum}_LeMedicalExpense`);
          rowData.medicalInhouseLe = getFieldValue(`batchLe${rowNum}_LeMedicalInHouse`);
          rowData.trainingLe = getFieldValue(`batchLe${rowNum}_LeTraining`);
          rowData.longServiceLe = getFieldValue(`batchLe${rowNum}_LeLongService`);

          // Budget benefit fields (23 fields)
          rowData.totalPayroll = getFieldValue(`batchBg${rowNum}_BgTotalPayroll`);
          rowData.premium = getFieldValue(`batchBg${rowNum}_BgPremium`);
          rowData.bonus = getFieldValue(`batchBg${rowNum}_BgBonus`);
          rowData.fleetCardPe = getFieldValue(`batchBg${rowNum}_BgFleetCardPe`);
          rowData.carAllowance = getFieldValue(`batchBg${rowNum}_BgCarAllowance`);
          rowData.licenseAllowance = getFieldValue(`batchBg${rowNum}_BgLicenseAllowance`);
          rowData.housingAllowance = getFieldValue(`batchBg${rowNum}_BgHousingAllowance`);
          rowData.gasolineAllowance = getFieldValue(`batchBg${rowNum}_BgGasolineAllowance`);
          rowData.wageStudent = getFieldValue(`batchBg${rowNum}_BgWageStudent`);
          rowData.carRentalPe = getFieldValue(`batchBg${rowNum}_BgCarRentalPe`);
          rowData.skillPayAllowance = getFieldValue(`batchBg${rowNum}_BgSkillPayAllowance`);
          rowData.otherAllowance = getFieldValue(`batchBg${rowNum}_BgOtherAllowance`);
          rowData.socialSecurity = getFieldValue(`batchBg${rowNum}_BgSocialSecurity`);
          rowData.laborFundFee = getFieldValue(`batchBg${rowNum}_BgLaborFundFee`);
          rowData.otherStaffBenefit = getFieldValue(`batchBg${rowNum}_BgOtherStaffBenefit`);
          rowData.providentFund = getFieldValue(`batchBg${rowNum}_BgProvidentFund`);
          rowData.provision = getFieldValue(`batchBg${rowNum}_BgProvision`);
          rowData.interest = getFieldValue(`batchBg${rowNum}_BgInterest`);
          rowData.staffInsurance = getFieldValue(`batchBg${rowNum}_BgStaffInsurance`);
          rowData.medicalExpense = getFieldValue(`batchBg${rowNum}_BgMedicalExpense`);
          rowData.medicalInhouse = getFieldValue(`batchBg${rowNum}_BgMedicalInHouse`);
          rowData.training = getFieldValue(`batchBg${rowNum}_BgTraining`);
          rowData.longService = getFieldValue(`batchBg${rowNum}_BgLongService`);
        }

        console.log(`📊 [Phase 4] Read benefit fields from DOM for Row ${rowNum}:`, {
          sample_LE: isBJC ? rowData.gasolineAllowanceLe : rowData.gasolineAllowanceLe,
          sample_BG: isBJC ? rowData.gasolineAllowance : rowData.gasolineAllowance
        });

        // ────────────────────────────────────────────────────────────
        // STEP 2: Calculate summary fields (mutates rowData)
        // ────────────────────────────────────────────────────────────
        console.log('🔢 [Phase 4] Calculating summary fields using BudgetCalculation...', rowData);
        BudgetCalculation.populateSummaryFields(rowData, companyId);
        console.log('✅ [Phase 4] Summary fields calculated:', {
          pe_sb_mth_le: rowData.pe_sb_mth_le,
          pe_mth_le: rowData.pe_mth_le,
          pe_sb_le: rowData.pe_sb_le,
          pe_year_le: rowData.pe_year_le,
          pe_sb_mth: rowData.pe_sb_mth,
          pe_mth: rowData.pe_mth,
          pe_sb_year: rowData.pe_sb_year,
          pe_year: rowData.pe_year
        });

        // ────────────────────────────────────────────────────────────
        // STEP 2.5: Fallback to API values if calculated = 0
        // ────────────────────────────────────────────────────────────
        const useApiAsFallback = (calculatedValue, apiValue, fieldName) => {
          if (calculatedValue === 0 && apiValue && apiValue !== 0) {
            console.log(`⚠️ [Phase 4] Using API value for ${fieldName}: ${apiValue} (calculated was 0)`);
            return apiValue;
          }
          return calculatedValue;
        };

        // Apply fallback for all 8 summary fields
        rowData.pe_sb_mth_le = useApiAsFallback(rowData.pe_sb_mth_le, mainRow.peSbMthLe, 'pe_sb_mth_le');
        rowData.pe_mth_le = useApiAsFallback(rowData.pe_mth_le, mainRow.peMthLe, 'pe_mth_le');
        rowData.pe_sb_le = useApiAsFallback(rowData.pe_sb_le, mainRow.peSbYearLe, 'pe_sb_le');
        rowData.pe_year_le = useApiAsFallback(rowData.pe_year_le, mainRow.peYearLe, 'pe_year_le');
        rowData.pe_sb_mth = useApiAsFallback(rowData.pe_sb_mth, mainRow.peSbMth, 'pe_sb_mth');
        rowData.pe_mth = useApiAsFallback(rowData.pe_mth, mainRow.peMth, 'pe_mth');
        rowData.pe_sb_year = useApiAsFallback(rowData.pe_sb_year, mainRow.peSbYear, 'pe_sb_year');
        rowData.pe_year = useApiAsFallback(rowData.pe_year, mainRow.peYear, 'pe_year');

        console.log('✅ [Phase 4] Final summary fields (with API fallback):', {
          pe_sb_mth_le: rowData.pe_sb_mth_le,
          pe_mth_le: rowData.pe_mth_le,
          pe_sb_le: rowData.pe_sb_le,
          pe_year_le: rowData.pe_year_le,
          pe_sb_mth: rowData.pe_sb_mth,
          pe_mth: rowData.pe_mth,
          pe_sb_year: rowData.pe_sb_year,
          pe_year: rowData.pe_year
        });

        // ────────────────────────────────────────────────────────────
        // STEP 3: Update DOM elements with calculated values
        // ────────────────────────────────────────────────────────────
        const summaryFields = [
          // LE Summary Fields
          { id: `batchLe${rowNum}_LePeSbMth`, value: rowData.pe_sb_mth_le, label: 'PE S&B/Month LE' },//batchLe1_LePeSbMth
          { id: `batchLe${rowNum}_LePeMth`, value: rowData.pe_mth_le, label: 'PE/Month LE' },//batchLe1_LePeMth
          { id: `batchLe${rowNum}_LePeSbYear`, value: rowData.pe_sb_le, label: 'PE S&B Year LE' },//batchLe1_LePeSbYear (Year, not just "LE")
          { id: `batchLe${rowNum}_LePeYear`, value: rowData.pe_year_le, label: 'PE Year LE' },//batchLe1_LePeYear

          // Budget Summary Fields
          { id: `batchBg${rowNum}_BgPeSbMth`, value: rowData.pe_sb_mth, label: 'PE S&B/Month Budget' },//batchBg1_BgPeSbMth
          { id: `batchBg${rowNum}_BgPeMth`, value: rowData.pe_mth, label: 'PE/Month Budget' },//batchBg1_BgPeMth
          { id: `batchBg${rowNum}_BgPeSbYear`, value: rowData.pe_sb_year, label: 'PE S&B Year Budget' },//batchBg1_BgPeSbYear
          { id: `batchBg${rowNum}_BgPeYear`, value: rowData.pe_year, label: 'PE Year Budget' }//batchBg1_BgPeYear
        ];

        let updatedCount = 0;
        summaryFields.forEach(field => {
          const element = document.getElementById(field.id);
          if (element && field.value !== undefined && field.value !== null) {
            element.value = field.value.toFixed(2);
            updatedCount++;
            console.log(`✅ Updated ${field.label}: ${field.value.toFixed(2)}`);
          } else if (!element) {
            console.warn(`⚠️ Element not found: ${field.id}`);
          }
        });

        console.log(`✅ [Phase 4] Updated ${updatedCount}/${summaryFields.length} summary fields in UI`);

        // ────────────────────────────────────────────────────────────
        // STEP 4: Validate against API values (optional check)
        // ────────────────────────────────────────────────────────────
        const apiValues = {
          pe_sb_mth_le: mainRow.peSbMthLe || 0,
          pe_mth_le: mainRow.peMthLe || 0,
          pe_sb_le: mainRow.peSbYearLe || 0,      // ⚠️ API uses peSbYearLe for yearly value
          pe_year_le: mainRow.peYearLe || 0,
          pe_sb_mth: mainRow.peSbMth || 0,
          pe_mth: mainRow.peMth || 0,
          pe_sb_year: mainRow.peSbYear || 0,
          pe_year: mainRow.peYear || 0
        };

        // Create comparison object with both calculated and API values
        const comparisonData = {
          ...rowData,
          // Override with API values for comparison
          api_pe_sb_mth_le: apiValues.pe_sb_mth_le,
          api_pe_mth_le: apiValues.pe_mth_le,
          api_pe_sb_le: apiValues.pe_sb_le,
          api_pe_year_le: apiValues.pe_year_le,
          api_pe_sb_mth: apiValues.pe_sb_mth,
          api_pe_mth: apiValues.pe_mth,
          api_pe_sb_year: apiValues.pe_sb_year,
          api_pe_year: apiValues.pe_year
        };

        const validation = BudgetCalculation.validateSummaryFields(
          comparisonData,
          companyId,
          0.02 // 2% tolerance
        );

        if (!validation.isValid) {
          console.warn(`⚠️ [Phase 4] Minor discrepancies detected (within tolerance):`);
          validation.errors.forEach(err => {
            console.warn(`  ${err.field}: Calculated=${err.calculatedValue.toFixed(2)}, API=${err.apiValue.toFixed(2)}, Diff=${err.difference.toFixed(2)}%`);
          });
        } else {
          console.log(`✅ [Phase 4] Validation passed - calculated values match API values`);
        }

      } else {
        console.warn('⚠️ [Phase 4] BudgetCalculation module not loaded - skipping calculation');
      }

      // 🏷️ Phase 3 Task 3.1: Mark row as calculated
      this.markRowAsCalculated(rowNum);

      showSuccessModal(`✅ คำนวณสำเร็จ! Row ${rowNumber} (${companyType})`);
      console.log(`✅ [Cal Button] Row ${rowNumber} calculated successfully`);

    } catch (error) {
      console.error('❌ Calculation error:', error);
      showErrorModal(`❌ เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      // ============================================
      // STEP 8: Restore button state
      // ============================================
      if (calButton) {
        calButton.disabled = false;
        calButton.innerHTML = originalText;
      }
    }
  },

  // ───────────────────────────────────────────────────────────────────
  // ⚡ DEBOUNCED CASCADE UPDATE FUNCTIONS
  // ───────────────────────────────────────────────────────────────────

  // Update Cost Centers for batch row (Original pattern)
  updateBatchRowCostCenters: function (rowElement, rowId) {
    const companyID = rowElement.querySelector('.batch-company')?.value;
    const selectedCobu = rowElement.querySelector('.batch-cobu')?.value;
    const selectedYear = rowElement.querySelector('.batch-year')?.value;
    const costCenterSelect = rowElement.querySelector('.batch-cost-center');

    if (!costCenterSelect || !companyID) return;

    let costCenterParams = [];
    if (companyID) costCenterParams.push(`companyID=${companyID}`);
    if (selectedCobu) costCenterParams.push(`Cobu=${encodeURIComponent(selectedCobu)}`);
    if (selectedYear) costCenterParams.push(`budgetYear=${encodeURIComponent(selectedYear)}`);
    const costCenterQuery = costCenterParams.length ? `?${costCenterParams.join('&')}` : '';

    this.populateDropdownAsync(costCenterSelect, `${BUDGET_API.costCenters}${costCenterQuery}`, FIELD_CONFIGURATIONS.dropdownPlaceholders.costCenter, (option, item) => {
      option.value = item.costCenterCode;
      option.textContent = `${item.costCenterName} (${item.costCenterCode})`;
    })
      .then(() => {
        console.log(`✅ Cost Centers populated for ${rowId}`);
      })
      .catch(error => {
        console.error(`❌ Error populating Cost Centers for ${rowId}:`, error);
      });
  },

  // Update Divisions for batch row (Original pattern)
  updateBatchRowDivisions: function (rowElement, rowId) {
    const companyID = rowElement.querySelector('.batch-company')?.value;
    const selectedCobu = rowElement.querySelector('.batch-cobu')?.value;
    const selectedYear = rowElement.querySelector('.batch-year')?.value;
    const selectedCostCenter = rowElement.querySelector('.batch-cost-center')?.value;
    const divisionSelect = rowElement.querySelector('.batch-division');

    const isAllocationMaster = rowElement.getAttribute('data-allocation-mode') === 'true' &&
      rowElement.querySelector('.allocation-row-number')?.textContent === '1';

    if (!divisionSelect || !companyID) return;

    let divisionParams = [];
    if (companyID) divisionParams.push(`companyID=${companyID}`);
    if (selectedCobu) divisionParams.push(`Cobu=${encodeURIComponent(selectedCobu)}`);
    if (selectedYear) divisionParams.push(`budgetYear=${encodeURIComponent(selectedYear)}`);
    if (!isAllocationMaster) {
      if (selectedCostCenter) divisionParams.push(`costCenterCode=${encodeURIComponent(selectedCostCenter)}`);
    }
    const divisionQuery = divisionParams.length ? `?${divisionParams.join('&')}` : '';

    this.populateDropdownAsync(divisionSelect, `${BUDGET_API.divisions}${divisionQuery}`, FIELD_CONFIGURATIONS.dropdownPlaceholders.division, (option, item) => {
      option.value = item;
      option.textContent = item;
    })
      .then(() => {
        console.log(`✅ Divisions populated for ${rowId}`);
      })
      .catch(error => {
        console.error(`❌ Error populating Divisions for ${rowId}:`, error);
      });
  },

  // Update Departments for batch row (Original pattern)
  updateBatchRowDepartments: function (rowElement, rowId) {
    const companyID = rowElement.querySelector('.batch-company')?.value;
    const selectedCobu = rowElement.querySelector('.batch-cobu')?.value;
    const selectedYear = rowElement.querySelector('.batch-year')?.value;
    const selectedCostCenter = rowElement.querySelector('.batch-cost-center')?.value;
    const selectedDivision = rowElement.querySelector('.batch-division')?.value;
    const departmentSelect = rowElement.querySelector('.batch-department');

    const isAllocationMaster = rowElement.getAttribute('data-allocation-mode') === 'true' &&
      rowElement.querySelector('.allocation-row-number')?.textContent === '1';

    if (!departmentSelect || !companyID) return;

    let departmentParams = [];
    if (companyID) departmentParams.push(`companyID=${companyID}`);
    if (selectedCobu) departmentParams.push(`Cobu=${encodeURIComponent(selectedCobu)}`);
    if (selectedYear) departmentParams.push(`budgetYear=${encodeURIComponent(selectedYear)}`);
    if (!isAllocationMaster) {
      if (selectedCostCenter) departmentParams.push(`costCenterCode=${encodeURIComponent(selectedCostCenter)}`);
    }
    if (selectedDivision) departmentParams.push(`divisionCode=${encodeURIComponent(selectedDivision)}`);
    const departmentQuery = departmentParams.length ? `?${departmentParams.join('&')}` : '';

    this.populateDropdownAsync(departmentSelect, `${BUDGET_API.departments}${departmentQuery}`, FIELD_CONFIGURATIONS.dropdownPlaceholders.department, (option, item) => {
      option.value = item;
      option.textContent = item;
    })
      .then(() => {
        console.log(`✅ Departments populated for ${rowId}`);
      })
      .catch(error => {
        console.error(`❌ Error populating Departments for ${rowId}:`, error);
      });
  },

  // Update Sections for batch row (Original pattern)
  updateBatchRowSections: function (rowElement, rowId) {
    const companyID = rowElement.querySelector('.batch-company')?.value;
    const selectedCobu = rowElement.querySelector('.batch-cobu')?.value;
    const selectedYear = rowElement.querySelector('.batch-year')?.value;
    const selectedCostCenter = rowElement.querySelector('.batch-cost-center')?.value;
    const selectedDivision = rowElement.querySelector('.batch-division')?.value;
    const selectedDepartment = rowElement.querySelector('.batch-department')?.value;
    const sectionSelect = rowElement.querySelector('.batch-section');

    const isAllocationMaster = rowElement.getAttribute('data-allocation-mode') === 'true' &&
      rowElement.querySelector('.allocation-row-number')?.textContent === '1';

    if (!sectionSelect || !companyID) return;

    let sectionParams = [];
    if (companyID) sectionParams.push(`companyID=${companyID}`);
    if (selectedCobu) sectionParams.push(`Cobu=${encodeURIComponent(selectedCobu)}`);
    if (selectedYear) sectionParams.push(`budgetYear=${encodeURIComponent(selectedYear)}`);
    if (!isAllocationMaster) {
      if (selectedCostCenter) sectionParams.push(`costCenterCode=${encodeURIComponent(selectedCostCenter)}`);
    }
    if (selectedDivision) sectionParams.push(`divisionCode=${encodeURIComponent(selectedDivision)}`);
    if (selectedDepartment) sectionParams.push(`departmentCode=${encodeURIComponent(selectedDepartment)}`);
    const sectionQuery = sectionParams.length ? `?${sectionParams.join('&')}` : '';

    this.populateDropdownAsync(sectionSelect, `${BUDGET_API.sections}${sectionQuery}`, FIELD_CONFIGURATIONS.dropdownPlaceholders.section, (option, item) => {
      option.value = item;
      option.textContent = item;
    })
      .then(() => {
        console.log(`✅ Sections populated for ${rowId}`);
      })
      .catch(error => {
        console.error(`❌ Error populating Sections for ${rowId}:`, error);
      });
  },

  // Update CompStore for batch row (Original pattern)
  updateBatchRowCompStore: function (rowElement, rowId) {
    const companyID = rowElement.querySelector('.batch-company')?.value;
    const selectedCobu = rowElement.querySelector('.batch-cobu')?.value;
    const selectedYear = rowElement.querySelector('.batch-year')?.value;
    const selectedCostCenter = rowElement.querySelector('.batch-cost-center')?.value;
    const selectedDivision = rowElement.querySelector('.batch-division')?.value;
    const selectedDepartment = rowElement.querySelector('.batch-department')?.value;
    const selectedSection = rowElement.querySelector('.batch-section')?.value;
    const compstoreSelect = rowElement.querySelector('.batch-compstore');

    const isAllocationMaster = rowElement.getAttribute('data-allocation-mode') === 'true' &&
      rowElement.querySelector('.allocation-row-number')?.textContent === '1';

    if (!compstoreSelect || !companyID) return;

    let compstoreParams = [];
    if (companyID) compstoreParams.push(`companyID=${companyID}`);
    if (selectedCobu) compstoreParams.push(`Cobu=${encodeURIComponent(selectedCobu)}`);
    if (selectedYear) compstoreParams.push(`budgetYear=${encodeURIComponent(selectedYear)}`);
    if (!isAllocationMaster) {
      if (selectedCostCenter) compstoreParams.push(`costCenterCode=${encodeURIComponent(selectedCostCenter)}`);
    }
    if (selectedDivision) compstoreParams.push(`divisionCode=${encodeURIComponent(selectedDivision)}`);
    if (selectedDepartment) compstoreParams.push(`departmentCode=${encodeURIComponent(selectedDepartment)}`);
    if (selectedSection) compstoreParams.push(`sectionCode=${encodeURIComponent(selectedSection)}`);
    const compstoreQuery = compstoreParams.length ? `?${compstoreParams.join('&')}` : '';

    this.populateDropdownAsync(compstoreSelect, `${BUDGET_API.storeNames}${compstoreQuery}`, 'Select CompStore', (option, item) => {
      option.value = item;
      option.textContent = item;
    })
      .then(() => {
        console.log(`✅ CompStore populated for ${rowId}`);
      })
      .catch(error => {
        console.error(`❌ Error populating CompStore for ${rowId}:`, error);
      });
  },

  // Update Positions for batch row (Pattern B - SELECT_API)
  updateBatchRowPositions: function (rowElement, rowId) {
    const companyID = rowElement.querySelector('.batch-company')?.value;
    const positionSelect = rowElement.querySelector('.batch-position');

    if (!positionSelect || !companyID) return;

    this.populateDropdownAsync(positionSelect, `${SELECT_API.positions}?companyId=${companyID}`, 'Select Position', (option, item) => {
      option.value = item.positionCode;
      option.textContent = `${item.positionName} (${item.positionCode})`;
    })
      .then(() => {
        console.log(`✅ Positions populated for ${rowId}`);
      })
      .catch(error => {
        console.error(`❌ Error populating Positions for ${rowId}:`, error);
      });
  },

  // Update Job Bands for batch row (Pattern B - SELECT_API)
  updateBatchRowJobBands: function (rowElement, rowId) {
    const companyID = rowElement.querySelector('.batch-company')?.value;
    const selectedPosition = rowElement.querySelector('.batch-position')?.value;
    const jobBandSelect = rowElement.querySelector('.batch-job-band');

    if (!jobBandSelect || !companyID) return;

    let jobBandParams = [];
    if (companyID) jobBandParams.push(`companyId=${companyID}`);
    if (selectedPosition) jobBandParams.push(`positionCode=${encodeURIComponent(selectedPosition)}`);
    const jobBandQuery = jobBandParams.length ? `?${jobBandParams.join('&')}` : '';

    this.populateDropdownAsync(jobBandSelect, `${SELECT_API.jobBands}${jobBandQuery}`, 'Select Job Band', (option, item) => {
      option.value = item.jbCode;
      option.textContent = item.jbName;
    })
      .then(() => {
        console.log(`✅ Job Bands populated for ${rowId}`);
      })
      .catch(error => {
        console.error(`❌ Error populating Job Bands for ${rowId}:`, error);
      });
  },

  // Update Employee Status for batch row (Pattern B - SELECT_API)
  updateBatchRowEmployeeStatus: function (rowElement, rowId) {
    const companyID = rowElement.querySelector('.batch-company')?.value;
    const empStatusSelect = rowElement.querySelector('.batch-emp-status');  // 🔧 FIX: Get proper element

    if (!empStatusSelect || !companyID) return;

    let empStatusParams = [`statusType=Budget`];
    if (companyID) empStatusParams.push(`companyID=${companyID}`);
    const empStatusQuery = empStatusParams.length ? `?${empStatusParams.join('&')}` : '';

    this.populateDropdownAsync(empStatusSelect, `${SELECT_API.statuses}${empStatusQuery}`, 'Select Employee Status', (option, item) => {
      option.value = item.statusCode;
      option.textContent = item.statusName;
    })
      .then(() => {
        console.log(`✅ Employee Status populated for ${rowId}`);
      })
      .catch(error => {
        console.error(`❌ Error populating Employee Status for ${rowId}:`, error);
      });
  },

  // Update Batch Row Group Run Rate for batch row (Original pattern - BUDGET_API with all parameters)
  updateBatchRowGroupRunRates: function (rowElement, rowId) {
    const companyID = rowElement.querySelector('.batch-company')?.value;
    const selectedPlantCostCenter = rowElement.querySelector('.batch-plan-cost-center')?.value;
    const groupRunRateSelect = rowElement.querySelector('.batch-run-rate-group');

    if (!groupRunRateSelect || !companyID) return;

    let groupRunRateParams = [];
    if (companyID) groupRunRateParams.push(`companyId=${companyID}`);
    if (selectedPlantCostCenter) groupRunRateParams.push(`costCenterCode=${encodeURIComponent(selectedPlantCostCenter)}`);
    const groupRunRateQuery = groupRunRateParams.length ? `?${groupRunRateParams.join('&')}` : '';

    this.populateDropdownAsync(groupRunRateSelect, `${SELECT_API.groupRunRates}${groupRunRateQuery}`, 'Select Group Run Rate', (option, item) => {
      // 🔧 FIX: Use correct property names from API response
      option.value = item.runRateCode;
      option.textContent = `${item.runRateName}-[${item.grouping}] (${item.runRateValue}%)`;
    })
      .then(() => {
        console.log(`✅ Group Run Rates populated for ${rowId}`);
      })
      .catch(error => {
        console.error(`❌ Error populating Group Run Rates for ${rowId}:`, error);
      });
  },

  // Update ฺBatch Row Plan Cost Centers for batch row (Original pattern - BUDGET_API with all parameters)
  updateBatchRowPlanCostCenters: function (rowElement, rowId) {
    const companyID = rowElement.querySelector('.batch-company')?.value;
    const planCostCenterSelect = rowElement.querySelector('.batch-plan-cost-center');

    if (!planCostCenterSelect || !companyID) return;

    let planCostCenterParams = [];
    if (companyID) planCostCenterParams.push(`companyID=${companyID}`);
    const planCostCenterQuery = planCostCenterParams.length ? `?${planCostCenterParams.join('&')}` : '';

    this.populateDropdownAsync(planCostCenterSelect, `${BUDGET_API.costCenters}${planCostCenterQuery}`, 'Select Plan Cost Center', (option, item) => {
      option.value = item.costCenterCode;
      option.textContent = `${item.costCenterName} (${item.costCenterCode})`;
    })
      .then(() => {
        console.log(`✅ Plan Cost Centers populated for ${rowId}`);
      })
      .catch(error => {
        console.error(`❌ Error populating Plan Cost Centers for ${rowId}:`, error);
      });
  },

  // Update Salary Structures for batch row (Original pattern)
  updateBatchRowSalaryStructures: function (rowElement, rowId) {
    const companyID = rowElement.querySelector('.batch-company')?.value;
    const selectedJobBand = rowElement.querySelector('.batch-job-band')?.value;
    const salaryStructureSelect = rowElement.querySelector('.batch-salary-structure');

    if (!salaryStructureSelect || !companyID) return;

    let salaryStructureParams = [];
    if (companyID) salaryStructureParams.push(`companyId=${companyID}`);
    if (selectedJobBand) salaryStructureParams.push(`jobBand=${encodeURIComponent(selectedJobBand)}`);
    const salaryStructureQuery = salaryStructureParams.length ? `?${salaryStructureParams.join('&')}` : '';

    this.populateDropdownAsync(salaryStructureSelect, `${SELECT_API.salaryranges}${salaryStructureQuery}`, 'Select Salary Structure', (option, item) => {
      option.value = item.midSalary;
      option.textContent = item.functionName;
    })
      .then(() => {
        console.log(`✅ Salary Structures populated for ${rowId}`);
      })
      .catch(error => {
        console.error(`❌ Error populating Salary Structures for ${rowId}:`, error);
      });
  },

  // 🆕 Update Employee Level based on Job Band IsExc API call (Pattern A - Debounced)
  updateBatchRowEmployeeLevel: function (rowElement, rowId) {
    const companyID = rowElement.querySelector('.batch-company')?.value;
    const selectedJobBand = rowElement.querySelector('.batch-job-band')?.value;
    const employeeLevelSelect = rowElement.querySelector('.batch-employee-level');

    if (!employeeLevelSelect || !companyID || !selectedJobBand) {
      console.log(`⚠️ Missing required fields for Employee Level update (${rowId}): companyID=${companyID}, jobBand=${selectedJobBand}`);
      return;
    }

    console.log(`🔄 Fetching Employee Level for ${rowId} (Company: ${companyID}, Job Band: ${selectedJobBand})...`);

    // Call executivebyjobBand API
    const apiUrl = `${SELECT_API.executivebyjobBand}?companyId=${companyID}&jobBand=${encodeURIComponent(selectedJobBand)}`;

    fetch(apiUrl)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        console.log(`✅ API Response for ${rowId}:`, data);

        // Extract IsExc value from response (handle array or object response)
        let isExc = null;

        // If response is an array, get first item
        if (Array.isArray(data) && data.length > 0) {
          isExc = data[0]?.isExc || data[0]?.IsExc;
        } else if (data) {
          // If response is object, extract directly
          isExc = data.isExc || data.IsExc;
        }

        console.log(`📊 Extracted IsExc value: "${isExc}" (type: ${typeof isExc})`);

        if (!isExc || (isExc !== 'Y' && isExc !== 'N' && isExc !== 'y' && isExc !== 'n')) {
          console.warn(`⚠️ Invalid or missing IsExc value from API for ${rowId}: "${isExc}"`);
          return;
        }

        // Map IsExc to dropdown values - Direct mapping to 'Y' or 'N'
        let targetValue = null;

        if (isExc === 'Y' || isExc === 'y') {
          targetValue = 'Y';
          console.log(`🎯 IsExc='Y' → Setting Employee Level to: ${targetValue}`);
        } else if (isExc === 'N' || isExc === 'n') {
          targetValue = 'N';
          console.log(`🎯 IsExc='N' → Setting Employee Level to: ${targetValue}`);
        }

        // Set dropdown value directly
        if (targetValue) {
          employeeLevelSelect.value = targetValue;

          // Trigger change event for any dependent functionality
          $(employeeLevelSelect).trigger('change');

          console.log(`✅ Employee Level updated for ${rowId}: ${targetValue}`);
        } else {
          console.warn(`⚠️ Unable to set Employee Level value for ${rowId}`);
        }
      })
      .catch(error => {
        console.error(`❌ Error fetching Employee Level for ${rowId}:`, error);
        console.error(`   API URL: ${apiUrl}`);
      });
  },
  // ───────────────────────────────────────────────────────────────────
  // 🛠️ CASCADE UTILITY METHODS
  // ───────────────────────────────────────────────────────────────────

  // Clear dependent dropdowns when parent changes (Offcanvas pattern)
  clearBatchRowDependentDropdowns: function (rowElement, level) {
    const dropdownsToFlear = {
      'company': ['.batch-cost-center', '.batch-division', '.batch-department', '.batch-section', '.batch-compstore', '.batch-position', '.batch-job-band'],
      'cobu': ['.batch-cost-center', '.batch-division', '.batch-department', '.batch-section', '.batch-compstore', '.batch-position', '.batch-job-band'],
      'year': ['.batch-cost-center', '.batch-division', '.batch-department', '.batch-section', '.batch-compstore', '.batch-position', '.batch-job-band'],
      'costCenter': ['.batch-division', '.batch-department', '.batch-section', '.batch-compstore', '.batch-position', '.batch-job-band'],
      'division': ['.batch-department', '.batch-section', '.batch-compstore', '.batch-position', '.batch-job-band'],
      'department': ['.batch-section', '.batch-compstore', '.batch-position', '.batch-job-band'],
      'section': ['.batch-compstore', '.batch-position', '.batch-job-band'],
      'compstore': ['.batch-position', '.batch-job-band'],
      'position': ['.batch-job-band']
    };

    const dropdownsToClear = dropdownsToFlear[level] || [];

    dropdownsToClear.forEach(selector => {
      const dropdown = rowElement.querySelector(selector);
      if (dropdown) {
        dropdown.innerHTML = '<option value="">Select...</option>';
      }
    });
  },

  // ═══════════════════════════════════════════════════════════════════════════════════════
  // ✅ 5. VALIDATION ENGINE - UNIFIED SYSTEM (Phase 1 & 2)
  // ═══════════════════════════════════════════════════════════════════════════════════════

  /*
   * 📖 MAINTENANCE GUIDE - VALIDATION FUNCTIONS (Conservative Approach)
   * ═══════════════════════════════════════════════════════════════════
   *
   * 📌 ACTIVE FUNCTIONS (DO NOT REMOVE):
   * ├─ displayEnhancedValidation()              → Main validation display (7 usage points)
   * ├─ displaySummaryValidation()               → Row summary display (1 usage point)
   * ├─ displayGlobalValidationSummaryPreserved()→ Global summary (1 usage point)
   * ├─ applyValidationStyling()                 → NEW unified utility (7 usage points)
   * ├─ applyFieldStylingOnly()                  → Unified mode styling (refactored)
   * └─ applyLegacyEnhancedValidation()          → Legacy fallback (refactored)
   *
   * 🔄 REFACTORING HISTORY:
   * ├─ 2024-10-15: Eliminated code duplication in 4 styling functions
   * ├─ 2024-10-15: Fixed validation messages duplication issue
   * ├─ 2024-10-15: Added debouncing for validateAllBtn
   * ├─ 2024-10-15: Fixed external reference path bug
   * └─ 2024-10-15: Added comprehensive JSDoc documentation
   *
   * ⚠️  SAFETY GUIDELINES:
   * ├─ All functions marked @usage ACTIVE are still in use
   * ├─ Do NOT remove functions without checking grep search results
   * ├─ Test thoroughly after any changes to validation functions
   * ├─ Enable debugMode in BATCH_VALIDATION_CONFIG for troubleshooting
   * └─ Maintain backward compatibility for legacy code
   *
   * 🛠️ FOR TROUBLESHOOTING:
   * ├─ Set window.BATCH_VALIDATION_CONFIG.debugMode = true
   * ├─ Check browser console for validation flow tracking
   * ├─ Look for error contexts in console.error messages
   * └─ Verify applyValidationStyling is in batchValidator (not displayEnhancedValidation)
   */

  // ───────────────────────────────────────────────────────────────────
  // 🎯 UNIFIED VALIDATION STATUS MANAGER
  // ───────────────────────────────────────────────────────────────────

  unifiedValidationManager: {
    // Central configuration for unified validation - FIXED
    getUnifiedConfig() {
      return {
        enableUnifiedStatus: window.UNIFIED_VALIDATION_CONFIG?.enabled || false,
        showProgressBar: window.UNIFIED_VALIDATION_CONFIG?.showProgressBar || true,
        showFieldStatus: window.UNIFIED_VALIDATION_CONFIG?.showFieldStatus || true,
        showOverallStatus: window.UNIFIED_VALIDATION_CONFIG?.showOverallStatus || true,
        animation: window.UNIFIED_VALIDATION_CONFIG?.animation || true,
        debugMode: window.UNIFIED_VALIDATION_CONFIG?.debugMode || false,
        fallbackToLegacy: true // Always allow fallback for safety
      };
    },

    // 🔧 REFACTORED: Main unified validation UI generator (orchestrator only)
    generateUnifiedValidationUI(rowElement, validationResult) {
      const config = this.getUnifiedConfig();

      if (!config.enableUnifiedStatus) {
        console.log('🔄 Unified validation disabled, skipping UI generation');
        return null;
      }

      try {
        // 1. Create/get validation container (DOM manipulation only)
        const container = this.createValidationContainer(rowElement);
        if (!container) return null;

        // 2. Generate validation content (content generation only)
        const content = this.generateValidationContent(validationResult);

        // 3. Render validation UI (rendering only)
        this.renderValidationUI(container, content);

        // 4. Handle animation (animation only)
        this.handleValidationAnimation(container, config);

        console.log('✅ Unified validation UI generated successfully');
        return container;

      } catch (error) {
        console.error('❌ Error generating unified validation UI:', error);
        if (config.fallbackToLegacy) {
          console.log('🔄 Falling back to legacy validation display');
          return null; // Let legacy system handle it
        }
        throw error;
      }
    },

    // 🔧 REFACTORED: DOM manipulation only - Create validation container
    createValidationContainer(rowElement) {
      try {
        // 🔍 Search for both batch and allocation validation containers
        let container = rowElement.querySelector('.batch-row-validation-messages, .allocation-row-validation-messages');

        if (!container) {
          // Create container HTML with proper structure
          const containerHTML = `<div class="batch-row-validation-messages mt-2" role="alert" aria-live="polite"></div>`;

          // Find optimal insertion point
          const insertAfter = rowElement.querySelector('.row') || rowElement.firstElementChild;

          if (insertAfter && insertAfter.nextSibling) {
            insertAfter.insertAdjacentHTML('afterend', containerHTML);
          } else {
            rowElement.insertAdjacentHTML('beforeend', containerHTML);
          }

          // Get the newly created container
          container = rowElement.querySelector('.batch-row-validation-messages');
          console.log('📦 Created new validation container');
        }

        return container;
      } catch (error) {
        console.error('❌ Error creating validation container:', error);
        return null;
      }
    },

    // 🔧 REFACTORED: Content generation only - Generate validation content based on state
    generateValidationContent(validationResult) {
      try {
        const { errors = [], warnings = [], isValid, fieldCounts, fieldValidations = [] } = validationResult;

        // Determine validation state and generate appropriate content
        if (isValid && errors.length === 0 && warnings.length === 0) {
          return this.generateSuccessUI(fieldCounts, fieldValidations);
        } else if (errors.length > 0) {
          return this.generateErrorUI(errors, warnings, fieldCounts, fieldValidations);
        } else if (warnings.length > 0) {
          return this.generateWarningUI(warnings, fieldCounts, fieldValidations);
        } else {
          return this.generateIncompleteUI(fieldCounts, fieldValidations);
        }
      } catch (error) {
        console.error('❌ Error generating validation content:', error);
        return '<div class="alert alert-danger">เกิดข้อผิดพลาดในการแสดงผล validation</div>';
      }
    },

    // 🔧 REFACTORED: Rendering only - Apply content to container
    renderValidationUI(container, content) {
      try {
        if (!container || !content) {
          console.warn('⚠️ Missing container or content for validation UI');
          return;
        }

        container.innerHTML = content;

        // Log for debugging (can be removed in production)
        if (content.includes('alert-danger')) {
          console.log('🔴 Rendered error validation UI');
        } else if (content.includes('alert-warning')) {
          console.log('🟡 Rendered warning validation UI');
        } else if (content.includes('alert-success')) {
          console.log('🟢 Rendered success validation UI');
        } else {
          console.log('🔵 Rendered incomplete validation UI');
        }

      } catch (error) {
        console.error('❌ Error rendering validation UI:', error);
        container.innerHTML = '<div class="alert alert-danger">เกิดข้อผิดพลาดในการแสดงผล</div>';
      }
    },

    // 🔧 REFACTORED: Animation only - Handle validation animations
    handleValidationAnimation(container, config) {
      try {
        if (!container || !config.animateTransitions) return;

        // Apply fade-in animation
        container.style.animation = 'fadeInUp 0.3s ease-out';

        // Optional: Clear animation after completion to allow re-triggering
        setTimeout(() => {
          if (container) {
            container.style.animation = '';
          }
        }, 300);

        console.log('✨ Applied validation animation');

      } catch (error) {
        console.error('❌ Error applying validation animation:', error);
        // Animation errors shouldn't break the validation display
      }
    },

    // Generate success state UI - Simple & Clean
    generateSuccessUI(fieldCounts, fieldValidations = []) {
      // Generate comprehensive field status list for success state too
      const fieldStatusList = fieldValidations.map(fieldValidation => {
        const { name, status, message, element } = fieldValidation;
        console.log('generateSuccessUI', { name, status, message });
        if (status === 'valid') {
          return `<li>✅ ${name}: ${message}</li>`;
        } else if (status === 'error' || status === 'required') {
          return `<li>❌ ${name}: ${message}</li>`;
        } else if (status === 'warning') {
          return `<li>⚠️ ${name}: ${message}</li>`;
        } else {
          return `<li>⚠️ ${name}: ${message}</li>`;
        }
      }).join('');

      return `
        <div class="alert alert-success">
          <i class="fas fa-check-circle"></i> <strong>แถวนี้พร้อมบันทึก</strong>
          ${fieldStatusList ? `<ul>${fieldStatusList}</ul>` : '<small>ข้อมูลครบถ้วนและถูกต้องทั้งหมด</small>'}
        </div>
      `;
    },

    // 🔄 UNIFIED: Generate validation UI for all states (Error, Warning, Incomplete)
    generateValidationUI(errors = [], warnings = [], fieldCounts, fieldValidations = [], uiType = 'auto') {
      // Determine UI type automatically if not specified
      let validationType = uiType;
      if (uiType === 'auto') {
        if (errors.length > 0) {
          validationType = 'error';
        } else if (warnings.length > 0) {
          validationType = 'warning';
        } else {
          validationType = 'incomplete';
        }
      }

      // UI Configuration based on validation type
      const uiConfigs = {
        error: {
          alertClass: 'alert-danger',
          icon: 'fas fa-exclamation-circle',
          title: 'ข้อมูลยังไม่ครบถ้วน'
        },
        warning: {
          alertClass: 'alert-warning',
          icon: 'fas fa-exclamation-triangle',
          title: 'มีคำเตือน แต่สามารถบันทึกได้'
        },
        incomplete: {
          alertClass: 'alert-info',
          icon: 'fas fa-info-circle',
          title: 'กำลังกรอกข้อมูล'
        }
      };

      const config = uiConfigs[validationType] || uiConfigs.error;
      let fieldStatusList = '';

      // Generate field status list from fieldValidations OR fallback to errors/warnings
      if (fieldValidations && fieldValidations.length > 0) {
        // Use detailed fieldValidations if available
        fieldStatusList = fieldValidations.map(fieldValidation => {
          const { name, status, message, element } = fieldValidation;
          console.log(`generateValidationUI (${validationType}):`, { name, status, message });

          if (status === 'valid') {
            return `<li>✅ ${name}: ${message}</li>`;
          } else if (status === 'error' || status === 'required') {
            return `<li>❌ ${name}: ${message}</li>`;
          } else if (status === 'warning' || status === 'incomplete' || status === 'empty') {
            return `<li>⚠️ ${name}: ${message}</li>`;
          } else {
            return `<li>⚠️ ${name}: ${message}</li>`;
          }
        }).join('');
      } else {
        // FALLBACK: Use errors + warnings arrays when fieldValidations is empty
        console.log('🔄 Using errors + warnings as fallback for field details');

        let allFieldIssues = [];

        // Add errors
        if (errors && errors.length > 0) {
          const errorsList = errors.map(error => {
            const fieldName = error.field || error.name || 'Unknown Field';
            const message = error.message || 'ข้อมูลยังไม่ครบถ้วน';
            return `<li>❌ ${fieldName}: ${message}</li>`;
          });
          allFieldIssues = allFieldIssues.concat(errorsList);
        }

        // Add warnings (this will include benefits validation)
        if (warnings && warnings.length > 0) {
          console.log('🔍 [DEBUG] Processing warnings:', warnings);
          const warningsList = warnings.map(warning => {
            const fieldName = warning.field || warning.name || 'Unknown Field';
            const message = warning.message || 'ต้องการการตรวจสอบ';
            return `<li>⚠️ ${fieldName}: ${message}</li>`;
          });
          allFieldIssues = allFieldIssues.concat(warningsList);
        }

        if (allFieldIssues.length > 0) {
          fieldStatusList = allFieldIssues.join('');
        } else {
          // Default message based on validation type
          const defaultMessages = {
            error: '<li>❌ กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน</li>',
            warning: '<li>⚠️ พบคำเตือนบางรายการ</li>',
            incomplete: '<li>⚠️ โปรดกรอกข้อมูลให้ครบถ้วน</li>'
          };
          fieldStatusList = defaultMessages[validationType] || defaultMessages.error;
        }
      }

      // Handle incomplete type special case
      if (validationType === 'incomplete' && (!fieldStatusList || fieldStatusList.trim() === '')) {
        return `
          <div class="alert ${config.alertClass}">
            <i class="${config.icon}"></i> <strong>${config.title}</strong>
            <small>โปรดกรอกข้อมูลให้ครบถ้วน</small>
          </div>
        `;
      }

      return `
        <div class="alert ${config.alertClass}">
          <i class="${config.icon}"></i> <strong>${config.title}</strong>
          <ul>
            ${fieldStatusList}
          </ul>
        </div>
      `;
    },

    // 🔄 BACKWARD COMPATIBILITY: Keep original generateErrorUI for legacy support
    generateErrorUI(errors, warnings, fieldCounts, fieldValidations = []) {
      return this.generateValidationUI(errors, warnings, fieldCounts, fieldValidations, 'error');
    },

    // Generate warning state UI - Simple & Clean with all field status
    // 🔄 BACKWARD COMPATIBILITY: Keep original generateWarningUI for legacy support
    generateWarningUI(warnings, fieldCounts, fieldValidations = []) {
      return this.generateValidationUI([], warnings, fieldCounts, fieldValidations, 'warning');
    },

    // 🔄 BACKWARD COMPATIBILITY: Keep original generateIncompleteUI for legacy support
    generateIncompleteUI(fieldCounts, fieldValidations = []) {
      return this.generateValidationUI([], [], fieldCounts, fieldValidations, 'incomplete');
    },

    // 🎯 Display Global Summary with Simple UI - ครอบคลุมทุกกรณี
    displayGlobalSummaryUI: function (container, summary) {
      try {
        console.log('🎯 Unified validation displaying global summary:', summary);

        // Success state - Simple UI
        if (summary.invalidRows.length === 0 && summary.totalErrors === 0) {
          const successUI = document.createElement('div');
          successUI.className = 'alert alert-success';
          successUI.innerHTML = `
            <i class="fas fa-check-circle"></i> <strong>การตรวจสอบเสร็จสมบูรณ์</strong>
            <div class="mt-2">
              <small>ทุกรายการผ่านการตรวจสอบแล้ว (${summary.totalRows} แถว)</small>
              ${summary.totalWarnings > 0 ? `<br><small class="text-warning">หมายเหตุ: พบคำเตือน ${summary.totalWarnings} รายการ แต่ไม่ขัดขวางการบันทึก</small>` : ''}
            </div>
          `;
          container.appendChild(successUI);
          return;
        }

        // Error state - Simple UI with comprehensive details
        if (summary.invalidRows.length > 0) {
          const errorUI = document.createElement('div');
          errorUI.className = 'alert alert-danger';

          const errorList = summary.invalidRows.slice(0, 10).map(row =>
            `<li>❌ แถวที่ ${row.rowNumber}: ข้อมูลไม่ครบถ้วน</li>`
          ).join('');

          errorUI.innerHTML = `
            <div class="d-flex align-items-center mb-2">
              <i class="fas fa-exclamation-circle me-2"></i>
              <strong>พบข้อผิดพลาด ${summary.totalErrors} รายการใน ${summary.invalidRows.length} แถว</strong>
            </div>
            <ul class="mb-2">
              ${errorList}
              ${summary.invalidRows.length > 10 ? `<li>... และอีก ${summary.invalidRows.length - 10} แถว</li>` : ''}
            </ul>
            <hr>
            <small><i class="fas fa-info-circle me-1"></i>คลิกที่แถวเพื่อขยาย และติ๊กช่องทำเครื่องหมายเพื่อดูรายละเอียดของข้อผิดพลาด</small>
          `;
          container.appendChild(errorUI);
        }

        // Warning-only state (if no errors but has warnings)
        if (summary.invalidRows.length === 0 && summary.totalErrors === 0 && summary.totalWarnings > 0) {
          const warningUI = document.createElement('div');
          warningUI.className = 'alert alert-warning';

          const warningList = (summary.warningRows || []).slice(0, 5).map(row =>
            `<li>⚠️ แถวที่ ${row.rowNumber}: ${row.warnings?.length || 0} คำเตือน</li>`
          ).join('');

          warningUI.innerHTML = `
            <div class="d-flex align-items-center mb-2">
              <i class="fas fa-exclamation-triangle me-2"></i>
              <strong>พบคำเตือน ${summary.totalWarnings} รายการ</strong>
            </div>
            ${warningList ? `
              <ul class="mb-2">
                ${warningList}
                ${(summary.warningRows?.length || 0) > 5 ? `<li>... และอีก ${(summary.warningRows?.length || 0) - 5} แถว</li>` : ''}
              </ul>
            ` : ''}
            <hr>
            <small><i class="fas fa-info-circle me-1"></i>คำเตือน แนะนำให้ตรวจสอบข้อมูลก่อนบันทึก</small>
          `;
          container.appendChild(warningUI);
        }

        console.log('✅ Unified global summary displayed successfully');

      } catch (error) {
        console.error('❌ Error in displayGlobalSummaryUI:', error);
        throw error; // Let caller handle fallback
      }
    }
  },

  // ───────────────────────────────────────────────────────────────────
  // 📊 FIELD PROGRESS TRACKER
  // ───────────────────────────────────────────────────────────────────

  fieldProgressTracker: {
    // Count field completion status
    countFieldCompletion(rowElement, rowId = null) {
      try {
        const allFields = rowElement.querySelectorAll('input:not([type="hidden"]), select, textarea');

        let complete = 0;
        let incomplete = 0;
        let warnings = 0;
        let errors = 0;
        let total = 0;

        allFields.forEach(field => {
          total++;

          const hasValue = field.value && field.value.trim() !== '';
          const isRequired = field.hasAttribute('required') || field.classList.contains('required') ||
            field.closest('.required') || field.hasAttribute('data-required');
          const hasError = field.classList.contains('is-invalid') || field.classList.contains('batch-field-error') ||
            field.classList.contains('border-danger');
          const hasWarning = field.classList.contains('is-warning') || field.classList.contains('batch-field-warning') ||
            field.classList.contains('border-warning');

          if (hasError) {
            errors++;
          } else if (hasWarning) {
            warnings++;
          } else if (hasValue) {
            complete++;
          } else if (isRequired) {
            incomplete++;
          }
        });

        const result = {
          total,
          complete,
          incomplete,
          warnings,
          errors,
          percentage: total > 0 ? Math.round((complete / total) * 100) : 0,
          rowId: rowId || rowElement.getAttribute('data-batch-row-id')
        };

        console.log(`📊 Field progress for row ${result.rowId}:`, result);
        return result;

      } catch (error) {
        console.error('❌ Error counting field completion:', error);
        return {
          total: 0,
          complete: 0,
          incomplete: 0,
          warnings: 0,
          errors: 0,
          percentage: 0,
          rowId: rowId || 'unknown'
        };
      }
    },

    // Get detailed field status for debugging
    getDetailedFieldStatus(rowElement) {
      try {
        const allFields = rowElement.querySelectorAll('input:not([type="hidden"]), select, textarea');
        const fieldDetails = [];

        allFields.forEach((field, index) => {
          const fieldName = field.name || field.id || field.className.split(' ')[0] || `field-${index}`;
          const hasValue = field.value && field.value.trim() !== '';
          const isRequired = field.hasAttribute('required') || field.classList.contains('required');
          const hasError = field.classList.contains('is-invalid') || field.classList.contains('batch-field-error');
          const hasWarning = field.classList.contains('is-warning') || field.classList.contains('batch-field-warning');

          let status = 'empty';
          if (hasError) status = 'error';
          else if (hasWarning) status = 'warning';
          else if (hasValue) status = 'valid';
          else if (isRequired) status = 'required';

          fieldDetails.push({
            name: fieldName,
            value: field.value,
            status,
            hasValue,
            isRequired,
            hasError,
            hasWarning,
            element: field
          });
        });

        return fieldDetails;

      } catch (error) {
        console.error('❌ Error getting detailed field status:', error);
        return [];
      }
    }
  },

  // ───────────────────────────────────────────────────────────────────
  // 🔍 ENHANCED BATCH VALIDATION ENGINE (MAIN)
  // ───────────────────────────────────────────────────────────────────

  batchValidator: {
    // Load configuration from global config
    get config() {
      return window.BATCH_VALIDATION_CONFIG || {};
    },

    // Initialize validation for a row
    initializeRowValidation: function (rowElement, rowId) {
      const self = this;

      // Setup real-time validation if enabled
      if (this.config.validationSettings?.realTimeValidation?.enabled) {
        const delay = this.config.validationSettings.realTimeValidation.delay || 300;
        const events = this.config.validationSettings.realTimeValidation.triggerEvents || ['blur', 'change'];

        // Add real-time validation to form fields
        const formFields = rowElement.querySelectorAll('input, select, textarea');
        formFields.forEach(field => {
          events.forEach(eventType => {
            field.addEventListener(eventType,
              this.debounce(() => {
                self.validateFieldRealTime(field, rowId);
              }, delay)
            );
          });
        });
      }

      // Setup auto-populate rules
      this.setupAutoPopulateRules(rowElement, rowId);
    },

    // Real-time validation for individual field (Config-based approach)
    validateFieldRealTime: function (field, rowId) {
      if (!field) return;

      // console.log('🔄 validateFieldRealTime called:', {
      //   fieldId: field.id,
      //   fieldValue: field.value,
      //   rowId: rowId
      // });

      const fieldSelector = this.getFieldSelector(field);
      let validationApplied = false;

      // Special handling for Benefits fields (editLe*, editBg*)
      if (field.id && (field.id.startsWith('editLe') || field.id.startsWith('editBg'))) {
        // console.log('🏗️ Processing benefits field:', field.id);

        // Check for payroll fields with zero value
        if (field.id.toLowerCase().includes('payroll') && (field.value === '0' || field.value === '0.00')) {
          // console.log('⚠️ Zero payroll detected in benefits field');

          const mockField = { name: 'Payroll', description: 'Payroll field' };
          this.displayEnhancedValidation(field, mockField, false, 'warning', { warningType: 'payrollZero' });
          validationApplied = true;

        } else if (field.value && field.value.trim() !== '' && field.value !== '0' && field.value !== '0.00') {
          console.log('✅ Valid benefits field value');

          const mockField = { name: 'Benefits Field', description: 'Benefits field is valid' };
          this.displayEnhancedValidation(field, mockField, true, 'success', {});
          validationApplied = true;
        }
      }

      // 1. Check config-based required fields (FIXED: Always check, no early return)
      if (this.config.requiredFields && fieldSelector) {
        const requiredField = this.config.requiredFields.find(rf =>
          rf.selector === fieldSelector && rf.enabled
        );

        if (requiredField) {
          const isValid = field.value && field.value.trim() !== '';

          // Use enhanced validation if enabled
          if (this.config.uiValidation?.enabled) {
            this.displayEnhancedValidation(field, requiredField, isValid, isValid ? 'success' : 'error', {});
          } else {
            this.displayFieldValidation(field, requiredField, isValid, 'error');
          }
          validationApplied = true;
        }
      }

      // 2. Check warning fields for zero values
      if (this.config.warningFields && fieldSelector) {
        const warningField = this.config.warningFields.find(wf =>
          wf.selector === fieldSelector && wf.enabled && wf.checkZero
        );

        if (warningField) {
          let warningType = '';
          let hasWarning = false;

          // Specific validation rules
          if (fieldSelector === '.batch-payroll' && field.value === '0.00') {
            warningType = 'payrollZero';
            hasWarning = true;
          } else if (fieldSelector === '.batch-premium' && field.value === '0.00') {
            warningType = 'payrollZero'; // Use same message for premium
            hasWarning = true;
          } else if ((fieldSelector.includes('bonus-type') || fieldSelector.includes('BonusType')) &&
            (field.value === '' || field.value === 'Select...')) {
            warningType = 'bonusTypeEmpty';
            hasWarning = true;
          } else if (field.value === '0' || field.value === '0.00') {
            hasWarning = true;
          }

          if (hasWarning) {
            console.log(`⚠️ Warning detected for ${warningField.name}: ${warningType || 'zero_value'}`);

            // Show warning regardless of previous validation
            if (this.config.uiValidation?.enabled) {
              this.displayEnhancedValidation(field, warningField, false, 'warning', { warningType });
            } else {
              this.displayFieldValidation(field, warningField, false, 'warning');
            }
            validationApplied = true;
          }
        }
      }

      // 3. If field is valid and no warnings, show success (Enhanced UI only)
      if (!validationApplied && this.config.uiValidation?.enabled && field.value && field.value.trim() !== '') {
        // Create a mock field config for success display
        const mockField = { name: 'Field', description: 'Field is valid' };
        this.displayEnhancedValidation(field, mockField, true, 'success', {});
      }
    },

    // Complete validation for save
    validateRowComplete: function (rowId) {
      const rowElement = document.querySelector(`[data-batch-row-id="${rowId}"]`);
      if (!rowElement) return { errors: [], warnings: [], isValid: false };

      const errors = [];
      const warnings = [];
      const companyId = rowElement.querySelector('.batch-company')?.value;

      // 🔍 Check if this is an Allocation Mode row
      const isAllocationMode = rowElement.getAttribute('data-allocation-mode') === 'true';

      // 1. Validate required fields
      this.config.requiredFields?.forEach(field => {
        if (field.enabled) {
          const element = rowElement.querySelector(field.selector);
          if (!element || !element.value || element.value.trim() === '') {
            errors.push({
              field: field.name,
              message: `${field.name} is required`,
              selector: field.selector,
              type: 'required'
            });
          }
        }
      });

      // ⭐ NEW: 1.5 Validate Bonus Type for Allocation Mode (Row 1 only)
      if (isAllocationMode) {
        // Check if this is Row 1 (Master) by checking if it's the first allocation row
        const allAllocationRows = document.querySelectorAll('[data-allocation-mode="true"]');
        const isRow1 = allAllocationRows[0] === rowElement;

        if (isRow1) {
          const bonusTypeSelect = rowElement.querySelector('.allocation-bonus-type');
          const bonusTypeValue = bonusTypeSelect?.value;

          if (!bonusTypeValue || bonusTypeValue === '') {
            errors.push({
              field: 'Bonus Types',
              message: 'Bonus Types is required for Allocation Master Row',
              selector: '.allocation-bonus-type',
              type: 'required'
            });
          }
        }
      }

      // 2. Validate warning fields (zero values)
      this.config.warningFields?.forEach(field => {
        if (field.enabled && field.checkZero) {
          const element = rowElement.querySelector(field.selector);
          if (element && element.value === '0') {
            warnings.push({
              field: field.name,
              message: `${field.name} has zero value`,
              selector: field.selector,
              type: 'zero_warning'
            });
          }
        }
      });

      // 3. Validate company-specific rules
      if (companyId && this.config.companyRules?.[companyId]) {
        const companyRule = this.config.companyRules[companyId];

        if (companyRule.benefitsValidation) {
          const benefitsValidation = this.validateBenefitsFields(rowElement, companyId);
          errors.push(...benefitsValidation.errors);
          warnings.push(...benefitsValidation.warnings);
        }
      }

      // 4. Apply business rules
      this.config.businessRules?.forEach(rule => {
        if (rule.enabled && typeof window[rule.validateFunction] === 'function') {
          const ruleResult = window[rule.validateFunction](rowElement, rowId);
          if (ruleResult.errors) errors.push(...ruleResult.errors);
          if (ruleResult.warnings) warnings.push(...ruleResult.warnings);
        }
      });

      return {
        errors,
        warnings,
        isValid: errors.length === 0
      };
    },

    // Validate benefits fields based on company
    validateBenefitsFields: function (rowElement, companyId) {
      const errors = [];
      const warnings = [];

      // Find dynamic benefits containers
      const leBenefitsContainer = rowElement.querySelector('[id*="leBenefits"]');
      const bgBenefitsContainer = rowElement.querySelector('[id*="bgBenefits"]');

      if (!leBenefitsContainer && !bgBenefitsContainer) {
        warnings.push({
          field: 'Benefits Forms',
          message: 'Benefits forms not generated yet',
          type: 'benefits_missing'
        });
        return { errors, warnings };
      }

      const companyRule = this.config.companyRules[companyId];
      if (!companyRule) return { errors, warnings };

      // Count filled benefits fields
      const benefitsFields = [...(leBenefitsContainer?.querySelectorAll('input, select') || []),
      ...(bgBenefitsContainer?.querySelectorAll('input, select') || [])];

      const filledCount = benefitsFields.filter(field =>
        field.value && field.value.trim() !== '' && field.value !== '0'
      ).length;

      if (filledCount < companyRule.requiredBenefitsCount) {
        warnings.push({
          field: 'Benefits Fields',
          message: `At least ${companyRule.requiredBenefitsCount} benefits fields should be filled (currently ${filledCount})`,
          type: 'benefits_insufficient'
        });
      }

      return { errors, warnings };
    },

    // 🔧 Unified validation display (SA Approved Refactor)
    displayValidation: function (field, options = {}) {
      const {
        fieldConfig = {},
        isValid = false,
        type = 'error',
        validationResult = null,
        enhanced = false
      } = options;

      console.log(`🔄 Unified validation display: ${type} for ${field?.id || 'unknown'}`);

      if (!field) {
        console.warn('⚠️ No field provided to displayValidation');
        return false;
      }

      // Route to appropriate renderer
      if (enhanced && this.config.uiValidation?.enabled) {
        return this.renderEnhancedValidation(field, { fieldConfig, isValid, type, validationResult });
      }
      return this.renderBasicValidation(field, { fieldConfig, isValid, type });
    },

    // Basic validation renderer (legacy displayFieldValidation logic)
    renderBasicValidation: function (field, { fieldConfig, isValid, type }) {
      if (!this.config.displaySettings) return false;

      const displayConfig = type === 'error'
        ? this.config.displaySettings.errorDisplay
        : this.config.displaySettings.warningDisplay;

      // Remove existing validation display
      const existingFeedback = field.parentNode.querySelector('.batch-validation-message');
      if (existingFeedback) existingFeedback.remove();

      // Add validation state classes
      field.classList.toggle('is-invalid', !isValid && type === 'error');
      field.classList.toggle('is-warning', !isValid && type === 'warning');

      // Show message for invalid fields
      if (!isValid && displayConfig.type === 'inline') {
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = `batch-validation-message ${displayConfig.className}`;

        const message = fieldConfig.description || fieldConfig.name + ' is invalid';
        feedbackDiv.innerHTML = displayConfig.showIcon ?
          `<i class="${displayConfig.icon}"></i> ${message}` : message;

        if (displayConfig.position === 'below') {
          field.parentNode.appendChild(feedbackDiv);
        } else {
          field.parentNode.insertBefore(feedbackDiv, field);
        }
      }
      return true;
    },

    // Enhanced validation renderer (simplified displayEnhancedValidation logic)
    renderEnhancedValidation: function (field, { fieldConfig, isValid, type, validationResult }) {
      // Input type filtering
      const allowedTypes = ['text', 'number'];
      if (!allowedTypes.includes(field.type)) return false;

      // Use unified styling utility
      const validationType = isValid ? 'success' : type;
      const warningType = validationResult?.warningType || '';

      return this.applyValidationStyling(field, validationType, warningType, {
        useEnhancedStyles: true,
        showMessage: true
      });
    },

    // Legacy wrapper for backward compatibility
    displayFieldValidation: function (field, fieldConfig, isValid, type) {
      return this.displayValidation(field, { fieldConfig, isValid, type, enhanced: false });
    },

    // Enhanced validation display (SA Approved Refactor - Simplified)
    displayEnhancedValidation: function (field, fieldConfig, isValid, type, validationResult) {
      // Debug tracking
      if (window.BATCH_VALIDATION_CONFIG?.debugMode) {
        console.log(`🔄 [ENHANCED VALIDATION] ${type} → ${field?.id || 'unknown'}`);
      }

      // Unified validation mode check
      const unifiedConfig = batchEntryManager.unifiedValidationManager?.getUnifiedConfig();
      if (unifiedConfig?.enableUnifiedStatus) {
        const rowElement = field.closest('[data-batch-row-id]');
        if (rowElement) {
          const rowId = rowElement.getAttribute('data-batch-row-id');
          batchEntryManager.unifiedValidationCoordinator?.coordinateValidationUpdate(rowId, 150);
        }
      }

      // Use unified display function
      return this.displayValidation(field, {
        fieldConfig,
        isValid,
        type,
        validationResult,
        enhanced: true
      });
    },

    /**
     * 🔧 Get or Create Validation Message Container
     * @description Gets existing container or creates it dynamically for backward compatibility
     * @param {HTMLElement} field - Form field element
     * @returns {HTMLElement|null} Validation container element
     * @usage ACTIVE - Used by applyValidationStyling for dedicated message containers
     * @since v2.1 - Dedicated container pattern implementation
     */
    getOrCreateValidationContainer: function (field) {
      try {
        const fieldId = field.id;
        if (!fieldId) {
          console.warn('⚠️ Field has no ID, cannot create validation container');
          return null;
        }

        // Try to find existing container
        const containerId = `valMsg_${fieldId}`;
        let container = document.getElementById(containerId);

        // If not found, create it dynamically (backward compatibility)
        if (!container) {
          console.log(`🔧 Container ${containerId} not found, creating dynamically`);
          container = document.createElement('div');
          container.id = containerId;
          container.className = 'validation-message-container';

          // Find label to insert after it (SA approved positioning)
          const label = document.querySelector(`label[for="${fieldId}"]`);
          if (label && label.parentNode === field.parentNode) {
            // Insert after label (ideal position - between label and input)
            label.parentNode.insertBefore(container, label.nextSibling);
            console.log(`✅ Created container after label for ${fieldId}`);
          } else {
            // Fallback: insert before field
            field.parentNode.insertBefore(container, field);
            console.log(`⚠️ Created container before field for ${fieldId} (no label found)`);
          }
        }

        return container;

      } catch (error) {
        console.error('❌ Error getting validation container:', error);
        return null;
      }
    },

    /**
     * 🎨 Apply Field Styling Only (Unified Mode)
     * @description Applies validation styling without showing messages (for unified validation mode)
     * @param {HTMLElement} field - Form field to style
     * @param {string} type - Validation type: 'success', 'warning', 'error', 'neutral'
     * @param {string} warningType - Specific warning type for custom styling
     * @returns {boolean} Success status of styling application
     * @usage ACTIVE - Used in unified validation mode
     * @refactored v2.0 - Now uses applyValidationStyling utility
     * @since Enhanced validation system
     */
    applyFieldStylingOnly: function (field, type, warningType) {
      try {
        console.log(`🎨 Applying field styling only: ${type} to ${field.id || field.className}`);

        // 🆕 REFACTORED: Use unified styling utility with styling-only option
        return this.applyValidationStyling(field, type, warningType, {
          useEnhancedStyles: true,
          showMessage: false // Don't show messages for styling-only mode
        });

      } catch (error) {
        console.error('❌ Error in applyFieldStylingOnly:', error);
        return false;
      }
    },

    // NEW: Clear field validation styling
    clearFieldValidation: function (field) {
      try {
        // Remove validation classes
        const validationClasses = ['is-valid', 'is-invalid', 'is-warning'];
        if (ENHANCED_VALIDATION_STYLES?.cssClasses) {
          validationClasses.push(
            ENHANCED_VALIDATION_STYLES.cssClasses.valid,
            ENHANCED_VALIDATION_STYLES.cssClasses.invalid,
            ENHANCED_VALIDATION_STYLES.cssClasses.warning
          );
        }
        field.classList.remove(...validationClasses);

        // ✅ NEW: Clear validation container
        const fieldId = field.id;
        if (fieldId) {
          const container = document.getElementById(`valMsg_${fieldId}`);
          if (container) {
            container.innerHTML = '';
            console.log(`🧹 Cleared validation container: valMsg_${fieldId}`);
          }
        }

        // Remove existing validation messages (legacy - backward compatibility)
        const existingMessage = field.parentNode.querySelector('.batch-validation-message');
        if (existingMessage) {
          existingMessage.remove();
          console.log('🧹 Removed legacy validation message');
        }

      } catch (error) {
        console.error('❌ Error clearing field validation:', error);
      }
    },

    // NEW: Legacy enhanced validation behavior (original logic)
    /**
     * 📋 Legacy Enhanced Validation (Backward Compatibility)
     */
    applyLegacyEnhancedValidation: function (field, fieldConfig, isValid, type, validationResult) {
      try {
        console.log(`📋 Applying legacy enhanced validation: ${type} to ${field.id || field.className}`);

        // Build custom message for warnings
        let customMessage = '';
        if (type === 'warning' && validationResult?.warningType) {
          switch (validationResult.warningType) {
            case 'payrollZero':
              customMessage = 'เงินเดือนพื้นฐานเป็นศูนย์ กรุณาตรวจสอบข้อมูล';
              break;
            case 'zeroValue':
              customMessage = 'ค่าเป็นศูนย์(ระบบอนุญาต แต่แนะนำให้ตรวจสอบ)';
              break;
            case 'negativeValue':
              customMessage = 'ค่าติดลบไม่ได้รับอนุญาต กรุณาตรวจสอบข้อมูล';
              break;
          }
        }

        // Determine validation type based on isValid flag
        const validationType = isValid ? 'success' : type;

        // 🆕 REFACTORED: Use unified styling utility with legacy-specific options
        return this.applyValidationStyling(field, validationType, validationResult?.warningType, {
          useLegacyConfig: true,
          customMessage: customMessage,
          showMessage: this.config.uiValidation?.useThaiMessages || false
        });

      } catch (error) {
        console.error('❌ Error in applyLegacyEnhancedValidation:', error);
        return false;
      }
    },

    // 🗑️ REMOVED: Incorrect displaySummaryValidation function with undefined variables
    // The correct displaySummaryValidation function is implemented below

    /**
     * 📋 Display Row-Level Validation Summary
     */
    displaySummaryValidation: function (rowElement, validation) {
      const summaryContainer = rowElement.querySelector('.batch-row-validation-messages') ||
        this.createSummaryContainer(rowElement);

      summaryContainer.innerHTML = '';

      // Display errors
      if (validation.errors.length > 0) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger';
        errorDiv.innerHTML = `
          <strong><i class="fas fa-exclamation-circle"></i> พบข้อผิดพลาด ${validation.errors.length} รายการ:</strong>
          <ul class="mb-0 mt-2">
            ${validation.errors.map(error => `<li>${error.message}</li>`).join('')}
          </ul>
        `;
        summaryContainer.appendChild(errorDiv);
      }

      // Display warnings
      if (validation.warnings.length > 0) {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'alert alert-warning';
        warningDiv.innerHTML = `
          <strong><i class="fas fa-exclamation-triangle"></i> คำเตือน ${validation.warnings.length} รายการ:</strong>
          <ul class="mb-0 mt-2">
            ${validation.warnings.map(warning => `<li>${warning.message}</li>`).join('')}
          </ul>
        `;
        summaryContainer.appendChild(warningDiv);
      }
    },

    // Setup auto-populate rules
    setupAutoPopulateRules: function (rowElement, rowId) {
      if (!this.config.autoPopulateRules) return;

      this.config.autoPopulateRules.forEach(rule => {
        if (!rule.enabled) return;

        const triggerElement = rowElement.querySelector(rule.trigger);
        const targetElement = rowElement.querySelector(rule.target);

        if (triggerElement && targetElement) {
          // Remove existing listeners to prevent duplicates
          $(triggerElement).off('.autopop');

          if (rule.timing === 'smart') {
            // Smart timing based on element type
            if (triggerElement.tagName === 'SELECT') {
              // Immediate for dropdowns
              $(triggerElement).on('change.autopop', () => {
                targetElement.value = triggerElement.value;
                $(targetElement).trigger('change');
                console.log(`🔄 Auto-populated ${rule.target} from ${rule.trigger}`);
              });
            } else {
              // Delayed for inputs
              $(triggerElement).on('input.autopop',
                this.debounce(() => {
                  targetElement.value = triggerElement.value;
                  $(targetElement).trigger('change');
                  console.log(`🔄 Auto-populated ${rule.target} from ${rule.trigger} (delayed)`);
                }, rule.delay || 300)
              );
            }
          } else {
            // Use specified timing
            const delay = rule.timing === 'immediate' ? 0 : (rule.delay || 300);
            $(triggerElement).on('change.autopop input.autopop',
              this.debounce(() => {
                targetElement.value = triggerElement.value;
                $(targetElement).trigger('change');
              }, delay)
            );
          }
        }
      });
    },

    // Helper: Create validation summary container
    createSummaryContainer: function (rowElement) {
      let container = rowElement.querySelector('.batch-row-validation-messages');
      if (!container) {
        container = document.createElement('div');
        container.className = 'batch-row-validation-messages mt-2';

        // Insert at the end of accordion body
        const accordionBody = rowElement.querySelector('.accordion-body');
        if (accordionBody) {
          accordionBody.appendChild(container);
        }
      }
      return container;
    },

    // Helper: Get field selector from element
    getFieldSelector: function (element) {
      // Try to find selector by class
      const classes = Array.from(element.classList);
      const batchClass = classes.find(cls => cls.startsWith('batch-'));

      // If no batch- class found, check for benefits fields by ID
      if (!batchClass && element.id) {
        if (element.id.includes('payroll') || element.id.toLowerCase().includes('payroll')) {
          return '.batch-payroll';
        }
        if (element.id.includes('premium') || element.id.toLowerCase().includes('premium')) {
          return '.batch-premium';
        }
        // Generic benefits field selector
        if (element.id.startsWith('editLe') || element.id.startsWith('editBg')) {
          return '.batch-benefits';
        }
      }

      return batchClass ? '.' + batchClass : null;
    },

    // Helper: Debounce function
    debounce: function (func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    /**
     * 🆕 UNIFIED Validation Styling Utility
     */
    applyValidationStyling: function (field, type, warningType = '', options = {}) {
      try {
        // 📊 CONSERVATIVE: Add usage tracking for maintenance
        if (window.BATCH_VALIDATION_CONFIG?.debugMode) {
          console.log(`🎨 [UNIFIED STYLING] ${type} → ${field.id || field.className}`, {
            warningType,
            options,
            timestamp: new Date().toISOString(),
            caller: 'applyValidationStyling'
          });
        }

        // Clear existing validation styling first
        this.clearFieldValidation(field);

        // Get styling configuration
        const uiConfig = this.config.uiValidation || {};
        const useEnhancedStyles = options.useEnhancedStyles !== false;

        let cssClass = '';
        let borderColor = '';
        let backgroundColor = '';
        let message = '';
        let icon = '';

        // Determine styling based on validation type
        switch (type) {
          case 'success':
            cssClass = uiConfig.cssClasses?.valid || (useEnhancedStyles ? ENHANCED_VALIDATION_STYLES?.cssClasses?.valid : 'is-valid');
            borderColor = uiConfig.borderColors?.valid || (useEnhancedStyles ? ENHANCED_VALIDATION_STYLES?.borderColors?.valid : '#28a745');
            backgroundColor = uiConfig.backgroundColors?.valid || '#f0fff4';
            message = uiConfig.messages?.fieldValid || 'ข้อมูลถูกต้อง';
            icon = uiConfig.icons?.success || '✅';
            break;

          case 'warning':
            cssClass = uiConfig.cssClasses?.warning || 'is-warning';
            borderColor = uiConfig.borderColors?.warning || (useEnhancedStyles ? ENHANCED_VALIDATION_STYLES?.borderColors?.warning : '#ffc107');
            backgroundColor = uiConfig.backgroundColors?.warning || '#fffbf0';

            // Enhanced warning messages based on type
            if (warningType === 'payrollZero') {
              message = uiConfig.messages?.payrollZero || 'เงินเดือนพื้นฐานเป็นศูนย์ กรุณาตรวจสอบข้อมูล';
            } else if (warningType === 'negativeValue') {
              message = 'ค่าติดลบไม่ได้รับอนุญาต กรุณาตรวจสอบข้อมูล';
            } else if (warningType === 'zeroValue') {
              message = 'ค่าเป็นศูนย์(ระบบอนุญาต แต่แนะนำให้ตรวจสอบ)';
            } else {
              message = uiConfig.messages?.fieldWarning || 'กรุณาตรวจสอบข้อมูลให้ถูกต้อง';
            }
            icon = uiConfig.icons?.warning || '⚠️';
            break;

          case 'error':
            cssClass = uiConfig.cssClasses?.invalid || (useEnhancedStyles ? ENHANCED_VALIDATION_STYLES?.cssClasses?.invalid : 'is-invalid');
            borderColor = uiConfig.borderColors?.invalid || (useEnhancedStyles ? ENHANCED_VALIDATION_STYLES?.borderColors?.invalid : '#dc3545');
            backgroundColor = uiConfig.backgroundColors?.invalid || '#fff5f5';
            message = uiConfig.messages?.fieldRequired || 'ข้อมูลนี้จำเป็นต้องกรอก';
            icon = uiConfig.icons?.error || '❌';
            break;

          case 'neutral':
            // Clear styling for neutral state
            field.style.border = '';
            field.style.boxShadow = '';
            field.style.backgroundColor = '';
            return true; // Exit early for neutral case
        }

        // Apply CSS class
        if (cssClass) {
          field.classList.add(cssClass);
          console.log('✅ Applied CSS class:', cssClass);
        }

        // Apply enhanced border and shadow styling
        if (uiConfig.showBorders !== false && borderColor) {
          field.style.border = `3px solid ${borderColor}`;
          field.style.boxShadow = `0 0 8px ${borderColor}40`;
          field.style.backgroundColor = backgroundColor;

          console.log('🎨 Applied unified styling:', {
            border: field.style.border,
            boxShadow: field.style.boxShadow,
            backgroundColor: field.style.backgroundColor
          });
        }

        // Add validation message if enabled and provided
        if ((uiConfig.useThaiMessages !== false || options.showMessage) && message) {
          // ✅ Get dedicated validation container
          const validationContainer = this.getOrCreateValidationContainer(field);

          if (validationContainer) {
            const feedbackDiv = document.createElement('div');
            feedbackDiv.className = 'batch-validation-message mt-1 small';

            // Apply appropriate text color class
            if (type === 'success') {
              feedbackDiv.className += ' text-success';
            } else if (type === 'error') {
              feedbackDiv.className += ' text-danger';
            } else if (type === 'warning') {
              feedbackDiv.className += ' text-warning';
            }

            // Add icon if enabled
            if (uiConfig.showIcons !== false && icon) {
              feedbackDiv.innerHTML = `${icon} ${message}`;
            } else {
              feedbackDiv.textContent = message;
            }

            // ✅ Insert into dedicated container (not parentNode)
            validationContainer.innerHTML = ''; // Clear previous message
            validationContainer.appendChild(feedbackDiv);

            console.log(`💬 Added validation message to container: valMsg_${field.id}`);
          } else {
            // ⚠️ Fallback: use old method if container not available
            console.warn('⚠️ Validation container not found, using fallback');
            const feedbackDiv = document.createElement('div');
            feedbackDiv.className = 'batch-validation-message mt-1 small';

            if (type === 'success') {
              feedbackDiv.className += ' text-success';
            } else if (type === 'error') {
              feedbackDiv.className += ' text-danger';
            } else if (type === 'warning') {
              feedbackDiv.className += ' text-warning';
            }

            if (uiConfig.showIcons !== false && icon) {
              feedbackDiv.innerHTML = `${icon} ${message}`;
            } else {
              feedbackDiv.textContent = message;
            }

            field.parentNode.appendChild(feedbackDiv);
            console.log('💬 Added validation message using fallback method');
          }
        }

        console.log('✅ Unified validation styling completed successfully');
        return true;

      } catch (error) {
        // 🛡️ CONSERVATIVE: Enhanced error handling for styling utility
        const errorContext = {
          fieldId: field?.id || 'unknown',
          fieldType: field?.type || 'unknown',
          validationType: type,
          warningType,
          options,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
          function: 'applyValidationStyling'
        };

        console.error('❌ Error in applyValidationStyling:', error);
        console.error('🚨 Styling error context:', errorContext);

        // Try graceful degradation - just clear existing styling
        try {
          this.clearFieldValidation(field);
          console.log('🔄 Graceful degradation: cleared field validation as fallback');
        } catch (clearError) {
          console.error('❌ Even fallback clearFieldValidation failed:', clearError);
        }

        return false;
      }
    }
  },

  // ───────────────────────────────────────────────────────────────────
  // 🔧 UNIFIED VALIDATION HELPER FUNCTIONS (Phase 1)
  // ───────────────────────────────────────────────────────────────────

  fieldValidationCollector: {
    // Check if field should be excluded from validation
    isExcludedField(field) {
      // 🚫 Always exclude these UI control fields (not business data fields)
      const alwaysExcludeSelectors = [
        '.batch-row-selector',        // Row selection checkbox
        'input[type="checkbox"]',     // All checkboxes
        'input[type="radio"]',        // Radio buttons
        'button',                     // Buttons
        '[readonly]',                 // Read-only fields
        '[disabled]'                  // Disabled fields
      ];

      // Check always-exclude list first
      for (const selector of alwaysExcludeSelectors) {
        try {
          if (field.matches(selector)) {
            const fieldName = this.getFieldDisplayName(field);
            console.log(`⏭️ UI control field excluded: ${fieldName} (${selector})`);
            return true;
          }
        } catch (error) {
          console.warn('Invalid always-exclude selector:', selector, error);
        }
      }

      // Check configuration-based excluded fields
      const excludedConfig = window.BATCH_VALIDATION_CONFIG?.excludedFields || [];
      for (const excludedField of excludedConfig) {
        if (excludedField.enabled === false) { // Only check fields marked as disabled
          try {
            if (field.matches(excludedField.selector)) {
              console.log(`⏭️ Field excluded by config: ${excludedField.name}`);
              return true;
            }
          } catch (error) {
            console.warn('Invalid excluded field selector:', excludedField.selector, error);
          }
        }
      }

      return false;
    },

    // Collect individual field validation status for unified display
    collectFieldValidationStatus(rowElement) {
      try {
        const fieldValidations = [];
        const fields = rowElement.querySelectorAll('input:not([type="hidden"]), select, textarea');

        // Separate main fields from benefits fields
        const mainFields = [];
        const benefitsFields = [];

        fields.forEach(field => {
          // Skip excluded fields (ไม่ต้อง validate)
          if (this.isExcludedField(field)) {
            const fieldName = this.getFieldDisplayName(field);
            console.log(`⏭️ Skipping excluded field: ${fieldName}`);
            return;
          }

          const fieldName = this.getFieldDisplayName(field);

          // Check if this is a benefits field
          const isBenefitsField = this.isBenefitsField(field);

          if (isBenefitsField) {
            benefitsFields.push(field);
          } else {
            mainFields.push(field);
          }
        });

        // Process main fields individually
        mainFields.forEach(field => {
          const fieldName = this.getFieldDisplayName(field);
          const hasValue = field.value && field.value.trim() !== '';
          const isRequired = this.isFieldRequired(field);
          const validation = this.getFieldValidationState(field);

          // Debug log for key fields
          if (fieldName.includes('COBU') || fieldName.includes('Company') || fieldName.includes('Budget Year')) {
            console.log(`🔍 Processing field: ${fieldName}`, {
              hasValue,
              isRequired,
              status: validation.status,
              message: validation.message,
              fieldValue: field.value
            });
          }

          fieldValidations.push({
            name: fieldName,
            element: field,
            hasValue,
            isRequired,
            status: validation.status,
            message: validation.message,
            focusAction: validation.focusAction
          });
        });

        // Process benefits fields as summary
        if (benefitsFields.length > 0) {
          console.log(`🎯 Found ${benefitsFields.length} benefits fields, creating summary...`);
          const benefitsSummary = this.createBenefitsSummary(benefitsFields);
          console.log(`📊 Benefits summary created:`, benefitsSummary);
          fieldValidations.push(benefitsSummary);
        } else {
          console.log(`ℹ️ No benefits fields found in this row`);
        }

        const totalFields = fields.length;
        const excludedCount = totalFields - mainFields.length - benefitsFields.length;
        console.log(`📊 Field processing summary: Total=${totalFields}, Main=${mainFields.length}, Benefits=${benefitsFields.length}, Excluded=${excludedCount}, Validations=${fieldValidations.length}`);
        return fieldValidations;

      } catch (error) {
        console.error('❌ Error collecting field validation status:', error);
        return [];
      }
    },



    // Check if field is required based on BATCH_VALIDATION_CONFIG
    isFieldRequired(field) {
      // First check HTML attributes (legacy support)
      if (field.hasAttribute('required') ||
        field.classList.contains('required') ||
        field.closest('.required') ||
        field.hasAttribute('data-required') ||
        field.closest('.form-group')?.querySelector('label')?.textContent?.includes('*')) {
        return true;
      }

      // Then check BATCH_VALIDATION_CONFIG.requiredFields
      const requiredConfig = window.BATCH_VALIDATION_CONFIG?.requiredFields || [];

      for (const requiredField of requiredConfig) {
        if (requiredField.enabled === true) { // Only check enabled fields
          try {
            if (field.matches(requiredField.selector)) {
              console.log(`✅ Field identified as required by config: ${requiredField.name}`);
              return true;
            }
          } catch (error) {
            console.warn('Invalid required field selector:', requiredField.selector, error);
          }
        }
      }

      return false;
    },

    // Get field validation state and message
    getFieldValidationState(field) {
      // Enhanced value checking for different field types
      let hasValue = false;

      if (field.tagName === 'SELECT') {
        // For dropdown/select fields
        // ✅ FIX: Check by text content instead of value to support value="0" options
        const selectedText = field.options[field.selectedIndex]?.text || '';
        hasValue = field.value &&
          field.value.trim() !== '' &&
          !selectedText.toLowerCase().includes('select') &&
          field.selectedIndex > 0;  // Must not be first option (placeholder)
      } else {
        // For input fields
        hasValue = field.value && field.value.trim() !== '';
      }

      const isRequired = this.isFieldRequired(field);
      const hasError = field.classList.contains('is-invalid') ||
        field.classList.contains('batch-field-error') ||
        field.classList.contains('border-danger');
      const hasWarning = field.classList.contains('is-warning') ||
        field.classList.contains('batch-field-warning') ||
        field.classList.contains('border-warning');

      let status = 'empty';
      let message = '';
      let focusAction = null;

      // Priority order: Error > Warning > Valid > Required > Empty
      if (hasError) {
        status = 'error';
        message = 'ข้อมูลนี้จำเป็นต้องกรอก'; // Fixed message for errors
        focusAction = `batchEntryManager.focusField('${field.id || field.name}')`;
      } else if (hasWarning) {
        status = 'warning';
        message = 'กรุณาตรวจสอบข้อมูล';
      } else if (hasValue && !isRequired) {
        // Optional field with value
        status = 'valid';
        message = 'ข้อมูลถูกต้อง';
      } else if (hasValue && isRequired) {
        // Required field with value
        status = 'valid';
        message = 'ข้อมูลถูกต้อง';
      } else if (!hasValue && isRequired) {
        // Required field without value
        status = 'error'; // Change to error for required fields
        message = 'ข้อมูลนี้จำเป็นต้องกรอก';
        focusAction = `batchEntryManager.focusField('${field.id || field.name}')`;
      } else {
        // Optional field without value
        status = 'empty';
        message = 'ไม่จำเป็นต้องกรอก';
      }

      // Debug log for key fields
      const fieldName = field.name || field.className || field.id;
      if (fieldName.includes('company') || fieldName.includes('cobu') || fieldName.includes('year')) {
        console.log(`🔍 Field validation debug - ${fieldName}: value="${field.value}", hasValue=${hasValue}, isRequired=${isRequired}, status=${status}, message="${message}"`);
      }

      return { status, message, focusAction };
    },

    // Get display name for field
    getFieldDisplayName(field) {
      const fieldMapping = {
        // ✅ ฟิลด์ที่ต้อง validate
        'batch-company': 'Company',
        'batch-year': 'Budget Year',
        'batch-cobu': 'COBU/Format',
        'batch-emp-status': 'Emp Status',
        'batch-cost-center': 'Cost Center',
        'batch-division': 'Division',
        'batch-compstore': 'Company/Store Name',
        'batch-position': 'Position',
        'batch-job-band': 'Job Band',
        'batch-emp-type': 'Emp Type',
        'batch-new-hc': 'New Hc',
        'batch-new-period': 'New Period',
        'batch-new-le-period': 'New Le-period',
        'batch-le-no-month': 'Le No-month',
        'batch-no-month': 'No Month',
        'batch-plan-cost-center': 'Plan Cost-center',
        'batch-salary-structure': 'Salary Structure',
        'batch-run-rate-group': 'Run Rate-group',
        'batch-employee-level': 'Executive/Non-Executive',
        'batch-focus-hc': 'Focus Hc',
        'batch-focus-pe': 'Focus Pe',
        'batch-join-pvf': 'Join Pvf',
        // ❌ ฟิลด์ที่ไม่ต้อง validate (เก็บไว้สำหรับ reference)
        'batch-join-date': 'Join Date',
        'batch-remark': 'Remark',
        'batch-department': 'Department',
        'batch-section': 'Section',
        'batch-group': 'Group',
        'batch-group-div': 'Group Div',
        'batch-group-dept': 'Group Dept',
        'batch-hrbp': 'Hrbp'
      };

      // Try class name mapping first
      const className = Array.from(field.classList).find(cls => fieldMapping[cls]);
      if (className && fieldMapping[className]) {
        return fieldMapping[className];
      }

      // Try name attribute
      if (field.name && fieldMapping[field.name]) {
        return fieldMapping[field.name];
      }

      // Fallback to class-based name
      const batchClass = Array.from(field.classList).find(cls => cls.startsWith('batch-'));
      if (batchClass) {
        return batchClass.replace('batch-', '').replace('-', ' ')
          .split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      }

      return field.name || field.id || 'Field';
    },

    // Check if field is a benefits field (to group them)
    isBenefitsField(field) {
      // Check for benefits-related patterns in field identifiers
      const fieldId = field.id || '';
      const fieldName = field.name || '';
      const fieldClass = field.className || '';

      // Common benefits field patterns
      const benefitsPatterns = [
        'editLe', 'editBg',           // Le/Bg benefits editing fields
        'benefits', 'benefit',        // Generic benefits fields
        'payroll', 'premium',         // Payroll/premium related
        'allowance', 'bonus',         // Allowance/bonus fields
        'medical', 'insurance'        // Medical/insurance fields
      ];

      const isBenefits = benefitsPatterns.some(pattern =>
        fieldId.toLowerCase().includes(pattern.toLowerCase()) ||
        fieldName.toLowerCase().includes(pattern.toLowerCase()) ||
        fieldClass.toLowerCase().includes(pattern.toLowerCase())
      );

      // Debug log for benefits field detection
      if (isBenefits) {
        console.log(`🔍 Benefits field detected: ID="${fieldId}", Name="${fieldName}", Class="${fieldClass}"`);
      }

      return isBenefits;
    },

    // Create summary for benefits fields
    createBenefitsSummary(benefitsFields) {
      let filledCount = 0;
      let totalCount = benefitsFields.length;
      let hasErrors = false;
      let hasWarnings = false;

      console.log(`📝 Creating benefits summary for ${totalCount} fields...`);

      benefitsFields.forEach((field, index) => {
        const hasValue = field.value && field.value.trim() !== '';
        const validation = this.getFieldValidationState(field);

        console.log(`   Field ${index + 1}: ID="${field.id}", Value="${field.value}", Status="${validation.status}"`);

        if (hasValue) filledCount++;
        if (validation.status === 'error') hasErrors = true;
        if (validation.status === 'warning') hasWarnings = true;
      });

      console.log(`📊 Summary: ${filledCount}/${totalCount} filled, hasErrors=${hasErrors}, hasWarnings=${hasWarnings}`);

      // Determine overall status
      let status, message;
      if (hasErrors) {
        status = 'error';
        message = `จำเป็นต้องกรอกข้อมูล (${filledCount}/${totalCount} fields)`;
      } else if (hasWarnings) {
        status = 'warning';
        message = `มีคำเตือน (${filledCount}/${totalCount} fields)`;
      } else if (filledCount === totalCount && totalCount > 0) {
        status = 'valid';
        message = `ครบถ้วนแล้ว (${filledCount}/${totalCount} fields)`;
      } else {
        status = 'incomplete';
        message = `มีข้อมูลกรอกไม่ครบ (${filledCount}/${totalCount} fields)`;
      }

      console.log(`✅ Benefits summary result: Status="${status}", Message="${message}"`);

      return {
        name: 'Benefits',
        element: benefitsFields[0], // Reference to first benefits field
        hasValue: filledCount > 0,
        isRequired: false,
        status: status,
        message: message,
        focusAction: null,
        isSummary: true // Mark as summary field
      };
    }
  },

  // ───────────────────────────────────────────────────────────────────
  // 🔄 VALIDATION RESULT PROCESSOR
  // ───────────────────────────────────────────────────────────────────

  validationResultProcessor: {
    // Process validation results from batchValidator into unified format
    processValidationResults(validationResult, rowElement, rowId) {
      try {
        // Get field counts
        const fieldCounts = batchEntryManager.fieldProgressTracker.countFieldCompletion(rowElement, rowId);

        // Get detailed field validations
        const fieldValidations = batchEntryManager.fieldValidationCollector.collectFieldValidationStatus(rowElement);

        // Convert validation errors/warnings to unified format
        const processedErrors = this.processValidationMessages(validationResult.errors, 'error');
        const processedWarnings = this.processValidationMessages(validationResult.warnings, 'warning');

        const enhancedResult = {
          ...validationResult,
          fieldCounts,
          fieldValidations,
          errors: processedErrors,
          warnings: processedWarnings,
          processedAt: new Date().toISOString()
        };

        console.log(`✅ Processed validation results for row ${rowId}:`, {
          errors: processedErrors.length,
          warnings: processedWarnings.length,
          fieldProgress: `${fieldCounts.complete}/${fieldCounts.total}`,
          isValid: enhancedResult.isValid
        });

        return enhancedResult;

      } catch (error) {
        console.error('❌ Error processing validation results:', error);
        // Return safe fallback
        return {
          ...validationResult,
          fieldCounts: { total: 0, complete: 0, incomplete: 0, warnings: 0, errors: 0, percentage: 0, rowId },
          fieldValidations: [],
          errors: [],
          warnings: []
        };
      }
    },

    // Process validation messages into consistent format
    processValidationMessages(messages, type) {
      if (!Array.isArray(messages)) {
        return [];
      }

      return messages.map((msg, index) => {
        if (typeof msg === 'string') {
          return {
            field: `Field ${index + 1}`,
            message: msg,
            type,
            focusAction: null
          };
        }

        if (typeof msg === 'object') {
          return {
            field: msg.field || msg.fieldName || `Field ${index + 1}`,
            message: msg.message || msg.error || msg.warning || 'กรุณาตรวจสอบ',
            type,
            focusAction: msg.focusAction || null
          };
        }

        return {
          field: `Field ${index + 1}`,
          message: 'กรุณาตรวจสอบข้อมูล',
          type,
          focusAction: null
        };
      });
    }
  },

  // ───────────────────────────────────────────────────────────────────
  // ⚡ UNIFIED VALIDATION COORDINATOR
  // ───────────────────────────────────────────────────────────────────

  unifiedValidationCoordinator: {
    // Timer storage for debounced updates
    updateTimers: new Map(),

    // Coordinate unified validation update for row
    coordinateValidationUpdate(rowId, delay = 100) {
      try {
        // Clear existing timer
        if (this.updateTimers.has(rowId)) {
          clearTimeout(this.updateTimers.get(rowId));
        }

        // Set new timer
        const timer = setTimeout(() => {
          this.executeUnifiedValidation(rowId);
          this.updateTimers.delete(rowId);
        }, delay);

        this.updateTimers.set(rowId, timer);

        console.log(`⏱️ Scheduled unified validation update for row ${rowId} in ${delay}ms`);

      } catch (error) {
        console.error('❌ Error coordinating validation update:', error);
      }
    },

    // Execute unified validation for row (Enhanced error handling)
    executeUnifiedValidation(rowId) {
      try {
        const rowElement = document.querySelector(`[data-batch-row-id="${rowId}"]`);
        if (!rowElement) {
          console.warn(`⚠️ Row element not found for ID: ${rowId}`);
          return;
        }

        // Check if unified validation manager exists and is properly initialized
        if (!batchEntryManager.unifiedValidationManager ||
          typeof batchEntryManager.unifiedValidationManager.getUnifiedConfig !== 'function') {
          console.warn(`⚠️ Unified validation manager not available for row ${rowId}`);
          return;
        }

        // Check if unified validation is enabled
        const config = batchEntryManager.unifiedValidationManager.getUnifiedConfig();
        if (!config || !config.enableUnifiedStatus) {
          console.log(`🔄 Unified validation disabled for row ${rowId}`);
          return;
        }

        // Get current row data
        const rowData = batchEntryManager.activeRows.get(rowId);
        if (!rowData) {
          console.warn(`⚠️ Row data not found for ID: ${rowId}`);
          return;
        }

        // Use existing validation logic if available
        const validation = batchEntryManager.batchValidator.validateRowComplete(rowId);

        // Process validation results for unified display
        const enhancedValidation = batchEntryManager.validationResultProcessor.processValidationResults(
          validation, rowElement, rowId
        );

        // Generate unified UI
        const container = batchEntryManager.unifiedValidationManager.generateUnifiedValidationUI(
          rowElement, enhancedValidation
        );
        console.log(`🎯 Unified validation UI generated for row ${rowId} in ${container}`);
        // Update row data with enhanced validation
        if (container) {
          rowData.unifiedValidation = enhancedValidation;
          rowData.lastValidationUpdate = new Date().toISOString();
          batchEntryManager.activeRows.set(rowId, rowData);
        }

        console.log(`✅ Unified validation executed for row ${rowId}`);

      } catch (error) {
        console.error(`❌ Error executing unified validation for row ${rowId}:`, error);

        // Fallback to legacy validation if enabled (Enhanced safety checks)
        try {
          const config = batchEntryManager.unifiedValidationManager?.getUnifiedConfig?.() || {};
          if (config.fallbackToLegacy) {
            console.log(`🔄 Falling back to legacy validation for row ${rowId}`);
            if (typeof batchEntryManager.validateRow === 'function') {
              batchEntryManager.validateRow(rowId);
            }
            // if (typeof batchEntryManager.updateRowStatus === 'function') {
            //   batchEntryManager.updateRowStatus(rowId);
            // }
          }
        } catch (fallbackError) {
          console.error('❌ Even fallback validation failed:', fallbackError);
        }
      }
    },

    // Clean up timers when row is removed
    cleanup(rowId = null) {
      try {
        if (rowId) {
          if (this.updateTimers.has(rowId)) {
            clearTimeout(this.updateTimers.get(rowId));
            this.updateTimers.delete(rowId);
          }
        } else {
          // Clean up all timers
          this.updateTimers.forEach(timer => clearTimeout(timer));
          this.updateTimers.clear();
        }

        console.log(`🧹 Cleaned up validation timers${rowId ? ` for row ${rowId}` : ''}`);
      } catch (error) {
        console.error('❌ Error during cleanup:', error);
      }
    }
  },

  // ───────────────────────────────────────────────────────────────────
  // 🎯 MAIN VALIDATION ORCHESTRATION METHODS
  // ───────────────────────────────────────────────────────────────────

  // Enhanced validate individual row - UPGRADED for Unified Validation (Phase 2)
  validateRow: function (rowId) {
    // console.log(`🔍 Validating row ${rowId}...`);
    const rowData = this.activeRows.get(rowId);
    if (!rowData) return false;

    const rowElement = rowData.element;

    try {
      // Use existing validation engine
      const validation = this.batchValidator.validateRowComplete(rowId);

      // Check if unified validation is enabled
      const config = this.unifiedValidationManager.getUnifiedConfig();
      // console.log(`Unified Validation Config: ${JSON.stringify(config)} : config.enableUnifiedStatus=${config.enableUnifiedStatus}`);
      if (config.enableUnifiedStatus) {
        // console.log(`🔄 Processing unified validation for row ${rowId}`);

        // Collect individual field validation status for unified display
        const fieldValidations = this.fieldValidationCollector.collectFieldValidationStatus(rowElement);

        // Enhanced validation result with unified data
        const enhancedValidation = {
          ...validation,
          fieldValidations,
          fieldCounts: this.fieldProgressTracker.countFieldCompletion(rowElement, rowId),
          processedAt: new Date().toISOString()
        };

        // Update row data with enhanced information
        rowData.isValid = enhancedValidation.isValid;
        rowData.validationErrors = enhancedValidation.errors;
        rowData.validationWarnings = enhancedValidation.warnings;
        rowData.fieldValidations = fieldValidations;
        rowData.enhancedValidation = enhancedValidation;

        // 🎯 DISPLAY UNIFIED VALIDATION UI - This was missing!
        this.displayUnifiedValidationUI(rowElement, enhancedValidation);

        console.log(`✅ Unified validation completed for row ${rowId}:`, enhancedValidation);
        this.activeRows.set(rowId, rowData);

        // Use unified coordinator for smooth updates
        this.unifiedValidationCoordinator.executeUnifiedValidation(rowId);

        console.log(`✅ Unified validation processed for row ${rowId}:`, {
          isValid: enhancedValidation.isValid,
          errors: enhancedValidation.errors.length,
          warnings: enhancedValidation.warnings.length,
          fieldProgress: `${enhancedValidation.fieldCounts.complete}/${enhancedValidation.fieldCounts.total}`
        });

      } else {
        console.log(`🔄 Using legacy validation display for row ${rowId}`);

        // Legacy behavior - display using original engine
        this.batchValidator.displaySummaryValidation(rowElement, validation);

        // Update row data (legacy format)
        rowData.isValid = validation.isValid;
        rowData.validationErrors = validation.errors;
        rowData.validationWarnings = validation.warnings;
        this.activeRows.set(rowId, rowData);

        // Log validation results for debugging
        if (validation.errors.length > 0 || validation.warnings.length > 0) {
          console.log(`🔍 Legacy validation results for row ${rowId}:`, {
            errors: validation.errors.length,
            warnings: validation.warnings.length,
            isValid: validation.isValid
          });
        }
      }
      console.log(`🔍 End of validation for row ${rowId}: ${validation.isValid}`);
      return validation.isValid;

    } catch (error) {
      console.error(`❌ Error validating row ${rowId}:`, error);

      // Fallback to basic validation
      const basicValidation = { isValid: false, errors: ['Validation failed'], warnings: [] };
      rowData.isValid = false;
      rowData.validationErrors = basicValidation.errors;
      rowData.validationWarnings = basicValidation.warnings;
      this.activeRows.set(rowId, rowData);

      return false;
    }
  },

  // 🎯 NEW: Display Unified Validation UI - The missing link!
  displayUnifiedValidationUI: function (rowElement, validationResult) {
    try {
      // Find or create validation container
      let container = rowElement.querySelector('.batch-row-validation-messages');
      if (!container) {
        container = document.createElement('div');
        container.className = 'batch-row-validation-messages mt-2';

        // Insert after row header
        const rowHeader = rowElement.querySelector('.accordion-header');
        if (rowHeader) {
          rowHeader.insertAdjacentElement('afterend', container);
        } else {
          // Fallback: prepend to row body
          const rowBody = rowElement.querySelector('.accordion-body');
          if (rowBody) {
            rowBody.insertBefore(container, rowBody.firstChild);
          }
        }
      }

      // Use unified validation manager to generate appropriate UI container
      const generatedContainer = this.unifiedValidationManager.generateUnifiedValidationUI(rowElement, validationResult);
      if (generatedContainer) {
        // Container is already properly inserted into DOM by generateUnifiedValidationUI
        console.log('🎨 Unified validation UI displayed successfully');
      } else {
        console.warn('⚠️ No unified container generated, keeping existing display');
      }

    } catch (error) {
      console.error('❌ Error displaying unified validation UI:', error);
      // Silently fail to avoid breaking the validation flow
    }
  },

  // Validate all batch rows and show summary (Enhanced with Unified Validation + Message Preservation)
  validateAllRows: function () {
    // 🚫 Prevent concurrent validation runs
    if (this._validationInProgress) {
      // console.log('⏭️ Validation already in progress, skipping duplicate request');
      return;
    }

    this._validationInProgress = true;
    // console.log('🔍 Running validation on all batch rows...');

    // 🎯 Check if unified validation is enabled (Fixed: safer validation)
    const useUnifiedValidation = (window.UNIFIED_VALIDATION_CONFIG?.enabled === true) &&
      (typeof this.unifiedValidationCoordinator !== 'undefined') &&
      (typeof this.unifiedValidationManager !== 'undefined');

    let totalValid = 0;
    let totalErrors = 0;
    let totalWarnings = 0;
    const invalidRows = [];
    const warningRows = [];

    // 🆕 Store individual validation messages before batch processing
    const preservedValidationMessages = new Map();

    try {
      // 🆕 Phase 1: Preserve existing validation messages
      this.activeRows.forEach((rowData, rowId) => {
        const rowElement = document.querySelector(`[data-batch-row-id="${rowId}"]`);
        if (rowElement) {
          const validationContainer = rowElement.querySelector('.batch-row-validation-messages');
          if (validationContainer && validationContainer.innerHTML.trim()) {
            // Store existing validation HTML to preserve individual field messages
            preservedValidationMessages.set(rowId, {
              html: validationContainer.innerHTML,
              timestamp: Date.now()
            });
            console.log(`💾 Preserved validation messages for row ${rowId}`);
          }
        }
      });

      // 🆕 Phase 2: Validate each row with sequential processing
      this.activeRows.forEach((rowData, rowId) => {

        const isValid = this.validateRow(rowId);
        //this.updateRowStatus(rowId);

        if (isValid) {
          totalValid++;
        } else {
          const rowNumber = document.querySelector(`[data-batch-row-id="${rowId}"] .batch-row-number`)?.textContent;
          invalidRows.push({ rowId, rowNumber });
        }

        // Count errors and warnings from row data
        if (rowData.validationErrors) {
          totalErrors += rowData.validationErrors.length;
        }
        if (rowData.validationWarnings) {
          totalWarnings += rowData.validationWarnings.length;
          if (rowData.validationWarnings.length > 0) {
            const rowNumber = document.querySelector(`[data-batch-row-id="${rowId}"] .batch-row-number`)?.textContent;
            warningRows.push({ rowId, rowNumber, warnings: rowData.validationWarnings });
          }
        }

        // 🎯 Process unified validation if enabled (Fixed: use internal coordinator)
        if (useUnifiedValidation) {
          try {
            const rowElement = document.querySelector(`[data-batch-row-id="${rowId}"]`);
            if (rowElement) {
              // Use internal unified validation coordinator instead of window object
              this.unifiedValidationCoordinator.executeUnifiedValidation(rowId);
            }
          } catch (unifiedError) {
            console.warn('⚠️ Unified validation error for row:', rowId, unifiedError);
          }
        }

        // 🆕 Phase 3: Restore preserved validation messages if they exist
        if (preservedValidationMessages.has(rowId)) {
          const preserved = preservedValidationMessages.get(rowId);
          const rowElement = document.querySelector(`[data-batch-row-id="${rowId}"]`);

          if (rowElement) {
            setTimeout(() => {
              const validationContainer = rowElement.querySelector('.batch-row-validation-messages');
              if (validationContainer && preserved.html) {
                // Merge preserved individual messages with new validation state
                validationContainer.innerHTML = preserved.html;
                console.log(`🔄 Restored preserved validation messages for row ${rowId}`);
              }
            }, 20); // Small delay to let validation complete first
          }
        }
      });
    } catch (error) {
      console.error('❌ Error in validateAllRows:', error);
      // 🔓 Reset validation lock on error
      this._validationInProgress = false;
      // Fallback to basic validation
    }

    // 🆕 Display global validation summary with preservation awareness
    this.displayGlobalValidationSummaryPreserved({
      totalRows: this.activeRows.size,
      validRows: totalValid,
      totalErrors,
      totalWarnings,
      invalidRows,
      warningRows,
      preservedMessages: preservedValidationMessages.size
    });

    // 🔓 Reset validation lock
    this._validationInProgress = false;
    // console.log('✅ Validation completed and lock released');

    return {
      isAllValid: invalidRows.length === 0,
      summary: {
        totalRows: this.activeRows.size,
        validRows: totalValid,
        totalErrors,
        totalWarnings,
        invalidRows,
        warningRows,
        preservedMessages: preservedValidationMessages.size
      }
    };
  },

  // 🆕 Display global validation summary with message preservation (Option 3)
  /**
   * 🌍 Global Validation Summary with Message Preservation
   * @description Displays global validation summary while preserving individual row messages
   * @param {Object} summary - Validation summary object
   * @param {number} summary.totalRows - Total number of rows
   * @param {number} summary.validRows - Number of valid rows
   * @param {number} summary.totalErrors - Total error count
   * @param {number} summary.totalWarnings - Total warning count
   * @param {Array} summary.invalidRows - Array of invalid row objects
   * @param {Array} summary.warningRows - Array of rows with warnings
   * @param {number} summary.preservedMessages - Count of preserved messages
   * @returns {void}
   * @usage ACTIVE - Called once in validateAllRows
   * @since Message preservation update (2024-10-15)
   */
  displayGlobalValidationSummaryPreserved: function (summary) {
    // console.log('🎯 Displaying global validation summary with message preservation');

    // 🎯 Check unified validation support (Fixed: safer validation)
    const useUnifiedValidation = (window.UNIFIED_VALIDATION_CONFIG?.enabled === true) &&
      (typeof this.unifiedValidationManager !== 'undefined') &&
      (typeof this.unifiedValidationManager.displayGlobalSummaryUI === 'function');

    let container = document.getElementById('batchValidationMessages');
    if (!container) {
      // Create container if not exists
      container = document.createElement('div');
      container.id = 'batchValidationMessages';
      container.className = 'mt-3';

      const batchSection = document.querySelector('#batchEntrySection .card-body');
      if (batchSection) {
        batchSection.insertBefore(container, batchSection.firstChild);
      }
    }

    // 🆕 ENHANCED: Clear all global messages more thoroughly to prevent duplication
    const existingGlobalMessages = container.querySelectorAll(
      '.global-validation-message, .alert-success, .alert-danger, .alert-warning, .alert-info'
    );
    existingGlobalMessages.forEach(msg => msg.remove());

    // 🔧 ADDITIONAL: Clear any stray validation summaries
    const existingSummaries = container.querySelectorAll('[class*="validation"], [class*="summary"]');
    existingSummaries.forEach(summary => {
      // Only remove if it's not an individual row message
      if (!summary.closest('[data-batch-row-id]')) {
        summary.remove();
      }
    });

    // 🎯 Apply unified validation styling if available
    if (useUnifiedValidation) {
      try {
        console.log('🎯 Using unified validation for global summary with preservation');
        // Create preserved-aware summary
        const preservedSummary = {
          ...summary,
          preservationMode: true,
          message: `Global summary (${summary.preservedMessages} individual messages preserved)`
        };

        // Use internal unified validation manager (with safety check)
        if (this.unifiedValidationManager && typeof this.unifiedValidationManager.displayGlobalSummaryUI === 'function') {
          this.unifiedValidationManager.displayGlobalSummaryUI(container, preservedSummary);
          console.log('✅ Unified validation handled preserved global summary');
          return;
        } else {
          console.warn('⚠️ Unified validation manager not properly initialized, falling back to legacy');
        }

      } catch (unifiedError) {
        console.warn('⚠️ Unified validation UI error, falling back to legacy display:', unifiedError);
      }
    }

    console.log('🔄 Using legacy validation display with preservation (unified disabled or failed)');

    // Success message with preservation info (Legacy fallback)
    if (summary.invalidRows.length === 0 && summary.totalErrors === 0) {
      const successDiv = document.createElement('div');
      successDiv.className = 'alert alert-success d-flex align-items-center global-validation-message';
      successDiv.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>
        <div>
          <strong>Validation Passed!</strong> All ${summary.totalRows} rows are valid and ready to save.
          ${summary.preservedMessages > 0 ? `<br><small class="text-info"><i class="fas fa-shield-alt me-1"></i>Individual field messages preserved for ${summary.preservedMessages} rows.</small>` : ''}
          ${summary.totalWarnings > 0 ? `<br><small class="text-warning">Note: ${summary.totalWarnings} warnings found, but they won't prevent saving.</small>` : ''}
        </div>
      `;
      container.appendChild(successDiv);
      return;
    }

    // Error summary with preservation info (Legacy fallback)
    if (summary.invalidRows.length > 0) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'alert alert-danger global-validation-message';
      errorDiv.innerHTML = `
        <h6 class="alert-heading"><i class="fas fa-exclamation-circle me-2"></i>Validation Errors Found</h6>
        <p class="mb-2">Found ${summary.totalErrors} errors in ${summary.invalidRows.length} rows. Please fix these errors before saving:</p>
        <ul class="mb-0">
          ${summary.invalidRows.map(row =>
        `<li>Row ${row.rowNumber} (ID: ${row.rowId})</li>`
      ).join('')}
        </ul>
        <hr>
        <p class="mb-2"><small><i class="fas fa-info-circle me-1"></i>Click on each row to expand and see detailed error messages.</small></p>
        ${summary.preservedMessages > 0 ?
          `<p class="mb-0"><small class="text-info"><i class="fas fa-shield-alt me-1"></i>Individual field validation messages preserved for ${summary.preservedMessages} rows to maintain field-specific guidance.</small></p>`
          : ''}
      `;
      container.appendChild(errorDiv);
    }

    // Warning summary with preservation info (Legacy fallback)
    if (summary.warningRows.length > 0) {
      const warningDiv = document.createElement('div');
      warningDiv.className = 'alert alert-warning global-validation-message';
      warningDiv.innerHTML = `
        <h6 class="alert-heading"><i class="fas fa-exclamation-triangle me-2"></i>Validation Warnings</h6>
        <p class="mb-2">Found ${summary.totalWarnings} warnings in ${summary.warningRows.length} rows:</p>
        <ul class="mb-0">
          ${summary.warningRows.map(row =>
        `<li>Row ${row.rowNumber}: ${row.warnings.length} warning${row.warnings.length > 1 ? 's' : ''}</li>`
      ).join('')}
        </ul>
        <hr>
        <p class="mb-0"><small><i class="fas fa-info-circle me-1"></i>Warnings won't prevent saving, but please review them.</small></p>
        ${summary.preservedMessages > 0 ?
          `<p class="mb-0 mt-1"><small class="text-info"><i class="fas fa-shield-alt me-1"></i>Individual field messages preserved to help you locate specific warning fields.</small></p>`
          : ''}
      `;
      container.appendChild(warningDiv);
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════════════════
  // 🏷️ 5.5 DATA TRACKING & FIELD MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════════════════

  // ───────────────────────────────────────────────────────────────────
  // � DATA ATTRIBUTE TRACKING SYSTEM
  // ───────────────────────────────────────────────────────────────────

  /**
   * Initialize data tracking attributes for all batch input fields
   * Sets initial data-source, data-user-override, and data-calculated-value attributes
   * Called when: Page loads, new row added, row data loaded from API
   *
   * @description Part of Phase 2 Implementation (Smart Populate Enhancement)
   */
  initializeBatchFieldTracking: function () {
    console.log('🏷️ Initializing batch field tracking...');

    $('input[id^="batch"]').each(function () {
      const $field = $(this);
      const currentValue = $field.val();

      // Set initial state based on existing value
      if (!$field.attr('data-source')) {
        if (currentValue && parseFloat(currentValue) > 0) {
          $field.attr('data-source', 'api'); // Assume loaded from API
        } else {
          $field.attr('data-source', 'empty');
        }
      }

      if (!$field.attr('data-user-override')) {
        $field.attr('data-user-override', 'false');
      }

      if (!$field.attr('data-calculated-value')) {
        $field.attr('data-calculated-value', '');
      }
    });

    console.log('✅ Batch field tracking initialized');
  },

  /**
   * Track user input on batch fields to distinguish manual edits from calculated values
   * Attached via event delegation for dynamically added rows
   *
   * @description Part of Phase 2 Implementation (Smart Populate Enhancement)
   */
  attachUserInputTracking: function () {
    const self = this;
    console.log('🎯 Attaching user input tracking...');

    // Use event delegation for dynamically added rows
    $(document).on('input', 'input[id^="batch"][id*="Le"], input[id^="batch"][id*="Bg"]', function () {
      const $field = $(this);
      const fieldId = $field.attr('id');

      // Skip PE summary fields (they're calculated, not user input)
      if (fieldId.includes('_LePe') || fieldId.includes('_BgPe')) {
        return;
      }

      const currentValue = parseFloat($field.val()) || 0;
      const calculatedValue = parseFloat($field.attr('data-calculated-value')) || 0;
      const currentSource = $field.attr('data-source') || 'empty';

      // Mark as user input if value differs from calculated
      if (currentValue !== calculatedValue && currentValue > 0) {
        $field.attr('data-source', 'user');
        $field.attr('data-user-override', 'true');
        console.log(`✏️ User edited ${fieldId}: ${currentValue} (was ${currentSource})`);
      } else if (currentValue === 0) {
        $field.attr('data-source', 'empty');
        $field.attr('data-user-override', 'false');
      }
    });

    console.log('✅ User input tracking attached');
  },

  /**
   * Reset tracking attributes for a specific row (useful for debugging)
   *
   * @param {number} rowNum - Row number (e.g., 1, 2, 3)
   * @description Part of Phase 2 Implementation (Smart Populate Enhancement)
   */
  resetRowTracking: function (rowNum) {
    $(`input[id*="${rowNum}_"]`).each(function () {
      $(this).attr('data-source', 'empty');
      $(this).attr('data-user-override', 'false');
      $(this).attr('data-calculated-value', '');
      $(this).removeAttr('data-copy-source');
    });
    console.log(`🔄 Reset tracking for Row ${rowNum}`);
  },

  // ═══════════════════════════════════════════════════════════════════════════════════════
  // �💾 6. DATA OPERATIONS & PERSISTENCE
  // ═══════════════════════════════════════════════════════════════════════════════════════

  // ───────────────────────────────────────────────────────────────────
  // 🧠 SMART POPULATE LOGIC (Enhanced with Data Tracking)
  // ───────────────────────────────────────────────────────────────────

  /**
   * Smart Populate with Data Tracking Support
   * Populates field value only if it's not a user override
   *
   * @param {number} rowNum - Row number (e.g., 1, 2, 3)
   * @param {string} fieldSuffix - Field suffix (e.g., 'LePayroll', 'LeSocialSecurity')
   * @param {string} fieldPrefix - Field prefix ('batchLe' for LE fields, 'batchBg' for BG fields)
   * @param {*} newValue - New value to populate
   *
   * @description Part of Phase 2 Implementation (Smart Populate Enhancement)
   *
   * @example
   * // Usage in Cal button:
   * this.smartPopulateBatchField(1, 'LePayroll', 'batchLe', 50000);
   *
   * @logic
   * - SKIP if: data-source="user" AND data-user-override="true" (User manual input)
   * - UPDATE if: data-source="empty" (Empty field)
   * - UPDATE if: data-source="calculated" (Previous calculation)
   * - UPDATE if: data-source="copied" (Copied from another row)
   * - UPDATE if: data-source="api" (Loaded from API)
   */
  smartPopulateBatchField: function (rowNum, fieldSuffix, fieldPrefix, newValue) {
    const fieldId = `${fieldPrefix}${rowNum}_${fieldSuffix}`;
    const field = document.getElementById(fieldId);

    if (!field) {
      console.warn(`⚠️ Field not found: ${fieldId}`);
      return;
    }

    const currentValue = parseFloat(field.value) || 0;
    const apiValue = parseFloat(newValue) || 0;
    const $field = $(field);
    const source = $field.attr('data-source') || 'empty';

    // ✅ Phase 3 Fix: Skip LePayroll if empty (Task 3.2 Validation will handle)
    if (fieldSuffix === 'LePayroll' && source === 'empty') {
      console.log(`⏭️ Skip ${fieldId}: EMPTY field (validation will catch this in Task 3.2)`);
      return;
    }

    // ✅ CRITICAL FIX: Allow LePayroll recalculation
    // When user changes LePayroll then clicks Cal, we need to update ALL fields
    // including LePayroll itself (for benefits recalculation consistency)
    if (fieldSuffix === 'LePayroll') {
      const oldValue = currentValue;
      field.value = newValue;

      // Update tracking attributes
      $field.attr('data-source', 'calculated');
      $field.attr('data-calculated-value', newValue);
      $field.attr('data-user-override', 'false');

      console.log(`🔄 LePayroll Recalculated: ${oldValue} → ${newValue} [${source} → calculated]`);
      return; // Exit after handling LePayroll
    }

    // ✅ NEW LOGIC (Phase 3 Fix): Smart populate with API value checking
    // Rule 1: Input > 0 AND API = 0 → Skip (Keep user input)
    // Rule 2: Input > 0 AND API > 0 → Populate (Update with API value)
    // Rule 3: Input = 0 or Empty → Populate (Use API value)

    if (currentValue > 0 && apiValue === 0) {
      console.log(`⏭️ Skip ${fieldId}: INPUT HAS VALUE (${currentValue}) but API returns 0`);
      return;
    }

    // ✅ Populate: Either currentValue = 0 OR apiValue > 0
    const oldValue = currentValue;
    field.value = newValue;

    // Update tracking attributes
    $field.attr('data-source', 'calculated');
    $field.attr('data-calculated-value', newValue);
    $field.attr('data-user-override', 'false');

    if (oldValue !== parseFloat(newValue)) {
      console.log(`✅ Updated ${fieldId}: ${oldValue} → ${newValue} (API=${apiValue})`);
    } else {
      console.log(`✅ Confirmed ${fieldId}: ${newValue} (API=${apiValue})`);
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════════════════
  // 🏷️ 5.6 CAL BUTTON STATE TRACKING (Phase 3 - Task 3.1)
  // ═══════════════════════════════════════════════════════════════════════════════════════

  /**
   * Mark row as calculated (Cal button clicked)
   * Sets data-cal-clicked="true" and timestamp
   *
   * @param {number} rowNum - Row number
   */
  markRowAsCalculated: function (rowNum) {
    const rowId = `batch-row-${rowNum}`;
    const $row = $(`[data-batch-row-id="${rowId}"]`);

    if ($row.length) {
      $row.attr('data-cal-clicked', 'true');
      $row.attr('data-cal-timestamp', new Date().toISOString());
      console.log(`✅ Row ${rowNum} marked as calculated (Cal button clicked)`);
    } else {
      console.warn(`⚠️ Row ${rowNum} not found - cannot mark as calculated`);
    }
  },

  /**
   * Check if row has been calculated (Cal button clicked)
   *
   * @param {number} rowNum - Row number
   * @returns {boolean} True if Cal button was clicked
   */
  isRowCalculated: function (rowNum) {
    const rowId = `batch-row-${rowNum}`;
    const $row = $(`[data-batch-row-id="${rowId}"]`);
    return $row.attr('data-cal-clicked') === 'true';
  },

  /**
   * Reset Cal button state for a row
   * Called when user changes key input fields (Salary, Bonus Type, etc.)
   *
   * @param {number} rowNum - Row number
   */
  resetRowCalState: function (rowNum) {
    const rowId = `batch-row-${rowNum}`;
    const $row = $(`[data-batch-row-id="${rowId}"]`);

    if ($row.length) {
      $row.removeAttr('data-cal-clicked');
      $row.removeAttr('data-cal-timestamp');
      console.log(`🔄 Row ${rowNum} Cal state reset (input changed)`);
    }
  },

  /**
   * Get Cal button timestamp for a row
   *
   * @param {number} rowNum - Row number
   * @returns {string|null} ISO timestamp or null
   */
  getRowCalTimestamp: function (rowNum) {
    const rowId = `batch-row-${rowNum}`;
    const $row = $(`[data-batch-row-id="${rowId}"]`);
    return $row.attr('data-cal-timestamp') || null;
  },

  // ═══════════════════════════════════════════════════════════════════════════════════════
  // � 5.7 RE-CALCULATE CONFIRMATION (Phase 4 - Task 4.1)
  // ═══════════════════════════════════════════════════════════════════════════════════════

  /**
   * Show Re-Calculate confirmation modal
   * Called when user clicks CAL button for 2nd, 3rd, ... nth time
   *
   * @param {HTMLElement} rowElement - The batch row element
   * @param {string} rowId - The batch row ID (e.g., 'batch-row-1')
   * @param {string} rowNumber - The row number (e.g., '1')
   */
  showReCalculateConfirmation: function (rowElement, rowId, rowNumber) {
    console.log(`⚠️ [Re-Calculate] Showing confirmation for Row ${rowNumber}`);

    // Get previous calculation timestamp
    const timestamp = this.getRowCalTimestamp(rowNumber);
    const timestampText = timestamp
      ? new Date(timestamp).toLocaleString('th-TH')
      : 'ไม่ทราบ';

    // Update modal message
    const warningMessage = `
      แถวนี้เคยคำนวณแล้วเมื่อ: <strong>${timestampText}</strong><br>
      การคำนวณใหม่จะทำให้ข้อมูลบางส่วนที่คุณกรอกเพิ่มเติมอาจถูกแทนที่<br>
      <br>
      <strong>หมายเหตุ:</strong> API จะคำนวณและอัปเดตฟิลด์ทั้งหมดใหม่
    `;
    $('#reCalculateWarningMessage').html(warningMessage);

    // Store context for confirmation callback
    const $modal = $('#confirmReCalculateModal');
    $modal.data('rowElement', rowElement);
    $modal.data('rowId', rowId);
    $modal.data('rowNumber', rowNumber);

    // Show modal
    $modal.modal('show');
  },

  /**
   * Handle Re-Calculate confirmation (user clicked "Re-Calculate" button)
   * This is bound to the modal's confirm button in initializeModalHandlers()
   */
  handleReCalculateConfirmation: function () {
    const $modal = $('#confirmReCalculateModal');
    const rowElement = $modal.data('rowElement');
    const rowId = $modal.data('rowId');
    const rowNumber = $modal.data('rowNumber');

    if (!rowElement || !rowId || !rowNumber) {
      console.error('❌ [Re-Calculate] Missing context data');
      return;
    }

    console.log(`✅ [Re-Calculate] User confirmed - proceeding with Row ${rowNumber}`);

    // Close modal
    $modal.modal('hide');

    // Proceed with calculation
    this.calculateBudgetBigcEstimate(rowElement, rowId, rowNumber);
  },

  // ═══════════════════════════════════════════════════════════════════════════════════════
  // �💾 6. DATA OPERATIONS & PERSISTENCE
  // ═══════════════════════════════════════════════════════════════════════════════════════

  // ───────────────────────────────────────────────────────────────────
  // 🗑️ ROW DELETION & CLEANUP
  // ───────────────────────────────────────────────────────────────────

  // Delete specific batch row with proper cleanup
  deleteBatchRow: function (rowId) {
    console.log(`🗑️ Deleting batch row: ${rowId}`);

    const rowElement = document.querySelector(`[data-batch-row-id="${rowId}"]`);

    if (!rowElement) {
      console.warn(`⚠️ Row element not found for rowId: ${rowId}`);
      this.activeRows.delete(rowId);
      return;
    }

    // 🧹 Memory Cleanup - Clear WeakMap references before DOM removal
    if (this.rowEventListeners && this.rowEventListeners.has(rowElement)) {
      this.rowEventListeners.delete(rowElement);
    }
    if (this.rowValidationState && this.rowValidationState.has(rowElement)) {
      this.rowValidationState.delete(rowElement);
    }
    if (this.rowDOMReferences && this.rowDOMReferences.has(rowElement)) {
      this.rowDOMReferences.delete(rowElement);
    }

    // Remove from DOM and activeRows
    rowElement.remove();
    this.activeRows.delete(rowId);

    // Update UI state
    this.updateRowCounter();
    this.updateDeleteButtonState();

    // Show no rows message if empty
    if (this.activeRows.size === 0) {
      const noRowsMessage = document.getElementById('noBatchRowsMessage');
      if (noRowsMessage) {
        noRowsMessage.style.display = 'block';
      }
    }
  },

  // Delete selected rows
  deleteSelectedRows: function () {
    const selectedCheckboxes = document.querySelectorAll('.batch-row-selector:checked');
    const rowsToDelete = [];

    selectedCheckboxes.forEach(checkbox => {
      const rowElement = checkbox.closest('.accordion-item');
      const rowId = rowElement.getAttribute('data-batch-row-id');
      if (rowId) {
        rowsToDelete.push(rowId);
      }
    });

    if (rowsToDelete.length > 0) {
      // Use generic modal instead of native confirm()
      this.showConfirmModal({
        title: 'ยืนยันการลบ',
        message: `ต้องการลบ ${rowsToDelete.length} แถวที่เลือกหรือไม่?\n\nการดำเนินการนี้ไม่สามารถย้อนกลับได้`,
        iconType: 'trash',
        confirmText: 'ลบ',
        cancelText: 'ยกเลิก',
        onConfirm: () => {
          rowsToDelete.forEach(rowId => this.deleteBatchRow(rowId));
          console.log(`🗑️ Deleted ${rowsToDelete.length} selected rows`);
        },
        onCancel: () => {
          console.log('💭 User cancelled delete operation');
        }
      });
    }
  },

  // Select/Deselect all rows
  selectAllRows: function () {
    const checkboxes = document.querySelectorAll('.batch-row-selector');
    const allSelected = Array.from(checkboxes).every(cb => cb.checked);

    checkboxes.forEach(checkbox => {
      checkbox.checked = !allSelected;
    });

    this.updateDeleteButtonState();

    // Update button text
    const button = document.getElementById('selectAllBatchRowsBtn');
    if (button) {
      const icon = button.querySelector('i');
      const text = allSelected ? ` ${BATCH_UI_MESSAGES.buttons.selectAll}` : ' Deselect All';
      button.innerHTML = `<i class="fa-solid fa-${allSelected ? 'check-square' : 'square'}"></i>${text}`;
    }
  },

  // Expand all accordion rows
  expandAllRows: function () {
    const collapseElements = document.querySelectorAll('#batchEntryAccordion .accordion-collapse');
    collapseElements.forEach(element => {
      new coreui.Collapse(element).show();
    });
  },

  // Collapse all accordion rows
  collapseAllRows: function () {
    const collapseElements = document.querySelectorAll('#batchEntryAccordion .accordion-collapse');
    collapseElements.forEach(element => {
      new coreui.Collapse(element).hide();
    });
  },

  // Update row counter display
  updateRowCounter: function () {
    const counter = document.getElementById('batchRowCounter');
    if (counter) {
      const count = this.activeRows.size;
      counter.textContent = `${count} Row${count !== 1 ? 's' : ''}`;
    }
  },

  // Update delete button state
  updateDeleteButtonState: function () {
    const selectedCheckboxes = document.querySelectorAll('.batch-row-selector:checked');
    const deleteBtn = document.getElementById('deleteBatchRowsBtn');

    if (deleteBtn) {
      deleteBtn.disabled = selectedCheckboxes.length === 0;
    }
  },



  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📋 ROW COPYING & DUPLICATION - REWRITTEN (SA Request 2025-10-18)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // NEW APPROACH: Direct DOM cloning without template regeneration
  // No race conditions, no timing issues, straightforward copy
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 🔍 Get all benefits fields for a specific row
   * @param {number} rowIndex - Row index (1, 2, 3, ...)
   * @returns {Array} Array of field elements
   */
  getBenefitsFieldsForRow: function (rowIndex) {
    const fields = [];

    // Query all benefits fields in the shared container
    const allFields = document.querySelectorAll(
      'input[id^="batchLe"], input[id^="batchBg"], ' +
      'select[id^="batchLe"], select[id^="batchBg"], ' +
      'textarea[id^="batchLe"], textarea[id^="batchBg"]'
    );

    // Filter only fields for this specific row
    allFields.forEach(field => {
      if (field.id.startsWith(`batchLe${rowIndex}_`) ||
        field.id.startsWith(`batchBg${rowIndex}_`)) {
        fields.push(field);
      }
    });

    console.log(`🔍 Found ${fields.length} benefits fields for row ${rowIndex}`);
    return fields;
  },

  /**
   * 📊 Extract field data from source row
   * @param {number} sourceRowIndex - Source row index
   * @returns {Object} Field data map { fieldBaseName: { value, selectedIndex, ... } }
   */
  extractBenefitsFieldData: function (sourceRowIndex) {
    const fieldDataMap = new Map();
    const sourceFields = this.getBenefitsFieldsForRow(sourceRowIndex);

    console.log(`💾 Extracting data from ${sourceFields.length} benefits fields (row ${sourceRowIndex})`);

    sourceFields.forEach(field => {
      // Extract TRUE base field name (remove row-specific prefix completely)
      // Example: batchLe1_editLePayroll → editLePayroll
      // Example: batchBg1_editBgBonus → editBgBonus
      let baseName = field.id;

      // Remove batchLe{N}_ prefix
      if (baseName.startsWith(`batchLe${sourceRowIndex}_`)) {
        baseName = baseName.replace(`batchLe${sourceRowIndex}_`, '');
      }
      // Remove batchBg{N}_ prefix
      else if (baseName.startsWith(`batchBg${sourceRowIndex}_`)) {
        baseName = baseName.replace(`batchBg${sourceRowIndex}_`, '');
      }

      const fieldData = {
        baseName: baseName,
        originalId: field.id,
        value: field.value,
        type: field.type,
        tagName: field.tagName.toLowerCase(),
        isLeField: field.id.startsWith(`batchLe${sourceRowIndex}_`),
        isBgField: field.id.startsWith(`batchBg${sourceRowIndex}_`)
      };

      // For SELECT elements, also store selectedIndex
      if (field.tagName === 'SELECT') {
        fieldData.selectedIndex = field.selectedIndex;
        fieldData.selectedValue = field.value;
      }

      // Only store if has value
      if (field.value && field.value.trim() !== '') {
        fieldDataMap.set(baseName, fieldData);
        console.log(`  💾 ${field.id} → ${baseName}: "${field.value}"`);
      }
    });

    console.log(`✅ Extracted ${fieldDataMap.size} fields with values`);
    return fieldDataMap;
  },

  /**
   * 🎯 [DEPRECATED] Apply field data to target row
   * @param {number} targetRowIndex - Target row index
   * @param {Map} fieldDataMap - Field data map from source
   * @returns {Object} Result with success/fail counts
   */
  /*
  applyBenefitsFieldData: function(targetRowIndex, fieldDataMap) {
    const result = {
      total: fieldDataMap.size,
      success: 0,
      failed: 0,
      failedFields: []
    };

    console.log(`📝 Applying ${fieldDataMap.size} fields to row ${targetRowIndex}`);

    fieldDataMap.forEach((fieldData, baseName) => {
      // Construct target field ID
      const targetFieldId = baseName
        .replace('Le_', `batchLe${targetRowIndex}_`)
        .replace('Bg_', `batchBg${targetRowIndex}_`);

      const targetField = document.getElementById(targetFieldId);

      if (targetField) {
        try {
          // Apply value
          targetField.value = fieldData.value;

          // For SELECT, also try to set by index if value match fails
          if (fieldData.tagName === 'select' && fieldData.selectedIndex >= 0) {
            if (targetField.options.length > fieldData.selectedIndex) {
              targetField.selectedIndex = fieldData.selectedIndex;
            }
          }

          // Trigger events for validation/change detection
          targetField.dispatchEvent(new Event('input', { bubbles: true }));
          targetField.dispatchEvent(new Event('change', { bubbles: true }));

          result.success++;
          console.log(`  ✅ ${targetFieldId} = "${fieldData.value}"`);
        } catch (error) {
          result.failed++;
          result.failedFields.push({ id: targetFieldId, error: error.message });
          console.error(`  ❌ Error setting ${targetFieldId}:`, error);
        }
      } else {
        result.failed++;
        result.failedFields.push({ id: targetFieldId, error: 'Field not found' });
        console.warn(`  ⚠️ Target field not found: ${targetFieldId}`);
      }
    });

    console.log(`📊 Result: ${result.success} success, ${result.failed} failed`);
    return result;
  },
  */

  /**
 * ═══════════════════════════════════════════════════════════════════
 * 🔄 COPY BATCH ROW - COMPLETELY REWRITTEN (Simple & Clear)
 * ═══════════════════════════════════════════════════════════════════
 * Created: 2025-10-18
 * Author: Ten (AI Developer)
 *
 * แนวทางใหม่: ทำทีละ STEP ชัดเจน ไม่ซับซ้อน
 *
 * STEP 1: Validate & Get source data
 * STEP 2: Create new row
 * STEP 3: Wait for new row ready
 * STEP 4: Copy Primary fields
 * STEP 5: Clear old Benefits fields (ถ้ามี)
 * STEP 6: Generate new Benefits template
 * STEP 7: Wait for Benefits template ready
 * STEP 8: Copy Benefits field values
 * STEP 9: Done!
 * ═══════════════════════════════════════════════════════════════════
 */

  copyBatchRow: function (sourceRowId) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🎯 [NEW COPY] Starting copy operation from ${sourceRowId}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    const self = this;

    // ═══════════════════════════════════════════════════════════════
    // STEP 1: Validate & Extract source data
    // ═══════════════════════════════════════════════════════════════
    console.log(`📋 STEP 1: Validating source row...`);

    const sourceElement = document.querySelector(`[data-batch-row-id="${sourceRowId}"]`);
    if (!sourceElement) {
      // Use generic modal instead of native alert()
      this.showConfirmModal({
        title: 'ข้อผิดพลาด',
        message: 'ไม่พบแถวต้นฉบับที่ต้องการคัดลอก\n\nกรุณาลองใหม่อีกครั้ง',
        iconType: 'error',
        confirmText: 'ตรวจสอบ',
        showCancel: false,
        onConfirm: () => {
          console.log('❌ Source row not found error acknowledged');
        }
      });
      return Promise.reject('Source row not found');
    }

    const sourceRowIndex = parseInt(sourceRowId.replace('batch-row-', ''));
    console.log(`  ✅ Source row index: ${sourceRowIndex}`);

    // Get company ID
    const companyField = sourceElement.querySelector('.batch-company');
    const companyID = companyField?.value;
    if (!companyID) {
      // Use generic modal instead of native alert()
      this.showConfirmModal({
        title: 'ข้อมูลไม่ครบถ้วน',
        message: 'กรุณาเลือก Company ในแถวต้นฉบับก่อนคัดลอก\n\nไม่สามารถคัดลอกแถวที่ไม่มี Company ได้',
        iconType: 'error',
        confirmText: 'เข้าใจแล้ว',
        showCancel: false,
        onConfirm: () => {
          console.log('❌ Company not selected error acknowledged');
        }
      });
      return Promise.reject('Company not selected');
    }
    console.log(`  ✅ Company ID: ${companyID}`);

    // Extract Primary fields data
    console.log(`  📊 Extracting Primary fields...`);
    const primaryData = new Map();
    const primaryFields = sourceElement.querySelectorAll(
      'input:not([id^="batchLe"]):not([id^="batchBg"]), select:not([id^="batchLe"]):not([id^="batchBg"])'
    );

    primaryFields.forEach(field => {
      if (!field.name) return;
      const baseName = field.name.replace(`${sourceRowId}_`, '');

      if (field.tagName === 'SELECT') {
        primaryData.set(baseName, {
          type: 'select',
          value: field.value,
          text: field.selectedOptions[0]?.text || '',
          selectedIndex: field.selectedIndex  // Keep for backward compatibility
        });
      } else {
        primaryData.set(baseName, {
          type: 'input',
          value: field.value
        });
      }
    });
    console.log(`  ✅ Extracted ${primaryData.size} Primary fields`);

    // Extract Benefits fields data
    console.log(`  📊 Extracting Benefits fields...`);
    const benefitsData = new Map();

    // LE Benefits
    const leFields = document.querySelectorAll(`[id^="batchLe${sourceRowIndex}_"]`);
    leFields.forEach(field => {
      const fieldId = field.id;
      const baseName = fieldId.replace(`batchLe${sourceRowIndex}_`, '');

      if (field.tagName === 'SELECT') {
        benefitsData.set(baseName, {
          type: 'select',
          prefix: 'batchLe',
          value: field.value,
          text: field.selectedOptions[0]?.text || '',
          selectedIndex: field.selectedIndex  // Keep for backward compatibility
        });
      } else {
        benefitsData.set(baseName, {
          type: 'input',
          prefix: 'batchLe',
          value: field.value
        });
      }
    });

    // BG Benefits
    const bgFields = document.querySelectorAll(`[id^="batchBg${sourceRowIndex}_"]`);
    bgFields.forEach(field => {
      const fieldId = field.id;
      const baseName = fieldId.replace(`batchBg${sourceRowIndex}_`, '');

      if (field.tagName === 'SELECT') {
        benefitsData.set(baseName, {
          type: 'select',
          prefix: 'batchBg',
          value: field.value,
          text: field.selectedOptions[0]?.text || '',
          selectedIndex: field.selectedIndex  // Keep for backward compatibility
        });
      } else {
        benefitsData.set(baseName, {
          type: 'input',
          prefix: 'batchBg',
          value: field.value
        });
      }
    });
    console.log(`  ✅ Extracted ${benefitsData.size} Benefits fields (LE + BG)`);

    // ═══════════════════════════════════════════════════════════════
    // STEP 2: Create new row
    // ═══════════════════════════════════════════════════════════════
    console.log(`\n➕ STEP 2: Creating new row...`);

    // Set flag to skip auto-init
    this.isCopyingRow = true;
    this.copySourceRowId = sourceRowId;

    // Variables for tracking
    let targetRowId = null;
    let targetRowIndex = null;

    return this.addBatchRow()
      .then(() => {
        // ═══════════════════════════════════════════════════════════════
        // STEP 3: Get target row info
        // ═══════════════════════════════════════════════════════════════
        console.log(`\n✅ STEP 3: New row created, getting info...`);

        targetRowId = `batch-row-${self.nextRowId - 1}`;
        targetRowIndex = self.nextRowId - 1;

        console.log(`  ✅ Target row ID: ${targetRowId}`);
        console.log(`  ✅ Target row index: ${targetRowIndex}`);

        const targetElement = document.querySelector(`[data-batch-row-id="${targetRowId}"]`);
        if (!targetElement) {
          throw new Error('Target row element not found');
        }

        // ═══════════════════════════════════════════════════════════════
        // STEP 4: Copy Primary fields
        // ═══════════════════════════════════════════════════════════════
        console.log(`\n📋 STEP 4: Copying Primary fields...`);

        let copiedCount = 0;
        const targetPrimaryFields = targetElement.querySelectorAll('input, select, textarea');

        targetPrimaryFields.forEach(field => {
          if (!field.name) return;
          const baseName = field.name.replace(`${targetRowId}_`, '');
          const sourceData = primaryData.get(baseName);

          if (!sourceData) return;

          try {
            if (sourceData.type === 'select' && field.tagName === 'SELECT') {
              // ✅ Use value instead of selectedIndex
              if (sourceData.value) {
                // Check if option exists in target dropdown
                const optionExists = Array.from(field.options).some(opt => opt.value === sourceData.value);

                if (optionExists) {
                  field.value = sourceData.value;

                  // Trigger change event
                  if (window.jQuery && window.jQuery(field).data('select2')) {
                    window.jQuery(field).trigger('change.select2');
                  } else {
                    field.dispatchEvent(new Event('change', { bubbles: true }));
                  }

                  // 🏷️ Task 2.4: Mark as copied with tracking
                  const $field = window.jQuery ? window.jQuery(field) : null;
                  if ($field) {
                    $field.attr('data-source', 'copied');
                    $field.attr('data-copy-source', sourceRowIndex.toString());
                    $field.attr('data-user-override', 'false');
                    $field.attr('data-calculated-value', '');
                  }

                  copiedCount++;
                  console.log(`  ✅ Copied ${baseName}: "${sourceData.text}" (${sourceData.value})`);
                } else {
                  console.warn(`  ⚠️ ${baseName}: Option "${sourceData.text}" (${sourceData.value}) not found in target dropdown (will populate after cascade)`);
                }
              }
            } else if (sourceData.type === 'input') {
              field.value = sourceData.value || '';
              field.dispatchEvent(new Event('input', { bubbles: true }));

              // 🏷️ Task 2.4: Mark as copied with tracking
              const $field = window.jQuery ? window.jQuery(field) : null;
              if ($field) {
                $field.attr('data-source', 'copied');
                $field.attr('data-copy-source', sourceRowIndex.toString());
                $field.attr('data-user-override', 'false');
                $field.attr('data-calculated-value', '');
              }

              copiedCount++;
            }
          } catch (err) {
            console.warn(`  ⚠️ Error copying ${baseName}:`, err);
          }
        });

        console.log(`  ✅ Copied ${copiedCount}/${primaryData.size} Primary fields`);

        // ═══════════════════════════════════════════════════════════════
        // STEP 4.5: Retry cascading dropdowns after delay
        // ═══════════════════════════════════════════════════════════════
        console.log(`\n⏳ STEP 4.5: Retrying cascading dropdowns after delay...`);

        return new Promise((resolve) => {
          setTimeout(() => {
            console.log(`  🔄 Retrying failed dropdown copies...`);

            let retryCount = 0;
            const cascadingFields = ['division', 'department', 'section', 'compstore', 'jobband', 'SalaryStructure', 'RunRateGroup'];

            cascadingFields.forEach(baseName => {
              const sourceData = primaryData.get(baseName);
              if (!sourceData || sourceData.type !== 'select' || !sourceData.value) return;

              const targetField = targetElement.querySelector(`[name="${targetRowId}_${baseName}"]`);
              if (!targetField) return;

              // Check if already copied successfully
              if (targetField.value === sourceData.value) {
                console.log(`  ✅ ${baseName} already copied`);
                return;
              }

              // Retry copying
              const optionExists = Array.from(targetField.options).some(opt => opt.value === sourceData.value);
              if (optionExists) {
                targetField.value = sourceData.value;

                if (window.jQuery && window.jQuery(targetField).data('select2')) {
                  window.jQuery(targetField).trigger('change.select2');
                } else {
                  targetField.dispatchEvent(new Event('change', { bubbles: true }));
                }

                retryCount++;
                console.log(`  ✅ Retry success: ${baseName} = "${sourceData.text}" (${sourceData.value})`);
              } else {
                console.warn(`  ⚠️ Retry failed: ${baseName} - option "${sourceData.text}" (${sourceData.value}) still not available`);
              }
            });

            console.log(`  ✅ Retry completed: ${retryCount} fields recovered`);
            resolve();
          }, 800); // Wait 800ms for cascading to complete
        });
      })
      .then(() => {

        // ═══════════════════════════════════════════════════════════════
        // STEP 5: Clear old Benefits fields (if any exist)
        // ═══════════════════════════════════════════════════════════════
        console.log(`\n🧹 STEP 5: Cleaning old Benefits fields...`);

        const oldLeFields = document.querySelectorAll(`[id^="batchLe${targetRowIndex}_"]`);
        const oldBgFields = document.querySelectorAll(`[id^="batchBg${targetRowIndex}_"]`);

        console.log(`  🔍 Found ${oldLeFields.length} old LE fields`);
        console.log(`  🔍 Found ${oldBgFields.length} old BG fields`);

        // Remove old LE fields
        oldLeFields.forEach(field => {
          const parent = field.closest('.col-md-4, .col-md-6, .col-12, [class*="col-"]');
          if (parent) {
            parent.remove();
          }
        });

        // Remove old BG fields
        oldBgFields.forEach(field => {
          const parent = field.closest('.col-md-4, .col-md-6, .col-12, [class*="col-"]');
          if (parent) {
            parent.remove();
          }
        });

        console.log(`  ✅ Cleanup completed`);

        // ═══════════════════════════════════════════════════════════════
        // STEP 6: Generate new Benefits template
        // ═══════════════════════════════════════════════════════════════
        console.log(`\n🏗️ STEP 6: Generating Benefits template...`);

        return new Promise((resolve, reject) => {
          if (typeof window.generateBatchTemplatesForCompany === 'function') {
            console.log(`  📞 Calling generateBatchTemplatesForCompany(${companyID}, ${targetRowIndex})`);

            window.generateBatchTemplatesForCompany(companyID, targetRowIndex, () => {
              console.log(`  ✅ Template generation completed`);
              resolve();
            });
          } else {
            reject(new Error('generateBatchTemplatesForCompany not found'));
          }
        });
      })
      .then(() => {
        // ═══════════════════════════════════════════════════════════════
        // STEP 7: Wait for Benefits fields to be ready
        // ═══════════════════════════════════════════════════════════════
        console.log(`\n⏳ STEP 7: Waiting for Benefits fields...`);

        return new Promise((resolve) => {
          setTimeout(() => {
            const newLeFields = document.querySelectorAll(`[id^="batchLe${targetRowIndex}_"]`);
            const newBgFields = document.querySelectorAll(`[id^="batchBg${targetRowIndex}_"]`);

            console.log(`  ✅ Found ${newLeFields.length} LE fields`);
            console.log(`  ✅ Found ${newBgFields.length} BG fields`);

            resolve();
          }, 500); // Wait 500ms for template to render
        });
      })
      .then(() => {
        // ═══════════════════════════════════════════════════════════════
        // STEP 8: Copy Benefits field values
        // ═══════════════════════════════════════════════════════════════
        console.log(`\n📋 STEP 8: Copying Benefits field values...`);

        let copiedCount = 0;
        let failedCount = 0;

        benefitsData.forEach((sourceData, baseName) => {
          // Construct target field ID
          const targetFieldId = `${sourceData.prefix}${targetRowIndex}_${baseName}`;
          const targetField = document.getElementById(targetFieldId);

          if (!targetField) {
            console.warn(`  ⚠️ Field not found: ${targetFieldId}`);
            failedCount++;
            return;
          }

          try {
            if (sourceData.type === 'select' && targetField.tagName === 'SELECT') {
              // ✅ Use value instead of selectedIndex
              if (sourceData.value) {
                // Check if option exists in target dropdown
                const optionExists = Array.from(targetField.options).some(opt => opt.value === sourceData.value);

                if (optionExists) {
                  targetField.value = sourceData.value;

                  if (window.jQuery && window.jQuery(targetField).data('select2')) {
                    window.jQuery(targetField).trigger('change.select2');
                  } else {
                    targetField.dispatchEvent(new Event('change', { bubbles: true }));
                  }

                  // 🏷️ Task 2.4: Mark as copied with tracking
                  const $targetField = window.jQuery ? window.jQuery(targetField) : null;
                  if ($targetField) {
                    $targetField.attr('data-source', 'copied');
                    $targetField.attr('data-copy-source', sourceRowIndex.toString());
                    $targetField.attr('data-user-override', 'false');
                    $targetField.attr('data-calculated-value', '');
                  }

                  copiedCount++;
                } else {
                  console.warn(`  ⚠️ ${targetFieldId}: Option "${sourceData.text}" (${sourceData.value}) not found`);
                  failedCount++;
                }
              }
            } else if (sourceData.type === 'input') {
              targetField.value = sourceData.value || '';
              targetField.dispatchEvent(new Event('input', { bubbles: true }));

              // 🏷️ Task 2.4: Mark as copied with tracking
              const $targetField = window.jQuery ? window.jQuery(targetField) : null;
              if ($targetField) {
                $targetField.attr('data-source', 'copied');
                $targetField.attr('data-copy-source', sourceRowIndex.toString());
                $targetField.attr('data-user-override', 'false');
                $targetField.attr('data-calculated-value', '');
              }

              copiedCount++;
            }
          } catch (err) {
            console.warn(`  ⚠️ Error copying ${targetFieldId}:`, err);
            failedCount++;
          }
        });

        console.log(`  ✅ Copied ${copiedCount}/${benefitsData.size} Benefits fields`);
        if (failedCount > 0) {
          console.warn(`  ⚠️ Failed: ${failedCount} fields`);
        }

        // 🏷️ Task 2.4: Log tracking info
        console.log(`  🏷️ All copied fields marked with data-source="copied" and data-copy-source="${sourceRowIndex}"`);

        // ═══════════════════════════════════════════════════════════════
        // STEP 9: Done!
        // ═══════════════════════════════════════════════════════════════
        console.log(`\n✅ STEP 9: Copy operation completed!`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`📊 SUMMARY:`);
        console.log(`  Source: ${sourceRowId}`);
        console.log(`  Target: ${targetRowId}`);
        console.log(`  Primary fields: ${primaryData.size}`);
        console.log(`  Benefits fields: ${benefitsData.size}`);
        console.log(`  Failed: ${failedCount}`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

        // Reset flags
        self.isCopyingRow = false;
        self.copySourceRowId = null;

        return Promise.resolve({
          success: true,
          targetRowId: targetRowId,
          sourceRowId: sourceRowId
        });
      })
      .catch(error => {
        console.error(`❌ Copy operation failed:`, error);

        // Reset flags
        self.isCopyingRow = false;
        self.copySourceRowId = null;

        return Promise.reject(error);
      });
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🗑️ DEPRECATED FUNCTIONS - NOT USED (Commented out for future reference)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // These functions are no longer used in Copy Row flow (SA Request 2025-10-18)
  // Reason: Using direct DOM copy instead of template regeneration approach
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * ⏳ [DEPRECATED] Wait for benefits fields to be available in DOM
   * @param {number} targetRowIndex - Target row index
   * @param {string} companyID - Company ID
   * @returns {Promise} Resolves when fields are ready
   */
  /*
  waitForBenefitsFields: function(targetRowIndex, companyID) {
    return new Promise((resolve, reject) => {
      const maxAttempts = 50; // 5 seconds max (50 * 100ms)
      let attempts = 0;

      const checkFields = () => {
        attempts++;

        // Check if benefits fields exist for this row
        const leFields = document.querySelectorAll(`input[id^="batchLe${targetRowIndex}_"], select[id^="batchLe${targetRowIndex}_"]`);
        const bgFields = document.querySelectorAll(`input[id^="batchBg${targetRowIndex}_"], select[id^="batchBg${targetRowIndex}_"]`);

        const totalFields = leFields.length + bgFields.length;

        console.log(`  ⏳ Attempt ${attempts}/${maxAttempts}: ${totalFields} benefits fields found`);

        if (totalFields > 0) {
          // Fields are ready!
          resolve({ leFields: leFields.length, bgFields: bgFields.length, total: totalFields });
        } else if (attempts >= maxAttempts) {
          // Timeout
          reject(new Error(`Benefits fields not found after ${maxAttempts} attempts`));
        } else {
          // Try again
          setTimeout(checkFields, 100);
        }
      };

      // Start checking
      checkFields();
    });
  },
  */

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🗑️ LEGACY FUNCTION - REMOVED
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Old copyRowData() has been removed
  // All copy logic is now integrated into copyBatchRow()
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Clear row data
  clearBatchRow: function (rowId) {
    const rowElement = document.querySelector(`[data-batch-row-id="${rowId}"]`);
    if (!rowElement) return;

    // Use generic modal instead of native confirm()
    this.showConfirmModal({
      title: 'ยืนยันการล้างข้อมูล',
      message: 'ต้องการล้างข้อมูลในแถวนี้หรือไม่?\n\nข้อมูลทั้งหมดในแถวจะถูกลบ',
      iconType: 'warning',
      confirmText: 'ล้างข้อมูล',
      cancelText: 'ยกเลิก',
      onConfirm: () => {
        const fields = rowElement.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
          if (field.type !== 'hidden') {
            field.value = '';
          }
        });

        // Clear validation messages
        const validationContainer = rowElement.querySelector('.batch-row-validation-messages');
        if (validationContainer) {
          validationContainer.innerHTML = '';
        }

        // ✅ No validation needed after clearing row (empty row doesn't need validation)
        console.log(`🧹 Row ${rowId} cleared successfully`);
      },
      onCancel: () => {
        console.log('💭 User cancelled clear operation');
      }
    });
  },

  // Cancel batch entry
  cancelBatchEntry: function () {
    if (this.activeRows.size > 0) {
      // Use generic modal instead of native confirm()
      this.showConfirmModal({
        title: 'ยืนยันการยกเลิก',
        message: 'ต้องการยกเลิกการบันทึกทั้งหมดหรือไม่?\n\nข้อมูลที่กรอกทั้งหมดจะถูกลบ',
        iconType: 'warning',
        confirmText: 'ยกเลิก',
        cancelText: 'กลับไป',
        onConfirm: () => {
          this.resetBatchEntryData();
          console.log('🚫 Batch entry cancelled by user');
        },
        onCancel: () => {
          console.log('💭 User chose to continue editing');
        }
      });
      return;
    }

    this.resetBatchEntryData();
  },

  // ───────────────────────────────────────────────────────────────────
  // 🔄 DATA RESET & CLEANUP
  // ───────────────────────────────────────────────────────────────────

  // Reset batch entry for search (no confirmation needed)
  resetBatchEntryForSearch: function () {
    if (this.activeRows.size === 0) {
      console.log('ℹ️ No active batch entry rows to reset for search');
      return;
    }

    console.log('🔄 Auto-resetting batch entry for search (no confirmation needed)');
    this.resetBatchEntryData();
    console.log('✅ Batch entry reset for search completed');
  },

  // Internal method to reset batch entry data (shared by cancel and search reset)
  resetBatchEntryData: function () {
    // Clear all rows
    this.activeRows.clear();
    const accordion = document.getElementById('batchEntryAccordion');
    if (accordion) {
      accordion.innerHTML = '';
    }

    // Show no rows message
    const noRowsMessage = document.getElementById('noBatchRowsMessage');
    if (noRowsMessage) {
      noRowsMessage.style.display = 'block';
    }

    // Reset validation messages
    const validationMessages = document.getElementById('batchValidationMessages');
    if (validationMessages) {
      validationMessages.innerHTML = '';
      console.log('🧹 Cleared batch validation messages');
    }

    // Reset counter
    this.nextRowId = 1;
    this.updateRowCounter();

    // Hide collapse
    const collapseElement = document.getElementById('batchEntryCollapse');
    if (collapseElement) {
      new coreui.Collapse(collapseElement).hide();
    }
  },

  // ───────────────────────────────────────────────────────────────────
  // 💾 MESSAGE PRESERVATION UTILITIES (Option 3)
  // ───────────────────────────────────────────────────────────────────

  // 🆕 Helper function to preserve individual validation messages during batch operations
  preserveValidationMessages: function (rowId) {
    try {
      const rowElement = document.querySelector(`[data-batch-row-id="${rowId}"]`);
      if (!rowElement) return null;

      const validationContainer = rowElement.querySelector('.batch-row-validation-messages');
      if (validationContainer && validationContainer.innerHTML.trim()) {
        console.log(`💾 Preserving validation messages for row ${rowId}`);
        return {
          html: validationContainer.innerHTML,
          timestamp: Date.now(),
          rowId: rowId
        };
      }
      return null;
    } catch (error) {
      console.error(`❌ Error preserving validation messages for row ${rowId}:`, error);
      return null;
    }
  },

  // 🆕 Helper function to restore preserved validation messages
  restoreValidationMessages: function (rowId, preservedData, delay = 20) {
    if (!preservedData || !preservedData.html) return;

    setTimeout(() => {
      try {
        const rowElement = document.querySelector(`[data-batch-row-id="${rowId}"]`);
        if (rowElement) {
          const validationContainer = rowElement.querySelector('.batch-row-validation-messages');
          if (validationContainer) {
            // Restore the preserved individual field messages
            validationContainer.innerHTML = preservedData.html;
            console.log(`🔄 Restored validation messages for row ${rowId} (preserved at ${new Date(preservedData.timestamp).toLocaleTimeString()})`);
          }
        }
      } catch (error) {
        console.error(`❌ Error restoring validation messages for row ${rowId}:`, error);
      }
    }, delay);
  },

  // 🆕 Enhanced validation with message preservation for individual field updates
  validateRowWithPreservation: function (rowId, skipPreservation = false) {
    // Store current validation state if not skipping
    const preserved = skipPreservation ? null : this.preserveValidationMessages(rowId);

    // Run normal validation
    const isValid = this.validateRow(rowId);

    // Restore preserved messages if they existed
    if (preserved) {
      this.restoreValidationMessages(rowId, preserved, 25);
    }

    return isValid;
  },

  // ═══════════════════════════════════════════════════════════════════════════════════════
  // 💾 4. DATA PERSISTENCE & SAVE OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════════════════

  // ───────────────────────────────────────────────────────────────────
  // � BATCH DATA SAVING
  // ───────────────────────────────────────────────────────────────────

  // Enhanced Save batch entry
  saveBatchEntry: function () {
    console.log('💾 Saving batch entry using enhanced validation...');

    if (this.activeRows.size === 0) {
      console.warn('⚠️ No batch rows to save');
      return;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 STEP 1: Check if validation has been performed (Modal Approach)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const hasValidationResults = document.querySelector('#batchValidationMessages .validation-summary-global');

    if (!hasValidationResults) {
      this.showPreValidationModal(); // ⚠️ Show Warning Modal
      return; // Wait for user response
    }

    // Continue to validation if already validated
    this.proceedWithSave();
  },

  // ═══════════════════════════════════════════════════════════════════════════════════════
  // 🎨 MODAL MANAGEMENT UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════════════════

  /**
   * 🎨 Update Modal Appearance (Icon + Text Color)
   * @param {HTMLElement} modalElement - Modal element
   * @param {string} type - Type: 'save', 'warning', 'error', 'success'
   */
  updateModalAppearance: function (modalElement, type) {
    const iconElement = modalElement.querySelector('.nav-icon use');
    const iconContainer = modalElement.querySelector('.nav-icon');
    const modalLabel = modalElement.querySelector('#confirmSaveAllModalLabel');

    const appearances = {
      save: {
        icon: '#cil-save',
        iconClass: 'nav-icon nav-icon-xl text-success',
        textColor: '#2eb85c' // Green
      },
      warning: {
        icon: '#cil-warning',
        iconClass: 'nav-icon nav-icon-xl text-warning',
        textColor: '#f9b115' // Yellow
      },
      error: {
        icon: '#cil-x-circle',
        iconClass: 'nav-icon nav-icon-xl text-danger',
        textColor: '#e55353' // Red
      },
      success: {
        icon: '#cil-check-circle',
        iconClass: 'nav-icon nav-icon-xl text-success',
        textColor: '#2eb85c' // Green
      }
    };

    const appearance = appearances[type];
    // Get SVG base path (supports IIS virtual directory)
    const svgBasePath = (window.AppConfig && window.AppConfig.baseUrl) ? window.AppConfig.baseUrl + 'lib/adcoreui/icons/svg/free.svg' : './lib/adcoreui/icons/svg/free.svg';
    if (appearance && iconElement && iconContainer && modalLabel) {
      iconElement.setAttribute('xlink:href', `${svgBasePath}${appearance.icon}`);
      iconContainer.className = appearance.iconClass;
      modalLabel.style.color = appearance.textColor;
    }
  },

  /**
   * 1️⃣ Show Pre-Validation Modal (Warning Style)
   */
  showPreValidationModal: function () {
    const modalElement = document.getElementById('confirmSaveAllModal');
    const modal = new bootstrap.Modal(modalElement);
    const modalLabel = modalElement.querySelector('#confirmSaveAllModalLabel');
    const modalText = modalElement.querySelector('.text-muted');

    // Update appearance to WARNING
    this.updateModalAppearance(modalElement, 'warning');

    //modalLabel.textContent = '⚠️ ยังไม่ได้ตรวจสอบความถูกต้อง';
    modalLabel.textContent = 'ยังไม่ได้ตรวจสอบความถูกต้อง';
    modalText.textContent = 'แนะนำให้กดปุ่ม "ตรวจสอบทั้งหมด" ก่อนบันทึก\n\nต้องการดำเนินการตรวจสอบและบันทึกหรือไม่?';

    // Setup handlers
    this.setupModalHandlers(
      modal,
      modalElement,
      () => this.proceedWithSave(), // On Confirm
      () => this.highlightValidateButton() // On Cancel
    );

    modal.show();
  },

  /**
   * 2️⃣ Show Error Modal (Error Style)
   */
  showErrorModal: function (validationResults) {
    const modalElement = document.getElementById('confirmSaveAllModal');
    const modal = new bootstrap.Modal(modalElement);
    const modalLabel = modalElement.querySelector('#confirmSaveAllModalLabel');
    const modalText = modalElement.querySelector('.text-muted');
    const cancelBtn = document.getElementById('cancelSaveAllBtn');
    const confirmBtn = document.getElementById('confirmSaveAllBtn');

    // Update appearance to ERROR
    this.updateModalAppearance(modalElement, 'error');

    const errorMessage = `พบข้อผิดพลาด ${validationResults.summary.totalErrors} รายการใน ${validationResults.summary.invalidRows.length} แถว\n\nกรุณาแก้ไขข้อผิดพลาดก่อนบันทึกข้อมูล`;

    //modalLabel.textContent = '❌ พบข้อผิดพลาด';
    modalLabel.textContent = 'พบข้อผิดพลาด';
    modalText.textContent = errorMessage;

    // Hide Cancel button, show only OK
    cancelBtn.classList.add('d-none');
    confirmBtn.textContent = 'OK';

    // Setup handler (only Confirm button)
    this.setupModalHandlers(modal, modalElement, () => {
      cancelBtn.classList.remove('d-none');
      confirmBtn.textContent = 'Save';
      this.scrollToValidationSummary();
    });

    modal.show();
  },

  /**
   * 3️⃣ Show Warning Modal (Warning Style)
   */
  showWarningModal: function (validationResults) {
    const modalElement = document.getElementById('confirmSaveAllModal');
    const modal = new bootstrap.Modal(modalElement);
    const modalLabel = modalElement.querySelector('#confirmSaveAllModalLabel');
    const modalText = modalElement.querySelector('.text-muted');

    // Update appearance to WARNING
    this.updateModalAppearance(modalElement, 'warning');

    const warningMessage = `พบคำเตือน ${validationResults.summary.totalWarnings} รายการใน ${validationResults.summary.warningRows.length} แถว\n\nคำเตือนเหล่านี้ไม่ขัดขวางการบันทึก แต่ควรตรวจสอบ\n\nต้องการบันทึกข้อมูลต่อหรือไม่?`;

    //modalLabel.textContent = '⚠️ พบคำเตือน';
    modalLabel.textContent = 'พบคำเตือน';
    modalText.textContent = warningMessage;

    // Setup handlers (both Cancel and Confirm)
    this.setupModalHandlers(
      modal,
      modalElement,
      () => this.proceedWithDataCollection(validationResults), // On Confirm
      () => console.log('💭 User cancelled save due to warnings') // On Cancel
    );

    modal.show();
  },

  /**
   * 4️⃣ Show Success Modal (Success Style)
   * Used for calculation success notifications
   *
   * @param {Array} successResults - Array of success objects: [{rowId, message}]
   */
  showSuccessModal: function (successResults) {
    const modalElement = document.getElementById('confirmSaveAllModal');
    const modal = new bootstrap.Modal(modalElement);
    const modalLabel = modalElement.querySelector('#confirmSaveAllModalLabel');
    const modalText = modalElement.querySelector('.text-muted');
    const confirmBtn = modalElement.querySelector('.btn-primary');
    const cancelBtn = modalElement.querySelector('.btn-secondary');

    // Update appearance to SUCCESS
    this.updateModalAppearance(modalElement, 'success');

    // Build success message
    let successMessage = '';
    if (successResults && successResults.length > 0) {
      if (successResults.length === 1) {
        // Single row success
        successMessage = successResults[0].message;
      } else {
        // Multiple rows success
        successMessage = `✅ ดำเนินการสำเร็จ ${successResults.length} แถว`;
      }
    } else {
      successMessage = '✅ ดำเนินการสำเร็จ';
    }

    modalLabel.textContent = 'ดำเนินการสำเร็จ';
    modalText.textContent = successMessage;

    // Hide Cancel button (only show OK)
    cancelBtn.classList.add('d-none');
    confirmBtn.textContent = 'OK';

    // Setup handler (only Confirm button)
    this.setupModalHandlers(modal, modalElement, () => {
      cancelBtn.classList.remove('d-none');
      confirmBtn.textContent = 'Save';
    });

    modal.show();
  },

  /**
   * 🔧 Setup Modal Event Handlers with Cleanup
   */
  setupModalHandlers: function (modal, modalElement, onConfirm, onCancel = null) {
    const confirmBtn = document.getElementById('confirmSaveAllBtn');
    const cancelBtn = document.getElementById('cancelSaveAllBtn');

    const handleConfirm = () => {
      modal.hide();
      if (onConfirm) onConfirm();
      cleanup();
    };

    const handleCancel = () => {
      modal.hide();
      if (onCancel) onCancel();
      cleanup();
    };

    const cleanup = () => {
      confirmBtn.removeEventListener('click', handleConfirm);
      if (onCancel) {
        cancelBtn.removeEventListener('click', handleCancel);
      }
    };

    confirmBtn.addEventListener('click', handleConfirm);
    if (onCancel) {
      cancelBtn.addEventListener('click', handleCancel);
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════════════════
  // 🎨 GENERIC MODAL SYSTEM (Reusable Confirmation Modal)
  // ═══════════════════════════════════════════════════════════════════════════════════════

  /**
   * 🎨 Update Generic Action Modal Appearance (Icon + Text Color)
   * @param {HTMLElement} modalElement - Modal element
   * @param {string} iconType - Icon type: 'save', 'warning', 'error', 'trash', 'question', 'success'
   */
  updateActionModalAppearance: function (modalElement, iconType) {
    const iconElement = modalElement.querySelector('.nav-icon use');
    const iconContainer = modalElement.querySelector('.nav-icon');
    const modalLabel = modalElement.querySelector('#confirmActionModalLabel');

    const appearances = {
      save: {
        icon: '#cil-save',
        iconClass: 'nav-icon nav-icon-xl text-success',
        textColor: '#2eb85c' // Green
      },
      warning: {
        icon: '#cil-warning',
        iconClass: 'nav-icon nav-icon-xl text-warning',
        textColor: '#f9b115' // Yellow
      },
      error: {
        icon: '#cil-x-circle',
        iconClass: 'nav-icon nav-icon-xl text-danger',
        textColor: '#e55353' // Red
      },
      trash: {
        icon: '#cil-trash',
        iconClass: 'nav-icon nav-icon-xl text-danger',
        textColor: '#e55353' // Red
      },
      question: {
        icon: '#cil-question-circle',
        iconClass: 'nav-icon nav-icon-xl text-secondary',
        textColor: '#768192' // Secondary
      },
      success: {
        icon: '#cil-check-circle',
        iconClass: 'nav-icon nav-icon-xl text-success',
        textColor: '#2eb85c' // Green
      }
    };

    const appearance = appearances[iconType] || appearances.question;
    // Get SVG base path (supports IIS virtual directory)
    const svgBasePath2 = (window.AppConfig && window.AppConfig.baseUrl) ? window.AppConfig.baseUrl + 'lib/adcoreui/icons/svg/free.svg' : './lib/adcoreui/icons/svg/free.svg';
    if (iconElement && iconContainer && modalLabel) {
      iconElement.setAttribute('xlink:href', `${svgBasePath2}${appearance.icon}`);
      iconContainer.className = appearance.iconClass;
      modalLabel.style.color = appearance.textColor;
    }
  },

  /**
   * 🔧 Setup Generic Action Modal Event Handlers with Cleanup
   * @param {bootstrap.Modal} modal - Bootstrap Modal instance
   * @param {HTMLElement} modalElement - Modal DOM element
   * @param {Function} onConfirm - Callback when confirmed
   * @param {Function|null} onCancel - Callback when cancelled (optional)
   */
  setupActionModalHandlers: function (modal, modalElement, onConfirm, onCancel = null) {
    const confirmBtn = document.getElementById('confirmActionBtn');
    const cancelBtn = document.getElementById('cancelActionBtn');

    const handleConfirm = () => {
      modal.hide();
      if (onConfirm) onConfirm();
      cleanup();
    };

    const handleCancel = () => {
      modal.hide();
      if (onCancel) onCancel();
      cleanup();
    };

    const cleanup = () => {
      confirmBtn.removeEventListener('click', handleConfirm);
      if (onCancel) {
        cancelBtn.removeEventListener('click', handleCancel);
      }
    };

    confirmBtn.addEventListener('click', handleConfirm);
    if (onCancel) {
      cancelBtn.addEventListener('click', handleCancel);
    }
  },

  /**
   * 💬 Show Generic Confirmation Modal
   * @param {Object} options - Modal configuration
   * @param {string} options.title - Modal title
   * @param {string} options.message - Modal message
   * @param {string} options.iconType - Icon type: 'save', 'warning', 'error', 'trash', 'question', 'success'
   * @param {string} [options.confirmText='Confirm'] - Confirm button text
   * @param {string} [options.cancelText='Cancel'] - Cancel button text
   * @param {Function} options.onConfirm - Callback when confirmed
   * @param {Function} [options.onCancel=null] - Callback when cancelled (optional)
   * @param {boolean} [options.showCancel=true] - Show cancel button
   */
  showConfirmModal: function (options) {
    const {
      title,
      message,
      iconType = 'question',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      onConfirm,
      onCancel = null,
      showCancel = true
    } = options;

    const modalElement = document.getElementById('confirmActionModal');
    const modal = new bootstrap.Modal(modalElement);
    const modalLabel = modalElement.querySelector('#confirmActionModalLabel');
    const modalMessage = modalElement.querySelector('#confirmActionModalMessage');
    const confirmBtn = document.getElementById('confirmActionBtn');
    const cancelBtn = document.getElementById('cancelActionBtn');

    // Update appearance (icon + color)
    this.updateActionModalAppearance(modalElement, iconType);

    // Update content
    modalLabel.textContent = title;
    modalMessage.textContent = message;
    confirmBtn.textContent = confirmText;
    cancelBtn.textContent = cancelText;

    // Show/hide cancel button
    if (showCancel) {
      cancelBtn.classList.remove('d-none');
    } else {
      cancelBtn.classList.add('d-none');
    }

    // Setup handlers
    this.setupActionModalHandlers(modal, modalElement, onConfirm, onCancel);

    // Show modal
    modal.show();
  },

  /**
   * 🔄 Proceed with Save (after pre-validation check)
   */
  proceedWithSave: function () {
    console.log('🔄 Auto-validating before save...');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 STEP 2: Run comprehensive validation
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const validationResults = this.validateAllRows();

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 STEP 3: Handle Hard Errors (BLOCKING)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (!validationResults.isAllValid) {
      console.warn(`❌ Validation failed: ${validationResults.summary.totalErrors} errors`);
      this.showErrorModal(validationResults); // ❌ Show Error Modal
      return; // BLOCKED
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 STEP 4: Handle Soft Warnings (CONFIRM)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (validationResults.summary.totalWarnings > 0) {
      console.log(`⚠️ Found ${validationResults.summary.totalWarnings} warnings`);
      this.showWarningModal(validationResults); // ⚠️ Show Warning Modal
      return; // Wait for user response
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 STEP 5: Proceed with data collection and save
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    this.proceedWithDataCollection(validationResults);
  },

  /**
   * 📦 Proceed with Data Collection and Save (UPDATED - API Integration)
   * แทนที่ setTimeout simulation ด้วย API call จริง
   *
   * SA Answers Applied:
   * - Q1: All or nothing - แสดงผลตาม response (success ทั้งหมด หรือ failed ทั้งหมด)
   * - Q5: Modal + auto-close - แสดง success modal แล้วปิดอัตโนมัติ
   * - Q6: Pre-check duplicate - loading message บอกว่ากำลังตรวจสอบ
   */
  proceedWithDataCollection: async function (validationResults) {
    console.log('📦 Collecting data from all valid rows...');

    // Collect all data from valid rows (ASYNC)
    const batchData = [];

    // Process rows sequentially to avoid race conditions
    for (const [rowId, rowData] of this.activeRows) {
      const data = await this.collectRowData(rowId);
      if (data) {
        batchData.push(data);
      }
    }

    if (batchData.length === 0) {
      console.error('❌ No valid data collected for saving');
      return;
    }

    // Show preparing message
    const container = document.getElementById('batchValidationMessages');
    if (container) {
      const preparingDiv = document.createElement('div');
      preparingDiv.className = 'alert alert-info mt-2';
      preparingDiv.id = 'preparing-save-message';
      preparingDiv.innerHTML = `
        <h6 class="alert-heading"><i class="fas fa-check-circle me-2"></i>Ready to Save!</h6>
        <p class="mb-2">All validation passed. Preparing to save ${batchData.length} rows...</p>
        ${validationResults.summary.totalWarnings > 0 ?
          `<small class="text-muted">Note: ${validationResults.summary.totalWarnings} warnings found but ignored.</small>` : ''}
      `;
      container.appendChild(preparingDiv);
    }

    console.log('📊 Enhanced batch data to save:', {
      totalRows: batchData.length,
      validationSummary: validationResults.summary,
      data: batchData
    });

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 CALL REAL API (Replaced setTimeout simulation)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    try {
      // Q6: Show loading message with duplicate check info
      const loadingMessage = batchData.length > 20
        ? 'กำลังตรวจสอบข้อมูลซ้ำและบันทึก... (อาจใช้เวลานาน)'
        : 'กำลังตรวจสอบข้อมูลซ้ำและบันทึก...';

      // Show loading modal
      this.showConfirmModal({
        title: 'กำลังดำเนินการ',
        message: loadingMessage,
        iconType: 'info',
        showConfirmButton: false,
        showCancel: false
      });

      // Get current user (TODO: from JWT token when ready)
      const currentUser = window.getCurrentUser ? window.getCurrentUser() : 'DevUser';

      // Call API
      const result = await window.saveBatchBudgetData(batchData, currentUser);

      console.log('✅ API Response received:', result);

      // Remove preparing message
      const preparingMsg = document.getElementById('preparing-save-message');
      if (preparingMsg) preparingMsg.remove();

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 📊 Handle Response (Q1: All or Nothing)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      if (result.success && result.totalSuccess === result.totalSubmitted) {
        // ✅ SUCCESS - All rows saved (Q1: All or nothing success case)
        this.showConfirmModal({
          title: 'บันทึกสำเร็จ',
          message: `บันทึกข้อมูลสำเร็จทั้งหมด ${result.totalSuccess} รายการ!\n\nข้อมูลได้รับการตรวจสอบและบันทึกเรียบร้อยแล้ว`,
          iconType: 'success',
          confirmText: 'ตกลง',
          showCancel: false,
          onConfirm: () => {
            this.resetBatchEntryData(); // Clear and close
            console.log(`✅ Successfully saved ${result.totalSuccess} budget rows`);

            // 🔧 FIX: Remove any stuck backdrops after modal closes
            setTimeout(() => {
              document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
              document.body.classList.remove('modal-open');
              document.body.style.overflow = '';
              document.body.style.paddingRight = '';
            }, 100);
          }
        });

        // Q5: Auto-close after 3 seconds
        setTimeout(() => {
          const modal = document.getElementById('confirmActionModal');
          if (modal) {
            const modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) {
              modalInstance.hide();

              // 🔧 FIX: Remove backdrop after auto-close
              setTimeout(() => {
                document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
              }, 300);
            }
          }
          this.resetBatchEntryData();
          location.reload();
        }, 3000);

      } else {
        // ❌ FAILED - Show errors (Q1: All or nothing failed case)
        console.error('❌ Batch save failed:', result);

        // Will be implemented in Phase 3.3
        if (window.showBatchErrorDetails) {
          window.showBatchErrorDetails(result);
        } else {
          // Temporary simple error display
          let errorMessage = `ไม่สามารถบันทึกข้อมูลได้\n\n`;
          errorMessage += `จำนวนทั้งหมด: ${result.totalSubmitted} รายการ\n`;
          errorMessage += `❌ ล้มเหลว: ${result.totalFailed} รายการ\n\n`;

          if (result.failedSaves && result.failedSaves.length > 0) {
            errorMessage += `รายละเอียดข้อผิดพลาด:\n`;
            result.failedSaves.forEach((error, index) => {
              errorMessage += `${index + 1}. แถวที่ ${error.rowIndex + 1}: ${error.errorMessage}\n`;
            });
          }

          this.showConfirmModal({
            title: 'เกิดข้อผิดพลาด',
            message: errorMessage,
            iconType: 'error',
            confirmText: 'ตกลง',
            showCancel: false
          });
        }
      }

    } catch (error) {
      // ❌ Network or API Error
      console.error('❌ Error calling API:', error);

      // Remove preparing message
      const preparingMsg = document.getElementById('preparing-save-message');
      if (preparingMsg) preparingMsg.remove();

      this.showConfirmModal({
        title: 'เกิดข้อผิดพลาด',
        message: `ไม่สามารถเชื่อมต่อกับ API ได้\n\nError: ${error.message}\n\nกรุณาตรวจสอบการเชื่อมต่อและลองอีกครั้ง`,
        iconType: 'error',
        confirmText: 'ตกลง',
        showCancel: false
      });
    }
  },

  /**
   * 🎯 Helper: Highlight Validate Button
   */
  highlightValidateButton: function () {
    const validateBtn = document.getElementById('validateAllBtn');
    if (validateBtn) {
      validateBtn.classList.add('btn-pulse');
      setTimeout(() => validateBtn.classList.remove('btn-pulse'), 3000);
    }
  },

  /**
   * 📜 Helper: Scroll to Validation Summary
   */
  scrollToValidationSummary: function () {
    const container = document.getElementById('batchValidationMessages');
    if (container) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  },

  // Collect data from a specific row
  /**
   * 📦 Collect Row Data for API Submission (ASYNC)
   * แปลง form field names เป็น PascalCase ตาม DTO requirements
   * และ convert data types ให้ถูกต้อง (string → number, date)
   *
   * Support both prefixed and non-prefixed field names:
   * - Prefixed: "batch-row-1_empCode" → "EmpCode"
   * - Non-prefixed: "company" → "CompanyId"
   *
   * 🆕 BJC BU Code Integration:
   * - Pre-fetches BU Code from API for BJC company (companyId='1')
   * - Caches result for use in transform function
   */
  collectRowData: async function (rowId) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📦 [collectRowData] Starting collection for Row: ${rowId}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    const rowElement = document.querySelector(`[data-batch-row-id="${rowId}"]`);
    if (!rowElement) {
      console.error(`❌ Row element not found for: ${rowId}`);
      return null;
    }

    const data = {};
    const fields = rowElement.querySelectorAll('input, select, textarea');
    console.log(`📊 Total fields found: ${fields.length}`);

    // 🔍 DEBUG: Log all field names/IDs to find budgetYear
    console.log(`\n🔍 [DEBUG] All field names/IDs found in row:`);
    fields.forEach((field, index) => {
      const fieldName = field.name || field.id || '(no name/id)';
      const fieldClass = field.className || '(no class)';
      console.log(`  ${index + 1}. name="${fieldName}" | class="${fieldClass}"`);
    });
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🏢 STEP 3: LOAD COMPANY-SPECIFIC BENEFITS MAPPING (MOVED FROM STEP 6)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // SA: Load mapping ก่อน Field Configuration เพื่อให้พร้อมใช้งาน
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // 🔍 Detect Company from row
    const companyField = rowElement.querySelector('.batch-company');
    const companyId = companyField?.value;
    const companyText = companyField?.options?.[companyField.selectedIndex]?.text || '';

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🏢 STEP 3: Loading company-specific benefits mapping`);
    console.log(`Company detected: ${companyText} (ID: ${companyId})`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    let benefitsMapping = {};

    if (companyId === '1') {
      // BJC Company
      benefitsMapping = window.BJC_FIELD_MAPPING || {};
      console.log(`✅ Using BJC Field Mapping (${Object.keys(benefitsMapping).length} fields)`);
    } else if (companyId === '2') {
      // BIGC Company
      benefitsMapping = window.BIGC_FIELD_MAPPING || {};
      console.log(`✅ Using BIGC Field Mapping (${Object.keys(benefitsMapping).length} fields)`);
    } else {
      console.warn(`⚠️ Unknown company ID: ${companyId} - No benefits mapping loaded`);
    }

    console.log(`✅ Mapping loaded: ${Object.keys(benefitsMapping).length} field definitions\n`);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🆕 STEP 3.5: PRE-FETCH BU CODE FOR BJC (CompanyId='1')
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    let buCodeCache = null;

    if (companyId === '1') {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`🔌 STEP 3.5: Pre-fetching BU Code for BJC`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

      // Get cobu value from field
      const cobuField = rowElement.querySelector('[name*="cobu"]');
      const cobuValue = cobuField?.value;

      if (cobuValue) {
        console.log(`   CO/BU Value: ${cobuValue}`);

        try {
          // 🔌 Call API function from budget.plan.api.js
          buCodeCache = await window.fetchBuCodeFromAPI(companyId, cobuValue);

          if (buCodeCache) {
            console.log(`   ✅ BU Code cached: "${buCodeCache}"`);
          } else {
            console.warn(`   ⚠️ API returned no BU Code, will use dropdown text as fallback`);
          }
        } catch (error) {
          console.error(`   ❌ Failed to fetch BU Code:`, error);
          console.warn(`   ⚠️ Will use dropdown text as fallback`);
        }
      } else {
        console.warn(`   ⚠️ CO/BU field is empty, skipping API call`);
      }

      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    }    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 4: FIELD CONFIGURATION (Basic Fields Only)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Note: Benefits fields will be auto-generated in Step 6 from benefitsMapping
    //
    // Properties:
    // - dtoName: ชื่อ property ใน DTO (C#)
    // - dataType: 'int'|'decimal'|'string'|'boolean'|'date'
    // - valueSource: 'value'|'text'|'selectedIndex'
    // - maxLength: จำกัดความยาว (auto truncate)
    // - transform: function(value, field) => transformedValue
    // - derivedFields: Array ของ fields ที่ต้องส่งเพิ่มเติมจาก field เดียวกัน
    //   [{ dtoName, dataType, valueSource, transform }]
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`⚙️ STEP 4: Creating basic field configurations`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    const fieldConfigs = {
      // ─────────────────────────────────────────────────────────────────────
      // BASIC FIELDS
      // ─────────────────────────────────────────────────────────────────────
      'company': {
        dtoName: 'companyId',
        dataType: 'int',
        valueSource: 'value',
        // 🎯 Derived Fields: ส่งค่าเพิ่มเติมจาก field เดียวกัน
        derivedFields: [
          {
            dtoName: 'companyCode',
            dataType: 'string',
            valueSource: 'text' // ดึงจาก dropdown text (e.g., "BIGC")
          }
        ]
      },
      'year': {
        dtoName: 'budgetYear',
        dataType: 'int',
        valueSource: 'value',  // ✅ เปลี่ยนจาก 'text' เป็น 'value'
        derivedFields: [
          {
            dtoName: 'budgetYearLe',
            dataType: 'string',
            valueSource: 'value',  // ✅ เปลี่ยนจาก 'text' เป็น 'value'
            transform: (val) => {
              // budgetYearLe = budgetYear - 1 (ปีก่อนหน้า)
              const currentYear = parseInt(val);
              return isNaN(currentYear) ? null : String(currentYear - 1);
            }
          }
        ]
      },
      'yosCurrYear': {
        dtoName: 'yosCurrYear',
        dataType: 'int',
        valueSource: 'value',
        transform: () => 0  // ✅ Fixed value = 0 (YOS for LE year)
      },
      'yosNextYear': {
        dtoName: 'yosNextYear',
        dataType: 'int',
        valueSource: 'value',
        transform: () => 1  // ✅ Fixed value = 1 (YOS for Budget year)
      },
      'empStatus': {
        dtoName: 'empStatus',
        dataType: 'string',
        valueSource: 'text',
        derivedFields: [
          {
            dtoName: 'empCode',
            dataType: 'string',
            valueSource: 'value',
            transform: () => {
              // ✅ Use centralized secure function from budget.plan.core.js
              if (typeof generateEmployeeCode === 'function') {
                return generateEmployeeCode(); // Crypto-random + collision detection
              }

              // Fallback (if core.js not loaded)
              return `e${Date.now().toString(36)}`;
            }
          },
        ]
      },
      'EmpType': {
        dtoName: 'empTypeCode',
        dataType: 'string',
        valueSource: 'value'
      },
      'costCenterCode': {  // ✅ แก้จาก 'costCenter' ให้ตรงกับ name="costCenterCode"
        dtoName: 'costCenterCode',
        dataType: 'string',
        valueSource: 'value',
        derivedFields: [
          {
            dtoName: 'costCenterName',
            dataType: 'string',
            valueSource: 'text',
            transform: (val) => {
              if (!val || val === '') return null;
              // Extract text before parentheses (e.g., "Driver (8H3)" → "Driver")
              const match = val.match(/^([^(]+)/);
              return match ? match[1].trim() : val;
            }
          }
        ]
      },
      'cobu': {
        dtoName: 'cobu',
        dataType: 'string',
        valueSource: 'value',
        derivedFields: [
          {
            dtoName: 'bu',
            dataType: 'string',
            valueSource: 'text',
            transform: (val, field) => {
              // ✅ BJC (CompanyId='1') uses API result
              if (companyId === '1') {
                if (buCodeCache) {
                  console.log(`  🔌 Using API BU Code: "${buCodeCache}"`);
                  return buCodeCache;
                } else {
                  console.warn(`  ⚠️ No cached BU Code, using dropdown text: "${val}"`);
                  return val;
                }
              }

              // ✅ BIGC (CompanyId='2') always uses 'RB'
              if (companyId === '2') {
                return 'RB';
              }

              // ✅ Other companies: use text from dropdown
              return val;
            }
          }
        ]
      },
      'division': {
        dtoName: 'division',
        dataType: 'string',
        valueSource: 'value'
      },
      'department': {
        dtoName: 'department',
        dataType: 'string',
        valueSource: 'value'
      },
      'section': {
        dtoName: 'section',
        dataType: 'string',
        valueSource: 'value'
      },
      'compstore': {
        dtoName: 'storeName',
        dataType: 'string',
        valueSource: 'value'
      },
      'position': {
        dtoName: 'positionCode',
        dataType: 'string',
        valueSource: 'value',
        derivedFields: [
          {
            dtoName: 'positionName',
            dataType: 'string',
            valueSource: 'text',
            transform: (val) => {
              if (!val || val === '') return null;
              // Extract text before parentheses (e.g., "Driver (8H3)" → "Driver")
              const match = val.match(/^([^(]+)/);
              return match ? match[1].trim() : val;
            }
          }
        ]
      },
      'jobBand': {
        dtoName: 'jobBand',
        dataType: 'string',
        valueSource: 'value'
      },
      'newHcCode': {
        dtoName: 'NewHcCode',
        dataType: 'string',
        valueSource: 'value'
      },
      'newPeriod': {
        dtoName: 'NewVacPeriod',
        dataType: 'string',
        valueSource: 'value'
      },
      'newVacLe': {  // ✅ TEST: Fixed from 'newLeperiod' to match HTML name="NewVacLe"
        dtoName: 'NewVacLe',
        dataType: 'string',
        valueSource: 'value'
      },
      'leOfMonth': {
        dtoName: 'LeOfMonth',
        dataType: 'int',
        valueSource: 'value'
      },
      'noOfMonth': {
        dtoName: 'NoOfMonth',
        dataType: 'int',
        valueSource: 'value'
      },
      'PlanCostCenter': {  // ✅ แก้จาก 'costCenterPlan' ให้ตรงกับ name="PlanCostCenter"
        dtoName: 'costCenterPlan',
        dataType: 'string',
        valueSource: 'value'
      },
      'SalaryStructure': {  // ✅ แก้จาก 'salaryStructure' ให้ตรงกับ name="SalaryStructure"
        dtoName: 'salaryStructure',
        dataType: 'string',
        valueSource: 'text'
      },
      'RunRateGroup': {  // ✅ แก้จาก 'runRateGroup' ให้ตรงกับ name="RunRateGroup"
        dtoName: 'runrateCode',
        dataType: 'string',
        valueSource: 'text',
        transform: (val) => {
          if (!val || val === '') return null;
          // Extract text before hyphen (-)
          // Example: "Big C Mini - [HUB BCM] (85.8%)" → "Big C Mini"
          const match = val.match(/^([^-]+)/);
          return match ? match[1].trim() : val.trim();
        },
        derivedFields: [
          {
            dtoName: 'discount',
            dataType: 'string',
            valueSource: 'text', // ✅ Changed from 'value' to 'text' to read dropdown text
            transform: (val) => {
              if (!val || val === '') return null;
              // Extract percentage from text
              // Example: "Big C Mini - [HUB BCM] (85.8%)" → "85.8%"
              const match = val.match(/\((\d+\.?\d*%)\)/);
              return match ? match[1] : null;
            }
          }
        ]
      },
      'Remark': {
        dtoName: 'reason',
        dataType: 'string',
        valueSource: 'value'
      },

      // ─────────────────────────────────────────────────────────────────────
      // SPECIAL: 1 CHARACTER FIELDS (Database: StringLength(1))
      // ─────────────────────────────────────────────────────────────────────
      'JoinPVF': {
        dtoName: 'joinPvf',
        dataType: 'string',
        valueSource: 'value',
        maxLength: 1,
        transform: (val) => {
          if (!val || val === '') return null;
          const truncated = val.charAt(0).toUpperCase();
          if (val.length > 1) {
            console.warn(`⚠️ JoinPVF: Truncating "${val}" → "${truncated}"`);
          }
          return truncated;
        },
        derivedFields: [
          {
            dtoName: 'pvf',
            dataType: 'string',
            valueSource: 'value',
            transform: (val) => {
              // If JoinPVF = 1 → pvf = 'Y', else 'N'
              return val === '1' || val === 1 ? 'Y' : 'N';
            }
          }
        ]
      },
      'FocusHc': {
        dtoName: 'focusHc',
        dataType: 'string',
        valueSource: 'value'
      },
      'FocusPe': {
        dtoName: 'focusPe',
        dataType: 'string',
        valueSource: 'value'
      },
      'EmployeeLevel': {
        dtoName: 'executive',
        dataType: 'string',
        valueSource: 'value'
      },
      'HrbpEmpCode': {//Return null - ไม่ส่งค่าไปยัง Backend
        dtoName: 'hrbpEmpCode',
        dataType: 'string',
        valueSource: 'value',
        transform: () => null
      },
      'GroupName': {  //Return null - ไม่ส่งค่าไปยัง Backend
        dtoName: 'groupName',
        dataType: 'string',
        valueSource: 'value',
        transform: () => null
      },
      'GroupLevel1': {  //Return null - ไม่ส่งค่าไปยัง Backend
        dtoName: 'groupLevel1',
        dataType: 'string',
        valueSource: 'value',
        transform: () => null
      },
      'GroupLevel2': {  //Return null - ไม่ส่งค่าไปยัง Backend
        dtoName: 'groupLevel2',
        dataType: 'string',
        valueSource: 'value',
        transform: () => null
      }
    };

    console.log(`📋 Base fieldConfigs created: ${Object.keys(fieldConfigs).length} fields (before benefits)`);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 5: PROCESS BENEFITS FIELDS & GENERATE CONFIGS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // SA: รวม Step เก่า(4+6) เข้าด้วยกัน
    // - แปลงชื่อ field: batchLe1_LePayroll → editLePayroll
    // - สร้าง config ทันทีในลูปเดียว
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🔧 STEP 5: Processing benefits fields & generating configs`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    // Create a map to store transformed field names
    const benefitsFieldsMap = new Map(); // { originalId: transformedName }
    let benefitsFieldsCount = 0;

    // Process HTML fields: transform names + generate configs
    fields.forEach(field => {
      if (!field.id) return;

      const isBenefitsField = field.id.includes('batchLe') || field.id.includes('batchBg');
      if (isBenefitsField) {
        const idMatch = field.id.match(/^batch(Le|Bg)(\d+)_(.+)$/);
        if (idMatch) {
          const prefix = idMatch[1];      // "Le" or "Bg"
          const rowIndex = idMatch[2];    // "1", "2", "3"
          let fieldName = idMatch[3];     // "LePayroll", "BgBonus"

          // Remove Le/Bg prefix from fieldName
          if (fieldName.startsWith('Le')) {
            fieldName = fieldName.substring(2);
          } else if (fieldName.startsWith('Bg')) {
            fieldName = fieldName.substring(2);
          }

          // ✨ NEW APPROACH: Use backend field name from mapping as transformedName
          // OLD: transformedName = `edit${prefix}${fieldName}` → editLePayroll
          // NEW: transformedName = benefitsMapping[`edit${prefix}${fieldName}`] → payrollLe
          const frontendField = `edit${prefix}${fieldName}`;  // editLePayroll
          const backendField = benefitsMapping[frontendField]; // payrollLe

          if (!backendField) {
            console.warn(`  ⚠️ No mapping found for: ${frontendField} (skipping)`);
            return;
          }

          // Use backend field as transformed name
          const transformedName = backendField;

          // ✅ SAFETY: Double-check transformedName before using
          if (!transformedName || typeof transformedName !== 'string') {
            console.error(`❌ Invalid transformedName for ${field.id}: ${transformedName}`);
            return;
          }

          benefitsFieldsMap.set(field.id, transformedName);
          benefitsFieldsCount++;

          console.log(`  🎯 Transform: ${field.id} → ${transformedName} (via ${frontendField})`);

          // ✨ Generate config if this is first occurrence of this HTML field ID
          if (!fieldConfigs[field.id]) {
            // Determine data type from backend field name
            let dataType = 'decimal'; // Default for benefits fields
            let valueSource = 'value';
            //let hasDerivedFields = false;

            // ✅ PRIORITY 1: Check specific fields first (most specific → least specific)
            // 🎯 Special: Bonus Type fields need derived field for text
            if (transformedName.toLowerCase().includes('bonustype')) {
              dataType = 'string';
              valueSource = 'text';
              //hasDerivedFields = true;
              console.log(`  🎯 Detected BonusType field: ${transformedName} → adding derivedFields`);
            }
            // String fields (other types, remarks, codes)
            else if (transformedName.toLowerCase().includes('type') ||
              transformedName.toLowerCase().includes('remark') ||
              transformedName.toLowerCase().includes('code')) {
              dataType = 'string';
            }

            // Convert transformedName to camelCase for dtoName (first char lowercase)
            const dtoName = transformedName.charAt(0).toLowerCase() + transformedName.slice(1);

            // Create base field config using FIELD.ID as key (not transformedName!)
            fieldConfigs[field.id] = {
              dtoName: dtoName,
              dataType: dataType,
              valueSource: valueSource
            };

            // Add derivedFields if needed (for BonusType fields)
            // if (hasDerivedFields) {
            //   fieldConfigs[field.id].derivedFields = [{
            //     dtoName: dtoName + 'Name',
            //     dataType: 'string',
            //     valueSource: 'text'
            //   }];
            //   console.log(`    ✅ Added derivedField: ${dtoName}Name`);
            // }

            console.log(`  ✅ Config: ${field.id} → ${dtoName} (${dataType})`);
          }
        }
      }
    });

    console.log(`\n📊 Benefits processing completed:`);
    console.log(`   - Fields transformed: ${benefitsFieldsCount}`);
    console.log(`   - Config entries created: ${Object.keys(fieldConfigs).length - 20}`); // Subtract basic fields
    console.log(`   - Total fieldConfigs: ${Object.keys(fieldConfigs).length}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 6: COLLECT FIELD DATA & BUILD DTO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`� STEP 7: Collecting field data and building DTO`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    let processedCount = 0;

    fields.forEach(field => {
      if (!field.name || field.type === 'hidden') return;

      // Remove rowId prefix if exists (e.g., "batch-row-1_empCode" → "empCode")
      let baseName = field.name.replace(`${rowId}_`, '');

      // 🎯 SPECIAL HANDLING: Benefits fields
      // Benefits fields use field.id to lookup config (same key used in STEP 5)
      let config;
      let transformedName; // For DTO mapping

      if (field.id && benefitsFieldsMap.has(field.id)) {
        // ✅ Use field.id to lookup config (matches STEP 5 storage)
        config = fieldConfigs[field.id];
        transformedName = benefitsFieldsMap.get(field.id); // 'payrollLe' for DTO
        console.log(`  🎯 Benefits field: ${field.id} → ${transformedName} = "${field.value}"`);
      } else {
        // Basic fields use baseName
        config = fieldConfigs[baseName];
        transformedName = baseName;
      }

      if (config) {
        // ────────────────────────────────────────────────────────────────
        // CONFIGURED FIELD: Use fieldConfigs (from Step 4 & Step 5)
        // ────────────────────────────────────────────────────────────────

        // ✅ VALIDATION: Check config structure
        if (!config.dtoName || typeof config.dtoName !== 'string') {
          console.error(`❌ Invalid config.dtoName for field: ${field.id || field.name}`, config);
          return; // Skip this field
        }

        // 📝 Log field mapping
        const isBenefitsField = field.id && benefitsFieldsMap.has(field.id);
        if (!isBenefitsField) {
          console.log(`  📝 Basic field: ${baseName} → ${config.dtoName} = "${field.value}"`);
        }

        // 🎯 HELPER: Extract value based on valueSource
        const extractValue = (valueSource, field) => {
          switch (valueSource) {
            case 'text':
              return field.options?.[field.selectedIndex]?.text || field.value;
            case 'selectedIndex':
              return field.selectedIndex;
            case 'value':
            default:
              return field.value;
          }
        };

        // 🎯 HELPER: Process single field config
        const processFieldConfig = (fieldConfig, field, isDerived = false) => {
          // ✅ Additional validation for nested configs
          if (!fieldConfig.dtoName || typeof fieldConfig.dtoName !== 'string') {
            console.error(`❌ Invalid fieldConfig.dtoName in processFieldConfig`, fieldConfig);
            return;
          }

          const pascalName = fieldConfig.dtoName.charAt(0).toUpperCase() + fieldConfig.dtoName.slice(1);
          let value = extractValue(fieldConfig.valueSource, field);

          // 📊 Log mapping details
          if (!isBenefitsField && !isDerived) {
            console.log(`     └─> Mapping: ${baseName} → ${pascalName} (type: ${fieldConfig.dataType}, source: ${fieldConfig.valueSource})`);
          }

          // Handle empty values
          if (value === '' || value === null || value === undefined) {
            data[pascalName] = null;
            if (!isBenefitsField && !isDerived) {
              console.log(`     └─> Result: ${pascalName} = null (empty)`);
            }
            return;
          }

          // Apply custom transform if exists
          if (fieldConfig.transform) {
            value = fieldConfig.transform(value, field);
          }

          // Apply maxLength truncation (if not already handled by transform)
          if (fieldConfig.maxLength && value && typeof value === 'string' && value.length > fieldConfig.maxLength) {
            console.warn(`⚠️ ${fieldConfig.dtoName}: Truncating "${value}" to ${fieldConfig.maxLength} chars`);
            value = value.substring(0, fieldConfig.maxLength);
          }

          // Convert data type
          switch (fieldConfig.dataType) {
            case 'int':
              const intVal = parseInt(value, 10);
              data[pascalName] = isNaN(intVal) ? null : intVal;
              break;
            case 'decimal':
              const decVal = parseFloat(value);
              data[pascalName] = isNaN(decVal) ? null : decVal;
              break;
            case 'boolean':
              data[pascalName] = value === 'true' || value === '1' || value === true;
              break;
            case 'date':
              data[pascalName] = value; // Send as ISO string
              break;
            case 'string':
            default:
              data[pascalName] = value;
              break;
          }

          // 📊 Log final value
          if (!isBenefitsField && !isDerived) {
            console.log(`     └─> Result: ${pascalName} = ${JSON.stringify(data[pascalName])}`);
          }
        };

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // PROCESS PRIMARY FIELD
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        processFieldConfig(config, field);
        processedCount++;

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // PROCESS DERIVED FIELDS (ถ้ามี)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if (config.derivedFields && Array.isArray(config.derivedFields)) {
          if (!isBenefitsField) {
            console.log(`     └─> Derived fields: ${config.derivedFields.length} additional field(s)`);
          }
          config.derivedFields.forEach(derivedConfig => {
            processFieldConfig(derivedConfig, field, true); // true = isDerived
          });
        }


      } else {
        // ────────────────────────────────────────────────────────────────
        // UNCONFIGURED FIELD: Use default logic (backwards compatibility)
        // ────────────────────────────────────────────────────────────────
        const pascalName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
        let value = field.value;

        if (value === '' || value === null || value === undefined) {
          data[pascalName] = null;
          return;
        }

        // Auto-detect number fields
        if (field.type === 'number' || field.dataset.type === 'number') {
          const numVal = parseFloat(value);
          data[pascalName] = isNaN(numVal) ? null : numVal;
        }
        // Auto-detect date fields
        else if (field.type === 'date' || field.dataset.type === 'date') {
          data[pascalName] = value;
        }
        // Default: string
        else {
          data[pascalName] = value;
        }
      }
    });

    console.log(`\n✅ Processing completed:`);
    console.log(`   - Total fields processed: ${processedCount}`);
    console.log(`   - Benefits fields transformed: ${benefitsFieldsMap.size} (from Step 5)`);
    console.log(`   - Properties in data object: ${Object.keys(data).length}`);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // AUTO-POPULATE: UpdatedBy & UpdatedDate
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Get current user from window context (JWT token or default)
    const currentUser = window.getCurrentUser ? window.getCurrentUser() : 'DevUser';
    data.UpdatedBy = currentUser;
    data.UpdatedDate = new Date().toISOString(); // ISO 8601 format for C# DateTime

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // LOGGING & VALIDATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log('\n📊 Final collected data:');
    console.log(data);

    // 🔍 Log Benefits fields specifically
    const benefitsKeys = Object.keys(data).filter(key =>
      key.toLowerCase().includes('payroll') ||
      key.toLowerCase().includes('bonus') ||
      key.toLowerCase().includes('fleetcard') ||
      key.toLowerCase().includes('skill')
    );
    if (benefitsKeys.length > 0) {
      console.log(`\n💰 Benefits fields in data (${benefitsKeys.length}):`);
      benefitsKeys.forEach(key => console.log(`   - ${key}: ${data[key]}`));
    } else {
      console.warn('⚠️ No benefits fields found in collected data!');
    }

    if (!data.CompanyId) {
      console.error('❌ Missing CompanyId!', {
        availableFields: Object.keys(data),
        companyField: rowElement.querySelector('.batch-company'),
        companyValue: rowElement.querySelector('.batch-company')?.value
      });
    }

    return data;
  }
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🛠️ 5. UTILITY FUNCTIONS & HELPERS
// ═══════════════════════════════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────────
// 📅 DATE & YEAR UTILITIES
// ───────────────────────────────────────────────────────────────────

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
// Removed clearAndEnableEditFields - not needed for Edit-only mode

// ───────────────────────────────────────────────────────────────────
// 🔗 MODULE DEPENDENCY MANAGEMENT
// ───────────────────────────────────────────────────────────────────

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

// ───────────────────────────────────────────────────────────────────
// 🎯 MAIN EVENT HANDLERS
// ───────────────────────────────────────────────────────────────────

// Handle Edit button click for AG Grid
function handleEditButtonClick(e) {
  if (e.target.closest('.edit-btn')) {
    // Show loading state
    showOffcanvasLoading('Loading employee information...', 'offcanvasEditRow');
    // ตั้ง flag เพื่อป้องกัน onBudgetSelectionChanged ทำงาน
    window.isEditButtonClicked = true;

    const btn = e.target.closest('.edit-btn');
    const rowIndex = btn.getAttribute('data-index');
    const rowData = gridApi.getDisplayedRowAtIndex(Number(rowIndex)).data;
    console.log(`✏️ Edit button clicked for row index: ${rowIndex}`, rowData);
    // Set form mode to edit only
    document.getElementById('formMode').value = 'edit';

    // Update UI labels for Edit mode
    document.getElementById('offcanvasEditRowLabel').textContent = 'Edit Budget Row';

    // Show the offcanvas
    getOffcanvasInstance(document.getElementById('offcanvasEditRow')).show();

    // Store edit index and original data for change detection
    const form = document.getElementById('editRowForm');
    form.setAttribute('data-edit-index', rowIndex);

    // ✅ NEW: Store original data for Partial Update (Phase 1)
    // This enables change detection - only send fields that actually changed
    form.setAttribute('data-original', JSON.stringify(rowData));
    form.setAttribute('data-budget-id', rowData.budgetId || '');
    console.log('💾 Stored original data for change detection');

    // Show Update button and hide Save button for Edit mode
    document.getElementById('updateRowBtn').style.display = 'inline-block';
    document.getElementById('saveEditBtn').style.display = 'none';

    // Load edit form data
    setTimeout(() => {
      // 🔧 NOTE: Edit Company dropdown uses legacy populateDropdown with extended parameters
      // This cannot be converted to populateDropdownAsync due to different function signature
      // TODO: Update when legacy populateDropdown is refactored
      populateDropdown('editCompany', BUDGET_API.companies, 'Select Company', (option, item) => {
        option.value = item.companyId;
        option.textContent = item.companyCode;
      }, true, {
        setupRelationships: 'edit',
        initializeSubsystems: true,
        populateRelatedDropdowns: true
      });

      // Populate form with row data
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

// ───────────────────────────────────────────────────────────────────
// 🏷️ LABEL UPDATE FUNCTIONS
// ───────────────────────────────────────────────────────────────────

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

/**
 * Initialize COBU/Format label on page load
 * Checks current company filter value and updates label accordingly
 */
function initializeCobuLabel() {
  try {
    // Get current company filter value
    const companyFilter = document.getElementById('companyFilter');

    if (companyFilter && companyFilter.value) {
      const companyID = companyFilter.value;
      console.log(`🏷️ Initializing COBU label for Company ${companyID}`);
      updateCobuLabel(companyID);
    } else {
      // Set default label if no company selected
      console.log(`🏷️ No company selected, using default label`);
      const mainLabelText = document.getElementById('cobuFilterLabelText');
      if (mainLabelText) {
        mainLabelText.textContent = 'COBU/Format';
      }
      const mainAllOption = document.getElementById('cobuFilterAllOption');
      if (mainAllOption) {
        mainAllOption.textContent = 'All COBU/Format';
      }
    }
  } catch (error) {
    console.error('❌ Error initializing COBU label:', error);
  }
}

/**
 * Initialize Company/Store name label on page load
 * Checks current company filter value and updates label accordingly
 */
function initializeCompstoreLabel() {
  try {
    // Get current company filter value
    const companyFilter = document.getElementById('companyFilter');

    if (companyFilter && companyFilter.value) {
      const companyID = companyFilter.value;
      console.log(`🏷️ Initializing Compstore label for Company ${companyID}`);
      updateCompstoreLabel(companyID);
    } else {
      // Set default label if no company selected
      console.log(`🏷️ No company selected, using default Compstore label`);
      const mainLabelText = document.getElementById('compstoreFilterLabelText');
      if (mainLabelText) {
        mainLabelText.textContent = 'Company/Store name';
      }
      const mainAllOption = document.getElementById('compstoreFilterAllOption');
      if (mainAllOption) {
        mainAllOption.textContent = 'All Company/Store names';
      }
    }
  } catch (error) {
    console.error('❌ Error initializing Compstore label:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🔍 6. SEARCH & BUSINESS LOGIC
// ═══════════════════════════════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────────
// 🔍 SEARCH OPERATIONS & HANDLERS
// ───────────────────────────────────────────────────────────────────

// Handle Search button click
function handleSearchClick() {
  // Auto-reset Batch Entry before search if there are active rows
  if (typeof batchEntryManager !== 'undefined' && batchEntryManager.activeRows && batchEntryManager.activeRows.size > 0) {
    console.log('🔄 Auto-resetting Batch Entry before search...');
    batchEntryManager.resetBatchEntryForSearch();
  }

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
  var division = $('#divisionFilter').val();
  var department = $('#departmentFilter').val();
  var section = $('#sectionFilter').val();
  var compStore = $('#compstoreFilter').val();
  var empStatus = $('#empstatusFilter').val();
  var costCenterCode = $('#costcenterFilter').val();
  var positionCode = $('#positionFilter').val();
  var jobBand = $('#jobbandFilter').val();

  // Build query parameters
  var params = new URLSearchParams();
  params.append('companyID', companyID);
  if (budgetYear) params.append('budgetYear', budgetYear);
  if (cobu) params.append('COBU', cobu);
  if (division) params.append('division', division);
  if (department) params.append('department', department);
  if (section) params.append('section', section);
  if (compStore) params.append('compStore', compStore);
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

      // Show/hide add allocation batch button based on company and data availability
      const addAllocationBatchBtn = document.getElementById('addAllocationBatchBtn');
      if (addAllocationBatchBtn) {
        if (companyID === '2' && Array.isArray(data) && data.length > 0) {
          // Company = BIGC AND has data → Show button
          addAllocationBatchBtn.classList.remove('d-none');
        } else {
          // Other company OR no data → Hide button
          addAllocationBatchBtn.classList.add('d-none');
        }
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

      updateGridForCompany(companyID);
      refreshGridForCompanyFilter();

      // console.log(`Company changed to: ${formatCompanyDisplayName(companyID)}`);

      // Add any additional company-specific logic here

      // Enable dependent filters and update them
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

// ───────────────────────────────────────────────────────────────────
// 🎨 UI INITIALIZATION & BINDING
// ───────────────────────────────────────────────────────────────────

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

// ───────────────────────────────────────────────────────────────────
// 🔗 EVENT BINDING & LISTENERS
// ───────────────────────────────────────────────────────────────────

// Bind all event listeners
function bindEventListeners() {
  // Button event listeners (removed handleAddRowClick - now handled by Batch Entry)
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

  // Initialize Batch Entry Manager
  if (typeof batchEntryManager !== 'undefined') {
    batchEntryManager.initialize();
    console.log('✅ Batch Entry Manager initialized');
  } else {
    console.error('❌ Batch Entry Manager not found');
  }

  // console.log('All event listeners bound successfully');
}

// ───────────────────────────────────────────────────────────────────
// 🔧 FORM HELPER FUNCTIONS
// ───────────────────────────────────────────────────────────────────

// Helper function to populate edit form (implementation now in budget.offcanvas.js)
function populateEditForm(rowData) {
  // Call the actual implementation from budget.offcanvas.js
  if (typeof window.populateEditForm === 'function') {
    window.populateEditForm(rowData);
  } else {
    console.error('❌ populateEditForm function not found in budget.offcanvas.js');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🌐 8. GLOBAL EXPORTS & MODULE INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────────
// 📤 FUNCTION EXPORTS
// ───────────────────────────────────────────────────────────────────

// Export functions to global scope for use by other modules
window.bindEventListeners = bindEventListeners;
window.initializeUIState = initializeUIState;
window.handleSearchClick = handleSearchClick;
window.handleResetClick = handleResetClick;
window.handleToggleMasterGridClick = handleToggleMasterGridClick;
window.populateEditForm = populateEditForm;
window.checkModuleDependencies = checkModuleDependencies;

// ───────────────────────────────────────────────────────────────────
// 🌐 GLOBAL OBJECT EXPORTS
// ───────────────────────────────────────────────────────────────────

// Export Batch Entry Manager
window.batchEntryManager = batchEntryManager;

// Export batch validator for external access
window.batchValidator = batchEntryManager.batchValidator;

// Export data variables for access by other modules
window.rawData = rawData;
window.masterData = masterData;

// ───────────────────────────────────────────────────────────────────
// ⚡ DEBOUNCED FUNCTION BINDING
// ───────────────────────────────────────────────────────────────────

// Import and bind debounced functions from budget.plan.debounced.js if available
if (window.batchEntryManager && typeof debounce === 'function') {
  // Create debounced functions for batch row updates
  window.batchEntryManager.debouncedUpdateBatchRowCostCenters = debounce(window.batchEntryManager.updateBatchRowCostCenters.bind(window.batchEntryManager), 300);
  window.batchEntryManager.debouncedUpdateBatchRowDivisions = debounce(window.batchEntryManager.updateBatchRowDivisions.bind(window.batchEntryManager), 300);
  window.batchEntryManager.debouncedUpdateBatchRowDepartments = debounce(window.batchEntryManager.updateBatchRowDepartments.bind(window.batchEntryManager), 300);
  window.batchEntryManager.debouncedUpdateBatchRowSections = debounce(window.batchEntryManager.updateBatchRowSections.bind(window.batchEntryManager), 300);
  window.batchEntryManager.debouncedUpdateBatchRowCompStore = debounce(window.batchEntryManager.updateBatchRowCompStore.bind(window.batchEntryManager), 300);
  window.batchEntryManager.debouncedUpdateBatchRowPositions = debounce(window.batchEntryManager.updateBatchRowPositions.bind(window.batchEntryManager), 300);
  window.batchEntryManager.debouncedUpdateBatchRowJobBands = debounce(window.batchEntryManager.updateBatchRowJobBands.bind(window.batchEntryManager), 300);
  window.batchEntryManager.debouncedUpdateBatchRowEmployeeStatus = debounce(window.batchEntryManager.updateBatchRowEmployeeStatus.bind(window.batchEntryManager), 300);
  window.batchEntryManager.debouncedUpdateBatchRowGroupRunRates = debounce(window.batchEntryManager.updateBatchRowGroupRunRates.bind(window.batchEntryManager), 300);
  window.batchEntryManager.debouncedupdateBatchRowSalaryStructures = debounce(window.batchEntryManager.updateBatchRowSalaryStructures.bind(window.batchEntryManager), 300);
}

// ───────────────────────────────────────────────────────────────────
// 🚨 GLOBAL ERROR HANDLING
// ───────────────────────────────────────────────────────────────────

// Add global error handler to prevent PointerEvent crashes
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

// ───────────────────────────────────────────────────────────────────
// 🚀 ENHANCED VALIDATION BOOTSTRAP & INITIALIZATION
// ───────────────────────────────────────────────────────────────────
// Multiple initialization approaches to ensure Enhanced UI Validation works

// Method 1: jQuery Document Ready
jQuery(document).ready(function ($) {
  console.log('🚀 Enhanced Validation Bootstrap - jQuery Ready');
  initializeEnhancedValidation();
});

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🚀 7. GLOBAL INITIALIZATION & EVENT HANDLERS
// ═══════════════════════════════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────────
// ⚡ DOCUMENT READY & INITIALIZATION EVENTS
// ───────────────────────────────────────────────────────────────────

// Method 2: DOM Content Loaded
document.addEventListener('DOMContentLoaded', function () {
  console.log('🚀 Enhanced Validation Bootstrap - DOM Ready');
  initializeEnhancedValidation();

  // 🆕 Initialize COBU/Format label on page load
  initializeCobuLabel();

  // 🆕 Initialize Company/Store name label on page load
  initializeCompstoreLabel();
});

// Method 3: Window Load (as fallback)
window.addEventListener('load', function () {
  console.log('🚀 Enhanced Validation Bootstrap - Window Load');
  initializeEnhancedValidation();
});

// Method 4: Immediate execution with checks
(function () {
  console.log('🚀 Enhanced Validation Bootstrap - Immediate');
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEnhancedValidation);
  } else {
    initializeEnhancedValidation();
  }
})();

// Enhanced validation initialization function
function initializeEnhancedValidation() {
  console.log('🔧 Initializing Enhanced Validation...');

  // Add delay to ensure all objects are loaded
  setTimeout(function () {
    try {
      console.log('🔧 Setting up Enhanced Validation after delay...');

      // Force create global namespace if not exists
      if (typeof window.ENHANCED_VALIDATION === 'undefined') {
        window.ENHANCED_VALIDATION = {
          initialized: false,
          eventsBound: false
        };
      }

      // Prevent double initialization
      if (window.ENHANCED_VALIDATION.initialized) {
        console.log('⏭️ Enhanced Validation already initialized');
        return;
      }

      // Check jQuery availability
      if (typeof $ === 'undefined' && typeof jQuery === 'undefined') {
        console.error('❌ jQuery not available');
        // Try native event binding as fallback
        bindEnhancedValidationNative();
        return;
      }

      const jq = $ || jQuery;

      // Set up enhanced validation configuration
      setupEnhancedValidationConfig();

      // Set up global event delegation for ALL input fields
      console.log('🔗 Binding enhanced validation events...');

      // Remove existing listeners first
      jq(document).off('blur.enhancedValidation change.enhancedValidation input.enhancedValidation');

      // 🎯 Use Configuration-Driven Field Selectors from budget.plan.config.js
      // SA สามารถแก้ไขการตรวจจับฟิลด์ได้ที่ ENHANCED_UI_FIELD_SELECTORS

      let fieldSelectors = '';

      // Check if configuration is available
      if (typeof window.ENHANCED_UI_FIELD_SELECTORS !== 'undefined') {
        console.log('✅ Using Configuration-Driven Field Selectors');

        // Get current company for company-specific selectors
        const currentCompany = document.getElementById('companyFilter')?.value ||
          document.querySelector('.batch-company')?.value;
        const companyCode = currentCompany === '1' ? 'BJC' :
          currentCompany === '2' ? 'BIGC' : null;

        // Get combined selector from configuration
        fieldSelectors = window.ENHANCED_UI_FIELD_SELECTORS.getCombinedSelector(companyCode);

        console.log('🔧 Field Selectors Config:', {
          companyCode,
          totalSelectors: window.ENHANCED_UI_FIELD_SELECTORS.getAllSelectors(companyCode).length,
          enabledGroups: {
            primary: window.ENHANCED_UI_FIELD_SELECTORS.configuration.enablePrimary,
            batchEntry: window.ENHANCED_UI_FIELD_SELECTORS.configuration.enableBatchEntry,
            namePatterns: window.ENHANCED_UI_FIELD_SELECTORS.configuration.enableNamePatterns,
            idPatterns: window.ENHANCED_UI_FIELD_SELECTORS.configuration.enableIdPatterns,
            containers: window.ENHANCED_UI_FIELD_SELECTORS.configuration.enableContainers,
            catchAll: window.ENHANCED_UI_FIELD_SELECTORS.configuration.enableCatchAll
          }
        });

      } else {
        console.warn('⚠️ ENHANCED_UI_FIELD_SELECTORS not found, using fallback selectors');

        // Fallback selectors if config is not available
        fieldSelectors = [
          'input[id*="editLe"]',
          'input[id*="editBg"]',
          'input.batch-payroll',
          'input.batch-premium',
          'input[id*="payroll"]',
          'input[id*="premium"]',
          'input[id*="bonus"]',
          'input[id*="allowance"]',
          '#leBenefitsContainer input',
          '#bgBenefitsContainer input'
        ].join(', ');
      }

      jq(document).on('blur.enhancedValidation change.enhancedValidation input.enhancedValidation', fieldSelectors, function (e) {
        const field = e.target;
        console.log('🔄 Enhanced Validation Event triggered:', {
          event: e.type,
          fieldId: field.id,
          fieldClass: field.className,
          fieldValue: field.value,
          numericValue: parseFloat(field.value),
          isZeroOrNegative: isZeroOrNegativeValue(field.value),
          timestamp: new Date().toISOString()
        });

        // Apply enhanced validation immediately with detailed logging
        const validationType = determineValidationType(field);
        const warningType = getValidationWarningType(field);

        console.log('🎯 Validation Decision:', {
          validationType,
          warningType,
          shouldShowWarning: validationType === 'warning'
        });

        applyDirectValidation(field, validationType, warningType);

      });

      // Mark as initialized
      window.ENHANCED_VALIDATION.initialized = true;
      window.ENHANCED_VALIDATION.eventsBound = true;

      console.log('✅ Enhanced Validation Bootstrap completed successfully');

    } catch (error) {
      console.error('❌ Error in Enhanced Validation Bootstrap:', error);
      // Try fallback approach
      bindEnhancedValidationNative();
    }
  }, 1500); // Increased delay to 1.5 seconds
}

// Setup enhanced validation configuration
function setupEnhancedValidationConfig() {
  console.log('⚙️ Setting up Enhanced Validation Config...');

  // Ensure BATCH_VALIDATION_CONFIG exists
  if (typeof window.BATCH_VALIDATION_CONFIG !== 'undefined' && window.BATCH_VALIDATION_CONFIG.uiValidation) {
    window.BATCH_VALIDATION_CONFIG.uiValidation.enabled = true;
    console.log('✅ Enhanced UI Validation enabled in config');
  } else {
    // Create minimal config if not exists
    window.BATCH_VALIDATION_CONFIG = window.BATCH_VALIDATION_CONFIG || {};
    window.BATCH_VALIDATION_CONFIG.uiValidation = {
      enabled: true,
      useThaiMessages: true,
      showBorders: true,
      showIcons: true
    };
    console.log('✅ Created minimal Enhanced UI Validation config');
  }
}

// Determine validation type based on field value
function determineValidationType(field) {
  if (!field.value || field.value.trim() === '') {
    return 'neutral'; // No validation for empty fields
  }

  // Check if this is a benefits field (COMPREHENSIVE detection)
  const isBenefitsField = field.id.includes('editLe') ||
    field.id.includes('editBg') ||
    field.classList.contains('batch-payroll') ||
    field.classList.contains('batch-premium') ||
    field.id.toLowerCase().includes('payroll') ||
    field.id.toLowerCase().includes('premium') ||
    field.id.toLowerCase().includes('benefit') ||
    field.id.toLowerCase().includes('bonus') ||
    field.id.toLowerCase().includes('allowance') ||
    field.id.toLowerCase().includes('fleet') ||
    field.id.toLowerCase().includes('car') ||
    field.id.toLowerCase().includes('license') ||
    field.id.toLowerCase().includes('housing') ||
    field.id.toLowerCase().includes('gasoline') ||
    field.id.toLowerCase().includes('wage') ||
    field.id.toLowerCase().includes('other') ||
    field.name?.toLowerCase().includes('payroll') ||
    field.name?.toLowerCase().includes('premium') ||
    field.name?.toLowerCase().includes('bonus') ||
    field.name?.toLowerCase().includes('allowance') ||
    field.name?.toLowerCase().includes('fleet') ||
    field.name?.toLowerCase().includes('car') ||
    field.name?.toLowerCase().includes('license') ||
    field.name?.toLowerCase().includes('housing') ||
    field.name?.toLowerCase().includes('gasoline') ||
    field.name?.toLowerCase().includes('wage') ||
    field.name?.toLowerCase().includes('other') ||
    (field.closest && (field.closest('[id*="leBenefits"]') || field.closest('[id*="bgBenefits"]')));

  if (isBenefitsField) {
    // Enhanced zero/negative value detection for benefits fields
    const numericValue = parseFloat(field.value);

    // Check for various zero/negative patterns
    if (isZeroOrNegativeValue(field.value)) {
      return 'warning';
    }

    // Valid positive value
    if (numericValue > 0) {
      return 'success';
    }
  }

  return 'success';
}

// Enhanced zero/negative value detection
function isZeroOrNegativeValue(value) {
  if (!value || value.trim() === '') return false;

  const trimmedValue = value.trim();

  // Convert to number for precise checking
  const numericValue = parseFloat(trimmedValue);

  // Check if it's a valid number and <= 0
  if (!isNaN(numericValue) && numericValue <= 0) {
    return true;
  }

  // Additional string patterns for zero values
  const zeroPatterns = [
    /^0+$/, // 0, 00, 000, 0000, etc.
    /^0+\.0+$/, // 0.0, 00.00, 000.000, etc.
    /^\.0+$/, // .0, .00, .000, etc.
    /^0+\.$/, // 0., 00., 000., etc.
    /^-0+$/, // -0, -00, -000, etc.
    /^-0+\.0+$/, // -0.0, -00.00, etc.
    /^-\.0+$/ // -.0, -.00, etc.
  ];

  return zeroPatterns.some(pattern => pattern.test(trimmedValue));
}

// Get warning type for field
function getValidationWarningType(field) {
  const isBenefitsField = field.id.includes('editLe') ||
    field.id.includes('editBg') ||
    field.classList.contains('batch-payroll') ||
    field.classList.contains('batch-premium') ||
    field.id.toLowerCase().includes('payroll') ||
    field.id.toLowerCase().includes('premium') ||
    field.id.toLowerCase().includes('benefit') ||
    field.id.toLowerCase().includes('bonus') ||
    field.id.toLowerCase().includes('allowance') ||
    field.id.toLowerCase().includes('fleet') ||
    field.id.toLowerCase().includes('car') ||
    field.id.toLowerCase().includes('license') ||
    field.id.toLowerCase().includes('housing') ||
    field.id.toLowerCase().includes('gasoline') ||
    field.id.toLowerCase().includes('wage') ||
    field.id.toLowerCase().includes('other') ||
    field.name?.toLowerCase().includes('payroll') ||
    field.name?.toLowerCase().includes('premium') ||
    field.name?.toLowerCase().includes('bonus') ||
    field.name?.toLowerCase().includes('allowance') ||
    field.name?.toLowerCase().includes('fleet') ||
    field.name?.toLowerCase().includes('car') ||
    field.name?.toLowerCase().includes('license') ||
    field.name?.toLowerCase().includes('housing') ||
    field.name?.toLowerCase().includes('gasoline') ||
    field.name?.toLowerCase().includes('wage') ||
    field.name?.toLowerCase().includes('other') ||
    (field.closest && (field.closest('[id*="leBenefits"]') || field.closest('[id*="bgBenefits"]')));

  if (isBenefitsField && isZeroOrNegativeValue(field.value)) {
    // Determine specific warning type
    const numericValue = parseFloat(field.value);

    if (!isNaN(numericValue)) {
      if (numericValue < 0) {
        return 'negativeValue';
      } else if (numericValue === 0) {
        return 'zeroValue';
      }
    }

    // For string patterns that represent zero
    return 'zeroValue';
  }

  return '';
}

// Fallback native event binding
function bindEnhancedValidationNative() {
  console.log('🔧 Using native event binding as fallback...');

  document.addEventListener('blur', function (e) {
    const field = e.target;
    if (field.tagName === 'INPUT' && shouldValidateField(field)) {
      console.log('🔄 Native Enhanced Validation Event (blur):', field.tagName, field.type, field.id);
      applyDirectValidation(field, determineValidationType(field), getValidationWarningType(field));
    }
  }, true);

  document.addEventListener('change', function (e) {
    const field = e.target;
    if (field.tagName === 'INPUT' && shouldValidateField(field)) {
      console.log('🔄 Native Enhanced Validation Event (change):', field.tagName, field.type, field.id);
      applyDirectValidation(field, determineValidationType(field), getValidationWarningType(field));
    }
  }, true);

  console.log('✅ Native event binding completed - Only INPUT[type="text"|"number"] allowed');
}

// Check if field should be validated (Configuration-Driven)
function shouldValidateField(field) {
  // 🔧 ENHANCED: Only allow "text" and "number" input types for validation
  const allowedTypes = ['text', 'number'];
  if (!allowedTypes.includes(field.type)) {
    return false;
  }

  // Use configuration-driven validation if available
  if (typeof window.shouldValidateFieldEnhanced === 'function') {
    return window.shouldValidateFieldEnhanced(field);
  }

  // Fallback validation logic
  return field.id.includes('editLe') ||
    field.id.includes('editBg') ||
    field.classList.contains('batch-payroll') ||
    field.classList.contains('batch-premium') ||
    field.id.includes('payroll') ||
    field.id.includes('premium');
}

// Direct validation application function
function applyDirectValidation(field, type, warningType) {
  try {
    console.log(`🎯 Applying direct validation: ${type} to ${field.id || field.className}`);

    // 🔧 ENHANCED: Only allow "text" and "number" input types for validation
    const allowedTypes = ['text', 'number'];
    if (!allowedTypes.includes(field.type)) {
      console.log('⏭️ Skipping validation for unsupported input type:', field.type, 'Field ID:', field.id, '(Only text/number allowed)');
      return false;
    }

    // 🆕 REFACTORED: Use unified styling utility with direct validation options (FIXED PATH)
    if (window.batchEntryManager?.batchValidator?.applyValidationStyling) {
      return window.batchEntryManager.batchValidator.applyValidationStyling(field, type, warningType, {
        useEnhancedStyles: true,
        showMessage: true,
        isDirectValidation: true
      });
    } else {
      console.warn('⚠️ Unified validation utility not available, using fallback');
      return false;
    }

  } catch (error) {
    console.error('❌ Error in applyDirectValidation:', error);
    return false;
  }
}

// ───────────────────────────────────────────────────────────────────
// 🎯 UNIFIED VALIDATION QUICK ACTION FUNCTIONS (Phase 1)
// ───────────────────────────────────────────────────────────────────

// Global quick action functions for unified validation UI
window.batchEntryManager = window.batchEntryManager || {};

// Focus field by ID or name
window.batchEntryManager.focusField = function (fieldIdentifier, rowElement = null) {
  try {
    let field = null;

    // Try to find field by ID first
    field = document.getElementById(fieldIdentifier);

    // If not found and rowElement provided, search within row
    if (!field && rowElement) {
      field = rowElement.querySelector(`#${fieldIdentifier}`) ||
        rowElement.querySelector(`[name="${fieldIdentifier}"]`) ||
        rowElement.querySelector(`.${fieldIdentifier}`);
    }

    // Global search as fallback
    if (!field) {
      field = document.querySelector(`[name="${fieldIdentifier}"]`) ||
        document.querySelector(`.${fieldIdentifier}`);
    }

    if (field) {
      // Scroll into view
      field.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Focus and highlight
      setTimeout(() => {
        field.focus();
        field.select();

        // Add temporary highlight
        const originalBackground = field.style.backgroundColor;
        field.style.backgroundColor = '#fff3cd';
        field.style.transition = 'background-color 0.3s ease';

        setTimeout(() => {
          field.style.backgroundColor = originalBackground;
        }, 1000);

      }, 300);

      console.log(`✅ Focused field: ${fieldIdentifier}`);
      return true;
    } else {
      console.warn(`⚠️ Field not found: ${fieldIdentifier}`);
      return false;
    }

  } catch (error) {
    console.error('❌ Error focusing field:', error);
    return false;
  }
};

// Focus first error field in row
window.batchEntryManager.focusFirstError = function (buttonElement) {
  try {
    const rowElement = buttonElement.closest('[data-batch-row-id]');
    if (!rowElement) {
      console.warn('⚠️ Row element not found');
      return false;
    }

    // Find first field with error
    const errorField = rowElement.querySelector('.is-invalid, .batch-field-error, .border-danger');

    if (errorField) {
      return window.batchEntryManager.focusField(errorField.id || errorField.name, rowElement);
    } else {
      // Find first required empty field
      const requiredFields = rowElement.querySelectorAll('[required], .required');
      for (let field of requiredFields) {
        if (!field.value || field.value.trim() === '') {
          return window.batchEntryManager.focusField(field.id || field.name, rowElement);
        }
      }

      console.log('ℹ️ No error fields found to focus');
      return false;
    }

  } catch (error) {
    console.error('❌ Error focusing first error:', error);
    return false;
  }
};

// Save individual row (placeholder for future implementation)
window.batchEntryManager.saveRow = function (rowId) {
  try {
    console.log(`💾 Save row requested for: ${rowId}`);

    // Check if row is valid first
    const rowElement = document.querySelector(`[data-batch-row-id="${rowId}"]`);
    if (!rowElement) {
      console.warn(`⚠️ Row not found: ${rowId}`);
      return false;
    }

    // Get validation status
    const rowData = window.batchEntryManager.activeRows?.get(rowId);
    if (!rowData || !rowData.isValid) {
      alert('กรุณาแก้ไขข้อผิดพลาดก่อนบันทึก');
      window.batchEntryManager.focusFirstError(rowElement);
      return false;
    }

    // TODO: Implement actual save logic
    alert(`บันทึกแถว ${rowId} สำเร็จ (ฟีเจอร์นี้จะพัฒนาใน Phase 2)`);
    return true;

  } catch (error) {
    console.error('❌ Error saving row:', error);
    return false;
  }
};

// Auto-fill default values (placeholder)
window.batchEntryManager.autoFillDefaults = function (buttonElement) {
  try {
    const rowElement = buttonElement.closest('[data-batch-row-id]');
    const rowId = rowElement?.getAttribute('data-batch-row-id');

    if (!rowElement || !rowId) {
      console.warn('⚠️ Row element not found');
      return false;
    }

    console.log(`🪄 Auto-fill defaults requested for row: ${rowId}`);

    // TODO: Implement auto-fill logic based on company rules
    alert('ฟีเจอร์ Auto-fill จะพัฒนาใน Phase 2');

    return true;

  } catch (error) {
    console.error('❌ Error auto-filling defaults:', error);
    return false;
  }
};

// Validate row now (force re-validation)
window.batchEntryManager.validateRowNow = function (buttonElement) {
  try {
    const rowElement = buttonElement.closest('[data-batch-row-id]');
    const rowId = rowElement?.getAttribute('data-batch-row-id');

    if (!rowElement || !rowId) {
      console.warn('⚠️ Row element not found');
      return false;
    }

    console.log(`🔍 Force validation requested for row: ${rowId}`);

    // Use unified validation coordinator
    if (window.batchEntryManager.unifiedValidationCoordinator) {
      window.batchEntryManager.unifiedValidationCoordinator.executeUnifiedValidation(rowId);
    } else {
      // Fallback to legacy validation
      if (window.batchEntryManager.validateRow) {
        window.batchEntryManager.validateRow(rowId);
      }
      // if (window.batchEntryManager.updateRowStatus) {
      //   window.batchEntryManager.updateRowStatus(rowId);
      // }
    }

    return true;

  } catch (error) {
    console.error('❌ Error validating row:', error);
    return false;
  }
};

// Initialize tooltips for unified validation UI
function initializeUnifiedValidationTooltips() {
  try {
    // Initialize Bootstrap tooltips if available
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
      const tooltipTriggerList = document.querySelectorAll('.batch-row-validation-messages [data-bs-toggle="tooltip"]');
      const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
      console.log(`✅ Initialized ${tooltipList.length} unified validation tooltips`);
    }

    // Initialize jQuery tooltips as fallback
    if (typeof $ !== 'undefined' && $.fn.tooltip) {
      $('.batch-row-validation-messages [data-toggle="tooltip"], .batch-row-validation-messages [data-bs-toggle="tooltip"]').tooltip();
    }

  } catch (error) {
    console.error('❌ Error initializing unified validation tooltips:', error);
  }
}

// Initialize tooltips when document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeUnifiedValidationTooltips);
} else {
  initializeUnifiedValidationTooltips();
}

// Re-initialize tooltips when new unified validation UI is added
if (typeof MutationObserver !== 'undefined') {
  const validationObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (node.nodeType === 1 && node.classList && node.classList.contains('batch-row-validation-messages')) {
          setTimeout(initializeUnifiedValidationTooltips, 100);
        }
      });
    });
  });

  validationObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Export label update functions
window.updateCobuLabel = updateCobuLabel;
window.initializeCobuLabel = initializeCobuLabel;
window.updateCompstoreLabel = updateCompstoreLabel;
window.initializeCompstoreLabel = initializeCompstoreLabel;

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🏷️ PHASE 3 - CAL BUTTON STATE AUTO-RESET (Task 3.1)
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Reset Cal button state when key input fields change
 * This ensures user must recalculate after changing salary or bonus type
 */
$(document).on('input change', 'input[id*="LePayroll"], input[id*="LePremium"], select[id*="BonusType"]', function () {
  const fieldId = $(this).attr('id');

  // Extract row number from field ID
  // Pattern: batchLe{N}_LePayroll or batchBg{N}_BgBonusType
  const match = fieldId.match(/batch(?:Le|Bg)(\d+)_/);

  if (match) {
    const rowNum = parseInt(match[1]);

    // Reset Cal state for this row
    if (window.batchEntryManager && typeof window.batchEntryManager.resetRowCalState === 'function') {
      window.batchEntryManager.resetRowCalState(rowNum);
      console.log(`⚠️ Row ${rowNum} input changed (${fieldId}) - Cal state reset`);
    }
  }
});

console.log('✅ Cal button state auto-reset listeners attached');

// 🌐 Make Unified Validation System globally available
window.unifiedValidationManager = batchEntryManager.unifiedValidationManager;
window.fieldProgressTracker = batchEntryManager.fieldProgressTracker;
window.fieldValidationCollector = batchEntryManager.fieldValidationCollector;
window.validationResultProcessor = batchEntryManager.validationResultProcessor;
window.unifiedValidationCoordinator = batchEntryManager.unifiedValidationCoordinator;

// 🎯 Test Unified Validation Configuration
// console.log('🔧 Testing Unified Validation Configuration...');
// console.log('UNIFIED_VALIDATION_CONFIG:', window.UNIFIED_VALIDATION_CONFIG);

if (window.UNIFIED_VALIDATION_CONFIG?.enabled) {
  // console.log('✅ Unified Validation is ENABLED');
} else {
  // console.log('❌ Unified Validation is DISABLED');
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🏁 8. MODULE COMPLETION & LOGGING
// ═══════════════════════════════════════════════════════════════════════════════════════

// console.log('🔧 Budget Events module loaded with enhanced error handling and Unified Validation System (Phase 2) - Enhanced Functions WITH INTEGRATION');
