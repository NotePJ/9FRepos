/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📊 BUDGET PLAN EXCEL EXPORT CONFIGURATION
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Purpose: Configuration and mappings for Excel export
 * - Color schemes
 * - Font configurations
 * - BJC column mappings (150+ columns)
 * - BIG C column mappings (140+ columns)
 * - ⭐ "Fill" column definitions
 * - Merged cell configurations
 *
 * @version 1.0.0
 * @date 2025-11-03
 * @author SA Team
 */

(function() {
  'use strict';

  // ══════════════════════════════════════════════════════════════════════════
  // 🎨 COLOR SCHEMES
  // ══════════════════════════════════════════════════════════════════════════

  const EXCEL_COLORS = {
    // Primary Colors
    RED: 'FFFF0000',
    WHITE: 'FFFFFFFF',
    YELLOW: 'FFFFFF00',
    BLUE: 'FF4472C4',
    ORANGE: 'FFED7D31',
    BLACK: 'FF000000',

    // Secondary Colors
    LIGHT_GRAY: 'FFF2F2F2',
    LIGHT_GREEN: 'FFC6E0B4',
    LIGHT_ORANGE: 'FFFCE4D6',
    DARK_BLUE: 'FF1F4E78',

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
      color: 'FF000000' // Black (default, can be overridden)
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
      name: 'Angsana New', // or 'TH Sarabun New'
      size: 14,
      bold: false,
      color: 'FF000000'
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // ⭐ "FILL" COLUMN DEFINITIONS
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * BJC "Fill" Columns (Row 1 - Red Header)
   * These columns should have "Fill" text with enhanced highlighting
   */
  const BJC_FILL_COLUMNS = [
    'A', 'B', 'E', 'H', 'I',                    // Basic info
    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',    // Position & Job
    'AG', 'CB',                                 // Bonus Type columns (Yellow highlight)
    'AC', 'AD', 'AE', 'AF', 'AH', 'AI', 'AJ',  // LE 2025 key columns
    'BX', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CE'   // Y2025 key columns
  ];

  /**
   * BIG C "Fill" Columns (Row 1 - Red Header)
   * These columns should have "Fill" text with enhanced highlighting
   */
  const BIGC_FILL_COLUMNS = [
    'A', 'B', 'E', 'H', 'I',                    // Basic info
    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',    // Position & Job
    'BH',                                       // Bonus Type column (Yellow highlight)
    'AC', 'AD', 'AE', 'AF',                     // LE 2025 key columns
    'BD', 'BE', 'BF', 'BG'                      // Y2025 key columns
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // 📊 BJC COLUMN MAPPING (150+ columns)
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * BJC Column Mapping
   * Maps Excel columns to field data from AG Grid
   * Format: { field: 'cobu', header: 'COBU', format: 'text', width: 10 }
   */
  const BJC_COLUMN_MAPPING = {
    // ──────────────────────────────────────────────────────────────────────
    // BASIC INFORMATION (Columns A-M)
    // ──────────────────────────────────────────────────────────────────────
    'A': { field: 'cobu', header: 'COBU', format: 'text', width: 12 },
    'B': { field: 'division', header: 'Division', format: 'text', width: 20 },
    'C': { field: 'department', header: 'Department', format: 'text', width: 20 },
    'D': { field: 'section', header: 'Section', format: 'text', width: 20 },
    'E': { field: 'empCode', header: 'Employee ID', format: 'text', width: 12 },
    'F': { field: 'titleTh', header: 'Title(TH)', format: 'text', width: 10 },
    'G': { field: 'fnameTh', header: 'Name(TH)', format: 'text', width: 15 },
    'H': { field: 'lnameTh', header: 'Lastname(TH)', format: 'text', width: 15 },
    'I': { field: 'titleEn', header: 'Title(EN)', format: 'text', width: 10 },
    'J': { field: 'fnameEn', header: 'Name(EN)', format: 'text', width: 15 },
    'K': { field: 'lnameEn', header: 'Lastname(EN)', format: 'text', width: 15 },
    'L': { field: 'companyCode', header: 'Company', format: 'text', width: 10 },
    'M': { field: 'costCenterCode', header: 'Cost Center', format: 'text', width: 12 },

    // ──────────────────────────────────────────────────────────────────────
    // POSITION & JOB INFO (Columns N-T)
    // ──────────────────────────────────────────────────────────────────────
    'N': { field: 'positionName', header: 'Position', format: 'text', width: 30 },
    'O': { field: 'positionCode', header: 'Position Code', format: 'text', width: 12 },
    'P': { field: 'jobBand', header: 'Job Band', format: 'text', width: 10 },
    'Q': { field: 'joinDate', header: 'Join Date', format: 'date', width: 12 },
    'R': { field: 'yosCurrYear', header: 'YOS', format: 'number', width: 8 },
    'S': { field: 'empStatus', header: 'Status', format: 'text', width: 12 },
    'T': { field: 'storeName', header: 'Company', format: 'text', width: 20 },
    'U': { field: 'empTypeCode', header: 'Emp Type', format: 'text', width: 12 },
    'V': { field: 'newHcCode', header: 'New HC', format: 'text', width: 12 },
    'W': { field: 'newVacPeriod', header: 'New Vac Period', format: 'text', width: 15 },
    'X': { field: 'newVacLe', header: 'New Vac LE', format: 'text', width: 12 },
    'Y': { field: 'hrbpEmpCode', header: 'HRBP(EmpId)', format: 'text', width: 12 },
    'Z': { field: 'reason', header: 'Reason', format: 'text', width: 30 },
    'AA': { field: 'leOfMonth', header: 'LE Of Month', format: 'number', width: 12 },
    'AB': { field: 'noOfMonth', header: 'No Of Month', format: 'number', width: 12 },

    // ──────────────────────────────────────────────────────────────────────
    // LE 2025 SECTION (Columns AC-CD) - 47 fields
    // ──────────────────────────────────────────────────────────────────────
    'AC': { field: 'payrollLe', header: 'Payroll LE', format: 'number', width: 15 },
    'AD': { field: 'premiumLe', header: 'Premium LE', format: 'number', width: 15 },
    'AE': { field: 'salWithEnLe', header: 'Basic Salary with EN LE', format: 'number', width: 20 },
    'AF': { field: 'salNotEnLe', header: 'Basic Salary not EN LE', format: 'number', width: 20 },
    'AG': { field: 'bonusTypeLe', header: 'Bonus Type LE', format: 'text', width: 15, highlight: 'yellow' },
    'AH': { field: 'bonusLe', header: 'Bonus LE', format: 'number', width: 15 },
    'AI': { field: 'salTempLe', header: 'Salary (Temp) LE', format: 'number', width: 18 },
    'AJ': { field: 'socialSecurityTmpLe', header: 'Social Security (Temp) LE', format: 'number', width: 22 },
    'AK': { field: 'southriskAllowanceTmpLe', header: 'South Risk Allowance (Temp) LE', format: 'number', width: 25 },
    'AL': { field: 'carMaintenanceTmpLe', header: 'Car Maintenance (Temp) LE', format: 'number', width: 22 },
    'AM': { field: 'salesManagementPcLe', header: 'Sales Management PC LE', format: 'number', width: 20 },
    'AN': { field: 'shelfStackingPcLe', header: 'Shelf Stacking PC LE', format: 'number', width: 20 },
    'AO': { field: 'diligenceAllowancePcLe', header: 'Diligence Allowance PC LE', format: 'number', width: 22 },
    'AP': { field: 'postAllowancePcLe', header: 'Post Allowance PC LE', format: 'number', width: 20 },
    'AQ': { field: 'phoneAllowancePcLe', header: 'Phone Allowance PC LE', format: 'number', width: 20 },
    'AR': { field: 'transportationPcLe', header: 'Transportation PC LE', format: 'number', width: 20 },
    'AS': { field: 'skillAllowancePcLe', header: 'Skill Allowance PC LE', format: 'number', width: 20 },
    'AT': { field: 'otherAllowancePcLe', header: 'Other Allowance PC LE', format: 'number', width: 20 },
    'AU': { field: 'temporaryStaffSalLe', header: 'Temporary Staff Salary LE', format: 'number', width: 22 },
    'AV': { field: 'socialSecurityLe', header: 'Social Security Fund LE', format: 'number', width: 20 },
    'AW': { field: 'providentFundLe', header: 'Provident Fund LE', format: 'number', width: 18 },
    'AX': { field: 'workmenCompensationLe', header: 'Workmen Compensation LE', format: 'number', width: 22 },
    'AY': { field: 'housingAllowanceLe', header: 'Housing Allowance LE', format: 'number', width: 20 },
    'AZ': { field: 'salesCarAllowanceLe', header: 'Sales Car Allowance LE', format: 'number', width: 20 },
    'BA': { field: 'accommodationLe', header: 'Accommodation LE', format: 'number', width: 18 },
    'BB': { field: 'carMaintenanceLe', header: 'Car Maintenance LE', format: 'number', width: 18 },
    'BC': { field: 'southriskAllowanceLe', header: 'South Risk Allowance LE', format: 'number', width: 22 },
    'BD': { field: 'mealAllowanceLe', header: 'Meal Allowance LE', format: 'number', width: 18 },
    'BE': { field: 'otherLe', header: 'Other Benefits LE', format: 'number', width: 18 },
    'BF': { field: 'othersSubjectTaxLe', header: 'Others Subject to Tax LE', format: 'number', width: 22 },
    'BG': { field: 'carAllowanceLe', header: 'Car Allowance LE', format: 'number', width: 18 },
    'BH': { field: 'licenseAllowanceLe', header: 'License Allowance LE', format: 'number', width: 20 },
    'BI': { field: 'outsourceWagesLe', header: 'Outsource Wages LE', format: 'number', width: 18 },
    'BJ': { field: 'compCarsGasLe', header: 'Company Cars Gasoline LE', format: 'number', width: 22 },
    'BK': { field: 'compCarsOtherLe', header: 'Company Cars Other LE', format: 'number', width: 20 },
    'BL': { field: 'carRentalLe', header: 'Car Rental LE', format: 'number', width: 15 },
    'BM': { field: 'carGasolineLe', header: 'Car Gasoline LE', format: 'number', width: 18 },
    'BN': { field: 'carRepairLe', header: 'Car Repair LE', format: 'number', width: 15 },
    'BO': { field: 'medicalOutsideLe', header: 'Medical Outside LE', format: 'number', width: 18 },
    'BP': { field: 'medicalInhouseLe', header: 'Medical Inhouse LE', format: 'number', width: 18 },
    'BQ': { field: 'staffActivitiesLe', header: 'Staff Activities LE', format: 'number', width: 18 },
    'BR': { field: 'uniformLe', header: 'Uniform LE', format: 'number', width: 15 },
    'BS': { field: 'lifeInsuranceLe', header: 'Life Insurance LE', format: 'number', width: 18 },
    'BT': { field: 'peMthLe', header: 'PE Monthly LE', format: 'number', width: 15 },
    'BU': { field: 'peYearLe', header: 'PE Annual LE', format: 'number', width: 15 },
    'BV': { field: 'peSbMthLe', header: 'PE SB Monthly LE', format: 'number', width: 18 },
    'BW': { field: 'peSbYearLe', header: 'PE SB Year LE', format: 'number', width: 18 },

    // ──────────────────────────────────────────────────────────────────────
    // Y2025 BUDGET SECTION (Columns BX-DT) - 47 fields
    // ──────────────────────────────────────────────────────────────────────
    'BX': { field: 'payroll', header: 'Payroll', format: 'number', width: 15 },
    'BY': { field: 'premium', header: 'Premium', format: 'number', width: 15 },
    'BZ': { field: 'salWithEn', header: 'Basic Salary with EN', format: 'number', width: 20 },
    'CA': { field: 'salNotEn', header: 'Basic Salary not EN', format: 'number', width: 20 },
    'CB': { field: 'bonusType', header: 'Bonus Type', format: 'text', width: 15, highlight: 'yellow' },
    'CC': { field: 'bonus', header: 'Bonus', format: 'number', width: 15 },
    'CD': { field: 'salTemp', header: 'Salary (Temp)', format: 'number', width: 18 },
    'CE': { field: 'socialSecurityTmp', header: 'Social Security (Temp)', format: 'number', width: 22 },
    'CF': { field: 'southriskAllowanceTmp', header: 'South Risk Allowance (Temp)', format: 'number', width: 25 },
    'CG': { field: 'carMaintenanceTmp', header: 'Car Maintenance (Temp)', format: 'number', width: 22 },
    'CH': { field: 'salesManagementPc', header: 'Sales Management PC', format: 'number', width: 20 },
    'CI': { field: 'shelfStackingPc', header: 'Shelf Stacking PC', format: 'number', width: 20 },
    'CJ': { field: 'diligenceAllowancePc', header: 'Diligence Allowance PC', format: 'number', width: 22 },
    'CK': { field: 'postAllowancePc', header: 'Post Allowance PC', format: 'number', width: 20 },
    'CL': { field: 'phoneAllowancePc', header: 'Phone Allowance PC', format: 'number', width: 20 },
    'CM': { field: 'transportationPc', header: 'Transportation PC', format: 'number', width: 20 },
    'CN': { field: 'skillAllowancePc', header: 'Skill Allowance PC', format: 'number', width: 20 },
    'CO': { field: 'otherAllowancePc', header: 'Other Allowance PC', format: 'number', width: 20 },
    'CP': { field: 'temporaryStaffSal', header: 'Temporary Staff Salary', format: 'number', width: 22 },
    'CQ': { field: 'socialSecurity', header: 'Social Security Fund', format: 'number', width: 20 },
    'CR': { field: 'providentFund', header: 'Provident Fund', format: 'number', width: 18 },
    'CS': { field: 'workmenCompensation', header: 'Workmen Compensation', format: 'number', width: 22 },
    'CT': { field: 'housingAllowance', header: 'Housing Allowance', format: 'number', width: 20 },
    'CU': { field: 'salesCarAllowance', header: 'Sales Car Allowance', format: 'number', width: 20 },
    'CV': { field: 'accommodation', header: 'Accommodation', format: 'number', width: 18 },
    'CW': { field: 'carMaintenance', header: 'Car Maintenance', format: 'number', width: 18 },
    'CX': { field: 'southriskAllowance', header: 'South Risk Allowance', format: 'number', width: 22 },
    'CY': { field: 'mealAllowance', header: 'Meal Allowance', format: 'number', width: 18 },
    'CZ': { field: 'other', header: 'Other Benefits', format: 'number', width: 18 },
    'DA': { field: 'othersSubjectTax', header: 'Others Subject to Tax', format: 'number', width: 22 },
    'DB': { field: 'carAllowance', header: 'Car Allowance', format: 'number', width: 18 },
    'DC': { field: 'licenseAllowance', header: 'License Allowance', format: 'number', width: 20 },
    'DD': { field: 'outsourceWages', header: 'Outsource Wages', format: 'number', width: 18 },
    'DE': { field: 'compCarsGas', header: 'Company Cars Gasoline', format: 'number', width: 22 },
    'DF': { field: 'compCarsOther', header: 'Company Cars Other', format: 'number', width: 20 },
    'DG': { field: 'carRental', header: 'Car Rental', format: 'number', width: 15 },
    'DH': { field: 'carGasoline', header: 'Car Gasoline', format: 'number', width: 18 },
    'DI': { field: 'carRepair', header: 'Car Repair', format: 'number', width: 15 },
    'DJ': { field: 'medicalOutside', header: 'Medical Outside', format: 'number', width: 18 },
    'DK': { field: 'medicalInhouse', header: 'Medical Inhouse', format: 'number', width: 18 },
    'DL': { field: 'staffActivities', header: 'Staff Activities', format: 'number', width: 18 },
    'DM': { field: 'uniform', header: 'Uniform', format: 'number', width: 15 },
    'DN': { field: 'lifeInsurance', header: 'Life Insurance', format: 'number', width: 18 },
    'DO': { field: 'peMth', header: 'PE Monthly', format: 'number', width: 15 },
    'DP': { field: 'peYear', header: 'PE Annual', format: 'number', width: 15 },
    'DQ': { field: 'peSbMth', header: 'PE SB Monthly', format: 'number', width: 18 },
    'DR': { field: 'peSbYear', header: 'PE SB Year', format: 'number', width: 18 },

    // ──────────────────────────────────────────────────────────────────────
    // PE SUMMARY & CONFIG SECTION (Columns DS-EG) - 14 fields (removed LEVEL_GROU_2)
    // ──────────────────────────────────────────────────────────────────────
    'DS': { field: 'costCenterCode', header: 'Cost Center', format: 'text', width: 15, highlight: 'yellow' },
    'DT': { field: 'salaryStructure', header: 'Salary Structure', format: 'text', width: 20 },
    'DU': { field: 'peMthLe', header: 'PE (Mth)', format: 'number', width: 15 },
    'DV': { field: 'peYearLe', header: 'PE (Year)', format: 'number', width: 15 },
    'DW': { field: 'peMth', header: 'PE (Mth)', format: 'number', width: 15 },
    'DX': { field: 'peYear', header: 'PE (Year)', format: 'number', width: 15 },
    'DY': { field: 'runrateCode', header: 'Run Rate Group', format: 'text', width: 25 },
    'DZ': { field: 'discount', header: 'Discount', format: 'percentage', width: 12 },
    'EA': { field: 'executive', header: 'Executive', format: 'text', width: 10 },
    'EB': { field: 'nonExec', header: 'Non - Exc.', format: 'text', width: 10, computed: true },
    'EC': { field: 'focusHc', header: 'Focus HC', format: 'text', width: 10 },
    'ED': { field: 'focusPe', header: 'Focus PE', format: 'text', width: 10 },
    'EE': { field: 'joinPvf', header: 'Join PVF', format: 'text', width: 10 },
    'EF': { field: 'pvf', header: 'Join PVF', format: 'number', width: 10, highlight: 'yellow' }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // 📊 BIG C COLUMN MAPPING (140+ columns)
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * BIG C Column Mapping
   * Maps Excel columns to field data from AG Grid
   */
  const BIGC_COLUMN_MAPPING = {
    // ──────────────────────────────────────────────────────────────────────
    // BASIC INFORMATION (Columns A-M)
    // ──────────────────────────────────────────────────────────────────────
    'A': { field: 'cobu', header: 'Format', format: 'text', width: 12 },
    'B': { field: 'division', header: 'Division', format: 'text', width: 20 },
    'C': { field: 'department', header: 'Department', format: 'text', width: 20 },
    'D': { field: 'section', header: 'Section', format: 'text', width: 20 },
    'E': { field: 'storeName', header: 'Store Name', format: 'text', width: 20 },
    'F': { field: 'empCode', header: 'Employee ID', format: 'text', width: 12 },
    'G': { field: 'titleTh', header: 'Title(TH)', format: 'text', width: 10 },
    'H': { field: 'fnameTh', header: 'Name(TH)', format: 'text', width: 15 },
    'I': { field: 'lnameTh', header: 'Lastname(TH)', format: 'text', width: 15 },
    'J': { field: 'titleEn', header: 'Title(EN)', format: 'text', width: 10 },
    'K': { field: 'fnameEn', header: 'Name(EN)', format: 'text', width: 15 },
    'L': { field: 'lnameEn', header: 'Lastname(EN)', format: 'text', width: 15 },
    'M': { field: 'costCenterCode', header: 'Cost Center', format: 'text', width: 12 },

    // ──────────────────────────────────────────────────────────────────────
    // POSITION & JOB INFO (Columns N-T)
    // ──────────────────────────────────────────────────────────────────────
    'N': { field: 'positionName', header: 'Position', format: 'text', width: 30 },
    'O': { field: 'positionCode', header: 'Position Code', format: 'text', width: 12 },
    'P': { field: 'jobBand', header: 'Job Band', format: 'text', width: 10 },
    'Q': { field: 'joinDate', header: 'Join Date', format: 'date', width: 12 },
    'R': { field: 'yosCurrYear', header: 'YOS', format: 'number', width: 8 },
    'S': { field: 'empStatus', header: 'Status', format: 'text', width: 12 },
    'T': { field: 'bu', header: 'BU', format: 'text', width: 12 },
    'U': { field: 'empTypeCode', header: 'Emp Type', format: 'text', width: 12 },
    'V': { field: 'newHcCode', header: 'New HC', format: 'text', width: 12 },
    'W': { field: 'newVacPeriod', header: 'New Vac Period', format: 'text', width: 15 },
    'X': { field: 'newVacLe', header: 'New Vac LE', format: 'text', width: 12 },
    'Y': { field: 'hrbpEmpCode', header: 'HRBP(EmpId)', format: 'text', width: 12 },
    'Z': { field: 'reason', header: 'Reason', format: 'text', width: 30 },
    'AA': { field: 'leOfMonth', header: 'LE Of Month', format: 'number', width: 12 },
    'AB': { field: 'noOfMonth', header: 'No Of Month', format: 'number', width: 12 },

    // ──────────────────────────────────────────────────────────────────────
    // LE 2025 SECTION (Columns AC-AZ) - Yellow highlight section
    // ──────────────────────────────────────────────────────────────────────
    'AC': { field: 'payrollLe', header: 'Payroll LE', format: 'number', width: 15 },
    'AD': { field: 'premiumLe', header: 'Premium LE', format: 'number', width: 15 },
    'AE': { field: 'totalPayrollLe', header: 'Total Payroll LE', format: 'number', width: 18 },
    'AF': { field: 'bonusLe', header: 'Bonus LE', format: 'number', width: 15 },
    'AG': { field: 'fleetCardPeLe', header: 'Fleet Card PE LE', format: 'number', width: 18 },
    'AH': { field: 'carAllowanceLe', header: 'Car Allowance LE', format: 'number', width: 18 },
    'AI': { field: 'licenseAllowanceLe', header: 'License Allowance LE', format: 'number', width: 20 },
    'AJ': { field: 'housingAllowanceLe', header: 'Housing Allowance LE', format: 'number', width: 20 },
    'AK': { field: 'gasolineAllowanceLe', header: 'Gasoline Allowance LE', format: 'number', width: 20 },
    'AL': { field: 'wageStudentLe', header: 'Wage Student LE', format: 'number', width: 18 },
    'AM': { field: 'carRentalPeLe', header: 'Car Rental PE LE', format: 'number', width: 18 },
    'AN': { field: 'skillPayAllowanceLe', header: 'Skill Pay Allowance LE', format: 'number', width: 20 },
    'AO': { field: 'otherAllowanceLe', header: 'Other Allowance LE', format: 'number', width: 18 },
    'AP': { field: 'socialSecurityLe', header: 'Social Security LE', format: 'number', width: 18 },
    'AQ': { field: 'laborFundFeeLe', header: 'Labor Fund Fee LE', format: 'number', width: 18 },
    'AR': { field: 'otherStaffBenefitLe', header: 'Other Staff Benefit LE', format: 'number', width: 20 },
    'AS': { field: 'providentFundLe', header: 'Provident Fund LE', format: 'number', width: 18 },
    'AT': { field: 'employeeWelfareLe', header: 'Employee Welfare LE', format: 'number', width: 20 },
    'AU': { field: 'provisionLe', header: 'Provision LE', format: 'number', width: 15 },
    'AV': { field: 'interestLe', header: 'Interest LE', format: 'number', width: 15 },
    'AW': { field: 'staffInsuranceLe', header: 'Staff Insurance LE', format: 'number', width: 18 },
    'AX': { field: 'medicalExpenseLe', header: 'Medical Expense LE', format: 'number', width: 18 },
    'AY': { field: 'medicalInhouseLe', header: 'Medical Inhouse LE', format: 'number', width: 18 },
    'AZ': { field: 'trainingLe', header: 'Training LE', format: 'number', width: 15 },
    'BA': { field: 'longServiceLe', header: 'Long Service LE', format: 'number', width: 18 },
    'BB': { field: 'peSbMthLe', header: 'PE SB Monthly LE', format: 'number', width: 18 },
    'BC': { field: 'peSbYearLe', header: 'PE SB Year LE', format: 'number', width: 18 },

    // ──────────────────────────────────────────────────────────────────────
    // Y2025 BUDGET SECTION (Columns BD-CA) - Blue background
    // ──────────────────────────────────────────────────────────────────────
    'BD': { field: 'payroll', header: 'Payroll', format: 'number', width: 15 },
    'BE': { field: 'premium', header: 'Premium', format: 'number', width: 15 },
    'BF': { field: 'totalPayroll', header: 'Total Payroll', format: 'number', width: 18 },
    'BG': { field: 'bonus', header: 'Bonus', format: 'number', width: 15 },
    'BH': { field: 'bonusTypes', header: 'Bonus Type', format: 'text', width: 20, highlight: 'yellow' },
    'BI': { field: 'fleetCardPe', header: 'Fleet Card PE', format: 'number', width: 18 },
    'BJ': { field: 'carAllowance', header: 'Car Allowance', format: 'number', width: 18 },
    'BK': { field: 'licenseAllowance', header: 'License Allowance', format: 'number', width: 20 },
    'BL': { field: 'housingAllowance', header: 'Housing Allowance', format: 'number', width: 20 },
    'BM': { field: 'gasolineAllowance', header: 'Gasoline Allowance', format: 'number', width: 20 },
    'BN': { field: 'wageStudent', header: 'Wage Student', format: 'number', width: 18 },
    'BO': { field: 'carRentalPe', header: 'Car Rental PE', format: 'number', width: 18 },
    'BP': { field: 'skillPayAllowance', header: 'Skill Pay Allowance', format: 'number', width: 20 },
    'BQ': { field: 'otherAllowance', header: 'Other Allowance', format: 'number', width: 18 },
    'BR': { field: 'socialSecurity', header: 'Social Security', format: 'number', width: 18 },
    'BS': { field: 'laborFundFee', header: 'Labor Fund Fee', format: 'number', width: 18 },
    'BT': { field: 'otherStaffBenefit', header: 'Other Staff Benefit', format: 'number', width: 20 },
    'BU': { field: 'providentFund', header: 'Provident Fund', format: 'number', width: 18 },
    'BV': { field: 'employeeWelfare', header: 'Employee Welfare', format: 'number', width: 20 },
    'BW': { field: 'provision', header: 'Provision', format: 'number', width: 15 },
    'BX': { field: 'interest', header: 'Interest', format: 'number', width: 15 },
    'BY': { field: 'staffInsurance', header: 'Staff Insurance', format: 'number', width: 18 },
    'BZ': { field: 'medicalExpense', header: 'Medical Expense', format: 'number', width: 18 },
    'CA': { field: 'medicalInhouse', header: 'Medical Inhouse', format: 'number', width: 18 },
    'CB': { field: 'training', header: 'Training', format: 'number', width: 15 },
    'CC': { field: 'longService', header: 'Long Service', format: 'number', width: 18 },
    'CD': { field: 'peSbMth', header: 'PE SB Monthly', format: 'number', width: 18 },
    'CE': { field: 'peSbYear', header: 'PE SB Year', format: 'number', width: 18 },

    // ──────────────────────────────────────────────────────────────────────
    // PE SUMMARY & CONFIG SECTION (Columns CF-CT) - 14 fields (removed LEVEL_GROU_2)
    // ──────────────────────────────────────────────────────────────────────
    'CF': { field: 'costCenterPlan', header: 'Cost Center', format: 'text', width: 15, highlight: 'yellow' },
    'CG': { field: 'salaryStructure', header: 'Salary Structure', format: 'text', width: 20 },
    'CH': { field: 'peMthLe', header: 'PE (Mth)', format: 'number', width: 15 },
    'CI': { field: 'peYearLe', header: 'PE (Year)', format: 'number', width: 15 },
    'CJ': { field: 'peMth', header: 'PE (Mth)', format: 'number', width: 15 },
    'CK': { field: 'peYear', header: 'PE (Year)', format: 'number', width: 15 },
    'CL': { field: 'runrateCode', header: 'Run Rate Group', format: 'text', width: 25 },
    'CM': { field: 'discount', header: 'Discount', format: 'percentage', width: 12 },
    'CN': { field: 'executive', header: 'Executive', format: 'text', width: 10 },
    'CO': { field: 'nonExec', header: 'Non - Exc.', format: 'text', width: 10, computed: true },
    'CP': { field: 'focusHc', header: 'Focus HC', format: 'text', width: 10 },
    'CQ': { field: 'focusPe', header: 'Focus PE', format: 'text', width: 10 },
    'CR': { field: 'joinPvf', header: 'Join PVF', format: 'text', width: 10 },
    'CS': { field: 'pvf', header: 'Join PVF', format: 'number', width: 10, highlight: 'yellow' }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // 🔗 SECTION HEADER CELLS CONFIGURATION (Row 2)
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * BJC Section Header Cells (Row 2 - Section Headers)
   * Each cell in the range will have the same value (not merged)
   * Last column: EF (136) - removed ranges >= EG (137+)
   */
  const BJC_SECTION_HEADER_CELLS = [
    { range: 'AC2:BW2', value: 'LE 2024', color: 'YELLOW', fontColor: 'BLACK' },
    { range: 'BX2:DR2', value: 'Y 2024', color: 'BLUE', fontColor: 'WHITE' },
    { range: 'DU2:DV2', value: 'Y 2025', color: 'BLUE', fontColor: 'WHITE' }
    // Removed: DW2:DX2 (columns 133-134 are within range but DW > EF, removing for consistency)
  ];

  /**
   * BIG C Section Header Cells (Row 2 - Section Headers)
   * Each cell in the range will have the same value (not merged)
   * Last column: CS (97) - removed ranges >= CT (98+)
   */
  const BIGC_SECTION_HEADER_CELLS = [
    { range: 'V3:W3', value: 'Y 2025', color: 'YELLOW', fontColor: 'BLACK' },
    { range: 'X3:X3', value: 'LE 2024', color: 'YELLOW', fontColor: 'BLACK' },
    { range: 'AC2:BC2', value: 'Y 2024', color: 'YELLOW', fontColor: 'BLACK' },
    { range: 'BD2:CE2', value: 'Y 2025', color: 'BLUE', fontColor: 'WHITE' }
    // Removed: CH2:CI2 (columns 86-87, CH > CS, removing)
    // Removed: CJ2:CK2 (columns 88-89, CJ > CS, removing)
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // 📐 ROW STYLING CONFIGURATION
  // ══════════════════════════════════════════════════════════════════════════

  // ══════════════════════════════════════════════════════════════════════════
  // 🏢 BJC CONFIGURATION (Company ID = '1')
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * BJC Row 1: Red "Fill" Header Configuration
   */
  const BJC_ROW1_CONFIG = {
    height: 25,
    text: 'Fill',
    style: {
      fill: {
        color: 'RED'  // Reference to EXCEL_COLORS.RED
      },
      font: {
        name: 'Tahoma',
        size: 11,
        bold: true,
        color: 'WHITE'  // Reference to EXCEL_COLORS.WHITE
      },
      border: {
        style: 'thin',   // 'thin', 'medium', 'thick', 'dotted', 'dashed'
        color: 'BLACK'   // Reference to EXCEL_COLORS.BLACK
      },
      alignment: {
        horizontal: 'center',  // 'left', 'center', 'right'
        vertical: 'middle'     // 'top', 'middle', 'bottom'
      }
    },
    // Enhanced styling for highlighted Fill columns
    highlightColumns: {
      font: {
        size: 12,  // +1 from default
        bold: true
      },
      border: {
        style: 'medium'  // Thicker border for emphasis
      }
    }
  };

  /**
   * BJC Row 2: Section Headers Configuration
   */
  const BJC_ROW2_CONFIG = {
    height: 30,
    style: {
      font: {
        name: 'Tahoma',
        size: 11,
        bold: true
        // color will come from merged cells config (fontColor)
      },
      border: {
        style: 'thin',
        color: 'BLACK'
      },
      alignment: {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true
      }
    }
  };

  /**
   * BJC Row 3: Spacing Row Configuration
   */
  const BJC_ROW3_CONFIG = {
    height: 25,
    visible: true,  // Set to false to hide this row
    style: {
      fill: {
        color: 'NONE'  // Transparent/no fill
      },
      border: {
        style: 'none',  // No borders for spacing row
        color: 'BLACK'
      }
    }
  };

  /**
   * BJC Row 4: Column Headers Configuration
   */
  const BJC_ROW4_CONFIG = {
    height: 25,
    style: {
      font: {
        name: 'Tahoma',
        size: 11,
        bold: true,
        color: 'BLACK'
      },
      fill: {
        default: 'LIGHT_GRAY',    // Default background for normal columns
        highlight: 'YELLOW'        // Background for columns with highlight: 'yellow'
      },
      border: {
        style: 'thin',
        color: 'BLACK'
      },
      alignment: {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true
      }
    }
  };

  /**
   * BJC Cell Range Styles
   */
  const BJC_CELL_RANGE_STYLES = [
    // BJC-specific cell range styles
    // Example:
    // {
    //   range: 'A5:B100',
    //   style: {
    //     fill: { color: 'LIGHT_BLUE' },
    //     alignment: { horizontal: 'left' }
    //   }
    // }
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // 🏢 BIG C CONFIGURATION (Company ID = '2')
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * BIG C Row 1: Red "Fill" Header Configuration
   */
  const BIGC_ROW1_CONFIG = {
    height: 25,
    text: 'Fill',
    style: {
      fill: {
        color: 'RED'  // Same as BJC by default
      },
      font: {
        name: 'Tahoma',
        size: 11,
        bold: true,
        color: 'WHITE'
      },
      border: {
        style: 'thin',
        color: 'BLACK'
      },
      alignment: {
        horizontal: 'center',
        vertical: 'middle'
      }
    },
    highlightColumns: {
      font: {
        size: 12,
        bold: true
      },
      border: {
        style: 'medium'
      }
    }
  };

  /**
   * BIG C Row 2: Section Headers Configuration
   */
  const BIGC_ROW2_CONFIG = {
    height: 30,
    style: {
      font: {
        name: 'Tahoma',
        size: 11,
        bold: true
      },
      border: {
        style: 'thin',
        color: 'BLACK'
      },
      alignment: {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true
      }
    }
  };

  /**
   * BIG C Row 3: Spacing Row Configuration
   */
  const BIGC_ROW3_CONFIG = {
    height: 25,
    visible: true,
    style: {
      fill: {
        color: 'NONE'
      },
      border: {
        style: 'none',
        color: 'BLACK'
      }
    }
  };

  /**
   * BIG C Row 4: Column Headers Configuration
   */
  const BIGC_ROW4_CONFIG = {
    height: 25,
    style: {
      font: {
        name: 'Tahoma',
        size: 11,
        bold: true,
        color: 'BLACK'
      },
      fill: {
        default: 'LIGHT_GRAY',
        highlight: 'YELLOW'
      },
      border: {
        style: 'thin',
        color: 'BLACK'
      },
      alignment: {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true
      }
    }
  };

  /**
   * BIG C Cell Range Styles
   */
  const BIGC_CELL_RANGE_STYLES = [
    // BIG C-specific cell range styles
    // Example:
    // {
    //   range: 'A5:B100',
    //   style: {
    //     fill: { color: 'LIGHT_ORANGE' }
    //   }
    // }
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // 📋 DATA FORMATS & ALIGNMENT
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Data Format Patterns
   */
  const DATA_FORMATS = {
    text: '@',
    number: '#,##0',
    decimal: '#,##0.00',
    percentage: '0.00%',
    date: 'dd/mm/yyyy',
    datetime: 'dd/mm/yyyy hh:mm'
  };

  /**
   * Alignment Configurations
   */
  const ALIGNMENT_CONFIGS = {
    text: { horizontal: 'left', vertical: 'middle' },
    number: { horizontal: 'right', vertical: 'middle' },
    decimal: { horizontal: 'right', vertical: 'middle' },
    percentage: { horizontal: 'right', vertical: 'middle' },
    date: { horizontal: 'center', vertical: 'middle' },
    datetime: { horizontal: 'center', vertical: 'middle' }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // 🌐 EXPORT TO GLOBAL SCOPE
  // ══════════════════════════════════════════════════════════════════════════

  window.EXCEL_CONFIG = {
    // Colors
    COLORS: EXCEL_COLORS,
    FONTS: FONT_CONFIGS,

    // Fill Columns
    BJC_FILL_COLUMNS: BJC_FILL_COLUMNS,
    BIGC_FILL_COLUMNS: BIGC_FILL_COLUMNS,

    // Column Mappings
    BJC_COLUMN_MAPPING: BJC_COLUMN_MAPPING,
    BIGC_COLUMN_MAPPING: BIGC_COLUMN_MAPPING,

    // Section Header Cells (Row 2)
    BJC_SECTION_HEADER_CELLS: BJC_SECTION_HEADER_CELLS,
    BIGC_SECTION_HEADER_CELLS: BIGC_SECTION_HEADER_CELLS,

    // Data Formats
    DATA_FORMATS: DATA_FORMATS,
    ALIGNMENT_CONFIGS: ALIGNMENT_CONFIGS,

    // ══════════════════════════════════════════════════════════════════════
    // 🏢 COMPANY-SPECIFIC CONFIGURATIONS
    // ══════════════════════════════════════════════════════════════════════

    /**
     * BJC Configuration (Company ID = '1')
     */
    BJC_CONFIG: {
      ROW_STYLES: {
        ROW1: BJC_ROW1_CONFIG,
        ROW2: BJC_ROW2_CONFIG,
        ROW3: BJC_ROW3_CONFIG,
        ROW4: BJC_ROW4_CONFIG
      },
      CELL_RANGE_STYLES: BJC_CELL_RANGE_STYLES
    },

    /**
     * BIG C Configuration (Company ID = '2')
     */
    BIGC_CONFIG: {
      ROW_STYLES: {
        ROW1: BIGC_ROW1_CONFIG,
        ROW2: BIGC_ROW2_CONFIG,
        ROW3: BIGC_ROW3_CONFIG,
        ROW4: BIGC_ROW4_CONFIG
      },
      CELL_RANGE_STYLES: BIGC_CELL_RANGE_STYLES
    },

    // ══════════════════════════════════════════════════════════════════════
    // 🔄 BACKWARD COMPATIBILITY (Fallback to BJC)
    // ══════════════════════════════════════════════════════════════════════

    /**
     * @deprecated Use BJC_CONFIG or BIGC_CONFIG instead
     * Kept for backward compatibility with old code
     */
    ROW_STYLES: {
      ROW1: BJC_ROW1_CONFIG,
      ROW2: BJC_ROW2_CONFIG,
      ROW3: BJC_ROW3_CONFIG,
      ROW4: BJC_ROW4_CONFIG
    },
    CELL_RANGE_STYLES: BJC_CELL_RANGE_STYLES
  };

  console.log('✅ Budget Plan Excel Config loaded');
  console.log('   📦 Available: window.EXCEL_CONFIG');
  console.log(`   🏢 BJC Fill Columns: ${BJC_FILL_COLUMNS.length}`);
  console.log(`   🏢 BIG C Fill Columns: ${BIGC_FILL_COLUMNS.length}`);
  console.log(`   📊 BJC Column Mappings: ${Object.keys(BJC_COLUMN_MAPPING).length}`);
  console.log(`   📊 BIG C Column Mappings: ${Object.keys(BIGC_COLUMN_MAPPING).length}`);
  console.log(`   🎨 Company-Specific Configs: BJC_CONFIG, BIGC_CONFIG`);

})();
