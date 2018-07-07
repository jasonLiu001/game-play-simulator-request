/**
 *
 *
 * 投注信息
 */
export class InvestInfoBase {
    /**
     *
     *
     * 期号
     */
    period: string;

    /**
     *
     * 方案类型
     */
    planType: number;

    /**
     *
     *
     * 投注号码
     */
    investNumbers: string;

    /**
     *
     *
     * 当前账号余额
     */
    currentAccountBalance: number;

    /**
     *
     *
     * 投注号码数量
     */
    investNumberCount: number;

    /**
     *
     *
     * 投注模式 元，角，分
     */
    awardMode: number;

    /**
     *
     *
     * 盈利金额
     */
    winMoney: number;

    /**
     *
     *
     * 开奖状态  0：未开奖  1：已开奖
     */
    status: number;

    /**
     *
     *
     * 当期是否中奖
     */
    isWin: number;

    /**
     *
     *
     * 投注时间
     */
    investTime: string;

    /**
     * 投注日期
     *
     */
    investDate: string;

    /**
     *
     * 投注时间
     */
    investTimestamp: string;
}