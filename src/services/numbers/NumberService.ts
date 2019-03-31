import {JiOuType} from "../rules/JiOuType";
import {Road012Type} from "../rules/Road012Type";
import {KillNumbersFollowPlay} from "../rules/killnumber/KillNumbersFollowPlay";
import {BraveNumbers} from "../rules/BraveNumbers";
import {Config, CONFIG_CONST} from "../../config/Config";
import {AbstractRuleBase} from "../rules/AbstractRuleBase";
import {BrokenGroup} from "../rules/BrokenGroup";
import {KillNumbersMaxMiss} from "../rules/killnumber/KillNumbersMaxMiss";
import {KillNumberGeWei} from "../rules/killnumber/KillNumberGeWei";
import {PlanInfo} from "../../models/db/PlanInfo";
import {CQSSCTimeServiceV2} from "../time/CQSSCTimeServiceV2";
import {PlanInfoBase} from "../../models/db/PlanInfoBase";
import {PlanInvestNumbersInfo} from "../../models/db/PlanInvestNumbersInfo";
import {BrokenGroup224} from "../rules/BrokenGroup224";
import {BrokenGroup125} from "../rules/BrokenGroup125";
import {OpenNumber} from "../../models/OpenNumber";
import {NumbersDistance} from "../rules/NumbersDistance";
import {SumValues} from "../rules/SumValues";
import {ThreeNumberTogether} from "../rules/ThreeNumberTogether";
import {KillNumberBaiWei} from "../rules/killnumber/KillNumberBaiWei";
import {KillNumberRandom} from "../rules/killnumber/KillNumberRandom";
import {AppSettings} from "../../config/AppSettings";
import {PlanTableService} from "../dbservices/services/PlanTableService";
import Promise = require('bluebird');
import _ = require('lodash');
import {EnumDbTableName} from "../../models/EnumModel";


let log4js = require('log4js'),
    log = log4js.getLogger('NumberService'),
    jiouType = new JiOuType(),
    road012Type = new Road012Type(),
    killNumbersFollowPlay = new KillNumbersFollowPlay(),
    killNumbersMaxMiss = new KillNumbersMaxMiss(),
    braveNumber = new BraveNumbers(),
    killNumberGeWei = new KillNumberGeWei(),
    killNumberBaiWei = new KillNumberBaiWei(),
    brokenGroup = new BrokenGroup(),
    brokenGroup224 = new BrokenGroup224(),
    brokenGroup125 = new BrokenGroup125(),
    numbersDistance = new NumbersDistance(),
    sumValues = new SumValues(),
    threeNumberTogether = new ThreeNumberTogether(),
    killNumberRandom = new KillNumberRandom();

export class NumberService extends AbstractRuleBase {
    /**
     *
     * 初始化杀号计划相关表
     * @return {PlanInfo}
     */
    private initAllRelatedPlanInfoTables(): Promise<any> {
        //当前期号
        let period = CQSSCTimeServiceV2.getCurrentPeriodNumber(new Date());
        let planInfoBaseString: PlanInfoBase<string> = {
            period: period,
            jiou_type: '',
            killplan_bai_wei: '',
            killplan_shi_wei: '',
            killplan_ge_wei: '',
            missplan_bai_wei: '',
            missplan_shi_wei: '',
            missplan_ge_wei: '',
            brokengroup_01_334: '',
            brokengroup_01_224: '',
            brokengroup_01_125: '',
            road012_01: '',
            number_distance: '',
            sum_values: '',
            three_number_together: '',
            killbaiwei_01: '',
            killshiwei_01: '',
            killgewei_01: '',
            bravenumber_6_01: '',
            status: 0
        };

        planInfoBaseString.status = 1;//计划状态默认是：1
        return PlanTableService.saveOrUpdatePlanInfo(planInfoBaseString)
            .then(() => {
                planInfoBaseString.status = 0;
                return PlanTableService.saveOrUpdatePlanInfoByTableName(EnumDbTableName.PLAN_INVEST_NUMBERS, planInfoBaseString);
            });
    }

    generateInvestNumber(): Promise<string> {
        let promiseAllResult: any = null;
        //首先初始化计划相关表
        return this.initAllRelatedPlanInfoTables()
            .then(() => {
                return Promise.all(
                    [
                        jiouType.filterNumbers(), //杀特定形态的奇偶
                        killNumbersFollowPlay.filterNumbers(),//根据计划杀号 杀 百位 个位 十位
                        road012Type.filterNumbers(), //杀012路 这个里面有reject方法
                        killNumbersMaxMiss.filterNumbers(),//根据最大遗漏值 杀 百位 个位 十位
                        brokenGroup.filterNumbers(), //3-3-4断组
                        brokenGroup224.filterNumbers(), //2-2-4断组
                        brokenGroup125.filterNumbers(), //1-2-5断组
                        numbersDistance.filterNumbers(),//杀跨度 这个里面有reject方法
                        sumValues.filterNumbers(),//杀和值
                        threeNumberTogether.filterNumbers(),//杀特殊形态：三连
                        killNumberBaiWei.filterNumbers(),//杀百位 这个方法里面有reject方法
                        killNumberGeWei.filterNumbers(),//杀个位 这个里面有reject方法
                        braveNumber.filterNumbers(), //定胆 这个里面有reject方法
                        killNumberRandom.filterNumbers()//前两期有相同号码，杀3个号码，3个定胆号码 这个里面有reject方法
                    ]);
            })
            .then((results) => {
                promiseAllResult = results;
                return PlanTableService.getPlanInfo(CQSSCTimeServiceV2.getCurrentPeriodNumber(new Date()));
            })
            .then((planInfo: PlanInfo) => {
                planInfo.jiou_type = promiseAllResult[0].killNumber;
                planInfo.killplan_bai_wei = promiseAllResult[1].baiWei.killNumber;
                planInfo.killplan_shi_wei = promiseAllResult[1].shiWei.killNumber;
                planInfo.killplan_ge_wei = promiseAllResult[1].geWei.killNumber;
                planInfo.road012_01 = promiseAllResult[2].killNumber;
                planInfo.missplan_bai_wei = promiseAllResult[3].baiWei.killNumber;
                planInfo.missplan_shi_wei = promiseAllResult[3].shiWei.killNumber;
                planInfo.missplan_ge_wei = promiseAllResult[3].geWei.killNumber;
                planInfo.brokengroup_01_334 = promiseAllResult[4].killNumber;
                planInfo.brokengroup_01_224 = promiseAllResult[5].killNumber;
                planInfo.brokengroup_01_125 = promiseAllResult[6].killNumber;
                planInfo.number_distance = promiseAllResult[7].killNumber;
                planInfo.sum_values = promiseAllResult[8].killNumber;
                planInfo.three_number_together = promiseAllResult[9].killNumber;
                planInfo.killbaiwei_01 = promiseAllResult[10].baiWei.killNumber;
                planInfo.killgewei_01 = promiseAllResult[11].geWei.killNumber;
                planInfo.bravenumber_6_01 = promiseAllResult[12].killNumber;
                return PlanTableService.saveOrUpdatePlanInfo(planInfo);//保存排除的奇偶类型
            })
            .then((planInfo: PlanInfo) => {
                return PlanTableService.getPlanInvestNumberesInfo(planInfo.period);
            })
            .then((planInvestNumbersInfo: PlanInvestNumbersInfo) => {
                planInvestNumbersInfo.jiou_type = promiseAllResult[0].killNumberResult.join(',');
                planInvestNumbersInfo.killplan_bai_wei = promiseAllResult[1].baiWei.killNumberResult.join(',');
                planInvestNumbersInfo.killplan_shi_wei = promiseAllResult[1].shiWei.killNumberResult.join(',');
                planInvestNumbersInfo.killplan_ge_wei = promiseAllResult[1].geWei.killNumberResult.join(',');
                planInvestNumbersInfo.road012_01 = promiseAllResult[2].killNumberResult.join(',');
                planInvestNumbersInfo.missplan_bai_wei = promiseAllResult[3].baiWei.killNumberResult.join(',');
                planInvestNumbersInfo.missplan_shi_wei = promiseAllResult[3].shiWei.killNumberResult.join(',');
                planInvestNumbersInfo.missplan_ge_wei = promiseAllResult[3].geWei.killNumberResult.join(',');
                planInvestNumbersInfo.brokengroup_01_334 = promiseAllResult[4].killNumberResult.join(',');
                planInvestNumbersInfo.brokengroup_01_224 = promiseAllResult[5].killNumberResult.join(',');
                planInvestNumbersInfo.brokengroup_01_125 = promiseAllResult[6].killNumberResult.join(',');
                planInvestNumbersInfo.number_distance = promiseAllResult[7].killNumberResult.join(',');
                planInvestNumbersInfo.sum_values = promiseAllResult[8].killNumberResult.join(',');
                planInvestNumbersInfo.three_number_together = promiseAllResult[9].killNumberResult.join(',');
                planInvestNumbersInfo.killbaiwei_01 = promiseAllResult[10].baiWei.killNumberResult.join(',');
                planInvestNumbersInfo.killgewei_01 = promiseAllResult[11].geWei.killNumberResult.join(',');
                planInvestNumbersInfo.bravenumber_6_01 = promiseAllResult[12].killNumberResult.join(',');
                return PlanTableService.saveOrUpdatePlanInfoByTableName(EnumDbTableName.PLAN_INVEST_NUMBERS, planInvestNumbersInfo);
            })
            .then(() => {
                //真实投注的方案 对应投注号码
                let finallyResult: string = '';
                //方案一：杀特定形态的奇偶  根据计划杀号 杀 百位 个位 十位【这个条件还可以，如果没有其他合适的，可以用，使用该计划需要把对应的判断条件修改为偶偶奇，同时需要修改奇偶的杀号计划，杀上期的奇偶号码】
                let resultArray01: Array<string> = _.intersection(promiseAllResult[0].killNumberResult, promiseAllResult[1].finalResult.killNumberResult);
                Config.investPlan.one.investNumbers = this.isUseReverseInvestNumbers(resultArray01, '方案1');
                //方案二：杀012路  杀遗漏百，十，个 杀和值  杀三连
                let resultArray02: Array<string> = _.intersection(promiseAllResult[2].killNumberResult, promiseAllResult[3].finalResult.killNumberResult, promiseAllResult[8].killNumberResult, promiseAllResult[9].killNumberResult);
                Config.investPlan.two.investNumbers = this.isUseReverseInvestNumbers(resultArray02, '方案2');
                //方案3: 杀012路，杀断组3-3-4，杀断组2-2-4，杀和值，定胆
                let resultArray03: Array<string> = _.intersection(promiseAllResult[2].killNumberResult, promiseAllResult[4].killNumberResult, promiseAllResult[5].killNumberResult, promiseAllResult[8].killNumberResult, promiseAllResult[12].killNumberResult);
                Config.investPlan.three.investNumbers = this.isUseReverseInvestNumbers(resultArray03, '方案3');
                //方案4：只用一个方案
                let resultArray04: Array<string> = promiseAllResult[13].killNumberResult;
                Config.investPlan.four.investNumbers = this.isUseReverseInvestNumbers(resultArray04, '方案4');
                //根据设置的真实投注方案 返回对应的投注号码
                let planType: number = 1;
                for (let key in Config.investPlan) {
                    let investInfo = Config.investPlan[key];
                    if (planType == CONFIG_CONST.currentSelectedInvestPlanType) {
                        finallyResult = investInfo.investNumbers;
                        break;
                    }
                    planType++;
                }
                return finallyResult;
            });
    }

    /**
     *
     * 是否取相反的号码进行投注
     * @param {Array<string>} beforeReverseInvestNumbers 取相反前的投注号码
     * @param {string} planName 方案名称
     * @returns {string} 返回投注号码，逗号分隔
     */
    private isUseReverseInvestNumbers(beforeReverseInvestNumbers: Array<string>, planName: string): string {
        let resultString = "";
        //1000注原始号码
        let totalNumbers = jiouType.getTotalNumberArray();
        if (AppSettings.isUseReverseInvestNumbers) {//取相反的号码
            //从1000注中移除特定号码，得到相反的号码
            let diffArray: Array<string> = _.difference(totalNumbers, beforeReverseInvestNumbers);
            resultString = diffArray.join(',');
            log.info('%s 生成正常反向投注号码', planName);
        } else {//正常号码
            resultString = beforeReverseInvestNumbers.join(',');
            log.info('%s 生成正常正向投注号码', planName);
        }
        return resultString;
    }

    /**
     *
     * 检查上期开奖号码是否满足投注条件
     */
    isLastPrizeNumberValid(): Promise<boolean> {
        //region 偶偶奇过滤条件[已废弃]
        //开奖号码
        let prizeNumber: OpenNumber = this.getPrizeNumberObj();

        //上期开奖号码后三奇偶 倒杀
        let baiWeiJiOuType = this.getJiEouType(prizeNumber.bai);//百位奇偶类型
        let shiWeiJiOuType = this.getJiEouType(prizeNumber.shi);//十位奇偶类型
        let geWeiJiOuType = this.getJiEouType(prizeNumber.ge);//个位奇偶类型
        //上期号码的奇偶类型
        let lastPrizeNumberJiOuType = baiWeiJiOuType + '' + shiWeiJiOuType + '' + geWeiJiOuType;
        if (lastPrizeNumberJiOuType == '001') {//偶偶奇 时投注
            log.info('当前开奖号码【%s】，满足【偶偶奇】', prizeNumber.prizeString);
            return Promise.resolve(true);
        }
        log.info('当前开奖号码【%s】，不满足【偶偶奇】，放弃投注', prizeNumber.prizeString);
        return Promise.resolve(false);
        //endregion

        ////region 达到指定期号才执行投注[条件2]--已废弃
        //可以投注的期号
        //let periodNumberArray: Array<string> = ['005', '010', '015', '020', '025', '030', '035', '040', '045', '050', '055', '060', '065', '070', '075', '080', '085', '090', '095', '100', '105', '110', '115', '120'];
        //let currentPeriodNumberPart: string = this.getPeriodPartString(Config.globalVariable.current_Peroid, 1);
        //let result = periodNumberArray.indexOf(currentPeriodNumberPart) > -1;
        //return Promise.resolve(result);
        //// endregion

        // //region 前两期有相同号码才开始投注[条件3]--已废弃
        // return LotteryDbService.getAwardInfoHistory(CONFIG_CONST.historyCount)
        //     .then((awardHistoryList: Array<AwardInfo>) => {
        //         if (!awardHistoryList || awardHistoryList.length != CONFIG_CONST.historyCount) return Promise.reject("杀跨提示：" + RejectionMsg.historyCountIsNotEnough);
        //
        //
        //         //倒数第二期 开奖号码
        //         let last_02 = awardHistoryList[1].openNumber;
        //         let last_bai = Number(last_02.substr(2, 1));
        //         let last_shi = Number(last_02.substr(3, 1));
        //         let last_ge = Number(last_02.substr(4, 1));
        //
        //         //开奖号码
        //         let prizeNumber: OpenNumber = this.getPrizeNumberObj();
        //         let bai = prizeNumber.bai;
        //         let shi = prizeNumber.shi;
        //         let ge = prizeNumber.ge;
        //         let killNumberInfo: KillNumberInfo = new KillNumberInfo();
        //
        //         //上上期百位==上期十位
        //         if (last_bai == shi) {
        //             //本期杀十位 号码取上期百位
        //             return Promise.resolve(true);
        //         } else if (last_bai == ge) {
        //             return Promise.resolve(true);
        //         } else if (last_shi == bai) {
        //             return Promise.resolve(true);
        //         } else if (last_shi == ge) {
        //             return Promise.resolve(true);
        //         } else if (last_ge == bai) {
        //             return Promise.resolve(true);
        //         } else if (last_ge == shi) {
        //             return Promise.resolve(true);
        //         }
        //         return Promise.resolve(false);
        //     });
        // //region

        // return Promise.resolve(true);
    }
}
