/**
 *
 * 盈利最大利润表
 */
export class MaxProfitInfo {
    /**
     * 期号
     */
    period: string;

    /**
     *
     * 方案类型
     */
    planType: number;

    /**
     * 初始账号余额
     */
    originAccoutBalance: number;

    /**
     *
     * 盈利的目标金额
     */
    maxAccountBalance: number;

    /**
     *
     * 利润百分比  0.2代表20%
     */
    profitPercent: number;

    /**
     *
     * 达到目标利润时，共投注次数
     */
    investTotalCount: number;

    /**
     *
     * 记录创建时间
     */
    createTime: string;
}