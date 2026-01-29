/**
 * Budget PE Bonus Configuration
 * Simplified configuration for Cost Center Summary report (Read-Only)
 * Purpose: Constants and settings for Budget PE Bonus page
 * Scope: Read-only Cost Center Summary - No Employee-level fields or Edit functionality
 * Updated: 14 Jan 2026 - Support IIS virtual directory
 */

// ===== API Base URL (IIS Virtual Directory Support) =====
const BONUS_API_BASE = (window.AppConfig && window.AppConfig.apiBaseUrl) ? window.AppConfig.apiBaseUrl : './api/';

// ===== API Endpoints =====

/**
 * Budget PE Bonus Data API
 */
const BUDGET_PE_BONUS_API = {
  // Main data endpoint (calls Stored Procedures via SummaryController)
  getData: BONUS_API_BASE + 'Summary/GetPEBonusByCostCenter',
  grandTotal: BONUS_API_BASE + 'Summary/GetPEBonusByCostCenterGrandTotal',

  // Filter APIs (use existing Select API endpoints)
  companies: BONUS_API_BASE + 'Select/companies',
  cobu: BONUS_API_BASE + 'Budget/B0CoBU',
  budgetYears: BONUS_API_BASE + 'Budget/B0BudgetYears',
  costCenters: BONUS_API_BASE + 'Select/costcenters'
};

/**
 * Select API Endpoints (legacy compatibility)
 * Used by filter dropdowns
 */
const SELECT_API = {
  companies: BONUS_API_BASE + 'Select/companies',
  costcenters: BONUS_API_BASE + 'Select/costcenters'
};

// ===== Debounce Configuration =====

/**
 * Debounce delays for API calls (milliseconds)
 * Prevents excessive API requests during user input
 */
const DEBOUNCE_DELAYS = {
  companies: 50,
  cobu: 100,
  budgetYears: 150,
  costCenters: 300
};

// Company Configuration
const COMPANY_CONFIG = {
  BJC: {
    id: '1',
    code: 'BJC',
    name: 'BJC',
    fieldCount: 44,
    hasFleetCard: true,
    hasSouthRisk: true
  },
  BIGC: {
    id: '2',
    code: 'BIGC',
    name: 'BIGC',
    fieldCount: 30,
    hasFleetCard: true,
    hasSouthRisk: false
  }
};

// ===== Spinner Configuration =====

/**
 * Loading spinner element IDs for each filter
 * Maps filter dropdown IDs to their corresponding spinner element IDs
 */
const SPINNER_MAP = {
  'companyFilter': 'companySpinner',
  'cobuFilter': 'formatSpinner',
  'yearsFilter': 'yearSpinner',
  'costcenterFilter': 'costcenterSpinner'
};

// ===== Grid Configuration =====

/**
 * AG Grid default options
 */
const GRID_DEFAULT_OPTIONS = {
  sortable: true,
  filter: true,
  floatingFilter: false,  // Cost Center Summary doesn't need floating filters
  resizable: true
};

/**
 * AG Grid theme class
 */
const GRID_THEME = 'ag-theme-alpine';

// ===== Filter Configuration =====

/**
 * Filter element IDs (4 filters only)
 * Used for validation and reset operations
 */
const FILTER_ELEMENT_IDS = [
  'companyFilter',
  'cobuFilter',
  'yearsFilter',
  'costcenterFilter'
];

// ===== Loading Configuration =====

/**
 * Loading delays for different operations (milliseconds)
 */
const LOADING_DELAYS = {
  initialization: 1000,   // System initialization delay
  dataLoad: 500,          // Data loading delay
  exportExcel: 800        // Excel export preparation delay
};

// ===== Export Configuration =====

/**
 * Excel export default filename
 */
const EXPORT_FILENAME_PREFIX = 'Budget_PE_Bonus';

/**
 * Excel export sheet name
 */
const EXPORT_SHEET_NAME = 'Budget PE Bonus Summary';

// ===== Stored Procedure Configuration =====

/**
 * Stored Procedure names by Company ID
 */
const STORED_PROCEDURES = {
  BIG_C: {
    companyId: 2,
    procedureName: 'SP_REP_HC_PE_BY_COSTCENTER',
    description: 'PE Bonus By Cost Center for BIG C'
  },
  BJC: {
    companyId: 1,
    procedureName: 'SP_REP_HC_PE_BY_COSTCENTER_BJC',
    description: 'PE Bonus By Cost Center for BJC'
  }
};

/**
 * Stored Procedure default parameters
 * ✅ DYNAMIC: Calculated based on current year or user selection
 */
const SP_DEFAULT_PARAMS = {
  historicalYearCount: 6,     // Fixed: Always show 6 years of historical data
  costCenterLike: null        // NULL = All Cost Centers
};

/**
 * Calculate dynamic year parameters based on budget year filter
 * @param {number} budgetYear - Selected budget year (e.g., 2026, 2027, 2028...)
 * @returns {Object} Dynamic year parameters for Stored Procedure
 */
function calculateDynamicYearParams(budgetYear) {
  const prevBudgetYear = budgetYear - 1;  // e.g., 2026 → 2025
  const historicalYearTo = prevBudgetYear; // e.g., 2025
  const historicalYearFrom = historicalYearTo - SP_DEFAULT_PARAMS.historicalYearCount; // e.g., 2025 - 6 = 2019

  return {
    yearBudget: budgetYear,           // e.g., 2026
    yearFrom: historicalYearFrom,     // e.g., 2019 (dynamic!)
    yearTo: historicalYearTo,         // e.g., 2025 (dynamic!)
    costCenterLike: null
  };
}

/**
 * Get default budget year (current year + 1)
 * @returns {number} Default budget year
 */
function getDefaultBudgetYear() {
  return new Date().getFullYear() + 1; // e.g., 2025 → 2026
}

// ===== Filter Options Configuration =====

/**
 * COBU Filter Options (used by both companies)
 */
const COBU_FORMAT_OPTIONS = [
  { value: '', text: 'All' },
  { value: 'Y', text: 'Inside COBU Format' },
  { value: 'N', text: 'Outside COBU Format' }
];

// ===== Validation Configuration =====

/**
 * Required filters for data load
 * User must select these filters before loading data
 */
const REQUIRED_FILTERS = [
  { id: 'companyFilter', name: 'Company' },
  { id: 'yearsFilter', name: 'Budget Year' }
];

// ===== Export Functions =====
// Make configurations available globally
window.BUDGET_PE_BONUS_API = BUDGET_PE_BONUS_API;
window.SELECT_API = SELECT_API;
window.DEBOUNCE_DELAYS = DEBOUNCE_DELAYS;
window.SPINNER_MAP = SPINNER_MAP;
window.GRID_DEFAULT_OPTIONS = GRID_DEFAULT_OPTIONS;
window.GRID_THEME = GRID_THEME;
window.FILTER_ELEMENT_IDS = FILTER_ELEMENT_IDS;
window.LOADING_DELAYS = LOADING_DELAYS;
window.EXPORT_FILENAME_PREFIX = EXPORT_FILENAME_PREFIX;
window.EXPORT_SHEET_NAME = EXPORT_SHEET_NAME;
window.STORED_PROCEDURES = STORED_PROCEDURES;
window.SP_DEFAULT_PARAMS = SP_DEFAULT_PARAMS;
window.calculateDynamicYearParams = calculateDynamicYearParams;
window.getDefaultBudgetYear = getDefaultBudgetYear;
window.COBU_FORMAT_OPTIONS = COBU_FORMAT_OPTIONS;
window.REQUIRED_FILTERS = REQUIRED_FILTERS;
