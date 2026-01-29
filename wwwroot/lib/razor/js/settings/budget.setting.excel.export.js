/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📊 SETTINGS EXCEL EXPORT MODULE (All-in-One)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Purpose: Export Settings AG Grid data to Excel with dynamic columns
 * - Simplified version for Settings module (no company/year filters)
 * - Dynamic column mapping from API
 * - Single grid support
 * - Clean styling (header + data only)
 *
 * Dependencies:
 * - ExcelJS (https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js)
 * - window.settingsGridApi (from budget.settings.manage.js)
 * - BudgetSettingsConfig (from budget.settings.config.js)
 *
 * @version 1.0.0
 * @date 2025-11-12
 * @author Ten (AI Developer)
 */

(function () {
    'use strict';

    console.log('📊 Loading Settings Excel Export Module...');

    // ══════════════════════════════════════════════════════════════════════════
    // 📚 CONSTANTS & CONFIGURATION
    // ══════════════════════════════════════════════════════════════════════════

    const EXCEL_COLORS = {
        WHITE: 'FFFFFFFF',
        BLACK: 'FF000000',
        LIGHT_GRAY: 'FFF2F2F2',
        DARK_GRAY: 'FFD9D9D9',
        BLUE: 'FF4472C4',
        GREEN: 'FF70AD47'
    };

    const FONT_CONFIG = {
        HEADER: {
            name: 'Calibri',
            size: 11,
            bold: true,
            color: EXCEL_COLORS.BLACK
        },
        DATA: {
            name: 'Calibri',
            size: 10,
            bold: false,
            color: EXCEL_COLORS.BLACK
        }
    };

    const DATA_FORMATS = {
        text: '@',
        number: '#,##0',
        decimal: '#,##0.00',
        percentage: '0.00%',
        date: 'dd/mm/yyyy',
        datetime: 'dd/mm/yyyy hh:mm',
        boolean: '@'
    };

    const ALIGNMENT_CONFIGS = {
        text: { horizontal: 'left', vertical: 'middle' },
        number: { horizontal: 'right', vertical: 'middle' },
        decimal: { horizontal: 'right', vertical: 'middle' },
        percentage: { horizontal: 'right', vertical: 'middle' },
        date: { horizontal: 'center', vertical: 'middle' },
        datetime: { horizontal: 'center', vertical: 'middle' },
        boolean: { horizontal: 'center', vertical: 'middle' }
    };

    // ══════════════════════════════════════════════════════════════════════════
    // 🔍 VALIDATION FUNCTIONS
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * ตรวจสอบว่า ExcelJS library ถูกโหลดหรือไม่
     */
    function validateExcelJSLoaded() {
        if (typeof ExcelJS === 'undefined') {
            throw new Error('ExcelJS library is not loaded. Please include ExcelJS library.');
        }
    }

    /**
     * ตรวจสอบว่า Grid API พร้อมใช้งานหรือไม่
     */
    function validateGridAPI() {
        if (!window.settingsGridApi) {
            throw new Error('Settings Grid API is not available. Please load grid data first.');
        }
    }

    /**
     * ตรวจสอบว่ามีข้อมูลใน Grid หรือไม่
     */
    function validateGridData() {
        const rowCount = window.settingsGridApi.getDisplayedRowCount();
        if (rowCount === 0) {
            throw new Error('No data to export. Please load data first.');
        }
        return rowCount;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 📊 DATA COLLECTION
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * รวบรวมข้อมูลทั้งหมดจาก AG Grid
     * @returns {Array} Array of row data objects
     */
    function collectGridData() {
        const rowData = [];

        window.settingsGridApi.forEachNode((node) => {
            if (node.data) {
                rowData.push(node.data);
            }
        });

        console.log(`✅ Collected ${rowData.length} rows from grid`);
        return rowData;
    }

    /**
     * รวบรวม column definitions จาก AG Grid
     * @returns {Array} Array of column definition objects
     */
    function collectColumnDefinitions() {
        const columnDefs = window.settingsGridApi.getColumnDefs();

        if (!columnDefs || columnDefs.length === 0) {
            throw new Error('No column definitions found in grid');
        }

        // Filter out Action column และคอลัมน์ที่ไม่ต้องการ export
        const exportColumns = columnDefs.filter(col => {
            return col.field && col.field !== 'actions';
        });

        console.log(`✅ Collected ${exportColumns.length} columns for export`);
        return exportColumns;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 📚 WORKBOOK CREATION
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * สร้าง Excel workbook พร้อม metadata
     */
    function createWorkbook() {
        const workbook = new ExcelJS.Workbook();

        workbook.creator = 'Budget Planning System - Settings';
        workbook.lastModifiedBy = 'Settings Manager';
        workbook.created = new Date();
        workbook.modified = new Date();

        return workbook;
    }

    /**
     * สร้าง worksheet พร้อม properties
     */
    function createWorksheet(workbook, sheetName) {
        const worksheet = workbook.addWorksheet(sheetName, {
            properties: {
                defaultColWidth: 15,
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
    // 🎨 HEADER GENERATION
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * เพิ่ม header row ลงใน worksheet
     * @param {ExcelJS.Worksheet} worksheet - Worksheet instance
     * @param {Array} columns - Column definitions
     */
    function addHeaderRow(worksheet, columns) {
        console.log('  📝 Adding header row...');

        const headerRow = worksheet.getRow(1);
        headerRow.height = 25;

        columns.forEach((col, index) => {
            const colIndex = index + 1;
            const cell = headerRow.getCell(colIndex);

            // Set header text
            cell.value = col.headerName || col.field;

            // Apply header styling
            cell.font = {
                name: FONT_CONFIG.HEADER.name,
                size: FONT_CONFIG.HEADER.size,
                bold: FONT_CONFIG.HEADER.bold,
                color: { argb: FONT_CONFIG.HEADER.color }
            };

            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: EXCEL_COLORS.LIGHT_GRAY }
            };

            cell.alignment = {
                horizontal: 'center',
                vertical: 'middle',
                wrapText: true
            };

            cell.border = {
                top: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
                left: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
                bottom: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
                right: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } }
            };

            // Set temporary column width (will be adjusted by auto-fit later)
            const column = worksheet.getColumn(colIndex);
            column.width = 15;
        });

        console.log(`     ✅ Header row added with ${columns.length} columns`);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 📊 DATA ROWS GENERATION
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * กำหนด data type จาก column definition
     * @param {Object} col - Column definition
     * @returns {string} Data type
     */
    function getDataType(col) {
        // ถ้ามี dataType ใน metadata ให้ใช้เลย
        if (col.dataType) {
            return col.dataType;
        }

        // ตรวจสอบจาก field name patterns
        const field = col.field.toLowerCase();

        if (field.includes('date') || field.includes('time')) {
            return 'date';
        }

        if (field.includes('amount') || field.includes('price') ||
            field.includes('cost') || field.includes('rate')) {
            return 'decimal';
        }

        if (field.includes('quantity') || field.includes('count') ||
            field.includes('id') || field.includes('no')) {
            return 'number';
        }

        if (field.includes('percent') || field.includes('ratio')) {
            return 'percentage';
        }

        if (field.includes('active') || field.includes('is')) {
            return 'boolean';
        }

        return 'text';
    }

    /**
     * Format ค่าข้อมูลตาม data type
     * @param {*} value - ค่าข้อมูล
     * @param {string} dataType - Data type
     * @returns {*} Formatted value
     */
    function formatCellValue(value, dataType) {
        if (value === null || value === undefined) {
            return '';
        }

        switch (dataType) {
            case 'boolean':
                return value ? 'Yes' : 'No';

            case 'date':
            case 'datetime':
                // ถ้าเป็น date string ให้แปลงเป็น Date object
                if (typeof value === 'string') {
                    const date = new Date(value);
                    return isNaN(date.getTime()) ? value : date;
                }
                return value;

            case 'number':
            case 'decimal':
            case 'percentage':
                // แปลงเป็นตัวเลข
                const num = parseFloat(value);
                return isNaN(num) ? value : num;

            default:
                return value;
        }
    }

    /**
     * เพิ่ม data rows ลงใน worksheet
     * @param {ExcelJS.Worksheet} worksheet - Worksheet instance
     * @param {Array} rows - Row data
     * @param {Array} columns - Column definitions
     */
    function addDataRows(worksheet, rows, columns) {
        console.log(`  📊 Adding ${rows.length} data rows...`);

        if (rows.length === 0) {
            console.log('     ⚠️ No rows to add');
            return;
        }

        const startRowIndex = 2; // เริ่มจาก row 2 (หลัง header)

        rows.forEach((rowData, rowIndex) => {
            const excelRowIndex = startRowIndex + rowIndex;
            const excelRow = worksheet.getRow(excelRowIndex);
            excelRow.height = 18;

            columns.forEach((col, colIndex) => {
                const cell = excelRow.getCell(colIndex + 1);
                const dataType = getDataType(col);

                // Get value from row data
                const rawValue = rowData[col.field];
                const formattedValue = formatCellValue(rawValue, dataType);

                // Set cell value
                cell.value = formattedValue;

                // Apply formatting
                const format = DATA_FORMATS[dataType] || DATA_FORMATS.text;
                const alignment = ALIGNMENT_CONFIGS[dataType] || ALIGNMENT_CONFIGS.text;

                cell.numFmt = format;
                cell.alignment = alignment;

                // Apply data font
                cell.font = {
                    name: FONT_CONFIG.DATA.name,
                    size: FONT_CONFIG.DATA.size,
                    bold: FONT_CONFIG.DATA.bold,
                    color: { argb: FONT_CONFIG.DATA.color }
                };

                // Apply borders
                cell.border = {
                    top: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
                    left: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
                    bottom: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } },
                    right: { style: 'thin', color: { argb: EXCEL_COLORS.BLACK } }
                };
            });
        });

        console.log(`     ✅ Added ${rows.length} data rows (rows ${startRowIndex}-${startRowIndex + rows.length - 1})`);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ✨ SPECIAL FEATURES
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Apply freeze panes (freeze header row)
     */
    function applyFreezePanes(worksheet) {
        console.log('  ❄️ Applying freeze panes...');

        worksheet.views = [
            {
                state: 'frozen',
                xSplit: 0,    // ไม่ freeze columns
                ySplit: 1,    // Freeze header row
                topLeftCell: 'A2',
                activeCell: 'A2'
            }
        ];

        console.log('     ✅ Freeze panes applied (header row)');
    }

    /**
     * Apply AutoFilter to header row
     */
    function applyAutoFilter(worksheet, columnCount) {
        console.log('  🔽 Applying AutoFilter...');

        // Convert column count to letter (1->A, 26->Z, 27->AA, etc.)
        const lastColLetter = getColumnLetter(columnCount);
        const filterRange = `A1:${lastColLetter}1`;

        worksheet.autoFilter = filterRange;

        console.log(`     ✅ AutoFilter applied: ${filterRange}`);
    }

    /**
     * Convert column number to letter
     * @param {number} colNum - Column number (1-based)
     * @returns {string} Column letter
     */
    function getColumnLetter(colNum) {
        let letter = '';
        while (colNum > 0) {
            const remainder = (colNum - 1) % 26;
            letter = String.fromCharCode(65 + remainder) + letter;
            colNum = Math.floor((colNum - 1) / 26);
        }
        return letter;
    }

    /**
     * Apply auto-fit column widths based on content
     * @param {ExcelJS.Worksheet} worksheet - Worksheet instance
     * @param {Array} columns - Column definitions
     * @param {Array} rows - Row data
     */
    function applyAutoFitColumns(worksheet, columns, rows) {
        console.log('  📏 Applying auto-fit column widths...');

        const MIN_WIDTH = 10;  // Minimum column width
        const MAX_WIDTH = 50;  // Maximum column width
        const PADDING = 3;     // Extra padding for borders and spacing

        columns.forEach((col, index) => {
            const colIndex = index + 1;
            const field = col.field;

            // Calculate header length
            const headerText = col.headerName || field;
            const headerLength = headerText.length;

            // Calculate max data length in this column
            let maxDataLength = 0;

            rows.forEach(row => {
                const value = row[field];
                let displayLength = 0;

                if (value === null || value === undefined) {
                    displayLength = 0;
                } else if (typeof value === 'boolean') {
                    displayLength = value ? 3 : 2; // "Yes" or "No"
                } else if (value instanceof Date) {
                    displayLength = 10; // "dd/mm/yyyy"
                } else if (typeof value === 'number') {
                    // Format with thousand separators
                    displayLength = value.toLocaleString('en-US').length;
                } else {
                    displayLength = String(value).length;
                }

                maxDataLength = Math.max(maxDataLength, displayLength);
            });

            // Calculate optimal width
            const contentLength = Math.max(headerLength, maxDataLength);
            const optimalWidth = contentLength + PADDING;

            // Apply min/max constraints
            const finalWidth = Math.min(Math.max(optimalWidth, MIN_WIDTH), MAX_WIDTH);

            // Set column width
            const column = worksheet.getColumn(colIndex);
            column.width = finalWidth;

            console.log(`     Column ${colIndex} (${field}): ${finalWidth} chars (header: ${headerLength}, data: ${maxDataLength})`);
        });

        console.log(`     ✅ Auto-fit applied to ${columns.length} columns`);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 💾 FILE GENERATION & DOWNLOAD
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Generate Excel file และ trigger download
     */
    async function downloadExcelFile(workbook, filename) {
        console.log('  💾 Generating Excel file...');

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
            console.error('     ❌ Error generating file:', error);
            throw error;
        }
    }

    /**
     * Format file size for display
     */
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 🔧 UTILITY FUNCTIONS
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Get current date in format YYYY-MM-DD
     */
    function getCurrentDate() {
        const now = new Date();
        return now.toISOString().slice(0, 10);
    }

    /**
     * Generate filename for export
     */
    function generateFilename() {
        const modelName = window.settingsConfig?.modelName || 'Settings';
        const displayName = window.settingsConfig?.displayName || modelName;
        const date = getCurrentDate();

        return `${displayName}_${date}.xlsx`;
    }

    /**
     * Show loading indicator on button
     */
    function showButtonLoading(button) {
        if (!button) return;

        button.dataset.originalHtml = button.innerHTML;
        button.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
        button.disabled = true;
        button.classList.add('exporting');
    }

    /**
     * Hide loading indicator on button
     */
    function hideButtonLoading(button) {
        if (!button) return;

        if (button.dataset.originalHtml) {
            button.innerHTML = button.dataset.originalHtml;
            delete button.dataset.originalHtml;
        }
        button.disabled = false;
        button.classList.remove('exporting');
    }

    /**
     * Show toast notification
     */
    function showToast(message, type = 'success') {
        const toastClass = type === 'success' ?
            'toast align-items-center text-white bg-success border-0' :
            'toast align-items-center text-white bg-danger border-0';

        const toastHtml = `
            <div class="${toastClass}" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-coreui-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;

        // Get or create toast container
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            toastContainer.style.zIndex = '9999';
            document.body.appendChild(toastContainer);
        }

        // Add toast
        const toastWrapper = document.createElement('div');
        toastWrapper.innerHTML = toastHtml;
        const toastElement = toastWrapper.firstElementChild;
        toastContainer.appendChild(toastElement);

        // Initialize and show toast
        if (typeof coreui !== 'undefined' && coreui.Toast) {
            const toast = new coreui.Toast(toastElement, {
                autohide: true,
                delay: 3000
            });
            toast.show();

            toastElement.addEventListener('hidden.coreui.toast', function () {
                toastElement.remove();
            });
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 🚀 MAIN EXPORT FUNCTION
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Export Settings Grid to Excel
     * Main entry point for export functionality
     */
    async function exportSettingsToExcel() {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 SETTINGS EXCEL EXPORT STARTED');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const startTime = performance.now();
        const button = document.getElementById('btnExportExcel');

        try {
            // ──────────────────────────────────────────────────────────────────
            // STEP 1: VALIDATION
            // ──────────────────────────────────────────────────────────────────
            console.log('🔍 STEP 1: Validating...');

            validateExcelJSLoaded();
            validateGridAPI();
            const rowCount = validateGridData();

            console.log(`   ✅ Validation passed (${rowCount} rows)\n`);

            // Show loading
            showButtonLoading(button);

            // ──────────────────────────────────────────────────────────────────
            // STEP 2: COLLECT DATA
            // ──────────────────────────────────────────────────────────────────
            console.log('📊 STEP 2: Collecting data...');

            const columns = collectColumnDefinitions();
            const rows = collectGridData();

            console.log(`   ✅ Collected ${columns.length} columns and ${rows.length} rows\n`);

            // ──────────────────────────────────────────────────────────────────
            // STEP 3: CREATE WORKBOOK
            // ──────────────────────────────────────────────────────────────────
            console.log('📚 STEP 3: Creating workbook...');

            const filename = generateFilename();
            const sheetName = window.settingsConfig?.displayName || 'Settings Data';

            const workbook = createWorkbook();
            const worksheet = createWorksheet(workbook, sheetName);

            console.log(`   ✅ Workbook created (${filename})\n`);

            // ──────────────────────────────────────────────────────────────────
            // STEP 4: ADD CONTENT
            // ──────────────────────────────────────────────────────────────────
            console.log('📝 STEP 4: Adding content...');

            addHeaderRow(worksheet, columns);
            addDataRows(worksheet, rows, columns);

            console.log('   ✅ Content added\n');

            // ──────────────────────────────────────────────────────────────────
            // STEP 5: APPLY FEATURES
            // ──────────────────────────────────────────────────────────────────
            console.log('✨ STEP 5: Applying features...');

            applyAutoFitColumns(worksheet, columns, rows);
            applyFreezePanes(worksheet);
            applyAutoFilter(worksheet, columns.length);

            console.log('   ✅ Features applied\n');

            // ──────────────────────────────────────────────────────────────────
            // STEP 6: DOWNLOAD
            // ──────────────────────────────────────────────────────────────────
            console.log('💾 STEP 6: Generating file...');

            await downloadExcelFile(workbook, filename);

            const endTime = performance.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);

            console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ EXPORT COMPLETED SUCCESSFULLY');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`📊 Rows exported: ${rows.length}`);
            console.log(`📋 Columns: ${columns.length}`);
            console.log(`⏱️  Time taken: ${duration}s`);
            console.log(`📁 File: ${filename}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

            // Show success notification
            showToast(`✅ Exported ${rows.length} rows successfully!`, 'success');

        } catch (error) {
            const endTime = performance.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);

            console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.error('❌ EXPORT FAILED');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.error(`⏱️  Failed after: ${duration}s`);
            console.error(`💥 Error:`, error.message);
            console.error(`📚 Stack:`, error.stack);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

            // Show error notification
            showToast(`❌ Export failed: ${error.message}`, 'error');

            throw error;

        } finally {
            hideButtonLoading(button);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 🎯 EVENT BINDING
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Bind export button click event
     */
    function bindExportButton() {
        console.log('🔗 Binding export button event...');

        const button = document.getElementById('btnExportExcel');
        if (button) {
            button.addEventListener('click', exportSettingsToExcel);
            console.log('   ✅ Export button handler bound');
        } else {
            console.warn('   ⚠️ btnExportExcel not found');
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 🚀 INITIALIZATION
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Initialize export module
     */
    function initializeExportModule() {
        console.log('🚀 Initializing Settings Excel Export Module...');

        // Check ExcelJS
        if (typeof ExcelJS === 'undefined') {
            console.error('❌ ExcelJS library not loaded');
            console.error('   Please include: <script src="https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js"></script>');
            return;
        }

        // Bind button
        bindExportButton();

        console.log('✅ Settings Excel Export Module initialized successfully');
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 🌐 GLOBAL EXPORTS
    // ══════════════════════════════════════════════════════════════════════════

    // Export main function
    window.exportSettingsToExcel = exportSettingsToExcel;

    // Export module object
    window.SettingsExcelExport = {
        export: exportSettingsToExcel,
        initialize: initializeExportModule
    };

    // ══════════════════════════════════════════════════════════════════════════
    // 🎯 AUTO-INITIALIZATION
    // ══════════════════════════════════════════════════════════════════════════

    // Auto-initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function () {
        // Delay initialization to ensure other modules are loaded
        setTimeout(() => {
            initializeExportModule();
        }, 500);
    });

    console.log('✅ Settings Excel Export Module loaded successfully');
    console.log('   📦 Available: window.exportSettingsToExcel()');
    console.log('   📦 Available: window.SettingsExcelExport');

})();
