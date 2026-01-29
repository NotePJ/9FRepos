/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📊 BUDGET PE HEADCOUNT EXCEL EXPORT HANDLERS
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Purpose: Event handlers for Export Excel button in Budget PE HeadCount
 * - btnExportBudgetPEHeadCountExcel → Export PE HeadCount AG Grid
 * - Support hierarchical data export
 *
 * Dependencies:
 * - ExcelJS library (CDN)
 * - budget-pe-headcount.excel.config.js
 * - budget-pe-headcount.excel.export.js
 * - AG Grid API (window.budgetPEHeadcountGridApi)
 *
 * @version 1.0.0
 * @date 2025-11-26
 * @author SA Team
 */

(function() {
  'use strict';

  console.log('📊 Loading Budget PE HeadCount Excel Export Handlers...');

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
    return typeof window.exportPEHeadCountToExcel === 'function' &&
           typeof window.PE_HEADCOUNT_EXCEL_CONFIG !== 'undefined';
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 📊 AG GRID DATA COLLECTION - HIERARCHICAL SUPPORT
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Collect hierarchical data from window storage
   * NOTE: PE HeadCount uses hierarchical structure stored in window.budgetPEHeadcountFullData
   * @returns {Array} Array of row data objects with hierarchy
   */
  function collectHierarchicalData() {
    // Get full hierarchical data from window storage
    const fullData = window.budgetPEHeadcountFullData;

    if (!fullData || !Array.isArray(fullData)) {
      console.error('❌ Hierarchical data not available in window.budgetPEHeadcountFullData');
      return [];
    }

    console.log(`✅ Collected ${fullData.length} hierarchical rows from window storage`);
    console.log('   - Includes Level 0 (GROUP_TYPE), Level 1 (GROUPING_HEAD), Level 2 (GROUPING), Level 3 (Detail), and Grand Total');

    return fullData;
  }

  /**
   * Transform hierarchical data for Excel export
   * @param {Array} hierarchicalData - Raw hierarchical data
   * @param {string} companyId - Company ID
   * @returns {Array} Transformed data for Excel export
   */
  function transformHierarchicalDataForExport(hierarchicalData, companyId) {
    console.log(`🔄 Transforming ${hierarchicalData.length} hierarchical rows for company ${companyId}...`);

    return hierarchicalData.map(row => {
      // Create ORGANIZATION field from hierarchy structure
      let organizationValue = '';

      if (row._isGrandTotal) {
        organizationValue = `Grand Total: ${row.GROUP_TOTAL || ''}`;
      } else if (row._isGroup) {
        if (row._level === 0) {
          organizationValue = row.GROUP_TYPE || '';
        } else if (row._level === 1) {
          organizationValue = `  ${row.GROUPING_HEAD || ''}`;
        } else if (row._level === 2) {
          organizationValue = `    ${row.GROUPING || ''}`;
        }
      } else {
        // Detail row (Level 3)
        organizationValue = `      ${row.GROUPING || ''}`;
      }

      return {
        ...row,
        ORGANIZATION: organizationValue,
        companyId: companyId
      };
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 📤 EXPORT HANDLER
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Export PE HeadCount Grid to Excel
   */
  async function handlePEHeadCountGridExport() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 PE HEADCOUNT GRID EXPORT STARTED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const button = document.getElementById('btnExportBudgetPEHeadCountExcel');

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
      // STEP 3: VALIDATION - Hierarchical Data
      // ══════════════════════════════════════════════════════════════════════
      const fullData = window.budgetPEHeadcountFullData;
      if (!fullData || fullData.length === 0) {
        alert('No data to export. Please load data first by clicking Search.');
        console.warn('⚠️ No hierarchical data available');
        return;
      }
      console.log(`✅ Hierarchical data validated: ${fullData.length} rows`);

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

      // Collect hierarchical data
      const hierarchicalData = collectHierarchicalData();

      if (hierarchicalData.length === 0) {
        throw new Error('No hierarchical data found');
      }

      // Transform data for export
      const exportData = transformHierarchicalDataForExport(hierarchicalData, companyId);

      // ══════════════════════════════════════════════════════════════════════
      // STEP 6: GENERATE FILENAME
      // ══════════════════════════════════════════════════════════════════════
      const filename = `PE_HeadCount_${companyName}_${budgetYear}_${getCurrentDate()}.xlsx`;
      console.log(`📁 Filename: ${filename}`);

      // ══════════════════════════════════════════════════════════════════════
      // STEP 7: CALL EXPORT FUNCTION
      // ══════════════════════════════════════════════════════════════════════
      await window.exportPEHeadCountToExcel({
        companyId: companyId,
        rows: exportData,
        filename: filename
      });

      console.log('✅ PE HeadCount Grid export completed successfully');

      // Show success message
      alert(`Excel file exported successfully!\nFile: ${filename}\nRows: ${exportData.length} (including hierarchy)`);

    } catch (error) {
      console.error('❌ PE HeadCount Grid export failed:', error);
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

    const btnExport = document.getElementById('btnExportBudgetPEHeadCountExcel');
    if (btnExport) {
      btnExport.addEventListener('click', handlePEHeadCountGridExport);
      console.log('  ✅ Export button bound: #btnExportBudgetPEHeadCountExcel');
    } else {
      console.warn('  ⚠️  Export button not found: #btnExportBudgetPEHeadCountExcel');
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 🚀 INITIALIZATION
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Initialize export handlers when DOM is ready
   */
  function initialize() {
    console.log('🚀 Initializing PE HeadCount Excel Export Handlers...');

    // Check if export modules are loaded
    if (!areExportModulesLoaded()) {
      console.error('❌ Excel export modules not loaded');
      return;
    }

    // Bind button event
    bindExportButtonEvent();

    console.log('✅ PE HeadCount Excel Export Handlers initialized successfully');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 🌐 GLOBAL EXPORTS
  // ══════════════════════════════════════════════════════════════════════════

  // Export handlers for manual usage
  window.PEHeadCountExcelHandlers = {
    handlePEHeadCountGridExport,
    initialize
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    // DOM already loaded
    initialize();
  }

  console.log('✅ Budget PE HeadCount Excel Export Handlers loaded');
  console.log('   📦 Available: window.PEHeadCountExcelHandlers');

})();
