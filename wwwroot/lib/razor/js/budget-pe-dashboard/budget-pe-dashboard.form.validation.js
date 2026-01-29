/**
 * PE Dashboard Filter Validation - Real-time Dropdown Validation with Success Icons
 * Adapted from Budget Planning Form Validator for filter dropdowns only
 * Shows green checkmarks (✅) when required dropdowns are selected
 */

/**
 * PE Dashboard Filter Validator - Lightweight version for filter validation only
 */
class PEDashboardFilterValidator {
  constructor() {
    this.requiredFilters = ['companyFilter', 'yearsFilter']; // Required filters
    this.isInitialized = false;
  }

  /**
   * Initialize the filter validator
   */
  initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Setup real-time validation for filter dropdowns
      this.setupFilterValidation();

      this.isInitialized = true;
      console.log('✅ PE Dashboard Filter Validator initialized');

    } catch (error) {
      console.error('❌ Error initializing PE Dashboard Filter Validator:', error);
    }
  }

  /**
   * Setup real-time validation for filter dropdowns
   */
  setupFilterValidation() {
    // Delay setup to ensure DOM and Select2 are ready
    setTimeout(() => {
      this.requiredFilters.forEach(filterId => {
        const field = document.getElementById(filterId);
        if (field) {
          // Remove existing real-time listeners
          $(field).off('.peDashboardValidation');

          // Check if it's a Select2 dropdown
          const isSelect2 = field.classList.contains('select2-hidden-accessible');

          if (isSelect2) {
            // For Select2 dropdowns, listen to select2 events
            $(field).on('select2:select.peDashboardValidation select2:unselect.peDashboardValidation select2:clear.peDashboardValidation change.peDashboardValidation', (e) => {
              setTimeout(() => {
                this.validateFilterRealTime(filterId, field);
              }, 50); // Small delay to ensure Select2 value is updated
            });
          } else {
            // For regular select dropdowns
            $(field).on('change.peDashboardValidation', (e) => {
              this.validateFilterRealTime(filterId, e.target);
            });
          }

          console.log(`✅ Validation setup for: ${filterId}`);
        } else {
          console.log(`❌ Filter not found: ${filterId}`);
        }
      });

      // Also validate optional filters for better UX
      const optionalFilters = ['cosFilter', 'divFilter', 'deptFilter', 'secFilter', 'compstoreFilter', 'empstatFilter', 'posFilter', 'jbandFilter'];
      optionalFilters.forEach(filterId => {
        const field = document.getElementById(filterId);
        if (field) {
          $(field).off('.peDashboardValidation');

          const isSelect2 = field.classList.contains('select2-hidden-accessible');
          if (isSelect2) {
            $(field).on('select2:select.peDashboardValidation select2:unselect.peDashboardValidation select2:clear.peDashboardValidation change.peDashboardValidation', (e) => {
              setTimeout(() => {
                this.validateFilterRealTime(filterId, field);
              }, 50);
            });
          } else {
            $(field).on('change.peDashboardValidation', (e) => {
              this.validateFilterRealTime(filterId, e.target);
            });
          }
        }
      });

    }, 500); // Give time for Select2 initialization
  }

  /**
   * Validate filter in real-time
   */
  validateFilterRealTime(filterId, fieldElement) {
    if (!fieldElement) return;

    const value = fieldElement.value ? fieldElement.value.toString().trim() : '';
    const hasValue = value !== '' && value !== '0';

    // Check if this is a required filter
    const isRequired = this.requiredFilters.includes(filterId);

    if (hasValue) {
      // Show success state with green checkmark
      this.showValidIcon(fieldElement);
    } else {
      // Clear validation state
      this.clearValidIcon(fieldElement);

      // If required but empty, could show error (but we keep it simple for filters)
      if (isRequired) {
        // For filters, we don't show red errors, just remove green checkmarks
        this.clearValidIcon(fieldElement);
      }
    }
  }

  /**
   * Show green checkmark validation icon
   */
  showValidIcon(field) {
    // Add Bootstrap validation class
    field.classList.add('is-valid');
    field.classList.remove('is-invalid');

    // Handle Select2 styling
    const isSelect2 = field.classList.contains('select2-hidden-accessible');
    if (isSelect2) {
      const select2Container = field.nextElementSibling;
      if (select2Container && select2Container.classList.contains('select2-container')) {
        select2Container.classList.add('select2-valid');
        select2Container.classList.remove('select2-invalid');
      }
    }

    // Add green checkmark icon to label
    const label = document.querySelector(`label[for="${field.id}"]`);
    if (label && !label.querySelector('.success-icon')) {
      // Remove any existing icons first
      const existingIcons = label.querySelectorAll('.success-icon, .error-icon, .warning-icon');
      existingIcons.forEach(icon => {
        this.disposeTooltip(icon);
        icon.remove();
      });

      // Add success icon
      const icon = document.createElement('i');
      icon.className = 'fa-solid fa-check-circle text-success ms-1 success-icon';
      icon.title = 'Valid selection';
      icon.setAttribute('data-coreui-toggle', 'tooltip');
      icon.setAttribute('data-coreui-placement', 'top');
      icon.setAttribute('data-coreui-title', 'Valid selection');
      label.appendChild(icon);

      // Initialize tooltip
      this.initializeTooltip(icon, 'Valid selection');
    }
  }

  /**
   * Clear validation icon
   */
  clearValidIcon(field) {
    if (!field) return;

    // Remove Bootstrap validation classes
    field.classList.remove('is-valid', 'is-invalid');

    // Handle Select2 cleanup
    const isSelect2 = field.classList.contains('select2-hidden-accessible');
    if (isSelect2) {
      const select2Container = field.nextElementSibling;
      if (select2Container && select2Container.classList.contains('select2-container')) {
        select2Container.classList.remove('select2-valid', 'select2-invalid');
      }
    }

    // Remove icons from label
    const label = document.querySelector(`label[for="${field.id}"]`);
    if (label) {
      const icons = label.querySelectorAll('.success-icon, .error-icon, .warning-icon');
      icons.forEach(icon => {
        this.disposeTooltip(icon);
        icon.remove();
      });
    }
  }

  /**
   * Initialize tooltip (following CoreUI pattern)
   */
  initializeTooltip(icon, message) {
    if (window.coreui && window.coreui.Tooltip) {
      new coreui.Tooltip(icon, {
        customClass: 'validation-tooltip'
      });
    } else if (window.bootstrap && window.bootstrap.Tooltip) {
      new bootstrap.Tooltip(icon, {
        title: message,
        placement: 'top',
        customClass: 'validation-tooltip'
      });
    }
  }

  /**
   * Dispose tooltip properly
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
   * Validate all filters at once (useful for form submission)
   */
  validateAllFilters() {
    let isValid = true;
    const errors = [];

    this.requiredFilters.forEach(filterId => {
      const field = document.getElementById(filterId);
      if (field) {
        const value = field.value ? field.value.trim() : '';
        if (!value) {
          isValid = false;
          const labelText = this.getFieldLabel(filterId);
          errors.push(`${labelText} is required`);
          this.clearValidIcon(field);
        } else {
          this.showValidIcon(field);
        }
      }
    });

    return {
      isValid: isValid,
      errors: errors
    };
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
    return fieldId;
  }

  /**
   * Force setup validation (can be called manually after dynamic changes)
   */
  forceSetupValidation() {
    console.log('🔧 Force setup PE Dashboard filter validation...');
    this.setupFilterValidation();
  }

  /**
   * Reset all validation states
   */
  resetAllValidation() {
    this.requiredFilters.forEach(filterId => {
      const field = document.getElementById(filterId);
      if (field) {
        this.clearValidIcon(field);
      }
    });

    // Also reset optional filters
    const optionalFilters = ['cosFilter', 'divFilter', 'deptFilter', 'secFilter', 'compstoreFilter', 'empstatFilter', 'posFilter', 'jbandFilter'];
    optionalFilters.forEach(filterId => {
      const field = document.getElementById(filterId);
      if (field) {
        this.clearValidIcon(field);
      }
    });
  }

  /**
   * Cleanup validator
   */
  destroy() {
    // Remove event listeners
    this.requiredFilters.forEach(filterId => {
      const field = document.getElementById(filterId);
      if (field) {
        $(field).off('.peDashboardValidation');
        this.clearValidIcon(field);
      }
    });

    this.isInitialized = false;
    console.log('🗑️ PE Dashboard Filter Validator destroyed');
  }
}

// Create and initialize global instance
window.peDashboardFilterValidator = new PEDashboardFilterValidator();

// Auto-initialize after DOM is ready
$(document).ready(function() {
  setTimeout(() => {
    if (window.peDashboardFilterValidator && !window.peDashboardFilterValidator.isInitialized) {
      window.peDashboardFilterValidator.initialize();
      console.log('🔧 PE Dashboard Filter Validator auto-initialized');
    }
  }, 1000); // Wait for Select2 to be ready
});

// Setup validation after Select2 is ready
$(document).on('select2:ready', function(e) {
  if (window.peDashboardFilterValidator && window.peDashboardFilterValidator.isInitialized) {
    window.peDashboardFilterValidator.forceSetupValidation();
  }
});

// Global helper function for debugging
window.testPEDashboardValidation = function() {
  console.log('🧪 Testing PE Dashboard Filter Validation System...');

  if (window.peDashboardFilterValidator) {
    console.log('📋 Required filters:', window.peDashboardFilterValidator.requiredFilters);

    const result = window.peDashboardFilterValidator.validateAllFilters();
    console.log('Validation result:', result);
  } else {
    console.log('❌ PE Dashboard filter validator not found');
  }
};

console.log('✅ PE Dashboard Filter Validator loaded');
console.log('   ⚡ Real-time validation for Company & Budget Year dropdowns');
console.log('   ✅ Green checkmark success indicators');
console.log('   🔧 Debug: testPEDashboardValidation()');
