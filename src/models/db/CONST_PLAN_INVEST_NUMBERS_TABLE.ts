import {EnumPlanTableBase} from "./EnumPlanTableBase";
export enum EnumPlanInvestNumbersTable{
    /**
     *
     *
     * 数据表名称
     * @type {string}
     */
    tableName = "plan_invest_numbers"
}

/**
 *
 *
 * 计划投注号码表
 */
export const CONST_PLAN_INVEST_NUMBERS_TABLE = EnumPlanInvestNumbersTable as typeof EnumPlanInvestNumbersTable & EnumPlanTableBase;
