/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📊 BUDGET PLAN EXCEL EXPORT HANDLERS
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Purpose: Event handlers for Export Excel buttons in Budget Planning
 * - btnExportBudgetExcel  → Export Budget AG Grid
 * - btnExportMasterExcel  → Export Master Grid
 * - btnExportDetailExcel  → Export Detail Grid
 *
 * Dependencies:
 * - ExcelJS library (CDN)
 * - budget.plan.excel.config.js
 * - budget.plan.excel.export.js
 * - AG Grid APIs (gridApi, masterGridApi, detailGridApi)
 *
 * @version 1.0.0
 * @date 2025-11-03
 * @author SA Team
 */

(function() {
  'use strict';

  console.log('📊 Loading Budget Plan Excel Export Handlers...');

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
    return typeof window.exportAllocationToExcel === 'function' &&
           typeof window.EXCEL_CONFIG !== 'undefined';
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 📊 AG GRID DATA COLLECTION
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Collect all row data from AG Grid
   * @param {Object} gridApi - AG Grid API instance
   * @returns {Array} Array of row data objects
   */
  function collectGridData(gridApi) {
    if (!gridApi) {
      console.error('❌ Grid API not available');
      return [];
    }

    const rowData = [];

    // Get all rows from grid
    gridApi.forEachNode((node) => {
      if (node.data) {
        rowData.push(node.data);
      }
    });

    console.log(`✅ Collected ${rowData.length} rows from AG Grid`);
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

    // This is a pass-through for now
    // In the future, you may need to transform field names or structure
    // to match the Excel column mappings in budget.plan.excel.config.js

    return gridData.map(row => {
      // Add company ID to each row
      return {
        ...row,
        companyId: companyId
      };
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 📤 EXPORT HANDLERS
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Export Budget Grid to Excel
   */
  async function handleBudgetGridExport() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 BUDGET GRID EXPORT STARTED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const button = document.getElementById('btnExportBudgetExcel');

    try {
      // ══════════════════════════════════════════════════════════════════════
      // STEP 1: VALIDATION - Year Filter
      // ══════════════════════════════════════════════════════════════════════
      const yearsFilter = document.getElementById('yearsFilter');
      if (!yearsFilter || !yearsFilter.value) {
        console.warn('⚠️ Year filter not selected');
        window.showWarningModal('กรุณาเลือกปีก่อนทำการ Export');
        return;
      }
      console.log(`✅ Year filter validated: ${yearsFilter.value}`);

      // ══════════════════════════════════════════════════════════════════════
      // STEP 2: VALIDATION - Grid Data
      // ══════════════════════════════════════════════════════════════════════
      // Get grid API first (before showing loading)
      const gridApi = window.getGridApi ? window.getGridApi() : null;
      if (!gridApi) {
        console.warn('⚠️ Budget Grid API is not available');
        window.showWarningModal('ไม่พบข้อมูล Grid กรุณาโหลดข้อมูลก่อน');
        return;
      }

      // Check if grid has data
      const rowCount = gridApi.getDisplayedRowCount();
      if (rowCount === 0) {
        console.warn('⚠️ No data in grid');
        window.showWarningModal('ไม่มีข้อมูลให้ Export กรุณาโหลดข้อมูลก่อน');
        return;
      }
      console.log(`✅ Grid data validated: ${rowCount} rows`);

      // ══════════════════════════════════════════════════════════════════════
      // STEP 3: UPDATE EXCEL CONFIG WITH SELECTED YEAR
      // ══════════════════════════════════════════════════════════════════════
      console.log(`🔄 Updating Excel configuration for year ${yearsFilter.value}...`);
      if (window.updateBudgetYearExcel) {
        window.updateBudgetYearExcel(yearsFilter.value);
      } else {
        console.warn('⚠️ updateBudgetYearExcel function not available');
      }

      // Show loading
      showButtonLoading(button);

      // Validate dependencies
      if (!isExcelJSLoaded()) {
        throw new Error('ExcelJS library is not loaded');
      }

      if (!areExportModulesLoaded()) {
        throw new Error('Export modules are not loaded');
      }

      // Get company ID
      const companyId = getCurrentCompanyId();
      const companyName = getCompanyName(companyId);

      console.log(`🏢 Company: ${companyName} (${companyId})`);

      // Collect grid data
      const gridData = collectGridData(gridApi);

      if (gridData.length === 0) {
        alert('⚠️ No data to export. Please load budget data first.');
        return;
      }

      // Transform data for export
      const exportData = transformGridDataForExport(gridData, companyId);

      // Generate filename
      const filename = `Budget_${companyName}_${getCurrentDate()}.xlsx`;

      console.log(`📁 Filename: ${filename}`);

      // Call export function
      await window.exportAllocationToExcel({
        companyId: companyId,
        rows: exportData,
        filename: filename
      });

      console.log('✅ Budget Grid export completed successfully');

    } catch (error) {
      console.error('❌ Budget Grid export failed:', error);
      alert(`Export failed: ${error.message}`);
    } finally {
      hideButtonLoading(button);
    }
  }

  /**
   * Export Master Grid to Excel
   */
  async function handleMasterGridExport() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 MASTER GRID EXPORT STARTED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const button = document.getElementById('btnExportMasterExcel');

    try {
      // ══════════════════════════════════════════════════════════════════════
      // STEP 1: VALIDATION - Year Filter
      // ══════════════════════════════════════════════════════════════════════
      const yearsFilter = document.getElementById('yearsFilter');
      if (!yearsFilter || !yearsFilter.value) {
        console.warn('⚠️ Year filter not selected');
        window.showWarningModal('กรุณาเลือกปีก่อนทำการ Export');
        return;
      }
      console.log(`✅ Year filter validated: ${yearsFilter.value}`);

      // ══════════════════════════════════════════════════════════════════════
      // STEP 2: VALIDATION - Grid Data
      // ══════════════════════════════════════════════════════════════════════
      // Get grid API first
      const masterGridApi = window.getMasterGridApi ? window.getMasterGridApi() : null;
      if (!masterGridApi) {
        console.warn('⚠️ Master Grid API is not available');
        window.showWarningModal('ไม่พบข้อมูล Grid กรุณาโหลดข้อมูลก่อน');
        return;
      }

      // Check if grid has data
      const rowCount = masterGridApi.getDisplayedRowCount();
      if (rowCount === 0) {
        console.warn('⚠️ No data in master grid');
        window.showWarningModal('ไม่มีข้อมูลให้ Export กรุณาโหลดข้อมูลก่อน');
        return;
      }
      console.log(`✅ Master grid data validated: ${rowCount} rows`);

      // ══════════════════════════════════════════════════════════════════════
      // STEP 3: UPDATE EXCEL CONFIG WITH SELECTED YEAR
      // ══════════════════════════════════════════════════════════════════════
      console.log(`🔄 Updating Excel configuration for year ${yearsFilter.value}...`);
      if (window.updateBudgetYearExcel) {
        window.updateBudgetYearExcel(yearsFilter.value);
      } else {
        console.warn('⚠️ updateBudgetYearExcel function not available');
      }

      // Show loading
      showButtonLoading(button);

      // Validate dependencies
      if (!isExcelJSLoaded()) {
        throw new Error('ExcelJS library is not loaded');
      }

      if (!areExportModulesLoaded()) {
        throw new Error('Export modules are not loaded');
      }

      // Get company ID
      const companyId = getCurrentCompanyId();
      const companyName = getCompanyName(companyId);

      console.log(`🏢 Company: ${companyName} (${companyId})`);

      // Collect grid data
      const gridData = collectGridData(masterGridApi);

      if (gridData.length === 0) {
        alert('⚠️ No data to export. Please load master data first.');
        return;
      }

      // Transform data for export
      const exportData = transformGridDataForExport(gridData, companyId);

      // Generate filename
      const filename = `Budget_Master_${companyName}_${getCurrentDate()}.xlsx`;

      console.log(`📁 Filename: ${filename}`);

      // Call export function
      await window.exportAllocationToExcel({
        companyId: companyId,
        rows: exportData,
        filename: filename
      });

      console.log('✅ Master Grid export completed successfully');

    } catch (error) {
      console.error('❌ Master Grid export failed:', error);
      alert(`Export failed: ${error.message}`);
    } finally {
      hideButtonLoading(button);
    }
  }

  /**
   * Export Detail Grid to Excel
   */
  async function handleDetailGridExport() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 DETAIL GRID EXPORT STARTED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const button = document.getElementById('btnExportDetailExcel');

    try {
      // ══════════════════════════════════════════════════════════════════════
      // STEP 1: VALIDATION - Year Filter
      // ══════════════════════════════════════════════════════════════════════
      const yearsFilter = document.getElementById('yearsFilter');
      if (!yearsFilter || !yearsFilter.value) {
        console.warn('⚠️ Year filter not selected');
        window.showWarningModal('กรุณาเลือกปีก่อนทำการ Export');
        return;
      }
      console.log(`✅ Year filter validated: ${yearsFilter.value}`);

      // ══════════════════════════════════════════════════════════════════════
      // STEP 2: VALIDATION - Grid Data
      // ══════════════════════════════════════════════════════════════════════
      // Get grid API first
      const detailGridApi = window.getDetailGridApi ? window.getDetailGridApi() : null;
      if (!detailGridApi) {
        console.warn('⚠️ Detail Grid API is not available');
        window.showWarningModal('ไม่พบข้อมูล Grid กรุณาโหลดข้อมูลก่อน');
        return;
      }

      // Check if grid has data
      const rowCount = detailGridApi.getDisplayedRowCount();
      if (rowCount === 0) {
        console.warn('⚠️ No data in detail grid');
        window.showWarningModal('ไม่มีข้อมูลให้ Export กรุณาโหลดข้อมูลก่อน');
        return;
      }
      console.log(`✅ Detail grid data validated: ${rowCount} rows`);

      // ══════════════════════════════════════════════════════════════════════
      // STEP 3: UPDATE EXCEL CONFIG WITH SELECTED YEAR
      // ══════════════════════════════════════════════════════════════════════
      console.log(`🔄 Updating Excel configuration for year ${yearsFilter.value}...`);
      if (window.updateBudgetYearExcel) {
        window.updateBudgetYearExcel(yearsFilter.value);
      } else {
        console.warn('⚠️ updateBudgetYearExcel function not available');
      }

      // Show loading
      showButtonLoading(button);

      // Validate dependencies
      if (!isExcelJSLoaded()) {
        throw new Error('ExcelJS library is not loaded');
      }

      if (!areExportModulesLoaded()) {
        throw new Error('Export modules are not loaded');
      }

      // Get company ID
      const companyId = getCurrentCompanyId();
      const companyName = getCompanyName(companyId);

      console.log(`🏢 Company: ${companyName} (${companyId})`);

      // Collect grid data
      const gridData = collectGridData(detailGridApi);

      if (gridData.length === 0) {
        alert('⚠️ No data to export. Please select a cost center first.');
        return;
      }

      // Transform data for export
      const exportData = transformGridDataForExport(gridData, companyId);

      // Generate filename
      const filename = `Budget_Detail_${companyName}_${getCurrentDate()}.xlsx`;

      console.log(`📁 Filename: ${filename}`);

      // Call export function
      await window.exportAllocationToExcel({
        companyId: companyId,
        rows: exportData,
        filename: filename
      });

      console.log('✅ Detail Grid export completed successfully');

    } catch (error) {
      console.error('❌ Detail Grid export failed:', error);
      alert(`Export failed: ${error.message}`);
    } finally {
      hideButtonLoading(button);
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 🎯 EVENT BINDING
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Bind export button click events
   */
  function bindExportButtonEvents() {
    console.log('🔗 Binding export button events...');

    // Budget Grid Export Button
    const btnBudgetExport = document.getElementById('btnExportBudgetExcel');
    if (btnBudgetExport) {
      btnBudgetExport.addEventListener('click', handleBudgetGridExport);
      console.log('   ✅ Budget Grid export handler bound');
    } else {
      console.warn('   ⚠️ btnExportBudgetExcel not found');
    }

    // Master Grid Export Button
    const btnMasterExport = document.getElementById('btnExportMasterExcel');
    if (btnMasterExport) {
      btnMasterExport.addEventListener('click', handleMasterGridExport);
      console.log('   ✅ Master Grid export handler bound');
    } else {
      console.warn('   ⚠️ btnExportMasterExcel not found');
    }

    // Detail Grid Export Button
    const btnDetailExport = document.getElementById('btnExportDetailExcel');
    if (btnDetailExport) {
      btnDetailExport.addEventListener('click', handleDetailGridExport);
      console.log('   ✅ Detail Grid export handler bound');
    } else {
      console.warn('   ⚠️ btnExportDetailExcel not found');
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 🚀 INITIALIZATION
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Initialize export handlers when DOM is ready
   */
  function initialize() {
    console.log('🚀 Initializing Excel Export Handlers...');

    // Check if export modules are loaded
    if (!areExportModulesLoaded()) {
      console.error('❌ Export modules not loaded. Make sure budget.plan.excel.export.js and budget.plan.excel.config.js are included.');
      return;
    }

    // Bind button events
    bindExportButtonEvents();

    console.log('✅ Excel Export Handlers initialized successfully');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 🌐 GLOBAL EXPORTS
  // ══════════════════════════════════════════════════════════════════════════

  // Export handlers for manual usage
  window.BudgetExcelHandlers = {
    handleBudgetGridExport,
    handleMasterGridExport,
    handleDetailGridExport,
    initialize
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    // DOM already loaded
    initialize();
  }

  console.log('✅ Budget Plan Excel Export Handlers loaded');
  console.log('   📦 Available: window.BudgetExcelHandlers');

})();
