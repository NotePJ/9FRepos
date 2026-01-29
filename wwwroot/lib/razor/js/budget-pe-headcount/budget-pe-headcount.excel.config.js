/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📊 BUDGET PE HEADCOUNT EXCEL EXPORT CONFIGURATION
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Purpose: Configuration and mappings for PE HeadCount Excel export
 * - Color schemes
 * - Font configurations
 * - Column mappings (dynamic based on year)
 * - Header configurations
 * - Support hierarchical data (GROUP_TYPE, GROUPING_HEAD, GROUPING, Detail rows)
 *
 * @version 1.0.0
 * @date 2025-11-26
 * @author SA Team
 */

(function() {
  'use strict';

  console.log('📊 Loading Budget PE HeadCount Excel Configuration...');

  // ══════════════════════════════════════════════════════════════════════════
  // 🎨 COLOR SCHEMES
  // ══════════════════════════════════════════════════════════════════════════

  const EXCEL_COLORS = {
    // Primary colors
    RED: 'FFFF0000',
    WHITE: 'FFFFFFFF',
    YELLOW: 'FFFFFF00',
    BLUE: 'FF4472C4',
    ORANGE: 'FFED7D31',
    BLACK: 'FF000000',
    GREEN: 'FF70AD47',
    DARK_GREEN: 'FF166534',
    // Secondary colors
    LIGHT_GRAY: 'FFF2F2F2',
    LIGHT_GREEN: 'FFC6E0B4',
    LIGHT_ORANGE: 'FFFCE4D6',
    LIGHT_BLUE: 'FFDAE3F3',
    LIGHT_YELLOW: 'FFFEF9CC',
    DARK_BLUE: 'FF1F4E78',
    // Hierarchy colors (matching AG Grid green theme)
    HIERARCHY_L0: 'FFC3F7D3', // rgb(195,247,211)
    HIERARCHY_L1: 'FFF0FDF4', // rgb(240,253,244)
    HIERARCHY_L2: 'FFFFFFFF', // White
    HIERARCHY_GRAND: 'FFF0FDFB', // rgb(240,253,251)
    // Transparent
    NONE: '00FFFFFF'
  };

  // ══════════════════════════════════════════════════════════════════════════
  // 🔤 FONT CONFIGURATIONS
  // ══════════════════════════════════════════════════════════════════════════

  const FONT_CONFIGS = {
    HEADER: {
      name: 'Calibri',
      size: 11,
      bold: true,
      color: 'FFFFFFFF' // White
    },
    SECTION_HEADER: {
      name: 'Calibri',
      size: 11,
      bold: true,
      color: 'FF000000' // Black
    },
    COLUMN_HEADER: {
      name: 'Calibri',
      size: 10,
      bold: true,
      color: 'FF000000' // Black
    },
    DATA: {
      name: 'Calibri',
      size: 10,
      bold: false,
      color: 'FF000000' // Black
    },
    HIERARCHY: {
      name: 'Calibri',
      size: 10,
      bold: true,
      color: 'FF166534' // Dark green
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // 📊 ORGANIZATION COLUMNS (Static - 2 columns)
  // ══════════════════════════════════════════════════════════════════════════

  const ORGANIZATION_COLUMNS = [
    { field: 'ORGANIZATION', header: 'Organization', format: 'text', width: 35 },
    { field: 'COST_CENTER', header: 'Cost Center', format: 'text', width: 15 }
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // 📊 DYNAMIC COLUMN GENERATION FUNCTIONS
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Generate historical actual columns dynamically
   * @param {number} startYear - Start year (e.g., 2019)
   * @param {number} endYear - End year (e.g., 2024)
   * @returns {Array} Array of column definitions (2 columns per year: HC, PE)
   */
  function generateHistoricalColumns(startYear, endYear) {
    const columns = [];
    for (let year = startYear; year <= endYear; year++) {
      columns.push(
        { field: `ACTUAL_HC_${year}`, header: 'HC', format: 'number', width: 12, year: year },
        { field: `ACTUAL_PE_${year}`, header: 'PE', format: 'currency', width: 15, year: year }
      );
    }
    return columns;
  }

  /**
   * Generate Budget B0 columns
   * @param {number} leYear - LE year (e.g., 2025)
   * @returns {Array} Array of 8 column definitions
   */
  function generateBudgetB0Columns(leYear) {
    return [
      { field: 'BUDGET_CURR_HC', header: 'HC', format: 'number', width: 12 },
      { field: 'BUDGET_CURR_PE', header: 'PE', format: 'currency', width: 15 },
      { field: 'BUDGET_CURR_HC_MOVE_IN', header: 'Move In', format: 'number', width: 12 },
      { field: 'BUDGET_CURR_HC_MOVE_OUT', header: 'Move Out', format: 'number', width: 12 },
      { field: 'BUDGET_CURR_HC_ADD', header: 'Add', format: 'number', width: 12 },
      { field: 'BUDGET_CURR_HC_CUT', header: 'Cut', format: 'number', width: 12 },
      { field: 'BUDGET_CURR_HC_MOVEMENT', header: 'Movement', format: 'number', width: 12 },
      { field: 'BUDGET_CURR_PE_ADJUST', header: 'PE Adjust', format: 'currency', width: 15 }
    ];
  }

  /**
   * Generate LE columns
   * @param {number} leYear - LE year (e.g., 2025)
   * @returns {Array} Array of 8 column definitions
   */
  function generateLEColumns(leYear) {
    return [
      { field: 'LE_ACTIVE_HC_LE', header: 'Active HC', format: 'number', width: 12 },
      { field: 'LE_ACTIVE_PE_LE', header: 'Active PE', format: 'currency', width: 15 },
      { field: 'VAC_HC_LE', header: 'Vac HC', format: 'number', width: 12 },
      { field: 'VAC_PE_LE', header: 'Vac PE', format: 'currency', width: 15 },
      { field: 'NEW_HC_LE', header: 'New HC', format: 'number', width: 12 },
      { field: 'NEW_PE_LE', header: 'New PE', format: 'currency', width: 15 },
      { field: 'TOT_HC_LE', header: 'Total HC', format: 'number', width: 12 },
      { field: 'TOT_PE_OTEB_LE', header: 'Total PE', format: 'currency', width: 15 }
    ];
  }

  /**
   * Generate Budget Next Year columns
   * @param {number} budgetYear - Budget year (e.g., 2026)
   * @returns {Array} Array of 11 column definitions
   */
  function generateBudgetNextColumns(budgetYear) {
    return [
      { field: 'BUDGET_NEXT_HC_MOVE_IN', header: 'Move In', format: 'number', width: 12 },
      { field: 'BUDGET_NEXT_HC_MOVE_OUT', header: 'Move Out', format: 'number', width: 12 },
      { field: 'BUDGET_NEXT_HC_CUT', header: 'Cut', format: 'number', width: 12 },
      { field: 'ACTIVE_HC', header: 'Active HC', format: 'number', width: 12 },
      { field: 'ACTIVE_PE', header: 'Active PE', format: 'currency', width: 15 },
      { field: 'VAC_HC', header: 'Vac HC', format: 'number', width: 12 },
      { field: 'VAC_PE', header: 'Vac PE', format: 'currency', width: 15 },
      { field: 'NEW_HC', header: 'New HC', format: 'number', width: 12 },
      { field: 'NEW_PE', header: 'New PE', format: 'currency', width: 15 },
      { field: 'TOT_HC', header: 'Total HC', format: 'number', width: 12 },
      { field: 'TOT_PE', header: 'Total PE', format: 'currency', width: 15 }
    ];
  }

  /**
   * Generate Diff columns
   * @param {number} budgetYear - Budget year (e.g., 2026)
   * @param {number} leYear - LE year (e.g., 2025)
   * @returns {Array} Array of 6 column definitions
   */
  function generateDiffColumns(budgetYear, leYear) {
    return [
      { field: 'DIFF_HC_B0', header: 'Diff HC', format: 'number', width: 12, isDiff: true },
      { field: 'DIFF_PE_B0', header: 'Diff PE', format: 'currency', width: 15, isDiff: true },
      { field: 'DIFF_HC_LE', header: 'Diff HC', format: 'number', width: 12, isDiff: true },
      { field: 'DIFF_PE_LE', header: 'Diff PE', format: 'currency', width: 15, isDiff: true },
      { field: 'DIFF_PERCENT_B0', header: '% Diff', format: 'percent', width: 12, isDiff: true },
      { field: 'DIFF_PERCENT_LE', header: '% Diff', format: 'percent', width: 12, isDiff: true }
    ];
  }

  /**
   * Calculate column positions for section headers
   * @param {number} historicalYearCount - Number of historical years
   * @returns {Object} Position information for each section
   */
  function calculateColumnPositions(historicalYearCount) {
    let currentCol = 1;
    const positions = {
      organization: { start: currentCol, end: currentCol + 1 }, // 2 columns
    };
    currentCol += 2;

    positions.historical = { start: currentCol, end: currentCol + (historicalYearCount * 2) - 1 };
    currentCol = positions.historical.end + 1;

    positions.budgetB0 = { start: currentCol, end: currentCol + 7 }; // 8 columns
    currentCol = positions.budgetB0.end + 1;

    positions.le = { start: currentCol, end: currentCol + 7 }; // 8 columns
    currentCol = positions.le.end + 1;

    positions.budgetNext = { start: currentCol, end: currentCol + 10 }; // 11 columns
    currentCol = positions.budgetNext.end + 1;

    positions.diffB0 = { start: currentCol, end: currentCol + 1 }; // 2 columns
    currentCol = positions.diffB0.end + 1;

    positions.diffLE = { start: currentCol, end: currentCol + 1 }; // 2 columns
    currentCol = positions.diffLE.end + 1;

    positions.percentB0 = { start: currentCol, end: currentCol }; // 1 column
    currentCol = positions.percentB0.end + 1;

    positions.percentLE = { start: currentCol, end: currentCol }; // 1 column

    return positions;
  }

  /**
   * Generate section headers dynamically
   * @param {number} historicalStartYear - Historical start year
   * @param {number} historicalEndYear - Historical end year
   * @param {number} budgetYear - Budget year
   * @param {number} leYear - LE year
   * @param {Object} positions - Column positions
   * @returns {Array} Section headers array
   */
  function generateSectionHeaders(historicalStartYear, historicalEndYear, budgetYear, leYear, positions) {
    return [
      { text: 'Organization', startCol: positions.organization.start, endCol: positions.organization.end, color: EXCEL_COLORS.BLUE },
      { text: `Historical Actual ${historicalStartYear}-${historicalEndYear}`, startCol: positions.historical.start, endCol: positions.historical.end, color: EXCEL_COLORS.ORANGE },
      { text: `Budget ${leYear} (B0)`, startCol: positions.budgetB0.start, endCol: positions.budgetB0.end, color: EXCEL_COLORS.GREEN },
      { text: `LE ${leYear}`, startCol: positions.le.start, endCol: positions.le.end, color: EXCEL_COLORS.LIGHT_BLUE },
      { text: `Budget ${budgetYear}`, startCol: positions.budgetNext.start, endCol: positions.budgetNext.end, color: EXCEL_COLORS.LIGHT_GREEN },
      { text: `Diff B ${budgetYear} vs. B ${leYear} (B0)`, startCol: positions.diffB0.start, endCol: positions.diffB0.end, color: EXCEL_COLORS.LIGHT_YELLOW },
      { text: `Diff B ${budgetYear} vs. LE ${leYear}`, startCol: positions.diffLE.start, endCol: positions.diffLE.end, color: EXCEL_COLORS.LIGHT_YELLOW },
      { text: `B ${budgetYear} vs. B ${leYear}`, startCol: positions.percentB0.start, endCol: positions.percentB0.end, color: EXCEL_COLORS.LIGHT_ORANGE },
      { text: `B ${budgetYear} vs. LE ${leYear}`, startCol: positions.percentLE.start, endCol: positions.percentLE.end, color: EXCEL_COLORS.LIGHT_ORANGE }
    ];
  }

  /**
   * Generate sub-section headers for historical years
   * @param {number} startYear - Historical start year
   * @param {number} endYear - Historical end year
   * @param {number} startCol - Starting column number
   * @returns {Array} Sub-section headers array
   */
  function generateSubSectionHeaders(startYear, endYear, startCol) {
    const historicalYears = [];
    let currentCol = startCol;
    for (let year = startYear; year <= endYear; year++) {
      historicalYears.push({
        text: `Actual ${year}`,
        startCol: currentCol,
        endCol: currentCol + 1 // 2 columns per year (HC, PE)
      });
      currentCol += 2;
    }
    return historicalYears;
  }

  /**
   * Main configuration generator
   * @param {Object} options - Configuration options
   * @returns {Object} Complete configuration object
   */
  function generatePEHeadCountExcelConfig(options = {}) {
    const {
      budgetYear = new Date().getFullYear() + 1,  // Default: 2026
      historicalYearCount = 6,                     // Default: 6 years
      historicalEndYear = budgetYear - 2,          // Default: 2024 (if budgetYear=2026)
      leYear = budgetYear - 1                      // Default: 2025 (if budgetYear=2026)
    } = options;

    const historicalStartYear = historicalEndYear - historicalYearCount + 1;

    console.log(`🔧 Generating PE HeadCount Excel Config:`, {
      budgetYear,
      leYear,
      historicalRange: `${historicalStartYear}-${historicalEndYear}`
    });

    // Generate all column sections
    const COLUMN_MAPPING = [
      ...ORGANIZATION_COLUMNS,
      ...generateHistoricalColumns(historicalStartYear, historicalEndYear),
      ...generateBudgetB0Columns(leYear),
      ...generateLEColumns(leYear),
      ...generateBudgetNextColumns(budgetYear),
      ...generateDiffColumns(budgetYear, leYear)
    ];

    // Calculate positions
    const positions = calculateColumnPositions(historicalYearCount);

    // Generate headers
    const SECTION_HEADERS = generateSectionHeaders(
      historicalStartYear,
      historicalEndYear,
      budgetYear,
      leYear,
      positions
    );

    const SUB_SECTION_HEADERS = {
      historicalYears: generateSubSectionHeaders(historicalStartYear, historicalEndYear, positions.historical.start)
    };

    return {
      COLUMNS: COLUMN_MAPPING,
      SECTION_HEADERS: SECTION_HEADERS,
      SUB_SECTION_HEADERS: SUB_SECTION_HEADERS,
      POSITIONS: positions,
      YEARS: {
        budgetYear,
        leYear,
        historicalStartYear,
        historicalEndYear
      }
    };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 📊 DEFAULT CONFIGURATION
  // ══════════════════════════════════════════════════════════════════════════

  // Generate default configuration for 2026
  const defaultConfig = generatePEHeadCountExcelConfig();
  const COLUMN_MAPPING = defaultConfig.COLUMNS;
  const SECTION_HEADERS = defaultConfig.SECTION_HEADERS;
  const SUB_SECTION_HEADERS = defaultConfig.SUB_SECTION_HEADERS;

  // ══════════════════════════════════════════════════════════════════════════
  // 🎨 CELL STYLING CONFIGURATIONS
  // ══════════════════════════════════════════════════════════════════════════

  const CELL_STYLES = {
    // Header row 1 (Section headers)
    SECTION_HEADER: {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: EXCEL_COLORS.BLUE }
      },
      font: {
        ...FONT_CONFIGS.SECTION_HEADER,
        color: { argb: EXCEL_COLORS.WHITE }
      },
      alignment: {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true
      },
      border: {
        top: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
        left: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
        bottom: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
        right: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } }
      }
    },

    // Header row 2 (Sub-section headers)
    SUB_SECTION_HEADER: {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: EXCEL_COLORS.LIGHT_ORANGE }
      },
      font: {
        ...FONT_CONFIGS.COLUMN_HEADER
      },
      alignment: {
        horizontal: 'center',
        vertical: 'middle'
      },
      border: {
        top: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
        left: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
        bottom: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
        right: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } }
      }
    },

    // Header row 3 (Column headers)
    COLUMN_HEADER: {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: EXCEL_COLORS.LIGHT_GRAY }
      },
      font: {
        ...FONT_CONFIGS.COLUMN_HEADER
      },
      alignment: {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true
      },
      border: {
        top: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
        left: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
        bottom: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
        right: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } }
      }
    },

    // Data cells (text)
    DATA_TEXT: {
      font: FONT_CONFIGS.DATA,
      alignment: {
        horizontal: 'left',
        vertical: 'middle'
      },
      border: {
        top: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
        left: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
        bottom: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
        right: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } }
      }
    },

    // Data cells (numeric)
    DATA_NUMBER: {
      font: FONT_CONFIGS.DATA,
      alignment: {
        horizontal: 'right',
        vertical: 'middle'
      },
      numFmt: '#,##0',
      border: {
        top: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
        left: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
        bottom: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
        right: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } }
      }
    },

    // Data cells (currency)
    DATA_CURRENCY: {
      font: FONT_CONFIGS.DATA,
      alignment: {
        horizontal: 'right',
        vertical: 'middle'
      },
      numFmt: '#,##0.00',
      border: {
        top: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
        left: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
        bottom: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
        right: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } }
      }
    },

    // Data cells (percent)
    DATA_PERCENT: {
      font: FONT_CONFIGS.DATA,
      alignment: {
        horizontal: 'right',
        vertical: 'middle'
      },
      numFmt: '0.00"%"',
      border: {
        top: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
        left: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
        bottom: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
        right: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } }
      }
    },

    // Hierarchy Level 0 (GROUP_TYPE)
    HIERARCHY_L0: {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: EXCEL_COLORS.HIERARCHY_L0 }
      },
      font: {
        ...FONT_CONFIGS.HIERARCHY
      },
      alignment: {
        horizontal: 'left',
        vertical: 'middle'
      },
      border: {
        top: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
        left: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
        bottom: { style: 'medium', color: { argb: EXCEL_COLORS.DARK_GREEN } },
        right: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } }
      }
    },

    // Hierarchy Level 1 (GROUPING_HEAD)
    HIERARCHY_L1: {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: EXCEL_COLORS.HIERARCHY_L1 }
      },
      font: {
        ...FONT_CONFIGS.HIERARCHY
      },
      alignment: {
        horizontal: 'left',
        vertical: 'middle'
      },
      border: {
        top: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
        left: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
        bottom: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
        right: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } }
      }
    },

    // Hierarchy Level 2 (GROUPING)
    HIERARCHY_L2: {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: EXCEL_COLORS.HIERARCHY_L2 }
      },
      font: {
        ...FONT_CONFIGS.DATA,
        bold: true
      },
      alignment: {
        horizontal: 'left',
        vertical: 'middle'
      },
      border: {
        top: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
        left: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
        bottom: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
        right: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } }
      }
    },

    // Grand Total row
    GRAND_TOTAL: {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: EXCEL_COLORS.HIERARCHY_GRAND }
      },
      font: {
        ...FONT_CONFIGS.HIERARCHY,
        size: 11
      },
      alignment: {
        horizontal: 'left',
        vertical: 'middle'
      },
      border: {
        top: { style: 'medium', color: { argb: EXCEL_COLORS.DARK_GREEN } },
        left: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
        bottom: { style: 'medium', color: { argb: EXCEL_COLORS.DARK_GREEN } },
        right: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } }
      }
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // 🌐 EXPORT TO GLOBAL SCOPE
  // ══════════════════════════════════════════════════════════════════════════

  window.PE_HEADCOUNT_EXCEL_CONFIG = {
    COLORS: EXCEL_COLORS,
    FONTS: FONT_CONFIGS,
    COLUMNS: COLUMN_MAPPING,
    SECTION_HEADERS: SECTION_HEADERS,
    SUB_SECTION_HEADERS: SUB_SECTION_HEADERS,
    STYLES: CELL_STYLES,
    // Export generator function for custom year configurations
    generateConfig: generatePEHeadCountExcelConfig,
    // Export default config details
    DEFAULT_YEARS: defaultConfig.YEARS,
    DEFAULT_POSITIONS: defaultConfig.POSITIONS
  };

  console.log('✅ Budget PE HeadCount Excel Configuration loaded');
  console.log(`   📊 ${COLUMN_MAPPING.length} columns mapped`);
  console.log(`   🎨 ${SECTION_HEADERS.length} section headers configured`);
  console.log(`   🗓️  Budget Year: ${defaultConfig.YEARS.budgetYear}, LE Year: ${defaultConfig.YEARS.leYear}`);
  console.log(`   📅 Historical Range: ${defaultConfig.YEARS.historicalStartYear}-${defaultConfig.YEARS.historicalEndYear}`);

})();
