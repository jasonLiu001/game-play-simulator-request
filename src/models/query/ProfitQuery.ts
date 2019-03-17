import {QueryBase} from "./QueryBase";
import {Request} from "express";

/**
 *
 * 查询利润
 */
export class ProfitQuery extends QueryBase {

    /**
     *
     * 构建GET方法查询参数实体
     */
    buildQueryEntity<ProfitQuery extends QueryBase>(req: Request, args: ProfitQuery): ProfitQuery {
        let profitQuery: ProfitQuery = super.buildQueryEntity<ProfitQuery>(req, args);

        //todo: 如果有自定义参数 在这里给自定义参数赋值

        return profitQuery;
    }
}