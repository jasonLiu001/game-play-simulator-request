import BlueBirdPromise = require('bluebird');
import {INotificationService} from "./INotificationService";
import {LotteryDbService} from "../dbservices/ORMService";

import moment  = require('moment');
import {Config, CONFIG_CONST} from "../../config/Config";
import {EmailSender} from "../email/EmailSender";
import {TimeService} from "../time/TimeService";
import {InvestInfo} from "../../models/db/InvestInfo";
import {CONST_INVEST_TABLE} from "../../models/db/CONST_INVEST_TABLE";
import {CONST_INVEST_TOTAL_TABLE} from "../../models/db/CONST_INVEST_TOTAL_TABLE";


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
        let emailTitle = '方案【' + CONFIG_CONST.currentSelectedInvestPlanType + '】 昨天 ' + yesterday + ' 账户余额亏损状态提醒';//通知邮件标题
        let emailContent = '方案 【' + CONFIG_CONST.currentSelectedInvestPlanType + '】 昨天 ' + yesterday + ' 截止22:00:00， 状态为亏损，账号最大余额：' + yesterdayAccountBalance.maxAccountBalance + ', 最小余额：' + yesterdayAccountBalance.minAccountBalance;//通知邮件内容
        if (yesterdayAccountBalance.maxAccountBalance < CONFIG_CONST.originAccountBalance) {//最大利润小于初始账号 亏损
            return EmailSender.sendEmail(emailTitle, emailContent);
        } else if (yesterdayAccountBalance.minAccountBalance < CONFIG_CONST.originAccountBalance / 5) {//最小账户余额小于初始账号的1/5 亏损
            return EmailSender.sendEmail(emailTitle, emailContent);
        }
        return BlueBirdPromise.resolve(true);
    }

    /**
     *
     * 连中或者连错一定期数时 发送邮件提醒
     * 连中：5,4,3
     * 连错：5,4,3
     */
    public async sendContinueWinOrLoseWarnEmail(): BlueBirdPromise<any> {
        //region Invest表连中或者连错提醒
        //方案1 连续5,4,3期错误 发送邮件提醒
        let plan01_continueLose_5: any = await  this.continueWinOrLose(CONFIG_CONST.currentSelectedInvestPlanType, 3, CONST_INVEST_TABLE.tableName, false);
        //endregion

        //region Invest_total表当前选中的方案连错提醒
        //只提醒当前选中的方案
        //let plan01_total_continueLose_10: any = await  this.continueWinOrLose(CONFIG_CONST.currentSelectedInvestPlanType, 3, CONST_INVEST_TOTAL_TABLE.tableName, false);
        //endregion

        return BlueBirdPromise.resolve(true);
    }

    /**
     *
     * 连续中奖特定期数提醒
     * @param {number} planType
     * @param maxWinOrLoseCount
     * @param {string} tableName
     * @param isWin
     */
    private async continueWinOrLose(planType: number, maxWinOrLoseCount: number, tableName: string, isWin: boolean): BlueBirdPromise<any> {
        //方案  最新的投注记录
        let historyData: Array<InvestInfo> = [];
        if (tableName == CONST_INVEST_TABLE.tableName) {
            historyData = await LotteryDbService.getInvestInfoHistory(planType, maxWinOrLoseCount);
        } else if (tableName == CONST_INVEST_TOTAL_TABLE.tableName) {
            historyData = await LotteryDbService.getInvestTotalInfoHistory(planType, maxWinOrLoseCount);
        }

        //连中或联错
        let continueMaxWinOrLoseTimes: number = 0;
        for (let investItem of historyData) {
            if (isWin) {//连中
                if (investItem.status == 1 && investItem.isWin == 1) {
                    continueMaxWinOrLoseTimes++;
                }
            } else {//连错
                if (investItem.status == 1 && investItem.isWin == 0) {
                    continueMaxWinOrLoseTimes++;
                }
            }
        }

        if (continueMaxWinOrLoseTimes == maxWinOrLoseCount) {
            let continueWinFourTimesEmail: any = await this.sendWinOrLoseEmail(planType, continueMaxWinOrLoseTimes, tableName, true);
        }

        return BlueBirdPromise.resolve(true);
    }

    /**
     *
     * 连中或者连错数量
     * @param planType
     * @param {number} count
     * @param tableName
     * @param isWin
     * @returns {Bluebird<any>}
     */
    private async sendWinOrLoseEmail(planType: number, count: number, tableName: string, isWin: boolean): BlueBirdPromise<any> {
        let emailTitle = "连" + isWin ? "中" : "错" + "【" + count + "】期提醒";
        let emailContent = "【" + tableName + "】表 方案【" + planType + "】 连" + isWin ? "中" : "错" + "【" + count + "】期提醒";
        return EmailSender.sendEmail(emailTitle, emailContent);
    }
}
