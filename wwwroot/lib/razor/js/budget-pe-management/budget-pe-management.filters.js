/**
 * PE Management Filter Functions
 * Handles filter cascade logic and dropdown updates
 *
 * Created: 9 Dec 2025
 * Author: Ten (AI Developer)
 *
 * Filter Cascade Flow:
 * Company (required) → Budget Year (required) → Month (optional) → Cost Center (optional)
 */

// ═══════════════════════════════════════════════════════
// 🔄 DEBOUNCE CONFIGURATION
// ═══════════════════════════════════════════════════════

const PE_FILTER_DEBOUNCE = {
    company: 100,
    year: 150,
    month: 200,
    costCenter: 250
};

// ═══════════════════════════════════════════════════════
// 🎯 DEBOUNCED FILTER FUNCTIONS
// ═══════════════════════════════════════════════════════

/**
 * Simple debounce function
 */
function peDebounce(func, wait) {
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

// Create debounced versions of filter update functions
const debouncedUpdateYears = peDebounce(updateFilterYears, PE_FILTER_DEBOUNCE.year);
const debouncedUpdateMonths = peDebounce(updateFilterMonths, PE_FILTER_DEBOUNCE.month);
const debouncedUpdateCostCenters = peDebounce(updateFilterCostCenters, PE_FILTER_DEBOUNCE.costCenter);

// ═══════════════════════════════════════════════════════
// 🏢 COMPANY FILTER
// ═══════════════════════════════════════════════════════

/**
 * Initialize Company filter
 * This is the first level filter (no dependencies)
 */
async function initFilterCompanies() {
    try {
        const response = await fetch(PE_API.getCompanies);
        const data = await response.json();

        const filter = $('#companyFilter');
        filter.find('option:not(:first)').remove();

        data.forEach(company => {
            const option = new Option(
                `${company.companyName} (${company.companyId})`,
                company.companyId
            );
            filter.append(option);
        });

        // Initialize select2
        filter.select2({
            placeholder: 'Select Company',
            allowClear: false,
            width: '100%'
        });

        console.log('PE Filter: Companies loaded:', data.length);
    } catch (error) {
        console.error('Error loading companies:', error);
    }
}

/**
 * Handle Company change event
 * Cascade: Reset and reload Years, Months, Cost Centers
 */
function onCompanyChange() {
    const companyId = $('#companyFilter').val();
    console.log('PE Filter: Company changed to:', companyId);

    // Reset dependent filters
    resetFilter('#yearsFilter', 'Select Year');
    resetFilter('#monthFilter', 'All Months');
    resetFilter('#costcenterFilter', 'All Cost Centers');

    if (companyId) {
        // Load years for selected company
        debouncedUpdateYears(companyId);
    }
}

// ═══════════════════════════════════════════════════════
// 📅 YEAR FILTER
// ═══════════════════════════════════════════════════════

/**
 * Update Years filter based on Company
 * @param {number} companyId - Selected company ID
 */
async function updateFilterYears(companyId) {
    try {
        const url = `${PE_API.getYears}?companyId=${companyId}`;
        const response = await fetch(url);
        const data = await response.json();

        const filter = $('#yearsFilter');
        filter.find('option:not(:first)').remove();

        data.forEach(year => {
            const option = new Option(year, year);
            filter.append(option);
        });

        // Initialize select2
        filter.select2({
            placeholder: 'Select Year',
            allowClear: false,
            width: '100%'
        });

        // Auto-select current year if available
        const currentYear = new Date().getFullYear();
        if (data.includes(currentYear)) {
            filter.val(currentYear).trigger('change');
        }

        console.log('PE Filter: Years loaded:', data.length);
    } catch (error) {
        console.error('Error loading years:', error);
    }
}

/**
 * Handle Year change event
 * Cascade: Reset and reload Months, Cost Centers
 */
function onYearChange() {
    const companyId = $('#companyFilter').val();
    const year = $('#yearsFilter').val();
    console.log('PE Filter: Year changed to:', year);

    // Reset dependent filters
    resetFilter('#monthFilter', 'All Months');
    resetFilter('#costcenterFilter', 'All Cost Centers');

    if (companyId && year) {
        // Load months (static list but could be filtered if needed)
        debouncedUpdateMonths();
        // Load cost centers
        debouncedUpdateCostCenters();
    }
}

// ═══════════════════════════════════════════════════════
// 🗓️ MONTH FILTER
// ═══════════════════════════════════════════════════════

/**
 * Update Months filter
 * Static list of months (1-12)
 */
async function updateFilterMonths() {
    try {
        const response = await fetch(PE_API.getMonths);
        const data = await response.json();

        const filter = $('#monthFilter');
        filter.find('option:not(:first)').remove();

        data.forEach(month => {
            const option = new Option(month.text, month.value);
            filter.append(option);
        });

        // Initialize select2
        filter.select2({
            placeholder: 'All Months',
            allowClear: true,
            width: '100%'
        });

        console.log('PE Filter: Months loaded:', data.length);
    } catch (error) {
        console.error('Error loading months:', error);
    }
}

/**
 * Handle Month change event
 * Cascade: Reload Cost Centers
 */
function onMonthChange() {
    const companyId = $('#companyFilter').val();
    const year = $('#yearsFilter').val();
    const month = $('#monthFilter').val();
    console.log('PE Filter: Month changed to:', month);

    if (companyId && year) {
        // Reload cost centers with month filter
        debouncedUpdateCostCenters();
    }
}

// ═══════════════════════════════════════════════════════
// 🏬 COST CENTER FILTER
// ═══════════════════════════════════════════════════════

/**
 * Update Cost Centers filter based on Company, Year, Month
 */
async function updateFilterCostCenters() {
    try {
        const companyId = $('#companyFilter').val();
        const year = $('#yearsFilter').val();
        const month = $('#monthFilter').val();

        // Build query params
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        if (year) params.append('peYear', year);
        if (month) params.append('peMonth', month);

        const url = `${PE_API.getCostCenters}?${params.toString()}`;
        const response = await fetch(url);
        const data = await response.json();

        const filter = $('#costcenterFilter');
        filter.find('option:not(:first)').remove();

        data.forEach(costCenter => {
            const displayText = costCenter.costCenterName
                ? `${costCenter.costCenterName} (${costCenter.costCenterCode})`
                : costCenter.costCenterCode;
            const option = new Option(displayText, costCenter.costCenterCode);
            filter.append(option);
        });

        // Initialize select2
        filter.select2({
            placeholder: 'All Cost Centers',
            allowClear: true,
            width: '100%'
        });

        console.log('PE Filter: Cost Centers loaded:', data.length);
    } catch (error) {
        console.error('Error loading cost centers:', error);
    }
}

/**
 * Handle Cost Center change event
 */
function onCostCenterChange() {
    const costCenter = $('#costcenterFilter').val();
    console.log('PE Filter: Cost Center changed to:', costCenter);
}

// ═══════════════════════════════════════════════════════
// 🔧 HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════

/**
 * Reset a filter dropdown
 * @param {string} selector - jQuery selector
 * @param {string} placeholder - Placeholder text
 */
function resetFilter(selector, placeholder) {
    const filter = $(selector);
    filter.find('option:not(:first)').remove();
    filter.val('').trigger('change.select2');

    // Update placeholder
    const firstOption = filter.find('option:first');
    if (firstOption.length) {
        firstOption.text(placeholder);
    }
}

/**
 * Get current filter values
 * @returns {object} Filter values object
 */
function getFilterValues() {
    return {
        companyId: $('#companyFilter').val() || null,
        peYear: $('#yearsFilter').val() || null,
        peMonth: $('#monthFilter').val() || null,
        costCenterCode: $('#costcenterFilter').val() || null
    };
}

/**
 * Validate required filters
 * @returns {boolean} True if valid
 */
function validateFilters() {
    const filters = getFilterValues();

    if (!filters.companyId) {
        PECore.showToast('Please select a Company', 'warning');
        return false;
    }

    if (!filters.peYear) {
        PECore.showToast('Please select a Budget Year', 'warning');
        return false;
    }

    return true;
}

/**
 * Build API query string from filters
 * @returns {string} Query string (without leading ?)
 */
function buildFilterQueryString() {
    const filters = getFilterValues();
    const params = new URLSearchParams();

    if (filters.companyId) params.append('companyId', filters.companyId);
    if (filters.peYear) params.append('peYear', filters.peYear);
    if (filters.peMonth) params.append('peMonth', filters.peMonth);
    if (filters.costCenterCode) params.append('costCenterCode', filters.costCenterCode);

    return params.toString();
}

// ═══════════════════════════════════════════════════════
// 🚀 INITIALIZATION
// ═══════════════════════════════════════════════════════

/**
 * Initialize all filters
 */
async function initPEFilters() {
    console.log('PE Filter: Initializing filters...');

    // Load initial data
    await initFilterCompanies();

    // Bind change events
    bindFilterEvents();

    console.log('PE Filter: Initialization complete');
}

/**
 * Bind filter change events
 */
function bindFilterEvents() {
    // Company change
    $('#companyFilter').on('change', onCompanyChange);

    // Year change
    $('#yearsFilter').on('change', onYearChange);

    // Month change
    $('#monthFilter').on('change', onMonthChange);

    // Cost Center change
    $('#costcenterFilter').on('change', onCostCenterChange);

    // Search button
    $('#searchBtn').on('click', function () {
        if (validateFilters()) {
            const queryString = buildFilterQueryString();
            console.log('PE Filter: Search triggered with:', queryString);

            // Trigger custom event for grid to load data
            $(document).trigger('pe:search', [getFilterValues()]);
        }
    });

    // Reset button
    $('#resetBtn').on('click', function () {
        // Reset all filters
        $('#companyFilter').val('').trigger('change');
        resetFilter('#yearsFilter', 'Select Year');
        resetFilter('#monthFilter', 'All Months');
        resetFilter('#costcenterFilter', 'All Cost Centers');

        console.log('PE Filter: Filters reset');

        // Trigger custom event
        $(document).trigger('pe:reset');
    });
}

// ═══════════════════════════════════════════════════════
// 📦 EXPORTS
// ═══════════════════════════════════════════════════════

// Export for global access
window.PEFilters = {
    init: initPEFilters,
    getValues: getFilterValues,
    validate: validateFilters,
    buildQueryString: buildFilterQueryString,
    updateCostCenters: updateFilterCostCenters
};

// Auto-initialize when document ready (if not handled by main.js)
// $(document).ready(initPEFilters);
