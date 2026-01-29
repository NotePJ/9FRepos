/**
 * Budget PE HeadCount Configuration
 * Configuration for PE HeadCount Summary Report
 * Purpose: Constants and settings for Budget PE HeadCount page
 * Updated: 14 Jan 2026 - Support IIS virtual directory
 */

// ===== API Base URL (IIS Virtual Directory Support) =====
const HEADCOUNT_API_BASE = (window.AppConfig && window.AppConfig.apiBaseUrl) ? window.AppConfig.apiBaseUrl : './api/';

// ===== API Endpoints =====

/**
 * Budget PE HeadCount Data API
 */
const BUDGET_PE_HEADCOUNT_API = {
  // Main data endpoint
  getData: HEADCOUNT_API_BASE + 'Summary/GetPEHeadCountByGrouping',

  // Filter APIs
  companies: HEADCOUNT_API_BASE + 'Select/companies',
  cobu: HEADCOUNT_API_BASE + 'Budget/B0CoBU',
  budgetYears: HEADCOUNT_API_BASE + 'Budget/B0BudgetYears',
  costCenters: HEADCOUNT_API_BASE + 'Select/costcenters'
};

/**
 * Select API Endpoints (legacy compatibility)
 */
const SELECT_API = {
  companies: HEADCOUNT_API_BASE + 'Select/companies',
  costcenters: HEADCOUNT_API_BASE + 'Select/costcenters'
};

// ===== Debounce Configuration =====

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
    hasFleetCard: true,
    hasSouthRisk: true
  },
  BIGC: {
    id: '2',
    code: 'BIGC',
    name: 'BIGC',
    hasFleetCard: true,
    hasSouthRisk: false
  }
};

// ===== Spinner Configuration =====

const SPINNER_MAP = {
  'companyFilter': 'companySpinner',
  'cobuFilter': 'formatSpinner',
  'yearsFilter': 'yearSpinner',
  'costcenterFilter': 'costcenterSpinner'
};

// ===== Grid Configuration =====

const GRID_DEFAULT_OPTIONS = {
  animateRows: true
};

const GRID_THEME = 'ag-theme-alpine';

// ===== Filter Configuration =====

const FILTER_ELEMENT_IDS = [
  'companyFilter',
  'cobuFilter',
  'yearsFilter',
  'costcenterFilter'
];

// ===== Loading Configuration =====

const LOADING_DELAYS = {
  initialization: 1000,
  dataLoad: 500,
  exportExcel: 800
};

// ===== Export Configuration =====

const EXPORT_FILENAME_PREFIX = 'Budget_PE_HeadCount';
const EXPORT_SHEET_NAME = 'Budget PE HeadCount Summary';

// ===== Stored Procedure Configuration =====

const STORED_PROCEDURES = {
  BIG_C: {
    companyId: 2,
    procedureName: 'SP_REP_HC_PE_BY_GROUPING',
    description: 'PE HeadCount By Grouping for BIG C'
  },
  BJC: {
    companyId: 1,
    procedureName: 'SP_REP_HC_PE_BY_GROUPING',
    description: 'PE HeadCount By Grouping for BJC'
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

const COBU_FORMAT_OPTIONS = [
  { value: '', text: 'All' },
  { value: 'Y', text: 'Inside COBU Format' },
  { value: 'N', text: 'Outside COBU Format' }
];

// ===== Validation Configuration =====

const REQUIRED_FILTERS = [
  { id: 'companyFilter', name: 'Company' },
  { id: 'yearsFilter', name: 'Budget Year' }
];

// ===== Export Functions =====
window.BUDGET_PE_HEADCOUNT_API = BUDGET_PE_HEADCOUNT_API;
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
