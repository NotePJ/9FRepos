/**
 * Budget Dynamic Forms Manager
 * Handles company-specific field display and form management for BJC/BIGC models
 * Updated: October 3, 2025 - Uses centralized configurations from budget.config.js
 */

// Company Form Configuration - Legacy Compatibility
const COMPANY_FORM_CONFIG = {
  BJC: {
    id: 1,
    code: 'BJC',
    name: 'BJC',
    specific_fields: {
      // Personal Info - BJC Specific
      personal: [],

      // Benefits - BJC Specific LE Fields (Complete baseColumns)
      le_benefits: {
        // Core fields (always present)
        core: ['editLePayroll', 'editLePremium', 'editLeBonusType'],

        // BJC-specific allowances
        allowances: [
          'editLeBonus', 'editLeCarAllowance', 'editLeLicenseAllowance',
          'editLeHousingAllowance', 'editLeCarGasoline', 'editLeOutsourceWages',
          'editLeSkillAllowancePc', 'editLeSalesManagementPc', 'editLeShelfStackingPc',
          'editLeDiligenceAllowancePc', 'editLePostAllowancePc', 'editLePhoneAllowancePc',
          'editLeTransportationPc', 'editLeOtherAllowancePc'
        ],

        // BJC-specific benefits
        benefits: [
          'editLeSocialSecurity', 'editLeWorkmenCompensation', 'editLeProvidentFund',
          'editLeOther', 'editLeLifeInsurance', 'editLeMedicalOutside',
          'editLeMedicalInHouse', 'editLeStaffActivities', 'editLeUniform',
          'editLeMealAllowance'
        ],

        // Car & Fleet Section
        carFleet: [
          'editLeCompCarsGas', 'editLeCompCarsOther', 'editLeCarRental',
          'editLeCarRepair', 'editLeCarMaintenance'
        ],

        // BJC-Specific Fields
        bjcSpecific: [
          'editLeTemporaryStaffSal', 'editLeSalTemp', 'editLeSocialSecurityTmp',
          'editLeCarMaintenanceTmp', 'editLeSouthriskAllowance', 'editLeSouthriskAllowanceTmp',
          'editLeSalesCarAllowance', 'editLeAccommodation', 'editLeOthersSubjectTax',
          'editLeSalWithEn', 'editLeSalNotEn'
        ],

        // BJC-specific PE calculations
        calculations: [
          'editLePeMth', 'editLePeYear', 'editLePeSbMth', 'editLePeSbYear'
        ]
      },

      // Benefits - BJC Specific Budget Fields (Complete baseColumns)
      bg_benefits: {
        // Core fields
        core: ['editBgPayroll', 'editBgPremium', 'editBgBonusType'],

        // BJC-specific allowances
        allowances: [
          'editBgBonus', 'editBgCarAllowance', 'editBgLicenseAllowance',
          'editBgHousingAllowance', 'editBgCarGasoline', 'editBgOutsourceWages',
          'editBgSkillAllowancePc', 'editBgSalesManagementPc', 'editBgShelfStackingPc',
          'editBgDiligenceAllowancePc', 'editBgPostAllowancePc', 'editBgPhoneAllowancePc',
          'editBgTransportationPc', 'editBgOtherAllowancePc'
        ],

        // BJC-specific benefits
        benefits: [
          'editBgSocialSecurity', 'editBgWorkmenCompensation', 'editBgProvidentFund',
          'editBgOther', 'editBgLifeInsurance', 'editBgMedicalOutside',
          'editBgMedicalInHouse', 'editBgStaffActivities', 'editBgUniform',
          'editBgMealAllowance'
        ],

        // Car & Fleet Section
        carFleet: [
          'editBgCompCarsGas', 'editBgCompCarsOther', 'editBgCarRental',
          'editBgCarRepair', 'editBgCarMaintenance'
        ],

        // BJC-Specific Fields
        bjcSpecific: [
          'editBgTemporaryStaffSal', 'editBgSalTemp', 'editBgSocialSecurityTmp',
          'editBgCarMaintenanceTmp', 'editBgSouthriskAllowance', 'editBgSouthriskAllowanceTmp',
          'editBgSalesCarAllowance', 'editBgAccommodation', 'editBgOthersSubjectTax',
          'editBgSalWithEn', 'editBgSalNotEn'
        ],

        // BJC-specific PE calculations
        calculations: [
          'editBgPeMth', 'editBgPeYear', 'editBgPeSbMth', 'editBgPeSbYear'
        ]
      }
    },

    // Fields unique to BJC (different from BIGC)
    unique_fields: [
      // Salary fields
      'editSalWithEn', 'editSalNotEn', 'editSalTemp',
      // Social Security fields
      'editSocialSecurityTmp',
      // Car & Vehicle fields
      'editCarMaintenanceTmp', 'editSalesCarAllowance',
      // Regional fields
      'editSouthriskAllowance', 'editSouthriskAllowanceTmp',
      // Accommodation
      'editAccommodation',
      // Tax-related
      'editOthersSubjectTax',
      // PC (Performance-based) allowances
      'editSkillAllowancePc', 'editSalesManagementPc', 'editShelfStackingPc',
      'editDiligenceAllowancePc', 'editPostAllowancePc', 'editPhoneAllowancePc',
      'editTransportationPc', 'editOtherAllowancePc'
    ]
  },

  BIGC: {
    id: 2,
    code: 'BIGC',
    name: 'BIGC',
    specific_fields: {
      // Personal Info - BIGC Specific
      personal: [],

      // Benefits - BIGC Specific LE Fields (Complete baseColumns)
      le_benefits: {
        // Core fields (always present)
        core: ['editLePayroll', 'editLeTotalPayroll', 'editLePremium'],

        // BIGC-specific allowances
        allowances: [
          'editLeBonus', 'editLeFleetCardPe', 'editLeCarRentalPe',
          'editLeCarAllowance', 'editLeLicenseAllowance', 'editLeHousingAllowance',
          'editLeGasolineAllowance', 'editLeWageStudent', 'editLeOtherAllowance',
          'editLeSkillPayAllowance'
        ],

        // BIGC-specific benefits
        benefits: [
          'editLeSocialSecurity', 'editLeLaborFundFee', 'editLeOtherStaffBenefit',
          'editLeProvidentFund', 'editLeEmployeeWelfare', 'editLeProvision',
          'editLeInterest', 'editLeStaffInsurance', 'editLeMedicalExpense',
          'editLeMedicalInHouse', 'editLeTraining', 'editLeLongService'
        ],

        // BIGC-specific PE calculations
        calculations: [
          'editLePeMth', 'editLePeYear', 'editLePeSbMth', 'editLePeSbYear'
        ]
      },

      // Benefits - BIGC Specific Budget Fields (Complete baseColumns)
      bg_benefits: {
        // Core fields (always present)
        core: ['editBgPayroll', 'editBgTotalPayroll', 'editBgPremium', 'editBgBonusTypes'],

        // BIGC-specific allowances
        allowances: [
          'editBgBonus', 'editBgFleetCardPe', 'editBgCarRentalPe',
          'editBgCarAllowance', 'editBgLicenseAllowance', 'editBgHousingAllowance',
          'editBgGasolineAllowance', 'editBgWageStudent', 'editBgOtherAllowance',
          'editBgSkillPayAllowance'
        ],

        // BIGC-specific benefits
        benefits: [
          'editBgSocialSecurity', 'editBgLaborFundFee', 'editBgOtherStaffBenefit',
          'editBgProvidentFund', 'editBgEmployeeWelfare', 'editBgProvision',
          'editBgInterest', 'editBgStaffInsurance', 'editBgMedicalExpense',
          'editBgMedicalInHouse', 'editBgTraining', 'editBgLongService'
        ],

        // BIGC-specific PE calculations
        calculations: [
          'editBgPeMth', 'editBgPeYear', 'editBgPeSbMth', 'editBgPeSbYear'
        ]
      }
    },

    // Fields unique to BIGC (different from BJC)
    unique_fields: [
      // Total payroll field
      'editTotalPayroll',
      // Fleet & Car fields
      'editFleetCardPe', 'editCarRentalPe',
      // Student wages
      'editWageStudent',
      // Gasoline allowances
      'editGasolineAllowance',
      // Labor fund
      'editLaborFundFee',
      // Welfare & benefits
      'editEmployeeWelfare', 'editProvision', 'editInterest',
      'editStaffInsurance', 'editMedicalExpense', 'editTraining',
      'editLongService', 'editOtherStaffBenefit',
      // Bonus types field
      'editBonusTypes'
    ]
  }
};

// Helper function to get field configurations with fallback to window references
function getBjcFieldConfig() {
  return {
    company: 'BJC',
    useCustomOrder: true,
    get orderConfigLE() { return window.BJC_CUSTOMER_FIELD_ORDER_LE || []; },
    get orderConfigBG() { return window.BJC_CUSTOMER_FIELD_ORDER_BG || []; },
    get orderConfigSummary() { return window.BJC_CUSTOMER_FIELD_ORDER_SUMMARY || []; },
    get glMapping() { return window.BJC_GL_MAPPING || {}; },

    getFieldLabel: function(fieldId, baseLabel) {
      const glMapping = this.glMapping;
      const glNumber = glMapping[fieldId];
      return glNumber ? `${baseLabel} [GL: ${glNumber}]` : baseLabel;
    },

    orderFields: function(fields, type = 'LE') {
      let orderConfig;
      switch(type.toUpperCase()) {
        case 'LE':
          orderConfig = this.orderConfigLE;
          break;
        case 'BG':
        case 'BUDGET':
          orderConfig = this.orderConfigBG;
          break;
        case 'SUMMARY':
          orderConfig = this.orderConfigSummary;
          break;
        default:
          orderConfig = this.orderConfigLE;
      }

      return fields.sort((a, b) => {
        const indexA = orderConfig.indexOf(a.field || a.id);
        const indexB = orderConfig.indexOf(b.field || b.id);
        return indexA !== -1 && indexB !== -1 ? indexA - indexB : 0;
      });
    }
  };
}

function getBigcFieldConfig() {
  return {
    company: 'BIGC',
    useCustomOrder: true,
    get orderConfigLE() { return window.BIGC_CUSTOMER_FIELD_ORDER_LE || []; },
    get orderConfigBG() { return window.BIGC_CUSTOMER_FIELD_ORDER_BG || []; },
    get orderConfigSummary() { return window.BIGC_CUSTOMER_FIELD_ORDER_SUMMARY || []; },
    get glMapping() { return window.BIGC_GL_MAPPING || {}; },

    getFieldLabel: function(fieldId, baseLabel) {
      const glMapping = this.glMapping;
      const glNumber = glMapping[fieldId];
      return glNumber ? `${baseLabel} [GL: ${glNumber}]` : baseLabel;
    },

    orderFields: function(fields, type = 'LE') {
      let orderConfig;
      switch(type.toUpperCase()) {
        case 'LE':
          orderConfig = this.orderConfigLE;
          break;
        case 'BG':
        case 'BUDGET':
          orderConfig = this.orderConfigBG;
          break;
        case 'SUMMARY':
          orderConfig = this.orderConfigSummary;
          break;
        default:
          orderConfig = this.orderConfigLE;
      }

      return fields.sort((a, b) => {
        const indexA = orderConfig.indexOf(a.field || a.id);
        const indexB = orderConfig.indexOf(b.field || b.id);
        return indexA !== -1 && indexB !== -1 ? indexA - indexB : 0;
      });
    }
  };
}

// Base fields that are common across all companies
const BASE_FIELDS = {
  personal: [
    'editEmployeeId', 'editEmployeeName', 'editPositionId', 'editJobBandId',
    'editCostCenterId', 'editGLAccountId', 'editStartDate', 'editEndDate'
  ],
  payroll: [
    'editLePayroll', 'editBgPayroll'
  ],
  common: [
    'editCreatedBy', 'editCreatedDate', 'editUpdatedBy', 'editUpdatedDate'
  ]
};

// Company Configuration Manager
const COMPANY_CONFIG_MANAGER = {
  currentCompany: null,
  currentConfig: null,

  setCompany: function(companyId) {
    this.currentCompany = companyId;

    if (companyId === '1') {
      this.currentConfig = COMPANY_FORM_CONFIG.BJC;
    } else if (companyId === '2') {
      this.currentConfig = COMPANY_FORM_CONFIG.BIGC;
    } else {
      this.currentConfig = null;
    }

    // console.log(`🏢 Dynamic Forms: Company set to ${this.currentConfig?.name || 'Unknown'} (ID: ${companyId})`);
  },

  getCompanyConfig: function(companyId = null) {
    const targetId = companyId || this.currentCompany;

    if (targetId === '1') return COMPANY_FORM_CONFIG.BJC;
    if (targetId === '2') return COMPANY_FORM_CONFIG.BIGC;

    return this.currentConfig;
  },

  getFieldsForSection: function(section, subSection = null, companyId = null) {
    const config = this.getCompanyConfig(companyId);

    if (!config) return [];

    if (subSection) {
      return config.specific_fields[section]?.[subSection] || [];
    }

    return config.specific_fields[section] || [];
  },

  getUniqueFields: function(companyId = null) {
    const config = this.getCompanyConfig(companyId);
    return config?.unique_fields || [];
  },

  isFieldVisible: function(fieldId, companyId = null) {
    const config = this.getCompanyConfig(companyId);

    if (!config) return true; // Default to visible if no config

    // Check if field exists in any section
    const sections = config.specific_fields;

    for (const sectionKey in sections) {
      const section = sections[sectionKey];

      if (Array.isArray(section)) {
        if (section.includes(fieldId)) return true;
      } else if (typeof section === 'object') {
        for (const subSectionKey in section) {
          if (Array.isArray(section[subSectionKey]) && section[subSectionKey].includes(fieldId)) {
            return true;
          }
        }
      }
    }

    // Also check unique fields
    if (config.unique_fields?.includes(fieldId)) return true;

    // Check base fields (always visible)
    for (const baseSection in BASE_FIELDS) {
      if (BASE_FIELDS[baseSection].includes(fieldId)) return true;
    }

    return false;
  }
};

/**
 * Budget Dynamic Forms Manager Class
 */
class BudgetDynamicFormsManager {
  constructor() {
    this.currentCompany = null;
    this.isInitialized = false;
    this.dynamicContainers = {};

    // Bind methods
    this.handleCompanyChange = this.handleCompanyChange.bind(this);
    this.showCompanyFields = this.showCompanyFields.bind(this);
    this.hideCompanyFields = this.hideCompanyFields.bind(this);
  }

  /**
   * Initialize the dynamic forms manager
   */
  initialize() {
    if (this.isInitialized) {
      // console.log('🔄 Dynamic Forms Manager already initialized');
      return;
    }

    // console.log('🏗️ Initializing Budget Dynamic Forms Manager');

    try {
      // Setup company change detection
      this.setupCompanyChangeDetection();

      // Apply initial company configuration
      this.detectAndApplyCompanyConfig();

      this.isInitialized = true;
      // console.log('✅ Dynamic Forms Manager initialized successfully');

    } catch (error) {
      // console.error('❌ Error initializing Dynamic Forms Manager:', error);
    }
  }

  /**
   * Setup company change detection
   */
  setupCompanyChangeDetection() {
    // Listen to custom company change events
    window.addEventListener('companyFieldsUpdated', this.handleCompanyChange);

    // Also listen to direct dropdown changes
    $('#editCompany').on('change.dynamicForms', (e) => {
      const companyId = $(e.target).val();
      this.applyCompanyConfiguration(companyId);
    });

    // console.log('🔍 Dynamic forms company change detection setup');
  }

  /**
   * Handle company change event
   */
  handleCompanyChange(event) {
    const { companyId } = event.detail || {};
    // console.log('🔄 Dynamic forms handling company change:', companyId);

    if (companyId && companyId !== this.currentCompany) {
      this.applyCompanyConfiguration(companyId);
    }
  }

  /**
   * Detect current company and apply configuration
   */
  detectAndApplyCompanyConfig() {
    // Get current company from various sources
    const companyId = $('#editCompany').val() || $('#companyFilter').val() || '2'; // Default to BIGC

    // console.log('🎯 Detecting current company for dynamic forms:', companyId);
    this.applyCompanyConfiguration(companyId);
  }

  /**
   * Apply company-specific configuration
   */
  applyCompanyConfiguration(companyId) {
    // console.log(`🏗️ Applying dynamic forms configuration for company: ${companyId}`);

    try {
      this.currentCompany = companyId;

      // Update company configuration manager
      COMPANY_CONFIG_MANAGER.setCompany(companyId);

      // Show/hide fields based on company
      this.toggleFieldsByCompany(companyId);

      // Apply company-specific field ordering (if available)
      this.applyCompanyFieldOrdering(companyId);

      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('dynamicFormsUpdated', {
        detail: { companyId, timestamp: new Date().toISOString() }
      }));

      // console.log('✅ Dynamic forms configuration applied successfully');

    } catch (error) {
      // console.error('❌ Error applying dynamic forms configuration:', error);
    }
  }

  /**
   * Toggle field visibility based on company
   */
  toggleFieldsByCompany(companyId) {
    // console.log(`👁️ Toggling field visibility for company: ${companyId}`);

    const config = COMPANY_CONFIG_MANAGER.getCompanyConfig(companyId);

    if (!config) {
      // console.warn('⚠️ No configuration found for company:', companyId);
      return;
    }

    // Show fields specific to current company
    this.showCompanyFields(companyId);

    // Hide fields specific to other companies
    const otherCompanyId = companyId === '1' ? '2' : '1';
    this.hideCompanyFields(otherCompanyId);
  }

  /**
   * Show fields for specific company
   */
  showCompanyFields(companyId) {
    const fieldsToShow = this.getAllCompanyFields(companyId);

    fieldsToShow.forEach(fieldId => {
      const element = $(`#${fieldId}, [data-field="${fieldId}"], .${fieldId}-container`);
      if (element.length) {
        element.show().removeClass('d-none');
      }
    });

    // console.log(`👁️ Showed ${fieldsToShow.length} fields for company ${companyId}`);
  }

  /**
   * Hide fields for specific company
   */
  hideCompanyFields(companyId) {
    const fieldsToHide = this.getAllCompanyFields(companyId);

    fieldsToHide.forEach(fieldId => {
      const element = $(`#${fieldId}, [data-field="${fieldId}"], .${fieldId}-container`);
      if (element.length) {
        element.hide().addClass('d-none');
      }
    });

    // console.log(`🙈 Hid ${fieldsToHide.length} fields for company ${companyId}`);
  }

  /**
   * Get all fields for a company
   */
  getAllCompanyFields(companyId) {
    const config = COMPANY_CONFIG_MANAGER.getCompanyConfig(companyId);

    if (!config) return [];

    const allFields = new Set();

    // Add fields from all sections
    const sections = config.specific_fields;

    for (const sectionKey in sections) {
      const section = sections[sectionKey];

      if (Array.isArray(section)) {
        section.forEach(field => allFields.add(field));
      } else if (typeof section === 'object') {
        for (const subSectionKey in section) {
          if (Array.isArray(section[subSectionKey])) {
            section[subSectionKey].forEach(field => allFields.add(field));
          }
        }
      }
    }

    // Add unique fields
    if (config.unique_fields) {
      config.unique_fields.forEach(field => allFields.add(field));
    }

    return Array.from(allFields);
  }

  /**
   * Apply company-specific field ordering
   */
  applyCompanyFieldOrdering(companyId) {
    // console.log(`📋 Applying field ordering for company: ${companyId}`);

    try {
      let fieldConfig;

      if (companyId === '1') {
        fieldConfig = getBjcFieldConfig();
      } else if (companyId === '2') {
        fieldConfig = getBigcFieldConfig();
      }

      if (fieldConfig && fieldConfig.useCustomOrder) {
        // Apply ordering to form containers
        this.reorderFormFields(fieldConfig);
      }

    } catch (error) {
      console.error('❌ Error applying field ordering:', error);
    }
  }

  /**
   * Reorder form fields based on configuration
   */
  reorderFormFields(fieldConfig) {
    // Find form containers and reorder fields
    $('.budget-form-container, .dynamic-form-container').each((index, container) => {
      const $container = $(container);
      const fields = [];

      // Collect all field elements with their order info
      $container.find('[id^="edit"], [data-field]').each((fieldIndex, fieldElement) => {
        const $field = $(fieldElement);
        const fieldId = $field.attr('id') || $field.attr('data-field');

        if (fieldId) {
          fields.push({
            id: fieldId,
            element: $field,
            parent: $field.closest('.form-group, .col-md-4, .col-md-6, .col-sm-12')
          });
        }
      });

      if (fields.length > 0) {
        // Order fields using the configuration
        const orderedFields = fieldConfig.orderFields(fields, 'LE');

        // Reattach in new order
        orderedFields.forEach(field => {
          if (field.parent && field.parent.length) {
            $container.append(field.parent);
          }
        });
      }
    });
  }

  /**
   * Get current company configuration
   */
  getCurrentConfig() {
    return COMPANY_CONFIG_MANAGER.getCompanyConfig();
  }

  /**
   * Check if field should be visible for current company
   */
  isFieldVisible(fieldId) {
    return COMPANY_CONFIG_MANAGER.isFieldVisible(fieldId, this.currentCompany);
  }

  /**
   * Get fields for specific section
   */
  getFieldsForSection(section, subSection = null) {
    return COMPANY_CONFIG_MANAGER.getFieldsForSection(section, subSection, this.currentCompany);
  }

  /**
   * Apply company-specific fields (Alias for backward compatibility)
   * @param {string} companyId - Company ID ('1' for BJC, '2' for BIGC)
   */
  applyCompanySpecificFields(companyId) {
    // console.log('🎨 applyCompanySpecificFields called (alias method) - Company:', companyId);
    return this.applyCompanyConfiguration(companyId);
  }

  /**
   * Handle company switch (Alias for backward compatibility)
   * @param {string} newCompanyId - New company ID to switch to
   */
  handleCompanySwitch(newCompanyId) {
    // console.log('🔄 handleCompanySwitch called (alias method) - New Company:', newCompanyId);

    if (newCompanyId && newCompanyId !== this.currentCompany) {
      return this.applyCompanyConfiguration(newCompanyId);
    } else {
      // console.log('🔄 Company switch skipped - same company or invalid ID');
    }
  }

  /**
   * Get field visibility (Alias for form validation compatibility)
   * @param {string} fieldId - Field ID to check
   * @returns {string} 'visible' or 'hidden'
   */
  getFieldVisibility(fieldId) {
    // console.log('👁️ getFieldVisibility called (alias method) - Field:', fieldId);
    const isVisible = this.isFieldVisible(fieldId);
    return isVisible ? 'visible' : 'hidden';
  }

  /**
   * Destroy the dynamic forms manager
   */
  destroy() {
    if (!this.isInitialized) return;

    // console.log('🔄 Destroying Dynamic Forms Manager');

    // Remove event listeners
    window.removeEventListener('companyFieldsUpdated', this.handleCompanyChange);
    $('#editCompany').off('change.dynamicForms');

    // Reset state
    this.currentCompany = null;
    this.isInitialized = false;
    this.dynamicContainers = {};

    // Reset company configuration manager
    COMPANY_CONFIG_MANAGER.currentCompany = null;
    COMPANY_CONFIG_MANAGER.currentConfig = null;

    // console.log('✅ Dynamic Forms Manager destroyed');
  }
}

// Global instance
window.budgetDynamicFormsManager = new BudgetDynamicFormsManager();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Delay initialization to ensure other systems are ready
  setTimeout(() => {
    console.log('🏗️ Initializing budgetDynamicFormsManager...');
    if (window.budgetDynamicFormsManager) {
      window.budgetDynamicFormsManager.initialize();
      console.log('✅ budgetDynamicFormsManager initialized:', window.budgetDynamicFormsManager.isInitialized);
    } else {
      console.error('❌ budgetDynamicFormsManager not found');
    }
  }, 300); // Reduced from 1000ms to 300ms
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BudgetDynamicFormsManager,
    COMPANY_FORM_CONFIG,
    COMPANY_CONFIG_MANAGER,
    BASE_FIELDS,
    getBjcFieldConfig,
    getBigcFieldConfig
  };
}
