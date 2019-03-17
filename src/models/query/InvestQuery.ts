import {QueryBase} from "./QueryBase";
import {Request} from "express";

/**
 *
 * 查询invest表实体参数
 */
export class InvestQuery extends QueryBase {

    /**
     *
     * 构建查询参数实体
     */
    buildQueryEntity<InvestQuery extends QueryBase>(req: Request, args: InvestQuery): InvestQuery {
        let profitQuery: InvestQuery = super.buildQueryEntity<InvestQuery>(req, args);
        return profitQuery;
    }
}