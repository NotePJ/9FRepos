/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📊 BUDGET PLAN EXCEL EXPORT MODULE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Purpose: Export Allocation Batch Entry data to Excel with advanced styling
 * - Support BJC (CompanyId='1') and BIG C (CompanyId='2') templates
 * - Apply custom styling (colors, fonts, borders, merged cells)
 * - ⭐ Highlight "Fill" columns in header row
 * - Generate Excel file using ExcelJS library
 *
 * Dependencies:
 * - ExcelJS (https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js)
 * - budget.plan.excel.config.js (configuration file)
 *
 * @version 1.0.0
 * @date 2025-11-03
 * @author SA Team
 */

(function() {
  'use strict';

  // ══════════════════════════════════════════════════════════════════════════
  // 📚 CONSTANTS & CONFIGURATION
  // ══════════════════════════════════════════════════════════════════════════

  const EXCEL_COLORS = {
    RED: 'FFFF0000',
    WHITE: 'FFFFFFFF',
    YELLOW: 'FFFFFF00',
    BLUE: 'FF4472C4',
    ORANGE: 'FFED7D31',
    LIGHT_GRAY: 'FFF2F2F2',
    BLACK: 'FF000000',
    LIGHT_ORANGE: 'FFFCE4D6'
  };

  const FONT_CONFIG = {
    HEADER: {
      name: 'Calibri',
      size: 11,
      bold: true
    },
    SECTION: {
      name: 'Calibri',
      size: 11,
      bold: true
    },
    COLUMN_HEADER: {
      name: 'Calibri',
      size: 10,
      bold: true
    },
    DATA: {
      name: 'Calibri',
      size: 10,
      bold: false
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // 🔍 VALIDATION FUNCTIONS
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Validate if ExcelJS library is loaded
   * @throws {Error} If ExcelJS is not available
   */
  function validateExcelJSLoaded() {
    if (typeof ExcelJS === 'undefined') {
      throw new Error('ExcelJS library is not loaded. Please include the library before using this module.');
    }
  }

  /**
   * Validate row data structure
   * @param {Array} rows - Array of row data objects
   * @throws {Error} If validation fails
   */
  function validateRowData(rows) {
    if (!Array.isArray(rows)) {
      throw new Error('Rows must be an array');
    }

    if (rows.length === 0) {
      throw new Error('No rows to export. Please add allocation rows first.');
    }

    // Check if each row has required fields
    rows.forEach((row, index) => {
      if (!row || typeof row !== 'object') {
        throw new Error(`Row ${index + 1} is not a valid object`);
      }

      // Check for required fields
      if (!row.companyId) {
        throw new Error(`Row ${index + 1} is missing companyId field`);
      }
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 🏢 COMPANY-SPECIFIC CONFIGURATION HELPER
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Get company-specific configuration
   * @param {string} companyId - Company ID ('1' for BJC, '2' for BIG C)
   * @param {string} configType - Configuration type ('ROW_STYLES' or 'CELL_RANGE_STYLES')
   * @returns {Object} Company-specific configuration
   */
  function getCompanyConfig(companyId, configType) {
    // Select company-specific config
    if (companyId === '1') {
      return window.EXCEL_CONFIG?.BJC_CONFIG?.[configType];
    } else if (companyId === '2') {
      return window.EXCEL_CONFIG?.BIGC_CONFIG?.[configType];
    }

    // Fallback to default config (backward compatibility)
    return window.EXCEL_CONFIG?.[configType];
  }

  /**
   * Validate export options
   * @param {Object} options - Export options
   * @throws {Error} If validation fails
   */
  function validateOptions(options) {
    if (!options || typeof options !== 'object') {
      throw new Error('Options must be an object');
    }

    if (!options.companyId || (options.companyId !== '1' && options.companyId !== '2')) {
      throw new Error('Invalid companyId. Must be "1" (BJC) or "2" (BIG C)');
    }

    if (!options.rows) {
      throw new Error('Missing rows in options');
    }

    if (!options.filename) {
      throw new Error('Missing filename in options');
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 📚 WORKBOOK CREATION
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Create Excel workbook with metadata
   * @returns {ExcelJS.Workbook} Workbook instance
   */
  function createWorkbook() {
    const workbook = new ExcelJS.Workbook();

    // Set document properties
    workbook.creator = 'Budget Planning System';
    workbook.lastModifiedBy = 'Budget Planning System';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();

    return workbook;
  }

  /**
   * Create worksheet with default properties
   * @param {ExcelJS.Workbook} workbook - Workbook instance
   * @param {string} sheetName - Worksheet name
   * @returns {ExcelJS.Worksheet} Worksheet instance
   */
  function createWorksheet(workbook, sheetName) {
    const worksheet = workbook.addWorksheet(sheetName, {
      properties: {
        defaultColWidth: 12,
        defaultRowHeight: 18
      },
      pageSetup: {
        paperSize: 9, // A4
        orientation: 'landscape',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0
      }
    });

    return worksheet;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 🎨 HEADER ROWS GENERATION
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * ⭐ Add Row 1: Red header with "Fill" text
   * @param {ExcelJS.Worksheet} worksheet - Worksheet instance
   * @param {string} companyId - Company ID ('1' or '2')
   */
  function addRedFillHeader(worksheet, companyId) {
    console.log(`  📝 Adding red "Fill" header row...`);

    // Get company-specific Row 1 configuration
    const companyRowStyles = getCompanyConfig(companyId, 'ROW_STYLES');
    const row1Config = companyRowStyles?.ROW1 || {
      height: 25,
      text: 'Fill',
      style: {
        fill: { color: 'RED' },
        font: { name: 'Calibri', size: 11, bold: true, color: 'WHITE' },
        border: { style: 'thin', color: 'BLACK' },
        alignment: { horizontal: 'center', vertical: 'middle' }
      }
    };

    const row1 = worksheet.getRow(1);
    row1.height = row1Config.height;

    // Get Fill columns configuration
    const fillColumns = window.EXCEL_CONFIG ?
      (companyId === '1' ? window.EXCEL_CONFIG.BJC_FILL_COLUMNS : window.EXCEL_CONFIG.BIGC_FILL_COLUMNS) :
      (companyId === '1' ? getDefaultBJCFillColumns() : getDefaultBIGCFillColumns());

    // Determine total columns based on company
    // BJC: A-EF (136 columns), BIG C: A-CS (97 columns)
    const totalColumns = companyId === '1' ? 136 : 97;

    // Fill all columns with configured text and styling
    for (let colIndex = 1; colIndex <= totalColumns; colIndex++) {
      const cell = row1.getCell(colIndex);
      cell.value = row1Config.text;

      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: window.EXCEL_CONFIG?.COLORS?.[row1Config.style.fill.color] || EXCEL_COLORS.RED }
        },
        font: {
          name: row1Config.style.font.name,
          size: row1Config.style.font.size,
          bold: row1Config.style.font.bold,
          color: { argb: window.EXCEL_CONFIG?.COLORS?.[row1Config.style.font.color] || EXCEL_COLORS.WHITE }
        },
        alignment: {
          vertical: row1Config.style.alignment.vertical,
          horizontal: row1Config.style.alignment.horizontal
        },
        border: {
          top: { style: row1Config.style.border.style, color: { argb: window.EXCEL_CONFIG?.COLORS?.[row1Config.style.border.color] || EXCEL_COLORS.BLACK } },
          left: { style: row1Config.style.border.style, color: { argb: window.EXCEL_CONFIG?.COLORS?.[row1Config.style.border.color] || EXCEL_COLORS.BLACK } },
          bottom: { style: row1Config.style.border.style, color: { argb: window.EXCEL_CONFIG?.COLORS?.[row1Config.style.border.color] || EXCEL_COLORS.BLACK } },
          right: { style: row1Config.style.border.style, color: { argb: window.EXCEL_CONFIG?.COLORS?.[row1Config.style.border.color] || EXCEL_COLORS.BLACK } }
        }
      };
    }

    console.log(`     ✅ Red "${row1Config.text}" header added to ${totalColumns} columns`);
  }

  /**
   * ⭐ Highlight specific "Fill" columns with enhanced styling
   * @param {ExcelJS.Worksheet} worksheet - Worksheet instance
   * @param {string} companyId - Company ID ('1' or '2')
   */
  function highlightFillColumns(worksheet, companyId) {
    console.log(`  🎨 Applying "Fill" column highlights...`);

    // Get company-specific Row 1 configuration
    const companyRowStyles = getCompanyConfig(companyId, 'ROW_STYLES');
    const row1Config = companyRowStyles?.ROW1 || {
      style: {
        fill: { color: 'RED' },
        font: { name: 'Calibri', size: 11, bold: true, color: 'WHITE' },
        border: { style: 'thin', color: 'BLACK' },
        alignment: { horizontal: 'center', vertical: 'middle' }
      },
      highlightColumns: {
        font: { size: 12, bold: true },
        border: { style: 'medium' }
      }
    };

    // Get Fill columns configuration
    const fillColumns = window.EXCEL_CONFIG ?
      (companyId === '1' ? window.EXCEL_CONFIG.BJC_FILL_COLUMNS : window.EXCEL_CONFIG.BIGC_FILL_COLUMNS) :
      (companyId === '1' ? getDefaultBJCFillColumns() : getDefaultBIGCFillColumns());

    const row1 = worksheet.getRow(1);

    fillColumns.forEach(colLetter => {
      const cell = row1.getCell(colLetter);

      // Apply enhanced styling for highlighted "Fill" cells
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: window.EXCEL_CONFIG?.COLORS?.[row1Config.style.fill.color] || EXCEL_COLORS.RED }
        },
        font: {
          name: row1Config.style.font.name,
          size: row1Config.highlightColumns?.font?.size || row1Config.style.font.size,
          bold: row1Config.highlightColumns?.font?.bold !== undefined ? row1Config.highlightColumns.font.bold : row1Config.style.font.bold,
          color: { argb: window.EXCEL_CONFIG?.COLORS?.[row1Config.style.font.color] || EXCEL_COLORS.WHITE }
        },
        alignment: {
          vertical: row1Config.style.alignment.vertical,
          horizontal: row1Config.style.alignment.horizontal
        },
        border: {
          top: { style: row1Config.highlightColumns?.border?.style || row1Config.style.border.style, color: { argb: window.EXCEL_CONFIG?.COLORS?.[row1Config.style.border.color] || EXCEL_COLORS.BLACK } },
          left: { style: row1Config.highlightColumns?.border?.style || row1Config.style.border.style, color: { argb: window.EXCEL_CONFIG?.COLORS?.[row1Config.style.border.color] || EXCEL_COLORS.BLACK } },
          bottom: { style: row1Config.highlightColumns?.border?.style || row1Config.style.border.style, color: { argb: window.EXCEL_CONFIG?.COLORS?.[row1Config.style.border.color] || EXCEL_COLORS.BLACK } },
          right: { style: row1Config.highlightColumns?.border?.style || row1Config.style.border.style, color: { argb: window.EXCEL_CONFIG?.COLORS?.[row1Config.style.border.color] || EXCEL_COLORS.BLACK } }
        }
      };

      cell.value = 'Fill';
    });

    console.log(`     ✅ Highlighted ${fillColumns.length} "Fill" columns`);
  }

  /**
   * Add Row 2: Section headers with color zones
   * @param {ExcelJS.Worksheet} worksheet - Worksheet instance
   * @param {string} companyId - Company ID ('1' or '2')
   */
  function addSectionHeaders(worksheet, companyId) {
    console.log(`  📝 Adding section headers (Row 2)...`);

    // Get company-specific Row 2 configuration
    const companyRowStyles = getCompanyConfig(companyId, 'ROW_STYLES');
    const row2Config = companyRowStyles?.ROW2 || { height: 30 };

    const row2 = worksheet.getRow(2);
    row2.height = row2Config.height;

    if (companyId === '1') {
      // BJC Section Headers
      addBJCSectionHeaders(worksheet, row2, companyId);
    } else {
      // BIG C Section Headers
      addBIGCSectionHeaders(worksheet, row2, companyId);
    }

    console.log(`     ✅ Section headers added`);
  }

  /**
   * Add BJC section headers
   * @param {ExcelJS.Worksheet} worksheet - Worksheet instance
   * @param {ExcelJS.Row} row2 - Row 2 instance
   */
  function addBJCSectionHeaders(worksheet, row2, companyId) {
    // Get company-specific Row 2 configuration
    const companyRowStyles = getCompanyConfig(companyId, 'ROW_STYLES');
    const row2Config = companyRowStyles?.ROW2 || {
      height: 30,
      style: {
        font: { name: 'Tahoma', size: 11, bold: true },
        border: { style: 'thin', color: 'BLACK' },
        alignment: { horizontal: 'center', vertical: 'middle', wrapText: true }
      }
    };

    // Get section header cells configuration from config
    const sectionHeaderCells = window.EXCEL_CONFIG?.BJC_SECTION_HEADER_CELLS || [];

    sectionHeaderCells.forEach(section => {
      // Parse range to get start and end columns (e.g., 'AC2:BW2')
      const [startCell, endCell] = section.range.split(':');
      const startCol = startCell.replace(/[0-9]/g, ''); // 'AC'
      const endCol = endCell.replace(/[0-9]/g, '');     // 'BW'
      const rowNum = parseInt(startCell.replace(/[A-Z]/g, '')); // 2

      // Convert column letters to numbers
      const startColNum = worksheet.getColumn(startCol).number;
      const endColNum = worksheet.getColumn(endCol).number;

      // Loop through each column and set individual cell values (no merge)
      for (let colNum = startColNum; colNum <= endColNum; colNum++) {
        const cell = worksheet.getRow(rowNum).getCell(colNum);

        cell.value = section.value;
        cell.style = {
          fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: window.EXCEL_CONFIG?.COLORS?.[section.color] || EXCEL_COLORS[section.color] }
          },
          font: {
            name: row2Config.style.font.name,
            size: row2Config.style.font.size,
            bold: row2Config.style.font.bold,
            color: { argb: window.EXCEL_CONFIG?.COLORS?.[section.fontColor] || EXCEL_COLORS[section.fontColor] }
          },
          alignment: {
            vertical: row2Config.style.alignment.vertical,
            horizontal: row2Config.style.alignment.horizontal,
            wrapText: row2Config.style.alignment.wrapText
          },
          border: {
            top: { style: row2Config.style.border.style, color: { argb: window.EXCEL_CONFIG?.COLORS?.[row2Config.style.border.color] || EXCEL_COLORS.BLACK } },
            left: { style: row2Config.style.border.style, color: { argb: window.EXCEL_CONFIG?.COLORS?.[row2Config.style.border.color] || EXCEL_COLORS.BLACK } },
            bottom: { style: row2Config.style.border.style, color: { argb: window.EXCEL_CONFIG?.COLORS?.[row2Config.style.border.color] || EXCEL_COLORS.BLACK } },
            right: { style: row2Config.style.border.style, color: { argb: window.EXCEL_CONFIG?.COLORS?.[row2Config.style.border.color] || EXCEL_COLORS.BLACK } }
          }
        };
      }
    });
  }

  /**
   * Add BIG C section headers
   * @param {ExcelJS.Worksheet} worksheet - Worksheet instance
   * @param {ExcelJS.Row} row2 - Row 2 instance
   */
  function addBIGCSectionHeaders(worksheet, row2, companyId) {
    // Get company-specific Row 2 configuration
    const companyRowStyles = getCompanyConfig(companyId, 'ROW_STYLES');
    const row2Config = companyRowStyles?.ROW2 || {
      height: 30,
      style: {
        font: { name: 'Tahoma', size: 11, bold: true },
        border: { style: 'thin', color: 'BLACK' },
        alignment: { horizontal: 'center', vertical: 'middle', wrapText: true }
      }
    };

    // Get section header cells configuration from config
    const sectionHeaderCells = window.EXCEL_CONFIG?.BIGC_SECTION_HEADER_CELLS || [];

    sectionHeaderCells.forEach(section => {
      // Parse range to get start and end columns (e.g., 'AC2:BC2')
      const [startCell, endCell] = section.range.split(':');
      const startCol = startCell.replace(/[0-9]/g, ''); // 'AC'
      const endCol = endCell.replace(/[0-9]/g, '');     // 'BC'
      const rowNum = parseInt(startCell.replace(/[A-Z]/g, '')); // 2

      // Convert column letters to numbers
      const startColNum = worksheet.getColumn(startCol).number;
      const endColNum = worksheet.getColumn(endCol).number;

      // Loop through each column and set individual cell values (no merge)
      for (let colNum = startColNum; colNum <= endColNum; colNum++) {
        const cell = worksheet.getRow(rowNum).getCell(colNum);

        cell.value = section.value;
        cell.style = {
          fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: window.EXCEL_CONFIG?.COLORS?.[section.color] || EXCEL_COLORS[section.color] }
          },
          font: {
            name: row2Config.style.font.name,
            size: row2Config.style.font.size,
            bold: row2Config.style.font.bold,
            color: { argb: window.EXCEL_CONFIG?.COLORS?.[section.fontColor] || EXCEL_COLORS[section.fontColor] }
          },
          alignment: {
            vertical: row2Config.style.alignment.vertical,
            horizontal: row2Config.style.alignment.horizontal,
            wrapText: row2Config.style.alignment.wrapText
          },
          border: {
            top: { style: row2Config.style.border.style, color: { argb: window.EXCEL_CONFIG?.COLORS?.[row2Config.style.border.color] || EXCEL_COLORS.BLACK } },
            left: { style: row2Config.style.border.style, color: { argb: window.EXCEL_CONFIG?.COLORS?.[row2Config.style.border.color] || EXCEL_COLORS.BLACK } },
            bottom: { style: row2Config.style.border.style, color: { argb: window.EXCEL_CONFIG?.COLORS?.[row2Config.style.border.color] || EXCEL_COLORS.BLACK } },
            right: { style: row2Config.style.border.style, color: { argb: window.EXCEL_CONFIG?.COLORS?.[row2Config.style.border.color] || EXCEL_COLORS.BLACK } }
          }
        };
      }
    });
  }
  // ══════════════════════════════════════════════════════════════════════════
  // 📊 COLUMN HEADERS
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Add column headers to worksheet (Rows 3-4)
   * @param {ExcelJS.Worksheet} worksheet - Worksheet instance
   * @param {string} companyId - Company ID ('1' or '2')
   */
  function addColumnHeaders(worksheet, companyId) {
    console.log(`  📝 Adding column headers...`);

    // Get company-specific Row 3 & Row 4 configuration
    const companyRowStyles = getCompanyConfig(companyId, 'ROW_STYLES');
    const row3Config = companyRowStyles?.ROW3 || { height: 25 };
    const row4Config = companyRowStyles?.ROW4 || {
      height: 25,
      style: {
        font: { name: 'Tahoma', size: 11, bold: true, color: 'BLACK' },
        fill: { default: 'LIGHT_GRAY', highlight: 'YELLOW' },
        border: { style: 'thin', color: 'BLACK' },
        alignment: { horizontal: 'center', vertical: 'middle', wrapText: true }
      }
    };

    // Get column mapping from config
    const columnMapping = window.EXCEL_CONFIG ?
      (companyId === '1' ? window.EXCEL_CONFIG.BJC_COLUMN_MAPPING : window.EXCEL_CONFIG.BIGC_COLUMN_MAPPING) :
      null;

    if (!columnMapping) {
      console.warn(`     ⚠️ Column mapping not found for company ${companyId}`);
      console.log(`     ℹ️ Integrate with budget.plan.excel.config.js for full mapping`);
      return;
    }

    // Row 3: Leave empty (for spacing)
    const row3 = worksheet.getRow(3);
    row3.height = row3Config.height;

    // Row 4: Column headers
    const row4 = worksheet.getRow(4);
    row4.height = row4Config.height;

    // Iterate through all columns in mapping
    Object.keys(columnMapping).forEach(colLetter => {
      const colConfig = columnMapping[colLetter];

      // Set column width if specified
      const colIndex = getColumnIndex(colLetter);
      const col = worksheet.getColumn(colIndex);
      if (colConfig.width) {
        col.width = colConfig.width;
      }

      // Create header cell in Row 4 only
      const headerCell = row4.getCell(colLetter);

      // Set header text
      if (colConfig.header) {
        headerCell.value = colConfig.header;
      } else if (colConfig.field) {
        // Use field name as fallback
        headerCell.value = colConfig.field;
      }

      // Apply header styling with config-based values
      const headerFont = {
        name: row4Config.style.font.name,
        size: row4Config.style.font.size,
        bold: row4Config.style.font.bold,
        color: { argb: window.EXCEL_CONFIG?.COLORS?.[row4Config.style.font.color] || EXCEL_COLORS.BLACK }
      };

      const fillColorKey = colConfig.highlight === 'yellow' ?
        row4Config.style.fill.highlight :
        row4Config.style.fill.default;

      const headerFill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: window.EXCEL_CONFIG?.COLORS?.[fillColorKey] || EXCEL_COLORS.LIGHT_GRAY }
      };

      headerCell.font = headerFont;
      headerCell.fill = headerFill;
      headerCell.alignment = {
        horizontal: row4Config.style.alignment.horizontal,
        vertical: row4Config.style.alignment.vertical,
        wrapText: row4Config.style.alignment.wrapText
      };
      headerCell.border = {
        top: { style: row4Config.style.border.style, color: { argb: window.EXCEL_CONFIG?.COLORS?.[row4Config.style.border.color] || EXCEL_COLORS.BLACK } },
        left: { style: row4Config.style.border.style, color: { argb: window.EXCEL_CONFIG?.COLORS?.[row4Config.style.border.color] || EXCEL_COLORS.BLACK } },
        bottom: { style: row4Config.style.border.style, color: { argb: window.EXCEL_CONFIG?.COLORS?.[row4Config.style.border.color] || EXCEL_COLORS.BLACK } },
        right: { style: row4Config.style.border.style, color: { argb: window.EXCEL_CONFIG?.COLORS?.[row4Config.style.border.color] || EXCEL_COLORS.BLACK } }
      };
    });

    console.log(`     ✅ Column headers added (Row 4 only)`);
  }

  /**
   * Convert column letter to index (A=1, B=2, ..., Z=26, AA=27, etc.)
   * @param {string} letter - Column letter
   * @returns {number} - Column index
   */
  function getColumnIndex(letter) {
    let index = 0;
    for (let i = 0; i < letter.length; i++) {
      index = index * 26 + letter.charCodeAt(i) - 64;
    }
    return index;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 📊 DATA ROWS
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Add data rows to worksheet
   * @param {ExcelJS.Worksheet} worksheet - Worksheet instance
   * @param {Array} rows - Array of row data objects
   * @param {string} companyId - Company ID ('1' or '2')
   */
  function addDataRows(worksheet, rows, companyId) {
    console.log(`  📊 Adding ${rows.length} data rows...`);

    if (rows.length === 0) {
      console.log(`     ⚠️ No rows to add`);
      return;
    }

    // Get column mapping from config
    const columnMapping = window.EXCEL_CONFIG ?
      (companyId === '1' ? window.EXCEL_CONFIG.BJC_COLUMN_MAPPING : window.EXCEL_CONFIG.BIGC_COLUMN_MAPPING) :
      null;

    if (!columnMapping) {
      console.warn(`     ⚠️ Column mapping not found for company ${companyId}`);
      return;
    }

    // Start from row 5 (after headers)
    const startRowIndex = 5;

    rows.forEach((rowData, index) => {
      const rowIndex = startRowIndex + index;
      const excelRow = worksheet.getRow(rowIndex);
      excelRow.height = 18;

      // Iterate through all columns in mapping
      Object.keys(columnMapping).forEach(colLetter => {
        const colConfig = columnMapping[colLetter];
        const cell = excelRow.getCell(colLetter);

        // Get value from row data
        let value = null;

        if (colConfig.computed && colConfig.field === 'nonExec') {
          // 🧮 COMPUTED FIELD: Non-Exc = If Executive = 'N' Then 'Y' Else ''
          const executive = rowData['executive'];
          value = (executive === 'N') ? 'Y' : '';
        } else if (colConfig.field && rowData[colConfig.field] !== undefined) {
          value = rowData[colConfig.field];
        } else if (colConfig.value !== undefined) {
          // Fixed value
          value = colConfig.value;
        }

        // Set cell value
        if (value !== null && value !== undefined) {
          cell.value = value;
        }

        // Apply formatting based on data type
        const format = colConfig.format || 'text';
        const dataFormat = window.EXCEL_CONFIG?.DATA_FORMATS?.[format] || '@';
        const alignment = window.EXCEL_CONFIG?.ALIGNMENT_CONFIGS?.[format] ||
                         { horizontal: 'left', vertical: 'middle' };

        cell.numFmt = dataFormat;
        cell.alignment = alignment;

        // Apply borders
        cell.border = {
          top: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
          left: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
          bottom: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
          right: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } }
        };

        // Apply highlight if specified
        if (colConfig.highlight === 'yellow') {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: EXCEL_COLORS.YELLOW }
          };
        }
      });
    });

    console.log(`     ✅ Added ${rows.length} data rows (rows ${startRowIndex}-${startRowIndex + rows.length - 1})`);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ✨ SPECIAL FEATURES
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Apply freeze panes
   * @param {ExcelJS.Worksheet} worksheet - Worksheet instance
   */
  function applyFreezePanes(worksheet) {
    console.log(`  ❄️ Applying freeze panes...`);

    worksheet.views = [
      {
        state: 'frozen',
        xSplit: 3,    // Freeze first 3 columns
        ySplit: 4,    // Freeze first 4 rows (headers)
        topLeftCell: 'D5',
        activeCell: 'D5'
      }
    ];

    console.log(`     ✅ Freeze panes applied (3 cols, 4 rows)`);
  }

  /**
   * Apply borders to all cells
   * @param {ExcelJS.Worksheet} worksheet - Worksheet instance
   */
  function applyBorders(worksheet) {
    console.log(`  🔲 Applying borders...`);

    // Get the actual used range
    const lastRow = worksheet.lastRow?.number || 4;
    const lastColumn = worksheet.lastColumn?.number || 150;

    console.log(`     📏 Range: Rows 1-${lastRow}, Columns 1-${lastColumn}`);

    // Apply thin black borders to all used cells
    for (let rowIndex = 1; rowIndex <= lastRow; rowIndex++) {
      const row = worksheet.getRow(rowIndex);

      for (let colIndex = 1; colIndex <= lastColumn; colIndex++) {
        const cell = row.getCell(colIndex);

        // Only apply borders if cell has content or is in header rows
        if (cell.value !== null && cell.value !== undefined && cell.value !== '' || rowIndex <= 4) {
          cell.border = {
            top: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
            left: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
            bottom: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
            right: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } }
          };
        }
      }
    }

    console.log(`     ✅ Borders applied to ${lastRow} rows x ${lastColumn} columns`);
  }

  /**
   * Apply AutoFilter to Row 4 (Column Headers)
   * @param {ExcelJS.Worksheet} worksheet - Worksheet instance
   * @param {string} companyId - Company ID ('1' for BJC, '2' for BIG C)
   */
  function applyAutoFilter(worksheet, companyId) {
    console.log(`  🔽 Applying AutoFilter to Row 4...`);

    // Determine last column based on company
    // BJC: A-EF (136 columns), BIG C: A-CS (97 columns)
    const lastColumn = companyId === '1' ? 'EF' : 'CS';
    const filterRange = `A4:${lastColumn}4`;

    // Apply autoFilter to column headers row
    worksheet.autoFilter = filterRange;

    console.log(`     ✅ AutoFilter applied: ${filterRange} (${companyId === '1' ? '136' : '97'} columns)`);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 💾 FILE GENERATION & DOWNLOAD
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Generate Excel file and trigger download
   * @param {ExcelJS.Workbook} workbook - Workbook instance
   * @param {string} filename - Output filename
   * @returns {Promise<void>}
   */
  async function downloadExcelFile(workbook, filename) {
    console.log(`  💾 Generating Excel file...`);

    try {
      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Create Blob
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log(`     ✅ File downloaded: ${filename}`);
      console.log(`     📊 File size: ${formatFileSize(buffer.byteLength)}`);

    } catch (error) {
      console.error(`     ❌ Error generating file:`, error);
      throw error;
    }
  }

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted size string
   */
  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 🎨 CELL RANGE STYLING
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Apply cell range styles from configuration
   * @param {ExcelJS.Worksheet} worksheet - Worksheet instance
   * @param {string} companyId - Company ID ('1' or '2')
   */
  function applyCellRangeStyles(worksheet, companyId) {
    console.log(`  🎨 Applying cell range styles...`);

    const rangeStyles = getCompanyConfig(companyId, 'CELL_RANGE_STYLES') || [];

    if (rangeStyles.length === 0) {
      console.log(`     ℹ️ No cell range styles configured`);
      return;
    }

    let totalCellsStyled = 0;

    rangeStyles.forEach((rangeConfig, index) => {
      try {
        // Parse range (e.g., 'A1:C5' -> {start: {row: 1, col: 1}, end: {row: 5, col: 3}})
        const range = parseRange(rangeConfig.range);
        let cellsInRange = 0;

        // Iterate through all cells in range
        for (let row = range.start.row; row <= range.end.row; row++) {
          for (let col = range.start.col; col <= range.end.col; col++) {
            const cell = worksheet.getCell(row, col);

            // Apply value if specified
            if (rangeConfig.value !== undefined) {
              cell.value = rangeConfig.value;
            }

            // Apply styles
            if (rangeConfig.style) {
              applyStyleToCell(cell, rangeConfig.style);
            }

            cellsInRange++;
            totalCellsStyled++;
          }
        }

        console.log(`     ✅ Range ${index + 1}/${rangeStyles.length}: ${rangeConfig.range} (${cellsInRange} cells)`);

      } catch (error) {
        console.warn(`     ⚠️ Failed to apply style to range ${rangeConfig.range}:`, error.message);
      }
    });

    console.log(`     ✅ Total: ${totalCellsStyled} cells styled from ${rangeStyles.length} ranges`);
  }

  /**
   * Parse Excel range string to coordinates
   * @param {string} rangeString - e.g., 'A1:C5'
   * @returns {Object} {start: {row, col}, end: {row, col}}
   */
  function parseRange(rangeString) {
    const [startCell, endCell] = rangeString.split(':');

    return {
      start: parseCellAddress(startCell),
      end: parseCellAddress(endCell || startCell) // Support single cell (A1 = A1:A1)
    };
  }

  /**
   * Parse cell address to row/col numbers
   * @param {string} address - e.g., 'A1', 'AB10'
   * @returns {Object} {row: number, col: number}
   */
  function parseCellAddress(address) {
    const match = address.match(/^([A-Z]+)(\d+)$/);
    if (!match) throw new Error(`Invalid cell address: ${address}`);

    const colLetter = match[1];
    const rowNumber = parseInt(match[2]);

    // Convert column letter to number (A=1, B=2, ..., Z=26, AA=27)
    let colNumber = 0;
    for (let i = 0; i < colLetter.length; i++) {
      colNumber = colNumber * 26 + colLetter.charCodeAt(i) - 64;
    }

    return { row: rowNumber, col: colNumber };
  }

  /**
   * Apply style configuration to a cell
   * @param {ExcelJS.Cell} cell - Cell instance
   * @param {Object} styleConfig - Style configuration object
   */
  function applyStyleToCell(cell, styleConfig) {
    // Apply fill color
    if (styleConfig.fill?.color) {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: window.EXCEL_CONFIG?.COLORS?.[styleConfig.fill.color] ||
                 EXCEL_COLORS[styleConfig.fill.color] ||
                 styleConfig.fill.color
        }
      };
    }

    // Apply font
    if (styleConfig.font) {
      const currentFont = cell.font || {};
      cell.font = {
        name: styleConfig.font.name !== undefined ? styleConfig.font.name : currentFont.name || 'Calibri',
        size: styleConfig.font.size !== undefined ? styleConfig.font.size : currentFont.size || 11,
        bold: styleConfig.font.bold !== undefined ? styleConfig.font.bold : currentFont.bold,
        italic: styleConfig.font.italic !== undefined ? styleConfig.font.italic : currentFont.italic,
        color: styleConfig.font.color ?
          { argb: window.EXCEL_CONFIG?.COLORS?.[styleConfig.font.color] ||
                  EXCEL_COLORS[styleConfig.font.color] ||
                  styleConfig.font.color } :
          currentFont.color
      };
    }

    // Apply border
    if (styleConfig.border) {
      const borderStyle = {
        style: styleConfig.border.style || 'thin',
        color: {
          argb: window.EXCEL_CONFIG?.COLORS?.[styleConfig.border.color] ||
                 EXCEL_COLORS[styleConfig.border.color] ||
                 styleConfig.border.color ||
                 EXCEL_COLORS.BLACK
        }
      };

      cell.border = {
        top: borderStyle,
        left: borderStyle,
        bottom: borderStyle,
        right: borderStyle
      };
    }

    // Apply alignment
    if (styleConfig.alignment) {
      const currentAlignment = cell.alignment || {};
      cell.alignment = {
        horizontal: styleConfig.alignment.horizontal !== undefined ?
          styleConfig.alignment.horizontal :
          currentAlignment.horizontal || 'left',
        vertical: styleConfig.alignment.vertical !== undefined ?
          styleConfig.alignment.vertical :
          currentAlignment.vertical || 'middle',
        wrapText: styleConfig.alignment.wrapText !== undefined ?
          styleConfig.alignment.wrapText :
          currentAlignment.wrapText
      };
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 🔧 UTILITY FUNCTIONS
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Get default BJC Fill columns (fallback if config not loaded)
   * Last column: EF (136) - removed columns >= EG (137+)
   * @returns {Array<string>} Array of column letters
   */
  function getDefaultBJCFillColumns() {
    return [
      'A', 'B', 'E', 'H', 'I',
      'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
      'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN',
      'BO', 'BP', 'BQ', 'BR', 'BS', 'BT', 'BU', 'BV', 'BW', 'BX', 'BY', 'BZ', 'CA', 'CB', 'CC', 'CD', 'CE', 'CF',
      'CO', 'CP', 'CQ', 'CR', 'CS', 'CT', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DA', 'DB', 'DC', 'DD', 'DE', 'DF',
      'DG', 'DH', 'DI', 'DJ', 'DK', 'DL', 'DM', 'DN', 'DO', 'DP', 'DQ', 'DR', 'DS', 'DT', 'DU', 'DV', 'DW', 'DX',
      'DY', 'DZ', 'EA', 'EB', 'EC', 'ED', 'EE', 'EF'
      // Removed: EG and beyond (columns 137+)
    ];
  }

  /**
   * Get default BIG C Fill columns (fallback if config not loaded)
   * Last column: CS (97) - removed columns >= CT (98+)
   * @returns {Array<string>} Array of column letters
   */
  function getDefaultBIGCFillColumns() {
    return [
      'A', 'B', 'E', 'H', 'I',
      'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
      'AF', 'AG',
      'BE', 'BF',
      'BX', 'BY', 'BZ', 'CA', 'CB', 'CC', 'CD', 'CE', 'CF', 'CG', 'CH', 'CI', 'CJ', 'CK', 'CL', 'CM', 'CN', 'CO', 'CP', 'CQ', 'CR', 'CS'
      // Removed: CT and beyond (columns 98+)
    ];
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 🚀 MAIN EXPORT FUNCTION
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Export Allocation Batch data to Excel
   * @param {Object} options - Export configuration
   * @param {string} options.companyId - '1' (BJC) or '2' (BIG C)
   * @param {Array} options.rows - Array of row data objects from collectRowData()
   * @param {string} options.filename - Output filename
   * @param {Object} [options.styling] - Optional custom styling config
   * @returns {Promise<void>}
   */
  async function exportAllocationToExcel(options) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📊 STARTING EXCEL EXPORT`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    const startTime = performance.now();

    try {
      // ──────────────────────────────────────────────────────────────────────
      // STEP 1: Validate
      // ──────────────────────────────────────────────────────────────────────
      console.log(`🔍 STEP 1: Validating...`);
      validateExcelJSLoaded();
      validateOptions(options);
      validateRowData(options.rows);
      console.log(`   ✅ Validation passed (${options.rows.length} rows)\n`);

      const { companyId, rows, filename } = options;
      const companyName = companyId === '1' ? 'BJC' : 'BIG C';

      // ──────────────────────────────────────────────────────────────────────
      // STEP 2: Create workbook
      // ──────────────────────────────────────────────────────────────────────
      console.log(`📚 STEP 2: Creating workbook...`);
      const workbook = createWorkbook();
      const worksheet = createWorksheet(workbook, 'Budget Planning');
      console.log(`   ✅ Workbook created\n`);

      // ──────────────────────────────────────────────────────────────────────
      // STEP 3: Add headers (with Fill highlight)
      // ──────────────────────────────────────────────────────────────────────
      console.log(`📝 STEP 3: Adding header rows...`);
      addRedFillHeader(worksheet, companyId);
      highlightFillColumns(worksheet, companyId);        // ⭐ Highlight Fill columns
      addSectionHeaders(worksheet, companyId);
      addColumnHeaders(worksheet, companyId);
      applyAutoFilter(worksheet, companyId);             // 🔽 Apply AutoFilter to Row 4
      console.log(`   ✅ Headers added with "Fill" highlights\n`);

      // ──────────────────────────────────────────────────────────────────────
      // STEP 4: Add data rows
      // ──────────────────────────────────────────────────────────────────────
      console.log(`📊 STEP 4: Adding data rows...`);
      addDataRows(worksheet, rows, companyId);
      console.log(`   ✅ ${rows.length} data rows processed\n`);

      // ──────────────────────────────────────────────────────────────────────
      // STEP 5: Apply special features
      // ──────────────────────────────────────────────────────────────────────
      console.log(`✨ STEP 5: Applying special features...`);
      applyFreezePanes(worksheet);
      applyBorders(worksheet);
      console.log(`   ✅ Special features applied\n`);

      // ──────────────────────────────────────────────────────────────────────
      // STEP 5.5: Apply cell range styles (Final Override)
      // ──────────────────────────────────────────────────────────────────────
      console.log(`🎨 STEP 5.5: Applying cell range styles...`);
      applyCellRangeStyles(worksheet, companyId);
      console.log(`   ✅ Cell range styles applied\n`);

      // ──────────────────────────────────────────────────────────────────────
      // STEP 6: Generate and download
      // ──────────────────────────────────────────────────────────────────────
      console.log(`💾 STEP 6: Generating file...`);
      await downloadExcelFile(workbook, filename);

      const endTime = performance.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`✅ EXPORT COMPLETED SUCCESSFULLY`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`🏢 Company: ${companyName} (${companyId})`);
      console.log(`📊 Rows exported: ${rows.length}`);
      console.log(`⏱️  Time taken: ${duration}s`);
      console.log(`📁 File: ${filename}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    } catch (error) {
      const endTime = performance.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.error(`❌ EXPORT FAILED`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.error(`⏱️  Failed after: ${duration}s`);
      console.error(`💥 Error:`, error.message);
      console.error(`📚 Stack:`, error.stack);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

      throw error;
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 🌐 EXPORT TO GLOBAL SCOPE
  // ══════════════════════════════════════════════════════════════════════════

  // Export main function
  window.exportAllocationToExcel = exportAllocationToExcel;

  // Export utility functions (for advanced usage)
  window.ExcelExportUtils = {
    validateExcelJSLoaded,
    createWorkbook,
    createWorksheet,
    downloadExcelFile,
    formatFileSize
  };

  console.log('✅ Budget Plan Excel Export Module loaded');
  console.log('   📦 Available: window.exportAllocationToExcel()');
  console.log('   🔧 Utils: window.ExcelExportUtils');

})();
