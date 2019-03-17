/**
 *
 * 查询实体基类
 */
export class QueryBase {
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
}