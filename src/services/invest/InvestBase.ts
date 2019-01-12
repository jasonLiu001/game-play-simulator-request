import {LotteryDbService} from "../dbservices/ORMService";
import {Config, CONFIG_CONST} from "../../config/Config";
import {NumberService} from "../numbers/NumberService";
import {InvestInfo} from "../../models/db/InvestInfo";
import {TimeService} from "../time/TimeService";
import {PlanResultInfo} from "../../models/db/PlanResultInfo";
import {PlanInvestNumbersInfo} from "../../models/db/PlanInvestNumbersInfo";
import {AwardInfo} from "../../models/db/AwardInfo";
import {NotificationSender} from "../notification/NotificationSender";
import {CONST_INVEST_TOTAL_TABLE} from "../../models/db/CONST_INVEST_TOTAL_TABLE";
import {CONST_INVEST_TABLE} from "../../models/db/CONST_INVEST_TABLE";
import {AppSettings} from "../../config/AppSettings";
import {SettingService} from "../settings/SettingService";
import {EnumNotificationType} from "../../models/EnumModel";
import {NotificationService} from "../notification/NotificationService";
import BlueBirdPromise = require('bluebird');
import moment  = require('moment');
import {ConstVars} from "../../global/ConstVars";


let log4js = require('log4js'),
    log = log4js.getLogger('InvestBase'),
    numberService = new NumberService(),
    notificationService = new NotificationService();

/**
 *
 * 投注基类
 */
export class InvestBase {
    /**
     *
     * 获取期号字符中的期号 返回纯数字，如期号为20170629-005，返回结果为5
     */
    private getPeriodNumber(periodString: string): number {
        return Number(periodString.split('-')[1]);
    }

    /**
     *
     *
     * @param {String} prizeNumber 后三开奖号码
     * @param investNumbersArray
     * @param investInfo
     */
    private updateIsWinStatus(prizeNumber: string, investNumbersArray: Array<string>, investInfo: InvestInfo) {
        if (prizeNumber.length != 3 || prizeNumber == '') throw new Error('目前只支持后三开奖号码兑奖');

        for (let item of investNumbersArray) {
            if (prizeNumber == item) {
                investInfo.isWin = 1;
                break;
            }
        }
    }

    private updateWinMoney(investNumbersArray: Array<string>, investInfo: InvestInfo) {
        //当前投入
        let investMoney = investNumbersArray.length * 2;
        //更新当前盈利
        if (investInfo.isWin == 1) {
            //当期盈利
            let winMoney = CONFIG_CONST.awardPrice - investMoney;
            investInfo.winMoney = (winMoney / investInfo.awardMode) * Number(CONFIG_CONST.touZhuBeiShu);
        } else {
            investInfo.winMoney = (investMoney == 0) ? 0 : -((investMoney / investInfo.awardMode) * Number(CONFIG_CONST.touZhuBeiShu));
        }
    }


    private updateCurrentAccountBalace(investInfo: InvestInfo) {
        //更新当前账号余额
        if (investInfo.isWin == 1) {
            investInfo.currentAccountBalance = Number((Number(investInfo.currentAccountBalance) + Number(CONFIG_CONST.awardPrice / investInfo.awardMode) * Number(CONFIG_CONST.touZhuBeiShu)).toFixed(2));
        }
    }

    /**
     *
     *
     * 检查是否可以执行真正的投注操作
     */
    private checkLastPrizeNumberValidation(): BlueBirdPromise<boolean> {
        log.info('%s期开奖号码:%s，当前时间：%s', Config.globalVariable.last_Period, Config.globalVariable.last_PrizeNumber, moment().format(ConstVars.momentDateTimeFormatter));
        log.info('当前%s期，任务执行中...', Config.globalVariable.current_Peroid);
        //上期的开奖号码是否满足投注条件
        return numberService.isLastPrizeNumberValid()
            .then((result) => {
                if (!result) {
                    let errorMsg = Config.globalVariable.last_Period + '期号码:' + Config.globalVariable.last_PrizeNumber + '，不满足执行条件，放弃' + Config.globalVariable.current_Peroid + '期投注，本次任务执行完毕';
                    //上期号码不满足条件时，则结束当前Promise调用链并返回
                    return BlueBirdPromise.reject(errorMsg);
                }
                return BlueBirdPromise.resolve(result);
            });

    }

    /**
     *
     * 检查投注时间 在02:00-10:00点之间不允许投注  当天22:00以后自动切换到模拟投注
     */
    private async checkInvestTime(): BlueBirdPromise<any> {
        //检查在此时间内是否允许投注
        if (TimeService.isInStopInvestTime()) {//不可投注的时间段时
            //更新开奖时间
            TimeService.updateNextPeriodInvestTime();
            return BlueBirdPromise.reject("当前时间：" + moment().format(ConstVars.momentDateTimeFormatter) + "，在02:00~10:00之间，不符合投注时间")
        }

        //当天22:00以后自动切换到模拟投注
        if (CONFIG_CONST.isRealInvest && TimeService.isReachInvestEndTime()) {
            let timeReachMessage = "当前时间：" + moment().format(ConstVars.momentDateTimeFormatter) + "，当天" + AppSettings.realInvestEndTime + "以后，自动启动模拟投注";

            //自动切换到模拟投注 同时发送购买结束提醒
            let mockResult: any = await SettingService.switchToMockInvest();
            //当前最新一条投注方案
            let investInfoList: InvestInfo[] = await LotteryDbService.getInvestInfoHistory(CONFIG_CONST.currentSelectedInvestPlanType, 1);
            if (!investInfoList || investInfoList.length === 0) return BlueBirdPromise.reject(timeReachMessage);

            //发送 购买结束提醒
            let sendEmailResult: any = await NotificationSender.send("购买完成，当前账号余额:" + investInfoList[0].currentAccountBalance, timeReachMessage, EnumNotificationType.PUSH_AND_EMAIL);

            //终止当前的promise链
            return BlueBirdPromise.reject(timeReachMessage);
        }

        return BlueBirdPromise.resolve(true);
    }

    /**
     *
     * 检查最大盈利金额是否达到设定目标
     */
    private async checkMaxWinMoney(): BlueBirdPromise<any> {
        //第一次投注时不检查最大余额 因为最大余额从数据库中取的，如果第二天运行的情况下，上条记录取的是上一条的余额，会导致判断错误
        if (Config.currentInvestTotalCount == 0) return BlueBirdPromise.resolve(true);

        //当前最新一条投注方案
        let investInfo: InvestInfo[] = await LotteryDbService.getInvestInfoHistory(CONFIG_CONST.currentSelectedInvestPlanType, 1);
        // 首次无记录时 直接返回
        if (!investInfo || investInfo.length === 0) return BlueBirdPromise.resolve(true);

        let currentAccountBalance = investInfo[0].currentAccountBalance;
        if (currentAccountBalance >= CONFIG_CONST.maxAccountBalance) {
            if (CONFIG_CONST.isRealInvest) {//真实投注需要判断盈利金额设置
                let winMessage = "当前账号余额：" + currentAccountBalance + "，已达到目标金额：" + CONFIG_CONST.maxAccountBalance;
                //自动切换到模拟后 发送盈利提醒
                let mockResult: any = await SettingService.switchToMockInvest();
                log.error(winMessage);
                //发送盈利提醒
                return await NotificationSender.send("达到目标金额:" + CONFIG_CONST.maxAccountBalance, winMessage, EnumNotificationType.PUSH_AND_EMAIL);

            }
        } else if (currentAccountBalance <= CONFIG_CONST.minAccountBalance) {
            if (CONFIG_CONST.isRealInvest) {//真实投注需要判断亏损金额设置
                let loseMessage: string = "当前账号余额：" + currentAccountBalance + "，已达到亏损警戒金额：" + CONFIG_CONST.minAccountBalance;
                //自动切换到模拟后 发送亏损提醒
                let mockResult: any = await SettingService.switchToMockInvest();
                log.error(loseMessage);
                //发送亏损提醒
                return await NotificationSender.send("达到最低限额:" + CONFIG_CONST.minAccountBalance, loseMessage, EnumNotificationType.PUSH_AND_EMAIL)
            }
        }
        return BlueBirdPromise.resolve(true);
    }

    /**
     *
     * 检查已开奖的期数个数
     */
    private checkAwardHistoryCount(): BlueBirdPromise<boolean> {
        return LotteryDbService.getAwardInfoHistory(CONFIG_CONST.historyCount)
            .then((awardHistoryList: Array<AwardInfo>) => {
                if (!awardHistoryList || awardHistoryList.length != CONFIG_CONST.historyCount) {
                    return BlueBirdPromise.reject("历史开奖总期数个数，不足" + CONFIG_CONST.historyCount + "期，不满足投注条件，已放弃本次投注");
                }
                return BlueBirdPromise.resolve(true);
            });
    }

    /**
     *
     *
     * 当前投注是否是连续投注
     */
    private sendContinueInvestWarnEmail(): BlueBirdPromise<boolean> {
        //模拟投注不需要邮件提醒
        if (!CONFIG_CONST.isRealInvest) return BlueBirdPromise.resolve(true);

        //查询是否存在上期投注记录
        return LotteryDbService.getInvestInfo(Config.globalVariable.last_Period, CONFIG_CONST.currentSelectedInvestPlanType)
            .then((lastInvestInfo: InvestInfo) => {
                //不存在上期的投注记录 直接返回，可以投注
                if (!lastInvestInfo) return BlueBirdPromise.resolve(true);

                //当期完整期号 格式：20180511-078
                let currentPeriodString: string = TimeService.getCurrentPeriodNumber(new Date());
                //提醒邮件
                let warnMessage: string = "上期：" + lastInvestInfo.period + "，当期：" + currentPeriodString + "，当前时间：" + moment().format(ConstVars.momentDateTimeFormatter);
                //发送邮件提醒
                return NotificationSender.send("余额:" + lastInvestInfo.currentAccountBalance + "连续购买前", warnMessage, EnumNotificationType.PUSH_AND_EMAIL);
            }).then(() => {
                return BlueBirdPromise.resolve(true);
            });
    }

    /**
     *
     *
     * 是否可投注检查
     */
    public doCheck(): BlueBirdPromise<boolean> {
        //检查投注时间 在02:00-10:00点之间不允许投注 当天22:00以后自动切换到模拟投注
        return this.checkInvestTime()
            .then(() => {
                //首先检查 是否开启错误或者正确提醒
                if (!AppSettings.enableWarningNotification) return BlueBirdPromise.resolve();

                //再判断时间是否在设置的时间内 不在投注时间内直接返回
                if (TimeService.isInStopInvestTime() || TimeService.isReachInvestEndTime()) return BlueBirdPromise.resolve();

                //检查正确期数是否满足特定条件
                return notificationService.checkAndSendNotification();
            })
            .then(() => {
                //检查当前的最大盈利金额
                return this.checkMaxWinMoney();
            })
            .then(() => {
                if (!AppSettings.isStopCheckLastPrizeNumber) {
                    //检查开奖号码是否满足投注条件
                    return this.checkLastPrizeNumberValidation();
                }
            })
            .then(() => {
                //检查数据库中是否存在的已开奖的期数个数
                return this.checkAwardHistoryCount();
            })
            .then(() => {
                if (!AppSettings.isStopSendContinueInvestWarnEmail) {
                    //检查是否是连续投注，如果是则发送提醒邮件
                    return this.sendContinueInvestWarnEmail();
                }
            });
    }

    /**
     *
     * 是否当前账户余额是否重置为初始余额
     * @returns {boolean}
     */
    private isResetOriginalAccountBalance(tableName: String): boolean {
        if (tableName === CONST_INVEST_TABLE.tableName) {
            //app第一次运行 并且设置了初始余额为上期余额时 不需要重置
            if (Config.isInvestTableInitCompleted && AppSettings.isUseLastAccountBalance) {
                return false;//不需要重置初始账号余额
            } else if (Config.isInvestTableInitCompleted && !AppSettings.isUseLastAccountBalance) {//只有程序第一次 这里的判断和上面的判断不能调换顺序，第一次运行的两张情况
                return true;//重置初始账号余额
            } else {
                return false;
            }
        } else if (tableName === CONST_INVEST_TOTAL_TABLE.tableName) {
            //app第一次运行 并且设置了初始余额为上期余额时 不需要重置
            if (Config.isInvestTotalTableInitCompleted && AppSettings.isUseLastAccountBalance) {
                return false;//不需要重置初始账号余额
            } else if (Config.isInvestTotalTableInitCompleted && !AppSettings.isUseLastAccountBalance) {//只有程序第一次 这里的判断和上面的判断不能调换顺序，第一次运行的两张情况
                return true;//重置初始账号余额
            } else {
                return false;
            }
        }
    }

    /**
     *
     *
     * 初始化投注信息 投注后 账户余额等信息
     */
    public async initAllPlanInvestInfo(tableName: String): BlueBirdPromise<Array<any>> {
        log.info('初始化表%s投注数据', tableName);
        let allPlanInvests: Array<InvestInfo> = [];
        let planType: number = 1;
        for (let key in Config.investPlan) {
            let planInfo = Config.investPlan[key];
            //计划投注号码
            let planInvestNumbersArray = (planInfo.investNumbers == "") ? [] : planInfo.investNumbers.split(',');
            //计划当前投入
            let planInvestMoney = planInvestNumbersArray.length * 2;
            //获取上期余额
            let investList: InvestInfo[] = null;
            if (tableName === CONST_INVEST_TABLE.tableName) {
                investList = await LotteryDbService.getInvestInfoHistory(planType, 1);
            } else if (tableName === CONST_INVEST_TOTAL_TABLE.tableName) {
                investList = await LotteryDbService.getInvestTotalInfoHistory(planType, 1);
            }
            //上期余额 应用第一次启动时 当前余额等于初始账户余额
            let lastAccountBalance = (this.isResetOriginalAccountBalance(tableName) || !investList || investList.length === 0) ? CONFIG_CONST.originAccountBalance : investList[0].currentAccountBalance;

            let accountBalance = Number(Number(lastAccountBalance - (Number(planInvestMoney / CONFIG_CONST.awardMode) * Number(CONFIG_CONST.touZhuBeiShu))).toFixed(2));
            //输出当前账户余额
            log.info('方案%s %s买号后余额：%s', planType, CONFIG_CONST.isRealInvest ? "真实投注" : "模拟投注", accountBalance);
            let investInfo: InvestInfo = {
                period: Config.globalVariable.current_Peroid,
                planType: planType,
                investNumbers: planInfo.investNumbers,
                currentAccountBalance: accountBalance,
                originAccountBalance: CONFIG_CONST.originAccountBalance,
                investNumberCount: planInfo.investNumbers.split(',').length,
                awardMode: CONFIG_CONST.awardMode,
                touZhuBeiShu: parseInt(CONFIG_CONST.touZhuBeiShu),
                isUseReverseInvestNumbers: AppSettings.isUseReverseInvestNumbers ? 1 : 0,
                winMoney: 0,
                status: 0,
                isWin: 0,
                investTime: moment().format(ConstVars.momentDateTimeFormatter),
                investDate: moment().format(ConstVars.momentDateFormatter),
                investTimestamp: moment().format(ConstVars.momentTimeFormatter)
            };
            planType++;
            allPlanInvests.push(investInfo);
        }
        return BlueBirdPromise.resolve(allPlanInvests);
    }

    /**
     *
     * 更新盈利
     */
    private async updateInvestWinMoney(tableName: String): BlueBirdPromise<any> {
        let resultList;

        if (tableName === CONST_INVEST_TABLE.tableName) {
            resultList = await LotteryDbService.getInvestInfoListByStatus(0);
        } else if (tableName === CONST_INVEST_TOTAL_TABLE.tableName) {
            resultList = await LotteryDbService.getInvestTotalInfoListByStatus(0);
        }
        if (!resultList) return BlueBirdPromise.resolve([]);

        let investInfoList: Array<InvestInfo> = [];
        log.info('查询到%s表中未开奖数据%s条', tableName, resultList.length);
        for (let item of resultList) {
            let investInfo: InvestInfo = {
                period: item.period,
                planType: item.planType,
                investNumbers: item.investNumbers,
                currentAccountBalance: item.currentAccountBalance,
                originAccountBalance: item.originAccountBalance,
                investNumberCount: item.investNumberCount,
                awardMode: item.awardMode,
                touZhuBeiShu: item.touZhuBeiShu,
                isUseReverseInvestNumbers: item.isUseReverseInvestNumbers,
                winMoney: item.winMoney,
                status: item.status,
                isWin: item.isWin,
                investTime: item.investTime,
                investDate: item.investDate,
                investTimestamp: item.investTimestamp
            };
            //后三开奖号码
            let prizeNumber = item.openNumber.substring(2);
            //兑奖 更新开奖状态 更新盈利 更新账户余额
            this.UpdatePrize(investInfo, prizeNumber);
            investInfoList.push(investInfo);
        }

        let saveResult;
        //首先更新之前未开奖的数据
        if (tableName === CONST_INVEST_TABLE.tableName) {
            saveResult = await LotteryDbService.saveOrUpdateInvestInfoList(investInfoList);
        } else if (tableName === CONST_INVEST_TOTAL_TABLE.tableName) {
            saveResult = await LotteryDbService.saveOrUpdateInvestTotalInfoList(investInfoList);
        }
        log.info('已更新%s表未开奖数据%s条', tableName, investInfoList.length);
        return saveResult;
    }

    /**
     *
     *
     * 计算上期盈亏
     */
    public async calculateWinMoney(): BlueBirdPromise<any> {
        //更新invest表余额
        let updateInvestResult = await this.updateInvestWinMoney(CONST_INVEST_TABLE.tableName);
        //更新invest_total表余额
        let updateInvestTotalResult = await this.updateInvestWinMoney(CONST_INVEST_TOTAL_TABLE.tableName);

        return LotteryDbService.getPlanInvestNumbersInfoListByStatus(0)
            .then((list: Array<any>) => {
                if (!list) BlueBirdPromise.resolve([]);
                log.info("查询到plan_invest_numbers表中未开奖数据%s条", list.length);

                //各个计划产生号码结果
                let planInvestNumbersInfoList: Array<PlanInvestNumbersInfo> = [];
                //各个计划开奖结果
                let planResultInfoList: Array<PlanResultInfo> = [];

                for (let item of list) {
                    //后三开奖号码
                    let prizeNumber = item.openNumber.substring(2);
                    //兑奖
                    if (prizeNumber.length != 3 || prizeNumber == '') throw new Error('目前只支持后三开奖号码兑奖');

                    //各个计划投注号码
                    let planInvestNumbersInfo: PlanInvestNumbersInfo = {
                        period: item.period,
                        jiou_type: item.jiou_type,
                        killplan_bai_wei: item.killplan_bai_wei,
                        killplan_shi_wei: item.killplan_shi_wei,
                        killplan_ge_wei: item.killplan_ge_wei,
                        missplan_bai_wei: item.missplan_bai_wei,
                        missplan_shi_wei: item.missplan_shi_wei,
                        missplan_ge_wei: item.missplan_ge_wei,
                        brokengroup_01_334: item.brokengroup_01_334,
                        brokengroup_01_224: item.brokengroup_01_224,
                        brokengroup_01_125: item.brokengroup_01_125,
                        road012_01: item.road012_01,
                        number_distance: item.number_distance,
                        sum_values: item.sum_values,
                        three_number_together: item.three_number_together,
                        killbaiwei_01: item.killbaiwei_01,
                        killshiwei_01: item.killshiwei_01,
                        killgewei_01: item.killgewei_01,
                        bravenumber_6_01: item.bravenumber_6_01,
                        status: 1//状态更新置为已更新状态
                    };
                    //计划中奖结果表初始化
                    let planResultInfo: PlanResultInfo = {
                        period: item.period,
                        jiou_type: 0,
                        killplan_bai_wei: 0,
                        killplan_shi_wei: 0,
                        killplan_ge_wei: 0,
                        missplan_bai_wei: 0,
                        missplan_shi_wei: 0,
                        missplan_ge_wei: 0,
                        brokengroup_01_334: 0,
                        brokengroup_01_224: 0,
                        brokengroup_01_125: 0,
                        road012_01: 0,
                        number_distance: 0,
                        sum_values: 0,
                        three_number_together: 0,
                        killbaiwei_01: 0,
                        killshiwei_01: 0,
                        killgewei_01: 0,
                        bravenumber_6_01: 0,
                        status: 1//状态更新置为已更新状态
                    };
                    //首先更新各计划开奖结果
                    this.updatePlanResult(planInvestNumbersInfo, prizeNumber, planResultInfo);

                    planInvestNumbersInfoList.push(planInvestNumbersInfo);
                    planResultInfoList.push(planResultInfo);
                }

                //保存各计划中奖状态 及 计划更新状态
                return LotteryDbService.saveOrUpdatePlanInvestNumbersInfoList(planInvestNumbersInfoList)
                    .then(() => {
                        return LotteryDbService.saveOrUpdatePlanResultInfoList(planResultInfoList);
                    });
            })
            .then((results) => {
                log.info('已更新plan_invest_numbers表未开奖数据%s条', results.length);
                return BlueBirdPromise.resolve(true);
            });
    }

    /**
     *
     * 更新各计划投注结果
     * @constructor
     */
    private updatePlanResult(planInvestNumbersInfo: PlanInvestNumbersInfo, prizeNumber: string, planResultInfo: PlanResultInfo): void {
        //奇偶类型
        let jiOuTypeArray = planInvestNumbersInfo.jiou_type == null ? [] : planInvestNumbersInfo.jiou_type.split(',');
        for (let item of jiOuTypeArray) {
            if (prizeNumber == item) {
                planResultInfo.jiou_type = 1;
                break;
            }
        }

        //杀号计划 百位
        let killplanBaiWeiArray = planInvestNumbersInfo.killplan_bai_wei == null ? [] : planInvestNumbersInfo.killplan_bai_wei.split(',');
        for (let item of killplanBaiWeiArray) {
            if (prizeNumber == item) {
                planResultInfo.killplan_bai_wei = 1;
                break;
            }
        }

        //杀号计划 十位
        let killplanShiWeiArray = planInvestNumbersInfo.killplan_shi_wei == null ? [] : planInvestNumbersInfo.killplan_shi_wei.split(',');
        for (let item of killplanShiWeiArray) {
            if (prizeNumber == item) {
                planResultInfo.killplan_shi_wei = 1;
                break;
            }
        }

        //杀号计划 个位
        let killplanGeWeiArray = planInvestNumbersInfo.killplan_ge_wei == null ? [] : planInvestNumbersInfo.killplan_ge_wei.split(',');
        for (let item of killplanGeWeiArray) {
            if (prizeNumber == item) {
                planResultInfo.killplan_ge_wei = 1;
                break;
            }
        }

        //最大遗漏 百位
        let missplanBaiWeiArray = planInvestNumbersInfo.missplan_bai_wei == null ? [] : planInvestNumbersInfo.missplan_bai_wei.split(',');
        for (let item of missplanBaiWeiArray) {
            if (prizeNumber == item) {
                planResultInfo.missplan_bai_wei = 1;
                break;
            }
        }

        //最大遗漏 十位
        let missplanShiWeiArray = planInvestNumbersInfo.missplan_shi_wei == null ? [] : planInvestNumbersInfo.missplan_shi_wei.split(',');
        for (let item of missplanShiWeiArray) {
            if (prizeNumber == item) {
                planResultInfo.missplan_shi_wei = 1;
                break;
            }
        }

        //最大遗漏 个位
        let missplanGeWeiArray = planInvestNumbersInfo.missplan_ge_wei == null ? [] : planInvestNumbersInfo.missplan_ge_wei.split(',');
        for (let item of missplanGeWeiArray) {
            if (prizeNumber == item) {
                planResultInfo.missplan_ge_wei = 1;
                break;
            }
        }

        //3-3-4断组
        let brokengroup_01_334Array = planInvestNumbersInfo.brokengroup_01_334 == null ? [] : planInvestNumbersInfo.brokengroup_01_334.split(',');
        for (let item of brokengroup_01_334Array) {
            if (prizeNumber == item) {
                planResultInfo.brokengroup_01_334 = 1;
                break;
            }
        }

        //2-2-4断组
        let brokengroup_01_224Array = planInvestNumbersInfo.brokengroup_01_224 == null ? [] : planInvestNumbersInfo.brokengroup_01_224.split(',');
        for (let item of brokengroup_01_224Array) {
            if (prizeNumber == item) {
                planResultInfo.brokengroup_01_224 = 1;
                break;
            }
        }

        //3-3-4断组
        let brokengroup_01_125Array = planInvestNumbersInfo.brokengroup_01_125 == null ? [] : planInvestNumbersInfo.brokengroup_01_125.split(',');
        for (let item of brokengroup_01_125Array) {
            if (prizeNumber == item) {
                planResultInfo.brokengroup_01_125 = 1;
                break;
            }
        }

        //012路类型
        let road012_01_Array = planInvestNumbersInfo.road012_01 == null ? [] : planInvestNumbersInfo.road012_01.split(',');
        for (let item of road012_01_Array) {
            if (prizeNumber == item) {
                planResultInfo.road012_01 = 1;
                break;
            }
        }

        //杀跨度
        let number_distance_Array = planInvestNumbersInfo.number_distance == null ? [] : planInvestNumbersInfo.number_distance.split(',');
        for (let item of number_distance_Array) {
            if (prizeNumber == item) {
                planResultInfo.number_distance = 1;
                break;
            }
        }

        //杀和值
        let sum_values_Array = planInvestNumbersInfo.sum_values == null ? [] : planInvestNumbersInfo.sum_values.split(',');
        for (let item of sum_values_Array) {
            if (prizeNumber == item) {
                planResultInfo.sum_values = 1;
                break;
            }
        }

        //杀特殊号：三连
        let three_number_together_Array = planInvestNumbersInfo.three_number_together == null ? [] : planInvestNumbersInfo.three_number_together.split(',');
        for (let item of three_number_together_Array) {
            if (prizeNumber == item) {
                planResultInfo.three_number_together = 1;
                break;
            }
        }

        //杀百位
        let killbaiwei_01_Array = planInvestNumbersInfo.killbaiwei_01 == null ? [] : planInvestNumbersInfo.killbaiwei_01.split(',');
        for (let item of killbaiwei_01_Array) {
            if (prizeNumber == item) {
                planResultInfo.killbaiwei_01 = 1;
                break;
            }
        }

        //杀十位
        let killshiwei_01_Array = planInvestNumbersInfo.killshiwei_01 == null ? [] : planInvestNumbersInfo.killshiwei_01.split(',');
        for (let item of killshiwei_01_Array) {
            if (prizeNumber == item) {
                planResultInfo.killshiwei_01 = 1;
                break;
            }
        }

        //杀个位
        let killgewei_01_Array = planInvestNumbersInfo.killgewei_01 == null ? [] : planInvestNumbersInfo.killgewei_01.split(',');
        for (let item of killgewei_01_Array) {
            if (prizeNumber == item) {
                planResultInfo.killgewei_01 = 1;
                break;
            }
        }

        //定6胆
        let bravenumber_6_01_Array = planInvestNumbersInfo.bravenumber_6_01 == null ? [] : planInvestNumbersInfo.bravenumber_6_01.split(',');
        for (let item of bravenumber_6_01_Array) {
            if (prizeNumber == item) {
                planResultInfo.bravenumber_6_01 = 1;
                break;
            }
        }
    }

    /**
     *
     *
     * 兑奖
     * @param investInfo
     * @param openNumber
     * @return {Array|string[]}
     */
    private UpdatePrize(investInfo: InvestInfo, openNumber: string): void {
        //投注号码数组
        let investNumbersArray = (investInfo.investNumbers == "") ? [] : investInfo.investNumbers.split(',');
        //更新中奖状态
        this.updateIsWinStatus(openNumber, investNumbersArray, investInfo);
        //更新当前盈利
        this.updateWinMoney(investNumbersArray, investInfo);
        //更新当前账号余额
        this.updateCurrentAccountBalace(investInfo);
        //更新开奖状态
        investInfo.status = 1;//已开奖
    }
}
