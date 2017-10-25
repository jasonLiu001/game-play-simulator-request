import {IRules} from "../IRules";
import {AbstractRuleBase} from "../AbstractRuleBase";
import {Analysis360Service} from "../../crawler/analysis/Analysis360Service";
import Promise = require('bluebird');
import {EnumKillNumberPosition} from "../../../models/EnumModel";
import _ = require('lodash');
import {KillNumberInfo} from "./KillNumbersFollowPlay";
import {FixedPositionKillNumberResult} from "../../../models/RuleResult";

let analysis360Service = new Analysis360Service(),
    log4js = require('log4js'),
    log = log4js.getLogger('KillNumbersMaxMiss');

/**
 *
 *
 * 根据最大遗漏杀号
 */
export class KillNumbersMaxMiss extends AbstractRuleBase implements IRules<FixedPositionKillNumberResult> {

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


    filterNumbers(): Promise<FixedPositionKillNumberResult> {
        let originNumberArray = this.getTotalNumberArray();
        //保存杀号结果
        return this.getMaxMissNumberObject()
            .then((killNumberInfo: KillNumberInfo) => {
                //杀最大遗漏号码 杀号结果
                let restArray = this.getRestKillNumberArray(originNumberArray, killNumberInfo.dropBaiWeiNumberArray, killNumberInfo.dropShiWeiNumberArray, killNumberInfo.dropGeWeiNumberArray);

                let fixedPositionKillNumberResult: FixedPositionKillNumberResult = {
                    baiWei: {
                        killNumber: killNumberInfo.dropBaiWeiNumberArray.join(','),
                        killNumberResult: this.getRestKillNumberArray(originNumberArray, killNumberInfo.dropBaiWeiNumberArray, null, null)
                    },
                    shiWei: {
                        killNumber: killNumberInfo.dropShiWeiNumberArray.join(','),
                        killNumberResult: this.getRestKillNumberArray(originNumberArray, null, killNumberInfo.dropShiWeiNumberArray, null)
                    },
                    geWei: {
                        killNumber: killNumberInfo.dropGeWeiNumberArray.join(','),
                        killNumberResult: this.getRestKillNumberArray(originNumberArray, null, null, killNumberInfo.dropGeWeiNumberArray)
                    },
                    finalResult: {
                        killNumber: _.union(killNumberInfo.dropBaiWeiNumberArray, killNumberInfo.dropShiWeiNumberArray, killNumberInfo.dropGeWeiNumberArray).join(','),
                        killNumberResult: restArray
                    }
                };
                return fixedPositionKillNumberResult;
            });

    }

}
