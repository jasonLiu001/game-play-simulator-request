import {LotteryDbService} from "../dbservices/DBSerivice";
import {Config, CONFIG_CONST} from "../../config/Config";
import {NumberService} from "../numbers/NumberService";
import {InvestInfo} from "../../models/db/InvestInfo";
import Promise = require('bluebird');
import {TimeService} from "../time/TimeService";
import {EnumAwardMode, RejectionMsg} from "../../models/EnumModel";
import {AppServices} from "../AppServices";
import {PlanResultInfo} from "../../models/db/PlanResultInfo";
import {PlanInvestNumbersInfo} from "../../models/db/PlanInvestNumbersInfo";
import moment  = require('moment');
import {AwardInfo} from "../../models/db/AwardInfo";


let log4js = require('log4js'),
    log = log4js.getLogger('AbstractInvestBase'),
    numberService = new NumberService();

/**
 *
 * 投注接口
 */
export abstract class AbstractInvestBase {
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

        for (let i = 0; i < investNumbersArray.length; i++) {
            let item = investNumbersArray[i];
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
            investInfo.currentAccountBalance = Number((investInfo.currentAccountBalance + (CONFIG_CONST.awardPrice / investInfo.awardMode) * Number(CONFIG_CONST.touZhuBeiShu)).toFixed(2));
            let planType: number = 1;
            //更新所有方案的余额
            for (let key in Config.investPlan) {
                if (planType == investInfo.planType && Config.investPlan[key].investNumbers != '') {
                    Config.investPlan[key].accountBalance = investInfo.currentAccountBalance;
                }
                planType++;
            }

            //当前选择的方案为主 投注方案时 更新公共全局余额
            if (CONFIG_CONST.currentSelectedInvestPlanType == investInfo.planType && Config.currentInvestNumbers != '') {
                //更新全局余额
                Config.currentAccountBalance = investInfo.currentAccountBalance;
            }
        }
    }

    /**
     *
     *
     * 检查是否可以执行真正的投注操作
     */
    private checkLastPrizeNumberValidation(): Promise<boolean> {
        //上期的开奖号码是否满足投注条件
        let isValid = numberService.isLastPrizeNumberValid();
        log.info('%s期开奖号码:%s，当前时间：%s', Config.globalVariable.last_Period, Config.globalVariable.last_PrizeNumber, moment().format('YYYY-MM-DD HH:mm:ss'));
        log.info('当前%s期，任务执行中...', Config.globalVariable.current_Peroid);
        if (!isValid) {
            let errorMsg = Config.globalVariable.last_Period + '期号码:' + Config.globalVariable.last_PrizeNumber + '，不满足执行条件，放弃' + Config.globalVariable.current_Peroid + '期投注，本次任务执行完毕';
            //上期号码不满足条件时，则结束当前Promise调用链并返回
            return Promise.reject(errorMsg);
        }
        return Promise.resolve(true);
    }

    /**
     *
     * 检查投注时间 在02:00-10:00点之间不允许投注  当天22:00以后自动切换到模拟投注
     * @param isRealInvest 是否是真实投注 true:真实投注  false:模拟投注
     */
    private checkInvestTime(isRealInvest: boolean): Promise<any> {
        //检查在此时间内是否允许投注
        if (TimeService.isInStopInvestTime()) {//不可投注的时间段时
            //更新开奖时间
            TimeService.updateNextPeriodInvestTime(new Date(), CONFIG_CONST.openTimeDelaySeconds);
            return Promise.reject("当前时间：" + moment().format('YYYY-MM-DD HH:mm:ss') + "，在02:00~10:00之间，不符合投注时间")
        }

        let currentTime = new Date();
        let year = currentTime.getFullYear();
        let month = currentTime.getMonth();//month取值 0-11
        let day = currentTime.getDate();
        //当天的21:59
        let thirdTime = new Date(year, month, day, 21, 59, 0);
        //当天22:00以后自动切换到模拟投注
        if (isRealInvest && currentTime > thirdTime) {
            //AppServices.startMockTask();//结束正式投注，启动模拟投注
            //return Promise.reject("当前时间：" + moment().format('YYYY-MM-DD HH:mm:ss') + "，当天22:00以后，自动启动模拟投注");
        }

        return Promise.resolve(true);
    }

    /**
     *
     * 根据当前选择的投注模式 转换金额
     */
    public convertMoneyFormat(money: number): number {
        let result: number;
        switch (Config.currentSelectedAwardMode) {
            case EnumAwardMode.yuan:
                result = money;
                break;
            case EnumAwardMode.jiao:
                result = Number((money / EnumAwardMode.jiao).toFixed(2));
                break;
            case EnumAwardMode.feng:
                result = Number((money / EnumAwardMode.feng).toFixed(2));
                break;
            case EnumAwardMode.li:
                result = Number((money / EnumAwardMode.li).toFixed(2));
                break;
            default:
                result = money;
                break;
        }

        return result;
    }

    /**
     *
     * 检查最大盈利金额是否达到设定目标
     * @param isRealInvest 是否是真实投注 true:真实投注  false:模拟投注
     */
    private checkMaxWinMoney(isRealInvest: boolean): Promise<any> {
        if (isRealInvest) {//真实投注需要判断盈利和亏损金额设置
            if (Config.currentAccountBalance >= CONFIG_CONST.maxAccountBalance) {
                AppServices.startMockTask();//结束正式投注，启动模拟投注
                return Promise.reject("当前账号余额：" + Config.currentAccountBalance + "，已达到目标金额：" + CONFIG_CONST.maxAccountBalance);
            } else if (Config.currentAccountBalance <= CONFIG_CONST.minAccountBalance) {
                AppServices.startMockTask();//结束正式投注，启动模拟投注
                return Promise.reject("当前账号余额：" + Config.currentAccountBalance + "，已达到亏损警戒金额：" + CONFIG_CONST.minAccountBalance);
            }
        }
        return Promise.resolve(true);
    }

    /**
     *
     * 检查开奖计划的结果是否满足投注条件
     * @param planResults 投注计划结果
     */
    private checkPlanResultHistory(): Promise<boolean> {
        //检查各个计划之前的中奖结果，根据结果过滤
        return LotteryDbService.getPlanResultInfoHistory(CONFIG_CONST.historyCount)
            .then((planResults: Array<PlanResultInfo>) => {
                if (!planResults || planResults.length == 0 || planResults.length < CONFIG_CONST.historyCount) return Promise.reject(RejectionMsg.historyCountIsNotEnough);

                let history01 = planResults[0];
                let history02 = planResults[1];
                let history03 = planResults[2];

                //排除 对错对 这种情况
                //对
                let condition01 = history01.killplan_bai_wei == 1 && history01.killplan_shi_wei == 1 && history01.killplan_ge_wei == 1
                    && history01.jiou_type == 1;
                //错
                let condition02 = history02.killplan_bai_wei == 0 || history02.killplan_shi_wei == 0 || history02.killplan_ge_wei == 0
                    || history02.jiou_type == 0;
                //对
                let condition3 = history03.killplan_bai_wei == 1 && history03.killplan_shi_wei == 1 && history03.killplan_ge_wei == 1
                    && history03.jiou_type == 1;

                if (condition01 && condition02 && condition3) {
                    return Promise.reject("前三期中奖情况为：【中错中】，不满足投注条件，放弃本次投注")
                } else if (condition01) {
                    log.info("最新一期中奖情况：【中】，满足投注条件");
                    return Promise.resolve(true);
                } else {
                    return Promise.reject("最新一期中奖情况，不满足投注条件，放弃本次投注");
                }
            });
    }

    /**
     *
     * 检查已开奖的期数个数
     */
    private checkAwardHistoryCount(historyCount: number): Promise<boolean> {
        return LotteryDbService.getAwardInfoHistory(historyCount)
            .then((awardHistoryList: Array<AwardInfo>) => {
                if (!awardHistoryList || awardHistoryList.length != historyCount) {
                    return Promise.reject("历史开奖总期数个数，不足" + historyCount + "期，不满足投注条件，已放弃本次投注");
                }
                return Promise.resolve(true);
            });
    }

    /**
     *
     *
     * 是否可投注检查
     * @param {Boolean} isRealInvest 是否是真实投注 true:真实投注  false:模拟投注
     */
    public doCheck(isRealInvest: boolean): Promise<boolean> {
        //检查投注时间 在02:00-10:00点之间不允许投注 当天22:00以后自动切换到模拟投注
        return this.checkInvestTime(isRealInvest)
            .then(() => {
                //检查当前的最大盈利金额
                return this.checkMaxWinMoney(isRealInvest);
            })
            .then(() => {
                //检查开奖号码是否满足投注条件
                return this.checkLastPrizeNumberValidation();
            })
            .then(() => {
                //检查数据库中是否存在的已开奖的期数个数
                return this.checkAwardHistoryCount(CONFIG_CONST.historyCount);
            })
            .then(() => {
                //检查开奖计划的结果是否满足投注条件
                //return this.checkPlanResultHistory();
            });
    }

    /**
     *
     *
     * 初始化投注信息
     */
    public initAllPlanInvestInfo(): Array<InvestInfo> {
        let allPlanInvests: Array<InvestInfo> = [];
        let planType: number = 1;
        for (let key in Config.investPlan) {
            let planInfo = Config.investPlan[key];
            let investInfo: InvestInfo = {
                period: Config.globalVariable.current_Peroid,
                planType: planType,
                investNumbers: planInfo.investNumbers,
                currentAccountBalance: planInfo.accountBalance,
                investNumberCount: planInfo.investNumbers.split(',').length,
                awardMode: Config.currentSelectedAwardMode,
                winMoney: 0,
                status: 0,
                isWin: 0,
                investTime: moment().format('YYYY-MM-DD HH:mm:ss')
            };
            planType++;
            allPlanInvests.push(investInfo);
        }
        return allPlanInvests;
    }

    /**
     *
     *
     * 计算上期盈亏
     */
    public calculateWinMoney(): Promise<any> {
        return LotteryDbService.getInvestInfoListByStatus(0)
            .then((resultList: Array<any>) => {
                if (!resultList) Promise.resolve(true);
                let investInfoList: Array<InvestInfo> = [];
                log.info('查询到未开奖数据%s条', resultList.length);
                for (let i = 0; i < resultList.length; i++) {
                    let item = resultList[i];
                    let investInfo: InvestInfo = {
                        period: item.period,
                        planType: item.planType,
                        investNumbers: item.investNumbers,
                        currentAccountBalance: item.currentAccountBalance,
                        investNumberCount: item.investNumberCount,
                        awardMode: item.awardMode,
                        winMoney: item.winMoney,
                        status: item.status,
                        isWin: item.isWin,
                        investTime: item.investTime
                    };
                    //后三开奖号码
                    let prizeNumber = item.openNumber.substring(2);
                    //兑奖 更新开奖状态 更新盈利 更新账户余额
                    this.UpdatePrize(investInfo, prizeNumber);
                    investInfoList.push(investInfo);
                }

                //首先更新之前未开奖的数据
                return LotteryDbService.saveOrUpdateInvestInfoList(investInfoList);
            })
            .then(() => {
                //获取上期各计划投注号码
                return LotteryDbService.getPlanInvestNumbersInfoListByStatus(0);
            })
            .then((list: Array<any>) => {
                //各个计划产生号码结果
                let planInvestNumbersInfoList: Array<PlanInvestNumbersInfo> = [];
                //各个计划开奖结果
                let planResultInfoList: Array<PlanResultInfo> = [];

                for (let i = 0; i < list.length; i++) {
                    let item = list[i];
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
                log.info('已更新未开奖数据%s条', results.length);
                return Promise.resolve(true);
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
        for (let j = 0; j < jiOuTypeArray.length; j++) {
            let item = jiOuTypeArray[j];
            if (prizeNumber == item) {
                planResultInfo.jiou_type = 1;
                break;
            }
        }

        //杀号计划 百位
        let killplanBaiWeiArray = planInvestNumbersInfo.killplan_bai_wei == null ? [] : planInvestNumbersInfo.killplan_bai_wei.split(',');
        for (let j = 0; j < killplanBaiWeiArray.length; j++) {
            let item = killplanBaiWeiArray[j];
            if (prizeNumber == item) {
                planResultInfo.killplan_bai_wei = 1;
                break;
            }
        }

        //杀号计划 十位
        let killplanShiWeiArray = planInvestNumbersInfo.killplan_shi_wei == null ? [] : planInvestNumbersInfo.killplan_shi_wei.split(',');
        for (let j = 0; j < killplanShiWeiArray.length; j++) {
            let item = killplanShiWeiArray[j];
            if (prizeNumber == item) {
                planResultInfo.killplan_shi_wei = 1;
                break;
            }
        }

        //杀号计划 个位
        let killplanGeWeiArray = planInvestNumbersInfo.killplan_ge_wei == null ? [] : planInvestNumbersInfo.killplan_ge_wei.split(',');
        for (let j = 0; j < killplanGeWeiArray.length; j++) {
            let item = killplanGeWeiArray[j];
            if (prizeNumber == item) {
                planResultInfo.killplan_ge_wei = 1;
                break;
            }
        }

        //最大遗漏 百位
        let missplanBaiWeiArray = planInvestNumbersInfo.missplan_bai_wei == null ? [] : planInvestNumbersInfo.missplan_bai_wei.split(',');
        for (let j = 0; j < missplanBaiWeiArray.length; j++) {
            let item = missplanBaiWeiArray[j];
            if (prizeNumber == item) {
                planResultInfo.missplan_bai_wei = 1;
                break;
            }
        }

        //最大遗漏 十位
        let missplanShiWeiArray = planInvestNumbersInfo.missplan_shi_wei == null ? [] : planInvestNumbersInfo.missplan_shi_wei.split(',');
        for (let j = 0; j < missplanShiWeiArray.length; j++) {
            let item = missplanShiWeiArray[j];
            if (prizeNumber == item) {
                planResultInfo.missplan_shi_wei = 1;
                break;
            }
        }

        //最大遗漏 个位
        let missplanGeWeiArray = planInvestNumbersInfo.missplan_ge_wei == null ? [] : planInvestNumbersInfo.missplan_ge_wei.split(',');
        for (let j = 0; j < missplanGeWeiArray.length; j++) {
            let item = missplanGeWeiArray[j];
            if (prizeNumber == item) {
                planResultInfo.missplan_ge_wei = 1;
                break;
            }
        }

        //3-3-4断组
        let brokengroup_01_334Array = planInvestNumbersInfo.brokengroup_01_334 == null ? [] : planInvestNumbersInfo.brokengroup_01_334.split(',');
        for (let j = 0; j < brokengroup_01_334Array.length; j++) {
            let item = brokengroup_01_334Array[j];
            if (prizeNumber == item) {
                planResultInfo.brokengroup_01_334 = 1;
                break;
            }
        }

        //2-2-4断组
        let brokengroup_01_224Array = planInvestNumbersInfo.brokengroup_01_224 == null ? [] : planInvestNumbersInfo.brokengroup_01_224.split(',');
        for (let j = 0; j < brokengroup_01_224Array.length; j++) {
            let item = brokengroup_01_224Array[j];
            if (prizeNumber == item) {
                planResultInfo.brokengroup_01_224 = 1;
                break;
            }
        }

        //3-3-4断组
        let brokengroup_01_125Array = planInvestNumbersInfo.brokengroup_01_125 == null ? [] : planInvestNumbersInfo.brokengroup_01_125.split(',');
        for (let j = 0; j < brokengroup_01_125Array.length; j++) {
            let item = brokengroup_01_125Array[j];
            if (prizeNumber == item) {
                planResultInfo.brokengroup_01_125 = 1;
                break;
            }
        }

        //012路类型
        let road012_01_Array = planInvestNumbersInfo.road012_01 == null ? [] : planInvestNumbersInfo.road012_01.split(',');
        for (let j = 0; j < road012_01_Array.length; j++) {
            let item = road012_01_Array[j];
            if (prizeNumber == item) {
                planResultInfo.road012_01 = 1;
                break;
            }
        }

        //杀跨度
        let number_distance_Array = planInvestNumbersInfo.number_distance == null ? [] : planInvestNumbersInfo.number_distance.split(',');
        for (let j = 0; j < number_distance_Array.length; j++) {
            let item = number_distance_Array[j];
            if (prizeNumber == item) {
                planResultInfo.number_distance = 1;
                break;
            }
        }

        //杀和值
        let sum_values_Array = planInvestNumbersInfo.sum_values == null ? [] : planInvestNumbersInfo.sum_values.split(',');
        for (let j = 0; j < sum_values_Array.length; j++) {
            let item = sum_values_Array[j];
            if (prizeNumber == item) {
                planResultInfo.sum_values = 1;
                break;
            }
        }

        //杀特殊号：三连
        let three_number_together_Array = planInvestNumbersInfo.three_number_together == null ? [] : planInvestNumbersInfo.three_number_together.split(',');
        for (let j = 0; j < three_number_together_Array.length; j++) {
            let item = three_number_together_Array[j];
            if (prizeNumber == item) {
                planResultInfo.three_number_together = 1;
                break;
            }
        }

        //杀百位
        let killbaiwei_01_Array = planInvestNumbersInfo.killbaiwei_01 == null ? [] : planInvestNumbersInfo.killbaiwei_01.split(',');
        for (let j = 0; j < killbaiwei_01_Array.length; j++) {
            let item = killbaiwei_01_Array[j];
            if (prizeNumber == item) {
                planResultInfo.killbaiwei_01 = 1;
                break;
            }
        }

        //杀十位
        let killshiwei_01_Array = planInvestNumbersInfo.killshiwei_01 == null ? [] : planInvestNumbersInfo.killshiwei_01.split(',');
        for (let j = 0; j < killshiwei_01_Array.length; j++) {
            let item = killshiwei_01_Array[j];
            if (prizeNumber == item) {
                planResultInfo.killshiwei_01 = 1;
                break;
            }
        }

        //杀个位
        let killgewei_01_Array = planInvestNumbersInfo.killgewei_01 == null ? [] : planInvestNumbersInfo.killgewei_01.split(',');
        for (let j = 0; j < killgewei_01_Array.length; j++) {
            let item = killgewei_01_Array[j];
            if (prizeNumber == item) {
                planResultInfo.killgewei_01 = 1;
                break;
            }
        }

        //定6胆
        let bravenumber_6_01_Array = planInvestNumbersInfo.bravenumber_6_01 == null ? [] : planInvestNumbersInfo.bravenumber_6_01.split(',');
        for (let j = 0; j < bravenumber_6_01_Array.length; j++) {
            let item = bravenumber_6_01_Array[j];
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

    /**
     *
     *
     * 正式投注成功 更新各个方案的账户余额
     */
    public updateAllPlanAccountBalance(): void {
        let planType: number = 1;

        for (let key in Config.investPlan) {
            //计划投注号码
            let planInvestNumbersArray = (Config.investPlan[key].investNumbers == "") ? [] : Config.investPlan[key].investNumbers.split(',');
            //计划当前投入
            let planInvestMoney = planInvestNumbersArray.length * 2;
            Config.investPlan[key].accountBalance = Number((Config.investPlan[key].accountBalance - ((planInvestMoney / Config.currentSelectedAwardMode) * Number(CONFIG_CONST.touZhuBeiShu))).toFixed(2));

            //更新当前选择的方案余额到全局余额
            if (CONFIG_CONST.currentSelectedInvestPlanType == planType) {
                //更新选择方案的余额 到全局余额
                Config.currentAccountBalance = Config.investPlan[key].accountBalance;
            }
            planType++;
        }
    }
}