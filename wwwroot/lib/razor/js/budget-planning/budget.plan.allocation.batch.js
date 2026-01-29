/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 📊 Allocation Batch Entry Manager
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Purpose: Manage BIGC Allocation Batch Entry Mode
 * - Multiple rows per single budget entry (1 Master Row + N Child Rows)
 * - Each row = 1 Cost Center with percentage allocation
 * - Total percentage must = 100%
 * - Row 1 (Master) = Cost Center 90066 (locked)
 * - Row 2+ (Children) = Auto-copy personal info from Row 1
 * - NO CAL buttons in rows (use "CAL ทั้งหมด" in header)
 *
 * Updated: 14 Jan 2026 - Support IIS virtual directory
 * Architecture:
 * - Pattern: Module Pattern (encapsulation)
 * - Separate from batchEntryManager (budget.plan.events.js)
 * - Reuses utilities from batchEntryManager where possible
 * - Template: #allocationBatchRowTemplate
 * - Accordion: #batchEntryAccordion (shared with normal batch)
 *
 * @version 1.0.0
 * @date 2025-10-29
 * @author SA Team
 */

const AllocationBatchManager = (function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔒 PRIVATE VARIABLES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Active allocation rows storage
   * @type {Map<number, {element: HTMLElement, data: object, isAllocation: boolean}>}
   */
  let activeAllocationRows = new Map();

  /**
   * Next row ID counter
   * @type {number}
   */
  let nextRowId = 1;

  /**
   * Initialization flag
   * @type {boolean}
   */
  let isInitialized = false;

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔧 PRIVATE HELPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Update form element names to be unique per row
   * @param {HTMLElement} rowElement - Row element
   * @param {number} rowId - Row ID
   */
  function updateRowFieldNames(rowElement, rowId) {
    console.log(`  🔧 Updating field names for row ${rowId}`);

    const formElements = rowElement.querySelectorAll('input, select, textarea');
    formElements.forEach(element => {
      if (element.name) {
        // Add row ID prefix to name
        element.name = `${rowId}_${element.name}`;
      }
      if (element.id && element.id.startsWith('allocation')) {
        element.id = `${rowId}_${element.id}`;
      }
    });
  }

  /**
   * Set default values for allocation row (Focus HC, Focus PE, Join PVF)
   * @param {HTMLElement} rowElement - Row element
   * @param {string} rowId - Row ID
   */
  function setDefaultAllocationRowValues(rowElement, rowId) {
    console.log(`  🎯 Setting default values for allocation row ${rowId}...`);

    try {
      // 1. Focus Headcount = "Y" (Yes)
      const focusHcSelect = rowElement.querySelector('.allocation-focus-hc, .batch-focus-hc, [name$="_focusHc"]');
      if (focusHcSelect) {
        focusHcSelect.value = 'Y';
        $(focusHcSelect).trigger('change');
        console.log(`    ✅ Focus HC set to "Y" (Yes)`);
      } else {
        console.warn(`    ⚠️ Focus HC dropdown not found for ${rowId}`);
      }

      // 2. Focus Personnel Expense = "Y" (Yes)
      const focusPeSelect = rowElement.querySelector('.allocation-focus-pe, .batch-focus-pe, [name$="_focusPe"]');
      if (focusPeSelect) {
        focusPeSelect.value = 'Y';
        $(focusPeSelect).trigger('change');
        console.log(`    ✅ Focus PE set to "Y" (Yes)`);
      } else {
        console.warn(`    ⚠️ Focus PE dropdown not found for ${rowId}`);
      }

      // 3. Join PVF = "0" (Never Joined)
      const joinPvfSelect = rowElement.querySelector('.allocation-join-pvf, .batch-join-pvf, [name$="_joinPvf"]');
      if (joinPvfSelect) {
        joinPvfSelect.value = '0';
        $(joinPvfSelect).trigger('change');
        console.log(`    ✅ Join PVF set to "0" (Never Joined)`);
      } else {
        console.warn(`    ⚠️ Join PVF dropdown not found for ${rowId}`);
      }

      console.log(`  ✅ Default values set successfully for ${rowId}`);
    } catch (error) {
      console.error(`  ❌ Error setting default values for ${rowId}:`, error);
    }
  }

  /**
   * Bind event listeners to allocation row
   * @param {number} rowId - Row ID
   */
  function bindAllocationRowEvents(rowId) {
    console.log(`  🎯 Binding events for row ${rowId}...`);

    const rowElement = document.querySelector(`[data-batch-row-id="batch-row-${rowId}"]`);
    if (!rowElement) {
      console.error(`  ❌ Row element not found: batch-row-${rowId}`);
      return;
    }

    // Delete row button (header has checkbox + delete selected)
    $(rowElement).find('.delete-allocation-row-btn').on('click', function () {
      deleteAllocationRow(rowId);
    });

    // Percentage input (real-time calculation)
    $(rowElement).find('.allocation-percentage').on('input', function () {
      calculateTotalAllocation();
      updateTotalAllocationBadge();
    });

    // Cost Center change (validation)
    $(rowElement).find('.allocation-cost-center').on('change', function () {
      validateNoDuplicateCostCenters();
    });

    console.log(`  ✅ Events bound to row ${rowId}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🌐 DROPDOWN POPULATION FUNCTIONS (Self-contained - No batchEntryManager dependency)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Populate single dropdown asynchronously (Low-level API caller)
   * @param {HTMLSelectElement} selectElement - Select element to populate
   * @param {string} apiUrl - API URL to fetch data from
   * @param {string} defaultText - Default option text
   * @param {Function} optionCallback - Callback to customize option element (option, item) => void
   * @returns {Promise} Promise that resolves with API data
   */
  function populateAllocationDropdownAsync(selectElement, apiUrl, defaultText, optionCallback) {
    return new Promise((resolve, reject) => {
      if (!selectElement) {
        reject(new Error('Select element not found'));
        return;
      }

      fetch(apiUrl)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
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
          console.error(`❌ Error fetching data for dropdown:`, error);
          reject(error);
        });
    });
  }

  /**
   * Populate primary dropdowns for allocation row (High-level)
   * @param {HTMLElement} rowElement - Row element
   * @param {string} rowId - Row ID (e.g., 'batch-row-1')
   * @param {string} _companyID - Pre-selected company ID
   * @param {string} _budgetYear - Pre-selected year
   * @param {string} _coBu - Pre-selected COBU
   * @param {string} _costCenter - Pre-selected cost center
   * @param {string} _division - Pre-selected division
   * @param {string} _department - Pre-selected department
   * @param {string} _section - Pre-selected section
   * @param {string} _compStore - Pre-selected compstore
   * @param {string} _position - Pre-selected position
   * @param {string} _jobBand - Pre-selected job band
   * @returns {Promise} Promise that resolves when all primary dropdowns are populated
   */
  function populateAllocationPrimaryDropdownsAsync(rowElement, rowId, _companyID, _budgetYear, _coBu, _costCenter, _division, _department, _section, _compStore, _position, _jobBand) {
    return new Promise((resolve, reject) => {
      const promises = [];

      // Company dropdown
      const companySelect = rowElement.querySelector('.batch-company, .allocation-company');
      if (companySelect) {
        const companyPromise = populateAllocationDropdownAsync(companySelect, BUDGET_API.companies, FIELD_CONFIGURATIONS.dropdownPlaceholders.company, (option, item) => {
          option.value = item.companyId;
          option.textContent = item.companyCode;
        }).then(() => {
          if (_companyID) {
            const $companySelect = $(companySelect);
            if ($companySelect.find(`option[value="${_companyID}"]`).length > 0) {
              if ($companySelect.data('select2')) {
                $companySelect.val(_companyID).trigger('change.select2');
              } else {
                companySelect.value = _companyID;
              }
              $('.batch-company, .allocation-company').prop('disabled', true);
              console.log(`  ✅ Company set: ${_companyID}`);
            }
          }
        });
        promises.push(companyPromise);
      }

      // Year dropdown
      const yearSelect = rowElement.querySelector('.batch-year, .allocation-year');
      if (yearSelect) {
        let yearParams = [];
        if (_companyID) yearParams.push(`companyID=${_companyID}`);
        const yearQuery = yearParams.length ? `?${yearParams.join('&')}` : '';

        const yearPromise = populateAllocationDropdownAsync(yearSelect, `${BUDGET_API.budgetYears}${yearQuery}`, FIELD_CONFIGURATIONS.dropdownPlaceholders.year, (option, item) => {
          option.value = item;
          option.textContent = item;
        }).then(() => {
          if (_budgetYear) {
            const $yearSelect = $(yearSelect);
            if ($yearSelect.find(`option[value="${_budgetYear}"]`).length > 0) {
              if ($yearSelect.data('select2')) {
                $yearSelect.val(_budgetYear).trigger('change.select2');
              } else {
                yearSelect.value = _budgetYear;
              }
              $('.batch-year, .allocation-year').prop('disabled', true);
              console.log(`  ✅ Year set: ${_budgetYear}`);
            }
          }
        });
        promises.push(yearPromise);
      }

      // COBU dropdown
      const cobuSelect = rowElement.querySelector('.batch-cobu, .allocation-cobu');
      if (cobuSelect) {
        let cobuParams = [];
        if (_companyID) cobuParams.push(`companyID=${_companyID}`);
        if (_budgetYear) cobuParams.push(`budgetYear=${encodeURIComponent(_budgetYear)}`);
        const cobuQuery = cobuParams.length ? `?${cobuParams.join('&')}` : '';

        const cobuPromise = populateAllocationDropdownAsync(cobuSelect, `${BUDGET_API.cobu}${cobuQuery}`, 'Select COBU/Format', (option, item) => {
          option.value = item;
          option.textContent = item;
        }).then(() => {
          if (_coBu) {
            const $cobuSelect = $(cobuSelect);
            if ($cobuSelect.find(`option[value="${_coBu}"]`).length > 0) {
              if ($cobuSelect.data('select2')) {
                $cobuSelect.val(_coBu).trigger('change.select2');
              } else {
                cobuSelect.value = _coBu;
              }
              console.log(`  ✅ COBU set: ${_coBu}`);
            }
          }
        });
        promises.push(cobuPromise);
      }

      // Add cascade dropdowns if company is selected
      if (_companyID) {
        // Cost Centers
        const costCenterSelect = rowElement.querySelector('.batch-cost-center, .allocation-cost-center');
        if (costCenterSelect) {
          let costCenterParams = [];
          if (_companyID) costCenterParams.push(`companyID=${_companyID}`);
          if (_coBu) costCenterParams.push(`Cobu=${encodeURIComponent(_coBu)}`);
          if (_budgetYear) costCenterParams.push(`budgetYear=${encodeURIComponent(_budgetYear)}`);
          const costCenterQuery = costCenterParams.length ? `?${costCenterParams.join('&')}` : '';

          const costCenterPromise = populateAllocationDropdownAsync(costCenterSelect, `${BUDGET_API.costCenters}${costCenterQuery}`, FIELD_CONFIGURATIONS.dropdownPlaceholders.costCenter, (option, item) => {
            option.value = item.costCenterCode;
            option.textContent = `${item.costCenterName} (${item.costCenterCode})`;
          }).then(() => {
            if (_costCenter) {
              const $costCenterSelect = $(costCenterSelect);
              if ($costCenterSelect.find(`option[value="${_costCenter}"]`).length > 0) {
                if ($costCenterSelect.data('select2')) {
                  $costCenterSelect.val(_costCenter).trigger('change.select2');
                } else {
                  costCenterSelect.value = _costCenter;
                }
                console.log(`  ✅ Cost center set: ${_costCenter}`);
              }
            }
          });
          promises.push(costCenterPromise);
        }

        // Divisions
        const divisionSelect = rowElement.querySelector('.batch-division, .allocation-division');
        if (divisionSelect) {
          let divisionParams = [];
          if (_companyID) divisionParams.push(`companyID=${_companyID}`);
          if (_coBu) divisionParams.push(`Cobu=${encodeURIComponent(_coBu)}`);
          if (_budgetYear) divisionParams.push(`budgetYear=${encodeURIComponent(_budgetYear)}`);
          if (_costCenter) divisionParams.push(`costCenterCode=${encodeURIComponent(_costCenter)}`);
          const divisionQuery = divisionParams.length ? `?${divisionParams.join('&')}` : '';

          const divisionPromise = populateAllocationDropdownAsync(divisionSelect, `${BUDGET_API.divisions}${divisionQuery}`, FIELD_CONFIGURATIONS.dropdownPlaceholders.division, (option, item) => {
            option.value = item;
            option.textContent = item;
          }).then(() => {
            if (_division) {
              const $divisionSelect = $(divisionSelect);
              if ($divisionSelect.find(`option[value="${_division}"]`).length > 0) {
                if ($divisionSelect.data('select2')) {
                  $divisionSelect.val(_division).trigger('change.select2');
                } else {
                  divisionSelect.value = _division;
                }
                console.log(`  ✅ Division set: ${_division}`);
              }
            }
          });
          promises.push(divisionPromise);
        }

        // Departments
        const departmentSelect = rowElement.querySelector('.batch-department, .allocation-department');
        if (departmentSelect) {
          let departmentParams = [];
          if (_companyID) departmentParams.push(`companyID=${_companyID}`);
          if (_coBu) departmentParams.push(`Cobu=${encodeURIComponent(_coBu)}`);
          if (_budgetYear) departmentParams.push(`budgetYear=${encodeURIComponent(_budgetYear)}`);
          if (_costCenter) departmentParams.push(`costCenterCode=${encodeURIComponent(_costCenter)}`);
          if (_division) departmentParams.push(`divisionCode=${encodeURIComponent(_division)}`);
          const departmentQuery = departmentParams.length ? `?${departmentParams.join('&')}` : '';

          const departmentPromise = populateAllocationDropdownAsync(departmentSelect, `${BUDGET_API.departments}${departmentQuery}`, FIELD_CONFIGURATIONS.dropdownPlaceholders.department, (option, item) => {
            option.value = item;
            option.textContent = item;
          }).then(() => {
            if (_department) {
              const $departmentSelect = $(departmentSelect);
              if ($departmentSelect.find(`option[value="${_department}"]`).length > 0) {
                if ($departmentSelect.data('select2')) {
                  $departmentSelect.val(_department).trigger('change.select2');
                } else {
                  departmentSelect.value = _department;
                }
                console.log(`  ✅ Department set: ${_department}`);
              }
            }
          });
          promises.push(departmentPromise);
        }

        // Sections
        const sectionSelect = rowElement.querySelector('.batch-section, .allocation-section');
        if (sectionSelect) {
          let sectionParams = [];
          if (_companyID) sectionParams.push(`companyID=${_companyID}`);
          if (_coBu) sectionParams.push(`Cobu=${encodeURIComponent(_coBu)}`);
          if (_budgetYear) sectionParams.push(`budgetYear=${encodeURIComponent(_budgetYear)}`);
          if (_costCenter) sectionParams.push(`costCenterCode=${encodeURIComponent(_costCenter)}`);
          if (_division) sectionParams.push(`divisionCode=${encodeURIComponent(_division)}`);
          if (_department) sectionParams.push(`departmentCode=${encodeURIComponent(_department)}`);
          const sectionQuery = sectionParams.length ? `?${sectionParams.join('&')}` : '';

          const sectionPromise = populateAllocationDropdownAsync(sectionSelect, `${BUDGET_API.sections}${sectionQuery}`, FIELD_CONFIGURATIONS.dropdownPlaceholders.section, (option, item) => {
            option.value = item;
            option.textContent = item;
          }).then(() => {
            if (_section) {
              const $sectionSelect = $(sectionSelect);
              if ($sectionSelect.find(`option[value="${_section}"]`).length > 0) {
                if ($sectionSelect.data('select2')) {
                  $sectionSelect.val(_section).trigger('change.select2');
                } else {
                  sectionSelect.value = _section;
                }
                console.log(`  ✅ Section set: ${_section}`);
              }
            }
          });
          promises.push(sectionPromise);
        }

        // CompStore
        const compstoreSelect = rowElement.querySelector('.batch-compstore, .allocation-compstore');
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

          const compstorePromise = populateAllocationDropdownAsync(compstoreSelect, `${BUDGET_API.storeNames}${compstoreQuery}`, 'Select CompStore', (option, item) => {
            option.value = item;
            option.textContent = item;
          }).then(() => {
            if (_compStore) {
              const $compstoreSelect = $(compstoreSelect);
              if ($compstoreSelect.find(`option[value="${_compStore}"]`).length > 0) {
                if ($compstoreSelect.data('select2')) {
                  $compstoreSelect.val(_compStore).trigger('change.select2');
                } else {
                  compstoreSelect.value = _compStore;
                }
                console.log(`  ✅ CompStore set: ${_compStore}`);
              }
            }
          });
          promises.push(compstorePromise);
        }

        // Positions
        const positionSelect = rowElement.querySelector('.batch-position, .allocation-position');
        if (positionSelect) {
          const positionPromise = populateAllocationDropdownAsync(positionSelect, `${SELECT_API.positions}?companyId=${_companyID}`, 'Select Position', (option, item) => {
            option.value = item.positionCode;
            option.textContent = `${item.positionName} (${item.positionCode})`;
          }).then(() => {
            if (_position) {
              const $positionSelect = $(positionSelect);
              if ($positionSelect.find(`option[value="${_position}"]`).length > 0) {
                if ($positionSelect.data('select2')) {
                  $positionSelect.val(_position).trigger('change.select2');
                } else {
                  positionSelect.value = _position;
                }
                console.log(`  ✅ Position set: ${_position}`);
              }
            }
          });
          promises.push(positionPromise);
        }

        // Job Bands
        const jobBandSelect = rowElement.querySelector('.batch-job-band, .allocation-job-band');
        if (jobBandSelect) {
          let jobBandParams = [];
          if (_companyID) jobBandParams.push(`companyId=${_companyID}`);
          if (_position) jobBandParams.push(`positionCode=${encodeURIComponent(_position)}`);
          const jobBandQuery = jobBandParams.length ? `?${jobBandParams.join('&')}` : '';

          const jobBandPromise = populateAllocationDropdownAsync(jobBandSelect, `${SELECT_API.jobBands}${jobBandQuery}`, 'Select Job Band', (option, item) => {
            option.value = item.jbCode;
            option.textContent = item.jbName;
          }).then(() => {
            if (_jobBand) {
              const $jobBandSelect = $(jobBandSelect);
              if ($jobBandSelect.find(`option[value="${_jobBand}"]`).length > 0) {
                if ($jobBandSelect.data('select2')) {
                  $jobBandSelect.val(_jobBand).trigger('change.select2');
                } else {
                  jobBandSelect.value = _jobBand;
                }
                console.log(`  ✅ Job band set: ${_jobBand}`);
              }
            }
          });
          promises.push(jobBandPromise);
        }

        // Employee Status
        const empStatusSelect = rowElement.querySelector('.batch-emp-status, .allocation-emp-status');
        if (empStatusSelect) {
          let empStatusParams = [`statusType=Budget`];
          if (_companyID) empStatusParams.push(`companyID=${_companyID}`);
          const empStatusQuery = empStatusParams.length ? `?${empStatusParams.join('&')}` : '';

          const empStatusPromise = populateAllocationDropdownAsync(empStatusSelect, `${SELECT_API.statuses}${empStatusQuery}`, 'Select Employee Status', (option, item) => {
            option.value = item.statusCode;
            option.textContent = item.statusName;
          });
          promises.push(empStatusPromise);
        }

        // Plan Cost Center
        const planCostCenterSelect = rowElement.querySelector('.batch-plan-cost-center, .allocation-plan-cost-center');
        if (planCostCenterSelect) {
          let planCostCenterParams = [];
          if (_companyID) planCostCenterParams.push(`companyID=${_companyID}`);
          const planCostCenterQuery = planCostCenterParams.length ? `?${planCostCenterParams.join('&')}` : '';

          const planCostCenterPromise = populateAllocationDropdownAsync(planCostCenterSelect, `${SELECT_API.planCostCenters}${planCostCenterQuery}`, 'Select Plan Cost Center', (option, item) => {
            option.value = item.costCenterCode;
            option.textContent = `${item.costCenterName} (${item.costCenterCode})`;
          });
          promises.push(planCostCenterPromise);
        }

        // Salary Structure
        const salaryStructureSelect = rowElement.querySelector('.batch-salary-structure, .allocation-salary-structure');
        if (salaryStructureSelect) {
          let salaryStructureParams = [];
          if (_companyID) salaryStructureParams.push(`companyID=${_companyID}`);
          if (_jobBand) salaryStructureParams.push(`jobBand=${_jobBand}`);
          const salaryStructureQuery = salaryStructureParams.length ? `?${salaryStructureParams.join('&')}` : '';

          const salaryStructurePromise = populateAllocationDropdownAsync(salaryStructureSelect, `${SELECT_API.salaryranges}${salaryStructureQuery}`, 'Select Salary Structure', (option, item) => {
            option.value = item.midSalary;
            option.textContent = item.functionName;
          });
          promises.push(salaryStructurePromise);
        }

        // Group Run Rate
        const groupRunRateSelect = rowElement.querySelector('.batch-run-rate-group, .allocation-run-rate-group');
        if (groupRunRateSelect) {
          let groupRunRateParams = [];
          if (_companyID) groupRunRateParams.push(`companyID=${_companyID}`);
          const groupRunRateQuery = groupRunRateParams.length ? `?${groupRunRateParams.join('&')}` : '';

          const groupRunRatePromise = populateAllocationDropdownAsync(groupRunRateSelect, `${SELECT_API.groupRunRates}${groupRunRateQuery}`, 'Select Group Run Rate', (option, item) => {
            option.value = item.runRateCode;
            option.textContent = `${item.runRateName}-[${item.grouping}] (${item.runRateValue}%)`;
          });
          promises.push(groupRunRatePromise);
        }
      }

      // Wait for all primary dropdowns to complete
      Promise.all(promises)
        .then(() => {
          console.log(`  ✅ [ALLOCATION] All primary dropdowns completed for ${rowId}`);
          resolve();
        })
        .catch(error => {
          console.error(`  ❌ [ALLOCATION] Error in primary dropdowns for ${rowId}:`, error);
          reject(error);
        });
    });
  }

  /**
   * Populate static dropdowns for allocation row
   * @param {HTMLElement} rowElement - Row element
   * @returns {Promise} Promise that resolves when all static dropdowns are populated
   */
  function populateAllocationStaticDropdownsAsync(rowElement) {
    return new Promise((resolve, reject) => {
      const companyID = rowElement.querySelector('.batch-company, .allocation-company')?.value;
      const promises = [];

      console.log(`  📋 [ALLOCATION] Populating static dropdowns for companyID: ${companyID}`);

      // Static dropdown mappings
      const dropdownMappings = [
        { selector: '.batch-employee-level, .allocation-employee-level', api: SELECT_API.executives, valueKey: 'itemCode', textKey: 'itemName', needsCompanyId: true },
        { selector: '.batch-focus-hc, .allocation-focus-hc', api: SELECT_API.focusHC, valueKey: 'itemCode', textKey: 'itemName', needsCompanyId: true },
        { selector: '.batch-focus-pe, .allocation-focus-pe', api: SELECT_API.focusPE, valueKey: 'itemCode', textKey: 'itemName', needsCompanyId: true },
        { selector: '.batch-emp-type, .allocation-emp-type', api: SELECT_API.employeeTypes, valueKey: 'itemCode', textKey: 'itemName', needsCompanyId: true },
        { selector: '.batch-new-hc, .allocation-new-hc', api: SELECT_API.newHC, valueKey: 'itemCode', textKey: 'itemName', needsCompanyId: true },
        { selector: '.batch-new-period, .allocation-new-period', api: SELECT_API.noOfMonths, valueKey: 'itemCode', textKey: 'itemName', needsCompanyId: true },
        { selector: '.batch-new-le-period, .allocation-new-le-period', api: SELECT_API.newLEPeriods, valueKey: 'itemCode', textKey: 'itemName', needsCompanyId: true },
        { selector: '.batch-le-no-month, .allocation-le-no-month', api: SELECT_API.leNoOfMonths, valueKey: 'itemValue', textKey: 'itemName', needsCompanyId: true },
        { selector: '.batch-no-month, .allocation-no-month', api: SELECT_API.noOfMonths, valueKey: 'itemValue', textKey: 'itemName', needsCompanyId: true },
        { selector: '.batch-join-pvf, .allocation-join-pvf', api: SELECT_API.joinPvf, valueKey: 'itemValue', textKey: 'itemName', needsCompanyId: true },
        { selector: '.batch-bonus-type, .allocation-bonus-type', api: SELECT_API.bonusTypes, valueKey: 'budgetCategory', textKey: 'budgetCategory', needsCompanyId: true, needsBudgetYear: true, isBonusType: true }
      ];

      dropdownMappings.forEach(mapping => {
        const select = rowElement.querySelector(mapping.selector);
        if (select) {
          let apiUrl = mapping.api;

          // ⭐ Build query parameters
          const params = [];
          if (mapping.needsCompanyId && companyID) {
            params.push(`companyId=${companyID}`);
          }
          if (mapping.needsBudgetYear) {
            const budgetYear = document.getElementById('yearsFilter')?.value;
            if (budgetYear) {
              params.push(`budgetYear=${budgetYear}`);
            } else {
              console.warn(`  ⚠️ [ALLOCATION] Budget Year not found for ${mapping.selector} - using current year + 1`);
              const defaultYear = new Date().getFullYear() + 1;
              params.push(`budgetYear=${defaultYear}`);
            }
          }

          // ⭐ Combine URL with parameters
          if (params.length > 0) {
            apiUrl = `${mapping.api}?${params.join('&')}`;
          }

          // ⭐ SPECIAL HANDLING for Bonus Types dropdown
          if (mapping.isBonusType) {
            const promise = populateAllocationDropdownAsync(select, apiUrl, `Select Bonus Type`, (option, item) => {
              option.value = item.rate;  // ✅ Use rate as value
              option.textContent = item.budgetCategory; // ✅ Display budgetCategory
            });
            promises.push(promise);
          } else {
            // Standard handling for other dropdowns
            const promise = populateAllocationDropdownAsync(select, apiUrl, `Select ${mapping.selector.replace('.batch-', '').replace('.allocation-', '').replace('-', ' ')}`, (option, item) => {
              option.value = item[mapping.valueKey];
              option.textContent = item[mapping.textKey];
            });
            promises.push(promise);
          }
        }
      });

      // Wait for all static dropdowns to complete
      Promise.all(promises)
        .then(() => {
          console.log(`  ✅ [ALLOCATION] All static dropdowns completed`);
          resolve();
        })
        .catch(error => {
          console.error(`  ❌ [ALLOCATION] Error in static dropdowns:`, error);
          reject(error);
        });
    });
  }

  /**
   * Populate dropdowns asynchronously for allocation row
   * Uses .then() chain pattern (same as Batch Entry) for proper sequencing
   * @param {HTMLElement} rowElement - Row element
   * @param {string} rowId - Row ID (e.g., 'batch-row-1')
   * @returns {Promise} Promise that resolves when all dropdowns are populated
   */
  function populateRowDropdownsAsync(rowElement, rowId) {
    return new Promise((resolve, reject) => {
      console.log(`  📋 [ALLOCATION] Populating dropdowns for ${rowId}...`);

      // Get filter values for pre-selection
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

      console.log('  📊 [ALLOCATION] Filter values:', {
        company: selectedCompany,
        year: selectedYear,
        cobu: selectedCobu,
        costCenter: selectedCostCenter
      });

      // 🎯 Step 1: Populate PRIMARY dropdowns with Promise chain (INDEPENDENT)
      console.log('  🔄 [ALLOCATION] Starting populateAllocationPrimaryDropdownsAsync...');

      populateAllocationPrimaryDropdownsAsync(
        rowElement,
        rowId,
        selectedCompany,
        selectedYear,
        selectedCobu,
        selectedCostCenter,
        selectedDivision,
        selectedDepartment,
        selectedSection,
        selectedCompStore,
        selectedPosition,
        selectedJobBand
      )
        .then(() => {
          console.log(`  ✅ [ALLOCATION] Primary dropdowns completed for ${rowId}`);

          // 🎯 Step 2: Setup cascading relationships (still use batchEntryManager for event binding only)
          console.log('  🔄 [ALLOCATION] Setting up cascade relationships...');
          if (typeof batchEntryManager !== 'undefined' &&
            typeof batchEntryManager.setupBatchRowCascadingRelationships === 'function') {
            batchEntryManager.setupBatchRowCascadingRelationships(rowElement, rowId);
            console.log('  ✅ [ALLOCATION] Cascade relationships setup');
          } else {
            console.warn('  ⚠️ [ALLOCATION] batchEntryManager.setupBatchRowCascadingRelationships not available');
          }

          // 🎯 Step 3: Populate static dropdowns (INDEPENDENT)
          console.log('  🔄 [ALLOCATION] Starting populateAllocationStaticDropdownsAsync...');
          return populateAllocationStaticDropdownsAsync(rowElement);
        })
        .then(() => {
          console.log(`  ✅ [ALLOCATION] Static dropdowns completed for ${rowId}`);

          // 🎯 Step 4: Set default values (Focus HC, Focus PE, Join PVF)
          console.log('  🔄 [ALLOCATION] Setting default values...');
          setDefaultAllocationRowValues(rowElement, rowId);

          console.log(`  ✅ [ALLOCATION] All dropdowns populated for ${rowId}`);
          resolve();
        })
        .catch(error => {
          console.error(`  ❌ [ALLOCATION] Error populating dropdowns for ${rowId}:`, error);
          reject(error);
        });
    });
  }

  /**
   * Update total allocation badge color and text
   */
  function updateTotalAllocationBadge() {
    const total = calculateTotalAllocation();
    const badge = $('#totalAllocationBadge');

    if (!badge.length) return;

    badge.text(`Total: ${total.toFixed(2)}%`);

    // Update color based on total
    badge.removeClass('bg-success bg-warning bg-danger text-dark text-white');

    if (total === 100) {
      badge.addClass('bg-success text-white');
    } else if (total > 100) {
      badge.addClass('bg-danger text-white');
    } else {
      badge.addClass('bg-warning text-dark');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎨 MODAL MANAGEMENT METHODS (Cloned from FUNCTION.md)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * 🎨 Update Modal Appearance (Icon + Text Color)
   * @param {HTMLElement} modalElement - Modal element
   * @param {string} type - Type: 'save', 'warning', 'error', 'success'
   */
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🗑️ REMOVED: Unused specialized modal functions
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Previously: updateModalAppearance(), showPreValidationModal(),
  //             showErrorModal(), showWarningModal(), showSuccessModal()
  //
  // ✅ NOW USING: Generic showConfirmModal() (defined below at line ~1099)
  // This eliminates duplicate code and provides consistent modal behavior
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 🎨 Update Generic Action Modal Appearance (Icon + Text Color)
   * @param {HTMLElement} modalElement - Modal element
   * @param {string} iconType - Icon type: 'save', 'warning', 'error', 'trash', 'question', 'success'
   */
  function updateActionModalAppearance(modalElement, iconType) {
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
    const svgBasePath = (window.AppConfig && window.AppConfig.baseUrl) ? window.AppConfig.baseUrl + 'lib/adcoreui/icons/svg/free.svg' : './lib/adcoreui/icons/svg/free.svg';
    if (iconElement && iconContainer && modalLabel) {
      iconElement.setAttribute('xlink:href', `${svgBasePath}${appearance.icon}`);
      iconContainer.setAttribute('class', appearance.iconClass);
      modalLabel.style.color = appearance.textColor;
    }
  }

  /**
   * 🔧 Setup Generic Action Modal Event Handlers with Cleanup
   * @param {bootstrap.Modal} modal - Bootstrap Modal instance
   * @param {HTMLElement} modalElement - Modal DOM element
   * @param {Function} onConfirm - Callback when confirmed
   * @param {Function|null} onCancel - Callback when cancelled (optional)
   */
  function setupActionModalHandlers(modal, modalElement, onConfirm, onCancel = null) {
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
  }

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
   * @param {boolean} [options.showConfirmButton=true] - Show confirm button
   */
  function showConfirmModal(options) {
    const {
      title,
      message,
      iconType = 'question',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      onConfirm,
      onCancel = null,
      showCancel = true,
      showConfirmButton = true
    } = options;

    const modalElement = document.getElementById('confirmActionModal');
    const modal = new bootstrap.Modal(modalElement);
    const modalLabel = modalElement.querySelector('#confirmActionModalLabel');
    const modalMessage = modalElement.querySelector('#confirmActionModalMessage');
    const confirmBtn = document.getElementById('confirmActionBtn');
    const cancelBtn = document.getElementById('cancelActionBtn');

    // Update appearance (icon + color)
    updateActionModalAppearance(modalElement, iconType);

    // Update content
    modalLabel.textContent = title;
    modalMessage.textContent = message;
    confirmBtn.textContent = confirmText;
    cancelBtn.textContent = cancelText;

    // Show/hide buttons
    if (showCancel) {
      cancelBtn.classList.remove('d-none');
    } else {
      cancelBtn.classList.add('d-none');
    }

    if (showConfirmButton) {
      confirmBtn.classList.remove('d-none');
    } else {
      confirmBtn.classList.add('d-none');
    }

    // Setup handlers
    setupActionModalHandlers(modal, modalElement, onConfirm, onCancel);

    // Show modal
    modal.show();
  }

  /**
   * 🎯 Helper: Highlight Validate Button
   */
  function highlightValidateButton() {
    const validateBtn = document.getElementById('validateAllocationBtn');
    if (validateBtn) {
      validateBtn.classList.add('btn-pulse');
      setTimeout(() => validateBtn.classList.remove('btn-pulse'), 3000);
    }
  }

  /**
   * 📜 Helper: Scroll to Validation Summary
   */
  function scrollToValidationSummary() {
    const container = document.getElementById('allocationValidationMessages');
    if (container) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * 📦 Collect Row Data (ASYNC)
   * Allocation version - exactly as documented in FUNCTION.md
   *
   * @param {string} rowId - Row ID (e.g., "batch-row-1")
   * @returns {Promise<Object>} - DTO object with PascalCase properties
   */
  async function collectRowData(rowId) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📦 COLLECTING DATA FOR ROW: ${rowId}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 1: GET ROW ELEMENT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log(`🔍 STEP 1: Looking for row element...`);
    const rowElement = document.querySelector(`[data-batch-row-id="${rowId}"]`);

    if (!rowElement) {
      console.error(`❌ Row element not found for rowId: ${rowId}`);
      return null;
    }

    console.log(`✅ Row element found`);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 2: GET ALL INPUT FIELDS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log(`\n🔍 STEP 2: Getting all input fields...`);
    const fields = Array.from(rowElement.querySelectorAll('input, select, textarea'));
    console.log(`✅ Found ${fields.length} fields (input + select + textarea)`);

    const data = {};

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 2.5: 🔧 FIX - COPY PERSONAL/ADDITIONAL FIELDS FROM ROW 1 (CHILD ROWS)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Child rows (row 2+) have hidden Personal/Additional fields
    // → Must copy from Master Row (row 1) to ensure data completeness
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const isChildRow = rowId !== 'batch-row-1';

    if (isChildRow) {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`👶 STEP 2.5: Child Row Detected - Copying from Master Row`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

      const masterRow = document.querySelector('[data-batch-row-id="batch-row-1"]');

      if (masterRow) {
        // List of Personal/Additional field selectors (hidden in child rows)
        // ⚠️ NOTE: Cost Center & Plan Cost Center are EXCLUDED
        //    - Cost Center: Child rows use their own Cost Center values
        //    - Plan Cost Center: Will be auto-copied from Child's own Cost Center (see STEP 2.6)
        const personalFieldSelectors = [
          '.allocation-company', '.batch-company',
          '.allocation-year', '.batch-year',
          '.allocation-emp-status', '.batch-emp-status',
          '.allocation-emp-type', '.batch-emp-type',
          // '.allocation-cost-center', '.batch-cost-center',  // ❌ REMOVED: Child rows have their own Cost Center
          '.allocation-cobu', '.batch-cobu',
          '.allocation-division', '.batch-division',
          '.allocation-department', '.batch-department',
          '.allocation-section', '.batch-section',
          '.allocation-compstore', '.batch-compstore',
          '.allocation-position', '.batch-position',
          '.allocation-salary-level', '.batch-salary-level',
          '.allocation-bonus-type', '.batch-bonus-type',
          '.allocation-head-count', '.batch-head-count',
          '.allocation-new-period', '.batch-new-period',
          '.allocation-new-vac-le', '.batch-new-vac-le',
          '.allocation-le-of-month', '.batch-le-of-month',
          '.allocation-no-of-month', '.batch-no-of-month',
          // '.allocation-plan-cost-center', '.batch-plan-cost-center',  // ❌ REMOVED: Will auto-copy from Cost Center
          '.allocation-salary-structure', '.batch-salary-structure',
          '.allocation-run-rate-group', '.batch-run-rate-group'
        ];

        console.log(`   📋 Copying ${personalFieldSelectors.length / 2} field types from Master Row...`);

        personalFieldSelectors.forEach(selector => {
          const masterField = masterRow.querySelector(selector);
          if (masterField) {
            // Add master field to fields array for processing
            fields.push(masterField);
            console.log(`   ✅ Copied: ${selector.replace('.allocation-', '').replace('.batch-', '')} = "${masterField.value}"`);
          }
        });

        console.log(`   ✅ Total fields after copy: ${fields.length}`);
      } else {
        console.error(`   ❌ Master Row (batch-row-1) not found! Cannot copy fields.`);
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // STEP 2.6: 🎯 AUTO-COPY PLAN COST CENTER FROM CHILD'S OWN COST CENTER
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // Business Logic: Plan Cost Center should equal Cost Center for each row
      // Example: Row 2 has Cost Center = 10033 → Plan Cost Center = 10033
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`🎯 STEP 2.6: Auto-Copy Plan Cost Center from Cost Center`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

      // Get Child's own Cost Center field
      const childCostCenterField = rowElement.querySelector('.allocation-cost-center, .batch-cost-center');

      if (childCostCenterField && childCostCenterField.value) {
        console.log(`   📋 Child's Cost Center: ${childCostCenterField.value}`);

        // Get Child's Plan Cost Center field
        const childPlanCostCenterField = rowElement.querySelector('.allocation-plan-cost-center, .batch-plan-cost-center');

        if (childPlanCostCenterField) {
          // Copy Cost Center value to Plan Cost Center
          childPlanCostCenterField.value = childCostCenterField.value;

          // Trigger change event for UI updates
          $(childPlanCostCenterField).trigger('change');

          console.log(`   ✅ Auto-copied: Plan Cost Center = ${childPlanCostCenterField.value} (from Cost Center)`);

          // Add Plan Cost Center field to fields array for processing
          fields.push(childPlanCostCenterField);
        } else {
          console.warn(`   ⚠️ Plan Cost Center field not found for ${rowId}`);
        }
      } else {
        console.warn(`   ⚠️ Cost Center field not found or empty for ${rowId}`);
      }

      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    } else {
      console.log(`\n   ⏭️ Master Row - Skip copying (this IS the master)`);
    }


    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 3: LOAD COMPANY-SPECIFIC FIELD MAPPING
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🏢 STEP 3: Loading company-specific Field Mapping`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    // 🔧 FIX: In Allocation Mode, fields might be hidden → use Filter value instead
    let companyId = null;

    // Try 1: Get from row field
    const companyField = rowElement.querySelector('.allocation-company, .batch-company');
    if (companyField && companyField.value && companyField.value !== '?') {
      companyId = companyField.value;
      console.log(`   ✅ Company ID from row field: ${companyId}`);
    } else {
      // Try 2: Get from Filter (Allocation rows inherit from filter)
      const companyFilter = document.getElementById('companyFilter');
      if (companyFilter && companyFilter.value) {
        companyId = companyFilter.value;
        console.log(`   ✅ Company ID from Filter: ${companyId} (field was hidden)`);
      } else {
        console.error(`   ❌ Cannot determine Company ID - field: ${companyField?.value}, filter: ${companyFilter?.value}`);
      }
    }

    let benefitsMapping = {};
    if (companyId === '1') {
      benefitsMapping = window.BJC_FIELD_MAPPING;
      console.log(`   ✅ Loaded BJC_FIELD_MAPPING (${Object.keys(benefitsMapping).length} mappings)`);
    } else if (companyId === '2') {
      benefitsMapping = window.BIGC_FIELD_MAPPING;
      console.log(`   ✅ Loaded BIGC_FIELD_MAPPING (${Object.keys(benefitsMapping).length} mappings)`);
    } else {
      console.warn(`   ⚠️ Unknown company ID: ${companyId} - No Field Mapping loaded`);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 3.5: PRE-FETCH BU CODE FOR BJC (ASYNC API CALL)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log(`\n🔍 STEP 3.5: Pre-fetching BU Code (BJC only)...`);

    let buCodeCache = null;

    if (companyId === '1') {
      const cobuField = rowElement.querySelector('.batch-cobu');
      const cobuValue = cobuField?.value;

      console.log(`   COBU Value: ${cobuValue}`);

      if (cobuValue && window.fetchBuCodeFromAPI) {
        try {
          console.log(`   🌐 Calling API: fetchBuCodeFromAPI(${companyId}, ${cobuValue})`);
          buCodeCache = await window.fetchBuCodeFromAPI(companyId, cobuValue);
          console.log(`   ✅ BU Code fetched: ${buCodeCache}`);
        } catch (error) {
          console.error(`   ❌ Failed to fetch BU Code:`, error);
        }
      } else {
        console.log(`   ⚠️ No COBU value or fetchBuCodeFromAPI not available`);
      }
    } else {
      console.log(`   ⏭️ Skipped (Not BJC)`);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 4: CONFIGURE BASIC FIELDS (30+ Fields)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`⚙️ STEP 4: Configuring basic fields`);
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
      'costCenter': {  // ← Match baseName after strip: "1_costCenter" → "costCenter"
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
      },
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 🗓️ DATE FIELDS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      'joinDate': {
        dtoName: 'JoinDate',  // Backend uses PascalCase
        dataType: 'date',
        valueSource: 'value'
      }
    };

    console.log(`📋 Base fieldConfigs created: ${Object.keys(fieldConfigs).length} fields (before benefits)`);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 5: PROCESS BENEFITS FIELDS & GENERATE CONFIGS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🔧 STEP 5: Processing benefits fields & generating configs`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    // Create a map to store transformed field names
    const benefitsFieldsMap = new Map(); // { originalId: transformedName }
    let benefitsFieldsCount = 0;

    // Process HTML fields: transform names + generate configs
    fields.forEach(field => {
      // 🔧 FIX: Use field.name OR field.id for field identification
      const fieldIdentifier = field.name || field.id;
      if (!fieldIdentifier) return;

      // 🔧 SIMPLIFIED: Unified benefits field detection (all modes)
      // Matches:
      //   - Batch Entry: "batchLe1_LePayroll", "batchBg2_BgBonus"
      //   - Allocation (ID): "batch-row-1_editLePayroll"
      //   - Allocation (Name): "1_editLePayroll"
      // Pattern: (optional prefix) + (Le|Bg) + (optional digits) + _ + (edit optional) + (Le|Bg) + FieldName
      const benefitsPattern = /(?:batch(?:Le|Bg)\d+_|(?:batch-row-\d+_)?(?:\d+_)?edit)(Le|Bg)(.+)/;
      const match = fieldIdentifier.match(benefitsPattern);

      if (match) {
        const prefix = match[1];           // "Le" or "Bg"
        const fieldNameSuffix = match[2];  // "Payroll", "Bonus"
        const fieldName = prefix + fieldNameSuffix; // "LePayroll", "BgBonus"

        console.log(`  📋 Parsed: ${fieldIdentifier} → prefix="${prefix}", fieldName="${fieldName}"`);

        // Remove Le/Bg prefix from fieldName: LePayroll → Payroll
        if (fieldName.startsWith('Le')) {
          fieldName = fieldName.substring(2);
        } else if (fieldName.startsWith('Bg')) {
          fieldName = fieldName.substring(2);
        }

        // Build frontend field key: editLePayroll
        const frontendField = `edit${prefix}${fieldName}`;

        // Lookup backend field from mapping: payrollLe
        const backendField = benefitsMapping[frontendField];

        if (!backendField) {
          console.warn(`  ⚠️ No mapping found for: ${frontendField} (skipping)`);
          return;
        }

        // Use backend field as transformed name
        const transformedName = backendField;

        // Safety check
        if (!transformedName || typeof transformedName !== 'string') {
          console.error(`❌ Invalid transformedName for ${fieldIdentifier}: ${transformedName}`);
          return;
        }

        benefitsFieldsMap.set(fieldIdentifier, transformedName);
        benefitsFieldsCount++;

        console.log(`  🎯 Transform: ${fieldIdentifier} → ${transformedName} (via ${frontendField})`);

        // Generate config if this is first occurrence of this field
        if (!fieldConfigs[fieldIdentifier]) {
          // Determine data type from backend field name
          let dataType = 'decimal'; // Default for benefits fields
          let valueSource = 'value';

          // Special case: Bonus Type fields need text (not value)
          if (transformedName.toLowerCase().includes('bonustypes')) {
            dataType = 'string';
            valueSource = 'text';
            console.log(`  🎯 Detected BonusType field: ${transformedName} → using 'text' source`);
          }
          // Other string fields (type, remark, code)
          else if (transformedName.toLowerCase().includes('type') ||
            transformedName.toLowerCase().includes('remark') ||
            transformedName.toLowerCase().includes('code')) {
            dataType = 'string';
          }

          // Convert transformedName (backend format) to DTO format (camelCase directly)
          // ✅ MATCH plan.events.js: Backend "payrollLe" → DTO "payrollLe" (no prefix move!)
          // Backend: "payrollLe" → DTO: "payrollLe" ✅
          // Backend: "bonusLe" → DTO: "bonusLe" ✅
          // Backend: "payroll" → DTO: "payroll" ✅
          const dtoName = transformedName.charAt(0).toLowerCase() + transformedName.slice(1);

          console.log(`  🔄 Backend → DTO: ${transformedName} → ${dtoName}`);

          // Create base field config using fieldIdentifier as key (not field.id!)
          fieldConfigs[fieldIdentifier] = {
            dtoName: dtoName,
            dataType: dataType,
            valueSource: valueSource
          };

          console.log(`  ✅ Config created: [${fieldIdentifier}] → dtoName="${dtoName}" (${dataType}, ${valueSource})`);
        }
      }
    });

    console.log(`\n📊 Benefits processing completed:`);
    console.log(`   - Fields transformed: ${benefitsFieldsCount}`);
    console.log(`   - Config entries created: ${Object.keys(fieldConfigs).length - 24}`); // Subtract basic fields
    console.log(`   - Total fieldConfigs: ${Object.keys(fieldConfigs).length}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 6: COLLECT FIELD DATA & BUILD DTO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📊 STEP 6: Collecting field data and building DTO`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    let processedCount = 0;

    // Helper: Extract value based on valueSource
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

    // Helper: Process single field config
    const processFieldConfig = (fieldConfig, field, baseName, isDerived = false) => {
      // Validation
      if (!fieldConfig.dtoName || typeof fieldConfig.dtoName !== 'string') {
        console.error(`❌ Invalid fieldConfig.dtoName in processFieldConfig`, fieldConfig);
        return;
      }

      // 🔧 FIX: Use camelCase instead of PascalCase for DTO fields
      const camelName = fieldConfig.dtoName.charAt(0).toLowerCase() + fieldConfig.dtoName.slice(1);
      let value = extractValue(fieldConfig.valueSource, field);

      // 🔧 FIX: Use fieldIdentifier (name OR id) to match STEP 5 storage
      const fieldIdentifier = field.name || field.id;
      const isBenefitsField = fieldIdentifier && benefitsFieldsMap.has(fieldIdentifier);

      // 🔍 DEBUG: Log DTO name transformation for benefits fields
      if (isBenefitsField) {
        console.log(`  🔍 Processing benefits field: ${fieldIdentifier}`);
        console.log(`     └─> fieldConfig.dtoName = "${fieldConfig.dtoName}"`);
        console.log(`     └─> camelName (after toLowerCase) = "${camelName}"`);
        console.log(`     └─> value = ${value}`);
      }

      // Log mapping details for basic fields
      if (!isBenefitsField && !isDerived) {
        console.log(`  📝 Basic field: ${baseName} → ${camelName} (type: ${fieldConfig.dataType}, source: ${fieldConfig.valueSource})`);
      }

      // Handle empty values
      if (value === '' || value === null || value === undefined) {
        data[camelName] = null;
        if (!isBenefitsField && !isDerived) {
          console.log(`     └─> Result: ${camelName} = null (empty)`);
        }
        return;
      }

      // Apply custom transform if exists
      if (fieldConfig.transform) {
        value = fieldConfig.transform(value, field);
      }

      // Apply maxLength truncation
      if (fieldConfig.maxLength && value && typeof value === 'string' && value.length > fieldConfig.maxLength) {
        console.warn(`⚠️ ${fieldConfig.dtoName}: Truncating "${value}" to ${fieldConfig.maxLength} chars`);
        value = value.substring(0, fieldConfig.maxLength);
      }

      // Convert data type
      switch (fieldConfig.dataType) {
        case 'int':
          const intVal = parseInt(value, 10);
          data[camelName] = isNaN(intVal) ? null : intVal;
          break;
        case 'decimal':
          const decVal = parseFloat(value);
          data[camelName] = isNaN(decVal) ? null : decVal;
          break;
        case 'boolean':
          data[camelName] = value === 'true' || value === '1' || value === true;
          break;
        case 'date':
          data[camelName] = value; // Send as ISO string
          break;
        case 'string':
        default:
          data[camelName] = value;
          break;
      }

      // Log final value
      if (isBenefitsField) {
        console.log(`     └─> FINAL: data["${camelName}"] = ${JSON.stringify(data[camelName])}`);
      } else if (!isDerived) {
        console.log(`     └─> Result: ${camelName} = ${JSON.stringify(data[camelName])}`);
      }
    };

    // Process all fields
    fields.forEach(field => {
      // 🔧 FIX: Use field.name OR field.id for field identification
      const fieldIdentifier = field.name || field.id;

      if (!fieldIdentifier || field.type === 'hidden') {
        console.log(`  ⚠️ Skipping field: no name/id or hidden type`);
        return;
      }

      // 🔧 FIX: Strip prefixes to get base field name
      let baseName = fieldIdentifier;

      // Strategy 1: Strip numeric prefix FIRST (Allocation mode: "1_company" → "company")
      if (/^\d+_/.test(baseName)) {
        baseName = baseName.replace(/^\d+_/, '');
        console.log(`  🔄 Stripped numeric prefix: ${fieldIdentifier} → ${baseName}`);
      }

      // Strategy 2: Strip rowId prefix (Regular Batch mode: "batch-row-1_company" → "company")
      baseName = baseName.replace(`${rowId}_`, '');

      // Strategy 3: Strip "batch-row-X_" prefix for Allocation mode
      baseName = baseName.replace(/^batch-row-\d+_/, '');

      let config;
      let transformedName;

      // Check if benefits field (use fieldIdentifier instead of field.id)
      if (fieldIdentifier && benefitsFieldsMap.has(fieldIdentifier)) {
        // Use fieldIdentifier to lookup config (matches STEP 5 storage)
        config = fieldConfigs[fieldIdentifier];
        transformedName = benefitsFieldsMap.get(fieldIdentifier); // 'payrollLe' for DTO
        console.log(`  🎯 Benefits field detected: ${fieldIdentifier}`);
        console.log(`     └─> transformedName="${transformedName}"`);
        console.log(`     └─> config exists=${!!config}`);
        if (config) {
          console.log(`     └─> config.dtoName="${config.dtoName}"`);
        }
      } else {
        // Basic fields use baseName
        config = fieldConfigs[baseName];
        transformedName = baseName;
      }

      if (config) {
        // CONFIGURED FIELD: Use fieldConfigs
        processFieldConfig(config, field, baseName);
        processedCount++;

        // Process derived fields (if any)
        if (config.derivedFields && Array.isArray(config.derivedFields)) {
          // 🔧 FIX: Use fieldIdentifier to match STEP 5
          const fieldIdentifier = field.name || field.id;
          if (!fieldIdentifier || !benefitsFieldsMap.has(fieldIdentifier)) {
            console.log(`     └─> Derived fields: ${config.derivedFields.length} additional field(s)`);
          }
          config.derivedFields.forEach(derivedConfig => {
            processFieldConfig(derivedConfig, field, baseName, true); // true = isDerived
          });
        }

      } else {
        // UNCONFIGURED FIELD: Use default logic (backwards compatibility)
        console.log(`  ⚠️ UNCONFIGURED field: ${field.id || field.name} → using PascalCase fallback`);
        const pascalName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
        let value = field.value;

        if(pascalName === 'BgBonusTypes'|| pascalName === 'BonusType'){
          value = field.options?.[field.selectedIndex]?.text || field.value;
        }

        if (value === '' || value === null || value === undefined) {
          data[pascalName] = null;
          return;
        }

        // Auto-detect number fields
        if (field.type === 'number' || field.dataset.type === 'number') {
          const numVal = parseFloat(value);
          data[pascalName] = isNaN(numVal) ? null : numVal;
          console.log(`     └─> FALLBACK: data["${pascalName}"] = ${data[pascalName]} (number)`);
        }
        // Auto-detect date fields
        else if (field.type === 'date' || field.dataset.type === 'date') {
          data[pascalName] = value;
          console.log(`     └─> FALLBACK: data["${pascalName}"] = "${data[pascalName]}" (date)`);
        }
        // Default: string
        else {
          data[pascalName] = value;
          console.log(`     └─> FALLBACK: data["${pascalName}"] = "${data[pascalName]}" (string)`);
        }
      }
    });

    console.log(`\n✅ Processing completed:`);
    console.log(`   - Total fields processed: ${processedCount}`);
    console.log(`   - Benefits fields transformed: ${benefitsFieldsMap.size} (from Step 5)`);
    console.log(`   - Properties in data object: ${Object.keys(data).length}`);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 7: TRANSFORM BENEFITS FIELDS (PascalCase → camelCase)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Benefits fields from CAL API come in PascalCase (LePayroll, BgPayroll)
    // Must transform to camelCase (payrollLe, payroll) for backend compatibility
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🔄 STEP 7: Transforming Benefits fields (PascalCase → camelCase)`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    let transformedCount = 0;
    // ✅ Use benefitsMapping from STEP 3 (already loaded above)

    if (benefitsMapping && Object.keys(benefitsMapping).length > 0) {
      // Get all PascalCase Le/Bg fields
      const pascalCaseFields = Object.keys(data).filter(key =>
        (key.startsWith('Le') && key.length > 2 && key !== 'LeOfMonth') ||
        (key.startsWith('Bg') && key.length > 2)
      );

      console.log(`   📋 Found ${pascalCaseFields.length} PascalCase benefits fields to transform`);

      pascalCaseFields.forEach(pascalKey => {
        // Extract prefix and field name
        // "LePayroll" → lePrefix="Le", bgFieldName="Payroll"
        // "BgBonus" → lePrefix="Bg", bgFieldName="Bonus"
        const matchResult = pascalKey.match(/^(Le|Bg)(.+)$/);
        if (!matchResult) return;

        const lePrefix = matchResult[1];  // "Le" or "Bg"
        const bgFieldName = matchResult[2]; // "Payroll", "Bonus", etc.

        // Build frontend key for mapping lookup
        const frontendKey = `edit${lePrefix}${bgFieldName}`; // "editLePayroll", "editBgBonus"

        // Lookup camelCase name from mapping
        const camelCaseName = benefitsMapping[frontendKey];

        if (camelCaseName) {
          // Copy value to camelCase key
          data[camelCaseName] = data[pascalKey];

          // Delete PascalCase key
          delete data[pascalKey];

          transformedCount++;
          console.log(`   ✅ ${pascalKey} → ${camelCaseName} = ${data[camelCaseName]}`);
        } else {
          console.warn(`   ⚠️ No mapping found for: ${frontendKey} (keeping ${pascalKey})`);
        }
      });

      console.log(`\n   📊 Transformed ${transformedCount} benefits fields to camelCase`);
    } else {
      console.warn(`   ⚠️ No benefits mapping available (companyId: ${companyId})`);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 8: AUTO-POPULATE AUDIT FIELDS (camelCase ✅)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const currentUser = window.getCurrentUser ? window.getCurrentUser() : 'DevUser';
    data.updatedBy = currentUser;  // ✅ camelCase (not UpdatedBy)
    data.updatedDate = new Date().toISOString(); // ✅ camelCase (not UpdatedDate)

    console.log(`\n🔐 Audit fields:`);
    console.log(`   - updatedBy: ${data.updatedBy}`);
    console.log(`   - updatedDate: ${data.updatedDate}`);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 9: LOGGING & VALIDATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log('\n📊 Final collected data:');
    console.log(data);

    // Log Benefits fields specifically
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

    // ✅ Validate critical fields (camelCase - matching actual field names)
    if (!data.companyId) {
      console.error('❌ Missing companyId!', {
        availableFields: Object.keys(data),
        companyField: rowElement.querySelector('.allocation-company'),
        companyValue: rowElement.querySelector('.allocation-company')?.value
      });
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✅ DATA COLLECTION COMPLETED FOR: ${rowId}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    return data;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🌐 PUBLIC API FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Initialize Allocation Batch Manager
   */
  function initialize() {
    if (isInitialized) {
      console.log('⚠️ AllocationBatchManager already initialized');
      return;
    }

    console.log('🚀 Initializing AllocationBatchManager...');

    // Setup event listeners will be done in budget.plan.events.js
    // This function is called when allocation mode is activated

    isInitialized = true;
    console.log('✅ AllocationBatchManager initialized');
  }

  /**
   * Add Allocation Batch Row (Main Function) - Promise Chain Pattern
   * - Row 1: Master Row (Cost Center 90066, locked, no percentage field)
   * - Row 2+: Child Rows (copy personal info, has percentage field)
   * @returns {Promise<number>} Promise that resolves with row ID
   */
  function addAllocationBatchRow() {
    return new Promise((resolve, reject) => {
      console.log('➕ [Allocation] Adding row...');

      // ═══════════════════════════════════════════════════════════════
      // PHASE A: INITIALIZATION
      // ═══════════════════════════════════════════════════════════════

      // ⭐ Show allocation loading overlay (using Allocation-specific function)
      if (typeof batchEntryManager !== 'undefined' &&
        typeof batchEntryManager.showAllocationLoading === 'function') {
        batchEntryManager.showAllocationLoading('Finalizing row setup...');
      }

      // Step 1: Get template and accordion
      const template = document.getElementById('allocationBatchRowTemplate');
      const accordion = document.getElementById('allocationBatchAccordion');

      if (!template) {
        console.error('❌ Template not found: #allocationBatchRowTemplate');
        // ⭐ Hide allocation loading on error
        if (typeof batchEntryManager !== 'undefined' &&
          typeof batchEntryManager.hideAllocationLoading === 'function') {
          batchEntryManager.hideAllocationLoading();
        }

        alert('❌ Template not found. Please contact administrator.');

        reject(new Error('Template not found'));
        return;
      }

      if (!accordion) {
        console.error('❌ Accordion not found: #allocationBatchAccordion');
        // ⭐ Hide allocation loading on error
        if (typeof batchEntryManager !== 'undefined' &&
          typeof batchEntryManager.hideAllocationLoading === 'function') {
          batchEntryManager.hideAllocationLoading();
        }

        alert('❌ Accordion container not found. Please contact administrator.');

        reject(new Error('Accordion not found'));
        return;
      }

      // Get empty message reference BEFORE appending row
      console.log('  🔍 Looking for empty message...');
      const emptyMessage = document.getElementById('noAllocationRowsMessage');
      if (emptyMessage) {
        console.log('  ✅ Empty message found:', emptyMessage.id);
      } else {
        console.warn('  ⚠️ Empty message not found (will continue anyway)');
      }

      // ═══════════════════════════════════════════════════════════════
      // PHASE B: CLONE & SETUP IDs
      // ═══════════════════════════════════════════════════════════════

      // Step 2: Clone template
      const rowClone = template.content.cloneNode(true);
      const rowElement = rowClone.querySelector('.accordion-item');

      if (!rowElement) {
        console.error('❌ Failed to find .accordion-item in template');
        // ⭐ Hide allocation loading on error
        if (typeof batchEntryManager !== 'undefined' &&
          typeof batchEntryManager.hideAllocationLoading === 'function') {
          batchEntryManager.hideAllocationLoading();
        }
        reject(new Error('Accordion item not found in template'));
        return;
      }

      // Step 3: Generate row ID
      const rowId = nextRowId++;
      const rowIdStr = `batch-row-${rowId}`;
      const collapseId = `collapse-${rowIdStr}`;

      rowElement.setAttribute('data-batch-row-id', rowIdStr);
      rowElement.setAttribute('data-allocation-mode', 'true');

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

      // Update row number display
      const rowNumber = rowElement.querySelector('.allocation-row-number');
      if (rowNumber) {
        rowNumber.textContent = rowId;
      }

      // Step 4: Update field names with row ID
      updateRowFieldNames(rowElement, rowId);

      // ═══════════════════════════════════════════════════════════════
      // PHASE C: APPEND & REGISTER
      // ═══════════════════════════════════════════════════════════════

      // Step 5: Hide empty message FIRST (BEFORE append)
      console.log('  📌 [Step 5] Hiding empty message...');
      if (emptyMessage) {
        emptyMessage.style.display = 'none';
        console.log('  ✅ Empty message hidden (inline style)');
      } else {
        console.warn('  ⚠️ Empty message already hidden or not found');
      }

      // Step 6: Append to accordion (AFTER hiding message)
      console.log('  📌 [Step 6] Appending row to accordion...');
      accordion.appendChild(rowElement);
      console.log('  ✅ Row appended. Accordion children count:', accordion.children.length);

      // Step 7: Register in activeRows
      console.log('  📌 [Step 7] Registering row in manager...');
      activeAllocationRows.set(rowId, {
        element: rowElement,
        isAllocation: true,
        data: {}
      });
      console.log('  ✅ Row registered in AllocationBatchManager. Active rows:', activeAllocationRows.size);

      // ✅ ALSO register in batchEntryManager for unified validation compatibility
      if (typeof batchEntryManager !== 'undefined' && batchEntryManager.activeRows) {
        batchEntryManager.activeRows.set(rowIdStr, {
          element: rowElement,
          data: {},
          isValid: false,
          isAllocation: true  // Flag to identify as allocation row
        });
        console.log('  ✅ Row also registered in batchEntryManager for validation compatibility');
      }

      // Update counter immediately
      updateRowCounter();

      // ═══════════════════════════════════════════════════════════════
      // PHASE D: POPULATE DROPDOWNS (CRITICAL - MUST COMPLETE FIRST!)
      // ═══════════════════════════════════════════════════════════════

      const isFirstRow = activeAllocationRows.size === 1;

      // Update loading message
      if (typeof batchEntryManager !== 'undefined' &&
        typeof batchEntryManager.updateBatchEntryLoadingMessage === 'function') {
        batchEntryManager.updateBatchEntryLoadingMessage('Loading dropdowns...');
      }

      // 🔑 KEY: Populate dropdowns FIRST, then do everything else in .then() chain
      populateRowDropdownsAsync(rowElement, rowIdStr)
        .then(() => {
          console.log('  ✅ [Phase D] Dropdowns populated successfully');

          // Update loading message
          if (typeof batchEntryManager !== 'undefined') {
            batchEntryManager.updateBatchEntryLoadingMessage('Configuring row...');
          }

          // ═══════════════════════════════════════════════════════════════
          // PHASE E: ROW-SPECIFIC CONFIGURATION (AFTER DROPDOWNS LOADED!)
          // ═══════════════════════════════════════════════════════════════

          if (isFirstRow) {
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // 🔵 ROW 1: MASTER ROW
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            console.log('  → Row 1 (Master): CC=90066 locked, no percentage');

            // 1. Lock Cost Center to 90066 (Wait for dropdown to be fully ready)
            const costCenterSelect = rowElement.querySelector('.allocation-cost-center, .batch-cost-center');
            if (costCenterSelect) {
              // Use setTimeout to ensure dropdown options are fully populated
              setTimeout(() => {
                // Check if option exists before setting value
                const option90066 = Array.from(costCenterSelect.options).find(opt => opt.value === '90066');

                if (option90066) {
                  // ✅ Use Select2 API to set value (critical for Select2 dropdowns!)
                  const $costCenterSelect = $(costCenterSelect);
                  if ($costCenterSelect.data('select2')) {
                    // Select2 is initialized - use Select2 API
                    $costCenterSelect.val('90066').trigger('change.select2');
                    console.log('  ✅ Cost Center locked to 90066 (via Select2 API)');
                  } else {
                    // Fallback for regular select
                    costCenterSelect.value = '90066';
                    console.log('  ✅ Cost Center locked to 90066 (via vanilla JS)');
                  }

                  // Disable and style
                  costCenterSelect.disabled = true;
                  costCenterSelect.style.backgroundColor = '#e9ecef';

                  // Also disable Select2 container
                  $costCenterSelect.next('.select2-container').addClass('select2-container--disabled');
                } else {
                  // Option not found - log warning
                  console.warn('  ⚠️ Option 90066 not found in dropdown. Available options:',
                    Array.from(costCenterSelect.options).map(opt => opt.value));
                  costCenterSelect.disabled = true;
                  costCenterSelect.style.backgroundColor = '#e9ecef';
                }
              }, 500); // Wait 500ms for Select2 to finish rendering
            } else {
              console.warn('  ⚠️ Cost Center select not found');
            }

            // 2. Hide percentage field
            const percentageField = rowElement.querySelector('.allocation-percentage-field');
            if (percentageField) {
              percentageField.classList.add('d-none');
              console.log('  ✅ Percentage field hidden');
            }

            // 3. Update badge
            const badge = rowElement.querySelector('.allocation-row-badge, .batch-row-badge');
            if (badge) {
              badge.textContent = 'Master';
              badge.classList.remove('bg-secondary', 'bg-info');
              badge.classList.add('bg-warning', 'text-dark');
            }

            // 4. Generate Benefits (NO CAL buttons)
            return new Promise((resolveBenefits) => {
              setTimeout(() => {
                if (typeof generateAllocationBenefitsFields === 'function') {
                  console.log('  🏗️ Generating benefits for Row 1...');
                  generateAllocationBenefitsFields(rowId, 'BIGC', 'LE');
                  generateAllocationBenefitsFields(rowId, 'BIGC', 'BG');
                  console.log('  ✅ Benefits generated');

                  // ⭐ NEW: Populate Benefits Dropdowns (after HTML generation)
                  setTimeout(() => {
                    const budgetYear = document.getElementById('yearsFilter')?.value;
                    const companyId = '2'; // BIGC

                    if (typeof populateAllocationBenefitsDropdowns === 'function' && budgetYear) {
                      console.log(`  📥 Populating Allocation Benefits dropdowns for Row ${rowId}...`);
                      populateAllocationBenefitsDropdowns(rowId, companyId, budgetYear);
                    } else {
                      console.warn(`  ⚠️ Cannot populate dropdowns: populateAllocationBenefitsDropdowns=${typeof populateAllocationBenefitsDropdowns}, budgetYear=${budgetYear}`);
                    }
                  }, 350); // Wait for DOM + API readiness
                }
                resolveBenefits();
              }, 300); // Small delay for dropdown settling
            });

          } else {
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // 🟢 ROW 2+: CHILD ROWS (SIMPLIFIED - Show only CC + % + Benefits)
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            console.log('  → Row 2+ (Child): Show only Cost Center + Percentage + Benefits');

            // ⭐ NEW: Hide most Personal Info fields (except Cost Center)
            const fieldsToHide = [
              '.allocation-company', '.allocation-year', '.allocation-cobu',
              '.allocation-emp-status', '.allocation-join-date', '.allocation-remark',
              '.allocation-division', '.allocation-department', '.allocation-section',
              '.allocation-compstore', '.allocation-position', '.allocation-job-band',
              '.allocation-emp-type', '.allocation-new-hc', '.allocation-new-period',
              '.allocation-new-le-period', '.allocation-le-no-month', '.allocation-no-month'
            ];

            fieldsToHide.forEach(selector => {
              const field = rowElement.querySelector(selector);
              if (field) {
                // Hide the entire form-group/col-md-X container
                const container = field.closest('.col-md-4, .col-md-12, .mb-3');
                if (container) {
                  container.classList.add('d-none');
                }
              }
            });

            console.log('  ✅ Personal info fields hidden (will inherit from Row 1 on save)');

            // ⭐ NEW: Hide Section 2 (Additional Configuration)
            const additionalConfigCard = rowElement.querySelector('.allocation-grouping-collapse');
            if (additionalConfigCard) {
              const card = additionalConfigCard.closest('.card');
              if (card) {
                card.classList.add('d-none');
                console.log('  ✅ Additional Configuration section hidden (will use Row 1 data)');
              }
            }

            // 1. Enable Cost Center (empty - user must select)
            const costCenterSelect = rowElement.querySelector('.allocation-cost-center, .batch-cost-center');
            if (costCenterSelect) {
              costCenterSelect.disabled = false;
              costCenterSelect.value = '';
              costCenterSelect.style.backgroundColor = '';
              console.log('  ✅ Cost Center enabled (empty)');
            }

            // 2. Show percentage field
            const percentageField = rowElement.querySelector('.allocation-percentage-field');
            if (percentageField) {
              percentageField.classList.remove('d-none');
              console.log('  ✅ Percentage field shown');
            }

            // 3. Update badge
            const badge = rowElement.querySelector('.allocation-row-badge, .batch-row-badge');
            if (badge) {
              badge.textContent = 'Child';
              badge.classList.remove('bg-secondary', 'bg-warning');
              badge.classList.add('bg-info');
            }

            // 4. Generate Benefits (NO CAL buttons - will be calculated via "CAL ทั้งหมด")
            return new Promise((resolveBenefits) => {
              setTimeout(() => {
                if (typeof generateAllocationBenefitsFields === 'function') {
                  console.log('  🏗️ Generating benefits for Row 2+...');
                  generateAllocationBenefitsFields(rowId, 'BIGC', 'LE');
                  generateAllocationBenefitsFields(rowId, 'BIGC', 'BG');
                  console.log('  ✅ Benefits generated (ready for CAL calculation per Cost Center)');

                  // ⭐ NEW: Populate Benefits Dropdowns (after HTML generation)
                  setTimeout(() => {
                    const budgetYear = document.getElementById('yearsFilter')?.value;
                    const companyId = '2'; // BIGC

                    if (typeof populateAllocationBenefitsDropdowns === 'function' && budgetYear) {
                      console.log(`  📥 Populating Allocation Benefits dropdowns for Row ${rowId}...`);
                      populateAllocationBenefitsDropdowns(rowId, companyId, budgetYear);
                    } else {
                      console.warn(`  ⚠️ Cannot populate dropdowns: populateAllocationBenefitsDropdowns=${typeof populateAllocationBenefitsDropdowns}, budgetYear=${budgetYear}`);
                    }
                  }, 350); // Wait for DOM + API readiness
                }
                resolveBenefits();
              }, 300);
            });
          }
        })
        .then(() => {
          // ═══════════════════════════════════════════════════════════════
          // PHASE F: FINAL SETUP (AFTER BENEFITS GENERATED!)
          // ═══════════════════════════════════════════════════════════════

          console.log('  ✅ [Phase F] Starting final setup...');

          // 1. Bind events
          bindAllocationRowEvents(rowId);
          console.log('  ✅ Events bound');

          // 2. ⭐ NEW: Accordion management based on row number
          return new Promise((resolveExpand) => {
            setTimeout(() => {
              if (isFirstRow) {
                // Row 1 (Master) → Expand automatically
                const collapseElement = document.getElementById(collapseId);
                if (collapseElement) {
                  const collapseInstance = new coreui.Collapse(collapseElement, { toggle: false });
                  collapseInstance.show();
                  console.log('  ✅ Row 1 (Master) expanded automatically');
                }
              } else {
                // Row 2+ (Child) → Collapse all previous rows, then expand current row
                // Step 1: Collapse all existing rows
                const allCollapseElements = document.querySelectorAll('#allocationBatchAccordion .accordion-collapse');
                allCollapseElements.forEach(el => {
                  if (el.classList.contains('show')) {
                    const collapseInstance = coreui.Collapse.getInstance(el) || new coreui.Collapse(el, { toggle: false });
                    collapseInstance.hide();
                  }
                });
                console.log(`  🔽 Collapsed all previous rows`);

                // Step 2: Expand current row (Row ${rowNumber})
                const collapseElement = document.getElementById(collapseId);
                if (collapseElement) {
                  const collapseInstance = new coreui.Collapse(collapseElement, { toggle: false });
                  collapseInstance.show();
                  console.log(`  ✅ Row ${rowNumber} (Child) expanded - ready for user input`);
                }
              }
              resolveExpand();
            }, 200);
          });
        })
        .then(() => {
          // 3. Initialize validation
          return new Promise((resolveValidation) => {
            setTimeout(() => {
              if (typeof batchEntryManager !== 'undefined' &&
                batchEntryManager.batchValidator &&
                typeof batchEntryManager.batchValidator.initializeRowValidation === 'function') {

                // ⭐ Only validate Row 1 (Master) - Child rows inherit data from Row 1
                if (isFirstRow) {
                  batchEntryManager.batchValidator.initializeRowValidation(rowElement, rowIdStr);
                  console.log('  ✅ Validation initialized for Row 1 (Master)');
                } else {
                  console.log('  ⏭️ Skipping batchEntryManager validation for Child row (inherits from Row 1)');
                }
              }
              resolveValidation();
            }, 100);
          });
        })
        .then(() => {
          // 4. Update UI
          updateAllocationControlsVisibility();

          // 5. Hide loading & resolve main Promise
          return new Promise((resolveFinal) => {
            setTimeout(() => {
              // ⭐ Hide allocation loading (using Allocation-specific function)
              if (typeof batchEntryManager !== 'undefined' &&
                typeof batchEntryManager.hideAllocationLoading === 'function') {
                batchEntryManager.hideAllocationLoading();
              }

              console.log(`✅ Allocation row ${rowId} ready (${activeAllocationRows.size} total)`);
              resolveFinal();
            }, 200);
          });
        })
        .then(() => {
          // Final resolve
          resolve(rowId);
        })
        .catch(error => {
          // Error handling
          console.error('❌ Error in allocation row creation:', error);
          // ⭐ Hide allocation loading on error
          if (typeof batchEntryManager !== 'undefined' &&
            typeof batchEntryManager.hideAllocationLoading === 'function') {
            batchEntryManager.hideAllocationLoading();
          }
          reject(error);
        });

    }); // End of main Promise
  }

  /**
   * Calculate Total Allocation (Real-time)
   * Sum percentages from Row 2+ only (skip Row 1)
   * @returns {number} Total percentage
   */
  function calculateTotalAllocation() {
    let total = 0;

    // Get all allocation rows
    const allocationRows = document.querySelectorAll('[data-allocation-mode="true"]');

    // Skip first row (Row 1 = Master, no percentage)
    for (let i = 1; i < allocationRows.length; i++) {
      const percentageInput = allocationRows[i].querySelector('.allocation-percentage');
      if (percentageInput) {
        const value = parseFloat(percentageInput.value) || 0;
        total += value;
      }
    }

    return total;
  }

  /**
   * Calculate All Allocation Rows (CAL ทั้งหมด Button) - NEW VERSION
   * - Single API call to fn_BudgetEstimate (Database Function)
   * - Send Master parameters + JSON Array of Child rows
   * - Database calculates ALL rows in one transaction
   * - Returns benefits for Master + all Child rows with percentage allocation
   */
  async function calculateAllAllocationRows() {
    console.log('🧮 [CAL ทั้งหมด] Starting calculation (NEW: Single Function Call)...');

    // ⭐ CLEAR used employee codes cache before generating new codes
    if (typeof clearUsedEmployeeCodes === 'function') {
      clearUsedEmployeeCodes();
    } else {
      console.warn('⚠️ clearUsedEmployeeCodes function not available (budget.plan.core.js may not be loaded)');
    }

    const allocationRows = document.querySelectorAll('[data-allocation-mode="true"]');

    if (allocationRows.length === 0) {
      alert('❌ No allocation rows to calculate');
      return;
    }

    // Disable button during calculation
    const calButton = $('#calAllAllocationBtn');
    const originalHtml = calButton.html();
    calButton.prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> Calculating...');

    try {
      // ═══════════════════════════════════════════════════════════════════
      // STEP 1: COLLECT MASTER PARAMETERS (Row 1) - Match calculateBudgetBigcEstimate
      // ═══════════════════════════════════════════════════════════════════

      const masterRow = allocationRows[0];
      const rowId = masterRow.getAttribute('data-batch-row-id'); // e.g., 'batch-row-1'
      const rowNum = rowId.replace('batch-row-', ''); // Extract number: '1'

      console.log(`📋 [Row ${rowNum}] Collecting master parameters...`);

      // Master Cost Center (Row 1: should be 90066)
      const masterCostCenter = $(masterRow).find('.allocation-cost-center').val();

      // ✅ Get LePayroll (midSalary) - MATCH calculateBudgetBigcEstimate
      const salaryField = document.getElementById(`${rowId}_editLePayroll`); //batch-row-1_editLePayroll
      const salary = parseFloat(salaryField?.value) || 0;

      // ✅ Get Premium Amount - MATCH calculateBudgetBigcEstimate
      const premiumField = document.getElementById(`${rowId}_editLePremium`); //batch-row-1_editLePremium
      const premiumAmt = parseFloat(premiumField?.value) || 0;

      // ✅ Get Company Name - MATCH calculateBudgetBigcEstimate
      const companyNameField = masterRow.querySelector(`[name="${rowNum}_company"]`); //1_company
      const companyName = companyNameField?.selectedOptions?.[0]?.text || companyNameField?.value || '';

      // ✅ Get Bonus Type (TEXT value, not ID) - MATCH calculateBudgetBigcEstimate
      const bonusTypeField = masterRow.querySelector(`[name="${rowNum}_bonusType"]`); //1_bonusType
      const bonusType = bonusTypeField?.selectedOptions?.[0]?.text || bonusTypeField?.value || '';

      // Build request parameters - EXACTLY match calculateBudgetBigcEstimate structure
      const masterParams = {
        // Base 12 parameters (BIGC compatible - MATCH calculateBudgetBigcEstimate)
        year: parseInt($('#yearsFilter').val()) || 2026,
        yearLe: parseInt($('#yearsFilter').val()) - 1 || 2025, // LE Year = Budget Year - 1
        salary: salary, // ✅ From LePayroll field
        premiumAmt: premiumAmt, // ✅ From LePremium field
        jobBand: $(masterRow).find('.allocation-job-band').val() || '',
        companyId: parseInt($(masterRow).find('.allocation-company').val()) || 2, // BIGC
        leOfMonth: parseInt($(masterRow).find('.allocation-le-no-month').val()) || 0,
        noOfMonth: parseInt($(masterRow).find('.allocation-no-month').val()) || 12,
        bonusType: bonusType, // ✅ TEXT value (e.g., 'บันทึก 2%')
        companyName: companyName, // ✅ Company value
        costCenter: masterCostCenter || '90066',
        allocateJson: null // Will be set to JSON string below
      };

      console.log('📋 Master parameters (MATCH calculateBudgetBigcEstimate):', masterParams);
      console.log(`  → salary: ${salary} (from SalaryStructure)`);
      console.log(`  → premiumAmt: ${premiumAmt} (from LePremium)`);
      console.log(`  → bonusType: ${bonusType} (TEXT value)`);
      console.log(`  → companyName: ${companyName} (from CompStore)`);

      // Validate required master parameters
      if (!masterParams.year || !masterParams.jobBand || !masterParams.costCenter) {
        throw new Error('❌ กรุณากรอกข้อมูล Year, Job Band, และ Cost Center ใน Row 1 ก่อน');
      }

      if (salary <= 0) {
        throw new Error('❌ กรุณากรอก Salary (Payroll LE) ก่อนคำนวณ');
      }

      if (bonusType === 'Select Bonus Types' || bonusType === 'Select Bonus Type' || !bonusType) {
        throw new Error('❌ กรุณาเลือก Bonus Type ก่อนคำนวณ');
      }

      // ═══════════════════════════════════════════════════════════════════
      // STEP 2: COLLECT CHILD ROWS DATA (Row 2+) → Build JSON Array
      // ═══════════════════════════════════════════════════════════════════

      const childRows = [];

      // ⭐ Generate SHARED employee code ONCE (1 person → N cost centers)
      const sharedEmpCode = (typeof generateEmployeeCode === 'function')
        ? generateEmployeeCode()
        : `e${Date.now().toString(36)}`; // Fallback if core.js not loaded

      console.log(`🔑 Shared employee code: ${sharedEmpCode} (will be used for all ${allocationRows.length - 1} child rows)`);

      // Skip first row (Master), collect Row 2+
      for (let i = 1; i < allocationRows.length; i++) {
        const rowElement = allocationRows[i];
        const costCenter = $(rowElement).find('.allocation-cost-center').val();
        const percentage = parseFloat($(rowElement).find('.allocation-percentage').val()) || 0;

        if (!costCenter) {
          console.warn(`⚠️ Row ${i + 1}: No cost center selected, skipping`);
          continue;
        }

        // Build child row object (matching SQL format)
        childRows.push({
          emp_code: sharedEmpCode + `_${i}`, // ✅ SHARED: Same code for all rows (e.g., "e0k3z9a")
          cost_center: costCenter,
          rate: percentage
        });
      }

      console.log(`📦 Collected ${childRows.length} child rows:`, childRows);

      // Validate child rows
      if (childRows.length === 0) {
        throw new Error('❌ No child rows with cost centers. Please add at least one allocation row.');
      }

      // Validate total percentage = 100%
      const totalPercentage = childRows.reduce((sum, row) => sum + row.rate, 0);
      if (Math.abs(totalPercentage - 100) > 0.01) { // Allow 0.01 tolerance for floating point
        throw new Error(`❌ Total allocation must be 100% (current: ${totalPercentage.toFixed(2)}%)`);
      }

      // ═══════════════════════════════════════════════════════════════════
      // STEP 3: CALL API (Use existing BIGC endpoint with allocateJson)
      // ═══════════════════════════════════════════════════════════════════

      console.log('🌐 Calling API: BUDGET_API.calBIGCbenefits (with allocateJson)...');

      // Build request payload - MATCH calculateBudgetBigcEstimate structure
      const requestPayload = {
        ...masterParams,
        allocateJson: JSON.stringify(childRows) // 🔑 KEY: JSON string instead of null
      };

      console.log('📤 Request payload:', requestPayload);
      console.log(`📊 Allocation mode: ${childRows.length} child rows with total ${totalPercentage.toFixed(2)}%`);

      // Call API - Use existing BIGC endpoint (same as Batch Entry)
      const response = await fetch(BUDGET_API.calBIGCbenefits, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      console.log('📥 API Response:', result);

      // ═══════════════════════════════════════════════════════════════════
      // STEP 4: FILL BENEFITS FIELDS (All Rows) - MATCH calculateBudgetBigcEstimate
      // ═══════════════════════════════════════════════════════════════════

      if (!result.success || !result.data || result.data.length === 0) {
        throw new Error('No data returned from calculation');
      }

      // Result should contain N+1 rows (1 Master + N Children)
      const benefitsData = result.data;

      console.log(`📊 Processing ${benefitsData.length} rows of benefits data...`);

      // Fill benefits for each row using BIGC field structure
      benefitsData.forEach((benefits, index) => {
        const rowElement = allocationRows[index];

        if (!rowElement) {
          console.warn(`⚠️ Row ${index + 1}: Element not found, skipping`);
          return;
        }

        // Get row ID for field naming
        const rowId = rowElement.getAttribute('data-batch-row-id');
        const rowNum = rowId.replace('batch-row-', '');

        console.log(`  📝 Filling benefits for Row ${index + 1} (rowNum: ${rowNum})...`);

        // ═══════════════════════════════════════════════════════════════
        // Fill LE Benefits (26 fields) - MATCH BIGC structure
        // ═══════════════════════════════════════════════════════════════
        const leFields = [
          { suffix: 'LePayroll', value: benefits.payrollLe },
          { suffix: 'LePremium', value: benefits.premiumLe }, //batch-row-1_editLePremium
          { suffix: 'LeTotalPayroll', value: benefits.totalPayrollLe }, //batch-row-1_editLeTotalPayroll
          { suffix: 'LeBonus', value: benefits.bonusLe },
          { suffix: 'LeFleetCardPe', value: benefits.fleetCardPeLe },
          { suffix: 'LeCarAllowance', value: benefits.carAllowanceLe },
          { suffix: 'LeLicenseAllowance', value: benefits.licenseAllowanceLe },
          { suffix: 'LeHousingAllowance', value: benefits.housingAllowanceLe },
          { suffix: 'LeGasolineAllowance', value: benefits.gasolineAllowanceLe },
          { suffix: 'LeWageStudent', value: benefits.wageStudentLe },
          { suffix: 'LeCarRentalPe', value: benefits.carRentalPeLe },
          { suffix: 'LeSkillPayAllowance', value: benefits.skillPayAllowanceLe },
          { suffix: 'LeOtherAllowance', value: benefits.otherAllowanceLe },
          { suffix: 'LeSocialSecurity', value: benefits.socialSecurityLe },
          { suffix: 'LeLaborFundFee', value: benefits.laborFundFeeLe },
          { suffix: 'LeOtherStaffBenefit', value: benefits.otherStaffBenefitLe },
          { suffix: 'LeProvidentFund', value: benefits.providentFundLe },
          { suffix: 'LeProvision', value: benefits.provisionLe },
          { suffix: 'LeInterest', value: benefits.interestLe },
          { suffix: 'LeStaffInsurance', value: benefits.staffInsuranceLe },
          { suffix: 'LeMedicalExpense', value: benefits.medicalExpenseLe },
          { suffix: 'LeMedicalInHouse', value: benefits.medicalInhouseLe },
          { suffix: 'LeTraining', value: benefits.trainingLe },
          { suffix: 'LeLongService', value: benefits.longServiceLe },
          { suffix: 'LePeSbMth', value: benefits.peSbMthLe },
          { suffix: 'LePeSbYear', value: benefits.peSbYearLe },
          { suffix: 'LePeMth', value: benefits.peMthLe },
          { suffix: 'LePeYear', value: benefits.peYearLe }
        ];

        leFields.forEach(field => {
          const fieldId = `${rowId}_edit${field.suffix}`;
          const fieldElement = document.getElementById(fieldId);
          if (fieldElement && field.value !== null && field.value !== undefined) {
            fieldElement.value = field.value;
          }
        });

        // ═══════════════════════════════════════════════════════════════
        // Fill BG Benefits (26 fields) - MATCH BIGC structure
        // ═══════════════════════════════════════════════════════════════
        const bgFields = [
          { suffix: 'BgPayroll', value: benefits.payroll },//batch-row-1_editBgPayroll
          { suffix: 'BgPremium', value: benefits.premium },
          { suffix: 'BgTotalPayroll', value: benefits.totalPayroll },
          { suffix: 'BgBonus', value: benefits.bonus },
          { suffix: 'BgFleetCardPe', value: benefits.fleetCardPe },
          { suffix: 'BgCarAllowance', value: benefits.carAllowance },
          { suffix: 'BgLicenseAllowance', value: benefits.licenseAllowance },
          { suffix: 'BgHousingAllowance', value: benefits.housingAllowance },
          { suffix: 'BgGasolineAllowance', value: benefits.gasolineAllowance },
          { suffix: 'BgWageStudent', value: benefits.wageStudent },
          { suffix: 'BgCarRentalPe', value: benefits.carRentalPe },
          { suffix: 'BgSkillPayAllowance', value: benefits.skillPayAllowance },
          { suffix: 'BgOtherAllowance', value: benefits.otherAllowance },
          { suffix: 'BgSocialSecurity', value: benefits.socialSecurity },
          { suffix: 'BgLaborFundFee', value: benefits.laborFundFee },
          { suffix: 'BgOtherStaffBenefit', value: benefits.otherStaffBenefit },
          { suffix: 'BgProvidentFund', value: benefits.providentFund },
          { suffix: 'BgProvision', value: benefits.provision },
          { suffix: 'BgInterest', value: benefits.interest },
          { suffix: 'BgStaffInsurance', value: benefits.staffInsurance },
          { suffix: 'BgMedicalExpense', value: benefits.medicalExpense },
          { suffix: 'BgMedicalInHouse', value: benefits.medicalInhouse },
          { suffix: 'BgTraining', value: benefits.training },
          { suffix: 'BgLongService', value: benefits.longService },
          { suffix: 'BgPeSbMth', value: benefits.peSbMth },
          { suffix: 'BgPeSbYear', value: benefits.peSbYear },
          { suffix: 'BgPeMth', value: benefits.peMth },
          { suffix: 'BgPeYear', value: benefits.peYear }
        ];

        bgFields.forEach(field => {
          const fieldId = `${rowId}_edit${field.suffix}`;
          const fieldElement = document.getElementById(fieldId);
          if (fieldElement && field.value !== null && field.value !== undefined) {
            fieldElement.value = field.value;
          }
        });

        if (bonusType) {  // ← ใช้ bonusType ที่ดึงมาแล้ว (TEXT)
          const bonusTypeFieldId = `${rowId}_editBgBonusTypes`;
          const bonusTypeFieldElement = document.getElementById(bonusTypeFieldId);

          if (bonusTypeFieldElement && bonusTypeFieldElement.tagName === 'SELECT') {
            // Find option ที่มี text ตรงกับ bonusType
            let found = false;
            const options = bonusTypeFieldElement.options;

            for (let i = 0; i < options.length; i++) {
              if (options[i].text.trim() === bonusType.trim()) {
                // ✅ FIX: Set selectedIndex to select the option
                bonusTypeFieldElement.selectedIndex = i;

                // ✅ Trigger change event for Select2 compatibility
                $(bonusTypeFieldElement).trigger('change');

                found = true;
                console.log(`  ✅ Set Bonus Type: "${bonusType}" (option index ${i})`);
                break;
              }
            }

            if (!found) {
              console.warn(`  ⚠️ Bonus Type "${bonusType}" not found in options, keeping original value`);
            }
          }

        }

        console.log(`  ✅ Row ${index + 1}: Benefits filled (CC: ${benefits.costCenter || masterCostCenter}, Rate: ${benefits.rate || 0}%)`);
      });

      // Re-enable button
      calButton.prop('disabled', false).html(originalHtml);

      // Show success
      console.log(`🧮 [CAL ทั้งหมด] Complete: ${benefitsData.length} rows calculated successfully`);
      alert(`✅ คำนวณสำเร็จทั้งหมด ${benefitsData.length} rows (1 Master + ${benefitsData.length - 1} Children)`);

    } catch (error) {
      // Error handling
      console.error('❌ Calculation error:', error);

      // Re-enable button
      calButton.prop('disabled', false).html(originalHtml);

      // Show error
      alert(`❌ เกิดข้อผิดพลาดในการคำนวณ:\n${error.message}`);
    }
  }

  /**
   * Save Allocation Batch (บันทึกทั้งหมด Button)
   * ENHANCED: Modal-based validation flow (matching saveBatchEntry pattern from FUNCTION.md)
   * - Pre-validation check
   * - Allocation-specific validations (Total=100%, No duplicates, Bonus Type)
   * - Modal-based error/warning/success display
   * - Auto-close after success
   */
  async function saveAllocationBatch() {
    console.log('💾 [Allocation Save] Starting enhanced save process...');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 STEP 0: Check if rows exist
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const allocationRows = document.querySelectorAll('[data-allocation-mode="true"]');
    if (allocationRows.length === 0) {
      showConfirmModal({
        title: 'ไม่มีข้อมูล',
        message: 'ไม่พบข้อมูล Allocation Batch ให้บันทึก\n\nกรุณาเพิ่มแถวก่อนบันทึก',
        iconType: 'warning',
        confirmText: 'ตรวจสอบ',
        showCancel: false
      });
      return;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 STEP 1: Check if validation has been performed
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const hasValidationResults = document.querySelector('#allocationValidationMessages .alert');

    if (!hasValidationResults) {
      // ✅ Show pre-validation warning using generic modal
      showConfirmModal({
        title: 'ยังไม่ได้ตรวจสอบความถูกต้อง',
        message: 'แนะนำให้กดปุ่ม "ตรวจสอบทั้งหมด" ก่อนบันทึก\n\nต้องการดำเนินการตรวจสอบและบันทึกหรือไม่?',
        iconType: 'warning',
        confirmText: 'ตรวจสอบและบันทึก',
        cancelText: 'ยกเลิก',
        onConfirm: () => proceedWithAllocationSave(),
        onCancel: () => highlightValidateButton()
      });
      return;
    }

    // Continue to save
    proceedWithAllocationSave();
  }

  /**
   * 🔄 Proceed with Allocation Save (after pre-validation check)
   * Runs allocation-specific validations and handles save flow
   */
  async function proceedWithAllocationSave() {
    console.log('🔄 [Allocation Save] Running allocation validations...');

    const allocationRows = document.querySelectorAll('[data-allocation-mode="true"]');
    const errors = [];
    const warnings = [];

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 STEP 2: ALLOCATION-SPECIFIC VALIDATIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // 2.1 Validate Total = 100%
    const total = calculateTotalAllocation();
    if (Math.abs(total - 100) > 0.01) {
      errors.push(`Total allocation must be 100% (current: ${total.toFixed(2)}%)`);
    }

    // 2.2 Validate No Duplicate Cost Centers
    if (!validateNoDuplicateCostCenters()) {
      errors.push('Duplicate Cost Centers detected - please use unique Cost Centers for each row');
    }

    // 2.3 Validate All Rows Have Cost Center
    const emptyRows = [];
    allocationRows.forEach((row, index) => {
      const costCenter = $(row).find('.allocation-cost-center').val();
      if (!costCenter) {
        emptyRows.push(index + 1);
      }
    });

    if (emptyRows.length > 0) {
      errors.push(`Rows without Cost Center: ${emptyRows.join(', ')}`);
    }

    // 2.4 Validate Bonus Type in Row 1 (Master Row)
    const row1Element = allocationRows[0];
    const bonusTypeSelect = $(row1Element).find('.allocation-bonus-type');
    const bonusTypeValue = bonusTypeSelect.val();
    console.log(`  🔍 Row 1 Bonus Type value: ${bonusTypeValue} row1Element: ${row1Element} bonusTypeSelect: ${bonusTypeSelect}`);

    if (!bonusTypeValue || bonusTypeValue === '') {
      errors.push('Row 1 (Master): Bonus Types is required');

      // Focus to the field for user convenience
      bonusTypeSelect.focus();
      bonusTypeSelect.closest('.col-md-4, .mb-3').addClass('has-error');
      setTimeout(() => {
        bonusTypeSelect.closest('.col-md-4, .mb-3').removeClass('has-error');
      }, 3000);
    }

    // 2.5 Check if only Master row exists (warning)
    if (allocationRows.length === 1) {
      warnings.push('Only Master row exists - no allocation distribution will occur');
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 STEP 3: Handle Validation Errors (BLOCKING)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (errors.length > 0) {
      console.warn(`❌ Allocation validation failed: ${errors.length} errors`);

      const errorMessage = `พบข้อผิดพลาด ${errors.length} รายการ:\n\n${errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}\n\nกรุณาแก้ไขข้อผิดพลาดก่อนบันทึกข้อมูล`;

      showConfirmModal({
        title: 'พบข้อผิดพลาด',
        message: errorMessage,
        iconType: 'error',
        confirmText: 'ตรวจสอบ',
        showCancel: false,
        onConfirm: () => scrollToValidationSummary()
      });

      return; // BLOCKED
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 STEP 4: Handle Warnings (CONFIRM)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (warnings.length > 0) {
      console.log(`⚠️ Found ${warnings.length} warnings`);

      const warningMessage = `พบคำเตือน ${warnings.length} รายการ:\n\n${warnings.map((w, i) => `${i + 1}. ${w}`).join('\n')}\n\nคำเตือนเหล่านี้ไม่ขัดขวางการบันทึก แต่ควรตรวจสอบ\n\nต้องการบันทึกข้อมูลต่อหรือไม่?`;

      showConfirmModal({
        title: 'พบคำเตือน',
        message: warningMessage,
        iconType: 'warning',
        confirmText: 'บันทึกต่อ',
        cancelText: 'ยกเลิก',
        onConfirm: () => proceedWithAllocationDataCollection(),
        onCancel: () => console.log('💭 User cancelled save due to warnings')
      });
      return; // Wait for user response
    }

    console.log(`  ✅ Bonus Type validated: ${bonusTypeValue}`);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 STEP 5: Proceed with data collection and save
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    proceedWithAllocationDataCollection();
  }

  /**
   * 📦 Proceed with Allocation Data Collection and Save
   * Collects Master-Child inheritance data and calls API
   */
  async function proceedWithAllocationDataCollection() {
    console.log('📦 [Allocation Save] Collecting data from all allocation rows...');

    const allocationRows = document.querySelectorAll('[data-allocation-mode="true"]');

    // ═══════════════════════════════════════════════════════════════════
    // 🆕 STEP 0: Load Field Mapping (BJC vs BIGC) - CRITICAL FIX!
    // ═══════════════════════════════════════════════════════════════════
    console.log('📋 [Field Mapping] Loading field mappings...');

    // Get company ID from filter to determine BJC vs BIGC
    const companyId = parseInt($('#companyFilter').val());
    const isBigc = (companyId === 2);

    // Load appropriate Field Mapping (BJC: 94 fields, BIGC: 58 fields)
    const benefitsMapping = isBigc ? BIGC_FIELD_MAPPING : BJC_FIELD_MAPPING;

    if (!benefitsMapping) {
      const errorMsg = '❌ Field Mapping not loaded! Check budget.plan.config.js is included in HTML.';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    // ═══════════════════════════════════════════════════════════════════
    // 🆕 STEP 1: Show "Preparing Save" Message (Added from plan.events.js)
    // ═══════════════════════════════════════════════════════════════════
    const container = document.getElementById('allocationValidationMessages');
    if (container) {
      const preparingDiv = document.createElement('div');
      preparingDiv.className = 'alert alert-info mt-2';
      preparingDiv.id = 'preparing-allocation-save-message';
      preparingDiv.innerHTML = `
      <h6 class="alert-heading"><i class="fas fa-check-circle me-2"></i>Ready to Save!</h6>
      <p class="mb-2">All validation passed. Preparing to save ${allocationRows.length} allocation rows...</p>
      <small class="text-muted">Collecting data using Master-Child inheritance pattern...</small>
    `;
      container.appendChild(preparingDiv);
    }

    // ═══════════════════════════════════════════════════════════════════
    // 🆕 STEP 2: Smart Loading Message (Added from plan.events.js)
    // ═══════════════════════════════════════════════════════════════════
    const loadingMessage = allocationRows.length > 20
      ? 'กำลังตรวจสอบข้อมูลซ้ำและบันทึก... (อาจใช้เวลานาน)'
      : 'กำลังตรวจสอบข้อมูลซ้ำและบันทึก...';

    // Show loading modal (WITHOUT buttons - pure loading state)
    showConfirmModal({
      title: 'กำลังดำเนินการ',
      message: loadingMessage,
      iconType: 'save',
      showConfirmButton: false,  // 🆕 Hide confirm button during loading
      showCancel: false
    });

    // ═══════════════════════════════════════════════════════════════════
    // STEP 3: COLLECT DATA (Using collectRowData system with Master-Child pattern)
    // ═══════════════════════════════════════════════════════════════════

    console.log(`📤 Collecting data from ${allocationRows.length} rows using collectRowData system...`);

    const batchData = [];
    let row1Data = null; // Store Row 1 data for inheritance

    // ✅ NEW: Use async/await pattern to collect data properly
    for (let index = 0; index < allocationRows.length; index++) {
      const rowElement = allocationRows[index];
      const rowId = rowElement.getAttribute('data-batch-row-id'); // e.g., 'batch-row-1'

      const costCenter = $(rowElement).find('.allocation-cost-center, .batch-cost-center').val();
      if (!costCenter) {
        console.warn(`⚠️ Row ${index + 1}: No cost center, skipping`);
        continue;
      }

      if (index === 0) {
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 🔵 ROW 1 (MASTER): Use collectRowData for complete field collection
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        console.log('  📋 [Row 1 Master] Collecting full data via collectRowData...');

        // ✅ Call collectRowData from AllocationBatchManager (OUR OWN FUNCTION!)
        try {
          row1Data = await collectRowData(rowId);

          if (!row1Data) {
            throw new Error('collectRowData returned null');
          }
          console.log('  ✅ [Row 1 Master] Full data collected:', row1Data);

          // ⭐ collectRowData() already returns PascalCase with Field Mapping applied!
          // No need to transform again - data is ready to use

          // ⭐ Add Allocation-specific fields (use camelCase for consistency)
          row1Data.allocationPercentage = null; // Master has no percentage
          row1Data.isAllocationMode = true;
          row1Data.isAllocationMaster = true;  // ← camelCase (not PascalCase!)

          console.log('  ✅ [Row 1 Master] Data collected successfully');
          console.log(`  📊 Fields collected: ${Object.keys(row1Data).length}`);

        } catch (error) {
          console.error('❌ Failed to collect Row 1 data:', error);
          throw new Error(`Failed to collect Master row data: ${error.message}`);
        }

        batchData.push(row1Data);

      } else {
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 🟢 ROW 2+ (CHILD): Collect OWN Benefits + Inherit Personal fields from Master
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        console.log(`  📋 [Row ${index + 1} Child] Collecting data via collectRowData...`);

        // 🔑 FIX: Child rows MUST call collectRowData to get their OWN Benefits
        // Benefits come from CAL API response → populated in Child row DOM → collected here
        let childRowData = null;

        try {
          childRowData = await collectRowData(rowId);

          if (!childRowData) {
            throw new Error('collectRowData returned null');
          }
          console.log(`  ✅ [Row ${index + 1} Child] Data collected successfully`);
          console.log(`  📊 Fields collected: ${Object.keys(childRowData).length}`);
        } catch (error) {
          console.error(`❌ Failed to collect Row ${index + 1} data:`, error);
          throw new Error(`Failed to collect Child row ${index + 1} data: ${error.message}`);
        }

        // Get Percentage
        const allocationPercentage = parseFloat($(rowElement).find('.allocation-percentage').val() || 0);

        // ⭐ SELECTIVE INHERITANCE STRATEGY (SMART OVERRIDE):
        // Copy ONLY Personal/Additional fields from Master (NO Benefits)
        // Keep Child's own Benefits (from collectRowData above)
        // PREVENT null/undefined override for protected fields (jobBand, position, etc.)

        // 🛡️ Define protected fields that should NOT be overridden by null/undefined
        const protectedFields = [
          'jobBand',           // Job Band must inherit from Master
          'positionCode',      // Position must inherit
          'positionName',
          'salaryStructure',   // Salary Structure
          'runrateCode',       // Runrate Code
          'discount',          // Discount
          'focusHc',           // Focus HC
          'focusPe',           // Focus PE
          'joinPvf',           // Join PVF
          'pvf',               // PVF
          'executive',         // Executive Level
          'empTypeCode',       // Employee Type
          'joinDate'           // Join Date (must inherit from Master)
        ];

        const childData = {
          // ─────────────────────────────────────────────────────────────
          // STEP 1: Copy ONLY Personal/Additional fields from Master
          // ─────────────────────────────────────────────────────────────
          // Company & Year
          companyId: row1Data.companyId,
          companyCode: row1Data.companyCode,
          budgetYear: row1Data.budgetYear,
          budgetYearLe: row1Data.budgetYearLe,

          // Employee Info
          empStatus: row1Data.empStatus,
          empCode: row1Data.empCode,              // ✅ Share same empCode
          empTypeCode: row1Data.empTypeCode,

          // Organization Structure
          cobu: row1Data.cobu,
          bu: row1Data.bu,
          division: row1Data.division,
          department: row1Data.department,
          section: row1Data.section,
          storeName: row1Data.storeName,

          // Position & Job Band
          positionCode: row1Data.positionCode,
          positionName: row1Data.positionName,
          jobBand: row1Data.jobBand,

          // New HC & Period
          newHcCode: row1Data.NewHcCode,
          newPeriod: row1Data.NewVacPeriod,
          newVacLe: row1Data.NewVacLe,
          leOfMonth: row1Data.LeOfMonth,
          noOfMonth: row1Data.NoOfMonth,

          // Salary & Runrate
          salaryStructure: row1Data.salaryStructure,
          runrateCode: row1Data.runrateCode,
          discount: row1Data.discount,

          // Focus & Executive
          joinPvf: row1Data.joinPvf,
          pvf: row1Data.pvf,
          focusHc: row1Data.focusHc,
          focusPe: row1Data.focusPe,
          employeeLevel: row1Data.executive,

          // YOS (Year of Service)
          yosCurrYear: row1Data.yosCurrYear,
          yosNextYear: row1Data.yosNextYear,

          // Reason & Plan
          reason: row1Data.reason,
          //costCenterPlan: row1Data.costCenterPlan,

          // ─────────────────────────────────────────────────────────────
          // STEP 2: Selective Override with Child-specific data
          // ─────────────────────────────────────────────────────────────
          //Only override with values that are NOT null/undefined
          ...Object.fromEntries(
            Object.entries(childRowData).filter(([key, value]) => {
              // Always allow these Child-specific fields (even if null)
              const alwaysOverride = ['costCenterCode', 'costCenterName'];
              if (alwaysOverride.includes(key)) {
                return true;
              }
              console.log(`key ${key} value ${value}`);
              // For other fields: only override if value is truthy
              return value !== null && value !== undefined && value !== '';
            })
          ),

          // ─────────────────────────────────────────────────────────────
          // STEP 3: Restore protected fields if Child overrode with null
          // ─────────────────────────────────────────────────────────────
          // Use Nullish Coalescing to restore Master value if Child is null
          ...Object.fromEntries(
            protectedFields.map(field => [
              field,
              childRowData[field] ?? row1Data[field]  // Use Master if Child is null/undefined
            ])
          ),

          // ─────────────────────────────────────────────────────────────
          // STEP 4: Set allocation-specific fields
          // ─────────────────────────────────────────────────────────────
          allocationPercentage: allocationPercentage,
          isAllocationMode: true,
          isAllocationMaster: false,

          // Audit fields (use Child's timestamp)
          updatedBy: childRowData.updatedBy || row1Data.updatedBy,
          updatedDate: childRowData.updatedDate || row1Data.updatedDate
        };

        console.log(`  ✅ [Row ${index + 1} Child] Data merged (Inherited Personal + Own Benefits)`);
        console.log(`  📊 Final fields: ${Object.keys(childData).length}`);
        console.log(`  💰 Final Benefits sample:`, {
          payrollLe: childData.payrollLe,    // ✅ From Child (NOT Master)
          payroll: childData.payroll,        // ✅ From Child (NOT Master)
          costCenterCode: childData.costCenterCode,  // ✅ From Child
          percentage: childData.allocationPercentage // ✅ From Child
        });
        console.log('childData', childData);
        batchData.push(childData);
      }
    }

    console.log(`📦 Collected ${batchData.length} budget entries (1 Master + ${batchData.length - 1} Children)`);
    console.log('📊 Data structure:', {
      total: batchData.length,
      master: batchData.filter(d => d.isAllocationMaster).length,
      children: batchData.filter(d => !d.isAllocationMaster).length
    });

    // ═══════════════════════════════════════════════════════════════════
    // 🆕 VALIDATION: Check for wrong field names before API call (CRITICAL!)
    // ═══════════════════════════════════════════════════════════════════
    console.log('🔍 Validating field names before API call...');

    let hasFieldErrors = false;

    batchData.forEach((row, index) => {
      // 📋 LOG: Show ALL field names in DTO for inspection
      const allFieldNames = Object.keys(row);
      console.log(`\n📝 Row ${index + 1}: Field Names in DTO (${allFieldNames.length} total):`);
      console.log(`   All fields:`, allFieldNames);

      // 🔍 SEPARATE: Show benefits fields only (for easier inspection)
      const benefitsFields = allFieldNames.filter(key =>
        key.toLowerCase().includes('payroll') ||
        key.toLowerCase().includes('bonus') ||
        key.toLowerCase().includes('fleet') ||
        key.toLowerCase().includes('allowance') ||
        key.toLowerCase().includes('expense')
      );
      console.log(`   📊 Benefits fields (${benefitsFields.length}):`, benefitsFields);

      // 🚨 SEPARATE: Show camelCase Le/Bg fields (CORRECT format: lePayroll, bgBonus)
      const camelCaseLeBgFields = allFieldNames.filter(key =>
        (key.startsWith('le') || key.startsWith('bg')) &&
        key.length > 2 &&
        key !== 'LeOfMonth' &&
        key.charAt(0) === key.charAt(0).toLowerCase() // Ensure first char is lowercase
      );
      console.log(`   ✅ camelCase Le/Bg fields (${camelCaseLeBgFields.length}):`, camelCaseLeBgFields);

      // 🚨 SEPARATE: Show PascalCase Le/Bg fields (WRONG format: LePayroll, BgPayroll)
      const pascalCaseLeBgFields = allFieldNames.filter(key =>
        (key.startsWith('Le') && key.length > 2 && key !== 'LeOfMonth') ||
        (key.startsWith('Bg') && key.length > 2)
      );
      console.log(`   ❌ PascalCase Le/Bg fields (${pascalCaseLeBgFields.length}):`, pascalCaseLeBgFields);

      // ✅ Check for wrong field names (now expecting camelCase: payrollLe, bonusLe)
      // PascalCase benefits fields = incorrect!
      const wrongFieldNames = Object.keys(row).filter(key =>
        (key.startsWith('Le') && key.length > 2 && key !== 'LeOfMonth') ||
        (key.startsWith('Bg') && key.length > 2)
      );

      if (wrongFieldNames.length > 0) {
        hasFieldErrors = true;
        console.error(`❌ Row ${index + 1}: Wrong field names detected (PascalCase):`, wrongFieldNames);
        console.error(`   Expected format: payrollLe, bonusLe (camelCase with Le/Bg suffix)`);
        console.error(`   NOT: LePayroll, BgPayroll (PascalCase with Le/Bg prefix)`);
        console.error(`   This indicates Field Mapping was not applied correctly.`);
      } else {
        console.log(`   ✅ No wrong PascalCase field names detected`);
      }

      // ✅ Check for critical required fields (now expecting camelCase!)
      const criticalFields = ['companyId', 'budgetYear', 'costCenterCode']; //costCenter
      const missingFields = criticalFields.filter(field => !row[field]);

      if (missingFields.length > 0) {
        hasFieldErrors = true;
        console.error(`❌ Row ${index + 1}: Missing critical fields:`, missingFields);
      }
    }); if (hasFieldErrors) {
      const errorMsg =
        `Validation failed: Field names or required fields are incorrect.\n\n` +
        `Please check console for details.\n\n` +
        `Common issues:\n` +
        `1. Field names must be: payrollLe, bonusLe (camelCase with Le/Bg suffix)\n` +
        `2. NOT: LePayroll, BgPayroll (PascalCase with Le/Bg prefix)\n` +
        `3. All rows must have: companyId, budgetYear, costCenterCode (camelCase)`;

      console.error('❌ Field validation failed - aborting save');
      throw new Error(errorMsg);
    }

    console.log('✅ Field name validation passed - all fields are correctly formatted');

    // ═══════════════════════════════════════════════════════════════════
    // STEP 3: SAVE TO API
    // ═══════════════════════════════════════════════════════════════════

    try {
      // Get current user (TODO: from JWT token when ready)
      const currentUser = window.getCurrentUser ? window.getCurrentUser() : 'DevUser';

      // Call API using window.saveBatchBudgetData (same as Regular Batch)
      console.log('🚀 Calling saveBatchBudgetData API...', batchData);
      const result = await window.saveBatchBudgetData(batchData, currentUser);

      console.log('✅ API Response received:', result);

      // ═══════════════════════════════════════════════════════════════════
      // 🆕 STEP 4: Remove Preparing Message after API call (Added from plan.events.js)
      // ═══════════════════════════════════════════════════════════════════
      const preparingMsg = document.getElementById('preparing-allocation-save-message');
      if (preparingMsg) {
        preparingMsg.remove();
        console.log('  ✅ Preparing message removed');
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 📊 Handle Response (All or Nothing)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      if (result.success && result.totalSuccess === result.totalSubmitted) {
        // ✅ SUCCESS - All rows saved
        console.log('💾 [Allocation Save] Save successful:', result);

        // ═══════════════════════════════════════════════════════════════════
        // 🆕 STEP 5: Auto-save to PE Allocation Configuration
        // ═══════════════════════════════════════════════════════════════════
        console.log('📋 Auto-saving to PE Allocation Configuration...');
        console.log('📦 batchData before saveAllocationConfiguration:', JSON.stringify(batchData.map(r => ({
          costCenter: r.costCenterCode,
          isAllocationMode: r.isAllocationMode,
          isAllocationMaster: r.isAllocationMaster,
          percentage: r.allocationPercentage
        }))));

        try {
          await saveAllocationConfiguration(batchData, row1Data);
          console.log('✅ PE Allocation Configuration saved successfully');
        } catch (configError) {
          console.error('❌ Failed to save PE Allocation Configuration:', configError);
          // Show warning but don't block - Budget data already saved
          console.warn('⚠️ Budget saved but configuration update failed. Please check Settings > PE Allocation.');

          // Show warning toast (non-blocking)
          const warningToast = document.createElement('div');
          warningToast.className = 'toast align-items-center text-bg-warning border-0 position-fixed top-0 end-0 m-3';
          warningToast.setAttribute('role', 'alert');
          warningToast.style.zIndex = '9999';
          warningToast.innerHTML = `
            <div class="d-flex">
              <div class="toast-body">
                <i class="fa-solid fa-exclamation-triangle me-2"></i>
                Budget saved successfully, but PE Allocation configuration update failed.
                Please check Settings > PE Allocation to verify.
              </div>
              <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
          `;
          document.body.appendChild(warningToast);

          // Show toast
          const toast = new bootstrap.Toast(warningToast, { delay: 8000 });
          toast.show();

          // Remove after hidden
          warningToast.addEventListener('hidden.bs.toast', () => {
            warningToast.remove();
          });
        }

        showConfirmModal({
          title: 'บันทึกสำเร็จ',
          message: `บันทึกข้อมูล Allocation สำเร็จทั้งหมด ${result.totalSuccess} รายการ!\n\n(1 Master + ${result.totalSuccess - 1} Children)\n\nข้อมูลได้รับการตรวจสอบและบันทึกเรียบร้อยแล้ว`,
          iconType: 'success',
          confirmText: 'ตกลง',
          showCancel: false,
          onConfirm: () => {
            clearAllAllocationRows();
            console.log(`✅ Successfully saved ${result.totalSuccess} allocation budget rows`);

            // 🔧 FIX: Remove any stuck backdrops after modal closes
            setTimeout(() => {
              document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
              document.body.classList.remove('modal-open');
              document.body.style.overflow = '';
              document.body.style.paddingRight = '';
            }, 100);
          }
        });

        // 🆕 STEP 6: Auto-close Modal after 3 seconds (Added from plan.events.js)
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
          clearAllAllocationRows();
          location.reload();
        }, 3000); // ← Auto-close after 3 seconds

        // Refresh main grid if function exists
        if (typeof window.loadData === 'function') {
          window.loadData();
        } else if (typeof loadBudgetData === 'function') {
          loadBudgetData();
        }

        // Close collapse
        const collapseElement = document.getElementById('batchEntryCollapse');
        if (collapseElement && coreui.Collapse) {
          const collapse = coreui.Collapse.getInstance(collapseElement);
          if (collapse) {
            collapse.hide();
          }
        }

      } else {
        // ❌ FAILED - Show errors
        console.error('❌ Allocation save failed:', result);

        const errorMessage = result.message || 'Unknown error occurred during save';
        const errorDetails = result.errors ? `\n\nDetails:\n${result.errors.join('\n')}` : '';

        showConfirmModal({
          title: 'เกิดข้อผิดพลาด',
          message: `ไม่สามารถบันทึกข้อมูล Allocation ได้\n\n${errorMessage}${errorDetails}`,
          iconType: 'error',
          confirmText: 'ตรวจสอบ',
          showCancel: false
        });
      }

    } catch (error) {
      // ❌ Network or API Error
      console.error('❌ Allocation save error:', error);

      // ═══════════════════════════════════════════════════════════════════
      // 🆕 Remove Preparing Message on Error (Added from plan.events.js)
      // ═══════════════════════════════════════════════════════════════════
      const preparingMsg = document.getElementById('preparing-allocation-save-message');
      if (preparingMsg) {
        preparingMsg.remove();
        console.log('  ✅ Preparing message removed (error case)');
      }

      showConfirmModal({
        title: 'เกิดข้อผิดพลาด',
        message: `เกิดข้อผิดพลาดในการบันทึกข้อมูล:\n\n${error.message}\n\nกรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ`,
        iconType: 'error',
        confirmText: 'ตรวจสอบ',
        showCancel: false
      });
    }
  }

  /**
   * Clear All Allocation Rows
   */
  function clearAllAllocationRows() {
    console.log('🧹 Clearing all allocation rows...');

    // Remove all allocation rows from DOM
    const allocationRows = document.querySelectorAll('[data-allocation-mode="true"]');
    allocationRows.forEach(row => {
      row.remove();
    });

    // ✅ ALSO clear from batchEntryManager
    if (typeof batchEntryManager !== 'undefined' && batchEntryManager.activeRows) {
      // Find and remove all allocation rows from batchEntryManager
      const keysToDelete = [];
      batchEntryManager.activeRows.forEach((value, key) => {
        if (value.isAllocation) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => batchEntryManager.activeRows.delete(key));
      console.log(`  ✅ Removed ${keysToDelete.length} allocation rows from batchEntryManager`);
    }

    // Clear AllocationBatchManager Map
    activeAllocationRows.clear();

    // ⭐ CLEAR used employee codes cache
    if (typeof clearUsedEmployeeCodes === 'function') {
      clearUsedEmployeeCodes();
    }

    // Reset counter
    nextRowId = 1;

    // Update UI
    updateAllocationControlsVisibility();
    updateRowCounter();

    console.log('✅ All allocation rows cleared');
  }

  /**
   * Validate No Duplicate Cost Centers
   * @returns {boolean} True if no duplicates, false otherwise
   */
  function validateNoDuplicateCostCenters() {
    const costCenters = [];
    const costCenterSelects = document.querySelectorAll('[data-allocation-mode="true"] .allocation-cost-center');
    let hasDuplicates = false;

    costCenterSelects.forEach(select => {
      const value = select.value;

      if (value) {
        if (costCenters.includes(value)) {
          // Mark as invalid
          select.classList.add('is-invalid');
          hasDuplicates = true;
        } else {
          // Remove invalid class
          select.classList.remove('is-invalid');
          costCenters.push(value);
        }
      }
    });

    return !hasDuplicates;
  }

  /**
   * Update Allocation Controls Visibility
   * Show allocation action bar when allocation rows exist
   */
  function updateAllocationControlsVisibility() {
    const allocationRows = document.querySelectorAll('[data-allocation-mode="true"]');
    const hasAllocationRows = allocationRows.length > 0;

    // Action bars (if they exist in the template)
    const batchActionBar = document.getElementById('batchActionBar');
    const allocationActionBar = document.getElementById('allocationActionBar');

    if (hasAllocationRows) {
      // Hide normal batch action bar, show allocation action bar
      if (batchActionBar) batchActionBar.classList.add('d-none');
      if (allocationActionBar) allocationActionBar.classList.remove('d-none');
    } else {
      // Show normal batch action bar, hide allocation action bar
      if (batchActionBar) batchActionBar.classList.remove('d-none');
      if (allocationActionBar) allocationActionBar.classList.add('d-none');
    }

    // Update "เพิ่มแถว" button state
    const addRowButton = document.getElementById('addAllocationCostCenterBtn');
    if (addRowButton) {
      addRowButton.disabled = allocationRows.length === 0;
    }

    // Update CAL and Save buttons state
    const calButton = document.getElementById('calAllAllocationBtn');
    const saveButton = document.getElementById('saveAllocationBtn');
    const validateButton = document.getElementById('validateAllocationBtn');

    if (calButton) calButton.disabled = allocationRows.length === 0;
    if (saveButton) saveButton.disabled = allocationRows.length === 0;
    if (validateButton) validateButton.disabled = allocationRows.length === 0;
  }

  /**
   * Update Row Counter Badge
   */
  function updateRowCounter() {
    const rowCount = activeAllocationRows.size;
    const counterBadge = document.getElementById('allocationBatchRowCounter');

    if (counterBadge) {
      counterBadge.textContent = `${rowCount} Rows`;
    }
  }

  /**
   * Delete Allocation Row
   * @param {number} rowId - Row ID to delete
   */
  function deleteAllocationRow(rowId) {
    console.log(`🗑️ Deleting allocation row ${rowId}...`);

    const row = activeAllocationRows.get(rowId);

    if (row && row.element) {
      // Get row ID string for batchEntryManager
      const rowIdStr = `batch-row-${rowId}`;

      // Remove from DOM
      row.element.remove();

      // Remove from AllocationBatchManager Map
      activeAllocationRows.delete(rowId);

      // ✅ ALSO remove from batchEntryManager for cleanup
      if (typeof batchEntryManager !== 'undefined' && batchEntryManager.activeRows) {
        batchEntryManager.activeRows.delete(rowIdStr);
        console.log(`  ✅ Row also removed from batchEntryManager`);
      }

      // Update calculations and UI
      calculateTotalAllocation();
      updateTotalAllocationBadge();
      updateAllocationControlsVisibility();
      updateRowCounter();

      console.log(`✅ Allocation row ${rowId} deleted (${activeAllocationRows.size} remaining)`);
    } else {
      console.warn(`⚠️ Row ${rowId} not found in activeAllocationRows`);
    }
  }

  /**
   * Validate Allocation Realtime
   * Run validations and show results
   */
  function validateAllocationRealtime() {
    console.log('🔍 Running allocation validation...');

    const validationResults = [];

    // 1. Total = 100%
    const total = calculateTotalAllocation();
    if (total !== 100) {
      validationResults.push({
        type: 'error',
        message: `Total allocation must be 100% (current: ${total.toFixed(2)}%)`
      });
    } else {
      validationResults.push({
        type: 'success',
        message: 'Total allocation is 100% ✓'
      });
    }

    // 2. No duplicates
    if (!validateNoDuplicateCostCenters()) {
      validationResults.push({
        type: 'error',
        message: 'Duplicate Cost Centers detected'
      });
    } else {
      validationResults.push({
        type: 'success',
        message: 'No duplicate Cost Centers ✓'
      });
    }

    // 3. All rows have cost center
    const emptyRows = [];
    const allocationRows = document.querySelectorAll('[data-allocation-mode="true"]');
    allocationRows.forEach((row, index) => {
      const costCenter = $(row).find('.allocation-cost-center').val();
      if (!costCenter) {
        emptyRows.push(index + 1);
      }
    });

    // ⭐ NEW: Check if only Master row exists (no Child rows for allocation)
    if (allocationRows.length === 1) {
      validationResults.push({
        type: 'warning',
        message: 'No Child Rows (no cost center allocation)'
      });
    } else if (emptyRows.length > 0) {
      validationResults.push({
        type: 'error',
        message: `Rows without Cost Center: ${emptyRows.join(', ')}`
      });
    } else {
      validationResults.push({
        type: 'success',
        message: 'All rows have Cost Center ✓'
      });
    }

    // 4. ⭐ NEW: Validate Bonus Type in Row 1 (Master Row)
    const row1Element = allocationRows[0];
    const bonusTypeSelect = $(row1Element).find('.allocation-bonus-type');
    const bonusTypeValue = bonusTypeSelect.val();

    if (!bonusTypeValue || bonusTypeValue === '') {
      validationResults.push({
        type: 'error',
        message: 'Row 1: Bonus Types is required'
      });
    } else {
      validationResults.push({
        type: 'success',
        message: `Bonus Types selected: ${bonusTypeValue} ✓`
      });
    }

    // Display results
    const container = document.getElementById('allocationValidationMessages');
    if (container) {
      let html = '<div class="alert alert-info"><strong>Validation Results:</strong><ul class="mb-0 mt-2">';

      validationResults.forEach(result => {
        let icon, colorClass;

        if (result.type === 'success') {
          icon = '✓';
          colorClass = 'text-success';
        } else if (result.type === 'warning') {
          icon = '⚠';
          colorClass = 'text-warning';
        } else {
          icon = '✗';
          colorClass = 'text-danger';
        }

        html += `<li class="${colorClass}">${icon} ${result.message}</li>`;
      });

      html += '</ul></div>';
      container.innerHTML = html;
    }

    console.log('✅ Validation complete:', validationResults);
  }

  /**
   * 💾 Save Allocation Configuration to HRB_CONF_PE_ALLOCATION
   * Called automatically after successful budget save
   *
   * @param {Array} batchData - Array of budget rows saved
   * @param {Object} masterData - Master row (Row 1) data
   * @returns {Promise<Object>} API response
   */
  async function saveAllocationConfiguration(batchData, masterData) {
    console.log('💾 [PE Allocation Config] Preparing configuration data...');
    console.log('📦 batchData received:', batchData);
    console.log('📦 masterData received:', masterData);

    // ─────────────────────────────────────────────────────────────
    // Extract allocation-specific data
    // ─────────────────────────────────────────────────────────────
    // Filter: Only rows that are allocation rows (not master row)
    const allocationRows = batchData.filter(row => {
      const isMaster = row.isAllocationMaster === true || row.isAllocationMaster === 'true';
      const isAllocation = row.isAllocationMode === true || row.isAllocationMode === 'true';

      console.log('🔍 Checking row:', {
        costCenter: row.costCenterCode || row.cost_center_code,
        isAllocationMode: row.isAllocationMode,
        isAllocationMaster: row.isAllocationMaster,
        isMaster: isMaster,
        isAllocation: isAllocation,
        shouldInclude: isAllocation && !isMaster
      });

      return isAllocation && !isMaster;
    });

    console.log(`📋 Found ${allocationRows.length} allocation rows (excluding master)`);
    console.log('📦 allocationRows:', allocationRows);

    if (allocationRows.length === 0) {
      console.warn('⚠️ No allocation rows found! All rows:', batchData.map(r => ({
        cc: r.costCenterCode,
        master: r.isAllocationMaster,
        mode: r.isAllocationMode
      })));
      console.log('ℹ️ No allocation rows to save to configuration');
      return { success: true, message: 'No allocation rows to save', savedCount: 0 };
    }

    // ─────────────────────────────────────────────────────────────
    // Build configuration records
    // ─────────────────────────────────────────────────────────────
    const configRecords = [];

    // Generate AllocateId: Get MAX(AllocateId) + 1 from existing records
    let allocateId = 1; // Default if no records exist

    try {
      console.log('🔍 Fetching MAX(AllocateId) from server...');

      // Call API to get MAX(AllocateId) (use dynamic base URL for IIS virtual directory support)
      const apiBase = (window.AppConfig && window.AppConfig.apiBaseUrl) ? window.AppConfig.apiBaseUrl : './api/';
      const response = await fetch(apiBase + 'Settings/GetMaxAllocateId');

      if (response.ok) {
        const result = await response.json();

        if (result.success) {
          allocateId = result.nextId;
          console.log(`  ✅ MAX(AllocateId): ${result.maxId}, using next ID: ${allocateId}`);
        } else {
          console.log('  ℹ️ No existing records found, using AllocateId = 1');
        }
      } else {
        console.warn('  ⚠️ Failed to fetch MAX(AllocateId), using AllocateId = 1');
      }
    } catch (error) {
      console.error('  ❌ Error fetching MAX(AllocateId):', error);
      console.log('  ℹ️ Using AllocateId = 1 as fallback');
    }

    console.log(`  🔑 Generated AllocateId: ${allocateId}`);

    // Get current user
    const currentUser = 'DevUser'; // TODO: Get from session/auth

    // Use counter for sequential AllocateId (increment for each record)
    let currentAllocateId = allocateId;

    for (const row of allocationRows) {
      console.log('🔍 Processing allocation row:', {
        costCenter: row.costCenterCode,
        companyId: row.companyId,
        percentage: row.allocationPercentage,
        empCode: row.empCode,
        allKeys: Object.keys(row).slice(0, 20)  // Show first 20 keys
      });

      // Skip Master row (it has no allocation percentage) - should not happen here after filter
      if (row.isAllocationMaster) {
        console.log('  ⏭️ Skipping Master row (no percentage)');
        continue;
      }

      const configRecord = {
        AllocateId: currentAllocateId,  // Use counter, not fixed value
        CompanyId: row.companyId,
        CostCenterCode: row.costCenterCode,
        EmpCode: row.empCode,
        AllocateValue: row.allocationPercentage, // e.g., 25.00
        IsActive: true,
        UpdatedBy: currentUser,
        UpdatedDate: new Date().toISOString()
      };

      console.log(`  ✅ Created config record with AllocateId=${currentAllocateId}:`, configRecord);
      configRecords.push(configRecord);

      // Increment for next record
      currentAllocateId++;
    }

    console.log(`📤 Sending ${configRecords.length} configuration records to API...`);
    console.log('📦 Full configRecords array:', configRecords);

    // ─────────────────────────────────────────────────────────────
    // Call Backend API
    // ─────────────────────────────────────────────────────────────
    try {
      const requestPayload = {
        Allocations: configRecords,
        CreatedBy: currentUser
      };

      console.log('📮 Request payload:', requestPayload);
      console.log('📮 JSON stringified:', JSON.stringify(requestPayload, null, 2));

      const response = await fetch(SETTINGS_API.savePEAllocationBatch, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.Message || 'Failed to save PE Allocation Configuration';
        } catch {
          errorMessage = errorText || 'Failed to save PE Allocation Configuration';
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ PE Allocation Configuration API response:', result);

      return result;
    } catch (error) {
      console.error('❌ Error calling PE Allocation Configuration API:', error);
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🌐 PUBLIC API (Return Object)
  // ═══════════════════════════════════════════════════════════════════════════

  return {
    // Core Functions
    initialize,
    addAllocationBatchRow,
    deleteAllocationRow,

    // Calculation Functions
    calculateTotalAllocation,
    calculateAllAllocationRows,

    // Save Functions
    saveAllocationBatch,
    saveAllocationConfiguration,  // 🆕 Export new function
    clearAllAllocationRows,

    // Validation Functions
    validateNoDuplicateCostCenters,
    validateAllocationRealtime,

    // UI Update Functions
    updateAllocationControlsVisibility,
    updateRowCounter,
    updateTotalAllocationBadge,

    // Getters
    get activeRows() {
      return activeAllocationRows;
    },
    get rowCount() {
      return activeAllocationRows.size;
    },
    get isInitialized() {
      return isInitialized;
    }
  };

})();

// ═══════════════════════════════════════════════════════════════════════════
// 🌍 GLOBAL EXPORT
// ═══════════════════════════════════════════════════════════════════════════

window.AllocationBatchManager = AllocationBatchManager;

console.log('📦 AllocationBatchManager module loaded successfully');
