/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📊 BUDGET PE BONUS EXCEL EXPORT HANDLERS
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Purpose: Event handlers for Export Excel button in Budget PE Bonus
 * - btnExportBudgetPEBonusExcel → Export PE Bonus AG Grid
 *
 * Dependencies:
 * - ExcelJS library (CDN)
 * - budget-pe-bonus.excel.config.js
 * - budget-pe-bonus.excel.export.js
 * - AG Grid API (window.budgetPEBonusGridApi)
 *
 * @version 1.0.0
 * @date 2025-11-06
 * @author SA Team
 */

(function() {
  'use strict';

  console.log('📊 Loading Budget PE Bonus Excel Export Handlers...');

  // ══════════════════════════════════════════════════════════════════════════
  // 🔧 UTILITY FUNCTIONS
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Get current company ID from filter
   * @returns {string} Company ID ('1' for BJC, '2' for BIG C)
   */
  function getCurrentCompanyId() {
    const companySelect = document.getElementById('companyFilter');
    return companySelect ? companySelect.value : '1';
  }

  /**
   * Get current budget year from filter
   * @returns {string} Budget year (e.g., '2026')
   */
  function getCurrentBudgetYear() {
    const yearSelect = document.getElementById('yearsFilter');
    return yearSelect ? yearSelect.value : new Date().getFullYear().toString();
  }

  /**
   * Get current date in format YYYY-MM-DD
   * @returns {string} Formatted date
   */
  function getCurrentDate() {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  }

  /**
   * Get company name from company ID
   * @param {string} companyId - Company ID
   * @returns {string} Company name
   */
  function getCompanyName(companyId) {
    return companyId === '1' ? 'BJC' : 'BIGC';
  }

  /**
   * Show loading indicator on button
   * @param {HTMLElement} button - Button element
   */
  function showButtonLoading(button) {
    if (!button) return;

    // Store original content
    button.dataset.originalHtml = button.innerHTML;

    // Show loading spinner
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Exporting...';
    button.disabled = true;
  }

  /**
   * Hide loading indicator on button
   * @param {HTMLElement} button - Button element
   */
  function hideButtonLoading(button) {
    if (!button) return;

    // Restore original content
    if (button.dataset.originalHtml) {
      button.innerHTML = button.dataset.originalHtml;
    }
    button.disabled = false;
  }

  /**
   * Check if ExcelJS is loaded
   * @returns {boolean} True if ExcelJS is available
   */
  function isExcelJSLoaded() {
    return typeof ExcelJS !== 'undefined';
  }

  /**
   * Check if Export modules are loaded
   * @returns {boolean} True if export modules are available
   */
  function areExportModulesLoaded() {
    return typeof window.exportPEBonusToExcel === 'function' &&
           typeof window.PE_BONUS_EXCEL_CONFIG !== 'undefined';
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 📊 AG GRID DATA COLLECTION
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Collect all row data from AG Grid (excluding pinned rows)
   * @param {Object} gridApi - AG Grid API instance
   * @returns {Array} Array of row data objects
   */
  function collectGridData(gridApi) {
    if (!gridApi) {
      console.error('❌ Grid API not available');
      return [];
    }

    const rowData = [];

    // Get all rows from grid (excluding pinned rows like Grand Total)
    gridApi.forEachNode((node) => {
      // Skip pinned rows (Grand Total)
      if (node.rowPinned) {
        return;
      }

      if (node.data) {
        rowData.push(node.data);
      }
    });

    console.log(`✅ Collected ${rowData.length} rows from AG Grid (excluding Grand Total)`);
    return rowData;
  }

  /**
   * Transform AG Grid data to Excel export format
   * @param {Array} gridData - Raw data from AG Grid
   * @param {string} companyId - Company ID
   * @returns {Array} Transformed data for Excel export
   */
  function transformGridDataForExport(gridData, companyId) {
    console.log(`🔄 Transforming ${gridData.length} rows for company ${companyId}...`);

    // Pass-through - data structure matches Excel column mapping
    return gridData.map(row => {
      // Add company ID to each row if needed
      return {
        ...row,
        companyId: companyId
      };
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 📤 EXPORT HANDLER
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Export PE Bonus Grid to Excel
   */
  async function handlePEBonusGridExport() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 PE BONUS GRID EXPORT STARTED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const button = document.getElementById('btnExportBudgetPEBonusExcel');

    try {
      // ══════════════════════════════════════════════════════════════════════
      // STEP 1: VALIDATION - Year Filter
      // ══════════════════════════════════════════════════════════════════════
      const yearsFilter = document.getElementById('yearsFilter');
      if (!yearsFilter || !yearsFilter.value) {
        alert('Please select a Budget Year before exporting');
        return;
      }
      console.log(`✅ Year filter validated: ${yearsFilter.value}`);

      // ══════════════════════════════════════════════════════════════════════
      // STEP 2: VALIDATION - Company Filter
      // ══════════════════════════════════════════════════════════════════════
      const companyFilter = document.getElementById('companyFilter');
      if (!companyFilter || !companyFilter.value) {
        alert('Please select a Company before exporting');
        return;
      }
      console.log(`✅ Company filter validated: ${companyFilter.value}`);

      // ══════════════════════════════════════════════════════════════════════
      // STEP 3: VALIDATION - Grid Data
      // ══════════════════════════════════════════════════════════════════════
      // Get grid API first (before showing loading)
      const gridApi = window.budgetPEBonusGridApi;
      if (!gridApi) {
        alert('Grid not initialized. Please wait for grid to load.');
        console.error('❌ Grid API not available');
        return;
      }

      // Check if grid has data
      const rowCount = gridApi.getDisplayedRowCount();
      if (rowCount === 0) {
        alert('No data to export. Please load data first by clicking Search.');
        console.warn('⚠️ No data in grid');
        return;
      }
      console.log(`✅ Grid data validated: ${rowCount} rows`);

      // Show loading
      showButtonLoading(button);

      // ══════════════════════════════════════════════════════════════════════
      // STEP 4: VALIDATE DEPENDENCIES
      // ══════════════════════════════════════════════════════════════════════
      if (!isExcelJSLoaded()) {
        throw new Error('ExcelJS library not loaded. Please refresh the page.');
      }

      if (!areExportModulesLoaded()) {
        throw new Error('Excel export modules not loaded. Please refresh the page.');
      }

      // ══════════════════════════════════════════════════════════════════════
      // STEP 5: COLLECT & TRANSFORM DATA
      // ══════════════════════════════════════════════════════════════════════
      const companyId = getCurrentCompanyId();
      const companyName = getCompanyName(companyId);
      const budgetYear = getCurrentBudgetYear();

      console.log(`🏢 Company: ${companyName} (${companyId})`);
      console.log(`📅 Budget Year: ${budgetYear}`);

      // Collect grid data (excluding Grand Total row)
      const gridData = collectGridData(gridApi);

      if (gridData.length === 0) {
        throw new Error('No data rows found in grid');
      }

      // Transform data for export
      const exportData = transformGridDataForExport(gridData, companyId);

      // ══════════════════════════════════════════════════════════════════════
      // STEP 6: GENERATE FILENAME
      // ══════════════════════════════════════════════════════════════════════
      const filename = `PE_Bonus_${companyName}_${budgetYear}_${getCurrentDate()}.xlsx`;
      console.log(`📁 Filename: ${filename}`);

      // ══════════════════════════════════════════════════════════════════════
      // STEP 7: CALL EXPORT FUNCTION
      // ══════════════════════════════════════════════════════════════════════
      await window.exportPEBonusToExcel({
        companyId: companyId,
        rows: exportData,
        filename: filename
      });

      console.log('✅ PE Bonus Grid export completed successfully');

      // Show success message
      alert(`Excel file exported successfully!\nFile: ${filename}\nRows: ${exportData.length}`);

    } catch (error) {
      console.error('❌ PE Bonus Grid export failed:', error);
      alert(`Export failed: ${error.message}\n\nPlease check the console for details.`);
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
  function bindExportButtonEvent() {
    console.log('🔗 Binding export button event...');

    const btnExport = document.getElementById('btnExportBudgetPEBonusExcel');
    if (btnExport) {
      btnExport.addEventListener('click', handlePEBonusGridExport);
      console.log('  ✅ Export button bound: #btnExportBudgetPEBonusExcel');
    } else {
      console.warn('  ⚠️  Export button not found: #btnExportBudgetPEBonusExcel');
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 🚀 INITIALIZATION
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Initialize export handlers when DOM is ready
   */
  function initialize() {
    console.log('🚀 Initializing PE Bonus Excel Export Handlers...');

    // Check if export modules are loaded
    if (!areExportModulesLoaded()) {
      console.error('❌ Excel export modules not loaded');
      return;
    }

    // Bind button event
    bindExportButtonEvent();

    console.log('✅ PE Bonus Excel Export Handlers initialized successfully');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 🌐 GLOBAL EXPORTS
  // ══════════════════════════════════════════════════════════════════════════

  // Export handlers for manual usage
  window.PEBonusExcelHandlers = {
    handlePEBonusGridExport,
    initialize
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    // DOM already loaded
    initialize();
  }

  console.log('✅ Budget PE Bonus Excel Export Handlers loaded');
  console.log('   📦 Available: window.PEBonusExcelHandlers');

})();
