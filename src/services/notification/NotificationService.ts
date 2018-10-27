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
import {RuntimeConfig} from "../../config/RuntimeConfig";


let log4js = require('log4js'),
    log = log4js.getLogger('NotificationService');

/**
 *
 * 通知配置类
 */
class NotificationConfig {
    //数据库中 当天已经保存的最新的投注期号 用于不重复发送通知邮件
    public static lastedRealInvestPeriod: string = null;
    //数据库中 当天第一条记录的投注期号 用于不重复发送通知邮件
    public static todayFirstRealInvestPeriod: string = null;
    //数据库中 达到利润预警值的投注期号 用于不重复发送通知邮件
    public static todayMaxOrMinProfitInvestPeriod: string = null;
}

/**
 *
 * 消息通知服务
 */
export class NotificationService implements INotificationService {

    /**
     *
     * 间隔2分钟检查是否需要发送通知  入口方法
     */
    public start(): void {
        //5分钟检查一次是否需要发送通知
        setInterval(() => {

            // //当天第1期错误提醒
            // this.sendTodayFirstErrorWarnEmail()
            //     .catch((err) => {
            //         if (err) {
            //             log.error("当天第1期错误提醒邮件通知异常");
            //             log.error(err);
            //         }
            //     });
            //多个邮件同时发送需要设置间隔，否则上面的邮件无法正常发送
            setTimeout(() => {
                //连错2期提醒
                this.sendContinueWinOrLoseWarnEmail(2, false)
                    .catch((err) => {
                        if (err) {
                            log.error("连错2期提醒邮件通知异常");
                            log.error(err);
                        }
                    });
            }, 100);
            setTimeout(() => {
                //最大最小利润预警
                this.sendMaxOrMinProfitNotification()
                    .catch((err) => {
                        if (err) {
                            log.error("最大最小利润预警邮件通知异常");
                            log.error(err);
                        }
                    });
            }, 10000);

        }, 120000);
    }

    /**
     *
     * 达到指定利润发送预警邮件
     */
    public async sendMaxOrMinProfitNotification(): BlueBirdPromise<any> {
        //当天
        let today: string = moment().format("YYYY-MM-DD");
        let historyData: Array<InvestInfo> = await LotteryDbService.getInvestInfoHistory(CONFIG_CONST.currentSelectedInvestPlanType, 1, today + " 10:00:00");
        if (!historyData || historyData.length == 0) return BlueBirdPromise.resolve(false);

        let emailTitle: string = "方案【" + CONFIG_CONST.currentSelectedInvestPlanType + "】最高最低利润预警";
        //当前账号余额
        let currentAccountBalance: number = historyData[0].currentAccountBalance;

        //不重复发送邮件
        if (NotificationConfig.todayMaxOrMinProfitInvestPeriod != historyData[0].period) {
            NotificationConfig.todayMaxOrMinProfitInvestPeriod = historyData[0].period;
            if (currentAccountBalance <= RuntimeConfig.minProfitNotification) {
                return await EmailSender.sendEmail(emailTitle, "已达最低预警利润值：" + RuntimeConfig.minProfitNotification);
            } else if (currentAccountBalance >= RuntimeConfig.maxProfitNotification) {
                return await EmailSender.sendEmail(emailTitle, "已达最高预警利润值：" + RuntimeConfig.maxProfitNotification);
            }
        }

        return BlueBirdPromise.resolve(false);
    }

    /**
     *
     * 前一天的账号余额 低于特定值时发送通知
     */
    public async whenYesterdayAccountBalanceLowerThan(): BlueBirdPromise<any> {
        let yesterday: string = moment().subtract(1, 'days').format('YYYY-MM-DD');
        let yesterdayArray: Array<string> = [yesterday];
        //昨天的最大最小值
        let yesterdayAccountBalance: any = await LotteryDbService.getMaxAndMinProfitFromInvest(yesterdayArray, CONFIG_CONST.currentSelectedInvestPlanType);
        let emailTitle = '方案【' + CONFIG_CONST.currentSelectedInvestPlanType + '】 昨天 ' + yesterday + ' 账户余额亏损状态提醒';//通知邮件标题
        let emailContent = '方案 【' + CONFIG_CONST.currentSelectedInvestPlanType + '】 昨天 ' + yesterday + ' 截止22:00:00， 状态为亏损，账号最大余额：' + yesterdayAccountBalance.maxAccountBalance + ', 最小余额：' + yesterdayAccountBalance.minAccountBalance;//通知邮件内容
        if (yesterdayAccountBalance.maxAccountBalance < CONFIG_CONST.originAccountBalance) {//最大利润小于初始账号 亏损
            return await EmailSender.sendEmail(emailTitle, emailContent);
        } else if (yesterdayAccountBalance.minAccountBalance < parseFloat((CONFIG_CONST.originAccountBalance / 5).toFixed(2))) {//最小账户余额小于初始账号的1/5 亏损
            return await EmailSender.sendEmail(emailTitle, emailContent);
        }
        return BlueBirdPromise.resolve(true);
    }

    /**
     *
     * 连中或者连错一定期数时 发送邮件提醒
     * 连中：5,4,3
     * 连错：5,4,3
     */
    public async sendContinueWinOrLoseWarnEmail(maxWinOrLoseCount: number, isWin: boolean): BlueBirdPromise<any> {
        //方案 连续5,4,3期错误 发送邮件提醒
        return await  this.continueWinOrLose(CONFIG_CONST.currentSelectedInvestPlanType, maxWinOrLoseCount, CONST_INVEST_TABLE.tableName, isWin);
    }

    /**
     *
     * 当前10:00:00后第一期错误 是邮件提醒
     */
    public async sendTodayFirstErrorWarnEmail(): BlueBirdPromise<any> {
        //当天
        let today: string = moment().format("YYYY-MM-DD");
        let historyData: Array<InvestInfo> = await LotteryDbService.getInvestInfoHistory(CONFIG_CONST.currentSelectedInvestPlanType, 120, today + " 10:00:00");
        if (historyData.length == 0) return BlueBirdPromise.resolve(true);

        //当天第1条投注记录
        let todayFirstInvestItem: InvestInfo = historyData[historyData.length - 1];
        if (NotificationConfig.todayFirstRealInvestPeriod != todayFirstInvestItem.period && todayFirstInvestItem.status == 1 && todayFirstInvestItem.isWin == 0) {
            //发送邮件前保存 数据库最新的期号信息，以便下次发送邮件判断
            NotificationConfig.todayFirstRealInvestPeriod = todayFirstInvestItem.period;
            return await EmailSender.sendEmail("当天" + today + "第1条投注记录错误", today + " 首次投注错误");
        }

        return BlueBirdPromise.resolve(true);
    }

    /**
     *
     * 连续中奖特定期数提醒
     * @param {number} planType
     * @param maxWinOrLoseCount
     * @param {string} tableName
     * @param isWin
     * @param afterTime 特定时间之后
     */
    private async continueWinOrLose(planType: number, maxWinOrLoseCount: number, tableName: string, isWin: boolean, afterTime: string = '10:00:00'): BlueBirdPromise<any> {
        //当天
        let today: string = moment().format("YYYY-MM-DD");
        //方案  最新的投注记录
        let historyData: Array<InvestInfo> = [];
        if (tableName == CONST_INVEST_TABLE.tableName) {
            historyData = await LotteryDbService.getInvestInfoHistory(planType, maxWinOrLoseCount, today + " " + afterTime);
        } else if (tableName == CONST_INVEST_TOTAL_TABLE.tableName) {
            historyData = await LotteryDbService.getInvestTotalInfoHistory(planType, maxWinOrLoseCount, today + " " + afterTime);
        }

        //数量不足 不发送邮件通知
        if (historyData.length < maxWinOrLoseCount) return BlueBirdPromise.resolve(true);

        let currentTime = new Date();
        let year = currentTime.getFullYear();
        let month = currentTime.getMonth();//month取值 0-11
        let day = currentTime.getDate();
        //当天的21:59
        let thirdTime = new Date(year, month, day, 21, 59, 0);
        //当天22:00以后停止发送邮件通知
        if (currentTime > thirdTime) return BlueBirdPromise.resolve(true);

        //连中或连错
        let continueMaxWinOrLoseTimes: number = 0;
        for (let investItem of historyData) {
            if (investItem.status == 1) {
                if (isWin) {//判断连中
                    if (investItem.isWin == 1) {
                        continueMaxWinOrLoseTimes++;
                    }
                } else {//判断连错
                    if (investItem.isWin == 0) {
                        continueMaxWinOrLoseTimes++;
                    }
                }
            }

        }

        if (continueMaxWinOrLoseTimes == maxWinOrLoseCount) {
            if (NotificationConfig.lastedRealInvestPeriod != historyData[0].period) {
                //发送邮件前保存 数据库最新的期号信息，以便下次发送邮件判断
                NotificationConfig.lastedRealInvestPeriod = historyData[0].period;
                return await this.sendWinOrLoseEmail(planType, continueMaxWinOrLoseTimes, tableName, isWin);
            }

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
        let emailTitle = "连" + (isWin ? "中" : "错") + "【" + count + "】期提醒";
        let emailContent = "【" + tableName + "】表 方案【" + planType + "】 连" + (isWin ? "中" : "错") + "【" + count + "】期提醒";
        return await EmailSender.sendEmail(emailTitle, emailContent);
    }
}
