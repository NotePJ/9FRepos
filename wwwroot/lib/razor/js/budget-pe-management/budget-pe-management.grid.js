/**
 * PE Management AG Grid Module
 * AG Grid configuration for PE Management
 * Read-Only mode with Action column
 *
 * Created: 3 Dec 2025
 * Author: Ten (AI Developer)
 */

const PEGrid = (function () {
    'use strict';

    // ═══════════════════════════════════════════════════════
    // 🏠 PRIVATE STATE
    // ═══════════════════════════════════════════════════════

    let gridApi = null;
    let gridColumnApi = null;
    let gridOptions = null;
    let currentFilter = {};

    // ═══════════════════════════════════════════════════════
    // 🎨 COLUMN DEFINITIONS
    // ═══════════════════════════════════════════════════════

    /**
     * Get column definitions
     * ลำดับตาม Excel Template:
     * Action → Cost Center → Org → B0 → Transfer In/Out/Additional/Cut (Init)
     * → Acc. Transfer In/Out/Additional/Cut → B1 → Actual → Diff B0 → Diff B1
     * @returns {Array} Column definitions array
     */
    function getColumnDefs() {
        return [
            // ═══ 1. Action Column ═══
            {
                headerName: 'Action',
                field: 'action',
                width: 100,
                pinned: 'left',
                cellRenderer: ActionCellRenderer,
                suppressHeaderMenuButton: true,
                sortable: false,
                filter: false,
                //headerClass: 'ag-header-cell-action'
            },

            // ═══ 2. Cost Center Info ═══
            {
                headerName: 'Cost Center',
                headerClass: 'ag-header-cost-center',
                children: [
                    {
                        headerName: 'Code',
                        field: 'costCenterCode',
                        width: 100,
                        pinned: 'left',
                        filter: 'agTextColumnFilter'
                    },
                    {
                        headerName: 'Name',
                        field: 'costCenterName',
                        width: 150,
                        pinned: 'left',
                        filter: 'agTextColumnFilter'
                    }
                ]
            },

            // ═══ 2.5. Month Column (Conditional - shown when All Months selected) ═══
            {
                headerName: 'Month',
                field: 'peMonth',
                width: 90,
                hide: true, // Hidden by default, shown when "All Months" selected
                headerClass: 'ag-header-month',
                valueFormatter: function(params) {
                    if (params.value == null) return '';
                    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return monthNames[params.value] || params.value;
                },
                filter: 'agNumberColumnFilter'
            },

            // ═══ 3. Organization Info ═══
            {
                headerName: 'Org.',
                headerClass: 'ag-header-org',
                children: [
                    {
                        headerName: 'Div',
                        field: 'division',
                        width: 100,
                        filter: 'agTextColumnFilter',
                        //cellClass: 'cell-org'
                    },
                    {
                        headerName: 'Department',
                        field: 'department',
                        width: 120,
                        filter: 'agTextColumnFilter',
                        //cellClass: 'cell-org'
                    },
                    {
                        headerName: 'Section',
                        field: 'section',
                        width: 120,
                        filter: 'agTextColumnFilter',
                        //cellClass: 'cell-org'
                    }
                ]
            },

            // ═══ 4. B0 (Green Background) ═══
            {
                headerName: 'B0',
                headerClass: 'ag-header-b0',
                children: [
                    {
                        headerName: 'HC',
                        field: 'b0Hc',
                        width: 80,
                        type: 'numericColumn',
                        valueFormatter: formatHCValue,
                        //cellClass: 'cell-b0'
                    },
                    {
                        headerName: 'Base+Wage',
                        field: 'b0BaseWage',
                        width: 120,
                        type: 'numericColumn',
                        valueFormatter: formatCurrencyValue,
                        //cellClass: 'cell-b0'
                    }
                ]
            },

            // ═══ 5. Transfer In - Init (Blue Background) ═══
            {
                headerName: 'Transfer In',
                headerClass: 'ag-header-transfer-in',
                children: [
                    {
                        headerName: 'HC',
                        field: 'moveInHc',
                        width: 80,
                        type: 'numericColumn',
                        valueFormatter: formatHCValue,
                        //cellClass: 'cell-transfer-in'
                    },
                    {
                        headerName: 'Base+Wage',
                        field: 'moveInBaseWage',
                        width: 120,
                        type: 'numericColumn',
                        valueFormatter: formatCurrencyValue,
                        //cellClass: 'cell-transfer-in'
                    }
                ]
            },

            // ═══ 6. Transfer Out - Init (Orange Background) ═══
            {
                headerName: 'Transfer Out',
                headerClass: 'ag-header-transfer-out',
                children: [
                    {
                        headerName: 'HC',
                        field: 'moveOutHc',
                        width: 80,
                        type: 'numericColumn',
                        valueFormatter: formatHCValue,
                        //cellClass: 'cell-transfer-out'
                    },
                    {
                        headerName: 'Base+Wage',
                        field: 'moveOutBaseWage',
                        width: 120,
                        type: 'numericColumn',
                        valueFormatter: formatCurrencyValue,
                        //cellClass: 'cell-transfer-out'
                    }
                ]
            },

            // ═══ 7. Additional - Init (Purple Background) ═══
            {
                headerName: 'Additional (Approved by MGT)',
                headerClass: 'ag-header-additional',
                children: [
                    {
                        headerName: 'HC',
                        field: 'additionalHc',
                        width: 80,
                        type: 'numericColumn',
                        valueFormatter: formatHCValue,
                        //cellClass: 'cell-additional'
                    },
                    {
                        headerName: 'Base+Wage',
                        field: 'additionalBaseWage',
                        width: 120,
                        type: 'numericColumn',
                        valueFormatter: formatCurrencyValue,
                        //cellClass: 'cell-additional'
                    }
                ]
            },

            // ═══ 8. Cut - Init (Red Background) ═══
            {
                headerName: 'Cut',
                headerClass: 'ag-header-cut',
                children: [
                    {
                        headerName: 'HC',
                        field: 'cutHc',
                        width: 80,
                        type: 'numericColumn',
                        valueFormatter: formatHCValue,
                        //cellClass: 'cell-cut'
                    },
                    {
                        headerName: 'Base+Wage',
                        field: 'cutBaseWage',
                        width: 120,
                        type: 'numericColumn',
                        valueFormatter: formatCurrencyValue,
                        //cellClass: 'cell-cut'
                    }
                ]
            },

            // ═══ 9. Acc. Transfer In (Blue Background) ═══
            {
                headerName: 'Acc. Transfer In',
                headerClass: 'ag-header-acc-transfer-in',
                children: [
                    {
                        headerName: 'HC',
                        field: 'accMoveInHc',
                        width: 80,
                        type: 'numericColumn',
                        valueFormatter: formatHCValue,
                        //cellClass: 'cell-acc-transfer-in'
                    },
                    {
                        headerName: 'Base+Wage',
                        field: 'accMoveInBaseWage',
                        width: 120,
                        type: 'numericColumn',
                        valueFormatter: formatCurrencyValue,
                        //cellClass: 'cell-acc-transfer-in'
                    }
                ]
            },

            // ═══ 10. Acc. Transfer Out (Orange Background) ═══
            {
                headerName: 'Acc. Transfer Out',
                headerClass: 'ag-header-acc-transfer-out',
                children: [
                    {
                        headerName: 'HC',
                        field: 'accMoveOutHc',
                        width: 80,
                        type: 'numericColumn',
                        valueFormatter: formatHCValue,
                        //cellClass: 'cell-acc-transfer-out'
                    },
                    {
                        headerName: 'Base+Wage',
                        field: 'accMoveOutBaseWage',
                        width: 120,
                        type: 'numericColumn',
                        valueFormatter: formatCurrencyValue,
                        //cellClass: 'cell-acc-transfer-out'
                    }
                ]
            },

            // ═══ 11. Acc. Additional (Purple Background) ═══
            {
                headerName: 'Acc. Additional (Approved by MGT)',
                headerClass: 'ag-header-acc-additional',
                children: [
                    {
                        headerName: 'HC',
                        field: 'accAddHc',
                        width: 80,
                        type: 'numericColumn',
                        valueFormatter: formatHCValue,
                        //cellClass: 'cell-acc-additional'
                    },
                    {
                        headerName: 'Base+Wage',
                        field: 'accAddBaseWage',
                        width: 120,
                        type: 'numericColumn',
                        valueFormatter: formatCurrencyValue,
                        //cellClass: 'cell-acc-additional'
                    }
                ]
            },

            // ═══ 12. Acc. Cut (Red Background) ═══
            {
                headerName: 'Acc. Cut',
                headerClass: 'ag-header-acc-cut',
                children: [
                    {
                        headerName: 'HC',
                        field: 'accCutHc',
                        width: 80,
                        type: 'numericColumn',
                        valueFormatter: formatHCValue,
                        //cellClass: 'cell-acc-cut'
                    },
                    {
                        headerName: 'Base+Wage',
                        field: 'accCutBaseWage',
                        width: 120,
                        type: 'numericColumn',
                        valueFormatter: formatCurrencyValue,
                        //cellClass: 'cell-acc-cut'
                    }
                ]
            },

            // ═══ 13. B1 (After Adjust - Green Background) ═══
            {
                headerName: 'B1 (After Adjust)',
                headerClass: 'ag-header-b1',
                children: [
                    {
                        headerName: 'Grouping',
                        field: 'groupData',
                        width: 100,
                        filter: 'agTextColumnFilter',
                        //cellClass: 'cell-b1'
                    },
                    {
                        headerName: 'HC',
                        field: 'b1Hc',
                        width: 80,
                        type: 'numericColumn',
                        valueFormatter: formatHCValue,
                        //cellClass: 'cell-b1'
                    },
                    {
                        headerName: 'Base+Wage',
                        field: 'b1BaseWage',
                        width: 120,
                        type: 'numericColumn',
                        valueFormatter: formatCurrencyValue,
                        //cellClass: 'cell-b1'
                    }
                ]
            },

            // ═══ 14. Actual (Gray Background) ═══
            {
                headerName: 'Actual',
                headerClass: 'ag-header-actual',
                children: [
                    {
                        headerName: 'Grouping',
                        field: 'actualGrouping',
                        width: 100,
                        filter: 'agTextColumnFilter',
                        //cellClass: 'cell-actual'
                    },
                    {
                        headerName: 'HC',
                        field: 'actualHc',
                        width: 80,
                        type: 'numericColumn',
                        valueFormatter: formatHCValue,
                        //cellClass: 'cell-actual'
                    },
                    {
                        headerName: 'Base+Wage+Premium',
                        field: 'actualBaseWagePremium',
                        width: 150,
                        type: 'numericColumn',
                        valueFormatter: formatCurrencyValue,
                        //cellClass: 'cell-actual'
                    }
                ]
            },

            // ═══ 15. Diff from B0 ═══
            {
                headerName: 'Diff from B0',
                headerClass: 'ag-header-diff-b0',
                children: [
                    {
                        headerName: 'HC',
                        field: 'diffB0Hc',
                        width: 80,
                        type: 'numericColumn',
                        valueFormatter: formatHCValue,
                        cellClass: getDiffCellClass
                    },
                    {
                        headerName: 'Base+Wage+Premium',
                        field: 'diffB0BaseWagePremium',
                        width: 150,
                        type: 'numericColumn',
                        valueFormatter: formatCurrencyValue,
                        cellClass: getDiffCellClass
                    }
                ]
            },

            // ═══ 16. Diff from B1 ═══
            {
                headerName: 'Diff from B1',
                headerClass: 'ag-header-diff-b1',
                children: [
                    {
                        headerName: 'HC',
                        field: 'diffB1Hc',
                        width: 80,
                        type: 'numericColumn',
                        valueFormatter: formatHCValue,
                        cellClass: getDiffCellClass
                    },
                    {
                        headerName: 'Base+Wage+Premium',
                        field: 'diffB1BaseWagePremium',
                        width: 150,
                        type: 'numericColumn',
                        valueFormatter: formatCurrencyValue,
                        cellClass: getDiffCellClass
                    }
                ]
            }
        ];
    }

    // ═══════════════════════════════════════════════════════
    // 🔧 VALUE FORMATTERS
    // ═══════════════════════════════════════════════════════

    /**
     * Format HC value
     * @param {object} params - AG Grid params
     * @returns {string} Formatted value
     */
    function formatHCValue(params) {
        return PECore.formatHC(params.value);
    }

    /**
     * Format currency value
     * @param {object} params - AG Grid params
     * @returns {string} Formatted value
     */
    function formatCurrencyValue(params) {
        return PECore.formatCurrency(params.value);
    }

    /**
     * Get diff cell class (red for negative, green for positive)
     * @param {object} params - AG Grid params
     * @returns {string} CSS class
     */
    function getDiffCellClass(params) {
        const value = PECore.parseDecimal(params.value);
        if (value < 0) return 'cell-diff-negative';
        if (value > 0) return 'cell-diff-positive';
        return 'cell-diff-zero';
    }

    // ═══════════════════════════════════════════════════════
    // 🎯 CELL RENDERERS
    // ═══════════════════════════════════════════════════════

    /**
     * Action cell renderer
     * @param {object} params - AG Grid params
     * @returns {string} HTML content
     */
    function ActionCellRenderer(params) {
        if (!params.data) return '';

        return `
            <div class="d-flex gap-1 align-items-center justify-content-center h-100">
                <button type="button" class="btn btn-core-inverse btn-add-movement"
                        data-action="add" title="Add Movement">
                    <i class="fa-solid fa-plus"></i>
                </button>
                <button type="button" class="btn btn-core-secondary-inverse btn-view-history"
                        data-action="history" title="View History">
                    <i class="fa-solid fa-database"></i>
                </button>
            </div>
        `;
    }

    // ═══════════════════════════════════════════════════════
    // 📊 GRID CONFIGURATION
    // ═══════════════════════════════════════════════════════

    /**
     * Get grid options
     * @returns {object} Grid options
     */
    function getGridOptions() {
        return {
            columnDefs: getColumnDefs(),
            defaultColDef: {
                sortable: true,
                filter: true,
                resizable: true,
                suppressMovable: true
            },
            rowData: [],

            // Read-Only mode
            suppressClickEdit: true,
            suppressCellFocus: false,
            enableRangeSelection: false,

            // Row selection
            rowSelection: 'single',

            // Appearance
            animateRows: true,
            suppressRowHoverHighlight: false,

            // Column Groups
            groupHeaderHeight: 35,
            headerHeight: 35,

            // Row Height
            rowHeight: 40,

            // Events
            onGridReady: onGridReady,
            onCellClicked: onCellClicked,
            onFirstDataRendered: onFirstDataRendered,

            // Context
            context: {},

            // Note: statusBar removed (requires AG Grid Enterprise)

            // Loading overlay
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">Loading PE Management data...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-no-rows-center">No data available</span>'
        };
    }

    // ═══════════════════════════════════════════════════════
    // 📌 EVENT HANDLERS
    // ═══════════════════════════════════════════════════════

    /**
     * Grid ready event handler
     * @param {object} params - Event params
     */
    function onGridReady(params) {
        gridApi = params.api;
        gridColumnApi = params.columnApi;

        // Auto size columns
        autoSizeColumns();

        // NOTE: ไม่ load data ทันที - รอให้ user กด Search ตาม Cascade Flow
        // Grid จะแสดง empty state จนกว่า user จะเลือก filters และกด Search
        console.log('PE Management: Grid ready, waiting for user to search...');
    }

    /**
     * Cell clicked event handler
     * @param {object} params - Event params
     */
    function onCellClicked(params) {
        if (!params.data) return;

        const target = params.event.target;

        // Check if action button clicked
        if (target.closest('.btn-add-movement')) {
            handleAddMovement(params.data);
        } else if (target.closest('.btn-view-history')) {
            handleViewHistory(params.data);
        }
    }

    /**
     * First data rendered event handler
     * @param {object} params - Event params
     */
    function onFirstDataRendered(params) {
        // Size columns to fit if needed
        // gridApi.sizeColumnsToFit();
    }

    /**
     * Handle Add Movement button click
     * @param {object} rowData - Row data
     */
    function handleAddMovement(rowData) {
        PEOffcanvas.show(rowData);
    }

    /**
     * Handle View History button click
     * @param {object} rowData - Row data
     */
    function handleViewHistory(rowData) {
        PEOffcanvas.showHistory(rowData);
    }

    // ═══════════════════════════════════════════════════════
    // 📊 DATA OPERATIONS
    // ═══════════════════════════════════════════════════════

    /**
     * Initialize the grid
     * @param {string} containerId - Grid container element ID
     */
    function init(containerId) {
        const gridContainer = document.getElementById(containerId);
        if (!gridContainer) {
            console.error(`Grid container not found: ${containerId}`);
            return;
        }

        gridOptions = getGridOptions();

        // Create grid using agGrid.createGrid (AG Grid 31+)
        if (typeof agGrid !== 'undefined' && agGrid.createGrid) {
            // AG Grid 31+: createGrid returns the api directly
            gridApi = agGrid.createGrid(gridContainer, gridOptions);
        } else {
            // Fallback for older AG Grid versions
            new agGrid.Grid(gridContainer, gridOptions);
            // Note: gridApi is set in onGridReady callback
        }

        // Bind custom events
        bindCustomEvents();
    }

    /**
     * Bind custom events
     */
    function bindCustomEvents() {
        // Listen for movement saved event
        $(document).on('pe:movementSaved', function (e, costCenterCode) {
            refreshData();
        });

        // Listen for filter change
        $(document).on('pe:filterChanged', function (e, filter) {
            currentFilter = filter;
            loadData();
        });
    }

    /**
     * Load data from API
     */
    async function loadData() {
        if (!gridApi) return;

        gridApi.showLoadingOverlay();

        try {
            const data = await PEApi.getAll(currentFilter);
            setData(data);
        } catch (error) {
            console.error('Failed to load data:', error);
            gridApi.showNoRowsOverlay();
        }
    }

    /**
     * Refresh data
     */
    function refreshData() {
        loadData();
    }

    /**
     * Set grid data
     * @param {Array} data - Row data array
     */
    function setData(data) {
        if (!gridApi) return;

        if (data && data.length > 0) {
            gridApi.setGridOption('rowData', data);
            gridApi.hideOverlay();
        } else {
            gridApi.setGridOption('rowData', []);
            gridApi.showNoRowsOverlay();
        }
    }

    /**
     * Get all data
     * @returns {Array} All row data
     */
    function getData() {
        if (!gridApi) return [];

        const rowData = [];
        gridApi.forEachNode(node => rowData.push(node.data));
        return rowData;
    }

    /**
     * Auto size all columns
     */
    function autoSizeColumns() {
        if (!gridApi) return;

        const allColumnIds = [];
        gridApi.getColumns().forEach(column => {
            allColumnIds.push(column.getColId());
        });
        gridApi.autoSizeColumns(allColumnIds);
    }

    /**
     * Set filter
     * @param {object} filter - Filter criteria
     */
    function setFilter(filter) {
        currentFilter = filter;
        loadData();
    }

    /**
     * Export to Excel
     */
    function exportToExcel() {
        if (!gridApi) return;

        gridApi.exportDataAsExcel({
            fileName: `PE_Management_${PECore.getCurrentYear()}_${new Date().toISOString().slice(0, 10)}.xlsx`,
            sheetName: 'PE Management'
        });
    }

    /**
     * Update single row
     * @param {string} costCenterCode - Cost Center code
     * @param {object} newData - New data
     */
    function updateRow(costCenterCode, newData) {
        if (!gridApi) return;

        gridApi.forEachNode(node => {
            if (node.data.costCenterCode === costCenterCode) {
                node.setData({ ...node.data, ...newData });
            }
        });
    }

    /**
     * Set Month column visibility
     * @param {boolean} visible - Whether to show Month column
     */
    function setMonthColumnVisible(visible) {
        if (!gridApi) return;
        gridApi.setColumnsVisible(['peMonth'], visible);
    }

    // ═══════════════════════════════════════════════════════
    // 📤 PUBLIC API
    // ═══════════════════════════════════════════════════════

    return {
        init,
        loadData,
        refreshData,
        setData,
        getData,
        setFilter,
        exportToExcel,
        updateRow,
        autoSizeColumns,
        setMonthColumnVisible
    };
})();
