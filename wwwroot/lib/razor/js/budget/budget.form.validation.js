/**
 * Budget Form Validation Enhanced - Unified Critical → Warning → Error System
 * Based on highlightMissingBenefitsData pattern
 */

/**
 * Enhanced Form Validation Manager with Unified State System
 */
class BudgetFormValidator {
  constructor() {
    this.validationRules = {};
    this.currentCompanyId = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the form validator
   */
  initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Setup validation rules
      this.setupValidationRules();

      // Setup form submission handlers
      this.setupFormSubmissionHandlers();

      // Listen for company changes
      this.setupCompanyValidationUpdates();

      this.isInitialized = true;

    } catch (error) {
      console.error('❌ Error initializing Form Validator:', error);
    }
  }

  /**
   * Setup validation rules for different companies
   */
  setupValidationRules() {
    this.validationRules = {
      common: {
        required: ['editCompany', 'editYear', 'editCobu', 'editCostCenter'],
        numeric: ['editYear', 'editNewHC', 'editNOfMonth', 'editLEnOfMonth', 'editNewPeriod', 'editNewLEPeriod'],
        decimal: [
          'editLePayroll', 'editBgPayroll', 'editLePremium', 'editBgPremium',
          'editLePeMth', 'editLePeYear', 'editBgPeMth', 'editBgPeYear'
        ]
      },

      BJC: {
        required: [
          'editDivision', 'editLocation', 'editPosition', 'editJobBand',
          'editEmpType', 'editNewPeriod', 'editNewLEPeriod', 'editPlanCostCenter'
        ],
        decimal: [
          'editLeBonus', 'editLeFleetCardPE', 'editLeCarAllowance', 'editLeLicenseAllowance',
          'editLeHousingAllowance', 'editLeGasolineAllowance', 'editLeWageStudent',
          'editLeSkillPayAllowance', 'editLeSocialSecurity', 'editLeLaborFundFee',
          'editLeOtherBenefits', 'editLeProvidentFund', 'editLeInterest',
          'editLeStaffInsurance', 'editLeMedicalExpense', 'editLeMedicalInHouse',
          'editLeTraining', 'editLeLongService',

          'editBgBonus', 'editBgFleetCardPE', 'editBgCarAllowance', 'editBgLicenseAllowance',
          'editBgHousingAllowance', 'editBgGasolineAllowance', 'editBgWageStudent',
          'editBgSkillPayAllowance', 'editBgSocialSecurity', 'editBgLaborFundFee',
          'editBgOtherBenefits', 'editBgProvidentFund', 'editBgInterest',
          'editBgStaffInsurance', 'editBgMedicalExpense', 'editBgMedicalInHouse',
          'editBgTraining', 'editBgLongService',

          'editSalWithEn', 'editSalNotEn', 'editSalTemp'
        ],
        conditional: {
          'editEmpType': {
            'Temporary': ['editTemporaryStaffSal', 'editSocialSecurityTmp']
          }
        }
      },

      BIGC: {
        required: [
          'editDivision', 'editLocation', 'editPosition', 'editJobBand',
          'editEmpType', 'editNewPeriod', 'editNewLEPeriod', 'editPlanCostCenter',
          'editOrgUnitCode', 'editOrgUnitName'
        ],
        decimal: [
          'editLeTotalPayroll', 'editLeFleetCardPe', 'editLeCarRentalPe'
        ]
      }
    };
  }

  /**
   * Setup form submission handlers
   */
  setupFormSubmissionHandlers() {
    // Handle save button clicks
    $(document).off('click.budgetFormSubmission', '#btnSave, #btnSaveAndNew')
              .on('click.budgetFormSubmission', '#btnSave, #btnSaveAndNew', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const mode = e.target.id === 'btnSaveAndNew' ? 'saveAndNew' : 'save';
      this.handleFormSubmission(mode);
    });
  }

  /**
   * Setup company validation updates
   */
  setupCompanyValidationUpdates() {
    $(document).off('change.companyValidation', '#editCompany')
              .on('change.companyValidation', '#editCompany', () => {
      this.updateCurrentCompanyId();
      this.setupConditionalValidation();
      this.setupRealTimeValidation(); // Add real-time validation setup
    });

    // Initial setup
    this.setupRealTimeValidation();

    // Also setup when DOM is fully ready
    $(document).ready(() => {
      setTimeout(() => {
        this.setupRealTimeValidation();
      }, 1000);
    });
  }

  /**
   * Force setup real-time validation (can be called manually)
   */
  forceSetupRealTimeValidation() {
    // console.log('🔧 Force setup real-time validation...');
    this.setupRealTimeValidation();
  }

  /**
   * Update current company ID
   */
  updateCurrentCompanyId() {
    const companyField = document.getElementById('editCompany');
    if (companyField) {
      this.currentCompanyId = companyField.value;
    }
  }

  /**
   * Setup conditional validation based on current company
   */
  setupConditionalValidation() {
    const companyRules = this.currentCompanyId === '1' ? this.validationRules.BJC :
                        this.currentCompanyId === '2' ? this.validationRules.BIGC : null;

    if (!companyRules || !companyRules.conditional) return;

    Object.entries(companyRules.conditional).forEach(([triggerFieldId, conditions]) => {
      const triggerField = document.getElementById(triggerFieldId);
      if (triggerField) {
        $(triggerField).off('change.conditionalValidation')
                      .on('change.conditionalValidation', (e) => {
          this.handleConditionalValidation(triggerFieldId, conditions, e.target.value);
        });
      }
    });
  }

  /**
   * Handle conditional validation
   */
  handleConditionalValidation(triggerFieldId, conditions, triggerValue) {
    $(`.conditional-required[data-trigger="${triggerFieldId}"]`).remove();
    $('.conditional-field').removeClass('conditional-field').removeAttr('required');

    if (conditions[triggerValue]) {
      const requiredFields = conditions[triggerValue];
      requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && this.isFieldVisible(fieldId)) {
          field.setAttribute('required', 'required');
          field.classList.add('conditional-field');
          field.setAttribute('data-trigger', triggerFieldId);

          const label = document.querySelector(`label[for="${fieldId}"]`);
          if (label && !label.querySelector('.conditional-required')) {
            const requiredSpan = document.createElement('span');
            requiredSpan.className = 'text-warning ms-1 conditional-required';
            requiredSpan.setAttribute('data-trigger', triggerFieldId);
            requiredSpan.innerHTML = '*';
            requiredSpan.title = 'Required based on your selection';
            label.appendChild(requiredSpan);
          }
        }
      });
    }
  }

  /**
   * Setup real-time validation for critical and required Select2 fields
   */
  setupRealTimeValidation() {
    // console.log('🔍 Setting up real-time validation for all validation fields...');

    // Delay setup to ensure DOM and Select2 are ready
    setTimeout(() => {
      // All fields that need real-time validation (critical + required Select2)
      const validationFields = this.getCriticalFieldsList();

      // console.log(`📋 Total fields for real-time validation: ${validationFields.length}`);
      // console.log(`📋 Fields list:`, validationFields.map(f => `${f.id} (${f.type})`));

      validationFields.forEach(fieldConfig => {
        const field = document.getElementById(fieldConfig.id);
        // console.log(`🔍 Checking field: ${fieldConfig.id}`);

        if (field) {
          // console.log(`✅ Field found: ${fieldConfig.id}, isSelect2: ${field.classList.contains('select2-hidden-accessible')}, visible: ${this.isFieldVisible(fieldConfig.id)}`);

          // Remove existing real-time listeners
          $(field).off('.realTimeValidation');

          // Add real-time validation listener for both regular and Select2 fields
          if (field.classList.contains('select2-hidden-accessible')) {
            // For Select2 fields, listen to select2:select and select2:unselect events
            $(field).on('select2:select.realTimeValidation select2:unselect.realTimeValidation select2:clear.realTimeValidation change.realTimeValidation', (e) => {
              // console.log(`🔥 Select2 event triggered: ${e.type} on ${fieldConfig.id}`);
              setTimeout(() => {
                this.validateFieldRealTime(fieldConfig, field);
              }, 50); // Small delay to ensure Select2 value is updated
            });
            // console.log(`✅ Select2 real-time validation setup for: ${fieldConfig.id} (${fieldConfig.type})`);
          } else {
            // For regular fields (input, textarea)
            $(field).on('change.realTimeValidation blur.realTimeValidation input.realTimeValidation', (e) => {
              // console.log(`🔥 Input event triggered: ${e.type} on ${fieldConfig.id}`);
              this.validateFieldRealTime(fieldConfig, e.target);
            });
            // console.log(`✅ Input real-time validation setup for: ${fieldConfig.id} (${fieldConfig.type})`);
          }
        } else {
          // console.log(`❌ Field not found: ${fieldConfig.id}`);
        }
      });
    }, 500); // Give more time for Select2 initialization
  }

  /**
   * Get list of all validation fields (critical + required Select2)
   */
  getCriticalFieldsList() {
    const companyID = this.currentCompanyId || document.getElementById('editCompany')?.value;

    let validationFields = [
      // Core required fields from image
      { id: 'editCompany', name: 'Company', type: 'required' },
      { id: 'editYear', name: 'Budget Year', type: 'required' },
      { id: 'editCobu', name: 'COBU', type: 'required' },
      { id: 'editEmpStatus', name: 'Employee Status', type: 'required' },
      { id: 'editCostCenter', name: 'Cost Center', type: 'required' },

      // Critical data fields
      { id: 'editLePayroll', name: 'Payroll (LE)', type: 'critical' },
      { id: 'editLeBonus', name: 'Bonus (LE)', type: 'critical' }
    ];

    // Add company-specific bonus type fields
    if (companyID === '1') {
      // BJC: Check both LE and BG bonus type fields
      const leBonusField = document.getElementById('editLeBonusType');
      const bgBonusField = document.getElementById('editBgBonusType');
      if (leBonusField) {
        validationFields.push({ id: 'editLeBonusType', name: 'LE Bonus Type', type: 'critical' });
      }
      if (bgBonusField) {
        validationFields.push({ id: 'editBgBonusType', name: 'BG Bonus Type', type: 'critical' });
      }
    } else if (companyID === '2') {
      // BIGC: Check single BG bonus type field
      const bonusField = document.getElementById('editBgBonusTypes');
      if (bonusField) {
        validationFields.push({ id: 'editBgBonusTypes', name: 'Bonus Type', type: 'critical' });
      }
    }

    // Add ALL required Select2 fields (fields with * red asterisk)
    const requiredSelect2Fields = this.getAllRequiredSelect2Fields();
    validationFields.push(...requiredSelect2Fields);

    // Remove duplicates based on id
    const uniqueFields = validationFields.filter((field, index, self) =>
      index === self.findIndex(f => f.id === field.id)
    );

    return uniqueFields;
  }

  /**
   * Get all required Select2 fields from DOM (fields with red asterisk *)
   */
  getAllRequiredSelect2Fields() {
    const requiredSelect2Fields = [];

    // console.log('🔍 Scanning for required Select2 fields...');

    // Method 1: Find labels with red asterisk
    $('label:has(span[style*="color:red"])').each((index, label) => {
      const forId = $(label).attr('for');
      const labelText = label.textContent || label.innerText;
      // console.log(`🔍 Found required label: "${labelText}" for field: ${forId}`);

      if (forId) {
        const field = document.getElementById(forId);
        if (field) {
          const isSelect2 = field.classList.contains('select2-hidden-accessible');
          // console.log(`  Field ${forId}: exists=${!!field}, isSelect2=${isSelect2}, tagName=${field.tagName}`);

          if (isSelect2) {
            const fieldName = labelText.replace(/\s*\*\s*$/, '').trim();
            const isAlreadyAdded = ['editCompany', 'editLeBonusType', 'editBgBonusType', 'editBgBonusTypes'].includes(forId);

            if (!isAlreadyAdded) {
              requiredSelect2Fields.push({
                id: forId,
                name: fieldName,
                type: 'required'
              });
              // console.log(`  ✅ Added required Select2 field: ${forId}`);
            } else {
              // console.log(`  ⚠️ Field ${forId} already in critical list`);
            }
          }
        } else {
          // console.log(`  ❌ Field ${forId} not found in DOM`);
        }
      }
    });

    // Method 2: Also scan all Select2 fields and check their labels
    $('.select2-hidden-accessible').each((index, field) => {
      const fieldId = field.id;
      if (fieldId) {
        const label = document.querySelector(`label[for="${fieldId}"]`);
        if (label) {
          const hasRedAsterisk = $(label).find('span[style*="color:red"]').length > 0;
          if (hasRedAsterisk) {
            const isAlreadyAdded = requiredSelect2Fields.some(f => f.id === fieldId) ||
                                  ['editCompany', 'editLeBonusType', 'editBgBonusType', 'editBgBonusTypes'].includes(fieldId);

            if (!isAlreadyAdded) {
              const labelText = label.textContent || label.innerText;
              const fieldName = labelText.replace(/\s*\*\s*$/, '').trim();
              requiredSelect2Fields.push({
                id: fieldId,
                name: fieldName,
                type: 'required'
              });
              // console.log(`  ✅ Added from Select2 scan: ${fieldId}`);
            }
          }
        }
      }
    });

    // console.log(`🔍 Found ${requiredSelect2Fields.length} additional required Select2 fields:`);
    // requiredSelect2Fields.forEach(f => console.log(`  - ${f.id}: ${f.name}`));

    return requiredSelect2Fields;
  }  /**
   * Validate field in real-time (critical, required, or regular fields)
   */
  validateFieldRealTime(fieldConfig, fieldElement) {
    // console.log(`🔍 Real-time validating: ${fieldConfig.id} (${fieldConfig.type})`);

    if (!fieldElement || !this.isFieldVisible(fieldConfig.id)) {
      // console.log(`⚠️ Field ${fieldConfig.id} not available for validation`);
      return;
    }

    const value = fieldElement.value ? fieldElement.value.toString().trim() : '';
    const hasValue = value !== '' && value !== '0';

    // console.log(`🔍 Field ${fieldConfig.id}: Value="${value}", HasValue=${hasValue}`);

    if (fieldConfig.type === 'critical') {
      if (hasValue) {
        // Show success state with green checkmark
        this.setFieldHighlightState(fieldElement, 'valid', 'success',
          `✅ ${fieldConfig.name} ข้อมูลถูกต้อง`);
        // console.log(`✅ ${fieldConfig.id}: Valid critical data - ${value}`);
      } else {
        // Show critical warning
        this.setFieldHighlightState(fieldElement, 'critical', 'critical',
          `กรุณากรอกข้อมูล ${fieldConfig.name} ที่สำคัญ`);
        // console.log(`❌ ${fieldConfig.id}: Missing critical data`);
      }
    } else if (fieldConfig.type === 'required') {
      if (hasValue) {
        // Show success state for required field
        this.setFieldHighlightState(fieldElement, 'valid', 'success',
          `✅`);
        // console.log(`✅ ${fieldConfig.id}: Valid required field - ${value}`);

        // If this is company field, trigger conditional validation
        if (fieldConfig.id === 'editCompany') {
          setTimeout(() => {
            this.validateConditionalFieldsRealTime();
          }, 100);
        }
      } else {
        // Show required error
        this.setFieldHighlightState(fieldElement, 'invalid', 'error',
          `${fieldConfig.name} is required`);
        // console.log(`❌ ${fieldConfig.id}: Missing required data`);
      }
    }

    // Additional format validation for numeric/decimal fields
    if (hasValue && this.isNumericField(fieldConfig.id)) {
      const isValidFormat = this.validateNumericField(fieldElement);
      if (!isValidFormat) {
        // console.log(`❌ ${fieldConfig.id}: Invalid numeric format`);
        return; // Format validation will handle the styling
      }
    }

    if (hasValue && this.isDecimalField(fieldConfig.id)) {
      const isValidFormat = this.validateDecimalField(fieldElement);
      if (!isValidFormat) {
        // console.log(`❌ ${fieldConfig.id}: Invalid decimal format`);
        return; // Format validation will handle the styling
      }
    }
  }

  /**
   * Check if field is numeric field
   */
  isNumericField(fieldId) {
    const allNumericFields = [...this.validationRules.common.numeric];
    return allNumericFields.includes(fieldId);
  }

  /**
   * Validate conditional fields after company selection
   */
  validateConditionalFieldsRealTime() {
    // console.log('🔍 Validating conditional fields after company change...');

    // Re-setup real-time validation for new company-specific fields
    this.setupRealTimeValidation();

    // Validate all validation fields for new company
    const validationFields = this.getCriticalFieldsList();

    validationFields.forEach(fieldConfig => {
      if (fieldConfig.type === 'critical') {
        const field = document.getElementById(fieldConfig.id);
        if (field && this.isFieldVisible(fieldConfig.id)) {
          this.validateFieldRealTime(fieldConfig, field);
        }
      }
    });
  }

  /**
   * Clean up all real-time validation listeners
   */
  cleanupRealTimeValidation() {
    // console.log('🧹 Cleaning up real-time validation listeners...');

    // Remove all real-time validation event listeners
    $('[id^="edit"]').off('.realTimeValidation');

    // console.log('✅ Real-time validation listeners cleaned up');
  }

  /**
   * Validate numeric field
   */
  validateNumericField(field) {
    const value = field.value.trim();
    if (!value) return true;

    const numValue = parseFloat(value);
    const isValid = !isNaN(numValue) && isFinite(numValue) && numValue >= 0;
    this.setFieldHighlightState(field, isValid ? 'valid' : 'invalid', 'error',
      isValid ? '' : 'Please enter a valid number');
    return isValid;
  }

  /**
   * Validate decimal field
   */
  validateDecimalField(field) {
    const value = field.value.trim();
    if (!value) return true;

    const numValue = parseFloat(value);
    const isValid = !isNaN(numValue) && isFinite(numValue) && /^\d*\.?\d+$/.test(value);
    this.setFieldHighlightState(field, isValid ? 'valid' : 'invalid', 'error',
      isValid ? '' : 'Please enter a valid decimal number');
    return isValid;
  }

  /**
   * Check if field is visible and enabled
   */
  isFieldVisible(fieldId) {
    const element = document.getElementById(fieldId);
    if (!element) return false;

    const $element = $(element);
    const isVisible = $element.is(':visible') && !$element.is(':disabled');
    const isInVisibleTab = this.isElementInVisibleTab(element);

    return isVisible && isInVisibleTab;
  }

  /**
   * Check if element is in currently visible tab
   */
  isElementInVisibleTab(element) {
    const $element = $(element);
    const tabPane = $element.closest('.tab-pane');

    if (tabPane.length === 0) return true;

    return tabPane.hasClass('show') && tabPane.hasClass('active');
  }

  /**
   * Set unified field highlight state with priority: Critical → Warning → Error
   * @param {HTMLElement} field - The form field element
   * @param {string} state - 'valid', 'invalid', 'warning', 'critical'
   * @param {string} type - 'error', 'warning', 'missing', 'critical'
   * @param {string} message - Tooltip/error message
   */
  setFieldHighlightState(field, state, type = 'error', message = '') {
    // console.log(`🔍 UNIFIED - setFieldHighlightState(${field?.id}, ${state}, ${type}, "${message}")`);

    if (!field) {
      // console.log('❌ UNIFIED - Field not found in DOM:', field?.id);
      return;
    }

    // Clear all existing states first
    this.clearFieldHighlightState(field);

    // 🎯 ENHANCED: Use highlightMissingBenefitsData pattern for Select2 detection
    const isSelect2 = field.classList.contains('select2-hidden-accessible');
    let targetElement = field;
    let select2Container = null;
    let selectionElement = null;

    if (isSelect2) {
      select2Container = field.nextElementSibling;
      if (select2Container && select2Container.classList.contains('select2-container')) {
        selectionElement = select2Container.querySelector('.select2-selection.select2-selection--single');
        targetElement = selectionElement || select2Container;
      }
    }

    // console.log(`🔍 UNIFIED - Field ${field.id} is Select2: ${isSelect2}`);

    // Apply state-based styling with priority order
    switch (state) {
      case 'critical':
        this.applyCriticalStyling(field, targetElement, isSelect2, message);
        break;
      case 'warning':
        this.applyWarningStyling(field, targetElement, isSelect2, message);
        break;
      case 'invalid':
        this.applyErrorStyling(field, targetElement, isSelect2, select2Container, message);
        break;
      case 'valid':
        this.applyValidStyling(field, targetElement, isSelect2, select2Container, message);
        break;
    }

    // console.log(`✅ UNIFIED - Applied ${state} state to field: ${field.id}`);
  }

  /**
   * Apply critical styling (highest priority)
   */
  applyCriticalStyling(field, targetElement, isSelect2, message) {
    // Critical uses both error and warning classes for maximum visibility
    field.classList.add('is-invalid', 'border-warning');

    if (isSelect2 && targetElement) {
      targetElement.classList.add('missing-data-warning');
      field.classList.add('border-warning'); // Also add to original element
    } else {
      field.classList.add('missing-data-warning');
    }

    if (message) {
      this.addTooltipIcon(field, message, 'critical');
      this.addErrorMessage(field, message, isSelect2);
    }
  }

  /**
   * Apply warning styling (medium priority)
   */
  applyWarningStyling(field, targetElement, isSelect2, message) {
    field.classList.add('border-warning');

    if (isSelect2 && targetElement) {
      targetElement.classList.add('missing-data-warning');
      field.classList.add('border-warning'); // Also add to original element
    } else {
      field.classList.add('missing-data-warning');
    }

    if (message) {
      this.addTooltipIcon(field, message, 'warning');
    }
  }

  /**
   * Apply error styling (Bootstrap validation)
   */
  applyErrorStyling(field, targetElement, isSelect2, select2Container, message) {
    field.classList.add('is-invalid');

    if (isSelect2 && select2Container) {
      select2Container.classList.remove('select2-valid');
      select2Container.classList.add('select2-invalid');
    }

    if (message) {
      this.addErrorMessage(field, message, isSelect2);
    }
  }

  /**
   * Apply valid styling
   */
  applyValidStyling(field, targetElement, isSelect2, select2Container, message = '') {
    field.classList.add('is-valid');

    if (isSelect2 && select2Container) {
      select2Container.classList.remove('select2-invalid');
      select2Container.classList.add('select2-valid');
    }

    // Add success message for real-time validation
    if (message) {
      //this.addSuccessMessage(field, message, isSelect2);
      this.addSuccessIcon(field, message);
    }
  }

  /**
   * Clear all highlight states from field
   */
  clearFieldHighlightState(field) {
    if (!field) return;

    // Remove all validation classes
    field.classList.remove('is-invalid', 'is-valid', 'border-warning', 'missing-data-warning');

    // Handle Select2 cleanup
    const isSelect2 = field.classList.contains('select2-hidden-accessible');
    if (isSelect2) {
      const select2Container = field.nextElementSibling;
      if (select2Container && select2Container.classList.contains('select2-container')) {
        const selectionElement = select2Container.querySelector('.select2-selection.select2-selection--single');
        if (selectionElement) {
          selectionElement.classList.remove('missing-data-warning');
        }
        select2Container.classList.remove('select2-invalid', 'select2-valid', 'missing-data-warning');
      }
    }

    // Remove error messages
    const $field = $(field);
    $field.siblings('.invalid-feedback, .valid-feedback').remove();

    // Remove tooltip icons
    const label = document.querySelector(`label[for="${field.id}"]`);
    if (label) {
      const existingIcons = label.querySelectorAll('.warning-icon, .critical-icon, .error-icon, .success-icon');
      existingIcons.forEach(icon => {
        this.disposeTooltip(icon);
        icon.remove();
      });
    }
  }

  /**
   * Add tooltip icon to field label (following highlightMissingBenefitsData pattern)
   */
  addTooltipIcon(field, message, type = 'warning') {
    const label = document.querySelector(`label[for="${field.id}"]`);
    if (!label || label.querySelector(`.${type}-icon`)) return;

    const icon = document.createElement('i');
    const iconClass = type === 'critical' ? 'fa-exclamation-triangle' :
                     type === 'warning' ? 'fa-exclamation-triangle' : 'fa-exclamation-circle';
    const colorClass = type === 'critical' ? 'text-danger' : 'text-warning';

    icon.className = `fa-solid ${iconClass} ${colorClass} ms-1 ${type}-icon warning-icon`;
    icon.title = `${type.charAt(0).toUpperCase() + type.slice(1)} data`;
    icon.setAttribute('data-coreui-toggle', 'tooltip');
    icon.setAttribute('data-coreui-placement', 'top');
    icon.setAttribute('data-coreui-title', message);
    label.appendChild(icon);

    // Initialize tooltip (following highlightMissingBenefitsData pattern)
    this.initializeTooltip(icon, message);
  }

  /**
   * Initialize tooltip (following highlightMissingBenefitsData pattern)
   */
  initializeTooltip(icon, message) {
    if (window.coreui && window.coreui.Tooltip) {
      new coreui.Tooltip(icon, {
        customClass: 'warning-tooltip'
      });
    } else if (window.bootstrap && window.bootstrap.Tooltip) {
      new bootstrap.Tooltip(icon, {
        title: message,
        placement: 'top',
        customClass: 'warning-tooltip',
        template: '<div class="tooltip warning-tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
      });
    }
  }

  /**
   * Add error message after field
   */
  addErrorMessage(field, message, isSelect2) {
    const feedback = document.createElement('div');
    feedback.className = 'invalid-feedback d-block';
    feedback.textContent = message;

    if (isSelect2) {
      const select2Container = field.nextElementSibling;
      if (select2Container && select2Container.classList.contains('select2-container')) {
        select2Container.after(feedback);
      } else {
        field.after(feedback);
      }
    } else {
      field.after(feedback);
    }
  }

  /**
   * Add success message after field (green checkmark style)
   */
  addSuccessMessage(field, message, isSelect2) {
    // Remove existing feedback first
    const $field = $(field);
    $field.siblings('.valid-feedback').remove();

    const feedback = document.createElement('div');
    feedback.className = 'valid-feedback d-block';
    feedback.innerHTML = `<i class="fas fa-check-circle text-success me-1"></i>${message}`;

    if (isSelect2) {
      const select2Container = field.nextElementSibling;
      if (select2Container && select2Container.classList.contains('select2-container')) {
        select2Container.after(feedback);
      } else {
        field.after(feedback);
      }
    } else {
      field.after(feedback);
    }
  }

  /**
   * Add success icon to field label (green checkmark)
   */
  addSuccessIcon(field, message) {
    const label = document.querySelector(`label[for="${field.id}"]`);
    if (!label) return;

    // Remove existing icons
    const existingIcons = label.querySelectorAll('.warning-icon, .critical-icon, .error-icon, .success-icon');
    existingIcons.forEach(icon => {
      this.disposeTooltip(icon);
      icon.remove();
    });

    // Add success icon
    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-check-circle text-success ms-1 success-icon';
    icon.title = 'Valid data';
    icon.setAttribute('data-coreui-toggle', 'tooltip');
    icon.setAttribute('data-coreui-placement', 'top');
    icon.setAttribute('data-coreui-title', message);
    label.appendChild(icon);

    // Initialize tooltip
    this.initializeTooltip(icon, message);
  }

  /**
   * Dispose tooltip properly (following highlightMissingBenefitsData pattern)
   */
  disposeTooltip(icon) {
    if (icon._tooltip) {
      icon._tooltip.dispose();
    }
    const bootstrapTooltip = window.bootstrap?.Tooltip?.getInstance?.(icon);
    if (bootstrapTooltip) {
      bootstrapTooltip.dispose();
    }
  }

  /**
   * Validate entire form with unified Critical → Warning → Error priority system
   */
  validateForm() {
    // console.log('🔍 UNIFIED - Starting comprehensive form validation...');

    let isFormValid = true;
    const errors = [];
    const warnings = [];
    const criticalIssues = [];

    try {
      // Step 1: Get required fields from visual indicators (*)
      const requiredFields = this.getRequiredFields();

      // Step 2: Check critical data (following highlightMissingBenefitsData pattern)
      const criticalResult = this.checkCriticalData();
      if (criticalResult.hasCritical) {
        criticalIssues.push(...criticalResult.issues);
        // Critical issues don't fail validation but show warnings
      }

      // Step 3: Validate required fields (Error level)
      const requiredResult = this.validateRequiredFields(requiredFields);
      if (!requiredResult.isValid) {
        errors.push(...requiredResult.errors);
        isFormValid = false;
      }

      // Step 4: Validate field formats (Error level)
      const formatResult = this.validateFieldFormats();
      if (!formatResult.isValid) {
        errors.push(...formatResult.errors);
        isFormValid = false;
      }

      // Step 5: Check warning conditions
      const warningResult = this.checkWarningConditions();
      if (warningResult.hasWarnings) {
        warnings.push(...warningResult.warnings);
      }

      // Enable Bootstrap validation display
      this.enableBootstrapValidation();

      // Log results
      // console.log(`🔍 UNIFIED - Validation Summary:`);
      // console.log(`  Critical Issues: ${criticalIssues.length}`);
      // console.log(`  Warnings: ${warnings.length}`);
      // console.log(`  Errors: ${errors.length}`);
      // console.log(`  Form Valid: ${isFormValid}`);

      return {
        isValid: isFormValid,
        errors: errors,
        warnings: warnings,
        critical: criticalIssues
      };

    } catch (error) {
      console.error('❌ Error during unified form validation:', error);
      return { isValid: false, errors: ['An error occurred during validation'] };
    }
  }

  /**
   * Get required fields from visual indicators
   */
  getRequiredFields() {
    const requiredFields = $('label:has(span[style*="color:red"])').map((i, label) => {
      const forId = $(label).attr('for');
      return forId ? document.getElementById(forId) : null;
    }).get().filter(field => field !== null);

    // console.log('🔍 UNIFIED - Required fields found:', requiredFields.length);
    return requiredFields;
  }

  /**
   * Check critical data (following highlightMissingBenefitsData pattern)
   */
  checkCriticalData() {
    // console.log('🔍 UNIFIED - Checking critical benefits data...');

    const companyID = document.getElementById('editCompany')?.value;
    const criticalIssues = [];

    // Define critical fields (from highlightMissingBenefitsData)
    let criticalFields = [
      { id: 'editLePayroll', name: 'Payroll (LE)' },
      { id: 'editLeBonus', name: 'Bonus (LE)' }
    ];

    // Add company-specific bonus type fields with DOM readiness check
    if (companyID === '1') {
      // BJC: Check both LE and BG bonus type fields
      const leBonusField = document.getElementById('editLeBonusType');
      const bgBonusField = document.getElementById('editBgBonusType');
      if (leBonusField && bgBonusField) {
        criticalFields.push(
          { id: 'editLeBonusType', name: 'LE Bonus Type' },
          { id: 'editBgBonusType', name: 'BG Bonus Type' }
        );
      }
    } else {
      // BIGC: Check single BG bonus type field
      const bonusField = document.getElementById('editBgBonusTypes');
      if (bonusField) {
        criticalFields.push({ id: 'editBgBonusTypes', name: 'Bonus Type' });
      }
    }

    // Check each critical field
    criticalFields.forEach(field => {
      const element = document.getElementById(field.id);
      if (element && this.isFieldVisible(field.id)) {
        const hasValue = element.value && element.value.toString().trim() !== '' && element.value !== 0;

        if (!hasValue) {
          // Apply critical styling
          this.setFieldHighlightState(element, 'critical', 'critical',
            `กรุณากรอกข้อมูล ${field.name} ที่สำคัญ`);
          criticalIssues.push(`${field.name} ขาดข้อมูลสำคัญ`);
        } else {
          // Clear critical styling if value exists (but keep other validations)
          this.clearCriticalStyling(element);
        }
      }
    });

    return {
      hasCritical: criticalIssues.length > 0,
      issues: criticalIssues
    };
  }

  /**
   * Validate required fields (Error level)
   */
  validateRequiredFields(requiredFields) {
    // console.log('🔍 UNIFIED - Validating required fields...');

    const errors = [];
    let visibleFieldsChecked = 0;

    requiredFields.forEach((field) => {
      const isVisible = this.isFieldVisible(field.id);

      if (isVisible) {
        visibleFieldsChecked++;
        const value = field.value ? field.value.trim() : '';
        const fieldLabel = this.getFieldLabel(field.id);

        if (!value) {
          // Apply error styling (but don't override critical)
          if (!field.classList.contains('missing-data-warning')) {
            this.setFieldHighlightState(field, 'invalid', 'error', `${fieldLabel} is required`);
          }
          errors.push(`${fieldLabel} is required`);
        } else {
          // Apply valid styling (if not already critical/warning)
          if (!field.classList.contains('missing-data-warning') &&
              !field.classList.contains('border-warning')) {
            this.setFieldHighlightState(field, 'valid', 'valid');
          }
        }
      }
    });

    // console.log(`✅ UNIFIED - Checked ${visibleFieldsChecked} visible required fields`);

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Validate field formats (Error level)
   */
  validateFieldFormats() {
    // console.log(`✅ UNIFIED - Checked ${visibleFieldsChecked} visible required fields`);

    return {
      isValid: isFormValid,
      errors: errors
    };
  }

  validateFieldFormats() {
    // console.log('🔍 UNIFIED - Validating field formats...');

    const errors = [];

    // Check numeric fields
    const allNumericFields = [...this.validationRules.common.numeric];
    allNumericFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field && this.isFieldVisible(fieldId) && field.value.trim()) {
        if (!this.validateNumericField(field)) {
          errors.push(`${this.getFieldLabel(fieldId)} must be a valid number`);
        }
      }
    });

    // Check decimal fields
    const decimalFields = this.currentCompanyId === '1' ? this.validationRules.BJC.decimal :
                         this.currentCompanyId === '2' ? this.validationRules.BIGC.decimal : [];

    [...this.validationRules.common.decimal, ...decimalFields].forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field && this.isFieldVisible(fieldId) && field.value.trim()) {
        if (!this.validateDecimalField(field)) {
          errors.push(`${this.getFieldLabel(fieldId)} must be a valid decimal number`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Check warning conditions
   */
  checkWarningConditions() {
    // console.log('🔍 UNIFIED - Checking warning conditions...');

    const warnings = [];

    // Check for potentially incomplete data
    const potentialWarningFields = ['editRemark', 'editJoinDate'];

    potentialWarningFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field && this.isFieldVisible(fieldId) && !field.value.trim() &&
          !field.classList.contains('missing-data-warning')) {
        this.setFieldHighlightState(field, 'warning', 'warning',
          `${this.getFieldLabel(fieldId)} ควรกรอกข้อมูลเพื่อความสมบูรณ์`);
        warnings.push(`${this.getFieldLabel(fieldId)} ควรกรอกข้อมูล`);
      }
    });

    return {
      hasWarnings: warnings.length > 0,
      warnings: warnings
    };
  }

  /**
   * Clear only critical styling (preserve other validation states)
   */
  clearCriticalStyling(field) {
    if (!field) return;

    // Remove critical classes only
    field.classList.remove('missing-data-warning', 'border-warning');

    // Handle Select2 cleanup for critical styling
    const isSelect2 = field.classList.contains('select2-hidden-accessible');
    if (isSelect2) {
      const select2Container = field.nextElementSibling;
      if (select2Container && select2Container.classList.contains('select2-container')) {
        const selectionElement = select2Container.querySelector('.select2-selection.select2-selection--single');
        if (selectionElement) {
          selectionElement.classList.remove('missing-data-warning');
        }
      }
    }

    // Remove critical/warning icons (but keep success icons)
    const label = document.querySelector(`label[for="${field.id}"]`);
    if (label) {
      const criticalIcons = label.querySelectorAll('.critical-icon, .warning-icon');
      criticalIcons.forEach(icon => {
        this.disposeTooltip(icon);
        icon.remove();
      });
    }
  }

  /**
   * Enable Bootstrap validation display
   */
  enableBootstrapValidation() {
    const forms = document.querySelectorAll('#editRowForm, #editRowGroupForm, #editRowAllocationForm, #editRowLeBenefitForm, #editRowBgBenefitForm');
    forms.forEach(form => {
      if (form && !form.classList.contains('was-validated')) {
        form.classList.add('was-validated');
      }
    });
  }

  /**
   * Enhanced validation error display with priority levels
   */
  showValidationErrors(result) {
    // Remove existing alerts
    $('.error-container').html('');

    let alertContent = '';

    // Show Critical Issues (highest priority - red)
    if (result.critical && result.critical.length > 0) {
      alertContent += `
        <div class="alert alert-danger alert-dismissible fade show mb-2" role="alert">
          <h6><i class="fas fa-exclamation-triangle me-2"></i>ข้อมูลสำคัญที่ขาดหายไป:</h6>
          <ul class="mb-0">
            ${result.critical.map(issue => `<li>${issue}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    // Show Validation Errors (medium priority - red)
    if (result.errors && result.errors.length > 0) {
      alertContent += `
        <div class="alert alert-danger alert-dismissible fade show mb-2" role="alert">
          <h6><i class="fas fa-times-circle me-2"></i>กรุณาแก้ไขข้อผิดพลาดต่อไปนี้:</h6>
          <ul class="mb-0">
            ${result.errors.map(error => `<li>${error}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    // Show Warnings (lowest priority - yellow)
    if (result.warnings && result.warnings.length > 0) {
      alertContent += `
        <div class="alert alert-warning alert-dismissible fade show mb-2" role="alert">
          <h6><i class="fas fa-info-circle me-2"></i>ข้อแนะนำ:</h6>
          <ul class="mb-0">
            ${result.warnings.map(warning => `<li>${warning}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    // Show alerts if any
    if (alertContent) {
      const errorContainer = $('#offcanvasAddRow .error-container');
      if (errorContainer.length > 0) {
        errorContainer.html(alertContent);
      } else {
        $('#offcanvasAddRow .offcanvas-body').prepend(`<div class="error-container">${alertContent}</div>`);
      }

      // Scroll to top of offcanvas
      $('#offcanvasAddRow .offcanvas-body').scrollTop(0);
    }
  }

  /**
   * Legacy method - redirects to new unified system
   * @deprecated Use setFieldHighlightState instead
   */
  setFieldValidationState(field, isValid, message = '') {
    const state = isValid ? 'valid' : 'invalid';
    this.setFieldHighlightState(field, state, 'error', message);
  }
  /**
   * Handle form submission
   */
  async handleFormSubmission(mode) {
    // console.log(`🔍 Form submission mode: ${mode}`);

    try {
      // Validate form using unified system
      const validationResult = this.validateForm();

      if (!validationResult.isValid) {
        // console.log('❌ Form validation failed');
        this.showValidationErrors(validationResult);
        return false;
      }

      // Show critical and warning messages but still allow submission
      if (validationResult.critical.length > 0 || validationResult.warnings.length > 0) {
        this.showValidationErrors(validationResult);
      }

      // Show loading state
      this.showSubmissionLoading(true);

      // Collect form data
      const formData = this.collectFormData();

      // Submit to API (use dynamic base URL for IIS virtual directory support)
      const apiBase = (window.AppConfig && window.AppConfig.apiBaseUrl) ? window.AppConfig.apiBaseUrl : './api/';
      const result = await this.submitToAPI(apiBase + 'budget/save', formData);

      if (result.success) {
        this.showSubmissionSuccess();

        if (mode === 'saveAndNew') {
          setTimeout(() => {
            this.resetForm();
          }, 1500);
        } else {
          setTimeout(() => {
            $('#offcanvasAddRow').offcanvas('hide');
          }, 1500);
        }
      } else {
        this.showSubmissionError(result.message || 'An error occurred while saving');
      }

    } catch (error) {
      console.error('❌ Form submission error:', error);
      this.showSubmissionError('An error occurred while saving');
    } finally {
      this.showSubmissionLoading(false);
    }
  }

  /**
   * Collect form data for submission
   */
  collectFormData() {
    const forms = ['#editRowForm', '#editRowGroupForm', '#editRowAllocationForm', '#editRowLeBenefitForm', '#editRowBgBenefitForm'];
    const formData = {};

    forms.forEach(formSelector => {
      const form = document.querySelector(formSelector);
      if (form) {
        const fields = form.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
          if (field.id && field.value !== '') {
            // Remove 'edit' prefix from field names for API
            const apiFieldName = field.id.replace(/^edit/, '');
            formData[apiFieldName] = field.value;
          }
        });
      }
    });

    return formData;
  }

  /**
   * Check if field should be treated as decimal
   */
  isDecimalField(fieldId) {
    const allDecimalFields = [
      ...this.validationRules.common.decimal,
      ...(this.currentCompanyId === '1' ? this.validationRules.BJC.decimal : []),
      ...(this.currentCompanyId === '2' ? this.validationRules.BIGC.decimal : [])
    ];

    return allDecimalFields.includes(fieldId);
  }

  /**
   * Submit data to API endpoint
   */
  async submitToAPI(endpoint, data) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Server error';

      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch (e) {
        // Use default error message
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result;
  }

  /**
   * Show/hide submission loading state
   */
  showSubmissionLoading(show) {
    if (show) {
      $('#btnSave, #btnSaveAndNew').prop('disabled', true)
        .html('<i class="fa fa-spinner fa-spin me-2"></i>Saving...');
    } else {
      $('#btnSave').prop('disabled', false).html('<i class="fa fa-save me-2"></i>Save');
      $('#btnSaveAndNew').prop('disabled', false).html('<i class="fa fa-plus me-2"></i>Save & New');
    }
  }

  /**
   * Show submission success message
   */
  showSubmissionSuccess() {
    const successAlert = `
      <div class="alert alert-success alert-dismissible fade show" role="alert">
        <i class="fas fa-check-circle me-2"></i>
        Data saved successfully!
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;

    const errorContainer = $('#offcanvasAddRow .error-container');
    if (errorContainer.length > 0) {
      errorContainer.html(successAlert);
    } else {
      $('#offcanvasAddRow .offcanvas-body').prepend(`<div class="error-container">${successAlert}</div>`);
    }

    $('#offcanvasAddRow .offcanvas-body').scrollTop(0);
  }

  /**
   * Show submission error message
   */
  showSubmissionError(message) {
    const errorAlert = `
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="fas fa-exclamation-triangle me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;

    const errorContainer = $('#offcanvasAddRow .error-container');
    if (errorContainer.length > 0) {
      errorContainer.html(errorAlert);
    } else {
      $('#offcanvasAddRow .offcanvas-body').prepend(`<div class="error-container">${errorAlert}</div>`);
    }

    $('#offcanvasAddRow .offcanvas-body').scrollTop(0);
  }

  /**
   * Reset form to initial state
   */
  resetForm() {
    const forms = document.querySelectorAll('#editRowForm, #editRowGroupForm, #editRowAllocationForm, #editRowLeBenefitForm, #editRowBgBenefitForm');

    forms.forEach(form => {
      if (form) {
        form.reset();
        form.classList.remove('was-validated');

        // Clear all validation states
        const fields = form.querySelectorAll('input, select, textarea');
        fields.forEach(field => this.clearFieldHighlightState(field));
      }
    });

    $('.error-container').html('');
  }

  /**
   * Cleanup validator
   */
  destroy() {
    // Remove event listeners
    $(document).off('.budgetFormSubmission');
    $(document).off('.companyValidation');

    // Clean up real-time validation
    this.cleanupRealTimeValidation();

    // Clear validation states
    const forms = document.querySelectorAll('#editRowForm, #editRowGroupForm, #editRowAllocationForm, #editRowLeBenefitForm, #editRowBgBenefitForm');
    forms.forEach(form => {
      if (form) {
        const fields = form.querySelectorAll('input, select, textarea');
        fields.forEach(field => this.clearFieldHighlightState(field));
      }
    });

    this.isInitialized = false;
    // console.log('🗑️ BudgetFormValidator destroyed and cleaned up');
  }

  /**
   * Legacy method - redirects to new unified system
   * @deprecated Use setFieldHighlightState instead
   */
  setFieldValidationState(field, isValid, message = '') {
    const state = isValid ? 'valid' : 'invalid';
    this.setFieldHighlightState(field, state, 'error', message);
  }

  /**
   * Get field label text
   */
  getFieldLabel(fieldId) {
    const label = document.querySelector(`label[for="${fieldId}"]`);
    if (label) {
      const labelText = label.textContent || label.innerText;
      return labelText.replace(/\s*\*\s*$/, '').trim(); // Remove asterisk
    }
    return fieldId; // Fallback to field ID
  }
}

// Create and initialize global instance
window.budgetFormValidator = new BudgetFormValidator();

// 🔧 FIX: Auto-initialize immediately to prevent module loading errors
if (window.budgetFormValidator && !window.budgetFormValidator.isInitialized) {
  window.budgetFormValidator.initialize();
  // console.log('🔧 BudgetFormValidator auto-initialized successfully');
}

// 🔧 Setup real-time validation after Select2 is ready
$(document).on('select2:ready', function(e) {
  // console.log('🔥 Select2 ready detected, setting up validation...');
  if (window.budgetFormValidator && window.budgetFormValidator.isInitialized) {
    window.budgetFormValidator.forceSetupRealTimeValidation();
  }
});

// 🔧 Alternative: Setup after any Select2 initialization
$(document).on('select2:open', function(e) {
  // console.log('🔥 Select2 opened, ensuring validation is setup...');
  if (window.budgetFormValidator && window.budgetFormValidator.isInitialized) {
    setTimeout(() => {
      window.budgetFormValidator.forceSetupRealTimeValidation();
    }, 100);
  }
});

// 🔧 Global helper function for debugging
window.testBudgetValidation = function() {
  // console.log('🧪 Testing Budget Validation System...');

  if (window.budgetFormValidator) {
    // console.log('📋 Current validation fields:');
    const fields = window.budgetFormValidator.getCriticalFieldsList();
    fields.forEach(f => {
      const element = document.getElementById(f.id);
      // console.log(`  ${f.id} (${f.type}): exists=${!!element}, isSelect2=${element?.classList.contains('select2-hidden-accessible')}`);
    });

    // console.log('🔧 Force setup real-time validation...');
    window.budgetFormValidator.forceSetupRealTimeValidation();
  } else {
    // console.log('❌ Budget form validator not found');
  }
};

// 🔧 Global test function for individual field validation
window.testFieldValidation = function(fieldId) {
  // console.log(`🧪 Testing field validation for: ${fieldId}`);

  const field = document.getElementById(fieldId);
  if (field && window.budgetFormValidator) {
    const fieldConfig = { id: fieldId, name: fieldId.replace('edit', ''), type: 'required' };
    window.budgetFormValidator.validateFieldRealTime(fieldConfig, field);
  } else {
    // console.log(`❌ Field ${fieldId} not found or validator not ready`);
  }
};

// console.log('✅ Enhanced Budget Form Validator loaded with:');
// console.log('   📋 Unified Critical → Warning → Error system');
// console.log('   ⚡ Real-time validation for ALL required Select2 fields');
// console.log('   🎯 Critical data validation (Payroll, Bonus Types)');
// console.log('   ✅ Green checkmark success indicators');
// console.log('   🔄 Conditional validation based on company selection');
// console.log('   📝 Format validation for numeric/decimal fields');
// console.log('');
// console.log('🔧 Debug commands available:');
// console.log('   - testBudgetValidation(): Test the validation system');
// console.log('   - testFieldValidation("editCompany"): Test specific field');
