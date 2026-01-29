/**
 * Budget PE Bonus Grid Configuration
 * Cost Center Summary Level Report (Read-Only)
 *
 * Purpose: Display PE Bonus summary data aggregated by Cost Center
 * Data Source:
 *   - BIG C (Company ID = 2): SP_REP_HC_PE_BY_COSTCENTER
 *   - BJC (Company ID = 1): SP_REP_HC_PE_BY_COSTCENTER_BJC
 *
 * Features:
 *   - 67 columns total (Organization + Historical + Budget + LE 2026 + Company 2026)
 *   - Grand Total row (sum of numeric columns)
 *   - Top 5 pinned columns (left-locked)
 *   - Multi-level grouped column headers
 *   - Export to Excel with formatting
 *   - Read-only (no edit functionality)
 *
 * Grid Structure:
 *   1. Organization (11 columns) - Basic Cost Center info
 *   2. Historical 2019-2024 (18 columns) - Actual FT, CT, PE for 6 years
 *   3. Budget 2025 (4 columns) - Budget FT, CT, Current PE, Current PE Bonus
 *   4. Legal Entity 2026 (17 columns) - LE projection columns
 *   5. Company 2026 (17 columns) - Company projection columns
 */

// ===== Data Storage =====
var rawData = [];
var masterData = [];
var grandTotalData = null;

// ===== AG Grid Column Definitions =====

/**
 * Base column definitions (shared properties)
 * Using AG Grid Community features only
 */
const baseColumnDefs = {
  sortable: true,
  filter: true,
  resizable: true,
  suppressMovable: false
  // menuTabs removed - Enterprise feature
};

/**
 * Numeric column formatter
 */
const numericFormatter = (params) => {
  if (params.value == null || params.value === '') return '';
  return Number(params.value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/**
 * Integer column formatter
 */
const integerFormatter = (params) => {
  if (params.value == null || params.value === '') return '';
  return Number(params.value).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

/**
 * Create Organization Columns (11 columns)
 * Pinned columns: BU_HEAD_SUP, BU_HEAD, DEPARTMENT, COST_CENTER, COST_CENTER_NAME_HR
 * Based on AG Grid PE Bonus Summary.md documentation
 *
 * ✅ Dynamic behavior based on companyId:
 *    - BJC (companyId=1): Hide BU_HEAD_SUP, BU_HEAD, DEPARTMENT; Move BU, COBU to front
 *    - BIG C (companyId=2): Show all columns in original order
 *
 * @param {string|number} companyId - Company ID (1=BJC, 2=BIG C)
 */
function createOrganizationColumns(companyId) {
  const isBJC = companyId === '1' || companyId === 1;

  // BJC (Company 1): BU and COBU first, hide 6 columns
  if (isBJC) {
    return [
      {
        headerName: 'BU',
        field: 'BU',
        width: 80,
        pinned: 'left',
        lockPinned: true,
        filter: 'agTextColumnFilter',
        ...baseColumnDefs
      },
      {
        headerName: 'COBU',
        field: 'COBU',
        width: 80,
        pinned: 'left',
        lockPinned: true,
        filter: 'agTextColumnFilter',
        ...baseColumnDefs
      },
      {
        headerName: 'Cost Center',
        field: 'COST_CENTER',
        width: 120,
        pinned: 'left',
        lockPinned: true,
        filter: 'agTextColumnFilter',
        ...baseColumnDefs
      },
      {
        headerName: 'Cost Center Name (HR)',
        field: 'COST_CENTER_NAME_HR',
        width: 200,
        pinned: 'left',
        lockPinned: true,
        cellClass: 'cell-wrap-text',
        autoHeight: false,
        filter: 'agTextColumnFilter',
        ...baseColumnDefs
      },
      // ❌ HIDDEN: Division (BJC only)
      // ❌ HIDDEN: Department (BJC only)
      // ❌ HIDDEN: Section (BJC only)
      // ❌ HIDDEN: BU Head Supervisor (BJC only)
      // ❌ HIDDEN: BU Head (BJC only)
      {
        headerName: 'Grouping',
        field: 'GROUPING',
        width: 120,
        filter: 'agTextColumnFilter',
        ...baseColumnDefs
      },
      {
        headerName: 'HRBP',
        field: 'HRBP',
        width: 100,
        filter: 'agTextColumnFilter',
        ...baseColumnDefs
      }
    ];
  }

  // BIG C (Company 2): Original order with all columns
  return [
    {
      headerName: 'BU Head Supervisor',
      field: 'BU_HEAD_SUP',
      width: 150,
      pinned: 'left',
      lockPinned: true,
      cellClass: 'cell-wrap-text',
      autoHeight: false,
      filter: 'agTextColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'BU Head',
      field: 'BU_HEAD',
      width: 150,
      pinned: 'left',
      lockPinned: true,
      cellClass: 'cell-wrap-text',
      autoHeight: false,
      filter: 'agTextColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'BU',
      field: 'BU',
      width: 80,
      filter: 'agTextColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'COBU',
      field: 'COBU',
      width: 80,
      filter: 'agTextColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'Department',
      field: 'DEPARTMENT',
      width: 120,
      pinned: 'left',
      lockPinned: true,
      filter: 'agTextColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'Cost Center',
      field: 'COST_CENTER',
      width: 120,
      pinned: 'left',
      lockPinned: true,
      filter: 'agTextColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'Cost Center Name (HR)',
      field: 'COST_CENTER_NAME_HR',
      width: 200,
      pinned: 'left',
      lockPinned: true,
      cellClass: 'cell-wrap-text',
      autoHeight: false,
      filter: 'agTextColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'Grouping',
      field: 'GROUPING',
      width: 120,
      filter: 'agTextColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'HRBP',
      field: 'HRBP',
      width: 100,
      filter: 'agTextColumnFilter',
      ...baseColumnDefs
    }
  ];
}

/**
 * Create Historical Columns (18 columns for 2019-2024)
 * Format: ACTUAL_FT_YYYY, ACTUAL_CT_YYYY, ACTUAL_PE_YYYY for each year
 * ✅ DYNAMIC: Generates columns from 2019 to (yearsFilter - 2)
 * @param {number} yearsFilter - Budget year filter (e.g., 2026 → generates 2019-2024)
 */
function createHistoricalColumns(yearsFilter = 2026) {
  const startYear = 2019;
  const endYear = yearsFilter - 2;
  const columns = [];

  for (let year = startYear; year <= endYear; year++) {
    columns.push(
      {
        headerName: `FT ${year}`,
        field: `ACTUAL_FT_${year}`,
        width: 100,
        type: 'numericColumn',
        valueFormatter: integerFormatter,
        cellStyle: { textAlign: 'right' },
        filter: 'agNumberColumnFilter',
        ...baseColumnDefs
      },
      {
        headerName: `CT ${year}`,
        field: `ACTUAL_CT_${year}`,
        width: 100,
        type: 'numericColumn',
        valueFormatter: integerFormatter,
        cellStyle: { textAlign: 'right' },
        filter: 'agNumberColumnFilter',
        ...baseColumnDefs
      },
      {
        headerName: `PE ${year}`,
        field: `ACTUAL_PE_${year}`,
        width: 120,
        type: 'numericColumn',
        valueFormatter: numericFormatter,
        cellStyle: { textAlign: 'right' },
        filter: 'agNumberColumnFilter',
        ...baseColumnDefs
      }
    );
  }

  return columns;
}

/**
 * Generate numeric field names dynamically based on yearsFilter
 * Used for Grand Total calculation
 * @param {number} yearsFilter - Budget year filter (e.g., 2026)
 * @param {boolean} isBJC - Whether company is BJC (affects Historical fields)
 * @returns {Array<string>} Array of numeric field names to sum
 */
function generateNumericFields(yearsFilter, isBJC = false) {
  const fields = [];
  const startYear = 2019;
  const endYear = yearsFilter - 2;
  const budgetYear = yearsFilter - 1;

  // Historical: 2019 to (yearsFilter - 2) - Skip for BJC
  if (!isBJC) {
    for (let year = startYear; year <= endYear; year++) {
      fields.push(
        `ACTUAL_FT_${year}`,
        `ACTUAL_CT_${year}`,
        `ACTUAL_PE_${year}`
      );
    }
  }

  // Budget: yearsFilter - 1
  fields.push(
    `BUDGET_FT_${budgetYear}`,
    `BUDGET_CT_${budgetYear}`,
    `CURRENT_PE_${budgetYear}`,
    `CURRENT_PE_BONUS_${budgetYear}`
  );

  // Legal Entity: No year suffix in field names
  fields.push(
    'ACTIVE_FT_LE', 'ACTIVE_CT_LE', 'ACTIVE_PE_LE',
    'VAC_FT_LE', 'VAC_CT_LE', 'VAC_PE_LE',
    'NEW_FT_LE', 'NEW_CT_LE', 'NEW_PE_LE',
    'SUM_FT_LE', 'SUM_CT_LE', 'SUM_PE_LE',
    'OT_LE', 'EB_LE', 'SUM_PE_OTEB_LE', 'SUM_PE_OTOTH_LE'
  );

  // Company: No year suffix in field names
  fields.push(
    'ACTIVE_FT', 'ACTIVE_CT', 'ACTIVE_PE',
    'VAC_FT', 'VAC_CT', 'VAC_PE',
    'NEW_FT', 'NEW_CT', 'NEW_PE',
    'SUM_FT', 'SUM_CT', 'SUM_PE',
    'OT', 'EB', 'SUM_PE_OTEB', 'SUM_PE_OTOTH'
  );

  return fields;
}

/**
 * Create Budget Columns (4 columns)
 * Based on AG Grid PE Bonus Summary.md documentation
 * ✅ DYNAMIC: Uses yearsFilter - 1 for column headers and field names
 * @param {number} yearsFilter - Budget year filter (e.g., 2026 → generates Budget 2025)
 */
function createBudgetColumns(yearsFilter = 2026) {
  const budgetYear = yearsFilter - 1;

  return [
    {
      headerName: `HC-FT ${budgetYear}`,
      field: `BUDGET_FT_${budgetYear}`,
      width: 100,
      type: 'numericColumn',
      valueFormatter: integerFormatter,
      cellStyle: { textAlign: 'right' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: `HC-CT ${budgetYear}`,
      field: `BUDGET_CT_${budgetYear}`,
      width: 100,
      type: 'numericColumn',
      valueFormatter: integerFormatter,
      cellStyle: { textAlign: 'right' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: `PE ${budgetYear}`,
      field: `CURRENT_PE_${budgetYear}`,
      width: 120,
      type: 'numericColumn',
      valueFormatter: numericFormatter,
      cellStyle: { textAlign: 'right' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: `PE+Bonus ${budgetYear}`,
      field: `CURRENT_PE_BONUS_${budgetYear}`,
      width: 140,
      type: 'numericColumn',
      valueFormatter: numericFormatter,
      cellStyle: { textAlign: 'right' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    }
  ];
}

/**
 * Create Legal Entity Columns (17 columns)
 * Based on AG Grid PE Bonus Summary.md documentation
 * ✅ DYNAMIC: Header name uses yearsFilter, field names unchanged (no year suffix)
 * @param {number} yearsFilter - Budget year filter (e.g., 2026 → "Legal Entity (LE) 2026")
 */
function createLEColumns(yearsFilter = 2026) {
  return [
    // {
    //   headerName: 'Budget Year',
    //   field: 'BUDGET_YEAR',
    //   width: 100,
    //   filter: 'agTextColumnFilter',
    //   ...baseColumnDefs
    // },
    // {
    //   headerName: 'Cost Center',
    //   field: 'COST_CENTER',
    //   width: 120,
    //   filter: 'agTextColumnFilter',
    //   ...baseColumnDefs
    // },
    {
      headerName: 'Actual FT LE',
      field: 'ACTIVE_FT_LE',
      width: 100,
      type: 'numericColumn',
      valueFormatter: integerFormatter,
      cellStyle: { textAlign: 'right' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'Actual CT LE',
      field: 'ACTIVE_CT_LE',
      width: 100,
      type: 'numericColumn',
      valueFormatter: integerFormatter,
      cellStyle: { textAlign: 'right' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'Actual PE LE',
      field: 'ACTIVE_PE_LE',
      width: 120,
      type: 'numericColumn',
      valueFormatter: numericFormatter,
      cellStyle: { textAlign: 'right' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'Vacant FT LE',
      field: 'VAC_FT_LE',
      width: 100,
      type: 'numericColumn',
      valueFormatter: integerFormatter,
      cellStyle: { textAlign: 'right' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'Vacant CT LE',
      field: 'VAC_CT_LE',
      width: 100,
      type: 'numericColumn',
      valueFormatter: integerFormatter,
      cellStyle: { textAlign: 'right' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'Vacant PE LE',
      field: 'VAC_PE_LE',
      width: 120,
      type: 'numericColumn',
      valueFormatter: numericFormatter,
      cellStyle: { textAlign: 'right' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'New FT LE',
      field: 'NEW_FT_LE',
      width: 100,
      type: 'numericColumn',
      valueFormatter: integerFormatter,
      cellStyle: { textAlign: 'right' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'New CT LE',
      field: 'NEW_CT_LE',
      width: 100,
      type: 'numericColumn',
      valueFormatter: integerFormatter,
      cellStyle: { textAlign: 'right' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'New PE LE',
      field: 'NEW_PE_LE',
      width: 120,
      type: 'numericColumn',
      valueFormatter: numericFormatter,
      cellStyle: { textAlign: 'right' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'OT LE',
      field: 'OT_LE',
      width: 120,
      type: 'numericColumn',
      valueFormatter: numericFormatter,
      cellStyle: { textAlign: 'right' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'EB LE',
      field: 'EB_LE',
      width: 120,
      type: 'numericColumn',
      valueFormatter: numericFormatter,
      cellStyle: { textAlign: 'right' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'Sum FT LE',
      field: 'SUM_FT_LE',
      width: 100,
      type: 'numericColumn',
      valueFormatter: integerFormatter,
      cellStyle: { textAlign: 'right', fontWeight: 'bold' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'Sum CT LE',
      field: 'SUM_CT_LE',
      width: 100,
      type: 'numericColumn',
      valueFormatter: integerFormatter,
      cellStyle: { textAlign: 'right', fontWeight: 'bold' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'Total PE LE',
      field: 'SUM_PE_LE',
      width: 120,
      type: 'numericColumn',
      valueFormatter: numericFormatter,
      cellStyle: { textAlign: 'right', fontWeight: 'bold' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'Sum PE+OT+EB LE',
      field: 'SUM_PE_OTEB_LE',
      width: 140,
      type: 'numericColumn',
      valueFormatter: numericFormatter,
      cellStyle: { textAlign: 'right', fontWeight: 'bold', backgroundColor: '#e3f2fd' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'Sum PE+OT+Other LE',
      field: 'SUM_PE_OTOTH_LE',
      width: 140,
      type: 'numericColumn',
      valueFormatter: numericFormatter,
      cellStyle: { textAlign: 'right', fontWeight: 'bold', backgroundColor: '#e3f2fd' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    }
  ];
}

/**
 * Create Company Columns (17 columns)
 * Based on AG Grid PE Bonus Summary.md documentation
 * ✅ DYNAMIC: Header name uses yearsFilter, field names unchanged (no year suffix)
 * @param {number} yearsFilter - Budget year filter (e.g., 2026 → "Budget 2026")
 */
function createCompanyColumns(yearsFilter = 2026) {
  return [
    // {
    //   headerName: 'Budget Year',
    //   field: 'BUDGET_YEAR',
    //   width: 100,
    //   filter: 'agTextColumnFilter',
    //   ...baseColumnDefs
    // },
    // {
    //   headerName: 'Cost Center',
    //   field: 'COST_CENTER',
    //   width: 120,
    //   filter: 'agTextColumnFilter',
    //   ...baseColumnDefs
    // },
    {
      headerName: 'Actual FT',
      field: 'ACTIVE_FT',
      width: 100,
      type: 'numericColumn',
      valueFormatter: integerFormatter,
      cellStyle: { textAlign: 'right' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'Actual CT',
      field: 'ACTIVE_CT',
      width: 100,
      type: 'numericColumn',
      valueFormatter: integerFormatter,
      cellStyle: { textAlign: 'right' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'Actual PE',
      field: 'ACTIVE_PE',
      width: 120,
      type: 'numericColumn',
      valueFormatter: numericFormatter,
      cellStyle: { textAlign: 'right' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'Vacant FT',
      field: 'VAC_FT',
      width: 100,
      type: 'numericColumn',
      valueFormatter: integerFormatter,
      cellStyle: { textAlign: 'right' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'Vacant CT',
      field: 'VAC_CT',
      width: 100,
      type: 'numericColumn',
      valueFormatter: integerFormatter,
      cellStyle: { textAlign: 'right' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'Vacant PE',
      field: 'VAC_PE',
      width: 120,
      type: 'numericColumn',
      valueFormatter: numericFormatter,
      cellStyle: { textAlign: 'right' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'New FT LE',
      field: 'NEW_FT_LE',
      width: 100,
      type: 'numericColumn',
      valueFormatter: integerFormatter,
      cellStyle: { textAlign: 'right' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'New CT LE',
      field: 'NEW_CT_LE',
      width: 100,
      type: 'numericColumn',
      valueFormatter: integerFormatter,
      cellStyle: { textAlign: 'right' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'New PE LE',
      field: 'NEW_PE_LE',
      width: 120,
      type: 'numericColumn',
      valueFormatter: numericFormatter,
      cellStyle: { textAlign: 'right' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'New FT',
      field: 'NEW_FT',
      width: 100,
      type: 'numericColumn',
      valueFormatter: integerFormatter,
      cellStyle: { textAlign: 'right' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'New CT',
      field: 'NEW_CT',
      width: 100,
      type: 'numericColumn',
      valueFormatter: integerFormatter,
      cellStyle: { textAlign: 'right' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'New PE',
      field: 'NEW_PE',
      width: 120,
      type: 'numericColumn',
      valueFormatter: numericFormatter,
      cellStyle: { textAlign: 'right' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'OT',
      field: 'OT',
      width: 120,
      type: 'numericColumn',
      valueFormatter: numericFormatter,
      cellStyle: { textAlign: 'right' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'EB',
      field: 'EB',
      width: 120,
      type: 'numericColumn',
      valueFormatter: numericFormatter,
      cellStyle: { textAlign: 'right' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'Sum FT',
      field: 'SUM_FT',
      width: 100,
      type: 'numericColumn',
      valueFormatter: integerFormatter,
      cellStyle: { textAlign: 'right', fontWeight: 'bold' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'Sum CT',
      field: 'SUM_CT',
      width: 100,
      type: 'numericColumn',
      valueFormatter: integerFormatter,
      cellStyle: { textAlign: 'right', fontWeight: 'bold' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'Total PE',
      field: 'SUM_PE',
      width: 120,
      type: 'numericColumn',
      valueFormatter: numericFormatter,
      cellStyle: { textAlign: 'right', fontWeight: 'bold' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'Sum PE+OT+EB',
      field: 'SUM_PE_OTEB',
      width: 140,
      type: 'numericColumn',
      valueFormatter: numericFormatter,
      cellStyle: { textAlign: 'right', fontWeight: 'bold', backgroundColor: '#e3f2fd' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    },
    {
      headerName: 'Sum PE+OT+Other',
      field: 'SUM_PE_OTOTH',
      width: 140,
      type: 'numericColumn',
      valueFormatter: numericFormatter,
      cellStyle: { textAlign: 'right', fontWeight: 'bold', backgroundColor: '#e3f2fd' },
      filter: 'agNumberColumnFilter',
      ...baseColumnDefs
    }
  ];
}

/**
 * Create complete column definitions with grouped headers
 *
 * ✅ Dynamic column definitions based on companyId and yearsFilter:
 *    - BJC (companyId=1): BU/COBU first, hide BU_HEAD_SUP/BU_HEAD/DEPARTMENT/DIVISION/SECTION/HISTORICAL
 *    - BIG C (companyId=2): Original order with all columns
 *    - yearsFilter: Controls year ranges for Historical, Budget, LE, and Company sections
 *
 * @param {string|number} companyId - Company ID (1=BJC, 2=BIG C)
 * @param {number} yearsFilter - Budget year filter (default: 2026)
 */
function createColumnDefs(companyId, yearsFilter = 2026) {
  const isBJC = companyId === '1' || companyId === 1;
  const budgetYear = yearsFilter - 1;
  const startYear = 2019;
  const endYear = yearsFilter - 2;

  return [
    // Organization columns (ungrouped, 5 pinned) - ✅ DYNAMIC based on companyId
    ...createOrganizationColumns(companyId),

    // Historical 2019-2024 (grouped by year) - ❌ HIDDEN for BJC
    ...(isBJC ? [] : [{
      headerName: `Historical Actual ${startYear}-${endYear}`,
      children: createHistoricalColumns(yearsFilter)
    }]),

    // Budget 2025 (grouped)
    {
      headerName: `Budget ${budgetYear}`,
      children: createBudgetColumns(yearsFilter)
    },

    // Legal Entity 2026 (grouped)
    {
      headerName: `Legal Entity (LE) ${yearsFilter}`,
      children: createLEColumns(yearsFilter)
    },

    // Company 2026 (grouped)
    {
      headerName: `Budget ${yearsFilter}`,
      children: createCompanyColumns(yearsFilter)
    }
  ];
}

// ===== Grand Total Calculation =====

/**
 * Calculate Grand Total row by summing all numeric columns
 * ✅ Dynamic field handling based on companyId and yearsFilter
 * @param {Array} data - Array of cost center summary data
 * @param {string|number} companyId - Company ID (1=BJC, 2=BIG C)
 * @param {number} yearsFilter - Budget year filter (default: 2026)
 * @returns {Object} Grand Total row object
 */
function calculateGrandTotal(data, companyId, yearsFilter = 2026) {
  if (!data || data.length === 0) {
    return null;
  }

  const isBJC = companyId === '1' || companyId === 1;

  // Base grand total object - ✅ DYNAMIC based on companyId
  const grandTotal = isBJC ? {
    // BJC: BU and COBU first (match column order)
    BU: 'Grand Total',
    COBU: '',
    COST_CENTER: '',
    COST_CENTER_NAME_HR: '',
    // DIVISION: hidden
    // DEPARTMENT: hidden
    // SECTION: hidden
    // BU_HEAD_SUP: hidden
    // BU_HEAD: hidden
    GROUPING: '',
    HRBP: ''
  } : {
    // BIG C: Original order with all fields
    BU_HEAD_SUP: 'Grand Total',
    BU_HEAD: '',
    BU: '',
    COBU: '',
    DEPARTMENT: '',
    COST_CENTER: '',
    COST_CENTER_NAME_HR: '',
    GROUPING: '',
    HRBP: ''
  };

  // ✅ Generate numeric fields dynamically based on yearsFilter
  const numericFields = generateNumericFields(yearsFilter, isBJC);

  // Sum all numeric fields
  numericFields.forEach(field => {
    grandTotal[field] = data.reduce((sum, row) => {
      const value = parseFloat(row[field]) || 0;
      return sum + value;
    }, 0);
  });

  return grandTotal;
}

// ===== Grid Options =====

/**
 * AG Grid Options for Budget PE Bonus
 * ✅ IMPORTANT: columnDefs will be set dynamically via setColumnDefs() based on companyId and yearsFilter
 * Default to BIG C layout (all columns shown) with year 2026
 */
const budgetPEBonusGridOptions = {
  columnDefs: createColumnDefs(2, 2026), // Default: BIG C (companyId=2), year 2026
  defaultColDef: {
    sortable: true,
    filter: true,
    resizable: true,
    suppressMovable: false
    // menuTabs removed - Enterprise feature
  },
  rowData: [],
  pinnedBottomRowData: [],

  // Grid behavior
  animateRows: true,
  // enableRangeSelection removed - Enterprise feature
  suppressRowClickSelection: true,
  rowSelection: 'single',

  // Grid size
  domLayout: 'normal',
  rowHeight: 40,
  headerHeight: 50,
  groupHeaderHeight: 40,

  // Pagination
  pagination: false,
  paginationPageSize: 100,

  // Excel export configuration
  defaultExcelExportParams: {
    fileName: 'Budget_PE_Bonus_Export.xlsx',
    sheetName: 'Budget PE Bonus Summary',
    author: 'HCBP Core UI',
    exportMode: 'xlsx',

    // Include Grand Total in export
    processPinnedBottomRows: (params) => {
      return true;
    },

    // Style configuration
    processHeaderCallback: (params) => {
      return {
        font: { bold: true, size: 11 },
        interior: {
          color: '#4472C4',
          pattern: 'Solid'
        }
      };
    },

    processCellCallback: (params) => {
      const field = params.column.getColDef().field;

      // Style Grand Total row
      if (params.node.rowPinned === 'bottom') {
        return {
          font: { bold: true },
          interior: {
            color: '#FFF2CC',
            pattern: 'Solid'
          }
        };
      }

      // Style numeric cells (based on updated field names)
      const numericPrefixes = [
        'ACTUAL_FT_', 'ACTUAL_CT_', 'ACTUAL_PE_',
        'BUDGET_FT_', 'BUDGET_CT_', 'CURRENT_PE_',
        'ACTIVE_', 'VAC_', 'NEW_', 'SUM_', 'OT', 'EB', 'SUM_PE_'
      ];

      const isNumeric = numericPrefixes.some(prefix => field && field.startsWith(prefix));
      if (isNumeric) {
        return {
          numberFormat: { format: '#,##0.00' }
        };
      }

      return null;
    }
  },

  // Event handlers
  onGridReady: (params) => {
    console.log('Budget PE Bonus Grid Ready');
    window.budgetPEBonusGridApi = params.api;
    window.budgetPEBonusColumnApi = params.columnApi;
  },

  onFirstDataRendered: (params) => {
    // Use natural column widths - no sizeColumnsToFit for grids with many columns
    // This allows horizontal scrollbar and readable column widths
    console.log('Budget PE Bonus data rendered');
  },

  onFilterChanged: (params) => {
    updateGrandTotal();
  }
};

// ===== Grid Functions =====

/**
 * Initialize Budget PE Bonus Grid
 */
function initBudgetPEBonusGrid() {
  const gridDiv = document.querySelector('#budgetPEBonusGrid');
  if (!gridDiv) {
    console.error('Grid container #budgetPEBonusGrid not found');
    return;
  }

  // Create AG Grid using modern API (v31+)
  const api = agGrid.createGrid(gridDiv, budgetPEBonusGridOptions);

  // Set global grid API
  if (window.setBudgetPEBonusGridApi) {
    window.setBudgetPEBonusGridApi(api);
  }

  console.log('Budget PE Bonus Grid initialized successfully');
  return api;
}

/**
 * Load data into grid
 * ✅ ENHANCED: Accepts companyId and yearsFilter parameters for dynamic column definitions
 * @param {Array} data - Cost center summary data from API
 * @param {string|number} companyId - Company ID (1=BJC, 2=BIG C) - optional, for column adjustment
 * @param {number} yearsFilter - Budget year filter (default: 2026)
 */
function loadBudgetPEBonusData(data, companyId, yearsFilter = 2026) {
  if (!window.budgetPEBonusGridApi) {
    console.error('Grid API not available');
    return;
  }

  // Store raw data and normalize field names to UPPERCASE for AG Grid
  rawData = data || [];

  // Normalize all field names to UPPERCASE to match column definitions
  masterData = rawData.map(row => {
    const normalizedRow = {};
    Object.keys(row).forEach(key => {
      const upperKey = key.toUpperCase();
      normalizedRow[upperKey] = row[key];
    });
    return normalizedRow;
  });

  console.log('Loading data into grid:', {
    dataLength: data?.length,
    masterDataLength: masterData.length,
    companyId: companyId,
    yearsFilter: yearsFilter,
    sampleData: masterData[0],
    sampleKeys: masterData[0] ? Object.keys(masterData[0]).slice(0, 10) : []
  });

  // ✅ Apply company and year-specific column definitions
  if (companyId) {
    const newColumnDefs = createColumnDefs(companyId, yearsFilter);
    window.budgetPEBonusGridApi.setGridOption('columnDefs', newColumnDefs);
    console.log(`✅ Applied ${companyId === '1' || companyId === 1 ? 'BJC' : 'BIG C'} column definitions for year ${yearsFilter}`);
  }

  // Calculate Grand Total with companyId and yearsFilter
  grandTotalData = calculateGrandTotal(masterData, companyId, yearsFilter);

  // Update grid - use updateGridOptions for bulk update
  window.budgetPEBonusGridApi.updateGridOptions({
    rowData: masterData,
    pinnedBottomRowData: grandTotalData ? [grandTotalData] : []
  });

  console.log(`Loaded ${masterData.length} cost centers with Grand Total`);
  console.log('Grand Total data:', grandTotalData);
}

/**
 * Update Grand Total after filtering
 * ✅ ENHANCED: Recalculates with current companyId and yearsFilter from stored data
 */
function updateGrandTotal() {
  if (!window.budgetPEBonusGridApi) return;

  // Get filtered data
  const filteredData = [];
  window.budgetPEBonusGridApi.forEachNodeAfterFilter(node => {
    if (!node.rowPinned) {
      filteredData.push(node.data);
    }
  });

  // ✅ Get current companyId and yearsFilter from stored filter state (if available)
  const companyId = window.currentCompanyFilter || 2; // Default to BIG C
  const yearsFilter = window.currentYearFilter || 2026; // Default to 2026

  // Recalculate Grand Total for filtered data with companyId and yearsFilter
  const newGrandTotal = calculateGrandTotal(filteredData, companyId, yearsFilter);

  if (newGrandTotal) {
    window.budgetPEBonusGridApi.setGridOption('pinnedBottomRowData', [newGrandTotal]);
  }
}

/**
 * Export grid to Excel
 */
function exportBudgetPEBonusToExcel() {
  if (!window.budgetPEBonusGridApi) {
    console.error('Grid API not available');
    return;
  }

  const params = {
    ...budgetPEBonusGridOptions.defaultExcelExportParams,
    fileName: `Budget_PE_Bonus_${new Date().toISOString().split('T')[0]}.xlsx`
  };

  window.budgetPEBonusGridApi.exportDataAsExcel(params);
  console.log('Exported Budget PE Bonus to Excel');
}

/**
 * Clear all filters
 */
function clearBudgetPEBonusFilters() {
  if (!window.budgetPEBonusGridApi) return;

  window.budgetPEBonusGridApi.setFilterModel(null);
  console.log('Cleared all grid filters');
}

/**
 * Reset grid to initial state
 */
function resetBudgetPEBonusGrid() {
  clearBudgetPEBonusFilters();
  loadBudgetPEBonusData(rawData);
}

// ===== Export Functions =====
// Make functions available globally
window.initBudgetPEBonusGrid = initBudgetPEBonusGrid;
window.loadBudgetPEBonusData = loadBudgetPEBonusData;
window.updateGrandTotal = updateGrandTotal;
window.exportBudgetPEBonusToExcel = exportBudgetPEBonusToExcel;
window.clearBudgetPEBonusFilters = clearBudgetPEBonusFilters;
window.resetBudgetPEBonusGrid = resetBudgetPEBonusGrid;
window.calculateGrandTotal = calculateGrandTotal;
