/**
 * PE Budget Dashboard Grid
 * Top 10 Diff PE / Top 5 BU / Top 5 BP Table
 * AG Grid configuration and functions
 */

// ============================================================================
// Grid Configuration
// ============================================================================

// View type configurations for Grid
const GRID_VIEW_CONFIG = {
    'top10-growth': { maxItems: 10, filterBy: null, titlePrefix: 'Top 10 Diff PE', divisionLabel: 'Division' },
    'top5-bu': { maxItems: 5, filterBy: 'Business Unit', titlePrefix: 'Top 5 (Business Unit) Highest', divisionLabel: 'Division\n(Business Unit)' },
    'top5-bp': { maxItems: 5, filterBy: 'Business Partner', titlePrefix: 'Top 5 (Business Partner) Highest', divisionLabel: 'Division\n(Business Partner)' },
    'pe-per-hc': { maxItems: 10, filterBy: null, titlePrefix: 'Top 10 PE Per HC', divisionLabel: 'Division' }
};

// ============================================================================
// Column Header Styles
// ============================================================================

const GRID_HEADER_COLORS = {
    division: '#1a365d',           // Dark blue
    budget2025: '#2c5282',         // Blue
    le2025: '#3182ce',             // Light blue
    budget2026: '#4299e1',         // Lighter blue
    diffB0: '#718096',             // Gray
    diffLE: '#805ad5',             // Purple
    pctDiff: '#38a169',            // Green
    diffA2022: '#63b3ed',          // Light blue
    pctDiffFinal: '#4299e1'        // Blue
};

// ============================================================================
// Column Definitions
// ============================================================================

/**
 * Get column definitions for Diff PE grid
 * @param {number} companyId - Company ID (1=BJC, 2=BIG C)
 * @param {number} budgetYear - Budget year (e.g., 2026)
 * @param {string} viewType - 'top10-growth', 'top5-bu', or 'top5-bp'
 * @returns {Array} Column definitions
 */
function getDiffPEGridColumnDefs(companyId, budgetYear, viewType = 'top10-growth') {
    const prevYear = budgetYear - 1; // e.g., 2025
    const isBigC = companyId === 2;
    const config = GRID_VIEW_CONFIG[viewType];

    const columnDefs = [
        // Division Column - label changes based on view type
        {
            headerName: config.divisionLabel,
            field: 'division',
            pinned: 'left',
            lockPinned: true,
            width: 200,
            cellStyle: { fontWeight: 'bold' }
        },

        // Budget 2025 Group
        {
            headerName: `Budget ${prevYear}`,
            headerClass: 'header-budget-2025',
            children: [
                {
                    headerName: 'HC',
                    field: 'hcBudget2025',
                    width: 80,
                    type: 'numericColumn',
                    valueFormatter: params => formatNumberGrid(params.value),
                    cellClass: 'text-end'
                },
                {
                    headerName: 'PE',
                    field: 'peBudget2025',
                    width: 110,
                    type: 'numericColumn',
                    valueFormatter: params => formatPEValue(params.value),
                    cellClass: 'text-end'
                }
            ]
        },

        // LE 2025 Group
        {
            headerName: `LE ${prevYear}`,
            headerClass: 'header-le-2025',
            children: [
                {
                    headerName: 'HC',
                    headerTooltip: `Total LE ${prevYear}`,
                    field: 'hcLE2025',
                    width: 80,
                    type: 'numericColumn',
                    valueFormatter: params => formatNumberGrid(params.value),
                    cellClass: 'text-end'
                },
                {
                    headerName: 'PE',
                    field: 'peLE2025',
                    width: 110,
                    type: 'numericColumn',
                    valueFormatter: params => formatPEValue(params.value),
                    cellClass: 'text-end'
                }
            ]
        },

        // Budget 2026 Group
        {
            headerName: `Budget ${budgetYear}`,
            headerClass: 'header-budget-2026',
            children: [
                {
                    headerName: 'HC',
                    field: 'hcBudget2026',
                    width: 80,
                    type: 'numericColumn',
                    valueFormatter: params => formatNumberGrid(params.value),
                    cellClass: 'text-end'
                },
                {
                    headerName: 'PE',
                    field: 'peBudget2026',
                    width: 110,
                    type: 'numericColumn',
                    valueFormatter: params => formatPEValue(params.value),
                    cellClass: 'text-end'
                }
            ]
        },

        // Diff B2026 vs B2025(B0) Group
        {
            headerName: `Diff\nB${budgetYear} vs.\nB${prevYear}(B0)`,
            headerClass: 'header-diff-b0',
            children: [
                {
                    headerName: 'HC',
                    field: 'diffHcB0',
                    width: 80,
                    type: 'numericColumn',
                    valueFormatter: params => formatDiffValue(params.value),
                    cellClass: params => getDiffCellClass(params.value)
                },
                {
                    headerName: 'PE',
                    field: 'diffPeB0',
                    width: 100,
                    type: 'numericColumn',
                    valueFormatter: params => formatDiffPEValue(params.value),
                    cellClass: params => getDiffCellClass(params.value)
                }
            ]
        },

        // Diff B2026 vs LE2025 Group
        {
            headerName: `Diff\nB${budgetYear} vs.\nLE${prevYear}`,
            headerClass: 'header-diff-le',
            children: [
                {
                    headerName: 'HC',
                    field: 'diffHcLE',
                    width: 80,
                    type: 'numericColumn',
                    valueFormatter: params => formatDiffValue(params.value),
                    cellClass: params => getDiffCellClass(params.value)
                },
                {
                    headerName: 'PE',
                    field: 'diffPeLE',
                    width: 100,
                    type: 'numericColumn',
                    valueFormatter: params => formatDiffPEValue(params.value),
                    cellClass: 'text-end diff-pe-le-cell'
                }
            ]
        },

        // % Diff Group
        {
            headerName: '% Diff',
            headerClass: 'header-pct-diff',
            children: [
                {
                    headerName: `B${budgetYear} vs.\nB${prevYear}`,
                    headerTooltip: 'PE%',
                    field: 'pctDiffPeB0',
                    width: 90,
                    type: 'numericColumn',
                    valueFormatter: params => formatPercentValue(params.value),
                    cellClass: params => getPercentCellClass(params.value)
                },
                {
                    headerName: `B${budgetYear} vs.\nLE${prevYear}`,
                    headerTooltip: 'PE%',
                    field: 'pctDiffPeLE',
                    width: 90,
                    type: 'numericColumn',
                    valueFormatter: params => formatPercentValue(params.value),
                    cellClass: 'text-end pct-diff-le-cell'
                }
            ]
        }
    ];

    // Add A2022 columns only for BIG C
    if (isBigC) {
        // % Diff (B2026 vs A2022) Group
        columnDefs.push({
            headerName: `% Diff (B${budgetYear} VS A 2022)`,
            headerClass: 'header-diff-a2022',
            children: [
                {
                    headerName: `B${budgetYear}\nvs. A 2022`,
                    headerTooltip: 'HC Diff',
                    field: 'diffHcA2022',
                    width: 90,
                    type: 'numericColumn',
                    valueFormatter: params => formatDiffValue(params.value),
                    cellClass: params => getDiffCellClass(params.value)
                },
                {
                    headerName: `B${budgetYear}\nvs. A 2022`,
                    headerTooltip: 'PE Diff',
                    field: 'diffPeA2022',
                    width: 100,
                    type: 'numericColumn',
                    valueFormatter: params => formatDiffPEValue(params.value),
                    cellClass: params => getDiffCellClass(params.value)
                }
            ]
        });

        // Final % Diff Group
        columnDefs.push({
            headerName: '% Diff',
            headerClass: 'header-pct-diff-final',
            children: [
                {
                    headerName: 'HC',
                    field: 'pctDiffHcA2022',
                    width: 80,
                    type: 'numericColumn',
                    valueFormatter: params => formatPercentValue(params.value),
                    cellClass: params => getPercentCellClass(params.value)
                },
                {
                    headerName: 'PE',
                    field: 'pctDiffPeA2022',
                    width: 80,
                    type: 'numericColumn',
                    valueFormatter: params => formatPercentValue(params.value),
                    cellClass: 'text-end pct-diff-a2022-cell'
                }
            ]
        });
    }

    return columnDefs;
}

/**
 * Get column definitions for PE Per HC grid
 * @param {number} companyId - Company ID (1=BJC, 2=BIG C)
 * @param {number} budgetYear - Budget year (e.g., 2026)
 * @returns {Array} Column definitions
 */
function getPEPerHCGridColumnDefs(companyId, budgetYear) {
    const prevYear = budgetYear - 1; // e.g., 2025

    const columnDefs = [
        // Division Column - empty for summary row
        {
            headerName: 'Division',
            field: 'division',
            pinned: 'left',
            lockPinned: true,
            width: 200,
            cellStyle: params => {
                if (params.node.rowPinned === 'top') {
                    return { display: 'none' }; // Hide in pinned row
                }
                return { fontWeight: 'bold' };
            },
            valueFormatter: params => {
                if (params.node.rowPinned === 'top') return '';
                return params.value;
            }
        },

        // PE Budget 2026 Group - Summary goes here
        {
            headerName: `PE Budget ${budgetYear}`,
            headerClass: 'header-budget-2026',
            children: [
                {
                    headerName: 'HC',
                    field: 'hc2026',
                    width: 80,
                    type: 'numericColumn',
                    autoHeight: true,
                    wrapText: true,
                    cellStyle: params => {
                        if (params.node.rowPinned === 'top') {
                            return {
                                fontWeight: 'bold',
                                whiteSpace: 'pre-wrap',
                                lineHeight: '1.4',
                                color: '#c62828',
                                textAlign: 'left'
                            };
                        }
                        return { textAlign: 'right' };
                    },
                    colSpan: params => {
                        if (params.node.rowPinned === 'top') return 3; // Span across HC, Budget, PE per HC
                        return 1;
                    },
                    valueFormatter: params => {
                        if (params.node.rowPinned === 'top' && params.data?.isSummaryRow) {
                            const hc = formatNumberGrid(params.data.hc2026);
                            const pe = formatNumberGrid(params.data.peBudget2026);
                            const pePerHC = formatNumberGrid(Math.round(params.data.pePerHC2026));
                            return `PE Budget ${budgetYear}:\nTotal ${hc} HC (${pe} KTHB)\n(Yearly PE per HC = ${pePerHC} KTHB)`;
                        }
                        return formatNumberGrid(params.value);
                    }
                },
                {
                    headerName: 'Budget (KTHB)',
                    field: 'peBudget2026',
                    width: 130,
                    type: 'numericColumn',
                    valueFormatter: params => {
                        if (params.node.rowPinned === 'top') return '';
                        return formatPEValue(params.value);
                    },
                    cellClass: 'text-end'
                },
                {
                    headerName: 'PE per HC (KTHB)',
                    field: 'pePerHC2026',
                    width: 140,
                    type: 'numericColumn',
                    valueFormatter: params => {
                        if (params.node.rowPinned === 'top') return '';
                        return formatPEPerHCValue(params.value);
                    },
                    cellClass: 'text-end fw-bold'
                }
            ]
        },

        // PE Budget 2025 Group - Summary goes here
        {
            headerName: `PE Budget ${prevYear}`,
            headerClass: 'header-budget-2025',
            children: [
                {
                    headerName: 'HC',
                    field: 'hc2025',
                    width: 80,
                    type: 'numericColumn',
                    autoHeight: true,
                    wrapText: true,
                    cellStyle: params => {
                        if (params.node.rowPinned === 'top') {
                            return {
                                fontWeight: 'bold',
                                whiteSpace: 'pre-wrap',
                                lineHeight: '1.4',
                                color: '#1565c0',
                                textAlign: 'left'
                            };
                        }
                        return { textAlign: 'right' };
                    },
                    colSpan: params => {
                        if (params.node.rowPinned === 'top') return 3; // Span across HC, Budget, PE per HC
                        return 1;
                    },
                    valueFormatter: params => {
                        if (params.node.rowPinned === 'top' && params.data?.isSummaryRow) {
                            const hc = formatNumberGrid(params.data.hc2025);
                            const pe = formatNumberGrid(params.data.peBudget2025);
                            const pePerHC = formatNumberGrid(Math.round(params.data.pePerHC2025));
                            return `PE Budget ${prevYear}:\nTotal ${hc} HC (${pe} KTHB)\n(Yearly PE per HC = ${pePerHC} KTHB)`;
                        }
                        return formatNumberGrid(params.value);
                    }
                },
                {
                    headerName: 'Budget (KTHB)',
                    field: 'peBudget2025',
                    width: 130,
                    type: 'numericColumn',
                    valueFormatter: params => {
                        if (params.node.rowPinned === 'top') return '';
                        return formatPEValue(params.value);
                    },
                    cellClass: 'text-end'
                },
                {
                    headerName: 'PE per HC (KTHB)',
                    field: 'pePerHC2025',
                    width: 140,
                    type: 'numericColumn',
                    valueFormatter: params => {
                        if (params.node.rowPinned === 'top') return '';
                        return formatPEPerHCValue(params.value);
                    },
                    cellClass: 'text-end'
                }
            ]
        },

        // Change Group - empty for summary row
        {
            headerName: 'Change',
            headerClass: 'header-pct-diff',
            children: [
                {
                    headerName: 'PE/HC Diff',
                    field: 'pePerHCDiff',
                    width: 120,
                    type: 'numericColumn',
                    valueFormatter: params => {
                        if (params.node.rowPinned === 'top') return '';
                        return formatDiffPEValue(params.value);
                    },
                    cellClass: params => getDiffCellClass(params.value)
                },
                {
                    headerName: '% Change',
                    field: 'pePerHCPctChange',
                    width: 100,
                    type: 'numericColumn',
                    valueFormatter: params => {
                        if (params.node.rowPinned === 'top') return '';
                        return formatPercentValue(params.value);
                    },
                    cellClass: params => getPercentCellClass(params.value)
                }
            ]
        }
    ];

    return columnDefs;
}

/**
 * Process raw API data into PE Per HC grid format
 * @param {Array} rawData - Raw API data
 * @param {number} companyId - Company ID
 * @param {number} budgetYear - Budget year
 * @returns {Object} { gridData: Array, summaryData: Object } - Processed grid data and summary for pinned top row
 */
function processPEPerHCGridData(rawData, companyId, budgetYear) {
    if (!rawData || rawData.length === 0) return { gridData: [], summaryData: null };

    const config = GRID_VIEW_CONFIG['pe-per-hc'];

    // Aggregate by GROUPING_HEAD
    const aggregateMap = {};

    // Also calculate totals for summary row
    let totalHC2026 = 0;
    let totalPE2026 = 0;
    let totalHC2025 = 0;
    let totalPE2025 = 0;

    rawData.forEach(row => {
        // Get grouping key
        const key = row.GROUPING_HEAD || row.groupinG_HEAD || row.grouP_HEAD || 'Unknown';
        if (!key || key === 'Unknown' || key.trim() === '') return;

        // Get values for this row
        const hc2026 = getFieldVal(row, ['TOT_HC', 'toT_HC', 'tot_hc']);
        const pe2026 = Math.abs(getFieldVal(row, ['TOT_PE', 'toT_PE', 'tot_pe']));
        const hc2025 = getFieldVal(row, ['BUDGET_CURR_HC', 'budgeT_CURR_HC', 'budget_curr_hc']);
        const pe2025 = Math.abs(getFieldVal(row, ['BUDGET_CURR_PE', 'budgeT_CURR_PE', 'budget_curr_pe']));

        // Add to totals (for summary row - from ALL data)
        totalHC2026 += hc2026;
        totalPE2026 += pe2026;
        totalHC2025 += hc2025;
        totalPE2025 += pe2025;

        // Initialize aggregate
        if (!aggregateMap[key]) {
            aggregateMap[key] = {
                division: key,
                hc2026: 0,
                peBudget2026: 0,
                hc2025: 0,
                peBudget2025: 0
            };
        }

        // Aggregate values by division
        aggregateMap[key].hc2026 += hc2026;
        aggregateMap[key].peBudget2026 += pe2026;
        aggregateMap[key].hc2025 += hc2025;
        aggregateMap[key].peBudget2025 += pe2025;
    });

    // Calculate PE per HC and return as array
    const result = Object.values(aggregateMap).map(item => {
        // Calculate PE per HC
        const pePerHC2026 = item.hc2026 > 0 ? item.peBudget2026 / item.hc2026 : 0;
        const pePerHC2025 = item.hc2025 > 0 ? item.peBudget2025 / item.hc2025 : 0;

        // Calculate change
        const pePerHCDiff = pePerHC2026 - pePerHC2025;
        const pePerHCPctChange = pePerHC2025 > 0 ? ((pePerHC2026 - pePerHC2025) / pePerHC2025) * 100 : null;

        return {
            division: item.division,
            hc2026: item.hc2026,
            peBudget2026: item.peBudget2026,
            pePerHC2026: pePerHC2026,
            hc2025: item.hc2025,
            peBudget2025: item.peBudget2025,
            pePerHC2025: pePerHC2025,
            pePerHCDiff: pePerHCDiff,
            pePerHCPctChange: pePerHCPctChange
        };
    });

    // Sort by PE per HC 2026 descending and take top N
    const gridData = result
        .filter(d => d.pePerHC2026 > 0)
        .sort((a, b) => b.pePerHC2026 - a.pePerHC2026)
        .slice(0, config.maxItems);

    // Calculate summary (Yearly PE per HC from ALL data)
    const yearlyPEPerHC2026 = totalHC2026 > 0 ? totalPE2026 / totalHC2026 : 0;
    const yearlyPEPerHC2025 = totalHC2025 > 0 ? totalPE2025 / totalHC2025 : 0;
    const yearlyPEPerHCDiff = yearlyPEPerHC2026 - yearlyPEPerHC2025;
    const yearlyPEPerHCPctChange = yearlyPEPerHC2025 > 0 ? ((yearlyPEPerHC2026 - yearlyPEPerHC2025) / yearlyPEPerHC2025) * 100 : null;

    const summaryData = {
        division: `Total ${formatNumberGrid(totalHC2026)} HC (${formatNumberGrid(totalPE2026)} KTHB)\n(Yearly PE per HC = ${formatNumberGrid(Math.round(yearlyPEPerHC2026))} KTHB)`,
        hc2026: totalHC2026,
        peBudget2026: totalPE2026,
        pePerHC2026: yearlyPEPerHC2026,
        hc2025: totalHC2025,
        peBudget2025: totalPE2025,
        pePerHC2025: yearlyPEPerHC2025,
        pePerHCDiff: yearlyPEPerHCDiff,
        pePerHCPctChange: yearlyPEPerHCPctChange,
        isSummaryRow: true
    };

    console.log('PE Per HC Summary:', { totalHC2026, totalPE2026, yearlyPEPerHC2026, totalHC2025, totalPE2025, yearlyPEPerHC2025 });

    return { gridData, summaryData };
}

// ============================================================================
// Value Formatters
// ============================================================================

/**
 * Format number for grid display
 */
function formatNumberGrid(value) {
    if (value === null || value === undefined || isNaN(value)) return '-';
    return Math.round(value).toLocaleString('en-US');
}

/**
 * Format PE value (show negative in parentheses)
 */
function formatPEValue(value) {
    if (value === null || value === undefined || isNaN(value)) return '-';
    const absValue = Math.abs(Math.round(value)).toLocaleString('en-US');
    return value < 0 ? `(${absValue})` : absValue;
}

/**
 * Format PE per HC value (show 2 decimal places)
 */
function formatPEPerHCValue(value) {
    if (value === null || value === undefined || isNaN(value)) return '-';
    return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format diff value (positive/negative)
 */
function formatDiffValue(value) {
    if (value === null || value === undefined || isNaN(value)) return '-';
    const rounded = Math.round(value);
    if (rounded === 0) return '-';
    return rounded.toLocaleString('en-US');
}

/**
 * Format diff PE value
 */
function formatDiffPEValue(value) {
    if (value === null || value === undefined || isNaN(value)) return '-';
    const rounded = Math.round(value);
    if (rounded === 0) return '-';
    const absValue = Math.abs(rounded).toLocaleString('en-US');
    return rounded < 0 ? `(${absValue})` : absValue;
}

/**
 * Format percent value
 */
function formatPercentValue(value) {
    if (value === null || value === undefined || isNaN(value) || !isFinite(value)) return 'N/A';
    const formatted = value.toFixed(1);
    return `${formatted}%`;
}

/**
 * Get cell class based on diff value
 */
function getDiffCellClass(value) {
    if (value === null || value === undefined || isNaN(value) || value === 0) {
        return 'text-end text-muted';
    }
    return value > 0 ? 'text-end text-success' : 'text-end text-danger';
}

/**
 * Get cell class based on percent value
 */
function getPercentCellClass(value) {
    if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
        return 'text-end text-muted';
    }
    return value >= 0 ? 'text-end text-success' : 'text-end text-danger';
}

// ============================================================================
// Grid Options
// ============================================================================

/**
 * Get grid options for Diff PE grid
 * @param {Array} rowData - Row data
 * @param {number} companyId - Company ID
 * @param {number} budgetYear - Budget year
 * @param {string} viewType - View type
 * @returns {Object} Grid options
 */
function getDiffPEGridOptions(rowData, companyId, budgetYear, viewType = 'top10-growth') {
    return {
        columnDefs: getDiffPEGridColumnDefs(companyId, budgetYear, viewType),
        rowData: rowData,
        defaultColDef: {
            sortable: true,
            resizable: true,
            filter: false,
            suppressHeaderMenuButton: true
        },
        headerHeight: 50,
        groupHeaderHeight: 35,
        rowHeight: 35,
        domLayout: 'normal',
        enableCellTextSelection: true,
        animateRows: true,
        suppressCellFocus: true,
        suppressRowClickSelection: true,
        // Horizontal scroll settings
        alwaysShowHorizontalScroll: true,
        suppressHorizontalScroll: false
    };
}

// ============================================================================
// Data Processing
// ============================================================================

/**
 * Process raw API data into grid format
 * @param {Array} rawData - Raw API data
 * @param {number} companyId - Company ID
 * @param {number} budgetYear - Budget year
 * @param {string} viewType - View type ('top10-growth', 'top5-bu', 'top5-bp')
 * @returns {Array} Processed grid data
 */
function processDiffPEGridData(rawData, companyId, budgetYear, viewType = 'top10-growth') {
    if (!rawData || rawData.length === 0) return [];

    const prevYear = budgetYear - 1;
    const config = GRID_VIEW_CONFIG[viewType];

    // Debug: Log first row to see available fields
    if (rawData.length > 0) {
        console.log('📊 Grid Raw Data Sample - First row keys:', Object.keys(rawData[0]));
        console.log('📊 Grid Raw Data Sample - First row:', rawData[0]);
        console.log('📊 Grid View Type:', viewType, 'Filter By:', config.filterBy);
        // Check for A2022 fields
        const a2022Fields = Object.keys(rawData[0]).filter(k => k.toLowerCase().includes('2022'));
        console.log('📊 A2022 related fields:', a2022Fields);
    }

    // Filter by GROUP_TYPE if needed (for BU/BP views)
    let filteredData = rawData;
    if (config.filterBy) {
        filteredData = rawData.filter(row => {
            const groupType = row.GROUP_TYPE || row.grouP_TYPE || row.group_type || '';
            return groupType.toLowerCase().includes(config.filterBy.toLowerCase());
        });
        console.log(`📊 Grid - Filtered to ${filteredData.length} rows for GROUP_TYPE: ${config.filterBy}`);
    }

    // Aggregate by GROUPING_HEAD
    const aggregateMap = {};

    filteredData.forEach(row => {
        // Get grouping key
        const key = row.GROUPING_HEAD || row.groupinG_HEAD || row.grouP_HEAD || 'Unknown';
        if (!key || key === 'Unknown' || key.trim() === '') return;

        // Initialize aggregate
        if (!aggregateMap[key]) {
            aggregateMap[key] = {
                division: key,
                hcBudget2025: 0,
                peBudget2025: 0,
                hcLE2025: 0,
                peLE2025: 0,
                hcBudget2026: 0,
                peBudget2026: 0,
                hcActual2022: 0,
                peActual2022: 0
            };
        }

        // Aggregate values using helper function
        aggregateMap[key].hcBudget2025 += getFieldVal(row, ['BUDGET_CURR_HC', 'budgeT_CURR_HC', 'budget_curr_hc']);
        aggregateMap[key].peBudget2025 += getFieldVal(row, ['BUDGET_CURR_PE', 'budgeT_CURR_PE', 'budget_curr_pe']);
        aggregateMap[key].hcLE2025 += getFieldVal(row, ['TOT_HC_LE', 'toT_HC_LE', 'tot_hc_le']);
        aggregateMap[key].peLE2025 += getFieldVal(row, ['TOT_PE_OTOTH_LE', 'toT_PE_OTOTH_LE', 'TOT_PE_OTEB_LE', 'toT_PE_OTEB_LE']);
        aggregateMap[key].hcBudget2026 += getFieldVal(row, ['TOT_HC', 'toT_HC', 'tot_hc']);
        aggregateMap[key].peBudget2026 += getFieldVal(row, ['TOT_PE', 'toT_PE', 'tot_pe']);
        // A2022: HC = ACTUAL_HC_2022 (or FT + CT), PE = ACTUAL_PE_ABS_2022 or ACTUAL_PE_2022
        aggregateMap[key].hcActual2022 += getFieldVal(row, ['ACTUAL_HC_2022', 'actuaL_HC_2022', 'actual_hc_2022'])
            || (getFieldVal(row, ['ACTUAL_FT_2022', 'actuaL_FT_2022', 'actual_ft_2022']) + getFieldVal(row, ['ACTUAL_CT_2022', 'actuaL_CT_2022', 'actual_ct_2022']));
        aggregateMap[key].peActual2022 += getFieldVal(row, ['ACTUAL_PE_ABS_2022', 'actuaL_PE_ABS_2022', 'actual_pe_abs_2022', 'ACTUAL_PE_2022', 'actuaL_PE_2022', 'actual_pe_2022']);
    });

    // Debug: Log aggregated A2022 values
    console.log('📊 Aggregated A2022 values:', Object.entries(aggregateMap).slice(0, 3).map(([k, v]) => ({
        division: k,
        hcActual2022: v.hcActual2022,
        peActual2022: v.peActual2022
    })));

    // Calculate diffs and percentages
    const result = Object.values(aggregateMap).map(item => {
        // Make PE values negative (as shown in Excel)
        const peBudget2025 = -Math.abs(item.peBudget2025);
        const peLE2025 = -Math.abs(item.peLE2025);
        const peBudget2026 = -Math.abs(item.peBudget2026);
        const peActual2022 = Math.abs(item.peActual2022);

        // Calculate diffs
        const diffHcB0 = item.hcBudget2026 - item.hcBudget2025;
        const diffPeB0 = Math.abs(item.peBudget2026) - Math.abs(item.peBudget2025);
        const diffHcLE = item.hcBudget2026 - item.hcLE2025;
        const diffPeLE = Math.abs(item.peBudget2026) - Math.abs(item.peLE2025);

        // Calculate % diffs
        const pctDiffPeB0 = item.peBudget2025 !== 0
            ? (diffPeB0 / Math.abs(item.peBudget2025)) * 100
            : null;
        const pctDiffPeLE = item.peLE2025 !== 0
            ? (diffPeLE / Math.abs(item.peLE2025)) * 100
            : null;

        // A2022 diffs (only for BIG C)
        const diffHcA2022 = item.hcBudget2026 - item.hcActual2022;
        const diffPeA2022 = Math.abs(item.peBudget2026) - peActual2022;
        const pctDiffHcA2022 = item.hcActual2022 !== 0
            ? (diffHcA2022 / item.hcActual2022) * 100
            : null;
        const pctDiffPeA2022 = peActual2022 !== 0
            ? (diffPeA2022 / peActual2022) * 100
            : null;

        return {
            division: item.division,
            hcBudget2025: item.hcBudget2025,
            peBudget2025: peBudget2025,
            hcLE2025: item.hcLE2025,
            peLE2025: peLE2025,
            hcBudget2026: item.hcBudget2026,
            peBudget2026: peBudget2026,
            diffHcB0: diffHcB0,
            diffPeB0: diffPeB0,
            diffHcLE: diffHcLE,
            diffPeLE: diffPeLE,
            pctDiffPeB0: pctDiffPeB0,
            pctDiffPeLE: pctDiffPeLE,
            diffHcA2022: diffHcA2022,
            diffPeA2022: diffPeA2022,
            pctDiffHcA2022: pctDiffHcA2022,
            pctDiffPeA2022: pctDiffPeA2022,
            // For sorting
            sortValue: Math.abs(item.peBudget2026)
        };
    });

    // Sort by PE Budget 2026 (absolute) descending and take top N based on view type
    return result
        .filter(d => d.sortValue > 0)
        .sort((a, b) => b.sortValue - a.sortValue)
        .slice(0, config.maxItems);
}

/**
 * Helper function to get field value with case-insensitive lookup
 */
function getFieldVal(row, fieldNames) {
    for (const fieldName of fieldNames) {
        if (row[fieldName] !== undefined && row[fieldName] !== null) {
            return parseFloat(row[fieldName]) || 0;
        }
    }
    return 0;
}

// ============================================================================
// Main Grid Function
// ============================================================================

/**
 * Load and display Diff PE grid based on view type
 * @param {string} viewType - 'top10-growth', 'top5-bu', 'top5-bp', or 'pe-per-hc'
 */
async function loadDashboardCostCenterGrid(viewType = null) {
    try {
        // Use provided viewType or get from Block B dropdown
        if (!viewType) {
            const dropdown = document.getElementById('blockBViewType');
            viewType = dropdown?.value || 'top10-growth';
        }

        const companyId = parseInt(window.dashboardFilters?.companyId) || 2;
        const budgetYear = parseInt(window.dashboardFilters?.budgetYear) || new Date().getFullYear();
        const prevYear = budgetYear - 1;

        const config = GRID_VIEW_CONFIG[viewType];

        // Update title with dynamic years based on view type
        const titleEl = document.getElementById('diffPETableTitle');
        const subtitleEl = document.getElementById('diffPETableSubtitle');

        if (titleEl) {
            if (viewType === 'top10-growth') {
                titleEl.textContent = `Top 10 Diff PE B ${budgetYear} vs. LE ${prevYear} (Unit: KTHB)`;
            } else if (viewType === 'top5-bu') {
                titleEl.textContent = `Top 5 (Business Unit) Highest B ${budgetYear} (Unit: KTHB)`;
            } else if (viewType === 'top5-bp') {
                titleEl.textContent = `Top 5 (Business Partner) Highest B ${budgetYear} (Unit: KTHB)`;
            } else if (viewType === 'pe-per-hc') {
                titleEl.textContent = `Top 10 PE ${budgetYear} Per HC (Unit: KTHB)`;
            }
        }

        if (subtitleEl) {
            if (viewType === 'pe-per-hc') {
                subtitleEl.textContent = 'Top 10 divisions by PE per HC';
            } else {
                subtitleEl.textContent = `PE comparison by ${config.filterBy || 'division'}`;
            }
        }

        // Fetch raw data from API (reuse existing function or fetch directly)
        const rawData = await fetchDiffPEGridData();

        if (!rawData || rawData.length === 0) {
            console.warn('No data available for Diff PE grid');
            return;
        }

        // Process data with viewType
        let gridData;
        let columnDefs;
        let pinnedTopRowData = null;

        if (viewType === 'pe-per-hc') {
            const result = processPEPerHCGridData(rawData, companyId, budgetYear);
            gridData = result.gridData;
            pinnedTopRowData = result.summaryData ? [result.summaryData] : null;
            columnDefs = getPEPerHCGridColumnDefs(companyId, budgetYear);
        } else {
            gridData = processDiffPEGridData(rawData, companyId, budgetYear, viewType);
            columnDefs = getDiffPEGridColumnDefs(companyId, budgetYear, viewType);
        }

        console.log('Grid Data:', gridData);
        console.log('Pinned Top Row:', pinnedTopRowData);
        console.log('View Type:', viewType);

        // Initialize or update grid
        const gridDiv = document.getElementById('costCenterGrid');

        if (!gridDiv) {
            console.error('Grid container not found: costCenterGrid');
            return;
        }

        if (window.costCenterGrid) {
            // Destroy and recreate grid (column structure may change)
            window.costCenterGrid.destroy();
            window.costCenterGrid = null;
        }

        // Build grid options
        const gridOptions = {
            columnDefs: columnDefs,
            rowData: gridData,
            defaultColDef: {
                sortable: true,
                resizable: true,
                filter: false,
                suppressHeaderMenuButton: true
            },
            headerHeight: 50,
            groupHeaderHeight: 35,
            rowHeight: 35,
            domLayout: 'normal',
            enableCellTextSelection: true,
            animateRows: true,
            suppressCellFocus: true,
            suppressRowClickSelection: true,
            // Horizontal scroll settings
            alwaysShowHorizontalScroll: true,
            suppressHorizontalScroll: false
        };

        // Add pinned top row only for pe-per-hc view
        if (viewType === 'pe-per-hc' && pinnedTopRowData && pinnedTopRowData.length > 0) {
            gridOptions.pinnedTopRowData = pinnedTopRowData;
            gridOptions.getRowHeight = params => {
                if (params.node.rowPinned === 'top') {
                    return 80; // Taller height for summary row
                }
                return 35;
            };
            gridOptions.getRowStyle = params => {
                if (params.node.rowPinned === 'top') {
                    return { backgroundColor: '#fff3cd', fontWeight: 'bold' };
                }
                return null;
            };
            console.log('✅ Pinned top row configured for pe-per-hc view');
        }

        window.costCenterGrid = agGrid.createGrid(gridDiv, gridOptions);

    } catch (error) {
        console.error('Error loading Diff PE grid:', error);
    }
}

/**
 * Fetch data for Diff PE grid
 * Uses GetPEHeadCountByGrouping API
 */
async function fetchDiffPEGridData() {
    try {
        if (!window.dashboardFilters?.companyId || !window.dashboardFilters?.budgetYear) {
            console.warn('Company or Budget Year not selected');
            return null;
        }

        const requestBody = {
            companyId: parseInt(window.dashboardFilters.companyId),
            budgetYear: parseInt(window.dashboardFilters.budgetYear),
            cobuFormat: window.dashboardFilters.cobu || null,
            costCenterCode: window.dashboardFilters.costCenter || null
        };

        console.log('Fetching Diff PE Grid data with:', requestBody);

        const response = await fetch(DASHBOARD_API_BASE + 'Summary/GetPEHeadCountByGrouping', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received Diff PE Grid raw data:', data.length, 'rows');

        return data;

    } catch (error) {
        console.error('Error fetching Diff PE Grid data:', error);
        throw error;
    }
}

/**
 * Destroy grid instance
 */
function destroyDashboardGrid() {
    if (window.costCenterGrid) {
        window.costCenterGrid.destroy();
        window.costCenterGrid = null;
    }
}

// Export functions
window.loadDashboardCostCenterGrid = loadDashboardCostCenterGrid;
window.destroyDashboardGrid = destroyDashboardGrid;
