/**
 *
 *
 * 抓取的最新开奖数据
 */
export class AwardInfo {
    /**
     *
     * 期号
     */
    period: string;

    /**
     *
     * 开奖号码
     */
    openNumber: string;

    /**
     *
     *
     * 开奖时间
     */
    openTime: string;

    /**
     *
     * 记录创建时间
     */
    createdTime: string;

    /**
     *
     * 更新状态 1：自动更新 2：手工更新
     */
    updateStatus: number;
}
