import {QueryBase} from "./QueryBase";
import {Request} from "express";

/**
 *
 * 查询invest表实体参数
 */
export class InvestQuery extends QueryBase {

    /**
     *
     * 构建GET方法查询参数实体
     */
    buildQueryEntity<InvestQuery extends QueryBase>(req: Request, args: InvestQuery): InvestQuery {
        let profitQuery: InvestQuery = super.buildQueryEntity<InvestQuery>(req, args);

        //todo: 如果有自定义参数 在这里给自定义参数赋值

        return profitQuery;
    }
}