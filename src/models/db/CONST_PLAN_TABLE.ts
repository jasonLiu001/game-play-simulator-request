import {EnumPlanTableBase} from "./EnumPlanTableBase";

export enum EnumPlanTable{

    /**
     *
     *
     * 数据表名称
     * @type {string}
     */
    tableName = "plan"
}

/**
 *
 *
 * 计划投注号码表
 */
export const CONST_PLAN_TABLE = EnumPlanTable as typeof EnumPlanTable & EnumPlanTableBase;