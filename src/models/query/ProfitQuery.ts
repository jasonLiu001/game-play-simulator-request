import {QueryBase} from "./QueryBase";
import {Request} from "express";

/**
 *
 * 查询利润
 */
export class ProfitQuery extends QueryBase {

    /**
     *
     * 构建查询参数实体
     */
    buildQueryEntity<ProfitQuery extends QueryBase>(req: Request, args: ProfitQuery): ProfitQuery {
        let profitQuery: ProfitQuery = super.buildQueryEntity<ProfitQuery>(req, args);
        return profitQuery;
    }
}