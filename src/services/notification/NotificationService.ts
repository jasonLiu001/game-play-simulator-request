import BlueBirdPromise = require('bluebird');
import {INotificationService} from "./INotificationService";
import {LotteryDbService} from "../dbservices/ORMService";

import moment  = require('moment');
import {CONFIG_CONST} from "../../config/Config";
import {EmailSender} from "../email/EmailSender";


let log4js = require('log4js'),
    log = log4js.getLogger('NotificationService');

/**
 *
 * 消息通知服务
 */
export class NotificationService implements INotificationService {

    /**
     *
     * 前一天的账号余额 低于特定值时发送通知
     */
    public async WhenYesterdayAccountBalanceLowerThan(): BlueBirdPromise<any> {
        let yesterday: string = moment().subtract(1, 'days').format('YYYY-MM-DD');
        let yesterdayArray: Array<string> = [yesterday];
        //昨天的最大最小值
        let yesterdayAccountBalance: any = await LotteryDbService.getMaxAndMinProfitFromInvest(yesterdayArray, CONFIG_CONST.currentSelectedInvestPlanType);
        let emailTitle = '昨天 ' + yesterday + ' 账户余额亏损状态提醒';//通知邮件标题
        let emailContent = '昨天 '+yesterday + ' 状态为亏损，账号最大余额：' + yesterdayAccountBalance.maxAccountBalance + ', 最小余额：' + yesterdayAccountBalance.minAccountBalance;//通知邮件内容
        if (yesterdayAccountBalance.maxAccountBalance < CONFIG_CONST.originAccountBalance) {//最大利润小于初始账号 亏损
            return EmailSender.sendEmail(emailTitle, emailContent);
        } else if (yesterdayAccountBalance.minAccountBalance < CONFIG_CONST.originAccountBalance / 5) {//最小账户余额小于初始账号的1/5 亏损
            return EmailSender.sendEmail(emailTitle, emailContent);
        }
        return BlueBirdPromise.resolve(true);
    }
}