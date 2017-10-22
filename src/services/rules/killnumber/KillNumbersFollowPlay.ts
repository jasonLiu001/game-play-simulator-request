import {IRules} from "../IRules";
import {Config} from "../../../config/Config";
import {AbstractRuleBase} from "../AbstractRuleBase";
import {Analysis360Service} from "../../crawler/analysis/Analysis360Service";
import Promise = require('bluebird');
import {EnumKillNumberPosition} from "../../../models/EnumModel";
import _ = require('lodash');
import {LotteryDbService} from "../../dbservices/DBSerivice";
import {TimeService} from "../../time/TimeService";
import {PlanInfo} from "../../../models/db/PlanInfo";
import {PlanInvestNumbersInfo} from "../../../models/db/PlanInvestNumbersInfo";

let analysis360Service = new Analysis360Service(),
    log4js = require('log4js'),
    log = log4js.getLogger('KillNumbersFollowPlay');

/**
 *
 *
 * 根据计划杀号
 */
export class KillNumbersFollowPlay extends AbstractRuleBase implements IRules {
    public filterNumbers(): Promise<Array<string>> {
        let originNumberArray = this.getTotalNumberArray();

        let killNumberInfo: KillNumberInfo = null;
        //保存杀号结果到数据库
        return this.getKillNumberObject()
            .then((result: KillNumberInfo) => {
                killNumberInfo = result;
                return LotteryDbService.getPlanInfo(TimeService.getCurrentPeriodNumber(new Date()));
            })
            .then((planInfo: PlanInfo) => {
                planInfo.bai_wei = killNumberInfo.dropBaiWeiNumberArray == null ? '' : killNumberInfo.dropBaiWeiNumberArray.join(',');
                planInfo.shi_wei = killNumberInfo.dropShiWeiNumberArray == null ? '' : killNumberInfo.dropShiWeiNumberArray.join(',');
                planInfo.ge_wei = killNumberInfo.dropGeWeiNumberArray == null ? '' : killNumberInfo.dropGeWeiNumberArray.join(',');
                return LotteryDbService.saveOrUpdatePlanInfo(planInfo);
            })
            .then((planInfo: PlanInfo) => {
                return LotteryDbService.getPlanInvestNumberesInfo(planInfo.period);
            })
            .then((planInvestNumbersInfo: PlanInvestNumbersInfo) => {
                planInvestNumbersInfo.bai_wei = this.getRestKillNumberArray(originNumberArray, killNumberInfo.dropBaiWeiNumberArray == null ? [] : killNumberInfo.dropBaiWeiNumberArray).join(',');
                planInvestNumbersInfo.shi_wei = this.getRestKillNumberArray(originNumberArray, killNumberInfo.dropShiWeiNumberArray == null ? [] : killNumberInfo.dropShiWeiNumberArray).join(',');
                planInvestNumbersInfo.ge_wei = this.getRestKillNumberArray(originNumberArray, killNumberInfo.dropGeWeiNumberArray == null ? [] : killNumberInfo.dropGeWeiNumberArray).join(',');
                return LotteryDbService.saveOrUpdatePlanInvestNumbersInfo(planInvestNumbersInfo);
            })
            .then((planInvestNumbersInfo: PlanInvestNumbersInfo) => {
                //最终杀号 结果
                let restArray = this.getRestKillNumberArray(originNumberArray, killNumberInfo.dropBaiWeiNumberArray, killNumberInfo.dropShiWeiNumberArray, killNumberInfo.dropGeWeiNumberArray);
                return restArray;
            });
    }

    /**
     *
     *
     * 需要杀掉的号码
     */
    private getKillNumberObject(): Promise<KillNumberInfo> {
        return Promise.all(
            [
                analysis360Service.getKillNumber(EnumKillNumberPosition.baiWei),//杀百位
                analysis360Service.getKillNumber(EnumKillNumberPosition.shiWei),//杀十位
                analysis360Service.getKillNumber(EnumKillNumberPosition.geWei)//杀个位
            ])
            .then((results) => {
                let killObj = new KillNumberInfo();
                killObj.dropBaiWeiNumberArray = results[0];
                killObj.dropShiWeiNumberArray = results[1];
                killObj.dropGeWeiNumberArray = results[2];
                return killObj
            });
    }

    /**
     *
     *
     *
     * 获取最大遗漏号码
     */
    private getMaxMissNumberObject(config: Config): Promise<KillNumberInfo> {
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
}

/**
 *
 *
 * 杀号对象
 */
export class KillNumberInfo {
    /**
     *
     *
     * 杀百位
     */
    dropBaiWeiNumberArray: Array<string>;

    /**
     *
     *
     * 杀十位
     */
    dropShiWeiNumberArray: Array<string>;

    /**
     *
     *
     * 杀个位
     */
    dropGeWeiNumberArray: Array<string>;
}
