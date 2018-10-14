import BlueBirdPromise = require('bluebird');

/**
 *
 * 通知接口
 */
export interface INotificationService {
    /**
     *
     * 前一天的账号余额 低于特定值时发送通知
     * @returns {Bluebird<any>}
     * @constructor
     */
    WhenYesterdayAccountBalanceLowerThan(): BlueBirdPromise<any>;
}