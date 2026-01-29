/**
 * PE Growth Chart Module
 * Block B: Top 10 PE Growth / Top 5 BU / Top 5 BP
 * Vertical Bar Chart with Multi-color and Growth % labels
 */

// ============================================================================
// Configuration
// ============================================================================

const PE_GROWTH_CHART_CONFIG = {
    // Multi-color palette for bars (10 colors)
    colors: [
        '#3366CC',  // Blue
        '#808080',  // Gray
        '#FF9900',  // Orange
        '#2CA02C',  // Green
        '#17BECF',  // Cyan
        '#228B22',  // Forest Green
        '#9467BD',  // Purple
        '#1F3A5F',  // Navy
        '#FFCC00',  // Yellow
        '#FFB6C1'   // Light Pink
    ],
    // View type configurations
    viewTypes: {
        'top10-growth': { maxItems: 10, filterBy: null, title: 'Top 10 PE Growth', subtitle: 'Total PE distribution across top 10 divisions' },
        'top5-bu': { maxItems: 5, filterBy: 'Business Unit', title: 'Top 5 (Business Unit) Highest', subtitle: 'Top 5 Business Units by PE Budget' },
        'top5-bp': { maxItems: 5, filterBy: 'Business Partner', title: 'Top 5 (Business Partner) Highest', subtitle: 'Top 5 Business Partners by PE Budget' },
        'pe-per-hc': { maxItems: 10, filterBy: null, title: 'PE Per HC', subtitle: 'Top 10 divisions by PE per HC' }
    }
};

// Store current view type
let currentBlockBViewType = 'top10-growth';

// ============================================================================
// Main Chart Function
// ============================================================================

/**
 * Load PE Growth Chart (Block B) based on view type
 * @param {string} viewType - 'top10-growth', 'top5-bu', 'top5-bp', or 'pe-per-hc'
 */
async function loadDashboardPEGrowthChart(viewType = null) {
    try {
        // Use provided viewType or get from dropdown
        if (viewType) {
            currentBlockBViewType = viewType;
        } else {
            const dropdown = document.getElementById('blockBViewType');
            currentBlockBViewType = dropdown?.value || 'top10-growth';
        }

        const budgetYear = parseInt(window.dashboardFilters?.budgetYear) || new Date().getFullYear();
        const leYear = budgetYear - 1;
        const companyId = parseInt(window.dashboardFilters?.companyId) || 2;

        const config = PE_GROWTH_CHART_CONFIG.viewTypes[currentBlockBViewType];

        // Update card header with dynamic years
        let chartTitle = '';
        let chartSubtitle = config.subtitle;

        if (currentBlockBViewType === 'top10-growth') {
            chartTitle = `Top 10 PE Growth B${budgetYear} vs. LE${leYear} (Unit: KTHB)`;
        } else if (currentBlockBViewType === 'top5-bu') {
            chartTitle = `Top 5 (Business Unit) Highest B ${budgetYear} (Unit: KTHB)`;
        } else if (currentBlockBViewType === 'top5-bp') {
            chartTitle = `Top 5 (Business Partner) Highest B ${budgetYear} (Unit: KTHB)`;
        } else if (currentBlockBViewType === 'pe-per-hc') {
            chartTitle = `PE ${budgetYear} Per HC (Unit: KTHB)`;
        }

        document.getElementById('blockBChartTitle').textContent = chartTitle;
        document.getElementById('blockBChartSubtitle').textContent = chartSubtitle;

        // Hide the old axis title (not needed for this chart)
        const axisTitle = document.querySelector('.chart-axis-title');
        if (axisTitle) {
            axisTitle.style.display = 'none';
        }

        // Fetch raw data from API
        const rawData = await fetchPEGrowthData();

        if (!rawData || rawData.length === 0) {
            console.warn('No data available for PE Growth chart');
            renderEmptyPEGrowthChart();
            return;
        }

        // Process and aggregate data based on view type
        const processedData = processPEGrowthData(rawData, companyId, budgetYear, currentBlockBViewType);

        console.log('PE Growth Chart processed data:', processedData);

        // Render the chart based on view type
        if (currentBlockBViewType === 'pe-per-hc') {
            renderPEPerHCChart(processedData);
        } else {
            renderPEGrowthChart(processedData);
        }

        // Also update the Grid (Block E) to match
        if (typeof loadDashboardCostCenterGrid === 'function') {
            loadDashboardCostCenterGrid(currentBlockBViewType);
        }

    } catch (error) {
        console.error('Error loading PE Growth chart:', error);
        renderEmptyPEGrowthChart();
    }
}

/**
 * Fetch PE Growth data from API
 * @returns {Promise<Array>} Raw data from API
 */
async function fetchPEGrowthData() {
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

        console.log('Fetching PE Growth data with:', requestBody);

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
        console.log('Received PE Growth raw data:', data.length, 'rows');

        return data;

    } catch (error) {
        console.error('Error fetching PE Growth data:', error);
        throw error;
    }
}

/**
 * Process raw data into PE Growth chart format
 * @param {Array} rawData - Raw API data
 * @param {number} companyId - Company ID (1=BJC, 2=BIG C)
 * @param {number} budgetYear - Budget year
 * @param {string} viewType - 'top10-growth', 'top5-bu', 'top5-bp', or 'pe-per-hc'
 * @returns {Array} Processed data for chart
 */
function processPEGrowthData(rawData, companyId, budgetYear, viewType = 'top10-growth') {
    if (!rawData || rawData.length === 0) return [];

    const leYear = budgetYear - 1;
    const config = PE_GROWTH_CHART_CONFIG.viewTypes[viewType];

    // Debug: Log first row to see available fields
    if (rawData.length > 0) {
        console.log('PE Growth - Sample row:', rawData[0]);
        console.log('PE Growth - Available fields:', Object.keys(rawData[0]));
        console.log('PE Growth - View Type:', viewType, 'Filter By:', config.filterBy);
    }

    // Filter by GROUP_TYPE if needed (for BU/BP views)
    let filteredData = rawData;
    if (config.filterBy) {
        filteredData = rawData.filter(row => {
            const groupType = row.GROUP_TYPE || row.grouP_TYPE || row.group_type || '';
            return groupType.toLowerCase().includes(config.filterBy.toLowerCase());
        });
        console.log(`PE Growth - Filtered to ${filteredData.length} rows for GROUP_TYPE: ${config.filterBy}`);
    }

    // Aggregate data by GROUPING_HEAD
    const aggregateMap = {};

    filteredData.forEach(row => {
        // Get grouping key - try multiple case variations (match proportion-chart.js)
        const key = row.GROUPING_HEAD || row.groupinG_HEAD || row.grouP_HEAD ||
                    row.grouping_head || row.AdditionalData?.GROUPING_HEAD ||
                    'Unknown';

        // Skip if key is empty or invalid
        if (!key || key === 'Unknown' || key.trim() === '') return;

        // Get PE Budget Year (TOT_PE) - in thousands
        const peBudget = Math.abs(getFieldValueSafe(row, ['TOT_PE', 'tot_pe', 'toT_PE']));

        // Get PE LE Year (TOT_PE_OTOTH_LE or TOT_PE_OTEB_LE) - in thousands
        const peLE = Math.abs(getFieldValueSafe(row, [
            'TOT_PE_OTOTH_LE', 'tot_pe_ototh_le', 'toT_PE_OTOTH_LE',
            'TOT_PE_OTEB_LE', 'tot_pe_oteb_le', 'toT_PE_OTEB_LE'
        ]));

        // Get HC values for current budget year
        const hcBudget = getFieldValueSafe(row, ['TOT_HC', 'tot_hc', 'toT_HC']);
        const hcLE = getFieldValueSafe(row, ['TOT_HC_LE', 'tot_hc_le', 'toT_HC_LE']);

        // Get PE and HC values for current year (BUDGET_CURR_PE, BUDGET_CURR_HC)
        const peCurrYear = Math.abs(getFieldValueSafe(row, ['BUDGET_CURR_PE', 'budget_curr_pe', 'budgeT_CURR_PE']));
        const hcCurrYear = getFieldValueSafe(row, ['BUDGET_CURR_HC', 'budget_curr_hc', 'budgeT_CURR_HC']);

        if (!aggregateMap[key]) {
            aggregateMap[key] = {
                label: key,
                peBudget: 0,
                peLE: 0,
                hcBudget: 0,
                hcLE: 0,
                peCurrYear: 0,
                hcCurrYear: 0
            };
        }

        aggregateMap[key].peBudget += peBudget;
        aggregateMap[key].peLE += peLE;
        aggregateMap[key].hcBudget += hcBudget;
        aggregateMap[key].hcLE += hcLE;
        aggregateMap[key].peCurrYear += peCurrYear;
        aggregateMap[key].hcCurrYear += hcCurrYear;
    });

    console.log('PE Growth - Aggregated map:', aggregateMap);

    // Convert to array and calculate growth/PE per HC
    const result = Object.values(aggregateMap)
        .map(item => {
            // Calculate growth percentage
            const growthPercent = item.peLE > 0
                ? ((item.peBudget - item.peLE) / item.peLE) * 100
                : (item.peBudget > 0 ? 100 : 0);

            // Calculate PE per HC for Budget Year (TOT_PE / TOT_HC)
            const pePerHC = item.hcBudget > 0 ? item.peBudget / item.hcBudget : 0;

            // Calculate PE per HC for Current Year (BUDGET_CURR_PE / BUDGET_CURR_HC)
            const pePerHCCurrYear = item.hcCurrYear > 0 ? item.peCurrYear / item.hcCurrYear : 0;

            return {
                label: item.label,
                peBudget: item.peBudget,
                peLE: item.peLE,
                hcBudget: item.hcBudget,
                hcLE: item.hcLE,
                peCurrYear: item.peCurrYear,
                hcCurrYear: item.hcCurrYear,
                growthPercent: growthPercent,
                growthValue: item.peBudget - item.peLE,
                pePerHC: pePerHC,
                pePerHCCurrYear: pePerHCCurrYear
            };
        })
        .filter(d => d.peBudget > 0) // Filter out zero values
        .sort((a, b) => {
            // For pe-per-hc view, sort by PE per HC descending
            if (viewType === 'pe-per-hc') {
                return b.pePerHC - a.pePerHC;
            }
            // For other views, sort by PE Budget descending
            return b.peBudget - a.peBudget;
        })
        .slice(0, config.maxItems); // Take top N items based on view type

    console.log('PE Growth - Final result:', result);

    return result;
}

/**
 * Get current Block B view type
 * @returns {string} Current view type
 */
function getCurrentBlockBViewType() {
    return currentBlockBViewType;
}

/**
 * Safe field value getter with case-insensitive lookup
 * @param {Object} row - Data row
 * @param {Array<string>} fieldNames - Possible field names
 * @returns {number} Field value or 0
 */
function getFieldValueSafe(row, fieldNames) {
    for (const fieldName of fieldNames) {
        // Direct property
        if (row[fieldName] !== undefined && row[fieldName] !== null) {
            return parseFloat(row[fieldName]) || 0;
        }

        // AdditionalData
        if (row.AdditionalData?.[fieldName] !== undefined) {
            return parseFloat(row.AdditionalData[fieldName]) || 0;
        }

        // Case-insensitive search
        const rowKeys = Object.keys(row);
        const matchingKey = rowKeys.find(key => key.toLowerCase() === fieldName.toLowerCase());
        if (matchingKey && row[matchingKey] !== undefined) {
            return parseFloat(row[matchingKey]) || 0;
        }
    }
    return 0;
}

/**
 * Render PE Growth Chart
 * @param {Array} data - Processed chart data
 */
function renderPEGrowthChart(data) {
    const ctx = document.getElementById('departmentChart').getContext('2d');

    // Destroy existing chart
    if (window.departmentChart) {
        window.departmentChart.destroy();
    }

    // Set chart container height
    const chartContainer = document.getElementById('departmentChart').parentElement;
    chartContainer.style.height = '400px';

    // Create vertical bar chart
    window.departmentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.label),
            datasets: [{
                label: 'PE Budget',
                data: data.map(d => d.peBudget),
                growthData: data.map(d => d.growthPercent), // Store growth for labels
                hcData: data.map(d => d.hcBudget), // Store HC for tooltips
                backgroundColor: data.map((d, index) => PE_GROWTH_CHART_CONFIG.colors[index % PE_GROWTH_CHART_CONFIG.colors.length]),
                borderColor: data.map((d, index) => PE_GROWTH_CHART_CONFIG.colors[index % PE_GROWTH_CHART_CONFIG.colors.length]),
                borderWidth: 1,
                borderRadius: 4,
                barThickness: 50
            }]
        },
        options: {
            indexAxis: 'x', // Vertical bar
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 60 // Space for labels above bars
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const pe = formatNumberWithCommas(context.parsed.y);
                            const growth = context.dataset.growthData[context.dataIndex];
                            const hc = context.dataset.hcData[context.dataIndex];
                            return [
                                `PE: ฿${pe} KTHB`,
                                `Growth: ${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`,
                                `HC: ${formatNumberWithCommas(hc)}`
                            ];
                        }
                    }
                },
                datalabels: {
                    display: false // Use custom plugin instead
                }
            },
            scales: {
                x: {
                    display: true,
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        font: {
                            size: 10,
                            family: 'Google Sans'
                        },
                        color: function() {
                            const color = getComputedStyle(document.documentElement)
                                .getPropertyValue('--cui-body-color').trim();
                            return color || '#666';
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    display: true,
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatNumberWithCommas(value);
                        },
                        font: {
                            family: 'Google Sans'
                        },
                        color: function() {
                            const color = getComputedStyle(document.documentElement)
                                .getPropertyValue('--cui-body-color').trim();
                            return color || '#666';
                        }
                    },
                    grid: {
                        color: function() {
                            const color = getComputedStyle(document.documentElement)
                                .getPropertyValue('--cui-border-color').trim();
                            return color || 'rgba(0, 0, 0, 0.1)';
                        }
                    }
                }
            }
        },
        plugins: [{
            id: 'peGrowthLabels',
            afterDatasetsDraw: function(chart) {
                const ctx = chart.ctx;
                const meta = chart.getDatasetMeta(0);

                if (!meta || !meta.data) return;

                ctx.save();

                meta.data.forEach((bar, index) => {
                    const dataset = chart.data.datasets[0];
                    const value = dataset.data[index];
                    const growth = dataset.growthData[index];

                    const x = bar.x;
                    const y = bar.y - 10; // Position above bar

                    // Draw PE value
                    ctx.font = 'bold 11px Google Sans, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    ctx.fillStyle = '#333';
                    ctx.fillText(formatNumberWithCommas(Math.round(value)), x, y);

                    // Draw Growth % above value
                    const growthText = `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
                    ctx.font = 'bold 10px Google Sans, sans-serif';
                    ctx.fillStyle = growth >= 0 ? '#28a745' : '#dc3545'; // Green for positive, red for negative
                    ctx.fillText(growthText, x, y - 14);
                });

                ctx.restore();
            }
        }]
    });
}

/**
 * Render PE Per HC Chart (for pe-per-hc view type)
 * Shows PE per HC values instead of growth percentages
 * @param {Array} data - Processed chart data
 */
function renderPEPerHCChart(data) {
    const ctx = document.getElementById('departmentChart').getContext('2d');

    // Destroy existing chart
    if (window.departmentChart) {
        window.departmentChart.destroy();
    }

    // Set chart container height
    const chartContainer = document.getElementById('departmentChart').parentElement;
    chartContainer.style.height = '400px';

    // Create vertical bar chart
    window.departmentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.label),
            datasets: [{
                label: 'PE Per HC',
                data: data.map(d => d.pePerHC),
                pePerHCCurrYear: data.map(d => d.pePerHCCurrYear), // Store current year for tooltips
                hcData: data.map(d => d.hcBudget), // Store HC for tooltips
                peData: data.map(d => d.peBudget), // Store PE for tooltips
                backgroundColor: data.map((d, index) => PE_GROWTH_CHART_CONFIG.colors[index % PE_GROWTH_CHART_CONFIG.colors.length]),
                borderColor: data.map((d, index) => PE_GROWTH_CHART_CONFIG.colors[index % PE_GROWTH_CHART_CONFIG.colors.length]),
                borderWidth: 1,
                borderRadius: 4,
                barThickness: 50
            }]
        },
        options: {
            indexAxis: 'x', // Vertical bar
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 40 // Space for labels above bars
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const pePerHC = context.parsed.y.toFixed(2);
                            const pe = formatNumberWithCommas(context.dataset.peData[context.dataIndex]);
                            const hc = formatNumberWithCommas(context.dataset.hcData[context.dataIndex]);
                            const pePerHCCurrYear = context.dataset.pePerHCCurrYear[context.dataIndex].toFixed(2);
                            return [
                                `PE per HC (2026): ${formatNumberWithCommas(Math.round(context.parsed.y))} KTHB`,
                                `PE Budget: ฿${pe} KTHB`,
                                `HC: ${hc}`,
                                `PE per HC (2025): ${formatNumberWithCommas(Math.round(pePerHCCurrYear))} KTHB`
                            ];
                        }
                    }
                },
                datalabels: {
                    display: false // Use custom plugin instead
                }
            },
            scales: {
                x: {
                    display: true,
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        font: {
                            size: 10,
                            family: 'Google Sans'
                        },
                        color: function() {
                            const color = getComputedStyle(document.documentElement)
                                .getPropertyValue('--cui-body-color').trim();
                            return color || '#666';
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    display: true,
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatNumberWithCommas(value);
                        },
                        font: {
                            family: 'Google Sans'
                        },
                        color: function() {
                            const color = getComputedStyle(document.documentElement)
                                .getPropertyValue('--cui-body-color').trim();
                            return color || '#666';
                        }
                    },
                    grid: {
                        color: function() {
                            const color = getComputedStyle(document.documentElement)
                                .getPropertyValue('--cui-border-color').trim();
                            return color || 'rgba(0, 0, 0, 0.1)';
                        }
                    }
                }
            }
        },
        plugins: [{
            id: 'pePerHCLabels',
            afterDatasetsDraw: function(chart) {
                const ctx = chart.ctx;
                const meta = chart.getDatasetMeta(0);

                if (!meta || !meta.data) return;

                ctx.save();

                meta.data.forEach((bar, index) => {
                    const dataset = chart.data.datasets[0];
                    const value = dataset.data[index];

                    const x = bar.x;
                    const y = bar.y - 10; // Position above bar

                    // Draw PE per HC value
                    ctx.font = 'bold 11px Google Sans, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    ctx.fillStyle = '#333';
                    ctx.fillText(formatNumberWithCommas(Math.round(value)), x, y);
                });

                ctx.restore();
            }
        }]
    });
}

/**
 * Render empty chart when no data
 */
function renderEmptyPEGrowthChart() {
    const ctx = document.getElementById('departmentChart').getContext('2d');

    if (window.departmentChart) {
        window.departmentChart.destroy();
    }

    const chartContainer = document.getElementById('departmentChart').parentElement;
    chartContainer.style.height = '400px';

    window.departmentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['No Data'],
            datasets: [{
                data: [0],
                backgroundColor: '#e0e0e0'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                datalabels: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

/**
 * Helper function to format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumberWithCommas(num) {
    if (num === null || num === undefined) return '0';
    return Math.round(num).toLocaleString('en-US');
}

// ============================================================================
// Export functions for global access
// ============================================================================

window.loadDashboardPEGrowthChart = loadDashboardPEGrowthChart;
window.getCurrentBlockBViewType = getCurrentBlockBViewType;
window.PE_GROWTH_CHART_CONFIG = PE_GROWTH_CHART_CONFIG;
