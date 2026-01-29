/**
 * PE Management Main Initialization
 * Entry point for PE B1 Management system
 *
 * Created: 3 Dec 2025
 * Updated: 9 Dec 2025 - Cascade Flow: Company → Year → Month → CostCenter (with Disabled states)
 * Author: Ten (AI Developer)
 */

// ═══════════════════════════════════════════════════════
// 🎯 SPINNER MAP (สำหรับ Dropdown Loading)
// ═══════════════════════════════════════════════════════
const PE_SPINNER_MAP = {
    'companyFilter': 'companySpinner',
    'yearsFilter': 'yearSpinner',
    'monthFilter': 'monthSpinner',
    'costcenterFilter': 'costcenterSpinner'
};

const PEMain = (function () {
    'use strict';

    // ═══════════════════════════════════════════════════════
    // 🚀 INITIALIZATION
    // ═══════════════════════════════════════════════════════

    /**
     * Initialize PE Management when document ready
     */
    function init() {
        console.log('PE Management: Initializing...');

        // Initialize AG Grid
        PEGrid.init('peManagementGrid');

        // Initialize filter dropdowns
        initFilters();

        // Bind filter events
        bindFilterEvents();

        // Bind fullscreen events
        bindFullscreenEvents();

        console.log('PE Management: Initialization complete');
    }

    // ═══════════════════════════════════════════════════════
    // 🔄 SPINNER HELPERS
    // ═══════════════════════════════════════════════════════

    /**
     * Show dropdown spinner
     * @param {string} spinnerId - Spinner element ID
     */
    function showDropdownSpinner(spinnerId) {
        const spinner = document.getElementById(spinnerId);
        if (spinner) {
            spinner.classList.remove('d-none');
        }
    }

    /**
     * Hide dropdown spinner
     * @param {string} spinnerId - Spinner element ID
     */
    function hideDropdownSpinner(spinnerId) {
        const spinner = document.getElementById(spinnerId);
        if (spinner) {
            spinner.classList.add('d-none');
        }
    }

    // ═══════════════════════════════════════════════════════
    // 🔽 FILTER INITIALIZATION (Cascade Flow)
    // ═══════════════════════════════════════════════════════

    /**
     * Initialize filter dropdowns
     * Cascade Flow: Company(enabled) → Year/Month/CostCenter(disabled)
     */
    async function initFilters() {
        try {
            console.log('PE Management: Loading filter dropdowns...');

            // 1. Load Companies (ENABLED - ดึงจาก HRB_PE_MANAGEMENT)
            showDropdownSpinner('companySpinner');
            const companies = await PEApi.getCompanies();
            populateCompanyDropdown('#companyFilter', companies, 'Select Company');
            hideDropdownSpinner('companySpinner');
            console.log('PE Management: Companies loaded:', companies.length);

            // 2. Initialize Years as DISABLED (จะ enable เมื่อเลือก Company)
            initDisabledSelect2('#yearsFilter', 'Select Year');

            // 3. Initialize Months as DISABLED (จะ enable เมื่อเลือก Year)
            initDisabledSelect2('#monthFilter', 'All Months');

            // 4. Initialize CostCenters as DISABLED (จะ enable เมื่อเลือก Month)
            initDisabledSelect2('#costcenterFilter', 'All Cost Centers');

        } catch (error) {
            console.error('Failed to initialize filters:', error);
            hideDropdownSpinner('companySpinner');
            PECore.showToast('Failed to load filter options', 'error');
        }
    }

    // ═══════════════════════════════════════════════════════
    // 🔒 SELECT2 DISABLED/ENABLED HELPERS
    // ═══════════════════════════════════════════════════════

    /**
     * Initialize Select2 dropdown as DISABLED (empty)
     * @param {string} selector - jQuery selector
     * @param {string} defaultText - Default option text
     */
    function initDisabledSelect2(selector, defaultText) {
        const $dropdown = $(selector);

        // Destroy existing Select2 if any
        if ($dropdown.data('select2')) {
            $dropdown.select2('destroy');
        }

        // Clear and set default option
        $dropdown.empty();
        $dropdown.append(`<option value="">${defaultText}</option>`);

        // Disable native select
        $dropdown.prop('disabled', true);

        // Initialize Select2 (disabled state)
        $dropdown.select2({
            placeholder: defaultText,
            allowClear: true,
            width: '100%'
        });
    }

    /**
     * Reset dropdown to DISABLED state with Select2
     * @param {string} selector - jQuery selector
     * @param {string} defaultText - Default option text
     */
    function resetDisabledSelect2(selector, defaultText) {
        initDisabledSelect2(selector, defaultText);
    }

    /**
     * Enable Select2 dropdown after populating data
     * @param {string} selector - jQuery selector
     */
    function enableSelect2(selector) {
        const $dropdown = $(selector);
        $dropdown.prop('disabled', false);
    }

    // ═══════════════════════════════════════════════════════
    // 🔽 POPULATE DROPDOWN FUNCTIONS (with Select2)
    // ═══════════════════════════════════════════════════════

    /**
     * Populate Company dropdown with Select2 (always ENABLED)
     * @param {string} selector - jQuery selector
     * @param {Array} data - Company data array [{ companyId, companyName }, ...]
     * @param {string} defaultText - Default option text
     */
    function populateCompanyDropdown(selector, data, defaultText) {
        const $dropdown = $(selector);

        // Destroy existing Select2 if any
        if ($dropdown.data('select2')) {
            $dropdown.select2('destroy');
        }

        // Clear and populate options
        $dropdown.empty();
        $dropdown.append(`<option value="">${defaultText}</option>`);

        if (Array.isArray(data)) {
            data.forEach(function (item) {
                $dropdown.append(`<option value="${item.companyId}">${item.companyName}</option>`);
            });
        }

        // Enable dropdown
        $dropdown.prop('disabled', false);

        // Initialize Select2
        $dropdown.select2({
            placeholder: defaultText,
            allowClear: true,
            width: '100%'
        });
    }

    /**
     * Populate Year dropdown with Select2 (ENABLE after populate)
     * @param {string} selector - jQuery selector
     * @param {Array} data - Year data array [2025, 2024, 2023, ...]
     * @param {string} defaultText - Default option text
     */
    function populateYearDropdown(selector, data, defaultText) {
        const $dropdown = $(selector);

        // Destroy existing Select2 if any
        if ($dropdown.data('select2')) {
            $dropdown.select2('destroy');
        }

        // Clear and populate options
        $dropdown.empty();
        $dropdown.append(`<option value="">${defaultText}</option>`);

        if (Array.isArray(data)) {
            data.forEach(function (year) {
                $dropdown.append(`<option value="${year}">${year}</option>`);
            });
        }

        // Enable dropdown after populating
        $dropdown.prop('disabled', false);

        // Initialize Select2
        $dropdown.select2({
            placeholder: defaultText,
            allowClear: true,
            width: '100%'
        });
    }

    /**
     * Populate Month dropdown with Select2 (ENABLE after populate)
     * @param {string} selector - jQuery selector
     * @param {Array} data - Month data array [{ value, text, shortText }, ...]
     * @param {string} defaultText - Default option text
     */
    function populateMonthDropdown(selector, data, defaultText) {
        const $dropdown = $(selector);

        // Destroy existing Select2 if any
        if ($dropdown.data('select2')) {
            $dropdown.select2('destroy');
        }

        // Clear and populate options
        $dropdown.empty();
        $dropdown.append(`<option value="">${defaultText}</option>`);

        if (Array.isArray(data)) {
            data.forEach(function (item) {
                $dropdown.append(`<option value="${item.value}">${item.text}</option>`);
            });
        }

        // Enable dropdown after populating
        $dropdown.prop('disabled', false);

        // Initialize Select2
        $dropdown.select2({
            placeholder: defaultText,
            allowClear: true,
            width: '100%'
        });
    }

    /**
     * Populate Cost Center dropdown with Select2 (ENABLE after populate)
     * @param {string} selector - jQuery selector
     * @param {Array} data - Cost Center data array [{ costCenterCode, costCenterName }, ...]
     * @param {string} defaultText - Default option text
     */
    function populateCostCenterDropdown(selector, data, defaultText) {
        const $dropdown = $(selector);

        // Destroy existing Select2 if any
        if ($dropdown.data('select2')) {
            $dropdown.select2('destroy');
        }

        // Clear and populate options
        $dropdown.empty();
        $dropdown.append(`<option value="">${defaultText}</option>`);

        if (Array.isArray(data)) {
            data.forEach(function (item) {
                const displayText = item.costCenterName
                    ? `${item.costCenterCode} - ${item.costCenterName}`
                    : item.costCenterCode;
                $dropdown.append(`<option value="${item.costCenterCode}">${displayText}</option>`);
            });
        }

        // Enable dropdown after populating
        $dropdown.prop('disabled', false);

        // Initialize Select2
        $dropdown.select2({
            placeholder: defaultText,
            allowClear: true,
            width: '100%'
        });
    }

    /**
     * Generic Populate dropdown helper (for backward compatibility)
     * @param {string} selector - jQuery selector
     * @param {Array} data - Data array
     * @param {string} valueField - Value field name
     * @param {string} textField - Text field name
     * @param {string} defaultText - Default option text
     */
    function populateDropdown(selector, data, valueField, textField, defaultText) {
        const $dropdown = $(selector);

        // Destroy existing Select2 if any
        if ($dropdown.data('select2')) {
            $dropdown.select2('destroy');
        }

        $dropdown.empty();
        $dropdown.append(`<option value="">${defaultText}</option>`);

        if (Array.isArray(data)) {
            data.forEach(function (item) {
                const value = typeof item === 'object' ? item[valueField] : item;
                const text = typeof item === 'object' ? (item[textField] || item[valueField]) : item;
                $dropdown.append(`<option value="${value}">${text}</option>`);
            });
        }

        // Enable dropdown after populating
        $dropdown.prop('disabled', false);

        // Initialize Select2
        $dropdown.select2({
            placeholder: defaultText,
            allowClear: true,
            width: '100%'
        });
    }

    // ═══════════════════════════════════════════════════════
    // 📌 EVENT BINDINGS (Cascade Flow)
    // ═══════════════════════════════════════════════════════

    /**
     * Bind filter events
     * Cascade Flow: Company → Year → Month → CostCenter
     */
    function bindFilterEvents() {
        // ═══════════════════════════════════════════════════════
        // 1️⃣ COMPANY CHANGE → Load Years (enable) + Reset Month/CC (disable)
        // ═══════════════════════════════════════════════════════
        $('#companyFilter').on('change', async function () {
            const companyId = $(this).val();

            // Reset dependent dropdowns to DISABLED
            resetDisabledSelect2('#yearsFilter', 'Select Year');
            resetDisabledSelect2('#monthFilter', 'All Months');
            resetDisabledSelect2('#costcenterFilter', 'All Cost Centers');

            if (companyId) {
                try {
                    // Load Years for selected Company
                    showDropdownSpinner('yearSpinner');
                    const years = await PEApi.getYears(companyId);
                    populateYearDropdown('#yearsFilter', years, 'Select Year');
                    hideDropdownSpinner('yearSpinner');
                    console.log('PE Management: Years loaded for company', companyId, ':', years.length);
                } catch (error) {
                    console.error('Failed to load years:', error);
                    hideDropdownSpinner('yearSpinner');
                }
            }
        });

        // ═══════════════════════════════════════════════════════
        // 2️⃣ YEAR CHANGE → Load Months (enable) + Reset CC (disable)
        // ═══════════════════════════════════════════════════════
        $('#yearsFilter').on('change', async function () {
            const companyId = $('#companyFilter').val();
            const peYear = $(this).val();

            // Reset dependent dropdowns to DISABLED
            resetDisabledSelect2('#monthFilter', 'All Months');
            resetDisabledSelect2('#costcenterFilter', 'All Cost Centers');

            if (companyId && peYear) {
                try {
                    // Load Months (Static 1-12 from API)
                    showDropdownSpinner('monthSpinner');
                    const months = await PEApi.getMonths();
                    populateMonthDropdown('#monthFilter', months, 'All Months');
                    hideDropdownSpinner('monthSpinner');
                    console.log('PE Management: Months loaded:', months.length);
                } catch (error) {
                    console.error('Failed to load months:', error);
                    hideDropdownSpinner('monthSpinner');
                }
            }
        });

        // ═══════════════════════════════════════════════════════
        // 3️⃣ MONTH CHANGE → Load CostCenters (enable)
        // ═══════════════════════════════════════════════════════
        $('#monthFilter').on('change', async function () {
            const companyId = $('#companyFilter').val();
            const peYear = $('#yearsFilter').val();

            // Reset CostCenter dropdown to DISABLED
            resetDisabledSelect2('#costcenterFilter', 'All Cost Centers');

            if (companyId && peYear) {
                try {
                    // Load Cost Centers for selected Company + Year
                    showDropdownSpinner('costcenterSpinner');
                    const costCenters = await PEApi.getCostCenters(companyId, peYear);
                    populateCostCenterDropdown('#costcenterFilter', costCenters, 'All Cost Centers');
                    hideDropdownSpinner('costcenterSpinner');
                    console.log('PE Management: Cost Centers loaded:', costCenters.length);
                } catch (error) {
                    console.error('Failed to load cost centers:', error);
                    hideDropdownSpinner('costcenterSpinner');
                }
            }
        });

        // ═══════════════════════════════════════════════════════
        // 4️⃣ SEARCH BUTTON → Load AG Grid Data
        // ═══════════════════════════════════════════════════════
        $('#searchBtn').on('click', function () {
            const filter = {
                companyId: $('#companyFilter').val(),
                peYear: $('#yearsFilter').val(),
                peMonth: $('#monthFilter').val(),
                costCenterCode: $('#costcenterFilter').val()
            };

            // Validate required fields
            if (!filter.companyId) {
                PECore.showToast('Please select a Company', 'warning');
                return;
            }
            if (!filter.peYear) {
                PECore.showToast('Please select a Year', 'warning');
                return;
            }

            console.log('PE Management: Search with filter:', filter);

            // Show/Hide Month column based on filter selection
            // If no specific month selected (All Months), show Month column
            const showMonthColumn = !filter.peMonth || filter.peMonth === '';
            if (typeof PEGrid !== 'undefined' && PEGrid.setMonthColumnVisible) {
                PEGrid.setMonthColumnVisible(showMonthColumn);
            }

            // Load grid data
            loadGridData(filter);
        });

        // ═══════════════════════════════════════════════════════
        // 5️⃣ RESET BUTTON → Reset all to initial state
        // ═══════════════════════════════════════════════════════
        $('#resetBtn').on('click', function () {
            // Re-initialize all filters (reload Companies, disable others)
            initFilters();

            // Clear grid
            if (typeof PEGrid !== 'undefined' && PEGrid.clearData) {
                PEGrid.clearData();
            }
        });

        // Export Excel button click
        $('#btnExportPEManagementExcel').on('click', function () {
            PEGrid.exportToExcel();
        });
    }

    /**
     * Load grid data from API
     * @param {object} filter - Filter criteria
     */
    async function loadGridData(filter) {
        try {
            PECore.showLoading();

            // Build query parameters
            const params = {
                companyId: filter.companyId,
                peYear: filter.peYear
            };
            if (filter.peMonth) params.peMonth = filter.peMonth;
            if (filter.costCenterCode) params.costCenterCode = filter.costCenterCode;

            // Call API
            const response = await $.ajax({
                url: PE_API.getAll,
                method: 'GET',
                data: params,
                dataType: 'json'
            });

            if (response.success && response.data) {
                PEGrid.setData(response.data);
                console.log('PE Management: Grid loaded with', response.data.length, 'rows');
            } else {
                PEGrid.setData([]);
                console.log('PE Management: No data found');
            }
        } catch (error) {
            console.error('Failed to load grid data:', error);
            PECore.showToast('Failed to load data', 'error');
            PEGrid.setData([]);
        } finally {
            PECore.hideLoading();
        }
    }

    /**
     * Bind fullscreen events
     */
    function bindFullscreenEvents() {
        // Fullscreen toggle button
        $('#btnTogglePEManagementFullscreen').on('click', function () {
            const container = document.getElementById('peManagementGridContainer');
            if (!document.fullscreenElement) {
                container.requestFullscreen();
                $(this).find('i').removeClass('fa-expand').addClass('fa-compress');
            } else {
                document.exitFullscreen();
                $(this).find('i').removeClass('fa-compress').addClass('fa-expand');
            }
        });

        // Handle fullscreen change event
        document.addEventListener('fullscreenchange', function () {
            const icon = $('#btnTogglePEManagementFullscreen i');
            if (document.fullscreenElement) {
                icon.removeClass('fa-expand').addClass('fa-compress');
            } else {
                icon.removeClass('fa-compress').addClass('fa-expand');
            }
        });
    }

    // ═══════════════════════════════════════════════════════
    // 📤 PUBLIC API
    // ═══════════════════════════════════════════════════════

    return {
        init,
        initFilters,
        populateDropdown,
        populateCompanyDropdown,
        populateYearDropdown,
        populateMonthDropdown,
        populateCostCenterDropdown,
        initDisabledSelect2,
        resetDisabledSelect2,
        enableSelect2,
        showDropdownSpinner,
        hideDropdownSpinner,
        loadGridData
    };
})();

// Initialize on document ready
$(document).ready(function () {
    PEMain.init();
});
