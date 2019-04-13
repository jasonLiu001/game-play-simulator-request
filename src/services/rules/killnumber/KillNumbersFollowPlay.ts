import {IRules} from "../IRules";
import {AbstractRuleBase} from "../AbstractRuleBase";
import {Analysis360Service} from "../../crawler/analysis/Analysis360Service";
import Promise = require('bluebird');
import {EnumKillNumberPosition} from "../../../models/EnumModel";
import _ = require('lodash');
import {FixedPositionKillNumberResult} from "../../../models/RuleResult";

let analysis360Service = new Analysis360Service(),
    log4js = require('log4js'),
    log = log4js.getLogger('KillNumbersFollowPlay');

/**
 *
 *
 * 根据计划杀号
 */
export class KillNumbersFollowPlay extends AbstractRuleBase implements IRules<FixedPositionKillNumberResult> {
    filterNumbers(): Promise<FixedPositionKillNumberResult> {
        let originNumberArray = this.getTotalNumberArray();


        //保存杀号结果到数据库
        return this.getKillNumberObject()
            .then((killNumberInfo: KillNumberInfo) => {
                //最终杀号 结果
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

    /**
     *
     *
     * 需要杀掉的号码
     */
    private getKillNumberObject(): Promise<KillNumberInfo> {
        //杀百、十、个位 固定号码
        let killObj = new KillNumberInfo();
        killObj.dropBaiWeiNumberArray = ["9"];
        killObj.dropShiWeiNumberArray = ["9"];
        killObj.dropGeWeiNumberArray = ["0"];
        log.info('杀百十个固定号码，百位杀%s,十位杀%s,个位杀%s', 9, 9, 0);
        return Promise.resolve(killObj);


        //从网络获取百、十、个杀号 号码
        // return Promise.all(
        //     [
        //         analysis360Service.getKillNumber(EnumKillNumberPosition.baiWei),//杀百位
        //         analysis360Service.getKillNumber(EnumKillNumberPosition.shiWei),//杀十位
        //         analysis360Service.getKillNumber(EnumKillNumberPosition.geWei)//杀个位
        //     ])
        //     .then((results) => {
        //         let killObj = new KillNumberInfo();
        //         killObj.dropBaiWeiNumberArray = results[0];
        //         killObj.dropShiWeiNumberArray = results[1];
        //         killObj.dropGeWeiNumberArray = results[2];
        //         return killObj
        //     });
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
