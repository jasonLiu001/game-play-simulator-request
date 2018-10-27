import BlueBirdPromise = require('bluebird');

/**
 *
 * 通知接口
 */
export interface INotificationService {
    /**
     *
     * 前一天的账号余额 低于特定值时发送通知
     */
    whenYesterdayAccountBalanceLowerThan(): BlueBirdPromise<any>;

    /**
     *
     * 连中或者连错一定期数时 发送邮件提醒
     * 连中：5,4,3
     * 连错：5,4,3
     */
    sendContinueWinOrLoseWarnEmail(maxWinOrLoseCount: number, isWin: boolean): BlueBirdPromise<any>;

    /**
     *
     * 当前10:00:00后前几期错误 邮件提醒
     */
    sendTodayFirstErrorWarnEmail(firstErrorCount:number): BlueBirdPromise<any>;
}