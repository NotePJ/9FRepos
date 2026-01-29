/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📊 BUDGET PE BONUS EXCEL EXPORT MODULE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Purpose: Export PE Bonus data to Excel with advanced styling
 * - Support BJC (CompanyId='1') and BIG C (CompanyId='2')
 * - Apply custom styling (colors, fonts, borders, merged cells)
 * - Include Grand Total row
 * - Generate Excel file using ExcelJS library
 *
 * Dependencies:
 * - ExcelJS (https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js)
 * - budget-pe-bonus.excel.config.js (configuration file)
 *
 * @version 1.0.0
 * @date 2025-11-06
 * @author SA Team
 */

(function() {
  'use strict';

  console.log('📊 Loading Budget PE Bonus Excel Export Module...');

  // ══════════════════════════════════════════════════════════════════════════
  // 🔍 VALIDATION FUNCTIONS
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Validate if ExcelJS library is loaded
   * @throws {Error} If ExcelJS is not available
   */
  function validateExcelJSLoaded() {
    if (typeof ExcelJS === 'undefined') {
      throw new Error('ExcelJS library not loaded. Please include ExcelJS script.');
    }
  }

  /**
   * Validate if configuration is loaded
   * @throws {Error} If configuration is not available
   */
  function validateConfigLoaded() {
    if (typeof window.PE_BONUS_EXCEL_CONFIG === 'undefined') {
      throw new Error('PE Bonus Excel configuration not loaded.');
    }
  }

  /**
   * Validate export options
   * @param {Object} options - Export options
   * @throws {Error} If validation fails
   */
  function validateOptions(options) {
    if (!options || typeof options !== 'object') {
      throw new Error('Invalid export options');
    }

    if (!options.companyId || (options.companyId !== '1' && options.companyId !== '2')) {
      throw new Error('Invalid company ID. Must be "1" (BJC) or "2" (BIG C)');
    }

    if (!Array.isArray(options.rows)) {
      throw new Error('Invalid rows data. Must be an array.');
    }

    if (!options.filename) {
      throw new Error('Filename is required');
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
    workbook.creator = 'Budget PE Bonus System';
    workbook.lastModifiedBy = 'Budget PE Bonus System';
    workbook.created = new Date();
    workbook.modified = new Date();

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
   * Add section headers (Row 1)
   * @param {ExcelJS.Worksheet} worksheet - Worksheet instance
   */
  function addSectionHeaders(worksheet) {
    console.log('  📝 Adding section headers (Row 1)...');

    const config = window.PE_BONUS_EXCEL_CONFIG;
    const row1 = worksheet.getRow(1);
    row1.height = 30;

    config.SECTION_HEADERS.forEach(section => {
      // Merge cells for section header
      worksheet.mergeCells(1, section.startCol, 1, section.endCol);

      const cell = worksheet.getCell(1, section.startCol);
      cell.value = section.text;

      // Apply styling
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: section.color }
      };
      cell.font = {
        ...config.FONTS.SECTION_HEADER,
        color: { argb: config.COLORS.WHITE }
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true
      };
      cell.border = {
        top: { style: 'thin', color: { argb: config.COLORS.BLACK } },
        left: { style: 'thin', color: { argb: config.COLORS.BLACK } },
        bottom: { style: 'thin', color: { argb: config.COLORS.BLACK } },
        right: { style: 'thin', color: { argb: config.COLORS.BLACK } }
      };
    });
  }

  /**
   * Add sub-section headers (Row 2) - for Historical years
   * @param {ExcelJS.Worksheet} worksheet - Worksheet instance
   */
  function addSubSectionHeaders(worksheet) {
    console.log('  📝 Adding sub-section headers (Row 2)...');

    const config = window.PE_BONUS_EXCEL_CONFIG;
    const row2 = worksheet.getRow(2);
    row2.height = 25;

    // Merge organization columns (1-9)
    worksheet.mergeCells(2, 1, 2, 9);
    const orgCell = worksheet.getCell(2, 1);
    orgCell.value = '';
    orgCell.style = config.STYLES.SUB_SECTION_HEADER;

    // Add historical year headers (each year spans 3 columns)
    config.SUB_SECTION_HEADERS.historicalYears.forEach(year => {
      worksheet.mergeCells(2, year.startCol, 2, year.endCol);
      const cell = worksheet.getCell(2, year.startCol);
      cell.value = year.text;
      cell.style = config.STYLES.SUB_SECTION_HEADER;
    });

    // Merge Budget 2025 columns (28-31)
    worksheet.mergeCells(2, 28, 2, 31);
    const budgetCell = worksheet.getCell(2, 28);
    budgetCell.value = '';
    budgetCell.style = config.STYLES.SUB_SECTION_HEADER;

    // Merge LE 2026 columns (32-47)
    worksheet.mergeCells(2, 32, 2, 47);
    const leCell = worksheet.getCell(2, 32);
    leCell.value = '';
    leCell.style = config.STYLES.SUB_SECTION_HEADER;

    // Merge Company 2026 columns (48-66)
    worksheet.mergeCells(2, 48, 2, 66);
    const companyCell = worksheet.getCell(2, 48);
    companyCell.value = '';
    companyCell.style = config.STYLES.SUB_SECTION_HEADER;
  }

  /**
   * Add column headers (Row 3)
   * @param {ExcelJS.Worksheet} worksheet - Worksheet instance
   */
  function addColumnHeaders(worksheet) {
    console.log('  📝 Adding column headers (Row 3)...');

    const config = window.PE_BONUS_EXCEL_CONFIG;
    const row3 = worksheet.getRow(3);
    row3.height = 35;

    // Add column headers
    config.COLUMNS.forEach((col, index) => {
      const cell = row3.getCell(index + 1);
      cell.value = col.header;
      cell.style = config.STYLES.COLUMN_HEADER;

      // Set column width
      worksheet.getColumn(index + 1).width = col.width;
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 📊 DATA ROWS
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Add data rows to worksheet
   * @param {ExcelJS.Worksheet} worksheet - Worksheet instance
   * @param {Array} rows - Array of row data objects
   */
  function addDataRows(worksheet, rows) {
    console.log(`  📝 Adding ${rows.length} data rows...`);

    const config = window.PE_BONUS_EXCEL_CONFIG;
    let currentRow = 4; // Start from row 4 (after headers)

    rows.forEach((rowData) => {
      const excelRow = worksheet.getRow(currentRow);

      config.COLUMNS.forEach((col, colIndex) => {
        const cell = excelRow.getCell(colIndex + 1);
        const value = rowData[col.field];

        // Set cell value
        if (value !== null && value !== undefined && value !== '') {
          if (col.format === 'currency' || col.format === 'number') {
            cell.value = parseFloat(value) || 0;
            cell.style = config.STYLES.DATA_NUMBER;
          } else {
            cell.value = value;
            cell.style = config.STYLES.DATA_TEXT;
          }
        } else {
          cell.value = '';
          cell.style = col.format === 'text' ? config.STYLES.DATA_TEXT : config.STYLES.DATA_NUMBER;
        }
      });

      currentRow++;
    });

    return currentRow;
  }

  /**
   * Add Grand Total row
   * @param {ExcelJS.Worksheet} worksheet - Worksheet instance
   * @param {Array} rows - Array of row data objects
   * @param {number} startRow - Row number to insert Grand Total
   */
  function addGrandTotalRow(worksheet, rows, startRow) {
    console.log('  📝 Adding Grand Total row...');

    const config = window.PE_BONUS_EXCEL_CONFIG;
    const totalRow = worksheet.getRow(startRow);
    totalRow.height = 25;

    config.COLUMNS.forEach((col, colIndex) => {
      const cell = totalRow.getCell(colIndex + 1);

      if (colIndex === 0) {
        // First column: "Grand Total" text
        cell.value = 'Grand Total';
        cell.style = config.STYLES.GRAND_TOTAL;
      } else if (col.format === 'currency' || col.format === 'number') {
        // Numeric columns: calculate sum
        const sum = rows.reduce((acc, row) => {
          const value = parseFloat(row[col.field]) || 0;
          return acc + value;
        }, 0);

        cell.value = sum;
        cell.style = {
          ...config.STYLES.GRAND_TOTAL,
          numFmt: '#,##0.00',
          alignment: {
            horizontal: 'right',
            vertical: 'middle'
          }
        };
      } else {
        // Text columns: empty
        cell.value = '';
        cell.style = config.STYLES.GRAND_TOTAL;
      }
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ✨ SPECIAL FEATURES
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Apply freeze panes (freeze first 3 rows and first 5 columns)
   * @param {ExcelJS.Worksheet} worksheet - Worksheet instance
   */
  function applyFreezePanes(worksheet) {
    console.log('  ❄️  Applying freeze panes...');

    // Freeze top 3 rows (headers) and left 5 columns
    worksheet.views = [
      {
        state: 'frozen',
        xSplit: 5, // Freeze first 5 columns
        ySplit: 3, // Freeze first 3 rows
        topLeftCell: 'F4',
        activeCell: 'F4'
      }
    ];
  }

  /**
   * Apply AutoFilter to Row 3 (Column Headers)
   * @param {ExcelJS.Worksheet} worksheet - Worksheet instance
   */
  function applyAutoFilter(worksheet) {
    console.log('  🔍 Applying AutoFilter...');

    const config = window.PE_BONUS_EXCEL_CONFIG;
    const lastCol = config.COLUMNS.length;

    // Apply filter to row 3 (column headers)
    worksheet.autoFilter = {
      from: { row: 3, column: 1 },
      to: { row: 3, column: lastCol }
    };
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
    console.log(`  💾 Generating Excel file: ${filename}...`);

    try {
      // Generate Excel file buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Create blob
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

      console.log(`  ✅ File downloaded: ${filename} (${formatFileSize(buffer.byteLength)})`);
    } catch (error) {
      console.error('  ❌ Failed to generate Excel file:', error);
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
    if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 🚀 MAIN EXPORT FUNCTION
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Export PE Bonus data to Excel
   * @param {Object} options - Export configuration
   * @param {string} options.companyId - '1' (BJC) or '2' (BIG C)
   * @param {Array} options.rows - Array of row data objects
   * @param {string} options.filename - Output filename
   * @returns {Promise<void>}
   */
  async function exportPEBonusToExcel(options) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 PE BONUS EXCEL EXPORT STARTED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
      // ══════════════════════════════════════════════════════════════════════
      // STEP 1: VALIDATION
      // ══════════════════════════════════════════════════════════════════════
      console.log('🔍 Step 1: Validating dependencies...');
      validateExcelJSLoaded();
      validateConfigLoaded();
      validateOptions(options);
      console.log('  ✅ All validations passed\n');

      // ══════════════════════════════════════════════════════════════════════
      // STEP 2: WORKBOOK CREATION
      // ══════════════════════════════════════════════════════════════════════
      console.log('🔍 Step 2: Creating workbook...');
      const workbook = createWorkbook();
      const companyName = options.companyId === '1' ? 'BJC' : 'BIG C';
      const worksheet = createWorksheet(workbook, `PE Bonus ${companyName}`);
      console.log(`  ✅ Workbook created: ${companyName}\n`);

      // ══════════════════════════════════════════════════════════════════════
      // STEP 3: HEADER ROWS
      // ══════════════════════════════════════════════════════════════════════
      console.log('🔍 Step 3: Adding header rows...');
      addSectionHeaders(worksheet);
      addSubSectionHeaders(worksheet);
      addColumnHeaders(worksheet);
      console.log('  ✅ Headers added\n');

      // ══════════════════════════════════════════════════════════════════════
      // STEP 4: DATA ROWS
      // ══════════════════════════════════════════════════════════════════════
      console.log('🔍 Step 4: Adding data rows...');
      const nextRow = addDataRows(worksheet, options.rows);
      console.log(`  ✅ ${options.rows.length} data rows added\n`);

      // ══════════════════════════════════════════════════════════════════════
      // STEP 5: GRAND TOTAL ROW
      // ══════════════════════════════════════════════════════════════════════
      console.log('🔍 Step 5: Adding Grand Total row...');
      addGrandTotalRow(worksheet, options.rows, nextRow);
      console.log('  ✅ Grand Total row added\n');

      // ══════════════════════════════════════════════════════════════════════
      // STEP 6: SPECIAL FEATURES
      // ══════════════════════════════════════════════════════════════════════
      console.log('🔍 Step 6: Applying special features...');
      applyFreezePanes(worksheet);
      applyAutoFilter(worksheet);
      console.log('  ✅ Freeze panes and AutoFilter applied\n');

      // ══════════════════════════════════════════════════════════════════════
      // STEP 7: FILE DOWNLOAD
      // ══════════════════════════════════════════════════════════════════════
      console.log('🔍 Step 7: Generating Excel file...');
      await downloadExcelFile(workbook, options.filename);
      console.log('  ✅ File download complete\n');

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ PE BONUS EXCEL EXPORT COMPLETED');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
      console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ PE BONUS EXCEL EXPORT FAILED');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error(error);
      throw error;
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 🌐 EXPORT TO GLOBAL SCOPE
  // ══════════════════════════════════════════════════════════════════════════

  // Export main function
  window.exportPEBonusToExcel = exportPEBonusToExcel;

  // Export utility functions (for advanced usage)
  window.PEBonusExcelUtils = {
    validateExcelJSLoaded,
    createWorkbook,
    createWorksheet,
    downloadExcelFile,
    formatFileSize
  };

  console.log('✅ Budget PE Bonus Excel Export Module loaded');
  console.log('   📦 Available: window.exportPEBonusToExcel()');
  console.log('   🔧 Utils: window.PEBonusExcelUtils');

})();
