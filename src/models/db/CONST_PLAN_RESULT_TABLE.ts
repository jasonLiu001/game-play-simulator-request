import {EnumPlanTableBase} from "./EnumPlanTableBase";
export class EnumPlanResultTable {

    /**
     *
     *
     * 数据表名称
     * @type {string}
     */
    tableName = "plan_result"
}

/**
 *
 *
 * 计划杀号结果表
 */
export const CONST_PLAN_RESULT_TABLE = EnumPlanResultTable as typeof EnumPlanResultTable & EnumPlanTableBase;