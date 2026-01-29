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
        { id: 'editLeSalWithEn', name: 'LeSalWithEn', label: 'Salary With EN', type: 'number' },
        { id: 'editLeSalNotEn', name: 'LeSalNotEn', label: 'Salary Not EN', type: 'number' },
        { id: 'editLeBonusType', name: 'LeBonusType', label: 'Bonus Type LE', required: true, type: 'select' }
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
        { id: 'editLeOthersSubjectTax', name: 'LeOthersSubjectTax', label: 'Others Subject Tax', type: 'number' }
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
        { id: 'editBgPayroll', name: 'BgPayroll', label: 'Payroll', required: true, type: 'number' },
        { id: 'editBgPremium', name: 'BgPremium', label: 'Premium', type: 'number' },
        { id: 'editBgSalWithEn', name: 'BgSalWithEn', label: 'Salary With EN', type: 'number' },
        { id: 'editBgSalNotEn', name: 'BgSalNotEn', label: 'Salary Not EN', type: 'number' },
        { id: 'editBgBonusType', name: 'BgBonusType', label: 'Bonus Type', required: true, type: 'select' }
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
        { id: 'editBgOthersSubjectTax', name: 'BgOthersSubjectTax', label: 'Others Subject Tax', type: 'number' }
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
        { id: 'editLeTotalPayroll', name: 'LeTotalPayroll', label: 'Total Payroll LE', type: 'number' },
        { id: 'editLePremium', name: 'LePremium', label: 'Premium LE', type: 'number' }
      ],

      // BIGC-specific allowances
      allowances: [
        { id: 'editLeBonus', name: 'LeBonus', label: 'Bonus LE', type: 'number' },
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
        { id: 'editLePeSbMth', name: 'LePeSbMth', label: 'PE + SB Month', type: 'number' },
        { id: 'editLePeSbYear', name: 'LePeSbYear', label: 'PE + SB Year', type: 'number' },
        { id: 'editLePeMth', name: 'LePeMth', label: 'PE Month', type: 'number' },
        { id: 'editLePeYear', name: 'LePeYear', label: 'PE Year', type: 'number' }
      ]
    },

    // Budget Year Benefits Fields for BIGC
    bg_benefits: {
      // Core fields (always present)
      core: [
        { id: 'editBgPayroll', name: 'BgPayroll', label: 'Payroll Budget', required: true, type: 'number' },
        { id: 'editBgTotalPayroll', name: 'BgTotalPayroll', label: 'Total Payroll Budget', type: 'number' },
        { id: 'editBgPremium', name: 'BgPremium', label: 'Premium Budget', type: 'number' },
        { id: 'editBgBonusTypes', name: 'BgBonusTypes', label: 'Bonus Types', required: true, type: 'select' }
      ],

      // BIGC-specific allowances
      allowances: [
        { id: 'editBgBonus', name: 'BgBonus', label: 'Bonus Budget', type: 'number' },
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
        { id: 'editBgPeSbMth', name: 'BgPeSbMth', label: 'PE + SB Budget Month', type: 'number' },
        { id: 'editBgPeSbYear', name: 'BgPeSbYear', label: 'PE + SB Budget Year', type: 'number' },
        { id: 'editBgPeMth', name: 'BgPeMth', label: 'PE Budget Month', type: 'number' },
        { id: 'editBgPeYear', name: 'BgPeYear', label: 'PE Budget Year', type: 'number' }
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
  getFieldLabel: function (fieldId, baseLabel) {
    const glMapping = this.glMapping;
    const glNumber = glMapping[fieldId];
    return glNumber ? `${baseLabel} [GL: ${glNumber}]` : baseLabel;
  },

  // Custom ordering function
  orderFields: function (fields, type = 'LE') {
    let orderConfig;
    switch (type.toUpperCase()) {
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
  getFieldLabel: function (fieldId, baseLabel) {
    const glMapping = this.glMapping;
    const glNumber = glMapping[fieldId];
    return glNumber ? `${baseLabel} [GL: ${glNumber}]` : baseLabel;
  },

  // Custom ordering function
  orderFields: function (fields, type = 'LE') {
    let orderConfig;
    switch (type.toUpperCase()) {
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
        <select class="form-select w-100 ${sectionClass}" id="${field.id}" name="${field.name}">
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
        <div id="valMsg_${field.id}" class="validation-message-container"></div>
        ${inputHtml}
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
document.addEventListener('DOMContentLoaded', function () {
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

// ========================================
// BATCH ENTRY EXTENSION FUNCTIONS
// ========================================

// ⚡ CRITICAL: Prevent race conditions with debouncing
let batchTemplateGenerationTimer = null;
let batchTemplateGenerationQueue = new Set();

// ─────────────────────────────────────────────────────────────
// 📌 NOTE: BENEFITS_DROPDOWN_CONFIG moved to budget.plan.config.js
// Access via: window.BENEFITS_DROPDOWN_CONFIG
// ─────────────────────────────────────────────────────────────

/**
 * Generate benefits templates for Batch Entry row (INCREMENTAL - only generates missing rows)
 * @param {string} companyId - Company ID (1=BJC, 2=BIGC)
 * @param {number} batchRowIndex - Batch row index for unique identification
 * @param {function} callback - Optional callback to execute after generation completes
 */
function generateBatchTemplatesForCompany(companyId, batchRowIndex, callback) {
  console.log(`🔔 [Smart Generate] Generate templates for company ${companyId}, row ${batchRowIndex}`);

  // Clear any pending generation
  if (batchTemplateGenerationTimer) {
    clearTimeout(batchTemplateGenerationTimer);
  }

  // Queue this generation request
  batchTemplateGenerationQueue.add({ companyId, batchRowIndex, callback });

  // Schedule generation with debounce
  batchTemplateGenerationTimer = setTimeout(() => {
    console.log(`🏗️ [Smart Generate] Executing template generation for company: ${companyId}`);

    try {
      // Set current company in the global instance
      if (window.benefitsTemplatesManager) {
        window.benefitsTemplatesManager.currentCompany = companyId;
      }
      const config = companyId === '1' ? BENEFITS_BASE_COLUMNS.BJC : BENEFITS_BASE_COLUMNS.BIGC;

      if (!config) {
        console.error(`❌ Invalid company ID: ${companyId}`);
        return;
      }

      // ⚡ NEW LOGIC: Generate ONLY for the specific row (incremental generation)
      generateBatchLeBenefitsForm(config, batchRowIndex);
      generateBatchBgBenefitsForm(config, batchRowIndex);

      console.log(`✅ [Smart Generate] Template generation completed for row ${batchRowIndex}`);

      // Clear queue
      batchTemplateGenerationQueue.clear();

      // ✅ NEW: Populate Benefits Dropdowns (with delay for DOM readiness)
      setTimeout(() => {
        // Get budgetYear from batch row
        const rowElement = document.querySelector(`[data-batch-row-id="batch-row-${batchRowIndex}"]`);
        const budgetYear = rowElement ? $(rowElement).find('.batch-year').val() : null;

        console.log(`📅 [Dropdown] Budget Year for row ${batchRowIndex}: ${budgetYear}`);
        populateBatchBenefitsDropdowns(batchRowIndex, companyId, budgetYear);

        // ⚡ Execute callback if provided
        if (callback && typeof callback === 'function') {
          console.log(`📞 Executing callback...`);
          setTimeout(() => {
            callback();
          }, 100); // Additional delay after dropdown population
        }
      }, 350); // Wait for DOM to be ready

    } catch (error) {
      console.error(`❌ Template generation error:`, error);
      batchTemplateGenerationQueue.clear();
    }
  }, 300); // Debounce delay: 300ms
}

/**
 * Generate LE Benefits form for Batch Entry (INCREMENTAL - only generates for specific row)
 * @param {object} config - Company configuration
 * @param {number} batchRowIndex - Batch row index to generate fields for
 */
function generateBatchLeBenefitsForm(config, batchRowIndex) {
  console.log(`🏗️ [Smart LE] Generating LE Benefits for row ${batchRowIndex} ONLY`);

  // ⚡ CRITICAL FIX: Find container WITHIN the specific row, not globally!
  const rowElement = document.querySelector(`[data-batch-row-id="batch-row-${batchRowIndex}"]`);
  if (!rowElement) {
    console.error(`❌ [Smart LE] Row element not found: batch-row-${batchRowIndex}`);
    return;
  }

  console.log(`✅ [Smart LE] Found row element: batch-row-${batchRowIndex}`);

  // Find container INSIDE this specific row
  const container = $(rowElement).find('.batch-row-le-benefit-form .row');
  if (!container.length) {
    console.warn(`⚠️ [Smart LE] LE Benefits form container not found in row ${batchRowIndex}`);
    return;
  }

  console.log(`✅ [Smart LE] Found container inside row ${batchRowIndex}`);

  // ⚡ SMART LOGIC: Check if fields for this row already exist (search in entire document, not just container)
  const existingFieldsInDoc = document.querySelectorAll(`input[id^="batchLe${batchRowIndex}_"], select[id^="batchLe${batchRowIndex}_"]`);

  if (existingFieldsInDoc.length > 0) {
    console.log(`✅ [Smart LE] Row ${batchRowIndex} already has ${existingFieldsInDoc.length} fields - SKIPPING generation`);
    return; // Don't regenerate if fields already exist
  }

  console.log(`🆕 [Smart LE] Row ${batchRowIndex} is NEW - generating fields...`);

  // Step 1: Get field configuration
  const allFields = [];
  ['core', 'allowances', 'carFleet', 'bjcSpecific', 'bigcSpecific', 'benefits', 'calculations'].forEach(section => {
    if (config.le_benefits[section]) {
      allFields.push(...config.le_benefits[section]);
    }
  });

  const fieldConfig = window.benefitsTemplatesManager ? window.benefitsTemplatesManager.getCurrentFieldConfig() : null;
  let orderedFields = allFields;

  if (fieldConfig && fieldConfig.useCustomOrder && fieldConfig.orderConfigLE && window.benefitsTemplatesManager.applyCustomOrdering) {
    orderedFields = window.benefitsTemplatesManager.applyCustomOrdering(allFields, fieldConfig.orderConfigLE, 'LE');
  }

  // Step 2: Generate fields ONLY for the specific row (append with data-batch-row attribute!)
  console.log(`📊 [Smart LE] Generating ${orderedFields.length} fields for row ${batchRowIndex}`);

  orderedFields.forEach(field => {
    if (field && field.id) {
      const batchFieldId = field.id.replace('edit', `batchLe${batchRowIndex}_`);
      const batchFieldName = field.name ? `${field.name}_row${batchRowIndex}` : batchFieldId;

      const batchField = {
        ...field,
        id: batchFieldId,
        name: batchFieldName
      };

      const fieldHtml = window.benefitsTemplatesManager && window.benefitsTemplatesManager.generateFieldHTML
        ? window.benefitsTemplatesManager.generateFieldHTML(batchField, 'batch-le-benefits')
        : generateFallbackFieldHTML(batchField, 'batch-le-benefits');

      if (fieldHtml) {
        // 🔧 FIX: Add data-batch-row attribute to identify which row this field belongs to
        const $fieldHtml = $(fieldHtml);
        $fieldHtml.attr('data-batch-row', batchRowIndex);
        container.append($fieldHtml); // APPEND to SPECIFIC row's container!
      }
    }
  });

  console.log(`✅ [Smart LE] Generated ${orderedFields.length} LE fields for row ${batchRowIndex}`);
}/**
 * Generate BG Benefits form for Batch Entry (INCREMENTAL - only generates for specific row)
 * @param {object} config - Company configuration
 * @param {number} batchRowIndex - Batch row index to generate fields for
 */
function generateBatchBgBenefitsForm(config, batchRowIndex) {
  console.log(`🏗️ [Smart BG] Generating BG Benefits for row ${batchRowIndex} ONLY`);

  // 🔧 FIX: Find the SPECIFIC row element first, then search for container within that row
  const rowElement = document.querySelector(`[data-batch-row-id="batch-row-${batchRowIndex}"]`);
  if (!rowElement) {
    console.error(`❌ [Smart BG] Row element not found: batch-row-${batchRowIndex}`);
    return;
  }
  console.log(`✅ [Smart BG] Found row element: batch-row-${batchRowIndex}`);

  // Find batch entry BG benefits container WITHIN this specific row
  const container = $(rowElement).find('.batch-row-bg-benefit-form .row');
  if (!container.length) {
    console.warn(`⚠️ [Smart BG] BG Benefits form container not found in row ${batchRowIndex}`);
    return;
  }
  console.log(`✅ [Smart BG] Found container inside row ${batchRowIndex}`);

  // ⚡ SMART LOGIC: Check if fields for this row already exist (search in entire document, not just container)
  const existingFieldsInDoc = document.querySelectorAll(`input[id^="batchBg${batchRowIndex}_"], select[id^="batchBg${batchRowIndex}_"]`);

  if (existingFieldsInDoc.length > 0) {
    console.log(`✅ [Smart BG] Row ${batchRowIndex} already has ${existingFieldsInDoc.length} fields - SKIPPING generation`);
    return; // Don't regenerate if fields already exist
  }

  console.log(`🆕 [Smart BG] Row ${batchRowIndex} is NEW - generating fields...`);

  // Step 1: Get field configuration
  const allFields = [];
  ['core', 'allowances', 'carFleet', 'bjcSpecific', 'bigcSpecific', 'benefits', 'calculations'].forEach(section => {
    if (config.bg_benefits[section]) {
      allFields.push(...config.bg_benefits[section]);
    }
  });

  const fieldConfig = window.benefitsTemplatesManager ? window.benefitsTemplatesManager.getCurrentFieldConfig() : null;
  let orderedFields = allFields;

  if (fieldConfig && fieldConfig.useCustomOrder && fieldConfig.orderConfigBG && window.benefitsTemplatesManager.applyCustomOrdering) {
    orderedFields = window.benefitsTemplatesManager.applyCustomOrdering(allFields, fieldConfig.orderConfigBG, 'BG');
  }

  // Step 2: Generate fields ONLY for the specific row (append with data-batch-row attribute!)
  console.log(`📊 [Smart BG] Generating ${orderedFields.length} fields for row ${batchRowIndex}`);

  orderedFields.forEach(field => {
    if (field && field.id) {
      const batchFieldId = field.id.replace('edit', `batchBg${batchRowIndex}_`);
      const batchFieldName = field.name ? `${field.name}_row${batchRowIndex}` : batchFieldId;

      const batchField = {
        ...field,
        id: batchFieldId,
        name: batchFieldName
      };

      const fieldHtml = window.benefitsTemplatesManager && window.benefitsTemplatesManager.generateFieldHTML
        ? window.benefitsTemplatesManager.generateFieldHTML(batchField, 'batch-bg-benefits')
        : generateFallbackFieldHTML(batchField, 'batch-bg-benefits');

      if (fieldHtml) {
        // 🔧 FIX: Add data-batch-row attribute to identify which row this field belongs to
        const $fieldHtml = $(fieldHtml);
        $fieldHtml.attr('data-batch-row', batchRowIndex);
        container.append($fieldHtml); // APPEND with data attribute!
      }
    }
  });

  console.log(`✅ [Smart BG] Generated ${orderedFields.length} BG fields for row ${batchRowIndex}`);
}

/**
 * Show loading indicator for batch entry benefits generation
 * @param {number} batchRowIndex - Batch row index
 */
function showBatchLoadingIndicator(batchRowIndex) {
  // Show loading for LE Benefits
  const leContainer = $(`.batch-row-le-benefit-form .row`);
  if (leContainer.length) {
    leContainer.html(`
        <div class="col-12 text-center batch-benefits-loading">
          <i class="fa-solid fa-spinner fa-spin me-2"></i>
          <span>Generating LE Benefits fields...</span>
        </div>
      `);
  }

  // Show loading for BG Benefits
  const bgContainer = $(`.batch-row-bg-benefit-form .row`);
  if (bgContainer.length) {
    bgContainer.html(`
        <div class="col-12 text-center batch-benefits-loading">
          <i class="fa-solid fa-spinner fa-spin me-2"></i>
          <span>Generating Budget Benefits fields...</span>
        </div>
      `);
  }

  // console.log(`🔄 [Batch Loading] Showing loading indicators for row ${batchRowIndex}`);
}

/**
 * Hide loading indicator for batch entry benefits generation
 * @param {number} batchRowIndex - Batch row index
 */
function hideBatchLoadingIndicator(batchRowIndex) {
  // Remove loading indicators (they will be replaced by actual fields)
  $('.batch-benefits-loading').remove();
  // console.log(`✅ [Batch Loading] Loading indicators hidden for row ${batchRowIndex}`);
}

/**
 * Get batch entry benefits form data
 * @param {number} batchRowIndex - Batch row index
 * @returns {object} Form data for the specific batch row
 */
function getBatchEntryFormData(batchRowIndex) {
  const formData = {
    le_benefits: {},
    bg_benefits: {},
    rowIndex: batchRowIndex
  };

  // Collect LE Benefits data
  $(`.batch-row-le-benefit-form input, .batch-row-le-benefit-form select`).each((index, element) => {
    const $element = $(element);
    const fieldName = $element.attr('name');
    const fieldValue = $element.val();

    if (fieldName && fieldName.includes(`_row${batchRowIndex}`)) {
      formData.le_benefits[fieldName] = fieldValue;
    }
  });

  // Collect BG Benefits data
  $(`.batch-row-bg-benefit-form input, .batch-row-bg-benefit-form select`).each((index, element) => {
    const $element = $(element);
    const fieldName = $element.attr('name');
    const fieldValue = $element.val();

    if (fieldName && fieldName.includes(`_row${batchRowIndex}`)) {
      formData.bg_benefits[fieldName] = fieldValue;
    }
  });

  // console.log(`📊 [Batch Data] Collected form data for row ${batchRowIndex}:`, formData);
  return formData;
}

/**
 * Generate fallback field HTML when benefits templates manager is not available
 * @param {object} field - Field configuration
 * @param {string} sectionClass - CSS class for the section
 * @returns {string} HTML string
 */
function generateFallbackFieldHTML(field, sectionClass) {
  console.log(`⚠️ [Fallback] Generating fallback HTML for field ${field.id}`);

  const requiredHtml = field.required ? '<span style="color:red">*</span>' : '';
  const classes = `form-control ${sectionClass}`;

  let inputHtml = '';

  if (field.type === 'select') {
    inputHtml = `
      <select class="form-select ${sectionClass}" id="${field.id}" name="${field.name}">
        <option value="">Select ${field.label}</option>
      </select>
    `;
  } else if (field.type === 'number') {
    inputHtml = `
      <input type="number" class="${classes}" id="${field.id}" name="${field.name}"
             min="0" max="10000000" step="0.01" placeholder="0.00">
    `;
  } else {
    inputHtml = `
      <input type="text" class="${classes}" id="${field.id}" name="${field.name}" placeholder="${field.label}">
    `;
  }

  return `
    <div class="col-md-4 mb-3 ${sectionClass}-container">
      <label for="${field.id}" class="form-label"><b>${field.label}</b> ${requiredHtml}</label>
      ${inputHtml}
    </div>
  `;
}

/**
 * Clear batch entry benefits forms
 * @param {number} batchRowIndex - Batch row index
 */
function clearBatchEntryForms(batchRowIndex) {
  const leContainer = $(`.batch-row-le-benefit-form .row`);
  const bgContainer = $(`.batch-row-bg-benefit-form .row`);

  leContainer.empty();
  bgContainer.empty();

  console.log(`🧹 [Batch Clear] Cleared benefits forms for row ${batchRowIndex}`);
}

// ─────────────────────────────────────────────────────────────
// 📌 BENEFITS DROPDOWNS POPULATION FUNCTIONS
// ─────────────────────────────────────────────────────────────

/**
 * Populate Benefits dropdowns (Bonus Type, etc.) for a batch row
 * @param {number} batchRowIndex - Batch row index
 * @param {string} companyId - Company ID (1=BJC, 2=BIGC)
 * @param {string} budgetYear - Budget Year (e.g., "2026")
 */
function populateBatchBenefitsDropdowns(batchRowIndex, companyId, budgetYear) {
  console.log(`📥 [Benefits Dropdown] Populating for row ${batchRowIndex}, company ${companyId}, year ${budgetYear}`);

  // Validate required parameters
  if (!budgetYear) {
    console.error(`❌ [Benefits Dropdown] Budget Year is required but not provided for row ${batchRowIndex}`);
    return;
  }

  const companyCode = companyId === '1' ? 'BJC' : 'BIGC';

  // Define dropdown IDs based on company
  const dropdowns = {
    leBonusType: companyId === '1' ? `batchLe${batchRowIndex}_LeBonusType` : undefined,
    bgBonusType: companyId === '1'
      ? `batchBg${batchRowIndex}_BgBonusType`   // BJC
      : `batchBg${batchRowIndex}_BgBonusTypes`  // BIGC
  };

  // Optional: Clean up 'leBonusType' if it was set to undefined
  if (dropdowns.leBonusType === undefined) {
    delete dropdowns.leBonusType;
  }

  // Try loading from API first
  loadBonusTypesFromAPI(companyId, budgetYear)
    .then(bonusTypes => {
      console.log(`✅ [Benefits Dropdown] Loaded ${bonusTypes.length} bonus types from API`);
      populateDropdownsWithData(dropdowns, bonusTypes);
    })
    .catch(error => {
      console.warn(`⚠️ [Benefits Dropdown] API failed:`, error.message);

      // Use fallback if enabled
      if (BENEFITS_DROPDOWN_CONFIG.useFallback) {
        console.log(`🔄 [Benefits Dropdown] Using fallback options for ${companyCode}`);
        const fallbackData = BENEFITS_DROPDOWN_CONFIG.fallbackOptions[companyCode]?.bonusTypes || [];

        if (fallbackData.length > 0) {
          populateDropdownsWithData(dropdowns, fallbackData);
        } else {
          console.error(`❌ [Benefits Dropdown] No fallback data available for ${companyCode}`);
        }
      } else {
        console.error(`❌ [Benefits Dropdown] Fallback disabled, dropdowns remain empty`);
      }
    });
}

/**
 * Load Bonus Types from API with timeout
 * @param {string} companyId - Company ID
 * @param {string} budgetYear - Budget Year
 * @returns {Promise<Array>} Promise resolving to array of bonus types
 */
function loadBonusTypesFromAPI(companyId, budgetYear) {
  return new Promise((resolve, reject) => {
    const apiUrl = `${SELECT_API.bonusTypes}?companyId=${companyId}&budgetYear=${budgetYear}`;
    const timeout = BENEFITS_DROPDOWN_CONFIG.apiTimeout;

    console.log(`🌐 [Benefits Dropdown] Fetching from API: ${apiUrl}`);

    // Create timeout handler
    const timeoutId = setTimeout(() => {
      reject(new Error(`API timeout after ${timeout}ms`));
    }, timeout);

    // Fetch data
    fetch(apiUrl)
      .then(response => {
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
      })
      .then(data => {
        // Validate data structure
        if (!Array.isArray(data)) {
          throw new Error('Invalid API response: expected array');
        }

        // ✅ DEBUG: Log first item to verify structure
        if (data.length > 0) {
          console.log(`📋 [Benefits Dropdown] API Response Sample:`, data[0]);
          console.log(`📋 [Benefits Dropdown] Available fields:`, Object.keys(data[0]));
        }

        resolve(data);
      })
      .catch(error => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

/**
 * Populate dropdown elements with bonus type data
 * @param {Object} dropdowns - Object containing dropdown IDs
 * @param {Array} bonusTypes - Array of bonus type objects {id, name}
 */
function populateDropdownsWithData(dropdowns, bonusTypes) {
  let populatedCount = 0;

  Object.entries(dropdowns).forEach(([key, dropdownId]) => {
    const selectElement = document.getElementById(dropdownId);

    if (!selectElement) {
      console.warn(`⚠️ [Benefits Dropdown] Element not found: ${dropdownId}`);
      return;
    }

    // Keep placeholder option
    const placeholderOption = selectElement.querySelector('option[value=""]');
    const placeholderText = placeholderOption ? placeholderOption.textContent : 'Select Bonus Type';

    // Clear and rebuild options
    selectElement.innerHTML = '';

    // Re-add placeholder
    const newPlaceholder = document.createElement('option');
    newPlaceholder.value = '';
    newPlaceholder.textContent = placeholderText;
    selectElement.appendChild(newPlaceholder);

    // Add bonus type options
    // ✅ Support multiple API response formats:
    // Format 1: { id, name } (generic)
    // Format 2: { rate, budgetCategory } (from GetBudgetBonusTypesAsync)
    bonusTypes.forEach(item => {
      const option = document.createElement('option');

      // ✅ Flexible value/text mapping
      const optionValue = item.rate || item.id || item.value || '';
      const optionText = item.budgetCategory || item.name || item.text || item.label || '';

      // ✅ Skip invalid items
      // if (!optionValue || !optionText) {
      //   console.warn(`⚠️ [Benefits Dropdown] Skipping invalid item: Rate`, item.rate, `BudgetCategory`, item.budgetCategory);
      //   return;
      // }

      option.value = optionValue;
      option.textContent = optionText;

      selectElement.appendChild(option);

      // ✅ DEBUG: Log added option
      console.log(`➕ [Benefits Dropdown] Added option: value="${optionValue}", text="${optionText}"`);
    });

    // Initialize select2 if available
    if (window.jQuery && $(selectElement).data('select2')) {
      $(selectElement).trigger('change.select2');
    } else if (window.jQuery) {
      // Try to initialize select2 if not already initialized
      try {
        $(selectElement).select2({
          width: '100%'
        });
      } catch (e) {
        // select2 might not be available, ignore
      }
    }

    populatedCount++;
    console.log(`✅ [Benefits Dropdown] Populated ${dropdownId} with ${bonusTypes.length} options`);
  });

  console.log(`📊 [Benefits Dropdown] Total populated: ${populatedCount}/${Object.keys(dropdowns).length}`);
}

// ─────────────────────────────────────────────────────────────
// 📌 ALLOCATION BATCH ENTRY DROPDOWN POPULATION
// ─────────────────────────────────────────────────────────────

/**
 * Populate Benefits dropdowns for Allocation Batch Entry rows
 * Uses different ID pattern: batch-row-{rowId}_edit{FieldName}
 * @param {number} rowId - Row ID (1, 2, 3...)
 * @param {string} companyId - Company ID ('1'=BJC, '2'=BIGC)
 * @param {string} budgetYear - Budget Year (e.g., '2026')
 */
function populateAllocationBenefitsDropdowns(rowId, companyId, budgetYear) {
  console.log(`📥 [Allocation Dropdown] Populating for row ${rowId}, company ${companyId}, year ${budgetYear}`);

  // Validate required parameters
  if (!budgetYear) {
    console.error(`❌ [Allocation Dropdown] Budget Year is required but not provided for row ${rowId}`);
    return;
  }

  const companyCode = companyId === '1' ? 'BJC' : 'BIGC';

  // Define dropdown IDs for Allocation Batch Entry (different pattern!)
  const dropdowns = {
    leBonusType: companyId === '1' ? `batch-row-${rowId}_editLeBonusType` : undefined,
    bgBonusType: companyId === '1'
      ? `batch-row-${rowId}_editBgBonusType`   // BJC
      : `batch-row-${rowId}_editBgBonusTypes`  // BIGC (plural)
  };

  // Clean up undefined entries
  if (dropdowns.leBonusType === undefined) {
    delete dropdowns.leBonusType;
  }

  // Try loading from API first
  loadBonusTypesFromAPI(companyId, budgetYear)
    .then(bonusTypes => {
      console.log(`✅ [Allocation Dropdown] Loaded ${bonusTypes.length} bonus types from API`);
      populateDropdownsWithData(dropdowns, bonusTypes);
    })
    .catch(error => {
      console.warn(`⚠️ [Allocation Dropdown] API failed:`, error.message);

      // Use fallback if enabled
      if (BENEFITS_DROPDOWN_CONFIG.useFallback) {
        console.log(`🔄 [Allocation Dropdown] Using fallback options for ${companyCode}`);
        const fallbackData = BENEFITS_DROPDOWN_CONFIG.fallbackOptions[companyCode]?.bonusTypes || [];

        if (fallbackData.length > 0) {
          populateDropdownsWithData(dropdowns, fallbackData);
        } else {
          console.error(`❌ [Allocation Dropdown] No fallback data available for ${companyCode}`);
        }
      } else {
        console.error(`❌ [Allocation Dropdown] Fallback disabled, dropdowns remain empty`);
      }
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// ⭐ ALLOCATION BATCH ENTRY BENEFITS GENERATION (NO CAL BUTTONS)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate benefits fields for Allocation Batch Entry
 * - Similar to generateBatchLeBenefitsForm/generateBatchBgBenefitsForm
 * - BUT: NO CAL buttons (forceNoCalc = true)
 * - Used by: AllocationBatchManager.addAllocationBatchRow()
 *
 * @param {number} rowId - Row ID (batch-row-X)
 * @param {string} companyCode - Company code ('BJC' or 'BIGC')
 * @param {string} type - Benefits type ('LE' or 'BG')
 */
function generateAllocationBenefitsFields(rowId, companyCode, type) {
  console.log(`🏗️ [Allocation] Generating ${type} benefits for row ${rowId} (${companyCode})`);

  // Step 1: Get target container
  const rowElement = document.querySelector(`[data-batch-row-id="batch-row-${rowId}"]`);
  if (!rowElement) {
    console.error(`❌ [Allocation] Row element not found: batch-row-${rowId}`);
    return;
  }

  const containerClass = type === 'LE' ? '.allocation-row-le-benefit-form' : '.allocation-row-bg-benefit-form';
  const container = $(rowElement).find(containerClass + ' .row');

  if (!container.length) {
    console.error(`❌ [Allocation] Container not found: ${containerClass}`);
    return;
  }

  // Step 2: Clear existing content
  container.empty();

  // Step 3: Get benefits columns configuration
  const benefitsConfig = companyCode === 'BJC' ? BENEFITS_BASE_COLUMNS.BJC : BENEFITS_BASE_COLUMNS.BIGC;
  if (!benefitsConfig) {
    console.error(`❌ [Allocation] Benefits config not found for ${companyCode}`);
    return;
  }

  // Step 4: Get benefits fields based on type (LE or BG)
  const benefitsFieldsConfig = type === 'LE' ? benefitsConfig.le_benefits : benefitsConfig.bg_benefits;
  if (!benefitsFieldsConfig) {
    console.error(`❌ [Allocation] No ${type} benefits config found for ${companyCode}`);
    return;
  }

  // Step 5: Collect all fields from all sections
  const allFields = [];
  ['core', 'allowances', 'carFleet', 'bjcSpecific', 'bigcSpecific', 'benefits', 'calculations'].forEach(section => {
    if (benefitsFieldsConfig[section] && Array.isArray(benefitsFieldsConfig[section])) {
      allFields.push(...benefitsFieldsConfig[section]);
    }
  });

  if (allFields.length === 0) {
    console.warn(`⚠️ [Allocation] No benefits fields found for ${companyCode} ${type}`);
    return;
  }

  // Step 6: Generate fields HTML (⭐ WITHOUT CAL buttons)
  const sectionClass = type === 'LE' ? 'allocation-le-benefits' : 'allocation-bg-benefits';

  allFields.forEach(field => {
    // Clone field config to avoid mutation
    const fieldCopy = { ...field };

    // Update field IDs and names with row prefix
    fieldCopy.id = `batch-row-${rowId}_${field.id}`;
    fieldCopy.name = `batch-row-${rowId}_${field.name}`;

    // ⭐ FORCE NO CAL BUTTON (key difference from normal batch)
    fieldCopy.hasCalc = false;

    // Generate field HTML using existing function
    const fieldHtml = window.benefitsTemplatesManager && window.benefitsTemplatesManager.generateFieldHTML
      ? window.benefitsTemplatesManager.generateFieldHTML(fieldCopy, sectionClass)
      : generateFallbackFieldHTML(fieldCopy, sectionClass);

    container.append(fieldHtml);
  });

  console.log(`  ✅ [Allocation] Generated ${allFields.length} ${type} fields (NO CAL buttons)`);
}

/**
 * Generate Allocation LE Benefits (Wrapper for convenience)
 * @param {number} rowId - Row ID
 * @param {string} companyCode - Company code
 */
function generateAllocationLeBenefitsFields(rowId, companyCode) {
  generateAllocationBenefitsFields(rowId, companyCode, 'LE');
}

/**
 * Generate Allocation BG Benefits (Wrapper for convenience)
 * @param {number} rowId - Row ID
 * @param {string} companyCode - Company code
 */
function generateAllocationBgBenefitsFields(rowId, companyCode) {
  generateAllocationBenefitsFields(rowId, companyCode, 'BG');
}

// ========================================
// GLOBAL EXPORTS FOR BATCH ENTRY
// ========================================

// Export batch functions to window object for global access
window.generateBatchTemplatesForCompany = generateBatchTemplatesForCompany;
window.generateBatchLeBenefitsForm = generateBatchLeBenefitsForm;
window.generateBatchBgBenefitsForm = generateBatchBgBenefitsForm;
window.showBatchLoadingIndicator = showBatchLoadingIndicator;
window.hideBatchLoadingIndicator = hideBatchLoadingIndicator;
window.getBatchEntryFormData = getBatchEntryFormData;
window.clearBatchEntryForms = clearBatchEntryForms;
window.generateFallbackFieldHTML = generateFallbackFieldHTML;

// ⭐ Allocation Batch Entry functions (NEW)
window.generateAllocationBenefitsFields = generateAllocationBenefitsFields;
window.generateAllocationLeBenefitsFields = generateAllocationLeBenefitsFields;
window.generateAllocationBgBenefitsFields = generateAllocationBgBenefitsFields;

// ✅ Benefits Dropdown functions (Config is now in budget.plan.config.js)
window.populateBatchBenefitsDropdowns = populateBatchBenefitsDropdowns;
window.populateAllocationBenefitsDropdowns = populateAllocationBenefitsDropdowns; // ⭐ NEW
window.loadBonusTypesFromAPI = loadBonusTypesFromAPI;
window.populateDropdownsWithData = populateDropdownsWithData;

console.log('✅ Batch Entry Benefits functions exported to window object');
console.log('✅ Allocation Batch Entry Benefits functions exported to window object');
console.log('✅ Allocation Batch Entry dropdown functions exported to window object');

// Performance monitoring
window.batchBenefitsPerformance = {
  generateCount: 0,
  totalTime: 0,
  averageTime: 0,

  recordGeneration: function (startTime, endTime) {
    const duration = endTime - startTime;
    this.generateCount++;
    this.totalTime += duration;
    this.averageTime = this.totalTime / this.generateCount;

    console.log(`📊 [Performance] Benefits generation took ${duration.toFixed(2)}ms (Average: ${this.averageTime.toFixed(2)}ms)`);
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BenefitsTemplatesManager,
    BENEFITS_BASE_COLUMNS,
    BJC_FIELD_CONFIG,
    BIGC_FIELD_CONFIG
  };
}
