/**
 * PE Budget Dashboard - HC Proportion Chart (Block C)
 * Handles HC Proportion visualization with multiple view types
 * ✅ View Types: FT vs CT, Business Unit, Business Partner, Inter & Secondment
 * ✅ Uses data from GetPEHeadCountByGrouping API
 * ✅ Supports Include/Exclude Area Store filter
 * ✅ Theme-aware colors
 */

// ============================================================================
// Global Variables
// ============================================================================

let hcProportionChart = null;
let hcProportionData = null;
let hcProportionConfig = {
  viewType: 'ft-ct', // Default view: FT vs CT
  includeAreaStore: true
};

// Color palettes for different view types
const HC_PROPORTION_COLORS = {
  // FT vs CT (2 colors)
  'ft-ct': ['#4a8463', '#93D600'],

  // Business Unit (15+ colors)
  'business-unit': [
    '#8B4513', // Brown - Property Development
    '#FFD700', // Gold - BCM
    '#2ECC71', // Green - E-Commerce
    '#3498DB', // Blue - AB
    '#9B59B6', // Purple - Hyper & Market & Pure Format
    '#E67E22', // Orange - Donjai
    '#1ABC9C', // Teal - OSX
    '#34495E', // Dark Gray - Csmart
    '#E74C3C', // Red - B2B and Depot
    '#F39C12', // Yellow - Food Service
    '#D35400', // Dark Orange - Coffee
    '#27AE60', // Dark Green - Big Smart
    '#2980B9', // Dark Blue
    '#8E44AD', // Dark Purple
    '#16A085', // Dark Teal
    '#C0392B', // Dark Red
    '#7F8C8D', // Gray
    '#95A5A6'  // Light Gray
  ],

  // Business Partner (20+ colors)
  'business-partner': [
    '#E67E22', // Orange - Commercial and Merchandising
    '#3498DB', // Blue - Digital Transformation
    '#2ECC71', // Green - Finance and Accounting
    '#9B59B6', // Purple - Supply Chain & Logistics
    '#1ABC9C', // Teal - Total GHR
    '#E74C3C', // Red - Loss Prevention & QA
    '#F39C12', // Yellow - SRD
    '#34495E', // Dark Gray - Marketing & Communication
    '#27AE60', // Dark Green - Global Sourcing
    '#2980B9', // Dark Blue - Strategic Customer Insight
    '#8E44AD', // Dark Purple - Transformation
    '#D35400', // Dark Orange - Advisor and Executive
    '#16A085', // Dark Teal - Store standard
    '#C0392B', // Dark Red - Co-operative
    '#7F8C8D', // Gray
    '#95A5A6', // Light Gray
    '#BDC3C7', // Silver
    '#ECF0F1', // Light
    '#1F618D', // Navy
    '#117A65'  // Forest
  ],

  // Inter & Secondment (4 colors)
  'inter-secondment': [
    '#3498DB', // Blue - Laos Secondment
    '#F1C40F', // Yellow - Cambodia Secondment
    '#95A5A6', // Gray - MMVN
    '#E67E22'  // Orange - Big C HK (Secondment)
  ]
};

// ============================================================================
// Main Functions
// ============================================================================

/**
 * Load and render HC Proportion Chart
 * Called when view type changes or data needs refresh
 * @param {Object} kpiData - Optional KPI data for FT vs CT view
 */
async function loadDashboardHCProportionChart(kpiData = null) {
  try {
    showHCProportionLoading(true);

    const viewType = hcProportionConfig.viewType;
    console.log('Loading HC Proportion Chart with view type:', viewType);

    if (viewType === 'ft-ct') {
      // Use existing KPI data for FT vs CT
      if (kpiData) {
        renderHCProportionChart_FTCT(kpiData);
      } else {
        // Fetch KPI data if not provided
        const data = await fetchDashboardPEBonusData(window.dashboardFilters);
        renderHCProportionChart_FTCT(data);
      }
    } else {
      // Fetch grouping data for other view types
      const data = await fetchDashboardTrendData(window.dashboardFilters);
      hcProportionData = data;

      if (viewType === 'business-unit') {
        renderHCProportionChart_BusinessUnit(data);
      } else if (viewType === 'business-partner') {
        renderHCProportionChart_BusinessPartner(data);
      } else if (viewType === 'inter-secondment') {
        renderHCProportionChart_InterSecondment(data);
      }
    }

    console.log('HC Proportion Chart loaded successfully');

  } catch (error) {
    console.error('Error loading HC Proportion Chart:', error);
    showDashboardError('Failed to load HC Proportion Chart');
  } finally {
    showHCProportionLoading(false);
  }
}

// ============================================================================
// Render Functions for Each View Type
// ============================================================================

/**
 * Render FT vs CT view (original HC Composition)
 * @param {Object} hcData - KPI data containing ftCurr, ctCurr
 */
function renderHCProportionChart_FTCT(hcData) {
  if (!hcData) {
    console.error('HC data not provided for FT vs CT view');
    return;
  }

  const ftHC = hcData.ftCurr || 0;
  const ctHC = hcData.ctCurr || 0;
  const totalHC = ftHC + ctHC;

  // Determine labels based on company
  const companyId = parseInt(window.dashboardFilters?.companyId);
  const label1 = 'Full-time';
  const label2 = companyId === 1 ? 'Temp' : 'Contract';

  const chartData = {
    labels: [label1, label2],
    values: [ftHC, ctHC],
    colors: HC_PROPORTION_COLORS['ft-ct'],
    totalHC: totalHC
  };

  renderHCProportionDonutChart(chartData);
}

/**
 * Render Business Unit view
 * Aggregates data by GROUPING_HEAD where GROUP_TYPE = 'Business Unit'
 * @param {Object} rawData - Raw API data
 */
function renderHCProportionChart_BusinessUnit(rawData) {
  const aggregated = aggregateHCByGrouping(rawData, 'Business Unit', 'GROUPING_HEAD');

  const chartData = {
    labels: aggregated.map(d => d.label),
    values: aggregated.map(d => d.value),
    colors: HC_PROPORTION_COLORS['business-unit'].slice(0, aggregated.length),
    totalHC: aggregated.reduce((sum, d) => sum + d.value, 0)
  };

  renderHCProportionDonutChart(chartData);
}

/**
 * Render Business Partner view
 * Aggregates data by GROUPING_HEAD where GROUP_TYPE = 'Business Partner'
 * @param {Object} rawData - Raw API data
 */
function renderHCProportionChart_BusinessPartner(rawData) {
  const aggregated = aggregateHCByGrouping(rawData, 'Business Partner', 'GROUPING_HEAD');

  const chartData = {
    labels: aggregated.map(d => d.label),
    values: aggregated.map(d => d.value),
    colors: HC_PROPORTION_COLORS['business-partner'].slice(0, aggregated.length),
    totalHC: aggregated.reduce((sum, d) => sum + d.value, 0)
  };

  renderHCProportionDonutChart(chartData);
}

/**
 * Render Inter & Secondment view
 * Filters data where GROUPING_HEAD contains 'Secondment' or specific patterns
 * @param {Object} rawData - Raw API data
 */
function renderHCProportionChart_InterSecondment(rawData) {
  const aggregated = aggregateHCByGrouping(rawData, null, 'GROUPING', 'secondment');

  const chartData = {
    labels: aggregated.map(d => d.label),
    values: aggregated.map(d => d.value),
    colors: HC_PROPORTION_COLORS['inter-secondment'].slice(0, aggregated.length),
    totalHC: aggregated.reduce((sum, d) => sum + d.value, 0)
  };

  renderHCProportionDonutChart(chartData);
}

// ============================================================================
// Chart Rendering
// ============================================================================

/**
 * Render Donut Chart with given data
 * Uses outside labels with leader lines instead of bottom legend
 * @param {Object} chartData - { labels, values, colors, totalHC }
 */
function renderHCProportionDonutChart(chartData) {
  const ctx = document.getElementById('hcCompositionChart');
  if (!ctx) {
    console.error('HC Composition chart canvas not found');
    return;
  }

  // Destroy existing chart
  if (hcProportionChart) {
    hcProportionChart.destroy();
    hcProportionChart = null;
  }

  // Also destroy the global reference if exists
  if (window.hcCompositionChart) {
    window.hcCompositionChart.destroy();
    window.hcCompositionChart = null;
  }

  // Get theme-aware text color
  const textColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--cui-body-color').trim() || '#333';

  // Calculate total for percentages
  const total = chartData.values.reduce((a, b) => a + b, 0);

  // Create chart with outside labels
  hcProportionChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: chartData.labels,
      datasets: [{
        data: chartData.values,
        backgroundColor: chartData.colors,
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 30,
          bottom: 30,
          left: 10,
          right: 10
        }
      },
      plugins: {
        legend: {
          display: false // Hide default legend - use outside labels instead
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || '';
              const value = formatNumber(context.parsed);
              const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : '0.0';
              return `${label}: ${value} HC (${percentage}%)`;
            }
          }
        },
        datalabels: {
          display: false // Disable default datalabels - use custom outside labels
        }
      }
    },
    plugins: [
      // Outside Labels with Leader Lines Plugin
      {
        id: 'outsideLabels',
        afterDraw: function (chart) {
          const ctx = chart.ctx;
          const chartArea = chart.chartArea;
          const meta = chart.getDatasetMeta(0);

          if (!meta || !meta.data || meta.data.length === 0) return;

          const centerX = (chartArea.left + chartArea.right) / 2;
          const centerY = (chartArea.top + chartArea.bottom) / 2;
          const outerRadius = meta.data[0].outerRadius;

          // Get theme-aware text color
          const labelColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--cui-body-color').trim() || '#333';

          ctx.save();
          ctx.font = '10px Google Sans, sans-serif';
          ctx.textBaseline = 'middle';

          const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
          const labelPositions = [];

          // Calculate label positions
          meta.data.forEach((arc, index) => {
            const data = chart.data.datasets[0].data[index];
            const percentage = (data / total) * 100;

            // Only show labels for segments > 1%
            if (percentage < 1) return;

            const startAngle = arc.startAngle;
            const endAngle = arc.endAngle;
            const midAngle = (startAngle + endAngle) / 2;

            // Calculate label position
            const labelRadius = outerRadius + 15;
            const labelX = centerX + Math.cos(midAngle) * labelRadius;
            const labelY = centerY + Math.sin(midAngle) * labelRadius;

            // Determine text alignment based on position
            const isRightSide = midAngle > -Math.PI / 2 && midAngle < Math.PI / 2;

            labelPositions.push({
              index,
              x: labelX,
              y: labelY,
              midAngle,
              isRightSide,
              percentage,
              label: chart.data.labels[index],
              color: chart.data.datasets[0].backgroundColor[index]
            });
          });

          // Sort by Y position to avoid overlaps
          labelPositions.sort((a, b) => a.y - b.y);

          // Adjust positions to avoid overlaps
          const minSpacing = 12;
          for (let i = 1; i < labelPositions.length; i++) {
            const prev = labelPositions[i - 1];
            const curr = labelPositions[i];
            if (curr.y - prev.y < minSpacing) {
              curr.y = prev.y + minSpacing;
            }
          }

          // Draw labels and leader lines
          labelPositions.forEach(pos => {
            const { x, y, midAngle, isRightSide, percentage, label, color, index } = pos;

            // Draw leader line
            const lineStartRadius = outerRadius + 2;
            const lineStartX = centerX + Math.cos(midAngle) * lineStartRadius;
            const lineStartY = centerY + Math.sin(midAngle) * lineStartRadius;

            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.moveTo(lineStartX, lineStartY);
            ctx.lineTo(x, y);

            // Extend line horizontally
            const extendX = isRightSide ? x + 8 : x - 8;
            ctx.lineTo(extendX, y);
            ctx.stroke();

            // Draw color dot
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.arc(isRightSide ? extendX + 4 : extendX - 4, y, 3, 0, Math.PI * 2);
            ctx.fill();

            // Draw label text
            ctx.fillStyle = labelColor;
            ctx.textAlign = isRightSide ? 'left' : 'right';

            // Truncate label if too long
            let displayLabel = label;
            if (displayLabel.length > 15) {
              displayLabel = displayLabel.substring(0, 13) + '...';
            }

            const labelText = `${displayLabel}: ${percentage.toFixed(1)}%`;
            const textX = isRightSide ? extendX + 10 : extendX - 10;
            ctx.fillText(labelText, textX, y);
          });

          ctx.restore();
        }
      },
      // Center text plugin
      {
        id: 'centerText',
        beforeDraw: function (chart) {
          const ctx = chart.ctx;
          const chartArea = chart.chartArea;
          const centerX = (chartArea.left + chartArea.right) / 2;
          const centerY = (chartArea.top + chartArea.bottom) / 2;
          const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);

          // Get theme-aware text color
          let textColorInner = getComputedStyle(document.documentElement)
            .getPropertyValue('--cui-body-color').trim() || '#333';

          ctx.save();
          ctx.font = 'bold 11px Google Sans, sans-serif';
          ctx.textBaseline = 'middle';
          ctx.textAlign = 'center';
          ctx.fillStyle = textColorInner;

          ctx.fillText('Total HC', centerX, centerY - 8);

          ctx.font = 'bold 14px Google Sans, sans-serif';
          ctx.fillText(formatNumber(total), centerX, centerY + 10);

          ctx.restore();
        }
      }
    ]
  });

  // Update global reference
  window.hcCompositionChart = hcProportionChart;
}

// ============================================================================
// Data Aggregation Functions
// ============================================================================

/**
 * Aggregate HC data by grouping field
 * @param {Object} rawData - Raw API data (from GetPEHeadCountByGrouping via fetchDashboardTrendData)
 * @param {string|null} groupType - Filter by GROUP_TYPE (null for all)
 * @param {string} aggregateBy - Field to aggregate by (GROUPING_HEAD or GROUPING)
 * @param {string|null} specialFilter - Special filter ('secondment' for Inter & Secondment)
 * @returns {Array} Aggregated data sorted by value descending
 */
function aggregateHCByGrouping(rawData, groupType, aggregateBy, specialFilter = null) {
  // rawData comes from fetchDashboardTrendData which returns processed trend data
  // We need to re-fetch raw API data for grouping aggregation
  // For now, use the stored raw data from API

  console.log('Aggregating HC by grouping:', { groupType, aggregateBy, specialFilter });

  // Check if we have raw API data stored
  if (!window.hcProportionRawData || window.hcProportionRawData.length === 0) {
    console.warn('No raw data available for aggregation');
    return [];
  }

  const data = window.hcProportionRawData;
  const includeAreaStore = hcProportionConfig.includeAreaStore;

  // Filter data
  let filteredData = data;

  // Filter by Area Store if needed
  if (!includeAreaStore) {
    filteredData = filteredData.filter(row => {
      const groupTotal = (row.GROUP_TOTAL || row.grouP_TOTAL || '').toString().toLowerCase();
      return !groupTotal.includes('store area');
    });
  }

  // Filter by GROUP_TYPE if specified
  if (groupType) {
    filteredData = filteredData.filter(row => {
      const rowGroupType = (row.GROUP_TYPE || row.grouP_TYPE || '').toString();
      return rowGroupType === groupType;
    });
  }

  // Special filter for Inter & Secondment
  if (specialFilter === 'secondment') {
    filteredData = data.filter(row => {
      const groupingHead = (row.GROUPING_HEAD || row.groupinG_HEAD || '').toString().toLowerCase();
      const grouping = (row.GROUPING || row.grouping || '').toString().toLowerCase();
      return groupingHead.includes('secondment') ||
        groupingHead.includes('laos') ||
        groupingHead.includes('cambodia') ||
        grouping.includes('secondment') ||
        grouping.includes('mmvn') ||
        grouping.includes('big c hk');
    });
  }

  console.log(`Filtered data: ${filteredData.length} rows`);

  // Aggregate by specified field
  const aggregateMap = {};

  filteredData.forEach(row => {
    // Get the aggregation key based on aggregateBy parameter
    let key;
    if (aggregateBy === 'GROUPING_HEAD') {
      key = row.GROUPING_HEAD || row.groupinG_HEAD || 'Unknown';
    } else if (aggregateBy === 'GROUPING') {
      key = row.GROUPING || row.grouping || 'Unknown';
    } else {
      key = 'Unknown';
    }

    // Get HC value (use TOT_HC for Budget Year)
    const hc = parseFloat(row.TOT_HC || row.toT_HC || 0);

    if (!aggregateMap[key]) {
      aggregateMap[key] = 0;
    }
    aggregateMap[key] += hc;
  });

  // Convert to array and sort by value descending
  const result = Object.entries(aggregateMap)
    .map(([label, value]) => ({ label, value }))
    .filter(d => d.value > 0) // Remove zero values
    .sort((a, b) => b.value - a.value);

  console.log('Aggregated result:', result);

  return result;
}

/**
 * Fetch raw grouping data from API
 * Stores in window.hcProportionRawData for aggregation
 */
async function fetchHCProportionRawData() {
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

    console.log('Fetching HC Proportion raw data with:', requestBody);

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
    console.log('Received HC Proportion raw data:', data.length, 'rows');

    // Store raw data for aggregation
    window.hcProportionRawData = data;

    return data;

  } catch (error) {
    console.error('Error fetching HC Proportion raw data:', error);
    throw error;
  }
}

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Handle view type change
 * @param {string} viewType - Selected view type
 */
async function handleHCProportionViewTypeChange(viewType) {
  console.log('HC Proportion view type changed to:', viewType);
  hcProportionConfig.viewType = viewType;

  // For non-FT-CT views, ensure we have raw data
  if (viewType !== 'ft-ct' && (!window.hcProportionRawData || window.hcProportionRawData.length === 0)) {
    await fetchHCProportionRawData();
  }

  // Reload chart with new view type
  await loadDashboardHCProportionChart();
}

/**
 * Setup event listeners for HC Proportion chart
 */
function setupHCProportionChartEvents() {
  const viewTypeSelect = document.getElementById('hcProportionViewType');
  if (viewTypeSelect) {
    viewTypeSelect.addEventListener('change', function () {
      handleHCProportionViewTypeChange(this.value);
    });
  }

  console.log('HC Proportion chart events initialized');
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Show/hide loading indicator
 * @param {boolean} show - True to show, false to hide
 */
function showHCProportionLoading(show) {
  const loading = document.getElementById('hcProportionLoading');
  if (loading) {
    if (show) {
      loading.classList.remove('d-none');
    } else {
      loading.classList.add('d-none');
    }
  }
}

/**
 * Reset HC Proportion chart to default state
 */
function resetHCProportionChart() {
  hcProportionConfig.viewType = 'ft-ct';
  const viewTypeSelect = document.getElementById('hcProportionViewType');
  if (viewTypeSelect) {
    viewTypeSelect.value = 'ft-ct';
  }
  window.hcProportionRawData = null;
}

/**
 * Destroy HC Proportion chart
 */
function destroyHCProportionChart() {
  if (hcProportionChart) {
    hcProportionChart.destroy();
    hcProportionChart = null;
  }
  window.hcProportionRawData = null;
}

// ============================================================================
// Integration with Include Area Store Toggle
// ============================================================================

/**
 * Update Include Area Store setting and refresh chart
 * @param {boolean} include - Whether to include Area Store
 */
async function updateHCProportionAreaStoreFilter(include) {
  hcProportionConfig.includeAreaStore = include;

  // Refresh chart if not in FT-CT mode
  if (hcProportionConfig.viewType !== 'ft-ct') {
    await loadDashboardHCProportionChart();
  }
}

// ============================================================================
// Export Functions
// ============================================================================

window.loadDashboardHCProportionChart = loadDashboardHCProportionChart;
window.renderHCProportionChart_FTCT = renderHCProportionChart_FTCT;
window.handleHCProportionViewTypeChange = handleHCProportionViewTypeChange;
window.setupHCProportionChartEvents = setupHCProportionChartEvents;
window.fetchHCProportionRawData = fetchHCProportionRawData;
window.resetHCProportionChart = resetHCProportionChart;
window.destroyHCProportionChart = destroyHCProportionChart;
window.updateHCProportionAreaStoreFilter = updateHCProportionAreaStoreFilter;
window.hcProportionConfig = hcProportionConfig;

console.log('PE Dashboard HC Proportion Chart module loaded successfully');
