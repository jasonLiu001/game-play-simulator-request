import {Request} from "express";

/**
 *
 * 查询实体基类
 */
export abstract class QueryBase {
    /**
     *
     * 每页数据量
     */
    pageSize: number;
    /**
     *
     * 页索引
     */
    pageIndex: number;

    /**
     *
     * 当前计划类型
     */
    planType: number;

    /**
     *
     * 开始时间
     */
    startTime: string;

    /**
     *
     * 结束时间
     */
    endTime: string;
    /**
     *
     * 表名称 {@link EnumDbTableName}
     */
    tableName: string;

    /**
     *
     * 构建查询参数实体
     */
    protected buildQueryEntity<T extends QueryBase>(req: Request, args: T): T {
        args.tableName = req.query.tableName;
        args.pageIndex = req.query.pageIndex;
        args.pageSize = req.query.pageSize;
        args.planType = req.query.planType;
        args.startTime = req.query.startTime;
        args.endTime = req.query.endTime;
        return args;
    }
}