/**
 * PE Budget Dashboard - Trend Chart (Block D)
 * Handles HC & PE trend visualization over historical years
 * ✅ BIG C (companyId = 2) Only
 * ✅ Toggle: HC vs PE
 * ✅ Toggle: Include/Exclude Area Store
 * ✅ Theme-aware colors
 * ✅ Responsive design
 */

// ============================================================================
// Global Variables
// ============================================================================

let trendChart = null;
let trendChartData = null;
let trendChartConfig = {
  showMode: 'hc',      // 'hc' = HC only, 'pe' = PE only
  includeAreaStore: true
};

// ============================================================================
// Chart Rendering Functions
// ============================================================================

/**
 * Load and render Trend Chart (Block D)
 * Called from main dashboard loading function
 */
async function loadDashboardTrendChart() {
  try {
    // Check if company is BIG C (companyId = 2)
    const companyId = parseInt(window.dashboardFilters?.companyId);
    if (companyId !== 2) {
      hideTrendChartBlock();
      console.log('Trend chart hidden - not BIG C company');
      return;
    }

    // Show Block D
    showTrendChartBlock();

    // Show loading indicator
    showTrendChartLoading(true);

    // Fetch trend data from PE HeadCount API
    const data = await fetchDashboardTrendData(window.dashboardFilters);

    if (!data || data.length === 0) {
      console.warn('No trend data available');
      showTrendChartLoading(false);
      return;
    }

    // Store data for toggling
    trendChartData = data;

    // Render chart based on current config
    renderTrendChart(data);

    console.log('Trend chart loaded successfully');

  } catch (error) {
    console.error('Error loading trend chart:', error);
    showDashboardError('Failed to load trend chart');
  } finally {
    showTrendChartLoading(false);
  }
}

/**
 * Render Trend Chart with Chart.js
 * @param {Object} data - Aggregated trend data
 */
function renderTrendChart(data) {
  const ctx = document.getElementById('trendChart');
  if (!ctx) {
    console.error('Trend chart canvas not found');
    return;
  }

  console.log('=== RENDER TREND CHART DEBUG ===');
  console.log('Data received:', data);
  console.log('HC Values:', data.hcValues);
  console.log('PE Values:', data.peValues);
  console.log('Current config:', trendChartConfig);

  // Destroy existing chart
  if (trendChart) {
    trendChart.destroy();
    trendChart = null;
  }

  // Determine display mode
  const showMode = trendChartConfig.showMode || 'hc';

  console.log(`Display mode: ${showMode}`);

  // Prepare chart data
  const labels = data.years;

  // Prepare bar colors based on year type (for HC)
  const hcBarColors = data.years.map((year, index) => {
    const yearType = data.yearTypes[index];
    if (yearType === 'actual') {
      return 'rgba(158, 158, 158, 0.8)'; // Grey for historical
    } else if (yearType === 'latest-actual') {
      return 'rgba(255, 140, 0, 0.8)'; // Orange for latest actual (2024)
    } else if (yearType === 'le') {
      return 'rgba(255, 235, 156, 0.8)'; // Light yellow for LE (2025)
    } else if (yearType === 'budget') {
      return 'rgba(255, 224, 102, 0.8)'; // Yellow for budget (2026)
    }
    return 'rgba(158, 158, 158, 0.8)';
  });

  const hcBorderColors = data.years.map((year, index) => {
    const yearType = data.yearTypes[index];
    if (yearType === 'actual') {
      return 'rgba(158, 158, 158, 1)';
    } else if (yearType === 'latest-actual') {
      return 'rgba(255, 140, 0, 1)'; // Orange border
    } else if (yearType === 'le') {
      return 'rgba(255, 235, 156, 1)';
    } else if (yearType === 'budget') {
      return 'rgba(255, 224, 102, 1)';
    }
    return 'rgba(158, 158, 158, 1)';
  });

  // PE bar colors (lighter/pastel versions)
  const peBarColors = data.years.map((year, index) => {
    const yearType = data.yearTypes[index];
    if (yearType === 'actual') {
      return 'rgba(100, 149, 237, 0.6)'; // Cornflower blue for historical
    } else if (yearType === 'latest-actual') {
      return 'rgba(30, 144, 255, 0.7)'; // Dodger blue for latest actual
    } else if (yearType === 'le') {
      return 'rgba(135, 206, 250, 0.7)'; // Light sky blue for LE
    } else if (yearType === 'budget') {
      return 'rgba(70, 130, 180, 0.7)'; // Steel blue for budget
    }
    return 'rgba(100, 149, 237, 0.6)';
  });

  const peBorderColors = data.years.map((year, index) => {
    const yearType = data.yearTypes[index];
    if (yearType === 'actual') {
      return 'rgba(100, 149, 237, 1)';
    } else if (yearType === 'latest-actual') {
      return 'rgba(30, 144, 255, 1)';
    } else if (yearType === 'le') {
      return 'rgba(135, 206, 250, 1)';
    } else if (yearType === 'budget') {
      return 'rgba(70, 130, 180, 1)';
    }
    return 'rgba(100, 149, 237, 1)';
  });

  // Get theme-aware text color
  const textColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--cui-body-color').trim() || '#333';

  const gridColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--cui-border-color').trim() || 'rgba(0, 0, 0, 0.1)';

  // Build datasets array
  const datasets = [];

  // Show HC dataset if mode is 'hc'
  if (showMode === 'hc') {
    datasets.push({
      label: 'Headcount (HC)',
      data: data.hcValues,
      backgroundColor: hcBarColors,
      borderColor: hcBorderColors,
      borderWidth: 2,
      yAxisID: 'y',
      order: 2,
      growthRates: data.hcGrowthRates,
      yearTypes: data.yearTypes,
      newHC: data.newHC,
      vacantHC: data.vacantHC,
      metricType: 'hc'
    });
  }

  // Show PE dataset if mode is 'pe'
  if (showMode === 'pe') {
    // Data is already in M THB (Million THB) from API - no conversion needed
    datasets.push({
      label: 'PE Budget (M THB)',
      data: data.peValues,
      backgroundColor: peBarColors,
      borderColor: peBorderColors,
      borderWidth: 2,
      yAxisID: 'y',
      order: 1,
      growthRates: data.peGrowthRates,
      yearTypes: data.yearTypes,
      newPE: data.newPE,
      vacantPE: data.vacantPE,
      metricType: 'pe'
    });
  }

  // Create chart
  trendChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false, // Hide legend for single dataset
          position: 'top',
          labels: {
            font: {
              family: 'Google Sans',
              size: 12
            },
            color: textColor,
            usePointStyle: true,
            padding: 15
          }
        },
        tooltip: {
          callbacks: {
            title: function(context) {
              const year = context[0].label;
              const index = context[0].dataIndex;
              const yearType = data.yearTypes[index];

              if (yearType === 'actual') {
                return `Actual ${year}`;
              } else if (yearType === 'le') {
                return `Actual + LE ${year}`;
              } else if (yearType === 'budget') {
                return `Budget ${year}`;
              }
              return year;
            },
            label: function(context) {
              const value = context.parsed.y;
              const index = context.dataIndex;
              const dataset = context.dataset;
              const metricType = dataset.metricType;
              const growth = dataset.growthRates[index];

              const lines = [];

              if (metricType === 'hc') {
                const newValue = dataset.newHC[index];
                const vacantValue = dataset.vacantHC[index];
                lines.push(`Total HC: ${formatNumber(value)}`);
                if (newValue > 0) lines.push(`New HC: ${formatNumber(newValue)}`);
                if (vacantValue > 0) lines.push(`Vacant HC: ${formatNumber(vacantValue)}`);
              } else if (metricType === 'pe') {
                const newValue = dataset.newPE[index];
                const vacantValue = dataset.vacantPE[index];
                lines.push(`Total PE: ${formatNumberDecimal(value, 2)} M THB`);
                if (newValue > 0) lines.push(`New PE: ${formatNumberDecimal(newValue, 2)} M THB`);
                if (vacantValue > 0) lines.push(`Vacant PE: ${formatNumberDecimal(vacantValue, 2)} M THB`);
              }

              if (growth !== null && growth !== undefined && !isNaN(growth)) {
                lines.push(`Growth: ${formatPercentage(growth)}`);
              }

              return lines;
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
            font: {
              size: 12,
              family: 'Google Sans'
            },
            color: textColor
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
              // Format with decimal for PE (M THB), integer for HC
              if (showMode === 'pe') {
                return formatNumberDecimal(value, 2);
              }
              return formatNumber(value);
            },
            font: {
              family: 'Google Sans'
            },
            color: textColor
          },
          grid: {
            color: gridColor
          },
          title: {
            display: true,
            text: showMode === 'pe' ? 'PE Budget (M THB)' : 'Headcount (HC)',
            font: {
              size: 14,
              family: 'Google Sans',
              weight: 'bold'
            },
            color: textColor
          }
        }
      }
    },
    plugins: [
      {
        id: 'trendChartLabels',
        afterDatasetsDraw: function(chart) {
          const ctx = chart.ctx;

          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';

          // Draw labels for HC dataset (always first dataset)
          const hcMeta = chart.getDatasetMeta(0);
          if (hcMeta && hcMeta.data) {
            const hcDataset = chart.data.datasets[0];
            const metricType = hcDataset.metricType;

            hcMeta.data.forEach((bar, index) => {
              const value = hcDataset.data[index];
              const growth = hcDataset.growthRates[index];
              const yearType = hcDataset.yearTypes[index];

              // Calculate bar height
              const barHeight = bar.base - bar.y;
              const requiredSpace = 55; // Total (15) + Gap (10) + Box (32)
              const hasSpace = barHeight > requiredSpace;

              // Draw value at TOP of bar (always inside)
              ctx.font = 'bold 12px Google Sans, sans-serif';
              ctx.fillStyle = textColor;
              ctx.textAlign = 'center';

              // Format value based on metric type
              let valueText;
              if (metricType === 'pe') {
                valueText = formatNumberDecimal(value, 2); // PE in M THB with 2 decimals
              } else {
                valueText = formatNumber(value); // HC as integer
              }
              ctx.fillText(valueText, bar.x, bar.y + 15);

              // Draw New/Vacant box for 2024-2026 (latest-actual, le, budget)
              if (yearType === 'latest-actual' || yearType === 'le' || yearType === 'budget') {
                let newVal, vacantVal;
                if (metricType === 'pe') {
                  newVal = hcDataset.newPE[index];
                  vacantVal = hcDataset.vacantPE[index];
                } else {
                  newVal = hcDataset.newHC[index];
                  vacantVal = hcDataset.vacantHC[index];
                }

                // Only draw if there's data
                if (newVal > 0 || vacantVal > 0) {
                  const boxWidth = metricType === 'pe' ? 100 : 80;
                  const boxHeight = 32;
                  const boxX = bar.x - boxWidth / 2;
                  let boxY;

                  // Position box inside or outside based on bar height
                  if (hasSpace) {
                    // Inside: below Total with 10px gap
                    boxY = bar.y + 25;
                  } else {
                    // Outside: above bar
                    boxY = bar.y - 60;
                  }

                  // Draw background box (green for HC, blue for PE)
                  if (metricType === 'pe') {
                    ctx.fillStyle = 'rgba(52, 152, 219, 0.85)'; // Blue for PE
                    ctx.strokeStyle = 'rgba(41, 128, 185, 1)';
                  } else {
                    ctx.fillStyle = 'rgba(46, 204, 113, 0.85)'; // Green for HC
                    ctx.strokeStyle = 'rgba(39, 174, 96, 1)';
                  }
                  ctx.beginPath();
                  ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 3);
                  ctx.fill();

                  // Draw border
                  ctx.lineWidth = 1;
                  ctx.stroke();

                  // Draw text
                  ctx.fillStyle = '#ffffff';
                  ctx.font = 'bold 10px Google Sans, sans-serif';
                  ctx.textAlign = 'center';

                  // Format values based on metric type
                  let newText, vacText;
                  if (metricType === 'pe') {
                    newText = `New: ${formatNumberDecimal(newVal, 2)}`;
                    vacText = `Vac: ${formatNumberDecimal(vacantVal, 2)}`;
                  } else {
                    newText = `New: ${formatNumber(newVal)}`;
                    vacText = `Vac: ${formatNumber(vacantVal)}`;
                  }

                  ctx.fillText(newText, bar.x, boxY + 13);
                  ctx.fillText(vacText, bar.x, boxY + 26);
                }
              }

              // Draw growth rate above everything (if available)
              if (growth !== null && growth !== undefined && !isNaN(growth)) {
                ctx.font = 'bold 11px Google Sans, sans-serif';
                ctx.textAlign = 'center';

                if (growth > 0) {
                  ctx.fillStyle = '#28a745'; // Green
                } else if (growth < 0) {
                  ctx.fillStyle = '#dc3545'; // Red
                } else {
                  ctx.fillStyle = textColor;
                }

                const growthText = formatPercentage(growth);

                // Position growth rate
                let growthY;
                if (yearType === 'latest-actual' || yearType === 'le' || yearType === 'budget') {
                  // If box is outside (no space), move growth up
                  growthY = hasSpace ? bar.y - 25 : bar.y - 75;
                } else {
                  // Normal years (2019-2023)
                  growthY = bar.y - 25;
                }

                ctx.fillText(growthText, bar.x, growthY);
              }
            });
          }

          ctx.restore();
        }
      }
    ]
  });

  console.log('Trend chart rendered:', { showMode, includeAreaStore: trendChartConfig.includeAreaStore });
}

// ============================================================================
// Toggle Handlers
// ============================================================================

/**
 * Setup dropdown event listener for trend view type
 */
function setupTrendChartToggles() {
  // Dropdown: Trend View Type
  const trendViewType = document.getElementById('trendViewType');
  if (trendViewType) {
    trendViewType.addEventListener('change', async function() {
      const value = this.value;

      // Parse value: hc-inc, hc-exc, pe-inc, pe-exc
      const showMode = value.startsWith('pe-') ? 'pe' : 'hc';
      const includeAreaStore = value.endsWith('-inc');

      // Update config
      trendChartConfig.showMode = showMode;
      trendChartConfig.includeAreaStore = includeAreaStore;

      console.log('Trend View Type changed:', { value, showMode, includeAreaStore });

      // Reload trend data with new filter
      if (window.dashboardFilters) {
        showTrendChartLoading(true);
        try {
          const data = await fetchDashboardTrendData(window.dashboardFilters);
          trendChartData = data;
          renderTrendChart(data);
        } catch (error) {
          console.error('Error reloading trend chart:', error);
        } finally {
          showTrendChartLoading(false);
        }
      }
    });
  }

  console.log('Trend chart dropdown initialized');
}

// ============================================================================
// Visibility Functions
// ============================================================================

/**
 * Show Block D (Trend Chart)
 */
function showTrendChartBlock() {
  const block = document.getElementById('blockDTrendChart');
  if (block) {
    block.style.display = '';
  }
}

/**
 * Hide Block D (Trend Chart)
 */
function hideTrendChartBlock() {
  const block = document.getElementById('blockDTrendChart');
  if (block) {
    block.style.display = 'none';
  }
}

/**
 * Show/hide trend chart loading indicator
 * @param {boolean} show - True to show, false to hide
 */
function showTrendChartLoading(show) {
  const loading = document.getElementById('trendChartLoading');
  if (loading) {
    if (show) {
      loading.classList.remove('d-none');
    } else {
      loading.classList.add('d-none');
    }
  }
}

/**
 * Check if current company supports trend chart (BIG C only)
 * @returns {boolean}
 */
function isTrendChartSupported() {
  const companyId = parseInt(window.dashboardFilters?.companyId);
  return companyId === 2; // BIG C only
}

// ============================================================================
// Cleanup Functions
// ============================================================================

/**
 * Destroy trend chart instance
 */
function destroyTrendChart() {
  if (trendChart) {
    trendChart.destroy();
    trendChart = null;
  }
  trendChartData = null;
}

// ============================================================================
// Export Functions
// ============================================================================

window.loadDashboardTrendChart = loadDashboardTrendChart;
window.renderTrendChart = renderTrendChart;
window.setupTrendChartToggles = setupTrendChartToggles;
window.showTrendChartBlock = showTrendChartBlock;
window.hideTrendChartBlock = hideTrendChartBlock;
window.showTrendChartLoading = showTrendChartLoading;
window.isTrendChartSupported = isTrendChartSupported;
window.destroyTrendChart = destroyTrendChart;
window.trendChart = trendChart;
window.trendChartData = trendChartData;
window.trendChartConfig = trendChartConfig;

console.log('PE Dashboard Trend Chart module loaded successfully');
