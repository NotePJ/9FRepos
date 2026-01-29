/**
 * Budget PE HeadCount Grid Configuration
 * Handles AG Grid initialization and column definitions
 * ✅ DYNAMIC: Supports dynamic year ranges via yearsFilter parameter
 */

// ===== Data Storage =====
var rawData = [];
var masterData = [];

/**
 * Build hierarchical data structure with summary rows
 * Transforms flat data into 3-level hierarchy: GROUP_TYPE → GROUPING_HEAD → GROUPING
 * @param {Array} flatData - Normalized flat data array
 * @returns {Array} Hierarchical data with summary rows and _level, _isGroup flags
 */
function buildHierarchicalData(flatData) {
  const result = [];
  const groupTypeMap = new Map();

  // Group ALL data by GROUP_TYPE + GROUP_TOTAL combination → GROUPING_HEAD → GROUPING
  flatData.forEach(row => {
    const groupType = row.GROUP_TYPE || '';
    const groupTotal = row.GROUP_TOTAL || '';
    const groupingHead = row.GROUPING_HEAD || '';
    const grouping = row.GROUPING || '';

    // สร้าง unique key จาก GROUP_TYPE + GROUP_TOTAL
    const groupKey = `${groupType}|${groupTotal}`;

    if (!groupTypeMap.has(groupKey)) {
      groupTypeMap.set(groupKey, {
        groupType: groupType,
        groupTotal: groupTotal,
        groupingHeadMap: new Map(),
        allRows: []
      });
    }

    const groupTypeData = groupTypeMap.get(groupKey);
    groupTypeData.allRows.push(row);

    if (!groupTypeData.groupingHeadMap.has(groupingHead)) {
      groupTypeData.groupingHeadMap.set(groupingHead, {
        groupingHead: groupingHead,
        groupingMap: new Map(),
        rows: []
      });
    }

    const groupingHeadData = groupTypeData.groupingHeadMap.get(groupingHead);

    if (!groupingHeadData.groupingMap.has(grouping)) {
      groupingHeadData.groupingMap.set(grouping, []);
    }

    groupingHeadData.groupingMap.get(grouping).push(row);
  });

  // Helper function to calculate totals from child rows
  const calculateTotals = (rows) => {
    const totals = {};
    if (rows.length === 0) return totals;

    // Get numeric fields from first row
    const sampleRow = rows[0];
    Object.keys(sampleRow).forEach(key => {
      if (typeof sampleRow[key] === 'number') {
        totals[key] = rows.reduce((sum, row) => sum + (parseFloat(row[key]) || 0), 0);
      }
    });

    // Calculate Diff fields after summing base fields
    // Diff B vs. B0 (Budget Current Year)
    totals.DIFF_HC_B0 = (totals.TOT_HC || 0) - (totals.BUDGET_CURR_HC || 0);
    totals.DIFF_PE_B0 = (totals.TOT_PE || 0) - (totals.BUDGET_CURR_PE || 0);

    // Diff B vs. LE (Latest Estimate)
    totals.DIFF_HC_LE = (totals.TOT_HC || 0) - (totals.TOT_HC_LE || 0);
    totals.DIFF_PE_LE = (totals.TOT_PE || 0) - (totals.TOT_PE_OTEB_LE || 0);

    // Calculate percentage differences
    if (totals.BUDGET_CURR_PE && totals.BUDGET_CURR_PE !== 0) {
      totals.DIFF_PERCENT_B0 = ((totals.DIFF_PE_B0 || 0) / totals.BUDGET_CURR_PE) * 100;
    } else {
      totals.DIFF_PERCENT_B0 = 0;
    }

    if (totals.TOT_PE_OTEB_LE && totals.TOT_PE_OTEB_LE !== 0) {
      totals.DIFF_PERCENT_LE = ((totals.DIFF_PE_LE || 0) / totals.TOT_PE_OTEB_LE) * 100;
    } else {
      totals.DIFF_PERCENT_LE = 0;
    }

    return totals;
  };

  // Build hierarchical structure with summary rows
  // เรียงลำดับ groupTypeMap เพื่อให้ GROUP_TOTAL เดียวกันอยู่ติดกัน
  const sortedGroups = Array.from(groupTypeMap.entries()).sort((a, b) => {
    const aTotal = a[1].groupTotal || '';
    const bTotal = b[1].groupTotal || '';
    const aType = a[1].groupType || '';
    const bType = b[1].groupType || '';

    // กำหนดลำดับ GROUP_TOTAL แบบ custom
    const groupTotalOrder = {
      'HO': 1,
      'Inactive & Other Cost Center': 2,
      'Store Area': 3,
      'Big Smart': 4
    };

    const aOrder = groupTotalOrder[aTotal] || 999;
    const bOrder = groupTotalOrder[bTotal] || 999;

    // เรียงตาม GROUP_TOTAL ก่อน (ตาม order ที่กำหนด)
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }

    // ถ้า GROUP_TOTAL เดียวกัน ให้เรียงตาม GROUP_TYPE
    return aType.localeCompare(bType);
  });

  // เก็บข้อมูลสำหรับ Grand Total (รวมทุก GROUP_TYPE ที่มี GROUP_TOTAL เดียวกัน)
  const grandTotalMap = new Map(); // key = GROUP_TOTAL, value = array of rows

  sortedGroups.forEach(([groupKey, groupTypeData], index) => {
    const groupType = groupTypeData.groupType;
    const groupTotal = groupTypeData.groupTotal;

    // เก็บ rows สำหรับ Grand Total
    if (groupTotal && groupTotal !== '' && groupTotal !== '0') {
      if (!grandTotalMap.has(groupTotal)) {
        grandTotalMap.set(groupTotal, []);
      }
      grandTotalMap.get(groupTotal).push(...groupTypeData.allRows);
    }

    // Level 0: GROUP_TYPE + GROUP_TOTAL summary row with totals
    // แสดง: "Business Unit - Store Area"
    const displayName = groupTotal && groupTotal !== '' && groupTotal !== '0'
      ? `${groupType} - ${groupTotal}`
      : groupType;

    const groupTypeRow = {
      GROUP_TYPE: displayName, // แสดงชื่อแบบ combined
      _originalGroupType: groupType, // เก็บค่าเดิมไว้
      _groupTotal: groupTotal, // เก็บ GROUP_TOTAL ไว้
      GROUPING_HEAD: '',
      GROUPING: '',
      COST_CENTER: '',
      ...calculateTotals(groupTypeData.allRows),
      _isGroup: true,
      _level: 0,
      _expanded: true
    };
    result.push(groupTypeRow);

    groupTypeData.groupingHeadMap.forEach((groupingHeadData, groupingHead) => {
      // Collect all rows for GROUPING_HEAD level
      const allGroupingHeadRows = [];
      groupingHeadData.groupingMap.forEach((rows) => {
        allGroupingHeadRows.push(...rows);
      });

      // Level 1: GROUPING_HEAD summary row with totals
      const groupingHeadRow = {
        GROUP_TYPE: displayName, // ใช้ชื่อ combined
        _originalGroupType: groupType,
        _groupTotal: groupTotal,
        GROUPING_HEAD: groupingHead,
        GROUPING: '',
        COST_CENTER: '',
        ...calculateTotals(allGroupingHeadRows),
        _isGroup: true,
        _level: 1,
        _expanded: false, // เริ่มต้นให้ถูก collapse
        _childCount: groupingHeadData.groupingMap.size // จำนวน Level 2 groups
      };
      result.push(groupingHeadRow);

      groupingHeadData.groupingMap.forEach((rows, grouping) => {
        // Level 2: GROUPING summary row with totals (always show)
        const groupingRow = {
          GROUP_TYPE: displayName,
          _originalGroupType: groupType,
          _groupTotal: groupTotal,
          GROUPING_HEAD: groupingHead,
          GROUPING: grouping,
          COST_CENTER: '',
          ...calculateTotals(rows),
          _isGroup: true,
          _level: 2,
          _expanded: false, // เริ่มต้นให้ถูก collapse (ซ่อน detail rows)
          _childCount: rows.length, // เก็บจำนวน child rows
          _parentGroupingHead: groupingHead // เก็บว่า Level 2 นี้อยู่ใต้ GROUPING_HEAD ไหน
        };
        result.push(groupingRow);

        // Level 3: Detail rows (actual data from SP)
        // เพิ่ม _parentGrouping เพื่อใช้ filter ภายหลัง
        rows.forEach(row => {
          result.push({
            ...row,
            GROUP_TYPE: displayName,
            _originalGroupType: groupType,
            _groupTotal: groupTotal,
            _isGroup: false,
            _level: 3,
            _parentGrouping: grouping, // เก็บว่า detail row นี้อยู่ใต้ GROUPING ไหน
            _parentGroupType: displayName, // ใช้ชื่อ combined
            _parentGroupingHead: groupingHead
          });
        });
      });
    });

    // เช็คว่าต้องแทรก Grand Total หรือไม่
    // แทรกเฉพาะเมื่อ:
    // 1. กลุ่มถัดไปมี GROUP_TOTAL ต่างกัน หรือ
    // 2. เป็นกลุ่มสุดท้าย
    const nextGroup = sortedGroups[index + 1];
    const isLastGroup = index === sortedGroups.length - 1;
    const isGroupTotalChange = nextGroup && nextGroup[1].groupTotal !== groupTotal;

    if ((isLastGroup || isGroupTotalChange) && groupTotal && groupTotal !== '' && groupTotal !== '0') {
      // รวมยอดจาก Grand Total Map
      const allRowsForGrandTotal = grandTotalMap.get(groupTotal) || [];

      const grandTotalRow = {
        GROUP_TYPE: '', // ไม่แสดง GROUP_TYPE ใน Grand Total
        _originalGroupType: '',
        GROUP_TOTAL: groupTotal,
        GROUPING_HEAD: '',
        GROUPING: '',
        COST_CENTER: '',
        ...calculateTotals(allRowsForGrandTotal), // คำนวณจากทุก rows ที่มี GROUP_TOTAL นี้
        _isGrandTotal: true,
        _level: -1
      };
      result.push(grandTotalRow);
    }
  });

  console.log('Hierarchical structure built:', {
    totalRows: result.length,
    level0Count: result.filter(r => r._level === 0).length,
    level1Count: result.filter(r => r._level === 1).length,
    level2Count: result.filter(r => r._level === 2).length,
    level3Count: result.filter(r => r._level === 3).length,
    grandTotalCount: result.filter(r => r._isGrandTotal).length
  });

  return result;
}

// Initialize the grid
function initBudgetPEHeadcountGrid() {
  const gridDiv = document.querySelector('#budgetPEHeadcountGrid');

  if (!gridDiv) {
    console.error('Grid container #budgetPEHeadcountGrid not found');
    return;
  }

  const gridOptions = {
    ...window.GRID_DEFAULT_OPTIONS,
    columnDefs: getGridColumnDefs(),
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true,
      width: 100
    },
    rowData: [],
    onGridReady: (params) => {
      console.log('Grid ready');
      window.budgetPEHeadcountGridApi = params.api;
      window.budgetPEHeadcountColumnApi = params.columnApi;
    },
    onCellClicked: (params) => {
      // Handle accordion toggle for Level 1 (GROUPING_HEAD) and Level 2 (GROUPING) rows
      const data = params.data;

      // Level 1: Toggle GROUPING_HEAD (แสดง/ซ่อน Level 2)
      if (data && data._level === 1 && data._isGroup) {
        data._expanded = !data._expanded;

        const allRows = window.budgetPEHeadcountFullData || [];

        const filteredRows = allRows.filter(row => {
          // แสดง Level 0, Grand Total เสมอ
          if (row._level === 0 || row._isGrandTotal) return true;

          // Level 1: แสดงเสมอ
          if (row._level === 1) return true;

          // Level 2: เช็คว่า parent (Level 1) ถูก expand หรือไม่
          if (row._level === 2) {
            const parent = allRows.find(r =>
              r._level === 1 &&
              r._isGroup &&
              r.GROUP_TYPE === row.GROUP_TYPE &&
              r.GROUPING_HEAD === row._parentGroupingHead
            );
            return parent && parent._expanded;
          }

          // Level 3: เช็คว่า parent (Level 2) ถูก expand หรือไม่ และ grandparent (Level 1) ถูก expand
          if (row._level === 3) {
            const parentL2 = allRows.find(r =>
              r._level === 2 &&
              r._isGroup &&
              r.GROUP_TYPE === row._parentGroupType &&
              r.GROUPING_HEAD === row._parentGroupingHead &&
              r.GROUPING === row._parentGrouping
            );

            const parentL1 = allRows.find(r =>
              r._level === 1 &&
              r._isGroup &&
              r.GROUP_TYPE === row._parentGroupType &&
              r.GROUPING_HEAD === row._parentGroupingHead
            );

            return parentL2 && parentL2._expanded && parentL1 && parentL1._expanded;
          }

          return false;
        });

        params.api.setGridOption('rowData', filteredRows);
      }

      // Level 2: Toggle GROUPING (แสดง/ซ่อน Level 3)
      if (data && data._level === 2 && data._isGroup) {
        data._expanded = !data._expanded;

        const allRows = window.budgetPEHeadcountFullData || [];

        const filteredRows = allRows.filter(row => {
          // แสดง Level 0, Grand Total เสมอ
          if (row._level === 0 || row._isGrandTotal) return true;

          // Level 1: แสดงเสมอ
          if (row._level === 1) return true;

          // Level 2: เช็คว่า parent (Level 1) ถูก expand หรือไม่
          if (row._level === 2) {
            const parent = allRows.find(r =>
              r._level === 1 &&
              r._isGroup &&
              r.GROUP_TYPE === row.GROUP_TYPE &&
              r.GROUPING_HEAD === row._parentGroupingHead
            );
            return parent && parent._expanded;
          }

          // Level 3: เช็คว่า parent (Level 2) ถูก expand หรือไม่ และ grandparent (Level 1) ถูก expand
          if (row._level === 3) {
            const parentL2 = allRows.find(r =>
              r._level === 2 &&
              r._isGroup &&
              r.GROUP_TYPE === row._parentGroupType &&
              r.GROUPING_HEAD === row._parentGroupingHead &&
              r.GROUPING === row._parentGrouping
            );

            const parentL1 = allRows.find(r =>
              r._level === 1 &&
              r._isGroup &&
              r.GROUP_TYPE === row._parentGroupType &&
              r.GROUPING_HEAD === row._parentGroupingHead
            );

            return parentL2 && parentL2._expanded && parentL1 && parentL1._expanded;
          }

          return false;
        });

        params.api.setGridOption('rowData', filteredRows);
      }
    },
    getRowStyle: (params) => {
      // Style pinned rows (Grand Total)
      if (params.node.rowPinned) {
        return {
          'font-weight': 'bold',
          'background-color': '#e8f5e9',
          'border-top': '2px solid rgba(5, 163, 74, 0.3)'
        };
      }

      const data = params.data;
      if (!data) return null;

      // Style hierarchy summary rows based on level (Green theme from btn-core-inverse)
      const isGroup = data._isGroup;
      const level = data._level;

      if (isGroup) {
        if (level === 0) {
          // Level 0: GROUP_TYPE - Dark green
          return {
            'font-weight': 'bold',
            'background-color': 'rgb(195,247,211, 0.5)',
            'color': '#166534 !important',
            'border-bottom': '2px solid rgba(5, 163, 74, 0.1)'
          };
        } else if (level === 1) {
          // Level 1: GROUPING_HEAD - Medium green (Clickable for accordion)
          return {
            'font-weight': 'bold',
            'background-color': 'rgb(240 253 244 / var(--tw-bg-opacity, 1))',
            'color': '#166534 !important',
            'border-bottom': '1px solid rgba(5, 163, 74, 0.2)',
            'cursor': 'pointer' // แสดงว่าคลิกได้
          };
        } else if (level === 2) {
          // Level 2: GROUPING - Light green (Clickable for accordion)
          return {
            'font-weight': 'bold',
            //'background-color': 'rgb(240,253,251, 0.8)',
            'border-bottom': '1px solid rgba(5, 163, 74, 0.2)',
            'cursor': 'pointer' // แสดงว่าคลิกได้
          };
        }
      }

      // Style Grand Total rows (_isGrandTotal flag)
      if (data._isGrandTotal) {
        return {
          'font-weight': 'bold',
          'background-color': 'rgb(240,253,251, 0.8)',
          'border-bottom': '1px solid #c8e6c9',
          'border-top': '2px solid rgba(5, 163, 74, 0.2)'
        };
      }

      return null;
    }
  };

  // Create AG Grid using modern API (v31+)
  const api = agGrid.createGrid(gridDiv, gridOptions);

  // Set global grid API
  if (window.setBudgetPEHeadcountGridApi) {
    window.setBudgetPEHeadcountGridApi(api);
  }

  console.log('Budget PE HeadCount Grid initialized successfully');
  return api;
}

/**
 * Get Column Definitions
 * ✅ DYNAMIC: Generates columns based on yearsFilter parameter
 * @param {number} yearsFilter - Budget year filter (e.g., 2026 → generates 2019-2024)
 */
function getGridColumnDefs(yearsFilter = 2026) {
  const colDefs = [
    // ✅ Hierarchy Display Column (Community compatible)
    {
      headerName: 'Organization',
      field: 'GROUPING',
      pinned: 'left',
      width: 300,
      filter: 'agTextColumnFilter',
      cellRenderer: (params) => {
        if (!params.data) return '';

        const data = params.data;

        // Check if this is a Grand Total row (_isGrandTotal flag)
        if (data._isGrandTotal) {
          const groupTotal = data.GROUP_TOTAL || '';
          return `<strong style="font-size: 14px; color: #166534;">Grand Total: ${groupTotal}</strong>`;
        }

        const level = data._level !== undefined ? data._level : 3;
        const isGroup = data._isGroup || false;

        let displayValue = '';
        let icon = '';
        let indent = '';

        // Determine display value and icon based on hierarchy level
        if (level === 0) {
          // Level 0: GROUP_TYPE summary
          displayValue = data.GROUP_TYPE || '';
          icon = '🗂️'; // เปลี่ยนจาก 📁 เป็น 🗂️ 📂
          indent = '';
        } else if (level === 1) {
          // Level 1: GROUPING_HEAD summary (accordion)
          displayValue = data.GROUPING_HEAD || '';
          const isExpanded = data._expanded || false;
          const childCount = data._childCount || 0;
          // ใช้ triangle icon แสดง expand/collapse state
          icon = isExpanded ? '▹📂' : '▿📂';
          indent = '&nbsp;&nbsp;&nbsp;&nbsp;';
          // เพิ่ม child count
          displayValue += ` (${childCount})`;
        } else if (level === 2) {
          // Level 2: GROUPING summary (accordion)
          displayValue = data.GROUPING || '';
          const isExpanded = data._expanded || false;
          const childCount = data._childCount || 0;
          // ใช้ triangle icon แสดง expand/collapse state
          icon = isExpanded ? '▹📈' : '▿📈';
          indent = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
          // เพิ่ม child count
          displayValue += ` (${childCount})`;
        } else {
          // Level 3: Detail row (COST_CENTER)
          displayValue = data.GROUPING || '';
          icon = '•';
          indent = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
        }

        // Style for group rows
        const style = isGroup ? 'font-weight: bold; color: #2c3e50;' : '';

        return `<span style="${style}">${indent}${icon ? icon + ' ' : ''}${displayValue}</span>`;
      }
    },
    {
      headerName: 'Cost Center',
      field: 'COST_CENTER',
      width: 120,
      pinned: 'left',
      filter: 'agTextColumnFilter'
    }
  ];

  // Historical Years - DYNAMIC based on yearsFilter
  const startYear = 2019;
  const endYear = yearsFilter - 2; // e.g., 2026 → 2024, 2027 → 2025
  const leYear = yearsFilter - 1; // e.g., 2026 → 2025
  const budgetYear = yearsFilter; // e.g., 2026
  for (let year = startYear; year <= endYear; year++) {
    colDefs.push({
      headerName: `Actual ${year}`,
      children: [
        { headerName: 'HC', field: `ACTUAL_HC_${year}`, width: 110, type: 'numericColumn', valueFormatter: numberFormatter },
        { headerName: 'PE', field: `ACTUAL_PE_${year}`, width: 110, type: 'numericColumn', valueFormatter: decimalFormatter }
      ]
    });
  }

  // Budget Current Year (B0)
  colDefs.push({
    headerName: `Budget ${leYear} (B0)`,
    children: [
      { headerName: 'HC', field: 'BUDGET_CURR_HC', width: 110, type: 'numericColumn', valueFormatter: numberFormatter },
      { headerName: 'PE', field: 'BUDGET_CURR_PE', width: 110, type: 'numericColumn', valueFormatter: decimalFormatter },
      { headerName: 'Move In', field: 'BUDGET_CURR_HC_MOVE_IN', width: 110, type: 'numericColumn', valueFormatter: numberFormatter },
      { headerName: 'Move Out', field: 'BUDGET_CURR_HC_MOVE_OUT', width: 110, type: 'numericColumn', valueFormatter: numberFormatter },
      { headerName: 'Add', field: 'BUDGET_CURR_HC_ADD', width: 110, type: 'numericColumn', valueFormatter: numberFormatter },
      { headerName: 'Cut', field: 'BUDGET_CURR_HC_CUT', width: 110, type: 'numericColumn', valueFormatter: numberFormatter },
      { headerName: 'Movement', field: 'BUDGET_CURR_HC_MOVEMENT', width: 110, type: 'numericColumn', valueFormatter: numberFormatter },
      { headerName: 'PE Adjust', field: 'BUDGET_CURR_PE_ADJUST', width: 110, type: 'numericColumn', valueFormatter: decimalFormatter }
    ]
  });

  // LE Current Year
  colDefs.push({
    headerName: `LE ${leYear}`,
    children: [
      { headerName: 'Active HC', field: 'LE_ACTIVE_HC_LE', width: 110, type: 'numericColumn', valueFormatter: numberFormatter },
      { headerName: 'Active PE', field: 'LE_ACTIVE_PE_LE', width: 110, type: 'numericColumn', valueFormatter: decimalFormatter },
      { headerName: 'Vac HC', field: 'VAC_HC_LE', width: 110, type: 'numericColumn', valueFormatter: numberFormatter },
      { headerName: 'Vac PE', field: 'VAC_PE_LE', width: 110, type: 'numericColumn', valueFormatter: decimalFormatter },
      { headerName: 'New HC', field: 'NEW_HC_LE', width: 110, type: 'numericColumn', valueFormatter: numberFormatter },
      { headerName: 'New PE', field: 'NEW_PE_LE', width: 110, type: 'numericColumn', valueFormatter: decimalFormatter },
      { headerName: 'Total HC', field: 'TOT_HC_LE', width: 110, type: 'numericColumn', valueFormatter: numberFormatter },
      { headerName: 'Total PE', field: 'TOT_PE_OTEB_LE', width: 110, type: 'numericColumn', valueFormatter: decimalFormatter }
    ]
  });

  // Budget Next Year
  colDefs.push({
    headerName: `Budget ${budgetYear}`,
    children: [
      { headerName: 'Move In', field: 'BUDGET_NEXT_HC_MOVE_IN', width: 110, type: 'numericColumn', valueFormatter: numberFormatter },
      { headerName: 'Move Out', field: 'BUDGET_NEXT_HC_MOVE_OUT', width: 110, type: 'numericColumn', valueFormatter: numberFormatter },
      { headerName: 'Cut', field: 'BUDGET_NEXT_HC_CUT', width: 110, type: 'numericColumn', valueFormatter: numberFormatter },
      { headerName: 'Active HC', field: 'ACTIVE_HC', width: 110, type: 'numericColumn', valueFormatter: numberFormatter },
      { headerName: 'Active PE', field: 'ACTIVE_PE', width: 110, type: 'numericColumn', valueFormatter: decimalFormatter },
      { headerName: 'Vac HC', field: 'VAC_HC', width: 110, type: 'numericColumn', valueFormatter: numberFormatter },
      { headerName: 'Vac PE', field: 'VAC_PE', width: 110, type: 'numericColumn', valueFormatter: decimalFormatter },
      { headerName: 'New HC', field: 'NEW_HC', width: 110, type: 'numericColumn', valueFormatter: numberFormatter },
      { headerName: 'New PE', field: 'NEW_PE', width: 110, type: 'numericColumn', valueFormatter: decimalFormatter },
      { headerName: 'Total HC', field: 'TOT_HC', width: 110, type: 'numericColumn', valueFormatter: numberFormatter },
      { headerName: 'Total PE', field: 'TOT_PE', width: 110, type: 'numericColumn', valueFormatter: decimalFormatter }
    ]
  });

  // Diff Columns
  colDefs.push({
    headerName: `Diff B ${budgetYear} vs. B ${leYear} (B0)`,
    children: [
      { headerName: 'Diff HC', field: 'DIFF_HC_B0', width: 110, type: 'numericColumn', valueFormatter: numberFormatter, cellClassRules: diffCellClassRules },
      { headerName: 'Diff PE', field: 'DIFF_PE_B0', width: 110, type: 'numericColumn', valueFormatter: decimalFormatter, cellClassRules: diffCellClassRules }

    ]
  });

  colDefs.push({
    headerName: `Diff B ${budgetYear} vs. LE ${leYear}`,
    children: [
      { headerName: 'Diff HC', field: 'DIFF_HC_LE', width: 110, type: 'numericColumn', valueFormatter: numberFormatter, cellClassRules: diffCellClassRules },
      { headerName: 'Diff PE', field: 'DIFF_PE_LE', width: 110, type: 'numericColumn', valueFormatter: decimalFormatter, cellClassRules: diffCellClassRules }
    ]
  });

  colDefs.push({
    headerName: `B ${budgetYear} vs. B ${leYear}`,
    children: [
      { headerName: '% Diff', field: 'DIFF_PERCENT_B0', width: 160, type: 'numericColumn', valueFormatter: percentFormatter, cellClassRules: diffCellClassRules }
    ]
  });

  colDefs.push({
    headerName: `B ${budgetYear} vs. LE ${leYear}`,
    children: [
      { headerName: '% Diff', field: 'DIFF_PERCENT_LE', width: 160, type: 'numericColumn', valueFormatter: percentFormatter, cellClassRules: diffCellClassRules }
    ]
  });

  colDefs.push({
    headerName: 'Remark',
    field: 'REMARK',
    width: 200
  });

  return colDefs;
}

// Formatters
function numberFormatter(params) {
  if (params.value === null || params.value === undefined) return '';
  return Math.floor(params.value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function decimalFormatter(params) {
  if (params.value === null || params.value === undefined) return '';
  return parseFloat(params.value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function percentFormatter(params) {
  if (params.value === null || params.value === undefined) return '';
  return parseFloat(params.value).toFixed(2) + '%';
}

// Cell Class Rules for Diff columns
const diffCellClassRules = {
  'text-danger': params => params.value < 0,
  'text-success': params => params.value > 0
};

/**
 * Load data into grid with dynamic column support
 * ✅ ENHANCED: Accepts yearsFilter parameter for dynamic column definitions
 * @param {Array} data - PE HeadCount data from API
 * @param {string|number} companyId - Company ID (optional)
 * @param {number} yearsFilter - Budget year filter (e.g., 2026, 2027)
 */
function loadBudgetPEHeadcountData(data, companyId, yearsFilter = 2026) {
  if (!window.budgetPEHeadcountGridApi) {
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

  // Transform flat data into hierarchical structure with summary rows
  const hierarchicalData = buildHierarchicalData(masterData);

  console.log('Loading data into grid:', {
    dataLength: data?.length,
    masterDataLength: masterData.length,
    hierarchicalDataLength: hierarchicalData.length,
    companyId: companyId,
    yearsFilter: yearsFilter,
    sampleData: masterData[0],
    sampleKeys: masterData[0] ? Object.keys(masterData[0]).slice(0, 10) : [],
    groupTotalRows: hierarchicalData.filter(r => r.GROUP_TOTAL).map(r => ({ GROUP_TOTAL: r.GROUP_TOTAL }))
  });

  // ✅ Update column definitions dynamically based on yearsFilter
  if (companyId) {
    const newColumnDefs = getGridColumnDefs(yearsFilter);
    window.budgetPEHeadcountGridApi.setGridOption('columnDefs', newColumnDefs);
    console.log(`✅ Applied dynamic column definitions for year ${yearsFilter}`);
  }

  // Filter: Initially show Level 0, Level 1, and Grand Total (hide Level 2 and Level 3)
  const initialFilteredData = hierarchicalData.filter(row =>
    row._level === 0 || row._level === 1 || row._isGrandTotal
  );

  // Update grid with filtered data
  window.budgetPEHeadcountGridApi.updateGridOptions({
    rowData: initialFilteredData
  });

  // Store full hierarchical data for accordion functionality
  window.budgetPEHeadcountFullData = hierarchicalData;

  console.log(`✅ Loaded ${masterData.length} raw records → ${hierarchicalData.length} rows (${initialFilteredData.length} visible, ${hierarchicalData.length - initialFilteredData.length} collapsed)`);
}

// Export functions
window.initBudgetPEHeadcountGrid = initBudgetPEHeadcountGrid;
window.getGridColumnDefs = getGridColumnDefs;
window.loadBudgetPEHeadcountData = loadBudgetPEHeadcountData;

console.log('Budget PE HC Grid module loaded');
