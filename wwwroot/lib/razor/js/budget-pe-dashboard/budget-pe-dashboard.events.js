/**
 * PE Budget Overview Dashboard - Main Events & Orchestration
 * Coordinates all dashboard modules and handles user interactions
 *
 * Dependencies:
 * - budget-pe-dashboard.config.js (DASHBOARD_API, CHART_COLORS, global variables)
 * - budget-pe-dashboard.api.js (fetchDashboard* functions)
 * - budget-pe-dashboard.charts.js (loadDashboardDepartmentChart, loadDashboardHCCompositionChart)
 * - budget-pe-dashboard.grid.js (loadDashboardCostCenterGrid)
 * - budget-pe-dashboard.filters.js (initializeDashboardFilters, etc.)
 */

// ============================================================================
// Dashboard Loading Functions
// ============================================================================

/**
 * Load complete dashboard with all components
 */
async function loadDashboard() {
    // Validate required filters
    if (!window.dashboardFilters.companyId) {
        console.warn('Cannot load dashboard: Company not selected');
        showDashboardError('Please select a Company to load the dashboard.');
        return;
    }

    showDashboardLoading(true);

    try {
        // Load KPI cards first to get HC data
        const kpiData = await loadDashboardKpiCards();

        // Determine which chart to load based on company
        const companyId = parseInt(window.dashboardFilters.companyId);

        // Load components in parallel
        if (companyId === 1) {
            // BJC: Load PE Growth chart (no trend chart)
            await Promise.all([
                loadDashboardPEGrowthChart(),
                loadDashboardHCCompositionChart(kpiData),
                loadDashboardCostCenterGrid()
            ]);
            console.log('Dashboard loaded successfully (BJC - PE Growth mode)');
        } else if (companyId === 2) {
            // BIG C: Load PE Growth chart + Trend chart
            await Promise.all([
                loadDashboardPEGrowthChart(),
                loadDashboardHCCompositionChart(kpiData),
                loadDashboardCostCenterGrid(),
                loadDashboardTrendChart() // Block D - BIG C only
            ]);
            console.log('Dashboard loaded successfully (BIG C - PE Growth + Trend mode)');
        } else {
            // Default: Load PE Growth chart
            await Promise.all([
                loadDashboardPEGrowthChart(),
                loadDashboardHCCompositionChart(kpiData),
                loadDashboardCostCenterGrid()
            ]);
            console.log('Dashboard loaded successfully (Default - PE Growth mode)');
        }

    } catch (error) {
        console.error('Error loading dashboard:', error);
        showDashboardError('Failed to load dashboard. Please try again.');
    } finally {
        showDashboardLoading(false);
    }
}

/**
 * Load and update KPI cards (Block A) - Dynamic Year Version
 * 4 KPIs: HC + Growth, PE + Growth, Vacant HC + PE + Growth, New HC + PE + Growth
 */
async function loadDashboardKpiCards() {
    try {
        const data = await fetchDashboardPEBonusData(window.dashboardFilters);

        // Extract year labels from returned data
        const prevYear = data.previousYear; // e.g., 2025
        const currYear = data.currentYear;   // e.g., 2026

        // Calculate growth percentages
        const growthHC = data.hcPrev !== 0
            ? ((data.hcCurr - data.hcPrev) / data.hcPrev) * 100
            : 0;

        const growthPE = data.pePrev !== 0
            ? ((data.peCurr - data.pePrev) / data.pePrev) * 100
            : 0;

        const growthVacantHC = data.vacantHcPrev !== 0
            ? ((data.vacantHcCurr - data.vacantHcPrev) / data.vacantHcPrev) * 100
            : 0;

        const growthNewHC = data.newHcPrev !== 0
            ? ((data.newHcCurr - data.newHcPrev) / data.newHcPrev) * 100
            : 0;

        console.log('KPI Growth Calculations:', {
            hcPrev: data.hcPrev,
            hcCurr: data.hcCurr,
            growthHC,
            pePrev: data.pePrev,
            peCurr: data.peCurr,
            growthPE,
            vacantHcCurr: data.vacantHcCurr,
            vacantPeCurr: data.vacantPeCurr,
            vacantPercentOfTotal: data.vacantPercentOfTotal,
            newHcCurr: data.newHcCurr,
            newPeCurr: data.newPeCurr,
            newPercentOfTotal: data.newPercentOfTotal
        });

        // Update year labels dynamically
        document.getElementById('hcPrevYearLabel').textContent = prevYear;
        document.getElementById('hcCurrYearLabel').textContent = currYear;
        document.getElementById('pePrevYearLabel').textContent = prevYear;
        document.getElementById('peCurrYearLabel').textContent = currYear;
        document.getElementById('vacantYearLabel').textContent = currYear;
        document.getElementById('newYearLabel').textContent = currYear;
        document.getElementById('hcCompYearLabel').textContent = `B${currYear}`;
        document.getElementById('chartAxisYearLabel').textContent = currYear;

        // KPI 1: HC Year-1 vs Year & % Growth HC
        document.getElementById('hcPrevYear').textContent = formatNumber(data.hcPrev);
        document.getElementById('hcCurrYear').textContent = formatNumber(data.hcCurr);
        document.getElementById('growthHC').textContent = formatPercentage(growthHC);
        updateGrowthIndicator('growthHCIndicator', growthHC);

        // KPI 2: PE Year-1 vs Year & % Growth PE
        document.getElementById('pePrevYear').textContent = formatCurrency(data.pePrev);
        document.getElementById('peCurrYear').textContent = formatCurrency(data.peCurr);
        document.getElementById('growthPE').textContent = formatPercentage(growthPE);
        updateGrowthIndicator('growthPEIndicator', growthPE);

        // KPI 3: Planned Vacancy Filling (B2026)
        document.getElementById('vacantHcCurr').textContent = formatNumber(data.vacantHcCurr);
        document.getElementById('vacantPeCurr').textContent = formatCurrencyStandard(data.vacantPeCurr);
        document.getElementById('vacantPercentOfTotal').textContent = formatPercentage(data.vacantPercentOfTotal);

        // KPI 4: Planned New Hiring (B2026)
        document.getElementById('newHcCurr').textContent = formatNumber(data.newHcCurr);
        document.getElementById('newPeCurr').textContent = formatCurrencyStandard(data.newPeCurr);
        document.getElementById('newPercentOfTotal').textContent = formatPercentage(data.newPercentOfTotal);

        // Return data for use in HC Composition chart
        return data;

    } catch (error) {
        console.error('Error loading KPI cards:', error);
        showDashboardError('Failed to load KPI data');
        throw error; // Re-throw to prevent other components from loading
    }
}

/**
 * Format percentage value with sign
 * @param {number} value - Percentage value
 * @returns {string} Formatted percentage
 */
function formatPercentage(value) {
    if (value === null || value === undefined || isNaN(value)) return '0.0%';
    const sign = value >= 0 ? '+' : '';
    return sign + value.toFixed(1) + '%';
}

/**
 * Update growth indicator icon and color
 * @param {string} elementId - Element ID to update
 * @param {number} value - Growth value
 */
function updateGrowthIndicator(elementId, value) {
    const indicator = document.getElementById(elementId);
    if (!indicator) return;

    if (value > 0) {
        indicator.innerHTML = '<i class=\"fas fa-arrow-up text-success\"></i>';
        indicator.className = 'growth-indicator text-success';
    } else if (value < 0) {
        indicator.innerHTML = '<i class=\"fas fa-arrow-down text-danger\"></i>';
        indicator.className = 'growth-indicator text-danger';
    } else {
        indicator.innerHTML = '<i class=\"fas fa-minus text-muted\"></i>';
        indicator.className = 'growth-indicator text-muted';
    }
}

// ============================================================================
// Excel Export
// ============================================================================

/**
 * Export cost center data to Excel
 */
async function exportDashboardToExcel() {
    try {
        showDashboardLoading(true, 'Exporting to Excel...');

        // Fetch all data without pagination
        const response = await fetchDashboardCostCenters(window.dashboardFilters, 1, 10000);
        const data = response.data || [];

        // Prepare data for export
        const exportData = data.map(item => ({
            'Cost Center': item.costCenterCode,
            'Cost Center Name': item.costCenterName,
            'Division': item.division,
            'HC Count': item.totalHC,
            'Total PE': item.totalPE,
            'Avg PE/HC': item.avgPEPerHC,
            'Active HC': item.activeHC,
            'New Join HC': item.newJoinHC,
            'On Process HC': item.onProcessHC,
            'Vacancy HC': item.vacancyHC
        }));

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Set column widths
        ws['!cols'] = [
            { wch: 15 }, // Cost Center
            { wch: 30 }, // Cost Center Name
            { wch: 20 }, // Division
            { wch: 12 }, // HC Count
            { wch: 15 }, // Total PE
            { wch: 15 }, // Avg PE/HC
            { wch: 12 }, // Active HC
            { wch: 12 }, // New Join HC
            { wch: 12 }, // On Process HC
            { wch: 12 }  // Vacancy HC
        ];

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Cost Centers');

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `PE_Budget_CostCenters_${timestamp}.xlsx`;

        // Save file
        XLSX.writeFile(wb, filename);

        console.log('Excel export completed');
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        showDashboardError('Failed to export to Excel. Please try again.');
    } finally {
        showDashboardLoading(false);
    }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format number with thousand separators
 */
function formatNumber(value) {
    if (value === null || value === undefined) return '0';
    return Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

/**
 * Format number with thousand separators and specified decimal places
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted number with commas (e.g., "1,727.4")
 */
function formatNumberDecimal(value, decimals = 1) {
    if (value === null || value === undefined || isNaN(value)) return '0';
    return Number(value).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

/**
 * Format currency (THB) in millions format
 * Example: 47,600,000 => "47.60 M THB"
 */
function formatCurrency(value) {
    if (value === null || value === undefined) return '0.00 M THB';

    const absValue = Math.abs(value);
    const millions = absValue / 1000000;
    const sign = value < 0 ? '-' : '';

    // Format to 2 decimal places
    const formatted = millions.toFixed(2);

    return `${sign}${formatted} M THB`;
}

/**
 * Format currency (THB) in standard format with 2 decimal places
 * Example: -84413.52 => "฿-84,413.52"
 */
function formatCurrencyStandard(value) {
    if (value === null || value === undefined) return '฿0.00';

    const sign = value < 0 ? '-' : '';
    const absValue = Math.abs(value);

    // Format with thousand separators and 2 decimal places
    const formatted = absValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    return `฿${sign}${formatted}`;
}

/**
 * Show/hide loading overlay
 */
function showDashboardLoading(show, message = 'Loading Dashboard...') {
    const overlay = document.getElementById('loadingOverlay');
    const text = document.getElementById('loadingText');

    if (show) {
        text.textContent = message;
        overlay.classList.remove('d-none');
    } else {
        overlay.classList.add('d-none');
    }
}

/**
 * Show error message
 */
function showDashboardError(message) {
    console.error(message);
    alert(message);
}

// ============================================================================
// Initialization
// ============================================================================

// Note: Initialization moved to budget-pe-dashboard.main.js
// This file now only contains the core dashboard functions:
// - loadDashboard() orchestration
// - loadDashboardKpiCards()
// - exportDashboardToExcel()
// - Utility functions (formatNumber, formatCurrency, showDashboardLoading, showDashboardError)

// Export utility functions to window for use by other modules
window.showDashboardError = showDashboardError;
window.showDashboardLoading = showDashboardLoading;
window.formatNumberDecimal = formatNumberDecimal;
