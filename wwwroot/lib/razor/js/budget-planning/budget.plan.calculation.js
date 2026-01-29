/**
 * Budget Planning - Summary Field Calculation Module
 *
 * Purpose: Calculate and validate 8 summary fields for Budget Planning system
 * - pe_sb_mth_le (LE Monthly with S&B)
 * - pe_mth_le (LE Monthly without S&B)
 * - pe_sb_le (LE Year with S&B)
 * - pe_year_le (LE Year without S&B)
 * - pe_sb_mth (Budget Monthly with S&B)
 * - pe_mth (Budget Monthly without S&B)
 * - pe_sb_year (Budget Year with S&B)
 * - pe_year (Budget Year without S&B)
 *
 * Companies: BIGC (CompanyId=2), BJC (CompanyId=1)
 *
 * @module BudgetCalculation
 * @version 1.0
 * @date 2025-11-10
 */

const BudgetCalculation = (function () {
  'use strict';

  // ============================================================================
  // FIELD DEFINITIONS
  // ============================================================================

  /**
   * BIGC Company (CompanyId = 2) Field Definitions
   */
  const BIGC_FIELDS = {
    // LE fields with S&B (23 fields)
    LE_WITH_SB: [
      'payroll',              // Salary LE
      'premiumLe',
      'bonusLe',
      'fleetCardPeLe',
      'carAllowanceLe',
      'licenseAllowanceLe',
      'housingAllowanceLe',
      'gasolineAllowanceLe',
      'wageStudentLe',
      'carRentalPeLe',
      'skillPayAllowanceLe',
      'otherAllowanceLe',
      'socialSecurityLe',
      'laborFundFeeLe',
      'otherStaffBenefitLe',
      'providentFundLe',
      'provisionLe',
      'interestLe',
      'staffInsuranceLe',
      'medicalExpenseLe',     // S&B field
      'medicalInhouseLe',     // S&B field
      'trainingLe',           // S&B field
      'longServiceLe'         // S&B field
    ],

    // LE fields without S&B (18 fields)
    LE_WITHOUT_SB: [
      'payroll',
      'premiumLe',
      'bonusLe',
      'fleetCardPeLe',
      'carAllowanceLe',
      'licenseAllowanceLe',
      'housingAllowanceLe',
      'gasolineAllowanceLe',
      'wageStudentLe',
      'carRentalPeLe',
      'skillPayAllowanceLe',
      'otherAllowanceLe',
      'socialSecurityLe',
      'laborFundFeeLe',
      'otherStaffBenefitLe',
      'providentFundLe',
      'provisionLe',
      'interestLe'
      // Excludes: medicalExpenseLe, medicalInhouseLe, trainingLe, longServiceLe
    ],

    // Budget fields with S&B (23 fields)
    BUDGET_WITH_SB: [
      'totalPayroll',         // Salary Budget
      'premium',
      'bonus',
      'fleetCardPe',
      'carAllowance',
      'licenseAllowance',
      'housingAllowance',
      'gasolineAllowance',
      'wageStudent',
      'carRentalPe',
      'skillPayAllowance',
      'otherAllowance',
      'socialSecurity',
      'laborFundFee',
      'otherStaffBenefit',
      'providentFund',
      'provision',
      'interest',
      'staffInsurance',
      'medicalExpense',       // S&B field
      'medicalInhouse',       // S&B field
      'training',             // S&B field
      'longService'           // S&B field
    ],

    // Budget fields without S&B (18 fields)
    BUDGET_WITHOUT_SB: [
      'totalPayroll',
      'premium',
      'bonus',
      'fleetCardPe',
      'carAllowance',
      'licenseAllowance',
      'housingAllowance',
      'gasolineAllowance',
      'wageStudent',
      'carRentalPe',
      'skillPayAllowance',
      'otherAllowance',
      'socialSecurity',
      'laborFundFee',
      'otherStaffBenefit',
      'providentFund',
      'provision',
      'interest'
      // Excludes: medicalExpense, medicalInhouse, training, longService
    ]
  };

  /**
   * BJC Company (CompanyId = 1) Field Definitions
   */
  const BJC_FIELDS = {
    // LE fields with S&B (24 fields = 2 salary types + 22 benefits)
    LE_WITH_SB: [
      'salWithEnLe',          // Salary with English
      'salNotEnLe',           // Salary without English
      'temporaryStaffSalLe',  // Temporary staff salary
      'socialSecurityLe',
      'workmenCompensationLe',
      'housingAllowanceLe',
      'salesCarAllowanceLe',
      'accommodationLe',
      'carMaintenanceLe',
      'southriskAllowanceLe',
      'mealAllowanceLe',
      'otherLe',
      'licenseAllowanceLe',
      'outsourceWagesLe',
      'compCarsGasLe',
      'compCarsOtherLe',
      'carRentalLe',
      'carGasolineLe',
      'carRepairLe',
      'medicalOutsideLe',     // S&B field
      'medicalInhouseLe',     // S&B field
      'staffActivitiesLe',    // S&B field
      'uniformLe',            // S&B field
      'lifeInsuranceLe'       // S&B field
    ],

    // LE fields without S&B (19 fields)
    LE_WITHOUT_SB: [
      'salWithEnLe',
      'salNotEnLe',
      'temporaryStaffSalLe',
      'socialSecurityLe',
      'workmenCompensationLe',
      'housingAllowanceLe',
      'salesCarAllowanceLe',
      'accommodationLe',
      'carMaintenanceLe',
      'southriskAllowanceLe',
      'mealAllowanceLe',
      'otherLe',
      'licenseAllowanceLe',
      'outsourceWagesLe',
      'compCarsGasLe',
      'compCarsOtherLe',
      'carRentalLe',
      'carGasolineLe',
      'carRepairLe'
      // Excludes: medicalOutsideLe, medicalInhouseLe, staffActivitiesLe, uniformLe, lifeInsuranceLe
    ],

    // Budget fields with S&B (24 fields)
    BUDGET_WITH_SB: [
      'salWithEn',            // Salary with English
      'salNotEn',             // Salary without English
      'temporaryStaffSal',    // Temporary staff salary
      'socialSecurity',
      'workmenCompensation',
      'housingAllowance',
      'salesCarAllowance',
      'accommodation',
      'carMaintenance',
      'southriskAllowance',
      'mealAllowance',
      'other',
      'licenseAllowance',
      'outsourceWages',
      'compCarsGas',
      'compCarsOther',
      'carRental',
      'carGasoline',
      'carRepair',
      'medicalOutside',       // S&B field
      'medicalInhouse',       // S&B field
      'staffActivities',      // S&B field
      'uniform',              // S&B field
      'lifeInsurance'         // S&B field
    ],

    // Budget fields without S&B (19 fields)
    BUDGET_WITHOUT_SB: [
      'salWithEn',
      'salNotEn',
      'temporaryStaffSal',
      'socialSecurity',
      'workmenCompensation',
      'housingAllowance',
      'salesCarAllowance',
      'accommodation',
      'carMaintenance',
      'southriskAllowance',
      'mealAllowance',
      'other',
      'licenseAllowance',
      'outsourceWages',
      'compCarsGas',
      'compCarsOther',
      'carRental',
      'carGasoline',
      'carRepair'
      // Excludes: medicalOutside, medicalInhouse, staffActivities, uniform, lifeInsurance
    ]
  };

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Sum an array of field values from a row object
   * @param {Object} rowData - Row data object
   * @param {Array<string>} fields - Array of field names to sum
   * @returns {number} Sum of all field values (treats null/undefined as 0)
   */
  function sumFields(rowData, fields) {
    if (!rowData || !fields || !Array.isArray(fields)) {
      return 0;
    }

    return fields.reduce((sum, field) => {
      const value = rowData[field];
      // Treat null, undefined, or non-numeric values as 0
      const numValue = (value === null || value === undefined || isNaN(value)) ? 0 : Number(value);
      return sum + numValue;
    }, 0);
  }

  /**
   * Safely get numeric value from rowData field
   * @param {Object} rowData - Row data object
   * @param {string} field - Field name
   * @param {number} defaultValue - Default value if field is null/undefined
   * @returns {number} Field value or default
   */
  function getNumericValue(rowData, field, defaultValue = 0) {
    if (!rowData) return defaultValue;
    const value = rowData[field];
    if (value === null || value === undefined || isNaN(value)) {
      return defaultValue;
    }
    return Number(value);
  }

  // ============================================================================
  // CALCULATION FUNCTIONS
  // ============================================================================

  /**
   * Calculate all 8 summary fields for BIGC company (CompanyId = 2)
   * @param {Object} rowData - Row data object
   * @returns {Object} Object with 8 summary fields
   */
  function calculateBIGC(rowData) {
    if (!rowData) {
      return {
        pe_sb_mth_le: 0,
        pe_mth_le: 0,
        pe_sb_le: 0,
        pe_year_le: 0,
        pe_sb_mth: 0,
        pe_mth: 0,
        pe_sb_year: 0,
        pe_year: 0
      };
    }

    // Get le_of_month (default to 0 if not set)
    const leOfMonth = getNumericValue(rowData, 'le_of_month', 0);

    // Get no_of_month for Budget Year calculations (default to 12)
    const noOfMonth = getNumericValue(rowData, 'no_of_month', 12);

    // Calculate LE Monthly with S&B (23 fields)
    const peSbMthLe = sumFields(rowData, BIGC_FIELDS.LE_WITH_SB);

    // Calculate LE Monthly without S&B (18 fields)
    const peMthLe = sumFields(rowData, BIGC_FIELDS.LE_WITHOUT_SB);

    // Calculate LE Year with S&B
    const peSbLe = peSbMthLe * leOfMonth;

    // Calculate LE Year without S&B
    const peYearLe = peMthLe * leOfMonth;

    // Calculate Budget Monthly with S&B (23 fields)
    const peSbMth = sumFields(rowData, BIGC_FIELDS.BUDGET_WITH_SB);

    // Calculate Budget Monthly without S&B (18 fields)
    const peMth = sumFields(rowData, BIGC_FIELDS.BUDGET_WITHOUT_SB);

    // Calculate Budget Year with S&B (use no_of_month, not le_of_month)
    const peSbYear = peSbMth * noOfMonth;

    // Calculate Budget Year without S&B (use no_of_month, not le_of_month)
    const peYear = peMth * noOfMonth;

    return {
      pe_sb_mth_le: peSbMthLe,
      pe_mth_le: peMthLe,
      pe_sb_le: peSbLe,
      pe_year_le: peYearLe,
      pe_sb_mth: peSbMth,
      pe_mth: peMth,
      pe_sb_year: peSbYear,
      pe_year: peYear
    };
  }

  /**
   * Calculate all 8 summary fields for BJC company (CompanyId = 1)
   * @param {Object} rowData - Row data object
   * @returns {Object} Object with 8 summary fields
   */
  function calculateBJC(rowData) {
    if (!rowData) {
      return {
        pe_sb_mth_le: 0,
        pe_mth_le: 0,
        pe_sb_le: 0,
        pe_year_le: 0,
        pe_sb_mth: 0,
        pe_mth: 0,
        pe_sb_year: 0,
        pe_year: 0
      };
    }

    // Get le_of_month (default to 0 if not set)
    const leOfMonth = getNumericValue(rowData, 'le_of_month', 0);

    // Get no_of_month for Budget Year calculations (default to 12)
    const noOfMonth = getNumericValue(rowData, 'no_of_month', 12);

    // Calculate LE Monthly with S&B (24 fields)
    const peSbMthLe = sumFields(rowData, BJC_FIELDS.LE_WITH_SB);

    // Calculate LE Monthly without S&B (19 fields)
    const peMthLe = sumFields(rowData, BJC_FIELDS.LE_WITHOUT_SB);

    // Calculate LE Year with S&B
    const peSbLe = peSbMthLe * leOfMonth;

    // Calculate LE Year without S&B
    const peYearLe = peMthLe * leOfMonth;

    // Calculate Budget Monthly with S&B (24 fields)
    const peSbMth = sumFields(rowData, BJC_FIELDS.BUDGET_WITH_SB);

    // Calculate Budget Monthly without S&B (19 fields)
    const peMth = sumFields(rowData, BJC_FIELDS.BUDGET_WITHOUT_SB);

    // Calculate Budget Year with S&B (use no_of_month, not le_of_month)
    const peSbYear = peSbMth * noOfMonth;

    // Calculate Budget Year without S&B (use no_of_month, not le_of_month)
    const peYear = peMth * noOfMonth;

    return {
      pe_sb_mth_le: peSbMthLe,
      pe_mth_le: peMthLe,
      pe_sb_le: peSbLe,
      pe_year_le: peYearLe,
      pe_sb_mth: peSbMth,
      pe_mth: peMth,
      pe_sb_year: peSbYear,
      pe_year: peYear
    };
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  /**
   * Populate summary fields in rowData object based on companyId
   * This function MUTATES the rowData object by setting the 8 summary fields
   *
   * @param {Object} rowData - Row data object to populate
   * @param {number} companyId - Company ID (1=BJC, 2=BIGC)
   * @returns {Object} The same rowData object (for chaining)
   *
   * @example
   * const rowData = { payroll: 50000, premiumLe: 5000, ... };
   * BudgetCalculation.populateSummaryFields(rowData, 2); // BIGC
   * console.log(rowData.pe_sb_mth_le); // 55000
   */
  function populateSummaryFields(rowData, companyId) {
    if (!rowData) {
      console.error('[BudgetCalculation] populateSummaryFields: rowData is null/undefined');
      return rowData;
    }

    let calculated;

    if (companyId === 2) {
      // BIGC
      calculated = calculateBIGC(rowData);
    } else if (companyId === 1) {
      // BJC
      calculated = calculateBJC(rowData);
    } else {
      console.error('[BudgetCalculation] populateSummaryFields: Unknown companyId', companyId);
      return rowData;
    }

    // Populate the 8 summary fields
    rowData.pe_sb_mth_le = calculated.pe_sb_mth_le;
    rowData.pe_mth_le = calculated.pe_mth_le;
    rowData.pe_sb_le = calculated.pe_sb_le;
    rowData.pe_year_le = calculated.pe_year_le;
    rowData.pe_sb_mth = calculated.pe_sb_mth;
    rowData.pe_mth = calculated.pe_mth;
    rowData.pe_sb_year = calculated.pe_sb_year;
    rowData.pe_year = calculated.pe_year;

    return rowData;
  }

  /**
   * Validate summary fields in rowData against API-calculated values
   * Compares client-calculated values with existing values in rowData
   *
   * @param {Object} rowData - Row data object with API-calculated summary fields
   * @param {number} companyId - Company ID (1=BJC, 2=BIGC)
   * @param {number} tolerance - Allowed difference (default: 0.02 for floating-point precision)
   * @returns {Object} Validation result with isValid flag and errors array
   *
   * @example
   * const result = BudgetCalculation.validateSummaryFields(rowData, 2, 0.02);
   * if (!result.isValid) {
   *   console.warn('Discrepancies found:', result.errors);
   * }
   */
  function validateSummaryFields(rowData, companyId, tolerance = 0.02) {
    if (!rowData) {
      return {
        isValid: false,
        errors: ['rowData is null/undefined']
      };
    }

    let calculated;

    if (companyId === 2) {
      // BIGC
      calculated = calculateBIGC(rowData);
    } else if (companyId === 1) {
      // BJC
      calculated = calculateBJC(rowData);
    } else {
      return {
        isValid: false,
        errors: [`Unknown companyId: ${companyId}`]
      };
    }

    // Compare calculated values with API values
    const errors = [];
    const summaryFields = [
      'pe_sb_mth_le',
      'pe_mth_le',
      'pe_sb_le',
      'pe_year_le',
      'pe_sb_mth',
      'pe_mth',
      'pe_sb_year',
      'pe_year'
    ];

    summaryFields.forEach(field => {
      const apiValue = getNumericValue(rowData, field, 0);
      const calculatedValue = calculated[field] || 0;
      const difference = Math.abs(apiValue - calculatedValue);

      if (difference > tolerance) {
        errors.push({
          field: field,
          apiValue: apiValue,
          calculatedValue: calculatedValue,
          difference: difference
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors: errors,
      companyId: companyId,
      tolerance: tolerance
    };
  }

  /**
   * Get field definitions for a specific company
   * Useful for debugging or external validation
   *
   * @param {number} companyId - Company ID (1=BJC, 2=BIGC)
   * @returns {Object} Field definitions object or null if unknown companyId
   */
  function getFieldDefinitions(companyId) {
    if (companyId === 2) {
      return BIGC_FIELDS;
    } else if (companyId === 1) {
      return BJC_FIELDS;
    } else {
      return null;
    }
  }

  // ============================================================================
  // EXPORTS
  // ============================================================================

  return {
    // Main API
    populateSummaryFields: populateSummaryFields,
    validateSummaryFields: validateSummaryFields,

    // Calculation functions (exposed for testing)
    calculateBIGC: calculateBIGC,
    calculateBJC: calculateBJC,

    // Helper functions (exposed for testing)
    sumFields: sumFields,
    getNumericValue: getNumericValue,

    // Field definitions (exposed for reference)
    getFieldDefinitions: getFieldDefinitions,
    BIGC_FIELDS: BIGC_FIELDS,
    BJC_FIELDS: BJC_FIELDS
  };
})();

// Export for Node.js testing (if applicable)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BudgetCalculation;
}
