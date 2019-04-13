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
        //遗漏修改为杀固定号码
        let killObj = new KillNumberInfo();
        killObj.dropBaiWeiNumberArray = ['8'];
        killObj.dropShiWeiNumberArray = ['4', '6'];
        killObj.dropGeWeiNumberArray = ['9'];
        log.info('杀固定遗漏号码，百位杀%s,十位杀%s,个位杀%s', 8, "4,6", 9);
        return Promise.resolve(killObj);

        //从网络获取杀遗漏号码
        // return Promise.all(
        //     [
        //         analysis360Service.getMaxMissNumber(EnumKillNumberPosition.baiWei),//杀百位遗漏最大的号码
        //         analysis360Service.getMaxMissNumber(EnumKillNumberPosition.shiWei),//杀十位遗漏最大的号码
        //         analysis360Service.getMaxMissNumber(EnumKillNumberPosition.geWei),//杀个位遗漏最大的号码
        //     ])
        //     .then((results) => {
        //         let killObj = new KillNumberInfo();
        //         killObj.dropBaiWeiNumberArray = results[0];
        //         killObj.dropShiWeiNumberArray = results[1];
        //         killObj.dropGeWeiNumberArray = results[2];
        //         return killObj
        //     });
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
