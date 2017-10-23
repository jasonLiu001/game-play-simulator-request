import {JiOuType} from "../rules/JiOuType";
import {Road012Type} from "../rules/Road012Type";
import {KillNumbersFollowPlay} from "../rules/killnumber/KillNumbersFollowPlay";
import {BraveNumbers} from "../rules/BraveNumbers";
import {Config} from "../../config/Config";
import {AbstractRuleBase} from "../rules/AbstractRuleBase";
import Promise = require('bluebird');
import _ = require('lodash');
import {BrokenGroup} from "../rules/BrokenGroup";
import {KillNumbersMaxMiss} from "../rules/killnumber/KillNumbersMaxMiss";
import {KillNumberGeWei} from "../rules/killnumber/KillNumberGeWei";
import {KillNumberLastOpenNumber} from "../rules/killnumber/KillNumberLastOpenNumber";
import {KillNumberLastThreeOpenNumbers} from "../rules/killnumber/KillNumberLastThreeOpenNumbers";
import {LotteryDbService} from "../dbservices/DBSerivice";
import {PlanInfo} from "../../models/db/PlanInfo";
import {TimeService} from "../time/TimeService";
import {PlanTableBase} from "../../models/db/PlanTableBase";
import {PlanResultInfo} from "../../models/db/PlanResultInfo";
import {PlanInfoBase} from "../../models/db/PlanInfoBase";
import {PlanInvestNumbersInfo} from "../../models/db/PlanInvestNumbersInfo";


let log4js = require('log4js'),
    log = log4js.getLogger('NumberService'),
    jiouType = new JiOuType(),
    road012Type = new Road012Type(),
    killNumbersFollowPlay = new KillNumbersFollowPlay(),
    killNumbersMaxMiss = new KillNumbersMaxMiss(),
    braveNumber = new BraveNumbers(),
    killNumberGeWei = new KillNumberGeWei(),
    killNumberLastOpenNumber = new KillNumberLastOpenNumber(),
    killNumberLastThreeOpenNumbers = new KillNumberLastThreeOpenNumbers(),
    brokenGroup = new BrokenGroup();
export class NumberService extends AbstractRuleBase {
    /**
     *
     * 初始化杀号计划相关表
     * @return {PlanInfo}
     */
    private initAllRelatedPlanInfoTables(): Promise<any> {
        //当前期号
        let period = TimeService.getCurrentPeriodNumber(new Date());
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
            road012_01: '',
            status: 0
        };

        planInfoBaseString.status = 1;//计划状态默认是：1
        return LotteryDbService.saveOrUpdatePlanInfo(planInfoBaseString)
            .then(() => {
                planInfoBaseString.status = 0;
                return LotteryDbService.saveOrUpdatePlanInvestNumbersInfo(planInfoBaseString)
            });
    }

    public generateInvestNumber(): Promise<string> {
        let promiseAllResult: any = null;
        //首先初始化计划相关表
        return this.initAllRelatedPlanInfoTables()
            .then(() => {
                return Promise.all(
                    [
                        jiouType.filterNumbers(), //杀特定形态的奇偶
                        killNumbersFollowPlay.filterNumbers(),//根据计划杀号 杀 百位 个位 十位
                        road012Type.filterNumbers(), //杀012路
                        killNumbersMaxMiss.filterNumbers(),//根据最大遗漏值 杀 百位 个位 十位
                        //killNumberGeWei.filterNumbers(),//个位出现连号时 杀个位 这个里面有reject方法
                        //killNumberLastOpenNumber.filterNumbers(),//上期出现什么号码，杀什么号码  这个里面有reject方法
                        //killNumberLastThreeOpenNumbers.filterNumbers(),//上三期出现什么号码，杀每位的上3期号码 这个里面有reject方法
                        brokenGroup.filterNumbers() //断组
                        //braveNumber.filterNumbers() //定胆
                    ]);
            })
            .then((results) => {
                promiseAllResult = results;
                return LotteryDbService.getPlanInfo(TimeService.getCurrentPeriodNumber(new Date()));
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
                return LotteryDbService.saveOrUpdatePlanInfo(planInfo);//保存排除的奇偶类型
            })
            .then((planInfo: PlanInfo) => {
                return LotteryDbService.getPlanInvestNumberesInfo(planInfo.period);
            })
            .then((planInvestNumbersInfo: PlanInvestNumbersInfo) => {
                planInvestNumbersInfo.jiou_type = promiseAllResult[0].killNumberResult;
                planInvestNumbersInfo.killplan_bai_wei = promiseAllResult[1].baiWei.killNumberResult;
                planInvestNumbersInfo.killplan_shi_wei = promiseAllResult[1].shiWei.killNumberResult;
                planInvestNumbersInfo.killplan_ge_wei = promiseAllResult[1].geWei.killNumberResult;
                planInvestNumbersInfo.road012_01 = promiseAllResult[2].killNumberResult;
                planInvestNumbersInfo.missplan_bai_wei = promiseAllResult[3].baiWei.killNumberResult;
                planInvestNumbersInfo.missplan_shi_wei = promiseAllResult[3].shiWei.killNumberResult;
                planInvestNumbersInfo.missplan_ge_wei = promiseAllResult[3].geWei.killNumberResult;
                planInvestNumbersInfo.brokengroup_01_334 = promiseAllResult[4].killNumberResult;
                return LotteryDbService.saveOrUpdatePlanInvestNumbersInfo(planInvestNumbersInfo);
            })
            .then(() => {
                //计划杀号条件：杀特定形态的奇偶  根据计划杀号 杀 百位 个位 十位
                let resultArray = _.intersection(promiseAllResult[0].killNumberResult, promiseAllResult[1].finalResult.killNumberResult);
                return resultArray.join(',');
            });
    }

    /**
     *
     * 检查上期开奖号码是否满足投注条件
     */
    public isLastPrizeNumberValid(): boolean {
        let last_PrizeNumber = Config.globalVariable.last_PrizeNumber;
        //开奖号码信息
        let prizeFirst = Number(last_PrizeNumber.charAt(0));
        let prizeSecond = Number(last_PrizeNumber.charAt(1));
        let prizeThird = Number(last_PrizeNumber.charAt(2));
        let prizeForth = Number(last_PrizeNumber.charAt(3));//5
        let prizeFifth = Number(last_PrizeNumber.charAt(4));

        //上期开奖号码后三奇偶 倒杀
        let baiWeiJiOuType = this.getJiEouType(prizeThird);//百位奇偶类型
        let shiWeiJiOuType = this.getJiEouType(prizeForth);//十位奇偶类型
        let geWeiJiOuType = this.getJiEouType(prizeFifth);//个位奇偶类型
        //上期号码的奇偶类型
        let lastPrizeNumberJiOuType = baiWeiJiOuType + '' + shiWeiJiOuType + '' + geWeiJiOuType;
        if (lastPrizeNumberJiOuType == '001') {//偶偶奇 时投注
            log.info('当前开奖号码【%s】，满足【偶偶奇】', last_PrizeNumber);
            return true;
        }
        log.info('当前开奖号码【%s】，不满足【偶偶奇】，放弃投注', last_PrizeNumber);
        return false;
    }
}