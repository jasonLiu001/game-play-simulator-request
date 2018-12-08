import BlueBirdPromise = require('bluebird');
import {LotteryDbService} from "../dbservices/ORMService";

import moment  = require('moment');
import {Config, CONFIG_CONST} from "../../config/Config";
import {NotificationSender} from "./NotificationSender";
import {InvestInfo} from "../../models/db/InvestInfo";
import {AppSettings} from "../../config/AppSettings";
import {SettingService} from "../settings/SettingService";
import {TimeService} from "../time/TimeService";
import {ScheduleTaskList} from "../../config/ScheduleTaskList";
import cron = require('node-cron');
import {EnumNotificationType, EnumSMSSignType, EnumSMSTemplateType} from "../../models/EnumModel";
import {SMSSender} from "./sender/SMSSender";
import {CONST_INVEST_TABLE} from "../../models/db/CONST_INVEST_TABLE";


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
    //数据库中 当前投注的记录期号 用于不重复发送通知邮件
    public static periodUsedByInvestNotification: string = null;
}

/**
 *
 * 消息通知服务
 */
export class NotificationService {

    /**
     *
     * 间隔2分钟检查是否需要发送通知  入口方法
     */
    public async start(): BlueBirdPromise<any> {
        log.info('通知已启动，持续监视中...');
        //2分钟检查一次是否需要发送通知
        ScheduleTaskList.notificationTaskEntity.cronSchedule = cron.schedule(ScheduleTaskList.notificationTaskEntity.cronTimeStr, () => {
            //首先判断时间是否在设置的时间内 不在投注时间内直接返回
            if (TimeService.isInStopInvestTime() || TimeService.isReachInvestEndTime()) return;

            SettingService.getAndInitSettings()
                .then(() => {
                    //次数多的要先发送邮件，这样次数少的就不会重复发了，因为公用的一个变量控制重复发送
                    setTimeout(() => {
                        //当天第1期错误提醒 为什么把这个单独写成方法 没有和连错合并，上期错的情况太多会不停的发送邮件
                        this.sendTodayFirstErrorWarnEmail(CONST_INVEST_TABLE.tableName, 1)
                            .catch((err) => {
                                if (err) {
                                    log.error("当天第1期错误提醒邮件通知异常");
                                    log.error(err);
                                }
                            });
                    }, 100);

                    //次数多的要先发送邮件，这样次数少的就不会重复发了，因为公用的一个变量控制重复发送
                    //连错4期提醒
                    setTimeout(() => {
                        this.sendContinueWinOrLoseWarnEmail(CONST_INVEST_TABLE.tableName, 4, false)
                            .catch((err) => {
                                if (err) {
                                    log.error("连错4期提醒邮件通知异常");
                                    log.error(err);
                                }
                            });
                    }, 200);
                    //连错3期提醒
                    setTimeout(() => {
                        this.sendContinueWinOrLoseWarnEmail(CONST_INVEST_TABLE.tableName, 3, false)
                            .catch((err) => {
                                if (err) {
                                    log.error("连错3期提醒邮件通知异常");
                                    log.error(err);
                                }
                            });
                    }, 300);
                    //连错2期提醒
                    setTimeout(() => {
                        this.sendContinueWinOrLoseWarnEmail(CONST_INVEST_TABLE.tableName, 2, false)
                            .catch((err) => {
                                if (err) {
                                    log.error("连错2期提醒邮件通知异常");
                                    log.error(err);
                                }
                            });
                    }, 400);

                    //连错1期提醒
                    if (AppSettings.lastPeriodErrorInvestNotification) {
                        setTimeout(() => {
                            this.sendContinueWinOrLoseWarnEmail(CONST_INVEST_TABLE.tableName, 1, false)
                                .catch((err) => {
                                    if (err) {
                                        log.error("连错1期提醒邮件通知异常");
                                        log.error(err);
                                    }
                                });
                        }, 500);
                    }

                    //最大最小利润预警
                    setTimeout(() => {
                        this.sendMaxOrMinProfitNotification(CONST_INVEST_TABLE.tableName)
                            .catch((err) => {
                                if (err) {
                                    log.error("最大最小利润预警邮件通知异常");
                                    log.error(err);
                                }
                            });
                    }, 600);
                });
        });
    }

    /**
     *
     * 投注时发送通知
     */
    public async startInvestNotification(tableName: string): BlueBirdPromise<any> {
        //当天
        let today: string = moment().format("YYYY-MM-DD");
        let historyData: Array<InvestInfo> = await LotteryDbService.getInvestInfoHistory(CONFIG_CONST.currentSelectedInvestPlanType, 1, today + " 10:00:00");

        if (!historyData || historyData.length == 0) return BlueBirdPromise.resolve(false);

        //已开奖投注 直接返回
        if (historyData[0].status == 1) return BlueBirdPromise.resolve(false);

        //不重复发送邮件
        if (NotificationConfig.periodUsedByInvestNotification != historyData[0].period) {
            NotificationConfig.periodUsedByInvestNotification = historyData[0].period;
            let emailTitle = "【" + Config.globalVariable.current_Peroid + "】期投注提醒";
            let emailContent = "【" + Config.globalVariable.current_Peroid + "】期已执行投注！投注时间【" + moment().format('YYYY-MM-DD HH:mm:ss') + "】，选择方案【" + CONFIG_CONST.currentSelectedInvestPlanType + "】";
            log.info("当前时间：%s %s", moment().format('YYYY-MM-DD HH:mm:ss'), emailTitle);
            return await NotificationSender.send(emailTitle, emailContent, EnumNotificationType.EMAIL);
        }

        return BlueBirdPromise.resolve(false);
    }

    /**
     *
     * 达到指定利润发送预警邮件
     */
    public async sendMaxOrMinProfitNotification(tableName: string): BlueBirdPromise<any> {
        //当天
        let today: string = moment().format("YYYY-MM-DD");
        let historyData: Array<InvestInfo> = await LotteryDbService.getInvestInfoHistory(CONFIG_CONST.currentSelectedInvestPlanType, 1, today + " 10:00:00");
        if (!historyData || historyData.length == 0) return BlueBirdPromise.resolve(false);

        //未开奖直接返回
        if (historyData[0].status == 0) return BlueBirdPromise.resolve(false);

        //当前账号余额
        let currentAccountBalance: number = historyData[0].currentAccountBalance;

        //不重复发送邮件
        if (NotificationConfig.todayMaxOrMinProfitInvestPeriod != historyData[0].period) {
            NotificationConfig.todayMaxOrMinProfitInvestPeriod = historyData[0].period;
            if (currentAccountBalance <= AppSettings.minProfitNotification) {
                let lowerTitle = "最低预警 方案【" + CONFIG_CONST.currentSelectedInvestPlanType + "】已达最低利润值点";
                log.info("当前时间：%s %s", moment().format('YYYY-MM-DD HH:mm:ss'), lowerTitle);
                return await NotificationSender.send(lowerTitle, "已达最低预警利润值：" + AppSettings.minProfitNotification, EnumNotificationType.PUSH_AND_EMAIL);
            } else if (currentAccountBalance >= AppSettings.maxProfitNotification) {
                let higherTitle = "最高预警 方案【" + CONFIG_CONST.currentSelectedInvestPlanType + "】已达最高利润值点";
                log.info("当前时间：%s %s", moment().format('YYYY-MM-DD HH:mm:ss'), higherTitle);
                return await NotificationSender.send(higherTitle, "已达最高预警利润值：" + AppSettings.maxProfitNotification, EnumNotificationType.PUSH_AND_EMAIL);
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
        let emailTitle = '方案【' + CONFIG_CONST.currentSelectedInvestPlanType + '】 昨天 ' + yesterday + ' 亏损状态提醒';//通知邮件标题
        let emailContent = '方案 【' + CONFIG_CONST.currentSelectedInvestPlanType + '】 昨天 ' + yesterday + ' 截止22:00:00， 状态为亏损，最大余额：' + yesterdayAccountBalance.maxAccountBalance + ', 最小余额：' + yesterdayAccountBalance.minAccountBalance;//通知邮件内容
        if (yesterdayAccountBalance.maxAccountBalance < CONFIG_CONST.originAccountBalance) {//最大利润小于初始账号 亏损
            log.info("当前时间：%s %s", moment().format('YYYY-MM-DD HH:mm:ss'), emailTitle);
            return await NotificationSender.send(emailTitle, emailContent, EnumNotificationType.EMAIL);
        } else if (yesterdayAccountBalance.minAccountBalance < parseFloat((CONFIG_CONST.originAccountBalance / 5).toFixed(2))) {//最小账户余额小于初始账号的1/5 亏损
            log.info("当前时间：%s %s", moment().format('YYYY-MM-DD HH:mm:ss'), emailTitle);
            return await NotificationSender.send(emailTitle, emailContent, EnumNotificationType.EMAIL);
        }
        return BlueBirdPromise.resolve(true);
    }

    /**
     *
     * 连中或者连错一定期数时 发送邮件提醒
     * 连中：5,4,3
     * 连错：5,4,3
     */
    public async sendContinueWinOrLoseWarnEmail(tableName: string, maxWinOrLoseCount: number, isWin: boolean): BlueBirdPromise<any> {
        //方案 连续5,4,3期错误 发送邮件提醒
        return await  this.continueWinOrLose(tableName, CONFIG_CONST.currentSelectedInvestPlanType, maxWinOrLoseCount, isWin);
    }

    /**
     *
     * 当前10:00:00后前几期错误 是邮件提醒
     */
    public async sendTodayFirstErrorWarnEmail(tableName: string, firstErrorCount: number): BlueBirdPromise<any> {
        //当天
        let today: string = moment().format("YYYY-MM-DD");
        let historyData: Array<InvestInfo> = await LotteryDbService.getInvestInfoHistory(CONFIG_CONST.currentSelectedInvestPlanType, 120, today + " 10:00:00");
        if (historyData.length == 0) return BlueBirdPromise.resolve(true);

        let errorTotalTimes: number = 0;
        for (let i = 1; i <= firstErrorCount; i++) {
            let investItem: InvestInfo = historyData[historyData.length - i];
            if (investItem.status == 1 && investItem.isWin == 0) {
                errorTotalTimes++;
            }
        }

        //当天第1条投注记录
        let todayFirstInvestItem: InvestInfo = historyData[historyData.length - 1];
        if (NotificationConfig.todayFirstRealInvestPeriod != todayFirstInvestItem.period && errorTotalTimes == firstErrorCount) {
            //发送邮件前保存 数据库最新的期号信息，以便下次发送邮件判断
            NotificationConfig.todayFirstRealInvestPeriod = todayFirstInvestItem.period;
            let subject: string = "当天" + today + "起始" + firstErrorCount + "条投注记录全部错误";
            log.info("当前时间：%s %s", moment().format('YYYY-MM-DD HH:mm:ss'), subject);
            return NotificationSender.send(subject, today + "起始" + firstErrorCount + "次投注中有" + errorTotalTimes + "次错误，可考虑购买", EnumNotificationType.PUSH_AND_EMAIL)
                .then(() => {
                    return SMSSender.send("当天第1次购买错误", String(CONFIG_CONST.currentSelectedInvestPlanType), "1", EnumSMSSignType.cnlands, EnumSMSTemplateType.CONTINUE_INVEST_ERROR);
                });
        }

        return BlueBirdPromise.resolve(true);
    }

    /**
     *
     * 连续中奖特定期数提醒
     * @param tableName
     * @param {number} planType
     * @param maxWinOrLoseCount
     * @param isWin
     * @param afterTime 特定时间之后
     */
    private async continueWinOrLose(tableName: string, planType: number, maxWinOrLoseCount: number, isWin: boolean, afterTime: string = '10:00:00'): BlueBirdPromise<any> {
        //当天
        let today: string = moment().format("YYYY-MM-DD");
        //方案  最新的投注记录
        let historyData: Array<InvestInfo> = await LotteryDbService.getInvestInfoHistory(planType, maxWinOrLoseCount, today + " " + afterTime);

        //数量不足 不发送邮件通知
        if (historyData.length < maxWinOrLoseCount) return BlueBirdPromise.resolve(true);

        let currentTime = new Date();
        let year = currentTime.getFullYear();
        let month = currentTime.getMonth();//month取值 0-11
        let day = currentTime.getDate();
        //当天的21:59
        let thirdTime = new Date(year, month, day, 21, 59, 0);
        let investEndTimeArr: Array<string> = AppSettings.investEndTime.split(':');
        if (investEndTimeArr.length == 3) {
            thirdTime = new Date(year, month, day, Number(investEndTimeArr[0]), Number(investEndTimeArr[1]), Number(investEndTimeArr[2]));
        }
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
                return await this.sendWinOrLoseEmail(tableName, planType, continueMaxWinOrLoseTimes, isWin);
            }

        }

        return BlueBirdPromise.resolve(true);
    }

    /**
     *
     * 连中或者连错数量
     * @param tableName
     * @param planType
     * @param {number} count
     * @param isWin
     * @returns {Bluebird<any>}
     */
    private async sendWinOrLoseEmail(tableName: string, planType: number, count: number, isWin: boolean): BlueBirdPromise<any> {
        let emailTitle = "连" + (isWin ? "中" : "错") + "【" + count + "】期提醒";
        let emailContent = "【Invest】表 方案【" + planType + "】 已连" + (isWin ? "中" : "错") + "【" + count + "】期";
        log.info("当前时间：%s %s", moment().format('YYYY-MM-DD HH:mm:ss'), emailTitle);
        return NotificationSender.send(emailTitle, emailContent, EnumNotificationType.PUSH_AND_EMAIL)
            .then(() => {
                return SMSSender.send(tableName + "表", String(CONFIG_CONST.currentSelectedInvestPlanType), String(count), EnumSMSSignType.cnlands, EnumSMSTemplateType.CONTINUE_INVEST_ERROR);
            });
    }
}
