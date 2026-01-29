/**
 * PE Budget Dashboard Configuration
 * Global variables and constants for the dashboard
 */

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Debounce function to prevent rapid API calls
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ============================================================================
// Dashboard API Endpoints
// ============================================================================

// Get base URL from global config (supports IIS virtual directory)
const DASHBOARD_API_BASE = (window.AppConfig && window.AppConfig.apiBaseUrl) ? window.AppConfig.apiBaseUrl : './api/';

const DASHBOARD_API = {
    kpiOverview: DASHBOARD_API_BASE + 'Summary/kpi-overview',
    peByDivision: DASHBOARD_API_BASE + 'Summary/pe-by-division',
    peByCobu: DASHBOARD_API_BASE + 'Summary/pe-by-cobu',
    costCenters: DASHBOARD_API_BASE + 'Summary/cost-centers',
    dashCompanies: DASHBOARD_API_BASE + 'Summary/DashCompanies'  // 🔒 Company Access filtered
};

// ============================================================================
// Debounce Delays (milliseconds)
// ============================================================================

const DASHBOARD_DEBOUNCE_DELAYS = {
    cobu: 300,
    empFormats: 300,
    budgetYears: 300,
    costCenters: 400,
    divisions: 400,
    departments: 400,
    sections: 400,
    locations: 400,
    positions: 500,
    jobBands: 500,
    empStatuses: 300
};

// ============================================================================
// Chart Colors
// ============================================================================

const CHART_COLORS = {
    primary: '#0d6efd',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    secondary: '#6c757d',
    light: '#f8f9fa',
    dark: '#212529'
};

// ============================================================================
// Global Variables
// ============================================================================

// Chart instances
let departmentChart = null;
let hcCompositionChart = null;

// AG Grid instance
let costCenterGrid = null;

// Current filter state
let dashboardFilters = {
    companyId: 2, // Default to BIG C (Company ID 2)
    budgetYear: new Date().getFullYear(),
    cobu: null,
    costCenter: null,
    division: null,
    department: null,
    section: null,
    companyStore: null,
    empStatus: null,
    position: null,
    jobBand: null
};

// ============================================================================
// Export to window for global access
// ============================================================================

window.debounce = debounce;
window.DASHBOARD_API = DASHBOARD_API;
window.DASHBOARD_DEBOUNCE_DELAYS = DASHBOARD_DEBOUNCE_DELAYS;
window.CHART_COLORS = CHART_COLORS;
window.departmentChart = departmentChart;
window.hcCompositionChart = hcCompositionChart;
window.costCenterGrid = costCenterGrid;
window.dashboardFilters = dashboardFilters;
