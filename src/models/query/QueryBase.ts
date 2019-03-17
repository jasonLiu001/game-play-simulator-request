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
     * 构建GET方法查询参数实体
     */
    protected buildQueryEntity<T extends QueryBase>(req: Request, args: T): T {
        args.tableName = req.query.tableName;
        args.pageIndex = Number(req.query.pageIndex);
        args.pageSize = Number(req.query.pageSize);
        args.planType = Number(req.query.planType);
        args.startTime = req.query.startTime;
        args.endTime = req.query.endTime;
        return args;
    }

    /**
     *
     *
     * 构建POST方法查询参数实体
     */
    protected buildBodyEntity<T extends QueryBase>(req: Request, args: T): T {
        args.tableName = req.body.tableName;
        args.pageIndex = Number(req.body.pageIndex);
        args.pageSize = Number(req.body.pageSize);
        args.planType = Number(req.body.planType);
        args.startTime = req.body.startTime;
        args.endTime = req.body.endTime;
        return args;
    }
}