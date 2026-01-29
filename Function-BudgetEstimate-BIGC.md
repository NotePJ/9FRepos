USE [HRBUDGET]
GO
/****** Object:  UserDefinedFunction [dbo].[fn_BudgetEstimate]    Script Date: 11/6/2025 2:27:26 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER   FUNCTION [dbo].[fn_BudgetEstimate]
(
    @year               INT,
    @year_le            INT,
    @salary             DECIMAL(18,2),
    @premium_amt        DECIMAL(18,2),
    @jobband            NVARCHAR(10),
    @company_id         INT,
    @le_of_month        INT,
    @no_of_month        INT,
    @bonus_type         NVARCHAR(20),
    @company_name       NVARCHAR(100),    
    @cost_center        NVARCHAR(10),
    @allocate_json      NVARCHAR(MAX)
)
RETURNS @R TABLE
(  
    MAIN_COST_CENTER           VARCHAR(1),  
    COST_CENTER                NVARCHAR(10),
    PAYROLL_LE                 DECIMAL(18,2),
    PREMIUM_LE                 DECIMAL(18,2),
    PAYROLL_TOT_LE             DECIMAL(18,2),
    BONUS_LE                   DECIMAL(18,2),    
    FLEET_CARD_PE_LE           DECIMAL(18,2),
    CAR_ALLOWANCE_LE           DECIMAL(18,2),
    LICENSE_ALLOWANCE_LE       DECIMAL(18,2),
    HOUSING_ALLOWANCE_LE       DECIMAL(18,2),
    GASOLINE_ALLOWANCE_LE      DECIMAL(18,2),
    WAGE_STUDENT_LE            DECIMAL(18,2),
    CAR_RENTAL_PE_LE           DECIMAL(18,2),
    SKILL_PAY_ALLOWANCE_LE     DECIMAL(18,2),
    OTHER_ALLOWANCE_LE         DECIMAL(18,2),
    SOCIAL_SECURITY_LE         DECIMAL(18,2),
    LABOR_FUND_FEE_LE          DECIMAL(18,2),
    OTHER_STAFF_BENEFIT_LE     DECIMAL(18,2),
    PROVIDENT_FUND_LE          DECIMAL(18,2),
    PROVISION_LE               DECIMAL(18,2),
    INTEREST_LE                DECIMAL(18,2),
    STAFF_INSURANCE_LE         DECIMAL(18,2),
    MEDICAL_EXPENSE_LE         DECIMAL(18,2),
    MEDICAL_INHOUSE_LE         DECIMAL(18,2),
    TRAINING_LE                DECIMAL(18,2),
    LONG_SERVICE_LE            DECIMAL(18,2),
    PE_SB_MTH_LE               DECIMAL(18,2),
    PE_SB_LE                   DECIMAL(18,2),
    PAYROLL                   DECIMAL(18,2),
    PREMIUM                 DECIMAL(18,2),
    PAYROLL_TOT                DECIMAL(18,2),
    BONUS                   DECIMAL(18,2),    
    BONUS_TYPE             NVARCHAR(20),
    FLEET_CARD_PE           DECIMAL(18,2),
    CAR_ALLOWANCE           DECIMAL(18,2),
    LICENSE_ALLOWANCE       DECIMAL(18,2),
    HOUSING_ALLOWANCE       DECIMAL(18,2),
    GASOLINE_ALLOWANCE      DECIMAL(18,2),
    WAGE_STUDENT            DECIMAL(18,2),
    CAR_RENTAL_PE           DECIMAL(18,2),
    SKILL_PAY_ALLOWANCE     DECIMAL(18,2),
    OTHER_ALLOWANCE         DECIMAL(18,2),
    SOCIAL_SECURITY         DECIMAL(18,2),
    LABOR_FUND_FEE          DECIMAL(18,2),
    OTHER_STAFF_BENEFIT     DECIMAL(18,2),
    PROVIDENT_FUND          DECIMAL(18,2),
    PROVISION               DECIMAL(18,2),
    INTEREST                DECIMAL(18,2),
    STAFF_INSURANCE         DECIMAL(18,2),
    MEDICAL_EXPENSE         DECIMAL(18,2),
    MEDICAL_INHOUSE         DECIMAL(18,2),
    TRAINING                DECIMAL(18,2),
    LONG_SERVICE            DECIMAL(18,2),
    PE_SB_MTH               DECIMAL(18,2),
    PE_SB_YEAR              DECIMAL(18,2),
    PE_MTH_LE               DECIMAL(18,2),
    PE_YEAR_LE              DECIMAL(18,2),
    PE_MTH                  DECIMAL(18,2),
    PE_YEAR                 DECIMAL(18,2),
    RUNRATE_CODE            nvarchar(50),
    DISCOUNT                decimal(5,2),
    EXECUTIVE               nvarchar(1),
    FOCUS_HC                nvarchar(1),
    FOCUS_PE                nvarchar(1),
    JOIN_PVF                int,
    RATE_PVF                DECIMAL(18,2),
    PVF                     nvarchar(1)
)
AS
BEGIN
    DECLARE 
@premium_le                 DECIMAL(18,2) = 0.00,
@bonus_le                   DECIMAL(18,2) = 0.00,
@payroll_tot_le             DECIMAL(18,2) = 0.00,
@fleet_card_pe_le           DECIMAL(18,2) = 0.00,
@car_allowance_le           DECIMAL(18,2) = 0.00,
@license_allowance_le       DECIMAL(18,2) = 0.00,
@housing_allowance_le       DECIMAL(18,2) = 0.00,
@gasoline_allowance_le      DECIMAL(18,2) = 0.00,
@wage_student_le            DECIMAL(18,2) = 0.00,
@car_rental_pe_le           DECIMAL(18,2) = 0.00,
@skill_pay_allowance_le     DECIMAL(18,2) = 0.00,
@other_allowance_le         DECIMAL(18,2) = 0.00,
@social_security_le         DECIMAL(18,2) = 0.00,
@labor_fund_fee_le          DECIMAL(18,2) = 0.00,
@other_staff_benefit_le     DECIMAL(18,2) = 0.00,
@provident_fund_le          DECIMAL(18,2) = 0.00,
@provision_le               DECIMAL(18,2) = 0.00,
@interest_le                DECIMAL(18,2) = 0.00,
@staff_insurance_le         DECIMAL(18,2) = 0.00,
@medical_expense_le         DECIMAL(18,2) = 0.00,
@medical_inhouse_le         DECIMAL(18,2) = 0.00,
@training_le                DECIMAL(18,2) = 0.00,
@long_service_le            DECIMAL(18,2) = 0.00,
@pe_sb_mth_le               DECIMAL(18,2) = 0.00,
@pe_sb_le                   DECIMAL(18,2) = 0.00,
@payroll                    DECIMAL(18,2) = 0.00,
@premium                     DECIMAL(18,2) = 0.00,
@bonus                   DECIMAL(18,2) = 0.00,
@payroll_tot             DECIMAL(18,2) = 0.00,
@fleet_card_pe           DECIMAL(18,2) = 0.00, 
@car_allowance           DECIMAL(18,2) = 0.00, 
@license_allowance       DECIMAL(18,2) = 0.00, 
@housing_allowance       DECIMAL(18,2) = 0.00, 
@gasoline_allowance      DECIMAL(18,2) = 0.00, 
@wage_student            DECIMAL(18,2) = 0.00,
@car_rental_pe           DECIMAL(18,2) = 0.00,
@skill_pay_allowance     DECIMAL(18,2) = 0.00,
@other_allowance         DECIMAL(18,2) = 0.00,
@social_security         DECIMAL(18,2) = 0.00,
@labor_fund_fee          DECIMAL(18,2) = 0.00,
@other_staff_benefit     DECIMAL(18,2) = 0.00,
@provident_fund          DECIMAL(18,2) = 0.00,
@provision               DECIMAL(18,2) = 0.00,
@interest                DECIMAL(18,2) = 0.00,
@staff_insurance         DECIMAL(18,2) = 0.00,
@medical_expense         DECIMAL(18,2) = 0.00,
@medical_inhouse         DECIMAL(18,2) = 0.00,
@training                DECIMAL(18,2) = 0.00,
@long_service            DECIMAL(18,2) = 0.00,
@pe_sb_mth               DECIMAL(18,2) = 0.00,
@pe_sb_year              DECIMAL(18,2) = 0.00,
@pe_mth_le               DECIMAL(18,2) = 0.00,
@pe_year_le              DECIMAL(18,2) = 0.00,
@pe_mth                  DECIMAL(18,2) = 0.00,
@pe_year                 DECIMAL(18,2) = 0.00,
@runrate_code            nvarchar(50) = null,
@discount                decimal(5,2)  = 0.00,
@executive               nvarchar(1) = null,
@focus_hc                nvarchar(1) = null,
@focus_pe                nvarchar(1) = null,
@join_pvf                INT  = 0,
@rate_pvf				 DECIMAL(18,2)  = 0.00,
@pvf                     nvarchar(1)  = null,
@bonus_rate              DECIMAL(10,2) = 0.00,
@max_sal_cal_sso         DECIMAL(18,2)  = 0.00,
@rate_cal_sso            DECIMAL(18,2)  = 0.00,
@max_amt_cal_lff         DECIMAL(18,2)  = 0.00
;

--start ส่วน constant
--รอ design table / function

IF @year IS NULL OR @year = 0
BEGIN
    SET @year = YEAR(GETDATE()) + 1; 
END;

IF @year_le IS NULL OR @year_le = 0
BEGIN
    SET @year_le = YEAR(GETDATE()) ; 
END;

set @max_sal_cal_sso = 875.00;
set @rate_cal_sso = 0.05;
set @pvf = 'N';
set @max_amt_cal_lff = 20000;
--end ส่วน constant

--start cal ส่วน LE--
set @premium_le = @premium_amt;
set @payroll_tot_le = @salary + @premium_le;
set @bonus_rate = dbo.fn_getBonusRate(@year_le, @bonus_type, @company_id);
set @bonus_le = round((@payroll_tot_le*@bonus_rate)/12.0,2) ;
set @fleet_card_pe_le = 0; -- waiting confirm
set @car_allowance_le = dbo.fn_getCarAllowance(@jobband,@company_id);
set @wage_student_le = 0; -- waiting confirm
set @car_rental_pe_le = @car_rental_pe_le;          
set @skill_pay_allowance_le = @skill_pay_allowance_le;    
set @other_allowance_le = @other_allowance_le;

set @social_security_le = CASE WHEN @salary * @rate_cal_sso > @max_sal_cal_sso THEN @max_sal_cal_sso ELSE @salary * @rate_cal_sso END ;
set @labor_fund_fee_le = dbo.fn_getLaborFundFee(@company_id,@company_name) * (CASE WHEN @salary > @max_amt_cal_lff THEN @max_amt_cal_lff ELSE @salary END) ;
set @rate_pvf = dbo.fn_getProvidentFund(@year_le, @jobband, @company_id) / 100.0;
set @provident_fund_le = @rate_pvf * @salary;  
set @provision_le = dbo.fn_getProvision(@company_id) * @salary ;
set @interest_le = dbo.fn_getInterest(@company_id) * @salary ;
set @staff_insurance_le = (dbo.fn_getStaffInsurance(@year_le, @jobband, @company_id) * @salary) / 12.0;  
set @medical_expense_le = dbo.fn_getMedicalExpense(@year_le, @jobband, @company_id) / 12.0;  
set @medical_inhouse_le = dbo.fn_getMedicalInhouse(@company_id);

set @pe_sb_mth_le = (@salary + @premium_le + @bonus_le + @fleet_card_pe_le + @car_allowance_le + @license_allowance_le + @housing_allowance_le + 
                     @gasoline_allowance_le + @wage_student_le + @car_rental_pe_le + @skill_pay_allowance_le + @other_allowance_le + @social_security_le + 
                     @labor_fund_fee_le + @other_staff_benefit_le + @provident_fund_le + @provision_le + @interest_le + @staff_insurance_le + 
                     @medical_expense_le + @medical_inhouse_le + @training_le + @long_service_le);
set @pe_sb_le =  @le_of_month * @pe_sb_mth_le;

set @pe_mth_le = (@salary + @premium_le + @bonus_le + @fleet_card_pe_le + @car_allowance_le + @license_allowance_le + @housing_allowance_le + 
                  @gasoline_allowance_le + @wage_student_le + @car_rental_pe_le + @skill_pay_allowance_le + @other_allowance_le + @social_security_le + 
                  @labor_fund_fee_le + @other_staff_benefit_le + @provident_fund_le + @provision_le + @interest_le);             
set @pe_year_le = @le_of_month * @pe_mth_le;
set @executive = case when @jobband >= '5A' then 'Y' else null end; 

--end cal ส่วน LE--

--start cal ส่วน Next Year--
set @payroll = @salary * (1 + (dbo.fn_getMeritPercent(@company_id) / 100.0)) * (dbo.fn_getRunRate(@company_id,@cost_center) / 100.0) ;
set @premium = @premium_amt;
set @payroll_tot = @payroll + @premium;
set @bonus = round((@payroll_tot*@bonus_rate)/12.0,2) ;
set @fleet_card_pe = @fleet_card_pe_le;
set @car_allowance = @car_allowance_le;
set @license_allowance = @license_allowance_le;
set @housing_allowance = @housing_allowance_le;
set @gasoline_allowance = @gasoline_allowance_le;
set @wage_student = @wage_student_le ;    
set @car_rental_pe = @car_rental_pe_le;          
set @skill_pay_allowance = @skill_pay_allowance_le;    
set @other_allowance = @other_allowance_le;         
set @social_security = CASE WHEN @payroll * @rate_cal_sso > @max_sal_cal_sso THEN @max_sal_cal_sso ELSE @payroll * @rate_cal_sso END ; 
set @labor_fund_fee = dbo.fn_getLaborFundFee(@company_id,@company_name) * (CASE WHEN @payroll > @max_amt_cal_lff THEN @max_amt_cal_lff ELSE @payroll END) ;        
set @other_staff_benefit = @other_staff_benefit_le;   
set @provident_fund = @rate_pvf * @payroll;  
set @provision = dbo.fn_getProvision(@company_id) * @payroll;                
set @interest =  dbo.fn_getInterest(@company_id) * @payroll;               
set @staff_insurance = (dbo.fn_getStaffInsurance(@year_le, @jobband, @company_id) * @payroll) / 12.0;         
set @medical_expense = @medical_expense_le;        
set @medical_inhouse = @medical_inhouse_le;       
set @training = @training_le;              
set @long_service = @long_service_le;                   

set @pe_sb_mth = (@payroll + @premium + @bonus + @fleet_card_pe + @car_allowance + @license_allowance + @housing_allowance + 
                     @gasoline_allowance + @wage_student + @car_rental_pe + @skill_pay_allowance + @other_allowance + @social_security + 
                     @labor_fund_fee + @other_staff_benefit + @provident_fund + @provision + @interest + @staff_insurance + 
                     @medical_expense + @medical_inhouse + @training + @long_service);
set @pe_sb_year = @no_of_month * @pe_sb_mth;
            
set @pe_mth = (@payroll + @premium + @bonus + @fleet_card_pe + @car_allowance + @license_allowance + @housing_allowance + 
               @gasoline_allowance + @wage_student + @car_rental_pe + @skill_pay_allowance + @other_allowance + @social_security + 
               @labor_fund_fee + @other_staff_benefit + @provident_fund + @provision + @interest);             
set @pe_year = @no_of_month * @pe_mth;               

set @focus_hc = 'Y';
set @focus_pe = case when @allocate_json IS NOT NULL AND TRIM(@allocate_json) <> N'' AND ISJSON(@allocate_json) = 1 then null else 'Y' end;


--end cal ส่วน Next Year--

--เพิ่ม main cost center 
INSERT @R
SELECT 
'Y',
@cost_center,
@salary,
@premium_le,
@payroll_tot_le,
@bonus_le,
@fleet_card_pe_le,
@car_allowance_le,
@license_allowance_le,
@housing_allowance_le,
@gasoline_allowance_le,
@wage_student_le,
@car_rental_pe_le,
@skill_pay_allowance_le,
@other_allowance_le,
@social_security_le,
@labor_fund_fee_le,
@other_staff_benefit_le,
@provident_fund_le,
@provision_le,
@interest_le,
@staff_insurance_le,
@medical_expense_le,
@medical_inhouse_le,
@training_le,
@long_service_le,
@pe_sb_mth_le,
@pe_sb_le,
@payroll,
@premium,
@payroll_tot,
@bonus,
@bonus_type,
@fleet_card_pe,
@car_allowance,
@license_allowance,
@housing_allowance,
@gasoline_allowance,
@wage_student,
@car_rental_pe,
@skill_pay_allowance,
@other_allowance,
@social_security,
@labor_fund_fee,
@other_staff_benefit,
@provident_fund,
@provision,
@interest,
@staff_insurance,
@medical_expense,
@medical_inhouse,
@training,
@long_service,
@pe_sb_mth,
@pe_sb_year,
@pe_mth_le,
@pe_year_le,
@pe_mth,
@pe_year,
@runrate_code,
@discount,
@executive,
@focus_hc,
@focus_pe,
@join_pvf,
@rate_pvf,
@pvf;

--start ส่วน Allocate Cost Center--

 --ใช้ table variable ภายใน (ไม่ใช่ #temp)
 DECLARE @tv_allocate TABLE(
         p_emp_code      NVARCHAR(10),
         p_cost_center   NVARCHAR(10),
         p_rate          DECIMAL(18,2)
 );

 /*
 DECLARE @mock NVARCHAR(MAX) = N'[
     {"emp_code":"A001","cost_center":"110","rate":50},
     {"emp_code":"A001","cost_center":"120","rate":30},
     {"emp_code":"A001","cost_center":"130","rate":20}
 ]';

 set @allocate_json = @mock;
 */

 IF @allocate_json IS NOT NULL AND TRIM(@allocate_json) <> N'' AND ISJSON(@allocate_json) = 1
 BEGIN
    --แยก JSON ใส่ลงใน @tv_allocate
    INSERT @tv_allocate(p_emp_code, p_cost_center, p_rate)
    SELECT
        TRIM(j.emp_code),
        TRIM(j.cost_center),
        TRY_CONVERT(DECIMAL(18,2), j.rate / 100.0)
    FROM OPENJSON(@allocate_json)
    WITH (
        emp_code    NVARCHAR(10)  '$.emp_code',
        cost_center NVARCHAR(10)  '$.cost_center',
        rate        DECIMAL(18,2) '$.rate'
    ) AS j
    WHERE j.cost_center IS NOT NULL;

    --เพิ่ม allocate cost center 
    INSERT @R
    SELECT 
    'N',
    p_cost_center ,
    (@salary * p_rate) ,
    (@premium_le * p_rate) ,
    (@payroll_tot_le * p_rate) ,
    (@bonus_le * p_rate) ,      
    (@fleet_card_pe_le * p_rate) ,
    (@car_allowance_le * p_rate) ,
    (@license_allowance_le * p_rate) ,
    (@housing_allowance_le * p_rate) ,
    (@gasoline_allowance_le * p_rate) ,
    (@wage_student_le * p_rate) ,
    (@car_rental_pe_le * p_rate) ,
    (@skill_pay_allowance_le * p_rate) ,
    (@other_allowance_le * p_rate) ,
    (@social_security_le * p_rate) ,
    (@labor_fund_fee_le * p_rate) ,
    (@other_staff_benefit_le * p_rate) ,
    (@provident_fund_le * p_rate) ,
    (@provision_le * p_rate) ,
    (@interest_le * p_rate) ,
    (@staff_insurance_le * p_rate) ,
    (@medical_expense_le * p_rate) ,
    (@medical_inhouse_le * p_rate) ,
    (@training_le * p_rate) ,
    (@long_service_le * p_rate) ,
    (@pe_sb_mth_le * p_rate) ,
    (@pe_sb_le * p_rate) ,
    (@payroll * p_rate) ,
    (@premium * p_rate) ,
    (@payroll_tot * p_rate) ,
    (@bonus * p_rate) ,
    @bonus_type,
    (@fleet_card_pe * p_rate) ,
    (@car_allowance * p_rate) ,
    (@license_allowance * p_rate) ,
    (@housing_allowance * p_rate) ,
    (@gasoline_allowance * p_rate) ,
    (@wage_student * p_rate) ,
    (@car_rental_pe * p_rate) ,
    (@skill_pay_allowance * p_rate) ,
    (@other_allowance * p_rate) ,
    (@social_security * p_rate) ,
    (@labor_fund_fee * p_rate) ,
    (@other_staff_benefit * p_rate) ,
    (@provident_fund * p_rate) ,
    (@provision * p_rate) ,
    (@interest * p_rate) ,
    (@staff_insurance * p_rate) ,
    (@medical_expense * p_rate) ,
    (@medical_inhouse * p_rate) ,
    (@training * p_rate) ,
    (@long_service * p_rate) ,
    (@pe_sb_mth * p_rate) ,
    (@pe_sb_year * p_rate) ,
    (@pe_mth_le * p_rate) ,
    (@pe_year_le * p_rate) ,
    (@pe_mth * p_rate) ,
    (@pe_year * p_rate) ,
    @runrate_code,
    @discount,
    @executive,
    null,
    'Y',
    @join_pvf,
    @rate_pvf,
    @pvf
    from @tv_allocate;


END;

--end ส่วน Allocate Cost Center--



    RETURN;
END;
