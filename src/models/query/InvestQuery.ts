import {QueryBase} from "./QueryBase";
import {EnumDbTableName} from "../EnumModel";

/**
 *
 * 查询invest表实体参数
 */
export class InvestQuery extends QueryBase {
    /**
     *
     * 表名称 {@link EnumDbTableName}
     */
    tableName: string;
}