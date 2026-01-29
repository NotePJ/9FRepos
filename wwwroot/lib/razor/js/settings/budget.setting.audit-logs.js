/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Audit Logs Main JavaScript
 * Handles AG Grid initialization, data loading, and user interactions
 * Uses AG Grid built-in pagination (client-side)
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════════
    // STATE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════
    const state = {
        grids: {
            login: null,
            email: null,
            upload: null,
            activity: null
        },
        currentTab: 'login',
        filters: {
            login: {},
            email: {},
            upload: {},
            activity: {}
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // HELPER FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Get date 10 days ago in YYYY-MM-DD format
     */
    function getDefaultDateFrom() {
        const date = new Date();
        date.setDate(date.getDate() - 10);
        return date.toISOString().split('T')[0];
    }

    /**
     * Get today's date in YYYY-MM-DD format
     */
    function getDefaultDateTo() {
        return new Date().toISOString().split('T')[0];
    }

    /**
     * Set default date filters (10 days)
     */
    function setDefaultDateFilters() {
        const dateFrom = getDefaultDateFrom();
        const dateTo = getDefaultDateTo();

        // Set for all tabs
        ['login', 'email', 'upload', 'activity'].forEach(tab => {
            const dateFromInput = document.getElementById(`${tab}DateFrom`);
            const dateToInput = document.getElementById(`${tab}DateTo`);

            if (dateFromInput) dateFromInput.value = dateFrom;
            if (dateToInput) dateToInput.value = dateTo;

            // Store in state
            state.filters[tab] = {
                dateFrom: dateFrom,
                dateTo: dateTo
            };
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🔧 Initializing Audit Logs...');

        // Set default date filters (last 10 days)
        setDefaultDateFilters();

        initializeGrids();
        bindEventListeners();

        // Load initial data for login tab
        loadData('login');
    });

    /**
     * Initialize all AG Grid instances
     */
    function initializeGrids() {
        const config = window.AuditLogsConfig;

        // Initialize Login Grid
        const loginGridDiv = document.getElementById('loginGrid');
        if (loginGridDiv) {
            state.grids.login = agGrid.createGrid(loginGridDiv, {
                ...config.DEFAULT_GRID_OPTIONS,
                columnDefs: config.LOGIN_LOG_COLUMNS,
                onFilterChanged: () => handleFilterChanged('login')
            });
        }

        // Initialize Email Grid
        const emailGridDiv = document.getElementById('emailGrid');
        if (emailGridDiv) {
            state.grids.email = agGrid.createGrid(emailGridDiv, {
                ...config.DEFAULT_GRID_OPTIONS,
                columnDefs: config.EMAIL_LOG_COLUMNS,
                onFilterChanged: () => handleFilterChanged('email')
            });
        }

        // Initialize Upload Grid
        const uploadGridDiv = document.getElementById('uploadGrid');
        if (uploadGridDiv) {
            state.grids.upload = agGrid.createGrid(uploadGridDiv, {
                ...config.DEFAULT_GRID_OPTIONS,
                columnDefs: config.UPLOAD_LOG_COLUMNS,
                onFilterChanged: () => handleFilterChanged('upload')
            });
        }

        // Initialize Activity Grid
        const activityGridDiv = document.getElementById('activityGrid');
        if (activityGridDiv) {
            state.grids.activity = agGrid.createGrid(activityGridDiv, {
                ...config.DEFAULT_GRID_OPTIONS,
                columnDefs: config.ACTIVITY_LOG_COLUMNS,
                onFilterChanged: () => handleFilterChanged('activity')
            });
        }
    }

    /**
     * Bind all event listeners
     */
    function bindEventListeners() {
        // Tab change events
        document.querySelectorAll('#auditLogTabs button[data-coreui-toggle="tab"]').forEach(tab => {
            tab.addEventListener('shown.coreui.tab', function(event) {
                const tabId = event.target.id.replace('-tab', '');
                state.currentTab = tabId;

                // Load data if not loaded yet
                const grid = state.grids[tabId];
                if (grid) {
                    const rowCount = grid.getDisplayedRowCount?.() || 0;
                    if (rowCount === 0) {
                        loadData(tabId);
                    }
                }
            });
        });

        // Login tab events
        bindTabEvents('login', {
            searchBtn: 'btnLoginSearch',
            resetBtn: 'btnLoginReset',
            clearFilterBtn: 'btnLoginClearFilter',
            refreshBtn: 'btnLoginRefresh',
            exportBtn: 'btnLoginExportExcel',
            fullscreenBtn: 'btnLoginFullscreen',
            dateFrom: 'loginDateFrom',
            dateTo: 'loginDateTo',
            username: 'loginUsername',
            status: 'loginStatus'
        });

        // Email tab events
        bindTabEvents('email', {
            searchBtn: 'btnEmailSearch',
            resetBtn: 'btnEmailReset',
            clearFilterBtn: 'btnEmailClearFilter',
            refreshBtn: 'btnEmailRefresh',
            exportBtn: 'btnEmailExportExcel',
            fullscreenBtn: 'btnEmailFullscreen',
            dateFrom: 'emailDateFrom',
            dateTo: 'emailDateTo',
            searchText: 'emailToEmail',
            status: 'emailStatus'
        });

        // Upload tab events
        bindTabEvents('upload', {
            searchBtn: 'btnUploadSearch',
            resetBtn: 'btnUploadReset',
            clearFilterBtn: 'btnUploadClearFilter',
            refreshBtn: 'btnUploadRefresh',
            exportBtn: 'btnUploadExportExcel',
            fullscreenBtn: 'btnUploadFullscreen',
            dateFrom: 'uploadDateFrom',
            dateTo: 'uploadDateTo',
            username: 'uploadUsername',
            fileType: 'uploadFileType'
        });

        // Activity tab events
        bindTabEvents('activity', {
            searchBtn: 'btnActivitySearch',
            resetBtn: 'btnActivityReset',
            clearFilterBtn: 'btnActivityClearFilter',
            refreshBtn: 'btnActivityRefresh',
            exportBtn: 'btnActivityExportExcel',
            fullscreenBtn: 'btnActivityFullscreen',
            dateFrom: 'activityDateFrom',
            dateTo: 'activityDateTo',
            userId: 'activityUserId',
            moduleName: 'activityModule',
            action: 'activityAction'
        });
    }

    /**
     * Bind events for a specific tab
     */
    function bindTabEvents(tabKey, elementIds) {
        // Search button
        const searchBtn = document.getElementById(elementIds.searchBtn);
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                collectFilters(tabKey, elementIds);
                loadData(tabKey);
            });
        }

        // Reset button
        const resetBtn = document.getElementById(elementIds.resetBtn);
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                resetFilters(tabKey, elementIds);
                loadData(tabKey);
            });
        }

        // Clear filter button (AG Grid filters)
        const clearFilterBtn = document.getElementById(elementIds.clearFilterBtn);
        if (clearFilterBtn) {
            clearFilterBtn.addEventListener('click', () => {
                const grid = state.grids[tabKey];
                if (grid) {
                    grid.setFilterModel(null);
                }
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById(elementIds.refreshBtn);
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => loadData(tabKey));
        }

        // Export button
        const exportBtn = document.getElementById(elementIds.exportBtn);
        if (exportBtn) {
            exportBtn.addEventListener('click', () => exportToExcel(tabKey));
        }

        // Fullscreen button
        const fullscreenBtn = document.getElementById(elementIds.fullscreenBtn);
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => toggleFullscreen(tabKey));
        }

        // Enter key on input fields
        const inputs = [elementIds.dateFrom, elementIds.dateTo, elementIds.username, elementIds.searchText].filter(Boolean);
        inputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        collectFilters(tabKey, elementIds);
                        loadData(tabKey);
                    }
                });
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DATA LOADING
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Load data from API (client-side - load all data at once)
     */
    async function loadData(tabKey) {
        const config = window.AuditLogsConfig;
        const logType = config.LOG_TYPES[tabKey.toUpperCase()];
        if (!logType) return;

        const grid = state.grids[tabKey];
        if (!grid) return;

        // Show loading
        grid.showLoadingOverlay();

        try {
            // Build query parameters (no pagination params - load all filtered data)
            const params = new URLSearchParams({
                ...state.filters[tabKey]
            });

            // Remove empty params
            for (const [key, value] of params.entries()) {
                if (!value) params.delete(key);
            }

            const response = await fetch(`${logType.apiEndpoint}?${params.toString()}`);
            const result = await response.json();

            if (result.success) {
                // Update grid data (all data loaded, AG Grid handles pagination)
                grid.setGridOption('rowData', result.data || []);

                // Hide loading
                grid.hideOverlay();

                if (!result.data || result.data.length === 0) {
                    grid.showNoRowsOverlay();
                }
            } else {
                console.error('Failed to load data:', result.message);
                grid.showNoRowsOverlay();
                showToast('error', 'Error', result.message || 'Failed to load data');
            }
        } catch (error) {
            console.error('Error loading data:', error);
            grid.showNoRowsOverlay();
            showToast('error', 'Error', 'Failed to load data. Please try again.');
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // FILTER HANDLING
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Collect filter values from form
     */
    function collectFilters(tabKey, elementIds) {
        const filters = {};

        if (elementIds.dateFrom) {
            const el = document.getElementById(elementIds.dateFrom);
            if (el?.value) filters.dateFrom = el.value;
        }

        if (elementIds.dateTo) {
            const el = document.getElementById(elementIds.dateTo);
            if (el?.value) filters.dateTo = el.value;
        }

        if (elementIds.username) {
            const el = document.getElementById(elementIds.username);
            if (el?.value) filters.username = el.value;
        }

        if (elementIds.userId) {
            const el = document.getElementById(elementIds.userId);
            if (el?.value) filters.userId = el.value;
        }

        if (elementIds.searchText) {
            const el = document.getElementById(elementIds.searchText);
            if (el?.value) filters.searchText = el.value;
        }

        if (elementIds.status) {
            const el = document.getElementById(elementIds.status);
            if (el?.value) filters.status = el.value;
        }

        if (elementIds.fileType) {
            const el = document.getElementById(elementIds.fileType);
            if (el?.value) filters.fileType = el.value;
        }

        if (elementIds.moduleName) {
            const el = document.getElementById(elementIds.moduleName);
            if (el?.value) filters.moduleName = el.value;
        }

        if (elementIds.action) {
            const el = document.getElementById(elementIds.action);
            if (el?.value) filters.action = el.value;
        }

        state.filters[tabKey] = filters;
    }

    /**
     * Reset filters to default (10 days)
     */
    function resetFilters(tabKey, elementIds) {
        const dateFrom = getDefaultDateFrom();
        const dateTo = getDefaultDateTo();

        // Reset form inputs
        if (elementIds.dateFrom) {
            const el = document.getElementById(elementIds.dateFrom);
            if (el) el.value = dateFrom;
        }

        if (elementIds.dateTo) {
            const el = document.getElementById(elementIds.dateTo);
            if (el) el.value = dateTo;
        }

        if (elementIds.username) {
            const el = document.getElementById(elementIds.username);
            if (el) el.value = '';
        }

        if (elementIds.userId) {
            const el = document.getElementById(elementIds.userId);
            if (el) el.value = '';
        }

        if (elementIds.searchText) {
            const el = document.getElementById(elementIds.searchText);
            if (el) el.value = '';
        }

        if (elementIds.status) {
            const el = document.getElementById(elementIds.status);
            if (el) el.selectedIndex = 0;
        }

        if (elementIds.fileType) {
            const el = document.getElementById(elementIds.fileType);
            if (el) el.selectedIndex = 0;
        }

        if (elementIds.moduleName) {
            const el = document.getElementById(elementIds.moduleName);
            if (el) el.selectedIndex = 0;
        }

        if (elementIds.action) {
            const el = document.getElementById(elementIds.action);
            if (el) el.selectedIndex = 0;
        }

        // Clear AG Grid filters
        const grid = state.grids[tabKey];
        if (grid) {
            grid.setFilterModel(null);
        }

        // Reset state to default date range
        state.filters[tabKey] = {
            dateFrom: dateFrom,
            dateTo: dateTo
        };
    }

    /**
     * Handle AG Grid filter change
     */
    function handleFilterChanged(tabKey) {
        // AG Grid handles filtering client-side
        console.log(`[${tabKey}] Grid filter changed`);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // EXPORT TO EXCEL
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Export grid data to Excel
     */
    function exportToExcel(tabKey) {
        const grid = state.grids[tabKey];
        if (!grid) return;

        const config = window.AuditLogsConfig;
        const logType = config.LOG_TYPES[tabKey.toUpperCase()];
        const fileName = `${logType.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;

        grid.exportDataAsExcel({
            fileName: fileName,
            sheetName: logType.name,
            processCellCallback: (params) => {
                // Format dates for export
                if (params.column.colId.toLowerCase().includes('time') ||
                    params.column.colId.toLowerCase().includes('date')) {
                    return config.formatDateTime(params.value);
                }
                return params.value;
            }
        });

        showToast('success', 'Export Complete', `Data exported to ${fileName}`);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // FULLSCREEN
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Toggle fullscreen mode for grid
     */
    function toggleFullscreen(tabKey) {
        const container = document.getElementById(`${tabKey}GridContainer`);
        const button = document.getElementById(`btn${tabKey.charAt(0).toUpperCase() + tabKey.slice(1)}Fullscreen`);

        if (!container) return;

        container.classList.toggle('fullscreen');

        if (container.classList.contains('fullscreen')) {
            button?.querySelector('i')?.classList.replace('fa-expand', 'fa-compress');
            document.body.style.overflow = 'hidden';
        } else {
            button?.querySelector('i')?.classList.replace('fa-compress', 'fa-expand');
            document.body.style.overflow = '';
        }

        // Resize grid after toggle
        const grid = state.grids[tabKey];
        if (grid) {
            setTimeout(() => {
                grid.sizeColumnsToFit?.();
            }, 100);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TOAST NOTIFICATION
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Show toast notification
     */
    function showToast(type, title, message) {
        // Use existing toast system if available
        if (window.Swal) {
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });

            Toast.fire({
                icon: type,
                title: message
            });
        } else {
            console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
        }
    }

    // Export for external access if needed
    window.AuditLogs = {
        loadData,
        state
    };

})();
