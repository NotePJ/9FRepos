/**
 * PE Budget Dashboard Charts
 * Chart rendering functions using Chart.js
 */

// Register Chart.js plugins
if (typeof ChartDataLabels !== 'undefined') {
    Chart.register(ChartDataLabels);
}

// ============================================================================
// Chart Rendering Functions
// ============================================================================

/**
 * Load PE by Department chart (Block B) - Horizontal Bar Chart
 * Used for BIG C (companyId = 2)
 */
async function loadDashboardDepartmentChart() {
    try {
        // Get current budget year from filters
        const budgetYear = window.dashboardFilters?.budgetYear || new Date().getFullYear();

        // Update card header with dynamic year
        document.getElementById('blockBChartTitle').textContent = `Top 10 Departments by PE Budget (B${budgetYear})`;
        document.getElementById('blockBChartSubtitle').textContent = 'Total PE distribution across top 10 departments';

        const data = await fetchDashboardPEByDepartment(window.dashboardFilters);

        console.log('Department Chart Data:', data);

        // Convert PE to absolute values and sort by highest PE (descending)
        const processedData = data.map(d => ({
            ...d,
            totalPE: Math.abs(d.totalPE || 0)
        })).sort((a, b) => b.totalPE - a.totalPE);

        // Take top 10 only
        const top10Data = processedData.slice(0, 10);

        // No need to reverse - display highest at top directly
        const reversedData = top10Data;

        // Set dynamic height based on number of departments
        const chartContainer = document.getElementById('departmentChart').parentElement;
        const chartHeight = Math.max(400, reversedData.length * 50); // 50px per department
        chartContainer.style.height = chartHeight + 'px';

        const ctx = document.getElementById('departmentChart').getContext('2d');

        // Destroy existing chart
        if (window.departmentChart) {
            window.departmentChart.destroy();
        }

        // Create new horizontal bar chart
        window.departmentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: reversedData.map(d => d.department),
                datasets: [{
                    label: 'Total PE',
                    data: reversedData.map(d => d.totalPE),
                    hcData: reversedData.map(d => d.totalHC), // Store HC data for labels
                    backgroundColor: reversedData.map((d, index) => {
                        // Gradient from light green to dark green (bottom to top)
                        const opacity = 0.5 + (index / reversedData.length) * 0.4;
                        return `rgba(46, 204, 113, ${opacity})`;
                    }),
                    borderColor: reversedData.map((d, index) => {
                        const opacity = 0.8 + (index / reversedData.length) * 0.2;
                        return `rgba(39, 174, 96, ${opacity})`;
                    }),
                    borderWidth: 2
                }]
            },
            options: {
                indexAxis: 'y', // Horizontal bar
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const pe = formatCurrencyStandard(context.parsed.x);
                                const hc = formatNumber(context.dataset.hcData[context.dataIndex]);
                                return `PE: ${pe} (HC: ${hc})`;
                            }
                        }
                    },
                    datalabels: {
                        display: false // Use custom plugin instead
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        display: true,
                        position: 'top', // Move axis to top
                        title: {
                            display: false // Hide title, will show in HTML instead
                        },
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            },
                            font: {
                                family: 'Google Sans'
                            },
                            color: function() {
                                const color = getComputedStyle(document.documentElement).getPropertyValue('--cui-body-color').trim();
                                return color || '#adb5bd';
                            }
                        },
                        grid: {
                            color: function() {
                                const color = getComputedStyle(document.documentElement).getPropertyValue('--cui-border-color').trim();
                                return color || 'rgba(255, 255, 255, 0.1)';
                            }
                        }
                    },
                    y: {
                        display: true,
                        position: 'left', // Y axis on left side
                        ticks: {
                            autoSkip: false,
                            font: {
                                size: 12,
                                family: 'Google Sans'
                            },
                            color: function() {
                                const color = getComputedStyle(document.documentElement).getPropertyValue('--cui-body-color').trim();
                                return color || '#adb5bd';
                            }
                        },
                        grid: {
                            color: function() {
                                const color = getComputedStyle(document.documentElement).getPropertyValue('--cui-border-color').trim();
                                return color || 'rgba(255, 255, 255, 0.1)';
                            }
                        }
                    }
                }
            },
            plugins: [{
                id: 'customBarLabels',
                afterDatasetsDraw: function(chart) {
                    const ctx = chart.ctx;
                    const meta = chart.getDatasetMeta(0);

                    if (!meta || !meta.data) return;

                    ctx.save();
                    ctx.font = 'bold 11px Google Sans, sans-serif';
                    ctx.textBaseline = 'middle';

                    meta.data.forEach((bar, index) => {
                        const dataset = chart.data.datasets[0];
                        const value = dataset.data[index];
                        const hc = dataset.hcData[index];

                        // 1. Draw PE value INSIDE the bar (right side)
                        ctx.fillStyle = '#333';
                        ctx.textAlign = 'right';
                        const peInsideX = bar.x - 5; // 5px padding from right edge of bar
                        const peInsideY = bar.y;
                        const peText = formatCurrencyStandard(value);
                        ctx.fillText(peText, peInsideX, peInsideY);

                        // 2. Draw HC value OUTSIDE the bar (right side)
                        ctx.fillStyle = '#666';
                        ctx.textAlign = 'left';
                        const hcOutsideX = bar.x + 5; // 5px after bar ends
                        const hcOutsideY = bar.y;
                        const hcText = `(HC: ${formatNumber(hc)})`;
                        ctx.fillText(hcText, hcOutsideX, hcOutsideY);
                    });

                    ctx.restore();
                }
            }]
        });
    } catch (error) {
        console.error('Error loading department chart:', error);
    }
}

/**
 * Load PE by COBU chart (Block B) - Horizontal Bar Chart
 * Used for BJC (companyId = 1)
 */
async function loadDashboardCobuChart() {
    try {
        // Get current budget year from filters
        const budgetYear = window.dashboardFilters?.budgetYear || new Date().getFullYear();

        // Update card header with dynamic year
        document.getElementById('blockBChartTitle').textContent = `Top 10 COBU by PE Budget (B${budgetYear})`;
        document.getElementById('blockBChartSubtitle').textContent = 'Total PE distribution across top 10 COBUs';

        const data = await fetchDashboardPEByCobu(window.dashboardFilters);

        console.log('COBU Chart Data:', data);

        // Convert PE to absolute values and sort by highest PE (descending)
        const processedData = data.map(d => ({
            ...d,
            totalPE: Math.abs(d.totalPE || 0)
        })).sort((a, b) => b.totalPE - a.totalPE);

        // Take top 10 only
        const top10Data = processedData.slice(0, 10);

        // No need to reverse - display highest at top directly
        const reversedData = top10Data;

        // Set dynamic height based on number of COBUs
        const chartContainer = document.getElementById('departmentChart').parentElement;
        const chartHeight = Math.max(400, reversedData.length * 50); // 50px per COBU
        chartContainer.style.height = chartHeight + 'px';

        const ctx = document.getElementById('departmentChart').getContext('2d');

        // Destroy existing chart
        if (window.departmentChart) {
            window.departmentChart.destroy();
        }

        // Create new horizontal bar chart
        window.departmentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: reversedData.map(d => d.cobu),
                datasets: [{
                    label: 'Total PE',
                    data: reversedData.map(d => d.totalPE),
                    hcData: reversedData.map(d => d.totalHC), // Store HC data for labels
                    backgroundColor: reversedData.map((d, index) => {
                        const opacity = 0.5 + (index / reversedData.length) * 0.4; // Gradient from 0.5 to 0.9
                        return `rgba(46, 204, 113, ${opacity})`;
                    }),
                    borderColor: reversedData.map((d, index) => {
                        const opacity = 0.8 + (index / reversedData.length) * 0.2; // Gradient from 0.8 to 1.0
                        return `rgba(39, 174, 96, ${opacity})`;
                    }),
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y', // Horizontal bar
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const pe = formatCurrencyStandard(context.parsed.x);
                                const hc = formatNumber(context.dataset.hcData[context.dataIndex]);
                                return `PE: ${pe} (HC: ${hc})`;
                            }
                        }
                    },
                    datalabels: {
                        display: false // Use custom plugin instead
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        display: true,
                        position: 'top', // Move axis to top
                        title: {
                            display: false // Hide title, will show in HTML instead
                        },
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            },
                            font: {
                                family: 'Google Sans'
                            },
                            color: function() {
                                const color = getComputedStyle(document.documentElement).getPropertyValue('--cui-body-color').trim();
                                return color || '#adb5bd';
                            }
                        },
                        grid: {
                            color: function() {
                                const color = getComputedStyle(document.documentElement).getPropertyValue('--cui-border-color').trim();
                                return color || 'rgba(255, 255, 255, 0.1)';
                            }
                        }
                    },
                    y: {
                        display: true,
                        position: 'left', // Y axis on left side
                        ticks: {
                            autoSkip: false,
                            font: {
                                size: 12,
                                family: 'Google Sans'
                            },
                            color: function() {
                                const color = getComputedStyle(document.documentElement).getPropertyValue('--cui-body-color').trim();
                                return color || '#adb5bd';
                            }
                        },
                        grid: {
                            color: function() {
                                const color = getComputedStyle(document.documentElement).getPropertyValue('--cui-border-color').trim();
                                return color || 'rgba(255, 255, 255, 0.1)';
                            }
                        }
                    }
                }
            },
            plugins: [{
                id: 'customBarLabels',
                afterDatasetsDraw: function(chart) {
                    const ctx = chart.ctx;
                    const meta = chart.getDatasetMeta(0);

                    if (!meta || !meta.data) return;

                    ctx.save();
                    ctx.font = 'bold 11px Google Sans, sans-serif';
                    ctx.textBaseline = 'middle';

                    meta.data.forEach((bar, index) => {
                        const dataset = chart.data.datasets[0];
                        const value = dataset.data[index];
                        const hc = dataset.hcData[index];

                        // 1. Draw PE value INSIDE the bar (right side)
                        ctx.fillStyle = '#333';
                        ctx.textAlign = 'right';
                        const peInsideX = bar.x - 5; // 5px padding from right edge of bar
                        const peInsideY = bar.y;
                        const peText = formatCurrencyStandard(value);
                        ctx.fillText(peText, peInsideX, peInsideY);

                        // 2. Draw HC value OUTSIDE the bar (right side)
                        ctx.fillStyle = '#666';
                        ctx.textAlign = 'left';
                        const hcOutsideX = bar.x + 5; // 5px after bar ends
                        const hcOutsideY = bar.y;
                        const hcText = `(HC: ${formatNumber(hc)})`;
                        ctx.fillText(hcText, hcOutsideX, hcOutsideY);
                    });

                    ctx.restore();
                }
            }]
        });
    } catch (error) {
        console.error('Error loading COBU chart:', error);
    }
}

/**
 * Load HC Composition chart (Block C)
 * Now delegates to HC Proportion Chart module for multiple view types
 */
async function loadDashboardHCCompositionChart(hcData) {
    try {
        // Check if HC Proportion module is loaded
        if (typeof loadDashboardHCProportionChart === 'function') {
            // Get current view type
            const viewType = window.hcProportionConfig?.viewType || 'ft-ct';

            // Update year label
            if (hcData?.currentYear) {
                document.getElementById('hcCompYearLabel').textContent = `B${hcData.currentYear}`;
            }

            // For FT vs CT view, pass KPI data directly
            if (viewType === 'ft-ct') {
                await loadDashboardHCProportionChart(hcData);
            } else {
                // For other views, fetch grouping data
                await fetchHCProportionRawData();
                await loadDashboardHCProportionChart();
            }
        } else {
            // Fallback to original implementation if module not loaded
            await loadDashboardHCCompositionChart_Legacy(hcData);
        }
    } catch (error) {
        console.error('Error loading HC Composition chart:', error);
    }
}

/**
 * Legacy HC Composition chart (FT vs CT only)
 * Kept for backward compatibility
 */
async function loadDashboardHCCompositionChart_Legacy(hcData) {
    try {
        // Use data passed from KPI cards to avoid duplicate API call
        if (!hcData) {
            console.error('HC Composition data not provided');
            return;
        }

        console.log('HC Composition Data:', {
            fullTime: hcData.ftCurr,
            contract: hcData.ctCurr,
            total: hcData.hcCurr
        });

        const ctx = document.getElementById('hcCompositionChart').getContext('2d');

        // Destroy existing chart
        if (window.hcCompositionChart) {
            window.hcCompositionChart.destroy();
        }

        const ftHC = hcData.ftCurr || 0;
        const ctHC = hcData.ctCurr || 0;
        const totalHC = hcData.hcCurr || 0;

        // Determine labels based on company
        const companyId = parseInt(window.dashboardFilters?.companyId);
        let label1 = 'Full-time';
        let label2 = 'Contract';  // Default for BIG C (companyId = 2)

        if (companyId === 1) {
            // BJC: Change to Temp
            label2 = 'Temp';
        }

        // Update year label
        document.getElementById('hcCompYearLabel').textContent = `B${hcData.currentYear}`;

        // Create new donut chart
        window.hcCompositionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [label1, label2],
                datasets: [{
                    label: 'HC',
                    data: [ftHC, ctHC],
                    backgroundColor: [
                        '#4a8463', // Green for Full-time
                        '#93D600'  // Yellow for Contract/Temp
                    ],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            font: {
                                family: 'Google Sans'
                            },
                            color: function() {
                                const color = getComputedStyle(document.documentElement).getPropertyValue('--cui-body-color').trim();
                                return color || '#adb5bd';
                            },
                            generateLabels: function(chart) {
                                const data = chart.data;
                                if (data.labels.length && data.datasets.length) {
                                    return data.labels.map((label, i) => {
                                        const value = data.datasets[0].data[i];
                                        const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                                        return {
                                            text: `${label}: ${formatNumber(value)} (${percentage}%)`,
                                            fillStyle: data.datasets[0].backgroundColor[i],
                                            hidden: false,
                                            index: i
                                        };
                                    });
                                }
                                return [];
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = formatNumber(context.parsed);
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : '0.0';
                                return `${label}: ${value} HC (${percentage}%)`;
                            }
                        }
                    },
                    datalabels: {
                        formatter: function(value, context) {
                            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return percentage + '%';
                        },
                        color: '#fff',
                        font: {
                            family: 'Google Sans',
                            weight: 'bold',
                            size: 16
                        }
                    }
                }
            },
            plugins: [
                // Center text plugin
                {
                    id: 'centerText',
                    beforeDraw: function(chart) {
                        const ctx = chart.ctx;
                        const width = chart.width;
                        const height = chart.height;
                        const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);

                        // Get color from CSS variable for dark theme support
                        let textColor = getComputedStyle(document.documentElement).getPropertyValue('--cui-body-color').trim();
                        if (!textColor) {
                            textColor = '#adb5bd';
                        }

                        ctx.restore();
                        ctx.font = 'bold 16px Google Sans, sans-serif';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = textColor;

                        const text1 = 'Total HC';
                        const text2 = formatNumber(total);

                        const text1X = Math.round((width - ctx.measureText(text1).width) / 2);
                        const text1Y = height / 2 - 10;

                        ctx.fillText(text1, text1X, text1Y);

                        ctx.font = 'bold 20px Google Sans, sans-serif';
                        ctx.fillStyle = textColor;
                        const text2X = Math.round((width - ctx.measureText(text2).width) / 2);
                        const text2Y = height / 2 + 15;

                        ctx.fillText(text2, text2X, text2Y);
                        ctx.save();
                    }
                }
            ]
        });
    } catch (error) {
        console.error('Error loading HC Composition chart:', error);
    }
}

/**
 * Destroy all charts
 */
function destroyDashboardCharts() {
    if (window.departmentChart) {
        window.departmentChart.destroy();
        window.departmentChart = null;
    }
    if (window.hcCompositionChart) {
        window.hcCompositionChart.destroy();
        window.hcCompositionChart = null;
    }
}
