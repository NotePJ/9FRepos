/**
 * Budget Benefits Templates Manager
 * Manages dynamic generation of Benefits forms based on company baseColumns
 * Updated: October 3, 2025 - Uses centralized configurations from budget.config.js
 */

// Benefits Base Columns Configuration
const BENEFITS_BASE_COLUMNS = {
  BJC: {
    companyId: '1',
    companyCode: 'BJC',
    companyName: 'BJC',

    // LE Benefits Fields for BJC
    le_benefits: {
      // Core fields (always present)
      core: [
        { id: 'editLePayroll', name: 'LePayroll', label: 'Payroll LE', required: true, type: 'number', hasCalc: true },
        { id: 'editLePremium', name: 'LePremium', label: 'Premium LE', type: 'number' },
        { id: 'editLeBonusType', name: 'LeBonusType', label: 'Bonus Type LE', type: 'select' }
      ],

      // BJC-specific allowances
      allowances: [
        { id: 'editLeBonus', name: 'LeBonus', label: 'Bonus', type: 'number' },
        { id: 'editLeCarAllowance', name: 'LeCarAllowance', label: 'Car Allowance', type: 'number' },
        { id: 'editLeLicenseAllowance', name: 'LeLicenseAllowance', label: 'License Allowance', type: 'number' },
        { id: 'editLeHousingAllowance', name: 'LeHousingAllowance', label: 'Housing Allowance', type: 'number' },
        { id: 'editLeCarGasoline', name: 'LeCarGasoline', label: 'Car Gasoline', type: 'number' },
        { id: 'editLeOutsourceWages', name: 'LeOutsourceWages', label: 'Outsource Wages', type: 'number' },
        { id: 'editLeSkillAllowancePc', name: 'LeSkillAllowancePc', label: 'Skill Pay Allowance', type: 'number' },
        { id: 'editLeSalesManagementPc', name: 'LeSalesManagementPc', label: 'Sales Management - PC', type: 'number' },
        { id: 'editLeShelfStackingPc', name: 'LeShelfStackingPc', label: 'Shelf Stacking - PC', type: 'number' },
        { id: 'editLeDiligenceAllowancePc', name: 'LeDiligenceAllowancePc', label: 'Diligence Allowance - PC', type: 'number' },
        { id: 'editLePostAllowancePc', name: 'LePostAllowancePc', label: 'Post Allowance - PC', type: 'number' },
        { id: 'editLePhoneAllowancePc', name: 'LePhoneAllowancePc', label: 'Phone Allowance - PC', type: 'number' },
        { id: 'editLeTransportationPc', name: 'LeTransportationPc', label: 'Transportation - PC', type: 'number' },
        { id: 'editLeOtherAllowancePc', name: 'LeOtherAllowancePc', label: 'Other Allowance - PC', type: 'number' }
      ],

      // Car & Fleet Section
      carFleet: [
        { id: 'editLeCompCarsGas', name: 'LeCompCarsGas', label: 'Company Cars Gas', type: 'number' },
        { id: 'editLeCompCarsOther', name: 'LeCompCarsOther', label: 'Company Cars Other', type: 'number' },
        { id: 'editLeCarRental', name: 'LeCarRental', label: 'Car Rental', type: 'number' },
        { id: 'editLeCarRepair', name: 'LeCarRepair', label: 'Car Repair', type: 'number' },
        { id: 'editLeCarMaintenance', name: 'LeCarMaintenance', label: 'Car Maintenance', type: 'number' }
      ],

      // BJC-Specific Fields
      bjcSpecific: [
        { id: 'editLeTemporaryStaffSal', name: 'LeTemporaryStaffSal', label: 'Temporary Staff Salary', type: 'number' },
        { id: 'editLeSalTemp', name: 'LeSalTemp', label: 'Salary Temporary', type: 'number' },
        { id: 'editLeSocialSecurityTmp', name: 'LeSocialSecurityTmp', label: 'Social Security Temp', type: 'number' },
        { id: 'editLeCarMaintenanceTmp', name: 'LeCarMaintenanceTmp', label: 'Car Maintenance Temp', type: 'number' },
        { id: 'editLeSouthriskAllowance', name: 'LeSouthriskAllowance', label: 'South Risk Allowance', type: 'number' },
        { id: 'editLeSouthriskAllowanceTmp', name: 'LeSouthriskAllowanceTmp', label: 'South Risk Allowance Temp', type: 'number' },
        { id: 'editLeSalesCarAllowance', name: 'LeSalesCarAllowance', label: 'Sales Car Allowance', type: 'number' },
        { id: 'editLeAccommodation', name: 'LeAccommodation', label: 'Accommodation', type: 'number' },
        { id: 'editLeOthersSubjectTax', name: 'LeOthersSubjectTax', label: 'Others Subject Tax', type: 'number' },
        { id: 'editLeSalWithEn', name: 'LeSalWithEn', label: 'Salary With EN', type: 'number' },
        { id: 'editLeSalNotEn', name: 'LeSalNotEn', label: 'Salary Not EN', type: 'number' }
      ],

      // BJC-specific benefits
      benefits: [
        { id: 'editLeSocialSecurity', name: 'LeSocialSecurity', label: 'Social Security', type: 'number' },
        { id: 'editLeWorkmenCompensation', name: 'LeWorkmenCompensation', label: 'Workmen Compensation', type: 'number' },
        { id: 'editLeProvidentFund', name: 'LeProvidentFund', label: 'Provident Fund', type: 'number' },
        { id: 'editLeOther', name: 'LeOther', label: 'Other Benefits', type: 'number' },
        { id: 'editLeLifeInsurance', name: 'LeLifeInsurance', label: 'Life Insurance', type: 'number' },
        { id: 'editLeMedicalOutside', name: 'LeMedicalOutside', label: 'Medical - Outside', type: 'number' },
        { id: 'editLeMedicalInHouse', name: 'LeMedicalInHouse', label: 'Medical - In House', type: 'number' },
        { id: 'editLeStaffActivities', name: 'LeStaffActivities', label: 'Staff Activities', type: 'number' },
        { id: 'editLeUniform', name: 'LeUniform', label: 'Uniform', type: 'number' },
        { id: 'editLeMealAllowance', name: 'LeMealAllowance', label: 'Meal Allowance', type: 'number' }
      ],

      // BJC-specific PE calculations
      calculations: [
        { id: 'editLePeMth', name: 'LePeMth', label: 'PE Monthly', type: 'number' },
        { id: 'editLePeYear', name: 'LePeYear', label: 'PE Annual', type: 'number' },
        { id: 'editLePeSbMth', name: 'LePeSbMth', label: 'PE + SB Monthly', type: 'number' },
        { id: 'editLePeSbYear', name: 'LePeSbYear', label: 'PE + SB Year', type: 'number' }
      ]
    },

    // Budget Year Benefits Fields for BJC
    bg_benefits: {
      // Core fields
      core: [
        { id: 'editBgPayroll', name: 'BgPayroll', label: 'Payroll', required: true, type: 'number', hasCalc: true },
        { id: 'editBgPremium', name: 'BgPremium', label: 'Premium', type: 'number' },
        { id: 'editBgBonusType', name: 'BgBonusType', label: 'Bonus Type', type: 'select' }
      ],

      // BJC-specific allowances
      allowances: [
        { id: 'editBgBonus', name: 'BgBonus', label: 'Bonus', type: 'number' },
        { id: 'editBgCarAllowance', name: 'BgCarAllowance', label: 'Car Allowance', type: 'number' },
        { id: 'editBgLicenseAllowance', name: 'BgLicenseAllowance', label: 'License Allowance', type: 'number' },
        { id: 'editBgHousingAllowance', name: 'BgHousingAllowance', label: 'Housing Allowance', type: 'number' },
        { id: 'editBgCarGasoline', name: 'BgCarGasoline', label: 'Car Gasoline', type: 'number' },
        { id: 'editBgOutsourceWages', name: 'BgOutsourceWages', label: 'Outsource Wages', type: 'number' },
        { id: 'editBgSkillAllowancePc', name: 'BgSkillAllowancePc', label: 'Skill Pay Allowance', type: 'number' },
        { id: 'editBgSalesManagementPc', name: 'BgSalesManagementPc', label: 'Sales Management - PC', type: 'number' },
        { id: 'editBgShelfStackingPc', name: 'BgShelfStackingPc', label: 'Shelf Stacking - PC', type: 'number' },
        { id: 'editBgDiligenceAllowancePc', name: 'BgDiligenceAllowancePc', label: 'Diligence Allowance - PC', type: 'number' },
        { id: 'editBgPostAllowancePc', name: 'BgPostAllowancePc', label: 'Post Allowance - PC', type: 'number' },
        { id: 'editBgPhoneAllowancePc', name: 'BgPhoneAllowancePc', label: 'Phone Allowance - PC', type: 'number' },
        { id: 'editBgTransportationPc', name: 'BgTransportationPc', label: 'Transportation - PC', type: 'number' },
        { id: 'editBgOtherAllowancePc', name: 'BgOtherAllowancePc', label: 'Other Allowance - PC', type: 'number' }
      ],

      // Car & Fleet Section
      carFleet: [
        { id: 'editBgCompCarsGas', name: 'BgCompCarsGas', label: 'Company Cars Gas', type: 'number' },
        { id: 'editBgCompCarsOther', name: 'BgCompCarsOther', label: 'Company Cars Other', type: 'number' },
        { id: 'editBgCarRental', name: 'BgCarRental', label: 'Car Rental', type: 'number' },
        { id: 'editBgCarRepair', name: 'BgCarRepair', label: 'Car Repair', type: 'number' },
        { id: 'editBgCarMaintenance', name: 'BgCarMaintenance', label: 'Car Maintenance', type: 'number' }
      ],

      // BJC-Specific Fields
      bjcSpecific: [
        { id: 'editBgTemporaryStaffSal', name: 'BgTemporaryStaffSal', label: 'Temporary Staff Salary', type: 'number' },
        { id: 'editBgSalTemp', name: 'BgSalTemp', label: 'Salary Temporary', type: 'number' },
        { id: 'editBgSocialSecurityTmp', name: 'BgSocialSecurityTmp', label: 'Social Security Temp', type: 'number' },
        { id: 'editBgCarMaintenanceTmp', name: 'BgCarMaintenanceTmp', label: 'Car Maintenance Temp', type: 'number' },
        { id: 'editBgSouthriskAllowance', name: 'BgSouthriskAllowance', label: 'South Risk Allowance', type: 'number' },
        { id: 'editBgSouthriskAllowanceTmp', name: 'BgSouthriskAllowanceTmp', label: 'South Risk Allowance Temp', type: 'number' },
        { id: 'editBgSalesCarAllowance', name: 'BgSalesCarAllowance', label: 'Sales Car Allowance', type: 'number' },
        { id: 'editBgAccommodation', name: 'BgAccommodation', label: 'Accommodation', type: 'number' },
        { id: 'editBgOthersSubjectTax', name: 'BgOthersSubjectTax', label: 'Others Subject Tax', type: 'number' },
        { id: 'editBgSalWithEn', name: 'BgSalWithEn', label: 'Salary With EN', type: 'number' },
        { id: 'editBgSalNotEn', name: 'BgSalNotEn', label: 'Salary Not EN', type: 'number' }
      ],

      // BJC-specific benefits
      benefits: [
        { id: 'editBgSocialSecurity', name: 'BgSocialSecurity', label: 'Social Security', type: 'number' },
        { id: 'editBgWorkmenCompensation', name: 'BgWorkmenCompensation', label: 'Workmen Compensation', type: 'number' },
        { id: 'editBgProvidentFund', name: 'BgProvidentFund', label: 'Provident Fund', type: 'number' },
        { id: 'editBgOther', name: 'BgOther', label: 'Other Benefits', type: 'number' },
        { id: 'editBgLifeInsurance', name: 'BgLifeInsurance', label: 'Life Insurance', type: 'number' },
        { id: 'editBgMedicalOutside', name: 'BgMedicalOutside', label: 'Medical - Outside', type: 'number' },
        { id: 'editBgMedicalInHouse', name: 'BgMedicalInHouse', label: 'Medical - In House', type: 'number' },
        { id: 'editBgStaffActivities', name: 'BgStaffActivities', label: 'Staff Activities', type: 'number' },
        { id: 'editBgUniform', name: 'BgUniform', label: 'Uniform', type: 'number' },
        { id: 'editBgMealAllowance', name: 'BgMealAllowance', label: 'Meal Allowance', type: 'number' }
      ],

      // BJC-specific PE calculations
      calculations: [
        { id: 'editBgPeMth', name: 'BgPeMth', label: 'PE Monthly', type: 'number' },
        { id: 'editBgPeYear', name: 'BgPeYear', label: 'PE Annual', type: 'number' },
        { id: 'editBgPeSbMth', name: 'BgPeSbMth', label: 'PE + SB Monthly', type: 'number' },
        { id: 'editBgPeSbYear', name: 'BgPeSbYear', label: 'PE + SB Year', type: 'number' }
      ]
    }
  },

  BIGC: {
    companyId: '2',
    companyCode: 'BIGC',
    companyName: 'BIGC',

    // LE Benefits Fields for BIGC
    le_benefits: {
      // Core fields (always present)
      core: [
        { id: 'editLePayroll', name: 'LePayroll', label: 'Payroll LE', required: true, type: 'number', hasCalc: true },
        { id: 'editLeTotalPayroll', name: 'LeTotalPayroll', label: 'Total Payroll LE', required: true, type: 'number', hasCalc: true },
        { id: 'editLePremium', name: 'LePremium', label: 'Premium LE', type: 'number' }
      ],

      // BIGC-specific allowances
      allowances: [
        { id: 'editLeBonus', name: 'LeBonus', label: 'Performance Bonus', type: 'number' },
        { id: 'editLeFleetCardPe', name: 'LeFleetCardPe', label: 'Fleet Card - Personnel Expense', type: 'number' },
        { id: 'editLeCarRentalPe', name: 'LeCarRentalPe', label: 'Car Rental - Personnel Expense', type: 'number' },
        { id: 'editLeCarAllowance', name: 'LeCarAllowance', label: 'Car Allowance', type: 'number' },
        { id: 'editLeLicenseAllowance', name: 'LeLicenseAllowance', label: 'License Allowance', type: 'number' },
        { id: 'editLeHousingAllowance', name: 'LeHousingAllowance', label: 'Housing Allowance', type: 'number' },
        { id: 'editLeGasolineAllowance', name: 'LeGasolineAllowance', label: 'Gasoline Allowance', type: 'number' },
        { id: 'editLeWageStudent', name: 'LeWageStudent', label: 'Wage Student', type: 'number' },
        { id: 'editLeOtherAllowance', name: 'LeOtherAllowance', label: 'Other Allowances', type: 'number' },
        { id: 'editLeSkillPayAllowance', name: 'LeSkillPayAllowance', label: 'Skill-based Pay', type: 'number' }
      ],

      // BIGC-specific benefits
      benefits: [
        { id: 'editLeSocialSecurity', name: 'LeSocialSecurity', label: 'Social Security Fund', type: 'number' },
        { id: 'editLeLaborFundFee', name: 'LeLaborFundFee', label: 'Labor Development Fund', type: 'number' },
        { id: 'editLeOtherStaffBenefit', name: 'LeOtherStaffBenefit', label: 'Other Staff Benefit', type: 'number' },
        { id: 'editLeProvidentFund', name: 'LeProvidentFund', label: 'Provident Fund', type: 'number' },
        { id: 'editLeEmployeeWelfare', name: 'LeEmployeeWelfare', label: 'Employee Welfare', type: 'number' },
        { id: 'editLeProvision', name: 'LeProvision', label: 'Provision', type: 'number' },
        { id: 'editLeInterest', name: 'LeInterest', label: 'Interest Income', type: 'number' },
        { id: 'editLeStaffInsurance', name: 'LeStaffInsurance', label: 'Group Insurance', type: 'number' },
        { id: 'editLeMedicalExpense', name: 'LeMedicalExpense', label: 'Medical Expense', type: 'number' },
        { id: 'editLeMedicalInHouse', name: 'LeMedicalInHouse', label: 'Medical - In House', type: 'number' },
        { id: 'editLeTraining', name: 'LeTraining', label: 'Training & Development', type: 'number' },
        { id: 'editLeLongService', name: 'LeLongService', label: 'Long Service Award', type: 'number' }
      ],

      // BIGC-specific PE calculations
      calculations: [
        { id: 'editLePeMth', name: 'LePeMth', label: 'Personnel Expense Monthly', type: 'number' },
        { id: 'editLePeYear', name: 'LePeYear', label: 'Personnel Expense Annual', type: 'number' },
        { id: 'editLePeSbMth', name: 'LePeSbMth', label: 'PE + SB Monthly', type: 'number' },
        { id: 'editLePeSbYear', name: 'LePeSbYear', label: 'PE + SB Year', type: 'number' }
      ]
    },

    // Budget Year Benefits Fields for BIGC
    bg_benefits: {
      // Core fields (always present)
      core: [
        { id: 'editBgPayroll', name: 'BgPayroll', label: 'Payroll Budget', required: true, type: 'number', hasCalc: true },
        { id: 'editBgTotalPayroll', name: 'BgTotalPayroll', label: 'Total Payroll Budget', required: true, type: 'number', hasCalc: true },
        { id: 'editBgPremium', name: 'BgPremium', label: 'Premium Budget', type: 'number' },
        { id: 'editBgBonusTypes', name: 'BgBonusTypes', label: 'Bonus Types', type: 'select' }
      ],

      // BIGC-specific allowances
      allowances: [
        { id: 'editBgBonus', name: 'BgBonus', label: 'Performance Bonus Budget', type: 'number' },
        { id: 'editBgFleetCardPe', name: 'BgFleetCardPe', label: 'Fleet Card Budget - PE', type: 'number' },
        { id: 'editBgCarRentalPe', name: 'BgCarRentalPe', label: 'Car Rental Budget - PE', type: 'number' },
        { id: 'editBgCarAllowance', name: 'BgCarAllowance', label: 'Car Allowance Budget', type: 'number' },
        { id: 'editBgLicenseAllowance', name: 'BgLicenseAllowance', label: 'License Allowance Budget', type: 'number' },
        { id: 'editBgHousingAllowance', name: 'BgHousingAllowance', label: 'Housing Allowance Budget', type: 'number' },
        { id: 'editBgGasolineAllowance', name: 'BgGasolineAllowance', label: 'Gasoline Allowance Budget', type: 'number' },
        { id: 'editBgWageStudent', name: 'BgWageStudent', label: 'Wage Student Budget', type: 'number' },
        { id: 'editBgOtherAllowance', name: 'BgOtherAllowance', label: 'Other Allowances Budget', type: 'number' },
        { id: 'editBgSkillPayAllowance', name: 'BgSkillPayAllowance', label: 'Skill-based Pay Budget', type: 'number' }
      ],

      // BIGC-specific benefits
      benefits: [
        { id: 'editBgSocialSecurity', name: 'BgSocialSecurity', label: 'Social Security Budget', type: 'number' },
        { id: 'editBgLaborFundFee', name: 'BgLaborFundFee', label: 'Labor Development Budget', type: 'number' },
        { id: 'editBgOtherStaffBenefit', name: 'BgOtherStaffBenefit', label: 'Other Staff Benefit Budget', type: 'number' },
        { id: 'editBgProvidentFund', name: 'BgProvidentFund', label: 'Provident Fund Budget', type: 'number' },
        { id: 'editBgEmployeeWelfare', name: 'BgEmployeeWelfare', label: 'Employee Welfare Budget', type: 'number' },
        { id: 'editBgProvision', name: 'BgProvision', label: 'Provision Budget', type: 'number' },
        { id: 'editBgInterest', name: 'BgInterest', label: 'Interest Budget', type: 'number' },
        { id: 'editBgStaffInsurance', name: 'BgStaffInsurance', label: 'Group Insurance Budget', type: 'number' },
        { id: 'editBgMedicalExpense', name: 'BgMedicalExpense', label: 'Medical Expense Budget', type: 'number' },
        { id: 'editBgMedicalInHouse', name: 'BgMedicalInHouse', label: 'Medical - In House Budget', type: 'number' },
        { id: 'editBgTraining', name: 'BgTraining', label: 'Training & Development Budget', type: 'number' },
        { id: 'editBgLongService', name: 'BgLongService', label: 'Long Service Award Budget', type: 'number' }
      ],

      // BIGC-specific PE calculations
      calculations: [
        { id: 'editBgPeMth', name: 'BgPeMth', label: 'Personnel Expense Budget Monthly', type: 'number' },
        { id: 'editBgPeYear', name: 'BgPeYear', label: 'Personnel Expense Budget Annual', type: 'number' },
        { id: 'editBgPeSbMth', name: 'BgPeSbMth', label: 'PE + SB Budget Monthly', type: 'number' },
        { id: 'editBgPeSbYear', name: 'BgPeSbYear', label: 'PE + SB Budget Year', type: 'number' }
      ]
    }
  }
};

// ===== Company Field Configuration Objects (per Documentation) =====
const BJC_FIELD_CONFIG = {
  company: 'BJC',
  useCustomOrder: true,
  get orderConfigLE() { return window.BJC_CUSTOMER_FIELD_ORDER_LE || BJC_CUSTOMER_FIELD_ORDER_LE || []; },
  get orderConfigBG() { return window.BJC_CUSTOMER_FIELD_ORDER_BG || BJC_CUSTOMER_FIELD_ORDER_BG || []; },
  get orderConfigSummary() { return window.BJC_CUSTOMER_FIELD_ORDER_SUMMARY || BJC_CUSTOMER_FIELD_ORDER_SUMMARY || []; },
  get glMapping() { return window.BJC_GL_MAPPING || BJC_GL_MAPPING || {}; },

  // Field display with GL numbers
  getFieldLabel: function(fieldId, baseLabel) {
    const glMapping = this.glMapping;
    const glNumber = glMapping[fieldId];
    return glNumber ? `${baseLabel} [GL: ${glNumber}]` : baseLabel;
  },

  // Custom ordering function
  orderFields: function(fields, type = 'LE') {
    let orderConfig;
    switch(type.toUpperCase()) {
      case 'LE':
        orderConfig = this.orderConfigLE;
        break;
      case 'BG':
      case 'BUDGET':
        orderConfig = this.orderConfigBG;
        break;
      case 'SUMMARY':
        orderConfig = this.orderConfigSummary;
        break;
      default:
        orderConfig = this.orderConfigLE;
    }

    return fields.sort((a, b) => {
      const indexA = orderConfig.indexOf(a.id);
      const indexB = orderConfig.indexOf(b.id);

      // Fields in custom order come first
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      // Remaining fields maintain original order
      return 0;
    });
  }
};

const BIGC_FIELD_CONFIG = {
  company: 'BIGC',
  useCustomOrder: true,
  get orderConfigLE() { return window.BIGC_CUSTOMER_FIELD_ORDER_LE || BIGC_CUSTOMER_FIELD_ORDER_LE || []; },
  get orderConfigBG() { return window.BIGC_CUSTOMER_FIELD_ORDER_BG || BIGC_CUSTOMER_FIELD_ORDER_BG || []; },
  get orderConfigSummary() { return window.BIGC_CUSTOMER_FIELD_ORDER_SUMMARY || BIGC_CUSTOMER_FIELD_ORDER_SUMMARY || []; },
  get glMapping() { return window.BIGC_GL_MAPPING || BIGC_GL_MAPPING || {}; },

  // Field display with GL numbers
  getFieldLabel: function(fieldId, baseLabel) {
    const glMapping = this.glMapping;
    const glNumber = glMapping[fieldId];
    return glNumber ? `${baseLabel} [GL: ${glNumber}]` : baseLabel;
  },

  // Custom ordering function
  orderFields: function(fields, type = 'LE') {
    let orderConfig;
    switch(type.toUpperCase()) {
      case 'LE':
        orderConfig = this.orderConfigLE;
        break;
      case 'BG':
      case 'BUDGET':
        orderConfig = this.orderConfigBG;
        break;
      case 'SUMMARY':
        orderConfig = this.orderConfigSummary;
        break;
      default:
        orderConfig = this.orderConfigLE;
    }

    return fields.sort((a, b) => {
      const indexA = orderConfig.indexOf(a.id);
      const indexB = orderConfig.indexOf(b.id);

      // Fields in custom order come first
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      // Remaining fields maintain original order
      return 0;
    });
  }
};

/**
 * Benefits Templates Manager Class
 */
class BenefitsTemplatesManager {
  constructor() {
    this.currentCompany = null;
    this.isInitialized = false;
    this.generatedContainers = {
      leForm: null,
      bgForm: null,
      leDynamic: null,
      bgDynamic: null
    };

    // Bind methods
    this.handleCompanyChange = this.handleCompanyChange.bind(this);
  }

  /**
   * Initialize the benefits templates manager
   */
  initialize() {
    if (this.isInitialized) {
      // console.log('🔄 Benefits Templates Manager already initialized');
      return;
    }

    // console.log('🏗️ Initializing Benefits Templates Manager');

    try {
      // Setup company change detection
      this.setupCompanyChangeDetection();

      // Generate initial templates based on current company
      this.detectAndGenerateTemplates();

      this.isInitialized = true;
      // console.log('✅ Benefits Templates Manager initialized successfully');

    } catch (error) {
      // console.error('❌ Error initializing Benefits Templates Manager:', error);
    }
  }

  /**
   * Setup company change detection
   */
  setupCompanyChangeDetection() {
    // Listen to custom company change events
    window.addEventListener('companyFieldsUpdated', this.handleCompanyChange);

    // Also listen to direct dropdown changes
    $('#editCompany').on('change.benefitsTemplates', (e) => {
      const companyId = $(e.target).val();
      this.generateTemplatesForCompany(companyId);
    });

    // console.log('🔍 Benefits templates company change detection setup');
  }

  /**
   * Handle company change event
   */
  handleCompanyChange(event) {
    const { companyId } = event.detail || {};
    // console.log('🔄 Benefits templates handling company change:', companyId);

    if (companyId && companyId !== this.currentCompany) {
      this.generateTemplatesForCompany(companyId);
    }
  }

  /**
   * Detect current company and generate appropriate templates
   */
  detectAndGenerateTemplates() {
    // Get current company from various sources
    const companyId = $('#editCompany').val() || $('#companyFilter').val() || '2'; // Default to BIGC

    // console.log('🎯 Detecting current company for templates:', companyId);
    this.generateTemplatesForCompany(companyId);
  }

  /**
   * Generate templates for specific company
   */
  generateTemplatesForCompany(companyId) {
    // console.log(`🏗️ Generating benefits templates for company: ${companyId}`);

    try {
      this.currentCompany = companyId;

      const config = companyId === '1' ? BENEFITS_BASE_COLUMNS.BJC : BENEFITS_BASE_COLUMNS.BIGC;

      if (!config) {
        // console.warn('⚠️ No configuration found for company:', companyId);
        return;
      }

      // Generate LE Benefits form
      this.generateLeBenefitsForm(config);

      // Generate Budget Benefits form
      this.generateBgBenefitsForm(config);

      // Generate dynamic containers for multi-cost-center allocation
      this.setupDynamicContainers(config);

      // console.log('✅ Benefits templates generated successfully');

    } catch (error) {
      // console.error('❌ Error generating benefits templates:', error);
    }
  }

  /**
   * Generate LE Benefits form based on company configuration with customer ordering
   */
  generateLeBenefitsForm(config) {
    // console.log('🏗️ Generating LE Benefits form with customer field ordering');

    const container = $('#editRowLeBenefitForm .row');
    if (!container.length) {
      // console.warn('⚠️ LE Benefits form container not found');
      return;
    }

    // Clear existing content
    container.empty();

    // Get all fields from all sections and flatten them
    const allFields = [];

    ['core', 'allowances', 'benefits', 'calculations', 'carFleet', 'bjcSpecific', 'unique'].forEach(sectionKey => {
      if (config.le_benefits[sectionKey]?.length > 0) {
        config.le_benefits[sectionKey].forEach(field => {
          allFields.push({ ...field, section: sectionKey });
        });
      }
    });

    // Apply customer field ordering
    const fieldConfig = this.getCurrentFieldConfig();
    let orderedFields = allFields;

    if (fieldConfig && fieldConfig.useCustomOrder) {
      // console.log('🎯 Applying BJC/BIGC customer field ordering for LE Benefits');
      orderedFields = fieldConfig.orderFields(allFields, 'LE');
    }

    // Generate section header
    container.append(this.generateSectionHeader('LE Benefits - Customer Ordered Fields'));

    // Generate all fields in customer order
    orderedFields.forEach(field => {
      const sectionClass = `benefits-le-${field.section}`;
      container.append(this.generateFieldHTML(field, sectionClass));
    });

    this.generatedContainers.leForm = container;
    // console.log(`✅ LE Benefits form generated with ${orderedFields.length} fields in customer order`);
  }

  /**
   * Generate Budget Benefits form based on company configuration with customer ordering
   */
  generateBgBenefitsForm(config) {
    // console.log('🏗️ Generating Budget Benefits form with customer field ordering');

    const container = $('#editRowBgBenefitForm .row');
    if (!container.length) {
      // console.warn('⚠️ Budget Benefits form container not found');
      return;
    }

    // Clear existing content
    container.empty();

    // Get all fields from all sections and flatten them
    const allFields = [];

    ['core', 'allowances', 'benefits', 'calculations', 'carFleet', 'bjcSpecific', 'unique'].forEach(sectionKey => {
      if (config.bg_benefits[sectionKey]?.length > 0) {
        config.bg_benefits[sectionKey].forEach(field => {
          allFields.push({ ...field, section: sectionKey });
        });
      }
    });

    // Apply customer field ordering
    const fieldConfig = this.getCurrentFieldConfig();
    let orderedFields = allFields;

    if (fieldConfig && fieldConfig.useCustomOrder) {
      // console.log('🎯 Applying BJC/BIGC customer field ordering for Budget Benefits');
      orderedFields = fieldConfig.orderFields(allFields, 'BG');
    }

    // Generate section header
    container.append(this.generateSectionHeader('Budget Benefits - Customer Ordered Fields'));

    // Generate all fields in customer order
    orderedFields.forEach(field => {
      const sectionClass = `benefits-bg-${field.section}`;
      container.append(this.generateFieldHTML(field, sectionClass));
    });

    this.generatedContainers.bgForm = container;
    // console.log(`✅ Budget Benefits form generated with ${orderedFields.length} fields in customer order`);
  }

  /**
   * Generate section header HTML
   */
  generateSectionHeader(sectionName) {
    return `
      <div class="col-12">
        <hr style="margin: 1rem 0;">
        <h6 class="text-muted mb-3">${sectionName}</h6>
      </div>
    `;
  }

  /**
   * Generate field HTML based on field configuration with GL number integration
   */
  generateFieldHTML(field, sectionClass = '') {
    const requiredHtml = field.required ? '<span style="color:red">*</span>' : '';
    const classes = `form-control ${sectionClass}`.trim();

    // Get enhanced label with GL number (if applicable)
    const enhancedLabel = this.getFieldLabelWithGL(field.id, field.label);

    let inputHtml = '';

    if (field.type === 'select') {
      inputHtml = `
        <select class="form-select ${sectionClass}" id="${field.id}" name="${field.name}">
          <option value="">Select ${enhancedLabel}</option>
        </select>
      `;
    } else if (field.type === 'number') {
      if (field.hasCalc) {
        inputHtml = `
          <div class="input-group">
            <input type="number" class="${classes}" id="${field.id}" name="${field.name}"
                   min="0" max="10000000" step="0.01" placeholder="0.00">
            <button class="btn btn-core-inverse" type="button" id="calc${field.id.replace('edit', '')}Btn">Cal</button>
          </div>
        `;
      } else {
        inputHtml = `
          <input type="number" class="${classes}" id="${field.id}" name="${field.name}"
                 min="0" max="10000000" step="0.01" placeholder="0.00">
        `;
      }
    } else {
      inputHtml = `
        <input type="text" class="${classes}" id="${field.id}" name="${field.name}" placeholder="${enhancedLabel}">
      `;
    }

    return `
      <div class="col-md-4 mb-3 ${sectionClass}-container">
        <label for="${field.id}" class="form-label"><b>${enhancedLabel}</b> ${requiredHtml}</label>
        ${inputHtml}
      </div>
    `;
  }

  /**
   * Get field label with GL number integration
   */
  getFieldLabelWithGL(fieldId, baseLabel) {
    const config = this.getCurrentFieldConfig();
    if (config && typeof config.getFieldLabel === 'function') {
      return config.getFieldLabel(fieldId, baseLabel);
    }
    return baseLabel;
  }

  /**
   * Get current company field configuration
   */
  getCurrentFieldConfig() {
    if (this.currentCompany === '1') {
      return BJC_FIELD_CONFIG;
    } else if (this.currentCompany === '2') {
      return BIGC_FIELD_CONFIG;
    }
    return null;
  }

  /**
   * Setup dynamic containers for multi-cost-center allocation
   */
  setupDynamicContainers(config) {
    // console.log('🏗️ Setting up dynamic containers');

    // Setup LE Benefits dynamic container
    const leDynamicContainer = $('#dynamicLeBenefitsForms');
    if (leDynamicContainer.length) {
      leDynamicContainer.attr('data-company', config.companyCode);
      this.generatedContainers.leDynamic = leDynamicContainer;
    }

    // Setup Budget Benefits dynamic container
    const bgDynamicContainer = $('#dynamicBgBenefitsForms');
    if (bgDynamicContainer.length) {
      bgDynamicContainer.attr('data-company', config.companyCode);
      // Update the year span
      $('#dynamicBgBenefitsYear').text(new Date().getFullYear() + 1);
      this.generatedContainers.bgDynamic = bgDynamicContainer;
    }

    // console.log('✅ Dynamic containers setup complete');
  }

  /**
   * Generate dynamic allocation forms (similar to budget.allocation.js pattern)
   */
  generateDynamicAllocationForms(allocations = []) {
    if (!allocations.length) return;

    // console.log('🏗️ Generating dynamic allocation forms');

    const config = this.getCurrentConfig();
    if (!config) return;

    // Generate LE Benefits allocation forms
    this.generateLeBenefitsAllocationForms(config, allocations);

    // Generate Budget Benefits allocation forms
    this.generateBgBenefitsAllocationForms(config, allocations);
  }

  /**
   * Generate LE Benefits allocation forms
   */
  generateLeBenefitsAllocationForms(config, allocations) {
    const container = $('#dynamicLeBenefitsForms');
    container.empty();

    allocations.forEach((allocation, index) => {
      const formHtml = this.generateAllocationFormHTML(
        config.le_benefits,
        allocation,
        index,
        'le',
        config.companyCode
      );
      container.append(formHtml);
    });
  }

  /**
   * Generate Budget Benefits allocation forms
   */
  generateBgBenefitsAllocationForms(config, allocations) {
    const container = $('#dynamicBgBenefitsForms');
    container.empty();

    allocations.forEach((allocation, index) => {
      const formHtml = this.generateAllocationFormHTML(
        config.bg_benefits,
        allocation,
        index,
        'bg',
        config.companyCode
      );
      container.append(formHtml);
    });
  }

  /**
   * Generate allocation form HTML
   */
  generateAllocationFormHTML(benefitsConfig, allocation, index, prefix, companyCode) {
    const formId = `${prefix}BenefitsAllocationForm${index}`;
    const costCenterName = allocation.costCenterName || allocation.costCenterCode || `Cost Center ${index + 1}`;
    const percentage = allocation.percentage || 0;

    let fieldsHtml = '';

    // Generate all benefit fields for this allocation
    ['core', 'allowances', 'benefits', 'calculations', 'carFleet', 'bjcSpecific', 'unique'].forEach(sectionKey => {
      if (benefitsConfig[sectionKey]?.length > 0) {
        benefitsConfig[sectionKey].forEach(field => {
          const allocationFieldId = `${field.id}_allocation_${index}`;
          const allocationFieldName = `${field.name}_allocation_${index}`;

          fieldsHtml += `
            <div class="col-md-6 mb-2">
              <label for="${allocationFieldId}" class="form-label small">
                <b>${field.label} (${percentage}%)</b>
              </label>
              <input type="number" class="form-control form-control-sm allocation-field"
                     id="${allocationFieldId}" name="${allocationFieldName}"
                     min="0" max="10000000" step="0.01" placeholder="0.00"
                     data-original-field="${field.id}" data-allocation-index="${index}">
            </div>
          `;
        });
      }
    });

    return `
      <div class="card mb-3 allocation-benefits-card" data-allocation-index="${index}">
        <div class="card-header d-flex justify-content-between align-items-center py-2">
          <h6 class="mb-0">
            <i class="fa-solid fa-building me-2 text-primary"></i>
            ${costCenterName} (${percentage}%)
          </h6>
          <small class="text-muted">${companyCode} Benefits</small>
        </div>
        <div class="card-body py-2">
          <form id="${formId}" class="allocation-benefits-form">
            <div class="row">
              ${fieldsHtml}
            </div>
          </form>
        </div>
      </div>
    `;
  }

  /**
   * Get current company configuration
   */
  getCurrentConfig() {
    if (this.currentCompany === '1') {
      return BENEFITS_BASE_COLUMNS.BJC;
    } else if (this.currentCompany === '2') {
      return BENEFITS_BASE_COLUMNS.BIGC;
    }
    return null;
  }

  /**
   * Update form data with company-specific formatting
   */
  updateFormData(data) {
    // console.log('📊 Updating form data with company formatting');

    const config = this.getCurrentConfig();
    if (!config) return data;

    // Apply company-specific data formatting
    // This is where we can add company-specific business logic

    return data;
  }

  /**
   * Get all field values from generated forms
   */
  getFormValues() {
    const values = {};

    // Get main form values
    ['leForm', 'bgForm'].forEach(formType => {
      if (this.generatedContainers[formType]) {
        this.generatedContainers[formType].find('input, select, textarea').each((index, element) => {
          values[element.name || element.id] = $(element).val();
        });
      }
    });

    // Get allocation form values
    $('.allocation-benefits-form').each((index, form) => {
      $(form).find('input, select, textarea').each((subIndex, element) => {
        values[element.name || element.id] = $(element).val();
      });
    });

    return values;
  }

  /**
   * Validate generated forms
   */
  validateForms() {
    // console.log('🔍 Validating generated benefits forms');

    const errors = [];
    const config = this.getCurrentConfig();

    if (!config) {
      errors.push('No company configuration available for validation');
      return errors;
    }

    // Validate required fields in each section
    ['le_benefits', 'bg_benefits'].forEach(sectionKey => {
      const section = config[sectionKey];
      Object.keys(section).forEach(subsectionKey => {
        section[subsectionKey].forEach(field => {
          if (field.required) {
            const element = document.getElementById(field.id);
            if (element && !element.value.trim()) {
              errors.push(`${field.label} is required`);
            }
          }
        });
      });
    });

    return errors;
  }

  /**
   * Destroy the benefits templates manager
   */
  destroy() {
    if (!this.isInitialized) return;

    // console.log('🔄 Destroying Benefits Templates Manager');

    // Remove event listeners
    window.removeEventListener('companyFieldsUpdated', this.handleCompanyChange);
    $('#editCompany').off('change.benefitsTemplates');

    // Clear generated containers
    Object.values(this.generatedContainers).forEach(container => {
      if (container) container.empty();
    });

    // Reset state
    this.currentCompany = null;
    this.isInitialized = false;
    this.generatedContainers = { leForm: null, bgForm: null, leDynamic: null, bgDynamic: null };

    // console.log('✅ Benefits Templates Manager destroyed');
  }
}

// Global instance
window.benefitsTemplatesManager = new BenefitsTemplatesManager();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Delay initialization to ensure other systems are ready
  setTimeout(() => {
    console.log('🏗️ Initializing benefitsTemplatesManager...');
    if (window.benefitsTemplatesManager) {
      window.benefitsTemplatesManager.initialize();
      console.log('✅ benefitsTemplatesManager initialized:', window.benefitsTemplatesManager.isInitialized);
    } else {
      console.error('❌ benefitsTemplatesManager not found');
    }
  }, 500); // Reduced from 1500ms to 500ms
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BenefitsTemplatesManager,
    BENEFITS_BASE_COLUMNS,
    BJC_FIELD_CONFIG,
    BIGC_FIELD_CONFIG
  };
}
