USE [HRBUDGET]
GO
/****** Object:  UserDefinedFunction [dbo].[fn_BudgetEstimate_BJC]    Script Date: 11/6/2025 3:15:36 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER   FUNCTION [dbo].[fn_BudgetEstimate_BJC]
(
    
    @year               INT,
    @year_le            INT,
    @salary             DECIMAL(18,2),
    @premium_amt        DECIMAL(18,2),
    @jobband            NVARCHAR(10),
    @emp_type           NVARCHAR(10),
    @company_id         INT,
    @le_of_month        INT,
    @no_of_month        INT,
    @bonus_type_le      NVARCHAR(20),
    @bonus_type         NVARCHAR(20),
    @company_name       NVARCHAR(100),    
    @cost_center        NVARCHAR(10),
    @position_name      NVARCHAR(100),
    @yos_le             INT,
    @yos                INT,
    @dept_name          NVARCHAR(100),
    @bu                 NVARCHAR(100),
    @cobu               NVARCHAR(100)
)
RETURNS @R TABLE
(      
    PAYROLL_LE                       DECIMAL(18,2),
    PREMIUM_LE                       DECIMAL(18,2),
    SAL_WITH_EN_LE                   DECIMAL(18,2),
    SAL_NOT_EN_LE                    DECIMAL(18,2),
    BONUS_LE                         DECIMAL(18,2),
    SAL_TEMP_LE                      DECIMAL(18,2),
    SOCIAL_SECURITY_TMP_LE           DECIMAL(18,2),
    SOUTHRISK_ALLOWANCE_TMP_LE       DECIMAL(18,2),
    CAR_MAINTENANCE_TMP_LE           DECIMAL(18,2),
    SALES_MANAGEMENT_PC_LE           DECIMAL(18,2),
    SHELF_STACKING_PC_LE             DECIMAL(18,2),
    DILIGENCE_ALLOWANCE_PC_LE        DECIMAL(18,2),
    POST_ALLOWANCE_PC_LE             DECIMAL(18,2),
    PHONE_ALLOWANCE_PC_LE            DECIMAL(18,2),
    TRANSPORTATION_PC_LE             DECIMAL(18,2),
    SKILL_ALLOWANCE_PC_LE            DECIMAL(18,2),
    OTHER_ALLOWANCE_PC_LE            DECIMAL(18,2),
    TEMPORARY_STAFF_SAL_LE           DECIMAL(18,2),
    SOCIAL_SECURITY_LE               DECIMAL(18,2),
    PROVIDENT_FUND_LE                DECIMAL(18,2),
    WORKMEN_COMPENSATION_LE          DECIMAL(18,2),
    HOUSING_ALLOWANCE_LE             DECIMAL(18,2),
    SALES_CAR_ALLOWANCE_LE           DECIMAL(18,2),
    ACCOMMODATION_LE                 DECIMAL(18,2),
    CAR_MAINTENANCE_LE               DECIMAL(18,2),
    SOUTHRISK_ALLOWANCE_LE           DECIMAL(18,2),
    MEAL_ALLOWANCE_LE                DECIMAL(18,2),
    OTHER_LE                         DECIMAL(18,2),
    OTHERS_SUBJECT_TAX_LE            DECIMAL(18,2),
    CAR_ALLOWANCE_LE                 DECIMAL(18,2),
    LICENSE_ALLOWANCE_LE             DECIMAL(18,2),
    OUTSOURCE_WAGES_LE               DECIMAL(18,2),
    COMP_CARS_GAS_LE                 DECIMAL(18,2),
    COMP_CARS_OTHER_LE               DECIMAL(18,2),
    CAR_RENTAL_LE                    DECIMAL(18,2),
    CAR_GASOLINE_LE                  DECIMAL(18,2),
    CAR_REPAIR_LE                    DECIMAL(18,2),
    MEDICAL_OUTSIDE_LE               DECIMAL(18,2),
    MEDICAL_INHOUSE_LE               DECIMAL(18,2),
    STAFF_ACTIVITIES_LE              DECIMAL(18,2),
    UNIFORM_LE                       DECIMAL(18,2),
    LIFE_INSURANCE_LE                DECIMAL(18,2),
    PE_SB_MTH_LE                     DECIMAL(18,2),
    PE_SB_YEAR_LE                    DECIMAL(18,2),
    PAYROLL                          DECIMAL(18,2),
    PREMIUM                          DECIMAL(18,2),
    SAL_WITH_EN                      DECIMAL(18,2),
    SAL_NOT_EN                       DECIMAL(18,2),
    BONUS                            DECIMAL(18,2),
    SAL_TEMP                         DECIMAL(18,2),
    SOCIAL_SECURITY_TMP              DECIMAL(18,2),
    SOUTHRISK_ALLOWANCE_TMP          DECIMAL(18,2),
    CAR_MAINTENANCE_TMP              DECIMAL(18,2),
    SALES_MANAGEMENT_PC              DECIMAL(18,2),
    SHELF_STACKING_PC                DECIMAL(18,2),
    DILIGENCE_ALLOWANCE_PC           DECIMAL(18,2),
    POST_ALLOWANCE_PC                DECIMAL(18,2),
    PHONE_ALLOWANCE_PC               DECIMAL(18,2),
    TRANSPORTATION_PC                DECIMAL(18,2),
    SKILL_ALLOWANCE_PC               DECIMAL(18,2),
    OTHER_ALLOWANCE_PC               DECIMAL(18,2),
    TEMPORARY_STAFF_SAL              DECIMAL(18,2),
    SOCIAL_SECURITY                  DECIMAL(18,2),
    PROVIDENT_FUND                   DECIMAL(18,2),
    WORKMEN_COMPENSATION             DECIMAL(18,2),
    HOUSING_ALLOWANCE                DECIMAL(18,2),
    SALES_CAR_ALLOWANCE              DECIMAL(18,2),
    ACCOMMODATION                    DECIMAL(18,2),
    CAR_MAINTENANCE                  DECIMAL(18,2),
    SOUTHRISK_ALLOWANCE              DECIMAL(18,2),
    MEAL_ALLOWANCE                   DECIMAL(18,2),
    OTHER                            DECIMAL(18,2),
    OTHERS_SUBJECT_TAX               DECIMAL(18,2),
    CAR_ALLOWANCE                    DECIMAL(18,2),
    LICENSE_ALLOWANCE                DECIMAL(18,2),
    OUTSOURCE_WAGES                  DECIMAL(18,2),
    COMP_CARS_GAS                    DECIMAL(18,2),
    COMP_CARS_OTHER                  DECIMAL(18,2),
    CAR_RENTAL                       DECIMAL(18,2),
    CAR_GASOLINE                     DECIMAL(18,2),
    CAR_REPAIR                       DECIMAL(18,2),
    MEDICAL_OUTSIDE                  DECIMAL(18,2),
    MEDICAL_INHOUSE                  DECIMAL(18,2),
    STAFF_ACTIVITIES                 DECIMAL(18,2),
    UNIFORM                          DECIMAL(18,2),
    LIFE_INSURANCE                   DECIMAL(18,2),
    PE_SB_MTH                        DECIMAL(18,2),
    PE_SB_YEAR                       DECIMAL(18,2),
    PE_MTH_LE                        DECIMAL(18,2),
    PE_YEAR_LE                       DECIMAL(18,2),
    PE_MTH                           DECIMAL(18,2),
    PE_YEAR                          DECIMAL(18,2),
    RUNRATE_CODE            		 nvarchar(50),
    DISCOUNT                		 decimal(5,2),
    EXECUTIVE               		 nvarchar(1),
    FOCUS_HC                		 nvarchar(1),
    FOCUS_PE                		 nvarchar(1),
    JOIN_PVF                         DECIMAL(18,2),
    RATE_PVF						 DECIMAL(18,2),
    PVF                              nvarchar(1)
)
AS
BEGIN
    DECLARE 
@payroll_le                       DECIMAL(18,2) = 0.00,
@premium_le                       DECIMAL(18,2) = 0.00,
@sal_with_en_le                   DECIMAL(18,2) = 0.00,
@sal_not_en_le                    DECIMAL(18,2) = 0.00,
@bonus_le                         DECIMAL(18,2) = 0.00,
@sal_temp_le                      DECIMAL(18,2) = 0.00,
@social_security_tmp_le           DECIMAL(18,2) = 0.00,
@southrisk_allowance_tmp_le       DECIMAL(18,2) = 0.00,
@car_maintenance_tmp_le           DECIMAL(18,2) = 0.00,
@sales_management_pc_le           DECIMAL(18,2) = 0.00,
@shelf_stacking_pc_le             DECIMAL(18,2) = 0.00,
@diligence_allowance_pc_le        DECIMAL(18,2) = 0.00,
@post_allowance_pc_le             DECIMAL(18,2) = 0.00,
@phone_allowance_pc_le            DECIMAL(18,2) = 0.00,
@transportation_pc_le             DECIMAL(18,2) = 0.00,
@skill_allowance_pc_le            DECIMAL(18,2) = 0.00,
@other_allowance_pc_le            DECIMAL(18,2) = 0.00,
@temporary_staff_sal_le           DECIMAL(18,2) = 0.00,
@social_security_le               DECIMAL(18,2) = 0.00,
@provident_fund_le                DECIMAL(18,2) = 0.00,
@workmen_compensation_le          DECIMAL(18,2) = 0.00,
@housing_allowance_le             DECIMAL(18,2) = 0.00,
@sales_car_allowance_le           DECIMAL(18,2) = 0.00,
@accommodation_le                 DECIMAL(18,2) = 0.00,
@car_maintenance_le               DECIMAL(18,2) = 0.00,
@southrisk_allowance_le           DECIMAL(18,2) = 0.00,
@meal_allowance_le                DECIMAL(18,2) = 0.00,
@other_le                         DECIMAL(18,2) = 0.00,
@others_subject_tax_le            DECIMAL(18,2) = 0.00,
@car_allowance_le                 DECIMAL(18,2) = 0.00,
@license_allowance_le             DECIMAL(18,2) = 0.00,
@outsource_wages_le               DECIMAL(18,2) = 0.00,
@comp_cars_gas_le                 DECIMAL(18,2) = 0.00,
@comp_cars_other_le               DECIMAL(18,2) = 0.00,
@car_rental_le                    DECIMAL(18,2) = 0.00,
@car_gasoline_le                  DECIMAL(18,2) = 0.00,
@car_repair_le                    DECIMAL(18,2) = 0.00,
@medical_outside_le               DECIMAL(18,2) = 0.00,
@medical_inhouse_le               DECIMAL(18,2) = 0.00,
@staff_activities_le              DECIMAL(18,2) = 0.00,
@uniform_le                       DECIMAL(18,2) = 0.00,
@life_insurance_le                DECIMAL(18,2) = 0.00,
@pe_sb_mth_le                     DECIMAL(18,2) = 0.00,
@pe_sb_year_le                    DECIMAL(18,2) = 0.00,
@payroll                          DECIMAL(18,2) = 0.00,
@premium                          DECIMAL(18,2) = 0.00,
@sal_with_en                      DECIMAL(18,2) = 0.00,
@sal_not_en                       DECIMAL(18,2) = 0.00,
@bonus                            DECIMAL(18,2) = 0.00,
@sal_temp                         DECIMAL(18,2) = 0.00,
@social_security_tmp              DECIMAL(18,2) = 0.00,
@southrisk_allowance_tmp          DECIMAL(18,2) = 0.00,
@car_maintenance_tmp              DECIMAL(18,2) = 0.00,
@sales_management_pc              DECIMAL(18,2) = 0.00,
@shelf_stacking_pc                DECIMAL(18,2) = 0.00,
@diligence_allowance_pc           DECIMAL(18,2) = 0.00,
@post_allowance_pc                DECIMAL(18,2) = 0.00,
@phone_allowance_pc               DECIMAL(18,2) = 0.00,
@transportation_pc                DECIMAL(18,2) = 0.00,
@skill_allowance_pc               DECIMAL(18,2) = 0.00,
@other_allowance_pc               DECIMAL(18,2) = 0.00,
@temporary_staff_sal              DECIMAL(18,2) = 0.00,
@social_security                  DECIMAL(18,2) = 0.00,
@provident_fund                   DECIMAL(18,2) = 0.00,
@workmen_compensation             DECIMAL(18,2) = 0.00,
@housing_allowance                DECIMAL(18,2) = 0.00,
@sales_car_allowance              DECIMAL(18,2) = 0.00,
@accommodation                    DECIMAL(18,2) = 0.00,
@car_maintenance                  DECIMAL(18,2) = 0.00,
@southrisk_allowance              DECIMAL(18,2) = 0.00,
@meal_allowance                   DECIMAL(18,2) = 0.00,
@other                            DECIMAL(18,2) = 0.00,
@others_subject_tax               DECIMAL(18,2) = 0.00, 
@car_allowance                    DECIMAL(18,2) = 0.00, 
@license_allowance                DECIMAL(18,2) = 0.00, 
@outsource_wages                  DECIMAL(18,2) = 0.00,
@comp_cars_gas                    DECIMAL(18,2) = 0.00,
@comp_cars_other                  DECIMAL(18,2) = 0.00,
@car_rental                       DECIMAL(18,2) = 0.00,
@car_gasoline                     DECIMAL(18,2) = 0.00,
@car_repair                       DECIMAL(18,2) = 0.00,
@medical_outside                  DECIMAL(18,2) = 0.00,
@medical_inhouse                  DECIMAL(18,2) = 0.00,
@staff_activities                 DECIMAL(18,2) = 0.00,
@uniform                          DECIMAL(18,2) = 0.00,
@life_insurance                   DECIMAL(18,2) = 0.00,
@pe_sb_mth                        DECIMAL(18,2) = 0.00,
@pe_sb_year                       DECIMAL(18,2) = 0.00,
@pe_mth_le                        DECIMAL(18,2) = 0.00,
@pe_year_le                       DECIMAL(18,2) = 0.00,
@pe_mth                           DECIMAL(18,2) = 0.00,
@pe_year                          DECIMAL(18,2) = 0.00,
@runrate_code            		 nvarchar(50) = null,
@discount                		 decimal(5,2) = 0.00,
@executive               		 nvarchar(1) = null,
@focus_hc                		 nvarchar(1) = null,
@focus_pe                		 nvarchar(1) = null,
@join_pvf                         int  = 0,
@rate_pvf						 DECIMAL(18,2)  = 0.00,
@pvf                              nvarchar(1)  = null,
@bonus_rate_le                  DECIMAL(10,2) = 0.00,
@bonus_rate                        DECIMAL(10,2) = 0.00,
@max_sal_cal_sso                    DECIMAL(18,2)  = 0.00,
@rate_cal_sso                       DECIMAL(18,2)  = 0.00,
@max_sal_cal_workmen                    DECIMAL(18,2)  = 0.00,
@rate_cal_workmen                       DECIMAL(18,2)  = 0.00,
@bf_plan                             nvarchar(4)  = null
;

--start ส่วน constant
--รอ design table / function
set @max_sal_cal_sso = 17500.00;
set @rate_cal_sso = 0.05;
set @max_sal_cal_workmen = 20000.00;
set @rate_cal_workmen = 0.0016;
set @focus_hc ='Y';
set @focus_pe ='Y';
set @pvf = 'N';
--end ส่วน constant

--start cal ส่วน LE--
set @payroll_le = @salary;                     
set @premium_le = @premium_amt;                   
set @sal_with_en_le = case when @bonus_type_le in ('Commission','Temp') then 0.00 else @payroll_le + @premium_le  end ;
set @sal_not_en_le =  case when @bonus_type_le = 'Commission' then @payroll_le + @premium_le else 0.00  end ;
set @bonus_rate_le = dbo.fn_getBonusRate(@year_le, @bonus_type_le, @company_id);
set @bonus_le = round((@sal_with_en_le*@bonus_rate_le)/12.0,2);
set @sal_temp_le = case when @bonus_type_le = 'Temp' then @payroll_le + @premium_le else 0.00  end ;   
set @social_security_tmp_le = CASE WHEN @bonus_type_le = 'Temp' THEN LEAST(@sal_temp_le,@max_sal_cal_sso) * @rate_cal_sso ELSE 0.00 END ;   
set @sales_management_pc_le = dbo.fn_getSalesManagementPC(@company_id,@position_name);       
set @shelf_stacking_pc_le = dbo.fn_getShelfStackingPC(@company_id,@position_name);   
set @diligence_allowance_pc_le = dbo.fn_getDiligenceAllowancePC(@company_id,@position_name); 
set @post_allowance_pc_le  = dbo.fn_getPostAllowancePC(@company_id,@position_name);    
set @skill_allowance_pc_le = dbo.fn_getSkillAllowancePC(@company_id,@position_name,@yos_le); 
set @temporary_staff_sal_le  = (@sal_temp_le + @social_security_tmp_le + @southrisk_allowance_tmp_le + @car_maintenance_tmp_le + @sales_management_pc_le + @shelf_stacking_pc_le + @diligence_allowance_pc_le + @post_allowance_pc_le + @phone_allowance_pc_le + @transportation_pc_le + @skill_allowance_pc_le + @other_allowance_pc_le)      
set @social_security_le = LEAST(@sal_with_en_le + @sal_not_en_le + @sal_temp_le ,@max_sal_cal_sso) * @rate_cal_sso ;  
set @rate_pvf = dbo.fn_getProvidentFund(@year_le, @jobband, @company_id) / 100.0 ;
set @provident_fund_le = @rate_pvf * (@sal_with_en_le + @sal_not_en_le) ; 
set @workmen_compensation_le =  LEAST((@sal_with_en_le + @sal_not_en_le + @sal_temp_le),@max_sal_cal_workmen)*@rate_cal_workmen;
--set @accommodation_le = case when @bu ='HB' and @dept_name ='HORECA' then dbo.fn_getAccommodation(@company_id,@position_name) else 0.00 end;  
--set @meal_allowance_le = dbo.fn_getUniform(@company_id,@position_name);  
set @others_subject_tax_le = (@housing_allowance_le + @sales_car_allowance_le + @accommodation_le + @car_maintenance_le + @southrisk_allowance_le + @meal_allowance_le + @other_le);
set @car_allowance_le = dbo.fn_getCarAllowance(@jobband,@company_id);
set @bf_plan = dbo.fn_getBenefitPlan(@company_id, @jobband);
set @medical_outside_le = case when @bf_plan is null then 0 else dbo.fn_getMedicalOutside(@year_le,@bf_plan,@cobu) end;
set @medical_inhouse_le = case when (@sal_with_en_le + @sal_not_en_le + @sal_temp_le) > 0 then dbo.fn_getMedicalInhouse(@company_id) else 0.00 end;  
set @staff_activities_le = case when @emp_type = 'FT' then dbo.fn_getStaffActivity(@company_id)/12.00 else 0.00 end;
--@license_allowance_le + @outsource_wages_le + @comp_cars_gas_le + @comp_cars_other_le + @car_rental_le + @car_gasoline_le + @car_repair_le
set @uniform_le = dbo.fn_getUniform(@company_id,@position_name);  
set @life_insurance_le = dbo.fn_getLifeInsurance(@company_name,@jobband);
set @pe_sb_mth_le = (@sal_with_en_le + @sal_not_en_le + @bonus_le + @temporary_staff_sal_le + @social_security_le + @workmen_compensation_le + @others_subject_tax_le + @car_allowance_le + @license_allowance_le + @outsource_wages_le + @comp_cars_gas_le + @comp_cars_other_le + @car_rental_le + @car_gasoline_le + @car_repair_le + @medical_outside_le + @medical_inhouse_le + @staff_activities_le + @uniform_le + @life_insurance_le );
set @pe_sb_year_le =  @le_of_month * @pe_sb_mth_le;
set @pe_mth_le = (@sal_with_en_le + @sal_not_en_le + @bonus_le + @temporary_staff_sal_le + @social_security_le + @workmen_compensation_le + @others_subject_tax_le + @car_allowance_le + @license_allowance_le + @outsource_wages_le + @comp_cars_gas_le + @comp_cars_other_le + @car_rental_le + @car_gasoline_le + @car_repair_le);
set @pe_year_le = @le_of_month * @pe_mth_le;
set @executive = case when @jobband >= '5A' then 'Y' else null end; 

--end cal ส่วน LE--

--start cal ส่วน Next Year--
set @payroll = @salary * (1 + (dbo.fn_getMeritPercent(@company_id) / 100.0)) * 1; -- แก้ (dbo.fn_getRunRate_BJC(@company_id,@cost_center) / 100.0);                     
set @premium = @premium_amt;                   
set @sal_with_en = case when @bonus_type in ('Commission','Temp') then 0.00 else @payroll + @premium  end ;
set @sal_not_en =  case when @bonus_type = 'Commission' then @payroll + @premium else 0.00  end ;
set @bonus_rate = dbo.fn_getBonusRate(@year, @bonus_type, @company_id);
set @bonus = round((@sal_with_en*@bonus_rate)/12.0,2);
set @sal_temp = case when @bonus_type_le = 'Temp' then @payroll + @premium else 0.00  end ;   
set @social_security_tmp = CASE WHEN @bonus_type_le = 'Temp' THEN LEAST(@sal_temp,@max_sal_cal_sso) * @rate_cal_sso ELSE 0.00 END ;   
set @sales_management_pc = dbo.fn_getSalesManagementPC(@company_id,@position_name);       
set @shelf_stacking_pc = dbo.fn_getShelfStackingPC(@company_id,@position_name);   
set @diligence_allowance_pc = dbo.fn_getDiligenceAllowancePC(@company_id,@position_name); 
set @post_allowance_pc  = dbo.fn_getPostAllowancePC(@company_id,@position_name);    
set @skill_allowance_pc = dbo.fn_getSkillAllowancePC(@company_id,@position_name,@yos); 
set @temporary_staff_sal  = (@sal_temp + @social_security_tmp + @southrisk_allowance_tmp + @car_maintenance_tmp + @sales_management_pc + @shelf_stacking_pc + @diligence_allowance_pc + @post_allowance_pc + @phone_allowance_pc + @transportation_pc + @skill_allowance_pc + @other_allowance_pc)      
set @social_security = LEAST(@sal_with_en_le + @sal_not_en_le + @sal_temp_le,@max_sal_cal_sso) * @rate_cal_sso ;  
SET @provident_fund = @rate_pvf * (@sal_with_en + @sal_not_en); 
set @workmen_compensation =  LEAST((@sal_with_en + @sal_not_en + @sal_temp),@max_sal_cal_workmen)*@rate_cal_workmen;
--set @accommodation = case when @bu ='HB' and @dept_name ='HORECA' then dbo.fn_getAccommodation(@company_id,@position_name) else 0.00 end;  
--set @meal_allowance = dbo.fn_getUniform(@company_id,@position_name);  
set @others_subject_tax = (@housing_allowance + @sales_car_allowance + @accommodation + @car_maintenance + @southrisk_allowance + @meal_allowance + @other);
set @car_allowance = dbo.fn_getCarAllowance(@jobband,@company_id);
set @medical_outside = case when @bf_plan is null then 0 else dbo.fn_getMedicalOutside(@year,@bf_plan,@cobu) end;
set @medical_inhouse = case when (@sal_with_en + @sal_not_en + @sal_temp) > 0 then dbo.fn_getMedicalInhouse(@company_id) else 0.00 end;  
set @staff_activities = case when @emp_type = 'FT' then dbo.fn_getStaffActivity(@company_id)/12.00 else 0.00 end;
--@license_allowance + @outsource_wages + @comp_cars_gas + @comp_cars_other + @car_rental + @car_gasoline + @car_repair
set @uniform = dbo.fn_getUniform(@company_id,@position_name);  
set @life_insurance = dbo.fn_getLifeInsurance(@company_name,@jobband);
set @pe_sb_mth = (@sal_with_en + @sal_not_en + @bonus + @temporary_staff_sal + @social_security + @workmen_compensation + @others_subject_tax + @car_allowance + @license_allowance + @outsource_wages + @comp_cars_gas + @comp_cars_other + @car_rental + @car_gasoline+ @car_repair + @medical_outside + @medical_inhouse + @staff_activities + @uniform + @life_insurance );
set @pe_sb_year =  @no_of_month * @pe_sb_mth;
set @pe_mth = (@sal_with_en + @sal_not_en + @bonus + @temporary_staff_sal + @social_security + @workmen_compensation + @others_subject_tax + @car_allowance + @license_allowance + @outsource_wages + @comp_cars_gas + @comp_cars_other + @car_rental + @car_gasoline+ @car_repair);
set @pe_year = @no_of_month * @pe_mth;

--end cal ส่วน Next Year--

--เพิ่ม main cost center 
INSERT @R
SELECT 
case when @le_of_month = 0 then 0.00 else @payroll_le end               ,
case when @le_of_month = 0 then 0.00 else @premium_le end               ,
case when @le_of_month = 0 then 0.00 else @sal_with_en_le  end          ,
case when @le_of_month = 0 then 0.00 else @sal_not_en_le  end           ,
case when @le_of_month = 0 then 0.00 else @bonus_le end                 ,
case when @le_of_month = 0 then 0.00 else @sal_temp_le end              ,
case when @le_of_month = 0 then 0.00 else @social_security_tmp_le end   ,
case when @le_of_month = 0 then 0.00 else @southrisk_allowance_tmp_le end,
case when @le_of_month = 0 then 0.00 else @car_maintenance_tmp_le  end   ,
case when @le_of_month = 0 then 0.00 else @sales_management_pc_le end   ,
case when @le_of_month = 0 then 0.00 else @shelf_stacking_pc_le end     ,
case when @le_of_month = 0 then 0.00 else @diligence_allowance_pc_le  end,
case when @le_of_month = 0 then 0.00 else @post_allowance_pc_le  end    ,
case when @le_of_month = 0 then 0.00 else @phone_allowance_pc_le  end   ,
case when @le_of_month = 0 then 0.00 else @transportation_pc_le end     ,
case when @le_of_month = 0 then 0.00 else @skill_allowance_pc_le end    ,
case when @le_of_month = 0 then 0.00 else @other_allowance_pc_le end    ,
case when @le_of_month = 0 then 0.00 else @temporary_staff_sal_le end   ,
case when @le_of_month = 0 then 0.00 else @social_security_le   end     ,
case when @le_of_month = 0 then 0.00 else @provident_fund_le    end     ,
case when @le_of_month = 0 then 0.00 else @workmen_compensation_le end  ,
case when @le_of_month = 0 then 0.00 else @housing_allowance_le  end    ,
case when @le_of_month = 0 then 0.00 else @sales_car_allowance_le end   ,
case when @le_of_month = 0 then 0.00 else @accommodation_le end         ,
case when @le_of_month = 0 then 0.00 else @car_maintenance_le  end      ,
case when @le_of_month = 0 then 0.00 else @southrisk_allowance_le  end  ,
case when @le_of_month = 0 then 0.00 else @meal_allowance_le   end      ,
case when @le_of_month = 0 then 0.00 else @other_le        end          ,
case when @le_of_month = 0 then 0.00 else @others_subject_tax_le  end   ,
case when @le_of_month = 0 then 0.00 else @car_allowance_le    end      ,
case when @le_of_month = 0 then 0.00 else @license_allowance_le  end    ,
case when @le_of_month = 0 then 0.00 else @outsource_wages_le    end    ,
case when @le_of_month = 0 then 0.00 else @comp_cars_gas_le    end      ,
case when @le_of_month = 0 then 0.00 else @comp_cars_other_le  end      ,
case when @le_of_month = 0 then 0.00 else @car_rental_le    end         ,
case when @le_of_month = 0 then 0.00 else @car_gasoline_le   end        ,
case when @le_of_month = 0 then 0.00 else @car_repair_le     end        ,
case when @le_of_month = 0 then 0.00 else @medical_outside_le  end      ,
case when @le_of_month = 0 then 0.00 else @medical_inhouse_le  end      ,
case when @le_of_month = 0 then 0.00 else @staff_activities_le  end     ,
case when @le_of_month = 0 then 0.00 else @uniform_le      end          ,
case when @le_of_month = 0 then 0.00 else @life_insurance_le     end    ,
case when @le_of_month = 0 then 0.00 else @pe_sb_mth_le  end            ,
case when @le_of_month = 0 then 0.00 else @pe_sb_year_le  end           ,
@payroll                   ,
@premium                   ,
@sal_with_en               ,
@sal_not_en                ,
@bonus                     ,
@sal_temp                  ,
@social_security_tmp       ,
@southrisk_allowance_tmp   ,
@car_maintenance_tmp       ,
@sales_management_pc       ,
@shelf_stacking_pc         ,
@diligence_allowance_pc    ,
@post_allowance_pc         ,
@phone_allowance_pc        ,
@transportation_pc         ,
@skill_allowance_pc        ,
@other_allowance_pc        ,
@temporary_staff_sal       ,
@social_security           ,
@provident_fund            ,
@workmen_compensation      ,
@housing_allowance         ,
@sales_car_allowance       ,
@accommodation             ,
@car_maintenance           ,
@southrisk_allowance       ,
@meal_allowance            ,
@other                     ,
@others_subject_tax        ,
@car_allowance             ,
@license_allowance         ,
@outsource_wages           ,
@comp_cars_gas             ,
@comp_cars_other           ,
@car_rental                ,
@car_gasoline              ,
@car_repair                ,
@medical_outside           ,
@medical_inhouse           ,
@staff_activities          ,
@uniform                   ,
@life_insurance            ,
@pe_sb_mth                 ,
@pe_sb_year                ,
@pe_mth_le                 ,
@pe_year_le                ,
@pe_mth                    ,
@pe_year                   ,
@runrate_code              ,
@discount                  ,
@executive                 ,
@focus_hc                  ,
@focus_pe                  ,
@join_pvf                  ,
@rate_pvf				   ,
@pvf                       
;


    RETURN;
END;
