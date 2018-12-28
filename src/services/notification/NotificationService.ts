import BlueBirdPromise = require('bluebird');

import moment  = require('moment');
import cron = require('node-cron');
import {LotteryDbService} from "../dbservices/ORMService";
import {Config, CONFIG_CONST} from "../../config/Config";
import {NotificationSender} from "./NotificationSender";
import {InvestInfo} from "../../models/db/InvestInfo";
import {AppSettings} from "../../config/AppSettings";
import {SettingService} from "../settings/SettingService";
import {TimeService} from "../time/TimeService";
import {ScheduleTaskList} from "../../config/ScheduleTaskList";
import {EnumNotificationType, EnumSMSSignType, EnumSMSTemplateType} from "../../models/EnumModel";
import {SMSSender} from "./sender/SMSSender";
import {CONST_INVEST_TABLE} from "../../models/db/CONST_INVEST_TABLE";
import {CONST_INVEST_TOTAL_TABLE} from "../../models/db/CONST_INVEST_TOTAL_TABLE";


let log4js = require('log4js'),
    log = log4js.getLogger('NotificationService');

/**
 *
 * 通知配置类
 */
class NotificationConfig {
    //invest数据表中 当天已经保存的最新的投注期号 用于不重复发送通知邮件
    public static invest_lastedRealInvestPeriod: string = null;
    //invest_total数据表中 当天已经保存的最新的投注期号 用于不重复发送通知邮件
    public static investTotal_lastedRealInvestPeriod: string = null;
    //数据库中 达到利润预警值的投注期号 用于不重复发送通知邮件
    public static todayMaxOrMinProfitInvestPeriod: string = null;
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

        });
    }

    /**
     *
     * 检查并同时发送通知
     */
    public async checkAndSendNotification(): BlueBirdPromise<any> {
        log.info("正在同步应用程序所有参数设置，当前时间：%s", moment().format("YYYY-MM-DD HH:mm:ss"));
        return SettingService.getAndInitSettings()
            .then(() => {
                log.info("开始检查【invest_total】表是否存在连错【%s】期...", AppSettings.totalTableMaxErrorCountNotification);
                return this.sendContinueWinOrLoseWarnEmail(CONST_INVEST_TOTAL_TABLE.tableName, AppSettings.totalTableMaxErrorCountNotification + 1, false)
                    .catch((err) => {
                        if (err) {
                            log.error("【invest_total】表 连错【%s】期提醒邮件通知异常", AppSettings.totalTableMaxErrorCountNotification);
                            log.error(err);
                        }
                    });
            })
            .then(() => {
                log.info("开始检查【invest_total】表是否存在连中【%s】期...", AppSettings.totalTableMaxWinCountNotification);
                return this.sendContinueWinOrLoseWarnEmail(CONST_INVEST_TOTAL_TABLE.tableName, AppSettings.totalTableMaxWinCountNotification + 1, true)
                    .catch((err) => {
                        if (err) {
                            log.error("【invest_total】表 连中【%s】期提醒邮件通知异常", AppSettings.totalTableMaxWinCountNotification);
                            log.error(err);
                        }
                    });
            })
            .then(() => {
                //次数多的要先发送邮件，这样次数少的就不会重复发了，因为公用的一个变量控制重复发送
                //连错4期提醒
                log.info("开始检查【invest】表是否存在连错【4】期...");
                return this.sendContinueWinOrLoseWarnEmail(CONST_INVEST_TABLE.tableName, 5, false)
                    .catch((err) => {
                        if (err) {
                            log.error("【invest】表 连错【4】期提醒邮件通知异常");
                            log.error(err);
                        }
                    });
            })
            .then(() => {
                //连错3期提醒
                log.info("开始检查【invest】表是否存在连错【3】期...");
                return this.sendContinueWinOrLoseWarnEmail(CONST_INVEST_TABLE.tableName, 4, false)
                    .catch((err) => {
                        if (err) {
                            log.error("【invest】表 连错【3】期提醒邮件通知异常");
                            log.error(err);
                        }
                    });
            })
            .then(() => {
                //连错2期提醒
                log.info("开始检查【invest】表是否存在连错【2】期...");
                return this.sendContinueWinOrLoseWarnEmail(CONST_INVEST_TABLE.tableName, 3, false)
                    .catch((err) => {
                        if (err) {
                            log.error("【invest】表 连错【2】期提醒邮件通知异常");
                            log.error(err);
                        }
                    });
            })
            .then(() => {
                log.info("开始检查【invest】表是否存在连错【1】期...");
                return this.sendContinueWinOrLoseWarnEmail(CONST_INVEST_TABLE.tableName, 2, false)
                    .catch((err) => {
                        if (err) {
                            log.error("【invest】表 连错【1】期提醒邮件通知异常");
                            log.error(err);
                        }
                    });
            })
            .then(() => {
                //最大最小利润预警
                log.info("开始检查【invest】表最大最小利润情况...");
                return this.sendMaxOrMinProfitNotification(CONST_INVEST_TABLE.tableName)
                    .then(() => {
                        log.info("【invest】表最大最小利润检查完成");
                    })
                    .catch((err) => {
                        if (err) {
                            log.error("【invest】表 最大最小利润预警邮件通知异常");
                            log.error(err);
                        }
                    });
            })
            .then(() => {
                log.info("通知任务，检查所有通知结束，当前时间：%s", moment().format("YYYY-MM-DD HH:mm:ss"));
            });
    }

    /**
     *
     * 达到指定利润发送预警邮件
     */
    public async sendMaxOrMinProfitNotification(tableName: string): BlueBirdPromise<any> {
        let historyData: Array<InvestInfo> = await LotteryDbService.getInvestInfoHistory(CONFIG_CONST.currentSelectedInvestPlanType, 1);
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
    public async sendContinueWinOrLoseWarnEmail(tableName: string, maxWinOrLoseCount: number, isWin: boolean, latestOppositeWinOrLoseCount: number = 0): BlueBirdPromise<any> {
        //方案 连续5,4,3期错误 发送邮件提醒
        return await  this.continueWinOrLose(tableName, CONFIG_CONST.currentSelectedInvestPlanType, maxWinOrLoseCount, isWin, latestOppositeWinOrLoseCount);
    }

    /**
     *
     * 连续中奖特定期数提醒
     * @param tableName
     * @param {number} planType
     * @param maxWinOrLoseCount
     * @param isWin
     * @param latestOppositeWinOrLoseCount 最近盈利或者输的期数
     */
    private async continueWinOrLose(tableName: string, planType: number, maxWinOrLoseCount: number, isWin: boolean, latestOppositeWinOrLoseCount: number = 0): BlueBirdPromise<any> {
        let historyData: Array<InvestInfo>;
        if (tableName == CONST_INVEST_TABLE.tableName) {
            //方案  最新的投注记录
            historyData = await LotteryDbService.getInvestInfoHistory(planType, maxWinOrLoseCount + latestOppositeWinOrLoseCount);
        } else if (tableName == CONST_INVEST_TOTAL_TABLE.tableName) {
            historyData = await LotteryDbService.getInvestTotalInfoHistory(planType, maxWinOrLoseCount + latestOppositeWinOrLoseCount);
        }

        //数量不足 不发送邮件通知
        if (historyData.length < maxWinOrLoseCount) return BlueBirdPromise.resolve(true);

        let currentTime = new Date();
        let year = currentTime.getFullYear();
        let month = currentTime.getMonth();//month取值 0-11
        let day = currentTime.getDate();
        //当天的21:59
        let thirdTime = new Date(year, month, day, 21, 59, 0);
        let investEndTimeArr: Array<string> = AppSettings.realInvestEndTime.split(':');
        if (investEndTimeArr.length == 3) {
            thirdTime = new Date(year, month, day, Number(investEndTimeArr[0]), Number(investEndTimeArr[1]), Number(investEndTimeArr[2]));
        }
        //当天22:00以后停止发送邮件通知
        if (currentTime > thirdTime) return BlueBirdPromise.resolve(true);

        //判断最新的1期是否是正在进行中 如果不判断 因为最新一期开奖和上期投注的间隔非常短，通知任务2分钟检查一次，无法检查到就已经投注了
        let latestInvestInfo: InvestInfo = historyData[0];
        if (latestInvestInfo.status === 0) {//进行中
            //移除进行中的这一期 删除数组的第一个元素
            historyData.shift();
        } else if (latestInvestInfo.status === 1) {//已完成
            //删除数组的最后一个元素
            historyData.pop();
        }

        //连中或连错相反 判断
        let latestOppositeCount: number = 0;
        if (latestOppositeWinOrLoseCount > 0) {//如果另外指定判断条件
            //保存另外的判断记录
            let latestInvestItems: Array<InvestInfo> = [];
            for (let i: number = 0; i < latestOppositeWinOrLoseCount; i++) {
                let removedItem: InvestInfo = historyData.shift();
                latestInvestItems.push(removedItem);
            }
            //判断连错或连中期数
            for (let investItem of latestInvestItems) {
                if (investItem.status == 1) {
                    if (isWin) {//取反判断 连中或者连错期数
                        if (investItem.isWin == 0) {
                            latestOppositeCount++;
                        }
                    } else {//取反判断 连中或者连错期数
                        if (investItem.isWin == 1) {
                            latestOppositeCount++;
                        }
                    }
                }
            }
        }


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

        let winOrLoseString: string = isWin ? "中" : "错";
        log.info('检查结果如下：');
        //这里的maxWinOrLoseCount需要减1操作，和数组元素个数保持一致
        if (continueMaxWinOrLoseTimes == maxWinOrLoseCount - 1 && latestOppositeCount == latestOppositeWinOrLoseCount) {
            log.info('存在连【%s】【%s】期记录，检查时间：%s', winOrLoseString, maxWinOrLoseCount - 1, moment().format("YYYY-MM-DD HH:mm:ss"));
            if (tableName === CONST_INVEST_TABLE.tableName) {
                if (NotificationConfig.invest_lastedRealInvestPeriod != historyData[0].period) {
                    //发送邮件前保存 数据库最新的期号信息，以便下次发送邮件判断
                    NotificationConfig.invest_lastedRealInvestPeriod = historyData[0].period;
                    log.info('发送预警通知，【invest】表，连 %s %s 期 最新连 %s %s 期 提醒', isWin ? '中' : '错', continueMaxWinOrLoseTimes, !isWin ? '中' : '错', latestOppositeWinOrLoseCount);
                    return await this.sendWinOrLoseEmail(tableName, planType, continueMaxWinOrLoseTimes, isWin);
                } else {
                    log.info('预警通知已发送，无需重复发送');
                }
            } else if (tableName === CONST_INVEST_TOTAL_TABLE.tableName) {
                if (NotificationConfig.investTotal_lastedRealInvestPeriod != historyData[0].period) {
                    //发送邮件前保存 数据库最新的期号信息，以便下次发送邮件判断
                    NotificationConfig.investTotal_lastedRealInvestPeriod = historyData[0].period;
                    log.info('发送预警通知，【invest_total】表，连 %s %s 期 最新连 %s %s 期 提醒', isWin ? '中' : '错', continueMaxWinOrLoseTimes, !isWin ? '中' : '错', latestOppositeWinOrLoseCount);
                    return await this.sendWinOrLoseEmail(tableName, planType, continueMaxWinOrLoseTimes, isWin);
                } else {
                    log.info('预警通知已发送，无需重复发送');
                }
            }
        } else {
            log.info('无需发送预警消息，当前【%s】期里，存在【%s】期【%s】，检查时间：%s', maxWinOrLoseCount - 1, continueMaxWinOrLoseTimes, winOrLoseString, moment().format("YYYY-MM-DD HH:mm:ss"));
        }

        return BlueBirdPromise.resolve([]);
    }

    /**
     *
     * 连中或者连错数量
     * @param tableName
     * @param planType
     * @param {number} maxWinOrLoseCount
     * @param isWin
     * @param latestOppositeWinOrLoseCount
     */
    private async sendWinOrLoseEmail(tableName: string, planType: number, maxWinOrLoseCount: number, isWin: boolean, latestOppositeWinOrLoseCount: number = 0,): BlueBirdPromise<any> {
        let emailTitle = "连" + (isWin ? "中" : "错") + "【" + maxWinOrLoseCount + "】期 + 连" + (!isWin ? "中" : "错") + "【" + latestOppositeWinOrLoseCount + "】期 提醒";
        let emailContent = "【" + tableName + "】表 方案【" + planType + "】 已连" + (isWin ? "中" : "错") + "【" + maxWinOrLoseCount + "】期 最新连" + (!isWin ? "中" : "错") + "【" + latestOppositeWinOrLoseCount + "】期";
        log.info("当前时间：%s %s %s", moment().format('YYYY-MM-DD HH:mm:ss'), emailTitle, emailContent);
        let promiseArray: Array<BlueBirdPromise<any>> = [];
        let templateVar3: string = "";//短信模板变量3的内容
        if (isWin) {
            templateVar3 = "正确" + String(maxWinOrLoseCount) + "次";
        } else {
            templateVar3 = String(maxWinOrLoseCount);
        }

        promiseArray.push(SMSSender.send(tableName == CONST_INVEST_TOTAL_TABLE.tableName ? 'total表' : tableName + "表", String(CONFIG_CONST.currentSelectedInvestPlanType), templateVar3, EnumSMSSignType.cnlands, isWin ? EnumSMSTemplateType.CONTINUE_INVEST_CORRECT : EnumSMSTemplateType.CONTINUE_INVEST_ERROR));
        promiseArray.push(NotificationSender.send(emailTitle, emailContent, EnumNotificationType.PUSH_AND_EMAIL));
        return BlueBirdPromise.all(promiseArray);
    }

    /**
     *
     * 发送购买提醒
     */
    public async sendBuyNumberNotification(): BlueBirdPromise<any> {
        let emailTitle = "【" + Config.globalVariable.current_Peroid + "】期投注提醒";
        let emailContent = "【" + Config.globalVariable.current_Peroid + "】期已执行投注！投注时间【" + moment().format('YYYY-MM-DD HH:mm:ss') + "】，选择方案【" + CONFIG_CONST.currentSelectedInvestPlanType + "】";
        let promiseArray: Array<BlueBirdPromise<any>> = [];
        promiseArray.push(SMSSender.send(Config.globalVariable.current_Peroid, moment().format('HH:mm:ss'), String(CONFIG_CONST.currentSelectedInvestPlanType), EnumSMSSignType.cnlands, EnumSMSTemplateType.RECOMMEND_INVEST));
        promiseArray.push(NotificationSender.send(emailTitle, emailContent, EnumNotificationType.PUSH_AND_EMAIL));
        return BlueBirdPromise.all(promiseArray);
    }
}
