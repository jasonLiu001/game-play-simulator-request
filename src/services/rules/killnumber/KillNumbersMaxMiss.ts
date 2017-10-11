import {IRules} from "../IRules";
import {AbstractRuleBase} from "../AbstractRuleBase";
import {Analysis360Service} from "../../crawler/analysis/Analysis360Service";
import Promise = require('bluebird');
import {EnumKillNumberPosition} from "../../../models/EnumModel";
import _ = require('lodash');
import {KillNumberInfo} from "./KillNumbersFollowPlay";
import {LotteryDbService} from "../../dbservices/DBSerivice";

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
        return this.getMaxMissNumberObject()
            .then((result) => {
                //杀最大遗漏号码 杀号结果
                let restArray = this.getRestKillNumberArray(originNumberArray, result.dropBaiWeiNumberArray, result.dropShiWeiNumberArray, result.dropGeWeiNumberArray);
                return restArray;
            });
    }

}
