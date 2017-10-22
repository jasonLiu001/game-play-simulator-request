import {IRules} from "../IRules";
import {AbstractRuleBase} from "../AbstractRuleBase";
import {Analysis360Service} from "../../crawler/analysis/Analysis360Service";
import Promise = require('bluebird');
import {EnumKillNumberPosition} from "../../../models/EnumModel";
import _ = require('lodash');
import {KillNumberInfo} from "./KillNumbersFollowPlay";
import {PlanInvestNumbersInfo} from "../../../models/db/PlanInvestNumbersInfo";
import {LotteryDbService} from "../../dbservices/DBSerivice";
import {TimeService} from "../../time/TimeService";
import {PlanInfo} from "../../../models/db/PlanInfo";

let analysis360Service = new Analysis360Service(),
    log4js = require('log4js'),
    log = log4js.getLogger('KillNumbersMaxMiss');

/**
 *
 *
 * 根据最大遗漏杀号
 */
export class KillNumbersMaxMiss extends AbstractRuleBase implements IRules {

    /**
     *
     *
     *
     * 获取最大遗漏号码
     */
    private getMaxMissNumberObject(): Promise<KillNumberInfo> {
        return Promise.all(
            [
                analysis360Service.getMaxMissNumber(EnumKillNumberPosition.baiWei),//杀百位遗漏最大的号码
                analysis360Service.getMaxMissNumber(EnumKillNumberPosition.shiWei),//杀十位遗漏最大的号码
                analysis360Service.getMaxMissNumber(EnumKillNumberPosition.geWei),//杀个位遗漏最大的号码
            ])
            .then((results) => {
                let killObj = new KillNumberInfo();
                killObj.dropBaiWeiNumberArray = results[0];
                killObj.dropShiWeiNumberArray = results[1];
                killObj.dropGeWeiNumberArray = results[2];
                return killObj
            });
    }


    filterNumbers(): Promise<Array<string>> {
        let originNumberArray = this.getTotalNumberArray();
        let killNumberInfo: KillNumberInfo = null;
        //保存杀号结果
        return this.getMaxMissNumberObject()
            .then((result: KillNumberInfo) => {
                killNumberInfo = result;
                return LotteryDbService.getPlanInfo(TimeService.getCurrentPeriodNumber(new Date()));
            })
            .then((planInfo: PlanInfo) => {
                planInfo.missplan_bai_wei = killNumberInfo.dropBaiWeiNumberArray == null ? '' : killNumberInfo.dropBaiWeiNumberArray.join(',');
                planInfo.missplan_shi_wei = killNumberInfo.dropShiWeiNumberArray == null ? '' : killNumberInfo.dropShiWeiNumberArray.join(',');
                planInfo.missplan_ge_wei = killNumberInfo.dropGeWeiNumberArray == null ? '' : killNumberInfo.dropGeWeiNumberArray.join(',');
                return LotteryDbService.saveOrUpdatePlanInfo(planInfo);
            })
            .then((planInfo: PlanInfo) => {
                return LotteryDbService.getPlanInvestNumberesInfo(planInfo.period);
            })
            .then((planInvestNumbersInfo: PlanInvestNumbersInfo) => {
                planInvestNumbersInfo.missplan_bai_wei = this.getRestKillNumberArray(originNumberArray, killNumberInfo.dropBaiWeiNumberArray == null ? [] : killNumberInfo.dropBaiWeiNumberArray, null, null).join(',');
                planInvestNumbersInfo.missplan_shi_wei = this.getRestKillNumberArray(originNumberArray, null, killNumberInfo.dropShiWeiNumberArray == null ? [] : killNumberInfo.dropShiWeiNumberArray, null).join(',');
                planInvestNumbersInfo.missplan_ge_wei = this.getRestKillNumberArray(originNumberArray, null, null, killNumberInfo.dropGeWeiNumberArray == null ? [] : killNumberInfo.dropGeWeiNumberArray).join(',');
                return LotteryDbService.saveOrUpdatePlanInvestNumbersInfo(planInvestNumbersInfo);
            })
            .then((planInvestNumbersInfo: PlanInvestNumbersInfo) => {
                //杀最大遗漏号码 杀号结果
                let restArray = this.getRestKillNumberArray(originNumberArray, killNumberInfo.dropBaiWeiNumberArray, killNumberInfo.dropShiWeiNumberArray, killNumberInfo.dropGeWeiNumberArray);
                return restArray;
            });
    }

}
