/**
 * PE Budget Dashboard API Functions
 * Handles all API calls for dashboard data
 */

// ============================================================================
// API Service Functions
// ============================================================================

/**
 * Fetch PE Bonus data for KPI calculations (Dynamic Year Approach)
 * Uses existing API: POST /api/Summary/GetPEBonusByCostCenter
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Object>} Aggregated PE Bonus data with dynamic years
 */
async function fetchDashboardPEBonusData(filters) {
    // Validate required fields
    if (!filters.companyId) {
        console.warn('CompanyId is required for fetchDashboardPEBonusData');
        return {
            hcPrev: 0,
            hcCurr: 0,
            pePrev: 0,
            peCurr: 0,
            previousYear: (filters.budgetYear || new Date().getFullYear()) - 1,
            currentYear: filters.budgetYear || new Date().getFullYear()
        };
    }

    const requestBody = {
        companyId: filters.companyId,
        budgetYear: parseInt(filters.budgetYear) || new Date().getFullYear(),
        cobuFormat: filters.cobu || null,
        costCenterCode: filters.costCenter || null
    };

    console.log('Fetching PE Bonus data with:', requestBody);

    const response = await fetch(DASHBOARD_API_BASE + 'Summary/GetPEBonusByCostCenter', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to fetch PE Bonus data: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received PE Bonus data:', data);

    // Aggregate data from all cost centers (pass budgetYear for dynamic fields)
    return aggregatePEBonusData(data, requestBody.budgetYear);
}

/**
 * Aggregate PE Bonus data for KPI calculation (Dynamic Year Approach)
 * Sums all cost center rows into totals with dynamic field names
 * @param {Array} dataArray - Array of cost center data
 * @param {number} budgetYear - Budget year for dynamic field calculation
 * @returns {Object} Aggregated totals with year information
 */
function aggregatePEBonusData(dataArray, budgetYear) {
    if (!dataArray || dataArray.length === 0) {
        return {
            hcPrev: 0,
            hcCurr: 0,
            pePrev: 0,
            peCurr: 0,
            vacantHcPrev: 0,
            vacantHcCurr: 0,
            vacantPePrev: 0,
            vacantPeCurr: 0,
            newHcPrev: 0,
            newHcCurr: 0,
            newPePrev: 0,
            newPeCurr: 0,
            ftCurr: 0,
            ctCurr: 0,
            previousYear: budgetYear - 1,
            currentYear: budgetYear
        };
    }

    // Ensure budgetYear is a number
    const currentYear = parseInt(budgetYear);      // e.g., 2026
    const previousYear = currentYear - 1;          // e.g., 2025

    // Dynamic field names (lowercase to match API response)
    const fieldPE_Prev = `currenT_PE_${previousYear}`;
    const fieldHC_Prev = `budgeT_FT_${previousYear}`;
    const fieldHC_Prev_CT = `budgeT_CT_${previousYear}`;

    //console.log(`Aggregating data for years: ${previousYear} and ${currentYear}`);

    // Debug: Log first row to see available fields
    if (dataArray.length > 0) {
        console.log('Sample row fields:', Object.keys(dataArray[0]));
        console.log('Sample row data:', dataArray[0]);
    }

    const totals = dataArray.reduce((acc, row, index) => {
        // HC Previous Year & Current Year
        const hcPrevRow = (row[fieldHC_Prev] || 0) + (row[fieldHC_Prev_CT] || 0);
        acc.hcPrev += hcPrevRow;
        const hcCurrRow = (row.suM_FT || 0) + (row.suM_CT || 0);
        acc.hcCurr += hcCurrRow;

        // PE Previous Year row[fieldPE_Prev] & Current Year
        const pePrevRow = row[fieldPE_Prev] || 0;
        acc.pePrev += pePrevRow;
        const peCurrRow = row.suM_PE || 0;
        acc.peCurr += peCurrRow;

        // Vacant HC Previous Year & Current Year
        const vacantHcPrevRow = (row.vaC_FT_LE || 0) + (row.vaC_CT_LE || 0);
        acc.vacantHcPrev += vacantHcPrevRow;
        const vacantHcCurrRow = (row.vaC_FT || 0) + (row.vaC_CT || 0);
        acc.vacantHcCurr += vacantHcCurrRow;

        // Vacant PE Previous Year & Current Year
        const vacantPePrevRow = row.vaC_PE_LE || 0;
        acc.vacantPePrev += vacantPePrevRow;
        const vacantPeCurrRow = row.vaC_PE || 0;
        acc.vacantPeCurr += vacantPeCurrRow;

        // New HC Previous Year & Current Year
        const newHcPrevRow = (row.neW_FT_LE || 0) + (row.neW_CT_LE || 0);
        acc.newHcPrev += newHcPrevRow;
        const newHcCurrRow = (row.neW_FT || 0) + (row.neW_CT || 0);
        acc.newHcCurr += newHcCurrRow;

        // New PE Previous Year & Current Year
        const newPePrevRow = row.neW_PE_LE || 0;
        acc.newPePrev += newPePrevRow;
        const newPeCurrRow = row.neW_PE || 0;
        acc.newPeCurr += newPeCurrRow;

        // HC Composition: FT vs CT (Current Year)
        const ftCurrRow = row.suM_FT || 0;
        acc.ftCurr += ftCurrRow;
        const ctCurrRow = row.suM_CT || 0;
        acc.ctCurr += ctCurrRow;

        // Debug: Log first 3 rows calculations
        if (index < 3) {
            console.log(`Row ${index} calculations:`, {
                hcPrevRow,
                hcCurrRow,
                pePrevRow,
                peCurrRow,
                ftCurrRow,
                ctCurrRow,
                runningTotal: {
                    hcPrev: acc.hcPrev,
                    hcCurr: acc.hcCurr,
                    pePrev: acc.pePrev,
                    peCurr: acc.peCurr,
                    ftCurr: acc.ftCurr,
                    ctCurr: acc.ctCurr
                }
            });
        }

        return acc;
    }, {
        hcPrev: 0,
        hcCurr: 0,
        pePrev: 0,
        peCurr: 0,
        vacantHcPrev: 0,
        vacantHcCurr: 0,
        vacantPePrev: 0,
        vacantPeCurr: 0,
        newHcPrev: 0,
        newHcCurr: 0,
        newPePrev: 0,
        newPeCurr: 0,
        ftCurr: 0,
        ctCurr: 0,
        previousYear: previousYear,
        currentYear: currentYear
    });

    // Calculate % of Total HC for Vacant and New HC
    const vacantPercentOfTotal = totals.hcCurr > 0
        ? (totals.vacantHcCurr / totals.hcCurr) * 100
        : 0;

    const newPercentOfTotal = totals.hcCurr > 0
        ? (totals.newHcCurr / totals.hcCurr) * 100
        : 0;

    totals.vacantPercentOfTotal = vacantPercentOfTotal;
    totals.newPercentOfTotal = newPercentOfTotal;

    console.log('Aggregated totals:', totals);

    return totals;
}

/**
 * Fetch PE by Division chart data
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Array>} Division data array
 */
async function fetchDashboardPEByDivision(filters) {
    const params = new URLSearchParams();
    if (filters.companyId) params.append('companyId', filters.companyId);
    if (filters.budgetYear) params.append('budgetYear', filters.budgetYear);
    if (filters.cobu) params.append('cobu', filters.cobu);

    const response = await fetch(`${DASHBOARD_API.peByDivision}?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch PE by Division');
    return await response.json();
}

/**
 * Fetch PE by Department (aggregated from Cost Center data)
 * Uses the same API as KPI cards to ensure HC totals match
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Array>} Department data array
 */
async function fetchDashboardPEByDepartment(filters) {
    const requestBody = {
        companyId: filters.companyId,
        budgetYear: parseInt(filters.budgetYear) || new Date().getFullYear(),
        cobuFormat: filters.cobu || null,
        costCenterCode: null  // Get all cost centers
    };

    console.log('Fetching PE by Department with:', requestBody);

    const response = await fetch(DASHBOARD_API_BASE + 'Summary/GetPEBonusByCostCenter', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to fetch PE by Department: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received Cost Center data:', data);

    // Aggregate by Department
    return aggregateByDepartment(data);
}

/**
 * Aggregate Cost Center data by Department
 * Groups multiple cost centers into their parent departments
 * @param {Array} dataArray - Array of cost center data
 * @returns {Array} Aggregated department data sorted by PE descending
 */
function aggregateByDepartment(dataArray) {
    if (!dataArray || dataArray.length === 0) {
        console.warn('No data to aggregate by department');
        return [];
    }

    // Log first row to see field names
    if (dataArray.length > 0) {
        console.log('Sample cost center row:', dataArray[0]);
    }

    const departmentMap = {};

    dataArray.forEach(row => {
        // Try different possible field names for department (case-sensitive)
        const dept = row.department || row.departmenT_NAME || row.DEPARTMENT || 'Unknown';

        if (!departmentMap[dept]) {
            departmentMap[dept] = {
                department: dept,
                totalPE: 0,
                totalHC: 0
            };
        }

        // Sum PE and HC from all cost centers in this department
        departmentMap[dept].totalPE += (row.suM_PE || 0);
        departmentMap[dept].totalHC += (row.suM_FT || 0) + (row.suM_CT || 0);
    });

    // Convert to array and sort by PE descending
    const result = Object.values(departmentMap)
        .sort((a, b) => b.totalPE - a.totalPE);

    console.log(`Aggregated ${dataArray.length} cost centers into ${result.length} departments`);
    console.log('Department summary:', result);

    return result;
}

/**
 * Fetch PE by COBU (aggregated from Cost Center data)
 * Uses the same API as KPI cards to ensure HC totals match
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Array>} COBU data array
 */
async function fetchDashboardPEByCobu(filters) {
    const requestBody = {
        companyId: filters.companyId,
        budgetYear: parseInt(filters.budgetYear) || new Date().getFullYear(),
        cobuFormat: null,  // Get all COBUs
        costCenterCode: null  // Get all cost centers
    };

    console.log('Fetching PE by COBU with:', requestBody);

    const response = await fetch(DASHBOARD_API_BASE + 'Summary/GetPEBonusByCostCenter', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to fetch PE by COBU: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received Cost Center data for COBU:', data);

    // Aggregate by COBU
    return aggregateByCobu(data);
}

/**
 * Aggregate Cost Center data by COBU
 * Groups multiple cost centers into their parent COBUs
 * @param {Array} dataArray - Array of cost center data
 * @returns {Array} Aggregated COBU data sorted by PE descending
 */
function aggregateByCobu(dataArray) {
    if (!dataArray || dataArray.length === 0) {
        console.warn('No data to aggregate by COBU');
        return [];
    }

    // Log first row to see field names
    if (dataArray.length > 0) {
        console.log('Sample cost center row for COBU:', dataArray[0]);
    }

    const cobuMap = {};

    dataArray.forEach(row => {
        // Try different possible field names for COBU (case-sensitive)
        const cobu = row.cobU_Format || row.cobu || row.COBU || 'Unknown';

        if (!cobuMap[cobu]) {
            cobuMap[cobu] = {
                cobu: cobu,
                totalPE: 0,
                totalHC: 0
            };
        }

        // Sum PE and HC from all cost centers in this COBU
        cobuMap[cobu].totalPE += (row.suM_PE || 0);
        cobuMap[cobu].totalHC += (row.suM_FT || 0) + (row.suM_CT || 0);
    });

    // Convert to array and sort by PE descending
    const result = Object.values(cobuMap)
        .sort((a, b) => b.totalPE - a.totalPE);

    console.log(`Aggregated ${dataArray.length} cost centers into ${result.length} COBUs`);
    console.log('COBU summary:', result);

    return result;
}

/**
 * Fetch Cost Center grid data with pagination
 * @param {Object} filters - Filter parameters
 * @param {number} page - Page number
 * @param {number} pageSize - Page size
 * @returns {Promise<Object>} Paginated cost center data
 */
async function fetchDashboardCostCenters(filters, page = 1, pageSize = 100) {
    const params = new URLSearchParams();
    if (filters.companyId) params.append('companyId', filters.companyId);
    if (filters.budgetYear) params.append('budgetYear', filters.budgetYear);
    if (filters.cobu) params.append('cobu', filters.cobu);
    if (filters.costCenter) params.append('costCenter', filters.costCenter);
    if (filters.division) params.append('division', filters.division);
    if (filters.department) params.append('department', filters.department);
    if (filters.section) params.append('section', filters.section);
    if (filters.companyStore) params.append('companyStore', filters.companyStore);
    if (filters.empStatus) params.append('empStatus', filters.empStatus);
    if (filters.position) params.append('position', filters.position);
    if (filters.jobBand) params.append('jobBand', filters.jobBand);
    params.append('page', page);
    params.append('pageSize', pageSize);

    const response = await fetch(`${DASHBOARD_API.costCenters}?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch cost centers');
    return await response.json();
}

/**
 * Fetch Trend Data for Block D (HC & PE Trend Chart)
 * Uses PE HeadCount API to get historical and budget data
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Object>} Aggregated trend data by year
 */
async function fetchDashboardTrendData(filters) {
    try {
        // Validate required filters
        if (!filters.companyId) {
            console.warn('CompanyId is required for fetchDashboardTrendData');
            return null;
        }

        if (!filters.budgetYear) {
            console.warn('BudgetYear is required for fetchDashboardTrendData');
            return null;
        }

        const requestBody = {
            companyId: parseInt(filters.companyId),
            budgetYear: parseInt(filters.budgetYear),
            cobuFormat: filters.cobu || null,
            costCenterCode: filters.costCenter || null
        };

        console.log('Fetching Trend Data with:', requestBody);

        const response = await fetch(DASHBOARD_API_BASE + 'Summary/GetPEHeadCountByGrouping', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            throw new Error(`Failed to fetch trend data: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received PE HeadCount data for trend:', data);

        // Get includeAreaStore from config
        const includeAreaStore = window.trendChartConfig?.includeAreaStore ?? true;
        console.log('Fetching with includeAreaStore:', includeAreaStore);

        // Aggregate data by year
        return aggregateTrendDataByYear(data, requestBody.budgetYear, includeAreaStore);

    } catch (error) {
        console.error('Error fetching trend data:', error);
        throw error;
    }
}

/**
 * Get field value with case-insensitive lookup
 * @param {Object} row - Data row
 * @param {Array<string>} fieldNames - Array of possible field names
 * @returns {number} Field value or 0
 */
function getFieldValue(row, fieldNames) {
    for (const fieldName of fieldNames) {
        // Try direct property
        if (row[fieldName] !== undefined && row[fieldName] !== null) {
            return parseFloat(row[fieldName]) || 0;
        }

        // Try AdditionalData
        if (row.AdditionalData?.[fieldName] !== undefined && row.AdditionalData[fieldName] !== null) {
            return parseFloat(row.AdditionalData[fieldName]) || 0;
        }

        // Try case-insensitive search in row properties
        const rowKeys = Object.keys(row);
        const matchingKey = rowKeys.find(key => key.toLowerCase() === fieldName.toLowerCase());
        if (matchingKey && row[matchingKey] !== undefined && row[matchingKey] !== null) {
            return parseFloat(row[matchingKey]) || 0;
        }

        // Try case-insensitive search in AdditionalData
        if (row.AdditionalData) {
            const additionalKeys = Object.keys(row.AdditionalData);
            const matchingAdditionalKey = additionalKeys.find(key => key.toLowerCase() === fieldName.toLowerCase());
            if (matchingAdditionalKey && row.AdditionalData[matchingAdditionalKey] !== undefined && row.AdditionalData[matchingAdditionalKey] !== null) {
                return parseFloat(row.AdditionalData[matchingAdditionalKey]) || 0;
            }
        }
    }

    return 0;
}

/**
 * Aggregate PE HeadCount data by year for trend chart
 * Processes historical, LE, and budget years into a timeline
 * @param {Array} dataArray - Array of PE HeadCount data
 * @param {number} budgetYear - Budget year (e.g., 2026)
 * @param {boolean} includeAreaStore - Whether to include Area Store data
 * @returns {Object} Aggregated trend data
 */
function aggregateTrendDataByYear(dataArray, budgetYear, includeAreaStore = true) {
    if (!dataArray || dataArray.length === 0) {
        console.warn('No data to aggregate for trend chart');
        return {
            years: [],
            hcValues: [],
            peValues: [],
            hcGrowthRates: [],
            peGrowthRates: [],
            yearTypes: [],
            newHC: [],
            vacantHC: [],
            newPE: [],
            vacantPE: [],
            latestActualYear: null
        };
    }

    // Calculate year ranges
    const currentYear = parseInt(budgetYear);           // e.g., 2026
    const leYear = currentYear - 1;                     // e.g., 2025 (LE year)
    const historicalYearCount = 6;
    const historicalYearTo = leYear;                    // e.g., 2025
    const historicalYearFrom = historicalYearTo - historicalYearCount; // e.g., 2019

    console.log('Year Calculation:', {
        budgetYear: currentYear,
        leYear,
        historicalRange: `${historicalYearFrom}-${historicalYearTo}`
    });

    // Log first few rows to debug
    if (dataArray.length > 0) {
        console.log('Sample PE HeadCount rows:', dataArray.slice(0, 3));
        console.log('Available fields:', Object.keys(dataArray[0]));

        // Check all possible variations of GROUP_TYPE and GROUP_TOTAL
        const sampleRow = dataArray[0];
        console.log('Checking GROUP fields:', {
            GROUP_TYPE: sampleRow.GROUP_TYPE,
            group_type: sampleRow.group_type,
            grouP_TYPE: sampleRow.grouP_TYPE,
            GROUP_TOTAL: sampleRow.GROUP_TOTAL,
            group_total: sampleRow.group_total,
            grouP_TOTAL: sampleRow.grouP_TOTAL,
            // Check in AdditionalData
            'AdditionalData.GROUP_TYPE': sampleRow.AdditionalData?.GROUP_TYPE,
            'AdditionalData.grouP_TYPE': sampleRow.AdditionalData?.grouP_TYPE
        });

        console.log('Unique GROUP_TYPE values:', [...new Set(dataArray.map(r => r.GROUP_TYPE || r.grouP_TYPE || r.AdditionalData?.GROUP_TYPE))]);
        console.log('Unique GROUP_TOTAL values:', [...new Set(dataArray.map(r => r.GROUP_TOTAL || r.grouP_TOTAL || r.AdditionalData?.GROUP_TOTAL))]);

        // Log sample PE values to debug
        console.log('Sample PE field values:', {
            actual_PE_2019: sampleRow.actual_PE_2019,
            actual_PE_ABS_2019: sampleRow.actual_PE_ABS_2019,
            actual_PE_2020: sampleRow.actual_PE_2020,
            actual_PE_ABS_2020: sampleRow.actual_PE_ABS_2020,
            actual_PE_2024: sampleRow.actual_PE_2024,
            actual_PE_ABS_2024: sampleRow.actual_PE_ABS_2024,
            BUDGET_CURR_PE: sampleRow.BUDGET_CURR_PE,
            budgeT_CURR_PE: sampleRow.budgeT_CURR_PE,
            TOT_PE_OTEB_LE: sampleRow.TOT_PE_OTEB_LE,
            toT_PE_OTEB_LE: sampleRow.toT_PE_OTEB_LE,
            TOT_PE: sampleRow.TOT_PE,
            toT_PE: sampleRow.toT_PE
        });
    }

    // Filter data based on Include/Exclude Area Store toggle
    let rowsToAggregate = dataArray;

    console.log('aggregateTrendDataByYear called with includeAreaStore:', includeAreaStore);

    // Try multiple field name variations
    const sampleRows = dataArray.slice(0, 5);
    console.log('Sample GROUP_TOTAL values (checking variations):', sampleRows.map(r => ({
        GROUP_TOTAL: r.GROUP_TOTAL,
        grouP_TOTAL: r.grouP_TOTAL,
        'AdditionalData.GROUP_TOTAL': r.AdditionalData?.GROUP_TOTAL,
        'AdditionalData.grouP_TOTAL': r.AdditionalData?.grouP_TOTAL
    })));

    if (!includeAreaStore) {
        // Exclude rows where GROUP_TOTAL contains "Store Area" or "Area Store"
        // Try multiple field name variations
        rowsToAggregate = dataArray.filter(row => {
            const groupTotal = (
                row.GROUP_TOTAL ||
                row.grouP_TOTAL ||
                row.AdditionalData?.GROUP_TOTAL ||
                row.AdditionalData?.grouP_TOTAL ||
                ''
            ).toString().toLowerCase();

            const shouldInclude = !groupTotal.includes('store area') && !groupTotal.includes('area store');

            // Debug first few rows
            if (dataArray.indexOf(row) < 3) {
                console.log(`Row ${dataArray.indexOf(row)}: GROUP_TOTAL="${groupTotal}" → ${shouldInclude ? 'INCLUDE' : 'EXCLUDE'}`);
            }

            return shouldInclude;
        });
        console.log(`Filtered to exclude Area Store: ${dataArray.length} → ${rowsToAggregate.length} rows`);

        // Show remaining values
        const remaining = [...new Set(rowsToAggregate.map(r =>
            r.GROUP_TOTAL || r.grouP_TOTAL || r.AdditionalData?.GROUP_TOTAL || r.AdditionalData?.grouP_TOTAL
        ))];
        console.log('Remaining GROUP_TOTAL values:', remaining);
    } else {
        console.log(`Including all data: ${dataArray.length} rows`);
    }

    if (rowsToAggregate.length === 0) {
        console.error('No data rows available for aggregation after filtering');
        return {
            years: [],
            hcValues: [],
            peValues: [],
            hcGrowthRates: [],
            peGrowthRates: [],
            yearTypes: [],
            newHC: [],
            vacantHC: [],
            newPE: [],
            vacantPE: [],
            latestActualYear: null
        };
    }

    // Aggregate all selected rows
    const aggregated = rowsToAggregate.reduce((acc, row) => {
        // Historical years - use case-insensitive field lookup
        for (let year = historicalYearFrom; year <= historicalYearTo; year++) {
            const yearKey = year.toString();
            if (!acc.historical[yearKey]) {
                acc.historical[yearKey] = { hc: 0, pe: 0 };
            }

            // Use helper function for case-insensitive lookup
            const ft = getFieldValue(row, [`ACTUAL_FT_${year}`, `actual_FT_${year}`, `actual_ft_${year}`]);
            const ct = getFieldValue(row, [`ACTUAL_CT_${year}`, `actual_CT_${year}`, `actual_ct_${year}`]);
            // Use ACTUAL_PE_ABS (Absolute PE value) instead of ACTUAL_PE
            const pe = Math.abs(getFieldValue(row, [`ACTUAL_PE_ABS_${year}`, `actual_PE_ABS_${year}`, `actual_pe_abs_${year}`, `ACTUAL_PE_${year}`, `actual_PE_${year}`, `actual_pe_${year}`]));

            acc.historical[yearKey].hc += ft + ct;
            acc.historical[yearKey].pe += pe;
        }

        // Budget Current Year (2025) - from BUDGET_CURR_* fields
        acc.budgetCurr.hc += getFieldValue(row, ['BUDGET_CURR_HC', 'budget_curr_hc', 'budgeT_CURR_HC']);
        acc.budgetCurr.pe += Math.abs(getFieldValue(row, ['BUDGET_CURR_PE', 'budget_curr_pe', 'budgeT_CURR_PE']));

        // LE Year (Current Year) - use TOT_PE_OTOTH_LE or TOT_PE_OTEB_LE
        acc.le.hc += getFieldValue(row, ['TOT_HC_LE', 'tot_hc_le', 'toT_HC_LE']);
        acc.le.pe += Math.abs(getFieldValue(row, ['TOT_PE_OTOTH_LE', 'tot_pe_ototh_le', 'toT_PE_OTOTH_LE', 'TOT_PE_OTEB_LE', 'tot_pe_oteb_le', 'toT_PE_OTEB_LE']));
        acc.le.newHC += getFieldValue(row, ['NEW_HC_LE', 'new_hc_le', 'neW_HC_LE']);
        acc.le.vacantHC += getFieldValue(row, ['VAC_HC_LE', 'vac_hc_le', 'vaC_HC_LE']);
        acc.le.newPE += Math.abs(getFieldValue(row, ['NEW_PE_LE', 'new_pe_le', 'neW_PE_LE']));
        acc.le.vacantPE += Math.abs(getFieldValue(row, ['VAC_PE_LE', 'vac_pe_le', 'vaC_PE_LE']));

        // Budget Year (Next Year) - use case-insensitive field lookup
        acc.budget.hc += getFieldValue(row, ['TOT_HC', 'tot_hc', 'toT_HC']);
        acc.budget.pe += Math.abs(getFieldValue(row, ['TOT_PE', 'tot_pe', 'toT_PE']));
        acc.budget.newHC += getFieldValue(row, ['NEW_HC', 'new_hc', 'neW_HC']);
        acc.budget.vacantHC += getFieldValue(row, ['VAC_HC', 'vac_hc', 'vaC_HC']);
        acc.budget.newPE += Math.abs(getFieldValue(row, ['NEW_PE', 'new_pe', 'neW_PE']));
        acc.budget.vacantPE += Math.abs(getFieldValue(row, ['VAC_PE', 'vac_pe', 'vaC_PE']));

        return acc;
    }, {
        historical: {},
        budgetCurr: { hc: 0, pe: 0 }, // Budget Current Year (2025)
        le: { hc: 0, pe: 0, newHC: 0, vacantHC: 0, newPE: 0, vacantPE: 0 },
        budget: { hc: 0, pe: 0, newHC: 0, vacantHC: 0, newPE: 0, vacantPE: 0 }
    });

    // Debug: Log aggregated values
    console.log('Aggregated raw values:', {
        historical: Object.keys(aggregated.historical).map(year => ({
            year,
            hc: aggregated.historical[year].hc,
            pe: aggregated.historical[year].pe
        })),
        budgetCurr: aggregated.budgetCurr,
        le: aggregated.le,
        budget: aggregated.budget
    });

    console.log('=== PE VALUES DEBUG ===');
    console.log('Budget Curr PE (raw):', aggregated.budgetCurr.pe);
    console.log('LE PE (raw):', aggregated.le.pe);
    console.log('Budget PE (raw):', aggregated.budget.pe);
    console.log('Sample Historical PE 2019:', aggregated.historical['2019'] ? aggregated.historical['2019'].pe : 'N/A');
    console.log('Sample Historical PE 2024:', aggregated.historical['2024'] ? aggregated.historical['2024'].pe : 'N/A');

    // Build timeline arrays
    const years = [];
    const hcValues = [];
    const peValues = [];
    const yearTypes = [];
    const newHC = [];
    const vacantHC = [];
    const newPE = [];
    const vacantPE = [];

    // Add historical years (2019-2024) - exclude LE year to avoid duplication
    for (let year = historicalYearFrom; year < leYear; year++) {
        const yearKey = year.toString();
        if (aggregated.historical[yearKey]) {
            const rawPE = aggregated.historical[yearKey].pe;
            const peInMillions = rawPE / 1000000;

            console.log(`Year ${year} PE conversion: ${rawPE} / 1000000 = ${peInMillions}`);

            years.push(year);
            hcValues.push(aggregated.historical[yearKey].hc);
            peValues.push(peInMillions); // Convert to millions

            // Determine year type (year before LE is latest actual)
            if (year === leYear - 1) {
                yearTypes.push('latest-actual'); // 2024 - orange
            } else {
                yearTypes.push('actual'); // 2019-2023 - grey
            }

            newHC.push(0); // No breakdown for historical
            vacantHC.push(0);
            newPE.push(0);
            vacantPE.push(0);
        }
    }

    // Add LE year (2025 - Budget Current Year + LE) - only once
    // Combine Budget Current Year (B0 2025) with LE adjustments
    const le2025HC = Math.max(aggregated.budgetCurr.hc, aggregated.le.hc); // Use LE if available, otherwise Budget Current
    const le2025PE = Math.max(aggregated.budgetCurr.pe, aggregated.le.pe); // Use LE if available, otherwise Budget Current

    console.log(`LE 2025 PE: budgetCurr=${aggregated.budgetCurr.pe}, le=${aggregated.le.pe}, max=${le2025PE}, /1M=${le2025PE / 1000000}`);

    years.push(leYear);
    hcValues.push(le2025HC);
    peValues.push(le2025PE / 1000000); // Convert to millions
    yearTypes.push('le'); // Light yellow
    newHC.push(aggregated.le.newHC);
    vacantHC.push(aggregated.le.vacantHC);
    newPE.push(aggregated.le.newPE / 1000000);
    vacantPE.push(aggregated.le.vacantPE / 1000000);

    // Add budget year (2026)
    console.log(`Budget 2026 PE: raw=${aggregated.budget.pe}, /1M=${aggregated.budget.pe / 1000000}`);

    years.push(currentYear);
    hcValues.push(aggregated.budget.hc);
    peValues.push(aggregated.budget.pe / 1000000); // Convert to millions
    yearTypes.push('budget'); // Yellow
    newHC.push(aggregated.budget.newHC);
    vacantHC.push(aggregated.budget.vacantHC);
    newPE.push(aggregated.budget.newPE / 1000000);
    vacantPE.push(aggregated.budget.vacantPE / 1000000);

    // Calculate growth rates
    const hcGrowthRates = calculateGrowthRates(hcValues);
    const peGrowthRates = calculateGrowthRates(peValues);

    console.log('Final peValues array before return:', peValues);
    console.log('Final hcValues array before return:', hcValues);
    console.log('=== SUMMARY ===');
    console.log(`Filter: ${includeAreaStore ? 'Include' : 'Exclude'} Area Store (${rowsToAggregate.length} rows)`);
    console.log(`HC 2024: ${hcValues[5]}, PE 2024: ${peValues[5]?.toFixed(2)} M`);
    console.log(`HC 2025 (LE): ${hcValues[6]}, PE 2025: ${peValues[6]?.toFixed(2)} M`);
    console.log(`HC 2026: ${hcValues[7]}, PE 2026: ${peValues[7]?.toFixed(2)} M`);

    // Find latest actual year (should be historicalYearTo, e.g., 2024)
    const latestActualYear = historicalYearTo;

    const result = {
        years,
        hcValues,
        peValues,
        hcGrowthRates,
        peGrowthRates,
        yearTypes,
        newHC,
        vacantHC,
        newPE,
        vacantPE,
        latestActualYear
    };

    console.log('Aggregated Trend Data:', result);

    return result;
}

/**
 * Calculate growth rates between consecutive values
 * @param {Array<number>} values - Array of values
 * @returns {Array<number>} Array of growth rates (%)
 */
function calculateGrowthRates(values) {
    const growthRates = [null]; // First year has no previous year

    for (let i = 1; i < values.length; i++) {
        const prev = values[i - 1];
        const curr = values[i];

        if (prev !== 0 && prev !== null && prev !== undefined) {
            const growth = ((curr - prev) / prev) * 100;
            growthRates.push(growth);
        } else {
            growthRates.push(null);
        }
    }

    return growthRates;
}
