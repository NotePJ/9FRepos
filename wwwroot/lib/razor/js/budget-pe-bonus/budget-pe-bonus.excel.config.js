/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📊 BUDGET PE BONUS EXCEL EXPORT CONFIGURATION
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Purpose: Configuration and mappings for PE Bonus Excel export
 * - Color schemes
 * - Font configurations
 * - BJC column mappings (50 columns)
 * - BIG C column mappings (50 columns)
 * - Header configurations
 * - Merged cell configurations
 *
 * @version 1.0.0
 * @date 2025-11-06
 * @author SA Team
 */

(function() {
  'use strict';

  console.log('📊 Loading Budget PE Bonus Excel Configuration...');

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
    // Secondary colors
    LIGHT_GRAY: 'FFF2F2F2',
    LIGHT_GREEN: 'FFC6E0B4',
    LIGHT_ORANGE: 'FFFCE4D6',
    LIGHT_BLUE: 'FFDAE3F3',
    LIGHT_YELLOW: 'FFFEF9CC',
    DARK_BLUE: 'FF1F4E78',
    DARK_GREEN: 'FF385623',
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
    THAI: {
      name: 'Angsana New',
      size: 14,
      bold: false,
      color: 'FF000000'
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // 📊 DYNAMIC COLUMN GENERATION FUNCTIONS
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Organization columns (static - 9 columns)
   */
  const ORGANIZATION_COLUMNS = [
    { field: 'BU_HEAD_SUP', header: 'BU Head Supervisor', format: 'text', width: 18 },
    { field: 'BU_HEAD', header: 'BU Head', format: 'text', width: 18 },
    { field: 'BU', header: 'BU', format: 'text', width: 10 },
    { field: 'COBU', header: 'COBU', format: 'text', width: 10 },
    { field: 'DEPARTMENT', header: 'Department', format: 'text', width: 20 },
    { field: 'COST_CENTER', header: 'Cost Center', format: 'text', width: 12 },
    { field: 'COST_CENTER_NAME_HR', header: 'Cost Center Name (HR)', format: 'text', width: 25 },
    { field: 'GROUPING', header: 'Grouping', format: 'text', width: 15 },
    { field: 'HRBP', header: 'HRBP', format: 'text', width: 15 }
  ];

  /**
   * Generate historical actual columns dynamically
   * @param {number} startYear - Start year (e.g., 2019)
   * @param {number} endYear - End year (e.g., 2024)
   * @returns {Array} Array of column definitions (3 columns per year: FT, CT, PE)
   */
  function generateHistoricalColumns(startYear, endYear) {
    const columns = [];
    for (let year = startYear; year <= endYear; year++) {
      columns.push(
        { field: `ACTUAL_FT_${year}`, header: 'FT', format: 'currency', width: 15, year: year },
        { field: `ACTUAL_CT_${year}`, header: 'CT', format: 'currency', width: 15, year: year },
        { field: `ACTUAL_PE_${year}`, header: 'PE', format: 'currency', width: 15, year: year }
      );
    }
    return columns;
  }

  /**
   * Generate budget year columns dynamically
   * @param {number} budgetYear - Budget year (e.g., 2025)
   * @returns {Array} Array of 4 column definitions
   */
  function generateBudgetColumns(leYear) {
    return [
      { field: `BUDGET_FT_${leYear}`, header: `Budget FT ${leYear}`, format: 'currency', width: 15 },
      { field: `BUDGET_CT_${leYear}`, header: `Budget CT ${leYear}`, format: 'currency', width: 15 },
      { field: `CURRENT_PE_${leYear}`, header: `Current PE ${leYear}`, format: 'currency', width: 15 },
      { field: `CURRENT_PE_BONUS_${leYear}`, header: `Current PE Bonus ${leYear}`, format: 'currency', width: 18 }
    ];
  }

  /**
   * Generate LE (Latest Estimate) columns dynamically
   * @param {number} leYear - LE year (e.g., 2025)
   * @returns {Array} Array of 16 column definitions
   */
  function generateLEColumns(budgetYear) {
    return [
      { field: 'ACTIVE_FT_LE', header: 'Active FT', format: 'currency', width: 15 },
      { field: 'ACTIVE_CT_LE', header: 'Active CT', format: 'currency', width: 15 },
      { field: 'ACTIVE_PE_LE', header: 'Active PE', format: 'currency', width: 15 },
      { field: 'VAC_FT_LE', header: 'Vacant FT', format: 'currency', width: 15 },
      { field: 'VAC_CT_LE', header: 'Vacant CT', format: 'currency', width: 15 },
      { field: 'VAC_PE_LE', header: 'Vacant PE', format: 'currency', width: 15 },
      { field: 'NEW_FT_LE', header: 'New FT', format: 'currency', width: 15 },
      { field: 'NEW_CT_LE', header: 'New CT', format: 'currency', width: 15 },
      { field: 'NEW_PE_LE', header: 'New PE', format: 'currency', width: 15 },
      { field: 'SUM_FT_LE', header: 'Sum FT', format: 'currency', width: 15 },
      { field: 'SUM_CT_LE', header: 'Sum CT', format: 'currency', width: 15 },
      { field: 'SUM_PE_LE', header: 'Sum PE', format: 'currency', width: 15 },
      { field: 'OT_LE', header: 'OT', format: 'currency', width: 15 },
      { field: 'EB_LE', header: 'EB', format: 'currency', width: 15 },
      { field: 'SUM_PE_OTEB_LE', header: 'Sum PE+OT+EB', format: 'currency', width: 18 },
      { field: 'SUM_PE_OTOTH_LE', header: 'Sum PE+OT+Other', format: 'currency', width: 18 }
    ];
  }

  /**
   * Generate Company year columns dynamically
   * @param {number} companyYear - Company year (e.g., 2026)
   * @returns {Array} Array of 19 column definitions
   */
  function generateCompanyColumns(companyYear) {
    return [
      { field: 'ACTIVE_FT', header: 'Active FT', format: 'currency', width: 15 },
      { field: 'ACTIVE_CT', header: 'Active CT', format: 'currency', width: 15 },
      { field: 'ACTIVE_PE', header: 'Active PE', format: 'currency', width: 15 },
      { field: 'VAC_FT', header: 'Vacant FT', format: 'currency', width: 15 },
      { field: 'VAC_CT', header: 'Vacant CT', format: 'currency', width: 15 },
      { field: 'VAC_PE', header: 'Vacant PE', format: 'currency', width: 15 },
      { field: 'NEW_FT_LE', header: 'New FT (LE)', format: 'currency', width: 15 },
      { field: 'NEW_CT_LE', header: 'New CT (LE)', format: 'currency', width: 15 },
      { field: 'NEW_PE_LE', header: 'New PE (LE)', format: 'currency', width: 15 },
      { field: 'NEW_FT', header: 'New FT', format: 'currency', width: 15 },
      { field: 'NEW_CT', header: 'New CT', format: 'currency', width: 15 },
      { field: 'NEW_PE', header: 'New PE', format: 'currency', width: 15 },
      { field: 'SUM_FT', header: 'Sum FT', format: 'currency', width: 15 },
      { field: 'SUM_CT', header: 'Sum CT', format: 'currency', width: 15 },
      { field: 'SUM_PE', header: 'Sum PE', format: 'currency', width: 15 },
      { field: 'OT', header: 'OT', format: 'currency', width: 15 },
      { field: 'EB', header: 'EB', format: 'currency', width: 15 },
      { field: 'SUM_PE_OTEB', header: 'Sum PE+OT+EB', format: 'currency', width: 18 },
      { field: 'SUM_PE_OTOTH', header: 'Sum PE+OT+Other', format: 'currency', width: 18 }
    ];
  }

  /**
   * Calculate column positions for section headers
   * @param {Array} columns - Full column mapping array
   * @returns {Object} Position information for each section
   */
  function calculateColumnPositions(columns) {
    let currentCol = 1;
    const positions = {
      organization: { start: currentCol, end: currentCol + ORGANIZATION_COLUMNS.length - 1 },
      historical: { start: 0, end: 0 },
      budget: { start: 0, end: 0 },
      le: { start: 0, end: 0 },
      company: { start: 0, end: 0 }
    };

    currentCol += ORGANIZATION_COLUMNS.length;

    // Find historical section
    const historicalStart = columns.findIndex(c => c.field && c.field.startsWith('ACTUAL_'));
    const historicalEnd = columns.findIndex((c, i) => i > historicalStart && c.field && c.field.startsWith('BUDGET_')) - 1;
    if (historicalStart !== -1) {
      positions.historical.start = currentCol;
      positions.historical.end = currentCol + (historicalEnd - historicalStart);
      currentCol = positions.historical.end + 1;
    }

    // Find budget section
    const budgetStart = columns.findIndex(c => c.field && c.field.startsWith('BUDGET_'));
    const budgetEnd = budgetStart + 3; // Always 4 columns
    if (budgetStart !== -1) {
      positions.budget.start = currentCol;
      positions.budget.end = currentCol + 3;
      currentCol = positions.budget.end + 1;
    }

    // Find LE section
    const leStart = columns.findIndex(c => c.field && c.field.endsWith('_LE'));
    const leEnd = columns.findIndex((c, i) => i > leStart && c.field && !c.field.endsWith('_LE') && !c.field.includes('NEW_FT_LE')) - 1;
    if (leStart !== -1) {
      positions.le.start = currentCol;
      positions.le.end = currentCol + 15; // 16 columns
      currentCol = positions.le.end + 1;
    }

    // Company section (remaining columns)
    positions.company.start = currentCol;
    positions.company.end = columns.length;

    return positions;
  }

  /**
   * Generate section headers dynamically
   * @param {number} historicalStartYear - Historical start year
   * @param {number} historicalEndYear - Historical end year
   * @param {number} budgetYear - Budget year
   * @param {number} leYear - LE year
   * @param {number} companyYear - Company year
   * @param {Object} positions - Column positions
   * @returns {Array} Section headers array
   */
  function generateSectionHeaders(historicalStartYear, historicalEndYear, budgetYear, leYear, companyYear, positions) {
    return [
      { text: 'Organization', startCol: positions.organization.start, endCol: positions.organization.end, color: EXCEL_COLORS.BLUE },
      { text: `Historical Actual ${historicalStartYear}-${historicalEndYear}`, startCol: positions.historical.start, endCol: positions.historical.end, color: EXCEL_COLORS.ORANGE },
      { text: `Budget ${leYear}`, startCol: positions.budget.start, endCol: positions.budget.end, color: EXCEL_COLORS.GREEN },
      { text: `LE ${budgetYear}`, startCol: positions.le.start, endCol: positions.le.end, color: EXCEL_COLORS.LIGHT_BLUE },
      { text: `Company ${companyYear}`, startCol: positions.company.start, endCol: positions.company.end, color: EXCEL_COLORS.LIGHT_GREEN }
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
        endCol: currentCol + 2
      });
      currentCol += 3;
    }
    return historicalYears;
  }

  /**
   * Main configuration generator
   * @param {Object} options - Configuration options
   * @returns {Object} Complete configuration object
   */
  function generatePEBonusExcelConfig(options = {}) {
    const {
      budgetYear = new Date().getFullYear() + 1,  // Default: 2026
      historicalYearCount = 6,                     // Default: 6 years
      historicalEndYear = budgetYear - 2,          // Default: 2024 (if budgetYear=2026)
      leYear = budgetYear - 1                      // Default: 2025 (if budgetYear=2026)
    } = options;

    const historicalStartYear = historicalEndYear - historicalYearCount + 1;
    const companyYear = budgetYear;

    console.log(`🔧 Generating PE Bonus Excel Config:`, {
      budgetYear,
      leYear,
      companyYear,
      historicalRange: `${historicalStartYear}-${historicalEndYear}`
    });

    // Generate all column sections
    const COLUMN_MAPPING = [
      ...ORGANIZATION_COLUMNS,
      ...generateHistoricalColumns(historicalStartYear, historicalEndYear),
      ...generateBudgetColumns(budgetYear),
      ...generateLEColumns(leYear),
      ...generateCompanyColumns(companyYear)
    ];

    // Calculate positions
    const positions = calculateColumnPositions(COLUMN_MAPPING);

    // Generate headers
    const SECTION_HEADERS = generateSectionHeaders(
      historicalStartYear,
      historicalEndYear,
      budgetYear,
      leYear,
      companyYear,
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
        companyYear,
        historicalStartYear,
        historicalEndYear
      }
    };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 📊 DEFAULT CONFIGURATION (BACKWARD COMPATIBLE)
  // ══════════════════════════════════════════════════════════════════════════

  // Generate default configuration for 2026
  const defaultConfig = generatePEBonusExcelConfig();
  const COLUMN_MAPPING = defaultConfig.COLUMNS;

  // Use generated headers from default config
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
      numFmt: '#,##0.00',
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
        fgColor: { argb: 'FFC6E0B4' } // Light green
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
        top: { style: 'medium', color: { argb: EXCEL_COLORS.BLACK } },
        left: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
        bottom: { style: 'medium', color: { argb: EXCEL_COLORS.BLACK } },
        right: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } }
      }
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // 🌐 EXPORT TO GLOBAL SCOPE
  // ══════════════════════════════════════════════════════════════════════════

  window.PE_BONUS_EXCEL_CONFIG = {
    COLORS: EXCEL_COLORS,
    FONTS: FONT_CONFIGS,
    COLUMNS: COLUMN_MAPPING,
    SECTION_HEADERS: SECTION_HEADERS,
    SUB_SECTION_HEADERS: SUB_SECTION_HEADERS,
    STYLES: CELL_STYLES,
    // Export generator function for custom year configurations
    generateConfig: generatePEBonusExcelConfig,
    // Export default config details
    DEFAULT_YEARS: defaultConfig.YEARS,
    DEFAULT_POSITIONS: defaultConfig.POSITIONS
  };

  console.log('✅ Budget PE Bonus Excel Configuration loaded');
  console.log(`   📊 ${COLUMN_MAPPING.length} columns mapped`);
  console.log(`   🎨 ${SECTION_HEADERS.length} section headers configured`);
  console.log(`   🗓️  Budget Year: ${defaultConfig.YEARS.budgetYear}, LE Year: ${defaultConfig.YEARS.leYear}`);
  console.log(`   📅 Historical Range: ${defaultConfig.YEARS.historicalStartYear}-${defaultConfig.YEARS.historicalEndYear}`);

})();
