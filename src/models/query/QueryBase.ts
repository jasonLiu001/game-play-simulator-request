import {Request} from "express";

/**
 *
 * 查询实体基类
 */
export abstract class QueryBase {
    /**
     *
     * 表名称 {@link EnumDbTableName}
     */
    tableName: string;

    /**
     *
     * 期号
     */
    period: string;

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
     * 开始时间 时、分、秒部分 如：09:30
     */
    startTime: string;

    /**
     *
     * 开始日期 日期部分 如：2019-01-12
     */
    startDate: string;

    /**
     *
     * 开始日期+时间 日期+时分秒 如：2019-01-12 09:30
     */
    startDateTime: string;


    /**
     *
     * 结束时间 时、分、秒部分 如：22:30
     */
    endTime: string;

    /**
     *
     * 结束日期 日期部分 如：2019-01-12
     */
    endDate: string;

    /**
     *
     * 结束日期+时间 日期+时分秒 如：2019-01-12 22:30
     */
    endDateTime: string;


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
        args.startDate = req.query.startDate;
        args.startDateTime = req.query.startDateTime;
        args.endTime = req.query.endTime;
        args.endDate = req.query.endDate;
        args.endDateTime = req.query.endDateTime;
        args.period = req.query.period;
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
