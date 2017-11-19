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
import {LotteryDbService} from "../dbservices/DBSerivice";
import {PlanInfo} from "../../models/db/PlanInfo";
import {TimeService} from "../time/TimeService";
import {PlanTableBase} from "../../models/db/PlanTableBase";
import {PlanResultInfo} from "../../models/db/PlanResultInfo";
import {PlanInfoBase} from "../../models/db/PlanInfoBase";
import {PlanInvestNumbersInfo} from "../../models/db/PlanInvestNumbersInfo";
import {BrokenGroup224} from "../rules/BrokenGroup224";
import {BrokenGroup125} from "../rules/BrokenGroup125";
import {OpenNumber} from "../../models/OpenNumber";
import {NumbersDistance} from "../rules/NumbersDistance";
import {SumValues} from "../rules/SumValues";
import {ThreeNumberTogether} from "../rules/ThreeNumberTogether";
import {KillNumberBaiWei} from "../rules/killnumber/KillNumberBaiWei";


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
    threeNumberTogether = new ThreeNumberTogether();
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
            brokengroup_01_224: '',
            brokengroup_01_125: '',
            road012_01: '',
            number_distance: '',
            sum_values: '',
            three_number_together: '',
            killbaiwei_01: '',
            killshiwei_01: '',
            killgewei_01: '',
            status: 0
        };

        planInfoBaseString.status = 1;//计划状态默认是：1
        return LotteryDbService.saveOrUpdatePlanInfo(planInfoBaseString)
            .then(() => {
                planInfoBaseString.status = 0;
                return LotteryDbService.saveOrUpdatePlanInvestNumbersInfo(planInfoBaseString);
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
                        brokenGroup.filterNumbers(), //3-3-4断组
                        brokenGroup224.filterNumbers(), //2-2-4断组
                        brokenGroup125.filterNumbers(), //1-2-5断组
                        numbersDistance.filterNumbers(),//杀跨度 这个里面有reject方法
                        sumValues.filterNumbers(),//杀和值
                        threeNumberTogether.filterNumbers(),//杀特殊形态：三连
                        killNumberBaiWei.filterNumbers(),//杀百位 这个方法里面有reject方法
                        killNumberGeWei.filterNumbers()//杀个位 这个里面有reject方法
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
                planInfo.brokengroup_01_224 = promiseAllResult[5].killNumber;
                planInfo.brokengroup_01_125 = promiseAllResult[6].killNumber;
                planInfo.number_distance = promiseAllResult[7].killNumber;
                planInfo.sum_values = promiseAllResult[8].killNumber;
                planInfo.three_number_together = promiseAllResult[9].killNumber;
                planInfo.killbaiwei_01 = promiseAllResult[10].baiWei.killNumber;
                planInfo.killgewei_01 = promiseAllResult[11].geWei.killNumber;
                return LotteryDbService.saveOrUpdatePlanInfo(planInfo);//保存排除的奇偶类型
            })
            .then((planInfo: PlanInfo) => {
                return LotteryDbService.getPlanInvestNumberesInfo(planInfo.period);
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
                return LotteryDbService.saveOrUpdatePlanInvestNumbersInfo(planInvestNumbersInfo);
            })
            .then(() => {
                //计划杀号条件：杀特定形态的奇偶  根据计划杀号 杀 百位 个位 十位【这个条件还可以，如果没有其他合适的，可以用，使用该计划需要把对应的判断条件修改为偶偶奇，同时需要修改奇偶的杀号计划，杀上期的奇偶号码】
                let resultArray01: Array<string> = _.intersection(promiseAllResult[0].killNumberResult, promiseAllResult[1].finalResult.killNumberResult);
                //【不可取】计划杀号条件：根据计划杀百、十、个，百、十、个的最大遗漏号码，杀奇偶，杀断组125
                //let resultArray02: Array<string> = _.intersection(promiseAllResult[1].finalResult.killNumberResult, promiseAllResult[3].finalResult.killNumberResult, promiseAllResult[0].killNumberResult, promiseAllResult[6].killNumberResult);
                //取反
                //let leftArray = this.getAvailableNumbers(this.getTotalNumberArray(), resultArray02);
                return resultArray01.join(',');
            });
    }

    /**
     *
     * 检查上期开奖号码是否满足投注条件
     */
    public isLastPrizeNumberValid(): boolean {
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
            return true;
        }
        log.info('当前开奖号码【%s】，不满足【偶偶奇】，放弃投注', prizeNumber.prizeString);
        return false;
    }
}