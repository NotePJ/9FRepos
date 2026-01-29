USE [HRBUDGET]
GO
/****** Object:  StoredProcedure [dbo].[SP_REP_HC_PE_BY_GROUPING]    Script Date: 11/24/2025 2:59:12 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER     PROCEDURE [dbo].[SP_REP_HC_PE_BY_GROUPING]
    @YearBudget     INT,                  -- ปีงบ (ยังไม่ใช้ในลอจิก แต่เก็บเผื่อใช้ต่อ)
    @YearFrom       INT,                  -- ปีเริ่ม
    @YearTo         INT,                  -- ปีสิ้นสุด
    @CompanyId      INT           = NULL, -- เช่น 2
    @CostCenterLike NVARCHAR(100) = NULL  -- พารามิเตอร์นี้ "ไม่ใช้" ในการดึงข้อมูล (ตามสเปกให้ส่ง NULL ไปยังสตอร์ปลายทาง)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1) เตรียมสคีมาตามปีจริง (FT_y, CT_y, PE_y) แบบ dynamic
DECLARE @colsDef NVARCHAR(MAX);

;WITH Y AS (
  SELECT DISTINCT CAST([YEAR] AS INT) AS y
  FROM HRBUDGET.dbo.HRB_ACTUAL_EMP_HC_PE
  WHERE [YEAR] BETWEEN @YearFrom AND @YearTo
    AND (@CompanyId IS NULL OR COMPANY_ID = @CompanyId)
)
SELECT @colsDef =
  STRING_AGG(
    CONCAT('[ACTUAL_FT_', y, '] decimal(18,2), [ACTUAL_CT_', y, '] decimal(18,2), [ACTUAL_PE_', y, '] decimal(18,2), [ACTUAL_PE_ABS_', y, '] decimal(18,2)')
  , ', '
  ) WITHIN GROUP (ORDER BY y)
FROM Y;

IF @colsDef IS NULL SET @colsDef = N'';   -- กันเคสไม่มีปีในช่วง

-- 2) สร้าง global temp table + เติมข้อมูลจากสตอร์ (ชื่อคงที่ ใช้ join ต่อได้)
IF OBJECT_ID('tempdb..#data_actual_grouping') IS NOT NULL DROP TABLE #data_actual_grouping;

DECLARE @sql NVARCHAR(MAX) = N'
CREATE TABLE #data_actual_grouping (
  GROUPING NVARCHAR(100), COST_CENTER_CODE NVARCHAR(100)' + CASE WHEN @colsDef = N'' THEN N'' ELSE N', ' + @colsDef END + N'
);

INSERT INTO #data_actual_grouping
EXEC dbo.SP_HC_PE_PivotByGrouping_ByYear
     @YearFrom = @pYearFrom,
     @YearTo   = @pYearTo,
     @CompanyId = @pCompanyId,
     @CostCenterLike = NULL;';

EXEC sys.sp_executesql
  @sql,
  N'@pYearFrom INT, @pYearTo INT, @pCompanyId INT',
  @pYearFrom = @YearFrom, @pYearTo = @YearTo, @pCompanyId = @CompanyId;

DECLARE @col_Diff_B0 NVARCHAR(30) = CONCAT('B0 ', @YearBudget, ' VS B0 ', @YearBudget - 1);
DECLARE @col_Diff_LE NVARCHAR(30) = CONCAT('B0 ', @YearBudget, ' VS LE ', @YearBudget - 1);
/*
DECLARE @col_HC_FT_BUDGET NVARCHAR(30) = 'HC_FT_BUDGET_' + CAST(@YearBudget - 1 AS NVARCHAR(4));
DECLARE @col_HC_CT_BUDGET NVARCHAR(30) = 'HC_CT_BUDGET_' + CAST(@YearBudget - 1 AS NVARCHAR(4));
DECLARE @col_PE_BUDGET NVARCHAR(30) = 'PE_BUDGET_' + CAST(@YearBudget - 1 AS NVARCHAR(4));
--DECLARE @colPE NVARCHAR(30) = 'CURRENT_PE_' + CAST(@YearBudget - 1 AS NVARCHAR(4));
--DECLARE @colPE_ABS NVARCHAR(30) = 'CURRENT_PE_ABS_' + CAST(@YearBudget - 1 AS NVARCHAR(4));
--DECLARE @colPEBO NVARCHAR(30) = 'CURRENT_PE_BONUS' + CAST(@YearBudget - 1 AS NVARCHAR(4));
DECLARE @col_HC_ACTIVE_FT_LE NVARCHAR(30) = 'HC_ACTIVE_FT_LE_' + CAST(@YearBudget - 1 AS NVARCHAR(4));
DECLARE @col_HC_ACTIVE_CT_LE NVARCHAR(30) = 'HC_ACTIVE_CT_LE_' + CAST(@YearBudget - 1 AS NVARCHAR(4));
DECLARE @col_ACTIVE_PE_LE NVARCHAR(30) = 'ACTIVE_PE_LE_' + CAST(@YearBudget - 1 AS NVARCHAR(4));
DECLARE @col_LE_PE_LE NVARCHAR(30) = 'LE_PE_LE_' + CAST(@YearBudget - 1 AS NVARCHAR(4));
DECLARE @col_HC_VAC_FT_LE NVARCHAR(30) = 'HC_VAC_FT_LE_' + CAST(@YearBudget - 1 AS NVARCHAR(4));
DECLARE @col_HC_VAC_CT_LE NVARCHAR(30) = 'HC_VAC_CT_LE_' + CAST(@YearBudget - 1 AS NVARCHAR(4));
DECLARE @col_VAC_PE_LE NVARCHAR(30) = 'VAC_PE_LE_' + CAST(@YearBudget - 1 AS NVARCHAR(4));
DECLARE @col_HC_NEW_FT_LE NVARCHAR(30) = 'HC_NEW_FT_LE_' + CAST(@YearBudget - 1 AS NVARCHAR(4));
DECLARE @col_HC_NEW_CT_LE NVARCHAR(30) = 'HC_NEW_FT_LE_' + CAST(@YearBudget - 1 AS NVARCHAR(4));
DECLARE @col_NEW_PE_LE NVARCHAR(30) = 'NEW_PE_LE_' + CAST(@YearBudget - 1 AS NVARCHAR(4));
DECLARE @col_SUM_FT_LE NVARCHAR(30) = 'TOT_HC_FT_LE_' + CAST(@YearBudget - 1 AS NVARCHAR(4));
DECLARE @col_SUM_CT_LE NVARCHAR(30) = 'TOT_HC_CT_LE_' + CAST(@YearBudget - 1 AS NVARCHAR(4));
DECLARE @col_SUM_PE_LE NVARCHAR(30) = 'TOT_PE_LE_' + CAST(@YearBudget - 1 AS NVARCHAR(4));
*/

DECLARE @qry NVARCHAR(MAX);
-- 3) ใช้งาน: JOIN กับวิว/ตารางอื่นได้เลย

SET @qry = N'
select GROUP_TYPE, GROUP_TOTAL, GROUPING_HEAD, GROUPING , COST_CENTER
        , MAX(BUDGET_CURR_YEAR) AS BUDGET_CURR_YEAR
        , COALESCE(SUM(BUDGET_CURR_HC_FT),0) AS BUDGET_CURR_HC_FT
        , COALESCE(SUM(BUDGET_CURR_HC_CT),0) AS BUDGET_CURR_HC_CT
        , COALESCE(SUM(CURRENT_PE),0) AS BUDGET_CURR_PE
        , COALESCE(SUM(BUDGET_CURR_HC_MOVE_IN),0) AS BUDGET_CURR_HC_MOVE_IN
        , COALESCE(SUM(BUDGET_CURR_HC_MOVE_OUT),0) AS BUDGET_CURR_HC_MOVE_OUT
        , COALESCE(SUM(BUDGET_CURR_HC_ADD),0) AS BUDGET_CURR_HC_ADD
        , COALESCE(SUM(BUDGET_CURR_HC_CUT),0) AS BUDGET_CURR_HC_CUT
        , COALESCE(SUM(BUDGET_CURR_HC_MOVEMENT),0) AS BUDGET_CURR_HC_MOVEMENT
        , COALESCE(SUM(CURRENT_PE),0) AS BUDGET_CURR_PE_ADJUST   
        , MAX(LE_CURR_YEAR) AS LE_CURR_YEAR  
        , COALESCE(SUM(ACTIVE_FT_LE),0) AS ACTUAL_ACTIVE_HC_FT_LE 
        , COALESCE(SUM(ACTIVE_CT_LE),0) AS ACTUAL_ACTIVE_HC_CT_LE        
        , COALESCE(SUM(CURRENT_PEBO),0) AS ACTUAL_ACTIVE_PE_LE  
        , COALESCE(SUM(ACTIVE_FT_LE),0) AS LE_ACTIVE_HC_FT_LE 
        , COALESCE(SUM(ACTIVE_CT_LE),0) AS LE_ACTIVE_HC_CT_LE   
        , COALESCE(SUM(ACTIVE_PE_LE),0) AS LE_ACTIVE_PE_LE 
        , COALESCE(SUM(VAC_FT_LE),0) AS VAC_HC_FT_LE 
        , COALESCE(SUM(VAC_CT_LE),0) AS VAC_HC_CT_LE   
        , COALESCE(SUM(VAC_PE_LE),0) AS VAC_PE_LE   
        , COALESCE(SUM(NEW_FT_LE),0) AS NEW_HC_FT_LE 
        , COALESCE(SUM(NEW_CT_LE),0) AS NEW_HC_CT_LE   
        , COALESCE(SUM(NEW_PE_LE),0) AS NEW_PE_LE   
        , COALESCE(SUM(OT_LE),0) AS OT_LE  
        , COALESCE(SUM(EB_LE),0) AS EB_LE  
        , COALESCE(SUM(SUM_FT_LE),0) AS TOT_HC_FT_LE  
        , COALESCE(SUM(SUM_CT_LE),0) AS TOT_HC_CT_LE 
        , COALESCE(SUM(SUM_PE_OTEB_LE),0) AS TOT_PE_OTEB_LE  
        , COALESCE(SUM(SUM_PE_OTOTH_LE),0) AS TOT_PE_OTOTH_LE  
        , MAX(BUDGET_NEXT_YEAR) AS BUDGET_NEXT_YEAR  
        , COALESCE(SUM(BUDGET_NEXT_HC_MOVE_IN),0) AS BUDGET_NEXT_HC_MOVE_IN
        , COALESCE(SUM(BUDGET_NEXT_HC_MOVE_OUT),0) AS BUDGET_NEXT_HC_MOVE_OUT
        , COALESCE(SUM(BUDGET_NEXT_HC_CUT),0) AS BUDGET_NEXT_HC_CUT
        , COALESCE(SUM(ACTIVE_FT),0) AS ACTIVE_HC_FT 
        , COALESCE(SUM(ACTIVE_CT),0) AS ACTIVE_HC_CT   
        , COALESCE(SUM(ACTIVE_PE),0) AS ACTIVE_PE 
        , COALESCE(SUM(VAC_FT),0) AS VAC_HC_FT 
        , COALESCE(SUM(VAC_CT),0) AS VAC_HC_CT   
        , COALESCE(SUM(VAC_PE),0) AS VAC_PE 
        , COALESCE(SUM(CURR_YEAR_NEW_FT_LE),0) AS CURR_YEAR_NEW_HC_FT_LE 
        , COALESCE(SUM(CURR_YEAR_NEW_CT_LE),0) AS CURR_YEAR_NEW_HC_CT_LE   
        , COALESCE(SUM(CURR_YEAR_NEW_PE_LE),0) AS CURR_YEAR_NEW_PE_LE 
        , COALESCE(SUM(NEW_FT),0) AS NEW_HC_FT 
        , COALESCE(SUM(NEW_CT),0) AS NEW_HC_CT   
        , COALESCE(SUM(NEW_PE),0) AS NEW_PE 
        , COALESCE(SUM(SUM_FT),0) AS TOT_HC_FT  
        , COALESCE(SUM(SUM_CT),0) AS TOT_HC_CT 
        , COALESCE(SUM(SUM_PE),0) AS TOT_PE 
        , MAX(DIFF_B0) AS DIFF_B0  
        , COALESCE(SUM(DIFF_HC_FT_B0),0) AS DIFF_HC_FT_B0 
        , COALESCE(SUM(DIFF_HC_CT_B0),0) AS DIFF_HC_CT_B0 
        , COALESCE(SUM(DIFF_PE_B0),0) AS DIFF_PE_B0 
        , MAX(DIFF_LE) AS DIFF_LE  
        , COALESCE(SUM(DIFF_HC_FT_LE),0) AS DIFF_HC_FT_LE 
        , COALESCE(SUM(DIFF_HC_CT_LE),0) AS DIFF_HC_CT_LE 
        , COALESCE(SUM(DIFF_PE_LE),0) AS DIFF_PE_LE 
        , SUM(DIFF_PERCENT_B0) AS DIFF_PERCENT_B0
        , SUM(DIFF_PERCENT_LE) AS DIFF_PERCENT_LE
        , MAX(REMARK) REMARK
from (
    select [cc].GROUP_TYPE
	  , [cc].GROUP_TOTAL
	  , [cc].GROUPING_HEAD
      , [cc].GROUPING 
      , [cc].COST_CENTER_CODE AS COST_CENTER
	  , ISNULL([curr_pe_fin].YEAR,0) AS BUDGET_CURR_YEAR
      , ISNULL([curr_pe_fin].COST_CENTER_CODE,0) AS BUDGET_CURR_CCT
      , ISNULL([curr_pe_fin].HC_FT,0) AS BUDGET_CURR_HC_FT
      , ISNULL([curr_pe_fin].HC_PT,0) AS BUDGET_CURR_HC_CT
      , ISNULL([curr_pe_fin].YEAR,0) AS CURRENT_YEAR
      , ISNULL([curr_pe_fin].COST_CENTER_CODE,0) AS CURRENT_CCT
      , ISNULL([curr_pe_fin].PE,0) AS CURRENT_PE
      , ISNULL([curr_pe_fin].PE_BONUS,0) AS CURRENT_PEBO
      , ISNULL([le].BUDGET_YEAR_LE,0) AS LE_CURR_YEAR
      , ISNULL([le].COST_CENTER,0) AS LE_CCT
      , ISNULL([le].ACTIVE_FT_LE,0) AS ACTIVE_FT_LE
      , ISNULL([le].ACTIVE_CT_LE,0) AS ACTIVE_CT_LE
      , ISNULL([le].ACTIVE_PE_LE,0) AS ACTIVE_PE_LE
      , ISNULL([le].VAC_FT_LE,0) AS VAC_FT_LE
      , ISNULL([le].VAC_CT_LE,0) AS VAC_CT_LE
      , ISNULL([le].VAC_PE_LE,0) AS VAC_PE_LE
      , ISNULL([le].NEW_FT_LE,0) AS NEW_FT_LE
      , ISNULL([le].NEW_CT_LE,0) AS NEW_CT_LE
      , ISNULL([le].NEW_PE_LE,0) AS NEW_PE_LE
      , ISNULL([le].SUM_FT_LE,0) AS SUM_FT_LE
      , ISNULL([le].SUM_CT_LE,0) AS SUM_CT_LE
      , ISNULL([le].SUM_PE_LE,0) AS SUM_PE_LE
      , (ISNULL([curr_pe_fin].OT,0) / 7 * 12 * 1000 * 1) AS OT_LE 
      , ISNULL([curr_pe_fin].EB,0) AS EB_LE
      , ([le].SUM_PE_LE + (ISNULL([curr_pe_fin].OT,0) / 7 * 12 * 1000 * 1) + ISNULL([curr_pe_fin].EB,0)) AS SUM_PE_OTEB_LE 
      , ([le].SUM_PE_LE + (ISNULL([curr_pe_fin].OT,0) / 7 * 12 * 1000 * 1) + ISNULL([curr_pe_fin].OTHERS,0)) AS SUM_PE_OTOTH_LE
      , ISNULL([plan].BUDGET_YEAR,0) AS BUDGET_NEXT_YEAR
      , ISNULL([plan].COST_CENTER,0) AS BUDGET_NEXT_CCT
      , ISNULL([plan].ACTIVE_FT,0) AS ACTIVE_FT
      , ISNULL([plan].ACTIVE_CT,0) AS ACTIVE_CT
      , ISNULL([plan].ACTIVE_PE,0) AS ACTIVE_PE
      , ISNULL([plan].VAC_FT,0) AS VAC_FT
      , ISNULL([plan].VAC_CT,0) AS VAC_CT
      , ISNULL([plan].VAC_PE,0) AS VAC_PE
      , ISNULL([plan].NEW_FT_LE,0) AS CURR_YEAR_NEW_FT_LE
      , ISNULL([plan].NEW_CT_LE,0) AS CURR_YEAR_NEW_CT_LE
      , ISNULL([plan].NEW_PE_LE,0) AS CURR_YEAR_NEW_PE_LE
      , ISNULL([plan].NEW_FT,0) AS NEW_FT
      , ISNULL([plan].NEW_CT,0) AS NEW_CT
      , ISNULL([plan].NEW_PE,0) AS NEW_PE
      , ISNULL([plan].SUM_FT,0) AS SUM_FT
      , ISNULL([plan].SUM_CT,0) AS SUM_CT
      , ISNULL([plan].SUM_PE,0) AS SUM_PE
      , (ISNULL([curr_pe_fin].OT,0) / 7 * 12 * 1000 * 1) AS OT
      , ISNULL([curr_pe_fin].EB,0) AS EB
      , ([plan].SUM_PE + (ISNULL([curr_pe_fin].OT,0) / 7 * 12 * 1000 * 1) + ISNULL([curr_pe_fin].EB,0)) AS SUM_PE_OTEB
      , ([plan].SUM_PE + (ISNULL([curr_pe_fin].OT,0) / 7 * 12 * 1000 * 1) + ISNULL([curr_pe_fin].OTHERS,0)) AS SUM_PE_OTOTH
      , 0 AS BUDGET_CURR_HC_MOVE_IN
      , 0 AS BUDGET_CURR_HC_MOVE_OUT
      , 0 AS BUDGET_CURR_HC_ADD
      , 0 AS BUDGET_CURR_HC_CUT
      , 0 AS BUDGET_CURR_HC_MOVEMENT
      , 0 AS BUDGET_NEXT_HC_MOVE_IN
      , 0 AS BUDGET_NEXT_HC_MOVE_OUT
      , 0 AS BUDGET_NEXT_HC_CUT
      , @pColDiffB0 AS DIFF_B0
	  , ([plan].SUM_FT - [curr_pe_fin].HC_FT) AS DIFF_HC_FT_B0
      , ([plan].SUM_CT - [curr_pe_fin].HC_PT) AS DIFF_HC_CT_B0
      , ((ABS([plan].SUM_PE) - ABS([curr_pe_fin].PE)) * -1) AS DIFF_PE_B0
      , @pColDiffLE AS DIFF_LE
      , ([plan].SUM_FT - [le].SUM_FT_LE) AS DIFF_HC_FT_LE
      , ([plan].SUM_CT - [le].SUM_CT_LE) AS DIFF_HC_CT_LE
	  , ((ABS([plan].SUM_PE) - ABS([le].SUM_PE_LE)) * -1) AS DIFF_PE_LE   
      , ISNULL(((ABS([plan].SUM_PE) - ABS([curr_pe_fin].PE)) / NULLIF(ABS([curr_pe_fin].PE), 0)) - 1.00, 0) AS DIFF_PERCENT_B0
      , ISNULL(((ABS([plan].SUM_PE) - ABS([le].SUM_PE_LE)) / NULLIF(ABS([le].SUM_PE_LE), 0)) - 1.00, 0) AS DIFF_PERCENT_LE
      , dbo.fn_GetMergedRemark(@pYear, [cc].COST_CENTER_CODE) REMARK
    FROM dbo.[HRB_MST_COST_CENTER] AS [cc]
    LEFT JOIN dbo.V_REP_EMP_HC_BY_COSTCENTER_LE AS [le]
           ON [le].COST_CENTER = [cc].COST_CENTER_CODE
          AND [le].BUDGET_YEAR = @pYear
    LEFT JOIN dbo.V_REP_EMP_HC_BY_COSTCENTER_PLAN AS [plan]
           ON [plan].COST_CENTER = [cc].COST_CENTER_CODE
          AND [plan].BUDGET_YEAR = @pYear
    LEFT JOIN dbo.HRB_CURRENT_PE_FINANCE AS [curr_pe_fin]
           ON [curr_pe_fin].COST_CENTER_CODE = [cc].COST_CENTER_CODE
          AND [curr_pe_fin].YEAR             = (@pYear - 1)
          AND [curr_pe_fin].COMPANY_ID       = @pCompany
		  WHERE cc.[COMPANY_ID] = @pCompany    
) d
group by GROUP_TYPE, GROUP_TOTAL, GROUPING_HEAD, GROUPING, COST_CENTER
;';


-- รันด้วยพารามิเตอร์ (ปลอดภัยกว่า concat ค่าตัวเลขลงสตริง)
EXEC sp_executesql
    @qry,
    N'@pYear INT, @pCompany INT,@pColDiffB0 NVARCHAR(30),@pColDiffLE NVARCHAR(30)',
    @pYear    = @YearBudget,
    @pCompany = @CompanyId,
    @pColDiffB0 = @col_Diff_B0,
    @pColDiffLE = @col_Diff_LE
    ;

 --DROP TABLE #data_actual;

 

END
