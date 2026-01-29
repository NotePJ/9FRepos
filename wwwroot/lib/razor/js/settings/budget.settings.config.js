// ═══════════════════════════════════════════════════════════════════
// ⚙️ BUDGET SETTINGS CONFIGURATION
// Central configuration for Settings Management System
// ═══════════════════════════════════════════════════════════════════

const BudgetSettingsConfig = (function () {
    'use strict';

    // Get config from window object (set by Razor view)
    const config = window.settingsConfig || {};

    // Get base URL from global config (supports IIS virtual directory)
    const SETTINGS_API_BASE = (window.AppConfig && window.AppConfig.apiBaseUrl) ? window.AppConfig.apiBaseUrl : './api/';

    return {
        // ═══════════════════════════════════════════════════════════════════
        // 📋 MODEL CONFIGURATION
        // ═══════════════════════════════════════════════════════════════════
        MODEL_NAME: config.modelName || 'Unknown',
        DISPLAY_NAME: config.displayName || 'Unknown',

        // ═══════════════════════════════════════════════════════════════════
        // 🌐 API ENDPOINTS
        // ═══════════════════════════════════════════════════════════════════
        API: {
            getcolumns: SETTINGS_API_BASE + 'Settings/getcolumns',
            getdata: SETTINGS_API_BASE + 'Settings/getdata',
            create: SETTINGS_API_BASE + 'Settings/create',
            update: SETTINGS_API_BASE + 'Settings/update',
            delete: SETTINGS_API_BASE + 'Settings/delete'
        },

        // ═══════════════════════════════════════════════════════════════════
        // 📊 GRID CONFIGURATION
        // ═══════════════════════════════════════════════════════════════════
        GRID: {
            defaultColDef: {
                sortable: true,
                filter: true,
                resizable: true,
                minWidth: 100
            },
            pagination: true,
            paginationPageSize: 50,
            paginationPageSizeSelector: [20, 50, 100, 200],
            rowSelection: 'single',
            animateRows: true,
            suppressCellFocus: false,
            enableCellTextSelection: true,
            actionColumn: {
                headerName: 'Actions',
                field: 'actions',
                width: 120,
                editable: false,
                filter: false,
                sortable: false,
                pinned: 'left'
            }
        },

        // ═══════════════════════════════════════════════════════════════════
        // 🎨 CSS CLASSES
        // ═══════════════════════════════════════════════════════════════════
        CSS: {
            // Button styles
            btnEdit: 'btn btn-sm btn-ghost-core btn-edit me-1',
            btnDelete: 'btn btn-sm btn-ghost-danger btn-delete',
            btnSecondary: 'btn btn-secondary',
            btnDanger: 'btn-danger',

            // Form styles
            formLabel: 'form-label',
            formControl: 'form-control',
            formCheck: 'form-check',
            formCheckInput: 'form-check-input',

            // Layout
            mb3: 'mb-3',

            // Toast styles
            toastSuccess: 'toast align-items-center text-bg-success border-0',
            toastDanger: 'toast align-items-center text-bg-danger border-0',
            toastContainer: 'toast-container position-fixed top-0 end-0 p-3'
        },

        // ═══════════════════════════════════════════════════════════════════
        // 🎯 ICONS
        // ═══════════════════════════════════════════════════════════════════
        ICONS: {
            // Action icons
            edit: 'fa-solid fa-pencil',
            delete: 'fa-solid fa-trash',

            // Status icons
            checkSuccess: 'fa fa-check text-success',
            timesDanger: 'fa fa-times text-danger',

            // Toast icons
            checkCircle: 'fa-solid fa-check-circle me-2',
            exclamationCircle: 'fa-solid fa-exclamation-circle me-2',

            // Button icons
            save: 'fa-solid fa-save'
        },

        // ═══════════════════════════════════════════════════════════════════
        // 🔔 TOAST CONFIGURATION
        // ═══════════════════════════════════════════════════════════════════
        TOAST: {
            autohide: true,
            delay: 3000,
            position: 'top-0 end-0',
            zIndex: '9999'
        },

        // ═══════════════════════════════════════════════════════════════════
        // 💬 UI MESSAGES
        // ═══════════════════════════════════════════════════════════════════
        MESSAGES: {
            // Success messages
            createSuccess: 'Created successfully',
            updateSuccess: 'Updated successfully',
            deleteSuccess: 'Deleted successfully',

            // Error messages
            noDataFound: 'No data found',
            gridNotInitialized: 'Grid not initialized',
            operationFailed: 'Operation failed',
            deleteFailed: 'Delete failed',
            errorSavingRecord: 'Error saving record',
            errorDeletingRecord: 'Error deleting record',
            errorLoadingData: 'Error loading data',
            failedToInitializeGrid: 'Failed to initialize grid',
            failedToLoadColumns: 'Failed to load columns',
            offcanvasNotLoaded: 'Error: Offcanvas library is not loaded. Please refresh the page.',

            // Loading messages
            saving: 'Saving...',

            // Form titles
            addTitle: (displayName) => `Add ${displayName}`,
            editTitle: (displayName) => `Edit ${displayName}`,

            // Confirm dialog
            confirmDeleteTitle: 'Confirm Delete',
            confirmDeleteMessage: (displayName) => `Are you sure you want to delete this ${displayName}?`,
            confirmDeleteButton: 'Delete',
            cancelButton: 'Cancel'
        },

        // ═══════════════════════════════════════════════════════════════════
        // 🎛️ DOM SELECTORS
        // ═══════════════════════════════════════════════════════════════════
        DOM: {
            gridContainer: '#myGrid',
            formOffcanvas: 'formOffcanvas',
            formOffcanvasLabel: 'formOffcanvasLabel',
            crudForm: 'crudForm',
            formFields: 'formFields',
            recordId: 'recordId',
            saveSpinner: 'saveSpinner',
            saveText: 'saveText',
            btnSave: 'btnSave',
            btnAdd: 'btnAdd',
            btnRefresh: 'btnRefresh',
            cancelBtn: 'cancelBtn',
            confirmModal: 'confirmModal',
            confirmBtn: 'confirmBtn'
        },

        // ═══════════════════════════════════════════════════════════════════
        // 🔍 FIELD FILTERS
        // ═══════════════════════════════════════════════════════════════════
        FIELD_FILTERS: {
            // Fields to always skip in forms
            auditFields: ['UpdatedBy', 'UpdatedDate']
        },

        // ═══════════════════════════════════════════════════════════════════
        // ⏱️ TIMING
        // ═══════════════════════════════════════════════════════════════════
        TIMING: {
            autoFitDelay: 100,      // Grid auto-fit columns delay (ms)
            toastDelay: 3000        // Toast autohide delay (ms)
        },

        // ═══════════════════════════════════════════════════════════════════
        // 🌍 LOCALE
        // ═══════════════════════════════════════════════════════════════════
        LOCALE: {
            dateFormat: 'en-GB'     // Date format locale
        }
    };
})();
