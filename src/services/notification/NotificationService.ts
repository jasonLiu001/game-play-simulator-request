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
        //方案1 连续5,4,3期中 发送邮件提醒
        let plan01_continueWin_5: any = await  this.continueWin(1, 5, CONST_INVEST_TABLE.tableName);
        let plan01_continueWin_4: any = await  this.continueWin(1, 4, CONST_INVEST_TABLE.tableName);
        let plan01_continueWin_3: any = await  this.continueWin(1, 3, CONST_INVEST_TABLE.tableName);

        //方案2 连续5,4,3期中 发送邮件提醒
        let plan02_continueWin_5: any = await  this.continueWin(2, 5, CONST_INVEST_TABLE.tableName);
        let plan02_continueWin_4: any = await  this.continueWin(2, 4, CONST_INVEST_TABLE.tableName);
        let plan02_continueWin_3: any = await  this.continueWin(2, 3, CONST_INVEST_TABLE.tableName);

        //方案3 连续5,4,3期中 发送邮件提醒
        let plan03_continueWin_5: any = await  this.continueWin(3, 5, CONST_INVEST_TABLE.tableName);
        let plan03_continueWin_4: any = await  this.continueWin(3, 4, CONST_INVEST_TABLE.tableName);
        let plan03_continueWin_3: any = await  this.continueWin(3, 3, CONST_INVEST_TABLE.tableName);

        //方案1 连续5,4,3期错误 发送邮件提醒
        let plan01_continueLose_5: any = await  this.continueLose(1, 5, CONST_INVEST_TABLE.tableName);
        let plan01_continueLose_4: any = await  this.continueLose(1, 4, CONST_INVEST_TABLE.tableName);
        let plan01_continueLose_3: any = await  this.continueLose(1, 3, CONST_INVEST_TABLE.tableName);

        //方案2 连续5,4,3期错误 发送邮件提醒
        let plan02_continueLose_5: any = await  this.continueLose(2, 5, CONST_INVEST_TABLE.tableName);
        let plan02_continueLose_4: any = await  this.continueLose(2, 4, CONST_INVEST_TABLE.tableName);
        let plan02_continueLose_3: any = await  this.continueLose(2, 3, CONST_INVEST_TABLE.tableName);

        //方案3 连续5,4,3期错误 发送邮件提醒
        let plan03_continueLose_5: any = await  this.continueLose(3, 5, CONST_INVEST_TABLE.tableName);
        let plan03_continueLose_4: any = await  this.continueLose(3, 4, CONST_INVEST_TABLE.tableName);
        let plan03_continueLose_3: any = await  this.continueLose(3, 3, CONST_INVEST_TABLE.tableName);
        //endregion

        //region Invest_total表当前选中的方案连错提醒
        //只提醒当前选中的方案
        let plan01_total_continueLose_10: any = await  this.continueWin(CONFIG_CONST.currentSelectedInvestPlanType, 10, CONST_INVEST_TOTAL_TABLE.tableName);
        let plan01_total_continueLose_9: any = await  this.continueWin(CONFIG_CONST.currentSelectedInvestPlanType, 9, CONST_INVEST_TOTAL_TABLE.tableName);
        let plan01_total_continueLose_8: any = await  this.continueWin(CONFIG_CONST.currentSelectedInvestPlanType, 8, CONST_INVEST_TOTAL_TABLE.tableName);
        let plan01_total_continueLose_7: any = await  this.continueWin(CONFIG_CONST.currentSelectedInvestPlanType, 7, CONST_INVEST_TOTAL_TABLE.tableName);
        let plan01_total_continueLose_6: any = await  this.continueWin(CONFIG_CONST.currentSelectedInvestPlanType, 6, CONST_INVEST_TOTAL_TABLE.tableName);
        let plan01_total_continueLose_5: any = await  this.continueWin(CONFIG_CONST.currentSelectedInvestPlanType, 5, CONST_INVEST_TOTAL_TABLE.tableName);
        let plan01_total_continueLose_4: any = await  this.continueWin(CONFIG_CONST.currentSelectedInvestPlanType, 4, CONST_INVEST_TOTAL_TABLE.tableName);
        let plan01_total_continueLose_3: any = await  this.continueWin(CONFIG_CONST.currentSelectedInvestPlanType, 3, CONST_INVEST_TOTAL_TABLE.tableName);
        let plan01_total_continueLose_2: any = await  this.continueWin(CONFIG_CONST.currentSelectedInvestPlanType, 2, CONST_INVEST_TOTAL_TABLE.tableName);
        let plan01_total_continueLose_1: any = await  this.continueWin(CONFIG_CONST.currentSelectedInvestPlanType, 1, CONST_INVEST_TOTAL_TABLE.tableName);
        //endregion

        return BlueBirdPromise.resolve(true);
    }

    /**
     *
     * 连续中奖特定期数提醒
     * @param {number} planType
     * @param {number} winCount
     * @param {string} tableName
     */
    private async continueWin(planType: number, winCount: number, tableName: string): BlueBirdPromise<any> {
        //方案  最新的投注记录
        let historyData: Array<InvestInfo> = [];
        if (tableName == CONST_INVEST_TABLE.tableName) {
            historyData = await LotteryDbService.getInvestInfoHistory(planType, winCount);
        } else if (tableName == CONST_INVEST_TOTAL_TABLE.tableName) {
            historyData = await LotteryDbService.getInvestTotalInfoHistory(planType, winCount);
        }
        let continueWinCount: number = 0;
        for (let investItem of historyData) {
            if (investItem.status == 1 && investItem.isWin == 1) {
                continueWinCount++;
            }
        }
        let emailTitle = "连中【" + continueWinCount + "】期提醒";
        let emailContent = "【" + tableName + "】表 方案【" + planType + "】 连中【" + continueWinCount + "】期提醒";
        if (continueWinCount == winCount) {//连中
            return EmailSender.sendEmail(emailTitle, emailContent);
        }
        return BlueBirdPromise.resolve(true);
    }

    /**
     * 连续错误提醒
     * @param {number} planType
     * @param {number} loseCount
     * @param {string} tableName
     */
    private async continueLose(planType: number, loseCount: number, tableName: string): BlueBirdPromise<any> {
        //方案  最新的投注记录
        let historyData: Array<InvestInfo> = [];
        if (tableName == CONST_INVEST_TABLE.tableName) {
            historyData = await LotteryDbService.getInvestInfoHistory(planType, loseCount);
        } else if (tableName == CONST_INVEST_TOTAL_TABLE.tableName) {
            historyData = await LotteryDbService.getInvestTotalInfoHistory(planType, loseCount);
        }

        let continueLoseCount: number = 0;
        for (let investItem of historyData) {
            if (investItem.status == 1 && investItem.isWin == 0) {
                continueLoseCount++;
            }
        }
        let emailTitle = "连错【" + continueLoseCount + "】期提醒";
        let emailContent = "【" + tableName + "】表 方案【" + planType + "】 连错【" + continueLoseCount + "】期提醒";
        if (continueLoseCount == loseCount) {//连中
            return EmailSender.sendEmail(emailTitle, emailContent);
        }
        return BlueBirdPromise.resolve(true);
    }
}
